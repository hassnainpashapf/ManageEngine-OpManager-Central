const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9660;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/chrome-test-badges-${Date.now()}`;
const targetUrl = 'http://192.168.30.65:8060/apiclient/fluidicv3/itom/index.html#/dashboard';

async function main() {
  console.log('1. Launching Headless Chrome to test Header Badges & Agent Distribution on CT 108...');
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
    throw new Error('Chrome page target not found!');
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
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const fullPath = path.join(artifactDir, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`Saved screenshot: ${fullPath} (${buffer.length} bytes)`);
  }

  await send('Page.enable');
  await send('Runtime.enable');

  console.log(`2. Navigating to ${targetUrl}...`);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Header Badges (BGP-4, SD-WAN, DPI, NDR)
  const badgesCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bgp = document.getElementById('opm-dash-bgp-btn');
      const sdwan = document.getElementById('opm-dash-sdwan-btn');
      const dpi = document.getElementById('opm-dash-dpi-btn');
      const ndr = document.getElementById('opm-dash-ndr-btn');
      const refresh = document.getElementById('opm-refresh-countdown-span');
      return {
        bgp: !!bgp,
        sdwan: !!sdwan,
        dpi: !!dpi,
        ndr: !!ndr,
        refreshText: refresh ? refresh.innerText : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Header Badges evaluation:', badgesCheck.result.value);
  await takeScreenshot('verified_dashboard_header_badges.png');

  // 2. Click BGP-4 button
  console.log('3. Clicking BGP-4 button...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('opm-dash-bgp-btn').click()`
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('verified_bgp_modal_opened.png');

  // Close BGP modal
  await send('Runtime.evaluate', {
    expression: `(() => { const m = document.getElementById('opm-bgp-modal'); if (m) m.style.display = 'none'; })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Click SD-WAN button
  console.log('4. Clicking SD-WAN button...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('opm-dash-sdwan-btn').click()`
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('verified_sdwan_modal_opened.png');

  // Close SD-WAN modal
  await send('Runtime.evaluate', {
    expression: `(() => { const m = document.getElementById('opm-sdwan-modal'); if (m) m.style.display = 'none'; })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Navigate to Settings -> Monitoring Agents
  console.log('5. Navigating to Settings -> Monitoring Agents (#/settings/agents)...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/settings/agents'; handleRoute();`
  });
  await new Promise(r => setTimeout(r, 1500));
  await takeScreenshot('verified_settings_agent_downloads.png');

  // 5. Navigate to Configuration (NCM)
  console.log('6. Navigating to Configuration (#/configuration)...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/configuration'; handleRoute();`
  });
  await new Promise(r => setTimeout(r, 1500));
  await takeScreenshot('verified_ncm_live_dashboard.png');

  ws.close();
  chrome.kill();
  console.log('Verification finished successfully!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
