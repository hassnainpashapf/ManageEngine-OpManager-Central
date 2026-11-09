'use strict';
/**
 * test_ncm_drift.js — live HTTP proof for drift resolution through the
 * approval gate (server/routes/diff.js + server/services/ncm.js).
 *
 * Drives the REAL server on $PORT (default 8131) against a THROWAWAY database
 * (OPMANAGER_DB_PATH points at a temp file; the repo's own
 * server/data/opmanager.db is never touched). The bootstrap admin
 * password is read at runtime from server/data/.admin-initial (created by
 * the server on first run, mode 600, gitignored) and changed immediately
 * to a random in-memory password; no credential is printed or stored.
 *
 * Seed data (via the real store.saveConfig path, before the server starts):
 *   - Techub-Core (192.168.30.2): a stored 'baseline' config and a stored
 *     'running' (current) config that differ by exactly 4 lines. The config
 *     text is a seeded realistic excerpt stored through the real store —
 *     it is NOT a live fetch from the switch (no fetch path exists yet;
 *     that is the ncm-backup track's job). The diff, the staging, the
 *     approval gate and the dry-run are all the real code paths.
 *   - A second device with only a 'running' config (no baseline) -> 422.
 *   - A third device whose baseline == current -> 200, no drift.
 *
 * Checks, in order:
 *   1. resolve-drift with no deviceId -> 400
 *   2. resolve-drift with unknown deviceId -> 404
 *   3. resolve-drift, device with no baseline -> 422 naming 'baseline'
 *   4. resolve-drift, Techub-Core -> 202, approval pending, exact diff
 *      (added 3 / removed 1) and the exact 4 remediation commands
 *   5. GET /api/ccm/diff still works (regression: insufficient-data reason)
 *   6. execute BEFORE approval (dryRun true) -> 409 approval_required
 *   7. approve -> 200, status 'approved' (nothing executed)
 *   8. execute with dryRun:false -> 422 dry_run_only
 *   9. execute with dryRun:true -> 200, dryRun true, sentToDevice false,
 *      approval status 'dry-run'
 *  10. GET approval -> status 'dry-run'; re-approve -> 409
 *  11. resolve-drift, in-sync device -> 200, hasDrift false, no approval
 *  12. No endpoint in this flow ever returns 501.
 *
 * PHASE 4 MERGE (branch p4m-ncm): throwaway DB under
 * ~/workspace/opm-p4/m6-work/ (NOT /tmp — /tmp fills up); PORT from env
 * (default 8131, this merge run uses 8165).
 */

const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PORT = Number(process.env.PORT || 8131);
const BASE = `http://127.0.0.1:${PORT}`;
const ROOT = path.join(__dirname, '..');

const tmpDir = fs.mkdtempSync(path.join(__dirname, '..', '..', 'm6-work', 'drift-test-'));
const dbPath = path.join(tmpDir, 'opmanager-test.db');
process.env.OPMANAGER_DB_PATH = dbPath;

const BASELINE = [
  '!',
  'hostname Techub-Core',
  'interface GigabitEthernet0/1',
  ' description Uplink-to-Core',
  ' switchport mode trunk',
  'interface GigabitEthernet0/2',
  ' description Downlink-to-Ground',
  ' switchport mode access',
  '!',
  'ip domain-name techub.home.arpa',
].join('\n');

const CURRENT = [
  '!',
  'hostname Techub-Core',
  'interface GigabitEthernet0/1',
  ' description Uplink-to-Core',
  ' switchport mode trunk',
  ' switchport trunk allowed vlan 10,20',
  'interface GigabitEthernet0/2',
  ' description Downlink-to-Ground-CHANGED',
  ' switchport mode access',
  '!',
  'ip domain-name techub.home.arpa',
  'ip name-server 8.8.8.8',
].join('\n');

const EXPECTED_ADDED = [
  ' switchport trunk allowed vlan 10,20',
  ' description Downlink-to-Ground-CHANGED',
  'ip name-server 8.8.8.8',
];
const EXPECTED_REMOVED = [' description Downlink-to-Ground'];
const EXPECTED_COMMANDS = [
  'no switchport trunk allowed vlan 10,20',
  'no description Downlink-to-Ground-CHANGED',
  'no ip name-server 8.8.8.8',
  'description Downlink-to-Ground',
];

let server = null;
let cookie = '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(method, p, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + p, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const m = setCookie.match(/opm_session=[^;]+/);
    if (m) cookie = m[0];
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  assert.notStrictEqual(res.status, 501, `${method} ${p} returned 501 — the old unconditional 501 is back`);
  return { status: res.status, json };
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  for (;;) {
    try {
      const res = await fetch(`${BASE}/api/auth/session`);
      if (res.status) return;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error('server did not start within 30s');
    await sleep(500);
  }
}

