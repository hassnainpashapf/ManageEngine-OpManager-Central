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

// Safe command runner (built by the parallel runner-service track:
// server/services/runner.js). Loaded lazily, same pattern as the SNMP
// service, so this router still loads if the runner file (or its ssh2
// dependency) is not present yet; the runner endpoints then answer 502
// instead of crashing the whole server. The runner is the ONLY execution
// path for terminal-exec / cli-query: execFile with shell:false locally,
// ssh2 exec channels remotely, explicit allow-list only. Credentials are
// per-call only — this router never reads stored credentials, never logs
// a request body, and never echoes a password/privateKey/passphrase back.
let runnerService = null;
function loadRunnerService() {
  if (runnerService) return runnerService;
  try {
    runnerService = require('../services/runner');
  } catch (e) {
    return null;
  }
  return runnerService;
}

// WinRM service (real WS-Management client, server/services/winrm.js —
// canonical client from the winrm-service track, with the Basic-over-
// HTTPS fallback and useHttps handling ported from the winrm-route
// fork). Loaded lazily, same pattern as the runner/SNMP services, so
// this router still loads if the service file is not present yet; the
// WMI endpoint then answers 502 instead of crashing the whole server.
let winrmService = null;
function loadWinrmService() {
  if (winrmService) return winrmService;
  try {
    winrmService = require('../services/winrm');
  } catch (e) {
    return null;
  }
  return winrmService;
}

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

// Neighbor-table readers for the MAC resolver (ip/arp binaries may live in
// /sbin or /usr/sbin on minimal installs; resolveBinary falls back to the
// bare command name so execFile still tries $PATH).
const IP_NEIGH_BIN = resolveBinary(['/sbin/ip', '/usr/sbin/ip', '/bin/ip', '/usr/bin/ip', 'ip']);
const ARP_BIN = resolveBinary(['/usr/sbin/arp', '/sbin/arp', '/usr/bin/arp', 'arp']);

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
//   2. This host's ARP/neighbor table — `ip neigh show`, then `arp -a`,
//      then /proc/net/arp on Linux — real kernel data, merged in that
//      preference order. An empty/unreadable table is an honest miss that
//      names the methods tried; it is never an error and never faked.
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
// Forwarding-database tables (MAC -> switch port). Q-BRIDGE-MIB first,
// BRIDGE-MIB as fallback — see snmpFdbLookup() for why both are needed.
const DOT1Q_TP_FDB_PORT = '1.3.6.1.2.1.17.7.1.2.2.1.2'; // dot1qTpFdbPort
const DOT1D_TP_FDB_PORT = '1.3.6.1.2.1.17.4.3.1.2'; // dot1dTpFdbPort
const DOT1D_BASE_PORT_IF_INDEX = '1.3.6.1.2.1.17.1.4.1.2'; // dot1dBasePortIfIndex
const IF_NAME = '1.3.6.1.2.1.31.1.1.1.1'; // ifName
const IF_DESCR = '1.3.6.1.2.1.2.2.1.2'; // ifDescr

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
    // An all-zero "MAC" (e.g. an incomplete /proc/net/arp row) is not a
    // hardware address — never report it as one.
    if (/^(00[:-]){5}00$/.test(clean)) return null;
    if (/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/.test(clean)) return clean.replace(/-/g, ':');
    const hex = clean.replace(/[^0-9a-f]/g, '');
    if (hex.length === 12 && !/^0{12}$/.test(hex)) return hex.match(/../g).join(':');
    return null;
  }
  return null;
}

// This host's ARP/neighbor table, read from every source this OS offers,
// in preference order — `ip neigh show`, `arp -a`, /proc/net/arp (Linux).
// Returns { entries, methodsTried } where entries is a Map
// ip -> { mac, device, state, via } and methodsTried records, per method,
// how many entries it contributed (and the error when it was unavailable).
// Sources are merged (first source wins per IP); an empty map is an honest
// empty result — no readable source, or a genuinely empty table — never an
// error. The caller reports it as a miss with the methods tried.
// Only rows with a real, non-zero hardware address are kept: FAILED /
// INCOMPLETE neighbor states and 00:00:00:00:00:00 rows carry no MAC.

// One `ip neigh show` line:
//   198.19.0.1 dev host0 lladdr da:c1:a4:cd:33:62 DELAY
// IPv6 lines are skipped (mac-resolve targets are IPv4 only).
function parseIpNeighLine(line) {
  const m = String(line || '').trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s+dev\s+(\S+)\s+lladdr\s+([0-9a-fA-F:.-]{17})(?:\s+(\S+))?/);
  if (!m) return null;
  const mac = formatMac(m[3]);
  if (!mac) return null;
  const state = (m[4] || '').toUpperCase();
  if (state === 'FAILED' || state === 'INCOMPLETE') return null;
  return { ip: m[1], mac, device: m[2], state: state || null };
}

// One `arp -a` line (Linux net-tools and macOS/BSD agree on this shape):
//   hatch-egress-proxy (198.19.0.1) at da:c1:a4:cd:33:62 [ether] on host0
//   ? (192.168.1.1) at aa:bb:cc:dd:ee:ff [ether] on en0
// Incomplete entries print "(incomplete)" instead of a MAC and match nothing.
function parseArpALine(line) {
  const m = String(line || '').match(/\((\d{1,3}(?:\.\d{1,3}){3})\)\s+at\s+([0-9a-fA-F:.-]{17})(?:\s+\[ether\])?\s+on\s+(\S+)/);
  if (!m) return null;
  const mac = formatMac(m[2]);
  if (!mac) return null;
  return { ip: m[1], mac, device: m[3], state: null };
}

// /proc/net/arp rows (header line skipped). Flags 0x2 means the entry is
// complete; anything else with a zero MAC is dropped by formatMac anyway.
function parseProcNetArp(text) {
  const out = new Map();
  for (const line of String(text || '').split('\n').slice(1)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 6 && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0])) {
      const mac = formatMac(parts[3]);
      if (mac) out.set(parts[0], { mac, device: parts[5], state: parts[2] === '0x2' ? 'COMPLETE' : null });
    }
  }
  return out;
}

async function readHostArpCache() {
  const entries = new Map();
  const methodsTried = [];
  const add = (row, via) => {
    if (!row || !row.ip || !row.mac) return;
    if (!entries.has(row.ip)) entries.set(row.ip, { mac: row.mac, device: row.device || null, state: row.state || null, via });
  };

  // 1. `ip neigh show` — the live kernel neighbor table (Linux).
  try {
    const { stdout } = await run(IP_NEIGH_BIN, ['neigh', 'show'], { timeout: 3000 });
    let n = 0;
    for (const line of String(stdout || '').split('\n')) {
      const row = parseIpNeighLine(line);
      if (row) { add(row, 'ip neigh'); n++; }
    }
    methodsTried.push({ method: 'ip neigh show', entries: n });
  } catch (e) {
    methodsTried.push({ method: 'ip neigh show', entries: 0, error: e.message });
  }

  // 2. `arp -a` — present on Linux/macOS/BSD; fills gaps if `ip` is missing.
  try {
    const { stdout } = await run(ARP_BIN, ['-a'], { timeout: 3000 });
    let n = 0;
    for (const line of String(stdout || '').split('\n')) {
      const row = parseArpALine(line);
      if (row) { add(row, 'arp -a'); n++; }
    }
    methodsTried.push({ method: 'arp -a', entries: n });
  } catch (e) {
    methodsTried.push({ method: 'arp -a', entries: 0, error: e.message });
  }

  // 3. /proc/net/arp — Linux kernel table file; last resort.
  try {
    const text = fs.readFileSync('/proc/net/arp', 'utf8');
    const before = entries.size;
    for (const row of parseProcNetArp(text).values()) add(row, '/proc/net/arp');
    methodsTried.push({ method: '/proc/net/arp', entries: entries.size - before });
  } catch (e) {
    methodsTried.push({ method: '/proc/net/arp', entries: 0, error: e.message });
  }

  return { entries, methodsTried };
}

