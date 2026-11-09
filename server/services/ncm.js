'use strict';
/**
 * ncm.js — NCM staging + approval-gate service (Phase 3, real-data branch).
 *
 * This is the ONLY place in this build where a config change to a device
 * may be staged, approved, or executed. The gate is absolute:
 *
 *   stage()   — records a pending approval holding the EXACT commands and
 *               diff that would be sent. It NEVER executes anything and
 *               NEVER touches a device (no network call of any kind).
 *   approve() / reject() — the only transitions out of 'pending'. Both
 *               record decidedBy + decidedAt. Any other transition is
 *               refused with an error carrying code 'invalid_state'.
 *   execute() — runs ONLY when the approval is 'approved' (or a previous
 *               dry-run of the same approval, which is re-runnable).
 *               PHASE 3 LIMIT: execute() runs ONLY in dry-run mode. It
 *               returns the exact commands that WOULD be sent plus a
 *               dry-run marker, writes NOTHING to any device, and opens
 *               no connection. A live push is NOT implemented in this
 *               phase — there is no real config transport, and any future
 *               one must call this gate first and execute only from an
 *               approved change.
 *
 * Persistence — the canonical shape from SHARED.md, under settings key
 * 'settings.ncm' (SQLite, via store.settings):
 *   settings.ncm = { approvals: [ { id, deviceId, action, diff, commands,
 *     status: 'pending'|'approved'|'rejected'|'executed'|'dry-run',
 *     createdBy, createdAt, decidedBy, decidedAt,
 *     executedBy, executedAt, dryRun } ] }
 * Every transition is also written to the store's audit_log
 * (store.log) — the persisted audit trail for the approval lifecycle.
 * Audit actions are ncm.stage / ncm.approve / ncm.reject /
 * ncm.execute.dry-run, with ISO timestamps (createdAt/decidedAt/
 * executedAt are ISO strings; *AtMs siblings are epoch-ms for sorting).
 *
 * PHASE 4 MERGE (branch p4m-ncm): this file is THE canonical NCM service.
 * It is ncm-service's service with two merge decisions applied:
 *   (a) store key 'ncm' -> canonical 'settings.ncm' (SHARED.md);
 *   (b) stage() also accepts a probe-target push (deviceId null +
 *       configurationType, from the ncm-push track): a push targets a
 *       probe, not a device, so no device-existence check applies and
 *       the approval keeps configurationType/targetProbeId. The
 *       ncm-push service (stagePush/approveApproval/executeDryRun,
 *       NOT_APPROVED/ALREADY_EXECUTED, epoch-ms timestamps) and the
 *       ncm-ui service (ncmApprovals.js, dry-run-on-pending, status
 *       never changes, ncm.approval.* audit names) are NOT merged —
 *       they are superseded by this file and must not be re-added.
 *   (c) Dry-run is RE-RUNNABLE: execute() is allowed from 'approved'
 *       OR 'dry-run' and always returns {dryRun:true,
 *       sentToDevice:false}; a second dry-run is not a double
 *       execution because nothing is ever sent.
 * The store is injected (createService(store)); when omitted the real
 * store (./store) is used. No credentials are handled here at all.
 */

const crypto = require('node:crypto');

const SETTINGS_KEY = 'settings.ncm';

// Canonical approval statuses (SHARED.md).
const STATUSES = ['pending', 'approved', 'rejected', 'executed', 'dry-run'];

// Statuses from which execute() may run in this phase. 'approved' is the
// normal gate; 'dry-run' lets an approved-then-dry-run approval be
// re-examined without any new approval — still dry-run only, still
// writes nothing to the device.
const EXECUTABLE_STATUSES = ['approved', 'dry-run'];

function NcmError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function nowMs() {
  return Date.now();
}

function nowIso(ms) {
  return new Date(ms).toISOString();
}

function requireStore(store) {
  if (!store || typeof store.getSetting !== 'function' || typeof store.setSetting !== 'function') {
    throw NcmError('store_unavailable', 'ncm: a store with getSetting/setSetting is required');
  }
  return store;
}

function readNcm(store) {
  let raw = null;
  try {
    raw = store.getSetting(SETTINGS_KEY);
  } catch (err) {
    throw NcmError('store_error', `ncm: failed to read settings key '${SETTINGS_KEY}': ${err.message}`);
  }
  if (raw === null || raw === undefined) return { approvals: [] };
  let parsed = null;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw NcmError('store_error', `ncm: stored settings key '${SETTINGS_KEY}' is not valid JSON`);
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.approvals)) {
    throw NcmError('store_error', `ncm: stored settings key '${SETTINGS_KEY}' has an unexpected shape`);
  }
  return parsed;
}

