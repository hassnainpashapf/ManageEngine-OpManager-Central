const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");

let portCounter = 9520;

async function captureView(url, outputPath, evalScript = null, waitTime = 2500) {
  const port = ++portCounter;
  console.log(`\nCapturing: ${url} -> ${outputPath}`);
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
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

  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  function send(method, params = {}, customId) {
    const id = customId !== undefined ? customId : msgId++;
    ws.send(JSON.stringify({ id, method, params }));
    return id;
  }

  await new Promise(resolve => {
    ws.on("open", () => {
      send("Page.enable");
      send("Runtime.enable");
      send("Page.navigate", { url });
    });

    ws.on("message", raw => {
      const msg = JSON.parse(raw);
      if (msg.id === 888 && msg.result?.data) {
        fs.writeFileSync(outputPath, Buffer.from(msg.result.data, "base64"));
        console.log(`  ✓ Saved: ${outputPath}`);
        setTimeout(() => {
          try { ws.close(); } catch(e) {}
          try { chrome.kill(); } catch(e) {}
          resolve();
        }, 300);
      }
    });

    setTimeout(() => {
      if (evalScript) {
        send("Runtime.evaluate", { expression: evalScript });
        setTimeout(() => {
          send("Page.captureScreenshot", { format: "png" }, 888);
        }, 1200);
      } else {
        send("Page.captureScreenshot", { format: "png" }, 888);
      }
    }, waitTime);
  });
}

async function run() {
  const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
  const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";

  // 1. Device Snapshot Modal
  await captureView(`${baseUrl}#/inventory`, `${artifactDir}/screenshot_device_snapshot.png`, `
    if (window.OpManagerSuite) {
      window.OpManagerSuite.showDeviceSnapshotModal(1);
    }
  `, 3000);

  // 2. Probe Details Modal
  await captureView(`${baseUrl}#/dashboard`, `${artifactDir}/screenshot_probe_modal.png`, `
    if (window.OpManagerSuite) {
      window.OpManagerSuite.showProbeDetailsModal(4);
    }
  `, 3000);

  // 3. Zia AI Modal
  await captureView(`${baseUrl}#/dashboard`, `${artifactDir}/screenshot_zia_modal.png`, `
    if (window.OpManagerSuite) {
      window.OpManagerSuite.showZiaAIModal();
    }
  `, 3000);

  console.log("\nModals captured successfully!");
  process.exit(0);
}

run();
