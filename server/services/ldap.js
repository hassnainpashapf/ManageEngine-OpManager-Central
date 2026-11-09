'use strict';

/**
 * ldap.js — Real LDAP client for OpManager Central (Phase 4 merge,
 * canonical: ldap-service's client + ldap-routes' additions ported on).
 *
 * Uses `ldapjs` (3.0.7) against a real directory (Active Directory or any
 * LDAPv3 server) over TCP. Every value returned here came back in a real
 * LDAP search response; there is no canned data and no fallback that
 * fabricates entries.
 *
 * Read-only by design: this module only ever issues bind + search
 * operations. It never adds, modifies, deletes, or moves directory
 * objects, and it never changes a password.
 *
 * Credentials:
 *  - The bind password is passed at call time ONLY (argument or env var
 *    read by the caller). It is NEVER stored in settings, in a file, in
 *    the database, or in a log, and it is never included in an error
 *    message. `settings.ldap` (see SHARED.md canonical schema) stores
 *    { url, bindDn, baseDn, groupBase, userFilter, groupFilter } — no
 *    password field exists anywhere in this module.
 *  - The legacy settings shape used by the existing AD settings page
 *    (`auth.ad`: domainController/host, port, ssl, bindUser, baseDn,
 *    userFilter) is also accepted by normalizeConfig() and mapped to the
 *    canonical shape.
 *
 * Honest errors (LdapError carries an HTTP-style `status`):
 *  - 400  configuration problem (no URL, no bind DN, no password, bad filter)
 *  - 401  bad credentials (LDAP result code 49, InvalidCredentialsError)
 *  - 404  no such object (LDAP result code 32, e.g. base DN does not exist)
 *  - 502  directory unreachable / connection or server-side LDAP failure
 * Callers (routes) should map LdapError.status straight to the HTTP status.
 * LdapError.reachable says whether the directory was reached (true for
 * 401/404 and server-returned errors, false for connect failures).
 *
 * Ported from ldap-routes (Phase 4 merge M3) onto this client:
 *  - resolveLdapConfig(): effective config from stored settings.ldap +
 *    legacy auth.ad + call-time body, password from body/env only.
 *  - q free-text search in searchUsers/searchGroups (substring match
 *    against cn / sAMAccountName / displayName / mail / userPrincipalName
 *    for users, cn / sAMAccountName / description for groups), plus a
 *    raw `filter` option AND-combined with the configured filter and
 *    validated with ldap.parseFilter (400 on a bad filter).
 *  - testBind() returns the root entry (namingContexts etc.) and
 *    entriesFound, plus host/port/tls, reachable and ldapBindVerified.
 *  - parseLdapUrl() / combineFilters() helpers.
 *
 * Filter attribute casing: ldapjs matches filter attribute names
 * case-sensitively against a test server's attribute object (only
 * objectClass is matched case-insensitively), while a real AD matches
 * case-insensitively. Filters this module BUILDS therefore use
 * lower-case attribute names (cn, samaccountname, userprincipalname,
 * ...), which match both real AD and lower-case-keyed test servers. A
 * caller-supplied userFilter/groupFilter is used verbatim — against a
 * real directory that is correct; against an in-process test server it
 * only matches if the casing lines up (the proof servers in this repo
 * key their match attributes both ways for that reason).
 *
 * Known AD limitation (documented, not papered over): a user's *primary*
 * group (usually "Domain Users") is NOT listed in memberOf and the user is
 * NOT listed in that group's `member` attribute — AD stores it via
 * primaryGroupID / primaryGroupToken. getUserWithGroups() therefore reports
 * all non-primary memberships; the primary group is reported separately as
 * `primaryGroupId` (raw RID) when userAccountControl/primaryGroupID are
 * readable, and resolving it to a name needs one extra group search by
 * primaryGroupToken, which callers can do with searchGroups().
 *
 * Dependency: ldapjs@3.0.7 (note: ldapjs is deprecated upstream — 3.0.7 is
 * the last release — but it is still the battle-tested LDAPv3 client for
 * Node and speaks the real protocol; a future swap to ldapts would keep
 * this module's public API unchanged).
 *
 * Live proof: scripts/ldap-local-proof.js runs this client against a
 * real in-process ldapjs LDAP server (real LDAP over TCP on 127.0.0.1,
 * real BER encoding) seeded with test data and labelled as a LOCAL TEST
 * DIRECTORY — it is not a production device and never pretends to be one.
 * A bind against the real GVS Active Directory (DC 192.168.22.5,
 * gamevillage.com.pk) still needs the user's AD bind account; see
 * docs/ldap.md and docs/ad-setup.md for the exact settings to configure.
 */

