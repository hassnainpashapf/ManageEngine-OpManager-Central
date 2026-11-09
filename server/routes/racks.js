'use strict';
/**
 * Racks — real-data routes (real-data branch).
 *
 * Audit item fixed: R1 (opm-check/real-data/audit/ncm-traps-zia.md) —
 * the old empty-array RACKS constant was never populated, seeded,
 * or appended to, and there was no create/import endpoint, so
 * GET /api/racks/list always returned []. Racks now live in the SQLite
 * store (server/services/store.js): the list returns only racks actually
 * created, and device placements are persisted in the store too.
 *
 * Store API used (FLAT exports — `store.racks` / `store.devices` namespaces
 * also exist in the store, but these routes use the flat functions):
 *   store.createRack({ name, units }), store.listRacks(), store.getRack(id),
 *   store.listDevices(), store.getSetting(key), store.setSetting(key, value),
 *   store.getSessionByTokenHash(hash)
 *
 * Response contract (R-01, phase 5): `units` is the rack's unit COUNT (an
 * integer), NOT a list of placed units; placements live in `assignments[]`,
 * one entry per placed REAL device ({ rackId, deviceId, unit, deviceName,
 * deviceIp, deviceStatus, deviceCategory, assignedAt }). The store's racks
 * table holds only { id, name, units, created_at } — there is NO
 * temperature, power, datacenter, probe or cooling data anywhere in this
 * build, so none is returned here and the UI must not render any.
 *
 * Placements: the store has no rack_assignments table, so assignments are
 * persisted as JSON under the settings key 'rack_assignments' via
 * store.getSetting/store.setSetting. An assignment only ever references a
 * real rack (store.getRack) and a real device (store.listDevices); stale
 * assignments whose device no longer exists are dropped, never rendered.
 *
 * Auth: server/routes/auth.js stores sessions in store.sessions (SHA-256
 * hex of the presented token, honouring sessions.expires_at). POSTs
 * validate the Bearer token against that table and return 401 otherwise.
 * The hardcoded `opmcsrfcookie` value is deliberately NOT accepted as auth.
 */

const express = require('express');
const crypto = require('node:crypto');
const store = require('../services/store');

const router = express.Router();

const ASSIGNMENTS_KEY = 'rack_assignments';

function loadAssignments() {
  const raw = store.getSetting(ASSIGNMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveAssignments(assignments) {
  store.setSetting(ASSIGNMENTS_KEY, assignments);
}

function toIntId(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required: Bearer token missing',
    });
  }
  const tokenHash = crypto.createHash('sha256').update(match[1]).digest('hex');
  let session = null;
  try {
    session = store.getSessionByTokenHash(tokenHash);
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Session lookup failed' });
  }
  if (!session || (session.expires_at && session.expires_at <= Date.now())) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required: invalid or expired token',
    });
  }
  req.session = session;
  return next();
}

// Enrich a stored assignment ({ rackId, deviceId, unit, assignedAt }) with
// fields from the real device row. Returns null when the device no longer
// exists, so deleted devices are never shown as placed in a rack.
function enrichAssignment(assignment, devices) {
  const device = (devices || []).find((d) => d.id === assignment.deviceId) || null;
  if (!device) return null;
  return {
    rackId: assignment.rackId,
    deviceId: assignment.deviceId,
    unit: assignment.unit,
    deviceName: device.hostname || device.sys_name || null,
    deviceIp: device.ip || null,
    deviceStatus: device.status !== undefined ? device.status : null,
    deviceCategory: device.category !== undefined ? device.category : null,
    assignedAt: assignment.assignedAt !== undefined ? assignment.assignedAt : null,
  };
}

