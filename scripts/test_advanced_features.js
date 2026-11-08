const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9691",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9691/json", res => {
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

  // Wait for initial settings page load
  await new Promise(r => setTimeout(r, 3500));

  console.log("=== 1. TEST SETTINGS SUPPORT & SYSTEM LOGS SUBTAB ===");
  const supportRes = await evaluate(`
    (async () => {
      document.querySelector('.opm-set-subtab-btn[data-sub="support"]')?.click();
      await new Promise(r => setTimeout(r, 600));
      const term = document.getElementById('opm-log-terminal-output');
      const lines = term ? term.innerText.split('\\n').filter(Boolean).length : 0;
      
      // Select poller.log
      const select = document.getElementById('opm-log-file-select');
      if (select) {
        select.value = 'poller.log';
        select.dispatchEvent(new Event('change'));
      }
      await new Promise(r => setTimeout(r, 600));
      const pollerLines = term ? term.innerText.split('\\n').filter(Boolean).length : 0;

      // Test SIF button
      document.getElementById('opm-generate-sif-btn')?.click();
      await new Promise(r => setTimeout(r, 400));

      return {
        initialLogLines: lines,
        pollerLogLines: pollerLines,
        hasTerminal: !!term,
        subtab: window.OpManagerSuite.state.subTabs.settings
      };
    })()
  `);
  console.log("Support Logs Subtab:", supportRes);
  await captureScreenshot("screenshot_support_logs.png");

  console.log("\n=== 2. TEST ALARMS ROOT CAUSE ANALYSIS (RCA) SUBTAB ===");
  const rcaRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.alarms = 'rca';
      window.OpManagerSuite.renderAlarmsView();
      await new Promise(r => setTimeout(r, 600));

      const hasRootNode = !!document.body.innerText.includes('DXB-CORE-SW-01');
      const hasSuppressed = !!document.body.innerText.includes('116 Raw Signals Suppressed');
      
      // Test technician note addition
      const noteInput = document.getElementById('opm-rca-note-input');
      const addNoteBtn = document.getElementById('opm-rca-add-note-btn');
      if (noteInput && addNoteBtn) {
        noteInput.value = 'Technician Verified: Failover route pre-checked, applying bypass.';
        addNoteBtn.click();
      }
      await new Promise(r => setTimeout(r, 300));
      const notesContainerText = document.getElementById('opm-rca-notes-container')?.innerText;

      return {
        hasRootNode,
        hasSuppressed,
        notesUpdated: notesContainerText?.includes('Failover route pre-checked'),
        subtab: window.OpManagerSuite.state.subTabs.alarms
      };
    })()
  `);
  console.log("RCA View:", rcaRes);
  await captureScreenshot("screenshot_rca_view.png");

  console.log("\n=== 3. TEST INVENTORY ROW QUICK ACTIONS & CSV EXPORT ===");
  const invRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.state.subTabs.inventory = 'devices';
      window.OpManagerSuite.renderInventoryView();
      await new Promise(r => setTimeout(r, 600));

      const pingBtns = document.querySelectorAll('.opm-inv-row-ping-btn').length;
      const cliBtns = document.querySelectorAll('.opm-inv-row-cli-btn').length;
      const pollBtns = document.querySelectorAll('.opm-inv-row-poll-btn').length;
      const snapshotBtns = document.querySelectorAll('.opm-inv-snapshot-btn').length;

      // Click Ping on first device row
      document.querySelector('.opm-inv-row-ping-btn')?.click();
      await new Promise(r => setTimeout(r, 500));
      const toolsModal = document.getElementById('opm-network-tools-modal');
      const pingModalVisible = toolsModal && toolsModal.style.display !== 'none';
      const targetIp = document.getElementById('tool-ping-ip')?.value;

      // Close tools modal
      document.getElementById('close-tools-modal-btn')?.click();
      await new Promise(r => setTimeout(r, 300));

      return {
        pingBtns,
        cliBtns,
        pollBtns,
        snapshotBtns,
        pingModalVisible,
        targetIp
      };
    })()
  `);
  console.log("Inventory Actions:", invRes);
  await captureScreenshot("screenshot_inventory_actions.png");

  console.log("\n=== TOTAL EXCEPTIONS COUNT ===", exceptions.length);
  exceptions.forEach(e => console.log("EXC:", e.text, e.exception?.description?.slice(0, 200)));

  setTimeout(() => {
    try { ws.close(); } catch(e) {}
    try { chrome.kill(); } catch(e) {}
    process.exit(0);
  }, 500);
})();
