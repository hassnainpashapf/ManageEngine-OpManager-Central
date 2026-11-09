# OpManager Central — Real-Data API Reference (FINAL)

> **Phase-2 close-out recount — 2026-11-09, after the merge onto `origin/real-data`
> `32a1861`.** Local branch `real-data` now holds the merged phase-2 tree (all 15
> worker clones merged; see `REALDATA.md` §11). Re-counted from the merged tree
> by the same method (`grep -cE 'router\\.(get|post|put|delete|patch|all)\\('`
> per file; every `status(501)` site read to its owning definition):
> **193 route definitions — 164 REAL, 21 HONEST-EMPTY, 8 NOT-IMPLEMENTED (501),
> 0 FAKE.** Plus `GET /logs/:file` (non-route, `server/index.js`) still REAL.
> Per file: agents 11 · alarms 17 · auth 5 · ccm 3 · devices 18 · diff 2 ·
> discovery 6 · hardware 1 · ncmclient 28 · probes 13 · racks 3 · reports 8 ·
> settings 58 · tools 11 · traps 2 · workflows 6 · zia 1 = **193**.
>
> **Phase 3 + Phase 4 close-out recount — 2026-11-09, merged tree (8 merge
> branches reconciled onto `ff51df6`, NOT pushed).** Re-counted from the
> merged tree by the same method (`grep -cE 'router\\.(get|post|put|delete|
> patch|all)\\('` per file; every `status(501)` site read to its owning
> definition): **232 route definitions — 210 REAL, 21 HONEST-EMPTY, 1
> unconditional NOT-IMPLEMENTED (501), 0 FAKE.** Per file: ad 2 · agents 11 ·
> alarms 17 · auth 5 · ccm 8 · devices 19 · diff 7 · discovery 6 · ha 9 ·
> hardware 1 · ncm 7 · ncmclient 28 · probes 13 · racks 3 · reports 8 ·
> saml 4 · settings 62 · tools 13 · traps 2 · workflows 6 · zia 1 = **232**
> (21 route files; ad/ha/ncm/saml are new). The 21 HONEST-EMPTY are
> unchanged from phase 2. Full detail in §24 below; the phase-2 tables in
> §§3–19 and the §23 triage are kept as the phase-2 record.
>
> **Phase-5 close-out recount — 2026-11-09, merged tree on branch
> `p4-exe-audit`, tip `a0f2af3` (NOT pushed).** Re-counted from the merged
> tree by the same method: **232 route definitions — 227 REAL, 4
> HONEST-EMPTY, 1 unconditional NOT-IMPLEMENTED (501), 0 FAKE.** No new
> route definitions were added in phase 5; 17 of the 21 HONEST-EMPTY
> became REAL (HE-1: `getUserNotification`, `getNewFeatures`; HE-2:
> virtualization + firewall-rules; HE-3a: 8 ncmclient routes; HE-3b: 4
> ncmclient routes; `getRCANotes` was already REAL on a stale claim).
> The 4 remaining HONEST-EMPTY are all in `ncmclient.js` (`getLayer2Maps`,
> both CVE severity routes, `getUpcomingEolDevices`) — each with the exact
> reason in its table row (§11). The one 501 is still `updateJvmHeapSize`
> (JVM heap, structurally impossible in a Node build). Full detail in §25
> below; the §24.5 H1 paragraph is corrected there too (the static key is
> no longer served unauthenticated — see §25.4).
>
> **What changed vs the phase-1 count (181 defs: 138 REAL, 21 HE, 22 501):**
> 14 former 501s are now REAL (alarms delete/addNotes/addRCANotes/changeRCAStatus;
> settings templates create/update/apply, mail test, users create/delete, AD test,
> SAML test, SSL test; tools mac-resolve) and 7 new REAL definitions were added
> (agents `/api/agents` + `/api/agent/list` split; workflows validate/get/list-runs;
> devices thresholds GET/PUT/DELETE; probes `testCentralConnection`). The 8
> remaining 501s are triaged below (§23). The per-route tables in §§3–19 still
> describe the phase-1 inventory; where a row's status changed it is marked
> **(phase-2: now REAL)** or noted in §23 — the counts above are authoritative.
>
> **Close-out fixes landed in the same tree (all proven live on :8060, see
> `REALDATA.md` §11):** probes sync-all route-ordering fix; alarms acknowledge/clear
> accept `{id}`; `DEPLOY.md` §6.3 backup now copies `.db` + `-wal`/`-shm` (or
> checkpoints first); dead `/api/json/*` aliases fixed for the paths the UI calls
> (alarms ack/clear/delete/addNotes, device add/pollNow, probe add) and the missing
> `POST /api/json/enterprise/testCentralConnection` implemented as a real
> ICMP/TCP probe link test. The `/api/json` prefix is stripped by the rewrite in
> `server/index.js` before routing, so a `/api/json/*` path only works when its
> stripped form is also registered — that is the mechanism behind the dead aliases.
>
> **Snapshot:** 2026-11-09, finalised after the last restart (local server pid
> 46525, banner 12.9.204-GA). Repo `~/workspace/opmanager-central-check`,
> branch `real-data`, base HEAD `a907772`; `origin/main` at `26e32bc`
> (rebase target at push time).
> Audit baseline: HEAD `a907772` (audit files in
> `~/workspace/opm-check/real-data/audit/`, dated 2026-11-09).
> **This document was re-counted and re-verified against the landed route
> files on 2026-11-09** (route-definition counts by `grep -cE
> 'router\.(get|post|put|delete|patch|all)\('` per file; `GET /logs/:file`,
> `tools.js` switch-ports, `session.js:235`, `snmp.js` Counter64/subtree
> fixes, version strings, and the six secret values re-checked by read).
> **Counts changed since the draft:** 180 → **181** route definitions
> (reports.js grew 7 → 8: `GET /api/dashboard/summary` was missing from the
> draft inventory). Status counts are now **138 REAL, 21 HONEST-EMPTY, 22
> NOT-IMPLEMENTED (501), 0 FAKE** in the route files, and the one FAKE
> endpoint outside the route files (`GET /logs/:file`) is now REAL — **0
> FAKE anywhere in the served app.**
>
> **Scope:** the 17 route files under `server/routes/` only. One non-route endpoint
> (`GET /logs/:file` in `server/index.js`) is documented in §20 because it was
> still fake in the draft. No repo file was edited and the server was not restarted
> for this finalisation. Live verification: `verify-auth.sh` 11/11 and
> `verify-empty.sh` 16/16, exit 0, re-run 2026-11-09 after the final restart;
> live SNMP poller verification vs real Techub devices on the relay — see
> `REALDATA.md` §9 and `verify/` in this directory.
>
> **Counting method:** one entry per `router.*()` call ("route definition"). A definition
> that mounts an array of paths (legacy `/alarm/...` + `/api/...` aliases) counts once;
> all its paths are listed. **181 route definitions** are documented.

## Status legend

| Tag | Meaning |
| --- | --- |
| **REAL** | Backed by the SQLite store, the poller, live SNMP/ICMP, or the host OS. Returns real rows/values; empty store → empty result, not invented data. |
| **HONEST-EMPTY** | Returns `[]`, `null`, `0`, or an all-null/zero object because there is genuinely no data or no engine behind it yet. Never an error, never invented values. |
| **501** | Honest refusal: `HTTP 501` with `error: 'not_implemented'` (or a `NOT_IMPLEMENTED` body). Nothing was done and nothing was fabricated. |
| **FAKE** | Still returns fabricated content (audit item not yet rebuilt). Only one such endpoint remains (§20). |
| **OPEN** | The audit says this was fake and the rebuild contract does not yet define its real behaviour, or a detail could not be verified from the code read. Listed in the OPEN register (§21) with what is unknown. |

Auth column values: **Session** = user session enforced by the global `apiAuthGuard`
(see §1); **Session (route)** = the route additionally carries its own `requireAuth`
middleware; **Agent key** / **Probe key** = per-agent / per-probe key check, no user
session; **Public** = no auth (only the three auth bootstrap endpoints).

## 1. Global auth model (`server/index.js` + `server/services/session.js`)

- **Sessions.** `POST /api/auth/login` issues a cryptographically random 32-byte token.
  Only its SHA-256 hash is stored (`sessions` table). The raw token is sent as an
  HttpOnly cookie `opm_session` (`SameSite=Lax`, `maxAge` = session TTL, `secure` only
  when the request itself is HTTPS) and is also accepted as `Authorization: Bearer <token>`.
  TTL **8 hours**; expired sessions are revoked. `requireAuth` → `401 {error:'unauthorized', authenticated:false}`, sets `req.user = {id, username, role}`.
  `requireRole` treats `admin` and `SuperAdmin` as equivalent; anything else → 403.
- **Global guard.** `apiAuthGuard` (mounted before all 17 routers) applies `requireAuth`
  to every `/api/*` and `/client/api/*` path and to the legacy prefixes
  `/admin/ /alarm/ /device/ /enterprise/ /fwaenterprise/ /maps/ /ncmclient/ /ncmcompliance/ /ncmconfig/ /ncmdashboard/ /ncmeol/ /ncmreports/ /nfaee/ /reports/ /tab/ /user/ /v2/ /dashboard/ /settings/ /support/`
  (legacy `/api/json/...` paths are normalised to `/api/...` first). **Most routes rely on
  this guard, not on per-route middleware.** `/settings/` and `/support/` joined the list
  with the A4SEC fix (ROUTING-1): their POSTs previously bypassed the guard entirely and
  died in ncmclient's fail-closed guard, 401ing even for a valid admin session.
- **Public (guard-exempt).** `POST /api/auth/login`, `POST /api/auth/setup`, and
  `GET /api/auth/session` (the last is guard-exempt but still carries route-level
  `requireAuth`, so it 401s without a session and reports its own status with one).
- **Key-auth exempt (no user session).** `POST /api/agent/register`, `POST /api/agent/telemetry`,
  `POST /api/agent/deregister`, `GET /api/agent/list`, and `GET /api/agent/serverinfo`. They
  authenticate with a per-agent key (`eeauthkey` or `x-agent-key` header, or the `authKey`
  body field; SHA-256 compared against the stored hash) or, for `list`/`serverinfo`, a console
  session instead. `GET /api/agent/serverinfo` additionally requires that key-or-session auth
  inside its handler (A4 G-27). Probe sync endpoints are **not** exempt — they are console
  operations behind the session guard.
- **Admin-only mutations (A4 G-03).** User management and admin-settings mutations carry
  route-level `requireRole('admin')` (same `ADMIN = [requireAuth, requireRole('admin')]`
  pattern as the NCM approval routes): `POST`/`DELETE /api/settings/users`, `POST
  /api/settings/auth/ad|ldap`, `POST /api/settings/auth/ad/test`, `POST /api/settings/auth/saml`,
  `POST /api/settings/auth/saml/test`, `POST /api/settings/mail` (+`/settings/saveMailServer`),
  `POST /api/settings/mail/test`, `POST /api/settings/proxy` (+test), `POST /api/settings/failover`
  (+test), `POST /api/settings/license/apply`, `POST /admin/regenerateAPIKey`,
  `POST /admin/updateJvmHeapSize`, `POST /api/settings/system|rebrand|ssl` (+ssl test),
  `POST /api/settings/ha` (+test), `POST /api/ha/failover/test`, `POST /api/agents/register`,
  probe add/delete. An authenticated Operator/Viewer gets `403 {error:'forbidden'}` on these;
  reads stay session-only.
  > Note: a comment in `server/index.js` still says agents.js "only reads authKey and never
  > validates it (audit A1)". That comment is **stale**: `agents.js` now hash-compares the
  > key (`authenticateAgent`). The comment needs updating, the behaviour is correct.
- **Unmapped API paths** return `404 {error:'not_found'}` (the old fake-success
  `{status:'success', result:[], rows:[]}` is gone).
- **No CORS middleware** — same-origin only. No hardcoded CSRF cookie, no hardcoded REST
  key, no seed auth key remain (audit auth.md items: hardcoded `admin`/`admin`,
  `OPM_CENTRAL_AUTH_TOKEN_77a82b9`, `OPM-CENTRAL-REST-API-KEY-928104-GA-129203`,
  `ee-central-auth-9a8c7b6d5e4f3a2b1c0d`, `OPM_EE_PROBE_SEC_KEY_1`,
  `OPM_EE_CENTRAL_ROOT_SECRET_2026` — all removed; the values are named here only as
  removed audit findings, never as usable credentials).
- **WebSocket.** Upgrade paths `/PNSHandler` and `/ws` only; token from the `opm_session`
  cookie or a `?token=` query parameter, re-validated by `requireAuth` (close 1008 if
  unauthenticated). `/PNSHandler` replies with `{itomUpdateWS:{wsId:'WS_OPM_CENTRAL_129203'}}`;
  `/ws` sends an `INITIAL_STATE` frame from live store data (see §20). Ping/pong: a
  client message of `-` or containing `ping` gets `{'-':'-'}` back.
- **Page guard.** `requireConsoleSession` on `/`, `/dashboard`, `/itom` redirects to
  `/login.html` when there is no session.
- **OPEN — O-1** (see §21): `must_change_password` is surfaced by login and
  stored on the user row, and the change flow rotates the session — but no
  guard in `server/index.js` was found refusing other endpoints for a
  flagged user, so server-side enforcement on non-password routes is
  **unproven**. O-2 (below) is still open: no route was seen accepting a
  stored API key as a session alternative.

## 2. Shared services (what "REAL" is backed by)

- **Store** — `server/services/store.js`, SQLite via `node:sqlite`, file
  `server/data/opmanager.db` (WAL; override `OPMANAGER_DB_PATH`). Tables: `users`,
  `sessions`, `devices`, `interfaces`, `metrics`, `alarms`, `probes`, `agents`,
  `credentials`, `discovery_runs`, `discovery_rules`, `configs`, `racks`, `workflows`,
  `workflow_runs`, `settings`, `audit_log`, `traps`, `api_keys`. Header rules: prepared
  statements only, real epoch-ms timestamps, **no seed/demo data, no random numbers**.
  Exports exist both as flat functions and as namespaces (`users`, `sessions`,
  `devices`, `interfaces`, `metrics`, `alarms`, `probes`, `agents`, `credentials`,
  `discovery`, `configs`, `racks`, `workflows`, `settings`, `audit`, `apiKeys`, `traps`) —
  verified live with `node -e "require('./server/services/store.js')"` (no server start).
  > Caution: header comments in `racks.js` and `hardware.js` claim the store exposes no
  > `racks`/`devices` namespaces. That is **stale** — the namespaces exist. The comments,
  > not the behaviour, are wrong.
- **Session/auth** — `server/services/session.js` (255 lines). Passwords
  `scrypt$<saltHex>$<hashHex>` (node:crypto scrypt, random 16-byte salt, 64-byte key,
  constant-time verify). `ensureFirstAdmin()` creates user `admin` only if the users
  table is empty, with a random 16-char base64url password printed once to stdout and
  written to `server/data/.admin-initial` (mode 600), flagged `must_change_password`.
  **Rotation incident, fixed during the build:** a plaintext print of the bootstrap
  password was found in the startup log; the print was removed (`session.js:235` now
  logs only that the file was written — verified by read), the password was rotated
  once, and the old logs were truncated.
- **Poller** — `server/services/poller.js` (571 lines). Real SNMP (net-snmp) + ICMP.
  Interval from store setting `poll_interval_seconds`, default **60 s**. Thresholds seen:
  CPU critical 90%, trouble 80% (`CPU_CRITICAL = 90`, `CPU_TROUBLE = 80`,
  `MEM_CRITICAL = 90`). Alarms raised once per `${deviceId}:${source}` via
  `store.alarms.raiseAlarm`. Device states: ping fail + SNMP fail → **Down**; ping ok +
  SNMP fail → **SNMP-ERROR**; both ok → **Up**, then threshold evaluation.
  `pollDeviceNow(deviceId)` exists (one real synchronous poll). **Live-bug fix,
  verified by read and by the relay run:** the first live poll crashed the server
  (unguarded Counter64 `readBigUInt64BE` on short buffers + unbounded `session.walk()`);
  `snmp.js` now left-pads Counter64 buffers and decodes never-throwing, walks use
  `session.subtree()` with a prefix guard, and the poller contains per-device failures.
  Relay server survived 4+ scheduled 60 s cycles after the fix (2026-11-09 ~09:25–09:35
  PKT; see `REALDATA.md` §9.3).
- **SNMP** — `server/services/snmp.js` (391 lines). net-snmp, **SNMPv2c only**; transport
  failure/timeout throws. `getSystemInfo`, `getCpuMem` (walks `cpmCPUTotal5minRev`
  `.1.3.6.1.4.1.9.9.109.1.1.1.1.8`, fallback `cpmCPUTotal5min` `.5`; memory from the
  `ciscoMemoryPoolName` row named `Processor`), `getInterfaces` (ifTable/ifXTable),
  `snmpGet`/`snmpWalk`. SNMPv3 is **not** supported anywhere (tools endpoints return 501
  for v3).
- **Ping** — `server/services/ping.js` (88 lines). `pingMs(ip)` via the system `ping`
  binary, returns ms or `null` on failure; `tcpConnectMs(ip, port)` fallback.
- **Trap receiver** — `server/services/trapReceiver.js` (343 lines). UDP 162 SNMP traps +
  UDP 514 syslog via `dgram`; parses trap varbinds; saves via `store.traps.saveTrap`.
  Ports overridable by `OPM_TRAP_PORT` / `OPM_SYSLOG_PORT`; a bind failure disables that
  receiver with a log line. Started on module load by `traps.js`. **Over-the-wire
  ingestion from a live host was NOT proven** — this VM blocks UDP sends, and no live
  trap was sent to the receiver; needs a live-host check (see `REALDATA.md` §9.4).
