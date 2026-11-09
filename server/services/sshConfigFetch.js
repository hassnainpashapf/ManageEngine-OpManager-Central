'use strict';
/**
 * NCM config backup retrieval over real SSH (Phase 3, track ncm-backup).
 *
 * Retrieval order (per the track task):
 *   1. SSH (ssh2) using the device's STORED SSH credentials — the device
 *      record links to a credentials row of type 'ssh' via
 *      devices.ssh_credential_id. If the device record has no such link (or
 *      the linked row is missing / not type 'ssh' / has no username or
 *      password), NOTHING is attempted against the device and the caller gets
 *      an honest NOT_CONFIGURED result naming the exact missing piece.
 *   2. There is no second transport in this phase (no TFTP, no SNMP config
 *      fetch). A device without stored SSH credentials is a 501, not a
 *      fallback to anything else.
 *
 * What this does NOT do:
 *   - No key-based auth yet: the credentials table has no private-key column,
 *     so only password auth is supported. A credential without a password is
 *     reported as missing, not worked around.
 *   - No vendor auto-detection beyond the command list: the default (and
 *     only, for now) fetch command is `show running-config` (Cisco IOS /
 *     IOS-XE style). If the device answers that command with an error or
 *     empty output, the fetch fails honestly instead of storing garbage.
 *   - Credentials are NEVER written to logs. Error messages carry the host,
 *     port and username only — never the password.
 *
 * The returned config text is the device's raw stdout for the fetch command
 * (trailing blank lines trimmed). Callers store it via
 * store.configs.saveConfig(deviceId, 'running-config', content); the stored
 * row id is the backup revision and fetched_at is the backup timestamp.
 */

const { Client } = require('ssh2');

const DEFAULT_PORT = 22;
const DEFAULT_TIMEOUT_MS = 30000;
const FETCH_COMMANDS = ['show running-config'];

// ssh2 surfaces auth failure as a generic Error; match its text so the
// caller can report "wrong credentials" instead of "unreachable".
const AUTH_FAILURE_PATTERNS = [
  'all configured authentication methods failed',
  'authentication failure',
  'no supported authentication methods available',
];

function isAuthFailure(err) {
  const msg = String((err && err.message) || '').toLowerCase();
  return AUTH_FAILURE_PATTERNS.some((p) => msg.includes(p));
}

/**
 * Resolve the stored SSH credentials for a device record.
 * getCredential is store.credentials.getCredential (or store.getCredential).
 * Returns { ok: true, credential, port } or
 * { ok: false, missing: '<exact missing piece>' }.
 */
function resolveSshCredentials(device, getCredential) {
  if (!device) return { ok: false, missing: 'no device record' };
  if (device.ssh_credential_id === undefined || device.ssh_credential_id === null) {
    return {
      ok: false,
      missing: `no SSH credentials configured for this device: devices.ssh_credential_id is not set for device ${device.id} (no credential linked)`,
    };
  }
  const cred = typeof getCredential === 'function' ? getCredential(device.ssh_credential_id) : null;
  if (!cred) {
    return {
      ok: false,
      missing: `no SSH credentials configured for this device: linked credential ${device.ssh_credential_id} does not exist`,
    };
  }
  if (cred.type !== 'ssh') {
    return {
      ok: false,
      missing: `no SSH credentials configured for this device: linked credential ${cred.id} is of type '${cred.type}', not 'ssh'`,
    };
  }
  if (!cred.username) {
    return {
      ok: false,
      missing: `no SSH credentials configured for this device: linked SSH credential ${cred.id} has no username`,
    };
  }
  if (!cred.password) {
    return {
      ok: false,
      missing: `no SSH credentials configured for this device: linked SSH credential ${cred.id} has no password (key-based auth is not supported: the credentials table has no private-key column)`,
    };
  }
  const port = Number(device.ssh_port) || DEFAULT_PORT;
  return { ok: true, credential: cred, port };
}

/**
 * Fetch the running config from one host over real SSH (password auth).
 * options: { host, port, username, password, commands, timeoutMs }
 * Resolves { content, command, bytes, lines } or rejects with an Error whose
 * .code is one of 'ssh_auth_failed' | 'ssh_timeout' | 'ssh_unreachable' |
 * 'ssh_failed' | 'ssh_empty_output'.
 */
