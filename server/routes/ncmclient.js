'use strict';
/**
 * OpManager Central — NCM client service data (real-data branch).
 *
 * Rebuilt from the 2026-11-09 fake-data audits (ncm-traps-zia.md N1–N20,
 * auth.md A-10/A-11). Every value below comes from the authenticated
 * session (req.user) or from server/services/store.js (SQLite). Nothing is
 * hardcoded: no fixed administrator identity, no fixed licence, no invented
 * dashboards/views/maps, no invented CVEs or EOL dates, and no CSRF cookie
 * is issued here. The security score, compliance verdicts and config-change
 * counts (HE-3b, Phase 5) are computed from stored rows by the engines
 * below; the CVE severity counts and the upcoming-EOL list stay
 * honest-empty because no vulnerability feed or lifecycle catalogue
 * exists anywhere in the repo (see those handlers).
 *
 * Conventions:
 *  - Auth: the auth layer's requireAuth middleware (mounted in
 *    server/index.js) sets req.user. Until it is mounted this router fails
 *    closed: any request without req.user gets 401. Identity and
 *    permissions are derived from req.user.role ONLY.
 *  - Absent data is null (scalars/objects) or [] (lists) — never an
 *    invented value. Fields whose data source does not exist yet keep
 *    their old name with a null value, or are dropped when the whole
 *    object has no source (rebrandMeta, mspMeta); see the report.
 *  - Store access honours both the flat exports of store.js and the
 *    namespaced form (store.users.* etc.), matching server/routes/ccm.js
 *    and server/routes/diff.js, so this route keeps working if the store
 *    is refactored to namespaces later.
 *  - Endpoint paths are unchanged. Response shapes are unchanged except
 *    where noted in the report (licenseMeta/rebrandMeta/mspMeta are null
 *    without a stored licence/rebrand/tenant; SecurityScore fields null;
 *    EOL counts null; StartupRunning versions null).
 */
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const router = express.Router();
const store = require('../services/store');
const consoleMessages = require('../services/consoleMessages');
const pkg = require('../../package.json');

// ---------------------------------------------------------- store access ---

const getUserByUsername = (username) =>
  (store.users ? store.users.getUserByUsername(username) : store.getUserByUsername(username));
const listDevices = () =>
  (store.devices ? store.devices.listDevices() : store.listDevices());
const getDevice = (id) =>
  (store.devices ? store.devices.getDevice(id) : store.getDevice(id));
const listProbes = () =>
  (store.probes ? store.probes.listProbes() : store.listProbes());
const getConfigs = (deviceId, type) =>
  (store.configs ? store.configs.getConfigs(deviceId, type) : store.getConfigs(deviceId, type));
const getLatestConfig = (deviceId, type) =>
  (store.configs
    ? store.configs.getLatestConfig(deviceId, type)
    : store.getLatestConfig(deviceId, type));
const getSetting = (key) =>
  (store.settings ? store.settings.getSetting(key) : store.getSetting(key));
const setSetting = (key, value) =>
  (store.settings ? store.settings.setSetting(key, value) : store.setSetting(key, value));
const listRacks = () =>
  (store.racks ? store.racks.listRacks() : store.listRacks());
const getRack = (id) =>
  (store.racks ? store.racks.getRack(id) : store.getRack(id));
const listAlarms = (filter) =>
  (store.alarms ? store.alarms.listAlarms(filter) : store.listAlarms(filter));

// ------------------------------------------------------------------ auth ---

// Fail closed: without an authenticated session there is no identity to
// return, so no endpoint in this router serves unauthenticated callers
// (audit A-08/A-11). requireAuth (auth agent) sets req.user upstream.
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
  next();
});

// ------------------------------------------------------------ permissions ---

// Permissions derive from the user's stored role ONLY — never all-true.
// SuperAdmin / Administrator / 'admin': full access. Operator: read-only.
// Any other/unknown role: no permissions (fail closed).
// (HE-3a: 'admin' is included because it IS the administrative role in
// this codebase — the bootstrap admin is created with role 'admin', and
// server/services/session.js documents "'admin' and 'SuperAdmin' are
// treated as the same administrative role". Without it the seeded admin
// got zero permissions from this function while requireRole('admin')
// elsewhere treated them as admin.)
const READ_PERMS = [
  'dashboardRead', 'inventoryRead', 'alarmsRead', 'reportsRead',
  'settingsRead', 'enterpriseSettingsRead', 'ncmDevMgmtRead', 'ncmConfigRead'
];
const WRITE_PERMS = [
  'dashboardWrite', 'inventoryWrite', 'alarmsWrite', 'reportsWrite',
  'settingsWrite', 'enterpriseSettingsWrite', 'ncmDevMgmtWrite', 'ncmConfigWrite'
];

function permissionsForRole(role) {
  const perms = {};
  for (const p of [...READ_PERMS, ...WRITE_PERMS]) perms[p] = false;
  if (role === 'SuperAdmin' || role === 'Administrator' || role === 'admin') {
    for (const p of Object.keys(perms)) perms[p] = true;
  } else if (role === 'Operator') {
    for (const p of READ_PERMS) perms[p] = true;
  }
  return perms;
}

// ------------------------------------------------- settings-JSON stores ---

// Dashboards, custom views, floors and logical groups have no dedicated
// tables; like racks.js (rack_assignments) they persist as JSON arrays
// under settings keys. Every list below returns only what was actually
// created — an empty store honestly returns [].
const CUSTOM_DASHBOARDS_KEY = 'custom_dashboards';
const CUSTOM_VIEWS_KEY = 'custom_views';
const FLOORS_KEY = 'floors';
const LOGICAL_GROUPS_KEY = 'logical_groups';

function loadJsonList(key) {
  const raw = getSetting(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e === 'object') : [];
  } catch (e) {
    return [];
  }
}

function saveJsonList(key, items) {
  setSetting(key, items);
}

function nextJsonId(items) {
  let max = 0;
  for (const item of items) {
    if (Number.isInteger(item.id) && item.id > max) max = item.id;
  }
  return max + 1;
}

// Write guard for the create paths below: the router-level guard already
// proved the caller has a session; a create additionally needs the write
// permission for its module (Operator is read-only, so 403).
function requireWrite(perm) {
  return (req, res, next) => {
    const perms = permissionsForRole(resolveUser(req).role);
    if (perms[perm] !== true) {
      return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
    }
    next();
  };
}

// ------------------------------------------------------- dashboard widgets ---

// A dashboard widget is only a pointer at a real endpoint in this repo:
// its data comes from that endpoint, never from a stored value. Custom
// dashboards may only use endpoints from this allowlist (validated in
// createDashboard); anything else is rejected, never rendered.
const WIDGET_ENDPOINTS = {
  '/api/devices': 'Devices',
  '/api/alarms/summary': 'Alarm summary',
  '/api/probes': 'Enterprise probes',
  '/api/ncmdashboard/getConfigConflictStatus': 'Config conflict status',
  '/api/ncmreports/getconfigChangesStatus': 'Config change status',
  '/api/ncmdashboard/getComplianceStatus': 'Compliance status',
  '/api/ncmeol/getEolSummary': 'EOL summary'
};

function isRealWidget(w) {
  return w && typeof w === 'object'
    && typeof w.endpoint === 'string'
    && Object.prototype.hasOwnProperty.call(WIDGET_ENDPOINTS, w.endpoint);
}

