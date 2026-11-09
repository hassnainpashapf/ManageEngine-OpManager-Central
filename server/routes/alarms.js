'use strict';
/**
 * Alarms routes — real-data rebuild.
 *
 * All alarm data comes from server/services/store.js (SQLite). No value is
 * invented at read time: a field the store does not have is returned as
 * null (or [] for lists), never as a plausible-looking default.
 *
 * Known gaps (no data source in the store, so these refuse honestly):
 *  - no suppression / raw-event log -> getSuppressionCount reports 0
 *    suppressions and counts active problems from stored alarms only
 *  - no NetFlow / NCM / firewall / OpUtils data source -> those endpoints
 *    return [] with a real count of 0
 *
 * Delete / notes / RCA status are backed by the store
 * (store.alarms.deleteAlarm / addNote / listNotes / setRcaStatus).
 *
 * Alarm RAISING lives in the poller (server/services/poller.js), which
 * evaluates thresholds and calls store.raiseAlarm(). This route only
 * serves and mutates stored alarms.
 */
const express = require('express');
const router = express.Router();
const store = require('../services/store');

// NOTE: the store exports flat functions (store.listAlarms, store.getDevice,
// store.getLatestMetric, ...) AND namespaced aliases (store.alarms.*,
// store.devices.*, ...). The delete / notes / RCA-status endpoints below use
// the namespaced form (store.alarms.deleteAlarm, .addNote, .listNotes,
// .setRcaStatus); the read paths keep the flat form they already used.

const SEVERITY_NUM = {
  critical: 1,
  trouble: 2,
  attention: 3,
  servicedown: 4,
  down: 4,
  clear: 5,
};

function severityNum(severity) {
  if (!severity) return null;
  return SEVERITY_NUM[String(severity).toLowerCase()] ?? null;
}

function deviceName(dev) {
  if (!dev) return null;
  return dev.hostname || dev.sys_name || null;
}

function isoOrNull(epochMs) {
  if (epochMs === null || epochMs === undefined) return null;
  const d = new Date(epochMs);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

// Note text from a request body. No caller in the repo pins the field name,
// so accept the obvious keys; an empty/missing note is a 400, never stored
// as an empty row.
function noteText(body) {
  const b = body || {};
  const v = b.note ?? b.notes ?? b.text ?? b.message ?? b.content ?? b.rcaNote;
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

// Note author: the authenticated user when one is set upstream, else null.
function authorOf(req) {
  return req.user && typeof req.user.username === 'string' && req.user.username
    ? req.user.username
    : null;
}

// Alarms raised by the poller carry severity/message/source/device_id/status
// (active | acknowledged | cleared) and created_at (epoch ms). Map one stored
// row to the wire shape, resolving the device from the store. Nothing is
// defaulted: absent data is null.
function toAlarmRow(a, devicesById) {
  const dev = a.device_id !== null && a.device_id !== undefined
    ? devicesById.get(a.device_id) || null
    : null;
  const name = deviceName(dev);
  const sevNum = severityNum(a.severity);
  return {
    id: a.id,
    alarmId: a.id,
    deviceId: a.device_id ?? null,
    severity: a.severity ?? null,
    status: a.status ?? null,
    acknowledged: a.status === 'acknowledged',
    statusNum: sevNum,
    statusStr: a.severity ?? null,
    displayname: name,
    displayName: name,
    deviceName: name,
    device: name,
    source: a.source ?? null,
    entity: a.source ?? null,
    message: a.message ?? null,
    text: a.message ?? null,
    category: null,
    prettyTime: isoOrNull(a.created_at),
    time: isoOrNull(a.created_at),
    timestamp: a.created_at ?? null,
    modTime: isoOrNull(a.created_at),
    modTimeLong: a.created_at ?? null,
    probeDisplayName: null,
    probeName: null,
    probe: null,
    probeId: dev ? (dev.probe_id ?? null) : null,
    who: a.ack_by ?? null,
    lastNote: null,
    lastNoteAddedBy: null,
    deviceType: dev ? (dev.category ?? null) : null,
    ipAddress: dev ? (dev.ip ?? null) : null,
    ip: dev ? (dev.ip ?? null) : null,
    eventtype: null,
    mute: null,
    ackAt: a.ack_at ?? null,
    clearedAt: a.cleared_at ?? null,
  };
}

function loadDevicesById() {
  const byId = new Map();
  for (const d of store.listDevices()) byId.set(d.id, d);
  return byId;
}

// ManageEngine Official Alarms endpoints: /alarm/listAlarms, /api/json/alarms/listAlarms
router.all(['/alarm/listAlarms', '/alarms/listAlarms', '/alarms/list', '/api/alarm/listAlarms', '/api/json/alarms/listAlarms', '/api/alarms'], (req, res) => {
  const { probeId, severity, status } = req.query;
  const filter = {};
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  let alarms = store.listAlarms(filter);
  const devicesById = loadDevicesById();

  // listAlarms has no probe filter; resolve it through the device table.
  if (probeId !== undefined && probeId !== '') {
    const probeNum = Number(probeId);
    const deviceIds = new Set(
      [...devicesById.values()]
        .filter((d) => d.probe_id === probeNum)
        .map((d) => d.id)
    );
    alarms = alarms.filter((a) => deviceIds.has(a.device_id));
  }

  const rows = alarms.map((a) => toAlarmRow(a, devicesById));

  // Real pagination over the filtered set (was hardcoded page: 1, total: 1).
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 200, 1), 1000);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const countByNum = (n) => pageRows.filter((r) => r.statusNum === n).length;
  const ackUsers = [...new Set(pageRows.map((r) => r.who).filter(Boolean))];
  const ackCount = pageRows.filter((r) => r.acknowledged).length;

  res.json({
    page,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
    records: pageRows.length,
    rows: pageRows,
    alarms: pageRows,
    result: pageRows,
    suppressionPercent: 0,
    severityVsCount: {
      Critical: countByNum(1),
      Trouble: countByNum(2),
      Attention: countByNum(3),
      ServiceDown: countByNum(4),
      Clear: countByNum(5),
    },
    Acknowledge: ackCount,
    UnAcknowledge: pageRows.length - ackCount,
    acknowledgedUsers: ackUsers,
  });
});

