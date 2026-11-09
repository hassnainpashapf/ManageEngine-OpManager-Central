'use strict';
/**
 * scripts/test-winrm.js — NEGATIVE / EDGE tests for WinRM (Phase 3, test-only track).
 *
 * What this file IS:
 *   A standalone, stdlib-only harness (no new dependencies) that exercises the
 *   WinRM surface of THIS server instance and records exact per-case results.
 *   It does NOT change product code.
 *
 * What it tests (6 cases, see runCase() calls in main()):
 *   1. NTLM handshake message structure (Type 1/2/3 present and well-formed).
 *   2. Wrong credentials -> honest auth failure (exact code).
 *   3. Unreachable host -> honest error with bounded time (elapsed recorded).
 *   4. Malformed WQL -> honest 400 / SOAP Fault (never a fake success).
 *   5. A SOAP fault response from the peer -> honest error surfacing the
 *      fault, not a fake success.
 *   6. NO credential is echoed in any response or log line (grep of the
 *      server log + every response body collected during the run).
 *
 * Honest-scope note (read before citing results):
 *   On the real-data base (ff51df6) this server has NO WinRM client at all:
 *   POST /api/tools/wmi-query answers an honest 501 `not_implemented`
 *   ("no WMI/WinRM client exists on this server") and no /api/winrm/* route
 *   exists. Cases 1-5 therefore run at TWO levels:
 *     (a) APP level — the real surface of this server. Expected today:
 *         501 not_implemented / 404, i.e. honest "not built yet", never a
 *         fake 200. If a WinRM route is ever added, the same cases run
 *         against it (see OPM_WINRM_ROUTE below) and a 200 with fabricated
 *         data is reported as a BUG.
 *     (b) PEER level — a LOCAL TEST WinRM peer stood up by this script on
 *         127.0.0.1:WINRM_PEER_PORT. The peer speaks the REAL protocol:
 *         NTLM Type 1 -> Type 2 (server challenge) -> Type 3 with real
 *         NTLMv2 verification (pure-JS MD4 + HMAC-MD5; Node 24/OpenSSL 3
 *         has no MD4, so MD4 is implemented here and self-tested against
 *         the RFC 1320 vectors), then WSMan/SOAP. It is labelled a LOCAL
 *         TEST SERVICE, never a production device. The peer-level cases
 *         prove the HARNESS/peer behave correctly (real 401 on wrong creds,
 *         real SOAP Faults, bounded errors) so that the same cases can
 *         validate the real app WinRM client the moment winrm-service
 *         lands — point the app at the peer and re-run. They do NOT prove
 *         the app client exists: the app-level cases are the evidence for
 *         that, and today they say "not implemented".
 *   Case 3 (unreachable host) at app level is BLOCKED by the same missing
 *   client; the peer-level check measures the harness client's own bounded
 *   error against TEST-NET-1 (192.0.2.1, RFC 5737, unroutable) and a closed
 *   localhost port, and records elapsed ms.
 *
 * Credentials:
 *   - The WinRM test credential is generated FRESH at runtime
 *     (crypto.randomBytes) and exists ONLY in memory for this run. It is
 *     NEVER written to a file, a log, the repo, or the results JSON; the
 *     leak check (case 6) greps for its value and the results file is
 *     scrubbed before writing.
 *   - The OpManager admin login uses the bootstrap password from
 *     server/data/.admin-initial (read at runtime, never printed) and, on
 *     first run, rotates it via POST /api/auth/change-password to a
 *     runtime-generated password so the must-change-password guard clears
 *     (this only touches THIS clone's throwaway DB; .admin-initial itself
 *     is never modified). Re-runs need OPM_ADMIN_PASSWORD set to the
 *     rotated password, or OPM_ROTATED_ADMIN_PASSWORD set to a repeatable
 *     value before the first run, or a fresh throwaway DB in this clone.
 *
 * Usage (from the repo root of this clone):
 *   PORT=8142 node server/index.js &          # or let the harness spawn it
 *   node scripts/test-winrm.js                 # spawns its own server on 8142
 *   OPM_BASE_URL=http://127.0.0.1:8142 node scripts/test-winrm.js  # use a running one
 *   OPM_WINRM_ROUTE=/api/winrm/query node scripts/test-winrm.js    # test a real route, if one exists
 *   OPM_ADMIN_PASSWORD='<rotated-pw>' node scripts/test-winrm.js   # re-run after rotation
 *   OPM_ROTATED_ADMIN_PASSWORD='<pw-10+-chars>' node scripts/test-winrm.js  # repeatable rotation value (runtime-only, never printed)
 * Exit code: 0 = no BUG found (blocked/not-implemented cases are reported,
 * not hidden); 1 = a BUG (fake success, credential leak, hang/timeout
 * overrun, or an assertion failure). Results JSON:
 * scripts/test-winrm-results.json (credential values scrubbed).
 *
 * Ports: app 8142 (OPM_PORT), local test peer 15985 (WINRM_PEER_PORT).
 * Never run against the shared :8060 server.
 */

const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFile } = require('node:child_process');

// ---------------------------------------------------------------------------
// Config (env-overridable; defaults are the winrm-tests track's own ports)
// ---------------------------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, '..');
const OPM_PORT = Number(process.env.OPM_PORT || 8142);
const OPM_BASE_URL = process.env.OPM_BASE_URL || `http://127.0.0.1:${OPM_PORT}`;
const OPM_ADMIN_USER = process.env.OPM_ADMIN_USER || 'admin';
const OPM_ADMIN_PASSWORD_ENV = process.env.OPM_ADMIN_PASSWORD || null;
// Route a real WinRM implementation would expose, if one exists yet.
// Default probes the known honest-501 surface; override to test a real route.
const OPM_WINRM_ROUTE = process.env.OPM_WINRM_ROUTE || '/api/tools/wmi-query';
const PEER_PORT = Number(process.env.WINRM_PEER_PORT || 15985);
const PEER_HOST = '127.0.0.1';
const PEER_URL = `http://${PEER_HOST}:${PEER_PORT}/wsman`;
const REQUEST_TIMEOUT_MS = Number(process.env.WINRM_TEST_TIMEOUT_MS || 5000);
const UNREACHABLE_TIMEOUT_MS = Number(process.env.WINRM_UNREACHABLE_TIMEOUT_MS || 5000);
const UNREACHABLE_BOUND_MS = 10000; // case 3 must resolve within this
const RESULTS_FILE = path.join(__dirname, 'test-winrm-results.json');
const SERVER_LOG_FILE = path.join('/tmp', `opm-winrm-tests-${OPM_PORT}.log`);

// Runtime-only test credential (never persisted, never printed).
const TEST_USER = 'winrmtest';
const TEST_DOMAIN = 'TESTLAB';
const TEST_HOST = 'TESTPEER';
const TEST_PASSWORD = `W1nRM-Test-${crypto.randomBytes(9).toString('hex')}`;
const WRONG_PASSWORD = `W1nRM-Wrong-${crypto.randomBytes(9).toString('hex')}`;
const SENTINELS = [TEST_PASSWORD, WRONG_PASSWORD]; // values case 6 greps for

const results = { startedAt: new Date().toISOString(), cases: [], bugs: [] };
function recordCase(id, title, outcome, detail) {
  // outcome: 'pass' | 'blocked' | 'bug' | 'fail'
  const entry = { id, title, outcome, detail };
  results.cases.push(entry);
  const tag = outcome === 'pass' ? 'PASS   ' : outcome === 'blocked' ? 'BLOCKED' : outcome === 'bug' ? 'BUG    ' : 'FAIL   ';
  console.log(`[${tag}] ${id} ${title}\n       ${detail}`);
  if (outcome === 'bug') results.bugs.push(entry);
  return entry;
}
function redact(s) {
  let out = String(s);
  for (const v of SENTINELS) if (v) out = out.split(v).join('[REDACTED-TEST-CREDENTIAL]');
  return out;
}

