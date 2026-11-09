const express = require('express');
const router = express.Router();
const store = require('../services/store');

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

// POST /api/json/enterprise/pushCentralConfig + /api/ccm/push — no
// Central-to-probe delivery channel exists in this codebase (no probe
// transport, no acknowledgement handling anywhere in server/), so a push
// cannot be performed. Honest 501 instead of rewriting a local status
// string and claiming probes acknowledged it.
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

  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'Configuration push is not implemented: no Central-to-probe delivery channel exists, so nothing was pushed and no probe acknowledged anything.',
    config: {
      configName: configurationType,
      lastPushed: null,
      status: null,
      targetProbeId: targetProbe ? targetProbe.id : (targetProbeId || 'all')
    },
    pushedAt: null
  });
});

// POST /api/ccm/backup-device + /api/ccm/backup — no config retrieval path
// exists (the poller only refreshes metrics; there is no SSH/TFTP/SNMP
// config fetch anywhere in server/), so a fresh backup cannot be taken.
// Unknown device IDs return 404; known devices get an honest 501 — never
// a success for an invented fallback device or invented line/size counts.
router.post(['/api/ccm/backup-device', '/api/ccm/backup'], (req, res) => {
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

  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'Configuration backup is not implemented: no SSH/TFTP/SNMP config retrieval path exists, so no configuration was fetched from the device and no backup was written.',
    deviceId: dev.id,
    deviceName: deviceLabel(dev),
    ip: dev.ip || null,
    revision: null,
    backupTime: null,
    complianceStatus: null,
    linesCount: null,
    fileSize: null
  });
});

module.exports = router;
