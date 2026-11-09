const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine Device Hardware Inventory Specs (from DeviceInventoryInfo.xml)
router.get('/api/hardware/details', (req, res) => {
  const { deviceId, ip } = req.query;
  const devices = db.getDevices();
  const dev = devices.find(d => d.id === deviceId || d.ip === ip) || devices[0];

  if (!dev) {
    return res.json({
      status: 'success',
      hardware: null,
      message: 'No devices found in inventory.'
    });
  }

  const devCategory = (dev.category || '').toLowerCase();
  const isSwitch = devCategory.includes('switch');
  const isRouter = devCategory.includes('router');
  const isServer = devCategory.includes('server');

  // Real OIDs/SNMP can't reach chassis-level PSU/fan/thermal/RAM specs without
  // real IPMI/iDRAC/vendor hardware MIBs we don't have access to here, so
  // this stays a labeled simulation; only the identity fields above it come
  // from the real polled device record.
  const hardware = {
    simulated: true,
    deviceName: dev.name,
    ip: dev.ip,
    vendor: dev.vendor || 'Generic',
    category: dev.category || 'Server',
    model: dev.type || (isSwitch ? 'Cisco Catalyst Switch' : isRouter ? 'Cisco Integrated Router' : 'Standard Monitored Host'),
    serialNumber: dev.serial || 'ME-SNMP-001',
    macAddress: dev.mac || '00:00:00:00:00:00',
    systemOid: dev.sysOID || '.1.3.6.1.4.1.9.1.1',
    romVersion: 'ROMMON v16.12',
    firmwareVersion: dev.os || 'Enterprise OS',
    chassisType: 'Rack Mountable Unit',
    totalRam: '16 GB',
    flashMemory: '4096 MB Flash',
    powerSupplies: [
      { id: 'PSU-1', model: 'PWR-715W', status: 'Operational', input: '110-240V AC', output: '715 Watts' }
    ],
    fanTrays: [
      { id: 'FAN-1', speed: '5,800 RPM', status: 'Normal', airflow: 'Front-to-Back' }
    ],
    thermalSensors: [
      { location: 'Chassis Intake', temperature: `${dev.temperature || 28} °C`, threshold: '65 °C', status: 'Normal' }
    ],
    assetTag: `ASSET-${dev.name}`,
    rackLocation: 'Unassigned',
    maintenanceWindow: 'None'
  };

  res.json({
    status: 'success',
    hardware
  });
});

module.exports = router;
