# High Availability (HA) — setup guide

Active/passive HA for OpManager Central: two real server instances (same
code, different hosts/ports, different SQLite files). The primary
registers with the standby on startup and heartbeats it every
`heartbeatSec` seconds; the standby promotes itself to active (taking
the failover lease) if the primary misses its heartbeat budget, and
demotes itself again when the original primary re-registers.

Proved end-to-end on 2026-11-09 — see `docs/ha-proof-log.md` for the
exact timestamps, promotion gaps, and decision records. Canonical
implementation: `server/services/ha.js` + `server/routes/ha.js`
(Phase 4 merge p4m-ha).

## Canonical design (one of each — the three Phase 3 HA tracks are merged)

- **Service** (`server/services/ha.js`): persisted peer registry
  (`ha_peers`) + failover lease (`ha_leases`) in each node's own
  SQLite store, atomic lease acquire (`BEGIN IMMEDIATE`), sticky
  promotion, fencing, audit log, heartbeat ticker.
- **HTTP surface** (`server/routes/ha.js`): status, peers, decisions,
  register, heartbeat, failover dry-run test, canonical settings.
- **Wire protocol** (one protocol): `POST /api/ha/heartbeat` and
  `POST /api/ha/register` with JSON `{ peerId, role, url, sentAt }`
  (sentAt: epoch ms; an ISO `at` is also accepted) and the shared peer
  secret as the `X-HA-Peer-Secret` header or `peerSecret` body field.
  Acks are `{ status: 'success', peer: { ... } }`.
- **Defaults** (one set): `heartbeatSec` 5, `missThreshold` 3,
  `leaseTermMs` 15000 — grace is 5 × 3 = 15 s.

## What the user must provision

| # | Item | Detail |
|---|------|--------|
| 1 | **A second node** | A second host, VM, or container running the **same code** (branch `real-data`, same version) on its own port, with its **own SQLite database file** (set `OPMANAGER_DB_PATH`; never point two nodes at the same `.db` file). |
| 2 | **The peer URLs** | Each node must reach the other over HTTP(S): the primary needs the standby URL (`settings.ha.standbyUrl`), the standby needs the primary URL (`settings.ha.primaryUrl`). Set them via `POST /api/settings/ha` or the env vars below. |
| 3 | **The peer secret** | The **same** `OPM_HA_PEER_SECRET` environment variable on **both** nodes. Generate a long random value, e.g. 48 hex chars from `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`. It is **env-only**: never committed, never written to a file, never logged, never put in `settings.ha`. Without it on either side, registration and heartbeats are refused (401/503) and HA is off. Rotate it by setting the new value on both nodes and restarting both. |
| 4 | **Heartbeat interval** | `heartbeatSec` 5 (default). The standby promotes after the primary is 15 s past its last heartbeat (3 missed beats), so failover takes ~13–19 s in practice (grace + ticker phase). |

### Configuration: stored settings + env overrides

Canonical stored shape (`settings.ha`): `{ role: 'primary'|'standby',
standbyUrl, primaryUrl, nodeUrl, nodeId, heartbeatSec, missThreshold,
leaseTermMs }` — read/write via `GET`/`POST /api/settings/ha`, or the
HA settings form (client/js/p3/settings-ui-ha.js).

Env vars override stored settings at runtime (never persisted):

| Variable | Effect |
|---|---|
| `OPM_HA_ROLE` | Applies **only on a fresh node with no stored `settings.ha` row** (first provisioning). Once a role is stored, the stored role wins, so a failover promotion is never undone by a stale env var. |
| `OPM_HA_PEER_URL` | The other node's URL: becomes `standbyUrl` on a primary, `primaryUrl` on a standby. |
| `OPM_HA_SELF_URL` | This node's own URL (`nodeUrl`). |
| `OPM_HA_HEARTBEAT_SEC` | Heartbeat interval seconds (1..60). |
| `OPM_HA_NODE_ID` | This node's peerId (generated + persisted as `node-<uuid>` if unset). |

## How it behaves

- **Startup:** the heartbeat ticker starts when a peer URL is
  configured. A primary registers with its standby
  (`POST /api/ha/register`, retried by the ticker until it lands)
  and heartbeats every `heartbeatSec`; a standby heartbeats the
  primary the same way. Each side records the other as a peer
  (`ha_peers`: last-seen, missed count, heartbeat count).
- **Standby while healthy:** does **not** poll devices (poller
  paused), it only watches. A primary polls from the start.
- **Failover:** primary 15 s past its last heartbeat → the standby's
  ticker evaluates (dry-run logic), atomically takes the failover
  lease (`ha_leases`, exactly one holder), persists its role as
  `primary`, audits `ha.promote` (timestamp, dead primary's nodeId,
  ms since last seen, lease expiry), fires `onPromote` (poller
  starts), and renews the lease every tick. Promotion is **sticky**:
  merely heartbeating again does not demote it.
- **Primary returns:** the returning primary re-registers on boot.
  That explicit register — and only a register from the SAME primary
  named in the most recent `ha.promote` record — demotes the promoted
  node back to `standby` (`ha.demote`, reason `primary-rejoined`),
  releases its lease, and fires `onDemote` (poller stops). Heartbeats
  alone never demote. A second primary is therefore reconciled by
  the rejoin handshake, not by heartbeat resumption.
