'use strict';
/**
 * Phase 3 — settings-ui track: LDAP / Active Directory settings form.
 *
 * WIRING (close-out agent — this file is self-contained and does NOT edit
 * client/js/app.js):
 *   1. Script tag: add `<script src="/js/p3/settings-ui-ldap.js"></script>`
 *      to `client/noc.html` AFTER the existing
 *      `<script src="/js/app.js"></script>` line.
 *   2. Sub-tab: in `client/js/app.js`, `MENU_DEFINITIONS.settings.subTabs`,
 *      add the string `'LDAP / Active Directory'`.
 *   3. Branch: in `client/js/app.js`, `renderSettingsView()`, add BEFORE
 *      the default settings render (same pattern as the existing
 *      'Workflow Automation' / 'Probe Mutual Auth' / 'Central System Info'
 *      branches):
 *        if (state.currentSubTab === 'LDAP / Active Directory') {
 *          window.OpManager.renderLdapSettingsView();
 *          return;
 *        }
 *   4. This file registers itself below
 *      (`window.OpManager.renderLdapSettingsView = renderLdapSettingsView`
 *      when `window.OpManager` exists, plus the
 *      `window.OpManagerSettingsUi.renderLdap` namespace), so step 3 works
 *      with no other app.js change.
 *
 * ENDPOINTS (real):
 *   GET  /api/settings/auth/ldap — canonical LDAP settings, store key
 *        `settings.ldap` = { url, bindDn, baseDn, groupBase, userFilter,
 *        groupFilter } (SHARED.md). Landed by the ldap-routes track; on a
 *        build where it 404s this form falls back to the legacy AD
 *        settings below and says so in a banner.
 *   POST /api/settings/auth/ldap — save. The bind password is NEVER sent
 *        here: per SHARED.md it is runtime-only and is never stored.
 *   GET  /api/settings/auth/ad  — legacy AD settings (base real-data
 *        branch): { domainName, domainController, port, ssl, baseDn,
 *        bindUser, userFilter }. Only `bindPasswordConfigured` is ever
 *        returned, never a password.
 *   POST /api/settings/auth/ad  — legacy save (fallback when the canonical
 *        endpoint 404s). Password is never sent here either.
 *   POST /api/settings/auth/ad/test — test connection. Sends the form
 *        values INCLUDING the bind password transiently in the request
 *        body for this one call only; the server never stores, logs or
 *        echoes it. On the base branch the test is a real TCP connect to
 *        the directory (response states `ldapBindVerified: false`); on
 *        the ldap-routes build it performs a real LDAP bind + base search
 *        (`ldapBindVerified: true`, `entriesFound`).
 *
 * SECRETS: the bind-password input is type="password", autocomplete off.
 * Its value is read only at test time, is never written into the DOM, the
 * result box, a log line, or a save payload, and the field is cleared
 * after every test run.
 *
 * UNCONFIGURED STATE: when every stored field is null the form renders
 * the honest "Not configured" badge and empty fields — no invented
 * server, DN or filter is ever shown.
 */
