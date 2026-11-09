const express = require('express');
const router = express.Router();
const store = require('../services/store');
const poller = require('../services/poller');
const { requireAuth, requireRole } = require('../services/session');

// ---------------------------------------------------------------------------
// Real-data rebuild (2026-11-09): every value on this route comes from the
// SQLite store, a real ICMP ping, a real SNMP GET, or the real poller.
// Unknown data is reported as null / [] / 'Unknown' — never invented.
// Audit items fixed: D1–D9 (see ~/workspace/opm-check/real-data/audit/
// poller-metrics.md). Live SNMP values that prove the poller path are in
// ~/workspace/opm-check/real-data/recon/techub-switches-snmp.md (all 8
// Techub Cisco switches + pfSense answer SNMPv2c community `public`).
//
// NOTE: ../services/snmp and ../services/ping are delivered by parallel
// workstreams. They are required lazily inside the handlers so this router
// still loads (and the server still boots) until they land; a handler that
// needs one returns an honest 503 instead of fake data when it is absent.
// ---------------------------------------------------------------------------

// Lazily load a parallel-workstream service module. Returns the module or
// null when it has not landed yet — never throws at router load time.
function loadService(name) {
  try {
    return require(`../services/${name}`);
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

function serviceUnavailable(res, name, endpoint) {
  return res.status(503).json({
    status: 'error',
    message: `${endpoint} requires the ${name} service (server/services/${name}.js), which is not available yet — no measurement was taken and no result was fabricated.`
  });
}

function findDevice(req) {
  const deviceId = req.query.deviceId || req.params.id || req.body.deviceId;
  if (deviceId === undefined || deviceId === null || deviceId === '') return { id: null, device: null };
  const device = store.getDevice(deviceId);
  return { id: deviceId, device: device || null };
}

function toIso(ms) {
  if (ms === null || ms === undefined) return null;
  const d = new Date(Number(ms));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function probeNameFor(device) {
  if (!device || device.probe_id === null || device.probe_id === undefined) return null;
  try {
    const probe = store.getProbe(device.probe_id);
    return probe ? probe.name || null : null;
  } catch (err) {
    return null;
  }
}

// Availability from the real metrics table.
// A metric row records one real poll attempt: response_ms non-null means the
// poll answered (up); a null response_ms means the poll attempt failed
// (down). Buckets with no recorded polls report null — absence of history
// is not evidence of 100% uptime.
function computeAvailability(deviceId, hours) {
  const windowHours = hours || 24;
  const since = Date.now() - windowHours * 3600 * 1000;
  const rows = store.getMetrics(deviceId, { since, limit: 10000 });
  const now = Date.now();
  const history = [];
  let totalUp = 0;
  let totalSamples = 0;
  for (let i = windowHours; i >= 0; i--) {
    const bucketStart = now - i * 3600 * 1000;
    const bucketEnd = bucketStart + 3600 * 1000;
    const samples = rows.filter((r) => r.ts >= bucketStart && r.ts < bucketEnd);
    const up = samples.filter((r) => r.response_ms !== null && r.response_ms !== undefined).length;
    const total = samples.length;
    totalUp += up;
    totalSamples += total;
    history.push({
      timestamp: new Date(bucketStart).toISOString(),
      availability: total === 0 ? null : Math.round((up / total) * 1000) / 10,
      downtimeMinutes: total === 0 ? null : Math.round(((total - up) / total) * 60 * 10) / 10,
      samples: total
    });
  }
  return {
    overallAvailability: totalSamples === 0 ? null : Math.round((totalUp / totalSamples) * 1000) / 10,
    history
  };
}

// OpManager Standard API: list devices with optional probe/category/status filters
router.get(['/device/listDevices', '/device/list', '/api/json/device/list', '/api/devices'], (req, res) => {
  const { probeId, category, status, search } = req.query;
  const filter = {};
  if (probeId !== undefined) filter.probe_id = probeId;
  if (category !== undefined) filter.category = category;
  if (status !== undefined) filter.status = status;
  let devices = store.listDevices(filter);

  if (search) {
    const q = String(search).toLowerCase();
    devices = devices.filter((d) =>
      (d.ip && d.ip.includes(q)) ||
      (d.hostname && d.hostname.toLowerCase().includes(q)) ||
      (d.sys_name && d.sys_name.toLowerCase().includes(q)) ||
      (d.vendor && d.vendor.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q))
    );
  }

  res.json({
    status: 'success',
    total: devices.length,
    devices
  });
});

// Device Summary / Details
// D8 fixed: no invented fallbacks — serial, OS version, disk and availability
// are null when unknown; CPU/memory/latency come from the stored device row
// (last real poll values, null until the first real poll).
router.get(['/device/getDeviceSummary', '/device/getDeviceDetails', '/api/json/device/getDeviceDetails', '/api/devices/:id'], (req, res) => {
  const { device } = findDevice(req);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }

  const deviceAlarms = store.listAlarms({ device_id: device.id, status: 'active' });
  const availability = computeAvailability(device.id, 24);

  res.json({
    status: 'success',
    device,
    deviceSummary: {
      name: device.hostname || device.sys_name || null,
      ipAddress: device.ip,
      category: device.category || null,
      type: device.model || null,
      model: device.model || null,
      vendor: device.vendor || null,
      sysDescr: device.sys_descr || null,
      sysName: device.sys_name || null,
      osVersion: null,
      serialNumber: null,
      status: device.status || null,
      availability: availability.overallAvailability,
      cpuUtilization: device.cpu_pct === null || device.cpu_pct === undefined ? null : device.cpu_pct,
      memoryUtilization: device.mem_used_pct === null || device.mem_used_pct === undefined ? null : device.mem_used_pct,
      diskUtilization: null,
      responseTime: device.response_ms === null || device.response_ms === undefined ? null : device.response_ms,
      lastPolled: toIso(device.last_polled_at),
      assignedProbe: probeNameFor(device),
      probeId: device.probe_id === null || device.probe_id === undefined ? null : device.probe_id,
      interfacesCount: store.listInterfaces(device.id).length,
      managed: device.managed === 1 || device.managed === true,
      // Template consumption: the applied template (canonical shape) and
      // the values the poller actually used on the last poll. The raw
      // stored columns are also on `device` (applied_template /
      // effective_thresholds / effective_poll_interval_sec).
      appliedTemplate: appliedTemplateOf(device),
      effectiveThresholds: effectiveThresholds(device),
      effectivePollIntervalSec: effectivePollIntervalSecOf(device)
    },
    activeAlarms: deviceAlarms
  });
});

// List Interfaces for a Device
// D7 fixed: returns ONLY interfaces actually discovered via SNMP and stored
// for this device. Empty array when none — never invented interfaces/traffic.
router.get(['/device/listInterfaces', '/api/json/device/listInterfaces', '/device/:id/interfaces', '/api/devices/:id/interfaces'], (req, res) => {
  const { device } = findDevice(req);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const rows = store.listInterfaces(device.id);
  const interfaces = rows.map((r) => ({
    ifIndex: r.if_index,
    name: r.name || null,
    descr: r.descr || null,
    admin: null,
    oper: r.oper_status || null,
    speed: r.speed === null || r.speed === undefined ? null : r.speed,
    inOctets: r.in_octets === null || r.in_octets === undefined ? null : r.in_octets,
    outOctets: r.out_octets === null || r.out_octets === undefined ? null : r.out_octets,
    // Traffic rates are computed from counter deltas over successive real
    // polls; no rate history exists yet, so these are null, not 0.
    inTraffic: null,
    outTraffic: null,
    inPercent: null,
    outPercent: null,
    errors: null
  }));
  res.json({
    status: 'success',
    deviceId: device.id,
    deviceName: device.hostname || device.sys_name || device.ip,
    total: interfaces.length,
    interfaces
  });
});

// Live Ping Response
// D1 fixed: performs REAL pings (4 echo attempts via the ping service) and
// returns the measured loss/RTTs and verbatim-style output. Nothing canned.
router.get(['/device/getPingResponse', '/api/json/device/getPingResponse'], async (req, res) => {
  const pingSvc = loadService('ping');
  if (!pingSvc) return serviceUnavailable(res, 'ping', 'getPingResponse');

  let ip = req.query.ip || null;
  if (!ip) {
    const { device } = findDevice(req);
    if (device) ip = device.ip;
  }
  if (!ip) {
    return res.status(400).json({ status: 'error', message: 'No IP supplied (ip query parameter or deviceId required)' });
  }

  const attempts = 4;
  const rtts = [];
  const lines = [];
  for (let i = 0; i < attempts; i++) {
    let ms = null;
    try {
      ms = await pingSvc.pingMs(ip);
    } catch (err) {
      ms = null;
    }
    if (ms === null || ms === undefined) {
      lines.push(`Request timed out.`);
    } else {
      rtts.push(Number(ms));
      lines.push(`Reply from ${ip}: bytes=32 time=${Number(ms)}ms`);
    }
  }
  const received = rtts.length;
  const lost = attempts - received;
  const packetLoss = `${Math.round((lost / attempts) * 100)}%`;
  const minRtt = received ? Math.min(...rtts) : null;
  const maxRtt = received ? Math.max(...rtts) : null;
  const avgRtt = received ? Math.round((rtts.reduce((a, b) => a + b, 0) / received) * 10) / 10 : null;

  const output = [
    ...lines,
    '',
    `Ping statistics for ${ip}:`,
    `    Packets: Sent = ${attempts}, Received = ${received}, Lost = ${lost} (${packetLoss} loss),`,
    received
      ? 'Approximate round trip times in milli-seconds:\n' +
        `    Minimum = ${minRtt}ms, Maximum = ${maxRtt}ms, Average = ${avgRtt}ms`
      : 'Approximate round trip times in milli-seconds:\n    Minimum = n/a, Maximum = n/a, Average = n/a (no replies received)'
  ].join('\n');

  res.json({
    status: received > 0 ? 'success' : 'error',
    ip,
    packetLoss,
    packetsTransmitted: attempts,
    packetsReceived: received,
    minRtt,
    avgRtt,
    maxRtt,
    ttl: null,
    output
  });
});

// Test Credentials
// D2 fixed: performs a REAL SNMP GET (sysDescr/sysName via snmp.getSystemInfo)
// against the target with the supplied community and reports SUCCESS only
// when the device actually answers. Latency is measured, not fixed.
router.post(['/device/testCredential', '/api/json/device/testCredential'], async (req, res) => {
  const snmp = loadService('snmp');
  if (!snmp) return serviceUnavailable(res, 'snmp', 'testCredential');

  const { ip: bodyIp, credentialType, community: bodyCommunity, username, deviceId } = req.body || {};
  let ip = bodyIp || null;
  let community = bodyCommunity || null;
  if ((!ip || !community) && deviceId) {
    const device = store.getDevice(deviceId);
    if (device) {
      if (!ip) ip = device.ip;
      if (!community) community = device.snmp_community || null;
    }
  }
  if (!ip) {
    return res.status(400).json({ status: 'error', message: 'No target IP supplied' });
  }
  if (!community) {
    return res.json({
      status: 'success',
      result: 'FAILURE',
      message: `SNMP credential validation failed for ${ip}: no community supplied and none stored for the device.`,
      latencyMs: null
    });
  }

  const started = Date.now();
  try {
    const info = await snmp.getSystemInfo(ip, community);
    const latencyMs = Date.now() - started;
    if (!info) {
      return res.json({
        status: 'success',
        result: 'FAILURE',
        message: `SNMP credential validation failed for ${ip}: no response using the supplied community.`,
        latencyMs
      });
    }
    return res.json({
      status: 'success',
      message: `SNMP credential validation passed for ${ip} (RFC 1213-MIB responded OK).`,
      result: 'SUCCESS',
      latencyMs,
      sysDescr: info.sysDescr ?? info.sys_descr ?? info.sysdesc ?? null,
      sysName: info.sysName ?? info.sys_name ?? info.sysname ?? null
    });
  } catch (err) {
    return res.json({
      status: 'success',
      result: 'FAILURE',
      message: `SNMP credential validation failed for ${ip}: ${err && err.message ? err.message : 'SNMP request failed'}.`,
      latencyMs: Date.now() - started
    });
  }
});

// Set Managed / Unmanaged
// D9 fixed: persists the managed flag on the device record via
// store.updateDevice and returns the stored state.
router.post(['/device/setManaged', '/api/json/device/setManaged'], (req, res) => {
  const { deviceId, managed } = req.body || {};
  if (deviceId === undefined || deviceId === null || deviceId === '') {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({ status: 'error', message: `Device ${deviceId} not found` });
  }
  const updated = store.updateDevice(deviceId, { managed: managed ? 1 : 0 });
  const isManaged = updated ? (updated.managed === 1 || updated.managed === true) : !!managed;
  res.json({
    status: 'success',
    message: `Management state updated for device ${deviceId}: ${isManaged ? 'Managed' : 'Unmanaged'}`,
    deviceId: updated ? updated.id : deviceId,
    managed: isManaged
  });
});

// Availability Graph Data
// D3 fixed: computed from the real metrics table (per-hour availability from
// real poll outcomes). Buckets with no recorded polls report null, not
// 100.0%; overallAvailability is null when there is no history at all.
router.get(['/device/getAvailabilityGraphData', '/api/json/device/getAvailabilityGraphData'], (req, res) => {
  const deviceId = req.query.deviceId || req.params.id;
  if (deviceId === undefined || deviceId === null || deviceId === '') {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({ status: 'error', message: `Device ${deviceId} not found` });
  }
  const { overallAvailability, history } = computeAvailability(device.id, 24);
  res.json({
    status: 'success',
    deviceId: device.id,
    overallAvailability,
    history
  });
});

// Performance Monitor Details
// D4 fixed: CPU/memory/latency come from the latest real metric row (or the
// device row's last real poll values); bandwidth is null with status
// 'Unknown' — no interface traffic-rate history exists yet, so no value is
// invented. Monitors with no data report 'Unknown', not 'Clear'.
router.get(['/device/getPerformanceMonitorDetails', '/api/json/device/getPerformanceMonitorDetails'], (req, res) => {
  const { device } = findDevice(req);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const latest = store.getLatestMetric(device.id);
  const cpu = latest && latest.cpu_pct !== null && latest.cpu_pct !== undefined
    ? latest.cpu_pct : device.cpu_pct;
  const memory = latest && latest.mem_used_pct !== null && latest.mem_used_pct !== undefined
    ? latest.mem_used_pct : device.mem_used_pct;
  const latency = latest && latest.response_ms !== null && latest.response_ms !== undefined
    ? latest.response_ms : device.response_ms;

  const statusFor = (value, threshold, criticalLabel) => {
    if (value === null || value === undefined) return 'Unknown';
    return value > threshold ? criticalLabel : 'Clear';
  };

  res.json({
    status: 'success',
    deviceId: device.id,
    deviceName: device.hostname || device.sys_name || device.ip,
    monitors: [
      { name: 'CPU Utilization', current: cpu === null || cpu === undefined ? null : cpu, unit: '%', threshold: 90, status: statusFor(cpu, 90, 'Critical') },
      { name: 'Memory Utilization', current: memory === null || memory === undefined ? null : memory, unit: '%', threshold: 85, status: statusFor(memory, 85, 'Trouble') },
      { name: 'Interface Inbound Bandwidth', current: null, unit: 'Mbps', threshold: null, status: 'Unknown' },
      { name: 'ICMP Latency', current: latency === null || latency === undefined ? null : latency, unit: 'ms', threshold: 50, status: statusFor(latency, 50, 'Trouble') }
    ]
  });
});

// Add Device
// Stores ONLY what was supplied (IP, name, category, probe, community) with
// metrics null until the first real poll — no random CPU/memory/disk, no
// placeholder MAC, no fixed interface traffic.
router.post(['/api/json/device/add', '/device/add', '/api/devices'], (req, res) => {
  const { ip, name, category, probeId, community, snmpCommunity, snmpVersion, version } = req.body || {};
  if (!ip) {
    return res.status(400).json({ status: 'error', message: 'Device IP is required' });
  }
  const existing = store.getDeviceByIp(ip);
  if (existing) {
    return res.status(409).json({ status: 'error', message: `Device with IP ${ip} already exists`, device: existing });
  }
  const fields = { ip };
  if (name !== undefined) fields.hostname = name;
  if (category !== undefined) fields.category = category;
  if (probeId !== undefined && probeId !== null && probeId !== '') fields.probe_id = probeId;
  const suppliedCommunity = community !== undefined ? community : snmpCommunity;
  if (suppliedCommunity !== undefined) fields.snmp_community = suppliedCommunity;
  const suppliedVersion = snmpVersion !== undefined ? snmpVersion : version;
  if (suppliedVersion !== undefined) fields.snmp_version = suppliedVersion;
  let newDevice;
  try {
    newDevice = store.createDevice(fields);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: `Could not add device: ${err && err.message ? err.message : 'store error'}` });
  }
  const probeName = probeNameFor(newDevice);
  res.status(201).json({
    status: 'success',
    message: `Device ${newDevice.hostname || newDevice.ip} (${newDevice.ip}) added${probeName ? ` and assigned to ${probeName}` : ''}`,
    device: newDevice
  });
});

