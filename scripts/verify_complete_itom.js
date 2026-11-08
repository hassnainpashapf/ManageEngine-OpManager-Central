const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("../node_modules/ws");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

const testCases = [
  {
    name: "Dashboard",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard",
    screenshot: path.join(artifactDir, "screenshot_dashboard.png"),
    checkText: "Distributed Probes Health & Sync"
  },
  {
    name: "Inventory",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/inventory",
    screenshot: path.join(artifactDir, "screenshot_inventory.png"),
    checkText: "Interfaces (48)"
  },
  {
    name: "Alarms",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/alarms/list/active",
    screenshot: path.join(artifactDir, "screenshot_alarms.png"),
    checkText: "Active Alarms"
  },
  {
    name: "Maps",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/maps",
    screenshot: path.join(artifactDir, "screenshot_maps.png"),
    checkText: "Business Views"
  },
  {
    name: "Configuration",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/configuration",
    screenshot: path.join(artifactDir, "screenshot_configuration.png"),
    checkText: "PCI-DSS 4.0 STANDARD"
  },
  {
    name: "Settings",
    url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings",
    screenshot: path.join(artifactDir, "screenshot_settings.png"),
    checkText: "Official Monitoring Agents"
  }
];

let portCounter = 9260;

async function runTest(testCase) {
  const port = ++portCounter;
  console.log(`\n================ Testing: ${testCase.name} (${testCase.url}) on port ${port} ================`);
  
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 250));
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
    return false;
  }

  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  return new Promise((resolve) => {
    let msgId = 1;
    function send(method, params = {}) {
      const id = msgId++;
      ws.send(JSON.stringify({ id, method, params }));
      return id;
    }

    const errors = [];
    ws.on("open", () => {
      send("Runtime.enable");
      send("Page.enable");
      send("Page.navigate", { url: testCase.url });
    });

    ws.on("message", (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
        errors.push(msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(" "));
      }
    });

    // Wait 4.5 seconds for Ember and custom suite to render
    setTimeout(() => {
      const evalId = send("Runtime.evaluate", {
        expression: `(() => {
          const bodyText = document.body.innerText || "";
          const is404 = bodyText.includes("404 - Page Not Found") || bodyText.includes("does not exist");
          const hasCheck = bodyText.includes("${testCase.checkText}");
          const header = document.querySelector("#main-header");
          const title = document.title;
          const tablesCount = document.querySelectorAll("table, .ui-jqgrid").length;
          const rowsCount = document.querySelectorAll("tr, .jqgrow").length;
          return JSON.stringify({ is404, hasCheck, title, tablesCount, rowsCount, textSnippet: bodyText.slice(0, 200).replace(/\\s+/g, " ") });
        })()`,
        returnByValue: true
      });

      const messageHandler = (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id === evalId) {
          const evalRes = JSON.parse(msg.result?.result?.value || "{}");
          console.log("  [EVAL RESULT]:", evalRes);

          // Capture screenshot
          const shotId = send("Page.captureScreenshot", { format: "png" });
          const shotHandler = (raw2) => {
            const msg2 = JSON.parse(raw2);
            if (msg2.id === shotId && msg2.result?.data) {
              fs.writeFileSync(testCase.screenshot, Buffer.from(msg2.result.data, "base64"));
              console.log(`  [SCREENSHOT SAVED]: ${testCase.screenshot}`);
              ws.off("message", shotHandler);
              ws.close();
              chrome.kill();
              resolve(!evalRes.is404 && evalRes.hasCheck);
            }
          };
          ws.on("message", shotHandler);
        }
      };
      ws.on("message", messageHandler);
    }, 4500);
  });
}

async function runAll() {
  let passed = 0;
  for (const tc of testCases) {
    const success = await runTest(tc);
    if (success) passed++;
  }
  console.log(`\n================ Test Summary: ${passed} / ${testCases.length} Passed ================`);
  process.exit(passed === testCases.length ? 0 : 1);
}

runAll();
