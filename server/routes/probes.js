const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine OpManager Central Enterprise Probe List endpoint: /enterprise/listProbes
router.get(['/enterprise/listProbes', '/api/json/enterprise/listProbes', '/api/enterprise/listProbes'], (req, res) => {
  const probes = db.getProbes();
  const result = probes.map((p, idx) => {
    const numericId = parseInt(String(p.id).replace(/\D/g, '') || (idx + 1), 10);
    return {
      PROBEID: numericId,
      NAME: p.name || `probe_${idx + 1}`,
      DISPLAYNAME: p.displayName || p.name,
      STATUS: p.status === 'Connected' || p.status === 'Online'
    };
  });
  res.json(result);
});

// Authentic ManageEngine Admin Get All Probes endpoint: /admin/getAllProbes
router.get(['/admin/getAllProbes', '/api/admin/getAllProbes', '/api/json/admin/getAllProbes'], (req, res) => {
  const probes = db.getProbes();
  const probeMap = {};
  probes.forEach((p, idx) => {
    const id = parseInt(String(p.id).replace(/\D/g, '') || (idx + 1), 10);
    probeMap[id] = p.displayName || p.name;
  });
  res.json(probeMap);
});

// NFA & FWA Enterprise Collector details (compatibility with Central ITOM)
router.get(['/nfaee/getAllCollInfo', '/api/nfaee/getAllCollInfo'], (req, res) => {
  const probes = db.getProbes();
  res.json(probes.map((p, idx) => ({
    id: idx + 1,
    name: p.displayName || p.name,
    collStatus: 'up'
  })));
});

router.get(['/fwaenterprise/getCollectorDetails', '/api/fwaenterprise/getCollectorDetails'], (req, res) => {
  const probes = db.getProbes();
  res.json({
    selColId: 1,
    colList: probes.map((p, idx) => ({
      CID: idx + 1,
      NAME: p.displayName || p.name,
      STATUS: true
    }))
  });
});

router.get(['/nfaee/getDECommunicationStatus', '/api/nfaee/getDECommunicationStatus'], (req, res) => {
  res.json({ status: 'connected', details: 'All probe communication channels verified' });
});

// OpManager Central EE Standard API: /api/json/admin/listProbes
router.get(['/admin/listProbes', '/api/json/admin/listProbes', '/api/probes'], (req, res) => {
  const probes = db.getProbes();
  res.json({
    status: 'success',
    responseCode: 200,
    totalProbes: probes.length,
    activeProbes: probes.filter(p => p.status === 'Connected' || p.status === 'Online').length,
    result: probes
  });
});

// Get specific probe details
router.get(['/enterprise/getProbeDetails', '/api/json/enterprise/getProbeDetails', '/api/probes/:id'], (req, res) => {
  const probeId = req.query.probeId || req.params.id;
  const probe = db.getProbeById(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  const probeDevices = db.getDevices(probe.id);
  const probeAlarms = db.getAlarms(probe.id);
  res.json({
    status: 'success',
    probe,
    devices: probeDevices,
    alarms: probeAlarms
  });
});

// Add new remote probe
router.post(['/api/json/enterprise/addProbe', '/api/probes'], (req, res) => {
  const { name, displayName, location, ip, port } = req.body;
  if (!name || !ip) {
    return res.status(400).json({ status: 'error', message: 'Probe name and IP are required' });
  }
  const newProbe = db.addProbe(req.body);
  res.status(201).json({
    status: 'success',
    message: `Probe ${newProbe.name} registered successfully to Central`,
    probe: newProbe
  });
});

// Force sync probe data to Central
router.post(['/api/json/enterprise/syncDataFromProbe', '/api/probes/:id/sync'], (req, res) => {
  const probeId = req.body.probeId || req.params.id;
  const probe = db.getProbeById(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  db.updateProbe(probe.id, { lastSync: new Date().toISOString() });
  res.json({
    status: 'success',
    message: `Probe ${probe.name} sync triggered successfully`,
    probeId: probe.id,
    timestamp: new Date().toISOString()
  });
});

// Sync all probes at once
router.post(['/api/json/enterprise/syncAllProbes', '/api/probes/sync-all'], (req, res) => {
  const probes = db.getProbes();
  probes.forEach(p => {
    db.updateProbe(p.id, { lastSync: new Date().toISOString() });
  });
  res.json({
    status: 'success',
    message: `All ${probes.length} Enterprise Probes synchronized successfully`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
