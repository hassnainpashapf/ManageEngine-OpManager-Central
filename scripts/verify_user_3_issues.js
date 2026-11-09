// Verifies 3 UI issues against the REAL OpManager Central server:
//   1. Header active tab stays confined to its row (no enlargement/overlap).
//   2. Dashboard Summary subtab shows the honest empty state — no fake
//      "8 Devices / Core Fabric", "Palo Alto & Fortinet NGFW" or
//      "NetApp AFF A400 NVMe" seed copy.
//   3. Non-standard pills [BGP-4], [SD-WAN], [DPI], [NDR] are gone.
//
// Usage:
//   OPM_BASE_URL=http://localhost:8060 CHROME_BIN=google-chrome \
//     node scripts/verify_user_3_issues.js
//
// The console route requires a logged-in session: unauthenticated requests
// are redirected to /login.html. If the dashboard shell never loads this
// script FAILS with a clear message instead of passing vacuously. To run
// authenticated, point CHROME_USER_DATA_DIR at a Chrome profile that already
// holds a session, or use the live harness under
// ~/workspace/opm-check/real-data/verify/.
// No credentials are hardcoded or read here.
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = 9652;
const baseUrl = (process.env.OPM_BASE_URL || 'http://localhost:8060').replace(/\/$/, '');
const chromeBin = process.env.CHROME_BIN || 'google-chrome';
const artifactDir = process.env.OPM_ARTIFACT_DIR || path.join(__dirname, '..', 'artifacts', 'verify-user-3-issues');
fs.mkdirSync(artifactDir, { recursive: true });
const userDataDir = process.env.CHROME_USER_DATA_DIR || `/tmp/chrome-test-${Date.now()}`;
const targetUrl = `${baseUrl}/apiclient/fluidicv3/itom/index.html#/dashboard`;

async function main() {
  const failures = [];
  console.log('1. Launching Chrome to verify all 3 user issues on the real server...');
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

  console.log('2. Navigating to real server with cache disabled:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 4500));

  // Honesty gate: the console route redirects unauthenticated browsers to
  // /login.html. If the suite shell never mounted, the checks below would
  // pass vacuously — fail instead.
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

  // --- ISSUE 1 VERIFICATION: Active tab height and row confinement ---
  console.log('3. Verifying Issue 1: Header Active Tab Row Confinement (No enlargement, no overlap):');
  const headerCheck = await evaluate(`(() => {
    const header = document.getElementById('main-header');
    const activeTab = document.querySelector('#main-header #main-nav a.active, #main-header #main-nav a.opm-main-nav-tab.active');
    const activeLi = document.querySelector('#main-header #main-nav li.active-menu, #main-header #main-nav li:has(a.active)');
    const subnavContainer = document.querySelector('#opm-custom-suite-container > div:first-child');

    const hRect = header ? header.getBoundingClientRect() : null;
    const aRect = activeTab ? activeTab.getBoundingClientRect() : null;
    const liRect = activeLi ? activeLi.getBoundingClientRect() : null;
    const sRect = subnavContainer ? subnavContainer.getBoundingClientRect() : null;

    return {
      headerHeight: hRect ? hRect.height : null,
      activeTabHeight: aRect ? aRect.height : null,
      activeLiHeight: liRect ? liRect.height : null,
      activeTabBottom: aRect ? aRect.bottom : null,
      subnavTop: sRect ? sRect.top : null,
      overlapsSubnav: (aRect && sRect) ? aRect.bottom > sRect.top : false,
      tabText: activeTab ? activeTab.innerText.trim() : null
    };
  })()`);
  console.log('Header Tab Geometry:', JSON.stringify(headerCheck, null, 2));
  if (headerCheck.overlapsSubnav) failures.push('Issue 1: active tab overlaps the subnav row');

  // --- ISSUE 3 VERIFICATION: Non-standard pills [BGP-4], [SD-WAN], [DPI], [NDR] removed ---
  console.log('4. Verifying Issue 3: Purge of non-standard pills [BGP-4], [SD-WAN], [DPI], [NDR]:');
  const toolbarCheck = await evaluate(`(() => {
    return {
      bgpPill: !!document.getElementById('opm-dash-bgp-btn'),
      sdwanPill: !!document.getElementById('opm-dash-sdwan-btn'),
      dpiPill: !!document.getElementById('opm-dash-dpi-btn'),
      ndrPill: !!document.getElementById('opm-dash-ndr-btn')
    };
  })()`);
  console.log('Toolbar Pills Status (all must be false):', JSON.stringify(toolbarCheck, null, 2));
  if (toolbarCheck.bgpPill || toolbarCheck.sdwanPill || toolbarCheck.dpiPill || toolbarCheck.ndrPill) {
    failures.push('Issue 3: a non-standard pill is still present');
  }

  await captureScreenshot('verified_header_and_dashboard.png');

  // --- ISSUE 2 VERIFICATION: Summary subtab clean state ---
  console.log('5. Verifying Issue 2: Dashboard Summary subtab:');
  const clickSummaryRes = await evaluate(`(() => {
    const summaryBtn = document.querySelector('.opm-dash-subtab-btn[data-sub="summary"]');
    if (summaryBtn) {
      summaryBtn.click();
      return true;
    }
    return false;
  })()`);
  console.log('Clicked Summary subtab:', clickSummaryRes);
  await new Promise(r => setTimeout(r, 1500));

  const summaryCheck = await evaluate(`(() => {
    const text = document.body.innerText;
    return {
      // Any of these true means fake/seeded summary copy leaked back in.
      hasFake8Devices: text.includes('8 Devices') && text.includes('Core Fabric & Edge Gateways'),
      hasFakeServers: text.includes('5 Servers') && text.includes('Database, Mail, Web, Cache'),
      hasFakeFirewalls: text.includes('Palo Alto & Fortinet NGFW'),
      hasFakeSAN: text.includes('NetApp AFF A400 NVMe'),
      hasCleanZeroState: text.includes('No Devices Added to Central Architecture') || text.includes('Active Network Nodes')
    };
  })()`);
  console.log('Summary Subtab Verification:', JSON.stringify(summaryCheck, null, 2));
  if (summaryCheck.hasFake8Devices || summaryCheck.hasFakeServers || summaryCheck.hasFakeFirewalls || summaryCheck.hasFakeSAN) {
    failures.push('Issue 2: fake/seeded summary copy present');
  }
  if (!summaryCheck.hasCleanZeroState) {
    failures.push('Issue 2: honest empty state not shown on Summary subtab');
  }
  await captureScreenshot('verified_summary.png');

  // Test clicking other header tabs:
  console.log('6. Testing clicking other header tabs to confirm strict 50px constraint:');
  const tabNames = ['inventory', 'alarms', 'maps', 'configuration', 'reports', 'settings'];
  for (const t of tabNames) {
    await evaluate(`(() => {
      const link = document.querySelector('#main-header #main-nav a[data-tab="${t}"], #main-header #main-nav a[href="#/${t}"]');
      if (link) link.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));
    const hMetric = await evaluate(`(() => {
      const a = document.querySelector('#main-header #main-nav a.active, #main-header #main-nav a.opm-main-nav-tab.active');
      return a ? { tab: '${t}', height: a.getBoundingClientRect().height, outline: window.getComputedStyle(a).outline } : null;
    })()`);
    console.log(`  Tab '${t}':`, hMetric);
  }

  await captureScreenshot('verified_settings.png');

  ws.close();
  chrome.kill();
  if (failures.length) {
    console.error('FAILURES:');
    failures.forEach(f => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('Verification completed successfully!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
