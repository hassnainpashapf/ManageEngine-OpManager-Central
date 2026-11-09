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

// --- SNMPv3 credentials ----------------------------------------------------
// A v3 request may carry its credentials as a nested `v3` object
// ({ user, authProtocol, authPass, privProtocol, privPass }) or as
// top-level fields of the same names. Returns the credential object, or
// null when the body carries no v3 credential at all. The returned object
// may hold real passphrases: it is passed only to the SNMP service, and
// is NEVER logged or echoed in a response (see describeSnmpV3).
function extractV3Input(body) {
  const b = body || {};
  if (b.v3 && typeof b.v3 === 'object' && !Array.isArray(b.v3)) return b.v3;
  const top = {};
  let any = false;
  for (const k of ['user', 'authProtocol', 'authPass', 'privProtocol', 'privPass']) {
    if (b[k] !== undefined && b[k] !== null) { top[k] = b[k]; any = true; }
  }
  return any ? top : null;
}

// Stored v3 credentials for a managed device (matched by hostname /
// sys_name / IP), for v3 requests that supply no credentials of their
// own. Returns the raw credential object or null. Server-side only.
function storedV3For(requested) {
  const dev = safeListDevices().find((d) => d.hostname === requested || d.sys_name === requested || d.ip === requested);
  if (!dev) return null;
  const stored = store.snmpFromRow ? store.snmpFromRow(dev) : null;
  return stored && stored.v3 && stored.v3.user ? stored.v3 : null;
}

// Resolve v3 credentials for a request: body first, stored device
// credentials second. Returns { creds } (validated, normalised by the
// canonical validateV3) or { error } (a 400 message). `snmp` is the
// loaded SNMP service.
function resolveV3Creds(snmp, body, requested) {
  let input = extractV3Input(body);
  if (!input) input = storedV3For(requested);
  if (!input) {
    return { error: 'SNMPv3 credentials are required: supply v3 { user, authProtocol, authPass, privProtocol, privPass } in the request body, or target a managed device with stored v3 credentials.' };
  }
  try {
    return { creds: snmp.validateV3(input) };
  } catch (err) {
    return { error: (err && err.message) || String(err) };
  }
}

// Normalise the requested SNMP version. Only 'v2c' (alias '2c') and 'v3'
// are served: v1 is rejected (the poller/service never speak v1 — the
// old endpoint accepted it and silently polled as v2c), the '3' alias is
// dropped, and anything else is a 400. Returns { version } or { error }.
function resolveSnmpVersion(version) {
  const ver = String(version || 'v2c').trim().toLowerCase();
  if (ver === 'v2c' || ver === '2c') return { version: 'v2c' };
  if (ver === 'v3') return { version: 'v3' };
  if (ver === 'v1') {
    return { error: "SNMPv1 is not supported by this endpoint (supported: 'v2c', 'v3')." };
  }
  return { error: `Invalid SNMP version '${version}'. Expected 'v2c' or 'v3'.` };
}

// Optional UDP port from the request body (default 161). Returns
// { port } (null when absent) or { error } on an out-of-range value.
function resolveSnmpPort(body) {
  const raw = (body || {}).port;
  if (raw === undefined || raw === null || raw === '') return { port: null };
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { error: `Invalid SNMP port '${raw}': expected an integer 1-65535.` };
  }
  return { port };
}

// The ONE 501 message in this file: the v3 branches below answer 501
// only when the loaded SNMP service has no v3 implementation at all.
const SNMPV3_NOT_IMPLEMENTED = 'SNMPv3 is not implemented by the loaded SNMP service.';

