'use strict';
/**
 * Phase 3 track: saml-ui — SAML 2.0 Single Sign-On settings UI.
 *
 * WIRING (close-out agent — do NOT edit client/js/app.js in this track):
 *  1. Load this file in client/noc.html immediately AFTER the app.js script
 *     tag:  <script src="/js/p3/saml-ui.js"></script>
 *  2. In client/js/app.js, TAB_CONFIG.settings.subTabs, add the string
 *     'SAML Single Sign-On' to the subTabs array.
 *  3. In client/js/app.js, renderSettingsView(), add a branch BEFORE the
 *     default settings render (same pattern as the existing
 *     'Workflow Automation' / 'Probe Mutual Auth' / 'Central System Info'
 *     branches):
 *       if (state.currentSubTab === 'SAML Single Sign-On') {
 *         window.OpManager.renderSamlSettingsView();
 *         return;
 *       }
 *  4. In client/js/app.js, add renderSamlSettingsView to the
 *     window.OpManager export object at the bottom of the file.
 *
 * This file is self-contained: it defines its own fetch/escape helpers and
 * only touches window.OpManager (to register renderSamlSettingsView) and the
 * #workspaceContent element that app.js renders views into. It never reads
 * or writes app.js internals (state, DOM, apiJson, escapeHtml).
 *
 * Endpoints used (all real, already in server/routes/settings.js on the
 * real-data branch):
 *  GET  /api/settings/auth/saml       — stored config; the certificate itself
 *                                       is never returned, only
 *                                       certificateConfigured (boolean).
 *  POST /api/settings/auth/saml       — save; body fields are merged over the
 *                                       stored config.
 *  POST /api/settings/auth/saml/test  — validate the stored/merged config for
 *                                       real (required fields, X.509 parse of
 *                                       the stored certificate, IdP metadata
 *                                       fetch over HTTP(S)). Returns HTTP 501
 *                                       {error:'not_implemented'} when no SAML
 *                                       configuration is stored. It does NOT
 *                                       perform a SAML login flow, and the UI
 *                                       says so wherever test results appear.
 *
 * Field mapping (UI field -> stored settings.saml field):
 *  Enable SAML SSO            -> enabled
 *  IdP metadata URL           -> idpMetadataUrl  (canonical schema field;
 *                               persisted; the current test endpoint fetches
 *                               idpSsoUrl, NOT this field — see note below)
 *  IdP metadata XML (paste)   -> idpMetadataXml  (canonical schema field;
 *                               persisted; "Parse metadata" extracts the
 *                               entityID, SSO URL and signing certificate
 *                               from it with a real DOMParser parse)
 *  IdP entity ID              -> idpEntityId    (required by the test)
 *  IdP SSO URL                -> idpSsoUrl      (required by the test; the
 *                               URL the test endpoint actually fetches and
 *                               checks for an EntityDescriptor document)
 *  SP entity ID               -> spEntityId     (canonical schema field)
 *  SP ACS URL                 -> spAcsUrl
 *  IdP signing certificate    -> certificate    (never echoed back by GET;
 *                               leave the textarea blank on save to keep the
 *                               stored certificate unchanged)
 *  JIT provisioning           -> jitProvisioning
 *  Default role for JIT users -> defaultRole
 *
 * KNOWN GAP (backend, not UI): the current test endpoint only fetches
 * idpSsoUrl. A metadata URL entered in idpMetadataUrl alone is stored but
 * not fetched by the test; the UI labels the SSO URL field with exactly
 * that fact so the operator is not misled. The saml-routes track owns
 * aligning the test with the canonical idpMetadataUrl/idpMetadataXml
 * fields; this UI already sends them, so no UI change is needed when the
 * backend catches up.
 */
