# WinRM client — `server/services/winrm.js`

A real WinRM (WS-Management) client: WS-Management SOAP 1.2 over HTTP(S)
plus NTLMv2 authentication. No fake data, no canned responses, no
credentials stored anywhere.

## Files

| File | What it is |
|---|---|
| `server/services/winrm.js` | The client: SOAP envelopes, NTLM HTTP transport, shell lifecycle, WQL enumeration. |
| `server/services/ntlm.js` | NTLMv2 (MS-NLMP) + a vendored pure-JS MD4 (RFC 1320). |
| `scripts/winrm-selftest.js` | Validation: crypto vectors, message structure, SOAP round-trips, end-to-end against an in-process mock WinRM server. Run `node scripts/winrm-selftest.js` — exit 0 = 52 checks pass. |
| `docs/winrm.md` | This file. |

## API

```js
const { runShellCommand, runWql, WinRMError } = require('./server/services/winrm');

const out = await runShellCommand('192.168.22.10', {
  username: 'GAMEVILLAGE\\hasnain',   // or 'hasnain@gamevillage.com.pk', or bare 'hasnain' + domain
  password: process.env.WINRM_PASS,    // call-time only, never stored or logged
  command: 'whoami /all',
  timeoutMs: 60000,                    // default 60000
  // port: 5985, transport: 'http',    // defaults; https -> 5986
  // domain: 'GAMEVILLAGE', workstation: 'opmanager',
  // workingDirectory: 'C:\\Temp', rejectUnauthorized: true,
});
// -> { host, transport, port, command, stdout, stderr, exitCode,
//      commandId, shellId, durationMs }

const res = await runWql('192.168.22.10', {
  username: 'GAMEVILLAGE\\hasnain',
  password: process.env.WINRM_PASS,
  namespace: 'root/cimv2',            // default
  query: 'SELECT Caption, Version FROM Win32_OperatingSystem',
  maxResults: 1000,                    // default
});
// -> { host, namespace, query, results: [{ __class, Caption, Version, ... }], count }
```

Notes:

- The command string is executed as `cmd.exe /c <command>`: WinRM's
  `CommandLine` takes a program plus separate arguments, so a raw command
  line is handed to `cmd.exe` exactly as written.
- WQL results are CIM instances flattened to plain objects
  (`{ __class: 'Win32_OperatingSystem', Caption, Version, ... }`).
  Property values are strings (XML is parsed without value coercion);
  `xsi:nil` properties become `null`. Empty `<wsen:Items/>` produces no
  phantom rows.
- `settings.winrm` (per `SHARED.md`: `{ defaultPort: 5985, transport:
  'http'|'https' }`) is the settings shape the route layer should pass
  through as `port`/`transport` options. This service itself stores
  nothing — credentials are call-time arguments only.
- HTTPS defaults to `rejectUnauthorized: true`. Pass
  `rejectUnauthorized: false` only for a host with a self-signed cert
  you have explicitly accepted; it is never the default.
- Route (Phase 4 merge, p4m-winrm): `POST /api/tools/wmi-query` in
  `server/routes/tools.js` is wired to this client (the Phase 3
  winrm-route handler, adapted to this client's `{ results, count }`
  shape and UPPER_SNAKE codes).

## Errors (all `WinRMError`, `err.code` + `err.httpStatus`)

| Code | `httpStatus` | Meaning |
|---|---|---|
| `AUTH_FAILED` | 502 | Server returned 401 after the NTLM Type 3 message or the Basic exchange (wrong username/password/domain), never offered NTLM or Basic, or offered Basic only over plain HTTP without `allowUnencrypted`. |
| `UNREACHABLE` | 502 | TCP/DNS failure (`ECONNREFUSED`, `ENOTFOUND`, `EHOSTUNREACH`, …). |
| `TIMEOUT` | 502 | No answer within `timeoutMs`. The remote command is signalled to terminate first. |
| `PROTOCOL` | 502 | Non-2xx answer, SOAP Fault (fault text included), or a malformed reply. |
| `INVALID_ARGUMENT` | 400 | Missing/empty host, username, password, command or query — thrown before any network I/O. |

Error messages never contain the password (or any credential).

## Protocol details

- Endpoint: `POST http(s)://host:port/wsman` (default ports 5985/5986).
- Shell flow ([MS-WSMV]): `transfer/Create` on
  `.../windows/shell/cmd` → `shell/Command` → `shell/Receive` polled
  until `CommandState` is `.../CommandState/Done` (base64 streams are
  concatenated across Receives) → `transfer/Delete` in a `finally`.
  On timeout a `shell/Signal` terminate is sent before throwing.
- WQL flow: `enumeration/Enumerate` with
  `wsman:Filter Dialect=".../WQL"` on
  `.../wmi/<namespace>/*`, then `enumeration/Pull` until
  `EndOfSequence` (or `maxResults`).
- Envelopes carry `a:To`, `a:ReplyTo`, `a:Action`, `a:MessageID`
  (`urn:uuid:`), `wsman:MaxEnvelopeSize` (153600), `wsman:Locale en-US`,
  `wsman:OperationTimeout`, `wsman:ResourceURI`, and a `ShellId`
  selector set where applicable.
- NTLM ([MS-NLMP]): anonymous POST → 401 → Type 1 → 401 + Type 2
  challenge → Type 3 → 200. All three requests of one handshake run
  on a single keep-alive connection (NTLM is connection-oriented);
  each SOAP call gets its own connection/agent, which is destroyed
  afterwards. **NTLMv2 only** — see below.
