'use strict';

/**
 * snmpv3-proof.js — end-to-end proof for the SNMPv3 service in
 * server/services/snmp.js.
 *
 * What it proves, against a REAL in-process net-snmp Agent (SNMPv2-MIB
 * providers, real BER encoding, real USM HMAC-MD5/SHA authentication and
 * real DES/AES privacy — no canned answers anywhere):
 *   1. getSystemInfoV3 returns the agent's exact system scalars for all
 *      five USM shapes: noAuthNoPriv, authNoPriv/MD5, authNoPriv/SHA,
 *      authPriv/MD5+DES, authPriv/SHA+AES.
 *   2. snmpWalkV3 walks the system group and returns the exact sysDescr.
 *   3. getCpuMemV3 / getInterfacesV3 return EXACT computed values from
 *      real table rows served by the agent (CPU 7%, memory 75.0%, one
 *      interface row) — and, against a second agent with no Cisco/IF
 *      tables, honestly return nulls / [] (absent MIB, not an error).
 *      The second agent also proves the walk no-progress guard: its
 *      GETBULK answers for an unimplemented table are 20x NoSuchObject
 *      for the base OID, which used to loop subtree() forever.
 *   4. Wrong authPass / wrong privPass / unknown user return NO values.
 *      Unknown user comes back as an explicit Report-PDU error
 *      ("Unknown User Name") mapped to an honest SNMPv3 auth error.
 *      Wrong authPass / wrong privPass are silently DROPPED by the agent
 *      (RFC 3414 §3.2 — no response at all), so the client honestly
 *      reports a timeout; the proof asserts the timeout AND the
 *      agent-side evidence (digest mismatch / decrypt failure logged by
 *      the agent callback) so the timeout is proven to be an auth
 *      rejection, not a network loss.
 *   5. validateV3 validation rejects bad credential shapes before any
 *      packet is sent (short passphrase, unknown protocol, priv w/o auth,
 *      empty user) and derives the right USM security level for each
 *      shape (canonical Phase 4 merge: the old buildV3User name is
 *      deleted; validateV3 returns the normalised credential object
 *      { user, authProtocol, authPass, privProtocol, privPass, level,
 *      levelName }).
 *   6. v2c regression: getSystemInfo / snmpGet over the same agent return
 *      the same exact values (v2c path untouched).
 *
 * Transport:
 *   - Default (SNMPV3_PROOF_TRANSPORT=mem): an in-memory datagram shim
 *     (net-snmp `dgramModule` option) carries the real SNMPv3 bytes
 *     between the real net-snmp client session and the real net-snmp
 *     agent. ONLY the UDP socket is emulated, because this VM's sandbox
 *     blocks UDP send (EPERM) even to loopback — the SNMPv3 protocol
 *     exchange itself (engine-ID discovery, USM auth, DES/AES privacy)
 *     is entirely real net-snmp code on both ends.
 *   - SNMPV3_PROOF_TRANSPORT=udp: real UDP loopback to 127.0.0.1:18161
 *     (use on a UDP-capable host, e.g. the relay). Same assertions.
 *
 * Credentials: passphrases are generated fresh per run with
 * crypto.randomBytes and exist only in memory — nothing is written to
 * disk, logs, or the repo. No passphrase is ever printed.
 *
 * Usage:  node --openssl-legacy-provider scripts/snmpv3-proof.js
 *         SNMPV3_PROOF_TRANSPORT=udp node --openssl-legacy-provider scripts/snmpv3-proof.js
 * (The --openssl-legacy-provider flag is needed for the DES authPriv
 * check: Node 24 / OpenSSL 3 disables the DES cipher by default and
 * net-snmp's DES privacy fails with an honest OpenSSL error without it.
 * AES and all other checks run without the flag. The same applies to
 * the production server: DES privProtocol needs the legacy provider.)
 * Exit 0 = every check passed; exit 1 = at least one check failed.
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');
const snmp = require('net-snmp');
const svc = require('../server/services/snmp');

const AGENT_HOST = '127.0.0.1';
const AGENT_PORT = 18161;
const AGENT2_PORT = 18162; // second agent: SNMPv2-MIB only, no Cisco/IF tables
const TIMEOUT_MS = 5000;

// Exact values the proof agent serves (asserted byte-for-byte below).
const EXPECTED = {
  sysDescr: 'OpManager P3 proof agent (SNMPv3)',
  sysObjectID: '1.3.6.1.4.1.99999.1',
  sysUpTime: 12345678,
  sysName: 'p3-v3-proof',
  sysLocation: 'in-process test agent',
  sysContact: 'p3-snmpv3-service track',
};
// Exact table-row values served by agent A (asserted below).
const EXPECTED_CPU_5MIN = 7; // cpmCPUTotal5minRev.1
const EXPECTED_MEM_USED_PCT = 75.0; // Processor pool 750000 / (750000 + 250000)
const EXPECTED_IFACE = {
  ifIndex: 1,
  descr: 'GigabitEthernet0/0',
  name: 'GigabitEthernet0/0', // no ifXTable row: name falls back to descr
  operStatus: 1,
  inOctets: 123456,
  outOctets: 654321,
  speed: 1000000000,
};

// Table providers for the Cisco/IF MIBs (one row each, real values).
function ciscoTableProviders() {
  const tableHandler = (mibRequest) => { mibRequest.done(); };
  return [
    {
      name: 'cpmCPUTotalTable',
      type: snmp.MibProviderType.Table,
      oid: '1.3.6.1.4.1.9.9.109.1.1.1.1',
      maxAccess: snmp.MaxAccess['not-accessible'],
      tableColumns: [
        { number: 1, name: 'cpmCPUTotalIndex', type: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess['not-accessible'] },
        { number: 3, name: 'cpmCPUTotal5sec', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 4, name: 'cpmCPUTotal1min', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 5, name: 'cpmCPUTotal5min', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 6, name: 'cpmCPUTotal5secRev', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 7, name: 'cpmCPUTotal1minRev', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 8, name: 'cpmCPUTotal5minRev', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
      ],
      tableIndex: [{ columnNumber: 1 }],
      handler: tableHandler,
    },
    {
      name: 'ciscoMemoryPoolTable',
      type: snmp.MibProviderType.Table,
      oid: '1.3.6.1.4.1.9.9.48.1.1.1',
      maxAccess: snmp.MaxAccess['not-accessible'],
      tableColumns: [
        { number: 1, name: 'ciscoMemoryPoolIndex', type: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess['not-accessible'] },
        { number: 2, name: 'ciscoMemoryPoolName', type: snmp.ObjectType.OctetString, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 5, name: 'ciscoMemoryPoolUsed', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 6, name: 'ciscoMemoryPoolFree', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
      ],
      tableIndex: [{ columnNumber: 1 }],
      handler: tableHandler,
    },
    {
      name: 'ifTable',
      type: snmp.MibProviderType.Table,
      oid: '1.3.6.1.2.1.2.2.1',
      maxAccess: snmp.MaxAccess['not-accessible'],
      tableColumns: [
        { number: 1, name: 'ifIndex', type: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess['not-accessible'] },
        { number: 2, name: 'ifDescr', type: snmp.ObjectType.OctetString, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 5, name: 'ifSpeed', type: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 8, name: 'ifOperStatus', type: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 10, name: 'ifInOctets', type: snmp.ObjectType.Counter32, maxAccess: snmp.MaxAccess['read-only'] },
        { number: 16, name: 'ifOutOctets', type: snmp.ObjectType.Counter32, maxAccess: snmp.MaxAccess['read-only'] },
      ],
      tableIndex: [{ columnNumber: 1 }],
      handler: tableHandler,
    },
  ];
}

// --- In-memory datagram shim (net-snmp `dgramModule` shape) ----------------
// Implements only the socket surface net-snmp uses: createSocket,
// bind(port, address), send(buf, offset, length, port, address, cb),
// on('message'|'error'|'close'), close(), unref(). Packets are delivered
// asynchronously (setImmediate) with the sender's rinfo, exactly like UDP.
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
      this._bound = { address: address || '127.0.0.1', port };
      sockets.set(key(this._bound.address, this._bound.port), this);
      if (typeof cb === 'function') setImmediate(cb);
      return this;
    }
    address() {
      return this._bound || { address: '127.0.0.1', port: 0 };
    }
    send(msg, offset, length, port, address, callback) {
      // Tolerate the (msg, port, address, cb) overload too.
      if (typeof offset !== 'number') {
        callback = port;
        address = length;
        port = offset;
        offset = 0;
        length = msg.length;
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
        // No listener on that port: packet dropped silently, like UDP.
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
  }

  return { createSocket: () => new MemSocket() };
}

// --- Proof harness ---------------------------------------------------------
const results = [];
function check(label, ok, detail) {
  results.push({ label, ok: !!ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

function assertSystemInfo(label, info) {
  const diffs = [];
  for (const k of Object.keys(EXPECTED)) {
    if (info[k] !== EXPECTED[k]) diffs.push(`${k}: got ${JSON.stringify(info[k])}, want ${JSON.stringify(EXPECTED[k])}`);
  }
  check(label, diffs.length === 0, diffs.length ? diffs.join('; ') : JSON.stringify(info));
}

async function expectThrow(label, fn, pattern) {
  try {
    await fn();
    check(label, false, 'did NOT throw (returned values instead of an honest error)');
  } catch (err) {
    const msg = String((err && err.message) || err);
    check(label, !pattern || pattern.test(msg), `threw: ${msg}`);
  }
}

function expectThrowSync(label, fn, pattern) {
  try {
    fn();
    check(label, false, 'did NOT throw');
  } catch (err) {
    const msg = String((err && err.message) || err);
    check(label, !pattern || pattern.test(msg), `threw: ${msg}`);
  }
}

async function main() {
  const transport = process.env.SNMPV3_PROOF_TRANSPORT || 'mem';
  if (transport !== 'mem' && transport !== 'udp') {
    throw new Error(`SNMPV3_PROOF_TRANSPORT must be 'mem' or 'udp', got '${transport}'`);
  }
  const shim = transport === 'mem' ? createMemoryDgram() : null;
  const sessionOpts = { port: AGENT_PORT, timeout: TIMEOUT_MS, retries: 1 };
  if (shim) sessionOpts.dgramModule = shim;
  console.log(`transport=${transport} agent=${AGENT_HOST}:${AGENT_PORT}`);

  // Fresh random passphrases per run (memory only, never logged/stored).
  const authPass = crypto.randomBytes(12).toString('hex');
  const privPass = crypto.randomBytes(12).toString('hex');

  // --- Real in-process net-snmp Agents serving SNMPv2-MIB -----------------
  // Agent A (AGENT_PORT): system scalars + Cisco CPU/memory + ifTable rows.
  // Agent B (AGENT2_PORT): system scalars only — no Cisco/IF tables, so
  // its walks exercise the absent-MIB path (and the no-progress guard).
  // Agent-side evidence log: the agent callback receives the errors for
  // messages it drops (bad digest, undecryptable PDU). Captured here so
  // the wrong-credential checks can prove a client timeout was an auth
  // rejection, not a network loss.
  const agentErrors = [];
  function makeAgent(port, withTables) {
    const agentOptions = { port, address: AGENT_HOST };
    if (shim) agentOptions.dgramModule = shim;
    const ag = snmp.createAgent(agentOptions, (err) => {
      if (err) agentErrors.push({ port, message: String((err && err.message) || err) });
    });
    const st = snmp.createModuleStore();
    ag.getMib().registerProviders(st.getProvidersForModule('SNMPv2-MIB'));
    const az = ag.getAuthorizer();
    az.addCommunity('public');
    az.addUser({ name: 'p3-noauth', level: snmp.SecurityLevel.noAuthNoPriv });
    az.addUser({
      name: 'p3-auth-md5', level: snmp.SecurityLevel.authNoPriv,
      authProtocol: snmp.AuthProtocols.md5, authKey: authPass,
    });
    az.addUser({
      name: 'p3-auth-sha', level: snmp.SecurityLevel.authNoPriv,
      authProtocol: snmp.AuthProtocols.sha, authKey: authPass,
    });
    az.addUser({
      name: 'p3-priv-des', level: snmp.SecurityLevel.authPriv,
      authProtocol: snmp.AuthProtocols.md5, authKey: authPass,
      privProtocol: snmp.PrivProtocols.des, privKey: privPass,
    });
    az.addUser({
      name: 'p3-priv-aes', level: snmp.SecurityLevel.authPriv,
      authProtocol: snmp.AuthProtocols.sha, authKey: authPass,
      privProtocol: snmp.PrivProtocols.aes, privKey: privPass,
    });
    const m = ag.getMib();
    m.setScalarValue('sysDescr', EXPECTED.sysDescr);
    m.setScalarValue('sysObjectID', EXPECTED.sysObjectID);
    m.setScalarValue('sysUpTime', EXPECTED.sysUpTime);
    m.setScalarValue('sysName', EXPECTED.sysName);
    m.setScalarValue('sysLocation', EXPECTED.sysLocation);
    m.setScalarValue('sysContact', EXPECTED.sysContact);
    if (withTables) {
      m.registerProviders(ciscoTableProviders());
      m.addTableRow('cpmCPUTotalTable', [1, 3, 2, 7, 4, 3, 7]);
      m.addTableRow('ciscoMemoryPoolTable', [1, 'Processor', 750000, 250000]);
      m.addTableRow('ifTable', [1, 'GigabitEthernet0/0', 1000000000, 1, 123456, 654321]);
    }
    return ag;
  }
  const agent = makeAgent(AGENT_PORT, true);
  const agentB = makeAgent(AGENT2_PORT, false);
  // Let the agents finish binding before the first request.
  await new Promise((r) => setTimeout(r, 200));

  // --- 1. getSystemInfoV3, all five USM shapes ---------------------------
  const v3Users = [
    ['noAuthNoPriv', { user: 'p3-noauth' }],
    ['authNoPriv/MD5', { user: 'p3-auth-md5', authProtocol: 'md5', authPass }],
    ['authNoPriv/SHA', { user: 'p3-auth-sha', authProtocol: 'sha', authPass }],
    ['authPriv/MD5+DES', { user: 'p3-priv-des', authProtocol: 'md5', authPass, privProtocol: 'des', privPass }],
    ['authPriv/SHA+AES', { user: 'p3-priv-aes', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass }],
  ];
  for (const [label, v3] of v3Users) {
    const info = await svc.getSystemInfoV3(AGENT_HOST, v3, sessionOpts);
    assertSystemInfo(`getSystemInfoV3 ${label}`, info);
  }

  // --- 2. snmpWalkV3 over the system group --------------------------------
  const walked = await svc.snmpWalkV3(
    AGENT_HOST,
    { user: 'p3-priv-aes', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass },
    '1.3.6.1.2.1.1',
    sessionOpts
  );
  const descrVb = walked.find((vb) => vb.oid === '1.3.6.1.2.1.1.1.0');
  check(
    'snmpWalkV3 system group contains exact sysDescr',
    !!descrVb && descrVb.value === EXPECTED.sysDescr,
    descrVb ? `sysDescr.0=${JSON.stringify(descrVb.value)} (${walked.length} varbinds)` : `no sysDescr.0 in ${walked.length} varbinds`
  );

  // --- 3. Real table values over v3 (agent A) ------------------------------
  const cpuMem = await svc.getCpuMemV3(
    AGENT_HOST,
    { user: 'p3-priv-aes', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass },
    sessionOpts
  );
  check(
    'getCpuMemV3 exact values (CPU 7%, mem 75.0%)',
    cpuMem.cpu5min === EXPECTED_CPU_5MIN && cpuMem.memUsedPct === EXPECTED_MEM_USED_PCT,
    JSON.stringify(cpuMem)
  );
  const ifaces = await svc.getInterfacesV3(
    AGENT_HOST,
    { user: 'p3-auth-sha', authProtocol: 'sha', authPass },
    sessionOpts
  );
  const ifaceOk = Array.isArray(ifaces) && ifaces.length === 1
    && Object.keys(EXPECTED_IFACE).every((k) => ifaces[0][k] === EXPECTED_IFACE[k]);
  check('getInterfacesV3 exact interface row', ifaceOk, JSON.stringify(ifaces));

  // --- 3b. Absent Cisco MIBs -> honest nulls / [] (agent B) -----------------
  // This also proves the walk no-progress guard: agent B answers each
  // unimplemented-table GETBULK with 20x NoSuchObject for the base OID.
  const cpuMemB = await svc.getCpuMemV3(
    AGENT_HOST,
    { user: 'p3-priv-aes', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass },
    { ...sessionOpts, port: AGENT2_PORT }
  );
  check(
    'getCpuMemV3 absent Cisco MIBs -> nulls (not fake values)',
    cpuMemB.cpu5min === null && cpuMemB.memUsedPct === null,
    JSON.stringify(cpuMemB)
  );
  const ifacesB = await svc.getInterfacesV3(
    AGENT_HOST,
    { user: 'p3-auth-sha', authProtocol: 'sha', authPass },
    { ...sessionOpts, port: AGENT2_PORT }
  );
  check('getInterfacesV3 no ifTable -> []', Array.isArray(ifacesB) && ifacesB.length === 0, JSON.stringify(ifacesB));

  // --- 4. Wrong credentials return NO values -------------------------------
  // Per RFC 3414 §3.2 the agent silently drops a message whose auth
  // digest does not match (or whose PDU cannot be decrypted), so the
  // client sees a timeout. The timeout error carries the SNMPv3 note
  // (see wrapV3Error), and the agent-side log below proves the drop
  // was an auth rejection.
  await expectThrow(
    'wrong authPass -> timeout with SNMPv3 note (agent drops bad digest)',
    () => svc.getSystemInfoV3(
      AGENT_HOST,
      { user: 'p3-auth-sha', authProtocol: 'sha', authPass: '0000000000000000wrong!' },
      sessionOpts
    ),
    /Request timed out \(SNMPv3 note: a timeout can also mean the device silently dropped the request/
  );
  check(
    'agent logged digest mismatch for wrong authPass',
    agentErrors.some((e) => /does not match digest/.test(e.message)),
    JSON.stringify(agentErrors.map((e) => e.message))
  );
  await expectThrow(
    'wrong privPass -> timeout with SNMPv3 note (agent cannot decrypt)',
    () => svc.getSystemInfoV3(
      AGENT_HOST,
      { user: 'p3-priv-aes', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass: '0000000000000000wrong!' },
      sessionOpts
    ),
    /Request timed out \(SNMPv3 note: a timeout can also mean the device silently dropped the request/
  );
  check(
    'agent logged decrypt failure for wrong privPass',
    agentErrors.some((e) => /Failed to decrypt PDU/.test(e.message)),
    JSON.stringify(agentErrors.map((e) => e.message))
  );
  await expectThrow(
    'unknown user throws (no values returned)',
    () => svc.getSystemInfoV3(
      AGENT_HOST,
      { user: 'no-such-user', authProtocol: 'sha', authPass, privProtocol: 'aes', privPass },
      sessionOpts
    ),
    /SNMPv3 authentication\/privacy failed for user 'no-such-user'|timed out/i
  );

  // --- 5. validateV3 validation (no packets sent) -------------------------
  // Canonical Phase 4 merge: validateV3 replaces buildV3User (deleted
  // public name). Same error wording, normalised return shape.
  expectThrowSync('validateV3: missing user', () => svc.validateV3({}), /v3\.user is required/);
  expectThrowSync('validateV3: empty user', () => svc.validateV3({ user: '  ' }), /v3\.user is required/);
  expectThrowSync(
    'validateV3: unknown authProtocol',
    () => svc.validateV3({ user: 'u', authProtocol: 'sha512', authPass: 'dummy-passphrase-for-validation' }),
    /unsupported authProtocol/
  );
  expectThrowSync(
    'validateV3: short authPass',
    () => svc.validateV3({ user: 'u', authProtocol: 'sha', authPass: 'short' }),
    /at least 8 characters/
  );
  expectThrowSync(
    'validateV3: priv without auth',
    () => svc.validateV3({ user: 'u', privProtocol: 'aes', privPass: 'dummy-passphrase-for-validation' }),
    /requires authProtocol/
  );
  expectThrowSync(
    'validateV3: unknown privProtocol',
    () => svc.validateV3({ user: 'u', authProtocol: 'sha', authPass: 'dummy-passphrase-for-validation', privProtocol: 'aes256', privPass: 'dummy-passphrase-for-validation' }),
    /unsupported privProtocol/
  );
  expectThrowSync(
    'validateV3: short privPass',
    () => svc.validateV3({ user: 'u', authProtocol: 'sha', authPass: 'dummy-passphrase-for-validation', privProtocol: 'aes', privPass: 'short' }),
    /at least 8 characters/
  );
  const uNoAuth = svc.validateV3({ user: 'u' });
  check('validateV3: noAuthNoPriv level', uNoAuth.level === snmp.SecurityLevel.noAuthNoPriv && uNoAuth.levelName === 'noAuthNoPriv', `level=${uNoAuth.level} levelName=${uNoAuth.levelName}`);
  const uAuth = svc.validateV3({ user: 'u', authProtocol: 'MD5', authPass: 'dummy-passphrase-for-validation' });
  check(
    'validateV3: authNoPriv/MD5 level (case-insensitive protocol)',
    uAuth.level === snmp.SecurityLevel.authNoPriv && uAuth.levelName === 'authNoPriv' && uAuth.authProtocol === 'md5',
    `level=${uAuth.level} levelName=${uAuth.levelName} authProtocol=${uAuth.authProtocol}`
  );
  const uPriv = svc.validateV3({ user: 'u', authProtocol: 'sha', authPass: 'dummy-passphrase-for-validation', privProtocol: 'AES', privPass: 'dummy-passphrase-for-validation' });
  check(
    'validateV3: authPriv/SHA+AES level (case-insensitive protocol)',
    uPriv.level === snmp.SecurityLevel.authPriv && uPriv.levelName === 'authPriv' && uPriv.privProtocol === 'aes',
    `level=${uPriv.level} levelName=${uPriv.levelName} privProtocol=${uPriv.privProtocol}`
  );
  const sess = svc.createV3Session(AGENT_HOST, { user: 'p3-noauth' }, sessionOpts);
  check('createV3Session: constructs without throwing', !!sess, 'session created');
  sess.close();

  // --- 6. v2c regression over the same agent -------------------------------
  const v2Info = await svc.getSystemInfo(AGENT_HOST, 'public', sessionOpts);
  assertSystemInfo('v2c regression getSystemInfo (same exact values)', v2Info);
  const v2Get = await svc.snmpGet(AGENT_HOST, 'public', ['1.3.6.1.2.1.1.5.0'], sessionOpts);
  check(
    'v2c regression snmpGet sysName.0 exact',
    v2Get.length === 1 && v2Get[0].value === EXPECTED.sysName,
    JSON.stringify(v2Get.map((vb) => vb.value))
  );

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILED:');
    for (const f of failed) console.log(`  - ${f.label} — ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error('PROOF CRASHED:', err && err.stack ? err.stack : err);
  process.exit(1);
});
