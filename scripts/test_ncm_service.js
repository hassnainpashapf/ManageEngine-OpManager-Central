'use strict';
/**
 * test_ncm_service.js — unit-level proof for server/services/ncm.js.
 *
 * Drives the REAL service against the REAL SQLite store with a throwaway
 * database (OPMANAGER_DB_PATH points at a temp file created by this
 * script; the repo's own server/data/opmanager.db is never touched).
 * No HTTP server is started and no device is contacted — the service
 * itself opens no connection, so "dry-run writes nothing" is proven by
 * construction plus by the result's sentToDevice:false marker.
 *
 * Run:  node scripts/test_ncm_service.js
 * Exit 0 = all checks pass; non-zero = first failure (message printed).
 *
 * PHASE 4 MERGE (branch p4m-ncm): adapted to the canonical service —
 * store key is 'settings.ncm' (was 'ncm'), the throwaway DB lives under
 * ~/workspace/opm-p4/m6-work/ (NOT /tmp — /tmp fills up), and a 9th
 * check proves the merged probe-target push staging (deviceId null +
 * configurationType, from the ncm-push track).
 */

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Throwaway DB under the merge work dir (workspace scratch, not /tmp).
const tmpDir = fs.mkdtempSync(path.join(__dirname, '..', '..', 'm6-work', 'svc-test-'));
const dbPath = path.join(tmpDir, 'opmanager-test.db');
process.env.OPMANAGER_DB_PATH = dbPath;

const store = require('../server/services/store');
const ncm = require('../server/services/ncm');

const COMMANDS = [
  'interface GigabitEthernet0/1',
  'description Uplink-to-Core',
  'no shutdown',
];

function expectCode(fn, code, label) {
  let err = null;
  try {
    fn();
  } catch (e) {
    err = e;
  }
  assert.ok(err, `${label}: expected an error but none was thrown`);
  assert.strictEqual(err.code, code, `${label}: expected code '${code}', got '${err.code}' (${err.message})`);
  return err;
}

