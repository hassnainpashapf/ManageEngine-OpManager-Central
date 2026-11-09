'use strict';

/**
 * snmp.js — Real SNMP client for the OpManager Central real-data poller.
 *
 * Uses the `net-snmp` library (SNMPv2c, UDP/161) against each device's own
 * community string, plus SNMPv3 USM sessions (noAuthNoPriv, authNoPriv
 * MD5/SHA, authPriv MD5/SHA + DES/AES) via createV3Session() and the
 * snmpGetV3 / snmpWalkV3 / getSystemInfoV3 / getCpuMemV3 / getInterfacesV3
 * primitives. Every value returned here came back in a real varbind.
 *
 * CANONICAL SNMPv3 (Phase 4 merge, branch p4m-snmpv3): ONE createV3Session
 * (returns the raw net-snmp session), ONE throwing validator validateV3,
 * narrow protocols only (md5/sha + des/aes — sha224/256/384/512 and
 * aes256b/aes256r are rejected), createSnmpSession dispatcher + openSession
 * routing for the v2c primitives, wrapV3Error/isV3AuthError at the
 * snmpGetV3/snmpWalkV3 layer, sessionWalk loop-guard. Merged from the
 * Phase 3 snmpv3-service (proof 28/28, loop-guard, V3 error mapping),
 * snmpv3-poller (dispatcher/openSession, {port,timeout,retries,transport,
 * context,engineID} options), snmpv3-tools (describeSnmpV3) and
 * snmpv3-proof (validateV3 name/shape) tracks; the alias names
 * buildV3User / validateV3Credentials / validateSnmpV3 are deleted.
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
  const sessionOptions = {
    port: options.port || DEFAULT_PORT,
    version: snmp.Version2c,
    timeout: options.timeout || DEFAULT_TIMEOUT_MS,
    retries: options.retries !== undefined ? options.retries : DEFAULT_RETRIES,
    transport: 'udp4',
  };
  // Test-only injection point (in-memory datagram shim for hosts whose
  // sandbox blocks UDP); production callers never pass it.
  if (options.dgramModule) sessionOptions.dgramModule = options.dgramModule;
  return snmp.createSession(ip, community || DEFAULT_COMMUNITY, sessionOptions);
}

// --- SNMPv3 (USM) ----------------------------------------------------------

// Canonical device.snmp.v3 fields (see ~/workspace/opm-p3/SHARED.md):
//   { user, authProtocol: 'md5'|'sha', authPass,
//     privProtocol: 'des'|'aes', privPass }
// Absent authProtocol  -> noAuthNoPriv. authProtocol without privProtocol
// -> authNoPriv. Both present -> authPriv. privProtocol without
// authProtocol is rejected: authPriv requires authentication (RFC 3414).
const V3_AUTH_PROTOCOLS = {
  md5: snmp.AuthProtocols.md5,
  sha: snmp.AuthProtocols.sha,
};
const V3_PRIV_PROTOCOLS = {
  des: snmp.PrivProtocols.des,
  aes: snmp.PrivProtocols.aes,
};
// RFC 3414 section 11.2: a USM passphrase must be at least 8 octets.
// Shorter passphrases cannot be localised into a valid key.
const MIN_V3_PASSPHRASE_LEN = 8;

const SECURITY_LEVEL_NAMES = {
  [snmp.SecurityLevel.noAuthNoPriv]: 'noAuthNoPriv',
  [snmp.SecurityLevel.authNoPriv]: 'authNoPriv',
  [snmp.SecurityLevel.authPriv]: 'authPriv',
};

/**
 * validateV3(v3) -> normalised { user, authProtocol, authPass,
 * privProtocol, privPass, level, levelName }.
 *
 * THE single throwing SNMPv3 validator for this codebase (canonical,
 * Phase 4 merge — replaces buildV3User / validateV3Credentials /
 * validateSnmpV3). Validates the canonical device.snmp.v3 fields and
 * derives the security level. THROWS on any invalid shape — never
 * silently downgrades the security level (a downgrade would turn an
 * authPriv request into an unauthenticated one) and never silently
 * defaults a protocol from a passphrase's presence. Passphrases are
 * never included in error messages. Absent protocols/passphrases come
 * back as null.
 *
 *   absent authProtocol         -> noAuthNoPriv (authPass must be absent too)
 *   authProtocol without priv   -> authNoPriv
 *   both present                -> authPriv
 *   privProtocol without auth   -> throws (RFC 3414: priv implies auth)
 *   either passphrase < 8 chars -> throws (RFC 3414 section 11.2)
 *   unknown protocol name       -> throws (narrow set only: md5/sha + des/aes)
 */
