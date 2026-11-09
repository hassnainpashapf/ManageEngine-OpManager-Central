# Deploying OpManager Central (real-data build)

> Branch: `real-data` — repo: `https://github.com/hassnainpashapf/ManageEngine-OpManager-Central`
> Branch link: https://github.com/hassnainpashapf/ManageEngine-OpManager-Central/tree/real-data
> Verified against branch tip `097ba04` on 2026-11-09. Every command below matches a
> real file or script in this repo. Nothing here is invented; where a shipped path
> is broken, it is listed under **Known gaps** instead of written as a working step.

This build is the **real-data** rebuild: a Node.js/Express server (`server/index.js`,
port **8060**) with a real SQLite store (`server/data/opmanager.db`), a real
SNMPv2c + ICMP poller (`server/services/poller.js`, `server/services/snmp.js`),
scrypt-hashed logins, and no seeded/fake devices, metrics, or credentials.
The copy running on the build VM (`:8060`) is **not** reachable from other
machines — run it yourself using one of the paths below.

---

## 0. Requirements

| Item | Requirement | Source |
| --- | --- | --- |
| Node.js | v24 or higher | `README.md`; `Dockerfile` uses `node:24-alpine` |
| npm | v9 or higher | `README.md` |
| Git | any recent version | — |
| Network | Outbound ICMP + UDP 161 to the devices you monitor; TCP 8060 inbound to the console | `server/services/poller.js`, `server/services/snmp.js` |

`package.json` declares `"engines": {"node": ">=24"}` — npm warns (it only
errors when `engine-strict` is set) on an older Node. `package.json` scripts:

```json
"start": "node server/index.js",
"dev":   "node server/index.js",
"build": "node scripts/rebuild_bundle.js",
"test":  "node --check server/index.js && node --check server/services/store.js"
```

Dependencies are `express`, `net-snmp`, `ws`, `compression`, `cors`
(`package.json`). No database server, no build step, and no environment
file are needed for a local run — the frontend bundle is already committed
under `client/apiclient/fluidicv3/itom/assets/`.

---

## 1. Local run on macOS

### 1.1 Clone the `real-data` branch

The default branch is **not** this build — clone the branch explicitly:

```bash
git clone -b real-data https://github.com/hassnainpashapf/ManageEngine-OpManager-Central.git
cd ManageEngine-OpManager-Central
```

### 1.2 Install dependencies

```bash
npm install
```

### 1.3 Start the server

Simplest path (exactly what `npm start` runs — `package.json`):

```bash
npm start
```

Or use the shipped wrapper (`start.sh` — just `cd`s to the repo and runs
`node server/index.js`):

```bash
./start.sh
```

Or the full launcher (`start_opmanager_central.sh` — kills anything already
on port 8060, starts the server, waits for `http://localhost:8060/api/devices`
to answer, starts the host agent, then opens the console in Chrome app mode
on macOS):

```bash
./start_opmanager_central.sh
```

> **macOS agent caveat — read before using either `start-*.sh` script.**
> Both `start-opmanager-central.sh` and `start_opmanager_central.sh` pick
> `./agent_src/OpManagerAgent` on Darwin, but that file is a **Linux ELF
> x86-64 binary** (verified with `file`), so it cannot execute on macOS and
> the agent step of those scripts fails. The server itself still starts.
> Real macOS agent binaries are tracked in the repo at
> `agent_dist/macos/OpManagerAgent-arm64` (Apple Silicon) and
> `agent_dist/macos/OpManagerAgent-amd64` (Intel). See §1.5 for the manual
> workaround. The agent is optional — see below.

**Heap size: V8, not JVM (`--max-old-space-size`).** There is no JVM in
this build, so `POST /admin/updateJvmHeapSize` (and
`/api/admin/updateJvmHeapSize`) always answers **501** — permanently, not
a missing feature; no JVM heap exists to resize and no JVM metric is ever
invented. The only heap is the Node.js (V8) heap, whose maximum old-space
size is fixed at **process start** by the `--max-old-space-size` flag and
cannot be changed at runtime or by any API call. To raise it, restart the
server with the flag (value in MB):

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

