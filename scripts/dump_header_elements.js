const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

async function dumpHeader() {
  const port = 9569;
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

  await send("Page.enable");
  await send("Runtime.enable");

  await send("Page.navigate", { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard" });
  await new Promise(r => setTimeout(r, 2000));

  const headerInfo = await send("Runtime.evaluate", {
    expression: `(() => {
      const links = Array.from(document.querySelectorAll('#main-header a, #main-header li, #main-header button')).map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').trim(),
        href: el.getAttribute('href'),
        id: el.id,
        className: el.className,
        dataFsoqa: el.getAttribute('data-fsoqa')
      }));
      return links.filter(l => l.text.length > 0 || l.dataFsoqa);
    })()`,
    returnByValue: true
  });

  console.log("Header links and buttons:", JSON.stringify(headerInfo.result.value, null, 2));

  ws.close();
  chrome.kill();
}

dumpHeader().catch(console.error);
