'use strict';
/**
 * HA failover service — real-data branch, Phase 3 ha-service track.
 *
 * Real high-availability failover between two OpManager Central nodes.
 * There is NO standby node in production today (single node), so this
 * service can only be exercised end-to-end once a second node exists;
 * everything below is the full real code path, proven here against a
 * throwaway DB and a local HTTP test peer that speaks the same wire
 * protocol (see server/services/ha.test.js). Nothing is faked: a status
 * is only ever computed from persisted peer rows plus a live TCP probe,
 * and a promotion only ever happens after the real missed-heartbeat +
 * lease checks pass.
 *
 * ------------------------------------------------------------------
 * Wire protocol (this file owns the logic; server/routes/ha.js — the
 * ha-routes track — owns the HTTP surface; the contract is fixed here):
 *   POST /api/ha/heartbeat
 *     Auth: shared peer secret, runtime env OPM_HA_PEER_SECRET only
 *           (never stored, never logged, never echoed). Sent as the
 *           X-HA-Peer-Secret header or the `peerSecret` body field.
 *           authenticatePeer() below enforces it in constant time;
 *           unset secret => heartbeats refused (fail closed).
 *     Request  JSON: { peerId, role: 'primary'|'standby',
 *                      url, sentAt }        // sentAt: epoch ms
 *     Response JSON: { status: 'success', peer: { peerId, role, url,
 *                      lastSeenAt, ageMs, heartbeatCount, alive },
 *                      serverTime, serverRole }
 *     400 when peerId is missing, role is not primary|standby, or url
 *     is present but not an http(s) URL. The receiver answers with
 *     recordHeartbeat() below, so any peer that POSTs here is speaking
 *     this protocol.
 * ------------------------------------------------------------------
 * Failover rule (documented, deterministic — read before changing):
 *   graceMs = heartbeatSec * missThreshold * 1000   (default 5s * 3 = 15s)
 *   A peer is ALIVE while now - lastSeenAt <= graceMs, else DEAD.
 *   A standby node promotes to primary ONLY when ALL of these hold:
 *     1. this node's configured role is 'standby';
 *     2. a peer registered with role 'primary' exists;
 *     3. that primary is DEAD (past grace — i.e. it missed
 *        missThreshold consecutive heartbeats);
 *     4. this node ATOMICALLY acquires the failover lease
 *        (store.acquireHaLease: exactly one holder wins; a lease held
 *        by another live node, or not yet expired, blocks promotion).
 *   evaluateFailover() is the DRY RUN: it reports wouldTrigger and
 *   never mutates anything (no lease, no role change) — the
 *   POST /api/ha/failover/test route calls it. attemptFailover() is
 *   the real thing: it evaluates, then takes the lease and persists
 *   the promotion. The background ticker calls attemptFailover().
 *   Promotion is STICKY: the promoted node's role is persisted as
 *   'primary' in settings.ha and it renews the lease every tick. A
 *   returning old primary does NOT auto-demote the new primary by
 *   merely heartbeating again, and does NOT reclaim the role: when it
 *   sends a heartbeat claiming 'primary' while the lease holder is
 *   someone else, the lease holder keeps the role and the returnee is
 *   fenced (see recordHeartbeat fencing). The ONE exception is the
 *   explicit rejoin handshake: when the original primary (the peer
 *   named in the most recent ha.promote audit event) re-registers via
 *   POST /api/ha/register, the promoted node demotes back to standby
 *   (handlePrimaryRegistration) — that is the defined reconciliation
 *   for a real primary return, and the only path that demotes a
 *   promoted node without an operator. An operator demotes a node
 *   explicitly by setting settings.ha.role back to 'standby'.
 *   Split-brain guard, in one line: at most one node holds the lease,
 *   and only the lease holder may act as primary. LIMIT, stated
 *   honestly: the lease table lives in each node's OWN SQLite file,
 *   so the guard is per-node, not shared — a network partition can
 *   still leave two primaries until the original primary re-registers
 *   (or an operator demotes one). There is no shared store and no VIP.
 * ------------------------------------------------------------------
 * Decisions (GET /api/ha/decisions): the ha.* audit rows — promote,
 * demote, fencing, register, failover-test — most recent first.
 * Env overrides (ha-proof): OPM_HA_ROLE (fresh node only),
 * OPM_HA_PEER_URL, OPM_HA_SELF_URL, OPM_HA_HEARTBEAT_SEC, OPM_HA_NODE_ID.
 * ------------------------------------------------------------------
 * Persistence (server/services/store.js, tables ha_peers / ha_leases):
 *   ha_peers  — one row per known peer: node_id (the peer's peerId),
 *               role, url, last_seen_at (epoch ms of the last heartbeat
 *               received from, or successfully sent to, that peer),
 *               missed (consecutive failed outbound heartbeats),
 *               heartbeat_count (heartbeats received from the peer).
 *   ha_leases — single row (id = 1): holder node id, acquired_at,
 *               expires_at. Acquire is one BEGIN IMMEDIATE transaction
 *               so two nodes racing can never both win.
 *   settings.ha — canonical config (see SHARED.md): { role, standbyUrl,
 *               primaryUrl, nodeUrl, nodeId, heartbeatSec,
 *               missThreshold, leaseTermMs, promotedByFailover }.
 *               promotedByFailover is set by attemptFailover and
 *               cleared on any demotion; it is what lets
 *               handlePrimaryRegistration tell a failover-promoted
 *               primary from an operator-configured one.
 *   audit_log — every promotion / demotion / fencing event is written
 *               via audit('ha.promote' | 'ha.demote' | ...).
 * ------------------------------------------------------------------
 * Production requirement: a SECOND OpManager Central node, reachable
 * over HTTP(S), with settings.ha.role='standby' and
 * settings.ha.primaryUrl pointing at this node's URL (and this node's
 * settings.ha.standbyUrl pointing back), plus the SAME
 * OPM_HA_PEER_SECRET set in the runtime environment of both nodes.
 * Without that second node the service reports status 'single-node'
 * and start() honestly refuses ('no-peer-configured') instead of
 * pretending to heartbeat.
 */

