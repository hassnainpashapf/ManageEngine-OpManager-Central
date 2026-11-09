'use strict';
/**
 * Phase 3 ncm-backup — proof harness (NOT part of the shipped server).
 *
 * Proves, against the agent's OWN server instance on $PORT (default 8130) with a
 * throwaway DB, that POST /api/ccm/backup-device and /api/ccm/backup:
 *   A. return a REAL fetched config for a device WITH stored SSH credentials,
 *      stored in store.configs as 'running-config' (revision + timestamp +
 *      byte/line counts from the fetched text);
 *   B. return an honest 501 naming the exact missing piece for a device
 *      WITHOUT credentials — and prove no SSH connection was even attempted
 *      (connection counter on the test SSH service is unchanged);
 *   C. return an honest 502 for stored credentials with a wrong password,
 *      and store nothing;
 *   D. return 501 for a linked credential of the wrong type (not 'ssh');
 *   E. keep the pre-existing 400 (missing deviceId) / 404 (unknown device).
 *
 * The "device" is a LOCAL TEST SSH SERVICE: an in-process ssh2 Server that
 * speaks the real SSH protocol (key exchange, password auth, exec channel)
 * on 127.0.0.0/8. It is labelled as a test service everywhere — it is NOT a
 * production switch and is never presented as one. Its canned running-config
 * is fixed test data, served only to prove the fetch/store pipeline end to
 * end; no live switch is touched (none has stored credentials in this phase).
 *
 * PHASE 4 MERGE (branch p4m-ncm): WORK under ~/workspace/opm-p4/m6-work/
 * (NOT /tmp — /tmp fills up); PORT from env (default 8130, this merge
 * run uses 8165). 23 backup-behaviour checks (A–E) + 3 auth setup
 * checks = 26 check() calls total.
 */

const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { Server } = require('ssh2');

const CLONE = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8130);
const BASE = `http://127.0.0.1:${PORT}`;
const WORK = path.join(CLONE, '..', 'm6-work', 'backup-proof');
const DB_PATH = path.join(WORK, 'opmanager.db');
const ADMIN_INITIAL = path.join(CLONE, 'server', 'data', '.admin-initial');

// Fixed canned running-config served by the local test SSH service.
// Deliberately ordinary Cisco-style text; the proof asserts byte-for-byte
// equality between what the service sent and what the API stored.
const TEST_CONFIG = [
  '!',
  '! TEST-DEVICE running-config served by the local p3 test SSH service',
  '! (not a production device — see scripts/p3-ncm-backup-proof.js)',
  '!',
  'hostname p3-test-switch',
  '!',
  'interface GigabitEthernet0/0',
  ' description UPLINK',
  ' ip address 127.0.0.1 255.255.255.0',
  ' no shutdown',
  '!',
  'interface GigabitEthernet0/1',
  ' description LAN',
  ' ip address 10.99.0.1 255.255.255.0',
  ' no shutdown',
  '!',
  'ip route 0.0.0.0 0.0.0.0 127.0.0.1',
  '!',
  'end',
  '',
].join('\n').replace(/\n$/, ''); // no trailing newline; server trims trailing blank lines anyway

const TEST_SSH_USER = 'opmtest';
const TEST_SSH_PASSWORD = crypto.randomBytes(12).toString('hex'); // runtime only
const NEW_ADMIN_PASSWORD = crypto.randomBytes(12).toString('hex') + 'Aa1'; // >=10 chars, runtime only

let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failures += 1;
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForPort(port, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    const ok = await new Promise((resolve) => {
      const s = net.connect(port, '127.0.0.1');
      s.on('connect', () => { s.end(); resolve(true); });
      s.on('error', () => resolve(false));
    });
    if (ok) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(250);
  }
}

