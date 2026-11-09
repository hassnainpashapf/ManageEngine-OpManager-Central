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
 */

const express = require('express');

const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../services/session');
const sshclient = require('../services/sshclient');
const dns = require('node:dns/promises');

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

// A step executes for real only when it declares type 'ssh' (or 'cli') with
// a host and command. Any other/missing type stays honestly unsupported -
// nothing is fabricated for it.
const SSH_STEP_TYPES = new Set(['ssh', 'cli']);

async function resolveHost(target) {
  if (!target || typeof target !== 'string') return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) return target;
  try {
    const { address } = await dns.lookup(target, { family: 4 });
    return address;
  } catch {
    return null;
  }
}

// POST /api/workflows/execute — runs real SSH steps (type 'ssh'/'cli') via
// services/sshclient.js. A workflow containing any step of an unsupported
// type (WMI, notification, service-restart, ...) is refused entirely with
// an honest 501 naming the unsupported types, rather than silently running
// only part of it. Unknown workflowId -> 404; missing workflowId -> 400.
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

    const steps = parseSteps(wf.steps_json);
    const startedAt = Date.now();

    const unsupported = [...new Set(
      steps
        .filter((s) => !s || !SSH_STEP_TYPES.has(String(s.type || '').toLowerCase()))
        .map((s) => (s && s.type) || '(missing type)')
    )];

    if (steps.length === 0 || unsupported.length > 0) {
      const message = steps.length === 0
        ? `Workflow "${wf.name}" (id ${wf.id}) has no steps to run.`
        : `Workflow "${wf.name}" (id ${wf.id}) was not run: step type(s) ${unsupported.join(', ')} have no real executor. Only 'ssh'/'cli' steps (host + command, using a Credential Library SSH credential) can run for real.`;
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
        unsupportedStepTypes: unsupported,
        logs: [message],
      });
    }

    const cred = sshclient.findSshCredential(store);
    if (!cred || !cred.username || !cred.password) {
      // Not an execution attempt - nothing ever reached a device - so this
      // stays out of EXECUTED_STATUSES the same way the unsupported-step-type
      // refusal above does.
      const message = 'No SSH/CLI credential with a username and password is configured in the Credential Library.';
      await workflows.saveWorkflowRun({
        workflow_id: wf.id, status: 'not_implemented', log: message, started_at: startedAt, finished_at: Date.now()
      });
      return res.status(400).json({ status: 'error', message, workflowId: wf.id });
    }

    const logs = [];
    let allOk = true;
    for (const step of steps) {
      const address = await resolveHost(step.host);
      if (!address) {
        allOk = false;
        logs.push(`Step on '${step.host}': could not resolve to an IPv4 address.`);
        continue;
      }
      try {
        const result = await sshclient.execCommand(address, cred, step.command);
        allOk = allOk && (result.exitCode === 0 || result.exitCode === null);
        logs.push(`Step on ${step.host} (${address}): exit ${result.exitCode}\n${result.stdout}${result.stderr ? '\nstderr: ' + result.stderr : ''}`);
      } catch (err) {
        allOk = false;
        logs.push(`Step on ${step.host} (${address}): SSH failed - ${err.message}`);
      }
    }

    const finishedAt = Date.now();
    const status = allOk ? 'success' : 'failed';
    await workflows.saveWorkflowRun({
      workflow_id: wf.id, status, log: logs.join('\n---\n'), started_at: startedAt, finished_at: finishedAt
    });

    res.json({
      status: allOk ? 'success' : 'error',
      message: `Workflow "${wf.name}" (id ${wf.id}) ${allOk ? 'completed' : 'completed with failures'}.`,
      workflowId: wf.id,
      logs,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
