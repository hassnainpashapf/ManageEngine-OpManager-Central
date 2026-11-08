const express = require('express');
const router = express.Router();
const db = require('../services/db');

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

// Device Configuration Backup (NCM Engine)
router.post(['/api/ccm/backup-device', '/api/ccm/backup'], (req, res) => {
  const deviceId = req.body.deviceId || '1';
  const dev = db.getDeviceById(deviceId) || { name: 'Core-Switch-NYC', ip: '10.0.0.1' };

  res.json({
    status: 'success',
    message: `Running configuration successfully backed up for ${dev.name} (${dev.ip}) via SSH/TFTP`,
    deviceId: dev.id,
    revision: `v4.${Math.floor(Date.now() / 100000 % 100)}`,
    backupTime: new Date().toLocaleString(),
    complianceStatus: 'Compliant',
    linesCount: 248,
    fileSize: '14.2 KB'
  });
});

module.exports = router;