// --- local test SSH service (real SSH protocol, ssh2 Server) ---------------
let sshConnections = 0;
function startTestSshServer() {
  // Host key generated at runtime with ssh-keygen (OpenSSH format, which
  // ssh2 parses); lives only under WORK for this run and is deleted on
  // teardown. Never committed, never logged.
  const keyPath = path.join(WORK, 'test-ssh-host-key');
  const { execFileSync } = require('node:child_process');
  execFileSync('ssh-keygen', ['-t', 'ed25519', '-f', keyPath, '-N', '', '-q']);
  const hostKey = fs.readFileSync(keyPath, 'utf8');
  const server = new Server({ hostKeys: [hostKey] }, (client) => {
    sshConnections += 1;
    client.on('authentication', (ctx) => {
      if (ctx.method === 'password' && ctx.username === TEST_SSH_USER && ctx.password === TEST_SSH_PASSWORD) {
        ctx.accept();
      } else {
        ctx.reject();
      }
    });
    client.on('ready', () => {
      client.on('session', (accept) => {
        const session = accept();
        session.on('exec', (acceptExec, _reject, info) => {
          const stream = acceptExec();
          const cmd = (info.command || '').trim();
          if (cmd === 'show running-config' || cmd === 'show run') {
            stream.write(TEST_CONFIG + '\n');
            stream.exit(0);
            stream.end();
          } else {
            stream.stderr.write(`% Unknown command: ${cmd}\n`);
            stream.exit(1);
            stream.end();
          }
        });
      });
    });
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '0.0.0.0', () => resolve({ server, port: server.address().port }));
  });
}

// --- HTTP helper (manual cookie handling; Node fetch has no jar) ------------
let cookie = '';
async function api(method, p, body, expectJson = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const m = setCookie.match(/opm_session=([^;]+)/);
    if (m) cookie = `opm_session=${m[1]}`;
  }
  const text = await res.text();
  let json = null;
  if (expectJson) { try { json = JSON.parse(text); } catch { /* keep null */ } }
  return { status: res.status, json, text };
}

