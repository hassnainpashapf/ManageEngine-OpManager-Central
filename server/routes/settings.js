'use strict';
/**
 * Settings routes — real-data rebuild (real-data branch).
 *
 * Rules enforced here (see audit: opm-check/real-data/audit/alarms-reports-settings.md S1–S28
 * and opm-check/real-data/audit/auth.md A-16):
 *  - No canned constants: every value comes from the live runtime (os/process),
 *    the real SQLite store (server/services/store.js), or settings actually
 *    persisted in that store. Absent data is null / [] / false, never invented.
 *  - No module-level `let` persistence: POSTs write to store.settings.
 *  - API keys: generated with crypto.randomBytes, only the SHA-256 hash is
 *    stored, the plaintext is returned once at creation/rotation.
 *  - Tests either perform a real check or return honest 501 {error:'not_implemented'}.
 *  - DB backup is a real VACUUM INTO file; vacuum is a real VACUUM + ANALYZE.
 *  - No JVM, no Postgres, no macOS values anywhere in this file.
 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const path = require('path');
const tls = require('tls');
const { execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const store = require('../services/store');
const retention = require('../services/retention');
const wsEvents = require('../services/wsEvents');
const ldapSvc = require('../services/ldap');
const { hashPassword } = require('../services/session');

const router = express.Router();

const DB_PATH =
  process.env.OPMANAGER_DB_PATH ||
  path.join(__dirname, '..', 'data', 'opmanager.db');
const LOG_DIRS = [
  path.join(__dirname, '..', 'logs'),
  path.join(__dirname, '..', 'data', 'logs'),
];
const SIF_DIR = path.join(__dirname, '..', 'data', 'sif');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

let pkg = {};
try {
  pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
} catch { /* version/build stay null */ }

// Build metadata for GET /admin/getNewFeatures (HE-1, phase 5).
// Precedence: live git checkout (rev-parse HEAD + log date) > baked
// server/build-info.json (generated at packaging time from the same
// commands — regenerate with:
//   node -e "const {execSync}=require('child_process');const fs=require('fs');fs.writeFileSync('server/build-info.json',JSON.stringify({version:require('./package.json').version,commit:execSync('git rev-parse HEAD').toString().trim(),commitDate:execSync('git log -1 --format=%cI').toString().trim(),branch:execSync('git rev-parse --abbrev-ref HEAD').toString().trim()},null,2)+'\n')"
// ) > nulls. No git in the packaged image → the baked file is used;
// no baked file either → build/commit/date stay null, never invented.
let buildInfo = null;
try {
  buildInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'build-info.json'), 'utf8'));
} catch { /* build metadata stays null unless git below fills it in */ }
try {
  const repoRoot = path.join(__dirname, '..', '..');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, timeout: 5000, encoding: 'utf8' }).trim();
  const commitDate = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: repoRoot, timeout: 5000, encoding: 'utf8' }).trim();
  if (/^[0-9a-f]{40}$/.test(commit) && commitDate) {
    buildInfo = {
      ...(buildInfo || {}),
      version: (buildInfo && buildInfo.version) || pkg.version || null,
      commit,
      commitDate,
    };
  }
} catch { /* not a git checkout (packaged build): keep the baked file */ }

const SERVER_PORT = Number(process.env.PORT) || 8060;
const NOT_IMPLEMENTED = (message) => ({
  status: 'error',
  error: 'not_implemented',
  message,
});

// ------------------------------------------------------------ helpers ---

function getStored(key) {
  const raw = store.getSetting(key);
  if (raw === null || raw === undefined) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

function putStored(key, value) {
  store.setSetting(key, value);
  return value;
}

function auditLog(action, detail) {
  try { store.log(null, action, detail); } catch { /* audit must never break the request */ }
}

function primaryIPv4() {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return null;
}

function humanSize(bytes) {
  if (bytes === null || bytes === undefined) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function stamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Strip secret-bearing keys (passwords, tokens, private keys) from a stored object before returning it. */
const SECRET_KEY = /(password|passwd|secret|private[_-]?key|token)/i;
function publicCopy(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!SECRET_KEY.test(k)) out[k] = v;
  }
  return out;
}

/**
 * Public view of a stored credential-library row (audit L2 fix, close-out
 * 2026-11-09): the SNMP community string is a credential — it is never
 * returned. `communityConfigured` says only whether one is stored.
 * The community itself stays stored server-side (the poller / credential
 * test read the raw row); only API responses are masked. No client code
 * reads `community` from this endpoint (the UI shows name/protocol only).
 */
function publicCredential(c) {
  const out = publicCopy(c);
  if (out && typeof out === 'object') {
    out.communityConfigured = Boolean(c && c.community);
    out.community = null;
  }
  return out;
}

function hasSecret(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.keys(obj).some((k) => SECRET_KEY.test(k));
}

/**
 * Strip secret-bearing keys before PERSISTING an object. The bind
 * password is never stored: callers supply it per call (test body /
 * x-ldap-bind-password header) or via the LDAP_BIND_PASSWORD env var.
 */
function stripSecrets(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!SECRET_KEY.test(k)) out[k] = v;
  }
  return out;
}

/** Real SQLite stats: table count + total rows across all tables. */
function sqliteStats() {
  let conn = null;
  try {
    conn = new DatabaseSync(DB_PATH, { readOnly: true });
    const tables = conn
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all();
    let totalRecords = 0;
    for (const t of tables) {
      const row = conn.prepare(`SELECT COUNT(*) AS n FROM "${t.name.replace(/"/g, '""')}"`).get();
      totalRecords += row.n;
    }
    return { tableCount: tables.length, totalRecords };
  } catch {
    return { tableCount: null, totalRecords: null };
  } finally {
    if (conn) conn.close();
  }
}