// GET /api/racks/list — only racks actually created in the store.
// NOTE: the old `probeId` query filter is gone: racks have no probe
// association in the store schema (no probe_id column), so filtering by it
// could only ever return [].
router.get('/api/racks/list', (req, res) => {
  const racks = store.listRacks();
  const devices = store.listDevices();
  const assignments = loadAssignments();
  const byRack = new Map();
  for (const a of assignments) {
    const enriched = enrichAssignment(a, devices);
    if (!enriched) continue;
    if (!byRack.has(a.rackId)) byRack.set(a.rackId, []);
    byRack.get(a.rackId).push(enriched);
  }
  res.json({
    status: 'success',
    racks: racks.map((r) => {
      // Defensive (R-01): a stored units value that is not a positive
      // integer is surfaced as null — never a fabricated count, and never
      // a value a consumer could mistake for a placed-units list.
      const units = Number.isInteger(r.units) && r.units > 0 ? r.units : null;
      // Placements outside the rack's own unit range are stale and are
      // never rendered.
      const placed = (byRack.get(r.id) || []).filter(
        (a) => units !== null && Number.isInteger(a.unit) && a.unit >= 1 && a.unit <= units
      );
      return {
        id: r.id,
        name: r.name,
        units,
        created_at: r.created_at,
        assignments: placed,
      };
    }),
  });
});

// POST /api/racks/create (authed) — stores a rack: name + unit count.
// 400 when name is missing/blank or units is not a positive integer.
router.post('/api/racks/create', requireAuth, (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  const units = Number(body.units);
  if (!Number.isInteger(units) || units <= 0) {
    return res
      .status(400)
      .json({ status: 'error', message: 'units must be a positive integer (rack unit count)' });
  }
  const rack = store.createRack({ name, units });
  return res.status(201).json({ status: 'success', rack });
});

// POST /api/racks/assign (authed) — places a REAL device into a real rack
// unit. Body: { rackId, deviceId, unit } (unit is 1-based, 1..rack.units).
// 404 for an unknown rack or device; 400 for a missing/invalid unit or a
// unit outside the rack; 409 when the unit is already occupied by another
// device or the device is already placed elsewhere. Re-assigning the same
// device to the same unit is idempotent (returns the existing assignment).
router.post('/api/racks/assign', requireAuth, (req, res) => {
  const body = req.body || {};
  const rackId = toIntId(body.rackId !== undefined ? body.rackId : body.rack_id);
  const deviceId = toIntId(body.deviceId !== undefined ? body.deviceId : body.device_id);
  const unit = toIntId(body.unit);
  if (rackId === null || deviceId === null || unit === null) {
    return res.status(400).json({
      status: 'error',
      message: 'rackId, deviceId and unit are required and must be integers',
    });
  }
  const rack = store.getRack(rackId);
  if (!rack) {
    return res.status(404).json({ status: 'error', message: `Rack ${rackId} not found` });
  }
  const devices = store.listDevices();
  const device = devices.find((d) => d.id === deviceId) || null;
  if (!device) {
    return res.status(404).json({ status: 'error', message: `Device ${deviceId} not found` });
  }
  if (!Number.isInteger(rack.units) || rack.units <= 0) {
    return res.status(400).json({
      status: 'error',
      message: `Rack ${rackId} has no unit count, so no unit can be assigned`,
    });
  }
  if (unit < 1 || unit > rack.units) {
    return res.status(400).json({
      status: 'error',
      message: `unit must be between 1 and ${rack.units} for rack ${rackId}`,
    });
  }
  // Prune assignments pointing at devices that no longer exist.
  const assignments = loadAssignments().filter((a) =>
    devices.some((d) => d.id === a.deviceId)
  );
  const occupying = assignments.find((a) => a.rackId === rackId && a.unit === unit);
  if (occupying) {
    if (occupying.deviceId === deviceId) {
      return res.json({ status: 'success', assignment: enrichAssignment(occupying, devices) });
    }
    return res.status(409).json({
      status: 'error',
      message: `Unit ${unit} in rack ${rackId} is already occupied by device ${occupying.deviceId}`,
    });
  }
  const elsewhere = assignments.find((a) => a.deviceId === deviceId);
  if (elsewhere) {
    return res.status(409).json({
      status: 'error',
      message: `Device ${deviceId} is already placed in rack ${elsewhere.rackId} unit ${elsewhere.unit}`,
    });
  }
  const assignment = { rackId, deviceId, unit, assignedAt: Date.now() };
  assignments.push(assignment);
  saveAssignments(assignments);
  return res.status(201).json({ status: 'success', assignment: enrichAssignment(assignment, devices) });
});

module.exports = router;
