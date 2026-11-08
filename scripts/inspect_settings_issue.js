const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const { spawn } = require('child_process');

async function main() {
  const port = 9570;
  console.log('Launching Chrome...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((res, rej) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => {
            try { res(JSON.parse(d)); } catch (e) { rej(e); }
          });
        });
        req.on('error', rej);
      });
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || !targets[0]) {
    console.error('Failed to connect to Chrome debugging endpoint');
    chrome.kill();
    return;
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === curId) {
        ws.off('message', handler);
        res(data.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const consoleMessages = [];
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        consoleMessages.push({ type, text });
      }
    } catch (e) {}
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to #/settings ...');
  await send('Page.navigate', { url: 'http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings' });

  await new Promise(r => setTimeout(r, 3000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const suite = window.OpManagerSuite;
      const c = document.getElementById('opm-custom-suite-container');
      const text = c ? c.innerText : '';
      return {
        hash: window.location.hash,
        title: document.title,
        suiteStateTab: suite ? suite.state.currentTab : null,
        containerExists: !!c,
        containerLen: text.length,
        hasSettingsHeader: text.includes('Enterprise Admin Console') || text.includes('Central & Probes'),
        hasConfigCompliance: text.includes('Compliance') || text.includes('NCM Module') || text.includes('Hardware End of Life'),
        first200Chars: text.slice(0, 200),
        activeHeaderNavText: (() => {
          const act = document.querySelectorAll('#main-header .active, #main-header .active-menu');
          return Array.from(act).map(a => a.innerText.trim());
        })()
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));

  console.log('\nCaptured Console Messages:');
  consoleMessages.forEach(m => {
    if (m.type === 'warning' || m.type === 'error' || m.text.includes('HeartbeatCheck') || m.text.includes('No pong')) {
      console.log(`[${m.type.toUpperCase()}] ${m.text}`);
    }
  });

  ws.close();
  chrome.kill();
}

main().catch(console.error);
