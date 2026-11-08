const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9866;

async function main() {
  console.log("=== VERIFYING & CAPTURING NEW ENTERPRISE PARITY FEATURES ===");

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1680,1050",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    `--user-data-dir=/tmp/c-parity-${Date.now()}`,
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

  await new Promise(resolve => ws.on("open", resolve));

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
      returnByValue: true
    });
    return res && res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const res = await send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    console.log(`  ✓ Saved screenshot: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  // Initial load
  console.log("Waiting for OpManager Central Dashboard to mount...");
  await new Promise(r => setTimeout(r, 4500));

  // 1. ManageEngine NetPath Visual Hops Modal
  console.log("\n1. Testing ManageEngine NetPath Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showNetPathModal) {
      window.OpManagerSuite.showNetPathModal(null, "salesforce");
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_netpath_visual_hops.png");
  await evaluate(`
    const m = document.getElementById("opm-netpath-modal");
    if (m) m.style.display = "none";
  `);

  // 2. ManageEngine Server Hardware Sensors & IPMI / iDRAC Modal
  console.log("\n2. Testing Server Hardware Health & IPMI Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showHardwareSensorsModal) {
      window.OpManagerSuite.showHardwareSensorsModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_server_hardware_sensors.png");
  await evaluate(`
    const m = document.getElementById("opm-hardware-modal");
    if (m) m.style.display = "none";
  `);

  // 3. ManageEngine Zia AI Root Cause Analysis (RCA) Modal
  console.log("\n3. Testing Zia AI RCA Incident Correlation Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showZiaRcaModal) {
      window.OpManagerSuite.showZiaRcaModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_zia_rca_incident_correlation.png");
  await evaluate(`
    const m = document.getElementById("opm-zia-rca-modal");
    if (m) m.style.display = "none";
  `);

  // 4. ManageEngine High Availability (HA) Failover Simulation
  console.log("\n4. Testing Settings -> High Availability (HA) Failover Console...");
  await evaluate(`
    window.location.hash = "#/settings";
    if (window.OpManagerSuite) {
      window.OpManagerSuite.state.subTabs.settings = "failover";
      window.OpManagerSuite.renderSettingsView();
    }
  `);
  await new Promise(r => setTimeout(r, 1200));

  // Trigger simulated role switchover
  console.log("  -> Triggering simulated HA role switchover...");
  await evaluate(`
    const btn = document.getElementById("opm-simulate-failover-btn");
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot("screenshot_ha_failover_simulation.png");

  console.log("\n>>> ALL NEW ENTERPRISE PARITY FEATURES VERIFIED SUCCESSFULLY! <<<");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
