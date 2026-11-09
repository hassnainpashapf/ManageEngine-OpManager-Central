/* ==========================================================================
 * OpManager Central — Phase 3 (mac-arp track): MAC resolution results UI.
 *
 * Self-contained partial. Do NOT edit client/js/app.js to use it — the
 * close-out agent wires this file in at exactly these points:
 *
 *   1. SCRIPT TAG — client/noc.html, immediately AFTER the
 *      <script src="/js/app.js"></script> tag (line ~743):
 *        <script src="/js/p3/mac-arp.js"></script>
 *      (Loading after app.js lets this file attach its functions to the
 *      window.OpManager controller created by app.js; see step 3.)
 *
 *   2. LAUNCHER BUTTON — client/js/app.js, renderDashboard(), the
 *      "Quick Diagnostic Tools" card, next to the runQuickPing button
 *      (onclick="window.OpManager.runQuickPing()"):
 *        <button class="btn-me-secondary" ... onclick="window.OpManager.openMacResolver()">🔍 MAC Resolver</button>
 *      and in bindModals(), next to the btnSnapMibBrowser handler, a
 *      snapshot "MAC Resolver" button calling
 *        window.OpManager.openMacResolver(state.activeModalDevice?.ip)
 *
 *   3. CONTROLLER EXPORT — client/js/app.js, "Global Controller" section,
 *      the window.OpManager literal, next to openMibBrowser /
 *      executeMibGet / executeMibWalk:
 *        openMacResolver: window.OpManagerMacArp.openMacResolver,
 *        resolveMac: window.OpManagerMacArp.resolveMac,
 *      (This file ALSO auto-attaches those two functions to window.OpManager
 *      when it loads after app.js, so the UI works even before step 3 is
 *      applied; step 3 makes the wiring explicit and survives a reload
 *      order change.)
 *
 * What it does: renders a "MAC Address Resolver" modal with a target input
 * (IP or managed-device name), community + optional `via` inputs, and a
 * per-source results view. It POSTs to /api/tools/mac-resolve with
 * { all: true } so every source is actually tried and reported:
 * stored interface rows, this host's ARP cache, live SNMP if-table, and
 * live SNMP ARP tables. A hit shows the real MAC and the source that
 * supplied it; a miss renders the honest 404 view listing every source
 * tried and why it missed — nothing is fabricated, and vendor is always
 * shown as unknown (no OUI database is bundled with the server).
 *
 * The HTML builders (macArpEscapeHtml, macArpSourceRowHtml,
 * macArpResultsHtml, macArpNotFoundHtml) are pure functions with no DOM
 * dependency, so they can be smoke-tested in node; the DOM wiring
 * (openMacResolver / resolveMac) only runs in a browser.
 * ========================================================================== */
