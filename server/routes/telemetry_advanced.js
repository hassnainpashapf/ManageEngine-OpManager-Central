'use strict';

const express = require('express');
const router = express.Router();
const store = require('../services/store');
const ping = require('../services/ping');
const snmp = require('../services/snmp');

const BGP_STATE_NAMES = {
  1: 'idle',
  2: 'connect',
  3: 'active',
  4: 'opensent',
  5: 'openconfirm',
  6: 'established',
};

function deviceName(d) {
  return d ? (d.hostname || d.sys_name || d.ip || `Node-${d.id}`) : 'Unknown';
}

function resolveTargetDevice(deviceId, fallbackCategoryPattern) {
  const devices = store.listDevices() || [];
  if (!devices.length) return { device: null, devices };
  if (deviceId !== undefined && deviceId !== null && String(deviceId).trim() !== '') {
    const found = devices.find(
      (d) => String(d.id) === String(deviceId) || String(d.ip) === String(deviceId) || deviceName(d) === String(deviceId)
    );
    if (found) return { device: found, devices };
  }
  if (fallbackCategoryPattern) {
    const match = devices.find((d) => fallbackCategoryPattern.test(`${d.category || ''} ${d.hostname || ''}`));
    if (match) return { device: match, devices };
  }
  return { device: devices[0], devices };
}

// ---------------------------------------------------------------------------
// 1. BGP-4 Live Telemetry (BGP4-MIB 1.3.6.1.2.1.15.3.1 + TCP 179 + ICMP)
// ---------------------------------------------------------------------------
async function handleBgpPoll(req, res) {
  const params = Object.assign({}, req.query || {}, req.body || {});
  const { device, devices } = resolveTargetDevice(params.deviceId || params.ip, /router|firewall|switch/i);
  const targetIp = (params.ip && String(params.ip).trim()) || (device && device.ip) || null;
  const community = (params.community && String(params.community).trim()) || (device && device.snmp_community) || 'public';

  if (!targetIp) {
    return res.json({ status: 'success', device: null, devices: [], peers: [], icmpRttMs: null, tcp179Ms: null, message: 'No devices in inventory.' });
  }

  const [icmpRes, tcpRes, asnRes, walkRes] = await Promise.allSettled([
    ping.pingMs(targetIp),
    ping.tcpConnectMs(targetIp, 179),
    snmp.snmpGet(targetIp, community, ['1.3.6.1.2.1.15.2.0'], { timeout: 1000, retries: 0 }),
    snmp.snmpWalk(targetIp, community, '1.3.6.1.2.1.15.3.1', { timeout: 1000, retries: 0 }),
  ]);

  const icmpRttMs = icmpRes.status === 'fulfilled' ? icmpRes.value : null;
  const tcp179Ms = tcpRes.status === 'fulfilled' ? tcpRes.value : null;

  let localAsn = null;
  const peersMap = new Map();
  let snmpError = null;

  if (asnRes.status === 'fulfilled' && asnRes.value && asnRes.value[0] && asnRes.value[0].value != null) {
    localAsn = Number(asnRes.value[0].value) || null;
  } else if (asnRes.status === 'rejected') {
    snmpError = asnRes.reason && asnRes.reason.message ? asnRes.reason.message : 'SNMP BGP4-MIB no response';
  }

  if (walkRes.status === 'fulfilled') {
    for (const vb of walkRes.value || []) {
      const m = String(vb.oid).match(/^1\.3\.6\.1\.2\.1\.15\.3\.1\.(\d+)\.(.+)$/);
      if (!m) continue;
      const col = Number(m[1]);
      const peerIp = m[2];
      if (!peersMap.has(peerIp)) {
        peersMap.set(peerIp, { peerIp, remoteAs: null, state: 'unknown', adminStatus: 'unknown', inUpdates: 0, outUpdates: 0, establishedSeconds: 0 });
      }
      const p = peersMap.get(peerIp);
      if (col === 2) p.state = BGP_STATE_NAMES[Number(vb.value)] || String(vb.value);
      if (col === 3) p.adminStatus = Number(vb.value) === 2 ? 'start' : 'stop';
      if (col === 9) p.remoteAs = Number(vb.value) || null;
      if (col === 10) p.inUpdates = Number(vb.value) || 0;
      if (col === 11) p.outUpdates = Number(vb.value) || 0;
      if (col === 16) p.establishedSeconds = Number(vb.value) || 0;
    }
    if (!snmpError && peersMap.size === 0) {
      snmpError = 'Device answered SNMPv2c but returned 0 rows in BGP4-MIB::bgpPeerTable (1.3.6.1.2.1.15.3.1).';
    }
  } else if (walkRes.status === 'rejected' && !snmpError) {
    snmpError = walkRes.reason && walkRes.reason.message ? walkRes.reason.message : 'SNMP walk failed';
  }

  const alarms = (store.listAlarms() || []).filter((a) => String(a.device_id) === String(device && device.id)).slice(0, 10);

  res.json({
    status: 'success',
    polledAt: new Date().toISOString(),
    device: device ? { id: device.id, name: deviceName(device), ip: targetIp, category: device.category, status: device.status } : { id: null, name: targetIp, ip: targetIp },
    devices: devices.map((d) => ({ id: d.id, name: deviceName(d), ip: d.ip, category: d.category })),
    icmpRttMs,
    tcp179Ms,
    bgpPort179Open: tcp179Ms !== null,
    localAsn,
    peers: Array.from(peersMap.values()),
    snmpError,
    alarmsCount: alarms.length,
  });
}

