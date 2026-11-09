const express = require('express');
const router = express.Router();
// NOTE: server/services/db.js was removed by the parallel datastore track
// and replaced by the SQLite store (services/store.js). This router follows
// the same convention as the other routes: store.listDevices() and
// store.listInterfaces(deviceId). Device rows carry hostname/sys_name/ip
// (no `name`, no inline `interfaces`).
const store = require('../services/store');
const { execFile } = require('node:child_process');
const { lookup } = require('node:dns/promises');
const { promisify } = require('node:util');
const net = require('node:net');
const fs = require('node:fs');
const run = promisify(execFile);

const sshclient = require('../services/sshclient');

// SNMP service (built by the parallel SNMP-engine track). Loaded lazily so
// this router still loads if the service file is not present yet; the SNMP
// endpoints then answer 502 instead of crashing the whole server.
let snmpService = null;
function loadSnmpService() {
  if (snmpService) return snmpService;
  try {
    snmpService = require('../services/snmp');
  } catch (e) {
    return null;
  }
  return snmpService;
}

// Helper to find valid system binaries across macOS, Debian, Ubuntu, and Alpine
function resolveBinary(candidates) {
  for (const bin of candidates) {
    try {
      if (fs.existsSync(bin)) return bin;
    } catch (e) {}
  }
  return candidates[candidates.length - 1]; // fallback to naked command
}

const PING_BIN = process.platform === 'darwin'
  ? resolveBinary(['/sbin/ping', '/usr/bin/ping', 'ping'])
  : resolveBinary(['/bin/ping', '/usr/bin/ping', 'ping']);

const TRACEROUTE_BIN = process.platform === 'darwin'
  ? resolveBinary(['/usr/sbin/traceroute', '/usr/bin/traceroute', 'traceroute'])
  : resolveBinary(['/usr/bin/traceroute', '/bin/traceroute', 'traceroute']);

// Real TCP Ping Fallback for environments lacking raw ICMP socket privileges (e.g. unprivileged Docker)
function tcpPing(address, port = 80, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const socket = new net.Socket();
    let responded = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      responded = true;
      const end = process.hrtime.bigint();
      const rtt = Number(end - start) / 1e6;
      socket.destroy();
      resolve({ success: true, rtt: Number(rtt.toFixed(2)) });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, rtt: null, reason: 'Timeout' });
    });

    socket.on('error', (err) => {
      // In TCP ping, ECONNREFUSED means host is online and actively rejected port
      const end = process.hrtime.bigint();
      const rtt = Number(end - start) / 1e6;
      socket.destroy();
      if (err.code === 'ECONNREFUSED' || err.code === 'ENETUNREACH') {
        resolve({ success: err.code === 'ECONNREFUSED', rtt: err.code === 'ECONNREFUSED' ? Number(rtt.toFixed(2)) : null, reason: err.code });
      } else {
        resolve({ success: false, rtt: null, reason: err.message });
      }
    });

    socket.connect(port, address);
  });
}

