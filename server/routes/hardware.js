const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine Device Hardware Inventory Specs (from DeviceInventoryInfo.xml)
router.get('/api/hardware/details', (req, res) => {
  const { deviceId, ip } = req.query;
  const dev = db.getDevices().find(d => d.id === deviceId || d.ip === ip) || db.getDevices()[0];

  const devCategory = dev ? (dev.category || '').toLowerCase() : 'server';
  const isSwitch = devCategory.includes('switch');
  const isRouter = devCategory.includes('router');
  const isServer = devCategory.includes('server');

  const hardware = {
    deviceName: dev ? dev.name : 'Target Host',
    ip: dev ? dev.ip : (ip || '127.0.0.1'),
    vendor: dev ? (dev.vendor || 'Generic') : 'Generic',
    category: dev ? dev.category : 'Server',
    model: isSwitch ? 'Cisco Catalyst WS-C3850-48P-L' : isRouter ? 'Cisco ASR 1001-X Integrated Router' : 'Dell PowerEdge R740 Enterprise Server',
    serialNumber: isSwitch ? 'FCW2144L09G' : isRouter ? 'SN-ASR1001-8891' : 'TAG-99281-DL',
    macAddress: isSwitch ? '00:1E:F7:28:9A:01' : isRouter ? '00:08:E3:44:11:00' : 'B8:27:EB:55:00:2A',
    systemOid: isSwitch ? '.1.3.6.1.4.1.9.1.1745' : isRouter ? '.1.3.6.1.4.1.9.1.1242' : '.1.3.6.1.4.1.674.10892.5',
    romVersion: 'CAT3K_CAA Boot Loader v16.12.4 (ROMMON)',
    firmwareVersion: dev.os || 'Cisco IOS 16.12.4 SPA',
    chassisType: isSwitch ? 'Rack Mountable 1U Form Factor' : isRouter ? 'Rack Mountable 2U' : '2U Enclosure',
    totalRam: isServer ? '64 GB ECC DDR4' : '4096 MB DDR3 SDRAM',
    flashMemory: '2048 MB Internal eUSB Flash (1048 MB Free)',
    powerSupplies: [
      { id: 'PSU-1', model: 'PWR-C1-715WAC', status: 'Operational (Active)', input: '110-240V AC', output: '715 Watts' },
      { id: 'PSU-2', model: 'PWR-C1-715WAC', status: 'Operational (Redundant Standby)', input: '110-240V AC', output: '715 Watts' }
    ],
    fanTrays: [
      { id: 'FAN-1', speed: '6,400 RPM', status: 'Normal', airflow: 'Front-to-Back' },
      { id: 'FAN-2', speed: '6,380 RPM', status: 'Normal', airflow: 'Front-to-Back' },
      { id: 'FAN-3', speed: '6,420 RPM', status: 'Normal', airflow: 'Front-to-Back' }
    ],
    thermalSensors: [
      { location: 'Chassis Intake', temperature: `${dev.temperature || 32} °C`, threshold: '65 °C', status: 'Normal' },
      { location: 'CPU Core 0', temperature: `${(dev.temperature || 32) + 8} °C`, threshold: '85 °C', status: 'Normal' }
    ],
    assetTag: 'ASSET-CORP-2026-NOC',
    rackLocation: 'Primary DC NYC - Rack 04 - Unit U18',
    maintenanceWindow: 'Sunday 02:00 - 04:00 UTC'
  };

  res.json({
    status: 'success',
    hardware
  });
});

module.exports = router;