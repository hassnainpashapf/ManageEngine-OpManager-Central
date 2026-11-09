'use strict';
/**
 * Phase 3 track: runner-ui — tools terminal/CLI + workflow run view UI.
 *
 * WIRING (close-out agent — do NOT edit client/js/app.js in this track):
 *  1. Load this file in client/noc.html immediately AFTER the app.js script
 *     tag:  <script src="/js/p3/runner-ui.js"></script>
 *  2. In client/js/app.js, MENU_DEFINITIONS.settings.subTabs (line 75),
 *     add the strings 'Tools Terminal' and 'Workflow Runs' to the subTabs
 *     array, e.g.:
 *       subTabs: ['Central System Info', 'Workflow Automation',
 *                 'Tools Terminal', 'Workflow Runs', 'Probe Mutual Auth',
 *                 'SNMP / WMI Credentials']
 *  3. In client/js/app.js, renderSettingsView(), add branches BEFORE the
 *     default settings render (same pattern as the existing
 *     'Workflow Automation' branch at line ~3311):
 *       if (state.currentSubTab === 'Tools Terminal') {
 *         window.OpManager.renderRunnerTerminalView();
 *         return;
 *       }
 *       if (state.currentSubTab === 'Workflow Runs') {
 *         window.OpManager.renderWorkflowRunsView();
 *         return;
 *       }
 *  4. In client/js/app.js, add renderRunnerTerminalView and
 *     renderWorkflowRunsView to the window.OpManager export object at the
 *     bottom of the file (near executeWorkflow, line ~4735).
 *  5. OPTIONAL, terminal modal: the existing openTerminal /
 *     sendTerminalCommand in app.js posts { command, hostname } to
 *     /api/tools/terminal-exec and appends res.output, which the real
 *     runner result does not carry. Wire the modal to this partial by
 *     replacing that append with:
 *       window.OpManagerRunnerUi.appendTerminalResult(
 *         DOM.terminalScreenText, res, httpStatus);
 *     (appendTerminalResult handles both the real result shape and the
 *     honest 403/422/501 refusals.) Until that is wired, the modal keeps
 *     its old behaviour; the full-page Tools Terminal view below is the
 *     supported terminal UI.
 *
 * This file is self-contained: it defines its own fetch/escape helpers and
 * only touches window.OpManager (to register the two view renderers) and
 * the #workspaceContent element that app.js renders views into. It never
 * reads or writes app.js internals (state, DOM, apiJson, escapeHtml).
 *
 * Endpoints used (Phase 4 merge — canonical contract, runner-routes):
 *  POST /api/tools/terminal-exec — real, via the safe runner
 *    (server/services/runner.js). Body is FREE TEXT plus a hostname:
 *      { command: '<free-text command string>', hostname?, timeoutMs?,
 *        username?, password?, privateKey?, passphrase?, port? }
 *    Routing is decided by the COMMAND, not by a target field: a local
 *    allow-list command (ping, traceroute, nslookup, dig, arp) runs on
 *    this server via execFile and the command's own host argument is its
 *    target; an exact SSH allow-list string runs over SSH against
 *    `hostname` (defaults to 127.0.0.1 when absent) with per-call
 *    credentials. THIS PARTIAL USED TO SEND SOMETHING ELSE (Phase 3
 *    contract mismatch, fixed in the Phase 4 merge): structured
 *    { target, command, args } for local commands and { target, command,
 *    host, ... } for SSH. That shape is NOT what the route expects — a
 *    local structured call was refused with 400 and an SSH call silently
 *    defaulted its host to 127.0.0.1. This file now builds the free-text
 *    command string from its argument form and sends `hostname`, never
 *    `target`/`args`/`host`.
 *    Success: 200 flat runner result { status:'success', ok, target,
 *      command, argv, stdout, stderr, output, exitCode, signal,
 *      timedOut, error, durationMs, auditId, ... } — `output` mirrors
 *      stdout (else stderr, else the error). A non-zero exit is still
 *      HTTP 200 with ok:false; nothing ran (connect/auth failure,
 *      timeout before exec) is an honest 502.
 *    Refusals (honest, never fake output):
 *      400 { error:'invalid_argument', ... }  missing/empty command, bad args
 *      403 { error:'command_not_allowed', ... }  not on the allow-list
 *      422 { ... }  hostname cannot be resolved
 *      501 { error:'not_implemented' }  Telnet protocol only (no Telnet runner)
 *      502 { error:'runner_error'|'unreachable', ... }  runner unavailable / SSH failure
 *    SSH credentials are sent once per call in the request body and are
 *    NEVER stored by the server (per-call only, never logged/audited);
 *    this UI never persists them anywhere either (no localStorage).
 *  GET  /api/tools/runner-allowed — the canonical allow-list endpoint
 *    (Phase 4 merge decision: ONE path. The runner-ui track's own
 *    /api/runner/allowed and its server/routes/runner.js are NOT merged
 *    — that file said so itself, "the canonical route set belongs to
 *    the runner-routes track". The canonical endpoint returns the flat
 *    shape { status:'success', local:[...], ssh:[...], defaults,
 *    timestamp }; this file also tolerates the old { allowed: {...} }
 *    wrapper. When it answers 404/501 the UI falls back to the
 *    documented allow-list below and says so on screen; execution is
 *    still enforced server-side, so the fallback can never widen access.
 *  GET  /api/workflows/list — stored workflows (real, base route).
 *  GET  /api/workflows/:id/runs — stored runs for a workflow (real, base
 *    route). Run rows carry { id, workflow_id, status, log, started_at,
 *    finished_at }; the `log` column holds the execution record as a JSON
 *    string, INCLUDING the per-step results array (workflow-exec track),
 *    so renderRunSteps parses it and shows real per-step rows when
 *    present. Runs from before the executor existed carry status
 *    'not_implemented' and no per-step data.
 *  POST /api/workflows/execute — real step executor (workflow-exec
 *    track, Phase 4 merge): runs the workflow's steps in order, stops
 *    at the first failure, admin-only. 501 only if the executor
 *    services fail to load on the server.
 *
 * No fake data anywhere: empty stdout/stderr render as "(no output)",
 * never as invented text; a refused command renders the server's exact
 * refusal message and HTTP status.
 */
