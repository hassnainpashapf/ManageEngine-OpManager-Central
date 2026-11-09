const express = require('express');
const router = express.Router();
const store = require('../services/store');
const ncm = require('../services/ncm');
const { requireAuth, requireRole } = require('../services/session');

// Approval decisions are admin-only, matching the canonical NCM approval
// routes (server/routes/ncm.js): an Operator is read-only everywhere else
// and must not be able to approve a staged drift remediation (audit A3
// G-24). requireAuth is already enforced globally by the /api auth guard;
// it is listed here so this router uses exactly the same ADMIN guard as
// ncm.js.
const ADMIN = [requireAuth, requireRole('admin')];

// Bound NCM approval-gate service (server/services/ncm.js, the canonical
// Phase 4 service — strict state machine, re-runnable dry-run, store key
// 'settings.ncm'). This route only computes the real diff and the
// remediation commands, then stages them through that gate.
const ncmService = ncm.createService(store);

// NOTE: server/services/store.js currently exports its functions flat
// (getDevice, getConfigs, getLatestConfig, saveConfig). The namespaced
// store.configs.* / store.devices.* form is honoured when present so this
// route keeps working if the store is refactored to namespaces later.
const getDevice = (id) =>
  (store.devices ? store.devices.getDevice(id) : store.getDevice(id));
const listDevices = () =>
  (store.devices ? store.devices.listDevices() : store.listDevices());
const getLatestConfig = (deviceId, type) =>
  (store.configs
    ? store.configs.getLatestConfig(deviceId, type)
    : store.getLatestConfig(deviceId, type));
const getConfigs = (deviceId) =>
  (store.configs ? store.configs.getConfigs(deviceId) : store.getConfigs(deviceId));

// Config types stored by the fetch/backup path. Canonical types are
// 'running' and 'startup'; the '-config' spellings are accepted as aliases
// so a fetch that stored them under the longer name still diffs.
const RUNNING_TYPES = ['running', 'running-config'];
const STARTUP_TYPES = ['startup', 'startup-config'];

function latestConfigOfTypes(deviceId, types) {
  for (const type of types) {
    const row = getLatestConfig(deviceId, type);
    if (row && row.content != null) return row;
  }
  // Fallback: scan everything stored for the device (covers any other
  // spelling a fetch path may have used) and take the newest match.
  const all = getConfigs(deviceId) || [];
  const matches = all.filter(
    (r) => r && r.content != null && types.includes(r.config_type)
  );
  return matches.length ? matches[0] : null;
}

function splitLines(content) {
  if (content == null) return [];
  return String(content).replace(/\r\n/g, '\n').split('\n');
}

