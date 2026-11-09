'use strict';
/**
 * SAML 2.0 Service Provider routes — Phase 4 merge (branch p4m-saml).
 *
 * Canonical merge of the Phase 3 SAML tracks: the service is
 * saml-service's strict @node-saml implementation
 * (server/services/saml.js — bearer-Recipient + Response-Destination
 * enforcement, InResponseTo always validated, encrypted assertions
 * supported via decryptionPvk); the router is saml-routes', repointed
 * from /api/saml/* to the canonical /api/auth/saml/* paths.
 * saml-proof's hand-rolled xml-crypto service and its /saml/* router
 * were RETIRED, not merged (guard-bypass mount, opposite behaviour on
 * IdP-initiated SSO and encrypted assertions); its proof scripts were
 * repointed at these canonical paths instead (scripts/saml-proof.js,
 * scripts/saml-test-idp.js).
 *
 * Mounted from server/index.js (`app.use(samlRoute)`). The SP service
 * itself lives in server/services/saml.js (saml-service track; copied into
 * this clone so the routes run standalone) and owns all XML parsing,
 * canonicalization and XML-DSig verification via @node-saml/node-saml
 * 5.2.0. This file only wires HTTP: it never hand-rolls a signature check
 * and never fabricates a SAML message.
 *
 * Endpoints:
 *  - GET  /api/auth/saml/metadata — real SP metadata XML (public: an IdP fetches
 *    it without a session). Works with SP identity alone (spEntityId +
 *    spAcsUrl); no IdP needs to be configured yet. 501 while the SP
 *    identity is missing.
 *  - GET  /api/auth/saml/login — 302 redirect to the IdP with a real signed
 *    AuthnRequest (shared node-saml client, so the request ID is stored
 *    for InResponseTo validation at the ACS). 501 ONLY when no IdP is
 *    configured / the config is not login-ready — never a fake redirect.
 *  - POST /api/auth/saml/acs — IdP POSTs the SAMLResponse here. The response is
 *    validated for real (signature, issuer, audience, Recipient, time
 *    window, InResponseTo, replay). Success mints a real opm_session
 *    (same cookie shape as local login) and 302s to RelayState; any
 *    validation failure is an honest 401 naming the failure class.
 *  - GET  /api/auth/saml/status — login-readiness + certificate facts for the
 *    console (session-guarded like every other /api route).
 *
 * The three SSO entry points (metadata, login, ACS) are exempt from the
 * session guard in server/index.js PUBLIC_API_ROUTES: the IdP and the
 * browser arriving from it carry no OpManager session by definition.
 * ACS is form-encoded (express.urlencoded is registered globally).
 *
 * RelayState is treated as an opaque return-to path and is validated
 * before any redirect: only a same-origin relative path ("/..." without
 * "//", backslash or scheme) is honoured, anything else falls back to "/".
 * No RelayState value is ever logged.
 *
 * Configuration is read through the service's loadSamlConfigAsync():
 * store keys `auth.saml` (existing settings.js shape) and `saml`
 * (canonical shape), then environment. A metadata-URL-only config is
 * resolved by auto-fetching the IdP metadata (service-side, cached
 * 10 minutes) so it becomes login-ready without hand-copied fields.
 * The SP private key comes from runtime env/file only and is never
 * logged or returned.
 */
const express = require('express');
const store = require('../services/store');

const router = express.Router();

const SESSION_COOKIE = 'opm_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // matches createSamlSession() in the service

// Lazy-load the SAML service (same defensive pattern as the template
// index in settings.js): the router still mounts if the service has not
// landed, and every endpoint then honestly 501s instead of crashing the
// server at require time.
function loadSamlService() {
  try {
    return require('../services/saml');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

function serviceOr501(res) {
  const saml = loadSamlService();
  if (!saml) {
    res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: 'SAML is not available in this build: server/services/saml.js is missing.',
    });
    return null;
  }
  return saml;
}

function auditLog(action, detail) {
  try { store.log(null, action, detail); } catch { /* audit must never break the request */ }
}

/** Only a same-origin relative path may be used as a post-login target. */
function safeRelayState(value) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) return '/';
  if (!v.startsWith('/')) return '/';
  if (v.startsWith('//')) return '/';
  if (v.includes('\\')) return '/';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) return '/';
  return v;
}

function setSessionCookie(res, req, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
    // Only mark Secure when the request itself arrived over HTTPS, so the
    // cookie still works on plain-HTTP local deployments (same rule as
    // server/routes/auth.js).
    secure: req.secure === true,
  });
}

// ------------------------------------------------------------- metadata ---

router.get('/api/auth/saml/metadata', (req, res) => {
  const saml = serviceOr501(res);
  if (!saml) return;
  let cfg;
  try {
    cfg = saml.loadSamlConfig();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_config_error',
      message: `Could not load the SAML configuration: ${err.message}`,
    });
  }
  const missing = [];
  if (!cfg.spEntityId) missing.push('spEntityId');
  if (!cfg.spAcsUrl) missing.push('spAcsUrl');
  if (missing.length > 0) {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `SP metadata cannot be generated: missing ${missing.join(', ')}. Configure the SP entity ID and ACS URL (settings.saml / auth.saml, or SAML_SP_ENTITY_ID / SAML_SP_ACS_URL).`,
      missing,
    });
  }
  let xml;
  try {
    xml = saml.generateSpMetadata(cfg);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_metadata_error',
      message: `SP metadata generation failed: ${err.message}`,
    });
  }
  res.setHeader('Content-Type', 'application/samlmetadata+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(xml);
});

