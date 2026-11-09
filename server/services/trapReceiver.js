'use strict';
/**
 * OpManager Central — real SNMP trap (UDP 162) + syslog (UDP 514) receiver.
 *
 * Replaces the T1/T2 stubs (audit ncm-traps-zia.md): previously no UDP
 * listener existed anywhere in server/, so /api/traps/list and
 * /api/syslog/list were permanently empty arrays.
 *
 * Behaviour:
 *  - Binds one UDP socket on 162 (SNMP traps) and one on 514 (syslog).
 *    Ports are overridable for tests via OPM_TRAP_PORT / OPM_SYSLOG_PORT.
 *  - Every datagram actually received is parsed minimally and persisted
 *    via the store (store.saveTrap — see note below). Nothing is ever
 *    invented: if no datagram arrives, the lists stay empty.
 *  - If a bind fails (EACCES/EPERM on the privileged ports, or a sandbox
 *    that blocks UDP), a clear warning is logged and that receiver stays
 *    honestly disabled instead of faking data.
 *
 * Store API note: server/services/store.js exports saveTrap/listTraps as
 * flat functions, not under a `store.traps` namespace. The adapter below
 * accepts either shape so this module keeps working if the store is
 * ever namespaced that way.
 */

const dgram = require('node:dgram');
const store = require('./store');

const TRAP_PORT = Number(process.env.OPM_TRAP_PORT) || 162;
const SYSLOG_PORT = Number(process.env.OPM_SYSLOG_PORT) || 514;
const MAX_VALUE_CHARS = 4096;

// SNMPv2-MIB trap OID varbind: snmpTrapOID.0
const SNMP_TRAP_OID = '1.3.6.1.6.3.1.1.4.1.0';

const saveTrap =
  typeof store.saveTrap === 'function'
    ? store.saveTrap
    : store.traps && typeof store.traps.saveTrap === 'function'
      ? store.traps.saveTrap
      : null;

const status = {
  trap: { port: TRAP_PORT, bound: false, error: null },
  syslog: { port: SYSLOG_PORT, bound: false, error: null },
};

let started = false;

// ------------------------------------------------------------ BER decode ---

// Minimal BER TLV reader — enough to walk an SNMP message. Returns null
// on any malformed/truncated input instead of throwing.
function readLength(buf, offset) {
  if (offset >= buf.length) return null;
  const first = buf[offset];
  if (first < 0x80) return { length: first, bytes: 1 };
  const n = first & 0x7f;
  if (n === 0 || n > 4 || offset + 1 + n > buf.length) return null;
  let length = 0;
  for (let i = 0; i < n; i++) length = (length << 8) | buf[offset + 1 + i];
  return { length, bytes: 1 + n };
}

function readTlv(buf, offset) {
  if (offset >= buf.length) return null;
  const tag = buf[offset];
  const len = readLength(buf, offset + 1);
  if (!len) return null;
  const start = offset + 1 + len.bytes;
  const end = start + len.length;
  if (end > buf.length) return null;
  return { tag, start, end };
}

