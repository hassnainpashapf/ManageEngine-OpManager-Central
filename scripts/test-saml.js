/**
 * scripts/test-saml.js — SAML negative/edge tests (test-only track).
 *
 * Probes the SAML 2.0 login flow of THIS OpManager Central build against a
 * throwaway, self-signed test IdP (keypair generated at runtime with
 * openssl into an os.tmpdir() directory; never written to the repo, never
 * logged, deleted when the script exits).
 *
 * What it does:
 *   0. Boots an admin session on the target server using the bootstrap
 *      admin password from server/data/.admin-initial (read at runtime,
 *      in-memory only, never logged), then clears the must-change-password
 *      flag with a random in-memory password so the session can call the
 *      settings APIs.
 *   1. Stores the test IdP certificate + entity IDs in
 *      POST /api/settings/auth/saml (the settings endpoint this build has),
 *      including spEntityId (the SP entity ID the ACS checks the audience
 *      against — without it the config is never login-ready).
 *   2. Discovers whether a SAML Assertion Consumer Service (ACS) endpoint
 *      exists at all, by POSTing a signed SAMLResponse to the conventional
 *      ACS paths, both unauthenticated (as a real IdP would) and with an
 *      admin session (to distinguish "no route" 404 from the auth guard's
 *      401). A real ACS MUST answer unauthenticated IdP POSTs.
 *   3. Runs the 7 cases against the discovered ACS (or, if none exists,
 *      against the primary candidate and records the exact responses).
 *      Canonical SP rules (Phase 4 merge): the ACS is
 *      /api/auth/saml/acs; Responses must be signed at BOTH Response and
 *      Assertion level; and every Response must answer a pending
 *      AuthnRequest (validateInResponseTo 'always' — IdP-initiated SSO is
 *      rejected), so each case first does GET /api/auth/saml/login and
 *      puts that request ID in InResponseTo (Response + Subject-
 *      ConfirmationData). The replay case reuses the valid Response's
 *      IDs with a FRESH InResponseTo, so the replay check — not
 *      InResponseTo — is what must reject it.
 *        (1) tampered Response (NameID altered after signing) -> reject
 *        (2) expired Response (Conditions NotOnOrAfter passed) -> reject
 *        (3) wrong audience -> reject
 *        (4) wrong recipient -> reject
 *        (5) unsigned Response -> reject
 *        (6) valid Response -> session created (exact proof)
 *        (7) replayed Response (same IDs twice) -> second rejected
 *
 * Verdicts: PASS (behaves as required), FAIL (SECURITY BUG — a Response
 * that must be rejected created a session, or the valid Response did not),
 * NOT_APPLICABLE (no ACS endpoint exists, so the case cannot be exercised).
 * Exit code 0 only if all 7 cases PASS; 1 otherwise.
 *
 * Usage:
 *   node scripts/test-saml.js [--base http://127.0.0.1:8163]
 *                             [--out scripts/test-saml-results.json]
 *
 * Re-running: the script clears the bootstrap admin's must-change flag by
 * changing its password to a random in-memory value (never persisted), so a
 * second run's bootstrap login will 401. To re-run against a fresh fixture,
 * reset this throwaway instance first: stop the server, delete
 * server/data/opmanager.db* in THIS clone only, restart — the bootstrap
 * admin (and a fresh server/data/.admin-initial) is regenerated on the
 * next login. Never do this on the shared :8060 server or any other clone.
 *
 * No product code is changed by this script. No credentials, private keys,
 * or session tokens are written to the results file or stdout (only
 * presence flags and the IdP certificate fingerprint).
 */
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function argVal(name, dflt) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
}
const BASE = (argVal('--base', 'http://127.0.0.1:8163') || '').replace(/\/$/, '');
const OUT = argVal('--out', path.join(__dirname, 'test-saml-results.json'));
const BASE_URL = new URL(BASE);

// Test IdP / SP identities. SP entity id is arbitrary here: it is what the
// test asserts the server must check (audience / recipient).
const IDP_ENTITY_ID = 'https://test-idp.local/metadata';
const IDP_SSO_URL = 'https://test-idp.local/sso';
const SP_ENTITY_ID = 'https://opm-test.local/sp';
const ACS_PATH = '/api/auth/saml/acs';
const ACS_URL = `${BASE}${ACS_PATH}`;
const SAML_USER = 'saml-test-user@test-idp.local';

