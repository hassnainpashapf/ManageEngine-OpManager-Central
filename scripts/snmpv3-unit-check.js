'use strict';

/**
 * snmpv3-unit-check.js — client-side SNMPv3 checks that need no network.
 *
 * Verifies, without sending a single packet:
 *   1. validateV3() derives the right USM security level for each of the
 *      three levels and maps protocols to net-snmp constants.
 *   2. validateV3() rejects every invalid credential shape (empty user,
 *      unknown protocol, short passphrase, privacy without auth).
 *   3. createV3Session() builds a real net-snmp Version3 session whose
 *      user object carries exactly the name/level/auth/priv the operator
 *      supplied (inspected on the session object, then closed).
 *
 * Dummy passphrases are generated at runtime with crypto.randomBytes —
 * no credential literal appears in this file. This proves the CLIENT
 * code path up to the socket; the over-the-wire exchange is proven by
 * scripts/snmpv3-proof.js against a real in-process net-snmp agent (and
 * by scripts/snmpv3-snmpd-proof.js against a real snmpd — see
 * docs/snmpv3-setup.md for the sandbox UDP limitation on this VM).
 *
 * Canonical Phase 4 merge: validateV3 is the single throwing validator
 * (narrow md5/sha + des/aes) and createV3Session returns the raw
 * net-snmp session — the old { session, creds } wrapper is gone.
 *
 * Run:  node scripts/snmpv3-unit-check.js   (exit 0 = all pass)
 */

const crypto = require('crypto');
const snmp = require('../server/services/snmp');

let failures = 0;
function check(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}
function expectThrow(label, fn) {
  try {
    fn();
    check(label, false, 'did not throw');
  } catch (err) {
    check(label, true, err.message);
  }
}

const randPass = () => crypto.randomBytes(12).toString('hex'); // 24 chars, runtime only

// --- 1. Level derivation ---------------------------------------------------
const noAuth = snmp.validateV3({ user: 'u-none' });
check('noAuthNoPriv derived', noAuth.levelName === 'noAuthNoPriv' && noAuth.level === 1, `level=${noAuth.level}`);

const authNoPriv = snmp.validateV3({ user: 'u-auth', authProtocol: 'sha', authPass: randPass() });
check('authNoPriv (SHA) derived', authNoPriv.levelName === 'authNoPriv' && authNoPriv.level === 2, `level=${authNoPriv.level}`);

const authNoPrivMd5 = snmp.validateV3({ user: 'u-auth', authProtocol: 'MD5', authPass: randPass() });
check('authNoPriv (MD5, case-insensitive) derived', authNoPrivMd5.authProtocol === 'md5' && authNoPrivMd5.level === 2);

const authPriv = snmp.validateV3({
  user: 'u-priv', authProtocol: 'sha', authPass: randPass(), privProtocol: 'AES', privPass: randPass(),
});
check('authPriv (SHA+AES) derived', authPriv.levelName === 'authPriv' && authPriv.level === 3, `level=${authPriv.level}`);

const authPrivDes = snmp.validateV3({
  user: 'u-priv', authProtocol: 'md5', authPass: randPass(), privProtocol: 'des', privPass: randPass(),
});
check('authPriv (MD5+DES) derived', authPrivDes.level === 3 && authPrivDes.privProtocol === 'des');

// --- 2. Rejections ----------------------------------------------------------
expectThrow('empty user rejected', () => snmp.validateV3({ user: '  ' }));
expectThrow('missing v3 object rejected', () => snmp.validateV3(null));
expectThrow('unknown authProtocol rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha256', authPass: randPass() }));
expectThrow('unknown privProtocol rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha', authPass: randPass(), privProtocol: 'aes256', privPass: randPass() }));
expectThrow('7-char authPass rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha', authPass: '1234567' }));
expectThrow('7-char privPass rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha', authPass: randPass(), privProtocol: 'aes', privPass: '1234567' }));
expectThrow('missing authPass rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha' }));
expectThrow('missing privPass rejected', () => snmp.validateV3({ user: 'u', authProtocol: 'sha', authPass: randPass(), privProtocol: 'aes' }));
expectThrow('privacy without auth rejected', () => snmp.validateV3({ user: 'u', privProtocol: 'aes', privPass: randPass() }));

// --- 3. Real net-snmp session construction ----------------------------------
const netSnmp = require('net-snmp');
function checkSession(label, v3, expect) {
  const session = snmp.createV3Session('127.0.0.1', v3);
  try {
    const ok = session.version === netSnmp.Version3
      && session.user.name === expect.name
      && session.user.level === expect.level
      && (expect.authProtocol === undefined || session.user.authProtocol === netSnmp.AuthProtocols[expect.authProtocol])
      && (expect.authKey === undefined || session.user.authKey === expect.authKey)
      && (expect.privProtocol === undefined || session.user.privProtocol === netSnmp.PrivProtocols[expect.privProtocol])
      && (expect.privKey === undefined || session.user.privKey === expect.privKey);
    check(label, ok, `version=${session.version} user=${JSON.stringify({ name: session.user.name, level: session.user.level })}`);
  } finally {
    session.close();
  }
}
const aPass = randPass();
const pAuth = randPass();
const pPriv = randPass();
checkSession('session: noAuthNoPriv user object',
  { user: 'u-none' }, { name: 'u-none', level: 1 });
checkSession('session: authNoPriv user object (SHA key carried)',
  { user: 'u-auth', authProtocol: 'sha', authPass: aPass },
  { name: 'u-auth', level: 2, authProtocol: 'sha', authKey: aPass });
checkSession('session: authPriv user object (SHA + AES keys carried)',
  { user: 'u-priv', authProtocol: 'sha', authPass: pAuth, privProtocol: 'aes', privPass: pPriv },
  { name: 'u-priv', level: 3, authProtocol: 'sha', authKey: pAuth, privProtocol: 'aes', privKey: pPriv });

console.log(failures === 0 ? '\nSNMPv3 UNIT CHECK: ALL CHECKS PASSED' : `\nSNMPv3 UNIT CHECK: ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
