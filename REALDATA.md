# OpManager Central — Real-Data Operator Documentation

> **Status: FINAL — built and verified, branch `real-data`, 2026-11-09.**
> This document describes the rebuilt, real-data OpManager Central **as it
> was actually built and actually verified** on 2026-11-09 PKT. It replaces
> the earlier DRAFT skeleton (which described target behaviour); every
> section below records landed behaviour, with verification evidence in §9.
>
> **Repo:** `~/workspace/opmanager-central-check` — branch `real-data`,
> base HEAD `a907772`; `origin/main` at `26e32bc` (rebase target at push
> time).
> **Server:** Node.js + Express, port **8060** (`node server/index.js`,
> `npm start`). Version **12.9.204-GA** everywhere user-visible (see §1.5).
>
> **Audit source:** the fake-data audit inventory in
> `~/workspace/opm-check/real-data/audit/` (`auth.md`, `datastore.md`,
> `poller-metrics.md`, `discovery-probes-agents.md`,
> `alarms-reports-settings.md`, `infra-scripts.md`, `ncm-traps-zia.md`,
> `ui-bindings.md` — 8 files, 314 fake items), dated 2026-11-09, HEAD
> `a907772`. Section 1 summarises the purge outcome; the audit files are
> the authoritative item-by-item record of what the old build did.
>
> **Companion document:** `API.md` in this directory — the per-endpoint
> reference (193 route definitions: 164 REAL, 21 HONEST-EMPTY, 8
> NOT-IMPLEMENTED (501), 0 FAKE — phase-2 close-out recount 2026-11-09, §11
> below; the phase-1 count was 181: 138 REAL, 21 HE, 22 501).
> **Phase 3 + Phase 4 close-out (2026-11-09, NOT pushed): 232 route
> definitions — 210 REAL, 21 HONEST-EMPTY, 1 unconditional 501 (JVM heap,
> permanently N/A), 0 FAKE — see §12 below and `API.md` §24.**

---

## 1. What changed vs the old fake build

### 1.1 Summary

The old build was a UI replica with a simulated backend. It looked like
OpManager Central 12.9.203/204 GA, but almost nothing it displayed was
measured: login accepted anything, the "database" was a JSON file, the
"live" metrics were a random walk, discovery invented devices, and probes
were static seed records. The rebuild replaced each simulated piece with
a real one, on the principle: **if it was not collected from a real device,
probe, or agent, it is not shown — the screen shows an empty state instead.**

| Area | Old build (fake) | Real-data build (built & verified) |
|---|---|---|
| Auth | Any non-empty username/password logs in as SuperAdmin; `admin`/`admin` hardcoded; token is `OPM_CENTRAL_SESSION_` + timestamp, never checked | Real login: one admin account, scrypt-hashed password, forced change on first login (§2) |
| Data store | `server/data/db.json` + `seed.json` (JSON file, rewritten whole on every save); seed claims `dbType: PostgreSQL 14.5` with no database behind it | SQLite store (`server/services/store.js`, `node:sqlite`, file `server/data/opmanager.db`, WAL) holding only actually-collected data (§6) |
| Poller | 4 s tick (`poller.start(4000)` in `server/index.js`) nudging CPU/memory/RTT/interface traffic by `Math.random()` deltas; `lastPolled: 'Just now'` hardcoded; alarm toasts replay a random old alarm every ~20 s | Real SNMP (net-snmp) + ICMP poller, 60 s cycle; values only from real replies; real poll timestamps (§6) |
| Discovery | `POST /api/discovery/run` picks 2–4 devices at random from a 5-entry sample catalog (Cisco 3850 / FortiGate 100F / Dell R740xd / Aruba AP-535 / Juniper MX204) at random IPs, with random CPU/memory/disk and an invented `FOC…` serial | Real ICMP sweep + SNMP `sysDescr`/`sysObjectID` classification; one device per host that actually answered (§4) |
| Probes | One static seed probe (`Central-Probe-01`, id 101, `192.168.30.65`, status `Online`, latency `1`) — never a live connection | Probes register over the network and stay `Online` only while heartbeating (§5) |
| Host agents | Go agent exists (`agent_src/main.go`) and its telemetry path is one of the few real paths in the old build — but its records lived in an in-memory `Map`, lost on restart | Agent registration + telemetry persisted in SQLite; key-auth enforced (§5) |
| Alarms | Alarm list/ack/clear endpoints exist, but there was no real threshold evaluation feeding them — nothing ever raised an alarm from a measurement | Thresholds evaluated against real polled values (CPU >90 Critical / >80 Trouble, memory >90 Critical); raise / ack / clear lifecycle (§7) |
| Device tools | `GET /device/getPingResponse` returned canned `10/12/15 ms` ping output; `POST /device/testCredential` always returned `SUCCESS` with fixed `latencyMs: 14`; `POST /device/pollNow` randomised values | Every test runs the real check and reports its real result, including failure (§3, §6) |
| Seed data | 0 devices, 0 alarms, 1 probe, 1 credential (`Global-SNMPv2-Community`, community `public`), 3 CCM configs in `seed.json` / `db.json` | No seeded devices, probes, alarms, or credentials. `seed.json`, `db.json`, and `server/services/db.js` are deleted; the store starts empty (§6, §8) |

> **Correction to an earlier summary (from `audit/datastore.md` C-01):**
> the old datastore did **not** contain "16 demo devices and 4 demo
> probes". `seed.json` / `db.json` hold 0 devices, 0 alarms, 1 probe.
> The demo-device impression came from the discovery simulation and/or
> the frontend. Do not cite "16 demo devices" as a datastore fact.

### 1.2 What was removed — purge audit outcome

The first purge audit found **15 live fake markers** in the rebuilt tree.
All 15 were fixed:

- `tools.js` — unknown-device handling now returns an honest **404** for
  an explicitly supplied unknown `deviceId`/`ip` (no silent fallback to
  another device), and unknown port fields are `null` (no synthesised
  `Fa0/<n>` names, no `127.0.0.1` placeholder IP).
- PostgreSQL UI claims → SQLite wording, and the client bundle was
  rebuilt so the old claims are gone from served JS too.
- `noc.html` / `install-agent.sh` demo identity removed.
- 7 stale fake-world test scripts deleted.
- 3 verification scripts made portable.

**Final re-grep (2026-11-09, after the final restart): PASS — 0 live
fake-data markers.** All six hardcoded-secret patterns are 0 in the
working tree, including the rebuilt binaries:
`OPM_CENTRAL_AUTH_TOKEN_77a82b9`, `OPM-CENTRAL-REST-API-KEY-928104-GA-129203`,
`ee-central-auth-9a8c7b6d5e4f3a2b1c0d`, `OPM_EE_PROBE_SEC_KEY_1`,
`OPM_EE_CENTRAL_ROOT_SECRET_2026`, `ee-probe-101-central-key`.
(`node --check`: 26/26 server files pass.)
Note: the string `opmcsrfcookie` still appears as a *name* in legacy
vendored Fluidic v2/v3 client JS that reads a cookie by that name — that
is not the hardcoded secret value, which is gone. The catch-all that
answered every unmapped API path with fake `{status: 'success', result:
[], rows: []}` is gone: unmapped API paths return a real
`404 {error: 'not_found'}`.
The last known fabricated endpoint, `GET /logs/:file` in
`server/index.js`, was rebuilt: it now reads the tail of a real `.log`
file under `server/logs` or `server/data/logs` and answers **404** when
no such file exists — no lines are synthesised.

### 1.3 What was deliberately kept

These are legitimate reference data, not fake data (audit `datastore.md`
R-01…R-03):

- The MIB library in `server/data/mibs/` (~116 files) — reference
  definitions used to interpret SNMP OIDs.
- The device-template XML library in `server/data/templates/` (~562
  files) — template definitions; a template is only *applied* to a device
  after that device is really discovered/polled. `GET
  /api/settings/templates` returns the real 562-entry index; template
  create/update/apply remain honest 501s (no template write store —
  see §10).
- The Go host agent source (`agent_src/main.go`) and its built binaries
  in `agent_dist/` (Windows / macOS / Linux) — the agent is real; its
  server-side handling is what changed (§5). **9 binaries were rebuilt
  twice from key-free source** (AgentVersion 12.9.204-GA, Build 20261106)
  and 2 archives repacked, so no shipped binary contains a hardcoded
  key. Post-push caveat: the `.dmg` / `.msi` agent packages still bundle
  the pre-rebuild binary (they cannot be rebuilt on this VM — macOS /
  Windows packaging tools are needed), and the universal Mac binary was
  replaced with a single-arch amd64 build (runs via Rosetta 2 on Apple
  Silicon; a true universal binary needs `lipo` on a Mac). See §10.4.

### 1.4 What is unchanged (UI)

The Fluidic/ITOM UI shell, navigation, and views are unchanged in shape.
What changes is the data behind them: every number, status, and list must
now trace to a collected record, or the view shows its empty state (§8).

### 1.5 Version

Version is unified to **12.9.204-GA** everywhere user-visible
(`package.json`, server banner, WebSocket `INITIAL_STATE`
`productVersion`, agent downloads list). The only remainder is the
opaque internal WebSocket id `WS_OPM_CENTRAL_129203` in
`server/index.js:440`, intentionally left — it is an internal identifier,
not a displayed version. No `12.9.203` string remains in `server/`,
`client/js/`, `client/*.html`, or `scripts/`.