const crypto = require('node:crypto');
const net = require('node:net');
const store = require('./store');

const HEARTBEAT_PATH = '/api/ha/heartbeat';

// Default miss threshold (consecutive missed heartbeats before a peer
// is DEAD). Exported because server/routes/ha.js uses it for its
// per-peer `alive` flag: ageMs <= heartbeatSec * 1000 * STALE_AFTER_BEATS.
// The service itself uses the configured missThreshold (same default).
const STALE_AFTER_BEATS = 3;

const DEFAULTS = Object.freeze({
  role: 'standby',
  standbyUrl: null,
  primaryUrl: null,
  nodeUrl: null,
  nodeId: null,
  heartbeatSec: 5,
  missThreshold: STALE_AFTER_BEATS,
  leaseTermMs: 15000,
  requestTimeoutMs: 3000,
  promotedByFailover: false,
});

const ROLES = ['primary', 'standby'];

function isHttpUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateConfig(cfg) {
  if (!ROLES.includes(cfg.role)) {
    throw new Error(`ha: role must be 'primary' or 'standby', got ${JSON.stringify(cfg.role)}`);
  }
  if (!Number.isInteger(cfg.heartbeatSec) || cfg.heartbeatSec < 1 || cfg.heartbeatSec > 60) {
    throw new Error(`ha: heartbeatSec must be an integer 1..60, got ${cfg.heartbeatSec}`);
  }
  if (!Number.isInteger(cfg.missThreshold) || cfg.missThreshold < 2 || cfg.missThreshold > 10) {
    throw new Error(`ha: missThreshold must be an integer 2..10, got ${cfg.missThreshold}`);
  }
  if (!Number.isInteger(cfg.leaseTermMs) || cfg.leaseTermMs < 1000 || cfg.leaseTermMs > 120000) {
    throw new Error(`ha: leaseTermMs must be an integer 1000..120000, got ${cfg.leaseTermMs}`);
  }
  if (!Number.isInteger(cfg.requestTimeoutMs) || cfg.requestTimeoutMs < 500 || cfg.requestTimeoutMs > 30000) {
    throw new Error(`ha: requestTimeoutMs must be an integer 500..30000, got ${cfg.requestTimeoutMs}`);
  }
  for (const key of ['standbyUrl', 'primaryUrl', 'nodeUrl']) {
    if (cfg[key] !== null && cfg[key] !== undefined && !isHttpUrl(cfg[key])) {
      throw new Error(`ha: ${key} must be an http(s) URL or null, got ${JSON.stringify(cfg[key])}`);
    }
  }
  if (cfg.nodeId !== null && cfg.nodeId !== undefined && (typeof cfg.nodeId !== 'string' || cfg.nodeId.length === 0)) {
    throw new Error('ha: nodeId must be a non-empty string or null');
  }
  return cfg;
}

/**
 * Runtime env overrides (ported from ha-proof; canonical defaults —
 * heartbeatSec 5, missThreshold 3, lease 15s — apply unless overridden):
 *   OPM_HA_HEARTBEAT_SEC — heartbeat interval seconds (1..60).
 *   OPM_HA_PEER_URL — the other node's URL: it becomes standbyUrl on a
 *     primary, primaryUrl on a standby.
 *   OPM_HA_SELF_URL — this node's own URL (nodeUrl).
 *   OPM_HA_NODE_ID — this node's peerId.
 *   OPM_HA_ROLE — applies ONLY on a fresh node with no stored
 *     settings.ha row (first provisioning). Once a role is stored, the
 *     stored role wins, so a failover promotion is never undone by a
 *     stale env var on the next read. Invalid env values are ignored
 *     (never crash the service, never wipe stored config).
 */
function envOverrides(role, hasStored) {
  const o = {};
  if (process.env.OPM_HA_HEARTBEAT_SEC !== undefined) {
    const hb = Number(process.env.OPM_HA_HEARTBEAT_SEC);
    if (Number.isInteger(hb) && hb >= 1 && hb <= 60) o.heartbeatSec = hb;
  }
  const peer = process.env.OPM_HA_PEER_URL;
  if (peer && isHttpUrl(peer)) {
    if (role === 'primary') o.standbyUrl = peer;
    else o.primaryUrl = peer;
  }
  const self = process.env.OPM_HA_SELF_URL;
  if (self && isHttpUrl(self)) o.nodeUrl = self;
  const nodeId = process.env.OPM_HA_NODE_ID;
  if (nodeId && typeof nodeId === 'string' && nodeId.trim().length > 0) o.nodeId = nodeId.trim();
  if (!hasStored) {
    const r = String(process.env.OPM_HA_ROLE || '').trim().toLowerCase();
    if (ROLES.includes(r)) o.role = r;
  }
  return o;
}

