// Real network probing: ICMP/TCP reachability, SNMP MIB queries, and subnet scanning.
// Replaces the previous Math.random()-based simulation in poller.js / discovery.js.
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const net = require('node:net');
const fs = require('node:fs');
const snmp = require('net-snmp');

const run = promisify(execFile);

function resolveBinary(candidates) {
  for (const bin of candidates) {
    try {
      if (fs.existsSync(bin)) return bin;
    } catch (e) {}
  }
  return candidates[candidates.length - 1];
}

const PING_BIN = process.platform === 'darwin'
  ? resolveBinary(['/sbin/ping', '/usr/bin/ping', 'ping'])
  : resolveBinary(['/bin/ping', '/usr/bin/ping', 'ping']);

const PING_ARGS = process.platform === 'darwin'
  ? (ip) => ['-c', '1', '-t', '1', ip]
  : (ip) => ['-c', '1', '-W', '1', ip];

// Real ICMP ping via system binary (no raw-socket privilege required).
async function icmpPing(ip) {
  try {
    const { stdout } = await run(PING_BIN, PING_ARGS(ip), { timeout: 2000 });
    const match = stdout.match(/time[=<]([\d.]+)/i);
    if (match) {
      return { reachable: true, rttMs: Number(Number(match[1]).toFixed(2)), method: 'icmp' };
    }
    return { reachable: false, rttMs: null, method: 'icmp' };
  } catch (e) {
    return { reachable: false, rttMs: null, method: 'icmp', error: e.message };
  }
}

// TCP-connect fallback for environments where ICMP is blocked/unprivileged.
function tcpPing(ip, port = 80, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    const finish = (reachable) => {
      const rtt = Number(process.hrtime.bigint() - start) / 1e6;
      socket.destroy();
      resolve({ reachable, rttMs: reachable ? Number(rtt.toFixed(2)) : null, method: 'tcp' });
    };
    socket.on('connect', () => finish(true));
    socket.on('timeout', () => finish(false));
    socket.on('error', (err) => finish(err.code === 'ECONNREFUSED'));
    socket.connect(port, ip);
  });
}

const COMMON_PORTS = [22, 80, 443, 3389, 161, 8080];

// Reachability check: real ICMP first, then TCP connect across common ports.
async function checkReachable(ip) {
  const icmp = await icmpPing(ip);
  if (icmp.reachable) return icmp;
  for (const port of COMMON_PORTS) {
    const tcp = await tcpPing(ip, port, 800);
    if (tcp.reachable) return { ...tcp, port };
  }
  return { reachable: false, rttMs: null, method: 'none' };
}

const OIDS = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysName: '1.3.6.1.2.1.1.5.0',
  sysUpTime: '1.3.6.1.2.1.1.3.0'
};

function snmpSession(ip, community = 'public', version = 'v2c', timeout = 1500) {
  return snmp.createSession(ip, community, {
    port: 161,
    retries: 0,
    timeout,
    version: version === 'v1' ? snmp.Version1 : snmp.Version2c
  });
}

// Real SNMP GET for a fixed set of scalar OIDs. Returns null fields for anything
// the agent doesn't expose instead of fabricating values.
function snmpGetScalars(ip, community, oids, version) {
  return new Promise((resolve) => {
    const session = snmpSession(ip, community, version);
    const names = Object.keys(oids);
    const values = Object.values(oids);
    const done = (result) => {
      try { session.close(); } catch (e) {}
      resolve(result);
    };
    const timer = setTimeout(() => done(null), 2000);
    session.get(values, (error, varbinds) => {
      clearTimeout(timer);
      if (error) return done(null);
      const out = {};
      names.forEach((name, i) => {
        const vb = varbinds[i];
        out[name] = vb && !snmp.isVarbindError(vb) ? vb.value.toString() : null;
      });
      done(out);
    });
  });
}