function dbFileSize() {
  try { return fs.statSync(DB_PATH).size; } catch { return null; }
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// ------------------------------------------------------------- central ---

router.get('/api/settings/central', (req, res) => {
  const size = dbFileSize();
  res.json({
    status: 'success',
    central: {
      serverName: os.hostname(),
      productName: 'ManageEngine OpManager Central',
      version: pkg.version || null,
      buildNumber: null,
      host: primaryIPv4(),
      ip: primaryIPv4(),
      port: SERVER_PORT,
      status: 'Running',
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      managedProbesCount: store.listProbes().length,
      totalDevicesCount: store.listDevices().length,
      apiKey: null,
      dbType: 'SQLite (node:sqlite)',
      dbPath: DB_PATH,
      dbSizeBytes: size,
      haStatus: (() => {
        try {
          return require('../services/ha').getStatusSummary();
        } catch {
          return null;
        }
      })(),
    },
  });
});

// --------------------------------------------------------- credentials ---

router.get('/api/settings/credentials', (req, res) => {
  res.json({
    status: 'success',
    credentials: store.listCredentials().map((c) => publicCredential(c)),
  });
});

router.post('/api/settings/credentials', (req, res) => {
  const { name, type } = req.body || {};
  if (!name || !type) {
    return res.status(400).json({ status: 'error', message: 'Name and type are required' });
  }
  const created = store.createCredential(req.body);
  auditLog('settings.credential.create', { id: created.id, name: created.name });
  res.status(201).json({
    status: 'success',
    message: `Credential ${created.name} added to Central library`,
    credential: publicCredential(created),
  });
});

// ----------------------------------------------------------- templates ---
// Device-template catalogue: server/services/templateIndex.js over
// server/data/templates/index.json — 562 real entries parsed from the
// on-disk vendor XML template library (7,602 sysOIDs). The index is
// required lazily (same pattern as server/routes/devices.js loadService)
// so this router still loads if the service has not landed; reads then
// honestly 501. The vendor index itself is READ-ONLY (generated from the
// XML library), so vendor entries can never be edited or deleted here.
// Operator-created templates live in a separate local write store —
// settings key 'templates.custom' (SQLite, via store.settings) — and are
// merged into every read, marked custom:true. Custom templates may carry
// thresholds ({ cpuWarn, cpuCrit, memWarn, memCrit }, percentages) and a
// pollIntervalSec (seconds, 10–3600); vendor index entries carry neither
// (the XML library has no threshold data), so a vendor template applies
// with null fields unless the apply call supplies overrides.
// Applying a template (POST /api/settings/templates/apply) resolves those
// values into the device's canonical appliedTemplate —
// { templateId, thresholds: { cpuWarn, cpuCrit, memWarn, memCrit },
//   pollIntervalSec } (SHARED.md) — and persists it on the device row
// (devices.applied_template, JSON text). The assignment is ALSO recorded
// in settings key 'templates.assignments' (device id -> { deviceId,
// templateName, appliedTemplate, appliedAt }) as the audit trail.
// GET /api/settings/templates/applied/:deviceId returns the stored
// appliedTemplate plus the effective values (template fields over the
// per-device threshold overrides over the poller defaults, and the
// template interval over the global poll interval), resolved by the same
// rules the poller uses (see effectiveForDevice below).
// findBySysOid also matches the two sysOidMap files themselves, so
// sysOid lookups filter to type devicetemplate/vendor.

const TEMPLATES_UNAVAILABLE =
  'Device templates are not available in this build: no template store exists yet.';

function loadTemplateIndex() {
  try {
    return require('../services/templateIndex');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

function templateIndexOr501(res) {
  const idx = loadTemplateIndex();
  if (!idx) {
    res.status(501).json({ status: 'error', ...NOT_IMPLEMENTED(TEMPLATES_UNAVAILABLE) });
    return null;
  }
  return idx;
}

/** Operator-created templates, persisted in the settings store. */
function listCustomTemplates() {
  const stored = getStored('templates.custom');
  return Array.isArray(stored) ? stored : [];
}

function saveCustomTemplates(list) {
  putStored('templates.custom', list);
  return list;
}

function normTemplateName(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

function findCustomTemplate(name) {
  const wanted = normTemplateName(name);
  if (!wanted) return null;
  return listCustomTemplates().find((t) => normTemplateName(t.name) === wanted) || null;
}

/** Vendor index entries plus operator-created templates (marked custom:true). */
function allTemplates(filter) {
  const idx = loadTemplateIndex();
  const vendor = idx ? idx.listTemplates(filter || {}) : [];
  return [...listCustomTemplates(), ...vendor];
}

function findTemplateAnywhere(name) {
  return findCustomTemplate(name) || (loadTemplateIndex() && loadTemplateIndex().getTemplate(name)) || null;
}

function templateAssignments() {
  const stored = getStored('templates.assignments');
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

function saveTemplateAssignments(map) {
  putStored('templates.assignments', map);
  return map;
}

// --- Applied-template resolution (canonical shape, SHARED.md) ---
// The poller is the consumer of device.appliedTemplate and the single
// source of truth for the default thresholds and the lower resolution
// layers (per-device overrides, global poll interval). It is required
// lazily (same pattern as loadTemplateIndex) so this router still loads
// if the service is absent; the literal defaults below are used only
// then. NOTE: this build's poller (ff51df6) does not yet read
// appliedTemplate — the tpl-consume track adds that. Until it lands, the
// effective values returned here are what the poller WILL use once it
// does, resolved by exactly the rules its resolveDeviceThresholds uses
// for the lower layers plus the template overlay documented in its
// header. Reconcile with poller.resolveAppliedTemplate when it lands:
// the route should then call it instead of parseAppliedTemplate.
const TEMPLATE_DEFAULTS = { cpuCritical: 90, cpuTrouble: 80, memCritical: 90, memTrouble: null };
const DEFAULT_POLL_INTERVAL_SECONDS = 60;
const MIN_POLL_INTERVAL_SECONDS = 10;
const MAX_POLL_INTERVAL_SECONDS = 3600;

function loadPoller() {
  try {
    return require('../services/poller');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

/** Parse one threshold value: a finite number (or numeric string) in (0, 100], else null. */
function parsePct(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

// Canonical camelCase plus the device_thresholds snake_case aliases.
const THRESHOLD_KEY_CANON = {
  cpuWarn: 'cpuWarn', cpu_warn: 'cpuWarn', cpu_trouble: 'cpuWarn', cpuTrouble: 'cpuWarn',
  cpuCrit: 'cpuCrit', cpu_crit: 'cpuCrit', cpu_critical: 'cpuCrit', cpuCritical: 'cpuCrit',
  memWarn: 'memWarn', mem_warn: 'memWarn', mem_trouble: 'memWarn', memTrouble: 'memWarn',
  memCrit: 'memCrit', mem_crit: 'memCrit', mem_critical: 'memCrit', memCritical: 'memCrit',
};

/** First unknown key in a thresholds object, or null. Non-objects are not checked here (see isThresholdsObject). */
function unknownThresholdKey(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  for (const k of Object.keys(input)) {
    if (!Object.prototype.hasOwnProperty.call(THRESHOLD_KEY_CANON, k)) return k;
  }
  return null;
}

/** True when a supplied thresholds value is not a plain object (null, string, array, ...). */
function isBadThresholdsValue(input) {
  return input !== undefined && (input === null || typeof input !== 'object' || Array.isArray(input));
}

/**
 * Parse a thresholds object into canonical { cpuWarn, cpuCrit, memWarn,
 * memCrit } (null = absent). Accepts canonical camelCase plus the
 * device_thresholds snake_case aliases. Returns { thresholds, error } —
 * error names the first field whose EXPLICITLY supplied value is not a
 * percentage in (0, 100]; absent fields are null, never an error.
 */
function parseThresholdsInput(input) {
  const src = (input && typeof input === 'object' && !Array.isArray(input)) ? input : {};
  const pick = (...keys) => {
    for (const key of keys) {
      if (src[key] !== undefined && src[key] !== null) return { key, value: src[key] };
    }
    return { key: null, value: undefined };
  };
  const fields = [
    ['cpuWarn', 'cpuWarn', 'cpu_warn', 'cpu_trouble', 'cpuTrouble'],
    ['cpuCrit', 'cpuCrit', 'cpu_crit', 'cpu_critical', 'cpuCritical'],
    ['memWarn', 'memWarn', 'mem_warn', 'mem_trouble', 'memTrouble'],
    ['memCrit', 'memCrit', 'mem_crit', 'mem_critical', 'memCritical'],
  ];
  const thresholds = { cpuWarn: null, cpuCrit: null, memWarn: null, memCrit: null };
  for (const [canonical, ...aliases] of fields) {
    const { key, value } = pick(...aliases);
    if (key === null) continue;
    const parsed = parsePct(value);
    if (parsed === null || parsed <= 0 || parsed > 100) {
      return { thresholds: null, error: `threshold '${key}' must be a percentage greater than 0 and at most 100` };
    }
    thresholds[canonical] = parsed;
  }
  return { thresholds, error: null };
}

/**
 * Parse a poll interval: an integer in [10, 3600] seconds, else null.
 * Returns { pollIntervalSec, error } — error when an EXPLICITLY supplied
 * value is not such an integer; absent input is null, never an error.
 */
function parsePollIntervalInput(value) {
  if (value === undefined || value === null || value === '') return { pollIntervalSec: null, error: null };
  const n = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN);
  if (!Number.isInteger(n) || n < MIN_POLL_INTERVAL_SECONDS || n > MAX_POLL_INTERVAL_SECONDS) {
    return { pollIntervalSec: null, error: `pollIntervalSec must be an integer between ${MIN_POLL_INTERVAL_SECONDS} and ${MAX_POLL_INTERVAL_SECONDS} seconds` };
  }
  return { pollIntervalSec: n, error: null };
}

/** Thresholds carried by a template object itself (null fields = absent). */
function templateThresholds(template) {
  if (!template || typeof template !== 'object') return { cpuWarn: null, cpuCrit: null, memWarn: null, memCrit: null };
  const { thresholds } = parseThresholdsInput(template.thresholds);
  return thresholds || { cpuWarn: null, cpuCrit: null, memWarn: null, memCrit: null };
}

/** Poll interval carried by a template object itself (null = absent).
 * Reads pollIntervalSec / poll_interval_sec first, then the vendor
 * template's `poll` field (e.g. "300s") — tpl-consume's fallback, kept
 * so vendor templates still carry their interval into an apply. */
function templatePollInterval(template) {
  if (!template || typeof template !== 'object') return null;
  const { pollIntervalSec } = parsePollIntervalInput(
    template.pollIntervalSec !== undefined ? template.pollIntervalSec : template.poll_interval_sec,
  );
  if (pollIntervalSec !== null) return pollIntervalSec;
  if (template.poll === null || template.poll === undefined) return null;
  if (typeof template.poll === 'number' && Number.isFinite(template.poll)) {
    const n = Math.floor(template.poll);
    return n >= MIN_POLL_INTERVAL_SECONDS && n <= MAX_POLL_INTERVAL_SECONDS ? n : null;
  }
  const m = /^\s*(\d+)\s*s?\s*$/i.exec(String(template.poll));
  if (!m) return null;
  const n = Number(m[1]);
  return n >= MIN_POLL_INTERVAL_SECONDS && n <= MAX_POLL_INTERVAL_SECONDS ? n : null;
}

/**
 * Resolve the canonical appliedTemplate for an apply call. Precedence,
 * field by field: explicit overrides in the apply body, then the
 * template's own fields. Returns { appliedTemplate, error } — error is
 * a 400 message when an explicitly supplied value is invalid or the
 * merged warn/crit pair is inverted (warn >= crit with both present).
 */
function resolveAppliedTemplate(template, body) {
  if (isBadThresholdsValue(body && body.thresholds)) {
    return { appliedTemplate: null, error: 'thresholds must be an object' };
  }
  const unknown = unknownThresholdKey(body && body.thresholds);
  if (unknown !== null) {
    return { appliedTemplate: null, error: `Unknown threshold field: ${unknown}` };
  }
  const bodyThresholds = parseThresholdsInput(body && body.thresholds);
  if (bodyThresholds.error) return { appliedTemplate: null, error: bodyThresholds.error };
  const bodyInterval = parsePollIntervalInput(body && (body.pollIntervalSec !== undefined ? body.pollIntervalSec : body.poll_interval_sec));
  if (bodyInterval.error) return { appliedTemplate: null, error: bodyInterval.error };
  const fromTemplate = templateThresholds(template);
  const thresholds = {
    cpuWarn: bodyThresholds.thresholds.cpuWarn ?? fromTemplate.cpuWarn,
    cpuCrit: bodyThresholds.thresholds.cpuCrit ?? fromTemplate.cpuCrit,
    memWarn: bodyThresholds.thresholds.memWarn ?? fromTemplate.memWarn,
    memCrit: bodyThresholds.thresholds.memCrit ?? fromTemplate.memCrit,
  };
  if (thresholds.cpuWarn !== null && thresholds.cpuCrit !== null && thresholds.cpuWarn >= thresholds.cpuCrit) {
    return { appliedTemplate: null, error: 'cpuWarn must be below cpuCrit' };
  }
  if (thresholds.memWarn !== null && thresholds.memCrit !== null && thresholds.memWarn >= thresholds.memCrit) {
    return { appliedTemplate: null, error: 'memWarn must be below memCrit' };
  }
  const pollIntervalSec = bodyInterval.pollIntervalSec ?? templatePollInterval(template);
  return {
    appliedTemplate: { templateId: template.id || template.name, thresholds, pollIntervalSec },
    error: null,
  };
}

/** Parse a stored device row's applied_template (JSON text) into the canonical object, or null. */
function parseStoredAppliedTemplate(device) {
  if (!device) return null;
  const raw = device.appliedTemplate !== undefined ? device.appliedTemplate : device.applied_template;
  if (raw === null || raw === undefined || raw === '') return null;
  let obj = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch { return null; }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const { thresholds } = parseThresholdsInput(obj.thresholds);
  const { pollIntervalSec } = parsePollIntervalInput(
    obj.pollIntervalSec !== undefined ? obj.pollIntervalSec : obj.poll_interval_sec,
  );
  const templateId = obj.templateId != null ? String(obj.templateId)
    : (obj.templateName != null ? String(obj.templateName) : null);
  if (!templateId && Object.values(thresholds).every((v) => v === null) && pollIntervalSec === null) return null;
  return { templateId, thresholds, pollIntervalSec };
}

/** Global poll interval from the store setting, default 60 s, clamped to 10–3600 s. */
function globalPollIntervalSec() {
  try {
    const raw = store.getSetting('poll_interval_seconds');
    const seconds = Number(raw && typeof raw === 'object' ? raw.value : raw);
    if (Number.isFinite(seconds) && seconds >= MIN_POLL_INTERVAL_SECONDS && seconds <= MAX_POLL_INTERVAL_SECONDS) {
      return Math.floor(seconds);
    }
  } catch { /* fall through to the default */ }
  return DEFAULT_POLL_INTERVAL_SECONDS;
}

/**
 * Effective values for a device: the applied template's fields, then the
 * per-device threshold overrides / poller defaults, field by field.
 * Same rules as the poller: a merged cpu_trouble >= cpu_critical falls
 * both back to the defaults; a merged mem_trouble >= mem_critical drops
 * just the mem warning level (the defaults have none).
 * Returns { thresholds: { cpuWarn, cpuCrit, memWarn, memCrit }, pollIntervalSec }.
 */
function effectiveForDevice(device, appliedTemplate) {
  const poller = loadPoller();
  const defaults = (poller && poller.DEFAULT_THRESHOLDS)
    ? {
      cpuCritical: poller.DEFAULT_THRESHOLDS.cpuCritical,
      cpuTrouble: poller.DEFAULT_THRESHOLDS.cpuTrouble,
      memCritical: poller.DEFAULT_THRESHOLDS.memCritical,
      memTrouble: poller.DEFAULT_THRESHOLDS.memTrouble ?? null,
    }
    : { ...TEMPLATE_DEFAULTS };
  let base = { ...defaults };
  try {
    if (poller && typeof poller.resolveDeviceThresholds === 'function') {
      const t = poller.resolveDeviceThresholds(store, device.id);
      base = {
        cpuCritical: t.cpuCritical,
        cpuTrouble: t.cpuTrouble,
        memCritical: t.memCritical,
        memTrouble: t.memTrouble ?? null,
      };
    }
  } catch { /* lower layers unavailable; defaults stand */ }
  const tpl = appliedTemplate || parseStoredAppliedTemplate(device);
  if (tpl) {
    if (tpl.thresholds.cpuCrit !== null) base.cpuCritical = tpl.thresholds.cpuCrit;
    if (tpl.thresholds.cpuWarn !== null) base.cpuTrouble = tpl.thresholds.cpuWarn;
    if (tpl.thresholds.memCrit !== null) base.memCritical = tpl.thresholds.memCrit;
    if (tpl.thresholds.memWarn !== null) base.memTrouble = tpl.thresholds.memWarn;
  }
  if (base.cpuTrouble >= base.cpuCritical) {
    base.cpuCritical = defaults.cpuCritical;
    base.cpuTrouble = defaults.cpuTrouble;
  }
  if (base.memTrouble !== null && base.memTrouble >= base.memCritical) {
    base.memTrouble = null;
  }
  return {
    thresholds: {
      cpuWarn: base.cpuTrouble,
      cpuCrit: base.cpuCritical,
      memWarn: base.memTrouble,
      memCrit: base.memCritical,
    },
    pollIntervalSec: (tpl && tpl.pollIntervalSec !== null) ? tpl.pollIntervalSec : globalPollIntervalSec(),
  };
}

/** Device templates only: drop the sysOidMap files findBySysOid also matches. */
function deviceTemplates(entries) {
  return (entries || []).filter((t) => t.type === 'devicetemplate' || t.type === 'vendor');
}

router.get('/api/settings/templates', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const templates = allTemplates({ vendor: req.query.vendor, type: req.query.type });
  res.json({ status: 'success', templates, count: templates.length, total: allTemplates({}).length });
});

function templatesBySysOid(req, res) {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const sysOid = req.params.oid || req.query.sysOid || req.query.oid || '';
  if (!String(sysOid).trim()) {
    return res.status(400).json({ status: 'error', message: 'sysOid query parameter is required' });
  }
  const wanted = String(sysOid).trim();
  const normOid = (o) => {
    const s = String(o == null ? '' : o).trim();
    return s.startsWith('.') ? s : `.${s}`;
  };
  const fromIndex = deviceTemplates(idx.findBySysOid(sysOid));
  const fromCustom = listCustomTemplates().filter((t) => {
    const oids = [...(Array.isArray(t.sysOids) ? t.sysOids : []), t.sysOid].filter(Boolean);
    return oids.some((o) => normOid(o) === normOid(wanted));
  });
  const templates = [...fromCustom, ...fromIndex];
  res.json({ status: 'success', sysOid: String(sysOid), templates, count: templates.length });
}

// Registered before /:name so 'by-sysoid' is not treated as a template name.
router.get('/api/settings/templates/by-sysoid', templatesBySysOid);
router.get('/api/settings/templates/by-sysoid/:oid', templatesBySysOid);

router.get('/api/settings/templates/:name', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const template = findTemplateAnywhere(req.params.name);
  if (!template) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Device template not found: ${req.params.name}`,
      template: null,
    });
  }
  res.json({ status: 'success', template });
});

// Create an operator template in the local write store. Vendor index
// entries are read-only and a name collision with one is a 409.
router.post('/api/settings/templates', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const body = req.body || {};
  const name = String(body.name || '').trim();
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Template name is required' });
  }
  if (idx.getTemplate(name)) {
    return res.status(409).json({
      status: 'error',
      error: 'conflict',
      message: `A vendor template named '${name}' already exists; vendor templates are read-only.`,
    });
  }
  if (findCustomTemplate(name)) {
    return res.status(409).json({
      status: 'error',
      error: 'conflict',
      message: `A custom template named '${name}' already exists.`,
    });
  }
  const parsedThresholds = parseThresholdsInput(body.thresholds);
  if (isBadThresholdsValue(body.thresholds)) {
    return res.status(400).json({ status: 'error', message: 'thresholds must be an object' });
  }
  const unknownKey = unknownThresholdKey(body.thresholds);
  if (unknownKey !== null) {
    return res.status(400).json({ status: 'error', message: `Unknown threshold field: ${unknownKey}` });
  }
  if (parsedThresholds.error) {
    return res.status(400).json({ status: 'error', message: parsedThresholds.error });
  }
  const parsedInterval = parsePollIntervalInput(body.pollIntervalSec !== undefined ? body.pollIntervalSec : body.poll_interval_sec);
  if (parsedInterval.error) {
    return res.status(400).json({ status: 'error', message: parsedInterval.error });
  }
  if (parsedThresholds.thresholds.cpuWarn !== null && parsedThresholds.thresholds.cpuCrit !== null
    && parsedThresholds.thresholds.cpuWarn >= parsedThresholds.thresholds.cpuCrit) {
    return res.status(400).json({ status: 'error', message: 'cpuWarn must be below cpuCrit' });
  }
  if (parsedThresholds.thresholds.memWarn !== null && parsedThresholds.thresholds.memCrit !== null
    && parsedThresholds.thresholds.memWarn >= parsedThresholds.thresholds.memCrit) {
    return res.status(400).json({ status: 'error', message: 'memWarn must be below memCrit' });
  }
  const created = {
    name,
    vendor: body.vendor != null ? String(body.vendor) : null,
    sysOid: body.sysOid != null ? String(body.sysOid) : null,
    sysOids: Array.isArray(body.sysOids) ? body.sysOids.map(String) : [],
    type: body.type != null ? String(body.type) : 'devicetemplate',
    monitors: Array.isArray(body.monitors) ? body.monitors.map(String) : [],
    category: body.category != null ? String(body.category) : null,
    osType: body.osType != null ? String(body.osType) : null,
    // Thresholds + poll interval the template carries into an apply
    // (canonical shape). Null fields mean "no value set": the apply
    // falls through to the per-device overrides / defaults.
    thresholds: parsedThresholds.thresholds,
    pollIntervalSec: parsedInterval.pollIntervalSec,
    file: null,
    custom: true,
    createdAt: new Date().toISOString(),
  };
  const list = listCustomTemplates();
  list.push(created);
  saveCustomTemplates(list);
  auditLog('settings.template.create', { name: created.name });
  res.status(201).json({
    status: 'success',
    message: `Custom device template '${created.name}' created in the local template store.`,
    template: created,
  });
});

// Update an operator template. Vendor index entries are read-only (409);
// unknown names 404. The template name itself is immutable.
router.put('/api/settings/templates/:id', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const id = decodeURIComponent(req.params.id || '');
  if (idx.getTemplate(id)) {
    return res.status(409).json({
      status: 'error',
      error: 'conflict',
      message: `Vendor template '${id}' is read-only; only operator-created templates can be updated.`,
    });
  }
  const list = listCustomTemplates();
  const pos = list.findIndex((t) => normTemplateName(t.name) === normTemplateName(id));
  if (pos === -1) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Custom device template not found: ${id}`,
    });
  }
  const body = req.body || {};
  if (body.name != null && normTemplateName(body.name) !== normTemplateName(id)) {
    return res.status(400).json({ status: 'error', message: 'Template name cannot be changed' });
  }
  const updated = { ...list[pos] };
  for (const key of ['vendor', 'sysOid', 'type', 'category', 'osType']) {
    if (body[key] !== undefined) updated[key] = body[key] == null ? null : String(body[key]);
  }
  for (const key of ['sysOids', 'monitors']) {
    if (body[key] !== undefined) {
      if (!Array.isArray(body[key])) {
        return res.status(400).json({ status: 'error', message: `${key} must be an array` });
      }
      updated[key] = body[key].map(String);
    }
  }
  if (body.thresholds !== undefined) {
    if (isBadThresholdsValue(body.thresholds)) {
      return res.status(400).json({ status: 'error', message: 'thresholds must be an object' });
    }
    const unknownKey = unknownThresholdKey(body.thresholds);
    if (unknownKey !== null) {
      return res.status(400).json({ status: 'error', message: `Unknown threshold field: ${unknownKey}` });
    }
    const parsed = parseThresholdsInput(body.thresholds);
    if (parsed.error) {
      return res.status(400).json({ status: 'error', message: parsed.error });
    }
    // Merge: only the fields supplied change; the rest keep their value
    // (or null). An explicitly null field clears that threshold.
    const merged = { ...(updated.thresholds || { cpuWarn: null, cpuCrit: null, memWarn: null, memCrit: null }) };
    for (const [k, v] of Object.entries(body.thresholds || {})) {
      const canon = THRESHOLD_KEY_CANON[k];
      if (v === null) { merged[canon] = null; continue; }
      const pct = parsePct(v);
      if (pct === null || pct <= 0 || pct > 100) {
        return res.status(400).json({ status: 'error', message: `threshold '${k}' must be a percentage greater than 0 and at most 100` });
      }
      merged[canon] = pct;
    }
    if (merged.cpuWarn !== null && merged.cpuCrit !== null && merged.cpuWarn >= merged.cpuCrit) {
      return res.status(400).json({ status: 'error', message: 'cpuWarn must be below cpuCrit' });
    }
    if (merged.memWarn !== null && merged.memCrit !== null && merged.memWarn >= merged.memCrit) {
      return res.status(400).json({ status: 'error', message: 'memWarn must be below memCrit' });
    }
    updated.thresholds = merged;
  }
  if (body.pollIntervalSec !== undefined || body.poll_interval_sec !== undefined) {
    const parsed = parsePollIntervalInput(body.pollIntervalSec !== undefined ? body.pollIntervalSec : body.poll_interval_sec);
    if (parsed.error) {
      return res.status(400).json({ status: 'error', message: parsed.error });
    }
    updated.pollIntervalSec = parsed.pollIntervalSec;
  }
  updated.updatedAt = new Date().toISOString();
  list[pos] = updated;
  saveCustomTemplates(list);
  auditLog('settings.template.update', { name: updated.name });
  res.json({
    status: 'success',
    message: `Custom device template '${updated.name}' updated.`,
    template: updated,
  });
});

// Apply a template to a device: resolves the template's thresholds +
// poll interval into the device's canonical appliedTemplate
// ({ templateId, thresholds: { cpuWarn, cpuCrit, memWarn, memCrit },
//   pollIntervalSec }) and persists it on the device row
// (devices.applied_template). The device and the template must both
// exist (404 otherwise). Explicit thresholds / pollIntervalSec in the
// request body override the template's own values, field by field.
// The assignment is also recorded in the local store (settings key
// 'templates.assignments') as the audit trail. The response returns the
// stored appliedTemplate plus the effective values (template fields over
// the per-device threshold overrides over the poller defaults, and the
// template interval over the global poll interval).
router.post('/api/settings/templates/apply', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const body = req.body || {};
  const templateName = String(body.templateName || body.template || body.name || '').trim();
  const deviceId = body.deviceId != null ? Number(body.deviceId) : (body.device != null ? Number(body.device) : NaN);
  if (!templateName) {
    return res.status(400).json({ status: 'error', message: 'templateName is required' });
  }
  if (!Number.isInteger(deviceId)) {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const template = findTemplateAnywhere(templateName);
  if (!template) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Device template not found: ${templateName}`,
    });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Device not found: ${deviceId}`,
    });
  }
  const { appliedTemplate, error } = resolveAppliedTemplate(template, body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }
  const updatedDevice = store.updateDevice(deviceId, { applied_template: JSON.stringify(appliedTemplate) });
  if (!updatedDevice) {
    return res.status(500).json({ status: 'error', message: `Failed to persist the applied template on device ${deviceId}` });
  }
  const effective = effectiveForDevice(updatedDevice, appliedTemplate);
  const map = templateAssignments();
  const assignment = {
    deviceId,
    deviceIp: device.ip || null,
    deviceHostname: device.hostname || device.sys_name || null,
    templateName: template.name,
    templateId: appliedTemplate.templateId,
    custom: Boolean(template.custom),
    appliedTemplate,
    appliedAt: new Date().toISOString(),
  };
  map[String(deviceId)] = assignment;
  saveTemplateAssignments(map);
  auditLog('settings.template.apply', { deviceId, templateName: template.name, templateId: appliedTemplate.templateId });
  // Phase-3 ws-events: broadcast the real apply, with the device and the
  // effective thresholds / poll interval as resolved at apply time (the
  // merged `effective` above already overlays the template on the
  // per-device overrides / defaults). Emitted after the assignment is
  // persisted, so a client that reads back the assignment sees exactly
  // what the event describes.
  let customized = false;
  try {
    customized = Boolean(store.thresholds && typeof store.thresholds.getDeviceThresholds === 'function' && store.thresholds.getDeviceThresholds(deviceId));
  } catch (e) { customized = false; }
  wsEvents.emitTemplateApplied({
    device: { id: device.id, ip: device.ip || null, hostname: device.hostname || device.sys_name || null },
    templateName: template.name,
    custom: Boolean(template.custom),
    appliedAt: assignment.appliedAt,
    thresholds: effective.thresholds,
    customized,
    pollIntervalSec: effective.pollIntervalSec,
  });
  res.json({
    status: 'success',
    message: `Template '${template.name}' applied to device ${deviceId}.`,
    assignment,
    appliedTemplate,
    effective,
  });
});