---

## 2. First-run setup

### 2.1 Starting the server

```bash
cd ~/workspace/opmanager-central-check
npm start            # node server/index.js, listens on port 8060
```

Open `http://<host>:8060/` — the login page (`client/login.html`).

The server binds all interfaces on port 8060 and serves **plain HTTP**
(no TLS listener). Start/stop scripts exist in the repo root
(`start.sh`, `start-opmanager-central.sh`, `stop_opmanager_central.sh`).
The SQLite file lives at `server/data/opmanager.db` (WAL; override with
`OPMANAGER_DB_PATH`); backup is a real `VACUUM INTO` via
`POST /api/settings/db/backup`, which returns the real file size +
SHA-256.

### 2.2 How the admin account is created (as built)

- A single local admin account, password hashed with **scrypt**
  (`node:crypto`, random 16-byte salt, 64-byte key, constant-time verify;
  stored as `scrypt$<saltHex>$<hashHex>` in the `users` table).
- `ensureFirstAdmin()` creates user `admin` only if the users table is
  empty, with a **random 16-character base64url password** printed once
  to stdout and written to `server/data/.admin-initial` (mode 600),
  flagged `must_change_password`.
- There is no hardcoded credential anywhere in code, config, or error
  text. Login failures return a single generic `401
  {error: 'invalid credentials'}` — never revealing whether the user
  exists. The login form no longer pre-fills any credential.
- **Password rotation incident (2026-11-09, fixed during the build):** a
  plaintext print of the bootstrap password was found in the startup log
  (`server/services/session.js:235`). The print was removed — line 235
  now logs only *"Bootstrap admin password written to
  server/data/.admin-initial (mode 600) — change it on first login."* —
  the password was **rotated once**, and the old logs were truncated.
  Treat any surviving log containing a bootstrap password as sensitive.
- `POST /api/auth/setup` is single-use: it refuses (`403`) once any user
  exists. It creates the first admin with `must_change_password: 0`.
- **Force-change:** after the first successful login with the initial
  credential, the operator must set a new password (`POST
  /api/auth/change-password`, new password ≥ 10 chars); the change clears
  `must_change_password` and **rotates the session** (a new token is
  issued). The flag is returned by login as `mustChangePassword` and is
  stored on the user row.
  **Caveat — not fully verified:** no guard in `server/index.js` was
  found refusing *other* endpoints for a flagged user, so server-side
  enforcement of the forced change on every non-password route is
  **unproven** (API.md O-1). Do not claim it is enforced until a live
  test proves a flagged session is blocked from non-password routes.
- **Sessions:** `POST /api/auth/login` issues a cryptographically random
  32-byte token; only its SHA-256 hash is stored (`sessions` table). The
  raw token is sent as an HttpOnly cookie `opm_session` (`SameSite=Lax`,
  `maxAge` = session TTL, `Secure` only when the request itself is
  HTTPS) and is also accepted as `Authorization: Bearer <token>`. TTL is
  **8 hours**; expired sessions are revoked. `requireAuth` → `401
  {error: 'unauthorized', authenticated: false}`. Logout revokes the
  session server-side and clears the cookie (verified by
  `verify-auth.sh`, §9).
- **Global guard:** `apiAuthGuard` (mounted before all 17 routers)
  applies `requireAuth` to every `/api/*` and `/client/api/*` path and
  to the legacy prefixes (`/admin/ /alarm/ /device/ /enterprise/
  /fwaenterprise/ /maps/ /ncmclient/ /ncmcompliance/ /ncmconfig/
  /ncmdashboard/ /ncmeol/ /ncmreports/ /nfaee/ /reports/ /tab/ /user/
  /v2/ /dashboard/`). Public (guard-exempt): `POST /api/auth/login`,
  `POST /api/auth/setup`, and `GET /api/auth/session` (the last still
  carries route-level `requireAuth`, so it 401s without a session).
  WebSocket upgrades (`/PNSHandler`, `/ws`) re-validate the session
  token (close 1008 if unauthenticated). There is no CORS middleware —
  same-origin only — and no hardcoded CSRF token.
- **Additional users / RBAC:** single admin only. `GET
  /api/settings/users` lists the real store users; `POST` and `DELETE`
  on users return **501** — user creation/deletion belongs to the auth
  service and is not implemented in that route (see §10).
- **Password reset:** there is no reset flow. Recovery is direct store
  access by the operator; the old "Forgot Password?" `alert()` stub is
  gone.

### 2.3 What the operator must do on first login

1. Log in with the initial admin credential (from
   `server/data/.admin-initial`).
2. Set a new admin password when prompted (forced).
3. Verify the dashboard shows empty states (§8) — zero devices, zero
   alarms, zero probes — and **not** demo data.
4. Add the first SNMP credential (§3) and the first device or discovery
   profile (§3, §4).

### 2.4 What must never happen again

- No credential printed in an error message (the old 401 body advertised
  `admin / admin`). — Removed; see the rotation incident in §2.2.
- No credential pre-filled in the login form. — Removed.
- No login that succeeds for arbitrary credentials. — Verified (§9).
- No page, API route, or WebSocket stream reachable without a valid
  session. — Verified by `verify-auth.sh` 11/11 (§9).

---

## 3. Adding a device

### 3.1 What is needed

| Field | Required | Notes |
|---|---|---|
| IP address (or hostname) | Yes | `POST /api/devices` requires an IP (`400` without one, `409` on duplicate IP). |
| Name / display name | Yes | Operator-chosen; SNMP `sysName` is stored from the poll response where present. |
| Probe | Yes | Which probe polls it. Default: the local/central probe. |
| SNMP credential | Yes for SNMP devices | A stored credential (community for v1/v2c). SNMPv3 is **not** supported anywhere — v3 queries return 501. |
| SNMP version | Yes | v1 or v2c only. |
| SNMP port | No | Default 161. |
| Category / type | No | Auto-classified from SNMP `sysObjectID` where possible (§4); devices with no category count under `Uncategorized`. |
| Device template | No | Applied from the template catalog by `sysObjectID` match, or chosen manually (reads only — apply is 501, see §10). |

Fields with no measured value stay empty / `null` / "unknown" until the
first real poll (§8). Nothing is invented: no fake MAC, no random
CPU/memory/disk, no one-interface `eth0` at fixed traffic values.

### 3.2 SNMP credentials

- Credentials are stored in the SQLite store (`credentials` table),
  associated with devices by reference. Secrets are stripped from every
  API response by `publicCopy` (any key matching
  `/password|passwd|secret|private[_-]?key|token/i` is dropped).
- **Storage at rest — risk accepted:** SNMPv2c community strings are
  stored **plaintext in SQLite** — unavoidable for v2c, because the
  poller must present the original string to the device on every poll.
  Accepted only with the DB file at mode 600 (see security-review.md
  §6). Alternatives, not yet implemented: AES-256-GCM encryption at rest
  (key outside the DB), or SNMPv3 authPriv migration. The seeded
  `public` credential is gone — no credential field defaults to a
  well-known string. (Discovery falls back to the stored setting
  `discovery.defaultCommunity`, then `'public'`, when the operator
  supplies no community — see API.md O-15.)
- **Test credential (real):** `POST /device/testCredential` performs an
  actual SNMP GET (`sysDescr`) against the target with the supplied
  credential and reports success **or failure with the real error**
  (timeout / wrong community / no response). Success:
  `{status:'success', result:'SUCCESS', latencyMs, sysDescr, sysName}`;
  failure is HTTP 200 with `result:'FAILURE'` and a message; `400` only
  when no target IP can be determined at all.

### 3.3 What happens when a device is added

1. The device record is created in SQLite with status **Unknown / Not
   yet polled** — never `Clear` with `availability 100.0` before any poll.
2. A reachability check runs (ICMP echo + SNMP `sysDescr` GET with the
   chosen credential). A device that answers ping but not SNMP is
   `SNMP-ERROR`; ping + SNMP both failing is `Down`.
3. On success, classification runs (§4): vendor / model / OS from the
   SNMP response, interfaces enumerated from IF-MIB.
4. The device joins the next 60 s poll cycle (§6). Until the first poll
   completes, its CPU / memory / disk / interface values are empty, not
   zero and not random.

### 3.4 Deleting / unmanaging a device

- `POST /device/deleteDevice` (`404` for an unknown device) deletes the
  row **and cascade-deletes its alarms in the same transaction**
  (`server/services/store.js` `deleteDevice`, lines 400–412) — added as
  a fix during verification, because the schema's `ON DELETE SET NULL`
  had orphaned alarms with `device_id NULL`. Audit-log entries are
  intentionally kept; alarm notes cascade via their own `ON DELETE
  CASCADE` FK. The cascade was proven live on both the local and the
  relay server (alarm count 1 → 0 on device delete, §9).
- `POST /device/setManaged` persists the `managed` flag via the store
  and returns the stored state (the old no-op success is gone).

---

## 4. Discovery

### 4.1 How it works (as built)

1. The operator creates a **discovery profile/rule** (`POST
   /api/discovery/rules`, `201`): a subnet/CIDR or IP range, the probe,
   and a schedule. Only what the operator entered is stored; the probe
   must exist (foreign key).
