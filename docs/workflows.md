# Workflows — step executor (Phase 3, workflow-exec)

`POST /api/workflows/execute` no longer returns 501. It runs the workflow's
stored steps **in order** through the real safe services and stops at the
first failed step. This closes Phase-2 OPEN O-12.

## Step interface

Steps are the stored `steps` array of a workflow (created via
`POST /api/workflows/create`). Each step is one of:

```json
{ "type": "cli", "command": "dig", "args": { "name": "example.com", "type": "A" } }
{ "type": "cli", "command": "arp", "args": {} }
{ "type": "ssh", "target": "192.168.30.2", "command": "show version", "port": 22 }
{ "type": "wmi", "target": "192.168.22.10", "query": "SELECT Name FROM Win32_OperatingSystem" }
{ "type": "wmi", "target": "192.168.22.10", "command": "hostname", "namespace": "root/cimv2" }
```

| type | runs through | notes |
| --- | --- | --- |
| `cli` | `server/services/runner.js` `runLocal` | Local diagnostic on this server. `execFile`, no shell, explicit allow-list only: `ping`, `traceroute`, `nslookup`, `dig`, `arp`. `args` is the runner's args object (e.g. `{ host, count, deadline }` for ping). `target`, when present, must be `"local"`. Timeout default 10 s, max 30 s (runner clamps). |
| `ssh` | `server/services/runner.js` `runSsh` | ssh2 exec channel. Exact allow-listed read-only strings only: `show version`, `show interfaces`, `show ip interface brief`, `uptime`, `uname -a`. `port` defaults to 22. |
| `wmi` | `server/services/winrm.js` | Real WinRM WS-Management SOAP + NTLMv2. `query` runs a WQL query (`runWql`, default namespace `root/cimv2`, `maxResults` default 32, max 1000); `command` runs one shell command (`runShellCommand`). `port`/`transport` default from `settings.winrm` (`{ defaultPort: 5985, transport: 'http' }`). Timeout 1 s–120 s. |

Unknown step types, missing `target`/`command`/`query`, and refused
(non-allow-listed) commands are **step failures**, recorded with the real
error — never silently skipped.

## Safety decision — `wmi` command steps (Phase 4 merge, decided)

A `wmi` step with `command` runs an **arbitrary shell command** on the
target Windows host via WinRM `runShellCommand` (`cmd.exe /c ...`).
There is deliberately NO allow-list on it — unlike `cli`/`ssh` steps,
which only run allow-listed diagnostics. That is ALLOWED only because
`POST /api/workflows/execute` is **admin-only** (`requireAuth` +
`requireRole('admin')`): the caller is already trusted to run arbitrary
commands on Windows hosts (the same trust boundary as handing an admin
a WinRM shell directly). `wmi` **query** steps stay query-only (WQL
`SELECT`, enforced by the route's SELECT-only validation on the
`/api/tools/wmi-query` path and by the WQL dialect itself). If execute
is ever opened to non-admin roles, `wmi` command steps must be
restricted to an allow-list or removed first — the executor code
carries the same warning in its header comment. No stored credentials
are involved either way: step credentials come only from the
per-execution `credentials` map (see below).

## Credentials — per execution only, never stored

Steps carry only target/command/query. Credentials for `ssh`/`wmi` steps are
supplied in the execute request body, keyed by **step index**:

```json
POST /api/workflows/execute
{
  "workflowId": 3,
  "credentials": {
    "1": { "username": "admin", "password": "...", "domain": "GAMEVILLAGE" }
  }
}
```

- The map is used transiently for that one run and then dropped. It is never
  persisted, never written to the run log, the audit log, or any result.
- A step that needs credentials and has none for its index **fails honestly**.
  No stored or default credential is ever guessed.
- A step object that itself contains `password`, `privateKey` or
  `passphrase` is **refused at create/validate time with 400** and never
  stored (Phase 4 merge: `validateDefinition` enforces it, so the secret
  can neither land in `steps_json` nor be echoed back in a create
  response). A row that already contains one (predating the check)
  still **fails at execution time** with a stored-credential error —
  defense in depth. Credentials must not live in the stored workflow
  definition.
- `username` may also be given on the step itself (non-secret); the
  credentials map wins when both are present.

## Run semantics