/** Read the persisted config merged over defaults. Never throws on absence. */
function getConfig() {
  let stored = null;
  let hasStored = false;
  try {
    const raw = store.getSetting('ha');
    if (raw) {
      hasStored = true;
      stored = JSON.parse(raw);
    }
  } catch {
    stored = null;
  }
  const storedObj = stored && typeof stored === 'object' ? stored : {};
  const storedRole = ROLES.includes(storedObj.role) ? storedObj.role : null;
  const envRole = ROLES.includes(String(process.env.OPM_HA_ROLE || '').trim().toLowerCase())
    ? String(process.env.OPM_HA_ROLE).trim().toLowerCase()
    : null;
  const effectiveRole = storedRole || envRole || DEFAULTS.role;
  const merged = { ...DEFAULTS, ...storedObj, ...envOverrides(effectiveRole, hasStored) };
  // Stored values are trusted only after validation; a corrupt row falls
  // back to defaults rather than crashing the service.
  try {
    return validateConfig(merged);
  } catch {
    return { ...DEFAULTS };
  }
}

/** Merge a patch into the persisted config, validate, store, return it. */
function setConfig(patch) {
  const merged = { ...getConfig(), ...(patch || {}) };
  validateConfig(merged);
  store.setSetting('ha', merged);
  return merged;
}

/** Stable identity for this node (its peerId); generated once and persisted. */
function ensureNodeId() {
  const cfg = getConfig();
  if (cfg.nodeId) return cfg.nodeId;
  const nodeId = `node-${crypto.randomUUID()}`;
  setConfig({ nodeId });
  return nodeId;
}

function graceMs(cfg) {
  return cfg.heartbeatSec * cfg.missThreshold * 1000;
}

/** This node's own base URL for heartbeat payloads. Loopback fallback is
 * only valid for a single-host test; production must set nodeUrl. */
function ownUrl() {
  const cfg = getConfig();
  if (cfg.nodeUrl) return cfg.nodeUrl;
  const port = Number(process.env.PORT) || 8060;
  return `http://localhost:${port}`;
}

/** Audit helper: store.log(user, action, detail) — user is null (system). */
function audit(action, detail) {
  try { store.log(null, action, detail); } catch { /* audit must never break HA */ }
}

// ------------------------------------------------------- peer auth ---

/**
 * Peer authentication for POST /api/ha/heartbeat (server/routes/ha.js).
 * The secret comes ONLY from the runtime env OPM_HA_PEER_SECRET — it is
 * never stored, never logged, never echoed. Compared in constant time.
 *   { configured: false, ok: false } — env unset: refuse (fail closed).
 *   { configured: true, ok: true|false } — secret set, presented matches or not.
 */
function authenticatePeer(presented) {
  const secret = process.env.OPM_HA_PEER_SECRET || '';
  if (!secret) return { configured: false, ok: false };
  if (typeof presented !== 'string' || presented.length === 0) return { configured: true, ok: false };
  const a = Buffer.from(presented, 'utf8');
  const b = Buffer.from(secret, 'utf8');
  if (a.length !== b.length) return { configured: true, ok: false };
  return { configured: true, ok: crypto.timingSafeEqual(a, b) };
}

/**
 * Parse a heartbeat sentAt: epoch ms (canonical) or an ISO string
 * (ha-proof's `at`). Returns undefined when absent, NaN when present
 * but unparseable, else epoch ms.
 */
function parseSentAt(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
    const t = Date.parse(value);
    return Number.isNaN(t) ? NaN : t;
  }
  return NaN;
}

function staleHeartbeatError(message) {
  const err = new Error(`ha.recordHeartbeat: stale heartbeat — ${message}`);
  err.code = 'STALE_HEARTBEAT';
  return err;
}

// ------------------------------------------------------- callbacks ---
// Poller gating callbacks (ported from ha-proof's init({onPromote,
// onDemote})): index.js registers them; the service fires onPromote
// after a real promotion and onDemote after a demotion, so a standby
// only polls once it is active. A callback that throws never breaks HA.
let callbacks = { onPromote: null, onDemote: null };
function setCallbacks(c) {
  if (c && typeof c === 'object') {
    if (typeof c.onPromote === 'function') callbacks.onPromote = c.onPromote;
    if (typeof c.onDemote === 'function') callbacks.onDemote = c.onDemote;
  }
  return { ...callbacks };
}
function fireCallback(name, detail) {
  const fn = callbacks[name];
  if (typeof fn !== 'function') return;
  try {
    fn(detail);
  } catch (err) {
    audit('ha.callback-error', { callback: name, error: String((err && err.message) || err) });
  }
}

/** Most recent audit row for one action (detail JSON-parsed), or null. */
function lastAuditEvent(action) {
  try {
    const rows = store.listAudit(200);
    const row = rows.find((r) => r.action === action);
    if (!row) return null;
    let detail = row.detail;
    try {
      detail = typeof detail === 'string' ? JSON.parse(detail) : detail;
    } catch { /* keep raw detail */ }
    return { id: row.id, at: row.created_at, detail };
  } catch {
    return null;
  }
}

// -------------------------------------------------------------- peers ---

