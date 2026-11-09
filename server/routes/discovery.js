'use strict';
/**
 * discovery.js — REAL network discovery (real-data branch).
 *
 * Replaces the old simulation (audit D1–D7, discovery-probes-agents.md):
 *  - D1/D2: POST /api/discovery/run now ICMP-sweeps the requested range
 *    (ping.pingMs per address) and, for each host that answers, performs a
 *    real SNMP GET of sysDescr/sysObjectID (snmp.getSystemInfo) with the
 *    supplied community. Only hosts that actually answer are returned or
 *    created as devices. No sample catalog, no random selection.
 *    ICMP and SNMP are INDEPENDENT evidence: when ping fails or is
 *    unavailable (ICMP-less / sandboxed environment), the SNMP identity
 *    check is still attempted, and a host that answers SNMP is
 *    discovered with response_ms null (no ICMP measurement was made —
 *    never a fabricated number). discoverHost returns null only when
 *    BOTH probes fail, and logs which step failed so a run's history
 *    shows the real reason instead of a silent found_count 0.
 *  - D3: discovered devices are created with cpu_pct / mem_used_pct null
 *    until a real poll measures them. response_ms is the measured ICMP
 *    round-trip time; uptime_ticks is the real sysUpTime when SNMP
 *    answered. No invented serial, no fake backup status.
 *  - D4: the supplied SNMP version/community are actually used. The
 *    credential profile chosen in the form is resolved server-side
 *    (devices.resolveCredentialProfile — audit A1 X-01, phase 5 W2-2):
 *    a v2c profile supplies its community, a v3 profile its USM user,
 *    and the sweep speaks that version (v2c via getSystemInfo, v3 via
 *    getSystemInfoV3). The version spelling itself goes through the
 *    canonical map (snmp.normalizeSnmpVersion) — there is no second
 *    normalizer in this file. An unknown profile, a non-SNMP profile,
 *    or an unsupported version (incl. v1) is a 400, never a silent
 *    fall-back to v2c. Discovered devices store the resolved version
 *    (and v3 user), never a hard-coded 'v2c'.
 *  - D5: rules are persisted in store.discovery_rules via
 *    createDiscoveryRule/listDiscoveryRules/deleteDiscoveryRule. A rule
 *    stores only what the user submitted — no invented subnet, probe,
 *    schedule, or credential defaults. (No scheduler executes rules yet;
 *    that is out of scope for this route.)
 *  - D6: history comes from store.discovery_runs (listDiscoveryRuns) —
 *    persisted across restarts, no 20-entry session cap.
 *  - D7: profiles returns the real stored rules only; there is no
 *    separate profiles table, so it mirrors the rules list.
 *
 * Discovery runs asynchronously: POST /api/discovery/run validates the
 * range, returns 202 with a run id + status immediately, and persists
 * the completed run (status 'completed' / 'failed') when the sweep
 * finishes. The returned run id is a client correlation id
 * ('DISC-<epoch-ms>'); the persisted discovery_runs row gets its own
 * integer id (there is no run-id column in the store).
 *
 * Response-shape changes vs the old simulation (kept paths unchanged):
 *  - POST /api/discovery/run: 202 { status, runId, runStatus: 'running',
 *    ipRange, startedAt } — it no longer returns discoveredDevices
 *    synchronously. Discovered devices land in the device inventory;
 *    the finished run (range + found_count) lands in
 *    GET /api/discovery/history.
 *  - GET /api/discovery/history: rows are the store columns
 *    { id, range, found_count, started_at, finished_at, status } —
 *    no embedded per-run devices array (the store has no run-device
 *    link table).
 *  - GET /api/discovery/profiles: returns the stored discovery rules
 *    (same rows as /api/discovery/rules), [] when none exist.
 *  - POST /api/discovery/rules: stores only { range, probe_id,
 *    schedule }; name/credential have no store columns and are not kept.
 *  - DELETE /api/discovery/rules/:id is new (uses deleteDiscoveryRule).
 */