// Remove a template from a device (tpl-consume): clears
// devices.applied_template and the recorded assignment, so the poller
// falls back to the device's stored thresholds (if any) and then the
// defaults, and to the global poll interval, from the next poll.
router.delete('/api/settings/templates/apply/:deviceId', (req, res) => {
  const deviceId = Number(req.params.deviceId);
  if (!Number.isInteger(deviceId)) {
    return res.status(400).json({ status: 'error', message: 'deviceId is required' });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Device not found: ${deviceId}`,
    });
  }
  const hadTemplate = Boolean(device.applied_template);
  try {
    store.devices.updateDevice(deviceId, { applied_template: null });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Template could not be removed from device ${deviceId}: ${err.message}`,
    });
  }
  const map = templateAssignments();
  delete map[String(deviceId)];
  saveTemplateAssignments(map);
  auditLog('settings.template.unapply', { deviceId });
  res.json({
    status: 'success',
    message: hadTemplate
      ? `Template removed from device ${deviceId}; poller defaults (or the device's stored thresholds) apply from the next poll.`
      : `Device ${deviceId} had no template applied; poller defaults already apply.`,
    deviceId,
    hadTemplate,
    appliedTemplate: null,
  });
});

// The device's effective applied template: the stored appliedTemplate
// plus the effective thresholds / poll interval (template fields over
// the per-device overrides over the poller defaults). 404 when the
// device does not exist; appliedTemplate is null when no template has
// been applied (effective values then come from the overrides/defaults
// alone). Registered before /:name so 'applied' is not read as a name.
router.get('/api/settings/templates/applied/:deviceId', (req, res) => {
  const idx = templateIndexOr501(res);
  if (!idx) return;
  const deviceId = Number(req.params.deviceId);
  if (!Number.isInteger(deviceId)) {
    return res.status(400).json({ status: 'error', message: 'deviceId must be an integer' });
  }
  const device = store.getDevice(deviceId);
  if (!device) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Device not found: ${deviceId}`,
    });
  }
  const appliedTemplate = parseStoredAppliedTemplate(device);
  const effective = effectiveForDevice(device, appliedTemplate);
  const template = appliedTemplate && appliedTemplate.templateId
    ? findTemplateAnywhere(appliedTemplate.templateId)
    : null;
  res.json({
    status: 'success',
    deviceId: device.id,
    deviceIp: device.ip || null,
    deviceHostname: device.hostname || device.sys_name || null,
    appliedTemplate,
    template: template || null,
    effective,
  });
});

// --------------------------------------------------- mail configured? ---

router.get(['/admin/isMailServerConfigured', '/api/admin/isMailServerConfigured'], (req, res) => {
  const m = getStored('mail');
  res.json({ isConfigured: Boolean(m && m.host), server: (m && m.host) || null, port: (m && m.port) || null });
});

router.get(['/admin/GetNFACentralMailServerSettings', '/api/admin/GetNFACentralMailServerSettings'], (req, res) => {
  const m = getStored('mail');
  res.json({ isConfigured: Boolean(m && m.host) });
});

// --------------------------------------------------------- notifications ---
// Real notification store (HE-1, phase 5): rows are written ONLY by real
// events — alarm raised/cleared (server/services/store.js), discovery run
// finished (store.saveDiscoveryRun), configuration backup finished
// (server/routes/ccm.js). Nothing is seeded, so an empty store means an
// honestly empty list. Shape kept: alarm events → webAlarmNotification,
// scheduled-job events (discovery, backup) → scheduleNotification,
// upgradeNotification stays null — no upgrade event exists in this build.

function unreadNotifications() {
  const list =
    store.notifications && typeof store.notifications.listUnreadNotifications === 'function'
      ? store.notifications.listUnreadNotifications(100)
      : store.listUnreadNotifications(100);
  return Array.isArray(list) ? list : [];
}

function notificationView(n) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message ?? null,
    refType: n.ref_type ?? null,
    refId: n.ref_id ?? null,
    createdAt: n.created_at ? new Date(n.created_at).toISOString() : null,
    status: n.status,
  };
}

router.get(['/dashboard/getUserNotification', '/api/dashboard/getUserNotification'], (req, res) => {
  const unread = unreadNotifications();
  res.json({
    webAlarmNotification: unread.filter((n) => n.type === 'alarm').map(notificationView),
    scheduleNotification: unread
      .filter((n) => n.type === 'discovery' || n.type === 'backup')
      .map(notificationView),
    upgradeNotification: null,
    systemAlerts: unread.filter((n) => n.type === 'system').map(notificationView),
  });
});

router.post(['/dashboard/clearUserNotification', '/api/dashboard/clearUserNotification'], (req, res) => {
  const result =
    store.notifications && typeof store.notifications.clearNotifications === 'function'
      ? store.notifications.clearNotifications()
      : store.clearNotifications();
  res.json({ status: 'success', cleared: (result && result.cleared) || 0 });
});

router.post(['/dashboard/hideNotifications', '/api/dashboard/hideNotifications'], (req, res) => {
  const result =
    store.notifications && typeof store.notifications.hideNotifications === 'function'
      ? store.notifications.hideNotifications()
      : store.hideNotifications();
  res.json({ status: 'success', hidden: (result && result.hidden) || 0 });
});

// -------------------------------------------------------------- licence ---
// Licence state is null/absent unless a licence has actually been stored.
// There is no licence validation in this build, so apply() stores only a
// SHA-256 fingerprint of the submitted material and marks it Unvalidated —
// it never claims the key was validated.

function licenceRecord() {
  const stored = getStored('license');
  if (!stored || typeof stored !== 'object') return null;
  return {
    ...stored,
    devicesUsed: store.listDevices().length,
    probesUsed: store.listProbes().length,
    interfacesUsed: null,
  };
}

router.get(['/admin/getBasicLicenseDetails', '/api/admin/getBasicLicenseDetails'], (req, res) => {
  const lic = getStored('license');
  res.json({
    productName: 'ManageEngine OpManager Central',
    licenseType: (lic && lic.licenseType) || null,
    licenseUser: null,
    registeredTo: null,
    version: pkg.version || null,
    buildNumber: null,
    patchStatus: null,
    deviceLimit: null,
    probeLimit: null,
    probesInstalled: store.listProbes().length,
    devicesUsed: store.listDevices().length,
    probesUsed: store.listProbes().length,
    expiryDate: null,
    addons: [],
    status: (lic && lic.status) || 'Unlicensed',
  });
});

router.get('/api/settings/license', (req, res) => {
  const lic = licenceRecord();
  if (lic) return res.json({ status: 'success', license: lic });
  // No licence stored: report the honest unlicensed state with LIVE counts
  // from the store (never the old fake 16 devices / 4 probes).
  res.json({
    status: 'success',
    license: {
      status: 'Unlicensed',
      licenseType: null,
      registeredTo: null,
      deviceLimit: null,
      probeLimit: null,
      expiryDate: null,
      devicesUsed: store.listDevices().length,
      probesUsed: store.listProbes().length,
      interfacesUsed: null,
    },
  });
});

router.post('/api/settings/license/apply', (req, res) => {
  const { licenseXml, keyString } = req.body || {};
  if (!licenseXml && !keyString) {
    return res.status(400).json({ status: 'error', message: 'licenseXml or keyString is required' });
  }
  const material = String(licenseXml || keyString);
  const record = {
    status: 'Unvalidated',
    source: licenseXml ? 'licenseXml' : 'keyString',
    fingerprint: crypto.createHash('sha256').update(material).digest('hex'),
    appliedAt: new Date().toISOString(),
    note: 'Stored but not cryptographically validated: no licence validation is implemented in this build.',
  };
  putStored('license', record);
  auditLog('settings.license.apply', { source: record.source, fingerprint: record.fingerprint });
  res.json({
    status: 'success',
    message: 'Licence material stored. It has NOT been validated: no licence validation is implemented in this build.',
    license: licenceRecord(),
  });
});

// ---------------------------------------------------------- search (real) ---

router.get(['/admin/getSearchResult', '/api/admin/getSearchResult'], (req, res) => {
  const query = (req.query.q || req.query.query || '').toLowerCase();
  const has = (v) => (v === null || v === undefined ? '' : String(v)).toLowerCase().includes(query);
  const devices = store.listDevices().filter((d) =>
    has(d.hostname) || has(d.sys_name) || has(d.ip) || has(d.vendor) || has(d.model) || has(d.category),
  );
  const probes = store.listProbes().filter((p) => has(p.name) || has(p.ip));
  const alarms = store.listAlarms().filter((a) => has(a.message) || has(a.source) || has(a.severity));
  res.json({ status: 'success', query, results: { devices, probes, alarms } });
});

// --------------------------------------------------------- new features ---
// Real build metadata (HE-1, phase 5): version + commit + commit date
// come from the repo itself (live git, else baked server/build-info.json),
// never invented. The features list names only capabilities this build
// actually implements, each documented as REAL in API.md / REALDATA.md:
//   1. poller.js + REALDATA.md §9.3 — live SNMPv2c/ICMP polling
//   2. store.js header — SQLite store, no seed/demo data
//   3. REALDATA.md §2 — scrypt admin, lockout, must-change-password
//   4. REALDATA.md §5.2 — Go host agent, key auth, persisted telemetry
//   5. discovery.js — real ICMP+SNMP sweep, persisted run history
//   6. ccm.js — NCM backup over real SSH, versioned revisions
//   7. alarms.js + store.js alarm_notes — RCA notes, ack/clear/status
//   8. store.js notifications — notifications from real events only
//   9. REALDATA.md §6.3 — VACUUM INTO backup with SHA-256
//  10. settings.js API-key routes — random keys, hash-only storage
//  11. ha.js + store.js ha — peer heartbeat and lease handling
//  12. settings.js SIF routes — support bundle zipped from real logs
// No roadmap items, no upstream-ManageEngine features this rebuild lacks.
const NEW_FEATURES = [
  'Real SNMPv2c + ICMP poller with per-device thresholds and live CPU, memory and availability alarms',
  'SQLite data store with no seed or demo data — every device, probe, alarm and note is stored, never invented',
  'Scrypt-hashed admin login with brute-force lockout and forced password change on first login',
  'Go host agent with key authentication and persisted 5-second CPU, memory and disk telemetry',
  'Real network discovery sweep (ICMP + SNMP) with persisted run history',
  'NCM configuration backup over real SSH, stored as versioned running-config revisions',
  'RCA notes stored per alarm, with acknowledge, clear and RCA-status tracking',
  'User notifications fed only by real alarm, discovery and backup events',
  'Database backup via real VACUUM INTO, with SHA-256 verification',
  'API keys generated with crypto-random bytes, hash-only storage, plaintext returned once',
  'HA peer heartbeat and lease handling for Central failover',
  'Support bundle (SIF) built as a real zip of the server log files',
];

router.get(['/admin/getNewFeatures', '/api/admin/getNewFeatures'], (req, res) => {
  const version = (buildInfo && buildInfo.version) || pkg.version || null;
  const commit = (buildInfo && buildInfo.commit) || null;
  const commitDate = (buildInfo && buildInfo.commitDate) || null;
  res.json({
    build: version,
    buildCommit: commit,
    buildDate: commitDate,
    releaseDate: commitDate,
    features: NEW_FEATURES.slice(),
  });
});

// ----------------------------------------------------- opmanager settings ---

router.get(['/admin/GetOpManagerSettings', '/api/admin/GetOpManagerSettings'], (req, res) => {
  const sys = getStored('system') || {};
  res.json({
    status: 'success',
    settings: {
      centralHostIP: primaryIPv4(),
      probeSyncPort: SERVER_PORT,
      replicationInterval: null,
      protocol: 'HTTP',
      autoDiscoverySubnet: null,
      snmpTrapPort: null,
      syslogPort: null,
      webAlarmAudio: sys.webAlarmAudio ?? null,
      dataRetentionDays: sys.dataRetentionDays ?? null,
    },
  });
});

// ----------------------------------------------------- system information ---

router.get(['/admin/GetSystemInformation', '/api/admin/GetSystemInformation', '/admin/getSystemInfo'], (req, res) => {
  const mem = process.memoryUsage();
  const cpus = os.cpus();
  res.json({
    status: 'success',
    productName: 'ManageEngine OpManager Central',
    version: pkg.version || null,
    buildNumber: null,
    runtime: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      cpuCount: cpus.length,
      cpuModel: (cpus[0] && cpus[0].model) || null,
      totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
      heapTotalMB: Math.round(mem.heapTotal / (1024 * 1024)),
      heapUsedMB: Math.round(mem.heapUsed / (1024 * 1024)),
      uptimeSeconds: Math.floor(process.uptime()),
    },
    jvmInfo: null,
    osInfo: {
      osName: `${os.type()} ${os.release()}`,
      osArch: os.arch(),
      osVersion: os.release(),
      totalPhysicalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      freePhysicalMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
    },
    dbInfo: {
      dbType: 'SQLite',
      dbVersion: 'SQLite (node:sqlite)',
      databaseName: path.basename(DB_PATH),
      databasePath: DB_PATH,
      databaseSizeBytes: dbFileSize(),
      connectionPoolSize: null,
      activeConnections: null,
    },
  });
});

// ---------------------------------------------------------------- db info ---

router.get(['/admin/getDBInfo', '/api/admin/getDBInfo'], (req, res) => {
  const stats = sqliteStats();
  const size = dbFileSize();
  res.json({
    status: 'success',
    database: 'SQLite',
    engine: 'SQLite (node:sqlite)',
    host: null,
    port: null,
    dbPath: DB_PATH,
    dbSizeBytes: size,
    dbSize: humanSize(size),
    tableCount: stats.tableCount,
    totalRecords: stats.totalRecords,
    status: size === null ? 'UNAVAILABLE' : 'OK',
    tablespace: null,
  });
});

// -------------------------------------------------------------- api keys ---
// Keys are generated with crypto.randomBytes, only the SHA-256 hash is
// stored (store.api_keys), and the plaintext is returned exactly once.
// GET never returns a key value.

router.get(['/admin/getAPIKey', '/api/admin/getAPIKey'], (req, res) => {
  res.json({
    status: 'success',
    apiKey: null,
    keys: store.listApiKeys(),
    generatedFor: null,
    accessScope: null,
    note: 'API keys are stored only as SHA-256 hashes and are shown once, at creation or rotation.',
  });
});

router.post(['/admin/regenerateAPIKey', '/api/admin/regenerateAPIKey'], (req, res) => {
  const { id, name } = req.body || {};
  const plain = `opm_${crypto.randomBytes(32).toString('base64url')}`;
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  let record = null;
  let rotated = false;

  if (id !== undefined && id !== null) {
    const existing = store.listApiKeys().find((k) => k.id === Number(id));
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'API key not found' });
    }
    record = store.rotateApiKey(existing.id, hash);
    rotated = true;
  } else if (name) {
    const existing = store.listApiKeys().find((k) => k.name === name);
    if (existing) {
      record = store.rotateApiKey(existing.id, hash);
      rotated = true;
    } else {
      record = store.createApiKey(name, hash);
    }
  } else {
    const keys = store.listApiKeys();
    if (keys.length === 1) {
      record = store.rotateApiKey(keys[0].id, hash);
      rotated = true;
    } else if (keys.length === 0) {
      record = store.createApiKey('default', hash);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Multiple API keys exist; pass id or name to rotate one.',
      });
    }
  }

  auditLog(rotated ? 'settings.apikey.rotate' : 'settings.apikey.create', { id: record.id, name: record.name });
  res.json({
    status: 'success',
    apiKey: plain,
    id: record.id,
    name: record.name,
    created_at: record.created_at,
    message: 'New API key generated. Store it now: it is shown only once and only its SHA-256 hash is kept.',
  });
});

// ------------------------------------------------------------ thread dump ---
// This is a Node.js process: there is no JVM thread dump. Report real
// Node runtime diagnostics instead.

router.get(['/admin/GetThreadDump', '/api/admin/GetThreadDump'], (req, res) => {
  res.json({
    status: 'success',
    runtime: `Node.js ${process.version}`,
    activeThreads: null,
    peakThreads: null,
    threadDump: null,
    activeHandles: process._getActiveHandles().length,
    activeRequests: process._getActiveRequests().length,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    uptimeSeconds: Math.floor(process.uptime()),
    note: 'This is a Node.js process: there is no JVM thread dump.',
  });
});

// ------------------------------------------------------------- jvm heap ---
// STRUCTURALLY NOT IMPLEMENTABLE — this is the one 501 that can never be
// made real. This build runs on Node.js, not Java: there is no JVM process
// at all, so there is no JVM heap to resize. In the Java OpManager this
// endpoint resized the running JVM's heap; here the only heap is the V8
// heap, whose maximum old-space size is fixed at process start by the
// --max-old-space-size flag (e.g. NODE_OPTIONS=--max-old-space-size=4096,
// see DEPLOY.md §1.3) and cannot be changed by any API call while the
// server is running. This endpoint therefore always answers 501 with the
// exact reason; it never pretends to succeed and never invents a JVM
// metric. The closest real equivalent is that startup flag, plus the live
// V8 heap figures in GET /api/admin/GetSystemInformation
// (runtime.heapTotalMB / heapUsedMB).

router.post(['/admin/updateJvmHeapSize', '/api/admin/updateJvmHeapSize'], (req, res) => {
  res.status(501).json({
    status: 'error',
    ...NOT_IMPLEMENTED('This build runs on Node.js, not Java: no JVM process exists, so there is no JVM heap to resize. The Node.js (V8) heap size is governed by the --max-old-space-size flag at process start (e.g. NODE_OPTIONS=--max-old-space-size=4096) and cannot be changed by this API while the server is running. Restart the server with that flag to change the heap limit.'),
  });
});

// ------------------------------------------------------------ support logs ---
// Reads the tail of a real log file. No log files exist in this build yet,
// so this 404s until one is written under server/logs or server/data/logs.

function findLogFile(base) {
  for (const dir of LOG_DIRS) {
    const p = path.join(dir, base);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function listLogFiles() {
  const found = [];
  for (const dir of LOG_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (/\.log$/i.test(name)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isFile()) found.push({ name, path: p });
      }
    }
  }
  return found;
}

router.get(['/api/support/logs', '/support/logs'], (req, res) => {
  const file = String(req.query.file || 'opmanager_server.log');
  const base = path.basename(file);
  if (!/\.log$/i.test(base)) {
    return res.status(400).json({ status: 'error', message: 'Only .log files can be read' });
  }
  const found = findLogFile(base);
  if (!found) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: `Log file not found: ${base}`,
      file: base,
      logs: [],
    });
  }
  const lines = Math.min(Math.max(parseInt(req.query.lines, 10) || 200, 1), 1000);
  const all = fs.readFileSync(found, 'utf8').split('\n');
  if (all.length && all[all.length - 1] === '') all.pop();
  const tail = all.slice(-lines);
  res.json({
    status: 'success',
    file: base,
    timestamp: new Date().toISOString(),
    logLevel: null,
    linesCount: tail.length,
    totalLines: all.length,
    logs: tail,
  });
});

// ------------------------------------------------------------ support SIF ---
// Zips REAL log files (plus a real system dump) into a stored (uncompressed)
// ZIP written to disk, and returns its real name/size. 404 when no log
// files exist — no invented bundle size.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildStoredZip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(e.data.length, 18);
    lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    local.push(lh, nameBuf, e.data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(e.data.length, 20);
    ch.writeUInt32LE(e.data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + e.data.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

router.get(['/api/support/sif', '/support/generateSIF'], (req, res) => {
  const logs = listLogFiles();
  if (logs.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'not_found',
      message: 'No log files exist to bundle into a support file.',
      fileName: null,
      fileSize: null,
      fileSizeBytes: null,
      components: [],
    });
  }
  const mem = process.memoryUsage();
  const dump = {
    productName: 'ManageEngine OpManager Central',
    version: pkg.version || null,
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: mem,
    dbPath: DB_PATH,
    dbSizeBytes: dbFileSize(),
    devices: store.listDevices().length,
    probes: store.listProbes().length,
    alarms: store.listAlarms().length,
  };
  const entries = logs.map((f) => ({ name: f.name, data: fs.readFileSync(f.path) }));
  entries.push({ name: 'system_dump.json', data: Buffer.from(JSON.stringify(dump, null, 2), 'utf8') });
  const zip = buildStoredZip(entries);
  fs.mkdirSync(SIF_DIR, { recursive: true });
  const fileName = `OpManager_Central_SIF_${stamp(new Date())}.zip`;
  const outPath = path.join(SIF_DIR, fileName);
  fs.writeFileSync(outPath, zip);
  auditLog('settings.sif.generate', { fileName, sizeBytes: zip.length });
  res.json({
    status: 'success',
    fileName,
    fileSizeBytes: zip.length,
    fileSize: humanSize(zip.length),
    generatedAt: new Date().toISOString(),
    components: entries.map((e) => e.name),
    downloadPath: `/api/support/sif/download/${fileName}`,
  });
});

router.get('/api/support/sif/download/:file', (req, res) => {
  const file = path.basename(req.params.file || '');
  const p = path.join(SIF_DIR, file);
  if (!file.endsWith('.zip') || !fs.existsSync(p)) {
    return res.status(404).json({ status: 'error', error: 'not_found', message: 'Support file not found' });
  }
  res.download(p, file);
});

// ------------------------------------------------------------------- mail ---

const DEFAULT_MAIL = {
  host: null,
  port: null,
  protocol: 'SMTP',
  security: null,
  fromAddress: null,
  adminEmail: null,
  authEnabled: false,
  username: null,
};

function mailSettingsPublic() {
  const stored = getStored('mail');
  const merged = { ...DEFAULT_MAIL, ...(stored && typeof stored === 'object' ? stored : {}) };
  const out = publicCopy(merged);
  out.passwordConfigured = hasSecret(stored) || Boolean((stored && stored.password) || (stored && stored.authPassword));
  return out;
}

router.get(['/api/settings/mail', '/settings/getMailServer'], (req, res) => {
  res.json({ status: 'success', settings: mailSettingsPublic() });
});

router.post(['/api/settings/mail', '/settings/saveMailServer'], (req, res) => {
  const stored = getStored('mail');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('mail', merged);
  auditLog('settings.mail.save', { host: merged.host || null, port: merged.port || null });
  res.json({ status: 'success', message: 'Mail server settings saved.', settings: mailSettingsPublic() });
});

/**
 * Real SMTP test: speaks SMTP over a live TCP (or TLS) connection to the
 * configured mail host — greeting, EHLO, optional STARTTLS / AUTH LOGIN,
 * MAIL FROM, RCPT TO, DATA — and reports every step's real reply code.
 * Nothing is faked: a step that fails returns its real SMTP reply, and
 * the test only reports success when the server actually accepted the
 * message (250 after DATA's terminating dot).
 */
function smtpConversation(cfg) {
  return new Promise((resolve) => {
    const steps = [];
    const record = (step, code, reply) => steps.push({ step, code: code == null ? null : Number(code), reply: reply == null ? null : String(reply).trim() });
    const finish = (ok, message, failedStep) => resolve({ ok, message, steps, failedStep: failedStep || null });
    const timeoutMs = 10000;
    const host = cfg.host;
    const port = Number(cfg.port) || (String(cfg.security || '').toUpperCase() === 'TLS' ? 465 : 25);
    const useImplicitTls = String(cfg.security || '').toUpperCase() === 'TLS' || String(cfg.security || '').toUpperCase() === 'SSL' || port === 465;

    let socket = null;
    let buffer = '';
    let currentLines = [];
    const queuedReplies = [];
    const waiters = [];
    let ended = false;
    let started = false;

    const onData = (chunk) => {
      buffer += chunk.toString('utf8');
      drain();
    };
    // An SMTP reply is complete when a line arrives as "<code><space>..."
    // (lines "<code>-..." are multiline continuations). Only complete
    // replies are handed to waiters; partial lines stay buffered.
    function drain() {
      for (;;) {
        const idx = buffer.indexOf('\n');
        if (idx === -1) return;
        const line = buffer.slice(0, idx).replace(/\r$/, '');
        buffer = buffer.slice(idx + 1);
        const m = /^(\d{3})([ -])(.*)$/.exec(line);
        if (!m) continue;
        currentLines.push({ code: Number(m[1]), text: m[3], raw: line });
        if (m[2] === ' ') {
          const reply = currentLines;
          currentLines = [];
          if (waiters.length) waiters.shift()(reply);
          else queuedReplies.push(reply);
        }
      }
    }

    function readReply() {
      return new Promise((resReply) => {
        if (queuedReplies.length) {
          resReply(queuedReplies.shift());
          return;
        }
        waiters.push(resReply);
      });
    }
    async function send(cmd, step) {
      socket.write(`${cmd}\r\n`);
      const lines = await readReply();
      const last = lines[lines.length - 1];
      record(step, last.code, lines.map((l) => l.raw).join(' / '));
      return last.code;
    }

    const onError = (err) => {
      if (ended) return;
      ended = true;
      record('connect', null, err.message);
      finish(false, `SMTP test failed: ${err.message}`, 'connect');
    };

    const run = async () => {
      try {
        const greet = await readReply();
        const g = greet[greet.length - 1];
        record('greeting', g.code, greet.map((l) => l.raw).join(' / '));
        if (g.code !== 220) return finish(false, `SMTP greeting rejected: ${g.raw}`, 'greeting');

        const ehloCode = await send(`EHLO ${os.hostname()}`, 'ehlo');
        if (ehloCode !== 250) return finish(false, `EHLO rejected by ${host}:${port}`, 'ehlo');

        const wantStartTls = String(cfg.security || '').toUpperCase() === 'STARTTLS';
        if (wantStartTls && !useImplicitTls) {
          const tlsCode = await send('STARTTLS', 'starttls');
          if (tlsCode !== 220) return finish(false, 'STARTTLS rejected by the server', 'starttls');
          socket.removeListener('data', onData);
          const upgraded = tls.connect({ socket, servername: host, rejectUnauthorized: false });
          socket = upgraded;
          buffer = '';
          currentLines = [];
          socket.on('data', onData);
          socket.on('error', onError);
          socket.setTimeout(timeoutMs, () => socket.destroy(new Error('SMTP connection timed out')));
          const ehlo2 = await send(`EHLO ${os.hostname()}`, 'ehlo-tls');
          if (ehlo2 !== 250) return finish(false, 'EHLO after STARTTLS rejected', 'ehlo-tls');
        }

        if (cfg.authEnabled && cfg.username) {
          const authCode = await send('AUTH LOGIN', 'auth');
          if (authCode !== 334) return finish(false, 'AUTH LOGIN rejected by the server', 'auth');
          const uCode = await send(Buffer.from(String(cfg.username), 'utf8').toString('base64'), 'auth-username');
          if (uCode !== 334) return finish(false, 'SMTP username rejected', 'auth-username');
          const pCode = await send(Buffer.from(String(cfg.password || ''), 'utf8').toString('base64'), 'auth-password');
          if (pCode !== 235) return finish(false, 'SMTP authentication failed (bad username/password)', 'auth-password');
        }

        const fromCode = await send(`MAIL FROM:<${cfg.from}>`, 'mail-from');
        if (fromCode !== 250) return finish(false, `MAIL FROM rejected for <${cfg.from}>`, 'mail-from');
        const rcptCode = await send(`RCPT TO:<${cfg.to}>`, 'rcpt-to');
        if (rcptCode !== 250) return finish(false, `RCPT TO rejected for <${cfg.to}>`, 'rcpt-to');
        const dataCode = await send('DATA', 'data');
        if (dataCode !== 354) return finish(false, 'DATA rejected by the server', 'data');
        const body = [
          `From: ${cfg.from}`,
          `To: ${cfg.to}`,
          'Subject: OpManager Central — SMTP test',
          'Content-Type: text/plain; charset=utf-8',
          '',
          'This is a test message sent by the OpManager Central mail-server test.',
          `Sent at ${new Date().toISOString()} from ${os.hostname()}.`,
          '.',
          '',
        ].join('\r\n');
        socket.write(body);
        const bodyLines = await readReply();
        const b = bodyLines[bodyLines.length - 1];
        record('message', b.code, bodyLines.map((l) => l.raw).join(' / '));
        if (b.code !== 250) return finish(false, 'Message body rejected by the server', 'message');
        try { await send('QUIT', 'quit'); } catch { /* best effort */ }
        return finish(true, `Test mail accepted by ${host}:${port} (250 after DATA).`, null);
      } catch (err) {
        if (!ended) {
          ended = true;
          finish(false, `SMTP test failed: ${err.message}`, null);
        }
      }
    };

    const connectOpts = { host, port, timeout: timeoutMs };
    socket = useImplicitTls
      ? tls.connect({ ...connectOpts, servername: host, rejectUnauthorized: false })
      : net.connect(connectOpts);
    socket.on('data', onData);
    socket.on('timeout', () => socket.destroy(new Error('SMTP connection timed out')));
    socket.on('error', onError);
    const startOnce = () => { if (!started) { started = true; run(); } };
    socket.on('connect', startOnce);
    socket.on('secureConnect', startOnce);
  });
}

router.post(['/api/settings/mail/test', '/settings/testMailServer'], async (req, res) => {
  const stored = getStored('mail');
  const body = req.body || {};
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...body };
  const host = merged.host || merged.smtpHost;
  if (!host) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('No mail server is configured (no host in stored settings or request body), so there is nothing to test.'),
    });
  }
  const from = merged.fromAddress || merged.adminEmail || merged.from || 'opmanager@localhost';
  const to = body.to || merged.adminEmail || merged.to;
  if (!to) {
    return res.status(400).json({
      status: 'error',
      message: 'A recipient is required: pass "to" in the request body or store adminEmail in the mail settings.',
    });
  }
  const cfg = {
    host: String(host),
    port: merged.port,
    security: merged.security,
    authEnabled: Boolean(merged.authEnabled),
    username: merged.username,
    // Password is taken from the stored settings (never echoed back) or
    // the request body for this one test only.
    password: body.password || merged.password || merged.authPassword || '',
    from: String(from),
    to: String(to),
  };
  const result = await smtpConversation(cfg);
  auditLog('settings.mail.test', { host: cfg.host, port: cfg.port || null, ok: result.ok });
  if (result.ok) {
    return res.json({
      status: 'success',
      message: result.message,
      testedAt: new Date().toISOString(),
      statusCheck: 'OK',
      host: cfg.host,
      port: Number(cfg.port) || null,
      from: cfg.from,
      to: cfg.to,
      steps: result.steps,
    });
  }
  return res.json({
    status: 'error',
    message: result.message,
    testedAt: new Date().toISOString(),
    statusCheck: 'FAILED',
    host: cfg.host,
    port: Number(cfg.port) || null,
    from: cfg.from,
    to: cfg.to,
    failedStep: result.failedStep,
    steps: result.steps,
  });
});

// --------------------------------------------------------------- failover ---
// Single node by default: no second node, no virtual IP, no replication.
// Stored config (if any) is returned as-is; the heartbeat test performs a
// real TCP connect to the configured standby, or honestly refuses.

function failoverPublic() {
  const stored = getStored('failover');
  if (stored && typeof stored === 'object') return stored;
  return {
    mode: null,
    status: 'Not configured',
    virtualIp: null,
    heartbeatPort: null,
    splitBrainProtection: null,
    primary: null,
    secondary: null,
  };
}

router.get(['/api/settings/failover', '/settings/getFailoverStatus'], (req, res) => {
  res.json({ status: 'success', failover: failoverPublic() });
});

router.post('/api/settings/failover', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Failover configuration object is required' });
  }
  const stored = getStored('failover');
  const prev = (stored && typeof stored === 'object' ? stored : {});
  const merged = { ...prev, ...req.body };
  putStored('failover', merged);
  auditLog('settings.failover.save', { mode: merged.mode || null });
  // Phase-3 ws-events: HA_STATUS only when the save actually changes the
  // role/mode or the standby peer — a no-op re-save of the same config is
  // not a status change and emits nothing.
  const prevPeer = prev.secondary && prev.secondary.ip ? `${prev.secondary.ip}:${prev.secondary.port || ''}` : null;
  const nextPeer = merged.secondary && merged.secondary.ip ? `${merged.secondary.ip}:${merged.secondary.port || ''}` : null;
  if (prev.role !== merged.role || prev.mode !== merged.mode || prevPeer !== nextPeer) {
    wsEvents.emitHaStatus({
      role: merged.role == null ? null : merged.role,
      previousRole: prev.role == null ? null : prev.role,
      mode: merged.mode == null ? null : merged.mode,
      peer: merged.secondary && merged.secondary.ip
        ? { ip: merged.secondary.ip, port: merged.secondary.port == null ? null : merged.secondary.port }
        : null,
      reachable: null,
      latencyMs: null,
      configured: Boolean(merged.secondary && merged.secondary.ip),
      reason: 'config-saved',
    });
  }
  res.json({ status: 'success', message: 'Failover configuration saved.', failover: merged });
});

router.post(['/api/settings/failover/test', '/settings/testFailoverHeartbeat'], (req, res) => {
  const fo = getStored('failover');
  const secondary = fo && fo.secondary;
  const port = (fo && fo.heartbeatPort) || (secondary && secondary.port) || null;
  if (!secondary || !secondary.ip || !port) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('Failover is not configured: no standby node is stored, so there is nothing to heartbeat.'),
    });
  }
  const t0 = Date.now();
  let done = false;
  const finish = (payload) => {
    if (done) return;
    done = true;
    // Phase-3 ws-events: the heartbeat test IS a real peer-liveness
    // probe — broadcast its actual outcome (reachable + latency) as an
    // HA_STATUS event, before answering the HTTP caller.
    wsEvents.emitHaStatus({
      role: (fo && fo.role) == null ? null : fo.role,
      previousRole: null,
      mode: (fo && fo.mode) == null ? null : fo.mode,
      peer: { ip: secondary.ip, port: Number(port) },
      reachable: payload.reachable === true,
      latencyMs: payload.latencyMs == null ? null : payload.latencyMs,
      configured: true,
      reason: 'heartbeat-test',
    });
    res.json(payload);
  };
  const socket = net.connect({ host: secondary.ip, port: Number(port), timeout: 3000 });
  socket.on('connect', () => {
    const latencyMs = Date.now() - t0;
    socket.destroy();
    finish({
      status: 'success',
      message: `Heartbeat TCP connect to standby ${secondary.ip}:${port} succeeded.`,
      latencyMs,
      reachable: true,
    });
  });
  socket.on('timeout', () => {
    socket.destroy();
    finish({
      status: 'error',
      message: `Heartbeat TCP connect to standby ${secondary.ip}:${port} timed out.`,
      latencyMs: Date.now() - t0,
      reachable: false,
    });
  });
  socket.on('error', (err) => {
    finish({
      status: 'error',
      message: `Heartbeat TCP connect to standby ${secondary.ip}:${port} failed: ${err.message}`,
      latencyMs: Date.now() - t0,
      reachable: false,
    });
  });
});

// ------------------------------------------------------------------ users ---
// Real users come from the store (store.users.listUsers). There is no AD /
// SAML / MFA flow in this build. Local user creation/deletion IS real:
// passwords are hashed with the same scrypt service the auth routes use
// (server/services/session.js), the plaintext is never stored or echoed,
// and admin-created accounts must change their password on first login.

const MIN_PASSWORD_LENGTH = 10;
const VALID_ROLES = ['admin', 'operator', 'viewer', 'superadmin'];

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    name: u.username,
    email: null,
    role: u.role,
    authType: 'Local Authentication',
    status: 'Active',
    probeScope: null,
    lastLogin: null,
    mfa: false,
    mustChangePassword: Boolean(u.must_change_password),
    createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
  };
}

function normalizeRole(role) {
  if (role == null || role === '') return 'Operator';
  const r = String(role).trim().toLowerCase();
  if (!VALID_ROLES.includes(r)) return null;
  if (r === 'admin') return 'admin';
  if (r === 'superadmin') return 'SuperAdmin';
  if (r === 'viewer') return 'Viewer';
  return 'Operator';
}

router.get(['/api/settings/users', '/api/users/list'], (req, res) => {
  const users = store.listUsers().map(publicUser);
  res.json({ status: 'success', users });
});

router.post(['/api/settings/users', '/api/users/add'], (req, res) => {
  const body = req.body || {};
  const username = String(body.username || '').trim();
  const password = body.password;
  if (!username) {
    return res.status(400).json({ status: 'error', message: 'username is required' });
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      status: 'error',
      message: `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }
  const role = normalizeRole(body.role);
  if (role === null) {
    return res.status(400).json({
      status: 'error',
      message: `role must be one of: ${VALID_ROLES.join(', ')}`,
    });
  }
  if (store.getUserByUsername(username)) {
    return res.status(409).json({
      status: 'error',
      error: 'conflict',
      message: `A user named '${username}' already exists.`,
    });
  }
  let created;
  try {
    created = store.users.createUser(username, hashPassword(password), role);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `User creation failed: ${err.message}` });
  }
  // Admin-created accounts must change the password on first login.
  try {
    created = store.users.updateUser(created.id, { must_change_password: 1 }) || created;
  } catch { /* the account itself was created; the flag is best-effort */ }
  auditLog('settings.user.create', { id: created.id, username: created.username, role: created.role });
  res.status(201).json({
    status: 'success',
    message: `User ${created.username} created. They must change their password on first login.`,
    user: publicUser(created),
  });
});

