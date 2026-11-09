const express = require('express');
const router = express.Router();
const store = require('../services/store');
const ncm = require('../services/ncm');
const { fetchDeviceConfig } = require('../services/sshConfigFetch');

// Canonical NCM service (Phase 4 merge, branch p4m-ncm): the ncm-push
// track's own ncm.js (stagePush/approveApproval/executeDryRun,
// NOT_APPROVED/ALREADY_EXECUTED, epoch-ms timestamps) is superseded by
// this service — strict state machine, re-runnable dry-run, store key
// 'settings.ncm', audit ncm.stage/ncm.approve/ncm.reject/
// ncm.execute.dry-run, ISO timestamps. The push endpoints below are the
// ncm-push track's routes rewritten onto it; the backup endpoint is the
// ncm-backup track's real-SSH endpoint verbatim.
const ncmService = ncm.createService(store);

// Best-effort audit write: a failed audit row must never break the request.
function auditLog(user, action, detail) {
  try {
    if (store.audit && typeof store.audit.log === 'function') {
      store.audit.log(user ?? null, action, detail || {});
    }
  } catch {
    // Audit is a record, not a gate.
  }
}

function currentUser(req) {
  return (req.user && (req.user.username || req.user.name)) || null;
}

// Resolve the exact commands for a configuration type from the stored
// configs: the most recently fetched stored row for that type, split into
// lines (blank lines dropped, order preserved). Returns null when the
// stored row has no content at all — there are then no exact commands to
// stage, and the caller must answer 422 rather than stage an empty push.
function resolveCommands(configurationType) {
  const devices = listDevices() || [];
  let latest = null;
  for (const dev of devices) {
    const rows = getConfigs(dev.id) || [];
    for (const row of rows) {
      if (!row || row.config_type !== configurationType) continue;
      if (!latest || Number(row.fetched_at || 0) > Number(latest.fetched_at || 0)) {
        latest = row;
      }
    }
  }
  if (!latest || latest.content === null || latest.content === undefined) return null;
  const lines = String(latest.content)
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.length > 0);
  if (lines.length === 0) return null;
  return { commands: lines, sourceDeviceId: latest.device_id ?? null, fetchedAt: toIso(latest.fetched_at) };
}

function approvalErrorStatus(err) {
  switch (err && err.code) {
    case 'not_found':
      return 404;
    case 'validation':
      return 400;
    case 'invalid_state':
      return 409;
    default:
      return 500;
  }
}

// NOTE: server/services/store.js currently exports its functions flat
// (getDevice, listDevices, getConfigs, getProbe, listProbes). The
// namespaced store.configs.* / store.devices.* / store.probes.* form is
// honoured when present so this route keeps working if the store is
// refactored to namespaces later.
const getDevice = (id) =>
  (store.devices ? store.devices.getDevice(id) : store.getDevice(id));
const listDevices = () =>
  (store.devices ? store.devices.listDevices() : store.listDevices());
const getConfigs = (deviceId) =>
  (store.configs ? store.configs.getConfigs(deviceId) : store.getConfigs(deviceId));
const getProbe = (id) =>
  (store.probes ? store.probes.getProbe(id) : store.getProbe(id));
const saveConfig = (deviceId, configType, content) =>
  (store.configs ? store.configs.saveConfig(deviceId, configType, content) : store.saveConfig(deviceId, configType, content));
const getCredential = (id) =>
  (store.credentials ? store.credentials.getCredential(id) : store.getCredential(id));

