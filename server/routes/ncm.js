'use strict';
/**
 * NCM change-approval API — canonical route (Phase 4 merge, branch p4m-ncm).
 *
 * The ONE /api/ncm/* route, built on the canonical service
 * (server/services/ncm.js — strict state machine, re-runnable dry-run,
 * store key 'settings.ncm', audit actions ncm.stage / ncm.approve /
 * ncm.reject / ncm.execute.dry-run, ISO timestamps). It replaces BOTH
 * predecessors, which are superseded and must not be re-added:
 *   - ncm-ui's routes/ncm.js (dry-run preview on pending, status never
 *     changes, non-dry-run execute answered 501, audit ncm.approval.*);
 *   - ws-events' routes/ncm.js (its own inline store access under key
 *     'ncm', a separate /dry-run endpoint, approve/reject allowed from
 *     'approved'/'dry-run').
 * What survives from each:
 *   - from ncm-ui: the route paths, the admin-only mutations, the
 *     reject-reason field (now stored as decidedReason by the service),
 *     and the UI contract in client/js/p3/ncm-ui.js;
 *   - from ws-events: the WebSocket event emissions (NCM_STAGED /
 *     NCM_APPROVED / NCM_REJECTED / NCM_DRY_RUN) — emitted here after
 *     each successful transition. The events service itself
 *     (server/services/wsEvents.js) is owned by the ws-events merge
 *     agent and is NOT in this clone yet, so the require below is
 *     guarded: when the service is absent the emits are silent no-ops
 *     and the route still works. NCM_EXECUTED has no producer here:
 *     there is no live push in this phase, so nothing ever reaches
 *     status 'executed'.
 *
 *   GET    /api/ncm/approvals?status=pending|approved|rejected|executed|dry-run|all&deviceId=
 *   GET    /api/ncm/approvals/:id
 *   POST   /api/ncm/approvals                     stage a change (admin)
 *   POST   /api/ncm/approvals/:id/approve        (admin, pending only)
 *   POST   /api/ncm/approvals/:id/reject         (admin, pending only; { reason })
 *   POST   /api/ncm/approvals/:id/execute        (admin) dry-run execute
 *   POST   /api/ncm/approvals/:id/dry-run        alias of /execute (ws-events compat)
 *
 * Execute semantics (canonical, dry-run only — the human-review gate):
 *   - execute() runs ONLY from 'approved' or 'dry-run' (re-runnable:
 *     a second dry-run of the same approval succeeds and still sends
 *     nothing). It returns the exact staged commands with
 *     dryRun:true and sentToDevice:false, and moves the approval to
 *     status 'dry-run'. NOTHING is sent to any device and no
 *     connection is opened — there is no live config transport in
 *     this phase.
 *   - execute on a pending/rejected approval is refused 409
 *     (error 'approval_required'); unknown id 404.
 *   - an EXPLICIT {"dryRun": false} is refused 422 (error
 *     'dry_run_only') — the canonical refusal shape for a non-dry-run
 *     request, replacing ncm-ui's 501. Omitting dryRun (or passing
 *     true) performs the dry-run execute.
 *
 * Auth: GETs need a valid session (requireAuth); mutations additionally
 * require the admin role. The global apiAuthGuard in server/index.js
 * already requires a valid session on every /api route.
 */
const express = require('express');
const store = require('../services/store');
const { requireAuth, requireRole } = require('../services/session');
const ncm = require('../services/ncm');

const router = express.Router();

// Bound canonical service (injectable store; here the real store).
const ncmService = ncm.createService(store);

// WebSocket event hub — owned by the ws-events merge; absent in this
// clone until the close-out combines the areas. Guarded require + guarded
// emits: a missing/broken hub must never break the approval gate.
let wsEvents = null;
try {
  wsEvents = require('../services/wsEvents');
} catch {
  wsEvents = null;
}
function emit(fnName, ...args) {
  try {
    if (wsEvents && typeof wsEvents[fnName] === 'function') wsEvents[fnName](...args);
  } catch {
    /* event broadcast must never break the request */
  }
}

const ADMIN = [requireAuth, requireRole('admin')];

function actor(req) {
  return (req.user && (req.user.username || req.user.name)) || 'system';
}

// Map a canonical service error (err.code) to an honest HTTP status.
function ncmErrorStatus(err) {
  if (!err || !err.code) return 500;
  if (err.code === 'validation') return 400;
  if (err.code === 'not_found') return 404;
  if (err.code === 'invalid_state') return 409;
  return 502; // store_error / store_unavailable
}

function errorBody(err) {
  return {
    status: 'error',
    error: err && err.code ? err.code : 'ncm_failed',
    message: (err && err.message) || 'NCM operation failed',
  };
}

