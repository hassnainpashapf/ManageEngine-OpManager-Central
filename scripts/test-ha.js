'use strict';
/**
 * HA chaos / edge tests — Phase 4 merge (p4m-ha). Adapted from the
 * Phase 3 ha-tests harness to the CANONICAL merged HA surface.
 *
 * Runs SIX cases (C0–C5) against TWO REAL local instances of this same
 * checkout (primary + standby), each with its own throwaway SQLite DB
 * and its own server/data/.admin-initial. No product code is changed
 * by this script.
 *
 *   primary : http://127.0.0.1:8164  (this clone; HA_PRIMARY_PORT)
 *   standby : http://127.0.0.1:18164 (sibling copy; HA_STANDBY_PORT)
 *
 * The standby copy is a plain directory copy of this clone (same code,
 * own data dir). Rebuild it from THIS merged clone before running:
 *
 *   cp -a <this-clone> <standby-dir>
 *   rm -rf <standby-dir>/.git <standby-dir>/server/data
 *   cp -r ~/workspace/opmanager-central-check/node_modules <standby-dir>/node_modules
 *
 * (HA_STANDBY_DIR env var overrides the standby location.
 *  HA_PRIMARY_DIR overrides the primary location (default: this repo).
 *  HA_PRIMARY_PORT / HA_STANDBY_PORT override the ports. NEVER point
 *  either at the shared :8060 server — this script refuses port 8060.
 *  Set TMPDIR to a workspace scratch dir: instance logs go there.)
 *
 * Canonical HA surface under test (Phase 4 merge p4m-ha):
 *   GET  /api/ha/status, GET /api/ha/peers, GET /api/ha/decisions,
 *   POST /api/ha/register, POST /api/ha/heartbeat (peer-secret auth),
 *   POST /api/ha/failover/test (dry run),
 *   GET/POST /api/settings/ha (canonical settings.ha).
 * The pair is configured via POST /api/settings/ha on each node
 * (role + peer URLs); the legacy /api/settings/failover pair config
 * is still exercised in C0/C4 as the pre-existing surface. Peer
 * requests carry the shared secret from a runtime-generated
 * OPM_HA_PEER_SECRET (never written to the results file).
 *
 * Cases:
 *   C0  baseline probe — canonical HA surface exists and answers
 *   C1  standby killed   -> primary reports degraded/unavailable, no false promotion
 *   C2  primary killed   -> standby promotes (polls up to 45s; grace
 *       is 15s), with a real ha.promote decision record + gapMs
 *   C3  primary returns  -> re-registration demotes the promoted
 *       standby, exactly one node reports primary
 *   C4  heartbeat storm  -> rapid heartbeats, no crash, liveness stays correct
 *   C5  stale heartbeat  -> old sentAt rejected 400 stale_heartbeat,
 *       fresh heartbeat accepted (canonical /api/ha/heartbeat)
 *
 * Auth: each instance bootstraps a random admin password into
 * server/data/.admin-initial (mode 600). This script reads that file at
 * runtime, logs in, rotates the password to a random runtime-only value
 * (to clear the must-change-password flag), and never prints or stores
 * either password. Nothing credential-like is written to the results file.
 *
 * Usage:  node scripts/test-ha.js [--leave-up]
 * Output: scripts/test-ha-results.json (exact API responses per case)
 *         + a per-case PASS/FAIL/MISSING summary on stdout.
 * Exit code: 0 only if no case FAILs; 1 if any case FAILs.
 */

const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PRIMARY_PORT = Number(process.env.HA_PRIMARY_PORT || 8164);
const STANDBY_PORT = Number(process.env.HA_STANDBY_PORT || 18164);
const STANDBY_DIR =
  process.env.HA_STANDBY_DIR ||
  path.resolve(REPO_ROOT, '..', 'ha-tests-standby');
const PRIMARY_DIR = process.env.HA_PRIMARY_DIR || REPO_ROOT;
// Shared peer secret for the canonical heartbeat/register protocol:
// generated fresh per run (runtime only), passed to both instances via
// env, and used by this script's peer requests. Never written to the
// results file (responses never echo it).
const PEER_SECRET = process.env.OPM_HA_PEER_SECRET || crypto.randomBytes(16).toString('hex');
const RESULTS_PATH = path.join(__dirname, 'test-ha-results.json');
const LEAVE_UP = process.argv.includes('--leave-up');
const HOST = '127.0.0.1';

if (PRIMARY_PORT === 8060 || STANDBY_PORT === 8060) {
  console.error('REFUSAL: port 8060 is the shared server. Pick other ports.');
  process.exit(2);
}
if (PRIMARY_PORT === STANDBY_PORT) {
  console.error('REFUSAL: primary and standby ports must differ.');
  process.exit(2);
}

const startedAt = new Date().toISOString();
const results = {
  tool: 'scripts/test-ha.js',
  track: 'ha-tests',
  runAt: startedAt,
  primary: { dir: PRIMARY_DIR, port: PRIMARY_PORT, url: `http://${HOST}:${PRIMARY_PORT}` },
  standby: { dir: STANDBY_DIR, port: STANDBY_PORT, url: `http://${HOST}:${STANDBY_PORT}` },
  note: 'Two real local instances of the same checkout; each has its own throwaway DB. '
    + 'No credentials are recorded in this file.',
  cases: [],
  bugs: [],
};

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function iso() {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ http -- */

function httpReq({ port, method, path: urlPath, body, cookie, headers, timeoutMs = 15000 }) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        host: HOST,
        port,
        method,
        path: urlPath,
        timeout: timeoutMs,
        headers: {
          ...(payload !== null
            ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            : {}),
          ...(cookie ? { Cookie: cookie } : {}),
          ...(headers || {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch { /* keep raw */ }
          resolve({
            status: res.statusCode,
            headers: { 'set-cookie': res.headers['set-cookie'] || null },
            body: parsed,
            raw,
            ms: Date.now() - t0,
          });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('request timeout')));
    req.on('error', (err) =>
      resolve({ status: null, error: `${err.code || 'ERR'}: ${err.message}`, ms: Date.now() - t0 })
    );
    if (payload !== null) req.write(payload);
    req.end();
  });
}

