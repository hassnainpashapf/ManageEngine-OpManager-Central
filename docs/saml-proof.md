# SAML proof — run 2026-11-09 (Phase 4 merge, branch p4m-saml)

## What was proven

The full canonical SAML 2.0 SP code path (`server/services/saml.js` —
saml-service's strict @node-saml implementation — plus
`server/routes/saml.js` at `/api/auth/saml/*`) was proven end-to-end
against a **local test IdP only**. There is no production IdP yet — see
`docs/saml-setup.md` for the missing piece. This run supersedes the
Phase 3 saml-proof run: the retired hand-rolled xml-crypto service and
its `/saml/*` guard-bypass router are NOT what was proven here; the
canonical service is (302 ACS, reason-coded 401s, both signatures
required, IdP-initiated rejected, encrypted assertions supported).

- **Test IdP:** `scripts/saml-test-idp.js`. Keypair generated with
  openssl (never committed, kept at
  `~/workspace/opm-p4/m4-work/idp/`): RSA-2048, subject
  `CN=test-idp.local, O=Test IdP`. It builds real SAML Responses
  (Response + Assertion, enveloped RSA-SHA256 XML Signature with
  exclusive C14N, Conditions/Audience, bearer SubjectConfirmation,
  AttributeStatement) and signs **both** the Response and the
  Assertion with the openssl key.
- **Server:** this clone only, own throwaway DB, `PORT=8163`
  (`http://127.0.0.1:8163`). The shared `:8060` server and the relay
  were never touched.
- **Harness:** `node scripts/saml-proof.js --base http://127.0.0.1:8163
  --key ~/workspace/opm-p4/m4-work/idp/key.pem --cert ~/workspace/opm-p4/m4-work/idp/cert.pem`
  — re-runnable against a fresh DB (it rotates the bootstrap admin
  password to a random in-memory value, so a re-run needs a fresh
  `server/data` or `OPM_PROOF_ADMIN_PASSWORD`).
- **Run:** 2026-11-09T11:25:45Z (16:25 PKT). **All 16 checks passed.**
  Full machine-readable record:
  `~/workspace/opm-p4/m4-work/saml-proof-results.json`.

## Proof values

- SP entity ID: `http://127.0.0.1:8163/api/auth/saml/metadata`
- SP ACS URL: `http://127.0.0.1:8163/api/auth/saml/acs`
- Test IdP entity ID: `https://test-idp.local/metadata`
- Test IdP SSO URL: `https://test-idp.local/sso`
- Test NameID: `alice@example.test` (emailAddress format)
- Accepted Assertion ID: `_95c306e616c438a24167efcaf88619757d79dca284`
- SP-initiated AuthnRequest ID answered: `_e26d435481f3e7abef65a334d07a8f69fc7d6b8c`
- JIT-provisioned local user: `alice@example.test`, role `Operator`
  (verified via `GET /api/auth/session` with the SAML cookie).

## Results table

