const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("../node_modules/ws");

let portCounter = 9230;

async function testPage(url, screenshotPath, waitTime = 4000) {
  const port = ++portCounter;
  console.log(`\n================ Testing: ${url} (port ${port}) ================`);
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, (res) => {
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
    console.error(`Chrome failed to start on ${port}`);
    chrome.kill();
    return;
  }

  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  function send(method, params = {}, customId) {
    const id = customId !== undefined ? customId : msgId++;
    ws.send(JSON.stringify({ id, method, params }));
    return id;
  }

  await new Promise((resolve) => {
    ws.on("open", () => {
      send("Runtime.enable");
      send("Page.enable");
      send("Page.navigate", { url });
    });

    ws.on("message", (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
        console.error("  [PAGE ERROR]", msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(" "));
      } else if (msg.id === 888 && msg.result?.data) {
        require("fs").writeFileSync(screenshotPath, Buffer.from(msg.result.data, "base64"));
        console.log(`  [SCREENSHOT SAVED]: ${screenshotPath}`);
      } else if (msg.id === 999 && msg.result?.result) {
        console.log("  [EVAL RESULT]:", msg.result.result.value);
        // Take screenshot
        send("Page.captureScreenshot", { format: "png" }, 888);
        setTimeout(() => {
          ws.close();
          chrome.kill();
          resolve();
        }, 1500);
      }
    });

    setTimeout(() => {
      send("Runtime.evaluate", {
        expression: `JSON.stringify({
          title: document.title,
          textSummary: document.body.innerText.replace(/\\s+/g, ' ').substring(0, 300),
          cardsCount: document.querySelectorAll('.card, .stat-card').length,
          tablesCount: document.querySelectorAll('table, .ui-jqgrid').length,
          rowsCount: document.querySelectorAll('tr, .jqgrow').length
        })`,
        returnByValue: true
      }, 999);
    }, waitTime);
  });
}

async function runAll() {
  await testPage("http://localhost:8060/apiclient/ember/index.jsp#/Home/Dashboard/Overview", "/tmp/screenshot_dashboard.png", 3500);
  await testPage("http://localhost:8060/apiclient/ember/index.jsp#/Inventory/List/Network/Devices", "/tmp/screenshot_inventory.png", 3500);
  await testPage("http://localhost:8060/apiclient/fluidicv3/itom/index.html#/alarms/list/active", "/tmp/screenshot_alarms.png", 6500);
  console.log("\nAll 3 tests completed successfully!");
}

runAll();
