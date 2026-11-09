'use strict';
/**
 * OpManager Central — real SQLite data store (real-data branch).
 *
 * Replaces the old fake JSON store (server/services/db.js, deleted).
 * Uses node:sqlite (built into Node 24) — no new npm dependency.
 *
 * Database file: server/data/opmanager.db (created on first run).
 * Override for tests with the OPMANAGER_DB_PATH env var.
 *
 * Rules enforced here:
 *  - Prepared statements only; no string-concatenated SQL. Dynamic UPDATE
 *    column lists are built from hardcoded whitelists, never from input.
 *  - Real epoch-millisecond timestamps (Date.now()); no "Just now" strings.
 *  - No seed/demo data: every table starts empty.
 *  - No random-number generation anywhere.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DB_PATH =
  process.env.OPMANAGER_DB_PATH ||
  path.join(__dirname, '..', 'data', 'opmanager.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Operator',
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL UNIQUE,
  hostname TEXT,
  sys_name TEXT,
  sys_descr TEXT,
  sys_object_id TEXT,
  vendor TEXT,
  model TEXT,
  category TEXT,
  snmp_community TEXT,
  snmp_version TEXT,
  probe_id INTEGER REFERENCES probes(id) ON DELETE SET NULL,
  managed INTEGER NOT NULL DEFAULT 1,
  status TEXT,
  cpu_pct REAL,
  mem_used_pct REAL,
  uptime_ticks INTEGER,
  response_ms REAL,
  last_polled_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interfaces (
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  if_index INTEGER NOT NULL,
  name TEXT,
  descr TEXT,
  oper_status TEXT,
  in_octets INTEGER,
  out_octets INTEGER,
  speed INTEGER,
  PRIMARY KEY (device_id, if_index)
);

CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  cpu_pct REAL,
  mem_used_pct REAL,
  response_ms REAL
);
CREATE INDEX IF NOT EXISTS idx_metrics_device_ts ON metrics(device_id, ts);

CREATE TABLE IF NOT EXISTS alarms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
  severity TEXT,
  message TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  ack_by TEXT,
  ack_at INTEGER,
  cleared_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_alarms_device_source ON alarms(device_id, source);
CREATE INDEX IF NOT EXISTS idx_alarms_status ON alarms(status);

CREATE TABLE IF NOT EXISTS alarm_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alarm_id INTEGER NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
  author TEXT,
  note TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_alarm_notes_alarm ON alarm_notes(alarm_id, created_at);

CREATE TABLE IF NOT EXISTS probes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  ip TEXT NOT NULL UNIQUE,
  auth_key_hash TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  cpu_pct REAL,
  mem_pct REAL,
  disk_pct REAL,
  latency_ms REAL,
  last_heartbeat_at INTEGER
);

CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL UNIQUE,
  hostname TEXT,
  ip TEXT,
  status TEXT,
  cpu_pct REAL,
  mem_pct REAL,
  disk_pct REAL,
  last_seen_at INTEGER
);

CREATE TABLE IF NOT EXISTS credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  type TEXT,
  community TEXT,
  username TEXT,
  password TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS discovery_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  range TEXT,
  found_count INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER,
  finished_at INTEGER,
  status TEXT
);

CREATE TABLE IF NOT EXISTS discovery_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  range TEXT,
  probe_id INTEGER REFERENCES probes(id) ON DELETE SET NULL,
  schedule TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  config_type TEXT,
  content TEXT,
  fetched_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_configs_device_type ON configs(device_id, config_type, fetched_at);

CREATE TABLE IF NOT EXISTS racks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  units INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  steps_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT,
  log TEXT,
  started_at INTEGER,
  finished_at INTEGER
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  action TEXT,
  detail TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS traps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_ip TEXT,
  oid TEXT,
  value TEXT,
  received_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  key_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`);

// Migration: alarms.rca_status was added after the initial schema, so
// pre-existing databases need it added. ALTER-safe: only add if absent.
const _alarmColumns = db
  .prepare('PRAGMA table_info(alarms)')
  .all()
  .map((c) => c.name);
if (!_alarmColumns.includes('rca_status')) {
  db.exec('ALTER TABLE alarms ADD COLUMN rca_status TEXT;');
}

function now() {
  return Date.now();
}

function toRow(r) {
  return r ? { ...r } : null;
}

function toRows(rs) {
  return rs.map((r) => ({ ...r }));
}

/**
 * Generic whitelisted UPDATE. `allowed` is a hardcoded column list, so no
 * caller-supplied key can ever reach the SQL text.
 * Returns the updated row, or null when nothing matched / nothing to set.
 */
