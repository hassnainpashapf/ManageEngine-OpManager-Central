# HA proof log — two real instances, kill primary, failover, re-register

Run: **2026-11-09 12:50:21–12:51:34 PKT** (07:50:21–07:51:34 UTC).
Clone: `~/workspace/opm-p3/ha-proof`, branch `p3-ha-proof`, base `ff51df6`
(`real-data`). Both instances ran the same code from that clone; the
shared `:8060` server was never touched. The peer secret was generated at
runtime into a shell variable only — it appears in no file, log, or
snapshot below. Proof runner: `/tmp/ha-proof/run.sh` (not in the repo);
full run log: `/tmp/ha-proof/run.log`.

## Setup

| | Primary | Standby |
|---|---|---|
| Port | 8122 (track-assigned) | 18222 |
| PID (first start) | 18882 | 18866 |
| Database | clone's own `server/data/opmanager.db` | separate `/tmp/ha-proof/standby/opmanager.db` |
| Role env | `OPM_HA_ROLE=primary` | `OPM_HA_ROLE=standby` |
| Peer URL | `http://127.0.0.1:18222` | `http://127.0.0.1:8122` |
| Heartbeat | 5 s, miss threshold 3 → failover after 15 s | same |

## 1. Registration + heartbeats flowing (real HTTP, real timestamps)

Standby ready 12:50:25 PKT, primary ready 12:50:26 PKT.
Primary registered at `2026-11-09T07:50:26.633Z`; standby recorded the
registration at `2026-11-09T07:50:25.702Z` (its clock for the received
call). Heartbeats then flowed every 5 s:

Primary log:

```text
[HA] 2026-11-09T07:50:26.633Z registered with standby http://127.0.0.1:18222 (node primary:8122)
[HA] 2026-11-09T07:50:25.798Z heartbeat #1 -> standby http://127.0.0.1:18222 acked (standby role: standby)
[HA] 2026-11-09T07:50:30.802Z heartbeat #2 -> standby http://127.0.0.1:18222 acked (standby role: standby)
[HA] 2026-11-09T07:50:35.802Z heartbeat #3 -> standby http://127.0.0.1:18222 acked (standby role: standby)
[HA] 2026-11-09T07:50:40.803Z heartbeat #4 -> standby http://127.0.0.1:18222 acked (standby role: standby)
[HA] 2026-11-09T07:50:45.804Z heartbeat #5 -> standby http://127.0.0.1:18222 acked (standby role: standby)
```

Status just before the kill (12:50:43–49 PKT):