- **Fencing:** a peer claiming `primary` while this node is primary
  and holds the lease has its claim ignored (audited `ha.fencing`).
  A primary without a live lease steps down when the lease-holding
  peer claims primary. An operator demotes a node explicitly by
  setting `settings.ha.role` back to `standby`.
- **Stale heartbeats:** a heartbeat whose `sentAt` is further than
  the 15 s grace from receipt is rejected `400 stale_heartbeat` and
  never refreshes liveness.
- **Status:** `GET /api/ha/status` — peer secret header
  (`x-ha-peer-secret`) **or** a valid user session; without either it
  401s. Returns `status` (`single-node` | `healthy` | `degraded` |
  `unavailable`), role, `promotedByFailover`, peers (with `missed`,
  `heartbeatCount`, `alive`), the lease, and live TCP `probes[]`.
  The console's central settings (`GET /api/settings/central`) also
  reports a live `haStatus` (`Primary Active` / `Standby` /
  `Standby — PROMOTED to Active (failover …)` / `Not configured`).
- **Decisions:** `GET /api/ha/decisions` lists the `ha.*` audit rows
  (promote / demote / fencing / register / failover-test), most
  recent first, with real timestamps; promote entries carry `gapMs`.
- **Poller gating note:** a role change via `POST /api/settings/ha`
  takes effect for the heartbeat ticker immediately, but poller
  gating follows the role at process start and on
  promotion/demotion — restart a node after changing its configured
  role for polling to follow.

## Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/ha/register` | peer secret | Primary registers (or re-registers) with the standby; original-primary re-register demotes a promoted node |
| `POST /api/ha/heartbeat` | peer secret | Peer heartbeat; records the peer, acks with `{ ack, fenced }`; stale `sentAt` → 400 |
| `GET /api/ha/status` | peer secret **or** user session | Live HA status, peers, lease, TCP probes |
| `GET /api/ha/peers` | user session | Registered peers |
| `GET /api/ha/decisions` | user session | HA decision log (audit-backed) |
| `POST /api/ha/failover/test` | user session | Dry-run failover evaluation; never triggers failover |
| `GET /api/settings/ha` | user session | Canonical `settings.ha` |
| `POST /api/settings/ha` | user session | Save canonical `settings.ha`; (re)starts the ticker |
| `POST /api/settings/ha/test` | user session | Real TCP probe of the configured peer URL |

Peer endpoints fail closed: missing/wrong secret → `401`; secret
unset on the node → `503`; missing `peerId` or bad `role` → `400`.
The secret is compared with `timingSafeEqual` and is never logged,
stored, or echoed. `GET /api/ha/status` is exempt from the session
guard in `server/index.js` precisely so the peer-secret path can
reach it; the route enforces peer-secret-or-session itself.

## What HA does NOT do (provision separately)

- **No database replication.** Each node keeps its own SQLite file.
  Failover moves the *active role* and starts polling on the standby; it
  does **not** copy devices, alarms, users, or settings to the standby.
  Until replication (or a restore-from-backup step) exists, the promoted
  standby starts from *its own* last-known state. Plan a backup/restore
  of the primary's `opmanager.db` onto the standby, or add real
  replication, before relying on failover in production.
- **No virtual IP / DNS move.** Clients must be pointed at the promoted
  node (manual re-point, DNS change, or a load balancer / VIP in front
  of the pair). HA changes which node is active; it does not move the
  address clients use.
- **Fencing limit (stated honestly).** The lease table lives in each
  node's OWN SQLite file, so the split-brain guard is per-node, not
  shared: a network partition can still leave two primaries until the
  original primary re-registers (or an operator demotes one). There is
  no shared store and no VIP. Treat a partition as an operator
  decision, not an automatic reconciliation.
- **No TLS between nodes by itself.** Peer URLs are plain `http:` by
  default — use `https:` peer URLs behind a reverse proxy, or run the
  pair over a private network / Tailscale, and treat the peer secret as
  a bearer credential on that path.

## Verifying a pair (no secret on the command line)

```bash
# on either node, with OPM_HA_PEER_SECRET exported in your shell only:
curl -s -H "x-ha-peer-secret: $OPM_HA_PEER_SECRET" http://127.0.0.1:8164/api/ha/status
curl -s -H "x-ha-peer-secret: $OPM_HA_PEER_SECRET" http://127.0.0.1:18164/api/ha/status
# expect: primary role=primary, heartbeats flowing both ways
# (peers[].heartbeatCount rising); standby role=standby, status=healthy
```

Kill the primary process and watch the standby: within ~13–19 s its
role becomes `primary`, `promotedByFailover` is true, and an
`ha.promote` record with `gapMs` appears in
`GET /api/ha/decisions`. Restart the primary and watch the standby
return to `standby` with an `ha.demote` (`primary-rejoined`) record.
That is exactly what `docs/ha-proof-log.md` records, and what
`scripts/test-ha.js` (cases C0–C5) checks on every run.
