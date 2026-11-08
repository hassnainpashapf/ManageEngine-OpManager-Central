const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

const artifactDir = "/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c";

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9689",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9689/json", res => {
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

  ws.on("open", () => {
    ws.send(JSON.stringify({ id: 1, method: "Page.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url: "http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard" } }));
  });

  function evaluate(expr) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 1000000);
      const listener = (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeListener("message", listener);
          resolve(msg.result?.result?.value);
        }
      };
      ws.on("message", listener);
      ws.send(JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: { expression: expr, returnByValue: true, awaitPromise: true }
      }));
    });
  }

  function captureScreenshot(filename) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 1000000);
      const listener = (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id === id) {
          ws.removeListener("message", listener);
          const buf = Buffer.from(msg.result.data, "base64");
          fs.writeFileSync(path.join(artifactDir, filename), buf);
          console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
          resolve();
        }
      };
      ws.on("message", listener);
      ws.send(JSON.stringify({
        id,
        method: "Page.captureScreenshot",
        params: { format: "png" }
      }));
    });
  }

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails);
    }
  });

  // Wait for initial load
  await new Promise(r => setTimeout(r, 3500));

  console.log("=== 1. TEST HEADER SOUND & HELP BUTTONS ===");
  const headerRes = await evaluate(`
    (() => {
      const soundBtn = document.getElementById('opm-header-sound-btn');
      const helpBtn = document.getElementById('opm-header-help-btn');
      const quickAddBtn = document.getElementById('opm-header-quickadd-btn');
      
      // Test sound toggle
      let initialSound = localStorage.getItem('opm_sound_enabled');
      if (soundBtn) soundBtn.click();
      let toggledSound = localStorage.getItem('opm_sound_enabled');

      return {
        hasSoundBtn: !!soundBtn,
        hasHelpBtn: !!helpBtn,
        hasQuickAddBtn: !!quickAddBtn,
        initialSound,
        toggledSound
      };
    })()
  `);
  console.log("Header Components:", headerRes);

  console.log("\n=== 2. TEST AUTHENTIC ABOUT MODAL VIA HELP (?) BUTTON ===");
  const aboutRes = await evaluate(`
    (() => {
      document.getElementById('opm-header-help-btn')?.click();
      const modal = document.getElementById('opm-about-modal');
      const isVisible = modal && modal.style.display !== 'none';
      const text = modal?.innerText;
      return {
        isVisible,
        hasBuild: text?.includes('129203'),
        hasPostgres: text?.includes('PostgreSQL'),
        hasJava: text?.includes('OpenJDK')
      };
    })()
  `);
  console.log("About Modal:", aboutRes);
  await captureScreenshot("screenshot_about_modal.png");

  // Close about modal
  await evaluate(`document.getElementById('about-ok-btn')?.click();`);

  console.log("\n=== 3. TEST SUBNET SWEEP DISCOVERY WIZARD ===");
  const subnetRes = await evaluate(`
    (() => {
      window.OpManagerSuite.showSubnetDiscoveryModal(1);
      const modal = document.getElementById('opm-subnet-discovery-modal');
      const isVisible = modal && modal.style.display !== 'none';
      const startIp = document.getElementById('disc-start-ip')?.value;
      const endIp = document.getElementById('disc-end-ip')?.value;
      return { isVisible, startIp, endIp };
    })()
  `);
  console.log("Subnet Discovery Modal:", subnetRes);
  await captureScreenshot("screenshot_subnet_discovery.png");

  // Run discovery sweep and verify staged devices
  const sweepRunRes = await evaluate(`
    (async () => {
      document.getElementById('start-subnet-disc-btn')?.click();
      await new Promise(r => setTimeout(r, 1600));
      const termText = document.getElementById('disc-terminal')?.innerText;
      const applyBtnVisible = document.getElementById('apply-subnet-disc-btn')?.style.display !== 'none';
      return {
        hasDiscoveredLogs: termText?.includes('[FOUND]'),
        applyBtnVisible
      };
    })()
  `);
  console.log("Sweep Execution Result:", sweepRunRes);

  // Close subnet discovery modal
  await evaluate(`document.getElementById('close-subnet-disc-btn')?.click();`);

  console.log("\n=== 4. TEST OPUTILS DIAGNOSTIC SUITE (PING / TRACE / MIB / TERMINAL) ===");
  const toolsRes = await evaluate(`
    (async () => {
      window.OpManagerSuite.showNetworkToolsModal('10.40.1.1', 'ping');
      const modal = document.getElementById('opm-network-tools-modal');
      const isVisible = modal && modal.style.display !== 'none';
      
      // Test Ping execution
      document.getElementById('tool-exec-ping-btn')?.click();
      await new Promise(r => setTimeout(r, 600));
      const pingOut = document.getElementById('tool-ping-out')?.innerText;
      
      // Test switch to MIB Browser
      document.querySelector('.tool-tab-btn[data-tool="mib"]')?.click();
      await new Promise(r => setTimeout(r, 300));
      document.getElementById('tool-exec-mib-btn')?.click();
      await new Promise(r => setTimeout(r, 600));
      const hasMibRows = document.querySelectorAll('#tool-mib-tbody tr').length;

      return {
        isVisible,
        pingHasReply: pingOut?.includes('Ping results'),
        hasMibRows
      };
    })()
  `);
  console.log("Diagnostic Tools Suite:", toolsRes);
  await captureScreenshot("screenshot_diagnostic_tools.png");

  // Close network tools modal
  await evaluate(`document.getElementById('close-tools-modal-btn')?.click();`);

  console.log("\n=== 5. TEST DEVICE SNAPSHOT 6 TABS & PERFORMANCE MONITORS ===");
  const devSnapshotRes = await evaluate(`
    (() => {
      window.OpManagerSuite.showDeviceSnapshotModal(1);
      const modal = document.getElementById('device-snapshot-modal');
      const isVisible = modal && modal.style.display !== 'none';
      const tabs = Array.from(modal.querySelectorAll('.snap-tab-item')).map(t => t.innerText.trim());
      
      // Click Monitors tab
      modal.querySelector('.snap-tab-item[data-tab="monitors"]')?.click();
      const hasMonitorsTable = !!modal.querySelector('#poll-all-monitors-btn');
      const monitorRows = modal.querySelectorAll('.test-mon-btn').length;

      return { isVisible, tabs, hasMonitorsTable, monitorRows };
    })()
  `);
  console.log("Device Snapshot Monitors:", devSnapshotRes);
  await captureScreenshot("screenshot_device_snapshot_monitors.png");

  // Close snapshot modal
  await evaluate(`document.getElementById('close-snapshot-btn')?.click();`);

  console.log("\n=== 6. TEST SETTINGS DIAGNOSTICS & MIB BROWSER SUBTAB ===");
  const settingsToolsRes = await evaluate(`
    (() => {
      window.location.hash = '#/settings';
      window.OpManagerSuite.handleRoute();
      document.querySelector('.opm-set-subtab-btn[data-sub="tools"]')?.click();
      const hasToolCards = document.querySelectorAll('.opm-tool-card').length;
      const hasMibTable = !!document.body.innerText.includes('Installed Enterprise MIB Modules');
      return {
        subtab: window.OpManagerSuite.state.subTabs.settings,
        hasToolCards,
        hasMibTable
      };
    })()
  `);
  console.log("Settings Tools Subtab:", settingsToolsRes);
  await captureScreenshot("screenshot_settings_tools_tab.png");

  console.log("\n=== 7. TEST AUTHENTIC LOGIN PAGE (/login.html) ===");
  await new Promise((resolve) => {
    ws.send(JSON.stringify({ id: 100, method: "Page.navigate", params: { url: "http://localhost:8060/login.html" } }));
    setTimeout(resolve, 2000);
  });

  const loginRes = await evaluate(`
    (() => {
      const username = document.getElementById('username')?.value;
      const password = document.getElementById('password')?.value;
      const probe = document.getElementById('probe')?.children.length;
      const domain = document.getElementById('domain')?.children.length;
      const submitBtn = document.getElementById('submitBtn')?.innerText;
      return {
        title: document.title,
        username,
        password,
        probeOptions: probe,
        domainOptions: domain,
        submitBtn
      };
    })()
  `);
  console.log("Login Page Inspection:", loginRes);
  await captureScreenshot("screenshot_login_page.png");

  console.log("\n=== 8. TOTAL EXCEPTIONS COUNT ===", exceptions.length);
  exceptions.forEach(e => console.log("EXC:", e.text, e.exception?.description?.slice(0, 200)));

  setTimeout(() => {
    try { ws.close(); } catch(e) {}
    try { chrome.kill(); } catch(e) {}
    process.exit(0);
  }, 500);
})();