router.delete('/api/settings/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ status: 'error', message: 'User id must be an integer' });
  }
  const target = store.listUsers().find((u) => u.id === id);
  if (!target) {
    return res.status(404).json({ status: 'error', error: 'not_found', message: `User not found: ${id}` });
  }
  if (req.user && req.user.id === id) {
    return res.status(403).json({ status: 'error', message: 'You cannot delete your own account.' });
  }
  const isAdmin = (r) => String(r || '').toLowerCase() === 'admin' || String(r || '').toLowerCase() === 'superadmin';
  if (isAdmin(target.role)) {
    const adminCount = store.listUsers().filter((u) => isAdmin(u.role)).length;
    if (adminCount <= 1) {
      return res.status(403).json({
        status: 'error',
        message: `Cannot delete '${target.username}': the last remaining admin account cannot be removed.`,
      });
    }
  }
  // The store service has no deleteUser export, so the delete runs here
  // against the same SQLite file (same pattern as the DB backup route,
  // which opens its own DatabaseSync connection). The user's sessions
  // are revoked in the same step.
  let conn = null;
  try {
    conn = new DatabaseSync(DB_PATH);
    conn.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    const info = conn.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ status: 'error', error: 'not_found', message: `User not found: ${id}` });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: `User deletion failed: ${err.message}` });
  } finally {
    if (conn) conn.close();
  }
  auditLog('settings.user.delete', { id, username: target.username });
  res.json({
    status: 'success',
    message: `User ${target.username} deleted; their sessions were revoked.`,
    deleted: { id: target.id, username: target.username },
  });
});

