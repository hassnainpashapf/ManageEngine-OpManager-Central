'use strict';
/**
 * HA routes — Phase 4 merge (p4m-ha), canonical HA surface.
 *
 * Service: server/services/ha.js (ha-service core: persisted peers +
 * leases, atomic lease, sticky promotion, fencing, audit log, ticker).
 * This file owns ONLY the HTTP surface, adapted to that service.
 *
 *  GET  /api/ha/status         — real computed HA status (role, peers
 *                                with last-seen/missed, live TCP probes,
 *                                lease). Peer-secret OR user session:
 *                                exempt from the session guard in
 *                                server/index.js KEY_AUTH_API_ROUTES
 *                                (ha-proof's set); this handler enforces
 *                                the peer secret itself and falls back
 *                                to the session check, failing CLOSED.
 *  GET  /api/ha/peers          — real registered peers (heartbeat registry).
 *  GET  /api/ha/decisions      — HA decision log (ha.* audit rows:
 *                                promote / demote / fencing / register /
 *                                failover-test), most recent first.
 *  POST /api/ha/register       — primary rejoin handshake (ha-proof).
 *                                Peer-secret only (401/503 fail closed).
 *                                A register from the ORIGINAL primary
 *                                demotes a failover-promoted node; any
 *                                other register is recorded only.
 *  POST /api/ha/heartbeat      — peer heartbeat. Peer-authenticated by
 *                                the shared secret from runtime env
 *                                (OPM_HA_PEER_SECRET); NOT a user
 *                                session. Exempt from the session guard
 *                                like agent telemetry; this handler
 *                                enforces the peer secret and fails
 *                                CLOSED (401/503) without it. Stale
 *                                sentAt (further than the grace window)
 *                                is rejected 400 stale_heartbeat.
 *  POST /api/ha/failover/test  — full failover decision evaluation (dry
 *                                run): reports whether failover WOULD
 *                                trigger given current liveness. Never
 *                                triggers failover. Session-authenticated
 *                                by the global apiAuthGuard like every
 *                                other console API route.
 *  GET  /api/settings/ha       — canonical settings.ha
 *                                ({ standbyUrl, primaryUrl, nodeUrl,
 *                                nodeId, role, heartbeatSec,
 *                                missThreshold, leaseTermMs }).
 *  POST /api/settings/ha       — save canonical settings.ha (null URL
 *                                clears; null role/heartbeatSec leaves
 *                                the value unchanged). Saving (re)starts
 *                                the heartbeat ticker; a primary also
 *                                re-registers with its standby.
 *  POST /api/settings/ha/test  — real TCP probe of the configured peer
 *                                URL (standbyUrl on a primary, primaryUrl
 *                                on a standby). Honest not_configured
 *                                when no peer URL is set.
 *
 * Wire protocol (one protocol — ha-service's):
 *   POST /api/ha/heartbeat / /api/ha/register
 *     Auth: X-HA-Peer-Secret header or `peerSecret` body field,
 *           constant-time compared against OPM_HA_PEER_SECRET.
 *     JSON: { peerId, role: 'primary'|'standby', url, sentAt }
 *           (sentAt: epoch ms; an ISO `at` is also accepted).
 *     Ack:  { status: 'success', peer: { peerId, role, url,
 *             lastSeenAt (ISO), ageMs, heartbeatCount, alive,
 *             ack: true, fenced } , serverTime, serverRole }
 *   recordHeartbeat returns epoch-ms lastSeenAt + ack/fenced; this
 *   route converts lastSeenAt to ISO for the response — the route is
 *   adapted to the service, never the other way round.
 *
 * Defaults (one set): heartbeatSec 5, missThreshold 3, lease 15s.
 * No HA value is hardcoded and no secret is ever logged or returned:
 * heartbeat/register responses never echo the peer secret.
 *
 * The HA service is loaded lazily (same pattern as
 * server/routes/settings.js loadTemplateIndex): if server/services/ha.js
 * has not landed, reads honestly answer 501 instead of failing open.
 */
const express = require('express');
const { requireAuth, requireRole } = require('../services/session');

const router = express.Router();

