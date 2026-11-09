'use strict';

/**
 * poller.js — Real-data poller for OpManager Central (real-data rebuild).
 *
 * Replaces the old random-walk poller entirely. Every value stored or
 * broadcast here was measured in this cycle:
 *   - ICMP echo latency via server/services/ping.js (system `ping` binary)
 *   - System identity / uptime via SNMP sysDescr/sysObjectID/sysUpTime/...
 *   - CPU % via CISCO-PROCESS-MIB cpmCPUTotal5minRev (fallback .5min)
 *   - Memory % via CISCO-MEMORY-POOL-MIB Processor pool Used/Free
 *   - Interface table via IF-MIB ifTable + ifXTable ifName
 *
 * Removed, with no replacement:
 *   - the 4 s Math.random random-walk cycle (CPU/memory/response-time drift)
 *   - random interface-traffic variance
 *   - the ~20 s fake ALARM_TOAST rebroadcast of a random old alarm
 *   - hardcoded `lastPolled: 'Just now'` — last_polled_at is now the real
 *     ISO timestamp of the poll attempt that produced the stored values.
 *
 * Device-state decision (per spec §7 — ping and SNMP are separate signals):
 *   - ping fails AND SNMP fails  → status 'Down', Critical alarm 'availability'
 *   - ping ok AND SNMP fails     → status 'SNMP Error', Critical alarm 'snmp'
 *   - SNMP answers              → status 'Up', thresholds evaluated on the
 *     measured values; a null ping in this state means "ICMP unavailable",
 *     NOT "host down" (ICMP is commonly blocked while SNMP answers).
 *   - No IP configured / store unavailable / poll timeout → status
 *     'Poll failed: <reason>', stored as-is, never papered over.
 *
 * Thresholds (measured values only):
 *   - cpu_pct > 90 → Critical alarm source 'cpu'; 80 < cpu_pct <= 90 →
 *     Trouble alarm source 'cpu'; cpu_pct <= 80 → resolve 'cpu'.
 *   - mem_used_pct > 90 → Critical alarm source 'mem'; <= 90 → resolve 'mem'.
 * Alarms are raised once per breach (tracked in-memory by device+source)
 * and resolved by key when the measurement recovers.
 *
 * Poll interval comes from store setting 'poll_interval_seconds'
 * (default 60 s). Devices are polled concurrently; one slow device never
 * blocks the rest. A cycle already in progress is skipped, never stacked.
 *
 * Defence in depth (this file): every device poll is wrapped so one bad
 * device can never take down the server process — pollOneDevice()
 * contains any unexpected throw and records it on that device, the
 * cycle wraps each device in its own .catch() and never rejects itself,
 * and pollDeviceNow() returns a recorded failure instead of throwing.
 * Honest limit: a throw inside a third-party UDP callback (net-snmp)
 * cannot be caught by any try/catch here; that class of throw is fixed
 * at source in server/services/snmp.js. Everything that CAN be
 * contained at this layer is contained here.
 *
 * Store contract (server/services/store.js — verified against the real
 * implementation, not just the brief):
 *   store.devices.listDevices() → raw DB rows (snake_case: ip, hostname,
 *     snmp_community, snmp_version, managed INTEGER 0/1, sys_name, ...)
 *   store.devices.updateDeviceMetrics(id, { cpu_pct, mem_used_pct,
 *     uptime_ticks, response_ms, status, last_polled_at }) — last_polled_at
 *     is epoch ms (store.now() === Date.now())
 *   store.devices.updateDevice(id, fields) — only whitelisted columns are
 *     written (sys_name, sys_descr, sys_object_id, ...); sysLocation /
 *     sysContact / lastPollError have no columns and are NOT persisted
 *   store.interfaces.replaceInterfaces(deviceId, rows) — rows are snake_case
 *     ({ if_index, name, descr, oper_status, in_octets, out_octets, speed })
 *   store.metrics.insertMetric(deviceId, { cpu_pct, mem_used_pct, response_ms })
 *   store.alarms.raiseAlarm({ deviceId, device_id, severity, message, source })
 *     — the store reads device_id; deviceId is also sent for the contract
 *   store.alarms.resolveAlarmByKey(deviceId, source)
 *   store.settings.getSetting(key) → raw stored value (string) or null
 * This module lazy-requires the store so it still loads before store.js
 * exists, and fails loudly with a clear error if a poll is attempted
 * while the store is absent.
 *
 * WebSocket broadcast: listeners registered via onUpdate(fn) (kept for
 * server/index.js) or passed to startPoller(fn) receive ONLY real polled
 * values, as { type: 'METRIC_TICK', timestamp, devices: [...] }. No alarm
 * toasts are invented here — a toast belongs to a genuinely new alarm
 * raised by a threshold breach, which the alarms path handles.
 */

