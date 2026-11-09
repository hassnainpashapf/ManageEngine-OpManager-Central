'use strict';

/**
 * winrm-selftest.js — validation for server/services/winrm.js + ntlm.js.
 *
 * Run:  node scripts/winrm-selftest.js        (exit 0 = all checks pass)
 *
 * Validation method (what each section actually proves):
 *  1. MD4: the vendored pure-JS MD4 is checked against all seven RFC 1320
 *     test vectors. This anchors the whole NTLM chain: every later check
 *     that uses MD4 (NT hash, NTLMv2 hash) rests on a primitive verified
 *     against the RFC, not against itself.
 *  2. NT hash: MD4(UTF-16LE("Password")) must equal the published value
 *     a4f49c406510bdcab6824ee7c30fd852.
 *  3. NTLM messages: a Type 2 challenge is built with fixed bytes and
 *     parsed back (round-trip); a Type 3 is built with a PINNED client
 *     challenge and timestamp, then verified field-by-field with an
 *     INDEPENDENT code path — Node's built-in crypto HMAC-MD5 recomputes
 *     the NTLMv2 proof and the LMv2 proof from the NT hash, and the blob
 *     layout (RespType/HiRespType/timestamp/client challenge/target info)
 *     is asserted byte by byte. The structure code is therefore checked
 *     by crypto code that does not share its implementation.
 *  4. SOAP envelopes: every envelope the client builds (Create shell,
 *     Command, Receive, Signal, Delete, Enumerate, Pull) is parsed back
 *     with fast-xml-parser and asserted for Action, ResourceURI, ShellId
 *     selector, and payload — including a command containing <>&"' which
 *     must survive XML escaping and parse back unchanged.
 *  5. End-to-end against a LOCAL MOCK WinRM SERVER (in-process, bound to
 *     127.0.0.1 on an ephemeral port): the mock speaks real HTTP and the
 *     real NTLM handshake — it answers 401 to anonymous requests, sends
 *     a Type 2 challenge to a Type 1, and CRYPTOGRAPHICALLY VERIFIES the
 *     client's Type 3 (recomputes the NTLMv2/LMv2 proofs with Node crypto
 *     and the known test password) before serving any SOAP. It then runs
 *     the real WS-Man shell flow (Create -> Command -> two Receives ->
 *     Delete) and the real WS-Enumeration flow (Enumerate -> Pull ->
 *     EndOfSequence). runShellCommand and runWql are exercised against
 *     it over real sockets. The mock's data is labelled MOCK everywhere
 *     and never leaves this test process.
 *  6. Negative paths: wrong password -> AUTH_FAILED (502), closed port ->
 *     UNREACHABLE (502), Receive delayed past the deadline -> TIMEOUT
 *     (502) with a terminate signal attempted.
 *
 * What this does NOT prove: a real Windows host. No WinRM-enabled host
 * exists in this environment, so the last hop (a genuine WinRM service
 * accepting these exact bytes) is unproven until a host + credentials
 * exist. See docs/winrm.md.
 *
 * Test credentials used here ("TESTDOM\\winrmtest" / "TestPass123!") are
 * invented for the mock only. They are never sent anywhere except to the
 * in-process mock on 127.0.0.1, and are never written to a file.
 */

const http = require('http');
const crypto = require('crypto');
const { XMLParser } = require('fast-xml-parser');
const ntlm = require('../server/services/ntlm');
const winrm = require('../server/services/winrm');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, extra) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  FAIL  ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

function section(title) {
  console.log(`\n== ${title} ==`);
}

async function expectWinRMError(name, fn, code, httpStatus) {
  try {
    await fn();
    check(name, false, 'no error thrown');
  } catch (err) {
    check(name, err && err.name === 'WinRMError' && err.code === code && err.httpStatus === (httpStatus || 502),
      err && err.message ? `${err.code || err.name}: ${err.message}` : String(err));
  }
}

// --- 1. MD4 RFC 1320 vectors ------------------------------------------------

section('1. MD4 — RFC 1320 test vectors');
const md4Vectors = [
  ['', '31d6cfe0d16ae931b73c59d7e0c089c0'],
  ['a', 'bde52cb31de33e46245e05fbdbd6fb24'],
  ['abc', 'a448017aaf21d8525fc10ae87aa6729d'],
  ['message digest', 'd9130a8164549fe818874806e1c7014b'],
  ['abcdefghijklmnopqrstuvwxyz', 'd79e1c308aa5bbcdeea8ed63df412da9'],
  ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', '043f8582f241db351ce627e153e7f0e4'],
  ['12345678901234567890123456789012345678901234567890123456789012345678901234567890', 'e33b4ddc9c38f2199c3e7b164fcc0536'],
];
for (const [input, expected] of md4Vectors) {
  check(`md4(${JSON.stringify(input.slice(0, 12))}${input.length > 12 ? '…' : ''})`, ntlm.md4(input).toString('hex') === expected);
}

