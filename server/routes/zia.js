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
    const highAlarmDev = criticals[0]?.device || criticals[0]?.deviceName || 'DXB-CORE-SW-01';
    answer = `Currently, there are **${criticals.length} Critical Alarms** and **${alarms.length} Total Active Alarms** across all distributed Enterprise Probes. The highest impact event is on **${highAlarmDev}** (${criticals[0]?.message || 'High Resource Contention'}).`;
    recommendations = [
      'Acknowledge critical alerts to suppress notification flooding.',
      'Check CPU threshold violations in Dubai and London Data Centers.',
      'Run SNMP polling diagnostics on affected edge interfaces.'
    ];
    relatedDevices = [...new Set(criticals.map(c => c.device || c.deviceName).filter(Boolean))];
  } else if (p.includes('probe') || p.includes('latency') || p.includes('london') || p.includes('dubai')) {
    const avgLat = Math.round(probes.reduce((acc, x) => acc + (x.latency || 12), 0) / probes.length);
    answer = `All **${probes.length} Enterprise Remote Probes** are reporting healthy mutual synchronization via \`eeAuthKey\`. Average probe latency is **${avgLat} ms**. Highest latency observed is **Probe-03-APAC (Singapore)** at 22 ms.`;
    recommendations = [
      'Probe heartbeat sync interval is operating within the 4-second SLA.',
      'No packet loss detected between Central Server and Probes.'
    ];
  } else if (p.includes('cpu') || p.includes('memory') || p.includes('performance') || p.includes('dxb') || p.includes('core')) {
    const highDev = [...devices].sort((a, b) => b.cpu - a.cpu)[0];
    answer = `Root Cause Analysis indicates **${highDev.name}** (${highDev.ip}) is experiencing elevated CPU utilization at **${highDev.cpu}%**. The primary process causing load is \`BGP-Router-RoutingEngine\` due to route table recalculation.`;
    recommendations = [
      'Inspect BGP peering session stability on GigabitEthernet0/1.',
      'Verify memory leak risk on OS version ' + (highDev.osVersion || 'IOS 16.12') + '.',
      'Capture diagnostic thread dump via SSH console.'
    ];
    relatedDevices = [highDev.name];
  } else if (p.includes('compliance') || p.includes('ccm') || p.includes('config')) {
    answer = `Configuration Compliance Management (CCM) reports **94.2% Baseline Compliance**. 1 device (*LDN-CORE-SW-01*) has an uncommitted configuration drift between Startup and Running configuration.`;
    recommendations = [
      'Execute "Push Central Baseline" to synchronize London core switch.',
      'Review running-config diff in CCM console.'
    ];
  } else {
    answer = `Zia AI Ops Engine analyzed your Enterprise Central telemetry: Network operational status is **Optimal** with **99.98% SLA Availability**. 48 devices actively monitored across 4 geographic probes.`;
    recommendations = [
      'Monitor Top 5 CPU utilization trends in Dashboard.',
      'Review active alarms in Central Alarm Console.'
    ];
  }

  res.json({
    status: 'success',
    bot: 'Zia AI Operations (ITOM Engine)',
    query: prompt,
    timestamp: new Date().toISOString(),
    response: {
      summary: answer,
      recommendations,
      relatedDevices,
      confidenceScore: 0.98
    }
  });
});

// Zia Alarm Summary Endpoint
router.get(['/api/zia/alarm-summary', '/zia/getAlarmSummary'], (req, res) => {
  const alarms = db.getAlarms();
  res.json({
    status: 'success',
    critical: alarms.filter(a => a.severity === 'Critical').length,
    trouble: alarms.filter(a => a.severity === 'Trouble').length,
    attention: alarms.filter(a => a.severity === 'Attention').length,
    clear: alarms.filter(a => a.severity === 'Clear').length,
    total: alarms.length,
    insights: 'Automated anomaly correlation detected 3 related alarms originating from a common upstream transit link in the Dubai Campus.'
  });
});

module.exports = router;
