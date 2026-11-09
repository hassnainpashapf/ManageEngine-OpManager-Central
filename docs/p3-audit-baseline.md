# Phase 3 audit baseline — `real-data` @ `ff51df6`

- **Base commit:** `ff51df6f16536dc729c24f192b5d8661a0381c94` ("Phase 2 close-out: merge all worker clones + close-out fixes")
- **Branch:** `real-data`. This baseline was produced in clone `~/workspace/opm-p3/audit-prep` on branch `p3-audit-prep`. **No code changes** were made except this file. Nothing was pushed. The shared `:8060` server and the relay were never touched.
- **Clone note:** the prescribed `git clone` from GitHub hung in `index-pack` for 13+ minutes (the same stall hit the sibling tracks' clones concurrently). The clone used here is a local `git clone` of the verified `~/workspace/opmanager-central-check` tree, which is itself at `ff51df6` with a clean status; `diff -r` between the two trees is empty (modulo two pre-existing symlink artefacts), `git rev-parse HEAD` = `ff51df6f…`, `git status` clean before this file was added, origin re-pointed at `https://github.com/hassnainpashapf/ManageEngine-OpManager-Central.git`. The audited tree is therefore byte-identical to `ff51df6`.
- **Date:** 2026-11-09. **Server used for live proof:** this clone only, `PORT=8138 node server/index.js`, throwaway DB in the clone's own `server/data/` (gitignored runtime artefacts, never committed). Test credentials existed only at runtime. The bootstrap password was never recorded anywhere; the two server log files that contained it were deleted after the run.

## Method and scope

Greps were run over the hand-written code: `server/index.js`, `server/routes/*.js` (18 files), `server/services/*.js` (9 files), `client/js/app.js`, plus targeted greps over `agent_src/`, `client/*.json`, `README.md`, `DEPLOY.md`, `Dockerfile`, `docker-compose.yml`, `render.yaml`, `start*.sh`.

**Excluded from the line-by-line audit, with counts (spot-checked, not ignored):**

| Excluded scope | Reason | Raw grep volume |
|---|---|---|
| `client/apiclient/**` (vendored ManageEngine/Zoho ITOM UI bundles, minified) | Third-party library code, not app data. `Math.random` occurs here (24 files: vis.js physics engine, toast-ID generation) — library internals, not fabricated readings. | `Math.random`: 24 files |
| `server/data/mibs/**`, `server/data/templates/**` (vendor MIB/template data) | Vendor data files (OIDs, model numbers). The strings `501`, `sample`, `demo` etc. occur thousands of times as model numbers (`PIX 501`, `NCS 5501`), MIB text ("not implemented for the active MAU"), and template names — not code behaviour. | `501`/`not implemented`: ~300 lines, all data |
| `node_modules/`, `.git/` | Dependencies / history. | — |
| `server/data/templates.json`, `server/data/templates/index.json` | Generated vendor indexes. | — |

Raw whole-tree counts before scoping (for the record): `demo|seed|sample|fake|mock|stub|canned|placeholder` (case-insensitive) = **1,893 lines**; `501|not implemented` = **358 lines**; `Math.random` = **59 lines**. After scoping to hand-written code the counts below are exact.

## Counts (audited scope)

| Check | Hits in audited scope | Live problems |
|---|---|---|
| `Math.random` in server code + `client/js/app.js` | 2 (both comments) | 0 |
| `demo`/`seed`/`sample`/`fake`/`mock`/`stub`/`canned`/`placeholder` in server code + `client/js/app.js` | 76 lines | 0 live fake-data code paths (all comments, legitimate words, or UI placeholder text — full list in §1) |
| Hardcoded tokens/keys/passwords | **1 critical** (H1) + community defaults (H2) | H1: hardcoded probe AuthKey served publicly; H2: `public` / `public_monitor_ro` defaults |
| `res.status(501)` call sites | **17** (covering **22 routes** — reconciles with the phase-2 "22×501" figure) | 8 unconditional, 2 version-conditional, 7 config-conditional |
| `console.(log\|error\|warn\|debug)` in `server/` | 62 lines | 0 log credential material |
| Credential-leak sites (API responses) | **4 proven live** (L1–L4) + 6 code-level (L5–L10) | L1–L4 reproduced against the :8138 instance (see Live proof) |

---

## 1. Fake-data markers

### 1a. `Math.random` — 2 hits, both comments, 0 live uses

| File:line | Text | Disposition |
|---|---|---|
| `server/services/snmp.js:15` | `*    Math.random. There is no fallback that fabricates a reading.` | Comment documenting removal. No live use. |
| `server/services/poller.js:15` | `*   - the 4 s Math.random random-walk cycle (CPU/memory/response-time drift)` | Comment documenting removal. No live use. |

`client/js/app.js`: **0** hits. No `Math.random` anywhere in live server or hand-written client code.

### 1b. `demo` / `seed` / `sample` / `fake` / `mock` / `stub` / `canned` / `placeholder` — 76 lines

Every hit is listed. Disposition codes: **DOC** = comment/header documenting the phase-2 fake-data removal (the word appears because the audit history is named); **LEGIT** = legitimate use of the word (`sample` = poll sample, `seed` = first-admin seeding, `placeholder` = SQL `?` placeholder / HTML `placeholder=` attribute); **UI** = user-facing placeholder/help text, not data.

| File:line | Hit (truncated) | Disposition |
|---|---|---|
| `server/index.js:572` | `// Startup: seed the first admin (if none exists)…` | LEGIT — first-admin bootstrap |
| `server/index.js:578` | `…ensureFirstAdmin FAILED…no admin was seeded` | LEGIT — bootstrap log text |
| `server/index.js:581` | `…ensureFirstAdmin NOT AVAILABLE…no first admin was seeded.` | LEGIT — bootstrap log text |
| `server/index.js:584` | `…ensureFirstAdmin FAILED…no admin was seeded` | LEGIT — bootstrap log text |
| `server/routes/hardware.js:6` | `// Audit H1…previous version returned a canned…` | DOC |
| `server/routes/traps.js:7` | `* store.saveTrap). No in-memory seed arrays, no invented entries…` | DOC |
| `server/routes/ncmclient.js:5` | `* Rebuilt from the 2026-11-09 fake-data audits (ncm-traps-zia.md N1–N20…` | DOC |
| `server/routes/racks.js:6` | `* the old empty-array RACKS constant was never populated, seeded,…` | DOC |
| `server/routes/reports.js:8` | `*    poll samples in the metrics table over an explicit window` | LEGIT — poll samples |
| `server/routes/reports.js:10` | `*    With no samples there is no data: availability is null, never 100%.` | LEGIT |
| `server/routes/reports.js:20` | `* Response-shape changes vs the old fake implementation…` | DOC |
| `server/routes/reports.js:22` | `*    there are no metric samples in the window (were 100 / 0)…` | DOC + LEGIT |
| `server/routes/reports.js:23` | `*    \`window\` and \`sampleCount\` / \`devicesWithSamples\` fields.` | LEGIT |
| `server/routes/reports.js:110` | `* Per-device stats from real poll samples in [since, until].` | LEGIT |
| `server/routes/reports.js:111` | `* Availability = share of samples in the window… No samples -> availability null.` | LEGIT |
| `server/routes/reports.js:115` | `const samples = store…` | LEGIT |
| `server/routes/reports.js:118` | `if (samples.length === 0) {` | LEGIT |
| `server/routes/reports.js:119` | `return { availability: null, sampleCount: 0, … }` | LEGIT |
| `server/routes/reports.js:121` | `const answered = samples.filter((m) => m.response_ms !== null…` | LEGIT |
| `server/routes/reports.js:123` | `availability: round((answered / samples.length) * 100, 2),` | LEGIT |
| `server/routes/reports.js:124` | `sampleCount: samples.length,` | LEGIT |
| `server/routes/reports.js:125` | `avgResponseMs: round(mean(samples.map((m) => m.response_ms)), 1),` | LEGIT |
| `server/routes/reports.js:126` | `avgCpuPct: round(mean(samples.map((m) => m.cpu_pct)), 1),` | LEGIT |
| `server/routes/reports.js:127` | `avgMemPct: round(mean(samples.map((m) => m.mem_used_pct)), 1),` | LEGIT |
| `server/routes/reports.js:131` | `/** Latest real reading…newest metric sample, else the device row snapshot. */` | LEGIT |
| `server/routes/reports.js:141` | `/** Overall availability…Null when no device has samples. */` | LEGIT |
| `server/routes/reports.js:182` | `//    stored poll samples; null when no samples exist (no history).` | LEGIT |
| `server/routes/reports.js:221` | `// Reports overview & availability, computed from real metric samples…` | LEGIT |
| `server/routes/reports.js:222` | `// an explicit window. No samples -> avgAvailability / avgResponseTime null.` | LEGIT |
| `server/routes/reports.js:232` | `const allSamples = devices.flatMap((d) =>…` | LEGIT |
| `server/routes/reports.js:235` | `const avgResponseTime = round(mean(allSamples.map((m) => m.response_ms)), 1);` | LEGIT |
| `server/routes/reports.js:236` | `const sampleCount = allSamples.length;` | LEGIT |
| `server/routes/reports.js:237` | `const devicesWithSamples = windowStats.filter((s) => s.sampleCount > 0).length;` | LEGIT |
| `server/routes/reports.js:239` | `// Top 5 by latest real reading (metric sample, else device snapshot).` | LEGIT |
| `server/routes/reports.js:269` | `sampleCount,` | LEGIT |
| `server/routes/reports.js:270` | `devicesWithSamples,` | LEGIT |
| `server/routes/reports.js:406` | `// real probe count, availability from real metric samples over the requested…` | LEGIT |
| `server/routes/reports.js:570` | `<div>Availability is computed from stored poll samples…N/A means no samples were recorded.</div>` | LEGIT |
| `server/routes/reports.js:623` | `// 30-day SLA & MTTR from real data: availability from metric samples…` | LEGIT |
| `server/routes/alarms.js:329` | `// There is no canned story: no confidence is claimed (null)…` | DOC |
| `server/routes/alarms.js:502` | `// list, and never a fake success for data that does not exist.` | DOC |
| `server/routes/tools.js:841` | `// Outside-scope canned endpoints (audit E1–E3). There is no real backend for…` | DOC |
| `server/routes/tools.js:843` | `// client — so they answer an honest 501 instead of returning canned…` | DOC |
| `server/routes/workflows.js:9` | `*    one via POST /api/workflows/create. No workflow is seeded.` | DOC |
| `server/routes/discovery.js:10` | `*    created as devices. No sample catalog, no random selection.` | DOC |
| `server/routes/discovery.js:21` | `*    answered. No invented serial, no fake backup status.` | DOC |
| `server/routes/probes.js:7` | `* performed at request time. There is no seed/demo probe: the store starts…` | DOC |
| `server/routes/probes.js:23` | `*    actually happened. A sync is never faked with a timestamp stamp.` | DOC |
| `server/routes/probes.js:460` | `// but no route existed for it — it 404'd. It is a real check, not a stub:` | DOC |
| `server/routes/settings.js:7` | `*  - No canned constants: every value comes from the live runtime (os/process),` | DOC |
| `server/routes/settings.js:544` | `// from the store (never the old fake 16 devices / 4 probes).` | DOC |
| `server/routes/settings.js:997` | `* Nothing is faked: a step that fails returns its real SMTP reply…` | DOC |
| `server/routes/devices.js:19` | `// needs one returns an honest 503 instead of fake data when it is absent.` | DOC |
| `server/routes/devices.js:75` | `let totalSamples = 0;` | LEGIT |
| `server/routes/devices.js:79` | `const samples = rows.filter((r) => r.ts >= bucketStart && r.ts < bucketEnd);` | LEGIT |
| `server/routes/devices.js:80` | `const up = samples.filter((r) => r.response_ms !== null…` | LEGIT |
| `server/routes/devices.js:81` | `const total = samples.length;` | LEGIT |
| `server/routes/devices.js:83` | `samples: total` | LEGIT |
| `server/routes/devices.js:88` | `samples: total` | LEGIT |
| `server/routes/devices.js:92` | `overallAvailability: totalSamples === 0 ? null : …` | LEGIT |
| `server/routes/devices.js:204` | `// returns the measured loss/RTTs and verbatim-style output. Nothing canned.` | DOC |
| `server/routes/devices.js:410` | `// placeholder MAC, no fixed interface traffic.` | DOC |
| `server/services/templateIndex.js:7` | `* (562 files, 12 MB, real sysOIDs). No fake data: every entry comes from a…` | DOC |
| `server/services/trapReceiver.js:5` | `* Replaces the T1/T2 stubs (audit ncm-traps-zia.md)…` | DOC |
| `server/services/store.js:5` | `* Replaces the old fake JSON store (server/services/db.js, deleted).` | DOC |
| `server/services/store.js:15` | `*  - No seed/demo data: every table starts empty.` | DOC |
| `server/services/store.js:325` | `const placeholders = columns.map(() => '?').join(', ');` | LEGIT — SQL placeholders |
| `server/services/store.js:327` | `.prepare(\`INSERT INTO ${table} … VALUES (${placeholders})\`)` | LEGIT — SQL placeholders |
| `server/services/poller.js:17` | `*   - the ~20 s fake ALARM_TOAST rebroadcast of a random old alarm` | DOC |
| `client/js/app.js:234` | `// do next), never demo rows.` | DOC |
| `client/js/app.js:2211` | `// read fake-shape fields (trap.varbinds, trap.severity,…` | DOC |
| `client/js/app.js:2302` | `// message text. The previous code read fake-shape fields…` | DOC |
| `client/js/app.js:2855` | `<input … placeholder="e.g. 192.168.1.0/24 or 10.10.1.1-10.10.1.254">` | UI — input placeholder text |
| `client/js/app.js:2921` | `function ipInScannedRange(ip, rangeText) {` | LEGIT — "scanned range" contains `sample`? No: hit is on `range` matching `sample`? No — the match is the word `sample` inside… (see note) |
| `client/js/app.js:3049` | `found = inStore.filter((d) => ipInScannedRange(d.ip, ipRange));` | LEGIT — same function name |

Note on `app.js:2921` / `3049`: the grep matched because `ipInScannedRange` contains the substring `scan`… no — the pattern list includes `sample`; `ipInScannedRange` contains `…nScanned…`, and `Scanned` contains `scan` but the matched term is `sample`? It matched on the case-insensitive pattern `sample`? `Scanned` does not contain `sample`. The actual match is the pattern `seed`/`sample`/`demo`…: `ipInScannedRange` — "InScanned" contains "scan", not in the list. Re-check: the pattern was `demo|seed|sample|fake|mock|stub|canned|placeholder`. `ipInScannedRange` contains `…canned…` — **"sCANNED"** contains `canned`. Yes: `ipInS**canned**Range` matches `canned`. Disposition: LEGIT — the word is "scanned" (past tense of scan), not "canned responses". Same for line 3049 (call site of the same function).

**No demo accounts:** grep for `demo.com`, `@demo`, `demo-user` across `server/`, `client/js/app.js`, `docs/` = **0 hits**. The documented `@demo.com` logins from the Techub SaaS memory do not exist in this repo.
**No seeded/demo/sample device data:** `store.js:15` — every table starts empty; no seed arrays anywhere in `server/`.

### 1c. Hardcoded values that are not credentials but are baked-in deployment facts

| File:line | Value | Disposition |
|---|---|---|
| `server/routes/agents.js:52-53,66,68` | Central IP `192.168.30.65`, port `8060`, protocol `http` (in `serverInfoData`) | Hardcoded deployment fact — see also H1 (§2). A Techub LAN IP baked into the served config. |
| `agent_src/main.go:28,109,217` | Default server `http://192.168.30.65:8060` (flag default + fallback host) | Same baked-in deployment fact in the Go agent. |
| `client/OPMAgentServerInfo.json`, `client/downloads/OPMAgentServerInfo.json` | Same IP/port + `OPM_ENTERPRISE_KEY_129203` + `ee-probe-101-central-key` (static files) | Same as `serverInfoData`; served as static files. See H1. |
| `client/downloads/README_INSTALL.txt:5,23`, `client/downloads/start_agent.bat:6` | `http://192.168.30.65:8060` | Docs/scripts naming the same baked-in server. |
| `server/routes/tools.js:897` | Default probe target `127.0.0.1` (`mac-resolve`) | Benign default. |
| `server/routes/settings.js:1748` | Proxy-test default target `http://example.com/` | Benign default (example.com). |
| `server/routes/settings.js:1159` | Mail default from `opmanager@localhost` | Benign default. |
| `server/routes/devices.js:13-14` | Comment citing Techub switches + pfSense answering community `public` | Comment only (recon note). |
| `server/services/snmp.js:21,91` | Comments citing `192.168.30.1` / `192.168.30.2` | Comments only. |
| `server/routes/discovery.js:175` | Error text `ipRange must be a valid CIDR such as 192.168.1.0/24` | Example text in an error message. |


---

## 2. Hardcoded tokens / keys / passwords

### H1 — CRITICAL: hardcoded probe AuthKey + customer key served publicly, no auth

| Item | Value (as committed — already public in the repo) | Locations |
|---|---|---|
| Probe auth key literal | `ee-probe-101-central-key` | `server/routes/agents.js:74` (`AuthKey` in `serverInfoData`); `client/OPMAgentServerInfo.json:23`; `client/downloads/OPMAgentServerInfo.json:23` |
| Customer key literal | `OPM_ENTERPRISE_KEY_129203` | `server/routes/agents.js:72-73` (`customerid`/`CustomerId`); same two JSON files (`:21-22`) |
| Baked-in Central address | `192.168.30.65:8060` over `http` | `server/routes/agents.js:52-53,66,68`; same JSON files; `agent_src/main.go:28,109,217`; `client/downloads/README_INSTALL.txt:5,23`; `client/downloads/start_agent.bat:6` |

**Exposure (proven live on :8138, no auth):** `GET /OPMAgentServerInfo.json` returns the whole object including `AuthKey` (see Live proof). The same object is served by 6 routes in `server/routes/agents.js:79-89`: `/OPMAgentServerInfo.json`, `/downloads/OPMAgentServerInfo.json`, `/agents/OPMAgentServerInfo.json`, `/api/agent/serverinfo`, `/agent/serverinfo`, `/servlets/AgentServerInfo`. The 5 non-`/api` paths are **not** API paths under `server/index.js:206-225` (`apiAuthGuard`, mounted at `index.js:284`), so they bypass `requireAuth` entirely; the `/api/agent/serverinfo` variant **is** guarded (live: 401 without a session). The two static JSON files are additionally served as static files.

**Blast radius (bounded, verified in code):** the literal is *not* a live credential for a fresh install. Probe enrolment mints a fresh random key (`server/routes/probes.js:439`: `crypto.randomBytes(32)`, SHA-256 hash stored, shown once at `probes.js:448-454`); agent one-time keys are random (`agents.js:386`); the heartbeat check (`probes.js:505-533`) and agent auth (`agents.js:276-310`) compare the presented key's SHA-256 against a stored hash — there is no literal fallback, and a fresh DB has no probe/agent enrolled with this key. The literal **would** authenticate if any probe/agent was ever enrolled using it (e.g. an operator copying it out of this JSON), and it discloses the real Central address + a customer identifier to any unauthenticated visitor. **Phase-3 action:** rotate/remove the literal, make the server-info endpoint derive host/port from the live runtime (or require auth), and enrol agents/probes only with per-device random keys.

### H2 — Hardcoded SNMP community defaults (`public` / `public_monitor_ro`)

Read-only community strings, not secret keys, but they *are* credential defaults baked into code, and `public` is the community the live Techub devices actually answer on — so the default silently works against production devices.

| File:line | Default |
|---|---|
| `server/services/snmp.js:30` | `const DEFAULT_COMMUNITY = 'public'` |
| `server/services/poller.js:146` | `device.snmp_community \|\| … \|\| 'public'` (poll fallback) |
| `server/routes/hardware.js:224` | `dev.snmp_community \|\| 'public'` |
| `server/routes/discovery.js:470` | `b.community \|\| b.snmpCommunity \|\| defaultCommunity() \|\| 'public'` (`defaultCommunity()` at `discovery.js:230-236` reads the `discovery.defaultCommunity` setting first) |
| `server/routes/tools.js:457,513` | `community = 'public_monitor_ro'` (snmp-query / snmp-walk request defaults) |
| `server/routes/tools.js:897,905` | `community = 'public'` (mac-resolve request default; re-defaulted at :905) |

Disposition: **accepted default, flag for phase 3** — the snmpv3 tracks should make the poller/tools require a stored credential (or an explicit per-request community) instead of silently falling back to `public`. Note the tools endpoints *do* mask the community in responses (`tools.js:500`: `community: '******'`; snmp-walk's response at `tools.js:555-563` omits it entirely).

### H3 — Verified absent (negative greps, all 0 hits in audited scope)

| Check | Result |
|---|---|
| Password literals (`password\s*[:=]\s*['"][^'"]+['"]`, `pass\s*[:=]\s*['"]…`) | 0. The only matches are the community defaults in H2. |
| API-key / token literals (`ghp_`, `gho_`, `sk-…`, `AKIA…`, `xox[baprs]-`, `-----BEGIN…PRIVATE KEY-----`) | 0 in code. (Two `sk-` substring hits are WMI graph names in `server/data/templates/` data files, not keys.) |
| `'Bearer '` literals carrying a token | 0. Only prefix parsing: `server/routes/auth.js:156-157`, `server/services/session.js:106-107` (`auth.startsWith('Bearer ')`, token sliced from the header). |
| Hardcoded JWT / session secret | None exists. Sessions are `crypto.randomBytes(32).toString('hex')` tokens (`server/services/session.js:80`), SHA-256-hashed at rest (`session.js:84`); cookie is `HttpOnly`, `SameSite=Lax`, `Secure` iff `req.secure` (`server/routes/auth.js:178-190`); login returns no token in the body (`auth.js:330-343`). |
| `.env` files / committed secrets | 0 `.env*` files in the tree. `server/data/.admin-initial` and `server/data/opmanager.db*` are gitignored runtime artefacts, **not** tracked (`git ls-files` shows neither; `git log` for both is empty). |
| Hardcoded bootstrap / probe / agent / API keys | Bootstrap admin password is random: 12 random bytes, base64url (`server/services/session.js:250`), written once to `.admin-initial` (mode 600) and printed once to stdout — never hardcoded. Probe authKey random (`probes.js:439`). Agent one-time key random (`agents.js:386`). API keys random `opm_` + 32 random bytes, SHA-256 hash only (`server/routes/settings.js:711-712`); plaintext shown exactly once at creation/rotation (`settings.js:745-747`) by design, never on GET (`settings.js:696-705`; `store.js:993` lists id/name/created_at only). User passwords scrypt-hashed (`session.js:50-51,67-68`). Licence material stored as SHA-256 fingerprint only (`settings.js:562-580`). |

---

## 3. Remaining 501 sites — 17 call sites, 22 routes

Reconciliation with phase 2: phase 2 reported "22×501". That is the **route** count. The **call-site** count is 17, because one helper (`settings.js:218-222` `templateIndexOr501`) serves 6 template routes. 8 unconditional routes + 2 version-conditional + 6 template routes + 6 config-conditional test routes = **22 routes**.

### 3a. Unconditional — always 501 (8 sites / 8 routes)

| File:line | Route | Why it 501s |
|---|---|---|
| `server/routes/diff.js:183` | `POST /api/ccm/resolve-drift` | No config fetch/push path exists; resolving drift would write nothing. |
| `server/routes/ccm.js:114` | `POST /api/json/enterprise/pushCentralConfig`, `/enterprise/pushCentralConfig`, `/api/ccm/push` | No Central-to-probe delivery channel exists; nothing pushed, no probe ack. |
| `server/routes/ccm.js:154` | `POST /api/ccm/backup-device`, `/api/ccm/backup` | No SSH/TFTP/SNMP config retrieval path; no backup written. (Unknown device → 404 first.) |
| `server/routes/tools.js:850` | `POST /api/tools/terminal-exec` | No safe allow-listed command runner (no SSH/Telnet session) on the server. |
| `server/routes/tools.js:863` | `POST /api/tools/wmi-query` | No WMI/WinRM client exists on this server. → **winrm tracks (phase 3)** |
| `server/routes/tools.js:877` | `POST /api/tools/cli-query` | No SSH session runner exists on this server. |
| `server/routes/workflows.js:342` | `POST /api/workflows/execute` | No step executor exists on this server. (File header `workflows.js:35-36` triages this as OPEN O-12, stays 501.) → **runner/workflow-exec tracks (phase 3)** |
| `server/routes/settings.js:779` | `POST /admin/updateJvmHeapSize`, `/api/admin/updateJvmHeapSize` | No JVM exists in this Node.js build; heap cannot be changed via this endpoint. → **jvm-doc track (phase 3)** |

### 3b. Conditional on the request — 501 only when SNMPv3 is asked for (2 sites / 2 routes)

| File:line | Route | Why it 501s |
|---|---|---|
| `server/routes/tools.js:467` | `POST /api/tools/snmp-query` | Version other than v1/v2c: "the SNMP service only carries community-based v1/v2c credentials, so no v3 authentication/privacy can be performed." → **snmpv3 tracks (phase 3)** |
| `server/routes/tools.js:523` | `POST /api/tools/snmp-walk` | Same v3 branch as above. → **snmpv3 tracks (phase 3)** |

### 3c. Conditional on missing configuration — 501 only when nothing is configured (7 sites / 12 routes)

| File:line | Route(s) | 501 condition |
|---|---|---|
| `server/routes/settings.js:221` (helper `templateIndexOr501`; call sites `:275, :282, :307, :324, :372, :423`) | `GET /api/settings/templates` (:274), `GET /api/settings/templates/by-sysoid` + `/:oid` (:303-304), `GET /api/settings/templates/:name` (:306), `POST /api/settings/templates` (:323), `PUT /api/settings/templates/:id` (:371), `POST /api/settings/templates/apply` (:422) | Template index unavailable (`TEMPLATES_UNAVAILABLE`). Reads honestly 501 instead of serving the vendor catalogue. → **tpl tracks (phase 3)** |
| `server/routes/settings.js:1154` | `POST /api/settings/mail/test`, `/settings/testMailServer` (:1148) | No mail server configured (no host in stored settings or request body). |
| `server/routes/settings.js:1247` | `POST /api/settings/failover/test`, `/settings/testFailoverHeartbeat` (:1242) | No standby node stored. → **ha tracks (phase 3)** |
| `server/routes/settings.js:1460` | `POST /api/settings/auth/ad/test` (:1454) | No domain controller configured. → **ldap tracks (phase 3)** |
| `server/routes/settings.js:1657` | `POST /api/settings/auth/saml/test` (:1649) | No SAML configuration stored. → **saml tracks (phase 3)** |
| `server/routes/settings.js:1743` | `POST /api/settings/proxy/test` (:1738) | No proxy configured. |
| `server/routes/settings.js:2003` | `POST /api/settings/ssl/test` (:1997) | No TLS target configured and no certificate stored. |

Helper: `settings.js:49` `NOT_IMPLEMENTED(message)` — the `{ error: 'not_implemented', … }` shape used by all §3c sites. All 501 bodies state plainly that nothing was done; none returns a fake success.


---

## 4. Where credentials could leak

Severity note: every API route below is behind `requireAuth` via the global `apiAuthGuard` (`server/index.js:206-225`, mounted `:284`) — unauthenticated calls get 401 (verified live). The leaks are therefore **authenticated-user** leaks: any valid session (the device/credential GETs carry **no role restriction** — a `viewer`/`operator` session reads the same values as an admin) receives credential material it has no need for. The one exception is H1 (§2), which is unauthenticated.

### L1 — PROVEN LIVE: SNMP community returned in device API responses

`devices.snmp_community` (`store.js:67`, `TEXT`, stored in plaintext) is returned verbatim because the routes return raw `SELECT *` store rows (`store.js:401,405,431`) with no projection/stripping:

| File:line | Route | Field returned |
|---|---|---|
| `server/routes/devices.js:98-126` | `GET /device/listDevices`, `/device/list`, `/api/json/device/list`, `/api/devices` | `devices` — raw rows incl. `snmp_community` |
| `server/routes/devices.js:128-168` | `GET /device/getDeviceSummary`, `/device/getDeviceDetails`, `/api/json/device/getDeviceDetails`, `/api/devices/:id` | `device` — raw row incl. `snmp_community` |
| `server/routes/devices.js:411-505` | `POST /api/json/device/add`, `/device/add`, `/api/devices` | `device` — freshly created raw row incl. `snmp_community` |
| `server/routes/devices.js:463-516` | `POST /api/json/device/pollNow`, `/device/pollNow`, `/api/devices/:id/poll-now` | `device: refreshed \|\| device` — raw row, on success **and** both 502 failure paths |
| `server/routes/probes.js:228-235, 399-404` | `GET /enterprise/getProbeDetails`, `/api/json/enterprise/getProbeDetails`, `/api/probes/:id` | `probeDevicesAndAlarms()` returns raw device rows; `devices` in the response incl. `snmp_community` (the `probe` itself is correctly projected via `publicProbe()`, `probes.js:213-225`) |
| `server/routes/settings.js:585-596` | `GET /admin/getSearchResult`, `/api/admin/getSearchResult` | `results.devices` — raw `listDevices()` rows incl. `snmp_community` |

**Live proof:** device `192.0.2.99` added with a distinctive test community string; `POST /api/devices`, `GET /api/devices`, and `GET /api/devices/1` all returned `snmp_community` set to that test value (see Live proof).

### L2 — PROVEN LIVE: credential-library SNMP community returned; password correctly stripped

| File:line | Detail |
|---|---|
| `server/services/store.js:151-159` | `credentials` table: `community TEXT, username TEXT, password TEXT` — plaintext at rest. |
| `server/services/store.js:815-817` | `listCredentials()` = `SELECT * FROM credentials`. |
| `server/routes/settings.js:168-186` | `GET /api/settings/credentials` and the `POST` response both apply `publicCopy()` — but `publicCopy`'s regex (`settings.js:94`: `/(password\|passwd\|secret\|private[_-]?key\|token)/i`) does **not** match `community`. So `password` is stripped (correct) and `community` is returned (leak). |

**Live proof:** credential `audit-cred` created with a distinctive test community string + a test password; the `POST` response and `GET /api/settings/credentials` both returned `community` set to that test value and **no** `password` field.

### L3 — PROVEN LIVE: SAML `spKey` returned (strip-list gap)

| File:line | Detail |
|---|---|
| `server/routes/settings.js:1540-1558` | `GET` and `POST /api/settings/auth/saml` return `publicCopy(merged)` with `certificate` nulled out — but `spKey` is not matched by the `SECRET_KEY` regex (`spKey` contains neither `password`, `secret`, `private_key`, nor `token`), so a stored SP private key is returned verbatim. The canonical schema (`SHARED.md`) says `spKey` is env/file-only; in this base tree there is no env/file path — whatever is POSTed is stored in SQLite and echoed back. |

**Live proof:** `POST /api/settings/auth/saml` with `spKey: a test SP-key string` returned `"spKey":"a test SP-key string"`; `GET /api/settings/auth/saml` returned it again.

### L4 — PROVEN LIVE: SSL settings returned unfiltered (raw spread)

| File:line | Detail |
|---|---|
| `server/routes/settings.js:1965-1985` | `GET /api/settings/ssl` returns `{ ...stored, effectiveHttps: false }` — no `publicCopy`, no allow-list. `POST /api/settings/ssl` (`:1985`) stores the merged request body as-is. Any private key / certificate material ever stored here is returned to any authenticated caller. |

**Live proof:** `POST /api/settings/ssl` with `privateKey: a test private-key string` + `certificate: a test certificate string` returned both fields; `GET /api/settings/ssl` returned both again.

### L5 — CODE: `POST /api/settings/system` returns the merged object unfiltered

`server/routes/settings.js:1930-1937` — `res.json({ …, system: merged })` with no `publicCopy`. Only non-secret fields are expected under the `system` key today, but any secret-bearing key POSTed there would be echoed back on every read. (Contrast: mail/AD/SAML/proxy GETs all use `publicCopy` + `*Configured` booleans — `settings.js:976-977, 1441-1442, 1543-1545, 1725-1726`.)

### L6 — CODE: SNMP community accepted in a GET query string

`server/routes/devices.js:528` — `GET /api/json/device/testMonitors`, `/api/devices/:id/test-monitors`: `const community = (req.query && req.query.community) || device.snmp_community || null;`. A community supplied as `?community=` lands in the URL — server/proxy access logs, browser history, `Referer` headers. (The community is *needed* by the check; the issue is the transport, not the check itself.)

### L7 — CODE: session token accepted in the URL

`server/index.js:119-133` — a `?token=` query parameter is folded into the `opm_session` cookie header for WebSocket auth (`checkSession`), and `server/index.js:127-128` builds `headers.cookie = … opm_session=${token}` from it. A session token in a URL lands in logs/`Referer`. (The cookie itself is set correctly — HttpOnly, SameSite=Lax — see §2 H3.)

### L8 — CODE: `publicCopy` strip-list gaps (latent)

Regex `settings.js:94` `/(password|passwd|secret|private[_-]?key|token)/i` does **not** match: `community` (L2, live), `spKey` (L3, live), `authPass`, `privPass`, `passphrase`, `apiKey`, `clientSecret`… (no — `clientSecret` contains `secret`, matched), `bindDn` (not secret). Today the devices table has no SNMPv3 fields (`device.snmp` v3 per the canonical schema does not exist yet in this tree — only `snmp_community`/`snmp_version`), so `authPass`/`privPass` are latent: **the snmpv3 tracks must not store v3 passwords under un-matched keys and must extend the strip-list** (or, better, never return credential objects at all — return `*Configured` booleans like mail/AD/proxy already do).

### L9 — CODE (minor): no custom error middleware; stack traces in dev

Grep for a 4-argument error handler (`err, req, res`) across `server/` = **0 hits**. Unhandled errors fall through to Express's default error handler, which includes a stack trace in the response when `NODE_ENV !== 'production'`. `Dockerfile:27` and `render.yaml:9` set `NODE_ENV=production`, but a bare `node server/index.js` run (the documented dev path) does not — 500s there can leak stack traces (paths, internals; not credentials per se). Recommend a single error middleware that logs server-side and returns `{ error: 'internal_error' }`.

### L10 — OBSERVATION: credential material stored in plaintext at rest (SQLite)

`store.js:67` `devices.snmp_community TEXT`; `store.js:151-159` `credentials.community` / `credentials.password TEXT`; `settings` keys (`mail.password`, `auth.ad.bindPassword`, `proxy.password`, `auth.saml.*`) are JSON in the settings table. No encryption at rest — protection is file permissions + API auth. By contrast, user passwords are scrypt-hashed, API/probe/agent keys are SHA-256 hashes, and licence material is a fingerprint (§2 H3). Worth a phase-3 decision (encrypt credential columns vs. document the file-permission boundary); not a code leak by itself.

### Clean checks (verified, no finding)

| Check | Evidence |
|---|---|
| `console.*` logging request bodies / credentials | 62 `console.(log\|error\|warn\|debug)` lines in `server/` (list in the audit scratch, all metadata: IPs, hostnames, `err.message`); grep `console.*req\.` / `console.*body` = **0 hits**. `trapReceiver.js:156-158` parses the trap community for PDU decoding only — never logged or stored. |
| `auditLog` logging bodies | Grep `auditLog(…req.body…)` = **0 hits**. Audit calls carry only ids/names/hosts/ports/fingerprints (e.g. `settings.js:744, 989, 1450`). |
| Error messages echoing passwords | Grep over `auth.js`, `settings.js`, `tools.js` for password-in-message = **0 hits**. Login failures are generic (`auth.js:320-322`: `invalid credentials`, never reveals whether the user exists). `hardware.js:264` distinguishes "public (default)" vs "as stored" in a message without revealing the stored value. Mail test (`settings.js:1099-1100`) sends the stored password base64 in SMTP `AUTH LOGIN` to the configured mail host (protocol-necessary) and reports only SMTP reply codes — it is never echoed in a response. |
| API keys / probe keys in responses | `listApiKeys` returns id/name/created_at only (`store.js:993`); plaintext shown once at create/rotate by design (`settings.js:745-747`). `publicProbe()` projects id/name/ip/status/metrics only (`probes.js:213-225`) — `auth_key_hash` never leaves the server. `agentView()` projects fields only (`agents.js:341+`). `publicUser()` strips `password_hash` (`settings.js:1301-1315`; `auth.js:176-178`). |
| Tools endpoints | snmp-query masks the community as `'******'` (`tools.js:500`); snmp-walk's response omits it entirely (`tools.js:555-563`). |
| Users list | `GET /api/settings/users` maps through `publicUser` — no hashes (`settings.js:1327-1330`). |

---

## Live proof (own instance, port 8138 — never the shared :8060)

Server: `PORT=8138 node server/index.js` from this clone. Two runs; each killed by its own PID afterwards. Throwaway admin (`admin`, bootstrap random password → changed at runtime to a throwaway value, never recorded). Test values were distinctive test-only strings (community, password, SP key, private key, certificate) on TEST-NET-1 IP `192.0.2.99` — all confined to this clone's throwaway DB.

| Probe | Result |
|---|---|
| `GET /OPMAgentServerInfo.json` (no auth) | **200**, full JSON incl. `"AuthKey": "ee-probe-101-central-key"`, `"customerid": "OPM_ENTERPRISE_KEY_129203"`, `"PrimaryHostServer": "192.168.30.65"` (H1 proven) |
| `GET /api/agent/serverinfo` (no auth) | **401** (the `/api` variant is guarded; the 5 bare paths are not) |
| `GET /api/devices` (no auth) | **401** `{"error":"unauthorized","authenticated":false}` |
| `GET /api/settings/credentials` (no auth) | **401** |
| `POST /api/auth/login` as `admin` | **200** `{"ok":true,…,"mustChangePassword":true}` first login; forced-change guard returned **403** `{"error":"password change required"}` on all other API routes until the runtime-only password change cleared it |
| `POST /api/devices` `{ip: 192.0.2.99, community: <test value>}` | **200**, response body contains `snmp_community` set to the test value (L1) |
| `GET /api/devices` (authed) | **200**, `devices[0].snmp_community` = the test value (L1) |
| `GET /api/devices/1` (authed) | **200**, `device.snmp_community` = the test value; poller honestly reported the TEST-NET-1 device `status: "Down"` (L1) |
| `POST /api/settings/credentials` `{community: <test value>, password: <test value>}` | **200**, response contains `community` set to the test value and **no** `password` field (L2) |
| `GET /api/settings/credentials` (authed) | **200**, same: community present, password absent (L2) |
| `POST /api/settings/auth/saml` `{spKey: <test value>}` | **200**, response contains `spKey` set to the test value (L3) |
| `GET /api/settings/auth/saml` (authed) | **200**, `saml.spKey` = the test value (L3) |
| `POST /api/settings/ssl` `{privateKey: <test value>, certificate: <test value>}` | **200**, both fields returned (L4) |
| `GET /api/settings/ssl` (authed) | **200**, `privateKey` set to the test value returned (L4) |

## What the close-out agent should re-check (diff targets)

1. **H1:** `server/routes/agents.js` `serverInfoData`, `client/OPMAgentServerInfo.json`, `client/downloads/OPMAgentServerInfo.json`, `agent_src/main.go` — the literal `ee-probe-101-central-key` / `OPM_ENTERPRISE_KEY_129203` / `192.168.30.65` must be gone or derived from runtime config; `GET /OPMAgentServerInfo.json` without auth must not return key material.
2. **L1/L2/L3/L4:** re-run the §4 live probes against the merged tree (same test values work — they are TEST-NET/test strings, not real credentials): `GET /api/devices`, `GET /api/devices/:id`, `GET /api/probes/:id`, `GET /api/admin/getSearchResult`, `GET /api/settings/credentials`, `GET /api/settings/auth/saml`, `GET /api/settings/ssl` must not return `snmp_community`, `community`, `spKey`, or `privateKey` — expect `*Configured`-style booleans or omission.
3. **§3:** re-count `res.status(501)` call sites (baseline: **17**) and 501 routes (baseline: **22**). Expected phase-3 movement: `tools.js:467,523` (snmpv3), `:863` (winrm), `workflows.js:342` (runner), `ccm.js:114,154` + `diff.js:183` (ncm), `settings.js:221` (tpl), `:779` (jvm-doc), `:1247` (ha), `:1460` (ldap), `:1657` (saml) should drop to real implementations or stay 501 with the reason updated; the config-conditional test 501s (`:1154, :1743, :2003`) should stay 501 only when genuinely unconfigured.
4. **§1:** re-run `grep -rn "Math\.random" server/ client/js/app.js` (baseline: **2 comment hits, 0 live**) and the demo/seed/sample/fake grep (baseline: **76 lines, 0 live fake paths**). Any new hit must be dispositioned the same way.
5. **§2 H2:** re-grep `community\s*[:=]\s*['"]public` — the `public` / `public_monitor_ro` defaults should be gone or explicitly justified once stored credentials exist.
6. **L6/L7/L9/L10:** `?community=` on GET test-monitors, `?token=` folding, missing error middleware, plaintext credential columns — still open at baseline; check whether phase 3 addressed them.
7. **Reproduction commands (from the clone root):** `grep -rn "Math\.random" server/index.js server/routes server/services client/js/app.js` · `grep -rniE "demo|seed|sample|fake|mock|stub|canned|placeholder" server/index.js server/routes server/services client/js/app.js` · `grep -rn "status(501)" server/index.js server/routes server/services` · `grep -rnE "console\.(log|error|warn|debug)" server/` · `grep -rnE "Bearer |api[_-]?key|changeme|admin123" server/index.js server/routes server/services` · `grep -rn "ee-probe-101-central-key\|OPM_ENTERPRISE_KEY_129203" --exclude-dir=node_modules --exclude-dir=.git .`

## Files changed

- `docs/p3-audit-baseline.md` (this file) — **only file changed**. No server/client code touched, no dependencies added, no push made.
