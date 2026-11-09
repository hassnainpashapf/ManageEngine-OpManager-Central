const express = require('express');
const router = express.Router();
const db = require('../services/db');
const sshclient = require('../services/sshclient');

// OpManager Central EE Standard API: /api/json/enterprise/pushCentralConfig
router.get('/api/ccm/configs', (req, res) => {
  res.json({
    status: 'success',
    configs: db.getCCMConfigurations()
  });
});

router.post(['/api/json/enterprise/pushCentralConfig', '/api/ccm/push'], (req, res) => {
  const { configurationType, targetProbeId } = req.body;
  if (!configurationType) {
    return res.status(400).json({ status: 'error', message: 'configurationType is required' });
  }

  const updatedConfig = db.pushCCMConfig(configurationType, targetProbeId || 'all');
  if (!updatedConfig) {
    return res.status(404).json({ status: 'error', message: `Configuration ${configurationType} not found in CCM catalog` });
  }

  res.json({
    status: 'success',
    message: `Configuration ${configurationType} successfully pushed and acknowledged by probes.`,
    config: updatedConfig,
    pushedAt: new Date().toISOString()
  });
});

// Device Configuration Backup (NCM Engine) - real SSH "show running-config" pull
router.post(['/api/ccm/backup-device', '/api/ccm/backup'], async (req, res) => {
  const deviceId = req.body.deviceId;
  const dev = db.getDeviceById(deviceId);
  if (!dev) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }

  const cred = sshclient.findSshCredential(db);
  if (!cred || !cred.userName || !cred.password) {
    return res.status(400).json({
      status: 'error',
      message: 'No SSH/CLI credential with a username and password is configured in the Credential Library. Add one under Settings > Credentials before running a backup.'
    });
  }

  try {
    const raw = await sshclient.runShowCommand(dev.ip, cred, 'show running-config');
    const configText = sshclient.cleanConfigOutput(raw, 'show running-config');
    if (!configText) {
      throw new Error('Device returned an empty response to "show running-config"');
    }
    const backup = db.addNcmBackup(dev.id, configText, { credentialUsed: cred.name });

    res.json({
      status: 'success',
      message: `Running configuration successfully backed up for ${dev.name} (${dev.ip}) via SSH`,
      deviceId: dev.id,
      backupId: backup.id,
      backupTime: new Date(backup.takenAt).toLocaleString(),
      linesCount: backup.lineCount,
      fileSize: `${(backup.byteSize / 1024).toFixed(1)} KB`
    });
  } catch (err) {
    res.status(502).json({
      status: 'error',
      message: `SSH backup failed for ${dev.name} (${dev.ip}): ${err.message}`
    });
  }
});

module.exports = router;
