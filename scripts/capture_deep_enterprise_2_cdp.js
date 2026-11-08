const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9560;

async function main() {
  console.log("=== CAPTURING BATCH 2 ENTERPRISE FEATURES SCREENSHOTS ===");

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

  // 1. Visual Workflow Designer Modal
  console.log("1. Opening Visual Workflow Designer Modal...");
  await send("Page.navigate", { url: baseUrl + "#/configuration" });
  await new Promise(r => setTimeout(r, 1500));
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showNewWorkflowModal) {
      window.OpManagerSuite.showNewWorkflowModal();
      setTimeout(() => {
        const runBtn = document.getElementById('wf-test-run-btn');
        if (runBtn) runBtn.click();
      }, 400);
    }
  `);
  await new Promise(r => setTimeout(r, 1800));
  await captureScreenshot("screenshot_workflow_designer_modal.png");

  // Close Workflow modal
  await evaluate(`
    const m = document.getElementById('opm-visual-workflow-modal');
    if (m) m.style.display = 'none';
  `);

  // 2. OpUtils 48-Port Switch Port Mapper Modal
  console.log("2. Opening OpUtils 48-Port Switch Port Mapper Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showSwitchPortMapperModal) {
      window.OpManagerSuite.showSwitchPortMapperModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_oputils_spm_modal.png");

  // Close SPM modal
  await evaluate(`
    const m = document.getElementById('opm-spm-modal');
    if (m) m.style.display = 'none';
  `);

  // 3. Storage Array & LUN Latency Inspector Modal
  console.log("3. Opening Storage Array & LUN Latency Inspector Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showStorageArrayModal) {
      window.OpManagerSuite.showStorageArrayModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_storage_array_modal.png");

  // Close Storage modal
  await evaluate(`
    const m = document.getElementById('opm-storage-array-modal');
    if (m) m.style.display = 'none';
  `);

  // 4. SSL / TLS Certificate Chain & Cipher Suite Inspector Modal
  console.log("4. Opening SSL Certificate Chain & Cipher Suite Inspector Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showSslCertificateModal) {
      window.OpManagerSuite.showSslCertificateModal();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_ssl_certificate_modal.png");

  ws.close();
  chrome.kill();
  console.log("=== ALL BATCH 2 SCREENSHOTS CAPTURED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