function validateV3(v3) {
  if (!v3 || typeof v3 !== 'object') {
    throw new Error('SNMPv3: no v3 credentials supplied (expected device.snmp.v3)');
  }
  const user = typeof v3.user === 'string' ? v3.user.trim() : '';
  if (!user) {
    throw new Error('SNMPv3: v3.user is required (non-empty user name)');
  }
  const authName = typeof v3.authProtocol === 'string'
    ? v3.authProtocol.trim().toLowerCase() : '';
  const privName = typeof v3.privProtocol === 'string'
    ? v3.privProtocol.trim().toLowerCase() : '';
  const authPass = v3.authPass === undefined || v3.authPass === null ? '' : String(v3.authPass);
  const privPass = v3.privPass === undefined || v3.privPass === null ? '' : String(v3.privPass);
  if (authName) {
    if (!Object.prototype.hasOwnProperty.call(V3_AUTH_PROTOCOLS, authName)) {
      throw new Error(
        `SNMPv3: unsupported authProtocol '${v3.authProtocol}' for user '${user}' (supported: md5, sha)`
      );
    }
    if (authPass.length < MIN_V3_PASSPHRASE_LEN) {
      throw new Error(
        `SNMPv3: authPass for user '${user}' must be at least ${MIN_V3_PASSPHRASE_LEN} characters (RFC 3414)`
      );
    }
  } else if (authPass) {
    throw new Error(
      `SNMPv3: authPass supplied for user '${user}' without authProtocol (supply authProtocol 'md5' or 'sha')`
    );
  }
  if (privName) {
    if (!authName) {
      throw new Error(
        `SNMPv3: privProtocol '${v3.privProtocol}' for user '${user}' requires authProtocol (authPriv without auth is not valid USM)`
      );
    }
    if (!Object.prototype.hasOwnProperty.call(V3_PRIV_PROTOCOLS, privName)) {
      throw new Error(
        `SNMPv3: unsupported privProtocol '${v3.privProtocol}' for user '${user}' (supported: des, aes)`
      );
    }
    if (privPass.length < MIN_V3_PASSPHRASE_LEN) {
      throw new Error(
        `SNMPv3: privPass for user '${user}' must be at least ${MIN_V3_PASSPHRASE_LEN} characters (RFC 3414)`
      );
    }
  } else if (privPass) {
    throw new Error(
      `SNMPv3: privPass supplied for user '${user}' without privProtocol (supply privProtocol 'des' or 'aes')`
    );
  }
  const level = privName
    ? snmp.SecurityLevel.authPriv
    : authName
      ? snmp.SecurityLevel.authNoPriv
      : snmp.SecurityLevel.noAuthNoPriv;
  return {
    user,
    authProtocol: authName || null,
    authPass: authPass || null,
    privProtocol: privName || null,
    privPass: privPass || null,
    level,
    levelName: SECURITY_LEVEL_NAMES[level],
  };
}

/**
 * Describe validated v3 creds for API responses / logs: identity,
 * protocol names and security level only — passphrases are NEVER
 * included.
 */
function describeSnmpV3(creds) {
  if (!creds) return null;
  return {
    user: creds.user || null,
    authProtocol: creds.authProtocol || null,
    privProtocol: creds.privProtocol || null,
    securityLevel: creds.levelName || null,
  };
}

/**
 * createV3Session(ip, v3, options) — SNMPv3 USM session for one device.
 * `v3` is the canonical device.snmp.v3 object ({ user, authProtocol,
 * authPass, privProtocol, privPass }). Supports noAuthNoPriv, authNoPriv
 * (MD5/SHA) and authPriv (MD5/SHA + DES/AES). Returns the raw net-snmp
 * session (NOT a wrapper object).
 *
 * The session is lazy: engine-ID discovery and USM authentication happen
 * on the first request, so a bad passphrase surfaces as a thrown error
 * from the GET/WALK call (see wrapV3Error), not from this constructor.
 * options: { port, timeout, retries, transport, context, engineID,
 * dgramModule? } — dgramModule is a test-only injection point (see
 * createSession above); context/engineID are passed through to net-snmp.
 */