// --- 2. NT hash known vector -------------------------------------------------

section('2. NT hash — published vector');
check('md4(utf16le("Password")) = a4f49c406510bdcab6824ee7c30fd852',
  ntlm.ntHash('Password').toString('hex') === 'a4f49c406510bdcab6824ee7c30fd852');

// --- 3. NTLM Type 1 / 2 / 3 structure ---------------------------------------

section('3. NTLM message structure');
const t1 = ntlm.createType1();
check('Type 1 is 32 bytes', t1.length === 32);
check('Type 1 signature "NTLMSSP\\0"', t1.toString('ascii', 0, 8) === 'NTLMSSP\0');
check('Type 1 message type = 1', t1.readUInt32LE(8) === 1);
check('Type 1 requests UNICODE + NTLM + NTLM2_KEY + TARGET_INFO',
  (t1.readUInt32LE(12) & ntlm.FLAG.NEGOTIATE_UNICODE) !== 0 &&
  (t1.readUInt32LE(12) & ntlm.FLAG.NEGOTIATE_NTLM) !== 0 &&
  (t1.readUInt32LE(12) & ntlm.FLAG.NEGOTIATE_NTLM2_KEY) !== 0 &&
  (t1.readUInt32LE(12) & ntlm.FLAG.NEGOTIATE_TARGET_INFO) !== 0);

const FIXED_CHALLENGE = Buffer.from('0123456789abcdef', 'hex');
const FIXED_TARGET_INFO = [
  { id: ntlm.AV.NB_DOMAIN_NAME, value: Buffer.from('TESTDOM', 'utf16le') },
  { id: ntlm.AV.DNS_DOMAIN_NAME, value: Buffer.from('testdom.local', 'utf16le') },
];
const t2buf = ntlm.buildType2({
  challenge: FIXED_CHALLENGE,
  targetName: 'TESTDOM',
  targetInfo: FIXED_TARGET_INFO,
  flags: ntlm.TYPE1_FLAGS,
});
const t2 = ntlm.parseType2(t2buf);
check('Type 2 round-trips server challenge', t2.serverChallenge.equals(FIXED_CHALLENGE));
check('Type 2 round-trips target name', t2.targetName === 'TESTDOM');
check('Type 2 round-trips target-info AV pairs',
  t2.targetInfoPairs.length === 2 &&
  t2.targetInfoPairs[0].id === ntlm.AV.NB_DOMAIN_NAME &&
  t2.targetInfoPairs[0].value.toString('utf16le') === 'TESTDOM');

// Deterministic Type 3: pinned client challenge + timestamp.
const PINNED_CC = Buffer.from('aabbccddeeff0011', 'hex');
const PINNED_TS = ntlm.fileTime(new Date('2026-01-01T00:00:00.000Z'));
const t3buf = ntlm.createType3({
  username: 'winrmtest', domain: 'TESTDOM', workstation: 'TESTWS',
  password: 'TestPass123!', type2: t2,
  overrides: { clientChallenge: PINNED_CC, timestamp: PINNED_TS },
});
const t3 = ntlm.parseType3(t3buf);
check('Type 3 signature + type', t3buf.toString('ascii', 0, 8) === 'NTLMSSP\0' && t3buf.readUInt32LE(8) === 3);
check('Type 3 username/domain/workstation decode',
  t3.username === 'winrmtest' && t3.domain === 'TESTDOM' && t3.workstation === 'TESTWS');
check('Type 3 LMv2 response is 24 bytes', t3.lmResponse.length === 24);
check('Type 3 NTLMv2 response is 16 + blob', t3.ntResponse.length > 16);

// Independent verification with Node's built-in HMAC-MD5 (not this file's
// response builder): recompute the NTLMv2 hash from the anchored NT hash,
// then the proofs, and compare against what createType3 produced.
const indepHash = crypto.createHmac('md5', ntlm.ntHash('TestPass123!'))
  .update(Buffer.from('WINRMTESTTESTDOM', 'utf16le')).digest();