// One-line human summary of how the ARP cache was read, for 404s and UI.
function arpMethodsSummary(methodsTried) {
  return (methodsTried || []).map((m) => `${m.method}: ${m.entries} ${m.entries === 1 ? 'entry' : 'entries'}${m.error ? ` (unavailable: ${m.error})` : ''}`).join('; ');
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
  // ipNetToPhysicalTable is NOT implemented on every agent (this estate's
  // C3560 answers "No Such Instance" for it), so a failed walk here is a
  // plain miss for that table, not a lookup failure: the ipNetToMedia walk
  // above already proved the host answers SNMP, so a transport fault here
  // is not the likely cause. The miss is recorded in `note`, never as an
  // error, so callers do not mistake "table not supported" for "host down".
  let rows2;
  try {
    rows2 = await snmpRawWalk(viaAddress, community, IP_NET_TO_PHYSICAL_TABLE);
  } catch (err) {
    return { found: false, error: null, note: `ipNetToPhysicalTable not available on ${viaAddress} (${err.message})` };
  }
  const suffix2 = `.1.${targetIp}`;
  for (const vb of rows2) {
    if (!vb.oid.endsWith(suffix2) || vb.error) continue;
    const mac = formatMac(vb.value);
    if (!mac) continue;
    const ifIndex = Number(vb.oid.slice(IP_NET_TO_PHYSICAL_TABLE.length + 1, vb.oid.length - suffix2.length));
    return { found: true, mac, ifIndex: Number.isInteger(ifIndex) ? ifIndex : null, table: 'ipNetToPhysicalTable' };
  }
  return { found: false, error: null };
}

// ---------------------------------------------------------------------------
// MAC -> switch port via the forwarding database (Q-BRIDGE-MIB then
// BRIDGE-MIB). LIVE FINDING (Techub Core 192.168.30.2, Cisco C3560, IOS
// 12.2(58)SE1, community 'public', verified 2026-11-09): the Q-BRIDGE-MIB
// dot1qTpFdbTable is NOT exposed by this switch — a walk of
// dot1qTpFdbPort returns "No Such Object", with a plain community and
// with Cisco community-string indexing (public@1, public@10); public@30
// and public@60 get no response at all. The BRIDGE-MIB dot1dTpFdbTable
// DOES answer (52 rows live). So a Q-BRIDGE-only implementation returns
// nothing on this estate: try dot1qTpFdbTable first (it is the right
// per-VLAN table on switches that implement it), then fall back to
// dot1dTpFdbTable, and never probe community@<vlan> blindly — only when
// the caller supplies a VLAN, because a wrong @<vlan> stalls the lookup
// on a timeout. Row OIDs: dot1qTpFdbPort ...1.2.2.1.2.<vlan>.<6 MAC
// octets as decimals>; dot1dTpFdbPort ...4.3.1.2.<6 MAC octets>. The
// value in both is the bridge port number; 0 means "learned but no
// port" (RFC 4188) and is skipped. dot1dBasePortIfIndex.<bridgePort>
// maps the bridge port to an ifIndex, and ifName.<ifIndex> (fallback
// ifDescr) gives the port label (e.g. Gi0/1).
// ---------------------------------------------------------------------------

// Decimal-octet OID suffix for a canonical MAC, e.g.
// b8:ca:3a:71:0f:c5 -> '184.202.58.113.15.197'. Null when not a 6-byte MAC.
function macOidSuffix(mac) {
  const clean = String(mac || '').toLowerCase().replace(/[^0-9a-f]/g, '');
  if (clean.length !== 12) return null;
  return clean.match(/../g).map((h) => parseInt(h, 16)).join('.');
}

// Resolve one bridge port number on one device to { ifIndex, interface }
// via dot1dBasePortIfIndex + ifName (falling back to ifDescr). Nulls when
// the mapping is absent — never invented. { ifIndex?, interface?, error? }
// error is set only when the SNMP GET itself failed.
async function snmpBridgePortToInterface(address, community, bridgePort) {
  let got;
  try {
    got = await snmpRawGet(address, community, [`${DOT1D_BASE_PORT_IF_INDEX}.${bridgePort}`]);
  } catch (err) {
    return { ifIndex: null, interface: null, error: `SNMP GET of dot1dBasePortIfIndex.${bridgePort} on ${address} failed: ${err.message}` };
  }
  const vb = got[0];
  const ifIndex = vb && !vb.error && vb.value !== null && vb.value !== undefined ? Number(vb.value) : NaN;
  if (!Number.isInteger(ifIndex) || ifIndex < 0) return { ifIndex: null, interface: null, error: null };
  let name = null;
  for (const oid of [`${IF_NAME}.${ifIndex}`, `${IF_DESCR}.${ifIndex}`]) {
    try {
      const res = await snmpRawGet(address, community, [oid]);
      const v = res[0];
      if (v && !v.error && v.value !== null && v.value !== undefined) {
        const s = Buffer.isBuffer(v.value) ? v.value.toString('utf8') : String(v.value);
        if (s.trim()) { name = s.trim(); break; }
      }
    } catch (_e) {
      // ifName missing: try ifDescr next; both missing leaves null.
    }
  }
  return { ifIndex, interface: name, error: null };
}

