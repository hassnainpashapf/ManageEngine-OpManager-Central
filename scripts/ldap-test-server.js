'use strict';
/**
 * LOCAL TEST DIRECTORY ONLY — not a production device, not Active
 * Directory. An in-process LDAP server (ldapjs) that speaks the real
 * LDAP wire protocol on 127.0.0.1, seeded with fixed test entries, so
 * the /api/settings/auth/ad/test, /api/ad/users and /api/ad/groups
 * routes can be proven live without a real AD domain controller.
 *
 * Usage (from the repo root):
 *   LDAP_TEST_BIND_PASSWORD='<secret>' node scripts/ldap-test-server.js
 *
 * The bind password comes ONLY from LDAP_TEST_BIND_PASSWORD (required);
 * there is no default and it is never written anywhere. Listens on
 * 127.0.0.1:LDAP_TEST_PORT (default 1389). Stop with Ctrl-C.
 *
 * Seed directory (base dc=example,dc=com):
 *   cn=admin,dc=example,dc=com            (bind account)
 *   ou=users,dc=example,dc=com
 *     cn=alice,ou=users,...  (sAMAccountName alice, mail alice@example.com)
 *     cn=bob,ou=users,...    (sAMAccountName bob,   mail bob@example.com)
 *     cn=carol,ou=users,...  (sAMAccountName carol, mail carol@example.com)
 *   ou=groups,dc=example,dc=com
 *     cn=admins,ou=groups,...     (member: alice, bob)
 *     cn=developers,ou=groups,... (member: carol)
 */
const ldap = require('ldapjs');

const PORT = Number(process.env.LDAP_TEST_PORT) || 1389;
const HOST = '127.0.0.1';
const BASE_DN = 'dc=example,dc=com';
const ADMIN_DN = 'cn=admin,dc=example,dc=com';
const BIND_PASSWORD = process.env.LDAP_TEST_BIND_PASSWORD;

if (!BIND_PASSWORD) {
  console.error('LDAP_TEST_BIND_PASSWORD is required (no default). Refusing to start.');
  process.exit(1);
}

const ENTRIES = [
  {
    dn: 'cn=alice,ou=users,dc=example,dc=com',
    attributes: {
      objectclass: ['top', 'person', 'organizationalPerson', 'user'],
      cn: 'alice',
      samaccountname: 'alice',
      displayname: 'Alice Example',
      mail: 'alice@example.com',
      userprincipalname: 'alice@example.com',
      distinguishedname: 'cn=alice,ou=users,dc=example,dc=com',
      memberof: ['cn=admins,ou=groups,dc=example,dc=com'],
    },
  },
  {
    dn: 'cn=bob,ou=users,dc=example,dc=com',
    attributes: {
      objectclass: ['top', 'person', 'organizationalPerson', 'user'],
      cn: 'bob',
      samaccountname: 'bob',
      displayname: 'Bob Example',
      mail: 'bob@example.com',
      userprincipalname: 'bob@example.com',
      distinguishedname: 'cn=bob,ou=users,dc=example,dc=com',
      memberof: ['cn=admins,ou=groups,dc=example,dc=com'],
    },
  },
  {
    dn: 'cn=carol,ou=users,dc=example,dc=com',
    attributes: {
      objectclass: ['top', 'person', 'organizationalPerson', 'user'],
      cn: 'carol',
      samaccountname: 'carol',
      displayname: 'Carol Example',
      mail: 'carol@example.com',
      userprincipalname: 'carol@example.com',
      distinguishedname: 'cn=carol,ou=users,dc=example,dc=com',
      memberof: ['cn=developers,ou=groups,dc=example,dc=com'],
    },
  },
  {
    dn: 'cn=admins,ou=groups,dc=example,dc=com',
    attributes: {
      objectclass: ['top', 'group'],
      cn: 'admins',
      samaccountname: 'admins',
      description: 'Directory administrators (test group)',
      distinguishedname: 'cn=admins,ou=groups,dc=example,dc=com',
      member: ['cn=alice,ou=users,dc=example,dc=com', 'cn=bob,ou=users,dc=example,dc=com'],
    },
  },
  {
    dn: 'cn=developers,ou=groups,dc=example,dc=com',
    attributes: {
      objectclass: ['top', 'group'],
      cn: 'developers',
      samaccountname: 'developers',
      description: 'Developers (test group)',
      distinguishedname: 'cn=developers,ou=groups,dc=example,dc=com',
      member: ['cn=carol,ou=users,dc=example,dc=com'],
    },
  },
];