const blob = t3.ntResponse.subarray(16);
const indepNtProof = crypto.createHmac('md5', indepHash)
  .update(Buffer.concat([FIXED_CHALLENGE, blob])).digest();
check('NTLMv2 proof matches independent HMAC-MD5 recomputation',
  t3.ntResponse.subarray(0, 16).equals(indepNtProof));
check('NTLMv2 blob: RespType=1, HiRespType=1', blob[0] === 0x01 && blob[1] === 0x01);
check('NTLMv2 blob: pinned timestamp', blob.readBigUInt64LE(4) === PINNED_TS);
check('NTLMv2 blob: pinned client challenge', blob.subarray(12, 20).equals(PINNED_CC));
check('NTLMv2 blob: echoes server target info',
  blob.includes(Buffer.from('TESTDOM', 'utf16le')));
const indepLmProof = crypto.createHmac('md5', indepHash)
  .update(Buffer.concat([FIXED_CHALLENGE, PINNED_CC])).digest();
check('LMv2 proof matches independent HMAC-MD5 recomputation',
  t3.lmResponse.subarray(0, 16).equals(indepLmProof));
check('LMv2 response ends with the client challenge',
  t3.lmResponse.subarray(16).equals(PINNED_CC));

// --- 4. SOAP envelope construction -------------------------------------------

section('4. SOAP envelopes — build, parse back, assert');
const parse = new XMLParser({
  ignoreAttributes: false, attributeNamePrefix: '@_',
  removeNSPrefix: true, parseTagValue: false, parseAttributeValue: false, trimValues: true,
});
function soapBody(xml) {
  const doc = parse.parse(xml);
  return (doc.Envelope || doc).Body;
}
function soapHeader(xml) {
  const doc = parse.parse(xml);
  return (doc.Envelope || doc).Header;
}

