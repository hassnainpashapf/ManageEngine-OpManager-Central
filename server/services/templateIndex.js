'use strict';
/**
 * OpManager Central — device-template index (real-data branch).
 *
 * Pure read-only lookup layer over server/data/templates/index.json, the
 * generated index of the real on-disk vendor XML template library
 * (562 files, 12 MB, real sysOIDs). No fake data: every entry comes from a
 * file that parsed as well-formed XML, and lookups return empty results
 * when nothing matches.
 *
 * Index entry shape (one entry per XML file):
 *   { name, vendor, sysOid, sysOids, file, monitors, type,
 *     templates?, osType?, category? }
 *   - name:     templateName/displayName from the file, else filename stem.
 *               For vendors/*.xml bundles the name is the vendor; the
 *               contained template ids are in `templates`.
 *   - vendor:   Vendor vendorName / vendorid from file content, or the
 *               vendor-bundle filename; null when the file states none.
 *   - sysOid:   first sysObjectID for the template (from <NCMDeviceSysOID
 *               sysoid="..."> rows in the file itself, plus the
 *               DeviceSysOID.xml devicetemplateid mapping); null when none.
 *   - sysOids:  every sysObjectID for the template (a template covers
 *               many models, so usually more than one).
 *   - file:     path relative to server/data/templates/.
 *   - monitors: monitor/graph names listed in the file (Graph graphName,
 *               DevicePackageToGraph graphName, OpmCLICommand GraphName);
 *               [] for NCM config templates, which define backup/upload
 *               operations, not monitors.
 *   - type:     devicetemplate | vendor | monitors | commandset | config |
 *               credential | discovery | inventory | mib | sysOidMap.
 *
 * The index is generated (not hand-maintained) — see the build step in the
 * task report. If the XML library changes, regenerate index.json.
 */

const fs = require('node:fs');
const path = require('node:path');

const INDEX_PATH = path.join(__dirname, '..', 'data', 'templates', 'index.json');

let cachedIndex = null;

/**
 * Load the template index (cached after the first read).
 * Returns [] when index.json is missing or unreadable — never throws,
 * so a missing index degrades to "no templates" instead of crashing
 * the settings routes.
 * @returns {Array<Object>} index entries
 */
function loadIndex() {
  if (cachedIndex) return cachedIndex;
  try {
    const raw = fs.readFileSync(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    cachedIndex = Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    cachedIndex = [];
  }
  return cachedIndex;
}

/** Drop the cached index so the next loadIndex() re-reads index.json. */
function reloadIndex() {
  cachedIndex = null;
  return loadIndex();
}

function normName(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

function normOid(value) {
  // sysOIDs are stored with a leading dot (".1.3.6.1.4.1.9.1.215");
  // accept lookups with or without it.
  const s = String(value == null ? '' : value).trim();
  return s.startsWith('.') ? s : `.${s}`;
}

/**
 * Find one template by name (case-insensitive). Matches the entry `name`
 * first, then any id in `templates` (vendor bundles), then the filename
 * stem. Returns null when nothing matches.
 * @param {string} name
 * @returns {Object|null}
 */
function getTemplate(name) {
  const wanted = normName(name);
  if (!wanted) return null;
  const index = loadIndex();
  return (
    index.find((t) => normName(t.name) === wanted) ||
    index.find(
      (t) =>
        Array.isArray(t.templates) &&
        t.templates.some((id) => normName(id) === wanted)
    ) ||
    index.find((t) => {
      const stem = path.basename(t.file || '', '.xml');
      return normName(stem) === wanted;
    }) ||
    null
  );
}

/**
 * List templates, optionally filtered by vendor (case-insensitive exact
 * match). With no filter, returns every indexed entry.
 * @param {Object} [filter]
 * @param {string} [filter.vendor]
 * @param {string} [filter.type]
 * @returns {Array<Object>}
 */
function listTemplates(filter) {
  const index = loadIndex();
  const vendor = filter && filter.vendor ? normName(filter.vendor) : null;
  const type = filter && filter.type ? normName(filter.type) : null;
  return index.filter((t) => {
    if (vendor && normName(t.vendor) !== vendor) return false;
    if (type && normName(t.type) !== type) return false;
    return true;
  });
}

/**
 * Find every template whose sysOid list contains the given sysObjectID.
 * Accepts the OID with or without the leading dot. Returns [] when
 * nothing matches (e.g. unknown OID, or a template family with no
 * sysObjectID rows in the library).
 * @param {string} sysOid e.g. ".1.3.6.1.4.1.9.1.215" or "1.3.6.1.4.1.9.1.215"
 * @returns {Array<Object>}
 */
function findBySysOid(sysOid) {
  const wanted = normOid(sysOid);
  if (wanted === '.') return [];
  return loadIndex().filter(
    (t) =>
      (Array.isArray(t.sysOids) && t.sysOids.includes(wanted)) ||
      (t.sysOid && normOid(t.sysOid) === wanted)
  );
}

module.exports = { loadIndex, reloadIndex, getTemplate, listTemplates, findBySysOid };
