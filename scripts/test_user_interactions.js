const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

(async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    "--remote-debugging-port=9688",
    "--window-size=1920,1080",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get("http://127.0.0.1:9688/json", res => {
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

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(msg.params.exceptionDetails);
    }
  });

  // Wait for initial load
  await new Promise(r => setTimeout(r, 3500));

  console.log("=== 1. TEST NAVIGATION TABS ===");
  const tabs = ['dashboard', 'inventory', 'alarms', 'maps', 'configuration', 'reports', 'settings'];
  for (const t of tabs) {
    const res = await evaluate(`
      (() => {
        window.location.hash = '#/${t}';
        window.OpManagerSuite.handleRoute();
        return {
          tab: window.OpManagerSuite.state.currentTab,
          title: document.title,
          containerChildren: document.getElementById('opm-custom-suite-container')?.children.length,
          hasHTML: !!document.getElementById('opm-custom-suite-container')?.innerHTML.length
        };
      })()
    `);
    console.log(`Tab [${t}]:`, res);
  }

  console.log("\n=== 2. TEST DEVICE SNAPSHOT MODAL ===");
  const devModalRes = await evaluate(`
    (() => {
      window.OpManagerSuite.showDeviceSnapshotModal(1);
      const modal = document.getElementById('device-snapshot-modal');
      const isVisible = modal && modal.style.display !== 'none';
      const tabs = Array.from(modal.querySelectorAll('.snap-tab-item')).map(t => t.innerText.trim());
      // click Performance tab
      modal.querySelector('.snap-tab-item[data-tab="performance"]')?.click();
      const perfContent = modal.querySelector('#snapshot-body-container')?.innerText.slice(0, 50);
      // close modal
      document.getElementById('close-snapshot-btn')?.click();
      const closed = modal.style.display === 'none';
      return { isVisible, tabs, perfContent, closed };
    })()
  `);
  console.log("Device Snapshot Modal:", devModalRes);

  console.log("\n=== 3. TEST ALARM DRAWER ===");
  const alarmDrawerRes = await evaluate(`
    (() => {
      window.location.hash = '#/alarms';
      window.OpManagerSuite.handleRoute();
      window.OpManagerSuite.openAlarmDrawer('alm_801');
      const drawer = document.getElementById('opm-alarm-drawer');
      const isVisible = drawer && drawer.style.display === 'flex';
      const title = drawer?.querySelector('h3, span')?.innerText;
      // close
      document.getElementById('opm-close-alarm-drawer')?.click();
      const closed = drawer?.style.display === 'none';
      return { isVisible, title, closed };
    })()
  `);
  console.log("Alarm Drawer:", alarmDrawerRes);

  console.log("\n=== 4. TEST ALL OTHER MODALS ===");
  const modalsRes = await evaluate(`
    (() => {
      // 1. Zia
      window.OpManagerSuite.showZiaAIModal();
      const hasZia = document.getElementById('opm-zia-modal')?.style.display !== 'none';
      document.getElementById('opm-zia-modal-close')?.click();

      // 2. Trap Viewer
      window.OpManagerSuite.showTrapViewerModal();
      const hasTrap = document.getElementById('opm-trap-viewer-modal')?.style.display !== 'none';
      document.getElementById('opm-trap-modal-close')?.click();

      // 3. Column Chooser
      window.OpManagerSuite.showColumnChooserModal();
      const hasCol = document.getElementById('opm-column-chooser-modal')?.style.display !== 'none';
      document.getElementById('opm-col-chooser-close')?.click();

      // 4. Add Device
      window.OpManagerSuite.showAddDeviceModal();
      const hasAddDev = document.getElementById('opm-add-dev-modal')?.style.display !== 'none';
      document.getElementById('close-add-dev-btn')?.click();

      return {
        zia: hasZia,
        trapViewer: hasTrap,
        columnChooser: hasCol,
        addDevice: hasAddDev
      };
    })()
  `);
  console.log("Modals:", modalsRes);

  console.log("\n=== 5. TEST INVENTORY CHECKBOXES & BULK ACTIONS ===");
  const bulkRes = await evaluate(`
    (() => {
      window.location.hash = '#/inventory';
      window.OpManagerSuite.handleRoute();
      const selectAll = document.getElementById('opm-inv-select-all');
      selectAll.click();
      const bulkBar = document.getElementById('opm-bulk-bar');
      const bulkCount = document.getElementById('opm-bulk-count')?.innerText;
      const barVisible = bulkBar?.style.display === 'flex';
      // test uncheck
      selectAll.click();
      const barHidden = bulkBar?.style.display === 'none';
      return { barVisible, bulkCount, barHidden };
    })()
  `);
  console.log("Inventory Bulk Selection:", bulkRes);

  console.log("\n=== 6. TEST SETTINGS AGENTS TABLE & LIVE TELEMETRY ===");
  const agentsRes = await evaluate(`
    (async () => {
      window.location.hash = '#/settings';
      window.OpManagerSuite.handleRoute();
      document.querySelector('.opm-set-subtab-btn[data-sub="agents"]')?.click();
      const hasAgentRow = !!document.body.innerText.includes('Hussnains-MacBook-Air.local');
      const hasAgentId = !!document.body.innerText.includes('AGT-DARWIN-1-D52F');
      
      // Test Poll Metrics button
      const pollBtn = document.getElementById('opm-agent-test-telemetry-btn');
      if (pollBtn) pollBtn.click();
      
      return { hasAgentRow, hasAgentId, pollBtnExists: !!pollBtn };
    })()
  `);
  console.log("Settings Agents:", agentsRes);

  console.log("\n=== 7. TEST DYNAMIC ADD WIDGET & ADD DEVICE ===");
  const addFeaturesRes = await evaluate(`
    (() => {
      // 1. Add Widget
      window.location.hash = '#/dashboard';
      window.OpManagerSuite.handleRoute();
      window.OpManagerSuite.showAddWidgetModal();
      const firstAddBtn = document.querySelector('.add-this-widget-btn');
      if (firstAddBtn) firstAddBtn.click();
      const hasCustomWidget = document.querySelectorAll('.opm-remove-widget-btn').length > 0;

      // 2. Add Device
      const initialDevCount = window.OpManagerSuite.state.devices.length;
      window.OpManagerSuite.showAddDeviceModal();
      document.getElementById('new-dev-ip').value = '10.99.99.1';
      document.getElementById('save-add-dev-btn')?.click();
      const newDevCount = window.OpManagerSuite.state.devices.length;

      return {
        hasCustomWidget,
        deviceAdded: newDevCount === initialDevCount + 1
      };
    })()
  `);
  console.log("Add Features:", addFeaturesRes);

  console.log("\n=== 8. TEST ALL SUBTABS ACROSS MAPS, CONFIG, REPORTS ===");
  const subtabsRes = await evaluate(`
    (() => {
      // Maps subtabs
      window.location.hash = '#/maps';
      window.OpManagerSuite.handleRoute();
      const mapSubs = ['business', 'floor', 'rack', 'layer2'];
      const mapRes = {};
      mapSubs.forEach(s => {
        document.querySelector('.opm-maps-subtab-btn[data-sub="' + s + '"]')?.click();
        mapRes[s] = window.OpManagerSuite.state.subTabs.maps === s;
      });

      // Config subtabs
      window.location.hash = '#/configuration';
      window.OpManagerSuite.handleRoute();
      const cfgSubs = ['compliance', 'changes', 'vulnerability', 'backups'];
      const cfgRes = {};
      cfgSubs.forEach(s => {
        document.querySelector('.opm-cfg-subtab-btn[data-sub="' + s + '"]')?.click();
        cfgRes[s] = window.OpManagerSuite.state.subTabs.configuration === s;
      });

      // Reports subtabs
      window.location.hash = '#/reports';
      window.OpManagerSuite.handleRoute();
      const repSubs = ['sla', 'performance', 'mttr', 'lifecycle'];
      const repRes = {};
      repSubs.forEach(s => {
        document.querySelector('.opm-rpt-subtab-btn[data-sub="' + s + '"]')?.click();
        repRes[s] = window.OpManagerSuite.state.subTabs.reports === s;
      });

      return { mapRes, cfgRes, repRes };
    })()
  `);
  console.log("Subtabs Verification:", subtabsRes);

  console.log("\n=== 9. TOTAL EXCEPTIONS COUNT ===", exceptions.length);
  exceptions.forEach(e => console.log("EXC:", e.text, e.exception?.description?.slice(0, 200)));

  setTimeout(() => {
    try { ws.close(); } catch(e) {}
    try { chrome.kill(); } catch(e) {}
    process.exit(0);
  }, 500);
})();
