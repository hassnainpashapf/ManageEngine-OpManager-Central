# SNMPv3 setup — operator guide for OpManager Central

Scope: Techub only (Core switch 192.168.30.2 and pfSense TH 192.168.30.1).
Status of this document: code + local proof harness are in this branch
(`p3-snmpv3-proof`); the over-the-wire proof is **blocked on this VM**
(see §6) and must be re-run on a UDP-capable host.

## 1. What OpManager needs (per device)

Canonical device shape (see `SHARED.md`):

```json
{ "version": "v3",
  "v3": { "user": "opm-ro",
          "authProtocol": "sha", "authPass": "<auth-passphrase>",
          "privProtocol": "aes", "privPass": "<priv-passphrase>" } }
```

Rules enforced by `server/services/snmp.js` `validateV3()`:

| Level | `authProtocol` | `privProtocol` | Derived level |
|---|---|---|---|
| noAuthNoPriv | `none` (omit) | `none` (omit) | 1 — noAuthNoPriv |
| authNoPriv | `md5` or `sha` | `none` (omit) | 2 — authNoPriv |
| authPriv | `md5` or `sha` | `des` or `aes` | 3 — authPriv |

- User name is required. Auth/priv passphrases must be **at least 8
  characters** (RFC 3414); shorter ones are rejected with HTTP 400 before
  any packet is sent. Privacy without authentication is rejected (it is
  not a valid USM level).
- Passphrases are **request-body only**: they are never stored in the
  device record, never logged, and never echoed in any response. The
  tools endpoints return only `version`, `securityLevel` and `user`.

### Tools endpoint (live in this branch)

```
POST /api/tools/snmp-query
{ "ip": "192.168.30.2", "oid": "1.3.6.1.2.1.1.1.0",
  "version": "v3",
  "v3": { "user": "opm-ro", "authProtocol": "sha",
          "authPass": "<auth-passphrase>",
          "privProtocol": "aes", "privPass": "<priv-passphrase>" } }
```

Success response: `{ "status": "success", "version": "v3",
"securityLevel": "authPriv", "user": "opm-ro", "oid": "...",
"value": "<real value from the agent>", ... }`. Failures are honest:
bad credentials → 400; USM failure / timeout / unreachable → 502 with
the real error text. There is no port field yet — OpManager always uses
UDP/161 (see §5 if the pfSense package daemon ends up on another port).

`POST /api/tools/snmp-walk` takes the same `version` / `v3` fields with
`rootOid` instead of `oid`.

## 2. Cisco IOS — create a read-only v3 user (Core switch 192.168.30.2)

Run on the switch CLI (enable mode). Replace the `<...>` values with
the real passphrases (minimum 8 characters each; use different values
for auth and priv). These commands only ADD a monitoring user; they do
not touch communities, interfaces, or routing.

```ios
! Read-only view (whole MIB tree; restrict to 1.3.6.1.2.1 if preferred)
snmp-server view OPM-RO iso included

! Read-only group at the strongest level (authPriv)
snmp-server group OPM-RO v3 priv read OPM-RO

! The user: SHA auth + AES-128 privacy
snmp-server user opm-ro OPM-RO v3 auth sha <auth-passphrase> priv aes 128 <priv-passphrase>

! Optional weaker users (only if a device cannot do authPriv):
snmp-server group OPM-RO-AUTH v3 auth read OPM-RO
snmp-server user opm-ro-auth OPM-RO-AUTH v3 auth sha <auth-passphrase>
snmp-server group OPM-RO-NOAUTH v3 noauth read OPM-RO
snmp-server user opm-ro-noauth OPM-RO-NOAUTH v3
```

Verify (read-only):

```ios
show snmp user
show snmp group
show snmp view
```

Remove (if ever needed):

```ios
no snmp-server user opm-ro
no snmp-server group OPM-RO v3 priv
no snmp-server view OPM-RO
```

Notes:

- The Core switch is a C3560 running IOS 12.2(58)SE1. Its USM engine is
  live today: a v3 probe from the relay answers `Unknown user name`
  (engineID `8000000903000C8525AEE301`), which proves the agent speaks
  v3 — it simply has no user yet. The running config (backup
  2026-11-08) contains **zero** `snmp-server user` / `snmp-server group`
  lines and four v2c community lines only.
