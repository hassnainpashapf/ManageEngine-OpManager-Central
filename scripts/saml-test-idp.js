'use strict';
/**
 * Local TEST IdP for SAML proof only — NOT a production IdP.
 *
 * Generates real, signed SAML 2.0 Responses with the exact structure a
 * production IdP sends (Response + Assertion, enveloped RSA-SHA256 XML
 * Signature with exclusive C14N, Conditions/Audience, bearer
 * SubjectConfirmation, AttributeStatement), using a keypair created with
 * openssl. There is no production IdP for this deployment yet; this
 * script is the stand-in that lets the SP verification code be proven
 * end-to-end (see docs/saml-setup.md and scripts/saml-proof.js).
 *
 * The private key is NEVER committed and NEVER written here: it is read
 * at runtime from --key / SAML_TEST_IDP_KEY (PEM file, e.g. /tmp). The
 * certificate (--cert / SAML_TEST_IDP_CERT) is the public half the SP is
 * configured to trust; it is embedded in KeyInfo like a real IdP does.
 *
 * Usage:
 *   node scripts/saml-test-idp.js --case valid|tampered|expired|wrong-audience \
 *     --key /tmp/saml-test-idp/key.pem --cert /tmp/saml-test-idp/cert.pem \
 *     [--nameid alice@example.test] [--audience <sp-entity-id>]
 *     [--issuer https://test-idp.local/metadata] [--acs http://127.0.0.1:8163/api/auth/saml/acs]
 *
 * The canonical SP (server/services/saml.js) requires BOTH the Response
 * and the Assertion to be signed by default (wantAuthnResponseSigned and
 * wantAssertionsSigned), so this builder signs both: the Assertion first,
 * then the Response over the already-signed Assertion. Options
 * signAssertion/signResponse (default true) let a caller build the
 * unsigned variants the negative tests need.
 *
 * Prints the base64-encoded SAMLResponse to stdout (nothing else).
 * As a module it exports buildSamlResponse(options) -> { base64, xml,
 * responseId, assertionId }.
 */

const fs = require('node:fs');
const crypto = require('node:crypto');
const { SignedXml } = require('xml-crypto');

const RSA_SHA256 = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
const EXC_C14N = 'http://www.w3.org/2001/10/xml-exc-c14n#';
const ENVELOPED = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';
const SHA256_DIGEST = 'http://www.w3.org/2001/04/xmlenc#sha256';