router.get('/api/advanced/bgp', handleBgpPoll);
router.post('/api/advanced/bgp/poll', handleBgpPoll);

// ---------------------------------------------------------------------------
// 2. SD-WAN & Live WAN Path SLA Probe (Real Multi-Ping RTT / Jitter / Loss)
// ---------------------------------------------------------------------------
async function measurePath(label, ip, role, capacityHint) {
  const samples = [];
  for (let i = 0; i < 3; i++) {
    const ms = await ping.pingMs(ip);
    samples.push(ms);
  }
  const ok = samples.filter((v) => v !== null);
  const lossPct = Math.round(((samples.length - ok.length) / samples.length) * 100);
  const avgMs = ok.length ? Number((ok.reduce((a, b) => a + b, 0) / ok.length).toFixed(2)) : null;
  const jitterMs = ok.length >= 2 ? Number((Math.max(...ok) - Math.min(...ok)).toFixed(2)) : (ok.length === 1 ? 0 : null);
  const reachable = ok.length > 0;
  return {
    label,
    ip,
    role,
    capacity: capacityHint,
    status: reachable ? (lossPct > 0 ? 'Degraded' : 'Active') : 'Unreachable',
    latencyMs: avgMs,
    jitterMs,
    lossPct,
    samples,
  };
}

async function handleSdwanProbe(req, res) {
  const devices = store.listDevices() || [];
  const gw = devices.find((d) => /switch|core/i.test(d.hostname || '')) || devices[0];
  const fw = devices.find((d) => /firewall|forti/i.test(`${d.category || ''} ${d.hostname || ''}`));
  const rtr = devices.find((d) => /router|rtr/i.test(`${d.category || ''} ${d.hostname || ''}`));

  const targets = [];
  if (gw) targets.push(['Primary LAN Core (' + deviceName(gw) + ')', gw.ip, 'LAN Core Gateway', '1 Gbps']);
  if (fw && (!gw || fw.ip !== gw.ip)) targets.push(['Perimeter Firewall (' + deviceName(fw) + ')', fw.ip, 'Security / WAN Edge', '1 Gbps']);
  if (rtr && (!gw || rtr.ip !== gw.ip)) targets.push(['Edge Router (' + deviceName(rtr) + ')', rtr.ip, 'WAN Edge', '1 Gbps']);
  targets.push(['Cloudflare Anycast WAN (1.1.1.1)', '1.1.1.1', 'Internet DIA Uplink', 'External Probe']);
  targets.push(['Google Public DNS WAN (8.8.8.8)', '8.8.8.8', 'Secondary Internet Uplink', 'External Probe']);

  const transports = await Promise.all(targets.map(([lbl, ip, role, cap]) => measurePath(lbl, ip, role, cap)));

  res.json({
    status: 'success',
    probedAt: new Date().toISOString(),
    transports,
  });
}

