const express = require('express');
const router = express.Router();
const db = require('../services/db');
const netprobe = require('../services/netprobe');

// List discovery profiles
router.get('/api/discovery/profiles', (req, res) => {
  res.json({
    status: 'success',
    profiles: db.getDiscoveryProfiles()
  });
});

let discoveryRules = [];

router.get('/api/discovery/rules', (req, res) => {
  res.json({ status: 'success', rules: discoveryRules });
});

router.post('/api/discovery/rules', (req, res) => {
  const { name, subnet, probe, probeId, schedule, credential } = req.body;
  const newRule = {
    id: discoveryRules.length + 1,
    name: name || `Subnet Sweep (${subnet || '192.168.1.0/24'})`,
    subnet: subnet || '192.168.1.0/24',
    probe: probe || 'Central Site Probe',
    probeId: probeId || 101,
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

// Run a real network discovery sweep: ICMP/TCP reachability + SNMP sysDescr
// identification against the actual subnet/range supplied by the caller.
router.post('/api/discovery/run', async (req, res) => {
  const { probeId, ipRange, startIp, endIp, subnet, cidr, snmpVersion, community } = req.body;
  const probe = db.getProbeById(probeId) || db.getProbes()[0];

  const rangeInput = subnet || cidr || ipRange || (startIp && endIp ? `${startIp} - ${endIp}` : startIp);
  const candidates = netprobe.expandRange(rangeInput, 256);

  if (candidates.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: `Could not parse a scannable range from "${rangeInput || ''}". Use CIDR (e.g. 192.168.30.0/24) or a start-end range (e.g. 192.168.30.1 - 192.168.30.50).`
    });
  }

  const existingIps = new Set((db.data.devices || []).map(d => d.ip));
  const discovered = [];
  const scannedCount = { reachable: 0 };

  await netprobe.mapWithConcurrency(candidates, 32, async (ip) => {
    if (existingIps.has(ip)) return;
    const reach = await netprobe.checkReachable(ip);
    if (!reach.reachable) return;
    scannedCount.reachable++;

    const snmpResult = await netprobe.snmpProbe(ip, community || 'public', snmpVersion);
    const classification = snmpResult && snmpResult.sysDescr
      ? netprobe.classifyFromSysDescr(snmpResult.sysDescr)
      : netprobe.classifyFromPort(reach.port || null);

    const dev = db.addDevice({
      name: (snmpResult && snmpResult.sysName) || `Host-${ip.split('.').pop()}`,
      displayName: `${classification.os} (${probe.displayName})`,
      ip,
      category: classification.category,
      type: (snmpResult && snmpResult.sysDescr) ? snmpResult.sysDescr.split('\n')[0].slice(0, 60) : 'Discovered Host',
      vendor: classification.vendor,
      os: classification.os,
      probeId: probe.id,
      snmpVersion: snmpVersion || 'v2c',
      status: 'Clear',
      cpu: snmpResult && snmpResult.cpu !== null && snmpResult.cpu !== undefined ? snmpResult.cpu : null,
      memory: snmpResult && snmpResult.memory !== null && snmpResult.memory !== undefined ? snmpResult.memory : null,
      disk: null,
      responseTime: reach.rttMs,
      serial: null,
      lastBackup: 'Pending Initial Discovery Backup'
    });
    discovered.push({
      ...dev,
      sysDescr: (snmpResult && snmpResult.sysDescr) || null,
      detectionMethod: reach.method,
      discoveredAt: new Date().toISOString()
    });
  });

  const logEntry = {
    id: 'DISC-' + Date.now(),
    probe: probe.displayName,
    ipRange: rangeInput,
    scannedHosts: candidates.length,
    reachableHosts: scannedCount.reachable,
    discoveredCount: discovered.length,
    timestamp: new Date().toISOString(),
    devices: discovered.map(d => ({ name: d.name, ip: d.ip, category: d.category }))
  };
  recentDiscoveries.unshift(logEntry);
  if (recentDiscoveries.length > 20) recentDiscoveries.pop();

  res.json({
    status: 'success',
    message: `Network discovery sweep completed on ${probe.displayName}: ${candidates.length} addresses scanned, ${scannedCount.reachable} reachable, ${discovered.length} new device(s) added.`,
    probe: probe.displayName,
    scannedHosts: candidates.length,
    reachableHosts: scannedCount.reachable,
    discoveredCount: discovered.length,
    discoveredDevices: discovered
  });
});

module.exports = router;