function dnIsInScope(entryDn, baseDn, scope) {
  const e = entryDn.toLowerCase();
  const b = baseDn.toLowerCase();
  if (scope === 'base') return e === b;
  if (scope === 'one') {
    if (!e.endsWith(`,${b}`)) return false;
    return e.slice(0, e.length - b.length - 1).indexOf(',') === -1;
  }
  // sub (default): entry is the base itself or below it
  return e === b || e.endsWith(`,${b}`);
}

const server = ldap.createServer();

server.bind(BASE_DN, (req, res, next) => {
  if (req.dn.toString().toLowerCase() !== ADMIN_DN || req.credentials !== BIND_PASSWORD) {
    return next(new ldap.InvalidCredentialsError());
  }
  res.end();
  return next();
});

server.search(BASE_DN, (req, res, next) => {
  const baseDn = req.baseObject.toString();
  // ldapjs 3.x exposes scope as a NUMBER (0 = base, 1 = one, 2 = sub),
  // not the 'base'/'one'/'sub' strings of ldapjs 2.x.
  const scopeNum = Number(req.scope);
  const scope = scopeNum === 0 ? 'base' : scopeNum === 1 ? 'one' : 'sub';
  // Send real SearchEntry instances: ldapjs 3's server-side
  // SearchResponse.send() filters plain-object entries against the
  // requested attribute list by comparing the LOWER-CASED stored name to
  // the list verbatim, so mixed-case AD names (sAMAccountName, ...) in
  // the canonical client's request would otherwise be dropped. A real AD
  // server matches attribute names case-insensitively; a SearchEntry
  // takes the unfiltered branch in send(). (Same approach as the
  // ldap-service proof server.)
  const sendEntry = (dn, attributes) => {
    res.send(new ldap.SearchEntry({
      messageId: res.messageId,
      objectName: dn,
      attributes: Object.entries(attributes).map(([type, values]) => ({
        type,
        values: Array.isArray(values) ? values : [values],
      })),
    }));
  };
  let sent = 0;
  for (const entry of ENTRIES) {
    if (!dnIsInScope(entry.dn, baseDn, scope)) continue;
    if (scope === 'base' && entry.dn.toLowerCase() !== baseDn.toLowerCase()) continue;
    // The base object itself has no seed entry; answer a base-scope
    // search on the base DN with the directory root entry.
    // Filter matching is done against a copy keyed BOTH ways (stored
    // lower-case keys plus AD casing): ldapjs filter matching is
    // case-sensitive on the attribute-object keys, while real AD matches
    // attribute names case-insensitively. (MERGE M3: same approach as
    // the ldap-service proof server.)
    const matchAttrs = {};
    for (const [k, v] of Object.entries(entry.attributes)) {
      matchAttrs[k] = v;
      matchAttrs[k.toLowerCase()] = v;
      const adCased = { samaccountname: 'sAMAccountName', userprincipalname: 'userPrincipalName', displayname: 'displayName', distinguishedname: 'distinguishedName', memberof: 'memberOf', useraccountcontrol: 'userAccountControl', primarygroupid: 'primaryGroupID', objectclass: 'objectClass' }[k.toLowerCase()];
      if (adCased) matchAttrs[adCased] = v;
    }
    if (!req.filter.matches(matchAttrs)) continue;
    sendEntry(entry.dn, entry.attributes);
    sent += 1;
  }
  if (scope === 'base' && baseDn.toLowerCase() === BASE_DN.toLowerCase() && sent === 0) {
    sendEntry(BASE_DN, {
      objectclass: ['top'],
      namingContexts: [BASE_DN],
      supportedLDAPVersion: ['3'],
      vendorName: ['ldap-test-server (local test directory only)'],
    });
  }
  res.end();
  return next();
});

server.listen(PORT, HOST, () => {
  console.log(`Local test LDAP directory listening on ldap://${HOST}:${PORT} (base ${BASE_DN}, ${ENTRIES.length} seed entries)`);
});
