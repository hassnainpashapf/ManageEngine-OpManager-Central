'use strict';
/**
 * Phase 3 track: winrm-ui — WMI query tool UI (WQL over WinRM).
 *
 * WIRING (close-out agent — do NOT edit client/js/app.js in this track):
 *  1. Load this file in client/noc.html immediately AFTER the app.js script
 *     tag (line ~743: <script src="/js/app.js"></script>):
 *       <script src="/js/p3/winrm-ui.js"></script>
 *  2. In client/js/app.js, dashboard render, "Quick Diagnostic Tools"
 *     widget (~line 1198-1213, next to the ICMP Ping / MIB Browser /
 *     CLI Terminal / Port Mapper buttons), add a fifth button:
 *       <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;"
 *               onclick="window.OpManager.openWmiQueryTool()">
 *         🪟 WMI Query
 *       </button>
 *  3. In client/js/app.js, add openWmiQueryTool and runWmiQuery to the
 *     window.OpManager export object (~line 4709, next to openMibBrowser /
 *     executeMibGet / executeMibWalk).
 *
 * This file is self-contained: it defines its own fetch/escape helpers and
 * only touches window.OpManager (to register openWmiQueryTool/runWmiQuery)
 * and the #workspaceContent element that app.js renders views into. It never
 * reads or writes app.js internals (state, DOM, apiJson, escapeHtml).
 *
 * Endpoint used (real; already in server/routes/tools.js on the real-data
 * branch — the winrm-route track owns the live implementation):
 *  POST /api/tools/wmi-query
 *    Request body: { host, username, password, namespace, query }
 *    Success (real WinRM/WMI query): { status: 'success', rows: [ {...}, ... ] }
 *      — rows are plain objects; table columns are the union of keys across
 *        all rows, in first-seen order. An empty rows array is rendered as
 *        "query succeeded, 0 rows returned", never as fabricated rows.
 *    Failure: HTTP error with { status: 'error', error, message }.
 *    TODAY (tip ff51df6) the endpoint answers an honest HTTP 501
 *    { error: 'not_implemented' } — no WMI/WinRM client exists on the server
 *    yet, so no query is executed against the host. This UI renders that
 *    501 message verbatim and sends nothing else; it works unchanged once
 *    the winrm-route track lands the real client, provided the route keeps
 *    this request/response contract.
 *
 * CREDENTIAL SAFETY (hard rule — never weaken):
 *  - The password lives only in the <input type="password"> element and in
 *    the single POST request body. It is NEVER written into rendered HTML,
 *    NEVER written to localStorage/sessionStorage, NEVER console.log'd, and
 *    NEVER included in any error/status text. The server's response is
 *    rendered from its own message/rows fields only.
 *  - "Clear credentials" blanks the username/password inputs. Nothing in
 *    this file persists credentials anywhere.
 */