| # | Check | Result |
|---|---|---|
| 0 | Unauthenticated `GET /api/auth/session` is 401 | PASS — HTTP 401 |
| 1a | Bootstrap admin login succeeds | PASS — HTTP 200 |
| 1b | Bootstrap admin password rotated (must-change flag cleared) | PASS — HTTP 200 |
| 2a | `GET /api/auth/saml/metadata` before config is 501 | PASS — HTTP 501 `not_implemented` |
| 2b | SAML config saved (test IdP entity ID, SSO URL, certificate, JIT on) | PASS — HTTP 200 `{"status":"success", …}` |
| 2c | `GET /api/auth/saml/metadata` is 200 with this SP entity ID + ACS URL | PASS — HTTP 200 |
| 3 | `GET /api/auth/saml/login` 302s to IdP with a real AuthnRequest | PASS — 302 → `https://test-idp.local/sso`, AuthnRequest ID `_e26d4354…`, names SP entity ID |
| 4 | IdP-initiated Response (no InResponseTo) REJECTED | PASS — HTTP 401 `invalid_saml_response/inResponseTo`, no session cookie |
| 5a | Valid signed Response answering the pending AuthnRequest ID ACCEPTED | PASS — HTTP 302 `Location: /` + `opm_session` cookie |
| 5b | SAML session authenticates as `alice@example.test` / `Operator` | PASS — `GET /api/auth/session` with SAML cookie: HTTP 200, `alice@example.test/Operator` |
| 6 | Replay of the same Assertion (same IDs, fresh InResponseTo) REJECTED | PASS — HTTP 401 `invalid_saml_response/replay`, no session cookie |
| 7 | Tampered Response (NameID changed to `mallory@example.test` after signing) REJECTED | PASS — HTTP 401 `invalid_saml_response/signature`, no session cookie |
| 8 | Expired Response (signed correctly, window 20 min → 10 min ago) REJECTED | PASS — HTTP 401 `invalid_saml_response/time`, no session cookie |
| 9 | Wrong-audience Response (signed correctly, audience `https://wrong-consumer.example/sp`) REJECTED | PASS — HTTP 401 `invalid_saml_response/audience`, no session cookie |
| 10 | Wrong-recipient Response (signed correctly, Recipient `https://evil.local/acs`) REJECTED | PASS — HTTP 401 `invalid_saml_response/recipient`, no session cookie |
| 11 | Response answering an UNKNOWN request ID REJECTED | PASS — HTTP 401 `invalid_saml_response/inResponseTo`, no session cookie |

## Also proven live on this build (separate runs, same clone/port)

- **`scripts/test-saml.js`: 7/7 PASS** (2026-11-09) — tampered,
  expired, wrong audience, wrong recipient, unsigned, valid (session
  created for `saml-test-user@test-idp.local`), replay; ACS discovered
  only at `/api/auth/saml/acs`. Record:
  `~/workspace/opm-p4/m4-work/test-saml-results.json`. (One control
  note: the settings `/test` endpoint's `idpSsoReachable` check fails
  in that run because the test IdP host `test-idp.local` does not
  resolve in this sandbox — the fake host, not the code.)
- **Encrypted assertion ACCEPTED** (2026-11-09): an AES-256-CBC /
  RSA-OAEP-encrypted assertion (signed, then encrypted to the SP key,
  Response re-signed) was accepted — HTTP 302 + session for
  `alice@example.test` / `Operator` — with the SP key supplied via
  `SAML_SP_PRIVATE_KEY_FILE` / `SAML_SP_CERT_FILE` and the SP cert in
  settings. This proves the canonical "encrypted assertions supported"
  decision, which the retired proof service had the opposite way.
- **Metadata-URL-only config becomes login-ready** (2026-11-09):
  with only `idpMetadataUrl` + SP identity stored,
  `/api/auth/saml/status` reports `configured=true` (entity ID, SSO
  URL, 1 signing cert from the fetch) and login 302s; the settings
  `/test` endpoint persists the parsed `idpEntityId` / `idpSsoUrl` /
  `certificate` into the stored config. Same for metadata-XML-only.

## What this does NOT prove

- Nothing against a real IdP (Entra ID / Google Workspace / Okta) —
  none exists for this deployment yet. The test IdP speaks the real
  protocol (real XMLDSig, real SAML fields), but real IdPs differ in
  details (Assertion-only signing, different NameID formats, clock
  skew, attribute names). Note: this SP requires **both** Response and
  Assertion signatures by default and always requires InResponseTo —
  an IdP that signs only the assertion, or sends IdP-initiated
  Responses, will be rejected until an admin explicitly relaxes
  `wantAuthnResponseSigned` / `validateInResponseTo` in config.
- No Single Logout; AuthnRequests are unsigned unless an SP key/cert
  is supplied via `SAML_SP_PRIVATE_KEY_FILE` / `SAML_SP_CERT_FILE`.
