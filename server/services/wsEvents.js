'use strict';
/**
 * Phase-3 WebSocket event hub (track: ws-events).
 *
 * A tiny in-process pub/sub for real phase-3 operations. It follows the
 * same listener pattern as the poller (server/services/poller.js
 * onUpdate/broadcast): producers call an emit helper, listeners registered
 * via onEvent(fn) receive the event object. server/index.js registers the
 * single broadcast listener that forwards every event to all connected
 * WebSocket clients (/ws and /PNSHandler).
 *
 * Rules:
 *  - NO timers, NO synthetic events. An event is emitted ONLY from a real
 *    operation site, after that operation has actually happened (template
 *    assignment persisted, approval row written, heartbeat TCP connect
 *    resolved, trap row stored). A failed operation emits nothing.
 *  - When no listener is registered, events are dropped silently.
 *  - A throwing listener never breaks the operation: it is caught and
 *    logged, and the other listeners still run.
 *  - Every event is `{ type, timestamp, ...payload }`. `timestamp` is
 *    Date.now() at emit time. Payloads carry the real values from the
 *    operation (ids, statuses, thresholds) — never placeholders.
 *
 * Event types and their producers:
 *  - TEMPLATE_APPLIED   — POST /api/settings/templates/apply (settings.js)
 *  - NCM_STAGED / NCM_APPROVED / NCM_REJECTED / NCM_DRY_RUN / NCM_EXECUTED
 *                         — server/routes/ncm.js (stage/approve/reject/
 *                           dry-run). NCM_EXECUTED has no producer in this
 *                           build: no device config transport exists yet
 *                           (POST /api/ccm/push is an honest 501), so no
 *                           execute endpoint fakes one. The ncm-push track
 *                           calls emitNcmExecuted() when it lands a real
 *                           push; the helper already exists here.
 *  - HA_STATUS          — POST /api/settings/failover (config save that
 *                         changes role/peer) and POST /api/settings/failover/test
 *                         (real TCP heartbeat result). The ha-service track
 *                         should call emitHaStatus() from its own
 *                         role/peer-liveness transitions when they land.
 *  - TRAP_RECEIVED / SYSLOG_RECEIVED
 *                         — server/services/trapReceiver.js, via
 *                           onStoredTrap(), the moment a datagram is stored.
 */

const listeners = new Set();

/**
 * Register a listener. Returns an unsubscribe function.
 * @param {function} fn — called with each event object.
 */
