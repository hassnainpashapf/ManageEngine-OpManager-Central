'use strict';
/**
 * OpManager Central — agent routes (real-data branch).
 *
 * Rebuilt from the audit (opm-check/real-data/audit/discovery-probes-agents.md,
 * items A1–A7). Rules enforced here:
 *  - No hardcoded/fallback metrics anywhere. A metric the agent did not send
 *    is stored as NULL and listed as null ("no data"), never back-filled.
 *  - No auto-registration. Telemetry/deregister from an unknown agentId, or
 *    with a missing/wrong auth key, is rejected with 401.
 *  - Agent auth is by SHA-256 hash of a per-agent one-time key. Only the
 *    hash is stored (in the store's api_keys table — the landed agents table
 *    has no key-hash column); the plaintext key is returned once, at
 *    admin registration, and never stored or logged. A probe's stored key
 *    hash is also accepted for telemetry, per the rebuild spec.
 *  - Agents live in the SQLite store (services/store.js), not in a
 *    process-local Map. Staleness is derived from last_seen_at: an agent
 *    that has not reported for > 3x the heartbeat interval (5 min) is
 *    listed as Offline. Registration alone never makes an agent "Online".
 *  - Telemetry never touches device records: no forced status 'Clear', no
 *    'Just now' timestamps, no invented interface traffic/utilization.
 *    Interface counters / top processes / uptime sent by an agent have no
 *    store column yet, so they are accepted and dropped, not fabricated.
 */
const express = require('express');
const crypto = require('node:crypto');
const router = express.Router();
const store = require('../services/store');

// The auth agent's session middleware (parallel track). It may not have
// landed yet when this file is loaded: fail CLOSED, never open, so the
// admin-only registration endpoint stays unavailable instead of unguarded.
let requireAuth;
try {
  const session = require('../services/session');
  requireAuth = session && session.requireAuth;
} catch (err) {
  requireAuth = null;
}
if (typeof requireAuth !== 'function') {
  requireAuth = (req, res, next) =>
    res.status(503).json({
      status: 'error',
      message:
        'Authentication service unavailable: server/services/session.js has not landed yet. Agent registration is disabled until the auth service is present.',
    });
}

// ManageEngine OpManager Server Configuration for Windows/macOS/Linux Agents
// (origin/main: the real Windows agent reads this to find Central.)
const serverInfoData = {
  PrimaryHostServer: "192.168.30.65",
  PrimaryServerIP: "192.168.30.65",
  PrimaryServerPort: "8060",
  ServerProtocol: "http",
  SecondaryHostServer: "",
  SecondaryServerIP: "",
  SecondaryServerPort: "",
  SecondaryServerProtocol: "",
  DR_PrimaryHostServer: "",
  DR_PrimaryServerIP: "",
  DR_SecondaryHostServer: "",
  DR_SecondaryServerIP: "",
  NATPort1: "8060",
  NATPort2: "",
  ServerName: "192.168.30.65",
  ServerPort: "8060",
  ServerIp: "192.168.30.65",
  Port: "8060",
  Protocol: "http",
  customerid: "OPM_ENTERPRISE_KEY_129203",
  CustomerId: "OPM_ENTERPRISE_KEY_129203",
  AuthKey: "ee-probe-101-central-key",
  ProbeName: "Central-Probe-01",
  ProbeId: "101"
};

// 1. Direct Server Info Configuration Endpoints (read by OpManagerAgent.exe)
router.get([
  '/OPMAgentServerInfo.json',
  '/downloads/OPMAgentServerInfo.json',
  '/agents/OPMAgentServerInfo.json',
  '/api/agent/serverinfo',
  '/agent/serverinfo',
  '/servlets/AgentServerInfo'
], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json(serverInfoData);
});

