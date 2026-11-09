'use strict';

/**
 * winrm.js — REAL WinRM client (WS-Management SOAP + NTLMv2) for OpManager.
 *
 * Talks the actual protocol to a Windows Remote Management endpoint:
 *   - HTTP(S) POST to /wsman with WS-Management SOAP 1.2 envelopes
 *     (DMTF DSP0226 / [MS-WSMV]).
 *   - NTLM authentication via server/services/ntlm.js: the real three-step
 *     handshake (anonymous -> 401 -> Type 1 -> 401 + Type 2 challenge ->
 *     Type 3) on one keep-alive connection. NTLMv2 only for NTLM; no fake
 *     header, no canned responses.
 *   - Basic fallback (ported from the Phase 3 winrm-route fork, which had
 *     it and this client did not): when a server offers ONLY Basic
 *     authentication, the credentials are sent as a Basic Authorization
 *     header — but ONLY over HTTPS (transport 'https' / useHttps), or
 *     over plain HTTP when the caller explicitly passes
 *     allowUnencrypted: true. Basic over plain HTTP without that explicit
 *     opt-in is refused with AUTH_FAILED; credentials are never sent
 *     in the clear by accident. NTLM is always preferred when offered.
 *   - Transport selection: `transport: 'http'|'https'` wins when given;
 *     otherwise `useHttps: true` selects https (default port 5986) and
 *     `useHttps: false` / absent selects http (default port 5985).
 *     `rejectUnauthorized` controls TLS verification (default true).
 *   - Shell lifecycle per [MS-WSMV]: Create shell -> Command -> Receive
 *     (poll until CommandState Done) -> Signal(terminate) on timeout ->
 *     Delete shell, always in a finally.
 *   - WQL via WS-Enumeration: Enumerate (WQL filter dialect) -> Pull loop
 *     until EndOfSequence, CIM instances parsed into plain objects.
 *
 * API (credentials are passed at call time only — never stored, never
 * logged, never put in an error message):
 *   runShellCommand(host, { username, password, command, timeoutMs?,
 *     port?, transport?, useHttps?, allowUnencrypted?, domain?,
 *     workstation?, workingDirectory?, rejectUnauthorized? })
 *     -> { host, transport, port, command, stdout, stderr, exitCode,
 *          commandId, shellId, durationMs }
 *   runWql(host, { username, password, namespace?, query, timeoutMs?,
 *     port?, transport?, useHttps?, allowUnencrypted?, domain?,
 *     workstation?, maxResults? })
 *     -> { host, namespace, query, results, count }
 *
 * Errors: every failure throws WinRMError with a machine-readable `code`
 * and `httpStatus` 502 (the route layer maps it straight to the HTTP
 * response), never a fake success:
 *   AUTH_FAILED   — server returned 401 after the Type 3 message or the
 *                   Basic exchange (bad username/password/domain), never
 *                   offered NTLM or Basic, or offered Basic only over
 *                   plain HTTP without allowUnencrypted.
 *   UNREACHABLE   — TCP/DNS failure (ECONNREFUSED, ENOTFOUND, ...).
 *   TIMEOUT       — no answer within the caller's deadline; the remote
 *                   shell is signalled to terminate before throwing.
 *   PROTOCOL      — non-2xx answer, SOAP Fault, or a malformed reply.
 *   INVALID_ARGUMENT — missing/empty host, username, password, command
 *                   or query (thrown before any network I/O).
 *
 * No Windows host exists in this environment, so no live WinRM call has
 * been made yet. What IS proven (scripts/winrm-selftest.js): SOAP envelope
 * construction round-trips through a real XML parser, NTLM message
 * structure is validated against RFC 1320 / MS-NLMP vectors, and the full
 * client runs end-to-end against an in-process mock WinRM server that
 * speaks real HTTP + real NTLM (it cryptographically verifies the
 * client's Type 3) and real WS-Man SOAP. See docs/winrm.md for the
 * validation method and the exact missing piece (a WinRM-enabled host
 * plus credentials).
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { XMLParser } = require('fast-xml-parser');
const ntlm = require('./ntlm');

// --- Constants ---------------------------------------------------------------

const NS = {
  soap: 'http://www.w3.org/2003/05/soap-envelope',
  addressing: 'http://schemas.xmlsoap.org/ws/2004/08/addressing',
  enumeration: 'http://schemas.xmlsoap.org/ws/2004/09/enumeration',
  wsman: 'http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd',
  shell: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell',
};

const ACTION = {
  create: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create',
  delete: 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete',
  command: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command',
  receive: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive',
  signal: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Signal',
  send: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Send',
  enumerate: 'http://schemas.xmlsoap.org/ws/2004/09/enumeration/Enumerate',
  pull: 'http://schemas.xmlsoap.org/ws/2004/09/enumeration/Pull',
};

const SHELL_RESOURCE = 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd';
const WQL_DIALECT = 'http://schemas.microsoft.com/wbem/wsman/1/WQL';
const SIGNAL_TERMINATE = 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/signal/terminate';
const CMD_DONE_STATE = 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done';

const DEFAULT_PORT = { http: 5985, https: 5986 };
const DEFAULT_TIMEOUT_MS = 60000;
const DEFAULT_MAX_ENVELOPE = 153600;
const WSMAN_PATH = '/wsman';

// --- Errors ------------------------------------------------------------------

class WinRMError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'WinRMError';
    this.code = code;
    this.httpStatus = 502;
    if (details) Object.assign(this, details);
  }
}

function invalidArg(what) {
  return new WinRMError('INVALID_ARGUMENT', `WinRM: ${what} is required`, { httpStatus: 400 });
}

// --- XML helpers -------------------------------------------------------------

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseTagValue: false, // keep base64 streams and numbers as strings; we cast explicitly
  parseAttributeValue: false,
  trimValues: true,
});

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function asArray(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function firstChild(obj, name) {
  if (!obj || typeof obj !== 'object') return undefined;
  return obj[name];
}

// --- SOAP envelope builders (exported for the self-test) ---------------------

// The <a:To> value is the real endpoint URL; it is filled in by
// `sendSoap` (builders take an `endpoint` and substitute it). The
// placeholder keeps the builders pure functions of their arguments.
const ENDPOINT_PLACEHOLDER = '__WINRM_ENDPOINT__';

/**
 * Full WS-Management SOAP envelope. `selectors` is a { Name: value } map
 * rendered as a wsa:SelectorSet (used for ShellId).
 */