// Alarm Properties for details view: /alarm/alarmProperties
router.get(['/alarm/alarmProperties', '/api/alarm/alarmProperties'], (req, res) => {
  const alarmId = parseId(req.query.alarmId || req.query.id);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  const alarm = store.getAlarm(alarmId);
  // No fallback to the first alarm in the store: an unknown id is a 404.
  if (!alarm) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  const dev = alarm.device_id !== null && alarm.device_id !== undefined
    ? store.getDevice(alarm.device_id)
    : null;
  res.json({
    alarmId: alarm.id,
    deviceName: deviceName(dev),
    deviceId: alarm.device_id ?? null,
    severity: alarm.severity ?? null,
    message: alarm.message ?? null,
    source: alarm.source ?? null,
    probeName: null,
    probeId: dev ? (dev.probe_id ?? null) : null,
    time: alarm.created_at ?? null,
    status: alarm.status ?? null,
    acknowledgedBy: alarm.ack_by ?? null,
    acknowledgedAt: alarm.ack_at ?? null,
    clearedAt: alarm.cleared_at ?? null,
    snapShotType: null,
    EVENTTYPE: null,
    notes: null,
    rcaStatus: alarm.rca_status ?? null,
  });
});

// Acknowledge alarm
router.post(['/alarm/acknowledgeAlarm', '/api/json/alarms/acknowledge', '/alarms/acknowledge', '/api/alarms/:id/acknowledge'], (req, res) => {
  const alarmId = parseId(req.body.alarmId || req.body.id || req.query.alarmId || req.query.id || req.params.id);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  if (!store.getAlarm(alarmId)) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  const user = req.body.user || 'administrator';
  const acked = store.acknowledgeAlarm(alarmId, user);
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} acknowledged by ${user}`,
    alarm: acked,
  });
});

// Clear alarm
router.post(['/alarm/clearAlarm', '/api/json/alarms/clear', '/alarms/clear', '/api/alarms/:id/clear'], (req, res) => {
  const alarmId = parseId(req.body.alarmId || req.body.id || req.query.alarmId || req.query.id || req.params.id);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  if (!store.getAlarm(alarmId)) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  const cleared = store.clearAlarm(alarmId);
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} cleared`,
    alarm: cleared,
  });
});

