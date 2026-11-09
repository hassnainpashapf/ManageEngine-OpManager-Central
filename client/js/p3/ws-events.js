'use strict';
/**
 * Phase-3 ws-events — client partial (track: ws-events).
 *
 * WIRING (close-out agent): do NOT edit client/js/app.js directly. In
 * app.js, in the /ws NOC-stream WebSocket message handler — the onmessage
 * that already dispatches INITIAL_STATE and METRIC_TICK — add, after the
 * existing type dispatch:
 *
 *   if (window.OpmWsEvents) window.OpmWsEvents.handle(data);
 *
 * `data` is the already-parsed JSON frame. This partial keeps a capped
 * in-memory log of the phase-3 events (newest last, max 200) and re-fires
 * each one as a window CustomEvent ('opm-ws-event', detail = the event
 * object) so the NOC view / toast code can render it; it writes no DOM
 * itself and invents no data. Unknown types are ignored.
 *
 * Event types handled: TEMPLATE_APPLIED, NCM_STAGED, NCM_APPROVED,
 * NCM_REJECTED, NCM_DRY_RUN, NCM_EXECUTED, HA_STATUS, TRAP_RECEIVED,
 * SYSLOG_RECEIVED. (METRIC_TICK / INITIAL_STATE / '-' heartbeats are NOT
 * phase-3 events and are left to the existing handlers.)
 */
(function () {
  var PHASE3_TYPES = {
    TEMPLATE_APPLIED: true,
    NCM_STAGED: true,
    NCM_APPROVED: true,
    NCM_REJECTED: true,
    NCM_DRY_RUN: true,
    NCM_EXECUTED: true,
    HA_STATUS: true,
    TRAP_RECEIVED: true,
    SYSLOG_RECEIVED: true,
  };

  var MAX_LOG = 200;

  function isPhase3Event(data) {
    return Boolean(
      data && typeof data === 'object' && typeof data.type === 'string' && PHASE3_TYPES[data.type]
    );
  }

  function handle(data) {
    if (!isPhase3Event(data)) return false;
    try {
      window.OpmWsEvents.log.push(data);
      if (window.OpmWsEvents.log.length > MAX_LOG) {
        window.OpmWsEvents.log.splice(0, window.OpmWsEvents.log.length - MAX_LOG);
      }
    } catch (e) { /* log is best-effort; the event dispatch below still runs */ }
    try {
      window.dispatchEvent(new CustomEvent('opm-ws-event', { detail: data }));
    } catch (e) { /* older clients without CustomEvent still keep the log */ }
    return true;
  }

  window.OpmWsEvents = {
    handle: handle,
    isPhase3Event: isPhase3Event,
    log: [],
  };
})();