(function () {
  var API_WMI_QUERY = '/api/tools/wmi-query';
  var DEFAULT_NAMESPACE = 'root\\cimv2';
  var DEFAULT_QUERY = 'SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor';
  var MAX_RENDER_ROWS = 500;

  // ---------------------------------------------------------------- helpers
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function $(id) { return document.getElementById(id); }

  function val(id) {
    var el = $(id);
    return el ? (el.value || '').trim() : '';
  }

  // POST JSON with the session cookie. On HTTP error, throw an Error carrying
  // the server's own message plus .status and .data, so the UI can report
  // the real outcome (including the honest 501 not-implemented state).
  // The request body is never logged.
  function wmiPost(url, body) {
    return fetch(url, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON body */ }
        if (!res.ok) {
          var err = new Error((data && (data.message || data.error)) || ('Request failed: HTTP ' + res.status));
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data || {};
      });
    });
  }

  // ------------------------------------------------------------------- view
  function openWmiQueryTool(prefill) {
    var ws = $('workspaceContent');
    if (!ws) return;
    var p = prefill || {};
    ws.innerHTML =
      '<div style="padding: 16px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">' +
          '<h2 style="margin: 0; font-size: 18px;">🪟 WMI Query Tool</h2>' +
          '<span class="badge-me clear">WinRM / WQL</span>' +
        '</div>' +
        '<p style="font-size: 12px; color: var(--text-muted); margin: 0 0 14px;">' +
          'Runs a WQL query against a Windows host over WinRM and renders the rows it returns. ' +
          'Credentials are sent only in the request body for this one query — they are never stored, ' +
          'never displayed, and never logged. ' +
          'Until the WinRM client lands on the server, the endpoint answers an honest 501 and no query runs.' +
        '</p>' +
        '<div class="me-card" style="margin-bottom: 12px;">' +
          '<div class="me-card-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">' +
            '<div>' +
              '<label style="font-size: 11px; font-weight: 700;">Host *</label>' +
              '<input id="wmi-host" type="text" class="form-control-me" placeholder="192.168.22.10 or hostname" value="' + esc(p.host || '') + '" autocomplete="off">' +
            '</div>' +
            '<div>' +
              '<label style="font-size: 11px; font-weight: 700;">Namespace</label>' +
              '<input id="wmi-namespace" type="text" class="form-control-me" value="' + esc(p.namespace || DEFAULT_NAMESPACE) + '" autocomplete="off">' +
            '</div>' +
            '<div>' +
              '<label style="font-size: 11px; font-weight: 700;">Username *</label>' +
              '<input id="wmi-username" type="text" class="form-control-me" placeholder="DOMAIN\\user or user" value="' + esc(p.username || '') + '" autocomplete="off">' +
            '</div>' +
            '<div>' +
              '<label style="font-size: 11px; font-weight: 700;">Password</label>' +
              '<input id="wmi-password" type="password" class="form-control-me" placeholder="Windows password (never displayed or stored)" autocomplete="off">' +
            '</div>' +
            '<div style="grid-column: 1 / -1;">' +
              '<label style="font-size: 11px; font-weight: 700;">WQL query *</label>' +
              '<textarea id="wmi-query" class="form-control-me" rows="3" style="font-family: monospace; resize: vertical;">' + esc(p.query || DEFAULT_QUERY) + '</textarea>' +
            '</div>' +
            '<div style="grid-column: 1 / -1; display: flex; gap: 8px; align-items: center;">' +
              '<button class="btn-me-primary" onclick="window.OpManager.runWmiQuery()">▶ Run query</button>' +
              '<button class="btn-me-secondary" onclick="window.OpManager.clearWmiCredentials()">Clear credentials</button>' +
              '<span id="wmi-status" style="font-size: 11px; color: var(--text-muted);"></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="wmi-results"></div>' +
      '</div>';
    var hostEl = $('wmi-host');
    if (hostEl) hostEl.focus();
  }

  function clearWmiCredentials() {
    var u = $('wmi-username');
    var p = $('wmi-password');
    if (u) u.value = '';
    if (p) p.value = '';
    var s = $('wmi-status');
    if (s) s.textContent = 'Credentials cleared from the form.';
  }

  function setStatus(text, isError) {
    var s = $('wmi-status');
    if (!s) return;
    s.textContent = text || '';
    s.style.color = isError ? 'var(--severity-critical)' : 'var(--text-muted)';
  }

  function renderError(container, status, message) {
    if (!container) return;
    var label = status ? ('HTTP ' + status) : 'Error';
    container.innerHTML =
      '<div style="border: 1px solid var(--severity-critical); border-radius: 6px; padding: 12px 14px; ' +
      'background: rgba(220, 38, 38, 0.08); color: var(--severity-critical); font-size: 12px;">' +
      '<strong>' + esc(label) + ' — query did not run or returned no rows.</strong><br>' +
      esc(message || 'Unknown error') +
      '</div>';
  }

  // Render real returned rows. Columns are the union of keys across all
  // rows, in first-seen order; every cell is HTML-escaped. Rows beyond
  // MAX_RENDER_ROWS are counted, not rendered, and the note says so.
  function renderRows(container, rows, meta) {
    if (!container) return;
    if (!rows || rows.length === 0) {
      container.innerHTML =
        '<div style="font-size: 12px; color: var(--text-muted); padding: 10px 0;">' +
        'Query succeeded — 0 rows returned for <code>' + esc(meta.host || '') + '</code> ' +
        'in namespace <code>' + esc(meta.namespace || '') + '</code>.' +
        '</div>';
      return;
    }
    var columns = [];
    rows.forEach(function (row) {
      if (!row || typeof row !== 'object') return;
      Object.keys(row).forEach(function (k) {
        if (columns.indexOf(k) === -1) columns.push(k);
      });
    });
    var shown = rows.slice(0, MAX_RENDER_ROWS);
    var html =
      '<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">' +
      esc(String(rows.length)) + ' row' + (rows.length === 1 ? '' : 's') + ' returned from <code>' +
      esc(meta.host || '') + '</code> in namespace <code>' + esc(meta.namespace || '') + '</code>' +
      (meta.elapsedMs !== null && meta.elapsedMs !== undefined ? ' in ' + esc(String(meta.elapsedMs)) + ' ms' : '') +
      (rows.length > MAX_RENDER_ROWS ? ' — showing first ' + MAX_RENDER_ROWS + ' rows.' : '.') +
      '</div>' +
      '<div style="overflow-x: auto;">' +
      '<table class="table-me" style="width: 100%; font-size: 12px;">' +
      '<thead><tr>' + columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' +
      shown.map(function (row) {
        return '<tr>' + columns.map(function (c) {
          var v = row && row[c] !== undefined && row[c] !== null ? row[c] : '';
          if (typeof v === 'object') v = JSON.stringify(v);
          return '<td>' + esc(v) + '</td>';
        }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div>';
    container.innerHTML = html;
  }

  // --------------------------------------------------------------------- run
  async function runWmiQuery() {
    var container = $('wmi-results');
    var host = val('wmi-host');
    var username = val('wmi-username');
    // Password is read only here, into the request body. It is never placed
    // in rendered HTML, never logged, never stored.
    var passwordEl = $('wmi-password');
    var password = passwordEl ? passwordEl.value : '';
    var namespace = val('wmi-namespace') || DEFAULT_NAMESPACE;
    var query = val('wmi-query');

    if (!host || !query) {
      setStatus('Host and WQL query are required.', true);
      renderError(container, null, 'Host and WQL query are required — nothing was sent to the server.');
      return;
    }
    if (!username) {
      setStatus('Username is required for WinRM authentication.', true);
      renderError(container, null, 'Username is required for WinRM authentication — nothing was sent to the server.');
      return;
    }

    setStatus('Running WQL against ' + host + '…', false);
    if (container) {
      container.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 10px 0;">Querying ' +
        esc(host) + ' via WinRM…</div>';
    }

    var started = Date.now();
    try {
      var res = await wmiPost(API_WMI_QUERY, {
        host: host,
        username: username,
        password: password,
        namespace: namespace,
        query: query,
      });
      var elapsedMs = Date.now() - started;
      if (res.status === 'success') {
        // Canonical success shape is res.rows; tolerate res.results too.
        var rows = Array.isArray(res.rows) ? res.rows : (Array.isArray(res.results) ? res.results : null);
        if (rows === null) {
          setStatus('Query succeeded but the server returned no rows array.', true);
          renderError(container, null, 'Query succeeded but the server returned no rows array — nothing to render.');
          return;
        }
        setStatus(rows.length + ' row' + (rows.length === 1 ? '' : 's') + ' returned in ' + elapsedMs + ' ms.', false);
        renderRows(container, rows, { host: host, namespace: namespace, elapsedMs: elapsedMs });
      } else {
        setStatus('Query failed: ' + (res.message || res.error || 'unknown error'), true);
        renderError(container, null, res.message || res.error || 'Query failed with no message from the server.');
      }
    } catch (e) {
      setStatus('Query failed: ' + e.message, true);
      // e carries the server's own message (including the honest 501).
      // The password is never part of e, the status, or the rendered error.
      renderError(container, e.status || null, e.message);
    }
  }

  // -------------------------------------------------------------- registration
  window.OpManager = window.OpManager || {};
  window.OpManager.openWmiQueryTool = openWmiQueryTool;
  window.OpManager.runWmiQuery = runWmiQuery;
  window.OpManager.clearWmiCredentials = clearWmiCredentials;
  // Exposed for unit checks only (not wired into app.js):
  window.OpManager._winrmUi = { renderRows: renderRows, renderError: renderError, esc: esc };
})();
