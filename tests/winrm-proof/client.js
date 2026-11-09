// winrm-proof client — a real WS-Management / WinRS client (Node stdlib only).
//
// Speaks the actual protocol a Windows WinRM service speaks: SOAP 1.2
// envelopes over HTTP to /wsman with Basic auth, driving the WinRS shell
// lifecycle Create -> Command -> Receive -> Delete and parsing the SOAP
// responses (ShellId, CommandId, base64 stdout stream, CommandState,
// ExitCode). No canned answers: every value it asserts comes from the
// response the server sent.
//
// This is the proof client for tests/winrm-proof/run-proof.js. The
// production WinRM service (winrm-service track) must send envelopes with
// these exact shapes; this file is the reference for what "correct" looks
// like. Production code should use a real XML parser instead of the
// regex extraction used here (kept dependency-free on purpose for the
// proof harness).
//
// Credentials: runtime env vars only (WINRM_PROOF_USER / WINRM_PROOF_PASS).
// They are never logged and never written to disk.

'use strict';

const http = require('http');
const crypto = require('crypto');

const SHELL_URI = 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd';
const ACTIONS = {
  create: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create',
  command: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command',
  receive: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
  delete: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete',
};

function envelope(action, messageId, body, shellId) {
  const selector = shellId
    ? `<w:SelectorSet><w:Selector Name="ShellId">${shellId}</w:Selector></w:SelectorSet>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" ` +
    `xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" ` +
    `xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" ` +
    `xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell" ` +
    `xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">` +
    `<s:Header>` +
    `<a:Action s:mustUnderstand="true">${action}</a:Action>` +
    `<a:MessageID>uuid:${messageId}</a:MessageID>` +
    `<a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To>` +
    `<w:ResourceURI s:mustUnderstand="true">${SHELL_URI}</w:ResourceURI>` +
    `${selector}` +
    `<w:OperationTimeout>PT60S</w:OperationTimeout>` +
    `<w:MaxEnvelopeSize s:mustUnderstand="true">153600</w:MaxEnvelopeSize>` +
    `<w:Locale xml:lang="en-US" s:mustUnderstand="false" />` +
    `<p:DataLocale xml:lang="en-US" s:mustUnderstand="false" />` +
    `</s:Header><s:Body>${body}</s:Body></s:Envelope>`;
}

function extract(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : null;
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}\\s[^>]*${attr}="([^"]*)"`));
  return m ? m[1] : null;
}

function post(host, port, user, pass, xml) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host, port, path: '/wsman', method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8',
        Authorization: `Basic ${Buffer.from(`${user}:${pass}`, 'utf8').toString('base64')}`,
        'Content-Length': Buffer.byteLength(xml),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

