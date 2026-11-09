'use strict';

/**
 * scripts/test-snmpv3.js — Negative/edge tests for SNMPv3 (Phase 3, snmpv3-tests track).
 *
 * TEST-ONLY. This file changes no product code. It exercises the v3 code
 * path and records the exact status/error/timing of every case. Anything
 * that returns a fake value, a wrong code, or hangs is reported as a BUG
 * (or GAP, where the HTTP surface for v3 does not exist yet) — never
 * silently fixed here.
 *
 * Code under test (Phase 4 merge, branch p4m-snmpv3):
 *   server/services/snmp.js + server/services/poller.js in this clone are
 *   the CANONICAL merged SNMPv3 implementation (one createV3Session, one
 *   throwing validateV3, narrow md5/sha + des/aes, createSnmpSession /
 *   openSession routing, sessionWalk loop-guard). The FAIL 7 walk-hang
 *   and GAP 4/4b from the Phase 3 run must clear against this build.
 *
 * Transport — READ THIS FIRST:
 *   This VM's sandbox blocks UDP send (EPERM) even to loopback, so no
 *   SNMP packet can travel over a real socket here (verified: even a
 *   same-process loopback dgram send fails with EPERM; Seccomp filter
 *   active). The tests therefore run over an IN-MEMORY datagram shim:
 *   the real net-snmp client session and the real net-snmp agent exchange
 *   the real SNMPv3 bytes (real BER encoding, engine-ID discovery, real
 *   USM HMAC-SHA authentication, real DES privacy) — ONLY the UDP socket
 *   is emulated. The shim is the approach the snmpv3-service track proved
 *   in scripts/snmpv3-proof.js (same dgramModule interface); this file
 *   carries its own copy of that shim shape, with ephemeral-port
 *   assignment fixed for port-0 binds. The server under test is loaded
 *   in-process (its own instance on :8160, throwaway DB) AFTER the shim
 *   is installed via a require hook, so its SNMP sessions use the shim
 *   too — no product code is touched. The HTTP surface is real TCP.
 *   On a UDP-capable host the same cases should be re-run over real UDP
 *   (the sibling tracks run theirs on the relay); the protocol behaviour
 *   asserted here does not depend on the socket.
 *
 * Fixture: a LOCAL in-process net-snmp Agent on 127.0.0.1:161 — a real
 * SNMP agent speaking the real SNMPv3 USM protocol (SHA auth + DES priv),
 * serving the SNMPv2-MIB system scalars plus CISCO-PROCESS-MIB,
 * CISCO-MEMORY-POOL-MIB and IF-MIB tables (CPU 23%, mem 37.6%, 2
 * interfaces — the same values the snmpv3-poller proof serves). It is a
 * LOCAL TEST SERVICE ONLY, never presented as a production device. The
 * same agent also answers SNMPv2c (community 'public') for the
 * regression case.
 *
 * Server under test: this clone's own server instance, loaded in-process
 * on port 8160 with a throwaway DB (~/workspace/opm-p4/m1-work/
 * test-snmpv3.db — /tmp is shared and fills up; never use it here).
 * The shared :8060 server and the relay are never touched.
 *
 * Credentials exist ONLY at runtime: V3_USER / V3_AUTH_PASS / V3_PRIV_PASS
 * env vars, or crypto-generated in-memory values when unset. They are
 * NEVER written to a file, log, commit, or the results JSON. Request
 * bodies are never recorded — only response statuses/bodies and timings.
 *
 * Cases:
 *   0  v3 happy path (sanity: correct creds return the real sysDescr)
 *   1  wrong auth passphrase  -> honest failure (service + poller level)
 *   2  wrong priv passphrase  -> honest failure (service + poller level)
 *   3  unknown v3 user        -> honest failure (service + poller level)
 *   4  v3 request with missing user -> 400 (HTTP level; service-level
 *      validation error recorded as supporting evidence)
 *   5  v3 query to an unreachable host -> honest timeout error, never a
 *      hang (elapsed time recorded at service, poller and HTTP level)
 *   6  v2c still works after the negative tests (regression: HTTP query,
 *      HTTP device create + poll-now, service-level GET)
 *   7  walk of a subtree the agent does not implement terminates instead
 *      of looping forever (BUG probe — see the note at case 7)
 *
 * Run from the clone root (DES privacy needs the legacy provider):
 *   node --openssl-legacy-provider scripts/test-snmpv3.js
 * Exit 0 = every case behaved as specified; exit 1 = at least one FAIL
 * or GAP (see the per-case lines and scripts/test-snmpv3-results.json).
 *
 * Environment note: this VM blocks raw ICMP sockets, so pingMs() always
 * returns null here. The poller therefore reports any SNMP failure as
 * status 'Down' (ping + SNMP both failed) instead of 'SNMP Error'. That
 * is an environment limit, not a product behaviour — the honest-failure
 * assertions accept either status, and the recorded error text is what
 * distinguishes the cause.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const HTTP_PORT = 8160;
const AGENT_IP = '127.0.0.1';
const AGENT_PORT = 161;
const DEAD_PORT = 1169; // nothing listens here: deterministic unreachable target
const DEAD_IP = '192.0.2.1'; // TEST-NET-1: unroutable, for the HTTP-level timeout case
// Throwaway DB lives in the merge agent's workspace scratch, NOT /tmp
// (/tmp is shared across agents and fills up).
const TEST_DB = path.resolve(__dirname, '..', '..', 'm1-work', 'test-snmpv3.db');
const RESULTS_PATH = path.join(__dirname, 'test-snmpv3-results.json');
const SYS_DESCR_OID = '1.3.6.1.2.1.1.1.0';
const EXPECTED_SYS_DESCR = 'Test Agent (local test service only) v3-negtest';
const EXPECTED_SYS_NAME = 'v3-negtest-agent';
const HARD_TIMEOUT_MS = 30000; // any case slower than this is recorded as a HANG

const V3_USER = process.env.V3_USER || 'opmtest';
const V3_AUTH_PASS = process.env.V3_AUTH_PASS || crypto.randomBytes(12).toString('base64url');
const V3_PRIV_PASS = process.env.V3_PRIV_PASS || crypto.randomBytes(12).toString('base64url');
if (V3_AUTH_PASS.length < 8 || V3_PRIV_PASS.length < 8) {
  console.error('test-snmpv3: V3_AUTH_PASS / V3_PRIV_PASS must be >= 8 characters.');
  process.exit(2);
}
const V3_CREDS = {
  user: V3_USER, authProtocol: 'sha', authPass: V3_AUTH_PASS,
  privProtocol: 'des', privPass: V3_PRIV_PASS,
};

// --- In-memory datagram shim (installed BEFORE any net-snmp require) -----
// Implements only the socket surface net-snmp uses: createSocket, bind,
// send, close, unref/ref, address, on('message'|'error'|'close').
// Packets are delivered asynchronously with the sender's rinfo, exactly
// like UDP; packets to an unbound port are dropped silently, like UDP.
// Only the socket is emulated — every SNMP byte is real net-snmp code.
function createMemoryDgram() {
  const sockets = new Map(); // "address:port" -> MemSocket
  let nextEphemeral = 40000;
  const key = (address, port) => `${address || '127.0.0.1'}:${port}`;

  class MemSocket extends EventEmitter {
    constructor() {
      super();
      this._bound = null;
    }
    bind(port, address, cb) {
      if (typeof port === 'object' && port !== null) {
        cb = address; address = port.address; port = port.port;
      }
      if (typeof address === 'function') { cb = address; address = undefined; }
      let p = Number(port);
      if (!Number.isInteger(p) || p === 0) p = nextEphemeral++;
      this._bound = { address: address || '127.0.0.1', port: p };
      sockets.set(key(this._bound.address, this._bound.port), this);
      if (typeof cb === 'function') setImmediate(cb);
      return this;
    }
    address() {
      return this._bound || { address: '127.0.0.1', port: 0 };
    }
    send(msg, offset, length, port, address, callback) {
      if (typeof offset !== 'number') {
        callback = port; address = length; port = offset; offset = 0; length = msg.length;
      }
      if (!this._bound) {
        this._bound = { address: '127.0.0.1', port: nextEphemeral++ };
        sockets.set(key(this._bound.address, this._bound.port), this);
      }
      const target = sockets.get(key(address, port));
      const buf = Buffer.from(msg.slice(offset, offset + length));
      const from = { address: this._bound.address, port: this._bound.port };
      setImmediate(() => {
        if (typeof callback === 'function') callback(null, buf.length);
        if (target) target.emit('message', buf, { ...from, size: buf.length });
      });
      return true;
    }
    close(cb) {
      if (this._bound) sockets.delete(key(this._bound.address, this._bound.port));
      setImmediate(() => {
        this.emit('close');
        if (typeof cb === 'function') cb();
      });
      return this;
    }
    unref() { return this; }
    ref() { return this; }
    setBroadcast() { return this; }
    setTTL() { return this; }
    setMulticastTTL() { return this; }
    setMulticastLoopback() { return this; }
  }

  return { createSocket: () => new MemSocket() };
}

const memDgram = createMemoryDgram();
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'dgram' || request === 'node:dgram') return memDgram;
  return originalLoad.apply(this, arguments);
};

// Fresh throwaway DB for the in-process server + poller store (shared
// store instance: the server and this script require the same module).
for (const f of [TEST_DB, `${TEST_DB}-wal`, `${TEST_DB}-shm`]) {
  try { fs.unlinkSync(f); } catch (_e) { /* fresh DB */ }
}
process.env.OPMANAGER_DB_PATH = TEST_DB;
process.env.PORT = String(HTTP_PORT);