function iso(date) {
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function randomId() {
  return `_${crypto.randomBytes(21).toString('hex')}`;
}

/**
 * Build and sign a SAML Response.
 * options: { keyPem, certPem, nameId, nameIdFormat, issuer, audience,
 *   acsUrl, destination, issueInstant, notBefore, notOnOrAfter,
 *   attributes, responseId, assertionId, tamperNameId, inResponseTo,
 *   signAssertion, signResponse }
 * inResponseTo, when set, is the SP-initiated AuthnRequest ID the
 * Response answers (set on the Response and on SubjectConfirmationData).
 * Times are Date objects (defaults: window now-5m .. now+5m).
 */
function buildSamlResponse(options) {
  const opts = options || {};
  if (!opts.keyPem) throw new Error('buildSamlResponse: keyPem is required (test IdP private key, runtime only)');
  if (!opts.certPem) throw new Error('buildSamlResponse: certPem is required (test IdP certificate)');
  const now = opts.now ? new Date(opts.now) : new Date();
  const issueInstant = iso(opts.issueInstant || now);
  const notBefore = iso(opts.notBefore || new Date(now.getTime() - 5 * 60 * 1000));
  const notOnOrAfter = iso(opts.notOnOrAfter || new Date(now.getTime() + 5 * 60 * 1000));
  const nameId = opts.nameId || 'alice@example.test';
  const nameIdFormat = opts.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';
  const issuer = opts.issuer || 'https://test-idp.local/metadata';
  const audience = opts.audience || 'http://127.0.0.1:8163/api/auth/saml/metadata';
  const acsUrl = opts.acsUrl || 'http://127.0.0.1:8163/api/auth/saml/acs';
  const destination = opts.destination || acsUrl;
  const responseId = opts.responseId || randomId();
  const assertionId = opts.assertionId || randomId();
  const attributes = opts.attributes || {
    email: 'alice@example.test',
    givenName: 'Alice',
    surname: 'Test',
  };
  const attributeXml = Object.entries(attributes)
    .map(([name, value]) => `        <saml:Attribute Name="${escapeXml(name)}"><saml:AttributeValue>${escapeXml(value)}</saml:AttributeValue></saml:Attribute>`)
    .join('\n');

  const inResponseToAttr = opts.inResponseTo ? ` InResponseTo="${escapeXml(opts.inResponseTo)}"` : '';
  const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${responseId}" Version="2.0" IssueInstant="${issueInstant}" Destination="${escapeXml(destination)}"${inResponseToAttr}><saml:Issuer>${escapeXml(issuer)}</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${assertionId}" Version="2.0" IssueInstant="${issueInstant}"><saml:Issuer>${escapeXml(issuer)}</saml:Issuer><saml:Subject><saml:NameID Format="${escapeXml(nameIdFormat)}">${escapeXml(nameId)}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${escapeXml(acsUrl)}"${inResponseToAttr}/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}"><saml:AudienceRestriction><saml:Audience>${escapeXml(audience)}</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AuthnStatement AuthnInstant="${issueInstant}" SessionIndex="${assertionId}"><saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement><saml:AttributeStatement>\n${attributeXml}\n      </saml:AttributeStatement></saml:Assertion></samlp:Response>`;

  function signXml(inputXml, xpath, locationRef) {
    const sig = new SignedXml({
      privateKey: opts.keyPem,
      publicCert: opts.certPem,
      signatureAlgorithm: RSA_SHA256,
      canonicalizationAlgorithm: EXC_C14N,
    });
    sig.addReference({
      xpath,
      digestAlgorithm: SHA256_DIGEST,
      transforms: [ENVELOPED, EXC_C14N],
    });
    sig.computeSignature(inputXml, {
      prefix: 'ds',
      location: { reference: locationRef, action: 'after' },
    });
    return sig.getSignedXml();
  }
  // Sign the Assertion first, then the Response over it — the canonical
  // SP requires both signatures (see header). An unsigned variant is
  // only built when the caller asks for it (negative tests).
  let signedXml = xml;
  if (opts.signAssertion !== false) {
    signedXml = signXml(signedXml, "//*[local-name(.)='Assertion']",
      "//*[local-name(.)='Assertion']/*[local-name(.)='Issuer']");
  }
  if (opts.signResponse !== false) {
    signedXml = signXml(signedXml, "//*[local-name(.)='Response']",
      "/*[local-name(.)='Response']/*[local-name(.)='Issuer']");
  }

  // Tamper AFTER signing: change the NameID text so the signature no
  // longer matches the content. This is the tamper case — a Response
  // re-signed after the change would be a different (legitimate) Response.
  if (opts.tamperNameId) {
    const needle = `>${escapeXml(nameId)}</saml:NameID>`;
    if (!signedXml.includes(needle)) throw new Error('tamper failed: NameID not found in signed XML');
    signedXml = signedXml.replace(needle, `>${escapeXml(opts.tamperNameId)}</saml:NameID>`);
  }

  return {
    base64: Buffer.from(signedXml, 'utf8').toString('base64'),
    xml: signedXml,
    responseId,
    assertionId,
  };
}

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

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const keyPath = args.key || process.env.SAML_TEST_IDP_KEY;
  const certPath = args.cert || process.env.SAML_TEST_IDP_CERT;
  if (!keyPath || !certPath) {
    console.error('Usage: node scripts/saml-test-idp.js --case valid|tampered|expired|wrong-audience --key <idp-key.pem> --cert <idp-cert.pem> [--nameid <name>] [--audience <sp-entity-id>] [--issuer <idp-entity-id>] [--acs <acs-url>]');
    console.error('The test IdP keypair is created with openssl and passed at runtime; it is never committed.');
    process.exit(2);
  }
  const keyPem = fs.readFileSync(keyPath, 'utf8');
  const certPem = fs.readFileSync(certPath, 'utf8');
  const now = new Date();
  const base = {
    keyPem,
    certPem,
    nameId: args.nameid || 'alice@example.test',
    audience: args.audience || 'http://127.0.0.1:8163/api/auth/saml/metadata',
    issuer: args.issuer || 'https://test-idp.local/metadata',
    acsUrl: args.acs || 'http://127.0.0.1:8163/api/auth/saml/acs',
  };
  const testCase = args.case || 'valid';
  let result;
  if (testCase === 'valid') {
    result = buildSamlResponse(base);
  } else if (testCase === 'tampered') {
    result = buildSamlResponse({ ...base, tamperNameId: 'mallory@example.test' });
  } else if (testCase === 'expired') {
    result = buildSamlResponse({
      ...base,
      notBefore: new Date(now.getTime() - 20 * 60 * 1000),
      notOnOrAfter: new Date(now.getTime() - 10 * 60 * 1000),
    });
  } else if (testCase === 'wrong-audience') {
    result = buildSamlResponse({ ...base, audience: 'https://wrong-consumer.example/sp' });
  } else {
    console.error(`Unknown case: ${testCase} (expected valid|tampered|expired|wrong-audience)`);
    process.exit(2);
  }
  process.stdout.write(result.base64);
}

module.exports = { buildSamlResponse };