function buildEnvelope({ action, resourceUri, selectors, body, operationTimeoutSec, messageId }) {
  const id = messageId || `urn:uuid:${crypto.randomUUID()}`;
  const timeout = operationTimeoutSec
    ? `<wsman:OperationTimeout>PT${Math.max(1, Math.ceil(operationTimeoutSec))}S</wsman:OperationTimeout>`
    : '';
  const resource = resourceUri
    ? `<wsman:ResourceURI>${xmlEscape(resourceUri)}</wsman:ResourceURI>`
    : '';
  const selectorXml = selectors && Object.keys(selectors).length
    ? `<wsa:SelectorSet>${Object.entries(selectors).map(
      ([k, v]) => `<wsa:Selector Name="${xmlEscape(k)}">${xmlEscape(v)}</wsa:Selector>`).join('')}</wsa:SelectorSet>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<s:Envelope xmlns:s="${NS.soap}" xmlns:a="${NS.addressing}" ` +
    `xmlns:wsen="${NS.enumeration}" xmlns:wsman="${NS.wsman}" xmlns:rsp="${NS.shell}">` +
    `<s:Header>` +
    `<a:To>${xmlEscape(ENDPOINT_PLACEHOLDER)}</a:To>` +
    `<a:ReplyTo><a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address></a:ReplyTo>` +
    `<a:Action>${xmlEscape(action)}</a:Action>` +
    `<a:MessageID>${xmlEscape(id)}</a:MessageID>` +
    `<wsman:MaxEnvelopeSize>${DEFAULT_MAX_ENVELOPE}</wsman:MaxEnvelopeSize>` +
    `<wsman:Locale xml:lang="en-US"/>` +
    `${timeout}${resource}${selectorXml}` +
    `</s:Header><s:Body>${body}</s:Body></s:Envelope>`;
}