// Delete Device
router.post(['/api/json/device/delete', '/api/devices/:id/delete'], (req, res) => {
  const deviceId = (req.body && req.body.deviceId) || req.params.id;
  if (deviceId === undefined || deviceId === null || deviceId === '') {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  store.deleteDevice(deviceId);
  res.json({
    status: 'success',
    message: `Device ${device.hostname || device.ip} removed from inventory`,
    deleted: device
  });
});

// Poll Device Immediately (Manual / Live SNMP Trigger)
// D5 fixed: delegates to the real poller (poller.pollDeviceNow) and returns
// its real result. No simulated fetch, no random RTT/CPU/memory.
router.post(['/api/json/device/pollNow', '/device/pollNow', '/api/devices/:id/poll-now'], async (req, res) => {
  const deviceId = (req.body && req.body.deviceId) || req.query.deviceId || req.params.id;
  const device = deviceId ? store.getDevice(deviceId) : null;
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  if (typeof poller.pollDeviceNow !== 'function') {
    return res.status(503).json({
      status: 'error',
      message: 'pollNow requires poller.pollDeviceNow (server/services/poller.js), which is not available yet — no poll was performed and no values were fabricated.'
    });
  }
  try {
    const result = await poller.pollDeviceNow(device.id);
    const refreshed = store.getDevice(device.id);
    // pollDeviceNow returns no `success` field: failure is signalled by
    // result.status (only 'Up' means the poll succeeded — 'Down',
    // 'SNMP Error', 'Poll failed: <reason>') and result.error. The old
    // check on result.success === false could never fire, so failed polls
    // were reported as successes.
    const pollFailed = !result || result.status !== 'Up';
    if (pollFailed) {
      const reason = (result && result.error) || (result && result.status) || 'poll failed';
      return res.status(502).json({
        status: 'error',
        message: `Poll of device ${device.hostname || device.ip} (${device.ip}) failed: ${reason}`,
        device: refreshed || device,
        poll: result === undefined ? null : result,
        polledAt: new Date().toISOString()
      });
    }
    res.json({
      status: 'success',
      message: (result && result.message) || `Device ${device.hostname || device.ip} (${device.ip}) polled successfully`,
      device: refreshed || device,
      poll: result === undefined ? null : result,
      polledAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(502).json({
      status: 'error',
      message: `Poll of device ${device.hostname || device.ip} (${device.ip}) failed: ${err && err.message ? err.message : 'poll error'}`,
      device: store.getDevice(device.id) || device,
      polledAt: new Date().toISOString()
    });
  }
});

// Test Active Monitors (Ping, SNMP, WMI, Ports)
// D6 fixed: every monitor runs a REAL check — ICMP via the ping service,
// sysDescr/CPU/memory/interfaces via real SNMP GETs — and reports
// Success/Failed/Unknown with measured RTTs and real returned values.
// Temperature has no real source in the SNMP service API, so it reports
// 'Unknown' with a null value instead of an invented 34°C.
router.get(['/api/json/device/testMonitors', '/api/devices/:id/test-monitors'], async (req, res) => {
  const { device } = findDevice(req);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const pingSvc = loadService('ping');
  if (!pingSvc) return serviceUnavailable(res, 'ping', 'testMonitors');
  const snmp = loadService('snmp');
  if (!snmp) return serviceUnavailable(res, 'snmp', 'testMonitors');

  const ip = device.ip;
  const community = (req.query && req.query.community) || device.snmp_community || null;
  const monitors = [];

  // ICMP Ping Echo — real ping.
  let pingMs = null;
  let pingError = null;
  try {
    pingMs = await pingSvc.pingMs(ip);
  } catch (err) {
    pingError = err && err.message ? err.message : 'ping failed';
  }
  const pingOk = pingMs !== null && pingMs !== undefined;
  monitors.push({
    name: 'ICMP Ping Echo',
    protocol: 'ICMP',
    status: pingOk ? 'Success' : 'Failed',
    roundTripMs: pingOk ? Number(pingMs) : null,
    packetLoss: pingOk ? '0%' : '100%',
    ...(pingOk ? {} : { error: pingError || 'No ICMP reply received' })
  });

  // SNMP monitors — real GETs; all fail honestly when no community is known.
  if (!community) {
    const noCommunity = 'No SNMP community supplied or stored for this device';
    monitors.push(
      { name: 'SNMP RFC1213-MIB sysDescr', protocol: 'SNMP v2c', status: 'Failed', roundTripMs: null, value: null, error: noCommunity },
      { name: 'HOST-RESOURCES-MIB hrProcessorLoad', protocol: 'SNMP v2c', status: 'Failed', roundTripMs: null, value: null, error: noCommunity },
      { name: 'HOST-RESOURCES-MIB hrStorageUsed', protocol: 'SNMP v2c', status: 'Failed', roundTripMs: null, value: null, error: noCommunity },
      { name: 'IF-MIB ifOperStatus', protocol: 'SNMP v2c', status: 'Failed', roundTripMs: null, value: null, error: noCommunity }
    );
  } else {
    // sysDescr — real SNMP GET.
    let sysInfo = null;
    let sysRtt = null;
    let sysError = null;
    try {
      const started = Date.now();
      sysInfo = await snmp.getSystemInfo(ip, community);
      sysRtt = Date.now() - started;
    } catch (err) {
      sysError = err && err.message ? err.message : 'SNMP request failed';
    }
    const sysDescr = sysInfo ? (sysInfo.sysDescr ?? sysInfo.sys_descr ?? sysInfo.sysdesc ?? null) : null;
    monitors.push({
      name: 'SNMP RFC1213-MIB sysDescr',
      protocol: 'SNMP v2c',
      status: sysInfo ? 'Success' : 'Failed',
      roundTripMs: sysInfo ? sysRtt : null,
      value: sysDescr,
      ...(sysInfo ? {} : { error: sysError || 'No SNMP response' })
    });

    // CPU + memory — one real SNMP GET serves both monitors.
    let cpuMem = null;
    let cpuMemRtt = null;
    let cpuMemError = null;
    try {
      const started = Date.now();
      cpuMem = await snmp.getCpuMem(ip, community);
      cpuMemRtt = Date.now() - started;
    } catch (err) {
      cpuMemError = err && err.message ? err.message : 'SNMP request failed';
    }
    const cpuPct = cpuMem ? (cpuMem.cpu ?? cpuMem.cpuPct ?? cpuMem.cpu_pct ?? null) : null;
    const memPct = cpuMem ? (cpuMem.memUsedPct ?? cpuMem.memory ?? cpuMem.mem_used_pct ?? cpuMem.memPct ?? null) : null;
    monitors.push({
      name: 'HOST-RESOURCES-MIB hrProcessorLoad',
      protocol: 'SNMP v2c',
      status: cpuMem && cpuPct !== null && cpuPct !== undefined ? 'Success' : 'Failed',
      roundTripMs: cpuMem ? cpuMemRtt : null,
      value: cpuPct === null || cpuPct === undefined ? null : `${cpuPct}%`,
      ...(cpuMem ? {} : { error: cpuMemError || 'No SNMP response' })
    });
    monitors.push({
      name: 'HOST-RESOURCES-MIB hrStorageUsed',
      protocol: 'SNMP v2c',
      status: cpuMem && memPct !== null && memPct !== undefined ? 'Success' : 'Failed',
      roundTripMs: cpuMem ? cpuMemRtt : null,
      value: memPct === null || memPct === undefined ? null : `${memPct}%`,
      ...(cpuMem ? {} : { error: cpuMemError || 'No SNMP response' })
    });

    // Interface operational status — real SNMP interface walk.
    let ifaces = null;
    let ifRtt = null;
    let ifError = null;
    try {
      const started = Date.now();
      ifaces = await snmp.getInterfaces(ip, community);
      ifRtt = Date.now() - started;
    } catch (err) {
      ifError = err && err.message ? err.message : 'SNMP request failed';
    }
    if (ifaces) {
      const up = ifaces.filter((i) => {
        const s = i.oper_status ?? i.operStatus ?? i.oper;
        return s === 'up' || s === 'UP' || s === 1 || s === '1';
      }).length;
      monitors.push({
        name: 'IF-MIB ifOperStatus',
        protocol: 'SNMP v2c',
        status: 'Success',
        roundTripMs: ifRtt,
        value: `${up} / ${ifaces.length} interfaces operational UP`
      });
    } else {
      monitors.push({
        name: 'IF-MIB ifOperStatus',
        protocol: 'SNMP v2c',
        status: 'Failed',
        roundTripMs: null,
        value: null,
        error: ifError || 'No SNMP response'
      });
    }
  }

  // Temperature — no real source in the SNMP service API (no envmon call),
  // so it is honestly Unknown rather than an invented 34°C.
  monitors.push({
    name: 'CISCO-ENVMON-MIB ciscoEnvMonTemperatureStatusValue',
    protocol: 'SNMP v2c',
    status: 'Unknown',
    roundTripMs: null,
    value: null,
    error: 'No temperature sensor reading available from the SNMP service'
  });

  res.json({
    status: 'success',
    device: device.hostname || device.sys_name || device.ip,
    ip: device.ip,
    monitors
  });
});

// Device categories summary
router.get('/api/json/device/categories', (req, res) => {
  const { probeId } = req.query;
  const filter = {};
  if (probeId !== undefined) filter.probe_id = probeId;
  const devices = store.listDevices(filter);
  const counts = {};
  devices.forEach((d) => {
    const key = d.category || 'Uncategorized';
    counts[key] = (counts[key] || 0) + 1;
  });
  res.json({
    status: 'success',
    categories: counts
  });
});

// -------------------------------------------------------------
// VIRTUALIZATION INVENTORY (OPM/Virtualization.xml -> /Inventory/List/Virtualization/*)
// -------------------------------------------------------------
const VIRTUAL_MACHINES = [];

router.get(['/api/inventory/virtualization', '/inventory/virtualization'], (req, res) => {
  const { type = 'all', probeId } = req.query;
  let list = VIRTUAL_MACHINES;
  if (type !== 'all') {
    list = list.filter(v => v.type === type.toLowerCase());
  }
  if (probeId) {
    list = list.filter(v => v.probeId == probeId);
  }

  res.json({
    status: 'success',
    total: list.length,
    vmsCount: list.length,
    vms: list,
    summary: {
      totalVMs: list.length,
      totalVCPUs: 0,
      totalMemoryTB: 0,
      hypervisors: {
        vmware: 0,
        proxmox: 0,
        nutanix: 0,
        containers: 0
      }
    }
  });
});

// -------------------------------------------------------------
// FIREWALL POLICY RULES INVENTORY (FWA/secondaryLevelMenuTab.xml -> /Inventory/List/LogMgmt/Rulemgmt)
// -------------------------------------------------------------
const FIREWALL_RULES = [];

router.get(['/api/inventory/firewall-rules', '/inventory/firewall-rules'], (req, res) => {
  res.json({
    status: 'success',
    totalRules: FIREWALL_RULES.length,
    rules: FIREWALL_RULES
  });
});

// -------------------------------------------------------------
// PER-DEVICE ALARM THRESHOLDS (admin only)
// The poller evaluates CPU/memory against these values; a device with
// no stored row uses the poller defaults (cpu_critical 90, cpu_trouble
// 80, mem_critical 90). Stored values are percentages: each must be a
// number > 0 and <= 100, and cpu_trouble must be below cpu_critical
// (checked against the merged effective values, so a partial update
// cannot create an inverted pair).
// -------------------------------------------------------------
const THRESHOLD_FIELDS = ['cpu_critical', 'cpu_trouble', 'mem_critical'];
const THRESHOLD_ALIASES = { cpuCritical: 'cpu_critical', cpuTrouble: 'cpu_trouble', memCritical: 'mem_critical' };

// Defaults live in the poller (single source of truth); fall back to the
// literal values only if the poller export is unavailable.
const THRESHOLD_DEFAULTS = (poller && poller.DEFAULT_THRESHOLDS)
  ? { cpu_critical: poller.DEFAULT_THRESHOLDS.cpuCritical, cpu_trouble: poller.DEFAULT_THRESHOLDS.cpuTrouble, mem_critical: poller.DEFAULT_THRESHOLDS.memCritical, mem_trouble: poller.DEFAULT_THRESHOLDS.memTrouble ?? null }
  : { cpu_critical: 90, cpu_trouble: 80, mem_critical: 90, mem_trouble: null };

function effectiveThresholds(deviceOrId) {
  const device = (deviceOrId && typeof deviceOrId === 'object')
    ? deviceOrId : store.getDevice(deviceOrId);
  const deviceId = device ? device.id : deviceOrId;
  if (poller && typeof poller.resolveDeviceThresholds === 'function') {
    // The device row is passed so an applied template's thresholds are
    // reflected here (template > stored overrides > defaults).
    const t = poller.resolveDeviceThresholds(store, deviceId, device || undefined);
    return { cpu_critical: t.cpuCritical, cpu_trouble: t.cpuTrouble, mem_critical: t.memCritical, mem_trouble: t.memTrouble ?? null };
  }
  const row = store.thresholds.getDeviceThresholds(deviceId) || {};
  return {
    cpu_critical: row.cpu_critical ?? THRESHOLD_DEFAULTS.cpu_critical,
    cpu_trouble: row.cpu_trouble ?? THRESHOLD_DEFAULTS.cpu_trouble,
    mem_critical: row.mem_critical ?? THRESHOLD_DEFAULTS.mem_critical,
    mem_trouble: THRESHOLD_DEFAULTS.mem_trouble,
  };
}

// The device's applied template in canonical shape, or null. The poller
// owns the parse (same function it uses for alarm evaluation), so the API
// and the poller can never disagree about what is applied.
function appliedTemplateOf(device) {
  if (!device || !poller || typeof poller.resolveAppliedTemplate !== 'function') return null;
  try {
    return poller.resolveAppliedTemplate(device);
  } catch {
    return null;
  }
}

function effectivePollIntervalSecOf(device) {
  if (!device || !poller || typeof poller.resolveEffectivePollIntervalSec !== 'function') return null;
  try {
    return poller.resolveEffectivePollIntervalSec(store, device);
  } catch {
    return null;
  }
}

// Validate a threshold request body. Accepts snake_case field names
// (cpu_critical, cpu_trouble, mem_critical) and camelCase aliases.
// Returns { values, errors }; values holds only the valid fields.
function parseThresholdInput(body) {
  const values = {};
  const errors = [];
  const input = (body && typeof body === 'object' && !Array.isArray(body)) ? body : {};
  for (const [key, raw] of Object.entries(input)) {
    const field = THRESHOLD_ALIASES[key] || key;
    if (!THRESHOLD_FIELDS.includes(field)) {
      errors.push(`unknown field '${key}' (expected one of: ${THRESHOLD_FIELDS.join(', ')})`);
      continue;
    }
    const num = typeof raw === 'number' ? raw
      : (typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN);
    if (!Number.isFinite(num)) {
      errors.push(`'${field}' must be a number (got ${JSON.stringify(raw)})`);
      continue;
    }
    if (num <= 0 || num > 100) {
      errors.push(`'${field}' must be > 0 and <= 100 (got ${num})`);
      continue;
    }
    values[field] = num;
  }
  return { values, errors };
}

function auditThresholdChange(req, device, action, detail) {
  try {
    const user = req.user && req.user.username ? req.user.username : null;
    store.audit.log(user, action, { deviceId: device.id, ip: device.ip, ...detail });
  } catch (err) {
    console.error(`[devices] threshold audit log failed: ${err.message}`);
  }
}

// GET /api/devices/:id/thresholds — effective thresholds for a device,
// plus whether they are customized or the poller defaults.
router.get('/api/devices/:id/thresholds', requireAuth, requireRole('admin'), (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const row = store.thresholds.getDeviceThresholds(device.id);
  const tpl = appliedTemplateOf(device);
  res.json({
    status: 'success',
    deviceId: device.id,
    customized: !!row,
    // Where the effective values come from: an applied template wins
    // over stored per-device overrides, which win over the defaults.
    source: tpl ? 'template' : (row ? 'device' : 'default'),
    appliedTemplate: tpl,
    effectivePollIntervalSec: effectivePollIntervalSecOf(device),
    thresholds: effectiveThresholds(device),
    custom: row ? {
      cpu_critical: row.cpu_critical ?? null,
      cpu_trouble: row.cpu_trouble ?? null,
      mem_critical: row.mem_critical ?? null,
    } : { cpu_critical: null, cpu_trouble: null, mem_critical: null },
    defaults: { ...THRESHOLD_DEFAULTS },
  });
});

// PUT /api/devices/:id/thresholds — set (partially or fully) a device's
// thresholds. Merges with any previously stored values.
router.put('/api/devices/:id/thresholds', requireAuth, requireRole('admin'), (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const { values, errors } = parseThresholdInput(req.body);
  if (errors.length) {
    return res.status(400).json({ status: 'error', message: errors.join('; ') });
  }
  if (!Object.keys(values).length) {
    return res.status(400).json({ status: 'error', message: 'No threshold fields supplied (cpu_critical, cpu_trouble, mem_critical)' });
  }
  // Ordering check against the merged effective values, so a partial
  // update (e.g. only cpu_trouble) cannot invert the pair.
  const merged = { ...effectiveThresholds(device), ...values };
  if (merged.cpu_trouble >= merged.cpu_critical) {
    return res.status(400).json({
      status: 'error',
      message: `cpu_trouble (${merged.cpu_trouble}) must be less than cpu_critical (${merged.cpu_critical})`,
    });
  }
  const saved = store.thresholds.setDeviceThresholds(device.id, values);
  auditThresholdChange(req, device, 'device.thresholds.update', { set: values });
  res.json({
    status: 'success',
    message: `Thresholds updated for device ${device.hostname || device.ip} (${device.ip})`,
    deviceId: device.id,
    customized: true,
    thresholds: effectiveThresholds(device),
    custom: {
      cpu_critical: saved.cpu_critical ?? null,
      cpu_trouble: saved.cpu_trouble ?? null,
      mem_critical: saved.mem_critical ?? null,
    },
    defaults: { ...THRESHOLD_DEFAULTS },
  });
});

// DELETE /api/devices/:id/thresholds — remove a device's custom
// thresholds; the poller defaults apply again from the next evaluation.
router.delete('/api/devices/:id/thresholds', requireAuth, requireRole('admin'), (req, res) => {
  const device = store.getDevice(req.params.id);
  if (!device) {
    return res.status(404).json({ status: 'error', message: 'Device not found' });
  }
  const removed = store.thresholds.deleteDeviceThresholds(device.id);
  auditThresholdChange(req, device, 'device.thresholds.reset', { removed: removed.deleted });
  res.json({
    status: 'success',
    message: removed.deleted
      ? `Custom thresholds removed for device ${device.hostname || device.ip} (${device.ip}); poller defaults apply`
      : `Device ${device.hostname || device.ip} (${device.ip}) had no custom thresholds; poller defaults already apply`,
    deviceId: device.id,
    customized: false,
    thresholds: effectiveThresholds(device),
    defaults: { ...THRESHOLD_DEFAULTS },
  });
});

module.exports = router;
