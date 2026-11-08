const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";
const baseUrl = "http://localhost:8060/apiclient/fluidicv3/itom/index.html";
const port = 9559;

async function main() {
  console.log("=== CAPTURING DEEP ENTERPRISE FEATURES SCREENSHOTS ===");

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

  // 1. NetFlow Analyzer Raw Records Stream Modal
  console.log("1. Opening NetFlow Raw Records Stream Modal...");
  await send("Page.navigate", { url: baseUrl + "#/dashboard" });
  await new Promise(r => setTimeout(r, 1500));
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showNetFlowRawRecordsModal) {
      window.OpManagerSuite.showNetFlowRawRecordsModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_nfa_raw_records_modal.png");

  // Close NFA modal
  await evaluate(`
    const m = document.getElementById('opm-nfa-records-modal');
    if (m) m.style.display = 'none';
  `);

  // 2. Snapshot Diagnostic CLI with Live ICMP Waveform
  console.log("2. Opening Device Snapshot -> Diagnostics CLI Tab with Live ICMP Waveform...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showDeviceSnapshotModal) {
      window.OpManagerSuite.showDeviceSnapshotModal(window.OpManagerSuite.state.devices[0]);
      setTimeout(() => {
        const diagTab = document.querySelector('[data-tab="diagnostics"]');
        if (diagTab) diagTab.click();
      }, 300);
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_snapshot_icmp_waveform.png");

  // Close snapshot modal
  await evaluate(`
    const m = document.getElementById('opm-device-snapshot-modal');
    if (m) m.style.display = 'none';
  `);

  // 3. Standalone ManageEngine MIB Browser Modal
  console.log("3. Opening ManageEngine Standalone MIB Browser Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showMibBrowserModal) {
      window.OpManagerSuite.showMibBrowserModal('10.10.1.1', '.1.3.6.1.2.1.1.1.0');
      setTimeout(() => {
        const getBtn = document.getElementById('mib-btn-get');
        if (getBtn) getBtn.click();
      }, 300);
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot("screenshot_mib_browser_modal.png");

  // Close MIB Browser modal
  await evaluate(`
    const m = document.getElementById('opm-standalone-mib-browser-modal');
    if (m) m.style.display = 'none';
  `);

  // 4. Cisco IP SLA VoIP & Jitter Telemetry Modal
  console.log("4. Opening Cisco IP SLA VoIP & Jitter Telemetry Modal...");
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showIpSlaVoipModal) {
      window.OpManagerSuite.showIpSlaVoipModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_ipsla_voip_modal.png");

  // Close IP SLA modal
  await evaluate(`
    const m = document.getElementById('opm-ipsla-voip-modal');
    if (m) m.style.display = 'none';
  `);

  // 5. Schedule Downtime / Alarm Suppression Modal
  console.log("5. Navigating to #/alarms and opening Schedule Downtime Modal...");
  await send("Page.navigate", { url: baseUrl + "#/alarms" });
  await new Promise(r => setTimeout(r, 1200));
  await evaluate(`
    if (window.OpManagerSuite && window.OpManagerSuite.showScheduleDowntimeModal) {
      window.OpManagerSuite.showScheduleDowntimeModal();
    }
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot("screenshot_alarms_schedule_downtime.png");

  ws.close();
  chrome.kill();
  console.log("=== ALL DEEP ENTERPRISE SCREENSHOTS CAPTURED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