Docker Compose: add `- NODE_OPTIONS=--max-old-space-size=4096` under
`environment:` in `docker-compose.yml` (§2.2); plain `docker run`: add
`-e NODE_OPTIONS=--max-old-space-size=4096` (§2.3); Render: set
`NODE_OPTIONS` to the same value as an environment variable (§3).
Verified on Node v24.22.1: default `heap_size_limit` 2240 MB →
4288 MB with `--max-old-space-size=4096` (limit ≈ flag + ~192 MB
overhead). Live V8 heap figures are visible at
`GET /api/admin/GetSystemInformation` (`runtime.heapTotalMB` /
`heapUsedMB`); the limit itself is not exposed by the API — check it with
`NODE_OPTIONS=--max-old-space-size=4096 node -e
"console.log(require('v8').getHeapStatistics().heap_size_limit)"`.

To stop everything started by `start_opmanager_central.sh`:

```bash
./stop_opmanager_central.sh
```

### 1.4 Open the console

On startup the server prints (from `server/index.js`):

```text
ManageEngine OpManager Central (Version 12.9.204-GA)
 Authentic Ember ITOM Root: http://localhost:8060/
 Direct ITOM Client: http://localhost:8060/apiclient/fluidicv3/itom/index.html#/
 Full NOC Overview: http://localhost:8060/noc
```

- Console (redirects to the login page when not signed in): http://localhost:8060/
- Login page: http://localhost:8060/login.html
- Direct ITOM client: http://localhost:8060/apiclient/fluidicv3/itom/index.html#/
- NOC wallboard: http://localhost:8060/noc

Verified live on the build VM on 2026-11-09: `GET /login.html` → **200**,
`GET /api/auth/session` without a session cookie → **401** (correct — every
`/api/*` route except the public auth/agent endpoints requires a session;
`server/index.js`).

### 1.5 Optional: host monitoring agent (reports this Mac's own telemetry)

The agent is a Go binary (`agent_src/main.go`). It reports the local host's
CPU/RAM/disk/network telemetry to the server every 5 seconds. It is
**optional**: the server and its SNMP/ICMP poller work without it; without
the agent, only this host's own telemetry is missing.

Because of the macOS binary problem in §1.3, run it manually with the real
macOS binary (Apple Silicon shown; use `OpManagerAgent-amd64` on Intel):

```bash
./agent_dist/macos/OpManagerAgent-arm64 -server http://localhost:8060 -probe 1 -interval 5
```

Flags (from `agent_src/main.go`): `-server` (console URL, required),
`-probe` (probe id), `-interval` (seconds, default 5), `-name` (display name,
defaults to hostname), `-key` (central–probe authorisation key, if one is
configured), `-test` (connectivity check, then exit), `-version`,
`-install` (install as a system service/daemon).

If the agent cannot reach the server it logs the failure; the server keeps
running.

---

## 2. Docker run

### 2.1 What the `Dockerfile` does (read, not assumed)

```dockerfile
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache iputils iproute2 traceroute curl net-tools
COPY package*.json ./
RUN npm ci --only=production
COPY . .
VOLUME /app/server/data
EXPOSE 8060
ENV PORT=8060
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8060/api/tools/mib-tree || exit 1
CMD ["node", "server/index.js"]
```

Notes, all verified from the files:

- `npm ci --only=production` works because `package-lock.json` is committed.
- `.dockerignore` excludes `.git`, `node_modules`, `scripts`, `*.md`,
  `agent_dist`, `server/data/seed.json`, `server/data/db.json`,
  `server/data/opmanager.db`, and `server/data/.admin-initial` — so **no
  database, no seed data, and no bootstrap password are ever baked into the
  image**. `server/data/templates/` and `server/data/mibs/` **are** copied:
  they are real vendor reference data the server needs (MIB tree, device
  templates).