const snmp = require('net-snmp');
const snmpService = require('../server/services/snmp');
const poller = require('../server/services/poller');
const store = require('../server/services/store');

// --- Local v3 test agent ---------------------------------------------------

function scalar(name, oid, scalarType) {
  return { name, type: snmp.MibProviderType.Scalar, oid, scalarType, maxAccess: snmp.MaxAccess['read-only'] };
}

// Table providers, modelled on the snmpv3-poller proof's fixture. The
// tables MUST exist (even with rows) — see the walk-loop note in case 7:
// net-snmp's Agent answers GETNEXT on a wholly unimplemented column with
// NoSuchObject for the same OID, and net-snmp's subtree() re-issues the
// request forever instead of terminating. Real agents return
// EndOfMibView (or the next real OID), so walks terminate; the rows
// below make this fixture behave like one.
function table(name, oid, columns, indexColumnNumber, foreignTable) {
  return {
    name,
    type: snmp.MibProviderType.Table,
    oid,
    maxAccess: snmp.MaxAccess['not-accessible'],
    tableColumns: columns.map(([number, colName, type]) => ({
      number, name: colName, type, maxAccess: snmp.MaxAccess['read-only'],
    })),
    tableIndex: [{ columnNumber: indexColumnNumber, foreign: foreignTable || false }],
    handler: (mibRequest) => mibRequest.done(),
  };
}