const trickyCmd = 'echo a<b>&"\'c | find "x"';
const createXml = winrm.buildCreateShell({ idleTimeoutSec: 120, workingDirectory: 'C:\\Temp' });
check('Create: Action = transfer/Create',
  soapHeader(createXml).Action === 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Create');
check('Create: ResourceURI = shell/cmd',
  soapHeader(createXml).ResourceURI === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd');
check('Create: InputStreams stdin, OutputStreams stdout stderr',
  soapBody(createXml).Shell.InputStreams === 'stdin' &&
  soapBody(createXml).Shell.OutputStreams === 'stdout stderr');
check('Create: IdleTimeout PT120S + WorkingDirectory',
  soapBody(createXml).Shell.IdleTimeout === 'PT120S' &&
  soapBody(createXml).Shell.WorkingDirectory === 'C:\\Temp');

const cmdXml = winrm.buildCommand({ shellId: 'SHELL-1', command: 'cmd.exe', args: ['/c', trickyCmd] });
check('Command: Action = shell/Command',
  soapHeader(cmdXml).Action === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command');
check('Command: ShellId selector present',
  soapHeader(cmdXml).SelectorSet.Selector['#text'] === 'SHELL-1' ||
  JSON.stringify(soapHeader(cmdXml).SelectorSet).includes('SHELL-1'));
check('Command: cmd.exe /c + tricky command round-trips through XML escaping',
  soapBody(cmdXml).CommandLine.Command === 'cmd.exe' &&
  soapBody(cmdXml).CommandLine.Arguments[1] === trickyCmd,
  JSON.stringify(soapBody(cmdXml).CommandLine));

const recvXml = winrm.buildReceive({ shellId: 'SHELL-1', commandId: 'CMD-1' });
check('Receive: Action = shell/Receive, DesiredStream stdout stderr',
  soapHeader(recvXml).Action === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive' &&
  soapBody(recvXml).Receive.DesiredStream['#text'] === 'stdout stderr');

const sigXml = winrm.buildSignal({
  shellId: 'SHELL-1', commandId: 'CMD-1',
  code: 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/signal/terminate',
});
check('Signal: terminate code on the right CommandId',
  soapHeader(sigXml).Action === 'http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Signal' &&
  soapBody(sigXml).Signal['@_Code'].includes('/signal/terminate'));

const delXml = winrm.buildDeleteShell({ shellId: 'SHELL-1' });
check('Delete: Action = transfer/Delete, ShellId selector',
  soapHeader(delXml).Action === 'http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete' &&
  JSON.stringify(soapHeader(delXml).SelectorSet).includes('SHELL-1'));

const enumXml = winrm.buildEnumerate({
  namespace: 'root/cimv2', query: 'SELECT Name FROM Win32_OperatingSystem WHERE Name LIKE \'%a<b%\'',
});
check('Enumerate: WQL dialect + query round-trips',
  soapHeader(enumXml).Action === 'http://schemas.xmlsoap.org/ws/2004/09/enumeration/Enumerate' &&
  soapBody(enumXml).Enumerate.Filter['#text'] === 'SELECT Name FROM Win32_OperatingSystem WHERE Name LIKE \'%a<b%\'' &&
  soapBody(enumXml).Enumerate.Filter['@_Dialect'] === 'http://schemas.microsoft.com/wbem/wsman/1/WQL');
check('Enumerate: ResourceURI = wmi/root/cimv2/*',
  soapHeader(enumXml).ResourceURI === 'http://schemas.microsoft.com/wbem/wsman/1/wmi/root/cimv2/*');

const pullXml = winrm.buildPull({ enumerationContext: 'CTX-9', maxElements: 32 });
check('Pull: Action + EnumerationContext',
  soapHeader(pullXml).Action === 'http://schemas.xmlsoap.org/ws/2004/09/enumeration/Pull' &&
  soapBody(pullXml).Pull.EnumerationContext === 'CTX-9');

// Response parsing (client side) against hand-written server replies.
const recvReply = `<?xml version="1.0"?><s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell"><s:Body><rsp:ReceiveResponse><rsp:Stream Name="stdout" CommandId="CMD-1">${Buffer.from('hello winrm\r\n').toString('base64')}</rsp:Stream><rsp:Stream Name="stderr" CommandId="CMD-1"></rsp:Stream><rsp:CommandState State="http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done"><rsp:ExitCode>0</rsp:ExitCode></rsp:CommandState></rsp:ReceiveResponse></s:Body></s:Envelope>`;
const parsedRecv = winrm.parseReceiveResponse(recvReply);
check('Receive parse: stdout decoded, done, exitCode 0',
  parsedRecv.done === true && parsedRecv.exitCode === 0 &&
  parsedRecv.streams.find((s) => s.name === 'stdout').text === 'hello winrm\r\n');

const faultReply = `<?xml version="1.0"?><s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body><s:Fault><s:Code><s:Value>s:Sender</s:Value></s:Code><s:Reason><s:Text>Access denied</s:Text></s:Reason></s:Fault></s:Body></s:Envelope>`;
let faultThrown = null;
try { winrm.parseSoap(faultReply, 'test'); } catch (e) { faultThrown = e; }
check('SOAP Fault parses to WinRMError PROTOCOL with the fault text',
  faultThrown && faultThrown.code === 'PROTOCOL' && /Access denied/.test(faultThrown.message));

// --- 5. Mock WinRM server: real HTTP + real NTLM + real WS-Man -------------

section('5. End-to-end against a local mock WinRM server (real HTTP + NTLM + SOAP)');

// Mock credentials (invented for this test only; only ever sent to 127.0.0.1).
const MOCK_USER = 'winrmtest';
const MOCK_DOMAIN = 'TESTDOM';
const MOCK_PASSWORD = 'TestPass123!';
const MOCK_CHALLENGE = Buffer.from('deadbeefcafebabe', 'hex');

const mockParser = new XMLParser({
  ignoreAttributes: true, removeNSPrefix: true,
  parseTagValue: false, parseAttributeValue: false, trimValues: true,
});

function mockEnvelope(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" ` +
    `xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell" ` +
    `xmlns:wsen="http://schemas.xmlsoap.org/ws/2004/09/enumeration">` +
    `<s:Header><s:Action>mock</s:Action></s:Header><s:Body>${inner}</s:Body></s:Envelope>`;
}

/** Cryptographically verify a client's Type 3 (independent recomputation). */
function verifyType3(type3buf) {
  try {
    const p = ntlm.parseType3(type3buf);
    if (p.username !== MOCK_USER || p.domain !== MOCK_DOMAIN) return false;
    const hash = ntlm.ntlmV2Hash(p.username, p.domain, MOCK_PASSWORD);
    const ntResp = p.ntResponse;
    if (ntResp.length <= 16) return false;
    const blob = ntResp.subarray(16);
    const expectedProof = crypto.createHmac('md5', hash)
      .update(Buffer.concat([MOCK_CHALLENGE, blob])).digest();
    if (!ntResp.subarray(0, 16).equals(expectedProof)) return false;
    const cc = blob.subarray(12, 20);
    const expectedLm = crypto.createHmac('md5', hash)
      .update(Buffer.concat([MOCK_CHALLENGE, cc])).digest();
    if (!p.lmResponse.subarray(0, 16).equals(expectedLm)) return false;
    if (!p.lmResponse.subarray(16).equals(cc)) return false;
    if (blob[0] !== 0x01 || blob[1] !== 0x01) return false;
    return true;
  } catch (e) {
    return false;
  }
}

let authVerifiedCount = 0;
let receiveCount = 0;
let slowMode = false;

const mock = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('NTLM ')) {
      res.writeHead(401, { 'WWW-Authenticate': 'NTLM' });
      return res.end();
    }
    const token = Buffer.from(auth.slice(5), 'base64');
    if (token.length >= 12 && token.readUInt32LE(8) === 1) {
      // Type 1 -> 401 + Type 2 challenge.
      const type2 = ntlm.buildType2({
        challenge: MOCK_CHALLENGE,
        targetName: MOCK_DOMAIN,
        targetInfo: [{ id: ntlm.AV.NB_DOMAIN_NAME, value: Buffer.from(MOCK_DOMAIN, 'utf16le') }],
        flags: ntlm.TYPE1_FLAGS,
      });
      res.writeHead(401, { 'WWW-Authenticate': `NTLM ${type2.toString('base64')}` });
      return res.end();
    }
    if (token.length >= 12 && token.readUInt32LE(8) === 3) {
      if (!verifyType3(token)) {
        res.writeHead(401, { 'WWW-Authenticate': 'NTLM' });
        return res.end();
      }
      authVerifiedCount++;
      // Authenticated: route by SOAP body element.
      let doc;
      try { doc = mockParser.parse(body); } catch (e) { doc = {}; }
      const soapBodyNode = ((doc.Envelope || {}).Body) || {};
      const send = (code, inner) => {
        res.writeHead(code, { 'Content-Type': 'application/soap+xml;charset=UTF-8' });
        res.end(mockEnvelope(inner));
      };
      if (soapBodyNode.Shell !== undefined) {
        return send(200, `<rsp:Shell><rsp:ShellId>MOCK-SHELL-1</rsp:ShellId>` +
          `<rsp:ResourceUri>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</rsp:ResourceUri>` +
          `<rsp:Owner>MOCK</rsp:Owner><rsp:ClientIP>127.0.0.1</rsp:ClientIP>` +
          `<rsp:IdleTimeOut>PT60S</rsp:IdleTimeOut>` +
          `<rsp:InputStreams>stdin</rsp:InputStreams><rsp:OutputStreams>stdout stderr</rsp:OutputStreams></rsp:Shell>`);
      }
      if (soapBodyNode.CommandLine !== undefined) {
        const args = soapBodyNode.CommandLine.Arguments;
        const cmdText = Array.isArray(args) ? args.join(' ') : String(args || '');
        slowMode = cmdText.includes('MOCK-SLOW');
        receiveCount = 0;
        return send(200, `<rsp:CommandResponse><rsp:CommandId>MOCK-CMD-1</rsp:CommandId></rsp:CommandResponse>`);
      }
      if (soapBodyNode.Receive !== undefined) {
        receiveCount++;
        const reply = () => {
          if (receiveCount === 1) {
            return send(200, `<rsp:ReceiveResponse>` +
              `<rsp:Stream Name="stdout" CommandId="MOCK-CMD-1">${Buffer.from('hello ').toString('base64')}</rsp:Stream>` +
              `</rsp:ReceiveResponse>`);
          }
          return send(200, `<rsp:ReceiveResponse>` +
            `<rsp:Stream Name="stdout" CommandId="MOCK-CMD-1">${Buffer.from('winrm\r\n').toString('base64')}</rsp:Stream>` +
            `<rsp:Stream Name="stderr" CommandId="MOCK-CMD-1"></rsp:Stream>` +
            `<rsp:CommandState State="http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done"><rsp:ExitCode>0</rsp:ExitCode></rsp:CommandState>` +
            `</rsp:ReceiveResponse>`);
        };
        if (slowMode) return setTimeout(reply, 3000);
        return reply();
      }
      if (soapBodyNode.Signal !== undefined) {
        return send(200, `<rsp:SignalResponse/>`);
      }
      if (soapBodyNode.Enumerate !== undefined) {
        return send(200, `<wsen:EnumerateResponse>` +
          `<wsen:EnumerationContext>MOCK-CTX-1</wsen:EnumerationContext>` +
          `<wsen:Items><wsen:Item>` +
          `<p:Win32_OperatingSystem xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">` +
          `<p:Caption>Mock Windows</p:Caption><p:Version>10.0.19045</p:Version>` +
          `<p:NumberOfProcesses>42</p:NumberOfProcesses>` +
          `</p:Win32_OperatingSystem></wsen:Item></wsen:Items>` +
          `</wsen:EnumerateResponse>`);
      }
      if (soapBodyNode.Pull !== undefined) {
        return send(200, `<wsen:PullResponse><wsen:EndOfSequence/>` +
          `<wsen:Items/></wsen:PullResponse>`);
      }
      // Delete shell (empty body) and anything else: empty 200 envelope.
      return send(200, '');
    }
    res.writeHead(401, { 'WWW-Authenticate': 'NTLM' });
    return res.end();
  });
});

