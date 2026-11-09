'use strict';

const express = require('express');
const router = express.Router();
const store = require('../services/store');

// Data summary endpoint.
//
// There is no model and no correlation engine behind this endpoint, so it
// is labelled as a data summary, not an assistant. Every number in the
// response is computed live from the store at request time. When the store
// holds no data for a question, the response says so instead of asserting
// that anything is healthy, compliant, or within any baseline or SLA.
// `confidence` is null: there is no inference to score.

function deviceLabel(device) {
  if (!device) return null;
  return device.hostname || device.sys_name || device.ip || `device ${device.id}`;
}

function formatTs(ts) {
  if (ts === null || ts === undefined) return null;
  const d = new Date(Number(ts));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function buildSnapshot() {
  const devices = store.listDevices();
  const alarms = store.listAlarms({ limit: 1000 });
  const probes = store.listProbes();

  const deviceById = new Map(devices.map((d) => [d.id, d]));
  const activeAlarms = alarms.filter((a) => a.status === 'active' || a.status === 'acknowledged');

  const severityCounts = {};
  for (const alarm of activeAlarms) {
    const severity = alarm.severity || 'Unknown';
    severityCounts[severity] = (severityCounts[severity] || 0) + 1;
  }
  const criticalAlarms = activeAlarms.filter(
    (a) => String(a.severity || '').toLowerCase() === 'critical'
  );

  const probeLatencies = probes
    .map((p) => p.latency_ms)
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)))
    .map(Number);
  const avgProbeLatencyMs = probeLatencies.length
    ? Math.round(probeLatencies.reduce((acc, v) => acc + v, 0) / probeLatencies.length)
    : null;

  const deviceMetrics = [];
  const devicesWithoutMetrics = [];
  for (const device of devices) {
    const metric = store.getLatestMetric(device.id);
    if (metric) {
      deviceMetrics.push({ device, metric });
    } else {
      devicesWithoutMetrics.push(device);
    }
  }
  const rankedByCpu = deviceMetrics
    .filter((entry) => entry.metric.cpu_pct !== null && entry.metric.cpu_pct !== undefined)
    .sort((a, b) => Number(b.metric.cpu_pct) - Number(a.metric.cpu_pct));

  return {
    devices,
    alarms,
    activeAlarms,
    probes,
    deviceById,
    severityCounts,
    criticalAlarms,
    avgProbeLatencyMs,
    deviceMetrics,
    devicesWithoutMetrics,
    rankedByCpu,
  };
}

function alarmLine(snap, alarm) {
  const device = snap.deviceById.get(alarm.device_id);
  const label = deviceLabel(device) || 'unknown device';
  return `alarm ${alarm.id} (${alarm.severity || 'Unknown'}), ${label}: ${alarm.message || 'no message recorded'}`;
}

function emptyResult() {
  return {
    status: 'success',
    answer: 'No data to analyze yet.',
    summary: 'No data to analyze yet.',
    confidence: null,
    recommendations: [],
    relatedDevices: [],
    timestamp: new Date().toISOString(),
  };
}

