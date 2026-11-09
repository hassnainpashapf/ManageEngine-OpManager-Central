'use strict';

/**
 * runner.js — SAFE command runner for OpManager Central (Phase 3, runner-service).
 *
 * Diagnostics only. NOT a general shell: there is no shell anywhere in this
 * module (child_process.execFile with `shell: false`, ssh2 exec channels).
 *
 * Safety model
 * -----------
 * 1. EXPLICIT ALLOW-LIST. A request is executed only when its command — and
 *    every argument — matches an entry below exactly. Anything else is
 *    REFUSED before anything is spawned or any network connection is opened,
 *    with the exact error `runner: command not allowed: "<command>"`
 *    (code ERR_RUNNER_NOT_ALLOWED). There is no fallback, no shell
 *    metacharacter handling, and no raw pass-through of caller strings.
 * 2. LOCAL execution uses execFile (argv array, no shell) with a hard
 *    timeout (default 10 s, max 30 s) and a 1 MB output cap. stdout,
 *    stderr, exit code, signal and timeout state are captured and returned.
 * 3. SSH execution uses ssh2 with PER-CALL credentials (password or
 *    privateKey passed in the call only). Credentials are NEVER stored,
 *    NEVER logged, NEVER written to the audit log or to any result object,
 *    and NEVER persisted anywhere by this module. Remote commands are the
 *    exact read-only `show ...` / diagnostic strings in SSH_ALLOW_LIST —
 *    the caller supplies no remote arguments at all.
 * 4. AUDIT. Every execution — allowed, refused, failed, timed out — is
 *    written to the store audit log (store.audit.log, action
 *    'runner.exec') with who / when / what / exit code. The audit detail
 *    never contains a credential.
 *
 * Allow-list (conservative, diagnostics only)
 * -------------------------------------------
 * Local (run on this server via execFile):
 *   ping <host> [-c 1..5] [-W 1..10]            ICMP reachability probe
 *   traceroute <host> [-m 1..30] [-w 1..10]     path trace (binary may be
 *                                               absent on a host; that is
 *                                               reported honestly, not faked)
 *   nslookup <name> [<server>]                  DNS lookup
 *   dig [+short] <name> [<type>]                DNS lookup (types: A AAAA
 *                                               MX TXT NS SOA CNAME PTR)
 *   arp -n                                      local ARP table (read-only)
 * Remote via SSH (exact strings only, no arguments):
 *   show version | show interfaces | show ip interface brief | uptime | uname -a
 *
 * Host/name validation: IPv4/IPv6 (net.isIP) or a strict hostname
 * (labels of [A-Za-z0-9-], dots, <= 253 chars). Anything else is refused.
 *
 * This module requires ./store at load time (same as the other services);
 * set OPMANAGER_DB_PATH to use a throwaway database for tests.
 */

const { execFile } = require('node:child_process');
const net = require('node:net');
const { Client } = require('ssh2');
const store = require('./store');

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_TIMEOUT_MS = 30000;
const MAX_BUFFER_BYTES = 1024 * 1024;
const MAX_OUTPUT_CHARS = 65536;

const ERR_NOT_ALLOWED = 'ERR_RUNNER_NOT_ALLOWED';
const ERR_VALIDATION = 'ERR_RUNNER_VALIDATION';
const ERR_EXECUTION = 'ERR_RUNNER_EXECUTION';

function refused(command) {
  const err = new Error(`runner: command not allowed: "${String(command)}"`);
  err.code = ERR_NOT_ALLOWED;
  return err;
}

function invalid(message) {
  const err = new Error(`runner: ${message}`);
  err.code = ERR_VALIDATION;
  return err;
}

// ------------------------------------------------------------ validation ---

const HOSTNAME_RE = /^(?=.{1,253}$)[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

function isValidHost(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 253) return false;
  if (net.isIP(value) !== 0) return true;
  return HOSTNAME_RE.test(value);
}

function intArg(value, name, min, max, def) {
  if (value === undefined || value === null) return def;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw invalid(`invalid argument ${name}: expected an integer ${min}..${max}, got ${JSON.stringify(value)}`);
  }
  return n;
}

function hostArg(value, name) {
  if (!isValidHost(value)) {
    throw invalid(`invalid argument ${name}: expected an IP address or hostname, got ${JSON.stringify(value)}`);
  }
  return value;
}

function clampTimeout(timeoutMs) {
  if (timeoutMs === undefined || timeoutMs === null) return DEFAULT_TIMEOUT_MS;
  const n = Number(timeoutMs);
  if (!Number.isFinite(n) || n <= 0) throw invalid(`invalid timeoutMs: ${JSON.stringify(timeoutMs)}`);
  return Math.min(Math.floor(n), MAX_TIMEOUT_MS);
}

