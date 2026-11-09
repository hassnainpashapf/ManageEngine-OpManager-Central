'use strict';
/**
 * SAML proof harness — proves the canonical SP flow as far as reality
 * allows (Phase 4 merge, branch p4m-saml).
 *
 * Canonical behaviour under test (server/services/saml.js — the
 * saml-service strict @node-saml implementation — plus
 * server/routes/saml.js at /api/auth/saml/*):
 *   - ACS success is a 302 redirect + opm_session cookie (same shape as
 *     local login), NOT a JSON 200. Failures are 401 JSON
 *     { error: 'invalid_saml_response', reason: '<class>' } where reason
 *     is signature|audience|issuer|recipient|destination|time|replay|
 *     inResponseTo|status|other.
 *   - Responses must be signed at BOTH Response and Assertion level
 *     (scripts/saml-test-idp.js signs both).
 *   - IdP-initiated SSO is REJECTED: validateInResponseTo is 'always',
 *     so a Response with no InResponseTo (or an unknown one) is 401
 *     inResponseTo. Every valid Response in this harness answers a
 *     pending AuthnRequest ID obtained from GET /api/auth/saml/login.
 *   - Encrypted assertions are SUPPORTED via decryptionPvk (opposite of
 *     the retired saml-proof hand-rolled service, which rejected them).
 *
 * Prerequisites (operator):
 *   1. Test IdP keypair created with openssl (never committed):
 *        openssl req -x509 -newkey rsa:2048 -keyout /tmp/saml-test-idp/key.pem \
 *          -out /tmp/saml-test-idp/cert.pem -days 365 -nodes \
 *          -subj "/CN=test-idp.local/O=Test IdP"
 *   2. This server running on its own port with a throwaway DB:
 *        PORT=8163 node server/index.js
 *      (first start creates the bootstrap admin; server/data/.admin-initial
 *      holds its one-time password.)
 *
 * Usage:
 *   node scripts/saml-proof.js --base http://127.0.0.1:8163 \
 *     --key /tmp/saml-test-idp/key.pem --cert /tmp/saml-test-idp/cert.pem
 *
 * What it proves, in order:
 *   0. Unauthenticated session check is 401 (sanity).
 *   1. Bootstrap admin login + must-change password rotation.
 *   2. SP metadata is 501 before SAML is configured, then 200 with the
 *      exact SP entity ID + ACS URL after configuration.
 *   3. SP-initiated login (GET /api/auth/saml/login) 302-redirects to
 *      the IdP SSO URL with a real, decodable AuthnRequest naming this SP.
 *   4. IdP-initiated Response (no InResponseTo) is REJECTED: 401
 *      inResponseTo — the decided canonical behaviour.
 *   5. A correctly signed Response answering the pending AuthnRequest
 *      is ACCEPTED: 302 + opm_session cookie, and that cookie
 *      authenticates as the asserted user (JIT-provisioned Operator)
 *      via GET /api/auth/session.
 *   6. The same Assertion posted again (same Response + Assertion IDs,
 *      fresh InResponseTo) is REJECTED: 401 replay.
 *   7. A Response tampered after signing (NameID changed) is REJECTED:
 *      401 signature — and creates no session.
 *   8. A correctly signed but expired Response is REJECTED: 401 time.
 *   9. A correctly signed Response for the wrong audience is REJECTED:
 *      401 audience.
 *  10. A correctly signed Response for the wrong recipient is REJECTED:
 *      401 recipient (the canonical bearer-Recipient enforcement).
 *  11. A Response answering an unknown request ID is REJECTED: 401
 *      inResponseTo.
 *
 * Notes:
 *   - The bootstrap admin password is rotated to a random in-memory value
 *     during the run (the must-change-password flag blocks the Settings
 *     API until it is changed). server/data/.admin-initial is stale after
 *     the run; that is expected for this throwaway proof DB. Re-runs pass
 *     the current admin password via OPM_PROOF_ADMIN_PASSWORD.
 *   - No production IdP exists yet: the IdP here is this local test
 *     script. The missing piece is documented in docs/saml-setup.md.
 *   - Results are printed as a table and written to
 *     ~/workspace/opm-p4/m4-work/saml-proof-results.json by default
 *     (override with --out; /tmp is not used — it fills up).
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { buildSamlResponse } = require('./saml-test-idp');

const ISSUER = 'https://test-idp.local/metadata';
const IDP_SSO_URL = 'https://test-idp.local/sso';
const NAME_ID = 'alice@example.test';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
      if (value !== 'true') i += 1;
      out[key] = value;
    }
  }
  return out;
}

class Jar {
  constructor() { this.cookies = new Map(); }
  store(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const header of list) {
      const pair = String(header).split(';')[0];
      const idx = pair.indexOf('=');
      if (idx > 0) this.cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
    }
  }
  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
  has(name) { return this.cookies.has(name); }
}

async function request(base, method, urlPath, { jar, body, headers, redirect = 'manual' } = {}) {
  const init = { method, headers: { ...(headers || {}) }, redirect };
  if (jar && jar.cookies.size) init.headers.Cookie = jar.header();
  if (body !== undefined) init.body = body;
  const res = await fetch(`${base}${urlPath}`, init);
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : null;
  if (jar && setCookie) jar.store(setCookie);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, headers: res.headers, text, json };
}

function check(name, ok, detail) {
  return { name, ok: Boolean(ok), detail: detail || '' };
}

/** Parse the AuthnRequest ID out of a login 302's SAMLRequest. */
function authnRequestIdFromLogin(res, idpSsoUrl) {
  const location = res.headers.get('location') || '';
  if (res.status !== 302 || !location.startsWith(`${idpSsoUrl}?`)) {
    return { id: null, detail: `HTTP ${res.status}, Location: ${location.slice(0, 120) || '(none)'}` };
  }
  try {
    const samlRequest = new URL(location).searchParams.get('SAMLRequest');
    const inflated = zlib.inflateRawSync(Buffer.from(samlRequest, 'base64')).toString('utf8');
    const idMatch = inflated.match(/<samlp:AuthnRequest[^>]*\sID="([^"]+)"/);
    const id = idMatch ? idMatch[1] : null;
    const namesSp = inflated.includes('<samlp:AuthnRequest');
    return { id, detail: `302 -> ${idpSsoUrl}, AuthnRequest ID ${id}, names SP: ${namesSp}` };
  } catch (err) {
    return { id: null, detail: `302 but SAMLRequest undecodable: ${err.message}` };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = (args.base || 'http://127.0.0.1:8163').replace(/\/+$/, '');
  const keyPath = args.key || process.env.SAML_TEST_IDP_KEY;
  const certPath = args.cert || process.env.SAML_TEST_IDP_CERT;
  const RESULTS_PATH = args.out || process.env.SAML_PROOF_RESULTS
    || path.join(os.homedir(), 'workspace', 'opm-p4', 'm4-work', 'saml-proof-results.json');
  if (!keyPath || !certPath) {
    console.error('Missing --key / --cert (test IdP keypair, created with openssl, runtime only).');
    process.exit(2);
  }
  const keyPem = fs.readFileSync(keyPath, 'utf8');
  const certPem = fs.readFileSync(certPath, 'utf8');
  const spEntityId = `${base}/api/auth/saml/metadata`;
  const spAcsUrl = `${base}/api/auth/saml/acs`;

  const results = [];
  const fail = (msg) => {
    console.error(`FATAL: ${msg}`);
    process.exit(2);
  };

  // 0. Server reachable? Unauthenticated session check must be 401.
  let r;
  try {
    r = await request(base, 'GET', '/api/auth/session', {});
  } catch (err) {
    fail(`Cannot reach server at ${base}: ${err.message}. Start it first: PORT=8163 node server/index.js`);
  }
  results.push(check('0 unauthenticated /api/auth/session is 401', r.status === 401, `HTTP ${r.status}`));

  // 1. Bootstrap admin login, then rotate the must-change password.
  const adminPasswordFile = args['admin-password-file']
    || path.join(process.cwd(), 'server', 'data', '.admin-initial');
  let adminPassword = process.env.OPM_PROOF_ADMIN_PASSWORD || null;
  if (!adminPassword) {
    try {
      adminPassword = fs.readFileSync(adminPasswordFile, 'utf8').trim();
    } catch {
      fail(`Cannot read bootstrap admin password at ${adminPasswordFile} (or set OPM_PROOF_ADMIN_PASSWORD).`);
    }
  }
  const adminJar = new Jar();
  r = await request(base, 'POST', '/api/auth/login', {
    jar: adminJar,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: adminPassword }),
  });
  if (r.status !== 200) fail(`Admin login failed: HTTP ${r.status} ${r.text.slice(0, 200)}`);
  results.push(check('1a bootstrap admin login succeeds', true, 'HTTP 200'));

  const newAdminPassword = crypto.randomBytes(12).toString('base64url');
  r = await request(base, 'POST', '/api/auth/change-password', {
    jar: adminJar,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword: adminPassword, newPassword: newAdminPassword }),
  });
  results.push(check(
    '1b bootstrap admin password rotated (must-change flag cleared)',
    r.status === 200 && r.json && r.json.mustChangePassword === false,
    `HTTP ${r.status}`,
  ));
  if (r.status !== 200) fail(`Password rotation failed: HTTP ${r.status} ${r.text.slice(0, 200)}`);

  // 2. SP metadata before config: 501. Then save config, metadata: 200.
  r = await request(base, 'GET', '/api/auth/saml/metadata', {});
  results.push(check(
    '2a GET /api/auth/saml/metadata before config is 501 not_implemented',
    r.status === 501 && r.json && r.json.error === 'not_implemented',
    `HTTP ${r.status} ${r.json ? r.json.error : r.text.slice(0, 80)}`,
  ));

  r = await request(base, 'POST', '/api/settings/auth/saml', {
    jar: adminJar,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      enabled: true,
      idpEntityId: ISSUER,
      idpSsoUrl: IDP_SSO_URL,
      certificate: certPem,
      jitProvisioning: true,
      defaultRole: 'Operator',
      spEntityId,
      spAcsUrl,
    }),
  });
  results.push(check(
    '2b SAML config saved (test IdP entity ID, SSO URL, certificate, JIT on)',
    r.status === 200 && r.json && r.json.status === 'success',
    `HTTP ${r.status} ${r.text.slice(0, 160)}`,
  ));
  if (r.status !== 200) fail(`Saving SAML config failed: HTTP ${r.status} ${r.text.slice(0, 300)}`);

  r = await request(base, 'GET', '/api/auth/saml/metadata', {});
  const metadataOk = r.status === 200
    && r.text.includes(`entityID="${spEntityId}"`)
    && r.text.includes(`Location="${spAcsUrl}"`);
  results.push(check(
    '2c GET /api/auth/saml/metadata is 200 with this SP entity ID + ACS URL',
    metadataOk,
    `HTTP ${r.status}`,
  ));

  // Helper: start a fresh SP-initiated login and return its AuthnRequest ID.
  async function freshRequestId() {
    const loginRes = await request(base, 'GET', '/api/auth/saml/login', {});
    const parsed = authnRequestIdFromLogin(loginRes, IDP_SSO_URL);
    if (!parsed.id) fail(`Login did not produce an AuthnRequest ID: ${parsed.detail}`);
    return parsed;
  }

  // 3. SP-initiated login: 302 to IdP with a real AuthnRequest.
  const firstLogin = await freshRequestId();
  results.push(check(
    '3 GET /api/auth/saml/login 302s to IdP with a real AuthnRequest',
    Boolean(firstLogin.id),
    firstLogin.detail,
  ));

  // Helper: POST a Response to the canonical ACS.
  async function postAcs(base64Response) {
    const jar = new Jar();
    const res = await request(base, 'POST', '/api/auth/saml/acs', {
      jar,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({ SAMLResponse: base64Response }).toString(),
    });
    return { res, jar };
  }
  function expectReject(name, out, reason) {
    const ok = out.res.status === 401
      && out.res.json && out.res.json.error === 'invalid_saml_response'
      && out.res.json.reason === reason
      && !out.jar.has('opm_session');
    return check(name, ok,
      `HTTP ${out.res.status} ${out.res.json ? `${out.res.json.error}/${out.res.json.reason || ''}` : out.res.text.slice(0, 120)}`);
  }

  const idpOpts = { keyPem, certPem, nameId: NAME_ID, audience: spEntityId, issuer: ISSUER, acsUrl: spAcsUrl };

  // 4. IdP-initiated Response (no InResponseTo): REJECTED by canonical
  // decision (validateInResponseTo 'always').
  {
    const idpInitiated = buildSamlResponse(idpOpts);
    const out = await postAcs(idpInitiated.base64);
    results.push(expectReject(
      '4 IdP-initiated Response (no InResponseTo) REJECTED: 401 inResponseTo, no session',
      out, 'inResponseTo',
    ));
  }

  // 5. Valid SP-initiated Response: accepted, session created, session
  // proves the user. Uses the pending request ID from step 3.
  const valid = buildSamlResponse({ ...idpOpts, inResponseTo: firstLogin.id });
  let out = await postAcs(valid.base64);
  const validAccepted = out.res.status === 302
    && out.jar.has('opm_session')
    && (out.res.headers.get('location') || '') === '/';
  results.push(check(
    '5a valid signed Response answering the pending AuthnRequest ACCEPTED: 302 + opm_session cookie',
    validAccepted,
    `HTTP ${out.res.status} Location: ${out.res.headers.get('location') || '(none)'} ${out.res.text.slice(0, 160)}`,
  ));
  let sessionProof = 'no session cookie issued';
  if (out.jar.has('opm_session')) {
    const s = await request(base, 'GET', '/api/auth/session', { jar: out.jar });
    const okSession = s.status === 200 && s.json && s.json.authenticated === true
      && s.json.user && s.json.user.username === NAME_ID && s.json.user.role === 'Operator';
    sessionProof = `GET /api/auth/session with SAML cookie: HTTP ${s.status}, user=${s.json && s.json.user ? `${s.json.user.username}/${s.json.user.role}` : 'n/a'}`;
    results.push(check('5b SAML session authenticates as alice@example.test / Operator', okSession, sessionProof));
  } else {
    results.push(check('5b SAML session authenticates as alice@example.test / Operator', false, sessionProof));
  }

  // 6. Replay: same Response + Assertion IDs, fresh InResponseTo (so the
  // replay check — not InResponseTo — is what must reject it).
  {
    const replayLogin = await freshRequestId();
    const replay = buildSamlResponse({
      ...idpOpts,
      inResponseTo: replayLogin.id,
      responseId: valid.responseId,
      assertionId: valid.assertionId,
    });
    out = await postAcs(replay.base64);
    results.push(expectReject(
      '6 replay of the same Assertion REJECTED: 401 replay, no session',
      out, 'replay',
    ));
  }

  // 7. Tampered Response (NameID changed after signing): rejected.
  {
    const login = await freshRequestId();
    const tampered = buildSamlResponse({ ...idpOpts, inResponseTo: login.id, tamperNameId: 'mallory@example.test' });
    out = await postAcs(tampered.base64);
    results.push(expectReject(
      '7 tampered Response (NameID -> mallory@example.test) REJECTED: 401 signature, no session',
      out, 'signature',
    ));
  }

  // 8. Expired Response (signed correctly, window 20m..10m ago): rejected.
  {
    const login = await freshRequestId();
    const now = Date.now();
    const expired = buildSamlResponse({
      ...idpOpts,
      inResponseTo: login.id,
      notBefore: new Date(now - 20 * 60 * 1000),
      notOnOrAfter: new Date(now - 10 * 60 * 1000),
    });
    out = await postAcs(expired.base64);
    results.push(expectReject(
      '8 expired Response REJECTED: 401 time, no session',
      out, 'time',
    ));
  }

  // 9. Wrong-audience Response (signed correctly): rejected.
  {
    const login = await freshRequestId();
    const wrongAud = buildSamlResponse({ ...idpOpts, inResponseTo: login.id, audience: 'https://wrong-consumer.example/sp' });
    out = await postAcs(wrongAud.base64);
    results.push(expectReject(
      '9 wrong-audience Response REJECTED: 401 audience, no session',
      out, 'audience',
    ));
  }

  // 10. Wrong-recipient Response (signed correctly): rejected by the
  // canonical bearer-Recipient enforcement.
  {
    const login = await freshRequestId();
    const wrongRecip = buildSamlResponse({ ...idpOpts, inResponseTo: login.id, acsUrl: 'https://evil.local/acs', destination: 'https://evil.local/acs' });
    out = await postAcs(wrongRecip.base64);
    results.push(expectReject(
      '10 wrong-recipient Response REJECTED: 401 recipient, no session',
      out, 'recipient',
    ));
  }

  // 11. Response answering an UNKNOWN request ID: rejected.
  {
    const unknownInResponseTo = buildSamlResponse({ ...idpOpts, inResponseTo: '_unknown-request-id' });
    out = await postAcs(unknownInResponseTo.base64);
    results.push(expectReject(
      '11 Response answering an UNKNOWN request ID REJECTED: 401 inResponseTo, no session',
      out, 'inResponseTo',
    ));
  }

  const allOk = results.every((x) => x.ok);
  const report = {
    runAt: new Date().toISOString(),
    base,
    spEntityId,
    spAcsUrl,
    idpEntityId: ISSUER,
    idpSsoUrl: IDP_SSO_URL,
    validAssertionId: valid.assertionId,
    nameId: NAME_ID,
    note: 'No production IdP exists yet. IdP here is the local openssl test IdP (scripts/saml-test-idp.js). Canonical SP: validateInResponseTo always (IdP-initiated rejected), Response + Assertion must both be signed, encrypted assertions supported.',
    checks: results,
    allOk,
  };
  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log('\nSAML PROOF RESULTS');
  console.log('==================');
  for (const c of results) {
    console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}\n        ${c.detail}`);
  }
  console.log(`\n${allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'} — details: ${RESULTS_PATH}`);
  console.log('Note: bootstrap admin password was rotated to a random in-memory value during this run;');
  console.log('server/data/.admin-initial is now stale (expected for this throwaway proof DB).');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(`FATAL: ${err.stack || err.message}`);
  process.exit(2);
});