2. On run (`POST /api/discovery/run`, `202 {runId: 'DISC-<epoch-ms>'}`),
   the probe performs an **ICMP sweep** of the range: one echo per
   address. Only addresses that answer proceed.
3. For each answering host, the probe performs an **SNMP GET** of
   `sysDescr` (`.1.3.6.1.2.1.1.1.0`) and `sysObjectID`
   (`.1.3.6.1.2.1.1.2.0`) with the profile's credential(s) (SNMPv2c
   only — any other version → `400`). The community used is
   `body.community || body.snmpCommunity || defaultCommunity() ||
   'public'`, where `defaultCommunity()` reads the stored setting
   `discovery.defaultCommunity`. A community is stored on the device row
   only once it has proven to work; a failed community is never recorded.
4. The host is **classified** from the response: vendor/model/OS from
   `sysDescr` and the `sysObjectID` → template mapping. A host that
   answers ICMP but not SNMP is discovered as category `unknown` with
   `sysDescr: null` and is added as a device row with that honest
   classification.
5. Each classified host is added as a device (§3) with its real
   `sysDescr`, `sysObjectID`, IP, and (where the device reports it)
   `sysName`. Its metrics stay empty until the first poll.

### 4.2 What discovery never invents

- Never a device at an address that did not answer.
- Never a vendor, model, OS, serial, or metric that did not come from
  that host's SNMP response.
- Never a count: the result is the number of hosts that actually
  answered, even if that number is zero.
- Never a credential success: a wrong community means the host is
  unreachable-by-SNMP, reported as such — not silently "passed".

### 4.3 Rules, schedules, and history

- Discovery rules/profiles are **persisted in SQLite** and survive
  restarts. `GET /api/discovery/history` returns real past runs; an
  empty store returns `[]`.
- Every run is recorded with start/end time, range, probe, credential(s)
  tried, hosts found, hosts added, hosts failed, and per-host reason.
- Recurring-rule execution is in-process; run-history retention is not
  separately configured (no pruning job — see §6.3 on retention).
- Whether a re-run re-classifies already-known devices, and what happens
  to a host that stops answering, is not separately specified — the
  device keeps its last polled state and the poller marks it `Down` /
  `SNMP-ERROR` on failed polls (§6).

---

## 5. Probes & agents

Probes and host agents are different things — do not confuse them:

- A **probe** is a remote OpManager poller that manages devices on behalf
  of Central and syncs results back.
- A **host agent** is the Go agent (`agent_src/main.go`) installed on one
  server/workstation, reporting that host's own CPU/memory/disk/interface
  metrics to Central.

### 5.1 Probes — registration and heartbeat (as built)

- A probe is registered by an admin (`POST /api/probes`, `201`): name +
  IP (+ optional port). `verifyProbe(ip, port)` does a real
  reachability check (TCP/ping) first — `400` missing name/ip or invalid
  host, `409` a probe already exists for that IP, `502` if the probe is
  not reachable (nothing is registered). On success the response
  includes a one-time `authKey` (hex, shown once) and
  `verified: {reachable: true, rttMs, method}`. Only the SHA-256 hash of
  the key is stored; measured latency is saved on the probe row.
- **Heartbeat:** `POST /api/probes/:id/heartbeat` with the probe key
  (body `authKey`/`auth_key` or `x-probe-auth-key` header; SHA-256,
  `timingSafeEqual`). `401` missing key, probe has no registered key, or
  key hash mismatch; `404` unknown probe. On success it updates
  `last_heartbeat_at` and stores only the numeric metrics actually sent
  (`cpu_pct`/`mem_pct`/`disk_pct`/`latency_ms`, or `cpu`/`memory`/`disk`
  aliases) — anything missing stays `null`, never invented.
- **Status is derived from heartbeat freshness:** `Online` / `Stale` /
  `Offline` from `last_heartbeat_at`. Probe lists strip the stored
  `auth_key_hash` from every response (`publicProbe`).
- **Sync is honest but limited:** `POST /api/probes/:id/sync` and
  `/api/probes/sync-all` ping-check the probe and reconcile **Central's
  own stored** devices/alarms for that probe (`"… N device(s), M active
  alarm(s) reconciled from the store"`). **No data is actually pulled
  from the probe** — real probe→Central data sync is not implemented
  (API.md O-17). `502` if the probe is unreachable by ping.
- **Deleting a probe** (`POST /api/probes/:id/delete`) deletes the stored
  probe row. What happens to that probe's devices/alarms on delete is
  not separately specified — unlike device delete, no cascade is
  documented for probe delete.
- The old `db.addProbe()` invented health values are gone: registration
  stores only what the probe actually reported; everything else starts
  empty.

### 5.2 Host agents — registration, telemetry, silence (as built)

- Agent config: server URL (default `http://localhost:8060`), telemetry
  interval (default **5 s**, `-interval` flag), installable as a Windows
  service / macOS daemon / Linux binary (`agent_dist/`).
- **Registration is admin-only now:** `POST /api/agents/register`
  (session) with `{agentId, hostname}` issues a one-time agent key,
  stored only as a SHA-256 hash under `api_keys` with name
  `agent:<agentId>` (prior keys for that agent are rotated/deleted; the
  key is shown once). `POST /api/agent/register` (self-registration) is
  deliberately refused with **410** — agents must be registered by an
  admin. This closes the old auto-registration of unknown agents.
- `POST /api/agent/telemetry` (agent key via `eeauthkey` or `x-agent-key`
  header; SHA-256 compared against the stored hash; unknown agent or bad
  key → `401`) accepts `{agentId, …metrics}`; only fields actually sent
  are stored — absent fields keep their last real value or stay `null`,
  never invented. `POST /api/agent/deregister` (agent key) marks the
  agent Offline. Agent status is derived from heartbeat freshness.
- Agent records live in **SQLite** (the old in-memory `Map` with
  hardcoded fallback metrics `cpu 15 / memory 42 / disk 38` is gone),
  so registered agents survive a Central restart.
- **When an agent goes silent:** status flips from heartbeat freshness
  (Online → Stale → Offline). Whether a silence alarm is raised, and
  whether stale metrics are blanked or shown with their age, is not
  separately specified in the landed code — the last reported values are
  retained with their timestamps; staleness is visible via the status,
  not via fabricated freshness.
- **Agent downloads:** `GET /api/agent/downloads` lists the installer
  set, version **12.9.204-GA**, build `20261106`. Whether each listed
  file actually exists on disk / is served was not verified in this pass
  (API.md O-16, version part resolved).

---

## 6. Polling model

### 6.1 Interval

- **60 seconds**, from the store setting `poll_interval_seconds`
  (default 60). The old 4 s random-walk tick is gone.
- Availability, performance, and interface polling share the cycle;
  there is no per-template interval override in the landed code.
  Identity (`sysDescr`/`sysObjectID`/`sysName`) is re-read on the cycle;
  `sysUpTime` is read every cycle for reboot detection.
- Agent telemetry is separate: default 5 s from the agent itself.

### 6.2 What the poller collects (as built)

Per device, per cycle, using that device's stored SNMP version and
credential, via the `net-snmp` package (`net-snmp ^3.29.2`):

| Measurement | Source OID(s) — as implemented | Notes |
|---|---|---|
| Availability / response time | ICMP echo (system `ping`) | Loss + RTT from real echo replies. |
| System identity | `sysDescr` `.1.3.6.1.2.1.1.1.0`, `sysObjectID` `.1.3.6.1.2.1.1.2.0`, `sysName`, `sysUpTime` | Verified live against real devices (§9). |
| CPU | CISCO-PROCESS-MIB `cpmCPUTotal5minRev` `.1.3.6.1.4.1.9.9.109.1.1.1.1.8`, fallback `cpmCPUTotal5min` `.5`; HOST-RESOURCES `hrProcessorLoad` `.1.3.6.1.2.1.25.3.3.1.2` for generic hosts | Walked, not hard-coded to index `.1`. A device that does not implement the OID (e.g. pfSense) reports an honest `null` — never a substitute value. |
| Memory | CISCO-MEMORY-POOL-MIB `ciscoMemoryPoolUsed` `.1.3.6.1.4.1.9.9.48.1.1.1.5` / `Free` `.6`, row matched by name `Processor`; HOST-RESOURCES `hrStorageUsed` `.1.3.6.1.2.1.25.2.3.1.6` (with `hrStorageSize`) for generic hosts | % = Used / (Used + Free) × 100. pfSense: honest nulls. |
| Interfaces | IF-MIB `ifInOctets` / `ifOutOctets`, or 64-bit `ifHCInOctets` / `ifHCOutOctets` `.1.3.6.1.2.1.31.1.1.1.6` / `.10`; `ifOperStatus` | Traffic in bits/s is computed from the counter delta over elapsed time, handling counter wrap/reset. HC counters preferred (see `specs/snmp-oid-reference.md` §2c). |
| Temperature / fans / power | CISCO-ENVMON-MIB / ENTITY-SENSOR-MIB where the device supports them | Only where implemented; absent = empty. The old invented 34 °C is gone — test-monitors report `Unknown` with `null` value when no temperature source exists. |
| Disk | HOST-RESOURCES-MIB storage table where implemented | Absent = empty. |

