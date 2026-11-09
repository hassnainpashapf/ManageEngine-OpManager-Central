'use strict';
/**
 * Unit-level tests for server/services/ha.js — driven against the REAL
 * service and the REAL SQLite store (throwaway DB in a temp dir via
 * OPMANAGER_DB_PATH), with a REAL local HTTP peer speaking the actual
 * heartbeat wire protocol (an in-process http server on 127.0.0.1
 * answering exactly like server/routes/ha.js, labelled here as a local
 * test peer — never presented as a production node). No stubs, no
 * canned service answers: every assertion reads back persisted store
 * rows, a real HTTP round-trip, or a real TCP probe.
 *
 * The peer secret used here is generated at runtime with
 * crypto.randomBytes (test-only, never persisted, never printed).
 *
 * Run:  node server/services/ha.test.js        (exit 0 = all pass)
 *
 * Fixed clock: BASE = 1800000000000 (2026-01-15T08:00:00.000Z).
 * Defaults under test: heartbeatSec 5, missThreshold 3,
 * leaseTermMs 15000  =>  graceMs = 5 * 3 * 1000 = 15000.
 */
const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ha-test-'));
process.env.OPMANAGER_DB_PATH = path.join(tmpDir, 'opmanager.db');
delete process.env.OPM_HA_PEER_SECRET;

const store = require('./store');
const ha = require('./ha');

const BASE = 1800000000000; // fixed epoch ms for every deterministic check
const GRACE = 15000;

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}

