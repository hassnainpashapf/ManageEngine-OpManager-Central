const express = require('express');
const router = express.Router();
const store = require('../services/store');
const sshclient = require('../services/sshclient');

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
const saveConfig = (deviceId, configType, content) =>
  (store.configs ? store.configs.saveConfig(deviceId, configType, content) : store.saveConfig(deviceId, configType, content));
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
router.post(['/api/json/enterprise/pushCentralConfig', '/api/ccm/push'], (req, res) => {
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

// POST /api/ccm/backup-device + /api/ccm/backup — real SSH "show
// running-config" / "show startup-config" pull, stored via store.configs.
// Unknown device IDs return 404; a missing credential or a real connect/auth
// failure returns an honest error — never a success for data that wasn't
// actually fetched.
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
      deviceId,
      deviceName: null,
      ip: null,
      revision: null,
      backupTime: null,
      complianceStatus: null,
      linesCount: null,
      fileSize: null
    });
  }
  if (!dev.ip) {
    return res.status(400).json({ status: 'error', message: `Device ${deviceLabel(dev)} has no IP address on file` });
  }

  const cred = sshclient.findSshCredential(store);
  if (!cred || !cred.username || !cred.password) {
    return res.status(400).json({
      status: 'error',
      message: 'No SSH/CLI credential with a username and password is configured in the Credential Library. Add one under Settings > Credentials before running a backup.'
    });
  }

  try {
    const [runningRaw, startupRaw] = await Promise.all([
      sshclient.runShowCommand(dev.ip, cred, 'show running-config'),
      sshclient.runShowCommand(dev.ip, cred, 'show startup-config').catch(() => null)
    ]);

    const runningConfig = sshclient.cleanConfigOutput(runningRaw, 'show running-config');
    if (!runningConfig) {
      throw new Error('Device returned an empty response to "show running-config"');
    }
    const runningRow = saveConfig(dev.id, 'running', runningConfig);

    let startupRow = null;
    if (startupRaw) {
      const startupConfig = sshclient.cleanConfigOutput(startupRaw, 'show startup-config');
      if (startupConfig) startupRow = saveConfig(dev.id, 'startup', startupConfig);
    }

    const lineCount = runningConfig.split(/\r?\n/).length;
    const byteSize = Buffer.byteLength(runningConfig, 'utf8');

    res.json({
      status: 'success',
      message: `Running configuration${startupRow ? ' and startup configuration' : ''} successfully backed up for ${deviceLabel(dev)} (${dev.ip}) via SSH`,
      deviceId: dev.id,
      deviceName: deviceLabel(dev),
      ip: dev.ip,
      configId: runningRow.id,
      backupTime: toIso(runningRow.fetched_at),
      linesCount: lineCount,
      fileSize: `${(byteSize / 1024).toFixed(1)} KB`,
      startupCaptured: Boolean(startupRow)
    });
  } catch (err) {
    res.status(502).json({
      status: 'error',
      message: `SSH backup failed for ${deviceLabel(dev)} (${dev.ip}): ${err.message}`
    });
  }
});

module.exports = router;
