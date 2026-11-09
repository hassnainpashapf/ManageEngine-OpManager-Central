'use strict';
/**
 * OpManager Central — probes routes (real-data branch).
 *
 * Real-data rebuild of the probe registry. Every value returned here comes
 * from the SQLite store (server/services/store.js) or from a live check
 * performed at request time. There is no seed/demo probe: the store starts
 * empty and a probe only exists after it passes a real reachability check
 * and registers.
 *
 * Rules enforced here:
 *  - Probe status is derived from last_heartbeat_at: Online only when a
 *    heartbeat arrived within HEARTBEAT_STALE_MS (3 minutes); Stale when a
 *    heartbeat exists but is older; Offline when no heartbeat ever arrived.
 *  - Metrics (cpu/mem/disk/latency) are null until a real heartbeat or a
 *    real ping supplies them. Nothing is back-filled with constants.
 *  - Auth keys are generated with crypto.randomBytes, stored ONLY as a
 *    SHA-256 hash, and shown once at creation. The hash is never returned.
 *  - NFA/FWA collector status and the comms status reflect real probe state
 *    (live ping / heartbeat freshness); unknown when there is no data.
 *  - Sync endpoints do real work (ping the probe, reconcile device/alarm
 *    counts from the store, record a measured latency) and report what
 *    actually happened. A sync is never faked with a timestamp stamp.
 *
 * NOTE (store gaps, worked around here — see report):
 *  - server/services/ping.js does not exist, so pingMs / TCP probing are
 *    implemented locally in this file (ICMP via execFile + TCP fallback).
 *  - Probe deletion uses store.probes.deleteProbe (backed by the store).
 */

const express = require('express');
const crypto = require('node:crypto');
const net = require('node:net');
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const store = require('../services/store');

const router = express.Router();
const run = promisify(execFile);

// A probe is Online only if it heartbeated within the last 3 minutes.
const HEARTBEAT_STALE_MS = 3 * 60 * 1000;
// Default port a probe process listens on (used only for the TCP part of
// the reachability check at registration; not stored — no column for it).
const DEFAULT_PROBE_PORT = 8060;
const CHECK_TIMEOUT_MS = 2000;

// ------------------------------------------------------------------ ping ---

function resolveBinary(candidates) {
  for (const bin of candidates) {
    try {
      if (fs.existsSync(bin)) return bin;
    } catch (e) { /* ignore */ }
  }
  return candidates[candidates.length - 1];
}

const PING_BIN =
  process.platform === 'darwin'
    ? resolveBinary(['/sbin/ping', '/usr/bin/ping', 'ping'])
    : resolveBinary(['/bin/ping', '/usr/bin/ping', 'ping']);

function isValidHost(value) {
  return (
    typeof value === 'string' &&
    value.length >= 1 &&
    value.length <= 253 &&
    /^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(value) &&
    !value.includes('..')
  );
}

/**
 * One ICMP echo. Returns { ok, rttMs|null, reason|null }.
 * Uses execFile with an argv array (no shell), so the target cannot inject.
 */
async function icmpPing(ip, timeoutMs) {
  const secs = Math.max(1, Math.ceil(timeoutMs / 1000));
  const args =
    process.platform === 'darwin'
      ? ['-n', '-c', '1', '-W', String(timeoutMs), ip]
      : ['-n', '-c', '1', '-W', String(secs), ip];
  try {
    const { stdout } = await run(PING_BIN, args, { timeout: timeoutMs + 1000 });
    const m = String(stdout).match(/time[=<]([\d.]+)\s*ms/);
    if (m) return { ok: true, rttMs: Number(m[1]), reason: null };
    return { ok: false, rttMs: null, reason: 'no reply' };
  } catch (err) {
    const out = String((err && err.stdout) || '') + String((err && err.stderr) || '');
    const m = out.match(/time[=<]([\d.]+)\s*ms/);
    if (m) return { ok: true, rttMs: Number(m[1]), reason: null };
    if (/Operation not permitted/i.test(out)) {
      return { ok: false, rttMs: null, reason: 'icmp socket not permitted in this environment' };
    }
    return { ok: false, rttMs: null, reason: 'no reply' };
  }
}

/**
 * One TCP probe with an application-layer check. A bare TCP connect proves
 * nothing on networks with a SYN-accepting middlebox (this sandbox's
 * egress shim completes handshakes to arbitrary public IPs), so a
 * successful connect must be followed by a real reply:
 *  - data starting with "HTTP/" (a real HTTP service answered), or
 *  - ECONNREFUSED (the host's own kernel actively refused — proof the
 *    host is up and nothing listens on that port).
 * Anything else (timeout, close with no reply, non-HTTP reply) is NOT
 * proof of reachability. Returns { reachable, rttMs|null, method, reason }.
 */
