/**
 * NCM Change Approvals UI — Phase 3 track ncm-ui (client/js/p3/ncm-ui.js).
 *
 * Self-contained partial: it does NOT edit client/js/app.js and does NOT
 * depend on any app.js internal (state, DOM, apiJson, escapeHtml,
 * emptyStateHtml). It defines its own fetch/escape/format helpers, mounts
 * into the same element app.js uses as its workspace (#workspaceContent),
 * and self-registers on window.OpManager when app.js has already loaded.
 *
 * WIRING (to be applied by the close-out agent — this file alone does not
 * change app.js, so the view is not reachable from the nav until then):
 *   1. client/noc.html, directly AFTER the line
 *        <script src="/js/app.js"></script>
 *      add:
 *        <script src="/js/p3/ncm-ui.js"></script>
 *   2. client/js/app.js, in MENU_DEFINITIONS.ccm.subTabs, add the string
 *        'Change Approvals'
 *      (after 'Push Central Baseline').
 *   3. client/js/app.js, at the top of renderCCMView(), next to the
 *      existing 'Compliance Audit' branch, add:
 *        if (state.currentSubTab === 'Change Approvals') {
 *          window.OpManager.renderNcmApprovalsView();
 *          return;
 *        }
 *   4. No change to the window.OpManager export object in app.js is
 *      needed: this file attaches renderNcmApprovalsView itself (see the
 *      registration block at the bottom). The close-out agent only needs
 *      to confirm the function is present on window.OpManager after load.
 *
 * API contract (server/routes/ncm.js, canonical service
 * server/services/ncm.js, settings key 'settings.ncm'):
 *   GET  /api/ncm/approvals?status=pending|approved|rejected|dry-run|executed|all
 *   GET  /api/ncm/approvals/:id
 *   POST /api/ncm/approvals/:id/approve
 *   POST /api/ncm/approvals/:id/reject   { reason }
 *   POST /api/ncm/approvals/:id/execute  { dryRun: true } -> dry-run execute
 *
 * PHASE 4 MERGE (branch p4m-ncm) — rewritten onto the canonical service:
 * execute is a DRY-RUN EXECUTE, not a preview. It runs only on an
 * APPROVED approval (a pending approval answers 409), returns the exact
 * staged commands with dryRun:true / sentToDevice:false, and moves the
 * approval to status 'dry-run' — and a dry-run can be RE-RUN (a second
 * dry-run of the same approval succeeds and still sends nothing).
 * An explicit {"dryRun": false} is refused 422 dry_run_only (the old
 * 501 is gone). Audit actions are ncm.stage / ncm.approve / ncm.reject /
 * ncm.execute.dry-run. Timestamps are ISO strings.
 *
 * Honesty rules enforced here: the detail view shows the EXACT staged
 * diff and commands verbatim (escaped, never reworded); a dry-run shows
 * the exact commands that would be sent under an explicit DRY-RUN banner
 * and never claims anything was sent; an empty pending list renders an
 * honest empty state, never demo rows; server errors are shown with the
 * server's own message.
 */