// Default dashboards are built from the real pages/widgets this console
// actually has: Overview aggregates the live inventory/alarm/probe/config
// surfaces, Network Configuration aggregates the real NCM status
// endpoints. They are derived, not stored, so they always match the
// console's real modules; a caller only sees a default whose module they
// may read.
const DEFAULT_DASHBOARDS = [
  {
    id: 'default-overview',
    Name: 'Overview',
    displayName: 'Overview',
    type: 'default',
    isDefault: true,
    widgets: [
      { id: 'devices-summary', name: 'Devices', title: 'Devices', type: 'summary', endpoint: '/api/devices' },
      { id: 'alarms-summary', name: 'Alarms', title: 'Alarms', type: 'summary', endpoint: '/api/alarms/summary' },
      { id: 'probes-status', name: 'Enterprise Probes', title: 'Enterprise Probes', type: 'summary', endpoint: '/api/probes' },
      { id: 'config-conflict', name: 'Config Conflicts', title: 'Config Conflicts', type: 'chart', endpoint: '/api/ncmdashboard/getConfigConflictStatus' }
    ]
  },
  {
    id: 'default-ncm',
    Name: 'Network Configuration',
    displayName: 'Network Configuration',
    type: 'default',
    isDefault: true,
    widgets: [
      { id: 'config-conflict', name: 'Config Conflicts', title: 'Config Conflicts', type: 'chart', endpoint: '/api/ncmdashboard/getConfigConflictStatus' },
      { id: 'config-changes', name: 'Config Changes', title: 'Config Changes', type: 'chart', endpoint: '/api/ncmreports/getconfigChangesStatus' },
      { id: 'compliance', name: 'Compliance', title: 'Compliance', type: 'chart', endpoint: '/api/ncmdashboard/getComplianceStatus' },
      { id: 'eol-summary', name: 'EOL Summary', title: 'EOL Summary', type: 'summary', endpoint: '/api/ncmeol/getEolSummary' }
    ]
  }
];

// How many stored devices match a view's criteria ({category?, status?}).
// Null when the view has no criteria to match against.
function countDevicesForCriteria(criteria) {
  if (!criteria || typeof criteria !== 'object') return null;
  const hasCategory = typeof criteria.category === 'string' && criteria.category.trim() !== '';
  const hasStatus = typeof criteria.status === 'string' && criteria.status.trim() !== '';
  if (!hasCategory && !hasStatus) return null;
  const devices = listDevices() || [];
  return devices.filter((d) => {
    if (hasCategory && String(d.category || '').toLowerCase() !== criteria.category.toLowerCase()) return false;
    if (hasStatus && String(d.status || '').toLowerCase() !== criteria.status.toLowerCase()) return false;
    return true;
  }).length;
}

// --------------------------------------------------------------- helpers ---

function deviceLabel(dev) {
  if (!dev) return null;
  return dev.hostname || dev.sys_name || dev.ip || null;
}