- `show snmp user` is the definitive check on the switch; the v2c
  `public` community cannot see the USM tables at all (walks of
  `1.3.6.1.6.3.15` / `1.3.6.1.6.3.16` return end-of-MIB-view), so do
  not use an empty v2c usmUserTable walk as proof of "no user".

## 3. pfSense TH — read-only v3 user (192.168.30.1)

The **built-in** SNMP service (Services → SNMP, bsnmpd) is v2c-only:
its config has only `rocommunity public`, port 161, no v3 at all, and
the live agent on :161 does **not answer SNMPv3** (every v3 request
times out while v2c answers immediately). Do not expect v3 from it.

SNMPv3 on pfSense TH lives in the separate **net-snmp package**:

1. System → Package Manager → Available Packages → install `net-snmp`.
2. Services → NET-SNMP → Users tab → Add:
   - Username: `opm-ro`
   - Type: user; Access: **rouser** (read-only — not rwuser)
   - Auth type: **SHA**, Auth passphrase: `<auth-passphrase>`
   - Privacy protocol: **AES**, Privacy passphrase: `<priv-passphrase>`
   - Base OID: leave empty (whole tree); Minimum security level: `auth`
     (or `priv` to force authPriv only)
3. Services → NET-SNMP → Settings: enable the daemon and set its
   listen address/port. **Only one daemon can own UDP/161**: if the
   built-in SNMP service stays enabled on 161, the package daemon must
   bind a different port (and OpManager needs a port option first —
   see §5), or disable the built-in service and let the package own 161.
4. Verify from the relay (read-only, deliberately wrong passphrase —
   the error type is the test):
   `snmpget -v3 -l authPriv -u opm-ro -a SHA -A <wrong> -x AES -X <wrong>
   192.168.30.1 1.3.6.1.2.1.1.1.0`
   - `Unknown user name` → user does not exist in the listening agent.
   - `Authentication failure` → user exists (passphrase was wrong).
   - `Timeout` → no v3 agent is listening on that port.
   Then confirm with the real passphrase via the OpManager tools
   endpoint (§1).

### Existing `manager` user — decision needed

The pfSense TH config (`config.xml`, backup 2026-11-08) already
contains a net-snmp-package v3 user **`manager`** (SHA auth, AES priv,
**rwuser** — read-write). Its daemon is not the listener on :161 today
(v3 to :161 times out), so it currently grants nothing over the wire —
but it is a live RW credential sitting in every config backup.
Recommended: delete `manager` and create the dedicated read-only
`opm-ro` user above instead. If `manager` is used by something else,
say what, and it must at minimum be changed to read-only with fresh
passphrases. Do **not** reuse `manager` for OpManager.

## 4. What to enter in OpManager (once the users exist)

For each device, in the device's SNMP settings:

- Version: **SNMPv3**
- Username: `opm-ro`
- Security level: **authPriv** (recommended; `authNoPriv` / `noAuthNoPriv`
  only if the device cannot do authPriv)
- Auth protocol: **SHA** (or MD5), Auth passphrase: `<auth-passphrase>`
- Privacy protocol: **AES** (or DES), Privacy passphrase: `<priv-passphrase>`

Then test with `POST /api/tools/snmp-query` (§1) against
`1.3.6.1.2.1.1.1.0` (sysDescr). Expected on the Core switch:
`Cisco IOS Software, C3560 Software (C3560-IPSERVICESK9-M), Version
12.2(58)SE1, ...`. On pfSense (once its package daemon listens):
the pfSense system string.

## 5. Gaps / follow-ups (not in this track)

- **No port field**: `snmpGetV3`/`snmpWalkV3` and the tools endpoints
  always use UDP/161. If the pfSense net-snmp daemon ends up on a
  non-161 port, the poller/tools need a `port` option first.
- **No stored v3 credentials yet**: passphrases are request-body only.
  Persisting them in `device.snmp.v3` (encrypted at rest) is a
  settings/store decision for another track; do not paste passphrases
  into chat or docs.
- **Poller**: `getSystemInfo`/`getCpuMem`/`getInterfaces` are still
  v2c-only in this branch; the v3 poller path is the snmpv3-poller
  track's work. The generic primitives `snmpGetV3`/`snmpWalkV3` in
  `server/services/snmp.js` are what it should build on.

## 6. Proof status (2026-11-09)

Proven:

