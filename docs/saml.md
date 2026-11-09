# SAML 2.0 Service Provider — OpManager Central

Service: `server/services/saml.js` (Phase 3, saml-service track —
canonical service kept by the Phase 4 merge, branch `p4m-saml`).
Routes: `server/routes/saml.js` at `/api/auth/saml/*` (saml-routes
router, repointed from `/api/saml/*` by the merge). Library:
`@node-saml/node-saml` **5.2.0** (maintained fork of
passport-saml core; `saml2-js` was evaluated and rejected as less
maintained). All XML parsing, canonicalisation and XML-DSig verification
is done by that library; this service never hand-rolls signature checks.
Proof: `node scripts/saml-selftest.js` — **33/33 checks pass** (see below).

## What is implemented (real, not a stub)

- Strict SP client (`createSamlClient` / `getSamlClient`): signed
  AuthnRequests, signed Response **and** signed Assertion required by
  default, audience == SP entity ID, issuer == configured IdP entity ID,
  time-window checks (NotBefore/NotOnOrAfter, assertion age ≤ 5 min,
  5-min clock skew), `InResponseTo` always validated, replayed
  assertions rejected.
- Two checks `@node-saml/node-saml` 5.2.0 only **warns** about are
  enforced here on the verified material: bearer SubjectConfirmation
  `Recipient` must be the ACS URL, and (when Responses must be signed)
  Response `Destination` must be the ACS URL. A wrong-Recipient Response
  was accepted by the library alone and is rejected by this service.
- SP metadata generation (`generateSpMetadata`) — signed when an SP key
  is configured.
- IdP metadata parsing (`parseIdpMetadata`) and TLS-verified fetching
  (`fetchIdpMetadata`, `loadIdpMetadata`).
- Profile mapping (`mapProfileToUser`), optional JIT provisioning
  (`provisionSamlUser`) and real session minting (`createSamlSession`)
  through `server/services/session.js` / the SQLite store.
- Status reporting (`getSamlStatus`) that never contains key material.
- Metadata-URL auto-fetch (`loadSamlConfigAsync`, Phase 4 merge): a
  config that only sets `idpMetadataUrl` is resolved at login/ACS/
  status time by fetching the IdP metadata (TLS-verified, cached
  10 minutes in-process) and filling entity ID, SSO URL and signing
  certificate from it — no hand-copied fields needed. A failed fetch
  is a config issue, not a crash. Stored settings are NOT rewritten
  here; persisting parsed metadata values is the settings `/test`
  endpoint's job (`server/routes/settings.js`, `persistedFromMetadata`).

## Canonical decisions (Phase 4 merge — decided, not open)

- **One service:** saml-service's `server/services/saml.js`. The
  saml-routes fork (same API, security hardening stripped) was
  deleted, and saml-proof's hand-rolled xml-crypto service plus its
  `/saml/*` guard-bypass router were retired, not merged.
- **ACS path:** `/api/auth/saml/acs` everywhere (routes, tests, docs,
  `spAcsUrl` default). The old `/api/saml/*` and `/saml/*` paths do
  not exist in this build.
- **IdP-initiated SSO is REJECTED.** `validateInResponseTo` is
  `'always'`: a Response with no `InResponseTo`, or one answering an
  unknown request ID, is 401 `inResponseTo`. The proof harness
  (`scripts/saml-proof.js`, check 4) proves the rejection live.
- **Encrypted assertions are SUPPORTED** via `decryptionPvk` (set
  when an SP certificate + private key are configured). Proven live
  against this build: an AES-256-CBC + RSA-OAEP encrypted assertion
  was accepted with a session (see Proof). The retired proof service
  rejected them; the canonical service does not.
- **Settings shape:** canonical `settings.saml` (store key `saml`)
  is the routes shape `{ idpEntityId, idpSsoUrl, spAcsUrl,
  jitProvisioning, defaultRole, certificate }` PLUS the SHARED.md
  fields `{ idpMetadataUrl, idpMetadataXml, spEntityId, spCert }`
  where present. `spKey` is env/file only, never stored.
