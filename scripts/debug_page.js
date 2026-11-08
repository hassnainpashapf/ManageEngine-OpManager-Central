const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9605",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);
  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((res, rej) => {
        const req = http.get("http://127.0.0.1:9605/json", r => {
          let d = ""; r.on("data", c => d += c); r.on("end", () => res(JSON.parse(d)));
        });
        req.on("error", rej);
      });
      if (targets && targets.length) break;
    } catch(e) {}
  }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Console.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 4, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard" } }));
  });

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Console.messageAdded") {
      console.log("[CONSOLE]", msg.params.message.level, msg.params.message.text);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      console.log("[EXCEPTION]", JSON.stringify(msg.params.exceptionDetails));
    }
    if (msg.id === 10) {
      console.log("[EVAL RESULT]:", msg.result?.result?.value);
      setTimeout(() => {
        try { ws.close(); } catch(e) {}
        try { chrome.kill(); } catch(e) {}
        process.exit(0);
      }, 500);
    }
  });

  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 10,
      method: "Runtime.evaluate",
      params: { expression: "({ htmlLength: document.body.innerHTML.length, hasHeader: !!document.getElementById('main-header'), hasContainer: !!document.getElementById('opm-custom-suite-container'), url: window.location.href })" , returnByValue: true }
    }));
  }, 3500);
})();
