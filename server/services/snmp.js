'use strict';

/**
 * snmp.js — Real SNMP client for the OpManager Central real-data poller.
 *
 * Uses the `net-snmp` library (SNMPv2c, UDP/161) against each device's own
 * community string. Every value returned here came back in a real varbind.
 *
 * Honesty rules:
 *  - An OID the agent does not implement (NoSuchObject / NoSuchInstance)
 *    yields `null` for that field — never a guessed or default value.
 *  - A transport failure (timeout, unreachable host) THROWS. Callers must
 *    treat that as "device did not answer", not as zero/false data.
 *  - No value in this file is invented, hardcoded, or derived from
 *    Math.random. There is no fallback that fabricates a reading.
 *
 * OID sources: ~/workspace/opm-check/real-data/specs/snmp-oid-reference.md
 * Live proof:  ~/workspace/opm-check/real-data/recon/techub-switches-snmp.md
 *   - cpmCPUTotal5min (.109.1.1.1.1.5.1) and ciscoMemoryPoolUsed/Free
 *     (.48.1.1.1.5.1 / .6.1) answer on all 8 Techub Cisco switches.
 *   - pfSense 192.168.30.1 answers the system group but returns
 *     NoSuchObject for every Cisco OID above — hence the nulls.
 */

const snmp = require('net-snmp');

const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_RETRIES = 1;
const DEFAULT_PORT = 161;
const DEFAULT_COMMUNITY = 'public';

// --- OID constants ---------------------------------------------------------
const OID = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysObjectID: '1.3.6.1.2.1.1.2.0',
  sysUpTime: '1.3.6.1.2.1.1.3.0',
  sysContact: '1.3.6.1.2.1.1.4.0',
  sysName: '1.3.6.1.2.1.1.5.0',
  sysLocation: '1.3.6.1.2.1.1.6.0',
  // CISCO-PROCESS-MIB cpmCPUTotalTable columns (row index appended).
  // Rev objects first (.6/.7/.8), legacy deprecated objects as fallback
  // (.3/.4/.5). All are % busy; .8/.5 are the 5-minute figures.
  cpmCPUTotal5secRev: '1.3.6.1.4.1.9.9.109.1.1.1.1.6',
  cpmCPUTotal1minRev: '1.3.6.1.4.1.9.9.109.1.1.1.1.7',
  cpmCPUTotal5minRev: '1.3.6.1.4.1.9.9.109.1.1.1.1.8',
  cpmCPUTotal5sec: '1.3.6.1.4.1.9.9.109.1.1.1.1.3',
  cpmCPUTotal1min: '1.3.6.1.4.1.9.9.109.1.1.1.1.4',
  cpmCPUTotal5min: '1.3.6.1.4.1.9.9.109.1.1.1.1.5',
  // CISCO-MEMORY-POOL-MIB ciscoMemoryPoolTable columns (row index appended).
  ciscoMemoryPoolName: '1.3.6.1.4.1.9.9.48.1.1.1.2',
  ciscoMemoryPoolUsed: '1.3.6.1.4.1.9.9.48.1.1.1.5',
  ciscoMemoryPoolFree: '1.3.6.1.4.1.9.9.48.1.1.1.6',
  // IF-MIB ifTable columns (ifIndex appended) + ifXTable ifName.
  ifDescr: '1.3.6.1.2.1.2.2.1.2',
  ifSpeed: '1.3.6.1.2.1.2.2.1.5',
  ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
  ifInOctets: '1.3.6.1.2.1.2.2.1.10',
  ifOutOctets: '1.3.6.1.2.1.2.2.1.16',
  ifName: '1.3.6.1.2.1.31.1.1.1.1',
};

const NO_SUCH_OBJECT = snmp.ObjectType.NoSuchObject; // 128
const NO_SUCH_INSTANCE = snmp.ObjectType.NoSuchInstance; // 129

// --- Session helpers -------------------------------------------------------

function createSession(ip, community, options = {}) {
  return snmp.createSession(ip, community || DEFAULT_COMMUNITY, {
    port: options.port || DEFAULT_PORT,
    version: snmp.Version2c,
    timeout: options.timeout || DEFAULT_TIMEOUT_MS,
    retries: options.retries !== undefined ? options.retries : DEFAULT_RETRIES,
    transport: 'udp4',
  });
}

function isTimeoutError(err) {
  if (!err) return false;
  const msg = String((err && err.message) || err);
  return /timed out/i.test(msg) || err instanceof snmp.RequestTimedOutError;
}