// MAC -> port on ONE device. { found, mac, vlan?, bridgePort?, ifIndex?,
// interface?, table?, device?, note? } — `note` records which tables were
// tried and why each missed; it is diagnostics, never an error, because a
// table the agent does not implement is a miss, not a failure.
async function snmpFdbLookup(viaAddress, mac, community, vlan) {
  const suffix = macOidSuffix(mac);
  if (!suffix) return { found: false, error: null, note: 'not a 6-byte MAC address' };
  const notes = [];

  // 1. Q-BRIDGE-MIB dot1qTpFdbTable: plain community first, then (only
  // when the caller supplied a valid VLAN) community@<vlan> for Cisco
  // community-string indexing.
  const communities = [community];
  if (vlan !== undefined && vlan !== null && String(vlan).trim() !== '') {
    const v = Number(vlan);
    if (Number.isInteger(v) && v >= 1 && v <= 4094) communities.push(`${community}@${v}`);
  }
  for (const comm of communities) {
    let rows;
    try {
      rows = await snmpRawWalk(viaAddress, comm, DOT1Q_TP_FDB_PORT);
    } catch (err) {
      notes.push(`dot1qTpFdbTable walk (${comm === community ? 'plain community' : 'community@' + vlan}) failed: ${err.message}`);
      continue;
    }
    let matched = false;
    for (const vb of rows) {
      const rest = vb.oid.slice(DOT1Q_TP_FDB_PORT.length + 1); // '<vlan>.<mac octets>'
      if (!rest.endsWith(`.${suffix}`)) continue;
      matched = true;
      const vlanPart = rest.slice(0, rest.length - suffix.length - 1);
      const vlanId = Number(vlanPart);
      const bridgePort = Number(vb.value);
      if (!Number.isInteger(vlanId) || !Number.isInteger(bridgePort) || bridgePort <= 0) {
        notes.push(`dot1qTpFdbTable row for ${formatMac(mac)} has no usable port (VLAN ${vlanPart}, bridge port ${vb.value})`);
        continue;
      }
      const mapped = await snmpBridgePortToInterface(viaAddress, community, bridgePort);
      if (mapped.error) {
        notes.push(`dot1qTpFdbTable hit (VLAN ${vlanId}, bridge port ${bridgePort}) but ${mapped.error}`);
        continue;
      }
      return {
        found: true, mac: formatMac(mac), vlan: vlanId, bridgePort,
        ifIndex: mapped.ifIndex, interface: mapped.interface,
        table: 'dot1qTpFdbTable', device: viaAddress, note: notes.join('; ') || null
      };
    }
    if (!matched) notes.push(`dot1qTpFdbTable: no row for ${formatMac(mac)} (${comm === community ? 'plain community' : 'community@' + vlan})`);
  }

  // 2. BRIDGE-MIB dot1dTpFdbTable fallback (the table this estate's
  // C3560 actually implements). Row OID is base + .<6 MAC octets>.
  let rows;
  try {
    rows = await snmpRawWalk(viaAddress, community, DOT1D_TP_FDB_PORT);
  } catch (err) {
    notes.push(`dot1dTpFdbTable walk failed: ${err.message}`);
    return { found: false, error: null, note: notes.join('; ') };
  }
  for (const vb of rows) {
    const rest = vb.oid.slice(DOT1D_TP_FDB_PORT.length + 1);
    if (rest !== suffix) continue;
    const bridgePort = Number(vb.value);
    if (!Number.isInteger(bridgePort) || bridgePort <= 0) {
      notes.push(`dot1dTpFdbTable row for ${formatMac(mac)} has no usable port (bridge port ${vb.value})`);
      continue;
    }
    const mapped = await snmpBridgePortToInterface(viaAddress, community, bridgePort);
    if (mapped.error) {
      notes.push(`dot1dTpFdbTable hit (bridge port ${bridgePort}) but ${mapped.error}`);
      continue;
    }
    return {
      found: true, mac: formatMac(mac), vlan: null, bridgePort,
      ifIndex: mapped.ifIndex, interface: mapped.interface,
      table: 'dot1dTpFdbTable', device: viaAddress, note: notes.join('; ') || null
    };
  }
  notes.push(`dot1dTpFdbTable: no row for ${formatMac(mac)}`);
  return { found: false, error: null, note: notes.join('; ') };
}

// Switch-port step for mac-resolve (merged handler): given a resolved MAC,
// search the forwarding database on the ARP-hit device first (it
// demonstrably holds the MAC), then the explicit `via` device / every
// managed device. Returns { port, portNote } — port is null when no FDB
// row exists; the MAC answer is still returned.
async function resolveFdbPort(mac, comm, viaTargets, arpViaIp, vlanNum) {
  const fdbDevices = [];
  if (arpViaIp) fdbDevices.push(arpViaIp);
  for (const ip of viaTargets) if (!fdbDevices.includes(ip)) fdbDevices.push(ip);
  let port = null;
  let portNote = null;
  for (const fdbIp of fdbDevices) {
    const hit = await snmpFdbLookup(fdbIp, mac, comm, vlanNum);
    if (hit.found) {
      port = {
        device: fdbIp,
        table: hit.table,
        vlan: hit.vlan ?? null,
        bridgePort: hit.bridgePort,
        ifIndex: hit.ifIndex,
        interface: hit.interface
      };
      portNote = hit.note || null;
      break;
    }
    portNote = (portNote ? `${portNote}; ` : '') + `fdb@${fdbIp}: ${hit.error || hit.note || 'MAC not in forwarding database'}`;
  }
  if (!fdbDevices.length) {
    portNote = 'no managed device or via device to query for a switch port';
  }
  return { port, portNote };
}

// ---------------------------------------------------------------------------
// Outside-scope canned endpoints (audit E1–E3). terminal-exec, cli-query
// and wmi-query are now REAL (runner + WinRM, see the block below); any
// other endpoint in this section with no real backend still answers an
// honest 501 instead of returning canned template output. Paths are
// unchanged. (mac-resolve used to sit here; it is now implemented above
// from real sources.)
// Safe runner endpoints (Phase 3, runner-routes) + WMI endpoint (Phase 4
// merge, winrm-route handler adapted to the canonical winrm-service
// client). terminal-exec and cli-query execute ONLY through
// server/services/runner.js — there is no shell anywhere on this path, no
// raw pass-through of caller strings, and no stored credentials: SSH
// credentials (password / privateKey / passphrase) are accepted per call,
// handed to ssh2, and never logged, never audited, never echoed in any
// response. wmi-query executes ONLY through server/services/winrm.js
// (real WinRM SOAP + NTLMv2, Basic-over-HTTPS fallback); its credentials
// are likewise per-call only and never echoed.
//
// terminal-exec { command, hostname?, timeoutMs?, username?, password?,
//                 privateKey?, passphrase?, port? }
//   Routing is decided by the COMMAND, not the hostname:
//     - a local allow-list command (ping, traceroute, nslookup, dig, arp)
//       runs on this server via execFile; the command's own host argument
//       is its target and `hostname` is ignored for execution (it is still
//       recorded in the response/audit).
//     - an exact SSH allow-list string ("show version", "show interfaces",
//       "show ip interface brief", "uptime", "uname -a") runs over SSH
//       against `hostname` (a managed-device name, an IP, or a DNS
//       hostname; defaults to 127.0.0.1 when absent) with per-call
//       credentials.
//     - anything else is refused with 403 before anything is spawned.
//   The UI's terminal modal sends exactly { command, hostname } and reads
//   `output`, so every outcome carries `output` (stdout, else stderr, else
//   the error message) alongside the structured fields.
// cli-query { host?, protocol?, command, username?, password?, privateKey?,
//             passphrase?, port?, timeoutMs? }
//   protocol must be SSHv2/ssh (anything else: honest 501 — no Telnet
//   runner exists). host defaults to 127.0.0.1. command must be an exact
//   SSH allow-list string; credentials are per-call only.
//
// Status mapping (honest, never fake-200):
//   400  missing/empty command, malformed arguments, missing SSH creds
//   403  command (or any token/flag in it) is not on the allow-list
//   422  hostname/host cannot be resolved to an address
//   501  protocol with no runner (Telnet) / runner service unloadable
//        is reported as 502 (see below); protocol Telnet stays 501
//   502  nothing ran: runner unavailable, SSH connect/auth failure,
//        remote host unreachable, local binary missing, execution timeout
//   200  the command RAN: body carries ok, stdout, stderr, output,
//        exitCode, signal, timedOut, durationMs, auditId. A non-zero exit
//        is reported in the body (status 'error', ok false) — the output
//        is real, so the HTTP call itself succeeded.
// ---------------------------------------------------------------------------