- Steps run in order. The first failed step stops the workflow: the failed
  step is recorded with its real error, later steps are recorded as
  `skipped` with the reason `skipped: step N failed, workflow stopped`.
- Run status: `completed` (every step ok) or `failed` (a step failed).
  Both count toward `executionCount` / `lastExecuted` in
  `GET /api/workflows/list`.
- The run record (per-step results + real timestamps) is persisted via
  `saveWorkflowRun` as a JSON string in the run's `log` column, and is
  returned in the execute response as `execution` (with `runId`).
- A workflow with zero steps is refused with 400 and **no run is
  recorded** — there is nothing to execute.
- Unknown `workflowId` → 404; missing `workflowId` → 400. If the executor
  services fail to load, execute fails closed with 501
  `executor_unavailable` and runs nothing (list/create/validate still work).
- HTTP status: the execute call returns 200 whenever a workflow was
  actually run — body `status` is `'success'` (all steps ok) or `'failed'`
  (a step failed) with the full execution record. The failure is domain
  data, not a transport error.

## Per-step result shape

```json
{
  "index": 0, "type": "cli", "target": null, "command": "dig", "query": null,
  "status": "success", "ok": true,
  "stdout": "...", "stderr": "", "exitCode": 0,
  "results": null, "count": null,
  "error": null, "durationMs": 42,
  "startedAt": 1793000000000, "finishedAt": 1793000000042
}
```

`results`/`count` are set for `wmi` query steps (CIM instances as plain
objects). `stdout`/`stderr` are capped at 64 KiB. No result field ever
contains a credential.

## What was ported, and from where

- `server/services/runner.js` — copied verbatim from the Phase 3
  `runner-service` track (commit `a547e67`, `ssh2` 1.17.0).
- `server/services/winrm.js`, `server/services/ntlm.js` — copied verbatim
  from the Phase 3 `winrm-service` track (uncommitted in that clone at
  port time; `fast-xml-parser` 5.12.0).