// Optional integer setting (settings are stored as strings); null when the
// setting was never stored, so no invented timeout/refresh is reported.
function settingInt(key) {
  const raw = getSetting(key);
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// Licence: only a licence actually stored in settings (key 'license', JSON
// with licenseType / licensedTo / expiryDate / maxDevicesAllowed /
// totalProbesAllowed) is reported. No stored licence -> null (N2).
function loadStoredLicense() {
  const raw = getSetting('license');
  if (!raw) return null;
  try {
    const lic = JSON.parse(raw);
    return lic && typeof lic === 'object' ? lic : null;
  } catch (e) {
    return null;
  }
}

function buildLicenseMeta(lic, probes, devices) {
  if (!lic) return null;
  const expiry = lic.expiryDate ? new Date(lic.expiryDate) : null;
  const expiryMs = expiry && !Number.isNaN(expiry.getTime()) ? expiry.getTime() : null;
  const maxDevices = lic.maxDevicesAllowed != null ? Number(lic.maxDevicesAllowed) : null;
  return {
    isLicenseExceeded: maxDevices == null || !Number.isFinite(maxDevices)
      ? null
      : devices.length > maxDevices,
    licenseType: lic.licenseType || null,
    licensedTo: lic.licensedTo || null,
    expiryDate: lic.expiryDate || null,
    daysRemaining: expiryMs == null ? null : Math.ceil((expiryMs - Date.now()) / 86400000),
    totalProbesAllowed: lic.totalProbesAllowed != null && Number.isFinite(Number(lic.totalProbesAllowed))
      ? Number(lic.totalProbesAllowed)
      : null,
    probesRegistered: probes.length,
    totalDevicesMonitored: devices.length,
    maxDevicesAllowed: maxDevices != null && Number.isFinite(maxDevices) ? maxDevices : null,
    status: expiryMs == null ? null : (expiryMs >= Date.now() ? 'Active' : 'Expired')
  };
}

// Resolve the caller's identity from req.user, refreshing role/flags from
// the user store when the session only carries a username (A-11: the
// identity must be the authenticated user's real record).
function resolveUser(req) {
  const u = req.user || {};
  let stored = null;
  if (u.username && (u.role === undefined || u.must_change_password === undefined)) {
    try {
      stored = getUserByUsername(u.username);
    } catch (e) {
      stored = null;
    }
  }
  return {
    id: u.id !== undefined ? u.id : (stored ? stored.id : null),
    username: u.username || (stored ? stored.username : null),
    displayName: u.displayName || u.username || (stored ? stored.username : null),
    role: u.role || (stored ? stored.role : null),
    mustChangePassword: u.must_change_password !== undefined
      ? u.must_change_password
      : (stored ? stored.must_change_password : null)
  };
}

function buildUserMeta(req) {
  const user = resolveUser(req);
  const role = user.role;
  const isSuperAdmin = role === 'SuperAdmin';
  const isAdmin = role === 'SuperAdmin' || role === 'Administrator';
  return {
    userId: user.id,
    name: user.username,
    userName: user.username,
    displayName: user.displayName,
    role,
    // True only when the account is flagged as must-change-password;
    // otherwise unknown (null) — a past change is not recorded anywhere.
    superAdminPasswordChanged: user.mustChangePassword === 1 ? false : null,
    // No certificate-state check exists, so no SSL-restart claim is made.
    showSSLRestartAlert: null,
    isSuperAdmin,
    isAdministrator: isAdmin,
    // The account was authenticated against the central users table.
    isCentralUser: true,
    isAllModulesFullAccessAdmin: isSuperAdmin,
    isAllCoreModulesFullAccessAdmin: isSuperAdmin,
    // No MSP/tenant data is stored anywhere.
    isNotMSPAdmin: null,
    isNotMspAdmin: null,
    // Static UI defaults (same standing as the theme default in
    // getUserPreference): display conventions, not measured state.
    userLocale: 'en-US',
    language: 'en',
    locale: 'en_US',
    timeFormat: 'yyyy-MM-dd HH:mm:ss',
    timeZone: getSetting('timeZone') || null,
    // No module-presence detection exists, so no plug-in is asserted
    // present or absent.
    showWorkflow: null,
    showDBQuery: null,
    showGettingStarted: null,
    isOPMPlug: null,
    isNCMPlug: null,
    isNFAPlug: null,
    isStoragePlug: null,
    isAPMPlug: null,
    isFWAPlug: null,
    isOPUPlug: null,
    isLiveChatVisible: null,
    autoRefresh: settingInt('autoRefresh'),
    sessionTimeout: settingInt('sessionTimeout'),
    permissions: permissionsForRole(role)
  };
}

// ------------------------------------------------------- client service data ---

// GET /ncmclient/getClientServiceData — identity, product and licence for
// the authenticated caller only. No CSRF cookie is issued here (the old
// hardcoded constant CSRF value is gone, A-09/A-10).
router.get(['/ncmclient/getClientServiceData', '/api/ncmclient/getClientServiceData', '/api/json/ncmclient/getClientServiceData'], (req, res) => {
  const probes = listProbes() || [];
  const devices = listDevices() || [];

  // Probe up/down from real probe heartbeat status in the store.
  // 'Online' (heartbeatProbe) or legacy 'Connected' counts as up.
  const probeUp = probes
    .filter((p) => p.status === 'Connected' || p.status === 'Online')
    .map((p) => p.id);
  const probeDown = probes
    .filter((p) => p.status !== 'Connected' && p.status !== 'Online')
    .map((p) => p.id);

  res.json({
    status: 'success',
    userMeta: buildUserMeta(req),
    productMeta: {
      productName: 'OpManager Central',
      productShortName: 'opm',
      // Real package version from package.json (N3).
      productVersion: pkg.version || null,
      productType: 'Central',
      // This process IS the central server, not a probe.
      isCentralServer: true,
      isProbe: false,
      // The server is up: it is answering this request.
      centralStatus: 'active',
      probeUp,
      probeDown,
      probesRegistered: probes.length,
      totalDevicesMonitored: devices.length
    },
    // No rebrand data is stored anywhere.
    rebrandMeta: null,
    // Null unless a real licence was stored (see loadStoredLicense).
    licenseMeta: buildLicenseMeta(loadStoredLicense(), probes, devices),
    // No MSP/tenant data is stored anywhere.
    mspMeta: null
  });
});

// ------------------------------------------------------------ main menu tabs ---

// Menu built from the real modules in this app and the caller's actual
// permissions (N4). A tab appears only when the caller may read that
// module; a sub-menu item appears only when its backing feature exists:
// dropped sub-items are NOC Views + Virtualization + Storage (no such
// data), Layer2 Maps (no LLDP/CDP discovery), Compliance Audit (a read-only
// compliance engine now exists, but no compliance UI page is wired, so no
// tab) and Configlets & Automation (no configlet store). (Phase 5: dashboard,
// custom-view and floor stores now exist — see the create paths in this file
// — but the menu sub-items for them are unchanged here; wiring them into the
// menu is UI work, not this route.)
// A role with no read permissions gets [].
router.get(['/ncmclient/getMainMenuTabs', '/api/ncmclient/getMainMenuTabs', '/api/json/ncmclient/getMainMenuTabs'], (req, res) => {
  const perms = permissionsForRole(resolveUser(req).role);
  const can = (p) => perms[p] === true;
  const tabs = [];

  if (can('dashboardRead')) {
    tabs.push({
      tabIdentifier: 'Dashboard',
      name: 'Dashboard',
      displayName: 'Dashboard',
      icon: 'dashboard',
      link: '#/dashboard',
      type: 'url',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Dashboard_Overview',
          name: 'Overview',
          displayName: 'Overview',
          link: '#/dashboard',
          type: 'url'
        }
      ]
    });
  }

  if (can('inventoryRead')) {
    tabs.push({
      tabIdentifier: 'Monitoring',
      name: 'Inventory',
      displayName: 'Inventory',
      icon: 'inventory',
      link: '#/inventory',
      type: 'url',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Monitoring_Devices',
          name: 'Devices',
          displayName: 'Devices',
          link: '#/inventory',
          type: 'url'
        },
        {
          tabIdentifier: 'Monitoring_Interfaces',
          name: 'Interfaces',
          displayName: 'Interfaces',
          link: '#/inventory?type=interfaces',
          type: 'url'
        },
        {
          tabIdentifier: 'Monitoring_Probes',
          name: 'Enterprise Probes',
          displayName: 'Enterprise Probes',
          link: '#/settings',
          type: 'url'
        }
      ]
    });
  }

  if (can('alarmsRead')) {
    tabs.push({
      tabIdentifier: 'Alarms',
      name: 'Alarms',
      displayName: 'Alarms',
      icon: 'alarms',
      link: 'alarms.list',
      model: 'active',
      type: 'route',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Alarms_Active',
          name: 'Active Alarms',
          displayName: 'Active Alarms',
          link: 'alarms.list',
          model: 'active',
          type: 'route'
        },
        {
          tabIdentifier: 'Alarms_All',
          name: 'All Alarms',
          displayName: 'All Alarms',
          link: 'alarms.list',
          model: 'all',
          type: 'route'
        },
        {
          tabIdentifier: 'Alarms_Events',
          name: 'Events',
          displayName: 'Events',
          link: 'alarms.list',
          model: 'events',
          type: 'route'
        }
      ]
    });
  }

  if (can('inventoryRead')) {
    tabs.push({
      tabIdentifier: 'Maps',
      name: 'Maps',
      displayName: 'Maps',
      icon: 'maps',
      link: '#/maps',
      type: 'url',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Maps_BView',
          name: 'Business Views',
          displayName: 'Business Views',
          link: '#/maps',
          type: 'url'
        },
        {
          tabIdentifier: 'Maps_Rack',
          name: 'Rack Views',
          displayName: 'Rack Views',
          link: '#/maps',
          type: 'url'
        }
      ]
    });
  }

  if (can('ncmDevMgmtRead')) {
    tabs.push({
      tabIdentifier: 'NCM',
      name: 'Configuration',
      displayName: 'Configuration',
      icon: 'ncm',
      link: '#/configuration',
      type: 'url',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'NCM_Devices',
          name: 'Inventory',
          displayName: 'Inventory',
          link: '#/inventory',
          type: 'url'
        },
        {
          tabIdentifier: 'NCM_Changes',
          name: 'Config Changes',
          displayName: 'Config Changes',
          link: '#/configuration',
          type: 'url'
        }
      ]
    });
  }

  if (can('reportsRead')) {
    tabs.push({
      tabIdentifier: 'Reports',
      name: 'Reports',
      displayName: 'Reports',
      icon: 'reports',
      link: 'reports.summary',
      type: 'route',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Reports_OpManager',
          name: 'OpManager Reports',
          displayName: 'OpManager Reports',
          link: 'reports.summary',
          type: 'route'
        },
        {
          tabIdentifier: 'Reports_NCM',
          name: 'Configuration Reports',
          displayName: 'Configuration Reports',
          link: 'reports.summary',
          type: 'route'
        },
        {
          tabIdentifier: 'Reports_Audit',
          name: 'Audit Logs',
          displayName: 'Audit Logs',
          link: 'reports.audit-logs.details',
          type: 'route'
        }
      ]
    });
  }

  if (can('settingsRead')) {
    tabs.push({
      tabIdentifier: 'Settings',
      name: 'Settings',
      displayName: 'Settings',
      icon: 'settings',
      link: '#/settings',
      type: 'url',
      showSubMenu: true,
      subMenu: [
        {
          tabIdentifier: 'Settings_Enterprise',
          name: 'Central & Probes',
          displayName: 'Central & Probes',
          link: '#/settings',
          type: 'url'
        },
        {
          tabIdentifier: 'Settings_Discovery',
          name: 'Discovery',
          displayName: 'Discovery',
          link: '#/settings',
          type: 'url'
        },
        {
          tabIdentifier: 'Settings_Credentials',
          name: 'Credentials',
          displayName: 'Credentials',
          link: '#/settings',
          type: 'url'
        },
        {
          tabIdentifier: 'Settings_Mail',
          name: 'Mail Server',
          displayName: 'Mail Server',
          link: '#/settings',
          type: 'url'
        }
      ]
    });
  }

  res.json(tabs);
});

// User Preference Endpoint
// Static UI default (audit: keep as a default); no per-user preference
// store exists yet, so there is nothing real to read here.
router.get(['/ncmclient/getUserPreference', '/api/ncmclient/getUserPreference', '/api/json/ncmclient/getUserPreference'], (req, res) => {
  res.json({
    DGroupNewView: false,
    theme: 'itom-grey-text-theme'
  });
});

// Dashboard List (HE-3a) — the real client calls /dashboard/getDashboardList
// and treats the response as an array of dashboards, each with a Name, so
// that is the shape on every path alias. defaultDashboards are derived
// from the console's real modules (see DEFAULT_DASHBOARDS) and filtered by
// the caller's read permissions; customDashboards are only the dashboards
// actually created through createDashboard below.
router.get([
  '/dashboard/getDashboardList', '/api/dashboard/getDashboardList',
  '/api/json/dashboard/getDashboardList',
  '/v2/dashboard/getDashboardList', '/api/v2/dashboard/getDashboardList',
  '/api/json/v2/dashboard/getDashboardList'
], (req, res) => {
  const perms = permissionsForRole(resolveUser(req).role);
  const dashboards = [];
  if (perms.dashboardRead) {
    dashboards.push(DEFAULT_DASHBOARDS[0]);
    if (perms.ncmConfigRead) dashboards.push(DEFAULT_DASHBOARDS[1]);
    for (const d of loadJsonList(CUSTOM_DASHBOARDS_KEY)) {
      dashboards.push({
        id: d.id,
        Name: d.name,
        displayName: d.name,
        type: 'custom',
        isDefault: false,
        owner: d.owner || null,
        widgets: Array.isArray(d.widgets) ? d.widgets : [],
        createdAt: d.createdAt || null
      });
    }
  }
  res.json(dashboards);
});