- **Replay classification:** node-saml's `ReplayedAssertionError`
  ("has already been received") is classified as reason `replay`
  (the keyword classifier missed that message before the merge).
- **Shared-client fingerprint** covers SP-key presence, so adding or
  removing the SP private key rebuilds the client (decryptionPvk /
  request signing take effect without a restart).

## Wiring contract (for the saml-routes track)

```js
const saml = require('../services/saml');
// Login: GET /api/auth/saml/login
const client = saml.getSamlClient();            // process-wide shared client
const { url } = await saml.getLoginUrl(client, relayState);
res.redirect(url);
// ACS: POST /api/auth/saml/acs  (form body: SAMLResponse, RelayState)
const { profile } = await saml.validateSamlResponse(client, req.body);
const mapped = saml.mapProfileToUser(profile);
const { user, created } = saml.provisionSamlUser(store, mapped,
  { jitProvisioning: cfg.jitProvisioning, defaultRole: cfg.defaultRole });
if (!user) return res.status(403).json({ error: 'saml_user_not_provisioned' });
const { token, expiresAt } = saml.createSamlSession(store, user);
// set HttpOnly cookie `opm_session` = token, then redirect to RelayState.
// Metadata: GET /api/auth/saml/metadata
res.type('application/xml').send(saml.generateSpMetadata());
```

Rules the routes must obey:

- Use the **shared client** (`getSamlClient()`) for both login and ACS:
  the AuthnRequest ID lives in its in-memory cache and the ACS step
  consumes it. A fresh client per request breaks `InResponseTo`.
- `validateSamlResponse` throws `SamlValidationError` (`err.reason`:
  `signature|audience|issuer|recipient|destination|time|replay|
  inResponseTo|status|other`). Map it to 401/403 — never to a login.
- Validate `RelayState` before redirecting (opaque return-to path).
- JIT-created users get a random, unusable local password; SSO is their
  only login path. With JIT off, an unknown SAML user gets **no** login
  (403), never an invented account.
- The in-memory replay/request cache is single-process. A multi-process
  deployment must pass a shared `CacheProvider` to `createSamlClient`.

## Configuration

Merged: explicit object > store settings `auth.saml` (existing
settings.js shape) and `saml` (canonical Phase 3 shape) > env vars.

| Setting | Source |
|---|---|
| `spEntityId` | store / `SAML_SP_ENTITY_ID` |
| `spAcsUrl` (ACS URL) | store / `SAML_SP_ACS_URL` |
| `idpEntityId` | store / IdP metadata / `SAML_IDP_ENTITY_ID` |
| `idpSsoUrl` | store / IdP metadata / `SAML_IDP_SSO_URL` |
| `idpCert` (signing cert PEM) | store `auth.saml.certificate` / IdP metadata / `SAML_IDP_CERT` or `SAML_IDP_CERT_FILE` |
| `idpMetadataUrl` | store / `SAML_IDP_METADATA_URL` |
| `spCert` (SP public cert PEM) | store `saml.spCert` / `SAML_SP_CERT` or `SAML_SP_CERT_FILE` |
| `spPrivateKey` | **env/file ONLY**: `SAML_SP_PRIVATE_KEY` or `SAML_SP_PRIVATE_KEY_FILE` |
| `jitProvisioning`, `defaultRole` | store (`auth.saml`) |

**SP private key rule:** it is never read from the settings store, never
committed, never written to disk by this service and never logged. A
`spKey` value in the store is deliberately ignored. `getSamlStatus()`
reports only "configured / matches cert", never the key.

Strictness defaults (overridable in config, explicitly, by an admin):
`wantAssertionsSigned=true`, `wantAuthnResponseSigned=true`. If an IdP
signs only the assertion, set `wantAuthnResponseSigned=false` — do not
expect the service to relax silently.

## Proof (self-test + live, no production IdP exists yet)