function createV3Session(ip, v3, options = {}) {
  if (!ip) throw new Error('createV3Session: no target IP supplied');
  const creds = validateV3(v3);
  const user = { name: creds.user, level: creds.level };
  if (creds.authProtocol) {
    user.authProtocol = V3_AUTH_PROTOCOLS[creds.authProtocol];
    user.authKey = creds.authPass;
  }
  if (creds.privProtocol) {
    user.privProtocol = V3_PRIV_PROTOCOLS[creds.privProtocol];
    user.privKey = creds.privPass;
  }
  const sessionOptions = {
    port: options.port || DEFAULT_PORT,
    timeout: options.timeout || DEFAULT_TIMEOUT_MS,
    retries: options.retries !== undefined ? options.retries : DEFAULT_RETRIES,
    transport: options.transport || 'udp4',
  };
  if (options.context !== undefined) sessionOptions.context = options.context;
  if (options.engineID !== undefined) sessionOptions.engineID = options.engineID;
  if (options.dgramModule) sessionOptions.dgramModule = options.dgramModule;
  return snmp.createV3Session(ip, user, sessionOptions);
}

/**
 * normalizeSnmpVersion(raw) — THE canonical SNMP version spelling map
 * for this codebase (audit A3 G-01). Stored device rows hold '2c' (the
 * discovery/devices write paths normalize it on write, but rows written
 * before that — and any direct store write — still carry '2c'), so every
 * version-consumption point must accept the aliases instead of comparing
 * against the exact 'v2c'/'v3' spellings:
 *
 *   'v2c' | '2c' | 'v2' | '2'  → 'v2c'
 *   'v3'  | '3'                → 'v3'
 *
 * Matching is case-insensitive with surrounding whitespace trimmed.
 * A present-but-unknown value (including 'v1'/'1' — SNMPv1 is not
 * supported anywhere in this codebase) returns null: callers keep the
 * strict rejection with a clear error naming the unsupported version.
 * An unknown version is NEVER defaulted to v2c — that would silently
 * poll a device with the wrong protocol. Missing/blank is also null;
 * callers that historically defaulted a missing version to v2c keep
 * that default explicitly at their own call site.
 */
function normalizeSnmpVersion(raw) {
  if (raw === undefined || raw === null) return null;
  const v = String(raw).trim().toLowerCase();
  if (v === 'v2c' || v === '2c' || v === 'v2' || v === '2') return 'v2c';
  if (v === 'v3' || v === '3') return 'v3';
  return null;
}

/**
 * createSnmpSession(ip, snmpConfig, options = {}) — version dispatcher.
 * snmpConfig: { version: 'v2c'|'v3', community, v3 } (canonical
 * device.snmp shape). v2c returns the existing community session;
 * v3 returns createV3Session. Any other version throws — v1 is not
 * supported by this codebase, and an unknown version must fail loudly
 * rather than silently polling as v2c. Version spellings go through
 * normalizeSnmpVersion, so stored '2c' (and '2'/'3') aliases are
 * accepted exactly like 'v2c'/'v3' (audit A3 G-01).
 */
function createSnmpSession(ip, snmpConfig, options = {}) {
  const cfg = snmpConfig && typeof snmpConfig === 'object' ? snmpConfig : {};
  const rawVersion = cfg.version;
  const version = (rawVersion === undefined || rawVersion === null || String(rawVersion).trim() === '')
    ? 'v2c'
    : normalizeSnmpVersion(rawVersion);
  if (version === 'v3') return createV3Session(ip, cfg.v3, options);
  if (version === 'v2c') return createSession(ip, cfg.community, options);
  throw new Error(`SNMP: unsupported SNMP version '${rawVersion}' (supported: 'v2c', 'v3')`);
}

/**
 * openSession(ip, community, options) — session factory for the
 * get/walk primitives below. Backward compatible: options without a
 * version still opens the v2c community session exactly as before.
 * options { version: 'v3', v3: {...} } opens a v3 session instead.
 * Version spellings go through normalizeSnmpVersion, so the stored
 * '2c' alias (and '2'/'3') is accepted exactly like 'v2c'/'v3'
 * (audit A3 G-01); any other present version still throws.
 */
function openSession(ip, community, options = {}) {
  if (options.version === undefined || options.version === null || String(options.version).trim() === '') {
    return createSession(ip, community, options);
  }
  const version = normalizeSnmpVersion(options.version);
  if (version === 'v3') {
    return createV3Session(ip, options.v3, options);
  }
  if (version === 'v2c') {
    return createSession(ip, community, options);
  }
  throw new Error(`SNMP: unsupported SNMP version '${options.version}' (supported: 'v2c', 'v3')`);
}

