const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9556;

async function main() {
  console.log("=== CAPTURING NEW ENTERPRISE FEATURE SCREENSHOTS VIA CDP ===");

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--disable-gpu",
    "--remote-debugging-port=" + port,
    "--window-size=1440,900"
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, res => {
          let d = ""; res.on("data", c => d += c); res.on("end", () => {
            try { resolve(JSON.parse(d)); } catch(e) { reject(e); }
          });
        });
        req.on("error", reject);
      });
      if (targets && targets.length > 0) break;
    } catch(e) {}
  }

  if (!targets || !targets[0]) {
    console.error("Chrome failed to launch!");
    chrome.kill();
    process.exit(1);
  }

  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pendingRequests = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(resolve => {
    ws.on("open", resolve);
  });

  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
      }
    } catch(e) {}
  });

  await send("Page.enable");
  await send("Runtime.enable");

  async function evaluate(expression) {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res && res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const res = await send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    console.log(`  ✓ Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  // 1. Dashboard with Sub-Header Breadcrumbs & Real-time Clock
  console.log("1. Navigating to Dashboard...");
  await send("Page.navigate", { url: baseUrl + "#/dashboard" });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot("screenshot_header_breadcrumbs_clock.png");

  // 2. Open Global Omnibox Quick Search (Ctrl+K)
  console.log("2. Opening Omnibox Quick Search...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showGlobalSearchModal) {
      window.OpManagerSuite.showGlobalSearchModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_omnibox_quick_search.png");

  // Close search modal
  await evaluate(`
    const m = document.getElementById('opm-search-modal');
    if (m) m.style.display = 'none';
  `);
  await new Promise(r => setTimeout(r, 300));

  // 3. Open Device Snapshot Modal and switch to "Diagnostic CLI & SNMP" Tab
  console.log("3. Opening Device Snapshot with Diagnostic CLI Tab...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showDeviceSnapshotModal) {
      const dev = window.OpManagerSuite.state.devices[0];
      window.OpManagerSuite.showDeviceSnapshotModal(dev);
    }
  `);
  await new Promise(r => setTimeout(r, 600));
  await evaluate(`
    const diagTab = Array.from(document.querySelectorAll('.snap-tab-item')).find(el => el.innerText.includes('Diagnostic'));
    if (diagTab) diagTab.click();
    setTimeout(() => {
      const pingBtn = document.getElementById('cli-run-ping-btn');
      if (pingBtn) pingBtn.click();
    }, 200);
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_snapshot_diagnostic_cli.png");

  // Close snapshot modal
  await evaluate(`
    const m = document.getElementById('device-snapshot-modal');
    if (m) m.style.display = 'none';
  `);
  await new Promise(r => setTimeout(r, 300));

  // 4. Inventory Floating Bulk Actions Bar
  console.log("4. Navigating to Inventory and selecting rows...");
  await send("Page.navigate", { url: baseUrl + "#/inventory" });
  await new Promise(r => setTimeout(r, 1200));
  await evaluate(`
    const cbs = document.querySelectorAll('.opm-inv-row-cb');
    if (cbs[0]) cbs[0].click();
    if (cbs[1]) cbs[1].click();
    if (cbs[2]) cbs[2].click();
  `);
  await new Promise(r => setTimeout(r, 600));
  await captureScreenshot("screenshot_inventory_floating_bulk_bar.png");

  // 5. NOC Dark Theme Wallboard
  console.log("5. Toggling NOC Dark Mode...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.toggleNocDarkMode) {
      window.OpManagerSuite.toggleNocDarkMode(true);
    }
    window.location.hash = '#/dashboard';
  `);
  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot("screenshot_noc_dark_theme_dashboard.png");

  // Revert dark mode
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.toggleNocDarkMode) {
      window.OpManagerSuite.toggleNocDarkMode(false);
    }
  `);

  console.log("=== ALL FEATURE SCREENSHOTS COMPLETED SUCCESSFULLY ===");
  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
