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
 *    fabricated step logs while executing nothing. (Phase 3: the 501
 *    below is gone — see "Step executor", the execute route now really
 *    runs the workflow's steps. An unknown workflowId still returns 404
 *    instead of silently running the first workflow in the list.)
 *
 * Step executor (Phase 3, workflow-exec track)
 * --------------------------------------------
 * POST /api/workflows/execute runs the workflow's stored steps IN ORDER
 * through the real safe services, and stops at the first failed step:
 *   - { type: 'cli', command, args?, timeoutMs? }
 *       Local diagnostic on THIS server via server/services/runner.js
 *       (runLocal: execFile, no shell, explicit allow-list only —
 *       ping, traceroute, nslookup, dig, arp). `target`, when present,
 *       must be 'local'; a cli step never touches the network as a
 *       client beyond the allow-listed diagnostic itself.
 *   - { type: 'ssh', target, command, port?, timeoutMs? }
 *       Remote read-only diagnostic via runner.js runSsh (ssh2 exec
 *       channel, exact allow-listed strings only — show version,
 *       show interfaces, show ip interface brief, uptime, uname -a).
 *   - { type: 'wmi', target, query?, command?, namespace?, port?,
 *       transport?, timeoutMs?, maxResults? }
 *       Windows host via server/services/winrm.js (real WinRM
 *       WS-Management SOAP + NTLMv2): `query` runs a WQL query
 *       (runWql, default namespace root/cimv2); `command` runs one
 *       shell command (runShellCommand). Port/transport default from
 *       settings.winrm ({ defaultPort: 5985, transport: 'http' })
 *       when the step does not specify them.
 *       SAFETY (Phase 4 merge decision, see docs/workflows.md): a `wmi`
 *       command step runs an ARBITRARY shell command on the target host
 *       (cmd.exe /c ...) with NO allow-list, unlike cli/ssh steps. That
 *       is allowed ONLY because execute is admin-only (requireAuth +
 *       requireRole('admin') below). If execute is ever opened to
 *       non-admin roles, wmi command steps must be allow-listed or
 *       removed first. `wmi` query steps stay query-only.
 *
 * Credentials are NEVER stored in a workflow step and NEVER written to
 * the run log, the audit log, or any result object. Steps carry only
 * target/command/query. Credentials for ssh/wmi steps are supplied
 * per execution in the execute request body, keyed by step index:
 *   POST /api/workflows/execute
 *   { "workflowId": 3,
 *     "credentials": { "1": { "username": "admin", "password": "..." } } }
 * The map is used transiently for that one run and then dropped. A
 * step that needs credentials and has none for its index FAILS honestly
 * (it is not skipped, and no stored or default credential is ever
 * guessed). A step object that itself contains password / privateKey /
 * passphrase is REFUSED at create/validate time with 400 and never
 * stored (Phase 4 merge: validateDefinition enforces it, so the secret
 * can neither land in steps_json nor be echoed back in a create
 * response); a row that already contains one (predating the check)
 * still FAILS at execution time with a stored-credential error —
 * credentials must not live in the stored workflow definition.
 *
 * Failure semantics: a step that fails (refused command, validation
 * error, timeout, unreachable host, auth failure, non-zero exit, missing
 * credentials, missing infrastructure) stops the workflow: the failed
 * step is recorded with its real error, later steps are recorded as
 * 'skipped' with the reason, and the run is recorded with status
 * 'failed'. Steps that require infrastructure that does not exist (no
 * SSH host, no WinRM host) fail that step honestly — they are never
 * silently skipped or reported successful. A run with every step ok is
 * recorded 'completed'. Both statuses count toward executionCount /
 * lastExecuted (see EXECUTED_STATUSES). A workflow with zero steps is
 * refused with 400 and no run is recorded — there is nothing to execute.
 * The run record (per-step results + real timestamps) is persisted via
 * saveWorkflowRun as a JSON string in the run's `log` column, and is
 * returned in the execute response as `execution`.
 *
 * HTTP status: the execute call itself returns 200 whenever a workflow
 * was actually run, with body status 'success' (all steps ok) or
 * 'failed' (a step failed) and the full execution record — the failure
 * is domain data, not a transport error, and the recorded run is the
 * proof either way. 400/404/501 keep their old meanings: 400 missing
 * workflowId or no steps, 404 unknown workflowId, 501 only if the
 * executor services themselves fail to load (fail closed, nothing run).
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
 * POST /api/workflows/execute (OPEN O-12). Phase 3 closes it with the
 * executor above. Three REAL routes were added from stored data only,
 * no execution is claimed:
 *  - GET /api/workflows/:id — one stored workflow + its stored runs.
 *  - GET /api/workflows/:id/runs — the stored run history for a
 *    workflow (including refused 'not_implemented' attempts from
 *    before the executor existed).
 *  - POST /api/workflows/validate — checks a workflow definition
 *    against exactly the rules POST /api/workflows/create enforces,
 *    without persisting or executing anything.
 * A dry-run endpoint was NOT added: with no step schema and no
 * executor, a dry-run could only repeat create-time validation and
 * could not say whether any step would succeed — reporting that as
 * a dry-run result would be misleading. (That reason no longer applies
 * to execution itself, but a dry-run is still not added: running the
 * steps IS the dry-run now, and a separate endpoint would duplicate
 * the executor. The runner-ui / workflow-exec close-out may add one.)
 */

