'use strict';
/**
 * test-ldap-server.js — LOCAL TEST LDAP SERVER for the ldap-proof track.
 *
 * This is a real LDAP server on the wire (ldapjs, RFC 4511): clients
 * connect over TCP, perform real BIND and SEARCH operations, and get real
 * LDAP result codes (including 49 Invalid Credentials on a wrong
 * password). It is NOT a stub returning canned answers — the search
 * handler evaluates the client's parsed LDAP filter against the stored
 * entries, and the bind handler checks the password.
 *
 * TEST DATA ONLY. Every entry is labelled test data, lives only in
 * memory, and vanishes when the process exits. The suffix
 * dc=opm-test,dc=local is fictional and must never be confused with a
 * production directory. Passwords are supplied by the caller at runtime
 * (the proof runner generates random ones in memory); they are never
 * written to a file and never logged.
 */

const ldap = require('ldapjs');

const SUFFIX = 'dc=opm-test,dc=local';
const USERS_OU = `ou=users,${SUFFIX}`;
const GROUPS_OU = `ou=groups,${SUFFIX}`;

/** Seed definitions — passwords are injected by the caller, never defaults. */
function buildSeed({ servicePassword, userPasswords }) {
  const users = [
    {
      dn: `cn=opm-svc,${USERS_OU}`,
      password: servicePassword,
      attributes: {
        objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'user'],
        cn: 'opm-svc',
        uid: 'opm-svc',
        sAMAccountName: 'opm-svc',
        sn: 'Service',
        givenName: 'OpManager Test',
        mail: 'opm-svc@opm-test.local',
        description: 'TEST DATA — local ldap-proof service account, not production',
        userAccountControl: '512',
      },
    },
    {
      dn: `cn=test.admin,${USERS_OU}`,
      password: userPasswords['test.admin'],
      attributes: {
        objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'user'],
        cn: 'test.admin',
        uid: 'test.admin',
        sAMAccountName: 'test.admin',
        sn: 'Admin',
        givenName: 'Test',
        mail: 'test.admin@opm-test.local',
        description: 'TEST DATA — local ldap-proof user, not production',
        userAccountControl: '512',
        memberOf: [`cn=opm-admins,${GROUPS_OU}`],
      },
    },
    {
      dn: `cn=test.user1,${USERS_OU}`,
      password: userPasswords['test.user1'],
      attributes: {
        objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'user'],
        cn: 'test.user1',
        uid: 'test.user1',
        sAMAccountName: 'test.user1',
        sn: 'User One',
        givenName: 'Test',
        mail: 'test.user1@opm-test.local',
        description: 'TEST DATA — local ldap-proof user, not production',
        userAccountControl: '512',
        memberOf: [`cn=opm-operators,${GROUPS_OU}`],
      },
    },
    {
      dn: `cn=test.user2,${USERS_OU}`,
      password: userPasswords['test.user2'],
      attributes: {
        objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'user'],
        cn: 'test.user2',
        uid: 'test.user2',
        sAMAccountName: 'test.user2',
        sn: 'User Two',
        givenName: 'Test',
        mail: 'test.user2@opm-test.local',
        description: 'TEST DATA — local ldap-proof user, not production',
        userAccountControl: '512',
        memberOf: [`cn=opm-operators,${GROUPS_OU}`, `cn=opm-readonly,${GROUPS_OU}`],
      },
    },
  ];

  const groups = [
    {
      dn: `cn=opm-admins,${GROUPS_OU}`,
      attributes: {
        objectClass: ['top', 'groupOfNames', 'group'],
        cn: 'opm-admins',
        description: 'TEST DATA — local ldap-proof group, not production',
        member: [`cn=test.admin,${USERS_OU}`],
      },
    },
    {
      dn: `cn=opm-operators,${GROUPS_OU}`,
      attributes: {
        objectClass: ['top', 'groupOfNames', 'group'],
        cn: 'opm-operators',
        description: 'TEST DATA — local ldap-proof group, not production',
        member: [`cn=test.user1,${USERS_OU}`, `cn=test.user2,${USERS_OU}`],
      },
    },
    {
      dn: `cn=opm-readonly,${GROUPS_OU}`,
      attributes: {
        objectClass: ['top', 'groupOfNames', 'group'],
        cn: 'opm-readonly',
        description: 'TEST DATA — local ldap-proof group, not production',
        member: [`cn=test.user2,${USERS_OU}`],
      },
    },
  ];

  const containers = [
    { dn: SUFFIX, attributes: { objectClass: ['top', 'domain'], dc: 'opm-test' } },
    { dn: USERS_OU, attributes: { objectClass: ['top', 'organizationalUnit'], ou: 'users' } },
    { dn: GROUPS_OU, attributes: { objectClass: ['top', 'organizationalUnit'], ou: 'groups' } },
  ];

  return { users, groups, containers };
}