// A4 G-03: HA settings mutations are admin-only (same pattern as the NCM
// approval routes). The peer endpoints (/api/ha/register, /api/ha/heartbeat)
// deliberately stay peer-secret authenticated — they carry no user session.
const ADMIN = [requireAuth, requireRole('admin')];

const HA_UNAVAILABLE =
  'HA service is not available in this build: server/services/ha.js has not landed yet.';

function loadHaService() {
  try {
    return require('../services/ha');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

function haOr501(req, res) {
  const ha = loadHaService();
  if (!ha) {
    res.status(501).json({ status: 'error', error: 'not_implemented', message: HA_UNAVAILABLE });
    return null;
  }
  return ha;
}

function auditLog(action, detail) {
  try {
    const store = require('../services/store');
    if (store && typeof store.log === 'function') store.log(null, action, detail);
  } catch { /* audit must never break the request */ }
}

// ------------------------------------------------------------- status ---
// GET /api/ha/status is exempt from the global session guard (see
// KEY_AUTH_API_ROUTES in server/index.js), so this handler enforces
// auth itself: a valid peer secret serves it (node-to-node /
// monitoring), otherwise a valid user session with no pending forced
// password change — the same two gates the global guard applies to
// every other console route. No secret and no session => 401, never
// an open read.

router.get('/api/ha/status', async (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  const serve = async () => {
    try {
      const status = await ha.getStatus();
      // evaluatedAt / self are route-surface additions (close-out
      // 2026-11-09, for scripts/verify-p3.sh check 5): evaluatedAt is the
      // ISO form of the service's checkedAt (epoch ms), and
      // self.uptimeSeconds is this process's real uptime. Both are
      // truthful, additive, and change no existing field.
      res.json({
        status: 'success',
        ha: {
          ...status,
          evaluatedAt: new Date(status.checkedAt || Date.now()).toISOString(),
          self: { uptimeSeconds: Math.floor(process.uptime()) },
        },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: `HA status could not be computed: ${err && err.message ? err.message : String(err)}`,
      });
    }
  };
  const presented = req.get('x-ha-peer-secret') || null;
  if (presented) {
    const auth = ha.authenticatePeer(presented);
    if (auth.ok) return serve();
  }
  let session = null;
  try {
    session = require('../services/session');
  } catch {
    session = null;
  }
  if (!session || typeof session.requireAuth !== 'function') {
    return res.status(401).json({
      status: 'error',
      error: 'unauthorized',
      message: 'Authentication service unavailable',
    });
  }
  return session.requireAuth(req, res, (err) => {
    if (err) return;
    if (typeof session.requirePasswordChanged === 'function') {
      return session.requirePasswordChanged(req, res, (err2) => {
        if (err2) return;
        return serve();
      });
    }
    return serve();
  });
});

// -------------------------------------------------------------- peers ---

router.get('/api/ha/peers', (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  try {
    const peers = ha.listPeers();
    res.json({ status: 'success', peers, count: peers.length });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `HA peers could not be listed: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

// ---------------------------------------------------------- decisions ---

router.get('/api/ha/decisions', (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  try {
    const limit = req.query && req.query.limit !== undefined ? Number(req.query.limit) : 50;
    const decisions = ha.listDecisions(limit);
    res.json({ status: 'success', decisions, count: decisions.length });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `HA decisions could not be listed: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

// ---------------------------------------------------------- heartbeat ---
// Peer-to-peer endpoint: authenticated by the shared peer secret only.
// The secret is accepted via the X-HA-Peer-Secret header or the
// `peerSecret` body field, compared in constant time against the runtime
// env value (OPM_HA_PEER_SECRET) by the HA service. It is never logged,
// never stored, and never echoed back. If the env var is unset the
// endpoint refuses with 503 (fail closed): a heartbeat that cannot be
// authenticated must never register a peer.

function peerAuth(req, res, ha) {
  const body = req.body || {};
  const presented = req.get('x-ha-peer-secret') || body.peerSecret || null;
  const auth = ha.authenticatePeer(presented);
  if (!auth.configured) {
    res.status(503).json({
      status: 'error',
      error: 'peer_auth_not_configured',
      message: 'HA peer authentication is not configured on this node (OPM_HA_PEER_SECRET is unset); peer requests are refused.',
    });
    return false;
  }
  if (!auth.ok) {
    res.status(401).json({
      status: 'error',
      error: 'unauthorized',
      message: 'Invalid or missing HA peer secret.',
    });
    return false;
  }
  return true;
}

router.post('/api/ha/heartbeat', (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  if (!peerAuth(req, res, ha)) return;
  const body = req.body || {};
  const peerId = String(body.peerId || body.nodeId || '').trim();
  if (!peerId) {
    return res.status(400).json({ status: 'error', message: 'peerId is required' });
  }
  if (peerId.length > 128) {
    return res.status(400).json({ status: 'error', message: 'peerId must be at most 128 characters' });
  }
  const role = body.role;
  if (role !== 'primary' && role !== 'standby') {
    return res.status(400).json({ status: 'error', message: "role must be 'primary' or 'standby'" });
  }
  const url = body.url != null ? String(body.url) : null;
  if (url !== null && url.length > 512) {
    return res.status(400).json({ status: 'error', message: 'url must be at most 512 characters' });
  }
  const sentAt = body.sentAt !== undefined ? body.sentAt : (body.at !== undefined ? body.at : body.timestamp);
  try {
    const record = ha.recordHeartbeat({ peerId, role, url, sentAt });
    const config = ha.getConfig();
    const now = Date.now();
    const ageMs = now - record.lastSeenAt;
    res.json({
      status: 'success',
      message: `Heartbeat accepted from peer '${peerId}'.`,
      ack: true,
      fenced: record.fenced === true,
      peer: {
        peerId: record.peerId,
        role: record.role,
        url: record.url,
        lastSeenAt: new Date(record.lastSeenAt).toISOString(),
        ageMs,
        heartbeatCount: record.heartbeatCount,
        alive: ageMs <= config.heartbeatSec * 1000 * ha.STALE_AFTER_BEATS,
        ack: true,
        fenced: record.fenced === true,
      },
      serverTime: new Date(now).toISOString(),
      serverRole: config.role,
    });
  } catch (err) {
    if (err && err.code === 'STALE_HEARTBEAT') {
      return res.status(400).json({
        status: 'error',
        error: 'stale_heartbeat',
        message: err.message,
      });
    }
    res.status(500).json({
      status: 'error',
      message: `Heartbeat could not be recorded: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

// ----------------------------------------------------------- register ---
// Explicit rejoin handshake (ha-proof). Peer-secret only, fail closed.
// A register from the ORIGINAL primary demotes a failover-promoted
// node (see server/services/ha.js handlePrimaryRegistration); any
// other register is recorded only and never changes this node's role.

router.post('/api/ha/register', (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  if (!peerAuth(req, res, ha)) return;
  const body = req.body || {};
  const peerId = String(body.peerId || body.nodeId || '').trim();
  if (!peerId) {
    return res.status(400).json({ status: 'error', message: 'peerId is required' });
  }
  if (peerId.length > 128) {
    return res.status(400).json({ status: 'error', message: 'peerId must be at most 128 characters' });
  }
  const role = body.role;
  if (role !== 'primary' && role !== 'standby') {
    return res.status(400).json({ status: 'error', message: "role must be 'primary' or 'standby'" });
  }
  const url = body.url != null ? String(body.url) : null;
  if (url !== null && url.length > 512) {
    return res.status(400).json({ status: 'error', message: 'url must be at most 512 characters' });
  }
  try {
    const out = ha.handlePrimaryRegistration({ peerId, role, url });
    const status = ha.computeStatus();
    res.json({
      status: 'success',
      reRegistered: out.reRegistered,
      wasPromoted: out.wasPromoted,
      demoted: out.demoted,
      ha: status,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `Registration could not be recorded: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

// ----------------------------------------------------- failover (test) ---
// Dry-run evaluation ONLY: the service reports whether failover WOULD
// trigger given current liveness. This handler never promotes, never
// changes settings.ha, and never calls any device or firewall.

router.post('/api/ha/failover/test', ADMIN, async (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  try {
    const evaluation = await ha.evaluateFailover();
    auditLog('ha.failover.test', {
      wouldTrigger: evaluation.wouldTrigger,
      role: evaluation.role,
      primaryUrl: evaluation.primaryUrl,
      user: req.user && req.user.username ? req.user.username : null,
    });
    res.json({ status: 'success', failover: evaluation });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `Failover evaluation failed: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

// --------------------------------------------------- settings (ha) ---
// Canonical settings.ha (SHARED.md). GET returns the merged config
// (stored over defaults, env overrides applied — see the service).
// POST merges the supplied fields: a null role/heartbeatSec/
// missThreshold/leaseTermMs leaves the value unchanged, a null URL
// clears it, an empty-string URL clears it. Saving (re)starts the
// heartbeat ticker; a primary also re-registers with its standby.
// POST /api/settings/ha/test probes the configured peer URL with a
// real TCP connect (same technique as the legacy failover test).

router.get('/api/settings/ha', (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  try {
    res.json({ status: 'success', ha: ha.getConfig() });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `HA settings could not be read: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

router.post('/api/settings/ha', ADMIN, (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  const body = req.body || {};
  const patch = {};
  if (body.role !== undefined && body.role !== null) patch.role = body.role;
  for (const key of ['standbyUrl', 'primaryUrl', 'nodeUrl']) {
    if (body[key] !== undefined) {
      patch[key] = typeof body[key] === 'string' && body[key].trim() === '' ? null : body[key];
    }
  }
  if (body.heartbeatSec !== undefined && body.heartbeatSec !== null) patch.heartbeatSec = body.heartbeatSec;
  if (body.missThreshold !== undefined && body.missThreshold !== null) patch.missThreshold = body.missThreshold;
  if (body.leaseTermMs !== undefined && body.leaseTermMs !== null) patch.leaseTermMs = body.leaseTermMs;
  let config;
  try {
    config = ha.setConfig(patch);
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid HA settings: ${err && err.message ? err.message : String(err)}`,
    });
  }
  auditLog('ha.settings.save', {
    role: config.role,
    standbyUrl: config.standbyUrl,
    primaryUrl: config.primaryUrl,
    heartbeatSec: config.heartbeatSec,
    user: req.user && req.user.username ? req.user.username : null,
  });
  // (Re)start the heartbeat ticker now that a peer may be configured;
  // start() is idempotent when already running. A primary also
  // re-registers with its standby (fire-and-forget; the ticker keeps
  // retrying until the handshake lands).
  let ticker = { started: false, reason: 'not-started' };
  try {
    ticker = ha.start();
  } catch (err) {
    ticker = { started: false, reason: String((err && err.message) || err) };
  }
  if (config.role === 'primary') {
    try {
      const r = ha.registerWithPeer();
      if (r && typeof r.catch === 'function') r.catch(() => { /* ticker retries */ });
    } catch { /* ticker retries */ }
  }
  res.json({ status: 'success', message: 'HA settings saved.', ha: config, ticker });
});

router.post('/api/settings/ha/test', ADMIN, async (req, res) => {
  const ha = haOr501(req, res);
  if (!ha) return;
  try {
    const config = ha.getConfig();
    const url = config.role === 'primary' ? config.standbyUrl : config.primaryUrl;
    const peerUrl = url || config.standbyUrl || config.primaryUrl || null;
    if (!peerUrl) {
      return res.json({
        status: 'error',
        error: 'not_configured',
        message: 'HA is not configured: no peer URL is set, so there is nothing to probe.',
        reachable: false,
      });
    }
    const probe = await ha.probePeer(peerUrl, config.requestTimeoutMs);
    res.json({
      status: probe.reachable ? 'success' : 'error',
      message: probe.reachable
        ? `Peer ${peerUrl} answered the TCP probe.`
        : `Peer ${peerUrl} did not answer the TCP probe: ${probe.error || 'unreachable'}.`,
      url: peerUrl,
      reachable: probe.reachable,
      latencyMs: probe.latencyMs != null ? probe.latencyMs : null,
      error: probe.error || null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `HA peer probe failed: ${err && err.message ? err.message : String(err)}`,
    });
  }
});

module.exports = router;
