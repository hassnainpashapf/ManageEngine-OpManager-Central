const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require(path.join(__dirname, "../node_modules/ws"));

const BRAIN_DIR = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

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
  await new Promise(r => setTimeout(r, 3000));

  // 1. Settings -> System & Rebranding
  await send("Runtime.evaluate", { expression: `window.OpManagerSuite.state.subTabs.settings = 'system'; window.OpManagerSuite.renderSettingsView();` });
  await new Promise(r => setTimeout(r, 600));
  const shot1 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(BRAIN_DIR, "screenshot_settings_system_rebrand.png"), Buffer.from(shot1.data, "base64"));
  console.log("Captured screenshot_settings_system_rebrand.png");

  // 2. Settings -> SSL & Security Settings
  await send("Runtime.evaluate", { expression: `window.OpManagerSuite.state.subTabs.settings = 'ssl'; window.OpManagerSuite.renderSettingsView();` });
  await new Promise(r => setTimeout(r, 600));
  const shot2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(BRAIN_DIR, "screenshot_settings_ssl_security.png"), Buffer.from(shot2.data, "base64"));
  console.log("Captured screenshot_settings_ssl_security.png");

  // 3. Settings -> Diagnostics & WMI Query Execution Console
  await send("Runtime.evaluate", { expression: `
    window.OpManagerSuite.state.subTabs.settings = 'tools';
    window.OpManagerSuite.renderSettingsView();
    setTimeout(() => {
      const b = document.getElementById('opm-wmi-exec-btn');
      if (b) b.click();
    }, 200);
  ` });
  await new Promise(r => setTimeout(r, 1200));
  const shot3 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(BRAIN_DIR, "screenshot_tools_wmi_query.png"), Buffer.from(shot3.data, "base64"));
  console.log("Captured screenshot_tools_wmi_query.png");

  // 4. Inventory -> Multi-Hypervisor Virtualization Grid
  await send("Runtime.evaluate", { expression: `
    window.OpManagerSuite.state.currentTab = 'inventory';
    window.OpManagerSuite.state.subTabs.inventory = 'virtualization';
    window.OpManagerSuite.renderInventoryView();
  ` });
  await new Promise(r => setTimeout(r, 800));
  const shot4 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(BRAIN_DIR, "screenshot_inventory_virtualization.png"), Buffer.from(shot4.data, "base64"));
  console.log("Captured screenshot_inventory_virtualization.png");

  // 5. Inventory -> Firewall Rules Management
  await send("Runtime.evaluate", { expression: `
    window.OpManagerSuite.state.currentTab = 'inventory';
    window.OpManagerSuite.state.subTabs.inventory = 'firewall_rules';
    window.OpManagerSuite.renderInventoryView();
  ` });
  await new Promise(r => setTimeout(r, 800));
  const shot5 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(BRAIN_DIR, "screenshot_inventory_firewall_rules.png"), Buffer.from(shot5.data, "base64"));
  console.log("Captured screenshot_inventory_firewall_rules.png");

  ws.close();
  chrome.kill();
  console.log("All 5 visual proof screenshots captured successfully!");
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