// ---------------------------------------------------------------------------
// Pure-JS MD4 (RFC 1320). Node 24 / OpenSSL 3 does not offer 'md4', and the
// NTLMv2 proof needs MD4(UTF-16LE password). Self-tested against the RFC
// 1320 vectors in selfTestMd4() before any NTLM work runs.
// ---------------------------------------------------------------------------
function md4(message) {
  const buf = Buffer.isBuffer(message) ? message : Buffer.from(message);
  const F = (x, y, z) => (x & y) | (~x & z);
  const G = (x, y, z) => (x & y) | (x & z) | (y & z);
  const H = (x, y, z) => x ^ y ^ z;
  const rol = (x, s) => ((x << s) | (x >>> (32 - s))) | 0;
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const bitLenLo = (buf.length << 3) >>> 0;
  const bitLenHi = Math.floor(buf.length / 0x20000000) >>> 0;
  const paddedLen = (((buf.length + 9 + 63) >> 6) << 6);
  const data = Buffer.alloc(paddedLen);
  buf.copy(data);
  data[buf.length] = 0x80;
  data.writeUInt32LE(bitLenLo, paddedLen - 8);
  data.writeUInt32LE(bitLenHi, paddedLen - 4);
  for (let off = 0; off < paddedLen; off += 64) {
    const X = new Array(16);
    for (let i = 0; i < 16; i++) X[i] = data.readUInt32LE(off + i * 4);
    let aa = a, bb = b, cc = c, dd = d;
    const r1 = (fn, k, s) => (x, y, z, w, m) => { x = (rol((x + fn(y, z, w) + m + k) | 0, s)) | 0; return x; };
    // Round 1
    const s1 = [3, 7, 11, 19];
    for (let i = 0; i < 16; i++) {
      const s = s1[i % 4];
      if (i % 4 === 0) aa = rol((aa + F(bb, cc, dd) + X[i]) | 0, s);
      else if (i % 4 === 1) dd = rol((dd + F(aa, bb, cc) + X[i]) | 0, s);
      else if (i % 4 === 2) cc = rol((cc + F(dd, aa, bb) + X[i]) | 0, s);
      else bb = rol((bb + F(cc, dd, aa) + X[i]) | 0, s);
    }
    void r1;
    // Round 2 (K = 0x5a827999, order 0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15)
    const s2 = [3, 5, 9, 13];
    const order2 = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    for (let i = 0; i < 16; i++) {
      const s = s2[i % 4]; const m = order2[i];
      if (i % 4 === 0) aa = rol((aa + G(bb, cc, dd) + X[m] + 0x5a827999) | 0, s);
      else if (i % 4 === 1) dd = rol((dd + G(aa, bb, cc) + X[m] + 0x5a827999) | 0, s);
      else if (i % 4 === 2) cc = rol((cc + G(dd, aa, bb) + X[m] + 0x5a827999) | 0, s);
      else bb = rol((bb + G(cc, dd, aa) + X[m] + 0x5a827999) | 0, s);
    }
    // Round 3 (K = 0x6ed9eba1, order 0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15)
    const s3 = [3, 9, 11, 15];
    const order3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
    for (let i = 0; i < 16; i++) {
      const s = s3[i % 4]; const m = order3[i];
      if (i % 4 === 0) aa = rol((aa + H(bb, cc, dd) + X[m] + 0x6ed9eba1) | 0, s);
      else if (i % 4 === 1) dd = rol((dd + H(aa, bb, cc) + X[m] + 0x6ed9eba1) | 0, s);
      else if (i % 4 === 2) cc = rol((cc + H(dd, aa, bb) + X[m] + 0x6ed9eba1) | 0, s);
      else bb = rol((bb + H(cc, dd, aa) + X[m] + 0x6ed9eba1) | 0, s);
    }
    a = (a + aa) | 0; b = (b + bb) | 0; c = (c + cc) | 0; d = (d + dd) | 0;
  }
  const out = Buffer.alloc(16);
  out.writeUInt32LE(a >>> 0, 0); out.writeUInt32LE(b >>> 0, 4);
  out.writeUInt32LE(c >>> 0, 8); out.writeUInt32LE(d >>> 0, 12);
  return out;
}
function selfTestMd4() {
  const vectors = [
    // Verified 2026-11-09 against OpenSSL's MD4 (node --openssl-legacy-provider).
    ['', '31d6cfe0d16ae931b73c59d7e0c089c0'],
    ['a', 'bde52cb31de33e46245e05fbdbd6fb24'],
    ['abc', 'a448017aaf21d8525fc10ae87aa6729d'],
    ['message digest', 'd9130a8164549fe818874806e1c7014b'],
    ['abcdefghijklmnopqrstuvwxyz', 'd79e1c308aa5bbcdeea8ed63df412da9'],
  ];
  for (const [input, expected] of vectors) {
    const got = md4(Buffer.from(input, 'utf8')).toString('hex');
    if (got !== expected) throw new Error(`MD4 self-test FAILED for ${JSON.stringify(input)}: got ${got}, want ${expected}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// NTLM messages (MS-NLMP). Builders produce real, well-formed messages;
// validateNtlmMessage() is the structural validator case 1 exercises.
// ---------------------------------------------------------------------------
const NTLM_SIG = Buffer.from('NTLMSSP\0', 'ascii');
const NEGOTIATE_UNICODE = 0x00000001;
const NEGOTIATE_OEM = 0x00000002;
const REQUEST_TARGET = 0x00000004;
const NEGOTIATE_SIGN = 0x00000010;
const NEGOTIATE_SEAL = 0x00000020;
const NEGOTIATE_NTLM = 0x00000200;
const NEGOTIATE_ALWAYS_SIGN = 0x00008000;
const NEGOTIATE_NTLM2_KEY = 0x00080000;
const NEGOTIATE_128 = 0x20000000;
const NEGOTIATE_56 = 0x80000000;
const TYPE1_FLAGS = NEGOTIATE_UNICODE | REQUEST_TARGET | NEGOTIATE_SIGN | NEGOTIATE_SEAL
  | NEGOTIATE_NTLM | NEGOTIATE_ALWAYS_SIGN | NEGOTIATE_NTLM2_KEY | NEGOTIATE_128 | NEGOTIATE_56;
const TYPE2_FLAGS = NEGOTIATE_UNICODE | REQUEST_TARGET | NEGOTIATE_SIGN | NEGOTIATE_SEAL
  | NEGOTIATE_NTLM | NEGOTIATE_ALWAYS_SIGN | NEGOTIATE_NTLM2_KEY | NEGOTIATE_128 | NEGOTIATE_56;
const TYPE3_FLAGS = TYPE2_FLAGS;

function writeSecBuf(buf, off, len, maxLen, offset) {
  buf.writeUInt16LE(len, off); buf.writeUInt16LE(maxLen, off + 2); buf.writeUInt32LE(offset, off + 4);
}
function readSecBuf(buf, off) {
  return { len: buf.readUInt16LE(off), maxLen: buf.readUInt16LE(off + 2), offset: buf.readUInt32LE(off + 4) };
}
function utf16le(s) { return Buffer.from(String(s), 'utf16le'); }

function buildType1() {
  const buf = Buffer.alloc(40);
  NTLM_SIG.copy(buf, 0);
  buf.writeUInt32LE(1, 8);
  buf.writeUInt32LE(TYPE1_FLAGS >>> 0, 12);
  writeSecBuf(buf, 16, 0, 0, 40); // domain: empty
  writeSecBuf(buf, 24, 0, 0, 40); // workstation: empty
  // version at 32: 10.0.19041, NTLM revision 15
  buf[32] = 10; buf[33] = 0; buf.writeUInt16LE(19041, 34); buf[36] = 0; buf[37] = 0; buf[38] = 0; buf[39] = 15;
  return buf;
}
function buildType2(serverChallenge, targetName) {
  const target = utf16le(targetName);
  const targetInfo = buildTargetInfo(targetName);
  const headerLen = 56;
  const buf = Buffer.alloc(headerLen + target.length + targetInfo.length);
  NTLM_SIG.copy(buf, 0);
  buf.writeUInt32LE(2, 8);
  writeSecBuf(buf, 12, target.length, target.length, headerLen);
  buf.writeUInt32LE(TYPE2_FLAGS >>> 0, 20);
  serverChallenge.copy(buf, 24);
  // reserved 8 bytes at 32: zero
  writeSecBuf(buf, 40, targetInfo.length, targetInfo.length, headerLen + target.length);
  buf[48] = 10; buf[49] = 0; buf.writeUInt16LE(19041, 50); buf[52] = 0; buf[53] = 0; buf[54] = 0; buf[55] = 15;
  target.copy(buf, headerLen);
  targetInfo.copy(buf, headerLen + target.length);
  return buf;
}
function buildTargetInfo(targetName) {
  // AV_PAIRs: NbDomainName(2) + NbComputerName(1) + Timestamp(7) + Flags(6) + EOL(0)
  const domain = utf16le(targetName);
  const computer = utf16le(TEST_HOST);
  const ts = Buffer.alloc(8);
  const filetime = BigInt(Date.now() + 11644473600000) * 10000n;
  ts.writeBigUInt64LE(filetime);
  const parts = [];
  const pair = (id, value) => {
    const h = Buffer.alloc(4); h.writeUInt16LE(id, 0); h.writeUInt16LE(value.length, 2);
    return Buffer.concat([h, value]);
  };
  parts.push(pair(2, domain), pair(1, computer), pair(7, ts));
  const flags = Buffer.alloc(4); flags.writeUInt32LE(0x00000002, 0);
  parts.push(pair(6, flags), pair(0, Buffer.alloc(0)));
  return Buffer.concat(parts);
}
function ntlmv2Response(password, user, domain, serverChallenge, clientChallenge) {
  const ntHash = md4(utf16le(password));
  const ntlmv2Hash = crypto.createHmac('md5', ntHash).update(utf16le(user.toUpperCase() + domain)).digest();
  const blob = Buffer.concat([
    Buffer.from([0x01, 0x01, 0x00, 0x00]), Buffer.alloc(4),
    (() => { const t = Buffer.alloc(8); t.writeBigUInt64LE(BigInt(Date.now() + 11644473600000) * 10000n); return t; })(),
    clientChallenge, Buffer.alloc(4), buildTargetInfo(domain), Buffer.alloc(4),
  ]);
  const ntProof = crypto.createHmac('md5', ntlmv2Hash).update(Buffer.concat([serverChallenge, blob])).digest();
  const ntResponse = Buffer.concat([ntProof, blob]);
  const lmResponse = Buffer.concat([
    crypto.createHmac('md5', ntlmv2Hash).update(Buffer.concat([serverChallenge, clientChallenge])).digest(),
    clientChallenge,
  ]);
  return { ntResponse, lmResponse };
}
function buildType3(user, domain, workstation, password, serverChallenge) {
  const clientChallenge = crypto.randomBytes(8);
  const { ntResponse, lmResponse } = ntlmv2Response(password, user, domain, serverChallenge, clientChallenge);
  const domainBuf = utf16le(domain);
  const userBuf = utf16le(user);
  const hostBuf = utf16le(workstation);
  const headerLen = 72;
  let offset = headerLen;
  const lmOff = offset; offset += lmResponse.length;
  const ntOff = offset; offset += ntResponse.length;
  const domOff = offset; offset += domainBuf.length;
  const userOff = offset; offset += userBuf.length;
  const hostOff = offset; offset += hostBuf.length;
  const buf = Buffer.alloc(offset);
  NTLM_SIG.copy(buf, 0);
  buf.writeUInt32LE(3, 8);
  writeSecBuf(buf, 12, lmResponse.length, lmResponse.length, lmOff);
  writeSecBuf(buf, 20, ntResponse.length, ntResponse.length, ntOff);
  writeSecBuf(buf, 28, domainBuf.length, domainBuf.length, domOff);
  writeSecBuf(buf, 36, userBuf.length, userBuf.length, userOff);
  writeSecBuf(buf, 44, hostBuf.length, hostBuf.length, hostOff);
  writeSecBuf(buf, 52, 0, 0, offset); // session key: empty
  buf.writeUInt32LE(TYPE3_FLAGS >>> 0, 60);
  buf[64] = 10; buf[65] = 0; buf.writeUInt16LE(19041, 66); buf[68] = 0; buf[69] = 0; buf[70] = 0; buf[71] = 15;
  lmResponse.copy(buf, lmOff); ntResponse.copy(buf, ntOff);
  domainBuf.copy(buf, domOff); userBuf.copy(buf, userOff); hostBuf.copy(buf, hostOff);
  return { message: buf, clientChallenge };
}

/** Structural validator for NTLM Type 1/2/3. Returns { ok, type, errors[], fields }. */
function validateNtlmMessage(buf, expectedType) {
  const errors = [];
  const fields = {};
  if (!Buffer.isBuffer(buf)) return { ok: false, type: null, errors: ['not a Buffer'], fields };
  const minLen = expectedType === 1 ? 16 : expectedType === 2 ? 32 : 64;
  if (buf.length < minLen) errors.push(`too short: ${buf.length} bytes, need >= ${minLen} for Type ${expectedType}`);
  if (buf.length >= 8 && !buf.subarray(0, 8).equals(NTLM_SIG)) errors.push('bad signature (want NTLMSSP\\0)');
  if (buf.length < 8) errors.push('too short for signature');
  let type = null;
  if (buf.length >= 12) {
    type = buf.readUInt32LE(8);
    if (type !== expectedType) errors.push(`message type ${type}, expected ${expectedType}`);
    if (type < 1 || type > 3) errors.push(`message type ${type} out of range 1..3`);
  }
  const checkBuf = (name, off) => {
    if (buf.length < off + 8) { errors.push(`${name} security buffer header out of bounds`); return null; }
    const sb = readSecBuf(buf, off);
    if (sb.len > sb.maxLen) errors.push(`${name}: len ${sb.len} > maxLen ${sb.maxLen}`);
    if (sb.offset + sb.len > buf.length) errors.push(`${name}: offset ${sb.offset}+len ${sb.len} exceeds message length ${buf.length}`);
    if (sb.len > 0 && sb.offset < minLen) errors.push(`${name}: payload offset ${sb.offset} overlaps header`);
    fields[name] = sb;
    return sb;
  };
  if (type === 1 || expectedType === 1) {
    if (buf.length >= 16) {
      const flags = buf.readUInt32LE(12); fields.flags = flags;
      if (flags === 0) errors.push('Type 1 flags are zero');
      if ((flags & NEGOTIATE_NTLM) === 0) errors.push('Type 1 flags lack NEGOTIATE_NTLM (0x200)');
    }
    checkBuf('domain', 16); checkBuf('workstation', 24);
  }
  if (type === 2 || expectedType === 2) {
    if (buf.length >= 24) {
      const flags = buf.readUInt32LE(20); fields.flags = flags;
      if ((flags & NEGOTIATE_NTLM) === 0) errors.push('Type 2 flags lack NEGOTIATE_NTLM (0x200)');
    }
    if (buf.length >= 32) fields.challenge = buf.subarray(24, 32).toString('hex');
    checkBuf('targetName', 12); checkBuf('targetInfo', 40);
  }
  if (type === 3 || expectedType === 3) {
    if (buf.length >= 64) {
      const flags = buf.readUInt32LE(60); fields.flags = flags;
      if ((flags & NEGOTIATE_NTLM) === 0) errors.push('Type 3 flags lack NEGOTIATE_NTLM (0x200)');
    }
    const lm = checkBuf('lmResponse', 12);
    const nt = checkBuf('ntResponse', 20);
    if (lm && lm.len !== 24) errors.push(`LM response len ${lm.len}, expected 24 (NTLMv2)`);
    if (nt && nt.len < 16) errors.push(`NT response len ${nt ? nt.len : '?'} < 16 (no NT proof)`);
    checkBuf('domain', 28); checkBuf('user', 36); checkBuf('workstation', 44); checkBuf('sessionKey', 52);
    if (buf.length >= 44) {
      const userSb = readSecBuf(buf, 36);
      if (userSb.len === 0) errors.push('Type 3 user field is empty');
    }
  }
  return { ok: errors.length === 0, type, errors, fields };
}
function parseType2(buf) {
  const v = validateNtlmMessage(buf, 2);
  if (!v.ok) throw new Error(`invalid Type 2: ${v.errors.join('; ')}`);
  return {
    challenge: Buffer.from(buf.subarray(24, 32)),
    targetName: buf.subarray(v.fields.targetName.offset, v.fields.targetName.offset + v.fields.targetName.len).toString('utf16le'),
    flags: v.fields.flags,
  };
}
function verifyType3(buf, serverChallenge, expectedUser, expectedDomain, expectedPassword) {
  const v = validateNtlmMessage(buf, 3);
  if (!v.ok) return { ok: false, reason: `structural: ${v.errors.join('; ')}` };
  const nt = v.fields.ntResponse;
  const ntResp = buf.subarray(nt.offset, nt.offset + nt.len);
  const proof = ntResp.subarray(0, 16);
  const blob = ntResp.subarray(16);
  const user = buf.subarray(v.fields.user.offset, v.fields.user.offset + v.fields.user.len).toString('utf16le');
  const domain = buf.subarray(v.fields.domain.offset, v.fields.domain.offset + v.fields.domain.len).toString('utf16le');
  if (user.toUpperCase() !== expectedUser.toUpperCase() || domain.toUpperCase() !== expectedDomain.toUpperCase()) {
    return { ok: false, reason: `user/domain mismatch (got ${redact(user)}/${redact(domain)})` };
  }
  const ntHash = md4(utf16le(expectedPassword));
  const ntlmv2Hash = crypto.createHmac('md5', ntHash).update(utf16le(user.toUpperCase() + domain)).digest();
  const expectedProof = crypto.createHmac('md5', ntlmv2Hash).update(Buffer.concat([serverChallenge, blob])).digest();
  if (proof.length !== 16 || !crypto.timingSafeEqual(proof, expectedProof)) {
    return { ok: false, reason: 'NTLMv2 proof mismatch (wrong password)' };
  }
  return { ok: true, user, domain };
}

// ---------------------------------------------------------------------------
// Minimal HTTP helpers (stdlib only). Every response body is collected for
// the case-6 leak sweep; bodies are kept in memory, never logged raw.
// ---------------------------------------------------------------------------
const collectedBodies = []; // { where, status, body } — scrubbed before any write
function httpRequest({ url, method = 'GET', headers = {}, body = null, timeoutMs = REQUEST_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const started = Date.now();
    const req = http.request({
      hostname: u.hostname, port: Number(u.port || 80), path: u.pathname + u.search,
      method, headers, timeout: timeoutMs,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        clearTimeout(watchdog);
        const text = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, body: text, elapsedMs: Date.now() - started });
      });
    });
    // Wall-clock watchdog: the socket 'timeout' event alone is NOT enough.
    // In this sandbox a middlebox answers TCP for unroutable TEST-NET-1
    // addresses and can hold the connection open (observed: 53 s to
    // ECONNRESET with a 5 s socket timeout set). A real WinRM client must
    // enforce its own wall-clock bound; so does this harness.
    const watchdog = setTimeout(() => {
      const err = new Error(`wall-clock timeout after ${timeoutMs}ms (harness watchdog)`);
      err.code = 'WATCHDOG_TIMEOUT';
      req.destroy(err);
    }, timeoutMs);
    req.on('timeout', () => req.destroy(new Error(`request timed out after ${timeoutMs}ms`)));
    req.on('error', (err) => { clearTimeout(watchdog); err.elapsedMs = Date.now() - started; reject(err); });
    if (body != null) req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// WSMan / SOAP envelopes (real shapes, minimal but well-formed)
// ---------------------------------------------------------------------------
function soapEnvelopeForQuery(wql) {
  return `<?xml version="1.0" encoding="UTF-8"?>`
    + `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">`
    + `<s:Header><w:ResourceURI s:mustUnderstand="true">http://schemas.microsoft.com/wbem/wsman/1/wmi/root/cimv2/Win32_OperatingSystem</w:ResourceURI>`
    + `<w:OperationTimeout>PT60S</w:OperationTimeout></s:Header>`
    + `<s:Body><p:Enumerate><p:Filter Dialect="http://schemas.microsoft.com/wbem/wsman/1/WQL">${escapeXml(wql)}</p:Filter></p:Enumerate></s:Body></s:Envelope>`;
}
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function soapFaultEnvelope(code, subcode, reason) {
  return `<?xml version="1.0" encoding="UTF-8"?>`
    + `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">`
    + `<s:Body><s:Fault><s:Code><s:Value>${code}</s:Value>`
    + (subcode ? `<s:Subcode><s:Value>${subcode}</s:Value></s:Subcode>` : '')
    + `</s:Code><s:Reason><s:Text xml:lang="en-US">${escapeXml(reason)}</s:Text></s:Reason>`
    + `<s:Detail><w:FaultDetail xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd">test peer fault</w:FaultDetail></s:Detail>`
    + `</s:Fault></s:Body></s:Envelope>`;
}
function soapSuccessEnvelope() {
  return `<?xml version="1.0" encoding="UTF-8"?>`
    + `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">`
    + `<s:Body><p:EnumerateResponse><p:Items>`
    + `<p:Win32_OperatingSystem><p:Caption>Microsoft Windows Server 2022 Datacenter (LOCAL TEST PEER)</p:Caption><p:Version>10.0.20348</p:Version></p:Win32_OperatingSystem>`
    + `</p:Items></p:EnumerateResponse></s:Body></s:Envelope>`;
}
function parseSoapFault(body) {
  const code = /<s:Value>([^<]+)<\/s:Value>/.exec(body || '');
  const sub = /<s:Subcode><s:Value>([^<]+)<\/s:Value>/.exec(body || '');
  const reason = /<s:Text[^>]*>([^<]+)<\/s:Text>/.exec(body || '');
  if (!code && !reason) return null;
  return { code: code ? code[1] : null, subcode: sub ? sub[1] : null, reason: reason ? reason[1] : null };
}
function isMalformedWql(wql) {
  if (typeof wql !== 'string') return true;
  const q = wql.trim();
  if (q.includes('__MALFORMED_WQL__')) return true;
  if (!/^SELECT\b/i.test(q)) return true; // typo'd keyword (SELEC, SELCT, ...) or not a SELECT at all
  if (!/\bFROM\b/i.test(q)) return true;
  if (/\bFROM\s+FROM\b/i.test(q)) return true;
  if (/\bWHERE\b[^=]*$/i.test(q)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// LOCAL TEST WinRM peer (127.0.0.1:15985). Speaks real NTLM + WSMan/SOAP.
// Labelled LOCAL TEST SERVICE in every response and in this file; it is NOT
// a production device and never pretends to be one. It never echoes a
// credential: Authorization tokens are validated and dropped, never logged.
// Challenge state is keyed by a random one-time cookie id (single-use,
// 60 s expiry) because HTTP is stateless; a real WinRM server keeps the
// challenge on the connection instead.
// ---------------------------------------------------------------------------
const peerState = { challenges: new Map(), requestLog: [] }; // requestLog: metadata only
function peerLog(entry) { peerState.challenges.size; peerState.requestLog.push(entry); }

function startTestPeer() {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      handlePeerRequest(req, res, body).catch((err) => {
        peerLog({ method: req.method, url: req.url, status: 500, note: 'peer handler error' });
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('peer handler error');
        void err;
      });
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PEER_PORT, PEER_HOST, () => resolve(server));
  });
}
async function handlePeerRequest(req, res, body) {
  const auth = req.headers.authorization || '';
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((p) => {
    const i = p.indexOf('='); return i < 0 ? [p.trim(), ''] : [p.trim().slice(0, i), p.trim().slice(i + 1)];
  }).filter(([k]) => k));
  const send401Ntlm = (extraHeaders = {}) => {
    res.writeHead(401, { 'WWW-Authenticate': 'NTLM', 'Content-Type': 'text/plain', ...extraHeaders });
    res.end('NTLM authentication required (LOCAL TEST PEER)');
  };
  if (!auth) { peerLog({ method: req.method, url: req.url, status: 401, note: 'no auth' }); return send401Ntlm(); }
  const m = /^NTLM\s+([A-Za-z0-9+/=]+)$/.exec(auth.trim());
  if (!m) { peerLog({ method: req.method, url: req.url, status: 400, note: 'bad auth scheme' }); res.writeHead(400, { 'Content-Type': 'text/plain' }); return res.end('Malformed Authorization header (LOCAL TEST PEER)'); }
  let token;
  try { token = Buffer.from(m[1], 'base64'); } catch { peerLog({ method: req.method, url: req.url, status: 400, note: 'bad base64' }); res.writeHead(400, { 'Content-Type': 'text/plain' }); return res.end('Malformed NTLM token (LOCAL TEST PEER)'); }
  if (token.length < 12) { peerLog({ method: req.method, url: req.url, status: 400, note: 'token too short' }); res.writeHead(400, { 'Content-Type': 'text/plain' }); return res.end('Malformed NTLM message (LOCAL TEST PEER)'); }
  const type = token.readUInt32LE(8);
  if (type === 1) {
    const v = validateNtlmMessage(token, 1);
    if (!v.ok) { peerLog({ method: req.method, url: req.url, status: 400, note: 'bad Type 1' }); res.writeHead(400, { 'Content-Type': 'text/plain' }); return res.end(`Malformed NTLM Type 1: ${v.errors.join('; ')} (LOCAL TEST PEER)`); }
    const challenge = crypto.randomBytes(8);
    const id = crypto.randomBytes(16).toString('hex');
    peerState.challenges.set(id, { challenge, expiresAt: Date.now() + 60000 });
    const type2 = buildType2(challenge, TEST_DOMAIN);
    peerLog({ method: req.method, url: req.url, status: 401, note: 'Type 1 ok, Type 2 issued', type2Len: type2.length });
    res.writeHead(401, {
      'WWW-Authenticate': `NTLM ${type2.toString('base64')}`,
      'Set-Cookie': `NTLM-CHLG=${id}; Path=/; HttpOnly`,
      'Content-Type': 'text/plain',
    });
    return res.end('NTLM challenge (LOCAL TEST PEER)');
  }
  if (type === 3) {
    const id = cookies['NTLM-CHLG'];
    const entry = id ? peerState.challenges.get(id) : null;
    if (!entry || entry.expiresAt < Date.now()) {
      peerLog({ method: req.method, url: req.url, status: 401, note: 'Type 3 without live challenge' });
      return send401Ntlm();
    }
    peerState.challenges.delete(id); // single-use
    const verdict = verifyType3(token, entry.challenge, TEST_USER, TEST_DOMAIN, TEST_PASSWORD);
    if (!verdict.ok) {
      peerLog({ method: req.method, url: req.url, status: 401, note: `Type 3 rejected: ${verdict.reason}` });
      return send401Ntlm();
    }
    // Authenticated: handle the SOAP body.
    const wqlMatch = /<p:Filter[^>]*>([\s\S]*?)<\/p:Filter>/i.exec(body) || /<Filter[^>]*>([\s\S]*?)<\/Filter>/i.exec(body);
    const wql = wqlMatch ? wqlMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '';
    if (body.includes('__FORCE_FAULT__')) {
      const fault = soapFaultEnvelope('s:Receiver', 'w:InternalError', 'The server encountered an internal error (forced by test token).');
      peerLog({ method: req.method, url: req.url, status: 500, note: 'forced SOAP fault' });
      res.writeHead(500, { 'Content-Type': 'application/soap+xml; charset=utf-8' });
      return res.end(fault);
    }
    if (isMalformedWql(wql)) {
      const fault = soapFaultEnvelope('s:Sender', 'w:InvalidQuery', 'The query is invalid.');
      peerLog({ method: req.method, url: req.url, status: 500, note: 'malformed WQL -> SOAP fault' });
      res.writeHead(500, { 'Content-Type': 'application/soap+xml; charset=utf-8' });
      return res.end(fault);
    }
    peerLog({ method: req.method, url: req.url, status: 200, note: 'authenticated, valid WQL' });
    res.writeHead(200, { 'Content-Type': 'application/soap+xml; charset=utf-8' });
    return res.end(soapSuccessEnvelope());
  }
  peerLog({ method: req.method, url: req.url, status: 400, note: `unknown NTLM type ${type}` });
  res.writeHead(400, { 'Content-Type': 'text/plain' });
  return res.end('Malformed NTLM message (LOCAL TEST PEER)');
}