// ------------------------------------------------------------------ login ---

router.get('/api/auth/saml/login', async (req, res) => {
  const saml = serviceOr501(res);
  if (!saml) return;
  let cfg;
  try {
    cfg = await saml.loadSamlConfigAsync();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_config_error',
      message: `Could not load the SAML configuration: ${err.message}`,
    });
  }
  // Honest 501 ONLY when no IdP is configured (or the config is otherwise
  // not login-ready). The listed issues say exactly what is missing.
  if (cfg.issues.length > 0) {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `SAML login is not configured: ${cfg.issues.join('; ')}.`,
      issues: cfg.issues,
    });
  }
  const relayState = safeRelayState(req.query.RelayState || req.query.returnTo);
  let login;
  try {
    // Shared client: the AuthnRequest ID is stored in its cache so the
    // ACS step can validate InResponseTo against it.
    login = await saml.getLoginUrl(saml.getSamlClient(cfg), relayState);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_login_failed',
      message: `Could not build the SAML AuthnRequest: ${err.message}`,
    });
  }
  auditLog('auth.saml.login.start', { idpEntityId: cfg.idpEntityId, spEntityId: cfg.spEntityId });
  return res.redirect(login.url);
});

// -------------------------------------------------------------------- ACS ---

router.post('/api/auth/saml/acs', async (req, res) => {
  const saml = serviceOr501(res);
  if (!saml) return;
  const body = req.body || {};
  if (!body.SAMLResponse || typeof body.SAMLResponse !== 'string' || !body.SAMLResponse.trim()) {
    return res.status(400).json({
      status: 'error',
      error: 'missing_saml_response',
      message: 'ACS received no SAMLResponse in the POST body.',
    });
  }
  let cfg;
  try {
    cfg = await saml.loadSamlConfigAsync();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_config_error',
      message: `Could not load the SAML configuration: ${err.message}`,
    });
  }
  if (cfg.issues.length > 0) {
    // No IdP is configured, so no response could ever validate: say so
    // plainly instead of failing the signature check against nothing.
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: `SAML login is not configured: ${cfg.issues.join('; ')}.`,
      issues: cfg.issues,
    });
  }
  let validated;
  try {
    validated = await saml.validateSamlResponse(saml.getSamlClient(cfg), body);
  } catch (err) {
    if (err && err.name === 'SamlValidationError') {
      auditLog('auth.saml.login.failed', { reason: err.reason || 'other' });
      return res.status(401).json({
        status: 'error',
        error: 'invalid_saml_response',
        reason: err.reason || 'other',
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      error: 'saml_acs_error',
      message: `SAML Response validation failed unexpectedly: ${err && err.message ? err.message : String(err)}`,
    });
  }
  const { profile, loggedOut } = validated;
  if (loggedOut) {
    // IdP-initiated logout response: drop the local session and send the
    // browser back to the login page.
    try {
      res.clearCookie(SESSION_COOKIE, { path: '/' });
    } catch { /* cookie clear is best-effort */ }
    auditLog('auth.saml.logout', {});
    return res.redirect('/login.html');
  }
  let mapped;
  try {
    mapped = saml.mapProfileToUser(profile);
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      error: 'invalid_saml_response',
      reason: 'other',
      message: `SAML Response validated but carries no usable identity: ${err.message}`,
    });
  }
  let provisioned;
  try {
    provisioned = saml.provisionSamlUser(store, mapped, {
      jitProvisioning: cfg.jitProvisioning,
      defaultRole: cfg.defaultRole,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_provision_error',
      message: `Could not map the SAML user to a local account: ${err.message}`,
    });
  }
  if (!provisioned.user) {
    // JIT provisioning is off and no local user matches the asserted
    // identity: refuse rather than inventing a login.
    return res.status(403).json({
      status: 'error',
      error: 'saml_user_not_provisioned',
      message: `No local user '${mapped.username}' exists and JIT provisioning is disabled. Create the user first or enable JIT provisioning.`,
      username: mapped.username,
    });
  }
  let session;
  try {
    session = saml.createSamlSession(store, provisioned.user);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_session_error',
      message: `SAML Response validated but the local session could not be created: ${err.message}`,
    });
  }
  setSessionCookie(res, req, session.token);
  auditLog('auth.saml.login', {
    username: provisioned.user.username,
    issuer: mapped.issuer || null,
    jitCreated: Boolean(provisioned.created),
  });
  return res.redirect(safeRelayState(body.RelayState));
});

// ----------------------------------------------------------------- status ---

router.get('/api/auth/saml/status', async (req, res) => {
  const saml = serviceOr501(res);
  if (!saml) return;
  let cfg;
  try {
    cfg = await saml.loadSamlConfigAsync();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: 'saml_config_error',
      message: `Could not load the SAML configuration: ${err.message}`,
    });
  }
  res.json({ status: 'success', saml: saml.getSamlStatus(cfg) });
});

module.exports = router;