- **Empty-state baseline** (spec `empty-states.md`): a fresh install has 0 devices,
  0 alarms, **0 probes in the store**, 0 interfaces/agents/history. (The "Central
  Site Probe" in the UI is a client-side reference, not a stored probe row — the
  old seeded `Central-Probe-01` is gone; `verify-empty.sh` check 6 passes with no
  probe rows.) "No data yet" is a real empty store, not a demo dataset.

## 3. `server/routes/auth.js` — 5 definitions, all REAL

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `POST /api/auth/setup` | Public | `{username, password}` (password ≥ 10 chars) | `201 {ok:true, status:'success', user:{username, role:'admin'}}`; `403 {error:'setup already completed'}` if any user exists; `400` missing username / short password. Creates the first admin with `must_change_password: 0`. | **REAL** |
| `POST /api/auth/login` | Public | `{username, password}` | Sets `opm_session` cookie; `200 {ok:true, status:'success', user:{id,username,role}, mustChangePassword}`; `401 {error:'invalid credentials'}` (generic — never reveals whether the user exists). Calls `ensureFirstAdmin()` first; best-effort `last_login` stamp (ISO string). | **REAL** |
| `POST /api/auth/logout` | Session (guard) | — (cookie / Bearer) | Revokes the session server-side, clears the cookie; `{ok:true, status:'success', message:'Logged out successfully'}`. | **REAL** |
| `GET /api/auth/session` | Public guard-exempt, route `requireAuth` | — | `{authenticated:true, ok:true, user:{id,username,role}}`; `401` without a session. | **REAL** |
| `POST /api/auth/change-password` | Session (route) | `{currentPassword, newPassword}` (new ≥ 10 chars) | Verifies the current password (`401` on mismatch), sets the new scrypt hash, clears `must_change_password`, **rotates the session** (new token issued). | **REAL** |

## 4. `server/routes/agents.js` — 11 definitions, all REAL (phase-2: `GET /api/agent/list` split from `GET /api/agents` — key-authenticated; console alias stays session-only)