async function diagnose(req, res, operation) {
  const target = typeof req.body?.ip === 'string' ? req.body.ip.trim() : (typeof req.query?.ip === 'string' ? req.query.ip.trim() : '');
  if (!target || !/^[a-z\d][a-z\d.-]{0,252}$/i.test(target)) {
    return res.status(400).json({ status: 'error', message: 'Enter a valid IPv4 address or hostname.' });
  }

  let address;
  try {
    ({ address } = await lookup(target, { family: 4 }));
  } catch {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${target}' to an IPv4 address.` });
  }

  try {
    const result = await operation(address, target);
    res.json({
      status: 'success',
      target,
      resolvedIp: address,
      source: process.platform === 'darwin' ? 'darwin-host' : 'linux-cloud-instance',
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (err) {
    console.warn(`[Diagnostics] Tool execution error for ${target} (${address}):`, err.message);
    res.status(502).json({
      status: 'error',
      message: `Diagnostic execution failed: ${err.message}. Verify network reachability and privileges.`
    });
  }
}

// POST /api/tools/ping - Real Cross-Platform Ping
router.post(['/api/tools/ping', '/tools/ping'], (req, res) => {
  const count = Number(req.body?.count ?? 4);
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    return res.status(400).json({ status: 'error', message: 'Packet count must be between 1 and 10.' });
  }

  return diagnose(req, res, async (address, target) => {
    let output;
    const isDarwin = process.platform === 'darwin';
    const pingArgs = isDarwin
      ? ['-n', '-c', String(count), '-W', '1000', address]
      : ['-n', '-c', String(count), '-w', '4', address];

    try {
      const resRun = await run(PING_BIN, pingArgs, { timeout: 15000 });
      output = resRun.stdout;
    } catch (error) {
      if (error.stdout && error.stdout.includes('packets transmitted')) {
        output = error.stdout;
      } else {
        // Fallback: Real TCP Ping if ICMP sockets lack permission in unprivileged container
        const tcpResults = [];
        for (let i = 1; i <= count; i++) {
          const probe = await tcpPing(address, 80, 1500);
          tcpResults.push({
            seq: i,
            status: probe.success ? `64 bytes from ${address}: tcp_seq=${i} time=${probe.rtt} ms` : `Request timeout for tcp_seq ${i}`,
            rtt: probe.rtt || 0
          });
        }
        const received = tcpResults.filter(p => p.rtt > 0).length;
        const lossPercent = Math.round(((count - received) / count) * 100);
        const validRtts = tcpResults.filter(p => p.rtt > 0).map(p => p.rtt);
        const avgRtt = validRtts.length > 0 ? Number((validRtts.reduce((a, b) => a + b, 0) / validRtts.length).toFixed(2)) : null;

        output = `PING ${address} (${address}): 56 data bytes\n` +
          tcpResults.map(p => p.status).join('\n') +
          `\n--- ${address} ping statistics ---\n` +
          `${count} packets transmitted, ${received} packets received, ${lossPercent}% packet loss\n` +
          (avgRtt ? `round-trip min/avg/max = ${Math.min(...validRtts)}/${avgRtt}/${Math.max(...validRtts)} ms` : '');

        return {
          probe: 'Central Native Engine (TCP Synthetic)',
          transmitted: count,
          received,
          lossPercent,
          minRtt: validRtts.length > 0 ? Math.min(...validRtts) : null,
          avgRtt,
          maxRtt: validRtts.length > 0 ? Math.max(...validRtts) : null,
          packets: tcpResults,
          output
        };
      }
    }

    const stats = output.match(/(\d+) packets transmitted, (\d+) (?:packets )?received, ([\d.]+)% packet loss/);
    const timing = output.match(/= ([\d.]+)\/([\d.]+)\/([\d.]+)\//);
    const packets = Array.from(output.matchAll(/^.*icmp_seq=(\d+).*time[=<]([\d.]+) ms.*$/gm), match => ({
      seq: Number(match[1]),
      status: match[0],
      rtt: Number(match[2])
    }));

    return {
      probe: 'OpManager Central Host Engine',
      transmitted: stats ? Number(stats[1]) : count,
      received: stats ? Number(stats[2]) : (packets.length),
      lossPercent: stats ? Number(stats[3]) : (packets.length > 0 ? 0 : 100),
      minRtt: timing ? Number(timing[1]) : (packets[0]?.rtt || null),
      avgRtt: timing ? Number(timing[2]) : (packets[0]?.rtt || null),
      maxRtt: timing ? Number(timing[3]) : (packets[0]?.rtt || null),
      packets,
      output
    };
  });
});

// POST /api/tools/traceroute - Real Cross-Platform Traceroute
// Uses the real system traceroute (tracert on Windows) when available. When
// the binary cannot run or produces no usable output, the error is reported
// honestly (502 via diagnose) — no fabricated hops, no invented RTT, and
// destinationResponded is only true when a hop actually replies from the
// destination address.
router.post(['/api/tools/traceroute', '/tools/traceroute'], (req, res) => {
  return diagnose(req, res, async (address) => {
    const maxHops = 15;
    const isWindows = process.platform === 'win32';
    const bin = isWindows ? resolveBinary(['tracert']) : TRACEROUTE_BIN;
    const tracerouteArgs = isWindows
      ? ['-d', '-h', String(maxHops), '-w', '1000', address]
      : ['-n', '-m', String(maxHops), '-q', '1', '-w', '1', address];

    let output = '';
    try {
      const resRun = await run(bin, tracerouteArgs, { timeout: 20000 });
      output = resRun.stdout || '';
    } catch (err) {
      if (err.stdout && err.stdout.trim().length > 10) {
        output = err.stdout;
      } else {
        throw new Error(`traceroute failed: ${(err.message || 'no output').trim()} (binary: ${bin})`);
      }
    }

    let hops = [];
    if (isWindows) {
      // tracert: "  1    <1 ms    <1 ms    <1 ms  192.168.1.1" or "* * * Request timed out."
      hops = Array.from(
        output.matchAll(/^\s*(\d+)\s+((?:<\d+|\d+) ms|\*)\s+(?:(?:<\d+|\d+) ms|\*)\s+(?:(?:<\d+|\d+) ms|\*)\s+(\S+).*$/gm),
        (match) => {
          const last = match[3];
          const isIp = /^\d+(?:\.\d+){3}$/.test(last);
          return {
            hop: Number(match[1]),
            ip: isIp ? last : '*',
            hostname: isIp ? last : 'No reply',
            rtt1: match[2] === '*' ? '*' : `${match[2]}`,
            rtt2: '',
            rtt3: ''
          };
        }
      );
    } else {
      hops = Array.from(output.matchAll(/^\s*(\d+)\s+(?:(\d+(?:\.\d+){3})\s+([\d.]+ ms)|\*)/gm), match => ({
        hop: Number(match[1]),
        ip: match[2] || '*',
        hostname: match[2] || 'No reply',
        rtt1: match[3] || '*',
        rtt2: '',
        rtt3: ''
      }));
    }

    return {
      maxHops,
      hops,
      destinationResponded: hops.some(hop => hop.ip === address),
      output
    };
  });
});

// POST /api/tools/port-check - Real TCP Port Connectivity Tester
router.post(['/api/tools/port-check', '/tools/port-check'], async (req, res) => {
  const { host = '127.0.0.1', port = 80, timeout = 2500 } = req.body;
  const numPort = Number(port);

  if (!numPort || numPort < 1 || numPort > 65535) {
    return res.status(400).json({ status: 'error', message: 'Port must be between 1 and 65535' });
  }

  const result = await tcpPing(host, numPort, Number(timeout));
  res.json({
    status: 'success',
    host,
    port: numPort,
    isOpen: result.success,
    state: result.success ? 'OPEN' : 'CLOSED_OR_FILTERED',
    latencyMs: result.rtt,
    reason: result.reason || 'OK',
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------------------------------------
// MIB tree — served from the pre-built index at server/data/mibs/index.json
// via server/services/mibIndex.js (built by the MIB-index track from the
// real MIB files on disk). No parsing happens here and no OID catalogue is
// hardcoded: module names and OID definitions come from the index file.
// The index stores OIDs WITHOUT a leading dot; this router re-adds it so
// the response shape matches the previous parser output (".1.3.6.1...").
// The index carries no SYNTAX / MAX-ACCESS / DESCRIPTION data, so `type`,
// `access` and `desc` are null/empty here — never invented.
// ---------------------------------------------------------------------------
const mibIndex = require('../services/mibIndex');

const MIB_INDEX_SOURCE = 'server/data/mibs/index.json';

// Shape one indexed module ({ module, file, oids: [{ name, oid }] }) into
// the mib-tree response shape ({ name, file, oids: [{ oid, name, type,
// access, desc }] }). Entries with no resolved numeric OID (oid: null)
// are skipped, as the old parser skipped unresolvable OIDs.
function formatMibModule(mod) {
  const oids = mod.oids
    .filter((o) => o.oid)
    .map((o) => ({ oid: `.${o.oid}`, name: o.name, type: null, access: null, desc: '' }))
    .sort((a, b) => (a.oid < b.oid ? -1 : a.oid > b.oid ? 1 : 0));
  return { name: mod.module, file: mod.file, oids };
}

let mibTreeCache = null;

// Load the index and format it once (the index file is static at runtime).
// A missing/unreadable index is reported via `error` instead of throwing,
// the way the old parser reported an unreadable MIB directory in
// `parseErrors`, so the endpoint can still answer honestly.
function loadMibTree() {
  if (mibTreeCache) return mibTreeCache;
  try {
    const index = mibIndex.loadIndex();
    mibTreeCache = {
      modules: index.modules.map(formatMibModule),
      generatedAt: index.generatedAt || null,
      totalModules: index.totalModules,
      error: null
    };
  } catch (e) {
    mibTreeCache = { modules: [], generatedAt: null, totalModules: 0, error: e.message };
  }
  return mibTreeCache;
}

// Resolve a numeric OID to its MIB name via mibIndex.searchOid().
// searchOid() does prefix matching and returns EVERY match with its module
// attached (the same OID/name can exist in several vendor MIBs), so filter
// to exact OID matches only. If the exact matches disagree on the name,
// the OID is ambiguous and no name is returned — never pick one silently.
// Scalar instances carry a trailing .0 (e.g. sysDescr.0); the index holds
// the object OID without it, so retry without the .0.
function lookupMibOid(oid) {
  const clean = String(oid).replace(/^\./, '');
  const candidates = [clean];
  if (clean.endsWith('.0')) candidates.push(clean.slice(0, -2));
  for (const cand of candidates) {
    let matches;
    try {
      matches = mibIndex.searchOid(cand, undefined, 1000);
    } catch (e) {
      return null;
    }
    const exact = matches.filter((m) => m.oid === cand);
    if (!exact.length) continue;
    const names = [...new Set(exact.map((m) => m.name))];
    if (names.length !== 1) return null;
    return { oid: `.${cand}`, name: names[0], type: null, access: null, desc: null, module: exact[0].module };
  }
  return null;
}

// GET /api/tools/mib-tree - MIB tree from the pre-built index.
// Optional ?module=<name> returns only that module (404 if not found).
router.get('/api/tools/mib-tree', (req, res) => {
  const onlyModule = typeof req.query?.module === 'string' ? req.query.module.trim() : '';
  if (onlyModule) {
    let found = null;
    try {
      found = mibIndex.getModule(onlyModule);
    } catch (e) {
      return res.status(502).json({ status: 'error', message: `MIB index unavailable: ${e.message}` });
    }
    if (!found) {
      return res.status(404).json({ status: 'error', message: `MIB module '${onlyModule}' not found among the MIB files on disk.` });
    }
    const module = formatMibModule(found);
    const tree = loadMibTree();
    return res.json({ status: 'success', source: MIB_INDEX_SOURCE, modules: [module], totalOids: module.oids.length, parsedAt: tree.generatedAt });
  }
  const tree = loadMibTree();
  res.json({
    status: 'success',
    source: MIB_INDEX_SOURCE,
    modules: tree.modules,
    totalOids: tree.modules.reduce((n, m) => n + m.oids.length, 0),
    filesParsed: tree.totalModules,
    parseErrors: tree.error ? [tree.error] : [],
    parsedAt: tree.generatedAt
  });
});

// ---------------------------------------------------------------------------
// Real SNMP query / walk via server/services/snmp.js.
// ---------------------------------------------------------------------------
const SNMP_TYPE_NAMES = {
  1: 'BOOLEAN', 2: 'INTEGER', 3: 'BIT STRING', 4: 'OCTET STRING', 5: 'NULL',
  6: 'OBJECT IDENTIFIER', 64: 'IpAddress', 65: 'Counter32', 66: 'Gauge32',
  67: 'TimeTicks', 68: 'Opaque', 70: 'Counter64', 128: 'NoSuchObject',
  129: 'NoSuchInstance', 130: 'EndOfMibView'
};

// Normalise whatever shape the SNMP service returns (array of varbinds, or
// an oid->value map) into [{ oid, type, value, error }]. Never invents a
// value: a varbind the agent reports as an error stays an error.
function normalizeVarbinds(raw) {
  const list = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === 'object'
      ? Object.entries(raw).map(([oid, value]) => ({ oid, value }))
      : []);
  return list.map((vb) => {
    if (!vb || typeof vb !== 'object') return { oid: null, type: null, value: vb ?? null, error: null };
    let value = vb.value !== undefined ? vb.value : (vb.val !== undefined ? vb.val : null);
    if (Buffer.isBuffer(value)) value = value.toString('utf8');
    // The SNMP service already returns a typeName string; fall back to
    // mapping the numeric net-snmp ObjectType code.
    let type = null;
    if (typeof vb.typeName === 'string' && vb.typeName) type = vb.typeName;
    else if (typeof vb.type === 'number') type = SNMP_TYPE_NAMES[vb.type] || `TYPE_${vb.type}`;
    else if (typeof vb.type === 'string') type = vb.type;
    const err = vb.error || vb.errorStatus ||
      (typeof type === 'string' && (type === 'NoSuchObject' || type === 'NoSuchInstance' || type === 'EndOfMibView') ? type : null);
    return { oid: vb.oid ? String(vb.oid) : null, type, value, error: err || null };
  });
}

// Resolve the requested target: a managed-device hostname/sys_name from
// inventory maps to its stored IP; a bare IPv4 passes through; anything
// else is DNS-resolved.
function safeListDevices() {
  try {
    return store.listDevices() || [];
  } catch (e) {
    return [];
  }
}

async function resolveSnmpTarget(ip) {
  const requested = String(ip).trim();
  const dev = safeListDevices().find((d) => d.hostname === requested || d.sys_name === requested || d.ip === requested);
  if (dev && dev.ip) return { requested, address: dev.ip };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(requested)) return { requested, address: requested };
  try {
    const { address } = await lookup(requested, { family: 4 });
    return { requested, address };
  } catch (e) {
    return { requested, address: null };
  }
}

function snmpServiceUnavailable(res) {
  return res.status(502).json({
    status: 'error',
    error: 'snmp_unavailable',
    message: 'SNMP service is not available on this server (server/services/snmp.js could not be loaded).'
  });
}

// POST /api/tools/snmp-query - Real SNMP GET operation
router.post('/api/tools/snmp-query', async (req, res) => {
  const { ip, oid = '.1.3.6.1.2.1.1.1.0', community = 'public_monitor_ro', version = 'v2c' } = req.body || {};
  if (!ip || typeof ip !== 'string' || !ip.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target ip (or managed device name) is required.' });
  }
  const cleanOid = String(oid).trim().replace(/^\./, '');
  if (!/^(\d+\.)*\d+$/.test(cleanOid)) {
    return res.status(400).json({ status: 'error', message: `Invalid OID '${cleanOid}'. Expected a numeric dotted OID.` });
  }
  const ver = String(version || 'v2c').toLowerCase();
  if (ver !== 'v1' && ver !== 'v2c' && ver !== '2c') {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `SNMP ${version} is not supported by this endpoint: the SNMP service only carries community-based v1/v2c credentials, so no v3 authentication/privacy can be performed.`
    });
  }
  const snmp = loadSnmpService();
  if (!snmp || typeof snmp.snmpGet !== 'function') return snmpServiceUnavailable(res);

  const { requested, address } = await resolveSnmpTarget(ip);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  let varbinds;
  try {
    varbinds = await snmp.snmpGet(address, community, [cleanOid]);
  } catch (err) {
    return res.status(502).json({ status: 'error', message: `SNMP GET to ${address} failed: ${err.message}` });
  }
  const vb = normalizeVarbinds(varbinds)[0];
  if (!vb || !vb.oid) {
    return res.status(502).json({ status: 'error', message: `SNMP GET to ${address} returned no varbind for ${cleanOid}.` });
  }
  if (vb.error) {
    return res.status(502).json({ status: 'error', message: `SNMP error for ${cleanOid} on ${address}: ${vb.error}` });
  }

  const info = lookupMibOid(cleanOid);
  res.json({
    status: 'success',
    target: requested,
    resolvedIp: address,
    community: '******',
    version: ver,
    oid: cleanOid,
    name: info ? info.name : null,
    type: vb.type || (info ? info.type : null),
    description: info ? info.desc : null,
    value: vb.value,
    timestamp: new Date().toISOString()
  });
});

// POST /api/tools/snmp-walk - Real SNMP WALK operation (subtree traversal)
router.post('/api/tools/snmp-walk', async (req, res) => {
  const { ip, rootOid = '.1.3.6.1.2.1.1', community = 'public_monitor_ro', version = 'v2c' } = req.body || {};
  if (!ip || typeof ip !== 'string' || !ip.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target ip (or managed device name) is required.' });
  }
  const cleanRoot = String(rootOid).trim().replace(/^\./, '');
  if (!/^(\d+\.)*\d+$/.test(cleanRoot)) {
    return res.status(400).json({ status: 'error', message: `Invalid root OID '${cleanRoot}'. Expected a numeric dotted OID.` });
  }
  const ver = String(version || 'v2c').toLowerCase();
  if (ver !== 'v1' && ver !== 'v2c' && ver !== '2c') {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `SNMP ${version} is not supported by this endpoint: the SNMP service only carries community-based v1/v2c credentials, so no v3 authentication/privacy can be performed.`
    });
  }
  const snmp = loadSnmpService();
  if (!snmp || typeof snmp.snmpWalk !== 'function') return snmpServiceUnavailable(res);

  const { requested, address } = await resolveSnmpTarget(ip);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  let raw;
  try {
    raw = await snmp.snmpWalk(address, community, cleanRoot);
  } catch (err) {
    return res.status(502).json({ status: 'error', message: `SNMP walk of ${cleanRoot} on ${address} failed: ${err.message}` });
  }

  const results = normalizeVarbinds(raw)
    .filter((vb) => vb.oid && !vb.error)
    .map((vb) => {
      const info = lookupMibOid(vb.oid);
      return {
        oid: vb.oid,
        name: info ? info.name : null,
        type: vb.type || (info ? info.type : null),
        value: vb.value
      };
    });

  res.json({
    status: 'success',
    target: requested,
    resolvedIp: address,
    rootOid: cleanRoot,
    count: results.length,
    results,
    timestamp: new Date().toISOString()
  });
});

// Switch Port Mapper Endpoint (reads the real interface rows stored for
// the device; unknown fields are null, never invented).
router.get(['/api/tools/switch-ports', '/api/tools/spm'], (req, res) => {
  const { deviceId, ip } = req.query;
  const devices = safeListDevices();
  // An explicitly supplied deviceId/ip that matches no stored device is an
  // honest 404 — never silently answer with another device's ports. With no
  // id/ip supplied at all, fall back to the first device (same default as
  // diff.js / ncmclient.js / hardware.js).
  const explicit = (deviceId !== undefined && deviceId !== '') || (ip !== undefined && ip !== '');
  const dev = devices.find(d => String(d.id) === String(deviceId) || d.ip === ip || d.hostname === ip || d.sys_name === ip)
    || (explicit ? undefined : devices[0]);
  if (explicit && !dev) {
    return res.status(404).json({
      status: 'error',
      error: 'device not found',
      deviceId: deviceId ?? null,
      ip: ip ?? null
    });
  }
  if (!dev) {
    return res.json({
      status: 'success',
      device: 'No Managed Switch',
      ip: null,
      totalPorts: 0,
      activePorts: 0,
      ports: []
    });
  }

  let storedIfaces = [];
  try { storedIfaces = store.listInterfaces(dev.id) || []; } catch (e) { storedIfaces = []; }
  const deviceName = dev.sys_name || dev.hostname || dev.ip;
  const ports = storedIfaces.map((iface) => {
    const operUp = String(iface.oper_status || '').toLowerCase() === 'up';
    return {
      // Port label uses only real stored data: ifName, else ifDescr, else the
      // real ifIndex — never a synthesized Fa0/N-style name.
      port: iface.name || iface.descr || (iface.if_index !== undefined && iface.if_index !== null ? String(iface.if_index) : null),
      alias: iface.descr || null,
      adminStatus: operUp ? 'Up' : 'Down',
      operStatus: operUp ? 'Up' : 'Down',
      speed: iface.speed ?? null,
      vlan: iface.vlan ?? null,
      mac: iface.mac ?? null,
      ip: iface.ip || dev.ip,
      type: iface.type || null
    };
  });

  res.json({
    status: 'success',
    device: deviceName,
    ip: dev.ip,
    totalPorts: ports.length,
    activePorts: ports.filter(p => p.operStatus === 'Up').length,
    ports
  });
});

// ---------------------------------------------------------------------------
// Outside-scope canned endpoints (audit E1–E4). WMI/MAC resolution still have
// no real backend (no WMI/WinRM client, no ARP/MAC-table source) and answer
// an honest 501. Terminal/CLI execution now has a real SSH backend
// (services/sshclient.js) and runs exactly the command the logged-in
// operator supplied against the real host - nothing fabricated, and nothing
// automated beyond what was explicitly typed.
// ---------------------------------------------------------------------------

function sshCredentialOrError(res) {
  const cred = sshclient.findSshCredential(store);
  if (!cred || !cred.username || !cred.password) {
    res.status(400).json({
      status: 'error',
      message: 'No SSH/CLI credential with a username and password is configured in the Credential Library. Add one under Settings > Credentials first.'
    });
    return null;
  }
  return cred;
}

// Interactive Web CLI Terminal Command Executor - real SSH exec against the
// resolved host, using the Credential Library's SSH/CLI credential.
router.post('/api/tools/terminal-exec', async (req, res) => {
  const hostname = req.body?.hostname;
  const command = req.body?.command;
  if (!hostname || typeof hostname !== 'string' || !command || typeof command !== 'string') {
    return res.status(400).json({ status: 'error', message: 'hostname and command are both required.' });
  }

  const { requested, address } = await resolveSnmpTarget(hostname);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  const cred = sshCredentialOrError(res);
  if (!cred) return;

  try {
    const result = await sshclient.execCommand(address, cred, command);
    res.json({
      status: 'success',
      hostname: requested,
      resolvedIp: address,
      command,
      exitCode: result.exitCode,
      output: result.stdout,
      stderr: result.stderr || null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(502).json({
      status: 'error',
      message: `SSH command failed on ${requested} (${address}): ${err.message}`,
      hostname: requested,
      command
    });
  }
});

// WMI QUERY TOOL
router.post('/api/tools/wmi-query', (req, res) => {
  const { host = '127.0.0.1', namespace = 'root\\cimv2', query = 'SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor' } = req.body || {};
  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'WMI query is not implemented: no WMI/WinRM client exists on this server, so no query is executed against the host.',
    host,
    namespace,
    query,
    timestamp: new Date().toISOString()
  });
});

// CLI QUERY TOOL - real SSH exec, same backend as terminal-exec above.
router.post('/api/tools/cli-query', async (req, res) => {
  const host = req.body?.host || '127.0.0.1';
  const protocol = req.body?.protocol || 'SSHv2';
  const command = req.body?.command || 'show version';

  if (!/ssh/i.test(protocol)) {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `CLI query over ${protocol} is not implemented: only a real SSH backend exists on this server.`,
      host, protocol, command,
      timestamp: new Date().toISOString()
    });
  }

  const { requested, address } = await resolveSnmpTarget(host);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  const cred = sshCredentialOrError(res);
  if (!cred) return;

  try {
    const result = await sshclient.execCommand(address, cred, command);
    res.json({
      status: 'success',
      host: requested,
      resolvedIp: address,
      protocol: 'SSHv2',
      command,
      exitCode: result.exitCode,
      output: result.stdout,
      stderr: result.stderr || null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(502).json({
      status: 'error',
      message: `SSH command failed on ${requested} (${address}): ${err.message}`,
      host: requested,
      command
    });
  }
});

// ADDRESS RESOLVER & MAC TOOL
router.post('/api/tools/mac-resolve', (req, res) => {
  const { target = '127.0.0.1' } = req.body || {};
  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'MAC resolution is not implemented: no ARP table or SNMP ipNetToMediaTable source is wired to this endpoint, so no MAC/vendor/port is returned.',
    target,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
