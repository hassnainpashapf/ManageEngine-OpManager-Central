const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("../node_modules/ws");

async function checkAppContainers() {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9251",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const targets = await new Promise((resolve) => {
    http.get("http://127.0.0.1:9251/json", (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    });
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.on("open", r));

  ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
  ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
  ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/alarms/list/active" } }));

  await new Promise(r => setTimeout(r, 4500));

  ws.send(JSON.stringify({
    id: 4,
    method: "Runtime.evaluate",
    params: {
      expression: `(() => {
        const root = document.querySelector(".ember-ui-library");
        if (!root) return "No .ember-ui-library found";
        return Array.from(root.children).map(c => ({
          tag: c.tagName,
          id: c.id,
          className: c.className,
          innerHTMLPreview: c.innerHTML.substring(0, 150)
        }));
      })()`,
      returnByValue: true
    }
  }));

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id === 4) {
      console.log(JSON.stringify(msg.result.result.value, null, 2));
      chrome.kill();
      process.exit(0);
    }
  });
}

checkAppContainers();
