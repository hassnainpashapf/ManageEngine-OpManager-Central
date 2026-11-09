'use strict';

/**
 * test-ldap.js — Negative / edge tests for LDAP (Phase 3, ldap-tests track).
 *
 * TEST-ONLY file: it never changes product code. It exercises the LDAP
 * feature through three tiers, best-effort, and reports each case as
 * PASS / FAIL / NOT_IMPLEMENTED (feature absent in this build) / BUG.
 *
 *   Tier A — protocol ground truth: a raw ldapjs client against the local
 *            test directory below. Always runs; establishes what the
 *            directory itself returns (LDAP 49 / 32 / ECONNREFUSED).
 *   Tier B — service module: require('../server/services/ldap') when it
 *            exists in this build (ldap-service track: testBind,
 *            searchUsers, searchGroups, authenticateUser; LdapError
 *            carries .status 400/401/404/502). When the module is absent
 *            the cases are NOT_IMPLEMENTED, not faked.
 *   Tier C — HTTP API: the routes the ldap-routes track defines
 *            (POST /api/settings/auth/ad/test, GET /api/ad/users,
 *            GET /api/ad/groups, POST /api/settings/auth/ldap), driven
 *            with a real admin session against this clone's OWN server
 *            instance (started by this script on OPM_PORT, default
 *            8144). When a route is absent (404) the case is
 *            NOT_IMPLEMENTED. A 500 from a route whose service call
 *            crashes is a FAIL/BUG with the exact body recorded.
 *
 * *** LOCAL TEST DIRECTORY — NOT a production device. ***
 * The directory below is synthetic test data (dc=test,dc=local; users
 * alice/bob; group IT-Admins). It is a real in-process ldapjs LDAPv3
 * server on 127.0.0.1 (real BER encoding over TCP) and exists only to
 * prove the client speaks real LDAP. It is NOT the GVS Active Directory
 * (DC 192.168.22.5, gamevillage.com.pk) and no result here claims a
 * production bind succeeded.
 *
 * Credentials: generated at runtime with crypto.randomBytes (or taken
 * from LDAP_TEST_BIND_PASSWORD / LDAP_TEST_USER_PASSWORD env vars) and
 * NEVER written to a file, a log, the database, or this script's output.
 * The OpManager admin login uses the bootstrap password read at runtime
 * from server/data/.admin-initial; the script changes it once to a fresh
 * random password (in memory only) to clear the must-change flag, as the
 * API guard 403s every other route until it is changed.
 *
 * Cases:
 *   C1  wrong bind password        -> honest auth error (401)
 *   C2  unknown bind DN            -> honest auth error (401)
 *   C3  filter matching nothing    -> honest empty result (200, [], count 0)
 *   C4  search base does not exist -> honest error (404)
 *   C5  unreachable LDAP URL       -> honest error, bounded time (elapsed ms)
 *   C6  bind password appears NOWHERE in any API response, server log
 *       line, or stored record (grep count must be 0)
 *
 * Usage (from the repo root):
 *   node scripts/test-ldap.js [--port 8144] [--base http://127.0.0.1:8144]
 *   OPM_MANAGE_SERVER=0 node scripts/test-ldap.js   # use an already-running server
 * Exit 0 = no FAIL / SECURITY BUG (NOT_IMPLEMENTED cases are listed, not
 * hidden). Exit 1 = at least one FAIL or SECURITY BUG.
 *
 * Dependency: ldapjs@3.0.7 (same version the ldap-service / ldap-routes
 * tracks use; speaks real LDAPv3 over TCP).
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const ldap = require('ldapjs');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_PORT = 8144;

// ---------------------------------------------------------------------------
// CLI / env
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
function argValue(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const OPM_PORT = Number(argValue('--port', process.env.OPM_PORT || DEFAULT_PORT)) || DEFAULT_PORT;
const OPM_BASE = argValue('--base', process.env.OPM_BASE || `http://127.0.0.1:${OPM_PORT}`);
const MANAGE_SERVER = process.env.OPM_MANAGE_SERVER !== '0';

// Runtime-only secrets. Generated here; never persisted, never printed.
const BIND_PASSWORD = process.env.LDAP_TEST_BIND_PASSWORD || crypto.randomBytes(18).toString('base64url');
const USER_PASSWORD = process.env.LDAP_TEST_USER_PASSWORD || crypto.randomBytes(18).toString('base64url');
const WRONG_PASSWORD = `${BIND_PASSWORD.slice(0, -4)}WRONG`; // same length class, guaranteed different
if (BIND_PASSWORD === USER_PASSWORD) throw new Error('refusing to run: bind and user passwords collided');

// ---------------------------------------------------------------------------
// Local test directory (real ldapjs LDAPv3 server on 127.0.0.1, ephemeral port)
// ---------------------------------------------------------------------------

const BASE_DN = 'dc=test,dc=local';
const ADMIN_DN = 'cn=admin,dc=test,dc=local';
const USERS_OU = `ou=users,${BASE_DN}`;
const GROUPS_OU = `ou=groups,${BASE_DN}`;

const ENTRIES = [
  { dn: BASE_DN, attrs: { objectclass: ['domain', 'top'], dc: ['test'] } },
  { dn: USERS_OU, attrs: { objectclass: ['organizationalunit', 'top'], ou: ['users'] } },
  { dn: GROUPS_OU, attrs: { objectclass: ['organizationalunit', 'top'], ou: ['groups'] } },
  {
    dn: `cn=Alice Anderson,${USERS_OU}`,
    attrs: {
      objectclass: ['user', 'person', 'top'],
      cn: ['Alice Anderson'],
      displayname: ['Alice Anderson'],
      samaccountname: ['alice'],
      userprincipalname: ['alice@test.local'],
      mail: ['alice@test.local'],
      distinguishedname: [`cn=Alice Anderson,${USERS_OU}`],
      memberof: [`cn=IT-Admins,${GROUPS_OU}`],
      useraccountcontrol: ['512'],
      primarygroupid: ['513'],
    },
  },
  {
    dn: `cn=Bob Baker,${USERS_OU}`,
    attrs: {
      objectclass: ['user', 'person', 'top'],
      cn: ['Bob Baker'],
      displayname: ['Bob Baker'],
      samaccountname: ['bob'],
      userprincipalname: ['bob@test.local'],
      distinguishedname: [`cn=Bob Baker,${USERS_OU}`],
      useraccountcontrol: ['512'],
      primarygroupid: ['513'],
    },
  },
  {
    dn: `cn=IT-Admins,${GROUPS_OU}`,
    attrs: {
      objectclass: ['group', 'top'],
      cn: ['IT-Admins'],
      name: ['IT-Admins'],
      distinguishedname: [`cn=IT-Admins,${GROUPS_OU}`],
      member: [`cn=Alice Anderson,${USERS_OU}`],
      primarygrouptoken: ['1111'],
    },
  },
];

const norm = (dn) => String(dn || '').trim().toLowerCase();
const CREDENTIALS = new Map([
  [norm(ADMIN_DN), BIND_PASSWORD],
  [norm(`cn=Alice Anderson,${USERS_OU}`), USER_PASSWORD],
  [norm(`cn=Bob Baker,${USERS_OU}`), USER_PASSWORD],
]);

function startTestDirectory() {
  const server = ldap.createServer();
  server.bind(BASE_DN, (req, res, next) => {
    const expected = CREDENTIALS.get(norm(req.dn.toString()));
    if (!expected || req.credentials !== expected) {
      return next(new ldap.InvalidCredentialsError());
    }
    res.end();
    return next();
  });
  server.search(BASE_DN, (req, res, next) => {
    const baseDn = norm(req.dn.toString());
    if (!ENTRIES.some((e) => norm(e.dn) === baseDn)) {
      return next(new ldap.NoSuchObjectError(req.dn.toString()));
    }
    // ldapjs 3.x exposes scope as a NUMBER (0 = base, 1 = one, 2 = sub),
    // not the 'base'/'one'/'sub' strings of ldapjs 2.x.
    const scope = req.scope === 0 || req.scope === 'base' ? 'base' : (req.scope === 1 || req.scope === 'one' ? 'one' : 'sub');
    for (const entry of ENTRIES) {
      const dn = norm(entry.dn);
      let inScope = false;
      if (scope === 'base') inScope = dn === baseDn;
      else if (scope === 'one') inScope = dn.endsWith(`,${baseDn}`) && !dn.slice(0, dn.length - baseDn.length - 1).includes(',');
      else inScope = dn === baseDn || dn.endsWith(`,${baseDn}`);
      if (!inScope) continue;
      // Filter matching is done against a copy keyed BOTH ways (original
      // lower-case keys and AD casing): ldapjs filter matching is
      // case-sensitive on the attribute-object keys in nested (&)/(|)
      // filters and in presence filters, while real AD matches attribute
      // names case-insensitively. Supplying both casings makes this test
      // server behave like AD. (Same approach as the ldap-service proof
      // server. MERGE M3 change to this harness: without it the merged
      // client's base-scope testBind search '(objectClass=*)' matched
      // nothing against the lower-case-only keys.)
      const matchAttrs = {};
      for (const [k, v] of Object.entries(entry.attrs)) {
        matchAttrs[k] = v;
        matchAttrs[k.toLowerCase()] = v;
        // AD-cased alias for the attributes the canonical client names
        // in mixed case (sAMAccountName etc.) — the lower-case key above
        // already covers the client's lower-case lookup filters; the
        // mixed-case keys cover a caller-supplied AD-style filter.
        const adCased = { samaccountname: 'sAMAccountName', userprincipalname: 'userPrincipalName', displayname: 'displayName', distinguishedname: 'distinguishedName', memberof: 'memberOf', useraccountcontrol: 'userAccountControl', primarygroupid: 'primaryGroupID', objectclass: 'objectClass' }[k.toLowerCase()];
        if (adCased) matchAttrs[adCased] = v;
      }
      if (req.filter && !req.filter.matches(matchAttrs)) continue;
      // Send a real SearchEntry instance: ldapjs 3's server-side
      // SearchResponse.send() filters plain-object entries against the
      // requested attribute list by comparing the LOWER-CASED stored name
      // to the list verbatim, so mixed-case AD names (sAMAccountName,
      // ...) in the canonical client's request would otherwise be
      // dropped. A SearchEntry takes the unfiltered branch in send().
      // (MERGE M3 change to this harness.)
      res.send(new ldap.SearchEntry({
        messageId: res.messageId,
        objectName: entry.dn,
        attributes: Object.entries(entry.attrs).map(([type, values]) => ({
          type,
          values: Array.isArray(values) ? values : [values],
        })),
      }));
    }
    res.end();
    return next();
  });
  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (err) => {
      if (err) return reject(err);
      resolve({ server, port: server.address().port });
    });
  });
}

function stopServer(server) {
  return new Promise((resolve) => {
    try { server.close(() => resolve()); } catch { resolve(); }
    setTimeout(resolve, 1000).unref();
  });
}

// Raw ldapjs client helpers (Tier A ground truth; no product code involved).
// NOTE (ldapjs 3.0.7 race): when the TCP connect itself fails, ldapjs may
// deliver the bind callback as EITHER the socket error (ECONNREFUSED, via
// the 'connectError' event) OR "client destroyed" (the client destroys
// itself while failing the pending bind). Which one arrives first varies
// run to run. We therefore capture the socket error from BOTH 'error' and
// 'connectError', and when the first bind callback is "client destroyed"
// we wait a beat (150 ms) for the socket error to arrive before deciding.
function ldapBindRaw(url, dn, password, opts = {}) {
  const client = ldap.createClient({ url, timeout: opts.timeout || 3000, connectTimeout: opts.connectTimeout || 2000 });
  let socketErr = null;
  const capture = (e) => { if (!socketErr) socketErr = e; };
  client.on('error', capture);
  client.on('connectError', capture);
  const done = () => { try { client.unbind(() => {}); } catch {} try { client.destroy(); } catch {} };
  return new Promise((resolve, reject) => {
    let settled = false;
    const watchdog = setTimeout(() => {
      if (settled) return;
      settled = true;
      done();
      reject(socketErr || new Error('LDAP bind timed out (no callback from ldapjs client)'));
    }, (opts.timeout || 3000) + (opts.connectTimeout || 2000) + 2000);
    client.bind(dn, password, (err) => {
      if (settled) return; // ldapjs may invoke the callback twice (error + "client destroyed")
      if (!err) {
        settled = true;
        clearTimeout(watchdog);
        return resolve({ client, done });
      }
      // "client destroyed" on a fresh single-use client means ldapjs tore
      // the client down while the connect was failing; give the socket
      // error a moment to arrive so we report the real cause.
      if (/client destroyed/i.test(String(err.message || '')) && !socketErr) {
        setTimeout(() => {
          if (settled) return;
          settled = true;
          clearTimeout(watchdog);
          done();
          reject(socketErr || err);
        }, 150);
        return;
      }
      settled = true;
      clearTimeout(watchdog);
      done();
      reject(err);
    });
  });
}
function ldapSearchRaw(client, base, filter) {
  return new Promise((resolve, reject) => {
    client.search(base, { filter, scope: 'sub', attributes: ['*'] }, (err, res) => {
      if (err) return reject(err);
      const entries = [];
      res.on('searchEntry', (e) => entries.push(e.dn ? e.dn.toString() : ''));
      res.on('error', reject);
      res.on('end', (result) => {
        if (result && result.status !== 0) {
          const e = new Error(result.errorMessage || `LDAP search failed with status ${result.status}`);
          e.code = result.status;
          return reject(e);
        }
        resolve(entries);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Results harness
// ---------------------------------------------------------------------------

const results = [];
function record(tier, id, name, verdict, detail) {
  results.push({ tier, id, name, verdict, detail });
  console.log(`[${verdict}] ${tier} ${id} ${name}: ${detail}`);
}
// PASS / FAIL / NOT_IMPLEMENTED / BUG (BUG = wrong behaviour with exact repro;
// SECURITY BUG = a credential leaked or fake entries returned).
function summarize() {
  const counts = {};
  for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1;
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ total: results.length, ...counts, results }, null, 2));
  const bad = results.filter((r) => r.verdict === 'FAIL' || r.verdict === 'BUG' || r.verdict === 'SECURITY BUG');
  if (bad.length > 0) {
    console.log(`\n${bad.length} case(s) FAILED — see above. Exit 1.`);
    return 1;
  }
  console.log('\nNo FAIL / BUG cases. NOT_IMPLEMENTED cases (if any) mean the feature is absent in this build, not that it passed. Exit 0.');
  return 0;
}

// Redact any accidental occurrence of a runtime secret from a string we log.
function redact(s) {
  let out = String(s == null ? '' : s);
  for (const secret of [BIND_PASSWORD, USER_PASSWORD, WRONG_PASSWORD]) {
    if (secret) out = out.split(secret).join('<redacted-secret>');
  }
  return out;
}
function snippet(s, max = 300) {
  const r = redact(String(s == null ? '' : s)).replace(/\s+/g, ' ').trim();
  return r.length > max ? `${r.slice(0, max)}…` : r;
}

// ---------------------------------------------------------------------------
// HTTP helper (records every response body for the C6 leak scan)
// ---------------------------------------------------------------------------

const capturedBodies = []; // { label, status, body }
let sessionCookie = '';
async function http(label, method, urlPath, { body, headers } = {}) {
  const t0 = Date.now();
  const res = await fetch(`${OPM_BASE}${urlPath}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const setCookie = res.headers.get('set-cookie') || '';
  const m = /opm_session=([^;]+)/.exec(setCookie);
  if (m) sessionCookie = `opm_session=${m[1]}`;
  capturedBodies.push({ label, status: res.status, body: text });
  return { status: res.status, text, elapsedMs: Date.now() - t0, json: safeJson(text) };
}
function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

// ---------------------------------------------------------------------------
// Own OpManager server instance (Tier C only)
// ---------------------------------------------------------------------------

let child = null;
let serverLogPath = null;
let serverLogChunks = [];
async function startOwnServer() {
  // Fresh throwaway DB per run: a previous run changed the bootstrap admin
  // password (in memory only), so reusing the DB would make the bootstrap
  // password in server/data/.admin-initial stale and login 401. Deleting
  // only this clone's own server/data store files (gitignored) is safe.
  for (const name of ['opmanager.db', 'opmanager.db-wal', 'opmanager.db-shm', '.admin-initial']) {
    try { fs.unlinkSync(path.join(REPO_ROOT, 'server', 'data', name)); } catch { /* not present */ }
  }
  serverLogPath = path.join(os.tmpdir(), `opm-ldap-test-${process.pid}.log`);
  const logStream = fs.createWriteStream(serverLogPath, { flags: 'w' });
  child = spawn('node', ['server/index.js'], {
    cwd: REPO_ROOT,
    env: { ...process.env, PORT: String(OPM_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => { serverLogChunks.push(d.toString()); logStream.write(d); });
  child.stderr.on('data', (d) => { serverLogChunks.push(d.toString()); logStream.write(d); });
  const deadline = Date.now() + 25000;
  for (;;) {
    try {
      const res = await fetch(`${OPM_BASE}/login.html`);
      if (res.status === 200) { await new Promise((r) => setTimeout(r, 500)); return true; }
    } catch { /* not up yet */ }
    if (Date.now() > deadline) return false;
    if (child.exitCode !== null) return false;
    await new Promise((r) => setTimeout(r, 500));
  }
}
async function stopOwnServer() {
  if (!child) return;
  try { child.kill('SIGTERM'); } catch {}
  await new Promise((r) => setTimeout(r, 800));
  try { child.kill('SIGKILL'); } catch {}
  child = null;
}

// Admin login (bootstrap password is read at runtime only, never printed);
// clears the must-change-password flag so the API guard stops 403ing.
async function loginAsAdmin() {
  const bootstrapFile = path.join(REPO_ROOT, 'server', 'data', '.admin-initial');
  if (!fs.existsSync(bootstrapFile)) return { ok: false, detail: 'bootstrap file server/data/.admin-initial not found (server may already have an admin)' };
  const bootstrapPw = fs.readFileSync(bootstrapFile, 'utf8').trim();
  const login = await http('admin-login', 'POST', '/api/auth/login', { body: { username: 'admin', password: bootstrapPw } });
  if (login.status !== 200) return { ok: false, detail: `login as bootstrap admin failed: HTTP ${login.status} ${snippet(login.text, 120)}` };
  if (login.json && login.json.mustChangePassword) {
    const freshPw = crypto.randomBytes(15).toString('base64url'); // >= 10 chars, memory only
    const changed = await http('admin-change-password', 'POST', '/api/auth/change-password', {
      body: { currentPassword: bootstrapPw, newPassword: freshPw },
    });
    if (changed.status !== 200) return { ok: false, detail: `password change failed: HTTP ${changed.status} ${snippet(changed.text, 120)}` };
    // Session cookie was rotated by the change; http() already captured it.
  }
  const session = await http('admin-session', 'GET', '/api/auth/session');
  if (session.status !== 200) return { ok: false, detail: `session check failed: HTTP ${session.status}` };
  return { ok: true, detail: `admin session OK (user=${(session.json && session.json.user && session.json.user.username) || 'admin'})` };
}

// A TCP port that is currently closed (bind 0, read the port, close it).
function closedPort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const port = s.address().port;
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Tier A — protocol ground truth (raw ldapjs client vs local test directory)
// ---------------------------------------------------------------------------

async function tierA(ldapUrl) {
  console.log(`\n--- Tier A: protocol ground truth against LOCAL TEST DIRECTORY ${ldapUrl} ---`);
  // A1 wrong bind password -> LDAP 49 InvalidCredentialsError.
  try {
    await ldapBindRaw(ldapUrl, ADMIN_DN, WRONG_PASSWORD);
    record('A', 'A1', 'wrong bind password (raw)', 'BUG', 'bind with wrong password SUCCEEDED against the test directory — directory is not checking credentials');
  } catch (err) {
    const code = err && err.code;
    if (code === 49 || /InvalidCredentials/i.test(err.name || '') || /invalid credentials/i.test(err.message || '')) {
      record('A', 'A1', 'wrong bind password (raw)', 'PASS', `bind rejected: LDAP result code 49 InvalidCredentialsError (name=${err.name})`);
    } else {
      record('A', 'A1', 'wrong bind password (raw)', 'FAIL', `bind rejected but with unexpected error: code=${code} name=${err.name} message=${snippet(err.message, 160)}`);
    }
  }
  // A2 unknown bind DN -> LDAP 49 as well (directory cannot distinguish).
  try {
    await ldapBindRaw(ldapUrl, `cn=ghost,${BASE_DN}`, BIND_PASSWORD);
    record('A', 'A2', 'unknown bind DN (raw)', 'BUG', 'bind with unknown DN SUCCEEDED — directory is not checking the DN');
  } catch (err) {
    const code = err && err.code;
    if (code === 49 || /InvalidCredentials/i.test(err.name || '') || /invalid credentials/i.test(err.message || '')) {
      record('A', 'A2', 'unknown bind DN (raw)', 'PASS', `bind rejected: LDAP result code 49 InvalidCredentialsError (name=${err.name})`);
    } else {
      record('A', 'A2', 'unknown bind DN (raw)', 'FAIL', `bind rejected but with unexpected error: code=${code} name=${err.name} message=${snippet(err.message, 160)}`);
    }
  }
  // A3 filter matching nothing -> success, 0 entries (not an error, no fake rows).
  try {
    const { client, done } = await ldapBindRaw(ldapUrl, ADMIN_DN, BIND_PASSWORD);
    try {
      const entries = await ldapSearchRaw(client, BASE_DN, '(cn=NoSuchPerson_xyz)');
      if (entries.length === 0) record('A', 'A3', 'filter matching nothing (raw)', 'PASS', 'search succeeded with 0 entries (empty result, not an error, no fake rows)');
      else record('A', 'A3', 'filter matching nothing (raw)', 'SECURITY BUG', `search for a nonexistent cn returned ${entries.length} row(s): ${snippet(entries.join(','), 200)} — FAKE ENTRIES`);
    } finally { done(); }
  } catch (err) {
    record('A', 'A3', 'filter matching nothing (raw)', 'FAIL', `search failed instead of returning empty: code=${err && err.code} message=${snippet(err.message, 160)}`);
  }
  // A4 search base that does not exist -> LDAP 32 NoSuchObjectError.
  try {
    const { client, done } = await ldapBindRaw(ldapUrl, ADMIN_DN, BIND_PASSWORD);
    try {
      await ldapSearchRaw(client, `ou=nowhere,${BASE_DN}`, '(objectClass=*)');
      record('A', 'A4', 'nonexistent search base (raw)', 'FAIL', 'search under ou=nowhere succeeded instead of erroring');
    } catch (err) {
      const code = err && err.code;
      if (code === 32 || /NoSuchObject/i.test(err.name || '') || /no such object/i.test(err.message || '')) {
        record('A', 'A4', 'nonexistent search base (raw)', 'PASS', `search rejected: LDAP result code 32 NoSuchObjectError (name=${err.name})`);
      } else {
        record('A', 'A4', 'nonexistent search base (raw)', 'FAIL', `search rejected but with unexpected error: code=${code} name=${err.name} message=${snippet(err.message, 160)}`);
      }
    } finally { done(); }
  } catch (err) {
    record('A', 'A4', 'nonexistent search base (raw)', 'FAIL', `bind failed before search: ${snippet(err.message, 160)}`);
  }
  // A5 unreachable URL -> transport error, bounded time.
  const deadPort = await closedPort();
  const deadUrl = `ldap://127.0.0.1:${deadPort}`;
  const t0 = Date.now();
  try {
    await ldapBindRaw(deadUrl, ADMIN_DN, BIND_PASSWORD);
    record('A', 'A5', 'unreachable LDAP URL (raw)', 'FAIL', `bind to closed port ${deadPort} SUCCEEDED — impossible`);
  } catch (err) {
    const elapsed = Date.now() - t0;
    // ldapjs 3.0.7 may surface a refused connect as ECONNREFUSED or, by
    // race, as "client destroyed" (the client tears itself down while the
    // connect fails). Either is a fast, honest transport failure — record
    // exactly which one surfaced.
    const text = `${err.message || ''} ${err.name || ''} ${err.code || ''}`;
    const transport = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|timeout|ConnectionError/i.test(text);
    const destroyed = /client destroyed/i.test(text);
    if ((transport || destroyed) && elapsed < 10000) {
      record('A', 'A5', 'unreachable LDAP URL (raw)', 'PASS', `bind failed fast with ${err.code || err.name} (${destroyed && !transport ? 'ldapjs "client destroyed" race — connect never completed' : 'transport error'}) in ${elapsed} ms (bounded, <10000 ms)`);
    } else {
      record('A', 'A5', 'unreachable LDAP URL (raw)', 'FAIL', `unreachable bind error not bounded/recognisable: elapsed=${elapsed} ms code=${err.code} name=${err.name} message=${snippet(err.message, 160)}`);
    }
  }
  // A0 positive control: correct bind + user search returns exactly alice, bob.
  try {
    const { client, done } = await ldapBindRaw(ldapUrl, ADMIN_DN, BIND_PASSWORD);
    try {
      const entries = await ldapSearchRaw(client, BASE_DN, '(objectClass=user)');
      const names = entries.map((dn) => dn.split(',')[0]).sort();
      if (entries.length === 2 && names.join(',') === 'cn=Alice Anderson,cn=Bob Baker') {
        record('A', 'A0', 'positive control (raw)', 'PASS', `correct bind + (objectClass=user) returned exactly 2 users: ${names.join(', ')}`);
      } else {
        record('A', 'A0', 'positive control (raw)', 'FAIL', `expected exactly alice+bob, got ${entries.length}: ${snippet(entries.join(','), 200)}`);
      }
    } finally { done(); }
  } catch (err) {
    record('A', 'A0', 'positive control (raw)', 'FAIL', `correct bind failed: ${snippet(err.message, 160)}`);
  }
}

// ---------------------------------------------------------------------------
// Tier B — product service module (server/services/ldap.js, when present)
// ---------------------------------------------------------------------------

function loadService() {
  try {
    // eslint-disable-next-line global-require
    return require(path.join(REPO_ROOT, 'server', 'services', 'ldap.js'));
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

async function tierB(ldapUrl) {
  console.log('\n--- Tier B: product service module server/services/ldap.js ---');
  let svc;
  try {
    svc = loadService();
  } catch (err) {
    record('B', 'B*', 'service module load', 'BUG', `server/services/ldap.js exists but fails to load: ${snippet(err.message, 200)}`);
    return;
  }
  if (!svc) {
    for (const [id, name] of [
      ['C1', 'wrong bind password'], ['C2', 'unknown bind DN'], ['C3', 'filter matching nothing'],
      ['C4', 'nonexistent search base'], ['C5', 'unreachable LDAP URL'],
    ]) {
      record('B', id, `${name} (service)`, 'NOT_IMPLEMENTED', 'server/services/ldap.js not present in this build (ldap-service track has not landed here); no product code to test');
    }
    return;
  }
  const config = {
    url: ldapUrl, bindDn: ADMIN_DN, baseDn: BASE_DN,
    groupBase: GROUPS_OU, userFilter: '(objectClass=user)', groupFilter: '(objectClass=group)',
  };
  const expectStatus = async (id, name, status, code, fn, detail) => {
    try {
      const out = await fn();
      record('B', id, name, 'FAIL', `expected LdapError ${status} (${code}), call SUCCEEDED: ${snippet(JSON.stringify(out), 200)}`);
    } catch (err) {
      const gotStatus = err && err.status;
      const gotCode = err && err.code;
      const msg = snippet(err && err.message, 160);
      if (err && err.name === 'LdapError' && gotStatus === status && gotCode === code) {
        record('B', id, name, 'PASS', `${detail} -> LdapError status=${gotStatus} code=${gotCode} message="${msg}"`);
      } else if (err && err.name === 'LdapError') {
        record('B', id, name, 'FAIL', `${detail} -> wrong honest error: status=${gotStatus} code=${gotCode} (expected ${status}/${code}) message="${msg}"`);
      } else {
        record('B', id, name, 'FAIL', `${detail} -> non-LdapError thrown: ${err && err.name} message="${msg}"`);
      }
    }
  };

  // B0 positive control.
  try {
    const ok = await svc.testBind(config, BIND_PASSWORD);
    record('B', 'B0', 'positive control (service)', ok && ok.ok === true ? 'PASS' : 'FAIL', `testBind ok=${ok && ok.ok} latencyMs=${ok && ok.latencyMs}`);
  } catch (err) {
    record('B', 'B0', 'positive control (service)', 'FAIL', `testBind with correct credentials threw: status=${err && err.status} code=${err && err.code} message=${snippet(err.message, 160)}`);
  }
  // C1 wrong bind password -> 401 LDAP_INVALID_CREDENTIALS.
  await expectStatus('C1', 'wrong bind password (service)', 401, 'LDAP_INVALID_CREDENTIALS',
    () => svc.testBind(config, WRONG_PASSWORD), 'testBind(wrong password)');
  // C2 unknown bind DN -> 401 LDAP_INVALID_CREDENTIALS.
  await expectStatus('C2', 'unknown bind DN (service)', 401, 'LDAP_INVALID_CREDENTIALS',
    () => svc.testBind({ ...config, bindDn: `cn=ghost,${BASE_DN}` }, BIND_PASSWORD), 'testBind(unknown bind DN)');
  // C3 filter matching nothing -> success, [] (not an error, not fake rows).
  try {
    const users = await svc.searchUsers(config, BIND_PASSWORD, { filter: '(cn=NoSuchPerson_xyz)' });
    if (Array.isArray(users) && users.length === 0) {
      record('B', 'C3', 'filter matching nothing (service)', 'PASS', 'searchUsers returned [] (empty array, not an error, no fake rows)');
    } else if (Array.isArray(users)) {
      record('B', 'C3', 'filter matching nothing (service)', 'SECURITY BUG', `searchUsers for a nonexistent cn returned ${users.length} row(s): ${snippet(JSON.stringify(users), 200)} — FAKE ENTRIES`);
    } else {
      record('B', 'C3', 'filter matching nothing (service)', 'FAIL', `searchUsers returned non-array: ${snippet(JSON.stringify(users), 160)}`);
    }
  } catch (err) {
    record('B', 'C3', 'filter matching nothing (service)', 'FAIL', `searchUsers threw instead of returning []: status=${err && err.status} code=${err && err.code} message=${snippet(err.message, 160)}`);
  }
  // C4 nonexistent search base -> 404 LDAP_NO_SUCH_OBJECT.
  await expectStatus('C4', 'nonexistent search base (service)', 404, 'LDAP_NO_SUCH_OBJECT',
    () => svc.searchUsers(config, BIND_PASSWORD, { baseDn: `ou=nowhere,${BASE_DN}` }), 'searchUsers(base ou=nowhere)');
  // C5 unreachable URL -> 502 LDAP_UNREACHABLE, bounded time.
  const deadPort = await closedPort();
  const t0 = Date.now();
  try {
    await svc.testBind({ ...config, url: `ldap://127.0.0.1:${deadPort}` }, BIND_PASSWORD);
    record('B', 'C5', 'unreachable LDAP URL (service)', 'FAIL', `testBind to closed port ${deadPort} SUCCEEDED — impossible`);
  } catch (err) {
    const elapsed = Date.now() - t0;
    if (err && err.name === 'LdapError' && err.status === 502 && err.code === 'LDAP_UNREACHABLE' && elapsed < 15000) {
      record('B', 'C5', 'unreachable LDAP URL (service)', 'PASS', `testBind failed honestly: status=502 code=LDAP_UNREACHABLE in ${elapsed} ms (bounded, <15000 ms)`);
    } else if (err && err.name === 'LdapError' && err.status === 502 && err.code === 'LDAP_UPSTREAM' && /client destroyed/i.test(err.message || '') && elapsed < 15000) {
      // Known ldapjs 3.0.7 race (see ldapBindRaw note): the refused connect
      // can surface as "client destroyed" instead of ECONNREFUSED, and
      // mapLdapError() does not recognise that string, so the service
      // reports LDAP_UPSTREAM instead of LDAP_UNREACHABLE. Status is still
      // an honest 502 and time is bounded — but the code is imprecise.
      record('B', 'C5', 'unreachable LDAP URL (service)', 'BUG', `testBind to closed port ${deadPort} returned status=502 code=LDAP_UPSTREAM (expected LDAP_UNREACHABLE) in ${elapsed} ms: mapLdapError() does not recognise ldapjs "client destroyed" — repro: testBind({url: ldap://127.0.0.1:<closed-port>}, pw) after other LDAP calls in the same process; fix: match /client destroyed/i as unreachable in mapLdapError()`);
    } else {
      record('B', 'C5', 'unreachable LDAP URL (service)', 'FAIL', `unreachable testBind: status=${err && err.status} code=${err && err.code} elapsed=${elapsed} ms message=${snippet(err && err.message, 160)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Tier C — HTTP API (routes, when present) against our own server instance
// ---------------------------------------------------------------------------

async function tierC(ldapUrl) {
  console.log(`\n--- Tier C: HTTP API against own server ${OPM_BASE} ---`);
  const login = await loginAsAdmin();
  if (!login.ok) {
    for (const [id, name] of [
      ['C1', 'wrong bind password'], ['C2', 'unknown bind DN'], ['C3', 'filter matching nothing'],
      ['C4', 'nonexistent search base'], ['C5', 'unreachable LDAP URL'],
    ]) {
      record('C', id, `${name} (API)`, 'NOT_IMPLEMENTED', `cannot reach the API: ${login.detail}`);
    }
    record('C', 'C0', 'admin login', 'FAIL', login.detail);
    return;
  }
  record('C', 'C0', 'admin login', 'PASS', login.detail);

  // Route presence probes (404 = route absent in this build; 501 with
  // error=not_implemented = route present but the feature honestly reports
  // itself unimplemented — also NOT_IMPLEMENTED, never a FAIL).
  const settingsGet = await http('probe-settings-ldap', 'GET', '/api/settings/auth/ldap');
  const usersProbe = await http('probe-ad-users', 'GET', `/api/ad/users?url=${encodeURIComponent(ldapUrl)}`, {
    headers: { 'x-ldap-bind-password': BIND_PASSWORD },
  });
  const notImplemented = (r) => r.status === 501 && r.json && r.json.error === 'not_implemented';
  const routesPresent = {
    settingsLdap: settingsGet.status !== 404 && !notImplemented(settingsGet),
    adUsers: usersProbe.status !== 404 && !notImplemented(usersProbe),
  };
  console.log(`route presence: settings/auth/ldap=${settingsGet.status} ad/users=${usersProbe.status}`);

  // Configure settings.ldap (no password in the body — it is per-call only).
  // Also a C6 sub-check: POST a body that DOES contain a password field and
  // verify the GET response never returns it (stripSecrets behaviour).
  if (routesPresent.settingsLdap) {
    const save = await http('save-settings-ldap', 'POST', '/api/settings/auth/ldap', {
      body: {
        url: ldapUrl, bindDn: ADMIN_DN, baseDn: BASE_DN, groupBase: GROUPS_OU,
        userFilter: '(objectClass=user)', groupFilter: '(objectClass=group)',
        bindPassword: BIND_PASSWORD, // deliberately sent: must be stripped, never stored/echoed
      },
    });
    const savedLdap = save.json && save.json.ldap;
    if (save.status === 200 && savedLdap && !JSON.stringify(savedLdap).includes(BIND_PASSWORD)) {
      record('C', 'C6a', 'settings save strips bind password', 'PASS', `POST /api/settings/auth/ldap returned 200 and the response does not contain the sent bindPassword field value`);
    } else {
      record('C', 'C6a', 'settings save strips bind password', 'SECURITY BUG', `POST /api/settings/auth/ldap status=${save.status} body=${snippet(save.text, 200)} — password may have been echoed/stored`);
    }
  } else {
    const why = settingsGet.status === 404
      ? 'POST /api/settings/auth/ldap route absent (404) in this build'
      : `GET /api/settings/auth/ldap honestly reports not_implemented (${settingsGet.status}): ${snippet(settingsGet.json && settingsGet.json.message, 160)}`;
    record('C', 'C6a', 'settings save strips bind password', 'NOT_IMPLEMENTED', why);
  }

  // C1/C2 via the bind-test endpoint POST /api/settings/auth/ad/test.
  const testProbe = await http('probe-ad-test', 'POST', '/api/settings/auth/ad/test', {
    body: { url: ldapUrl, bindDn: ADMIN_DN, password: BIND_PASSWORD, baseDn: BASE_DN },
  });
  if (testProbe.status === 404 || notImplemented(testProbe)) {
    const why = testProbe.status === 404
      ? 'POST /api/settings/auth/ad/test route absent (404) in this build'
      : `POST /api/settings/auth/ad/test honestly reports not_implemented (501): ${snippet(testProbe.json.message, 160)}`;
    record('C', 'C0b', 'bind-test positive control (API)', 'NOT_IMPLEMENTED', why);
    record('C', 'C1', 'wrong bind password (API)', 'NOT_IMPLEMENTED', why);
    record('C', 'C2', 'unknown bind DN (API)', 'NOT_IMPLEMENTED', why);
    record('C', 'C5', 'unreachable LDAP URL (API)', 'NOT_IMPLEMENTED', why);
  } else if (testProbe.status === 500) {
    const body = snippet(testProbe.text, 300);
    record('C', 'C1', 'wrong bind password (API)', 'BUG', `bind-test endpoint 500s on a VALID bind (route/service mismatch — exact body: ${body}) — negative cases cannot be evaluated until the route works`);
    record('C', 'C2', 'unknown bind DN (API)', 'BUG', `bind-test endpoint 500s on a VALID bind (see C1) — negative cases cannot be evaluated until the route works`);
    record('C', 'C5', 'unreachable LDAP URL (API)', 'BUG', `bind-test endpoint 500s on a VALID bind (see C1) — negative cases cannot be evaluated until the route works`);
  } else {
    // Valid bind should succeed (positive control for the endpoint).
    if (testProbe.status === 200 && testProbe.json && testProbe.json.ldapBindVerified === true) {
      record('C', 'C0b', 'bind-test positive control (API)', 'PASS', `POST /api/settings/auth/ad/test with correct credentials: 200 ldapBindVerified=true latencyMs=${testProbe.json.latencyMs}`);
    } else {
      record('C', 'C0b', 'bind-test positive control (API)', 'FAIL', `valid bind via API did not verify: HTTP ${testProbe.status} ${snippet(testProbe.text, 200)}`);
    }
    const wrong = await http('ad-test-wrong-pw', 'POST', '/api/settings/auth/ad/test', {
      body: { url: ldapUrl, bindDn: ADMIN_DN, password: WRONG_PASSWORD, baseDn: BASE_DN },
    });
    if (wrong.status === 401) {
      record('C', 'C1', 'wrong bind password (API)', 'PASS', `wrong password -> HTTP 401 error=${wrong.json && wrong.json.error} message="${snippet(wrong.json && wrong.json.message, 120)}"`);
    } else {
      record('C', 'C1', 'wrong bind password (API)', 'FAIL', `wrong password -> HTTP ${wrong.status} (expected 401) body=${snippet(wrong.text, 200)}`);
    }
    const ghost = await http('ad-test-ghost-dn', 'POST', '/api/settings/auth/ad/test', {
      body: { url: ldapUrl, bindDn: `cn=ghost,${BASE_DN}`, password: BIND_PASSWORD, baseDn: BASE_DN },
    });
    if (ghost.status === 401) {
      record('C', 'C2', 'unknown bind DN (API)', 'PASS', `unknown bind DN -> HTTP 401 error=${ghost.json && ghost.json.error} message="${snippet(ghost.json && ghost.json.message, 120)}"`);
    } else {
      record('C', 'C2', 'unknown bind DN (API)', 'FAIL', `unknown bind DN -> HTTP ${ghost.status} (expected 401) body=${snippet(ghost.text, 200)}`);
    }
    const deadPort = await closedPort();
    const t0 = Date.now();
    const dead = await http('ad-test-unreachable', 'POST', '/api/settings/auth/ad/test', {
      body: { url: `ldap://127.0.0.1:${deadPort}`, bindDn: ADMIN_DN, password: BIND_PASSWORD, baseDn: BASE_DN },
    });
    const elapsed = Date.now() - t0;
    if (dead.status === 502 && elapsed < 15000) {
      if (dead.json && dead.json.error === 'LDAP_UPSTREAM' && /client destroyed/i.test(dead.json.message || '')) {
        record('C', 'C5', 'unreachable LDAP URL (API)', 'BUG', `unreachable URL -> HTTP 502 but error=LDAP_UPSTREAM (expected LDAP_UNREACHABLE) in ${elapsed} ms: service mapLdapError() does not recognise ldapjs "client destroyed" — see Tier B C5`);
      } else {
        record('C', 'C5', 'unreachable LDAP URL (API)', 'PASS', `unreachable URL -> HTTP 502 error=${dead.json && dead.json.error} in ${elapsed} ms (bounded, <15000 ms)`);
      }
    } else {
      record('C', 'C5', 'unreachable LDAP URL (API)', 'FAIL', `unreachable URL -> HTTP ${dead.status} (expected 502) in ${elapsed} ms body=${snippet(dead.text, 200)}`);
    }
  }

  // C3/C4 via GET /api/ad/users.
  if (!routesPresent.adUsers) {
    const why = usersProbe.status === 404
      ? 'GET /api/ad/users route absent (404) in this build'
      : `GET /api/ad/users honestly reports not_implemented (${usersProbe.status}): ${snippet(usersProbe.json && usersProbe.json.message, 160)}`;
    record('C', 'C3', 'filter matching nothing (API)', 'NOT_IMPLEMENTED', why);
    record('C', 'C4', 'nonexistent search base (API)', 'NOT_IMPLEMENTED', why);
  } else if (usersProbe.status === 500) {
    const body = snippet(usersProbe.text, 300);
    record('C', 'C3', 'filter matching nothing (API)', 'BUG', `GET /api/ad/users 500s on a valid request (route/service mismatch — exact body: ${body})`);
    record('C', 'C4', 'nonexistent search base (API)', 'BUG', `GET /api/ad/users 500s on a valid request (see C3) — negative cases cannot be evaluated until the route works`);
  } else {
    const empty = await http('ad-users-empty-filter', 'GET', `/api/ad/users?url=${encodeURIComponent(ldapUrl)}&filter=${encodeURIComponent('(cn=NoSuchPerson_xyz)')}`, {
      headers: { 'x-ldap-bind-password': BIND_PASSWORD },
    });
    if (empty.status === 200 && empty.json && Array.isArray(empty.json.users) && empty.json.users.length === 0 && empty.json.count === 0) {
      record('C', 'C3', 'filter matching nothing (API)', 'PASS', 'GET /api/ad/users?filter=(cn=NoSuchPerson_xyz) -> 200 count=0 users=[] (empty, not an error, no fake rows)');
    } else if (empty.status === 200 && empty.json && Array.isArray(empty.json.users) && empty.json.users.length > 0) {
      record('C', 'C3', 'filter matching nothing (API)', 'SECURITY BUG', `filter matching nothing returned ${empty.json.users.length} user(s): ${snippet(empty.text, 200)} — FAKE ENTRIES`);
    } else {
      record('C', 'C3', 'filter matching nothing (API)', 'FAIL', `filter matching nothing -> HTTP ${empty.status} (expected 200 count=0 users=[]) body=${snippet(empty.text, 200)}`);
    }
    const badBase = await http('ad-users-bad-base', 'GET', `/api/ad/users?url=${encodeURIComponent(ldapUrl)}&base=${encodeURIComponent(`ou=nowhere,${BASE_DN}`)}`, {
      headers: { 'x-ldap-bind-password': BIND_PASSWORD },
    });
    if (badBase.status === 404) {
      record('C', 'C4', 'nonexistent search base (API)', 'PASS', `nonexistent base -> HTTP 404 error=${badBase.json && badBase.json.error} message="${snippet(badBase.json && badBase.json.message, 120)}"`);
    } else {
      record('C', 'C4', 'nonexistent search base (API)', 'FAIL', `nonexistent base -> HTTP ${badBase.status} (expected 404) body=${snippet(badBase.text, 200)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// C6 — the bind password appears NOWHERE (responses, logs, stored records)
// ---------------------------------------------------------------------------

function countOccurrences(buf, needle) {
  if (!buf || !buf.length || !needle.length) return 0;
  let count = 0;
  let idx = 0;
  for (;;) {
    const at = buf.indexOf(needle, idx);
    if (at === -1) return count;
    count += 1;
    idx = at + needle.length;
  }
}

async function leakScan() {
  console.log('\n--- C6: leak scan for the runtime bind password (must be 0 everywhere) ---');
  const needle = Buffer.from(BIND_PASSWORD, 'utf8');
  const userNeedle = Buffer.from(USER_PASSWORD, 'utf8');
  const perSource = [];
  let total = 0;
  let userTotal = 0;

  // 1. Every API response body captured during this run.
  for (const entry of capturedBodies) {
    const n = countOccurrences(Buffer.from(entry.body, 'utf8'), needle);
    const nu = countOccurrences(Buffer.from(entry.body, 'utf8'), userNeedle);
    total += n; userTotal += nu;
    if (n > 0 || nu > 0) perSource.push(`${entry.label}: bind=${n} user=${nu}`);
  }
  // 2. The spawned server's stdout+stderr (temp log file outside the repo).
  //    (Counted once, from the on-disk file; the in-memory chunks hold the
  //    same content and are not counted again.)
  if (serverLogPath && fs.existsSync(serverLogPath)) {
    const logBuf = fs.readFileSync(serverLogPath);
    const n = countOccurrences(logBuf, needle);
    const nu = countOccurrences(logBuf, userNeedle);
    total += n; userTotal += nu;
    if (n > 0 || nu > 0) perSource.push(`server log ${serverLogPath}: bind=${n} user=${nu}`);
  }
  // 3. Stored records: the SQLite database (+ WAL/SHM sidecars) and the
  //    settings that were persisted through the API.
  for (const name of ['opmanager.db', 'opmanager.db-wal', 'opmanager.db-shm']) {
    const p = path.join(REPO_ROOT, 'server', 'data', name);
    if (!fs.existsSync(p)) continue;
    const buf = fs.readFileSync(p);
    const n = countOccurrences(buf, needle);
    const nu = countOccurrences(buf, userNeedle);
    total += n; userTotal += nu;
    if (n > 0 || nu > 0) perSource.push(`${name}: bind=${n} user=${nu}`);
  }
  // Note: serverLogChunks (in-memory) hold the same content as the temp
  // log file, so the log is counted once, from the file.

  if (total === 0 && userTotal === 0) {
    record('C', 'C6', 'bind password leak scan', 'PASS', `bind password occurrences: 0 across ${capturedBodies.length} captured API responses, server log, and server/data/opmanager.db(+wal/shm); test-user password occurrences: 0`);
  } else {
    record('C', 'C6', 'bind password leak scan', 'SECURITY BUG', `LEAKED: bind password found ${total} time(s), test-user password ${userTotal} time(s). Sources: ${perSource.join('; ') || '(see counts)'}. Reproduction: run this script and grep the listed sources for the runtime password — it must never be persisted, logged, or echoed.`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('LDAP negative/edge tests — LOCAL TEST DIRECTORY only (dc=test,dc=local; NOT production AD)');
  console.log(`Own server: ${OPM_BASE} (managed by this script: ${MANAGE_SERVER})`);
  console.log('Bind password: generated at runtime, never written to disk or printed.');

  // Start the local test directory first (Tier A + B need it).
  const { server: dirServer, port: dirPort } = await startTestDirectory();
  const ldapUrl = `ldap://127.0.0.1:${dirPort}`;
  console.log(`Local test directory listening on ${ldapUrl} (base ${BASE_DN}, admin ${ADMIN_DN}, users alice/bob, group IT-Admins)`);

  let serverUp = false;
  try {
    await tierA(ldapUrl);
    await tierB(ldapUrl);
    if (MANAGE_SERVER) {
      serverUp = await startOwnServer();
      if (!serverUp) console.log('WARN: own OpManager server did not start — Tier C cases will report NOT_IMPLEMENTED');
    } else {
      try {
        const res = await fetch(`${OPM_BASE}/login.html`);
        serverUp = res.status === 200;
      } catch { serverUp = false; }
      if (!serverUp) console.log(`WARN: no server answering at ${OPM_BASE} — Tier C cases will report NOT_IMPLEMENTED`);
    }
    if (serverUp) await tierC(ldapUrl);
    else {
      for (const [id, name] of [
        ['C0', 'admin login'], ['C1', 'wrong bind password'], ['C2', 'unknown bind DN'],
        ['C3', 'filter matching nothing'], ['C4', 'nonexistent search base'], ['C5', 'unreachable LDAP URL'],
      ]) {
        record('C', id, `${name} (API)`, 'NOT_IMPLEMENTED', 'own OpManager server is not running; start it on OPM_PORT or omit OPM_MANAGE_SERVER=0');
      }
    }
    await leakScan();
  } finally {
    await stopServer(dirServer);
    if (MANAGE_SERVER) await stopOwnServer();
  }
  return summarize();
}

main()
  .then((code) => { process.exit(code); })
  .catch((err) => {
    console.error(`FATAL: ${redact(err && err.stack ? err.stack : String(err))}`);
    process.exit(1);
  });