// POST /api/tools/snmp-query - Real SNMP GET operation
// v1/v2c: community-based, unchanged. v3: authPriv/authNoPriv/noAuthNoPriv
// via server/services/snmp.js (snmpGetV3); credentials come from the
// request body (v3 object or top-level fields) or, when none are supplied,
// from the target managed device's stored v3 credentials. Passphrases are
// never logged or echoed: the response carries only the v3 identity,
// protocol names and security level (see describeSnmpV3). Bad v3
// credentials are a 400; transport failures are a 502. v3 is fully
// implemented here — the only 501 left in this file is the
// service-missing guard in the v3 branch below.
router.post('/api/tools/snmp-query', async (req, res) => {
  const { ip, oid = '.1.3.6.1.2.1.1.1.0', community = 'public_monitor_ro', version = 'v2c' } = req.body || {};
  if (!ip || typeof ip !== 'string' || !ip.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target ip (or managed device name) is required.' });
  }
  const cleanOid = String(oid).trim().replace(/^\./, '');
  if (!/^(\d+\.)*\d+$/.test(cleanOid)) {
    return res.status(400).json({ status: 'error', message: `Invalid OID '${cleanOid}'. Expected a numeric dotted OID.` });
  }
  const verResolved = resolveSnmpVersion(version);
  if (verResolved.error) {
    return res.status(400).json({ status: 'error', message: verResolved.error });
  }
  const ver = verResolved.version;
  const portResolved = resolveSnmpPort(req.body);
  if (portResolved.error) {
    return res.status(400).json({ status: 'error', message: portResolved.error });
  }
  const snmpOptions = portResolved.port ? { port: portResolved.port } : {};
  const snmp = loadSnmpService();
  if (!snmp || typeof snmp.snmpGet !== 'function') return snmpServiceUnavailable(res);

  const { requested, address } = await resolveSnmpTarget(ip);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  // --- SNMPv3 path ---
  if (ver === 'v3') {
    if (typeof snmp.snmpGetV3 !== 'function' || typeof snmp.validateV3 !== 'function') {
      return res.status(501).json({
        status: 'error',
        error: 'not_implemented',
        message: SNMPV3_NOT_IMPLEMENTED
      });
    }
    const { creds, error } = resolveV3Creds(snmp, req.body, requested);
    if (error) {
      return res.status(400).json({ status: 'error', message: error });
    }
    let varbinds;
    try {
      varbinds = await snmp.snmpGetV3(address, creds, [cleanOid], snmpOptions);
    } catch (err) {
      return res.status(502).json({ status: 'error', message: `SNMPv3 GET to ${address} failed: ${err.message}` });
    }
    const vb = normalizeVarbinds(varbinds)[0];
    if (!vb || !vb.oid) {
      return res.status(502).json({ status: 'error', message: `SNMPv3 GET to ${address} returned no varbind for ${cleanOid}.` });
    }
    if (vb.error) {
      return res.status(502).json({ status: 'error', message: `SNMPv3 error for ${cleanOid} on ${address}: ${vb.error}` });
    }
    const info = lookupMibOid(cleanOid);
    return res.json({
      status: 'success',
      target: requested,
      resolvedIp: address,
      version: 'v3',
      v3: snmp.describeSnmpV3(creds),
      securityLevel: creds.levelName,
      user: creds.user,
      oid: cleanOid,
      name: info ? info.name : null,
      type: vb.type || (info ? info.type : null),
      description: info ? info.desc : null,
      value: vb.value,
      timestamp: new Date().toISOString()
    });
  }

  let varbinds;
  try {
    varbinds = await snmp.snmpGet(address, community, [cleanOid], snmpOptions);
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
// v3 handled exactly like snmp-query above (same credential sources,
// same 400/502 contract, no 501); v1/v2c unchanged.
router.post('/api/tools/snmp-walk', async (req, res) => {
  const { ip, rootOid = '.1.3.6.1.2.1.1', community = 'public_monitor_ro', version = 'v2c' } = req.body || {};
  if (!ip || typeof ip !== 'string' || !ip.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target ip (or managed device name) is required.' });
  }
  const cleanRoot = String(rootOid).trim().replace(/^\./, '');
  if (!/^(\d+\.)*\d+$/.test(cleanRoot)) {
    return res.status(400).json({ status: 'error', message: `Invalid root OID '${cleanRoot}'. Expected a numeric dotted OID.` });
  }
  const verResolved = resolveSnmpVersion(version);
  if (verResolved.error) {
    return res.status(400).json({ status: 'error', message: verResolved.error });
  }
  const ver = verResolved.version;
  const portResolved = resolveSnmpPort(req.body);
  if (portResolved.error) {
    return res.status(400).json({ status: 'error', message: portResolved.error });
  }
  const snmpOptions = portResolved.port ? { port: portResolved.port } : {};
  const snmp = loadSnmpService();
  if (!snmp || typeof snmp.snmpWalk !== 'function') return snmpServiceUnavailable(res);

  const { requested, address } = await resolveSnmpTarget(ip);
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }

  // --- SNMPv3 path ---
  if (ver === 'v3') {
    if (typeof snmp.snmpWalkV3 !== 'function' || typeof snmp.validateV3 !== 'function') {
      return res.status(501).json({
        status: 'error',
        error: 'not_implemented',
        message: SNMPV3_NOT_IMPLEMENTED
      });
    }
    const { creds, error } = resolveV3Creds(snmp, req.body, requested);
    if (error) {
      return res.status(400).json({ status: 'error', message: error });
    }
    let raw;
    try {
      raw = await snmp.snmpWalkV3(address, creds, cleanRoot, snmpOptions);
    } catch (err) {
      return res.status(502).json({ status: 'error', message: `SNMPv3 walk of ${cleanRoot} on ${address} failed: ${err.message}` });
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
    return res.json({
      status: 'success',
      target: requested,
      resolvedIp: address,
      version: 'v3',
      v3: snmp.describeSnmpV3(creds),
      securityLevel: creds.levelName,
      user: creds.user,
      rootOid: cleanRoot,
      count: results.length,
      results,
      timestamp: new Date().toISOString()
    });
  }

  let raw;
  try {
    raw = await snmp.snmpWalk(address, community, cleanRoot, snmpOptions);
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
// MAC resolution — real, read-only, multi-source (no fabrication).
// Sources, in order:
//   1. Stored interface rows (store.listInterfaces) whose stored IP is the
//      target — real data collected by the poller.
//   2. This host's ARP cache (/proc/net/arp on Linux) — real kernel data.
//   3. Live SNMPv2c (read-only): the target's own MAC via ipAddrTable ->
//      ifPhysAddress, then ipNetToMediaTable / ipNetToPhysicalTable on the
//      target and on managed devices (or an explicit `via` device).
// Source 3 needs RAW varbinds: the SNMP service normalises OctetString
// values to UTF-8 strings, which destroys arbitrary MAC bytes, so this
// endpoint opens its own short-lived net-snmp sessions (same library, same
// community/timeout conventions) and formats Buffer values directly.
// No OUI/vendor database is bundled, so `vendor` is always null — never
// guessed from the prefix. A target found in no source is an honest 404
// listing every source tried.
// ---------------------------------------------------------------------------

const IP_NET_TO_MEDIA_TABLE = '1.3.6.1.2.1.4.22.1.2'; // ipNetToMediaPhysAddress
const IP_NET_TO_PHYSICAL_TABLE = '1.3.6.1.2.1.4.35.1.4'; // ipNetToPhysicalPhysAddress
const IP_ADDR_TABLE_IF_INDEX = '1.3.6.1.2.1.4.20.1.2'; // ipAdEntIfIndex
const IF_PHYS_ADDRESS = '1.3.6.1.2.1.2.2.1.6'; // ifPhysAddress

let netSnmpLib = null;
function loadNetSnmp() {
  if (netSnmpLib !== null) return netSnmpLib;
  try {
    netSnmpLib = require('net-snmp');
  } catch (e) {
    netSnmpLib = false;
  }
  return netSnmpLib || null;
}

// Canonicalise a MAC value to lowercase colon hex, or null when it is not
// a real 6-byte hardware address (wrong length, all-zero, unparsable).
// Buffers are formatted byte-by-byte (never via a UTF-8 string: arbitrary
// MAC bytes are not valid UTF-8 and would be destroyed by the conversion).
function formatMac(value) {
  if (Buffer.isBuffer(value)) {
    if (value.length !== 6) return null;
    if (value.every((b) => b === 0)) return null;
    return [...value].map((b) => b.toString(16).padStart(2, '0')).join(':');
  }
  if (typeof value === 'string') {
    const clean = value.trim().toLowerCase();
    if (/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/.test(clean)) return clean.replace(/-/g, ':');
    const hex = clean.replace(/[^0-9a-f]/g, '');
    if (hex.length === 12 && !/^0{12}$/.test(hex)) return hex.match(/../g).join(':');
    return null;
  }
  return null;
}

// This host's ARP cache (Linux /proc/net/arp): Map ip -> { mac, device }.
// Empty map on non-Linux hosts or an unreadable table — never an error.
function readHostArpCache() {
  const out = new Map();
  try {
    const text = fs.readFileSync('/proc/net/arp', 'utf8');
    for (const line of text.split('\n').slice(1)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 6 && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0])) {
        const mac = formatMac(parts[3]);
        if (mac) out.set(parts[0], { mac, device: parts[5] });
      }
    }
  } catch (e) {
    // No ARP table available on this host; the caller treats it as a miss.
  }
  return out;
}

// Raw net-snmp GET: varbind values are returned untouched (Buffers stay
// Buffers) so MAC bytes survive. Callback bodies never throw: a throw
// inside net-snmp's UDP callback escapes every promise and kills the
// whole Node process.
function snmpRawGet(address, community, oids) {
  const lib = loadNetSnmp();
  if (!lib) throw new Error('net-snmp library is not available on this server');
  return new Promise((resolve, reject) => {
    let session;
    try {
      session = lib.createSession(address, community, { version: lib.Version2c, timeout: 3000, retries: 1, transport: 'udp4' });
    } catch (e) {
      return reject(e);
    }
    session.get(oids, (error, varbinds) => {
      try { session.close(); } catch (_e) {}
      if (error) return reject(error);
      resolve((varbinds || []).map((vb) => {
        let value = null;
        let err = null;
        try {
          if (lib.isVarbindError(vb)) err = lib.varbindError(vb);
          else value = vb.value;
        } catch (e) {
          err = e.message;
        }
        return { oid: String(vb.oid), type: vb.type, value, error: err };
      }));
    });
  });
}

// Raw net-snmp subtree walk (bounded by the requested column, like
// server/services/snmp.js sessionWalk). Resolves to the varbinds actually
// returned (possibly []); rejects on transport error/timeout.
function snmpRawWalk(address, community, oid) {
  const lib = loadNetSnmp();
  if (!lib) throw new Error('net-snmp library is not available on this server');
  return new Promise((resolve, reject) => {
    let session;
    try {
      session = lib.createSession(address, community, { version: lib.Version2c, timeout: 3000, retries: 1, transport: 'udp4' });
    } catch (e) {
      return reject(e);
    }
    const rows = [];
    const base = String(oid);
    try {
      session.subtree(oid, 20, (varbinds) => {
        try {
          for (const vb of varbinds || []) {
            try {
              if (lib.isVarbindError(vb)) continue;
              const vbOid = String(vb.oid);
              if (vbOid !== base && !vbOid.startsWith(`${base}.`)) continue;
              rows.push({ oid: vbOid, type: vb.type, value: vb.value });
            } catch (_e) {
              // One bad varbind is skipped, never thrown out of the callback.
            }
          }
        } catch (_e) {
          // Never throw out of the net-snmp callback.
        }
      }, (error) => {
        try { session.close(); } catch (_e) {}
        if (error) return reject(error);
        resolve(rows);
      });
    } catch (e) {
      try { session.close(); } catch (_e) {}
      reject(e);
    }
  });
}

// The target device's OWN MAC: ipAddrTable maps its IP to an ifIndex,
// ifPhysAddress.<ifIndex> is that interface's hardware address.
// { found, mac?, ifIndex?, error? } — error is set only when SNMP itself
// failed; a missing table row is a plain miss (error null).
async function snmpOwnMac(address, community) {
  let rows;
  try {
    rows = await snmpRawWalk(address, community, IP_ADDR_TABLE_IF_INDEX);
  } catch (err) {
    return { found: false, error: `SNMP walk of ipAddrTable on ${address} failed: ${err.message}` };
  }
  const want = `${IP_ADDR_TABLE_IF_INDEX}.${address}`;
  const hit = rows.find((vb) => vb.oid === want && !vb.error && vb.value !== null && vb.value !== undefined);
  if (!hit) return { found: false, error: null };
  const ifIndex = Number(hit.value);
  if (!Number.isInteger(ifIndex) || ifIndex < 0) return { found: false, error: null };
  let got;
  try {
    got = await snmpRawGet(address, community, [`${IF_PHYS_ADDRESS}.${ifIndex}`]);
  } catch (err) {
    return { found: false, error: `SNMP GET of ifPhysAddress.${ifIndex} on ${address} failed: ${err.message}` };
  }
  const vb = got[0];
  if (!vb || vb.error) return { found: false, error: null };
  const mac = formatMac(vb.value);
  if (!mac) return { found: false, error: null };
  return { found: true, mac, ifIndex };
}

// The target's MAC as seen in one device's ARP table: ipNetToMediaTable
// first (row OID ...22.1.2.<ifIndex>.<ip>), then ipNetToPhysicalTable
// (row OID ...35.1.4.<ifIndex>.1.<ip> for IPv4). { found, mac?, ifIndex?,
// table?, error? } — error is set only when SNMP itself failed.
async function snmpArpLookup(viaAddress, targetIp, community) {
  let rows;
  try {
    rows = await snmpRawWalk(viaAddress, community, IP_NET_TO_MEDIA_TABLE);
  } catch (err) {
    return { found: false, error: `SNMP walk of ipNetToMediaTable on ${viaAddress} failed: ${err.message}` };
  }
  const suffix = `.${targetIp}`;
  for (const vb of rows) {
    if (!vb.oid.endsWith(suffix) || vb.error) continue;
    const mac = formatMac(vb.value);
    if (!mac) continue;
    const ifIndex = Number(vb.oid.slice(IP_NET_TO_MEDIA_TABLE.length + 1, vb.oid.length - suffix.length));
    return { found: true, mac, ifIndex: Number.isInteger(ifIndex) ? ifIndex : null, table: 'ipNetToMediaTable' };
  }
  try {
    rows = await snmpRawWalk(viaAddress, community, IP_NET_TO_PHYSICAL_TABLE);
  } catch (err) {
    return { found: false, error: `SNMP walk of ipNetToPhysicalTable on ${viaAddress} failed: ${err.message}` };
  }
  const suffix2 = `.1.${targetIp}`;
  for (const vb of rows) {
    if (!vb.oid.endsWith(suffix2) || vb.error) continue;
    const mac = formatMac(vb.value);
    if (!mac) continue;
    const ifIndex = Number(vb.oid.slice(IP_NET_TO_PHYSICAL_TABLE.length + 1, vb.oid.length - suffix2.length));
    return { found: true, mac, ifIndex: Number.isInteger(ifIndex) ? ifIndex : null, table: 'ipNetToPhysicalTable' };
  }
  return { found: false, error: null };
}

// ---------------------------------------------------------------------------
// Outside-scope canned endpoints (audit E1–E3). There is no real backend for
// any of these in this server — no SSH/Telnet session runner, no WMI/WinRM
// client — so they answer an honest 501 instead of returning canned
// template output. Paths are unchanged. (mac-resolve used to sit here; it
// is now implemented above from real sources.)
// ---------------------------------------------------------------------------

// Interactive Web CLI Terminal Command Executor
router.post('/api/tools/terminal-exec', (req, res) => {
  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'Terminal execution is not implemented: no safe allow-listed command runner (SSH/Telnet session) exists on this server, so no command is executed and no output is fabricated.',
    hostname: req.body?.hostname ?? null,
    command: req.body?.command ?? null,
    timestamp: new Date().toISOString()
  });
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

// CLI QUERY TOOL
router.post('/api/tools/cli-query', (req, res) => {
  const { host = '127.0.0.1', protocol = 'SSHv2', command = 'show version' } = req.body || {};
  return res.status(501).json({
    status: 'error',
    error: 'not_implemented',
    message: 'CLI query is not implemented: no SSH session runner exists on this server, so no command is executed against the host.',
    host,
    protocol,
    command,
    timestamp: new Date().toISOString()
  });
});

// ADDRESS RESOLVER & MAC TOOL — real, read-only, multi-source (see above).
// POST /api/tools/mac-resolve { target, community?, via? }
//   target: IPv4 or managed-device name (required). community: SNMPv2c
//   community for the live-SNMP sources (default 'public'). via: IP or
//   managed-device name of a device whose ARP table to search; without it,
//   every managed device's ARP table is tried. Success: 200 with the real
//   MAC and the source that supplied it. Nothing found: honest 404 listing
//   every source tried. Unresolvable target/via: 422.
router.post('/api/tools/mac-resolve', async (req, res) => {
  const { target = '127.0.0.1', community = 'public', via } = req.body || {};
  if (!target || typeof target !== 'string' || !target.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target IP address (or managed device name) is required.' });
  }
  const { requested, address } = await resolveSnmpTarget(target.trim());
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }
  const comm = typeof community === 'string' && community.trim() ? community.trim() : 'public';
  const attempts = [];
  const answer = (mac, source, detail) => res.json({
    status: 'success',
    target: requested,
    resolvedIp: address,
    mac,
    vendor: null,
    vendorNote: 'No OUI/vendor database is bundled with this server, so vendor is not inferred.',
    source,
    ...detail,
    timestamp: new Date().toISOString()
  });

  // 1. Stored interface rows whose stored IP is the target.
  try {
    let hit = null;
    for (const dev of safeListDevices()) {
      let ifaces = [];
      try { ifaces = store.listInterfaces(dev.id) || []; } catch (e) { ifaces = []; }
      const row = ifaces.find((i) => i && i.ip === address && formatMac(i.mac));
      if (row) { hit = { dev, row }; break; }
    }
    if (hit) {
      return answer(formatMac(hit.row.mac), 'stored-interface', {
        device: hit.dev.ip || null,
        deviceName: hit.dev.sys_name || hit.dev.hostname || null,
        ifIndex: hit.row.if_index ?? null,
        interface: hit.row.name || hit.row.descr || null
      });
    }
    attempts.push({ source: 'stored-interface', result: 'no stored interface row has this IP' });
  } catch (e) {
    attempts.push({ source: 'stored-interface', result: `store error: ${e.message}` });
  }

  // 2. This host's ARP cache.
  const arp = readHostArpCache();
  if (arp.has(address)) {
    const hit = arp.get(address);
    return answer(hit.mac, 'host-arp-cache', {
      device: null,
      deviceName: null,
      ifIndex: null,
      interface: hit.device
    });
  }
  attempts.push({ source: 'host-arp-cache', result: 'no entry in this host ARP cache' });

  // 3a. The target's own MAC via live SNMP (ipAddrTable -> ifPhysAddress).
  const own = await snmpOwnMac(address, comm);
  if (own.found) {
    return answer(own.mac, 'snmp-if-table', {
      device: address,
      deviceName: null,
      ifIndex: own.ifIndex,
      interface: null
    });
  }
  attempts.push({ source: 'snmp-if-table', result: own.error || 'target has no ipAddrTable row for this IP (or no ifPhysAddress)' });

  // 3b. ARP tables: an explicit `via` device, else every managed device.
  const viaTargets = [];
  if (via !== undefined && via !== null && String(via).trim() !== '') {
    const v = await resolveSnmpTarget(String(via).trim());
    if (!v.address) {
      return res.status(422).json({ status: 'error', message: `Could not resolve 'via' device '${v.requested}' to an IPv4 address.` });
    }
    viaTargets.push(v.address);
  } else {
    for (const dev of safeListDevices()) {
      if (dev.ip && dev.ip !== address) viaTargets.push(dev.ip);
    }
  }
  for (const viaIp of viaTargets) {
    const hit = await snmpArpLookup(viaIp, address, comm);
    if (hit.found) {
      return answer(hit.mac, 'snmp-arp-table', {
        device: viaIp,
        deviceName: null,
        ifIndex: hit.ifIndex,
        interface: null,
        table: hit.table
      });
    }
    attempts.push({ source: `snmp-arp-table@${viaIp}`, result: hit.error || 'no ARP entry for this IP' });
  }
  if (!viaTargets.length) {
    attempts.push({ source: 'snmp-arp-table', result: 'no managed device or via device to query' });
  }

  return res.status(404).json({
    status: 'error',
    error: 'mac_not_found',
    message: `No MAC address was found for ${requested} (${address}) in any available source; nothing was fabricated.`,
    target: requested,
    resolvedIp: address,
    sourcesTried: attempts,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
