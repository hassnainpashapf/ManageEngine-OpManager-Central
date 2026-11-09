'use strict';
/**
 * p3-snmpv3-tools-proof.js — live proof for the snmpv3-tools track.
 *
 * Stands up a REAL in-process SNMPv3 agent (net-snmp, SNMPv2-MIB) on
 * 127.0.0.1:161 serving exact scalar values, then drives the OpManager
 * server's own /api/tools/snmp-query and /api/tools/snmp-walk endpoints
 * (v3 + v2c regression) and the device create/update API, and checks the
 * exact values that come back. Nothing here is a stub: the agent speaks
 * real SNMPv3 (authPriv, SHA/AES) over UDP and the server speaks to it
 * through the real net-snmp v3 session path.
 *
 * This is a LOCAL TEST SERVICE ONLY — never a production device. The
 * agent binds loopback only and dies when this script exits.
 *
 * Credentials come ONLY from the environment (never persisted, never
 * committed):
 *   SNMPV3_TEST_USER, SNMPV3_TEST_AUTH, SNMPV3_TEST_PRIV
 * The server admin password is read at runtime from the clone's own
 * server/data/.admin-initial (mode 600, never printed).
 *   OPM_BASE   — server base URL (default http://127.0.0.1:8160)
 *   OPM_ADMIN_FILE — path to .admin-initial (default <repo>/server/data/.admin-initial)
 *
 * Usage:
 *   PORT=8160 node server/index.js            # in one shell, own instance
 *   SNMPV3_TEST_USER=... SNMPV3_TEST_AUTH=... SNMPV3_TEST_PRIV=... \
 *     node scripts/p3-snmpv3-tools-proof.js
 * Exits 0 when every check passes, 1 otherwise.
 *
 * Canonical Phase 4 merge (branch p4m-snmpv3): default base is now
 * :8160, and the login step ROTATES the bootstrap admin password before
 * any API call (the Phase 3 script logged in with the bootstrap
 * password and every route then answered 403 — the server forces a
 * password change before any API route answers). The rotation password
 * is generated at runtime, never printed, never stored.
 *
 * Sandbox note: this VM blocks UDP send (EPERM), so the live v3/v2c
 * query/walk checks against the loopback agent cannot pass here — they
 * need a UDP-capable host (e.g. the relay). The validation (400) and
 * device create/update/delete checks need no UDP and run anywhere.
 */

const fs = require('node:fs');
const path = require('node:path');
const snmp = require('net-snmp');

const REPO = path.resolve(__dirname, '..');
const BASE = (process.env.OPM_BASE || 'http://127.0.0.1:8160').replace(/\/$/, '');
const ADMIN_FILE = process.env.OPM_ADMIN_FILE || path.join(REPO, 'server', 'data', '.admin-initial');

// Exact values the test agent serves — the proof asserts these verbatim.
const EXPECT = {
  sysDescr: 'OpManager P3 SNMPv3 test agent',
  sysUpTime: 123456,
  sysName: 'p3-v3-agent',
  sysContact: 'p3-proof@example.local',
  sysLocation: 'Loopback rack 1',
  sysObjectID: '1.3.6.1.4.1.8072.3.2.10',
};

const V3_USER = process.env.SNMPV3_TEST_USER || `p3test-${require('node:crypto').randomBytes(4).toString('hex')}`;
const V3_AUTH = process.env.SNMPV3_TEST_AUTH || require('node:crypto').randomBytes(12).toString('hex');
const V3_PRIV = process.env.SNMPV3_TEST_PRIV || require('node:crypto').randomBytes(12).toString('hex');
if (!process.env.SNMPV3_TEST_USER || !process.env.SNMPV3_TEST_AUTH || !process.env.SNMPV3_TEST_PRIV) {
  // No test credentials supplied: generate random ones for this run only.
  // They exist only in this process's memory, are never printed, never
  // written to disk, and die with the agent when the script exits.
  console.log('NOTE: no SNMPV3_TEST_* env vars set — using randomly generated test credentials for this run only.');
}

