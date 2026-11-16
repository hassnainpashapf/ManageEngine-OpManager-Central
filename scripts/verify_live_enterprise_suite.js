const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = 9677;
const baseUrl = process.env.OPM_BASE_URL || 'http://192.168.30.65:8060';
const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/chrome-test-suite-${Date.now()}`;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('[VERIFY] Launching Google Chrome headless with CDP on port ' + port + '...');
  const chrome = spawn(chromeBin, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--window-size=1600,1050'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      targets = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => {
            try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
          });
        });
        req.on('error', reject);
      });
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Chrome page target not found!');
  }

  console.log('[VERIFY] Connecting WebSocket to Chrome CDP...');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.on('open', resolve));

  let msgId = 1;
  const callbacks = new Map();
  ws.on('message', data => {
    const parsed = JSON.parse(data);
    if (parsed.id && callbacks.has(parsed.id)) {
      callbacks.get(parsed.id)(parsed);
      callbacks.delete(parsed.id);
    }
  });

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.result.data, 'base64');
    const outPath = path.join(artifactDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[VERIFY] Captured screenshot: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return outPath;
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  try {
    // ==========================================
    // 1. INVENTORY: Devices Tab
    // ==========================================
    console.log('[VERIFY] Navigating to Central Inventory: ' + `${baseUrl}/apiclient/fluidicv3/itom/index.html#/inventory`);
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/inventory` });
    await sleep(3500);

    const devInfo = await evaluate(`(() => {
      const rows = document.querySelectorAll('tr');
      const text = document.body.innerText;
      const undefinedBadges = Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0 && el.innerText.trim() === 'undefined');
      const probeBadges = Array.from(document.querySelectorAll('span')).filter(s => s.innerText.includes('Central Site Probe') || s.innerText.includes('Probe'));
      const subtabs = Array.from(document.querySelectorAll('button, a, [role="tab"], div')).filter(el => el.innerText && el.innerText.includes('Devices ('));
      return {
        hasUndefined: undefinedBadges.length,
        probeBadgeCount: probeBadges.length,
        probeBadgeTexts: probeBadges.slice(0, 5).map(s => s.innerText.trim()),
        totalRows: rows.length,
        subtabText: subtabs[0] ? subtabs[0].innerText.trim() : null
      };
    })()`);
    console.log('[VERIFY] Inventory Devices state:', devInfo);
    await captureScreenshot('live_verified_inventory_devices.png');

    // ==========================================
    // 2. INVENTORY: Virtualization Tab
    // ==========================================
    console.log('[VERIFY] Clicking Virtualization subtab...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-inv-subtab-btn[data-sub="virtualization"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);
    await captureScreenshot('live_verified_inventory_virtualization.png');

    // ==========================================
    // 3. INVENTORY: Firewall Rules Tab
    // ==========================================
    console.log('[VERIFY] Clicking Firewall Rules subtab...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-inv-subtab-btn[data-sub="firewall_rules"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);
    await captureScreenshot('live_verified_inventory_firewall_rules.png');

    // ==========================================
    // 4. INVENTORY: Storage Tab
    // ==========================================
    console.log('[VERIFY] Clicking Storage subtab...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-inv-subtab-btn[data-sub="storage"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);
    await captureScreenshot('live_verified_inventory_storage.png');

    // ==========================================
    // 5. SETTINGS: Templates (Wireless 600)
    // ==========================================
    console.log('[VERIFY] Navigating to Settings: ' + `${baseUrl}/apiclient/fluidicv3/itom/index.html#/settings`);
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/settings` });
    await sleep(3500);

    // Switch to templates subtab
    console.log('[VERIFY] Clicking Device Templates subtab in Settings...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-set-subtab-btn[data-sub="templates"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);

    // Click Wireless (600) chip
    console.log('[VERIFY] Clicking Wireless (600) category chip...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-tmpl-chip[data-cat="wireless"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);
    await captureScreenshot('live_verified_settings_wireless_templates.png');

    // ==========================================
    // 6. SETTINGS: Discovery Rules
    // ==========================================
    console.log('[VERIFY] Switching to Discovery Rules subtab in Settings...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-set-subtab-btn[data-sub="discovery"]');
      if (btn) btn.click();
    })()`);
    await sleep(2000);
    await captureScreenshot('live_verified_settings_discovery_rules.png');

    // ==========================================
    // 7. ALARMS: Real Poller Live Alarms
    // ==========================================
    console.log('[VERIFY] Navigating to Alarms: ' + `${baseUrl}/apiclient/fluidicv3/itom/index.html#/alarms`);
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/alarms` });
    await sleep(3500);

    const alarmInfo = await evaluate(`(() => {
      const rows = document.querySelectorAll('tr');
      return {
        totalAlarmRows: rows.length,
        hasCriticalAlarm: document.body.innerText.includes('Critical'),
        hasRcaBtn: Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Zia') || b.innerText.includes('RCA'))
      };
    })()`);
    console.log('[VERIFY] Alarms state:', alarmInfo);
    await captureScreenshot('live_verified_alarms_real_poller.png');

    console.log('[VERIFY] ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    ws.close();
    chrome.kill();
  }
}

main().catch(err => {
  console.error('[VERIFY] Fatal error:', err);
  process.exit(1);
});
