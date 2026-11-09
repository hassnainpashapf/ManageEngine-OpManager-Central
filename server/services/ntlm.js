'use strict';

/**
 * ntlm.js — NTLMv2 authentication (MS-NLMP) for the WinRM client.
 *
 * Why this file exists: Node 24 ships OpenSSL 3, where MD4 and DES are
 * unavailable (`crypto.createHash('md4')` throws
 * "digital envelope routines::unsupported", verified on this VM 2026-11-09).
 * NTLMv1/LM responses need DES, so they are deliberately NOT implemented.
 * NTLMv2 needs only MD4 (for the NT hash) and HMAC-MD5 (available in
 * OpenSSL 3), so this file vendors a pure-JavaScript MD4 (RFC 1320) and
 * implements the NTLMv2 handshake on top of Node's built-in HMAC-MD5.
 * NTLMv2 is what modern Windows servers negotiate anyway; the Type 1
 * message below requests it explicitly.
 *
 * No credentials are stored or logged here. Passwords arrive as function
 * arguments, are used to derive the NT hash in memory, and are never
 * written anywhere. The NT hash itself is only held for the duration of
 * one handshake.
 *
 * References:
 *   - RFC 1320 (MD4), test vectors asserted in scripts/winrm-selftest.js
 *   - [MS-NLMP] 2.2.1 (NTLMSSP_NEGOTIATE), 2.2.1.2 (CHALLENGE),
 *     2.2.1.3 (AUTHENTICATE), 3.3.1 (NTLMv2 response), 3.3.2 (LMv2)
 *   - Known vector: MD4(UTF-16LE("Password")) =
 *     a4f49c406510bdcab6824ee7c30fd852 (asserted in the self-test)
 */

const crypto = require('crypto');

// --- Pure-JS MD4 (RFC 1320) -------------------------------------------------

function _f(x, y, z) { return ((x & y) | (~x & z)) >>> 0; }
function _g(x, y, z) { return ((x & y) | (x & z) | (y & z)) >>> 0; }
function _h(x, y, z) { return (x ^ y ^ z) >>> 0; }
function _rol(x, n) { return (((x << n) | (x >>> (32 - n))) >>> 0); }

/**
 * MD4 digest of a Buffer (or UTF-8 string). Returns a 16-byte Buffer.
 * Validated against all seven RFC 1320 test vectors in the self-test.
 */