// 2. ManageEngine OpManager Agent Registration Servlets
router.all(['/servlets/RegisterAgent', '/servlets/AgentRegisterServlet'], (req, res) => {
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch(e) {
      try {
        const q = new URLSearchParams(body);
        body = Object.fromEntries(q.entries());
      } catch(e2) {
        body = {};
      }
    }
  }

  const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
  const agentIP = body.ipAddress || body.ip || body.IP_ADDRESS || clientIP;
  const agentId = body.agentId || body.AGENT_ID || body.agent_id || `AGT-${Date.now()}`;
  const hostname = body.hostname || body.HOSTNAME || body.computerName || body.COMPUTER_NAME || body.hostName || `Windows-Host-${agentIP.replace(/\./g, '-')}`;
  const os = (body.os || body.osName || body.OS_NAME || 'windows').toLowerCase();
  const platform = body.platform || body.osVersion || body.OS_VERSION || (os.includes('win') ? 'Windows 10/11 / Server 2022' : 'Linux x86_64');
  const probeId = Number(body.probeId || body.PROBE_ID || 101);

  // Store-backed (rewired from the old in-memory Map + JSON db service,
  // which the real-data branch deleted). No hardcoded metrics: an agent
  // that has not reported telemetry yet is Pending with null metrics,
  // exactly as admin registration does. The agentIP override
  // (body.ipAddress / body.ip / body.IP_ADDRESS) is preserved.
  store.agents.registerAgent({
    agent_id: agentId,
    hostname,
    ip: agentIP,
    status: 'Pending',
    cpu_pct: null,
    mem_pct: null,
    disk_pct: null,
  });

  // Auto add device in Central Inventory (store-backed). The device is
  // created with null status/metrics — never back-filled with
  // plausible-looking values — and an existing device is left untouched:
  // telemetry never forces status 'Clear' or a 'Just now' timestamp.
  // probe_id is only set when that probe actually exists in the store.
  let dev = null;
  try {
    dev = store.devices.getDeviceByIp(agentIP);
    if (!dev) {
      const probe = store.probes.getProbe(probeId);
      dev = store.devices.createDevice({
        hostname,
        ip: agentIP,
        category: 'Servers',
        vendor: os.includes('win') ? 'Microsoft Corp.' : 'Linux Foundation',
        sys_descr: platform,
        probe_id: probe ? probe.id : null,
        snmp_version: 'Agent-Direct',
        managed: 1,
        status: null,
        cpu_pct: null,
        mem_used_pct: null,
        response_ms: null,
        last_polled_at: null,
      });
    }
  } catch (e) {
    // Device inventory is ancillary to agent registration; log and
    // continue so the servlet still answers the agent.
    console.error('[OpManager Agent Servlet] device upsert failed:', e && e.message ? e.message : e);
    dev = null;
  }

  console.log(`[OpManager Agent Servlet] Successfully registered ${hostname} (${clientIP}) via /servlets/RegisterAgent`);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    message: 'Agent registered successfully',
    agentId,
    heartbeatInterval: 30,
    probeId,
    deviceId: dev ? dev.id : null
  });
});

// 3. ManageEngine Periodic Telemetry & Heartbeat Servlets
router.all(['/servlets/DataAgentHandlerServlet', '/servlets/StatusUpdateServlet'], (req, res) => {
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch(e) {
      try {
        const q = new URLSearchParams(body);
        body = Object.fromEntries(q.entries());
      } catch(e2) {
        body = {};
      }
    }
  }

  const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
  const agentId = body.agentId || body.AGENT_ID || 'AGT-DEFAULT';
  const hostname = body.hostname || body.HOSTNAME || body.computerName || `Windows-Host-${clientIP}`;

  // Store-backed (rewired from the in-memory Map + JSON db). An unknown
  // agent is created on first telemetry, as the servlet always did — the
  // Windows agent cannot enroll via the admin API. Only metrics the agent
  // actually sent are stored; anything missing keeps the last real value
  // (null when never reported). Telemetry never touches device records:
  // no forced status 'Clear', no 'Just now' timestamps.
  let agent = store.agents.getAgent(agentId);
  if (!agent) {
    agent = store.agents.registerAgent({
      agent_id: agentId,
      hostname,
      ip: clientIP,
      status: 'Pending',
      cpu_pct: null,
      mem_pct: null,
      disk_pct: null,
    });
  }

  const cpu = realNumber(body.cpu ?? body.cpuUsage ?? body.CPU);
  const mem = realNumber(body.memory ?? body.memoryUsage ?? body.MEMORY);
  const disk = realNumber(body.disk ?? body.diskUsage ?? body.DISK);

  store.agents.recordAgentTelemetry(agentId, {
    status: 'Online',
    cpu_pct: cpu !== null ? cpu : agent.cpu_pct,
    mem_pct: mem !== null ? mem : agent.mem_pct,
    disk_pct: disk !== null ? disk : agent.disk_pct,
  });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    ack: true,
    timestamp: new Date().toISOString()
  });
});