function fillEndpoint(envelope, endpoint) {
  return envelope.replace(ENDPOINT_PLACEHOLDER, xmlEscape(endpoint));
}

function buildCreateShell({ idleTimeoutSec, workingDirectory, environment }) {
  const dir = workingDirectory
    ? `<rsp:WorkingDirectory>${xmlEscape(workingDirectory)}</rsp:WorkingDirectory>` : '';
  const env = environment && Object.keys(environment).length
    ? `<rsp:Environment>${Object.entries(environment).map(
      ([k, v]) => `<rsp:Variable Name="${xmlEscape(k)}">${xmlEscape(v)}</rsp:Variable>`).join('')}</rsp:Environment>`
    : '';
  return buildEnvelope({
    action: ACTION.create,
    resourceUri: SHELL_RESOURCE,
    body: `<rsp:Shell>` +
      `<rsp:InputStreams>stdin</rsp:InputStreams>` +
      `<rsp:OutputStreams>stdout stderr</rsp:OutputStreams>` +
      `<rsp:IdleTimeout>PT${Math.max(1, Math.ceil(idleTimeoutSec || 60))}S</rsp:IdleTimeout>` +
      `${dir}${env}</rsp:Shell>`,
    operationTimeoutSec: 60,
  });
}

function buildCommand({ shellId, command, args }) {
  const argsXml = (args || []).map((a) => `<rsp:Arguments>${xmlEscape(a)}</rsp:Arguments>`).join('');
  return buildEnvelope({
    action: ACTION.command,
    resourceUri: SHELL_RESOURCE,
    selectors: { ShellId: shellId },
    body: `<rsp:CommandLine><rsp:Command>${xmlEscape(command)}</rsp:Command>${argsXml}</rsp:CommandLine>`,
    operationTimeoutSec: 60,
  });
}

function buildReceive({ shellId, commandId }) {
  return buildEnvelope({
    action: ACTION.receive,
    resourceUri: SHELL_RESOURCE,
    selectors: { ShellId: shellId },
    body: `<rsp:Receive><rsp:DesiredStream CommandId="${xmlEscape(commandId)}">stdout stderr</rsp:DesiredStream></rsp:Receive>`,
    operationTimeoutSec: 60,
  });
}

function buildSignal({ shellId, commandId, code }) {
  return buildEnvelope({
    action: ACTION.signal,
    resourceUri: SHELL_RESOURCE,
    selectors: { ShellId: shellId },
    body: `<rsp:Signal CommandId="${xmlEscape(commandId)}" Code="${xmlEscape(code)}"/>`,
    operationTimeoutSec: 30,
  });
}

function buildDeleteShell({ shellId }) {
  return buildEnvelope({
    action: ACTION.delete,
    resourceUri: SHELL_RESOURCE,
    selectors: { ShellId: shellId },
    body: '',
    operationTimeoutSec: 30,
  });
}

function wmiResourceUri(namespace) {
  const ns = String(namespace || 'root/cimv2').replace(/^\/+|\/+$/g, '');
  return `http://schemas.microsoft.com/wbem/wsman/1/wmi/${ns}/*`;
}

function buildEnumerate({ namespace, query, maxElements }) {
  return buildEnvelope({
    action: ACTION.enumerate,
    resourceUri: wmiResourceUri(namespace),
    body: `<wsen:Enumerate>` +
      `<wsman:OptimizeEnumeration/>` +
      `<wsman:MaxElements>${Math.max(1, maxElements || 32)}</wsman:MaxElements>` +
      `<wsman:Filter Dialect="${WQL_DIALECT}">${xmlEscape(query)}</wsman:Filter>` +
      `</wsen:Enumerate>`,
    operationTimeoutSec: 60,
  });
}

function buildPull({ enumerationContext, maxElements }) {
  return buildEnvelope({
    action: ACTION.pull,
    resourceUri: null,
    body: `<wsen:Pull>` +
      `<wsen:EnumerationContext>${xmlEscape(enumerationContext)}</wsen:EnumerationContext>` +
      `<wsen:MaxElements>${Math.max(1, maxElements || 32)}</wsman:MaxElements>` +
      `</wsen:Pull>`,
    operationTimeoutSec: 60,
  });
}

