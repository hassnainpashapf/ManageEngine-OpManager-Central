'use strict';
/**
 * retention.js — Gap E: data-retention enforcement (real-data branch).
 *
 * The retention setting (`dataRetentionDays`, stored by
 * POST /api/settings/system under the 'system' settings key) was stored
 * but never enforced. This module enforces it:
 *
 *   - readRetentionDays(store) — the configured retention in whole days,
 *     or null when not configured / invalid. An invalid value is treated
 *     as "not configured": it NEVER triggers a purge (safe direction).
 *   - purgeOldData(store, nowMs) — deletes metrics rows and cleared-alarm
 *     history older than the cutoff via store.purgeOlderThan(). Active /
 *     acknowledged alarms are live state and are never deleted. Records
 *     the run under settings key 'retention.lastPurge' so the API can
 *     report it honestly. Returns a result object; never invents one
 *     when retention is unconfigured ({ configured: false, ... }).
 *   - getRetentionStatus(store) — the honest status object for the API:
 *     'Not configured' when no valid retention is set, otherwise
 *     'Configured: N day(s)', plus the last purge record (or null).
 *
 * Scope: metrics (time-series) and alarms (cleared history only). Traps,
 * audit_log, configs, discovery_runs and other tables have no retention
 * setting and are untouched — purging them would destroy data the UI
 * needs with no configured policy behind it.
 */

const MIN_RETENTION_DAYS = 1;
const MAX_RETENTION_DAYS = 3650; // 10 years
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Read the configured retention (whole days) from the store, or null.
 * Accepts a plain number (what POST /api/settings/system stores) or, for
 * tolerance, an object with a numeric performanceHourly/daily field (the
 * shape the client once read). Anything else — missing, non-numeric,
 * fractional, <= 0, absurdly large — is "not configured".
 */
function readRetentionDays(store) {
  if (!store || typeof store.getSetting !== 'function') return null;
  let raw = null;
  try {
    raw = store.getSetting('system');
  } catch {
    return null;
  }
  if (raw === null || raw === undefined) return null;
  let sys = null;
  try {
    sys = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
  if (!sys || typeof sys !== 'object') return null;
  let days = sys.dataRetentionDays;
  if (days && typeof days === 'object') {
    days = days.performanceHourly ?? days.daily ?? null;
  }
  if (typeof days === 'string' && days.trim() !== '') days = Number(days);
  if (typeof days !== 'number' || !Number.isFinite(days) || !Number.isInteger(days)) return null;
  if (days < MIN_RETENTION_DAYS || days > MAX_RETENTION_DAYS) return null;
  return days;
}

/**
 * Enforce retention now. Returns:
 *   { configured, retentionDays, cutoffMs, metricsDeleted, alarmsDeleted,
 *     activeAlarmsKept, purgedAt }
 * When retention is not configured nothing is deleted and
 * `configured` is false. Throws only when the store cannot perform the
 * purge (e.g. store.purgeOlderThan missing) — callers must catch and log
 * that, leaving data untouched.
 */
function purgeOldData(store, nowMs) {
  const days = readRetentionDays(store);
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  if (days === null) {
    return {
      configured: false,
      retentionDays: null,
      cutoffMs: null,
      metricsDeleted: 0,
      alarmsDeleted: 0,
      activeAlarmsKept: 0,
      purgedAt: null,
    };
  }
  if (!store || typeof store.purgeOlderThan !== 'function') {
    throw new Error('retention: store.purgeOlderThan is not available — retention cannot be enforced');
  }
  const cutoffMs = now - days * DAY_MS;
  const result = store.purgeOlderThan(cutoffMs);
  const record = {
    purgedAt: new Date(now).toISOString(),
    retentionDays: days,
    cutoffMs,
    metricsDeleted: result.metricsDeleted,
    alarmsDeleted: result.alarmsDeleted,
    activeAlarmsKept: result.activeAlarmsKept,
  };
  // Status bookkeeping only — a failure here must not fail the purge.
  try {
    store.setSetting('retention.lastPurge', record);
  } catch {
    /* last-purge status is informational; the purge itself already ran */
  }
  return { configured: true, ...record };
}

/** Honest retention status for the API/UI — never claims a policy exists. */
function getRetentionStatus(store) {
  const days = readRetentionDays(store);
  let lastPurge = null;
  try {
    const raw = store && typeof store.getSetting === 'function'
      ? store.getSetting('retention.lastPurge')
      : null;
    lastPurge = raw ? JSON.parse(raw) : null;
  } catch {
    lastPurge = null;
  }
  if (days === null) {
    return { configured: false, retentionDays: null, status: 'Not configured', lastPurge };
  }
  return {
    configured: true,
    retentionDays: days,
    status: `Configured: ${days} day${days === 1 ? '' : 's'}`,
    lastPurge,
  };
}

module.exports = { readRetentionDays, purgeOldData, getRetentionStatus };