- New dependencies in `package.json` / `package-lock.json`: `ssh2 ^1.17.0`
  (+ `asn1`, `bcrypt-pbkdf`, `tweetnacl`), `fast-xml-parser ^5.12.0`
  (+ `@nodable/entities`, `anynum`, `fast-xml-builder`, `is-unsafe`,
  `path-expression-matcher`, `strnum`, `xml-naming`). Lock entries were
  merged from the two sibling tracks' lockfiles; `npm ls ssh2
  fast-xml-parser` verifies the installed tree.
- The close-out merge must dedupe these files/deps against the
  runner-service and winrm-service tracks (same content, same versions).

## Live proof (own server, port 8135, throwaway DB)

Proved 2026-11-09 ~13:08–13:09 PKT against this clone's own server on
port 8135 (bootstrap admin, password changed on first login per the
must-change guard; all test credentials runtime-only, never persisted).

**Required 2-step workflow** (id 1, `p3-proof dig + missing-ssh`):
step 0 `{ type: 'cli', command: 'dig', args: { name: 'example.com', type: 'A' } }`,
step 1 `{ type: 'ssh', target: '192.0.2.99', command: 'show version' }`
(192.0.2.99 is TEST-NET-1 — no SSH host exists there).

- `POST /api/workflows/execute` → HTTP 200, body `status: 'failed'`,
  `runId: 1`, `failedStepIndex: 1`, `durationMs: 10242`.
- Step 0: `success`, `exitCode: 0`, `stdout: "198.18.9.95\n"`, 187 ms —
  real `dig` output from this server.
- Step 1: `failed`, `error: "runner: SSH command timed out after 10000 ms"`,
  10054 ms — honest failure against the missing host, no fake success.
- `GET /api/workflows/list` → workflow 1: `executionCount: 1`,
  `lastExecuted: 1794211702164`. Run 1 persisted with `status: 'failed'`,
  `started_at: 1794211702164`, `finished_at: 1794211712406`.

**Further proofs** (same server, proof script 2):

- All-success workflow (id 2, `dig` + `arp`): `status: 'success'`,
  run 2 `completed`; `dig` → `198.18.9.95`, `arp` → real local ARP table
  header (`Address HWtype HWaddress Flags Mask Iface`), both `exitCode: 0`.
- WMI missing host (id 3, step 1 `{ type: 'wmi', target: '127.0.0.1',
  query: 'SELECT Name FROM Win32_OperatingSystem' }`): step 0 success,
  step 1 `failed` with `WinRM UNREACHABLE: WinRM: cannot reach
  127.0.0.1:5985 (ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5985)`,
  run `failed`.
- SSH refused fast (id 4, `127.0.0.1:2222`): `failed` in 45 ms,
  `runner: SSH failed: connect ECONNREFUSED 127.0.0.1:2222`.
- Stored credential in a step (id 5, Phase 3 proof): step `failed` with
  `step stores a credential field ("password"): credentials must not be
  stored in workflow steps...` — the stored value was never used.
  (Phase 4: the same definition is now refused at create time with 400
  and never stored — see `scripts/workflow-exec-proof.js` case 7.)
- Zero-step workflow (id 6): execute → 400 `invalid_request`, 0 runs
  recorded. Unknown id 99999 → 404 `not_found`.
- Credential-leak check (read-only SQLite query over `workflow_runs.log`
  and `audit_log`): all 5 run logs and all 6 `runner.exec` audit rows
  contain **no** test password — `credentialLeak: false` everywhere.

## Live proof (Phase 4 merge, p4m-winrm) — proof script, not docs-only

The Phase 3 track proved the executor in docs only. The merge adds
`scripts/workflow-exec-proof.js`, which actually executes the executor
against this clone's own server (port 8161, throwaway DB) and records
exact results in `scripts/workflow-exec-proof-results.json`:

- cli `dig` executes for real (real output, exitCode 0, run `completed`).
- cli `rm` is refused by the allow-list (step failed, run `failed`,
  nothing spawned).
- ssh to a closed port fails honestly with the connection error, and
  the next step is recorded `skipped` (stop-at-first-failure).
- wmi without credentials fails honestly (missing credentials).
- wmi with credentials to a closed port fails `WinRM UNREACHABLE
  (ECONNREFUSED 127.0.0.1:5985)`.
- A step storing a `password` is refused at create time with 400 and
  never stored; a pre-existing row carrying one still fails at
  execution time with the stored-credential error (defense in depth).
  The value is never used.
- Zero-step workflow -> 400 with no run recorded; unknown id -> 404.
- Execute without a session -> 401 (admin-only).
- Leak sweep: the runtime test password appears in no response body.

(Exact numbers from the merge run are in the results JSON.)

Merge run (2026-11-09 ~11:28 PKT, own server port 8161, throwaway DB):
**10 pass, 0 fail, 0 blocked.** `dig` -> stdout `198.18.42.236`,
exitCode 0, 194 ms; ssh refusal `connect ECONNREFUSED 127.0.0.1:2222`
in 50 ms; wmi `UNREACHABLE (ECONNREFUSED 127.0.0.1:5985)` in 7 ms;
create-time refusal message `step 0 stores a credential field
("password")...`; leak sweep 0 hits across 20 collected bodies.

## Gaps / what the user must supply

- **No live SSH host was available in this environment** — the `ssh` step
  is proven only as far as reality allows: a missing host fails honestly
  (connection error, run `failed`). A successful SSH step needs a real
  host + per-execution credentials; the runner-service track proved
  `runSsh` against a local throwaway ssh2 test server.
- **No WinRM host exists here** — `wmi` steps are implemented against the
  real WinRM client (proven end-to-end by the winrm-service track against
  an in-process mock WinRM server speaking real HTTP + NTLM + SOAP), but
  no live WinRM call has been made from this track. A live `wmi` step
  needs a WinRM-enabled Windows host + credentials; without them the step
  fails honestly with `WinRM UNREACHABLE`.
- No dry-run endpoint (running the steps is the check; a separate endpoint
  would duplicate the executor). No UI partial — the runner-ui track owns
  the console UI; this track is the executor only.
- `POST /api/workflows/validate` and `create` still accept any step
  objects (they predate the step schema); invalid steps fail honestly at
  execution time. Enforcing the step schema at create time is a
  close-out decision, not done here, so validate/create stay consistent
  with each other.
- No global deadline for a whole workflow run — each step is capped
  (runner 30 s max, WinRM 120 s max), so a many-step workflow can run
  long. Add a run-level timeout in close-out if wanted.