// --- SOAP response parsing (exported for the self-test) ----------------------

function parseSoap(xml, what) {
  let doc;
  try {
    doc = xmlParser.parse(xml);
  } catch (err) {
    throw new WinRMError('PROTOCOL', `WinRM: could not parse ${what} response as XML (${err.message})`);
  }
  const envelope = doc.Envelope || doc;
  const body = envelope && envelope.Body;
  if (!body || typeof body !== 'object') {
    throw new WinRMError('PROTOCOL', `WinRM: ${what} response has no SOAP Body`);
  }
  const fault = body.Fault;
  if (fault) {
    const reason = fault.Reason && (fault.Reason.Text || fault.Reason);
    const text = typeof reason === 'string' ? reason : (reason && reason['#text']) || '';
    const detail = fault.Detail ? JSON.stringify(fault.Detail).slice(0, 500) : '';
    throw new WinRMError('PROTOCOL',
      `WinRM: SOAP Fault on ${what}${text ? `: ${text}` : ''}${detail ? ` (${detail})` : ''}`);
  }
  return body;
}

function parseCreateShellResponse(xml) {
  const body = parseSoap(xml, 'Create shell');
  const shell = body.Shell;
  if (!shell || !shell.ShellId) {
    throw new WinRMError('PROTOCOL', 'WinRM: Create shell response has no ShellId');
  }
  return String(shell.ShellId);
}

function parseCommandResponse(xml) {
  const body = parseSoap(xml, 'Command');
  const resp = body.CommandResponse;
  if (!resp || !resp.CommandId) {
    throw new WinRMError('PROTOCOL', 'WinRM: Command response has no CommandId');
  }
  return String(resp.CommandId);
}

function parseReceiveResponse(xml) {
  const body = parseSoap(xml, 'Receive');
  const resp = body.ReceiveResponse || {};
  const streams = asArray(resp.Stream).map((s) => {
    const text = typeof s === 'string' ? s : (s['#text'] || '');
    const decoded = text ? Buffer.from(String(text).replace(/\s+/g, ''), 'base64').toString('utf8') : '';
    return {
      name: s && s['@_Name'] ? String(s['@_Name']) : '',
      commandId: s && s['@_CommandId'] ? String(s['@_CommandId']) : '',
      end: s && s['@_End'] === 'true',
      text: decoded,
    };
  });
  const stateNode = resp.CommandState || {};
  const state = typeof stateNode === 'string' ? stateNode : (stateNode['@_State'] || '');
  const exitRaw = stateNode && stateNode.ExitCode !== undefined
    ? stateNode.ExitCode : (stateNode && stateNode['#text']);
  const exitCode = exitRaw !== undefined && exitRaw !== null && exitRaw !== ''
    ? parseInt(String(typeof exitRaw === 'object' ? (exitRaw['#text'] || '') : exitRaw), 10)
    : null;
  return {
    streams,
    done: state === CMD_DONE_STATE,
    state: state || null,
    exitCode: Number.isNaN(exitCode) ? null : exitCode,
  };
}

function parseEnumerateResponse(xml) {
  const body = parseSoap(xml, 'Enumerate');
  const resp = body.EnumerateResponse || {};
  const context = resp.EnumerationContext
    ? String(typeof resp.EnumerationContext === 'object'
      ? (resp.EnumerationContext['#text'] || '') : resp.EnumerationContext)
    : null;
  return { enumerationContext: context, items: asArray(resp.Items && resp.Items.Item).filter(isCimItem).map(flattenCimItem) };
}

function parsePullResponse(xml) {
  const body = parseSoap(xml, 'Pull');
  const resp = body.PullResponse || {};
  const context = resp.EnumerationContext
    ? String(typeof resp.EnumerationContext === 'object'
      ? (resp.EnumerationContext['#text'] || '') : resp.EnumerationContext)
    : null;
  return {
    enumerationContext: context,
    endOfSequence: resp.EndOfSequence !== undefined,
    items: asArray(resp.Items && resp.Items.Item).filter(isCimItem).map(flattenCimItem),
  };
}