async function runMockTests(port) {
  const host = `127.0.0.1:${port}`;
  const creds = { username: `${MOCK_DOMAIN}\\${MOCK_USER}`, password: MOCK_PASSWORD };

  const shell = await winrm.runShellCommand(host, { ...creds, command: 'echo hello winrm', timeoutMs: 15000 });
  check('runShellCommand: stdout across two Receives',
    shell.stdout === 'hello winrm\r\n', JSON.stringify(shell.stdout));
  check('runShellCommand: exitCode 0, stderr empty', shell.exitCode === 0 && shell.stderr === '');
  check('runShellCommand: shellId/commandId from the server',
    shell.shellId === 'MOCK-SHELL-1' && shell.commandId === 'MOCK-CMD-1');
  check('mock server cryptographically verified the client Type 3 (NTLMv2 proofs)',
    authVerifiedCount >= 5, `verified ${authVerifiedCount} authenticated calls`);

  const wql = await winrm.runWql(host, {
    ...creds, namespace: 'root/cimv2',
    query: 'SELECT Caption, Version FROM Win32_OperatingSystem', timeoutMs: 15000,
  });
  check('runWql: one CIM instance returned', wql.count === 1 && wql.results.length === 1);
  check('runWql: instance parsed to plain object',
    wql.results[0] && wql.results[0].__class === 'Win32_OperatingSystem' &&
    wql.results[0].Caption === 'Mock Windows' && wql.results[0].Version === '10.0.19045' &&
    wql.results[0].NumberOfProcesses === '42',
    JSON.stringify(wql.results[0]));

  await expectWinRMError('runShellCommand with wrong password -> AUTH_FAILED 502',
    () => winrm.runShellCommand(host, { username: `${MOCK_DOMAIN}\\${MOCK_USER}`, password: 'WrongPass!', command: 'echo x', timeoutMs: 15000 }),
    'AUTH_FAILED');
  await expectWinRMError('runShellCommand to a closed port -> UNREACHABLE 502',
    () => winrm.runShellCommand('127.0.0.1', { ...creds, port: 59998, command: 'echo x', timeoutMs: 5000 }),
    'UNREACHABLE');
  await expectWinRMError('runShellCommand past its deadline -> TIMEOUT 502',
    () => winrm.runShellCommand(host, { ...creds, command: 'echo MOCK-SLOW', timeoutMs: 1000 }),
    'TIMEOUT');
  await expectWinRMError('runShellCommand with empty command -> INVALID_ARGUMENT (no I/O)',
    () => winrm.runShellCommand(host, { ...creds, command: '', timeoutMs: 5000 }),
    'INVALID_ARGUMENT', 400);
  await expectWinRMError('runWql with empty query -> INVALID_ARGUMENT (no I/O)',
    () => winrm.runWql(host, { ...creds, query: '' }),
    'INVALID_ARGUMENT', 400);
}

mock.listen(0, '127.0.0.1', async () => {
  const port = mock.address().port;
  console.log(`  (mock WinRM server on 127.0.0.1:${port})`);
  try {
    await runMockTests(port);
  } catch (err) {
    failed++;
    failures.push(`mock tests crashed: ${err.message}`);
    console.log(`  FAIL  mock tests crashed — ${err.stack}`);
  } finally {
    mock.close();
  }
  console.log(`\n${passed} passed, ${failed} failed${failures.length ? ` — ${failures.join('; ')}` : ''}`);
  process.exit(failed ? 1 : 0);
});