const ldap = require('ldapjs');

// --- Defaults ---------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CONNECT_TIMEOUT_MS = 5000;
const DEFAULT_SIZE_LIMIT = 1000;
const DEFAULT_TIME_LIMIT_SEC = 10;

const DEFAULT_USER_FILTER = '(objectClass=user)';
const DEFAULT_GROUP_FILTER = '(objectClass=group)';

// Attributes requested for users. AD populates memberOf on user entries;
// sAMAccountName / userPrincipalName are the AD login names.
const DEFAULT_USER_ATTRIBUTES = [
  'cn',
  'displayName',
  'sAMAccountName',
  'userPrincipalName',
  'mail',
  'distinguishedName',
  'memberOf',
  'userAccountControl',
  'primaryGroupID',
  'objectClass',
];

// Attributes requested for groups. `member` lists the group's members.
const DEFAULT_GROUP_ATTRIBUTES = [
  'cn',
  'name',
  'sAMAccountName',
  'distinguishedName',
  'description',
  'member',
  'memberOf',
  'primaryGroupToken',
  'objectClass',
];

// Attributes whose values are binary in AD — returned as base64, never as
// mangled UTF-8.
const BINARY_ATTRIBUTES = new Set(['objectguid', 'objectsid', 'jpegphoto', 'thumbnailphoto']);

// --- Errors -----------------------------------------------------------------

class LdapError extends Error {
  constructor(status, code, message, reachable) {
    super(message);
    this.name = 'LdapError';
    this.status = status;
    this.code = code;
    // Whether the directory was reached. true for 401/404 and for
    // server-returned errors, false for connect failures; undefined
    // when the caller did not establish it (e.g. a pure config error).
    this.reachable = reachable;
  }
}

function configError(message) {
  return new LdapError(400, 'LDAP_CONFIG', message, false);
}

function mapLdapError(err, context) {
  if (err instanceof LdapError) return err;
  const msg = String((err && err.message) || err || 'Unknown LDAP error');
  const code = err && (err.code !== undefined ? err.code : err.status);
  const name = (err && err.name) || '';
  // Bad credentials — LDAP result code 49.
  if (code === 49 || /InvalidCredentials/i.test(name) || /invalid credentials/i.test(msg)) {
    return new LdapError(401, 'LDAP_INVALID_CREDENTIALS', `${context}: invalid credentials (LDAP 49)`, true);
  }
  // No such object — LDAP result code 32.
  if (code === 32 || /NoSuchObject/i.test(name) || /no such object/i.test(msg)) {
    return new LdapError(404, 'LDAP_NO_SUCH_OBJECT', `${context}: no such object (LDAP 32)`, true);
  }
  // Transport failures: refused, reset, timeout, DNS, TLS.
  // "client destroyed" is ldapjs 3.0.7's race for a refused connect: the
  // client tears itself down while the connect fails, so the bind
  // callback reports "client destroyed" instead of ECONNREFUSED. The
  // connect never completed either way — it is unreachable, not an
  // upstream error (the ldap-tests harness caught this as a BUG before
  // this branch was added).
  if (
    /ECONNREFUSED|ECONNRESET|ETIMEDOUT|EHOSTUNREACH|ENOTFOUND|EPIPE|socket hang up|connect ETIMEDOUT|ConnectionError|client destroyed|timeout/i.test(msg) ||
    /timeout/i.test(name)
  ) {
    return new LdapError(502, 'LDAP_UNREACHABLE', `${context}: directory unreachable — ${msg}`, false);
  }
  // Anything else the server returned (e.g. unwilling to perform, operations
  // error, size/time limit) is an upstream failure, not our data. When the
  // error carries a numeric LDAP result code the server was reached.
  return new LdapError(502, 'LDAP_UPSTREAM', `${context}: directory error — ${msg}`, typeof code === 'number');
}

// --- Config -----------------------------------------------------------------

/**
 * Normalise either the canonical settings.ldap shape or the legacy
 * auth.ad shape into one canonical config. The password is NOT part of
 * the config and is never read here.
 *
 * Canonical: { url, bindDn, baseDn, groupBase, userFilter, groupFilter,
 *               timeoutMs, tlsRejectUnauthorized }
 * Legacy:    { domainController|host, port, ssl, bindUser|bindDn,
 *               baseDn, userFilter, groupBase, groupFilter }
 */