/**
 * True only for a real CIM instance element. An empty <wsen:Items/> parses
 * to '' and an empty <wsen:Item/> to '' — neither is an instance, and
 * counting one would invent a result row. Non-object items are dropped.
 */
function isCimItem(item) {
  return item !== null && typeof item === 'object' && Object.keys(item).length > 0;
}

/**
 * Flatten one <wsen:Item> (a single CIM instance element, e.g.
 * <p:Win32_OperatingSystem>) into { __class, ...properties }.
 * Property values are strings (XML is parsed with parseTagValue:false);
 * xsi:nil properties become null.
 */
function flattenCimItem(item) {
  if (!item || typeof item !== 'object') return item;
  const keys = Object.keys(item).filter((k) => !k.startsWith('@_') && k !== '#text');
  if (keys.length === 0) return { __class: null, value: item['#text'] ?? null };
  const className = keys[0];
  const props = item[className] || {};
  const out = { __class: className };
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith('@_')) continue;
    out[k] = flattenCimValue(v);
  }
  return out;
}

function flattenCimValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(flattenCimValue);
  if (typeof v === 'object') {
    if (v['@_nil'] === 'true' || v['@_xsi:nil'] === 'true') return null;
    if (v['#text'] !== undefined) return String(v['#text']);
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k.startsWith('@_')) continue;
      out[k] = flattenCimValue(val);
    }
    return out;
  }
  return v;
}

// --- HTTP transport with NTLM -----------------------------------------------

const UNREACHABLE_CODES = new Set([
  'ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'EHOSTDOWN', 'ENETUNREACH',
  'EAI_AGAIN', 'ECONNRESET', 'EPIPE',
]);

function parseTarget(host, options) {
  // Transport selection: an explicit `transport` wins; otherwise the
  // winrm-route convention `useHttps: true` selects https. A host string
  // carrying its own scheme (https://host:port/path) still wins over both.
  let transport = (options.transport || (options.useHttps === true ? 'https' : 'http')).toLowerCase();
  let hostname = String(host || '').trim();
  let port = options.port;
  let path = options.path || WSMAN_PATH;
  const m = hostname.match(/^(https?):\/\/([^/:]+)(?::(\d+))?(\/.*)?$/i);
  if (m) {
    transport = m[1].toLowerCase();
    hostname = m[2];
    if (m[3]) port = parseInt(m[3], 10);
    if (m[4]) path = m[4];
  } else if (hostname.includes(':')) {
    const idx = hostname.lastIndexOf(':');
    const p = parseInt(hostname.slice(idx + 1), 10);
    if (!Number.isNaN(p)) { port = p; hostname = hostname.slice(0, idx); }
  }
  if (!hostname) throw invalidArg('host');
  if (!port) port = DEFAULT_PORT[transport] || 5985;
  if (transport !== 'http' && transport !== 'https') {
    throw invalidArg(`transport "${transport}" (must be http or https)`);
  }
  return { transport, host: hostname, port, path, endpoint: `${transport}://${hostname}:${port}${path}` };
}

function postOnce({ transport, host, port, path, body, headers, timeoutMs, rejectUnauthorized, agent }) {
  return new Promise((resolve, reject) => {
    const mod = transport === 'https' ? https : http;
    const req = mod.request({
      host, port, path, method: 'POST', timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
        'Connection': 'keep-alive',
        ...headers,
      },
      ...(transport === 'https' ? { rejectUnauthorized: rejectUnauthorized !== false } : {}),
      agent,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }));
      res.on('error', reject);
    });
    req.on('timeout', () => {
      req.destroy(new WinRMError('TIMEOUT', `WinRM: no response from ${host}:${port} within ${timeoutMs}ms`));
    });
    req.on('error', (err) => {
      if (err instanceof WinRMError) return reject(err);
      if (UNREACHABLE_CODES.has(err.code)) {
        return reject(new WinRMError('UNREACHABLE',
          `WinRM: cannot reach ${host}:${port} (${err.code}${err.message ? `: ${err.message}` : ''})`));
      }
      reject(new WinRMError('PROTOCOL', `WinRM: request to ${host}:${port} failed (${err.message})`));
    });
    req.end(body);
  });
}

