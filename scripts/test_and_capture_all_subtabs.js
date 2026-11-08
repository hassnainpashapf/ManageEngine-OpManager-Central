const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");

let portCounter = 9500;

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
  const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";

  // 1. Alarms -> Problems (Zia AI RCA)
  await captureView(`${baseUrl}#/alarms`, `${artifactDir}/screenshot_alarms_problems.png`, `
    const btn = document.querySelector('.opm-alarms-subtab-btn[data-sub="problems"]');
    if (btn) btn.click();
  `, 3000);

  // 2. Alarms -> All Alarms (Historical Archive)
  await captureView(`${baseUrl}#/alarms`, `${artifactDir}/screenshot_alarms_all.png`, `
    const btn = document.querySelector('.opm-alarms-subtab-btn[data-sub="all"]');
    if (btn) btn.click();
  `, 3000);

  // 3. Alarms -> Windows Event Logs
  await captureView(`${baseUrl}#/alarms`, `${artifactDir}/screenshot_alarms_eventlog.png`, `
    const btn = document.querySelector('.opm-alarms-subtab-btn[data-sub="eventlog"]');
    if (btn) btn.click();
  `, 3000);

  // 4. Alarms -> Syslog Stream
  await captureView(`${baseUrl}#/alarms`, `${artifactDir}/screenshot_alarms_syslog.png`, `
    const btn = document.querySelector('.opm-alarms-subtab-btn[data-sub="syslog"]');
    if (btn) btn.click();
  `, 3000);

  // 5. Reports -> Performance Reports (Top 10)
  await captureView(`${baseUrl}#/reports`, `${artifactDir}/screenshot_reports_performance.png`, `
    const btn = document.querySelector('.opm-rpt-subtab-btn[data-sub="performance"]');
    if (btn) btn.click();
  `, 3000);

  // 6. Reports -> Alarms & MTTR Analytics
  await captureView(`${baseUrl}#/reports`, `${artifactDir}/screenshot_reports_mttr.png`, `
    const btn = document.querySelector('.opm-rpt-subtab-btn[data-sub="mttr"]');
    if (btn) btn.click();
  `, 3000);

  // 7. Reports -> Hardware Lifecycle & Warranty
  await captureView(`${baseUrl}#/reports`, `${artifactDir}/screenshot_reports_lifecycle.png`, `
    const btn = document.querySelector('.opm-rpt-subtab-btn[data-sub="lifecycle"]');
    if (btn) btn.click();
  `, 3000);

  // 8. Settings -> Monitoring Agents (Download EXE & DMG)
  await captureView(`${baseUrl}#/settings`, `${artifactDir}/screenshot_settings_agents.png`, `
    const btn = document.querySelector('.opm-set-subtab-btn[data-sub="agents"]');
    if (btn) btn.click();
  `, 3000);

  // 9. Settings -> System Engine (JVM & PostgreSQL)
  await captureView(`${baseUrl}#/settings`, `${artifactDir}/screenshot_settings_engine.png`, `
    const btn = document.querySelector('.opm-set-subtab-btn[data-sub="engine"]');
    if (btn) btn.click();
  `, 3000);

  // 10. Dashboard default
  await captureView(`${baseUrl}#/dashboard`, `${artifactDir}/screenshot_dashboard.png`, null, 3000);

  console.log("\nAll subtab views captured successfully!");
  process.exit(0);
}

runAll();