function main() {
  // A real device row in the throwaway DB: stage() refuses phantom devices.
  const device = store.createDevice({
    ip: '192.168.30.2',
    hostname: 'techub-core',
    sys_name: 'techub-core',
    vendor: 'Cisco',
    model: 'Catalyst 9300',
    category: 'Switch',
    snmp_version: 'v2c',
    snmp_community: 'public',
    status: 'Up',
  });
  assert.ok(Number.isInteger(device.id), 'device row must have an integer id');
  console.log(`device created: id=${device.id} ip=${device.ip}`);

  // --- 1. stage stores a pending approval with the EXACT commands/diff ---
  const callerCommands = [...COMMANDS];
  const staged = ncm.stage(store, {
    deviceId: device.id,
    action: 'push-config',
    commands: callerCommands,
    diff: '+ interface GigabitEthernet0/1\n+ description Uplink-to-Core\n+ no shutdown',
    createdBy: 'hasnain',
  });
  assert.strictEqual(staged.status, 'pending', 'staged approval must be pending');
  assert.deepStrictEqual(staged.commands, COMMANDS, 'staged commands must equal the input exactly');
  assert.strictEqual(staged.createdBy, 'hasnain');
  assert.ok(staged.id, 'staged approval must have an id');
  assert.ok(staged.createdAt, 'staged approval must have createdAt');
  // Mutating the caller's array afterwards must not change stored commands.
  callerCommands.push('interface GigabitEthernet0/2');
  const reRead = ncm.getApproval(store, staged.id);
  assert.deepStrictEqual(reRead.commands, COMMANDS, 'stored commands must be a copy, not the caller array');
  console.log(`1. stage OK: id=${staged.id} status=${staged.status} commands=${JSON.stringify(staged.commands)}`);

  // --- 2. stage -> approve -> dry-run execute (exact commands echoed) ---
  const approved = ncm.approve(store, staged.id, 'admin');
  assert.strictEqual(approved.status, 'approved');
  assert.strictEqual(approved.decidedBy, 'admin', 'approve must record decidedBy');
  assert.ok(approved.decidedAt, 'approve must record decidedAt');
  console.log(`2a. approve OK: status=${approved.status} decidedBy=${approved.decidedBy} decidedAt=${approved.decidedAt}`);

  const result = ncm.execute(store, staged.id, { executedBy: 'admin' });
  assert.strictEqual(result.dryRun, true, 'execute must be dry-run in this phase');
  assert.strictEqual(result.sentToDevice, false, 'dry-run must not send anything to the device');
  assert.deepStrictEqual(result.commands, COMMANDS, 'dry-run must echo the exact staged commands');
  assert.deepStrictEqual(result.wouldSend, COMMANDS, 'wouldSend must equal the staged commands');
  assert.strictEqual(result.status, 'dry-run', 'approval must move to dry-run status');
  assert.strictEqual(result.executedBy, 'admin');
  assert.ok(result.executedAt, 'dry-run execute must record executedAt');
  console.log(`2b. dry-run execute OK: dryRun=${result.dryRun} sentToDevice=${result.sentToDevice} status=${result.status} commands=${JSON.stringify(result.commands)}`);

  // Re-running dry-run on the same approval is allowed and still dry-run.
  const again = ncm.execute(store, staged.id);
  assert.strictEqual(again.dryRun, true);
  assert.strictEqual(again.sentToDevice, false);
  assert.deepStrictEqual(again.commands, COMMANDS);
  assert.strictEqual(again.executedBy, 'admin', 're-run defaults executedBy to decidedBy');
  console.log('2c. dry-run re-execute OK: still dry-run, exact commands echoed');

  // --- 3. stage -> reject -> execute refused ---
  const doomed = ncm.stage(store, {
    deviceId: device.id,
    action: 'push-config',
    commands: ['hostname should-not-apply'],
    createdBy: 'hasnain',
  });
  const rejected = ncm.reject(store, doomed.id, 'admin');
  assert.strictEqual(rejected.status, 'rejected');
  assert.strictEqual(rejected.decidedBy, 'admin');
  assert.ok(rejected.decidedAt);
  const rejErr = expectCode(
    () => ncm.execute(store, doomed.id),
    'invalid_state',
    '3. execute after reject'
  );
  assert.match(rejErr.message, /rejected/);
  console.log(`3. reject->execute refused OK: status=${rejected.status} error=${rejErr.code} "${rejErr.message}"`);

  // --- 4. execute without approval (still pending) -> refused ---
  const pending = ncm.stage(store, {
    deviceId: device.id,
    action: 'push-config',
    commands: ['interface GigabitEthernet0/3', 'shutdown'],
    createdBy: 'hasnain',
  });
  const pendErr = expectCode(
    () => ncm.execute(store, pending.id),
    'invalid_state',
    '4. execute while pending'
  );
  assert.match(pendErr.message, /not been approved/);
  assert.strictEqual(ncm.getApproval(store, pending.id).status, 'pending', 'failed execute must leave status pending');
  console.log(`4. execute-pending refused OK: error=${pendErr.code} "${pendErr.message}"`);

  // --- 5. illegal transitions refused ---
  expectCode(() => ncm.approve(store, staged.id, 'admin'), 'invalid_state', '5a. approve a dry-run approval');
  expectCode(() => ncm.reject(store, staged.id, 'admin'), 'invalid_state', '5b. reject a dry-run approval');
  expectCode(() => ncm.approve(store, doomed.id, 'admin'), 'invalid_state', '5c. approve a rejected approval');
  expectCode(() => ncm.reject(store, pending.id, ''), 'validation', '5d. reject without decidedBy');
  expectCode(() => ncm.approve(store, 'no-such-id', 'admin'), 'not_found', '5e. approve unknown id');
  expectCode(() => ncm.execute(store, 'no-such-id'), 'not_found', '5f. execute unknown id');
  console.log('5. illegal transitions refused OK (approve/reject/execute on wrong state, unknown id, missing decidedBy)');

  // --- 6. validation: bad stage inputs refused, nothing staged ---
  const before = ncm.listApprovals(store).length;
  expectCode(
    () => ncm.stage(store, { deviceId: device.id, action: 'push-config', commands: [], createdBy: 'hasnain' }),
    'validation',
    '6a. empty commands'
  );
  expectCode(
    () => ncm.stage(store, { deviceId: device.id, action: 'push-config', commands: ['ok'], createdBy: '' }),
    'validation',
    '6b. missing createdBy'
  );
  expectCode(
    () => ncm.stage(store, { deviceId: device.id, action: '', commands: ['ok'], createdBy: 'hasnain' }),
    'validation',
    '6c. missing action'
  );
  expectCode(
    () => ncm.stage(store, { deviceId: 999999, action: 'push-config', commands: ['ok'], createdBy: 'hasnain' }),
    'not_found',
    '6d. phantom device'
  );
  assert.strictEqual(ncm.listApprovals(store).length, before, 'failed stages must not create approvals');
  console.log('6. stage validation OK (empty commands, missing createdBy/action, phantom device all refused)');

  // --- 7. persistence: canonical settings.ncm shape + audit trail ---
  const raw = store.getSetting('settings.ncm');
  const parsed = JSON.parse(raw);
  assert.ok(Array.isArray(parsed.approvals), 'settings.ncm must hold { approvals: [...] }');
  assert.strictEqual(parsed.approvals.length, 3, 'exactly the 3 successful device stages must be persisted at this point (the probe push in check 9 makes 4)');
  const persisted = parsed.approvals.find((a) => a.id === staged.id);
  assert.strictEqual(persisted.status, 'dry-run');
  assert.deepStrictEqual(persisted.commands, COMMANDS);
  assert.strictEqual(persisted.decidedBy, 'admin');
  assert.strictEqual(persisted.dryRun, true);
  console.log(`7a. persistence OK: settings.ncm holds ${parsed.approvals.length} approvals; first is status=${persisted.status}`);

  const audit = ncm.listAudit(store, 100);
  const actions = audit.map((a) => a.action);
  for (const expected of ['ncm.stage', 'ncm.approve', 'ncm.execute.dry-run', 'ncm.reject']) {
    assert.ok(actions.includes(expected), `audit trail must contain ${expected}`);
  }
  const stageRows = audit.filter((a) => a.action === 'ncm.stage');
  assert.strictEqual(stageRows.length, 3, 'one ncm.stage audit row per successful stage');
  console.log(`7b. audit OK: ${audit.length} ncm.* audit rows (${actions.join(', ')})`);

  // --- 8. list/get filters ---
  assert.strictEqual(ncm.listApprovals(store, { status: 'pending' }).length, 1);
  assert.strictEqual(ncm.listApprovals(store, { status: 'dry-run' }).length, 1);
  assert.strictEqual(ncm.listApprovals(store, { status: 'rejected' }).length, 1);
  assert.strictEqual(ncm.listApprovals(store, { deviceId: device.id }).length, 3);
  assert.strictEqual(ncm.getApproval(store, 'no-such-id'), null);
  console.log('8. list/get filters OK');

  // --- 9. probe-target push staging (ncm-push track, merged) ---
  // deviceId null + configurationType stages a push for a probe, keeps
  // the extras, and goes through the same gate (approve -> re-runnable
  // dry-run). A null deviceId WITHOUT configurationType is refused.
  expectCode(
    () => ncm.stage(store, { deviceId: null, action: 'push', commands: ['x'], createdBy: 'hasnain' }),
    'validation',
    '9a. null deviceId without configurationType'
  );
  const push = ncm.stage(store, {
    deviceId: null,
    configurationType: 'baseline-config',
    targetProbeId: 'probe-1',
    commands: ['snmp-server community public RO'],
    createdBy: 'hasnain',
  });
  assert.strictEqual(push.status, 'pending');
  assert.strictEqual(push.deviceId, null);
  assert.strictEqual(push.action, 'push');
  assert.strictEqual(push.configurationType, 'baseline-config');
  assert.strictEqual(push.targetProbeId, 'probe-1');
  const pushApproved = ncm.approve(store, push.id, 'admin');
  assert.strictEqual(pushApproved.status, 'approved');
  const pushRun = ncm.execute(store, push.id, { executedBy: 'admin' });
  assert.strictEqual(pushRun.dryRun, true);
  assert.strictEqual(pushRun.sentToDevice, false);
  assert.deepStrictEqual(pushRun.commands, ['snmp-server community public RO']);
  assert.strictEqual(ncm.getApproval(store, push.id).status, 'dry-run');
  assert.strictEqual(ncm.listApprovals(store).length, 4, '3 device stages + 1 probe push');
  assert.strictEqual(ncm.listApprovals(store, { status: 'dry-run' }).length, 2);
  console.log(`9. probe-push stage/approve/dry-run OK: id=${push.id} configurationType=${push.configurationType} targetProbeId=${push.targetProbeId} status=dry-run`);

  console.log('\nALL NCM SERVICE TESTS PASSED');
  console.log(`throwaway DB: ${dbPath}`);
}

try {
  main();
} finally {
  // Leave the throwaway DB on disk for inspection; it lives under the
  // OS temp dir and is never the repo's real database.
}
process.exit(0);
