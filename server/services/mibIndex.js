'use strict';

/**
 * mibIndex.js — Real MIB index for the OpManager Central real-data build.
 *
 * Serves the on-disk MIB definitions in server/data/mibs/ (116 genuine
 * Cisco/RFC/vendor MIB files) through the pre-built index at
 * server/data/mibs/index.json:
 *   { modules: [{ module, file, oidCount, oids: [{ name, oid }] }] }
 *
 * The index was built by a one-off regex scan of the MIB text (SMI
 * `OBJECT IDENTIFIER ::= { ... }` / `OBJECT-TYPE` / `MODULE-IDENTITY` /
 * `OBJECT-IDENTITY` / `NOTIFICATION-TYPE` / group blocks), with symbolic
 * parents resolved to dotted-numeric OIDs across all files. Anything that
 * could not be resolved is stored as `oid: null` — never invented.
 *
 * Honesty rules:
 *  - No hardcoded catalogue data lives in this file. Every name/OID comes
 *    from index.json, which comes from the MIB files on disk.
 *  - OIDs are stored WITHOUT a leading dot (e.g. "1.3.6.1.2.1.1.1").
 *    OBJECT-TYPE entries are the object-node OID; a scalar instance is
 *    that OID + ".0" at query time. searchOid() accepts a leading dot.
 *  - The same OID name can legitimately exist in several vendor MIBs with
 *    different numeric OIDs (e.g. `products`, `hostName`). searchOid()
 *    returns EVERY match with its module attached; it never picks one
 *    silently. Use getModule() + a module filter when a name is ambiguous.
 *  - Unknown modules / queries return null / [] — never a fabricated row.
 */

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_INDEX_PATH = path.join(__dirname, '..', 'data', 'mibs', 'index.json');

let cachedIndex = null;
let cachedPath = null;

/**
 * Load (and cache) the MIB index.
 * @param {string} [indexPath] - Override path, mainly for tests.
 * @returns {{ modules: Array<{module: string, file: string, oidCount: number, oids: Array<{name: string, oid: string|null}>}>, totalModules: number, totalOids: number, unresolvedCount: number }}
 * @throws {Error} If the index file is missing or not valid JSON / wrong shape.
 */
function loadIndex(indexPath = DEFAULT_INDEX_PATH) {
  const resolvedPath = path.resolve(indexPath);
  if (cachedIndex && cachedPath === resolvedPath) return cachedIndex;
  let raw;
  try {
    raw = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    throw new Error(`MIB index not found at ${resolvedPath} (${err.code || err.message}). Rebuild it from server/data/mibs/.`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`MIB index at ${resolvedPath} is not valid JSON: ${err.message}`);
  }
  if (!parsed || !Array.isArray(parsed.modules)) {
    throw new Error(`MIB index at ${resolvedPath} has unexpected shape: expected { modules: [...] }.`);
  }
  cachedIndex = parsed;
  cachedPath = resolvedPath;
  return cachedIndex;
}

/**
 * List every indexed module as a summary (no OID arrays).
 * @param {string} [indexPath] - Override path, mainly for tests.
 * @returns {Array<{module: string, file: string, oidCount: number}>}
 */
function listModules(indexPath) {
  return loadIndex(indexPath).modules.map((m) => ({
    module: m.module,
    file: m.file,
    oidCount: m.oidCount,
  }));
}

/**
 * Get one full module (with its OID list) by module name — case-insensitive.
 * Also matches the on-disk file name (e.g. "CISCO-STACK-MIB.my").
 * @param {string} name - Module name or file name.
 * @param {string} [indexPath] - Override path, mainly for tests.
 * @returns {{module: string, file: string, oidCount: number, oids: Array<{name: string, oid: string|null}>}|null}
 *          Null when no module matches; never a fabricated module.
 */
function getModule(name, indexPath) {
  if (typeof name !== 'string' || !name.trim()) return null;
  const wanted = name.trim().toLowerCase();
  const found = loadIndex(indexPath).modules.find(
    (m) => m.module.toLowerCase() === wanted || m.file.toLowerCase() === wanted,
  );
  if (!found) return null;
  // Return a copy so callers cannot mutate the cached index.
  return {
    module: found.module,
    file: found.file,
    oidCount: found.oidCount,
    oids: found.oids.map((o) => ({ name: o.name, oid: o.oid })),
  };
}

/**
 * Search OIDs by name or numeric OID.
 *  - Text query: case-insensitive substring match on the OID name
 *    (e.g. "sysDescr", "ciscoEnvMonTemperature").
 *  - Numeric query: prefix match on the dotted OID, with or without a
 *    leading dot (e.g. "1.3.6.1.2.1.1" or ".1.3.6.1.2.1.1").
 * @param {string} query - Name fragment or dotted OID (prefix).
 * @param {string} [indexPath] - Override path, mainly for tests.
 * @param {number} [limit=200] - Max results; the full index is ~22k OIDs.
 * @returns {Array<{module: string, file: string, name: string, oid: string|null}>}
 *          [] for an empty / non-string query or when nothing matches.
 */
function searchOid(query, indexPath, limit = 200) {
  if (typeof query !== 'string' || !query.trim()) return [];
  const q = query.trim();
  const max = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 200;
  const index = loadIndex(indexPath);
  const results = [];
  if (/^\.?[0-9][0-9.]*$/.test(q)) {
    // Numeric OID prefix search (leading dot optional).
    const needle = q.replace(/^\./, '');
    for (const m of index.modules) {
      for (const o of m.oids) {
        if (o.oid && (o.oid === needle || o.oid.startsWith(needle + '.'))) {
          results.push({ module: m.module, file: m.file, name: o.name, oid: o.oid });
          if (results.length >= max) return results;
        }
      }
    }
    return results;
  }
  const needle = q.toLowerCase();
  for (const m of index.modules) {
    for (const o of m.oids) {
      if (o.name.toLowerCase().includes(needle)) {
        results.push({ module: m.module, file: m.file, name: o.name, oid: o.oid });
        if (results.length >= max) return results;
      }
    }
  }
  return results;
}

module.exports = {
  DEFAULT_INDEX_PATH,
  loadIndex,
  listModules,
  getModule,
  searchOid,
};
