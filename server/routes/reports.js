const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Reports overview & availability
router.get(['/api/reports/summary', '/api/reports/availability'], (req, res) => {
  const { probeId } = req.query;
  const devices = db.getDevices(probeId);
  const alarms = db.getAlarms(probeId);

  const avgAvailability = devices.length 
    ? Number((devices.reduce((acc, d) => acc + d.availability, 0) / devices.length).toFixed(2))
    : 100;

  const avgResponseTime = devices.length
    ? Number((devices.reduce((acc, d) => acc + d.responseTime, 0) / devices.length).toFixed(1))
    : 0;

  // Top 5 CPU
  const topCpu = [...devices].sort((a, b) => b.cpu - a.cpu).slice(0, 5);
  // Top 5 Memory
  const topMemory = [...devices].sort((a, b) => b.memory - a.memory).slice(0, 5);
  // Top 5 Response Time
  const topLatency = [...devices].sort((a, b) => b.responseTime - a.responseTime).slice(0, 5);

  res.json({
    status: 'success',
    metrics: {
      totalDevices: devices.length,
      avgAvailability,
      avgResponseTime,
      totalAlarms: alarms.length,
      topCpu: topCpu.map(d => ({ name: d.name, ip: d.ip, cpu: d.cpu, probe: d.probeName })),
      topMemory: topMemory.map(d => ({ name: d.name, ip: d.ip, memory: d.memory, probe: d.probeName })),
      topLatency: topLatency.map(d => ({ name: d.name, ip: d.ip, latency: d.responseTime, probe: d.probeName }))
    }
  });
});

// CSV Export Endpoint (Authentic ManageEngine CSV Format)
router.get('/api/reports/export/csv', (req, res) => {
  const { type = 'alarms', probeId } = req.query;
  const filename = `OpManager_Central_${type.toUpperCase()}_${new Date().toISOString().slice(0,10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (type === 'devices') {
    const devices = db.getDevices(probeId);
    let csv = 'Device Name,Display Name,IP Address,Category,Vendor,OS,Status,Availability %,CPU %,Memory %,Response Time (ms),Probe Name\n';
    devices.forEach(d => {
      csv += `"${d.name}","${d.displayName}","${d.ip}","${d.category}","${d.vendor}","${d.os}","${d.status}",${d.availability},${d.cpu},${d.memory},${d.responseTime},"${d.probeName}"\n`;
    });
    return res.send(csv);
  }

  if (type === 'probes') {
    const probes = db.getProbes();
    let csv = 'Probe ID,Display Name,Hostname,IP Address,Port,Status,Version,Sync Status,Monitored Devices,Active Alarms,Last Sync\n';
    probes.forEach(p => {
      csv += `"${p.id}","${p.displayName}","${p.hostname}","${p.ip}",${p.port},"${p.status}","${p.version}","${p.syncStatus}",${p.deviceCount},${p.alarmCount},"${p.lastSync}"\n`;
    });
    return res.send(csv);
  }

  if (type === 'audit') {
    let csv = 'Audit ID,Timestamp,Operator,Client IP,Module,Action Performed,Target Entity,Result,Details\n';
    enterpriseAuditTrail.forEach(a => {
      csv += `"${a.id}","${a.timestamp}","${a.user}","${a.ip}","${a.module}","${a.action}","${a.entity}","${a.result}","${(a.details || '').replace(/"/g, '""')}"\n`;
    });
    return res.send(csv);
  }

  // Default: Alarms CSV
  const alarms = db.getAlarms(probeId);
  const devices = db.getDevices(probeId);
  let csv = 'Alarm ID,Severity,Device Name,IP Address,Probe Name,Category,Message,Occurred Time,Acknowledged\n';
  alarms.forEach(a => {
    const devName = a.device || a.deviceName || 'DXB-CORE-SW-01';
    const devObj = devices.find(d => d.id === a.deviceId || d.name === devName);
    const devIp = a.ip || a.deviceIp || (devObj ? devObj.ip : '10.40.1.1');
    const prbName = a.probe || a.probeName || (devObj ? devObj.probeName : 'Dubai Campus Probe');
    const almTime = a.time || a.lastOccurred || a.firstOccurred || 'Just now';
    csv += `"${a.id}","${a.severity}","${devName}","${devIp}","${prbName}","${a.category}","${(a.message || '').replace(/"/g, '""')}","${almTime}",${a.acknowledged ? 'YES' : 'NO'}\n`;
  });
  return res.send(csv);
});