async function main() {
  // 1 — defaults ---------------------------------------------------------
  check('defaults: heartbeatSec=5 missThreshold=3 leaseTermMs=15000 graceMs=15000 STALE_AFTER_BEATS=3', () => {
    const cfg = ha.getConfig();
    assert.strictEqual(cfg.heartbeatSec, 5);
    assert.strictEqual(cfg.missThreshold, 3);
    assert.strictEqual(cfg.leaseTermMs, 15000);
    assert.strictEqual(ha.graceMs(cfg), GRACE);
    assert.strictEqual(ha.STALE_AFTER_BEATS, 3);
  });

  // 2 — peer authentication: fail closed without a secret -----------------
  check('authenticatePeer: unconfigured when OPM_HA_PEER_SECRET unset', () => {
    assert.deepStrictEqual(ha.authenticatePeer('anything'), { configured: false, ok: false });
  });
  const testSecret = crypto.randomBytes(16).toString('hex');
  process.env.OPM_HA_PEER_SECRET = testSecret;
  check('authenticatePeer: wrong secret => ok=false, right secret => ok=true', () => {
    assert.deepStrictEqual(ha.authenticatePeer('wrong-secret'), { configured: true, ok: false });
    assert.deepStrictEqual(ha.authenticatePeer(null), { configured: true, ok: false });
    assert.deepStrictEqual(ha.authenticatePeer(testSecret), { configured: true, ok: true });
  });

  // This node is the standby; the primary lives at 127.0.0.1:8121.
  ha.setConfig({
    role: 'standby',
    nodeId: 'node-standby-1',
    nodeUrl: 'http://127.0.0.1:8120',
    primaryUrl: 'http://127.0.0.1:8121',
    heartbeatSec: 5,
    missThreshold: 3,
    leaseTermMs: 15000,
  });

  // 3 — peer registration persists in the store --------------------------
  const primary = ha.registerPeer(
    { peerId: 'node-primary-1', role: 'primary', url: 'http://127.0.0.1:8121' },
    BASE
  );
  check('registerPeer persists primary (lastSeenAt=BASE, missed=0, heartbeatCount=0)', () => {
    assert.strictEqual(primary.peerId, 'node-primary-1');
    assert.strictEqual(primary.role, 'primary');
    assert.strictEqual(primary.lastSeenAt, BASE);
    assert.strictEqual(primary.missed, 0);
    assert.strictEqual(primary.heartbeatCount, 0);
    const row = store.getHaPeer('node-primary-1');
    assert.strictEqual(row.last_seen_at, BASE);
    assert.strictEqual(row.heartbeat_count, 0);
  });

  // 4 — status: only the primary is known => degraded --------------------
  check('computeStatus(BASE): degraded, primaryAlive=true standbyAlive=false', () => {
    const s = ha.computeStatus(BASE);
    assert.strictEqual(s.status, 'degraded');
    assert.strictEqual(s.primaryAlive, true);
    assert.strictEqual(s.standbyAlive, false);
    assert.strictEqual(s.peers[0].msSinceSeen, 0);
    assert.strictEqual(s.peers[0].alive, true);
  });

  // 5 — inbound heartbeat refreshes last-seen, counts, resets missed ----
  const hb = ha.recordHeartbeat(
    { peerId: 'node-primary-1', role: 'primary', url: 'http://127.0.0.1:8121', sentAt: BASE + 5000 },
    BASE + 5000
  );
  check('recordHeartbeat at BASE+5000: ack, lastSeenAt=BASE+5000, heartbeatCount=1, missed=0', () => {
    assert.strictEqual(hb.ack, true);
    assert.strictEqual(hb.peerId, 'node-primary-1');
    assert.strictEqual(hb.lastSeenAt, BASE + 5000);
    assert.strictEqual(hb.heartbeatCount, 1);
    assert.strictEqual(hb.missed, 0);
    assert.strictEqual(store.getHaPeer('node-primary-1').last_seen_at, BASE + 5000);
  });

  // 6 — liveness boundary is EXACTLY graceMs ------------------------------
  check('alive at exactly grace (msSinceSeen=15000) at BASE+20000', () => {
    const s = ha.computeStatus(BASE + 20000);
    assert.strictEqual(s.peers[0].msSinceSeen, 15000);
    assert.strictEqual(s.peers[0].alive, true);
    assert.strictEqual(s.primaryAlive, true);
  });
  check('dead 1ms past grace (msSinceSeen=15001) at BASE+20001', () => {
    const s = ha.computeStatus(BASE + 20001);
    assert.strictEqual(s.peers[0].msSinceSeen, 15001);
    assert.strictEqual(s.peers[0].alive, false);
    assert.strictEqual(s.primaryAlive, false);
    assert.strictEqual(s.status, 'unavailable'); // only peer known and it is dead
  });

  // 7 — dry-run evaluation flips, but mutates NOTHING --------------------
  check('evaluateFailover at BASE+20001: wouldTrigger=true, decision=promote, no mutation', () => {
    const d = ha.evaluateFailover(BASE + 20001);
    assert.strictEqual(d.wouldTrigger, true);
    assert.strictEqual(d.decision, 'promote');
    assert.strictEqual(d.reason, 'primary-missed-threshold');
    assert.strictEqual(d.primaryPeerId, 'node-primary-1');
    assert.strictEqual(d.msSinceSeen, 15001);
    assert.strictEqual(d.graceMs, 15000);
    assert.strictEqual(ha.getConfig().role, 'standby'); // dry run: role untouched
    assert.strictEqual(store.getHaLease(), null); // dry run: no lease taken
  });

  // 8 — real promotion takes the lease and persists the role --------------
  check('attemptFailover at BASE+20001: promoted, lease held by node-standby-1 to BASE+35001', () => {
    const d = ha.attemptFailover(BASE + 20001);
    assert.strictEqual(d.promoted, true);
    assert.strictEqual(d.decision, 'promote');
    assert.strictEqual(d.reason, 'primary-missed-threshold-and-lease-acquired');
    assert.strictEqual(d.leaseHolder, 'node-standby-1');
    assert.strictEqual(d.leaseExpiresAt, BASE + 20001 + 15000);
    assert.strictEqual(ha.getConfig().role, 'primary'); // promotion persisted
    const lease = store.getHaLease();
    assert.strictEqual(lease.holder, 'node-standby-1');
    assert.strictEqual(lease.expires_at, BASE + 35001);
  });
  check('attemptFailover again: no-action not-standby, promoted=false (sticky)', () => {
    const d = ha.attemptFailover(BASE + 20002);
    assert.strictEqual(d.promoted, false);
    assert.strictEqual(d.decision, 'no-action');
    assert.strictEqual(d.reason, 'not-standby');
  });
  check('audit log holds the ha.promote event', () => {
    const rows = store.listAudit(10);
    const ev = rows.find((r) => r.action === 'ha.promote');
    assert.ok(ev, 'ha.promote audit row exists');
    assert.ok(String(ev.detail).includes('node-primary-1'));
  });

  // 9 — split-brain guard: a live lease held by ANOTHER node blocks ------
  ha.setConfig({ role: 'standby' }); // fresh standby view of the same DB
  store.releaseHaLease('node-standby-1');
  const other = store.acquireHaLease('node-other', 15000, BASE + 21000);
  check('setup: lease held by node-other to BASE+36000', () => {
    assert.strictEqual(other.acquired, true);
    assert.strictEqual(other.expiresAt, BASE + 36000);
  });
  check('evaluateFailover at BASE+22000: wouldTrigger=false lease-held-by-node-other, role stays standby', () => {
    const d = ha.evaluateFailover(BASE + 22000);
    assert.strictEqual(d.wouldTrigger, false);
    assert.strictEqual(d.decision, 'no-action');
    assert.strictEqual(d.reason, 'lease-held-by-node-other');
    assert.strictEqual(d.leaseHolder, 'node-other');
    assert.strictEqual(d.leaseExpiresAt, BASE + 36000);
    assert.strictEqual(ha.getConfig().role, 'standby');
    const a = ha.attemptFailover(BASE + 22000);
    assert.strictEqual(a.promoted, false);
    assert.strictEqual(ha.getConfig().role, 'standby');
  });
  check('attemptFailover at BASE+36001 (lease expired): promoted, lease to BASE+51001', () => {
    const d = ha.attemptFailover(BASE + 36001);
    assert.strictEqual(d.promoted, true);
    assert.strictEqual(d.leaseHolder, 'node-standby-1');
    assert.strictEqual(d.leaseExpiresAt, BASE + 36001 + 15000);
    assert.strictEqual(ha.getConfig().role, 'primary');
  });

  // 10 — real HTTP heartbeat: success against a local test peer -----------
  // The test peer is a real HTTP server implementing POST /api/ha/heartbeat
  // exactly like server/routes/ha.js (secret check + success shape).
  let seenBody = null;
  let seenSecretHeader = null;
  const peerServer = http.createServer((req, res) => {
    let buf = '';
    req.on('data', (c) => { buf += c; });
    req.on('end', () => {
      seenBody = { method: req.method, url: req.url, body: JSON.parse(buf) };
      seenSecretHeader = req.headers['x-ha-peer-secret'] || null;
      if (seenSecretHeader !== process.env.OPM_HA_PEER_SECRET) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: 'unauthorized' }));
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        peer: {
          peerId: 'node-primary-1',
          role: 'primary',
          url: `http://127.0.0.1:${peerServer.address().port}`,
          lastSeenAt: new Date().toISOString(),
          ageMs: 0,
          heartbeatCount: 2,
          alive: true,
        },
        serverTime: new Date().toISOString(),
        serverRole: 'primary',
      }));
    });
  });
  await new Promise((resolve) => peerServer.listen(0, '127.0.0.1', resolve));
  const peerPort = peerServer.address().port;
  const peerUrl = `http://127.0.0.1:${peerPort}`;
  ha.setConfig({ role: 'standby' });
  store.releaseHaLease('node-standby-1');
  const sent = await ha.sendHeartbeat(peerUrl);
  check('sendHeartbeat to live test peer: ok=true, missed=0, real POST with peer secret received', () => {
    assert.strictEqual(sent.ok, true);
    assert.strictEqual(sent.missed, 0);
    assert.strictEqual(sent.peerId, 'node-primary-1');
    assert.ok(typeof sent.latencyMs === 'number' && sent.latencyMs >= 0);
    assert.strictEqual(seenBody.method, 'POST');
    assert.strictEqual(seenBody.url, '/api/ha/heartbeat');
    assert.strictEqual(seenBody.body.peerId, 'node-standby-1');
    assert.strictEqual(seenBody.body.role, 'standby');
    assert.strictEqual(seenBody.body.url, 'http://127.0.0.1:8120');
    assert.ok(typeof seenBody.body.sentAt === 'number');
    assert.strictEqual(seenSecretHeader, process.env.OPM_HA_PEER_SECRET);
    assert.strictEqual(seenBody.body.peerSecret, process.env.OPM_HA_PEER_SECRET);
    // The successful round-trip refreshed the peer row in the store.
    const row = store.getHaPeer('node-primary-1');
    assert.strictEqual(row.missed, 0);
    assert.strictEqual(row.heartbeat_count, 2);
    assert.ok(Date.now() - row.last_seen_at < 5000);
  });
  await new Promise((resolve) => peerServer.close(resolve));

  // 11 — real HTTP heartbeat: 3 consecutive failures count misses --------
  ha.registerPeer({ peerId: 'node-dead-1', role: 'standby', url: 'http://127.0.0.1:59999' }, BASE);
  for (let i = 1; i <= 3; i += 1) {
    const r = await ha.sendHeartbeat('http://127.0.0.1:59999');
    assert.strictEqual(r.ok, false);
    assert.ok(/ECONNREFUSED/.test(r.error), `failure ${i} error names the refused connect: ${r.error}`);
    assert.strictEqual(r.missed, i);
  }
  check('sendHeartbeat to closed port 127.0.0.1:59999: 3 failures => missed=1,2,3 (ECONNREFUSED)', () => {
    assert.strictEqual(store.getHaPeer('node-dead-1').missed, 3);
  });
  check('recordHeartbeat after misses resets missed to 0 and counts the heartbeat', () => {
    const rec = ha.recordHeartbeat({ peerId: 'node-dead-1', role: 'standby', url: 'http://127.0.0.1:59999' }, BASE + 40000);
    assert.strictEqual(rec.missed, 0);
    assert.strictEqual(rec.heartbeatCount, 1);
    assert.strictEqual(store.getHaPeer('node-dead-1').missed, 0);
  });

  // 12 — fencing: a primary without the lease steps down ------------------
  ha.setConfig({ role: 'primary' });
  store.releaseHaLease('node-standby-1');
  store.acquireHaLease('node-primary-1', 15000, BASE + 50000); // the peer holds it
  const fenced = ha.recordHeartbeat(
    { peerId: 'node-primary-1', role: 'primary', url: 'http://127.0.0.1:8121' },
    BASE + 50000
  );
  check('fencing: primary peer holds lease => this node demoted to standby (fenced=true)', () => {
    assert.strictEqual(fenced.fenced, true);
    assert.strictEqual(ha.getConfig().role, 'standby');
    const rows = store.listAudit(10);
    assert.ok(rows.find((r) => r.action === 'ha.demote'), 'ha.demote audit row exists');
  });

  // 13 — getStatus: live TCP probe of peers -------------------------------
  const liveServer = http.createServer((req, res) => { res.writeHead(200); res.end('{}'); });
  await new Promise((resolve) => liveServer.listen(0, '127.0.0.1', resolve));
  const liveUrl = `http://127.0.0.1:${liveServer.address().port}`;
  ha.registerPeer({ peerId: 'node-live-1', role: 'standby', url: liveUrl }, Date.now());
  const status = await ha.getStatus();
  check('getStatus: live peer probes reachable=true, dead peer reachable=false', () => {
    assert.ok(['healthy', 'degraded', 'unavailable'].includes(status.status));
    const live = status.probes.find((p) => p.url === liveUrl);
    assert.ok(live, 'probe for live peer present');
    assert.strictEqual(live.reachable, true);
    assert.ok(typeof live.latencyMs === 'number' && live.latencyMs >= 0);
    const dead = status.probes.find((p) => p.url === 'http://127.0.0.1:8121');
    assert.ok(dead, 'probe for dead primary present');
    assert.strictEqual(dead.reachable, false);
  });
  await new Promise((resolve) => liveServer.close(resolve));

  // 14 — persistence: a fresh SQLite connection reads the same rows ------
  check('persistence: fresh connection reads ha_peers + ha_leases rows from disk', () => {
    const { DatabaseSync } = require('node:sqlite');
    const db2 = new DatabaseSync(path.join(tmpDir, 'opmanager.db'), { readOnly: true });
    try {
      const peers = db2.prepare('SELECT node_id, role FROM ha_peers ORDER BY node_id').all();
      assert.deepStrictEqual(
        peers.map((p) => p.node_id).sort(),
        ['node-dead-1', 'node-live-1', 'node-primary-1']
      );
      const lease = db2.prepare('SELECT holder FROM ha_leases WHERE id = 1').get();
      assert.strictEqual(lease.holder, 'node-primary-1');
    } finally {
      db2.close();
    }
  });

  // 15 — single-node honesty: start() refuses with no peer configured ----
  for (const p of store.listHaPeers()) store.removeHaPeer(p.node_id);
  store.releaseHaLease('node-primary-1');
  ha.setConfig({ role: 'standby', standbyUrl: null, primaryUrl: null, nodeUrl: null });
  check("start() with no peer: started=false reason='no-peer-configured'", () => {
    const r = ha.start();
    assert.strictEqual(r.started, false);
    assert.strictEqual(r.reason, 'no-peer-configured');
    assert.strictEqual(ha.computeStatus(Date.now()).status, 'single-node');
  });

  console.log(`\nHA TESTS: ${passed} passed, 0 failed`);
}

main()
  .catch((err) => {
    console.error('HA TEST FAILED:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  })
  .finally(() => {
    try { store.checkpointAndClose(); } catch { /* best-effort */ }
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort */ }
  });