function md4(input) {
  const msg = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  // Padding: 0x80, zeroes, then 64-bit little-endian bit length.
  const bitLen = BigInt(msg.length) * 8n;
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const buf = Buffer.alloc(paddedLen);
  msg.copy(buf, 0);
  buf[msg.length] = 0x80;
  buf.writeBigUInt64LE(bitLen, paddedLen - 8);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const X = new Uint32Array(16);
  for (let off = 0; off < paddedLen; off += 64) {
    for (let i = 0; i < 16; i++) X[i] = buf.readUInt32LE(off + i * 4);
    const aa = a; const bb = b; const cc = c; const dd = d;

    // Round 1
    a = _rol((a + _f(b, c, d) + X[0]) >>> 0, 3);
    d = _rol((d + _f(a, b, c) + X[1]) >>> 0, 7);
    c = _rol((c + _f(d, a, b) + X[2]) >>> 0, 11);
    b = _rol((b + _f(c, d, a) + X[3]) >>> 0, 19);
    a = _rol((a + _f(b, c, d) + X[4]) >>> 0, 3);
    d = _rol((d + _f(a, b, c) + X[5]) >>> 0, 7);
    c = _rol((c + _f(d, a, b) + X[6]) >>> 0, 11);
    b = _rol((b + _f(c, d, a) + X[7]) >>> 0, 19);
    a = _rol((a + _f(b, c, d) + X[8]) >>> 0, 3);
    d = _rol((d + _f(a, b, c) + X[9]) >>> 0, 7);
    c = _rol((c + _f(d, a, b) + X[10]) >>> 0, 11);
    b = _rol((b + _f(c, d, a) + X[11]) >>> 0, 19);
    a = _rol((a + _f(b, c, d) + X[12]) >>> 0, 3);
    d = _rol((d + _f(a, b, c) + X[13]) >>> 0, 7);
    c = _rol((c + _f(d, a, b) + X[14]) >>> 0, 11);
    b = _rol((b + _f(c, d, a) + X[15]) >>> 0, 19);

    // Round 2
    a = _rol((a + _g(b, c, d) + X[0] + 0x5a827999) >>> 0, 3);
    d = _rol((d + _g(a, b, c) + X[4] + 0x5a827999) >>> 0, 5);
    c = _rol((c + _g(d, a, b) + X[8] + 0x5a827999) >>> 0, 9);
    b = _rol((b + _g(c, d, a) + X[12] + 0x5a827999) >>> 0, 13);
    a = _rol((a + _g(b, c, d) + X[1] + 0x5a827999) >>> 0, 3);
    d = _rol((d + _g(a, b, c) + X[5] + 0x5a827999) >>> 0, 5);
    c = _rol((c + _g(d, a, b) + X[9] + 0x5a827999) >>> 0, 9);
    b = _rol((b + _g(c, d, a) + X[13] + 0x5a827999) >>> 0, 13);
    a = _rol((a + _g(b, c, d) + X[2] + 0x5a827999) >>> 0, 3);
    d = _rol((d + _g(a, b, c) + X[6] + 0x5a827999) >>> 0, 5);
    c = _rol((c + _g(d, a, b) + X[10] + 0x5a827999) >>> 0, 9);
    b = _rol((b + _g(c, d, a) + X[14] + 0x5a827999) >>> 0, 13);
    a = _rol((a + _g(b, c, d) + X[3] + 0x5a827999) >>> 0, 3);
    d = _rol((d + _g(a, b, c) + X[7] + 0x5a827999) >>> 0, 5);
    c = _rol((c + _g(d, a, b) + X[11] + 0x5a827999) >>> 0, 9);
    b = _rol((b + _g(c, d, a) + X[15] + 0x5a827999) >>> 0, 13);

    // Round 3
    a = _rol((a + _h(b, c, d) + X[0] + 0x6ed9eba1) >>> 0, 3);
    d = _rol((d + _h(a, b, c) + X[8] + 0x6ed9eba1) >>> 0, 9);
    c = _rol((c + _h(d, a, b) + X[4] + 0x6ed9eba1) >>> 0, 11);
    b = _rol((b + _h(c, d, a) + X[12] + 0x6ed9eba1) >>> 0, 15);
    a = _rol((a + _h(b, c, d) + X[2] + 0x6ed9eba1) >>> 0, 3);
    d = _rol((d + _h(a, b, c) + X[10] + 0x6ed9eba1) >>> 0, 9);
    c = _rol((c + _h(d, a, b) + X[6] + 0x6ed9eba1) >>> 0, 11);
    b = _rol((b + _h(c, d, a) + X[14] + 0x6ed9eba1) >>> 0, 15);
    a = _rol((a + _h(b, c, d) + X[1] + 0x6ed9eba1) >>> 0, 3);
    d = _rol((d + _h(a, b, c) + X[9] + 0x6ed9eba1) >>> 0, 9);
    c = _rol((c + _h(d, a, b) + X[5] + 0x6ed9eba1) >>> 0, 11);
    b = _rol((b + _h(c, d, a) + X[13] + 0x6ed9eba1) >>> 0, 15);
    a = _rol((a + _h(b, c, d) + X[3] + 0x6ed9eba1) >>> 0, 3);
    d = _rol((d + _h(a, b, c) + X[11] + 0x6ed9eba1) >>> 0, 9);
    c = _rol((c + _h(d, a, b) + X[7] + 0x6ed9eba1) >>> 0, 11);
    b = _rol((b + _h(c, d, a) + X[15] + 0x6ed9eba1) >>> 0, 15);

    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
  }

  const out = Buffer.alloc(16);
  out.writeUInt32LE(a, 0);
  out.writeUInt32LE(b, 4);
  out.writeUInt32LE(c, 8);
  out.writeUInt32LE(d, 12);
  return out;
}

// --- NTLM message construction ----------------------------------------------

const SIGNATURE = 'NTLMSSP\0';