function toIso(ms) {
  if (ms == null) return null;
  const d = new Date(Number(ms));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Line diff over two real fetched configs. Lines are matched by multiset
// (so repeated lines such as '!' are counted correctly): a running line is
// 'same' while an unmatched copy of it remains in the startup config,
// otherwise 'added'; startup-only lines are 'removed'.
function diffConfigs(runningLines, startupLines) {
  const remaining = new Map();
  for (const line of startupLines) {
    remaining.set(line, (remaining.get(line) || 0) + 1);
  }
  const runningConfig = runningLines.map((text, i) => {
    const count = remaining.get(text) || 0;
    if (count > 0) {
      remaining.set(text, count - 1);
      return { line: i + 1, text, type: 'same' };
    }
    return { line: i + 1, text, type: 'added' };
  });

  const runningCounts = new Map();
  for (const line of runningLines) {
    runningCounts.set(line, (runningCounts.get(line) || 0) + 1);
  }
  const startupConfig = startupLines.map((text, i) => {
    const count = runningCounts.get(text) || 0;
    if (count > 0) {
      runningCounts.set(text, count - 1);
      return { line: i + 1, text, type: 'same' };
    }
    return { line: i + 1, text, type: 'removed' };
  });

  const addedLinesCount = runningConfig.filter((l) => l.type === 'added').length;
  const removedLinesCount = startupConfig.filter((l) => l.type === 'removed').length;
  return { runningConfig, startupConfig, addedLinesCount, removedLinesCount };
}

function insufficientResult(dev, reason) {
  return {
    status: 'success',
    deviceName: dev ? dev.name : 'No Managed Devices',
    ip: dev ? dev.ip : '-',
    drift: null,
    hasDrift: null,
    reason,
    addedLinesCount: 0,
    removedLinesCount: 0,
    runningVersion: null,
    startupVersion: null,
    runningFetchedAt: null,
    startupFetchedAt: null,
    lastBackupTime: null,
    runningConfig: [],
    startupConfig: []
  };
}

// GET /api/ccm/diff — diff ONLY configs actually fetched and stored for
// this device (startup vs running from store.configs). If fewer than two
// real configs exist, the result is honest: drift is null, never "in sync".
router.get('/api/ccm/diff', (req, res) => {
  const { deviceId } = req.query;

  let dev = null;
  if (deviceId) {
    dev = getDevice(deviceId);
    if (!dev) {
      return res.status(404).json({
        status: 'error',
        message: `Device ${deviceId} not found`
      });
    }
  } else {
    const devices = listDevices() || [];
    dev = devices[0] || null;
  }

  if (!dev) {
    return res.json(insufficientResult(null, 'no devices'));
  }

  const running = latestConfigOfTypes(dev.id, RUNNING_TYPES);
  const startup = latestConfigOfTypes(dev.id, STARTUP_TYPES);

  if (!running || !startup) {
    const missing = [
      !running ? 'running' : null,
      !startup ? 'startup' : null
    ].filter(Boolean).join(' and ');
    return res.json(insufficientResult(dev, `insufficient data: no ${missing} config on file for this device`));
  }

  const runningLines = splitLines(running.content);
  const startupLines = splitLines(startup.content);
  const diff = diffConfigs(runningLines, startupLines);
  const hasDrift = diff.addedLinesCount > 0 || diff.removedLinesCount > 0;
  const lastFetched = Math.max(
    Number(running.fetched_at) || 0,
    Number(startup.fetched_at) || 0
  );

  res.json({
    status: 'success',
    deviceName: dev.name,
    ip: dev.ip,
    drift: hasDrift,
    hasDrift,
    reason: null,
    addedLinesCount: diff.addedLinesCount,
    removedLinesCount: diff.removedLinesCount,
    runningVersion: null,
    startupVersion: null,
    runningFetchedAt: toIso(running.fetched_at),
    startupFetchedAt: toIso(startup.fetched_at),
    lastBackupTime: lastFetched ? toIso(lastFetched) : null,
    runningConfig: diff.runningConfig,
    startupConfig: diff.startupConfig
  });
});

// Config types stored by the fetch/backup path. The drift-resolution pair
// is baseline vs current:
//   baseline — the approved/known-good config. Stored by the backup path
//     under type 'baseline' (alias 'baseline-config'). No fallback to
//     'startup': a startup config is not a baseline, and silently treating
//     it as one would invent approval material.
//   current — the live config as last fetched. Stored under 'current'
//     (alias 'current-config'); the running config ('running' /
//     'running-config', the type the existing diff endpoint uses) is the
//     same live config under its older name, so it is accepted as a
//     fallback. When both spellings exist, the most recently fetched row
//     wins. The response always names the config_type actually used.
// Callers may pin exact types with body.baselineType / body.currentType.
const BASELINE_TYPES = ['baseline', 'baseline-config'];
const CURRENT_TYPES = ['current', 'current-config', 'running', 'running-config'];

// Newest stored config of any of the given types for this device (by
// fetched_at), or null. Returns the store row, whose config_type says
// which spelling was actually used.
function latestStoredConfig(deviceId, types) {
  const all = getConfigs(deviceId) || [];
  const matches = all.filter(
    (r) => r && r.content != null && types.includes(r.config_type)
  );
  if (!matches.length) return null;
  matches.sort((a, b) => (Number(b.fetched_at) || 0) - (Number(a.fetched_at) || 0));
  return matches[0];
}

// Lines that carry no device state and therefore generate no remediation
// command: blank lines, IOS comment/delimiter lines, block terminators.
function isNonCommandLine(text) {
  const t = String(text).trim();
  return t === '' || t === '!' || t === '#' || t === 'end' || t === 'exit';
}

// Remediation commands that would restore the baseline, derived ONLY from
// the real diff — never invented:
//   added   (in current, not in baseline) -> `no <line>` removes it
//   removed (in baseline, not in current) -> `<line>` puts it back
// Removals run first, then re-adds. Non-command lines are dropped and
// reported in skippedLines so the caller can see exactly what was left out.
function buildRemediationCommands(addedLines, removedLines) {
  const commands = [];
  const skippedLines = [];
  for (const line of addedLines) {
    if (isNonCommandLine(line)) { skippedLines.push({ line, reason: 'non-command line' }); continue; }
    commands.push(`no ${String(line).trim()}`);
  }
  for (const line of removedLines) {
    if (isNonCommandLine(line)) { skippedLines.push({ line, reason: 'non-command line' }); continue; }
    commands.push(String(line).trim());
  }
  return { commands, skippedLines };
}

// Human-readable text form of the diff, stored verbatim on the approval
// (settings.ncm.approvals[].diff) so the approver reviews exactly what
// was computed: '-' = in baseline, missing from current; '+' = in current,
// not in baseline.
function diffToText(addedLines, removedLines) {
  const out = [];
  for (const line of removedLines) out.push(`- ${line}`);
  for (const line of addedLines) out.push(`+ ${line}`);
  return out.join('\n');
}

function actorName(req) {
  return (req.user && (req.user.username || req.user.name)) || 'system';
}

// Map an NCM service error (err.code) to an honest HTTP status.
function ncmErrorStatus(err) {
  if (!err || !err.code) return 500;
  if (err.code === 'validation') return 400;
  if (err.code === 'not_found') return 404;
  if (err.code === 'invalid_state') return 409;
  return 502;
}

// POST /api/ccm/resolve-drift — resolve drift through the approval gate.
// NEVER writes to a device and NEVER executes anything. It:
//   (a) 400s when deviceId is missing, 404s when the device does not exist;
//   (b) diffs the STORED baseline config against the STORED current config
//        for that device. If either side is missing it 422s naming exactly
//        which side (and which config_type spellings were looked for) —
//        the diff is never invented;
//   (c) stages the exact remediation commands via the NCM service and
//        returns 202 with the staged approval id, the exact diff and the
//        exact commands. Status stays 'pending' until a human approves it
//        via POST /api/ccm/drift-approvals/:id/approve; execution is a
//        separate, dry-run-only step (see the execute route below).
// A device with no drift stages nothing (200, approvalId null).
router.post('/api/ccm/resolve-drift', (req, res) => {
  const body = req.body || {};
  const { deviceId } = body;
  if (deviceId === undefined || deviceId === null || deviceId === '') {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const dev = getDevice(deviceId);
  if (!dev) {
    return res.status(404).json({
      status: 'error',
      message: `Device ${deviceId} not found`,
      deviceId
    });
  }

  const baselineTypes =
    typeof body.baselineType === 'string' && body.baselineType.trim() !== ''
      ? [body.baselineType.trim()]
      : BASELINE_TYPES;
  const currentTypes =
    typeof body.currentType === 'string' && body.currentType.trim() !== ''
      ? [body.currentType.trim()]
      : CURRENT_TYPES;

  const baseline = latestStoredConfig(dev.id, baselineTypes);
  const current = latestStoredConfig(dev.id, currentTypes);
  const missing = [
    !baseline ? 'baseline' : null,
    !current ? 'current' : null
  ].filter(Boolean);
  if (missing.length) {
    return res.status(422).json({
      status: 'error',
      error: 'insufficient_data',
      message:
        `Cannot resolve drift for device ${dev.id}: no ${missing.join(' and ')} config on file for this device. ` +
        `Looked for baseline under type(s) ${baselineTypes.join(', ')} and current under type(s) ${currentTypes.join(', ')}. ` +
        'Take a baseline backup and fetch the current config first; no diff was computed and nothing was staged.',
      deviceId: dev.id,
      deviceName: dev.name,
      ip: dev.ip,
      missing,
      baselineTypes,
      currentTypes,
      hasDrift: null,
      approvalId: null
    });
  }

  const baselineLines = splitLines(baseline.content);
  const currentLines = splitLines(current.content);
  const diff = diffConfigs(currentLines, baselineLines);
  const addedLines = diff.runningConfig.filter((l) => l.type === 'added').map((l) => l.text);
  const removedLines = diff.startupConfig.filter((l) => l.type === 'removed').map((l) => l.text);
  const hasDrift = diff.addedLinesCount > 0 || diff.removedLinesCount > 0;
  const base = {
    status: 'success',
    deviceId: dev.id,
    deviceName: dev.name,
    ip: dev.ip,
    hasDrift,
    addedLinesCount: diff.addedLinesCount,
    removedLinesCount: diff.removedLinesCount,
    addedLines,
    removedLines,
    baselineType: baseline.config_type,
    baselineFetchedAt: toIso(baseline.fetched_at),
    currentType: current.config_type,
    currentFetchedAt: toIso(current.fetched_at),
    executed: false,
    dryRunOnly: true
  };

  if (!hasDrift) {
    return res.json({
      ...base,
      approvalId: null,
      approval: null,
      commands: [],
      message: 'No drift: the stored baseline and current configs are identical; nothing was staged and nothing was sent to the device.'
    });
  }

  const { commands, skippedLines } = buildRemediationCommands(addedLines, removedLines);
  if (!commands.length) {
    return res.json({
      ...base,
      approvalId: null,
      approval: null,
      commands: [],
      skippedLines,
      message: 'Drift detected, but every differing line is a non-command line (blank/comment/delimiter), so no remediation command can be derived; nothing was staged and nothing was sent to the device.'
    });
  }

  let approval;
  try {
    approval = ncmService.stage({
      deviceId: dev.id,
      action: 'resolve-drift',
      commands,
      diff: diffToText(addedLines, removedLines),
      createdBy: actorName(req)
    });
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json({
      status: 'error',
      error: err.code || 'stage_failed',
      message: `Drift was computed but staging the remediation failed: ${err.message}`,
      ...base,
      approvalId: null
    });
  }

  return res.status(202).json({
    ...base,
    approvalId: approval.id,
    approval,
    commands,
    skippedLines,
    message: 'Drift staged for approval. Status is pending: nothing has been sent to the device. Approve it via POST /api/ccm/drift-approvals/:id/approve, then execute it dry-run only via POST /api/ccm/drift-approvals/:id/execute with {"dryRun": true}.'
  });
});

// GET /api/ccm/drift-approvals — list staged drift approvals (newest
// first). Optional filters: ?deviceId=&status=.
router.get('/api/ccm/drift-approvals', (req, res) => {
  const filter = {};
  if (req.query.deviceId !== undefined) filter.deviceId = req.query.deviceId;
  if (req.query.status !== undefined) filter.status = req.query.status;
  let approvals;
  try {
    approvals = ncmService.listApprovals(filter);
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json({ status: 'error', error: err.code || 'list_failed', message: err.message });
  }
  return res.json({ status: 'success', approvals });
});

// GET /api/ccm/drift-approvals/:id — one staged approval, or 404.
router.get('/api/ccm/drift-approvals/:id', (req, res) => {
  const approval = ncmService.getApproval(req.params.id);
  if (!approval) {
    return res.status(404).json({ status: 'error', error: 'not_found', message: `Approval ${req.params.id} not found` });
  }
  return res.json({ status: 'success', approval });
});

// POST /api/ccm/drift-approvals/:id/approve — pending -> approved only.
// Records decidedBy/decidedAt. Approving does NOT execute anything.
// Admin-only (G-24), matching the canonical NCM approval routes.
router.post('/api/ccm/drift-approvals/:id/approve', ADMIN, (req, res) => {
  let approval;
  try {
    approval = ncmService.approve(req.params.id, actorName(req));
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json({ status: 'error', error: err.code || 'approve_failed', message: err.message });
  }
  return res.json({
    status: 'success',
    approval,
    executed: false,
    message: 'Approval granted. Nothing has been sent to the device yet — execute it dry-run only via POST /api/ccm/drift-approvals/:id/execute with {"dryRun": true}.'
  });
});

// POST /api/ccm/drift-approvals/:id/reject — pending -> rejected only.
// Admin-only (G-24), matching the canonical NCM approval routes.
router.post('/api/ccm/drift-approvals/:id/reject', ADMIN, (req, res) => {
  let approval;
  try {
    approval = ncmService.reject(req.params.id, actorName(req));
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json({ status: 'error', error: err.code || 'reject_failed', message: err.message });
  }
  return res.json({ status: 'success', approval, executed: false, message: 'Approval rejected. The staged remediation will never execute.' });
});

// POST /api/ccm/drift-approvals/:id/execute — PHASE 3: DRY-RUN ONLY.
// Refusals, in order:
//   404 when the approval does not exist;
//   422 (dry_run_only) when the caller did not explicitly pass
//       {"dryRun": true} — a live push is not implemented in this phase,
//       so a non-dry-run execute can never run;
//   409 (approval_required) when the approval is not 'approved' — the NCM
//       service enforces this; a pending or rejected approval never runs.
// On success the service returns the exact staged commands with
// dryRun: true and sentToDevice: false: no connection is opened and no
// configuration is written to any device. The approval moves to 'dry-run'.
// Admin-only (G-24), matching the canonical NCM approval routes.
router.post('/api/ccm/drift-approvals/:id/execute', ADMIN, (req, res) => {
  const approval = ncmService.getApproval(req.params.id);
  if (!approval) {
    return res.status(404).json({ status: 'error', error: 'not_found', message: `Approval ${req.params.id} not found` });
  }
  if ((req.body || {}).dryRun !== true) {
    return res.status(422).json({
      status: 'error',
      error: 'dry_run_only',
      message: 'This phase executes dry-run only: pass {"dryRun": true}. A live push to the device is not implemented, so no configuration was written.',
      approvalId: approval.id,
      approvalStatus: approval.status,
      executed: false,
      sentToDevice: false
    });
  }
  let result;
  try {
    result = ncmService.execute(req.params.id, { executedBy: actorName(req) });
  } catch (err) {
    const status = ncmErrorStatus(err);
    return res.status(status).json({
      status: 'error',
      error: err.code === 'invalid_state' ? 'approval_required' : (err.code || 'execute_failed'),
      message: err.message,
      approvalId: approval.id,
      approvalStatus: approval.status,
      executed: false,
      sentToDevice: false
    });
  }
  return res.json({
    status: 'success',
    ...result,
    executed: false,
    message: 'Dry-run only: the staged commands were NOT sent to the device. No live push exists in this phase.'
  });
});

module.exports = router;
