const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9658;
const targetBaseUrl = 'http://192.168.30.65:8060/apiclient/fluidicv3/itom/index.html';
const userDataDir = `/tmp/chrome-test-audit-${Date.now()}`;

async function main() {
  console.log('--- AUDITING ALL PAGES & TABS AGAINST REAL OPMANAGER CENTRAL SPEC ---');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1600,1000'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => {
            try { resolve(JSON.parse(d)); } catch(e) { reject(e); }
          });
        });
        req.on('error', reject);
      });
      if (targets && targets.length > 0) break;
    } catch(e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.on('open', resolve));

  let msgId = 1;
  const pendingRequests = new Map();

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
      }
    } catch(e) {}
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const jsErrors = [];
  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.method === 'Runtime.exceptionThrown') {
        jsErrors.push(msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception ? ' ' + msg.params.exceptionDetails.exception.description : ''));
      }
    } catch(e) {}
  });

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res && res.result ? res.result.value : null;
  }

  const routesToTest = [
    { tab: 'Dashboard', sub: 'Overview', hash: '#/dashboard' },
    { tab: 'Dashboard', sub: 'Summary', hash: '#/dashboard/summary' },
    { tab: 'Dashboard', sub: 'Network', hash: '#/dashboard/network' },
    { tab: 'Dashboard', sub: 'Servers', hash: '#/dashboard/servers' },
    { tab: 'Dashboard', sub: 'Virtualization', hash: '#/dashboard/virtualization' },
    { tab: 'Dashboard', sub: 'Storage', hash: '#/dashboard/storage' },
    { tab: 'Dashboard', sub: 'NetFlow', hash: '#/dashboard/netflow' },
    { tab: 'Dashboard', sub: 'NCM', hash: '#/dashboard/ncm' },
    { tab: 'Dashboard', sub: 'Firewall', hash: '#/dashboard/firewall' },
    { tab: 'Dashboard', sub: 'OpUtils', hash: '#/dashboard/oputils' },
    
    { tab: 'Inventory', sub: 'Devices', hash: '#/inventory' },
    { tab: 'Inventory', sub: 'Interfaces', hash: '#/inventory/interfaces' },
    { tab: 'Inventory', sub: 'Virtualization', hash: '#/inventory/virtualization' },
    { tab: 'Inventory', sub: 'Storage', hash: '#/inventory/storage' },

    { tab: 'Alarms', sub: 'Active Alarms', hash: '#/alarms' },
    { tab: 'Alarms', sub: 'All Alarms', hash: '#/alarms/all' },
    { tab: 'Alarms', sub: 'Events', hash: '#/alarms/events' },
    { tab: 'Alarms', sub: 'Traps', hash: '#/alarms/traps' },
    { tab: 'Alarms', sub: 'OpUtils Alarms', hash: '#/alarms/oputils' },

    { tab: 'Maps', sub: 'Business Views', hash: '#/maps' },
    { tab: 'Maps', sub: '3D Floor', hash: '#/maps/floor' },
    { tab: 'Maps', sub: '3D Rack', hash: '#/maps/rack' },
    { tab: 'Maps', sub: 'Layer 2 STP', hash: '#/maps/layer2' },
    { tab: 'Maps', sub: 'World Map', hash: '#/maps/world' },

    { tab: 'Configuration', sub: 'Compliance', hash: '#/configuration' },
    { tab: 'Configuration', sub: 'Config Changes', hash: '#/configuration/changes' },
    { tab: 'Configuration', sub: 'Vulnerabilities', hash: '#/configuration/vulnerabilities' },
    { tab: 'Configuration', sub: 'Backups', hash: '#/configuration/backups' },
    { tab: 'Configuration', sub: 'Workflows', hash: '#/configuration/workflows' },

    { tab: 'Reports', sub: 'SLA Reports', hash: '#/reports' },
    { tab: 'Reports', sub: 'Performance Reports', hash: '#/reports/performance' },
    { tab: 'Reports', sub: 'Capacity Planning', hash: '#/reports/capacity' },
    { tab: 'Reports', sub: 'Inventory Reports', hash: '#/reports/inventory' },
    { tab: 'Reports', sub: 'Scheduled Reports', hash: '#/reports/scheduled' },
    { tab: 'Reports', sub: 'Custom Query', hash: '#/reports/custom' },

    { tab: 'Settings', sub: 'Central & Probes', hash: '#/settings' },
    { tab: 'Settings', sub: 'Monitoring Agents', hash: '#/settings/agents' },
    { tab: 'Settings', sub: 'Discovery Rules', hash: '#/settings/discovery' },
    { tab: 'Settings', sub: 'Credential Library', hash: '#/settings/credentials' },
    { tab: 'Settings', sub: 'Device Templates', hash: '#/settings/templates' },
    { tab: 'Settings', sub: 'Notifications & Thresholds', hash: '#/settings/notifications' },
    { tab: 'Settings', sub: 'Mail & SMS Server', hash: '#/settings/mail' },
    { tab: 'Settings', sub: 'Proxy Server', hash: '#/settings/proxy' },
    { tab: 'Settings', sub: 'Users & Authentication', hash: '#/settings/users' },
    { tab: 'Settings', sub: 'License Management', hash: '#/settings/license' },
    { tab: 'Settings', sub: 'Database Maintenance', hash: '#/settings/dbbackup' },
    { tab: 'Settings', sub: 'High Availability', hash: '#/settings/failover' },
    { tab: 'Settings', sub: 'System & Rebranding', hash: '#/settings/rebrand' },
    { tab: 'Settings', sub: 'SSL & Security', hash: '#/settings/ssl' },
    { tab: 'Settings', sub: 'Diagnostics & MIB Browser', hash: '#/settings/tools' },
    { tab: 'Settings', sub: 'Support & System Logs', hash: '#/settings/support' }
  ];

  console.log(`Auditing ${routesToTest.length} routes/subtabs on CT 108...`);

  const results = [];
  for (const r of routesToTest) {
    const url = targetBaseUrl + r.hash;
    await send('Page.navigate', { url });
    await new Promise(resolve => setTimeout(resolve, 800));

    const check = await evaluate(`(() => {
      const container = document.getElementById('opm-custom-suite-container');
      const textLen = container ? container.innerText.trim().length : 0;
      const buttons = container ? container.querySelectorAll('button').length : 0;
      const tables = container ? container.querySelectorAll('table').length : 0;
      const inputs = container ? container.querySelectorAll('input, select, textarea').length : 0;
      return {
        rendered: !!container && textLen > 20,
        textLen,
        buttons,
        tables,
        inputs,
        firstHeading: container ? (container.querySelector('h1, h2, h3, h4, [style*="font-weight: 800"], [style*="font-weight: 700"]') ? container.querySelector('h1, h2, h3, h4, [style*="font-weight: 800"], [style*="font-weight: 700"]').innerText.trim() : '') : ''
      };
    })()`);

    results.push({
      tab: r.tab,
      sub: r.sub,
      hash: r.hash,
      ...check
    });
    console.log(`[${check && check.rendered ? '✓' : '✗'}] ${r.tab} > ${r.sub} (${r.hash}) - ${check ? check.firstHeading : 'Not Rendered'}`);
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total Pages Tested: ${results.length}`);
  const failed = results.filter(r => !r.rendered);
  console.log(`Passed: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed subtabs:', failed);
  }
  console.log('Total JS Errors thrown:', jsErrors.length);
  if (jsErrors.length > 0) {
    console.log('JS Errors:', jsErrors);
  }

  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