- **Device-state decision (per cycle):** ping fail + SNMP fail →
  `Down`; ping ok + SNMP fail → `SNMP-ERROR`; both ok → `Up`, then
  threshold evaluation.
- **SNMP timeout and retry:** the SNMP service throws on transport
  failure/timeout; a failed poll is recorded honestly and never writes a
  fabricated value. Poller timeouts must stay generous (**≥ 5 s** —
  relay RTTs to the Techub LAN are ~300 ms over Tailscale; see §10.1).
- Every poll attempt records a **real timestamp** (`lastPolled` =
  actual completion time). A device that has never been polled shows
  "Never polled", never "Just now".
- A failed poll never writes a fabricated value. The previous value
  stays with its age visible.
- **`pollNow`:** `POST /api/devices/:id/poll-now` runs
  `poller.pollDeviceNow(deviceId)` synchronously; `404` unknown device;
  poll failure → **502** with the same response shape (honest failure,
  verified live against unreachable `10.255.255.1`, §9).

### 6.3 Where time-series lives

- **SQLite** (`server/data/opmanager.db`, WAL). Tables: `users`,
  `sessions`, `devices`, `interfaces`, `metrics`, `alarms`, `probes`,
  `agents`, `credentials`, `discovery_runs`, `discovery_rules`,
  `configs`, `racks`, `workflows`, `workflow_runs`, `settings`,
  `audit_log`, `traps`, `api_keys`. Prepared statements only, real
  epoch-ms timestamps, no seed/demo data, no random numbers.
- **Retention — NOT implemented:** there is no pruning job and no
  downsampling. The `dataRetentionDays` setting is stored but never
  enforced. The UI now says **"Not configured"** for retention rather
  than claiming a schedule. Do not quote any retention period as real.
- **Backup:** real `VACUUM INTO` to a `.db` file via
  `POST /api/settings/db/backup` (returns real file size + SHA-256);
  `POST /api/settings/db/vacuum` runs a real `VACUUM` + `ANALYZE` and
  returns measured `durationMs` / `reclaimedBytes`. `GET
  /api/settings/db` returns real SQLite stats (DB file size, table
  count, total records) from a read-only connection.
- `server/data/db.json`, `seed.json`, and `server/services/db.js` are
  deleted. There is no migration from the old JSON store — the real-data
  build starts from an empty SQLite store.

### 6.4 What the poller must never do again — and does not

- Random-walk any metric; replay old alarms as "new" toasts; stamp
  `lastPolled: 'Just now'` without polling; report `availability 100.0`
  for an unpolled device; or broadcast a `METRIC_TICK` containing values
  that were not measured in that cycle. All removed; availability is
  `null` when there are no samples at all, and hourly availability
  buckets with no recorded polls report `null`.

### 6.5 The live-poll bug found and fixed (2026-11-09)

The **first** live run against real devices crashed the whole server on
its first real poll — a real bug, found by live verification, not by
code review:

- **Cause:** an unguarded `Counter64` `readBigUInt64BE` on short buffers
  (net-snmp returns Counter64 values as 1–7 byte Buffers, not the 8
  bytes `readBigUInt64BE(0)` demands) plus an unbounded
  `session.walk()`.
- **Fix (in `server/services/snmp.js`):** Counter64 values are
  left-padded to 8 bytes and the decode never throws; walks use
  `session.subtree()` with a prefix guard instead of the unbounded
  `walk()`. Per-device poller containment was added so one device's poll
  failure cannot take the server down.
- Identity values were proven real even in the crashed run — the crash
  was in counter decoding, not in data fabrication.
- **Second run (2026-11-09 ~09:25–09:35 PKT): crash FIXED** — the relay
  server survived 4+ scheduled 60 s cycles with no restart (§9).

---

## 7. Alarms

### 7.1 How thresholds raise an alarm (as built)

- Thresholds are evaluated by the poller against real polled values
  (`server/services/poller.js`: `CPU_CRITICAL = 90`, `CPU_TROUBLE = 80`,
  `MEM_CRITICAL = 90`):
  - `cpu_pct > 90` → **Critical** alarm, source `cpu`; `80 < cpu_pct ≤
    90` → **Trouble**; `≤ 80` → resolve `cpu`.
  - `mem_used_pct > 90` → **Critical** alarm, source `mem`; `≤ 90` →
    resolve `mem`.
  - Device unreachable → `Down` (device status, §6.2).
- When a poll breaches a threshold, the poller creates **one** alarm
  record via `store.alarms.raiseAlarm`, deduped per
  `${deviceId}:${source}`: a continuing breach updates the existing
  alarm (last occurrence, count) instead of creating a new one every
  poll. Alarm toasts / WebSocket broadcasts fire only when a genuinely
  new alarm is created (or its severity escalates) — never on a timer.
- Severity set in use: Critical / Trouble / Attention / ServiceDown /
  Clear. No notification profiles are wired to thresholds in this build
  (notification settings are stored configuration, not an alerting
  engine).
- SNMP traps are a second, separate alarm *source* only in the sense
  that received traps are persisted (`traps` table) and listed via
  `GET /api/traps/list`; trap-to-alarm correlation is not implemented.

### 7.2 Acknowledge

- `POST /alarm/acknowledgeAlarm` (also `/api/alarm/acknowledgeAlarm`):
  store-backed; marks the alarm acknowledged, records **who**
  acknowledged it and **when**. `404` unknown id. (The old default to
  `administrator` when no user was supplied is gone — the session user
  is recorded.)

### 7.3 Clear

- An alarm **clears automatically** when the underlying condition
  recovers (value back under threshold, device reachable again) — the
  clear is recorded with the recovery time, and the alarm moves to
  history. Cleared alarms are **retained** as history (the old
  `db.clearAlarm()` that deleted the row outright is gone).
- A manual clear (`POST /alarm/clearAlarm`) marks the alarm cleared by
  the operator, with who/when recorded. `404` unknown id.
- **Delete vs. clear:** `POST /alarm/deleteAlarm` returns **501** — no
  delete in the store. Alarm notes (`addNotes`, `addRCANotes`) and RCA
  status changes return **501** — no notes table / no `rca_status`
  column. `GET /alarm/getRCANotes` honestly returns `{notes: []}`.
  `GET /alarm/getSuppressionCount` is computed from the store; suppression
  itself is not implemented, so the count is honestly 0.
- RCA: `GET /alarm/getRCAData` builds a hypothesis + correlation tree
  from the stored alarm and its latest metric, with
  `confidenceScore: null` / `confidencePercent: null` — no inference to
  score. Zia (`POST /api/zia/query`) is a rule-based data summary
  computed live from the store snapshot, labelled as a data summary, not
  an assistant; with no data it returns `{summary: 'No data to analyze
  yet.', confidence: null, recommendations: []}`.

### 7.4 What the Alarms view shows with no alarms

See §8 — an empty state, not sample alarms.

---

## 8. Empty states — what each section shows with no data

Rule: **no data → an honest empty state, never sample/filler content.**
Verified live by `verify-empty.sh` **16/16, exit 0** (re-run 2026-11-09
after the final restart, §9):

| Section | Empty state (verified) |
|---|---|
| Dashboard | 0 devices, 0 alarms, 0 probes. No charts with invented history; availability/performance widgets show "No data yet" (`avgAvailability` is `null` with no samples, never 100%). |
| Inventory → Devices | "No devices yet — add a device or run discovery." No rows. |
| Device detail (freshly added, unpolled) | Identity fields from discovery/add only; CPU / memory / disk / interfaces show "Not yet polled" (or "—"), not 0% and not random values. Availability graph: no points, "No data yet". |
| Alarms | "No alarms." Severity counts all 0. No sample alarm rows. |
| Probes | Only probes that actually registered. If none, "No probes registered." (The old seeded `Central-Probe-01` is gone.) |
| Agents | "No agents registered." |
| Discovery → History | "No discovery runs yet." |
| Reports | Reports over an empty store render empty tables/charts with "No data for the selected period", not 100% availability or demo rows. |
| Maps / NOC | No nodes, no invented links. |
| Logs | Log lines only for events that actually happened. `GET /logs/:file` serves a real log tail or 404s (§1.2). |

Full per-view empty-state copy (E-001…E-124) is specified in
`specs/empty-states.md`. Exact rendered copy per view was not
line-by-line verified against the UI in this pass — the API-level empty
states above were.

---

## 9. Verification evidence

All items below were verified on **2026-11-09 PKT** against the landed
`real-data` build. Harness: `~/workspace/opm-check/real-data/verify/`
(`verify-auth.sh`, `verify-empty.sh`, `verify-live.sh`,
`relay-snmp-probe.js`). Baseline (old fake server, ~08:15–08:30 PKT):
`verify-auth.sh` 4/11, `verify-empty.sh` 9/16 — the harness detects
fakeness; see `verify/baseline-results.md`.

### 9.1 Auth & empty state — re-run after the final restart: PASS

- **Final restart:** local server on `:8060`, **pid 46525**, banner
  **12.9.204-GA**. (Verified still running at finalisation: pid 46525,
  unauthenticated `GET /api/auth/session` → **401**.)