- The image does **not** run the host agent and does **not** run
  `scripts/rebuild_bundle.js` — the committed frontend bundle is used as-is.
- The trap/syslog receiver binds UDP **162** (SNMP traps) and UDP **514**
  (syslog) — see §6. The image only exposes/publishes **8060**; see the
  note in §2.3 if you want traps.

### 2.2 Run with Docker Compose (recommended)

`docker-compose.yml` (shipped in the repo) builds the image, maps
`8060:8060`, restarts unless stopped, and persists data in the named volume
`opmanager-data` mounted at `/app/server/data`:

```yaml
services:
  opmanager-central:
    build: .
    container_name: opmanager-central
    ports:
      - "8060:8060"
    restart: unless-stopped
    volumes:
      - opmanager-data:/app/server/data
    environment:
      - NODE_ENV=production
      - PORT=8060
```

```bash
docker compose up -d --build
docker compose logs -f opmanager-central
```

Then open http://localhost:8060/ (or `http://<host-ip>:8060/` from another
machine) and log in as in §4.

### 2.3 Plain `docker run` equivalent

```bash
docker build -t opmanager-central:real-data .
docker run -d --name opmanager-central \
  -p 8060:8060 \
  -v opmanager-data:/app/server/data \
  -e NODE_ENV=production -e PORT=8060 \
  opmanager-central:real-data
```

To also receive SNMP traps / syslog inside the container, publish those
ports too (the server binds them; the `Dockerfile` does not expose them):

```bash
  -p 162:162/udp -p 514:514/udp
```

Binding UDP 162/514 works in the container because it runs as root by
default; a bind failure is logged and non-fatal — the console keeps
running, traps just never arrive (`server/services/trapReceiver.js`).

### 2.4 Known gap: the shipped `HEALTHCHECK` always fails

The `Dockerfile` healthcheck curls `http://localhost:8060/api/tools/mib-tree`
with no credentials. Every `/api/*` route requires an authenticated session
(`server/index.js`), and the endpoint is not on the public exemption list —
verified live: unauthenticated `GET /api/tools/mib-tree` → **401**, so
`curl -f` exits non-zero and the container is reported **unhealthy forever**.
The server itself runs fine; only the health status is wrong. Do not use
`depends_on: condition: service_healthy` against this image as shipped.
A working probe is the public login page (verified **200** unauthenticated):

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8060/login.html || exit 1
```

---

## 3. Render deploy (via `render.yaml`)

`render.yaml` (shipped in the repo) defines one web service:

```yaml
services:
  - type: web
    name: opmanager-central
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

Deploy steps:

1. Push the `real-data` branch to GitHub (already done — see the branch link
   at the top of this file).
2. In Render: **New → Web Service → Build and deploy from a Git repository**,
   pick `hassnainpashapf/ManageEngine-OpManager-Central`, branch `real-data`.
   Render detects `render.yaml` and fills in the build/start commands and
   `NODE_ENV=production` automatically.
3. No `PORT` variable is set in the file, and none is needed: Render injects
   `$PORT` dynamically and the server listens on `process.env.PORT`
   (`server/index.js`: `const PORT = process.env.PORT || 8060;`).

**Data-loss warning — read before relying on the free plan.** The file
itself states it: the free plan has **no persistent disk**, so
`server/data` (the SQLite database) **resets on every redeploy/restart**.
Devices you add, alarms, and the admin account are lost on each deploy.
That is expected on this plan. For durable data, use a paid Render plan
with a persistent disk mounted at the server's data directory and re-check
that the disk survives restarts before treating the deployment as
production. The admin bootstrap (§4) runs again on a fresh disk, producing
a **new** random bootstrap password each time the data is wiped.

---

## 4. First-time admin login + password change

### 4.1 How the first admin is created

On startup — and also lazily on the first `POST /api/auth/login` — the
server runs `ensureFirstAdmin()` (`server/services/session.js`,
`server/index.js`). **Only if the users table is empty** it creates user
`admin` with a **random 16-character password** (12 random bytes, base64url;
generated with `node:crypto`, never hardcoded) and flags the account
`must_change_password`.