function updateById(table, id, fields, allowed, getById) {
  const sets = [];
  const vals = [];
  for (const col of allowed) {
    if (fields[col] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(fields[col]);
    }
  }
  if (sets.length === 0) return getById(id);
  vals.push(id);
  db.prepare(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getById(id);
}

function insertAndGet(table, columns, values, getById) {
  const placeholders = columns.map(() => '?').join(', ');
  const info = db
    .prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`)
    .run(...values);
  return getById(Number(info.lastInsertRowid));
}

// ---------------------------------------------------------------- users ---

function getUserById(id) {
  return toRow(
    db.prepare('SELECT id, username, password_hash, role, must_change_password, created_at FROM users WHERE id = ?').get(id)
  );
}

function createUser(username, passwordHash, role) {
  return insertAndGet(
    'users',
    ['username', 'password_hash', 'role', 'must_change_password', 'created_at'],
    [username, passwordHash, role || 'Operator', 0, now()],
    getUserById
  );
}

function getUserByUsername(username) {
  return toRow(
    db.prepare('SELECT id, username, password_hash, role, must_change_password, created_at FROM users WHERE username = ?').get(username)
  );
}

function updateUser(id, fields) {
  return updateById(
    'users',
    id,
    fields || {},
    ['username', 'password_hash', 'role', 'must_change_password'],
    getUserById
  );
}

function listUsers() {
  return toRows(
    db.prepare('SELECT id, username, role, must_change_password, created_at FROM users ORDER BY id ASC').all()
  );
}

// ------------------------------------------------------------- sessions ---

function createSession(userId, tokenHash, expiresAt) {
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    tokenHash,
    userId,
    expiresAt
  );
  return getSessionByTokenHash(tokenHash);
}

function getSessionByTokenHash(tokenHash) {
  return toRow(db.prepare('SELECT token_hash, user_id, expires_at FROM sessions WHERE token_hash = ?').get(tokenHash));
}

function deleteSession(tokenHash) {
  const info = db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
  return { deleted: info.changes };
}

// -------------------------------------------------------------- devices ---

const DEVICE_COLUMNS = [
  'ip', 'hostname', 'sys_name', 'sys_descr', 'sys_object_id', 'vendor',
  'model', 'category', 'snmp_community', 'snmp_version', 'probe_id',
  'managed', 'status', 'cpu_pct', 'mem_used_pct', 'uptime_ticks',
  'response_ms', 'last_polled_at',
];

function getDevice(id) {
  return toRow(db.prepare('SELECT * FROM devices WHERE id = ?').get(id));
}

function getDeviceByIp(ip) {
  return toRow(db.prepare('SELECT * FROM devices WHERE ip = ?').get(ip));
}

function createDevice(fields) {
  const f = fields || {};
  const columns = ['created_at'];
  const values = [now()];
  for (const col of DEVICE_COLUMNS) {
    if (f[col] !== undefined) {
      columns.push(col);
      values.push(f[col]);
    }
  }
  return insertAndGet('devices', columns, values, getDevice);
}

function listDevices(filter) {
  const f = filter || {};
  const where = [];
  const vals = [];
  for (const col of ['status', 'category', 'managed', 'probe_id', 'vendor']) {
    if (f[col] !== undefined) {
      where.push(`${col} = ?`);
      vals.push(f[col]);
    }
  }
  const sql = `SELECT * FROM devices${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY id ASC`;
  return toRows(db.prepare(sql).all(...vals));
}

function updateDevice(id, fields) {
  return updateById('devices', id, fields || {}, DEVICE_COLUMNS, getDevice);
}

function updateDeviceMetrics(id, m) {
  const fields = { ...(m || {}) };
  if (fields.last_polled_at === undefined) fields.last_polled_at = now();
  return updateById(
    'devices',
    id,
    fields,
    ['cpu_pct', 'mem_used_pct', 'uptime_ticks', 'response_ms', 'status', 'last_polled_at'],
    getDevice
  );
}

function deleteDevice(id) {
  // Cascade: alarms reference devices(id) ON DELETE SET NULL (schema line
  // 96), so deleting the device alone orphaned its alarms with
  // device_id NULL. A device's alarms (active and cleared history) are
  // meaningless once the device is gone, so remove them in the same
  // transaction as the device row. Audit-log entries are a separate table
  // and are intentionally kept. Alarm notes cascade via their own
  // ON DELETE CASCADE FK on alarm_id.
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM alarms WHERE device_id = ?').run(id);
    const info = db.prepare('DELETE FROM devices WHERE id = ?').run(id);
    db.exec('COMMIT');
    return { deleted: info.changes };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ----------------------------------------------------------- interfaces ---

function replaceInterfaces(deviceId, rows) {
  // node:sqlite has no db.transaction() helper; use an explicit transaction.
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM interfaces WHERE device_id = ?').run(deviceId);
    const stmt = db.prepare(
      'INSERT INTO interfaces (device_id, if_index, name, descr, oper_status, in_octets, out_octets, speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const r of rows || []) {
      stmt.run(
        deviceId,
        r.if_index,
        r.name ?? null,
        r.descr ?? null,
        r.oper_status ?? null,
        r.in_octets ?? null,
        r.out_octets ?? null,
        r.speed ?? null
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return listInterfaces(deviceId);
}

function listInterfaces(deviceId) {
  return toRows(
    db.prepare('SELECT * FROM interfaces WHERE device_id = ? ORDER BY if_index ASC').all(deviceId)
  );
}

// -------------------------------------------------------------- metrics ---

function insertMetric(deviceId, m) {
  const f = m || {};
  const info = db
    .prepare('INSERT INTO metrics (device_id, ts, cpu_pct, mem_used_pct, response_ms) VALUES (?, ?, ?, ?, ?)')
    .run(deviceId, f.ts !== undefined ? f.ts : now(), f.cpu_pct ?? null, f.mem_used_pct ?? null, f.response_ms ?? null);
  return toRow(db.prepare('SELECT * FROM metrics WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function getMetrics(deviceId, opts) {
  const o = opts || {};
  const where = ['device_id = ?'];
  const vals = [deviceId];
  if (o.since !== undefined) {
    where.push('ts >= ?');
    vals.push(o.since);
  }
  const limit = Math.min(Math.max(Number(o.limit) || 500, 1), 10000);
  const sql = `SELECT * FROM metrics WHERE ${where.join(' AND ')} ORDER BY ts DESC LIMIT ?`;
  vals.push(limit);
  return toRows(db.prepare(sql).all(...vals));
}

function getLatestMetric(deviceId) {
  return toRow(
    db.prepare('SELECT * FROM metrics WHERE device_id = ? ORDER BY ts DESC LIMIT 1').get(deviceId)
  );
}

// --------------------------------------------------------------- alarms ---

function getAlarm(id) {
  return toRow(db.prepare('SELECT * FROM alarms WHERE id = ?').get(id));
}

function raiseAlarm(alarm) {
  const a = alarm || {};
  return insertAndGet(
    'alarms',
    ['device_id', 'severity', 'message', 'source', 'status', 'created_at'],
    [a.device_id ?? null, a.severity ?? null, a.message ?? null, a.source ?? null, a.status || 'active', now()],
    getAlarm
  );
}

function listAlarms(filter) {
  const f = filter || {};
  const where = [];
  const vals = [];
  for (const col of ['status', 'severity', 'device_id', 'source']) {
    if (f[col] !== undefined) {
      where.push(`${col} = ?`);
      vals.push(f[col]);
    }
  }
  const limit = Math.min(Math.max(Number(f.limit) || 200, 1), 1000);
  const sql = `SELECT * FROM alarms${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ?`;
  vals.push(limit);
  return toRows(db.prepare(sql).all(...vals));
}

function acknowledgeAlarm(id, user) {
  db.prepare("UPDATE alarms SET status = 'acknowledged', ack_by = ?, ack_at = ? WHERE id = ?").run(
    user ?? null,
    now(),
    id
  );
  return getAlarm(id);
}

function clearAlarm(id) {
  db.prepare("UPDATE alarms SET status = 'cleared', cleared_at = ? WHERE id = ?").run(now(), id);
  return getAlarm(id);
}

function resolveAlarmByKey(deviceId, source) {
  const info = db
    .prepare(
      "UPDATE alarms SET status = 'cleared', cleared_at = ? WHERE device_id = ? AND source = ? AND status IN ('active', 'acknowledged')"
    )
    .run(now(), deviceId, source);
  return { cleared: info.changes };
}

function deleteAlarm(id) {
  const info = db.prepare('DELETE FROM alarms WHERE id = ?').run(id);
  return info.changes > 0;
}

function getAlarmNote(id) {
  return toRow(db.prepare('SELECT * FROM alarm_notes WHERE id = ?').get(id));
}

function addNote(alarmId, author, note) {
  if (!getAlarm(alarmId)) return null;
  return insertAndGet(
    'alarm_notes',
    ['alarm_id', 'author', 'note', 'created_at'],
    [alarmId, author ?? null, note, now()],
    getAlarmNote
  );
}

function listNotes(alarmId) {
  return toRows(
    db.prepare('SELECT * FROM alarm_notes WHERE alarm_id = ? ORDER BY created_at ASC, id ASC').all(alarmId)
  );
}

function setRcaStatus(alarmId, status) {
  if (!getAlarm(alarmId)) return null;
  db.prepare('UPDATE alarms SET rca_status = ? WHERE id = ?').run(status ?? null, alarmId);
  return getAlarm(alarmId);
}

// --------------------------------------------------------------- probes ---

function getProbe(id) {
  return toRow(db.prepare('SELECT * FROM probes WHERE id = ?').get(id));
}

function getProbeByIp(ip) {
  return toRow(db.prepare('SELECT * FROM probes WHERE ip = ?').get(ip));
}

function getProbeByKeyHash(keyHash) {
  return toRow(db.prepare('SELECT * FROM probes WHERE auth_key_hash = ?').get(keyHash));
}

function createProbe(fields) {
  const f = fields || {};
  return insertAndGet(
    'probes',
    ['name', 'ip', 'auth_key_hash', 'status'],
    [f.name ?? null, f.ip, f.auth_key_hash ?? null, f.status || 'Pending'],
    getProbe
  );
}

function listProbes() {
  return toRows(db.prepare('SELECT * FROM probes ORDER BY id ASC').all());
}

function heartbeatProbe(id, m) {
  const f = m || {};
  const updated = updateById(
    'probes',
    id,
    {
      status: 'Online',
      cpu_pct: f.cpu_pct,
      mem_pct: f.mem_pct,
      disk_pct: f.disk_pct,
      latency_ms: f.latency_ms,
      last_heartbeat_at: now(),
    },
    ['status', 'cpu_pct', 'mem_pct', 'disk_pct', 'latency_ms', 'last_heartbeat_at'],
    getProbe
  );
  return updated;
}

function updateProbe(id, fields) {
  return updateById(
    'probes',
    id,
    fields || {},
    ['name', 'ip', 'auth_key_hash', 'status', 'cpu_pct', 'mem_pct', 'disk_pct', 'latency_ms'],
    getProbe
  );
}

function deleteProbe(id) {
  const info = db.prepare('DELETE FROM probes WHERE id = ?').run(id);
  return info.changes > 0;
}

// --------------------------------------------------------------- agents ---

function getAgent(agentId) {
  return toRow(db.prepare('SELECT * FROM agents WHERE agent_id = ?').get(agentId));
}

function registerAgent(fields) {
  const f = fields || {};
  db.prepare(
    `INSERT INTO agents (agent_id, hostname, ip, status, cpu_pct, mem_pct, disk_pct, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(agent_id) DO UPDATE SET
       hostname = excluded.hostname,
       ip = excluded.ip,
       status = excluded.status,
       cpu_pct = excluded.cpu_pct,
       mem_pct = excluded.mem_pct,
       disk_pct = excluded.disk_pct,
       last_seen_at = excluded.last_seen_at`
  ).run(
    f.agent_id,
    f.hostname ?? null,
    f.ip ?? null,
    f.status || 'Online',
    f.cpu_pct ?? null,
    f.mem_pct ?? null,
    f.disk_pct ?? null,
    now()
  );
  return getAgent(f.agent_id);
}

function listAgents() {
  return toRows(db.prepare('SELECT * FROM agents ORDER BY id ASC').all());
}

function recordAgentTelemetry(agentId, m) {
  const f = m || {};
  db.prepare(
    'UPDATE agents SET status = ?, cpu_pct = ?, mem_pct = ?, disk_pct = ?, last_seen_at = ? WHERE agent_id = ?'
  ).run(
    f.status || 'Online',
    f.cpu_pct ?? null,
    f.mem_pct ?? null,
    f.disk_pct ?? null,
    now(),
    agentId
  );
  return getAgent(agentId);
}

// ---------------------------------------------------------- credentials ---

function getCredential(id) {
  return toRow(db.prepare('SELECT * FROM credentials WHERE id = ?').get(id));
}

function createCredential(fields) {
  const f = fields || {};
  return insertAndGet(
    'credentials',
    ['name', 'type', 'community', 'username', 'password', 'created_at'],
    [f.name ?? null, f.type ?? null, f.community ?? null, f.username ?? null, f.password ?? null, now()],
    getCredential
  );
}

function listCredentials() {
  return toRows(db.prepare('SELECT * FROM credentials ORDER BY id ASC').all());
}

function deleteCredential(id) {
  const info = db.prepare('DELETE FROM credentials WHERE id = ?').run(id);
  return { deleted: info.changes };
}

// ------------------------------------------------------------ discovery ---

function saveDiscoveryRun(run) {
  const r = run || {};
  const info = db
    .prepare('INSERT INTO discovery_runs (range, found_count, started_at, finished_at, status) VALUES (?, ?, ?, ?, ?)')
    .run(
      r.range ?? null,
      r.found_count ?? 0,
      r.started_at !== undefined ? r.started_at : now(),
      r.finished_at !== undefined ? r.finished_at : now(),
      r.status || 'completed'
    );
  return toRow(db.prepare('SELECT * FROM discovery_runs WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function listDiscoveryRuns(limit) {
  const n = Math.min(Math.max(Number(limit) || 50, 1), 1000);
  return toRows(db.prepare('SELECT * FROM discovery_runs ORDER BY id DESC LIMIT ?').all(n));
}

function createDiscoveryRule(fields) {
  const f = fields || {};
  const info = db
    .prepare('INSERT INTO discovery_rules (range, probe_id, schedule, created_at) VALUES (?, ?, ?, ?)')
    .run(f.range ?? null, f.probe_id ?? null, f.schedule ?? null, now());
  return toRow(db.prepare('SELECT * FROM discovery_rules WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function listDiscoveryRules() {
  return toRows(db.prepare('SELECT * FROM discovery_rules ORDER BY id ASC').all());
}

function deleteDiscoveryRule(id) {
  const info = db.prepare('DELETE FROM discovery_rules WHERE id = ?').run(id);
  return { deleted: info.changes };
}

// -------------------------------------------------------------- configs ---

function saveConfig(deviceId, configType, content) {
  // Also accept a single object argument: { device_id, config_type, content }
  let dId = deviceId;
  let cType = configType;
  let body = content;
  if (deviceId && typeof deviceId === 'object') {
    dId = deviceId.device_id;
    cType = deviceId.config_type;
    body = deviceId.content;
  }
  const info = db
    .prepare('INSERT INTO configs (device_id, config_type, content, fetched_at) VALUES (?, ?, ?, ?)')
    .run(dId, cType ?? null, body ?? null, now());
  return toRow(db.prepare('SELECT * FROM configs WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function getConfigs(deviceId, configType) {
  if (configType !== undefined) {
    return toRows(
      db.prepare('SELECT * FROM configs WHERE device_id = ? AND config_type = ? ORDER BY fetched_at DESC').all(deviceId, configType)
    );
  }
  return toRows(
    db.prepare('SELECT * FROM configs WHERE device_id = ? ORDER BY fetched_at DESC').all(deviceId)
  );
}

function getLatestConfig(deviceId, configType) {
  const rows = getConfigs(deviceId, configType);
  return rows.length ? rows[0] : null;
}

// ---------------------------------------------------------------- racks ---

function getRack(id) {
  return toRow(db.prepare('SELECT * FROM racks WHERE id = ?').get(id));
}

function createRack(fields) {
  const f = fields || {};
  return insertAndGet(
    'racks',
    ['name', 'units', 'created_at'],
    [f.name ?? null, f.units ?? null, now()],
    getRack
  );
}

function listRacks() {
  return toRows(db.prepare('SELECT * FROM racks ORDER BY id ASC').all());
}

// ------------------------------------------------------------ workflows ---

function getWorkflow(id) {
  return toRow(db.prepare('SELECT * FROM workflows WHERE id = ?').get(id));
}

function createWorkflow(fields) {
  const f = fields || {};
  const steps = f.steps !== undefined ? f.steps : f.steps_json;
  return insertAndGet(
    'workflows',
    ['name', 'steps_json', 'created_at'],
    [f.name ?? null, typeof steps === 'string' ? steps : JSON.stringify(steps ?? []), now()],
    getWorkflow
  );
}

function listWorkflows() {
  return toRows(db.prepare('SELECT * FROM workflows ORDER BY id ASC').all());
}

function saveWorkflowRun(run) {
  const r = run || {};
  const info = db
    .prepare('INSERT INTO workflow_runs (workflow_id, status, log, started_at, finished_at) VALUES (?, ?, ?, ?, ?)')
    .run(
      r.workflow_id,
      r.status ?? null,
      r.log ?? null,
      r.started_at !== undefined ? r.started_at : now(),
      r.finished_at !== undefined ? r.finished_at : null
    );
  return toRow(db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function listWorkflowRuns(workflowId) {
  if (workflowId !== undefined) {
    return toRows(
      db.prepare('SELECT * FROM workflow_runs WHERE workflow_id = ? ORDER BY id DESC').all(workflowId)
    );
  }
  return toRows(db.prepare('SELECT * FROM workflow_runs ORDER BY id DESC').all());
}

// ------------------------------------------------------------- settings ---

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  const stored = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, stored);
  return { key, value: stored };
}

// ---------------------------------------------------------------- audit ---

function log(user, action, detail) {
  const stored = detail === undefined ? null : typeof detail === 'string' ? detail : JSON.stringify(detail);
  const info = db
    .prepare('INSERT INTO audit_log (user, action, detail, created_at) VALUES (?, ?, ?, ?)')
    .run(user ?? null, action ?? null, stored, now());
  return toRow(db.prepare('SELECT * FROM audit_log WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function listAudit(limit) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), 1000);
  return toRows(db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?').all(n));
}

// ------------------------------------------------------------- api keys ---

function getApiKeyById(id) {
  return toRow(db.prepare('SELECT id, name, created_at FROM api_keys WHERE id = ?').get(id));
}

function createApiKey(name, keyHash) {
  const info = db
    .prepare('INSERT INTO api_keys (name, key_hash, created_at) VALUES (?, ?, ?)')
    .run(name ?? null, keyHash, now());
  return getApiKeyById(Number(info.lastInsertRowid));
}

function listApiKeys() {
  // Hashes are never listed; use getApiKeyByHash for verification.
  return toRows(db.prepare('SELECT id, name, created_at FROM api_keys ORDER BY id ASC').all());
}

function getApiKeyByHash(keyHash) {
  return toRow(db.prepare('SELECT * FROM api_keys WHERE key_hash = ?').get(keyHash));
}

function deleteApiKey(id) {
  const info = db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
  return { deleted: info.changes };
}

function rotateApiKey(id, newKeyHash) {
  db.prepare('UPDATE api_keys SET key_hash = ? WHERE id = ?').run(newKeyHash, id);
  return getApiKeyById(id);
}

// ---------------------------------------------------------------- traps ---

function saveTrap(trap) {
  const t = trap || {};
  const info = db
    .prepare('INSERT INTO traps (source_ip, oid, value, received_at) VALUES (?, ?, ?, ?)')
    .run(t.source_ip ?? null, t.oid ?? null, t.value ?? null, now());
  return toRow(db.prepare('SELECT * FROM traps WHERE id = ?').get(Number(info.lastInsertRowid)));
}

function listTraps(limit) {
  const n = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  return toRows(db.prepare('SELECT * FROM traps ORDER BY received_at DESC, id DESC LIMIT ?').all(n));
}

// --------------------------------------------------------------- exports ---

module.exports = {
  // users
  createUser,
  getUserByUsername,
  updateUser,
  listUsers,
  // sessions
  createSession,
  getSessionByTokenHash,
  deleteSession,
  // devices
  createDevice,
  getDevice,
  getDeviceByIp,
  listDevices,
  updateDevice,
  updateDeviceMetrics,
  deleteDevice,
  // interfaces
  replaceInterfaces,
  listInterfaces,
  // metrics
  insertMetric,
  getMetrics,
  getLatestMetric,
  // alarms
  raiseAlarm,
  listAlarms,
  getAlarm,
  acknowledgeAlarm,
  clearAlarm,
  resolveAlarmByKey,
  deleteAlarm,
  addNote,
  listNotes,
  setRcaStatus,
  // probes
  createProbe,
  getProbe,
  getProbeByIp,
  getProbeByKeyHash,
  listProbes,
  heartbeatProbe,
  updateProbe,
  deleteProbe,
  // agents
  registerAgent,
  getAgent,
  listAgents,
  recordAgentTelemetry,
  // credentials
  createCredential,
  listCredentials,
  getCredential,
  deleteCredential,
  // discovery
  saveDiscoveryRun,
  listDiscoveryRuns,
  createDiscoveryRule,
  listDiscoveryRules,
  deleteDiscoveryRule,
  // configs
  saveConfig,
  getConfigs,
  getLatestConfig,
  // racks
  createRack,
  listRacks,
  getRack,
  // workflows
  createWorkflow,
  listWorkflows,
  saveWorkflowRun,
  listWorkflowRuns,
  // settings
  getSetting,
  setSetting,
  // audit
  log,
  listAudit,
  // api keys
  createApiKey,
  listApiKeys,
  getApiKeyByHash,
  deleteApiKey,
  rotateApiKey,
  // traps
  saveTrap,
  listTraps,

  // Namespaced aliases — same functions, grouped for route code that
  // uses store.devices.getDevice / store.configs.getLatestConfig / etc.
  // These reference the identical function objects as the flat exports
  // above; nothing was renamed or removed.
  users: { createUser, getUserByUsername, updateUser, listUsers },
  sessions: { createSession, getSessionByTokenHash, deleteSession },
  devices: {
    createDevice,
    getDevice,
    getDeviceByIp,
    listDevices,
    updateDevice,
    updateDeviceMetrics,
    deleteDevice,
  },
  interfaces: { replaceInterfaces, listInterfaces },
  metrics: { insertMetric, getMetrics, getLatestMetric },
  alarms: {
    raiseAlarm,
    listAlarms,
    getAlarm,
    acknowledgeAlarm,
    clearAlarm,
    resolveAlarmByKey,
    deleteAlarm,
    addNote,
    listNotes,
    setRcaStatus,
  },
  probes: {
    createProbe,
    getProbe,
    getProbeByIp,
    getProbeByKeyHash,
    listProbes,
    heartbeatProbe,
    updateProbe,
    deleteProbe,
  },
  agents: { registerAgent, getAgent, listAgents, recordAgentTelemetry },
  credentials: { createCredential, listCredentials, getCredential, deleteCredential },
  discovery: {
    saveDiscoveryRun,
    listDiscoveryRuns,
    createDiscoveryRule,
    listDiscoveryRules,
    deleteDiscoveryRule,
  },
  configs: { saveConfig, getConfigs, getLatestConfig },
  racks: { createRack, listRacks, getRack },
  workflows: { createWorkflow, listWorkflows, saveWorkflowRun, listWorkflowRuns },
  settings: { getSetting, setSetting },
  audit: { log, listAudit },
  apiKeys: { createApiKey, listApiKeys, getApiKeyByHash, deleteApiKey, rotateApiKey },
  traps: { saveTrap, listTraps },
};