// POST createDashboard (HE-3a, session + dashboardWrite) — stores a custom
// dashboard. Body: { name (required), widgets? (optional array; every
// widget must point at a real endpoint from WIDGET_ENDPOINTS, else 400;
// omitted widgets default to the Overview widget set) }. 201 with the
// stored dashboard.
router.post(['/ncmclient/createDashboard', '/api/ncmclient/createDashboard', '/api/json/ncmclient/createDashboard'], requireWrite('dashboardWrite'), (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  let widgets = DEFAULT_DASHBOARDS[0].widgets;
  if (body.widgets !== undefined) {
    if (!Array.isArray(body.widgets)) {
      return res.status(400).json({ status: 'error', message: 'widgets must be an array' });
    }
    for (const w of body.widgets) {
      if (!isRealWidget(w)) {
        return res.status(400).json({
          status: 'error',
          message: `widget endpoint must be one of: ${Object.keys(WIDGET_ENDPOINTS).join(', ')}`
        });
      }
    }
    widgets = body.widgets;
  }
  const stored = loadJsonList(CUSTOM_DASHBOARDS_KEY);
  const dashboard = {
    id: nextJsonId(stored),
    name,
    owner: resolveUser(req).username,
    widgets,
    createdAt: Date.now()
  };
  stored.push(dashboard);
  saveJsonList(CUSTOM_DASHBOARDS_KEY, stored);
  return res.status(201).json({
    status: 'success',
    dashboard: {
      id: dashboard.id,
      Name: dashboard.name,
      displayName: dashboard.name,
      type: 'custom',
      isDefault: false,
      owner: dashboard.owner,
      widgets: dashboard.widgets,
      createdAt: dashboard.createdAt
    }
  });
});

router.get(['/admin/getAccessibilityControls', '/api/admin/getAccessibilityControls', '/api/json/admin/getAccessibilityControls'], (req, res) => {
  res.json({
    skipToMainContent: true,
    magnifyText: false
  });
});

// (HE-3a) Real message store: messages are recorded only by real console
// events — currently every alarm raised through store.alarms.raiseAlarm()
// (server/services/consoleMessages.js). The store starts empty, so a fresh
// system honestly returns no messages. Shape follows the real client:
// keyed by pageName, each page's messages grouped by type (ALERT / NEW /
// INFO); the client reads response[pageName].messages.ALERT and .NEW.
// ?pageName= returns just that page; without it, every page with stored
// messages is returned, keyed the same way.
router.get(['/admin/getMessagesForPage', '/api/admin/getMessagesForPage', '/api/json/admin/getMessagesForPage'], (req, res) => {
  const pageName = typeof req.query.pageName === 'string' && req.query.pageName
    ? req.query.pageName
    : null;
  const group = (messages) => {
    const grouped = { ALERT: [], NEW: [], INFO: [] };
    for (const m of messages) {
      const bucket = grouped[m.type] ? m.type : 'INFO';
      grouped[bucket].push({
        id: m.id,
        type: m.type,
        title: m.title,
        message: m.message,
        createdAt: m.createdAt,
        read: m.read === true
      });
    }
    return grouped;
  };
  if (pageName) {
    return res.json({ [pageName]: { messages: group(consoleMessages.listMessages(pageName)) } });
  }
  const byPage = {};
  for (const m of consoleMessages.listMessages()) {
    if (!byPage[m.page]) byPage[m.page] = [];
    byPage[m.page].push(m);
  }
  const out = {};
  for (const page of Object.keys(byPage)) out[page] = { messages: group(byPage[page]) };
  res.json(out);
});

// (HE-3a) Real stored custom views: only views actually created through
// createCustomView below are listed; an empty store honestly returns [].
// ?type= filters by view type (e.g. ALARMS). deviceCount is computed live
// from the stored devices matching the view's criteria.
router.get(['/admin/listCustomViews', '/api/admin/listCustomViews', '/api/json/admin/listCustomViews'], (req, res) => {
  const typeFilter = typeof req.query.type === 'string' && req.query.type
    ? req.query.type.toLowerCase()
    : null;
  const views = loadJsonList(CUSTOM_VIEWS_KEY)
    .filter((v) => !typeFilter || String(v.type || '').toLowerCase() === typeFilter)
    .map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type || null,
      tab: v.tab || null,
      owner: v.owner || null,
      criteria: v.criteria || null,
      deviceCount: countDevicesForCriteria(v.criteria),
      createdAt: v.createdAt || null
    }));
  res.json({
    status: 'success',
    result: {
      views
    }
  });
});

// POST createCustomView (HE-3a, session + inventoryWrite) — stores a custom
// view. Body: { name (required), type? (default 'inventory'; also used as
// the tab this view belongs to, e.g. 'alarms'), criteria? (optional object,
// e.g. {category:'Switch'} — only used to count matching devices, never
// to invent devices) }. 201 with the stored view.
router.post(['/ncmclient/createCustomView', '/api/ncmclient/createCustomView', '/api/json/ncmclient/createCustomView'], requireWrite('inventoryWrite'), (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  const type = typeof body.type === 'string' && body.type.trim() !== '' ? body.type.trim() : 'inventory';
  if (body.criteria !== undefined && (body.criteria === null || typeof body.criteria !== 'object' || Array.isArray(body.criteria))) {
    return res.status(400).json({ status: 'error', message: 'criteria must be an object' });
  }
  const stored = loadJsonList(CUSTOM_VIEWS_KEY);
  const view = {
    id: nextJsonId(stored),
    name,
    type,
    tab: type.toLowerCase(),
    owner: resolveUser(req).username,
    criteria: body.criteria || null,
    createdAt: Date.now()
  };
  stored.push(view);
  saveJsonList(CUSTOM_VIEWS_KEY, stored);
  return res.status(201).json({
    status: 'success',
    view: {
      id: view.id,
      name: view.name,
      type: view.type,
      tab: view.tab,
      owner: view.owner,
      criteria: view.criteria,
      deviceCount: countDevicesForCriteria(view.criteria),
      createdAt: view.createdAt
    }
  });
});

// (HE-3a) Real CCTV views, derived from the stored device inventory: a
// device counts as a camera/NVR when its stored category names one
// (camera / cctv / nvr / dvr) or its sysDescr mentions a camera. No
// camera/NVR device in the inventory means an honest [] — no view is
// invented for hardware that was never discovered.
router.get(['/dashboard/listCCTVView', '/api/dashboard/listCCTVView', '/api/json/dashboard/listCCTVView'], (req, res) => {
  const devices = listDevices() || [];
  const cctv = devices.filter((d) => {
    const category = String(d.category || '');
    const descr = String(d.sys_descr || '');
    return /camera|cctv|nvr|dvr/i.test(category) || /camera/i.test(descr);
  });
  res.json(cctv.map((d) => ({
    id: d.id,
    deviceId: d.id,
    name: deviceLabel(d),
    ip: d.ip || null,
    category: d.category || null,
    status: d.status || null
  })));
});

