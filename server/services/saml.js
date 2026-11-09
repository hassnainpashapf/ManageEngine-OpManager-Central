'use strict';
/**
 * OpManager Central — SAML 2.0 Service Provider (SP) service.
 *
 * Phase 3 track: saml-service (port 8112). This file is the SP side only;
 * the HTTP routes (login / ACS / metadata endpoints) live with the
 * saml-routes track and call into here. Nothing in this file mounts a
 * route or touches the network except `fetchIdpMetadata` (an explicit
 * admin action that downloads IdP metadata over verified TLS).
 *
 * Library: @node-saml/node-saml 5.2.0 — the maintained, framework-agnostic
 * fork of passport-saml's core. It owns all XML parsing, canonicalization
 * and XML-DSig verification (via xml-crypto + @xmldom/xmldom); this file
 * never hand-rolls signature checks. saml2-js was considered and rejected:
 * it has not kept pace with node-saml's maintenance and security fixes
 * (node-saml 5.x fixed signature-verification CVEs in the 5.0/5.1 line).
 *
 * What this service does, for real:
 *  - Builds a strict @node-saml client: signed AuthnRequests, signed
 *    Response AND signed Assertion required by default, audience ==
 *    SP entity ID, issuer == configured IdP entity ID, Recipient ==
 *    ACS URL, time-window checks (NotBefore/NotOnOrAfter + assertion age)
 *    with a 5-minute clock skew, InResponseTo always validated, and
 *    replayed assertions rejected (node-saml 5.2 `rejectReplayedAssertions`).
 *    Two checks node-saml 5.2.0 only WARNS about (its own code says
 *    enforcement lands in the next major version) are enforced HERE, on
 *    the verified material, not left as warnings: the bearer
 *    SubjectConfirmation Recipient must be this SP's ACS URL (SAML
 *    Profiles §4.1.4.2/§4.1.4.3) and, when the Response must be signed,
 *    its Destination must be this SP's ACS URL (SAML Bindings §3.5.5.2).
 *    A self-test Response with a wrong Recipient was ACCEPTED by the
 *    library alone and is REJECTED by this service — see
 *    scripts/saml-selftest.js.
 *  - Generates real SP metadata XML for IdP registration.
 *  - Parses IdP metadata XML (entityID, SSO URL + binding, signing certs)
 *    and can fetch it over TLS-verified HTTPS.
 *  - Maps a validated SAML profile to a local user (JIT provisioning
 *    optional) and mints a real session through server/services/session.js
 *    (scrypt-hashed password for JIT users is random and unusable — SSO
 *    is their only login path).
 *
 * Configuration (merged, in priority order: explicit object > store >
 * environment):
 *  - Store settings key `auth.saml` (the shape server/routes/settings.js
 *    already persists: { enabled, idpEntityId, idpSsoUrl, spAcsUrl,
 *    certificate, jitProvisioning, defaultRole }) and the canonical
 *    `settings.saml` key from the Phase 3 shared schema ({ idpMetadataUrl,
 *    idpMetadataXml, spEntityId, spCert, spKey }).
 *  - Env: SAML_SP_ENTITY_ID, SAML_SP_ACS_URL, SAML_IDP_ENTITY_ID,
 *    SAML_IDP_SSO_URL, SAML_IDP_CERT(_FILE), SAML_IDP_METADATA_URL,
 *    SAML_SP_CERT(_FILE), SAML_SP_PRIVATE_KEY(_FILE).
 *
 * SP PRIVATE KEY — SECURITY:
 *  - The SP private key comes ONLY from runtime env/file
 *    (SAML_SP_PRIVATE_KEY, a PEM string, or SAML_SP_PRIVATE_KEY_FILE, a
 *    path). It is NEVER read from the settings store, NEVER committed,
 *    NEVER written to any file by this service, and NEVER logged: every
 *    status/error object in this file reports only whether a key is
 *    configured and whether it matches the SP certificate, never the key
 *    itself. `loadSamlConfig()` keeps the key in memory only, inside the
 *    returned config object, so the caller can build a signing client.
 *  - `settings.saml.spKey` / `auth.saml.spKey` values found in the store
 *    are IGNORED on purpose (a key must not live in the settings table).
 *
 * Replay / request state:
 *  - `getSamlClient()` returns ONE shared client per process (with one
 *    InMemoryCacheProvider), keyed by a fingerprint of the IdP/SP
 *    identity — never by key material. The login step stores the
 *    AuthnRequest ID in that cache and the ACS step consumes it, so the
 *    routes MUST use the shared client for both steps (or pass the same
 *    cacheProvider to createSamlClient). The in-memory cache is
 *    single-process: a multi-process deployment must supply a shared
 *    CacheProvider instead (see createSamlClient options).
 *
 * No IdP exists in this deployment yet — that is expected. Everything
 * below is genuinely SP-correct and works the moment an IdP is
 * configured; see docs/saml.md for the exact IdP-side values to supply.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const http = require('node:http');

const { SAML, generateServiceProviderMetadata, InMemoryCacheProvider } = require('@node-saml/node-saml');
const { DOMParser } = require('@xmldom/xmldom');

// Session service: token creation + password hashing. Required lazily so
// this module still loads (for metadata/config inspection) if session.js
// is ever unavailable; functions that mint sessions throw honestly then.
let cachedSession = null;
function getSessionService() {
  if (cachedSession) return cachedSession;
  cachedSession = require('./session');
  return cachedSession;
}

// Store service: lazy, same pattern as session.js (the store is built in
// parallel to this track and may be required by path instead).
let cachedStore = null;
function getStore() {
  if (cachedStore) return cachedStore;
  cachedStore = require('./store');
  return cachedStore;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SAML_NS = 'urn:oasis:names:tc:SAML:2.0:metadata';
const HTTP_REDIRECT_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';
const HTTP_POST_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';

// Strict SP defaults. Overridable per-field in the stored config when an
// IdP genuinely cannot meet one of them (e.g. an IdP that signs only the
// assertion needs wantAuthnResponseSigned=false, set explicitly by an
// admin — never silently relaxed here).
const DEFAULTS = {
  acceptedClockSkewMs: 5 * 60 * 1000, // 5 minutes
  maxAssertionAgeMs: 5 * 60 * 1000, // assertion must be at most 5 minutes old
  requestIdExpirationPeriodMs: 8 * 60 * 60 * 1000, // login request lives 8h
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  identifierFormat: null, // no NameIDPolicy constraint unless configured
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: true,
  validateInResponseTo: 'always',
  rejectReplayedAssertions: true,
  forceAuthn: false,
  authnContext: [],
  disableRequestedAuthnContext: true, // do not demand a specific AuthnContext
  skipRequestCompression: false,
};

const EMAIL_OID = 'urn:oid:0.9.2342.19200300.100.1.3';
const GIVEN_NAME_OID = 'urn:oid:2.5.4.42';
const SURNAME_OID = 'urn:oid:2.5.4.4';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function trimOrNull(v) {
  return isNonEmptyString(v) ? v.trim() : null;
}

/** Read a PEM value either inline or from a *_FILE path. Returns null when neither is set. */
function readPemFromEnv(inlineName, fileName) {
  const inline = process.env[inlineName];
  if (isNonEmptyString(inline)) {
    // PEM passed through env often has literal \n escapes.
    return inline.includes('\\n') ? inline.replace(/\\n/g, '\n') : inline;
  }
  const file = process.env[fileName];
  if (isNonEmptyString(file)) {
    return fs.readFileSync(file.trim(), 'utf8');
  }
  return null;
}

