const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9670;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/c-stepped-${Date.now()}`;
const targetUrl = 'http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings';

async function main() {
  console.log('1. Launching Chrome directly loading #/settings on port', port);
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-background-networking',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1600,1000',
    targetUrl
  ]);

  let targets = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => {
            try { resolve(JSON.parse(d)); } catch(e) { reject(e); }
          });
        });
        req.on('error', reject);
      });
      if (targets && targets.some(t => t.type === 'page')) break;
    } catch(e) {}
  }

  const pageTarget = targets ? targets.find(t => t.type === 'page') : null;
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Chrome page target not found! Targets: ' + JSON.stringify(targets));
  }
  console.log('Page target found:', pageTarget.title, pageTarget.url);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  const consoleLogs = [];
  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => typeof a.value === 'object' ? JSON.stringify(a.value) : (a.value || a.description || '')).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
        if (text.includes('HeartbeatCheck') || text.includes('No pong')) {
          console.warn('[CONSOLE WARN DETECTED]:', text);
        }
      }
    } catch(e) {}
  });

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const timer = setTimeout(() => {
      ws.removeListener('message', handler);
      reject(new Error(`Timeout for ${method} (id=${curId})`));
    }, 6000);
    const handler = (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.id === curId) {
          clearTimeout(timer);
          ws.removeListener('message', handler);
          resolve(data.result);
        }
      } catch(e) {}
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('2. Monitoring Settings view and Heartbeat state over 14 seconds...');
  let evalState = null;

  for (let sec = 2; sec <= 14; sec += 3) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const c = document.getElementById('opm-custom-suite-container');
          const suite = window.OpManagerSuite;
          return {
            sec: ${sec},
            hash: window.location.hash,
            title: document.title,
            currentTab: suite ? suite.state.currentTab : null,
            cLen: c ? c.innerText.length : 0,
            hasSettingsProbes: c ? c.innerText.includes('Central & Probes') : false,
            hasConfigCompliance: c ? c.innerText.includes('Startup-Running Conflict Diff') : false,
            subtabsCount: document.querySelectorAll('.opm-set-subtab-btn').length
          };
        })()`,
        returnByValue: true
      });
      evalState = res.result ? res.result.value : res.value;
      console.log(`[t=${sec}s] Hash: ${evalState.hash} | Tab: ${evalState.currentTab} | Title: "${evalState.title}" | Subtabs: ${evalState.subtabsCount} | SettingsView: ${evalState.hasSettingsProbes} | NCMView: ${evalState.hasConfigCompliance}`);
    } catch(err) {
      console.log(`[t=${sec}s] Evaluate result:`, err.message);
    }
  }

  // Capture screenshot of verified Settings view
  console.log('\n3. Capturing verified Settings screenshot...');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(artifactDir, 'screenshot_settings_verified_view.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  // Check heartbeat warnings
  const hbWarnings = consoleLogs.filter(l => l.text.includes('HeartbeatCheck') || l.text.includes('No pong'));
  console.log('\n=== WEBSOCKET HEARTBEAT DIAGNOSTIC ===');
  console.log(' - Total console logs:', consoleLogs.length);
  console.log(' - Heartbeat warnings count:', hbWarnings.length);
  if (hbWarnings.length > 0) {
    console.error('FAIL: Found HeartbeatCheck warnings:', hbWarnings);
  } else {
    console.log('PASS: Exactly 0 HeartbeatCheck warnings over 14+ seconds!');
  }

  ws.close();
  chrome.kill();

  const success = evalState && evalState.currentTab === 'settings' && evalState.hasSettingsProbes && !evalState.hasConfigCompliance && hbWarnings.length === 0;
  if (success) {
    console.log('\n=== ALL VERIFICATION CHECKS PASSED PERFECTLY! ===');
  } else {
    throw new Error('Test did not satisfy all criteria.');
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