function tcpProbe(port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const s = net.connect({ host: HOST, port, timeout: timeoutMs });
    s.on('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.on('timeout', () => {
      s.destroy();
      resolve(false);
    });
    s.on('error', () => resolve(false));
  });
}

/* -------------------------------------------------------------- instances -- */

const children = []; // { label, proc, logPath }

function startInstance(dir, port, label) {
  const logPath = path.join(os.tmpdir(), `ha-tests-${label}-${port}.log`);
  const out = fs.createWriteStream(logPath, { flags: 'a' });
  const proc = spawn('node', ['server/index.js'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), OPM_HA_PEER_SECRET: PEER_SECRET },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stdout.pipe(out);
  proc.stderr.pipe(out);
  proc.on('error', (err) => log(`${label}: spawn error: ${err.message}`));
  children.push({ label, proc, logPath, dir, port });
  log(`${label}: started pid=${proc.pid} port=${port} dir=${dir} log=${logPath}`);
  return proc;
}

async function waitForReady(port, label, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await tcpProbe(port, 1000)) {
      // TCP up is not enough: wait until the API guard answers (401 = up,
      // no session; 200 with a session is also fine).
      const r = await httpReq({ port, method: 'GET', path: '/api/auth/session', timeoutMs: 5000 });
      if (r.status === 401 || r.status === 200) return true;
    }
    await sleep(1000);
  }
  throw new Error(`${label}: not ready on port ${port} after ${timeoutMs}ms`);
}

async function waitForFile(file, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (fs.existsSync(file) && fs.statSync(file).size > 0) return;
    } catch { /* retry */ }
    await sleep(500);
  }
  throw new Error(`file did not appear: ${file}`);
}

// Log in to an instance and return { cookie, password }.
// First boot: uses the instance's own bootstrap password (read at runtime
// from its server/data/.admin-initial), then rotates it to a random
// runtime-only password to clear the must-change flag.
// Restart: pass the password returned by the previous login in
// knownPassword — the bootstrap password no longer works after rotation.
// Passwords are kept in memory only and never logged or recorded.
async function loginInstance(port, dir, label, knownPassword) {
  let password = knownPassword || null;
  if (!password) {
    const initialFile = path.join(dir, 'server', 'data', '.admin-initial');
    await waitForFile(initialFile);
    password = fs.readFileSync(initialFile, 'utf8').trim();
    if (!password) throw new Error(`${label}: empty .admin-initial`);
  }
  const login = await httpReq({
    port,
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'admin', password },
  });
  if (login.status !== 200 || !login.body || login.body.ok !== true) {
    throw new Error(`${label}: login failed: ${JSON.stringify(login.body || login.error)}`);
  }
  const cookie = (login.headers['set-cookie'] || [])
    .map((c) => String(c).split(';')[0])
    .find((c) => c.startsWith('opm_session='));
  if (!cookie) throw new Error(`${label}: login returned no opm_session cookie`);
  if (login.body.mustChangePassword) {
    const replacement = crypto.randomBytes(12).toString('base64url'); // runtime only
    const changed = await httpReq({
      port,
      method: 'POST',
      path: '/api/auth/change-password',
      body: { currentPassword: password, newPassword: replacement },
      cookie,
    });
    if (changed.status !== 200) {
      throw new Error(`${label}: password rotation failed: ${JSON.stringify(changed.body || changed.error)}`);
    }
    const relogin = await httpReq({
      port,
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin', password: replacement },
    });
    if (relogin.status !== 200 || !relogin.body || relogin.body.ok !== true) {
      throw new Error(`${label}: re-login after rotation failed`);
    }
    const cookie2 = (relogin.headers['set-cookie'] || [])
      .map((c) => String(c).split(';')[0])
      .find((c) => c.startsWith('opm_session='));
    if (!cookie2) throw new Error(`${label}: re-login returned no session cookie`);
    log(`${label}: logged in (bootstrap password rotated at runtime, must-change cleared)`);
    return { cookie: cookie2, password: replacement };
  }
  log(`${label}: logged in (no must-change flag)`);
  return { cookie, password };
}

async function killInstance(entry, label) {
  const { proc } = entry;
  if (!proc || proc.exitCode !== null) {
    log(`${label}: already exited (code=${proc ? proc.exitCode : 'n/a'})`);
    return { alreadyExited: true, exitCode: proc ? proc.exitCode : null };
  }
  const killedAt = iso();
  proc.kill('SIGTERM');
  const deadline = Date.now() + 10000;
  while (proc.exitCode === null && Date.now() < deadline) await sleep(250);
  let signal = 'SIGTERM';
  if (proc.exitCode === null) {
    proc.kill('SIGKILL');
    signal = 'SIGKILL';
    while (proc.exitCode === null) await sleep(250);
  }
  log(`${label}: killed with ${signal} at ${killedAt}, exit code=${proc.exitCode}`);
  return { killedAt, signal, exitCode: proc.exitCode };
}

function isAlive(entry) {
  return entry && entry.proc && entry.proc.exitCode === null;
}

/* ----------------------------------------------------------------- cases -- */

function newCase(id, title, expectation) {
  const c = { id, title, expectation, verdict: 'PENDING', checks: [], responses: [] };
  results.cases.push(c);
  return c;
}
function check(c, name, pass, detail) {
  c.checks.push({ name, pass: Boolean(pass), detail: detail ?? null });
  log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
  return Boolean(pass);
}
function record(c, label, at, request, response) {
  c.responses.push({
    label,
    at,
    request,
    response: {
      status: response.status ?? null,
      error: response.error ?? null,
      ms: response.ms ?? null,
      body: response.body !== undefined ? response.body : response.raw ?? null,
    },
  });
}
function verdict(c, v) {
  c.verdict = v;
  log(`=> ${c.id} verdict: ${v}`);
}

const FAILOVER_PAIR = () => ({
  mode: 'active-standby',
  status: 'Configured',
  virtualIp: null,
  heartbeatPort: STANDBY_PORT,
  splitBrainProtection: 'none',
  primary: { ip: HOST, port: PRIMARY_PORT },
  secondary: { ip: HOST, port: STANDBY_PORT },
});