(function () {
  'use strict';

  var root = typeof window !== 'undefined' ? window : globalThis;
  var doc = typeof document !== 'undefined' ? document : null;

  /* -- Pure HTML builders (no DOM) --------------------------------------- */

  function macArpEscapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Short human label for a source id such as "snmp-arp-table@192.168.30.2".
  function macArpSourceLabel(source) {
    var labels = {
      'stored-interface': 'Stored interface rows',
      'host-arp-cache': 'This host\u2019s ARP cache',
      'snmp-if-table': 'Live SNMP: target\u2019s own MAC',
      'snmp-arp-table': 'Live SNMP: ARP tables'
    };
    if (labels[source]) return labels[source];
    if (String(source || '').indexOf('snmp-arp-table@') === 0) {
      return 'Live SNMP: ARP table on ' + String(source).slice('snmp-arp-table@'.length);
    }
    return String(source || 'unknown source');
  }

  // One per-source result row. `r` is one entry of the API `results` array
  // (or one entry of the 404 `sourcesTried` array, which has no `found`).
  function macArpSourceRowHtml(r) {
    var found = r.found === true;
    var badge = found
      ? '<span class="badge-me clear">Found</span>'
      : '<span class="badge-me down">Not found</span>';
    var mac = found ? '<code>' + macArpEscapeHtml(r.mac) + '</code>' : '\u2014';
    var detail = found
      ? [
          r.device ? 'via ' + r.device : null,
          r.interface ? 'interface ' + r.interface : null,
          (r.ifIndex !== undefined && r.ifIndex !== null) ? 'ifIndex ' + r.ifIndex : null,
          r.table ? 'table ' + r.table : null,
          r.state ? 'state ' + r.state : null,
          r.arpMethod ? 'read via ' + r.arpMethod + (r.arpEntries !== undefined && r.arpEntries !== null ? ' (' + r.arpEntries + ' entries)' : '') : null
        ].filter(Boolean).join(' \u2022 ')
      : (r.result || 'no match');
    return '<tr>'
      + '<td><strong>' + macArpEscapeHtml(macArpSourceLabel(r.source)) + '</strong><br>'
      + '<span style="font-size: 10px; color: var(--text-muted);"><code>' + macArpEscapeHtml(r.source) + '</code></span></td>'
      + '<td>' + badge + '</td>'
      + '<td>' + mac + '</td>'
      + '<td style="font-size: 11px; color: var(--text-muted);">' + macArpEscapeHtml(detail || '\u2014') + '</td>'
      + '</tr>';
  }

  function macArpResultsTableHtml(results) {
    if (!results || !results.length) {
      return '<div style="color: var(--text-muted); padding: 12px;">No source results were returned.</div>';
    }
    return '<table class="me-table" style="width: 100%;">'
      + '<thead><tr><th style="text-align: left;">Source</th><th style="text-align: left;">Result</th>'
      + '<th style="text-align: left;">MAC address</th><th style="text-align: left;">Detail</th></tr></thead>'
      + '<tbody>' + results.map(macArpSourceRowHtml).join('') + '</tbody></table>';
  }

  // 200 body (all:true): banner with the resolved MAC + per-source table.
  function macArpResultsHtml(payload) {
    var banner = '<div class="me-card" style="padding: 12px 14px; margin-bottom: 12px; border-left: 4px solid var(--severity-clear);">'
      + '<div style="font-size: 13px;">Resolved <code>' + macArpEscapeHtml(payload.target) + '</code>'
      + (payload.resolvedIp && payload.resolvedIp !== payload.target ? ' (<code>' + macArpEscapeHtml(payload.resolvedIp) + '</code>)' : '')
      + ' to <code style="font-size: 14px;"><strong>' + macArpEscapeHtml(payload.mac) + '</strong></code></div>'
      + '<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Source: <strong>'
      + macArpEscapeHtml(macArpSourceLabel(payload.source)) + '</strong> (<code>' + macArpEscapeHtml(payload.source) + '</code>)'
      + ' \u2022 Vendor: unknown \u2014 no OUI/vendor database is bundled with this server, so vendor is never inferred.</div>'
      + '</div>';
    var heading = '<div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Per-source results (every source was tried)</div>';
    return banner + heading + macArpResultsTableHtml(payload.results);
  }

  // 404 body: honest "not found" view listing every source tried.
  function macArpNotFoundHtml(payload) {
    var tried = payload.sourcesTried || payload.results || [];
    var banner = '<div class="me-card" style="padding: 12px 14px; margin-bottom: 12px; border-left: 4px solid var(--severity-critical);">'
      + '<div style="font-size: 13px; font-weight: 700;">No MAC address found for <code>' + macArpEscapeHtml(payload.target) + '</code>'
      + (payload.resolvedIp ? ' (<code>' + macArpEscapeHtml(payload.resolvedIp) + '</code>)' : '') + '</div>'
      + '<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">'
      + macArpEscapeHtml(payload.message || 'Nothing was fabricated \u2014 every source below was actually tried.') + '</div>'
      + '</div>';
    var heading = '<div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Sources tried</div>';
    return banner + heading + macArpResultsTableHtml(tried);
  }

  /* -- DOM wiring (browser only) ----------------------------------------- */

  var MODAL_ID = 'macArpResolverModal';

  function macArpGetModal() {
    if (!doc) return null;
    var modal = doc.getElementById(MODAL_ID);
    if (modal) return modal;
    modal = doc.createElement('div');
    modal.className = 'modal-backdrop-me';
    modal.id = MODAL_ID;
    modal.innerHTML =
      '<div class="modal-dialog-me" style="max-width: 860px;">'
      + '<div class="modal-header-me">'
      + '<div class="modal-title-me">\uD83D\uDD0D MAC Address Resolver</div>'
      + '<button class="modal-close-me" id="macArpCloseTop">&times;</button>'
      + '</div>'
      + '<div class="modal-body-me">'
      + '<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; margin-bottom: 10px;">'
      + '<label style="flex: 2 1 200px; font-size: 11px; color: var(--text-muted);">Target (IP or managed-device name)'
      + '<input id="macArpTarget" type="text" placeholder="e.g. 192.168.30.2" style="width: 100%; margin-top: 2px;" autocomplete="off"></label>'
      + '<label style="flex: 0 1 110px; font-size: 11px; color: var(--text-muted);">SNMP community'
      + '<input id="macArpCommunity" type="text" value="public" style="width: 100%; margin-top: 2px;" autocomplete="off"></label>'
      + '<label style="flex: 1 1 160px; font-size: 11px; color: var(--text-muted);">Via device (optional ARP table)'
      + '<input id="macArpVia" type="text" placeholder="e.g. 192.168.30.1" style="width: 100%; margin-top: 2px;" autocomplete="off"></label>'
      + '<button class="btn-me-primary" id="macArpResolveBtn" style="padding: 8px 14px;">Resolve</button>'
      + '</div>'
      + '<label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 10px;">'
      + '<input id="macArpAll" type="checkbox" checked> Check all sources (show per-source results, not just the first hit)</label>'
      + '<div id="macArpStatus" style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">'
      + 'Sources, in order: stored interface rows \u2022 this host\u2019s ARP cache (ip neigh / arp -a / /proc/net/arp) \u2022 live SNMP if-table \u2022 live SNMP ARP tables.</div>'
      + '<div id="macArpResults"></div>'
      + '</div>'
      + '<div class="modal-footer-me">'
      + '<span style="font-size: 11px; color: var(--text-muted);">Read-only lookups. Vendor is never inferred \u2014 no OUI database is bundled.</span>'
      + '<button class="btn-me-secondary" id="macArpCloseBottom">Close</button>'
      + '</div></div>';
    doc.body.appendChild(modal);
    var close = function () { modal.classList.remove('active'); };
    modal.querySelector('#macArpCloseTop').addEventListener('click', close);
    modal.querySelector('#macArpCloseBottom').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('#macArpResolveBtn').addEventListener('click', function () { resolveMac(); });
    modal.querySelector('#macArpTarget').addEventListener('keydown', function (e) { if (e.key === 'Enter') resolveMac(); });
    return modal;
  }

  // Open the resolver modal, optionally pre-filling the target (e.g. from a
  // device snapshot). Wired in app.js as window.OpManager.openMacResolver.
  function openMacResolver(prefillIp) {
    if (!doc) return;
    var modal = macArpGetModal();
    if (prefillIp) {
      var input = modal.querySelector('#macArpTarget');
      if (input) input.value = prefillIp;
    }
    modal.classList.add('active');
    var target = modal.querySelector('#macArpTarget');
    if (target) target.focus();
    if (prefillIp) resolveMac();
  }

  // Run a resolution and render the per-source results (or the honest 404
  // view). Reads the form when called with no arguments; explicit options
  // override the form. Wired in app.js as window.OpManager.resolveMac.
  async function resolveMac(opts) {
    if (!doc) return null;
    var modal = macArpGetModal();
    var targetInput = modal.querySelector('#macArpTarget');
    var communityInput = modal.querySelector('#macArpCommunity');
    var viaInput = modal.querySelector('#macArpVia');
    var allInput = modal.querySelector('#macArpAll');
    var statusEl = modal.querySelector('#macArpStatus');
    var resultsEl = modal.querySelector('#macArpResults');
    var target = (opts && opts.target !== undefined) ? String(opts.target) : (targetInput ? targetInput.value.trim() : '');
    var community = (opts && opts.community !== undefined) ? String(opts.community) : (communityInput ? communityInput.value.trim() : 'public');
    var via = (opts && opts.via !== undefined) ? String(opts.via) : (viaInput ? viaInput.value.trim() : '');
    var all = (opts && opts.all !== undefined) ? !!opts.all : (allInput ? !!allInput.checked : true);
    if (!target) {
      statusEl.textContent = 'Enter a target IP address or managed-device name.';
      return null;
    }
    statusEl.textContent = 'Resolving ' + target + ' (checking all sources)\u2026';
    resultsEl.innerHTML = '';
    var body = { target: target, community: community || 'public', all: all };
    if (via) body.via = via;
    try {
      var res = await fetch('/api/tools/mac-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var payload = await res.json();
      if (res.status === 404 || payload.error === 'mac_not_found') {
        statusEl.textContent = 'Checked every available source \u2014 no MAC found.';
        resultsEl.innerHTML = macArpNotFoundHtml(payload);
        return payload;
      }
      if (res.ok && payload.status === 'success') {
        if (payload.results) {
          statusEl.textContent = 'Resolved via ' + macArpSourceLabel(payload.source) + ' \u2014 all sources were tried.';
          resultsEl.innerHTML = macArpResultsHtml(payload);
        } else {
          // First-hit mode (checkbox off): single result, still shown in
          // the per-source table shape so the view is consistent.
          statusEl.textContent = 'Resolved via ' + macArpSourceLabel(payload.source) + ' (first hit only \u2014 tick "Check all sources" for the full table).';
          resultsEl.innerHTML = macArpResultsHtml({
            target: payload.target, resolvedIp: payload.resolvedIp, mac: payload.mac, source: payload.source,
            results: [{
              source: payload.source, found: true, mac: payload.mac, device: payload.device,
              deviceName: payload.deviceName, ifIndex: payload.ifIndex, interface: payload.interface,
              table: payload.table, state: payload.state, arpMethod: payload.arpMethod, arpEntries: payload.arpEntries
            }]
          });
        }
        return payload;
      }
      statusEl.textContent = payload.message || ('Resolution failed (HTTP ' + res.status + ').');
      resultsEl.innerHTML = '<div style="color: var(--severity-critical); padding: 12px;">'
        + macArpEscapeHtml(payload.message || ('Resolution failed (HTTP ' + res.status + ').')) + '</div>';
      return payload;
    } catch (e) {
      statusEl.textContent = 'Request failed: ' + e.message;
      resultsEl.innerHTML = '<div style="color: var(--severity-critical); padding: 12px;">Request failed: '
        + macArpEscapeHtml(e.message) + '</div>';
      return null;
    }
  }

  var api = {
    openMacResolver: openMacResolver,
    resolveMac: resolveMac,
    // Pure builders, exposed for node smoke tests (see _test below).
    escapeHtml: macArpEscapeHtml,
    sourceLabel: macArpSourceLabel,
    sourceRowHtml: macArpSourceRowHtml,
    resultsHtml: macArpResultsHtml,
    notFoundHtml: macArpNotFoundHtml
  };

  root.OpManagerMacArp = api;

  // Auto-attach to the app.js controller when this file loads after app.js,
  // so the modal works without an app.js edit. The close-out agent still
  // adds the explicit entries (header, step 3) so the wiring is visible.
  if (root.OpManager && !root.OpManager.openMacResolver) {
    root.OpManager.openMacResolver = openMacResolver;
    root.OpManager.resolveMac = resolveMac;
  }

  // Node smoke-test hook: `require('./client/js/p3/mac-arp.js')` returns the
  // API (pure builders) without touching the DOM.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