// Any token containing one of these can never be a legitimate allow-list
// argument (hostnames, IPs, DNS types and the known flags contain none of
// them); it is treated as an attempt to run something outside the
// allow-list and refused with 403, before anything is spawned. execFile
// runs with shell:false anyway — this is defence in depth.
const SHELL_META_RE = /[;|&$`"'<>\n\r()\\*?~#![\]{}\s]/;

function runnerHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function runnerUser(req) {
  return (req && req.user && typeof req.user.username === 'string' && req.user.username) || 'system';
}

function runnerUnavailable(res) {
  return res.status(502).json({
    status: 'error',
    error: 'runner_unavailable',
    message: 'Safe command runner is not available on this server (server/services/runner.js could not be loaded).',
    timestamp: new Date().toISOString()
  });
}

// Map a runner rejection to its HTTP status: refusal -> 403, bad arguments
// -> 400, anything else -> 502. The runner's own message is reused
// verbatim; it never contains a credential.
function mapRunnerRejection(res, err, meta) {
  if (err && err.code === 'ERR_RUNNER_NOT_ALLOWED') {
    return res.status(403).json({
      status: 'error', error: 'command_not_allowed', message: err.message,
      target: meta.target, hostname: meta.hostname ?? null, command: meta.command ?? null,
      timestamp: new Date().toISOString()
    });
  }
  if (err && err.code === 'ERR_RUNNER_VALIDATION') {
    return res.status(400).json({
      status: 'error', error: 'invalid_argument', message: err.message,
      target: meta.target, hostname: meta.hostname ?? null, command: meta.command ?? null,
      timestamp: new Date().toISOString()
    });
  }
  return res.status(502).json({
    status: 'error', error: 'runner_error',
    message: `Command execution failed: ${(err && err.message) || 'unknown error'}`,
    target: meta.target, hostname: meta.hostname ?? null, command: meta.command ?? null,
    timestamp: new Date().toISOString()
  });
}

// Shape a runner result for the wire. `output` mirrors stdout (the UI
// terminal reads it); when stdout is empty it falls back to stderr, then
// to the runner's error string, so the caller always sees what happened.
function runnerResultBody(result, meta) {
  const output = (result.stdout && result.stdout.length > 0)
    ? result.stdout
    : ((result.stderr && result.stderr.length > 0) ? result.stderr : (result.error || ''));
  return {
    status: result.ok ? 'success' : 'error',
    ok: result.ok,
    target: result.target,
    hostname: meta.hostname ?? null,
    host: result.host ?? null,
    command: result.command,
    argv: result.argv ?? null,
    username: result.username ?? null,
    stdout: result.stdout,
    stderr: result.stderr,
    output,
    exitCode: result.exitCode,
    signal: result.signal,
    timedOut: result.timedOut,
    truncated: result.truncated,
    error: result.error,
    durationMs: result.durationMs,
    auditId: result.auditId ?? null,
    timestamp: new Date().toISOString()
  };
}

// Send a runner result: the command RAN (exitCode is a number) -> 200 with
// the full result, even on a non-zero exit. Nothing ran (exitCode null:
// connect/auth failure, unreachable host, missing binary, timeout before
// exec) -> honest 502.
function sendRunnerResult(res, result, meta) {
  if (!result.ok && (result.exitCode === null || result.exitCode === undefined)) {
    return res.status(502).json({
      ...runnerResultBody(result, meta),
      error: 'unreachable',
      message: result.error || 'The target could not be reached or the command could not be started; nothing was executed.'
    });
  }
  return res.status(200).json(runnerResultBody(result, meta));
}

// Parse a free-text local command into { command, args } for
// runner.runLocal(). The first token must be an allow-listed binary;
// every later token must be a known flag or a positional argument for
// that binary. Anything else is refused with 403 — never passed through.
// Positional host/name validation itself stays in the runner (400 on a
// malformed host); this parser only enforces the allow-list shape.
function parseLocalCommand(commandStr) {
  const tokens = commandStr.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) throw runnerHttpError(400, 'A command is required.');
  const name = tokens[0];
  for (const tok of tokens) {
    if (SHELL_META_RE.test(tok)) {
      throw runnerHttpError(403, `runner: command not allowed: "${commandStr}"`);
    }
  }
  const rest = tokens.slice(1);
  const noFlags = (cmd) => {
    for (const tok of rest) {
      if (tok.startsWith('-') || tok.startsWith('+')) {
        throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (unexpected flag "${tok}" for ${cmd})`);
      }
    }
  };
  // Parse "-c N" / "-W N" style flags; returns { positionals, flags }.
  // Unknown flags are refused (403), never forwarded.
  const flagValues = (cmd, allowed) => {
    const positionals = [];
    const flags = {};
    for (let i = 0; i < rest.length; i++) {
      const tok = rest[i];
      if (Object.prototype.hasOwnProperty.call(allowed, tok)) {
        const key = allowed[tok];
        const val = rest[i + 1];
        if (val === undefined || val.startsWith('-') || val.startsWith('+')) {
          throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (flag "${tok}" needs a value)`);
        }
        const n = Number(val);
        if (!Number.isInteger(n)) {
          throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (flag "${tok}" needs an integer value)`);
        }
        flags[key] = n;
        i++;
      } else if (tok.startsWith('-') || tok.startsWith('+')) {
        throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (unexpected flag "${tok}" for ${cmd})`);
      } else {
        positionals.push(tok);
      }
    }
    return { positionals, flags };
  };

  switch (name) {
    case 'ping': {
      const { positionals, flags } = flagValues('ping', { '-c': 'count', '-W': 'deadline' });
      if (positionals.length !== 1) {
        throw runnerHttpError(400, 'ping needs exactly one host: ping [-c 1..5] [-W 1..10] <host>');
      }
      return { command: 'ping', args: { host: positionals[0], count: flags.count, deadline: flags.deadline } };
    }
    case 'traceroute': {
      const { positionals, flags } = flagValues('traceroute', { '-m': 'maxHops', '-w': 'wait' });
      if (positionals.length !== 1) {
        throw runnerHttpError(400, 'traceroute needs exactly one host: traceroute [-m 1..30] [-w 1..10] <host>');
      }
      return { command: 'traceroute', args: { host: positionals[0], maxHops: flags.maxHops, wait: flags.wait } };
    }
    case 'nslookup': {
      noFlags('nslookup');
      if (rest.length < 1 || rest.length > 2) {
        throw runnerHttpError(400, 'nslookup needs a name and an optional server: nslookup <name> [<server>]');
      }
      return { command: 'nslookup', args: { name: rest[0], server: rest[1] } };
    }
    case 'dig': {
      // dig [+short] <name> [<type>]; a bare "+short" token is the flag,
      // any other "+" token is refused. A trailing token that is a known
      // DNS type is the type; anything else in second position is refused
      // by the runner's host validation only if it is not a valid name —
      // so reject a second positional that is not a DNS type here.
      const DNS_TYPES = new Set(['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA', 'CNAME', 'PTR']);
      let short = true;
      const positionals = [];
      for (const tok of rest) {
        if (tok === '+short') { short = true; continue; }
        if (tok.startsWith('+') || tok.startsWith('-')) {
          throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (unexpected flag "${tok}" for dig)`);
        }
        positionals.push(tok);
      }
      if (positionals.length < 1 || positionals.length > 2) {
        throw runnerHttpError(400, 'dig needs a name and an optional type: dig [+short] <name> [<type>]');
      }
      if (positionals.length === 2 && !DNS_TYPES.has(positionals[1].toUpperCase())) {
        throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (unknown DNS type "${positionals[1]}")`);
      }
      return { command: 'dig', args: { short, name: positionals[0], type: positionals[1] } };
    }
    case 'arp': {
      if (rest.length > 1 || (rest.length === 1 && rest[0] !== '-n')) {
        throw runnerHttpError(403, `runner: command not allowed: "${commandStr}" (arp takes only "-n")`);
      }
      return { command: 'arp', args: {} };
    }
    default:
      throw runnerHttpError(403, `runner: command not allowed: "${name}"`);
  }
}

// Collapse runs of whitespace in an SSH command string so "show  version"
// matches the exact allow-list entry "show version". No other rewriting:
// the runner still requires an exact allow-list match.
function normalizeSshCommand(commandStr) {
  return String(commandStr).trim().split(/\s+/).join(' ');
}

// Pull per-call SSH credentials out of a request body. Returns
// { username, port, password?, privateKey?, passphrase? } or throws 400
// when no credential was supplied. The values are handed to the runner
// only; they are never stored, logged or echoed anywhere in this router.
function pickSshCredentials(body) {
  const b = body || {};
  const username = typeof b.username === 'string' ? b.username.trim() : '';
  const port = b.port === undefined || b.port === null ? 22 : Number(b.port);
  if (!username) throw runnerHttpError(400, 'An SSH username is required for remote execution.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw runnerHttpError(400, 'SSH port must be an integer between 1 and 65535.');
  }
  const hasPassword = typeof b.password === 'string' && b.password.length > 0;
  const hasKey = typeof b.privateKey === 'string' && b.privateKey.length > 0;
  if (!hasPassword && !hasKey) {
    throw runnerHttpError(400, 'SSH credentials are required for remote execution: supply a per-call password or privateKey (never stored).');
  }
  const creds = { username, port };
  if (hasPassword) creds.password = b.password;
  if (hasKey) creds.privateKey = b.privateKey;
  if (typeof b.passphrase === 'string' && b.passphrase.length > 0) creds.passphrase = b.passphrase;
  return creds;
}

function pickTimeoutMs(body) {
  if (body === undefined || body === null || body.timeoutMs === undefined || body.timeoutMs === null) return undefined;
  return body.timeoutMs; // the runner validates and clamps it (max 30 s)
}

// Interactive Web CLI Terminal Command Executor — real, via the safe runner.
router.post('/api/tools/terminal-exec', async (req, res) => {
  const commandRaw = req.body?.command;
  if (typeof commandRaw !== 'string' || !commandRaw.trim()) {
    return res.status(400).json({ status: 'error', message: 'A command is required.' });
  }
  const command = commandRaw.trim();
  const hostname = typeof req.body?.hostname === 'string' ? req.body.hostname.trim() : '';
  const user = runnerUser(req);

  const runner = loadRunnerService();
  if (!runner) return runnerUnavailable(res);

  try {
    // Local diagnostics first: the command's own host argument is the
    // target; `hostname` is ignored for execution. parseLocalCommand
    // throws 403 for anything that is not a local allow-list command —
    // but a 403 there may mean "this is an SSH command, not a local one",
    // so only treat it as final when the command is neither local nor
    // an SSH allow-list string (checked below).
    let parsed = null;
    let parseErr = null;
    try {
      parsed = parseLocalCommand(command);
    } catch (e) {
      parseErr = e;
    }
    if (parsed) {
      const result = await runner.run({
        target: 'local', command: parsed.command, args: parsed.args,
        user, timeoutMs: pickTimeoutMs(req.body)
      });
      return sendRunnerResult(res, result, { hostname: hostname || 'local', command });
    }

    // Not a local command: it must be an exact SSH allow-list string.
    // The runner itself is the authority — ask it via run(); a refusal
    // surfaces as ERR_RUNNER_NOT_ALLOWED -> 403. But pre-check with
    // listAllowed() so a malformed local command (400, e.g. "ping" with
    // no host) keeps its 400 instead of being re-reported as 403.
    const sshCommand = normalizeSshCommand(command);
    const sshAllowed = runner.listAllowed().ssh.some((e) => e.command === sshCommand);
    if (!sshAllowed) {
      if (parseErr && parseErr.status === 400) throw parseErr;
      throw runnerHttpError(403, `runner: command not allowed: "${command}"`);
    }
    const hostRaw = hostname || '127.0.0.1';
    const { requested, address } = await resolveSnmpTarget(hostRaw);
    if (!address) {
      return res.status(422).json({
        status: 'error', message: `Could not resolve host '${requested}' to an IPv4 address.`,
        hostname: requested, command, timestamp: new Date().toISOString()
      });
    }
    const creds = pickSshCredentials(req.body);
    const result = await runner.run({
      target: 'ssh', host: address, ...creds,
      command: sshCommand,
      user, timeoutMs: pickTimeoutMs(req.body)
    });
    return sendRunnerResult(res, result, { hostname: requested, command });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({
        status: 'error', message: err.message,
        hostname: hostname || null, command, timestamp: new Date().toISOString()
      });
    }
    return mapRunnerRejection(res, err, { target: hostname ? 'ssh' : 'local', hostname: hostname || null, command });
  }
});

// ---------------------------------------------------------------------------
// WMI QUERY TOOL — real WQL over WinRM via server/services/winrm.js
// (WS-Management Enumerate + Pull, NTLMv2 with a Basic-over-HTTPS
// fallback). Adapted from the Phase 3 winrm-route handler to the
// canonical winrm-service client: the client returns { results, count }
// (not the fork's { rows }) and UPPER_SNAKE error codes (not the fork's
// lowercase ones), so the response carries `results`/`count` and the
// error mapping is INVALID_ARGUMENT -> 400, every other WinRM code
// (AUTH_FAILED, UNREACHABLE, TIMEOUT, PROTOCOL) -> 502. The fork's
// careful validation is kept verbatim: SELECT-only WQL, namespace
// regex, port validation, and credentials are never logged, never
// stored, and never echoed back (only host/namespace/query are echoed).
// The fork's Basic-over-HTTPS fallback and useHttps handling live in
// the canonical client now (server/services/winrm.js): `useHttps` is
// passed through and the client derives the transport from it, so
// HTTPS is not silently dropped.
//   POST /api/tools/wmi-query { host, username, password,
//     namespace?, query?, port?, useHttps? }
//   namespace defaults to 'root\cimv2'; query defaults to
//   'SELECT Name, PercentProcessorTime FROM
//   Win32_PerfFormattedData_PerfOS_Processor'; port defaults to
//   settings.winrm.defaultPort, else 5985 (http) / 5986 (https).
// ---------------------------------------------------------------------------
const DEFAULT_WMI_NAMESPACE = 'root\\cimv2';
const DEFAULT_WMI_QUERY =
  'SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor';

function winrmServiceUnavailable(res) {
  return res.status(502).json({
    status: 'error',
    error: 'winrm_unavailable',
    message: 'WinRM service is not available on this server (server/services/winrm.js could not be loaded).'
  });
}

router.post('/api/tools/wmi-query', async (req, res) => {
  const body = req.body || {};
  const host = typeof body.host === 'string' ? body.host.trim() : '';
  if (!host) {
    return res.status(400).json({ status: 'error', message: 'A WinRM host (IP or hostname) is required.' });
  }
  const query = body.query === undefined || body.query === null ? DEFAULT_WMI_QUERY : body.query;
  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ status: 'error', message: 'A WQL query string is required.' });
  }
  if (!/^SELECT\b/i.test(query.trim())) {
    return res.status(400).json({ status: 'error', message: 'Invalid WQL query: only SELECT statements are accepted.' });
  }
  const namespace = body.namespace === undefined || body.namespace === null
    ? DEFAULT_WMI_NAMESPACE
    : body.namespace;
  if (typeof namespace !== 'string' || !/^[A-Za-z0-9_]+(\\[A-Za-z0-9_]+)*$/.test(namespace.trim())) {
    return res.status(400).json({ status: 'error', message: `Invalid WMI namespace '${String(namespace).slice(0, 80)}'. Expected e.g. 'root\\cimv2'.` });
  }

  // Port / transport: explicit body values win, then settings.winrm
  // ({ defaultPort, transport: 'http'|'https' }), then 5985/5986.
  let winrmSettings = {};
  try {
    const raw = store.getSetting('winrm');
    if (raw) winrmSettings = JSON.parse(raw);
  } catch (e) {
    winrmSettings = {};
  }
  const useHttps = typeof body.useHttps === 'boolean'
    ? body.useHttps
    : winrmSettings.transport === 'https';
  let port = body.port;
  if (port === undefined || port === null || port === '') {
    port = winrmSettings.defaultPort || (useHttps ? 5986 : 5985);
  }
  port = Number(port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return res.status(400).json({ status: 'error', message: 'WinRM port must be between 1 and 65535.' });
  }

  const winrm = loadWinrmService();
  if (!winrm || typeof winrm.runWql !== 'function') return winrmServiceUnavailable(res);

  let result;
  try {
    result = await winrm.runWql(host, {
      username: body.username,
      password: body.password,
      namespace: namespace.trim(),
      query: query.trim(),
      port,
      useHttps,
    });
  } catch (err) {
    // Service error messages never contain credentials; the response echoes
    // host/namespace/query only — username/password are never returned.
    // Canonical client codes are UPPER_SNAKE: INVALID_ARGUMENT -> 400,
    // AUTH_FAILED / UNREACHABLE / TIMEOUT / PROTOCOL -> 502.
    const code = err && err.code ? err.code : 'PROTOCOL';
    const status = code === 'INVALID_ARGUMENT' ? 400 : 502;
    return res.status(status).json({
      status: 'error',
      error: code,
      message: err && err.message ? err.message : 'WinRM query failed.',
      host,
      namespace: namespace.trim(),
      query: query.trim(),
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'success',
    host,
    namespace: namespace.trim(),
    query: query.trim(),
    count: result.count,
    results: result.results,
    timestamp: new Date().toISOString()
  });
});

// CLI QUERY TOOL — real, via the safe runner (SSH only). { host?,
// protocol?, command, username?, password?, privateKey?, passphrase?,
// port?, timeoutMs? }. protocol must be SSHv2/ssh; anything else (e.g.
// Telnet) is an honest 501 — no Telnet runner exists. command must be an
// exact SSH allow-list string; credentials are per-call only, never
// stored, never logged, never echoed.
router.post('/api/tools/cli-query', async (req, res) => {
  const commandRaw = req.body?.command;
  if (typeof commandRaw !== 'string' || !commandRaw.trim()) {
    return res.status(400).json({ status: 'error', message: 'A command is required.' });
  }
  const command = normalizeSshCommand(commandRaw);
  const protocol = typeof req.body?.protocol === 'string' ? req.body.protocol.trim() : 'SSHv2';
  const proto = protocol.toLowerCase();
  if (proto !== 'sshv2' && proto !== 'ssh') {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `CLI protocol '${protocol}' is not implemented: only SSHv2 is supported by the safe runner; no Telnet runner exists on this server, so no command is executed against the host.`,
      host: req.body?.host ?? null,
      protocol,
      command,
      timestamp: new Date().toISOString()
    });
  }
  const hostRaw = typeof req.body?.host === 'string' && req.body.host.trim() ? req.body.host.trim() : '127.0.0.1';
  const user = runnerUser(req);

  const runner = loadRunnerService();
  if (!runner) return runnerUnavailable(res);

  try {
    const { requested, address } = await resolveSnmpTarget(hostRaw);
    if (!address) {
      return res.status(422).json({
        status: 'error', message: `Could not resolve host '${requested}' to an IPv4 address.`,
        host: requested, command, timestamp: new Date().toISOString()
      });
    }
    const creds = pickSshCredentials(req.body);
    const result = await runner.run({
      target: 'ssh', host: address, ...creds,
      command, user, timeoutMs: pickTimeoutMs(req.body)
    });
    return sendRunnerResult(res, result, { hostname: requested, command });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({
        status: 'error', message: err.message,
        host: hostRaw, command, timestamp: new Date().toISOString()
      });
    }
    return mapRunnerRejection(res, err, { target: 'ssh', hostname: hostRaw, command });
  }
});

// GET /api/tools/runner-allowed — the sanitized allow-list (local + SSH
// commands, defaults). No internals, no credentials, no host data. The
// runner UI reads this to offer only commands that can actually run.
router.get('/api/tools/runner-allowed', (req, res) => {
  const runner = loadRunnerService();
  if (!runner) return runnerUnavailable(res);
  res.json({ status: 'success', ...runner.listAllowed(), timestamp: new Date().toISOString() });
});

// ADDRESS RESOLVER & MAC TOOL — real, read-only, multi-source (see above).
// POST /api/tools/mac-resolve { target, community?, via?, all?, vlan? }
//   target: IPv4 or managed-device name (required). community: SNMPv2c
//   community for the live-SNMP sources (default 'public'). via: IP or
//   managed-device name of a device whose ARP table / FDB to search;
//   without it, every managed device's ARP table is tried. all: when true,
//   EVERY source is tried (no first-hit short-circuit) and the response
//   carries a per-source `results` array, so a UI can show each source's
//   outcome. vlan: optional VLAN id (1-4094) for the FDB community@<vlan>
//   walk; invalid vlan is a 400. Success: 200 with the real MAC, the
//   source that supplied it, and `port` (the switch port from the
//   forwarding database, or null when no FDB row exists).
//   Nothing found: honest 404 listing every source tried.
//   Unresolvable target/via: 422.
//
// Per-source attempt helpers. Each returns a uniform result object:
//   { source, found, mac?, device?, deviceName?, ifIndex?, interface?,
//     state?, table?, arpMethod?, arpEntries?, arpMethods?, result? }
// `result` is the human-readable miss reason (only when found is false).
// A hit's `mac` is always a real value from that source — never guessed.
async function tryStoredInterface(address) {
  try {
    for (const dev of safeListDevices()) {
      let ifaces = [];
      try { ifaces = store.listInterfaces(dev.id) || []; } catch (e) { ifaces = []; }
      const row = ifaces.find((i) => i && i.ip === address && formatMac(i.mac));
      if (row) {
        return {
          source: 'stored-interface', found: true, mac: formatMac(row.mac),
          device: dev.ip || null, deviceName: dev.sys_name || dev.hostname || null,
          ifIndex: row.if_index ?? null, interface: row.name || row.descr || null
        };
      }
    }
    return { source: 'stored-interface', found: false, result: 'no stored interface row has this IP' };
  } catch (e) {
    return { source: 'stored-interface', found: false, result: `store error: ${e.message}` };
  }
}

async function tryHostArpCache(address) {
  const { entries, methodsTried } = await readHostArpCache();
  const summary = arpMethodsSummary(methodsTried);
  const base = { source: 'host-arp-cache', arpEntries: entries.size, arpMethods: summary };
  if (entries.has(address)) {
    const hit = entries.get(address);
    return {
      ...base, found: true, mac: hit.mac,
      device: null, deviceName: null, ifIndex: null, interface: hit.device,
      state: hit.state || null, arpMethod: hit.via || null
    };
  }
  return {
    ...base, found: false,
    result: entries.size
      ? `no entry for this IP (cache holds ${entries.size} ${entries.size === 1 ? 'entry' : 'entries'})`
      : `ARP cache empty or unreadable on this host (${summary})`
  };
}

async function trySnmpOwnMac(address, comm) {
  const own = await snmpOwnMac(address, comm);
  if (own.found) {
    return {
      source: 'snmp-if-table', found: true, mac: own.mac,
      device: address, deviceName: null, ifIndex: own.ifIndex, interface: null
    };
  }
  return { source: 'snmp-if-table', found: false, result: own.error || 'target has no ipAddrTable row for this IP (or no ifPhysAddress)' };
}

async function trySnmpArpTables(address, comm, viaTargets) {
  const results = [];
  for (const viaIp of viaTargets) {
    const hit = await snmpArpLookup(viaIp, address, comm);
    if (hit.found) {
      results.push({
        source: `snmp-arp-table@${viaIp}`, found: true, mac: hit.mac,
        device: viaIp, deviceName: null, ifIndex: hit.ifIndex, interface: null, table: hit.table
      });
    } else {
      results.push({ source: `snmp-arp-table@${viaIp}`, found: false, result: hit.error || hit.note || 'no ARP entry for this IP' });
    }
  }
  if (!viaTargets.length) {
    results.push({ source: 'snmp-arp-table', found: false, result: 'no managed device or via device to query' });
  }
  return results;
}

// Success detail fields for a per-source hit (drops nulls the old shape
// never carried, keeps the exact fields the old first-hit answers had).
function hitDetail(hit) {
  const detail = {
    device: hit.device ?? null,
    deviceName: hit.deviceName ?? null,
    ifIndex: hit.ifIndex ?? null,
    interface: hit.interface ?? null
  };
  if (hit.table) detail.table = hit.table;
  if (hit.state) detail.state = hit.state;
  if (hit.arpMethod) { detail.arpMethod = hit.arpMethod; detail.arpEntries = hit.arpEntries; }
  return detail;
}

router.post('/api/tools/mac-resolve', async (req, res) => {
  const { target = '127.0.0.1', community = 'public', via, all = false, vlan } = req.body || {};
  if (!target || typeof target !== 'string' || !target.trim()) {
    return res.status(400).json({ status: 'error', message: 'A target IP address (or managed device name) is required.' });
  }
  // mac-verify: vlan is validated up front (1-4094, else 400). It is only
  // used for Cisco community-string indexing (community@<vlan>) in the
  // Q-BRIDGE FDB walk — never probed blindly.
  let vlanNum = null;
  if (vlan !== undefined && vlan !== null && String(vlan).trim() !== '') {
    vlanNum = Number(vlan);
    if (!Number.isInteger(vlanNum) || vlanNum < 1 || vlanNum > 4094) {
      return res.status(400).json({ status: 'error', message: `Invalid vlan '${vlan}'. Expected a VLAN id between 1 and 4094.` });
    }
  }
  const { requested, address } = await resolveSnmpTarget(target.trim());
  if (!address) {
    return res.status(422).json({ status: 'error', message: `Could not resolve target '${requested}' to an IPv4 address.` });
  }
  const comm = typeof community === 'string' && community.trim() ? community.trim() : 'public';
  const wantAll = all === true || all === 'true';
  // Resolve the `via` device up front: the same device list feeds both
  // the ARP-table search (3b) and the FDB search (4). A bad `via` does
  // NOT 422 here — mac-arp's rule stands: it 422s only once the earlier
  // sources have missed (see step 3b below). Early hits still get their
  // FDB port from the managed devices, with the via failure noted.
  let viaTargets = [];
  let viaError = null;
  if (via !== undefined && via !== null && String(via).trim() !== '') {
    const v = await resolveSnmpTarget(String(via).trim());
    if (!v.address) {
      viaError = `Could not resolve 'via' device '${v.requested}' to an IPv4 address.`;
    } else {
      viaTargets = [v.address];
    }
  } else {
    for (const dev of safeListDevices()) {
      if (dev.ip && dev.ip !== address) viaTargets.push(dev.ip);
    }
  }
  // FDB port for a resolved MAC (step 4, mac-verify). arpViaIp is the
  // device whose ARP table supplied the MAC (step 3b only); earlier hits
  // pass null. A bad `via` means no FDB target was resolved — port stays
  // null and the note says why.
  const withPort = async (mac, arpViaIp) => {
    if (viaError) return { port: null, portNote: viaError };
    return resolveFdbPort(mac, comm, viaTargets, arpViaIp, vlanNum);
  };
  const results = [];
  const answer = (mac, source, detail, extra) => res.json({
    status: 'success',
    target: requested,
    resolvedIp: address,
    mac,
    vendor: null,
    vendorNote: 'No OUI/vendor database is bundled with this server, so vendor is not inferred.',
    source,
    ...detail,
    ...(extra || {}),
    timestamp: new Date().toISOString()
  });
  const attempts = () => results.map((r) => ({
    source: r.source,
    result: r.found ? `found ${r.mac}` : (r.result || 'no match')
  }));

  // 1. Stored interface rows whose stored IP is the target.
  const stored = await tryStoredInterface(address);
  results.push(stored);
  if (!wantAll && stored.found) {
    const fdb = await withPort(stored.mac, null);
    return answer(stored.mac, stored.source, hitDetail(stored), { port: fdb.port, portNote: fdb.portNote });
  }

  // 2. This host's ARP/neighbor table (ip neigh / arp -a / /proc/net/arp).
  const arp = await tryHostArpCache(address);
  results.push(arp);
  if (!wantAll && arp.found) {
    const fdb = await withPort(arp.mac, null);
    return answer(arp.mac, arp.source, hitDetail(arp), { port: fdb.port, portNote: fdb.portNote });
  }

  // 3a. The target's own MAC via live SNMP (ipAddrTable -> ifPhysAddress).
  const own = await trySnmpOwnMac(address, comm);
  results.push(own);
  if (!wantAll && own.found) {
    const fdb = await withPort(own.mac, null);
    return answer(own.mac, own.source, hitDetail(own), { port: fdb.port, portNote: fdb.portNote });
  }

  // 3b. ARP tables: an explicit `via` device, else every managed device.
  // (Kept after sources 1–3, as before: a bad `via` is a 422 only once the
  // earlier sources have missed.)
  if (viaError) {
    return res.status(422).json({ status: 'error', message: viaError });
  }
  const arpTables = await trySnmpArpTables(address, comm, viaTargets);
  results.push(...arpTables);
  const found = results.find((r) => r.found);

  // 4. Switch port for the resolved MAC via the forwarding database
  // (mac-verify). The ARP-hit device is tried first — it demonstrably
  // holds the MAC — then the explicit `via` device / every managed
  // device. `port` is null when no FDB row exists; the MAC answer is
  // still returned.
  let fdb = { port: null, portNote: null };
  if (found) {
    const arpViaIp = (found.source && found.source.startsWith('snmp-arp-table@') && found.device)
      ? found.device : null;
    fdb = await withPort(found.mac, arpViaIp);
  }

  if (wantAll) {
    if (found) return answer(found.mac, found.source, hitDetail(found), { results, port: fdb.port, portNote: fdb.portNote });
    return res.status(404).json({
      status: 'error',
      error: 'mac_not_found',
      message: `No MAC address was found for ${requested} (${address}) in any available source; nothing was fabricated.`,
      target: requested,
      resolvedIp: address,
      sourcesTried: attempts(),
      results,
      timestamp: new Date().toISOString()
    });
  }

  if (found) return answer(found.mac, found.source, hitDetail(found), { port: fdb.port, portNote: fdb.portNote });

  return res.status(404).json({
    status: 'error',
    error: 'mac_not_found',
    message: `No MAC address was found for ${requested} (${address}) in any available source; nothing was fabricated.`,
    target: requested,
    resolvedIp: address,
    sourcesTried: attempts(),
    timestamp: new Date().toISOString()
  });
});

// MAC -> SWITCH PORT — direct lookup by MAC address, no IP needed (mac-verify).
// POST /api/tools/mac-port { mac, community?, via?, vlan? }
//   mac: MAC address in any common form (aa:bb:cc:dd:ee:ff,
//   aa-bb-cc-dd-ee-ff, or aabbccddeeff) — required. community: SNMPv2c
//   community (default 'public'). via: IP or managed-device name of the
//   switch whose FDB to search; without it, every managed device is
//   tried. vlan: optional VLAN id (1-4094), see mac-resolve. Success:
//   200 with the bridge port, ifIndex and interface label. Nothing
//   found: honest 404 listing every device tried. Bad MAC / vlan: 400.
//   Unresolvable via: 422.
router.post('/api/tools/mac-port', async (req, res) => {
  const { mac, community = 'public', via, vlan } = req.body || {};
  if (!mac || typeof mac !== 'string' || !mac.trim()) {
    return res.status(400).json({ status: 'error', message: 'A MAC address is required.' });
  }
  const cleanMac = formatMac(mac.trim());
  if (!cleanMac) {
    return res.status(400).json({ status: 'error', message: `'${mac.trim()}' is not a valid 6-byte MAC address (expected aa:bb:cc:dd:ee:ff, aa-bb-cc-dd-ee-ff, or aabbccddeeff).` });
  }
  let vlanNum = null;
  if (vlan !== undefined && vlan !== null && String(vlan).trim() !== '') {
    vlanNum = Number(vlan);
    if (!Number.isInteger(vlanNum) || vlanNum < 1 || vlanNum > 4094) {
      return res.status(400).json({ status: 'error', message: `Invalid vlan '${vlan}'. Expected a VLAN id between 1 and 4094.` });
    }
  }
  const comm = typeof community === 'string' && community.trim() ? community.trim() : 'public';
  const attempts = [];
  let viaTargets = [];
  if (via !== undefined && via !== null && String(via).trim() !== '') {
    const v = await resolveSnmpTarget(String(via).trim());
    if (!v.address) {
      return res.status(422).json({ status: 'error', message: `Could not resolve 'via' device '${v.requested}' to an IPv4 address.` });
    }
    viaTargets = [v.address];
  } else {
    for (const dev of safeListDevices()) {
      if (dev.ip) viaTargets.push(dev.ip);
    }
  }
  if (!viaTargets.length) {
    return res.status(404).json({
      status: 'error',
      error: 'mac_port_not_found',
      message: `No switch port was found for MAC ${cleanMac}: no managed device or via device to query.`,
      mac: cleanMac,
      sourcesTried: [{ source: 'fdb', result: 'no managed device or via device to query' }],
      timestamp: new Date().toISOString()
    });
  }
  for (const viaIp of viaTargets) {
    const hit = await snmpFdbLookup(viaIp, cleanMac, comm, vlanNum);
    if (hit.found) {
      return res.json({
        status: 'success',
        mac: cleanMac,
        device: viaIp,
        table: hit.table,
        vlan: hit.vlan ?? null,
        bridgePort: hit.bridgePort,
        ifIndex: hit.ifIndex,
        interface: hit.interface,
        note: hit.note || null,
        timestamp: new Date().toISOString()
      });
    }
    attempts.push({ source: `fdb@${viaIp}`, result: hit.error || hit.note || 'MAC not in forwarding database' });
  }
  return res.status(404).json({
    status: 'error',
    error: 'mac_port_not_found',
    message: `No switch port was found for MAC ${cleanMac} in any forwarding database queried; nothing was fabricated.`,
    mac: cleanMac,
    sourcesTried: attempts,
    timestamp: new Date().toISOString()
  });
});

// Test hooks (no production effect): the ARP parsers and the multi-source
// reader, so a node smoke test can prove them without HTTP.
router.macArpHelpers = { formatMac, parseIpNeighLine, parseArpALine, parseProcNetArp, readHostArpCache, arpMethodsSummary, macOidSuffix, snmpFdbLookup };

module.exports = router;
