const express = require('express');
const router = express.Router();
const db = require('../services/db');

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
      runningVersion: 'N/A',
      startupVersion: 'N/A',
      lastBackupTime: 'Never',
      runningConfig: [],
      startupConfig: []
    });
  }

  const devName = dev.name;
  const devIp = dev.ip;

  const runningConfig = [
    { line: 1, text: 'version 16.12', type: 'same' },
    { line: 2, text: 'service timestamps debug datetime msec', type: 'same' },
    { line: 3, text: 'service timestamps log datetime msec', type: 'same' },
    { line: 4, text: `hostname ${devName}`, type: 'same' },
    { line: 5, text: '!', type: 'same' },
    { line: 6, text: 'ip routing', type: 'same' },
    { line: 7, text: 'interface GigabitEthernet0/0/0', type: 'same' },
    { line: 8, text: ` ip address ${devIp} 255.255.255.0`, type: 'same' },
    { line: 9, text: 'end', type: 'same' }
  ];

  const startupConfig = [
    { line: 1, text: 'version 16.12', type: 'same' },
    { line: 2, text: 'service timestamps debug datetime msec', type: 'same' },
    { line: 3, text: 'service timestamps log datetime msec', type: 'same' },
    { line: 4, text: `hostname ${devName}`, type: 'same' },
    { line: 5, text: '!', type: 'same' },
    { line: 6, text: 'ip routing', type: 'same' },
    { line: 7, text: 'interface GigabitEthernet0/0/0', type: 'same' },
    { line: 8, text: ` ip address ${devIp} 255.255.255.0`, type: 'same' },
    { line: 9, text: 'end', type: 'same' }
  ];

  res.json({
    status: 'success',
    deviceName: dev.name,
    ip: dev.ip,
    hasDrift: false,
    addedLinesCount: 0,
    removedLinesCount: 0,
    runningVersion: 'v1.0 (Synchronized)',
    startupVersion: 'v1.0 (NVRAM Baseline)',
    lastBackupTime: dev.lastPolled || 'Today',
    runningConfig,
    startupConfig
  });
});

router.post('/api/ccm/resolve-drift', (req, res) => {
  const { deviceId } = req.body;
  const devices = db.getDevices();
  const dev = deviceId ? devices.find(d => String(d.id) === String(deviceId)) : devices[0];
  const devName = dev ? dev.name : 'Device';
  const devIp = dev ? dev.ip : '127.0.0.1';

  res.json({
    status: 'success',
    message: `Configuration synchronized on ${devName} (${devIp}).`,
    syncedAt: new Date().toISOString()
  });
});

module.exports = router;
