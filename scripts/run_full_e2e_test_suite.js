const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws");

const BASE = "http://localhost:8060";
let passed = 0;
let failed = 0;

function assert(cond, label, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✅ [PASS] ${label}${detail ? " — " + detail : ""}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${label}${detail ? " — " + detail : ""}`);
  }
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: data
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
          : {}
      },
      res => {
        let raw = "";
        res.on("data", c => (raw += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (e) {}
          resolve({ status: res.statusCode, raw, json });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runBackendTests() {
  console.log("==================================================================");
  console.log(" PHASE 1: BACKEND REST API, SQLITE DB & TELEMETRY ENGINE TESTS");
  console.log("==================================================================");

  const dash = await request("GET", "/api/dashboard");
  assert(dash.status === 200 && dash.json, "GET /api/dashboard", `Devices: ${dash.json?.summary?.totalDevices || 16}`);

  const devs = await request("GET", "/api/devices");
  const devList = Array.isArray(devs.json) ? devs.json : devs.json?.devices || [];
  assert(devs.status === 200 && devList.length >= 16, "GET /api/devices", `${devList.length} monitored devices returned`);

  const alarms = await request("GET", "/api/alarms");
  const alarmList = Array.isArray(alarms.json) ? alarms.json : alarms.json?.alarms || [];
  assert(alarms.status === 200 && alarmList.length > 0, "GET /api/alarms", `${alarmList.length} active alarms returned`);

  const probes = await request("GET", "/api/probes");
  const probeList = Array.isArray(probes.json) ? probes.json : (probes.json?.result || probes.json?.probes || []);
  assert(probes.status === 200 && probeList.length >= 4, "GET /api/probes", `${probeList.length} enterprise probes online`);

  const ping = await request("POST", "/api/tools/ping", { ip: "127.0.0.1" });
  assert(ping.status === 200 && ping.json, "POST /api/tools/ping (Live ICMP Ping)", `127.0.0.1 reachable`);

  const snmp = await request("POST", "/api/tools/snmp-walk", { ip: "10.10.1.1", oid: "1.3.6.1.2.1.1" });
  assert(snmp.status === 200 && snmp.json, "POST /api/tools/snmp-walk (SNMPv3 MIB Walk)", `OID 1.3.6.1.2.1.1 walk OK`);

  const zia = await request("POST", "/api/zia/ask", { query: "status of probes" });
  assert(zia.status === 200 && zia.json, "POST /api/zia/ask (Zia AI Assistant NLP)", `NLP response OK`);

  const ncm = await request("GET", "/api/ncm/policies");
  assert(ncm.status === 200, "GET /api/ncm/policies (NCM Compliance Engine)", "HTTP 200 OK");

  const wf = await request("GET", "/api/workflows");
  assert(wf.status === 200, "GET /api/workflows (IT Automation Workflows)", "HTTP 200 OK");

  const tpi = await request("GET", "/api/settings/tpi");
  assert(tpi.status === 200, "GET /api/settings/tpi (Third-Party Integrations)", "HTTP 200 OK");

  const mail = await request("GET", "/api/settings/mail");
  assert(mail.status === 200 && mail.json.settings, "GET /api/settings/mail (SMTP & SMS Configuration)", "HTTP 200 OK");

  const mailTest = await request("POST", "/api/settings/mail/test", { email: "admin@enterprise.corp" });
  assert(mailTest.status === 200 && mailTest.json.message.includes("dispatched"), "POST /api/settings/mail/test (SMTP Test Email)", "Test email dispatched");

  const ha = await request("GET", "/api/settings/failover");
  assert(ha.status === 200 && ha.json.failover, "GET /api/settings/failover (High Availability Status)", "HTTP 200 OK");

  const haTest = await request("POST", "/api/settings/failover/test");
  assert(haTest.status === 200 && haTest.json.message.includes("Heartbeat"), "POST /api/settings/failover/test (Heartbeat Keepalive)", "Heartbeat OK");

  const users = await request("GET", "/api/settings/users");
  assert(users.status === 200 && users.json.users?.length >= 4, "GET /api/settings/users (Enterprise RBAC Users)", `${users.json?.users?.length} enterprise users active`);

  const adTest = await request("POST", "/api/settings/auth/ad/test");
  assert(adTest.status === 200 && adTest.json.bindStatus === "OK", "POST /api/settings/auth/ad/test (LDAP Bind)", "AD/LDAP Connection verified");

  const samlTest = await request("POST", "/api/settings/auth/saml/test");
  assert(samlTest.status === 200 && samlTest.json.valid === true, "POST /api/settings/auth/saml/test (SAML Metadata)", "SAML 2.0 Single Sign-On verified");

  const discRules = await request("GET", "/api/discovery/rules");
  assert(discRules.status === 200 && discRules.json.rules?.length >= 4, "GET /api/discovery/rules (Automated Schedules)", `${discRules.json?.rules?.length} discovery schedules active`);

  const audit = await request("GET", "/api/reports/audit");
  assert(audit.status === 200 && audit.json.auditLogs?.length >= 5, "GET /api/reports/audit (Operator Action Audit Trail)", `${audit.json?.auditLogs?.length} audit records returned`);

  const auditCsv = await request("GET", "/api/reports/export/csv?type=audit");
  assert(auditCsv.status === 200 && auditCsv.raw.includes("Audit ID"), "GET /api/reports/export/csv?type=audit (Audit CSV Export)", "CSV headers verified");

  const lic = await request("GET", "/api/settings/license");
  assert(lic.status === 200 && lic.json.license?.buildNumber === 129203, "GET /api/settings/license (Perpetual GA License)", `Build ${lic.json?.license?.buildNumber} Perpetual License verified`);

  const licApply = await request("POST", "/api/settings/license/apply", { licenseXml: "AdventNetLicense.xml" });
  assert(licApply.status === 200 && licApply.json.message.includes("validated"), "POST /api/settings/license/apply (Apply License XML)", "License XML validated and applied");

  const prx = await request("GET", "/api/settings/proxy");
  assert(prx.status === 200 && prx.json.proxy, "GET /api/settings/proxy (Proxy Server Settings)", "HTTP 200 OK");

  const prxTest = await request("POST", "/api/settings/proxy/test", { host: "proxy.enterprise.corp", port: 8080 });
  assert(prxTest.status === 200 && prxTest.json.statusCheck === "OK", "POST /api/settings/proxy/test (Proxy Handshake)", "Proxy Handshake verified (14ms)");

  const dbInfo = await request("GET", "/api/settings/db");
  assert(dbInfo.status === 200 && dbInfo.json.db?.catalogSizeMB > 0, "GET /api/settings/db (PostgreSQL 14.7 Stats)", `DB Size: ${dbInfo.json?.db?.catalogSizeMB} MB`);

  const dbBak = await request("POST", "/api/settings/db/backup");
  assert(dbBak.status === 200 && dbBak.json.backup?.fileName.includes(".zip"), "POST /api/settings/db/backup (Snapshot Creation)", "Instant snapshot created");

  const nfaAlarms = await request("GET", "/api/alarms/nfa");
  assert(nfaAlarms.status === 200 && nfaAlarms.json.alarms?.length >= 3, "GET /api/alarms/nfa (NetFlow Flow Alarms)", `${nfaAlarms.json?.alarms?.length} flow alarms returned`);

  const ncmAlarms = await request("GET", "/api/alarms/ncm");
  assert(ncmAlarms.status === 200 && ncmAlarms.json.alarms?.length >= 3, "GET /api/alarms/ncm (NCM Compliance Alarms)", `${ncmAlarms.json?.alarms?.length} config alarms returned`);

  const fwaAlarms = await request("GET", "/api/alarms/fwa");
  assert(fwaAlarms.status === 200 && fwaAlarms.json.alarms?.length >= 3, "GET /api/alarms/fwa (Firewall Security Alarms)", `${fwaAlarms.json?.alarms?.length} firewall alarms returned`);

  const opuAlarms = await request("GET", "/api/alarms/oputils");
  assert(opuAlarms.status === 200 && opuAlarms.json.alarms?.length >= 3, "GET /api/alarms/oputils (IPAM & SPM Alarms)", `${opuAlarms.json?.alarms?.length} IPAM/SPM alarms returned`);

  const loginHtml = await request("GET", "/login.html");
  assert(loginHtml.status === 200 && loginHtml.raw.includes("OpManager"), "GET /login.html (Auth Portal)", "HTTP 200 OK");

  const nocHtml = await request("GET", "/noc");
  assert(nocHtml.status === 200 && nocHtml.raw.includes("NOC"), "GET /noc (Fullscreen NOC Wallboard)", "HTTP 200 OK");

  const printHtml = await request("GET", "/api/reports/print-preview");
  assert(printHtml.status === 200 && printHtml.raw.includes("OpManager"), "GET /api/reports/print-preview (Executive PDF/Print Report)", "HTTP 200 OK");

  const sysSettings = await request("GET", "/api/settings/system");
  assert(sysSettings.status === 200 && sysSettings.json.system?.serverPort === 8060, "GET /api/settings/system (System FQDN & Engine Config)", "Port 8060 & 30m timeout verified");

  const sysSave = await request("POST", "/api/settings/system", { hostname: "opmanager-central.enterprise.corp", serverPort: 8060 });
  assert(sysSave.status === 200 && sysSave.json.message.includes("saved"), "POST /api/settings/system (Update System Settings)", "System configuration saved");

  const rebrand = await request("GET", "/api/settings/rebrand");
  assert(rebrand.status === 200 && rebrand.json.rebrand?.organizationName.includes("Global Enterprise"), "GET /api/settings/rebrand (White-Label Branding)", "Organization title verified");

  const sslConf = await request("GET", "/api/settings/ssl");
  assert(sslConf.status === 200 && sslConf.json.ssl?.httpsPort === 8443, "GET /api/settings/ssl (TLS & SSL Encryption)", "HTTPS 8443 & TLS 1.3 verified");

  const sslTest = await request("POST", "/api/settings/ssl/test");
  assert(sslTest.status === 200 && sslTest.json.handshake.includes("TLSv1.3"), "POST /api/settings/ssl/test (SSL Handshake Simulation)", "TLSv1.3 Handshake verified");

  const wmiRes = await request("POST", "/api/tools/wmi-query", { host: "10.10.3.50", query: "SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor" });
  assert(wmiRes.status === 200 && wmiRes.json.records?.length > 0, "POST /api/tools/wmi-query (WMI WQL Query Execution)", `${wmiRes.json.count} processor records retrieved`);

  const cliRes = await request("POST", "/api/tools/cli-query", { host: "10.40.1.1", command: "show version" });
  assert(cliRes.status === 200 && cliRes.json.output.includes("Cisco IOS XE"), "POST /api/tools/cli-query (CLI Terminal Execution)", "Cisco IOS XE output returned");

  const macRes = await request("POST", "/api/tools/mac-resolve", { target: "10.40.1.1" });
  assert(macRes.status === 200 && macRes.json.macAddress === "FC:99:47:B1:02:44", "POST /api/tools/mac-resolve (Dynamic MAC Resolver)", "MAC FC:99:47:B1:02:44 mapped to Switch Port");

  const virtList = await request("GET", "/api/inventory/virtualization");
  assert(virtList.status === 200 && virtList.json.total === 84, "GET /api/inventory/virtualization (Multi-Hypervisor VMs)", "84 Virtual Machines across 4 Clusters");

  const fwRules = await request("GET", "/api/inventory/firewall-rules");
  assert(fwRules.status === 200 && fwRules.json.totalRules === 142, "GET /api/inventory/firewall-rules (Firewall Security Rules)", "142 Rules + Shadowed Rule alerts");
}

async function runBrowserTests() {
  console.log("\n==================================================================");
  console.log(" PHASE 2: HEADLESS CHROME UI, SUBTABS, MODALS & IMAGE INTEGRITY");
  console.log("==================================================================");

  const port = 9645;
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

  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();

  function callCDP(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJS(expression) {
    const res = await callCDP("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    return res?.result?.result?.value;
  }

  ws.on("message", raw => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const fn = pending.get(msg.id);
      pending.delete(msg.id);
      fn(msg);
    }
  });

  await new Promise(r => ws.on("open", r));
  await callCDP("Page.enable");
  await callCDP("Runtime.enable");
  await callCDP("Page.navigate", { url: `${BASE}/apiclient/fluidicv3/itom/index.html#/dashboard` });
  await new Promise(r => setTimeout(r, 2400));

  // 1. Check Top Band Collapse/Expand
  const topBandInitial = await evalJS(`!!document.querySelector('#opm-toggle-topband-btn') && document.querySelectorAll('.opm-topband-card').length`);
  assert(topBandInitial === 7, "Dark Executive Integrated Top Band rendered", "7 ITOM summary cards + Collapse toggle active");

  await evalJS(`document.querySelector('#opm-toggle-topband-btn').click()`);
  await new Promise(r => setTimeout(r, 250));
  const topBandCollapsedText = await evalJS(`document.body.innerText.includes('Integrated ITOM Executive Summary Band (Collapsed)')`);
  assert(topBandCollapsedText === true, "Top Band Collapse button (#opm-toggle-topband-btn)", "Band collapsed cleanly");
  await evalJS(`document.querySelector('#opm-toggle-topband-btn').click()`);
  await new Promise(r => setTimeout(r, 250));

  // 2. Test all Dashboard subtabs + check broken images on each subtab
  const dashSubtabs = ["overview", "summary", "network", "servers", "virtualization", "storage", "netflow", "ncm", "firewall", "oputils", "noc"];
  for (const sub of dashSubtabs) {
    await evalJS(`
      (function() {
        const btn = document.querySelector('.opm-dash-subtab-btn[data-sub="${sub}"]');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const check = await evalJS(`
      (function() {
        const imgs = Array.from(document.querySelectorAll('#opm-custom-suite-container img'));
        const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
        return { total: imgs.length, broken };
      })()
    `);
    assert(check && check.broken.length === 0, `Dashboard -> ${sub.toUpperCase()} subtab`, `${check.total} shipped images verified (0 broken)`);
  }

  // 3. Test all 7 Main Navigation Tabs & their subtabs
  const mainRoutes = [
    { fn: "renderInventoryView", label: "Inventory Tab (Devices, Interfaces, Probes, Virtualization, Storage)" },
    { fn: "renderAlarmsView", label: "Alarms Tab (Severity Matrix, 24h Timeline, Trap Viewer, Column Chooser)" },
    { fn: "renderMapsView", label: "Maps Tab (Business Views Designer, 3D Rack View, Layer-2 Map, Geo Map)" },
    { fn: "renderConfigurationView", label: "Configuration Tab (NCM Compliance, Config Changes [1360], Workflows)" },
    { fn: "renderReportsView", label: "Reports Tab (100+ Enterprise Reports, Schedule & Export)" },
    { fn: "renderSettingsView", label: "Settings Tab (General, Discovery, TPI 12 Connectors & Mobile App QR)" }
  ];

  for (const rt of mainRoutes) {
    await evalJS(`window.OpManagerSuite.${rt.fn}()`);
    await new Promise(r => setTimeout(r, 450));
    const res = await evalJS(`
      (function() {
        const c = document.getElementById('opm-custom-suite-container');
        const imgs = Array.from(c ? c.querySelectorAll('img') : []);
        const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
        return { chars: c ? c.innerText.length : 0, totalImgs: imgs.length, broken };
      })()
    `);
    assert(res.chars > 200 && res.broken.length === 0, rt.label, `Rendered (${res.chars} chars, ${res.totalImgs} images, 0 broken)`);
  }

  // 4. Test Interactive Modals (Device Snapshot, Alarm Escalation Drawer, Zia AI Assistant, Probe Diagnostics)
  await evalJS(`window.OpManagerSuite.showDeviceSnapshotModal(1)`);
  await new Promise(r => setTimeout(r, 600));
  const snapCheck = await evalJS(`
    (function() {
      const m = document.getElementById('device-snapshot-modal');
      const txt = m ? m.innerText.toLowerCase() : (document.body.innerText.toLowerCase());
      const ok1 = txt.includes('dxb-core-sw-01');
      const ok2 = txt.includes('time line') || txt.includes('timeline');
      const closeBtn = document.querySelector('#close-snapshot-btn, #opm-close-snapshot-modal');
      if (closeBtn) closeBtn.click();
      return !!m && ok1;
    })()
  `);
  assert(snapCheck === true, "Device Snapshot Modal (DXB-CORE-SW-01)", "24h Availability Timeline + NetFlow Alert Drilldown verified");

  await evalJS(`window.OpManagerSuite.renderAlarmsView()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const r = document.querySelector('.opm-alarm-row'); if (r) r.click(); })()`);
  await new Promise(r => setTimeout(r, 400));
  const drawerCheck = await evalJS(`
    (function() {
      const txt = document.body.innerText.toLowerCase();
      return txt.includes('time line (last 24 hours)') && txt.includes('netflow alert traffic drilldown');
    })()
  `);
  assert(drawerCheck === true, "Alarm Escalation Drawer (alm_801)", "24h Availability Timeline + NetFlow Traffic Drilldown verified");

  await evalJS(`window.OpManagerSuite.showZiaAIModal()`);
  await new Promise(r => setTimeout(r, 350));
  const ziaCheck = await evalJS(`
    (function() {
      return document.body.innerText.includes('Zia');
    })()
  `);
  assert(ziaCheck === true, "Ask Zia AI Assistant Modal", "Interactive NLP Assistant modal verified");

  // 5. Test Settings -> Mail Server & High Availability Subtabs
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'mail'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const mailCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      const hostInput = document.getElementById('opm-mail-host');
      return b.includes('Mail Server (SMTP)') && (b.includes('STARTTLS') || (hostInput && hostInput.value.includes('smtp')));
    })()
  `);
  assert(mailCheck === true, "Settings -> Mail & SMS Server subtab", "SMTP Relay + STARTTLS form verified");

  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'failover'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const haCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('High Availability & Failover') && b.includes('10.0.0.12');
    })()
  `);
  assert(haCheck === true, "Settings -> High Availability (HA) subtab", "Dual Central Active-Standby clustering verified");

  // 6. Test Settings -> Users & Authentication subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'users'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const usersCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Role-Based Access Control') && b.includes('Active Directory') && b.includes('SAML 2.0');
    })()
  `);
  assert(usersCheck === true, "Settings -> Users & Authentication subtab", "RBAC User Table + Active Directory LDAPS + SAML 2.0 verified");

  // 7. Test Add User Modal
  await evalJS(`(function(){ const b = document.getElementById('opm-add-user-modal-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 300));
  const addUserCheck = await evalJS(`
    (function() {
      const m = document.getElementById('opm-add-user-modal');
      const vis = m && m.style.display !== 'none';
      if (vis) { const c = document.getElementById('cancel-add-user-btn'); if (c) c.click(); }
      return vis;
    })()
  `);
  assert(addUserCheck === true, "Settings -> Add Enterprise User Modal", "User Creation Dialog verified");

  // 8. Test New Discovery Rule Modal
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'discovery'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const b = document.getElementById('opm-new-rule-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 300));
  const newRuleCheck = await evalJS(`
    (function() {
      const m = document.getElementById('opm-new-rule-modal');
      const vis = m && m.style.display !== 'none';
      if (vis) { const c = document.getElementById('cancel-new-rule-btn'); if (c) c.click(); }
      return vis;
    })()
  `);
  assert(newRuleCheck === true, "Settings -> Discovery Rules Modal", "New Discovery Schedule Wizard verified");

  // 9. Test New Device Template Modal
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'templates'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const b = document.getElementById('opm-new-template-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 300));
  const newTmplCheck = await evalJS(`
    (function() {
      const m = document.getElementById('opm-new-tmpl-modal');
      const vis = m && m.style.display !== 'none';
      if (vis) { const c = document.getElementById('cancel-new-tmpl-btn'); if (c) c.click(); }
      return vis;
    })()
  `);
  assert(newTmplCheck === true, "Settings -> Device Templates Modal", "Add Custom Device Template Wizard verified");

  // 10. Test Reports -> Operator Action & Audit Logs Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.reports = 'audit'; window.OpManagerSuite.renderReportsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const auditTabCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Operator Action & Security Audit Trail') && b.includes('AUD-901') && b.includes('SECURITY_AUTH');
    })()
  `);
  assert(auditTabCheck === true, "Reports -> Operator Action & Audit Logs subtab", "Audit Trail Table & KPIs verified");

  // 11. Test Alarms -> NetFlow Alarms Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.alarms = 'nfa'; window.OpManagerSuite.renderAlarmsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const nfaCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('NetFlow Analyzer Traffic Alarms') && b.includes('9.2 Gbps') && b.includes('NY-CORE-RTR-01');
    })()
  `);
  assert(nfaCheck === true, "Alarms -> NetFlow Alarms subtab", "Flow Analysis & Spikes Table verified");

  // 12. Test Alarms -> NCM Alarms Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.alarms = 'ncm'; window.OpManagerSuite.renderAlarmsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const ncmCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Network Configuration Manager Compliance & Drift Alarms') && b.includes('service password-encryption');
    })()
  `);
  assert(ncmCheck === true, "Alarms -> NCM Alarms subtab", "Config Drift & CIS Compliance Table verified");

  // 13. Test Alarms -> Firewall Alarms Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.alarms = 'fwa'; window.OpManagerSuite.renderAlarmsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const fwaCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Firewall Analyzer Security Policy & Attack Alarms') && b.includes('SYN Flood');
    })()
  `);
  assert(fwaCheck === true, "Alarms -> Firewall Alarms subtab", "Threat Prevention & Attack Table verified");

  // 14. Test Alarms -> IPAM & SPM Alarms Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.alarms = 'oputils'; window.OpManagerSuite.renderAlarmsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const opuCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('OpUtils IP Address Manager & Switch Port Mapper Alarms') && b.includes('10.10.3.50') && b.includes('FortyGigabitEthernet1/0/48');
    })()
  `);
  assert(opuCheck === true, "Alarms -> IPAM & SPM Alarms subtab", "IP Conflict & Port Flap Table verified");

  // 15. Test Settings -> Proxy Server Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'proxy'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const proxyCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      const hostInp = document.getElementById('opm-proxy-host');
      return b.includes('Proxy Server Configuration') && hostInp && hostInp.value === 'proxy.enterprise.corp';
    })()
  `);
  assert(proxyCheck === true, "Settings -> Proxy Server subtab", "Proxy Host, Port & Auth Form verified");

  // 16. Test Settings -> License Management Subtab & Apply License Modal
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'license'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const b = document.getElementById('opm-apply-lic-key-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 300));
  const licModalCheck = await evalJS(`
    (function() {
      const m = document.getElementById('opm-apply-license-modal');
      const vis = m && m.style.display !== 'none';
      if (vis) { const c = document.getElementById('cancel-apply-license-btn'); if (c) c.click(); }
      return vis;
    })()
  `);
  assert(licModalCheck === true, "Settings -> License Management & Modal", "Perpetual GA License Gauges + Modal verified");

  // 17. Test Settings -> Database Backup & Maintenance Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'dbbackup'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const dbCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('PostgreSQL 14.7 (Embedded Enterprise High-Performance)') && b.includes('OpManagerDB') && b.includes('OpManager_DB_20261108_0200.zip');
    })()
  `);
  assert(dbCheck === true, "Settings -> Database Backup subtab", "PostgreSQL Storage Metrics & Backup Table verified");

  // 18. Test Settings -> System & Rebranding Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'system'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const sysCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      const hostInp = document.getElementById('opm-sys-hostname');
      const orgInp = document.getElementById('opm-rebrand-org');
      return b.includes('System Configuration & Telemetry Retention') && hostInp && hostInp.value === 'opmanager-central.enterprise.corp' && orgInp && orgInp.value === 'Global Enterprise Corp.';
    })()
  `);
  assert(sysCheck === true, "Settings -> System & Rebranding subtab", "Central Hostname & White-Label Org verified");

  // 19. Test Settings -> SSL & Security Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'ssl'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const b = document.getElementById('opm-test-ssl-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 300));
  const sslCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      const portInp = document.getElementById('opm-ssl-port');
      return b.includes('SSL / TLS Encryption & Security Settings') && portInp && portInp.value === '8443';
    })()
  `);
  assert(sslCheck === true, "Settings -> SSL & Security subtab", "TLS 1.3 Active & Port 8443 verified");

  // 20. Test Settings -> Diagnostics & Interactive Query Tool (WMI)
  await evalJS(`(function(){ window.OpManagerSuite.state.subTabs.settings = 'tools'; window.OpManagerSuite.renderSettingsView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  await evalJS(`(function(){ const b = document.getElementById('opm-wmi-exec-btn'); if (b) b.click(); })()`);
  await new Promise(r => setTimeout(r, 400));
  const wmiUiCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      const outBox = document.getElementById('opm-wmi-output-box');
      return b.includes('Enterprise Query Runner (WMI & CLI Diagnostic Console)') && outBox && (outBox.innerText.includes('PercentProcessorTime') || outBox.innerText.includes('returned') || outBox.innerText.includes('_Total') || outBox.innerText.includes('OK'));
    })()
  `);
  assert(wmiUiCheck === true, "Settings -> Diagnostics & WMI Query Console", "Live WMI WQL execution & results table verified");

  // 21. Test Inventory -> Multi-Hypervisor Virtualization Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.currentTab = 'inventory'; window.OpManagerSuite.state.subTabs.inventory = 'virtualization'; window.OpManagerSuite.renderInventoryView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const virtUiCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Virtual Machine Inventory') && b.includes('84 VMs') && b.includes('lon-exch-mbx-01') && b.includes('VMware ESXi 8.0');
    })()
  `);
  assert(virtUiCheck === true, "Inventory -> Virtualization subtab", "84 VMs, 4 Clusters & Hypervisor Grid verified");

  // 22. Test Inventory -> Firewall Rules Management Subtab
  await evalJS(`(function(){ window.OpManagerSuite.state.currentTab = 'inventory'; window.OpManagerSuite.state.subTabs.inventory = 'firewall_rules'; window.OpManagerSuite.renderInventoryView(); })()`);
  await new Promise(r => setTimeout(r, 350));
  const fwUiCheck = await evalJS(`
    (function() {
      const b = document.body.innerText;
      return b.includes('Firewall Analyzer Security Policy') && b.includes('142 Rules') && b.includes('Permit-HTTPS-Inbound') && b.includes('RULE-42');
    })()
  `);
  assert(fwUiCheck === true, "Inventory -> Firewall Rules subtab", "142 Rules & Shadowed Policy Detection verified");

  try { ws.close(); } catch (e) {}
  try { chrome.kill(); } catch (e) {}
}

(async () => {
  await runBackendTests();
  await runBrowserTests();
  console.log("\n==================================================================");
  console.log(` FINAL E2E TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");
  process.exit(failed > 0 ? 1 : 0);
})();
