'use strict';
/**
 * Phase 3 — settings-ui track: SAML 2.0 Single Sign-On settings form.
 *
 * WIRING (close-out agent — this file is self-contained and does NOT edit
 * client/js/app.js):
 *   1. Script tag: add `<script src="/js/p3/settings-ui-saml.js"></script>`
 *      to `client/noc.html` AFTER the existing
 *      `<script src="/js/app.js"></script>` line.
 *   2. Sub-tab: in `client/js/app.js`, `MENU_DEFINITIONS.settings.subTabs`,
 *      add the string `'SAML Single Sign-On'`.
 *   3. Branch: in `client/js/app.js`, `renderSettingsView()`, add BEFORE
 *      the default settings render (same pattern as the existing
 *      'Workflow Automation' / 'Probe Mutual Auth' / 'Central System Info'
 *      branches):
 *        if (state.currentSubTab === 'SAML Single Sign-On') {
 *          window.OpManager.renderSamlSettingsView();
 *          return;
 *        }
 *   4. This file registers itself below
 *      (`window.OpManager.renderSamlSettingsView = renderSamlSettingsView`
 *      when `window.OpManager` exists, plus the
 *      `window.OpManagerSettingsUi.renderSaml` namespace), so step 3 works
 *      with no other app.js change.
 *
 * ENDPOINTS (real, already on the real-data branch in
 * server/routes/settings.js):
 *   GET  /api/settings/auth/saml — stored config. The IdP certificate
 *        itself is NEVER returned; only `certificateConfigured` (boolean).
 *   POST /api/settings/auth/saml — save. The certificate field is only
 *        sent when the textarea is non-empty, so saving other fields
 *        never wipes the stored certificate.
 *   POST /api/settings/auth/saml/test — real validation of the stored /
 *        submitted config: required fields present, stored certificate
 *        parsed with crypto.X509Certificate and checked for expiry, IdP
 *        metadata fetched over HTTP(S) when an IdP SSO URL is set. It does
 *        NOT perform a SAML login flow, and the response says so.
 *
 * CANONICAL SHAPE (Phase 4 merge, branch p4m-saml — reconciled):
 * `settings.saml` (store key `saml`) is the routes shape
 * { enabled, idpEntityId, idpSsoUrl, spAcsUrl, jitProvisioning,
 * defaultRole, certificate } PLUS the SHARED.md fields
 * { idpMetadataUrl, idpMetadataXml, spEntityId, spCert } where present
 * (server/routes/settings.js mirrors the save into store key `saml`;
 * the service reads both keys). This form wires to the real fields
 * above (idpEntityId, idpSsoUrl, spAcsUrl, certificate) — the
 * metadata-URL/XML, SP entity ID and SP cert fields are accepted by
 * the same save endpoint when present in the stored record, but this
 * form does not render inputs for them yet. The SP private key
 * (spKey) has no endpoint at all: there is no field for it here, and
 * no key material is ever accepted, displayed or stored by this form.
 * Canonical ACS path is /api/auth/saml/acs (see docs/saml.md).
 *
 * SECRETS: the certificate textarea holds a PUBLIC certificate (PEM), not
 * a secret — but the stored one is never echoed back by the server and
 * this form never displays it. No private key is handled anywhere.
 *
 * UNCONFIGURED STATE: when nothing is stored the form renders the honest
 * "Not configured" badge, empty fields, and "No certificate stored" —
 * no invented IdP, entity ID or certificate is ever shown.
 */
