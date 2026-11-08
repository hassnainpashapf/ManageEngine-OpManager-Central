const express = require('express');
const router = express.Router();
const db = require('../services/db');

// ManageEngine Official Alarms endpoints: /alarm/listAlarms, /api/json/alarms/listAlarms
router.all(['/alarm/listAlarms', '/alarms/listAlarms', '/alarms/list', '/api/alarm/listAlarms', '/api/json/alarms/listAlarms', '/api/alarms'], (req, res) => {
  const { probeId, severity } = req.query;
  const alarms = db.getAlarms(probeId, severity);
  const devices = db.getDevices(probeId);
  
  const severityMap = {
    'critical': 1,
    'trouble': 2,
    'attention': 3,
    'servicedown': 4,
    'down': 4,
    'clear': 5
  };

  const rows = alarms.map((a, idx) => {
    const sevStr = a.severity || 'Critical';
    const sevNum = severityMap[sevStr.toLowerCase()] || 1;
    const devName = a.device || a.deviceName || 'Device';
    const devObj = devices.find(d => d.id === a.deviceId || d.name === devName);
    const devIp = a.ip || a.ipAddress || (devObj ? devObj.ip : '10.40.1.1');
    const prbName = a.probe || a.probeName || (devObj ? devObj.probeName : 'Central');

    return {
      id: a.id || (idx + 1),
      alarmId: a.id || (idx + 1),
      deviceId: a.deviceId || (devObj ? devObj.id : null),
      severity: sevStr,
      status: a.acknowledged ? 'Acknowledged' : 'Active',
      acknowledged: Boolean(a.acknowledged),
      statusNum: sevNum,
      statusStr: sevStr,
      displayname: devName,
      displayName: devName,
      deviceName: devName,
      device: devName,
      source: devName,
      entity: a.entity || devName,
      message: a.message || 'Alarm active',
      text: a.message || 'Alarm active',
      category: a.category || 'Threshold',
      prettyTime: a.lastOccurred || '1 min ago',
      time: a.lastOccurred || '1 min ago',
      timestamp: a.timestamp || Date.now(),
      modTime: a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      modTimeLong: a.timestamp || Date.now(),
      probeDisplayName: prbName,
      probeName: prbName,
      probe: prbName,
      probeId: a.probeId || 1,
      who: a.acknowledged ? (a.ackUser || a.acknowledgedBy || 'administrator') : 'Unacknowledged',
      lastNote: a.notes || '-',
      lastNoteAddedBy: a.acknowledged ? (a.ackUser || 'admin') : 'system',
      deviceType: a.category || 'Switch',
      ipAddress: devIp,
      ip: devIp,
      eventtype: 'Threshold_Exceeded',
      mute: false,
      alarmcode: 101
    };
  });

  const critCount = rows.filter(r => r.statusNum === 1).length;
  const trbCount = rows.filter(r => r.statusNum === 2).length;
  const attnCount = rows.filter(r => r.statusNum === 3).length;
  const srvDownCount = rows.filter(r => r.statusNum === 4).length;
  const clearCount = rows.filter(r => r.statusNum === 5).length;
  const ackCount = rows.filter(r => r.who !== 'Unacknowledged').length;
  const unackCount = rows.length - ackCount;

  res.json({
    page: 1,
    total: 1,
    records: rows.length,
    rows: rows,
    alarms: rows,
    result: rows,
    suppressionPercent: 0,
    severityVsCount: {
      Critical: critCount,
      Trouble: trbCount,
      Attention: attnCount,
      ServiceDown: srvDownCount,
      Clear: clearCount
    },
    Acknowledge: ackCount,
    UnAcknowledge: unackCount,
    acknowledgedUsers: ['admin', 'system']
  });
});

