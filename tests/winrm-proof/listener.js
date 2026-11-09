// winrm-proof listener — LOCAL TEST LISTENER, NOT a Windows host.
//
// This is a test double that speaks the real WS-Management / WinRS protocol
// over HTTP on 127.0.0.1 only. It validates the SOAP envelopes a WinRM client
// sends (namespace, Action, ResourceURI, MessageID, selectors, auth scheme)
// and returns spec-shaped SOAP responses for the WinRS shell lifecycle:
//   Create shell -> Command -> Receive -> Delete shell
// It executes NOTHING. The "command output" it returns is a fixed,
// hard-coded test string ("TESTHOST\r\n") so the client can prove it parses
// real SOAP (base64 stream + CommandState + ExitCode) end to end.
//
// It exists because no WinRM-enabled Windows host is available in this
// environment (see docs/winrm-setup.md): TH-12-PC answers on 5985/5986 with
// connection refused, and the GVS PCs are unreachable from the relay.
// Any claim that this listener is a Windows host would be false.
//
// Auth: the listener only checks that an `Authorization: Basic ...` header
// is PRESENT. It never validates, logs, or stores the credential value.
// Test credentials are supplied at runtime via env vars only.

'use strict';

const http = require('http');
const crypto = require('crypto');

// Fixed, deterministic proof values (test constants, not secrets).
const SHELL_ID = '11111111-2222-3333-4444-555555555555';
const COMMAND_ID = '0';
const SHELL_URI = 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd';
const NS = {
  s: 'http://www.w3.org/2003/05/soap-envelope',
  a: 'http://schemas.xmlsoap.org/ws/2004/08/addressing',
  w: 'http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd',
  rsp: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell',
  p: 'http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd',
};
const ACTIONS = {
  create: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create',
  command: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command',
  receive: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
  signal: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Signal',
  delete: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete',
};
const HOSTNAME_OUTPUT = 'TESTHOST\r\n'; // fixed test stdout, base64-encoded in Receive

function log(...args) {
  // eslint-disable-next-line no-console
  console.log('[winrm-proof-listener]', ...args);
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : null;
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}\\s[^>]*${attr}="([^"]*)"`));
  return m ? m[1] : null;
}

function soapFault(code, subcode, reason) {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<s:Envelope xmlns:s="${NS.s}" xmlns:a="${NS.a}" xmlns:w="${NS.w}">` +
    `<s:Header><a:Action>${NS.s}/fault</a:Action></s:Header><s:Body><s:Fault>` +
    `<s:Code><s:Value>${code}</s:Value><s:Subcode><s:Value>${subcode}</s:Value></s:Subcode></s:Code>` +
    `<s:Reason><s:Text xml:lang="en">${reason}</s:Text></s:Reason>` +
    `</s:Fault></s:Body></s:Envelope>`;
}

function envelope(action, relatesTo, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<s:Envelope xmlns:s="${NS.s}" xmlns:a="${NS.a}" xmlns:w="${NS.w}" ` +
    `xmlns:rsp="${NS.rsp}" xmlns:p="${NS.p}">` +
    `<s:Header><a:Action s:mustUnderstand="true">${action}</a:Action>` +
    `<a:MessageID>uuid:${crypto.randomUUID()}</a:MessageID>` +
    `<a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To>` +
    (relatesTo ? `<a:RelatesTo>${relatesTo}</a:RelatesTo>` : '') +
    `</s:Header><s:Body>${body}</s:Body></s:Envelope>`;
}

