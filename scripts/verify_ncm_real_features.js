const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9665;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/chrome-test-ncm-${Date.now()}`;
const targetUrl = 'http://192.168.30.65:8060/apiclient/fluidicv3/itom/index.html#/configuration';

async function main() {
  console.log('1. Launching Headless Chrome to test NCM Real Features on CT 108...');
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
  if (!pageTarget) {
    chrome.kill();
    throw new Error('Chrome page target not found!');
  }

  console.log('2. Connecting via CDP WebSocket to:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });

  let curId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = curId++;
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        ws.removeListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evaluate = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result ? res.result.value : null;
  };

  const captureScreenshot = async (filename) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[Screenshot saved]: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  };

  await send('Page.enable');
  await send('DOM.enable');
  await send('Network.enable');

  console.log('3. Navigating to Configuration view:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 3000));

  // Check initial state
  const initialCheck = await evaluate(`(() => {
    return {
      windowHasAddDev: typeof window.showAddDeviceModal,
      windowHasSuite: typeof window.OpManagerSuite,
      addDevBtn: !!document.getElementById('opm-cfg-add-dev-btn'),
      provBtn: !!document.getElementById('opm-cfg-provision-sample-btn'),
      bodySnippet: document.body.innerText.substring(0, 300)
    };
  })()`);
  console.log('Initial Configuration State:', JSON.stringify(initialCheck, null, 2));

  // 4. Test clicking '+ Add Network Device'
  console.log('4. Testing click on + Add Network Device...');
  const clickAddDev = await evaluate(`(() => {
    const btn = document.getElementById('opm-cfg-add-dev-btn') || document.querySelector('button[onclick*="showAddDeviceModal"]');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  console.log('Clicked + Add Network Device:', clickAddDev);
  await new Promise(r => setTimeout(r, 600));

  const modalCheck = await evaluate(`(() => {
    const m = document.getElementById('opm-add-dev-modal');
    return m ? {
      visible: m.style.display !== 'none',
      title: m.querySelector('span[style*="font-weight: 700"]')?.innerText,
      probesCount: m.querySelectorAll('#new-dev-probe option').length
    } : null;
  })()`);
  console.log('Add Device Modal Status:', JSON.stringify(modalCheck, null, 2));
  await captureScreenshot('verified_ncm_add_dev_modal.png');

  // Close modal
  await evaluate(`(() => { document.getElementById('close-add-dev-btn')?.click(); })()`);
  await new Promise(r => setTimeout(r, 400));

  // 5. Test clicking '⚡ Provision Cisco Core Switch (Instant Demo)'
  console.log('5. Clicking ⚡ Provision Cisco Core Switch (Instant Demo)...');
  const clickProv = await evaluate(`(() => {
    const btn = document.getElementById('opm-cfg-provision-sample-btn');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  console.log('Clicked Provision button:', clickProv);
  await new Promise(r => setTimeout(r, 2000));

  // Check state after provisioning
  const postProvCheck = await evaluate(`(() => {
    return {
      devicesCount: window.state?.devices?.length,
      hasKpiCards: document.querySelectorAll('div[style*="font-size: 26px"]').length,
      violationsCount: document.querySelectorAll('.opm-remediate-btn').length,
      hasDriftDiff: !!document.getElementById('opm-open-diff-comparator-btn'),
      firstDeviceName: window.state?.devices?.[0]?.name
    };
  })()`);
  console.log('State after provisioning:', JSON.stringify(postProvCheck, null, 2));
  await captureScreenshot('verified_ncm_compliance_with_device.png');

  // 6. Test Remediation Modal
  console.log('6. Clicking [Execute Fixlet] on violation...');
  const clickRemed = await evaluate(`(() => {
    const btn = document.querySelector('.opm-remediate-btn');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  console.log('Clicked [Execute Fixlet]:', clickRemed);
  await new Promise(r => setTimeout(r, 800));

  const remedModalCheck = await evaluate(`(() => {
    const m = document.getElementById('opm-ncm-remed-modal');
    return m ? {
      visible: m.style.display !== 'none',
      title: m.querySelector('div[style*="font-weight: 800; color: #0f172a"]')?.innerText,
      ruleText: m.querySelector('div[style*="color: #991b1b"]')?.innerText
    } : null;
  })()`);
  console.log('NCM Remediation Modal Status:', JSON.stringify(remedModalCheck, null, 2));
  await captureScreenshot('verified_ncm_remediation_modal.png');

  // Close remediation modal
  await evaluate(`(() => { document.getElementById('close-ncm-remed-btn')?.click(); })()`);
  await new Promise(r => setTimeout(r, 500));

  // 7. Test Diff Comparator Modal
  console.log('7. Clicking [Compare Revisions ↗]...');
  const clickDiff = await evaluate(`(() => {
    const btn = document.getElementById('opm-open-diff-comparator-btn');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  console.log('Clicked [Compare Revisions]:', clickDiff);
  await new Promise(r => setTimeout(r, 800));

  const diffModalCheck = await evaluate(`(() => {
    const m = document.getElementById('opm-ncm-diff-modal');
    return m ? {
      visible: m.style.display !== 'none',
      title: m.querySelector('div[style*="font-size: 15px; font-weight: 800"]')?.innerText || m.querySelector('h3')?.innerText
    } : null;
  })()`);
  console.log('NCM Version Compare Modal Status:', JSON.stringify(diffModalCheck, null, 2));
  await captureScreenshot('verified_ncm_version_compare_modal.png');

  // Close diff modal
  await evaluate(`(() => { document.getElementById('close-diff-modal-btn')?.click() || document.querySelector('#opm-ncm-diff-modal button')?.click(); })()`);
  await new Promise(r => setTimeout(r, 500));

  // 8. Test Config Backups Subtab
  console.log('8. Navigating to Config Backups subtab...');
  await evaluate(`(() => {
    const btn = document.querySelector('.opm-cfg-subtab-btn[data-sub="backups"]');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 1200));

  const backupsCheck = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => ({
      devName: tr.querySelector('td span')?.innerText,
      hasBackupBtn: !!tr.querySelector('.opm-cfg-backup-single-btn'),
      hasViewBtn: !!tr.querySelector('.opm-cfg-view-config-btn'),
      hasDownloadBtn: !!tr.querySelector('.opm-cfg-download-config-btn')
    }));
    return { rowCount: rows.length, rows };
  })()`);
  console.log('Config Backups Subtab State:', JSON.stringify(backupsCheck, null, 2));
  await captureScreenshot('verified_ncm_backups_tab.png');

  ws.close();
  chrome.kill();
  console.log('=== NCM VERIFICATION COMPLETE ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