function httpProbe(ip, port, timeoutMs) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const socket = new net.Socket();
    let done = false;
    let gotData = false;
    const rtt = () => Number(Number(process.hrtime.bigint() - start) / 1e6);
    const finish = (result) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => {
      socket.write(`GET / HTTP/1.0\r\nHost: ${ip}\r\n\r\n`);
    });
    socket.on('data', (chunk) => {
      gotData = true;
      const head = chunk.toString('utf8', 0, 16);
      if (/^HTTP\/\d/.test(head)) {
        finish({ reachable: true, rttMs: rtt(), method: `tcp:${port}+http`, reason: null });
      } else {
        finish({ reachable: false, rttMs: null, method: `tcp:${port}+http`, reason: 'non-HTTP reply' });
      }
    });
    socket.on('timeout', () => finish({ reachable: false, rttMs: null, method: `tcp:${port}+http`, reason: 'timeout' }));
    socket.on('close', () => {
      if (!gotData) {
        finish({ reachable: false, rttMs: null, method: `tcp:${port}+http`, reason: 'closed without reply' });
      }
    });
    socket.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        finish({ reachable: true, rttMs: rtt(), method: `tcp:${port} refused`, reason: 'connection refused (host up)' });
      } else {
        finish({ reachable: false, rttMs: null, method: `tcp:${port}+http`, reason: err.code || err.message });
      }
    });
    socket.connect(port, ip);
  });
}

/**
 * Reachability of an IP/host: ICMP first, then a TCP probe to port 80
 * that requires a real HTTP reply (or an active refusal). Returns
 * { reachable, rttMs|null, method, reason }.
 */
async function pingMs(ip, timeoutMs) {
  const timeout = timeoutMs || CHECK_TIMEOUT_MS;
  const icmp = await icmpPing(ip, timeout);
  if (icmp.ok) return { reachable: true, rttMs: icmp.rttMs, method: 'icmp', reason: null };
  const tcp = await httpProbe(ip, 80, timeout);
  if (tcp.reachable) return tcp;
  return { reachable: false, rttMs: null, method: `icmp+${tcp.method}`, reason: icmp.reason || tcp.reason };
}

/**
 * Registration-time verification: ICMP, else a real TCP probe to the
 * probe's own port (HTTP reply or active refusal required). Reachable
 * only if one of them proves the host is up.
 */
async function verifyProbe(ip, port) {
  const icmp = await icmpPing(ip, CHECK_TIMEOUT_MS);
  if (icmp.ok) return { reachable: true, rttMs: icmp.rttMs, method: 'icmp', reason: null };
  const tcp = await httpProbe(ip, port, CHECK_TIMEOUT_MS);
  if (tcp.reachable) return tcp;
  return { reachable: false, rttMs: null, method: `icmp+${tcp.method}`, reason: icmp.reason || tcp.reason };
}

// ------------------------------------------------------------- helpers ---

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function numOrUndefined(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseProbeId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Status derived from heartbeat freshness — never from a stored string. */
function deriveStatus(probe) {
  if (!probe || !probe.last_heartbeat_at) return 'Offline';
  return Date.now() - probe.last_heartbeat_at <= HEARTBEAT_STALE_MS ? 'Online' : 'Stale';
}

function isOnline(probe) {
  return deriveStatus(probe) === 'Online';
}

/**
 * Public probe view. The auth-key hash is never included. Metrics and
 * last_heartbeat_at are null until real data exists.
 */
function publicProbe(probe) {
  if (!probe) return null;
  return {
    id: probe.id,
    name: probe.name ?? null,
    ip: probe.ip,
    status: deriveStatus(probe),
    cpu_pct: probe.cpu_pct ?? null,
    mem_pct: probe.mem_pct ?? null,
    disk_pct: probe.disk_pct ?? null,
    latency_ms: probe.latency_ms ?? null,
    last_heartbeat_at: probe.last_heartbeat_at ?? null,
  };
}

function probeDevicesAndAlarms(probeId) {
  const devices = store.listDevices({ probe_id: probeId });
  const alarms = [];
  for (const d of devices) {
    alarms.push(...store.listAlarms({ device_id: d.id }));
  }
  return { devices, alarms };
}

// Delete remote probe — via store.probes.deleteProbe. The probe row is
// read first so the response can still name what was removed.
// (origin/main's DELETE /api/probes/:id verb is preserved here too: the
// route accepts POST or DELETE and passes other methods through to the
// GET details route below.)
router.all(['/api/json/enterprise/deleteProbe', '/api/probes/:id/delete', '/api/probes/:id'], (req, res, next) => {
  if (req.method !== 'POST' && req.method !== 'DELETE') return next();
  const probeId = parseProbeId((req.body && req.body.probeId) || req.params.id);
  if (probeId === null) {
    return res.status(400).json({ status: 'error', message: 'Invalid probe id' });
  }
  const probe = store.getProbe(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  let ok;
  try {
    ok = store.probes.deleteProbe(probeId);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `Failed to delete probe: ${err.message}` });
  }
  if (!ok) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  const deleted = { id: probe.id, name: probe.name, ip: probe.ip };
  res.json({
    status: 'success',
    message: `Probe ${deleted.name} removed from Central`,
    deleted,
  });
});