Agent keys: one-time key issued at registration, stored only as a SHA-256 hash under
`api_keys` with name `agent:<agentId>` (prior keys for that agent are rotated/deleted).
Agents present `eeauthkey` or `x-agent-key` header; compared with `timingSafeEqual`
against the stored hash. Unknown agent or bad key → `401`.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `POST /api/agents/register` | Admin session (route: `requireAuth` + `requireRole('admin')`) | `{agentId, hostname}` (both required) | `200 {status:'success', agent:{…}, authKey:<one-time key>, …}` — the key is shown **once**; prior keys for the agent are deleted first. `400` if `agentId`/`hostname` missing. Operator/Viewer → `403`. | **REAL** |
| `GET /OPMAgentServerInfo.json`, `/downloads/OPMAgentServerInfo.json`, `/agents/OPMAgentServerInfo.json`, `/api/agent/serverinfo`, `/agent/serverinfo`, `/servlets/AgentServerInfo` | Agent/probe key **or** console session (route) | — | Live Central identity derived at request time (primary host = server's first non-internal IPv4, port = listen port, probe = first registered probe or `null`, secondary = stored failover peer or empty, `customerid: null`). No static key is served. Unauthenticated → `401`. The static copies under `client/` and `client/downloads/` were removed with this fix. | **REAL** |
| `ALL /servlets/RegisterAgent`, `/servlets/AgentRegisterServlet` | Closed (refusal) | any | `410` — self-registration is disabled; agents must be registered by an admin via `POST /api/agents/register`. Nothing is registered and no device row is created. | **REAL** (deliberate refusal) |
| `ALL /servlets/DataAgentHandlerServlet`, `/servlets/StatusUpdateServlet` | Agent key (same gate as `/api/agent/telemetry`) | `{agentId, …metrics}` | `401` unknown agent / bad or missing key (nothing is created, nothing is marked Online). Known agent + valid key → `200 {ack:true}` and telemetry is recorded. | **REAL** |
| `POST /api/agent/register` | Key-auth exempt (guard) | any | `410` — self-registration is disabled; agents must be registered by an admin via `POST /api/agents/register`. | **REAL** (deliberate refusal) |
| `POST /api/agent/telemetry` | Agent key | `{agentId, …metrics}` (`cpu_pct`/`mem_pct`/`disk_pct`/`latency_ms`, etc.) | `401` unknown agent / bad key. Only fields actually sent are stored; absent fields keep their last real value or stay `null` — never invented. Agent status derived from heartbeat freshness. | **REAL** |
| `GET /api/agent/list`, `GET /api/agents` | Session (guard) | — | Stored agents (`agentView` rows) with `{totalAgents, activeAgents, …}`. Empty store → empty list. | **REAL** |
| `POST /api/agent/deregister` | Agent key | `{agentId}` | `401` unknown agent / bad key. Marks the agent Offline. | **REAL** |
| `GET /api/agent/downloads` | Session (guard) | — | Static list of agent installers, version `12.9.204-GA`, build `20261106`. | **REAL** (static reference) — **OPEN O-16**: the version was re-verified (12.9.204-GA in `agents.js:289`); whether the listed files actually exist on disk was not verified. |

## 5. `server/routes/alarms.js` — 17 definitions: all REAL (phase-2: the 4 former 501s are now REAL; phase-5 HE-1: `getRCANotes` now REAL — the `alarm_notes` store was already there, the table was stale)

List endpoint is `router.all` with 6 alias paths; filters `probeId`/`severity`/`status`;
real pagination (`page`, `pageSize` clamped 1–1000, default 200).

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `ALL /api/json/alarm/listAlarms`, `/api/alarms`, `/alarm/listAlarms`, `/api/alarm/listAlarms`, `/api/json/enterprise/listAlarms`, `/alarm/list` | Session (guard) | Query: `probeId`, `severity`, `status`, `page`, `pageSize` | `{page, total, totalPages, records, rows, alarms, result, …}` — the same page rows under three keys; severity counts; `acknowledgedUsers` (distinct `who` values on the page); `UnAcknowledge` count. All from the store. | **REAL** |
| `GET /alarm/alarmProperties`, `/api/alarm/alarmProperties` | Session (guard) | Query: alarm `id` | Stored alarm's properties. `400` no id; `404` unknown id — no fallback to the first alarm. | **REAL** |
| `POST /alarm/acknowledgeAlarm`, `/api/alarm/acknowledgeAlarm` | Session (guard) | `{id, …}` | Store-backed acknowledge; `404` unknown id. | **REAL** |
| `POST /alarm/clearAlarm`, `/api/alarm/clearAlarm` | Session (guard) | `{id, …}` | Store-backed clear; `404` unknown id. | **REAL** |
| `POST /alarm/deleteAlarm`, `/api/alarm/deleteAlarm` | Session (guard) | `{id}` | Store-backed delete (`store.alarms.deleteAlarm`); `404` unknown alarm. Accepts `{id}` as well as `{alarmId}`. | **REAL** (phase-2: was 501) |
| `POST /alarm/addNotes`, `/api/alarm/addNotes` | Session (guard) | `{id, note}` | Store-backed (`store.alarms.addNote`); `404` unknown alarm. | **REAL** (phase-2: was 501) |
| `GET /alarm/summary`, `/api/alarm/summary` | Session (guard) | — | Severity counts computed from the store. | **REAL** |
| `GET /alarm/getRCAData`, `/api/alarm/getRCAData` | Session (guard) | Query: alarm `id` | Hypothesis + correlation tree built from the stored alarm and its latest metric; `confidenceScore: null`, `confidencePercent: null` (no inference to score); `correlatedEvents` from related stored alarms. | **REAL** |
| `GET /alarm/getRCANotes`, `/api/alarm/getRCANotes` | Session (guard) | Query: alarm `id` | Stored notes from the `alarm_notes` table (`store.alarms.listNotes`, created_at order, author + text + timestamp); `[]` only when the alarm genuinely has no notes. `404` if the alarm id is unknown. Write path `POST /alarm/addRCANotes` already REAL (phase-2). | **REAL** (phase-5 HE-1: was HONEST-EMPTY on a stale claim — the notes table and both endpoints already existed; verified live on :8171: add → get round-trip, `[]` before any note, `404` unknown alarm) |
| `POST /alarm/addRCANotes`, `/api/alarm/addRCANotes` | Session (guard) | `{id, note}` | Store-backed RCA note (`store.alarms.addNote`); `404` unknown alarm. | **REAL** (phase-2: was 501) |
| `POST /alarm/changeRCAStatus`, `/api/alarm/changeRCAStatus` | Session (guard) | `{id, status}` | Persisted in `alarms.rca_status` (`store.alarms.setRcaStatus`); `404` unknown alarm. | **REAL** (phase-2: was 501) |
| `GET /alarm/getSuppressionCount`, `/api/alarm/getSuppressionCount` | Session (guard) | — | `{suppressedCount: 0, totalRawEvents: <alarm count>, noiseReductionPercent: 0% or null, activeProblems: <count>}` — computed from the store; suppression itself is not implemented, so the count is honestly 0. | **REAL** |
| `GET /alarm/getRCAIncidents`, `/api/alarm/getRCAIncidents` | Session (guard) | — | Derived incidents, one per device that has alarms. | **REAL** |
| `GET /api/alarms/nfa`, `/alarm/nfa` | Session (guard) | — | Module alarms for NetFlow Analyzer: same list shape as listAlarms, `{module:'NetFlow Analyzer', …}`, filtered by module. | **REAL** |
| `GET /api/alarms/ncm`, `/alarm/ncm` | Session (guard) | — | As above, module `Network Configuration Manager`. | **REAL** |
| `GET /api/alarms/fwa`, `/alarm/fwa` | Session (guard) | — | As above, module `Firewall Analyzer`. | **REAL** |
| `GET /api/alarms/oputils`, `/alarm/oputils` | Session (guard) | — | As above, module `OpUtils IPAM & SPM`. | **REAL** |

## 6. `server/routes/ccm.js` — 3 definitions: 1 REAL, 2 × 501

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/ccm/configs` | Session (guard) | — | Config rows from `store.configs`, grouped by `config_type`, with real `fetchedAt` and per-type device counts. | **REAL** |
| `POST /api/json/enterprise/pushCentralConfig`, `/api/ccm/push` | Session (guard) | `{configurationType, targetProbeId?}` | `400` no `configurationType`; `404` if that config type is not in the store, or the named target probe does not exist; otherwise `202` — stages a push approval (`approvalId`); response carries `dryRun: true, sent: false, sentToDevice: false, pushedAt: null` — nothing has been sent to any probe or device. Approve/reject/execute on the staged approval are admin-only. No live delivery channel exists. | **REAL** (staging) — delivery still **OPEN O-3** |
| `POST /api/ccm/backup-device`, `/api/ccm/backup` | Session (guard) | `{deviceId}` | `400` no `deviceId`; `404` unknown device (with null `deviceName`/`ip`/`revision`/`backupTime`/`complianceStatus`/`linesCount`/`fileSize`); known device → `501` — no SSH/TFTP/SNMP config retrieval path exists, so no configuration was fetched and no backup was written. | **501** — **OPEN O-4** |

## 7. `server/routes/devices.js` — 18 definitions: 18 REAL (phase-5 HE-2: virtualization + firewall-rules now REAL, derived from stored data)

Availability definition (verified in code): one metric row = one real poll attempt;
`response_ms` non-null = up, null = down. Hourly buckets over 24 h; buckets with no
recorded polls report `null` — absence of history is not evidence of 100% uptime.
`overallAvailability` is `null` when there are no samples at all.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/json/device/listDevices`, `/api/devices` | Session (guard) | Query: `probeId`, `category`, `status`, `search` | Stored devices matching the filters. | **REAL** |
| `GET /api/json/device/getDeviceSummary`, `/api/devices/:id/summary`; `GET /api/json/device/getDeviceDetails`, `/api/devices/:id` | Session (guard) | Query/path: device id | Stored device + 24 h availability (see definition above). `404` unknown device. | **REAL** |
| `GET /api/json/device/listInterfaces`, `/api/devices/:id/interfaces` | Session (guard) | Query/path: device id | Stored interface rows only; fields unknown for a device are `null` — never invented. | **REAL** |
| `GET /api/json/device/getPingResponse`, `/api/devices/:id/ping` | Session (guard) | Query/path: device id | Real ICMP ping, 4 attempts via the ping service. | **REAL** |
| `POST /device/testCredential`, `/api/json/device/testCredential` | Session (guard) | `{ip?, community?, deviceId?, credentialType?, username?}` | Real SNMP GET (`snmp.getSystemInfo`); falls back to the device's stored community. Success: `{status:'success', result:'SUCCESS', latencyMs, sysDescr, sysName}`. Failure (no response / no community): `{status:'success', result:'FAILURE', message, latencyMs}` — note the HTTP 200 with `result:'FAILURE'`; `400` only when no target IP can be determined at all. | **REAL** |
| `POST /device/setManaged`, `/api/json/device/setManaged` | Session (guard) | `{deviceId, managed}` | Persists the `managed` flag via `store.updateDevice`; returns the stored state. | **REAL** |
| `GET /api/json/device/getAvailabilityGraphData`, `/api/devices/:id/availability` | Session (guard) | Query/path: device id | 24 h hourly availability history from stored metrics (`{timestamp, availability, downtimeMinutes, samples}` per bucket; `null` when a bucket has no polls). | **REAL** |
| `GET /api/json/device/getPerformanceMonitorDetails`, `/api/devices/:id/performance` | Session (guard) | Query/path: device id | Latest stored metric for the device. | **REAL** |
| `POST /api/json/device/addDevice`, `/api/devices` | Session (guard) | `{ip, …}` (IP required) | `400` no IP; `409` duplicate IP; otherwise creates the stored device row. SNMP version (flat `snmpVersion`/`version` or canonical `snmp.version`) is normalised through the canonical map (`'2c'`/`'2'`/`'V2C'` → `'v2c'`, `'3'` → `'v3'`); anything else, incl. `'v1'`, is a `400`, never stored verbatim. `credential`/`credentialId`/`credentialProfileId` resolves a credential-library profile server-side (unknown profile → `400`): a v2c profile fills version + community, a v3 profile fills version + v3 user; explicit request values win over the profile. (W2-2, live-proven on PORT=8182.) | **REAL** |
| `POST /api/json/device/deleteDevice`, `/api/devices/:id/delete` | Session (guard) | `{deviceId}` / path id | `404` unknown device; otherwise deletes the row (cascades to its interfaces/metrics/alarms per the store — `store.js` `deleteDevice` deletes the device's alarms in the same transaction; added as a fix during verification). Cascade proven live on local + relay (alarm 1→0 on device delete, 2026-11-09). | **REAL** |
| `POST /api/json/device/pollNow`, `/api/devices/:id/poll-now` | Session (guard) | `{deviceId}` / path id | `404` unknown device; otherwise runs `poller.pollDeviceNow(deviceId)` synchronously and returns `{status:'success', message, device:<refreshed row>, poll:<poller result>, polledAt}`; poll failure → `502` with the same shape. | **REAL** |
| `GET /api/json/device/testMonitors`, `/api/devices/:id/test-monitors` | Session (guard) | Query/path: device id | Every monitor runs a real check: ICMP Ping Echo (real RTT), SNMP `sysDescr`, `hrProcessorLoad`, `hrStorageUsed`, `ifOperStatus` (real SNMP GETs, `Success`/`Failed` with measured RTT and real values). CISCO-ENVMON temperature reports `Unknown` with `null` value — no temperature source exists in the SNMP service, so the old invented 34 °C is gone. No community → the four SNMP monitors report `Failed` with the reason. | **REAL** |
| `GET /api/json/device/categories` | Session (guard) | — | Device counts per category from the store; devices with no category count under `Uncategorized`. | **REAL** |
| `GET /api/inventory/virtualization` | Session (guard) | Query: `type` (`all`/vmware/hyperv/kvm/proxmox/nutanix/xen), `probeId` | Hypervisor hosts derived from stored device identity (sysObjectID enterprise 6876 = VMware, or sysDescr/vendor keywords for Hyper-V/KVM/Proxmox/Nutanix/Xen): `{hosts:[{id, deviceId, ip, hostname, type, vendor, sysObjectId, sysDescr, status, probeId, vmCount:0, vms:[]}], hostsCount, total, vmsCount:0, vms:[], summary:{totalHosts, totalVMs:0, totalVCPUs:0, totalMemoryTB:0, hypervisors:{…}}, source, reason}`. LIMIT (honest): guest VMs are never enumerated — the poller polls no VM MIB table (no vmwVmTable, Hyper-V MIB, or hrSWRun guest data), so every host reports `vms:[]` and `totalVMs/totalVCPUs/totalMemoryTB` stay 0. With no hypervisor host in the store the endpoint returns the honest empty with `reason: 'No virtualization host in the device store: no discovered device has a VMware/Hyper-V/KVM/Proxmox/Nutanix/Xen sysObjectID, sysDescr, or vendor. Guest VMs are never enumerated — the poller collects no VM MIB tables (no vmwVmTable, Hyper-V MIB, or hrSWRun guest data), so per-host VM lists are empty even when a host is present.'` Proven live on PORT=8172 with clearly-marked TEST rows in a local test DB only (ESXi host via OID 6876 + Hyper-V host via sysDescr both appeared; `type=vmware` filtered to 1; rows removed after, endpoints back to honest-empty). | **REAL** |
| `GET /api/inventory/firewall-rules` | Session (guard) | — | Firewall rules parsed from stored NCM running configs (configs table, latest running config per device — same source as the CCM diff): Cisco IOS `access-list <id\|name> <permit\|deny> …` + `ip access-list [extended\|standard] <name>` blocks, and pfSense config.xml `<rule>` blocks. Every rule carries its verbatim `raw` source line plus `{deviceId, deviceIp, deviceName, configType, configId, fetchedAt, acl, action, protocol, sourceAddress, destinationAddress, options, description}`. Response adds `configsParsed`, `devicesWithConfigs`, `source`, `reason`. With no stored config: honest empty with `reason: 'No device configuration is stored in the NCM store (configs table is empty) — no firewall rule can be derived. Fetch a running config first (NCM backup).'`; with configs but no parseable rule: `'<N> stored config(s) from <M> device(s) were parsed; none contains a parseable firewall rule (Cisco access-list or pfSense <rule> block).'` Proven live on PORT=8172 with clearly-marked TEST rows in a local test DB only (7 rules: 5 Cisco + 2 pfSense; a rule-less config contributed 0; rows removed after, endpoint back to honest-empty). | **REAL** |

## 8. `server/routes/diff.js` — 2 definitions: 1 REAL, 1 × 501

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/ccm/diff` | Session (guard) | Query: `deviceId` | Real line diff of the device's stored running vs startup configs (`RUNNING_TYPES = ['running','running-config']`, `STARTUP_TYPES = ['startup','startup-config']`; `{runningConfig, startupConfig, addedLinesCount, removedLinesCount, hasDrift, …}`). If a side is missing (or no device), an "insufficient result" shape is returned instead of an invented diff. | **REAL** |
| `POST /api/ccm/resolve-drift` | Session (guard) | `{deviceId, …}` | `501` — no config push path exists. | **501** — **OPEN O-5** |

## 9. `server/routes/discovery.js` — 6 definitions, all REAL

Discovery is a real ICMP sweep + SNMP `sysDescr`/`sysObjectID` lookup (SNMPv2c
or SNMPv3 — any other version → `400`). A host that answers ping but not SNMP is discovered as
category `unknown` with `sysDescr: null`. The credential profile chosen in
the form is sent as `credentialId` and resolved server-side
(`devices.resolveCredentialProfile`): a v2c profile supplies its community
and the sweep uses `getSystemInfo`, a v3 profile supplies its USM user and
the sweep uses `getSystemInfoV3`; the version spelling itself goes through
the canonical map (`snmp.normalizeSnmpVersion` — no second normalizer).
An explicit `snmpVersion` wins over the profile's version; with neither,
the version defaults to `v2c`. Unknown profiles, non-SNMP profiles
(WMI/SSH/Telnet) and unsupported versions (incl. v1) are `400`s. The
community used is
`body.community || body.snmpCommunity || profile.community || defaultCommunity() || 'public'`, where
`defaultCommunity()` reads the stored setting `discovery.defaultCommunity`.
A community / v3 user is stored on the device row only once it has proven to work (SNMP answered
with it); a failed credential is never recorded. Discovered devices store
the resolved version, never a hard-coded `'v2c'`. `runId = DISC-<epoch-ms>`.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/discovery/profiles` | Session (guard) | — | Discovery profiles (= stored rules). | **REAL** |
| `GET /api/discovery/rules` | Session (guard) | — | Stored discovery rules. | **REAL** |
| `POST /api/discovery/rules` | Session (guard) | `{range, probe_id, schedule, …}` | `201`; stores only the submitted `range`/`probe_id`/`schedule`. The probe must exist (foreign key). | **REAL** |
| `DELETE /api/discovery/rules/:id` | Session (guard) | Path id | `400` bad id; `404` unknown rule; otherwise deletes the stored rule. | **REAL** |
| `GET /api/discovery/history` | Session (guard) | — | `store.listDiscoveryRuns()` — real past runs; empty store → `[]`. | **REAL** |
| `POST /api/discovery/run` | Session (guard) | `{range?, community?, snmpCommunity?, probeId?, credentialId?, snmpVersion?}` | `202 {runId:'DISC-<epoch>', snmpVersion:<resolved 'v2c'\|'v3'>, credentialProfile:<name\|null>, …}` — the sweep runs (ICMP + SNMP per host, discovered hosts are created as real device rows). `400` on unknown credential profile, non-SNMP profile, or unsupported version (incl. v1). Live-proven on PORT=8182 (W2-2): credential-profile runs return 202 with the resolved version; 5 runs on 127.0.0.1 completed with `found_count: 0` (nothing answers there — ICMP blocked, no SNMP agent). | **REAL** — **OPEN O-15**: no settings/UI surface for `discovery.defaultCommunity` was verified. |

## 10. `server/routes/hardware.js` — 1 definition, REAL

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/hardware/details` | Session (guard) | Query: `deviceId` or `ip` | Looks the device up by id or IP; then live SNMP: ENTITY-MIB (chassis / PSUs / fans / CPUs), ENTITY-SENSOR-MIB (fan RPM, temperatures with thresholds and EnvMon state), HOST-RESOURCES storage (RAM/flash, with a `ciscoMemoryPool` fallback). Response includes `deviceName`, `vendor`, `category`, `model`, `serialNumber`, `systemOid`, PSU/fan/temperature lists and RAM/flash totals; any field with no source is `null` — including `macAddress: null` (no MAC source in the store or ENTITY-MIB; not invented). `404` unknown device; `502` SNMP failure; `503` if the SNMP service cannot be loaded. | **REAL** — **OPEN O-6** (MAC source) |

## 11. `server/routes/ncmclient.js` — 28 definitions: 24 REAL, 4 HONEST-EMPTY

Each row below lists its real path aliases: the bare legacy prefix
(which varies per row — `/ncmclient/`, `/admin/`, `/dashboard/`, `/tab/`,
`/maps/`, `/v2/admin/`, `/device/`, `/user/`, `/ncmdashboard/`,
`/ncmreports/`, `/ncmcompliance/`, `/ncmconfig/`, `/ncmeol/`), plus the
`/api/...` form, plus the `/api/json/...` form (registered directly on the
router, or reachable through the `/api/json/` rewrite in `server/index.js`
where the router registers only bare + `/api/`).
`getClientServiceData` builds `userMeta` from the caller's real session user
(`buildUserMeta(req)`; `permissionsForRole(role)`; `isSuperAdmin` only when
`role === 'SuperAdmin'`; `superAdminPasswordChanged: false` when the user's
`mustChangePassword === 1`, else `null`; `sessionTimeout` from the stored setting)
and `productMeta`/`licenseMeta`/`rebrandMeta`/`mspMeta` as `null` where there is no
licence/rebrand data. Probe up/down in the dashboard data comes from real heartbeat
freshness. The 5-category device taxonomy is static reference data (audit-accepted).
**OPEN O-20**: the full `userMeta`/`productMeta` field list was only partially captured
in this draft and needs a final read.
**HE-3a (2026-11-09)**: 8 of the 9 remaining HONEST-EMPTY routes in this section
are now REAL (see rows below); only `getLayer2Maps` stays empty, with its reason.
Two supporting fixes landed with them: (1) `permissionsForRole` now treats role
`'admin'` as full-access, matching `server/services/session.js` ("'admin' and
'SuperAdmin' are treated as the same administrative role") — without it the
seeded bootstrap admin got zero permissions here while `requireRole('admin')`
elsewhere treated it as admin; (2) the classic-module page redirect in
`server/index.js` (`/NCM*` etc.) matched those words anywhere in the path, so
every `/api/json/ncmclient/...`, `/api/json/maps/...` and `/api/json/ncm*...`
call 302'd to the SPA shell — API paths now fall through to the routers, and
genuine page routes (`/NCM`, `/Maps`) still redirect. New shared service
`server/services/consoleMessages.js` (settings-JSON store, capped at 200) is
fed only by real alarms via a hook in `store.alarms.raiseAlarm()`.
Dashboards, custom views, floors and logical groups persist as JSON arrays
under settings keys (same convention as `racks.js` `rack_assignments`); their
create paths are session-guarded and need the module's write permission
(`dashboardWrite` / `inventoryWrite`), so Operator (read-only) gets 403.

| Method + path | Auth | Response | Status |
| --- | --- | --- | --- |
| `GET /ncmclient/getClientServiceData`, `/api/ncmclient/getClientServiceData`, `/api/json/ncmclient/getClientServiceData` | Session (guard) | `{userMeta:{…real user/role/permissions…}, productMeta, licenseMeta:null, rebrandMeta:null, mspMeta:null, …}` — probe status from heartbeat. | **REAL** |
| `GET /ncmclient/getMainMenuTabs`, `/api/ncmclient/getMainMenuTabs`, `/api/json/ncmclient/getMainMenuTabs` | Session (guard) | Tabs built from the real modules in this app and the caller's actual permissions — a tab appears only when the caller may read that module (Dashboard, Inventory, Alarms, … with sub-menu items only where the backing feature exists, e.g. no Automation tab without a configlet store). A role with no read permissions gets `[]`. | **REAL** |
| `GET /ncmclient/getUserPreference`, `/api/ncmclient/getUserPreference`, `/api/json/ncmclient/getUserPreference` | Session (guard) | Static defaults `{DGroupNewView:false, theme:'itom-grey-text-theme'}` — no per-user preference store exists. | **REAL** (static) |
| `GET /dashboard/getDashboardList`, `/api/dashboard/getDashboardList`, `/api/json/dashboard/getDashboardList`, `/v2/dashboard/getDashboardList`, `/api/v2/dashboard/getDashboardList`, `/api/json/v2/dashboard/getDashboardList` | Session (guard) | Array of dashboards, each with `Name` (the shape the real client consumes: it reads `dash.Name`). 2 derived defaults — `Overview` (devices / alarms / probes / config-conflict widgets, each pointing at a real endpoint in this repo) and `Network Configuration` (real NCM status endpoints) — filtered by the caller's read permissions, plus stored custom dashboards from `POST /api/json/ncmclient/createDashboard` (custom widgets must point at a real endpoint from the allowlist, else 400). | **REAL** (HE-3a) |
| `GET /admin/getAccessibilityControls`, `/api/admin/getAccessibilityControls`, `/api/json/admin/getAccessibilityControls` | Session (guard) | Static accessibility control set. | **REAL** (static) |
| `GET /admin/getMessagesForPage`, `/api/admin/getMessagesForPage`, `/api/json/admin/getMessagesForPage` | Session (guard) | Keyed by `?pageName=` (the shape the real client consumes: `response[pageName].messages.ALERT` / `.NEW`), each page's messages grouped `ALERT` / `NEW` / `INFO`. Store starts empty; entries are recorded only by real console events — currently every alarm raised through `store.alarms.raiseAlarm()` (title/message from the alarm's own fields). No pageName returns every page with stored messages, keyed the same way. | **REAL** (HE-3a) |
| `GET /admin/listCustomViews`, `/api/admin/listCustomViews`, `/api/json/admin/listCustomViews` | Session (guard) | `{views:[...]}` — only views actually created via `POST /api/json/ncmclient/createCustomView`; `deviceCount` computed live from stored devices matching the view's criteria; `?type=` filters. Empty only when none exist. | **REAL** (HE-3a) |
| `GET /dashboard/listCCTVView`, `/api/dashboard/listCCTVView`, `/api/json/dashboard/listCCTVView` | Session (guard) | Devices from the stored inventory whose category names a camera/NVR (`camera`/`cctv`/`nvr`/`dvr`) or whose sysDescr mentions a camera. `[]` when no such device exists. | **REAL** (HE-3a) |
| `GET /tab/getTabViewDetails`, `/api/tab/getTabViewDetails`, `/api/json/tab/getTabViewDetails` | Session (guard) | `{bvDetails:{List:[...]}}` — stored custom views for `?tabName=` plus, for `inventory`, one live entry per device category actually present (real counts). `virtualInventory` additionally returns `bySeverity` from real alarms and `byVirtualType:[]` (no virtualization inventory is collected). | **REAL** (HE-3a) |
| `GET /maps/listFloors`, `/api/maps/listFloors`, `/api/json/maps/listFloors` | Session (guard) | Only floors actually created via `POST /api/json/ncmclient/createFloor` (rackIds validated against real racks; `rackCount` computed live from racks that still exist). Empty only when none exist. | **REAL** (HE-3a) |
| `GET /maps/listRacks`, `/api/maps/listRacks`, `/api/json/maps/listRacks` | Session (guard) | Real racks from the store (see §13). | **REAL** |
| `GET /maps/getLayer2Maps`, `/api/maps/getLayer2Maps`, `/api/json/maps/getLayer2Maps` | Session (guard) | `[]` — STAYS EMPTY: no LLDP/CDP neighbor collection and no MAC/ARP table collection from managed devices exists anywhere in this codebase (the poller collects interface counters and availability only). The MAC resolver in `server/routes/tools.js` reads this host's own kernel neighbor table, not managed-device topology, so using it would be invented data. | **HONEST-EMPTY** (HE-3a, reason confirmed) |
| `GET /v2/admin/getSecurityScore`, `/api/v2/admin/getSecurityScore`, `/api/json/v2/admin/getSecurityScore` | Session (guard) | REAL score from stored data: `score = max(0, 100 − alarmDeduction − complianceDeduction)` over open (active/acknowledged) alarms by severity and compliance verdicts; `grade` A–F, `status` Good/Fair/At Risk, full `details` breakdown. `null` with a reason when no devices are monitored. Formula + caps: HE-3b note below. | **REAL** (HE-3b, Phase 5) |
| `GET /admin/getWebAlarmSoundFiles`, `/api/admin/getWebAlarmSoundFiles`, `/api/json/admin/getWebAlarmSoundFiles` | Session (guard) | `[{fileName, filePath}]` — the `client/apiclient/fluidicv2/sounds` directory shipped with the client is read at runtime and every audio file in it is listed (currently `webalarm.mp3`). `[]` only if the directory holds no audio files. | **REAL** (HE-3a) |
| `GET /device/listCustomFields`, `/api/device/listCustomFields`, `/api/json/device/listCustomFields` | Session (guard) | Static labels (site / rack / owner). | **REAL** (static) |
| `GET /ncmclient/getNCMInvFilters`, `/api/ncmclient/getNCMInvFilters`, `/api/json/ncmclient/getNCMInvFilters` | Session (guard) | Static default inventory filters. | **REAL** (static) |
| `GET /device/getDeviceCategories`, `/api/device/getDeviceCategories`, `/api/json/device/getDeviceCategories` | Session (guard) | Static 5-category taxonomy (audit-accepted reference data). | **REAL** (static) |
| `GET /admin/listAllLogicalGroups`, `/api/admin/listAllLogicalGroups`, `/api/json/admin/listAllLogicalGroups` | Session (guard) | Only groups actually created via `POST /api/json/ncmclient/createLogicalGroup` (deviceIds validated against real devices; `deviceCount` computed live from devices that still exist). Empty only when none exist. | **REAL** (HE-3a) |
| `GET /user/getDeviceGroupViewPreference`, `/api/json/user/getDeviceGroupViewPreference` | Session (guard) | `{preference:'tree'}` (static default). No `/api/user/...` alias is registered (only bare + `/api/json/...`); adding one is out of scope for W2-5. | **REAL** (static) |
| `GET /ncmdashboard/getConfigConflictStatus`, `/api/ncmdashboard/getConfigConflictStatus`, `/api/json/ncmdashboard/getConfigConflictStatus` | Session (guard) | Computed from the device's stored running/startup configs (same source as §8). | **REAL** |
| `GET /ncmdashboard/getComplianceStatus`, `/api/ncmdashboard/getComplianceStatus`, `/api/json/ncmdashboard/getComplianceStatus` | Session (guard) | REAL: each device with a fetched running config is checked against 5 defined policies (HE-3b note below); counts Compliant (Pass) / Minor Deviation / Critical Violation, plus `devicesEvaluated`, `devicesNotEvaluated` (no running config — never counted compliant), `policies`, `perDevice` verdicts. | **REAL** (HE-3b, Phase 5) |
| `GET /ncmreports/getconfigChangesStatus`, `/api/ncmreports/getconfigChangesStatus`, `/api/json/ncmreports/getconfigChangesStatus` | Session (guard) | REAL: `backupsTaken` = rows in the configs table; `changesDetected` = consecutive same-device+type fetches whose content differs. Authorized Changes `0` (NCM approval gate is dry-run only, nothing is ever pushed, so no detected change can be tied to an authorised change); Unauthorized / Unscheduled = `changesDetected`. | **REAL** (HE-3b, Phase 5) |
| `GET /ncmcompliance/getFirmVulnDetails`, `/api/ncmcompliance/getFirmVulnDetails`, `/api/json/ncmcompliance/getFirmVulnDetails` | Session (guard) | REAL firmware inventory (`firmwareInventory`: device, model, vendor, firmware version extracted from the polled sysDescr, `null` where no version token exists) + honest-empty vulnerability fields: `totalVulnerabilities: 0` ("none known", not "none exist"), `cveList: []`, `vulnerabilityFeed: null` — no CVE feed exists anywhere in the repo. | **REAL** (inventory) / **HONEST-EMPTY** (vulnerabilities) (HE-3b, Phase 5) |
| `GET /ncmcompliance/getFirmVulCveSeverityStatus`, `/api/ncmcompliance/getFirmVulCveSeverityStatus`, `/api/json/ncmcompliance/getFirmVulCveSeverityStatus` | Session (guard) | All severity counts `0` + `vulnerabilityFeed: null` and the reason: severity counts aggregate CVE findings and no CVE feed exists, so there is nothing to aggregate. Real firmware inventory is in `getFirmVulnDetails`. | **HONEST-EMPTY** (HE-3b, Phase 5) |
| `GET /ncmcompliance/getFirmVulDeviceSeverityStatus`, `/api/ncmcompliance/getFirmVulDeviceSeverityStatus`, `/api/json/ncmcompliance/getFirmVulDeviceSeverityStatus` | Session (guard) | Both counts `0` + `vulnerabilityFeed: null` and the reason: without a CVE feed / patched baseline no device can be called vulnerable or verified patched. 0 vulnerable = none known; 0 patched = none verified patched. | **HONEST-EMPTY** (HE-3b, Phase 5) |
| `GET /ncmconfig/getStartupRunningVersion`, `/api/ncmconfig/getStartupRunningVersion`, `/api/json/ncmconfig/getStartupRunningVersion` | Session (guard) | Real running-vs-startup diff for the device (versions, `driftStatus`, `conflictingLines` — `null` when no fetched pair exists). `404` unknown `deviceId`. | **REAL** |
| `GET /ncmeol/getEolSummary`, `/api/ncmeol/getEolSummary`, `/api/json/ncmeol/getEolSummary` | Session (guard) | `{activeHardware: <device count>, …}` — EOL / EOS / warranty fields are `null` (no lifecycle data). | **REAL** |
| `GET /ncmeol/getUpcomingEolDevices`, `/api/ncmeol/getUpcomingEolDevices`, `/api/json/ncmeol/getUpcomingEolDevices` | Session (guard) | `[]` + `lifecycleSource: null` and the reason: no lifecycle source exists — devices store no purchase/warranty/EOL dates and no vendor EOL/EOS catalogue is bundled in the repo, so no EOL date can be reported. | **HONEST-EMPTY** (HE-3b, Phase 5) |
> ROUTING-1 (Phase 5): the 9 rows above were documented under a `/ncmclient/` prefix that never existed — the routes live under `/ncmdashboard/`, `/ncmreports/`, `/ncmcompliance/`, `/ncmconfig/` and `/ncmeol/` (verified live: the `/ncmclient/` forms 404). Their bare and `/api/json/...` forms were also 302-redirected to the SPA shell by the `/NCM*` catch-all in `server/index.js`; the fix lets API paths fall through to the routers (verified live: 200 + JSON on all forms). The same prefix correction applies to the rows above it (messages/views/CCTV/tab/floors/racks/L2maps/score/sounds live under `/admin/`, `/dashboard/`, `/tab/`, `/maps/` and `/v2/admin/`, not `/ncmclient/`).
>
> W2-5 (Phase 5, 2026-11-09): six more rows above still carried a `/ncmclient/` prefix that never existed — corrected to the real mounts after a line-by-line check of `server/routes/ncmclient.js`: `getDashboardList` → `/dashboard/` (+ `/v2/dashboard/` forms), `getAccessibilityControls` → `/admin/`, `listCustomFields` → `/device/`, `getDeviceCategories` → `/device/`, `listAllLogicalGroups` → `/admin/`, `getDeviceGroupViewPreference` → `/user/` (bare + `/api/json/` only; no `/api/user/` alias is registered). The 3 missing `/api/ncmclient/...` registrations (`getClientServiceData`, `getMainMenuTabs`, `getUserPreference`) were added to the same router — the `/api/` forms previously 404d with a session — and the rows now list all three aliases. `/inventory/` bare forms (`/inventory/virtualization`, `/inventory/firewall-rules` in `devices.js`) were 302-redirected by the `/Inventory*` catch-all; adding `/inventory/` to `LEGACY_API_PREFIXES` in `server/index.js` lets them fall through to the devices router, session-guarded by `apiAuthGuard` (verified live: 200 + JSON with a session, 401 without). Every remaining row in this section was re-verified against the router registrations; the `/ncmdashboard/` / `/ncmreports/` / `/ncmcompliance/` / `/ncmconfig/` / `/ncmeol/` rows list an `/api/json/...` form that is reachable through the `/api/json/` rewrite in `server/index.js` (the router registers bare + `/api/` only) — verified live, not a doc error.

### HE-3b note (Phase 5, 2026-11-09) — security score, compliance, change counts, firmware

**Security-score formula** (`getSecurityScore`, computed by `computeSecurityScore()` in `server/routes/ncmclient.js` from stored rows only):
`score = max(0, 100 − alarmDeduction − complianceDeduction)`, where `alarmDeduction = min(criticalOpen×10, 40) + min(troubleOpen×5, 20) + min(attentionOpen×3, 15) + min(serviceDownOpen×3, 15) + min(otherOpen×1, 5)` over open alarms (status `active` or `acknowledged`; cleared alarms are history, not current risk; severities are the poller's own strings) and `complianceDeduction = min(criticalViolationDevices×5, 25) + min(minorDeviationDevices×2, 10)` from the compliance engine below. `grade`: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F < 60. `status`: Good ≥ 80, Fair 60–79, At Risk < 60. `devicesMonitored` = rows in the devices table. With zero devices monitored the score/grade/status are `null` with reason "no devices monitored — nothing to score" (a 100 for an empty estate would be false). Every input is real; no input is estimated. The response carries the full `details` breakdown (inputs, deductions, formula) so the score is auditable.

**Compliance policies** (`getComplianceStatus`, `evaluateCompliance()`; each policy is a pure check over a device's latest fetched RUNNING config; comment lines starting `!`/`#` ignored; a policy returns pass/fail/`na`, and `na` is neither):
- `no-default-snmp-community` (Critical): fails when the config sets an SNMP community of `public` or `private` (Cisco `snmp-server community` / MikroTik `/snmp community name=`).
- `no-plaintext-password` (Critical): fails on Cisco `enable password` / `username … password` with a type-0 or bare plaintext password; types 5/7/8/9 pass; `secret` lines are always hashed and are not flagged.
- `ssh-only-management` (Minor): fails when management-access lines exist and Telnet is enabled (Cisco `transport input … telnet` / `telnet-server enable` / MikroTik `/ip service set telnet disabled=no`); no management-access lines at all → `na`.
- `ntp-configured` (Minor): fails when no NTP server/peer is configured (Cisco `ntp server|peer` / MikroTik `/system ntp client`).
- `syslog-configured` (Minor): fails when no remote logging destination is configured (Cisco `logging host|server` / MikroTik `/system logging`).
Device verdict: any Critical failure → Critical Violation; else any Minor failure → Minor Deviation; else Compliant (Pass). Devices with no fetched running config are counted in `devicesNotEvaluated` and in no verdict bucket.

**Config-change counts** (`getconfigChangesStatus`, `countConfigChanges()`): the configs table is the change history — every fetch is a backup row. `backupsTaken` = config rows; `changesDetected` = consecutive same-device+type fetches (oldest first) whose content differs. Authorized Changes is `0` by construction: the NCM approval gate (`server/routes/ncm.js`, `server/services/ncm.js`) is dry-run only and nothing is ever pushed to a device, so no detected change can be tied to an authorised change; every detected diff arrived out-of-band and is therefore counted as Unauthorized / Unscheduled.

**Firmware inventory** (`getFirmVulnDetails`, `buildFirmwareInventory()`): rows are the real discovered devices — model/vendor from the device row, firmware version extracted from the polled `sysDescr` (stored by discovery/poller from a real SNMP GET) with conservative patterns (`Version <token>` excluding `Hardware Version`, `Firmware[ Version]: <token>`, `RouterOS v<token>`, `SW Version <token>`, `Software Version <token>`); no matching token → `firmwareVersion: null`, never a guessed version; `firmwareVersionSource` is `sysDescr` when a version was extracted, else `null`. No firmware-version column exists in the store.

**Why the three vulnerability/EOL routes stay empty**: no CVE feed exists anywhere in the repo (no CVE data file, feed URL, or stored CVE rows — the MIB index only names OID descriptors such as `ncmFwvCveid`; a repo-wide search confirms this), so no CVE can be matched against the firmware inventory and no severity or per-device vulnerability aggregate can be computed — inventing CVEs would be fake data. Likewise no hardware lifecycle source exists (no purchase/warranty/EOL dates in the devices table, no vendor EOL/EOS catalogue bundled), so no EOL date can be reported. Both gaps are unblocked only by adding a real local feed/catalogue; until then the routes return honest zeros/empties with `vulnerabilityFeed: null` / `lifecycleSource: null` and the exact reason in the response.

## 12. `server/routes/probes.js` — 13 definitions, all REAL (phase-2: +1 `testCentralConnection`)

Probe status comes from heartbeat freshness (`last_heartbeat_at`): Online / Stale /
Offline. `publicProbe` strips the stored `auth_key_hash` from every response.
`verifyProbe(ip, port)` (used by add) does a real reachability check (TCP/ping) and
returns `{reachable, method, rttMs, reason}`.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/json/enterprise/listProbes`, `/api/probes/list` | Session (guard) | — | `{PROBEID, NAME, DISPLAYNAME, STATUS}` per probe; `STATUS` is the `isOnline` boolean from heartbeat freshness. | **REAL** |
| `GET /api/json/enterprise/getAllProbes`, `/api/probes/all` | Session (guard) | — | id → name map of stored probes. | **REAL** |
| `GET /api/json/enterprise/getAllCollInfo`, `/api/probes/coll-info` | Session (guard) | — | Per-probe `collStatus`: `up` / `down` / `unknown` from heartbeat freshness. | **REAL** |
| `GET /api/json/enterprise/getCollectorDetails`, `/api/probes/collector-details` | Session (guard) | — | `selColId` = first online probe, or `null`; `STATUS` true/false/null per probe. | **REAL** |
| `GET /api/json/enterprise/getDECommunicationStatus`, `/api/probes/de-status` | Session (guard) | — | Real ping per probe; `unknown` when there are no probes. | **REAL** |
| `GET /api/probes` | Session (guard) | — | `{totalProbes, activeProbes, result, probes}` (admin list). | **REAL** |
| `GET /api/json/enterprise/getProbeDetails`, `/api/probes/:id` | Session (guard) | Path/query: probe id | The probe plus only the devices/alarms attributed to it. | **REAL** |
| `POST /api/json/enterprise/addProbe`, `/api/probes` | Admin session (guard + route `requireRole('admin')`) | `{name, ip, port?}` (default port when absent/invalid) | `400` missing name/ip or invalid host; `409` a probe already exists for that IP; `502` if the probe is not reachable (`{reachable:false, method, reason}` — nothing is registered). On success `201 {status:'success', message, probe:<publicProbe>, authKey:<hex, shown once>, authKeyNote:'Store this key on the probe now — it is shown only once and cannot be recovered from Central.', verified:{reachable:true, rttMs, method}}`. Only the SHA-256 hash of the key is stored; measured latency is saved on the probe row. | **REAL** |
| `POST /api/probes/:id/heartbeat`, `/api/json/enterprise/probeHeartbeat` | Probe key | `{probeId?, authKey\|auth_key}` (body) or `x-probe-auth-key` header; optional numeric metrics `cpu_pct`/`mem_pct`/`disk_pct`/`latency_ms` (also accepts `cpu`/`memory`/`disk` aliases) | `400` bad probe id; `404` unknown probe; `401` missing key, probe has no registered key, or key hash mismatch (SHA-256, `timingSafeEqual`). On success updates `last_heartbeat_at` and stores only the numeric metrics sent; anything missing stays `null`. `{status:'success', message, probe:<publicProbe>}`. | **REAL** |
| `POST /api/json/enterprise/deleteProbe`, `/api/probes/:id/delete` | Admin session for POST/DELETE (route `requireRole('admin')`); GET passes through to details | `{probeId}` / path id | Deletes the stored probe row. Operator/Viewer → `403` on POST/DELETE. | **REAL** |
| `POST /api/json/enterprise/syncDataFromProbe`, `/api/probes/:id/sync` | Session (guard) | `{probeId}` / path id | `400` bad id; `404` unknown probe; `502` if the probe is unreachable by ping (message names the method/reason and the heartbeat status). On success `{status:'success', message:'… N device(s), M active alarm(s) reconciled from the store', …}` and updates `latency_ms` when reachable. **No data is actually pulled from the probe** — the counts are Central's own stored devices/alarms for that probe. | **REAL** (with caveat) — **OPEN O-17** |
| `POST /api/json/enterprise/syncAllProbes`, `/api/probes/sync-all` | Session (guard) | — | Same per-probe ping-check + store counts; `{status:'success'|'partial', message:'X of N Enterprise Probe(s) synchronized; … failed', results:[…]}`. | **REAL** (with caveat) — **OPEN O-17** |

## 13. `server/routes/racks.js` — 3 definitions, all REAL

The store has no `rack_assignments` table: placements are persisted as JSON under the
settings key `rack_assignments` (`store.getSetting` / `store.setSetting`). An assignment
only ever references a real rack (`store.getRack`) and a real device; stale assignments
whose device no longer exists are dropped, never rendered. Response contract (R-01,
fixed W2-4): `units` is the rack's unit COUNT (an integer — `null` when a stored value
is not a positive integer, never a fabricated count); placements live in `assignments[]`
and only in-range units (1..`units`) are returned. The store holds no temperature,
power, datacenter, probe or cooling data, so none is returned; the rack view renders
only these fields and an honest empty state when no racks exist.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/racks/list` | Session (guard) | — | Stored racks, each with integer unit count `units` and its in-range device assignments (device label, unit, IP, status, category). Empty store → `[]`. No temperature / power / datacenter / probe / cooling fields exist. | **REAL** |
| `POST /api/racks/create` | Session (route) | `{name, units}` (`units` = positive integer) | `201` created rack; `400` missing/invalid `name`/`units`. | **REAL** |
| `POST /api/racks/assign` | Session (route) | `{rackId, deviceId, unit}` (all integers) | `400` missing/invalid ids/unit; `404` unknown rack or device; otherwise stores the placement under `rack_assignments` and returns it. | **REAL** |

## 14. `server/routes/reports.js` — 8 definitions, all REAL

Window params: `?range=1h|24h|7d|30d` (default `24h`) or `?from=`/`?to=` as epoch-ms or
ISO strings, ending now. Averages are computed from stored metrics only; availability
is `null` when there are no samples in the window. (**Count correction vs the draft:**
this file has **8** definitions, not 7 — `GET /api/dashboard/summary` was missing
from the draft inventory. Re-counted 2026-11-09.)

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/reports/summary`, `/api/reports/availability` | Session (guard) | Query: `range` / `from` / `to`, `probeId?` | `{totalDevices, avgAvailability, avgResponseTime, totalAlarms, topCpu, …}` — per-device stats from real poll samples in the window; `avgAvailability`/`avgResponseTime` are `null` with no samples. (One definition, two paths; summary and availability share the handler.) | **REAL** |
| `GET /api/dashboard/summary` | Session (guard) | Query: `since` / `until` / `range` | `{status:'success', window:{range, from, to}, totalDevices, activeDevices, devicesByStatus, totalAlarms, activeAlarms, totalProbes, activeProbes, availability}` — all computed from the store (probe activeness from heartbeat freshness); `availability` is `null` with no samples. (Missing from the draft inventory; verified in `reports.js:187`.) | **REAL** |
| `GET /api/reports/export/csv` | Session (guard) | Query: `type=devices\|probes\|audit\|alarms` (default `alarms`), `probeId?` | CSV download, filename `OpManager_Central_<TYPE>_<YYYY-MM-DD>.csv`. `devices`: stored device rows. `probes`: probe rows with monitored-device and active-alarm counts (port/version/sync-status columns are blank — no source). `audit`: stored audit rows (operator/action/detail; client-IP/module/target columns blank — not recorded). `alarms` (default): stored alarms with device/probe names resolved from the store. Missing fields stay blank. | **REAL** |
| `GET /api/reports/audit` | Session (guard) | Query: `limit` (clamped 1–1000) | `store.listAudit(limit)` — real audit rows (who did what, when). | **REAL** |
| `GET /api/reports/print-preview` | Session (guard) | — | Version from `package.json`, real probe/device counts, availability `N/A` when there are no samples. | **REAL** |
| `GET /reports/getServerHealthReport`, `/api/reports/getServerHealthReport` | Session (guard) | — | Real host data: `os.loadavg()`, `totalmem()`, `freemem()`; `serversMonitored` = devices whose category matches /server/i. | **REAL** |
| `GET /reports/getAdvancedReportData`, `/api/reports/getAdvancedReportData` | Session (guard) | Query: `range` (default 30 d) | 30-day SLA / MTTR computed from real alarm raise→clear durations in the store. | **REAL** |
| `GET /reports/getReportsList`, `/reports/listAllAdvancedReports`, `/api/reports/list` | Session (guard) | — | `REPORT_CATALOGUE` grouped by category, each entry with a count of report definitions that exist. | **REAL** — **OPEN O-18**: the exact catalogue contents were not fully captured in this draft. |

## 15. `server/routes/settings.js` — 58 definitions: 57 REAL, 0 HONEST-EMPTY, 1 × 501 (phase-2: 9 former 501s now REAL; only `updateJvmHeapSize` still 501; phase-5 HE-1: `getUserNotification` + `getNewFeatures` now REAL)

Settings are persisted in the store (`store.getSetting` / `store.setSetting` via
`getStored`/`putStored`); there is no module-level `let` persistence. Secrets are
redacted in every response by `publicCopy` (any key matching
`/password|passwd|secret|private[_-]?key|token/i` is dropped); only booleans such as
`bindPasswordConfigured` / `passwordConfigured` / `certificateConfigured` are returned.
All settings routes are behind the session guard unless noted.

| Method + path | Response | Status |
| --- | --- | --- |
| `GET /api/settings/central` | Real server identity: hostname, `process.uptime()`, `startedAt`, probe/device counts, `dbType:'SQLite (node:sqlite)'`, `dbPath`, `apiKey:null`. | **REAL** |
| `GET /api/settings/credentials` | Stored credentials, each through `publicCopy` (secrets stripped). | **REAL** |
| `POST /api/settings/credentials` | `201`; stores the credential; returns `publicCopy(created)` (no secret echoed back). | **REAL** |
| `GET /api/settings/templates` | Real template list parsed from `server/data/templates/index.json` — **562 real entries** from the XML template library: `{status:'success', templates, count, total}`. | **REAL** |
| `GET /api/settings/templates/by-sysoid`, `GET /api/settings/templates/by-sysoid/:oid` | Templates filtered by sysOID from the same index: `{status:'success', sysOid, templates, count}`. | **REAL** |
| `GET /api/settings/templates/:name` | Single template from the index (or 404 when the name is not in it). | **REAL** |
| `POST /api/settings/templates` | Creates an operator template in the local write store (vendor index entries are read-only; name collision → 409). | **REAL** (phase-2: was 501) |
| `PUT /api/settings/templates/:id` | Updates a stored custom template. | **REAL** (phase-2: was 501) |
| `POST /api/settings/templates/apply` | Records template assignments (nothing consumes them yet — see §23.5). | **REAL** (phase-2: was 501) |
| `GET /admin/isMailServerConfigured`, `/api/admin/isMailServerConfigured` | Boolean + summary from the stored mail record. | **REAL** |
| `GET /admin/GetNFACentralMailServerSettings`, `/api/admin/GetNFACentralMailServerSettings` | Stored mail-server settings (secrets redacted). | **REAL** |
| `GET /dashboard/getUserNotification`, `/api/dashboard/getUserNotification` | Real unread rows from the `notifications` table (`store.notifications`): alarm raised/cleared → `webAlarmNotification`, discovery-run / config-backup finished → `scheduleNotification`, system → `systemAlerts`. `upgradeNotification: null` — no upgrade event exists in this build. Empty only when no unread events exist; nothing is seeded. | **REAL** (phase-5 HE-1: was HONEST-EMPTY; verified live on :8171 — poller-raised availability alarm, seeded CPU alarm raise/clear, and two discovery runs all appeared as real rows; clear/hide round-trips below) |
| `POST /dashboard/clearUserNotification`, `/api/dashboard/clearUserNotification` | Marks all unread/read notifications `cleared` in the store; reports the real `{cleared:<n>}`. | **REAL** (phase-5 HE-1: was honest-zero; verified live on :8171 — `{cleared:2}`) |
| `POST /dashboard/hideNotifications`, `/api/dashboard/hideNotifications` | Marks all unread notifications `hidden` in the store; reports the real `{hidden:<n>}`. | **REAL** (phase-5 HE-1: was honest-zero; verified live on :8171 — `{hidden:1}`) |
| `GET /admin/getBasicLicenseDetails`, `/api/admin/getBasicLicenseDetails` | All limits / expiry / add-ons `null`, `status:'Unlicensed'` unless a licence record is stored. | **REAL** |
| `GET /api/settings/license` | Stored licence record (or the unlicensed nulls above). | **REAL** |
| `POST /api/settings/license/apply` | Admin-only (`requireRole('admin')`). `400` if neither `licenseXml` nor `keyString` is supplied; otherwise stores the SHA-256 fingerprint of the supplied key/XML with `status:'Unvalidated'` — it never claims the licence was validated. | **REAL** |
| `GET /admin/getSearchResult`, `/api/admin/getSearchResult` | Searches stored devices, probes and alarms for the query string. | **REAL** |
| `GET /admin/getNewFeatures`, `/api/admin/getNewFeatures` | Real build metadata: `{build:'12.9.204-GA', buildCommit:<git HEAD>, buildDate/releaseDate:<git commit date>, features:[12 capabilities this build actually implements]}`. Commit/date come from the live git checkout, falling back to baked `server/build-info.json` (regenerate from `git log` at packaging time); `null` when neither exists — never invented. The features list is derived from `API.md`/`REALDATA.md` (see `settings.js` `NEW_FEATURES` source comments); no roadmap or upstream-only items. | **REAL** (phase-5 HE-1: was HONEST-EMPTY; verified live on :8171 at `b1de62c` — `buildCommit` was that HEAD, `buildDate: 2026-11-09T12:12:38+00:00`, 12 features) |
| `GET /admin/GetOpManagerSettings`, `/api/admin/GetOpManagerSettings` | Real host IP/port, `protocol:'HTTP'`; replication / trap / syslog fields `null` (not configured). | **REAL** |
| `GET /admin/GetSystemInformation`, `/api/admin/GetSystemInformation`, `/admin/getSystemInfo` | Real `os` module data + `process.memoryUsage()` (platform, CPU, memory, uptime). | **REAL** |
| `GET /admin/getDBInfo`, `/api/admin/getDBInfo` | Real SQLite stats: DB file size, table count, total records across all tables (read-only connection). | **REAL** |
| `GET /admin/getAPIKey`, `/api/admin/getAPIKey` | `{apiKey:null, keys:[…stored key records, hashes only…]}` — the plain key is never returned here. | **REAL** |
| `POST /admin/regenerateAPIKey`, `/api/admin/regenerateAPIKey` | Admin-only (`requireRole('admin')`). Generates `opm_` + 32 random bytes (base64url), stores only its SHA-256 hash, rotates the key with the given `id` or creates one under the given `name`; returns the plain key **once** (`{status:'success', apiKey:<plain>, id, name, created_at, …}`); `404` if the `id` to rotate does not exist. | **REAL** |
| `GET /admin/GetThreadDump`, `/api/admin/GetThreadDump` | Node runtime data: handles, requests, memory, CPU, uptime. `activeThreads`/`peakThreads`/`threadDump` are `null` with the note "no JVM" — this is Node, not Java. | **REAL** |
| `POST /admin/updateJvmHeapSize`, `/api/admin/updateJvmHeapSize` | Admin-only (`requireRole('admin')`, then `501`) — structurally impossible, permanently: this build runs on Node.js, not Java, so no JVM process exists and there is no JVM heap to resize. The V8 heap limit is set only at process start by `--max-old-space-size` (e.g. `NODE_OPTIONS=--max-old-space-size=4096`, see `DEPLOY.md` §1.3); live V8 heap figures are in `GET /api/admin/GetSystemInformation` (`runtime.heapTotalMB` / `heapUsedMB`, `jvmInfo: null`). | **501** |
| `GET /api/support/logs`, `/support/logs` | Reads the real `.log` file tail under `server/logs` or `server/data/logs`; `404` if no log file exists; `lines` clamped 1–1000. | **REAL** |
| `GET /api/support/sif`, `/support/generateSIF` | `404` if no log files exist; otherwise builds a real SIF zip (stored-zip of the log files) on disk and returns `{fileName:'OpManager_Central_SIF_<stamp>.zip', fileSizeBytes, fileSize, downloadPath:'/api/support/sif/download/<fileName>', …}`. | **REAL** |
| `GET /api/support/sif/download/:file` | Serves the generated `.zip` from the SIF directory; `404` if missing / not a `.zip`. | **REAL** |
| `GET /api/settings/mail`, `/settings/getMailServer` | Session (guard; the `/settings/` variant is also route-guarded). Stored mail settings (secrets redacted). | **REAL** |
| `POST /api/settings/mail`, `/settings/saveMailServer` | Admin-only (`requireRole('admin')`). Persists mail settings; returns the redacted copy. | **REAL** |
| `POST /api/settings/mail/test`, `/settings/testMailServer` | Admin-only (`requireRole('admin')`). Real SMTP test against the configured mail server; `501` when no mail server is configured (nothing to test). | **REAL** (phase-2: was 501; conditional 501) |
| `GET /api/settings/failover`, `/settings/getFailoverStatus` | Session (guard; the `/settings/` variant is also route-guarded). Stored failover config; single node by default. | **REAL** |
| `POST /api/settings/failover` | Admin-only (`requireRole('admin')`). Persists failover config; `400` if no config object is supplied. | **REAL** |
| `POST /api/settings/failover/test`, `/settings/testFailoverHeartbeat` | Admin-only (`requireRole('admin')`). Real TCP connect to the configured standby when one is set; `501` when no standby is configured. | **REAL** (conditional) |
| `GET /api/settings/users`, `/api/users/list` | Real store users: `{…, mfa:false, lastLogin:null, mustChangePassword}` (flag from the user row). | **REAL** |
| `POST /api/settings/users`, `/api/users/add` | Admin-only (`requireRole('admin')`). Real user creation (store-backed). | **REAL** (phase-2: was 501) |
| `DELETE /api/settings/users/:id` | Admin-only (`requireRole('admin')`). Real user deletion (store-backed). | **REAL** (phase-2: was 501) |
| `GET /api/settings/auth/ad` | Stored AD config; `bindPasswordConfigured` boolean only (password never returned). | **REAL** |
| `POST /api/settings/auth/ad` | Admin-only (`requireRole('admin')`). Persists AD config; returns the redacted copy. | **REAL** |
| `POST /api/settings/auth/ad/test` | Admin-only (`requireRole('admin')`). Real reachability test against the configured domain controller; `501` when no DC is configured. Reachability-only, not an LDAP bind. | **REAL** (phase-2: was 501; conditional 501) |
| `GET /api/settings/auth/saml` | Stored SAML config; certificate never returned, `certificateConfigured` boolean only. | **REAL** |
| `POST /api/settings/auth/saml` | Admin-only (`requireRole('admin')`). Persists SAML config; returns the redacted copy. | **REAL** |
| `POST /api/settings/auth/saml/test` | Admin-only (`requireRole('admin')`). Real SAML config validation; `501` when no SAML configuration is stored. Validates config, not a login flow. | **REAL** (phase-2: was 501; conditional 501) |
| `GET /api/settings/proxy` | Stored proxy config; `passwordConfigured` boolean only. | **REAL** |
| `POST /api/settings/proxy` | Admin-only (`requireRole('admin')`). Persists proxy config; returns the redacted copy. | **REAL** |
| `POST /api/settings/proxy/test` | Admin-only (`requireRole('admin')`). Real HEAD request through the configured proxy when one is set; `501` when no proxy is configured. | **REAL** (conditional) |
| `GET /api/settings/db` | SQLite stats + backup history + backup schedule (from the store). | **REAL** |
| `POST /api/settings/db/backup` | Real `VACUUM INTO` to a `.db` file; returns the real file size + SHA-256; `500` on failure. | **REAL** |
| `POST /api/settings/db/vacuum` | Real `VACUUM` + `ANALYZE`; returns measured `durationMs` / `reclaimedBytes`. | **REAL** |
| `GET /api/settings/system` | Stored system settings; hostname/port are the real values, `monitoringThreads:null`. | **REAL** |
| `POST /api/settings/system` | Admin-only (`requireRole('admin')`). Persists system settings. | **REAL** |
| `GET /api/settings/rebrand` | Stored rebrand values (all `null` when unset). | **REAL** |
| `POST /api/settings/rebrand` | Admin-only (`requireRole('admin')`). Persists rebrand values. | **REAL** |
| `GET /api/settings/ssl` | Plain HTTP in this build: `effectiveHttps:false`; stored SSL values returned as-is. | **REAL** |
| `POST /api/settings/ssl` | Admin-only (`requireRole('admin')`). Persists SSL settings (values stored as supplied; nothing is validated or applied — the server still serves plain HTTP). | **REAL** |
| `POST /api/settings/ssl/test` | Admin-only (`requireRole('admin')`). Real certificate verification against the configured TLS target / stored certificate; `501` when no target is configured. | **REAL** (phase-2: was 501; conditional 501) |

## 16. `server/routes/tools.js` — 11 definitions: 8 REAL, 3 × 501 (phase-2: mac-resolve now REAL)

All diagnostic handlers resolve the target to IPv4 first (`422` if unresolvable) and
run through a shared `diagnose()` wrapper that returns
`{status:'success', target, resolvedIp, source:'linux-cloud-instance'|'darwin-host', timestamp, …result}`
or `502` on execution failure. No fabricated hops, no invented RTTs.

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `POST /api/tools/ping`, `/tools/ping` | Session (guard) | `{ip, count?}` (`count` 1–10) | Real system ping; measured RTTs / packet loss. `400` invalid target. | **REAL** |
| `POST /api/tools/traceroute`, `/tools/traceroute` | Session (guard) | `{ip}` | Real traceroute binary, max 15 hops; only hops actually observed are returned. | **REAL** |
| `POST /api/tools/port-check`, `/tools/port-check` | Session (guard) | `{ip, port}` | Real TCP connect: `{isOpen, latencyMs}`. | **REAL** |
| `GET /api/tools/mib-tree` | Session (guard) | Query: `module?` | Parsed from the real MIB files on disk (`server/data/mibs/*`, 116 files): `{status:'success', source:'server/data/mibs', modules:[…], totalOids, parsedAt}`; `?module=` filters to one module; `404` unknown module. | **REAL** |
| `POST /api/tools/snmp-query` | Session (guard) | `{ip, oid?='.1.3.6.1.2.1.1.1.0', community?='public_monitor_ro', version?='v2c'}` | Real net-snmp GET; response includes the varbind value; `community` is returned masked as `'******'`. `400` invalid OID (must be a numeric dotted OID); `422` unresolvable target; `502` SNMP failure / no varbind / varbind error. `version` other than v1/v2c → `501` (SNMPv3 unsupported — the service only carries community credentials). `502` if the SNMP service cannot be loaded. | **REAL** |
| `POST /api/tools/snmp-walk` | Session (guard) | `{ip, rootOid?='.1.3.6.1.2.1.1', community?='public_monitor_ro', version?='v2c'}` | Real net-snmp walk from the root OID; same 400/422/501/502 rules as snmp-query. | **REAL** |
| `GET /api/tools/switch-ports`, `/api/tools/spm` | Session (guard) | Query: `deviceId` or `ip` | Reads the device's **stored** interface rows: `{status:'success', device, ip, totalPorts, activePorts, ports:[{port, alias, adminStatus, operStatus, speed, vlan, mac, ip, type}]}`. Port label is the real stored `ifName`/`ifDescr`/`ifIndex` only — never a synthesised `Fa0/<n>` name; unknown fields are `null`. An explicitly supplied `deviceId`/`ip` that matches no stored device → honest **404** (verified in `tools.js:570-585`); only when no id/ip is supplied at all does it fall back to the first stored device, and with no devices at all it returns `{status:'success', device:'No Managed Switch', ip:null, totalPorts:0, activePorts:0, ports:[]}`. **Fixed during the purge audit** (was: silent fallback to `devices[0]` + `127.0.0.1` placeholder); O-14 resolved for the explicit-id case. | **REAL** |
| `POST /api/tools/terminal-exec` | Session (guard) | `{hostname?, command?}` | `501` — no safe allow-listed command runner (SSH/Telnet session) exists; no command is executed and no output is fabricated. Echoes `hostname`/`command`/`timestamp` as `null` when absent. | **501** — **OPEN O-13** |
| `POST /api/tools/wmi-query` | Session (guard) | `{host?, namespace?, query?}` (defaults `127.0.0.1`, `root\cimv2`, `SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor`) | `501` — no WMI/WinRM client exists. | **501** — **OPEN O-13** |
| `POST /api/tools/cli-query` | Session (guard) | `{…}` | `501` — no CLI session runner exists. | **501** — **OPEN O-13** |
| `POST /api/tools/mac-resolve` | Session (guard) | `{target, community?, via?}` | Real MAC resolution: stored interface rows, this host's ARP cache, or live SNMP (ifPhysAddress / ipNetToMedia / ipNetToPhysical). Honest 404 listing every source tried when nothing is found; 422 unresolvable target. | **REAL** (phase-2: was 501) |

## 17. `server/routes/traps.js` — 2 definitions, both REAL

Trap/syslog rows are the stored columns (`id`, `source_ip`, `oid`, `value`, … — see
**OPEN O-19** for the full field list). Kind is derived from the row: rows with a
non-null `oid` are traps; rows with a null `oid` are syslog. No `?limit=` means the
store default of 200 rows per kind (a wider window is fetched, then filtered).

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/traps/list` | Session (guard) | Query: `limit?` | Stored SNMP trap rows, newest first. `500` if the trap store is unavailable. Receiver (UDP 162) is started on module load. | **REAL** |
| `GET /api/syslog/list` | Session (guard) | Query: `limit?` | Stored syslog rows, newest first. `500` if the trap store is unavailable. Receiver (UDP 514) is started on module load. | **REAL** |

## 18. `server/routes/workflows.js` — 6 definitions: 5 REAL, 1 × 501 (phase-2: +3 REAL — validate, get, list-runs; execute stays 501)

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `GET /api/workflows/list` | Session (guard) | — | Stored workflows, each with its stored runs. | **REAL** |
| `POST /api/workflows/create` | Session (route) + `requireRole('admin')` | `{name, steps?}` (`name` non-empty required; `steps` must be an array when present) | Creates the stored workflow. | **REAL** |
| `POST /api/workflows/execute` | Session (guard) | `{workflowId}` | `400` no `workflowId`; `404` unknown workflow; otherwise `501 {error:'not_implemented', message:'Workflow execution is not implemented: this server has no step executor (no SSH/WMI/CLI runner), so workflow "<name>" (id <id>) was not run and no step was executed.', workflowId, logs:[message]}`. The refused attempt **is** recorded as a workflow run (`status:'not_implemented'`, real timestamps) and is excluded from `executionCount` / `lastExecuted`. | **501** — **OPEN O-12** |

## 19. `server/routes/zia.js` — 1 definition, REAL

| Method + path | Auth | Request | Response | Status |
| --- | --- | --- | --- | --- |
| `POST /api/zia/query`, `/api/zia/ask`, `/zia/aiPromptExecutor` | Session (guard) | `{query\|prompt\|question?}` (free text; may be empty) | A **rule-based data summary computed live from the store snapshot** — labelled as a data summary, not an assistant. Keyword branches: alarm/critical, probe/latency, cpu/memory/performance, compliance/ccm/config. Returns `{summary, confidence:null, recommendations:[…], …}`; `confidence` is always `null` because there is no inference to score. With no devices/alarms/probes it returns the honest empty result `{summary:'No data to analyze yet.', confidence:null, recommendations:[]}`. | **REAL** — **OPEN O-11**: whether any real inference/LLM is in scope is undefined by the contract. |

## 20. Non-route endpoints in `server/index.js` (outside the 17 route files)

Documented here because one of them was still fake in the draft. These are **not** counted in the
181 route definitions above.

| Method + path | Auth | Behaviour | Status |
| --- | --- | --- | --- |
| `GET /logs/:file` | `requireAuth` | **Rebuilt — now REAL.** Reads the tail of a real `.log` file under `server/logs` or `server/data/logs` (verified in `server/index.js:316`, with an explicit no-synthesis comment). When the file does not exist (or no logs directory exists yet) it answers **404** with an honest message instead of inventing log content. The old fabricated lines (fake `PostgreSQLConnectionPool`, fake `ProbeSyncWorker` latency, fake "Standby poller idle") are gone. | **REAL** — fixed during the purge audit |
| WebSocket upgrade `/PNSHandler`, `/ws` | Session (cookie or `?token=`) | See §1. `/ws` sends `INITIAL_STATE` from **live store data**: `{type:'INITIAL_STATE', central:{productName:'ManageEngine OpManager Central', productVersion:'12.9.204-GA', buildNumber:null}, probes:<stored>, devices:<stored>, alarmsCount:<stored count>, timestamp}`. Version unified to 12.9.204-GA (verified `server/index.js:453`); the only `129203` remainder is the opaque internal `wsId: 'WS_OPM_CENTRAL_129203'` (`server/index.js:440`), intentionally left. | **REAL** |
| `GET /`, `/dashboard`, `/itom` | `requireConsoleSession` | Serves the console shell when a session exists, otherwise redirects to `/login.html`. | **REAL** |
| `GET /login`, `/login.html` | Public | Serves the login page. | **REAL** |
| `GET /apiclient/ember/index.jsp`, `/apiclient/ember`, `/apiclient/fluidicv3/index.jsp` | Public | Redirect to `/apiclient/fluidicv3/itom/index.html#/dashboard`. | **REAL** |
| `GET /Inventory*`, `/Home*`, `/Settings*`, `/NCM*`, `/Maps*`, `/Reports*` | Public | Redirect to the matching Fluidic hash route. | **REAL** |

### Resolved blocker (was in the previous draft's notes — now verified fixed)

The earlier snapshot had `server/index.js` requiring the deleted `server/services/db.js`,
which would have prevented the server from starting. **In this snapshot that require is
gone**: `index.js` line 26 is a comment noting the old JSON store was deleted, and the app
requires `./services/store`. The WebSocket `INITIAL_STATE` handler and the `/logs/:file`
handler no longer call `db.*` (the former reads the store; the latter reads a real log
tail). **Live-tested for this finalisation:** the server boots and serves (local pid
46525, banner 12.9.204-GA; `verify-auth.sh` 11/11 and `verify-empty.sh` 16/16, exit 0,
re-run 2026-11-09 after the final restart).

## 21. OPEN register — what the contract does not yet define

| ID | Endpoint(s) | What is unknown |
| --- | --- | --- |
| O-1 | Auth (all routes) | `must_change_password` is returned by login, stored on the user row, and cleared + session-rotated by the change-password flow — but no guard in `server/index.js` was found refusing other endpoints for a flagged user. **Still open and unproven:** server-side enforcement on non-password routes needs a live test with a flagged session. |
| O-2 | Settings API keys; all routes | API keys are issued/stored (`GET /api/settings/…/getAPIKey`, `POST …/regenerateAPIKey`), but no route was seen accepting a stored API key as a session alternative. Is REST API-key auth in scope for general API routes? **Still open.** |
| O-3 | `POST /api/ccm/push` | 501: no Central-to-probe delivery channel exists. What would a real push do, and what acknowledgement would it return? |
| O-4 | `POST /api/ccm/backup-device`, `/api/ccm/backup` | 501: no SSH/TFTP/SNMP config-fetch path exists anywhere in `server/`. Will one be built (which transport), or does backup stay unimplemented? |
| O-5 | `POST /api/ccm/resolve-drift` | 501: depends on O-3/O-4 — no config push path. What is the intended real resolution flow? |
| O-6 | `GET /api/hardware/details` | `macAddress` is always `null` — no MAC source in the store or ENTITY-MIB. Will a MAC source be added, or does it stay null? |
| O-7 | Templates (`POST /api/settings/templates`, `PUT …/:id`, `POST …/apply`) | Reads are now REAL from the 562-entry XML index, but create/update/apply are 501. Will templates become store-backed (create/edit/apply), or do reads stay the whole feature? |
| O-8 | `POST /api/settings/users`, `DELETE /api/settings/users/:id` | 501: user creation/deletion "belongs to the auth service". Will a real admin user-management flow be built, or do admins stay manageable only via `/api/auth/setup` + direct store access? |
| O-9 | `POST /api/settings/mail/test` | 501: "SMTP delivery is not connected in this local build." Will real SMTP be wired, or does mail stay stored-only? |
| O-10 | `POST /api/settings/auth/ad/test`, `…/saml/test`, `…/ssl/test` (failover/proxy tests are REAL when configured) | 501: no LDAP bind test, SAML validation, or certificate validation exists. What should each test actually verify? |
| O-11 | `POST /api/zia/query` (et al.) | Rule-based summary only, `confidence: null`. Is any real inference/LLM in scope, or is the data summary the final behaviour? |
| O-12 | `POST /api/workflows/execute` | 501: no step executor. What can a workflow step do when one exists (SSH/WMI/CLI?), and is building a runner in scope? |
| O-13 | `POST /api/tools/terminal-exec`, `wmi-query`, `cli-query`, `mac-resolve` | 501: no SSH/Telnet runner, WMI/WinRM client, or ARP/MAC source. Are any of these runners in scope? |
| O-14 | `GET /api/tools/switch-ports` | **Resolved for the explicit-id case:** an explicitly supplied unknown `deviceId`/`ip` now returns an honest 404 (`tools.js:570-585`, verified by read); the fallback to the first stored device applies only when no id/ip is supplied at all, and no-device returns `ip: null` with 0 ports. |
| O-15 | `POST /api/discovery/run` | Default community falls back to the stored setting `discovery.defaultCommunity`, then `'public'`. No settings/UI surface managing that setting was verified — does one exist or is it store-only? **Still open.** |
| O-16 | `GET /api/agent/downloads` | **Version resolved** — static list now reads `12.9.204-GA`, build `20261106` (`agents.js:289`). Whether the listed installer files actually exist on disk / are served was not verified. **Still open (file existence only).** |
| O-17 | `POST /api/probes/:id/sync`, `/api/probes/sync-all` | Ping-check + Central's own stored counts only — no data is pulled from the probe. Is real probe→Central data sync in scope? |
| O-18 | `GET /api/reports/getReportsList` | Catalogue is returned grouped by category with counts of definitions that exist, but the exact catalogue contents were not fully captured in this draft. Needs a final read. |
| O-19 | `GET /api/traps/list`, `/api/syslog/list` | Row fields are the stored columns (`id`, `source_ip`, `oid`, `value`, …). The full field list was only partially captured — needs a final read of `store.listTraps` rows. |
| O-20 | `GET /ncmclient/getClientServiceData` | `userMeta`/`productMeta` shapes were only partially captured (role/permissions/`mustChangePassword`/`sessionTimeout` verified; the rest not). Needs a final read. |

## 22. Counts, and what remains open after finalisation

**Counts (final, re-verified 2026-11-09 against the landed route files):
181 route definitions across 17 files — 138 REAL, 21 HONEST-EMPTY,
22 NOT-IMPLEMENTED (501), 0 FAKE inside the route files.** Plus 0 FAKE
endpoints outside the route files (`GET /logs/:file` is now REAL, §20) and
**18 OPEN items remaining** (§21: O-1, O-2, O-3, O-4, O-5, O-6, O-7, O-8,
O-9, O-10, O-11, O-12, O-13, O-15, O-17, O-18, O-19, O-20 — O-14 resolved,
O-16 partly resolved; see the register for the per-item status).

> **Superseded by the phase-2 close-out recount (top of this file, §23):
> 193 route definitions — 164 REAL, 21 HONEST-EMPTY, 8 NOT-IMPLEMENTED (501),
> 0 FAKE.** Per file: agents 11 · alarms 17 · auth 5 · ccm 3 · devices 18 ·
> diff 2 · discovery 6 · hardware 1 · ncmclient 28 · probes 13 · racks 3 ·
> reports 8 · settings 58 · tools 11 · traps 2 · workflows 6 · zia 1 = **193**.

Per file: agents 6 · alarms 17 · auth 5 · ccm 3 · devices 15 · diff 2 · discovery 6 ·
hardware 1 · ncmclient 28 · probes 12 · racks 3 · reports 8 · settings 58 · tools 11 ·
traps 2 · workflows 3 · zia 1 = **181**. (Draft said 180 with reports at 7; the
extra definition is `GET /api/dashboard/summary`, §14.)

**What the finalisation verified live (2026-11-09):**

1. **Live boot + smoke test — done.** Server boots and serves (local pid 46525,
   banner 12.9.204-GA). `verify-auth.sh` 11/11 and `verify-empty.sh` 16/16, exit 0,
   re-run after the final restart. Unauthenticated `GET /api/auth/session` → 401
   (re-checked at finalisation). Live SNMP poller verification vs real Techub
   devices on the relay — see `REALDATA.md` §9.3 (Core .2 byte-identical sysDescr,
   uptime ticks advancing +12,010 over ~117 s; pfSense .1 honest nulls; pollNow
   unreachable → honest 502; unknown device → 404; delete cascade 1→0 alarms).
2. **Decisions on the OPEN items** — still outstanding for the 18 items listed
   above (above all O-1 password-change enforcement, O-2 API-key auth scope,
   O-3/O-4/O-5 config push/backup, O-12/O-13 any step/runner scope). The
   `GET /logs/:file` rebuild decision (§20) is **resolved** (real log tail).
3. **Final reads for the partially captured shapes**: O-18 (reports catalogue),
   O-19 (trap row fields), O-20 (`getClientServiceData` full field list), and the
   `GET /api/settings/templates/:name` 404 shape — **still not done**; carried over
   from the draft, not re-verified in this pass.
4. **Stale comments to fix** (doc debt, not behaviour): the `server/index.js` comment
   claiming agents.js never validates the agent key (it does now); the `racks.js` /
   `hardware.js` header comments claiming the store has no `racks`/`devices` namespaces
   (it exposes both). **Still open** — not re-verified as fixed in this pass.
5. **Not live-verified in this pass** (see `REALDATA.md` §9.4): trap-receiver
   over-the-wire ingestion on a live host; a discovery run end-to-end through the
   app's own endpoint; agent register → telemetry → restart survival; a live
   threshold-breach raise/ack/clear cycle.

## 23. Phase-2 close-out — 501 triage and what the merge proved (2026-11-09)

**Counts after the phase-2 merge: 193 route definitions — 164 REAL, 21
HONEST-EMPTY, 8 NOT-IMPLEMENTED (501), 0 FAKE.** Method: one entry per
`router.*()` call, same as §22; every `status(501)` site read to its owning
definition. Conditional 501s (a real test that 501s only when nothing is
configured to test — mail/failover/AD/SAML/proxy/SSL tests, SNMPv3 on the
snmp-query/walk endpoints, the templates index when unavailable) count as
REAL; only definitions that *always* refuse are counted 501.

### 23.1 Still 501 (8) — exact blocker each

| # | Route definition | Blocker (exact) |
| --- | --- | --- |
| 1 | `POST /api/ccm/push` (+ legacy `/api/json/enterprise/pushCentralConfig`, `/enterprise/pushCentralConfig`) | No Central-to-probe delivery channel exists (no probe transport, no acknowledgement handling anywhere in `server/`). OPEN O-3. |
| 2 | `POST /api/ccm/backup-device`, `/api/ccm/backup` | No SSH/TFTP/SNMP config retrieval path exists, so no configuration can be fetched from a device. OPEN O-4. |
| 3 | `POST /api/ccm/resolve-drift` | Depends on #1/#2 — no config fetch/push path exists. OPEN O-5. |
| 4 | `POST /admin/updateJvmHeapSize`, `/api/admin/updateJvmHeapSize` | STRUCTURALLY IMPOSSIBLE, permanently N/A — not a missing feature. This build runs on Node.js, not Java: no JVM process exists, so there is no JVM heap to resize. The Node.js (V8) heap size is governed only by the `--max-old-space-size` flag at process start (e.g. `NODE_OPTIONS=--max-old-space-size=4096`) and cannot be changed by this API while the server is running. Closest real equivalent: that startup flag (documented in `DEPLOY.md` §1.3 and `README.md` §2) + live V8 heap figures in `GET /api/admin/GetSystemInformation`. See §23.6. |
| 5 | `POST /api/tools/terminal-exec` | No safe allow-listed command runner (SSH/Telnet session) exists; no command is executed. OPEN O-13. |
| 6 | `POST /api/tools/wmi-query` | No WMI/WinRM client exists. OPEN O-13. |
| 7 | `POST /api/tools/cli-query` | No CLI session runner exists. OPEN O-13. |
| 8 | `POST /api/workflows/execute` | No step executor exists (no SSH/WMI/CLI runner, no notification sender) and workflow steps have no defined action/type schema. Refused attempts are recorded as runs with status `'not_implemented'` and excluded from `executionCount`/`lastExecuted`. OPEN O-12. |

### 23.2 Implemented in phase 2 (was 501, now REAL — 14)

- **alarms.js (4):** `deleteAlarm`, `addNotes`, `addRCANotes`, `changeRCAStatus`
  — all store-backed now (`store.alarms.deleteAlarm` / `addNote` /
  `setRcaStatus`); acknowledge/clear also accept `{id}` (close-out fix).
- **settings.js (9):** templates create (`POST /api/settings/templates`),
  update (`PUT …/:id`), apply (`POST …/apply`); mail test; users create
  (`POST /api/settings/users`) and delete (`DELETE …/:id`); AD test
  (reachability-only — see known limits); SAML test (config validation, not a
  login flow); SSL test.
- **tools.js (1):** `POST /api/tools/mac-resolve` — real MAC from stored
  interface rows, this host's ARP cache, or live SNMP (ifPhysAddress /
  ipNetToMedia / ipNetToPhysical tables).

### 23.3 New REAL definitions in phase 2 (7)

- **agents.js (+1):** `GET /api/agent/list` split from `GET /api/agents` —
  key-authenticated (agent one-time key or probe key hash, else admin session);
  `/api/agents` stays session-only.
- **workflows.js (+3):** `POST /api/workflows/validate`,
  `GET /api/workflows/:id`, `GET /api/workflows/:id/runs`.
- **devices.js (+3):** `GET` / `PUT` / `DELETE /api/devices/:id/thresholds`
  (per-device CPU/mem thresholds; poller defaults 90/80/90).
- **probes.js (+1, close-out):** `POST /api/json/enterprise/testCentralConnection`
  — real ICMP/TCP probe link test returning measured latency.

### 23.4 Close-out verification (live on :8060, merged tree, 2026-11-09)

- `verify-auth.sh` **11/11**; `verify-empty.sh` **16/16** on a fresh throwaway
  DB (same merged tree) and 8/8 on the live populated store, where every
  failure is real data (8 devices, 32 alarms) and every no-fake-data check
  passes.
- Agent `-test` exits **0** (enrolled via admin API, one-time key);
  test agent deregistered afterwards (status Offline).
- Login lockout: 4 bad logins → 401, 5th → **429** (`retryAfterSeconds: 900`),
  correct password during lockout → **429** (in-memory; cleared by restart).
- Must-change: flagged session → **403** on `/api/devices`, password change →
  200 with `mustChangePassword: false` (proven on the throwaway DB).
- mac-resolve `198.19.0.1` → **200**, MAC `da:c1:a4:cd:33:62`
  (source `host-arp-cache`).
- WebSocket: authenticated `/ws` receives `INITIAL_STATE` (probes 0, devices 8,
  alarmsCount 32) and `METRIC_TICK` (2 ticks from the natural 60 s poll cycle);
  unauthenticated `/ws` and `/PNSHandler` refused with **401**.
- Alarm lifecycle on real poller-raised availability alarms (ids 4–12):
  active → acknowledged → cleared via the API; final state all `cleared`.
- Thresholds: GET defaults (90/80/90) → PUT `cpu_critical: 95` persisted →
  DELETE restores defaults. Retention status endpoint reports honestly
  (`configured: false, status: 'Not configured', lastPurge: null`).
- Trap receiver binds **UDP 162** on the restarted shared server (previously
  squatted by worker servers); syslog receiver on UDP 514. Graceful shutdown
  checkpoints the WAL into `opmanager.db` (verified: single 159,744-byte
  `.db`, no sidecars after SIGTERM).
- Corrections to §22 item 5 ("not live-verified"): agent register → restart
  survival and the threshold-breach raise/ack/clear cycle are now verified
  (threshold breach in a throwaway DB by the thresholds agent; alarm ack/clear
  on live poller-raised alarms above). Trap-receiver *binding* is verified;
  over-the-wire trap *ingestion* on a live host is still not verified.

### 23.5 Known limitations (documented, not fixed)

- The bundled `opmanager-suite.js` hardcodes a `"Not Configured"` retention
  label in the UI; the API (`GET /api/settings/system` → `retention`) is
  truthful.
- Render free plan wipes `server/data` on redeploy (SQLite state is lost).
- Live SNMP polling from this VM is blocked by the sandbox (`send EPERM` on
  UDP 161) — real values need a UDP-capable host/relay; the poller reports
  the failure honestly (502 / `Down` with null metrics, never invented values).
- The poller alarm-dedupe set is in-memory per instance: alarms raised before
  a restart will not auto-resolve after it (they stay until acknowledged/cleared).
- Template `apply` records assignments; nothing consumes them yet.
- AD test is reachability-only; SAML test validates config, not a login flow.
- `/api/json` dead-alias pattern: `server/index.js` strips the `/api/json`
  prefix before routing, so a `/api/json/*` path only works when its stripped
  form is also registered. Fixed for every path the UI calls (alarms, device
  add/pollNow, probe add, testCentralConnection); other route files may still
  carry unregistered `/api/json/*` aliases that 404 — audit before relying on
  any `/api/json/*` path not listed here.

### 23.6 Phase-3 jvm-doc (2026-11-09) — the ONE item that cannot be made real

`POST /admin/updateJvmHeapSize` (+ `/api/admin/updateJvmHeapSize`) is the
single remaining 501 that is **structurally impossible** in this build, not
a gap awaiting implementation. The exact reason, now returned verbatim in
the endpoint's 501 body (`server/routes/settings.js`):

> "This build runs on Node.js, not Java: no JVM process exists, so there is
> no JVM heap to resize. The Node.js (V8) heap size is governed by the
> --max-old-space-size flag at process start (e.g.
> NODE_OPTIONS=--max-old-space-size=4096) and cannot be changed by this API
> while the server is running. Restart the server with that flag to change
> the heap limit."

No JVM metric is invented anywhere: `GET /api/admin/GetSystemInformation`
returns live V8 heap figures (`runtime.heapTotalMB` / `heapUsedMB`) and
`jvmInfo: null`; `GET /admin/GetThreadDump` likewise reports real Node
runtime data with `threadDump: null` and the note "no JVM".

Closest real equivalent (documented, not faked): the
`NODE_OPTIONS=--max-old-space-size=<MB>` startup setting — `DEPLOY.md`
§1.3 (local, Docker Compose, plain `docker run`, Render) and `README.md`
§2. Verified live 2026-11-09 on Node v24.22.1: default `heap_size_limit`
2240 MB → 4288 MB with `--max-old-space-size=4096` (limit ≈ flag + ~192 MB
overhead); the server started with that flag serves normally and the
endpoint still answers 501 with the message above (proven on a throwaway
DB, own server instance on port 8124: authed POST to both paths → 501
`{status:'error', error:'not_implemented', message:<above>}`;
unauthenticated POST → 401 from the API auth guard).

Route counts are unchanged by this track: still 193 definitions — 164
REAL, 21 HONEST-EMPTY, 8 × 501, 0 FAKE. The other seven 501s remain
implementable-in-principle (see §23.1); only #4 is permanently N/A.

## 24. Phase 3 + Phase 4 close-out — recount, 501 triage, proofs (2026-11-09)

**Counts after the phase-4 close-out merge: 232 route definitions — 210
REAL, 21 HONEST-EMPTY, 1 unconditional NOT-IMPLEMENTED (501), 0 FAKE.**
Method: one entry per `router.*()` call, same as §22; every `status(501)`
site (20 sites, listed in §24.2) read to its owning definition.
Conditional 501s (a real endpoint that 501s only when nothing is
configured to test, when a dependency module failed to load, or when the
caller asked for a protocol with no runner — mail/failover/AD/SAML/proxy/
SSL tests, SNMPv3 when the service is absent, Telnet CLI, SAML/AD/HA
before any config exists) count as REAL, exactly as in phase 2; only
definitions that *always* refuse are counted 501. The 21 HONEST-EMPTY are
unchanged from phase 2 (same routes, same empty responses — Business
Views, Layer 2 maps, dashboard widget list, compliance/FWA/NFA empties,
and the rest listed in §22).

Base: phase-2 tip `ff51df6` (193 defs). Phase 3 added 39 definitions, all
REAL; 7 of phase 2's 8 unconditional 501s became REAL (§24.1). Verified
on the close-out clone (`~/workspace/opm-p4/closeout`, branch `real-data`,
NOT pushed) with its own throwaway server on port 8170 (bootstrap
password changed first) and `scripts/verify-p3.sh` on port 8137 — see
`REALDATA.md` §12 for the full evidence log.

### 24.1 Former phase-2 501s — all resolved except JVM (7 of 8 now REAL)

| # | Route definition | Now |
| --- | --- | --- |
| 1 | `POST /api/ccm/push` (+ legacy aliases) | REAL — stages an approval (202) with `dryRun: true, sent: false, sentToDevice: false`; approve/reject/execute are admin-only; approve → dry-run execute only. Nothing is ever sent to a device; no live push exists. See §24.3 NCM. |
| 2 | `POST /api/ccm/backup-device`, `/api/ccm/backup` | REAL — real SSH fetch (`ssh2`) of `show running-config`; 501 only when no SSH credential is stored for the device (conditional, §24.2). |
| 3 | `POST /api/ccm/resolve-drift` | REAL — stages an approval (202) with the exact diff + remediation commands; drift approve/reject/execute are admin-only; approve → dry-run only. |
| 4 | `POST /admin/updateJvmHeapSize`, `/api/admin/updateJvmHeapSize` | **Still 501 — permanently N/A, the one unconditional 501.** Structurally impossible: no JVM exists in this Node.js build (see §23.6). Never invent a JVM metric; the 501 body carries the exact reason and the V8 flag. |
| 5 | `POST /api/tools/terminal-exec` | REAL — allow-listed local commands via `execFile` (shell:false) + exact SSH strings via `ssh2`. Anything else → 403. |
| 6 | `POST /api/tools/wmi-query` | REAL — WinRM SOAP + NTLMv2 (Basic only over HTTPS or explicit opt-in). SELECT-only WQL. |
| 7 | `POST /api/tools/cli-query` | REAL — SSHv2 only, exact allow-list strings. Telnet → honest 501 (no Telnet runner exists). |
| 8 | `POST /api/workflows/execute` | REAL — step executor (cli/ssh/wmi steps, admin-only, stops at first failure). 501 only if the executor modules fail to load (`executor_unavailable`). |

### 24.2 All 20 `status(501)` sites — classification

Every site below is **conditional** except the JVM heap row. None of
them is a route that always refuses.

| # | Site | Fires only when | Class |
| --- | --- | --- | --- |
| 1 | `settings.js` JVM heap (`POST /admin/updateJvmHeapSize`, `/api/admin/updateJvmHeapSize`) | Always | **Unconditional 501 — honest N/A** (see §23.6) |
| 2 | `ccm.js` backup (`POST /api/ccm/backup-device`, `/api/ccm/backup`) | No SSH credential stored for the device | Conditional — nothing to fetch with |
| 3 | `tools.js` snmp-query v3 guard | `snmpGetV3`/`validateV3` missing from the service (dead guard in the merged tree — the service provides them) | Conditional — never fires in this tree |
| 4 | `tools.js` snmp-walk v3 guard | Same as #3 for `snmpWalkV3` | Conditional — never fires in this tree |
| 5 | `tools.js` cli-query Telnet | Protocol is not SSHv2/ssh | Conditional — no Telnet runner |
| 6 | `workflows.js` execute | Executor modules (`runner`/`winrm`) failed to load | Conditional — degraded-state guard |
| 7 | `saml.js` `serviceOr501` (metadata/login/ACS/status) | SAML service module failed to load | Conditional — never fires in this tree |
| 8 | `saml.js` metadata | No SP entity ID / ACS URL configured | Conditional — nothing to describe |
| 9 | `saml.js` login | IdP config has issues (no IdP entity/SSO URL/certificate) | Conditional — nothing to log in against |
| 10 | `saml.js` ACS | IdP config has issues | Conditional |
| 11 | `ad.js` users (`GET /api/ad/users`) | No LDAP URL configured (`resolveLdapConfig` returns no URL) | Conditional — nothing to query |
| 12 | `ad.js` groups (`GET /api/ad/groups`) | Same as #11 | Conditional |
| 13 | `ha.js` `haOr501` (all `/api/ha/*`, `/api/settings/ha`) | HA service module failed to load | Conditional — never fires in this tree |
| 14 | `settings.js` `templateIndexOr501` | Template index module failed to load | Conditional — never fires in this tree |
| 15 | `settings.js` mail test | No mail server configured | Conditional — nothing to test |
| 16 | `settings.js` failover test | No standby node stored | Conditional — nothing to heartbeat |
| 17 | `settings.js` AD test | No LDAP URL configured | Conditional — nothing to test |
| 18 | `settings.js` SAML test | No SAML configuration stored | Conditional — nothing to validate |
| 19 | `settings.js` proxy test | No proxy configured | Conditional — nothing to test through |
| 20 | `settings.js` SSL test | No TLS target and no stored certificate | Conditional — nothing to verify |

### 24.3 New REAL definitions in phase 3 (39)

- **ad.js (+2):** `GET /api/ad/users`, `GET /api/ad/groups` — real LDAP
  search against the configured directory (bind password per call, never
  stored); 501 only when no LDAP URL is configured.
- **ccm.js (+5):** `GET /api/ccm/approvals`, `GET /api/ccm/approvals/:id`,
  `POST …/:id/approve|reject|execute` — the NCM approval queue on the
  canonical service (`server/services/ncm.js`, store key `settings.ncm`).
  Execute is dry-run only, always. Approve/reject/execute are admin-only.
- **devices.js (+1):** `PUT /api/devices/:id` (admin-only) — device update
  with the canonical `snmp` object (v2c/v3, masked on read).
- **diff.js (+5):** `GET /api/ccm/drift-approvals`, `GET …/:id`,
  `POST …/:id/approve|reject|execute` — drift-remediation approvals on
  the same canonical NCM service. Approve/reject/execute are admin-only.
- **ha.js (+9, new file):** `GET /api/ha/status|peers|decisions`,
  `POST /api/ha/register|heartbeat|failover/test`,
  `GET|POST /api/settings/ha`, `POST /api/settings/ha/test` — HA service
  (persisted peers, atomic lease, sticky promotion, fencing, audit log).
  Status response carries `evaluatedAt` (ISO) and `self.uptimeSeconds`
  (added at close-out for the verify harness).
- **ncm.js (+7, new file):** `GET /api/ncm/approvals`, `GET …/:id`,
  `POST /api/ncm/approvals`, `POST …/:id/approve|reject|execute|dry-run`
  — the canonical NCM approval API (stage → approve → dry-run execute;
  explicit `dryRun:false` → 422 `dry_run_only`, never 501).
- **saml.js (+4, new file):** `GET /api/auth/saml/metadata|login|status`,
  `POST /api/auth/saml/acs` — strict node-saml SP (signed request/response/
  assertion, audience/issuer, 5-min skew, `validateInResponseTo` always,
  replay rejection, encrypted assertions supported; IdP-initiated SSO
  rejected). ACS path is `/api/auth/saml/acs` everywhere.
- **settings.js (+4):** `DELETE /api/settings/templates/apply/:deviceId`
  (template unapply), `GET /api/settings/templates/applied/:deviceId`,
  `GET|POST /api/settings/auth/ldap` (canonical `settings.ldap`; bind
  password never stored).
- **tools.js (+2):** `GET /api/tools/runner-allowed` (unified allow-list),
  `POST /api/tools/mac-port` (switch-port step of mac-resolve).
- **Rewrites (not new definitions, now REAL):** `POST /api/ccm/backup`
  (real SSH fetch), `POST /api/tools/terminal-exec|wmi-query|cli-query`,
  `POST /api/workflows/execute`, `POST /api/settings/auth/ad/test`
  (real LDAP bind).

### 24.4 Per-area proof (close-out re-run, 2026-11-09)

- `scripts/verify-auth.sh` **11/11** and `scripts/verify-empty.sh`
  **16/16** on the close-out server (:8170, throwaway DB, bootstrap
  password changed first).
- `scripts/verify-p3.sh` **10/11 outcomes PASS** (checks 2–9 + 10a/10b):
  WMI no-host 400; SAML metadata 200 with the right entityID; AD
  bad-bind 401 + good-bind control 200; HA status `single-node` /
  `standby` with advancing `evaluatedAt`; template apply
  cpu_trouble=70 cpu_critical=90 mem_critical=95 pollIntervalSec=60;
  NCM stage → approve → dry-run 200 + unapproved execute 409;
  terminal-exec `arp -n` 200 + disallowed 403s; JVM 501 with the exact
  reason; verify-auth/empty re-run inside the harness. **Check 1
  (SNMPv3 live query) FAILs only on the sandbox: this VM blocks outbound
  UDP (`send EPERM` to 127.0.0.1:161), so no process here can complete a
  v3 query against the harness-started snmpd.** The endpoint genuinely
  attempts the query (the 502 names the EPERM). The v3 code path itself
  is proven by the area's own harness: `scripts/test-snmpv3.js`
  **17/17 PASS** when run with `node --openssl-legacy-provider`
  (see the DES note below) and `scripts/snmpv3-unit-check.js` ALL PASS.
- Area proofs re-run at merge time (see `MERGE.md`, M1/M5 final
  reports received after the merge): SNMPv3 service proof 28/28 + unit
  17/17 + `scripts/test-snmpv3.js` 17 PASS / 0 FAIL / 0 GAP + tools
  proof 21 passed / 8 failed (all 8 are the same live-UDP EPERM sandbox
  block as verify-p3 check 1, not code) + live v2c regression via the
  relay vs Techub Core 192.168.30.2 (cpu 7, mem 37.6%, 42 interfaces);
  WinRM selftest 52/52; SAML selftest 33/33 + proof 16/16; LDAP local
  proof 16/16 + test-ldap 21/21; NCM unit 9/9 + drift 12/12 + backup
  26/26 + test-ncm 7/7; HA unit 22/22 + live route checks 19/19 +
  two-instance E2E (standby promoted, gap observed 13,319 ms /
  recorded 15,054 ms) + harness `scripts/test-ha.js` final run C0–C5
  6/6 PASS. `GET /api/ha/decisions` was confirmed present in `p4m-ha`
  — close-out did not need to add it. Incident note (M1, disclosed, no
  merge impact): M1 accidentally killed M5's HA standby (PID 30674)
  with a blind `pkill` during cleanup; M5 rebuilt it and the final
  harness run after the kill passed 6/6. Lesson: kill by exact PID
  only, never blind `pkill`.
- `node --check`: every `server/**/*.js` file + `client/js/app.js` +
  all 15 `client/js/p3/*.js` partials pass.
- Fake-data grep: **0 live `Math.random()` calls** in server/client
  code; **0** of the five old hardcoded secrets
  (`OPM_CENTRAL_AUTH_TOKEN_77a82b9`,
  `OPM-CENTRAL-REST-API-KEY-928104-GA-129203`,
  `ee-central-auth-9a8c7b6d5e4f3a2b1c0d`, `OPM_EE_PROBE_SEC_KEY_1`,
  `OPM_EE_CENTRAL_ROOT_SECRET_2026`); **0** `admin/admin`. The only
  remaining hardcoded key material is H1 (§24.5).

### 24.5 Security re-check (audit-prep H1, L1–L4 — close-out, live :8170)

- **L1 (device SNMP community in API responses) — FIXED by the phase-3
  SNMPv3 merge** (`store.publicDevice`/`snmpForResponse` masking).
  Re-proven live: v2c community and v3 auth/priv passphrases absent
  from device create, list, and single-device responses.
- **L2 (credential-library community) — FIXED at close-out**
  (`settings.js` `publicCredential`): `GET`/`POST
  /api/settings/credentials` now return `community: null` +
  `communityConfigured`. The community stays stored server-side for
  the poller/credential test; only responses are masked. No client
  reads `community` from this endpoint. Verified live.
- **L3 (SAML `spKey` in responses) — FIXED at close-out**: `GET`/`POST
  /api/settings/auth/saml` now return `spKey: null` +
  `spKeyConfigured` (same pattern as the existing certificate
  handling). The SAML service reads the SP key from env/file only and
  ignores any stored `spKey`, so no behaviour changes. Verified live.
- **L4 (SSL private key in responses) — FIXED at close-out**: `GET`/`POST
  /api/settings/ssl` now return `privateKey: null` +
  `privateKeyConfigured`. The certificate is public key material and is
  kept. Verified live.
- **H1 (CRITICAL, hardcoded probe AuthKey — endpoint closed in phase 5,
  key rotation still pending).** Phase-5 FIX-A4SEC closed the unauthenticated
  exposure: unauthenticated `GET /OPMAgentServerInfo.json` (and the five
  sibling paths) now return **401**; the admin/keyed route returns a
  live-derived payload with **no `AuthKey` field**; the tracked static
  files `client/OPMAgentServerInfo.json` and
  `client/downloads/OPMAgentServerInfo.json` are **deleted**; the shipped
  `client/downloads/OpManagerAgent.zip` was rebuilt in phase 5 without
  them (new agent exe, real MSI kept, README + bats fixed). Verified live
  on the merged tree (:8060): unauthenticated + wrong-key requests 401
  and create no agent rows; a valid admin-issued key still acks telemetry.
  **What remains:** the old key value itself is still the live credential
  for agents already registered against the relay deploy (phase-2 code),
  so it cannot be rotated from here. **Fix plan (for the parent/user to
  approve with relay access):** (1) confirm on the relay whether any
  registered agent/probe key hash equals SHA-256 of the old value
  (`12d2e97939be5d0c1dc56fd4e80a024339cf01daf15d033e7166db7418ffd450`);
  (2) if none, nothing further is needed — the value is already unpublished;
  (3) if one does match, rotate that agent/probe to a fresh one-time key
  first (re-register via `POST /api/agents/register`), then the old value
  is dead. Also established: the constant is **not** accepted as a
  credential by this server — `authenticateAgent` only accepts a key whose
  SHA-256 matches a stored `api_keys` (`agent:<id>`) or probe row, and no
  seed data exists, so on a fresh DB the old key authenticates nothing.
  The old key value itself is deliberately **not reproduced** in this
  document. Residual code-level items from the audit baseline (L5–L10:
  `?community=` on test-monitors, token folding, plaintext credential
  columns at rest, missing error middleware) remain open — not re-verified
  in this pass.

### 24.6 Known limitation — SNMPv3 DES privacy needs the OpenSSL legacy provider

Node 24 bundles OpenSSL 3, where single-DES (`des-cbc`) is disabled by
default: `crypto.createCipheriv('des-cbc', …)` throws
`error:0308010C:digital envelope routines::unsupported`. MD5, SHA,
AES-128-CBC and 3DES all work without it. Consequence: **SNMPv3
authPriv with `privProtocol: 'des'` fails on a stock Node 24 start**,
while `privProtocol: 'aes'` works out of the box. Proven:
`scripts/test-snmpv3.js` scores 15/17 without the flag (happy path
fails on the DES cipher; the wrong-passphrase cases then "pass"
vacuously on the same OpenSSL error) and **17/17 with
`node --openssl-legacy-provider`**. The server start was **not**
changed to enable the legacy provider — that re-enables legacy crypto
process-wide and needs an explicit operator decision. Until then:
prefer AES privacy on v3 devices; use DES only with
`NODE_OPTIONS=--openssl-legacy-provider`. Documented in
`docs/snmpv3-setup.md` as well. (Separate from the UDP sandbox block:
even with the flag, a live v3 query still needs a UDP-capable host.)

### 24.7 UI wiring (close-out)

All 15 `client/js/p3/*.js` partials are loaded by `client/noc.html`
after `app.js` and wired in `client/js/app.js` (see `REALDATA.md`
§12.4). New sub-tabs: CCM `Change Approvals`; Settings `High
Availability`, `SAML Single Sign-On`, `LDAP / Active Directory`,
`AD Browser`, `Device Templates`, `Tools Terminal`, `Workflow Runs`.
Load order matters for one collision: `settings-ui-saml.js` loads
before `saml-ui.js` — both register `renderSamlSettingsView` and
saml-ui.js's fuller form wins. HA: `ha-ui.js` owns the tab (status
view); the settings form opens on demand from a button inside it.

### 24.8 Exact missing external pieces (nothing else is missing)

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

## 25. Phase-5 close-out — audit, all-bugs fix, honest-empty elimination, verification (2026-11-09)

Branch `p4-exe-audit`, base `b1de62c`, merged tip `a0f2af3` (NOT pushed —
GitHub credential unavailable; parent pushes). 14 tracks, all completed;
wave-1 audit catalogs in `~/workspace/opm-p5/audit/` (A1–A4, A6).
Coordinator verification ran on a throwaway copy of the merged tree
(`~/workspace/opm-verify`, fresh DB, port 8060) — see `REALDATA.md` §13.

### 25.1 Counts after the phase-5 merge

**232 route definitions — 227 REAL, 4 HONEST-EMPTY, 1 unconditional
NOT-IMPLEMENTED (501), 0 FAKE.** No new route definitions were added;
17 of the 21 HONEST-EMPTY became REAL:

| Track | Conversions (EMPTY → REAL) | Notes |
| --- | --- | --- |
| HE-1 (`a771492`, merged `634bd1a`) | `getUserNotification`, `getNewFeatures` | New `notifications` table fed by real events only; build metadata from live git + baked `server/build-info.json`. `getRCANotes` was already REAL (stale claim corrected, no code change). |
| HE-2 (`732e421`) | Virtualization summary, firewall-rules list | Hypervisor hosts derived from stored device identity (sysObjectID 6876 = VMware, vendor keywords); guest VMs never enumerated (poller polls no VM MIB table — documented limit). Firewall rules parsed from stored NCM running configs (Cisco IOS ACLs + pfSense `<rule>` blocks). |
| HE-3a (`6db862f`, merged `4f746b6`) | 8 ncmclient routes | Dashboards, messages, custom views, CCTV, tab details, floors, alarm sounds, logical groups. `getLayer2Maps` stays EMPTY (no LLDP/CDP/MAC-ARP collection). |
| HE-3b (`1fe28db`, merged `fbe78e6`) | 4 ncmclient routes | `getSecurityScore`, `getComplianceStatus`, `getconfigChangesStatus`, `getFirmVulnDetails` (REAL firmware inventory; vuln fields honest-empty). |
| DASH-1 (`086bfed`, merged `18362a1`) | — (widget, not a route) | Host Agents card on the main dashboard, fed by `GET /api/agent/list`. See §25.3. |
| AGENT (`58cd669`, merged `533248a`) | — (Go agent, not a route) | All 3 live-probe bugs fixed. See §25.3. |
| ROUTING-1 (`e3441b0`, merged `9c8d840`) | — (routing, not a route) | Fixed the `server/index.js` classic-module redirect collision (13 ncmclient endpoints 302d). API.md §11 prefixes corrected to the real mounts. |
| FIX-A3Q (`9963ec8`, merged `d5d57f6`) | — (poller + gate fixes) | `normalizeSnmpVersion()` (`2c`/`2`→`v2c`); CCM/drift admin-only; CCM push 202 now honestly `dryRun: true`. |
| FIX-A4SEC (`c2beeb8`, merged `908ec39`) | — (auth fixes) | A4 G-01/G-02/G-03/G-27 closed. See §25.4. |
| Coordinator fix (`a0f2af3`) | — (agent default + guard) | No demo Central default in the Go agent; logout exempt from the must-change guard. See §25.3/§25.5. |

Remaining HONEST-EMPTY (4, all `ncmclient.js`, each with the exact
reason in its §11 row): `getLayer2Maps` (no LLDP/CDP/MAC-ARP collection),
`getFirmVulCveSeverityStatus` + `getFirmVulDeviceSeverityStatus` (no CVE
feed anywhere in the repo), `getUpcomingEolDevices` (no lifecycle source).
`getFirmVulnDetails` is REAL for firmware inventory with honest-empty
vulnerability fields. The one 501 is still `updateJvmHeapSize` (JVM heap,
structurally impossible in a Node build — §23.6).

### 25.2 Audit catalogs (wave 1 — what was found)

- **A1** (`~/workspace/opm-p5/audit/A1-gaps.md`, 33 gaps): poller rejects
  stored `2c`; REST↔UI field mismatch (D-01); discovery sends credential
  id as `snmpVersion` (X-01 — FIXED by W2-2: client sends `credentialId`,
  server resolves the profile to its real version/community, sweep speaks
  v2c/v3); rack view TypeError + invented cabinet
  (R-01/R-02); interfaces never shown anywhere (S-05); add/update device
  routes copy flat `snmpVersion` with no normalization (FIXED by W2-2:
  canonical `normalizeSnmpVersion` on every write path, strict 400 incl.
  v1, credential profile honoured — live-proven on PORT=8182, 34/35 proof
  checks passed, the 1 failure being the proof script's own history-range
  filter, corrected by direct history read: 5 runs completed,
  `found_count: 0`).
- **A2** (`A2-gaps.md`, 47 gaps): nothing ever notifies on alarm raise
  (A2-28); status-casing mismatch breaks the alarm UI (A2-13); severity
  escalation lost / restart duplicates alarms (A2-07); no notification
  profiles, zero of 19 real `*Mail.html` templates (A2-27+33); reports are
  a 7-report stub vs 491 real REPORTIDs (A2-37–41).
- **A3** (`A3-gaps.md`, 24 gaps): G-01 poller rejects `2c` (FIXED by
  FIX-A3Q); G-02 no compliance engine (17 real policy files); G-04 no
  real config-push delivery (by design — gate stays); G-05 traps are raw
  stored rows only; G-08 backup is SSH-only (1 of 7 transports); drift
  resolve always 422s.
- **A4** (`A4-gaps.md`, 33 gaps): 4 HIGH security bugs, all FIXED by
  FIX-A4SEC (G-01 unauthenticated agent self-register; G-02
  unauthenticated telemetry auto-create; G-03 `requireRole()` with zero
  callers; G-27 hardcoded Central identity served unauthenticated at six
  paths). Plus: no TOTP/MFA (G-04), no AD/LDAP/RADIUS console login
  (G-05), no role CRUD (G-10), no SMS settings (G-16), no probe installer
  generation (G-24).
- **A6** (`A6-api-gaps.md`, 1,872 methods classified into 73 features):
  3 COVERED / 42 PARTIAL / 28 MISSING features; 71 methods covered /
  1,798 missing. Classified at `b1de62c`, so verdicts predate the HE
  merges — recount after the next merge. 10 correctness risks flagged
  (R1–R10, incl. R8 hardcoded probe key — fixed by FIX-A4SEC).

### 25.3 Bugs fixed in phase 5

- **Go agent (a) sc.exe 1639** — `sc.exe create` argv now passes name/value
  as separate elements; unit tests incl. spaced paths. **(b) No Windows
  service handler** — real `windows/svc` handler vendored (`x/sys`
  v0.28.0); `GOOS=windows go build` + vet clean. **NOT proven on a real
  Windows host** — must be tested on DESKTOP-SDN3CJD before claiming it
  works there. **(c) CWD-dependent config** — `os.Executable()`-anchored
  `agent.conf`/`agent.id`/`agent.log`; 3/3 heartbeats from a foreign CWD;
  wrong key → 401. Go tests 10/10 (incl. 2 new no-demo-default tests).
- **Demo Central default removed (coordinator, `a0f2af3`)** — the agent no
  longer defaults to a baked-in demo server address: `DefaultServer` is
  empty, the `OPMAgentServerInfo.json` host fallback is empty, and a fresh
  agent with no server configured refuses to start with a clear error
  (verified end-to-end: exit 1, no key and with key). `-server` flag help
  uses a neutral example. `client/downloads/` rebuilt: `OpManagerAgent.zip`
  (new 5,529,600-byte exe, real MSI kept, **no** `OPMAgentServerInfo.json`
  copies, fixed README + bats), `OpManagerAgent-Windows-x64.zip`,
  `OpManagerAgent-linux.tar.gz`. Zero demo-server refs and zero key
  material in the shipped packages. macOS universal binary NOT rebuilt
  (`lipo` unavailable on Linux; `darwin/arm64` itself compiles).
- **DASH-1 Host Agents widget** — main-dashboard card (app.js only,
  +99/−1) fed by session-guarded `GET /api/agent/list`; rows show
  status/hostname/IP/CPU%/mem%/disk%/last heartbeat; honest empty and
  error states; "View All →" links to Inventory → Host Agents. Proven on
  the merged tree with a real agent row (admin register → keyed telemetry
  → Online 23.5/61.2/44.8) and a jsdom render with zero page errors.
  Reaches the live console only after push + redeploy. Visual layout in
  a real browser is still unconfirmed (jsdom only).
- **Logout blocked by the must-change guard (coordinator, `a0f2af3`)** —
  found by coordinator verification: a fresh bootstrap admin's logout
  403d and the session stayed valid. `POST /api/auth/logout` is now
  exempt from `requirePasswordChanged` alongside change-password
  (`server/index.js` + `server/services/session.js` comment).

### 25.4 Security fixes in phase 5 (FIX-A4SEC)

- G-01: `/servlets/RegisterAgent` + alias → 410 (never a registration).
- G-02: `/servlets/DataAgentHandlerServlet` + alias → 401 without a valid
  admin-issued key, nothing auto-created; valid key → 200 `ack:true`.
- G-03: `requireRole('admin')` on all user-management + admin-settings
  mutations (users CRUD, AD/LDAP/SAML save+test, mail, proxy,
  failover/HA, license, system/SSL, agent registration, probe add/delete).
- G-27: unauthenticated `/OPMAgentServerInfo.json` etc. → 401 on all six
  paths; admin/key → 200 with live-derived payload (primary host = first
  non-internal IPv4, port = actual listen port, probe = first registered
  probe or null, **no AuthKey field**); tracked static JSON files deleted.
- `/settings/` + `/support/` added to `LEGACY_API_PREFIXES` (ROUTING-1
  follow-up: `POST /settings/saveMailServer` was dead, not open — now
  401 unauthenticated / 403 Operator / 200 admin). §24.5 H1 paragraph
  corrected accordingly (the static key is no longer served
  unauthenticated; rotation of already-registered agents still pending —
  needs relay access).
- Deliberately NOT role-gated (needs a decision): credential-library POST,
  device-template POST/PUT/DELETE/apply, DB backup/vacuum, notification
  clear/hide. `AgentActionServlet`/`FileCollector`/`AgentDownloadServlet`
  still answer unauthenticated with `actions: []` / download redirect
  (G-29 stub, no state change).

### 25.5 Close-out verification (merged tree, 2026-11-09, throwaway copy :8060)

- `node --check` clean on all changed JS files since `b1de62c`.
- Fresh boot on :8060 (fresh DB, bootstrap password changed first):
  `verify-auth.sh` **11/11**, `verify-empty.sh` **16/16**,
  `verify-p3.sh` **10/10** (the `1-snmpv3` line fails with `send EPERM` —
  this VM blocks outbound UDP; the endpoint genuinely attempts the v3
  query, exactly as in phase 3).
- DASH-1 flow: admin register → keyed telemetry (`eeauthkey`) → Online
  with metrics 23.5/61.2/44.8 in `GET /api/agent/list`; jsdom render of
  the merged dashboard shows both rows, zero page errors.
- Grep: 0 fake markers, 0 hardcoded tokens (`ee-probe-101-central-key`,
  `OPM_ENTERPRISE_KEY`, `OPM_CENTRAL_SESSION_`) in shipped code; 0
  demo-server refs in shipped code (test fixtures + historical audit
  docs excluded). The `opmcsrfcookie` hits are the real product's own
  fluidic client code (CSRF cookie name), not our token.
- `server/build-info.json` regenerated at the merge tip (commit recorded
  inside) — regenerate again at packaging time.

### 25.6 What remains (wave 2 + wave 3, NOT in this merge)

- **Wave 2 (scoped, spawn from `a0f2af3`):** W2-1 D-01 field mapping +
  S-05 interfaces wiring; W2-2 X-01 discovery credential + write-side
  version normalization — DONE in this clone (live-proven on PORT=8182;
  see §7/§9 rows); W2-3 A2-13 status casing + A2-07 persistent
  dedup/escalation + `/api/alarm/clearAlarm` alias; W2-4 R-01 rack crash
  fix — DONE in this track (crash fixed, invented cabinet replaced with a
  real-data-only view + honest empty state; the real Rack Builder scope
  still needs a product decision); W2-5 `/inventory/` bare forms still 302 + the 3 missing
  `/api/ncmclient` registrations (`getClientServiceData`,
  `getMainMenuTabs`, `getUserPreference`) — DONE by W2-5 (Phase 5,
  2026-11-09, this clone): `/inventory/` added to
  `LEGACY_API_PREFIXES`, the 3 `/api/ncmclient/...` registrations added,
  §11 prefixes corrected; verified live on :8185 (see §11 W2-5 note).
  Route-definition count unchanged: 232 (227 REAL, 4 HONEST-EMPTY,
  1 × 501) — the 3 registrations are path aliases on existing
  definitions, not new definitions.
- **Wave 3 (triage by user value):** A2-28 alarm notifications (real SMTP
  consumer); A3 G-02 compliance engine; A3 G-05 trap parsers/MIB
  resolution/forwarding/correlation; A2-37+ reports expansion (scheduled/
  custom, PDF); A4 G-04 TOTP/MFA; A4 G-05 AD/LDAP/RADIUS console login;
  A6's 28 missing features; G-08 backup transports (TELNET/SNMP/TFTP/SCP/
  SFTP/REST + startup-config fetch + key auth).
- **Decisions needed:** credential-library / device-template / DB-backup /
  notification-clear role gating; staging routes (`POST /api/ccm/push`,
  `/resolve-drift`) any-authenticated follow-up; G-29 unauthenticated
  stubs; Windows service-handler proof on DESKTOP-SDN3CJD; macOS agent
  rebuild on a Mac; DASH-1 visual layout in a real browser; H1 key
  rotation check on the relay (see §25.4).
- **Never removed:** NCM config push stays DRY-RUN + HUMAN-REVIEW GATE.
  JVM heap stays 501 N/A. H1 hardcoded probe key stays unfixed for
  already-registered agents (fix plan in §25.4).
