/**
 * OpManager Central — Phase 3 (tpl-ui): Template Apply results UI.
 *
 * WIRING — this file is a self-contained partial. It does NOT edit
 * client/js/app.js and it is NOT loaded by itself. The close-out agent
 * wires it in with exactly these steps:
 *
 * 1. LOAD: add this line to client/itom.html, AFTER the
 *    opmanager-suite.js <script> tag (the served bundle is built from
 *    client/js/app.js, so the script tag must also survive a rebuild of
 *    that bundle, or be added to the bundle's own script list):
 *      <script src="/js/p3/tpl-ui.js"></script>
 * 2. NAV: in client/js/app.js, add 'Device Templates' to
 *    MENU_DEFINITIONS.settings.subTabs (after 'SNMP / WMI Credentials').
 * 3. VIEW: in client/js/app.js renderSettingsView(), before the
 *    credentials fallback that builds the Central Server Parameters /
 *    Credential Library cards, add:
 *      if (state.currentSubTab === 'Device Templates') {
 *        window.OpManagerTplUi.render(DOM.workspace);
 *        return;
 *      }
 *    (renderSettingsView is the function that switches on
 *    state.currentSubTab for the settings tab; renderCurrentView()
 *    dispatches the 'settings' tab to it.)
 * 4. No change to window.OpManager in app.js is needed: this partial
 *    registers itself as window.OpManagerTplUi and depends on NOTHING
 *    from app.js (no state, DOM, escapeHtml, apiJson or showToast) —
 *    it brings its own fetch/escape helpers so it also works if it is
 *    loaded standalone against the same origin.
 *
 * WHAT IT DOES
 * - Template picker (search-filtered; device templates only — type
 *   devicetemplate/vendor, custom templates included) + template detail.
 * - Device picker (live GET /api/devices) + the device's current
 *   effective thresholds (GET /api/devices/:id/thresholds) shown as
 *   soon as a device is picked, before any apply.
 * - Apply button: POST /api/settings/templates/apply, awaited. The
 *   results area shows ONLY what the server returned — the effective
 *   applied thresholds and poll interval when the server returns them
 *   (canonical shape, SHARED.md: appliedTemplate = { templateId,
 *   thresholds: { cpuWarn, cpuCrit, memWarn, memCrit },
 *   pollIntervalSec }), plus the device's current effective values
 *   re-fetched from GET /api/devices/:id/thresholds, compared against
 *   the poller defaults. Nothing is shown as applied before the server
 *   answers, and nothing is invented: on the base build (ff51df6) the
 *   apply response carries no thresholds and no poll interval — only
 *   an assignment record — and the UI says exactly that instead of
 *   dressing the poller defaults up as template values.
 * - Unapply action: DELETE /api/settings/templates/apply (body
 *   { deviceId }), falling back to DELETE .../apply/:deviceId and then
 *   POST /api/settings/templates/unapply. No unapply endpoint exists
 *   in the base build, so until the tpl-routes track adds one the
 *   button honestly reports that it is unavailable (with the HTTP
 *   statuses seen) instead of pretending the assignment was removed.
 *
 * NO FAKE DATA: every number, name and status in the rendered view
 * comes from a live API response. Unknown values render as "—" and
 * failed loads render the server's own error message.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- helpers
  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function display(v, suffix) {
    if (v === null || v === undefined || v === '') return '—';
    return esc(String(v)) + (suffix ? esc(suffix) : '');
  }

  function fmtPct(v) {
    return (v === null || v === undefined || v === '') ? '—' : String(v) + '%';
  }

  function fmtInterval(sec) {
    if (sec === null || sec === undefined || sec === '') return '—';
    const n = Number(sec);
    if (!Number.isFinite(n)) return String(sec);
    return n + ' s';
  }

  function fmtTime(v) {
    if (v === null || v === undefined || v === '') return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  }

  // Fetch JSON with the session cookie; throws on HTTP error carrying the
  // server's own message (and .status), so the UI reports the real outcome.
  async function apiJson(url, options) {
    const res = await fetch(url, { credentials: 'include', ...(options || {}) });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function numOrNull(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  // ------------------------------------------------------- response shaping
  // Normalize the many threshold spellings a server may return into one
  // canonical shape { cpuWarn, cpuCrit, memWarn, memCrit } (null = absent).
  // Accepts canonical camelCase, snake_case, and the thresholds-API shape
  // { cpu_critical, cpu_trouble, mem_critical } (which has no memWarn).
  function normalizeThresholds(t) {
    if (!t || typeof t !== 'object') return null;
    const out = {
      cpuWarn: numOrNull(t.cpuWarn !== undefined ? t.cpuWarn : t.cpu_trouble),
      cpuCrit: numOrNull(t.cpuCrit !== undefined ? t.cpuCrit : t.cpu_critical),
      memWarn: numOrNull(t.memWarn !== undefined ? t.memWarn : t.mem_trouble),
      memCrit: numOrNull(t.memCrit !== undefined ? t.memCrit : t.mem_critical),
    };
    if (out.cpuWarn === null && out.cpuCrit === null && out.memWarn === null && out.memCrit === null) return null;
    return out;
  }

  function pickPollInterval(obj) {
    if (!obj || typeof obj !== 'object') return null;
    const v = obj.pollIntervalSec !== undefined ? obj.pollIntervalSec
      : obj.poll_interval_sec !== undefined ? obj.poll_interval_sec
      : obj.pollInterval !== undefined ? obj.pollInterval
      : obj.poll_interval !== undefined ? obj.poll_interval
      : null;
    return numOrNull(v);
  }

  // Normalize an apply response into what the results area needs.
  // Canonical (tpl-routes, per SHARED.md): data.appliedTemplate =
  //   { templateId, thresholds: { cpuWarn, cpuCrit, memWarn, memCrit },
  //     pollIntervalSec }
  // Base build (ff51df6): data.assignment =
  //   { deviceId, deviceIp, deviceHostname, templateName, custom, appliedAt }
  //   — no thresholds, no poll interval. That is reported, not filled in.
  function normalizeApplyResult(data) {
    const d = data || {};
    const applied = (d.appliedTemplate && typeof d.appliedTemplate === 'object') ? d.appliedTemplate : null;
    const assignment = (d.assignment && typeof d.assignment === 'object') ? d.assignment : null;
    const thresholds =
      normalizeThresholds(applied && applied.thresholds) ||
      normalizeThresholds(d.thresholds) ||
      normalizeThresholds(assignment && assignment.thresholds) ||
      null;
    const pollIntervalSec =
      (applied ? pickPollInterval(applied) : null) ??
      pickPollInterval(d) ??
      (assignment ? pickPollInterval(assignment) : null);
    return {
      message: d.message || null,
      templateName:
        (applied && (applied.templateId || applied.templateName)) ||
        (assignment && assignment.templateName) ||
        d.templateName || d.template || null,
      templateId: (applied && applied.templateId) || null,
      deviceId:
        (assignment && assignment.deviceId !== undefined ? assignment.deviceId : null) ??
        (d.deviceId !== undefined ? d.deviceId : null),
      deviceIp: (assignment && assignment.deviceIp) || d.deviceIp || null,
      deviceHostname: (assignment && assignment.deviceHostname) || d.deviceHostname || null,
      custom: assignment ? Boolean(assignment.custom) : null,
      appliedAt: (assignment && assignment.appliedAt) || d.appliedAt || null,
      thresholds: thresholds,
      pollIntervalSec: pollIntervalSec,
      // True only when the server actually returned template values.
      serverReturnedTemplateValues: thresholds !== null || pollIntervalSec !== null,
    };
  }

  // ------------------------------------------------------------------- state
  const st = {
    container: null,
    templates: [],      // device templates only (type devicetemplate/vendor)
    templatesTotal: 0,
    devices: [],
    selectedTemplateName: '',
    selectedDeviceId: '',
    templateDetail: null,
    effective: null,    // last GET /api/devices/:id/thresholds payload
    lastApply: null,    // normalized apply result (or null)
    busy: false,
  };

  // ------------------------------------------------------------- data loads
  async function loadTemplates() {
    const data = await apiJson('/api/settings/templates');
    const all = Array.isArray(data.templates) ? data.templates : [];
    st.templatesTotal = typeof data.total === 'number' ? data.total : all.length;
    // Apply only makes sense for device templates; the catalogue also
    // holds monitors/config/credential/sysOidMap entries.
    st.templates = all.filter((t) => t && (t.type === 'devicetemplate' || t.type === 'vendor'));
    return st.templates;
  }

  async function loadDevices() {
    const data = await apiJson('/api/devices');
    st.devices = Array.isArray(data.devices) ? data.devices : [];
    return st.devices;
  }

  async function loadEffective(deviceId) {
    const data = await apiJson('/api/devices/' + encodeURIComponent(deviceId) + '/thresholds');
    st.effective = data;
    return data;
  }

  async function loadTemplateDetail(name) {
    const data = await apiJson('/api/settings/templates/' + encodeURIComponent(name));
    st.templateDetail = data.template || null;
    return st.templateDetail;
  }

  // ---------------------------------------------------------------- rendering
  function deviceLabel(d) {
    const name = d.hostname || d.sys_name || d.ip || ('device ' + d.id);
    return name + ' (' + (d.ip || 'no IP') + ')' +
      (d.category ? ' — ' + d.category : '') +
      (d.status ? ' [' + d.status + ']' : '');
  }

  function templateOptionLabel(t) {
    return (t.name || 'unnamed') +
      (t.vendor ? ' — ' + t.vendor : '') +
      (t.custom ? ' (custom)' : '');
  }

  function filteredTemplates(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return st.templates;
    return st.templates.filter((t) =>
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.vendor && t.vendor.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)));
  }

  function renderTemplateOptions() {
    const sel = document.getElementById('p3-tpl-template');
    const search = document.getElementById('p3-tpl-template-search');
    if (!sel) return;
    const list = filteredTemplates(search ? search.value : '');
    const current = st.selectedTemplateName;
    sel.innerHTML = '<option value="">— Select a template —</option>' +
      list.map((t) => '<option value="' + esc(t.name) + '"' +
        (String(t.name) === String(current) ? ' selected' : '') + '>' +
        esc(templateOptionLabel(t)) + '</option>').join('');
    const count = document.getElementById('p3-tpl-template-count');
    if (count) {
      count.textContent = list.length + ' of ' + st.templates.length +
        ' device templates shown (' + st.templatesTotal + ' entries in catalogue)';
    }
  }

  function renderDeviceOptions() {
    const sel = document.getElementById('p3-tpl-device');
    if (!sel) return;
    const current = st.selectedDeviceId;
    sel.innerHTML = '<option value="">— Select a device —</option>' +
      st.devices.map((d) => '<option value="' + esc(String(d.id)) + '"' +
        (String(d.id) === String(current) ? ' selected' : '') + '>' +
        esc(deviceLabel(d)) + '</option>').join('');
  }

  // Effective-thresholds comparison table. `applied` is the normalized
  // apply result (may be null when nothing was applied in this session);
  // its template values get their own column only when the server
  // actually returned them.
  function effectiveTableHtml(applied) {
    const eff = st.effective;
    if (!eff) {
      return '<div style="font-size:12px;color:var(--text-muted);">Pick a device to load its current effective thresholds.</div>';
    }
    const th = eff.thresholds || {};
    const def = eff.defaults || {};
    const custom = eff.custom || {};
    const tpl = applied && applied.thresholds ? applied.thresholds : null;
    const rows = [
      { label: 'CPU warning', key: 'cpuWarn', effKey: 'cpu_trouble', val: th.cpu_trouble, defVal: def.cpu_trouble, customVal: custom.cpu_trouble },
      { label: 'CPU critical', key: 'cpuCrit', effKey: 'cpu_critical', val: th.cpu_critical, defVal: def.cpu_critical, customVal: custom.cpu_critical },
      { label: 'Memory warning', key: 'memWarn', effKey: null, val: null, defVal: null, customVal: null },
      { label: 'Memory critical', key: 'memCrit', effKey: 'mem_critical', val: th.mem_critical, defVal: def.mem_critical, customVal: custom.mem_critical },
    ];
    const sourceFor = (r) =>
      (r.customVal !== null && r.customVal !== undefined) ? 'Custom override' : 'Poller default';
    return '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border-color);">Metric</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border-color);">Effective now</th>' +
      (tpl ? '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border-color);">Template applied</th>' : '') +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border-color);">Poller default</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border-color);">Source</th>' +
      '</tr></thead><tbody>' +
      rows.map((r) => {
        const tplVal = tpl ? tpl[r.key] : null;
        const match = (tpl && tplVal !== null && r.val !== null && r.val !== undefined)
          ? (Number(tplVal) === Number(r.val)
            ? '<span style="color:#15803d;">matches</span>'
            : '<span style="color:#b45309;">differs</span>')
          : '';
        return '<tr>' +
          '<td style="padding:6px;border-bottom:1px solid var(--border-color);font-weight:600;">' + esc(r.label) + '</td>' +
          '<td style="padding:6px;border-bottom:1px solid var(--border-color);">' + fmtPct(r.val) + '</td>' +
          (tpl ? '<td style="padding:6px;border-bottom:1px solid var(--border-color);">' +
            fmtPct(tplVal) + (match ? ' ' + match : '') + '</td>' : '') +
          '<td style="padding:6px;border-bottom:1px solid var(--border-color);">' + fmtPct(r.defVal) + '</td>' +
          '<td style="padding:6px;border-bottom:1px solid var(--border-color);">' + esc(sourceFor(r)) + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:6px;">' +
      'Device ' + esc(String(eff.deviceId)) + ' • ' +
      (eff.customized ? 'has custom thresholds stored' : 'no custom thresholds stored — poller defaults apply') +
      (tpl ? ' • "Template applied" is what the server returned on apply; "differs" means the live effective value is not (yet) the template value.' : '') +
      '</div>';
  }

  function applyResultHtml(applied) {
    if (!applied) {
      return '<div style="font-size:12px;color:var(--text-muted);">No template applied yet in this session. Pick a template and a device, then Apply — the server\u2019s own answer appears here.</div>';
    }
    const tpl = applied.thresholds;
    return '<div style="font-size:12px;line-height:1.8;">' +
      (applied.message ? '<div><strong>Server:</strong> ' + esc(applied.message) + '</div>' : '') +
      '<div><strong>Template:</strong> ' + display(applied.templateName) +
      (applied.custom === true ? ' (custom)' : applied.custom === false ? ' (vendor)' : '') + '</div>' +
      '<div><strong>Device:</strong> ' + display(applied.deviceHostname || applied.deviceIp) +
      (applied.deviceHostname && applied.deviceIp ? ' (' + display(applied.deviceIp) + ')' : '') +
      ' (id ' + display(applied.deviceId) + ')' + '</div>' +
      '<div><strong>Applied at:</strong> ' + fmtTime(applied.appliedAt) + '</div>' +
      '<div><strong>Effective applied thresholds (as returned by the server):</strong> ' +
      (tpl
        ? 'CPU warn ' + fmtPct(tpl.cpuWarn) + ' • CPU crit ' + fmtPct(tpl.cpuCrit) +
          ' • Mem warn ' + fmtPct(tpl.memWarn) + ' • Mem crit ' + fmtPct(tpl.memCrit)
        : 'not returned by this server build — the apply response carries only the assignment record, no thresholds') +
      '</div>' +
      '<div><strong>Poll interval (as returned by the server):</strong> ' +
      (applied.pollIntervalSec !== null && applied.pollIntervalSec !== undefined
        ? fmtInterval(applied.pollIntervalSec)
        : 'not returned by this server build') +
      '</div>' +
      '</div>';
  }

  function renderResults() {
    const box = document.getElementById('p3-tpl-results');
    if (!box) return;
    box.innerHTML =
      '<div class="me-card" style="margin-bottom:12px;"><div class="me-card-header">' +
      '<span class="me-card-title">📋 Apply result (from the server)</span></div>' +
      '<div class="me-card-body">' + applyResultHtml(st.lastApply) + '</div></div>' +
      '<div class="me-card"><div class="me-card-header">' +
      '<span class="me-card-title">📊 Device effective values — template vs default</span></div>' +
      '<div class="me-card-body">' + effectiveTableHtml(st.lastApply) + '</div></div>';
  }

  function setStatus(msg, isError) {
    const el = document.getElementById('p3-tpl-status');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? 'var(--severity-critical, #dc2626)' : 'var(--text-muted)';
  }

  function setBusy(busy) {
    st.busy = busy;
    const btn = document.getElementById('p3-tpl-apply-btn');
    const un = document.getElementById('p3-tpl-unapply-btn');
    if (btn) btn.disabled = busy || !st.selectedTemplateName || !st.selectedDeviceId;
    if (un) un.disabled = busy || !st.selectedDeviceId || !st.lastApply;
  }

  function renderShell() {
    st.container.innerHTML =
      '<div class="me-card" style="margin-bottom:16px;">' +
      '<div class="me-card-header"><span class="me-card-title">📄 Device Templates — Apply to Device</span>' +
      '<span style="font-size:11px;color:var(--text-muted);">Every value below comes from a live API response.</span></div>' +
      '<div class="me-card-body">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
      '<div><label for="p3-tpl-template-search" style="font-size:11px;font-weight:700;">Template (search)</label>' +
      '<input id="p3-tpl-template-search" type="text" placeholder="Filter by name, vendor or category…" ' +
      'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;" />' +
      '<select id="p3-tpl-template" style="width:100%;padding:8px;margin-top:8px;border:1px solid var(--border-color);border-radius:4px;">' +
      '<option value="">— Loading templates… —</option></select>' +
      '<div id="p3-tpl-template-count" style="font-size:11px;color:var(--text-muted);margin-top:4px;"></div>' +
      '<div id="p3-tpl-template-detail" style="font-size:12px;line-height:1.7;margin-top:8px;"></div></div>' +
      '<div><label for="p3-tpl-device" style="font-size:11px;font-weight:700;">Device</label>' +
      '<select id="p3-tpl-device" style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
      '<option value="">— Loading devices… —</option></select>' +
      '<div id="p3-tpl-device-note" style="font-size:11px;color:var(--text-muted);margin-top:4px;"></div></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;align-items:center;">' +
      '<button id="p3-tpl-apply-btn" class="btn-me-primary" disabled>Apply template</button>' +
      '<button id="p3-tpl-unapply-btn" class="btn-me-secondary" disabled title="Remove the template assignment from the selected device">Remove template (unapply)</button>' +
      '<span id="p3-tpl-status" style="font-size:12px;"></span>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:8px;">' +
      'Assignments are stored server-side; there is no list-assignments endpoint in this build, so a device\u2019s ' +
      'current assignment is only visible in the apply result returned by the server.</div>' +
      '</div></div>' +
      '<div id="p3-tpl-results"></div>';
  }

  function renderTemplateDetail() {
    const box = document.getElementById('p3-tpl-template-detail');
    if (!box) return;
    const t = st.templateDetail;
    if (!t) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<div><strong>Vendor:</strong> ' + display(t.vendor) + '</div>' +
      '<div><strong>Type:</strong> ' + display(t.type) + (t.custom ? ' • custom template' : '') + '</div>' +
      '<div><strong>sysOid:</strong> ' + display(t.sysOid) + '</div>' +
      '<div><strong>Category:</strong> ' + display(t.category) + ' • <strong>OS:</strong> ' + display(t.osType) + '</div>' +
      '<div><strong>Monitors:</strong> ' + (Array.isArray(t.monitors) && t.monitors.length ? esc(t.monitors.slice(0, 8).join(', ')) + (t.monitors.length > 8 ? ' … +' + (t.monitors.length - 8) + ' more' : '') : '—') + '</div>';
  }

  // ------------------------------------------------------------------ actions
  async function onTemplateSelected() {
    const sel = document.getElementById('p3-tpl-template');
    st.selectedTemplateName = sel ? sel.value : '';
    st.templateDetail = null;
    renderTemplateDetail();
    setBusy(st.busy);
    if (!st.selectedTemplateName) return;
    try {
      await loadTemplateDetail(st.selectedTemplateName);
      renderTemplateDetail();
    } catch (e) {
      setStatus('Could not load template detail: ' + e.message, true);
    }
  }

  async function onDeviceSelected() {
    const sel = document.getElementById('p3-tpl-device');
    st.selectedDeviceId = sel ? sel.value : '';
    st.effective = null;
    st.lastApply = null;
    renderResults();
    setBusy(st.busy);
    const note = document.getElementById('p3-tpl-device-note');
    if (!st.selectedDeviceId) { if (note) note.textContent = ''; return; }
    setStatus('Loading current effective thresholds…');
    try {
      await loadEffective(st.selectedDeviceId);
      if (note) note.textContent = 'Effective thresholds loaded from the server.';
      setStatus('');
      renderResults();
    } catch (e) {
      if (note) note.textContent = '';
      setStatus('Could not load device thresholds: ' + e.message, true);
      renderResults();
    }
  }

  async function onApply() {
    if (!st.selectedTemplateName || !st.selectedDeviceId) {
      setStatus('Pick a template and a device first.', true);
      return;
    }
    setBusy(true);
    setStatus('Applying template…');
    try {
      const data = await apiJson('/api/settings/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: st.selectedTemplateName, deviceId: Number(st.selectedDeviceId) }),
      });
      // Only now, with the server's answer in hand, show a result — and
      // re-fetch the device's effective values so the comparison table
      // reflects the live state after the apply.
      st.lastApply = normalizeApplyResult(data);
      try {
        await loadEffective(st.selectedDeviceId);
      } catch (e) {
        setStatus('Template applied, but re-reading effective thresholds failed: ' + e.message, true);
      }
      renderResults();
      setStatus('Template applied — see the server result below.');
    } catch (e) {
      setStatus('Apply failed: ' + e.message, true);
    } finally {
      setBusy(false);
    }
  }

  // Unapply: no endpoint exists in the base build. Try the canonical
  // DELETE first, then the per-device DELETE, then POST /unapply, and
  // report exactly what happened — never clear the displayed assignment
  // unless a server call actually removed it.
  async function onUnapply() {
    if (!st.selectedDeviceId) {
      setStatus('Pick a device first.', true);
      return;
    }
    setBusy(true);
    setStatus('Removing template assignment…');
    const attempts = [];
    const tries = [
      { method: 'DELETE', url: '/api/settings/templates/apply', body: { deviceId: Number(st.selectedDeviceId) } },
      { method: 'DELETE', url: '/api/settings/templates/apply/' + encodeURIComponent(st.selectedDeviceId), body: null },
      { method: 'POST', url: '/api/settings/templates/unapply', body: { deviceId: Number(st.selectedDeviceId) } },
    ];
    try {
      for (const t of tries) {
        try {
          const data = await apiJson(t.url, {
            method: t.method,
            headers: { 'Content-Type': 'application/json' },
            ...(t.body ? { body: JSON.stringify(t.body) } : {}),
          });
          st.lastApply = null;
          try { await loadEffective(st.selectedDeviceId); } catch (e) { /* keep old effective table */ }
          renderResults();
          setStatus((data && data.message) || ('Template removed from device ' + st.selectedDeviceId + ' (' + t.method + ' ' + t.url + ').'));
          return;
        } catch (e) {
          attempts.push(t.method + ' ' + t.url + ' → ' + (e.status || '?') + ' ' + e.message);
          // 404/501 mean "no such endpoint in this build" — try the next
          // spelling. Any other failure (400/401/403/500) is the server
          // answering, so stop and report it.
          if (e.status !== 404 && e.status !== 501) break;
        }
      }
      setStatus('Unapply is not available in this build — no server endpoint removed the assignment. Tried: ' + attempts.join('; '), true);
    } finally {
      setBusy(false);
    }
  }

  // -------------------------------------------------------------------- mount
  async function render(container) {
    const host = container || document.getElementById('workspaceContent');
    if (!host) throw new Error('OpManagerTplUi.render: no container element found');
    st.container = host;
    renderShell();
    renderResults();
    document.getElementById('p3-tpl-template-search').addEventListener('input', renderTemplateOptions);
    document.getElementById('p3-tpl-template').addEventListener('change', onTemplateSelected);
    document.getElementById('p3-tpl-device').addEventListener('change', onDeviceSelected);
    document.getElementById('p3-tpl-apply-btn').addEventListener('click', onApply);
    document.getElementById('p3-tpl-unapply-btn').addEventListener('click', onUnapply);
    setBusy(false);
    try {
      await loadTemplates();
      renderTemplateOptions();
    } catch (e) {
      const sel = document.getElementById('p3-tpl-template');
      if (sel) sel.innerHTML = '<option value="">— Failed to load templates —</option>';
      setStatus('Could not load templates: ' + e.message, true);
    }
    try {
      await loadDevices();
      renderDeviceOptions();
      const note = document.getElementById('p3-tpl-device-note');
      if (note && !st.devices.length) note.textContent = 'No devices yet — add a device first.';
    } catch (e) {
      const sel = document.getElementById('p3-tpl-device');
      if (sel) sel.innerHTML = '<option value="">— Failed to load devices —</option>';
      setStatus('Could not load devices: ' + e.message, true);
    }
    renderResults();
  }

  window.OpManagerTplUi = {
    render: render,
    mount: render,
    // Test/close-out hooks (not UI): normalize server payloads.
    _normalizeApplyResult: normalizeApplyResult,
    _normalizeThresholds: normalizeThresholds,
  };
})();