// -------------------------------------------------------------- listing ---

// Authentic ManageEngine OpManager Central Enterprise Probe List endpoint
router.get(['/enterprise/listProbes', '/api/json/enterprise/listProbes', '/api/enterprise/listProbes'], (req, res) => {
  const probes = store.listProbes();
  res.json(
    probes.map((p) => ({
      PROBEID: p.id,
      NAME: p.name ?? null,
      DISPLAYNAME: p.name ?? null,
      STATUS: isOnline(p),
    }))
  );
});

// Authentic ManageEngine Admin Get All Probes endpoint
router.get(['/admin/getAllProbes', '/api/admin/getAllProbes', '/api/json/admin/getAllProbes'], (req, res) => {
  const probes = store.listProbes();
  const probeMap = {};
  probes.forEach((p) => {
    probeMap[p.id] = p.name ?? null;
  });
  res.json(probeMap);
});

// NFA collector info: collStatus reflects real probe state — 'up' only for
// a probe with a fresh heartbeat, 'down' for a stale one, 'unknown' when
// the probe has never heartbeated. Never hardcoded 'up'.
router.get(['/nfaee/getAllCollInfo', '/api/nfaee/getAllCollInfo'], (req, res) => {
  const probes = store.listProbes();
  res.json(
    probes.map((p) => ({
      id: p.id,
      name: p.name ?? null,
      collStatus: !p.last_heartbeat_at ? 'unknown' : isOnline(p) ? 'up' : 'down',
    }))
  );
});

// FWA collector details: STATUS is true only for a probe with a fresh
// heartbeat, false for a stale one, null when it never heartbeated.
// selColId is the first Online probe, or null when there is none.
router.get(['/fwaenterprise/getCollectorDetails', '/api/fwaenterprise/getCollectorDetails'], (req, res) => {
  const probes = store.listProbes();
  const firstOnline = probes.find((p) => isOnline(p));
  res.json({
    selColId: firstOnline ? firstOnline.id : null,
    colList: probes.map((p) => ({
      CID: p.id,
      NAME: p.name ?? null,
      STATUS: !p.last_heartbeat_at ? null : isOnline(p),
    })),
  });
});

// Probe communication status: actually pings every registered probe and
// reports per-probe results. 'connected' only when at least one probe
// exists and every probe answered; 'unknown' when no probes are
// registered; otherwise 'degraded'/'disconnected'. Never "all verified"
// by default.
router.get(['/nfaee/getDECommunicationStatus', '/api/nfaee/getDECommunicationStatus'], async (req, res) => {
  const probes = store.listProbes();
  if (probes.length === 0) {
    return res.json({
      status: 'unknown',
      details: 'No probes registered; nothing to verify',
      probes: [],
    });
  }
  const results = [];
  for (const p of probes) {
    const check = await pingMs(p.ip);
    results.push({
      probeId: p.id,
      name: p.name ?? null,
      ip: p.ip,
      reachable: check.reachable,
      rttMs: check.rttMs,
      method: check.method,
      reason: check.reason,
      heartbeatStatus: deriveStatus(p),
    });
  }
  const reachableCount = results.filter((r) => r.reachable).length;
  const status =
    reachableCount === results.length
      ? 'connected'
      : reachableCount === 0
        ? 'disconnected'
        : 'degraded';
  res.json({
    status,
    details:
      reachableCount === results.length
        ? `All ${results.length} probe communication channel(s) verified by live ping`
        : `${reachableCount} of ${results.length} probe(s) reachable by live ping`,
    probes: results,
  });
});

