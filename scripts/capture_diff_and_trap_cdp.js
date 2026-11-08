const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9558;

async function main() {
  console.log("=== CAPTURING NCM DIFF & TRAP SIMULATOR SCREENSHOTS ===");

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

  // 1. Dual-Pane NCM Version Comparator
  console.log("1. Opening NCM Dual-Pane Version Comparator Modal...");
  await send("Page.navigate", { url: baseUrl + "#/configuration" });
  await new Promise(r => setTimeout(r, 1500));
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showNcmVersionCompareModal) {
      window.OpManagerSuite.showNcmVersionCompareModal(window.OpManagerSuite.state.devices[0]);
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_ncm_dualpane_comparator.png");

  // Close comparator modal
  await evaluate(`
    const m = document.getElementById('opm-ncm-diff-modal');
    if (m) m.style.display = 'none';
  `);
  await new Promise(r => setTimeout(r, 300));

  // 2. SNMP Trap Simulator Modal
  console.log("2. Opening SNMP Trap Simulator Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showSnmpTrapSimulatorModal) {
      window.OpManagerSuite.showSnmpTrapSimulatorModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_snmp_trap_simulator.png");

  // Close trap simulator modal
  await evaluate(`
    const m = document.getElementById('opm-trap-sim-modal');
    if (m) m.style.display = 'none';
  `);

  console.log("=== ALL CAPTURES FINISHED ===");
  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