// (HE-3a) Real tab/business-view details from the stored custom views,
// plus — for the inventory tab — one live entry per device category
// actually present in the store (computed from devices, with real counts).
// ?tabName= selects the tab (default 'inventory'; 'virtualInventory'
// additionally returns bySeverity from real alarms and byVirtualType,
// which is [] because no virtualization inventory is collected anywhere).
router.get(['/tab/getTabViewDetails', '/api/tab/getTabViewDetails', '/api/json/tab/getTabViewDetails'], (req, res) => {
  const tabName = typeof req.query.tabName === 'string' && req.query.tabName
    ? req.query.tabName
    : 'inventory';
  const tabLower = tabName.toLowerCase();
  const list = [];
  for (const v of loadJsonList(CUSTOM_VIEWS_KEY)) {
    if (String(v.tab || v.type || '').toLowerCase() !== tabLower) continue;
    list.push({
      id: v.id,
      name: v.name,
      displayName: v.name,
      type: 'custom',
      tab: tabName,
      deviceCount: countDevicesForCriteria(v.criteria),
      createdAt: v.createdAt || null
    });
  }
  if (tabLower === 'inventory') {
    const byCategory = new Map();
    for (const d of listDevices() || []) {
      const category = d.category || 'Uncategorized';
      byCategory.set(category, (byCategory.get(category) || 0) + 1);
    }
    for (const [category, count] of [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      list.push({
        id: `category:${category}`,
        name: category,
        displayName: category,
        type: 'category',
        tab: tabName,
        deviceCount: count,
        createdAt: null
      });
    }
  }
  const out = { bvDetails: { List: list } };
  if (tabLower === 'virtualinventory') {
    // Real alarm severities (the only severity data this console collects);
    // there is no VM inventory, so byVirtualType is honestly empty.
    const bySeverityMap = new Map();
    for (const a of listAlarms() || []) {
      const severity = a.severity || 'Unknown';
      bySeverityMap.set(severity, (bySeverityMap.get(severity) || 0) + 1);
    }
    out.bySeverity = [...bySeverityMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([severity, count]) => ({ severity, count }));
    out.byVirtualType = [];
  }
  res.json(out);
});

// (HE-3a) Real floors from the floors store: only floors actually created
// through createFloor below are listed; an empty store honestly returns
// []. rackIds are validated against real racks at creation, and rackCount
// is computed live from the racks that still exist.
router.get(['/maps/listFloors', '/api/maps/listFloors', '/api/json/maps/listFloors'], (req, res) => {
  const racks = listRacks() || [];
  const existingRackIds = new Set(racks.map((r) => r.id));
  res.json(loadJsonList(FLOORS_KEY).map((f) => ({
    id: f.id,
    name: f.name,
    building: f.building || null,
    rackIds: Array.isArray(f.rackIds) ? f.rackIds : [],
    rackCount: (Array.isArray(f.rackIds) ? f.rackIds : []).filter((id) => existingRackIds.has(id)).length,
    createdBy: f.createdBy || null,
    createdAt: f.createdAt || null
  })));
});

// POST createFloor (HE-3a, session + inventoryWrite) — stores a floor.
// Body: { name (required), building?, rackIds? (optional array of real
// rack ids; an unknown rack id is a 400) }. 201 with the stored floor.
router.post(['/ncmclient/createFloor', '/api/ncmclient/createFloor', '/api/json/ncmclient/createFloor'], requireWrite('inventoryWrite'), (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  const building = typeof body.building === 'string' && body.building.trim() !== '' ? body.building.trim() : null;
  let rackIds = [];
  if (body.rackIds !== undefined) {
    if (!Array.isArray(body.rackIds)) {
      return res.status(400).json({ status: 'error', message: 'rackIds must be an array' });
    }
    for (const rawId of body.rackIds) {
      const n = Number(rawId);
      if (!Number.isInteger(n) || !getRack(n)) {
        return res.status(400).json({ status: 'error', message: `Rack ${rawId} not found` });
      }
      if (!rackIds.includes(n)) rackIds.push(n);
    }
  }
  const stored = loadJsonList(FLOORS_KEY);
  const floor = {
    id: nextJsonId(stored),
    name,
    building,
    rackIds,
    createdBy: resolveUser(req).username,
    createdAt: Date.now()
  };
  stored.push(floor);
  saveJsonList(FLOORS_KEY, stored);
  return res.status(201).json({ status: 'success', floor });
});

// Real racks from the store (racks table); [] until a rack is created.
router.get(['/maps/listRacks', '/api/maps/listRacks', '/api/json/maps/listRacks'], (req, res) => {
  const racks = listRacks() || [];
  res.json(racks.map((r) => ({ rackId: r.id, displayName: r.name })));
});

// (N10, HE-3a) STAYS HONEST-EMPTY — there is still no Layer-2 topology
// source to derive maps from: no LLDP/CDP neighbor collection, no MAC or
// ARP table collection from managed devices exists anywhere in this
// codebase (the poller collects interface counters and availability
// only), and the MAC resolver in server/routes/tools.js reads THIS host's
// own kernel neighbor table — presenting that as network topology would
// be invented data, so it is not used here. [] until a real discovery
// source lands.
router.get(['/maps/getLayer2Maps', '/api/maps/getLayer2Maps', '/api/json/maps/getLayer2Maps'], (req, res) => {
  res.json([]);
});

// (N11) REAL (HE-3b): score computed from stored data by
// computeSecurityScore() — open alarms by severity + compliance verdicts
// over the monitored devices. Null with a reason when nothing is
// monitored; the formula is documented in API.md §11.
router.get(['/v2/admin/getSecurityScore', '/api/v2/admin/getSecurityScore', '/api/json/v2/admin/getSecurityScore', '/client/api/json/v2/admin/getSecurityScore'], (req, res) => {
  const result = computeSecurityScore(listDevices() || []);
  res.json({
    SecurityScore: result.score,
    score: result.score,
    grade: result.grade,
    status: result.status,
    details: result.details
  });
});

// (HE-3a) Real alarm sound files: the directory shipped with the client
// (client/apiclient/fluidicv2/sounds) is read at runtime and every audio
// file in it is listed. The client iterates this array and matches
// filePath/fileName against its selected value ('webalarm.mp3'), so both
// fields carry the file name. If the directory is missing or holds no
// audio files, the honest result is [].
const SOUNDS_DIR = path.join(__dirname, '..', '..', 'client', 'apiclient', 'fluidicv2', 'sounds');

router.get(['/admin/getWebAlarmSoundFiles', '/api/admin/getWebAlarmSoundFiles', '/api/json/admin/getWebAlarmSoundFiles'], (req, res) => {
  let files = [];
  try {
    files = fs.readdirSync(SOUNDS_DIR)
      .filter((f) => /\.(mp3|wav|ogg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
  } catch (e) {
    files = [];
  }
  res.json(files.map((f) => ({ fileName: f, filePath: f })));
});

router.get(['/device/listCustomFields', '/api/device/listCustomFields', '/api/json/device/listCustomFields'], (req, res) => {
  res.json({
    site: 'Site Location',
    rack: 'Rack Unit',
    owner: 'Asset Custodian'
  });
});

router.get(['/ncmclient/getNCMInvFilters', '/api/ncmclient/getNCMInvFilters', '/api/json/ncmclient/getNCMInvFilters'], (req, res) => {
  res.json({
    isSidebarMinimized: false,
    timeFilter: 'all',
    columnWidths: {},
    filterDetails: {}
  });
});

// Static device taxonomy (audit: acceptable as reference data).
router.get(['/device/getDeviceCategories', '/api/device/getDeviceCategories', '/api/json/device/getDeviceCategories'], (req, res) => {
  res.json([
    { id: 'Router', name: 'Routers' },
    { id: 'Switch', name: 'Switches' },
    { id: 'Firewall', name: 'Firewalls' },
    { id: 'Server', name: 'Servers' },
    { id: 'Wireless', name: 'Access Points' }
  ]);
});

// (HE-3a) Real logical groups from the groups store: only groups actually
// created through createLogicalGroup below are listed; an empty store
// honestly returns []. deviceIds are validated against real devices at
// creation, and deviceCount is computed live from the devices that still
// exist — a deleted device silently drops out of the count, never renders
// as a member.
router.get(['/admin/listAllLogicalGroups', '/api/admin/listAllLogicalGroups', '/api/json/admin/listAllLogicalGroups'], (req, res) => {
  const devices = listDevices() || [];
  const existingIds = new Set(devices.map((d) => d.id));
  res.json(loadJsonList(LOGICAL_GROUPS_KEY).map((g) => {
    const deviceIds = (Array.isArray(g.deviceIds) ? g.deviceIds : []).filter((id) => existingIds.has(id));
    return {
      id: g.id,
      name: g.name,
      description: g.description || null,
      deviceIds,
      deviceCount: deviceIds.length,
      createdBy: g.createdBy || null,
      createdAt: g.createdAt || null
    };
  }));
});

// POST createLogicalGroup (HE-3a, session + inventoryWrite) — stores a
// logical group. Body: { name (required), description?, deviceIds?
// (optional array of real device ids; an unknown device id is a 404) }.
// 201 with the stored group.
router.post(['/ncmclient/createLogicalGroup', '/api/ncmclient/createLogicalGroup', '/api/json/ncmclient/createLogicalGroup'], requireWrite('inventoryWrite'), (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  const description = typeof body.description === 'string' && body.description.trim() !== '' ? body.description.trim() : null;
  let deviceIds = [];
  if (body.deviceIds !== undefined) {
    if (!Array.isArray(body.deviceIds)) {
      return res.status(400).json({ status: 'error', message: 'deviceIds must be an array' });
    }
    const devices = listDevices() || [];
    for (const rawId of body.deviceIds) {
      const n = Number(rawId);
      if (!Number.isInteger(n) || !devices.some((d) => d.id === n)) {
        return res.status(404).json({ status: 'error', message: `Device ${rawId} not found` });
      }
      if (!deviceIds.includes(n)) deviceIds.push(n);
    }
  }
  const stored = loadJsonList(LOGICAL_GROUPS_KEY);
  const group = {
    id: nextJsonId(stored),
    name,
    description,
    deviceIds,
    createdBy: resolveUser(req).username,
    createdAt: Date.now()
  };
  stored.push(group);
  saveJsonList(LOGICAL_GROUPS_KEY, stored);
  return res.status(201).json({
    status: 'success',
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      deviceIds: group.deviceIds,
      deviceCount: group.deviceIds.length,
      createdBy: group.createdBy,
      createdAt: group.createdAt
    }
  });
});

// Device group view preference
router.get(['/api/json/user/getDeviceGroupViewPreference', '/user/getDeviceGroupViewPreference', '/api/user/getDeviceGroupViewPreference'], (req, res) => {
  res.json({ preference: 'tree' });
});

// ------------------------------------------- real config comparison (N13) ---

// Config types stored by the fetch/backup path. Canonical types are
// 'running' and 'startup'; the '-config' spellings are accepted as aliases
// (same convention as server/routes/diff.js).
const RUNNING_TYPES = ['running', 'running-config'];
const STARTUP_TYPES = ['startup', 'startup-config'];

function latestConfigOfTypes(deviceId, types) {
  for (const type of types) {
    const row = getLatestConfig(deviceId, type);
    if (row && row.content != null) return row;
  }
  const all = getConfigs(deviceId) || [];
  const matches = all.filter(
    (r) => r && r.content != null && types.includes(r.config_type)
  );
  return matches.length ? matches[0] : null;
}

function splitLines(content) {
  if (content == null) return [];
  return String(content).replace(/\r\n/g, '\n').split('\n');
}

// Multiset line difference between two fetched configs (same approach as
// server/routes/diff.js, so repeated lines are counted correctly).
function countDiffLines(runningLines, startupLines) {
  const remaining = new Map();
  for (const line of startupLines) {
    remaining.set(line, (remaining.get(line) || 0) + 1);
  }
  let added = 0;
  for (const line of runningLines) {
    const count = remaining.get(line) || 0;
    if (count > 0) remaining.set(line, count - 1);
    else added += 1;
  }
  let removed = 0;
  for (const count of remaining.values()) removed += count;
  return added + removed;
}

// ------------------------------------------- HE-3b engines (Phase 5) ---
//
// Shared real-data engines for the NCM dashboard widgets. Every number
// below is computed from rows actually in the store; nothing is sampled,
// interpolated or invented. Where a source does not exist (a CVE feed, a
// hardware lifecycle catalogue) the route stays honest-empty and says so
// — see getFirmVul* / getUpcomingEolDevices.

// --- Compliance policies ---
// Each policy is a pure check over a device's latest fetched RUNNING
// config. Comment lines (Cisco '!' / MikroTik '#') are ignored. A policy
// returns 'pass' | 'fail' | 'na' ('na' = the config carries no evidence
// the policy applies to, e.g. no management-access lines at all for the
// SSH-only policy); 'na' is neither a pass nor a failure. Device verdict:
// any Critical failure -> 'Critical Violation'; otherwise any Minor
// failure -> 'Minor Deviation'; otherwise 'Compliant (Pass)'.
const COMPLIANCE_POLICIES = [
  {
    id: 'no-default-snmp-community',
    name: 'No default SNMP community string',
    severity: 'Critical',
    description: 'SNMP community must not be the well-known default "public" or "private" (Cisco "snmp-server community" / MikroTik "/snmp community name=").',
    check(lines) {
      for (const line of lines) {
        if (/^\s*snmp-server\s+community\s+(public|private)\b/i.test(line)) return 'fail';
        if (/\/snmp\s+community\b[^\n]*\bname\s*=\s*(public|private)\b/i.test(line)) return 'fail';
      }
      return 'pass';
    }
  },
  {
    id: 'no-plaintext-password',
    name: 'No plaintext (type-0 / untyped) password',
    severity: 'Critical',
    description: 'Cisco "enable password" / "username … password" must use an encrypted type (5/7/8/9); a type-0 or bare plaintext password fails. "secret" lines are always hashed and are not flagged.',
    check(lines) {
      for (const line of lines) {
        const m = line.match(/^\s*(?:enable\s+password|username\s+\S+\s+password)\s+(\S+)/i);
        if (m && !['5', '7', '8', '9'].includes(m[1])) return 'fail';
      }
      return 'pass';
    }
  },
  {
    id: 'ssh-only-management',
    name: 'SSH-only management access (no Telnet)',
    severity: 'Minor',
    description: 'Where management-access lines exist, Telnet must not be enabled (Cisco "transport input … telnet" / "telnet-server enable" / MikroTik "/ip service set telnet disabled=no"). No management-access lines at all -> not applicable.',
    check(lines) {
      const hasMgmt = lines.some((l) =>
        /transport\s+input\b/i.test(l) || /telnet-server\b/i.test(l) ||
        /\bip\s+ssh\b/i.test(l) || /\/ip\s+service\b/i.test(l));
      if (!hasMgmt) return 'na';
      for (const line of lines) {
        if (/transport\s+input\s+[^\n]*\btelnet\b/i.test(line)) return 'fail';
        if (/^\s*telnet-server\s+enable/i.test(line)) return 'fail';
        if (/\/ip\s+service\s+set\s+telnet\s+disabled\s*=\s*no/i.test(line)) return 'fail';
      }
      return 'pass';
    }
  },
  {
    id: 'ntp-configured',
    name: 'NTP configured',
    severity: 'Minor',
    description: 'Device must configure an NTP server/peer (Cisco "ntp server|peer" / MikroTik "/system ntp client"). Absence fails: the fetched running config is the whole config, so absence means not configured.',
    check(lines) {
      return lines.some((l) =>
        /\bntp\s+(server|peer)\b/i.test(l) || /\/system\s+ntp\s+client\b/i.test(l))
        ? 'pass' : 'fail';
    }
  },
  {
    id: 'syslog-configured',
    name: 'Syslog / remote logging configured',
    severity: 'Minor',
    description: 'Device must send logs to a remote destination (Cisco "logging host|server" / MikroTik "/system logging"). Absence fails, same reasoning as NTP.',
    check(lines) {
      return lines.some((l) =>
        /^\s*logging\s+(host|server)\b/i.test(l) || /\/system\s+logging\b/i.test(l))
        ? 'pass' : 'fail';
    }
  }
];

// Config lines with comments and blanks removed, for policy checks.
function activeConfigLines(content) {
  return splitLines(content)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '' && !/^\s*[!#]/.test(l));
}

function policyById(id) {
  return COMPLIANCE_POLICIES.find((p) => p.id === id) || null;
}

// Evaluate every device that has a fetched running config. Devices with
// no running config are counted in devicesNotEvaluated and in NO verdict
// bucket — an unevaluated device is not "compliant".
function evaluateCompliance(devices) {
  const policies = COMPLIANCE_POLICIES.map((p) => ({
    id: p.id, name: p.name, severity: p.severity, description: p.description
  }));
  const perDevice = [];
  let devicesEvaluated = 0;
  let devicesNotEvaluated = 0;
  const counts = { compliant: 0, minor: 0, critical: 0 };
  for (const dev of devices || []) {
    const running = latestConfigOfTypes(dev.id, RUNNING_TYPES);
    if (!running || running.content == null) {
      devicesNotEvaluated += 1;
      continue;
    }
    devicesEvaluated += 1;
    const lines = activeConfigLines(running.content);
    const failures = [];
    const results = {};
    for (const p of COMPLIANCE_POLICIES) {
      const r = p.check(lines);
      results[p.id] = r;
      if (r === 'fail') failures.push(p.id);
    }
    const hasCritical = failures.some((id) => {
      const p = policyById(id);
      return p && p.severity === 'Critical';
    });
    const hasMinor = failures.some((id) => {
      const p = policyById(id);
      return p && p.severity === 'Minor';
    });
    const verdict = hasCritical
      ? 'Critical Violation'
      : (hasMinor ? 'Minor Deviation' : 'Compliant (Pass)');
    if (hasCritical) counts.critical += 1;
    else if (hasMinor) counts.minor += 1;
    else counts.compliant += 1;
    perDevice.push({
      deviceId: dev.id,
      device: deviceLabel(dev),
      verdict,
      failures,
      results
    });
  }
  return { counts, perDevice, devicesEvaluated, devicesNotEvaluated, policies };
}

// --- Config-change counts ---
// The configs table IS the change history: every fetched config is a
// backup row. A "change detected" is a consecutive pair of fetches of the
// same device + config_type whose content differs (ordered oldest first;
// ties broken by row id). No approval, schedule or author is recorded for
// a fetched config, so no detected change can be shown to be authorised.
function countConfigChanges() {
  const devices = listDevices() || [];
  let backupsTaken = 0;
  let changesDetected = 0;
  const perDevice = [];
  for (const dev of devices) {
    const rows = (getConfigs(dev.id) || []).filter((r) => r && r.content != null);
    const byType = new Map();
    for (const r of rows) {
      if (!byType.has(r.config_type)) byType.set(r.config_type, []);
      byType.get(r.config_type).push(r);
    }
    let devBackups = 0;
    let devChanges = 0;
    for (const list of byType.values()) {
      const ordered = [...list].sort(
        (a, b) => (a.fetched_at - b.fetched_at) || (a.id - b.id)
      );
      devBackups += ordered.length;
      for (let i = 1; i < ordered.length; i++) {
        if (ordered[i].content !== ordered[i - 1].content) devChanges += 1;
      }
    }
    backupsTaken += devBackups;
    changesDetected += devChanges;
    if (devBackups > 0) {
      perDevice.push({
        deviceId: dev.id,
        device: deviceLabel(dev),
        backups: devBackups,
        changesDetected: devChanges
      });
    }
  }
  return { backupsTaken, changesDetected, devicesWithBackups: perDevice.length, perDevice };
}

// --- Firmware inventory ---
// No firmware-version column exists in the store; the version is derived
// from the device's polled sysDescr (stored by discovery/poller from a
// real SNMP GET) with conservative patterns. A sysDescr with no matching
// token yields firmwareVersion null — never a guessed version. The
// "Hardware Version" token is explicitly NOT a firmware version.
const FIRMWARE_VERSION_PATTERNS = [
  /(?<!hardware\s)\bVersion\s+([A-Za-z0-9][A-Za-z0-9()._+\-]*)/i, // Cisco IOS "Version 12.2(55)SE9"
  /\bFirmware(?:\s+Version)?\s*[:=]\s*([^\s,;]+)/i,
  /\bRouterOS\s+v?([0-9][0-9A-Za-z.]*)/i,
  /\bSW\s+Version\s+([^\s,;]+)/i,
  /\bSoftware\s+Version\s+([^\s,;]+)/i
];

function extractFirmwareVersion(sysDescr) {
  if (!sysDescr) return null;
  const text = String(sysDescr);
  for (const re of FIRMWARE_VERSION_PATTERNS) {
    const m = text.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

function buildFirmwareInventory(devices) {
  return (devices || []).map((dev) => {
    const firmwareVersion = extractFirmwareVersion(dev.sys_descr);
    return {
      deviceId: dev.id,
      device: deviceLabel(dev),
      ip: dev.ip || null,
      vendor: dev.vendor || null,
      model: dev.model || null,
      sysDescr: dev.sys_descr || null,
      firmwareVersion,
      // Where the version came from; null when no version token exists.
      firmwareVersionSource: firmwareVersion == null ? null : 'sysDescr'
    };
  });
}

// --- Security score ---
// FORMULA (all inputs real, from this store):
//   score = max(0, 100 - alarmDeduction - complianceDeduction)
//   alarmDeduction      = min(criticalOpen * 10, 40) + min(troubleOpen * 5, 20)
//                         + min(attentionOpen * 3, 15) + min(serviceDownOpen * 3, 15)
//                         + min(otherOpen * 1, 5)
//     where "open" = alarm status 'active' or 'acknowledged' (cleared
//     alarms are history, not current risk); severities are the poller's
//     own strings (Critical / Trouble / Attention / ServiceDown / Down).
//   complianceDeduction = min(criticalViolationDevices * 5, 25)
//                         + min(minorDeviationDevices * 2, 10)
//     from evaluateCompliance() above; unevaluated devices contribute 0.
//   grade: A >= 90, B >= 80, C >= 70, D >= 60, F < 60.
//   status: 'Good' >= 80, 'Fair' 60-79, 'At Risk' < 60.
// With zero devices monitored there is nothing to score: score/grade/
// status are null (a 100 for an empty estate would be a lie).
function computeSecurityScore(devices) {
  const monitored = (devices || []).length;
  const open = (listAlarms({ limit: 1000 }) || [])
    .filter((a) => a.status === 'active' || a.status === 'acknowledged');
  const bySeverity = { critical: 0, trouble: 0, attention: 0, serviceDown: 0, other: 0 };
  for (const a of open) {
    const s = String(a.severity || '').toLowerCase();
    if (s === 'critical') bySeverity.critical += 1;
    else if (s === 'trouble') bySeverity.trouble += 1;
    else if (s === 'attention') bySeverity.attention += 1;
    else if (s === 'servicedown' || s === 'down') bySeverity.serviceDown += 1;
    else bySeverity.other += 1;
  }
  const compliance = evaluateCompliance(devices);
  const alarmDeduction = Math.min(bySeverity.critical * 10, 40)
    + Math.min(bySeverity.trouble * 5, 20)
    + Math.min(bySeverity.attention * 3, 15)
    + Math.min(bySeverity.serviceDown * 3, 15)
    + Math.min(bySeverity.other * 1, 5);
  const complianceDeduction = Math.min(compliance.counts.critical * 5, 25)
    + Math.min(compliance.counts.minor * 2, 10);
  const details = {
    devicesMonitored: monitored,
    openAlarms: { total: open.length, ...bySeverity },
    compliance: {
      devicesEvaluated: compliance.devicesEvaluated,
      devicesNotEvaluated: compliance.devicesNotEvaluated,
      compliant: compliance.counts.compliant,
      minorDeviation: compliance.counts.minor,
      criticalViolation: compliance.counts.critical
    },
    deductions: {
      alarms: alarmDeduction,
      compliance: complianceDeduction,
      total: alarmDeduction + complianceDeduction
    },
    formula: 'score = max(0, 100 - alarmDeduction - complianceDeduction); alarmDeduction = min(critical*10,40)+min(trouble*5,20)+min(attention*3,15)+min(serviceDown*3,15)+min(other*1,5) over open (active/acknowledged) alarms; complianceDeduction = min(criticalViolationDevices*5,25)+min(minorDeviationDevices*2,10); grade A>=90 B>=80 C>=70 D>=60 F<60; status Good>=80 Fair 60-79 At Risk<60',
    reason: null
  };
  if (monitored === 0) {
    details.reason = 'No devices monitored — nothing to score (score/grade/status are null, not 100).';
    return { score: null, grade: null, status: null, details };
  }
  const score = Math.max(0, 100 - alarmDeduction - complianceDeduction);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const status = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'At Risk';
  return { score, grade, status, details };
}

// No vulnerability feed exists anywhere in the repo (no CVE data file,
// no feed URL, no stored CVE rows — the MIB index only names OID
// descriptors such as ncmFwvCveid). Until one is added, every CVE
// aggregate is honestly 0 ("none known", not "none exist").
const NO_VULN_FEED_REASON = 'No vulnerability feed is configured or bundled: no CVE data exists anywhere in the repo, so no CVE can be matched against the firmware inventory. Counts of 0 mean "none known", not "none exist".';

// (N13) Counts computed from real startup-vs-running comparisons over
// configs actually fetched into the store. A device with no fetched pair
// is counted in neither bucket; with no configs at all both counts are 0.
router.get(['/ncmdashboard/getConfigConflictStatus', '/api/ncmdashboard/getConfigConflictStatus'], (req, res) => {
  const devices = listDevices() || [];
  let synchronized = 0;
  let conflict = 0;
  for (const dev of devices) {
    const running = latestConfigOfTypes(dev.id, RUNNING_TYPES);
    const startup = latestConfigOfTypes(dev.id, STARTUP_TYPES);
    if (!running || !startup) continue;
    if (countDiffLines(splitLines(running.content), splitLines(startup.content)) === 0) {
      synchronized += 1;
    } else {
      conflict += 1;
    }
  }
  res.json({
    status: 'success',
    columns: [{ columnname: 'Type', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { type: 'Synchronized (No Drift)', count: synchronized },
      { type: 'Startup-Running Conflict', count: conflict }
    ]
  });
});

// (N14) REAL (HE-3b): each device with a fetched running config is
// checked against COMPLIANCE_POLICIES (default SNMP community, plaintext
// password, SSH-only management, NTP, syslog); verdicts are evidence-only
// and devices with no running config are counted separately as not
// evaluated, never as compliant. Policy definitions: API.md §11.
router.get(['/ncmdashboard/getComplianceStatus', '/api/ncmdashboard/getComplianceStatus'], (req, res) => {
  const result = evaluateCompliance(listDevices() || []);
  res.json({
    status: 'success',
    columns: [{ columnname: 'Severity', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { severity: 'Compliant (Pass)', count: result.counts.compliant },
      { severity: 'Minor Deviation', count: result.counts.minor },
      { severity: 'Critical Violation', count: result.counts.critical }
    ],
    devicesEvaluated: result.devicesEvaluated,
    devicesNotEvaluated: result.devicesNotEvaluated,
    policies: result.policies,
    perDevice: result.perDevice
  });
});

// (N15) REAL (HE-3b): counts from the configs table, which IS the change
// history (every fetch is a backup row; a change is a consecutive pair of
// fetches of the same device + type whose content differs). Authorized
// stays 0: the NCM approval gate is dry-run only and nothing is ever
// pushed to a device, so no detected change can be tied to an authorised
// change — every detected diff arrived out-of-band and is therefore
// unscheduled. See API.md §11.
router.get(['/ncmreports/getconfigChangesStatus', '/api/ncmreports/getconfigChangesStatus'], (req, res) => {
  const result = countConfigChanges();
  res.json({
    status: 'success',
    columns: [{ columnname: 'Type', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { type: 'Authorized Changes', count: 0 },
      { type: 'Unauthorized / Unscheduled', count: result.changesDetected }
    ],
    backupsTaken: result.backupsTaken,
    changesDetected: result.changesDetected,
    devicesWithBackups: result.devicesWithBackups,
    perDevice: result.perDevice
  });
});

// (N16) REAL firmware inventory, HONEST-EMPTY vulnerabilities (HE-3b):
// firmware rows are the real discovered devices (model + firmware version
// as extracted from the polled sysDescr; null where no version token
// exists). No CVE feed exists, so no CVE can be matched: totalVulnera-
// bilities is 0 ("none known", not "none exist") and cveList is [].
router.get(['/ncmcompliance/getFirmVulnDetails', '/api/ncmcompliance/getFirmVulnDetails'], (req, res) => {
  const devices = listDevices() || [];
  const firmwareInventory = buildFirmwareInventory(devices);
  res.json({
    status: 'success',
    totalVulnerabilities: 0,
    cveList: [],
    vulnerabilityFeed: null,
    reason: NO_VULN_FEED_REASON,
    firmwareInventory,
    devicesInventoried: firmwareInventory.length,
    devicesWithFirmwareVersion: firmwareInventory.filter((d) => d.firmwareVersion != null).length
  });
});

// (N17) HONEST-EMPTY (HE-3b): severity counts aggregate the CVE result
// above, and there is no CVE result — no vulnerability feed exists. The
// real firmware inventory is in getFirmVulnDetails, not here.
router.get(['/ncmcompliance/getFirmVulCveSeverityStatus', '/api/ncmcompliance/getFirmVulCveSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Critical', count: 0 },
      { severity: 'High', count: 0 },
      { severity: 'Medium', count: 0 },
      { severity: 'Low', count: 0 }
    ],
    vulnerabilityFeed: null,
    reason: NO_VULN_FEED_REASON
  });
});

// (N18) HONEST-EMPTY (HE-3b): no device can be called vulnerable or
// verified patched without a CVE feed / patched-baseline to check
// against. 0 vulnerable = none known; 0 patched = none verified patched.
router.get(['/ncmcompliance/getFirmVulDeviceSeverityStatus', '/api/ncmcompliance/getFirmVulDeviceSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Vulnerable Devices', count: 0 },
      { severity: 'Patched Devices', count: 0 }
    ],
    vulnerabilityFeed: null,
    reason: NO_VULN_FEED_REASON
  });
});