function ntlmChallengeFrom(headers) {
  const values = asArray(headers['www-authenticate'] || []);
  for (const v of values) {
    const m = String(v).match(/NTLM\s+([A-Za-z0-9+/=]+)/i);
    if (m) return m[1];
    if (/^\s*NTLM\s*$/i.test(String(v))) return ''; // bare offer, no blob
  }
  return null; // NTLM not offered at all
}

function basicOffered(headers) {
  const values = asArray(headers['www-authenticate'] || []);
  return values.some((v) => /\bBasic\b/i.test(String(v)));
}

// The login name as Basic auth expects it: DOMAIN\user when a domain is
// known (checkCreds splits DOMAIN\user / user@domain apart for NTLM),
// otherwise the bare username.
function basicLoginName(creds) {
  return creds.domain ? `${creds.domain}\\${creds.username}` : creds.username;
}

/**
 * One SOAP call with the full NTLM handshake, on a single keep-alive
 * connection (NTLM is connection-oriented: all three requests of the
 * handshake must travel on the same TCP connection, which the keep-alive
 * agent below guarantees for sequential requests). When the server
 * offers only Basic authentication, the credentials are sent as Basic
 * instead — only over HTTPS (or with allowUnencrypted explicitly set);
 * see the branch inside. NTLM is always preferred when offered.
 *
 * Returns { status, headers, body } for a 2xx answer. A 401 after the
 * Type 3 message (or after Basic) is an authentication failure;
 * anything else non-2xx is a protocol error (the SOAP Fault, if any,
 * is surfaced by the caller).
 */
async function ntlmPost(target, soapXml, creds, timeoutMs) {
  const agent = target.transport === 'https'
    ? new https.Agent({ keepAlive: true, maxSockets: 1, rejectUnauthorized: creds.rejectUnauthorized !== false })
    : new http.Agent({ keepAlive: true, maxSockets: 1 });
  const { username, password, domain, workstation } = creds;
  const doPost = (authHeader) => postOnce({
    transport: target.transport, host: target.host, port: target.port,
    path: target.path, body: soapXml,
    headers: authHeader ? { Authorization: authHeader } : {},
    timeoutMs, rejectUnauthorized: creds.rejectUnauthorized, agent,
  });
  try {
    let res = await doPost(null);
    if (res.status >= 200 && res.status < 300) return res;
    if (res.status !== 401) {
      throw new WinRMError('PROTOCOL',
        `WinRM: ${target.host}:${target.port} answered HTTP ${res.status} (expected 401 with NTLM challenge)`);
    }
    // First 401: either a bare NTLM offer (send Type 1) or a challenge
    // blob already (some servers send Type 2 immediately — go to Type 3).
    let challengeB64 = ntlmChallengeFrom(res.headers);
    if (challengeB64 === null) {
      // No NTLM on offer. Basic fallback (ported from the winrm-route
      // fork): only when the server offers Basic AND the transport is
      // HTTPS, or the caller explicitly opted into unencrypted Basic
      // with allowUnencrypted. Anything else refuses rather than
      // sending credentials in the clear.
      if (!basicOffered(res.headers)) {
        throw new WinRMError('AUTH_FAILED',
          `WinRM: ${target.host}:${target.port} did not offer NTLM authentication (401 without WWW-Authenticate: NTLM)`);
      }
      if (target.transport !== 'https' && !creds.allowUnencrypted) {
        throw new WinRMError('AUTH_FAILED',
          `WinRM: ${target.host}:${target.port} offers only Basic authentication over plain HTTP; ` +
          `Basic credentials are only sent over HTTPS (or with allowUnencrypted explicitly set)`);
      }
      const basic = Buffer.from(`${basicLoginName(creds)}:${password}`, 'utf8').toString('base64');
      res = await doPost(`Basic ${basic}`);
      if (res.status === 401) {
        throw new WinRMError('AUTH_FAILED',
          `WinRM: authentication failed for user "${username}" on ${target.host}:${target.port} ` +
          `(server rejected the Basic credentials — check username, password and domain)`);
      }
      if (res.status < 200 || res.status >= 300) {
        throw new WinRMError('PROTOCOL',
          `WinRM: ${target.host}:${target.port} answered HTTP ${res.status} after Basic authentication`);
      }
      return res;
    }
    let type2;
    if (challengeB64) {
      type2 = ntlm.parseType2(Buffer.from(challengeB64, 'base64'));
    } else {
      res = await doPost(`NTLM ${ntlm.createType1().toString('base64')}`);
      if (res.status >= 200 && res.status < 300) return res; // server accepted Type 1 (rare)
      if (res.status !== 401) {
        throw new WinRMError('PROTOCOL',
          `WinRM: ${target.host}:${target.port} answered HTTP ${res.status} to the NTLM Type 1 message`);
      }
      challengeB64 = ntlmChallengeFrom(res.headers);
      if (!challengeB64) {
        throw new WinRMError('AUTH_FAILED',
          `WinRM: ${target.host}:${target.port} did not send an NTLM challenge after Type 1`);
      }
      type2 = ntlm.parseType2(Buffer.from(challengeB64, 'base64'));
    }
    const type3 = ntlm.createType3({ username, domain, workstation, password, type2 });
    res = await doPost(`NTLM ${type3.toString('base64')}`);
    if (res.status === 401) {
      throw new WinRMError('AUTH_FAILED',
        `WinRM: authentication failed for user "${username}" on ${target.host}:${target.port} ` +
        `(server rejected the NTLM response — check username, password and domain)`);
    }
    if (res.status < 200 || res.status >= 300) {
      throw new WinRMError('PROTOCOL',
        `WinRM: ${target.host}:${target.port} answered HTTP ${res.status} after NTLM authentication`);
    }
    return res;
  } finally {
    agent.destroy();
  }
}

