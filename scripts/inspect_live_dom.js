const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const port = 9679;
const baseUrl = 'http://192.168.30.65:8060';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/chrome-inspect-${Date.now()}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--window-size=1600,1050'
  ]);

  try {
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
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

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

    async function evalCode(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.result && res.result.value !== undefined) return res.result.value;
      if (res.exceptionDetails) {
        return { exception: res.exceptionDetails.text, details: res.exceptionDetails.exception };
      }
      return res.result;
    }

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('[TEST 1] Loading Inventory...');
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/inventory` });
    await sleep(4000);

    const invData = await evalCode(`(() => {
      const subtabs = Array.from(document.querySelectorAll('.opm-inv-subtab-btn')).map(b => b.innerText.trim());
      const chips = Array.from(document.querySelectorAll('.opm-inv-chip')).map(c => c.innerText.trim());
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.replace(/\\s+/g, ' ').trim());
        const editBtn = tr.querySelector('.opm-inv-row-edit-btn');
        return {
          name: cells[1],
          ip: cells[2],
          category: cells[3],
          probe: cells[4],
          cpu: cells[5],
          mem: cells[6],
          resp: cells[7],
          avail: cells[8],
          hasEditBtn: !!editBtn
        };
      });
      return { subtabs, chips, totalRows: rows.length, sampleRows: rows.slice(0, 4) };
    })()`);
    console.log('Inventory Data:', JSON.stringify(invData, null, 2));

    // Test Edit Device Modal Trigger
    console.log('[TEST 2] Testing Edit Device Modal trigger on first row...');
    const editModalData = await evalCode(`(() => {
      const firstEditBtn = document.querySelector('.opm-inv-row-edit-btn');
      if (!firstEditBtn) return { error: 'No edit button found in DOM!' };
      firstEditBtn.click();
      return { clicked: true, dataId: firstEditBtn.getAttribute('data-id') };
    })()`);
    console.log('Edit Modal Trigger:', editModalData);
    await sleep(1500);

    const modalState = await evalCode(`(() => {
      const modal = document.querySelector('#opm-edit-device-modal') || document.querySelector('.opm-modal-overlay');
      if (!modal) return { modalFound: false };
      const title = modal.querySelector('h2, h3, .modal-title, div[style*="font-size: 15px"]') ? modal.querySelector('h2, h3, .modal-title, div[style*="font-size: 15px"]').innerText : '';
      const inputs = Array.from(modal.querySelectorAll('input, select')).map(i => ({ id: i.id || i.name, val: i.value, type: i.type }));
      return { modalFound: true, title, inputsCount: inputs.length, inputs };
    })()`);
    console.log('Modal State after click:', JSON.stringify(modalState, null, 2));

    // Close modal if open
    await evalCode(`(() => {
      const cancel = document.querySelector('.opm-modal-cancel-btn') || document.querySelector('#opm-edit-device-cancel-btn') || document.querySelector('.modal-close');
      if (cancel) cancel.click();
    })()`);
    await sleep(1000);

    // Test Templates Category Switch
    console.log('[TEST 3] Loading Settings Templates...');
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/settings` });
    await sleep(3500);

    await evalCode(`(() => {
      const tmplSub = document.querySelector('.opm-set-subtab-btn[data-sub="templates"]');
      if (tmplSub) tmplSub.click();
    })()`);
    await sleep(1500);

    // Click Wireless (600)
    await evalCode(`(() => {
      const wChip = document.querySelector('.opm-tmpl-chip[data-cat="wireless"]');
      if (wChip) wChip.click();
    })()`);
    await sleep(1000);

    const tmplData = await evalCode(`(() => {
      const chips = Array.from(document.querySelectorAll('.opm-tmpl-chip')).map(c => c.innerText.trim());
      const footer = document.querySelector('div[style*="justify-content: space-between"]') ? document.querySelector('div[style*="justify-content: space-between"]').innerText.replace(/\\s+/g, ' ').trim() : '';
      const rows = document.querySelectorAll('tbody tr').length;
      return { chips, footer, rowsCount: rows };
    })()`);
    console.log('Templates Data (Wireless):', JSON.stringify(tmplData, null, 2));

    // Test Discovery Rules
    console.log('[TEST 4] Loading Settings Discovery...');
    await evalCode(`(() => {
      const discSub = document.querySelector('.opm-set-subtab-btn[data-sub="discovery"]');
      if (discSub) discSub.click();
    })()`);
    await sleep(1500);

    const discData = await evalCode(`(() => {
      const ruleCards = document.querySelectorAll('.opm-discovery-rule-card').length;
      const text = document.body.innerText;
      return {
        ruleCardsCount: ruleCards,
        hasNoRulesMsg: text.includes('No Auto-Discovery Rules Configured'),
        sampleText: text.substring(0, 300).replace(/\\s+/g, ' ')
      };
    })()`);
    console.log('Discovery Rules Data:', JSON.stringify(discData, null, 2));

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('[INSPECT] Error:', err);
  process.exit(1);
});