The password is **not printed in full in the logs**. The startup log only
says:

```text
Bootstrap admin password written to server/data/.admin-initial (mode 600) — change it on first login.
```

Retrieve it from that file (mode `0600`, git-ignored — never commit or
share it):

```bash
cat server/data/.admin-initial
```

> Never paste, print, or store this password anywhere else. It is the only
> copy. Once you change it (§4.2), delete the file:
> `rm server/data/.admin-initial`

If the users table is **not** empty (e.g. a Docker volume or Render disk
already holds a database), no bootstrap happens and no `.admin-initial`
file is created — log in with the existing admin password.

### 4.2 Log in and change the password

1. Open http://localhost:8060/login.html (or your Render URL + `/login.html`).
2. Sign in as `admin` with the bootstrap password from
   `server/data/.admin-initial`.
3. The login response carries `mustChangePassword: true`, and the login page
   immediately shows a **change-password form** instead of entering the
   console (`client/login.html`). Enter the current (bootstrap) password and
   a new password — **minimum 10 characters**
   (`POST /api/auth/change-password`, `server/routes/auth.js`). The endpoint
   verifies the current password, stores a new scrypt hash, clears the
   `must_change_password` flag, and rotates the session.
4. After a successful change you are taken to the console (`/`). Delete
   `server/data/.admin-initial` as above.

Session details (for reference, not action): login sets an HttpOnly
`opm_session` cookie, 8-hour TTL; `GET /api/auth/session` reports the
current session; `POST /api/auth/logout` revokes it server-side.

If you ever need to create the first admin with a password of your own
choosing instead of the bootstrap (only possible while the users table is
still empty), `POST /api/auth/setup` with `{ "username", "password" }`
(minimum 10 characters) returns 403 once setup is complete
(`server/routes/auth.js`).

---

## 5. Adding the first real device

### 5.1 Prerequisite on the device

Enable **SNMPv2c read-only** on the device and allow the OpManager host to
reach it on UDP 161 (and ICMP echo, for the ping measurement). The poller
defaults to community **`public`** when no community is stored for a device
(`server/services/snmp.js`: `DEFAULT_COMMUNITY = 'public'`); use your real
community string if the device uses a different one. SNMPv3 is not used by
the poller — it creates sessions with `snmp.Version2c`.

Test the path before adding, from the OpManager host (or use the console's
built-in check — §5.3):

```bash
snmpget -v2c -c public <device-ip> 1.3.6.1.2.1.1.1.0   # sysDescr
snmpget -v2c -c public <device-ip> 1.3.6.1.2.1.1.5.0   # sysName
ping -c 3 <device-ip>
```

### 5.2 Add it in the console

**Inventory → Add Device**, then fill in:

| Field | Required | Notes |
| --- | --- | --- |
| IP address | yes | Only required field (`POST /api/devices`, `server/routes/devices.js`) |
| Name | no | Stored as `hostname` |
| Category | no | e.g. switch, router, firewall, server |
| Probe | no | `probeId`; omit for the central probe |
| SNMP community | no | Stored as `snmp_community`; defaults to `public` at poll time if omitted |
| SNMP version | no | Stored as `snmp_version`; poller uses SNMPv2c |

Adding a device whose IP already exists returns **409** (`Device with IP
… already exists`). A newly added device stores **only** what you supplied —
metrics are `null` until the first real poll. Nothing is synthesised.

API equivalent (authenticated session required):

```bash
curl -X POST http://localhost:8060/api/devices \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"ip": "192.168.30.2", "name": "Network-Core", "category": "switch", "community": "public"}'
```

### 5.3 Verify the credential first (recommended)

`POST /api/json/device/testCredential` performs a **real SNMP GET**
(`sysDescr`/`sysName` via `snmp.getSystemInfo`) against the target with the
supplied community and reports `SUCCESS` only on a real answer
(`server/routes/devices.js`). In the console this is the credential-test
action on the add-device flow. If it fails: the device does not answer
SNMP with that community (wrong community, SNMP not enabled, UDP 161
blocked, or an SNMP ACL). Ping answering while SNMP fails is a different
fault from the host being down — see §5.4.