// --------------------------------------------------------------------- AD ---

const DEFAULT_AD = {
  domainName: null,
  domainController: null,
  port: null,
  ssl: null,
  baseDn: null,
  bindUser: null,
  userFilter: null,
  autoSyncIntervalHours: null,
  status: 'Not configured',
};

router.get('/api/settings/auth/ad', (req, res) => {
  const stored = getStored('auth.ad');
  const merged = { ...DEFAULT_AD, ...(stored && typeof stored === 'object' ? stored : {}) };
  const out = publicCopy(merged);
  out.bindPasswordConfigured = Boolean(stored && (stored.bindPassword || stored.password));
  res.json({ status: 'success', ad: out });
});

router.post('/api/settings/auth/ad', (req, res) => {
  const stored = getStored('auth.ad');
  // The bind password is NEVER persisted: strip every secret-bearing
  // key before writing, even if the caller sent one.
  const merged = stripSecrets({ ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) });
  putStored('auth.ad', merged);
  auditLog('settings.ad.save', { domainName: merged.domainName || null });
  res.json({ status: 'success', message: 'Active Directory configuration saved.', ad: publicCopy(merged) });
});

// ------------------------------------------------- canonical LDAP settings --
// Canonical store object per SHARED.md: settings.ldap = { url, bindDn,
// baseDn, groupBase, userFilter, groupFilter }. The bind password is
// NEVER part of this object — it is supplied per call or via the
// LDAP_BIND_PASSWORD environment variable.
const DEFAULT_LDAP = {
  url: null,
  bindDn: null,
  baseDn: null,
  groupBase: null,
  userFilter: null,
  groupFilter: null,
};

