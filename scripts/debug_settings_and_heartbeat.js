const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

async function checkSettingsRoute() {
  const port = 9568;
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

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.on("open", r));

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = raw => {
      const msg = JSON.parse(raw);
      if (msg.id === id) { ws.off("message", handler); resolve(msg.result); }
    };
    ws.on("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const logs = [];
  ws.on("message", raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.method === "Runtime.consoleAPICalled") {
        logs.push({ type: msg.params.type, text: msg.params.args.map(a => a.value).join(" ") });
      }
    } catch(e) {}
  });

  await send("Page.enable");
  await send("Runtime.enable");

  console.log("Navigating to #/settings...");
  await send("Page.navigate", { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings" });
  await new Promise(r => setTimeout(r, 2500));

  const info = await send("Runtime.evaluate", {
    expression: `(() => {
      const c = document.getElementById('opm-custom-suite-container');
      const hash = window.location.hash;
      const title = document.title;
      const text = c ? c.innerText.slice(0, 500) : "NULL";
      const isConfig = text.includes("Compliance") || text.includes("NCM Module");
      const isSettings = text.includes("Central & Probes") || text.includes("Discovery Rules");
      const currentTab = window.OpManagerSuite ? window.OpManagerSuite.state.currentTab : null;
      return { hash, title, currentTab, isConfig, isSettings, preview: text.slice(0, 200) };
    })()`,
    returnByValue: true
  });

  console.log("Evaluation on #/settings:", JSON.stringify(info.result.value, null, 2));
  console.log("Console logs captured:", logs.filter(l => l.text.includes("warn") || l.text.includes("error") || l.text.includes("Heartbeat") || l.text.includes("Setting") || l.text.includes("Config")));

  ws.close();
  chrome.kill();
}

checkSettingsRoute().catch(console.error);