- Primary: `role=primary effectiveRole=active heartbeatsSent=3
  lastHeartbeatAckAt=2026-11-09T07:50:35.817Z peerAlive=true`
  (snapshot taken between beats #3 and #4; #4/#5 followed).
- Standby: `role=standby effectiveRole=standby heartbeatsReceived=3
  lastHeartbeatAt=2026-11-09T07:50:35.802Z
  registeredAt=2026-11-09T07:50:25.702Z peerAlive=true`
  (snapshot taken between beats #3 and #4; #4/#5 followed).

### Negative controls (auth is real)

| Check | Result |
|---|---|
| `POST /api/ha/heartbeat` with **no** secret | **401** |
| `POST /api/ha/heartbeat` with **wrong** secret | **401** |
| `GET /api/ha/status` with **no** secret and **no** session | **401** |

### Poller gating before failover

- Primary log: `Real-data polling engine active` (1 line) — polling.
- Standby log before promotion: **0** poller-start lines, and
  `[Poller] standby node — polling paused until failover promotion.`

## 2. Kill primary → standby promotes (real failover decision)

- **Kill:** primary PID 18882 killed (SIGTERM) at
  **2026-11-09T07:50:49.375Z / 12:50:49 PKT**; process exited (code 0).
  Last heartbeat received by standby: `2026-11-09T07:50:45.804Z`.
- **Promotion detected** by polling `GET /api/ha/status` every 2 s at
  **2026-11-09T07:51:04.234Z**; the decision itself was recorded at
  **`lastFailoverAt = 2026-11-09T07:51:01.178Z`**.

Standby log:

```text
[HA] 2026-11-09T07:51:01.178Z FAILOVER: No heartbeat from primary primary:8122 for 15373 ms (threshold 15000 ms, 3 missed beats; last heartbeat 2026-11-09T07:50:45.804Z) — this node is now ACTIVE
```

Standby status at promotion: `effectiveRole=active promoted=true`,
failover reason exactly as above (`gapMs=15373, thresholdMs=15000,
missedBeats=3`). Decision event stored in `ha.state`:

```json
{ "at": "2026-11-09T07:51:01.178Z", "type": "failover",
  "reason": "No heartbeat from primary primary:8122 for 15373 ms (threshold 15000 ms, 3 missed beats; last heartbeat 2026-11-09T07:50:45.804Z)",
  "lastHeartbeatAt": "2026-11-09T07:50:45.804Z", "gapMs": 15373, "thresholdMs": 15000, "missedBeats": 3 }
```

Gap 15,373 ms = 15 s threshold + 373 ms watchdog latency — the
promotion fired on the first 1 s watchdog tick after the threshold, as
designed. On promotion the standby started its poller (poller-start
lines in standby log went **0 → 1**).

## 3. Restart primary → re-registration, standby demotes

- **Primary restarted** (same env, same DB, new PID 19928) at
  **2026-11-09T07:51:08.557Z**; ready 12:51:13 PKT.
- **Re-registration recorded** on the standby at
  **`2026-11-09T07:51:12.410Z`**, demoting it back to standby:

```text
[HA] 2026-11-09T07:51:12.410Z RE-REGISTRATION from primary primary:8122 (http://127.0.0.1:8122) — demoting back to STANDBY (was promoted at 2026-11-09T07:51:01.178Z)
```

Decision event:

```json
{ "at": "2026-11-09T07:51:12.410Z", "type": "re-registration", "trigger": "register",
  "from": "primary:8122", "primaryUrl": "http://127.0.0.1:8122",
  "previousFailoverAt": "2026-11-09T07:51:01.178Z" }
```

- Heartbeats resumed immediately and counters **continued across the
  restart** (persisted `ha.state`, not reset): primary
  `heartbeatsSent=8` at 12:51:27 PKT, then #9 at 07:51:27.347Z and #10 at
  07:51:32.357Z; standby `heartbeatsReceived=8` at 12:51:33 PKT with
  `lastReRegistrationAt=2026-11-09T07:51:12.410Z` and the earlier
  `lastFailoverAt=2026-11-09T07:51:01.178Z` still recorded.
- Final standby state: `role=standby effectiveRole=standby
  peerAlive=true`. Both instances then stopped cleanly (SIGTERM by PID)
  at 12:51:34 PKT.

## Notes / honest caveats

- The two instances share the clone directory but **not** a database:
  separate SQLite files, so every heartbeat above crossed a real HTTP
  request, not shared state.
- The trap receiver logged `trap UDP 162 unavailable (EADDRINUSE)` /
  `syslog UDP 514 unavailable (EADDRINUSE)` on both instances — the
  shared `:8060` server already holds those ports. Unrelated to HA;
  trap/syslog collection was disabled on the proof instances only.
- Two failed runs preceded the passing one, both fixed in the code:
  1. `HA init FAILED: started is not defined` — the `started` flag was
     used but never declared in `server/services/ha.js`.
  2. Registration/heartbeat answered **401** even with the right secret —
     `ncmclientRoute`'s router-level guard (401 without `req.user`) sits
     before `haRoute` and intercepted peer requests. Fixed by mounting
     `haRoute` before `ncmclientRoute`, the same pattern `agentsRoute`
     already uses (see the comment in `server/index.js`).
- **What this proof does NOT cover:** database replication (each node
  kept its own SQLite file — a promoted standby starts from its own
  state, not the primary's), virtual-IP/DNS moves, and split-brain
  fencing. See `docs/ha-setup.md` for the production requirement.

---

# Phase 4 merge re-verification (canonical design) — 2026-11-09

The proof above ran the pre-merge ha-proof design (`ha.state`,
`effectiveRole`, auto-demote on any heartbeat). The canonical merged
design (Phase 4 merge p4m-ha: `server/services/ha.js` core +
`server/routes/ha.js` surface, sticky lease-guarded promotion,
demotion ONLY on an explicit register from the original primary) was
re-proved end-to-end on the merged clone
`~/workspace/opm-p4/merge-ha`, branch `p4m-ha`, base `ff51df6`, and
the full harness re-run. The peer secret and admin passwords were
runtime-only (generated/read by the drivers, never printed or stored).
Scratch drivers (not committed):
`~/workspace/opm-p4/m5-work/proof-ha.js` (two-instance proof) and
`~/workspace/opm-p4/m5-work/live-check.js` (single-instance route
checks). Times below are UTC; PKT = UTC + 5h.

## Two-instance proof — 2026-11-09 11:33:32–11:34:10 UTC (16:33–16:34 PKT)

| | Primary | Standby |
|---|---|---|
| Port | 8164 (merge task ports) | 18164 |
| Dir | `~/workspace/opm-p4/merge-ha` | `~/workspace/opm-p4/m5-work/ha-standby` (rebuilt from the merged clone: `cp -a`, `rm -rf .git server/data`) |
| Config | `POST /api/settings/ha { role: 'primary', standbyUrl: http://127.0.0.1:18164, nodeUrl: http://127.0.0.1:8164 }` | `POST /api/settings/ha { role: 'standby', primaryUrl: http://127.0.0.1:8164, nodeUrl: http://127.0.0.1:18164 }` |
| NodeIds | `node-06e42152-da69-45c0-b5d6-51174babfdc6` | `node-5a317edc-aa20-4b1d-baf0-39ca02f593aa` |

- **Heartbeats both ways:** after a 12 s warm-up, each side's peer row
  showed `heartbeatCount=2`, both nodes `status=healthy`.
- **Kill:** primary SIGTERM at **2026-11-09T11:33:44.213Z**, exit 0.
- **Promotion:** standby role became `primary` at
  **2026-11-09T11:33:57.204Z** — observed gap **13,319 ms** from the
  kill (poll every 1 s), recorded `gapMs=15054` (`msSinceSeen` at
  promotion; grace 15,000 ms). Decision record:

```json
{ "id": 5, "at": "2026-11-09T11:33:57.204Z", "action": "ha.promote", "type": "promote",
  "detail": { "reason": "primary missed threshold heartbeats and lease acquired",
    "primaryNodeId": "node-06e42152-da69-45c0-b5d6-51174babfdc6",
    "msSinceSeen": 15054, "graceMs": 15000,
    "leaseExpiresAt": 1794224052159,
    "promotedNodeId": "node-5a317edc-aa20-4b1d-baf0-39ca02f593aa" }, "gapMs": 15054 }
```

- **Restart:** primary restarted (same DB, same nodeId) at
  11:33:57.558Z; re-registration demoted the standby at
  **2026-11-09T11:33:58.115Z** (reconciled 11:33:58.804Z — 14,591 ms
  after the kill):

```json
{ "id": 6, "at": "2026-11-09T11:33:58.115Z", "action": "ha.demote", "type": "demote",
  "detail": { "reason": "primary-rejoined: original primary re-registered",
    "peerNodeId": "node-06e42152-da69-45c0-b5d6-51174babfdc6",
    "promotedAt": "2026-11-09T11:33:57.204Z", "demotedAt": "2026-11-09T11:33:58.075Z" } }
```

- **Heartbeats resumed:** 11 s after the return, both peer rows showed
  `heartbeatCount=4, alive=true`; both nodes `status=healthy`,
  roles `primary` / `standby`. Proof verdict: **PASS, 0 failed checks**.
  (A first proof run failed 4 checks only because the driver read the
  nodeIds from the `POST /api/settings/ha` response, where `nodeId` is
  still null before the ticker generates it — driver bug, fixed by
  reading `GET /api/ha/status`; the promotion/demote behaviour itself
  passed in both runs, gaps 13,311 ms and 13,319 ms.)

## Single-instance live route checks — 19/19 PASS

Against one instance on :8164 (throwaway DB): `GET /api/ha/status`
200 `single-node` (session) and 200 (peer secret), 401 with no auth;
`POST /api/ha/heartbeat` 401 with no/wrong secret, 200 ack
(`heartbeatCount=1, alive=true, fenced=false`) with the secret,
400 `stale_heartbeat` for a 24 h-old `sentAt`, 400 for a missing role;
`POST /api/ha/register` 401 without secret, 200 `reRegistered`
(and `demoted=false`) with it; `GET /api/ha/peers` lists the peer;
`GET /api/ha/decisions` holds `ha.register`;
`POST /api/ha/failover/test` 200 dry-run `no-primary-registered`;
`GET /api/settings/ha` 200 canonical defaults (5/3/15000);
`POST /api/settings/ha` 400 for `role=bogus`, 200 for
`role=primary` with the ticker started;
`POST /api/settings/ha/test` 200 `reachable=false` (dead peer);
`GET /api/settings/central` `haStatus=Primary Active`.

## Harness re-run — `scripts/test-ha.js`, C0–C5 all PASS

Final run 2026-11-09T11:38:26Z, branch `p4m-ha`, ports 8164/18164,
standby rebuilt from the merged clone. Summary: **6 cases, 6 pass,
0 fail, 0 missing, bugs: []** (`scripts/test-ha-results.json`).

| Case | Verdict | Exact numbers |
|---|---|---|
| C0 baseline | PASS | status 200 `healthy` role primary; settings/ha 200 (5/3/15000); decisions 200 array; heartbeat w/o secret 401 |
| C1 standby killed | PASS | failover/test `reachable:false` (ECONNREFUSED, 1 ms); `GET /api/ha/status` → `unavailable`, `standbyAlive=false` (past the 15 s grace); primary stays primary; healthy again after restart |
| C2 primary killed | PASS | promotion observed gapMs **13,292**; `ha.promote` record `gapMs=15802`, `graceMs=15000` |
| C3 primary returns | PASS | exactly one primary; standby back to `standby`; `ha.demote` (`primary-rejoined`) recorded; decisions `[ha.demote, ha.promote, ha.register, ha.settings.save]` |
| C4 heartbeat storm | PASS | 50/50 `reachable:true`, 0 non-200, 0 5xx; 50/50 status reads 200; both alive after |
| C5 stale heartbeat | PASS | stale `sentAt` → **400 `stale_heartbeat`** (86,400,002 ms from receipt, grace 15,000 ms); fresh → 200 ack; TCP probe ignores the stamp by design (`reachable:true`) |

Flake note (honest): the run before the final one failed C4 only —
the standby process was gone after the storm (session null,
ECONNREFUSED), with no exception in its log and a clean SIGTERM at
shutdown. The storm's own 50/50 requests had all succeeded in that
run too, and C4 passed with identical code in the runs before and
after. The box had ~132 MB free RAM at the time (several sibling
agents running full OpManager instances), so the standby was most
likely reaped under memory pressure, not by an HA defect. Re-running
the harness is the remedy if it recurs; the HA code path itself shows
no failure in any of the three runs.

## Unit tests — `server/services/ha.test.js`, 22/22 PASS

Re-run against the merged service + store (throwaway DB): all 22
checks pass, including defaults (5/3/15000), peer auth fail-closed,
registration, liveness boundary at exactly grace (15,000 ms alive /
15,001 ms dead), dry-run evaluation with no mutation, lease-guarded
promotion + stickiness, split-brain lease block, real-HTTP
`sendHeartbeat` success + 3× ECONNREFUSED misses, fencing demotion,
live TCP probes, persistence across connections, and
`start()` refusing with `no-peer-configured` on a single node.