function fetchRunningConfigViaSsh(options) {
  const opts = options || {};
  const host = opts.host;
  const port = Number(opts.port) || DEFAULT_PORT;
  const username = opts.username;
  const password = opts.password;
  const commands = Array.isArray(opts.commands) && opts.commands.length ? opts.commands : FETCH_COMMANDS;
  const timeoutMs = Number(opts.timeoutMs) || DEFAULT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    if (!host) return reject(Object.assign(new Error('SSH fetch requires a host'), { code: 'ssh_failed' }));
    if (!username || !password) {
      return reject(Object.assign(new Error('SSH fetch requires a username and password'), { code: 'ssh_failed' }));
    }
    const conn = new Client();
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch { /* already gone */ }
      reject(Object.assign(
        new Error(`SSH fetch to ${host}:${port} timed out after ${timeoutMs}ms`),
        { code: 'ssh_timeout' }
      ));
    }, timeoutMs);
    const done = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { conn.end(); } catch { /* already gone */ }
      if (err) return reject(err);
      return resolve(result);
    };

    conn.on('error', (err) => {
      if (isAuthFailure(err)) {
        return done(Object.assign(
          new Error(`SSH authentication failed for ${username}@${host}:${port}: wrong username/password or the account is not allowed SSH access`),
          { code: 'ssh_auth_failed' }
        ));
      }
      const msg = String((err && err.message) || err);
      const code = /ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ETIMEDOUT|ECONNRESET/i.test(msg)
        ? 'ssh_unreachable'
        : 'ssh_failed';
      return done(Object.assign(
        new Error(`SSH connection to ${host}:${port} failed: ${msg}`),
        { code }
      ));
    });

    conn.on('ready', () => {
      // Try the fetch commands in order; the first that returns non-empty
      // output with exit status 0 wins. A device that errors on every
      // command yields an honest failure, never stored output.
      let idx = 0;
      const tryNext = (lastErr) => {
        if (idx >= commands.length) {
          return done(lastErr || Object.assign(
            new Error(`SSH fetch to ${host}:${port} failed: device rejected every fetch command (${commands.join(', ')})`),
            { code: 'ssh_failed' }
          ));
        }
        const command = commands[idx++];
        conn.exec(command, (execErr, stream) => {
          if (execErr) return tryNext(execErr);
          let stdout = '';
          let stderr = '';
          stream.on('data', (d) => { stdout += d.toString('utf8'); });
          stream.stderr.on('data', (d) => { stderr += d.toString('utf8'); });
          stream.on('close', (exitCode) => {
            const content = stdout.replace(/[\r\n]+$/, '');
            if (exitCode !== 0 && exitCode !== null) {
              return tryNext(Object.assign(
                new Error(`SSH fetch to ${host}:${port} failed: device rejected '${command}' (exit ${exitCode})${stderr.trim() ? `: ${stderr.trim().slice(0, 200)}` : ''}`),
                { code: 'ssh_failed' }
              ));
            }
            if (!content.trim()) {
              return tryNext(Object.assign(
                new Error(`SSH fetch to ${host}:${port} failed: device returned empty output for '${command}'`),
                { code: 'ssh_empty_output' }
              ));
            }
            return done(null, {
              content,
              command,
              bytes: Buffer.byteLength(content, 'utf8'),
              lines: content.split('\n').length,
            });
          });
        });
      };
      tryNext();
    });

    conn.connect({
      host,
      port,
      username,
      password,
      readyTimeout: timeoutMs,
      // Do not accept unknown host keys blindly in production use; for this
      // phase the operator's devices are reached by IP on trusted networks
      // and ssh2's default (accept any host key) matches the poller's
      // trust posture. Host-key pinning is a documented gap (see report).
    });
  });
}

/**
 * Full backup attempt for one device record.
 * Returns one of:
 *   { status: 'not_configured', missing }  — no attempt was made
 *   { status: 'ok', content, command, bytes, lines, host, port, username }
 *   { status: 'failed', code, message }    — SSH was attempted and failed
 */
async function fetchDeviceConfig(device, getCredential, options) {
  const resolved = resolveSshCredentials(device, getCredential);
  if (!resolved.ok) return { status: 'not_configured', missing: resolved.missing };
  const { credential, port } = resolved;
  try {
    const fetched = await fetchRunningConfigViaSsh({
      host: device.ip,
      port,
      username: credential.username,
      password: credential.password,
      ...(options || {}),
    });
    return { status: 'ok', host: device.ip, port, username: credential.username, ...fetched };
  } catch (err) {
    return {
      status: 'failed',
      code: (err && err.code) || 'ssh_failed',
      message: (err && err.message) || 'SSH fetch failed',
    };
  }
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_TIMEOUT_MS,
  FETCH_COMMANDS,
  resolveSshCredentials,
  fetchRunningConfigViaSsh,
  fetchDeviceConfig,
};
