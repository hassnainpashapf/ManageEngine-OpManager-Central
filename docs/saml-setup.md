# SAML 2.0 Single Sign-On — setup guide

> **Status: no production IdP exists yet.**
> The SAML code path is fully implemented and proven end-to-end against a
> local test IdP only (a keypair generated with `openssl`, see
> `docs/saml-proof.md`). Nobody can log in with SAML in production until
> the user supplies a real Identity Provider. Everything below is what
> that IdP must be configured with, and what the user must hand over.

## 1. What this SP is

- Protocol: SAML 2.0 Web Browser SSO, HTTP-POST binding.
- Endpoints (replace `<public-host>` with the real public host the
  console is reached at — the values must match the deployed URL exactly,
  including `https://`):
  - **SP entity ID:** `https://<public-host>/api/auth/saml/metadata`
  - **Assertion Consumer Service (ACS) URL:** `https://<public-host>/api/auth/saml/acs`
  - **SP metadata:** `https://<public-host>/api/auth/saml/metadata`
    (served live by the app once SAML is configured; give this URL to
    the IdP admin, or hand them the two values above).
- SP-initiated login: `https://<public-host>/api/auth/saml/login`
  (builds a real AuthnRequest and redirects to the IdP SSO URL).
  IdP-initiated login (IdP posts straight to the ACS) is **REJECTED**
  by canonical decision (`validateInResponseTo: 'always'`) — every
  login must start at the SP login URL above.
- NameID format required: **email address**
  (`urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`). The NameID
  becomes the local username, so it must be the user's work email and
  must be stable — if the IdP changes a user's NameID, they get a new
  local account.
- Signature: the Response **and** the Assertion must both be signed
  with **RSA-SHA256** (RSA-SHA512 also accepted) by default. The
  signature is verified against the IdP certificate configured below —
  never against a certificate embedded in the Response. (An IdP that
  signs only the assertion needs an admin to set
  `wantAuthnResponseSigned=false` explicitly; the service never relaxes
  this silently.)
- Conditions enforced: Audience must be this SP entity ID; Conditions
  NotBefore/NotOnOrAfter window (5-minute clock skew allowed);
  bearer SubjectConfirmation Recipient must be the ACS URL; Assertion
  IDs are single-use (replay rejected); SP-initiated Responses must
  answer a pending AuthnRequest ID.
- Encrypted assertions are **supported**: when an SP certificate +
  private key are configured (`spCert` in settings,
  `SAML_SP_PRIVATE_KEY_FILE` / `SAML_SP_CERT_FILE` for the key), the
  SP decrypts assertions encrypted to its public key (proven live —
  see `docs/saml-proof.md`). Without an SP key, an encrypted assertion
  cannot be decrypted and is rejected.
- No Single Logout (SLO) yet. Logging out of the console does not log
  the user out of the IdP.

## 2. Exact values the user must supply

Enter these in **Settings → Authentication → SAML** (or
`POST /api/settings/auth/saml` as an admin). All three IdP values are
required, plus the enable flag:

| Field (Settings UI / API) | What it is | Example |
|---|---|---|
| `idpEntityId` | IdP entity ID (Issuer) from the IdP's SAML setup screen | `https://sts.windows.net/<tenant-id>/` (Entra) |
| `idpSsoUrl` | IdP Single Sign-On URL (the login endpoint) | `https://login.microsoftonline.com/<tenant-id>/saml2` (Entra) |
| `certificate` | IdP token-signing certificate, PEM (or Base64 body) | `-----BEGIN CERTIFICATE----- …` |
| `enabled` | `true` — SAML stays off until this is set | `true` |
| `jitProvisioning` | `true` (recommended): first SAML login auto-creates the local account. `false` means only pre-created local accounts can use SSO | `true` |
| `defaultRole` | Role given to JIT-provisioned accounts | `Operator` |
| `spEntityId` | This SP's entity ID — set to the public-host value in §1 | `https://<public-host>/api/auth/saml/metadata` |
| `spAcsUrl` | This SP's ACS URL — set to the public-host value in §1 | `https://<public-host>/api/auth/saml/acs` |
| `spCert` | This SP's public certificate (PEM) — needed for encrypted assertions and signed metadata | `-----BEGIN CERTIFICATE----- …` |

