# LDAP / Active Directory — setup for OpManager Central (Phase 4 merge M3)

## What exists

`server/services/ldap.js` — the CANONICAL real, read-only LDAPv3 client
built on `ldapjs@3.0.7` (Phase 4 merge of the ldap-service client with
the ldap-routes additions ported onto it: `q` free-text search,
`resolveLdapConfig`, `rootEntry` in the test result; the ldap-proof
`ldapClient.js` fork was deleted and its proof runner rewritten against
this client). It only ever issues **bind + search**. It never adds,
modifies, deletes, or moves directory objects and never changes a password.

Public API (all take the bind password at call time; it is never stored):

| Function | What it does |
|---|---|
| `testBind(config, password)` | Service-account bind + base-DN existence check. Returns `{ ok, latencyMs, url, host, port, tls, bindDn, baseDn, reachable, ldapBindVerified, entriesFound, rootEntry }`. |
| `searchUsers(config, password, opts)` | Users under `baseDn` with `userFilter`. `opts.q` is a free-text substring (cn / sAMAccountName / displayName / mail / userPrincipalName); `opts.filter` is a raw filter AND-combined with the configured filter. Returns mapped users (DN, cn, displayName, sAMAccountName, userPrincipalName, mail, memberOf, enabled from userAccountControl, primaryGroupID). |
| `searchGroups(config, password, opts)` | Groups under `groupBase` with `groupFilter`. `opts.q` matches cn / sAMAccountName / description; `opts.filter` AND-combines. Returns mapped groups (DN, cn, name, sAMAccountName, description, member DNs, memberCount, memberOf). |
| `getUserWithGroups(config, password, username, opts?)` | One user + all their groups (memberOf **and** reverse group-`member` lookup). 404 if the user does not exist. `opts.filter` overrides the built sAMAccountName/UPN lookup filter. |
| `getUsersWithGroups(config, password)` | All users + all groups + full membership map. |
| `authenticateUser(config, servicePassword, username, userPassword, opts?)` | AD login check: service bind → find user → bind **as the user** → service bind again → groups. 401 on a wrong user password, 404 if the user does not exist. `opts.filter` overrides the built lookup filter. |
| `normalizeConfig(input)` | Accepts the canonical `settings.ldap` shape **or** the legacy `auth.ad` shape (domainController/host, port, ssl, bindUser, baseDn) and returns the canonical shape. |
| `resolveLdapConfig({ storedLdap, storedAd, body })` | Effective config from stored `settings.ldap` + legacy `auth.ad` + call-time body (body wins). Password from body/env only, never stored. Returns `{ url: null, ... }` (not a throw) when nothing is configured, so routes can answer 501. |
| `buildUserFilter(config, { q, filter })` / `buildGroupFilter(config, { q, filter })` | The effective search filters the list calls use (also used by the `/api/ad/*` routes to report the filter). A raw `filter` is validated with `ldap.parseFilter` (400 on a bad filter). |
| `parseLdapUrl(url)` | Parse + validate an `ldap://`/`ldaps://` URL into `{ url, host, port, tls }`. Throws 400 on a malformed URL. |
| `LdapError` | Error class with HTTP-style `status`: **400** config, **401** bad credentials (LDAP 49), **404** no such object (LDAP 32), **502** unreachable / upstream directory failure. Routes should map `err.status` straight to HTTP. `reachable` says whether the directory was reached. |

## Exact settings the user must configure (GVS Active Directory)

The production directory is the GVS domain controller already on record
(DC01, `gamevillage.com.pk`). These are the values to enter in the AD
settings page (the ldap-routes track wires these into the API):

