const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9630",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);
  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((res, rej) => {
        const req = http.get("http://127.0.0.1:9630/json", r => {
          let d = ""; r.on("data", c => d += c); r.on("end", () => res(JSON.parse(d)));
        });
        req.on("error", rej);
      });
      if (targets && targets.length) break;
    } catch(e) {}
  }
  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  const errors = [];
  const logs = [];

  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));
  });

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.id === 1) {
      ws.send(JSON.stringify({ id: 4, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard" } }));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails);
    }
    if (msg.method === "Log.entryAdded") {
      logs.push(msg.params.entry);
    }
    if (msg.id === 20) {
      console.log("=== EVAL ON BROWSER ===");
      console.log("URL:", msg.result?.result?.value?.url);
      console.log("Title:", msg.result?.result?.value?.title);
      console.log("Has Suite:", msg.result?.result?.value?.hasSuite);
      console.log("Has Container:", msg.result?.result?.value?.hasContainer);
      console.log("Active Tab:", msg.result?.result?.value?.activeTab);
      console.log("Container Children:", msg.result?.result?.value?.childCount);
      console.log("Errors Count:", errors.length);
      errors.forEach(e => console.log("  ERROR:", e.text, e.exception?.description?.slice(0, 200)));
      console.log("Logs Count:", logs.length);
      logs.slice(0, 10).forEach(l => console.log("  LOG:", l.level, l.text));
      setTimeout(() => {
        try { ws.close(); } catch(e) {}
        try { chrome.kill(); } catch(e) {}
        process.exit(0);
      }, 500);
    }
  });

  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 20,
      method: "Runtime.evaluate",
      params: {
        expression: `({
          url: window.location.href,
          title: document.title,
          hasSuite: !!window.OpManagerSuite,
          hasContainer: !!document.getElementById('opm-custom-suite-container'),
          activeTab: window.OpManagerSuite?.state?.currentTab,
          childCount: document.getElementById('opm-custom-suite-container')?.children?.length
        })`,
        returnByValue: true
      }
    }));
  }, 4500);
})();