function writeNcm(store, data) {
  try {
    store.setSetting(SETTINGS_KEY, data);
  } catch (err) {
    throw NcmError('store_error', `ncm: failed to persist settings key '${SETTINGS_KEY}': ${err.message}`);
  }
}

function audit(store, user, action, detail) {
  // Audit must never break the transition itself.
  try {
    if (store && typeof store.log === 'function') store.log(user || null, action, detail);
  } catch {
    /* audit failure is not a transition failure */
  }
}

function validateCommands(commands) {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw NcmError('validation', 'ncm.stage: commands must be a non-empty array of command strings');
  }
  for (const c of commands) {
    if (typeof c !== 'string' || c.trim() === '') {
      throw NcmError('validation', 'ncm.stage: every command must be a non-empty string');
    }
  }
  // Store an exact copy so later mutation of the caller's array cannot
  // change what was approved.
  return commands.map((c) => String(c));
}

function validateActor(name, field) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw NcmError('validation', `ncm: ${field} is required and must be a non-empty string`);
  }
  return name.trim();
}

function findApproval(data, id) {
  const approval = data.approvals.find((a) => a.id === id);
  if (!approval) throw NcmError('not_found', `ncm: approval not found: ${id}`);
  return approval;
}

/**
 * Stage a config change for approval. NEVER executes anything.
 * input: { deviceId, action, commands, diff?, createdBy,
 *          configurationType?, targetProbeId? }
 * Device change: deviceId is a positive integer and the device must
 * really exist (when the store can resolve devices). Probe push
 * (ncm-push track): deviceId null/omitted + a non-empty
 * configurationType stages a push targeting a probe, not a device —
 * no device-existence check applies, action defaults to 'push', and
 * configurationType/targetProbeId (default 'all') are kept on the
 * approval. Returns the stored pending approval (exact commands +
 * diff included).
 */
function stage(store, input) {
  requireStore(store);
  const body = input || {};
  // Probe-target push (deviceId null + configurationType): the change
  // targets a probe, so there is no device to check.
  const isProbePush =
    (body.deviceId === null || body.deviceId === undefined) &&
    typeof body.configurationType === 'string' &&
    body.configurationType.trim() !== '';
  let deviceId = null;
  if (isProbePush) {
    if (body.targetProbeId !== undefined && body.targetProbeId !== null &&
        (typeof body.targetProbeId !== 'string' || body.targetProbeId.trim() === '')) {
      throw NcmError('validation', 'ncm.stage: targetProbeId must be a non-empty string');
    }
  } else {
    deviceId = Number(body.deviceId);
    if (!Number.isInteger(deviceId) || deviceId <= 0) {
      throw NcmError('validation', 'ncm.stage: deviceId is required and must be a positive integer (or null with configurationType for a probe-target push)');
    }
    // When the store can resolve devices, the device must really exist —
    // staging a change for a phantom device is refused, not recorded.
    if (typeof store.getDevice === 'function') {
      let device = null;
      try {
        device = store.getDevice(deviceId);
      } catch (err) {
        throw NcmError('store_error', `ncm.stage: device lookup failed: ${err.message}`);
      }
      if (!device) throw NcmError('not_found', `ncm.stage: device not found: ${deviceId}`);
    }
  }
  const action = isProbePush
    ? (typeof body.action === 'string' && body.action.trim() !== '' ? body.action.trim() : 'push')
    : (typeof body.action === 'string' && body.action.trim() !== ''
      ? body.action.trim()
      : null);
  if (!action) {
    throw NcmError('validation', 'ncm.stage: action is required and must be a non-empty string');
  }
  const commands = validateCommands(body.commands);
  const createdBy = validateActor(body.createdBy, 'createdBy');
  // diff is the exact text that would be sent / shown for review. When
  // the caller does not supply one it is derived from the commands
  // themselves (one '+ <command>' line each) — never invented content.
  const diff =
    body.diff !== undefined && body.diff !== null
      ? String(body.diff)
      : commands.map((c) => `+ ${c}`).join('\n');

  const createdAtMs = nowMs();
  const approval = {
    id: crypto.randomUUID(),
    deviceId,
    action,
    ...(isProbePush
      ? {
          configurationType: body.configurationType.trim(),
          targetProbeId:
            body.targetProbeId !== undefined && body.targetProbeId !== null
              ? String(body.targetProbeId).trim()
              : 'all',
        }
      : {}),
    diff,
    commands,
    status: 'pending',
    createdBy,
    createdAt: nowIso(createdAtMs),
    createdAtMs,
    decidedBy: null,
    decidedAt: null,
    decidedAtMs: null,
    decidedReason: null,
    executedBy: null,
    executedAt: null,
    executedAtMs: null,
    dryRun: null,
  };
  const data = readNcm(store);
  data.approvals.push(approval);
  writeNcm(store, data);
  audit(store, createdBy, 'ncm.stage', {
    approvalId: approval.id,
    deviceId,
    action: approval.action,
    ...(isProbePush
      ? { configurationType: approval.configurationType, targetProbeId: approval.targetProbeId }
      : {}),
    commandCount: commands.length,
    status: 'pending',
  });
  return { ...approval, commands: [...approval.commands] };
}