(function () {
  var EXEC_URL = '/api/tools/terminal-exec';
  var ALLOWED_URL = '/api/tools/runner-allowed';
  var WORKFLOWS_URL = '/api/workflows/list';
  var WORKFLOW_RUNS_URL = function (id) { return '/api/workflows/' + encodeURIComponent(id) + '/runs'; };
  var WORKFLOW_EXECUTE_URL = '/api/workflows/execute';

  // Documented allow-list (server/services/runner.js, runner-service
  // track). Used ONLY as a display fallback when GET /api/tools/runner-allowed
  // is unavailable; the server enforces the real list at execution time.
  var FALLBACK_ALLOWED = {
    local: [
      { command: 'ping', usage: 'ping [-c 1..5] [-W 1..10] <host>', description: 'ICMP reachability probe (single host, bounded count/deadline).' },
      { command: 'traceroute', usage: 'traceroute [-m 1..30] [-w 1..10] <host>', description: 'Path trace to a host. Honest error when the binary is absent.' },
      { command: 'nslookup', usage: 'nslookup <name> [<server>]', description: 'DNS lookup for a name, optionally against a given DNS server.' },
      { command: 'dig', usage: 'dig [+short] <name> [<type>]', description: 'DNS lookup. Types: A AAAA MX TXT NS SOA CNAME PTR.' },
      { command: 'arp', usage: 'arp -n', description: 'Local ARP table (read-only, no arguments accepted).' },
    ],
    ssh: [
      { command: 'show version', description: 'Device software/hardware version (read-only).' },
      { command: 'show interfaces', description: 'Interface status (read-only).' },
      { command: 'show ip interface brief', description: 'IP interface summary (read-only).' },
      { command: 'uptime', description: 'Host uptime and load (read-only).' },
      { command: 'uname -a', description: 'Host kernel/OS identification (read-only).' },
    ],
    defaults: { timeoutMs: 10000, maxTimeoutMs: 30000 },
  };

  // Per-command argument fields for the local transport. `fields` are
  // rendered as inputs; `build` turns their values into the runner's
  // `args` object. Anything the user types that is not on the allow-list
  // is still sendable — the server refuses it with 403 and the refusal
  // renders (see the "disallowed command" proof in the track report).
  var LOCAL_COMMAND_ARGS = {
    ping: {
      fields: [
        { key: 'host', label: 'Host', type: 'text', placeholder: '127.0.0.1 or hostname', required: true },
        { key: 'count', label: 'Count (-c, 1..5)', type: 'number', value: '1', min: 1, max: 5 },
        { key: 'deadline', label: 'Deadline s (-W, 1..10)', type: 'number', value: '2', min: 1, max: 10 },
      ],
    },
    traceroute: {
      fields: [
        { key: 'host', label: 'Host', type: 'text', placeholder: '127.0.0.1 or hostname', required: true },
        { key: 'maxHops', label: 'Max hops (-m, 1..30)', type: 'number', value: '10', min: 1, max: 30 },
        { key: 'wait', label: 'Wait s (-w, 1..10)', type: 'number', value: '2', min: 1, max: 10 },
      ],
    },
    nslookup: {
      fields: [
        { key: 'name', label: 'Name', type: 'text', placeholder: 'example.com', required: true },
        { key: 'server', label: 'DNS server (optional)', type: 'text', placeholder: '8.8.8.8' },
      ],
    },
    dig: {
      fields: [
        { key: 'name', label: 'Name', type: 'text', placeholder: 'example.com', required: true },
        { key: 'type', label: 'Record type (optional)', type: 'select', options: ['', 'A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA', 'CNAME', 'PTR'] },
        { key: 'short', label: 'Short output (+short)', type: 'checkbox', value: '1' },
      ],
    },
    arp: { fields: [] },
  };

  // ---------------------------------------------------------------- helpers
  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtTime(epochMs) {
    if (!epochMs && epochMs !== 0) return '—';
    var d = new Date(Number(epochMs));
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }
  function fmtIso(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
  }
  function fmtDuration(ms) {
    if (ms === undefined || ms === null || !isFinite(Number(ms))) return '—';
    return String(Math.round(Number(ms))) + ' ms';
  }

  // fetch + JSON, throwing an ApiError carrying the HTTP status and the
  // server's own error/message so refusals render exactly, not generically.
  function ApiError(status, code, message) {
    var e = new Error(message || ('HTTP ' + status));
    e.httpStatus = status;
    e.code = code || null;
    return e;
  }
  function apiFetch(url, options) {
    var opts = options || {};
    opts.credentials = 'same-origin';
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(url, opts).then(function (res) {
      return res.text().then(function (text) {
        var body = null;
        try { body = text ? JSON.parse(text) : null; } catch (e) { body = { raw: text }; }
        if (!res.ok) {
          throw ApiError(res.status, body && body.error, (body && (body.message || body.error)) || ('HTTP ' + res.status));
        }
        return body;
      });
    });
  }

  function errorBannerHtml(title, detail) {
    return '<div style="background: rgba(220,38,38,0.08); border: 1px solid var(--severity-critical); border-left: 4px solid var(--severity-critical); border-radius: 4px; padding: 10px 12px; font-size: 12px; color: var(--text-main);">' +
      '<strong>' + esc(title) + '</strong>' +
      (detail ? '<div style="margin-top: 4px; color: var(--text-muted); word-break: break-word;">' + esc(detail) + '</div>' : '') +
      '</div>';
  }
  function infoBannerHtml(text) {
    return '<div style="background: rgba(0,115,230,0.08); border: 1px solid var(--primary); border-left: 4px solid var(--primary); border-radius: 4px; padding: 10px 12px; font-size: 12px; color: var(--text-main);">' + esc(text) + '</div>';
  }
  function emptyStateHtml(title, hint) {
    return '<div style="padding: 26px 14px; text-align: center;">' +
      '<div style="font-size: 14px; font-weight: 700;">' + esc(title) + '</div>' +
      '<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">' + esc(hint) + '</div></div>';
  }

  // ------------------------------------------- pure builders (testable) ---
  // buildTerminalResultHtml(result) — renders a real runner result object
  // ({ ok, target, command, argv, stdout, stderr, truncated, exitCode,
  // signal, timedOut, error, durationMs, startedAt, finishedAt, auditId }).
  // Empty stdout/stderr render as "(no output)" — never invented text.
  // Also tolerates the legacy { output } shape by rendering it as stdout
  // with a note that the exit code was not reported.
  function buildTerminalResultHtml(result) {
    var r = result || {};
    var stdout = r.stdout !== undefined && r.stdout !== null ? String(r.stdout) : (r.output !== undefined && r.output !== null ? String(r.output) : '');
    var stderr = r.stderr !== undefined && r.stderr !== null ? String(r.stderr) : '';
    var exitCode = r.exitCode !== undefined && r.exitCode !== null ? r.exitCode : null;
    var ok = r.ok === true || (exitCode === 0 && !r.timedOut);
    var exitBadge = exitCode === null
      ? '<span class="badge-me clear">exit: n/a</span>'
      : (exitCode === 0
        ? '<span class="badge-me clear" style="background: rgba(34,197,94,0.15); color: #16a34a;">exit: 0</span>'
        : '<span class="badge-me clear" style="background: rgba(220,38,38,0.15); color: #dc2626;">exit: ' + esc(exitCode) + '</span>');
    var statusBadge = ok
      ? '<span class="badge-me clear" style="background: rgba(34,197,94,0.15); color: #16a34a;">OK</span>'
      : '<span class="badge-me clear" style="background: rgba(220,38,38,0.15); color: #dc2626;">FAILED</span>';
    var argvLine = Array.isArray(r.argv) ? r.argv.join(' ') : '';
    var cmdLine = esc(r.command || '') + (argvLine ? ' ' + esc(argvLine) : '');
    var html = '<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px;">' +
      statusBadge + exitBadge +
      '<span class="badge-me clear">target: ' + esc(r.target || '—') + '</span>' +
      '<span class="badge-me clear">duration: ' + esc(fmtDuration(r.durationMs)) + '</span>' +
      (r.timedOut ? '<span class="badge-me clear" style="background: rgba(245,158,11,0.15); color: #b45309;">timed out</span>' : '') +
      (r.truncated ? '<span class="badge-me clear" style="background: rgba(245,158,11,0.15); color: #b45309;">output truncated</span>' : '') +
      '</div>' +
      '<div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;"><code>$ ' + cmdLine + '</code>' +
      (r.startedAt ? ' • started ' + esc(fmtIso(r.startedAt)) : '') +
      (r.signal ? ' • signal ' + esc(r.signal) : '') +
      (r.auditId !== undefined && r.auditId !== null ? ' • audit #' + esc(r.auditId) : '') +
      '</div>';
    if (r.error) {
      html += errorBannerHtml('Command did not complete cleanly', r.error);
    }
    html += '<div style="font-weight: 700; font-size: 11px; margin: 10px 0 4px;">STDOUT</div>' +
      '<pre style="background: #090d16; border: 1px solid #1e293b; color: #e2e8f0; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-word; margin: 0;">' +
      (stdout ? esc(stdout) : '(no output)') + '</pre>' +
      '<div style="font-weight: 700; font-size: 11px; margin: 10px 0 4px;">STDERR</div>' +
      '<pre style="background: #090d16; border: 1px solid #1e293b; color: #fca5a5; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-word; margin: 0;">' +
      (stderr ? esc(stderr) : '(no output)') + '</pre>';
    if (r.output !== undefined && r.output !== null && r.exitCode === undefined) {
      html += '<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Legacy response shape: exit code was not reported by the server.</div>';
    }
    return html;
  }

  // buildTerminalErrorHtml(status, body) — renders an honest refusal: the
  // HTTP status, the server's error code and its exact message.
  function buildTerminalErrorHtml(httpStatus, body) {
    var b = body || {};
    var title = 'Request refused (HTTP ' + esc(httpStatus) + ')';
    if (httpStatus === 403) title = 'Command refused (HTTP 403 — not on the allow-list)';
    if (httpStatus === 422) title = 'Invalid request (HTTP 422)';
    if (httpStatus === 501) title = 'Not implemented (HTTP 501)';
    if (httpStatus === 404) title = 'Endpoint not found (HTTP 404)';
    var detail = b.message || b.error || 'No further detail was returned by the server.';
    if (b.error && b.message && b.error !== b.message) detail = b.error + ': ' + b.message;
    return errorBannerHtml(title, detail);
  }

  // appendTerminalResult(screenEl, resJson, httpStatus) — terminal-modal
  // helper for the close-out wiring (step 5 in the header). `resJson` is
  // the parsed body of POST /api/tools/terminal-exec; `httpStatus` is the
  // response status. Appends the rendered result (or refusal) to the
  // modal's screen element and scrolls it to the bottom.
  function appendTerminalResult(screenEl, resJson, httpStatus) {
    if (!screenEl) return;
    var div = document.createElement('div');
    if (httpStatus >= 200 && httpStatus < 300) {
      var result = (resJson && resJson.result) || resJson || {};
      div.innerHTML = buildTerminalResultHtml(result);
    } else {
      div.innerHTML = buildTerminalErrorHtml(httpStatus, resJson || {});
    }
    screenEl.appendChild(div);
    screenEl.scrollTop = screenEl.scrollHeight;
  }

  function runStatusBadge(status) {
    var s = String(status === undefined || status === null ? '' : status);
    var style = 'background: rgba(100,116,139,0.15); color: #475569;';
    var label = s || 'unknown';
    if (s === 'success' || s === 'completed') { style = 'background: rgba(34,197,94,0.15); color: #16a34a;'; }
    else if (s === 'failed') { style = 'background: rgba(220,38,38,0.15); color: #dc2626;'; }
    else if (s === 'not_implemented') { style = 'background: rgba(245,158,11,0.15); color: #b45309;'; label = 'not_implemented (refused — recorded before the executor existed)'; }
    else if (s === 'running' || s === 'pending') { style = 'background: rgba(14,165,233,0.15); color: #0284c7;'; }
    return '<span class="badge-me clear" style="' + style + '">' + esc(label) + '</span>';
  }

  // renderRunSteps(run, workflowSteps) — per-step results for one run.
  // The workflow-exec executor stores the execution record (including
  // the per-step results array) as JSON in the run's `log` column, so
  // it is parsed out here and rendered as real per-step rows. A run
  // object carrying its own `steps` array is used directly. Runs
  // recorded before the executor existed (status 'not_implemented')
  // carry no per-step data: the workflow's defined steps are listed
  // with the explicit note that no per-step outcome was recorded.
  function renderRunSteps(run, workflowSteps) {
    var steps = (run && Array.isArray(run.steps)) ? run.steps : null;
    if (!steps && run && typeof run.log === 'string' && run.log) {
      try {
        var logged = JSON.parse(run.log);
        if (logged && Array.isArray(logged.steps)) steps = logged.steps;
      } catch (e) { /* not JSON — fall through to the defined steps */ }
    }
    if (steps) {
      if (!steps.length) return '<div style="font-size: 11px; color: var(--text-muted);">This run recorded no steps.</div>';
      return '<div style="display: flex; flex-direction: column; gap: 6px;">' + steps.map(function (st, i) {
        // Executor step shape: { index, type, target, command, query,
        // status: 'success'|'failed'|'skipped', ok, stdout, stderr,
        // exitCode, results, count, error, durationMs }.
        var name = st.type ? (st.type + (st.command ? ': ' + st.command : (st.query ? ': ' + st.query : ''))) : (st.name || st.action || ('Step ' + (i + 1)));
        var stStatus = st.status || st.result || '—';
        var detail = st.error || st.stdout || st.stderr || st.output || st.log || '';
        return '<div style="display: flex; gap: 8px; align-items: center; font-size: 11px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px;">' +
          '<span style="background: var(--primary); color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; flex-shrink: 0;">' + (i + 1) + '</span>' +
          '<span style="font-weight: 700;">' + esc(name) + '</span>' +
          '<span style="color: var(--text-muted);">' + esc(stStatus) + '</span>' +
          (detail ? '<span style="color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + esc(String(detail).split('\n')[0]) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>';
    }
    var defined = Array.isArray(workflowSteps) ? workflowSteps : [];
    if (!defined.length) return '<div style="font-size: 11px; color: var(--text-muted);">This workflow defines no steps.</div>';
    return '<div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Defined steps — this run recorded no per-step outcomes (runs recorded before the step executor existed carry only a status and a log).</div>' +
      '<div style="display: flex; flex-direction: column; gap: 6px;">' + defined.map(function (st, i) {
        var label = '';
        if (st && typeof st === 'object') {
          label = st.action || st.name || st.type || JSON.stringify(st);
        } else {
          label = String(st);
        }
        return '<div style="display: flex; gap: 8px; align-items: center; font-size: 11px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px;">' +
          '<span style="background: var(--primary); color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; flex-shrink: 0;">' + (i + 1) + '</span>' +
          '<span>' + esc(label) + '</span>' +
          '<span style="color: var(--text-muted);">outcome not recorded</span></div>';
      }).join('') + '</div>';
  }

  function buildRunRowHtml(run, workflowSteps) {
    var r = run || {};
    var started = r.started_at !== undefined && r.started_at !== null ? r.started_at : null;
    var finished = r.finished_at !== undefined && r.finished_at !== null ? r.finished_at : null;
    var dur = (started !== null && finished !== null) ? fmtDuration(finished - started) : '—';
    return '<div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">' +
      '<div><span style="font-weight: 800; font-size: 13px;">Run #' + esc(r.id) + '</span> ' + runStatusBadge(r.status) + '</div>' +
      '<div style="font-size: 11px; color: var(--text-muted);">started ' + esc(fmtTime(started)) + ' • finished ' + esc(fmtTime(finished)) + ' • duration ' + esc(dur) + '</div>' +
      '</div>' +
      '<div style="margin-top: 10px;">' + renderRunSteps(r, workflowSteps) + '</div>' +
      '<div style="font-weight: 700; font-size: 11px; margin: 10px 0 4px;">Run log</div>' +
      '<pre style="background: #090d16; border: 1px solid #1e293b; color: #4ade80; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-word; margin: 0;">' +
      (r.log ? esc(r.log) : '(no log recorded for this run)') + '</pre>' +
      '</div>';
  }

  function buildWorkflowRunsHtml(workflow, runs) {
    if (!workflow) return emptyStateHtml('No workflow selected', 'Create a workflow first — the list is empty until an admin creates one via POST /api/workflows/create.');
    var list = Array.isArray(runs) ? runs : [];
    var head = '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">' +
      '<div><div style="font-weight: 800; font-size: 13px;">' + esc(workflow.name || ('Workflow #' + workflow.id)) + '</div>' +
      '<div style="font-size: 11px; color: var(--text-muted);">Executed ' + esc(workflow.executionCount === undefined || workflow.executionCount === null ? '—' : workflow.executionCount) + ' times' +
      (workflow.lastExecuted ? ' • last ' + esc(fmtTime(workflow.lastExecuted)) : ' • never executed') + '</div></div>' +
      '<span>' + runStatusBadge(workflow.status) + '</span></div>';
    if (!list.length) return head + emptyStateHtml('No runs recorded yet', 'Run the workflow once — refused attempts are recorded too, with status not_implemented.');
    return head + '<div style="display: flex; flex-direction: column; gap: 12px;">' +
      list.map(function (run) { return buildRunRowHtml(run, workflow.steps); }).join('') + '</div>';
  }

  // ------------------------------------------------------- terminal view ---
  var terminalState = {
    allowed: null,           // GET /api/tools/runner-allowed result, or null
    allowedFromServer: false,
    transport: 'local',
    recent: [],              // in-memory only, never persisted
  };

  function allowedForTransport() {
    var list = terminalState.allowed || FALLBACK_ALLOWED;
    return terminalState.transport === 'ssh' ? (list.ssh || []) : (list.local || []);
  }

  function localArgFieldsHtml(command) {
    var spec = LOCAL_COMMAND_ARGS[command];
    if (!spec) {
      return '<div style="font-size: 11px; color: var(--text-muted);">No argument form for this command. It will be sent as-is and the server will refuse it if it is not on the allow-list.</div>';
    }
    if (!spec.fields.length) return '<div style="font-size: 11px; color: var(--text-muted);">This command takes no arguments.</div>';
    return spec.fields.map(function (f) {
      if (f.type === 'select') {
        return '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">' + esc(f.label) +
          '<select id="runner-arg-' + esc(f.key) + '" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);">' +
          f.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o === '' ? '(none)' : o) + '</option>'; }).join('') +
          '</select></label>';
      }
      if (f.type === 'checkbox') {
        return '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;"><input type="checkbox" id="runner-arg-' + esc(f.key) + '" checked> ' + esc(f.label) + '</label>';
      }
      return '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">' + esc(f.label) +
        '<input id="runner-arg-' + esc(f.key) + '" type="' + esc(f.type) + '"' +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
        (f.value !== undefined ? ' value="' + esc(f.value) + '"' : '') +
        (f.min !== undefined ? ' min="' + esc(f.min) + '"' : '') +
        (f.max !== undefined ? ' max="' + esc(f.max) + '"' : '') +
        ' style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);"></label>';
    }).join('');
  }

  function refreshCommandForm() {
    var cmdInput = $('runner-command');
    var cmd = cmdInput ? cmdInput.value.trim().split(/\s+/)[0] : '';
    var transport = terminalState.transport;
    var cmdKnown = transport === 'local'
      ? Object.prototype.hasOwnProperty.call(LOCAL_COMMAND_ARGS, cmd)
      : allowedForTransport().some(function (e) { return e.command === cmd; });
    var hint = $('runner-command-hint');
    if (hint) {
      hint.textContent = !cmd ? 'Pick or type a command. Only allow-listed commands run; anything else is refused by the server.'
        : cmdKnown ? 'Allow-listed command — the server will run it.'
        : 'Not on the allow-list — the server will refuse it with HTTP 403 and the refusal will be shown below.';
    }
    var localArgs = $('runner-local-args');
    if (localArgs) {
      localArgs.innerHTML = transport === 'local' ? localArgFieldsHtml(cmd) : '';
      localArgs.style.display = transport === 'local' ? '' : 'none';
    }
    var sshFields = $('runner-ssh-fields');
    if (sshFields) sshFields.style.display = transport === 'ssh' ? '' : 'none';
    var datalist = $('runner-command-list');
    if (datalist) {
      datalist.innerHTML = allowedForTransport().map(function (e) {
        return '<option value="' + esc(e.command) + '"></option>';
      }).join('');
    }
  }

  // Build the FREE-TEXT command string the route expects
  // (runner-routes parseLocalCommand), from the typed command + the
  // argument form. The route parses this string itself; sending the old
  // structured { target, command, args } shape would be refused. When
  // the user already typed a full command line (it contains whitespace),
  // it is sent as-is — the server is the allow-list authority either way.
  function buildLocalCommand(first, command, args) {
    if (/\s/.test(command)) return command;
    switch (first) {
      case 'ping': {
        if (args.host === undefined) return null;
        var s = 'ping';
        if (args.count !== undefined) s += ' -c ' + args.count;
        if (args.deadline !== undefined) s += ' -W ' + args.deadline;
        return s + ' ' + args.host;
      }
      case 'traceroute': {
        if (args.host === undefined) return null;
        var t = 'traceroute';
        if (args.maxHops !== undefined) t += ' -m ' + args.maxHops;
        if (args.wait !== undefined) t += ' -w ' + args.wait;
        return t + ' ' + args.host;
      }
      case 'nslookup': {
        if (args.name === undefined) return null;
        return 'nslookup ' + args.name + (args.server ? ' ' + args.server : '');
      }
      case 'dig': {
        if (args.name === undefined) return null;
        var d = 'dig';
        if (args.short) d += ' +short';
        d += ' ' + args.name;
        if (args.type) d += ' ' + args.type;
        return d;
      }
      case 'arp':
        return 'arp -n';
      default:
        return command;
    }
  }

  function collectTerminalRequest() {
    var transport = terminalState.transport;
    var cmdInput = $('runner-command');
    var command = cmdInput ? cmdInput.value.trim() : '';
    if (!command) return { error: 'Enter a command first.' };
    if (transport === 'local') {
      var first = command.split(/\s+/)[0];
      var spec = LOCAL_COMMAND_ARGS[first];
      var args = {};
      if (spec) {
        for (var i = 0; i < spec.fields.length; i++) {
          var f = spec.fields[i];
          var el = $('runner-arg-' + f.key);
          if (!el) continue;
          if (f.type === 'checkbox') { args[f.key] = el.checked; continue; }
          var v = (el.value || '').trim();
          if (v === '') continue;
          if (f.type === 'number') { var n = Number(v); if (isFinite(n)) args[f.key] = n; }
          else args[f.key] = v;
        }
        // The host/name field is required by every local command except arp.
        if (first !== 'arp' && (args.host === undefined && args.name === undefined)) {
          return { error: 'A host or name is required for ' + first + '.' };
        }
      }
      var freeText = buildLocalCommand(first, command, args);
      if (!freeText) return { error: 'A host or name is required for ' + first + '.' };
      // Canonical contract: free-text `command` + `hostname`. No `target`,
      // no `args` — the route parses the command string itself.
      return { body: {
        command: freeText,
        hostname: args.host !== undefined ? args.host : (args.name !== undefined ? args.name : ''),
        timeoutMs: 10000
      } };
    }
    // SSH: the exact allow-list string + `hostname`. NOT `host`: the
    // route reads `hostname` and silently defaults a missing one to
    // 127.0.0.1, which would run the command against the wrong target.
    var host = ($('runner-ssh-host') || {}).value || '';
    var port = ($('runner-ssh-port') || {}).value || '';
    var username = ($('runner-ssh-user') || {}).value || '';
    var password = ($('runner-ssh-pass') || {}).value || '';
    var privateKey = ($('runner-ssh-key') || {}).value || '';
    if (!host.trim()) return { error: 'Enter the SSH host first.' };
    if (!username.trim()) return { error: 'Enter the SSH username first.' };
    if (!password && !privateKey.trim()) return { error: 'Enter a password or paste a private key — credentials are sent once per call and never stored.' };
    var sshBody = {
      command: command,
      hostname: host.trim(),
      port: port ? Number(port) : 22,
      username: username.trim(),
      timeoutMs: 10000
    };
    if (password) sshBody.password = password;
    if (privateKey.trim()) sshBody.privateKey = privateKey.trim();
    return { body: sshBody };
  }

  function runTerminalCommand() {
    var out = $('runner-output');
    var btn = $('runner-run-btn');
    var collected = collectTerminalRequest();
    if (collected.error) {
      if (out) out.innerHTML = errorBannerHtml('Cannot run yet', collected.error);
      return;
    }
    if (btn) btn.disabled = true;
    if (out) out.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">Running…</div>';
    apiFetch(EXEC_URL, { method: 'POST', body: JSON.stringify(collected.body) })
      .then(function (data) {
        var result = (data && data.result) || data || {};
        if (out) out.innerHTML = buildTerminalResultHtml(result);
        terminalState.recent.unshift({
          at: new Date().toISOString(),
          target: terminalState.transport,
          command: collected.body.command,
          exitCode: result.exitCode !== undefined ? result.exitCode : null,
          ok: result.ok === true || result.exitCode === 0,
          durationMs: result.durationMs,
        });
        if (terminalState.recent.length > 10) terminalState.recent.length = 10;
        renderRecentRuns();
      })
      .catch(function (e) {
        if (out) {
          var body = { error: e.code || null, message: e.message };
          out.innerHTML = buildTerminalErrorHtml(e.httpStatus || 0, body);
        }
        terminalState.recent.unshift({
          at: new Date().toISOString(),
          target: terminalState.transport,
          command: collected.body.command,
          exitCode: null,
          ok: false,
          durationMs: null,
          refused: e.httpStatus || null,
        });
        if (terminalState.recent.length > 10) terminalState.recent.length = 10;
        renderRecentRuns();
      })
      .then(function () { if (btn) btn.disabled = false; });
  }

  function renderRecentRuns() {
    var el = $('runner-recent');
    if (!el) return;
    if (!terminalState.recent.length) {
      el.innerHTML = '<div style="font-size: 11px; color: var(--text-muted);">No commands run yet in this view. Recent runs are kept in memory only and never persisted.</div>';
      return;
    }
    el.innerHTML = terminalState.recent.map(function (r) {
      var badge = r.ok
        ? '<span class="badge-me clear" style="background: rgba(34,197,94,0.15); color: #16a34a;">exit ' + esc(r.exitCode) + '</span>'
        : (r.refused ? '<span class="badge-me clear" style="background: rgba(245,158,11,0.15); color: #b45309;">refused HTTP ' + esc(r.refused) + '</span>'
          : '<span class="badge-me clear" style="background: rgba(220,38,38,0.15); color: #dc2626;">exit ' + esc(r.exitCode === null ? 'n/a' : r.exitCode) + '</span>');
      return '<div style="display: flex; gap: 8px; align-items: center; font-size: 11px; padding: 6px 0; border-bottom: 1px solid var(--border-color);">' +
        '<code>' + esc(r.target) + ': ' + esc(r.command) + '</code>' + badge +
        '<span style="color: var(--text-muted); margin-left: auto;">' + esc(fmtIso(r.at)) + (r.durationMs !== null && r.durationMs !== undefined ? ' • ' + esc(fmtDuration(r.durationMs)) : '') + '</span></div>';
    }).join('');
  }

  function renderAllowedPanel() {
    var el = $('runner-allowed');
    if (!el) return;
    var list = terminalState.allowed || FALLBACK_ALLOWED;
    var note = terminalState.allowedFromServer
      ? 'Allow-list loaded from the server — this is exactly what the server will enforce.'
      : 'Server allow-list unavailable (GET /api/tools/runner-allowed did not answer) — showing the documented allow-list. Execution is still enforced server-side, so this fallback can never widen access.';
    el.innerHTML = '<div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">' + esc(note) + '</div>' +
      '<div style="font-weight: 700; font-size: 11px; margin-bottom: 4px;">Local (runs on this server)</div>' +
      (list.local || []).map(function (e) {
        return '<div style="font-size: 11px; padding: 4px 0; border-bottom: 1px solid var(--border-color);"><code>' + esc(e.usage || e.command) + '</code><div style="color: var(--text-muted);">' + esc(e.description || '') + '</div></div>';
      }).join('') +
      '<div style="font-weight: 700; font-size: 11px; margin: 10px 0 4px;">SSH (exact strings only, no arguments)</div>' +
      (list.ssh || []).map(function (e) {
        return '<div style="font-size: 11px; padding: 4px 0; border-bottom: 1px solid var(--border-color);"><code>' + esc(e.command) + '</code><div style="color: var(--text-muted);">' + esc(e.description || '') + '</div></div>';
      }).join('');
  }

  function renderRunnerTerminalView() {
    var workspace = document.getElementById('workspaceContent');
    if (!workspace) return;
    workspace.innerHTML =
      '<div class="me-card">' +
      '<div class="me-card-header"><div style="display: flex; align-items: center; gap: 8px;">' +
      '<span class="me-card-title">💻 Tools Terminal</span>' +
      '<span class="badge-me clear" style="font-size: 10px;">Allow-listed commands only — no shell</span>' +
      '</div></div>' +
      '<div class="me-card-body">' +
      '<p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">Run a diagnostic command on this server (local) or a read-only command on a remote host over SSH. Only the commands on the allow-list run; anything else is refused by the server and the refusal is shown. SSH credentials are sent once per call and are never stored.</p>' +
      '<div style="display: grid; grid-template-columns: 340px 1fr; gap: 16px; align-items: start;">' +
      '<div>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">Transport' +
      '<select id="runner-transport" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);">' +
      '<option value="local">Local — run on this server</option>' +
      '<option value="ssh">SSH — run on a remote host</option>' +
      '</select></label>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 4px;">Command' +
      '<input id="runner-command" list="runner-command-list" type="text" placeholder="ping" autocomplete="off" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);">' +
      '<datalist id="runner-command-list"></datalist></label>' +
      '<div id="runner-command-hint" style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;"></div>' +
      '<div id="runner-local-args"></div>' +
      '<div id="runner-ssh-fields" style="display: none;">' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">Host' +
      '<input id="runner-ssh-host" type="text" placeholder="192.168.30.2" autocomplete="off" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);"></label>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">Port' +
      '<input id="runner-ssh-port" type="number" value="22" min="1" max="65535" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);"></label>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">Username' +
      '<input id="runner-ssh-user" type="text" placeholder="admin" autocomplete="off" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);"></label>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">Password (per-call only, never stored)' +
      '<input id="runner-ssh-pass" type="password" autocomplete="off" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main);"></label>' +
      '<label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 8px;">…or private key (per-call only, never stored)' +
      '<textarea id="runner-ssh-key" rows="3" autocomplete="off" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" style="display: block; width: 100%; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main); font-family: monospace; font-size: 11px;"></textarea></label>' +
      '</div>' +
      '<button id="runner-run-btn" class="btn-me-primary" style="margin-top: 4px;">▶ Run command</button>' +
      '<div style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">Timeout: 10 s (server maximum 30 s). Output is capped at 1 MB by the server.</div>' +
      '</div>' +
      '<div>' +
      '<div id="runner-output">' + emptyStateHtml('No command run yet', 'Pick a transport and a command, then press Run. Real stdout, stderr and the exit code appear here.') + '</div>' +
      '<div style="font-weight: 700; font-size: 12px; margin: 18px 0 6px;">Recent runs (this view only)</div>' +
      '<div id="runner-recent"></div>' +
      '<div style="font-weight: 700; font-size: 12px; margin: 18px 0 6px;">Allow-list</div>' +
      '<div id="runner-allowed"><div style="font-size: 11px; color: var(--text-muted);">Loading allow-list…</div></div>' +
      '</div>' +
      '</div>' +
      '</div></div>';

    var transportSel = $('runner-transport');
    transportSel.value = terminalState.transport;
    transportSel.addEventListener('change', function () {
      terminalState.transport = transportSel.value;
      var cmd = $('runner-command');
      if (cmd) cmd.value = '';
      refreshCommandForm();
    });
    $('runner-command').addEventListener('input', refreshCommandForm);
    $('runner-run-btn').addEventListener('click', runTerminalCommand);
    $('runner-command').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); runTerminalCommand(); }
    });
    renderRecentRuns();
    refreshCommandForm();
    apiFetch(ALLOWED_URL)
      .then(function (data) {
        if (data && data.allowed) {
          terminalState.allowed = data.allowed;
          terminalState.allowedFromServer = true;
        } else if (data && (data.local || data.ssh)) {
          // Canonical /api/tools/runner-allowed: flat { local, ssh, defaults }.
          terminalState.allowed = { local: data.local || [], ssh: data.ssh || [], defaults: data.defaults || null };
          terminalState.allowedFromServer = true;
        }
      })
      .catch(function () { /* fallback list below, with the note */ })
      .then(function () { renderAllowedPanel(); refreshCommandForm(); });
  }

  // --------------------------------------------------- workflow runs view ---
  var workflowRunsState = {
    workflows: [],
    selectedId: null,
    loading: false,
  };

  function loadWorkflowRunsIntoView() {
    var box = $('runner-wf-runs');
    var id = workflowRunsState.selectedId;
    if (!box || !id) return;
    box.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">Loading runs…</div>';
    apiFetch(WORKFLOW_RUNS_URL(id))
      .then(function (data) {
        var wf = null;
        for (var i = 0; i < workflowRunsState.workflows.length; i++) {
          if (String(workflowRunsState.workflows[i].id) === String(id)) { wf = workflowRunsState.workflows[i]; break; }
        }
        box.innerHTML = buildWorkflowRunsHtml(wf, (data && data.runs) || []);
      })
      .catch(function (e) {
        box.innerHTML = buildTerminalErrorHtml(e.httpStatus || 0, { error: e.code || null, message: e.message });
      });
  }

  function executeSelectedWorkflow() {
    var id = workflowRunsState.selectedId;
    var notice = $('runner-wf-notice');
    var btn = $('runner-wf-run-btn');
    if (!id) return;
    if (btn) btn.disabled = true;
    if (notice) notice.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">Running workflow…</div>';
    apiFetch(WORKFLOW_EXECUTE_URL, { method: 'POST', body: JSON.stringify({ workflowId: id }) })
      .then(function (data) {
        if (notice) notice.innerHTML = infoBannerHtml('Workflow executed. ' + ((data && data.logs) ? 'See the new run below.' : 'See the new run below.'));
        loadWorkflowRunsIntoView();
      })
      .catch(function (e) {
        // A 501 means the executor services failed to load on the server
        // (execute fails closed, nothing ran, no run recorded): refresh
        // the list and say so instead of treating it as a transport failure.
        if (e.httpStatus === 501) {
          if (notice) notice.innerHTML = buildTerminalErrorHtml(501, { error: 'executor_unavailable', message: e.message });
        } else if (notice) {
          notice.innerHTML = buildTerminalErrorHtml(e.httpStatus || 0, { error: e.code || null, message: e.message });
        }
        loadWorkflowRunsIntoView();
      })
      .then(function () { if (btn) btn.disabled = false; });
  }

  function renderWorkflowRunsView() {
    var workspace = document.getElementById('workspaceContent');
    if (!workspace) return;
    workspace.innerHTML =
      '<div class="me-card">' +
      '<div class="me-card-header"><div style="display: flex; align-items: center; gap: 8px;">' +
      '<span class="me-card-title">⚡ Workflow Runs</span>' +
      '<span class="badge-me clear" style="font-size: 10px;">Per-step results + status, from stored runs</span>' +
      '</div>' +
      '<button id="runner-wf-refresh-btn" class="btn-me-secondary" style="padding: 4px 10px; font-size: 11px;">↻ Refresh</button>' +
      '</div>' +
      '<div class="me-card-body">' +
      '<p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">Every recorded run for the selected workflow, most recent first. Each run shows its status, start/finish times, its per-step outcomes (the executor stores them in the run log), and the stored log verbatim. Runs recorded before the executor existed carry only a status and a log, and the view says so rather than inventing per-step outcomes for them.</p>' +
      '<div style="display: flex; gap: 8px; align-items: end; flex-wrap: wrap; margin-bottom: 12px;">' +
      '<label style="font-size: 11px; font-weight: 700;">Workflow' +
      '<select id="runner-wf-select" style="display: block; margin-top: 4px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-main); min-width: 240px;"><option value="">Loading workflows…</option></select></label>' +
      '<button id="runner-wf-run-btn" class="btn-me-primary" style="padding: 6px 14px;">⚡ Run now</button>' +
      '</div>' +
      '<div id="runner-wf-notice" style="margin-bottom: 12px;"></div>' +
      '<div id="runner-wf-runs">' + emptyStateHtml('Loading workflows…', '') + '</div>' +
      '</div></div>';

    var select = $('runner-wf-select');
    var refreshBtn = $('runner-wf-refresh-btn');
    function fillSelect() {
      if (!workflowRunsState.workflows.length) {
        select.innerHTML = '<option value="">No workflows stored yet</option>';
        $('runner-wf-runs').innerHTML = emptyStateHtml('No workflows stored yet', 'Workflows come only from the store — an admin creates one via POST /api/workflows/create. Nothing is seeded.');
        return;
      }
      select.innerHTML = workflowRunsState.workflows.map(function (w) {
        return '<option value="' + esc(w.id) + '"' + (String(w.id) === String(workflowRunsState.selectedId) ? ' selected' : '') + '>' + esc(w.name || ('Workflow #' + w.id)) + '</option>';
      }).join('');
    }
    select.addEventListener('change', function () {
      workflowRunsState.selectedId = select.value || null;
      loadWorkflowRunsIntoView();
    });
    $('runner-wf-run-btn').addEventListener('click', executeSelectedWorkflow);
    refreshBtn.addEventListener('click', function () {
      loadWorkflows();
      loadWorkflowRunsIntoView();
    });
    function loadWorkflows() {
      apiFetch(WORKFLOWS_URL)
        .then(function (data) {
          workflowRunsState.workflows = (data && data.workflows) || [];
          if (!workflowRunsState.selectedId && workflowRunsState.workflows.length) {
            workflowRunsState.selectedId = workflowRunsState.workflows[0].id;
          }
          fillSelect();
          loadWorkflowRunsIntoView();
        })
        .catch(function (e) {
          $('runner-wf-runs').innerHTML = buildTerminalErrorHtml(e.httpStatus || 0, { error: e.code || null, message: e.message });
        });
    }
    loadWorkflows();
  }

  // ------------------------------------------------------------- register ---
  function register() {
    if (window.OpManager) {
      window.OpManager.renderRunnerTerminalView = renderRunnerTerminalView;
      window.OpManager.renderWorkflowRunsView = renderWorkflowRunsView;
    }
    window.OpManagerRunnerUi = {
      renderRunnerTerminalView: renderRunnerTerminalView,
      renderWorkflowRunsView: renderWorkflowRunsView,
      buildTerminalResultHtml: buildTerminalResultHtml,
      buildTerminalErrorHtml: buildTerminalErrorHtml,
      appendTerminalResult: appendTerminalResult,
      buildWorkflowRunsHtml: buildWorkflowRunsHtml,
      buildRunRowHtml: buildRunRowHtml,
      renderRunSteps: renderRunSteps,
    };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    register();
  }
})();
