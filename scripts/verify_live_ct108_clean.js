// Verifies the REAL OpManager Central server renders a clean dashboard with
// NO seeded/demo device names (DXB-CORE-SW-01, NY-DB-PROD-SQL,
// LON-MAIL-EXCH-01). Fresh-store expectation: 0 devices, 0 probes — the
// dashboard must not invent demo hardware.
//
// Usage:
//   OPM_BASE_URL=http://localhost:8060 CHROME_BIN=google-chrome \
//     node scripts/verify_live_ct108_clean.js
//
// The console route requires a logged-in session: unauthenticated requests
// are redirected to /login.html. Headless Chrome starts with a fresh profile
// by default, so if the dashboard shell never loads this script FAILS with a
// clear message instead of passing vacuously. To run authenticated, point
// CHROME_USER_DATA_DIR at a Chrome profile that already holds a session, or
// use the live harness under ~/workspace/opm-check/real-data/verify/.
// No credentials are hardcoded or read here.
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = 9648;
const baseUrl = (process.env.OPM_BASE_URL || 'http://localhost:8060').replace(/\/$/, '');
const chromeBin = process.env.CHROME_BIN || 'google-chrome';
const artifactDir = process.env.OPM_ARTIFACT_DIR || path.join(__dirname, '..', 'artifacts', 'verify-live-clean');
fs.mkdirSync(artifactDir, { recursive: true });
const userDataDir = process.env.CHROME_USER_DATA_DIR || `/tmp/chrome-test-${Date.now()}`;
const targetUrl = `${baseUrl}/apiclient/fluidicv3/itom/index.html#/dashboard`;

async function main() {
  console.log('1. Launching isolated Chrome instance on port', port);
  const chrome = spawn(chromeBin, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
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
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

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

  console.log('2. Navigating to real-server Dashboard with cache disabled:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 4500));

  // Honesty gate: the console route redirects unauthenticated browsers to
  // /login.html. If the suite shell never mounted, the "no mock names"
  // checks below would pass vacuously — fail instead.
  const loaded = await evaluate(`(() => ({
    onLoginPage: window.location.pathname.includes('login'),
    suiteMounted: !!document.getElementById('opm-custom-suite-container')
  }))()`);
  console.log('Dashboard load gate:', JSON.stringify(loaded));
  if (!loaded || loaded.onLoginPage || !loaded.suiteMounted) {
    console.error('FAIL: dashboard shell did not load — likely unauthenticated (redirected to login).');
    console.error('Run with CHROME_USER_DATA_DIR pointing at a profile with a live console session,');
    console.error('or use the live harness under ~/workspace/opm-check/real-data/verify/.');
    ws.close();
    chrome.kill();
    process.exit(1);
  }

  console.log('3. Inspecting UI elements:');
  const inspectReport = await evaluate(`(() => {
    const subnav = document.getElementById('opm-header-subnav-bar');
    const customLauncher = document.getElementById('opm-app-launcher-btn');
    const topZia = document.getElementById('opm-header-zia-btn');
    const bgpBtn = document.getElementById('opm-dash-bgp-btn');
    const sdwanBtn = document.getElementById('opm-dash-sdwan-btn');
    const dpiBtn = document.getElementById('opm-dash-dpi-btn');
    const ndrBtn = document.getElementById('opm-dash-ndr-btn');
    const bodyText = document.body.innerText;

    return {
      subnavBarExists: !!subnav,
      subnavBarVisible: subnav ? window.getComputedStyle(subnav).display !== 'none' : false,
      customLauncherVisible: customLauncher ? window.getComputedStyle(customLauncher).display !== 'none' : false,
      topZiaVisible: topZia ? window.getComputedStyle(topZia).display !== 'none' : false,
      bgpBtnVisible: bgpBtn ? window.getComputedStyle(bgpBtn).display !== 'none' : false,
      sdwanBtnVisible: sdwanBtn ? window.getComputedStyle(sdwanBtn).display !== 'none' : false,
      dpiBtnVisible: dpiBtn ? window.getComputedStyle(dpiBtn).display !== 'none' : false,
      ndrBtnVisible: ndrBtn ? window.getComputedStyle(ndrBtn).display !== 'none' : false,
      // Any of these true means seeded/demo device names leaked into the UI.
      containsMockDxb: bodyText.includes('DXB-CORE-SW-01'),
      containsMockNy: bodyText.includes('NY-DB-PROD-SQL'),
      containsMockLon: bodyText.includes('LON-MAIL-EXCH-01')
    };
  })()`);

  console.log('UI Verification Report:\n', JSON.stringify(inspectReport, null, 2));

  await captureScreenshot('screenshot_clean_dashboard.png');

  console.log('4. Navigating to Inventory:');
  await evaluate(`window.location.hash = '#/inventory'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_clean_inventory.png');

  console.log('5. Navigating to Alarms:');
  await evaluate(`window.location.hash = '#/alarms'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_clean_alarms.png');

  console.log('6. Navigating to Configuration:');
  await evaluate(`window.location.hash = '#/configuration'`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('screenshot_clean_configuration.png');

  ws.close();
  chrome.kill();

  const mockLeaked = inspectReport.containsMockDxb || inspectReport.containsMockNy || inspectReport.containsMockLon;
  if (mockLeaked) {
    console.error('FAIL: seeded/demo device names present in the UI — the server is not clean.');
    process.exit(1);
  }
  console.log('7. Verification complete: no seeded/demo device names found.');
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
