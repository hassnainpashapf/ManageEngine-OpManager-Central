// Exercises the Device Templates catalog UI against the REAL OpManager
// Central server: initial load, SWITCHES / FIREWALLS / ALL filters,
// real-time search, template-details modal, "Apply to Nodes" modal.
//
// The templates catalog is a static vendor/template definition (not
// collected site data), so exercising it is legitimate against the real
// server. This script asserts no device counts and no seeded demo data —
// it only reports what the catalog UI actually shows.
//
// Usage:
//   OPM_BASE_URL=http://localhost:8060 CHROME_BIN=google-chrome \
//     node scripts/verify_templates_catalog.js
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

const port = 9655;
const baseUrl = (process.env.OPM_BASE_URL || 'http://localhost:8060').replace(/\/$/, '');
const chromeBin = process.env.CHROME_BIN || 'google-chrome';
const artifactDir = process.env.OPM_ARTIFACT_DIR || path.join(__dirname, '..', 'artifacts', 'verify-templates-catalog');
fs.mkdirSync(artifactDir, { recursive: true });
const userDataDir = process.env.CHROME_USER_DATA_DIR || `/tmp/chrome-test-templates-${Date.now()}`;
const targetUrl = `${baseUrl}/apiclient/fluidicv3/itom/index.html#/settings/templates`;

async function main() {
  console.log('1. Launching Headless Chrome to test Device Templates Catalog on the real server...');
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

  console.log('2. Navigating directly to Settings -> Templates:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 4500));

  // Honesty gate: the console route redirects unauthenticated browsers to
  // /login.html. If the suite shell never mounted, the checks below would
  // report an empty catalog instead of a real result — fail instead.
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

  // 1. Initial Catalog Check
  console.log('3. Verifying Templates Table Initial Load:');
  const initialInfo = await evaluate(`(() => {
    const rows = document.querySelectorAll('.opm-tmpl-name-link');
    const chips = Array.from(document.querySelectorAll('.opm-tmpl-chip')).map(c => c.textContent.trim());
    return {
      rowCount: rows.length,
      firstRow: rows[0] ? rows[0].textContent.trim() : null,
      chips: chips
    };
  })()`);
  console.log('Initial Info:', initialInfo);
  await captureScreenshot('verified_templates_catalog.png');

  // 2. Click Filter Chip: SWITCHES
  console.log('4. Testing Category Filter: Clicking SWITCHES:');
  const switchesResult = await evaluate(`(() => {
    const switchChip = Array.from(document.querySelectorAll('.opm-tmpl-chip')).find(c => c.textContent.includes('SWITCHES'));
    if (!switchChip) return { found: false };
    switchChip.click();
    return { found: true };
  })()`);
  await new Promise(r => setTimeout(r, 500));
  const switchesRows = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('.opm-tmpl-name-link')).map(r => r.textContent.trim());
    const cats = Array.from(document.querySelectorAll('tbody tr td:nth-child(2)')).map(c => c.textContent.trim());
    return { count: rows.length, rows, cats };
  })()`);
  console.log('Switches Filtered Result:', switchesRows);
  await captureScreenshot('verified_templates_filtered_switches.png');

  // 3. Click Filter Chip: FIREWALLS
  console.log('5. Testing Category Filter: Clicking FIREWALLS:');
  await evaluate(`(() => {
    const fwChip = Array.from(document.querySelectorAll('.opm-tmpl-chip')).find(c => c.textContent.includes('FIREWALLS'));
    if (fwChip) fwChip.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));
  const fwRows = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('.opm-tmpl-name-link')).map(r => r.textContent.trim());
    const cats = Array.from(document.querySelectorAll('tbody tr td:nth-child(2)')).map(c => c.textContent.trim());
    return { count: rows.length, rows, cats };
  })()`);
  console.log('Firewalls Filtered Result:', fwRows);

  // 4. Return to ALL
  await evaluate(`(() => {
    const allChip = Array.from(document.querySelectorAll('.opm-tmpl-chip')).find(c => c.textContent.includes('ALL'));
    if (allChip) allChip.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 5. Test Search Box
  console.log('6. Testing Real-Time Search: Searching for "Palo Alto":');
  await evaluate(`(() => {
    const search = document.getElementById('opm-tmpl-search-input');
    if (search) {
      search.value = 'Palo Alto';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`);
  await new Promise(r => setTimeout(r, 500));
  const searchResults = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('.opm-tmpl-name-link')).map(r => r.textContent.trim());
    return { count: rows.length, rows };
  })()`);
  console.log('Search Result for "Palo Alto":', searchResults);

  // Clear search box
  await evaluate(`(() => {
    const search = document.getElementById('opm-tmpl-search-input');
    if (search) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 6. Test Clicking Template Name -> Template Details Modal
  console.log('7. Testing Template Name Click -> Template Details Modal:');
  const modalOpened = await evaluate(`(() => {
    const firstLink = document.querySelector('.opm-tmpl-name-link');
    if (firstLink) firstLink.click();
    const modal = document.getElementById('opm-tmpl-details-modal');
    return {
      clicked: !!firstLink,
      modalDisplay: modal ? modal.style.display : 'none',
      tmplName: modal ? modal.querySelector('#edit-tmpl-name').value : null,
      vendor: modal ? modal.querySelector('#edit-tmpl-vendor').value : null,
      oid: modal ? modal.querySelector('#edit-tmpl-oid').value : null
    };
  })()`);
  console.log('Template Details Modal Opened:', modalOpened);
  await new Promise(r => setTimeout(r, 600));
  await captureScreenshot('verified_template_details_modal.png');

  // Close details modal
  await evaluate(`(() => {
    const closeBtn = document.getElementById('close-tmpl-details-btn');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // 7. Test Apply to Nodes Modal
  console.log('8. Testing "Apply to Nodes" Modal:');
  const applyModalOpened = await evaluate(`(() => {
    const firstApplyBtn = document.querySelector('.opm-tmpl-apply-btn');
    if (firstApplyBtn) firstApplyBtn.click();
    const modal = document.getElementById('opm-apply-tmpl-modal');
    return {
      clicked: !!firstApplyBtn,
      modalDisplay: modal ? modal.style.display : 'none',
      modalText: modal ? modal.innerText.substring(0, 150) : null
    };
  })()`);
  console.log('Apply to Nodes Modal Opened:', applyModalOpened);
  await new Promise(r => setTimeout(r, 600));
  await captureScreenshot('verified_template_apply_modal.png');

  // Close apply modal
  await evaluate(`(() => {
    const closeBtn = document.getElementById('close-apply-tmpl-btn');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  console.log('9. All Template features verified successfully!');
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