const FLAG = {
  NEGOTIATE_UNICODE: 0x00000001,
  REQUEST_TARGET: 0x00000004,
  NEGOTIATE_SIGN: 0x00000010,
  NEGOTIATE_SEAL: 0x00000020,
  NEGOTIATE_NTLM: 0x00000200,
  NEGOTIATE_ALWAYS_SIGN: 0x00008000,
  NEGOTIATE_NTLM2_KEY: 0x00080000,
  NEGOTIATE_TARGET_INFO: 0x00800000,
  NEGOTIATE_128: 0x20000000,
  NEGOTIATE_56: 0x80000000,
};

// Flags we advertise in Type 1. NTLMv2 is requested (NEGOTIATE_NTLM2_KEY);
// no NTLMv1/LM is ever offered or sent.
const TYPE1_FLAGS = (
  FLAG.NEGOTIATE_UNICODE |
  FLAG.REQUEST_TARGET |
  FLAG.NEGOTIATE_NTLM |
  FLAG.NEGOTIATE_ALWAYS_SIGN |
  FLAG.NEGOTIATE_NTLM2_KEY |
  FLAG.NEGOTIATE_TARGET_INFO |
  FLAG.NEGOTIATE_128 |
  FLAG.NEGOTIATE_56
) >>> 0;

// Target-info AV pair ids ([MS-NLMP] 2.2.2.1).
const AV = {
  EOL: 0x0000,
  NB_COMPUTER_NAME: 0x0001,
  NB_DOMAIN_NAME: 0x0002,
  DNS_COMPUTER_NAME: 0x0003,
  DNS_DOMAIN_NAME: 0x0004,
  DNS_TREE_NAME: 0x0005,
  TIMESTAMP: 0x0007,
};

function utf16le(str) {
  return Buffer.from(String(str), 'utf16le');
}

function writeSecBuf(buf, offset, len, maxLen, dataOffset) {
  buf.writeUInt16LE(len, offset);
  buf.writeUInt16LE(maxLen, offset + 2);
  buf.writeUInt32LE(dataOffset, offset + 4);
}

function readSecBuf(buf, offset) {
  return {
    len: buf.readUInt16LE(offset),
    maxLen: buf.readUInt16LE(offset + 2),
    offset: buf.readUInt32LE(offset + 4),
  };
}

/** NT hash: MD4 of the UTF-16LE password ([MS-NLMP] 3.3.1). */
function ntHash(password) {
  return md4(utf16le(password));
}

/** NTLMv2 hash: HMAC-MD5(NT hash, UTF-16LE(UPPER(user) + domain)). */
function ntlmV2Hash(username, domain, password) {
  return crypto
    .createHmac('md5', ntHash(password))
    .update(utf16le(String(username).toUpperCase() + String(domain || '')))
    .digest();
}

/** FILETIME for a Date: 100ns ticks since 1601-01-01. */
function fileTime(date) {
  const ms = BigInt(date.getTime()) + 11644473600000n;
  return ms * 10000n;
}

/** Type 1 (NEGOTIATE) message, 32 bytes, empty domain/workstation fields. */
function createType1() {
  const buf = Buffer.alloc(32);
  buf.write(SIGNATURE, 0, 'ascii');
  buf.writeUInt32LE(1, 8);
  buf.writeUInt32LE(TYPE1_FLAGS, 12);
  writeSecBuf(buf, 16, 0, 0, 32); // Supplied domain
  writeSecBuf(buf, 24, 0, 0, 32); // Supplied workstation
  return buf;
}

/**
 * Build a Type 2 (CHALLENGE) message. Used by the self-test mock server;
 * kept here so the mock and the client share one exact layout.
 * `targetInfo` is an array of {id, value: Buffer}; the EOL pair is added.
 */
function buildType2({ challenge, targetName, targetInfo, flags }) {
  const nameBuf = targetName ? utf16le(targetName) : Buffer.alloc(0);
  const infoParts = [];
  for (const av of targetInfo || []) {
    const h = Buffer.alloc(4);
    h.writeUInt16LE(av.id, 0);
    h.writeUInt16LE(av.value.length, 2);
    infoParts.push(h, av.value);
  }
  const eol = Buffer.alloc(4); // id 0, len 0
  infoParts.push(eol);
  const infoBuf = Buffer.concat(infoParts);

  const headerLen = 48;
  const buf = Buffer.alloc(headerLen + nameBuf.length + infoBuf.length);
  buf.write(SIGNATURE, 0, 'ascii');
  buf.writeUInt32LE(2, 8);
  writeSecBuf(buf, 12, nameBuf.length, nameBuf.length, headerLen);
  buf.writeUInt32LE(flags >>> 0, 20);
  Buffer.from(challenge).copy(buf, 24, 0, 8);
  // bytes 32-39: reserved, zero.
  writeSecBuf(buf, 40, infoBuf.length, infoBuf.length, headerLen + nameBuf.length);
  nameBuf.copy(buf, headerLen);
  infoBuf.copy(buf, headerLen + nameBuf.length);
  return buf;
}

