# WinRM proof harness

**What this is:** a LOCAL TEST LISTENER plus a real WS-Management / WinRS
client, both Node stdlib only (no dependencies). The listener speaks the
real protocol — it validates the SOAP envelopes the client sends and returns
spec-shaped SOAP responses for the WinRS shell lifecycle
(Create → Command → Receive → Delete). The client builds real SOAP 1.2
envelopes, posts them to `/wsman` with Basic auth, and parses the real
responses (ShellId, CommandId, base64 stdout stream, CommandState, ExitCode).

**What this is NOT:** a Windows host. The listener executes nothing; its
"command output" is the fixed test string `TESTHOST\r\n`. It exists only
because no WinRM-enabled Windows host is available (see
`docs/winrm-setup.md`). Never present it as a production device.

## Run

```bash
node tests/winrm-proof/run-proof.js
```

Exit 0 = PASS. The listener binds 127.0.0.1 only, default port 15987
(`WINRM_PROOF_PORT` to change). Test credentials come from runtime env
vars `WINRM_PROOF_USER` / `WINRM_PROOF_PASS` (required; any values — the
listener only checks that a Basic auth header is present, never its
value). They are never logged, stored, or committed.

You can also run the pieces separately:

```bash
node tests/winrm-proof/listener.js   # standalone listener on :15987
node tests/winrm-proof/client.js     # client against a running listener
```

## Proof values (2026-11-09, this VM)

- Create → `ShellId=11111111-2222-3333-4444-555555555555`
- Command `hostname` → `CommandId=0`
- Receive → `Stream[stdout]` base64 `VEVTVEhPU1QNCg==` decodes to
  `"TESTHOST\r\n"`, `CommandState=.../CommandState/Done`, `ExitCode=0`
- Delete → HTTP 200, shell removed
- Listener validated 4/4 envelopes: correct `a:Action`, `a:MessageID`
  (echoed in `a:RelatesTo`), `w:ResourceURI`
  `http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd`,
  ShellId selectors, Basic auth scheme present.

## Live-host check (2026-11-09 ~07:40 UTC, from relay server1, read-only)

| Host | 5985 | 5986 | Note |
| --- | --- | --- | --- |
| TH-12-PC 100.68.2.26 (Tailscale) | closed | closed | Host reachable (ping 2/2, 0% loss); WinRM not listening — not enabled, or host firewall blocks it |
| GRAVITY-DES-3 192.168.22.10 | n/a | n/a | Unreachable from relay (ping 100% loss) — relay has no route to the GVS LAN, so WinRM state there is **untested**, not "off" |
| GRAVITY-DES-1 192.168.22.13 | n/a | n/a | Same as above |

Port checks only — no login attempts, no changes made.

## The missing piece

A real Windows host with WinRM enabled, plus a username + password for it
(supplied at runtime, never stored). See `docs/winrm-setup.md` for the exact
PowerShell to enable it and the exact ask for the user.
