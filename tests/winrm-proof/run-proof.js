// winrm-proof runner — starts the LOCAL TEST LISTENER, runs this
// harness's OWN proof WS-Man client against it (NOT the production
// server/services/winrm.js — see tests/winrm-proof/README.md), asserts
// exact SOAP values, prints the proof. It proves envelope SHAPES only.
// Exit 0 = full Create -> Command -> Receive -> Delete exchange completed
// with spec-shaped envelopes on both sides. Exit 1 = any assertion failed.
//
// Usage: node tests/winrm-proof/run-proof.js
// Env: WINRM_PROOF_PORT (default 15987, 127.0.0.1 only),
//      WINRM_PROOF_USER / WINRM_PROOF_PASS (required at runtime; any test
//      values — the listener only checks the auth scheme is present.
//      Never logged, never written to disk, never committed).

'use strict';

const { createListener } = require('./listener');
const { runProof } = require('./client');

async function main() {
  const port = Number(process.env.WINRM_PROOF_PORT || 15987);
  const listener = createListener();
  const actualPort = await listener.start(port);
  console.log(`[winrm-proof] listener up on 127.0.0.1:${actualPort} (LOCAL TEST LISTENER — NOT a Windows host)`);
  try {
    const steps = await runProof({
      host: '127.0.0.1',
      port: actualPort,
      log: (...a) => console.log('[winrm-proof]', ...a),
    });
    // Cross-check: the listener must have validated exactly the 4 requests
    // the client sent, in order, with matching MessageIDs.
    const seen = listener.seen();
    const expectedActions = [
      'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create',
      'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command',
      'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
      'http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete',
    ];
    const sentIds = [steps.create.messageId, steps.command.messageId, steps.receive.messageId, steps.delete.messageId];
    if (seen.length !== 4) throw new Error(`Listener saw ${seen.length} requests, expected 4`);
    seen.forEach((s, i) => {
      if (s.action !== expectedActions[i]) throw new Error(`Request ${i + 1} action mismatch: ${s.action}`);
      if (s.messageId !== `uuid:${sentIds[i]}`) throw new Error(`Request ${i + 1} MessageID mismatch`);
    });
    if (steps.receive.stdout !== 'TESTHOST\r\n') throw new Error(`stdout mismatch: ${JSON.stringify(steps.receive.stdout)}`);
    if (steps.receive.exitCode !== '0') throw new Error(`ExitCode mismatch: ${steps.receive.exitCode}`);

    console.log('[winrm-proof] LISTENER VALIDATED: 4/4 envelopes (Create, Command, Receive, Delete) with correct Action, MessageID, ResourceURI, selectors, auth scheme');
    console.log('[winrm-proof] CLIENT PROVED: ShellId round-trip, CommandId round-trip, stdout base64 decode, CommandState Done, ExitCode 0');
    console.log('[winrm-proof] PASS — full WS-Man / WinRS exchange completed against the local test listener');
    console.log('[winrm-proof] PROOF VALUES:');
    console.log(`  ShellId   = ${steps.create.shellId}`);
    console.log(`  Command   = ${steps.command.command}`);
    console.log(`  CommandId = ${steps.command.commandId}`);
    console.log(`  stdout    = ${JSON.stringify(steps.receive.stdout)} (base64 ${Buffer.from(steps.receive.stdout, 'utf8').toString('base64')})`);
    console.log(`  ExitCode  = ${steps.receive.exitCode}`);
    console.log(`  State     = ${steps.receive.state}`);
    await listener.stop();
    process.exit(0);
  } catch (e) {
    console.error('[winrm-proof] FAIL:', e.message);
    await listener.stop().catch(() => {});
    process.exit(1);
  }
}

main();