/**
 * isV3AuthError(err) — true when net-snmp reports a USM authentication /
 * privacy failure (wrong passphrase, unknown user, unsupported security
 * level, decryption failure, engine time-window failure) rather than a
 * transport problem. net-snmp 3.29.2 surfaces these as Report-PDU
 * failures naming the usmStats counter (usmStatsWrongDigests,
 * usmStatsUnknownUserNames, usmStatsUnsupportedSecLevels,
 * usmStatsNotInTimeWindows, usmStatsUnknownEngineIDs,
 * usmStatsDecryptionError) or as "Authentication failed".
 *
 * A timeout is NOT an auth error: per RFC 3414 section 3.2 an agent
 * silently DROPS a message that fails authentication (wrong passphrase)
 * or decryption (wrong privacy key) and sends no response at all, so on
 * the client a wrong passphrase looks exactly like an unreachable host:
 * "Request timed out". Timeouts therefore stay timeouts and are reported
 * as such — never re-labelled as auth failures. (wrapV3Error adds a
 * factual note to v3 timeouts pointing at this possibility.)
 */
function isV3AuthError(err) {
  if (!err) return false;
  const msg = String((err && err.message) || err);
  return /authentication fail|wrong digest|usmStatsWrongDigests|usmStatsUnknownUserNames?|unknown user|unknown security name|usmStatsUnsupportedSecLevels|unsupported security level|usmStatsDecryptionError|decryption (error|failed)|decrypt/i.test(msg);
}

/**
 * wrapV3Error(err, ip, userName) — turn a USM failure into an honest,
 * actionable error naming the user and the device, without ever leaking
 * a passphrase. A Report-PDU auth failure (unknown user, unsupported
 * security level, ...) becomes an explicit authentication error. A
 * timeout passes through as a timeout, with a factual note: it can ALSO
 * mean the device silently dropped the request for bad USM credentials
 * (RFC 3414 — agents do not answer such messages), which is
 * indistinguishable from an unreachable host. Any other error passes
 * through unchanged.
 */
