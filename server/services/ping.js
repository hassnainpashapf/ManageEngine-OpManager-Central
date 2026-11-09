'use strict';

/**
 * ping.js — Real reachability probes for the OpManager Central real-data poller.
 *
 * Two different measurements, kept strictly separate:
 *  - pingMs(ip): real ICMP echo via the system `ping` binary
 *    (`ping -c 1 -W 2 <ip>`, `time=xx ms` parsed from its output).
 *  - tcpConnectMs(ip, port): real TCP connect timing. This is a TCP probe,
 *    NOT an ICMP ping, and must never be presented as ping latency.
 *
 * Both return a millisecond number on success and `null` on ANY failure
 * (binary missing, no reply, timeout, unreachable host). A null is an
 * honest "no measurement", never a fabricated number.
 *
 * Note: sandboxed environments that block raw ICMP sockets make the ping
 * binary fail — pingMs then returns null, which the poller reports as
 * "ICMP unavailable", not as a latency.
 */

const { execFile } = require('child_process');
const net = require('net');

const PING_COUNT = 1;
const PING_DEADLINE_SECONDS = 2;
const PING_EXEC_TIMEOUT_MS = 5000;
const TCP_CONNECT_TIMEOUT_MS = 2000;

/**
 * pingMs(ip) → ms (number) or null.
 * Runs the system ping binary once and parses `time=xx ms` from stdout.
 * Returns null when the binary fails, the host does not reply, or the
 * output cannot be parsed.
 */
function pingMs(ip) {
  return new Promise((resolve) => {
    if (!ip || typeof ip !== 'string') return resolve(null);
    execFile(
      'ping',
      ['-c', String(PING_COUNT), '-W', String(PING_DEADLINE_SECONDS), ip],
      { timeout: PING_EXEC_TIMEOUT_MS },
      (error, stdout) => {
        if (error || !stdout) return resolve(null);
        const match = String(stdout).match(/time=([\d.]+)\s*ms/);
        if (!match) return resolve(null);
        const ms = parseFloat(match[1]);
        return resolve(Number.isFinite(ms) ? ms : null);
      }
    );
  });
}

/**
 * tcpConnectMs(ip, port) → ms (number) or null.
 * Measures a real TCP connect (SYN → SYN/ACK) to ip:port. This proves the
 * port is reachable and gives a connect latency; it is labelled TCP and
 * must never be presented as ICMP ping latency.
 * Returns null on connection refused, timeout, DNS failure, or any error.
 */
function tcpConnectMs(ip, port) {
  return new Promise((resolve) => {
    if (!ip || typeof ip !== 'string') return resolve(null);
    const targetPort = Number(port);
    if (!Number.isInteger(targetPort) || targetPort < 1 || targetPort > 65535) {
      return resolve(null);
    }
    const startedAt = Date.now();
    const socket = new net.Socket();
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch (e) { /* already closed */ }
      resolve(value);
    };
    socket.setTimeout(TCP_CONNECT_TIMEOUT_MS);
    socket.once('connect', () => done(Date.now() - startedAt));
    socket.once('timeout', () => done(null));
    socket.once('error', () => done(null));
    try {
      socket.connect(targetPort, ip);
    } catch (e) {
      done(null);
    }
  });
}

module.exports = { pingMs, tcpConnectMs };