/** Strip the PEM armor and whitespace so certs compare by content, not formatting. */
function normalizeCertBody(pem) {
  if (!isNonEmptyString(pem)) return null;
  return pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, '');
}

function fingerprint256(pem) {
  try {
    return new crypto.X509Certificate(pem).fingerprint256;
  } catch {
    return null;
  }
}

/**
 * Parse a PEM certificate with the real X.509 parser.
 * Returns a safe-to-log object (no key material, only public cert facts).
 */
function inspectCertificate(pem) {
  if (!isNonEmptyString(pem)) return { parsed: false, error: 'no certificate supplied' };
  try {
    const cert = new crypto.X509Certificate(pem);
    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);
    return {
      parsed: true,
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      expired: now > validTo,
      notYetValid: now < validFrom,
      fingerprint256: cert.fingerprint256,
      serialNumber: cert.serialNumber,
    };
  } catch (err) {
    return { parsed: false, error: err && err.message ? err.message : String(err) };
  }
}

/**
 * Verify that a private key and a certificate belong together: the public
 * key derived from each must be identical. Returns { matches, error }.
 * Never logs or returns key material.
 */
function verifyKeyPair({ privateKeyPem, certPem }) {
  try {
    if (!isNonEmptyString(privateKeyPem)) return { matches: false, error: 'no private key supplied' };
    if (!isNonEmptyString(certPem)) return { matches: false, error: 'no certificate supplied' };
    const fromKey = crypto.createPublicKey(crypto.createPrivateKey(privateKeyPem));
    const fromCert = new crypto.X509Certificate(certPem).publicKey;
    const a = fromKey.export({ type: 'spki', format: 'der' });
    const b = fromCert.export({ type: 'spki', format: 'der' });
    return { matches: a.equals(b), error: a.equals(b) ? null : 'private key does not match certificate' };
  } catch (err) {
    return { matches: false, error: err && err.message ? err.message : String(err) };
  }
}