const express = require('express');

const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../services/session');

// Executor services (ported verbatim from the Phase 3 sibling tracks:
// runner.js from runner-service, winrm.js + ntlm.js from winrm-service).
// Loaded defensively: if either fails to load, execute fails closed
// with 501 'executor_unavailable' and runs nothing, while list/create/
// validate keep working.
let runner = null;
let winrm = null;
let executorLoadError = null;
try {
  runner = require('../services/runner');
} catch (err) {
  executorLoadError = `runner service failed to load: ${err && err.message ? err.message : String(err)}`;
}
try {
  winrm = require('../services/winrm');
} catch (err) {
  executorLoadError = executorLoadError
    ? `${executorLoadError}; winrm service failed to load: ${err && err.message ? err.message : String(err)}`
    : `winrm service failed to load: ${err && err.message ? err.message : String(err)}`;
}

// Store contract: store.workflows.createWorkflow, listWorkflows,
// saveWorkflowRun, listWorkflowRuns. (The store also exposes flat
// aliases of the same functions; the namespaced form is used here,
// with the flat store as a fallback so the route keeps working if
// the store is ever loaded without its namespaces.)
const workflows = store.workflows || store;

// Run statuses that represent a workflow that actually executed.
// 'not_implemented' is a refused attempt, not an execution.
const EXECUTED_STATUSES = new Set(['success', 'completed', 'failed']);

// Step types the executor understands.
const STEP_TYPES = new Set(['cli', 'ssh', 'wmi']);

// Credential fields that must NEVER appear in a stored step. If one
// does, the step fails with a stored-credential error instead of
// using it.
const STORED_CREDENTIAL_FIELDS = ['password', 'privateKey', 'passphrase'];

// Output cap for WinRM stdout/stderr kept in a step result (the runner
// already caps its own output at 64 KiB).
const MAX_STEP_OUTPUT_CHARS = 65536;
// WinRM per-step timeout bounds (runner clamps its own: 10 s default,
// 30 s max).
const WINRM_MIN_TIMEOUT_MS = 1000;
const WINRM_MAX_TIMEOUT_MS = 120000;

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
// 'not_implemented' rows are refused execute attempts from before the
// executor existed, shown with their real status so the audit trail
// is visible instead of hidden. For executed runs the `log` column
// holds the execution record as a JSON string (see execute route).
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
// asserted about them. ONE exception, enforced here (Phase 4 merge):
// a step must not carry a credential field (password / privateKey /
// passphrase) — credentials live only in the per-execution map, never
// in the stored definition. Without this check, create would store the
// secret in steps_json and echo it back in the create response. The
// executor still refuses such a step at run time too (defense in
// depth, for rows that predate this check).
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
      for (let i = 0; i < body.steps.length; i++) {
        const step = body.steps[i];
        if (!step || typeof step !== 'object' || Array.isArray(step)) {
          errors.push('each step must be an object');
          break;
        }
        for (const field of STORED_CREDENTIAL_FIELDS) {
          if (step[field] !== undefined && step[field] !== null && step[field] !== '') {
            errors.push(
              `step ${i} stores a credential field ("${field}"): credentials must not be stored in ` +
                `workflow steps; supply them per execution in the "credentials" map keyed by step index`
            );
          }
        }
      }
      if (errors.length === 0) steps = body.steps;
    }
  }
  return { errors, name, steps };
}

// ---------------------------------------------------------- executor ---