### 5.4 What the poller does

The poller starts automatically with the server (`poller.startPoller()` in
`server/index.js`). One cycle, per managed device
(`server/services/poller.js`):

1. **ICMP echo** — real latency in ms (5 s timeout; `null` if ICMP is
   unavailable/blocked).
2. **SNMP system identity** — `sysDescr`, `sysName`, `sysObjectID`,
   `sysUpTime` (20 s timeout). This is the reachability proof for the SNMP
   path. If it fails:
   - ping also failed → status **Down**, availability alarm raised;
   - ping answered → status **SNMP Error**, SNMP alarm raised (message
     says to check community string, SNMP enablement, and ACLs).
3. **CPU/memory + interfaces in parallel** — SNMP CPU/memory
   (`getCpuMem`) and interface table (`getInterfaces`). A failure in either
   leaves that measurement `null` (reported honestly) without failing the
   whole poll; the device stays **Up** because SNMP identity answered.

Cycle timing: default **60 seconds**; configurable via the store setting
`poll_interval_seconds` (allowed 10–3600 s). Poll results are broadcast
live to connected console clients over WebSocket. Alarms are raised once
per continuing breach, not once per cycle.

To poll one device immediately instead of waiting for the next cycle
(`POST /api/devices/:id/poll-now`, also a console action):

```bash
curl -X POST http://localhost:8060/api/devices/<device-id>/poll-now -b cookies.txt
```

### 5.5 Optional: network discovery

`POST /api/discovery/run` (with discovery rules managed at
`GET/POST /api/discovery/rules`, `server/routes/discovery.js`) can sweep a
range and add responding devices. It is optional — §5.2 is the direct path
and is all you need for a first device.

---

## 6. Ports, data directory, and backup

### 6.1 Ports

| Port | Direction | Purpose |
| --- | --- | --- |
| TCP **8060** | inbound | HTTP console + REST API + WebSocket. `process.env.PORT || 8060` (`server/index.js`); `server.listen(PORT)` with no host, so it binds all interfaces — required for Docker/Render. |
| UDP **161** | outbound to devices | SNMPv2c GETs from the poller. |
| ICMP echo | outbound to devices | Ping latency per poll cycle. |
| UDP **162** | inbound | SNMP trap receiver (`server/services/trapReceiver.js`; override port with `OPM_TRAP_PORT`). Started when `server/routes/traps.js` loads. |
| UDP **514** | inbound | Syslog receiver (same module). |

Only TCP 8060 is published by the `Dockerfile` / `docker-compose.yml`;
publish `162/udp` and `514/udp` as well if you want traps/syslog in Docker
(§2.3). Traps and syslog are stored in the same table and listed at
`GET /api/traps/list`.

### 6.2 Data directory

All runtime state lives under **`server/data/`**:

| Path | Contents |
| --- | --- |
| `server/data/opmanager.db` | SQLite database — devices, users (scrypt hashes), sessions, alarms, metrics, traps. Created on first run (`server/services/store.js`). |
| `server/data/opmanager.db-wal`, `server/data/opmanager.db-shm` | SQLite WAL sidecars (present while the server runs). |
| `server/data/.admin-initial` | Bootstrap admin password, mode `0600` (see §4.1). Delete after the first password change. |
| `server/data/templates/` (+ `templates.json`) | Real device-template reference data (562 entries) — **committed**, do not delete. |
| `server/data/mibs/` (+ `mibs/index.json`) | Real MIB definitions (116 modules) backing `GET /api/tools/mib-tree` — **committed**, do not delete. |

`.gitignore` covers `opmanager.db`, `.admin-initial`, `db.json`,
`seed.json`, and the WAL sidecars — runtime data is never committed. In
Docker the same directory is the `VOLUME /app/server/data`
(`docker-compose.yml` mounts the named volume `opmanager-data` there).