/** Public (camelCase) shape of a stored peer row. */
function publicPeer(row, nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const cfg = getConfig();
  const msSinceSeen = now - row.last_seen_at;
  return {
    peerId: row.node_id,
    role: row.role,
    url: row.url,
    lastSeenAt: row.last_seen_at,
    msSinceSeen,
    missed: row.missed,
    heartbeatCount: row.heartbeat_count,
    alive: msSinceSeen <= graceMs(cfg),
    status: msSinceSeen <= graceMs(cfg) ? 'alive' : 'dead',
  };
}

/** Register (or re-register) a peer. Returns the public peer shape. */
function registerPeer(peer, nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const p = peer || {};
  const nodeId = p.peerId !== undefined ? p.peerId : p.nodeId;
  if (typeof nodeId !== 'string' || nodeId.length === 0) {
    throw new Error('ha.registerPeer: peerId (non-empty string) is required');
  }
  if (!ROLES.includes(p.role)) {
    throw new Error(`ha.registerPeer: role must be 'primary' or 'standby', got ${JSON.stringify(p.role)}`);
  }
  if (p.url !== null && p.url !== undefined && !isHttpUrl(p.url)) {
    throw new Error(`ha.registerPeer: url must be an http(s) URL or null, got ${JSON.stringify(p.url)}`);
  }
  const row = store.registerHaPeer({ nodeId, role: p.role, url: p.url ?? null }, now);
  return publicPeer(row, now);
}

/** All registered peers, public shape, ordered by peerId. */
function listPeers(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  return store.listHaPeers().map((row) => publicPeer(row, now));
}

function getPeer(peerId, nowMs) {
  const row = store.getHaPeer(peerId);
  return row ? publicPeer(row, nowMs) : null;
}

function removePeer(peerId) {
  return store.removeHaPeer(peerId);
}

// --------------------------------------------------------- heartbeats ---

/**
 * Handle an inbound heartbeat (server/routes/ha.js calls this from
 * POST /api/ha/heartbeat, after authenticatePeer). Registers an
 * unknown peer, refreshes lastSeenAt, resets the missed counter and
 * increments heartbeatCount for a known one.
 * Fencing: a peer claiming 'primary' while this node is primary and
 * does NOT hold the lease loses the argument — this node either wins
 * the lease race (stays primary) or steps down to 'standby'.
 * Returns the public peer shape plus { ack: true, fenced }.
 */
function recordHeartbeat(payload, nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const p = payload || {};
  const nodeId = p.peerId !== undefined ? p.peerId : p.nodeId;
  if (typeof nodeId !== 'string' || nodeId.length === 0) {
    throw new Error('ha.recordHeartbeat: peerId (non-empty string) is required');
  }
  if (!ROLES.includes(p.role)) {
    throw new Error(`ha.recordHeartbeat: role must be 'primary' or 'standby', got ${JSON.stringify(p.role)}`);
  }
  if (p.url !== null && p.url !== undefined && !isHttpUrl(p.url)) {
    throw new Error(`ha.recordHeartbeat: url must be an http(s) URL or null, got ${JSON.stringify(p.url)}`);
  }
  // Stale-heartbeat rejection: a heartbeat whose sentAt is further from
  // receipt time than the grace window is not a live heartbeat — reject
  // it instead of refreshing liveness from it. Absent sentAt is
  // accepted (older peers / manual posts); liveness is still measured
  // from receipt time. This is the C5 case in scripts/test-ha.js.
  const sentAt = parseSentAt(p.sentAt !== undefined ? p.sentAt : p.at);
  if (sentAt !== undefined) {
    if (Number.isNaN(sentAt)) throw staleHeartbeatError('sentAt is not a valid timestamp');
    const cfgForGrace = getConfig();
    if (Math.abs(now - sentAt) > graceMs(cfgForGrace)) {
      throw staleHeartbeatError(
        `sentAt ${new Date(sentAt).toISOString()} is ${Math.abs(now - sentAt)}ms from receipt (grace ${graceMs(cfgForGrace)}ms)`
      );
    }
  }
  const row = store.recordHaHeartbeat({ nodeId, role: p.role, url: p.url ?? null }, now);
  const peer = publicPeer(row, now);

  let fenced = false;
  const cfg = getConfig();
  if (p.role === 'primary' && cfg.role === 'primary' && nodeId !== cfg.nodeId) {
    const selfId = ensureNodeId();
    const lease = store.getHaLease();
    const selfHolds = lease && lease.holder === selfId && lease.expires_at > now;
    const peerHolds = lease && lease.holder === nodeId && lease.expires_at > now;
    if (peerHolds) {
      // The peer holds the lease: it is the legitimate primary.
      // This node steps down rather than risk a split-brain.
      setConfig({ role: 'standby', promotedByFailover: false });
      audit('ha.demote', {
        reason: 'fencing: peer primary holds the failover lease',
        peerNodeId: nodeId,
        leaseHolder: lease.holder,
        leaseExpiresAt: lease.expires_at,
      });
      fireCallback('onDemote', { reason: 'fencing: peer primary holds the failover lease', peerNodeId: nodeId });
      fenced = true;
    } else if (!selfHolds) {
      // Neither side holds a live lease: race once, atomically.
      // Exactly one node can win; the loser steps down.
      const won = store.acquireHaLease(selfId, cfg.leaseTermMs, now);
      if (won.acquired) {
        audit('ha.fencing', {
          reason: 'lease race won against a peer claiming primary',
          peerNodeId: nodeId,
          leaseExpiresAt: won.expiresAt,
        });
      } else {
        setConfig({ role: 'standby', promotedByFailover: false });
        audit('ha.demote', {
          reason: 'fencing: lost the lease race to a peer claiming primary',
          peerNodeId: nodeId,
          leaseHolder: won.holder,
        });
        fireCallback('onDemote', { reason: 'fencing: lost the lease race to a peer claiming primary', peerNodeId: nodeId });
        fenced = true;
      }
    } else {
      // selfHolds: this node is the legitimate primary; the peer's
      // claim is stale. It is ignored (audited) and no role changes.
      audit('ha.fencing', {
        reason: 'ignored stale primary claim from peer; this node holds the lease',
        peerNodeId: nodeId,
        leaseHolder: lease.holder,
      });
    }
  }
  return { ...peer, ack: true, fenced };
}