- Basic fallback (Phase 4 merge, ported from the winrm-route fork):
  when a server offers ONLY Basic authentication, the credentials are
  sent as a Basic `Authorization` header — but ONLY over HTTPS
  (`transport: 'https'` / `useHttps: true`), or over plain HTTP when
  the caller explicitly passes `allowUnencrypted: true`. Basic over
  plain HTTP without that opt-in is refused with `AUTH_FAILED` before
  anything is sent. NTLM is always preferred when offered. Proven by
  `node scripts/winrm-basic-proof.js` (Basic-only listeners, HTTP +
  HTTPS).

## Why NTLMv2 only, and why MD4 is vendored

Node 24 ships OpenSSL 3, where MD4 and DES are unavailable
(`crypto.createHash('md4')` throws `digital envelope
routines::unsupported`; verified on this VM 2026-11-09). NTLMv1/LM
responses need DES, so they are deliberately not implemented.
NTLMv2 needs only MD4 (for the NT hash) and HMAC-MD5 (available), so
`ntlm.js` vendors a pure-JavaScript MD4 (RFC 1320) and builds NTLMv2
on Node's built-in HMAC-MD5. NTLMv2 is also what modern Windows
servers negotiate. A server that only accepts NTLMv1/LM will fail
with `AUTH_FAILED` — that is an honest failure, not a silent fallback.

## Basic fallback (Phase 4 merge)

The winrm-route fork had a Basic-over-HTTPS fallback that this client
lacked; the merge ported it here and deleted the fork. `useHttps`
(selects https, default port 5986) and `transport` (`'http'|'https'`,
wins when given) are both accepted by `runWql` / `runShellCommand`.
Basic is attempted only when the server's 401 offers Basic and offers
no NTLM; a 401 after Basic is `AUTH_FAILED`, exactly like a 401 after
the NTLM Type 3. No signing/sealing is negotiated for either scheme
(same limitation as before).

## Validation method (what is proven, and what is not)

`node scripts/winrm-selftest.js` — 52 checks, exit 0. It proves:

1. **MD4** against all seven RFC 1320 test vectors, cross-checked
   against OpenSSL's legacy-provider `md4` on this machine (all eight
   values, including `md4("a")` and the 62-char vector, match).
2. **NT hash** against the published vector
   `MD4(UTF-16LE("Password")) = a4f49c406510bdcab6824ee7c30fd852`.
3. **NTLM structure**: a Type 2 built from fixed bytes parses back
   exactly; a Type 3 built with a pinned client challenge and timestamp
   is verified field-by-field with an *independent* code path — Node's
   built-in HMAC-MD5 recomputes the NTLMv2 and LMv2 proofs from the
   anchored NT hash, and the blob layout (RespType/HiRespType,
   timestamp, client challenge, target info) is asserted byte by byte.
4. **SOAP construction**: every envelope (Create/Command/Receive/
   Signal/Delete/Enumerate/Pull) is parsed back with fast-xml-parser
   and asserted for Action, ResourceURI, ShellId selector and payload —
   including a command containing `<>&"'`, which must survive XML
   escaping and parse back unchanged. A hand-written SOAP Fault is
   asserted to surface as `PROTOCOL` with the fault text.
5. **End-to-end against a local mock WinRM server** (in-process,
   `127.0.0.1`, ephemeral port): the mock speaks real HTTP and the
   real NTLM handshake — 401 to anonymous requests, Type 2 challenge
   to a Type 1, and it *cryptographically verifies* the client's
   Type 3 (recomputes the NTLMv2/LMv2 proofs with Node crypto and the
   known test password) before serving any SOAP. It then runs the real
   WS-Man shell flow (Create → Command → two Receives → Delete) and
   the real enumeration flow (Enumerate → Pull → EndOfSequence).
   `runShellCommand` returns `stdout === 'hello winrm\r\n'` with
   `exitCode 0` across the two Receives; `runWql` returns one parsed
   `Win32_OperatingSystem` instance. Wrong password → `AUTH_FAILED`
   502; closed port → `UNREACHABLE` 502; Receive delayed past the
   deadline → `TIMEOUT` 502. The mock is labelled MOCK everywhere and
   never leaves the test process.

**Not proven: a real Windows host.** No WinRM-enabled host exists in
this environment, so the last hop — a genuine WinRM service accepting
these exact bytes — is unproven until a host plus credentials exist.

## What is still missing (the exact ask)

To make the first live call, the user must supply:

1. **A WinRM-enabled Windows host** reachable from the server:
   `winrm quickconfig` (or `Enable-PSRemoting`) run on it, firewall
   allowing TCP 5985 (HTTP) or 5986 (HTTPS).
2. **Credentials for that host**: a username (optionally
   `DOMAIN\user`), its password, and the domain if it is a domain
   account. Passwords are supplied at call time only (env var / stdin
   at runtime) and are never stored in the repo, in files, or in logs.

Suggested first live proof once those exist (from the relay, which
can reach the LAN): `runShellCommand('<host>', { username,
password, command: 'hostname & whoami' })` and
`runWql('<host>', { query: 'SELECT Caption FROM
Win32_OperatingSystem' })` — expect the real hostname and OS caption
back, or an honest `AUTH_FAILED`/`UNREACHABLE` if the host is not
ready.

## Dependencies

- `fast-xml-parser@5.12.0` (added by this track; `^5.12.0` in
  `package.json`) — real XML parsing of SOAP responses. No other new
  dependency. NTLM is implemented in-repo (`server/services/ntlm.js`)
  on Node built-ins only, because the obvious npm option (`httpntlm`)
  relies on `crypto.createHash('md4')`, which throws on Node 24 /
  OpenSSL 3.
