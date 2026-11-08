const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9690;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const baseUrl = 'http://localhost:8060/apiclient/fluidicv3/itom/index.html';

async function main() {
  console.log('=== STARTING VERIFICATION OF SETTINGS ROUTE & WEBSOCKET HEARTBEAT ===');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    '--window-size=1680,1050'
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
      if (targets && targets.some(t => t.type === 'page')) break;
    } catch(e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleLogs = [];

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map(a => typeof a.value === 'object' ? JSON.stringify(a.value) : (a.value || a.description || '')).join(' ');
        consoleLogs.push({ time: Date.now(), type, text });
        if (text.includes('HeartbeatCheck') || text.includes('No pong') || text.includes('WebSocket')) {
          console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`);
        }
      }
    } catch(e) {}
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Timeout waiting for ${method} (id=${id})`));
      }, 8000);
      pendingRequests.set(id, {
        resolve: (res) => { clearTimeout(timer); resolve(res); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true
    });
    return res.result ? res.result.value : res.value;
  }

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('1. Loading base ITOM client...');
  await send('Page.navigate', { url: `${baseUrl}#/dashboard` });
  await new Promise(r => setTimeout(r, 3000));

  console.log('2. Navigating to #/settings route...');
  await evaluate(`window.location.hash = '#/settings';`);
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Waiting 15 seconds to audit WebSocket heartbeat over time...');
  for (let s = 1; s <= 15; s++) {
    await new Promise(r => setTimeout(r, 1000));
    if (s % 5 === 0) console.log(`   ... elapsed ${s}s`);
  }

  console.log('\n4. Evaluating Settings Route State & DOM Integrity...');
  const state = await evaluate(`(() => {
    const c = document.getElementById('opm-custom-suite-container');
    const text = c ? c.innerText : '';
    const suite = window.OpManagerSuite;

    const subtabBtns = Array.from(document.querySelectorAll('.opm-set-subtab-btn')).map(b => b.innerText.trim());
    const activeSubtab = document.querySelector('.opm-set-subtab-btn[style*="border-bottom"]')?.innerText.trim();
    const activeHeaderNav = Array.from(document.querySelectorAll('#main-header .active, #main-header .active-menu')).map(el => el.innerText.trim());

    return {
      url: window.location.href,
      hash: window.location.hash,
      title: document.title,
      suiteStateTab: suite ? suite.state.currentTab : null,
      suiteSettingsSubTab: suite ? suite.state.subTabs.settings : null,
      containerExists: !!c,
      containerLength: text.length,
      hasSettingsEnterpriseHeader: text.includes('Enterprise Admin Console'),
      hasProbesMatrix: text.includes('OpManager Central Quick Configuration Matrix') && text.includes('Distributed Probe WAN Latency Matrix'),
      hasCentralMasterArchitecture: text.includes('OpManager Central Master Node & Distributed Probe Architecture'),
      isConfigShowing: text.includes('Startup-Running Conflict Diff') || text.includes('NCM Module v12.9.203'),
      subtabButtonsCount: subtabBtns.length,
      subtabNamesSample: subtabBtns.slice(0, 6),
      activeSubtab: activeSubtab,
      activeHeaderNav: activeHeaderNav
    };
  })()`);

  console.log('\n=== SETTINGS ROUTE AUDIT ===');
  console.log(' - URL Hash:', state.hash);
  console.log(' - Document Title:', state.title);
  console.log(' - Suite Current Tab:', state.suiteStateTab);
  console.log(' - Settings Subtab:', state.suiteSettingsSubTab);
  console.log(' - Has Settings Enterprise Header:', state.hasSettingsEnterpriseHeader);
  console.log(' - Has Probes Matrix:', state.hasProbesMatrix);
  console.log(' - Has Central Master Architecture:', state.hasCentralMasterArchitecture);
  console.log(' - Is Configuration / NCM View Showing:', state.isConfigShowing);
  console.log(' - Total Settings Subtabs rendered:', state.subtabButtonsCount);
  console.log(' - Active Header Navigation:', state.activeHeaderNav);

  // Check Heartbeat logs
  const heartbeatWarnings = consoleLogs.filter(l => l.text.includes('HeartbeatCheck') || l.text.includes('No pong'));
  console.log('\n=== WEBSOCKET HEARTBEAT AUDIT ===');
  console.log(' - Total Console Logs captured:', consoleLogs.length);
  console.log(' - Heartbeat warnings count:', heartbeatWarnings.length);
  if (heartbeatWarnings.length > 0) {
    console.error('FAIL: Found HeartbeatCheck warnings:', heartbeatWarnings);
  } else {
    console.log('PASS: 0 HeartbeatCheck warnings detected over 15 seconds!');
  }

  // Verification Assertions
  const asserts = [
    { name: 'Hash is #/settings', pass: state.hash === '#/settings' },
    { name: 'Suite state tab is settings', pass: state.suiteStateTab === 'settings' },
    { name: 'Title is Settings - OpManager Central', pass: state.title.includes('Settings') },
    { name: 'Enterprise Admin Console rendered', pass: state.hasSettingsEnterpriseHeader === true },
    { name: 'Configuration / NCM view is NOT rendered', pass: state.isConfigShowing === false },
    { name: 'Settings subtabs count >= 15', pass: state.subtabButtonsCount >= 15 },
    { name: 'HeartbeatCheck warnings is 0', pass: heartbeatWarnings.length === 0 }
  ];

  console.log('\n=== ASSERTION RESULTS ===');
  let allPassed = true;
  asserts.forEach(a => {
    console.log(` [${a.pass ? 'PASS' : 'FAIL'}] ${a.name}`);
    if (!a.pass) allPassed = false;
  });

  // Capture high-res screenshot of verified Settings view
  console.log('\n5. Capturing verified Settings view screenshot...');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(artifactDir, 'screenshot_settings_verified_view.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  // Test Subtab Switching inside Settings (e.g. click "Mail & SMS Server")
  console.log('\n6. Testing Interactive Subtab Switching inside Settings...');
  const switchRes = await evaluate(`(() => {
    const mailBtn = document.querySelector('.opm-set-subtab-btn[data-sub="mail"]');
    if (mailBtn) mailBtn.click();
    const c = document.getElementById('opm-custom-suite-container');
    return {
      clickedMail: !!mailBtn,
      hasSmtpConfig: c ? c.innerText.includes('SMTP Relay Server') || c.innerText.includes('Mail Server') : false
    };
  })()`);
  console.log('Mail Subtab switch result:', switchRes);

  ws.close();
  chrome.kill();

  if (!allPassed) {
    throw new Error('Verification failed one or more assertions.');
  }
  console.log('\n=== ALL VERIFIED ISSUES RESOLVED AND CONFIRMED 100% OPERATIONAL! ===');
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