/** Alias kept for the service's own tests / ticker naming. */
function receiveHeartbeat(payload, nowMs) {
  return recordHeartbeat(payload, nowMs);
}

/**
 * Send one heartbeat POST to a peer URL. Real HTTP (global fetch,
 * Node 24 builtin — no new dependency). The peer secret, when the
 * runtime env sets it, is sent as the X-HA-Peer-Secret header and
 * the peerSecret body field (both accepted by server/routes/ha.js).
 * On a success response ({ status: 'success', peer: { peerId } })
 * the peer row is refreshed (missed reset); on any failure (timeout,
 * refused, non-2xx, bad body) the peer's missed counter is
 * incremented by URL lookup. Never throws: the result object IS the
 * outcome, so the ticker can keep running after a dead peer.
 */
async function sendHeartbeat(peerUrl, opts) {
  const o = opts || {};
  const now = o.nowMs !== undefined ? o.nowMs : Date.now();
  const cfg = getConfig();
  const timeoutMs = o.timeoutMs || cfg.requestTimeoutMs;
  const nodeId = ensureNodeId();
  const secret = process.env.OPM_HA_PEER_SECRET || null;
  const t0 = Date.now();
  let res;
  try {
    const target = new URL(HEARTBEAT_PATH, peerUrl).toString();
    const headers = { 'content-type': 'application/json' };
    const body = { peerId: nodeId, role: cfg.role, url: ownUrl(), sentAt: now };
    if (secret) {
      headers['x-ha-peer-secret'] = secret;
      body.peerSecret = secret;
    }
    res = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    // Undici wraps the underlying socket error: err.message is the
    // generic 'fetch failed' and the real reason (e.g. ECONNREFUSED)
    // lives on err.cause. Surface both so the missed-heartbeat record
    // names the actual failure.
    const cause = err && err.cause && err.cause.message ? `: ${err.cause.message}` : '';
    const detail = err && err.name === 'TimeoutError' ? 'timeout' : `${(err && err.message) || 'fetch failed'}${cause}`;
    return noteMiss(peerUrl, now, detail);
  }
  const latencyMs = Date.now() - t0;
  let parsed = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  const peerId =
    (parsed && parsed.peer && typeof parsed.peer.peerId === 'string' && parsed.peer.peerId) ||
    (parsed && typeof parsed.peerId === 'string' && parsed.peerId) ||
    (parsed && typeof parsed.nodeId === 'string' && parsed.nodeId) ||
    null;
  const acked = parsed && (parsed.ack === true || parsed.status === 'success');
  if (!res.ok || !acked || !peerId) {
    return noteMiss(peerUrl, now, `bad heartbeat response: HTTP ${res.status}`);
  }
  const role = parsed.peer && (parsed.peer.role === 'primary' || parsed.peer.role === 'standby')
    ? parsed.peer.role
    : 'standby';
  const row = store.recordHaHeartbeat({ nodeId: peerId, role, url: peerUrl }, now);
  return { ok: true, peerUrl, peerId: row.node_id, latencyMs, missed: 0, sentAt: now };
}

function noteMiss(peerUrl, now, error) {
  const peer = store.getHaPeerByUrl(peerUrl);
  let missed = null;
  if (peer) {
    const updated = store.markHaPeerMissed(peer.node_id, now);
    missed = updated ? updated.missed : null;
  }
  return { ok: false, peerUrl, error: String(error), missed, sentAt: now };
}

// ---------------------------------------------------------- register ---
// Explicit rejoin handshake (ported from ha-proof): a primary registers
// with its standby on startup (and the ticker retries until it lands),
// so the standby knows the primary is back. Heartbeats alone never
// demote a promoted node — only this explicit register from the SAME
// primary that died (named in the most recent ha.promote audit event)
// demotes it, which keeps promotion sticky against transient blips
// while still reconciling a real primary return (no dual-primary).
let registeredWithPeer = false;

/** POST /api/ha/register to the peer. Never throws; the result IS the outcome. */
async function registerWithPeer() {
  const cfg = getConfig();
  if (cfg.role !== 'primary') return { ok: false, error: 'not-primary' };
  const peerUrl = cfg.standbyUrl;
  if (!peerUrl) return { ok: false, error: 'no-peer-configured' };
  const secret = process.env.OPM_HA_PEER_SECRET || null;
  if (!secret) return { ok: false, error: 'no-peer-secret-configured' };
  const nodeId = ensureNodeId();
  try {
    const res = await fetch(new URL('/api/ha/register', peerUrl).toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-ha-peer-secret': secret },
      body: JSON.stringify({ peerId: nodeId, role: cfg.role, url: ownUrl(), sentAt: Date.now(), peerSecret: secret }),
      signal: AbortSignal.timeout(cfg.requestTimeoutMs),
    });
    let parsed = null;
    try {
      parsed = await res.json();
    } catch { /* non-JSON body */ }
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    registeredWithPeer = true;
    return { ok: true, status: res.status, body: parsed };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  }
}