// Alarm Properties for details view: /alarm/alarmProperties
router.get(['/alarm/alarmProperties', '/api/alarm/alarmProperties'], (req, res) => {
  const alarmId = req.query.alarmId || req.query.id;
  const alarm = db.getAlarms().find(a => a.id === alarmId) || db.getAlarms()[0];
  if (!alarm) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  const devName = alarm.device || alarm.deviceName || 'Device';
  res.json({
    alarmId: alarm.id,
    deviceName: devName,
    severity: alarm.severity,
    message: alarm.message,
    source: devName,
    probeName: alarm.probe || alarm.probeName || 'Central',
    time: alarm.timestamp,
    snapShotType: 'MonitoringDevice',
    EVENTTYPE: 'Threshold_Exceeded'
  });
});

// Acknowledge alarm
router.post(['/alarm/acknowledgeAlarm', '/api/json/alarms/acknowledge', '/api/alarms/:id/acknowledge'], (req, res) => {
  const alarmId = req.body.alarmId || req.query.alarmId || req.params.id;
  const user = req.body.user || 'administrator';
  const acked = db.acknowledgeAlarm(alarmId, user);
  if (!acked) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} acknowledged by ${user}`,
    alarm: acked
  });
});

// Clear alarm
router.post(['/alarm/clearAlarm', '/api/json/alarms/clear', '/api/alarms/:id/clear'], (req, res) => {
  const alarmId = req.body.alarmId || req.query.alarmId || req.params.id;
  const cleared = db.clearAlarm(alarmId);
  if (!cleared) {
    return res.status(404).json({ status: 'error', message: 'Alarm not found' });
  }
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} cleared`,
    alarm: cleared
  });
});

// Delete alarm
router.post(['/alarm/deleteAlarm', '/api/json/alarms/delete', '/api/alarms/:id/delete'], (req, res) => {
  const alarmId = req.body.alarmId || req.query.alarmId || req.params.id;
  res.json({
    status: 'success',
    message: `Alarm ${alarmId} deleted from database`
  });
});

// Add Notes to Alarm
router.post(['/alarm/addNotes', '/api/json/alarms/addNotes'], (req, res) => {
  const { alarmId, notes, technician } = req.body;
  res.json({
    status: 'success',
    message: `Note added to alarm ${alarmId || 'selected'}: ${notes}`,
    technician: technician || 'administrator',
    addedAt: new Date().toISOString()
  });
});

// Alarms summary by severity and probe
router.get(['/alarm/summary', '/alarms/summary', '/api/json/alarms/summary', '/api/alarms/summary'], (req, res) => {
  const { probeId } = req.query;
  const alarms = db.getAlarms(probeId);
  const summary = {
    total: alarms.length,
    critical: alarms.filter(a => a.severity.toLowerCase() === 'critical').length,
    trouble: alarms.filter(a => a.severity.toLowerCase() === 'trouble').length,
    attention: alarms.filter(a => a.severity.toLowerCase() === 'attention').length,
    serviceDown: alarms.filter(a => a.severity.toLowerCase() === 'servicedown' || a.severity.toLowerCase() === 'down').length,
    clear: alarms.filter(a => a.severity.toLowerCase() === 'clear').length
  };
  res.json({
    status: 'success',
    summary
  });
});

// Authentic ManageEngine Reverse-Engineered ITOM Endpoints:
// 1. /alarm/getRCAData - Root Cause Analysis hypothesis & correlation tree
router.get(['/alarm/getRCAData', '/api/alarm/getRCAData'], (req, res) => {
  const alarmId = req.query.alarmId || req.query.id || 'alm-1';
  const alarm = db.getAlarms().find(a => a.id === alarmId) || db.getAlarms()[0];
  res.json({
    status: 'success',
    alarmId: alarm?.id || alarmId,
    confidenceScore: 0.982,
    confidencePercent: '98.2%',
    hypothesis: 'Resource exhaustion and high CPU contention triggered cascading transit latency across BGP upstream peer.',
    rootCauseEntity: alarm?.entity || 'GigabitEthernet0/1',
    device: alarm?.device || 'DXB-CORE-SW-01',
    correlatedEvents: [
      { time: '15:40:12 UTC', message: 'Interface packet drop threshold crossed (> 2.5%)', severity: 'Attention' },
      { time: '15:40:45 UTC', message: 'BGP neighbor 192.0.2.1 state reset (flapping)', severity: 'Trouble' },
      { time: '15:41:00 UTC', message: 'CPU utilization reached 92% on Routing Engine', severity: 'Critical' }
    ],
    remediationSteps: [
      'Verify BGP neighbor state: show ip bgp summary',
      `Clear interface counters on ${alarm?.entity || 'GigabitEthernet0/1'}`,
      'Apply rate-limiting policy map to suppress transit storm'
    ]
  });
});