// hrProcessorLoad table average -> approximate CPU utilization.
function snmpTableAverage(ip, community, baseOid, version) {
  return new Promise((resolve) => {
    const session = snmpSession(ip, community, version);
    const values = [];
    const timer = setTimeout(() => { try { session.close(); } catch (e) {} resolve(null); }, 2500);
    session.subtree(baseOid, (varbinds) => {
      varbinds.forEach(vb => {
        if (vb && !snmp.isVarbindError(vb) && typeof vb.value !== 'undefined') {
          const n = Number(vb.value);
          if (!Number.isNaN(n)) values.push(n);
        }
      });
    }, (error) => {
      clearTimeout(timer);
      try { session.close(); } catch (e) {}
      if (error || values.length === 0) return resolve(null);
      resolve(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
    });
  });
}

const HR_PROCESSOR_LOAD = '1.3.6.1.2.1.25.3.3.1.2';
const HR_STORAGE_USED = '1.3.6.1.2.1.25.2.3.1.6';
const HR_STORAGE_SIZE = '1.3.6.1.2.1.25.2.3.1.5';

async function snmpProbe(ip, community, version) {
  const scalars = await snmpGetScalars(ip, community, OIDS, version);
  if (!scalars) return null;

  const cpu = await snmpTableAverage(ip, community, HR_PROCESSOR_LOAD, version);

  let memory = null;
  try {
    const used = [];
    const size = [];
    const session = snmpSession(ip, community, version);
    await new Promise((resolve) => {
      let pending = 2;
      const maybeDone = () => { if (--pending === 0) resolve(); };
      session.subtree(HR_STORAGE_USED, (vbs) => vbs.forEach(vb => vb && !snmp.isVarbindError(vb) && used.push(Number(vb.value))), () => maybeDone());
      session.subtree(HR_STORAGE_SIZE, (vbs) => vbs.forEach(vb => vb && !snmp.isVarbindError(vb) && size.push(Number(vb.value))), () => maybeDone());
      setTimeout(resolve, 2500);
    });
    try { session.close(); } catch (e) {}
    if (used.length && size.length && used.length === size.length) {
      const totalUsed = used.reduce((a, b) => a + b, 0);
      const totalSize = size.reduce((a, b) => a + b, 0);
      if (totalSize > 0) memory = Math.round((totalUsed / totalSize) * 100);
    }
  } catch (e) {}

  return {
    sysDescr: scalars.sysDescr,
    sysName: scalars.sysName,
    sysUpTime: scalars.sysUpTime,
    cpu,
    memory
  };
}

function classifyFromSysDescr(sysDescr = '') {
  const s = sysDescr.toLowerCase();
  if (s.includes('cisco ios') || s.includes('cisco nx-os')) return { vendor: 'Cisco Systems', category: 'Router', os: 'Cisco IOS' };
  if (s.includes('junos')) return { vendor: 'Juniper Networks', category: 'Router', os: 'Junos OS' };
  if (s.includes('fortios') || s.includes('fortigate')) return { vendor: 'Fortinet, Inc.', category: 'Firewall', os: 'FortiOS' };
  if (s.includes('linux')) return { vendor: 'Linux', category: 'Server', os: 'Linux' };
  if (s.includes('windows')) return { vendor: 'Microsoft', category: 'Server', os: 'Windows' };
  if (s.includes('vmware') || s.includes('esxi')) return { vendor: 'VMware', category: 'Virtualization', os: 'VMware ESXi' };
  return { vendor: 'Generic', category: 'Network Device', os: sysDescr || 'Unknown' };
}

function classifyFromPort(port) {
  if (port === 3389) return { vendor: 'Microsoft', category: 'Server', os: 'Windows (RDP detected)' };
  if (port === 22) return { vendor: 'Generic', category: 'Server', os: 'Linux/Unix (SSH detected)' };
  if (port === 161) return { vendor: 'Generic', category: 'Network Device', os: 'SNMP-capable host' };
  return { vendor: 'Generic', category: 'Unknown Host', os: 'Unidentified (TCP reachable)' };
}

// Parses "a.b.c.d/nn" or "a.b.c.1 - a.b.c.254" into a bounded list of IPv4 strings.
function expandRange(input, maxHosts = 256) {
  if (!input) return [];
  const cidrMatch = input.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (cidrMatch) {
    const [, base, prefixStr] = cidrMatch;
    const prefix = Number(prefixStr);
    const parts = base.split('.').map(Number);
    const ipInt = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    const hostBits = 32 - prefix;
    const count = Math.min(Math.pow(2, hostBits), maxHosts + 2);
    const network = ipInt & (~0 << hostBits);
    const ips = [];
    for (let i = 1; i < count - 1 && ips.length < maxHosts; i++) {
      const n = network + i;
      ips.push([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'));
    }
    return ips;
  }

  const rangeMatch = input.match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*-\s*(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (rangeMatch) {
    const toInt = (ip) => ip.split('.').reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
    const start = toInt(rangeMatch[1]);
    const end = toInt(rangeMatch[2]);
    const ips = [];
    for (let n = start; n <= end && ips.length < maxHosts; n++) {
      ips.push([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'));
    }
    return ips;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(input)) return [input];
  return [];
}

// Bounded-concurrency map so a /24 scan doesn't open 254 sockets at once.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(new Array(Math.min(limit, items.length)).fill(0).map(worker));
  return results;
}

module.exports = {
  icmpPing,
  tcpPing,
  checkReachable,
  snmpProbe,
  classifyFromSysDescr,
  classifyFromPort,
  expandRange,
  mapWithConcurrency,
  COMMON_PORTS
};