/**
 * Handle an inbound POST /api/ha/register (server/routes/ha.js calls
 * this after authenticatePeer). Registers the peer, then applies the
 * rejoin rule: if this node was promoted by failover because THIS
 * peer's primary died, the original primary is authoritative again —
 * demote back to standby, release the lease, audit ha.demote, fire
 * onDemote (poller stops). Any other registration is recorded only.
 * Returns the public peer shape plus { reRegistered, wasPromoted, demoted }.
 */
function handlePrimaryRegistration(payload, nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const p = payload || {};
  const nodeId = p.peerId !== undefined ? p.peerId : p.nodeId;
  if (typeof nodeId !== 'string' || nodeId.length === 0) {
    throw new Error('ha.handlePrimaryRegistration: peerId (non-empty string) is required');
  }
  if (!ROLES.includes(p.role)) {
    throw new Error(`ha.handlePrimaryRegistration: role must be 'primary' or 'standby', got ${JSON.stringify(p.role)}`);
  }
  if (p.url !== null && p.url !== undefined && !isHttpUrl(p.url)) {
    throw new Error(`ha.handlePrimaryRegistration: url must be an http(s) URL or null, got ${JSON.stringify(p.url)}`);
  }
  const peer = registerPeer({ peerId: nodeId, role: p.role, url: p.url ?? null }, now);
  let wasPromoted = false;
  let demoted = false;
  const cfg = getConfig();
  if (p.role === 'primary' && cfg.role === 'primary' && cfg.promotedByFailover === true) {
    const lastPromote = lastAuditEvent('ha.promote');
    const deadPrimaryId = lastPromote && lastPromote.detail && lastPromote.detail.primaryNodeId;
    if (deadPrimaryId && deadPrimaryId === nodeId) {
      wasPromoted = true;
      demoted = true;
      const selfId = ensureNodeId();
      try {
        store.releaseHaLease(selfId);
      } catch { /* lease release must never break registration */ }
      setConfig({ role: 'standby', promotedByFailover: false });
      audit('ha.demote', {
        reason: 'primary-rejoined: original primary re-registered',
        peerNodeId: nodeId,
        promotedAt: lastPromote ? new Date(lastPromote.at).toISOString() : null,
        demotedAt: new Date(now).toISOString(),
      });
      fireCallback('onDemote', { reason: 'primary-rejoined', peerNodeId: nodeId });
    }
  }
  if (!demoted) {
    audit('ha.register', { peerNodeId: nodeId, role: p.role, url: p.url ?? null });
  }
  return { ...peer, reRegistered: true, wasPromoted, demoted };
}

// ------------------------------------------------------------ status ---

/** Per-peer liveness + overall cluster status, from persisted rows only. */
function computeStatus(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const cfg = getConfig();
  const grace = graceMs(cfg);
  const peers = listPeers(now);
  const primary = peers.find((p) => p.role === 'primary') || null;
  const standby = peers.find((p) => p.role === 'standby') || null;
  const primaryAlive = primary ? primary.alive : false;
  const standbyAlive = standby ? standby.alive : false;
  let status;
  if (peers.length === 0) status = 'single-node';
  else if (primaryAlive && standbyAlive) status = 'healthy';
  else if (primaryAlive || standbyAlive) status = 'degraded';
  else status = 'unavailable';
  return {
    status,
    role: cfg.role,
    nodeId: cfg.nodeId,
    promotedByFailover: cfg.promotedByFailover === true,
    heartbeatSec: cfg.heartbeatSec,
    missThreshold: cfg.missThreshold,
    graceMs: grace,
    leaseTermMs: cfg.leaseTermMs,
    primaryAlive,
    standbyAlive,
    primaryUrl: cfg.role === 'standby' ? cfg.primaryUrl : cfg.standbyUrl,
    peers,
    lease: store.getHaLease(),
    checkedAt: now,
  };
}

/** Real TCP connect probe of one peer URL (same technique as the
 * settings failover test). Never throws; { reachable, latencyMs|error }. */
function probePeer(peerUrl, timeoutMs) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(peerUrl);
    } catch {
      resolve({ url: peerUrl, reachable: false, error: 'invalid URL' });
      return;
    }
    const port = Number(url.port) || (url.protocol === 'https:' ? 443 : 80);
    const t0 = Date.now();
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      resolve(result);
    };
    const socket = net.connect({ host: url.hostname, port, timeout: timeoutMs || 3000 });
    socket.on('connect', () => {
      const latencyMs = Date.now() - t0;
      socket.destroy();
      finish({ url: peerUrl, reachable: true, latencyMs });
    });
    socket.on('timeout', () => {
      socket.destroy();
      finish({ url: peerUrl, reachable: false, error: 'timeout', latencyMs: Date.now() - t0 });
    });
    socket.on('error', (err) => {
      finish({ url: peerUrl, reachable: false, error: err.message, latencyMs: Date.now() - t0 });
    });
  });
}

/**
 * Full HA status for GET /api/ha/status (server/routes/ha.js awaits
 * this): computeStatus plus a live TCP probe of every known peer URL
 * and of the configured peer URL. A peer with no URL configured and
 * no registered row probes as null (nothing to probe — honest, not
 * a faked reachable).
 */
