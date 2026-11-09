'use strict';

/**
 * ldap-local-proof.js — Proof for server/services/ldap.js.
 *
 * Stands up a REAL in-process ldapjs LDAP server on 127.0.0.1:21389
 * (real LDAPv3 over TCP, real BER encoding) seeded with test data, then
 * runs the ldap.js client against it and asserts exact values.
 *
 * *** LOCAL TEST DIRECTORY — NOT a production device. ***
 * The directory below is synthetic test data (dc=test,dc=local; users
 * alice/bob/carol; groups IT-Admins/Gravity-Users). It exists only to
 * prove the client speaks real LDAP. It is NOT the GVS Active Directory
 * (DC 192.168.22.5, gamevillage.com.pk) and no result here claims a
 * production bind succeeded.
 *
 * Credentials come from the environment at runtime ONLY and are never
 * written to a file:
 *   LDAP_TEST_BIND_PASSWORD  — password for cn=admin,dc=test,dc=local
 *   LDAP_TEST_USER_PASSWORD  — password for the three test users
 * Usage:
 *   LDAP_TEST_BIND_PASSWORD='...' LDAP_TEST_USER_PASSWORD='...' \
 *     node scripts/ldap-local-proof.js
 * Exit 0 = every check passed; exit 1 = a check failed (message printed).
 */

const ldap = require('ldapjs');
const {
  LdapError,
  normalizeConfig,
  testBind,
  searchUsers,
  searchGroups,
  getUserWithGroups,
  getUsersWithGroups,
  authenticateUser,
} = require('../server/services/ldap');

const HOST = '127.0.0.1';
const PORT = 21389;
const BASE = 'dc=test,dc=local';
const ADMIN_DN = 'cn=admin,dc=test,dc=local';

const BIND_PASSWORD = process.env.LDAP_TEST_BIND_PASSWORD;
const USER_PASSWORD = process.env.LDAP_TEST_USER_PASSWORD;
if (!BIND_PASSWORD || !USER_PASSWORD) {
  console.error('FAIL: set LDAP_TEST_BIND_PASSWORD and LDAP_TEST_USER_PASSWORD in the environment (runtime only, never in a file).');
  process.exit(1);
}

const norm = (dn) => String(dn || '').trim().toLowerCase();

// --- Test directory ---------------------------------------------------------

const ENTRIES = [
  {
    dn: 'dc=test,dc=local',
    attrs: { objectClass: ['domain', 'top'], dc: ['test'] },
  },
  {
    dn: 'ou=users,dc=test,dc=local',
    attrs: { objectClass: ['organizationalunit', 'top'], ou: ['users'] },
  },
  {
    dn: 'ou=groups,dc=test,dc=local',
    attrs: { objectClass: ['organizationalunit', 'top'], ou: ['groups'] },
  },
  {
    dn: 'cn=Alice Anderson,ou=users,dc=test,dc=local',
    attrs: {
      objectClass: ['user', 'person', 'top'],
      cn: ['Alice Anderson'],
      displayName: ['Alice Anderson'],
      sAMAccountName: ['alice'],
      userPrincipalName: ['alice@test.local'],
      mail: ['alice@test.local'],
      distinguishedName: ['cn=Alice Anderson,ou=users,dc=test,dc=local'],
      memberOf: ['cn=IT-Admins,ou=groups,dc=test,dc=local'],
      userAccountControl: ['512'],
      primaryGroupID: ['513'],
    },
  },
  {
    dn: 'cn=Bob Baker,ou=users,dc=test,dc=local',
    attrs: {
      objectClass: ['user', 'person', 'top'],
      cn: ['Bob Baker'],
      displayName: ['Bob Baker'],
      sAMAccountName: ['bob'],
      userPrincipalName: ['bob@test.local'],
      mail: ['bob@test.local'],
      distinguishedName: ['cn=Bob Baker,ou=users,dc=test,dc=local'],
      userAccountControl: ['512'],
      primaryGroupID: ['513'],
    },
  },
  {
    dn: 'cn=Carol Chen,ou=users,dc=test,dc=local',
    attrs: {
      objectClass: ['user', 'person', 'top'],
      cn: ['Carol Chen'],
      displayName: ['Carol Chen'],
      sAMAccountName: ['carol'],
      userPrincipalName: ['carol@test.local'],
      distinguishedName: ['cn=Carol Chen,ou=users,dc=test,dc=local'],
      userAccountControl: ['514'],
      primaryGroupID: ['513'],
    },
  },
  {
    dn: 'cn=IT-Admins,ou=groups,dc=test,dc=local',
    attrs: {
      objectClass: ['group', 'top'],
      cn: ['IT-Admins'],
      name: ['IT-Admins'],
      distinguishedName: ['cn=IT-Admins,ou=groups,dc=test,dc=local'],
      member: ['cn=Alice Anderson,ou=users,dc=test,dc=local'],
      primaryGroupToken: ['1111'],
    },
  },
  {
    dn: 'cn=Gravity-Users,ou=groups,dc=test,dc=local',
    attrs: {
      objectClass: ['group', 'top'],
      cn: ['Gravity-Users'],
      name: ['Gravity-Users'],
      distinguishedName: ['cn=Gravity-Users,ou=groups,dc=test,dc=local'],
      member: ['cn=Bob Baker,ou=users,dc=test,dc=local'],
      primaryGroupToken: ['1112'],
    },
  },
];

