'use strict';
/**
 * OpManager Central — NCM client service data (real-data branch).
 *
 * Rebuilt from the 2026-11-09 fake-data audits (ncm-traps-zia.md N1–N20,
 * auth.md A-10/A-11). Every value below comes from the authenticated
 * session (req.user) or from server/services/store.js (SQLite). Nothing is
 * hardcoded: no fixed administrator identity, no fixed licence, no invented
 * dashboards/views/maps/scores/CVEs, and no CSRF cookie is issued here.
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
const router = express.Router();
const store = require('../services/store');
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
const listRacks = () =>
  (store.racks ? store.racks.listRacks() : store.listRacks());

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
// SuperAdmin / Administrator: full access. Operator: read-only.
// Any other/unknown role: no permissions (fail closed).
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
  if (role === 'SuperAdmin' || role === 'Administrator') {
    for (const p of Object.keys(perms)) perms[p] = true;
  } else if (role === 'Operator') {
    for (const p of READ_PERMS) perms[p] = true;
  }
  return perms;
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
router.get(['/ncmclient/getClientServiceData', '/api/json/ncmclient/getClientServiceData'], (req, res) => {
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
// dropped sub-items are NOC Views + Custom Dashboards (no dashboard
// store), Virtualization + Storage (no such data), Custom Views (no view
// store), 3D Floor Views (no floor store), Layer2 Maps (no LLDP/CDP
// discovery), Compliance Audit (no compliance engine) and Configlets &
// Automation (no configlet store). A role with no read permissions gets [].
router.get(['/ncmclient/getMainMenuTabs', '/api/json/ncmclient/getMainMenuTabs'], (req, res) => {
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
router.get(['/ncmclient/getUserPreference', '/api/json/ncmclient/getUserPreference'], (req, res) => {
  res.json({
    DGroupNewView: false,
    theme: 'itom-grey-text-theme'
  });
});

// Dashboard List Endpoint (N5) — no dashboard store exists, so an empty
// system honestly returns empty lists instead of invented dashboards.
router.get(['/v2/dashboard/getDashboardList', '/api/v2/dashboard/getDashboardList', '/api/json/v2/dashboard/getDashboardList'], (req, res) => {
  res.json({
    defaultDashboards: [],
    customDashboards: []
  });
});

router.get(['/admin/getAccessibilityControls', '/api/admin/getAccessibilityControls', '/api/json/admin/getAccessibilityControls'], (req, res) => {
  res.json({
    skipToMainContent: true,
    magnifyText: false
  });
});

router.get(['/admin/getMessagesForPage', '/api/admin/getMessagesForPage', '/api/json/admin/getMessagesForPage'], (req, res) => {
  res.json({ messages: [] });
});

// (N6) No custom-view definitions are stored anywhere.
router.get(['/admin/listCustomViews', '/api/admin/listCustomViews', '/api/json/admin/listCustomViews'], (req, res) => {
  res.json({
    status: 'success',
    result: {
      views: []
    }
  });
});

// (N7) No CCTV/camera source exists in the app.
router.get(['/dashboard/listCCTVView', '/api/dashboard/listCCTVView', '/api/json/dashboard/listCCTVView'], (req, res) => {
  res.json([]);
});

// (N8) No business-view store exists.
router.get(['/tab/getTabViewDetails', '/api/tab/getTabViewDetails', '/api/json/tab/getTabViewDetails'], (req, res) => {
  res.json({
    bvDetails: {
      List: []
    }
  });
});

// (N9) No floor/plan store exists.
router.get(['/maps/listFloors', '/api/maps/listFloors', '/api/json/maps/listFloors'], (req, res) => {
  res.json([]);
});

// Real racks from the store (racks table); [] until a rack is created.
router.get(['/maps/listRacks', '/api/maps/listRacks', '/api/json/maps/listRacks'], (req, res) => {
  const racks = listRacks() || [];
  res.json(racks.map((r) => ({ rackId: r.id, displayName: r.name })));
});

// (N10) No Layer-2 discovery (LLDP/CDP, MAC tables) runs anywhere.
router.get(['/maps/getLayer2Maps', '/api/maps/getLayer2Maps', '/api/json/maps/getLayer2Maps'], (req, res) => {
  res.json([]);
});

// (N11) No security score is computed: no control (auth/MFA, TLS, patch
// state, password policy, ...) is evaluated anywhere, so there is no
// score, grade or verdict to report.
router.get(['/v2/admin/getSecurityScore', '/api/v2/admin/getSecurityScore', '/api/json/v2/admin/getSecurityScore', '/client/api/json/v2/admin/getSecurityScore'], (req, res) => {
  res.json({ SecurityScore: null, score: null, grade: null, status: null });
});

// (N12) No .wav file exists anywhere in the repo (no public/audio/
// directory), so no sound files are offered.
router.get(['/admin/getWebAlarmSoundFiles', '/api/admin/getWebAlarmSoundFiles', '/api/json/admin/getWebAlarmSoundFiles'], (req, res) => {
  res.json([]);
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

router.get(['/admin/listAllLogicalGroups', '/api/admin/listAllLogicalGroups', '/api/json/admin/listAllLogicalGroups'], (req, res) => {
  res.json([]);
});

// Device group view preference
router.get(['/api/json/user/getDeviceGroupViewPreference', '/user/getDeviceGroupViewPreference'], (req, res) => {
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

// (N14) No compliance engine exists: no rule is ever evaluated against
// any fetched config, so zero devices are measured compliant and zero
// violations are measured. 0/0/0 is the honest count, not 12/3/1.
router.get(['/ncmdashboard/getComplianceStatus', '/api/ncmdashboard/getComplianceStatus'], (req, res) => {
  res.json({
    status: 'success',
    columns: [{ columnname: 'Severity', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { severity: 'Compliant (Pass)', count: 0 },
      { severity: 'Minor Deviation', count: 0 },
      { severity: 'Critical Violation', count: 0 }
    ]
  });
});

// (N15) No config-change audit log exists (no change history is recorded
// anywhere), so no change can be classified authorised or unauthorised.
router.get(['/ncmreports/getconfigChangesStatus', '/api/ncmreports/getconfigChangesStatus'], (req, res) => {
  res.json({
    status: 'success',
    columns: [{ columnname: 'Type', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { type: 'Authorized Changes', count: 0 },
      { type: 'Unauthorized / Unscheduled', count: 0 }
    ]
  });
});

// (N16) No firmware inventory is collected and no CVE feed is queried, so
// there are no vulnerability findings to report.
router.get(['/ncmcompliance/getFirmVulnDetails', '/api/ncmcompliance/getFirmVulnDetails'], (req, res) => {
  res.json({
    status: 'success',
    totalVulnerabilities: 0,
    cveList: []
  });
});

// (N17) Severity counts aggregated from the (empty) CVE result above.
router.get(['/ncmcompliance/getFirmVulCveSeverityStatus', '/api/ncmcompliance/getFirmVulCveSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Critical', count: 0 },
      { severity: 'High', count: 0 },
      { severity: 'Medium', count: 0 },
      { severity: 'Low', count: 0 }
    ]
  });
});

// (N18) Per-device vulnerability state is unknown: no device is known
// vulnerable (0) and none is verified patched (0). The old code also had
// a latent crash here — it referenced `devices` without defining it.
router.get(['/ncmcompliance/getFirmVulDeviceSeverityStatus', '/api/ncmcompliance/getFirmVulDeviceSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Vulnerable Devices', count: 0 },
      { severity: 'Patched Devices', count: 0 }
    ]
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

router.get(['/ncmeol/getUpcomingEolDevices', '/api/ncmeol/getUpcomingEolDevices'], (req, res) => {
  res.json({
    status: 'success',
    devices: []
  });
});

module.exports = router;