const snmp = require('./snmp');
const ping = require('./ping');

const DEFAULT_POLL_INTERVAL_SECONDS = 60;
const MIN_POLL_INTERVAL_SECONDS = 10;
const MAX_POLL_INTERVAL_SECONDS = 3600;
const DEVICE_POLL_TIMEOUT_MS = 20000;
const CPU_CRITICAL = 90;
const CPU_TROUBLE = 80;
const MEM_CRITICAL = 90;

// ---------------------------------------------------------------------------
// Store access (lazy — store.js is built in parallel by another agent)
// ---------------------------------------------------------------------------

let storeModule = null;
let storeWarned = false;

function getStore() {
  if (storeModule) return storeModule;
  try {
    storeModule = require('./store');
    return storeModule;
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      if (!storeWarned) {
        storeWarned = true;
        console.error('[Poller] store unavailable: server/services/store.js is not installed yet — polls will fail until it exists.');
      }
      return null;
    }
    throw err;
  }
}

function requireStore() {
  const store = getStore();
  if (!store) {
    throw new Error('Poller store unavailable: server/services/store.js is not installed yet');
  }
  return store;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function deviceCommunity(device) {
  // Store rows are raw DB rows: snmp_community (snake_case). CamelCase
  // fallbacks are kept for any caller that builds device objects by hand.
  return device.snmp_community || device.snmpCommunity || device.community || 'public';
}

function devicePort(device) {
  // There is no snmp_port column in the store; SNMP is UDP/161 unless a
  // caller supplies snmpPort/snmp_port explicitly.
  const p = Number(device.snmpPort || device.snmp_port || 161);
  return Number.isInteger(p) && p >= 1 && p <= 65535 ? p : 161;
}

function deviceIp(device) {
  if (!device) return null;
  return device.ip || device.ipAddress || null;
}

function deviceDisplayName(device, ip) {
  if (!device) return ip || 'unknown device';
  // Store rows carry `hostname`, not `name`.
  return device.name || device.hostname || device.displayName || ip || String(device.id);
}

/** True when the store row marks the device unmanaged (managed INTEGER 0/1). */
function isUnmanaged(device) {
  return device.managed === 0 || device.managed === false || device.managed === '0'
    || device.isManaged === false;
}

function resolvePollIntervalSeconds(store) {
  try {
    let raw = null;
    if (store.settings && typeof store.settings.getSetting === 'function') {
      raw = store.settings.getSetting('poll_interval_seconds');
    }
    if (raw && typeof raw === 'object' && raw.value !== undefined) raw = raw.value;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= MIN_POLL_INTERVAL_SECONDS && seconds <= MAX_POLL_INTERVAL_SECONDS) {
      return Math.floor(seconds);
    }
  } catch (err) {
    console.error(`[Poller] could not read poll_interval_seconds, using default: ${err.message}`);
  }
  return DEFAULT_POLL_INTERVAL_SECONDS;
}

// ---------------------------------------------------------------------------
// Poller
// ---------------------------------------------------------------------------