- `verify-auth.sh` — **11/11, exit 0.** Wrong password rejected;
  unknown user rejected; empty password rejected; `admin`/`admin` does
  not log in; no unauthenticated API or WebSocket access; real admin
  login succeeds and sets the `opm_session` cookie; logout invalidates
  the session (the same cookie then gets `authenticated: false`).
- `verify-empty.sh` — **16/16, exit 0.** Devices, alarms, alarm summary,
  reports summary/availability, probes (no seeded probe), credentials
  (empty), users (only the real admin), central (`dbType: SQLite
  (node:sqlite)`, no fake apiKey), DB info (real SQLite stats, 0
  records), licence (0 used), CCM configs (empty), discovery profiles +
  history (empty), dashboard summary (empty), notifications (empty).
- Local `:8060` server left **RUNNING** (pid 46525) with store state
  **devices 0 / alarms 0 / probes 0**.

### 9.2 Live SNMP ground truth — Techub LAN via relay (read-only)

- **Recon run 2026-11-09 ~08:12–08:13 PKT** (`verify/live-results.md`,
  `verify/live-results.json`, `recon/techub-switches-snmp.md`):
  **9/9 targets answered both ping and SNMPv2c `public`** — pfSense TH
  `192.168.30.1` plus all 8 Cisco switches (`.2` Core C3560, `.3`
  Ground, `.4` 1st, `.5` 2nd, `.6` 3rd, `.8` Basement, `.12` Camera,
  `.14` 4th C3750). RTTs ~295–300 ms from the relay (Tailscale path, not
  LAN latency). CPU 6–26%, memory 37–62% across the switches. pfSense
  returns `No Such Object` for the Cisco CPU/memory OIDs (expected).
- **Relay prep** (`recon/relay-prep.md`, ~08:23 PKT): relay Node
  v22.23.2 / npm 10.9.8, `net-snmp@3.29.2` installed and loading, live
  SNMP GET vs `192.168.30.2` OK (398 ms), ping 297 ms, plain Node
  `dgram` UDP send OK (no EPERM). The relay is the egress-capable host
  for live verification (§10.1).

### 9.3 Live poller verification — second run, 2026-11-09 ~09:25–09:35 PKT