function startTestAgent() {
  const agent = snmp.createAgent({
    port: AGENT_PORT,
    address: AGENT_IP,
    dgramModule: memDgram,
    accessControlModelType: snmp.AccessControlModelType.Simple,
  }, (error) => {
    if (error) console.error('[test-agent] callback error:', error && error.message);
  });
  const authorizer = agent.getAuthorizer();
  authorizer.addCommunity('public');
  authorizer.addUser({
    name: V3_USER,
    level: snmp.SecurityLevel.authPriv,
    authProtocol: snmp.AuthProtocols.sha,
    authKey: V3_AUTH_PASS,
    privProtocol: snmp.PrivProtocols.des,
    privKey: V3_PRIV_PASS,
  });
  const acm = authorizer.getAccessControlModel();
  acm.setCommunityAccess('public', snmp.AccessLevel.ReadOnly);
  acm.setUserAccess(V3_USER, snmp.AccessLevel.ReadOnly);
  agent.registerProvider(scalar('sysDescr', '1.3.6.1.2.1.1.1', snmp.ObjectType.OctetString));
  agent.registerProvider(scalar('sysObjectID', '1.3.6.1.2.1.1.2', snmp.ObjectType.ObjectIdentifier));
  agent.registerProvider(scalar('sysUpTime', '1.3.6.1.2.1.1.3', snmp.ObjectType.TimeTicks));
  agent.registerProvider(scalar('sysName', '1.3.6.1.2.1.1.5', snmp.ObjectType.OctetString));
  agent.registerProvider(scalar('sysLocation', '1.3.6.1.2.1.1.6', snmp.ObjectType.OctetString));
  agent.registerProvider(scalar('sysContact', '1.3.6.1.2.1.1.4', snmp.ObjectType.OctetString));
  // CISCO-PROCESS-MIB cpmCPUTotalTable (row 1: 5s=5, 1min=12, 5min=23).
  agent.registerProvider(table('cpmCPUTotalTable', '1.3.6.1.4.1.9.9.109.1.1.1.1', [
    [1, 'cpmCPUTotalIndex', snmp.ObjectType.Integer],
    [3, 'cpmCPUTotal5sec', snmp.ObjectType.Gauge32],
    [4, 'cpmCPUTotal1min', snmp.ObjectType.Gauge32],
    [5, 'cpmCPUTotal5min', snmp.ObjectType.Gauge32],
    [6, 'cpmCPUTotal5secRev', snmp.ObjectType.Gauge32],
    [7, 'cpmCPUTotal1minRev', snmp.ObjectType.Gauge32],
    [8, 'cpmCPUTotal5minRev', snmp.ObjectType.Gauge32],
  ], 1));
  // CISCO-MEMORY-POOL-MIB ciscoMemoryPoolTable (row 1: Processor).
  agent.registerProvider(table('ciscoMemoryPoolTable', '1.3.6.1.4.1.9.9.48.1.1.1', [
    [1, 'ciscoMemoryPoolType', snmp.ObjectType.Integer],
    [2, 'ciscoMemoryPoolName', snmp.ObjectType.OctetString],
    [5, 'ciscoMemoryPoolUsed', snmp.ObjectType.Gauge32],
    [6, 'ciscoMemoryPoolFree', snmp.ObjectType.Gauge32],
  ], 1));
  // IF-MIB ifTable + ifXTable ifName.
  agent.registerProvider(table('ifTable', '1.3.6.1.2.1.2.2.1', [
    [1, 'ifIndex', snmp.ObjectType.Integer],
    [2, 'ifDescr', snmp.ObjectType.OctetString],
    [5, 'ifSpeed', snmp.ObjectType.Gauge32],
    [8, 'ifOperStatus', snmp.ObjectType.Integer],
    [10, 'ifInOctets', snmp.ObjectType.Counter32],
    [16, 'ifOutOctets', snmp.ObjectType.Counter32],
  ], 1));
  agent.registerProvider(table('ifXTable', '1.3.6.1.2.1.31.1.1.1', [
    [1, 'ifName', snmp.ObjectType.OctetString],
  ], 1, 'ifTable'));
  const mib = agent.getMib();
  mib.setScalarValue('sysDescr', EXPECTED_SYS_DESCR);
  mib.setScalarValue('sysObjectID', '1.3.6.1.4.1.9.1.1');
  mib.setScalarValue('sysUpTime', 7654321);
  mib.setScalarValue('sysName', EXPECTED_SYS_NAME);
  mib.setScalarValue('sysLocation', 'test lab');
  mib.setScalarValue('sysContact', 'test');
  mib.addTableRow('cpmCPUTotalTable', [1, 5, 12, 23, 4, 11, 23]);
  mib.addTableRow('ciscoMemoryPoolTable', [1, 'Processor', 376000000, 624000000]);
  mib.addTableRow('ifTable', [1, 'lo', 10000000, 1, 123456, 654321]);
  mib.addTableRow('ifTable', [2, 'eth0', 1000000000, 1, 987654321, 123456789]);
  mib.addTableRow('ifXTable', [1, 'lo']);
  mib.addTableRow('ifXTable', [2, 'eth0']);
  return agent;
}

