const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const { spawn } = require('child_process');

async function main() {
  const port = 9575;
  console.log('Launching fresh Chrome session...');
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

  const allLogs = [];
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = data.params.args.map(a => typeof a.value === 'object' ? JSON.stringify(a.value) : (a.value || a.description || '')).join(' ');
        allLogs.push({ time: Date.now(), type, text });
        console.log(`[${type.toUpperCase()}] ${text}`);
      }
    } catch (e) {}
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings ...');
  await send('Page.navigate', { url: 'http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings' });

  console.log('Waiting 22 seconds to observe heartbeat check...');
  for (let s = 1; s <= 22; s++) {
    await new Promise(r => setTimeout(r, 1000));
    if (s % 5 === 0) console.log(`... elapsed ${s}s`);
  }

  const evalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const wsService = window.require ? window.require('itom/services/web-socket')?.default : null;
      const c = document.getElementById('opm-custom-suite-container');
      return {
        hash: window.location.hash,
        title: document.title,
        activeTab: window.OpManagerSuite ? window.OpManagerSuite.state.currentTab : null,
        containerHeading: c ? c.querySelector('h2, .opm-tab-header, button.opm-set-subtab-btn')?.innerText : null,
        innerSnippet: c ? c.innerText.slice(0, 300) : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Final State:', JSON.stringify(evalState.result.value, null, 2));

  const heartbeatWarnings = allLogs.filter(l => l.text.includes('HeartbeatCheck') || l.text.includes('No pong'));
  console.log(`Heartbeat warnings count: ${heartbeatWarnings.length}`);

  ws.close();
  chrome.kill();
}

main().catch(console.error);