router.get('/api/settings/auth/ldap', (req, res) => {
  const stored = getStored('settings.ldap');
  const merged = { ...DEFAULT_LDAP, ...(stored && typeof stored === 'object' ? stored : {}) };
  res.json({ status: 'success', ldap: publicCopy(merged) });
});

router.post('/api/settings/auth/ldap', (req, res) => {
  const stored = getStored('settings.ldap');
  // Strip secret-bearing keys: a bind password sent in the body is used
  // by the caller only for this request and is never persisted.
  const merged = stripSecrets({ ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) });
  putStored('settings.ldap', merged);
  auditLog('settings.ldap.save', { url: merged.url || null, baseDn: merged.baseDn || null });
  res.json({ status: 'success', message: 'LDAP configuration saved.', ldap: publicCopy(merged) });
});

router.post('/api/settings/auth/ad/test', async (req, res) => {
  // REAL bind + base search via server/services/ldap.js (ldapjs, real
  // LDAP wire protocol). Call-time fields win over stored settings:
  // url (or legacy domainController/port/ssl), bindDn (or bindUser),
  // password (or bindPassword), baseDn. The password is used for this
  // one bind only — it is never stored, never logged, never echoed.
  let cfg;
  try {
    cfg = ldapSvc.resolveLdapConfig({
      storedLdap: getStored('settings.ldap'),
      storedAd: getStored('auth.ad'),
      body: req.body || {},
    });
  } catch (err) {
    return res.status(err.status || 400).json({
      status: 'error',
      error: err.code || 'LDAP_INVALID_URL',
      message: err.message,
    });
  }
  if (!cfg.url) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('No LDAP server is configured (no url in settings.ldap, and no domainController in stored settings or request body), so there is nothing to test.'),
    });
  }
  if (!cfg.bindDn) {
    return res.status(400).json({
      status: 'error',
      error: 'missing_bind_dn',
      message: 'No bind DN supplied: set settings.ldap.bindDn or pass bindDn in the request body.',
    });
  }
  if (!cfg.password) {
    return res.status(400).json({
      status: 'error',
      error: 'bind_password_required',
      message: 'No bind password supplied: pass password in the request body (used for this test only, never stored) or set the LDAP_BIND_PASSWORD environment variable.',
    });
  }
  try {
    const result = await ldapSvc.testBind(cfg, cfg.password);
    auditLog('settings.ad.test', { host: result.host, port: result.port, reachable: true, ldapBindVerified: true });
    return res.json({
      status: 'success',
      message: `LDAP bind as ${result.bindDn} succeeded against ${result.host}:${result.port} in ${result.latencyMs} ms; base search on ${result.baseDn} returned ${result.entriesFound} entr${result.entriesFound === 1 ? 'y' : 'ies'}.`,
      testedAt: new Date().toISOString(),
      statusCheck: 'OK',
      host: result.host,
      port: result.port,
      tls: result.tls,
      url: result.url,
      bindDn: result.bindDn,
      baseDn: result.baseDn,
      reachable: true,
      latencyMs: result.latencyMs,
      ldapBindVerified: true,
      entriesFound: result.entriesFound,
      rootEntry: result.rootEntry,
    });
  } catch (err) {
    const status = err.status || 502;
    auditLog('settings.ad.test', { host: cfg.host, port: cfg.port, reachable: Boolean(err.reachable), ldapBindVerified: false });
    return res.status(status).json({
      status: 'error',
      error: err.code || 'ldap_error',
      message: err.message,
      testedAt: new Date().toISOString(),
      statusCheck: 'FAILED',
      host: cfg.host,
      port: cfg.port,
      tls: cfg.tls,
      url: cfg.url,
      reachable: Boolean(err.reachable),
      latencyMs: null,
      ldapBindVerified: false,
    });
  }
});

// ------------------------------------------------------------------- SAML ---
// No SAML library, IdP login flow, or login flow exists in this build.
// Settings persist; the test validates the stored configuration for real
// (required fields, stored certificate parsed with crypto.X509Certificate,
// IdP metadata fetched over HTTPS when an IdP URL is set) and says
// plainly that it does not perform a SAML login flow.

const DEFAULT_SAML = {
  enabled: false,
  idpEntityId: null,
  idpSsoUrl: null,
  spAcsUrl: null,
  certificate: null,
  jitProvisioning: null,
  defaultRole: null,
};

router.get('/api/settings/auth/saml', (req, res) => {
  const stored = getStored('auth.saml');
  const merged = { ...DEFAULT_SAML, ...(stored && typeof stored === 'object' ? stored : {}) };
  const out = publicCopy(merged);
  out.certificate = null;
  out.certificateConfigured = Boolean(stored && stored.certificate);
  // Audit L3 fix (close-out 2026-11-09): the SP private key is never
  // returned — same pattern as the certificate above. The service reads
  // it from env/file only and ignores any stored spKey, so masking the
  // response changes no behaviour.
  out.spKey = null;
  out.spKeyConfigured = Boolean(stored && stored.spKey);
  res.json({ status: 'success', saml: out });
});

/**
 * Mirror the settings shape into the canonical record (store key
 * 'saml', per SHARED.md `settings.saml`): the routes shape
 * { idpEntityId, idpSsoUrl, spAcsUrl, jitProvisioning, defaultRole,
 * certificate } plus the SHARED.md fields { idpMetadataUrl,
 * idpMetadataXml, spEntityId, spCert } where present. The SP private
 * key is NEVER stored here: SHARED.md says spKey comes via runtime
 * env/file, and server/services/saml.js deliberately ignores any
 * spKey found in the store. Only public material (entity IDs, URLs,
 * certificates) is mirrored.
 */
function mirrorSamlCanonical(merged) {
  putStored('saml', {
    idpMetadataUrl: merged.idpMetadataUrl || null,
    idpMetadataXml: merged.idpMetadataXml || null,
    spEntityId: merged.spEntityId || null,
    spCert: merged.spCert || null,
    idpEntityId: merged.idpEntityId || null,
    idpSsoUrl: merged.idpSsoUrl || null,
    idpCert: merged.certificate || null,
    spAcsUrl: merged.spAcsUrl || null,
    enabled: Boolean(merged.enabled),
    jitProvisioning: merged.jitProvisioning !== undefined ? merged.jitProvisioning : null,
    defaultRole: merged.defaultRole || null,
  });
}

/**
 * Fill missing IdP fields from parsed metadata (Phase 4 merge: the
 * settings /test endpoint persists what it parses, so a metadata-URL-
 * or metadata-XML-only config becomes a complete stored config).
 * Only fills fields that are empty in `merged`; returns the filled
 * field names. `parsed` is a parseIdpMetadata()/loadIdpMetadata()
 * result ({ idpEntityId, idpSsoUrl, signingCerts: [pem...] }).
 */
function fillFromParsedMetadata(merged, parsed) {
  const filled = [];
  if (parsed && parsed.idpEntityId && !merged.idpEntityId) {
    merged.idpEntityId = parsed.idpEntityId;
    filled.push('idpEntityId');
  }
  if (parsed && parsed.idpSsoUrl && !merged.idpSsoUrl) {
    merged.idpSsoUrl = parsed.idpSsoUrl;
    filled.push('idpSsoUrl');
  }
  if (parsed && Array.isArray(parsed.signingCerts) && parsed.signingCerts.length > 0 && !merged.certificate) {
    merged.certificate = parsed.signingCerts[0];
    filled.push('certificate');
  }
  return filled;
}

router.post('/api/settings/auth/saml', (req, res) => {
  const stored = getStored('auth.saml');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('auth.saml', merged);
  mirrorSamlCanonical(merged);
  auditLog('settings.saml.save', { enabled: Boolean(merged.enabled) });
  const out = publicCopy(merged);
  out.certificate = null;
  out.certificateConfigured = Boolean(merged.certificate);
  // Audit L3 fix (close-out 2026-11-09): never return the SP private key.
  out.spKey = null;
  out.spKeyConfigured = Boolean(merged.spKey);
  res.json({ status: 'success', message: 'SAML 2.0 Single Sign-On settings saved.', saml: out });
});

/**
 * Fetch a URL over HTTPS and report the real status code plus whether the
 * body looks like SAML IdP metadata. The peer certificate is inspected
 * (not blindly trusted): rejectUnauthorized is off for the fetch itself
 * because a test endpoint must report what the IdP serves, but the
 * result reports whether the certificate was authorized.
 */