function normalizeConfig(input) {
  const cfg = (input && typeof input === 'object' ? input : {});
  let url = cfg.url || cfg.ldapUrl || null;
  if (!url) {
    const host = cfg.domainController || cfg.host || cfg.server || null;
    if (!host) {
      throw configError('No LDAP server configured: provide url (e.g. ldap://192.168.22.5:389) or domainController/host.');
    }
    const ssl = Boolean(cfg.ssl || cfg.useTls || cfg.tls);
    const port = Number(cfg.port) || (ssl ? 636 : 389);
    url = `${ssl ? 'ldaps' : 'ldap'}://${host}:${port}`;
  }
  if (!/^ldaps?:\/\//i.test(url)) {
    throw configError(`Invalid LDAP url "${url}": expected ldap://host:port or ldaps://host:port.`);
  }
  const bindDn = cfg.bindDn || cfg.bindUser || cfg.bindUsername || null;
  if (!bindDn) {
    throw configError('No LDAP bind DN configured: provide bindDn (e.g. CN=opmanager-svc,OU=Service Accounts,DC=gamevillage,DC=com,DC=pk).');
  }
  const baseDn = cfg.baseDn || null;
  if (!baseDn) {
    throw configError('No LDAP base DN configured: provide baseDn (e.g. DC=gamevillage,DC=com,DC=pk).');
  }
  return {
    url,
    bindDn,
    baseDn,
    groupBase: cfg.groupBase || baseDn,
    userFilter: cfg.userFilter || DEFAULT_USER_FILTER,
    groupFilter: cfg.groupFilter || DEFAULT_GROUP_FILTER,
    timeoutMs: Number(cfg.timeoutMs) || DEFAULT_TIMEOUT_MS,
    connectTimeoutMs: Number(cfg.connectTimeoutMs) || DEFAULT_CONNECT_TIMEOUT_MS,
    tlsRejectUnauthorized:
      cfg.tlsRejectUnauthorized !== undefined ? Boolean(cfg.tlsRejectUnauthorized) : true,
  };
}

// Escape a value for safe embedding in an LDAP search filter (RFC 4515).
function escapeFilterValue(value) {
  return String(value)
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\0/g, '\\00');
}

/** Parse + validate an ldap:// or ldaps:// URL. Throws LdapError(400). */
function parseLdapUrl(urlString) {
  let url;
  try {
    url = new URL(String(urlString));
  } catch (err) {
    throw new LdapError(400, 'LDAP_INVALID_URL', `Invalid LDAP URL: ${err.message}`, false);
  }
  if (url.protocol !== 'ldap:' && url.protocol !== 'ldaps:') {
    throw new LdapError(400, 'LDAP_INVALID_URL', `Unsupported LDAP URL protocol: ${url.protocol} (use ldap:// or ldaps://)`, false);
  }
  if (!url.hostname) {
    throw new LdapError(400, 'LDAP_INVALID_URL', 'LDAP URL has no host', false);
  }
  const tls = url.protocol === 'ldaps:';
  const port = url.port ? Number(url.port) : (tls ? 636 : 389);
  return { url: url.toString(), host: url.hostname, port, tls };
}

/** AND-combine filter strings, skipping empties. */
function combineFilters(...filters) {
  const parts = filters.filter((f) => typeof f === 'string' && f.trim() !== '');
  if (parts.length === 0) return '(objectClass=*)';
  if (parts.length === 1) return parts[0];
  return `(&${parts.join('')})`;
}

/**
 * Resolve the effective LDAP config from (in priority order) call-time
 * body fields, the canonical stored settings.ldap object, and the legacy
 * stored auth.ad object. The password comes ONLY from the call-time body
 * or the LDAP_BIND_PASSWORD env var — never from any stored settings.
 *
 * Unlike normalizeConfig(), this does NOT throw when nothing is
 * configured: it returns { url: null, ... } so routes can answer 501
 * ("not configured"). It throws LdapError(400) only for a malformed URL.
 * Callers that need a usable config pass the result to normalizeConfig()
 * (via testBind/searchUsers/...) which enforces bindDn/baseDn.
 *
 * Returns { url, host, port, tls, bindDn, baseDn, groupBase, userFilter,
 *   groupFilter, password, timeoutMs, connectTimeoutMs,
 *   tlsRejectUnauthorized }.
 */