// --- Public API --------------------------------------------------------------

function checkCreds(opts) {
  if (!opts || typeof opts !== 'object') throw invalidArg('options');
  if (!opts.username || typeof opts.username !== 'string') throw invalidArg('username');
  if (opts.password === undefined || opts.password === null || typeof opts.password !== 'string') {
    throw invalidArg('password');
  }
  if (opts.password === '') throw invalidArg('password');
  const { username, domain } = ntlm.splitLogin(opts.username, opts.domain);
  if (!username) throw invalidArg('username');
  return {
    username,
    domain,
    workstation: opts.workstation || require('os').hostname(),
    rejectUnauthorized: opts.rejectUnauthorized,
    // Basic-over-HTTP opt-in only: the client never sends Basic over
    // plain HTTP unless the caller explicitly sets this.
    allowUnencrypted: opts.allowUnencrypted === true,
  };
}

function remainingMs(deadline) {
  return Math.max(0, deadline - Date.now());
}

/**
 * Run one command on a Windows host via WinRM.
 * The command string is executed as `cmd.exe /c <command>` — WinRM's
 * CommandLine takes a program plus separate arguments, so a raw command
 * line is handed to cmd.exe exactly as written.
 */
async function runShellCommand(host, opts) {
  const creds = checkCreds(opts);
  if (!opts.command || typeof opts.command !== 'string') throw invalidArg('command');
  const target = parseTarget(host, opts);
  const timeoutMs = Math.max(1000, opts.timeoutMs || opts.timeout || DEFAULT_TIMEOUT_MS);
  const deadline = Date.now() + timeoutMs;
  const started = Date.now();
  const password = opts.password; // kept in a local only; never logged/stored
  const auth = { ...creds, password };

  let shellId = null;
  let commandId = null;
  try {
    const createRes = await ntlmPost(target,
      fillEndpoint(buildCreateShell({
        idleTimeoutSec: Math.min(600, Math.ceil(timeoutMs / 1000)),
        workingDirectory: opts.workingDirectory,
        environment: opts.environment,
      }), target.endpoint), auth, remainingMs(deadline));
    shellId = parseCreateShellResponse(createRes.body);

    const cmdRes = await ntlmPost(target,
      fillEndpoint(buildCommand({
        shellId, command: 'cmd.exe', args: ['/c', opts.command],
      }), target.endpoint), auth, remainingMs(deadline));
    commandId = parseCommandResponse(cmdRes.body);

    let stdout = '';
    let stderr = '';
    let exitCode = null;
    for (;;) {
      if (remainingMs(deadline) <= 0) {
        // Best effort: terminate the remote command before reporting.
        try {
          await ntlmPost(target,
            fillEndpoint(buildSignal({ shellId, commandId, code: SIGNAL_TERMINATE }), target.endpoint),
            auth, 5000);
        } catch (e) { /* already timing out; the original error wins */ }
        throw new WinRMError('TIMEOUT',
          `WinRM: command on ${target.host} did not finish within ${timeoutMs}ms`);
      }
      const recvRes = await ntlmPost(target,
        fillEndpoint(buildReceive({ shellId, commandId }), target.endpoint),
        auth, Math.min(remainingMs(deadline), 60000));
      const recv = parseReceiveResponse(recvRes.body);
      for (const s of recv.streams) {
        if (s.name === 'stdout') stdout += s.text;
        else if (s.name === 'stderr') stderr += s.text;
        else stdout += s.text; // unknown stream name: keep the bytes, don't drop output
      }
      if (recv.done) {
        exitCode = recv.exitCode;
        break;
      }
      // No output yet and not done: the server blocks each Receive up to
      // its OperationTimeout, so this loop does not spin.
    }
    return {
      host: target.host,
      transport: target.transport,
      port: target.port,
      command: opts.command,
      stdout,
      stderr,
      exitCode,
      commandId,
      shellId,
      durationMs: Date.now() - started,
    };
  } finally {
    if (shellId) {
      try {
        await ntlmPost(target,
          fillEndpoint(buildDeleteShell({ shellId }), target.endpoint),
          auth, 5000);
      } catch (e) { /* shell cleanup is best-effort; never masks the real result */ }
    }
  }
}

