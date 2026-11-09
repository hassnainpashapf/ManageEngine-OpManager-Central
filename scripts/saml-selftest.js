'use strict';
/**
 * SAML SP self-test — scripts/saml-selftest.js
 *
 * Usage: node scripts/saml-selftest.js
 *
 * Proves server/services/saml.js end-to-end WITHOUT a production IdP:
 * a throwaway test IdP is built in-process — openssl generates a fresh
 * SP key/cert and IdP key/cert in a temp dir, and xml-crypto signs real
 * SAML Responses with the test IdP key, exactly as a real IdP would.
 * The Responses are SELF-ISSUED FOR TESTING ONLY: they prove the SP
 * validates signatures, audience, issuer, recipient, time windows,
 * InResponseTo and replays correctly. They are not from a production
 * IdP and must never be treated as one.
 *
 * What it checks:
 *   1. SP metadata generation (EntityDescriptor, ACS URL, SP cert).
 *   2. AuthnRequest building (login URL, decodable SAMLRequest, Issuer).
 *   3. Valid signed Response accepted (both Response + Assertion signed).
 *   4. Negative cases, each REJECTED: tampered NameID (signature),
 *      wrong audience, wrong issuer, expired assertion, wrong recipient,
 *      unsigned Response, replayed Response.
 *   5. IdP metadata parse round-trip.
 *   6. JIT provisioning against the REAL SQLite store (throwaway DB in
 *      the temp dir) + real session minting (token hash stored).
 *   7. getSamlStatus() contains no key material.
 *
 * All keys/certs live only in the temp dir and are deleted on exit
 * (success or failure). Output prints fingerprints and IDs only —
 * never private key material. Exit code 0 only when every check passes.
 */

const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opm-saml-selftest-'));
process.env.OPMANAGER_DB_PATH = path.join(tmp, 'opmanager.db');

// Keys are generated fresh per run, used only in-memory / in the temp
// dir, and deleted with it. They are never committed or logged.
const SP_KEY = path.join(tmp, 'sp-key.pem');
const SP_CERT = path.join(tmp, 'sp-cert.pem');
const IDP_KEY = path.join(tmp, 'idp-key.pem');
const IDP_CERT = path.join(tmp, 'idp-cert.pem');

const SP_ENTITY_ID = 'https://opm-test.local/saml/sp';
const ACS_URL = 'https://opm-test.local/api/auth/saml/acs';
const IDP_ENTITY_ID = 'https://idp-test.local/metadata';
const IDP_SSO_URL = 'https://idp-test.local/sso';
const TEST_EMAIL = 'saml.user@test.local';

let failures = 0;
const results = [];

function check(name, ok, detail) {
  results.push({ name, ok: Boolean(ok), detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures += 1;
}

function iso(offsetMs) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function b64(s) {
  return Buffer.from(s, 'utf8').toString('base64');
}

function certBody(pem) {
  return pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, '');
}

function opensslCert(keyPath, certPath, cn) {
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048',
    '-keyout', keyPath, '-out', certPath,
    '-days', '1', '-nodes', '-subj', `/CN=${cn}`,
  ], { stdio: 'ignore' });
}