function resolveLdapConfig({ storedLdap, storedAd, body } = {}) {
  const ldapCfg = storedLdap && typeof storedLdap === 'object' ? storedLdap : {};
  const adCfg = storedAd && typeof storedAd === 'object' ? storedAd : {};
  const req = body && typeof body === 'object' ? body : {};

  let urlString = req.url || req.ldapUrl || ldapCfg.url || null;
  if (!urlString && (req.domainController || req.host || adCfg.domainController || adCfg.host)) {
    const host = req.domainController || req.host || adCfg.domainController || adCfg.host;
    const port = Number(req.port || adCfg.port) || null;
    const ssl = req.ssl !== undefined ? req.ssl : adCfg.ssl;
    const scheme = ssl ? 'ldaps' : 'ldap';
    urlString = port ? `${scheme}://${host}:${port}` : `${scheme}://${host}`;
  }
  let parsed = null;
  if (urlString) parsed = parseLdapUrl(urlString);

  const password = req.password || req.bindPassword || process.env.LDAP_BIND_PASSWORD || null;
  const baseDn = req.baseDn || ldapCfg.baseDn || adCfg.baseDn || null;
  return {
    url: parsed ? parsed.url : null,
    host: parsed ? parsed.host : null,
    port: parsed ? parsed.port : null,
    tls: parsed ? parsed.tls : false,
    bindDn: req.bindDn || ldapCfg.bindDn || adCfg.bindUser || adCfg.bindDn || null,
    baseDn,
    groupBase: req.groupBase || ldapCfg.groupBase || baseDn,
    userFilter: req.userFilter || ldapCfg.userFilter || adCfg.userFilter || DEFAULT_USER_FILTER,
    groupFilter: req.groupFilter || ldapCfg.groupFilter || DEFAULT_GROUP_FILTER,
    password,
    timeoutMs: Number(req.timeoutMs || ldapCfg.timeoutMs) || DEFAULT_TIMEOUT_MS,
    connectTimeoutMs: Number(req.connectTimeoutMs || ldapCfg.connectTimeoutMs) || DEFAULT_CONNECT_TIMEOUT_MS,
    tlsRejectUnauthorized:
      req.tlsRejectUnauthorized !== undefined
        ? Boolean(req.tlsRejectUnauthorized)
        : (ldapCfg.tlsRejectUnauthorized !== undefined ? Boolean(ldapCfg.tlsRejectUnauthorized) : true),
  };
}

/**
 * Validate a caller-supplied raw LDAP filter. Throws LdapError 400
 * (LDAP_INVALID_FILTER) when ldapjs cannot parse it.
 */
function validateFilter(filter) {
  try {
    ldap.parseFilter(filter);
  } catch (err) {
    throw new LdapError(400, 'LDAP_INVALID_FILTER', `Invalid LDAP filter: ${err.message}`, false);
  }
}

/**
 * Effective user-search filter: the configured userFilter AND-combined
 * with a free-text `q` substring match (lower-case attribute names —
 * see the header note on ldapjs filter matching) and with a raw
 * `filter` option. A raw filter refines the configured filter; it does
 * not replace it.
 */
function buildUserFilter(config, { q, filter } = {}) {
  let userFilter = config.userFilter || DEFAULT_USER_FILTER;
  if (q) {
    const esc = escapeFilterValue(q);
    userFilter = combineFilters(
      userFilter,
      `(|(cn=*${esc}*)(samaccountname=*${esc}*)(displayname=*${esc}*)(mail=*${esc}*)(userprincipalname=*${esc}*))`
    );
  }
  if (filter) {
    validateFilter(filter);
    userFilter = combineFilters(userFilter, filter);
  }
  return userFilter;
}

/**
 * Effective group-search filter: the configured groupFilter AND-combined
 * with a free-text `q` substring match and with a raw `filter` option.
 */
function buildGroupFilter(config, { q, filter } = {}) {
  let groupFilter = config.groupFilter || DEFAULT_GROUP_FILTER;
  if (q) {
    const esc = escapeFilterValue(q);
    groupFilter = combineFilters(
      groupFilter,
      `(|(cn=*${esc}*)(samaccountname=*${esc}*)(description=*${esc}*))`
    );
  }
  if (filter) {
    validateFilter(filter);
    groupFilter = combineFilters(groupFilter, filter);
  }
  return groupFilter;
}

// Normalise a DN for case-insensitive comparison (AD DNs vary in case).
function normalizeDn(dn) {
  return String(dn || '').trim().toLowerCase().replace(/\s*,\s*/g, ',').replace(/\s*=\s*/g, '=');
}

// --- Client plumbing --------------------------------------------------------