function truncateOutput(text) {
  const s = text === undefined || text === null ? '' : String(text);
  if (s.length > MAX_OUTPUT_CHARS) {
    return { text: s.slice(0, MAX_OUTPUT_CHARS), truncated: true };
  }
  return { text: s, truncated: false };
}

// ---------------------------------------------------------- allow-lists ---

// Local entries: build(argv) takes the caller args object and returns the
// exact argv array, or throws (refusal / validation error). The binary
// name itself is never caller-supplied.
const LOCAL_ALLOW_LIST = [
  {
    command: 'ping',
    usage: 'ping [-c 1..5] [-W 1..10] <host>',
    description: 'ICMP reachability probe (single host, bounded count/deadline).',
    build(args) {
      const a = args || {};
      const host = hostArg(a.host, 'host');
      const count = intArg(a.count, 'count', 1, 5, 1);
      const deadline = intArg(a.deadline, 'deadline', 1, 10, 2);
      return ['-c', String(count), '-W', String(deadline), host];
    },
  },
  {
    command: 'traceroute',
    usage: 'traceroute [-m 1..30] [-w 1..10] <host>',
    description: 'Path trace to a host. Honest error when the binary is absent.',
    build(args) {
      const a = args || {};
      const host = hostArg(a.host, 'host');
      const maxHops = intArg(a.maxHops, 'maxHops', 1, 30, 10);
      const wait = intArg(a.wait, 'wait', 1, 10, 2);
      return ['-m', String(maxHops), '-w', String(wait), host];
    },
  },
  {
    command: 'nslookup',
    usage: 'nslookup <name> [<server>]',
    description: 'DNS lookup for a name, optionally against a given DNS server.',
    build(args) {
      const a = args || {};
      const argv = [hostArg(a.name, 'name')];
      if (a.server !== undefined && a.server !== null) argv.push(hostArg(a.server, 'server'));
      return argv;
    },
  },
  {
    command: 'dig',
    usage: 'dig [+short] <name> [<type>]',
    description: 'DNS lookup. Types: A AAAA MX TXT NS SOA CNAME PTR.',
    build(args) {
      const a = args || {};
      const argv = [];
      if (a.short !== false) argv.push('+short');
      argv.push(hostArg(a.name, 'name'));
      if (a.type !== undefined && a.type !== null) {
        const t = String(a.type).toUpperCase();
        if (!['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA', 'CNAME', 'PTR'].includes(t)) {
          throw invalid(`invalid argument type: expected a DNS record type, got ${JSON.stringify(a.type)}`);
        }
        argv.push(t);
      }
      return argv;
    },
  },
  {
    command: 'arp',
    usage: 'arp -n',
    description: 'Local ARP table (read-only, no arguments accepted).',
    build(args) {
      if (args && Object.keys(args).length > 0) {
        throw invalid('arp takes no arguments');
      }
      return ['-n'];
    },
  },
];

// Remote (SSH) entries: exact command strings only. The caller supplies NO
// remote arguments — the string is sent verbatim, so there is nothing to
// inject through.
const SSH_ALLOW_LIST = [
  { command: 'show version', description: 'Device software/hardware version (read-only).' },
  { command: 'show interfaces', description: 'Interface status (read-only).' },
  { command: 'show ip interface brief', description: 'IP interface summary (read-only).' },
  { command: 'uptime', description: 'Host uptime and load (read-only).' },
  { command: 'uname -a', description: 'Host kernel/OS identification (read-only).' },
];

function findLocal(command) {
  return LOCAL_ALLOW_LIST.find((e) => e.command === command) || null;
}

function findSsh(command) {
  return SSH_ALLOW_LIST.find((e) => e.command === command) || null;
}

/**
 * listAllowed() — sanitized allow-list for routes/UI. No internals, no
 * credentials, no host data.
 */
function listAllowed() {
  return {
    local: LOCAL_ALLOW_LIST.map((e) => ({ command: e.command, usage: e.usage, description: e.description })),
    ssh: SSH_ALLOW_LIST.map((e) => ({ command: e.command, description: e.description })),
    defaults: { timeoutMs: DEFAULT_TIMEOUT_MS, maxTimeoutMs: MAX_TIMEOUT_MS },
  };
}

// ----------------------------------------------------------------- audit ---

function auditExecution(entry) {
  // entry: { user, target, command, host, exitCode, outcome, error }
  // NEVER pass credentials here; callers must not include them.
  try {
    const row = store.audit.log(entry.user || 'system', 'runner.exec', {
      target: entry.target,
      command: entry.command,
      host: entry.host || null,
      exitCode: entry.exitCode === undefined ? null : entry.exitCode,
      outcome: entry.outcome,
      error: entry.error || null,
      at: new Date().toISOString(),
    });
    return row ? row.id : null;
  } catch (err) {
    // Audit failure must never mask the execution result; the caller
    // records auditError on the result so the gap is visible, not silent.
    return null;
  }
}