async function main() {
  fs.rmSync(WORK, { recursive: true, force: true });
  fs.mkdirSync(WORK, { recursive: true });
  const adminInitialExisted = fs.existsSync(ADMIN_INITIAL);

  const { server: sshServer, port: sshPort } = await startTestSshServer();
  console.log(`test SSH service listening on 127.0.0.1:${sshPort} (real SSH protocol, in-process ssh2 Server; test service only)`);

  // Spawn our OWN server instance on : with the throwaway DB.
  const child = spawn('node', ['server/index.js'], {
    cwd: CLONE,
    env: { ...process.env, PORT: String(PORT), OPMANAGER_DB_PATH: DB_PATH },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverLog = '';
  child.stdout.on('data', (d) => { serverLog += d.toString(); });
  child.stderr.on('data', (d) => { serverLog += d.toString(); });

  try {
    if (!(await waitForPort(PORT))) {
      throw new Error(`own server did not start listening on ${PORT}:\n${serverLog.slice(-2000)}`);
    }
    console.log(`own server up on ${PORT} (throwaway DB ${DB_PATH})`);

    // Log in with the bootstrap admin (password read at runtime from the
    // server's own .admin-initial), then satisfy the must-change-password
    // guard so API routes are reachable. ensureFirstAdmin runs async after
    // listen, so wait for the file to appear.
    for (let i = 0; i < 80 && !fs.existsSync(ADMIN_INITIAL); i++) await sleep(250);
    if (!fs.existsSync(ADMIN_INITIAL)) throw new Error('.admin-initial was not created by the server');
    const bootstrapPw = fs.readFileSync(ADMIN_INITIAL, 'utf8').trim();
    let r = await api('POST', '/api/auth/login', { username: 'admin', password: bootstrapPw });
    check('login with bootstrap admin', r.status === 200 && r.json && r.json.ok === true, `HTTP ${r.status}`);
    r = await api('POST', '/api/auth/change-password', { currentPassword: bootstrapPw, newPassword: NEW_ADMIN_PASSWORD });
    check('change bootstrap admin password', r.status === 200, `HTTP ${r.status}`);
    cookie = '';
    r = await api('POST', '/api/auth/login', { username: 'admin', password: NEW_ADMIN_PASSWORD });
    check('re-login with changed admin password', r.status === 200 && r.json && r.json.ok === true, `HTTP ${r.status}`);

    // Seed via the real store (same throwaway DB the server uses).
    process.env.OPMANAGER_DB_PATH = DB_PATH;
    const store = require(path.join(CLONE, 'server', 'services', 'store'));
    const credGood = store.credentials.createCredential({ name: 'p3-test-ssh-good', type: 'ssh', username: TEST_SSH_USER, password: TEST_SSH_PASSWORD });
    const credBad = store.credentials.createCredential({ name: 'p3-test-ssh-bad', type: 'ssh', username: TEST_SSH_USER, password: 'deliberately-wrong-password' });
    const credSnmp = store.credentials.createCredential({ name: 'p3-test-snmp', type: 'snmp', community: 'public' });
    const devGood = store.devices.createDevice({ ip: '127.0.0.1', hostname: 'p3-test-switch', ssh_credential_id: credGood.id, ssh_port: sshPort });
    const devNoCred = store.devices.createDevice({ ip: '127.0.0.3', hostname: 'p3-no-cred-switch' });
    const devBad = store.devices.createDevice({ ip: '127.0.0.2', hostname: 'p3-bad-cred-switch', ssh_credential_id: credBad.id, ssh_port: sshPort });
    const devWrongType = store.devices.createDevice({ ip: '127.0.0.4', hostname: 'p3-wrong-type-switch', ssh_credential_id: credSnmp.id, ssh_port: sshPort });
    console.log(`seeded: credGood=${credGood.id} credBad=${credBad.id} credSnmp=${credSnmp.id} devGood=${devGood.id} devNoCred=${devNoCred.id} devBad=${devBad.id} devWrongType=${devWrongType.id}`);

    const expectedBytes = Buffer.byteLength(TEST_CONFIG, 'utf8');
    const expectedLines = TEST_CONFIG.split('\n').length;

    // A. Device WITH stored SSH credentials -> real fetched backup.
    const connsBeforeA = sshConnections;
    r = await api('POST', '/api/ccm/backup-device', { deviceId: devGood.id });
    check('A1 backup-device with credentials returns 200 success', r.status === 200 && r.json && r.json.status === 'success', `HTTP ${r.status} ${JSON.stringify(r.json)}`);
    check('A2 retrieval is ssh, command is show running-config', r.json && r.json.retrieval === 'ssh' && r.json.command === 'show running-config', JSON.stringify(r.json && { retrieval: r.json.retrieval, command: r.json.command }));
    check('A3 revision is a stored config row id', r.json && Number.isInteger(r.json.revision) && r.json.revision > 0, `revision=${r.json && r.json.revision}`);
    check('A4 byte count matches fetched text exactly', r.json && r.json.fileSize === expectedBytes, `fileSize=${r.json && r.json.fileSize} expected=${expectedBytes}`);
    check('A5 line count matches fetched text exactly', r.json && r.json.linesCount === expectedLines, `linesCount=${r.json && r.json.linesCount} expected=${expectedLines}`);
    check('A6 backupTime is a real ISO timestamp', r.json && !Number.isNaN(Date.parse(r.json.backupTime)), `backupTime=${r.json && r.json.backupTime}`);
    check('A7 exactly one SSH connection was made for the backup', sshConnections === connsBeforeA + 1, `connections ${connsBeforeA} -> ${sshConnections}`);
    const stored = store.configs.getConfigs(devGood.id);
    check('A8 stored config row exists in store.configs', stored.length >= 1 && stored[0].config_type === 'running-config', `rows=${stored.length}`);
    check('A9 stored content is byte-for-byte the fetched config', stored.length >= 1 && stored[0].content === TEST_CONFIG, stored.length ? `stored bytes=${Buffer.byteLength(stored[0].content)}` : 'no row');
    check('A10 a stored row id matches response revision', stored.some((row) => row.id === (r.json && r.json.revision)), `stored ids=${stored.map((row) => row.id).join(',')}`);
    const rev1 = r.json && r.json.revision;

    // D (alias). POST /api/ccm/backup for the same device -> second revision.
    r = await api('POST', '/api/ccm/backup', { deviceId: devGood.id });
    check('D1 /api/ccm/backup alias returns 200 success', r.status === 200 && r.json && r.json.status === 'success', `HTTP ${r.status}`);
    check('D2 alias backup creates a NEW revision', r.json && Number.isInteger(r.json.revision) && r.json.revision !== rev1, `revision=${r.json && r.json.revision} (first=${rev1})`);
    const catalog = await api('GET', '/api/ccm/configs');
    const entry = (catalog.json && catalog.json.configs || []).find((c) => c.configName === 'running-config');
    check('D3 GET /api/ccm/configs lists running-config with deviceCount 1', !!entry && entry.deviceCount === 1, JSON.stringify(entry));

    // B. Device WITHOUT credentials -> honest 501, NO SSH attempt.
    const connsBeforeB = sshConnections;
    r = await api('POST', '/api/ccm/backup-device', { deviceId: devNoCred.id });
    check('B1 backup-device without credentials returns 501', r.status === 501, `HTTP ${r.status}`);
    check('B2 501 names the exact missing piece', r.json && typeof r.json.message === 'string' && r.json.message.includes('ssh_credential_id is not set'), JSON.stringify(r.json && r.json.message));
    check('B3 no SSH connection was attempted for the 501', sshConnections === connsBeforeB, `connections ${connsBeforeB} -> ${sshConnections}`);
    check('B4 no config row stored for the 501 device', store.configs.getConfigs(devNoCred.id).length === 0, `rows=${store.configs.getConfigs(devNoCred.id).length}`);

    // C. Stored credentials, wrong password -> honest 502, nothing stored.
    r = await api('POST', '/api/ccm/backup-device', { deviceId: devBad.id });
    check('C1 backup-device with wrong password returns 502', r.status === 502, `HTTP ${r.status} ${JSON.stringify(r.json)}`);
    check('C2 502 reports an authentication failure', r.json && r.json.error === 'ssh_auth_failed', `error=${r.json && r.json.error}`);
    check('C3 no config row stored for the 502 device', store.configs.getConfigs(devBad.id).length === 0, `rows=${store.configs.getConfigs(devBad.id).length}`);

    // D2. Linked credential of the wrong type -> honest 501.
    r = await api('POST', '/api/ccm/backup-device', { deviceId: devWrongType.id });
    check('D4 wrong-type credential returns 501 naming the type', r.status === 501 && r.json && typeof r.json.message === 'string' && r.json.message.includes("not 'ssh'"), `HTTP ${r.status} ${JSON.stringify(r.json && r.json.message)}`);

    // E. Pre-existing 400 / 404 behaviour unchanged.
    r = await api('POST', '/api/ccm/backup-device', {});
    check('E1 missing deviceId returns 400', r.status === 400, `HTTP ${r.status}`);
    r = await api('POST', '/api/ccm/backup-device', { deviceId: 999999 });
    check('E2 unknown device returns 404', r.status === 404, `HTTP ${r.status}`);
  } finally {
    try { child.kill('SIGTERM'); } catch { /* already gone */ }
    await new Promise((resolve) => { try { sshServer.close(resolve); } catch { resolve(); } });
    await sleep(500);
    try { if (child.exitCode === null) child.kill('SIGKILL'); } catch { /* gone */ }
    // Teardown: throwaway DB + server data created for this proof only.
    fs.rmSync(WORK, { recursive: true, force: true });
    if (!adminInitialExisted) {
      try { fs.unlinkSync(ADMIN_INITIAL); } catch { /* already gone */ }
    }
  }

  console.log(failures === 0 ? '\nPROOF RESULT: ALL CHECKS PASSED' : `\nPROOF RESULT: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('PROOF HARNESS ERROR:', err && err.stack ? err.stack : err);
  process.exit(2);
});