/**
 * Parse a Type 2 (CHALLENGE) message Buffer.
 * Returns { targetName, flags, serverChallenge: Buffer(8),
 *           targetInfo: Buffer (raw AV-pair bytes), targetInfoPairs: [{id, value}] }.
 */
function parseType2(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 48) {
    throw new Error('NTLM Type 2 message too short');
  }
  if (buf.toString('ascii', 0, 8) !== SIGNATURE) {
    throw new Error('NTLM Type 2 message has a bad signature');
  }
  if (buf.readUInt32LE(8) !== 2) {
    throw new Error('NTLM message is not a Type 2 challenge');
  }
  const flags = buf.readUInt32LE(20) >>> 0;
  const serverChallenge = Buffer.from(buf.subarray(24, 32));
  const nameField = readSecBuf(buf, 12);
  const unicode = (flags & FLAG.NEGOTIATE_UNICODE) !== 0;
  const targetName = nameField.len > 0
    ? buf.toString(unicode ? 'utf16le' : 'latin1', nameField.offset, nameField.offset + nameField.len)
    : '';
  const infoField = readSecBuf(buf, 40);
  const targetInfo = infoField.len > 0
    ? Buffer.from(buf.subarray(infoField.offset, infoField.offset + infoField.len))
    : Buffer.alloc(0);
  const pairs = [];
  let p = 0;
  while (p + 4 <= targetInfo.length) {
    const id = targetInfo.readUInt16LE(p);
    const len = targetInfo.readUInt16LE(p + 2);
    if (id === AV.EOL) break;
    pairs.push({ id, value: Buffer.from(targetInfo.subarray(p + 4, p + 4 + len)) });
    p += 4 + len;
  }
  return { targetName, flags, serverChallenge, targetInfo, targetInfoPairs: pairs };
}

/**
 * Build the NTLMv2 blob ([MS-NLMP] 2.2.2.2): RespType 0x01, HiRespType 0x01,
 * timestamp, client challenge, target info, EOL terminator.
 * `overrides.clientChallenge` / `overrides.timestamp` exist so the
 * self-test can pin them for deterministic verification; production callers
 * omit both and get fresh random values / current time.
 */
function buildNtlmV2Blob({ targetInfo, clientChallenge, timestamp }) {
  const cc = clientChallenge || crypto.randomBytes(8);
  const ts = timestamp !== undefined ? timestamp : fileTime(new Date());
  const blob = Buffer.alloc(28 + targetInfo.length + 4);
  blob[0] = 0x01; // RespType
  blob[1] = 0x01; // HiRespType
  // bytes 2-3: reserved, zero.
  blob.writeBigUInt64LE(BigInt(ts), 4);
  Buffer.from(cc).copy(blob, 12, 0, 8);
  // bytes 20-23: unknown, zero.
  targetInfo.copy(blob, 28);
  // bytes 28+len .. +3: MsvAvEOL terminator, zero.
  return { blob, clientChallenge: Buffer.from(cc) };
}

/**
 * Compute the NTLMv2 + LMv2 responses for a parsed Type 2 challenge.
 * Returns { lmResponse, ntResponse, ntlmV2Hash, blob, clientChallenge }.
 */