const express = require('express');
const router = express.Router();
const store = require('../services/store');
const snmp = require('../services/snmp');
const ping = require('../services/ping');
// Credential-profile resolution is owned by the device write paths
// (server/routes/devices.js resolveCredentialProfile); the sweep uses
// the same function so a profile means the same thing on both paths.
const { resolveCredentialProfile } = require('./devices');

// A sweep is bounded so one request cannot scan the whole internet.
const MAX_SWEEP_HOSTS = 256;
const SWEEP_CONCURRENCY = 16;

// --- Vendor classification ----------------------------------------------
// sysObjectID lives under 1.3.6.1.4.1.<enterprise> (SNMPv2-MIB §1 of the
// OID reference). The enterprise number identifies the vendor; the
// category is classified from the real sysDescr keywords below, and
// falls back to 'unknown' when neither the OID nor the description
// says what the box is.
const ENTERPRISE_VENDOR = {
  9: 'Cisco Systems',
  11: 'Hewlett Packard Enterprise',
  263: 'Juniper Networks',
  311: 'Microsoft',
  674: 'Dell',
  2011: 'Huawei',
  4526: 'Netgear',
  6876: 'VMware',
  12356: 'Fortinet',
  14823: 'Aruba Networks',
  14988: 'MikroTik',
  25461: 'Palo Alto Networks',
  29671: 'Cisco Meraki',
  30065: 'Arista Networks',
  41112: 'Ubiquiti',
};

/**
 * classify(sysObjectID, sysDescr) → { vendor, category }.
 * vendor is the enterprise owner from the sysObjectID, or null when the
 * enterprise is unmapped (e.g. 8072 net-snmp — a generic host agent,
 * not a hardware vendor). category is 'Switch' | 'Router' | 'Firewall' |
 * 'Wireless' | 'Server' | 'unknown', from the real sysDescr text.
 */
function classify(sysObjectID, sysDescr) {
  let vendor = null;
  const m = String(sysObjectID || '').match(/^\.?1\.3\.6\.1\.4\.1\.(\d+)/);
  if (m) vendor = ENTERPRISE_VENDOR[m[1]] || null;

  const d = String(sysDescr || '').toLowerCase();
  let category = 'unknown';
  if (/firewall|fortigate|\bsrx\d*\b|palo alto|\basa[ -]?55\d\d\b|pix firewall/.test(d)) {
    category = 'Firewall';
  } else if (/wireless|access point|\bap-\d|\bap\d{3,}\b|wifi|802\.11/.test(d)) {
    category = 'Wireless';
  } else if (/switch|catalyst|nexus|\bws-c\d|\bc29\d\d|\bc38\d\d|\bc93\d\d|\bex\d{4}\b|\bqfx\d/.test(d)) {
    category = 'Switch';
  } else if (/router|\bisr\b|\basr\b|\bmx\d+\b|junos os/.test(d)) {
    category = 'Router';
  } else if (/server|poweredge|proliant|esxi|vmware|linux|windows|ubuntu|debian|centos/.test(d)) {
    category = 'Server';
  } else if (vendor === 'Fortinet' || vendor === 'Palo Alto Networks') {
    // Vendor alone proves the class even when the description is terse.
    category = 'Firewall';
  }
  return { vendor, category };
}

// --- IP range parsing -----------------------------------------------------

function parseIp(s) {
  const parts = String(s == null ? '' : s).trim().split('.');
  if (parts.length !== 4) return null;
  const nums = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    nums.push(n);
  }
  return (nums[0] * 16777216 + nums[1] * 65536 + nums[2] * 256 + nums[3]) >>> 0;
}

