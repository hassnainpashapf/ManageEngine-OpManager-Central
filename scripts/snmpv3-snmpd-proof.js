'use strict';

/**
 * snmpv3-snmpd-proof.js — end-to-end SNMPv3 proof for OpManager Central.
 *
 * NOTE (Phase 4 merge): this is the Phase 3 snmpv3-proof track's script,
 * renamed from snmpv3-proof.js — that name now belongs to the service
 * track's in-process-agent proof (scripts/snmpv3-proof.js, 28/28).
 * This script is NOT run in the sandbox: it needs an operator-started
 * system snmpd on 127.0.0.1:161 with 3 USM users (noAuthNoPriv,
 * authNoPriv SHA, authPriv SHA+AES) — see docs/snmpv3-setup.md. Do not
 * configure snmpd from this merge; run this script on a host where the
 * operator has already started it.
 *
 * What it proves (all over the wire, nothing canned):
 *   1. A real SNMPv3 agent (system snmpd, net-snmp 5.9.4, started by the
 *      operator on 127.0.0.1:161) answers GETs at all three USM security
 *      levels — noAuthNoPriv, authNoPriv (SHA), authPriv (SHA + AES).
 *   2. The OpManager tools endpoint (POST /api/tools/snmp-query and
 *      /api/tools/snmp-walk, server/routes/tools.js) performs those GETs
 *      through server/services/snmp.js snmpGetV3/snmpWalkV3 and returns
 *      the exact values the agent sent.
 *   3. Negative cases fail honestly: wrong passphrase → 502, missing
 *      user → 400, short (<8 char) passphrase → 400.
 *
 * Credentials come ONLY from the environment at runtime and are never
 * printed, logged, or written to disk by this script:
 *   OPM_BASE            base URL of the OpManager instance under test
 *                       (default http://127.0.0.1:8160)
 *   SNMPV3_NOAUTH_USER  noAuthNoPriv user name (default opm-noauth)
 *   SNMPV3_AUTH_USER    authNoPriv user name (default opm-auth)
 *   SNMPV3_AUTH_PASS    authNoPriv auth passphrase (>= 8 chars)
 *   SNMPV3_PRIV_USER    authPriv user name (default opm-priv)
 *   SNMPV3_PRIV_PASS    authPriv auth passphrase (>= 8 chars)
 *   SNMPV3_PRIV_PRIVPASS authPriv priv passphrase (>= 8 chars;
 *                       defaults to SNMPV3_PRIV_PASS when unset)
 *   OPM_ADMIN_PASSWORD  password to set for the throwaway local admin
 *                       (the bootstrap password is read at runtime from
 *                       server/data/.admin-initial; this script changes
 *                       it because the server forces a password change
 *                       before any API route answers)
 *
 * Exit code 0 = every check passed; non-zero = at least one failed.
 * Run:  node scripts/snmpv3-proof.js
 */

const fs = require('fs');
const path = require('path');

const BASE = (process.env.OPM_BASE || 'http://127.0.0.1:8160').replace(/\/$/, '');
const SYS_DESCR = '1.3.6.1.2.1.1.1.0';
const SYS_NAME = '1.3.6.1.2.1.1.5.0';
const SYS_UPTIME = '1.3.6.1.2.1.1.3.0';

const LEVELS = [
  {
    name: 'noAuthNoPriv',
    v3: { user: process.env.SNMPV3_NOAUTH_USER || 'opm-noauth' },
  },
  {
    name: 'authNoPriv',
    v3: {
      user: process.env.SNMPV3_AUTH_USER || 'opm-auth',
      authProtocol: 'sha',
      authPass: process.env.SNMPV3_AUTH_PASS || '',
    },
  },
  {
    name: 'authPriv',
    v3: {
      user: process.env.SNMPV3_PRIV_USER || 'opm-priv',
      authProtocol: 'sha',
      authPass: process.env.SNMPV3_PRIV_PASS || '',
      privProtocol: 'aes',
      privPass: process.env.SNMPV3_PRIV_PRIVPASS || process.env.SNMPV3_PRIV_PASS || '',
    },
  },
];

