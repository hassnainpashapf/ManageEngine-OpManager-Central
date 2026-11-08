const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9695",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9695/json", res => {
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
    ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/configuration" } }));
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

  console.log("=== 1. TEST IT AUTOMATION WORKFLOWS PLAYBOOKS ===");
  const wfRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.configuration = 'workflows';
      window.OpManagerSuite.renderConfigurationView();
      await new Promise(r => setTimeout(r, 600));

      const playbooksCount = document.querySelectorAll('.opm-wf-execute-btn').length;
      
      // Execute the first playbook (WF-001)
      const firstBtn = document.querySelector('.opm-wf-execute-btn');
      if (firstBtn) firstBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const terminalText = document.getElementById('opm-wf-logs-terminal')?.innerText;
      const executionSuccess = terminalText?.includes('Exit Code 0');

      return {
        playbooksCount,
        hasTerminal: !!document.getElementById('opm-wf-logs-terminal'),
        executionSuccess,
        terminalPreview: terminalText?.slice(0, 120)
      };
    })()
  `);
  console.log("Workflows Playbooks Inspection:", wfRes);
  await captureScreenshot("screenshot_workflows_view.png");

  console.log("\n=== 2. TEST SCHEDULED REPORTS SUBTAB & EMAIL DISTRIBUTION ===");
  const schedRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.reports = 'schedule';
      window.OpManagerSuite.renderReportsView();
      await new Promise(r => setTimeout(r, 600));

      const sendBtns = document.querySelectorAll('.opm-send-now-btn').length;
      const hasDigest = !!document.body.innerText.includes('Daily Executive Health Digest');
      const hasWeekly = !!document.body.innerText.includes('Weekly Multi-Probe SLA Compliance');

      // Click email now
      document.querySelector('.opm-send-now-btn')?.click();

      return {
        sendBtns,
        hasDigest,
        hasWeekly,
        subtab: window.OpManagerSuite.state.subTabs.reports
      };
    })()
  `);
  console.log("Scheduled Reports Inspection:", schedRes);
  await captureScreenshot("screenshot_scheduled_reports.png");

  console.log("\n=== 3. TEST AUTHENTIC AUDIO WEBALARM.MP3 SOUND ===");
  const audioRes = await evaluate(`
    (() => {
      let threw = false;
      try {
        window.OpManagerSuite.playAlarmChime();
      } catch(e) {
        threw = true;
      }
      return { threw, soundEnabled: localStorage.getItem('opm_sound_enabled') };
    })()
  `);
  console.log("WebAlarm Sound Trigger:", audioRes);

  console.log("\n=== 4. TOTAL EXCEPTIONS COUNT ===", exceptions.length);
  exceptions.forEach(e => console.log("EXC:", e.text, e.exception?.description?.slice(0, 200)));

  setTimeout(() => {
    try { ws.close(); } catch(e) {}
    try { chrome.kill(); } catch(e) {}
    process.exit(0);
  }, 500);
})();