/**
 * Decode a Counter64 varbind value to a Number. Never throws.
 *
 * net-snmp strips leading zero bytes, so real Counter64 values routinely
 * arrive as 1–7 byte Buffers — NOT the 8 bytes readBigUInt64BE(0) demands.
 * A short buffer throws RangeError [ERR_BUFFER_OUT_OF_BOUNDS] inside
 * net-snmp's UDP callback, outside any promise, and kills the whole Node
 * process (live proof: ifHCInOctets varbinds of 1 and 4 bytes from a
 * C3560 at 192.168.30.2). Short buffers are therefore left-padded to
 * 8 bytes before decoding; buffers longer than 8 bytes are decoded via
 * BigInt from hex. An empty/corrupt buffer yields null, never a throw.
 */
function decodeCounter64(buf) {
  if (!Buffer.isBuffer(buf) || buf.length === 0) return null;
  try {
    if (buf.length <= 8) {
      const padded = Buffer.alloc(8);
      buf.copy(padded, 8 - buf.length);
      return Number(padded.readBigUInt64BE(0));
    }
    return Number(BigInt(`0x${buf.toString('hex')}`));
  } catch (_err) {
    return null;
  }
}

/**
 * Normalise one net-snmp varbind. Error varbinds become { value: null, error }.
 * This function NEVER throws: it runs inside net-snmp's UDP callback, where
 * a throw escapes every promise in the poller and exits the process. A
 * malformed varbind is recorded as { value: null, error } instead.
 */
function normaliseVarbind(vb) {
  try {
    const oid = String(vb.oid);
    const typeName = snmp.ObjectType[vb.type] || String(vb.type);
    if (snmp.isVarbindError(vb)) {
      return { oid, type: vb.type, typeName, value: null, error: snmp.varbindError(vb) };
    }
    let value = vb.value;
    if (Buffer.isBuffer(value)) {
      if (vb.type === snmp.ObjectType.OctetString) {
        value = value.toString('utf8');
      } else if (vb.type === snmp.ObjectType.Counter64) {
        // Number loses precision past 2^53; octet counters below that are
        // exact, which covers real pollers.
        value = decodeCounter64(value);
      } else if (vb.type === snmp.ObjectType.IpAddress) {
        value = value.length === 4 ? Array.from(value).join('.') : value.toString('hex');
      } else {
        value = value.toString('hex');
      }
    }
    return { oid, type: vb.type, typeName, value };
  } catch (err) {
    // Last-resort guard: never let a bad varbind kill the process.
    return {
      oid: String(vb && vb.oid),
      type: vb && vb.type,
      typeName: String(vb && vb.type),
      value: null,
      error: `decode error: ${(err && err.message) || err}`,
    };
  }
}

/** GET one session's worth of OIDs. Rejects on transport error/timeout. */
function sessionGet(session, oids) {
  return new Promise((resolve, reject) => {
    session.get(oids, (error, varbinds) => {
      if (error) return reject(error);
      resolve(varbinds.map(normaliseVarbind));
    });
  });
}

/**
 * Walk a subtree. Resolves to the varbinds actually returned (possibly an
 * empty array when the table is absent/empty). Rejects on transport
 * error/timeout. Varbind-level errors (e.g. NoSuchObject rows) are skipped,
 * not treated as a failed walk.
 *
 * Uses session.subtree(), NOT the unbounded walk variant: walk() has NO subtree
 * boundary — it GETBULKs until EndOfMibView, so a column walk runs away
 * through neighbouring tables (live proof: walking cpmCPUTotal5minRev on
 * a C3560 ran through the whole CISCO-PROCESS-MIB history table, 3,180+
 * varbinds in 20 s and still going). subtree() stops the moment an OID
 * leaves the requested column, so a column walk returns exactly one
 * column. A belt-and-braces prefix check below drops anything outside
 * the subtree even if the library hands it to us.
 */