/**
 * Run a WQL query against a WMI namespace via WS-Enumeration.
 * Returns the CIM instances as plain objects: { __class, ...properties }.
 */
async function runWql(host, opts) {
  const creds = checkCreds(opts);
  if (!opts.query || typeof opts.query !== 'string') throw invalidArg('query');
  const target = parseTarget(host, opts);
  const timeoutMs = Math.max(1000, opts.timeoutMs || opts.timeout || DEFAULT_TIMEOUT_MS);
  const deadline = Date.now() + timeoutMs;
  const namespace = opts.namespace || 'root/cimv2';
  const maxResults = opts.maxResults || 1000;
  const auth = { ...creds, password: opts.password };

  const enumRes = await ntlmPost(target,
    fillEndpoint(buildEnumerate({ namespace, query: opts.query, maxElements: 32 }), target.endpoint),
    auth, remainingMs(deadline));
  let { enumerationContext, items } = parseEnumerateResponse(enumRes.body);
  const results = [...items];
  while (enumerationContext && results.length < maxResults && remainingMs(deadline) > 0) {
    const pullRes = await ntlmPost(target,
      fillEndpoint(buildPull({ enumerationContext, maxElements: 32 }), target.endpoint),
      auth, remainingMs(deadline));
    const pulled = parsePullResponse(pullRes.body);
    results.push(...pulled.items);
    enumerationContext = pulled.endOfSequence ? null : pulled.enumerationContext;
    if (pulled.items.length === 0 && !pulled.endOfSequence && !pulled.enumerationContext) break;
  }
  return {
    host: target.host,
    namespace,
    query: opts.query,
    results: results.slice(0, maxResults),
    count: Math.min(results.length, maxResults),
  };
}

module.exports = {
  runShellCommand,
  runWql,
  WinRMError,
  // Exported for the self-test (scripts/winrm-selftest.js) and the
  // winrm-tests track; not part of the runtime call surface.
  buildEnvelope,
  buildCreateShell,
  buildCommand,
  buildReceive,
  buildSignal,
  buildDeleteShell,
  buildEnumerate,
  buildPull,
  parseSoap,
  parseCreateShellResponse,
  parseCommandResponse,
  parseReceiveResponse,
  parseEnumerateResponse,
  parsePullResponse,
  wmiResourceUri,
  DEFAULT_PORT,
  DEFAULT_TIMEOUT_MS,
  NS,
  ACTION,
};
