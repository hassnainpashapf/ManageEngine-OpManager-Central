'use strict';
/**
 * Workflows — real-data rebuild.
 *
 * Audit items fixed (audit/ncm-traps-zia.md, workflows section):
 *  - W1: the three hardcoded workflows with invented run history (relative
 *    "ago" timestamps and fixed execution counts) are deleted. Workflows
 *    come ONLY from the store: the list is empty until an admin creates
 *    one via POST /api/workflows/create. No workflow is seeded.
 *  - W2: POST /api/workflows/execute no longer claims success with
 *    fabricated step logs while executing nothing. This server has no
 *    workflow step executor (no SSH/WMI/CLI runner, no service-restart
 *    or notification sender), so execution returns an honest 501
 *    { error: 'not_implemented' } and runs nothing. An unknown
 *    workflowId returns 404 instead of silently running the first
 *    workflow in the list.
 *
 * Execution attempts are recorded honestly: a refused (501) attempt is
 * persisted via saveWorkflowRun with status 'not_implemented' and real
 * timestamps, so there is an audit trail of attempts. It is NOT counted
 * as an execution — executionCount / lastExecuted in the list response
 * are derived only from runs with a real execution status ('success',
 * 'completed', 'failed'), so they stay 0 / null until a real step
 * executor exists and actually runs a workflow.
 *
 * Field mapping: the store's workflows table has only id, name,
 * steps_json and created_at. Fields with no backing column (status,
 * trigger, scope) are returned as null, never invented; steps is []
 * when a workflow has none. lastExecuted is an epoch-ms timestamp (or
 * null), not a relative string. Response-shape changes vs the old
 * hardcoded route: id is now the integer store id (was a 'WF-00n'
 * string), lastExecuted is epoch ms or null (was a relative string),
 * status/trigger/scope are null, and created_at is included.
 *
 * Phase-2 501 triage (2026-11-09): the file's only 501 was
 * POST /api/workflows/execute (OPEN O-12). It stays 501 — see the
 * route comment; there is still no step executor. Three REAL routes
 * were added from stored data only, no execution is claimed:
 *  - GET /api/workflows/:id — one stored workflow + its stored runs.
 *  - GET /api/workflows/:id/runs — the stored run history for a
 *    workflow (including refused 'not_implemented' attempts).
 *  - POST /api/workflows/validate — checks a workflow definition
 *    against exactly the rules POST /api/workflows/create enforces,
 *    without persisting or executing anything.
 * A dry-run endpoint was NOT added: with no step schema and no
 * executor, a dry-run could only repeat create-time validation and
 * could not say whether any step would succeed — reporting that as
 * a dry-run result would be misleading.
 */

const express = require('express');

const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../services/session');

// Store contract: store.workflows.createWorkflow, listWorkflows,
// saveWorkflowRun, listWorkflowRuns. (The store also exposes flat
// aliases of the same functions; the namespaced form is used here,
// with the flat store as a fallback so the route keeps working if
// the store is ever loaded without its namespaces.)
const workflows = store.workflows || store;

// Run statuses that represent a workflow that actually executed.
// 'not_implemented' is a refused attempt, not an execution.
const EXECUTED_STATUSES = new Set(['success', 'completed', 'failed']);

function parseSteps(stepsJson) {
  if (Array.isArray(stepsJson)) return stepsJson;
  if (typeof stepsJson !== 'string' || stepsJson.length === 0) return [];
  try {
    const parsed = JSON.parse(stepsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toWorkflow(row, runs) {
  const executed = (runs || []).filter((r) => EXECUTED_STATUSES.has(r.status));
  const startedAts = executed
    .map((r) => r.started_at)
    .filter((t) => Number.isFinite(t));
  return {
    id: row.id,
    name: row.name ?? null,
    status: null,
    trigger: null,
    scope: null,
    lastExecuted: startedAts.length ? Math.max(...startedAts) : null,
    executionCount: executed.length,
    steps: parseSteps(row.steps_json),
    created_at: row.created_at ?? null,
  };
}

// A stored workflow_run row, exactly as stored — no invented fields.
// 'not_implemented' rows are refused execute attempts, shown with their
// real status so the audit trail is visible instead of hidden.
function toRun(row) {
  return {
    id: row.id,
    workflow_id: row.workflow_id,
    status: row.status ?? null,
    log: row.log ?? null,
    started_at: row.started_at ?? null,
    finished_at: row.finished_at ?? null,
  };
}

// The store exposes no namespaced getWorkflow (store.workflows has only
// createWorkflow, listWorkflows, saveWorkflowRun, listWorkflowRuns), so
// a single workflow is found by scanning the list. Unknown or
// non-numeric ids resolve to null and the caller returns 404, the same
// convention POST /api/workflows/execute uses for an unknown workflowId.
async function findWorkflow(id) {
  const rows = await workflows.listWorkflows();
  return (rows || []).find((w) => String(w.id) === String(id)) || null;
}

// Validate a workflow definition against exactly the rules
// POST /api/workflows/create enforces. Returns { errors, name, steps }.
// This is a pure check: it never persists, executes, or invents a
// step schema — steps have no defined action/type contract on this
// server, so beyond "array of objects" nothing more can honestly be
// asserted about them.
function validateDefinition(body) {
  const errors = [];
  let name = null;
  let steps = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['request body must be a JSON object'], name, steps };
  }
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  } else {
    name = body.name.trim();
  }
  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps)) {
      errors.push('steps must be an array');
    } else {
      for (const step of body.steps) {
        if (!step || typeof step !== 'object' || Array.isArray(step)) {
          errors.push('each step must be an object');
          break;
        }
      }
      if (errors.length === 0) steps = body.steps;
    }
  }
  return { errors, name, steps };
}