(function () {
  var API_GET = '/api/settings/auth/saml';
  var API_SAVE = '/api/settings/auth/saml';
  var API_TEST = '/api/settings/auth/saml/test';

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

  // fetch JSON with the session cookie; on HTTP error throw an Error carrying
  // the server's own message plus .status and .data so the UI can report the
  // real outcome (including the honest 501 no-configuration state).
  function samlJson(url, options) {
    return fetch(url, { credentials: 'include' }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON body */ }
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

  function samlPost(url, body) {
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
          var err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data || {};
      });
    });
  }

  // ------------------------------------------------------- metadata parsing
  // Real client-side parse of pasted IdP metadata XML. Returns
  // { entityId, ssoUrl, certificatePem } with nulls for anything absent;
  // throws on XML that does not parse.
  function parseIdpMetadataXml(xmlText) {
    var doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    var parseErr = doc.getElementsByTagName('parsererror')[0];
    if (parseErr) throw new Error('Metadata XML does not parse: ' + parseErr.textContent);
    var root = doc.documentElement;
    if (!root || root.tagName.indexOf('EntityDescriptor') === -1) {
      throw new Error('Metadata XML has no EntityDescriptor root element.');
    }
    var out = { entityId: root.getAttribute('entityID') || null, ssoUrl: null, certificatePem: null };
    var ssoNodes = doc.getElementsByTagNameNS('*', 'SingleSignOnService');
    for (var i = 0; i < ssoNodes.length; i++) {
      var loc = ssoNodes[i].getAttribute('Location');
      var binding = ssoNodes[i].getAttribute('Binding') || '';
      if (!loc) continue;
      if (!out.ssoUrl) out.ssoUrl = loc;
      if (binding.indexOf('HTTP-Redirect') !== -1) { out.ssoUrl = loc; break; }
    }
    var certNodes = doc.getElementsByTagNameNS('*', 'X509Certificate');
    if (certNodes.length) {
      var b64 = (certNodes[0].textContent || '').replace(/\s+/g, '');
      if (b64) {
        var wrapped = b64.replace(/(.{64})/g, '$1\n');
        out.certificatePem = '-----BEGIN CERTIFICATE-----\n' + wrapped + '\n-----END CERTIFICATE-----';
      }
    }
    return out;
  }

  // ------------------------------------------------------------ form values
  // Read the form. The certificate textarea is only included when it has
  // content: the server never echoes the stored certificate back, so an
  // empty textarea means "keep the stored certificate", not "delete it".
  function readForm() {
    var body = {
      enabled: $('saml-enabled') ? $('saml-enabled').checked : false,
      idpMetadataUrl: val('saml-idp-metadata-url'),
      idpMetadataXml: val('saml-idp-metadata-xml'),
      idpEntityId: val('saml-idp-entity-id'),
      idpSsoUrl: val('saml-idp-sso-url'),
      spEntityId: val('saml-sp-entity-id'),
      spAcsUrl: val('saml-sp-acs-url'),
      jitProvisioning: $('saml-jit') ? $('saml-jit').checked : false,
      defaultRole: val('saml-default-role'),
    };
    var cert = val('saml-certificate');
    if (cert) body.certificate = cert;
    return body;
  }

  function val(id) {
    var el = $(id);
    if (!el) return null;
    var v = (el.value || '').trim();
    return v === '' ? null : v;
  }

  function setVal(id, v) {
    var el = $(id);
    if (el) el.value = v === null || v === undefined ? '' : String(v);
  }

  function setChecked(id, v) {
    var el = $(id);
    if (el) el.checked = Boolean(v);
  }

  // ------------------------------------------------------------- status area
  function statusHtml(inner) {
    var box = $('saml-status');
    if (box) box.innerHTML = inner;
  }

  function checkRow(c) {
    var badge = c.passed
      ? '<span style="color:#16a34a;font-weight:800;">PASS</span>'
      : '<span style="color:#dc2626;font-weight:800;">FAIL</span>';
    var extra = '';
    if (c.certificate && c.certificate.parsed) {
      extra = '<div style="color:var(--text-muted);">Subject: ' + esc(c.certificate.subject) +
        '<br>Issuer: ' + esc(c.certificate.issuer) +
        '<br>Valid: ' + esc(c.certificate.validFrom) + ' to ' + esc(c.certificate.validTo) +
        '<br>SHA-256 fingerprint: <code>' + esc(c.certificate.fingerprint256) + '</code>' +
        '<br>Serial: <code>' + esc(c.certificate.serialNumber) + '</code></div>';
    }
    if (c.fetch) {
      var f = c.fetch;
      extra = '<div style="color:var(--text-muted);">' +
        (f.ok ? 'HTTP ' + esc(f.statusCode) + ', ' + esc(f.bytes) + ' bytes' : 'Fetch failed: ' + esc(f.error || ('HTTP ' + f.statusCode))) +
        (f.contentType ? ' • Content-Type: ' + esc(f.contentType) : '') +
        (f.looksLikeMetadata === true ? ' • Contains EntityDescriptor' : f.looksLikeMetadata === false ? ' • Does NOT contain EntityDescriptor' : '') +
        (f.certificate ? '<br>TLS peer cert: ' + esc(f.certificate.subject || '—') + ' (issuer ' + esc(f.certificate.issuer || '—') + ', valid to ' + esc(f.certificate.validTo || '—') + ', authorized: ' + esc(f.certificate.authorized) + (f.certificate.authorizationError ? ' — ' + esc(f.certificate.authorizationError) : '') + ')' : '') +
        '</div>';
    }
    return '<div style="padding:8px 0;border-top:1px solid var(--border-color);font-size:12px;">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;"><code>' + esc(c.check) + '</code>' + badge + '</div>' +
      '<div style="margin-top:2px;">' + esc(c.detail || '') + '</div>' + extra + '</div>';
  }

  function renderTestResult(data) {
    var ok = data && data.status === 'success';
    var badge = ok
      ? '<span style="background:rgba(34,197,94,.15);color:#16a34a;padding:2px 8px;border-radius:10px;font-weight:800;font-size:11px;">VALIDATED</span>'
      : '<span style="background:rgba(239,68,68,.15);color:#dc2626;padding:2px 8px;border-radius:10px;font-weight:800;font-size:11px;">FAILED</span>';
    var checks = (data && data.checks) || [];
    statusHtml(
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
        '<strong style="font-size:13px;">Test result ' + badge + '</strong>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + esc(data.testedAt || '') + '</span>' +
      '</div>' +
      '<p style="font-size:12px;margin:8px 0;">' + esc(data.message || '') + '</p>' +
      (checks.length ? checks.map(checkRow).join('') : '<p style="font-size:12px;">No checks were returned.</p>') +
      '<p style="font-size:11px;color:var(--text-muted);margin:10px 0 0;">' + esc(data.note || 'This validates the stored SAML configuration and IdP metadata reachability. It does not perform a SAML login flow.') + '</p>'
    );
  }

  function renderNoConfig(message) {
    statusHtml(
      '<div style="text-align:center;padding:18px 8px;">' +
        '<div style="font-size:16px;font-weight:700;">No SAML configuration is stored</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;max-width:520px;margin-left:auto;margin-right:auto;">' +
        esc(message || 'There is nothing to validate yet. Enter the IdP details above and save them, then run the test.') +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:8px;">The test validates the stored configuration and IdP metadata reachability. It does not perform a SAML login flow.</div>' +
      '</div>'
    );
  }

  function renderError(message) {
    statusHtml('<div style="color:var(--severity-critical);font-size:12px;padding:10px 0;">' + esc(message) + '</div>');
  }

  // ------------------------------------------------------------ main render
  function renderSamlSettingsView() {
    var workspace = document.getElementById('workspaceContent');
    if (!workspace) return;
    workspace.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header">' +
          '<span class="me-card-title">🔐 SAML 2.0 Single Sign-On</span>' +
          '<span id="saml-saved-state" style="font-size:11px;color:var(--text-muted);">Loading saved settings…</span>' +
        '</div>' +
        '<div class="me-card-body" style="font-size:12px;">' +
          '<p style="color:var(--text-muted);margin:0 0 14px;">Configure the identity provider this console trusts for single sign-on. ' +
          'Settings are saved to the server; the signing certificate is stored but never shown back. ' +
          'The test validates the configuration and IdP metadata reachability — it does <strong>not</strong> perform a SAML login flow.</p>' +

          '<label style="display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:14px;">' +
            '<input type="checkbox" id="saml-enabled"> Enable SAML SSO</label>' +

          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
            '<div>' +
              '<label for="saml-idp-metadata-url" style="font-weight:700;">IdP metadata URL</label>' +
              '<input id="saml-idp-metadata-url" type="url" placeholder="https://idp.example.com/metadata" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Metadata document URL (stored; the current test fetches the SSO URL below instead).</div>' +
            '</div>' +
            '<div>' +
              '<label for="saml-idp-entity-id" style="font-weight:700;">IdP entity ID *</label>' +
              '<input id="saml-idp-entity-id" type="text" placeholder="https://idp.example.com/entity-id" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Required by the configuration test.</div>' +
            '</div>' +
            '<div>' +
              '<label for="saml-idp-sso-url" style="font-weight:700;">IdP SSO URL *</label>' +
              '<input id="saml-idp-sso-url" type="url" placeholder="https://idp.example.com/sso" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Required by the test — this is the URL the test fetches and checks for an EntityDescriptor document.</div>' +
            '</div>' +
            '<div>' +
              '<label for="saml-sp-entity-id" style="font-weight:700;">SP entity ID (this console)</label>' +
              '<input id="saml-sp-entity-id" type="text" placeholder="https://opmanager.example.com/saml/sp" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Entity ID this console presents to the IdP.</div>' +
            '</div>' +
            '<div>' +
              '<label for="saml-sp-acs-url" style="font-weight:700;">SP ACS URL</label>' +
              '<input id="saml-sp-acs-url" type="url" placeholder="https://opmanager.example.com/api/auth/saml/acs" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Assertion Consumer Service URL the IdP posts SAML responses to.</div>' +
            '</div>' +
            '<div>' +
              '<label for="saml-default-role" style="font-weight:700;">Default role for JIT-provisioned users</label>' +
              '<input id="saml-default-role" type="text" placeholder="operator" ' +
                'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;">' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Role assigned when a SAML user is created on first login.</div>' +
            '</div>' +
          '</div>' +

          '<div style="margin-top:14px;">' +
            '<label for="saml-idp-metadata-xml" style="font-weight:700;">IdP metadata XML (paste)</label>' +
            '<textarea id="saml-idp-metadata-xml" rows="6" placeholder="Paste the IdP metadata XML document here…" ' +
              'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;font-family:monospace;font-size:11px;"></textarea>' +
            '<div style="display:flex;gap:8px;margin-top:6px;align-items:center;">' +
              '<button class="btn-me-secondary" id="saml-parse-metadata" type="button" style="padding:6px 12px;font-size:12px;">Parse metadata &amp; fill fields</button>' +
              '<span id="saml-parse-note" style="font-size:11px;color:var(--text-muted);">Extracts entity ID, SSO URL and signing certificate from the pasted XML.</span>' +
            '</div>' +
          '</div>' +

          '<div style="margin-top:14px;">' +
            '<label for="saml-certificate" style="font-weight:700;">IdP signing certificate (PEM)</label>' +
            '<textarea id="saml-certificate" rows="6" placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----" ' +
              'style="width:100%;padding:8px;margin-top:4px;border:1px solid var(--border-color);border-radius:4px;font-family:monospace;font-size:11px;"></textarea>' +
            '<div id="saml-cert-state" style="font-size:11px;color:var(--text-muted);margin-top:4px;">No certificate stored.</div>' +
            '<div style="font-size:11px;color:var(--text-muted);">The server never shows the stored certificate back. Leave this blank when saving to keep the stored certificate unchanged; paste a new PEM to replace it.</div>' +
          '</div>' +

          '<label style="display:flex;align-items:center;gap:8px;margin-top:14px;">' +
            '<input type="checkbox" id="saml-jit"> JIT provisioning — create local users on first SAML login</label>' +

          '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">' +
            '<button class="btn-me-primary" id="saml-save" type="button">Save SAML settings</button>' +
            '<button class="btn-me-secondary" id="saml-test" type="button">Test configuration</button>' +
            '<span id="saml-save-note" style="font-size:11px;color:var(--text-muted);align-self:center;"></span>' +
          '</div>' +

          '<div style="margin-top:16px;border-top:1px solid var(--border-color);padding-top:12px;">' +
            '<div style="font-weight:700;margin-bottom:6px;">Validation status</div>' +
            '<div id="saml-status"><div style="font-size:12px;color:var(--text-muted);">No test run yet.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ------------------------------------------------------------ wire events
    var saveBtn = $('saml-save');
    if (saveBtn) saveBtn.addEventListener('click', function () {
      var note = $('saml-save-note');
      if (note) note.textContent = 'Saving…';
      samlPost(API_SAVE, readForm()).then(function (data) {
        if (note) note.textContent = (data && data.message) || 'Saved.';
        applySavedState(data.saml || {});
      }).catch(function (e) {
        if (note) note.textContent = '';
        renderError('Save failed: ' + e.message);
      });
    });

    var testBtn = $('saml-test');
    if (testBtn) testBtn.addEventListener('click', function () {
      statusHtml('<div style="font-size:12px;color:var(--text-muted);">Testing configuration…</div>');
      // Send the on-screen values so the test validates what the operator
      // sees; the server merges them over the stored config (an empty
      // certificate field keeps the stored certificate in the merge).
      samlPost(API_TEST, readForm()).then(function (data) {
        renderTestResult(data);
      }).catch(function (e) {
        if (e && e.status === 501) renderNoConfig(e.message);
        else renderError('Test failed: ' + e.message);
      });
    });

    var parseBtn = $('saml-parse-metadata');
    if (parseBtn) parseBtn.addEventListener('click', function () {
      var note = $('saml-parse-note');
      var xml = val('saml-idp-metadata-xml');
      if (!xml) { if (note) note.textContent = 'Paste IdP metadata XML first.'; return; }
      try {
        var parsed = parseIdpMetadataXml(xml);
        if (parsed.entityId) setVal('saml-idp-entity-id', parsed.entityId);
        if (parsed.ssoUrl) setVal('saml-idp-sso-url', parsed.ssoUrl);
        if (parsed.certificatePem) setVal('saml-certificate', parsed.certificatePem);
        var filled = [];
        if (parsed.entityId) filled.push('entity ID');
        if (parsed.ssoUrl) filled.push('SSO URL');
        if (parsed.certificatePem) filled.push('certificate');
        if (note) note.textContent = filled.length
          ? 'Filled from metadata: ' + filled.join(', ') + '.'
          : 'Metadata parsed, but it contained no entity ID, SSO URL or certificate to fill.';
      } catch (e) {
        if (note) note.textContent = 'Could not parse metadata: ' + e.message;
      }
    });

    // ------------------------------------------------------------ load saved
    samlJson(API_GET).then(function (data) {
      applySavedState(data.saml || {});
    }).catch(function (e) {
      var stateEl = $('saml-saved-state');
      if (stateEl) stateEl.textContent = 'Could not load saved settings: ' + e.message;
      renderError('Failed to load saved SAML settings: ' + e.message);
    });
  }

  function applySavedState(s) {
    setChecked('saml-enabled', s.enabled);
    setVal('saml-idp-metadata-url', s.idpMetadataUrl);
    setVal('saml-idp-metadata-xml', s.idpMetadataXml);
    setVal('saml-idp-entity-id', s.idpEntityId);
    setVal('saml-idp-sso-url', s.idpSsoUrl);
    setVal('saml-sp-entity-id', s.spEntityId);
    setVal('saml-sp-acs-url', s.spAcsUrl);
    setChecked('saml-jit', s.jitProvisioning);
    setVal('saml-default-role', s.defaultRole);
    // The certificate itself is never returned; only whether one is stored.
    var certState = $('saml-cert-state');
    if (certState) {
      certState.textContent = s.certificateConfigured
        ? 'A signing certificate is stored on the server (its contents are never shown back).'
        : 'No certificate stored.';
    }
    var stateEl = $('saml-saved-state');
    if (stateEl) {
      var configured = Boolean(s.idpEntityId || s.idpSsoUrl || s.idpMetadataUrl || s.certificateConfigured || s.enabled);
      stateEl.textContent = configured
        ? 'Saved: ' + (s.enabled ? 'enabled' : 'disabled') +
          (s.idpEntityId ? ' • IdP ' + s.idpEntityId : '') +
          (s.certificateConfigured ? ' • certificate stored' : ' • no certificate stored')
        : 'No SAML configuration stored yet.';
    }
    // Show the honest no-configuration state until a test is run.
    var hasAny = Boolean(s.idpEntityId || s.idpSsoUrl || s.idpMetadataUrl || s.idpMetadataXml || s.certificateConfigured || s.enabled);
    if (!hasAny) renderNoConfig('No SAML configuration is stored, so there is nothing to validate.');
  }

  // Register on the app's public controller (app.js exposes window.OpManager).
  // If app.js has not run yet, retry on DOMContentLoaded; the script tag is
  // placed after app.js in noc.html, so this is only a safety net.
  function register() {
    if (window.OpManager) {
      window.OpManager.renderSamlSettingsView = renderSamlSettingsView;
    }
    window.OpManagerSamlUi = {
      renderSamlSettingsView: renderSamlSettingsView,
      parseIdpMetadataXml: parseIdpMetadataXml,
      readForm: readForm,
    };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    register();
  }
})();