const CREDENTIALS = new Map([
  [norm(ADMIN_DN), BIND_PASSWORD],
  [norm('cn=Alice Anderson,ou=users,dc=test,dc=local'), USER_PASSWORD],
  [norm('cn=Bob Baker,ou=users,dc=test,dc=local'), USER_PASSWORD],
  [norm('cn=Carol Chen,ou=users,dc=test,dc=local'), USER_PASSWORD],
]);

function startTestServer() {
  const server = ldap.createServer();

  server.bind(BASE, (req, res, next) => {
    const dn = norm(req.dn.toString());
    const expected = CREDENTIALS.get(dn);
    if (!expected || req.credentials !== expected) {
      return next(new ldap.InvalidCredentialsError());
    }
    res.end();
    return next();
  });

  server.search(BASE, (req, res, next) => {
    const baseDn = norm(req.dn.toString());
    const baseExists = ENTRIES.some((e) => norm(e.dn) === baseDn);
    if (!baseExists) {
      return next(new ldap.NoSuchObjectError(req.dn.toString()));
    }
    const scope = req.scope; // 'base' | 'one' | 'sub'
    for (const entry of ENTRIES) {
      const dn = norm(entry.dn);
      let inScope = false;
      if (scope === 'base') inScope = dn === baseDn;
      else if (scope === 'one') inScope = dn.endsWith(`,${baseDn}`) && !dn.slice(0, dn.length - baseDn.length - 1).includes(',');
      else inScope = dn === baseDn || dn.endsWith(`,${baseDn}`);
      if (!inScope) continue;
      // Filter matching is done against a copy keyed BOTH ways (original
      // AD casing and lower-case): ldapjs filter matching is
      // case-sensitive on the attribute-object keys in nested (&)/(|)
      // filters, while real AD matches attribute names case-insensitively.
      // Supplying both casings makes this test server behave like AD.
      const matchAttrs = {};
      for (const [k, v] of Object.entries(entry.attrs)) {
        matchAttrs[k] = v;
        matchAttrs[k.toLowerCase()] = v;
      }
      if (req.filter && !req.filter.matches(matchAttrs)) continue;
      // Send a real SearchEntry instance: ldapjs 3's server-side
      // SearchResponse.send() filters plain-object entries against the
      // requested attribute list by comparing the LOWER-CASED stored name
      // to the list verbatim, so mixed-case AD names (sAMAccountName,
      // userPrincipalName, ...) would otherwise be dropped. A real AD
      // server matches attribute names case-insensitively. Passing a
      // SearchEntry instance takes the instanceof branch in send(), which
      // skips that filtering — so this test server behaves like a real
      // directory and returns every attribute it holds.
      res.send(new ldap.SearchEntry({
        messageId: res.messageId,
        objectName: entry.dn,
        attributes: Object.entries(entry.attrs).map(([type, values]) => ({ type, values })),
      }));
    }
    res.end();
    return next();
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, HOST, (err) => (err ? reject(err) : resolve(server)));
  });
}

// --- Checks -----------------------------------------------------------------

let passed = 0;
function check(name, condition, detail) {
  if (!condition) {
    throw new Error(`FAIL ${name}: ${detail}`);
  }
  passed += 1;
  console.log(`PASS ${name}: ${detail}`);
}

async function expectLdapError(name, status, fn, detail) {
  try {
    await fn();
  } catch (err) {
    check(name, err instanceof LdapError && err.status === status, `${detail} (got status=${err && err.status}, code=${err && err.code})`);
    return;
  }
  throw new Error(`FAIL ${name}: expected LdapError ${status}, call succeeded`);
}