// GET /api/ncm/approvals — list, newest first. ?status= defaults to all;
// ?deviceId= filters to one device. Unknown status filter -> 400.
router.get('/api/ncm/approvals', requireAuth, (req, res) => {
  const status = String(req.query.status || 'all');
  if (status !== 'all' && !ncm.STATUSES.includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: `Unknown status filter: ${status}. Use one of: ${ncm.STATUSES.join(', ')}, all.`,
    });
  }
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (req.query.deviceId !== undefined) filter.deviceId = req.query.deviceId;
  let approvals;
  try {
    approvals = ncmService.listApprovals(filter);
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  return res.json({ status: 'success', approvals, count: approvals.length });
});

// GET /api/ncm/approvals/:id — one approval, verbatim diff + commands.
router.get('/api/ncm/approvals/:id', requireAuth, (req, res) => {
  let approval;
  try {
    approval = ncmService.getApproval(req.params.id);
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  if (!approval) {
    return res.status(404).json({ status: 'error', message: `Approval ${req.params.id} not found` });
  }
  return res.json({ status: 'success', approval });
});

// POST /api/ncm/approvals — stage a change for review (admin only).
// The service validates: device must exist (404), action + non-empty
// commands required (400), createdBy recorded. A probe-target push
// (deviceId null + configurationType) is also accepted by the service.
router.post('/api/ncm/approvals', ADMIN, (req, res) => {
  const body = req.body || {};
  if (body.diff !== undefined && body.diff !== null && typeof body.diff !== 'string') {
    return res.status(400).json({ status: 'error', message: 'diff must be a string' });
  }
  let approval;
  try {
    approval = ncmService.stage({
      deviceId: body.deviceId,
      action: body.action,
      commands: body.commands,
      diff: body.diff,
      createdBy: actor(req),
      ...(body.configurationType !== undefined ? { configurationType: body.configurationType } : {}),
      ...(body.targetProbeId !== undefined ? { targetProbeId: body.targetProbeId } : {}),
    });
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  emit('emitNcmStaged', approval);
  return res.status(201).json({ status: 'success', approval });
});

// POST /api/ncm/approvals/:id/approve — pending -> approved (admin only).
// Approving executes NOTHING.
router.post('/api/ncm/approvals/:id/approve', ADMIN, (req, res) => {
  let approval;
  try {
    approval = ncmService.approve(req.params.id, actor(req));
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  emit('emitNcmApproved', approval);
  return res.json({
    status: 'success',
    message: `Approval ${approval.id} approved. Nothing has been sent yet — run execute for a dry run.`,
    approval,
  });
});

// POST /api/ncm/approvals/:id/reject — pending -> rejected (admin only).
// Optional { reason } is stored as decidedReason by the service.
router.post('/api/ncm/approvals/:id/reject', ADMIN, (req, res) => {
  const reason = req.body && typeof req.body.reason === 'string' ? req.body.reason : null;
  let approval;
  try {
    approval = ncmService.reject(req.params.id, actor(req), reason);
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  emit('emitNcmRejected', approval);
  return res.json({
    status: 'success',
    message: `Approval ${approval.id} rejected. Nothing will be sent.`,
    approval,
  });
});

// POST /api/ncm/approvals/:id/execute — DRY-RUN ONLY (admin).
// Canonical refusal shape for an explicit non-dry-run request:
// 422 dry_run_only (NOT 501 — the ncm-ui 501 is superseded). An
// unapproved execute is refused 409 (approval_required) by the service;
// a re-run after a first dry-run succeeds (re-runnable dry-run).
function dryRunExecute(req, res) {
  let approval;
  try {
    approval = ncmService.getApproval(req.params.id);
  } catch (err) {
    return res.status(ncmErrorStatus(err)).json(errorBody(err));
  }
  if (!approval) {
    return res.status(404).json({ status: 'error', message: `Approval ${req.params.id} not found` });
  }
  if (req.body && req.body.dryRun === false) {
    return res.status(422).json({
      status: 'error',
      error: 'dry_run_only',
      message: 'This phase executes dry-run only: pass {"dryRun": true} or omit dryRun. A live push to the device is not implemented, so no configuration was written.',
      approvalId: approval.id,
      approvalStatus: approval.status,
      executed: false,
      sentToDevice: false,
    });
  }
  let result;
  try {
    result = ncmService.execute(req.params.id, { executedBy: actor(req) });
  } catch (err) {
    const status = ncmErrorStatus(err);
    return res.status(status).json({
      status: 'error',
      error: err.code === 'invalid_state' ? 'approval_required' : (err.code || 'execute_failed'),
      message: err.message,
      approvalId: approval.id,
      approvalStatus: approval.status,
      executed: false,
      sentToDevice: false,
    });
  }
  emit('emitNcmDryRun', result.status === 'dry-run' ? { ...approval, status: 'dry-run' } : approval, result);
  return res.json({
    status: 'success',
    ...result,
    executed: false,
    message: 'Dry-run only: the staged commands were NOT sent to the device. No live push exists in this phase.',
  });
}

router.post('/api/ncm/approvals/:id/execute', ADMIN, dryRunExecute);
// Alias kept from the ws-events route surface; same handler, same gate.
router.post('/api/ncm/approvals/:id/dry-run', ADMIN, dryRunExecute);

module.exports = router;
