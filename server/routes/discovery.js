const express = require('express');
const router = express.Router();
const db = require('../services/db');

// List discovery profiles
router.get('/api/discovery/profiles', (req, res) => {
  res.json({
    status: 'success',
    profiles: db.getDiscoveryProfiles()
  });
});

let discoveryRules = [
  { id: 1, name: 'Dubai Campus LAN (10.40.0.0/20)', subnet: '10.40.0.0/20', probe: 'Dubai Campus Core', probeId: 4, schedule: 'Daily at 02:00 AM', credential: 'SNMPv2c Community (dxb-ro)' },
  { id: 2, name: 'New York Datacenter VPC (10.10.0.0/16)', subnet: '10.10.0.0/16', probe: 'New York Data Center', probeId: 1, schedule: 'Daily at 03:00 AM', credential: 'SNMPv3 USM (SHA-256 / AES-256)' },
  { id: 3, name: 'London Branch Office (10.20.0.0/24)', subnet: '10.20.0.0/24', probe: 'London Branch Office', probeId: 2, schedule: 'Daily at 04:00 AM', credential: 'WMI / WinRM (corp\\svc_opm)' },
  { id: 4, name: 'Singapore Cloud VPC (10.30.0.0/16)', subnet: '10.30.0.0/16', probe: 'Singapore Cloud VPC', probeId: 3, schedule: 'Daily at 05:00 AM', credential: 'Linux SSH Key Vault (id_rsa)' }
];

router.get('/api/discovery/rules', (req, res) => {
  res.json({ status: 'success', rules: discoveryRules });
});

router.post('/api/discovery/rules', (req, res) => {
  const { name, subnet, probe, probeId, schedule, credential } = req.body;
  const newRule = {
    id: discoveryRules.length + 1,
    name: name || `Subnet Sweep (${subnet || '10.50.0.0/24'})`,
    subnet: subnet || '10.50.0.0/24',
    probe: probe || 'Dubai Campus Core',
    probeId: probeId || 4,
    schedule: schedule || 'Daily at 06:00 AM',
    credential: credential || 'SNMPv2c Community'
  };
  discoveryRules.push(newRule);
  res.status(201).json({ status: 'success', message: `Discovery rule ${newRule.name} added.`, rule: newRule });
});

// Recent discoveries history
let recentDiscoveries = [];
router.get('/api/discovery/history', (req, res) => {
  res.json({
    status: 'success',
    history: recentDiscoveries
  });
});

// Run network discovery simulation
router.post('/api/discovery/run', (req, res) => {
  const { probeId, ipRange, startIp, endIp, snmpVersion } = req.body;
  const probe = db.getProbeById(probeId) || db.getProbes()[0];

  const sampleCatalog = [
    { vendor: 'Cisco Systems', category: 'Switch', type: 'Cisco Catalyst 3850-48P', os: 'Cisco IOS-XE 16.12.4', sysDescr: 'Cisco IOS Software, C3850 Software (CAT3K_CAA-UNIVERSALK9-M)' },
    { vendor: 'Fortinet, Inc.', category: 'Firewall', type: 'FortiGate 100F', os: 'FortiOS v7.2.4', sysDescr: 'Fortinet FortiGate-100F Enterprise Next-Gen Firewall' },
    { vendor: 'Dell Inc.', category: 'Server', type: 'Dell PowerEdge R740xd', os: 'VMware ESXi 7.0.3', sysDescr: 'Dell PowerEdge R740xd Rackmount Hypervisor Node' },
    { vendor: 'Aruba Networks', category: 'Wireless', type: 'Aruba AP-535', os: 'ArubaOS 8.10.0', sysDescr: 'Aruba Instant AP-535 Dual 4x4:4 802.11ax Campus AP' },
    { vendor: 'Juniper Networks', category: 'Router', type: 'Juniper MX204', os: 'Junos OS 21.4R1', sysDescr: 'Juniper Networks MX204 3D Universal Edge Router' }
  ];

  const baseIpParts = (startIp || '10.10.0.1').split('.').slice(0, 3).join('.');
  const discovered = [];

  const count = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
  for (let i = 0; i < count; i++) {
    const hostNum = Math.floor(Math.random() * 200) + 12;
    const item = sampleCatalog[(i + Math.floor(Math.random() * 5)) % sampleCatalog.length];
    const dev = db.addDevice({
      name: `${item.vendor.split(' ')[0].toUpperCase()}-${item.category.toUpperCase()}-${hostNum}`,
      displayName: `${item.type} (${probe.displayName})`,
      ip: `${baseIpParts}.${hostNum}`,
      category: item.category,
      type: item.type,
      vendor: item.vendor,
      os: item.os,
      probeId: probe.id,
      snmpVersion: snmpVersion || 'v2c',
      status: 'Clear',
      cpu: Math.floor(Math.random() * 25) + 15,
      memory: Math.floor(Math.random() * 35) + 25,
      disk: Math.floor(Math.random() * 40) + 20,
      responseTime: Math.floor(Math.random() * 8) + 1,
      serial: 'FOC' + Math.floor(10000000 + Math.random() * 90000000),
      lastBackup: 'Pending Initial Discovery Backup'
    });
    discovered.push({
      ...dev,
      sysDescr: item.sysDescr,
      discoveredAt: new Date().toISOString()
    });
  }

  const logEntry = {
    id: 'DISC-' + Date.now(),
    probe: probe.displayName,
    ipRange: ipRange || `${startIp || '10.10.0.1'} - ${endIp || '10.10.0.30'}`,
    discoveredCount: discovered.length,
    timestamp: new Date().toISOString(),
    devices: discovered.map(d => ({ name: d.name, ip: d.ip, category: d.category }))
  };
  recentDiscoveries.unshift(logEntry);
  if (recentDiscoveries.length > 20) recentDiscoveries.pop();

  res.json({
    status: 'success',
    message: `Network discovery sweep completed on ${probe.displayName}`,
    probe: probe.displayName,
    discoveredCount: discovered.length,
    discoveredDevices: discovered
  });
});

module.exports = router;