function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/**
 * parseRange(body) → { ips, rangeLabel }.
 * Accepts startIp+endIp, ipRange ("a - b", "a-b", a single IP, or a
 * CIDR "a.b.c.d/n"), or range/subnet in the same forms. Throws an Error
 * with a plain message when nothing usable was supplied or the range
 * is too large. No default range is ever invented.
 */
function parseRange(body) {
  const b = body || {};
  const startRaw = b.startIp;
  const endRaw = b.endIp;
  const rangeRaw = b.ipRange || b.range || b.subnet;

  let start = null;
  let end = null;
  let label = null;

  if (startRaw !== undefined && startRaw !== null && String(startRaw).trim() !== '') {
    start = parseIp(startRaw);
    end = endRaw !== undefined && endRaw !== null && String(endRaw).trim() !== ''
      ? parseIp(endRaw)
      : start;
    if (start === null || end === null) {
      throw new Error('startIp/endIp must be valid IPv4 addresses');
    }
  } else if (rangeRaw !== undefined && rangeRaw !== null && String(rangeRaw).trim() !== '') {
    const text = String(rangeRaw).trim();
    const cidr = text.match(/^(\d+\.\d+\.\d+\.\d+)\s*\/\s*(\d{1,2})$/);
    if (cidr) {
      const base = parseIp(cidr[1]);
      const prefix = Number(cidr[2]);
      if (base === null || prefix < 0 || prefix > 32) {
        throw new Error('ipRange must be a valid CIDR such as 192.168.1.0/24');
      }
      const hostBits = 32 - prefix;
      const count = 2 ** hostBits;
      const mask = hostBits === 32 ? 0 : ((0xffffffff << hostBits) >>> 0);
      const network = (base & mask) >>> 0;
      // Skip network/broadcast addresses on subnets that have them.
      start = prefix <= 30 ? network + 1 : network;
      end = prefix <= 30 ? network + count - 2 : network + count - 1;
      label = text;
    } else if (text.includes('-')) {
      const [a, c] = text.split('-').map((s) => s.trim());
      start = parseIp(a);
      end = parseIp(c);
      if (start === null || end === null) {
        throw new Error('ipRange must be "startIp - endIp", a single IP, or a CIDR');
      }
    } else {
      start = parseIp(text);
      end = start;
      if (start === null) {
        throw new Error('ipRange must be "startIp - endIp", a single IP, or a CIDR');
      }
    }
  }

  if (start === null || end === null) {
    throw new Error('No IP range supplied: send startIp + endIp, or ipRange');
  }
  if (end < start) {
    throw new Error('endIp must not be lower than startIp');
  }
  const count = end - start + 1;
  if (count > MAX_SWEEP_HOSTS) {
    throw new Error(
      `Range covers ${count} addresses; narrow it to ${MAX_SWEEP_HOSTS} or fewer per run`
    );
  }
  const ips = [];
  for (let n = start; n <= end; n++) ips.push(intToIp(n));
  return { ips, rangeLabel: label || `${intToIp(start)} - ${intToIp(end)}` };
}

// --- Request helpers ------------------------------------------------------

function resolveProbeId(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  try {
    return store.getProbe(n) ? n : null;
  } catch (e) {
    return null;
  }
}

function defaultCommunity() {
  try {
    return store.getSetting('discovery.defaultCommunity') || null;
  } catch (e) {
    return null;
  }
}

// Version spellings go through the canonical map in the snmp service
// (snmp.normalizeSnmpVersion, audit A3 G-01) at the call site — there is
// no local normalizer in this file, so the sweep, the poller and the
// device write paths can never disagree about what '2c' means again.

// --- Discovery profiles / rules / history ---------------------------------

// Real stored rules only — there is no separate profiles table, so the
// profiles endpoint mirrors the persisted discovery rules.
router.get('/api/discovery/profiles', (req, res) => {
  res.json({
    status: 'success',
    profiles: store.listDiscoveryRules()
  });
});

router.get('/api/discovery/rules', (req, res) => {
  res.json({ status: 'success', rules: store.listDiscoveryRules() });
});