// (N19) Startup vs running, diffed from the configs actually fetched for
// the device (same source as /api/ccm/diff). No fetched pair means
// driftStatus/conflictingLines are null — never "In-Sync". There are no
// config version numbers in the store, so both versions are null too.
// ?deviceId= selects the device (404 when unknown); otherwise the first
// managed device is used, as before.
router.get(['/ncmconfig/getStartupRunningVersion', '/api/ncmconfig/getStartupRunningVersion'], (req, res) => {
  const { deviceId } = req.query;
  let dev = null;
  if (deviceId) {
    dev = getDevice(deviceId);
    if (!dev) {
      return res.status(404).json({
        status: 'error',
        message: `Device ${deviceId} not found`
      });
    }
  } else {
    const devices = listDevices() || [];
    dev = devices[0] || null;
  }

  if (!dev) {
    return res.json({
      status: 'success',
      device: 'No Devices',
      runningVersion: null,
      startupVersion: null,
      driftStatus: null,
      conflictingLines: null
    });
  }

  const running = latestConfigOfTypes(dev.id, RUNNING_TYPES);
  const startup = latestConfigOfTypes(dev.id, STARTUP_TYPES);
  if (!running || !startup) {
    return res.json({
      status: 'success',
      device: deviceLabel(dev),
      runningVersion: null,
      startupVersion: null,
      driftStatus: null,
      conflictingLines: null
    });
  }

  const diffCount = countDiffLines(splitLines(running.content), splitLines(startup.content));
  res.json({
    status: 'success',
    device: deviceLabel(dev),
    runningVersion: null,
    startupVersion: null,
    driftStatus: diffCount === 0 ? 'In-Sync' : 'Drift Detected',
    conflictingLines: diffCount
  });
});

// (N20) No hardware-lifecycle data (model/serial/purchase/warranty) is
// stored and no vendor EOL/EOS catalogue is consulted, so EOL, EOS and
// warranty state are unknown. activeHardware is the real device count.
router.get(['/ncmeol/getEolSummary', '/api/ncmeol/getEolSummary'], (req, res) => {
  const devices = listDevices() || [];
  res.json({
    status: 'success',
    activeHardware: devices.length,
    endOfLifeCount: null,
    endOfSupportCount: null,
    underWarranty: null
  });
});

// (N21) HONEST-EMPTY (HE-3b): no hardware lifecycle source exists —
// devices store no purchase/warranty/EOL dates and no vendor EOL/EOS
// catalogue is bundled in the repo — so no EOL date can be reported.
// Inventing one would be fake data.
router.get(['/ncmeol/getUpcomingEolDevices', '/api/ncmeol/getUpcomingEolDevices'], (req, res) => {
  res.json({
    status: 'success',
    devices: [],
    lifecycleSource: null,
    reason: 'No hardware lifecycle source exists: devices store no purchase/warranty/EOL dates and no vendor EOL/EOS catalogue is bundled in the repo, so no EOL date can be reported.'
  });
});

module.exports = router;