/**
 * Approve a pending approval. Only 'pending' -> 'approved'.
 * Records decidedBy + decidedAt. Returns the updated approval.
 */
function approve(store, id, decidedBy) {
  requireStore(store);
  const actor = validateActor(decidedBy, 'decidedBy');
  if (typeof id !== 'string' || id.trim() === '') {
    throw NcmError('validation', 'ncm.approve: id is required');
  }
  const data = readNcm(store);
  const approval = findApproval(data, id);
  if (approval.status !== 'pending') {
    throw NcmError(
      'invalid_state',
      `ncm.approve: approval ${id} is '${approval.status}', not 'pending' — only a pending approval can be approved`
    );
  }
  const decidedAtMs = nowMs();
  approval.status = 'approved';
  approval.decidedBy = actor;
  approval.decidedAt = nowIso(decidedAtMs);
  approval.decidedAtMs = decidedAtMs;
  writeNcm(store, data);
  audit(store, actor, 'ncm.approve', {
    approvalId: approval.id,
    deviceId: approval.deviceId,
    action: approval.action,
    from: 'pending',
    to: 'approved',
  });
  return { ...approval, commands: [...approval.commands] };
}

/**
 * Reject a pending approval. Only 'pending' -> 'rejected'.
 * Records decidedBy + decidedAt. An optional reject reason (string, or
 * { reason }) is stored as decidedReason — additive, from the ncm-ui
 * track's review UI. Returns the updated approval.
 */
function reject(store, id, decidedBy, reasonOrOpts) {
  requireStore(store);
  const actor = validateActor(decidedBy, 'decidedBy');
  if (typeof id !== 'string' || id.trim() === '') {
    throw NcmError('validation', 'ncm.reject: id is required');
  }
  const reason =
    typeof reasonOrOpts === 'string'
      ? reasonOrOpts
      : reasonOrOpts && typeof reasonOrOpts.reason === 'string'
        ? reasonOrOpts.reason
        : null;
  if (reason !== null && reason.trim() === '') {
    throw NcmError('validation', 'ncm.reject: reason must be a non-empty string when supplied');
  }
  const data = readNcm(store);
  const approval = findApproval(data, id);
  if (approval.status !== 'pending') {
    throw NcmError(
      'invalid_state',
      `ncm.reject: approval ${id} is '${approval.status}', not 'pending' — only a pending approval can be rejected`
    );
  }
  const decidedAtMs = nowMs();
  approval.status = 'rejected';
  approval.decidedBy = actor;
  approval.decidedAt = nowIso(decidedAtMs);
  approval.decidedAtMs = decidedAtMs;
  approval.decidedReason = reason !== null ? reason.trim() : null;
  writeNcm(store, data);
  audit(store, actor, 'ncm.reject', {
    approvalId: approval.id,
    deviceId: approval.deviceId,
    action: approval.action,
    from: 'pending',
    to: 'rejected',
    ...(approval.decidedReason ? { reason: approval.decidedReason } : {}),
  });
  return { ...approval, commands: [...approval.commands] };
}

/**
 * Execute an approved change — PHASE 3: DRY-RUN ONLY.
 * Refuses (NcmError code 'invalid_state') unless the approval is
 * 'approved' (or a previous 'dry-run' of the same approval). Never
 * opens a connection and never writes to any device: the result carries
 * the exact commands that WOULD be sent plus dryRun: true. The approval
 * moves to status 'dry-run' and the run is audit-logged.
 * input: { executedBy } — executedBy optional; defaults to decidedBy.
 */