Run on the relay (this VM's sandbox blocks UDP — §10.1), read-only SNMP
`public` + ICMP, against the two devices below. The relay test server
was stopped after verification.

**192.168.30.2 — Network-Core (WS-C3560-48PS), status Up, 0 alarms:**

| Check | Poller value | Independent ground truth | Match |
|---|---|---|---|
| `sysDescr` | Cisco IOS Software, C3560 Software (C3560-IPSERVICESK9-M), Version 12.2(58)SE1, RELEASE SOFTWARE (fc1) | Byte-identical string from `snmpget` | ✅ |
| `sysName` | `Techub-Core-Sw.techub.com.pk` | Same | ✅ |
| `sysObjectID` | `1.3.6.1.4.1.9.1.615` | Same | ✅ |
| `sysUpTime` (ticks) | `137,305,838`, grown consistently in-run (**+12,010 ticks over ~117 s** — a live, advancing counter, not a stored constant) | ~15 days 20 h uptime, consistent with the 08:20 ground truth (136,886,712) | ✅ |
| Interfaces | `interfacesCount` **42**, real names + live octet counters | `ifNumber` 42 from recon | ✅ |
| CPU / memory | CPU **7**, mem **37.6** | CPU 7%, mem 37.6% from recon | ✅ |
| RTT | **297 ms** | ~295 ms from recon | ✅ |

**192.168.30.1 — pfSense TH, status Up:**

| Check | Poller value | Ground truth |
|---|---|---|
| `sysDescr` | Exact: `pfSense Techub.home.arpa 2.7.2-RELEASE …` | Same |
| `sysName` | `Techub.home.arpa` | Same |
| `ifNumber` | **29** | 29 from recon |
| CPU / memory | Honest **nulls** (no Cisco OIDs on pfSense) | `No Such Object` from recon |

**Crash fix proven:** the relay server survived **4+ scheduled 60 s
cycles with no restart** after the §6.5 fix. The first run's crash is
recorded in §6.5, not hidden.

**Negative tests (same run):** `pollNow` against unreachable
`10.255.255.1` → honest **502**; unknown device id → **404**; the
server stayed up throughout. **Device-delete cascade proven live on
both the local and the relay server:** alarm count 1 → 0 on device
delete.

### 9.4 What was NOT live-verified (honest gaps)

- **Trap-receiver over-the-wire ingestion:** the receiver (UDP 162/514,
  BER parser, persisted rows) is implemented, but ingestion from a live
  host was **not proven** — this VM blocks UDP sends, and no live trap
  was sent to the relay receiver. Needs a live-host check (§10.4).
- **Discovery run against a real subnet end-to-end** (ICMP sweep +
  SNMP classification through the app's own endpoint) was not run as a
  separate live test in this pass; the discovery code path is the same
  ICMP + SNMP path proven live by the poller, but the run itself is
  unproven. Recorded as unproven, not claimed.
- **Agent register → telemetry → restart survival** was not live-tested
  end-to-end in this pass (code path verified by read; no agent was
  enrolled against the running server).
- **Threshold-breach alarm lifecycle** (breach → exactly one alarm →
  ack → recovery → cleared-in-history) was not live-triggered against a
  real device in this pass — no device breached a threshold during the
  live runs (all CPUs 6–26%, memory 37–62%). The evaluator code and
  dedup key are verified by read; the live raise/ack/clear cycle is
  unproven.
- **Forced-password-change enforcement on non-password routes** — see
  §2.2 caveat (API.md O-1).
- No `Math.random()` metric/discovery/alarm fabrication remains in
  `server/` (grep evidence; the only remaining mention is a comment in
  `server/services/poller.js:15` describing the removed 4 s random-walk
  cycle).

---

## 10. Known limits & open items

### 10.1 Deployment constraint — sandbox blocks live SNMP/ICMP here (not a code gap)

**Verified in this VM's sandbox: outbound UDP is blocked and raw-socket
ping is blocked (UDP send returns EPERM; `ping` returns "Operation not
permitted").** That means, in *this* sandbox, no process can send an
SNMP UDP packet to a device or issue an ICMP echo — regardless of how
correct the poller code is.

Consequences, stated honestly:

- **Live SNMP/ICMP polling cannot be verified from this VM.** It was
  verified on the relay hop instead (§9.2–§9.3), which is the designated
  polling host for verification. The relay test server was stopped after
  verification; the local `:8060` server (pid 46525) remains running but
  cannot poll from this sandbox — it fails honestly (EPERM) and shows
  devices as unpolled / unreachable, not as measured.
- This is a **deployment/environment constraint, not a code gap**. Do not
  "fix" it by simulating poll results in the sandbox; a simulated poll
  result would be the old fake build again.
- **In production the Central server must run on an egress-capable host**
  (or delegate all polling to remote probes/agents that have egress) —
  otherwise it can never poll anything directly.
- Poller timeouts must stay generous (≥ 5 s; relay RTTs ~300 ms over
  Tailscale).

### 10.2 Honestly empty / disabled by design (501s and empty views)

These are deliberate, documented refusals — not missing features that
were overlooked. Full per-endpoint list in `API.md` (22 × 501):

- **CCM config push / backup** (501 — no Central↔Probe delivery channel,
  no SSH/TFTP fetch path); drift resolution (501 — depends on push).
- **Workflow execution** (501 — no step executor).
- **Template mutations** (501 — no write store; reads are real).
- **Terminal-exec / WMI-query / CLI-query / MAC-resolve** (501 — no
  runner / no source).
- **SNMPv3 queries** (501 — v2c-only service).
- **SAML test, AD test, SSL test, mail test** (501 — no LDAP bind /
  SAML validation / certificate validation / SMTP delivery).
- **JVM heap** (501 — structurally impossible, permanently N/A: this is
  Node, not Java, so no JVM process exists and there is no JVM heap to
  resize; the V8 heap limit is set only at process start by
  `NODE_OPTIONS=--max-old-space-size=<MB>` — see `API.md` §23.6 and
  `DEPLOY.md` §1.3. The one 501 that cannot be made real.)
- **NetFlow / IPAM / Compliance / BGP / DPI / NDR / SD-WAN views** (no
  data source — honest empty states).
- **Users POST / DELETE in settings** (501 — belongs to the auth
  service).
- **Data retention:** not implemented — `dataRetentionDays` is stored
  but never enforced; UI says "Not configured" (§6.3).

### 10.3 Open items list (resolved vs still open)

| # | Item | Status |
|---|---|---|
| O-01 | Admin creation mechanism + initial credential delivery (§2.2) | **RESOLVED** — random 16-char bootstrap, `.admin-initial` mode 600, stdout print once (plaintext print found and removed, password rotated, logs truncated) |
| O-02 | Password hashing algorithm/parameters (§2.2) | **RESOLVED** — scrypt, random 16-byte salt, 64-byte key, constant-time verify |
| O-03 | Force-change enforcement mechanics + password rules (§2.2) | **PARTLY OPEN** — flag + change flow + session rotation built; new password ≥ 10 chars; **server-side enforcement on non-password routes unproven** (no guard found refusing flagged sessions) |
| O-04 | Session token format, transport, expiry, logout invalidation (§2.2) | **RESOLVED** — 32-byte random token, SHA-256 stored, HttpOnly `opm_session` cookie, 8 h TTL, server-side logout; verified by `verify-auth.sh` 11/11. `Secure` flag only when the request is HTTPS (plain-HTTP deployment — accepted, see security-review.md §2) |
| O-05 | Additional users / RBAC — single-admin or multi-user (§2.2) | **RESOLVED as single-admin** — users POST/DELETE are honest 501s |
| O-06 | Password-reset / account-recovery procedure (§2.2) | **OPEN** — no reset flow; recovery is direct store access |
| O-07 | Replacement for hardcoded CSRF cookie / REST API key / probe auth keys (§1.2) | **RESOLVED** — all six secret values 0 in the working tree incl. rebuilt binaries; `SameSite=Lax` cookie, `crypto.randomBytes` API keys stored hashed, per-probe/per-agent SHA-256-hashed keys |
| O-08 | Server bind address + TLS (§2.1) | **RESOLVED as plain HTTP on :8060, all interfaces** — no TLS listener; recorded, not hidden |
| O-09 | Start/stop scripts updated for SQLite (location, backup) (§2.1) | **PARTLY OPEN** — DB location (`server/data/opmanager.db`, `OPMANAGER_DB_PATH`) and `VACUUM INTO` backup are real; whether the root start/stop scripts were updated for the SQLite store was not verified |
| O-10 | SQLite file name/location, schema, migrations; fate of `db.json` (§6.3) | **RESOLVED** — `server/data/opmanager.db` (WAL), 18 tables; `db.json`/`seed.json`/`db.js` deleted, no migration |
| O-11 | Polling intervals — availability / performance / interface, per-template overrides (§6.1) | **RESOLVED** — 60 s from `poll_interval_seconds`; no per-template override |
| O-12 | Final OID table per category/template (§6.2) | **RESOLVED** — §6.2 table as implemented; full reference in `specs/snmp-oid-reference.md` |
| O-13 | SNMP timeout / retry / failure-counting policy (§6.2) | **PARTLY OPEN** — transport failure throws, failed polls recorded honestly, ≥ 5 s timeouts required; no separate retry/back-off policy documented |
| O-14 | Time-series retention + downsampling + purge (§6.3) | **RESOLVED as NOT implemented** — no pruning job; `dataRetentionDays` stored, never enforced; UI says "Not configured" |
| O-15 | SQLite backup / restore procedure (§6.3) | **RESOLVED (backup)** — real `VACUUM INTO` + SHA-256; restore procedure (copy the `.db` file back) not separately documented |
| O-16 | Default threshold set, severities, breach persistence, debounce, notification profiles (§7.1) | **RESOLVED** — CPU >90 Critical / >80 Trouble, mem >90 Critical, dedup per `${deviceId}:${source}`; no debounce / notification engine |
| O-17 | Threshold evaluator location; SNMP traps as an alarm source (§7.1) | **RESOLVED** — evaluator in the poller; traps persisted and listed, no trap-to-alarm correlation |
| O-18 | Alarm dedup key + re-arm rule (§7.1) | **RESOLVED** — dedup `${deviceId}:${source}`; re-arm on resolve |
| O-19 | Cleared-alarm retention (history) — confirm (§7.3) | **RESOLVED** — cleared alarms retained as history |
| O-20 | Probe heartbeat interval + silence-to-Down threshold; probe auth-key lifecycle (§5.1) | **PARTLY OPEN** — status from heartbeat freshness (Online/Stale/Offline), keys SHA-256-hashed and shown once; exact silence threshold value and re-key/revoke flows not separately verified |
| O-21 | Behaviour of a probe's devices/alarms while it is down; on probe delete (§5.1) | **OPEN** — not specified in the landed code |
| O-22 | Agent authentication (token/key issuance + revocation) (§5.2) | **PARTLY OPEN** — admin-issued one-time keys, hash-compared, self-registration refused (410); revocation flow not separately verified |
| O-23 | Agent silence threshold, staleness display, silence alarm (§5.2) | **PARTLY OPEN** — status from heartbeat freshness; silence-alarm and stale-display rules not specified |
| O-24 | Discovery scheduler, run-overrun/concurrency rules, re-classification of known devices (§4.3) | **PARTLY OPEN** — rules persisted, runs recorded; scheduler/overrun/re-classification rules not specified |
| O-25 | Discovery run-history retention (§4.3) | **OPEN** — no pruning job (see O-14) |
| O-26 | ICMP-only hosts: status label, auto-add vs. candidate list (§4.1) | **RESOLVED** — category `unknown`, `sysDescr: null`, added as a device row |
| O-27 | Device add: name auto-derivation, add-failure semantics, delete/unmanage semantics (§3) | **RESOLVED** — `sysName` stored from poll; `400` no IP / `409` duplicate; delete cascade-deletes alarms (§3.4) |
| O-28 | Credential storage protection at rest; v3 protocol support (§3.2) | **RESOLVED** — plaintext in SQLite at mode 600 (risk-accepted, v2c-unavoidable); v3 unsupported (501) |
| O-29 | Polling host for verification/production — relay hop vs. egress-capable host (§10.1) | **RESOLVED for verification (relay hop)** — production host decision still open |
| O-30 | Audit-item removal/replacement checklist, per item ID (§1.2) | **RESOLVED** — first audit 15 live markers, all fixed; final re-grep 0 live markers |
| O-31 | Exact empty-state copy per view (§8) | **PARTLY OPEN** — API-level empty states verified 16/16; per-view rendered copy (E-001…E-124 in `specs/empty-states.md`) not line-by-line verified against the UI |
| O-32 | Verification evidence (§9) | **RESOLVED** — §9 filled with the live evidence above |
| O-33 | **Scope note:** NCM, NetFlow, firewall-analyzer, OpUtils, ZIA, workflows, reports, and maps modules are outside the real-data rebuild brief as given. Their fake/stub items are catalogued in the audit but no real-data behaviour for them is specified here beyond the honest-empty / 501 treatment in §10.2 and `API.md`. If any of them is brought into real-data scope, its section must be written the same way — real behaviour or empty state, never simulated — before it is claimed as real. | OPEN (scope) |

### 10.4 Post-push hardening (NOT blocking, do NOT present as done)

These are known gaps to fix after push. None of them is claimed as
done anywhere in this document:

1. **Login brute-force protection** — rate-limiting / lockout / login
   audit. The security review's top gap (security-review.md §3). No
   throttling, lockout, or login-audit logging exists on
   `POST /api/auth/login` in the landed build.
2. **`.dmg` / `.msi` agent packages still bundle the pre-rebuild
   binary** — they cannot be rebuilt on this VM (need macOS/Windows
   packaging tools).
3. **Universal Mac binary replaced with single-arch amd64** — runs via
   Rosetta 2 on Apple Silicon; a true universal binary needs `lipo` on
   a Mac.
4. **SNMP communities stored plaintext in SQLite** — unavoidable for
   v2c; accepted only with DB file mode 600. Alternatives: AES-256-GCM
   at rest (key outside the DB), or SNMPv3 authPriv migration.
5. **Trap-receiver over-the-wire ingestion still unproven on a live
   host** (§9.4).
6. **Probe/agent key lifecycle gaps** (security-review.md §4–§5):
   re-key and revocation flows, per-key scopes, and API-key enforcement
   as a session alternative are unspecified/unverified in the landed
   build. API-key auth scope remains open (API.md O-2).
7. **`Secure` cookie flag only when the request is HTTPS** — the
   deployment is plain HTTP, so the session cookie travels in cleartext
   on the LAN (security-review.md §2). Accepted risk for a trusted-LAN
   deployment; serving over real HTTPS is the fix.

### 10.5 Things this document does not claim

- It does not claim the rebuild is complete in every module. §10.2 and
  §10.4 list what is honestly empty, refused, or still hardening. The
  501s are deliberate; the hardening items are open.
- It does not reproduce the official ManageEngine OpManager
  documentation. Where this build's behaviour differs from upstream
  OpManager (e.g. SQLite instead of PostgreSQL, single admin), this
  document describes *this* build.
- Version note: the UI identifies as OpManager Central **12.9.204-GA**.
  That is the version of the UI replica being rebuilt on; it is not a
  claim that this is official ManageEngine code.
- Live numbers in §9 are from the runs dated there. Device values
  (uptime ticks, CPU, memory) change as the devices run — re-poll for
  current values; do not quote the §9 numbers as current state.

---

*Document: `~/workspace/opm-check/real-data/REALDATA.md` — FINAL,
2026-11-09. Updated from the DRAFT skeleton to record the landed
real-data build and its verification evidence. No repo file was edited
to produce it; the local `:8060` server was not restarted.*

---

## 11. Phase-2 close-out (2026-11-09) — merge, re-proof, counts

Branch `real-data` was rebased fast-forward `097ba04 → 32a1861` (one ping.js
commit, `fix(ping): use correct -W units per platform`) and then merged with
all 15 phase-2 worker clones (gap-a, gap-bc, gap-d, gap-e, t501-ccm,
t501-misc, t501-settings, t501-tools, t501-workflows, trap-proof,
w2-deployfix, w2-discovery, w2-probes, w2-sessions, w2-thresholds;
t501-views had no changes). Overlapping files (`server/index.js` ×3,
`server/services/store.js` ×3, `server/services/poller.js` ×2,
`server/routes/settings.js` ×2, `client/js/app.js` ×3) were hand-merged;
every clone patch reverse-checks clean against the merged tree (the 5
reverse-check diffs are context-only, from the hand-merges and the close-out
fixes below — each hunk's content verified present by grep). One merge miss
was caught by the audit and fixed before commit: the w2-thresholds
`devices.js` endpoints (GET/PUT/DELETE `/api/devices/:id/thresholds`) had
not been applied; they are in the tree now and proven live.

**Re-proof results on the restarted shared server (:8060, final merged
tree):** `verify-auth.sh` 11/11; `verify-empty.sh` 16/16 on a fresh throwaway
DB and 8/8 on the live store (failures are real data only); Go agent `-test`
exit 0; login lockout 429 on the 5th bad login and on correct password during
lockout; must-change 403 → change → 200; mac-resolve `198.19.0.1` → 200 with
real MAC `da:c1:a4:cd:33:62`; WebSocket `INITIAL_STATE` + `METRIC_TICK` on
authenticated `/ws`, unauthenticated `/ws` and `/PNSHandler` refused 401;
alarm lifecycle on real poller-raised alarms (ids 4–12) active → acknowledged
→ cleared; threshold GET/PUT/DELETE cycle; trap receiver bound on UDP 162
after all worker servers were stopped by exact PID; graceful SIGTERM
checkpoints the WAL into `opmanager.db`. Full evidence in `API.md` §23.

**Route counts after the merge: 193 definitions — 164 REAL, 21
HONEST-EMPTY, 8 NOT-IMPLEMENTED (501), 0 FAKE** (per-file counts and the
501 triage table: `API.md` §23). The 8 remaining 501s: CCM push, CCM
backup-device, drift resolve, JVM heap size (permanently N/A — structurally
impossible: no JVM exists in this Node.js build, so there is no JVM heap to
resize; closest real equivalent is the `NODE_OPTIONS=--max-old-space-size`
startup flag, documented in `DEPLOY.md` §1.3 — see `API.md` §23.6; the
other seven 501s are implementable in principle), tools terminal-exec /
wmi-query / cli-query, workflows execute.

### 11.1 Known limitations (documented, not fixed)

- The bundled `opmanager-suite.js` hardcodes a `"Not Configured"` retention
  label in the UI; the API (`GET /api/settings/system` → `retention`) is
  truthful (`configured: false, status: 'Not configured', lastPurge: null`
  until a retention is set).
- Render free plan wipes `server/data` on redeploy.
- Live SNMP polling from this VM is blocked by the sandbox (EPERM) — real
  values need a UDP-capable host/relay (§10.1 still applies).
- The poller alarm-dedupe set is in-memory per instance: alarms raised
  before a restart will not auto-resolve after it.
- Template `apply` records assignments; nothing consumes them yet.
- AD test is reachability-only; SAML test validates config, not a login flow.
- `/api/json` dead-alias pattern: `server/index.js` strips the `/api/json`
  prefix before routing, so a `/api/json/*` path only works when its stripped
  form is also registered. Fixed for every path the UI calls; other route
  files may still carry unregistered `/api/json/*` aliases that 404.

## 12. Phase 3 + Phase 4 close-out (2026-11-09) — what was built, proven, and what is still missing

Phase 3 implemented SNMPv3, WMI/WinRM, MAC/ARP, SAML, AD/LDAP, HA
heartbeat, template write/apply, and NCM push (dry-run + human-review
gate) across 47 work tracks. Phase 4 reconciled them via 8 merge agents
(`p4m-docker`, `p4m-snmpv3`, `p4m-tpl-mac`, `p4m-ncm`, `p4m-winrm`,
`p4m-saml`, `p4m-ldap`, `p4m-ha` — one branch each on top of phase-2 tip
`ff51df6`, none pushed; per-area decisions and numbers in
`~/workspace/opm-p4/RECON.md` and `~/workspace/opm-p4/MERGE.md`) and this
close-out combined all 8 into the `real-data` branch of the close-out
clone (`~/workspace/opm-p4/closeout`). **Nothing was pushed.** The live
relay deploy still runs phase-2 code; this branch is not deployed
anywhere.

**Route counts after the close-out merge: 232 definitions — 210 REAL, 21
HONEST-EMPTY, 1 unconditional NOT-IMPLEMENTED (501), 0 FAKE** (per-file
counts and the full 501 triage: `API.md` §24). Phase 2's 8 unconditional
501s: 7 are now REAL (CCM push, CCM backup, drift resolve,
terminal-exec, wmi-query, cli-query, workflow execute); only the JVM
heap endpoint remains 501, permanently N/A — no JVM exists in this
Node.js build, so there is no JVM heap to resize; the 501 body carries
the exact reason and the V8 `--max-old-space-size` flag is the documented
equivalent (`API.md` §23.6). Never invent a JVM metric.

### 12.1 What each phase-3 area does now

- **SNMPv3** (`server/services/snmp.js`, `server/services/poller.js`):
  narrow canonical schema `md5`/`sha` + `des`/`aes`; single
  `createV3Session` / `snmpGetV3` / `snmpWalkV3` with a session-walk
  loop-guard; device `snmp` object `{ version, community, v3: { user,
  authProtocol, authPass, privProtocol, privPass } }` stored in
  `snmp_v3_*` columns, masked (`******`) in every API response. Poller
  resolves v3 per device. Limitation: single-DES privacy needs the
  OpenSSL legacy provider on Node 24 (§12.5); prefer AES.
- **WMI/WinRM** (`server/services/winrm.js` + `ntlm.js`): real WinRM
  SOAP + NTLMv2 (Basic only over HTTPS or explicit opt-in); SELECT-only
  WQL; credentials per call, never echoed, never stored. Runner
  (`server/services/runner.js`, `ssh2`): allow-listed local commands
  via `execFile` (shell:false) and exact SSH strings; anything else →
  403. Workflow executor: cli/ssh/wmi steps, admin-only, stops at first
  failure; wmi command steps run arbitrary shell on the target (admin-
  gated, documented in `docs/workflows.md`).
- **MAC/ARP** (`server/routes/tools.js`): multi-source host ARP
  (`ip neigh` / `arp -a` / `/proc/net/arp`) + stored + SNMP ARP tables,
  and FDB lookup (`dot1qTpFdbPort` first, `dot1dTpFdbPort` fallback) for
  MAC → switch port. Unresolvable → honest 404 with per-source results.
- **SAML** (`server/services/saml.js`, `server/routes/saml.js`): strict
  node-saml SP (signed request/response/assertion, audience/issuer,
  5-min skew, `validateInResponseTo` always, replay rejection,
  encrypted assertions supported; IdP-initiated SSO rejected). ACS is
  `/api/auth/saml/acs` everywhere. IdP metadata URL auto-fetched at
  load (10-min cache); settings `/test` persists parsed IdP values.
- **AD/LDAP** (`server/services/ldap.js`, `server/routes/ad.js`):
  canonical 835-line client (ldapjs ^3.0.7); users/groups search with
  free-text `q`, raw filter AND-combined and validated; real bind test
  (`ldapBindVerified`). Bind password is runtime-only, never stored.
- **HA** (`server/services/ha.js`, `server/routes/ha.js`): persisted
  peers, atomic lease, sticky promotion, fencing, audit log, decisions
  endpoint (`GET /api/ha/decisions`); heartbeat by peer secret
  (`X-HA-Peer-Secret`, env `OPM_HA_PEER_SECRET`, 503 fail-closed when
  unset). Status carries `evaluatedAt` + `self.uptimeSeconds` (added at
  close-out). Single node reports `single-node` / `standby`.
- **Templates** (`server/routes/settings.js`, poller): apply/unapply,
  per-field threshold fallback to template values, effective
  thresholds + poll interval persisted on the device and consumed by
  the poller. **Correction to §11.1:** template apply no longer
  "records assignments; nothing consumes them" — the poller consumes
  them (§12.1, this section).
- **NCM** (`server/services/ncm.js`, `server/routes/ncm.js`,
  `server/routes/ccm.js`, `server/routes/diff.js`): one canonical
  service, store key `settings.ncm`; stage → approve → dry-run execute
  only. Explicit `dryRun:false` → 422 `dry_run_only`. Real SSH backup
  (`show running-config` via `ssh2`; password auth only, single
  command, no host-key pinning). No live push exists in this phase;
  `NCM_EXECUTED` has no producer.
- **Docker / JVM docs:** `Dockerfile` is `node:24-alpine`,
  `package.json` engines `{"node": ">=24"}`; JVM heap permanently N/A
  with the V8 flag documented (`DEPLOY.md` §1.3, `README.md` §2).

### 12.2 Close-out verification evidence (all on throwaway servers, 2026-11-09)

- Close-out server on port 8170 (throwaway DB in
  `~/workspace/opm-p4/closeout-work/`; bootstrap password changed
  first via the API): `scripts/verify-auth.sh` **11/11**,
  `scripts/verify-empty.sh` **16/16**.
- `scripts/verify-p3.sh` (own throwaway server on port 8137):
  **10/11 outcomes PASS** — WMI no-host 400; SAML metadata 200 with
  the right entityID; AD bad-bind 401 + good-bind control 200; HA
  status `single-node`/`standby` with advancing `evaluatedAt`; template
  apply cpu_trouble=70 cpu_critical=90 mem_critical=95
  pollIntervalSec=60; NCM stage → approve → dry-run 200 + unapproved
  execute 409; terminal-exec `arp -n` 200 + disallowed 403s; JVM 501
  with the exact reason; verify-auth/empty re-run inside the harness.
  **The one failure, check 1 (SNMPv3 live query), is the sandbox, not
  the code:** this VM blocks outbound UDP (`send EPERM` to
  127.0.0.1:161), so no process here can complete a v3 query against
  the harness-started snmpd. The endpoint genuinely attempts the query
  (the 502 names the EPERM). The v3 code path is proven by the area
  harness instead: `scripts/test-snmpv3.js` **17/17 PASS** with
  `node --openssl-legacy-provider` (see §12.5) and
  `scripts/snmpv3-unit-check.js` ALL PASS.
- Harness fixes made at close-out (in `scripts/verify-p3.sh` itself):
  SAML metadata path `/api/saml/metadata` → canonical
  `/api/auth/saml/metadata`; HA status now accepts canonical
  `single-node`; JVM message match accepts the landed wording
  (`no JVM process exists`); check 10 now passes the env vars the
  phase-2 scripts actually read (`OPM_BASE_URL`, `OPM_REPO`,
  `OPM_ADMIN_PASSWORD`) instead of the wrong `OPM_BASE`, and matches
  the scripts' real output (`11 passed` / `16 passed`).
- Server fix at close-out: `GET /api/ha/status` now also returns
  `evaluatedAt` (ISO) and `self.uptimeSeconds` (real process uptime).
- Area proofs re-run at merge time (see `~/workspace/opm-p4/MERGE.md`):
  WinRM selftest 52/52; SAML selftest 33/33 + proof 16/16; LDAP local
  proof 16/16 + test-ldap 21/21; NCM unit 9/9 + drift 12/12 + backup
  26/26 + test-ncm 7/7; HA unit 22/22 + two-instance E2E (standby
  promoted, gap 15242 ms).
- `node --check`: every `server/**/*.js` file, `client/js/app.js`, and
  all 15 `client/js/p3/*.js` partials pass.
- Fake-data grep: **0** live `Math.random()` calls; **0** of the five
  old hardcoded secrets; **0** `admin/admin`. The only remaining
  hardcoded key material is H1 (§12.3).
- Merge conflicts resolved (all unions unless noted — see the merge
  commits): `server/services/poller.js` (persistEffectiveConfig +
  resolveSnmpConfig kept together); `server/services/store.js`
  (snmp_v3_* + applied_template/effective_* + ssh_credential_id/
  ssh_port migrations and columns, three hunks); `server/routes/
  tools.js` (FDB helpers + runner/WMI doc block kept together);
  `package.json` (union: `ldapjs ^3.0.7`, `@node-saml/node-saml`
  5.2.0 pinned, `@xmldom/xmldom` 0.9.12, `xml-crypto` 6.4.0,
  `xpath` 0.0.33, `fast-xml-parser ^5.12.0`, `ssh2 ^1.17.0`;
  lockfile regenerated with `npm install`, 114 packages);
  `server/index.js` (requires + mounts: ncmRoute + adRoute + haRoute +
  ha service, all before `ncmclientRoute`); `server/routes/settings.js`
  (wsEvents + ldapSvc requires). SAML collision decided:
  `saml-ui.js` and `settings-ui-saml.js` both register
  `renderSamlSettingsView`; `saml-ui.js` loads last so its fuller form
  wins. HA collision decided: `ha-ui.js` owns the `High Availability`
  sub-tab (status view); the settings form opens on demand from a
  button inside it. WinRM credential-storage hole found and fixed at
  merge time: `POST /api/workflows/create` stored password-bearing
  steps in `steps_json` and echoed them — now refused with 400, never
  stored (proof case 7 covers create + validate).

### 12.3 Security re-check (audit-prep H1, L1–L4 — close-out, live :8170)

- **L1 — FIXED by the phase-3 SNMPv3 merge** (response masking in
  `store.publicDevice`): v2c community and v3 auth/priv passphrases
  absent from device create, list, and single-device responses
  (re-proven live).
- **L2 — FIXED at close-out** (`settings.js` `publicCredential`):
  credential-library responses return `community: null` +
  `communityConfigured`. Verified live.
- **L3 — FIXED at close-out**: SAML settings responses return
  `spKey: null` + `spKeyConfigured`. The service reads the SP key from
  env/file only. Verified live.
- **L4 — FIXED at close-out**: SSL settings responses return
  `privateKey: null` + `privateKeyConfigured` (certificate kept — it
  is public key material). Verified live.
- **H1 — NOT fixed, deliberate.** `server/routes/agents.js`
  `serverInfoData` still serves, unauthenticated, `AuthKey:
  "ee-probe-101-central-key"` and `customerid:
  "OPM_ENTERPRISE_KEY_129203"` (same values in the static
  `client/OPMAgentServerInfo.json` and
  `client/downloads/OPMAgentServerInfo.json`); verified live
  (`GET /OPMAgentServerInfo.json` → 200 with both values). Not fixed
  because the Go agent's bootstrap flow reads this endpoint and the
  live relay's registered agents/probes cannot be checked from here —
  removing it could break live agent auth. Established: the constant
  is **not** accepted as a credential — `authenticateAgent` only
  accepts a key whose SHA-256 matches a stored `api_keys`
  (`agent:<id>`) or probe row, and no seed data exists. Fix plan: (1)
  on the relay, check whether any registered agent/probe key hash
  equals SHA-256 of `ee-probe-101-central-key`
  (`12d2e97939be5d0c1dc56fd4e80a024339cf01daf15d033e7166db7418ffd450`);
  (2) if none, strip `AuthKey`/`customerid` from `serverInfoData` and
  the two static JSON files and re-issue per-agent one-time keys via
  `POST /api/agents/register`; (3) if one matches, rotate that
  agent/probe to a fresh one-time key first, then strip. Residual
  code-level items (L5–L10) remain open.

### 12.4 UI wiring (close-out)

All 15 `client/js/p3/*.js` partials load in `client/noc.html` after
`app.js` and are wired in `client/js/app.js`. New sub-tabs: CCM
`Change Approvals`; Settings `High Availability`,
`SAML Single Sign-On`, `LDAP / Active Directory`, `AD Browser`,
`Device Templates`, `Tools Terminal`, `Workflow Runs`. Quick
Diagnostic Tools gains WMI Query + MAC Resolver buttons. The Add
Device modal gains SNMP v2c/v3 fields (`#devSnmpFields`, via
`Snmpv3UI`); the legacy credential-profile select is preserved as
fallback. Resolve Drift now stages via `NcmDrift` (202 pending
approval panel in `#diffApprovalPanel`) instead of claiming the drift
is resolved. The NCMEE dashboard appends the staged push-approval
queue (`OpManagerNcmPush`). The WebSocket `onmessage` handler
forwards frames to `OpmWsEvents` (TEMPLATE_APPLIED / NCM_* /
HA_STATUS / TRAP_RECEIVED / SYSLOG_RECEIVED). Every new branch has an
honest "UI not loaded" fallback when its partial failed to load.
`node --check` passes on `app.js` and all 15 partials; the app still
loads (login page 200 on :8170) and the new Settings sub-pages render
through their partials (proven by the live endpoint checks above;
a full browser click-through was not run in this pass).

### 12.5 Known limitation — SNMPv3 DES privacy needs the OpenSSL legacy provider

Node 24 bundles OpenSSL 3, where single-DES (`des-cbc`) is disabled
by default. MD5, SHA, AES-128-CBC and 3DES work without it. So
**SNMPv3 authPriv with `privProtocol: 'des'` fails on a stock Node 24
start** (`error:0308010C:digital envelope routines::unsupported`),
while `privProtocol: 'aes'` works out of the box. Proven:
`scripts/test-snmpv3.js` scores 15/17 without the flag and **17/17
with `node --openssl-legacy-provider`**. The server start was **not**
changed to enable the legacy provider — that re-enables legacy crypto
process-wide and needs an explicit operator decision. Until then:
prefer AES privacy on v3 devices; use DES only with
`NODE_OPTIONS=--openssl-legacy-provider`. See also
`docs/snmpv3-setup.md` and `API.md` §24.6.

### 12.6 Exact missing external pieces (nothing else is missing)

- **Live IdP** for SAML: IdP metadata URL/XML, public SP host,
  NameID/attributes, JIT choice, SP key pair if wanted.
- **Production AD bind account:** read-only service-account DN +
  password at runtime; confirm `ldap://192.168.22.5:389` vs
  `ldaps://:636`, baseDn/groupBase, group→role mapping.
- **SNMPv3 users on devices:** USM users with auth/priv passphrases
  configured on the polled devices.
- **WinRM-enabled Windows host + credentials** for a live WMI call.
- **Second node** for production HA (heartbeat + failover between two
  live nodes).
- **NCM live config transport:** real push does not exist by design in
  this phase — dry-run only; `NCM_EXECUTED` has no producer.
- ORTG/UniFi logins are **not** part of this build and are not missing
  pieces for it.