function decodeOid(bytes) {
  if (bytes.length === 0) return null;
  const parts = [Math.floor(bytes[0] / 40), bytes[0] % 40];
  let value = 0;
  for (let i = 1; i < bytes.length; i++) {
    value = (value << 7) | (bytes[i] & 0x7f);
    if ((bytes[i] & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join('.');
}

function decodeValue(tag, bytes) {
  switch (tag) {
    case 0x02: // INTEGER
    case 0x43: { // TimeTicks
      let v = 0;
      for (const b of bytes) v = (v << 8) | b;
      return v;
    }
    case 0x04: { // OCTET STRING
      const text = bytes.toString('utf8');
      return /^[\x20-\x7e\r\n\t]*$/.test(text) ? text : bytes.toString('hex');
    }
    case 0x05: // NULL
      return null;
    case 0x06: // OBJECT IDENTIFIER
      return decodeOid(bytes);
    case 0x40: // IpAddress
      return [...bytes].join('.');
    case 0x41: // Counter32
    case 0x42: { // Gauge32
      let v = 0;
      for (const b of bytes) v = (v << 8) | b;
      return v;
    }
    default:
      return bytes.toString('hex');
  }
}

// Parse a varbind list (SEQUENCE of SEQUENCE { OID, value }) starting at
// `offset`. Returns an array of { oid, value } (possibly empty).
function parseVarbindList(buf, offset) {
  const list = readTlv(buf, offset);
  if (!list || list.tag !== 0x30) return [];
  const varbinds = [];
  let pos = list.start;
  while (pos < list.end) {
    const vb = readTlv(buf, pos);
    if (!vb || vb.tag !== 0x30) break;
    const oidTlv = readTlv(buf, vb.start);
    if (!oidTlv || oidTlv.tag !== 0x06) break;
    const valueTlv = readTlv(buf, oidTlv.end);
    if (!valueTlv) break;
    varbinds.push({
      oid: decodeOid(buf.subarray(oidTlv.start, oidTlv.end)),
      value: decodeValue(valueTlv.tag, buf.subarray(valueTlv.start, valueTlv.end)),
    });
    pos = vb.end;
  }
  return varbinds;
}

/**
 * Minimally parse an SNMP trap datagram.
 * Returns { oid, varbinds } or null when the datagram is not a decodable
 * SNMP trap message. Supports SNMPv2-Trap PDUs (0xA7) and SNMPv1 Trap
 * PDUs (0xA4). No community/version validation is enforced: traps are
 * recorded as received, with their source IP, exactly as the sender sent
 * them.
 */
function parseSnmpTrap(msg) {
  const outer = readTlv(msg, 0);
  if (!outer || outer.tag !== 0x30) return null;
  let offset = outer.start;
  const version = readTlv(msg, offset);
  if (!version || version.tag !== 0x02) return null;
  offset = version.end;
  const community = readTlv(msg, offset);
  if (!community || community.tag !== 0x04) return null;
  offset = community.end;
  const pdu = readTlv(msg, offset);
  if (!pdu || (pdu.tag !== 0xa7 && pdu.tag !== 0xa4)) return null;

  if (pdu.tag === 0xa4) {
    // SNMPv1 Trap: enterprise OID, agent address, generic trap,
    // specific trap, timestamp, varbind list.
    let pos = pdu.start;
    const enterprise = readTlv(msg, pos);
    if (!enterprise || enterprise.tag !== 0x06) return null;
    const enterpriseOid = decodeOid(msg.subarray(enterprise.start, enterprise.end));
    pos = enterprise.end;
    const agentAddr = readTlv(msg, pos);
    if (!agentAddr) return null;
    pos = agentAddr.end;
    const generic = readTlv(msg, pos);
    if (!generic || generic.tag !== 0x02) return null;
    const genericTrap = decodeValue(0x02, msg.subarray(generic.start, generic.end));
    pos = generic.end;
    const specific = readTlv(msg, pos);
    if (!specific || specific.tag !== 0x02) return null;
    const specificTrap = decodeValue(0x02, msg.subarray(specific.start, specific.end));
    pos = specific.end;
    // Skip the timestamp TLV, then read the varbind list.
    const timestamp = readTlv(msg, pos);
    if (!timestamp) return null;
    const varbinds = parseVarbindList(msg, timestamp.end);
    // Conventional v1 -> v2 OID translation.
    const oid =
      genericTrap === 6
        ? `${enterpriseOid}.${specificTrap}`
        : `${enterpriseOid}.0.${genericTrap}`;
    return { oid, varbinds };
  }

  // SNMPv2-Trap: request-id, error-status, error-index, varbind list.
  let pos = pdu.start;
  for (let i = 0; i < 3; i++) {
    const field = readTlv(msg, pos);
    if (!field || field.tag !== 0x02) return null;
    pos = field.end;
  }
  const varbinds = parseVarbindList(msg, pos);
  const trapOidVb = varbinds.find((vb) => vb.oid === SNMP_TRAP_OID);
  const oid =
    trapOidVb && typeof trapOidVb.value === 'string'
      ? trapOidVb.value
      : varbinds.length > 0
        ? varbinds[0].oid
        : null;
  return { oid, varbinds };
}

// ------------------------------------------------------------- syslog -------

/**
 * Minimal syslog line parsing (RFC 3164 / RFC 5424). Strips the <PRI>
 * prefix when present and returns the message text. Facility/severity
 * are not stored — the traps table has no column for them — so the full
 * remainder of the line is kept verbatim as the value.
 */
function parseSyslogLine(text) {
  const line = String(text).replace(/[\r\n]+$/, '');
  const m = line.match(/^<(\d{1,3})>(.*)$/s);
  const message = m ? m[2].trim() : line;
  return message.slice(0, MAX_VALUE_CHARS);
}

// ------------------------------------------------------------- handlers -----

function handleTrap(msg, rinfo) {
  const sourceIp = (rinfo && rinfo.address) || null;
  const parsed = parseSnmpTrap(msg);
  try {
    if (!parsed) {
      // A datagram arrived on UDP 162 but is not a decodable SNMP trap.
      // Record it honestly as unparsed instead of dropping it silently.
      saveTrap({
        source_ip: sourceIp,
        oid: null,
        value: `unparsed:${msg.toString('hex').slice(0, MAX_VALUE_CHARS)}`,
      });
      return;
    }
    saveTrap({
      source_ip: sourceIp,
      oid: parsed.oid,
      value: JSON.stringify(parsed.varbinds).slice(0, MAX_VALUE_CHARS),
    });
  } catch (err) {
    console.warn(`[trapReceiver] failed to store trap from ${sourceIp}: ${err.message}`);
  }
}

function handleSyslog(msg, rinfo) {
  const sourceIp = (rinfo && rinfo.address) || null;
  try {
    saveTrap({
      source_ip: sourceIp,
      oid: null, // syslog rows carry no OID; routes split traps/syslog on this.
      value: parseSyslogLine(msg.toString('utf8')),
    });
  } catch (err) {
    console.warn(`[trapReceiver] failed to store syslog from ${sourceIp}: ${err.message}`);
  }
}

// -------------------------------------------------------------- startup -----

function bindSocket(kind, port, onMessage) {
  const socket = dgram.createSocket('udp4');
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
  };
  socket.on('error', (err) => {
    status[kind].bound = false;
    status[kind].error = err.code || err.message;
    console.warn(
      `[trapReceiver] ${kind} UDP ${port} unavailable (${err.code || err.message}); ` +
        `receiver disabled — no ${kind === 'trap' ? 'traps' : 'syslog messages'} will be collected.`
    );
    try {
      socket.close();
    } catch (_) {
      // Socket may already be closed.
    }
    done();
  });
  socket.on('message', onMessage);
  socket.on('listening', () => {
    status[kind].bound = true;
    status[kind].error = null;
    console.log(`[trapReceiver] ${kind} receiver listening on UDP ${port}`);
    done();
  });
  try {
    socket.bind(port);
  } catch (err) {
    status[kind].bound = false;
    status[kind].error = err.code || err.message;
    console.warn(
      `[trapReceiver] ${kind} UDP ${port} bind failed (${err.code || err.message}); receiver disabled.`
    );
    done();
  }
  return socket;
}

/**
 * Start both UDP receivers. Idempotent: later calls are no-ops and return
 * the same status object. Returns the live status object
 * ({ trap: { port, bound, error }, syslog: { port, bound, error } });
 * `bound` flips to true asynchronously once each socket is listening.
 * Call once at server startup — see server/routes/traps.js, which calls
 * this on load and re-exports it as trapsRoute.startTrapReceiver() so
 * server/index.js can also call it explicitly.
 */
function startTrapReceiver() {
  if (started) return status;
  started = true;
  if (!saveTrap) {
    status.trap.error = 'store.saveTrap unavailable';
    status.syslog.error = 'store.saveTrap unavailable';
    console.warn('[trapReceiver] store.saveTrap is not available; receiver disabled — nothing will be stored.');
    return status;
  }
  bindSocket('trap', TRAP_PORT, handleTrap);
  bindSocket('syslog', SYSLOG_PORT, handleSyslog);
  return status;
}

function getReceiverStatus() {
  return {
    trap: { ...status.trap },
    syslog: { ...status.syslog },
  };
}

module.exports = {
  startTrapReceiver,
  getReceiverStatus,
  parseSnmpTrap,
  parseSyslogLine,
};