- **Real v3 agent**: system `snmpd` (net-snmp 5.9.4, installed via apt)
  on this VM, bound to `127.0.0.1:161`, engineID
  `80001F888092849657D67EF16A000000`, with three USM users created
  (verified in snmpd's own debug log and 3 rows in its persistent
  `usmUser` store): `opm-noauth` (noAuthNoPriv), `opm-auth` (SHA,
  authNoPriv), `opm-priv` (SHA + AES, authPriv). Test passphrases were
  random per run, kept in `/tmp` only, deleted after the run.
- **Client code**: `node scripts/snmpv3-unit-check.js` — **18/18 pass**.
  `validateV3()` derives levels 1/2/3 correctly (including MD5/DES
  variants and case-insensitive protocol names), rejects empty user,
  unknown protocols, <8-char passphrases, and privacy-without-auth;
  `createV3Session()` builds real net-snmp Version3 sessions whose user
  objects carry exactly the supplied name/level/auth/priv keys.
- **Endpoint validation**: `POST /api/tools/snmp-query` returns HTTP 400
  for missing user, short passphrase, and privacy-without-auth (proven
  live on this VM's own :8160 instance).
- **Real devices, no v3 user usable today**: Core switch — no v3 user
  (running config + live `Unknown user name` probe); pfSense TH — live
  agent on :161 answers no v3 at all (timeout, twice, v2c control
  answers fine). The one exception is the pfSense net-snmp package's
  configured `manager` RW user (§3) — configured, but not listening.

**NOT proven — blocked by the sandbox, not by the code:**

- The over-the-wire v3 GET/WALK through the tools endpoint could not
  complete on this VM: **every UDP send fails with EPERM**, including
  loopback (`send EPERM 127.0.0.1:161` from Node, `Operation not
  permitted` from the net-snmp CLI and from a raw Python UDP socket),
  for IPv4 and IPv6, loopback and external, and inside a fresh network
  namespace (`unshare -Urn`). No Docker/Podman exists here to try a
  container. This is the same sandbox UDP block Phase 2 recorded
  ("sandbox blocks ICMP/UDP"). The endpoint provably attempts a real
  net-snmp send (the EPERM comes from the kernel `sendto`, and the
  endpoint reports it as an honest 502 instead of a fake 200) — but no
  v3 value has yet come back through it. The proof harness
  (`scripts/snmpv3-snmpd-proof.js` — renamed in the Phase 4 merge;
  `scripts/snmpv3-proof.js` is now the service track's in-process-agent
  proof) fails loudly instead of passing vacuously when no values arrive.

**To complete the proof** (on any host where UDP works — the relay, a
Linux box, or the user's Mac with snmpd):

```sh
# 1. Install snmpd, create /tmp/snmpv3-proof/snmpd.conf (mode 600):
#    agentaddress udp:127.0.0.1:161
#    sysName snmpv3-proof-agent
#    createUser opm-noauth
#    createUser opm-auth SHA "<auth-passphrase, >=8 chars>"
#    createUser opm-priv SHA "<auth-passphrase>" AES "<priv-passphrase>"
#    rouser opm-noauth noauth
#    rouser opm-auth auth
#    rouser opm-priv priv
# 2. snmpd -f -Lo -C -c /tmp/snmpv3-proof/snmpd.conf
# 3. From this clone: PORT=8160 node server/index.js
# 4. OPM_BASE=http://127.0.0.1:8160 \
#    SNMPV3_AUTH_PASS="<auth>" SNMPV3_PRIV_PASS="<auth>" \
#    SNMPV3_PRIV_PRIVPASS="<priv>" OPM_ADMIN_PASSWORD="<new-admin-pass>" \
#    node scripts/snmpv3-snmpd-proof.js
#    Expected: ALL CHECKS PASSED, with the same sysDescr/sysName at all
#    three levels, an authPriv walk of the system group, and 502/400 on
#    the negative cases.
```

## 7. Exact ask for the user

1. **Core switch**: run the three commands in §2 (or have the assistant
   run them with the switch login) and share the two passphrases for
   OpManager entry. Nothing else changes on the switch.
2. **pfSense TH**: decide on the existing net-snmp `manager` RW user —
   delete it (recommended) or confirm what uses it — and approve creating
   the dedicated read-only `opm-ro` user (§3) plus which daemon owns
   UDP/161.
3. **Passphrases**: share the chosen auth + priv passphrases (≥8 chars,
   different from each other) through the usual secure route so they can
   be entered in OpManager; they will not be pasted into chat or docs.