**Easier alternative — IdP metadata:** instead of the three fields
above, supply the IdP metadata **URL** (`idpMetadataUrl`) or paste the
metadata **XML** (`idpMetadataXml`). The server parses entity ID, SSO
URL and signing certificate out of it. Every IdP below offers a
"download metadata / federation metadata XML" link — that file (or its
URL) is the single thing to hand over if you do not want to copy three
fields by hand.

### Attributes the IdP must release

| SAML attribute | Meaning | Required? |
|---|---|---|
| `email` | User's email (falls back to NameID when NameID is an email) | Recommended |
| `givenName` | First name | Optional |
| `surname` | Last name | Optional |
| `role` | Local role, if the IdP should decide it. Only `admin`, `SuperAdmin` or `Operator` are honoured; anything else falls back to `defaultRole` | Optional |

JIT-provisioned accounts get a random password nobody knows, so they
can only ever log in via SSO — password login for those accounts is
effectively disabled unless an admin sets a password for them.

## 3. Steps in the IdP of choice

Do the steps for **one** IdP only. In every case, paste the §1 values
(entity ID + ACS URL) into the IdP, then bring the IdP's entity ID,
SSO URL and certificate back into §2.

### Microsoft Entra ID (Azure AD)

1. Entra admin center → **Enterprise applications** → **New application**
   → **Create your own application**, name it e.g. `OpManager Central`,
   choose **Integrate any other application you don't find in the gallery**.
2. **Single sign-on** → **SAML**.
3. **Basic SAML Configuration** → Edit:
   - **Identifier (Entity ID):** `https://<public-host>/api/auth/saml/metadata`
   - **Reply URL (Assertion Consumer Service URL):** `https://<public-host>/api/auth/saml/acs`
4. **Attributes & Claims** → Edit: **Name identifier value** must be
   `user.mail` (or `user.userprincipalname` if mail is empty) with
   **Name identifier format: Email address**. Add claims `email`
   (`user.mail`), `givenName` (`user.givenname`), `surname`
   (`user.surname`) if wanted.
5. **SAML Certificates** → download **Federation Metadata XML** (or
   copy **Login URL**, **Microsoft Entra Identifier** and download
   **Certificate (Base64)**). Hand over the metadata file/URL, or the
   three §2 values.
6. **Users and groups** → assign the users/groups allowed to use SSO.

### Google Workspace

1. Admin console → **Apps** → **Web and mobile apps** → **Add app** →
   **Add custom SAML app**. Name it e.g. `OpManager Central`.
2. **Google Identity Provider details** → **Download Metadata** (this
   file is the §2 hand-over: it contains the SSO URL, entity ID and
   certificate). Keep this window open for step 4.
3. **Service provider details:**
   - **ACS URL:** `https://<public-host>/api/auth/saml/acs`
   - **Entity ID:** `https://<public-host>/api/auth/saml/metadata`
   - **Name ID format:** `EMAIL`, **Name ID:** `Primary email`.
4. **Attribute mapping:** `Primary email` → `email`,
   `First name` → `givenName`, `Last name` → `surname`.
5. **Finish**, then **User access** → turn the app **ON** for the
   people/groups who may use SSO.

### Okta

1. Admin Console → **Applications** → **Create App Integration** →
   **SAML 2.0** → name it e.g. `OpManager Central`.
2. **Configure SAML:**
   - **Single sign-on URL:** `https://<public-host>/api/auth/saml/acs`
     (check **Use this for Recipient URL and Destination URL**).
   - **Audience URI (SP Entity ID):** `https://<public-host>/api/auth/saml/metadata`
   - **Name ID format:** `EmailAddress`; **Application username:** `Okta username` (or `Email`).
   - **Attribute Statements:** `email` → `user.email`,
     `givenName` → `user.firstName`, `surname` → `user.lastName`.
