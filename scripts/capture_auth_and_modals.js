const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require(path.join(__dirname, "../node_modules/ws"));

async function capture() {
  const port = 9652;
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, res => {
          let d = "";
          res.on("data", c => (d += c));
          res.on("end", () => {
            try {
              resolve(JSON.parse(d));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on("error", reject);
      });
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const page = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on("open", r));
  let id = 1;
  const send = (m, p = {}) => new Promise(r => {
    const cur = id++;
    const h = data => {
      const msg = JSON.parse(data);
      if (msg.id === cur) { ws.off("message", h); r(msg.result); }
    };
    ws.on("message", h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/settings" });
  await new Promise(r => setTimeout(r, 3500));

  // 1. Users & Authentication subtab
  await send("Runtime.evaluate", { expression: `window.OpManagerSuite.state.subTabs.settings = 'users'; window.OpManagerSuite.renderSettingsView();` });
  await new Promise(r => setTimeout(r, 1000));
  const shot1 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c/screenshot_settings_users_rbac.png", Buffer.from(shot1.data, "base64"));
  console.log("Captured screenshot_settings_users_rbac.png");

  // 2. Discovery Rules Modal
  await send("Runtime.evaluate", { expression: `
    window.OpManagerSuite.state.subTabs.settings = 'discovery';
    window.OpManagerSuite.renderSettingsView();
    setTimeout(() => {
      const b = document.getElementById('opm-new-rule-btn');
      if (b) b.click();
    }, 200);
  ` });
  await new Promise(r => setTimeout(r, 1200));
  const shot2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c/screenshot_settings_discovery_modal.png", Buffer.from(shot2.data, "base64"));
  console.log("Captured screenshot_settings_discovery_modal.png");

  // 3. Add Custom Template Modal
  await send("Runtime.evaluate", { expression: `
    const c1 = document.getElementById('cancel-new-rule-btn');
    if (c1) c1.click();
    window.OpManagerSuite.state.subTabs.settings = 'templates';
    window.OpManagerSuite.renderSettingsView();
    setTimeout(() => {
      const b = document.getElementById('opm-new-template-btn');
      if (b) b.click();
    }, 200);
  ` });
  await new Promise(r => setTimeout(r, 1200));
  const shot3 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c/screenshot_settings_device_template_modal.png", Buffer.from(shot3.data, "base64"));
  console.log("Captured screenshot_settings_device_template_modal.png");

  ws.close();
  chrome.kill();
  console.log("All screenshots captured successfully.");
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