router.post('/api/discovery/rules', (req, res) => {
  const b = req.body || {};
  // A rule stores only what the user submitted. probe_id must be an
  // existing probe (or null) — the store enforces the foreign key.
  const probeId = resolveProbeId(b.probeId !== undefined ? b.probeId : b.probe);
  const rule = store.createDiscoveryRule({
    range: b.range || b.subnet || b.ipRange || null,
    probe_id: probeId,
    schedule: b.schedule || null
  });
  res.status(201).json({
    status: 'success',
    message: 'Discovery rule added.',
    rule
  });
});

router.delete('/api/discovery/rules/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: 'error', message: 'Rule id must be a positive integer' });
  }
  const result = store.deleteDiscoveryRule(id);
  if (!result || result.deleted === 0) {
    return res.status(404).json({ status: 'error', message: `Discovery rule ${id} not found` });
  }
  res.json({ status: 'success', message: `Discovery rule ${id} deleted.` });
});

router.get('/api/discovery/history', (req, res) => {
  res.json({
    status: 'success',
    history: store.listDiscoveryRuns()
  });
});

// --- Real discovery sweep -------------------------------------------------

/**
 * discoverHost(ip, opts) → stored device row, or null when the host
 * answered NEITHER the ICMP probe NOR the SNMP identity check.
 * ICMP and SNMP are independent evidence, not a chain:
 *  - ping answers, SNMP fails → host is real, SNMP data is not;
 *    discovered (category 'unknown', sysDescr null) with the measured
 *    response_ms.
 *  - ping fails/unavailable (ICMP blocked, sandbox without raw
 *    sockets), SNMP answers → host is real; discovered with
 *    response_ms null — no ICMP measurement was made, never a guess.
 *  - BOTH fail → null. The failure is logged with the step that
 *    failed (ping unavailable vs SNMP failed) so the run's history
 *    shows the real reason; a null is never silently "host down"
 *    on ICMP alone, because ICMP failure alone proves nothing about
 *    the host.
 */
async function discoverHost(ip, opts) {
  const rtt = await ping.pingMs(ip);
  if (rtt === null) {
    // ICMP gave no measurement — the host may still be up and SNMP-
    // reachable (ICMP-less environment), so SNMP is still attempted.
    console.warn(`[Discovery] ${ip}: ICMP ping failed/unavailable — attempting SNMP anyway`);
  }

  let info = null;
  let snmpError = null;
  try {
    // The sweep speaks the resolved version: v2c via the community GET,
    // v3 via the USM GET with the resolved v3 user (see POST
    // /api/discovery/run). A v3 profile from the credential library
    // carries the user only (no auth/priv protocols are stored there),
    // so it attempts noAuthNoPriv — a device that needs auth answers
    // nothing, and the host is honestly undiscovered, never faked.
    info = opts.version === 'v3'
      ? await snmp.getSystemInfoV3(ip, opts.v3)
      : await snmp.getSystemInfo(ip, opts.community);
  } catch (e) {
    // SNMP down / wrong community / SNMP disabled / host unreachable.
    // Record the error, never a guess.
    snmpError = e;
    info = null;
  }

  if (rtt === null && info === null) {
    // Neither probe answered: host down, unreachable, or both protocols
    // blocked from here. Both failures are on the record, so the run's
    // history says why — not just a silent found_count 0.
    console.warn(
      `[Discovery] ${ip}: not discovered — ICMP ping failed and SNMP failed` +
        (snmpError ? ` (${snmpError.message || snmpError})` : '')
    );
    return null;
  }

  if (info === null) {
    console.warn(
      `[Discovery] ${ip}: ICMP answered (${rtt} ms) but SNMP failed` +
        (snmpError ? ` (${snmpError.message || snmpError})` : '') +
        ' — discovered without SNMP data'
    );
  } else if (rtt === null) {
    console.log(`[Discovery] ${ip}: discovered via SNMP (ICMP ping unavailable)`);
  }

  const sysDescr = info ? info.sysDescr : null;
  const sysObjectID = info ? info.sysObjectID : null;
  const sysName = info ? info.sysName : null;
  const sysUpTime = info ? info.sysUpTime : null;
  const { vendor, category } = classify(sysObjectID, sysDescr);

  const existing = store.getDeviceByIp(ip);
  if (existing) return existing;

  return store.createDevice({
    ip,
    hostname: sysName,
    sys_name: sysName,
    sys_descr: sysDescr,
    sys_object_id: sysObjectID,
    vendor,
    model: null,
    category,
    // The community / v3 user is stored only once it has proven to work
    // (SNMP answered with it); a failed credential is not recorded as
    // the device's credential. The stored version is the resolved sweep
    // version — never a hard-coded 'v2c' (audit A1 X-01).
    snmp_community: info && opts.version !== 'v3' ? opts.community : null,
    snmp_version: opts.version || 'v2c',
    snmp_v3_user: info && opts.version === 'v3' && opts.v3 && opts.v3.user ? opts.v3.user : null,
    probe_id: opts.probeId,
    managed: 1,
    status: null,
    cpu_pct: null,
    mem_used_pct: null,
    uptime_ticks: sysUpTime,
    // Measured ICMP round-trip time, or null when ICMP did not answer
    // (host discovered via SNMP) — never a fabricated number.
    response_ms: rtt,
    last_polled_at: null
  });
}

