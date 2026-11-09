'use strict';
/**
 * AD / LDAP read routes — real LDAP binds and searches via the canonical
 * server/services/ldap.js (ldapjs, real wire protocol; Phase 4 merge).
 *
 *  GET /api/ad/users  — read-only user search (q / filter / base / limit)
 *  GET /api/ad/groups — read-only group listing + membership
 *
 * Auth: mounted behind the server's /api/* guard (index.js apiAuthGuard),
 * so a valid console session is required, exactly like the settings
 * routes. The bind password is NEVER stored: it must arrive per call in
 * the `x-ldap-bind-password` header, or the server must have the
 * LDAP_BIND_PASSWORD environment variable. It is never logged, echoed,
 * or written to the store. Connection settings come from the canonical
 * settings.ldap store object (url/bindDn/baseDn/groupBase/userFilter/
 * groupFilter), with the legacy auth.ad settings as a fallback.
 *
 * Response shapes are the ldap-routes shapes (users: dn/cn/
 * sAMAccountName/displayName/mail/userPrincipalName/distinguishedName/
 * memberOf + the canonical extras enabled/userAccountControl/
 * primaryGroupID/objectClass; groups: dn/cn/sAMAccountName/description/
 * distinguishedName/memberDns/memberCount/memberOf).
 */
const express = require('express');
const store = require('../services/store');
const ldapSvc = require('../services/ldap');

const router = express.Router();

function getStored(key) {
  const raw = store.getSetting(key);
  if (raw === null || raw === undefined) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

/** Effective config for this request; header password wins over env. */
function resolveConfig(req) {
  const cfg = ldapSvc.resolveLdapConfig({
    storedLdap: getStored('settings.ldap'),
    storedAd: getStored('auth.ad'),
    body: req.body || {},
  });
  const headerPassword = req.get('x-ldap-bind-password');
  if (headerPassword) cfg.password = headerPassword;
  if (req.query.bindDn) cfg.bindDn = String(req.query.bindDn);
  if (req.query.baseDn) cfg.baseDn = String(req.query.baseDn);
  if (req.query.url) {
    const parsed = ldapSvc.parseLdapUrl(String(req.query.url));
    cfg.url = parsed.url;
    cfg.host = parsed.host;
    cfg.port = parsed.port;
    cfg.tls = parsed.tls;
  }
  return cfg;
}

function ldapErrorResponse(res, err) {
  if (err instanceof ldapSvc.LdapError) {
    return res.status(err.status).json({
      status: 'error',
      error: err.code,
      message: err.message,
    });
  }
  return res.status(502).json({
    status: 'error',
    error: 'ldap_error',
    message: `LDAP operation failed: ${err && err.message ? err.message : String(err)}`,
  });
}

function parseLimit(req) {
  const n = Number(req.query.limit);
  if (!Number.isFinite(n) || n <= 0) return 100;
  return Math.min(Math.floor(n), 1000);
}

router.get('/api/ad/users', async (req, res) => {
  let cfg;
  try {
    cfg = resolveConfig(req);
  } catch (err) {
    return ldapErrorResponse(res, err);
  }
  if (!cfg.url) {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: 'No LDAP server is configured: set settings.ldap.url (POST /api/settings/auth/ldap) or pass ?url=ldap://host:389.',
    });
  }
  try {
    const q = req.query.q ? String(req.query.q) : undefined;
    const filter = req.query.filter ? String(req.query.filter) : undefined;
    const base = req.query.base ? String(req.query.base) : undefined;
    const t0 = Date.now();
    const users = await ldapSvc.searchUsers(cfg, cfg.password, {
      q,
      filter,
      baseDn: base,
      sizeLimit: parseLimit(req),
    });
    return res.json({
      status: 'success',
      source: { url: cfg.url, baseDn: base || cfg.baseDn, bindDn: cfg.bindDn },
      count: users.length,
      filter: ldapSvc.buildUserFilter(ldapSvc.normalizeConfig(cfg), { q, filter }),
      latencyMs: Date.now() - t0,
      users,
    });
  } catch (err) {
    return ldapErrorResponse(res, err);
  }
});

router.get('/api/ad/groups', async (req, res) => {
  let cfg;
  try {
    cfg = resolveConfig(req);
  } catch (err) {
    return ldapErrorResponse(res, err);
  }
  if (!cfg.url) {
    return res.status(501).json({
      status: 'error',
      error: 'not_implemented',
      message: 'No LDAP server is configured: set settings.ldap.url (POST /api/settings/auth/ldap) or pass ?url=ldap://host:389.',
    });
  }
  try {
    const q = req.query.q ? String(req.query.q) : undefined;
    const filter = req.query.filter ? String(req.query.filter) : undefined;
    const base = req.query.base ? String(req.query.base) : undefined;
    const t0 = Date.now();
    const groups = await ldapSvc.searchGroups(cfg, cfg.password, {
      q,
      filter,
      baseDn: base,
      sizeLimit: parseLimit(req),
    });
    return res.json({
      status: 'success',
      source: { url: cfg.url, baseDn: base || cfg.groupBase || cfg.baseDn, bindDn: cfg.bindDn },
      count: groups.length,
      filter: ldapSvc.buildGroupFilter(ldapSvc.normalizeConfig(cfg), { q, filter }),
      latencyMs: Date.now() - t0,
      // Canonical group objects carry `members`; the wire shape keeps
      // the ldap-routes `memberDns` name (plus sAMAccountName/memberOf).
      groups: groups.map((g) => ({
        dn: g.dn,
        cn: g.cn,
        sAMAccountName: g.sAMAccountName,
        description: g.description,
        distinguishedName: g.distinguishedName,
        memberDns: g.members,
        memberCount: g.memberCount,
        memberOf: g.memberOf,
      })),
    });
  } catch (err) {
    return ldapErrorResponse(res, err);
  }
});

module.exports = router;
