const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");
const fs = require("fs");
const path = require("path");

const port = 9811;
const dataDir = `/tmp/c-set-verify-${Date.now()}`;
const screenshotPath = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c/screenshot_settings_verified_view.png";

async function main() {
  console.log("=== VERIFYING #/settings AND WEBSOCKET HEARTBEAT ===");

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1680,1050",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    `--user-data-dir=${dataDir}`,
    "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings"
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
    console.error("Chrome page target failed to launch!");
    chrome.kill();
    process.exit(1);
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

  const consoleLogs = [];
  const heartbeatWarnings = [];

  await new Promise(resolve => ws.on("open", resolve));

  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        const text = msg.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || "")).join(" ");
        const entry = { type: msg.params.type, text };
        consoleLogs.push(entry);
        if (text.toLowerCase().includes("heartbeat") || text.toLowerCase().includes("no pong")) {
          heartbeatWarnings.push(entry);
        }
      }
      if (msg.method === "Log.entryAdded") {
        const entry = { type: msg.params.entry.level, text: msg.params.entry.text };
        consoleLogs.push(entry);
        if (entry.text && (entry.text.toLowerCase().includes("heartbeat") || entry.text.toLowerCase().includes("no pong"))) {
          heartbeatWarnings.push(entry);
        }
      }
    } catch(e) {}
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  console.log("1. Navigating to http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings ...");
  await send("Page.navigate", { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings" });

  console.log("2. Waiting 5s for page and Ember suite initialization...");
  await new Promise(r => setTimeout(r, 5000));

  console.log("3. Inspecting DOM state for Settings page...");
  const domState = await send("Runtime.evaluate", {
    expression: `(() => {
      const c = document.getElementById("opm-custom-suite-container");
      const activeTab = window.OpManagerSuite ? window.OpManagerSuite.state.currentTab : null;
      const subtabBtns = Array.from(document.querySelectorAll(".opm-set-subtab-btn")).map(b => b.innerText.trim());
      const hasCentralProbes = c ? c.innerText.includes("Central & Probes") : false;
      const hasEnterpriseAdmin = c ? c.innerText.includes("Enterprise Admin Console") : false;
      const hasNcmLeak = c ? c.innerText.includes("Startup-Running Conflict Diff") : false;
      return {
        url: window.location.href,
        hash: window.location.hash,
        title: document.title,
        activeTab: activeTab,
        containerFound: !!c,
        subtabsCount: subtabBtns.length,
        subtabs: subtabBtns,
        hasCentralProbes: hasCentralProbes,
        hasEnterpriseAdmin: hasEnterpriseAdmin,
        hasNcmLeak: hasNcmLeak
      };
    })()`,
    returnByValue: true
  });

  console.log("DOM State:", JSON.stringify(domState.result.value, null, 2));

  console.log("4. Observing WebSocket Heartbeat for 15 seconds...");
  await new Promise(r => setTimeout(r, 15000));

  console.log("\n=== VERIFICATION RESULTS ===");
  console.log(`Settings Route Title: "${domState.result.value.title}"`);
  console.log(`Active Suite Tab: "${domState.result.value.activeTab}"`);
  console.log(`Subtabs Count: ${domState.result.value.subtabsCount}`);
  console.log(`Has Central & Probes Section: ${domState.result.value.hasCentralProbes}`);
  console.log(`Has NCM Leakage: ${domState.result.value.hasNcmLeak}`);
  console.log(`Heartbeat Warnings Detected (15s): ${heartbeatWarnings.length}`);

  if (heartbeatWarnings.length > 0) {
    console.error("FAIL: Heartbeat warnings found:", heartbeatWarnings);
  } else {
    console.log("PASS: 0 Heartbeat warnings received!");
  }

  console.log("5. Capturing verified screenshot...");
  const ss = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(screenshotPath, Buffer.from(ss.data, "base64"));
  console.log(`Screenshot saved to ${screenshotPath}`);

  ws.close();
  chrome.kill();

  if (
    domState.result.value.activeTab === "settings" &&
    domState.result.value.hasCentralProbes &&
    !domState.result.value.hasNcmLeak &&
    heartbeatWarnings.length === 0
  ) {
    console.log("\n>>> ALL CHECKS PASSED SUCCESSFULLY! <<<");
    process.exit(0);
  } else {
    console.error("\n>>> VERIFICATION FAILED! <<<");
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Error running verification:", err);
  process.exit(1);
});
