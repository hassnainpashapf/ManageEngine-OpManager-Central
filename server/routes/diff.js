const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Minimal real line-level diff (LCS-based), no fabricated template.
function diffLines(oldLines, newLines) {
  const n = oldLines.length;
  const m = newLines.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = oldLines[i] === newLines[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0, lineNo = 1;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      result.push({ line: lineNo++, text: oldLines[i], type: 'same' });
      i++; j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ line: lineNo++, text: oldLines[i], type: 'removed' });
      i++;
    } else {
      result.push({ line: lineNo++, text: newLines[j], type: 'added' });
      j++;
    }
  }
  while (i < n) { result.push({ line: lineNo++, text: oldLines[i++], type: 'removed' }); }
  while (j < m) { result.push({ line: lineNo++, text: newLines[j++], type: 'added' }); }
  return result;
}

router.get('/api/ccm/diff', (req, res) => {
  const { deviceId } = req.query;
  const devices = db.getDevices();
  const dev = deviceId ? devices.find(d => String(d.id) === String(deviceId)) : devices[0];

  if (!dev) {
    return res.json({
      status: 'success',
      deviceName: 'No Managed Devices',
      ip: '-',
      hasDrift: false,
      addedLinesCount: 0,
      removedLinesCount: 0,
      lastBackupTime: 'Never',
      diff: []
    });
  }

  const backups = db.getNcmBackups(dev.id);
  if (backups.length === 0) {
    return res.json({
      status: 'success',
      deviceName: dev.name,
      ip: dev.ip,
      hasDrift: false,
      addedLinesCount: 0,
      removedLinesCount: 0,
      lastBackupTime: 'Never',
      message: 'No SSH config backups exist yet for this device. Run a backup first.',
      diff: []
    });
  }

  const latest = backups[0];
  const previous = backups[1] || backups[0]; // nothing to compare against yet -> diff against itself (zero drift)
  const diff = diffLines(previous.configText.split(/\r?\n/), latest.configText.split(/\r?\n/));
  const addedLinesCount = diff.filter(l => l.type === 'added').length;
  const removedLinesCount = diff.filter(l => l.type === 'removed').length;

  res.json({
    status: 'success',
    deviceName: dev.name,
    ip: dev.ip,
    hasDrift: addedLinesCount > 0 || removedLinesCount > 0,
    addedLinesCount,
    removedLinesCount,
    lastBackupTime: new Date(latest.takenAt).toLocaleString(),
    comparingAgainst: backups[1] ? new Date(previous.takenAt).toLocaleString() : '(only backup on file)',
    diff
  });
});

// Intentionally simulated: pushing a config change to live network gear is a
// hard-to-reverse action on real infrastructure and should never happen from
// an automated "resolve drift" click without an explicit, reviewed SSH push
// step. Backup + diff above are real; this endpoint stays a no-op simulation.
router.post('/api/ccm/resolve-drift', (req, res) => {
  const { deviceId } = req.body;
  const devices = db.getDevices();
  const dev = deviceId ? devices.find(d => String(d.id) === String(deviceId)) : devices[0];
  const devName = dev ? dev.name : 'Device';
  const devIp = dev ? dev.ip : '127.0.0.1';

  res.json({
    status: 'success',
    simulated: true,
    message: `Simulated: configuration would be synchronized on ${devName} (${devIp}). Real config push is intentionally not wired up — it must be a reviewed, explicit action, not an automated one.`,
    syncedAt: new Date().toISOString()
  });
});

module.exports = router;
