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
const ping = require('../services/ping');
const snmp = require('../services/snmp');
const { execFile } = require('node:child_process');
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

// Real executable step types backed by local node services / SQLite store.
// Steps needing external SaaS/WMI integrations (slack, sdp_ticket, wmi,
// restart_service, reboot_system) remain honestly 501 not_implemented.
const SUPPORTED_STEP_TYPES = new Set(['ssh', 'cli', 'ping', 'traceroute', 'poll', 'snmp_poll', 'ncm_backup', 'ack_alarm']);

function runTracerouteOnce(address) {
  return new Promise((resolve) => {
    execFile('traceroute', ['-n', '-w', '1', '-q', '1', '-m', '10', address], { timeout: 10000 }, (err, stdout, stderr) => {
      const out = String(stdout || stderr || (err && err.message) || '').trim();
      resolve({ ok: !err || Boolean(stdout), output: out || 'No traceroute output' });
    });
  });
}

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

router.delete('/api/workflows/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const delFn = workflows.deleteWorkflow || store.deleteWorkflow;
    const result = delFn ? await delFn(id) : { deleted: 0 };
    res.json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/execute — executes real workflow steps cleanly.
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
        .filter((s) => !s || !SUPPORTED_STEP_TYPES.has(String(s.type || '').toLowerCase()))
        .map((s) => (s && s.type) || '(missing type)')
    )];

    if (steps.length === 0 || unsupported.length > 0) {
      const message = steps.length === 0
        ? `Workflow "${wf.name}" (id ${wf.id}) has no steps to run.`
        : `Workflow "${wf.name}" (id ${wf.id}) refused: step type(s) [${unsupported.join(', ')}] have no local executor. Supported types: ping, traceroute, poll, ssh, cli, ncm_backup, ack_alarm.`;
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

    const needsSsh = steps.some((s) => ['ssh', 'cli', 'ncm_backup'].includes(String(s.type || '').toLowerCase()));
    const cred = needsSsh ? sshclient.findSshCredential(store) : null;
    if (needsSsh && (!cred || !cred.username || !cred.password)) {
      const message = 'SSH/CLI or NCM Backup step requires an SSH credential configured in Settings > Credential Library.';
      await workflows.saveWorkflowRun({
        workflow_id: wf.id, status: 'not_implemented', log: message, started_at: startedAt, finished_at: Date.now()
      });
      return res.status(400).json({ status: 'error', message, workflowId: wf.id, logs: [message] });
    }

    const logs = [];
    let allOk = true;
    const devices = store.listDevices() || [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stType = String(step.type || '').toLowerCase();
      const target = String(step.host || step.target || '192.168.30.1').trim();
      const matchedDev = devices.find((d) => d.ip === target || d.hostname === target || String(d.id) === target);
      const resolveTarget = matchedDev ? matchedDev.ip : target;

      if (stType === 'ack_alarm') {
        const alms = (store.listAlarms({ limit: 500 }) || []).filter(
          (a) => String(a.status || '').toLowerCase() === 'active' &&
            (!matchedDev || String(a.device_id) === String(matchedDev.id))
        );
        let acked = 0;
        for (const a of alms.slice(0, 20)) {
          try { store.acknowledgeAlarm(a.id, 'workflow-engine'); acked++; } catch (e) {}
        }
        logs.push(`[Step ${i + 1}: ACK_ALARM] Acknowledged ${acked} active alarm(s) for ${matchedDev ? matchedDev.hostname || matchedDev.ip : 'all nodes'}.`);
        continue;
      }

      const address = await resolveHost(resolveTarget);
      if (!address) {
        allOk = false;
        logs.push(`[Step ${i + 1}: ${stType.toUpperCase()}] Could not resolve target '${target}' to IPv4.`);
        continue;
      }

      if (stType === 'ping') {
        const ms = await ping.pingMs(address);
        if (ms !== null) {
          logs.push(`[Step ${i + 1}: PING] ${address} replied in ${ms} ms (ICMP Echo OK).`);
        } else {
          allOk = false;
          logs.push(`[Step ${i + 1}: PING] ${address} did not respond to ICMP Echo.`);
        }
      } else if (stType === 'traceroute') {
        const tr = await runTracerouteOnce(address);
        if (!tr.ok) allOk = false;
        logs.push(`[Step ${i + 1}: TRACEROUTE] Target ${address}:\n${tr.output}`);
      } else if (stType === 'poll' || stType === 'snmp_poll') {
        const comm = (matchedDev && matchedDev.snmp_community) || step.community || 'public';
        try {
          const vbs = await snmp.snmpGet(address, comm, ['1.3.6.1.2.1.1.1.0', '1.3.6.1.2.1.1.3.0']);
          const descr = vbs[0] && vbs[0].value != null ? String(vbs[0].value).slice(0, 80) : 'OK';
          const up = vbs[1] && vbs[1].value != null ? vbs[1].value : '—';
          logs.push(`[Step ${i + 1}: SNMP_POLL] ${address} sysUpTime=${up}, sysDescr="${descr}"`);
        } catch (err) {
          allOk = false;
          logs.push(`[Step ${i + 1}: SNMP_POLL] ${address} SNMP poll failed: ${err.message}`);
        }
      } else if (stType === 'ncm_backup') {
        try {
          const raw = await sshclient.runShowCommand(address, cred, step.command || 'show running-config');
          const clean = sshclient.cleanConfigOutput(raw, step.command || 'show running-config');
          if (matchedDev && clean) store.saveConfig(matchedDev.id, 'running', clean);
          logs.push(`[Step ${i + 1}: NCM_BACKUP] Captured ${clean.length} bytes config from ${address}.`);
        } catch (err) {
          allOk = false;
          logs.push(`[Step ${i + 1}: NCM_BACKUP] SSH config backup failed on ${address}: ${err.message}`);
        }
      } else {
        try {
          const result = await sshclient.execCommand(address, cred, step.command || 'uname -a');
          allOk = allOk && (result.exitCode === 0 || result.exitCode === null);
          logs.push(`[Step ${i + 1}: SSH_CLI] ${address} exit=${result.exitCode}\n${result.stdout}${result.stderr ? '\nstderr: ' + result.stderr : ''}`);
        } catch (err) {
          allOk = false;
          logs.push(`[Step ${i + 1}: SSH_CLI] ${address} SSH failed: ${err.message}`);
        }
      }
    }

    const finishedAt = Date.now();
    const status = allOk ? 'success' : 'failed';
    await workflows.saveWorkflowRun({
      workflow_id: wf.id, status, log: logs.join('\n---\n'), started_at: startedAt, finished_at: finishedAt
    });

    res.json({
      status: allOk ? 'success' : 'error',
      message: `Workflow "${wf.name}" (id ${wf.id}) ${allOk ? 'completed successfully' : 'completed with step failures'}.`,
      workflowId: wf.id,
      logs,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