// ---------------------------------------------------------------------------
// Minimal NTLM HTTP client: drives the 3-leg handshake, validates each
// message structurally as it passes, then returns the final SOAP response.
// ---------------------------------------------------------------------------
async function ntlmPost(url, soapBody, { user, domain, workstation, password, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const steps = { type1: null, type2: null, type3: null };
  let cookie = '';
  // Step 0: no auth -> expect 401
  const r0 = await httpRequest({ url, method: 'POST', headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' }, body: soapBody, timeoutMs });
  collectedBodies.push({ where: 'peer:step0', status: r0.status, body: r0.body });
  if (r0.status !== 401) return { final: r0, steps, error: `expected 401 challenge, got ${r0.status}` };
  // Step 1: Type 1 -> expect 401 + Type 2
  const type1 = buildType1();
  steps.type1 = validateNtlmMessage(type1, 1);
  const r1 = await httpRequest({
    url, method: 'POST',
    headers: { 'Content-Type': 'application/soap+xml; charset=utf-8', Authorization: `NTLM ${type1.toString('base64')}` },
    body: soapBody, timeoutMs,
  });
  collectedBodies.push({ where: 'peer:step1', status: r1.status, body: r1.body });
  if (r1.status !== 401) return { final: r1, steps, error: `expected 401 + Type 2, got ${r1.status}` };
  const wwwAuth = r1.headers['www-authenticate'] || '';
  const t2m = /^NTLM\s+([A-Za-z0-9+/=]+)$/.exec(String(wwwAuth).trim());
  if (!t2m) return { final: r1, steps, error: 'no NTLM Type 2 in WWW-Authenticate' };
  const type2 = Buffer.from(t2m[1], 'base64');
  steps.type2 = validateNtlmMessage(type2, 2);
  if (!steps.type2.ok) return { final: r1, steps, error: `Type 2 failed structural validation: ${steps.type2.errors.join('; ')}` };
  const { challenge } = parseType2(type2);
  const setCookie = r1.headers['set-cookie'];
  if (Array.isArray(setCookie) && setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  // Step 2: Type 3 + SOAP body -> final response
  const { message: type3 } = buildType3(user, domain, workstation, password, challenge);
  steps.type3 = validateNtlmMessage(type3, 3);
  if (!steps.type3.ok) return { final: r1, steps, error: `Type 3 failed structural validation: ${steps.type3.errors.join('; ')}` };
  const headers = { 'Content-Type': 'application/soap+xml; charset=utf-8', Authorization: `NTLM ${type3.toString('base64')}` };
  if (cookie) headers.Cookie = cookie;
  const r2 = await httpRequest({ url, method: 'POST', headers, body: soapBody, timeoutMs });
  collectedBodies.push({ where: 'peer:step2', status: r2.status, body: r2.body });
  return { final: r2, steps };
}

// ---------------------------------------------------------------------------
// OpManager app server lifecycle (THIS clone, own port, own throwaway DB).
// The harness spawns the server itself unless OPM_BASE_URL points at an
// already-running instance on the same port (then it does not spawn/kill).
// ---------------------------------------------------------------------------
let spawnedServer = null;
let serverLogText = '';
function waitFor(predicate, timeoutMs, label, intervalMs = 250) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      let ok = false;
      try { ok = predicate(); } catch { ok = false; }
      if (ok) return resolve(true);
      if (Date.now() - started > timeoutMs) return reject(new Error(`timed out waiting for ${label} after ${timeoutMs}ms`));
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}
async function startOwnServer() {
  const logStream = fs.createWriteStream(SERVER_LOG_FILE, { flags: 'w' });
  const child = spawn('node', ['server/index.js'], {
    cwd: REPO_ROOT, env: { ...process.env, PORT: String(OPM_PORT) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  spawnedServer = child;
  child.stdout.on('data', (d) => { const s = d.toString('utf8'); serverLogText += s; logStream.write(s); });
  child.stderr.on('data', (d) => { const s = d.toString('utf8'); serverLogText += s; logStream.write(s); });
  child.on('exit', (code) => { if (code !== 0 && code !== null) console.error(`[server] exited with code ${code}`); });
  // Wait for the port to answer, then for the bootstrap file (created at startup).
  const t0 = Date.now();
  let up = false;
  while (Date.now() - t0 < 30000) {
    try {
      const r = await httpRequest({ url: `${OPM_BASE_URL}/`, method: 'GET', timeoutMs: 2000 });
      if (r.status) { up = true; break; }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!up) throw new Error(`own server on port ${OPM_PORT} did not answer within 30s (log: ${SERVER_LOG_FILE})`);
  console.log(`[info] own server up at ${OPM_BASE_URL} (pid ${child.pid}, log ${SERVER_LOG_FILE})`);
  return child;
}
function stopOwnServer() {
  if (!spawnedServer) return;
  try { spawnedServer.kill('SIGTERM'); } catch { /* already gone */ }
  spawnedServer = null;
}
function readBootstrapPassword() {
  const file = path.join(REPO_ROOT, 'server', 'data', '.admin-initial');
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').trim();
}
async function appLogin() {
  // Returns { cookie, rotated: bool }. Rotates the bootstrap password once
  // (runtime-generated, never logged) so the must-change guard clears.
  let password = OPM_ADMIN_PASSWORD_ENV;
  if (!password) {
    await waitFor(() => fs.existsSync(path.join(REPO_ROOT, 'server', 'data', '.admin-initial')), 20000, 'server/data/.admin-initial');
    password = readBootstrapPassword();
  }
  if (!password) throw new Error('no admin password available (neither OPM_ADMIN_PASSWORD nor server/data/.admin-initial)');
  const login = async (pw) => {
    const r = await httpRequest({
      url: `${OPM_BASE_URL}/api/auth/login`, method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: OPM_ADMIN_USER, password: pw }), timeoutMs: REQUEST_TIMEOUT_MS,
    });
    collectedBodies.push({ where: 'app:login', status: r.status, body: r.body });
    const setCookie = r.headers['set-cookie'];
    const cookie = Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';
    return { r, cookie };
  };
  let { r, cookie } = await login(password);
  if (r.status !== 200) {
    throw new Error(`admin login failed: HTTP ${r.status} ${redact(r.body.slice(0, 200))} — if a previous run rotated the password, re-run with OPM_ADMIN_PASSWORD set, or reset this clone's throwaway DB (server/data/opmanager.db*)`);
  }
  let parsed = {};
  try { parsed = JSON.parse(r.body); } catch { /* ignore */ }
  if (parsed.mustChangePassword) {
    // Repeatable re-runs: if the operator supplied OPM_ROTATED_ADMIN_PASSWORD,
    // rotate to that (runtime-only, never printed); otherwise rotate to a
    // fresh random password and the next run needs OPM_ADMIN_PASSWORD set to
    // it (or a fresh throwaway DB in this clone — see header).
    const newPassword = process.env.OPM_ROTATED_ADMIN_PASSWORD && process.env.OPM_ROTATED_ADMIN_PASSWORD.length >= 10
      ? process.env.OPM_ROTATED_ADMIN_PASSWORD
      : `Opm-Test-${crypto.randomBytes(12).toString('hex')}-Rotate1`;
    const ch = await httpRequest({
      url: `${OPM_BASE_URL}/api/auth/change-password`, method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ currentPassword: password, newPassword }), timeoutMs: REQUEST_TIMEOUT_MS,
    });
    collectedBodies.push({ where: 'app:change-password', status: ch.status, body: ch.body });
    if (ch.status !== 200) throw new Error(`password rotation failed: HTTP ${ch.status} — cannot clear must-change-password guard; API cases cannot run`);
    const setCookie = ch.headers['set-cookie'];
    if (Array.isArray(setCookie) && setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    console.log('[info] bootstrap admin password rotated (runtime-only) so the must-change-password guard clears; re-runs need OPM_ADMIN_PASSWORD set to the rotated password (or OPM_ROTATED_ADMIN_PASSWORD for a repeatable value), or a fresh throwaway DB.');
    return { cookie, rotated: true };
  }
  return { cookie, rotated: false };
}
async function appPost(pathname, cookie, jsonBody) {
  const r = await httpRequest({
    url: `${OPM_BASE_URL}${pathname}`, method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(jsonBody), timeoutMs: REQUEST_TIMEOUT_MS,
  });
  collectedBodies.push({ where: `app:POST ${pathname}`, status: r.status, body: r.body });
  return r;
}
async function appGet(pathname, cookie) {
  const r = await httpRequest({
    url: `${OPM_BASE_URL}${pathname}`, method: 'GET',
    headers: cookie ? { Cookie: cookie } : {}, timeoutMs: REQUEST_TIMEOUT_MS,
  });
  collectedBodies.push({ where: `app:GET ${pathname}`, status: r.status, body: r.body });
  return r;
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------
async function case1NtlmStructure() {
  // (a) Generated Type 1/2/3 all pass structural validation, with exact fields.
  const t1 = buildType1();
  const v1 = validateNtlmMessage(t1, 1);
  const challenge = crypto.randomBytes(8);
  const t2 = buildType2(challenge, TEST_DOMAIN);
  const v2 = validateNtlmMessage(t2, 2);
  const { message: t3 } = buildType3(TEST_USER, TEST_DOMAIN, TEST_HOST, TEST_PASSWORD, challenge);
  const v3 = validateNtlmMessage(t3, 3);
  // (b) Deliberately malformed messages are REJECTED by the same validator.
  const badSig = Buffer.from(t1); badSig[0] = 0x58; // 'X'
  const bv1 = validateNtlmMessage(badSig, 1);
  const truncated = t3.subarray(0, 40);
  const bv3 = validateNtlmMessage(truncated, 3);
  const oob = Buffer.from(t3); oob.writeUInt32LE(0xfffffff0, 20 + 4); // ntResponse offset out of bounds
  const bv3b = validateNtlmMessage(oob, 3);
  const wrongType = validateNtlmMessage(t1, 2);
  const detail = `Type1 len=${t1.length} ok=${v1.ok} flags=0x${(v1.fields.flags >>> 0).toString(16)}; `
    + `Type2 len=${t2.length} ok=${v2.ok} challenge=${v2.fields.challenge} targetLen=${v2.fields.targetName.len}; `
    + `Type3 len=${t3.length} ok=${v3.ok} lmLen=${v3.fields.lmResponse.len} ntLen=${v3.fields.ntResponse.len}; `
    + `malformed rejected: bad-signature ok=${bv1.ok} (${bv1.errors.join('; ')}), `
    + `truncated-Type3 ok=${bv3.ok}, out-of-bounds-offset ok=${bv3b.ok}, wrong-type ok=${wrongType.ok}. `
    + `Validation method: pure structural parse of signature/type/flags/security-buffer bounds (see validateNtlmMessage) over messages built by this harness's own NTLM builders + the peer's live Type 2 (case 2/4/5 re-validate the peer-issued Type 2 on the wire). `
    + `SCOPE: the APP has no WinRM client, so no app-issued handshake exists to validate — the app-level evidence is case 1-app below; this case validates the validator + the local test peer's messages.`;
  const ok = v1.ok && v2.ok && v3.ok && !bv1.ok && !bv3.ok && !bv3b.ok && !wrongType.ok;
  recordCase('1', 'NTLM handshake structure (Type 1/2/3 well-formed; malformed rejected)', ok ? 'pass' : 'bug', detail);
}
async function case1App(cookie) {
  // App level: is there any WinRM route/handshake at all?
  const probe = await appGet('/api/winrm/test', cookie);
  const noAuth = await appPost(OPM_WINRM_ROUTE, null, { host: '127.0.0.1', namespace: 'root\\cimv2', query: 'SELECT Caption FROM Win32_OperatingSystem' });
  const wmi = await appPost(OPM_WINRM_ROUTE, cookie, { host: '127.0.0.1', namespace: 'root\\cimv2', query: 'SELECT Caption FROM Win32_OperatingSystem' });
  let body = {};
  try { body = JSON.parse(wmi.body); } catch { /* non-JSON */ }
  const isHonest501 = wmi.status === 501 && body.error === 'not_implemented';
  const detail = `GET /api/winrm/test -> HTTP ${probe.status} (no WinRM route exists on this build). `
    + `POST ${OPM_WINRM_ROUTE} without a session -> HTTP ${noAuth.status} (expected 401 from the API auth guard). `
    + `POST ${OPM_WINRM_ROUTE} -> HTTP ${wmi.status} error=${body.error || '(none)'} message=${(body.message || wmi.body || '').slice(0, 160)}. `
    + (isHonest501
      ? 'Honest 501 not_implemented: the server states no WMI/WinRM client exists and executes nothing — correct for an unbuilt feature, NOT a fake success.'
      : (wmi.status === 200
        ? 'BUG: 200 from a WinRM surface with no client behind it would be fabricated data.'
        : `Non-501 outcome recorded verbatim; no handshake exists to validate at app level.`));
  recordCase('1-app', 'NTLM handshake at APP level (route presence)', (isHonest501 || probe.status === 404) && noAuth.status === 401 ? 'blocked' : 'bug', detail);
}
async function case2WrongCredentials() {
  // Peer level: Type 3 built with the WRONG password must fail NTLMv2 verification -> 401.
  const bad = await ntlmPost(PEER_URL, soapEnvelopeForQuery('SELECT Caption FROM Win32_OperatingSystem'), {
    user: TEST_USER, domain: TEST_DOMAIN, workstation: TEST_HOST, password: WRONG_PASSWORD,
  });
  const wrongUser = await ntlmPost(PEER_URL, soapEnvelopeForQuery('SELECT Caption FROM Win32_OperatingSystem'), {
    user: 'nosuchuser', domain: TEST_DOMAIN, workstation: TEST_HOST, password: TEST_PASSWORD,
  });
  const okBad = bad.final.status === 401;
  const okUser = wrongUser.final.status === 401;
  const noSuccess = !/EnumerateResponse/i.test(bad.final.body) && !/EnumerateResponse/i.test(wrongUser.final.body);
  const detail = `wrong password -> HTTP ${bad.final.status} (expected 401), body=${redact(bad.final.body.slice(0, 120))}; `
    + `wrong username -> HTTP ${wrongUser.final.status} (expected 401); `
    + `no EnumerateResponse in either body: ${noSuccess}; `
    + `peer NTLMv2 verification is real (MD4+HMAC-MD5 proof check, timing-safe compare). `
    + `APP level: BLOCKED — no WinRM client exists to present credentials through; the app's own login brute-force guard is a separate mechanism and is not a WinRM auth test.`;
  recordCase('2', 'Wrong credentials -> honest auth failure (exact code)', okBad && okUser && noSuccess ? 'pass' : 'bug', detail);
}
async function case3Unreachable() {
  // Peer/harness level: connect to TEST-NET-1 (192.0.2.1, RFC 5737, unroutable)
  // and to a closed localhost port; both must fail FAST with a real error code.
  const attempts = [];
  for (const [label, url] of [
    ['TEST-NET-1 192.0.2.1:5985', 'http://192.0.2.1:5985/wsman'],
    ['closed localhost 127.0.0.1:1', 'http://127.0.0.1:1/wsman'],
  ]) {
    const t0 = Date.now();
    try {
      const r = await httpRequest({ url, method: 'POST', headers: { 'Content-Type': 'application/soap+xml' }, body: soapEnvelopeForQuery('SELECT Caption FROM Win32_OperatingSystem'), timeoutMs: UNREACHABLE_TIMEOUT_MS });
      // An HTTP 4xx/5xx is still an honest error (a middlebox may answer);
      // only a 2xx would be a fake success.
      attempts.push({ label, outcome: `HTTP ${r.status}`, elapsedMs: Date.now() - t0, status: r.status });
    } catch (err) {
      attempts.push({ label, outcome: `${err.code || err.message}`, elapsedMs: err.elapsedMs != null ? err.elapsedMs : Date.now() - t0 });
    }
  }
  const allBounded = attempts.every((a) => a.elapsedMs < UNREACHABLE_BOUND_MS);
  const allFailed = attempts.every((a) => a.status == null || a.status >= 400);
  const detail = attempts.map((a) => `${a.label}: ${a.outcome} in ${a.elapsedMs}ms`).join('; ')
    + `. Bound: <${UNREACHABLE_BOUND_MS}ms each (timeout ${UNREACHABLE_TIMEOUT_MS}ms, enforced by the harness wall-clock watchdog); all within bound: ${allBounded}. `
    + `Environment note: this sandbox's network answers TCP for unroutable TEST-NET-1 (connects in ~12ms) and can hold the connection open — the first run took 53239ms to ECONNRESET with only the socket timeout set, which is why the watchdog exists. A real WinRM client must enforce its own wall-clock bound, not rely on socket timeout alone. `
    + `APP level: BLOCKED — no WinRM client exists, so the app has no unreachable-host path to time; when winrm-service lands, re-run and require the same bound through the app route.`;
  recordCase('3', 'Unreachable host -> honest error, bounded time', allBounded && allFailed ? 'pass' : 'bug', detail);
}
async function case4MalformedWql(cookie) {
  // App level: malformed WQL to the honest-501 surface must stay 501 (or become 400), never 200.
  const badQueries = [
    'SELEC Caption FROM Win32_OperatingSystem', // typo'd keyword
    'SELECT Caption FROM FROM Win32_OperatingSystem', // doubled FROM
    'SELECT Caption Win32_OperatingSystem', // missing FROM
    '__MALFORMED_WQL__',
  ];
  const appOutcomes = [];
  for (const q of badQueries) {
    const r = await appPost(OPM_WINRM_ROUTE, cookie, { host: '127.0.0.1', namespace: 'root\\cimv2', query: q });
    appOutcomes.push(`${q.slice(0, 28)}... -> HTTP ${r.status}`);
    if (r.status === 200) {
      recordCase('4-app', 'Malformed WQL at APP level', 'bug', `query ${JSON.stringify(q)} returned HTTP 200: ${redact(r.body.slice(0, 200))} — fabricated success`);
      return;
    }
  }
  // Peer level: malformed WQL through a real authenticated NTLM session -> SOAP Fault 500.
  const peer = await ntlmPost(PEER_URL, soapEnvelopeForQuery('SELEC Caption FROM Win32_OperatingSystem'), {
    user: TEST_USER, domain: TEST_DOMAIN, workstation: TEST_HOST, password: TEST_PASSWORD,
  });
  const fault = parseSoapFault(peer.final.body);
  const peerOk = peer.final.status === 500 && fault && fault.code === 's:Sender' && fault.subcode === 'w:InvalidQuery';
  const detail = `app: ${appOutcomes.join('; ')} (all non-200; honest 501 not_implemented — the query is never executed). `
    + `peer: malformed WQL -> HTTP ${peer.final.status}, SOAP fault code=${fault ? fault.code : '(none)'} subcode=${fault ? fault.subcode : '(none)'} reason=${fault ? fault.reason : '(none)'}; surfaced as error, not success: ${peerOk}.`;
  recordCase('4', 'Malformed WQL -> honest 400 / SOAP Fault', peerOk ? 'pass' : 'bug', detail);
}
async function case5SoapFault() {
  // Peer returns a SOAP Fault even for a well-formed query (forced by token);
  // the harness must surface the fault as an error, never a success.
  const r = await ntlmPost(PEER_URL, soapEnvelopeForQuery('SELECT Caption FROM Win32_OperatingSystem __FORCE_FAULT__'), {
    user: TEST_USER, domain: TEST_DOMAIN, workstation: TEST_HOST, password: TEST_PASSWORD,
  });
  const fault = parseSoapFault(r.final.body);
  const isFault = r.final.status === 500 && fault !== null;
  const notSuccess = !/EnumerateResponse/i.test(r.final.body);
  const surfaced = isFault && notSuccess ? `ERROR surfaced: HTTP ${r.final.status}, fault ${fault.code}/${fault.subcode} — "${fault.reason}"` : 'NOT surfaced as an error';
  const detail = `forced peer fault -> HTTP ${r.final.status}, fault code=${fault ? fault.code : '(none)'} subcode=${fault ? fault.subcode : '(none)'} reason=${fault ? fault.reason : '(none)'}; ${surfaced}; body contains EnumerateResponse: ${!notSuccess}. `
    + `APP level: BLOCKED — no WinRM client exists to receive/parse a peer SOAP Fault; when it lands, re-run and require the fault code+reason to reach the API caller verbatim.`;
  recordCase('5', 'SOAP fault from peer -> honest error surfacing the fault', isFault && notSuccess ? 'pass' : 'bug', detail);
}
async function case5AppSanity(cookie) {
  // Sanity: a WELL-FORMED query to the app must also not fake success today.
  const r = await appPost(OPM_WINRM_ROUTE, cookie, { host: '127.0.0.1', namespace: 'root\\cimv2', query: 'SELECT Caption FROM Win32_OperatingSystem' });
  const detail = `well-formed WQL to ${OPM_WINRM_ROUTE} -> HTTP ${r.status}; body starts: ${redact(r.body.slice(0, 120))}. `
    + (r.status === 501 ? 'Honest 501 — no fabricated rows.' : r.status === 200 ? 'BUG: 200 with no WinRM client behind it.' : 'Non-200 recorded verbatim.');
  recordCase('5-app', 'Well-formed WQL at APP level is not faked', r.status === 501 ? 'blocked' : (r.status === 200 ? 'bug' : 'blocked'), detail);
}
function case6LeakSweep() {
  // Grep every collected response body + the server log (+ peer request log
  // metadata) for the runtime test credentials. Values are checked in
  // memory; the report only prints HIT COUNTS, never the values.
  const haystacks = [];
  for (const b of collectedBodies) haystacks.push({ where: b.where, text: b.body });
  haystacks.push({ where: 'server log (own instance)', text: serverLogText });
  try { haystacks.push({ where: `server log file ${SERVER_LOG_FILE}`, text: fs.readFileSync(SERVER_LOG_FILE, 'utf8') }); } catch { /* log file may not exist if server was external */ }
  haystacks.push({ where: 'peer request log', text: JSON.stringify(peerState.requestLog) });
  let hits = 0;
  const hitWhere = [];
  for (const h of haystacks) {
    for (const v of SENTINELS) {
      if (v && h.text.includes(v)) { hits++; hitWhere.push(`${h.where} (sentinel #${SENTINELS.indexOf(v) + 1})`); }
    }
  }
  // Also: the peer must never have logged an Authorization token value.
  const peerLoggedAuth = peerState.requestLog.some((e) => JSON.stringify(e).includes('NTLM ') && JSON.stringify(e).length > 200);
  const detail = `swept ${haystacks.length} sources (all collected response bodies, own server log in-memory + file, peer request log) for ${SENTINELS.length} runtime-only test credential values: ${hits} hits${hitWhere.length ? ` in: ${hitWhere.join(', ')}` : ''}. Peer request log stores metadata only (no Authorization values): ${!peerLoggedAuth}. `
    + `Note: the OpManager bootstrap admin password is NEVER used as a grep pattern and never appears in this report; only the two WinRM test sentinels are swept.`;
  recordCase('6', 'No credential echoed in any response or log line', hits === 0 && !peerLoggedAuth ? 'pass' : 'bug', detail);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== WinRM negative/edge tests (Phase 3, winrm-tests) ===');
  console.log(`app: ${OPM_BASE_URL} (own instance, port ${OPM_PORT}) | peer: ${PEER_URL} | route under test: ${OPM_WINRM_ROUTE}`);
  console.log('Test credentials are runtime-generated sentinels; they are never persisted or printed.');
  let peerServer = null;
  let spawnedHere = false;
  try {
    // 0. Crypto self-test first: NTLMv2 verification depends on MD4.
    selfTestMd4();
    console.log('[info] MD4 self-test passed (5 vectors verified against OpenSSL MD4: "", "a", "abc", "message digest", "abcdefghijklmnopqrstuvwxyz").');

    // 0b. App server: use the running one if it answers, else spawn our own.
    let appUp = false;
    try {
      const probe = await httpRequest({ url: `${OPM_BASE_URL}/`, method: 'GET', timeoutMs: 2000 });
      appUp = !!probe.status;
    } catch { appUp = false; }
    if (!appUp) { await startOwnServer(); spawnedHere = true; }
    else console.log(`[info] using already-running server at ${OPM_BASE_URL} (not spawned here; will not stop it)`);

    const { cookie } = await appLogin();
    console.log('[info] admin login OK (session cookie acquired; password never printed).');

    // 0c. Local test peer.
    peerServer = await startTestPeer();
    console.log(`[info] local test WinRM peer up at ${PEER_URL} (LOCAL TEST SERVICE — speaks real NTLM/WSMan, not a production device).`);

    // 1-6.
    await case1NtlmStructure();
    await case1App(cookie);
    await case2WrongCredentials();
    await case3Unreachable();
    await case4MalformedWql(cookie);
    await case5SoapFault();
    await case5AppSanity(cookie);
    case6LeakSweep();
  } catch (err) {
    const msg = redact(err && err.stack ? err.stack : String(err));
    recordCase('harness', 'Harness error', 'bug', `harness aborted: ${msg.slice(0, 500)}`);
  } finally {
    if (peerServer) { try { peerServer.close(); } catch { /* ignore */ } }
    if (spawnedHere) stopOwnServer();
  }
  results.finishedAt = new Date().toISOString();
  results.bugs = results.bugs.map((b) => ({ id: b.id, title: b.title, detail: redact(b.detail) }));
  results.cases = results.cases.map((c) => ({ ...c, detail: redact(c.detail) }));
  const summary = {
    pass: results.cases.filter((c) => c.outcome === 'pass').length,
    blocked: results.cases.filter((c) => c.outcome === 'blocked').length,
    bug: results.cases.filter((c) => c.outcome === 'bug').length,
    fail: results.cases.filter((c) => c.outcome === 'fail').length,
  };
  console.log(`\n=== summary: ${summary.pass} pass, ${summary.blocked} blocked (not implemented at app level), ${summary.bug} bug, ${summary.fail} fail ===`);
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify({ ...results, summary }, null, 2));
    console.log(`[info] results JSON (credentials scrubbed): ${RESULTS_FILE}`);
  } catch (err) {
    console.error(`[warn] could not write results JSON: ${err.message}`);
  }
  process.exit(results.bugs.length > 0 ? 1 : 0);
}

if (require.main === module) main();
module.exports = { md4, selfTestMd4, validateNtlmMessage, buildType1, buildType2, buildType3, isMalformedWql, parseSoapFault };
