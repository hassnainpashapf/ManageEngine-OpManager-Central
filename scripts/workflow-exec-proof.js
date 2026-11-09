'use strict';
/**
 * workflow-exec-proof.js — Phase 4 merge (p4m-winrm) proof for the real
 * workflow step executor (server/routes/workflows.js).
 *
 * The Phase 3 workflow-exec track shipped docs-only proof (no script).
 * This script ACTUALLY executes the executor against a running server
 * (own instance, port 8161 by default, throwaway DB) and records the
 * exact results:
 *   1. cli dig -> completed, real dig output, exitCode 0.
 *   2. cli refusal (rm -rf /) -> step failed, run failed, nothing spawned.
 *   3. ssh refusal (closed 127.0.0.1:2222, per-execution credentials) ->
 *      step failed fast with an honest connection error; later steps skipped.
 *   4. wmi refusal, no credentials -> step failed (missing credentials).
 *   5. wmi refusal, credentials to a closed port -> step failed
 *      WinRM UNREACHABLE (ECONNREFUSED 127.0.0.1:5985).
 *   6. Stop-at-first-failure: [dig ok, ssh refused, dig] -> failedStepIndex 1,
 *      step 2 recorded 'skipped'.
 *   7. Stored credential in a step is refused at create time (400, never
 *      stored) — and, for a row that predates the check (inserted directly
 *      into the throwaway DB), the executor still refuses it at run time.
 *   8. Zero-step workflow -> 400, no run recorded. Unknown id -> 404.
 *   9. Execute without a session -> 401 (admin-only).
 *  10. Leak sweep: the runtime-only test password appears in NO response
 *      body collected during the run (checked in memory; only hit counts
 *      are printed, never the value).
 *
 * Usage:
 *   OPM_BASE_URL=http://127.0.0.1:8161 node scripts/workflow-exec-proof.js
 * The server must already be running with a FRESH throwaway DB (the
 * script logs in with the bootstrap password from
 * server/data/.admin-initial and rotates it once, in-process only, to
 * clear the must-change-password guard — the rotated value is runtime
 * only; pass OPM_ROTATED_ADMIN_PASSWORD for a repeatable value).
 * Results (credentials scrubbed): scripts/workflow-exec-proof-results.json
 * Exit 0 = every case passed; exit 1 = any case failed.
 *
 * SAFETY NOTE (decided in the Phase 4 merge): a `wmi` step with
 * `command` runs an ARBITRARY shell command on the target Windows host
 * via WinRM runShellCommand. That is allowed ONLY because execute is
 * admin-only (requireAuth + requireRole('admin')) — the same trust
 * boundary as handing an admin a WinRM shell directly. `wmi` query
 * steps stay query-only (WQL SELECT). See docs/workflows.md.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const REPO_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(REPO_ROOT, 'server', 'data', 'opmanager.db');
const BASE_URL = process.env.OPM_BASE_URL || 'http://127.0.0.1:8161';
const RESULTS_FILE = path.join(__dirname, 'workflow-exec-proof-results.json');
const ADMIN_USER = process.env.OPM_ADMIN_USER || 'admin';
const TIMEOUT_MS = 30000;

// Runtime-only test password for ssh/wmi steps (never persisted, never
// printed; the leak sweep asserts it never appears in any response).
const TEST_PASSWORD = `P4m-Wf-${crypto.randomBytes(12).toString('hex')}-X1`;
const TEST_SSH_USER = 'wfproof';
const TEST_WMI_USER = 'wfproof';

const results = { startedAt: new Date().toISOString(), cases: [], finishedAt: null };
const bodies = []; // every response body, for the leak sweep
let failures = 0;

function record(id, title, outcome, detail) {
  // outcome: 'pass' | 'fail' | 'blocked' (blocked = could not be run for
  // a stated environmental reason; not a failure, not a pass). A boolean
  // is also accepted (true -> pass, false -> fail) for the simple cases.
  if (outcome === true) outcome = 'pass';
  else if (outcome === false) outcome = 'fail';
  results.cases.push({ id, title, outcome, detail });
  if (outcome === 'fail') failures += 1;
  console.log(`[${String(outcome).toUpperCase()}] ${id} ${title} — ${detail}`);
}

function httpRequest({ url, method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? require('node:https') : require('node:http');
    const req = lib.request(
      { hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, headers, timeout: timeoutMs },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
      }
    );
    req.on('timeout', () => req.destroy(new Error(`request timed out after ${timeoutMs}ms`)));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function api(method, pathname, cookie, jsonBody) {
  const r = await httpRequest({
    url: `${BASE_URL}${pathname}`,
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: jsonBody === undefined ? null : JSON.stringify(jsonBody),
  });
  bodies.push(r.body);
  return r;
}

function parseBody(r) {
  try { return JSON.parse(r.body); } catch { return null; }
}

function cookieFrom(r) {
  const setCookie = r.headers['set-cookie'];
  if (!setCookie) return '';
  return (Array.isArray(setCookie) ? setCookie : [setCookie]).map((c) => c.split(';')[0]).join('; ');
}

async function login() {
  let password = process.env.OPM_ADMIN_PASSWORD || null;
  if (!password) {
    const file = path.join(REPO_ROOT, 'server', 'data', '.admin-initial');
    if (!fs.existsSync(file)) throw new Error('no admin password available (server/data/.admin-initial missing — is the server running with a fresh DB?)');
    password = fs.readFileSync(file, 'utf8').trim();
  }
  let r = await api('POST', '/api/auth/login', null, { username: ADMIN_USER, password });
  if (r.status !== 200) throw new Error(`admin login failed: HTTP ${r.status}`);
  let cookie = cookieFrom(r);
  const parsed = parseBody(r) || {};
  if (parsed.mustChangePassword) {
    const newPassword = process.env.OPM_ROTATED_ADMIN_PASSWORD && process.env.OPM_ROTATED_ADMIN_PASSWORD.length >= 10
      ? process.env.OPM_ROTATED_ADMIN_PASSWORD
      : `Opm-P4m-${crypto.randomBytes(12).toString('hex')}-Rotate1`;
    const ch = await api('POST', '/api/auth/change-password', cookie, { currentPassword: password, newPassword });
    if (ch.status !== 200) throw new Error(`password rotation failed: HTTP ${ch.status} — cannot clear must-change-password guard`);
    cookie = cookieFrom(ch) || cookie;
    console.log('[info] bootstrap admin password rotated (runtime-only) to clear the must-change guard.');
  }
  return cookie;
}

async function createWorkflow(cookie, name, steps) {
  const r = await api('POST', '/api/workflows/create', cookie, { name, steps });
  if (r.status !== 201) throw new Error(`create workflow "${name}" failed: HTTP ${r.status} ${r.body.slice(0, 200)}`);
  return parseBody(r).workflow;
}

async function executeWorkflow(cookie, workflowId, credentials) {
  const t0 = Date.now();
  const r = await api('POST', '/api/workflows/execute', cookie, { workflowId, credentials });
  return { r, body: parseBody(r), ms: Date.now() - t0 };
}

async function main() {
  console.log('=== Workflow step-executor proof (Phase 4 merge, p4m-winrm) ===');
  console.log(`app: ${BASE_URL} (already running; throwaway DB)`);

  const cookie = await login();
  console.log('[info] admin login OK.');

  // 9 (first, unauthenticated): execute without a session -> 401.
  const noAuth = await api('POST', '/api/workflows/execute', null, { workflowId: 1 });
  record('9', 'Execute without a session -> 401 (admin-only)', noAuth.status === 401,
    `POST /api/workflows/execute without a session -> HTTP ${noAuth.status} (expected 401).`);

  // 1. cli dig -> completed, real output.
  const wf1 = await createWorkflow(cookie, 'p4m-proof dig', [
    { type: 'cli', command: 'dig', args: { name: 'example.com', type: 'A' } },
  ]);
  const ex1 = await executeWorkflow(cookie, wf1.id);
  const s1 = ex1.body && ex1.body.execution && ex1.body.execution.steps && ex1.body.execution.steps[0];
  record('1', 'cli dig executes for real', ex1.r.status === 200 && ex1.body.status === 'success' && s1 && s1.ok === true && s1.exitCode === 0 && typeof s1.stdout === 'string' && s1.stdout.trim().length > 0,
    `workflow ${wf1.id}: HTTP ${ex1.r.status}, body status=${ex1.body && ex1.body.status}, step0 ok=${s1 && s1.ok} exitCode=${s1 && s1.exitCode} stdout=${JSON.stringify((s1 && s1.stdout || '').trim().slice(0, 60))} in ${s1 && s1.durationMs}ms.`);

  // 2. cli refusal: rm -rf / must be refused, nothing spawned.
  const wf2 = await createWorkflow(cookie, 'p4m-proof cli refusal', [
    { type: 'cli', command: 'rm', args: {} },
  ]);
  const ex2 = await executeWorkflow(cookie, wf2.id);
  const s2 = ex2.body && ex2.body.execution && ex2.body.execution.steps && ex2.body.execution.steps[0];
  record('2', 'cli rm refused (allow-list)', ex2.r.status === 200 && ex2.body.status === 'failed' && s2 && s2.ok === false && /not allowed/i.test(s2.error || ''),
    `workflow ${wf2.id}: HTTP ${ex2.r.status}, body status=${ex2.body && ex2.body.status}, step0 error=${JSON.stringify(s2 && s2.error)}.`);

  // 3. ssh refusal (closed port) + stop-at-first-failure (case 6).
  const wf3 = await createWorkflow(cookie, 'p4m-proof ssh refusal + skip', [
    { type: 'cli', command: 'dig', args: { name: 'example.com', type: 'A' } },
    { type: 'ssh', target: '127.0.0.1', port: 2222, command: 'show version' },
    { type: 'cli', command: 'dig', args: { name: 'example.com', type: 'A' } },
  ]);
  const ex3 = await executeWorkflow(cookie, wf3.id, { 1: { username: TEST_SSH_USER, password: TEST_PASSWORD } });
  const steps3 = (ex3.body && ex3.body.execution && ex3.body.execution.steps) || [];
  record('3+6', 'ssh refusal fails honestly; later step skipped',
    ex3.r.status === 200 && ex3.body.status === 'failed' && ex3.body.execution.failedStepIndex === 1
    && steps3[0] && steps3[0].ok === true
    && steps3[1] && steps3[1].ok === false && /ECONNREFUSED|connect/i.test(steps3[1].error || '')
    && steps3[2] && steps3[2].status === 'skipped',
    `workflow ${wf3.id}: HTTP ${ex3.r.status}, failedStepIndex=${ex3.body && ex3.body.execution && ex3.body.execution.failedStepIndex}, step0 ok=${steps3[0] && steps3[0].ok}, step1 error=${JSON.stringify(steps3[1] && steps3[1].error)} in ${steps3[1] && steps3[1].durationMs}ms, step2 status=${steps3[2] && steps3[2].status}.`);

  // 4. wmi refusal, no credentials -> step failed (missing credentials).
  const wf4 = await createWorkflow(cookie, 'p4m-proof wmi no creds', [
    { type: 'wmi', target: '127.0.0.1', query: 'SELECT Name FROM Win32_OperatingSystem' },
  ]);
  const ex4 = await executeWorkflow(cookie, wf4.id);
  const s4 = ex4.body && ex4.body.execution && ex4.body.execution.steps && ex4.body.execution.steps[0];
  record('4', 'wmi step without credentials fails honestly', ex4.r.status === 200 && ex4.body.status === 'failed' && s4 && s4.ok === false && /no credentials/i.test(s4.error || ''),
    `workflow ${wf4.id}: HTTP ${ex4.r.status}, step0 error=${JSON.stringify(s4 && s4.error)}.`);

  // 5. wmi refusal, credentials to a closed port -> UNREACHABLE.
  const wf5 = await createWorkflow(cookie, 'p4m-proof wmi unreachable', [
    { type: 'wmi', target: '127.0.0.1', query: 'SELECT Name FROM Win32_OperatingSystem' },
  ]);
  const ex5 = await executeWorkflow(cookie, wf5.id, { 0: { username: TEST_WMI_USER, password: TEST_PASSWORD } });
  const s5 = ex5.body && ex5.body.execution && ex5.body.execution.steps && ex5.body.execution.steps[0];
  record('5', 'wmi step to a closed port fails UNREACHABLE', ex5.r.status === 200 && ex5.body.status === 'failed' && s5 && s5.ok === false && /UNREACHABLE/i.test(s5.error || '') && /ECONNREFUSED/i.test(s5.error || ''),
    `workflow ${wf5.id}: HTTP ${ex5.r.status}, step0 error=${JSON.stringify(s5 && s5.error)} in ${s5 && s5.durationMs}ms.`);

  // 7a. Stored credential in a step is refused at CREATE time (400) and
  // never stored: the Phase 3 executor-only check left the secret in
  // steps_json (and echoed it in the create response) — the merge closes
  // that hole in validateDefinition, shared by create and validate.
  const create7 = await api('POST', '/api/workflows/create', cookie, {
    name: 'p4m-proof stored creds',
    steps: [{ type: 'ssh', target: '127.0.0.1', port: 2222, command: 'show version', password: TEST_PASSWORD }],
  });
  const create7Body = parseBody(create7);
  const list7 = await api('GET', '/api/workflows/list', cookie);
  const list7Body = parseBody(list7);
  const stored7 = ((list7Body && list7Body.workflows) || []).some((w) => w.name === 'p4m-proof stored creds');
  record('7a', 'stored credential refused at create (400, never stored)',
    create7.status === 400 && /stores a credential field/i.test((create7Body && create7Body.message) || '') && !stored7,
    `create -> HTTP ${create7.status}, message=${JSON.stringify((create7Body && create7Body.message) || '').slice(0, 120)}; workflow stored: ${stored7} (must be false).`);

  // 7b. Defense in depth: a row that predates the create-time check
  // (inserted directly into this throwaway DB) must still fail at
  // execution time with the stored-credential error — and the value
  // must never be used. The row is deleted again afterwards.
  const legacySteps = JSON.stringify([{ type: 'ssh', target: '127.0.0.1', port: 2222, command: 'show version', password: TEST_PASSWORD }]);
  const sqlEscape = (v) => String(v).replace(/'/g, "''");
  let legacyId = null;
  try {
    const insertOut = execFileSync('sqlite3', [DB_PATH,
      `INSERT INTO workflows (name, steps_json, created_at) VALUES ('p4m-proof legacy stored creds', '${sqlEscape(legacySteps)}', ${Date.now()}); SELECT last_insert_rowid();`],
      { encoding: 'utf8', timeout: 10000 }).trim();
    legacyId = Number(insertOut);
  } catch (err) {
    record('7b', 'executor refuses a pre-existing stored-credential row', 'blocked',
      `could not insert the legacy row into the throwaway DB (${(err.message || err).slice(0, 120)}) — executor check unproven here, create-time refusal (7a) still holds.`);
  }
  if (legacyId) {
    try {
      const ex7b = await executeWorkflow(cookie, legacyId, { 0: { username: TEST_SSH_USER, password: TEST_PASSWORD } });
      const s7b = ex7b.body && ex7b.body.execution && ex7b.body.execution.steps && ex7b.body.execution.steps[0];
      record('7b', 'executor refuses a pre-existing stored-credential row',
        ex7b.r.status === 200 && ex7b.body.status === 'failed' && s7b && s7b.ok === false && /stores a credential field/i.test(s7b.error || ''),
        `workflow ${legacyId}: HTTP ${ex7b.r.status}, step0 error=${JSON.stringify((s7b && s7b.error || '').slice(0, 120))}.`);
    } finally {
      try { execFileSync('sqlite3', [DB_PATH, `DELETE FROM workflows WHERE id = ${legacyId};`], { timeout: 10000 }); } catch { /* throwaway DB; best effort */ }
    }
  }

  // 8. Zero-step -> 400, no run recorded. Unknown id -> 404.
  const wf8 = await createWorkflow(cookie, 'p4m-proof zero steps', []);
  const ex8 = await executeWorkflow(cookie, wf8.id);
  const runs8 = await api('GET', `/api/workflows/${wf8.id}/runs`, cookie);
  const runs8Body = parseBody(runs8);
  const unknown = await api('POST', '/api/workflows/execute', cookie, { workflowId: 99999 });
  record('8', 'zero steps -> 400 with no run; unknown id -> 404', ex8.r.status === 400 && Array.isArray(runs8Body && runs8Body.runs) && runs8Body.runs.length === 0 && unknown.status === 404,
    `zero-step execute -> HTTP ${ex8.r.status}; runs for workflow ${wf8.id}: ${(runs8Body && runs8Body.runs || []).length}; unknown id 99999 -> HTTP ${unknown.status}.`);

  // 10. Leak sweep: the runtime test password must appear in NO collected body.
  let hits = 0;
  for (const b of bodies) if (b && b.includes(TEST_PASSWORD)) hits += 1;
  record('10', 'no credential echoed in any response', hits === 0,
    `swept ${bodies.length} collected response bodies for the runtime test password: ${hits} hits.`);

  results.finishedAt = new Date().toISOString();
  results.summary = {
    pass: results.cases.filter((c) => c.outcome === 'pass').length,
    fail: failures,
    blocked: results.cases.filter((c) => c.outcome === 'blocked').length,
  };
  console.log(`\n=== summary: ${results.summary.pass} pass, ${results.summary.fail} fail, ${results.summary.blocked} blocked ===`);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`[info] results JSON: ${RESULTS_FILE}`);
  process.exit(failures > 0 ? 1 : 0);
}

if (require.main === module) main().catch((err) => {
  console.error(`[fatal] ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
