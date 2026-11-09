'use strict';
/**
 * run-proof.js — LDAP proof runner (Phase 4 merge M3: rewritten against
 * the CANONICAL client server/services/ldap.js).
 *
 * The ldap-proof track's own client (server/services/ldapClient.js) was
 * deleted in the merge — it is NOT imported here any more. Every check
 * below calls the canonical client only (testBind, searchUsers,
 * searchGroups, getUserWithGroups, authenticateUser; LdapError carries
 * .status/.code). The local test server (test-ldap-server.js) is
 * unchanged except that its search handler now matches filters against
 * attributes keyed both ways, like the ldap-service proof server: real
 * AD matches attribute names case-insensitively, and the canonical
 * client builds its lookup filters with lower-case attribute names.
 *
 * Proves the real LDAP path as far as reality allows, against a REAL LDAP
 * server speaking the real protocol on the wire:
 *
 *   Mode "local" (default): starts the in-process ldapjs test server on
 *   127.0.0.1:13389 (see test-ldap-server.js; override with
 *   LDAP_TEST_PORT), seeded with clearly labelled
 *   TEST users/groups. All test passwords are generated randomly in
 *   memory for this run only — never written to disk, never logged.
 *
 *   Mode "external": set LDAP_PROOF_URL (+ LDAP_PROOF_BIND_DN,
 *   LDAP_PROOF_BIND_PASSWORD, LDAP_PROOF_BASE_DN) to run the same client
 *   code against a real external directory (e.g. a local slapd). The
 *   bind password comes from the environment at runtime only.
 *
 * Assertions (local mode, 9 checks): service bind OK; user search
 * returns the 4 seeded users with real attributes (opm-svc + 3 test
 * users); group search returns the 3 seeded groups; membership mapping
 * is correct for test.admin and test.user2; wrong-password bind fails
 * with an honest 401 (LDAP 49, LdapError LDAP_INVALID_CREDENTIALS);
 * authenticateUser succeeds with the right password and fails with a
 * wrong one; the connection report (bind + user/group counts) is correct.
 *
 * Writes proof-report.json next to this script (DNs, counts, timings —
 * no passwords) and exits 0 only if every assertion passes.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { startTestServer } = require('./test-ldap-server');
const ldapSvc = require('../../server/services/ldap');

const REPORT_PATH = process.env.LDAP_PROOF_REPORT || path.join(__dirname, 'proof-report.json');

function randomPassword() {
  return `T3st-${crypto.randomBytes(12).toString('base64url')}`;
}

function check(name, ok, detail) {
  return { name, ok: Boolean(ok), detail: detail === undefined ? null : detail };
}

async function runLocalProof() {
  const svcPassword = randomPassword();
  const userPasswords = {
    'test.admin': randomPassword(),
    'test.user1': randomPassword(),
    'test.user2': randomPassword(),
  };
  const srv = await startTestServer({ port: Number(process.env.LDAP_TEST_PORT) || 13389, servicePassword: svcPassword, userPasswords });
  const cfg = {
    url: srv.url,
    bindDn: srv.serviceDn,
    baseDn: srv.suffix,
    groupBase: srv.groupsOu,
    userFilter: '(objectClass=person)',
    groupFilter: '(objectClass=groupOfNames)',
  };
  const results = [];
  try {
    // 1. Service bind (canonical testBind: bind + base-DN check).
    const bind = await ldapSvc.testBind(cfg, svcPassword);
    results.push(check(
      'service bind as cn=opm-svc',
      bind.ok === true && bind.ldapBindVerified === true && bind.entriesFound === 1,
      `bound to ${srv.url}; latencyMs=${bind.latencyMs}; entriesFound=${bind.entriesFound}`,
    ));

    // 2. User search returns real entries.
    const users = await ldapSvc.searchUsers(cfg, svcPassword);
    const logins = users.map((u) => u.sAMAccountName).sort();
    const testLogins = logins.filter((u) => u !== 'opm-svc');
    results.push(check(
      'user search returns real entries incl. 3 seeded test users',
      users.length === 4 && JSON.stringify(testLogins) === JSON.stringify(['test.admin', 'test.user1', 'test.user2']),
      `sAMAccountNames=${logins.join(',')}; test.admin mail=${(users.find((u) => u.sAMAccountName === 'test.admin') || {}).mail}`,
    ));

    // 3. Group search returns real entries.
    const groups = await ldapSvc.searchGroups(cfg, svcPassword);
    const cns = groups.map((g) => g.cn).sort();
    results.push(check(
      'group search returns 3 seeded groups',
      groups.length === 3 && JSON.stringify(cns) === JSON.stringify(['opm-admins', 'opm-operators', 'opm-readonly']),
      `cns=${cns.join(',')}`,
    ));

    // 4. Membership mapping via memberOf + group `member`.
    const adminGroups = await ldapSvc.getUserWithGroups(cfg, svcPassword, 'test.admin');
    results.push(check(
      'membership: test.admin -> opm-admins',
      adminGroups.groupNames.length === 1 && adminGroups.groupNames[0] === 'opm-admins',
      `groups=${adminGroups.groupNames.join(',')}`,
    ));
    const user2Groups = await ldapSvc.getUserWithGroups(cfg, svcPassword, 'test.user2');
    const u2 = [...user2Groups.groupNames].sort();
    results.push(check(
      'membership: test.user2 -> opm-operators + opm-readonly',
      JSON.stringify(u2) === JSON.stringify(['opm-operators', 'opm-readonly']),
      `groups=${u2.join(',')}`,
    ));

    // 5. Wrong-password service bind -> honest 401 (LDAP 49).
    let wrongBindErr = null;
    try {
      await ldapSvc.testBind(cfg, 'definitely-wrong-password');
    } catch (err) {
      wrongBindErr = err;
    }
    results.push(check(
      'wrong-password service bind fails with LDAP 49',
      wrongBindErr && wrongBindErr.name === 'LdapError' && wrongBindErr.status === 401 && wrongBindErr.code === 'LDAP_INVALID_CREDENTIALS',
      wrongBindErr ? `${wrongBindErr.name} status=${wrongBindErr.status} code=${wrongBindErr.code}` : 'bind unexpectedly succeeded',
    ));

    // 6. authenticateUser: correct password.
    const authOk = await ldapSvc.authenticateUser(cfg, svcPassword, 'test.admin', userPasswords['test.admin']);
    results.push(check(
      'authenticateUser test.admin with correct password',
      authOk.authenticated === true && authOk.user.sAMAccountName === 'test.admin' && authOk.groupNames.length === 1 && authOk.groupNames[0] === 'opm-admins',
      `dn=${authOk.user.dn}; groups=${authOk.groupNames.join(',')}`,
    ));

    // 7. authenticateUser: wrong password -> honest 401 (LDAP 49).
    let authErr = null;
    try {
      await ldapSvc.authenticateUser(cfg, svcPassword, 'test.admin', 'wrong-password');
    } catch (err) {
      authErr = err;
    }
    results.push(check(
      'authenticateUser test.admin with wrong password fails LDAP 49',
      authErr && authErr.name === 'LdapError' && authErr.status === 401 && authErr.code === 'LDAP_INVALID_CREDENTIALS',
      authErr ? `${authErr.name} status=${authErr.status} code=${authErr.code}` : 'auth unexpectedly succeeded',
    ));

    // 8. Connection report path (testBind + counts, the canonical
    // equivalent of the deleted ldapClient.testConnection).
    const reportBind = await ldapSvc.testBind(cfg, svcPassword);
    const reportUsers = await ldapSvc.searchUsers(cfg, svcPassword);
    const reportGroups = await ldapSvc.searchGroups(cfg, svcPassword);
    results.push(check(
      'testConnection reports bindOk + counts',
      reportBind.ok === true && reportUsers.length === 4 && reportGroups.length === 3,
      `bindOk=${reportBind.ok} usersFound=${reportUsers.length} groupsFound=${reportGroups.length} latencyMs=${reportBind.latencyMs}`,
    ));
  } finally {
    await srv.stop();
  }
  return { mode: 'local', server: srv.url, suffix: srv.suffix, results };
}

async function runExternalProof() {
  const cfg = {
    url: process.env.LDAP_PROOF_URL,
    bindDn: process.env.LDAP_PROOF_BIND_DN,
    baseDn: process.env.LDAP_PROOF_BASE_DN,
    groupBase: process.env.LDAP_PROOF_GROUP_BASE || process.env.LDAP_PROOF_BASE_DN,
    userFilter: process.env.LDAP_PROOF_USER_FILTER || '(objectClass=person)',
    groupFilter: process.env.LDAP_PROOF_GROUP_FILTER || '(objectClass=groupOfNames)',
  };
  const bindPassword = process.env.LDAP_PROOF_BIND_PASSWORD;
  const report = { url: cfg.url, bindDn: cfg.bindDn, baseDn: cfg.baseDn, bindOk: false, usersFound: 0, groupsFound: 0, latencyMs: null, error: null, errorCode: null };
  const t0 = Date.now();
  try {
    const bind = await ldapSvc.testBind(cfg, bindPassword);
    report.bindOk = true;
    report.latencyMs = bind.latencyMs;
    const users = await ldapSvc.searchUsers(cfg, bindPassword);
    report.usersFound = users.length;
    report.sampleUserDns = users.slice(0, 5).map((u) => u.dn);
    const groups = await ldapSvc.searchGroups(cfg, bindPassword);
    report.groupsFound = groups.length;
    report.sampleGroupDns = groups.slice(0, 5).map((g) => g.dn);
  } catch (err) {
    report.error = err.message;
    report.errorCode = err.code || null;
    report.errorName = err.name || null;
  } finally {
    if (report.latencyMs === null) report.latencyMs = Date.now() - t0;
  }
  const results = [
    check('external testConnection bindOk', report.bindOk === true, report.error || `usersFound=${report.usersFound} groupsFound=${report.groupsFound} latencyMs=${report.latencyMs}`),
    check('external user search returns entries', report.usersFound > 0, `usersFound=${report.usersFound} sample=${(report.sampleUserDns || []).join(',')}`),
    check('external group search returns entries', report.groupsFound > 0, `groupsFound=${report.groupsFound} sample=${(report.sampleGroupDns || []).join(',')}`),
  ];
  // Wrong-password bind must fail honestly with LDAP 49 (401).
  let wrongBindErr = null;
  try {
    await ldapSvc.testBind(cfg, 'definitely-wrong-password');
  } catch (err) {
    wrongBindErr = err;
  }
  results.push(check(
    'external wrong-password bind fails with LDAP 49',
    wrongBindErr && wrongBindErr.name === 'LdapError' && wrongBindErr.status === 401 && wrongBindErr.code === 'LDAP_INVALID_CREDENTIALS',
    wrongBindErr ? `${wrongBindErr.name} status=${wrongBindErr.status} code=${wrongBindErr.code}` : 'bind unexpectedly succeeded',
  ));
  // Optional end-to-end user auth (needs a known test user, runtime env only).
  // The canonical lookup is sAMAccountName/UPN; a uid-based directory can
  // pass its own lookup filter via LDAP_PROOF_USER_FILTER, e.g.
  // '(uid={username})' — {username} is substituted here before the call.
  if (process.env.LDAP_PROOF_TEST_USER && process.env.LDAP_PROOF_TEST_USER_PASSWORD) {
    try {
      const lookupFilter = process.env.LDAP_PROOF_USER_FILTER
        ? process.env.LDAP_PROOF_USER_FILTER.replace('{username}', process.env.LDAP_PROOF_TEST_USER)
        : undefined;
      const auth = await ldapSvc.authenticateUser(
        cfg,
        bindPassword,
        process.env.LDAP_PROOF_TEST_USER,
        process.env.LDAP_PROOF_TEST_USER_PASSWORD,
        lookupFilter ? { filter: lookupFilter } : {},
      );
      results.push(check(
        `external authenticateUser ${process.env.LDAP_PROOF_TEST_USER} with correct password`,
        true,
        `dn=${auth.user.dn}; groups=${auth.groupNames.join(',')}`,
      ));
    } catch (err) {
      results.push(check(`external authenticateUser ${process.env.LDAP_PROOF_TEST_USER}`, false, err.message));
    }
  }
  return { mode: 'external', server: cfg.url, suffix: cfg.baseDn, testConnection: report, results };
}

async function main() {
  const startedAt = new Date().toISOString();
  const external = Boolean(process.env.LDAP_PROOF_URL);
  const outcome = external ? await runExternalProof() : await runLocalProof();
  const passed = outcome.results.filter((r) => r.ok).length;
  const failed = outcome.results.filter((r) => !r.ok);
  const report = {
    track: 'ldap-proof',
    client: 'server/services/ldap.js (canonical, Phase 4 merge M3)',
    generatedAt: startedAt,
    mode: outcome.mode,
    server: outcome.server,
    suffix: outcome.suffix,
    note: outcome.mode === 'local'
      ? 'Local ldapjs test server (real LDAP on the wire). All data is TEST data under dc=opm-test,dc=local; passwords were random per-run values held in memory only and are not in this report.'
      : 'External directory supplied via LDAP_PROOF_URL at runtime. No production AD was contacted by this run unless the operator pointed it there.',
    checks: outcome.results,
    passed,
    failed: failed.length,
    testConnection: outcome.testConnection || undefined,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  for (const r of outcome.results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\n${passed}/${outcome.results.length} checks passed. Report: ${REPORT_PATH}`);
  if (failed.length > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`PROOF RUNNER ERROR: ${err.message}`);
    process.exitCode = 1;
  });
}