function onEvent(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Number of registered listeners (diagnostics only). */
function listenerCount() {
  return listeners.size;
}

/**
 * Emit a raw event. Prefer the named helpers below so the type and the
 * payload shape stay consistent across producers.
 * @returns the event object, or null when type is not a non-empty string.
 */
function emit(type, data) {
  if (!type || typeof type !== 'string') return null;
  const event = {
    type,
    timestamp: Date.now(),
    ...(data && typeof data === 'object' ? data : {}),
  };
  for (const fn of [...listeners]) {
    try {
      fn(event);
    } catch (err) {
      console.error(`[wsEvents] listener failed for ${type}: ${err && err.message ? err.message : err}`);
    }
  }
  return event;
}

/**
 * Template applied to a device.
 * @param {object} p
 * @param {object} p.device — { id, ip, hostname } from the store.
 * @param {string} p.templateName — template name as applied.
 * @param {boolean} p.custom — true when an operator-created template.
 * @param {string} p.appliedAt — ISO timestamp of the persisted assignment.
 * @param {object} p.thresholds — effective thresholds at apply time,
 *   canonical names { cpuWarn, cpuCrit, memWarn, memCrit }; memWarn is
 *   null: no mem-warn threshold exists in this build (see settings.js).
 * @param {boolean} p.customized — true when per-device overrides exist.
 * @param {number|null} p.pollIntervalSec — null: no per-template poll
 *   interval exists in this build.
 */
function emitTemplateApplied(p) {
  const d = p || {};
  return emit('TEMPLATE_APPLIED', {
    device: d.device || null,
    template: { name: d.templateName || null, custom: Boolean(d.custom) },
    appliedAt: d.appliedAt || null,
    thresholds: d.thresholds || null,
    customized: Boolean(d.customized),
    pollIntervalSec: d.pollIntervalSec == null ? null : d.pollIntervalSec,
  });
}

/**
 * NCM approval lifecycle event.
 * @param {object} approval — the persisted approval row (canonical
 *   settings.ncm.approvals shape: id, deviceId, action, diff, commands,
 *   status, createdBy, decidedBy, decidedAt).
 * @param {string} action — 'staged' | 'approved' | 'rejected' |
 *   'dry-run' | 'executed'. The event type is NCM_<ACTION> with '-' mapped
 *   to '_' (NCM_DRY_RUN).
 * @param {object} [extra] — action-specific real data, e.g. the dry-run
 *   result { ranAt, ok, checks }.
 */
function emitNcm(approval, action, extra) {
  const a = approval || {};
  const act = String(action || '');
  const type = `NCM_${act.toUpperCase().replace(/-/g, '_')}`;
  return emit(type, {
    approvalId: a.id || null,
    status: a.status || null,
    deviceId: a.deviceId == null ? null : a.deviceId,
    action: a.action || null,
    createdBy: a.createdBy || null,
    decidedBy: a.decidedBy || null,
    decidedAt: a.decidedAt || null,
    ...(extra && typeof extra === 'object' ? extra : {}),
  });
}

function emitNcmStaged(approval) { return emitNcm(approval, 'staged'); }
function emitNcmApproved(approval) { return emitNcm(approval, 'approved'); }
function emitNcmRejected(approval) { return emitNcm(approval, 'rejected'); }
function emitNcmDryRun(approval, dryRun) { return emitNcm(approval, 'dry-run', { dryRun: dryRun || null }); }
function emitNcmExecuted(approval, result) { return emitNcm(approval, 'executed', { result: result || null }); }

/**
 * HA / failover status change.
 * @param {object} p
 * @param {string|null} p.role — 'primary' | 'standby' when known, else
 *   null (the base failover config carries a free-form mode, not a role).
 * @param {string|null} p.previousRole — role before this change, or null.
 * @param {string|null} p.mode — stored failover mode, if any.
 * @param {object|null} p.peer — { ip, port } of the standby peer, or null.
 * @param {boolean|null} p.reachable — heartbeat TCP result, or null when
 *   this event is not a heartbeat outcome.
 * @param {number|null} p.latencyMs — heartbeat round-trip, or null.
 * @param {boolean} p.configured — true when a standby peer is configured.
 * @param {string} p.reason — 'config-saved' | 'heartbeat-test' |
 *   'role-change' | 'peer-liveness' (producer-supplied).
 */
function emitHaStatus(p) {
  const d = p || {};
  return emit('HA_STATUS', {
    role: d.role == null ? null : d.role,
    previousRole: d.previousRole == null ? null : d.previousRole,
    mode: d.mode == null ? null : d.mode,
    peer: d.peer || null,
    reachable: d.reachable == null ? null : Boolean(d.reachable),
    latencyMs: d.latencyMs == null ? null : d.latencyMs,
    configured: Boolean(d.configured),
    reason: d.reason || null,
  });
}

/**
 * Trap / syslog datagram received and stored.
 * @param {object} row — the stored traps-table row from store.saveTrap:
 *   { id, source_ip, oid, value, received_at }.
 * @param {string} kind — 'trap' (SNMP, oid set) or 'syslog' (oid null).
 */
function emitTrapReceived(row, kind) {
  const r = row || {};
  const type = kind === 'syslog' ? 'SYSLOG_RECEIVED' : 'TRAP_RECEIVED';
  return emit(type, {
    trap: {
      id: r.id == null ? null : r.id,
      sourceIp: r.source_ip || null,
      oid: r.oid == null ? null : r.oid,
      value: r.value == null ? null : r.value,
      receivedAt: r.received_at == null ? null : r.received_at,
    },
  });
}

module.exports = {
  onEvent,
  listenerCount,
  emit,
  emitTemplateApplied,
  emitNcm,
  emitNcmStaged,
  emitNcmApproved,
  emitNcmRejected,
  emitNcmDryRun,
  emitNcmExecuted,
  emitHaStatus,
  emitTrapReceived,
};