async function main() {
  console.log('LDAP local proof — LOCAL TEST DIRECTORY dc=test,dc=local on 127.0.0.1:21389 (not production AD)');
  const server = await startTestServer();
  try {
    const config = {
      url: `ldap://${HOST}:${PORT}`,
      bindDn: ADMIN_DN,
      baseDn: BASE,
      groupBase: `ou=groups,${BASE}`,
      userFilter: '(objectClass=user)',
      groupFilter: '(objectClass=group)',
    };

    // 1. Bind + base-DN verification.
    const bind = await testBind(config, BIND_PASSWORD);
    check('1 testBind', bind.ok === true && typeof bind.latencyMs === 'number' && bind.baseDn === BASE,
      `ok=true latencyMs=${bind.latencyMs} url=${bind.url} bindDn=${bind.bindDn}`);

    // 2. User search — exact users, enabled flags from userAccountControl.
    const users = await searchUsers(config, BIND_PASSWORD);
    const logins = users.map((u) => u.sAMAccountName).sort();
    check('2 searchUsers', users.length === 3 && logins.join(',') === 'alice,bob,carol',
      `3 users: ${logins.join(', ')}`);
    const alice = users.find((u) => u.sAMAccountName === 'alice');
    const carol = users.find((u) => u.sAMAccountName === 'carol');
    check('2a enabled flags', alice.enabled === true && carol.enabled === false,
      `alice enabled=true (UAC 512), carol enabled=false (UAC 514, disabled)`);

    // 3. Group search — exact groups, member DNs, counts.
    const groups = await searchGroups(config, BIND_PASSWORD);
    const groupNames = groups.map((g) => g.name).sort();
    check('3 searchGroups', groups.length === 2 && groupNames.join(',') === 'Gravity-Users,IT-Admins',
      `2 groups: ${groupNames.join(', ')}`);
    const itAdmins = groups.find((g) => g.name === 'IT-Admins');
    check('3a group members', itAdmins.memberCount === 1 && itAdmins.members[0] === 'cn=Alice Anderson,ou=users,dc=test,dc=local',
      `IT-Admins memberCount=1 member=${itAdmins.members[0]}`);

    // 4. Membership mapping — BOTH directions.
    const aliceGroups = await getUserWithGroups(config, BIND_PASSWORD, 'alice');
    check('4a alice groups (memberOf)', aliceGroups.groupNames.join(',') === 'IT-Admins',
      `alice -> [${aliceGroups.groupNames.join(', ')}] via memberOf`);
    const bobGroups = await getUserWithGroups(config, BIND_PASSWORD, 'bob');
    check('4b bob groups (group member list)', bobGroups.groupNames.join(',') === 'Gravity-Users',
      `bob -> [${bobGroups.groupNames.join(', ')}] via group member list (no memberOf on bob)`);
    const carolGroups = await getUserWithGroups(config, BIND_PASSWORD, 'carol');
    check('4c carol groups (none)', carolGroups.groupNames.length === 0,
      `carol -> [] (no memberships)`);
    await expectLdapError('4d unknown user', 404,
      () => getUserWithGroups(config, BIND_PASSWORD, 'nobody'),
      'getUserWithGroups("nobody") -> 404');

    // 5. Full map.
    const all = await getUsersWithGroups(config, BIND_PASSWORD);
    const counts = all.users.map((u) => `${u.sAMAccountName}:${u.groupNames.length}`).sort().join(' ');
    check('5 getUsersWithGroups', all.users.length === 3 && all.groups.length === 2 && counts === 'alice:1 bob:1 carol:0',
      `users=${all.users.length} groups=${all.groups.length} memberships ${counts}`);

    // 6. Authenticate as a real user (bind-as-user), good + bad password.
    const auth = await authenticateUser(config, BIND_PASSWORD, 'alice', USER_PASSWORD);
    check('6a authenticateUser ok', auth.authenticated === true && auth.groupNames.join(',') === 'IT-Admins',
      `alice authenticated=true groups=[${auth.groupNames.join(', ')}]`);
    await expectLdapError('6b authenticateUser wrong password', 401,
      () => authenticateUser(config, BIND_PASSWORD, 'alice', 'definitely-wrong'),
      'alice + wrong password -> 401');

    // 7. Honest errors.
    await expectLdapError('7a bad service password', 401,
      () => testBind(config, 'definitely-wrong'),
      'testBind wrong password -> 401');
    await expectLdapError('7b missing base DN', 404,
      () => searchUsers(config, BIND_PASSWORD, { baseDn: 'ou=missing,dc=test,dc=local' }),
      'search under ou=missing,dc=test,dc=local -> 404');
    await expectLdapError('7c unreachable server', 502,
      () => testBind({ ...config, url: `ldap://${HOST}:1399` }, BIND_PASSWORD),
      'testBind to closed port 1399 -> 502');

    // 8. Legacy auth.ad config shape maps to the canonical URL.
    const legacy = normalizeConfig({
      domainController: HOST, port: PORT, bindUser: ADMIN_DN, baseDn: BASE,
    });
    check('8 legacy config', legacy.url === `ldap://${HOST}:${PORT}` && legacy.bindDn === ADMIN_DN,
      `domainController+port -> url=${legacy.url}`);

    console.log(`\nALL ${passed} CHECKS PASSED (local test directory only; no production AD touched).`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