/** Bounded-concurrency map: no more than `size` hosts probed at once. */
async function mapPool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(size, items.length) },
    async () => {
      while (next < items.length) {
        const i = next;
        next += 1;
        try {
          results[i] = await fn(items[i]);
        } catch (e) {
          results[i] = null;
        }
      }
    }
  );
  await Promise.all(workers);
  return results;
}

async function runSweep({ rangeLabel, ips, community, probeId, version, v3 }) {
  const startedAt = Date.now();
  let found = [];
  try {
    const results = await mapPool(ips, SWEEP_CONCURRENCY, (ip) =>
      discoverHost(ip, { community, probeId, version, v3 })
    );
    found = results.filter((d) => d !== null);
    console.log(
      `[Discovery] sweep ${rangeLabel}: ${found.length} of ${ips.length} host(s) discovered`
    );
    store.saveDiscoveryRun({
      range: rangeLabel,
      found_count: found.length,
      started_at: startedAt,
      finished_at: Date.now(),
      status: 'completed'
    });
  } catch (e) {
    console.error(
      `[Discovery] sweep ${rangeLabel} failed: ${e && e.message ? e.message : e}`
    );
    try {
      store.saveDiscoveryRun({
        range: rangeLabel,
        found_count: found.length,
        started_at: startedAt,
        finished_at: Date.now(),
        status: 'failed'
      });
    } catch (ignored) {
      // Persisting the failure must never crash the sweep.
    }
  }
  return found;
}