router.get('/api/advanced/sdwan', handleSdwanProbe);
router.post('/api/advanced/sdwan/probe', handleSdwanProbe);

// ---------------------------------------------------------------------------
// 3. DPI & Live Service / Interface Telemetry (IF-MIB + TCP Service Discovery)
// ---------------------------------------------------------------------------
const L7_PORTS = [
  { port: 22, app: 'SSH Device Management', proto: 'TCP/22', dscp: 'CS2 (16)', risk: 'Low' },
  { port: 53, app: 'DNS Resolver Service', proto: 'TCP/53', dscp: 'CS3 (24)', risk: 'Low' },
  { port: 80, app: 'HTTP Web Console', proto: 'TCP/80', dscp: 'AF21 (18)', risk: 'Medium' },
  { port: 443, app: 'HTTPS / TLS Encrypted', proto: 'TCP/443', dscp: 'AF31 (26)', risk: 'Low' },
  { port: 445, app: 'SMB File Sharing', proto: 'TCP/445', dscp: 'AF11 (10)', risk: 'Medium' },
  { port: 3389, app: 'RDP Remote Desktop', proto: 'TCP/3389', dscp: 'AF31 (26)', risk: 'Medium' },
  { port: 5432, app: 'PostgreSQL Database', proto: 'TCP/5432', dscp: 'AF21 (18)', risk: 'Low' },
  { port: 8006, app: 'Proxmox VE HTTPS API', proto: 'TCP/8006', dscp: 'CS2 (16)', risk: 'Low' },
  { port: 8060, app: 'OpManager Central Web', proto: 'TCP/8060', dscp: 'CS2 (16)', risk: 'Low' },
];

async function handleDpiProbe(req, res) {
  const params = Object.assign({}, req.query || {}, req.body || {});
  const { device, devices } = resolveTargetDevice(params.deviceId || params.ip, /firewall|switch|server/i);
  const targetIp = (params.ip && String(params.ip).trim()) || (device && device.ip) || null;
  const community = (device && device.snmp_community) || 'public';

  if (!targetIp) {
    return res.json({ status: 'success', device: null, devices: [], interfaces: [], services: [] });
  }

  const icmpRttMs = await ping.pingMs(targetIp);
  const serviceProbes = await Promise.all(
    L7_PORTS.map(async (svc) => {
      const ms = await ping.tcpConnectMs(targetIp, svc.port);
      return { ...svc, open: ms !== null, tcpMs: ms };
    })
  );

  let interfaces = device ? (store.listInterfaces(device.id) || []) : [];
  let snmpIfMessage = null;
  try {
    const liveIf = await snmp.getInterfaces(targetIp, community, { timeout: 1200, retries: 0 });
    if (Array.isArray(liveIf) && liveIf.length > 0) {
      interfaces = liveIf;
    } else {
      snmpIfMessage = 'SNMP IF-MIB returned 0 interfaces.';
    }
  } catch (e) {
    snmpIfMessage = e && e.message ? e.message : 'SNMP IF-MIB unavailable on host';
  }

  res.json({
    status: 'success',
    probedAt: new Date().toISOString(),
    device: device ? { id: device.id, name: deviceName(device), ip: targetIp, category: device.category, status: device.status } : { id: null, name: targetIp, ip: targetIp },
    devices: devices.map((d) => ({ id: d.id, name: deviceName(d), ip: d.ip, category: d.category })),
    icmpRttMs,
    services: serviceProbes,
    openServicesCount: serviceProbes.filter((s) => s.open).length,
    interfaces: interfaces.slice(0, 20),
    snmpIfMessage,
    nbarNote: 'Cisco NBAR2 / NetFlow v9 wire-speed L7 flow export is not enabled on standard LAN hosts; showing real TCP service discovery + SNMP IF-MIB counters.',
  });
}

router.get('/api/advanced/dpi', handleDpiProbe);
router.post('/api/advanced/dpi/probe', handleDpiProbe);