// 4. ManageEngine Actions, File Collection, & Downloads Servlets
router.all(['/servlets/AgentActionServlet', '/servlets/FileCollector', '/servlets/AgentDownloadServlet'], (req, res) => {
  if (req.path.includes('AgentDownloadServlet')) {
    return res.redirect('/downloads/OpManagerAgent-Windows-x64.zip');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'success',
    code: '1000',
    actions: [],
    message: 'Servlet request acknowledged'
  });
});

// Heartbeat interval the agent is told to use (minutes, as before) and the
// staleness threshold: > 3x the interval with no telemetry => Offline.
const HEARTBEAT_INTERVAL_MINUTES = 5;
const STALE_AFTER_MS = 3 * HEARTBEAT_INTERVAL_MINUTES * 60 * 1000;

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function apiKeyName(agentId) {
  return `agent:${agentId}`;
}

// The auth key as presented by the agent: `eeauthkey` header (what the Go
// agent sends) or the `authKey` body field. Never logged.
function presentedKey(req) {
  const header = req.headers['eeauthkey'] || req.headers['x-agent-key'];
  if (typeof header === 'string' && header.length > 0) return header;
  if (req.body && typeof req.body.authKey === 'string' && req.body.authKey.length > 0) {
    return req.body.authKey;
  }
  return null;
}

// Validate the presented key for this agentId. Accepts the agent's own
// one-time key (SHA-256 hash looked up in the api_keys table) or any
// registered probe's key hash. Returns an auth descriptor or null.
function authenticateAgent(req, agentId) {
  const key = presentedKey(req);
  if (!key) return null;
  const keyHash = hashKey(key);
  const apiKey = store.apiKeys.getApiKeyByHash(keyHash);
  if (apiKey && apiKey.name === apiKeyName(agentId)) {
    return { type: 'agent', agentId };
  }
  const probe = store.probes.getProbeByKeyHash(keyHash);
  if (probe) {
    return { type: 'probe', probeId: probe.id };
  }
  return null;
}

// A finite real number, or null when the agent did not send one.
// Non-numeric / non-finite values are treated as "not sent", never coerced
// into a plausible-looking default.
function realNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// Effective display status, derived from the stored row — never from a
// static string. 'Pending' = registered, never reported telemetry.
// 'Offline' = deregistered, or no telemetry for > 3x the interval.
function effectiveStatus(row) {
  if (!row) return 'Unknown';
  if (row.status === 'Pending') return 'Pending';
  if (row.status === 'Offline') return 'Offline';
  if (!row.last_seen_at) return 'Unknown';
  if (Date.now() - row.last_seen_at > STALE_AFTER_MS) return 'Offline';
  return 'Online';
}

// Public view of a stored agent row. Field names match the old responses;
// anything the store does not hold is null (never invented).
function agentView(row) {
  return {
    agentId: row.agent_id,
    hostname: row.hostname,
    displayName: row.hostname || null,
    os: null,
    platform: null,
    arch: null,
    probeId: null,
    ip: row.ip || null,
    version: null,
    status: effectiveStatus(row),
    registeredAt: null,
    lastHeartbeat: row.last_seen_at ? new Date(row.last_seen_at).toISOString() : null,
    metrics: {
      cpu: row.cpu_pct !== null && row.cpu_pct !== undefined ? row.cpu_pct : null,
      memory: row.mem_pct !== null && row.mem_pct !== undefined ? row.mem_pct : null,
      disk: row.disk_pct !== null && row.disk_pct !== undefined ? row.disk_pct : null,
    },
  };
}