function wipeThrowawayDb(dir, label) {
  // Each run starts from a fresh throwaway DB so the bootstrap login in
  // .admin-initial matches the users table. Only the generated SQLite
  // files are removed; .admin-initial is left alone (bootstrap overwrites
  // it when it creates the fresh admin) and committed data (mibs/templates)
  // is never touched.
  const dataDir = path.join(dir, 'server', 'data');
  for (const suffix of ['opmanager.db', 'opmanager.db-wal', 'opmanager.db-shm', 'opmanager.db-journal']) {
    const f = path.join(dataDir, suffix);
    try {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        log(`${label}: wiped throwaway ${suffix}`);
      }
    } catch (err) {
      log(`${label}: could not wipe ${suffix}: ${err.message}`);
    }
  }
}

async function main() {
  if (!fs.existsSync(path.join(PRIMARY_DIR, 'server', 'index.js'))) {
    throw new Error(`primary dir has no server/index.js: ${PRIMARY_DIR}`);
  }
  if (!fs.existsSync(path.join(STANDBY_DIR, 'server', 'index.js'))) {
    throw new Error(
      `standby dir missing: ${STANDBY_DIR}\n` +
        'Create it first: cp -a <this-clone> <standby-dir> && rm -rf <standby-dir>/.git <standby-dir>/server/data '
        + '&& copy node_modules into it (see header comment).'
    );
  }
  try {
    results.tip = require('node:child_process')
      .execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT, encoding: 'utf8' })
      .trim();
    results.branch = require('node:child_process')
      .execSync('git branch --show-current', { cwd: REPO_ROOT, encoding: 'utf8' })
      .trim();
  } catch { /* tip/branch stay unset; not fatal */ }

  // --- boot both instances -------------------------------------------------
  wipeThrowawayDb(PRIMARY_DIR, 'primary');
  wipeThrowawayDb(STANDBY_DIR, 'standby');
  const primary = startInstance(PRIMARY_DIR, PRIMARY_PORT, 'primary');
  const standby = startInstance(STANDBY_DIR, STANDBY_PORT, 'standby');
  await waitForReady(PRIMARY_PORT, 'primary');
  await waitForReady(STANDBY_PORT, 'standby');
  const primaryLogin = await loginInstance(PRIMARY_PORT, PRIMARY_DIR, 'primary');
  const standbyLogin = await loginInstance(STANDBY_PORT, STANDBY_DIR, 'standby');
  const primaryCookie = primaryLogin.cookie;
  const standbyCookie = standbyLogin.cookie;
  let primaryEntry = children.find((e) => e.label === 'primary');
  let standbyEntry = children.find((e) => e.label === 'standby');

  const api = (port, cookie) => ({
    getFailover: () => httpReq({ port, method: 'GET', path: '/api/settings/failover', cookie }),
    postFailover: (body) => httpReq({ port, method: 'POST', path: '/api/settings/failover', body, cookie }),
    testHeartbeat: (body) => httpReq({ port, method: 'POST', path: '/api/settings/failover/test', body, cookie }),
    getSession: () => httpReq({ port, method: 'GET', path: '/api/auth/session', cookie }),
    probe: (method, urlPath, body) => httpReq({ port, method, path: urlPath, body, cookie }),
    // Canonical HA surface (Phase 4 merge): peer-secret header for
    // the peer endpoints, session cookie for the console endpoints.
    getHaStatus: () => httpReq({ port, method: 'GET', path: '/api/ha/status', cookie }),
    getHaDecisions: () => httpReq({ port, method: 'GET', path: '/api/ha/decisions', cookie }),
    getHaSettings: () => httpReq({ port, method: 'GET', path: '/api/settings/ha', cookie }),
    postHaSettings: (body) => httpReq({ port, method: 'POST', path: '/api/settings/ha', body, cookie }),
    postHaHeartbeat: (body) => httpReq({ port, method: 'POST', path: '/api/ha/heartbeat', body, headers: { 'x-ha-peer-secret': PEER_SECRET } }),
  });
  const P = api(PRIMARY_PORT, primaryCookie);
  const S = api(STANDBY_PORT, standbyCookie);

  // Configure the pair on both nodes (same stored pair, roles as named).
  const cfgP = await P.postFailover(FAILOVER_PAIR());
  const cfgS = await S.postFailover(FAILOVER_PAIR());

  // Configure the CANONICAL HA pair (this is what drives the ticker,
  // heartbeats, promotion and demotion): primary knows the standby
  // URL, standby knows the primary URL, each knows its own URL.
  const primaryUrl = `http://${HOST}:${PRIMARY_PORT}`;
  const standbyUrl = `http://${HOST}:${STANDBY_PORT}`;
  const haCfgP = await P.postHaSettings({ role: 'primary', standbyUrl, nodeUrl: primaryUrl });
  const haCfgS = await S.postHaSettings({ role: 'standby', primaryUrl, nodeUrl: standbyUrl });
  log(`canonical HA configured: primary=${JSON.stringify(haCfgP.body?.ha || haCfgP.body)} standby=${JSON.stringify(haCfgS.body?.ha || haCfgS.body)}`);
  if (haCfgP.status !== 200 || haCfgS.status !== 200) {
    throw new Error(`canonical HA config failed: primary HTTP ${haCfgP.status}, standby HTTP ${haCfgS.status}`);
  }
  // Let a few heartbeats flow both ways before the cases start, and
  // confirm both directions are actually alive.
  await sleep(12000);
  const warmP = await P.getHaStatus();
  const warmS = await S.getHaStatus();
  log(`warm-up status: primary=${warmP.body?.ha?.status} role=${warmP.body?.ha?.role} peers=${(warmP.body?.ha?.peers || []).length} standby=${warmS.body?.ha?.status} role=${warmS.body?.ha?.role} peers=${(warmS.body?.ha?.peers || []).length}`);

  // ============================ C0 — baseline probe ======================
  {
    const c = newCase(
      'C0',
      'Baseline probe — canonical HA surface exists and answers',
      'GET /api/settings/failover returns the stored pair; heartbeat test does a real TCP connect; '
        + 'the canonical surface answers: GET /api/ha/status (200, healthy with both nodes up), '
        + 'GET /api/settings/ha (200, canonical settings), GET /api/ha/decisions (200, array), '
        + 'and POST /api/ha/heartbeat answers 401 without the peer secret.'
    );
    record(c, 'primary POST /api/settings/failover (pair config)', iso(), { method: 'POST', path: '/api/settings/failover' }, cfgP);
    record(c, 'standby POST /api/settings/failover (pair config)', iso(), { method: 'POST', path: '/api/settings/failover' }, cfgS);
    record(c, 'primary POST /api/settings/ha (canonical config)', iso(), { method: 'POST', path: '/api/settings/ha' }, haCfgP);
    record(c, 'standby POST /api/settings/ha (canonical config)', iso(), { method: 'POST', path: '/api/settings/ha' }, haCfgS);
    const gP = await P.getFailover();
    record(c, 'primary GET /api/settings/failover', iso(), { method: 'GET', path: '/api/settings/failover' }, gP);
    const gS = await S.getFailover();
    record(c, 'standby GET /api/settings/failover', iso(), { method: 'GET', path: '/api/settings/failover' }, gS);
    const hb = await P.testHeartbeat();
    record(c, 'primary POST /api/settings/failover/test (standby up)', iso(), { method: 'POST', path: '/api/settings/failover/test' }, hb);
    const haStatus = await P.getHaStatus();
    record(c, 'primary GET /api/ha/status', iso(), { method: 'GET', path: '/api/ha/status' }, haStatus);
    const haSettings = await P.getHaSettings();
    record(c, 'primary GET /api/settings/ha', iso(), { method: 'GET', path: '/api/settings/ha' }, haSettings);
    const decisions = await P.getHaDecisions();
    record(c, 'primary GET /api/ha/decisions', iso(), { method: 'GET', path: '/api/ha/decisions' }, decisions);
    const hbNoSecret = await P.probe('POST', '/api/ha/heartbeat', { peerId: 'probe', role: 'standby', url: standbyUrl, sentAt: Date.now() });
    record(c, 'primary POST /api/ha/heartbeat (no peer secret)', iso(), { method: 'POST', path: '/api/ha/heartbeat', body: { peerId: 'probe' } }, hbNoSecret);
    check(c, 'failover config stored on primary', cfgP.status === 200 && cfgP.body?.status === 'success', `HTTP ${cfgP.status}`);
    check(c, 'failover config stored on standby', cfgS.status === 200 && cfgS.body?.status === 'success', `HTTP ${cfgS.status}`);
    check(c, 'canonical HA config stored on primary', haCfgP.status === 200 && haCfgP.body?.ha?.role === 'primary', `HTTP ${haCfgP.status}`);
    check(c, 'canonical HA config stored on standby', haCfgS.status === 200 && haCfgS.body?.ha?.role === 'standby', `HTTP ${haCfgS.status}`);
    check(c, 'heartbeat test succeeds while standby is up', hb.status === 200 && hb.body?.reachable === true, JSON.stringify(hb.body));
    check(c, 'GET /api/ha/status exists (200, healthy, role primary)', haStatus.status === 200 && haStatus.body?.ha?.status === 'healthy' && haStatus.body?.ha?.role === 'primary', `HTTP ${haStatus.status} status=${JSON.stringify(haStatus.body?.ha?.status)}`);
    check(c, 'GET /api/settings/ha exists (200, heartbeatSec 5)', haSettings.status === 200 && haSettings.body?.ha?.heartbeatSec === 5 && haSettings.body?.ha?.missThreshold === 3, `HTTP ${haSettings.status}`);
    check(c, 'GET /api/ha/decisions exists (200, decisions array)', decisions.status === 200 && Array.isArray(decisions.body?.decisions), `HTTP ${decisions.status}`);
    check(c, 'POST /api/ha/heartbeat without peer secret is 401', hbNoSecret.status === 401, `HTTP ${hbNoSecret.status}`);
    const allOk = haStatus.status === 200 && haSettings.status === 200 && decisions.status === 200 && hbNoSecret.status === 401;
    verdict(c, allOk ? 'PASS' : 'FAIL');
    if (!allOk) {
      results.bugs.push({
        id: 'HA-001',
        title: 'Canonical HA surface missing or wrong at this tip',
        severity: 'missing-feature',
        reproduction: 'GET /api/ha/status, GET /api/settings/ha, GET /api/ha/decisions, or POST /api/ha/heartbeat (no secret) did not answer as specified in C0.',
        evidence: 'C0 responses in this file',
      });
    }
  }

  // ================= C1 — standby killed =================================
  {
    const c = newCase(
      'C1',
      'Standby killed -> primary reports degraded/unavailable, no false promotion',
      'With the standby process dead, the primary heartbeat test must report '
        + 'unreachable, the primary must surface the failure in GET /api/ha/status '
        + '(degraded while the peer row is within grace, unavailable once past it — '
        + 'the canonical service counts registered peers, not itself), the primary '
        + 'must stay up, and nothing may promote.'
    );
    const kill = await killInstance(standbyEntry, 'standby');
    c.responses.push({ label: 'standby process killed (SIGTERM)', at: kill.killedAt, request: { action: 'kill', pid: standby.pid }, response: { status: null, exitCode: kill.exitCode, signal: kill.signal } });
    await sleep(1000);
    const tcpDown = await tcpProbe(STANDBY_PORT, 1000);
    check(c, 'standby TCP port is actually down', tcpDown === false, `tcpProbe=${tcpDown}`);
    const hb = await P.testHeartbeat();
    record(c, 'primary POST /api/settings/failover/test (standby dead)', iso(), { method: 'POST', path: '/api/settings/failover/test' }, hb);
    const gP = await P.getFailover();
    record(c, 'primary GET /api/settings/failover (standby dead)', iso(), { method: 'GET', path: '/api/settings/failover' }, gP);
    const sess = await P.getSession();
    record(c, 'primary GET /api/auth/session (liveness, standby dead)', iso(), { method: 'GET', path: '/api/auth/session' }, sess);
    // The dead peer only goes stale once the 15s grace (5s x 3) passes
    // from its last heartbeat, so poll until the status leaves healthy.
    let haStatus = await P.getHaStatus();
    record(c, 'primary GET /api/ha/status (standby dead, +1s)', iso(), { method: 'GET', path: '/api/ha/status' }, haStatus);
    const staleDeadline = Date.now() + 25000;
    while (Date.now() < staleDeadline && haStatus.body?.ha?.status === 'healthy') {
      await sleep(2000);
      haStatus = await P.getHaStatus();
    }
    record(c, 'primary GET /api/ha/status (standby dead, past grace)', iso(), { method: 'GET', path: '/api/ha/status' }, haStatus);

    check(c, 'heartbeat test honestly reports standby unreachable', hb.status === 200 && hb.body?.reachable === false, JSON.stringify(hb.body));
    const haState = haStatus.body?.ha?.status;
    const degraded = haState === 'degraded' || haState === 'unavailable';
    check(c, 'primary GET /api/ha/status surfaces the failure (degraded|unavailable)', degraded, `ha.status=${JSON.stringify(haState)} standbyAlive=${JSON.stringify(haStatus.body?.ha?.standbyAlive)}`);
    check(c, 'primary stays up and serving (session 200)', sess.status === 200 && sess.body?.authenticated === true, `HTTP ${sess.status}`);
    const noPromotion = haStatus.status === 200 && haStatus.body?.ha?.role === 'primary';
    check(c, 'no false promotion (primary stays the only primary)', noPromotion, `GET /api/ha/status HTTP ${haStatus.status} role=${JSON.stringify(haStatus.body?.ha?.role)}`);
    verdict(c, degraded && hb.body?.reachable === false && sess.status === 200 ? 'PASS' : 'FAIL');
    if (!degraded) {
      results.bugs.push({
        id: 'HA-002',
        title: 'Primary does not surface the dead standby in GET /api/ha/status',
        severity: 'bug',
        reproduction: 'Kill the standby process, then GET /api/ha/status on the primary: ha.status stays healthy.',
        evidence: 'C1 responses in this file',
      });
    }
    // Bring the standby back for C2/C3.
    const standby2 = startInstance(STANDBY_DIR, STANDBY_PORT, 'standby');
    standbyEntry = children[children.length - 1]; // point liveness checks at the live process
    await waitForReady(STANDBY_PORT, 'standby (restarted)');
    const standbyCookie2 = (await loginInstance(STANDBY_PORT, STANDBY_DIR, 'standby (restarted)', standbyLogin.password)).cookie;
    // Rebind the S helper to the new session (all methods close over the cookie).
    S.getFailover = () => httpReq({ port: STANDBY_PORT, method: 'GET', path: '/api/settings/failover', cookie: standbyCookie2 });
    S.testHeartbeat = (body) => httpReq({ port: STANDBY_PORT, method: 'POST', path: '/api/settings/failover/test', body, cookie: standbyCookie2 });
    S.getSession = () => httpReq({ port: STANDBY_PORT, method: 'GET', path: '/api/auth/session', cookie: standbyCookie2 });
    S.probe = (method, urlPath, body) => httpReq({ port: STANDBY_PORT, method, path: urlPath, body, cookie: standbyCookie2 });
    S.getHaStatus = () => httpReq({ port: STANDBY_PORT, method: 'GET', path: '/api/ha/status', cookie: standbyCookie2 });
    S.getHaDecisions = () => httpReq({ port: STANDBY_PORT, method: 'GET', path: '/api/ha/decisions', cookie: standbyCookie2 });
    S.getHaSettings = () => httpReq({ port: STANDBY_PORT, method: 'GET', path: '/api/settings/ha', cookie: standbyCookie2 });
    S.postHaSettings = (body) => httpReq({ port: STANDBY_PORT, method: 'POST', path: '/api/settings/ha', body, cookie: standbyCookie2 });
    S.postHaHeartbeat = (body) => httpReq({ port: STANDBY_PORT, method: 'POST', path: '/api/ha/heartbeat', body, headers: { 'x-ha-peer-secret': PEER_SECRET } });
    const hbBack = await P.testHeartbeat();
    record(c, 'primary POST /api/settings/failover/test (standby back up)', iso(), { method: 'POST', path: '/api/settings/failover/test' }, hbBack);
    check(c, 'standby restart restores heartbeat success', hbBack.status === 200 && hbBack.body?.reachable === true, JSON.stringify(hbBack.body));
    // Heartbeats must resume both ways after the restart (canonical ticker).
    await sleep(7000);
    const warmBack = await S.getHaStatus();
    record(c, 'standby GET /api/ha/status (after restart)', iso(), { method: 'GET', path: '/api/ha/status' }, warmBack);
    check(c, 'standby is healthy again after restart (role standby)', warmBack.status === 200 && warmBack.body?.ha?.status === 'healthy' && warmBack.body?.ha?.role === 'standby', `ha.status=${JSON.stringify(warmBack.body?.ha?.status)} role=${JSON.stringify(warmBack.body?.ha?.role)}`);
    void standby2;
  }

  // ================= C2 — primary killed =================================
  {
    const c = newCase(
      'C2',
      'Primary killed -> standby promotes with a real decision record (exact timestamps)',
      'With the primary process dead, the standby must promote itself to primary '
        + 'and record the decision (when, why, gapMs) in GET /api/ha/decisions. '
        + 'Canonical grace is heartbeatSec(5) x missThreshold(3) = 15s from the '
        + 'last heartbeat, so the harness polls up to 45s for the promotion.'
    );
    const killedAtMs = Date.now();
    const primaryKilledAt = iso();
    const kill = await killInstance(primaryEntry, 'primary');
    c.responses.push({ label: 'primary process killed (SIGTERM)', at: primaryKilledAt, request: { action: 'kill', pid: primary.pid }, response: { status: null, exitCode: kill.exitCode, signal: kill.signal } });
    await sleep(3000); // first observation window
    const tcpDown = await tcpProbe(PRIMARY_PORT, 1000);
    check(c, 'primary TCP port is actually down', tcpDown === false, `tcpProbe=${tcpDown}`);
    const haEarly = await S.getHaStatus();
    record(c, 'standby GET /api/ha/status (primary dead, +3s)', iso(), { method: 'GET', path: '/api/ha/status' }, haEarly);
    // Poll for the promotion: the standby's ticker evaluates every 5s
    // and promotes once the primary is 15s past its last heartbeat.
    let promotedAtMs = null;
    let haStatus = haEarly;
    const pollDeadline = Date.now() + 45000;
    while (Date.now() < pollDeadline) {
      const s = await S.getHaStatus();
      haStatus = s;
      if (s.status === 200 && s.body?.ha?.role === 'primary') {
        promotedAtMs = Date.now();
        break;
      }
      await sleep(2000);
    }
    record(c, 'standby GET /api/ha/status (promoted)', iso(), { method: 'GET', path: '/api/ha/status' }, haStatus);
    const gapMs = promotedAtMs !== null ? promotedAtMs - killedAtMs : null;
    const decisions = await S.getHaDecisions();
    record(c, 'standby GET /api/ha/decisions (primary dead)', iso(), { method: 'GET', path: '/api/ha/decisions' }, decisions);
    const sess = await S.getSession();
    record(c, 'standby GET /api/auth/session (liveness, primary dead)', iso(), { method: 'GET', path: '/api/auth/session' }, sess);

    const promoted = haStatus.status === 200 && haStatus.body?.ha?.role === 'primary';
    check(c, 'standby reports role primary after primary death', promoted, `ha.role=${JSON.stringify(haStatus.body?.ha?.role)} gapMs=${gapMs}`);
    const promoteRecord = (decisions.body?.decisions || []).find((d) => d.action === 'ha.promote');
    const hasRecord = decisions.status === 200 && Boolean(promoteRecord);
    check(c, 'a ha.promote decision record exists with timestamps', hasRecord, `GET /api/ha/decisions HTTP ${decisions.status} promote=${JSON.stringify(promoteRecord)}`);
    check(c, 'promotion gap is within the grace window (10s..45s)', gapMs !== null && gapMs >= 10000 && gapMs <= 45000, `gapMs=${gapMs}`);
    check(c, 'standby stays up and serving (session 200)', sess.status === 200 && sess.body?.authenticated === true, `HTTP ${sess.status}`);
    verdict(c, promoted && hasRecord ? 'PASS' : 'FAIL');
    if (!promoted || !hasRecord) {
      results.bugs.push({
        id: 'HA-003',
        title: 'Missed promotion: standby does not promote when the primary is killed',
        severity: 'bug',
        reproduction: 'Two instances up, canonical HA pair configured. Kill the primary process (SIGTERM, pid recorded in C2). Poll the standby GET /api/ha/status for 45s: role never becomes primary, or GET /api/ha/decisions holds no ha.promote record.',
        evidence: 'C2 responses in this file (primary killed at ' + primaryKilledAt + ')',
      });
    }
  }

  // ================= C3 — primary returns ================================
  {
    const c = newCase(
      'C3',
      'Primary returns -> re-registration demotes the promoted standby, no dual-primary',
      'After the primary restarts, exactly one node may report role primary. '
        + 'The returning primary re-registers (POST /api/ha/register on boot); '
        + 'the promoted standby demotes on that handshake and records an '
        + 'ha.demote (primary-rejoined) decision. A second primary is a split-brain bug.'
    );
    const primary2 = startInstance(PRIMARY_DIR, PRIMARY_PORT, 'primary');
    primaryEntry = children[children.length - 1]; // point liveness checks at the live process
    await waitForReady(PRIMARY_PORT, 'primary (returned)');
    const primaryCookie2 = (await loginInstance(PRIMARY_PORT, PRIMARY_DIR, 'primary (returned)', primaryLogin.password)).cookie;
    P.getFailover = () => httpReq({ port: PRIMARY_PORT, method: 'GET', path: '/api/settings/failover', cookie: primaryCookie2 });
    P.getSession = () => httpReq({ port: PRIMARY_PORT, method: 'GET', path: '/api/auth/session', cookie: primaryCookie2 });
    P.probe = (method, urlPath, body) => httpReq({ port: PRIMARY_PORT, method, path: urlPath, body, cookie: primaryCookie2 });
    P.testHeartbeat = (body) => httpReq({ port: PRIMARY_PORT, method: 'POST', path: '/api/settings/failover/test', body, cookie: primaryCookie2 });
    P.getHaStatus = () => httpReq({ port: PRIMARY_PORT, method: 'GET', path: '/api/ha/status', cookie: primaryCookie2 });
    P.getHaDecisions = () => httpReq({ port: PRIMARY_PORT, method: 'GET', path: '/api/ha/decisions', cookie: primaryCookie2 });
    P.getHaSettings = () => httpReq({ port: PRIMARY_PORT, method: 'GET', path: '/api/settings/ha', cookie: primaryCookie2 });
    P.postHaSettings = (body) => httpReq({ port: PRIMARY_PORT, method: 'POST', path: '/api/settings/ha', body, cookie: primaryCookie2 });
    P.postHaHeartbeat = (body) => httpReq({ port: PRIMARY_PORT, method: 'POST', path: '/api/ha/heartbeat', body, headers: { 'x-ha-peer-secret': PEER_SECRET } });
    void primary2;
    // Poll for reconciliation: the returned primary registers on boot
    // (and its ticker retries), the promoted standby demotes on it.
    let haP = await P.getHaStatus();
    let haS = await S.getHaStatus();
    const rejoinDeadline = Date.now() + 25000;
    while (Date.now() < rejoinDeadline) {
      haP = await P.getHaStatus();
      haS = await S.getHaStatus();
      if (haP.body?.ha?.role === 'primary' && haS.body?.ha?.role === 'standby') break;
      await sleep(1000);
    }
    record(c, 'primary GET /api/ha/status (after restart)', iso(), { method: 'GET', path: '/api/ha/status' }, haP);
    record(c, 'standby GET /api/ha/status (primary back)', iso(), { method: 'GET', path: '/api/ha/status' }, haS);
    const gP = await P.getFailover();
    record(c, 'primary GET /api/settings/failover (after restart)', iso(), { method: 'GET', path: '/api/settings/failover' }, gP);
    const gS = await S.getFailover();
    record(c, 'standby GET /api/settings/failover (primary back)', iso(), { method: 'GET', path: '/api/settings/failover' }, gS);
    const decS = await S.getHaDecisions();
    record(c, 'standby GET /api/ha/decisions (primary back)', iso(), { method: 'GET', path: '/api/ha/decisions' }, decS);
    const hb = await P.testHeartbeat();
    record(c, 'primary POST /api/settings/failover/test (both up again)', iso(), { method: 'POST', path: '/api/settings/failover/test' }, hb);

    const roles = [];
    for (const [node, ha] of [['primary', haP], ['standby', haS]]) {
      if (ha.body?.ha?.role === 'primary') roles.push(node);
    }
    check(c, 'exactly one node reports role primary (no dual-primary)', roles.length === 1, `nodes reporting primary: ${JSON.stringify(roles)}`);
    check(c, 'returned primary is primary, standby is standby again', haP.body?.ha?.role === 'primary' && haS.body?.ha?.role === 'standby', `primary=${JSON.stringify(haP.body?.ha?.role)} standby=${JSON.stringify(haS.body?.ha?.role)}`);
    check(c, 'both nodes serve again after primary restart', haP.status === 200 && haS.status === 200, `primary HTTP ${haP.status}, standby HTTP ${haS.status}`);
    check(c, 'heartbeat succeeds with both nodes up', hb.status === 200 && hb.body?.reachable === true, JSON.stringify(hb.body));
    const demoteRecord = (decS.body?.decisions || []).find((d) => d.action === 'ha.demote' && d.detail && typeof d.detail.reason === 'string' && d.detail.reason.startsWith('primary-rejoined'));
    const reRegistered = Boolean(demoteRecord);
    check(c, 're-registration demote is recorded (ha.demote primary-rejoined)', reRegistered, `standby decisions=${JSON.stringify((decS.body?.decisions || []).map((d) => d.action))}`);
    verdict(c, roles.length > 1 ? 'FAIL' : reRegistered && roles.length === 1 ? 'PASS' : 'MISSING');
    if (roles.length > 1) {
      results.bugs.push({
        id: 'HA-004',
        title: 'Dual-primary after primary return (split brain)',
        severity: 'bug',
        reproduction: 'Kill primary, restart it while standby is up. Both nodes report role primary.',
        evidence: 'C3 responses in this file',
      });
    } else if (!reRegistered) {
      results.bugs.push({
        id: 'HA-005',
        title: 'No re-registration demote on primary return',
        severity: 'missing-feature',
        reproduction: 'Kill the primary, restart it. The promoted standby never demotes: no ha.demote (primary-rejoined) record appears in GET /api/ha/decisions on the standby.',
        evidence: 'C3 responses in this file',
      });
    }
  }

  // ================= C4 — heartbeat storm ================================
  {
    const c = newCase(
      'C4',
      'Heartbeat storm (rapid heartbeats) -> no crash, liveness stays correct',
      '50 concurrent heartbeat tests + 50 concurrent failover status reads must not '
        + 'crash either instance, must not produce 5xx, and liveness + heartbeat results '
        + 'must stay correct afterwards.'
    );
    const N = 50;
    const stormAt = iso();
    const hbResults = await Promise.all(
      Array.from({ length: N }, () => P.testHeartbeat())
    );
    const readResults = await Promise.all(
      Array.from({ length: N }, () => P.getFailover())
    );
    const hbOk = hbResults.filter((r) => r.status === 200 && r.body?.reachable === true).length;
    const hbErr = hbResults.filter((r) => r.status !== 200).length;
    const hb5xx = hbResults.filter((r) => r.status !== null && r.status >= 500).length;
    const readOk = readResults.filter((r) => r.status === 200).length;
    const latencies = hbResults.map((r) => r.ms || 0).sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95) - 1] ?? null;
    record(c, `storm: ${N}x POST /api/settings/failover/test (concurrent)`, stormAt, { method: 'POST', path: '/api/settings/failover/test', count: N }, {
      status: 200,
      body: {
        total: N,
        reachableTrue: hbOk,
        non200: hbErr,
        fiveXx: hb5xx,
        latencyMs: { min: latencies[0], p50: latencies[Math.floor(latencies.length / 2)], p95, max: latencies[latencies.length - 1] },
        sampleBodies: hbResults.slice(0, 3).map((r) => r.body),
        non200Bodies: hbResults.filter((r) => r.status !== 200).slice(0, 3).map((r) => ({ status: r.status, body: r.body, error: r.error })),
      },
    });
    record(c, `storm: ${N}x GET /api/settings/failover (concurrent)`, stormAt, { method: 'GET', path: '/api/settings/failover', count: N }, {
      status: 200,
      body: { total: N, http200: readOk, sampleBody: readResults[0]?.body },
    });
    const sessP = await P.getSession();
    const sessS = await S.getSession();
    record(c, 'primary GET /api/auth/session (after storm)', iso(), { method: 'GET', path: '/api/auth/session' }, sessP);
    record(c, 'standby GET /api/auth/session (after storm)', iso(), { method: 'GET', path: '/api/auth/session' }, sessS);
    const aliveP = isAlive(primaryEntry) && (await tcpProbe(PRIMARY_PORT, 1000));
    const aliveS = isAlive(standbyEntry) && (await tcpProbe(STANDBY_PORT, 1000));
    const hbAfter = await P.testHeartbeat();
    record(c, 'primary POST /api/settings/failover/test (after storm)', iso(), { method: 'POST', path: '/api/settings/failover/test' }, hbAfter);

    check(c, 'all storm heartbeat tests returned reachable:true', hbOk === N, `${hbOk}/${N} reachable:true, ${hbErr} non-200`);
    check(c, 'no 5xx during the storm', hb5xx === 0, `${hb5xx} 5xx`);
    check(c, 'all storm status reads returned 200', readOk === N, `${readOk}/${N}`);
    check(c, 'both processes still alive after the storm', aliveP && aliveS, `primary alive=${aliveP}, standby alive=${aliveS}`);
    check(c, 'liveness correct after storm (both sessions 200)', sessP.status === 200 && sessS.status === 200, `primary ${sessP.status}, standby ${sessS.status}`);
    check(c, 'heartbeat still correct after storm', hbAfter.status === 200 && hbAfter.body?.reachable === true, JSON.stringify(hbAfter.body));
    verdict(c, hbOk === N && hb5xx === 0 && readOk === N && aliveP && aliveS ? 'PASS' : 'FAIL');
    if (!(hbOk === N && hb5xx === 0 && aliveP && aliveS)) {
      results.bugs.push({
        id: 'HA-006',
        title: 'Heartbeat storm degrades or crashes an instance',
        severity: 'bug',
        reproduction: `50 concurrent POST /api/settings/failover/test + 50 concurrent GET /api/settings/failover on the primary (standby up). See C4 counts in this file.`,
        evidence: 'C4 responses in this file',
      });
    }
  }

  // ================= C5 — stale heartbeat ================================
  // Canonical form (Phase 4 merge): staleness is enforced at
  // POST /api/ha/heartbeat, which speaks the canonical protocol
  // ({peerId, role, url, sentAt} + peer secret). The legacy
  // POST /api/settings/failover/test is a one-shot TCP probe, not
  // heartbeat ingestion — it ignores any body by design, so it is
  // recorded here only to show it is unaffected by a stale stamp.
  {
    const c = newCase(
      'C5',
      'Stale heartbeat (old sentAt) -> rejected 400 stale_heartbeat, fresh accepted',
      'A canonical heartbeat carrying sentAt 24h old must be rejected '
        + '(400 stale_heartbeat), never treated as a live heartbeat; the '
        + 'same heartbeat with a fresh sentAt must be accepted (200).'
    );
    const staleMs = Date.now() - 24 * 60 * 60 * 1000;
    const hbStale = await P.postHaHeartbeat({ peerId: 'node-standby-probe', role: 'standby', url: standbyUrl, sentAt: staleMs });
    record(c, 'primary POST /api/ha/heartbeat with sentAt 24h old', iso(), { method: 'POST', path: '/api/ha/heartbeat', body: { peerId: 'node-standby-probe', role: 'standby', sentAt: staleMs } }, hbStale);
    const ingestFresh = await P.postHaHeartbeat({ peerId: 'node-standby-probe', role: 'standby', url: standbyUrl, sentAt: Date.now() });
    record(c, 'primary POST /api/ha/heartbeat with fresh sentAt (control)', iso(), { method: 'POST', path: '/api/ha/heartbeat', body: { peerId: 'node-standby-probe', role: 'standby', sentAt: 'now' } }, ingestFresh);
    const hbTest = await P.testHeartbeat({ nodeId: 'standby', timestamp: new Date(staleMs).toISOString(), heartbeatAt: new Date(staleMs).toISOString() });
    record(c, 'primary POST /api/settings/failover/test with 24h-old timestamp in body (TCP probe, by design)', iso(), { method: 'POST', path: '/api/settings/failover/test', body: { nodeId: 'standby', timestamp: new Date(staleMs).toISOString() } }, hbTest);
    // The stale heartbeat must NOT have refreshed the probe peer's liveness.
    const peersAfter = await P.probe('GET', '/api/ha/peers');
    record(c, 'primary GET /api/ha/peers (after stale + fresh)', iso(), { method: 'GET', path: '/api/ha/peers' }, peersAfter);
    const probeRow = (peersAfter.body?.peers || []).find((p) => p.peerId === 'node-standby-probe');

    const staleRejected = hbStale.status === 400 && hbStale.body?.error === 'stale_heartbeat';
    check(c, 'stale heartbeat explicitly rejected (400 stale_heartbeat)', staleRejected, `HTTP ${hbStale.status} body=${JSON.stringify(hbStale.body)}`);
    check(c, 'fresh heartbeat accepted (200 ack)', ingestFresh.status === 200 && ingestFresh.body?.status === 'success', `HTTP ${ingestFresh.status} body=${JSON.stringify(ingestFresh.body)}`);
    check(c, 'TCP probe ignores the stale stamp by design (still reachable:true)', hbTest.status === 200 && hbTest.body?.reachable === true, `HTTP ${hbTest.status} body=${JSON.stringify(hbTest.body)}`);
    check(c, 'probe peer liveness comes from the fresh heartbeat (heartbeatCount>=1)', Boolean(probeRow && probeRow.heartbeatCount >= 1), `peer row=${JSON.stringify(probeRow)}`);
    verdict(c, staleRejected && ingestFresh.status === 200 ? 'PASS' : 'FAIL');
    if (!staleRejected || ingestFresh.status !== 200) {
      results.bugs.push({
        id: 'HA-007',
        title: 'Stale-heartbeat rejection missing or fresh heartbeat refused',
        severity: 'bug',
        reproduction: 'POST /api/ha/heartbeat with sentAt 24h old (peer secret, canonical body) must return 400 stale_heartbeat; the same body with a fresh sentAt must return 200.',
        evidence: 'C5 responses in this file (stale sentAt used: ' + staleMs + ')',
      });
    }
  }
}