class RealPoller {
  constructor() {
    this.timer = null;
    this.listeners = [];
    this.intervalMs = DEFAULT_POLL_INTERVAL_SECONDS * 1000;
    this.cycleRunning = false;
    // In-memory set of active threshold alarms, keyed `${deviceId}:${source}`,
    // so a continuing breach raises exactly one alarm instead of one per cycle.
    this.activeAlarms = new Set();
  }

  onUpdate(callback) {
    if (typeof callback === 'function') this.listeners.push(callback);
  }

  broadcast(payload) {
    for (const fn of this.listeners) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[Poller] broadcast listener failed: ${err.message}`);
      }
    }
  }

  broadcastTick(results) {
    if (!this.listeners.length || !Array.isArray(results) || !results.length) return;
    results = results.filter((r) => r);
    if (!results.length) return;
    this.broadcast({
      type: 'METRIC_TICK',
      timestamp: Date.now(),
      // Real polled values only; unmeasured fields are null, never invented.
      devices: results.map((r) => ({
        id: r.id,
        cpu: r.cpu_pct,
        memory: r.mem_used_pct,
        responseTime: r.response_ms,
        cpu_pct: r.cpu_pct,
        mem_used_pct: r.mem_used_pct,
        response_ms: r.response_ms,
        status: r.status,
        lastPolled: r.last_polled_at,
        lastPolledAt: r.last_polled_at,
      })),
    });
  }

  // --- alarm helpers (safe: a store alarm failure never kills the poll) ---

  raiseAlarmOnce(store, deviceId, source, severity, message) {
    const key = `${deviceId}:${source}`;
    if (this.activeAlarms.has(key)) return;
    try {
      // The store reads `device_id` (snake_case); `deviceId` is also sent
      // so the call matches the documented contract either way.
      store.alarms.raiseAlarm({ deviceId, device_id: deviceId, severity, message, source });
      this.activeAlarms.add(key);
    } catch (err) {
      console.error(`[Poller] raiseAlarm failed for ${deviceId}/${source}: ${err.message}`);
    }
  }

  resolveAlarm(store, deviceId, source) {
    const key = `${deviceId}:${source}`;
    if (!this.activeAlarms.has(key)) return;
    try {
      store.alarms.resolveAlarmByKey(deviceId, source);
    } catch (err) {
      console.error(`[Poller] resolveAlarmByKey failed for ${deviceId}/${source}: ${err.message}`);
    }
    this.activeAlarms.delete(key);
  }

  // --- persistence helpers (safe: never let a store write kill the poll) ---

  persistMetrics(store, result) {
    try {
      // last_polled_at is an INTEGER epoch-ms column in the store
      // (store.now() === Date.now()); the ISO string stays on the result
      // object for broadcast/display only.
      store.devices.updateDeviceMetrics(result.id, {
        cpu_pct: result.cpu_pct,
        mem_used_pct: result.mem_used_pct,
        uptime_ticks: result.uptime_ticks,
        response_ms: result.response_ms,
        status: result.status,
        last_polled_at: Date.parse(result.last_polled_at),
      });
    } catch (err) {
      console.error(`[Poller] updateDeviceMetrics failed for ${result.id}: ${err.message}`);
    }
    try {
      if (result.cpu_pct !== null || result.mem_used_pct !== null || result.response_ms !== null) {
        store.metrics.insertMetric(result.id, {
          cpu_pct: result.cpu_pct,
          mem_used_pct: result.mem_used_pct,
          response_ms: result.response_ms,
        });
      }
    } catch (err) {
      console.error(`[Poller] insertMetric failed for ${result.id}: ${err.message}`);
    }
  }

  persistIdentity(store, result, sysinfo) {
    try {
      // Only columns that exist in the store's devices table and its
      // DEVICE_COLUMNS whitelist are written (sys_name, sys_descr,
      // sys_object_id). sysLocation/sysContact have no columns, so they
      // are not persisted — they are returned to callers via poll results.
      store.devices.updateDevice(result.id, {
        sys_descr: sysinfo.sysDescr,
        sys_object_id: sysinfo.sysObjectID,
        sys_name: sysinfo.sysName,
      });
    } catch (err) {
      console.error(`[Poller] updateDevice failed for ${result.id}: ${err.message}`);
    }
  }

  persistPollError(store, result) {
    // No last_poll_error column exists in the store; the failure is
    // already persisted via updateDeviceMetrics status
    // ('Poll failed: <reason>' / 'Down' / 'SNMP Error'), so it is only
    // logged here — never silently dropped, never stored in a wrong column.
    console.error(`[Poller] poll failed for ${result.name} (${result.ip || result.id}): ${result.error}`);
  }

  // --- one device ----------------------------------------------------------

  // Per-device safety net: any unexpected throw inside the poll (a
  // synchronous throw while starting an SNMP call, a malformed SNMP
  // result, a bug in threshold evaluation, ...) is contained here and
  // recorded on THIS device only — it never escapes to the cycle or to
  // an on-demand caller, and it never takes down the server process.
  // NOTE (honest limit): a throw inside a third-party UDP callback
  // (net-snmp) cannot be caught by any try/catch here — that class of
  // throw is fixed at source in server/services/snmp.js. Everything
  // that can be contained at this layer is contained here.
  async pollOneDevice(device, store) {
    const startedAt = new Date();
    const ip = deviceIp(device);
    const result = {
      id: device ? device.id : null,
      name: deviceDisplayName(device, ip),
      ip,
      cpu_pct: null,
      mem_used_pct: null,
      uptime_ticks: null,
      response_ms: null,
      status: 'Unknown',
      last_polled_at: startedAt.toISOString(),
      error: null,
    };
    try {
      return await this.pollOneDeviceInner(device, store, result);
    } catch (err) {
      // Unexpected failure mid-poll: record it on this device with the
      // real error message, leave metrics null (never invented), and
      // return the failure result instead of throwing.
      const message = (err && err.message) || String(err);
      result.status = `Poll failed: ${message}`;
      result.error = message;
      result.cpu_pct = null;
      result.mem_used_pct = null;
      try {
        this.persistMetrics(store, result);
      } catch (persistErr) {
        console.error(`[Poller] updateDeviceMetrics failed for ${result.id}: ${persistErr.message}`);
      }
      this.persistPollError(store, result);
      return result;
    }
  }

  // Inner poll implementation. `result` is built by pollOneDevice so the
  // safety net above can record a failure against it; every return path
  // below already records its own outcome, the wrapper only catches
  // throws that escape those paths.
  async pollOneDeviceInner(device, store, result) {
    const ip = result.ip;

    if (!ip) {
      result.status = 'Poll failed: no IP address configured';
      result.error = 'no IP address configured';
      this.persistMetrics(store, result);
      this.persistPollError(store, result);
      return result;
    }

    const community = deviceCommunity(device);
    const port = devicePort(device);
    const snmpOptions = { port };

    // 1. ICMP echo latency (real measurement; null when ICMP is unavailable).
    try {
      result.response_ms = await withTimeout(ping.pingMs(ip), 5000, 'ping');
    } catch (err) {
      result.response_ms = null;
    }

    // 2. SNMP system identity — the reachability proof for the SNMP path.
    let sysinfo = null;
    let snmpError = null;
    try {
      sysinfo = await withTimeout(
        snmp.getSystemInfo(ip, community, snmpOptions),
        DEVICE_POLL_TIMEOUT_MS,
        'SNMP system info'
      );
    } catch (err) {
      snmpError = err.message;
    }

    if (!sysinfo) {
      // SNMP did not answer. Ping decides between host-down and SNMP-only fault.
      result.error = snmpError || 'SNMP request failed';
      if (result.response_ms === null) {
        result.status = 'Down';
        this.raiseAlarmOnce(store, result.id, 'availability', 'Critical',
          `No response from ${result.name} (${ip}): ICMP ping and SNMP both failed. ${result.error}`);
        this.resolveAlarm(store, result.id, 'snmp');
      } else {
        result.status = 'SNMP Error';
        this.raiseAlarmOnce(store, result.id, 'snmp', 'Critical',
          `SNMP failed on ${result.name} (${ip}) while ICMP ping answered (${result.response_ms} ms): ${result.error}. Check community string, SNMP enablement, and ACLs.`);
        this.resolveAlarm(store, result.id, 'availability');
      }
      this.persistMetrics(store, result);
      this.persistPollError(store, result);
      return result;
    }

    // 3. SNMP answered — host is Up. Resolve reachability alarms.
    result.status = 'Up';
    result.uptime_ticks = sysinfo.sysUpTime;
    this.resolveAlarm(store, result.id, 'availability');
    this.resolveAlarm(store, result.id, 'snmp');
    this.persistIdentity(store, result, sysinfo);

    // 4. CPU/memory + interfaces in parallel; a failure in either leaves
    //    that measurement null (honest) without failing the whole poll.
    // The SNMP calls are evaluated while building this array: a
    // synchronous throw there (bad args, a broken snmp module) would
    // otherwise escape pollOneDeviceInner entirely. allSettled covers
    // async rejections; this try covers the synchronous start.
    let cpuMemSettled;
    let ifacesSettled;
    try {
      [cpuMemSettled, ifacesSettled] = await Promise.allSettled([
        withTimeout(snmp.getCpuMem(ip, community, snmpOptions), DEVICE_POLL_TIMEOUT_MS, 'SNMP CPU/memory'),
        withTimeout(snmp.getInterfaces(ip, community, snmpOptions), DEVICE_POLL_TIMEOUT_MS, 'SNMP interfaces'),
      ]);
    } catch (err) {
      // SNMP identity already answered, so the device stays 'Up'; the
      // failed measurement is recorded honestly with null CPU/memory.
      result.error = (err && err.message) || String(err);
      this.persistMetrics(store, result);
      this.persistPollError(store, result);
      return result;
    }
    if (cpuMemSettled.status === 'fulfilled') {
      // A fulfilled SNMP call can still resolve a null/malformed value;
      // dereferencing it would throw — treat it as "no measurement".
      const cm = cpuMemSettled.value;
      result.cpu_pct = cm ? cm.cpu5min : null;
      result.mem_used_pct = cm ? cm.memUsedPct : null;
    } else {
      result.error = cpuMemSettled.reason ? cpuMemSettled.reason.message : 'CPU/memory poll failed';
    }
    if (ifacesSettled.status === 'fulfilled' && Array.isArray(ifacesSettled.value)) {
      try {
        // Store rows are snake_case (if_index, oper_status, in_octets,
        // out_octets) — camelCase keys would be ignored by replaceInterfaces.
        store.interfaces.replaceInterfaces(result.id, ifacesSettled.value.map((row) => ({
          if_index: row.ifIndex,
          descr: row.descr,
          name: row.name,
          oper_status: row.operStatus,
          in_octets: row.inOctets,
          out_octets: row.outOctets,
          speed: row.speed,
        })));
      } catch (err) {
        console.error(`[Poller] replaceInterfaces failed for ${result.id}: ${err.message}`);
      }
    } else if (!result.error) {
      result.error = ifacesSettled.reason ? ifacesSettled.reason.message : 'Interface poll failed';
    }

    // 5. Threshold evaluation against the measured values only.
    if (result.cpu_pct !== null) {
      if (result.cpu_pct > CPU_CRITICAL) {
        this.raiseAlarmOnce(store, result.id, 'cpu', 'Critical',
          `CPU ${result.cpu_pct}% on ${result.name} (${ip}) exceeds critical threshold ${CPU_CRITICAL}% (5-min average).`);
      } else if (result.cpu_pct > CPU_TROUBLE) {
        this.raiseAlarmOnce(store, result.id, 'cpu', 'Trouble',
          `CPU ${result.cpu_pct}% on ${result.name} (${ip}) exceeds warning threshold ${CPU_TROUBLE}% (5-min average).`);
      } else {
        this.resolveAlarm(store, result.id, 'cpu');
      }
    }
    if (result.mem_used_pct !== null) {
      if (result.mem_used_pct > MEM_CRITICAL) {
        this.raiseAlarmOnce(store, result.id, 'mem', 'Critical',
          `Memory ${result.mem_used_pct}% used on ${result.name} (${ip}) exceeds critical threshold ${MEM_CRITICAL}%.`);
      } else {
        this.resolveAlarm(store, result.id, 'mem');
      }
    }

    this.persistMetrics(store, result);
    if (result.error) this.persistPollError(store, result);
    return result;
  }

  // --- full cycle ----------------------------------------------------------

  async pollCycle() {
    if (this.cycleRunning) return [];
    this.cycleRunning = true;
    try {
      const store = getStore();
      if (!store) return [];
      let devices = [];
      try {
        devices = store.devices.listDevices() || [];
      } catch (err) {
        console.error(`[Poller] listDevices failed: ${err.message}`);
        return [];
      }
      // Skip explicitly unmanaged devices (managed INTEGER 0 in the store);
      // everything else is polled.
      const managed = devices.filter((d) => !isUnmanaged(d));
      const settled = await Promise.allSettled(
        managed.map((device) =>
          withTimeout(
            this.pollOneDevice(device, store),
            DEVICE_POLL_TIMEOUT_MS + 10000,
            `poll ${deviceIp(device) || device.id}`
          ).catch((err) => {
            // Per-device containment (second layer — pollOneDevice's own
            // safety net should already have caught poll throws; this
            // covers a cycle timeout and anything else that escapes it).
            // A failure here is recorded on THIS device only, with the
            // real message and null metrics, and the cycle continues.
            const message = (err && err.message) || String(err);
            const result = {
              id: device ? device.id : null,
              name: deviceDisplayName(device, deviceIp(device)),
              ip: deviceIp(device),
              cpu_pct: null,
              mem_used_pct: null,
              uptime_ticks: null,
              response_ms: null,
              status: `Poll failed: ${message}`,
              last_polled_at: new Date().toISOString(),
              error: message,
            };
            try {
              this.persistMetrics(store, result);
            } catch (persistErr) {
              console.error(`[Poller] updateDeviceMetrics failed for ${result.id}: ${persistErr.message}`);
            }
            this.persistPollError(store, result);
            return result;
          })
        )
      );
      const results = settled
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);
      this.broadcastTick(results);
      return results;
    } catch (err) {
      // Defence in depth: the cycle itself must never reject (a store
      // require failure, a broadcast failure, ...). The callers in
      // startPoller/start also attach .catch, but a direct pollCycle()
      // caller must not see an unhandled rejection either.
      console.error(`[Poller] cycle failed: ${(err && err.message) || err}`);
      return [];
    } finally {
      this.cycleRunning = false;
    }
  }

  // --- lifecycle -----------------------------------------------------------

  /**
   * startPoller(broadcastFn?) — begin polling on the configured interval
   * (store setting 'poll_interval_seconds', default 60). An optional
   * broadcast function receives each cycle's real METRIC_TICK payload.
   * Runs one cycle immediately so the dashboard shows measured values
   * instead of waiting a full interval.
   */
  startPoller(broadcastFn) {
    if (typeof broadcastFn === 'function') this.onUpdate(broadcastFn);
    if (this.timer) return this;
    // getStore() rethrows non-MODULE_NOT_FOUND require errors (e.g. a
    // syntax error in store.js); starting the poller must not throw for
    // that — log it and fall back to the default interval. The cycle
    // itself reports the missing store on every run.
    let store = null;
    try {
      store = getStore();
    } catch (err) {
      console.error(`[Poller] could not load store, using default poll interval: ${err.message}`);
    }
    const seconds = store ? resolvePollIntervalSeconds(store) : DEFAULT_POLL_INTERVAL_SECONDS;
    this.intervalMs = seconds * 1000;
    this.timer = setInterval(() => {
      this.pollCycle().catch((err) => console.error(`[Poller] cycle failed: ${err.message}`));
    }, this.intervalMs);
    console.log(`[OpManager Poller] Real-data polling engine active (interval: ${seconds}s, ICMP + SNMPv2c)`);
    this.pollCycle().catch((err) => console.error(`[Poller] initial cycle failed: ${err.message}`));
    return this;
  }

  stopPoller() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return this;
  }

  /**
   * pollDeviceNow(deviceId) — one real synchronous poll of a single device.
   * Returns the measured result { id, name, ip, cpu_pct, mem_used_pct,
   * uptime_ticks, response_ms, status, last_polled_at, error }.
   * Throws when the store is unavailable or the device does not exist.
   */
  async pollDeviceNow(deviceId) {
    const store = requireStore();
    const devices = store.devices.listDevices() || [];
    const device = devices.find((d) => d && String(d.id) === String(deviceId));
    if (!device) throw new Error(`Device not found: ${deviceId}`);
    // Per-device safety net (mirrors the scheduled cycle): a poll failure
    // is recorded on the device and returned, never thrown — the
    // store-unavailable / device-not-found throws above are kept, they
    // are caller errors, not poll failures. The devices.js poll-now route
    // already treats a returned non-'Up' status as the failure signal.
    let result;
    try {
      result = await this.pollOneDevice(device, store);
    } catch (err) {
      const message = (err && err.message) || String(err);
      result = {
        id: device.id,
        name: deviceDisplayName(device, deviceIp(device)),
        ip: deviceIp(device),
        cpu_pct: null,
        mem_used_pct: null,
        uptime_ticks: null,
        response_ms: null,
        status: `Poll failed: ${message}`,
        last_polled_at: new Date().toISOString(),
        error: message,
      };
      try {
        this.persistMetrics(store, result);
      } catch (persistErr) {
        console.error(`[Poller] updateDeviceMetrics failed for ${result.id}: ${persistErr.message}`);
      }
      this.persistPollError(store, result);
    }
    try {
      this.broadcastTick([result]);
    } catch (err) {
      console.error(`[Poller] broadcastTick failed for ${result.id}: ${err.message}`);
    }
    return result;
  }

  // --- backwards-compatible wrappers for server/index.js -----------------
  // Old code called poller.start(4000) / poller.stop(). The legacy 4 s
  // interval was the random-walk cadence; a sub-10 s interval is ignored
  // and the configured interval (default 60 s) is used instead, because
  // SNMP polling a whole estate every 4 s is not a real monitoring cadence.

  start(intervalMs) {
    if (this.timer) return this;
    if (typeof intervalMs === 'number' && intervalMs >= MIN_POLL_INTERVAL_SECONDS * 1000) {
      this.intervalMs = intervalMs;
      this.timer = setInterval(() => {
        this.pollCycle().catch((err) => console.error(`[Poller] cycle failed: ${err.message}`));
      }, this.intervalMs);
      console.log(`[OpManager Poller] Real-data polling engine active (interval: ${intervalMs}ms, ICMP + SNMPv2c)`);
      this.pollCycle().catch((err) => console.error(`[Poller] initial cycle failed: ${err.message}`));
      return this;
    }
    if (typeof intervalMs === 'number') {
      console.log(`[OpManager Poller] Ignoring legacy ${intervalMs}ms interval (random-walk cadence); using configured poll interval instead.`);
    }
    return this.startPoller();
  }

  stop() {
    return this.stopPoller();
  }
}

const poller = new RealPoller();

// The singleton instance already carries every method (startPoller,
// stopPoller, pollDeviceNow, pollCycle, start, stop, onUpdate) via its
// class — do NOT reassign them here: module.exports IS this instance, so
// `module.exports.pollDeviceNow = (id) => poller.pollDeviceNow(id)` would
// shadow the method with a wrapper that calls itself (infinite recursion).
module.exports = poller;
module.exports.RealPoller = RealPoller;