function fetchUrl(urlString, timeoutMs) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (err) {
      resolve({ ok: false, error: `Invalid URL: ${err.message}` });
      return;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      resolve({ ok: false, error: `Unsupported URL protocol: ${url.protocol}` });
      return;
    }
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(
      url,
      { timeout: timeoutMs || 5000, rejectUnauthorized: false },
      (resp) => {
        let size = 0;
        const chunks = [];
        resp.on('data', (c) => {
          size += c.length;
          if (size <= 1024 * 1024) chunks.push(c);
        });
        resp.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          let certInfo = null;
          try {
            const sock = resp.socket;
            if (sock && typeof sock.getPeerCertificate === 'function') {
              const cert = sock.getPeerCertificate();
              if (cert && Object.keys(cert).length) {
                certInfo = {
                  subject: cert.subject ? cert.subject.CN || JSON.stringify(cert.subject) : null,
                  issuer: cert.issuer ? cert.issuer.CN || JSON.stringify(cert.issuer) : null,
                  validFrom: cert.valid_from || null,
                  validTo: cert.valid_to || null,
                  authorized: typeof sock.authorized === 'boolean' ? sock.authorized : null,
                  authorizationError: sock.authorizationError ? String(sock.authorizationError) : null,
                };
              }
            }
          } catch { /* cert detail is best-effort */ }
          resolve({
            ok: resp.statusCode >= 200 && resp.statusCode < 300,
            statusCode: resp.statusCode,
            contentType: resp.headers['content-type'] || null,
            bytes: size,
            looksLikeMetadata: /EntityDescriptor/.test(body),
            bodyPreview: body.slice(0, 200),
            certificate: certInfo,
          });
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
  });
}

/** Parse a stored PEM certificate with the real X.509 parser. */
function inspectCertificate(pem) {
  try {
    const cert = new crypto.X509Certificate(pem);
    const now = new Date();
    const validTo = new Date(cert.validTo);
    return {
      parsed: true,
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      expired: now > validTo,
      notYetValid: now < new Date(cert.validFrom),
      fingerprint256: cert.fingerprint256,
      serialNumber: cert.serialNumber,
    };
  } catch (err) {
    return { parsed: false, error: err.message };
  }
}

/** Lazy-load the SAML service (same defensive pattern as server/routes/saml.js). */
function loadSamlService() {
  try {
    return require('../services/saml');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return null;
    throw err;
  }
}

/**
 * Verify the signature chain of IdP signing certificates with the real
 * X.509 parser: each cert must parse, be in date, and its signature must
 * verify against its issuer — its own public key when self-signed, or
 * the issuer certificate from the same set. A cert whose issuer is not
 * in the set fails with 'issuer not available' (the chain cannot be
 * completed from the metadata alone); that is reported, not papered over.
 */
function checkCertChain(pems) {
  const perCert = [];
  if (!pems || pems.length === 0) {
    return { passed: true, detail: 'no IdP signing certificates to check (skipped)', perCert };
  }
  const parsed = [];
  for (const pem of pems) {
    try {
      parsed.push(new crypto.X509Certificate(pem));
    } catch (err) {
      perCert.push({ subject: null, parsed: false, error: err.message, chainVerified: false, passed: false });
    }
  }
  let allOk = perCert.length === 0;
  for (const cert of parsed) {
    const now = new Date();
    const expired = now > new Date(cert.validTo);
    const notYetValid = now < new Date(cert.validFrom);
    const selfSigned = cert.subject === cert.issuer;
    let chainVerified = false;
    let chainDetail = null;
    try {
      if (selfSigned) {
        chainVerified = cert.verify(cert.publicKey);
        chainDetail = chainVerified ? 'self-signed, signature verifies with own key' : 'self-signed, signature does NOT verify';
      } else {
        const issuer = parsed.find((c) => c.subject === cert.issuer);
        if (!issuer) {
          chainDetail = 'issuer certificate not available in the metadata set — chain cannot be completed';
        } else {
          chainVerified = cert.verify(issuer.publicKey);
          chainDetail = chainVerified ? 'signature verifies against issuer certificate' : 'signature does NOT verify against issuer certificate';
        }
      }
    } catch (err) {
      chainDetail = `chain verification error: ${err.message}`;
    }
    const ok = !expired && !notYetValid && chainVerified;
    if (!ok) allOk = false;
    perCert.push({
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      expired,
      notYetValid,
      selfSigned,
      chainVerified,
      chainDetail,
      fingerprint256: cert.fingerprint256,
      passed: ok,
    });
  }
  const okCount = perCert.filter((c) => c.passed).length;
  return {
    passed: allOk && perCert.length > 0,
    detail: `${okCount}/${perCert.length} IdP signing certificate(s) in date with a verified signature chain`,
    perCert,
  };
}

/** Extract the AuthnRequest ID from a (possibly deflated) SAMLRequest value. */
function extractAuthnRequestId(samlRequest) {
  if (!samlRequest) return null;
  try {
    const raw = Buffer.from(samlRequest, 'base64');
    let xml;
    try {
      xml = require('zlib').inflateRawSync(raw).toString('utf8');
    } catch {
      xml = raw.toString('utf8');
    }
    const m = /<samlp:AuthnRequest[^>]*\bID="([^"]+)"/.exec(xml) || /\bID="([^"]+)"/.exec(xml);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

router.post('/api/settings/auth/saml/test', async (req, res) => {
  const stored = getStored('auth.saml');
  const body = req.body || {};
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...body };
  const hasAnyConfig = Boolean(
    merged.idpEntityId || merged.idpSsoUrl || merged.spAcsUrl || merged.certificate || merged.enabled
      || merged.idpMetadataUrl || merged.idpMetadataXml || merged.spEntityId,
  );
  if (!hasAnyConfig) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('No SAML configuration is stored, so there is nothing to validate.'),
    });
  }
  // Full validation: required fields, stored certificate, IdP metadata
  // (parse + TLS-verified fetch), certificate chain, and a real test
  // AuthnRequest build. This validates the configuration end to end; it
  // does NOT perform a SAML login flow (no user assertion is exchanged),
  // and the response says so.
  const checks = [];
  const required = ['idpEntityId', 'idpSsoUrl'];
  for (const field of required) {
    const present = Boolean(merged[field]);
    checks.push({ check: `required:${field}`, passed: present, detail: present ? String(merged[field]) : 'missing' });
  }
  if (merged.certificate) {
    const info = inspectCertificate(merged.certificate);
    const passed = info.parsed && !info.expired && !info.notYetValid;
    checks.push({
      check: 'certificate',
      passed,
      detail: info.parsed
        ? `${info.subject} (valid ${info.validFrom} to ${info.validTo}${info.expired ? '; EXPIRED' : ''}${info.notYetValid ? '; NOT YET VALID' : ''})`
        : `unparsable: ${info.error}`,
      certificate: info.parsed ? info : null,
    });
  } else {
    checks.push({ check: 'certificate', passed: true, detail: 'no certificate stored (skipped)' });
  }
  if (merged.idpSsoUrl) {
    // The SSO URL is a login endpoint, not a metadata document: reachability
    // is the honest check here (any HTTP response proves the IdP answers).
    const fetched = await fetchUrl(String(merged.idpSsoUrl), 5000);
    checks.push({
      check: 'idpSsoReachable',
      passed: fetched.statusCode != null,
      detail: fetched.statusCode != null
        ? `HTTP ${fetched.statusCode}, ${fetched.bytes} bytes`
        : `fetch failed: ${fetched.error || 'no response'}`,
      fetch: fetched,
    });
  }

  const saml = loadSamlService();
  // Phase 4 merge: values parsed from IdP metadata during this test
  // are PERSISTED into the stored config (only fields that were
  // empty), so a metadata-URL/XML-only config becomes complete.
  const persistedFromMetadata = [];
  if (!saml) {
    checks.push({
      check: 'samlService',
      passed: false,
      detail: 'server/services/saml.js is missing: metadata parsing, certificate chain validation and the test AuthnRequest build are unavailable.',
    });
  } else {
    // loadSamlConfig reads the IdP cert as `idpCert`; the settings shape
    // stores it as `certificate` — map it so an unstored body value is
    // validated too (stored values are also picked up from the store).
    let cfg = saml.loadSamlConfig({ ...merged, idpCert: merged.certificate || merged.idpCert || null });
    // 1. Stored IdP metadata XML parses.
    if (merged.idpMetadataXml) {
      try {
        const parsed = saml.parseIdpMetadata(String(merged.idpMetadataXml));
        persistedFromMetadata.push(...fillFromParsedMetadata(merged, parsed));
        checks.push({
          check: 'idpMetadataParse',
          passed: Boolean(parsed.idpEntityId && parsed.idpSsoUrl && parsed.signingCerts.length > 0),
          detail: `entityID ${parsed.idpEntityId || '(none)'}, SSO ${parsed.idpSsoUrl || '(none)'} (${parsed.idpSsoBinding || 'no binding'}), ${parsed.signingCerts.length} signing cert(s)`,
          metadata: { idpEntityId: parsed.idpEntityId, idpSsoUrl: parsed.idpSsoUrl, idpSsoBinding: parsed.idpSsoBinding, signingCertCount: parsed.signingCerts.length },
        });
      } catch (err) {
        checks.push({ check: 'idpMetadataParse', passed: false, detail: `stored IdP metadata XML does not parse: ${err.message}` });
      }
    } else {
      checks.push({ check: 'idpMetadataParse', passed: true, detail: 'no IdP metadata XML stored (skipped)' });
    }
    // 2. IdP metadata URL fetches over verified TLS and parses.
    if (merged.idpMetadataUrl) {
      try {
        const loaded = await saml.loadIdpMetadata(String(merged.idpMetadataUrl));
        persistedFromMetadata.push(...fillFromParsedMetadata(merged, loaded));
        checks.push({
          check: 'idpMetadataFetch',
          passed: Boolean(loaded.idpEntityId && loaded.idpSsoUrl && loaded.signingCerts.length > 0),
          detail: `HTTP ${loaded.statusCode}, ${loaded.bytes} bytes; entityID ${loaded.idpEntityId || '(none)'}, SSO ${loaded.idpSsoUrl || '(none)'}, ${loaded.signingCerts.length} signing cert(s)`,
          metadata: { idpEntityId: loaded.idpEntityId, idpSsoUrl: loaded.idpSsoUrl, idpSsoBinding: loaded.idpSsoBinding, signingCertCount: loaded.signingCerts.length },
        });
      } catch (err) {
        checks.push({ check: 'idpMetadataFetch', passed: false, detail: `IdP metadata fetch/parse failed: ${err.message}` });
      }
    } else {
      checks.push({ check: 'idpMetadataFetch', passed: true, detail: 'no IdP metadata URL stored (skipped)' });
    }
    // Rebuild the config AFTER the metadata fills above, so the chain
    // and AuthnRequest checks below validate the filled config (a
    // metadata-only config must prove login-ready in this same test).
    cfg = saml.loadSamlConfig({ ...merged, idpCert: merged.certificate || merged.idpCert || null });
    // 3. Certificate chain: every IdP signing cert in date with a
    // signature that verifies against its issuer.
    const chain = checkCertChain(cfg.idpCerts || []);
    checks.push({
      check: 'certificateChain',
      passed: chain.passed,
      detail: chain.detail,
      certs: chain.perCert,
    });
    // 4. A real test AuthnRequest builds against the merged config, in a
    // throwaway cache so the test never pollutes the login request cache.
    if (cfg.issues.length > 0) {
      checks.push({ check: 'authnRequestBuild', passed: false, detail: `config is not login-ready: ${cfg.issues.join('; ')}` });
    } else {
      try {
        const { InMemoryCacheProvider } = require('@node-saml/node-saml');
        const testClient = saml.createSamlClient(cfg, { cacheProvider: new InMemoryCacheProvider({ keyExpirationPeriodMs: 8 * 60 * 60 * 1000 }) });
        const login = await saml.getLoginUrl(testClient, '/');
        const u = new URL(login.url);
        const requestId = extractAuthnRequestId(u.searchParams.get('SAMLRequest'));
        checks.push({
          check: 'authnRequestBuild',
          passed: true,
          detail: `AuthnRequest built${requestId ? ` (ID ${requestId})` : ''}; redirect target ${u.protocol}//${u.host}${u.pathname}`,
          idpRedirectHost: `${u.protocol}//${u.host}`,
          authnRequestId: requestId,
        });
      } catch (err) {
        checks.push({ check: 'authnRequestBuild', passed: false, detail: `AuthnRequest build failed: ${err.message}` });
      }
    }
  }

  // Persist any metadata-derived values filled in above (only the
  // fields that were empty — a /test never overwrites a value the
  // admin set by hand, and never saves other unsubmitted body fields).
  if (persistedFromMetadata.length > 0) {
    const toPersist = {};
    for (const field of persistedFromMetadata) toPersist[field] = merged[field];
    const newStored = { ...(stored && typeof stored === 'object' ? stored : {}), ...toPersist };
    putStored('auth.saml', newStored);
    mirrorSamlCanonical(newStored);
    auditLog('settings.saml.test.persist', { fields: persistedFromMetadata.join(',') });
  }

  // The required/certificate checks above ran on the pre-fill config.
  // If metadata parsing filled those fields during this test, the
  // checks must reflect the config as it now stands (filled values
  // are already persisted above, so this is not papering over a gap).
  if (persistedFromMetadata.length > 0) {
    for (const c of checks) {
      if (c.check.startsWith('required:')) {
        const field = c.check.slice('required:'.length);
        if (merged[field]) { c.passed = true; c.detail = `${String(merged[field])} (from IdP metadata)`; }
      }
      if (c.check === 'certificate' && merged.certificate) {
        const info = inspectCertificate(merged.certificate);
        c.passed = info.parsed && !info.expired && !info.notYetValid;
        c.detail = info.parsed
          ? `${info.subject} (valid ${info.validFrom} to ${info.validTo}; from IdP metadata)`
          : `unparsable: ${info.error}`;
        c.certificate = info.parsed ? info : null;
      }
    }
  }

  const allPassed = checks.every((c) => c.passed);
  auditLog('settings.saml.test', { passed: allPassed, checks: checks.map((c) => `${c.check}:${c.passed}`).join(',') });
  res.json({
    status: allPassed ? 'success' : 'error',
    message: allPassed
      ? 'SAML configuration fully validated: required fields present, certificates parse, are in date and chain-verify, IdP metadata parses/fetches, and a test AuthnRequest builds.'
      : 'SAML configuration validation failed: see checks.',
    testedAt: new Date().toISOString(),
    statusCheck: allPassed ? 'OK' : 'FAILED',
    checks,
    persistedFromMetadata,
    note: 'Full validation of the stored SAML configuration (metadata parse + certificate chain check + test AuthnRequest build). It does not perform a SAML login flow: no user assertion is exchanged.' + (persistedFromMetadata.length > 0 ? ` Values parsed from IdP metadata were saved into the stored config: ${persistedFromMetadata.join(', ')}.` : ''),
  });
});

