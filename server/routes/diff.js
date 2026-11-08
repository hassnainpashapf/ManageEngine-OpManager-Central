const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/api/ccm/diff', (req, res) => {
  const { deviceId = '1' } = req.query;
  const dev = db.getDevices().find(d => d.id === deviceId) || db.getDevices()[0];
  const devName = dev ? dev.name : 'Device-01';
  const devIp = dev ? dev.ip : '10.0.0.1';

  const runningConfig = [
    { line: 1, text: 'version 16.12', type: 'same' },
    { line: 2, text: 'service timestamps debug datetime msec', type: 'same' },
    { line: 3, text: 'service timestamps log datetime msec', type: 'same' },
    { line: 4, text: 'no service password-encryption', type: 'same' },
    { line: 5, text: `hostname ${devName}`, type: 'same' },
    { line: 6, text: '!', type: 'same' },
    { line: 7, text: 'ip routing', type: 'same' },
    { line: 8, text: 'ip domain name enterprise.corp', type: 'same' },
    { line: 9, text: 'snmp-server community public_monitor_ro RO', type: 'added' },
    { line: 10, text: 'snmp-server host 10.0.0.100 version 2c public_monitor_ro', type: 'added' },
    { line: 11, text: 'snmp-server enable traps', type: 'same' },
    { line: 12, text: 'interface GigabitEthernet0/0/0', type: 'same' },
    { line: 13, text: ` ip address ${devIp} 255.255.255.0`, type: 'same' },
    { line: 14, text: ' negotiation auto', type: 'same' },
    { line: 15, text: '!', type: 'same' },
    { line: 16, text: 'end', type: 'same' }
  ];

  const startupConfig = [
    { line: 1, text: 'version 16.12', type: 'same' },
    { line: 2, text: 'service timestamps debug datetime msec', type: 'same' },
    { line: 3, text: 'service timestamps log datetime msec', type: 'same' },
    { line: 4, text: 'no service password-encryption', type: 'same' },
    { line: 5, text: `hostname ${dev.name}`, type: 'same' },
    { line: 6, text: '!', type: 'same' },
    { line: 7, text: 'ip routing', type: 'same' },
    { line: 8, text: 'ip domain name enterprise.corp', type: 'same' },
    { line: 9, text: 'no ip domain-lookup', type: 'removed' },
    { line: 10, text: 'snmp-server enable traps', type: 'same' },
    { line: 11, text: 'interface GigabitEthernet0/0/0', type: 'same' },
    { line: 12, text: ` ip address ${dev.ip} 255.255.255.0`, type: 'same' },
    { line: 13, text: ' negotiation auto', type: 'same' },
    { line: 14, text: '!', type: 'same' },
    { line: 15, text: 'end', type: 'same' }
  ];

  res.json({
    status: 'success',
    deviceName: dev.name,
    ip: dev.ip,
    hasDrift: true,
    addedLinesCount: 2,
    removedLinesCount: 1,
    runningVersion: 'v8.1 (Unsaved in NVRAM)',
    startupVersion: 'v8.0 (NVRAM Baseline)',
    lastBackupTime: 'Today at 01:15 AM',
    runningConfig,
    startupConfig
  });
});

router.post('/api/ccm/resolve-drift', (req, res) => {
  const { deviceId = '1' } = req.body;
  const dev = db.getDevices().find(d => d.id === deviceId) || db.getDevices()[0];
  const devName = dev ? dev.name : 'Device-01';
  const devIp = dev ? dev.ip : '10.0.0.1';

  res.json({
    status: 'success',
    message: `Configuration drift resolved: 'copy running-config startup-config' executed on ${devName} (${devIp}).`,
    syncedAt: new Date().toISOString()
  });
});

module.exports = router;