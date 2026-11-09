const express = require('express');
const router = express.Router();
const store = require('../services/store');

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

// POST /api/ccm/resolve-drift — no real config fetch/push path exists yet
// (the poller only refreshes metrics and the CCM backup endpoint does not
// fetch or write any device config), so resolving drift cannot be performed.
// Honest 501 instead of a success that did nothing.
router.post('/api/ccm/resolve-drift', (req, res) => {
  const { deviceId } = req.body || {};
  let dev = null;
  if (deviceId) dev = getDevice(deviceId);
  if (!dev) {
    const devices = listDevices() || [];
    dev = devices[0] || null;
  }

  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message:
      'Drift resolution is not implemented: no config fetch/push path exists yet, so no configuration was written to the device.',
    deviceName: dev ? dev.name : null,
    ip: dev ? dev.ip : null,
    syncedAt: null
  });
});

module.exports = router;