let enterpriseAuditTrail = [
  { id: 'AUD-001', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), user: 'admin', ip: '127.0.0.1', module: 'SYSTEM', action: 'SERVER_STARTUP', entity: 'OpManager Central (192.168.30.65)', result: 'SUCCESS', details: 'Production OpManager Central engine initialized successfully' }
];

router.get('/api/reports/audit', (req, res) => {
  res.json({
    status: 'success',
    total: enterpriseAuditTrail.length,
    auditLogs: enterpriseAuditTrail
  });
});

// Printable Executive Summary PDF HTML View with Authentic ManageEngine Banner
router.get('/api/reports/print-preview', (req, res) => {
  const { probeId } = req.query;
  const devices = db.getDevices(probeId);
  const alarms = db.getAlarms(probeId);
  const probes = db.getProbes();

  const avgAvailability = devices.length 
    ? (devices.reduce((acc, d) => acc + d.availability, 0) / devices.length).toFixed(2)
    : '100.00';

  const criticalAlarms = alarms.filter(a => a.severity === 'Critical');
  const troubleAlarms = alarms.filter(a => a.severity === 'Trouble');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ManageEngine OpManager Central - Executive Health Summary Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; font-size: 12px; }
    .me-pdf-header { display: flex; justify-content: space-between; align-items: center; background: #1e2631; color: #ffffff; padding: 14px 20px; border-radius: 6px; margin-bottom: 16px; border-bottom: 3px solid #49bd80; }
    .report-meta { display: flex; justify-content: space-between; border-bottom: 2px solid #0073e6; padding-bottom: 8px; margin-bottom: 16px; }
    .report-title { font-size: 20px; font-weight: 700; color: #0073e6; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .kpi-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; text-align: center; background: #f8fafc; }
    .kpi-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #0073e6; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; font-size: 11px; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; display: inline-block; }
    .badge-critical { background: #fee2e2; color: #dc2626; border: 1px solid #f87171; }
    .badge-trouble { background: #ffedd5; color: #ea580c; border: 1px solid #fb923c; }
    .badge-clear { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 10px;">
    <button onclick="window.print()" style="background: #0073e6; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">🖨️ Print / Save as PDF</button>
    <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close Preview</button>
  </div>

  <div class="me-pdf-header">
    <div style="display: flex; align-items: center; gap: 10px;">
      <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine OpManager" style="height: 30px; width: auto; filter: brightness(0) invert(1);">
      <span style="font-size: 18px; font-weight: 700; color: #ffffff;">Central</span>
      <span style="background: #49bd80; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 3px; letter-spacing: 0.4px;">ENTERPRISE</span>
    </div>
    <div style="text-align: right; font-size: 11px; color: #cbd5e1;">
      <div style="font-weight: 700; color: #ffffff;">ManageEngine OpManager Central v12.9.203 (Build 129203 • 64-Bit GA)</div>
      <div>Enterprise Network Performance, NCM & Distributed Probe Management</div>
    </div>
  </div>

  <div class="report-meta">
    <div>
      <div class="report-title">OpManager Central - Executive Health & Availability Report</div>
      <div style="color: #64748b; margin-top: 4px;">Unified Multi-Probe Distributed Network Infrastructure Assessment</div>
    </div>
    <div style="text-align: right; color: #64748b;">
      <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
      <div><strong>Scope:</strong> ${probeId ? 'Probe ' + probeId : 'All Enterprise Probes (4)'}</div>
      <div><strong>Central Server:</strong> OpManager Central v12.9.203</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Monitored Devices</div>
      <div class="kpi-val">${devices.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Average Availability SLA</div>
      <div class="kpi-val" style="color: #16a34a;">${avgAvailability}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Active Critical Alarms</div>
      <div class="kpi-val" style="color: #dc2626;">${criticalAlarms.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Distributed Probes</div>
      <div class="kpi-val">${probes.length} Online</div>
    </div>
  </div>

  <h3 style="color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-left: 3px solid #0073e6; padding-left: 8px;">Active High-Severity Alarms</h3>
  <table>
    <thead>
      <tr>
        <th>Severity</th>
        <th>Device</th>
        <th>IP Address</th>
        <th>Probe</th>
        <th>Message</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${alarms.slice(0, 8).map(a => {
        const devName = a.device || a.deviceName || 'DXB-CORE-SW-01';
        const devObj = devices.find(d => d.id === a.deviceId || d.name === devName);
        const devIp = a.ip || a.deviceIp || (devObj ? devObj.ip : '10.40.1.1');
        const prbName = a.probe || a.probeName || (devObj ? devObj.probeName : 'Dubai Campus Probe');
        const almTime = a.time || a.lastOccurred || a.firstOccurred || 'Just now';
        return `
        <tr>
          <td><span class="badge ${a.severity === 'Critical' ? 'badge-critical' : a.severity === 'Trouble' ? 'badge-trouble' : 'badge-clear'}">${a.severity}</span></td>
          <td><strong>${devName}</strong></td>
          <td>${devIp}</td>
          <td>${prbName}</td>
          <td>${a.message}</td>
          <td>${almTime}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <h3 style="color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-left: 3px solid #0073e6; padding-left: 8px;">Infrastructure Inventory & Availability</h3>
  <table>
    <thead>
      <tr>
        <th>Device Name</th>
        <th>IP Address</th>
        <th>Category</th>
        <th>Probe</th>
        <th>Status</th>
        <th>Availability %</th>
        <th>CPU %</th>
        <th>Memory %</th>
      </tr>
    </thead>
    <tbody>
      ${devices.slice(0, 15).map(d => `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td>${d.ip}</td>
          <td>${d.category}</td>
          <td>${d.probeName}</td>
          <td><span class="badge ${d.status === 'Clear' ? 'badge-clear' : d.status === 'Critical' ? 'badge-critical' : 'badge-trouble'}">${d.status}</span></td>
          <td>${d.availability}%</td>
          <td>${d.cpu}%</td>
          <td>${d.memory}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
    <div>Generated by ManageEngine OpManager Central (Version 12.9.203 - Build 129203)</div>
    <div>Confidential • Enterprise Network Operations Center • © 2026 ZOHO Corporation</div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

// Authentic ManageEngine Reports Endpoints
router.get(['/reports/getServerHealthReport', '/api/reports/getServerHealthReport'], (req, res) => {
  res.json({
    status: 'success',
    reportTitle: 'Server Health & Capacity Utilization',
    generatedTime: new Date().toISOString(),
    serversMonitored: 4,
    metrics: {
      avgCpuLoad: 53.2,
      avgMemoryLoad: 63.8,
      avgDiskUsed: 52.4,
      totalStorageTB: 2.1
    }
  });
});

router.get(['/reports/getAdvancedReportData', '/api/reports/getAdvancedReportData'], (req, res) => {
  res.json({
    status: 'success',
    reportId: 'adv_sla_30d',
    title: '30-Day SLA & MTTR Compliance',
    targetSLA: 99.9,
    achievedSLA: 99.98,
    meanTimeToResolveMinutes: 18.7,
    totalOutages: 1,
    outagesResolvedUnder30Min: 1
  });
});

router.get(['/reports/getReportsList', '/reports/listAllAdvancedReports', '/api/reports/list'], (req, res) => {
  res.json({
    status: 'success',
    categories: [
      { name: 'Availability & SLA Reports', count: 6 },
      { name: 'Performance & Capacity Trends', count: 12 },
      { name: 'Alarms, RCA & MTTR Analytics', count: 8 },
      { name: 'Hardware Lifecycle & Warranty', count: 4 }
    ]
  });
});

module.exports = router;