router.post(['/api/zia/query', '/api/zia/ask', '/zia/aiPromptExecutor'], (req, res) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || body.query || '';
    const p = String(prompt).toLowerCase();

    const snap = buildSnapshot();

    // Nothing stored at all: say so honestly.
    if (snap.devices.length === 0 && snap.alarms.length === 0 && snap.probes.length === 0) {
      return res.json(emptyResult());
    }

    let summary = '';
    let recommendations = [];
    let relatedDevices = [];

    if (p.includes('alarm') || p.includes('critical')) {
      const breakdown = Object.entries(snap.severityCounts)
        .map(([severity, count]) => `${count} ${severity}`)
        .join(', ');
      if (snap.activeAlarms.length === 0) {
        summary =
          'Data summary: no active alarms are stored. ' +
          `${snap.alarms.length} alarm(s) are stored in total, all cleared or acknowledged.`;
      } else {
        summary =
          `Data summary: ${snap.activeAlarms.length} active alarm(s) stored` +
          (breakdown ? ` (${breakdown})` : '') +
          `. ${snap.criticalAlarms.length} critical.`;
        if (snap.criticalAlarms.length > 0) {
          summary += ` Critical alarms: ${snap.criticalAlarms.map((a) => alarmLine(snap, a)).join('; ')}.`;
        }
      }
      relatedDevices = [
        ...new Set(
          snap.criticalAlarms
            .map((a) => deviceLabel(snap.deviceById.get(a.device_id)))
            .filter(Boolean)
        ),
      ];
      if (snap.criticalAlarms.length > 0) {
        recommendations = [
          `Review the ${snap.criticalAlarms.length} critical alarm(s) listed above.`,
        ];
      }
    } else if (p.includes('probe') || p.includes('latency')) {
      if (snap.probes.length === 0) {
        summary = 'Data summary: no probes are registered yet.';
      } else {
        const lines = snap.probes.map((probe) => {
          const latency =
            probe.latency_ms !== null && probe.latency_ms !== undefined
              ? `${probe.latency_ms} ms`
              : 'no latency recorded';
          const heartbeat = formatTs(probe.last_heartbeat_at);
          return `${probe.name || probe.ip || `probe ${probe.id}`}: status ${probe.status || 'unknown'}, latency ${latency}, last heartbeat ${heartbeat || 'not recorded'}`;
        });
        summary =
          `Data summary: ${snap.probes.length} probe(s) registered. ` +
          (snap.avgProbeLatencyMs !== null
            ? `Average recorded probe latency is ${snap.avgProbeLatencyMs} ms (from probes that have a recorded latency). `
            : 'No probe latency values are recorded. ') +
          lines.join('; ') +
          '.';
      }
    } else if (p.includes('cpu') || p.includes('memory') || p.includes('performance')) {
      if (snap.devices.length === 0) {
        summary = 'Data summary: no devices are registered yet.';
      } else if (snap.deviceMetrics.length === 0) {
        summary =
          `Data summary: ${snap.devices.length} device(s) registered, but no performance metrics are recorded yet for any of them.`;
      } else {
        const top = snap.rankedByCpu.slice(0, 3);
        if (top.length === 0) {
          summary =
            `Data summary: latest metrics are recorded for ${snap.deviceMetrics.length} device(s), but none of them include a CPU value.`;
        } else {
          const highest = top[0];
          summary =
            `Data summary: latest recorded metrics cover ${snap.deviceMetrics.length} device(s). ` +
            `Highest recorded CPU is ${deviceLabel(highest.device)} at ${highest.metric.cpu_pct}% CPU` +
            (highest.metric.mem_used_pct !== null && highest.metric.mem_used_pct !== undefined
              ? ` and ${highest.metric.mem_used_pct}% memory`
              : '') +
            `.` +
            (top.length > 1
              ? ` Next: ${top
                  .slice(1)
                  .map(
                    (entry) =>
                      `${deviceLabel(entry.device)} ${entry.metric.cpu_pct}% CPU`
                  )
                  .join(', ')}.`
              : '');
          if (snap.devicesWithoutMetrics.length > 0) {
            summary += ` ${snap.devicesWithoutMetrics.length} device(s) have no recorded metric yet.`;
          }
        }
        relatedDevices = top.map((entry) => deviceLabel(entry.device)).filter(Boolean);
      }
    } else if (p.includes('compliance') || p.includes('ccm') || p.includes('config')) {
      // No compliance engine, no stored baselines, and no backup scheduler
      // exist, so no compliance verdict can be given.
      summary =
        'Data summary: no compliance data is available. No compliance checks, configuration baselines, or scheduled configuration backups are stored.';
    } else {
      const breakdown = Object.entries(snap.severityCounts)
        .map(([severity, count]) => `${count} ${severity}`)
        .join(', ');
      const probeStatuses = {};
      for (const probe of snap.probes) {
        const status = probe.status || 'unknown';
        probeStatuses[status] = (probeStatuses[status] || 0) + 1;
      }
      const probeBreakdown = Object.entries(probeStatuses)
        .map(([status, count]) => `${count} ${status}`)
        .join(', ');
      summary =
        `Data summary: ${snap.devices.length} device(s), ` +
        `${snap.activeAlarms.length} active alarm(s)` +
        (breakdown ? ` (${breakdown})` : '') +
        `, ${snap.probes.length} probe(s)` +
        (probeBreakdown ? ` (${probeBreakdown})` : '') +
        '.';
      if (snap.rankedByCpu.length > 0) {
        const highest = snap.rankedByCpu[0];
        summary += ` Highest recorded CPU is ${deviceLabel(highest.device)} at ${highest.metric.cpu_pct}%.`;
        relatedDevices = [deviceLabel(highest.device)].filter(Boolean);
      }
      if (snap.criticalAlarms.length > 0) {
        summary += ` Critical alarms: ${snap.criticalAlarms.map((a) => alarmLine(snap, a)).join('; ')}.`;
        relatedDevices = [
          ...new Set([
            ...relatedDevices,
            ...snap.criticalAlarms
              .map((a) => deviceLabel(snap.deviceById.get(a.device_id)))
              .filter(Boolean),
          ]),
        ];
      }
      if (snap.deviceMetrics.length === 0 && snap.devices.length > 0) {
        summary += ' No performance metrics are recorded yet.';
      }
    }

    return res.json({
      status: 'success',
      answer: summary,
      summary,
      confidence: null,
      recommendations,
      relatedDevices,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      answer: 'Stored data could not be read.',
      summary: 'Stored data could not be read.',
      confidence: null,
      recommendations: [],
      relatedDevices: [],
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
