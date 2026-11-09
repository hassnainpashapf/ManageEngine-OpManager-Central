# Active Directory setup for OpManager Central (LDAP)

Status: **the LDAP code path is proven against real LDAP servers, but it has
never been pointed at the user's production Active Directory.** No bind to
the real domain controller has been attempted — no service-account
credentials for it exist anywhere in this repo — and none should be
attempted until the user supplies the items in "What the user must supply".

## What was proven (2026-11-09)

The real client in `server/services/ldap.js` (ldapjs 3.0.7, the canonical
client since the Phase 4 merge — the ldap-proof track's `ldapClient.js`
fork was deleted and its proof runner rewritten against this client) was
proven end-to-end against two independent real LDAP servers speaking the
real protocol on the wire — no canned answers anywhere:

1. **Real OpenLDAP slapd 2.6.10** (installed via apt, ran on
   `127.0.0.1:13390`, stopped and wiped afterwards):
   `scripts/ldap-proof/proof-report-slapd.json` — 5/5 checks passed:
   service bind OK, user search returned 4 entries
   (`opm-svc`, `test.admin`, `test.user1`, `test.user2`), group search
   returned 3 groups (`opm-admins`, `opm-operators`, `opm-readonly`),
   wrong-password bind failed with LDAP 49 (`LdapError` 401
   `LDAP_INVALID_CREDENTIALS`), and
   `authenticateUser test.admin` succeeded and mapped to `opm-admins`.
   Cross-checked independently with `ldapsearch` as the service account.
2. **In-process ldapjs test server** on `127.0.0.1:13389` (test data only,
   suffix `dc=opm-test,dc=local`, random per-run passwords held in memory):
   `scripts/ldap-proof/proof-report.json` — 9/9 checks passed, including
   group-membership mapping for `test.admin -> opm-admins` and
   `test.user2 -> opm-operators + opm-readonly`, and wrong-password
   failure for both the service bind and the user login.

Re-run either proof with:

```sh
# local test server (no external directory needed)
node scripts/ldap-proof/run-proof.js

# a real directory (passwords from the environment at runtime only)
LDAP_PROOF_URL="ldap://127.0.0.1:13390" \
LDAP_PROOF_BIND_DN="cn=opm-svc,ou=users,dc=opm-test,dc=local" \
LDAP_PROOF_BIND_PASSWORD="<runtime only>" \
LDAP_PROOF_BASE_DN="dc=opm-test,dc=local" \
LDAP_PROOF_TEST_USER="test.admin" \
LDAP_PROOF_TEST_USER_PASSWORD="<runtime only>" \
node scripts/ldap-proof/run-proof.js
```

## Settings the user must supply

Stored shape (canonical, per project rules) — `settings.ldap`:

| Setting | Example for this estate | Notes |
|---|---|---|
| `url` | `ldap://192.168.22.5:389` (or `ldaps://192.168.22.5:636`) | DC01 is at 192.168.22.5, domain `gamevillage.com.pk`. Confirm the host is reachable from the OpManager host and whether LDAPS (636) or StartTLS is available. Prefer LDAPS. |
| `bindDn` | `CN=svc-opmanager,OU=Service Accounts,DC=gamevillage,DC=com,DC=pk` | Dedicated service account (see below). A UPN (`svc-opmanager@gamevillage.com.pk`) also works for the bind. |
| `baseDn` | `DC=gamevillage,DC=com,DC=pk` | Search base for users. Narrow it (e.g. an OU) if only part of the directory should be visible. |
| `groupBase` | `DC=gamevillage,DC=com,DC=pk` (or an OU, e.g. `OU=Groups,...`) | Search base for groups; defaults to `baseDn`. |
| `userFilter` | `(objectClass=user)` (or AD-style `(&(objectClass=user)(objectCategory=person))`) | Base filter for user searches. The client builds the per-user lookup itself as `(&(userFilter)(|(samaccountname={username})(userprincipalname={username})))` — there is no `{username}` template in this setting any more (the ldap-proof client's `(uid={username})` default is gone; a uid-based directory can pass its own lookup filter via the `filter` option on `getUserWithGroups`/`authenticateUser`). |
| `groupFilter` | `(objectClass=group)` | AD groups are `objectClass=group`; the ldap-proof default `(objectClass=groupOfNames)` is for OpenLDAP-style directories. |

Bind password: **never stored.** It is supplied at runtime only (environment
variable / prompt when testing, and the operator's session when the
production test runs). It must never be written to a file, a log, a commit,
or the settings store. The settings test endpoint must accept it in the
request body for that one test call and drop it afterwards.

## Service account and the read-only permissions it needs

Create a dedicated account, e.g. `svc-opmanager`, and give it **read-only**
access to the directory. It needs exactly:

- Read all user objects under `baseDn`: `sAMAccountName`, `cn`, `sn`,
  `givenName`, `mail`, `memberOf`, `userAccountControl`,
  `distinguishedName`.
- Read all group objects under `groupBase`: `cn`, `description`, `member`.
- Nothing else. In particular it must **not** have: write to any object,
  password reset / change-password rights, account create/delete,
  group-membership write, schema or domain-admin rights.

In AD terms: a plain Domain User with read permission on the OUs in scope
is sufficient (read is granted to authenticated users by default). Do not
make it a Domain Admin, Account Operator, or member of any privileged
group. If the directory team prefers least privilege, delegate "Read all
properties" on the user/group OUs to this account only.

## Group -> OpManager role mapping (decision needed)

Decide which AD groups map to which OpManager roles before enabling LDAP
login, e.g.:

| AD group | OpManager role |
|---|---|
| (admins group, e.g. `OpManager-Admins`) | admin |
| (operators group, e.g. `OpManager-Operators`) | operator |
| (everyone else who can log in) | readonly |

The client returns the user's groups (`getUserWithGroups`); the
role-mapping itself lives in the auth routes, not in this doc.

## What is still missing (the precise ask)

1. Confirm the DC for LDAP: `192.168.22.5` (DC01, `gamevillage.com.pk`),
   and whether to use `ldap://…:389` (+StartTLS) or `ldaps://…:636`.
2. Create the dedicated read-only service account `svc-opmanager` (or
   confirm an existing one) and supply its DN/UPN. **Supply its password
   at runtime only, when the test runs — never in chat, a file, or a
   ticket.**
3. Confirm `baseDn` / `groupBase` (defaults above assume the whole
   `DC=gamevillage,DC=com,DC=pk` tree) and the `userFilter`
   (`(sAMAccountName={username})`).
4. Name the AD groups that map to admin / operator / readonly (or confirm
   that LDAP is login-only and roles stay locally assigned).
5. Confirm the OpManager host can reach the DC on the LDAP/LDAPS port
   (the DC is on the GVS LAN; the relay/VPS is not — reachability from
   the deployed host must be checked, it was not tested here).

Once those five are supplied, the run is: point `testBind` /
`authenticateUser` at the real DC with the runtime password, verify a
service bind + user search + one real login, then wire the login route to
it. Until then, LDAP login stays disabled and local login is unchanged.