// ------------------------------------------------------------------ proxy ---

const DEFAULT_PROXY = {
  enabled: false,
  protocol: null,
  host: null,
  port: null,
  authRequired: null,
  username: null,
  bypassList: null,
};

router.get('/api/settings/proxy', (req, res) => {
  const stored = getStored('proxy');
  const merged = { ...DEFAULT_PROXY, ...(stored && typeof stored === 'object' ? stored : {}) };
  const out = publicCopy(merged);
  out.passwordConfigured = Boolean(stored && (stored.password || stored.authPassword));
  res.json({ status: 'success', proxy: out });
});

router.post('/api/settings/proxy', (req, res) => {
  const stored = getStored('proxy');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('proxy', merged);
  auditLog('settings.proxy.save', { host: merged.host || null, port: merged.port || null });
  res.json({ status: 'success', message: 'Proxy server configuration saved.', proxy: publicCopy(merged) });
});

router.post('/api/settings/proxy/test', (req, res) => {
  const stored = getStored('proxy');
  const host = (req.body && req.body.host) || (stored && stored.host);
  const port = (req.body && req.body.port) || (stored && stored.port);
  if (!host || !port) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('No proxy is configured, so there is nothing to test through.'),
    });
  }
  const target = (req.body && req.body.target) || 'http://example.com/';
  const t0 = Date.now();
  const proxyReq = http.request(
    { host, port: Number(port), path: target, method: 'HEAD', timeout: 5000 },
    (proxyRes) => {
      proxyRes.resume();
      res.json({
        status: 'success',
        message: `Outbound request through proxy ${host}:${port} returned HTTP ${proxyRes.statusCode}.`,
        testedAt: new Date().toISOString(),
        statusCheck: 'OK',
        statusCode: proxyRes.statusCode,
        latencyMs: Date.now() - t0,
        target,
      });
    },
  );
  proxyReq.on('timeout', () => {
    proxyReq.destroy(new Error('Proxy request timed out'));
  });
  proxyReq.on('error', (err) => {
    res.json({
      status: 'error',
      message: `Outbound request through proxy ${host}:${port} failed: ${err.message}`,
      testedAt: new Date().toISOString(),
      statusCheck: 'FAILED',
      latencyMs: Date.now() - t0,
      target,
    });
  });
  proxyReq.end();
});

// ------------------------------------------------------- db maintenance ---
// Real SQLite store: sizes/counts from the actual file, backup history only
// for files that really exist, backup via VACUUM INTO, vacuum via VACUUM.

function backupHistory() {
  const h = getStored('db.backupHistory');
  return Array.isArray(h) ? h : [];
}

router.get('/api/settings/db', (req, res) => {
  const stats = sqliteStats();
  const size = dbFileSize();
  const history = backupHistory();
  const last = getStored('db.lastBackup');
  const schedule = getStored('db.schedule') || {
    enabled: false,
    frequency: null,
    time: null,
    retentionDays: null,
    backupPath: null,
  };
  res.json({
    status: 'success',
    db: {
      engine: 'SQLite (node:sqlite)',
      dbHost: null,
      dbPort: null,
      dbName: path.basename(DB_PATH),
      dbPath: DB_PATH,
      catalogSizeMB: size === null ? null : +(size / (1024 * 1024)).toFixed(2),
      dbSizeBytes: size,
      tableDataMB: null,
      indexSizeMB: null,
      tempFilesMB: null,
      totalRecords: stats.totalRecords,
      tableCount: stats.tableCount,
      activeConnections: null,
      maxConnections: null,
      cacheHitRatio: null,
      lastBackupTime: (last && last.timestamp) || null,
      lastBackupFile: (last && last.fileName) || null,
      lastBackupSizeMB: (last && last.sizeMB) || null,
      lastBackupSha256: (last && last.sha256) || null,
      schedule,
      backupHistory: history,
    },
  });
});

router.post('/api/settings/db/backup', (req, res) => {
  const fileName = `OpManager_DB_Manual_${stamp(new Date())}.db`;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dest = path.join(BACKUP_DIR, fileName);
  let conn = null;
  try {
    conn = new DatabaseSync(DB_PATH);
    conn.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Database backup failed: ${err.message}`,
    });
  } finally {
    if (conn) conn.close();
  }
  const size = fs.statSync(dest).size;
  const sha256 = sha256File(dest);
  const history = backupHistory();
  const nextNum = history.reduce((n, b) => {
    const m = /^BAK-(\d+)$/.exec(b.id || '');
    return m ? Math.max(n, Number(m[1])) : n;
  }, 100) + 1;
  const record = {
    id: `BAK-${nextNum}`,
    fileName,
    sizeMB: +(size / (1024 * 1024)).toFixed(2),
    sizeBytes: size,
    sha256,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    status: 'Success',
    trigger: 'Manual On-Demand',
  };
  const updated = [record, ...history].slice(0, 20);
  putStored('db.backupHistory', updated);
  putStored('db.lastBackup', record);
  auditLog('settings.db.backup', { fileName, sizeBytes: size, sha256 });
  res.json({
    status: 'success',
    message: `Database backup created successfully: ${fileName} (${humanSize(size)}). SHA-256: ${sha256}.`,
    backup: record,
  });
});

router.post('/api/settings/db/vacuum', (req, res) => {
  const sizeBefore = dbFileSize();
  const t0 = Date.now();
  let conn = null;
  try {
    conn = new DatabaseSync(DB_PATH);
    conn.exec('VACUUM;');
    conn.exec('ANALYZE;');
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `SQLite VACUUM failed: ${err.message}`,
    });
  } finally {
    if (conn) conn.close();
  }
  const durationMs = Date.now() - t0;
  const sizeAfter = dbFileSize();
  const reclaimedBytes = sizeBefore === null || sizeAfter === null ? null : sizeBefore - sizeAfter;
  auditLog('settings.db.vacuum', { durationMs, reclaimedBytes });
  res.json({
    status: 'success',
    message: `SQLite VACUUM and ANALYZE completed in ${durationMs} ms.`,
    durationMs,
    reclaimedBytes,
    reclaimedMB: reclaimedBytes === null ? null : +(reclaimedBytes / (1024 * 1024)).toFixed(2),
    sizeBeforeBytes: sizeBefore,
    sizeAfterBytes: sizeAfter,
  });
});

// -------------------------------------------------- system & rebranding ---

router.get('/api/settings/system', (req, res) => {
  const stored = getStored('system') || {};
  res.json({
    status: 'success',
    system: {
      hostname: os.hostname(),
      serverPort: SERVER_PORT,
      webProtocol: 'HTTP',
      sessionTimeoutMins: stored.sessionTimeoutMins ?? null,
      dnsReverseLookup: stored.dnsReverseLookup ?? null,
      dataRetentionDays: stored.dataRetentionDays ?? null,
      // Gap E: retention is now enforced by the poll cycle (see
      // server/services/retention.js). This object reports it honestly:
      // status is 'Not configured' until a valid retention is set, and
      // lastPurge is the real last purge run (or null if none ran yet).
      retention: retention.getRetentionStatus(store),
      monitoringThreads: null,
      snmpTimeoutSecs: stored.snmpTimeoutSecs ?? null,
      snmpRetries: stored.snmpRetries ?? null,
    },
  });
});

router.post('/api/settings/system', (req, res) => {
  const stored = getStored('system');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('system', merged);
  auditLog('settings.system.save', {});
  res.json({ status: 'success', message: 'System settings saved.', system: merged });
});

router.get('/api/settings/rebrand', (req, res) => {
  const stored = getStored('rebrand') || {};
  res.json({
    status: 'success',
    rebrand: {
      organizationName: stored.organizationName || null,
      productTitle: stored.productTitle || null,
      footerNotice: stored.footerNotice || null,
      headerLogo: stored.headerLogo || null,
      loginTitle: stored.loginTitle || null,
      supportEmail: stored.supportEmail || null,
    },
  });
});

router.post('/api/settings/rebrand', (req, res) => {
  const stored = getStored('rebrand');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('rebrand', merged);
  auditLog('settings.rebrand.save', {});
  res.json({ status: 'success', message: 'Product rebranding configuration saved.', rebrand: merged });
});

// ---------------------------------------------------------------------- ssl ---
// This server runs plain HTTP (see server/index.js: http.createServer).
// No certificate is loaded, so none is reported unless one is stored.

router.get('/api/settings/ssl', (req, res) => {
  const stored = getStored('ssl');
  if (stored && typeof stored === 'object') {
    // Audit L4 fix (close-out 2026-11-09): the TLS private key is never
    // returned. The certificate is public key material (sent to every TLS
    // peer) and is kept, so the UI can still show which cert is on file.
    const { privateKey: _dropped, ...rest } = stored;
    res.json({ status: 'success', ssl: { ...rest, privateKey: null, privateKeyConfigured: Boolean(stored.privateKey), effectiveHttps: false } });
    return;
  }
  res.json({
    status: 'success',
    ssl: {
      httpsEnabled: false,
      httpsPort: null,
      forceRedirect: null,
      tlsVersions: [],
      cipherSuite: null,
      certificate: null,
      status: 'Not configured — this server runs plain HTTP.',
    },
  });
});

router.post('/api/settings/ssl', (req, res) => {
  const stored = getStored('ssl');
  const merged = { ...(stored && typeof stored === 'object' ? stored : {}), ...(req.body || {}) };
  putStored('ssl', merged);
  auditLog('settings.ssl.save', { httpsEnabled: Boolean(merged.httpsEnabled) });
  // Audit L4 fix (close-out 2026-11-09): never return the private key.
  const { privateKey: _dropped, ...rest } = merged;
  res.json({
    status: 'success',
    message: 'SSL / TLS settings saved. Note: this server runs plain HTTP; saving settings does not enable HTTPS by itself.',
    ssl: { ...rest, privateKey: null, privateKeyConfigured: Boolean(merged.privateKey), effectiveHttps: false },
  });
});

router.post('/api/settings/ssl/test', (req, res) => {
  const stored = getStored('ssl');
  const body = req.body || {};
  const host = body.host || (stored && stored.host);
  const port = Number(body.port || (stored && stored.port) || 443);
  if (!host && !(stored && stored.certificate)) {
    return res.status(501).json({
      status: 'error',
      ...NOT_IMPLEMENTED('No TLS target is configured (no host in the request body or stored SSL settings) and no certificate is stored, so there is nothing to verify.'),
    });
  }
  // A stored certificate (PEM) can be verified without any network target.
  if (!host && stored && stored.certificate) {
    const info = inspectCertificate(stored.certificate);
    const passed = info.parsed && !info.expired && !info.notYetValid;
    auditLog('settings.ssl.test', { target: 'stored-certificate', passed });
    return res.json({
      status: passed ? 'success' : 'error',
      message: passed
        ? 'Stored certificate parses and is within its validity dates.'
        : 'Stored certificate failed validation: see certificate detail.',
      testedAt: new Date().toISOString(),
      statusCheck: passed ? 'OK' : 'FAILED',
      certificate: info,
    });
  }
  // Real TLS handshake to the target: report the peer certificate exactly
  // as the server presented it (authorized:false is reported, not hidden).
  const t0 = Date.now();
  let done = false;
  const finish = (payload) => {
    if (done) return;
    done = true;
    res.json(payload);
  };
  const socket = tls.connect({
    host: String(host),
    port,
    servername: String(host),
    rejectUnauthorized: false,
    timeout: 5000,
  });
  socket.on('secureConnect', () => {
    const latencyMs = Date.now() - t0;
    const raw = socket.getPeerCertificate(true);
    let certificate = null;
    if (raw && Object.keys(raw).length) {
      const validTo = raw.valid_to ? new Date(raw.valid_to) : null;
      const validFrom = raw.valid_from ? new Date(raw.valid_from) : null;
      const now = new Date();
      certificate = {
        subject: raw.subject ? raw.subject.CN || JSON.stringify(raw.subject) : null,
        issuer: raw.issuer ? raw.issuer.CN || JSON.stringify(raw.issuer) : null,
        subjectAltName: raw.subjectaltname || null,
        validFrom: raw.valid_from || null,
        validTo: raw.valid_to || null,
        expired: validTo ? now > validTo : null,
        notYetValid: validFrom ? now < validFrom : null,
        daysRemaining: validTo ? Math.floor((validTo - now) / (24 * 60 * 60 * 1000)) : null,
        fingerprint256: raw.fingerprint256 || null,
        serialNumber: raw.serialNumber || null,
      };
    }
    const authorized = socket.authorized === true;
    const certOk = certificate && certificate.expired === false && certificate.notYetValid === false;
    const passed = authorized && certOk;
    const protocol = socket.getProtocol ? socket.getProtocol() : null;
    const cipher = socket.getCipher ? socket.getCipher() : null;
    const authorizationError = socket.authorizationError ? String(socket.authorizationError) : null;
    auditLog('settings.ssl.test', { host: String(host), port, authorized, passed });
    socket.destroy();
    finish({
      status: passed ? 'success' : 'error',
      message: passed
        ? `TLS handshake to ${host}:${port} succeeded with a valid, authorized certificate.`
        : `TLS handshake to ${host}:${port} completed but the certificate is not trusted/valid: authorized=${authorized}${authorizationError ? ` (${authorizationError})` : ''}${certificate && certificate.expired ? ' (EXPIRED)' : ''}.`,
      testedAt: new Date().toISOString(),
      statusCheck: passed ? 'OK' : 'FAILED',
      host: String(host),
      port,
      latencyMs,
      protocol,
      cipher,
      authorized,
      authorizationError,
      certificate,
    });
  });
  socket.on('timeout', () => {
    socket.destroy();
    finish({
      status: 'error',
      message: `TLS connect to ${host}:${port} timed out.`,
      testedAt: new Date().toISOString(),
      statusCheck: 'FAILED',
      host: String(host),
      port,
      latencyMs: Date.now() - t0,
    });
  });
  socket.on('error', (err) => {
    finish({
      status: 'error',
      message: `TLS connect to ${host}:${port} failed: ${err.message}`,
      testedAt: new Date().toISOString(),
      statusCheck: 'FAILED',
      host: String(host),
      port,
      latencyMs: Date.now() - t0,
    });
  });
});

module.exports = router;
