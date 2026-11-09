const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';

async function captureNewFeatures() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Dashboard with Sub-Header Breadcrumb Bar & Clock
  console.log('1. Capturing Sub-Header Breadcrumbs & Real-time Clock...');
  await page.goto('http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#opm-header-subnav-bar', { timeout: 8000 });
  await page.screenshot({ path: `${ARTIFACTS_DIR}/screenshot_header_breadcrumbs_clock.png` });

  // 2. Open & Capture Global Omnibox Quick Search (Ctrl+K)
  console.log('2. Capturing Global Omnibox Quick Search...');
  await page.evaluate(() => {
    window.OpManagerSuite.showGlobalSearchModal();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${ARTIFACTS_DIR}/screenshot_omnibox_quick_search.png` });

  // Close search modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // 3. Open Device Snapshot Modal and switch to "Diagnostic CLI & SNMP" Tab
  console.log('3. Capturing Device Snapshot Diagnostic CLI Tab...');
  await page.evaluate(() => {
    const dev = window.OpManagerSuite.state.devices[0];
    window.OpManagerSuite.showDeviceSnapshotModal(dev);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const diagTab = Array.from(document.querySelectorAll('.snap-tab-item')).find(el => el.innerText.includes('Diagnostic'));
    if (diagTab) diagTab.click();
    setTimeout(() => {
      const pingBtn = document.getElementById('cli-run-ping-btn');
      if (pingBtn) pingBtn.click();
    }, 200);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACTS_DIR}/screenshot_snapshot_diagnostic_cli.png` });

  // Close snapshot modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // 4. Go to Inventory, check rows, capture Floating Bulk Action Bar
  console.log('4. Capturing Floating Bulk Action Bar in Inventory...');
  await page.goto('http://localhost:8060/apiclient/fluidicv3/itom/index.html#/inventory', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const cbs = document.querySelectorAll('.opm-inv-row-cb');
    if (cbs[0]) cbs[0].click();
    if (cbs[1]) cbs[1].click();
    if (cbs[2]) cbs[2].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${ARTIFACTS_DIR}/screenshot_inventory_floating_bulk_bar.png` });

  // 5. Toggle NOC Dark Mode and Capture Dashboard in NOC Dark Theme
  console.log('5. Capturing NOC Dark Theme Wallboard...');
  await page.evaluate(() => {
    window.OpManagerSuite.toggleNocDarkMode(true);
    window.location.hash = '#/dashboard';
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${ARTIFACTS_DIR}/screenshot_noc_dark_theme_dashboard.png` });

  // Toggle back to light mode for default
  await page.evaluate(() => {
    window.OpManagerSuite.toggleNocDarkMode(false);
  });

  await browser.close();
  console.log('All feature screenshots captured successfully!');
}

captureNewFeatures().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