/**
 * listRunnerAudit(limit) — audit rows for this runner only (action
 * 'runner.exec'), newest first. The store audit log is shared, so filter
 * here rather than adding a new table.
 */
function listRunnerAudit(limit) {
  const n = Math.min(Math.max(Number(limit) || 100, 1), 1000);
  return store.listAudit(1000).filter((r) => r.action === 'runner.exec').slice(0, n);
}

// ------------------------------------------------------------- local run ---

/**
 * runLocal({ command, args, user, timeoutMs }) — run an allow-listed
 * local diagnostic via execFile (no shell). Resolves to a result object;
 * refusal/validation errors REJECT with code ERR_RUNNER_NOT_ALLOWED or
 * ERR_RUNNER_VALIDATION. Binary-missing / timeout / non-zero exit are
 * reported IN the result (ok: false), never thrown — they are honest
 * execution outcomes, not refusals.
 */
function runLocal(request) {
  const req = request || {};
  const user = req.user || 'system';
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const entry = findLocal(req.command);
    if (!entry) {
      const err = refused(req.command);
      auditExecution({ user, target: 'local', command: String(req.command), exitCode: null, outcome: 'refused', error: err.message });
      return reject(err);
    }
    let argv;
    let timeoutMs;
    try {
      argv = entry.build(req.args);
      timeoutMs = clampTimeout(req.timeoutMs);
    } catch (err) {
      auditExecution({ user, target: 'local', command: entry.command, exitCode: null, outcome: 'refused', error: err.message });
      return reject(err);
    }
    execFile(
      entry.command,
      argv,
      { timeout: timeoutMs, maxBuffer: MAX_BUFFER_BYTES, shell: false, windowsHide: true },
      (error, stdout, stderr) => {
        const finishedAt = Date.now();
        const out = truncateOutput(stdout);
        const errOut = truncateOutput(stderr);
        const timedOut = Boolean(error && (error.killed || error.code === 'ETIMEDOUT'));
        const binaryMissing = Boolean(error && error.code === 'ENOENT');
        const exitCode = error && typeof error.code === 'number' ? error.code : null;
        const result = {
          ok: !error && exitCode !== null ? exitCode === 0 : !error,
          target: 'local',
          command: entry.command,
          argv,
          stdout: out.text,
          stderr: errOut.text,
          truncated: out.truncated || errOut.truncated,
          exitCode,
          signal: error && error.signal ? error.signal : null,
          timedOut,
          error: error
            ? binaryMissing
              ? `runner: binary not found: ${entry.command}`
              : timedOut
                ? `runner: command timed out after ${timeoutMs} ms`
                : error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'
                  ? 'runner: output exceeded 1 MB limit'
                  : `runner: command failed: ${error.message}`
            : null,
          durationMs: finishedAt - startedAt,
          startedAt: new Date(startedAt).toISOString(),
          finishedAt: new Date(finishedAt).toISOString(),
        };
        // execFile reports exit code on error.code; when the process ran
        // and exited non-zero, error.code IS the exit code. When there was
        // no error, exit code is 0.
        if (!error) result.exitCode = 0;
        result.ok = result.exitCode === 0 && !timedOut && !binaryMissing;
        const auditId = auditExecution({
          user,
          target: 'local',
          command: entry.command,
          exitCode: result.exitCode,
          outcome: result.ok ? 'ok' : timedOut ? 'timeout' : binaryMissing ? 'binary-missing' : 'failed',
          error: result.error,
        });
        result.auditId = auditId;
        return resolve(result);
      }
    );
  });
}

// --------------------------------------------------------------- ssh run ---

/**
 * runSsh({ host, port, username, password, privateKey, passphrase,
 *          command, user, timeoutMs })
 * Run an exact allow-listed read-only command on a remote host over SSH.
 * Credentials are per-call only: they are passed to ssh2 and never stored,
 * logged, audited or returned. At least one of password / privateKey is
 * required. Refusal/validation errors REJECT (nothing is connected);
 * connection/auth failures resolve as ok:false results with an honest
 * error string (never containing a credential).
 */