async function getStatus(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const status = computeStatus(now);
  const cfg = getConfig();
  const urls = new Set();
  for (const p of status.peers) if (p.url) urls.add(p.url);
  if (cfg.role === 'primary' && cfg.standbyUrl) urls.add(cfg.standbyUrl);
  if (cfg.role === 'standby' && cfg.primaryUrl) urls.add(cfg.primaryUrl);
  const probes = [];
  for (const url of urls) {
    probes.push(await probePeer(url, cfg.requestTimeoutMs));
  }
  return { ...status, probes };
}

/** Full state snapshot (status + config + lease) for diagnostics. */
function getState(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  return {
    config: getConfig(),
    status: computeStatus(now),
    lease: store.getHaLease(),
  };
}

/** One-line status for GET /api/settings/central (haStatus), ported from ha-proof. */
function getStatusSummary() {
  try {
    const cfg = getConfig();
    const status = computeStatus(Date.now());
    const peerConfigured = Boolean(cfg.standbyUrl || cfg.primaryUrl) || status.peers.length > 0;
    if (!peerConfigured) return 'Not configured';
    if (status.status === 'single-node') return 'Single node';
    if (cfg.role === 'primary' && cfg.promotedByFailover === true) {
      const last = lastAuditEvent('ha.promote');
      return `Standby — PROMOTED to Active (failover ${last ? new Date(last.at).toISOString() : 'unknown time'})`;
    }
    if (cfg.role === 'primary') return 'Primary Active';
    return 'Standby';
  } catch {
    return null;
  }
}

/**
 * HA decision log for GET /api/ha/decisions: the ha.* audit rows, most
 * recent first — promotions, demotions, fencing, registrations and
 * failover-test runs. Nothing is invented: every entry is a persisted
 * audit row with its real timestamp. promote entries carry gapMs
 * (ms since the dead primary was last seen).
 */
function listDecisions(limit) {
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  let rows = [];
  try {
    rows = store.listAudit(1000);
  } catch {
    rows = [];
  }
  return rows
    .filter((r) => typeof r.action === 'string' && r.action.startsWith('ha.'))
    .slice(0, n)
    .map((r) => {
      let detail = null;
      try {
        detail = typeof r.detail === 'string' ? JSON.parse(r.detail) : r.detail;
      } catch {
        detail = r.detail;
      }
      const d = {
        id: r.id,
        at: new Date(r.created_at).toISOString(),
        createdAt: r.created_at,
        action: r.action,
        type: r.action.replace(/^ha\./, ''),
        detail,
      };
      if (detail && typeof detail === 'object' && typeof detail.msSinceSeen === 'number') {
        d.gapMs = detail.msSinceSeen;
      }
      return d;
    });
}

// ---------------------------------------------------------- failover ---

/**
 * Failover decision — DRY RUN (POST /api/ha/failover/test calls this).
 * Reads state only: never acquires the lease, never changes the role,
 * never writes. Returns:
 *   { wouldTrigger, decision: 'promote'|'no-action', reason, role,
 *     primaryUrl, primaryPeerId, msSinceSeen, graceMs,
 *     leaseHolder, leaseExpiresAt, checkedAt }
 * Reasons: 'not-standby' | 'no-primary-registered' | 'primary-alive' |
 * 'primary-missed-threshold' | 'lease-held-by-<peerId>'.
 */
function evaluateFailover(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const cfg = getConfig();
  const base = {
    role: cfg.role,
    primaryUrl: cfg.role === 'standby' ? cfg.primaryUrl : cfg.standbyUrl,
    checkedAt: now,
  };
  if (cfg.role !== 'standby') {
    return { ...base, wouldTrigger: false, decision: 'no-action', reason: 'not-standby' };
  }
  const status = computeStatus(now);
  const primary = status.peers.find((p) => p.role === 'primary') || null;
  if (!primary) {
    return { ...base, wouldTrigger: false, decision: 'no-action', reason: 'no-primary-registered' };
  }
  if (primary.alive) {
    return {
      ...base,
      wouldTrigger: false,
      decision: 'no-action',
      reason: 'primary-alive',
      primaryPeerId: primary.peerId,
      msSinceSeen: primary.msSinceSeen,
      graceMs: status.graceMs,
    };
  }
  // Primary is past grace. The lease is the split-brain guard: if
  // another live node already holds it, promotion is blocked even
  // though the primary is dead.
  const lease = store.getHaLease();
  if (lease && lease.holder !== cfg.nodeId && lease.expires_at > now) {
    return {
      ...base,
      wouldTrigger: false,
      decision: 'no-action',
      reason: `lease-held-by-${lease.holder}`,
      primaryPeerId: primary.peerId,
      msSinceSeen: primary.msSinceSeen,
      graceMs: status.graceMs,
      leaseHolder: lease.holder,
      leaseExpiresAt: lease.expires_at,
    };
  }
  return {
    ...base,
    wouldTrigger: true,
    decision: 'promote',
    reason: 'primary-missed-threshold',
    primaryPeerId: primary.peerId,
    msSinceSeen: primary.msSinceSeen,
    graceMs: status.graceMs,
    leaseHolder: lease ? lease.holder : null,
    leaseExpiresAt: lease ? lease.expires_at : null,
  };
}

/**
 * The real promotion. Evaluates (dry run), and only when it says
 * wouldTrigger, atomically takes the lease; the atomic acquire is
 * the final guard against a race with another standby. On success
 * the promotion is persisted immediately (role 'primary' in
 * settings.ha) and audit-logged, so a restart after promotion does
 * not forget it. Idempotent: a second call returns 'not-standby'.
 */