function execute(store, id, opts) {
  requireStore(store);
  if (typeof id !== 'string' || id.trim() === '') {
    throw NcmError('validation', 'ncm.execute: id is required');
  }
  const options = opts || {};
  const data = readNcm(store);
  const approval = findApproval(data, id);
  if (!EXECUTABLE_STATUSES.includes(approval.status)) {
    const reason =
      approval.status === 'pending'
        ? 'it has not been approved yet'
        : approval.status === 'rejected'
          ? 'it was rejected'
          : `its status is '${approval.status}'`;
    throw NcmError(
      'invalid_state',
      `ncm.execute: approval ${id} cannot be executed — ${reason}. Only an approved change may execute.`
    );
  }
  const executedBy =
    options.executedBy !== undefined && options.executedBy !== null
      ? validateActor(options.executedBy, 'executedBy')
      : approval.decidedBy;
  const executedAtMs = nowMs();
  const previousStatus = approval.status;
  approval.status = 'dry-run';
  approval.executedBy = executedBy;
  approval.executedAt = nowIso(executedAtMs);
  approval.executedAtMs = executedAtMs;
  approval.dryRun = true;
  writeNcm(store, data);
  audit(store, executedBy, 'ncm.execute.dry-run', {
    approvalId: approval.id,
    deviceId: approval.deviceId,
    action: approval.action,
    from: previousStatus,
    to: 'dry-run',
    dryRun: true,
    commandCount: approval.commands.length,
  });
  // The dry-run result: the EXACT staged commands, byte-for-byte, plus
  // an explicit marker that nothing was sent. No transport is invoked.
  return {
    dryRun: true,
    sentToDevice: false,
    approvalId: approval.id,
    deviceId: approval.deviceId,
    action: approval.action,
    diff: approval.diff,
    commands: [...approval.commands],
    wouldSend: [...approval.commands],
    status: approval.status,
    executedBy,
    executedAt: approval.executedAt,
    message:
      'Dry-run only: these commands were NOT sent to the device. No live push exists in this phase.',
  };
}

/** Fetch one approval by id (null when absent — read-only, no throw). */
function getApproval(store, id) {
  requireStore(store);
  if (typeof id !== 'string' || id.trim() === '') return null;
  const data = readNcm(store);
  const found = data.approvals.find((a) => a.id === id);
  return found ? { ...found, commands: [...found.commands] } : null;
}

/**
 * List approvals, newest first. Optional filter: { deviceId, status, action }.
 * Returns plain copies; never the live stored objects.
 */
function listApprovals(store, filter) {
  requireStore(store);
  const f = filter || {};
  const data = readNcm(store);
  let list = [...data.approvals].reverse();
  if (f.deviceId !== undefined) {
    list = list.filter((a) => a.deviceId === Number(f.deviceId));
  }
  if (f.status !== undefined) {
    list = list.filter((a) => a.status === f.status);
  }
  if (f.action !== undefined) {
    list = list.filter((a) => a.action === f.action);
  }
  return list.map((a) => ({ ...a, commands: [...a.commands] }));
}

/** Audit trail for NCM transitions, read from the store's audit_log. */
function listAudit(store, limit) {
  requireStore(store);
  if (typeof store.listAudit !== 'function') return [];
  const rows = store.listAudit(limit === undefined ? 100 : limit) || [];
  return rows.filter((r) => typeof r.action === 'string' && r.action.startsWith('ncm.'));
}

/** Bound service: createService(store) -> { stage, approve, reject, execute, getApproval, listApprovals, listAudit }. */
function createService(store) {
  const s = requireStore(store || require('./store'));
  return {
    stage: (input) => stage(s, input),
    approve: (id, decidedBy) => approve(s, id, decidedBy),
    reject: (id, decidedBy, reason) => reject(s, id, decidedBy, reason),
    execute: (id, opts) => execute(s, id, opts),
    getApproval: (id) => getApproval(s, id),
    listApprovals: (filter) => listApprovals(s, filter),
    listAudit: (limit) => listAudit(s, limit),
    STATUSES: [...STATUSES],
  };
}

module.exports = {
  SETTINGS_KEY,
  STATUSES,
  EXECUTABLE_STATUSES: [...EXECUTABLE_STATUSES],
  NcmError,
  stage,
  approve,
  reject,
  execute,
  getApproval,
  listApprovals,
  listAudit,
  createService,
};