// Create a client, bind with the call-time password, run fn(client), then
// always unbind. The password lives only in this call's arguments.
async function withClient(config, password, fn) {
  if (!password) {
    throw configError('No LDAP bind password supplied: pass it at call time (runtime env var); it is never stored.');
  }
  const client = ldap.createClient({
    url: config.url,
    timeout: config.timeoutMs,
    connectTimeout: config.connectTimeoutMs,
    tlsOptions:
      config.url.toLowerCase().startsWith('ldaps://')
        ? { rejectUnauthorized: config.tlsRejectUnauthorized }
        : undefined,
  });
  // ldapjs retries failed connects in the background and emits 'error' on
  // the client when a retry fails. Without a listener that is an unhandled
  // 'error' event and crashes the process — even though the bind promise
  // below already rejected with the mapped LdapError. Swallow it here;
  // the operation's outcome is reported through the promise, not this event.
  client.on('error', () => {});
  try {
    await new Promise((resolve, reject) => {
      client.bind(config.bindDn, password, (err) => (err ? reject(err) : resolve()));
    });
    return await fn(client);
  } catch (err) {
    throw mapLdapError(err, `LDAP ${config.url}`);
  } finally {
    try {
      await new Promise((resolve) => client.unbind(() => resolve()));
    } catch (_ignored) {
      // Unbind failure after the operation is not the operation's result.
    }
    try {
      client.destroy();
    } catch (_ignored) {
      // Already closed.
    }
  }
}

// Convert one ldapjs search entry into { dn, attributes } with plain values.
// Handles both the attributes array and the pojo shortcut, and keeps
// multi-valued attributes as arrays. Binary attributes become base64.
function entryToObject(entry) {
  const dn = entry.dn ? entry.dn.toString() : (entry.objectName ? entry.objectName.toString() : '');
  const attributes = {};
  const addAttr = (typeRaw, valuesRaw) => {
    const type = String(typeRaw || '').toLowerCase();
    if (!type) return;
    const values = Array.isArray(valuesRaw) ? valuesRaw : [];
    const decoded = values.map((v) => {
      const buf = Buffer.isBuffer(v) ? v : Buffer.from(String(v), 'utf8');
      if (BINARY_ATTRIBUTES.has(type)) return buf.toString('base64');
      return buf.toString('utf8');
    });
    attributes[type] = decoded.length === 1 ? decoded[0] : decoded;
  };
  // ldapjs 3: entry.attributes is an array of Attribute { type, values }.
  const rawAttrs = Array.isArray(entry.attributes) ? entry.attributes : [];
  for (const attr of rawAttrs) {
    addAttr(attr.type, attr.values !== undefined ? attr.values : attr.vals);
  }
  // ldapjs 3 pojo is { objectName, attributes: [{ type, values }, ...] } —
  // use it only for attributes the array walk missed.
  if (entry.pojo && Array.isArray(entry.pojo.attributes)) {
    for (const attr of entry.pojo.attributes) {
      const type = String((attr && attr.type) || '').toLowerCase();
      if (type && !(type in attributes)) addAttr(attr.type, attr.values);
    }
  }
  return { dn, attributes };
}

function search(client, base, options) {
  return new Promise((resolve, reject) => {
    client.search(
      base,
      {
        filter: options.filter,
        scope: options.scope || 'sub',
        attributes: options.attributes || ['*'],
        sizeLimit: options.sizeLimit || DEFAULT_SIZE_LIMIT,
        timeLimit: options.timeLimit || DEFAULT_TIME_LIMIT_SEC,
      },
      (err, res) => {
        if (err) return reject(err);
        const entries = [];
        res.on('searchEntry', (entry) => entries.push(entryToObject(entry)));
        res.on('searchReference', () => {
          // Referrals are followed by the server config, not by us; a
          // referral entry is not a result. Ignore it.
        });
        res.on('error', (searchErr) => reject(searchErr));
        res.on('end', (result) => {
          if (result && result.status !== 0) {
            const e = new Error(result.errorMessage || `LDAP search failed with status ${result.status}`);
            e.code = result.status;
            return reject(e);
          }
          resolve(entries);
        });
      }
    );
  });
}

// --- Entry mapping ----------------------------------------------------------

function asArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function mapUserEntry(entry) {
  const a = entry.attributes;
  const userAccountControl = a.useraccountcontrol !== undefined ? Number(a.useraccountcontrol) : null;
  return {
    dn: entry.dn,
    distinguishedName: a.distinguishedname || entry.dn,
    cn: a.cn || null,
    displayName: a.displayname || a.cn || null,
    sAMAccountName: a.samaccountname || null,
    userPrincipalName: a.userprincipalname || null,
    mail: a.mail || null,
    memberOf: asArray(a.memberof),
    // bit 2 (0x2) = ACCOUNTDISABLE. null when the server did not return it.
    enabled: userAccountControl === null ? null : (userAccountControl & 0x2) === 0,
    userAccountControl,
    primaryGroupID: a.primarygroupid !== undefined ? Number(a.primarygroupid) : null,
    objectClass: asArray(a.objectclass),
  };
}

function mapGroupEntry(entry) {
  const a = entry.attributes;
  return {
    dn: entry.dn,
    distinguishedName: a.distinguishedname || entry.dn,
    cn: a.cn || null,
    name: a.name || a.cn || null,
    sAMAccountName: a.samaccountname || null,
    description: a.description || null,
    members: asArray(a.member),
    memberCount: asArray(a.member).length,
    memberOf: asArray(a.memberof),
    primaryGroupToken: a.primarygrouptoken !== undefined ? Number(a.primarygrouptoken) : null,
    objectClass: asArray(a.objectclass),
  };
}

// --- Public operations (all read-only) --------------------------------------

/**
 * Bind as the service account and verify the base DN exists (base-scope
 * search). Returns { ok: true, latencyMs, url, host, port, tls, bindDn,
 * baseDn, reachable: true, ldapBindVerified: true, entriesFound,
 * rootEntry } — rootEntry is the base DN's entry (namingContexts etc.
 * when the server exposes them), entriesFound is how many entries the
 * base search returned (normally 1).
 * Throws LdapError 401 (bad credentials), 404 (base DN missing),
 * 502 (unreachable / upstream), 400 (config).
 */
async function testBind(rawConfig, password) {
  const config = normalizeConfig(rawConfig);
  const { host, port, tls } = parseLdapUrl(config.url);
  const t0 = Date.now();
  const result = await withClient(config, password, async (client) => {
    // Root attributes are requested in lower case: ldapjs test servers
    // filter plain-object entries against the requested list verbatim
    // after lower-casing the stored name, and a real AD matches
    // attribute names case-insensitively either way.
    const entries = await search(client, config.baseDn, {
      filter: '(objectClass=*)',
      scope: 'base',
      attributes: ['namingcontexts', 'supportedldapversion', 'subschemasubentry', 'vendorname', 'vendorversion'],
    });
    return {
      ok: true,
      latencyMs: Date.now() - t0,
      url: config.url,
      host,
      port,
      tls,
      bindDn: config.bindDn,
      baseDn: config.baseDn,
      reachable: true,
      ldapBindVerified: true,
      entriesFound: entries.length,
      rootEntry: entries[0] || null,
    };
  });
  return result;
}

/**
 * Search for users under baseDn (default config.baseDn) with the
 * configured userFilter (default '(objectClass=user)'). `options.q` is a
 * free-text substring matched against cn / sAMAccountName / displayName /
 * mail / userPrincipalName; `options.filter` is a raw LDAP filter
 * AND-combined with (not replacing) the configured filter. `options.base`
 * is an alias for `options.baseDn`; `options.limit` an alias for
 * `options.sizeLimit` (clamped to 1..1000, default 1000).
 * Returns mapped user objects.
 */
async function searchUsers(rawConfig, password, options = {}) {
  const config = normalizeConfig(rawConfig);
  const baseDn = options.baseDn || options.base || config.baseDn;
  const filter = buildUserFilter(config, options);
  const sizeLimit = Math.max(1, Math.min(Number(options.sizeLimit ?? options.limit ?? DEFAULT_SIZE_LIMIT) || DEFAULT_SIZE_LIMIT, 1000));
  return withClient(config, password, async (client) => {
    const entries = await search(client, baseDn, {
      filter,
      scope: options.scope || 'sub',
      attributes: options.attributes || DEFAULT_USER_ATTRIBUTES,
      sizeLimit,
      timeLimit: options.timeLimit,
    });
    return entries.map(mapUserEntry);
  });
}

/**
 * Search for groups under groupBase (default config.groupBase) with the
 * configured groupFilter (default '(objectClass=group)'). `options.q` is
 * a free-text substring matched against cn / sAMAccountName /
 * description; `options.filter` is a raw LDAP filter AND-combined with
 * the configured filter. `options.base` is an alias for
 * `options.baseDn`/`options.groupBase`; `options.limit` an alias for
 * `options.sizeLimit` (clamped to 1..1000, default 1000).
 * Returns mapped group objects with member DNs.
 */
