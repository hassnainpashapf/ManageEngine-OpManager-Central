'use strict';
/**
 * winrm-basic-proof.js — Phase 4 merge (p4m-winrm) proof for the
 * Basic-over-HTTPS fallback ported from the winrm-route fork onto the
 * canonical winrm-service client (server/services/winrm.js).
 *
 * The canonical client previously did NTLM only; a server offering only
 * Basic got AUTH_FAILED. This script proves the ported fallback against
 * local listeners (127.0.0.1 only — NOT Windows hosts) that offer ONLY
 * Basic authentication and answer a minimal EnumerateResponse:
 *   1. HTTP + allowUnencrypted:true + correct credentials -> runWql
 *      succeeds, results[0] is the listener's CIM instance.
 *   2. HTTP without allowUnencrypted -> AUTH_FAILED AND the listener
 *      received NO Basic Authorization header (credentials are never
 *      sent in the clear by accident).
 *   3. HTTPS (self-signed cert, rejectUnauthorized:false) + useHttps:true
 *      + correct credentials -> runWql succeeds (proves useHttps
 *      handling and Basic-over-HTTPS for real).
 *   4. HTTPS + wrong password -> AUTH_FAILED.
 *   5. A server offering neither NTLM nor Basic -> AUTH_FAILED.
 * NTLM preference (NTLM still wins when offered) is covered by the
 * winrm-service selftest (52/52), not repeated here.
 *
 * The HTTPS listener needs a self-signed certificate: the script
 * generates one with `openssl` into a temp dir under scripts/
 * (.tmp-winrm-basic-proof/, removed on exit). If openssl is absent,
 * cases 3-4 are reported 'skipped' (not failed) and the HTTP cases
 * still prove the Basic branch itself.
 *
 * Usage: node scripts/winrm-basic-proof.js
 * Test credentials are runtime-generated, never persisted or printed.
 * Results: scripts/winrm-basic-proof-results.json
 * Exit 0 = every case passed (or skipped for a stated reason); exit 1 = any failure.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const https = require('node:https');
const { execFileSync, execSync } = require('node:child_process');

const winrm = require('../server/services/winrm');

const WORKDIR = path.join(__dirname, '.tmp-winrm-basic-proof');
const RESULTS_FILE = path.join(__dirname, 'winrm-basic-proof-results.json');
const USER = 'proofuser';
const PASS = `P4m-Basic-${crypto.randomBytes(12).toString('hex')}-X1`;
const QUERY = 'SELECT Caption FROM Win32_OperatingSystem';

const results = { startedAt: new Date().toISOString(), cases: [], finishedAt: null };
let failures = 0;

function record(id, title, outcome, detail) {
  results.cases.push({ id, title, outcome, detail });
  if (outcome === 'fail') failures += 1;
  console.log(`[${outcome.toUpperCase()}] ${id} ${title} — ${detail}`);
}

const ENUMERATE_RESPONSE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" ' +
  'xmlns:wsen="http://schemas.xmlsoap.org/ws/2004/09/enumeration" ' +
  'xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wmi/root/cimv2">' +
  '<s:Body><wsen:EnumerateResponse>' +
  '<wsen:EnumerationContext>PROOF-CTX-1</wsen:EnumerationContext>' +
  '<wsen:Items><wsen:Item><p:Win32_OperatingSystem>' +
  '<p:Caption>ProofOS</p:Caption><p:Name>PROOF-PC</p:Name>' +
  '</p:Win32_OperatingSystem></wsen:Item></wsen:Items>' +
  '</wsen:EnumerateResponse></s:Body></s:Envelope>';

const PULL_RESPONSE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" ' +
  'xmlns:wsen="http://schemas.xmlsoap.org/ws/2004/09/enumeration">' +
  '<s:Body><wsen:PullResponse><wsen:EndOfSequence/>' +
  '<wsen:Items/></wsen:PullResponse></s:Body></s:Envelope>';

// A Basic-only WinRM listener: 401 + WWW-Authenticate: Basic until the
// right Basic credentials arrive, then the canned EnumerateResponse.
// `seenBasic` records whether ANY Basic Authorization header arrived
// (in memory only — the value is never stored or printed).
function createBasicListener({ useHttps, cert, key }) {
  const state = { requests: 0, seenBasic: false, seenAuthValue: false };
  const handler = (req, res) => {
    state.requests += 1;
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const soapBody = Buffer.concat(chunks).toString('utf8');
      const auth = req.headers.authorization || '';
      if (/^Basic\s+/i.test(auth)) {
        state.seenBasic = true;
        const decoded = Buffer.from(auth.replace(/^Basic\s+/i, ''), 'base64').toString('utf8');
        if (decoded === `${USER}:${PASS}`) {
          res.writeHead(200, { 'Content-Type': 'application/soap+xml;charset=UTF-8' });
          // Enumerate returns the instance + a context; the follow-up
          // Pull ends the sequence (same shape as the winrm-service
          // selftest mock).
          res.end(soapBody.includes('Pull') ? PULL_RESPONSE : ENUMERATE_RESPONSE);
          return;
        }
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="WinRM"' });
        res.end();
        return;
      }
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="WinRM"' });
      res.end();
    });
  };
  const server = useHttps
    ? https.createServer({ cert, key }, handler)
    : http.createServer(handler);
  return { server, state };
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

async function main() {
  console.log('=== WinRM Basic-over-HTTPS fallback proof (Phase 4 merge) ===');

  // Case 5 first (no listener needed for the shape, but reuse the HTTP one):
  // server offering neither NTLM nor Basic.
  const bare = http.createServer((_req, res) => {
    res.writeHead(401, { 'WWW-Authenticate': 'Negotiate' });
    res.end();
  });
  const barePort = await listen(bare);
  try {
    await winrm.runWql('127.0.0.1', { username: USER, password: PASS, query: QUERY, port: barePort, timeoutMs: 5000 });
    record('5', 'neither NTLM nor Basic offered -> AUTH_FAILED', 'fail', 'runWql unexpectedly succeeded.');
  } catch (err) {
    record('5', 'neither NTLM nor Basic offered -> AUTH_FAILED', err.code === 'AUTH_FAILED' ? 'pass' : 'fail',
      `runWql threw ${err.code}: ${(err.message || '').slice(0, 120)}.`);
  }
  await close(bare);

  // Cases 1-2: HTTP Basic-only listener.
  const { server: httpServer, state: httpState } = createBasicListener({ useHttps: false });
  const httpPort = await listen(httpServer);
  try {
    const r1 = await winrm.runWql('127.0.0.1', {
      username: USER, password: PASS, query: QUERY, port: httpPort,
      allowUnencrypted: true, timeoutMs: 5000,
    });
    const row = r1.results && r1.results[0];
    record('1', 'HTTP + allowUnencrypted + correct creds -> success', r1.count === 1 && row && row.__class === 'Win32_OperatingSystem' && row.Caption === 'ProofOS' ? 'pass' : 'fail',
      `count=${r1.count}, row=${JSON.stringify(row)}.`);
  } catch (err) {
    record('1', 'HTTP + allowUnencrypted + correct creds -> success', 'fail', `runWql threw ${err.code}: ${(err.message || '').slice(0, 120)}.`);
  }

  // Case 2: fresh listener state — Basic over HTTP WITHOUT the opt-in must
  // be refused BEFORE any Basic header is sent.
  const { server: httpServer2, state: httpState2 } = createBasicListener({ useHttps: false });
  const httpPort2 = await listen(httpServer2);
  try {
    await winrm.runWql('127.0.0.1', {
      username: USER, password: PASS, query: QUERY, port: httpPort2, timeoutMs: 5000,
    });
    record('2', 'HTTP Basic without allowUnencrypted -> refused, nothing sent', 'fail', 'runWql unexpectedly succeeded.');
  } catch (err) {
    record('2', 'HTTP Basic without allowUnencrypted -> refused, nothing sent',
      err.code === 'AUTH_FAILED' && !httpState2.seenBasic ? 'pass' : 'fail',
      `runWql threw ${err.code}; listener saw a Basic Authorization header: ${httpState2.seenBasic} (must be false).`);
  }
  await close(httpServer2);
  await close(httpServer);
  void httpState;

  // Cases 3-4: HTTPS Basic-only listener (self-signed cert via openssl).
  let opensslOk = false;
  try { execSync('openssl version', { stdio: 'ignore' }); opensslOk = true; } catch { opensslOk = false; }
  if (!opensslOk) {
    record('3', 'HTTPS + useHttps + correct creds -> success', 'skipped', 'openssl not available, no self-signed cert can be generated in this environment.');
    record('4', 'HTTPS + wrong password -> AUTH_FAILED', 'skipped', 'openssl not available (see case 3).');
  } else {
    fs.mkdirSync(WORKDIR, { recursive: true });
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048',
      '-keyout', path.join(WORKDIR, 'key.pem'), '-out', path.join(WORKDIR, 'cert.pem'),
      '-days', '1', '-nodes', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'],
      { stdio: 'ignore' });
    const cert = fs.readFileSync(path.join(WORKDIR, 'cert.pem'));
    const key = fs.readFileSync(path.join(WORKDIR, 'key.pem'));
    const { server: httpsServer } = createBasicListener({ useHttps: true, cert, key });
    const httpsPort = await listen(httpsServer);
    try {
      const r3 = await winrm.runWql('127.0.0.1', {
        username: USER, password: PASS, query: QUERY, port: httpsPort,
        useHttps: true, rejectUnauthorized: false, timeoutMs: 5000,
      });
      const row3 = r3.results && r3.results[0];
      record('3', 'HTTPS + useHttps + correct creds -> success', r3.count === 1 && row3 && row3.Caption === 'ProofOS' ? 'pass' : 'fail',
        `count=${r3.count}, row=${JSON.stringify(row3)} (transport derived from useHttps, default port overridden by explicit port).`);
    } catch (err) {
      record('3', 'HTTPS + useHttps + correct creds -> success', 'fail', `runWql threw ${err.code}: ${(err.message || '').slice(0, 160)}.`);
    }
    try {
      await winrm.runWql('127.0.0.1', {
        username: USER, password: 'wrong-password', query: QUERY, port: httpsPort,
        useHttps: true, rejectUnauthorized: false, timeoutMs: 5000,
      });
      record('4', 'HTTPS + wrong password -> AUTH_FAILED', 'fail', 'runWql unexpectedly succeeded.');
    } catch (err) {
      record('4', 'HTTPS + wrong password -> AUTH_FAILED', err.code === 'AUTH_FAILED' ? 'pass' : 'fail',
        `runWql threw ${err.code}: ${(err.message || '').slice(0, 120)}.`);
    }
    await close(httpsServer);
  }

  results.finishedAt = new Date().toISOString();
  results.summary = {
    pass: results.cases.filter((c) => c.outcome === 'pass').length,
    fail: failures,
    skipped: results.cases.filter((c) => c.outcome === 'skipped').length,
  };
  console.log(`\n=== summary: ${results.summary.pass} pass, ${results.summary.fail} fail, ${results.summary.skipped} skipped ===`);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`[info] results JSON: ${RESULTS_FILE}`);
  // Clean up the generated self-signed cert/key BEFORE exiting:
  // process.exit() below would skip any .finally() attached outside.
  try { fs.rmSync(WORKDIR, { recursive: true, force: true }); } catch { /* best effort */ }
  process.exit(failures > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    try { fs.rmSync(WORKDIR, { recursive: true, force: true }); } catch { /* best effort */ }
    console.error(`[fatal] ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}
