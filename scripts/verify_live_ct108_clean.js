const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9642;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/chrome-test-${Date.now()}`;
const targetUrl = 'http://192.168.30.65:8060/apiclient/fluidicv3/itom/index.html#/dashboard';

async function main() {
  console.log('1. Launching isolated Chrome instance on port', port);
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1600,1000'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
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
      if (targets && targets.length > 0) break;
    } catch(e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Chrome page target not found! Targets: ' + JSON.stringify(targets));
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.on('open', resolve));

  let msgId = 1;
  const pendingRequests = new Map();

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
      }
    } catch(e) {}
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res && res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    console.log(`  ✓ Saved screenshot: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log('2. Navigating to CT 108 Dashboard:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 4000));

  console.log('3. Inspecting Header Elements on CT 108:');
  const headerInfo = await evaluate(`(() => {
    const hdr = document.getElementById('main-header');
    if (!hdr) return { error: 'No #main-header' };
    const launchers = hdr.querySelectorAll('#opm-app-launcher-btn, #opm-app-launcher-trigger');
    const bellBadge = hdr.querySelector('.opm-bell-badge');
    const probeLabel = hdr.querySelector('.zselectbox__selected');
    const tabs = Array.from(hdr.querySelectorAll('.opm-main-nav-tab')).map(t => t.innerText.trim());
    return {
      launcherCount: launchers.length,
      launcherTitle: launchers[0] ? (launchers[0].getAttribute('title') || '') : '',
      bellBadgeDisplay: bellBadge ? window.getComputedStyle(bellBadge).display : 'none',
      probeName: probeLabel ? probeLabel.innerText.trim() : '',
      tabs: tabs
    };
  })()`);
  console.log('Header Info:', JSON.stringify(headerInfo, null, 2));

  await captureScreenshot('screenshot_ct108_clean_dashboard.png');

  console.log('4. Navigating to Inventory:');
  await evaluate(`window.location.hash = '#/inventory'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_ct108_clean_inventory.png');

  console.log('5. Navigating to Alarms:');
  await evaluate(`window.location.hash = '#/alarms'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_ct108_clean_alarms.png');

  console.log('6. Navigating to Configuration:');
  await evaluate(`window.location.hash = '#/configuration'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_ct108_clean_configuration.png');

  ws.close();
  chrome.kill();
  console.log('7. All CT 108 Verifications Finished Successfully!');
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
