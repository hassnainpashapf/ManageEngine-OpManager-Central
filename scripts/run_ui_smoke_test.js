const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9555;

const routesToTest = [
  { name: "Dashboard", hash: "#/dashboard", screenshot: "screenshot_smoke_dashboard.png" },
  { name: "Inventory", hash: "#/inventory", screenshot: "screenshot_smoke_inventory.png" },
  { name: "Alarms", hash: "#/alarms", screenshot: "screenshot_smoke_alarms.png" },
  { name: "Maps", hash: "#/maps", screenshot: "screenshot_smoke_maps.png" },
  { name: "Configuration", hash: "#/configuration", screenshot: "screenshot_smoke_configuration.png" },
  { name: "Reports", hash: "#/reports", screenshot: "screenshot_smoke_reports.png" },
  { name: "Settings", hash: "#/settings", screenshot: "screenshot_smoke_settings.png" }
];

async function main() {
  console.log("=== STARTING FULL ROUTE-BY-ROUTE UI SMOKE TEST ===");

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    `--user-data-dir=/tmp/c-smoke-${Date.now()}`,
    `${baseUrl}#/dashboard`
  ]);

  let targets = null;
  let pageTarget = null;
  for (let i = 0; i < 40; i++) {
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
      if (targets) {
        pageTarget = targets.find(t => t.type === "page" && t.url && t.url.includes("8060"));
        if (!pageTarget) pageTarget = targets.find(t => t.type === "page");
        if (pageTarget) break;
      }
    } catch(e) {}
  }

  if (!pageTarget) {
    console.error("Chrome page target failed to launch!");
    chrome.kill();
    process.exit(1);
  }

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

  const consoleLogs = [];
  const wsWarnings = [];

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
      if (msg.method === "Runtime.consoleAPICalled") {
        const text = msg.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || "")).join(" ");
        const entry = { type: msg.params.type, text };
        consoleLogs.push(entry);
        if (text.includes("No handler found for WebSocket message")) {
          wsWarnings.push(text);
        }
      }
    } catch(e) {}
  });

  await send("Page.enable");
  await send("Runtime.enable");

  // Initial load to dashboard
  console.log(`Loading initial page: ${baseUrl}#/dashboard ...`);
  await send("Page.navigate", { url: `${baseUrl}#/dashboard` });
  await new Promise(r => setTimeout(r, 3000));

  const smokeTestResults = [];

  for (const route of routesToTest) {
    console.log(`\nTesting Route: ${route.name} (${route.hash}) ...`);
    
    // Evaluate hash change in page
    await send("Runtime.evaluate", {
      expression: `window.location.hash = '${route.hash}';`
    });

    // Wait for router & resilience timers to settle
    await new Promise(r => setTimeout(r, 1800));

    // Audit DOM state
    const evalRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const container = document.getElementById('opm-custom-suite-container');
          const header = document.getElementById('main-header');
          const pageContainer = document.querySelector('.page-container');
          
          const inDoc = !!container && document.body.contains(container);
          const childCount = container ? container.children.length : 0;
          const text = container ? (container.innerText || '').trim() : '';
          const textLen = text.length;

          // Check subtabs
          const subtabs = Array.from(container ? container.querySelectorAll('button, .subnav-tab, [class*="tab"]') : [])
            .map(el => (el.innerText || '').trim())
            .filter(t => t.length > 0 && t.length < 30)
            .slice(0, 8);

          // Check main content elements (tables, cards, widgets)
          const tables = container ? container.querySelectorAll('table, .opm-table').length : 0;
          const rows = container ? container.querySelectorAll('tr').length : 0;
          const cards = container ? container.querySelectorAll('.stat-card, .widget, .card, [class*="card"]').length : 0;
          const buttons = container ? container.querySelectorAll('button').length : 0;

          // First 200 chars preview
          const preview = text.substring(0, 150).replace(/\\s+/g, ' ');

          return {
            title: document.title,
            inDoc,
            parent: container ? container.parentElement.tagName : null,
            childCount,
            textLen,
            tables,
            rows,
            cards,
            buttons,
            subtabs,
            preview
          };
        })()
      `,
      returnByValue: true
    });

    const info = evalRes?.result?.value || {};

    // Take screenshot
    const shotRes = await send("Page.captureScreenshot", { format: "png" });
    if (shotRes?.data) {
      const shotPath = path.join(artifactDir, route.screenshot);
      fs.writeFileSync(shotPath, Buffer.from(shotRes.data, "base64"));
      console.log(`  ✓ Screenshot saved: ${route.screenshot}`);
    }

    const passed = info.inDoc && info.childCount > 0 && info.textLen > 100;
    const resultObj = {
      name: route.name,
      hash: route.hash,
      passed,
      title: info.title,
      inDoc: info.inDoc,
      childCount: info.childCount,
      textLen: info.textLen,
      tables: info.tables,
      rows: info.rows,
      cards: info.cards,
      buttons: info.buttons,
      subtabs: info.subtabs,
      preview: info.preview
    };
    smokeTestResults.push(resultObj);

    console.log(`  Status: ${passed ? "PASS ✓" : "FAIL ✗"}`);
    console.log(`  Title: ${info.title}`);
    console.log(`  Container in doc: ${info.inDoc}, Children: ${info.childCount}, Text length: ${info.textLen} chars`);
    console.log(`  Tables: ${info.tables}, Rows: ${info.rows}, Cards: ${info.cards}, Buttons: ${info.buttons}`);
    console.log(`  Subtabs detected: [${(info.subtabs || []).join(", ")}]`);
    console.log(`  Preview: "${info.preview}"`);
  }

  // Check WebSocket warnings count
  console.log(`\n========================================`);
  console.log(`WEBSOCKET CONSOLE WARNINGS AUDIT:`);
  console.log(`Total WebSocket handler warnings: ${wsWarnings.length}`);
  if (wsWarnings.length > 0) {
    wsWarnings.forEach(w => console.log(`  [WARN] ${w}`));
  } else {
    console.log(`  ✓ ZERO missing WebSocket handler warnings detected!`);
  }
  console.log(`========================================\n`);

  // Close chrome
  try { ws.close(); } catch(e) {}
  try { chrome.kill(); } catch(e) {}

  // Output JSON summary
  console.log("SMOKE_TEST_SUMMARY_JSON:");
  console.log(JSON.stringify({
    routes: smokeTestResults,
    wsWarningsCount: wsWarnings.length,
    totalRoutes: smokeTestResults.length,
    allPassed: smokeTestResults.every(r => r.passed) && wsWarnings.length === 0
  }, null, 2));
}

main().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