function attemptFailover(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const evaluation = evaluateFailover(now);
  if (!evaluation.wouldTrigger) return { ...evaluation, promoted: false };
  const cfg = getConfig();
  const nodeId = ensureNodeId();
  const lease = store.acquireHaLease(nodeId, cfg.leaseTermMs, now);
  if (!lease.acquired) {
    return {
      ...evaluation,
      wouldTrigger: false,
      decision: 'no-action',
      reason: `lease-held-by-${lease.holder}`,
      leaseHolder: lease.holder,
      leaseExpiresAt: lease.expiresAt,
      promoted: false,
    };
  }
  setConfig({ role: 'primary', promotedByFailover: true });
  audit('ha.promote', {
    reason: 'primary missed threshold heartbeats and lease acquired',
    primaryNodeId: evaluation.primaryPeerId,
    msSinceSeen: evaluation.msSinceSeen,
    graceMs: evaluation.graceMs,
    leaseExpiresAt: lease.expiresAt,
    promotedNodeId: nodeId,
  });
  fireCallback('onPromote', {
    reason: 'primary missed threshold heartbeats and lease acquired',
    primaryNodeId: evaluation.primaryPeerId,
    promotedNodeId: nodeId,
  });
  return {
    ...evaluation,
    decision: 'promote',
    reason: 'primary-missed-threshold-and-lease-acquired',
    leaseHolder: nodeId,
    leaseExpiresAt: lease.expiresAt,
    promoted: true,
  };
}

/** Renew this node's lease while it is primary (called each tick). */
function renewLease(nowMs) {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const cfg = getConfig();
  if (cfg.role !== 'primary' || !cfg.nodeId) return { renewed: false, reason: 'not-primary' };
  const renewed = store.renewHaLease(cfg.nodeId, cfg.leaseTermMs, now);
  return { renewed, holder: cfg.nodeId, checkedAt: now };
}

// ------------------------------------------------------------ ticker ---

let timer = null;
let ticking = false;

function peerUrls() {
  const cfg = getConfig();
  const urls = new Set();
  for (const p of listPeers()) if (p.url) urls.add(p.url);
  if (cfg.role === 'primary' && cfg.standbyUrl) urls.add(cfg.standbyUrl);
  if (cfg.role === 'standby' && cfg.primaryUrl) urls.add(cfg.primaryUrl);
  return [...urls];
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const now = Date.now();
    const cfg = getConfig();
    const urls = peerUrls();
    for (const url of urls) {
      try {
        await sendHeartbeat(url, { nowMs: now });
      } catch (err) {
        // sendHeartbeat never throws by contract; this is belt-and-braces
        // so one peer's failure can never kill the ticker.
        audit('ha.heartbeat-error', { peerUrl: url, error: String((err && err.message) || err) });
      }
    }
    // A primary (re-)registers with its standby until the handshake
    // lands — this is what lets a promoted standby demote on the
    // original primary's return. Silent retries; no log spam.
    if (cfg.role === 'primary' && !registeredWithPeer) {
      try {
        await registerWithPeer();
      } catch { /* retried next tick */ }
    }
    if (cfg.role === 'standby') {
      attemptFailover(now);
    } else if (cfg.role === 'primary') {
      renewLease(now);
    }
  } finally {
    ticking = false;
  }
}

/**
 * Start the background heartbeat ticker. Returns { started: false,
 * reason: 'no-peer-configured' } on a single node instead of
 * pretending to heartbeat — the honest single-node state. The timer
 * is unref'd so it never holds the process open on its own.
 */
function start() {
  if (timer) return { started: true, alreadyRunning: true };
  const cfg = getConfig();
  if (peerUrls().length === 0) {
    return { started: false, reason: 'no-peer-configured' };
  }
  ensureNodeId();
  if (cfg.role === 'primary') {
    // A primary must hold the lease from the start, or the fencing
    // rule in recordHeartbeat cannot tell it apart from a stale peer.
    store.acquireHaLease(cfg.nodeId || ensureNodeId(), cfg.leaseTermMs, Date.now());
  }
  timer = setInterval(() => {
    tick().catch((err) => {
      audit('ha.tick-error', { error: String((err && err.message) || err) });
    });
  }, cfg.heartbeatSec * 1000);
  if (typeof timer.unref === 'function') timer.unref();
  return { started: true, heartbeatSec: cfg.heartbeatSec };
}

function stop() {
  if (!timer) return { stopped: false, reason: 'not-running' };
  clearInterval(timer);
  timer = null;
  return { stopped: true };
}

module.exports = {
  HEARTBEAT_PATH,
  STALE_AFTER_BEATS,
  DEFAULTS,
  getConfig,
  setConfig,
  ensureNodeId,
  graceMs,
  ownUrl,
  authenticatePeer,
  registerPeer,
  listPeers,
  getPeer,
  removePeer,
  recordHeartbeat,
  receiveHeartbeat,
  sendHeartbeat,
  registerWithPeer,
  handlePrimaryRegistration,
  setCallbacks,
  listDecisions,
  getStatusSummary,
  probePeer,
  computeStatus,
  getStatus,
  getState,
  evaluateFailover,
  attemptFailover,
  renewLease,
  peerUrls,
  tick,
  start,
  stop,
};
