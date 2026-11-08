const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("../node_modules/ws");

async function run() {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9225",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9225/json", (res) => {
          let data = "";
          res.on("data", chunk => data += chunk);
          res.on("end", () => {
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        });
        req.on("error", reject);
      });
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || !targets[0]) {
    console.error("Failed to connect to Chrome");
    chrome.kill();
    return;
  }

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);

  let msgId = 1;
  function send(method, params = {}, customId) {
    const id = customId !== undefined ? customId : msgId++;
    ws.send(JSON.stringify({ id, method, params }));
    return id;
  }

  ws.on("open", () => {
    send("Runtime.enable");
    send("Page.enable");
    send("Network.enable");
    send("Page.navigate", { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/" });
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.method === "Network.requestWillBeSent") {
      const u = msg.params.request.url;
      if (!u.endsWith(".js") && !u.endsWith(".css") && !u.endsWith(".svg") && !u.endsWith(".ico") && !u.endsWith(".woff2")) {
        console.log("[REQ]", msg.params.request.method, u);
      }
    } else if (msg.method === "Network.responseReceived") {
      const res = msg.params.response;
      if (res.status >= 400) {
        console.warn("[HTTP ERR]", res.status, res.url);
      }
    } else if (msg.method === "Runtime.consoleAPICalled") {
      console.log("[CONSOLE]", msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(" "));
    } else if (msg.id === 999 && msg.result?.result) {
      console.log("ALARM PAGE EVAL:\n", msg.result.result.value);
    }
  });

  setTimeout(() => {
    send("Runtime.evaluate", {
      expression: `JSON.stringify({
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000),
        grid: !!document.querySelector(".ui-jqgrid"),
        gridRows: document.querySelectorAll(".jqgrow").length,
        navTabs: Array.from(document.querySelectorAll("#main-nav li a .menu-name")).map(e => e.innerText.trim()).filter(Boolean)
      }, null, 2)`,
      returnByValue: true
    }, 999);
    setTimeout(() => {
      chrome.kill();
      process.exit(0);
    }, 3000);
  }, 7000);
}

run();