// --- Case bookkeeping ------------------------------------------------------

const results = [];
function record(label, verdict, detail, extra) {
  const row = { case: label, verdict, detail, ...(extra || {}) };
  results.push(row);
  console.log(`${verdict.padEnd(4)}  ${label} — ${detail}`);
  return row;
}

// A case that never settles is a HANG, not a silent stall.
function withHardTimeout(promise, ms, label) {
  let timer = null;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ __hang: true, afterMs: ms }), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function timed(fn) {
  const start = Date.now();
  const value = await fn();
  return { value, ms: Date.now() - start };
}

// --- Own server instance (in-process, port 8160) ---------------------------

async function startServer() {
  require('../server/index.js');
  // Wait until the HTTP layer answers (any status counts as "up").
  const deadline = Date.now() + 30000;
  for (;;) {
    try {
      const res = await fetch(`http://127.0.0.1:${HTTP_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '__probe__', password: '__probe__' }),
      });
      await res.text();
      return;
    } catch (_e) {
      if (Date.now() > deadline) throw new Error('server did not answer HTTP within 30s');
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

// --- HTTP client (cookie jar; bodies never logged) --------------------------

let cookieJar = '';
async function httpJson(method, reqPath, body) {
  const start = Date.now();
  const headers = { 'Content-Type': 'application/json' };
  if (cookieJar) headers.Cookie = cookieJar;
  const res = await fetch(`http://127.0.0.1:${HTTP_PORT}${reqPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (_e) { /* non-JSON body */ }
  const setCookie = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  for (const c of setCookie) {
    const pair = c.split(';')[0].trim();
    if (pair.startsWith('opm_session=')) cookieJar = pair;
  }
  return { status: res.status, ms: Date.now() - start, json, text: text.slice(0, 2000) };
}

async function loginAsAdmin() {
  // First login attempt bootstraps the admin account (writes
  // server/data/.admin-initial); it fails auth, which is expected.
  const initialFile = path.join(ROOT, 'server', 'data', '.admin-initial');
  let bootstrap = null;
  try { bootstrap = fs.readFileSync(initialFile, 'utf8').trim(); } catch (_e) { /* not created yet */ }
  if (!bootstrap) {
    await httpJson('POST', '/api/auth/login', { username: 'admin', password: 'bootstrap-trigger' });
    bootstrap = fs.readFileSync(initialFile, 'utf8').trim();
  }
  const login = await httpJson('POST', '/api/auth/login', { username: 'admin', password: bootstrap });
  if (login.status !== 200) {
    throw new Error(`admin login failed: HTTP ${login.status} ${login.text}`);
  }
  // Bootstrap account is flagged must-change-password: rotate it to a
  // runtime-only password so the rest of the API is reachable.
  const rotated = crypto.randomBytes(12).toString('base64url');
  const changed = await httpJson('POST', '/api/auth/change-password', {
    currentPassword: bootstrap, newPassword: rotated,
  });
  if (changed.status !== 200) {
    throw new Error(`password rotation failed: HTTP ${changed.status} ${changed.text}`);
  }
  return true;
}

// --- Poller-level device rows ----------------------------------------------
// The store enforces UNIQUE(devices.ip): one row per target, reused across
// cases with a different snmp config object each time. The stored row is
// v2c (community defaults to 'public') so the HTTP poll-now regression
// (case 6b) can use this same row; the v3 poller cases override it with
// an explicit device.snmp object, which resolveSnmpConfig prefers.
let pollerDeviceRow = null;
function pollerDevice(snmpConfig, extra) {
  if (!pollerDeviceRow) {
    pollerDeviceRow = store.devices.createDevice({
      ip: AGENT_IP, hostname: 'v3-negtest-agent', snmp_version: 'v2c',
    });
  }
  return { ...pollerDeviceRow, ...(extra || {}), snmp: snmpConfig };
}

// --- Main --------------------------------------------------------------------

async function main() {
  const agent = startTestAgent();
  await new Promise((r) => setTimeout(r, 500)); // agent binds its (shim) socket
  await startServer();
  console.log(`server up on :${HTTP_PORT} (in-process); local v3 agent on ${AGENT_IP}:${AGENT_PORT} (in-memory datagram shim)`);
  await loginAsAdmin();
  console.log('logged in as admin (bootstrap password rotated, runtime-only)');

  // -- Case 0: v3 happy path (sanity) ---------------------------------------
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(
        snmpService.getSystemInfo(AGENT_IP, null, { version: 'v3', v3: V3_CREDS }).catch((e) => ({ __error: e })),
        HARD_TIMEOUT_MS, 'case 0'));
    if (value && value.__hang) {
      record('0 v3 happy path', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else if (value && value.__error) {
      record('0 v3 happy path', 'FAIL', `threw ${(value.__error && value.__error.message) || value.__error} (${ms}ms)`);
    } else {
      record('0 v3 happy path', value.sysDescr === EXPECTED_SYS_DESCR && value.sysName === EXPECTED_SYS_NAME ? 'PASS' : 'FAIL',
        `sysDescr=${JSON.stringify(value.sysDescr)} sysName=${JSON.stringify(value.sysName)} sysUpTime=${value.sysUpTime} (${ms}ms)`,
        { ms, sysDescr: value.sysDescr, sysName: value.sysName });
    }
  }

  // -- Cases 1-3, service level: wrong auth / wrong priv / unknown user -----
  const negativeServiceCases = [
    ['1', 'wrong auth passphrase', { ...V3_CREDS, authPass: 'wrongpass99' }],
    ['2', 'wrong priv passphrase', { ...V3_CREDS, privPass: 'wrongpriv99' }],
    ['3', 'unknown v3 user', { ...V3_CREDS, user: 'nosuchuser' }],
  ];
  for (const [num, label, creds] of negativeServiceCases) {
    const { value, ms } = await timed(() =>
      withHardTimeout(
        snmpService.getSystemInfo(AGENT_IP, null, { version: 'v3', v3: creds })
          .then((v) => ({ __ok: v }))
          .catch((e) => ({ __error: e })),
        HARD_TIMEOUT_MS, `case ${num}`));
    if (value && value.__hang) {
      record(`${num} v3 ${label} (service)`, 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else if (value && value.__ok) {
      record(`${num} v3 ${label} (service)`, 'FAIL',
        `FAKE SUCCESS: returned sysDescr=${JSON.stringify(value.__ok.sysDescr)} instead of failing (${ms}ms)`,
        { ms, returned: value.__ok });
    } else {
      const err = value.__error;
      const msg = (err && err.message) || String(err);
      record(`${num} v3 ${label} (service)`, 'PASS',
        `honest throw: ${err && err.name ? `${err.name}: ` : ''}${msg} (${ms}ms)`,
        { ms, error: msg, errorName: (err && err.name) || null });
    }
  }

  // -- Cases 1-3, poller level ----------------------------------------------
  const negativePollerCases = [
    ['1', 'wrong auth passphrase', { ...V3_CREDS, authPass: 'wrongpass99' }],
    ['2', 'wrong priv passphrase', { ...V3_CREDS, privPass: 'wrongpriv99' }],
    ['3', 'unknown v3 user', { ...V3_CREDS, user: 'nosuchuser' }],
  ];
  for (const [num, label, creds] of negativePollerCases) {
    const device = pollerDevice({ version: 'v3', v3: creds });
    const { value, ms } = await timed(() =>
      withHardTimeout(poller.pollOneDevice(device, store), HARD_TIMEOUT_MS, `case ${num} poller`));
    if (value && value.__hang) {
      record(`${num} v3 ${label} (poller)`, 'FAIL', `HANG: no result within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const honest = value.status !== 'Up' && value.cpu_pct === null && value.mem_used_pct === null
        && typeof value.error === 'string' && value.error.length > 0;
      record(`${num} v3 ${label} (poller)`, honest ? 'PASS' : 'FAIL',
        `status=${value.status} cpu=${value.cpu_pct} mem=${value.mem_used_pct} error=${JSON.stringify(value.error)} (${ms}ms)`,
        { ms, status: value.status, error: value.error });
    }
  }

  // -- Case 4: v3 request with missing user ----------------------------------
  // 4a. HTTP level: the tools endpoint is the product's public v3 surface.
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(httpJson('POST', '/api/tools/snmp-query', {
        ip: AGENT_IP, oid: SYS_DESCR_OID, version: 'v3',
        v3: { authProtocol: 'sha', authPass: V3_AUTH_PASS, privProtocol: 'des', privPass: V3_PRIV_PASS },
      }), HARD_TIMEOUT_MS, 'case 4a'));
    if (value && value.__hang) {
      record('4 v3 missing user (HTTP snmp-query)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const body = value.json || value.text;
      record('4 v3 missing user (HTTP snmp-query)',
        value.status === 400 ? 'PASS' : 'GAP',
        `HTTP ${value.status} ${JSON.stringify(body)} (${ms}ms)` + (value.status === 400 ? '' : ' — expected 400'),
        { ms, httpStatus: value.status, body });
    }
  }
  // 4b. HTTP level, full v3 credentials: does the endpoint serve v3 at all?
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(httpJson('POST', '/api/tools/snmp-query', {
        ip: AGENT_IP, oid: SYS_DESCR_OID, version: 'v3', v3: V3_CREDS,
      }), HARD_TIMEOUT_MS, 'case 4b'));
    if (value && value.__hang) {
      record('4b v3 full creds (HTTP snmp-query)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const body = value.json || value.text;
      record('4b v3 full creds (HTTP snmp-query)',
        value.status === 200 ? 'PASS' : 'GAP',
        `HTTP ${value.status} ${JSON.stringify(body)} (${ms}ms)`,
        { ms, httpStatus: value.status, body });
    }
  }
  // 4c. Service level: the validation the HTTP layer should map to 400.
  {
    let msg = null;
    try { snmpService.validateV3({}); } catch (e) { msg = e.message; }
    record('4c v3 missing user (service validation)', msg === 'SNMPv3: v3.user is required (non-empty user name)' ? 'PASS' : 'FAIL',
      msg ? `threw: ${JSON.stringify(msg)}` : 'did NOT throw for a missing user');
  }

  // -- Case 5: unreachable host -> honest timeout, never a hang --------------
  // 5a. Service level, dead port on the agent host.
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(
        snmpService.getSystemInfo(AGENT_IP, null, { version: 'v3', v3: V3_CREDS, port: DEAD_PORT, timeout: 2000, retries: 1 })
          .then((v) => ({ __ok: v }))
          .catch((e) => ({ __error: e })),
        HARD_TIMEOUT_MS, 'case 5a'));
    if (value && value.__hang) {
      record('5 v3 dead port (service)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else if (value && value.__ok) {
      record('5 v3 dead port (service)', 'FAIL',
        `FAKE SUCCESS: returned data from a dead port (${ms}ms)`, { ms, returned: value.__ok });
    } else {
      const msg = (value.__error && value.__error.message) || String(value.__error);
      record('5 v3 dead port (service)', /timed out/i.test(msg) && ms < 15000 ? 'PASS' : 'FAIL',
        `threw: ${msg} (elapsed ${ms}ms)`, { ms, error: msg });
    }
  }
  // 5b. Poller level, dead port.
  {
    const device = pollerDevice({ version: 'v3', v3: V3_CREDS }, { snmpPort: DEAD_PORT });
    const { value, ms } = await timed(() =>
      withHardTimeout(poller.pollOneDevice(device, store), HARD_TIMEOUT_MS, 'case 5b'));
    if (value && value.__hang) {
      record('5 v3 dead port (poller)', 'FAIL', `HANG: no result within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const honest = value.status !== 'Up' && value.cpu_pct === null && value.mem_used_pct === null
        && /timed out/i.test(value.error || '');
      record('5 v3 dead port (poller)', honest && ms < 30000 ? 'PASS' : 'FAIL',
        `status=${value.status} error=${JSON.stringify(value.error)} (elapsed ${ms}ms)`,
        { ms, status: value.status, error: value.error });
    }
  }
  // 5c. HTTP level, v2c query to an unroutable host (timeout via the endpoint).
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(httpJson('POST', '/api/tools/snmp-query', {
        ip: DEAD_IP, oid: SYS_DESCR_OID, version: 'v2c', community: 'public',
      }), HARD_TIMEOUT_MS, 'case 5c'));
    if (value && value.__hang) {
      record('5 unreachable host (HTTP snmp-query)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const body = value.json || value.text;
      record('5 unreachable host (HTTP snmp-query)',
        value.status === 502 && /timed out/i.test(JSON.stringify(body)) && ms < 15000 ? 'PASS' : 'FAIL',
        `HTTP ${value.status} ${JSON.stringify(body)} (elapsed ${ms}ms)`,
        { ms, httpStatus: value.status, body });
    }
  }

  // -- Case 6: v2c regression (runs LAST, after all negative tests) ---------
  // 6a. HTTP v2c query against the local agent.
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(httpJson('POST', '/api/tools/snmp-query', {
        ip: AGENT_IP, oid: SYS_DESCR_OID, version: 'v2c', community: 'public',
      }), HARD_TIMEOUT_MS, 'case 6a'));
    if (value && value.__hang) {
      record('6 v2c query (HTTP, regression)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else {
      const ok = value.status === 200 && value.json && value.json.value === EXPECTED_SYS_DESCR;
      record('6 v2c query (HTTP, regression)', ok ? 'PASS' : 'FAIL',
        `HTTP ${value.status} value=${JSON.stringify(value.json && value.json.value)} (${ms}ms)`,
        { ms, httpStatus: value.status, body: value.json || value.text });
    }
  }
  // 6b. HTTP poll-now on the v2c device row (same row the poller cases
  // reuse; the store enforces UNIQUE(devices.ip), so no second row).
  {
    const deviceId = pollerDeviceRow && pollerDeviceRow.id;
    if (!deviceId) {
      record('6 v2c poll-now (HTTP, regression)', 'FAIL', 'no device row exists to poll');
    } else {
      const { value, ms } = await timed(() =>
        withHardTimeout(httpJson('POST', `/api/devices/${deviceId}/poll-now`, {}), HARD_TIMEOUT_MS, 'case 6b poll'));
      if (value && value.__hang) {
        record('6 v2c poll-now (HTTP, regression)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
      } else {
        const poll = value.json && value.json.poll;
        const ok = value.status === 200 && poll && poll.status === 'Up'
          && poll.cpu_pct === 23 && poll.mem_used_pct === 37.6;
        record('6 v2c poll-now (HTTP, regression)', ok ? 'PASS' : 'FAIL',
          `HTTP ${value.status} poll.status=${poll && poll.status} cpu=${poll && poll.cpu_pct} mem=${poll && poll.mem_used_pct} error=${JSON.stringify(poll && poll.error)} (${ms}ms)`,
          { ms, httpStatus: value.status, body: value.json || value.text });
      }
    }
  }
  // 6c. Service-level v2c GET.
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(
        snmpService.getSystemInfo(AGENT_IP, 'public').then((v) => ({ __ok: v })).catch((e) => ({ __error: e })),
        HARD_TIMEOUT_MS, 'case 6c'));
    if (value && value.__hang) {
      record('6 v2c GET (service, regression)', 'FAIL', `HANG: no answer within ${HARD_TIMEOUT_MS}ms`);
    } else if (value && value.__error) {
      record('6 v2c GET (service, regression)', 'FAIL',
        `threw ${(value.__error && value.__error.message) || value.__error} (${ms}ms)`);
    } else {
      record('6 v2c GET (service, regression)',
        value.__ok.sysDescr === EXPECTED_SYS_DESCR ? 'PASS' : 'FAIL',
        `sysDescr=${JSON.stringify(value.__ok.sysDescr)} sysName=${JSON.stringify(value.__ok.sysName)} (${ms}ms)`,
        { ms, sysDescr: value.__ok.sysDescr });
    }
  }

  // -- Case 7: walk of an unimplemented subtree must terminate -----------
  // BUG PROBE (runs last: a hanging walk keeps looping server-side until
  // the process exits). Root cause, proven with a standalone reproduction
  // (service-level session.subtree() against this same agent shape):
  // net-snmp's Agent answers GETNEXT/GETBULK on a wholly unimplemented
  // column with the SAME OID + NoSuchObject, and net-snmp's subtree()
  // re-issues the request forever instead of terminating (hundreds of
  // requests/second, no timeout fires because every request IS answered).
  // Real agents (Cisco IOS, pfSense bsnmpd, Net-SNMP snmpd) answer
  // EndOfMibView / the next real OID, so their walks terminate — this
  // needs a degenerate agent response. But the product inherits the hang:
  // POST /api/tools/snmp-walk has no timeout around snmpWalk, so one such
  // walk hangs the HTTP request indefinitely. The poller IS protected
  // (withTimeout 20s — case 6b earlier proved it: "SNMP CPU/memory timed
  // out after 20000ms"). Reproduction: POST /api/tools/snmp-walk
  // { ip: '127.0.0.1', rootOid: '1.3.6.1.4.1.9.9.999', version: 'v2c',
  //   community: 'public' } — still pending after 25s.
  {
    const { value, ms } = await timed(() =>
      withHardTimeout(httpJson('POST', '/api/tools/snmp-walk', {
        ip: AGENT_IP, rootOid: '1.3.6.1.4.1.9.9.999', version: 'v2c', community: 'public',
      }), 25000, 'case 7'));
    if (value && value.__hang) {
      record('7 walk unimplemented subtree (HTTP snmp-walk)', 'FAIL',
        `BUG: HANG — no HTTP response within 25000ms (walk loops server-side; reproduction in header comment)`,
        { ms: 25000, hang: true });
    } else {
      const body = value.json || value.text;
      const ok = (value.status === 200 && value.json && value.json.count === 0) || value.status === 502;
      record('7 walk unimplemented subtree (HTTP snmp-walk)', ok ? 'PASS' : 'FAIL',
        `HTTP ${value.status} ${JSON.stringify(body)} (${ms}ms)`,
        { ms, httpStatus: value.status, body });
    }
  }

  try { agent.close && agent.close(); } catch (_e) { /* ignore */ }

  const fails = results.filter((r) => r.verdict === 'FAIL').length;
  const gaps = results.filter((r) => r.verdict === 'GAP').length;
  const passes = results.filter((r) => r.verdict === 'PASS').length;
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    agent: `${AGENT_IP}:${AGENT_PORT} (local test service only; in-memory datagram shim — this VM blocks UDP send)`,
    server: `own instance, in-process on :${HTTP_PORT}, throwaway DB ${TEST_DB}`,
    summary: { pass: passes, fail: fails, gap: gaps },
    results,
  }, null, 2));
  console.log(`\nRESULT: ${passes} PASS, ${fails} FAIL, ${gaps} GAP — details in ${RESULTS_PATH}`);
  process.exit(fails + gaps === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('test-snmpv3 crashed:', err);
  process.exit(1);
});