async function main() {
  // ---- seed (real store, throwaway DB, server not yet running) ----
  const store = require('../server/services/store');
  const core = store.createDevice({
    ip: '192.168.30.2',
    hostname: 'Techub-Core',
    sys_name: 'Techub-Core',
    vendor: 'Cisco',
    model: 'Catalyst 9300',
    category: 'Switch',
    snmp_version: 'v2c',
    snmp_community: 'public',
    status: 'Up',
  });
  store.saveConfig(core.id, 'baseline', BASELINE);
  store.saveConfig(core.id, 'running', CURRENT);
  const noBaseline = store.createDevice({
    ip: '192.168.30.3',
    hostname: 'Ground-Switch',
    sys_name: 'Ground-Switch',
    vendor: 'Cisco',
    model: 'Catalyst 9300',
    category: 'Switch',
    snmp_version: 'v2c',
    snmp_community: 'public',
    status: 'Up',
  });
  store.saveConfig(noBaseline.id, 'running', CURRENT);
  const inSync = store.createDevice({
    ip: '192.168.30.4',
    hostname: 'First-Floor-Switch',
    sys_name: 'First-Floor-Switch',
    vendor: 'Cisco',
    model: 'Catalyst 9300',
    category: 'Switch',
    snmp_version: 'v2c',
    snmp_community: 'public',
    status: 'Up',
  });
  store.saveConfig(inSync.id, 'baseline', BASELINE);
  store.saveConfig(inSync.id, 'running', BASELINE);
  console.log(`seeded: Techub-Core id=${core.id} (baseline+running), no-baseline id=${noBaseline.id}, in-sync id=${inSync.id}`);
  if (typeof store.checkpointAndClose === 'function') store.checkpointAndClose();

  // ---- start the real server on $PORT ----
  server = spawn('node', ['server/index.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), OPMANAGER_DB_PATH: dbPath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on('data', (d) => process.stdout.write(`[server:err] ${d}`));
  await waitForServer();
  console.log(`server up on :${PORT}`);

  // ---- login as bootstrap admin, change password, re-login ----
  // (bootstrap password read at runtime only; never printed or stored)
  const bootstrap = fs.readFileSync(path.join(ROOT, 'server', 'data', '.admin-initial'), 'utf8').trim();
  let r = await api('POST', '/api/auth/login', { username: 'admin', password: bootstrap });
  assert.strictEqual(r.status, 200, `login failed: ${JSON.stringify(r.json)}`);
  const newPassword = crypto.randomBytes(12).toString('base64url');
  r = await api('POST', '/api/auth/change-password', { currentPassword: bootstrap, newPassword });
  assert.strictEqual(r.status, 200, `password change failed: ${JSON.stringify(r.json)}`);
  cookie = '';
  r = await api('POST', '/api/auth/login', { username: 'admin', password: newPassword });
  assert.strictEqual(r.status, 200, `re-login failed: ${JSON.stringify(r.json)}`);
  console.log('logged in as admin (bootstrap password changed, must-change cleared)');

  // ---- 1. no deviceId -> 400 ----
  r = await api('POST', '/api/ccm/resolve-drift', {});
  assert.strictEqual(r.status, 400, `expected 400, got ${r.status}: ${JSON.stringify(r.json)}`);
  console.log('1. no deviceId -> 400 ok');

  // ---- 2. unknown device -> 404 ----
  r = await api('POST', '/api/ccm/resolve-drift', { deviceId: 99999 });
  assert.strictEqual(r.status, 404, `expected 404, got ${r.status}: ${JSON.stringify(r.json)}`);
  console.log('2. unknown device -> 404 ok');

  // ---- 3. device with no baseline -> 422 naming baseline ----
  r = await api('POST', '/api/ccm/resolve-drift', { deviceId: noBaseline.id });
  assert.strictEqual(r.status, 422, `expected 422, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.deepStrictEqual(r.json.missing, ['baseline'], `expected missing ['baseline'], got ${JSON.stringify(r.json.missing)}`);
  console.log(`3. no baseline -> 422 ok (missing: ${r.json.missing.join(',')})`);

  // ---- 4. Techub-Core -> 202 staged, exact diff + commands ----
  r = await api('POST', '/api/ccm/resolve-drift', { deviceId: core.id });
  assert.strictEqual(r.status, 202, `expected 202, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.hasDrift, true);
  assert.strictEqual(r.json.addedLinesCount, 3, `addedLinesCount: ${r.json.addedLinesCount}`);
  assert.strictEqual(r.json.removedLinesCount, 1, `removedLinesCount: ${r.json.removedLinesCount}`);
  assert.deepStrictEqual(r.json.addedLines, EXPECTED_ADDED);
  assert.deepStrictEqual(r.json.removedLines, EXPECTED_REMOVED);
  assert.deepStrictEqual(r.json.commands, EXPECTED_COMMANDS);
  assert.strictEqual(r.json.baselineType, 'baseline');
  assert.strictEqual(r.json.currentType, 'running');
  assert.strictEqual(r.json.executed, false);
  assert.strictEqual(r.json.approval.status, 'pending');
  const approvalId = r.json.approvalId;
  assert.ok(typeof approvalId === 'string' && approvalId.length > 0, 'approvalId missing');
  console.log(`4. Techub-Core -> 202 ok (approval ${approvalId}, status pending)`);
  console.log(`   added (${r.json.addedLinesCount}): ${JSON.stringify(r.json.addedLines)}`);
  console.log(`   removed (${r.json.removedLinesCount}): ${JSON.stringify(r.json.removedLines)}`);
  console.log(`   commands: ${JSON.stringify(r.json.commands)}`);

  // ---- 5. GET /api/ccm/diff still works (regression) ----
  r = await api('GET', `/api/ccm/diff?deviceId=${core.id}`);
  assert.strictEqual(r.status, 200, `GET diff failed: ${r.status}`);
  assert.ok(typeof r.json.reason === 'string' && r.json.reason.includes('startup'),
    `expected insufficient-data reason mentioning startup, got: ${JSON.stringify(r.json.reason)}`);
  console.log(`5. GET /api/ccm/diff regression ok (reason: "${r.json.reason}")`);

  // ---- 6. execute BEFORE approval -> 409 approval_required ----
  r = await api('POST', `/api/ccm/drift-approvals/${approvalId}/execute`, { dryRun: true });
  assert.strictEqual(r.status, 409, `expected 409, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.error, 'approval_required');
  assert.strictEqual(r.json.sentToDevice, false);
  console.log(`6. unapproved execute -> 409 approval_required ok ("${r.json.message}")`);

  // ---- 7. approve -> 200 approved, nothing executed ----
  r = await api('POST', `/api/ccm/drift-approvals/${approvalId}/approve`, {});
  assert.strictEqual(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.approval.status, 'approved');
  assert.strictEqual(r.json.executed, false);
  console.log('7. approve -> 200 approved ok (executed: false)');

  // ---- 8. execute with dryRun:false -> 422 dry_run_only ----
  r = await api('POST', `/api/ccm/drift-approvals/${approvalId}/execute`, { dryRun: false });
  assert.strictEqual(r.status, 422, `expected 422, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.error, 'dry_run_only');
  assert.strictEqual(r.json.sentToDevice, false);
  console.log('8. execute dryRun:false -> 422 dry_run_only ok');

  // ---- 9. execute with dryRun:true -> 200 dry-run, nothing sent ----
  r = await api('POST', `/api/ccm/drift-approvals/${approvalId}/execute`, { dryRun: true });
  assert.strictEqual(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.dryRun, true);
  assert.strictEqual(r.json.sentToDevice, false);
  assert.strictEqual(r.json.status, 'dry-run');
  assert.deepStrictEqual(r.json.commands, EXPECTED_COMMANDS);
  assert.deepStrictEqual(r.json.wouldSend, EXPECTED_COMMANDS);
  console.log(`9. execute dryRun:true -> 200 ok (dryRun: true, sentToDevice: false, status: ${r.json.status})`);

  // ---- 10. GET approval -> dry-run; re-approve -> 409 ----
  r = await api('GET', `/api/ccm/drift-approvals/${approvalId}`);
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.approval.status, 'dry-run');
  r = await api('POST', `/api/ccm/drift-approvals/${approvalId}/approve`, {});
  assert.strictEqual(r.status, 409, `expected 409 on re-approve, got ${r.status}`);
  console.log('10. GET approval status dry-run ok; re-approve -> 409 ok');

  // ---- 11. in-sync device -> 200, no drift, no approval ----
  r = await api('POST', '/api/ccm/resolve-drift', { deviceId: inSync.id });
  assert.strictEqual(r.status, 200, `expected 200, got ${r.status}: ${JSON.stringify(r.json)}`);
  assert.strictEqual(r.json.hasDrift, false);
  assert.strictEqual(r.json.approvalId, null);
  console.log('11. in-sync device -> 200 hasDrift:false, approvalId:null ok');

  // ---- 12. unknown approval -> 404 ----
  r = await api('GET', '/api/ccm/drift-approvals/00000000-0000-0000-0000-000000000000');
  assert.strictEqual(r.status, 404, `expected 404, got ${r.status}`);
  console.log('12. unknown approval -> 404 ok');

  console.log('ALL NCM-DRIFT CHECKS PASSED');
}

main()
  .catch((err) => {
    console.error(`FAIL: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    if (server) {
      try {
        server.kill('SIGTERM');
      } catch {
        /* already gone */
      }
    }
  });