// Delete alarm — backed by store.alarms.deleteAlarm. The store returns
// false when no alarm with that id exists, which is a 404 here.
router.post(['/alarm/deleteAlarm', '/api/json/alarms/delete', '/alarms/delete', '/api/alarms/:id/delete'], (req, res) => {
  const alarmId = parseId((req.body && (req.body.alarmId || req.body.id)) || req.query.alarmId || req.params.id);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  if (!store.alarms.deleteAlarm(alarmId)) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} deleted`,
    alarmId,
  });
});

// Add Notes to Alarm — backed by store.alarms.addNote, which returns null
// when the alarm does not exist.
router.post(['/alarm/addNotes', '/api/json/alarms/addNotes', '/alarms/addNotes'], (req, res) => {
  const alarmId = parseId((req.body && (req.body.alarmId || req.body.id)) || req.query.alarmId);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  const note = noteText(req.body);
  if (note === null) {
    return res.status(400).json({ status: 'error', message: 'note is required' });
  }
  const inserted = store.alarms.addNote(alarmId, authorOf(req), note);
  if (!inserted) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `Note added to alarm ${alarmId}`,
    alarmId,
    note: inserted,
  });
});

// Alarms summary by severity and probe
router.get(['/alarm/summary', '/alarms/summary', '/api/json/alarms/summary', '/api/alarms/summary'], (req, res) => {
  const { probeId } = req.query;
  let alarms = store.listAlarms();
  if (probeId !== undefined && probeId !== '') {
    const probeNum = Number(probeId);
    const deviceIds = new Set(
      store.listDevices().filter((d) => d.probe_id === probeNum).map((d) => d.id)
    );
    alarms = alarms.filter((a) => deviceIds.has(a.device_id));
  }
  const sev = (a) => (a.severity ? String(a.severity).toLowerCase() : '');
  const summary = {
    total: alarms.length,
    critical: alarms.filter((a) => sev(a) === 'critical').length,
    trouble: alarms.filter((a) => sev(a) === 'trouble').length,
    attention: alarms.filter((a) => sev(a) === 'attention').length,
    serviceDown: alarms.filter((a) => sev(a) === 'servicedown' || sev(a) === 'down').length,
    clear: alarms.filter((a) => sev(a) === 'clear').length,
  };
  res.json({
    status: 'success',
    summary,
  });
});

// Authentic ManageEngine Reverse-Engineered ITOM Endpoints:
// 1. /alarm/getRCAData - Root Cause Analysis hypothesis & correlation tree
//
// Built ONLY from real data: the alarm itself, its device, the device's
// latest real polled metric, and other real alarms on the same device.
// There is no canned story: no confidence is claimed (null), no hypothesis
// is stated unless real related alarms exist, and correlated events are
// real stored alarms only. With no related alarms and no metric, the
// result is honestly empty.
router.get(['/alarm/getRCAData', '/api/alarm/getRCAData'], (req, res) => {
  const alarmId = parseId(req.query.alarmId || req.query.id);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  const alarm = store.getAlarm(alarmId);
  if (!alarm) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  const dev = alarm.device_id !== null && alarm.device_id !== undefined
    ? store.getDevice(alarm.device_id)
    : null;
  const latestMetric = alarm.device_id !== null && alarm.device_id !== undefined
    ? store.getLatestMetric(alarm.device_id)
    : null;
  const related = alarm.device_id !== null && alarm.device_id !== undefined
    ? store.listAlarms({ device_id: alarm.device_id }).filter((a) => a.id !== alarm.id)
    : [];

  const correlatedEvents = related.map((a) => ({
    time: a.created_at ?? null,
    message: a.message ?? null,
    severity: a.severity ?? null,
    alarmId: a.id,
  }));

  res.json({
    status: 'success',
    alarmId: alarm.id,
    confidenceScore: null,
    confidencePercent: null,
    hypothesis: related.length > 0
      ? `${related.length} related alarm(s) recorded for device ${deviceName(dev) || alarm.device_id}.`
      : null,
    rootCauseEntity: alarm.source ?? null,
    device: deviceName(dev),
    deviceId: alarm.device_id ?? null,
    latestMetric: latestMetric
      ? {
          cpuPct: latestMetric.cpu_pct ?? null,
          memUsedPct: latestMetric.mem_used_pct ?? null,
          responseMs: latestMetric.response_ms ?? null,
          ts: latestMetric.ts ?? null,
        }
      : null,
    correlatedEvents,
    remediationSteps: [],
  });
});

// 2. /alarm/getRCANotes & /alarm/addRCANotes
// Notes are stored in the store's alarm_notes table. getRCANotes returns
// the stored notes for the alarm, in created_at order — [] when the alarm
// has no notes yet. addRCANotes persists via store.alarms.addNote.
router.get(['/alarm/getRCANotes', '/api/alarm/getRCANotes'], (req, res) => {
  const alarmId = parseId(req.query.alarmId || req.query.id);
  if (alarmId !== null && !store.getAlarm(alarmId)) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    notes: alarmId === null ? [] : store.alarms.listNotes(alarmId),
  });
});

router.post(['/alarm/addRCANotes', '/api/alarm/addRCANotes'], (req, res) => {
  const alarmId = parseId((req.body && (req.body.alarmId || req.body.id)) || req.query.alarmId);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  const note = noteText(req.body);
  if (note === null) {
    return res.status(400).json({ status: 'error', message: 'note is required' });
  }
  const inserted = store.alarms.addNote(alarmId, authorOf(req), note);
  if (!inserted) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `RCA note added to alarm ${alarmId}`,
    alarmId,
    note: inserted,
  });
});

// 3. /alarm/changeRCAStatus — persisted in the alarms.rca_status column
// via store.alarms.setRcaStatus, which returns null when the alarm does
// not exist. The requested status is stored as given; no status value is
// invented or defaulted here.
router.post(['/alarm/changeRCAStatus', '/api/alarm/changeRCAStatus'], (req, res) => {
  const alarmId = parseId((req.body && (req.body.alarmId || req.body.id)) || req.query.alarmId);
  if (alarmId === null) {
    return res.status(400).json({ status: 'error', message: 'alarmId is required' });
  }
  const b = req.body || {};
  const status = b.status ?? b.rcaStatus ?? b.rca_status;
  if (typeof status !== 'string' || status.trim().length === 0) {
    return res.status(400).json({ status: 'error', message: 'status is required' });
  }
  const updated = store.alarms.setRcaStatus(alarmId, status);
  if (!updated) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `RCA status for alarm ${alarmId} changed to ${status}`,
    alarm: updated,
  });
});

// 4. /alarm/getSuppressionCount & Noise Reduction
// No suppression rules and no raw-event log exist in the store, so the
// real suppressed count is 0. totalRawEvents and activeProblems are
// counted from the stored alarms.
router.get(['/alarm/getSuppressionCount', '/api/alarm/getSuppressionCount'], (req, res) => {
  const alarms = store.listAlarms();
  const activeProblems = alarms.filter(
    (a) => a.status === 'active' || a.status === 'acknowledged'
  ).length;
  res.json({
    status: 'success',
    suppressedCount: 0,
    totalRawEvents: alarms.length,
    noiseReductionPercent: alarms.length > 0 ? '0%' : null,
    activeProblems,
  });
});

// 5. /alarm/getRCAIncidents & Root Cause Analysis
// No incident model exists in the store. Incidents are derived honestly
// from real stored alarms, grouped by device: one incident per device
// with alarms, rooted at that device's earliest alarm. No alarms means
// no incidents.
router.get(['/alarm/getRCAIncidents', '/api/alarm/getRCAIncidents'], (req, res) => {
  const alarms = store.listAlarms();
  const devicesById = loadDevicesById();
  const byDevice = new Map();
  for (const a of alarms) {
    const key = a.device_id ?? null;
    if (!byDevice.has(key)) byDevice.set(key, []);
    byDevice.get(key).push(a);
  }
  const incidents = [...byDevice.entries()].map(([deviceId, group]) => {
    const sorted = [...group].sort((x, y) => (x.created_at || 0) - (y.created_at || 0));
    const root = sorted[0];
    const anyOpen = group.some((a) => a.status === 'active' || a.status === 'acknowledged');
    return {
      id: deviceId === null ? 'rca-unassigned' : `rca-device-${deviceId}`,
      deviceId,
      deviceName: deviceId === null ? null : deviceName(devicesById.get(deviceId)),
      rootCauseAlarmId: root.id,
      alarmIds: group.map((a) => a.id),
      alarmCount: group.length,
      startedAt: root.created_at ?? null,
      status: anyOpen ? 'open' : 'cleared',
    };
  });
  res.json({
    status: 'success',
    incidents,
  });
});

// -------------------------------------------------------------
// SPECIALIZED NETWORK ALARMS (thirdLevelAlarmsTab.xml)
// -------------------------------------------------------------
// There is no NetFlow, NCM, firewall or OpUtils/IPAM data source in the
// store, so these honestly report zero module alarms — never a fabricated
// list, and never a fake success for data that does not exist.
function moduleAlarms(moduleName) {
  return (req, res) => {
    res.json({
      status: 'success',
      module: moduleName,
      alarms: [],
      alarmCount: 0,
    });
  };
}

// 1. NetFlow / Flow Analysis Alarms
router.get(['/api/alarms/nfa', '/alarm/nfa'], moduleAlarms('NetFlow Analyzer'));

// 2. NCM Configuration & Compliance Alarms
router.get(['/api/alarms/ncm', '/alarm/ncm'], moduleAlarms('Network Configuration Manager'));

// 3. Firewall Security & Policy Alarms
router.get(['/api/alarms/fwa', '/alarm/fwa'], moduleAlarms('Firewall Analyzer'));

// 4. OpUtils IPAM & Switch Port Mapper Alarms
router.get(['/api/alarms/oputils', '/alarm/oputils'], moduleAlarms('OpUtils IPAM & SPM'));

module.exports = router;