function toIso(ms) {
  if (ms == null) return null;
  const d = new Date(Number(ms));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function deviceLabel(dev) {
  if (!dev) return null;
  return dev.hostname || dev.sys_name || dev.ip || null;
}

// GET /api/ccm/configs — the catalog is built ONLY from configs actually
// fetched and stored in store.configs. One entry per distinct config type
// present in the store; an unconfigured system returns an empty list.
// lastPushed/status are null: no push to any probe has ever happened (see
// the push endpoint below), so no sync claim is made.
router.get('/api/ccm/configs', (req, res) => {
  const devices = listDevices() || [];
  const byType = new Map();
  for (const dev of devices) {
    const rows = getConfigs(dev.id) || [];
    for (const row of rows) {
      if (!row || row.config_type == null) continue;
      const entry = byType.get(row.config_type) || {
        configName: row.config_type,
        lastPushed: null,
        status: null,
        fetchedAt: null,
        deviceCount: 0,
        _latestFetchedAt: 0,
        _deviceIds: new Set()
      };
      const fetchedAt = Number(row.fetched_at) || 0;
      if (fetchedAt > entry._latestFetchedAt) {
        entry._latestFetchedAt = fetchedAt;
        entry.fetchedAt = toIso(fetchedAt);
      }
      entry._deviceIds.add(dev.id);
      entry.deviceCount = entry._deviceIds.size;
      byType.set(row.config_type, entry);
    }
  }
  const configs = [...byType.values()].map((entry) => ({
    configName: entry.configName,
    lastPushed: entry.lastPushed,
    status: entry.status,
    fetchedAt: entry.fetchedAt,
    deviceCount: entry.deviceCount
  }));
  res.json({
    status: 'success',
    configs
  });
});

// POST /api/json/enterprise/pushCentralConfig + /api/ccm/push — the push
// goes through the NCM approval gate (server/services/ncm.js, settings.ncm
// approvals). NOTHING is sent to any probe or device here: the push is
// STAGED as a pending approval and the caller gets 202 with the staged
// approval id and the exact commands. Delivery happens only after
// POST /api/ccm/approvals/:id/approve, and in this phase even the execute
// step is a dry run (see below) — no Central-to-probe delivery channel
// exists yet, so a real push is still impossible and is never faked.
// NOTE: the '/enterprise/pushCentralConfig' entry is the legacy alias in
// its post-rewrite form — server/index.js strips the '/api/json' prefix
// before routing, so the literal '/api/json/enterprise/pushCentralConfig'
// entry below can never match on its own (verified live: it 404'd before
// this alias was added). The literal entry is kept for consistency with
// the sibling route files, which list both forms.
router.post(['/api/json/enterprise/pushCentralConfig', '/enterprise/pushCentralConfig', '/api/ccm/push'], (req, res) => {
  const { configurationType, targetProbeId } = req.body || {};
  if (!configurationType) {
    return res.status(400).json({ status: 'error', message: 'configurationType is required' });
  }

  // The named configuration must actually exist in store.configs.
  const devices = listDevices() || [];
  let found = false;
  for (const dev of devices) {
    const rows = getConfigs(dev.id) || [];
    if (rows.some((r) => r && r.config_type === configurationType)) {
      found = true;
      break;
    }
  }
  if (!found) {
    return res.status(404).json({ status: 'error', message: `Configuration ${configurationType} not found in CCM catalog` });
  }

  // A named target probe must actually exist.
  let targetProbe = null;
  if (targetProbeId && targetProbeId !== 'all') {
    targetProbe = getProbe(targetProbeId);
    if (!targetProbe) {
      return res.status(404).json({ status: 'error', message: `Probe ${targetProbeId} not found` });
    }
  }

  // The exact commands are the lines of the most recently fetched stored
  // config for this type. A stored row with no content cannot be pushed.
  const resolved = resolveCommands(configurationType);
  if (!resolved) {
    return res.status(422).json({
      status: 'error',
      error: 'no_pushable_content',
      message: `Configuration ${configurationType} is in the catalog but its latest stored copy has no content, so there are no commands to push.`,
      config: {
        configName: configurationType,
        lastPushed: null,
        status: null,
        targetProbeId: targetProbe ? targetProbe.id : (targetProbeId || 'all')
      },
      pushedAt: null
    });
  }

  const approval = ncmService.stage({
    deviceId: null, // a push targets a probe, not a device (canonical service probe-push form)
    action: 'push',
    configurationType,
    targetProbeId: targetProbe ? targetProbe.id : (targetProbeId || 'all'),
    commands: resolved.commands,
    diff: null, // the canonical service derives the diff ('+ <command>' lines) when diff is null
    createdBy: currentUser(req) || 'system',
  });
  auditLog(currentUser(req), 'ncm.push.stage', {
    approvalId: approval.id,
    configurationType,
    targetProbeId: approval.targetProbeId,
    commandCount: resolved.commands.length,
    sourceDeviceId: resolved.sourceDeviceId,
  });

  return res.status(202).json({
    status: 'success',
    message: `Push of ${configurationType} staged for approval (id ${approval.id}). Nothing has been sent to any probe or device yet.`,
    approvalId: approval.id,
    approval,
    commands: resolved.commands,
    dryRun: false,
    config: {
      configName: configurationType,
      lastPushed: null,
      status: 'pending',
      targetProbeId: approval.targetProbeId
    },
    pushedAt: null
  });
});

// GET /api/ccm/approvals — list staged NCM push approvals, newest first.
router.get('/api/ccm/approvals', (req, res) => {
  res.json({ status: 'success', approvals: ncmService.listApprovals() });
});

// GET /api/ccm/approvals/:id — one approval, or 404.
router.get('/api/ccm/approvals/:id', (req, res) => {
  const approval = ncmService.getApproval(req.params.id);
  if (!approval) {
    return res.status(404).json({ status: 'error', message: `Approval ${req.params.id} not found` });
  }
  res.json({ status: 'success', approval });
});

// POST /api/ccm/approvals/:id/approve — pending -> approved. 404 when the
// id does not exist, 409 when it is already decided.
router.post('/api/ccm/approvals/:id/approve', (req, res) => {
  try {
    const approval = ncmService.approve(req.params.id, currentUser(req) || 'system');
    auditLog(currentUser(req), 'ncm.push.approve', { approvalId: approval.id });
    return res.json({
      status: 'success',
      message: `Approval ${approval.id} approved. Nothing has been sent yet — run execute for a dry run.`,
      approval
    });
  } catch (err) {
    return res.status(approvalErrorStatus(err)).json({ status: 'error', message: err.message });
  }
});

// POST /api/ccm/approvals/:id/reject — pending -> rejected. 404 when the
// id does not exist, 409 when it is already decided.
router.post('/api/ccm/approvals/:id/reject', (req, res) => {
  try {
    const approval = ncmService.reject(req.params.id, currentUser(req) || 'system');
    auditLog(currentUser(req), 'ncm.push.reject', { approvalId: approval.id });
    return res.json({
      status: 'success',
      message: `Approval ${approval.id} rejected. Nothing will be sent.`,
      approval
    });
  } catch (err) {
    return res.status(approvalErrorStatus(err)).json({ status: 'error', message: err.message });
  }
});

// POST /api/ccm/approvals/:id/execute — DRY-RUN ONLY in this phase.
// Canonical service execute(): approved (or an already dry-run approval
// — dry-run is re-runnable) -> returns the exact staged commands with
// dryRun: true and sentToDevice: false, and records the approval as
// 'dry-run'. NOTHING is sent to any probe or device: no delivery
// transport exists yet and none is called here. Unapproved execute is
// refused with 403 (pending or rejected); unknown id answers 404; an
// explicit {"dryRun": false} is refused 422 (dry_run_only).
router.post('/api/ccm/approvals/:id/execute', (req, res) => {
  const existing = ncmService.getApproval(req.params.id);
  if (!existing) {
    return res.status(404).json({ status: 'error', message: `Approval ${req.params.id} not found` });
  }
  if (req.body && req.body.dryRun === false) {
    return res.status(422).json({
      status: 'error',
      error: 'dry_run_only',
      message: 'This phase executes dry-run only: pass {"dryRun": true} or omit dryRun. A live push to a probe is not implemented, so nothing was sent.',
      approvalId: existing.id,
      approvalStatus: existing.status,
      executed: false,
      sentToDevice: false,
    });
  }
  try {
    const result = ncmService.execute(req.params.id, { executedBy: currentUser(req) || 'system' });
    auditLog(currentUser(req), 'ncm.push.execute-dry-run', { approvalId: result.approvalId });
    return res.json({
      status: 'success',
      message: 'Dry run only — the exact commands below were NOT sent to any probe or device.',
      dryRun: true,
      sentToDevice: false,
      executed: false,
      approvalId: result.approvalId,
      approval: ncmService.getApproval(result.approvalId),
      commands: result.commands,
      wouldSend: result.wouldSend,
      pushedAt: null
    });
  } catch (err) {
    // Preserve the ncm-push contract: an unapproved execute is 403.
    const status = err && err.code === 'invalid_state' ? 403 : approvalErrorStatus(err);
    return res.status(status).json({ status: 'error', error: err.code || 'execute_failed', message: err.message });
  }
});

// POST /api/ccm/backup-device + /api/ccm/backup — REAL retrieval path
// (Phase 3 ncm-backup, merged verbatim). Order:
//   1. SSH (server/services/sshConfigFetch.js, ssh2) using the device's
//      stored SSH credentials (devices.ssh_credential_id -> credentials row
//      of type 'ssh'). A successful fetch is stored via store.configs
//      as config_type 'running-config'; the stored row id is the revision,
//      fetched_at is the backup time, and byte/line counts come from the
//      fetched text itself — never invented.
//   2. No stored SSH credentials -> honest 501 naming the exact missing
//      piece. Nothing is attempted against the device and nothing is stored.
//   3. Stored credentials but SSH fails (unreachable / auth failure /
//      device rejects the command) -> honest 502, nothing stored.
// Unknown device IDs return 404; missing deviceId returns 400.
// complianceStatus stays null: no compliance-baseline engine exists yet,
// so no compliance claim is made about a fetched config.
router.post(['/api/ccm/backup-device', '/api/ccm/backup'], async (req, res) => {
  const deviceId = (req.body || {}).deviceId;
  if (deviceId === undefined || deviceId === null || deviceId === '') {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const dev = getDevice(deviceId);
  if (!dev) {
    return res.status(404).json({
      status: 'error',
      message: `Device ${deviceId} not found`,
      deviceId: deviceId,
      deviceName: null,
      ip: null,
      revision: null,
      backupTime: null,
      complianceStatus: null,
      linesCount: null,
      fileSize: null
    });
  }

  const result = await fetchDeviceConfig(dev, getCredential);

  if (result.status === 'not_configured') {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `Configuration backup is not implemented for this device: ${result.missing}. No configuration was fetched from the device and no backup was written.`,
      missing: result.missing,
      retrieval: 'ssh',
      deviceId: dev.id,
      deviceName: deviceLabel(dev),
      ip: dev.ip || null,
      revision: null,
      backupTime: null,
      complianceStatus: null,
      linesCount: null,
      fileSize: null
    });
  }

  if (result.status === 'failed') {
    return res.status(502).json({
      status: 'error',
      error: result.code || 'ssh_failed',
      message: `Configuration backup failed: ${result.message}. No backup was written.`,
      retrieval: 'ssh',
      deviceId: dev.id,
      deviceName: deviceLabel(dev),
      ip: dev.ip || null,
      revision: null,
      backupTime: null,
      complianceStatus: null,
      linesCount: null,
      fileSize: null
    });
  }

  // Success: store the fetched config. saveConfig returns the stored row.
  const row = saveConfig(dev.id, 'running-config', result.content);
  const revision = row && row.id !== undefined ? row.id : null;
  const backupTime = row && row.fetched_at ? toIso(row.fetched_at) : new Date().toISOString();
  // HE-1 (phase 5): a finished configuration backup is a real
  // notification event. Best-effort: it must never break the response.
  try {
    const notify =
      store.notifications && typeof store.notifications.addNotification === 'function'
        ? store.notifications.addNotification
        : store.addNotification;
    if (typeof notify === 'function') {
      notify({
        type: 'backup',
        title: `Configuration backup finished: ${deviceLabel(dev)}`,
        message: `running-config revision #${revision}, ${result.lines} line(s), ${result.bytes} byte(s), at ${backupTime}.`,
        ref_type: 'device',
        ref_id: dev.id,
      });
    }
  } catch {
    // Notification is a record, not a gate.
  }
  return res.json({
    status: 'success',
    retrieval: 'ssh',
    command: result.command,
    deviceId: dev.id,
    deviceName: deviceLabel(dev),
    ip: dev.ip || null,
    revision,
    backupTime,
    complianceStatus: null,
    linesCount: result.lines,
    fileSize: result.bytes
  });
});

module.exports = router;
