const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const port = 9680;
const baseUrl = 'http://192.168.30.65:8060';
const artifactDir = '/Users/hussnainpasha/.gemini/antigravity/brain/31e74a1e-a0ce-4ee5-a5c6-1e026db3577c';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/chrome-edit-modal-${Date.now()}`,
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
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
          });
          req.on('error', reject);
        });
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
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

    console.log('[1] Opening Inventory...');
    await send('Page.navigate', { url: `${baseUrl}/apiclient/fluidicv3/itom/index.html#/inventory` });
    await sleep(4000);

    console.log('[2] Clicking Edit Device button on first row...');
    await evaluate(`(() => {
      const btn = document.querySelector('.opm-inv-row-edit-btn');
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    await captureScreenshot('verified_edit_device_modal_live.png');
    console.log('[DONE] Captured verified_edit_device_modal_live.png!');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