let failures = 0;
function check(label, ok, detail) {
  // detail must never contain a passphrase; callers pass values only.
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function httpJson(url, { method = 'GET', body = null, cookie = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(url, {
    method,
    headers,
    body: body === null ? null : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (_e) { /* non-JSON body */ }
  return { status: res.status, json, text, headers: res.headers };
}

async function main() {
  // --- Log in to the throwaway local instance. ---
  const initialFile = path.join(__dirname, '..', 'server', 'data', '.admin-initial');
  if (!fs.existsSync(initialFile)) {
    console.error('FAIL  bootstrap admin file missing — is the server running? Expected: ' + initialFile);
    process.exit(2);
  }
  const bootstrap = fs.readFileSync(initialFile, 'utf8').trim();
  const newPassword = process.env.OPM_ADMIN_PASSWORD || '';
  if (!newPassword) {
    console.error('FAIL  OPM_ADMIN_PASSWORD env var is required (runtime only, never stored).');
    process.exit(2);
  }

  const login = await httpJson(`${BASE}/api/auth/login`, {
    method: 'POST',
    body: { username: 'admin', password: bootstrap },
  });
  const setCookie = login.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  check('login with bootstrap admin', login.status === 200 && !!cookie, `HTTP ${login.status}`);
  if (!cookie) process.exit(2);

  const changed = await httpJson(`${BASE}/api/auth/change-password`, {
    method: 'POST',
    body: { currentPassword: bootstrap, newPassword },
    cookie,
  });
  check('change bootstrap admin password (forced by server)', changed.status === 200, `HTTP ${changed.status}`);

  // Re-login with the new password: change-password rotates the session.
  const relogin = await httpJson(`${BASE}/api/auth/login`, {
    method: 'POST',
    body: { username: 'admin', password: newPassword },
  });
  const cookie2 = (relogin.headers.get('set-cookie') || '').split(';')[0];
  check('re-login with changed password', relogin.status === 200 && !!cookie2, `HTTP ${relogin.status}`);
  if (!cookie2) process.exit(2);
  const sessionCookie = cookie2;

  // --- Positive proof: one GET per security level, sysDescr + sysName. ---
  const seen = {};
  for (const level of LEVELS) {
    for (const oid of [SYS_DESCR, SYS_NAME]) {
      const r = await httpJson(`${BASE}/api/tools/snmp-query`, {
        method: 'POST',
        body: { ip: '127.0.0.1', oid, version: 'v3', v3: level.v3 },
        cookie: sessionCookie,
      });
      const ok = r.status === 200 && r.json && r.json.status === 'success'
        && r.json.version === 'v3' && r.json.securityLevel === level.name
        && r.json.user === level.v3.user && r.json.value !== null && r.json.value !== undefined;
      check(`v3 GET ${level.name} ${oid}`, ok,
        ok ? `value=${JSON.stringify(r.json.value)}` : `HTTP ${r.status} ${r.text.slice(0, 200)}`);
      if (ok) seen[`${level.name}:${oid}`] = r.json.value;
    }
  }

  // All three levels must see the SAME agent (same sysDescr/sysName):
  // proves the level switch is real USM, not three different answers.
  // The values must be real non-empty strings — if every GET failed,
  // `seen` holds undefined and the check must FAIL, not pass vacuously.
  const descrVals = [seen[`noAuthNoPriv:${SYS_DESCR}`], seen[`authNoPriv:${SYS_DESCR}`], seen[`authPriv:${SYS_DESCR}`]];
  const nameVals = [seen[`noAuthNoPriv:${SYS_NAME}`], seen[`authNoPriv:${SYS_NAME}`], seen[`authPriv:${SYS_NAME}`]];
  const allStrings = (vals) => vals.every((v) => typeof v === 'string' && v.length > 0);
  check('all 3 levels report identical sysDescr', allStrings(descrVals) && new Set(descrVals).size === 1,
    `values=${JSON.stringify(descrVals)}`);
  check('all 3 levels report identical sysName', allStrings(nameVals) && new Set(nameVals).size === 1,
    `values=${JSON.stringify(nameVals)}`);

  // --- Walk proof at the strongest level. ---
  const walk = await httpJson(`${BASE}/api/tools/snmp-walk`, {
    method: 'POST',
    body: { ip: '127.0.0.1', rootOid: '1.3.6.1.2.1.1', version: 'v3', v3: LEVELS[2].v3 },
    cookie: sessionCookie,
  });
  const walkOk = walk.status === 200 && walk.json && walk.json.status === 'success'
    && Array.isArray(walk.json.results) && walk.json.results.length >= 3
    && walk.json.securityLevel === 'authPriv';
  check('v3 WALK system group at authPriv', walkOk,
    walkOk ? `${walk.json.results.length} varbinds` : `HTTP ${walk.status} ${walk.text.slice(0, 200)}`);

  // --- Negative cases (must fail honestly, never fake-200). ---
  const wrongPass = await httpJson(`${BASE}/api/tools/snmp-query`, {
    method: 'POST',
    body: {
      ip: '127.0.0.1', oid: SYS_DESCR, version: 'v3',
      v3: { user: LEVELS[2].v3.user, authProtocol: 'sha', authPass: 'wrongpassphrase', privProtocol: 'aes', privPass: 'wrongprivphrase' },
    },
    cookie: sessionCookie,
  });
  // 502 either way; the detail shows WHY (on a UDP-capable host this is a
  // USM wrong-digest/timeout error — never a fake 200 with a value).
  check('wrong auth passphrase → 502, no value', wrongPass.status === 502,
    `HTTP ${wrongPass.status} ${(wrongPass.json && wrongPass.json.message) || ''}`.slice(0, 160));

  const unknownUser = await httpJson(`${BASE}/api/tools/snmp-query`, {
    method: 'POST',
    body: {
      ip: '127.0.0.1', oid: SYS_DESCR, version: 'v3',
      v3: { user: 'no-such-user' },
    },
    cookie: sessionCookie,
  });
  check('unknown user → 502, no value', unknownUser.status === 502,
    `HTTP ${unknownUser.status} ${(unknownUser.json && unknownUser.json.message) || ''}`.slice(0, 160));

  const missingUser = await httpJson(`${BASE}/api/tools/snmp-query`, {
    method: 'POST',
    body: { ip: '127.0.0.1', oid: SYS_DESCR, version: 'v3', v3: {} },
    cookie: sessionCookie,
  });
  check('missing user → 400 validation', missingUser.status === 400, `HTTP ${missingUser.status}`);

  const shortPass = await httpJson(`${BASE}/api/tools/snmp-query`, {
    method: 'POST',
    body: {
      ip: '127.0.0.1', oid: SYS_DESCR, version: 'v3',
      v3: { user: 'opm-auth', authProtocol: 'sha', authPass: 'short' },
    },
    cookie: sessionCookie,
  });
  check('short (<8) auth passphrase → 400 validation', shortPass.status === 400, `HTTP ${shortPass.status}`);

  const privWithoutAuth = await httpJson(`${BASE}/api/tools/snmp-query`, {
    method: 'POST',
    body: {
      ip: '127.0.0.1', oid: SYS_DESCR, version: 'v3',
      v3: { user: 'opm-priv', privProtocol: 'aes', privPass: 'someprivphrase' },
    },
    cookie: sessionCookie,
  });
  check('privacy without auth → 400 validation', privWithoutAuth.status === 400, `HTTP ${privWithoutAuth.status}`);

  console.log(failures === 0 ? '\nSNMPv3 PROOF: ALL CHECKS PASSED' : `\nSNMPv3 PROOF: ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('FAIL  proof harness crashed:', err && err.message ? err.message : err);
  process.exit(2);
});