function wrapV3Error(err, ip, userName) {
  if (isV3AuthError(err)) {
    const detail = String((err && err.message) || err);
    return new Error(
      `SNMPv3 authentication/privacy failed for user '${userName || '?'}' on ${ip}: ${detail} ` +
      '(check the v3 user, auth/priv protocols and passphrases configured on the device; no value was returned)'
    );
  }
  if (isTimeoutError(err)) {
    return new Error(
      `${(err && err.message) || err} (SNMPv3 note: a timeout can also mean the device silently ` +
      `dropped the request — e.g. wrong USM user/passphrase for '${userName || '?'}' on ${ip}; ` +
      'per RFC 3414 an agent does not answer a message that fails authentication or decryption, ' +
      'so that looks identical to an unreachable host)'
    );
  }
  return err;
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
    // Highest OID returned so far. A batch whose OIDs do not advance past
    // it means the agent is answering the same OID again instead of the
    // next one — net-snmp's in-process Agent does exactly this for an
    // unimplemented table (20x NoSuchObject for the base OID, forever),
    // and net-snmp's subtree() only stops when the feed callback returns
    // true. A correct agent always returns strictly increasing OIDs, so a
    // real walk never trips this guard; without it, a walk against such
    // an agent spins forever instead of returning [].
    let maxOid = null;
    session.subtree(oid, 20, (varbinds) => {
      let progressed = false;
      for (const vb of varbinds) {
        const vbOid = String(vb.oid);
        if (maxOid === null || compareOids(vbOid, maxOid) > 0) {
          maxOid = vbOid;
          progressed = true;
        }
        if (snmp.isVarbindError(vb)) continue;
        if (vbOid !== base && !vbOid.startsWith(`${base}.`)) continue;
        try {
          rows.push(normaliseVarbind(vb));
        } catch (_err) {
          // One bad varbind must never throw out of net-snmp's UDP
          // callback (that kills the whole process); skip it.
          continue;
        }
      }
      // No OID advanced past the previous batch: the agent is looping
      // on the same OID. Stop the walk instead of spinning forever.
      if (!progressed) return true;
      return undefined;
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

/**
 * compareOids(a, b) — numeric per-component OID comparison (-1 / 0 / 1).
 * Plain string comparison is wrong here (".10" < ".9" lexicographically).
 */
function compareOids(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = i < pa.length ? pa[i] : 0;
    const y = i < pb.length ? pb[i] : 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function numericValue(vb) {
  if (!vb || vb.value === null || vb.value === undefined) return null;
  const n = Number(vb.value);
  return Number.isFinite(n) ? n : null;
}

// --- Generic primitives (exported for routes/tools) ------------------------

/**
 * snmpGet(ip, community, oids, options) — real SNMP GET for one or more OIDs.
 * Returns [{ oid, type, typeName, value, error? }]; a NoSuchObject varbind
 * is returned with value null and error 'NoSuchObject', NOT thrown.
 * Throws on timeout / unreachable host / other transport errors.
 * For SNMPv3 pass options { version: 'v3', v3: { user, authProtocol,
 * authPass, privProtocol, privPass } }; community is ignored for v3.
 */
async function snmpGet(ip, community, oids, options = {}) {
  if (!ip) throw new Error('snmpGet: no target IP supplied');
  const list = Array.isArray(oids) ? oids : [oids];
  const session = openSession(ip, community, options);
  try {
    return await sessionGet(session, list);
  } finally {
    session.close();
  }
}

/**
 * snmpWalk(ip, community, oid, options) — real SNMP walk of one subtree.
 * Returns the varbinds the device actually returned (possibly []).
 * Throws on timeout / unreachable host / other transport errors.
 * For SNMPv3 pass options { version: 'v3', v3: {...} }.
 */
async function snmpWalk(ip, community, oid, options = {}) {
  if (!ip) throw new Error('snmpWalk: no target IP supplied');
  const session = openSession(ip, community, options);
  try {
    return await sessionWalk(session, oid);
  } finally {
    session.close();
  }
}

/**
 * snmpGetV3(ip, v3, oids, options) — real SNMPv3 GET for one or more OIDs.
 * `v3` is the canonical device.snmp.v3 object. Returns the same varbind
 * shape as snmpGet. Throws on timeout / unreachable host, and throws an
 * honest authentication/privacy error (via wrapV3Error) when the device
 * rejects the USM credentials — never a null or fabricated value.
 */
async function snmpGetV3(ip, v3, oids, options = {}) {
  if (!ip) throw new Error('snmpGetV3: no target IP supplied');
  const list = Array.isArray(oids) ? oids : [oids];
  const session = createV3Session(ip, v3, options);
  try {
    return await sessionGet(session, list);
  } catch (err) {
    throw wrapV3Error(err, ip, v3 && v3.user);
  } finally {
    session.close();
  }
}

/**
 * snmpWalkV3(ip, v3, oid, options) — real SNMPv3 walk of one subtree.
 * Same contract as snmpWalk, over a USM session. Throws on timeout /
 * unreachable host and on USM authentication/privacy failure.
 */
async function snmpWalkV3(ip, v3, oid, options = {}) {
  if (!ip) throw new Error('snmpWalkV3: no target IP supplied');
  const session = createV3Session(ip, v3, options);
  try {
    return await sessionWalk(session, oid);
  } catch (err) {
    throw wrapV3Error(err, ip, v3 && v3.user);
  } finally {
    session.close();
  }
}

// --- System identity -------------------------------------------------------

/** Shared scalar mapping for getSystemInfo / getSystemInfoV3. */
function parseSystemInfo(varbinds) {
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
  return parseSystemInfo(varbinds);
}

/**
 * getSystemInfoV3(ip, v3, options) — same six system scalars as
 * getSystemInfo, over an SNMPv3 USM session. Throws on timeout/unreachable
 * and on USM authentication/privacy failure; an unimplemented scalar is
 * null, never invented.
 */
async function getSystemInfoV3(ip, v3, options = {}) {
  const varbinds = await snmpGetV3(ip, v3, [
    OID.sysDescr,
    OID.sysObjectID,
    OID.sysUpTime,
    OID.sysName,
    OID.sysLocation,
    OID.sysContact,
  ], options);
  return parseSystemInfo(varbinds);
}

// --- CPU + memory ----------------------------------------------------------

/**
 * v3UserFromOptions(options) — the v3 user name when the caller routed
 * through openSession with { version: 'v3', v3 }, else null. Lets the
 * shared getCpuMem/getInterfaces cores map a USM failure to an honest
 * auth error (instead of degrading to nulls) exactly like the dedicated
 * getCpuMemV3 / getInterfacesV3 variants do.
 */
function v3UserFromOptions(options = {}) {
  return options.version !== undefined
    && normalizeSnmpVersion(options.version) === 'v3'
    && options.v3 && typeof options.v3.user === 'string'
    ? options.v3.user
    : null;
}

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
  const session = openSession(ip, community, options);
  try {
    return await getCpuMemWithSession(session, ip, v3UserFromOptions(options));
  } finally {
    session.close();
  }
}

/**
 * getCpuMemV3(ip, v3, options) — same CPU/memory reading as getCpuMem,
 * over an SNMPv3 USM session. A USM authentication/privacy failure
 * THROWS (honest error); a device without CISCO-PROCESS-MIB /
 * CISCO-MEMORY-POOL-MIB returns nulls, exactly as the v2c variant does.
 */
async function getCpuMemV3(ip, v3, options = {}) {
  const session = createV3Session(ip, v3, options);
  try {
    return await getCpuMemWithSession(session, ip, v3 && v3.user);
  } catch (err) {
    throw wrapV3Error(err, ip, v3 && v3.user);
  } finally {
    session.close();
  }
}

/**
 * getCpuMemWithSession(session, ip, v3UserName) — session-agnostic core of
 * getCpuMem / getCpuMemV3. v3UserName is null for v2c (auth-error mapping
 * disabled, behaviour identical to the pre-v3 code) and the v3 user name
 * for v3 sessions (a USM failure throws instead of degrading to nulls).
 */
async function getCpuMemWithSession(session, ip, v3UserName) {
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
    const authFailure = [revSettled, legacySettled].find(
      (r) => r.status === 'rejected' && v3UserName && isV3AuthError(r.reason)
    );
    if (authFailure) {
      throw wrapV3Error(authFailure.reason, ip, v3UserName);
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
        if (v3UserName && isV3AuthError(err)) throw wrapV3Error(err, ip, v3UserName);
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
        if (v3UserName && isV3AuthError(err)) throw wrapV3Error(err, ip, v3UserName);
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
      if (v3UserName && isV3AuthError(err)) throw wrapV3Error(err, ip, v3UserName);
      return [];
    });
    const used = numericValue(memGets.find((vb) => vb.oid === `${OID.ciscoMemoryPoolUsed}.${poolIndex}`));
    const free = numericValue(memGets.find((vb) => vb.oid === `${OID.ciscoMemoryPoolFree}.${poolIndex}`));
    if (used !== null && free !== null && used + free > 0) {
      memUsedPct = Math.round((used / (used + free)) * 1000) / 10;
    }

    return { cpu5min, memUsedPct };
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
  const session = openSession(ip, community, options);
  try {
    return await getInterfacesWithSession(session, ip, v3UserFromOptions(options));
  } finally {
    session.close();
  }
}

/**
 * getInterfacesV3(ip, v3, options) — same ifTable reading as
 * getInterfaces, over an SNMPv3 USM session. A USM authentication/privacy
 * failure THROWS; a device with no interfaces returns [].
 */
async function getInterfacesV3(ip, v3, options = {}) {
  const session = createV3Session(ip, v3, options);
  try {
    return await getInterfacesWithSession(session, ip, v3 && v3.user);
  } catch (err) {
    throw wrapV3Error(err, ip, v3 && v3.user);
  } finally {
    session.close();
  }
}

/**
 * getInterfacesWithSession(session, ip, v3UserName) — session-agnostic core
 * of getInterfaces / getInterfacesV3. v3UserName is null for v2c (auth-error
 * mapping disabled, behaviour identical to the pre-v3 code).
 */
async function getInterfacesWithSession(session, ip, v3UserName) {
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
    const authFailure = settled.find(
      (r) => r.status === 'rejected' && v3UserName && isV3AuthError(r.reason)
    );
    if (authFailure) {
      throw wrapV3Error(authFailure.reason, ip, v3UserName);
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
}

module.exports = {
  OID,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_RETRIES,
  V3_AUTH_PROTOCOLS,
  V3_PRIV_PROTOCOLS,
  getSystemInfo,
  getSystemInfoV3,
  getCpuMem,
  getCpuMemV3,
  getInterfaces,
  getInterfacesV3,
  snmpGet,
  snmpGetV3,
  snmpWalk,
  snmpWalkV3,
  createV3Session,
  createSnmpSession,
  openSession,
  normalizeSnmpVersion,
  validateV3,
  describeSnmpV3,
  isV3AuthError,
  wrapV3Error,
  isTimeoutError,
};
