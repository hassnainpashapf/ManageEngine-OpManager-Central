'use strict';
/**
 * Reports routes — real-data rebuild.
 *
 * All figures come from the SQLite store (server/services/store.js) and the
 * Node os module. Nothing here is hardcoded or invented:
 *  - availability / response time / CPU / memory are computed from stored
 *    poll samples in the metrics table over an explicit window
 *    (?range=24h|7d|30d, or ?from=&to= as epoch ms / ISO strings).
 *    With no samples there is no data: availability is null, never 100%.
 *  - the audit trail reads ONLY store.audit_log (store.listAudit).
 *  - the version string comes from the repo package.json.
 *  - server health comes from os.loadavg()/totalmem()/freemem()/uptime().
 *    Disk figures are null: Node's os module exposes no disk usage.
 *  - SLA/MTTR/outages are computed from real metrics and real alarm
 *    raise/clear timestamps. With no data they are null/0, never constants.
 *  - the report catalogue counts are computed from the real list of
 *    report definitions served by this file.
 *
 * Response-shape changes vs the old fake implementation (all deliberate):
 *  - summary/availability: avgAvailability / avgResponseTime are null when
 *    there are no metric samples in the window (were 100 / 0). Added
 *    `window` and `sampleCount` / `devicesWithSamples` fields.
 *  - audit: rows are {id, timestamp, user, action, details} from audit_log.
 *    The old ip/module/entity/result columns do not exist in audit_log and
 *    are no longer returned.
 *  - print-preview: no silent truncation (all alarms/devices, with totals);
 *    scope shows the real probe count; version is the real package version.
 *  - getServerHealthReport: avgCpuLoad is the real 1-minute load average
 *    (NOT a percentage); avgDiskUsed / totalStorageTB are null (no disk
 *    data available from the os module). Added loadAverage, uptimeSeconds
 *    and memory byte counts.
 *  - getAdvancedReportData: achievedSLA / meanTimeToResolveMinutes are null
 *    when there is no data (previously hardcoded constants); totalOutages counts real
 *    alarms in the last 30 days (was 1).
 *  - getReportsList: counts are computed from the real catalogue below and
 *    each category now carries its `reports` list (id/title/path).
 *    'Hardware Lifecycle & Warranty' has count 0: no such report exists.
 */
const express = require('express');
const os = require('os');
const store = require('../services/store');
const { version: appVersion } = require('../../package.json');

const router = express.Router();

// ---------------------------------------------------------------- helpers ---

const RANGE_MS = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

/** Parse an epoch-ms or ISO timestamp query value; NaN when absent/invalid. */
function parseTs(value) {
  if (value === undefined || value === null || value === '') return NaN;
  if (/^-?\d+$/.test(String(value).trim())) return Number(value);
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? NaN : parsed;
}

/**
 * Resolve the reporting window. ?from/&to= win when both parse; otherwise
 * ?range= (1h|24h|7d|30d, default 24h) ending now.
 * Returns { since, until, range } with epoch-ms since/until.
 */
function parseWindow(req) {
  const now = Date.now();
  const range = RANGE_MS[req.query.range] ? req.query.range : '24h';
  const fromMs = parseTs(req.query.from);
  const toMs = parseTs(req.query.to);
  const until = Number.isNaN(toMs) ? now : toMs;
  const since = Number.isNaN(fromMs) ? until - RANGE_MS[range] : fromMs;
  return { since, until, range };
}

