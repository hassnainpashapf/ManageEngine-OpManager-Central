const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");

let portCounter = 9340;

async function captureView(url, outputPath, evalScript = null, waitTime = 3500) {
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
    await new Promise(r => setTimeout(r, 250));
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
    console.error(`Chrome failed to start on port ${port}`);
    chrome.kill();
    return;
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

async function runAll() {
  const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

  // 1. Dashboard
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Home/Dashboard/Overview", `${artifactDir}/screenshot_dashboard.png`, null, 3500);

  // 2. Inventory
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Inventory/List/Network/Devices", `${artifactDir}/screenshot_inventory.png`, null, 3500);

  // 3. Alarms
  await captureView("http://localhost:8060/apiclient/fluidicv3/itom/index.html#/alarms/list/active", `${artifactDir}/screenshot_alarms.png`, null, 5000);

  // 4. Maps
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Maps", `${artifactDir}/screenshot_maps.png`, null, 3500);

  // 5. Configuration
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Configuration", `${artifactDir}/screenshot_configuration.png`, null, 3500);

  // 6. Settings
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Settings", `${artifactDir}/screenshot_settings.png`, null, 3500);

  // 7. Device Snapshot
  await captureView("http://localhost:8060/apiclient/ember/index.jsp#/Inventory/List/Network/Devices", `${artifactDir}/screenshot_device_snapshot.png`, `
    const btn = document.querySelector('.open-snap-btn');
    if (btn) btn.click();
  `, 3500);

  // 8. Alarm Drawer
  await captureView("http://localhost:8060/apiclient/fluidicv3/itom/index.html#/alarms/list/active", `${artifactDir}/screenshot_alarm_drawer.png`, `
    const row = document.querySelector('tr.jqgrow');
    if (row) row.click();
  `, 5000);

  console.log("\nAll views captured!");
  process.exit(0);
}

runAll();