async function shutdown() {
  if (LEAVE_UP) {
    log('(--leave-up: instances left running; kill only these PIDs, nothing else)');
    for (const e of children) log(`  ${e.label}: pid=${e.proc.pid} port=${e.port}`);
    return;
  }
  for (const e of [...children].reverse()) {
    try {
      await killInstance(e, `${e.label} (shutdown)`);
    } catch (err) {
      log(`${e.label} shutdown error: ${err.message}`);
    }
  }
}

(async () => {
  let exitCode = 0;
  try {
    await main();
  } catch (err) {
    log(`FATAL: ${err.message}`);
    results.fatalError = err.message;
    exitCode = 1;
  } finally {
    const failed = results.cases.filter((c) => c.verdict === 'FAIL').length;
    const missing = results.cases.filter((c) => c.verdict === 'MISSING').length;
    results.summary = {
      cases: results.cases.length,
      pass: results.cases.filter((c) => c.verdict === 'PASS').length,
      fail: failed,
      missing,
      bugs: results.bugs.map((b) => b.id),
    };
    try {
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2) + '\n');
      log(`results written: ${RESULTS_PATH}`);
    } catch (err) {
      log(`could not write results: ${err.message}`);
    }
    console.log('\n=== HA chaos tests — summary ===');
    for (const c of results.cases) console.log(`  ${c.id} ${c.verdict.padEnd(7)} ${c.title}`);
    console.log(`  bugs: ${results.bugs.map((b) => b.id).join(', ') || 'none'}`);
    await shutdown();
  }
  if (results.summary && results.summary.fail > 0) exitCode = 1;
  process.exit(exitCode);
})();
