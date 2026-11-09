const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/node_modules/ws');
const fs = require('fs');
const path = require('path');

const port = 9657;
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';
const userDataDir = `/tmp/chrome-test-probes-${Date.now()}`;
const targetUrl = 'http://192.168.30.65:8060/apiclient/fluidicv3/itom/index.html#/settings';

async function main() {
  console.log('1. Launching Headless Chrome to test Probe Delete functionality on CT 108...');
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

  console.log('3. Navigating to Settings Central & Probes:', targetUrl);
  await send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 3000));

  // Verify Probes table state
  const probesInfo = await evaluate(`(() => {
    const addBtn = document.getElementById('opm-add-probe-btn');
    const headerTitle = addBtn?.parentElement?.querySelector('span')?.innerText || '';
    const rows = Array.from(document.querySelectorAll('.opm-probe-row-click')).map(td => {
      const tr = td.closest('tr');
      return {
        id: td.getAttribute('data-id'),
        name: td.innerText,
        hasSyncBtn: !!tr.querySelector('.opm-probe-sync-btn'),
        hasDelBtn: !!tr.querySelector('.opm-probe-del-btn'),
        syncText: tr.querySelector('.opm-probe-sync-btn')?.innerText,
        delText: tr.querySelector('.opm-probe-del-btn')?.innerText
      };
    });
    return { headerTitle, rowCount: rows.length, rows };
  })()`);

  console.log('Initial Probes Table State:', JSON.stringify(probesInfo, null, 2));
  await captureScreenshot('verified_probes_with_delete_btn.png');

  // Find Probe 102 (Techub) and click Delete
  console.log('4. Clicking [Delete] button for probe 102 (Techub 585 H3 Johar town Lahore)...');
  const clickDeleteRes = await evaluate(`(() => {
    const btn = document.querySelector('.opm-probe-del-btn[data-id="102"]');
    if (!btn) return { error: 'Delete button for 102 not found' };
    btn.click();
    return { clicked: true };
  })()`);
  console.log('Click result:', clickDeleteRes);
  await new Promise(r => setTimeout(r, 800));

  // Verify confirmation modal is open
  const modalInfo = await evaluate(`(() => {
    const modal = document.getElementById('opm-delete-probe-modal');
    if (!modal) return null;
    return {
      display: modal.style.display,
      title: modal.querySelector('span[style*="font-weight: 700"]')?.innerText,
      confirmBtn: !!modal.querySelector('#confirm-del-probe-btn'),
      cancelBtn: !!modal.querySelector('#cancel-del-probe-btn'),
      bodySnippet: modal.querySelector('div[style*="line-height: 1.6"]')?.innerText?.substring(0, 150)
    };
  })()`);
  console.log('Delete Confirmation Modal Status:', JSON.stringify(modalInfo, null, 2));
  await captureScreenshot('verified_probe_delete_confirm_modal.png');

  // Confirm Deletion
  console.log('5. Clicking confirm delete button (#confirm-del-probe-btn)...');
  const confirmRes = await evaluate(`(() => {
    const btn = document.getElementById('confirm-del-probe-btn');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  console.log('Confirm delete clicked:', confirmRes);
  await new Promise(r => setTimeout(r, 2000));

  // Check state after deletion
  const afterDeleteInfo = await evaluate(`(() => {
    const addBtn = document.getElementById('opm-add-probe-btn');
    const headerTitle = addBtn?.parentElement?.querySelector('span')?.innerText || '';
    const rows = Array.from(document.querySelectorAll('.opm-probe-row-click')).map(td => ({
      id: td.getAttribute('data-id'),
      name: td.innerText
    }));
    const toast = document.querySelector('.opm-toast')?.innerText || '';
    return { headerTitle, rowCount: rows.length, rows, toast };
  })()`);
  console.log('After Deletion Probes Table State:', JSON.stringify(afterDeleteInfo, null, 2));
  await captureScreenshot('verified_probe_deleted_success.png');

  console.log('6. Checking backend database on CT 108...');
  const apiRes = await evaluate(`(async () => {
    const r = await fetch('/api/probes');
    return await r.json();
  })()`);
  console.log('Backend /api/probes after delete:', JSON.stringify({
    totalProbes: apiRes.totalProbes,
    probes: apiRes.probes?.map(p => ({ id: p.id, name: p.name }))
  }, null, 2));

  ws.close();
  chrome.kill();
  console.log('=== VERIFICATION COMPLETE ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