async function runProof(opts) {
  const host = opts.host || '127.0.0.1';
  const port = opts.port || 15987;
  const user = opts.user || process.env.WINRM_PROOF_USER;
  const pass = opts.pass || process.env.WINRM_PROOF_PASS;
  if (!user || !pass) throw new Error('Set WINRM_PROOF_USER and WINRM_PROOF_PASS env vars (any test values; the listener only checks the auth scheme is present)');
  const log = opts.log || console.log;
  const steps = {};

  // 1. Create shell
  const createId = crypto.randomUUID();
  const createXml = envelope(ACTIONS.create, createId,
    `<rsp:Shell><rsp:InputStreams>stdin</rsp:InputStreams>` +
    `<rsp:OutputStreams>stdout stderr</rsp:OutputStreams></rsp:Shell>`);
  const createRes = await post(host, port, user, pass, createXml);
  assert(createRes.status === 200, `Create shell: HTTP ${createRes.status}`);
  assert(extract(createRes.body, 'a:Action') === 'http://schemas.xmlsoap.org/ws/2004/09/transfer/CreateResponse', 'Create response Action');
  assert(extract(createRes.body, 'a:RelatesTo') === `uuid:${createId}`, 'Create RelatesTo must echo request MessageID');
  const shellId = extract(createRes.body, 'rsp:ShellId');
  assert(shellId, 'Create response must contain rsp:ShellId');
  steps.create = { messageId: createId, shellId };
  log(`1. CREATE  -> HTTP 200, ShellId=${shellId}`);

  // 2. Run command
  const commandId = crypto.randomUUID();
  const commandXml = envelope(ACTIONS.command, commandId,
    `<rsp:CommandLine><rsp:Command>hostname</rsp:Command></rsp:CommandLine>`, shellId);
  const commandRes = await post(host, port, user, pass, commandXml);
  assert(commandRes.status === 200, `Command: HTTP ${commandRes.status}`);
  assert(extract(commandRes.body, 'a:Action') === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandResponse', 'Command response Action');
  const cmdId = extract(commandRes.body, 'rsp:CommandId');
  assert(cmdId, 'Command response must contain rsp:CommandId');
  steps.command = { messageId: commandId, command: 'hostname', commandId: cmdId };
  log(`2. COMMAND -> HTTP 200, Command="hostname", CommandId=${cmdId}`);

  // 3. Receive output
  const receiveId = crypto.randomUUID();
  const receiveXml = envelope(ACTIONS.receive, receiveId,
    `<rsp:Receive><rsp:DesiredStream CommandId="${cmdId}">stdout stderr</rsp:DesiredStream></rsp:Receive>`, shellId);
  const receiveRes = await post(host, port, user, pass, receiveXml);
  assert(receiveRes.status === 200, `Receive: HTTP ${receiveRes.status}`);
  assert(extract(receiveRes.body, 'a:Action') === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/ReceiveResponse', 'Receive response Action');
  const streamB64 = extract(receiveRes.body, 'rsp:Stream');
  assert(streamB64 !== null, 'Receive response must contain rsp:Stream');
  const stdout = Buffer.from(streamB64, 'base64').toString('utf8');
  const streamName = extractAttr(receiveRes.body, 'rsp:Stream', 'Name');
  const state = extractAttr(receiveRes.body, 'rsp:CommandState', 'State');
  const exitCode = extract(receiveRes.body, 'rsp:ExitCode');
  assert(streamName === 'stdout', `Stream Name must be stdout, got ${streamName}`);
  assert(state === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done', `CommandState must be Done, got ${state}`);
  assert(exitCode === '0', `ExitCode must be 0, got ${exitCode}`);
  steps.receive = { messageId: receiveId, streamName, stdout, exitCode, state };
  log(`3. RECEIVE -> HTTP 200, Stream[${streamName}] base64=${streamB64} decodes to ${JSON.stringify(stdout)}, CommandState=Done, ExitCode=${exitCode}`);

  // 4. Delete shell
  const deleteId = crypto.randomUUID();
  const deleteXml = envelope(ACTIONS.delete, deleteId, '', shellId);
  const deleteRes = await post(host, port, user, pass, deleteXml);
  assert(deleteRes.status === 200, `Delete shell: HTTP ${deleteRes.status}`);
  assert(extract(deleteRes.body, 'a:Action') === 'http://schemas.xmlsoap.org/ws/2004/09/transfer/DeleteResponse', 'Delete response Action');
  steps.delete = { messageId: deleteId, shellId };
  log(`4. DELETE  -> HTTP 200, ShellId=${shellId} deleted`);

  return steps;
}

if (require.main === module) {
  runProof({ port: Number(process.env.WINRM_PROOF_PORT || 15987) })
    .then((steps) => {
      console.log('WINRM PROOF CLIENT: full exchange completed');
      console.log(JSON.stringify(steps, null, 2));
    })
    .catch((e) => { console.error('WINRM PROOF CLIENT FAILED:', e.message); process.exit(1); });
}

module.exports = { runProof, SHELL_URI, ACTIONS };