// settings.winrm defaults ({ defaultPort, transport }) when the step
// does not specify them. Absent/unparseable settings mean the winrm
// service's own defaults (5985/http). Never throws.
function winrmDefaults() {
  try {
    const getSetting = store.settings && store.settings.getSetting;
    if (typeof getSetting !== 'function') return {};
    const raw = getSetting('winrm');
    if (raw === null || raw === undefined) return {};
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function clampWinrmTimeout(timeoutMs) {
  const n = Number(timeoutMs);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(Math.max(Math.floor(n), WINRM_MIN_TIMEOUT_MS), WINRM_MAX_TIMEOUT_MS);
}

function truncateStepOutput(text) {
  if (text === undefined || text === null) return null;
  const s = String(text);
  return s.length > MAX_STEP_OUTPUT_CHARS ? s.slice(0, MAX_STEP_OUTPUT_CHARS) : s;
}

// The audit username for runner calls. Never a credential.
function auditUser(req) {
  return (req && req.user && req.user.username) || 'system';
}

// Credentials for one step, from the per-execution credentials map
// (keyed by step index). Returns null when the step has no entry.
// The map is the ONLY source of secrets; nothing is read from the
// stored step (see the stored-credential check in executeStep).
function stepCredentials(credentials, index) {
  if (!credentials || typeof credentials !== 'object') return null;
  const entry = credentials[String(index)];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  return entry;
}

// Execute ONE step. Never throws for a step outcome — every failure
// mode is returned as { ok: false, error } so the caller can record
// it and stop the workflow. The returned object contains no
// credential in any field.
async function executeStep(step, index, req, credentials) {
  const startedAt = Date.now();
  const base = {
    index,
    type: step && typeof step.type === 'string' ? step.type : null,
    target:
      step && typeof step.target === 'string'
        ? step.target
        : step && step.target !== undefined
          ? String(step.target)
          : null,
    command: step && typeof step.command === 'string' ? step.command : null,
    query: step && typeof step.query === 'string' ? step.query : null,
    status: 'failed',
    ok: false,
    stdout: null,
    stderr: null,
    exitCode: null,
    results: null,
    count: null,
    error: null,
    durationMs: 0,
    startedAt,
    finishedAt: startedAt,
  };
  const fail = (message) => {
    base.error = String(message);
    base.finishedAt = Date.now();
    base.durationMs = base.finishedAt - startedAt;
    return base;
  };
  const succeed = (partial) => {
    Object.assign(base, partial, { status: 'success', ok: true, error: null });
    base.finishedAt = Date.now();
    base.durationMs = base.finishedAt - startedAt;
    return base;
  };

  if (!step || typeof step !== 'object' || Array.isArray(step)) {
    return fail('step must be an object');
  }
  if (!STEP_TYPES.has(step.type)) {
    return fail(
      `unknown step type ${JSON.stringify(step.type)}: expected one of "cli", "ssh", "wmi"`
    );
  }
  // Credentials must never be stored in the workflow definition.
  for (const field of STORED_CREDENTIAL_FIELDS) {
    if (step[field] !== undefined && step[field] !== null && step[field] !== '') {
      return fail(
        `step stores a credential field ("${field}"): credentials must not be stored in ` +
          `workflow steps; supply them per execution in the "credentials" map keyed by step index`
      );
    }
  }
  const creds = stepCredentials(credentials, index);
  const user = auditUser(req);

  if (step.type === 'cli') {
    if (step.target !== undefined && step.target !== null && step.target !== 'local') {
      return fail(
        `cli step target must be "local" (it runs on this server), got ${JSON.stringify(step.target)}`
      );
    }
    if (typeof step.command !== 'string' || step.command.length === 0) {
      return fail('cli step requires a "command" string (an allow-listed local diagnostic)');
    }
    try {
      const result = await runner.runLocal({
        command: step.command,
        args: step.args,
        user,
        timeoutMs: step.timeoutMs,
      });
      if (!result.ok) {
        return fail(result.error || `local command exited with code ${result.exitCode}`);
      }
      return succeed({
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      });
    } catch (err) {
      // Refusal / validation (not allow-listed, bad args): an honest
      // step failure, not a crash.
      return fail(err && err.message ? err.message : String(err));
    }
  }

  if (step.type === 'ssh') {
    if (typeof step.target !== 'string' || step.target.length === 0) {
      return fail('ssh step requires a "target" host (IP address or hostname)');
    }
    if (typeof step.command !== 'string' || step.command.length === 0) {
      return fail('ssh step requires a "command" string (an allow-listed remote diagnostic)');
    }
    const username =
      (creds && typeof creds.username === 'string' && creds.username) ||
      (typeof step.username === 'string' && step.username) ||
      null;
    if (!username) {
      return fail(
        `ssh step ${index} has no credentials: supply { "username", "password" | "privateKey" } ` +
          `for step ${index} in the per-execution "credentials" map (never stored)`
      );
    }
    if (!creds || (typeof creds.password !== 'string' && typeof creds.privateKey !== 'string')) {
      return fail(
        `ssh step ${index} has no password or privateKey: supply one for step ${index} in the ` +
          `per-execution "credentials" map (never stored)`
      );
    }
    try {
      const result = await runner.runSsh({
        host: step.target,
        port: step.port,
        username,
        password: creds.password,
        privateKey: creds.privateKey,
        passphrase: creds.passphrase,
        command: step.command,
        user,
        timeoutMs: step.timeoutMs,
      });
      if (!result.ok) {
        return fail(result.error || `remote command exited with code ${result.exitCode}`);
      }
      return succeed({
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      });
    } catch (err) {
      return fail(err && err.message ? err.message : String(err));
    }
  }

  // type === 'wmi'
  if (typeof step.target !== 'string' || step.target.length === 0) {
    return fail('wmi step requires a "target" host (IP address or hostname)');
  }
  const username =
    (creds && typeof creds.username === 'string' && creds.username) ||
    (typeof step.username === 'string' && step.username) ||
    null;
  if (!username) {
    return fail(
      `wmi step ${index} has no credentials: supply { "username", "password" } for step ${index} ` +
        `in the per-execution "credentials" map (never stored)`
    );
  }
  if (!creds || typeof creds.password !== 'string' || creds.password.length === 0) {
    return fail(
      `wmi step ${index} has no password: supply one for step ${index} in the per-execution ` +
        `"credentials" map (never stored)`
    );
  }
  const defaults = winrmDefaults();
  const port = step.port !== undefined && step.port !== null ? step.port : defaults.defaultPort;
  const transport = step.transport || defaults.transport;
  const timeoutMs = clampWinrmTimeout(step.timeoutMs);
  const hasQuery = typeof step.query === 'string' && step.query.length > 0;
  const hasCommand = typeof step.command === 'string' && step.command.length > 0;
  if (!hasQuery && !hasCommand) {
    return fail('wmi step requires a "query" (WQL) string or a "command" string');
  }
  if (hasQuery && hasCommand) {
    return fail('wmi step must have either a "query" or a "command", not both');
  }
  try {
    if (hasQuery) {
      const maxResults = Number.isInteger(step.maxResults)
        ? Math.min(Math.max(step.maxResults, 1), 1000)
        : 32;
      const result = await winrm.runWql(step.target, {
        username,
        password: creds.password,
        domain: creds.domain,
        workstation: creds.workstation,
        namespace: step.namespace,
        query: step.query,
        port,
        transport,
        timeoutMs,
        maxResults,
      });
      return succeed({ results: result.results || [], count: result.count ?? 0 });
    }
    const result = await winrm.runShellCommand(step.target, {
      username,
      password: creds.password,
      domain: creds.domain,
      workstation: creds.workstation,
      command: step.command,
      port,
      transport,
      timeoutMs,
      workingDirectory: step.workingDirectory,
    });
    if (result.exitCode !== 0) {
      return fail(
        `remote command exited with code ${result.exitCode}` +
          (result.stderr ? `: ${truncateStepOutput(result.stderr).slice(0, 500)}` : '')
      );
    }
    return succeed({
      stdout: truncateStepOutput(result.stdout),
      stderr: truncateStepOutput(result.stderr),
      exitCode: result.exitCode,
    });
  } catch (err) {
    // WinRMError (UNREACHABLE / AUTH_FAILED / TIMEOUT / PROTOCOL /
    // INVALID_ARGUMENT) carries code + honest message; never a secret.
    const code = err && err.code ? `${err.code}: ` : '';
    return fail(`WinRM ${code}${err && err.message ? err.message : String(err)}`);
  }
}

// -------------------------------------------------------------- routes ---

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
// into existence; the store starts empty. Validation is validateDefinition
// (shared with POST /api/workflows/validate), so create and validate
// enforce exactly the same rules — including the Phase 4 rule that a
// step must not carry a credential field (password / privateKey /
// passphrase): such a definition is refused with 400 and never stored.
router.post(
  '/api/workflows/create',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { errors, name, steps } = validateDefinition(req.body);
      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          error: 'invalid_request',
          message: errors[0],
        });
      }
      const created = await workflows.createWorkflow({
        name,
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

// POST /api/workflows/execute — admin only. Runs the workflow's stored
// steps IN ORDER through the real step executor (see the file header
// for the step interface and the credentials rule). Stops at the first
// failed step; the run is recorded with status 'completed' (all steps
// ok) or 'failed' (a step failed) plus real timestamps, and both
// count toward executionCount / lastExecuted. Steps against missing
// infrastructure fail honestly — nothing is silently skipped or
// reported successful. Unknown workflowId -> 404; missing
// workflowId -> 400; zero steps -> 400 with no run recorded.
// If the executor services failed to load, this fails closed with
// 501 'executor_unavailable' and runs nothing.
router.post(
  '/api/workflows/execute',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { workflowId, credentials } = req.body || {};
      if (workflowId === undefined || workflowId === null || workflowId === '') {
        return res.status(400).json({
          status: 'error',
          error: 'invalid_request',
          message: 'workflowId is required',
        });
      }
      const wf = await findWorkflow(workflowId);
      if (!wf) {
        return res.status(404).json({
          status: 'error',
          error: 'not_found',
          message: `Workflow ${workflowId} not found`,
        });
      }
      if (executorLoadError || !runner || !winrm) {
        const message =
          `Workflow execution is unavailable: the step executor failed to load ` +
          `(${executorLoadError || 'unknown load error'}), so workflow "${wf.name}" ` +
          `(id ${wf.id}) was not run and no step was executed.`;
        return res.status(501).json({
          status: 'error',
          error: 'executor_unavailable',
          message,
          workflowId: wf.id,
        });
      }
      const steps = parseSteps(wf.steps_json);
      if (steps.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'invalid_request',
          message: `Workflow "${wf.name}" (id ${wf.id}) has no steps to execute`,
          workflowId: wf.id,
        });
      }
      const startedAt = Date.now();
      const stepResults = [];
      let failedIndex = null;
      for (let i = 0; i < steps.length; i++) {
        const result = await executeStep(steps[i], i, req, credentials);
        stepResults.push(result);
        if (!result.ok) {
          failedIndex = i;
          break;
        }
      }
      // Steps after a failure are recorded as skipped — explicitly,
      // with the reason — never silently dropped.
      for (let i = stepResults.length; i < steps.length; i++) {
        const step = steps[i] || {};
        stepResults.push({
          index: i,
          type: typeof step.type === 'string' ? step.type : null,
          target: typeof step.target === 'string' ? step.target : null,
          command: typeof step.command === 'string' ? step.command : null,
          query: typeof step.query === 'string' ? step.query : null,
          status: 'skipped',
          ok: false,
          stdout: null,
          stderr: null,
          exitCode: null,
          results: null,
          count: null,
          error: `skipped: step ${failedIndex} failed, workflow stopped`,
          durationMs: 0,
          startedAt: null,
          finishedAt: null,
        });
      }
      const finishedAt = Date.now();
      const status = failedIndex === null ? 'completed' : 'failed';
      const execution = {
        workflowId: wf.id,
        workflowName: wf.name,
        status,
        startedAt,
        finishedAt,
        durationMs: finishedAt - startedAt,
        steps: stepResults,
        failedStepIndex: failedIndex,
      };
      const saved = await workflows.saveWorkflowRun({
        workflow_id: wf.id,
        status,
        log: JSON.stringify(execution),
        started_at: startedAt,
        finished_at: finishedAt,
      });
      execution.runId = saved ? saved.id : null;
      if (status === 'completed') {
        return res.json({
          status: 'success',
          workflowId: wf.id,
          runId: execution.runId,
          execution,
        });
      }
      const failed = stepResults[failedIndex];
      return res.json({
        status: 'failed',
        error: 'workflow_failed',
        message:
          `Workflow "${wf.name}" (id ${wf.id}) failed at step ${failedIndex} ` +
          `(${failed.type || 'unknown'}): ${failed.error || 'step failed'}`,
        workflowId: wf.id,
        runId: execution.runId,
        execution,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