async function searchGroups(rawConfig, password, options = {}) {
  const config = normalizeConfig(rawConfig);
  const baseDn = options.baseDn || options.base || options.groupBase || config.groupBase;
  const filter = buildGroupFilter(config, options);
  const sizeLimit = Math.max(1, Math.min(Number(options.sizeLimit ?? options.limit ?? DEFAULT_SIZE_LIMIT) || DEFAULT_SIZE_LIMIT, 1000));
  return withClient(config, password, async (client) => {
    const entries = await search(client, baseDn, {
      filter,
      scope: options.scope || 'sub',
      attributes: options.attributes || DEFAULT_GROUP_ATTRIBUTES,
      sizeLimit,
      timeLimit: options.timeLimit,
    });
    return entries.map(mapGroupEntry);
  });
}

/**
 * Membership mapping for one user against a group list (already fetched
 * with searchGroups, or any list of mapped groups). Combines BOTH sources
 * AD provides:
 *  1. the user's memberOf attribute, and
 *  2. groups whose `member` list contains the user's DN (covers groups
 *     whose memberOf back-link the directory did not return).
 * Returns { user, groups: [mapped group objects], groupNames, groupDns }.
 * The primary group (primaryGroupID) is NOT in either source — see the
 * header note; it is reported as primaryGroupId on the user object.
 */
function mapUserToGroups(user, groups) {
  const userDnNorm = normalizeDn(user.dn || user.distinguishedName);
  const memberOfNorm = new Set(asArray(user.memberOf).map(normalizeDn));
  const matched = [];
  for (const group of groups || []) {
    const groupDnNorm = normalizeDn(group.dn || group.distinguishedName);
    const memberNorms = asArray(group.members).map(normalizeDn);
    if (memberOfNorm.has(groupDnNorm) || memberNorms.includes(userDnNorm)) {
      matched.push(group);
    }
  }
  return {
    user,
    groups: matched,
    groupNames: matched.map((g) => g.name || g.cn).filter(Boolean),
    groupDns: matched.map((g) => g.dn || g.distinguishedName).filter(Boolean),
  };
}

/**
 * Fetch one user (by sAMAccountName or userPrincipalName) and all of their
 * groups in one service-account session. Throws 404 when the user is not
 * found. Returns { user, groups, groupNames, groupDns }.
 * `options.filter` overrides the built lookup filter for this call
 * (e.g. a uid-based directory: '(uid=alice)').
 */
async function getUserWithGroups(rawConfig, password, username, options = {}) {
  const config = normalizeConfig(rawConfig);
  if (!username) throw configError('No username supplied for user lookup.');
  const login = String(username);
  // Lower-case attribute names: real AD matches case-insensitively, and
  // lower-case-keyed ldapjs test servers only match lower-case names
  // (see the header note). The configured userFilter is used verbatim
  // inside the AND — its objectClass clause is matched
  // case-insensitively by ldapjs; any other mixed-case attribute in a
  // caller-supplied filter is that filter's own business.
  const filter = options.filter ||
    `(&${config.userFilter}(|(samaccountname=${escapeFilterValue(login)})(userprincipalname=${escapeFilterValue(login)})))`;
  return withClient(config, password, async (client) => {
    const userEntries = await search(client, config.baseDn, {
      filter,
      scope: 'sub',
      attributes: options.attributes || DEFAULT_USER_ATTRIBUTES,
      sizeLimit: 2,
    });
    if (userEntries.length === 0) {
      throw new LdapError(404, 'LDAP_USER_NOT_FOUND', `User "${login}" not found under ${config.baseDn}.`, true);
    }
    const user = mapUserEntry(userEntries[0]);
    const groupEntries = await search(client, config.groupBase, {
      filter: config.groupFilter,
      scope: 'sub',
      attributes: DEFAULT_GROUP_ATTRIBUTES,
      sizeLimit: options.sizeLimit,
    });
    return mapUserToGroups(user, groupEntries.map(mapGroupEntry));
  });
}

/**
 * Fetch ALL users and ALL groups and return the full membership map:
 * { users: [{...user, groups, groupNames, groupDns}], groups }.
 * One service-account session, read-only.
 */