3. **Finish**, then open the app → **Sign On** → **View SAML setup
   instructions**: copy **Identity Provider Single Sign-On URL**,
   **Identity Provider Issuer** and the **X.509 Certificate**. Those
   are the three §2 values.

### Any other SAML 2.0 IdP

Any IdP that can act as a SAML 2.0 identity provider works if it can
be told: entity ID + ACS URL (§1), NameID format emailAddress, and it
can export its entity ID, SSO URL and signing certificate (or its
metadata XML/URL). If the IdP only sends encrypted assertions or only
supports a different NameID format, that is a gap to report — the SP
does not support those yet.

## 4. Turning it on (once the IdP values arrive)

1. Paste the IdP values into **Settings → Authentication → SAML** and
   set **Enabled** on (or `POST /api/settings/auth/saml`).
2. Sanity-check the SP side: open `https://<public-host>/api/auth/saml/metadata`
   — it must show this SP's entity ID and ACS URL.
3. Test: open `https://<public-host>/api/auth/saml/login` in a browser. It must
   redirect to the IdP login; after signing in there, the browser must
   land back on the console, logged in as the IdP user.
4. If it fails, the ACS answers with an exact error reason — see §5.
   The failing case is also written to the audit log
   (`auth.saml.login.failed` with the reason).

## 5. Error reasons (exact, from the ACS)

ACS failures are HTTP 401 JSON
`{ "status": "error", "error": "invalid_saml_response", "reason": "<reason>" }`
(except where noted). `reason` is one of:

| HTTP | Reason / error | Meaning |
|---|---|---|
| 501 | `not_implemented` | SAML not configured / not login-ready (missing fields listed in `issues`) |
| 400 | `missing_saml_response` | Nothing posted to the ACS |
| 401 | `signature` | No signature, or the signature does not verify (includes a Response tampered with after signing, and unsigned Responses) |
| 401 | `audience` | Audience does not include this SP entity ID |
| 401 | `issuer` | Issuer is not the configured IdP entity ID |
| 401 | `recipient` | SubjectConfirmation Recipient is not this ACS URL (bearer-Recipient enforcement) |
| 401 | `destination` | Signed Response Destination is not this ACS URL |
| 401 | `time` | Conditions / SubjectConfirmation window has passed, or the assertion is too old |
| 401 | `inResponseTo` | Response has no InResponseTo, or answers an unknown / expired / already-used AuthnRequest (IdP-initiated SSO is rejected) |
| 401 | `replay` | This Assertion ID has already been used |
| 401 | `status` | IdP itself returned a non-Success status (e.g. user not assigned to the app) |
| 403 | `saml_user_not_provisioned` | NameID has no local account and JIT provisioning is off |
| 401 | `other` | Validation failed for another reason (message names it) |

## 6. What is still missing — the precise ask for the user

1. **Choose the IdP** — Entra ID, Google Workspace, Okta, or another?
2. **Supply the IdP side** — the metadata URL or XML file is enough; otherwise the three values: IdP entity ID, IdP SSO URL, IdP signing certificate (PEM/Base64).
3. **Confirm the public host** the console is reached at, so the SP entity ID and ACS URL in §1 are exact (they must match what is entered in the IdP character for character).
4. **Confirm the NameID is the work email** and whether the attribute names in §2 differ in your IdP.
5. **Confirm JIT provisioning is OK** (new local accounts auto-created on first SSO login, default role `Operator`) or say that accounts must be pre-created instead.
6. **SP key pair (only if encrypted assertions or signed AuthnRequests are wanted):** generate an RSA key + self-signed (or CA) certificate for the SP, put the certificate in `spCert` (settings) and the private key in `SAML_SP_PRIVATE_KEY_FILE` (a file only the server process can read). Without a key, AuthnRequests go unsigned, metadata is unsigned, and encrypted assertions cannot be decrypted.

Until those five answers arrive, SAML login cannot be tested against a
real IdP. The code path itself is proven — see `docs/saml-proof.md`.