function createListener() {
  const shells = new Map(); // shellId -> { commandId, command, delivered }
  const seen = []; // validated request log: { action, messageId }

  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const xml = Buffer.concat(chunks).toString('utf8');
      const send = (status, body) => {
        res.writeHead(status, { 'Content-Type': 'application/soap+xml;charset=UTF-8' });
        res.end(body);
      };

      if (req.method !== 'POST' || req.url !== '/wsman') {
        return send(404, soapFault('s:Sender', 'w:InvalidAction', 'Only POST /wsman is served'));
      }
      if (!String(req.headers['content-type'] || '').includes('application/soap+xml')) {
        return send(400, soapFault('s:Sender', 'w:InvalidMessage', 'Content-Type must be application/soap+xml'));
      }
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Basic ')) {
        // Presence + scheme only. The value is never read, logged, or stored.
        return send(401, soapFault('s:Sender', 'w:AccessDenied', 'Missing or non-Basic Authorization header'));
      }

      const action = extractTag(xml, 'a:Action');
      const messageId = extractTag(xml, 'a:MessageID');
      const resourceUri = extractTag(xml, 'w:ResourceURI');
      const shellId = extractTag(xml, 'w:Selector');
      const ok = (cond, why) => {
        if (!cond) {
          send(400, soapFault('s:Sender', 'w:InvalidMessage', why));
          return false;
        }
        return true;
      };

      if (!action || !xml.includes('<s:Envelope') || !xml.includes('</s:Envelope>')) {
        return send(400, soapFault('s:Sender', 'w:InvalidMessage', 'Not a SOAP envelope with an Action'));
      }
      if (!ok(messageId, 'Missing a:MessageID')) return;
      if (!ok(resourceUri === SHELL_URI, `w:ResourceURI must be ${SHELL_URI}`)) return;
      seen.push({ action, messageId });

      if (action === ACTIONS.create) {
        if (!ok(xml.includes('<rsp:Shell>'), 'Create body must contain rsp:Shell')) return;
        if (!ok(xml.includes('<rsp:InputStreams>stdin</rsp:InputStreams>'), 'Create must request stdin InputStream')) return;
        if (!ok(xml.includes('<rsp:OutputStreams>stdout stderr</rsp:OutputStreams>'), 'Create must request stdout+stderr OutputStreams')) return;
        shells.set(SHELL_ID, { commandId: null, command: null, delivered: false });
        log(`CREATE validated (MessageID ${messageId}) -> ShellId ${SHELL_ID}`);
        return send(200, envelope(
          'http://schemas.xmlsoap.org/ws/2004/09/transfer/CreateResponse', messageId,
          `<rsp:Shell><rsp:ShellId>${SHELL_ID}</rsp:ShellId>` +
          `<rsp:ResourceUri>${SHELL_URI}</rsp:ResourceUri>` +
          `<rsp:Owner>TEST\\test-owner</rsp:Owner><rsp:ClientIP>127.0.0.1</rsp:ClientIP></rsp:Shell>`,
        ));
      }

      if (action === ACTIONS.command) {
        if (!ok(shellId === SHELL_ID, 'Unknown ShellId selector')) return;
        const command = extractTag(xml, 'rsp:Command');
        if (!ok(command, 'Command body must contain rsp:Command')) return;
        const shell = shells.get(SHELL_ID);
        shell.commandId = COMMAND_ID;
        shell.command = command;
        log(`COMMAND validated (MessageID ${messageId}) ShellId ${SHELL_ID} Command "${command}" -> CommandId ${COMMAND_ID}`);
        return send(200, envelope(
          'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandResponse', messageId,
          `<rsp:CommandResponse><rsp:CommandId>${COMMAND_ID}</rsp:CommandId></rsp:CommandResponse>`,
        ));
      }

      if (action === ACTIONS.receive) {
        if (!ok(shellId === SHELL_ID, 'Unknown ShellId selector')) return;
        const cmdId = extractAttr(xml, 'rsp:DesiredStream', 'CommandId');
        if (!ok(cmdId === COMMAND_ID, 'DesiredStream CommandId must match the created command')) return;
        const shell = shells.get(SHELL_ID);
        const stream = shell.delivered
          ? ''
          : `<rsp:Stream Name="stdout" CommandId="${COMMAND_ID}">${Buffer.from(HOSTNAME_OUTPUT, 'utf8').toString('base64')}</rsp:Stream>` +
            `<rsp:Stream Name="stderr" CommandId="${COMMAND_ID}"></rsp:Stream>`;
        shell.delivered = true;
        log(`RECEIVE validated (MessageID ${messageId}) ShellId ${SHELL_ID} CommandId ${COMMAND_ID} -> stdout base64 of ${JSON.stringify(HOSTNAME_OUTPUT)}, ExitCode 0, State Done`);
        return send(200, envelope(
          'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/ReceiveResponse', messageId,
          `<rsp:ReceiveResponse>${stream}` +
          `<rsp:CommandState CommandId="${COMMAND_ID}" State="http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done">` +
          `<rsp:ExitCode>0</rsp:ExitCode></rsp:CommandState></rsp:ReceiveResponse>`,
        ));
      }

      if (action === ACTIONS.delete) {
        if (!ok(shellId === SHELL_ID, 'Unknown ShellId selector')) return;
        shells.delete(SHELL_ID);
        log(`DELETE validated (MessageID ${messageId}) ShellId ${SHELL_ID} removed`);
        return send(200, envelope(
          'http://schemas.xmlsoap.org/ws/2004/09/transfer/DeleteResponse', messageId, '',
        ));
      }

      return send(400, soapFault('s:Sender', 'w:InvalidAction', `Unsupported Action: ${action}`));
    });
  });

  return {
    server,
    seen: () => seen.slice(),
    start: (port) => new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server.address().port))),
    stop: () => new Promise((resolve) => server.close(() => resolve())),
    SHELL_ID, COMMAND_ID, SHELL_URI, ACTIONS, HOSTNAME_OUTPUT,
  };
}

if (require.main === module) {
  const port = Number(process.env.WINRM_PROOF_PORT || 15987);
  const l = createListener();
  l.start(port).then((p) => {
    log(`listening on 127.0.0.1:${p} — LOCAL TEST LISTENER, NOT a Windows host`);
    log('Serves POST /wsman only; validates WS-Man envelopes; fixed test stdout "TESTHOST\\r\\n"');
  });
}

module.exports = { createListener, SHELL_ID, COMMAND_ID, SHELL_URI, ACTIONS, HOSTNAME_OUTPUT };