function mean(values) {
  const xs = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function round(value, digits) {
  if (value === null || value === undefined) return null;
  return Number(value.toFixed(digits));
}

/** Real display name for a stored device row: hostname, sys_name, else IP. */
function deviceLabel(device) {
  if (!device) return null;
  return device.hostname || device.sys_name || device.ip || null;
}

/** Map of probe id -> probe row, for resolving device.probe_id. */
function probeMap() {
  const map = new Map();
  for (const probe of store.listProbes()) map.set(probe.id, probe);
  return map;
}

function probeNameFor(device, probes) {
  if (!device || device.probe_id === null || device.probe_id === undefined) return null;
  const probe = probes.get(device.probe_id);
  return probe ? probe.name || null : null;
}

/**
 * Per-device stats from real poll samples in [since, until].
 * Availability = share of samples in the window that recorded a response
 * time (i.e. the poll got an answer). No samples -> availability null.
 */
function deviceWindowStats(deviceId, since, until) {
  const samples = store
    .getMetrics(deviceId, { since, limit: 10000 })
    .filter((m) => m.ts <= until);
  if (samples.length === 0) {
    return { availability: null, sampleCount: 0, avgResponseMs: null, avgCpuPct: null, avgMemPct: null };
  }
  const answered = samples.filter((m) => m.response_ms !== null && m.response_ms !== undefined).length;
  return {
    availability: round((answered / samples.length) * 100, 2),
    sampleCount: samples.length,
    avgResponseMs: round(mean(samples.map((m) => m.response_ms)), 1),
    avgCpuPct: round(mean(samples.map((m) => m.cpu_pct)), 1),
    avgMemPct: round(mean(samples.map((m) => m.mem_used_pct)), 1),
  };
}

/** Latest real reading for a device: newest metric sample, else the device row snapshot. */
function latestReading(device) {
  const latest = store.getLatestMetric(device.id);
  return {
    cpu: latest && latest.cpu_pct !== null && latest.cpu_pct !== undefined ? latest.cpu_pct : device.cpu_pct ?? null,
    memory: latest && latest.mem_used_pct !== null && latest.mem_used_pct !== undefined ? latest.mem_used_pct : device.mem_used_pct ?? null,
    responseMs: latest && latest.response_ms !== null && latest.response_ms !== undefined ? latest.response_ms : device.response_ms ?? null,
  };
}

/** Overall availability across devices over a window: mean of per-device values. Null when no device has samples. */
function overallAvailability(devices, since, until) {
  const perDevice = devices.map((d) => deviceWindowStats(d.id, since, until).availability);
  return round(mean(perDevice), 2);
}

function devicesForProbe(probeId) {
  if (probeId === undefined || probeId === null || probeId === '') return store.listDevices();
  const id = Number(probeId);
  if (Number.isNaN(id)) return store.listDevices();
  return store.listDevices({ probe_id: id });
}

function alarmsForDevices(devices) {
  const all = store.listAlarms({ limit: 1000 });
  if (!devices) return all;
  const ids = new Set(devices.map((d) => d.id));
  return all.filter((a) => a.device_id === null || a.device_id === undefined || ids.has(a.device_id));
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ------------------------------------------------- dashboard summary ---
// GET /api/dashboard/summary: real summary counts from the store only.
//  - activeDevices: devices the poller reports 'Up' (see services/poller.js).
//  - activeAlarms: alarms not cleared (active or acknowledged).
//  - activeProbes: probes that heartbeated within the last 3 minutes — the
//    same Online rule as routes/probes.js deriveStatus().
//  - availability: mean per-device availability over the last 24h from
//    stored poll samples; null when no samples exist (no history).
// Empty store -> all counts 0, devicesByStatus {}, availability null.

const PROBE_HEARTBEAT_STALE_MS = 3 * 60 * 1000;

router.get('/api/dashboard/summary', (req, res) => {
  const { since, until, range } = parseWindow(req);
  const devices = store.listDevices();
  const alarms = store.listAlarms({ limit: 1000 });
  const probes = store.listProbes();

  const devicesByStatus = {};
  for (const d of devices) {
    const key = d.status ?? 'Unknown';
    devicesByStatus[key] = (devicesByStatus[key] || 0) + 1;
  }

  res.json({
    status: 'success',
    window: {
      range,
      from: new Date(since).toISOString(),
      to: new Date(until).toISOString(),
    },
    totalDevices: devices.length,
    activeDevices: devices.filter((d) => d.status === 'Up').length,
    devicesByStatus,
    totalAlarms: alarms.length,
    activeAlarms: alarms.filter((a) => a.status !== 'cleared').length,
    totalProbes: probes.length,
    activeProbes: probes.filter(
      (p) => p.last_heartbeat_at && Date.now() - p.last_heartbeat_at <= PROBE_HEARTBEAT_STALE_MS,
    ).length,
    availability: overallAvailability(devices, since, until),
  });
});

// ------------------------------------------------- summary & availability ---

// Reports overview & availability, computed from real metric samples over
// an explicit window. No samples -> avgAvailability / avgResponseTime null.
router.get(['/api/reports/summary', '/api/reports/availability'], (req, res) => {
  const { probeId } = req.query;
  const { since, until, range } = parseWindow(req);
  const devices = devicesForProbe(probeId);
  const alarms = alarmsForDevices(devices);
  const probes = probeMap();

  const windowStats = devices.map((d) => deviceWindowStats(d.id, since, until));
  const avgAvailability = round(mean(windowStats.map((s) => s.availability)), 2);
  const allSamples = devices.flatMap((d) =>
    store.getMetrics(d.id, { since, limit: 10000 }).filter((m) => m.ts <= until)
  );
  const avgResponseTime = round(mean(allSamples.map((m) => m.response_ms)), 1);
  const sampleCount = allSamples.length;
  const devicesWithSamples = windowStats.filter((s) => s.sampleCount > 0).length;

  // Top 5 by latest real reading (metric sample, else device snapshot).
  const withReadings = devices.map((d) => ({ device: d, reading: latestReading(d) }));
  const topCpu = withReadings
    .filter((r) => r.reading.cpu !== null)
    .sort((a, b) => b.reading.cpu - a.reading.cpu)
    .slice(0, 5)
    .map((r) => ({ name: deviceLabel(r.device), ip: r.device.ip, cpu: r.reading.cpu, probe: probeNameFor(r.device, probes) }));
  const topMemory = withReadings
    .filter((r) => r.reading.memory !== null)
    .sort((a, b) => b.reading.memory - a.reading.memory)
    .slice(0, 5)
    .map((r) => ({ name: deviceLabel(r.device), ip: r.device.ip, memory: r.reading.memory, probe: probeNameFor(r.device, probes) }));
  const topLatency = withReadings
    .filter((r) => r.reading.responseMs !== null)
    .sort((a, b) => b.reading.responseMs - a.reading.responseMs)
    .slice(0, 5)
    .map((r) => ({ name: deviceLabel(r.device), ip: r.device.ip, latency: r.reading.responseMs, probe: probeNameFor(r.device, probes) }));

  res.json({
    status: 'success',
    window: {
      range,
      from: new Date(since).toISOString(),
      to: new Date(until).toISOString(),
    },
    metrics: {
      totalDevices: devices.length,
      avgAvailability,
      avgResponseTime,
      totalAlarms: alarms.length,
      sampleCount,
      devicesWithSamples,
      topCpu,
      topMemory,
      topLatency,
    },
  });
});

// ---------------------------------------------------------------- CSV export ---

// CSV Export: exactly the stored values, blank where a field is absent.
// No invented device/IP/probe/time fallbacks.
router.get('/api/reports/export/csv', (req, res) => {
  const { type = 'alarms', probeId } = req.query;
  const { since, until } = parseWindow(req);
  const filename = `OpManager_Central_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (type === 'devices') {
    const devices = devicesForProbe(probeId);
    const probes = probeMap();
    let csv = 'Device Name,Display Name,IP Address,Category,Vendor,OS,Status,Availability %,CPU %,Memory %,Response Time (ms),Probe Name\n';
    devices.forEach((d) => {
      const stats = deviceWindowStats(d.id, since, until);
      const reading = latestReading(d);
      csv += [
        csvCell(deviceLabel(d)),
        csvCell(d.sys_name),
        csvCell(d.ip),
        csvCell(d.category),
        csvCell(d.vendor),
        csvCell(d.sys_descr),
        csvCell(d.status),
        stats.availability === null ? '' : stats.availability,
        reading.cpu === null ? '' : reading.cpu,
        reading.memory === null ? '' : reading.memory,
        reading.responseMs === null ? '' : reading.responseMs,
        csvCell(probeNameFor(d, probes)),
      ].join(',') + '\n';
    });
    return res.send(csv);
  }

  if (type === 'probes') {
    const probes = store.listProbes();
    const devices = store.listDevices();
    const alarms = store.listAlarms({ limit: 1000 });
    let csv = 'Probe ID,Display Name,Hostname,IP Address,Port,Status,Version,Sync Status,Monitored Devices,Active Alarms,Last Sync\n';
    probes.forEach((p) => {
      const probeDevices = devices.filter((d) => d.probe_id === p.id);
      const probeDeviceIds = new Set(probeDevices.map((d) => d.id));
      const activeAlarms = alarms.filter(
        (a) => probeDeviceIds.has(a.device_id) && a.status !== 'cleared'
      ).length;
      csv += [
        csvCell(p.id),
        csvCell(p.name),
        csvCell(p.name),
        csvCell(p.ip),
        '',
        csvCell(p.status),
        '',
        '',
        probeDevices.length,
        activeAlarms,
        csvCell(p.last_heartbeat_at ? new Date(p.last_heartbeat_at).toISOString() : null),
      ].join(',') + '\n';
    });
    return res.send(csv);
  }

  if (type === 'audit') {
    let csv = 'Audit ID,Timestamp,Operator,Client IP,Module,Action Performed,Target Entity,Result,Details\n';
    store.listAudit(1000).forEach((a) => {
      csv += [
        csvCell(a.id),
        csvCell(a.created_at ? new Date(a.created_at).toISOString() : null),
        csvCell(a.user),
        '',
        '',
        csvCell(a.action),
        '',
        '',
        csvCell(a.detail),
      ].join(',') + '\n';
    });
    return res.send(csv);
  }

  // Default: Alarms CSV — stored values only; missing fields stay blank.
  const devices = devicesForProbe(probeId);
  const alarms = alarmsForDevices(devices);
  const probes = probeMap();
  const deviceById = new Map(devices.map((d) => [d.id, d]));
  let csv = 'Alarm ID,Severity,Device Name,IP Address,Probe Name,Category,Message,Occurred Time,Acknowledged\n';
  alarms.forEach((a) => {
    const dev = a.device_id !== null && a.device_id !== undefined ? deviceById.get(a.device_id) : null;
    csv += [
      csvCell(a.id),
      csvCell(a.severity),
      csvCell(dev ? deviceLabel(dev) : null),
      csvCell(dev ? dev.ip : null),
      csvCell(dev ? probeNameFor(dev, probes) : null),
      '',
      csvCell(a.message),
      csvCell(a.created_at ? new Date(a.created_at).toISOString() : null),
      a.status === 'acknowledged' ? 'YES' : 'NO',
    ].join(',') + '\n';
  });
  return res.send(csv);
});

// ---------------------------------------------------------------- audit trail ---

// Audit trail reads ONLY the persisted audit_log. Empty store -> [].
router.get('/api/reports/audit', (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);
  const rows = store.listAudit(limit);
  res.json({
    status: 'success',
    total: rows.length,
    auditLogs: rows.map((a) => ({
      id: a.id,
      timestamp: a.created_at ? new Date(a.created_at).toISOString() : null,
      user: a.user ?? null,
      action: a.action ?? null,
      details: a.detail ?? null,
    })),
  });
});

// ------------------------------------------------------------ print preview ---

// Printable Executive Summary. Version from package.json, scope from the
// real probe count, availability from real metric samples over the requested
// window, and full tables (no silent truncation) with explicit totals.
router.get('/api/reports/print-preview', (req, res) => {
  const { probeId } = req.query;
  const { since, until, range } = parseWindow(req);
  const devices = devicesForProbe(probeId);
  const alarms = alarmsForDevices(devices);
  const probes = store.listProbes();
  const probeById = probeMap();
  const deviceById = new Map(devices.map((d) => [d.id, d]));

  const avgAvailability = overallAvailability(devices, since, until);
  const avgAvailabilityDisplay = avgAvailability === null ? 'N/A' : `${avgAvailability.toFixed(2)}`;
  const criticalAlarms = alarms.filter((a) => a.severity && a.severity.toLowerCase() === 'critical');
  const deviceStats = new Map(devices.map((d) => [d.id, deviceWindowStats(d.id, since, until)]));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OpManager Central - Executive Health Summary Report</title>
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
      <span style="font-size: 18px; font-weight: 700; color: #ffffff;">OpManager Central</span>
    </div>
    <div style="text-align: right; font-size: 11px; color: #cbd5e1;">
      <div style="font-weight: 700; color: #ffffff;">OpManager Central v${escHtml(appVersion)}</div>
      <div>Network Performance &amp; Distributed Probe Management</div>
    </div>
  </div>

  <div class="report-meta">
    <div>
      <div class="report-title">OpManager Central - Executive Health &amp; Availability Report</div>
      <div style="color: #64748b; margin-top: 4px;">Unified Multi-Probe Distributed Network Infrastructure Assessment</div>
    </div>
    <div style="text-align: right; color: #64748b;">
      <div><strong>Generated:</strong> ${escHtml(new Date().toLocaleString())}</div>
      <div><strong>Period:</strong> ${escHtml(new Date(since).toLocaleString())} &ndash; ${escHtml(new Date(until).toLocaleString())} (${escHtml(range)})</div>
      <div><strong>Scope:</strong> ${probeId ? 'Probe ' + escHtml(probeId) : 'All Probes (' + probes.length + ')'}</div>
      <div><strong>Central Server:</strong> OpManager Central v${escHtml(appVersion)}</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Monitored Devices</div>
      <div class="kpi-val">${devices.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Average Availability SLA</div>
      <div class="kpi-val" style="color: #16a34a;">${avgAvailabilityDisplay}${avgAvailability === null ? '' : '%'}</div>
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

  <h3 style="color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-left: 3px solid #0073e6; padding-left: 8px;">Active High-Severity Alarms (showing all ${alarms.length} of ${alarms.length})</h3>
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
      ${alarms.map((a) => {
        const dev = a.device_id !== null && a.device_id !== undefined ? deviceById.get(a.device_id) : null;
        const devName = dev ? deviceLabel(dev) : '';
        const devIp = dev ? dev.ip || '' : '';
        const prbName = dev ? probeNameFor(dev, probeById) || '' : '';
        const almTime = a.created_at ? new Date(a.created_at).toISOString() : '';
        const sev = a.severity || '';
        return `
        <tr>
          <td><span class="badge ${sev === 'Critical' ? 'badge-critical' : sev === 'Trouble' ? 'badge-trouble' : 'badge-clear'}">${escHtml(sev)}</span></td>
          <td><strong>${escHtml(devName)}</strong></td>
          <td>${escHtml(devIp)}</td>
          <td>${escHtml(prbName)}</td>
          <td>${escHtml(a.message)}</td>
          <td>${escHtml(almTime)}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <h3 style="color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-left: 3px solid #0073e6; padding-left: 8px;">Infrastructure Inventory &amp; Availability (showing all ${devices.length} of ${devices.length})</h3>
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
      ${devices.map((d) => {
        const reading = latestReading(d);
        const stats = deviceStats.get(d.id);
        const avail = stats && stats.availability !== null ? `${stats.availability}%` : 'N/A';
        return `
        <tr>
          <td><strong>${escHtml(deviceLabel(d))}</strong></td>
          <td>${escHtml(d.ip)}</td>
          <td>${escHtml(d.category)}</td>
          <td>${escHtml(probeNameFor(d, probeById))}</td>
          <td><span class="badge ${d.status === 'Clear' ? 'badge-clear' : d.status === 'Critical' ? 'badge-critical' : 'badge-trouble'}">${escHtml(d.status)}</span></td>
          <td>${avail}</td>
          <td>${reading.cpu === null ? 'N/A' : escHtml(reading.cpu) + '%'}</td>
          <td>${reading.memory === null ? 'N/A' : escHtml(reading.memory) + '%'}</td>
        </tr>
      `;
      }).join('')}
    </tbody>
  </table>

  <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
    <div>Generated by OpManager Central (Version ${escHtml(appVersion)})</div>
    <div>Availability is computed from stored poll samples over the period above; N/A means no samples were recorded.</div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

// ------------------------------------------------------- server health report ---

// Server health from the real host running this process (Node os module).
// avgCpuLoad is the real 1-minute load average (not a percentage).
// Disk figures are null: the os module exposes no disk usage.
router.get(['/reports/getServerHealthReport', '/api/reports/getServerHealthReport'], (req, res) => {
  const load = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const devices = store.listDevices();
  const serversMonitored = devices.filter((d) => d.category && /server/i.test(d.category)).length;

  res.json({
    status: 'success',
    reportTitle: 'Server Health & Capacity Utilization',
    generatedTime: new Date().toISOString(),
    serversMonitored,
    totalDevicesMonitored: devices.length,
    metrics: {
      avgCpuLoad: round(load[0], 2),
      avgMemoryLoad: totalMem ? round(((totalMem - freeMem) / totalMem) * 100, 1) : null,
      avgDiskUsed: null,
      totalStorageTB: null,
      loadAverage: {
        '1m': round(load[0], 2),
        '5m': round(load[1], 2),
        '15m': round(load[2], 2),
      },
      uptimeSeconds: Math.floor(os.uptime()),
      totalMemoryBytes: totalMem,
      freeMemoryBytes: freeMem,
      platform: os.platform(),
      hostname: os.hostname(),
    },
    notes: [
      'avgCpuLoad is the 1-minute system load average from os.loadavg(), not a CPU percentage.',
      'avgDiskUsed and totalStorageTB are null: disk usage is not available from the Node os module.',
      'serversMonitored counts stored devices whose category contains "server".',
    ],
  });
});

// ------------------------------------------------------- advanced SLA / MTTR ---

// 30-day SLA & MTTR from real data: availability from metric samples over
// the last 30 days; MTTR from real alarm raise -> clear durations; outages
// counted from real alarms raised in the last 30 days. Null/0 with no data.
router.get(['/reports/getAdvancedReportData', '/api/reports/getAdvancedReportData'], (req, res) => {
  const now = Date.now();
  const since30d = now - RANGE_MS['30d'];
  const devices = store.listDevices();
  const alarms30d = store
    .listAlarms({ limit: 1000 })
    .filter((a) => a.created_at !== null && a.created_at !== undefined && a.created_at >= since30d);
  const cleared = alarms30d.filter(
    (a) => a.cleared_at !== null && a.cleared_at !== undefined && a.created_at !== null && a.created_at !== undefined
  );
  const resolveMinutes = cleared.map((a) => (a.cleared_at - a.created_at) / 60000);
  const meanTimeToResolveMinutes = round(mean(resolveMinutes), 1);
  const outagesResolvedUnder30Min = cleared.filter((a) => a.cleared_at - a.created_at <= 30 * 60 * 1000).length;

  res.json({
    status: 'success',
    reportId: 'adv_sla_30d',
    title: '30-Day SLA & MTTR Compliance',
    window: {
      from: new Date(since30d).toISOString(),
      to: new Date(now).toISOString(),
    },
    targetSLA: 99.9,
    achievedSLA: overallAvailability(devices, since30d, now),
    meanTimeToResolveMinutes,
    totalOutages: alarms30d.length,
    outagesResolvedUnder30Min,
  });
});

// ---------------------------------------------------------------- reports list ---

// Real catalogue of the reports this route can actually generate.
// Counts are computed from the catalogue, not hardcoded.
const REPORT_CATALOGUE = [
  { category: 'Availability & SLA Reports', id: 'summary', title: 'Availability Summary', path: '/api/reports/summary' },
  { category: 'Availability & SLA Reports', id: 'availability', title: 'Availability Report', path: '/api/reports/availability' },
  { category: 'Availability & SLA Reports', id: 'advanced-sla', title: '30-Day SLA & MTTR Compliance', path: '/reports/getAdvancedReportData' },
  { category: 'Performance & Capacity Trends', id: 'server-health', title: 'Server Health & Capacity Utilization', path: '/reports/getServerHealthReport' },
  { category: 'Alarms, RCA & MTTR Analytics', id: 'alarms-csv', title: 'Alarms CSV Export', path: '/api/reports/export/csv?type=alarms' },
  { category: 'Alarms, RCA & MTTR Analytics', id: 'audit', title: 'Audit Trail', path: '/api/reports/audit' },
  { category: 'Alarms, RCA & MTTR Analytics', id: 'print-preview', title: 'Executive Health Summary (Print Preview)', path: '/api/reports/print-preview' },
];

const REPORT_CATEGORY_NAMES = [
  'Availability & SLA Reports',
  'Performance & Capacity Trends',
  'Alarms, RCA & MTTR Analytics',
  'Hardware Lifecycle & Warranty',
];

router.get(['/reports/getReportsList', '/reports/listAllAdvancedReports', '/api/reports/list'], (req, res) => {
  res.json({
    status: 'success',
    categories: REPORT_CATEGORY_NAMES.map((name) => {
      const reports = REPORT_CATALOGUE.filter((r) => r.category === name).map((r) => ({
        id: r.id,
        title: r.title,
        path: r.path,
      }));
      return { name, count: reports.length, reports };
    }),
  });
});

module.exports = router;