### 6.3 Backup

Back up **`server/data/opmanager.db`** — it is the whole system state.
Because SQLite runs in WAL mode, either stop the server first and copy
the directory, or copy the database file together with its `-wal` sidecar:

```bash
# Local run — stop first (the SIGTERM handler checkpoints the WAL into the
# .db and closes it), then copy the single .db file:
./stop_opmanager_central.sh            # or Ctrl-C the `npm start` process
cp server/data/opmanager.db ~/backups/opmanager-$(date +%F).db

# If the server cannot be stopped, copy all three files together — the
# .db alone is stale until the WAL is checkpointed into it:
cp server/data/opmanager.db server/data/opmanager.db-wal server/data/opmanager.db-shm ~/backups/

# Docker — copy out of the named volume via a throwaway container (all
# three files, for the same WAL reason):
docker run --rm -v opmanager-data:/data -v ~/backups:/backup \
  alpine sh -c 'cp /data/opmanager.db /data/opmanager.db-wal /data/opmanager.db-shm /backup/ 2>/dev/null; cp /data/opmanager.db "/backup/opmanager-$(date +%F).db"'
```

Restore is the reverse: stop the server, put the file back at
`server/data/opmanager.db` (remove any stale `-wal`/`-shm` beside it), start
again. The admin account, devices, and history come back with the file.

**Do not back up or share `server/data/.admin-initial`** anywhere outside
the host — it contains a live password until the first password change.
On Render free plan there is nothing durable to back up: the disk resets
on redeploy (§3).

---

## 7. Known gaps (verified, not fixed by this guide)

1. **Docker `HEALTHCHECK` always reports unhealthy.** It curls the
   authenticated `/api/tools/mib-tree` without credentials → HTTP 401
   (verified live). The server runs fine; only the health status is wrong.
   Fix: probe `/login.html` instead (§2.4).
2. **macOS start scripts pick a Linux agent binary.** Both
   `start-opmanager-central.sh` and `start_opmanager_central.sh` run
   `./agent_src/OpManagerAgent` on Darwin, but that file is a Linux ELF
   x86-64 binary (verified with `file`) and cannot execute on macOS. The
   server still starts; only the agent step fails. Use
   `agent_dist/macos/OpManagerAgent-arm64` (Apple Silicon) or
   `agent_dist/macos/OpManagerAgent-amd64` (Intel) manually (§1.5).
3. **Render free plan has no persistent disk.** `render.yaml` documents it
   and §3 repeats it: every redeploy/restart wipes `server/data`, including
   the admin account and all devices.
4. **`engines` in `package.json` requires Node ≥ 24.** npm warns on an older
   Node unless `engine-strict` is set. Running on Node < 24 fails at startup
   with `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` — check with
   `node --version` before starting.
5. **Trap/syslog ports (UDP 162/514) need privileges.** Binding them
   requires root or the right capability; on a plain macOS run without
   privileges the bind fails (logged, non-fatal — console unaffected).
   In Docker they bind because the container runs as root, but the ports
   are not published by the shipped files (§2.3).

---

## 8. Quick reference

```bash
# Local (macOS)
git clone -b real-data https://github.com/hassnainpashapf/ManageEngine-OpManager-Central.git
cd ManageEngine-OpManager-Central
npm install
npm start                                   # or: ./start.sh
cat server/data/.admin-initial              # bootstrap admin password (once)
# open http://localhost:8060/login.html -> admin -> change password (min 10 chars)

# Docker
docker compose up -d --build                 # http://localhost:8060/

# Render
# New Web Service from repo, branch real-data; render.yaml supplies the rest.
# Free plan: data resets on redeploy — see §3.

# Stop (local launcher)
./stop_opmanager_central.sh
```

Console: http://localhost:8060/ · Login: http://localhost:8060/login.html ·
ITOM: http://localhost:8060/apiclient/fluidicv3/itom/index.html#/ ·
NOC: http://localhost:8060/noc