function dnEquals(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

function dnIsUnder(dn, base) {
  const d = String(dn).toLowerCase();
  const b = String(base).toLowerCase();
  return d === b || d.endsWith(`,${b}`);
}

/**
 * Start the test server. Passwords come from the caller (runtime only).
 * @returns {Promise<{server, url, suffix, usersOu, groupsOu, stop}>}
 */
async function startTestServer({ port = 13389, host = '127.0.0.1', servicePassword, userPasswords }) {
  if (!servicePassword || !userPasswords) {
    throw new TypeError('startTestServer: servicePassword and userPasswords are required (runtime only, never persisted)');
  }
  const seed = buildSeed({ servicePassword, userPasswords });
  const byDn = new Map();
  for (const e of [...seed.containers, ...seed.users, ...seed.groups]) {
    byDn.set(e.dn.toLowerCase(), e);
  }

  const server = ldap.createServer();

  // Real BIND: DN must exist and the password must match, else LDAP 49.
  server.bind('', (req, res, next) => {
    const dn = req.dn.toString();
    if (!dn) return next(new ldap.InvalidCredentialsError('Anonymous bind not allowed on this test server'));
    const entry = byDn.get(dn.toLowerCase());
    if (!entry || !entry.password || entry.password !== req.credentials) {
      return next(new ldap.InvalidCredentialsError());
    }
    res.end();
    return next();
  });

  // Real SEARCH: the client's parsed filter is evaluated per entry.
  server.search(SUFFIX, (req, res, next) => {
    const base = req.dn.toString();
    // ldapjs 3.x exposes scope as a NUMBER (0 = base, 1 = one, 2 = sub),
    // not the 'base'/'one'/'sub' strings of ldapjs 2.x.
    const scope = req.scope === 0 || req.scope === 'base' ? 'base' : (req.scope === 1 || req.scope === 'one' ? 'one' : 'sub');
    for (const entry of byDn.values()) {
      if (!dnIsUnder(entry.dn, base)) continue;
      if (scope === 'base' && !dnEquals(entry.dn, base)) continue;
      if (scope === 'one') {
        const parent = entry.dn.split(',').slice(1).join(',');
        if (!dnEquals(parent, base) || dnEquals(entry.dn, base)) continue;
      }
      // Filter matching is done against a copy keyed BOTH ways (original
      // AD casing and lower-case): ldapjs filter matching is
      // case-sensitive on the attribute-object keys in nested (&)/(|)
      // filters (only objectClass is matched case-insensitively), while
      // real AD matches attribute names case-insensitively. Supplying
      // both casings makes this test server behave like AD. (Same
      // approach as the ldap-service proof server.)
      const attrs = {};
      for (const [k, v] of Object.entries(entry.attributes || {})) {
        attrs[k] = v;
        attrs[k.toLowerCase()] = v;
      }
      attrs.dn = entry.dn;
      if (req.filter && !req.filter.matches(attrs)) continue;
      const out = { dn: entry.dn, attributes: {} };
      const wanted = req.attributes && req.attributes.length > 0 ? req.attributes : null;
      for (const [k, v] of Object.entries(entry.attributes || {})) {
        if (wanted && !wanted.includes('*') && !wanted.some((w) => w.toLowerCase() === k.toLowerCase())) continue;
        out.attributes[k] = v;
      }
      // Send a real SearchEntry instance: ldapjs 3's server-side
      // SearchResponse.send() filters plain-object entries against the
      // requested attribute list by comparing the LOWER-CASED stored name
      // to the list verbatim, so mixed-case AD names (sAMAccountName,
      // userPrincipalName, ...) would otherwise be dropped. A real AD
      // server matches attribute names case-insensitively. Passing a
      // SearchEntry instance takes the instanceof branch in send(), which
      // skips that filtering — so this test server behaves like a real
      // directory and returns every attribute it holds. (Same approach
      // as the ldap-service proof server.)
      res.send(new ldap.SearchEntry({
        messageId: res.messageId,
        objectName: out.dn,
        attributes: Object.entries(out.attributes).map(([type, values]) => ({
          type,
          values: Array.isArray(values) ? values : [values],
        })),
      }));
    }
    res.end();
    return next();
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return {
    server,
    url: `ldap://${host}:${port}`,
    suffix: SUFFIX,
    usersOu: USERS_OU,
    groupsOu: GROUPS_OU,
    serviceDn: `cn=opm-svc,${USERS_OU}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { startTestServer, SUFFIX, USERS_OU, GROUPS_OU };