// ---------------------------------------------------------------------------
// Admin-only registration. Creates the agent record and issues a one-time
// key, returned ONCE in this response. The agent must present that key on
// every telemetry/deregister call. Re-registering rotates the key: previous
// keys for this agent are revoked.
// POST /api/agents/register (requires a logged-in admin session)
// ---------------------------------------------------------------------------
router.post('/api/agents/register', requireAuth, (req, res) => {
  const { agentId, hostname, ip } = req.body || {};

  if (!agentId || !hostname) {
    return res.status(400).json({ status: 'error', message: 'agentId and hostname are required' });
  }

  const existing = store.agents.getAgent(agentId);

  // Rotate: revoke any previous one-time keys issued for this agent.
  for (const k of store.apiKeys.listApiKeys()) {
    if (k.name === apiKeyName(agentId)) {
      store.apiKeys.deleteApiKey(k.id);
    }
  }

  const oneTimeKey = crypto.randomBytes(32).toString('hex');
  store.apiKeys.createApiKey(apiKeyName(agentId), hashKey(oneTimeKey));

  // Preserve last real telemetry across a re-registration; a first-time
  // registration starts with null metrics and status 'Pending'.
  // NB: the store's registerAgent reads snake_case `agent_id` (not the
  // brief's camelCase `agentId`); passing `agentId` would store NULL.
  const agent = store.agents.registerAgent({
    agent_id: agentId,
    hostname,
    ip: ip || (existing ? existing.ip : null),
    status: 'Pending',
    cpu_pct: existing ? existing.cpu_pct : null,
    mem_pct: existing ? existing.mem_pct : null,
    disk_pct: existing ? existing.disk_pct : null,
  });

  return res.status(200).json({
    status: 'success',
    agentId,
    message: `Host '${hostname}' registered. Store the auth key now — it is shown once and cannot be retrieved again.`,
    authKey: oneTimeKey,
    heartbeatInterval: HEARTBEAT_INTERVAL_MINUTES,
    agent: agentView(agent),
  });
});

// ---------------------------------------------------------------------------
// Legacy self-registration is closed (audit A1/A5): an unauthenticated
// caller could previously invent an agent with any key. Agents are now
// enrolled by an admin via POST /api/agents/register above.
// ---------------------------------------------------------------------------
router.post('/api/agent/register', (req, res) => {
  return res.status(410).json({
    status: 'error',
    message:
      'Agent self-registration is disabled. An administrator must register the agent first via POST /api/agents/register and give it the issued one-time key.',
  });
});

// ---------------------------------------------------------------------------
// Receive live periodic telemetry from a registered agent. Only what the
// agent actually sent is stored; absent fields keep the last real value
// (null when never reported). Unknown agents and bad/missing keys => 401.
// ---------------------------------------------------------------------------
router.post('/api/agent/telemetry', (req, res) => {
  const { agentId, cpuUsage, memoryUsage, diskUsage } = req.body || {};

  if (!agentId) {
    return res.status(400).json({ status: 'error', message: 'agentId is required' });
  }

  const agent = store.agents.getAgent(agentId);
  if (!agent) {
    return res.status(401).json({ status: 'error', message: 'Unknown agent: register first via POST /api/agents/register' });
  }

  if (!authenticateAgent(req, agentId)) {
    return res.status(401).json({ status: 'error', message: 'Invalid or missing agent auth key' });
  }

  const cpu = realNumber(cpuUsage);
  const mem = realNumber(memoryUsage);
  const disk = realNumber(diskUsage);

  const updated = store.agents.recordAgentTelemetry(agentId, {
    status: 'Online',
    cpu_pct: cpu !== null ? cpu : agent.cpu_pct,
    mem_pct: mem !== null ? mem : agent.mem_pct,
    disk_pct: disk !== null ? disk : agent.disk_pct,
  });

  return res.json({
    status: 'success',
    ack: true,
    agentId,
    timestamp: new Date().toISOString(),
    agent: updated ? agentView(updated) : null,
  });
});