| Setting (canonical `settings.ldap`) | Value |
|---|---|
| `url` | `ldap://192.168.22.5:389` (plain LDAP; the DC answers on 389. Use `ldaps://192.168.22.5:636` only if LDAPS is confirmed enabled on the DC — it was **not** verified) |
| `bindDn` | DN of a dedicated **read-only service account**, e.g. `CN=opmanager-svc,OU=Service Accounts,DC=gamevillage,DC=com,DC=pk` — **create this account first; do not use `GAMEVILLAGE\Administrator`** (a domain-admin bind for monitoring violates least privilege, and its password is already treated as exposed) |
| `bindPassword` | The service account's password — supplied **at runtime only** (env var / prompt). It is **never stored** in settings, the database, a file, or a log. There is no password field in `settings.ldap`. |
| `baseDn` | `DC=gamevillage,DC=com,DC=pk` |
| `groupBase` | `DC=gamevillage,DC=com,DC=pk` (same as baseDn unless groups live in a dedicated OU) |
| `userFilter` | `(objectClass=user)` (or AD-style `(&(objectClass=user)(objectCategory=person))`) |
| `groupFilter` | `(objectClass=group)` |

What the service account needs in AD: **read** permission on user and
group objects under the base DN (default for authenticated users — a plain
domain user can read `memberOf`, `member`, `userAccountControl`,
`sAMAccountName`, `userPrincipalName`, `mail`). No write rights, no
Domain Admins membership, no password-reset rights.

What is still needed from the user before a production bind can be proven:

1. The service account above (DN + password at runtime), **or** explicit
   approval to bind once as an existing low-privilege account for a test.
2. Confirmation that `192.168.22.5:389` is reachable from wherever
   OpManager runs (the DC is on the GVS LAN `192.168.22.0/24`; this VM
   cannot reach it directly — the ldap-proof track owns the live check).
3. Whether LDAPS (636) is enabled on the DC, if encrypted binds are wanted.

## Known limitation — primary group

A user's *primary* group (usually "Domain Users") appears in **neither**
`memberOf` **nor** the group's `member` list — AD stores it via
`primaryGroupID` / `primaryGroupToken`. `getUserWithGroups()` therefore
reports all non-primary memberships, and the user object carries the raw
`primaryGroupID` (RID). Resolving it to a name needs one extra group
search by `primaryGroupToken` (doable with `searchGroups()`).

## Proof (local test directory — NOT production AD)

`scripts/ldap-local-proof.js` stands up a real in-process ldapjs LDAP
server on `127.0.0.1:21389` (real LDAPv3 over TCP, real BER encoding)
seeded with test data (`dc=test,dc=local`; users alice/bob/carol; groups
IT-Admins/Gravity-Users) and runs the client against it. Test passwords
come from the environment at runtime only:

```
LDAP_TEST_BIND_PASSWORD='...' LDAP_TEST_USER_PASSWORD='...' \
  node scripts/ldap-local-proof.js
```

Result on 2026-11-09: **ALL 16 CHECKS PASSED** — bind (latency 108 ms
in the final run), 3 users with correct enabled flags (alice UAC 512 →
enabled, carol UAC 514 → disabled), 2 groups with exact member DNs,
membership via memberOf (alice → IT-Admins) **and** via the group member
list (bob → Gravity-Users, bob has no memberOf), empty groups for carol,
full map (alice:1, bob:1, carol:0), bind-as-user success + 401 on a wrong
user password, 401 on a wrong service password, 404 on a missing base DN
and on an unknown user, 502 on a closed port, legacy `auth.ad` config
mapping to `ldap://127.0.0.1:21389`.

Two ldapjs test-server quirks were found while proving this (both are
test-server behaviour, not client bugs — a real AD matches attribute
names case-insensitively):

- `SearchResponse.send()` with a plain-object entry filters returned
  attributes by comparing the lower-cased stored name to the requested
  list verbatim, dropping mixed-case AD names (`sAMAccountName`, …).
  The proof server therefore sends real `SearchEntry` instances (with
  `messageId: res.messageId`) which take the unfiltered branch.
- Nested `(&)/(|)` filter matching is case-sensitive on the
  attribute-object keys, so the proof server matches filters against a
  copy keyed both ways.

## Dependency

- `ldapjs@3.0.7` (`"ldapjs": "^3.0.7"` in `package.json`, lockfile
  updated). Note: ldapjs is deprecated upstream — 3.0.7 is the last
  release — but it is still the battle-tested LDAPv3 client for Node and
  speaks the real protocol. A future swap to `ldapts` would keep this
  module's public API unchanged.