(function () {
  'use strict';

  var API = '/api/ncm/approvals';
  var WORKSPACE_ID = 'workspaceContent';

  var filter = 'pending'; // 'pending' | 'approved' | 'rejected' | 'all'
  var selectedId = null;
  var selectedApproval = null;
  var lastDryRun = null; // { approvalId, result } for the dry-run panel
  var listCache = [];

  // ------------------------------------------------------------------ utils

  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function displayVal(v) {
    return (v === null || v === undefined || v === '') ? '\u2014' : v;
  }

  function fmtTime(v) {
    if (v === null || v === undefined || v === '') return '\u2014';
    var d = new Date(typeof v === 'number' ? v : v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  }

  // Same contract as app.js apiJson: session cookie, throws Error with the
  // server's own message on HTTP error.
  function apiJson(url, options) {
    var opts = options || {};
    opts.credentials = 'include';
    return fetch(url, opts).then(function (res) {
      var data = null;
      return res.json().catch(function () { return null; }).then(function (parsed) {
        data = parsed;
        if (!res.ok) {
          var err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data || {};
      });
    });
  }

  function workspace() {
    return document.getElementById(WORKSPACE_ID);
  }

  function statusBadge(status) {
    var colors = {
      pending: '#b45309', approved: '#15803d', rejected: '#b91c1c',
      executed: '#1d4ed8', 'dry-run': '#6d28d9'
    };
    var bg = {
      pending: '#fef3c7', approved: '#dcfce7', rejected: '#fee2e2',
      executed: '#dbeafe', 'dry-run': '#ede9fe'
    };
    var s = status || 'pending';
    return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;color:' +
      (colors[s] || '#334155') + ';background:' + (bg[s] || '#f1f5f9') + ';">' + esc(s) + '</span>';
  }

  function emptyStateHtml(label, nextStep) {
    return '' +
      '<div class="me-card" style="padding: 60px 20px; text-align: center;">' +
        '<div style="font-size: 28px;">\uD83D\uDCE5</div>' +
        '<div style="font-size: 16px; font-weight: 700; margin-top: 8px;">' + esc(label) + '</div>' +
        '<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px; max-width: 480px; margin-left: auto; margin-right: auto;">' + esc(nextStep) + '</div>' +
      '</div>';
  }

  function toast(msg, severity) {
    if (window.OpManager && typeof window.OpManager.showAlarmToast === 'function') {
      window.OpManager.showAlarmToast({
        id: 'ncm-' + Date.now(), severity: severity || 'Clear',
        deviceName: 'NCM Approvals', message: msg
      });
    }
  }

  function showStatus(msg, isError) {
    var el = document.getElementById('ncmStatusLine');
    if (!el) return;
    el.style.display = 'block';
    el.style.color = isError ? 'var(--severity-critical)' : 'var(--text-main)';
    el.textContent = msg;
  }

  // ------------------------------------------------------------- list view

  function renderShell() {
    var ws = workspace();
    if (!ws) return false;
    ws.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header">' +
          '<span class="me-card-title">\u2699\uFE0F NCM Change Approvals</span>' +
          '<span style="display:flex;gap:6px;align-items:center;">' +
            '<button class="btn-me-secondary" id="ncmFilterPending">Pending</button>' +
            '<button class="btn-me-secondary" id="ncmFilterApproved">Approved</button>' +
            '<button class="btn-me-secondary" id="ncmFilterDryRun">Dry-run</button>' +
            '<button class="btn-me-secondary" id="ncmFilterRejected">Rejected</button>' +
            '<button class="btn-me-secondary" id="ncmFilterAll">All</button>' +
            '<button class="btn-me-secondary" id="ncmRefreshBtn">\uD83D\uDD04 Refresh</button>' +
          '</span>' +
        '</div>' +
        '<div class="me-card-body">' +
          '<div id="ncmStatusLine" style="display:none;padding:8px 10px;margin-bottom:10px;border:1px solid var(--border-color, #e2e8f0);border-radius:6px;font-size:12px;"></div>' +
          '<div id="ncmListWrap"><div style="text-align:center;color:var(--text-muted);padding:30px;">Loading approvals\u2026</div></div>' +
          '<div id="ncmDetailWrap" style="margin-top:16px;"></div>' +
        '</div>' +
      '</div>';
    var bind = function (id, f) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { setFilter(f); });
    };
    bind('ncmFilterPending', 'pending');
    bind('ncmFilterApproved', 'approved');
    bind('ncmFilterDryRun', 'dry-run');
    bind('ncmFilterRejected', 'rejected');
    bind('ncmFilterAll', 'all');
    var refresh = document.getElementById('ncmRefreshBtn');
    if (refresh) refresh.addEventListener('click', function () { loadApprovals(); });
    return true;
  }

  function markActiveFilter() {
    var map = { pending: 'ncmFilterPending', approved: 'ncmFilterApproved', 'dry-run': 'ncmFilterDryRun', rejected: 'ncmFilterRejected', all: 'ncmFilterAll' };
    Object.keys(map).forEach(function (key) {
      var b = document.getElementById(map[key]);
      if (b) b.classList.toggle('active', key === filter);
    });
  }

  function setFilter(f) {
    filter = f;
    selectedId = null;
    selectedApproval = null;
    lastDryRun = null;
    markActiveFilter();
    loadApprovals();
  }

  function loadApprovals() {
    var wrap = document.getElementById('ncmListWrap');
    if (wrap) wrap.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:30px;">Loading approvals\u2026</div>';
    return apiJson(API + '?status=' + encodeURIComponent(filter))
      .then(function (res) {
        listCache = res.approvals || [];
        renderList(listCache);
        if (selectedId) {
          var stillThere = listCache.some(function (a) { return String(a.id) === String(selectedId); });
          if (stillThere) return selectApproval(selectedId);
          selectedId = null;
          selectedApproval = null;
          renderDetail();
        }
      })
      .catch(function (e) {
        if (wrap) {
          wrap.innerHTML = '<div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--severity-critical);">Couldn\u2019t load approvals \u2014 ' + esc(e.message) + '</div>';
        }
      });
  }

  function renderList(approvals) {
    var wrap = document.getElementById('ncmListWrap');
    if (!wrap) return;
    markActiveFilter();
    if (!approvals.length) {
      if (filter === 'pending') {
        wrap.innerHTML = emptyStateHtml(
          'No pending approvals',
          'Nothing is waiting for review. Stage a config change from NCM backup/drift tooling and it will appear here for approval before anything is sent to a device.'
        );
      } else if (filter === 'all') {
        wrap.innerHTML = emptyStateHtml(
          'No change approvals yet',
          'No config change has been staged for review. Stage a change and it will appear here with its exact diff and commands.'
        );
      } else {
        wrap.innerHTML = emptyStateHtml(
          'No ' + filter + ' approvals',
          'No approval is currently in the ' + filter + ' state. Switch the filter to see other states.'
        );
      }
      return;
    }
    wrap.innerHTML =
      '<div class="me-table-wrap"><table class="me-table"><thead><tr>' +
        '<th>Device</th><th>Action</th><th>Created</th><th>Created By</th><th>Status</th><th></th>' +
      '</tr></thead><tbody>' +
      approvals.map(function (a) {
        var label = a.deviceName || a.deviceIp || ('Device ' + a.deviceId);
        return '<tr data-ncm-id="' + esc(a.id) + '" style="cursor:pointer;' +
          (String(a.id) === String(selectedId) ? 'background: var(--bg-hover, #f8fafc);' : '') + '">' +
          '<td><strong>' + esc(label) + '</strong>' +
            (a.deviceIp && a.deviceName ? '<br><code style="font-size:11px;">' + esc(a.deviceIp) + '</code>' : '') + '</td>' +
          '<td>' + esc(a.action) + '</td>' +
          '<td>' + esc(fmtTime(a.createdAt)) + '</td>' +
          '<td>' + esc(displayVal(a.createdBy)) + '</td>' +
          '<td>' + statusBadge(a.status) + '</td>' +
          '<td><button class="btn-me-secondary ncm-view-btn" data-ncm-id="' + esc(a.id) + '" style="padding: 2px 8px; font-size: 11px;">Review</button></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div>';
    Array.prototype.forEach.call(wrap.querySelectorAll('tr[data-ncm-id]'), function (tr) {
      tr.addEventListener('click', function () { selectApproval(tr.getAttribute('data-ncm-id')); });
    });
  }

  // ----------------------------------------------------------- detail view

  function selectApproval(id) {
    selectedId = id;
    lastDryRun = null;
    renderList(listCache);
    var wrap = document.getElementById('ncmDetailWrap');
    if (wrap) wrap.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Loading approval\u2026</div>';
    return apiJson(API + '/' + encodeURIComponent(id))
      .then(function (res) {
        selectedApproval = res.approval || null;
        renderDetail();
      })
      .catch(function (e) {
        if (wrap) wrap.innerHTML = '<div class="me-card" style="padding: 20px 14px; text-align: center; color: var(--severity-critical);">Couldn\u2019t load approval \u2014 ' + esc(e.message) + '</div>';
      });
  }

  function renderDetail() {
    var wrap = document.getElementById('ncmDetailWrap');
    if (!wrap) return;
    var a = selectedApproval;
    if (!a) { wrap.innerHTML = ''; return; }
    var isPending = a.status === 'pending';
    var commands = Array.isArray(a.commands) ? a.commands : [];
    var diffText = (a.diff === null || a.diff === undefined || a.diff === '') ? '(no diff text staged for this change)' : a.diff;

    var dryRunHtml = '';
    if (lastDryRun && String(lastDryRun.approvalId) === String(a.id)) {
      var r = lastDryRun.result;
      dryRunHtml =
        '<div style="margin-top:14px;border:2px solid #b45309;background:#fffbeb;border-radius:8px;padding:12px;">' +
          '<div style="font-weight:800;color:#92400e;font-size:14px;">\u26A0\uFE0F DRY-RUN \u2014 no commands were sent to the device</div>' +
          '<div style="font-size:12px;color:#78350f;margin-top:4px;">' + esc(r.message || 'Preview only.') + '</div>' +
          '<div style="font-size:12px;color:#78350f;margin-top:4px;">Target: <strong>' + esc(r.deviceName || r.deviceIp || a.deviceName || a.deviceIp || a.deviceId) + '</strong>' +
          (r.deviceIp ? ' (<code>' + esc(r.deviceIp) + '</code>)' : '') +
          ' \u2022 ' + esc(String(r.commandCount != null ? r.commandCount : commands.length)) + ' command(s) that <em>would</em> be sent, in order:</div>' +
          '<pre style="margin:10px 0 0;background:#fff;border:1px solid #fcd34d;border-radius:6px;padding:10px;white-space:pre-wrap;word-break:break-word;font-size:12px;">' +
            esc((r.commands || commands).map(function (c, i) { return (i + 1) + '. ' + c; }).join('\n')) +
          '</pre>' +
        '</div>';
    }

    wrap.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header"><span class="me-card-title">Review: ' + esc(a.action) + '</span>' + statusBadge(a.status) + '</div>' +
        '<div class="me-card-body">' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px 16px;font-size:12px;margin-bottom:12px;">' +
            '<div><strong>Device:</strong> ' + esc(displayVal(a.deviceName || (a.deviceId != null ? 'Device ' + a.deviceId : null))) + (a.deviceIp ? ' (<code>' + esc(a.deviceIp) + '</code>)' : '') + '</div>' +
            '<div><strong>Action:</strong> ' + esc(a.action) + '</div>' +
            '<div><strong>Created:</strong> ' + esc(fmtTime(a.createdAt)) + '</div>' +
            '<div><strong>Created by:</strong> ' + esc(displayVal(a.createdBy)) + '</div>' +
            '<div><strong>Decided by:</strong> ' + esc(displayVal(a.decidedBy)) + '</div>' +
            '<div><strong>Decided at:</strong> ' + esc(fmtTime(a.decidedAt)) + '</div>' +
            (a.status === 'rejected' && a.rejectReason ? '<div><strong>Reject reason:</strong> ' + esc(a.rejectReason) + '</div>' : '') +
          '</div>' +
          '<div style="font-size:12px;font-weight:700;margin:10px 0 4px;">Staged diff (exact)</div>' +
          '<pre id="ncmDiffPre" style="background:var(--bg-code, #0f172a);color:#e2e8f0;border-radius:6px;padding:10px;white-space:pre-wrap;word-break:break-word;font-size:12px;max-height:320px;overflow:auto;">' + esc(diffText) + '</pre>' +
          '<div style="font-size:12px;font-weight:700;margin:14px 0 4px;">Commands to be sent (exact, in order)</div>' +
          '<pre id="ncmCommandsPre" style="background:var(--bg-code, #0f172a);color:#e2e8f0;border-radius:6px;padding:10px;white-space:pre-wrap;word-break:break-word;font-size:12px;">' +
            esc(commands.map(function (c, i) { return (i + 1) + '. ' + c; }).join('\n') || '(no commands staged)') +
          '</pre>' +
          (isPending ?
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center;">' +
              '<button class="btn-me-primary" id="ncmApproveBtn">\u2713 Approve</button>' +
              '<button class="btn-me-secondary" id="ncmRejectBtn">\u2715 Reject</button>' +
              '<button class="btn-me-secondary" id="ncmDryRunBtn">\u25B6 Execute (dry-run)</button>' +
              '<input id="ncmRejectReason" type="text" placeholder="Reject reason (optional)" style="flex:1;min-width:180px;padding:6px 8px;border:1px solid var(--border-color, #e2e8f0);border-radius:6px;font-size:12px;" />' +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Approve/Reject decide this change. Execute (dry-run) needs an approved change first \u2014 a pending approval answers 409. The dry-run sends nothing; the approval moves to status \u2018dry-run\u2019 and the dry-run can be re-run.</div>'
          :
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center;">' +
              '<button class="btn-me-secondary" id="ncmDryRunBtn">\u25B6 Execute (dry-run)</button>' +
              '<span style="font-size:12px;color:var(--text-muted);">' + (a.status === 'dry-run' ? 'Dry-run already performed \u2014 nothing was sent, and it can be re-run.' : a.status === 'approved' ? 'Approved and ready for a dry-run execute \u2014 nothing will be sent.' : 'This approval is ' + esc(a.status) + ' and can no longer be approved or rejected.') + '</span>' +
            '</div>'
          ) +
          dryRunHtml +
        '</div>' +
      '</div>';

    var approveBtn = document.getElementById('ncmApproveBtn');
    if (approveBtn) approveBtn.addEventListener('click', function () { approveApproval(a.id); });
    var rejectBtn = document.getElementById('ncmRejectBtn');
    if (rejectBtn) rejectBtn.addEventListener('click', function () { rejectApproval(a.id); });
    var dryBtn = document.getElementById('ncmDryRunBtn');
    if (dryBtn) dryBtn.addEventListener('click', function () { dryRunExecute(a.id); });
  }

  // -------------------------------------------------------------- actions

  function refreshAfterDecision(actionLabel) {
    showStatus(actionLabel, false);
    toast(actionLabel, 'Clear');
    return loadApprovals();
  }

  function approveApproval(id) {
    if (typeof window.confirm === 'function' && !window.confirm('Approve this change? It will be marked approved for execution.')) return Promise.resolve(false);
    return apiJson(API + '/' + encodeURIComponent(id) + '/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (res) {
        selectedApproval = res.approval || selectedApproval;
        lastDryRun = null;
        return refreshAfterDecision('Approval approved.');
      })
      .catch(function (e) {
        showStatus('Approve failed \u2014 ' + e.message, true);
      });
  }

  function rejectApproval(id) {
    var reasonInput = document.getElementById('ncmRejectReason');
    var reason = reasonInput ? reasonInput.value : '';
    if (typeof window.confirm === 'function' && !window.confirm('Reject this change? It will be marked rejected and cannot be executed.')) return Promise.resolve(false);
    return apiJson(API + '/' + encodeURIComponent(id) + '/reject', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || undefined })
    })
      .then(function (res) {
        selectedApproval = res.approval || selectedApproval;
        lastDryRun = null;
        return refreshAfterDecision('Approval rejected.');
      })
      .catch(function (e) {
        showStatus('Reject failed \u2014 ' + e.message, true);
      });
  }

  function dryRunExecute(id) {
    var btn = document.getElementById('ncmDryRunBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Running dry-run\u2026'; }
    return apiJson(API + '/' + encodeURIComponent(id) + '/execute', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: true })
    })
      .then(function (res) {
        lastDryRun = { approvalId: id, result: res };
        // Canonical semantics: a dry-run execute moves the approval to
        // status 'dry-run' (re-runnable). Reflect it immediately so the
        // badge and the Approve/Reject buttons update without a reload.
        if (selectedApproval && res && res.status) {
          selectedApproval = Object.assign({}, selectedApproval, {
            status: res.status,
            executedBy: res.executedBy !== undefined ? res.executedBy : selectedApproval.executedBy,
            executedAt: res.executedAt !== undefined ? res.executedAt : selectedApproval.executedAt,
            dryRun: true
          });
        }
        renderDetail();
        showStatus('DRY-RUN complete \u2014 no commands were sent.', false);
      })
      .catch(function (e) {
        if (btn) { btn.disabled = false; btn.textContent = '\u25B6 Execute (dry-run)'; }
        showStatus('Dry-run failed \u2014 ' + e.message, true);
      });
  }

  // ---------------------------------------------------------- entry point

  function renderNcmApprovalsView() {
    if (!renderShell()) return;
    markActiveFilter();
    loadApprovals();
  }

  // Public surface: the close-out agent wires renderNcmApprovalsView into
  // app.js renderCCMView() (see header). Self-register on window.OpManager
  // so the wiring is a one-line call, not an export edit.
  window.NcmApprovals = {
    renderNcmApprovalsView: renderNcmApprovalsView,
    loadApprovals: loadApprovals,
    selectApproval: selectApproval,
    approveApproval: approveApproval,
    rejectApproval: rejectApproval,
    dryRunExecute: dryRunExecute,
    setFilter: setFilter
  };
  if (window.OpManager && typeof window.OpManager === 'object') {
    window.OpManager.renderNcmApprovalsView = renderNcmApprovalsView;
    window.OpManager.renderNcmApprovals = renderNcmApprovalsView;
  }
})();
