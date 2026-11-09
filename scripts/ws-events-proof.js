'use strict';
/**
 * Phase-3 ws-events proof (track: ws-events).
 *
 * SELF-CONTAINED: it forks scripts/ws-server-bootstrap.js (the real
 * server, on PORT, default 8139) as a child process, runs every step
 * against it, then kills ONLY that child. Use a throwaway DB: run it
 * from a fresh clone, or delete server/data/opmanager.db* and
 * server/data/.admin-initial first (the proof rotates the bootstrap
 * admin password to a random in-memory value, so a re-run against the
 * same DB cannot log in again).
 *
 * Flow (all real API calls, all real stored state):
 *   1. Log in as the bootstrap admin (password read at RUNTIME from
 *      server/data/.admin-initial — never printed, never written anywhere
 *      else), clear the must-change flag with a random in-memory password,
 *      re-log in, and open /ws with ?token=<session>.
 *   2. Create a device (TEST-NET-1 192.0.2.10 — a documentation address,
 *      not a real host; the poller will honestly report it Down) and apply
 *      a real vendor template to it -> expect TEMPLATE_APPLIED.
 *   3. Stage / approve / dry-run / reject NCM approvals -> expect
 *      NCM_STAGED, NCM_APPROVED, NCM_DRY_RUN, NCM_REJECTED.
 *   4. Save a failover config (secondary 127.0.0.1:9, a closed port) and
 *      run the heartbeat test -> expect two HA_STATUS frames: the config
 *      save (role/mode change) and the test (real TCP connect refused,
 *      reachable:false).
 *   5. Inject REAL SNMPv2c coldStart trap bytes (REAL_TRAP_HEX — captured
 *      with net-snmp `snmptrap` on the relay; see its comment) into the
 *      server process (IPC -> trapReceiver.injectDatagram -> the exact
 *      production handler), because no UDP datagram can be delivered into
 *      this VM: the sandbox blocks all outbound UDP sends (EPERM, even
 *      loopback) and the relay cannot reach this VM over the tailnet
 *      (tailscale ping times out; no TUN interface here). Expect
 *      TRAP_RECEIVED, and cross-check the event's trap.id against
 *      GET /api/traps/list.
 *   6. Write every non-heartbeat frame received to
 *      scripts/ws-events-proof.json and print PASS/FAIL per expected type.
 *
 * Exit code 0 only when every expected frame arrived with matching ids.
 * Heartbeat '-' frames, INITIAL_STATE and METRIC_TICK frames are recorded
 * but excluded from the pass criteria (they are not phase-3 events).
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { fork } = require('node:child_process');
const WebSocket = require('ws');

const PORT = Number(process.env.PORT) || 8139;
const TRAP_PORT = Number(process.env.OPM_TRAP_PORT) || 1162;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_FILE = path.join(__dirname, 'ws-events-proof.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let cookie = '';
let serverChild = null;

async function api(method, p, body, expectStatus) {
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const m = setCookie.match(/opm_session=([^;]+)/);
    if (m) cookie = `opm_session=${m[1]}`;
  }
  let json = null;
  try { json = await res.json(); } catch (e) { /* non-JSON body */ }
  if (expectStatus && res.status !== expectStatus) {
    throw new Error(`${method} ${p} -> HTTP ${res.status} (wanted ${expectStatus}): ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

// Real trap bytes for step 5 — captured 2026-11-09 on the relay with the
// genuine net-snmp sender (snmptrap -v 2c -c public 127.0.0.1:1163 ''
// 1.3.6.1.6.3.1.1.5.1 1.3.6.1.2.1.1.5.0 s ws-proof-device, received by a
// throwaway UDP listener on the relay itself and printed as hex).
// Decoded: SNMPv2c, community 'public', SNMPv2-Trap PDU (0xA7),
// sysUpTime.0, snmpTrapOID.0 = 1.3.6.1.6.3.1.1.5.1 (coldStart),
// sysName.0 = 'ws-proof-device'. Only request-id / sysUpTime vary
// between captures; the proof asserts on the trap OID, not on them.
// Embedded as a constant (rather than re-captured live) because the
// relay SSH leg takes 60s+ under the current load and would make the
// proof flaky; the bytes are real sender output, not hand-built.
// To re-capture: run the snmptrap + listener pair above on the relay.
const REAL_TRAP_HEX =
  '306302010104067075626c6963a756020453eec47f0201000201003048301006082b060102010103004304192aecf83017060a2b06010603010104010006092b0601060301010501301b06082b06010201010500040f77732d70726f6f662d646576696365';

// ------------------------------------------------------------------- main ---
async function main() {
  const frames = [];
  const failures = [];
  const check = (name, ok, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(name);
  };

  // 0. Fork the real server as our own child process.
  serverChild = fork(path.join(__dirname, 'ws-server-bootstrap.js'), [], {
    env: { ...process.env, PORT: String(PORT), OPM_TRAP_PORT: String(TRAP_PORT), OPM_SYSLOG_PORT: String(Number(process.env.OPM_SYSLOG_PORT) || 1514) },
    stdio: 'inherit',
  });
  const serverPid = serverChild.pid;
  console.log(`server forked (pid ${serverPid}) on :${PORT}, trap UDP ${TRAP_PORT}`);
  try {
    // Wait for the server to answer.
    let up = false;
    for (let i = 0; i < 40 && !up; i++) {
      try {
        const r = await fetch(`${BASE}/api/auth/session`);
        if (r.status === 401 || r.status === 200) up = true;
      } catch (e) { /* not up yet */ }
      if (!up) await sleep(500);
    }
    if (!up) throw new Error('server did not come up within 20s');
    console.log('server up');

    // 1. Bootstrap login -> change password -> re-login.
    // The server writes .admin-initial from ensureFirstAdmin() in its
    // listen callback, so allow a few seconds for the file to appear.
    const adminInitial = path.join(__dirname, '..', 'server', 'data', '.admin-initial');
    let bootstrapPw = null;
    for (let i = 0; i < 30 && !bootstrapPw; i++) {
      try {
        if (fs.existsSync(adminInitial)) bootstrapPw = fs.readFileSync(adminInitial, 'utf8').trim();
      } catch (e) { /* retry */ }
      if (!bootstrapPw) await sleep(500);
    }
    if (!bootstrapPw) throw new Error(`no bootstrap file yet at ${adminInitial}`);
    await api('POST', '/api/auth/login', { username: 'admin', password: bootstrapPw }, 200);
    const newPw = crypto.randomBytes(12).toString('base64url') + 'Aa1!';
    const changed = await api('POST', '/api/auth/change-password', { currentPassword: bootstrapPw, newPassword: newPw });
    if (changed.status !== 200) throw new Error(`password change failed: HTTP ${changed.status} ${JSON.stringify(changed.json)}`);
    cookie = '';
    await api('POST', '/api/auth/login', { username: 'admin', password: newPw }, 200);
    const token = cookie.replace('opm_session=', '');
    if (!token) throw new Error('login did not set an opm_session cookie');
    console.log('logged in as admin (bootstrap password rotated in-memory only)');

    // 2. WebSocket connect BEFORE the mutating calls.
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws?token=${encodeURIComponent(token)}`);
    const waitFor = (pred, label, timeoutMs = 15000) => new Promise((resolve, reject) => {
      const t0 = Date.now();
      const iv = setInterval(() => {
        const hit = frames.find(pred);
        if (hit) { clearInterval(iv); return resolve(hit); }
        if (Date.now() - t0 > timeoutMs) { clearInterval(iv); return reject(new Error(`timeout waiting for ${label}`)); }
      }, 100);
    });
    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
      setTimeout(() => reject(new Error('WS connect timeout')), 10000);
    });
    ws.on('message', (raw) => {
      try { frames.push(JSON.parse(raw.toString())); } catch (e) { /* non-JSON frame */ }
    });
    await waitFor((f) => f.type === 'INITIAL_STATE', 'INITIAL_STATE');
    console.log('WS connected, INITIAL_STATE received');

    // 3. Device + template apply.
    // Accept 409 (device already exists from an earlier proof run) and reuse it.
    const dev = await api('POST', '/api/devices', { ip: '192.0.2.10', name: 'ws-proof-device', community: 'public', snmpVersion: 'v2c' });
    if (dev.status === 409 && dev.json.device) {
      console.log(`device 192.0.2.10 already exists (id=${dev.json.device.id}); reusing it`);
    } else if (dev.status !== 201) {
      throw new Error(`device create -> HTTP ${dev.status}: ${JSON.stringify(dev.json)}`);
    }
    const deviceId = (dev.json.device || {}).id;
    console.log(`device created: id=${deviceId} ip=192.0.2.10`);
    const tplList = await api('GET', '/api/settings/templates', undefined, 200);
    if (!tplList.json.templates || !tplList.json.templates.length) throw new Error('template catalogue is empty');
    const templateName = tplList.json.templates[0].name;
    await api('POST', '/api/settings/templates/apply', { deviceId, templateName }, 200);
    console.log(`template applied: ${templateName} -> device ${deviceId}`);
    const tplEvent = await waitFor((f) => f.type === 'TEMPLATE_APPLIED', 'TEMPLATE_APPLIED');
    check('TEMPLATE_APPLIED frame', true, JSON.stringify(tplEvent));
    check('TEMPLATE_APPLIED device matches', tplEvent.device && tplEvent.device.id === deviceId && tplEvent.template.name === templateName);
    check('TEMPLATE_APPLIED thresholds are real numbers', tplEvent.thresholds
      && Number.isFinite(tplEvent.thresholds.cpuWarn) && Number.isFinite(tplEvent.thresholds.cpuCrit)
      && Number.isFinite(tplEvent.thresholds.memCrit));

    // 4. NCM stage / approve / dry-run / reject.
    const stage = async (action, commands) => {
      const r = await api('POST', '/api/ncm/approvals', { deviceId, action, commands }, 201);
      return r.json.approval;
    };
    const a1 = await stage('set snmp community', ['snmp-server community public RO']);
    const evStaged = await waitFor((f) => f.type === 'NCM_STAGED' && f.approvalId === a1.id, 'NCM_STAGED');
    check('NCM_STAGED frame', evStaged.status === 'pending' && evStaged.deviceId === deviceId, JSON.stringify(evStaged));
    await api('POST', `/api/ncm/approvals/${a1.id}/approve`, {}, 200);
    const evApproved = await waitFor((f) => f.type === 'NCM_APPROVED' && f.approvalId === a1.id, 'NCM_APPROVED');
    check('NCM_APPROVED frame', evApproved.status === 'approved' && evApproved.decidedBy === 'admin', JSON.stringify(evApproved));
    const a2 = await stage('set sysName', ['snmp-server location ws-proof-rack']);
    await api('POST', `/api/ncm/approvals/${a2.id}/dry-run`, {}, 200);
    const evDry = await waitFor((f) => f.type === 'NCM_DRY_RUN' && f.approvalId === a2.id, 'NCM_DRY_RUN');
    check('NCM_DRY_RUN frame', evDry.status === 'dry-run' && evDry.dryRun && evDry.dryRun.ok === true
      && evDry.dryRun.deviceContacted === false, JSON.stringify(evDry));
    const a3 = await stage('set contact', ['snmp-server contact ws-proof']);
    await api('POST', `/api/ncm/approvals/${a3.id}/reject`, { reason: 'not wanted in proof' }, 200);
    const evRejected = await waitFor((f) => f.type === 'NCM_REJECTED' && f.approvalId === a3.id, 'NCM_REJECTED');
    check('NCM_REJECTED frame', evRejected.status === 'rejected', JSON.stringify(evRejected));

    // 5. HA: config save (role/mode change) + heartbeat test (closed port).
    // Toggle the role away from whatever is stored, so the save is always a
    // real change (a no-op re-save of the same config emits no event).
    const curFo = await api('GET', '/api/settings/failover', undefined, 200);
    const curRole = curFo.json.failover && curFo.json.failover.role;
    const newRole = curRole === 'primary' ? 'standby' : 'primary';
    await api('POST', '/api/settings/failover', {
      mode: 'active-passive', role: newRole,
      secondary: { ip: '127.0.0.1', port: 9 }, heartbeatPort: 9,
    }, 200);
    const evHaSave = await waitFor((f) => f.type === 'HA_STATUS' && f.reason === 'config-saved', 'HA_STATUS config-saved');
    check('HA_STATUS config-saved frame', evHaSave.role === newRole && evHaSave.configured === true, JSON.stringify(evHaSave));
    const test = await api('POST', '/api/settings/failover/test', {}, 200);
    const evHaTest = await waitFor((f) => f.type === 'HA_STATUS' && f.reason === 'heartbeat-test', 'HA_STATUS heartbeat-test');
    check('HA_STATUS heartbeat-test frame', evHaTest.reachable === false && evHaTest.peer && evHaTest.peer.ip === '127.0.0.1'
      && Number.isFinite(evHaTest.latencyMs), JSON.stringify(evHaTest));
    console.log(`heartbeat test HTTP body: reachable=${test.json.reachable} message=${test.json.message}`);

    // 6. Real trap bytes (relay-captured, see REAL_TRAP_HEX) -> TRAP_RECEIVED
    // + stored-row cross-check.
    const trapHex = REAL_TRAP_HEX;
    console.log(`injecting real relay-captured trap datagram: ${trapHex.length / 2} bytes, hex prefix ${trapHex.slice(0, 32)}...`);
    const injected = new Promise((resolve, reject) => {
      const onMsg = (msg) => {
        if (!msg) return;
        if (msg.type === 'injected') { serverChild.off('message', onMsg); resolve(msg); }
        else if (msg.type === 'inject-error') { serverChild.off('message', onMsg); reject(new Error(msg.message)); }
      };
      serverChild.on('message', onMsg);
      setTimeout(() => { serverChild.off('message', onMsg); reject(new Error('inject ack timeout')); }, 10000);
    });
    serverChild.send({ type: 'inject-trap', hex: trapHex, sourceIp: '127.0.0.1' });
    await injected;
    const evTrap = await waitFor((f) => f.type === 'TRAP_RECEIVED', 'TRAP_RECEIVED');
    check('TRAP_RECEIVED frame', evTrap.trap && evTrap.trap.oid === '1.3.6.1.6.3.1.1.5.1'
      && evTrap.trap.sourceIp === '127.0.0.1', JSON.stringify(evTrap));
    const listed = await api('GET', '/api/traps/list?limit=5', undefined, 200);
    const stored = (listed.json.traps || []).find((t) => t.id === evTrap.trap.id);
    check('TRAP_RECEIVED id matches stored row', Boolean(stored), stored ? `stored row id=${stored.id} oid=${stored.oid}` : 'no matching row in /api/traps/list');

    // 7. Record + report.
    const interesting = frames.filter((f) => f.type !== 'METRIC_TICK' && f.type !== 'INITIAL_STATE' && !f['-']);
    fs.writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), port: PORT, trapPort: TRAP_PORT, trapHex, frames: interesting }, null, 2));
    console.log(`\nwrote ${interesting.length} non-heartbeat frames to ${OUT_FILE}`);
    console.log(`total frames seen (incl. heartbeats/METRIC_TICK): ${frames.length}`);
    ws.close();
    await sleep(300);
    if (failures.length) {
      console.log(`\nFAILED: ${failures.join(', ')}`);
      process.exitCode = 1;
    } else {
      console.log('\nALL PROOF CHECKS PASSED');
    }
  } finally {
    if (serverChild && !serverChild.killed) {
      serverChild.kill('SIGTERM');
      console.log(`server child ${serverPid} stopped`);
    }
  }
}

main().catch((err) => {
  console.error(`\nPROOF FAILED: ${err.message}`);
  if (serverChild && !serverChild.killed) serverChild.kill('SIGTERM');
  process.exit(1);
});
