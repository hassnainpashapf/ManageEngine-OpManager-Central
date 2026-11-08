const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9698",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9698/json", res => {
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

  const exceptions = [];

  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings" } }));
  });

  function evaluate(expr) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 1000000);
      const listener = (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeListener("message", listener);
          resolve(msg.result?.result?.value);
        }
      };
      ws.on("message", listener);
      ws.send(JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: { expression: expr, returnByValue: true, awaitPromise: true }
      }));
    });
  }

  function captureScreenshot(filename) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 1000000);
      const listener = (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeListener("message", listener);
          const buf = Buffer.from(msg.result.data, "base64");
          fs.writeFileSync(path.join(artifactDir, filename), buf);
          console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
          resolve();
        }
      };
      ws.on("message", listener);
      ws.send(JSON.stringify({
        id,
        method: "Page.captureScreenshot",
        params: { format: "png" }
      }));
    });
  }

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails);
    }
  });

  // Wait for initial load
  await new Promise(r => setTimeout(r, 3500));

  console.log("=== 1. TEST DEVICE TEMPLATES SUBTAB (11,000+) ===");
  const tmplRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.settings = 'templates';
      window.OpManagerSuite.renderSettingsView();
      await new Promise(r => setTimeout(r, 600));

      const hasCatalyst = !!document.body.innerText.includes('Cisco Catalyst 9500-48Y4C');
      const hasNetApp = !!document.body.innerText.includes('NetApp AFF A400 NVMe Storage');
      const applyBtns = document.querySelectorAll('.opm-tmpl-apply-btn').length;

      // Click apply on first template
      document.querySelector('.opm-tmpl-apply-btn')?.click();

      return {
        hasCatalyst,
        hasNetApp,
        applyBtns,
        subtab: window.OpManagerSuite.state.subTabs.settings
      };
    })()
  `);
  console.log("Device Templates Inspection:", tmplRes);
  await captureScreenshot("screenshot_device_templates.png");

  console.log("\n=== 2. TEST NOTIFICATION PROFILES & THRESHOLDS SUBTAB ===");
  const notifyRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.settings = 'notifications';
      window.OpManagerSuite.renderSettingsView();
      await new Promise(r => setTimeout(r, 600));

      const hasEmailProfile = !!document.body.innerText.includes('NOC Critical Email');
      const hasPagerDuty = !!document.body.innerText.includes('PagerDuty Webhook');
      const hasSdp = !!document.body.innerText.includes('ServiceDesk Plus ITSM');
      const hasThresholdRules = !!document.body.innerText.includes('Enterprise Threshold Profiles (Threshold.conf)');
      const testNotifyBtns = document.querySelectorAll('.opm-test-notify-btn').length;

      // Test notification button click
      document.querySelector('.opm-test-notify-btn')?.click();

      return {
        hasEmailProfile,
        hasPagerDuty,
        hasSdp,
        hasThresholdRules,
        testNotifyBtns,
        subtab: window.OpManagerSuite.state.subTabs.settings
      };
    })()
  `);
  console.log("Notification & Thresholds Inspection:", notifyRes);
  await captureScreenshot("screenshot_notifications_thresholds.png");

  console.log("\n=== 3. TOTAL EXCEPTIONS COUNT ===", exceptions.length);
  exceptions.forEach(e => console.log("EXC:", e.text, e.exception?.description?.slice(0, 200)));

  setTimeout(() => {
    try { ws.close(); } catch(e) {}
    try { chrome.kill(); } catch(e) {}
    process.exit(0);
  }, 500);
})();