let failures = 0;
let passes = 0;
function check(name, ok, detail) {
  if (ok) {
    passes++;
    console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

let cookie = '';
async function api(method, p, body) {
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  let json = null;
  try { json = JSON.parse(raw); } catch (_e) { /* non-JSON body */ }
  return { status: res.status, json, raw };
}

function leaksSecrets(obj) {
  // The real passphrases must never appear in any API response.
  const s = JSON.stringify(obj);
  return s.includes(V3_AUTH) || s.includes(V3_PRIV);
}

async function main() {
  // --- 1. In-process v3 agent (real protocol, loopback only) -------------
  const moduleStore = snmp.createModuleStore();
  const providers = moduleStore.getProvidersForModule('SNMPv2-MIB');
  const agent = snmp.createAgent({ port: 161, address: '127.0.0.1' }, (error, data) => {
    if (error) console.error('[proof-agent]', error.message || error);
  });
  agent.getMib().registerProviders(providers);
  const authorizer = agent.getAuthorizer();
  authorizer.addCommunity('public');
  authorizer.addUser({
    name: V3_USER,
    level: snmp.SecurityLevel.authPriv,
    authProtocol: snmp.AuthProtocols.sha,
    authKey: V3_AUTH,
    privProtocol: snmp.PrivProtocols.aes,
    privKey: V3_PRIV,
  });
  const mib = agent.getMib();
  mib.setScalarValue('sysDescr', EXPECT.sysDescr);
  mib.setScalarValue('sysObjectID', EXPECT.sysObjectID);
  mib.setScalarValue('sysUpTime', EXPECT.sysUpTime);
  mib.setScalarValue('sysContact', EXPECT.sysContact);
  mib.setScalarValue('sysName', EXPECT.sysName);
  mib.setScalarValue('sysLocation', EXPECT.sysLocation);
  // Give the agent a moment to bind UDP 161.
  await new Promise((r) => setTimeout(r, 500));

  try {
    // --- 2. Log in to the test server ------------------------------------
    let adminPass;
    try {
      adminPass = fs.readFileSync(ADMIN_FILE, 'utf8').trim();
    } catch (e) {
      console.error(`FAIL  cannot read admin bootstrap password at ${ADMIN_FILE}: ${e.message}`);
      process.exitCode = 1;
      return;
    }
    const login = await api('POST', '/api/auth/login', { username: 'admin', password: adminPass });
    check('login as admin', login.status === 200, `HTTP ${login.status}`);

    // FIX (Phase 4 merge): the server forces a password change before
    // any API route answers — without this rotation every call below
    // answered 403 in the Phase 3 run. Rotate to a runtime-only
    // password, then re-login (change-password rotates the session).
    const rotatedPass = require('node:crypto').randomBytes(12).toString('base64url');
    const changed = await api('POST', '/api/auth/change-password', {
      currentPassword: adminPass, newPassword: rotatedPass,
    });
    check('rotate bootstrap admin password (forced by server)', changed.status === 200, `HTTP ${changed.status}`);
    const relogin = await api('POST', '/api/auth/login', { username: 'admin', password: rotatedPass });
    check('re-login with rotated password', relogin.status === 200, `HTTP ${relogin.status}`);

    const v3 = { user: V3_USER, authProtocol: 'sha', authPass: V3_AUTH, privProtocol: 'aes', privPass: V3_PRIV };

    // --- 3. v3 snmp-query: exact varbind values ---------------------------
    const q1 = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3', v3,
    });
    check('v3 snmp-query sysDescr.0 exact value',
      q1.status === 200 && q1.json && q1.json.value === EXPECT.sysDescr,
      `HTTP ${q1.status} value=${JSON.stringify(q1.json && q1.json.value)}`);
    check('v3 snmp-query response has no passphrase + no 501',
      q1.status !== 501 && !leaksSecrets(q1.json),
      `HTTP ${q1.status} v3=${JSON.stringify(q1.json && q1.json.v3)}`);
    check('v3 snmp-query echoes v3 identity, not secrets',
      q1.json && q1.json.v3 && q1.json.v3.user === V3_USER
        && q1.json.v3.authProtocol === 'sha' && q1.json.v3.privProtocol === 'aes'
        && !('authPass' in q1.json.v3) && !('privPass' in q1.json.v3),
      JSON.stringify(q1.json && q1.json.v3));

    const q2 = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.3.0', version: 'v3', v3,
    });
    check('v3 snmp-query sysUpTime.0 exact value',
      q2.status === 200 && q2.json && Number(q2.json.value) === EXPECT.sysUpTime,
      `HTTP ${q2.status} value=${JSON.stringify(q2.json && q2.json.value)}`);

    // Top-level (non-nested) v3 fields are accepted too.
    const q3 = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.5.0', version: 'v3',
      user: V3_USER, authProtocol: 'sha', authPass: V3_AUTH, privProtocol: 'aes', privPass: V3_PRIV,
    });
    check('v3 snmp-query top-level fields sysName.0 exact value',
      q3.status === 200 && q3.json && q3.json.value === EXPECT.sysName,
      `HTTP ${q3.status} value=${JSON.stringify(q3.json && q3.json.value)}`);

    // --- 4. v3 snmp-walk ---------------------------------------------------
    const w = await api('POST', '/api/tools/snmp-walk', {
      ip: '127.0.0.1', rootOid: '.1.3.6.1.2.1.1', version: 'v3', v3,
    });
    const byOid = {};
    for (const r of (w.json && w.json.results) || []) byOid[r.oid] = r.value;
    check('v3 snmp-walk returns system subtree with exact values',
      w.status === 200 && w.json && w.json.count >= 5
        && byOid['1.3.6.1.2.1.1.1.0'] === EXPECT.sysDescr
        && byOid['1.3.6.1.2.1.1.5.0'] === EXPECT.sysName
        && Number(byOid['1.3.6.1.2.1.1.3.0']) === EXPECT.sysUpTime,
      `HTTP ${w.status} count=${w.json && w.json.count}`);
    check('v3 snmp-walk response has no passphrase',
      w.status !== 501 && !leaksSecrets(w.json), `HTTP ${w.status}`);

    // --- 5. v3 validation: 400s --------------------------------------------
    const badProto = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3',
      v3: { user: V3_USER, authProtocol: 'sha256', authPass: V3_AUTH },
    });
    check('v3 bad authProtocol -> 400',
      badProto.status === 400, `HTTP ${badProto.status} ${JSON.stringify(badProto.json && badProto.json.message)}`);

    const noUser = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3',
      v3: { authProtocol: 'sha', authPass: V3_AUTH },
    });
    check('v3 missing user -> 400',
      noUser.status === 400, `HTTP ${noUser.status}`);

    const shortPass = await api('POST', '/api/tools/snmp-walk', {
      ip: '127.0.0.1', rootOid: '.1.3.6.1.2.1.1', version: 'v3',
      v3: { user: V3_USER, authProtocol: 'sha', authPass: 'short' },
    });
    check('v3 short authPass -> 400',
      shortPass.status === 400, `HTTP ${shortPass.status}`);

    const noCreds = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3',
    });
    check('v3 no credentials at all -> 400 (not 501)',
      noCreds.status === 400 && noCreds.status !== 501, `HTTP ${noCreds.status}`);

    const badVersion = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v4',
    });
    check('unknown version v4 -> 400',
      badVersion.status === 400, `HTTP ${badVersion.status}`);

    // --- 6. v3 transport failure: 502 --------------------------------------
    const wrongPriv = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3',
      v3: { user: V3_USER, authProtocol: 'sha', authPass: V3_AUTH, privProtocol: 'aes', privPass: 'wrongprivphrase' },
    });
    check('v3 wrong privPass -> 502 (auth failure, not fake data)',
      wrongPriv.status === 502, `HTTP ${wrongPriv.status}`);

    const unreachable = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.2', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3', v3,
    });
    check('v3 unreachable host -> 502',
      unreachable.status === 502, `HTTP ${unreachable.status}`);

    // --- 7. v1/v2c unchanged (same agent, community path) ------------------
    const v2 = await api('POST', '/api/tools/snmp-query', {
      ip: '127.0.0.1', oid: '.1.3.6.1.2.1.1.1.0', version: 'v2c', community: 'public',
    });
    check('v2c snmp-query unchanged, exact value',
      v2.status === 200 && v2.json && v2.json.value === EXPECT.sysDescr,
      `HTTP ${v2.status} value=${JSON.stringify(v2.json && v2.json.value)}`);
    check('v2c response still masks community',
      v2.json && v2.json.community === '******', `community=${JSON.stringify(v2.json && v2.json.community)}`);

    // --- 8. Device store: create / read / update v3 creds, masked ---------
    // The test device points at the loopback agent (127.0.0.1:161) so the
    // stored-credential fallback below actually reaches the agent.
    const devIp = '127.0.0.1';
    const created = await api('POST', '/api/devices', {
      ip: devIp, name: 'p3-v3-test-device',
      snmp: { version: 'v3', community: null, v3 },
    });
    check('device create with snmp.v3 -> 201',
      created.status === 201, `HTTP ${created.status} ${JSON.stringify(created.json && created.json.message)}`);
    const cdev = created.json && created.json.device;
    check('device create response masks v3 secrets, keeps identity',
      !!cdev && cdev.snmp && cdev.snmp.version === 'v3'
        && cdev.snmp.v3 && cdev.snmp.v3.user === V3_USER
        && cdev.snmp.v3.authProtocol === 'sha' && cdev.snmp.v3.privProtocol === 'aes'
        && cdev.snmp.v3.authPass === '******' && cdev.snmp.v3.privPass === '******'
        && !('snmp_v3_auth_pass' in cdev) && !('snmp_v3_priv_pass' in cdev),
      JSON.stringify(cdev && cdev.snmp));
    check('device create response leaks no passphrase',
      !leaksSecrets(created.json), `HTTP ${created.status}`);
    const devId = cdev && cdev.id;

    if (devId) {
      const got = await api('GET', `/api/devices/${devId}`);
      check('device GET persists v3 creds, still masked',
        got.status === 200 && got.json && got.json.device && got.json.device.snmp
          && got.json.device.snmp.v3 && got.json.device.snmp.v3.user === V3_USER
          && got.json.device.snmp.v3.authPass === '******'
          && got.json.device.snmp.v3.privPass === '******',
        `HTTP ${got.status} snmp=${JSON.stringify(got.json && got.json.device && got.json.device.snmp)}`);
      check('device GET leaks no passphrase', !leaksSecrets(got.json), `HTTP ${got.status}`);

      // Stored-credential fallback: v3 query by device name, no creds in body.
      const qStored = await api('POST', '/api/tools/snmp-query', {
        ip: 'p3-v3-test-device', oid: '.1.3.6.1.2.1.1.1.0', version: 'v3',
      });
      check('v3 query via stored device credentials (no creds in body)',
        qStored.status === 200 && qStored.json && qStored.json.value === EXPECT.sysDescr,
        `HTTP ${qStored.status} value=${JSON.stringify(qStored.json && qStored.json.value)}`);

      const updated = await api('PUT', `/api/devices/${devId}`, {
        snmp: { v3: { privProtocol: 'des', privPass: V3_PRIV } },
      });
      check('device PUT partial v3 update -> 200, merged + masked',
        updated.status === 200 && updated.json && updated.json.device && updated.json.device.snmp
          && updated.json.device.snmp.v3 && updated.json.device.snmp.v3.user === V3_USER
          && updated.json.device.snmp.v3.privProtocol === 'des'
          && updated.json.device.snmp.v3.authProtocol === 'sha'
          && updated.json.device.snmp.v3.authPass === '******',
        `HTTP ${updated.status} snmp=${JSON.stringify(updated.json && updated.json.device && updated.json.device.snmp)}`);

      const badUpdate = await api('PUT', `/api/devices/${devId}`, {
        snmp: { v3: { authProtocol: 'bogus', authPass: V3_AUTH } },
      });
      check('device PUT bad authProtocol -> 400',
        badUpdate.status === 400, `HTTP ${badUpdate.status}`);

      const noUserUpdate = await api('PUT', `/api/devices/${devId}`, {
        snmp: { v3: null },
      });
      check('device PUT snmp.v3 null clears stored v3 creds',
        noUserUpdate.status === 200 && noUserUpdate.json && noUserUpdate.json.device
          && noUserUpdate.json.device.snmp && noUserUpdate.json.device.snmp.v3 === null,
        `HTTP ${noUserUpdate.status} snmp=${JSON.stringify(noUserUpdate.json && noUserUpdate.json.device && noUserUpdate.json.device.snmp)}`);

      const deleted = await api('POST', `/api/devices/${devId}/delete`, {});
      check('test device deleted', deleted.status === 200, `HTTP ${deleted.status}`);
    } else {
      check('device id present for follow-up checks', false, 'create returned no device id');
    }
  } finally {
    try { agent.close(); } catch (_e) { /* already closed */ }
  }

  console.log(`\n${passes} passed, ${failures} failed`);
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error('PROOF CRASH:', err);
  process.exitCode = 1;
});