// Run network discovery (async — see header). Returns a run id + status
// immediately; the finished run is persisted to discovery_runs.
//
// Credential / version resolution (audit A1 X-01, phase 5 W2-2) — the
// form sends the selected credential profile as `credentialId`
// (`credential` / `credentialProfileId` also accepted). The profile is
// resolved server-side via devices.resolveCredentialProfile: a v2c
// profile supplies its community, a v3 profile its USM user, and the
// sweep speaks that version. An explicit `snmpVersion` (canonical map —
// '2c'/'2' → 'v2c', '3' → 'v3') wins over the profile's version; when
// neither is given the version defaults to 'v2c' (missing version only —
// a present-but-unknown version is never defaulted). Older clients sent
// the credential id AS `snmpVersion`; that is still accepted as a legacy
// alias when the value is not a version spelling — but a value that
// LOOKS like a version ('v1', 'v9', 'snmpv9') is a version error, not a
// profile lookup, and a numeric id in `snmpVersion` is a version
// spelling first ('3' → 'v3'): numeric profile ids belong in
// `credentialId`. Unknown profiles, non-SNMP profiles (WMI/SSH/Telnet —
// the sweep is SNMP-only) and unsupported versions (incl. v1) are 400s
// with the offending value named; nothing is silently coerced.
router.post('/api/discovery/run', (req, res) => {
  const b = req.body || {};
  let range;
  try {
    range = parseRange(b);
  } catch (e) {
    return res.status(400).json({ status: 'error', message: e.message });
  }

  const rawVersion = b.snmpVersion !== undefined ? b.snmpVersion : b.version;
  const rawVersionText = rawVersion !== undefined && rawVersion !== null
    ? String(rawVersion).trim() : '';
  const explicitVersion = rawVersionText !== ''
    ? snmp.normalizeSnmpVersion(rawVersion) : null;
  if (rawVersionText !== '' && explicitVersion === null
    && /^(v|snmp)?\d+[a-z]*$/i.test(rawVersionText)) {
    // Looks like a version spelling, but not a supported one.
    return res.status(400).json({
      status: 'error',
      message: `SNMP version ${rawVersion} is not supported; supported versions are 'v2c' and 'v3' (SNMPv1 is not supported)`
    });
  }

  const credentialRef = b.credentialId !== undefined ? b.credentialId
    : b.credential !== undefined ? b.credential
    : b.credentialProfileId !== undefined ? b.credentialProfileId
    : (rawVersionText !== '' && explicitVersion === null ? rawVersion : undefined);
  const profile = resolveCredentialProfile(credentialRef);
  if (profile.error) {
    return res.status(400).json({ status: 'error', message: profile.error });
  }
  if (profile.nonSnmp) {
    return res.status(400).json({
      status: 'error',
      message: `Credential profile '${credentialRef}' is a ${profile.nonSnmpType || 'non-SNMP'} credential, not an SNMP credential; discovery sweeps use SNMP only`
    });
  }

  // Version: explicit request value > profile version > default v2c.
  const version = explicitVersion || profile.version || 'v2c';
  // Community: explicit request value > profile community > stored
  // default setting > 'public' (pre-existing fallback chain).
  const community = b.community || b.snmpCommunity || profile.community || defaultCommunity() || 'public';
  // v3 USM credentials: explicit `snmp.v3` / `v3` object on the request
  // wins; otherwise the profile's v3 user (user-only — see
  // resolveCredentialProfile for why no passphrase is copied).
  let v3 = null;
  if (version === 'v3') {
    const bodyV3 = (b.snmp && typeof b.snmp === 'object' && b.snmp.v3) || b.v3 || null;
    v3 = (bodyV3 && typeof bodyV3 === 'object') ? bodyV3 : profile.v3;
    if (!v3 || !v3.user) {
      return res.status(400).json({
        status: 'error',
        message: 'SNMPv3 discovery needs a v3 user: pick an SNMPv3 credential profile or supply snmp.v3.user'
      });
    }
  }

  const probeId = resolveProbeId(b.probeId);
  const runId = `DISC-${Date.now()}`;
  const startedAt = Date.now();

  // Fire and forget: the sweep persists its run when it finishes.
  runSweep({
    rangeLabel: range.rangeLabel,
    ips: range.ips,
    community,
    probeId,
    version,
    v3
  }).catch(() => {});

  res.status(202).json({
    status: 'success',
    message: `Discovery sweep started for ${range.rangeLabel}`,
    runId,
    runStatus: 'running',
    ipRange: range.rangeLabel,
    probeId,
    snmpVersion: version,
    credentialProfile: profile.profile ? (profile.profile.name || profile.profile.id) : null,
    startedAt
  });
});

module.exports = router;
