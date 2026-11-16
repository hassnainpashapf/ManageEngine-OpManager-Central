const express = require('express');
const router = express.Router();
const store = require('../services/store');
const sshclient = require('../services/sshclient');
const snmp = require('../services/snmp');

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
  const body = req.body || {};
  const deviceId = body.deviceId;
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

  // Mode B: Real SNMP MIB Device & Interface Configuration Snapshot
  if (String(body.mode || '').toLowerCase() === 'snmp') {
    const creds = (store.credentials ? store.credentials.listCredentials() : store.listCredentials()) || [];
    const snmpCred = creds.find((c) => /snmp/i.test(c.type || '') && c.community);
    const community = body.community || dev.snmp_community || (snmpCred && snmpCred.community) || 'public';
    try {
      const sysVbs = await snmp.snmpWalk(dev.ip, community, '1.3.6.1.2.1.1');
      if (!sysVbs || sysVbs.length === 0) {
        return res.status(502).json({
          status: 'error',
          message: `SNMP snapshot failed on ${deviceLabel(dev)} (${dev.ip}): device returned no RFC1213 system OIDs.`
        });
      }
      const ifVbs = await snmp.snmpWalk(dev.ip, community, '1.3.6.1.2.1.2.2.1.2').catch(() => []);
      const ipVbs = await snmp.snmpWalk(dev.ip, community, '1.3.6.1.2.1.4.20.1.1').catch(() => []);
      const lines = [
        `! OpManager Central — Live SNMP MIB Configuration Snapshot`,
        `! Device: ${deviceLabel(dev)} (${dev.ip})`,
        `! Captured: ${new Date().toISOString()}`,
        `! Category: ${dev.category || 'Unknown'} | Vendor: ${dev.vendor || 'Unknown'}`,
        `!`,
        `! --- RFC1213-MIB System ---`,
        ...sysVbs.map((v) => `${v.oid} = ${String(v.value ?? '').replace(/\r?\n/g, ' ')}`),
        `!`,
        `! --- IPv4 Interfaces (${ipVbs.length}) ---`,
        ...ipVbs.map((v) => `ip address ${String(v.value ?? '')}`),
        `!`,
        `! --- IF-MIB Interfaces (${ifVbs.length}) ---`,
        ...ifVbs.slice(0, 64).map((v) => `interface ${String(v.value ?? '')}`)
      ];
      const snapshotText = lines.join('\n');
      const row = saveConfig(dev.id, 'running', snapshotText);
      const byteSize = Buffer.byteLength(snapshotText, 'utf8');
      return res.json({
        status: 'success',
        mode: 'snmp',
        message: `Live SNMP MIB configuration snapshot saved for ${deviceLabel(dev)} (${dev.ip})`,
        deviceId: dev.id,
        deviceName: deviceLabel(dev),
        ip: dev.ip,
        configId: row.id,
        backupTime: toIso(row.fetched_at),
        linesCount: lines.length,
        fileSize: `${(byteSize / 1024).toFixed(1)} KB`,
        startupCaptured: false
      });
    } catch (err) {
      return res.status(502).json({
        status: 'error',
        message: `SNMP snapshot failed for ${deviceLabel(dev)} (${dev.ip}): ${err.message}`
      });
    }
  }

  const storedCred = sshclient.findSshCredential(store);
  const cred = (body.username && body.password)
    ? { username: String(body.username), password: String(body.password), port: Number(body.port) || 22 }
    : storedCred;
  if (!cred || !cred.username || !cred.password) {
    return res.status(400).json({
      status: 'error',
      message: 'No SSH/CLI credential configured. Enter SSH Username/Password above (or under Settings > Credential Library), or use SNMP Snapshot.'
    });
  }

  try {
    const showCmd = String(body.command || 'show running-config').trim();
    let runningRaw = await sshclient.runShowCommand(dev.ip, cred, showCmd).catch(() => null);
    let runningConfig = runningRaw ? sshclient.cleanConfigOutput(runningRaw, showCmd) : '';
    let startupRow = null;

    if (!runningConfig) {
      // Fallback for Linux / Proxmox / BSD / generic SSH hosts via exec channel
      const execCmd = body.command || 'hostname; uname -a; ip -br addr 2>/dev/null || ifconfig';
      const execRes = await sshclient.execCommand(dev.ip, cred, execCmd);
      runningConfig = String(execRes.stdout || '').trim();
    } else {
      const startupRaw = await sshclient.runShowCommand(dev.ip, cred, 'show startup-config').catch(() => null);
      if (startupRaw) {
        const startupConfig = sshclient.cleanConfigOutput(startupRaw, 'show startup-config');
        if (startupConfig) startupRow = saveConfig(dev.id, 'startup', startupConfig);
      }
    }

    if (!runningConfig) {
      throw new Error(`Device returned empty output for "${showCmd}"`);
    }
    const runningRow = saveConfig(dev.id, 'running', runningConfig);

    const lineCount = runningConfig.split(/\r?\n/).length;
    const byteSize = Buffer.byteLength(runningConfig, 'utf8');

    res.json({
      status: 'success',
      mode: 'ssh',
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