`node scripts/saml-selftest.js` builds a throwaway test IdP: openssl
generates fresh SP + IdP keys/certs in a temp dir, `xml-crypto` signs
real SAML Responses with the test IdP key. All Responses are
**self-issued for testing** — they prove the SP validates correctly,
not that any production IdP works. Keys/certs are deleted with the temp
dir; only fingerprints are printed. **33/33 checks pass**, including:

- valid doubly-signed Response accepted; profile maps to
  `saml.user@test.local`, JIT user created in the real SQLite store,
  real session minted (SHA-256 token hash stored);
- rejected: tampered NameID (signature), wrong audience, wrong issuer,
  expired assertion (time), wrong Recipient, wrong Destination,
  unsigned Response, replayed Response, empty ACS body.

Live proof against the merged build (port 8163, throwaway DB —
`docs/saml-proof.md`, `scripts/saml-proof.js`):

- **16/16 checks passed** (2026-11-09): metadata 501→200, login 302
  with a real AuthnRequest, IdP-initiated Response rejected
  (`inResponseTo`), valid SP-initiated Response accepted (302 +
  `opm_session`, session proves `alice@example.test` / Operator),
  replay (`replay`), tampered (`signature`), expired (`time`), wrong
  audience (`audience`), wrong recipient (`recipient`), unknown
  request ID (`inResponseTo`).
- **Negative/edge suite `scripts/test-saml.js`: 7/7 PASS** — tampered,
  expired, wrong audience, wrong recipient, unsigned, valid (session
  created for `saml-test-user@test-idp.local`), replay; ACS discovered
  only at `/api/auth/saml/acs`.
- **Encrypted assertion accepted live**: an AES-256-CBC /
  RSA-OAEP-encrypted assertion (signed, then encrypted to the SP key)
  was accepted with a session for `alice@example.test` / Operator.
- **Metadata-URL-only config becomes login-ready**: with only
  `idpMetadataUrl` + SP identity stored, `/api/auth/saml/status`
  reports `configured=true` (entity ID, SSO URL, 1 signing cert from
  the fetch) and login 302s; `/api/settings/auth/saml/test` persists
  the parsed `idpEntityId` / `idpSsoUrl` / `certificate` into the
  stored config (`persistedFromMetadata`). Same for metadata-XML-only.

## Exact IdP configuration still needed (user must supply)

No IdP exists in this deployment yet. To go live, the user must provide:

1. **The IdP itself** — e.g. Microsoft Entra ID (Azure AD), Okta,
   Keycloak, or ADFS — with a SAML 2.0 application created for
   OpManager Central.
2. **IdP metadata** — either the metadata URL
   (`SAML_IDP_METADATA_URL` / `settings.saml.idpMetadataUrl`) or the
   metadata XML file. From it the service takes the IdP entity ID, the
   SSO URL and the signing certificate. (Alternatively supply
   `idpEntityId` + `idpSsoUrl` + `idpCert` PEM directly.)
3. **SP registration at the IdP** — register the SP metadata from
   `GET /api/auth/saml/metadata` (wired in this merge):
   SP entity ID, ACS URL, and the SP signing certificate. The IdP must
   be told to send the user's **email** (attribute `email` or OID
   `urn:oid:0.9.2342.19200300.100.1.3`) and, ideally, `givenName`,
   `sn`, `groups`.
4. **SP key pair** — generate an RSA key + self-signed (or CA) cert for
   the SP, put the cert in config and the private key in
   `SAML_SP_PRIVATE_KEY_FILE` (a file only the server process can read).
   Without a key, AuthnRequests go unsigned and metadata is unsigned.
5. **Decisions**: enable SAML (`enabled: true`), JIT provisioning on or
   off, and the default role for JIT users (default `Operator`).
6. **ACS URL must be the public URL** of this server (e.g.
   `https://opm.example.com/api/auth/saml/acs`) — the IdP posts the
   Response there, and Recipient/Destination must match it exactly.
