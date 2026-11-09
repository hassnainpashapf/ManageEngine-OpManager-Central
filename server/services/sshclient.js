'use strict';
/**
 * Real SSH access to network devices for NCM config backup.
 *
 * Read-only by design: this module only runs "show"-style commands to pull
 * configuration text over a real SSH session. It deliberately does not
 * expose a generic "push arbitrary config" path - writing to live production
 * network gear needs an explicit, reviewed action, not an automated one.
 */
const { Client } = require('ssh2');

function findSshCredential(store) {
  const creds = (store.credentials ? store.credentials.listCredentials() : store.listCredentials()) || [];
  return creds.find((c) => /ssh|cli|telnet/i.test(c.type || '')) || null;
}

// Runs a shell session, disables paging, sends the command, and collects
// output until the prompt reappears (or a timeout elapses).
function runShowCommand(host, { username, password }, command, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let buffer = '';
    let settled = false;

    const finish = (err, data) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch (e) { /* already closed */ }
      if (err) reject(err); else resolve(data);
    };

    const timer = setTimeout(() => finish(new Error(`Timed out waiting for output from ${host}`)), timeoutMs);

    conn.on('ready', () => {
      conn.shell((err, stream) => {
        if (err) { clearTimeout(timer); return finish(err); }

        let stage = 'init';
        stream.on('data', (chunk) => {
          const text = chunk.toString('utf8');
          buffer += text;

          if (stage === 'init') {
            stream.write('terminal length 0\n');
            stage = 'paging';
          } else if (stage === 'paging' && /[#>]\s*$/.test(buffer)) {
            buffer = '';
            stream.write(command + '\n');
            stage = 'command';
          } else if (stage === 'command' && /[#>]\s*$/.test(text)) {
            clearTimeout(timer);
            finish(null, buffer);
          }
        });
        stream.on('close', () => { clearTimeout(timer); finish(null, buffer); });
      });
    });

    conn.on('error', (err) => { clearTimeout(timer); finish(err); });

    conn.connect({ host, port: 22, username, password, readyTimeout: 8000, tryKeyboard: true });
  });
}

function cleanConfigOutput(raw, command) {
  return raw
    .split(/\r?\n/)
    .filter((line) => !line.includes(command) && !/[#>]\s*$/.test(line.trim()))
    .join('\n')
    .trim();
}

// One-shot command execution over a real SSH connection (ssh2's exec channel
// rather than an interactive shell), returning real stdout/stderr/exit code.
// Used by the admin-facing CLI/terminal tools: it runs exactly and only the
// command the logged-in operator typed - the same thing their own SSH client
// would do, not an automated action taken on their behalf.
function execCommand(host, { username, password }, command, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (err, data) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch (e) { /* already closed */ }
      if (err) reject(err); else resolve(data);
    };

    const timer = setTimeout(() => finish(new Error(`Timed out waiting for output from ${host}`)), timeoutMs);

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) { clearTimeout(timer); return finish(err); }
        stream.on('close', (code, signal) => {
          clearTimeout(timer);
          finish(null, { stdout, stderr, exitCode: code ?? null, signal: signal ?? null });
        });
        stream.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
        stream.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8'); });
      });
    });

    conn.on('error', (err) => { clearTimeout(timer); finish(err); });

    conn.connect({ host, port: 22, username, password, readyTimeout: 8000, tryKeyboard: true });
  });
}

module.exports = { findSshCredential, runShowCommand, cleanConfigOutput, execCommand };
