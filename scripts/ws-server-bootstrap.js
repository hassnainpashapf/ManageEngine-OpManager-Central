'use strict';
/**
 * Test-only server bootstrap for scripts/ws-events-proof.js.
 *
 * Starts the REAL server (server/index.js) in this process, then listens
 * on the parent IPC channel for one message type:
 *   { type: 'inject-trap', hex: '<BER bytes>', sourceIp: '<ip>' }
 * which it forwards to trapReceiver.injectDatagram() — the exact
 * production trap handler. This exists ONLY because the proof cannot
 * deliver a real UDP datagram into this VM (sandbox blocks all outbound
 * UDP sends with EPERM; no inbound tailnet path). It is test tooling:
 * nothing in server/ calls it and there is no HTTP endpoint for it.
 */
require('../server/index.js');

const trapReceiver = require('../server/services/trapReceiver');

process.on('message', (msg) => {
  if (!msg || msg.type !== 'inject-trap') return;
  try {
    const buf = Buffer.from(String(msg.hex || ''), 'hex');
    trapReceiver.injectDatagram('trap', buf, msg.sourceIp || '127.0.0.1');
    if (process.send) process.send({ type: 'injected', bytes: buf.length });
  } catch (err) {
    if (process.send) process.send({ type: 'inject-error', message: err && err.message ? err.message : String(err) });
  }
});