// OpManager Central EE Standard API: /api/json/admin/listProbes
router.get(['/admin/listProbes', '/api/json/admin/listProbes', '/api/probes'], (req, res) => {
  const probes = store.listProbes();
  const views = probes.map(publicProbe);
  res.json({
    status: 'success',
    responseCode: 200,
    totalProbes: probes.length,
    activeProbes: probes.filter(isOnline).length,
    result: views,
    probes: views,
  });
});

// Get specific probe details. Devices/alarms are only those actually
// attributed to this probe in the store (devices with probe_id set by a
// real discovery/poll); empty lists when the probe reported nothing.
router.get(['/enterprise/getProbeDetails', '/api/json/enterprise/getProbeDetails', '/api/probes/:id'], (req, res) => {
  const probeId = parseProbeId(req.query.probeId || req.params.id);
  if (probeId === null) {
    return res.status(400).json({ status: 'error', message: 'Invalid probe id' });
  }
  const probe = store.getProbe(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  const { devices, alarms } = probeDevicesAndAlarms(probe.id);
  res.json({
    status: 'success',
    probe: publicProbe(probe),
    devices,
    alarms,
  });
});

// Add new remote probe. The probe is VERIFIED before it is accepted: an
// ICMP ping and, failing that, a real TCP probe to its port (an HTTP reply
// or an active refusal — a bare connect is not proof on proxied networks)
// must prove the host is up, otherwise nothing is registered (502). The
// auth key is a fresh random value; only its SHA-256 hash is stored, and
// the key itself is shown exactly once in this response.
router.post(['/api/json/enterprise/addProbe', '/api/probes'], async (req, res) => {
  const { name, ip } = req.body || {};
  const portRaw = req.body && req.body.port !== undefined ? Number(req.body.port) : DEFAULT_PROBE_PORT;
  const port = Number.isInteger(portRaw) && portRaw >= 1 && portRaw <= 65535 ? portRaw : DEFAULT_PROBE_PORT;
  if (!name || !ip) {
    return res.status(400).json({ status: 'error', message: 'Probe name and IP are required' });
  }
  if (!isValidHost(String(ip))) {
    return res.status(400).json({ status: 'error', message: `Invalid probe IP/hostname: ${ip}` });
  }
  const existing = store.getProbeByIp(String(ip));
  if (existing) {
    return res
      .status(409)
      .json({ status: 'error', message: `A probe is already registered for IP ${ip} (id ${existing.id})` });
  }
  const check = await verifyProbe(String(ip), port);
  if (!check.reachable) {
    return res.status(502).json({
      status: 'error',
      message: `Probe at ${ip} is not reachable (${check.method}: ${check.reason || 'no response'}); nothing was registered`,
      reachable: false,
      method: check.method,
      reason: check.reason,
    });
  }
  const authKey = crypto.randomBytes(32).toString('hex');
  const created = store.createProbe({
    name: String(name),
    ip: String(ip),
    auth_key_hash: sha256Hex(authKey),
    status: 'Pending',
  });
  // Record the measured latency from the verification check.
  const saved = store.updateProbe(created.id, { latency_ms: check.rttMs });
  res.status(201).json({
    status: 'success',
    message: `Probe ${saved.name} verified reachable (${check.method}, ${check.rttMs} ms) and registered to Central`,
    probe: publicProbe(saved),
    authKey,
    authKeyNote: 'Store this key on the probe now — it is shown only once and cannot be recovered from Central.',
    verified: { reachable: true, rttMs: check.rttMs, method: check.method },
  });
});

// Probe heartbeat: a registered probe proves possession of its auth key
// (SHA-256 compared against the stored hash) and reports its real
// metrics. Only numeric metrics sent by the probe are stored; anything
// missing stays null. Updates last_heartbeat_at, which is what drives
// the Online/Stale/Offline status.
router.post(['/api/probes/:id/heartbeat', '/api/json/enterprise/probeHeartbeat'], async (req, res) => {
  const probeId = parseProbeId(req.params.id || (req.body && req.body.probeId));
  if (probeId === null) {
    return res.status(400).json({ status: 'error', message: 'Invalid probe id' });
  }
  const probe = store.getProbe(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  const presented =
    (req.body && (req.body.authKey || req.body.auth_key)) || req.headers['x-probe-auth-key'];
  if (!presented) {
    return res.status(401).json({ status: 'error', message: 'Missing probe auth key' });
  }
  if (!probe.auth_key_hash) {
    return res.status(401).json({ status: 'error', message: 'Probe has no registered auth key' });
  }
  const presentedHash = Buffer.from(sha256Hex(presented), 'utf8');
  const storedHash = Buffer.from(String(probe.auth_key_hash), 'utf8');
  const valid =
    presentedHash.length === storedHash.length && crypto.timingSafeEqual(presentedHash, storedHash);
  if (!valid) {
    return res.status(401).json({ status: 'error', message: 'Invalid probe auth key' });
  }
  const metrics = {
    cpu_pct: numOrUndefined(req.body && (req.body.cpu_pct !== undefined ? req.body.cpu_pct : req.body.cpu)),
    mem_pct: numOrUndefined(req.body && (req.body.mem_pct !== undefined ? req.body.mem_pct : req.body.memory)),
    disk_pct: numOrUndefined(req.body && (req.body.disk_pct !== undefined ? req.body.disk_pct : req.body.disk)),
    latency_ms: numOrUndefined(req.body && req.body.latency_ms),
  };
  const updated = store.heartbeatProbe(probe.id, metrics);
  res.json({
    status: 'success',
    message: `Heartbeat accepted for probe ${updated.name}`,
    probe: publicProbe(updated),
  });
});

// Force sync probe data to Central. Real work: ping the probe, count the
// devices/alarms actually attributed to it in the store, and record the
// measured latency. If the probe is unreachable and its heartbeat is not
// fresh, the sync FAILS (502) and nothing is stamped as synced.
router.post(['/api/json/enterprise/syncDataFromProbe', '/api/probes/:id/sync'], async (req, res) => {
  const probeId = parseProbeId((req.body && req.body.probeId) || req.params.id);
  if (probeId === null) {
    return res.status(400).json({ status: 'error', message: 'Invalid probe id' });
  }
  const probe = store.getProbe(probeId);
  if (!probe) {
    return res.status(404).json({ status: 'error', message: `Probe ${probeId} not found` });
  }
  const check = await pingMs(probe.ip);
  const { devices, alarms } = probeDevicesAndAlarms(probe.id);
  const activeAlarms = alarms.filter((a) => a.status === 'active').length;
  const heartbeatStatus = deriveStatus(probe);
  if (!check.reachable && heartbeatStatus !== 'Online') {
    return res.status(502).json({
      status: 'error',
      message: `Probe ${probe.name} sync failed: unreachable (${check.method}: ${check.reason || 'no response'}) and heartbeat is ${heartbeatStatus}`,
      probeId: probe.id,
      reachable: false,
      method: check.method,
      reason: check.reason,
      heartbeatStatus,
      lastHeartbeatAt: probe.last_heartbeat_at ?? null,
      deviceCount: devices.length,
      activeAlarmCount: activeAlarms,
    });
  }
  let updated = probe;
  if (check.reachable && check.rttMs !== null) {
    updated = store.updateProbe(probe.id, { latency_ms: check.rttMs });
  }
  res.json({
    status: 'success',
    message: `Probe ${updated.name} sync completed: ${devices.length} device(s), ${activeAlarms} active alarm(s) reconciled from the store`,
    probeId: updated.id,
    reachable: check.reachable,
    latencyMs: check.rttMs,
    method: check.method,
    heartbeatStatus,
    lastHeartbeatAt: updated.last_heartbeat_at ?? null,
    deviceCount: devices.length,
    activeAlarmCount: activeAlarms,
    timestamp: new Date().toISOString(),
  });
});

// Sync all probes at once. Each probe is pinged and reconciled
// individually; the response reports per-probe outcomes, never a blanket
// "all synchronized".
router.post(['/api/json/enterprise/syncAllProbes', '/api/probes/sync-all'], async (req, res) => {
  const probes = store.listProbes();
  const results = [];
  for (const probe of probes) {
    const check = await pingMs(probe.ip);
    const { devices, alarms } = probeDevicesAndAlarms(probe.id);
    const activeAlarms = alarms.filter((a) => a.status === 'active').length;
    const heartbeatStatus = deriveStatus(probe);
    const ok = check.reachable || heartbeatStatus === 'Online';
    if (check.reachable && check.rttMs !== null) {
      store.updateProbe(probe.id, { latency_ms: check.rttMs });
    }
    results.push({
      probeId: probe.id,
      name: probe.name ?? null,
      synced: ok,
      reachable: check.reachable,
      latencyMs: check.rttMs,
      method: check.method,
      reason: ok ? null : check.reason,
      heartbeatStatus,
      deviceCount: devices.length,
      activeAlarmCount: activeAlarms,
    });
  }
  const synced = results.filter((r) => r.synced).length;
  res.json({
    status: synced === results.length ? 'success' : 'partial',
    message: `${synced} of ${results.length} Enterprise Probe(s) synchronized; ${results.length - synced} failed`,
    totalProbes: results.length,
    synced,
    failed: results.length - synced,
    results,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
