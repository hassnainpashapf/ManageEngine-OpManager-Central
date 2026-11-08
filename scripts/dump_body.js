const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9610",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);
  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((res, rej) => {
        const req = http.get("http://127.0.0.1:9610/json", r => {
          let d = ""; r.on("data", c => d += c); r.on("end", () => res(JSON.parse(d)));
        });
        req.on("error", rej);
      });
      if (targets && targets.length) break;
    } catch(e) {}
  }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));
    ws.send(JSON.stringify({ id: 4, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html" } }));
  });

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      console.log("=== EXCEPTION ===", msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    }
    if (msg.id === 10) {
      console.log("=== BODY HTML DUMP (first 2000 chars) ===");
      console.log(msg.result?.result?.value);
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
      params: { expression: "document.body.innerHTML.slice(0, 2000)" , returnByValue: true }
    }));
  }, 4000);
})();
