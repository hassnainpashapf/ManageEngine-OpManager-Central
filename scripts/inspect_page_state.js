const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9622",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9622/json", res => {
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
  const consoleLogs = [];

  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));
    ws.send(JSON.stringify({ id: 4, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard" } }));
  });

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails);
    }
    if (msg.method === "Log.entryAdded") {
      consoleLogs.push(msg.params.entry);
    }
    if (msg.id === 100) {
      console.log("=== INSPECTION RESULT ===");
      console.log(JSON.stringify(msg.result?.result?.value, null, 2));
      console.log("=== EXCEPTIONS (" + exceptions.length + ") ===");
      exceptions.forEach(e => console.log(e.text, e.exception?.description?.slice(0, 300)));
      console.log("=== LOGS (" + consoleLogs.length + ") ===");
      consoleLogs.slice(-10).forEach(l => console.log(`[${l.level}] ${l.text}`));
      setTimeout(() => {
        try { ws.close(); } catch(e) {}
        try { chrome.kill(); } catch(e) {}
        process.exit(0);
      }, 500);
    }
  });

  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 100,
      method: "Runtime.evaluate",
      params: {
        expression: `({
          title: document.title,
          url: window.location.href,
          bodyChildren: Array.from(document.body.children).map(c => ({
            tag: c.tagName,
            id: c.id,
            className: c.className,
            childCount: c.children.length,
            htmlSlice: c.outerHTML.slice(0, 150)
          })),
          customContainer: !!document.getElementById('opm-custom-suite-container'),
          customContainerHTML: document.getElementById('opm-custom-suite-container')?.innerHTML?.slice(0, 500),
          headerExists: !!document.getElementById('main-header'),
          pageContainerExists: !!document.querySelector('.page-container')
        })`,
        returnByValue: true
      }
    }));
  }, 4000);
})();