(function () {
  var NS = 'p3-saml-';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function val(v) {
    return v == null ? '' : String(v);
  }

  function isConfigured(cfg) {
    return Boolean(cfg && (cfg.enabled || cfg.idpEntityId || cfg.idpSsoUrl || cfg.spAcsUrl || cfg.certificateConfigured));
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

  function readForm() {
    return {
      enabled: Boolean($('enabled') && $('enabled').checked),
      idpEntityId: $('idpEntityId').value.trim() || null,
      idpSsoUrl: $('idpSsoUrl').value.trim() || null,
      spAcsUrl: $('spAcsUrl').value.trim() || null,
      certificate: $('certificate').value.trim() || null,
      jitProvisioning: Boolean($('jitProvisioning') && $('jitProvisioning').checked),
      defaultRole: $('defaultRole').value || null,
    };
  }

  function fillForm(cfg) {
    $('enabled').checked = Boolean(cfg.enabled);
    $('idpEntityId').value = val(cfg.idpEntityId);
    $('idpSsoUrl').value = val(cfg.idpSsoUrl);
    $('spAcsUrl').value = val(cfg.spAcsUrl);
    $('certificate').value = '';
    $('jitProvisioning').checked = Boolean(cfg.jitProvisioning);
    $('defaultRole').value = val(cfg.defaultRole) || '';
  }

  function checksHtml(checks) {
    if (!Array.isArray(checks) || !checks.length) return '';
    return '<div style="margin-top: 8px;">' + checks.map(function (c) {
      var detail = '<div style="color: var(--text-muted);">' + esc(c.detail || '') + '</div>';
      if (c.certificate) {
        detail += '<div style="color: var(--text-muted);">subject: ' + esc(c.certificate.subject || '—') +
          ' • valid ' + esc(c.certificate.validFrom || '—') + ' to ' + esc(c.certificate.validTo || '—') +
          ' • SHA-256: ' + esc(c.certificate.fingerprint256 || '—') + '</div>';
      }
      if (c.fetch) {
        detail += '<div style="color: var(--text-muted);">fetch: HTTP ' + esc(c.fetch.statusCode == null ? '—' : c.fetch.statusCode) +
          ', ' + esc(c.fetch.bytes == null ? '—' : c.fetch.bytes) + ' bytes' +
          (c.fetch.certificate ? ' • IdP cert subject: ' + esc(c.fetch.certificate.subject || '—') +
            ' (authorized: ' + esc(String(c.fetch.certificate.authorized)) + ')' : '') + '</div>';
      }
      return '<div style="padding: 6px 0; border-top: 1px solid var(--border-color);">' +
        (c.passed ? '✅' : '❌') + ' <strong>' + esc(c.check) + '</strong>' + detail + '</div>';
    }).join('') + '</div>';
  }

  async function renderSamlSettingsView() {
    var ws = document.getElementById('workspaceContent');
    if (!ws) return;
    ws.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header"><span class="me-card-title">🔑 SAML 2.0 Single Sign-On</span>' +
        '<span id="' + NS + 'badge" class="badge-me" style="font-size: 10px;">Loading…</span></div>' +
        '<div class="me-card-body" style="font-size: 12px;">' +
          '<div id="' + NS + 'banner" style="display:none; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 12px;"></div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
            '<label style="grid-column: 1 / -1;"><input id="' + NS + 'enabled" type="checkbox"> Enable SAML single sign-on</label>' +
            '<label>IdP entity ID<input id="' + NS + 'idpEntityId" type="text" placeholder="https://idp.example.com/metadata" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>IdP SSO URL<input id="' + NS + 'idpSsoUrl" type="text" placeholder="https://idp.example.com/sso" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>SP ACS URL<input id="' + NS + 'spAcsUrl" type="text" placeholder="https://opmanager.example.com/api/auth/saml/acs" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px;"></label>' +
            '<label>Default role for JIT users<select id="' + NS + 'defaultRole" style="width: 100%; padding: 6px; margin-top: 4px;">' +
              '<option value="">— none —</option><option value="Viewer">Viewer</option>' +
              '<option value="Operator">Operator</option><option value="admin">admin</option></select></label>' +
            '<label style="grid-column: 1 / -1;">IdP certificate (PEM) — <span id="' + NS + 'certState">No certificate stored</span><br>' +
              '<textarea id="' + NS + 'certificate" rows="4" placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----" autocomplete="off" style="width: 100%; padding: 6px; margin-top: 4px; font-family: monospace;"></textarea>' +
              '<span style="color: var(--text-muted);">Paste a new certificate to replace the stored one; leave empty to keep the current certificate. The stored certificate is never shown back.</span></label>' +
            '<label style="grid-column: 1 / -1;"><input id="' + NS + 'jitProvisioning" type="checkbox"> Just-in-time provisioning (create local users on first SAML login)</label>' +
          '</div>' +
          '<div style="color: var(--text-muted); margin-top: 8px;">Test validates the configuration (required fields, certificate expiry, IdP metadata fetch). It does not perform a SAML login flow. No SP private key is handled here — no endpoint for one exists yet.</div>' +
          '<div style="display: flex; gap: 8px; margin-top: 14px;">' +
            '<button id="' + NS + 'save" class="btn-me-primary">Save SAML settings</button>' +
            '<button id="' + NS + 'test" class="btn-me-secondary">Validate configuration</button>' +
          '</div>' +
          '<div id="' + NS + 'result" style="display: none; margin-top: 14px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; line-height: 1.7;"></div>' +
        '</div>' +
      '</div>';

    var badge = $('badge');
    var banner = $('banner');
    var cfg;
    try {
      var loaded = await apiJson('/api/settings/auth/saml');
      cfg = loaded.saml || {};
    } catch (e) {
      badge.textContent = 'Load failed';
      showResult('<strong>Failed to load SAML settings:</strong> ' + esc(e.message), false);
      return;
    }
    fillForm(cfg);
    $('certState').textContent = cfg.certificateConfigured ? 'Certificate stored (not shown)' : 'No certificate stored';
    var configured = isConfigured(cfg);
    badge.textContent = configured ? (cfg.enabled ? 'Configured — enabled' : 'Configured — disabled') : 'Not configured';
    if (!configured) {
      banner.style.display = 'block';
      banner.textContent = 'SAML is not configured. Fill in the IdP entity ID and SSO URL, then use Validate configuration before enabling it.';
    }

    $('save').addEventListener('click', async function () {
      var f = readForm();
      // Omit an empty certificate so the stored one is never wiped by a
      // save that only changes other fields.
      var body = {
        enabled: f.enabled, idpEntityId: f.idpEntityId, idpSsoUrl: f.idpSsoUrl,
        spAcsUrl: f.spAcsUrl, jitProvisioning: f.jitProvisioning,
        defaultRole: f.defaultRole,
      };
      if (f.certificate) body.certificate = f.certificate;
      try {
        var saved = await apiJson('/api/settings/auth/saml', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        $('certificate').value = '';
        var sc = saved.saml || {};
        $('certState').textContent = sc.certificateConfigured ? 'Certificate stored (not shown)' : 'No certificate stored';
        badge.textContent = isConfigured(sc) ? (sc.enabled ? 'Configured — enabled' : 'Configured — disabled') : 'Not configured';
        showResult('<strong>Saved.</strong> ' + esc(saved.message || 'SAML settings saved.'), true);
      } catch (e) {
        showResult('<strong>Save failed:</strong> ' + esc(e.message), false);
      }
    });

    $('test').addEventListener('click', async function () {
      var f = readForm();
      var body = {
        enabled: f.enabled, idpEntityId: f.idpEntityId, idpSsoUrl: f.idpSsoUrl,
        spAcsUrl: f.spAcsUrl, jitProvisioning: f.jitProvisioning,
        defaultRole: f.defaultRole,
      };
      if (f.certificate) body.certificate = f.certificate;
      try {
        var res = await fetch('/api/settings/auth/saml/test', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        var data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON */ }
        data = data || {};
        var html = '<div><strong>HTTP status:</strong> ' + esc(res.status) + '</div>' +
          '<div><strong>status:</strong> ' + esc(data.status || data.statusCheck || '—') + '</div>' +
          '<div><strong>message:</strong> ' + esc(data.message || '—') + '</div>' +
          (data.testedAt ? '<div><strong>tested at:</strong> ' + esc(data.testedAt) + '</div>' : '') +
          checksHtml(data.checks) +
          (data.note ? '<div style="color: var(--text-muted); margin-top: 8px;">' + esc(data.note) + '</div>' : '');
        showResult(html, res.ok && data.status !== 'error');
      } catch (e) {
        showResult('<strong>Validation failed:</strong> ' + esc(e.message), false);
      }
    });
  }

  if (typeof window !== 'undefined') {
    if (window.OpManager) window.OpManager.renderSamlSettingsView = renderSamlSettingsView;
    window.OpManagerSettingsUi = window.OpManagerSettingsUi || {};
    window.OpManagerSettingsUi.renderSaml = renderSamlSettingsView;
  }
})();