// GET /api/workflows/list — workflows from the store only; [] when none exist.
router.get('/api/workflows/list', async (req, res, next) => {
  try {
    const rows = await workflows.listWorkflows();
    const out = [];
    for (const row of rows || []) {
      const runs = await workflows.listWorkflowRuns(row.id);
      out.push(toWorkflow(row, runs));
    }
    res.json({ status: 'success', workflows: out });
  } catch (err) {
    next(err);
  }
});

// GET /api/workflows/:id — one stored workflow plus its stored runs.
// Unknown id -> 404 (same convention as POST /api/workflows/execute).
router.get('/api/workflows/:id', async (req, res, next) => {
  try {
    const wf = await findWorkflow(req.params.id);
    if (!wf) {
      return res.status(404).json({
        status: 'error',
        error: 'not_found',
        message: `Workflow ${req.params.id} not found`,
      });
    }
    const runs = await workflows.listWorkflowRuns(wf.id);
    return res.json({
      status: 'success',
      workflow: toWorkflow(wf, runs),
      runs: (runs || []).map(toRun),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/workflows/:id/runs — stored run history for a workflow, most
// recent first (store order). Includes refused 'not_implemented'
// attempts with their real status; they are not executions.
// Unknown id -> 404.
router.get('/api/workflows/:id/runs', async (req, res, next) => {
  try {
    const wf = await findWorkflow(req.params.id);
    if (!wf) {
      return res.status(404).json({
        status: 'error',
        error: 'not_found',
        message: `Workflow ${req.params.id} not found`,
      });
    }
    const runs = await workflows.listWorkflowRuns(wf.id);
    return res.json({
      status: 'success',
      workflowId: wf.id,
      runs: (runs || []).map(toRun),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/validate — admin only (same as create: this is
// the pre-create check). Validates a workflow definition against
// exactly the rules POST /api/workflows/create enforces, without
// persisting or executing anything. Always 200 when authenticated:
// { valid, errors, workflow } — valid:false carries the same messages
// create would return as 400, so the caller can show them without
// treating validation as a transport error.
router.post(
  '/api/workflows/validate',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { errors, name, steps } = validateDefinition(req.body);
      if (errors.length > 0) {
        return res.json({ status: 'success', valid: false, errors, workflow: null });
      }
      return res.json({
        status: 'success',
        valid: true,
        errors: [],
        workflow: { name, steps },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/workflows/create — admin only. The only way a workflow comes
// into existence; the store starts empty.
router.post(
  '/api/workflows/create',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const body = req.body || {};
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'invalid_request',
          message: 'name is required and must be a non-empty string',
        });
      }
      let steps = [];
      if (body.steps !== undefined) {
        if (!Array.isArray(body.steps)) {
          return res.status(400).json({
            status: 'error',
            error: 'invalid_request',
            message: 'steps must be an array',
          });
        }
        for (const step of body.steps) {
          if (!step || typeof step !== 'object' || Array.isArray(step)) {
            return res.status(400).json({
              status: 'error',
              error: 'invalid_request',
              message: 'each step must be an object',
            });
          }
        }
        steps = body.steps;
      }
      const created = await workflows.createWorkflow({
        name: body.name.trim(),
        steps,
      });
      return res.status(201).json({
        status: 'success',
        workflow: toWorkflow(created, []),
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/workflows/execute — honest 501: no step executor exists on
// this server, so nothing is run and no step output is fabricated.
// Unknown workflowId -> 404; missing workflowId -> 400.
// Phase-2 triage (2026-11-09): stays 501. Blocker — there is no step
// executor (no SSH/WMI/CLI runner, no notification sender) and
// workflow steps have no defined action/type schema, so no step can
// be carried out for real; building a runner that acts on live
// devices is a design decision (API.md OPEN O-12), not a triage fix.
// A dry-run was also not added: without a step schema or an executor
// it could not say whether any step would succeed. Even a workflow
// with zero steps is refused rather than reported "successful", so
// no execution is ever claimed where none happened.
router.post('/api/workflows/execute', async (req, res, next) => {
  try {
    const { workflowId } = req.body || {};
    if (workflowId === undefined || workflowId === null || workflowId === '') {
      return res.status(400).json({
        status: 'error',
        error: 'invalid_request',
        message: 'workflowId is required',
      });
    }
    const rows = await workflows.listWorkflows();
    const wf = (rows || []).find((w) => String(w.id) === String(workflowId));
    if (!wf) {
      return res.status(404).json({
        status: 'error',
        error: 'not_found',
        message: `Workflow ${workflowId} not found`,
      });
    }
    const startedAt = Date.now();
    const message =
      `Workflow execution is not implemented: this server has no step ` +
      `executor (no SSH/WMI/CLI runner), so workflow "${wf.name}" ` +
      `(id ${wf.id}) was not run and no step was executed.`;
    // Record the refused attempt with real timestamps; status
    // 'not_implemented' is excluded from executionCount / lastExecuted.
    await workflows.saveWorkflowRun({
      workflow_id: wf.id,
      status: 'not_implemented',
      log: message,
      started_at: startedAt,
      finished_at: Date.now(),
    });
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message,
      workflowId: wf.id,
      logs: [message],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