/** Validate that a PEM parses as a private key (no logging of the key). */
function inspectPrivateKey(pem) {
  if (!isNonEmptyString(pem)) return { parsed: false, error: 'no private key supplied' };
  try {
    const key = crypto.createPrivateKey(pem);
    return { parsed: true, type: key.asymmetricKeyType || null };
  } catch (err) {
    return { parsed: false, error: err && err.message ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Configuration loading
// ---------------------------------------------------------------------------

/**
 * Read one settings key from the store (JSON-parsed when possible).
 * Returns null when the store is unavailable or the key is absent.
 */
function readStoredSettings(store, key) {
  try {
    const s = store || getStore();
    if (!s || typeof s.getSetting !== 'function') return null;
    const raw = s.getSetting(key);
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return raw; }
  } catch {
    return null;
  }
}

/**
 * Load and normalize the SAML SP configuration.
 *
 * Sources (highest priority first): `overrides` object, store settings
 * keys `auth.saml` (existing settings.js shape) and `saml` (Phase 3
 * canonical shape), then environment variables.
 *
 * The returned object contains `spPrivateKey` IN MEMORY ONLY when it was
 * supplied via env/file (never from the store). Callers must never log
 * or persist the returned object whole — use getSamlStatus() for that.
 *
 * Returns:
 * {
 *   enabled, spEntityId, spAcsUrl, spLogoutUrl, spCert, spPrivateKey,
 *   spKeySource: 'env'|'file'|null,
 *   idpEntityId, idpSsoUrl, idpSsoBinding, idpCerts: [pem...],
 *   idpMetadataUrl, idpMetadataXml,
 *   jitProvisioning, defaultRole, identifierFormat,
 *   wantAssertionsSigned, wantAuthnResponseSigned,
 *   acceptedClockSkewMs, maxAssertionAgeMs,
 *   issues: [ 'missing:spEntityId', ... ]   // empty when login-ready
 * }
 */
function loadSamlConfig(overrides, store) {
  const ov = (overrides && typeof overrides === 'object') ? overrides : {};
  const fromAuthSettings = readStoredSettings(store, 'auth.saml');
  const fromCanonical = readStoredSettings(store, 'saml');
  const a = (fromAuthSettings && typeof fromAuthSettings === 'object') ? fromAuthSettings : {};
  const c = (fromCanonical && typeof fromCanonical === 'object') ? fromCanonical : {};

  // SP private key: env/file ONLY. A `spKey` value in either settings key
  // is deliberately ignored — a private key must not live in the settings
  // table (see header).
  let spPrivateKey = null;
  let spKeySource = null;
  try {
    spPrivateKey = readPemFromEnv('SAML_SP_PRIVATE_KEY', 'SAML_SP_PRIVATE_KEY_FILE');
    if (spPrivateKey) {
      spKeySource = isNonEmptyString(process.env.SAML_SP_PRIVATE_KEY) ? 'env' : 'file';
    }
  } catch (err) {
    // A bad key path is a config issue, not a crash: record it below.
    spPrivateKey = null;
    spKeySource = null;
  }
  if (isNonEmptyString(ov.spPrivateKey)) {
    // Explicit in-memory override (tests / routes passing a runtime key).
    spPrivateKey = ov.spPrivateKey;
    spKeySource = ov.spKeySource || 'override';
  }

  // IdP signing cert(s): stored cert, canonical cert, env (single or
  // comma-joined PEMs are not supported — use an array / metadata XML).
  let idpCerts = [];
  const idpCertCandidates = [
    ov.idpCert, ov.idpCerts,
    a.certificate, c.idpCert, c.idpCerts,
  ];
  for (const cand of idpCertCandidates) {
    if (Array.isArray(cand)) idpCerts.push(...cand.filter(isNonEmptyString));
    else if (isNonEmptyString(cand)) idpCerts.push(cand);
  }
  try {
    const envCert = readPemFromEnv('SAML_IDP_CERT', 'SAML_IDP_CERT_FILE');
    if (envCert) idpCerts.push(envCert);
  } catch { /* env cert unreadable — surfaced via issues below */ }
  // De-duplicate by cert body.
  const seenCerts = new Set();
  idpCerts = idpCerts.filter((pem) => {
    const body = normalizeCertBody(pem);
    if (!body || seenCerts.has(body)) return false;
    seenCerts.add(body);
    return true;
  });

  let spCert = null;
  try {
    spCert = trimOrNull(ov.spCert) || trimOrNull(c.spCert) || readPemFromEnv('SAML_SP_CERT', 'SAML_SP_CERT_FILE');
  } catch { spCert = trimOrNull(ov.spCert) || trimOrNull(c.spCert); }

  const idpMetadataXml = trimOrNull(ov.idpMetadataXml) || trimOrNull(c.idpMetadataXml) || null;
  // If IdP metadata XML is present but no cert/SSO URL was given
  // separately, derive them from the metadata (parsed lazily, below).
  let parsedMetadata = null;
  if (idpMetadataXml && (!idpCerts.length || !(ov.idpSsoUrl || a.idpSsoUrl || c.idpSsoUrl))) {
    try { parsedMetadata = parseIdpMetadata(idpMetadataXml); } catch { parsedMetadata = null; }
  }
  if (parsedMetadata) {
    if (parsedMetadata.signingCerts) {
      for (const pem of parsedMetadata.signingCerts) {
        if (!seenCerts.has(normalizeCertBody(pem))) { idpCerts.push(pem); seenCerts.add(normalizeCertBody(pem)); }
      }
    }
  }

  const config = {
    enabled: ov.enabled !== undefined ? Boolean(ov.enabled)
      : (a.enabled !== undefined ? Boolean(a.enabled)
      : (c.enabled !== undefined ? Boolean(c.enabled) : false)),
    spEntityId: trimOrNull(ov.spEntityId) || trimOrNull(c.spEntityId)
      || trimOrNull(process.env.SAML_SP_ENTITY_ID) || null,
    spAcsUrl: trimOrNull(ov.spAcsUrl) || trimOrNull(ov.callbackUrl) || trimOrNull(a.spAcsUrl)
      || trimOrNull(c.spAcsUrl) || trimOrNull(process.env.SAML_SP_ACS_URL) || null,
    spLogoutUrl: trimOrNull(ov.spLogoutUrl) || trimOrNull(ov.logoutCallbackUrl)
      || trimOrNull(c.spLogoutUrl) || trimOrNull(process.env.SAML_SP_LOGOUT_URL) || null,
    spCert,
    spPrivateKey,
    spKeySource,
    idpEntityId: trimOrNull(ov.idpEntityId) || trimOrNull(a.idpEntityId)
      || trimOrNull(c.idpEntityId) || trimOrNull(process.env.SAML_IDP_ENTITY_ID)
      || (parsedMetadata && parsedMetadata.idpEntityId) || null,
    idpSsoUrl: trimOrNull(ov.idpSsoUrl) || trimOrNull(ov.entryPoint) || trimOrNull(a.idpSsoUrl)
      || trimOrNull(c.idpSsoUrl) || trimOrNull(process.env.SAML_IDP_SSO_URL)
      || (parsedMetadata && parsedMetadata.idpSsoUrl) || null,
    idpSsoBinding: trimOrNull(ov.idpSsoBinding)
      || (parsedMetadata && parsedMetadata.idpSsoBinding) || null,
    idpCerts,
    idpMetadataUrl: trimOrNull(ov.idpMetadataUrl) || trimOrNull(c.idpMetadataUrl)
      || trimOrNull(process.env.SAML_IDP_METADATA_URL) || null,
    idpMetadataXml,
    jitProvisioning: ov.jitProvisioning !== undefined ? Boolean(ov.jitProvisioning)
      : (a.jitProvisioning !== undefined ? Boolean(a.jitProvisioning)
      : (c.jitProvisioning !== undefined ? Boolean(c.jitProvisioning) : false)),
    defaultRole: trimOrNull(ov.defaultRole) || trimOrNull(a.defaultRole)
      || trimOrNull(c.defaultRole) || 'Operator',
    identifierFormat: trimOrNull(ov.identifierFormat) || trimOrNull(c.identifierFormat)
      || DEFAULTS.identifierFormat,
    wantAssertionsSigned: ov.wantAssertionsSigned !== undefined ? Boolean(ov.wantAssertionsSigned)
      : (c.wantAssertionsSigned !== undefined ? Boolean(c.wantAssertionsSigned) : DEFAULTS.wantAssertionsSigned),
    wantAuthnResponseSigned: ov.wantAuthnResponseSigned !== undefined ? Boolean(ov.wantAuthnResponseSigned)
      : (c.wantAuthnResponseSigned !== undefined ? Boolean(c.wantAuthnResponseSigned) : DEFAULTS.wantAuthnResponseSigned),
    acceptedClockSkewMs: Number.isFinite(Number(ov.acceptedClockSkewMs))
      ? Number(ov.acceptedClockSkewMs) : DEFAULTS.acceptedClockSkewMs,
    maxAssertionAgeMs: Number.isFinite(Number(ov.maxAssertionAgeMs))
      ? Number(ov.maxAssertionAgeMs) : DEFAULTS.maxAssertionAgeMs,
    issues: [],
  };

  config.issues = validateConfigIssues(config);
  return config;
}

/**
 * Async config load (Phase 4 merge): like loadSamlConfig(), but a
 * metadata-URL-only config becomes login-ready — when the IdP entity
 * ID, SSO URL or signing certificate is missing and `idpMetadataUrl`
 * is set, the IdP metadata is fetched (TLS-verified, via
 * loadIdpMetadata) and the missing fields are filled from it. The
 * fetched document is cached in-process for 10 minutes so a login/ACS
 * burst does not re-fetch on every request; a failed fetch is recorded
 * as a config issue (`idpMetadataFetch: ...`) instead of crashing.
 * Stored settings are NOT rewritten here — persisting parsed metadata
 * values is the settings /test endpoint's job (server/routes/settings.js).
 * The returned config is otherwise identical in shape to
 * loadSamlConfig()'s, so getSamlClient()/getSamlStatus() take it as-is.
 */
const METADATA_FETCH_CACHE_MS = 10 * 60 * 1000;
let metadataUrlCache = { url: null, at: 0, parsed: null, error: null };

async function loadSamlConfigAsync(overrides, store) {
  const cfg = loadSamlConfig(overrides, store);
  const url = cfg.idpMetadataUrl;
  const needsMetadata = !cfg.idpEntityId || !cfg.idpSsoUrl
    || !cfg.idpCerts || cfg.idpCerts.length === 0;
  if (!url || !needsMetadata) return cfg;
  let parsed = null;
  let fetchError = null;
  if (metadataUrlCache.url === url
    && metadataUrlCache.parsed
    && (Date.now() - metadataUrlCache.at) < METADATA_FETCH_CACHE_MS) {
    parsed = metadataUrlCache.parsed;
  } else {
    try {
      const loaded = await loadIdpMetadata(url);
      parsed = loaded;
      metadataUrlCache = { url, at: Date.now(), parsed: loaded, error: null };
    } catch (err) {
      fetchError = err;
      metadataUrlCache = { url, at: Date.now(), parsed: null, error: String((err && err.message) || err) };
    }
  }
  if (!parsed) {
    const detail = fetchError ? String((fetchError && fetchError.message) || fetchError) : 'fetch failed';
    cfg.issues = [...new Set([...(cfg.issues || []), `idpMetadataFetch: ${detail}`])];
    return cfg;
  }
  if (!cfg.idpEntityId && parsed.idpEntityId) cfg.idpEntityId = parsed.idpEntityId;
  if (!cfg.idpSsoUrl && parsed.idpSsoUrl) cfg.idpSsoUrl = parsed.idpSsoUrl;
  if (!cfg.idpSsoBinding && parsed.idpSsoBinding) cfg.idpSsoBinding = parsed.idpSsoBinding;
  for (const pem of parsed.signingCerts || []) {
    if (!cfg.idpCerts.includes(pem)) cfg.idpCerts.push(pem);
  }
  cfg.issues = validateConfigIssues(cfg);
  return cfg;
}

/** List what is missing/invalid for a login-ready configuration. */
function validateConfigIssues(config) {
  const issues = [];
  if (!config.enabled) issues.push('disabled: saml is not enabled');
  if (!config.spEntityId) issues.push('missing:spEntityId');
  if (!config.spAcsUrl) issues.push('missing:spAcsUrl');
  if (!config.idpEntityId) issues.push('missing:idpEntityId');
  if (!config.idpSsoUrl) issues.push('missing:idpSsoUrl');
  if (!config.idpCerts || config.idpCerts.length === 0) issues.push('missing:idpCert');
  for (const pem of config.idpCerts || []) {
    const info = inspectCertificate(pem);
    if (!info.parsed) issues.push('invalid:idpCert: ' + (info.error || 'unparsable'));
    else if (info.expired) issues.push('invalid:idpCert: expired ' + info.validTo);
    else if (info.notYetValid) issues.push('invalid:idpCert: not yet valid until ' + info.validFrom);
  }
  if (config.spCert) {
    const info = inspectCertificate(config.spCert);
    if (!info.parsed) issues.push('invalid:spCert: ' + (info.error || 'unparsable'));
    else if (info.expired) issues.push('invalid:spCert: expired ' + info.validTo);
  }
  if (config.spPrivateKey) {
    const keyInfo = inspectPrivateKey(config.spPrivateKey);
    if (!keyInfo.parsed) issues.push('invalid:spPrivateKey: ' + (keyInfo.error || 'unparsable'));
    else if (config.spCert) {
      const pair = verifyKeyPair({ privateKeyPem: config.spPrivateKey, certPem: config.spCert });
      if (!pair.matches) issues.push('invalid:spKeyPair: ' + (pair.error || 'key does not match certificate'));
    }
  }
  return issues;
}

/**
 * Safe-to-log / safe-to-return status for a config. Contains NO key
 * material — only booleans, fingerprints and certificate facts.
 */
function getSamlStatus(config) {
  const cfg = config || loadSamlConfig();
  const spCertInfo = cfg.spCert ? inspectCertificate(cfg.spCert) : null;
  const idpCertInfos = (cfg.idpCerts || []).map((pem) => inspectCertificate(pem));
  const keyInfo = cfg.spPrivateKey ? inspectPrivateKey(cfg.spPrivateKey) : { parsed: false, error: 'no private key supplied' };
  const pair = (cfg.spPrivateKey && cfg.spCert)
    ? verifyKeyPair({ privateKeyPem: cfg.spPrivateKey, certPem: cfg.spCert })
    : { matches: false, error: cfg.spPrivateKey ? 'no SP certificate to compare against' : 'no private key supplied' };
  return {
    enabled: Boolean(cfg.enabled),
    configured: cfg.issues.length === 0,
    issues: cfg.issues,
    spEntityId: cfg.spEntityId,
    spAcsUrl: cfg.spAcsUrl,
    idpEntityId: cfg.idpEntityId,
    idpSsoUrl: cfg.idpSsoUrl,
    idpSsoBinding: cfg.idpSsoBinding,
    idpCertCount: (cfg.idpCerts || []).length,
    idpCerts: idpCertInfos.map((info) => ({
      parsed: info.parsed,
      subject: info.subject || null,
      issuer: info.issuer || null,
      validFrom: info.validFrom || null,
      validTo: info.validTo || null,
      expired: info.expired || false,
      fingerprint256: info.fingerprint256 || null,
      error: info.error || null,
    })),
    spCert: spCertInfo && spCertInfo.parsed ? {
      subject: spCertInfo.subject,
      issuer: spCertInfo.issuer,
      validFrom: spCertInfo.validFrom,
      validTo: spCertInfo.validTo,
      expired: spCertInfo.expired,
      fingerprint256: spCertInfo.fingerprint256,
    } : { parsed: false, error: spCertInfo ? spCertInfo.error : 'no SP certificate configured' },
    spKeyConfigured: Boolean(cfg.spPrivateKey),
    spKeySource: cfg.spKeySource,
    spKeyType: keyInfo.parsed ? keyInfo.type : null,
    spKeyMatchesCert: pair.matches,
    spKeyPairError: pair.matches ? null : pair.error,
    jitProvisioning: Boolean(cfg.jitProvisioning),
    defaultRole: cfg.defaultRole,
  };
}

// ---------------------------------------------------------------------------
// @node-saml client construction
// ---------------------------------------------------------------------------

/**
 * Build a strict @node-saml SAML client from a loaded config.
 * Throws an Error listing the config issues when the config is not
 * login-ready (never builds a half-configured client that would accept
 * unsigned or misdirected responses).
 *
 * `opts.cacheProvider` — a CacheProvider shared between the login step
 * (AuthnRequest ID is stored) and the ACS step (InResponseTo is consumed
 * + replayed assertions are rejected). Defaults to a fresh
 * InMemoryCacheProvider; prefer getSamlClient() (the process-wide shared
 * client) in route code so login and ACS use the same cache.
 */
function createSamlClient(config, opts) {
  const cfg = config || loadSamlConfig();
  const issues = validateConfigIssues(cfg);
  if (issues.length > 0) {
    throw new Error('SAML is not login-ready: ' + issues.join('; '));
  }
  const o = (opts && typeof opts === 'object') ? opts : {};
  const cacheProvider = o.cacheProvider
    || new InMemoryCacheProvider({ keyExpirationPeriodMs: DEFAULTS.requestIdExpirationPeriodMs });

  const samlConfig = {
    // Mandatory (node-saml v5): idpCert, issuer, callbackUrl.
    idpCert: cfg.idpCerts.length === 1 ? cfg.idpCerts[0] : cfg.idpCerts,
    issuer: cfg.spEntityId,
    callbackUrl: cfg.spAcsUrl,
    entryPoint: cfg.idpSsoUrl,
    idpIssuer: cfg.idpEntityId,
    audience: cfg.spEntityId, // Response Audience must name this SP
    // Strict validation (see header): both signatures required by
    // default, InResponseTo always checked, replays rejected.
    wantAssertionsSigned: cfg.wantAssertionsSigned,
    wantAuthnResponseSigned: cfg.wantAuthnResponseSigned,
    validateInResponseTo: DEFAULTS.validateInResponseTo,
    rejectReplayedAssertions: DEFAULTS.rejectReplayedAssertions,
    acceptedClockSkewMs: cfg.acceptedClockSkewMs,
    maxAssertionAgeMs: cfg.maxAssertionAgeMs,
    requestIdExpirationPeriodMs: DEFAULTS.requestIdExpirationPeriodMs,
    cacheProvider,
    // Signing: present only when an SP key is configured. Without a key
    // the AuthnRequest goes unsigned (some IdPs accept that); with a key
    // node-saml signs the request and the metadata.
    ...(cfg.spPrivateKey ? {
      privateKey: cfg.spPrivateKey,
      publicCert: cfg.spCert || undefined,
      signatureAlgorithm: DEFAULTS.signatureAlgorithm,
      digestAlgorithm: DEFAULTS.digestAlgorithm,
    } : {}),
    ...(cfg.spCert && cfg.spPrivateKey ? { decryptionPvk: cfg.spPrivateKey } : {}),
    identifierFormat: cfg.identifierFormat,
    authnContext: DEFAULTS.authnContext,
    disableRequestedAuthnContext: DEFAULTS.disableRequestedAuthnContext,
    forceAuthn: DEFAULTS.forceAuthn,
    skipRequestCompression: DEFAULTS.skipRequestCompression,
    ...(cfg.spLogoutUrl ? { logoutCallbackUrl: cfg.spLogoutUrl } : {}),
  };
  return new SAML(samlConfig);
}

// Process-wide shared client (see header: login and ACS must share one
// cache). Keyed by a fingerprint of the IdP/SP identity + certificate
// fingerprints — never by key material, so a key rotation with the same
// certs keeps the client, while a changed IdP rebuilds it.
let sharedClient = null;
let sharedFingerprint = null;

function configFingerprint(cfg) {
  const parts = [
    cfg.spEntityId, cfg.spAcsUrl, cfg.idpEntityId, cfg.idpSsoUrl,
    (cfg.idpCerts || []).map((pem) => fingerprint256(pem)).join(','),
    cfg.spCert ? fingerprint256(cfg.spCert) : '',
    // SP key PRESENCE (not the key): adding/removing the SP private key
    // must rebuild the client, otherwise decryptionPvk / request
    // signing would silently stay as first built (Phase 4 merge fix).
    String(Boolean(cfg.spPrivateKey)),
    String(cfg.wantAssertionsSigned), String(cfg.wantAuthnResponseSigned),
    String(cfg.acceptedClockSkewMs), String(cfg.maxAssertionAgeMs),
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
}

/**
 * The process-wide SAML client for route code. Rebuilt automatically when
 * the configuration fingerprint changes. Throws when not login-ready.
 */
function getSamlClient(config) {
  const cfg = config || loadSamlConfig();
  const fp = configFingerprint(cfg);
  if (!sharedClient || sharedFingerprint !== fp) {
    sharedClient = createSamlClient(cfg);
    sharedFingerprint = fp;
  }
  return sharedClient;
}

/** Test hook: drop the shared client (e.g. after a config change in tests). */
function resetSamlClient() {
  sharedClient = null;
  sharedFingerprint = null;
}

// ---------------------------------------------------------------------------
// SP metadata, AuthnRequest, Response validation
// ---------------------------------------------------------------------------

/**
 * Generate the SP metadata XML an admin registers at the IdP.
 * Includes the ACS URL, the SP certificate (when configured) and, when
 * an SP private key is configured, a signature over the metadata.
 * Returns the XML string. Throws when the SP identity is incomplete.
 */
function generateSpMetadata(config) {
  const cfg = config || loadSamlConfig();
  if (!cfg.spEntityId) throw new Error('SAML metadata needs spEntityId');
  if (!cfg.spAcsUrl) throw new Error('SAML metadata needs spAcsUrl');
  return generateServiceProviderMetadata({
    issuer: cfg.spEntityId,
    callbackUrl: cfg.spAcsUrl,
    ...(cfg.spLogoutUrl ? { logoutCallbackUrl: cfg.spLogoutUrl } : {}),
    identifierFormat: cfg.identifierFormat || undefined,
    wantAssertionsSigned: cfg.wantAssertionsSigned,
    ...(cfg.spCert ? { publicCerts: cfg.spCert } : {}),
    ...(cfg.spPrivateKey ? {
      privateKey: cfg.spPrivateKey,
      signatureAlgorithm: DEFAULTS.signatureAlgorithm,
      digestAlgorithm: DEFAULTS.digestAlgorithm,
      signMetadata: true,
    } : { signMetadata: false }),
    metadataAttributeConsumingServices: [{
      '@index': '0',
      '@isDefault': true,
      ServiceName: [{ '@xml:lang': 'en', '#text': 'OpManager Central' }],
      ServiceDescription: [{ '@xml:lang': 'en', '#text': 'ManageEngine OpManager Central — SAML 2.0 Service Provider' }],
      RequestedAttribute: [
        { '@Name': EMAIL_OID, '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri', '@FriendlyName': 'mail', '@isRequired': true },
        { '@Name': GIVEN_NAME_OID, '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri', '@FriendlyName': 'givenName', '@isRequired': false },
        { '@Name': SURNAME_OID, '@NameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri', '@FriendlyName': 'sn', '@isRequired': false },
      ],
    }],
  });
}

/**
 * Build the IdP login (AuthnRequest) redirect URL for a browser.
 * Returns { url, relayState }. The AuthnRequest ID is stored in the
 * shared cache by node-saml; the ACS step must use the SAME client
 * (getSamlClient) or validation fails on InResponseTo. RelayState is
 * echoed back by the IdP and must be validated by the routes (opaque
 * return-to path, never trusted blindly).
 */
async function getLoginUrl(client, relayState) {
  const saml = client || getSamlClient();
  const state = relayState === undefined || relayState === null ? '' : String(relayState);
  const url = await saml.getAuthorizeUrlAsync(state, {});
  return { url, relayState: state };
}

/**
 * Validate a SAML Response POSTed to the ACS endpoint.
 * `body` is the parsed form body: { SAMLResponse: '<base64>', RelayState? }.
 * node-saml performs: XML signature verification against the configured
 * IdP cert(s) (Response and/or Assertion per config), issuer check,
 * audience check, Recipient check, Conditions time-window check,
 * assertion-age check, InResponseTo consumption, and replay rejection.
 *
 * Returns { profile, loggedOut } on success (profile: see
 * mapProfileToUser). Throws SamlValidationError on any failure; the
 * error's `reason` classifies it (signature|audience|issuer|recipient|
 * destination|time|replay|inResponseTo|status|other) and `cause` holds the original
 * library message. The raw Response XML is never returned — only the
 * verified assertion's profile (profile.getAssertionXml() is the
 * verified assertion, not the raw response).
 */
class SamlValidationError extends Error {
  constructor(reason, message, cause) {
    super(message);
    this.name = 'SamlValidationError';
    this.reason = reason;
    this.cause = cause || null;
  }
}

function classifyValidationError(err) {
  // node-saml throws a named ReplayedAssertionError whose message
  // ("The assertion <id> has already been received") matches none of
  // the keyword branches below — check the name first.
  if (err && err.name === 'ReplayedAssertionError') return 'replay';
  const msg = String((err && err.message) || err || '').toLowerCase();
  if (/signature|signed|digest|certificate|cert/.test(msg)) return 'signature';
  if (/audience/.test(msg)) return 'audience';
  if (/issuer/.test(msg)) return 'issuer';
  if (/recipient/.test(msg)) return 'recipient';
  if (/destination/.test(msg)) return 'destination';
  if (/inresponseto|in response to|request id|expired request/.test(msg)) return 'inResponseTo';
  if (/replay|already.*seen|already been received|duplicate/.test(msg)) return 'replay';
  if (/subject confirmation|notbefore|notonorafter|expired|assertion.*age|time|clock|condition/.test(msg)) return 'time';
  if (/status|unsuccessful|responder|authnfailed/.test(msg)) return 'status';
  return 'other';
}

const BEARER_METHOD = 'urn:oasis:names:tc:SAML:2.0:cm:bearer';

/** Same URL comparison as node-saml's: parsed URLs, so scheme/host case
 *  and an explicit default port do not count; the path does. */
function isSameUrl(received, expected) {
  try { return new URL(received).href === new URL(expected).href; }
  catch { return received === expected; }
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null) return [];
  return [v];
}

/**
 * Enforce, on the VERIFIED assertion (profile.getAssertion() — the
 * assertion node-saml signature-checked, never the raw response), what
 * node-saml 5.2.0 only warns about: SAML Profiles §4.1.4.2/§4.1.4.3 —
 * the assertion must arrive through a bearer SubjectConfirmation whose
 * Recipient is this SP's ACS URL and whose NotOnOrAfter is still in the
 * future (within the configured clock skew). A confirmation with no
 * Method is treated as bearer-shaped (some IdPs omit it); a confirmation
 * with a non-bearer Method never counts.
 */
function enforceBearerRecipient(profile, callbackUrl, acceptedClockSkewMs) {
  const assertionDoc = (profile && typeof profile.getAssertion === 'function')
    ? profile.getAssertion()
    : null;
  const assertion = assertionDoc && (assertionDoc.Assertion || assertionDoc);
  const subjects = asArray(assertion && assertion.Subject);
  const confirmations = subjects.flatMap((s) => asArray(s && s.SubjectConfirmation));
  const now = Date.now();
  const skew = Number.isFinite(Number(acceptedClockSkewMs)) ? Number(acceptedClockSkewMs) : 0;
  const ok = confirmations.some((sc) => {
    const method = sc && sc.$ && sc.$.Method;
    if (method && method !== BEARER_METHOD) return false;
    const data = sc && asArray(sc.SubjectConfirmationData)[0];
    const attrs = (data && data.$) || {};
    if (!attrs.Recipient) return false;
    if (!isSameUrl(attrs.Recipient, callbackUrl)) return false;
    if (attrs.NotOnOrAfter) {
      const until = Date.parse(attrs.NotOnOrAfter);
      if (!Number.isFinite(until) || until + skew <= now) return false;
    }
    return true;
  });
  if (!ok) {
    throw new SamlValidationError(
      'recipient',
      `SAML assertion has no bearer SubjectConfirmation with Recipient ${callbackUrl}`,
      null,
    );
  }
}

/**
 * Enforce the Response Destination (SAML Bindings §3.5.5.2: a signed
 * message's Destination must name its intended recipient). Called only
 * when the client requires a signed Response, so the Destination value
 * read here from the raw XML is covered by the Response signature
 * node-saml has already verified. When Responses are unsigned
 * (wantAuthnResponseSigned=false) there is nothing binding Destination
 * to the signer, so it is not enforced — the bearer-Recipient check
 * above still applies, because the assertion itself is signed.
 */
function enforceResponseDestination(samlResponseB64, callbackUrl) {
  let doc;
  try {
    const xml = Buffer.from(samlResponseB64, 'base64').toString('utf8');
    doc = new DOMParser().parseFromString(xml, 'text/xml');
  } catch (err) {
    throw new SamlValidationError('destination', 'SAML Response could not be parsed for Destination check', err);
  }
  const root = doc && doc.documentElement;
  if (!root || root.localName !== 'Response') {
    throw new SamlValidationError('destination', 'ACS payload is not a SAML Response', null);
  }
  const destination = root.getAttribute('Destination');
  if (!destination) {
    throw new SamlValidationError(
      'destination',
      'Signed SAML Response has no Destination; cannot confirm it was sent to this ACS',
      null,
    );
  }
  if (!isSameUrl(destination, callbackUrl)) {
    throw new SamlValidationError(
      'destination',
      `SAML Response Destination ${destination} is not this ACS (${callbackUrl})`,
      null,
    );
  }
}

async function validateSamlResponse(client, body) {
  const saml = client || getSamlClient();
  const b = (body && typeof body === 'object') ? body : {};
  if (!isNonEmptyString(b.SAMLResponse)) {
    throw new SamlValidationError('other', 'ACS received no SAMLResponse', null);
  }
  let result;
  try {
    result = await saml.validatePostResponseAsync({
      SAMLResponse: b.SAMLResponse,
      ...(isNonEmptyString(b.RelayState) ? { RelayState: b.RelayState } : {}),
    });
  } catch (err) {
    const reason = classifyValidationError(err);
    throw new SamlValidationError(
      reason,
      `SAML Response validation failed (${reason}): ${err && err.message ? err.message : String(err)}`,
      err,
    );
  }
  if (!result || !result.profile) {
    throw new SamlValidationError('other', 'SAML Response validated but carried no profile', null);
  }
  // Post-checks the library only warns about (see header): bearer
  // Recipient on the VERIFIED assertion, and Response Destination when
  // the Response had to be signed. These run after node-saml's own
  // signature/issuer/audience/time/InResponseTo/replay validation.
  const callbackUrl = saml.options && saml.options.callbackUrl;
  if (callbackUrl) {
    enforceBearerRecipient(result.profile, callbackUrl, saml.options.acceptedClockSkewMs);
    if (saml.options.wantAuthnResponseSigned) {
      enforceResponseDestination(b.SAMLResponse, callbackUrl);
    }
  }
  return { profile: result.profile, loggedOut: Boolean(result.loggedOut) };
}

// ---------------------------------------------------------------------------
// IdP metadata parsing / fetching
// ---------------------------------------------------------------------------

function pemFromBase64Body(body) {
  const clean = String(body || '').replace(/\s+/g, '');
  if (!clean) return null;
  const lines = clean.match(/.{1,64}/g) || [clean];
  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----\n`;
}

function textOf(node) {
  if (!node) return null;
  const t = node.textContent;
  return isNonEmptyString(t) ? t.trim() : null;
}

/**
 * Parse IdP metadata XML into { idpEntityId, idpSsoUrl, idpSsoBinding,
 * signingCerts: [pem...] }. Prefers the HTTP-Redirect SSO binding,
 * falls back to HTTP-POST, then to any SingleSignOnService. Throws on
 * malformed XML or a document without an EntityDescriptor.
 */
function parseIdpMetadata(xml) {
  if (!isNonEmptyString(xml)) throw new Error('IdP metadata XML is empty');
  let doc;
  try {
    doc = new DOMParser().parseFromString(xml, 'text/xml');
  } catch (err) {
    throw new Error('IdP metadata XML could not be parsed: ' + (err && err.message ? err.message : String(err)));
  }
  const parserErrors = doc.getElementsByTagName('parsererror');
  if (parserErrors && parserErrors.length > 0) {
    throw new Error('IdP metadata XML is malformed: ' + textOf(parserErrors[0]));
  }
  const descriptors = doc.getElementsByTagNameNS(SAML_NS, 'EntityDescriptor');
  const descriptor = (descriptors && descriptors.length > 0)
    ? descriptors[0]
    : doc.getElementsByTagName('EntityDescriptor')[0];
  if (!descriptor) throw new Error('IdP metadata has no EntityDescriptor');
  const idpEntityId = descriptor.getAttribute('entityID') || null;

  const idpDescriptors = doc.getElementsByTagNameNS(SAML_NS, 'IDPSSODescriptor');
  const idpDescriptor = (idpDescriptors && idpDescriptors.length > 0) ? idpDescriptors[0] : null;
  if (!idpDescriptor) throw new Error('IdP metadata has no IDPSSODescriptor');

  let idpSsoUrl = null;
  let idpSsoBinding = null;
  const ssoServices = idpDescriptor.getElementsByTagNameNS(SAML_NS, 'SingleSignOnService');
  const candidates = [];
  for (let i = 0; i < (ssoServices ? ssoServices.length : 0); i++) {
    candidates.push({
      binding: ssoServices[i].getAttribute('Binding'),
      location: ssoServices[i].getAttribute('Location'),
    });
  }
  const pick = (binding) => candidates.find((c) => c.binding === binding && isNonEmptyString(c.location));
  const redirect = pick(HTTP_REDIRECT_BINDING);
  const post = pick(HTTP_POST_BINDING);
  const any = candidates.find((c) => isNonEmptyString(c.location));
  const chosen = redirect || post || any;
  if (chosen) {
    idpSsoUrl = chosen.location;
    idpSsoBinding = chosen.binding;
  }

  const signingCerts = [];
  const keyDescriptors = idpDescriptor.getElementsByTagNameNS(SAML_NS, 'KeyDescriptor');
  for (let i = 0; i < (keyDescriptors ? keyDescriptors.length : 0); i++) {
    const kd = keyDescriptors[i];
    const use = kd.getAttribute('use');
    if (use && use !== 'signing') continue; // encryption-only keys do not verify responses
    const certNodes = kd.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'X509Certificate');
    for (let j = 0; j < (certNodes ? certNodes.length : 0); j++) {
      const pem = pemFromBase64Body(textOf(certNodes[j]));
      if (pem) signingCerts.push(pem);
    }
  }
  return { idpEntityId, idpSsoUrl, idpSsoBinding, signingCerts };
}

/**
 * Fetch IdP metadata over HTTPS (or plain HTTP only for a local test
 * URL — production IdPs must be https). TLS is VERIFIED
 * (rejectUnauthorized: true): metadata fetched over an untrusted channel
 * cannot be the basis for trusting an IdP's signing key. 10s timeout,
 * 1 MiB cap. Returns { ok, statusCode, xml, bytes } or throws.
 */
function fetchIdpMetadata(urlString, opts) {
  const o = (opts && typeof opts === 'object') ? opts : {};
  const timeoutMs = Number.isFinite(Number(o.timeoutMs)) ? Number(o.timeoutMs) : 10000;
  const maxBytes = Number.isFinite(Number(o.maxBytes)) ? Number(o.maxBytes) : 1024 * 1024;
  return new Promise((resolve, reject) => {
    let url;
    try { url = new URL(urlString); } catch (err) { return reject(new Error('Invalid IdP metadata URL: ' + err.message)); }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return reject(new Error('Unsupported IdP metadata URL protocol: ' + url.protocol));
    }
    if (url.protocol === 'http:' && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)) {
      return reject(new Error('Refusing to fetch IdP metadata over plain HTTP from a non-local host'));
    }
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(url, { timeout: timeoutMs, rejectUnauthorized: true }, (resp) => {
      if (resp.statusCode < 200 || resp.statusCode >= 300) {
        resp.resume();
        return reject(new Error(`IdP metadata fetch failed: HTTP ${resp.statusCode}`));
      }
      let size = 0;
      const chunks = [];
      resp.on('data', (c) => {
        size += c.length;
        if (size > maxBytes) {
          req.destroy(new Error('IdP metadata exceeds size limit'));
          return;
        }
        chunks.push(c);
      });
      resp.on('end', () => {
        const xml = Buffer.concat(chunks).toString('utf8');
        if (!/EntityDescriptor/.test(xml)) {
          return reject(new Error('Fetched document does not look like SAML metadata (no EntityDescriptor)'));
        }
        resolve({ ok: true, statusCode: resp.statusCode, xml, bytes: size });
      });
    });
    req.on('timeout', () => req.destroy(new Error('IdP metadata fetch timed out')));
    req.on('error', (err) => reject(err));
  });
}

/** Convenience: fetch + parse IdP metadata into config-shaped fields. */
async function loadIdpMetadata(urlString, opts) {
  const fetched = await fetchIdpMetadata(urlString, opts);
  const parsed = parseIdpMetadata(fetched.xml);
  return { ...fetched, ...parsed };
}

// ---------------------------------------------------------------------------
// Profile mapping, JIT provisioning, session minting
// ---------------------------------------------------------------------------

function firstAttr(profile, names) {
  for (const name of names) {
    const v = profile ? profile[name] : undefined;
    if (isNonEmptyString(v)) return v.trim();
    if (Array.isArray(v) && v.length && isNonEmptyString(v[0])) return String(v[0]).trim();
  }
  return null;
}

function allAttrs(profile, names) {
  const out = [];
  for (const name of names) {
    const v = profile ? profile[name] : undefined;
    if (Array.isArray(v)) out.push(...v.map((x) => String(x)));
    else if (isNonEmptyString(v)) out.push(v.trim());
  }
  return [...new Set(out)];
}

/**
 * Map a validated SAML profile to the fields OpManager needs.
 * Username is the email address when one is present (NameID otherwise):
 * the users table keys logins by username, and email is the stable,
 * IdP-asserted identifier. Returns null email when the IdP sent neither
 * an email attribute nor an email-shaped NameID — the routes must then
 * refuse the login rather than invent an identity.
 */
function mapProfileToUser(profile) {
  if (!profile || typeof profile !== 'object') throw new Error('mapProfileToUser: no profile');
  const email = firstAttr(profile, [
    'email', 'mail', EMAIL_OID,
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    'urn:oid:1.2.840.113549.1.9.1',
  ]) || (isNonEmptyString(profile.nameID) && /@/.test(profile.nameID) ? profile.nameID.trim() : null);
  const username = email || (isNonEmptyString(profile.nameID) ? profile.nameID.trim() : null);
  if (!username) throw new Error('SAML profile carries no usable NameID or email — cannot map to a local user');
  return {
    username,
    email,
    nameId: profile.nameID || null,
    nameIdFormat: profile.nameIDFormat || null,
    issuer: profile.issuer || null,
    sessionIndex: profile.sessionIndex || null,
    firstName: firstAttr(profile, ['givenName', 'firstName', GIVEN_NAME_OID,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']),
    lastName: firstAttr(profile, ['sn', 'surname', 'lastName', SURNAME_OID,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']),
    displayName: firstAttr(profile, ['displayName', 'name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']),
    groups: allAttrs(profile, ['groups', 'memberOf', 'roles',
      'http://schemas.xmlsoap.org/claims/Group',
      'urn:oid:1.3.6.1.4.1.5923.1.5.1.1']),
    // The verified assertion's attributes, for audit/debug (never raw XML).
    attributes: Object.fromEntries(
      Object.entries(profile).filter(([k, v]) => (
        typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'))
      ) && !k.startsWith('get')),
    ),
  };
}

/**
 * Find or (when JIT is enabled) create the local user for a mapped SAML
 * profile. JIT-created users get a random, unusable local password
 * (scrypt of 32 random bytes — nobody knows it, SSO is their only path)
 * and the configured default role, and are NOT flagged
 * must-change-password (that flag would 403 every API call after an SSO
 * login). Returns { user, created }.
 * When JIT is off and no local user exists, returns { user: null,
 * created: false } — the routes answer 403; this service never invents
 * a login.
 */
function provisionSamlUser(store, mapped, opts) {
  const s = store || getStore();
  const o = (opts && typeof opts === 'object') ? opts : {};
  const jit = o.jitProvisioning !== undefined ? Boolean(o.jitProvisioning) : false;
  const defaultRole = trimOrNull(o.defaultRole) || 'Operator';
  if (!mapped || !mapped.username) throw new Error('provisionSamlUser: mapped profile has no username');
  const existing = s.getUserByUsername(mapped.username);
  if (existing) return { user: existing, created: false };
  if (!jit) return { user: null, created: false };
  const sessionSvc = getSessionService();
  const randomPassword = crypto.randomBytes(32).toString('base64url');
  const user = s.createUser(mapped.username, sessionSvc.hashPassword(randomPassword), defaultRole);
  try { s.log(mapped.username, 'auth.saml.jit-provision', { role: defaultRole, issuer: mapped.issuer || null }); } catch { /* audit is best-effort */ }
  return { user, created: true };
}

/**
 * Mint a real OpManager session for a SAML-authenticated user and return
 * { token, expiresAt, user }. The raw token is returned ONCE to the
 * caller (the routes set it as the HttpOnly `opm_session` cookie); only
 * its SHA-256 hash is stored. TTL matches the local session TTL (8h).
 */
function createSamlSession(store, user) {
  const s = store || getStore();
  if (!user || user.id == null) throw new Error('createSamlSession: no user');
  const sessionSvc = getSessionService();
  const token = sessionSvc.createSessionToken();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  s.createSession(user.id, tokenHash, expiresAt);
  return { token, expiresAt, user: { id: user.id, username: user.username, role: user.role } };
}

module.exports = {
  // config
  loadSamlConfig,
  loadSamlConfigAsync,
  validateConfigIssues,
  getSamlStatus,
  inspectCertificate,
  verifyKeyPair,
  inspectPrivateKey,
  // client
  createSamlClient,
  getSamlClient,
  resetSamlClient,
  // flows
  generateSpMetadata,
  getLoginUrl,
  validateSamlResponse,
  SamlValidationError,
  // IdP metadata
  parseIdpMetadata,
  fetchIdpMetadata,
  loadIdpMetadata,
  // user mapping / session
  mapProfileToUser,
  provisionSamlUser,
  createSamlSession,
  // constants (for routes/tests)
  HTTP_REDIRECT_BINDING,
  HTTP_POST_BINDING,
  DEFAULTS,
};