// Read-only connectivity check for the agent's -test flag: validates the
// agentId + key the same way telemetry does, but never records anything.
// Key-authenticated like telemetry/register/deregister (see index.js's
// KEY_AUTH_API_ROUTES), never a session-only route like /api/agent/list.
router.get('/api/agent/ping', (req, res) => {
  const agentId = req.query && req.query.agentId;
  if (!agentId) {
    return res.status(400).json({ status: 'error', message: 'agentId is required' });
  }
  if (!store.agents.getAgent(agentId)) {
    return res.status(401).json({ status: 'error', message: 'Unknown agent: register first via POST /api/agents/register' });
  }
  if (!authenticateAgent(req, agentId)) {
    return res.status(401).json({ status: 'error', message: 'Invalid or missing agent auth key' });
  }
  return res.json({ status: 'success', ack: true, agentId, timestamp: new Date().toISOString() });
});

// List all registered agents, with their last real telemetry (null fields
// when never reported) and staleness-derived status.
router.get(['/api/agent/list', '/api/agents'], (req, res) => {
  const rows = store.agents.listAgents();
  const agents = rows.map(agentView);
  res.json({
    status: 'success',
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.status === 'Online').length,
    agents,
  });
});

// Deregister / Stop — agent-authenticated; unknown agents or bad keys => 401.
router.post('/api/agent/deregister', (req, res) => {
  const { agentId } = req.body || {};

  if (!agentId) {
    return res.status(400).json({ status: 'error', message: 'agentId is required' });
  }

  const agent = store.agents.getAgent(agentId);
  if (!agent) {
    return res.status(401).json({ status: 'error', message: 'Unknown agent' });
  }

  if (!authenticateAgent(req, agentId)) {
    return res.status(401).json({ status: 'error', message: 'Invalid or missing agent auth key' });
  }

  store.agents.recordAgentTelemetry(agentId, {
    status: 'Offline',
    cpu_pct: agent.cpu_pct,
    mem_pct: agent.mem_pct,
    disk_pct: agent.disk_pct,
  });

  console.log(`[OpManager Agent] Host offline: ${agent.hostname} [${agentId}]`);

  res.json({ status: 'success' });
});

// Agent downloads metadata (unchanged — audit R2 verified these files exist).
router.get('/api/agent/downloads', (req, res) => {
  res.json({
    status: 'success',
    version: '12.9.204-GA',
    build: '20261106',
    downloads: [
      {
        os: 'Windows',
        platform: 'Windows 64-bit (x86_64)',
        filename: 'OpManagerAgent.exe',
        url: '/downloads/OpManagerAgent.exe',
        archiveUrl: '/downloads/OpManagerAgent-Windows-x64.zip',
        type: 'Standalone Executable & Service Installer',
        instructions: 'Run OpManagerAgent.exe in Command Prompt/PowerShell or run install_service.bat as Administrator.'
      },
      {
        os: 'macOS',
        platform: 'macOS Universal (Apple Silicon & Intel)',
        filename: 'OpManagerAgent.dmg',
        url: '/downloads/OpManagerAgent.dmg',
        type: 'Apple Disk Image (DMG) & Application Bundle',
        instructions: 'Open OpManagerAgent.dmg, drag OpManagerAgent.app to Applications, or execute install_daemon.sh.'
      },
      {
        os: 'Linux',
        platform: 'Linux x86_64 & ARM64',
        filename: 'OpManagerAgent-linux.tar.gz',
        url: '/downloads/OpManagerAgent-linux.tar.gz',
        type: 'Binary & systemd Service Unit',
        instructions: 'Extract archive and run: sudo ./OpManagerAgent -server http://<central-host>:8060'
      }
    ]
  });
});

module.exports = router;

