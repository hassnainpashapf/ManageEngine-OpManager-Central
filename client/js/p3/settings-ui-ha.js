'use strict';
/**
 * Phase 3 — settings-ui track: High Availability (failover) settings form.
 *
 * WIRING (close-out agent — this file is self-contained and does NOT edit
 * client/js/app.js):
 *   1. Script tag: add `<script src="/js/p3/settings-ui-ha.js"></script>`
 *      to `client/noc.html` AFTER the existing
 *      `<script src="/js/app.js"></script>` line.
 *   2. Sub-tab: in `client/js/app.js`, `MENU_DEFINITIONS.settings.subTabs`,
 *      add the string `'High Availability'`.
 *   3. Branch: in `client/js/app.js`, `renderSettingsView()`, add BEFORE
 *      the default settings render (same pattern as the existing
 *      'Workflow Automation' / 'Probe Mutual Auth' / 'Central System Info'
 *      branches):
 *        if (state.currentSubTab === 'High Availability') {
 *          window.OpManager.renderHaSettingsView();
 *          return;
 *        }
 *   4. This file registers itself below
 *      (`window.OpManager.renderHaSettingsView = renderHaSettingsView`
 *      when `window.OpManager` exists, plus the
 *      `window.OpManagerSettingsUi.renderHa` namespace), so step 3 works
 *      with no other app.js change.
 *
 * ENDPOINTS — two shapes, one form. The canonical Phase 3 endpoint does
 * NOT exist yet, so the form probes for it and falls back to the real
 * failover endpoint that is already on the real-data branch. The banner
 * in the form always states which endpoint answered.
 *   Canonical (SHARED.md `settings.ha` = { standbyUrl, heartbeatSec,
 *   role: 'primary'|'standby' }) — NOT implemented by any route yet
 *   (ha-routes / ha-service tracks have not landed it):
 *     GET  /api/settings/ha
 *     POST /api/settings/ha
 *     POST /api/settings/ha/test
 *   Legacy failover (real, server/routes/settings.js):
 *     GET  /api/settings/failover — { mode, status, virtualIp,
 *          heartbeatPort, splitBrainProtection, primary, secondary }
 *          (unconfigured: mode null, status 'Not configured').
 *     POST /api/settings/failover — save (merges into the stored object).
 *     POST /api/settings/failover/test — real TCP connect to the stored
 *          standby (secondary.ip:heartbeatPort); honest 501 when nothing
 *          is configured, real latencyMs on connect. It does NOT claim
 *          replication or failover works — only that the standby answers
 *          TCP on the heartbeat port.
 *   The form renders the canonical fields when /api/settings/ha answers
 *   and the legacy fields otherwise; Save/Test always go to the endpoint
 *   that answered the load. No field is ever mapped across shapes where
 *   the meaning differs (heartbeatPort is a port, heartbeatSec is an
 *   interval — they are NOT interchangeable).
 *
 * SECRETS: none. No password, token or key is accepted or displayed by
 * this form.
 *
 * UNCONFIGURED STATE: with nothing stored the form renders the honest
 * "Not configured — single node" badge and empty fields — no invented
 * standby node, virtual IP or heartbeat is ever shown.
 */
