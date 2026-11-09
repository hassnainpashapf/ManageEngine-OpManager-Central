const express = require('express');
const router = express.Router();
const store = require('../services/store');

// Real hardware inventory for a device, collected live over SNMP.
// Audit H1 (poller-metrics.md): the previous version returned a canned
// hardware template (fixed ROM version, RAM, flash, PSU model, fan speed
// and rack value) for every device. This version queries the real
// device and returns ONLY what it actually reported; anything the device
// does not answer is null (arrays are empty), never a template value.
// If the device cannot be reached over SNMP, an honest error is returned.
//
// Sources (see opm-check/real-data/specs/snmp-oid-reference.md):
//   ENTITY-MIB entPhysicalTable .... 1.3.6.1.2.1.47.1.1.1
//     columns .1.2 descr, .1.7 name, .1.8 hardwareRev, .1.9 firmwareRev,
//     .1.10 softwareRev, .1.11 serialNum, .1.12 mfgName, .1.13 modelName,
//     .1.15 assetID; class (.1.5): 3 chassis, 6 powerSupply, 7 fan,
//     8 sensor, 12 cpu
//   HOST-RESOURCES hrStorageTable .. 1.3.6.1.2.1.25.2.3.1
//     columns .2 type, .3 descr, .4 allocUnits, .5 size, .6 used
//     (RAM row: type ...25.2.1.2; flash row: type ...25.2.1.9)
//   HOST-RESOURCES hrMemorySize .... 1.3.6.1.2.1.25.2.2.0 (KBytes, fallback)
//   HOST-RESOURCES hrProcessorTable  1.3.6.1.2.1.25.3.3.1 (.2 load, 1 row/CPU)
//   CISCO-ENVMON-MIB temp table .... 1.3.6.1.4.1.9.9.13.1.3.1
//     columns .2 descr, .3 value (deprecated, C), .4 threshold,
//     .6 state, .7 valueRev1 (preferred, C)
//   ENTITY-SENSOR-MIB .............. 1.3.6.1.2.1.99.1.1.1
//     columns .1 type (8 celsius, 10 rpm), .2 scale, .4 value
//     (value x 10^scale; join to entPhysicalDescr by entPhysicalIndex)
//   SNMPv2-MIB scalars ............. sysObjectID.0, sysLocation.0, sysDescr.0
//
// NOTE: the SNMP service (server/services/snmp.js) is built by a parallel
// workstream and may not exist yet. It is required lazily inside the
// handler so this route still loads (and reports honestly) until it lands;
// once the file exists, require() picks it up with no server restart.
// Expected API: snmp.snmpWalk(ip, community, oid) and
// snmp.snmpGet(ip, community, oids) — each resolving to varbinds shaped
// as an array of { oid, value } (or [oid, value] pairs) or an { oid: value }
// map. Values may be strings, numbers, or Buffers.

const ENT_PHYSICAL_TABLE = '1.3.6.1.2.1.47.1.1.1.1';
const HR_STORAGE_TABLE = '1.3.6.1.2.1.25.2.3.1';
const HR_PROCESSOR_TABLE = '1.3.6.1.2.1.25.3.3.1';
const ENVMON_TEMP_TABLE = '1.3.6.1.4.1.9.9.13.1.3.1';
const ENT_SENSOR_TABLE = '1.3.6.1.2.1.99.1.1.1';

const HR_STORAGE_RAM = '1.3.6.1.2.1.25.2.1.2';
const HR_STORAGE_FLASH = '1.3.6.1.2.1.25.2.1.9';

const ENT_CLASS_CHASSIS = 3;
const ENT_CLASS_POWERSUPPLY = 6;
const ENT_CLASS_FAN = 7;
const ENT_CLASS_CPU = 12;

const ENVMON_STATE = {
  1: 'Normal',
  2: 'Warning',
  3: 'Critical',
  4: 'Shutdown',
  5: 'Not Present',
  6: 'Not Functioning',
};