// ACS candidates, most likely first.
const ACS_CANDIDATES = [
  '/api/auth/saml/acs',
  '/api/auth/saml/callback',
  '/api/saml/acs',
  '/saml/acs',
  '/api/settings/auth/saml/acs',
];

// ---------------------------------------------------------------------------
// Tiny HTTP client (stdlib only)
// ---------------------------------------------------------------------------
function request(method, urlPath, { headers = {}, body = null, cookie = null, timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE);
    const lib = url.protocol === 'https:' ? https : http;
    const h = { ...headers };
    if (cookie) h.Cookie = cookie;
    let payload = null;
    if (body !== null && body !== undefined) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      if (!h['Content-Type']) h['Content-Type'] = 'application/json';
      h['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = lib.request(url, { method, headers: h }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: res.statusCode,
          headers: res.headers,
          setCookie: res.headers['set-cookie'] || [],
          body: raw,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('request timed out')));
    if (payload) req.write(payload);
    req.end();
  });
}

function jsonBody(res) {
  try { return JSON.parse(res.body); } catch { return null; }
}
function bodyPreview(res, max = 2000) {
  return res.body.length > max ? `${res.body.slice(0, max)}…[truncated ${res.body.length - max} chars]` : res.body;
}
function cookieHeader(setCookieArray) {
  // Keep only name=value pairs; never log token values.
  return (setCookieArray || [])
    .map((c) => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}
function hasSessionCookie(setCookieArray) {
  return (setCookieArray || []).some((c) => c.startsWith('opm_session='));
}

// ---------------------------------------------------------------------------
// SAML Response builder + enveloped signer (xml-crypto / @xmldom/xmldom)
// ---------------------------------------------------------------------------
let SignedXml = null;
let DOMParser = null;
try {
  ({ SignedXml } = require('xml-crypto'));
  ({ DOMParser } = require('@xmldom/xmldom'));
} catch (e) {
  console.error('FATAL: xml-crypto + @xmldom/xmldom are required to sign test Responses.');
  console.error('Install them as test deps: npm i -D xml-crypto@6.4.0 @xmldom/xmldom@0.9.12');
  process.exit(2);
}

function iso(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function buildResponseXml(opts) {
  const now = new Date();
  const notBefore = iso(new Date(now.getTime() - 5 * 60 * 1000));
  const notOnOrAfter = iso(opts.notOnOrAfter || new Date(now.getTime() + 5 * 60 * 1000));
  const instant = iso(now);
  const responseId = opts.responseId || `_${crypto.randomBytes(16).toString('hex')}`;
  const assertionId = opts.assertionId || `_${crypto.randomBytes(16).toString('hex')}`;
  const audience = opts.audience !== undefined ? opts.audience : SP_ENTITY_ID;
  const recipient = opts.recipient !== undefined ? opts.recipient : ACS_URL;
  const nameId = opts.nameId || SAML_USER;
  const inResponseToAttr = opts.inResponseTo ? ` InResponseTo="${opts.inResponseTo}"` : '';
  return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${responseId}" Version="2.0" IssueInstant="${instant}" Destination="${recipient}"${inResponseToAttr}><saml:Issuer>${IDP_ENTITY_ID}</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${assertionId}" Version="2.0" IssueInstant="${instant}"><saml:Issuer>${IDP_ENTITY_ID}</saml:Issuer><saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${nameId}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${recipient}"${inResponseToAttr}/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}"><saml:AudienceRestriction><saml:Audience>${audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AuthnStatement AuthnInstant="${instant}"><saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement><saml:AttributeStatement><saml:Attribute Name="email"><saml:AttributeValue>${nameId}</saml:AttributeValue></saml:Attribute></saml:AttributeStatement></saml:Assertion></samlp:Response>`;
}

// Canonical SP requires BOTH signatures (wantAssertionsSigned and
// wantAuthnResponseSigned): sign the Assertion first, then the Response
// over the already-signed Assertion. opts { signAssertion, signResponse }
// (default true) build the unsigned variant for case 5.
function signAssertion(xml, privateKeyPem, certPem, opts) {
  const o = opts || {};
  function signOne(inputXml, xpath, locationRef) {
    const sig = new SignedXml({
      privateKey: privateKeyPem,
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
    });
    sig.addReference({
      xpath,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/2001/10/xml-exc-c14n#',
      ],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    });
    sig.keyInfoProvider = {
      getKeyInfo() {
        const b64 = certPem
          .replace(/-----BEGIN CERTIFICATE-----/g, '')
          .replace(/-----END CERTIFICATE-----/g, '')
          .replace(/\s+/g, '');
        return `<X509Data><X509Certificate>${b64}</X509Certificate></X509Data>`;
      },
      getKey() { return null; },
    };
    sig.computeSignature(inputXml, {
      location: { reference: locationRef, action: 'after' },
    });
    return sig.getSignedXml();
  }
  let out = xml;
  if (o.signAssertion !== false) {
    out = signOne(out, "//*[local-name(.)='Assertion']",
      "//*[local-name(.)='Assertion']/*[local-name(.)='Issuer']");
  }
  if (o.signResponse !== false) {
    out = signOne(out, "//*[local-name(.)='Response']",
      "//*[local-name(.)='Response']/*[local-name(.)='Issuer']");
  }
  return out;
}

function formEncodeSamlResponse(xml) {
  return `SAMLResponse=${encodeURIComponent(Buffer.from(xml, 'utf8').toString('base64'))}`;
}

// ---------------------------------------------------------------------------
// Session proof: does this cookie authenticate as a user?
// ---------------------------------------------------------------------------
async function sessionProof(cookie) {
  if (!cookie) return { cookiePresent: false, authenticated: false, status: null, body: null };
  const res = await request('GET', '/api/auth/session', { cookie });
  const parsed = jsonBody(res);
  return {
    cookiePresent: true,
    authenticated: res.status === 200 && Boolean(parsed && (parsed.user || parsed.authenticated)),
    status: res.status,
    body: bodyPreview(res, 500),
    username: parsed && parsed.user ? parsed.user.username || null : null,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const results = {
    tool: 'scripts/test-saml.js (saml-tests track, test-only)',
    base: BASE,
    startedAt: new Date().toISOString(),
    serverHead: null,
    idp: { entityId: IDP_ENTITY_ID, certFingerprint256: null, certSubject: null },
    controls: {},
    acsDiscovery: [],
    acs: null,
    cases: [],
    verdicts: {},
  };
  try { results.serverHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT }).toString().trim(); } catch { /* best effort */ }

  let tmpDir = null;
  try {
    // ---- 0. Server reachable? -------------------------------------------
    const pre = await request('GET', '/api/auth/session');
    results.controls.serverUp = { status: pre.status, body: bodyPreview(pre, 300) };
    if (pre.status !== 401) {
      console.error(`Unexpected /api/auth/session status without cookie: ${pre.status} (expected 401)`);
    }

    // ---- 0b. Admin session via bootstrap password (runtime only) ---------
    // First login attempt triggers ensureFirstAdmin, which writes
    // server/data/.admin-initial (mode 600). Use a dummy password so the
    // bootstrap file is created, then read it and log in for real.
    await request('POST', '/api/auth/login', { body: { username: 'admin', password: 'bootstrap-probe-dummy' } });
    const adminInitial = path.join(REPO_ROOT, 'server', 'data', '.admin-initial');
    if (!fs.existsSync(adminInitial)) throw new Error('server/data/.admin-initial was not created by the bootstrap login');
    const bootstrapPw = fs.readFileSync(adminInitial, 'utf8').trim();
    const login = await request('POST', '/api/auth/login', { body: { username: 'admin', password: bootstrapPw } });
    results.controls.adminLogin = { status: login.status, body: bodyPreview(login, 300), setCookie: hasSessionCookie(login.setCookie) };
    if (login.status !== 200) throw new Error(`admin login failed: HTTP ${login.status}`);
    let adminCookie = cookieHeader(login.setCookie);
    const loginParsed = jsonBody(login);
    // Clear the must-change-password flag with a random in-memory password.
    if (loginParsed && loginParsed.mustChangePassword) {
      const newPw = crypto.randomBytes(12).toString('base64url') + 'Aa1!';
      const changed = await request('POST', '/api/auth/change-password', {
        cookie: adminCookie,
        body: { currentPassword: bootstrapPw, newPassword: newPw },
      });
      results.controls.clearMustChange = { status: changed.status, body: bodyPreview(changed, 300) };
      if (changed.status !== 200) throw new Error(`change-password failed: HTTP ${changed.status}`);
      adminCookie = cookieHeader(changed.setCookie) || adminCookie;
    }
    const sess = await request('GET', '/api/auth/session', { cookie: adminCookie });
    results.controls.adminSession = { status: sess.status, body: bodyPreview(sess, 300) };
    if (sess.status !== 200) throw new Error(`admin session check failed: HTTP ${sess.status}`);

    // ---- 1. Runtime test IdP keypair (openssl, temp dir only) ------------
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saml-tests-idp-'));
    const keyPath = path.join(tmpDir, 'idp-key.pem');
    const certPath = path.join(tmpDir, 'idp-cert.pem');
    execFileSync('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-keyout', keyPath, '-out', certPath,
      '-days', '2', '-nodes', '-subj', '/CN=test-idp.local',
    ], { stdio: 'ignore' });
    const privateKeyPem = fs.readFileSync(keyPath, 'utf8');
    const certPem = fs.readFileSync(certPath, 'utf8');
    const x509 = new crypto.X509Certificate(certPem);
    results.idp.certFingerprint256 = x509.fingerprint256;
    results.idp.certSubject = x509.subject;
    results.idp.certValidTo = x509.validTo;

    // ---- 2. Store the test IdP config in the SAML settings endpoint ------
    const save = await request('POST', '/api/settings/auth/saml', {
      cookie: adminCookie,
      body: {
        enabled: true,
        idpEntityId: IDP_ENTITY_ID,
        idpSsoUrl: IDP_SSO_URL,
        spEntityId: SP_ENTITY_ID,
        spAcsUrl: ACS_URL,
        certificate: certPem,
        jitProvisioning: true,
        defaultRole: 'admin',
      },
    });
    const saveParsed = jsonBody(save) || {};
    results.controls.samlSettingsSave = {
      status: save.status,
      body: bodyPreview(save, 500),
      certificateConfigured: saveParsed.saml ? saveParsed.saml.certificateConfigured : null,
    };
    const getCfg = await request('GET', '/api/settings/auth/saml', { cookie: adminCookie });
    results.controls.samlSettingsGet = { status: getCfg.status, body: bodyPreview(getCfg, 500) };
    // The /test endpoint fetches the configured IdP metadata URL over the
    // network; test-idp.local does not resolve, and the server-side fetch
    // can hang past a normal client timeout. Bound it and record the
    // outcome (including a timeout) instead of aborting the whole run.
    // A first attempt that times out is retried once with a 30 s budget so
    // the result distinguishes "slow" from "hangs indefinitely".
    const testAttempt = async (timeoutMs) => {
      try {
        const r = await request('POST', '/api/settings/auth/saml/test', { cookie: adminCookie, body: {}, timeoutMs });
        return { status: r.status, body: bodyPreview(r, 4000) };
      } catch (err) {
        return { status: null, body: null, error: err.message };
      }
    };
    const first = await testAttempt(8000);
    if (first.status === null) {
      const second = await testAttempt(30000);
      results.controls.samlSettingsTest = {
        ...first,
        retry30s: second,
        note: 'No response within 8000 ms on the first attempt; retried once with a 30 s budget (see retry30s). '
          + 'The server-side metadata fetch does not bound DNS/connect time the way its 5 s read timeout suggests.',
      };
    } else {
      results.controls.samlSettingsTest = first;
    }

    // ---- 3. ACS discovery --------------------------------------------------
    // A fresh, valid, signed Response is used as the probe so that a real
    // ACS answers with its real accept/reject behaviour, not with a
    // "missing SAMLResponse" error.
    //
    // Existence is judged against BASELINES, not against fixed status
    // codes: this build has generic rejections that mimic a route —
    //   * /api/* paths: apiAuthGuard 401 {error:'unauthorized'} without a
    //     session, and the catch-all 404 {error:'not_found'} with one;
    //   * non-/api paths: ncmclient.js is mounted at root with a guard
    //     that 401s {"status":"error","message":"Authentication required"}
    //     for ANY request where req.user is unset — and req.user is only
    //     ever set by requireAuth, which apiAuthGuard runs solely for
    //     /api/* paths. So a non-/api path 401s even WITH a valid cookie.
    // A candidate "exists" only if its response DIFFERS from the baseline
    // for a known-nonexistent path in the same class. This also tests what
    // matters operationally: whether an unauthenticated IdP POST can reach
    // the ACS at all. (Consequence for the saml-routes track: an ACS under
    // /api/* must be added to PUBLIC_API_ROUTES in server/index.js, and
    // one outside /api/* must mount before ncmclientRoute's root guard —
    // otherwise the IdP POST can never reach it.)
    const probeXml = signAssertion(buildResponseXml({}), privateKeyPem, certPem);
    const probeBody = formEncodeSamlResponse(probeXml);
    async function probe(path, cookie) {
      const r = await request('POST', path, {
        cookie: cookie || null,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: probeBody,
      });
      return { status: r.status, body: bodyPreview(r, 500), setCookie: hasSessionCookie(r.setCookie) };
    }
    const baselineApi = {
      unauthenticated: await probe('/api/__saml-test-nonexistent__', null),
      authenticated: await probe('/api/__saml-test-nonexistent__', adminCookie),
    };
    const baselineNonApi = {
      unauthenticated: await probe('/__saml-test-nonexistent__', null),
      authenticated: await probe('/__saml-test-nonexistent__', adminCookie),
    };
    results.acsDiscoveryBaselines = { api: baselineApi, nonApi: baselineNonApi };
    const sameAs = (a, b) => a.status === b.status && a.body === b.body;
    for (const candidate of ACS_CANDIDATES) {
      const isApi = candidate.startsWith('/api/');
      const baseline = isApi ? baselineApi : baselineNonApi;
      const noAuth = await probe(candidate, null);
      const withAuth = await probe(candidate, adminCookie);
      const entry = {
        path: candidate,
        unauthenticated: noAuth,
        authenticated: withAuth,
      };
      // Route exists only if at least one side differs from the baseline
      // for a known-nonexistent path in the same class.
      entry.routeExists = !sameAs(noAuth, baseline.unauthenticated) || !sameAs(withAuth, baseline.authenticated);
      results.acsDiscovery.push(entry);
      if (entry.routeExists && !results.acs) results.acs = candidate;
    }

    // ---- 4. The 7 cases ----------------------------------------------------
    const acsPath = results.acs || ACS_PATH;
    const acsFound = Boolean(results.acs);

    // Canonical SP: every Response must answer a pending AuthnRequest.
    // GET /api/auth/saml/login (public) returns a 302 whose SAMLRequest
    // carries the request ID; each case takes a fresh one so a failure
    // can only come from the defect the case exercises. Returns null
    // (and records the failure) when no request ID can be obtained.
    const zlib = require('zlib');
    async function freshRequestId() {
      const loginRes = await request('GET', '/api/auth/saml/login', {});
      const location = loginRes.headers.location || '';
      if (loginRes.status !== 302 || !location) return null;
      try {
        const samlRequest = new URL(location).searchParams.get('SAMLRequest');
        const inflated = zlib.inflateRawSync(Buffer.from(samlRequest, 'base64')).toString('utf8');
        const m = /<samlp:AuthnRequest[^>]*\sID="([^"]+)"/.exec(inflated);
        return m ? m[1] : null;
      } catch { return null; }
    }
    async function buildCaseXml(buildOpts, signOpts) {
      const reqId = await freshRequestId();
      if (!reqId) throw new Error('GET /api/auth/saml/login did not return a usable AuthnRequest ID');
      return {
        xml: signAssertion(buildResponseXml({ ...buildOpts, inResponseTo: reqId }), privateKeyPem, certPem, signOpts),
        requestId: reqId,
      };
    }

    async function postCase(xml) {
      const res = await request('POST', acsPath, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formEncodeSamlResponse(xml),
      });
      const cookie = cookieHeader(res.setCookie);
      const proof = await sessionProof(cookie || null);
      return { res, cookiePresent: Boolean(cookie), proof };
    }

    function recordCase(id, title, expected, outcome, notes) {
      const c = {
        id, title, expected,
        acsPath, acsFound,
        status: outcome.res.status,
        body: bodyPreview(outcome.res, 2000),
        setCookieOpSession: hasSessionCookie(outcome.res.setCookie),
        sessionProof: outcome.proof,
        // Accepted = the POST produced an authenticated session for the
        // SAML user. Verdicts are assigned AFTER all cases run (see below):
        // rejections are only meaningful if the valid Response (case 6)
        // proves SAML processing actually runs.
        accepted: outcome.proof.authenticated || hasSessionCookie(outcome.res.setCookie),
        verdict: null, notes: notes || null,
      };
      if (!acsFound) {
        c.verdict = 'NOT_APPLICABLE';
        c.notes = 'No SAML ACS endpoint exists in this build, so the case cannot be exercised. '
          + `POST ${acsPath} answered HTTP ${outcome.res.status} with ${JSON.stringify(bodyPreview(outcome.res, 300))}.`;
      }
      results.cases.push(c);
      return c;
    }

    // (1) Tampered: sign, then alter the NameID.
    {
      const signed = (await buildCaseXml({})).xml;
      const tampered = signed.replace(
        `>${SAML_USER}<`,
        '>attacker@test-idp.local<',
      );
      if (tampered === signed) throw new Error('tamper step failed: NameID not found in signed XML');
      const out = await postCase(tampered);
      const c = recordCase(1, 'tampered Response (NameID altered after signing)', 'rejected, no session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: a Response whose signature no longer matches its content created a session.';
    }

    // (2) Expired: NotOnOrAfter 10 minutes in the past (signature valid).
    {
      const xml = (await buildCaseXml({ notOnOrAfter: new Date(Date.now() - 10 * 60 * 1000) })).xml;
      const out = await postCase(xml);
      const c = recordCase(2, 'expired Response (Conditions NotOnOrAfter in the past)', 'rejected, no session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: an expired Response created a session.';
    }

    // (3) Wrong audience.
    {
      const xml = (await buildCaseXml({ audience: 'https://someone-else.local/sp' })).xml;
      const out = await postCase(xml);
      const c = recordCase(3, 'wrong audience', 'rejected, no session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: a Response for a different audience created a session.';
    }

    // (4) Wrong recipient.
    {
      const xml = (await buildCaseXml({ recipient: 'https://evil.local/acs' })).xml;
      const out = await postCase(xml);
      const c = recordCase(4, 'wrong recipient', 'rejected, no session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: a Response addressed to a different recipient created a session.';
    }

    // (5) Unsigned Response.
    {
      const reqId = await freshRequestId();
      if (!reqId) throw new Error('GET /api/auth/saml/login did not return a usable AuthnRequest ID');
      const xml = buildResponseXml({ inResponseTo: reqId });
      const out = await postCase(xml);
      const c = recordCase(5, 'unsigned Response', 'rejected, no session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: an unsigned Response created a session.';
    }

    // (6) Valid Response — must create a session (exact proof).
    let validXml = null;
    let validIds = null;
    {
      const built = await buildCaseXml({});
      validXml = built.xml;
      // Keep the IDs: the replay case reuses them with a fresh
      // InResponseTo so the replay check is what rejects it. The
      // posted XML's own IDs are authoritative — extract from it.
      const postedResp = /<samlp:Response[^>]*ID="([^"]+)"/.exec(validXml);
      const postedAssert = /<saml:Assertion[^>]*ID="([^"]+)"/.exec(validXml);
      validIds = {
        responseId: postedResp ? postedResp[1] : null,
        assertionId: postedAssert ? postedAssert[1] : null,
      };
      const out = await postCase(validXml);
      const c = recordCase(6, 'valid Response', 'session created for the SAML user', out);
      // Only overwrite the NOT_APPLICABLE note when an ACS actually exists.
      if (acsFound) {
        c.notes = out.proof.authenticated
          ? `Session proof: GET /api/auth/session with the returned cookie -> HTTP ${out.proof.status}, user ${out.proof.username || '(unknown)'}.`
          : 'Valid signed Response did not produce an authenticated session (see status/body).';
      }
    }

    // (7) Replay: the same Response + Assertion IDs a second time,
    // with a FRESH InResponseTo (fresh login) — must be rejected by the
    // replay check, not by InResponseTo.
    {
      const replayReqId = await freshRequestId();
      if (!replayReqId) throw new Error('GET /api/auth/saml/login did not return a usable AuthnRequest ID');
      const replayXml = signAssertion(
        buildResponseXml({ inResponseTo: replayReqId, responseId: validIds.responseId, assertionId: validIds.assertionId }),
        privateKeyPem, certPem,
      );
      const out = await postCase(replayXml);
      const c = recordCase(7, 'replayed Response (same IDs sent twice)', 'second submission rejected, no new session', out);
      if (c.accepted) c.bugNote = 'SECURITY BUG: a replayed Response created a (new) session.';
    }

    // ---- Verdicts (only meaningful once the positive control ran) --------
    // A rejection is only evidence of validation if the valid Response
    // (case 6) proves SAML processing actually runs. If case 6 fails to
    // create a session, cases 1-5 and 7 are INCONCLUSIVE, not PASS:
    // "reject everything" is safe but proves nothing about the checks.
    if (acsFound) {
      const validCase = results.cases.find((c) => c.id === 6);
      const validOk = Boolean(validCase && validCase.sessionProof && validCase.sessionProof.authenticated);
      for (const c of results.cases) {
        if (c.id === 6) {
          c.verdict = validOk ? 'PASS' : 'FAIL';
        } else if (!validOk) {
          c.verdict = 'INCONCLUSIVE';
          c.notes = 'Cannot confirm SAML validation ran: the valid Response (case 6) also failed to create a session, so this rejection may be "reject everything" rather than real validation of the defect.';
        } else if (c.accepted) {
          c.verdict = 'FAIL';
          c.notes = c.bugNote || 'SECURITY BUG: a Response that must be rejected created a session.';
        } else {
          c.verdict = 'PASS';
        }
        delete c.bugNote;
      }
    }

    results.finishedAt = new Date().toISOString();
    results.verdicts = Object.fromEntries(results.cases.map((c) => [c.id, c.verdict]));
    const fails = results.cases.filter((c) => c.verdict === 'FAIL').length;
    const na = results.cases.filter((c) => c.verdict === 'NOT_APPLICABLE').length;
    const passes = results.cases.filter((c) => c.verdict === 'PASS').length;
    const inconclusive = results.cases.filter((c) => c.verdict === 'INCONCLUSIVE').length;
    results.summary = {
      pass: passes, fail: fails, notApplicable: na, inconclusive,
      acsFound,
      overall: fails > 0 ? 'FAIL — security bug(s) found (see case notes)'
        : na > 0 ? 'NOT_APPLICABLE — no SAML ACS endpoint exists in this build'
        : inconclusive > 0 ? 'INCONCLUSIVE — ACS found but the valid Response did not create a session, so the rejections are unproven'
        : 'PASS — all 7 cases behaved as required',
    };
  } catch (err) {
    results.error = { message: err.message, stack: err.stack };
  } finally {
    if (tmpDir) { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best effort */ } }
  }

  fs.writeFileSync(OUT, `${JSON.stringify(results, null, 2)}\n`);
  // Human summary (no secrets: no passwords, keys, or token values).
  console.log(`\nSAML negative/edge tests — ${BASE} (server HEAD ${results.serverHead || 'unknown'})`);
  console.log(`ACS endpoint found: ${results.acs ? results.acs : 'NONE'}`);
  console.log(`IdP cert fingerprint256: ${results.idp.certFingerprint256 || 'n/a'}`);
  console.log('Controls:');
  for (const [k, v] of Object.entries(results.controls)) {
    const extra = v.error ? ` — ERROR: ${v.error}` : (v.body ? ` — ${String(v.body).slice(0, 160)}` : '');
    console.log(`  ${k}: HTTP ${v.status === null || v.status === undefined ? '(no response)' : v.status}${extra}`);
  }
  console.log('ACS discovery baselines (known-nonexistent paths):');
  if (results.acsDiscoveryBaselines) {
    const b = results.acsDiscoveryBaselines;
    console.log(`  /api/__saml-test-nonexistent__: unauth HTTP ${b.api.unauthenticated.status} | auth HTTP ${b.api.authenticated.status}`);
    console.log(`  /__saml-test-nonexistent__: unauth HTTP ${b.nonApi.unauthenticated.status} | auth HTTP ${b.nonApi.authenticated.status}`);
  }
  console.log('ACS discovery:');
  for (const d of results.acsDiscovery) {
    console.log(`  ${d.path}: unauth HTTP ${d.unauthenticated.status} | auth HTTP ${d.authenticated.status} | routeExists=${d.routeExists}`);
  }
  console.log('Cases:');
  for (const c of results.cases) {
    console.log(`  (${c.id}) ${c.title}: HTTP ${c.status} — ${c.verdict}${c.notes ? ` — ${c.notes}` : ''}`);
    console.log(`      body: ${String(c.body).slice(0, 300)}`);
  }
  console.log(`Summary: ${results.summary ? results.summary.overall : 'ERROR — see results file'}`);
  console.log(`Full results: ${OUT}`);
  if (results.error) { console.error(`ERROR: ${results.error.message}`); process.exitCode = 1; return; }
  process.exitCode = results.summary && results.summary.overall.startsWith('PASS') ? 0 : 1;
}

main().catch((err) => { console.error(err); process.exit(1); });