function main() {
  // --- 0. Throwaway credentials (openssl) ---------------------------------
  opensslCert(SP_KEY, SP_CERT, 'OpManager Test SP');
  opensslCert(IDP_KEY, IDP_CERT, 'OpManager Test IdP');
  const spKeyPem = fs.readFileSync(SP_KEY, 'utf8');
  const spCertPem = fs.readFileSync(SP_CERT, 'utf8');
  const idpKeyPem = fs.readFileSync(IDP_KEY, 'utf8');
  const idpCertPem = fs.readFileSync(IDP_CERT, 'utf8');
  const idpCertB64 = certBody(idpCertPem);
  const spFingerprint = new crypto.X509Certificate(spCertPem).fingerprint256;
  const idpFingerprint = new crypto.X509Certificate(idpCertPem).fingerprint256;

  process.env.SAML_SP_PRIVATE_KEY_FILE = SP_KEY;
  process.env.SAML_SP_CERT_FILE = SP_CERT;

  const saml = require('../server/services/saml');
  const store = require('../server/services/store');
  const { SignedXml } = require('xml-crypto');

  const config = saml.loadSamlConfig({
    enabled: true,
    spEntityId: SP_ENTITY_ID,
    spAcsUrl: ACS_URL,
    idpEntityId: IDP_ENTITY_ID,
    idpSsoUrl: IDP_SSO_URL,
    idpCert: idpCertPem,
    jitProvisioning: true,
    defaultRole: 'Operator',
  });
  check('config loads login-ready', config.issues.length === 0, config.issues.join('; ') || 'no issues');
  check('SP key loaded from file env only', config.spKeySource === 'file' && Boolean(config.spPrivateKey), `source=${config.spKeySource}`);

  const status = saml.getSamlStatus(config);
  check('status: configured + key matches cert',
    status.configured === true && status.spKeyMatchesCert === true && status.idpCertCount === 1,
    `configured=${status.configured} keyMatches=${status.spKeyMatchesCert} idpCerts=${status.idpCertCount}`);
  check('status: SP cert fingerprint matches generated cert',
    status.spCert.fingerprint256 === spFingerprint, status.spCert.fingerprint256);
  check('status: IdP cert fingerprint matches generated cert',
    status.idpCerts[0] && status.idpCerts[0].fingerprint256 === idpFingerprint, idpFingerprint);
  check('status: contains no private key material',
    !JSON.stringify(status).includes('PRIVATE KEY') && !JSON.stringify(status).includes('MII'),
    'status JSON is key-free');

  // --- 1. SP metadata ------------------------------------------------------
  const metadata = saml.generateSpMetadata(config);
  check('metadata: EntityDescriptor with SP entityID',
    metadata.includes(`entityID="${SP_ENTITY_ID}"`), `length=${metadata.length}`);
  check('metadata: ACS URL present', metadata.includes(ACS_URL), '');
  check('metadata: SP certificate embedded',
    metadata.includes(certBody(spCertPem).slice(0, 40)), 'first 40 chars of cert body present');
  check('metadata: signed (Signature element present)', metadata.includes('<ds:Signature') || metadata.includes('<Signature'), '');

  // --- 2. AuthnRequest -----------------------------------------------------
  const client = saml.getSamlClient(config);
  return (async () => {
    const { url } = await saml.getLoginUrl(client, '/dashboard');
    check('login URL points at IdP SSO', url.startsWith(IDP_SSO_URL), url.slice(0, 80) + '...');
    const loginUrl = new URL(url);
    const samlRequestB64 = loginUrl.searchParams.get('SAMLRequest');
    check('login URL carries SAMLRequest', Boolean(samlRequestB64), '');
    const requestXml = zlib.inflateRawSync(Buffer.from(samlRequestB64, 'base64')).toString('utf8');
    const requestId = /<samlp:AuthnRequest[^>]*\bID="([^"]+)"/.exec(requestXml)?.[1]
      || /ID="([^"]+)"/.exec(requestXml)?.[1];
    check('AuthnRequest decodes with SP Issuer + IdP Destination',
      requestXml.includes(`>${SP_ENTITY_ID}</saml:Issuer>`)
      && requestXml.includes(`Destination="${IDP_SSO_URL}"`),
      `requestId=${requestId}`);

    // --- Test-IdP Response builder (signs with the test IdP key) ---------
    function buildResponseXml(o) {
      const now = iso(0);
      const notBefore = o.notBefore || iso(-60000);
      const notOnOrAfter = o.notOnOrAfter || iso(300000);
      const issuer = o.issuer || IDP_ENTITY_ID;
      const audience = o.audience || SP_ENTITY_ID;
      const recipient = o.recipient || ACS_URL;
      const destination = o.destination || ACS_URL;
      const nameId = o.nameId !== undefined ? o.nameId : TEST_EMAIL;
      return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${o.responseId}" Version="2.0" IssueInstant="${now}" Destination="${destination}" InResponseTo="${o.inResponseTo}"><saml:Issuer>${issuer}</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${o.assertionId}" Version="2.0" IssueInstant="${now}"><saml:Issuer>${issuer}</saml:Issuer><saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">${nameId}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData InResponseTo="${o.inResponseTo}" NotOnOrAfter="${notOnOrAfter}" Recipient="${recipient}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}"><saml:AudienceRestriction><saml:Audience>${audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AuthnStatement AuthnInstant="${now}" SessionIndex="_sess-test-1"><saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement><saml:AttributeStatement><saml:Attribute Name="email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"><saml:AttributeValue>${TEST_EMAIL}</saml:AttributeValue></saml:Attribute><saml:Attribute Name="givenName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"><saml:AttributeValue>Test</saml:AttributeValue></saml:Attribute><saml:Attribute Name="sn" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"><saml:AttributeValue>User</saml:AttributeValue></saml:Attribute><saml:Attribute Name="groups" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"><saml:AttributeValue>Operators</saml:AttributeValue></saml:Attribute></saml:AttributeStatement></saml:Assertion></samlp:Response>`;
    }

    function signXml(xml, xpath, locationRef) {
      const sig = new SignedXml({
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
      sig.privateKey = idpKeyPem;
      sig.publicCert = idpCertPem;
      sig.computeSignature(xml, { location: { reference: locationRef, action: 'after' } });
      return sig.getSignedXml();
    }

    function buildSignedResponse(o) {
      let xml = buildResponseXml(o);
      if (o.signAssertion !== false) {
        xml = signXml(xml, "//*[local-name(.)='Assertion']",
          "//*[local-name(.)='Assertion']/*[local-name(.)='Issuer']");
      }
      if (o.signResponse !== false) {
        xml = signXml(xml, "//*[local-name(.)='Response']",
          "//*[local-name(.)='Response']/*[local-name(.)='Issuer']");
      }
      return xml;
    }

    async function freshLogin() {
      const { url: u } = await saml.getLoginUrl(client, '');
      const reqB64 = new URL(u).searchParams.get('SAMLRequest');
      const reqXml = zlib.inflateRawSync(Buffer.from(reqB64, 'base64')).toString('utf8');
      const id = /ID="([^"]+)"/.exec(reqXml)[1];
      return id;
    }

    let n = 0;
    const ids = () => ({ responseId: `_resp-test-${++n}`, assertionId: `_assert-test-${n}` });

    async function expectReject(name, responseXml, expectedReason) {
      try {
        await saml.validateSamlResponse(client, { SAMLResponse: b64(responseXml) });
        check(name, false, 'ACCEPTED — expected rejection');
      } catch (err) {
        const ok = err && err.name === 'SamlValidationError'
          && (!expectedReason || err.reason === expectedReason);
        check(name, ok, `reason=${err && err.reason} (${(err && err.message || '').slice(0, 120)})`);
      }
    }

    // --- 3. Valid signed Response -----------------------------------------
    const validReqId = await freshLogin();
    const validXml = buildSignedResponse({ ...ids(), inResponseTo: validReqId });
    let mapped = null;
    try {
      const { profile } = await saml.validateSamlResponse(client, { SAMLResponse: b64(validXml) });
      const ok = profile.nameID === TEST_EMAIL && profile.issuer === IDP_ENTITY_ID
        && profile.email === TEST_EMAIL && Boolean(profile.sessionIndex);
      check('valid signed Response accepted', ok,
        `nameID=${profile.nameID} issuer=${profile.issuer} sessionIndex=${profile.sessionIndex}`);
      mapped = saml.mapProfileToUser(profile);
      check('profile maps to user', mapped.username === TEST_EMAIL && mapped.email === TEST_EMAIL
        && mapped.firstName === 'Test' && mapped.groups.includes('Operators'),
        `username=${mapped.username} groups=${mapped.groups.join(',')}`);
    } catch (err) {
      check('valid signed Response accepted', false, err && err.message);
    }

    // --- 4. Negative cases --------------------------------------------------
    // 4a. Tampered NameID after signing -> signature failure.
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId });
      const tampered = xml.replace(TEST_EMAIL, 'attacker@test.local');
      await expectReject('tampered NameID rejected (signature)', tampered, 'signature');
    }
    // 4b. Wrong audience (signed, so only the audience check can fail).
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId, audience: 'https://evil.local/sp' });
      await expectReject('wrong audience rejected', xml, 'audience');
    }
    // 4c. Wrong issuer (signed by the test key, but issuer is not the IdP).
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId, issuer: 'https://evil-idp.local/metadata' });
      await expectReject('wrong issuer rejected', xml, 'issuer');
    }
    // 4d. Expired assertion.
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({
        ...ids(), inResponseTo: reqId,
        notBefore: iso(-600000), notOnOrAfter: iso(-300000),
      });
      await expectReject('expired assertion rejected (time)', xml, 'time');
    }
    // 4e. Wrong recipient.
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId, recipient: 'https://evil.local/acs' });
      await expectReject('wrong recipient rejected', xml, 'recipient');
    }
    // 4e2. Wrong Destination (signed Response meant for another ACS).
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId, destination: 'https://evil.local/acs' });
      await expectReject('wrong Destination rejected', xml, 'destination');
    }
    // 4f. Unsigned Response.
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId, signAssertion: false, signResponse: false });
      await expectReject('unsigned Response rejected (signature)', xml, 'signature');
    }
    // 4g. Replay: the same valid Response submitted twice.
    {
      const reqId = await freshLogin();
      const xml = buildSignedResponse({ ...ids(), inResponseTo: reqId });
      const first = await saml.validateSamlResponse(client, { SAMLResponse: b64(xml) });
      check('replay case: first submission accepted', first.profile.nameID === TEST_EMAIL, '');
      await expectReject('replayed Response rejected', xml, null);
    }
    // 4h. No SAMLResponse at all.
    try {
      await saml.validateSamlResponse(client, {});
      check('empty ACS body rejected', false, 'accepted');
    } catch (err) {
      check('empty ACS body rejected', err && err.name === 'SamlValidationError', err && err.reason);
    }

    // --- 5. IdP metadata parse round-trip ----------------------------------
    const idpMetadataXml = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${IDP_ENTITY_ID}"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>${idpCertB64}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${IDP_SSO_URL}"/><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp-test.local/sso-post"/></md:IDPSSODescriptor></md:EntityDescriptor>`;
    const parsed = saml.parseIdpMetadata(idpMetadataXml);
    check('IdP metadata parses (entityID, Redirect SSO, signing cert)',
      parsed.idpEntityId === IDP_ENTITY_ID && parsed.idpSsoUrl === IDP_SSO_URL
      && parsed.idpSsoBinding === saml.HTTP_REDIRECT_BINDING && parsed.signingCerts.length === 1,
      `binding=${parsed.idpSsoBinding} certs=${parsed.signingCerts.length}`);
    check('IdP metadata cert matches generated IdP cert',
      parsed.signingCerts[0] && certBody(parsed.signingCerts[0]) === idpCertB64, '');

    // --- 6. JIT provisioning + session (real SQLite store) -----------------
    if (mapped) {
      const first = saml.provisionSamlUser(store, mapped, { jitProvisioning: true, defaultRole: 'Operator' });
      check('JIT provisioning creates user', first.created === true && first.user.username === TEST_EMAIL,
        `id=${first.user && first.user.id} role=${first.user && first.user.role}`);
      const storedUser = store.getUserByUsername(TEST_EMAIL);
      check('JIT user persisted in real store', Boolean(storedUser) && storedUser.role === 'Operator',
        `id=${storedUser && storedUser.id}`);
      const second = saml.provisionSamlUser(store, mapped, { jitProvisioning: true, defaultRole: 'Operator' });
      check('JIT provisioning is idempotent', second.created === false && second.user.id === first.user.id, '');
      const noJit = saml.provisionSamlUser(store, { username: 'ghost@test.local' }, { jitProvisioning: false });
      check('JIT off + unknown user => no user (never invents a login)', noJit.user === null && noJit.created === false, '');
      const sess = saml.createSamlSession(store, first.user);
      check('session minted (64-hex token, ~8h TTL)',
        /^[0-9a-f]{64}$/.test(sess.token) && sess.expiresAt - Date.now() > 7 * 60 * 60 * 1000,
        `expiresAt=${new Date(sess.expiresAt).toISOString()}`);
      const tokenHash = crypto.createHash('sha256').update(sess.token).digest('hex');
      const row = store.getSessionByTokenHash(tokenHash);
      check('session row stored (hash only)', Boolean(row) && row.user_id === first.user.id,
        `user_id=${row && row.user_id}`);
    } else {
      check('JIT provisioning creates user', false, 'no mapped profile — valid-response check failed above');
    }

    // --- Summary ------------------------------------------------------------
    console.log(`\nSAML self-test: ${results.filter((r) => r.ok).length}/${results.length} checks passed`);
    console.log(`SP cert fingerprint256:   ${spFingerprint}`);
    console.log(`IdP cert fingerprint256:  ${idpFingerprint}`);
    console.log('NOTE: all Responses above were self-issued by this script\'s throwaway test IdP,');
    console.log('not by a production IdP. Keys/certs are deleted with the temp dir.');
    return failures;
  })();
}

let code = 0;
try {
  const maybePromise = main();
  if (maybePromise && typeof maybePromise.then === 'function') {
    maybePromise.then((f) => { code = f ? 1 : 0; finish(); })
      .catch((err) => { console.error('SELF-TEST CRASH:', err); code = 1; finish(); });
  } else {
    finish();
  }
} catch (err) {
  console.error('SELF-TEST CRASH:', err);
  code = 1;
  finish();
}

function finish() {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* temp cleanup is best-effort */ }
  console.log(`Temp dir removed: ${tmp}`);
  process.exit(code);
}