// ---------------------------------------------------------------------------
// 4. NDR & Live Security Audit (Real Alarms + Traps + Syslog + Port Scan)
// ---------------------------------------------------------------------------
const SECURITY_PORTS = [
  { port: 21, label: 'FTP Cleartext', severity: 'High', mitre: 'T1071.002' },
  { port: 23, label: 'Telnet Cleartext', severity: 'Critical', mitre: 'T1021' },
  { port: 22, label: 'SSH Remote Shell', severity: 'Info', mitre: 'T1021.004' },
  { port: 80, label: 'Unencrypted HTTP', severity: 'Medium', mitre: 'T1071.001' },
  { port: 443, label: 'HTTPS TLS', severity: 'Info', mitre: 'T1071.001' },
  { port: 445, label: 'SMB / CIFS', severity: 'Medium', mitre: 'T1021.002' },
  { port: 3389, label: 'Windows RDP', severity: 'High', mitre: 'T1021.001' },
  { port: 8006, label: 'Proxmox Admin UI', severity: 'Info', mitre: 'T1078' },
  { port: 8060, label: 'OpManager Central', severity: 'Info', mitre: 'T1078' },
];

function buildNdrSummary() {
  const devices = store.listDevices() || [];
  const alarms = store.listAlarms() || [];
  const traps = store.listTraps ? (store.listTraps(200) || []) : [];

  const downDevices = devices.filter((d) => String(d.status || '').toLowerCase() === 'down');
  const snmpErrorDevices = devices.filter((d) => /snmp/i.test(String(d.status || '')));
  const syslogCount = traps.filter((t) => !t.oid).length;
  const trapCount = traps.filter((t) => !!t.oid).length;

  const findings = [];
  for (const d of downDevices.slice(0, 15)) {
    findings.push({
      id: `down-${d.id}`,
      classification: 'Host Unreachable / Link Down',
      detail: `ICMP & SNMP probes timed out on ${deviceName(d)}`,
      sourceIp: d.ip,
      target: deviceName(d),
      tag: 'Availability Fault',
      severity: 'High',
      state: 'Active Alarm',
    });
  }
  for (const d of snmpErrorDevices.slice(0, 15)) {
    findings.push({
      id: `snmp-${d.id}`,
      classification: 'SNMP Authentication / Timeout Anomaly',
      detail: `ICMP reachable (${d.response_ms ?? '—'} ms) but SNMPv2c failed or timed out`,
      sourceIp: d.ip,
      target: deviceName(d),
      tag: 'Credential / ACL Check',
      severity: 'Medium',
      state: 'Investigate',
    });
  }
  for (const t of traps.slice(0, 10)) {
    findings.push({
      id: `trap-${t.id}`,
      classification: t.oid ? `SNMP Trap (${t.oid})` : 'Syslog Security/System Event',
      detail: String(t.value || '').slice(0, 120),
      sourceIp: t.source_ip || 'Unknown',
      target: 'Central Trap/Syslog Listener',
      tag: t.oid ? 'UDP/162' : 'UDP/514',
      severity: 'Info',
      state: 'Logged',
    });
  }

  return {
    devicesCount: devices.length,
    alarmsCount: alarms.length,
    downCount: downDevices.length,
    snmpErrorCount: snmpErrorDevices.length,
    trapCount,
    syslogCount,
    devices: devices.map((d) => ({ id: d.id, name: deviceName(d), ip: d.ip, category: d.category })),
    findings,
  };
}

router.get('/api/advanced/ndr', (req, res) => {
  res.json({
    status: 'success',
    generatedAt: new Date().toISOString(),
    ...buildNdrSummary(),
    portScan: null,
  });
});

router.post('/api/advanced/ndr/scan', async (req, res) => {
  const b = req.body || {};
  const { device } = resolveTargetDevice(b.deviceId || b.ip, null);
  const targetIp = (b.ip && String(b.ip).trim()) || (device && device.ip) || '192.168.30.65';
  const rttMs = await ping.pingMs(targetIp);
  const ports = await Promise.all(
    SECURITY_PORTS.map(async (p) => {
      const ms = await ping.tcpConnectMs(targetIp, p.port);
      return { ...p, open: ms !== null, tcpMs: ms };
    })
  );
  res.json({
    status: 'success',
    scannedAt: new Date().toISOString(),
    targetIp,
    targetName: device ? deviceName(device) : targetIp,
    icmpRttMs: rttMs,
    openPorts: ports.filter((p) => p.open),
    allPorts: ports,
    ...buildNdrSummary(),
  });
});

module.exports = router;