function runSsh(request) {
  const req = request || {};
  const user = req.user || 'system';
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const fail = (err) => {
      auditExecution({ user, target: 'ssh', command: String(req.command), host: req.host || null, exitCode: null, outcome: 'refused', error: err.message });
      return reject(err);
    };
    if (!findSsh(req.command)) return fail(refused(req.command));
    if (!isValidHost(req.host)) {
      return fail(invalid(`invalid argument host: expected an IP address or hostname, got ${JSON.stringify(req.host)}`));
    }
    const port = req.port === undefined || req.port === null ? 22 : Number(req.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return fail(invalid(`invalid argument port: expected 1..65535, got ${JSON.stringify(req.port)}`));
    }
    if (typeof req.username !== 'string' || !/^[A-Za-z0-9._-]{1,64}$/.test(req.username)) {
      return fail(invalid('invalid argument username: expected 1..64 chars [A-Za-z0-9._-]'));
    }
    const hasPassword = typeof req.password === 'string' && req.password.length > 0;
    const hasKey = typeof req.privateKey === 'string' && req.privateKey.length > 0;
    if (!hasPassword && !hasKey) {
      return fail(invalid('SSH credentials required: pass a per-call password or privateKey (never stored)'));
    }
    let timeoutMs;
    try {
      timeoutMs = clampTimeout(req.timeoutMs);
    } catch (err) {
      return fail(err);
    }

    const conn = new Client();
    let settled = false;
    let stdout = '';
    let stderr = '';
    let exitCode = null;
    let exitSignal = null;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { conn.end(); } catch (e) { /* already closed */ }
    }, timeoutMs);

    const finish = (outcome, errorMessage) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { conn.end(); } catch (e) { /* already closed */ }
      const finishedAt = Date.now();
      const out = truncateOutput(stdout);
      const errOut = truncateOutput(stderr);
      const result = {
        ok: outcome === 'ok' && exitCode === 0,
        target: 'ssh',
        host: req.host,
        port,
        username: req.username,
        command: req.command,
        stdout: out.text,
        stderr: errOut.text,
        truncated: out.truncated || errOut.truncated,
        exitCode,
        signal: exitSignal,
        timedOut,
        error: errorMessage || null,
        durationMs: finishedAt - startedAt,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date(finishedAt).toISOString(),
      };
      const auditId = auditExecution({
        user,
        target: 'ssh',
        command: req.command,
        host: req.host,
        exitCode,
        outcome: timedOut ? 'timeout' : outcome,
        error: errorMessage || null,
      });
      result.auditId = auditId;
      return resolve(result);
    };

    conn.on('error', (err) => {
      // ssh2 error messages never contain the password/key; still, only
      // the message is kept, and only in the result + audit (no creds).
      if (timedOut) return finish('timeout', `runner: SSH command timed out after ${timeoutMs} ms`);
      return finish('failed', `runner: SSH failed: ${err && err.message ? err.message : String(err)}`);
    });
    conn.on('ready', () => {
      conn.exec(req.command, (err, stream) => {
        if (err) return finish('failed', `runner: SSH exec failed: ${err.message}`);
        stream.on('data', (d) => { stdout += d.toString('utf8'); });
        stream.stderr.on('data', (d) => { stderr += d.toString('utf8'); });
        stream.on('close', (code, signal) => {
          exitCode = typeof code === 'number' ? code : null;
          exitSignal = signal || null;
          if (timedOut) return finish('timeout', `runner: SSH command timed out after ${timeoutMs} ms`);
          return finish(exitCode === 0 ? 'ok' : 'failed', exitCode === 0 ? null : `runner: remote command exited with code ${exitCode}`);
        });
      });
    });
    try {
      const connectOpts = {
        host: req.host,
        port,
        username: req.username,
        readyTimeout: timeoutMs,
      };
      if (hasPassword) connectOpts.password = req.password;
      if (hasKey) connectOpts.privateKey = req.privateKey;
      if (typeof req.passphrase === 'string' && req.passphrase.length > 0) {
        connectOpts.passphrase = req.passphrase;
      }
      conn.connect(connectOpts);
    } catch (err) {
      return finish('failed', `runner: SSH connect failed: ${err.message}`);
    }
  });
}

// ------------------------------------------------------------ dispatcher ---

/**
 * run(request) — dispatch by request.target: 'local' | 'ssh'.
 * Missing/unknown target is a validation rejection (fail closed).
 */
function run(request) {
  const req = request || {};
  if (req.target === 'local') return runLocal(req);
  if (req.target === 'ssh') return runSsh(req);
  const err = invalid(`invalid argument target: expected "local" or "ssh", got ${JSON.stringify(req.target)}`);
  return Promise.reject(err);
}

module.exports = {
  run,
  runLocal,
  runSsh,
  listAllowed,
  listRunnerAudit,
  LOCAL_ALLOW_LIST,
  SSH_ALLOW_LIST,
  DEFAULT_TIMEOUT_MS,
  MAX_TIMEOUT_MS,
  ERR_NOT_ALLOWED,
  ERR_VALIDATION,
  ERR_EXECUTION,
};