// Lazily load the (parallel-built) SNMP service; null while it is absent.
function loadSnmp() {
  try {
    const snmp = require('../services/snmp');
    if (snmp && typeof snmp.snmpWalk === 'function' && typeof snmp.snmpGet === 'function') {
      return snmp;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Normalise whatever varbind shape the SNMP service returns into a
// Map of numeric-OID string -> raw value.
function toVarbindMap(result) {
  const map = new Map();
  if (!result) return map;
  if (Array.isArray(result)) {
    for (const vb of result) {
      if (Array.isArray(vb) && vb.length >= 2) {
        map.set(String(vb[0]), vb[1]);
      } else if (vb && typeof vb === 'object' && vb.oid !== undefined) {
        map.set(String(vb.oid), vb.value);
      }
    }
    return map;
  }
  if (typeof result === 'object') {
    for (const [oid, value] of Object.entries(result)) {
      map.set(String(oid), value);
    }
  }
  return map;
}

function asString(value) {
  if (value === undefined || value === null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8').trim() || null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function asNumber(value) {
  if (value === undefined || value === null) return null;
  if (Buffer.isBuffer(value)) value = value.toString('utf8').trim();
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Group a table walk (base OID + .<column>.<index>) into rows keyed by
// index: { <index>: { <column>: rawValue } }.
function groupTableRows(varbindMap, baseOid) {
  const rows = {};
  const prefix = baseOid + '.';
  for (const [oid, value] of varbindMap) {
    if (!oid.startsWith(prefix)) continue;
    const rest = oid.slice(prefix.length).split('.');
    if (rest.length < 2) continue;
    const col = rest[0];
    const index = rest.slice(1).join('.');
    if (!rows[index]) rows[index] = {};
    rows[index][col] = value;
  }
  return rows;
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return null;
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n >= 1024 ** 3) {
    const gb = n / 1024 ** 3;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
  }
  if (n >= 1024 ** 2) {
    const mb = n / 1024 ** 2;
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
  }
  if (n >= 1024) {
    const kb = n / 1024;
    return `${Number.isInteger(kb) ? kb : kb.toFixed(1)} KB`;
  }
  return `${n} B`;
}

// Best-effort walk: a table the device does not implement (or a timeout)
// yields an empty map instead of failing the whole request. Returns
// { map, ok } where ok is true only if the call returned data.
async function tryWalk(snmp, ip, community, oid) {
  try {
    const map = toVarbindMap(await snmp.snmpWalk(ip, community, oid));
    return { map, ok: map.size > 0 };
  } catch (e) {
    return { map: new Map(), ok: false };
  }
}

async function tryGet(snmp, ip, community, oids) {
  try {
    const map = toVarbindMap(await snmp.snmpGet(ip, community, oids));
    return { map, ok: map.size > 0 };
  } catch (e) {
    return { map: new Map(), ok: false };
  }
}

// GET /api/hardware/details?deviceId=<id>&ip=<ip> (unchanged path/params)
router.get('/api/hardware/details', async (req, res) => {
  const { deviceId, ip } = req.query;

  // Look the device up in the store (flat API: getDevice / getDeviceByIp).
  // NOTE: the brief named store.devices.getDevice, but the store module as
  // built exports getDevice/getDeviceByIp at top level — no `devices`
  // namespace exists. Using the real exports here.
  let dev = null;
  if (deviceId !== undefined && deviceId !== '') {
    dev = store.getDevice(deviceId) || store.getDevice(Number(deviceId)) || null;
  }
  if (!dev && ip) {
    dev = store.getDeviceByIp(ip) || null;
  }
  if (!dev && deviceId === undefined && !ip) {
    const all = store.listDevices ? store.listDevices() : [];
    dev = all && all.length ? all[0] : null;
  }

  if (!dev) {
    if (deviceId !== undefined || ip) {
      return res.status(404).json({
        status: 'error',
        hardware: null,
        message: `Device not found: ${deviceId || ip}. No hardware details available.`,
      });
    }
    return res.json({
      status: 'success',
      hardware: null,
      message: 'No devices found in inventory.',
    });
  }

  const deviceIp = dev.ip;
  if (!deviceIp) {
    return res.status(400).json({
      status: 'error',
      hardware: null,
      message: `Device ${dev.sys_name || dev.hostname || dev.id} has no IP address stored; SNMP hardware inventory cannot be collected.`,
    });
  }

  const snmp = loadSnmp();
  if (!snmp) {
    return res.status(503).json({
      status: 'error',
      hardware: null,
      message: 'SNMP service is not available on this server yet (server/services/snmp.js is not installed); live hardware inventory cannot be collected.',
    });
  }

  const community = dev.snmp_community || 'public';

  // --- Live SNMP collection (each table independent; unsupported tables
  // --- simply contribute nothing) ---
  let anySnmpOk = false;

  const sys = await tryGet(snmp, deviceIp, community, [
    '1.3.6.1.2.1.1.1.0', // sysDescr.0
    '1.3.6.1.2.1.1.2.0', // sysObjectID.0
    '1.3.6.1.2.1.1.6.0', // sysLocation.0
  ]);
  anySnmpOk = anySnmpOk || sys.ok;

  const ent = await tryWalk(snmp, deviceIp, community, ENT_PHYSICAL_TABLE);
  anySnmpOk = anySnmpOk || ent.ok;

  const storage = await tryWalk(snmp, deviceIp, community, HR_STORAGE_TABLE);
  anySnmpOk = anySnmpOk || storage.ok;

  const hrMem = await tryGet(snmp, deviceIp, community, [
    '1.3.6.1.2.1.25.2.2.0', // hrMemorySize.0 (KBytes)
  ]);
  anySnmpOk = anySnmpOk || hrMem.ok;

  const procs = await tryWalk(snmp, deviceIp, community, HR_PROCESSOR_TABLE);
  anySnmpOk = anySnmpOk || procs.ok;

  const envTemp = await tryWalk(snmp, deviceIp, community, ENVMON_TEMP_TABLE);
  anySnmpOk = anySnmpOk || envTemp.ok;

  const sensors = await tryWalk(snmp, deviceIp, community, ENT_SENSOR_TABLE);
  anySnmpOk = anySnmpOk || sensors.ok;

  // The device answered nothing over SNMP at all: honest error, no
  // invented values. (A device that answers SNMP but implements none of
  // these tables still returns success below, with nulls.)
  if (!anySnmpOk) {
    return res.status(502).json({
      status: 'error',
      hardware: null,
      message: `Device ${deviceIp} did not respond to SNMP (community ${community === 'public' ? 'public (default)' : 'as stored'}). Hardware inventory cannot be collected; check that SNMP is enabled on the device and the community is correct.`,
      device: {
        deviceName: dev.sys_name || dev.hostname || null,
        ip: deviceIp,
      },
    });
  }

  // --- ENTITY-MIB: chassis / PSUs / fans / CPUs ---
  const entRows = groupTableRows(ent.map, ENT_PHYSICAL_TABLE);
  let chassis = null;
  const powerSupplies = [];
  const fanTrays = [];
  let entCpuCount = 0;
  for (const [index, row] of Object.entries(entRows)) {
    const cls = asNumber(row['5']);
    const name = asString(row['7']);
    if (cls === ENT_CLASS_CHASSIS && !chassis) {
      chassis = { index, row };
    } else if (cls === ENT_CLASS_POWERSUPPLY) {
      powerSupplies.push({
        id: name || `PSU-${index}`,
        model: asString(row['13']),
        status: null, // ENTITY-MIB reports no PSU state; do not invent one
        input: null,
        output: null,
      });
    } else if (cls === ENT_CLASS_FAN) {
      fanTrays.push({
        id: name || `FAN-${index}`,
        speed: null, // filled from ENTITY-SENSOR rpm rows below, if any
        status: null,
        airflow: null,
        _entIndex: index,
      });
    } else if (cls === ENT_CLASS_CPU) {
      entCpuCount += 1;
    }
  }

  // --- ENTITY-SENSOR-MIB: fan RPM + temperature readings ---
  // Join by entPhysicalIndex to entPhysicalDescr for names.
  const sensorRows = groupTableRows(sensors.map, ENT_SENSOR_TABLE);
  const sensorByEntIndex = {};
  for (const [index, row] of Object.entries(sensorRows)) {
    const type = asNumber(row['1']);
    const scale = asNumber(row['2']);
    const raw = asNumber(row['4']);
    if (type === null || raw === null) continue;
    const value = raw * 10 ** (scale === null ? 0 : scale);
    sensorByEntIndex[index] = { type, value };
  }
  const rpmByEntIndex = {};
  const celsiusByEntIndex = {};
  for (const [index, s] of Object.entries(sensorByEntIndex)) {
    if (s.type === 10) rpmByEntIndex[index] = s.value; // rpm
    if (s.type === 8) celsiusByEntIndex[index] = s.value; // celsius
  }
  for (const fan of fanTrays) {
    const rpm = rpmByEntIndex[fan._entIndex];
    if (rpm !== undefined && rpm !== null) fan.speed = `${Math.round(rpm)} RPM`;
    delete fan._entIndex;
  }

  // --- Thermal sensors: EnvMon first, ENTITY-SENSOR celsius as fallback ---
  const thermalSensors = [];
  const envTempRows = groupTableRows(envTemp.map, ENVMON_TEMP_TABLE);
  for (const [index, row] of Object.entries(envTempRows)) {
    const rev1 = asNumber(row['7']);
    const legacy = asNumber(row['3']);
    const temp = rev1 !== null ? rev1 : legacy;
    const threshold = asNumber(row['4']);
    const state = asNumber(row['6']);
    thermalSensors.push({
      location: asString(row['2']) || `Sensor ${index}`,
      temperature: temp !== null ? `${temp} °C` : null,
      threshold: threshold !== null ? `${threshold} °C` : null,
      status: state !== null ? (ENVMON_STATE[state] || `State ${state}`) : null,
    });
  }
  if (thermalSensors.length === 0) {
    for (const [index, value] of Object.entries(celsiusByEntIndex)) {
      const descr = entRows[index] ? asString(entRows[index]['2']) : null;
      thermalSensors.push({
        location: descr || `Sensor ${index}`,
        temperature: `${value} °C`,
        threshold: null,
        status: null,
      });
    }
  }

  // --- HOST-RESOURCES storage: RAM + flash ---
  const storageRows = groupTableRows(storage.map, HR_STORAGE_TABLE);
  let totalRamBytes = null;
  let flashBytes = null;
  for (const row of Object.values(storageRows)) {
    const type = asString(row['2']);
    const units = asNumber(row['4']);
    const size = asNumber(row['5']);
    if (units === null || size === null) continue;
    const bytes = size * units;
    if (type === HR_STORAGE_RAM && totalRamBytes === null) totalRamBytes = bytes;
    if (type === HR_STORAGE_FLASH && flashBytes === null) flashBytes = bytes;
  }
  let totalRam = totalRamBytes !== null ? formatBytes(totalRamBytes) : null;
  if (totalRam === null) {
    // Fallback: hrMemorySize scalar (KBytes).
    const memKb = asNumber(hrMem.map.get('1.3.6.1.2.1.25.2.2.0'));
    if (memKb !== null) totalRam = formatBytes(memKb * 1024);
  }
  const flashMemory = flashBytes !== null
    ? `${formatBytes(flashBytes)} Flash`
    : null;

  // --- CPU count: one hrProcessorLoad row per core, else ENTITY-MIB CPUs ---
  const procRows = groupTableRows(procs.map, HR_PROCESSOR_TABLE);
  const procCount = Object.keys(procRows).length;
  const cpuCount = procCount > 0 ? procCount : (entCpuCount > 0 ? entCpuCount : null);

  // --- Identity: live SNMP values first, stored device record second ---
  const liveSysDescr = asString(sys.map.get('1.3.6.1.2.1.1.1.0'));
  const liveSysOid = asString(sys.map.get('1.3.6.1.2.1.1.2.0'));
  const liveSysLocation = asString(sys.map.get('1.3.6.1.2.1.1.6.0'));

  const hardware = {
    deviceName: dev.sys_name || dev.hostname || null,
    ip: deviceIp,
    vendor: dev.vendor || (chassis ? asString(chassis.row['12']) : null) || null,
    category: dev.category || null,
    model: (chassis ? asString(chassis.row['13']) : null) || dev.model || null,
    serialNumber: chassis ? asString(chassis.row['11']) : null,
    macAddress: null, // no MAC source in the store or ENTITY-MIB; not invented
    systemOid: liveSysOid || dev.sys_object_id || null,
    sysDescr: liveSysDescr || dev.sys_descr || null,
    romVersion: chassis ? asString(chassis.row['9']) : null,
    firmwareVersion: chassis ? asString(chassis.row['10']) : null,
    chassisType: chassis ? asString(chassis.row['2']) : null,
    totalRam,
    flashMemory,
    cpuCount,
    powerSupplies,
    fanTrays,
    thermalSensors,
    assetTag: chassis ? asString(chassis.row['15']) : null,
    rackLocation: liveSysLocation || null,
    maintenanceWindow: null, // no source reports this; not invented
  };

  res.json({
    status: 'success',
    hardware,
  });
});

module.exports = router;