// 2. /alarm/getRCANotes & /alarm/addRCANotes
let rcaNotesStore = [
  { noteId: 1, alarmId: 'alm-1', note: 'Investigated by NOC team. Verified BGP route convergence flap from ISP link.', author: 'admin', time: '10 mins ago' }
];

router.get(['/alarm/getRCANotes', '/api/alarm/getRCANotes'], (req, res) => {
  const alarmId = req.query.alarmId || req.query.id;
  const notes = alarmId ? rcaNotesStore.filter(n => n.alarmId === alarmId) : rcaNotesStore;
  res.json({
    status: 'success',
    notes: notes
  });
});

router.post(['/alarm/addRCANotes', '/api/alarm/addRCANotes'], (req, res) => {
  const { alarmId, note, author } = req.body;
  const newNote = {
    noteId: rcaNotesStore.length + 1,
    alarmId: alarmId || 'alm-1',
    note: note || 'RCA investigation note added.',
    author: author || 'administrator',
    time: 'Just now'
  };
  rcaNotesStore.unshift(newNote);
  res.json({
    status: 'success',
    message: 'RCA note persisted successfully',
    note: newNote
  });
});

// 3. /alarm/changeRCAStatus
router.post(['/alarm/changeRCAStatus', '/api/alarm/changeRCAStatus'], (req, res) => {
  const { alarmId, status } = req.body;
  res.json({
    status: 'success',
    message: `RCA status for ${alarmId} changed to ${status || 'Identified'}`,
    alarmId,
    status: status || 'Identified'
  });
});

// 4. /alarm/getSuppressionCount & Noise Reduction
router.get(['/alarm/getSuppressionCount', '/api/alarm/getSuppressionCount'], (req, res) => {
  res.json({
    status: 'success',
    suppressedCount: 116,
    totalRawEvents: 142,
    noiseReductionPercent: '82%',
    activeProblems: 7
  });
});

// 5. /alarm/getRCAIncidents & Root Cause Analysis
router.get(['/alarm/getRCAIncidents', '/api/alarm/getRCAIncidents'], (req, res) => {
  res.json({
    status: 'success',
    incidents: []
  });
});

// -------------------------------------------------------------
// SPECIALIZED NETWORK ALARMS (thirdLevelAlarmsTab.xml)
// -------------------------------------------------------------
// 1. NetFlow / Flow Analysis Alarms
router.get(['/api/alarms/nfa', '/alarm/nfa'], (req, res) => {
  res.json({
    status: 'success',
    module: 'NetFlow Analyzer',
    alarms: []
  });
});

// 2. NCM Configuration & Compliance Alarms
router.get(['/api/alarms/ncm', '/alarm/ncm'], (req, res) => {
  res.json({
    status: 'success',
    module: 'Network Configuration Manager',
    alarms: []
  });
});

// 3. Firewall Security & Policy Alarms
router.get(['/api/alarms/fwa', '/alarm/fwa'], (req, res) => {
  res.json({
    status: 'success',
    module: 'Firewall Analyzer',
    alarms: []
  });
});

// 4. OpUtils IPAM & Switch Port Mapper Alarms
router.get(['/api/alarms/oputils', '/alarm/oputils'], (req, res) => {
  res.json({
    status: 'success',
    module: 'OpUtils IPAM & SPM',
    alarms: []
  });
});

module.exports = router;