(function () {
  var NS = 'p3-ha-';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function val(v) {
    return v == null ? '' : String(v);
  }

  async function apiJson(url, options) {
    var res = await fetch(url, Object.assign({ credentials: 'include' }, options || {}));
    var data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (!res.ok) {
      var err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function $(id) { return document.getElementById(NS + id); }

  function showResult(html, ok) {
    var box = $('result');
    if (!box) return;
    box.style.display = 'block';
    box.style.borderColor = ok ? '#16a34a' : '#dc2626';
    box.innerHTML = html;
  }

  async function loadSettings() {
    try {
      var ha = await apiJson('/api/settings/ha');
      return { source: 'canonical', data: ha.ha || ha || {} };
    } catch (e) {
      if (e && e.status === 404) {
        var fo = await apiJson('/api/settings/failover');
        return { source: 'legacy-failover', data: fo.failover || {} };
      }
      throw e;
    }
  }

  function isConfigured(src, d) {
    if (src === 'canonical') return Boolean(d.standbyUrl || d.role);
    return Boolean(d.mode || d.virtualIp || (d.secondary && d.secondary.ip) || (d.primary && d.primary.ip));
  }

  function canonicalFields() {
    return '' +
      '<label>This node’s role<select id="' + NS + 'role" style="width: 100%; padding: 6px; margin-top: 4px;">' +
        '<option value="">— not set —</option><option value="primary">primary</option>' +
        '<option value="standby">standby</option></select></label>' +
      '<label>Standby URL<input id="' + NS + 'standbyUrl" type="text" placeholder="https://standby.example.com:8060" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label>Heartbeat interval (seconds)<input id="' + NS + 'heartbeatSec" type="number" min="1" placeholder="5" style="width: 100%; padding: 6px; margin-top: 4px;"></label>';
  }

  function legacyFields() {
    return '' +
      '<label>Mode<input id="' + NS + 'mode" type="text" placeholder="active-passive" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label>Virtual IP<input id="' + NS + 'virtualIp" type="text" placeholder="192.168.1.200" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label>Primary node IP<input id="' + NS + 'primaryIp" type="text" placeholder="192.168.1.10" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label>Standby node IP<input id="' + NS + 'secondaryIp" type="text" placeholder="192.168.1.11" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label>Heartbeat port<input id="' + NS + 'heartbeatPort" type="number" min="1" max="65535" placeholder="8443" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
      '<label style="grid-column: 1 / -1;"><input id="' + NS + 'splitBrain" type="checkbox"> Split-brain protection</label>';
  }

  async function renderHaSettingsView() {
    var ws = document.getElementById('workspaceContent');
    if (!ws) return;
    ws.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header"><span class="me-card-title">🔁 High Availability</span>' +
        '<span id="' + NS + 'badge" class="badge-me" style="font-size: 10px;">Loading…</span></div>' +
        '<div class="me-card-body" style="font-size: 12px;">' +
          '<div id="' + NS + 'banner" style="display:none; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 12px;"></div>' +
          '<div id="' + NS + 'fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"></div>' +
          '<div style="color: var(--text-muted); margin-top: 8px;">The heartbeat test opens a real TCP connection to the configured standby on the heartbeat port and reports the real latency. It does not verify replication, database sync, or that a failover would succeed.</div>' +
          '<div style="display: flex; gap: 8px; margin-top: 14px;">' +
            '<button id="' + NS + 'save" class="btn-me-primary">Save HA settings</button>' +
            '<button id="' + NS + 'test" class="btn-me-secondary">Test standby heartbeat</button>' +
          '</div>' +
          '<div id="' + NS + 'result" style="display: none; margin-top: 14px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; line-height: 1.7;"></div>' +
        '</div>' +
      '</div>';

    var badge = $('badge');
    var banner = $('banner');
    var fields = $('fields');
    var loaded;
    try {
      loaded = await loadSettings();
    } catch (e) {
      badge.textContent = 'Load failed';
      showResult('<strong>Failed to load HA settings:</strong> ' + esc(e.message), false);
      return;
    }
    var src = loaded.source;
    var d = loaded.data || {};
    fields.innerHTML = src === 'canonical' ? canonicalFields() : legacyFields();
    if (src === 'canonical') {
      $('role').value = val(d.role) || '';
      $('standbyUrl').value = val(d.standbyUrl);
      $('heartbeatSec').value = d.heartbeatSec == null ? '' : String(d.heartbeatSec);
    } else {
      $('mode').value = val(d.mode);
      $('virtualIp').value = val(d.virtualIp);
      $('primaryIp').value = val(d.primary && d.primary.ip);
      $('secondaryIp').value = val(d.secondary && d.secondary.ip);
      $('heartbeatPort').value = d.heartbeatPort == null ? '' : String(d.heartbeatPort);
      $('splitBrain').checked = Boolean(d.splitBrainProtection);
      banner.style.display = 'block';
      banner.textContent = 'Canonical endpoint GET /api/settings/ha is not present in this build yet (ha-routes track), so this form is showing the failover settings stored under /api/settings/failover. The heartbeat test below is a real TCP connect to the standby — it does not verify replication.';
    }
    var configured = isConfigured(src, d);
    badge.textContent = configured ? (src === 'canonical' ? 'Configured' : 'Configured (' + val(d.status || d.mode) + ')') : 'Not configured — single node';
    if (src === 'legacy-failover') {
      banner.style.display = 'block';
      banner.textContent = 'Canonical endpoint GET /api/settings/ha is not present in this build yet (ha-routes track), so this form is showing the failover settings stored under /api/settings/failover. The heartbeat test below is a real TCP connect to the standby — it does not verify replication.' +
        (configured ? '' : ' No standby is configured. This node is running standalone — set the standby node IP and heartbeat port, save, then test the heartbeat.');
    } else if (!configured) {
      banner.style.display = 'block';
      banner.textContent = 'No standby is configured. This node is running standalone.';
    }

    $('save').addEventListener('click', async function () {
      try {
        var saved;
        if (src === 'canonical') {
          var hb = $('heartbeatSec').value.trim();
          saved = await apiJson('/api/settings/ha', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: $('role').value || null,
              standbyUrl: $('standbyUrl').value.trim() || null,
              heartbeatSec: hb ? Number(hb) : null,
            }),
          });
          showResult('<strong>Saved.</strong> ' + esc(saved.message || 'HA settings saved.'), true);
        } else {
          var hp = $('heartbeatPort').value.trim();
          saved = await apiJson('/api/settings/failover', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: $('mode').value.trim() || null,
              virtualIp: $('virtualIp').value.trim() || null,
              primary: { ip: $('primaryIp').value.trim() || null },
              secondary: { ip: $('secondaryIp').value.trim() || null, port: hp ? Number(hp) : null },
              heartbeatPort: hp ? Number(hp) : null,
              splitBrainProtection: Boolean($('splitBrain') && $('splitBrain').checked),
            }),
          });
          showResult('<strong>Saved.</strong> ' + esc(saved.message || 'Failover configuration saved.'), true);
        }
      } catch (e) {
        showResult('<strong>Save failed:</strong> ' + esc(e.message), false);
      }
    });

    $('test').addEventListener('click', async function () {
      var url = src === 'canonical' ? '/api/settings/ha/test' : '/api/settings/failover/test';
      try {
        var res = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        var data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON */ }
        data = data || {};
        var html = '<div><strong>HTTP status:</strong> ' + esc(res.status) + '</div>' +
          '<div><strong>status:</strong> ' + esc(data.status || '—') + '</div>' +
          '<div><strong>message:</strong> ' + esc(data.message || '—') + '</div>';
        if (data.latencyMs != null) html += '<div><strong>latency:</strong> ' + esc(data.latencyMs) + ' ms</div>';
        if (data.reachable != null) html += '<div><strong>standby reachable:</strong> ' + (data.reachable ? 'yes' : 'no') + '</div>';
        if (data.error) html += '<div><strong>error:</strong> ' + esc(data.error) + '</div>';
        showResult(html, res.ok && data.status !== 'error');
      } catch (e) {
        showResult('<strong>Heartbeat test failed:</strong> ' + esc(e.message), false);
      }
    });
  }

  if (typeof window !== 'undefined') {
    if (window.OpManager) window.OpManager.renderHaSettingsView = renderHaSettingsView;
    window.OpManagerSettingsUi = window.OpManagerSettingsUi || {};
    window.OpManagerSettingsUi.renderHa = renderHaSettingsView;
  }
})();