function computeNtlmV2Response({ username, domain, password, type2, overrides }) {
  const hash = ntlmV2Hash(username, domain, password);
  const { blob, clientChallenge } = buildNtlmV2Blob({
    targetInfo: type2.targetInfo,
    clientChallenge: overrides && overrides.clientChallenge,
    timestamp: overrides && overrides.timestamp,
  });
  const ntProof = crypto
    .createHmac('md5', hash)
    .update(Buffer.concat([type2.serverChallenge, blob]))
    .digest();
  const ntResponse = Buffer.concat([ntProof, blob]);
  const lmProof = crypto
    .createHmac('md5', hash)
    .update(Buffer.concat([type2.serverChallenge, clientChallenge]))
    .digest();
  const lmResponse = Buffer.concat([lmProof, clientChallenge]);
  return { lmResponse, ntResponse, ntlmV2Hash: hash, blob, clientChallenge };
}

/**
 * Type 3 (AUTHENTICATE) message for a parsed Type 2 challenge.
 * Domain/user/workstation are sent UTF-16LE (NEGOTIATE_UNICODE).
 * `overrides` pins clientChallenge/timestamp for deterministic tests only.
 */
function createType3({ username, domain, workstation, password, type2, overrides }) {
  const { lmResponse, ntResponse } = computeNtlmV2Response({
    username, domain, password, type2, overrides,
  });
  const domainBuf = utf16le(domain || '');
  const userBuf = utf16le(username);
  const wsBuf = utf16le(workstation || '');
  const headerLen = 64;
  let offset = headerLen;
  const lmOff = offset; offset += lmResponse.length;
  const ntOff = offset; offset += ntResponse.length;
  const domOff = offset; offset += domainBuf.length;
  const userOff = offset; offset += userBuf.length;
  const wsOff = offset; offset += wsBuf.length;

  const buf = Buffer.alloc(offset);
  buf.write(SIGNATURE, 0, 'ascii');
  buf.writeUInt32LE(3, 8);
  writeSecBuf(buf, 12, lmResponse.length, lmResponse.length, lmOff);
  writeSecBuf(buf, 20, ntResponse.length, ntResponse.length, ntOff);
  writeSecBuf(buf, 28, domainBuf.length, domainBuf.length, domOff);
  writeSecBuf(buf, 36, userBuf.length, userBuf.length, userOff);
  writeSecBuf(buf, 44, wsBuf.length, wsBuf.length, wsOff);
  writeSecBuf(buf, 52, 0, 0, offset); // Encrypted session key: empty
  buf.writeUInt32LE(TYPE1_FLAGS, 60);
  lmResponse.copy(buf, lmOff);
  ntResponse.copy(buf, ntOff);
  domainBuf.copy(buf, domOff);
  userBuf.copy(buf, userOff);
  wsBuf.copy(buf, wsOff);
  return buf;
}

/** Parse a Type 3 message back into its fields (used by the self-test). */
function parseType3(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 64) {
    throw new Error('NTLM Type 3 message too short');
  }
  if (buf.toString('ascii', 0, 8) !== SIGNATURE || buf.readUInt32LE(8) !== 3) {
    throw new Error('Not an NTLM Type 3 message');
  }
  const field = (off) => {
    const f = readSecBuf(buf, off);
    return Buffer.from(buf.subarray(f.offset, f.offset + f.len));
  };
  return {
    flags: buf.readUInt32LE(60) >>> 0,
    lmResponse: field(12),
    ntResponse: field(20),
    domain: field(28).toString('utf16le'),
    username: field(36).toString('utf16le'),
    workstation: field(44).toString('utf16le'),
  };
}

/**
 * Split a user-supplied login into { username, domain }.
 * Accepts "DOMAIN\\user", "user@domain", or a bare user (domain from
 * `defaultDomain`, else ''). The domain is used both in the Type 3 fields
 * and in the NTLMv2 hash input.
 */
function splitLogin(login, defaultDomain) {
  const s = String(login || '');
  const m = s.match(/^([^\\@]+)\\(.+)$/);
  if (m) return { domain: m[1], username: m[2] };
  const at = s.match(/^([^@]+)@(.+)$/);
  if (at) return { domain: at[2], username: at[1] };
  return { domain: defaultDomain || '', username: s };
}

module.exports = {
  md4,
  ntHash,
  ntlmV2Hash,
  fileTime,
  createType1,
  buildType2,
  parseType2,
  buildNtlmV2Blob,
  computeNtlmV2Response,
  createType3,
  parseType3,
  splitLogin,
  FLAG,
  TYPE1_FLAGS,
  AV,
  SIGNATURE,
};
