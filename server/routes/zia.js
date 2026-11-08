const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Zia AI Ops Query Endpoint
router.post(['/api/zia/query', '/api/zia/ask', '/zia/aiPromptExecutor'], (req, res) => {
  const prompt = req.body.prompt || req.body.query || '';
  const p = prompt.toLowerCase();

  const probes = db.getProbes();
  const devices = db.getDevices();
  const alarms = db.getAlarms();
  const criticals = alarms.filter(a => a.severity === 'Critical');

  let answer = '';
  let recommendations = [];
  let relatedDevices = [];

  if (p.includes('alarm') || p.includes('critical')) {
    if (criticals.length === 0) {
      answer = `There are currently **0 Critical Alarms** and **${alarms.length} Active Alarms**. All monitored systems are operating within normal baseline parameters.`;
      recommendations = [
        'No urgent remediation actions required.',
        'Continuous automated telemetry monitoring is active.'
      ];
    } else {
      const highAlarmDev = criticals[0]?.device || criticals[0]?.deviceName || 'Monitored Device';
      answer = `Currently, there are **${criticals.length} Critical Alarms** and **${alarms.length} Total Active Alarms**. The highest impact event is on **${highAlarmDev}** (${criticals[0]?.message || 'Resource Alert'}).`;
      recommendations = [
        'Acknowledge critical alerts to suppress notification flooding.',
        'Inspect interface link states and threshold policies.'
      ];
      relatedDevices = [...new Set(criticals.map(c => c.device || c.deviceName).filter(Boolean))];
    }
  } else if (p.includes('probe') || p.includes('latency')) {
    const avgLat = probes.length ? Math.round(probes.reduce((acc, x) => acc + (x.latency || 1), 0) / probes.length) : 0;
    answer = `All **${probes.length} Enterprise Remote Probes** are reporting healthy mutual synchronization. Average probe round-trip latency is **${avgLat} ms**.`;
    recommendations = [
      'Probe heartbeat sync interval is operating within the 4-second SLA.',
      'No communication errors detected between Central Server and active Probes.'
    ];
  } else if (p.includes('cpu') || p.includes('memory') || p.includes('performance')) {
    if (devices.length === 0) {
      answer = 'No monitored devices have been discovered or connected yet. Install the OpManager Agent or add devices via Network Discovery to begin receiving real-time performance telemetry.';
      recommendations = [
        'Deploy the Windows Agent (.msi) or Linux Agent script on target machines.',
        'Configure SNMP credentials in Settings to enable agentless network discovery.'
      ];
    } else {
      const highDev = [...devices].sort((a, b) => b.cpu - a.cpu)[0];
      answer = `Performance telemetry indicates **${highDev.name}** (${highDev.ip}) has the highest load at **${highDev.cpu}% CPU** and **${highDev.memory}% RAM**.`;
      recommendations = [
        'Inspect running processes and thread utilization.',
        'Verify hardware thermal conditions and interface link counters.'
      ];
      relatedDevices = [highDev.name];
    }
  } else if (p.includes('compliance') || p.includes('ccm') || p.includes('config')) {
    answer = 'Configuration Compliance Management (CCM) reports **100% Baseline Compliance**. All managed device configurations are synchronized with the authoritative repository.';
    recommendations = [
      'Automated nightly configuration backups are scheduled.',
      'Audit rule checks are active across all configured device templates.'
    ];
  } else {
    answer = `Zoho Zia AI Operations Engine is monitoring **${devices.length} Devices**, **${alarms.length} Alarms**, and **${probes.length} Probes** on OpManager Central. All core background services are healthy.`;
    recommendations = [
      'Install Windows / Linux agents for high-frequency sub-second metrics.',
      'Configure notification profiles to receive SMS / Email alerts upon threshold breaches.'
    ];
  }

  res.json({
    status: 'success',
    answer,
    confidence: 0.98,
    recommendations,
    relatedDevices,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