(function () {
  var NS = 'p3-ldap-';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function val(v) {
    return v == null ? '' : String(v);
  }

  function isConfigured(cfg) {
    return Boolean(cfg && (cfg.url || cfg.domainController || cfg.bindDn || cfg.bindUser || cfg.baseDn));
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

  function resultFromTest(data, httpStatus) {
    var rows = '';
    var add = function (k, v) {
      rows += '<div><strong>' + esc(k) + ':</strong> ' + esc(v == null ? '—' : String(v)) + '</div>';
    };
    add('HTTP status', httpStatus);
    add('status', data.status || data.statusCheck || '—');
    add('message', data.message || '—');
    if (data.host != null) add('host', data.host + (data.port != null ? ':' + data.port : ''));
    if (data.latencyMs != null) add('latency', data.latencyMs + ' ms');
    if (data.ldapBindVerified != null) add('LDAP bind verified', data.ldapBindVerified ? 'yes' : 'NO — reachability only');
    if (data.entriesFound != null) add('base-search entries', data.entriesFound);
    if (data.tls != null) add('TLS', data.tls ? 'yes' : 'no');
    if (data.note) add('note', data.note);
    if (data.error) add('error', data.error);
    return rows;
  }

  // Canonical settings.ldap shape; legacy AD shape is mapped onto it so
  // the form has exactly one field set whichever endpoint answered.
  function normalizeLoaded(data) {
    if (data && data.ldap) {
      return { source: 'canonical', cfg: data.ldap, stored: true };
    }
    if (data && data.ad) {
      var ad = data.ad;
      var url = null;
      if (ad.domainController) {
        url = (ad.ssl ? 'ldaps://' : 'ldap://') + ad.domainController +
          (ad.port ? ':' + ad.port : '');
      }
      return {
        source: 'legacy-ad',
        cfg: {
          url: url, bindDn: ad.bindUser || null, baseDn: ad.baseDn || null,
          groupBase: null, userFilter: ad.userFilter || null, groupFilter: null,
          bindPasswordConfigured: Boolean(ad.bindPasswordConfigured),
        },
        stored: true,
      };
    }
    return { source: 'none', cfg: {}, stored: false };
  }

  async function loadSettings() {
    try {
      return normalizeLoaded(await apiJson('/api/settings/auth/ldap'));
    } catch (e) {
      if (e && e.status === 404) {
        try {
          return normalizeLoaded(await apiJson('/api/settings/auth/ad'));
        } catch (e2) {
          throw e2;
        }
      }
      throw e;
    }
  }

  function readForm() {
    var port = $('port').value.trim();
    return {
      url: $('url').value.trim(),
      bindDn: $('bindDn').value.trim(),
      baseDn: $('baseDn').value.trim(),
      groupBase: $('groupBase').value.trim(),
      userFilter: $('userFilter').value.trim(),
      groupFilter: $('groupFilter').value.trim(),
      port: port,
    };
  }

  // Legacy AD save shape derived from the canonical form values.
  function toLegacySave(f) {
    var host = null; var port = null; var ssl = false;
    var m = /^(ldaps?):\/\/([^/:]+)(?::(\d+))?/i.exec(f.url || '');
    if (m) {
      ssl = m[1].toLowerCase() === 'ldaps';
      host = m[2];
      port = m[3] ? Number(m[3]) : null;
    } else if (f.url) {
      host = f.url;
    }
    if (f.port) port = Number(f.port);
    return {
      domainController: host, port: port, ssl: ssl,
      bindUser: f.bindDn || null, baseDn: f.baseDn || null,
      userFilter: f.userFilter || null,
    };
  }

  async function renderLdapSettingsView() {
    var ws = document.getElementById('workspaceContent');
    if (!ws) return;
    ws.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header"><span class="me-card-title">🔐 LDAP / Active Directory</span>' +
        '<span id="' + NS + 'badge" class="badge-me" style="font-size: 10px;">Loading…</span></div>' +
        '<div class="me-card-body" style="font-size: 12px;">' +
          '<div id="' + NS + 'banner" style="display:none; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 12px;"></div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
            '<label>LDAP URL<input id="' + NS + 'url" type="text" placeholder="ldap://dc.example.com:389" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Port (legacy AD only)<input id="' + NS + 'port" type="number" placeholder="389" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Bind DN<input id="' + NS + 'bindDn" type="text" placeholder="cn=svc-opmanager,dc=example,dc=com" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Bind password (test only — never stored)<input id="' + NS + 'bindPassword" type="password" autocomplete="off" placeholder="••••••••" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Base DN<input id="' + NS + 'baseDn" type="text" placeholder="dc=example,dc=com" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Group base DN<input id="' + NS + 'groupBase" type="text" placeholder="ou=Groups,dc=example,dc=com" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>User filter<input id="' + NS + 'userFilter" type="text" placeholder="(objectClass=user)" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Group filter<input id="' + NS + 'groupFilter" type="text" placeholder="(objectClass=group)" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
          '</div>' +
          '<div style="color: var(--text-muted); margin-top: 8px;">Bind password is sent only with a Test connection click, for that one call, and is never saved. ' +
          'If a bind password was previously configured it is not shown here — the server only reports whether one is configured.</div>' +
          '<div style="display: flex; gap: 8px; margin-top: 14px;">' +
            '<button id="' + NS + 'save" class="btn-me-primary">Save LDAP settings</button>' +
            '<button id="' + NS + 'test" class="btn-me-secondary">Test connection</button>' +
          '</div>' +
          '<div id="' + NS + 'result" style="display: none; margin-top: 14px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; line-height: 1.7;"></div>' +
        '</div>' +
      '</div>';

    var banner = $('banner');
    var badge = $('badge');
    var loaded;
    try {
      loaded = await loadSettings();
    } catch (e) {
      badge.textContent = 'Load failed';
      showResult('<strong>Failed to load LDAP settings:</strong> ' + esc(e.message), false);
      return;
    }
    var cfg = loaded.cfg || {};
    $('url').value = val(cfg.url);
    $('bindDn').value = val(cfg.bindDn);
    $('baseDn').value = val(cfg.baseDn);
    $('groupBase').value = val(cfg.groupBase);
    $('userFilter').value = val(cfg.userFilter);
    $('groupFilter').value = val(cfg.groupFilter);
    if (loaded.source === 'legacy-ad' && cfg.url) {
      var pm = /:(\d+)$/.exec(cfg.url);
      if (pm) $('port').value = pm[1];
    }
    var configured = isConfigured(cfg);
    badge.textContent = configured
      ? (cfg.bindPasswordConfigured ? 'Configured (bind password set)' : 'Configured')
      : 'Not configured';
    if (loaded.source === 'legacy-ad') {
      banner.style.display = 'block';
      banner.textContent = 'Canonical endpoint GET /api/settings/auth/ldap is not present in this build yet (ldap-routes track), so this form is showing the legacy AD settings and the test below verifies TCP reachability only — it does not verify the LDAP bind.';
    } else if (!configured) {
      banner.style.display = 'block';
      banner.textContent = 'No LDAP server is configured. Fill in the LDAP URL and bind DN, then use Test connection before saving.';
    }

    $('save').addEventListener('click', async function () {
      var f = readForm();
      var body = {
        url: f.url || null, bindDn: f.bindDn || null, baseDn: f.baseDn || null,
        groupBase: f.groupBase || null, userFilter: f.userFilter || null,
        groupFilter: f.groupFilter || null,
      };
      try {
        var saved = await apiJson('/api/settings/auth/ldap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        showResult('<strong>Saved.</strong> ' + esc(saved.message || 'LDAP configuration saved.') +
          '<div>Stored via: <code>POST /api/settings/auth/ldap</code></div>', true);
      } catch (e) {
        if (e && e.status === 404) {
          try {
            var legacy = await apiJson('/api/settings/auth/ad', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toLegacySave(f)),
            });
            showResult('<strong>Saved to the legacy AD store.</strong> ' + esc(legacy.message || '') +
              '<div>Canonical endpoint <code>POST /api/settings/auth/ldap</code> returned 404 in this build, so the values were saved via <code>POST /api/settings/auth/ad</code>. No password was sent.</div>', true);
          } catch (e2) {
            showResult('<strong>Save failed:</strong> ' + esc(e2.message), false);
          }
        } else {
          showResult('<strong>Save failed:</strong> ' + esc(e.message), false);
        }
      }
    });

    $('test').addEventListener('click', async function () {
      var f = readForm();
      var pwEl = $('bindPassword');
      var password = pwEl ? pwEl.value : '';
      // Send BOTH shapes: the canonical `url` (used by the ldap-routes
      // build's real-bind test) and the legacy domainController/port/ssl
      // fields (the only ones the base branch's test reads). The password
      // is transient for this one call only — never stored, never logged.
      var host = null; var port = null; var ssl = false;
      var m = /^(ldaps?):\/\/([^/:]+)(?::(\d+))?/i.exec(f.url || '');
      if (m) {
        ssl = m[1].toLowerCase() === 'ldaps';
        host = m[2];
        port = m[3] ? Number(m[3]) : null;
      } else if (f.url) {
        host = f.url;
      }
      if (f.port) port = Number(f.port);
      try {
        var res = await fetch('/api/settings/auth/ad/test', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: f.url || null, domainController: host, host: host,
            port: port, ssl: ssl,
            bindDn: f.bindDn || null, bindUser: f.bindDn || null,
            password: password || null, baseDn: f.baseDn || null,
          }),
        });
        var data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON */ }
        data = data || {};
        showResult(resultFromTest(data, res.status), res.ok && data.status !== 'error');
      } catch (e) {
        showResult('<strong>Test failed:</strong> ' + esc(e.message), false);
      } finally {
        // The bind password lives only for this one test call: clear the
        // field and drop the local reference.
        if (pwEl) pwEl.value = '';
        password = '';
      }
    });
  }

  if (typeof window !== 'undefined') {
    if (window.OpManager) window.OpManager.renderLdapSettingsView = renderLdapSettingsView;
    window.OpManagerSettingsUi = window.OpManagerSettingsUi || {};
    window.OpManagerSettingsUi.renderLdap = renderLdapSettingsView;
  }
})();