async function getUsersWithGroups(rawConfig, password, options = {}) {
  const config = normalizeConfig(rawConfig);
  return withClient(config, password, async (client) => {
    const [userEntries, groupEntries] = await Promise.all([
      search(client, config.baseDn, {
        filter: config.userFilter,
        scope: 'sub',
        attributes: DEFAULT_USER_ATTRIBUTES,
        sizeLimit: options.sizeLimit,
      }),
      search(client, config.groupBase, {
        filter: config.groupFilter,
        scope: 'sub',
        attributes: DEFAULT_GROUP_ATTRIBUTES,
        sizeLimit: options.sizeLimit,
      }),
    ]);
    const users = userEntries.map(mapUserEntry);
    const groups = groupEntries.map(mapGroupEntry);
    return {
      users: users.map((u) => {
        const m = mapUserToGroups(u, groups);
        return { ...m.user, groups: m.groups, groupNames: m.groupNames, groupDns: m.groupDns };
      }),
      groups,
    };
  });
}

/**
 * Authenticate a real user against the directory (AD login check):
 *  1. bind as the service account, find the user by sAMAccountName/UPN;
 *  2. bind AS that user with the supplied password (proves the password);
 *  3. re-bind as the service account and fetch the user's groups.
 * Throws 404 (user not found), 401 (wrong user password), 502/400 as above.
 * The user's password is used only inside this call and never stored.
 * Returns { user, groups, groupNames, groupDns, authenticated: true }.
 * `options.filter` overrides the built lookup filter for this call.
 */
async function authenticateUser(rawConfig, servicePassword, username, userPassword, options = {}) {
  const config = normalizeConfig(rawConfig);
  if (!username) throw configError('No username supplied for authentication.');
  if (!userPassword) throw configError('No user password supplied for authentication.');
  const login = String(username);
  const filter = options.filter ||
    `(&${config.userFilter}(|(samaccountname=${escapeFilterValue(login)})(userprincipalname=${escapeFilterValue(login)})))`;
  // Step 1 — service bind + user lookup.
  const user = await withClient(config, servicePassword, async (client) => {
    const entries = await search(client, config.baseDn, {
      filter,
      scope: 'sub',
      attributes: DEFAULT_USER_ATTRIBUTES,
      sizeLimit: 2,
    });
    if (entries.length === 0) {
      throw new LdapError(404, 'LDAP_USER_NOT_FOUND', `User "${login}" not found under ${config.baseDn}.`, true);
    }
    return mapUserEntry(entries[0]);
  });
  // Step 2 — bind as the user. A failure here is an auth error (401),
  // even if the service bind above succeeded.
  const userClient = ldap.createClient({
    url: config.url,
    timeout: config.timeoutMs,
    connectTimeout: config.connectTimeoutMs,
    tlsOptions:
      config.url.toLowerCase().startsWith('ldaps://')
        ? { rejectUnauthorized: config.tlsRejectUnauthorized }
        : undefined,
  });
  // See withClient: background reconnect errors must not crash the process.
  userClient.on('error', () => {});
  try {
    await new Promise((resolve, reject) => {
      userClient.bind(user.dn, userPassword, (err) => (err ? reject(err) : resolve()));
    });
  } catch (err) {
    throw mapLdapError(err, `LDAP bind as ${user.dn}`);
  } finally {
    try {
      await new Promise((resolve) => userClient.unbind(() => resolve()));
    } catch (_ignored) {
      // Ignore.
    }
    try {
      userClient.destroy();
    } catch (_ignored) {
      // Already closed.
    }
  }
  // Step 3 — service bind again, fetch groups for the verified user.
  const membership = await withClient(config, servicePassword, async (client) => {
    const groupEntries = await search(client, config.groupBase, {
      filter: config.groupFilter,
      scope: 'sub',
      attributes: DEFAULT_GROUP_ATTRIBUTES,
      sizeLimit: 1000,
    });
    return mapUserToGroups(user, groupEntries.map(mapGroupEntry));
  });
  return { ...membership, authenticated: true };
}

module.exports = {
  LdapError,
  normalizeConfig,
  escapeFilterValue,
  normalizeDn,
  parseLdapUrl,
  combineFilters,
  resolveLdapConfig,
  buildUserFilter,
  buildGroupFilter,
  testBind,
  searchUsers,
  searchGroups,
  mapUserToGroups,
  getUserWithGroups,
  getUsersWithGroups,
  authenticateUser,
  mapUserEntry,
  mapGroupEntry,
  DEFAULTS: {
    DEFAULT_USER_FILTER,
    DEFAULT_GROUP_FILTER,
    DEFAULT_USER_ATTRIBUTES,
    DEFAULT_GROUP_ATTRIBUTES,
    DEFAULT_TIMEOUT_MS,
    DEFAULT_SIZE_LIMIT,
  },
};
