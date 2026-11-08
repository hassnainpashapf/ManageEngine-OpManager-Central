const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9890;

async function runCapture() {
  console.log("=== CAPTURING BATCH 4 ENTERPRISE FEATURES ===");

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1680,1050",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    `--user-data-dir=/tmp/c-b4-${Date.now()}`,
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
    throw new Error("Could not find Chrome page target on port " + port);
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

  console.log("Waiting for Dashboard to initialize...");
  await new Promise(r => setTimeout(r, 4500));

  // 1. ManageEngine BGP-4 Routing & Autonomous System (AS) Topology Modal
  console.log("1. Opening BGP-4 Routing & AS Topology Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showBgpMonitoringModal) {
      window.OpManagerSuite.showBgpMonitoringModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot("screenshot_bgp_routing_topology.png");
  await evaluate(`
    const m = document.getElementById("opm-bgp-modal");
    if (m) m.style.display = "none";
  `);
  await new Promise(r => setTimeout(r, 500));

  // 2. SD-WAN Fabric & BFD Tunnel Performance Modal
  console.log("2. Opening SD-WAN Fabric & BFD Tunnel Performance Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showSdwanPerformanceModal) {
      window.OpManagerSuite.showSdwanPerformanceModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  console.log("  -> Triggering simulated brownout failover...");
  await evaluate(`
    const btn = document.getElementById("opm-sdwan-simulate-brownout-btn");
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 1400));
  await captureScreenshot("screenshot_sdwan_bfd_performance.png");
  await evaluate(`
    const m = document.getElementById("opm-sdwan-modal");
    if (m) m.style.display = "none";
  `);
  await new Promise(r => setTimeout(r, 500));

  // 3. Deep Packet Inspection (DPI) & Cisco NBAR2 Application Classification Modal
  console.log("3. Opening DPI & Cisco NBAR2 Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showDpiTrafficModal) {
      window.OpManagerSuite.showDpiTrafficModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  console.log("  -> Enforcing DSCP Scavenger policy on P2P...");
  await evaluate(`
    const btn = document.getElementById("opm-dpi-enforce-scavenger-btn");
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 1400));
  await captureScreenshot("screenshot_dpi_nbar2_traffic.png");
  await evaluate(`
    const m = document.getElementById("opm-dpi-modal");
    if (m) m.style.display = "none";
  `);
  await new Promise(r => setTimeout(r, 500));

  // 4. Network Detection & Response (NDR) & Security Threat Forensics Modal
  console.log("4. Opening NDR & Security Threat Forensics Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showNdrForensicsModal) {
      window.OpManagerSuite.showNdrForensicsModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  console.log("  -> Pushing automated firewall ACL block...");
  await evaluate(`
    const btn = document.getElementById("opm-ndr-push-acl-btn");
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 1400));
  await captureScreenshot("screenshot_ndr_threat_forensics.png");
  await evaluate(`
    const m = document.getElementById("opm-ndr-modal");
    if (m) m.style.display = "none";
  `);

  console.log("\n>>> ALL BATCH 4 SCREENSHOTS CAPTURED SUCCESSFULLY! <<<");
  ws.close();
  chrome.kill();
  process.exit(0);
}

runCapture().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