function sessionWalk(session, oid) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const base = String(oid);
    session.subtree(oid, 20, (varbinds) => {
      for (const vb of varbinds) {
        if (snmp.isVarbindError(vb)) continue;
        const vbOid = String(vb.oid);
        if (vbOid !== base && !vbOid.startsWith(`${base}.`)) continue;
        try {
          rows.push(normaliseVarbind(vb));
        } catch (_err) {
          // One bad varbind must never throw out of net-snmp's UDP
          // callback (that kills the whole process); skip it.
          continue;
        }
      }
    }, (error) => {
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

/** Row index = the OID suffix after the column base. */
function rowIndex(oid, columnBase) {
  const suffix = String(oid).slice(String(columnBase).length + 1);
  return suffix;
}

function numericValue(vb) {
  if (!vb || vb.value === null || vb.value === undefined) return null;
  const n = Number(vb.value);
  return Number.isFinite(n) ? n : null;
}

// --- Generic primitives (exported for routes/tools) ------------------------

/**
 * snmpGet(ip, community, oids) — real SNMP GET for one or more OIDs.
 * Returns [{ oid, type, typeName, value, error? }]; a NoSuchObject varbind
 * is returned with value null and error 'NoSuchObject', NOT thrown.
 * Throws on timeout / unreachable host / other transport errors.
 */
async function snmpGet(ip, community, oids, options = {}) {
  if (!ip) throw new Error('snmpGet: no target IP supplied');
  const list = Array.isArray(oids) ? oids : [oids];
  const session = createSession(ip, community, options);
  try {
    return await sessionGet(session, list);
  } finally {
    session.close();
  }
}

/**
 * snmpWalk(ip, community, oid) — real SNMP walk of one subtree.
 * Returns the varbinds the device actually returned (possibly []).
 * Throws on timeout / unreachable host / other transport errors.
 */
async function snmpWalk(ip, community, oid, options = {}) {
  if (!ip) throw new Error('snmpWalk: no target IP supplied');
  const session = createSession(ip, community, options);
  try {
    return await sessionWalk(session, oid);
  } finally {
    session.close();
  }
}

// --- System identity -------------------------------------------------------

/**
 * getSystemInfo(ip, community) → { sysDescr, sysObjectID, sysUpTime,
 * sysName, sysLocation, sysContact }.
 * One real GET of the six SNMPv2-MIB system scalars. Any scalar the agent
 * does not implement comes back null. Throws on timeout/unreachable.
 * sysUpTime is TimeTicks (hundredths of a second) or null.
 */
async function getSystemInfo(ip, community, options = {}) {
  const varbinds = await snmpGet(ip, community, [
    OID.sysDescr,
    OID.sysObjectID,
    OID.sysUpTime,
    OID.sysName,
    OID.sysLocation,
    OID.sysContact,
  ], options);
  const byOid = {};
  for (const vb of varbinds) byOid[vb.oid] = vb;
  const text = (oid) => {
    const vb = byOid[oid];
    if (!vb || vb.value === null || vb.value === undefined) return null;
    const s = String(vb.value).trim();
    return s === '' ? null : s;
  };
  const uptime = numericValue(byOid[OID.sysUpTime]);
  return {
    sysDescr: text(OID.sysDescr),
    sysObjectID: text(OID.sysObjectID),
    sysUpTime: uptime,
    sysName: text(OID.sysName),
    sysLocation: text(OID.sysLocation),
    sysContact: text(OID.sysContact),
  };
}

// --- CPU + memory ----------------------------------------------------------

/**
 * getCpuMem(ip, community) → { cpu5min: number|null, memUsedPct: number|null }.
 *
 * CPU: walks cpmCPUTotal5minRev (.8); falls back to cpmCPUTotal5min (.5)
 * when Rev is absent; direct GETs of index 1 as a last resort. When several
 * CPU rows answer, the maximum is reported. A device without
 * CISCO-PROCESS-MIB (e.g. pfSense) returns cpu5min null.
 *
 * Memory: walks ciscoMemoryPoolName and uses the row named "Processor"
 * (the pool name is the identifier — the index varies by platform); falls
 * back to pool index 1, which live recon proved is the Processor pool on
 * all 8 Techub switches. memUsedPct = Used / (Used + Free) * 100.
 * A device without CISCO-MEMORY-POOL-MIB returns memUsedPct null.
 *
 * Throws only on transport timeout/unreachable; a merely absent MIB is null.
 */
async function getCpuMem(ip, community, options = {}) {
  const session = createSession(ip, community, options);
  try {
    // --- CPU: Rev walk and legacy walk in parallel; prefer Rev. ---
    const [revSettled, legacySettled] = await Promise.allSettled([
      sessionWalk(session, OID.cpmCPUTotal5minRev),
      sessionWalk(session, OID.cpmCPUTotal5min),
    ]);
    const timedOut = [revSettled, legacySettled].some(
      (r) => r.status === 'rejected' && isTimeoutError(r.reason)
    );
    if (timedOut) {
      throw new Error(`SNMP request to ${ip} timed out`);
    }
    let cpu5min = null;
    const pickMaxCpu = (rows) => {
      const vals = (rows || [])
        .map((vb) => numericValue(vb))
        .filter((n) => n !== null && n >= 0 && n <= 100);
      return vals.length ? Math.max(...vals) : null;
    };
    if (revSettled.status === 'fulfilled') cpu5min = pickMaxCpu(revSettled.value);
    if (cpu5min === null && legacySettled.status === 'fulfilled') {
      cpu5min = pickMaxCpu(legacySettled.value);
    }
    if (cpu5min === null) {
      // Last resort: direct GETs of index 1 (covers agents where the
      // walk returns nothing but a GET answers).
      const gets = await sessionGet(session, [
        `${OID.cpmCPUTotal5minRev}.1`,
        `${OID.cpmCPUTotal5min}.1`,
      ]).catch((err) => {
        if (isTimeoutError(err)) throw new Error(`SNMP request to ${ip} timed out`);
        return [];
      });
      for (const vb of gets) {
        const n = numericValue(vb);
        if (n !== null && n >= 0 && n <= 100) { cpu5min = n; break; }
      }
    }

    // --- Memory: find the "Processor" pool by name, else index 1. ---
    let memUsedPct = null;
    let poolIndex = '1';
    const nameRows = await sessionWalk(session, OID.ciscoMemoryPoolName)
      .catch((err) => {
        if (isTimeoutError(err)) throw new Error(`SNMP request to ${ip} timed out`);
        return [];
      });
    const processorRow = (nameRows || []).find(
      (vb) => typeof vb.value === 'string' && vb.value.trim().toLowerCase() === 'processor'
    );
    if (processorRow) poolIndex = rowIndex(processorRow.oid, OID.ciscoMemoryPoolName);
    const memGets = await sessionGet(session, [
      `${OID.ciscoMemoryPoolUsed}.${poolIndex}`,
      `${OID.ciscoMemoryPoolFree}.${poolIndex}`,
    ]).catch((err) => {
      if (isTimeoutError(err)) throw new Error(`SNMP request to ${ip} timed out`);
      return [];
    });
    const used = numericValue(memGets.find((vb) => vb.oid === `${OID.ciscoMemoryPoolUsed}.${poolIndex}`));
    const free = numericValue(memGets.find((vb) => vb.oid === `${OID.ciscoMemoryPoolFree}.${poolIndex}`));
    if (used !== null && free !== null && used + free > 0) {
      memUsedPct = Math.round((used / (used + free)) * 1000) / 10;
    }

    return { cpu5min, memUsedPct };
  } finally {
    session.close();
  }
}

// --- Interfaces ------------------------------------------------------------

/**
 * getInterfaces(ip, community) →
 *   [{ ifIndex, descr, name, operStatus, inOctets, outOctets, speed }]
 * Real ifTable walk (ifDescr / ifSpeed / ifOperStatus / ifInOctets /
 * ifOutOctets) joined by ifIndex, with ifName from ifXTable as the display
 * name (falling back to ifDescr). operStatus is the numeric IF-MIB enum
 * (up=1, down=2, ...). Counters/speed are numbers or null when the agent
 * does not return them. Returns [] when the device exposes no interfaces.
 * Throws on timeout/unreachable.
 */
async function getInterfaces(ip, community, options = {}) {
  const session = createSession(ip, community, options);
  try {
    const settled = await Promise.allSettled([
      sessionWalk(session, OID.ifDescr),
      sessionWalk(session, OID.ifSpeed),
      sessionWalk(session, OID.ifOperStatus),
      sessionWalk(session, OID.ifInOctets),
      sessionWalk(session, OID.ifOutOctets),
      sessionWalk(session, OID.ifName),
    ]);
    if (settled.some((r) => r.status === 'rejected' && isTimeoutError(r.reason))) {
      throw new Error(`SNMP request to ${ip} timed out`);
    }
    const [descrRows, speedRows, operRows, inRows, outRows, nameRows] = settled.map(
      (r) => (r.status === 'fulfilled' ? r.value : [])
    );
    const byIndex = new Map();
    const ensure = (idx) => {
      if (!byIndex.has(idx)) {
        byIndex.set(idx, {
          ifIndex: Number(idx),
          descr: null,
          name: null,
          operStatus: null,
          inOctets: null,
          outOctets: null,
          speed: null,
        });
      }
      return byIndex.get(idx);
    };
    const fill = (rows, columnBase, field, asNumber) => {
      for (const vb of rows || []) {
        const idx = rowIndex(vb.oid, columnBase);
        const row = ensure(idx);
        row[field] = asNumber ? numericValue(vb) : (vb.value === null ? null : String(vb.value));
      }
    };
    fill(descrRows, OID.ifDescr, 'descr', false);
    fill(speedRows, OID.ifSpeed, 'speed', true);
    fill(operRows, OID.ifOperStatus, 'operStatus', true);
    fill(inRows, OID.ifInOctets, 'inOctets', true);
    fill(outRows, OID.ifOutOctets, 'outOctets', true);
    fill(nameRows, OID.ifName, 'name', false);
    const rows = [...byIndex.values()]
      .filter((r) => r.descr !== null || r.name !== null)
      .sort((a, b) => a.ifIndex - b.ifIndex);
    for (const r of rows) {
      if (!r.name) r.name = r.descr;
      if (!r.descr) r.descr = r.name;
    }
    return rows;
  } finally {
    session.close();
  }
}

module.exports = {
  OID,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_RETRIES,
  getSystemInfo,
  getCpuMem,
  getInterfaces,
  snmpGet,
  snmpWalk,
  isTimeoutError,
};
