# WinRM setup — enabling a real Windows host for OpManager polling

## Status (2026-11-09)

**No WinRM-enabled Windows host is available yet.** The full client code
path is implemented and proven against a local protocol test listener
(`tests/winrm-proof/`), but a live exchange against a real Windows host has
not happened. That is the one missing piece.

Live check from the relay (server1, read-only, port checks only, no logins):

- **TH-12-PC `100.68.2.26`** (Tailscale): host is UP (ping 2/2, 0% loss)
  but **5985 and 5986 are both closed** — WinRM is not enabled there (or the
  host firewall blocks it).
- **GRAVITY-DES-3 `192.168.22.10` / GRAVITY-DES-1 `192.168.22.13`**: the
  relay has **no route to the GVS LAN** (ping 100% loss), so their WinRM
  state is **untested**, not "off". They cannot be checked from the relay at
  all; the check must run from a machine on the GVS LAN (or the GVS DC).

## Enable WinRM on a Windows host

Run in **PowerShell as Administrator** on the target host
(TH-12-PC is the easiest candidate — it is already on Tailscale and reachable).

### Option A — HTTP on port 5985 (quickest, for a trusted LAN only)

```powershell
# 1. Enable WinRM: starts the service, creates the HTTP listener on 5985,
#    and adds the firewall rule "Windows Remote Management (HTTP-In)".
Enable-PSRemoting -Force

# 2. Allow Basic auth over unencrypted HTTP (required for OpManager's
#    Basic-auth polling on 5985; the default is $false, which rejects it).
Set-Item WSMan:\localhost\Service\Auth\Basic -Value $true
Set-Item WSMan:\localhost\Service\AllowUnencrypted -Value $true
```

> HTTP + Basic sends the password base64-encoded, i.e. readable on the wire.
> Use this only on a trusted LAN. Prefer Option B for anything else.

### Option B — HTTPS on port 5986 (recommended)

```powershell
# 1. Enable WinRM (as above).
Enable-PSRemoting -Force

# 2. Create a certificate for the host and bind an HTTPS listener to 5986.
$cert = New-SelfSignedCertificate -DnsName "<hostname-or-IP>" -CertStoreLocation Cert:\LocalMachine\My
winrm create winrm/config/Listener?Address=*+Transport=HTTPS @{Hostname="<hostname-or-IP>";CertificateThumbprint="$($cert.Thumbprint)"}

# 3. Open the firewall for 5986 (Enable-PSRemoting only opens 5985).
New-NetFirewallRule -DisplayName "Windows Remote Management (HTTPS-In)" -Direction Inbound -LocalPort 5986 -Protocol TCP -Action Allow

# 4. Basic auth is allowed over HTTPS by default; confirm it is on.
Set-Item WSMan:\localhost\Service\Auth\Basic -Value $true
```

A self-signed certificate is fine for polling (OpManager must be told to
trust it); a domain/CA certificate is better if one exists.

### Verify on the host itself

```powershell
winrm enumerate winrm/config/listener
Get-NetFirewallRule -DisplayName 'Windows Remote Management (HTTP-In)' | Select-Object DisplayName, Enabled
Test-WSMan
```

Expected: a listener on Transport HTTP (5985) and/or HTTPS (5986), firewall
rule Enabled = True, `Test-WSMan` returning product version and protocol
version without error.

### Verify from another machine

```powershell
Test-WSMan -ComputerName <host> -Port 5985 -Authentication Basic -Credential (Get-Credential)
Enter-PSSession -ComputerName <host> -Credential (Get-Credential)
```

`Test-WSMan` succeeding from the relay (or from the OpManager server) is
the green light. `Enter-PSSession` proves the account can actually run
commands.

## What the user must supply

One Windows host, enabled as above, plus these four values. **They are
supplied at runtime only and are never stored** — not in the repo, not in
files, not in logs:

1. **Host** — IP or hostname reachable from the OpManager server
   (e.g. TH-12-PC `100.68.2.26` via Tailscale).
2. **Port** — `5985` (HTTP) or `5986` (HTTPS).
3. **Username** — a local Administrator on the host (e.g.
   `.\Administrator` or `TH-12-PC\pfhq2`), or a domain user in the host's
   Remote Management Users / Administrators group.
4. **Password** — given at runtime for the test, then discarded.

Optional but useful: whether the host uses a self-signed cert (HTTPS), and
whether the host's firewall should restrict WinRM to the OpManager server's
IP only.

## What happens after the host is ready

1. Point the proof client at it (`WINRM_PROOF_PORT=5985 node
   tests/winrm-proof/client.js` with host/user/pass from env) and run the
   same Create → Command (`hostname`) → Receive → Delete exchange against
   the real host.
2. Confirm the real stdout decodes to the host's actual hostname and
   `ExitCode=0`.
3. Then the production WinRM service (winrm-service track) can poll that
   host for real: CPU / memory / disk via `Get-CimInstance`, services via
   `Get-Service`, and uptime via `Get-CimInstance Win32_OperatingSystem`.

## References

- `tests/winrm-proof/README.md` — what the local test listener proves.
- `tests/winrm-proof/listener.js` — the listener (local test service only).
- `tests/winrm-proof/client.js` — the reference client (exact SOAP shapes).
