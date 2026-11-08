const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine OpManager Client Service Data Endpoint
router.get(['/ncmclient/getClientServiceData', '/api/json/ncmclient/getClientServiceData'], (req, res) => {
  const central = db.getCentral();
  const probes = db.getProbes();
  const devices = db.getDevices();

  // Set CSRF cookie expected by ManageEngine client
  res.cookie('opmcsrfcookie', 'OPM_CENTRAL_AUTH_TOKEN_77a82b9', { path: '/' });

  // Map probe IDs as array for probeUp and probeDown
  const probeUpIds = probes
    .filter(p => p.status === 'Connected' || p.status === 'Online')
    .map((p, idx) => parseInt(String(p.id).replace(/\D/g, '') || (idx + 1), 10));
  const probeDownIds = probes
    .filter(p => p.status !== 'Connected' && p.status !== 'Online')
    .map((p, idx) => parseInt(String(p.id).replace(/\D/g, '') || (idx + 1), 10));

  res.json({
    status: 'success',
    userMeta: {
      userId: 1,
      name: 'administrator',
      userName: 'administrator',
      displayName: 'Enterprise Administrator',
      superAdminPasswordChanged: true,
      showSSLRestartAlert: false,
      isSuperAdmin: true,
      isAdministrator: true,
      isCentralUser: true,
      isAllModulesFullAccessAdmin: true,
      isAllCoreModulesFullAccessAdmin: true,
      isNotMSPAdmin: true,
      isNotMspAdmin: true,
      userLocale: 'en-US',
      language: 'en',
      locale: 'en_US',
      timeFormat: 'yyyy-MM-dd HH:mm:ss',
      timeZone: 'Asia/Karachi',
      showWorkflow: true,
      showDBQuery: true,
      showGettingStarted: false,
      isOPMPlug: true,
      isNCMPlug: true,
      isNFAPlug: true,
      isStoragePlug: true,
      isAPMPlug: false,
      isFWAPlug: false,
      isOPUPlug: true,
      isLiveChatVisible: false,
      autoRefresh: 30,
      sessionTimeout: 1800,
      permissions: {
        dashboardRead: true,
        dashboardWrite: true,
        inventoryRead: true,
        inventoryWrite: true,
        alarmsRead: true,
        alarmsWrite: true,
        reportsRead: true,
        reportsWrite: true,
        settingsRead: true,
        settingsWrite: true,
        enterpriseSettingsRead: true,
        enterpriseSettingsWrite: true,
        ncmDevMgmtRead: true,
        ncmDevMgmtWrite: true,
        ncmConfigRead: true,
        ncmConfigWrite: true
      }
    },
    productMeta: {
      productName: 'OpManager Central',
      productShortName: 'opm',
      productVersion: central.version || '12.9.203',
      buildNumber: '129203',
      releaseDate: '2026',
      productType: 'Central',
      serverMode: 'Active-Primary',
      restApiVersion: 'v3',
      isOSCompatible: true,
      isPatchRestartRequired: false,
      isOPM: true,
      isOPMEE: true,
      isNCMEE: true,
      isNFAEE: false,
      isFWAEE: false,
      isOPMCentral: true,
      isOPMCentral_OR_OPMPlusCentral: true,
      isCentralServer: true,
      isProbe: false,
      isMSPCentral: false,
      isMSPEdition: false,
      isMSPProbe: false,
      isNCMCentral: true,
      isNCM: true,
      isNFACentral: false,
      isNFA: false,
      isFWACentral: false,
      isFWA: false,
      isFreeEdition: false,
      isEvalUser: false,
      isDemoProduct: false,
      isWindows: false,
      v3Client: true,
      timeZone: 'Asia/Karachi',
      centralStatus: 'active',
      probeUp: probeUpIds,
      probeDown: probeDownIds,
      centralUrl: 'http://localhost:8060',
      apmInstallationStatus: 'NotInstalled',
      isAPMInstalled: false,
      isAPMFOSNotInstalled: true,
      isMultiLanguageSupported: true
    },
    rebrandMeta: {
      companyName: 'ZOHO Corp.',
      productName: 'OpManager Central',
      productLogoUrl: '/assets/opmanager-logo.svg',
      brandSubTitle: 'ZOHO Corp',
      copyrightText: '© 2026 ZOHO Corp. All rights reserved.',
      showLogo: true
    },
    licenseMeta: {
      isLicenseExceeded: false,
      licenseType: 'Enterprise Central Edition',
      licensedTo: 'Global Enterprise Network Operations Center',
      expiryDate: '2028-12-31',
      daysRemaining: 730,
      totalProbesAllowed: 50,
      probesRegistered: probes.length,
      totalDevicesMonitored: devices.length,
      maxDevicesAllowed: 10000,
      status: 'Active / Valid'
    },
    mspMeta: {
      isMSP: false,
      tenantId: 'global'
    }
  });
});

// Authentic ManageEngine Menu Tabs Structure Endpoint (Must return ARRAY of tabs)
router.get(['/ncmclient/getMainMenuTabs', '/api/json/ncmclient/getMainMenuTabs'], (req, res) => {
  res.cookie('opmcsrfcookie', 'OPM_CENTRAL_AUTH_TOKEN_77a82b9', { path: '/' });

  const menuTabs = [
    {
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
        },
        {
          tabIdentifier: 'Dashboard_NOC',
          name: 'NOC Views',
          displayName: 'NOC Views',
          link: '/noc',
          type: 'url',
          target: '_blank'
        },
        {
          tabIdentifier: 'Dashboard_Custom',
          name: 'Custom Dashboards',
          displayName: 'Custom Dashboards',
          link: '#/dashboard',
          type: 'url'
        }
      ]
    },
    {
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
          tabIdentifier: 'Monitoring_Virtualization',
          name: 'Virtualization',
          displayName: 'Virtualization',
          link: '#/inventory?type=virtual',
          type: 'url'
        },
        {
          tabIdentifier: 'Monitoring_Storage',
          name: 'Storage',
          displayName: 'Storage',
          link: '#/inventory?type=storage',
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
    },
    {
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
        },
        {
          tabIdentifier: 'Alarms_Custom',
          name: 'Custom Views',
          displayName: 'Custom Views',
          link: 'alarms.list',
          model: 'active',
          type: 'route'
        }
      ]
    },
    {
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
          tabIdentifier: 'Maps_3DFloor',
          name: '3D Floor Views',
          displayName: '3D Floor Views',
          link: '#/maps',
          type: 'url'
        },
        {
          tabIdentifier: 'Maps_3DRack',
          name: '3D Rack Views',
          displayName: '3D Rack Views',
          link: '#/maps',
          type: 'url'
        },
        {
          tabIdentifier: 'Maps_Layer2',
          name: 'Layer2 Maps',
          displayName: 'Layer2 Maps',
          link: '#/maps',
          type: 'url'
        }
      ]
    },
    {
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
        },
        {
          tabIdentifier: 'NCM_Compliance',
          name: 'Compliance Audit',
          displayName: 'Compliance Audit',
          link: '#/configuration',
          type: 'url'
        },
        {
          tabIdentifier: 'NCM_Automation',
          name: 'Configlets & Automation',
          displayName: 'Configlets & Automation',
          link: '#/configuration',
          type: 'url'
        }
      ]
    },
    {
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
    },
    {
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
    }
  ];

  res.json(menuTabs);
});

// User Preference Endpoint
router.get(['/ncmclient/getUserPreference', '/api/json/ncmclient/getUserPreference'], (req, res) => {
  res.json({
    DGroupNewView: false,
    theme: 'itom-grey-text-theme'
  });
});

// Dashboard List Endpoint
router.get(['/v2/dashboard/getDashboardList', '/api/v2/dashboard/getDashboardList', '/api/json/v2/dashboard/getDashboardList'], (req, res) => {
  res.json({
    defaultDashboards: [
      {
        productName: 'OPM',
        dashboardId: 1,
        displayName: 'Central NOC Overview',
        dashboardName: 'dashboard.name.systemPerformancedashboard'
      },
      {
        productName: 'OPM',
        dashboardId: 2,
        displayName: 'Probe Distribution Health',
        dashboardName: 'probeHealthDashboard'
      },
      {
        productName: 'NCM',
        dashboardId: 3,
        displayName: 'Configuration Compliance NOC',
        dashboardName: 'ncmOverviewDashboard'
      },
      {
        productName: 'Storage',
        dashboardId: 4,
        displayName: 'Enterprise Storage Infrastructure',
        dashboardName: 'storageOverviewDashboard'
      }
    ],
    customDashboards: [
      {
        dashboardId: 101,
        displayName: 'Executive SLA & Latency',
        dashboardName: 'execSlaDashboard'
      }
    ]
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

router.get(['/admin/listCustomViews', '/api/admin/listCustomViews', '/api/json/admin/listCustomViews'], (req, res) => {
  res.json({
    status: 'success',
    result: {
      views: [
        { viewId: 'critical_alarms', viewName: 'Critical Alarms (<15m)' },
        { viewId: 'probe_connectivity', viewName: 'Probe Connectivity Alarms' },
        { viewId: 'core_switches', viewName: 'Core Switch Infrastructure' }
      ]
    }
  });
});

router.get(['/dashboard/listCCTVView', '/api/dashboard/listCCTVView', '/api/json/dashboard/listCCTVView'], (req, res) => {
  res.json([
    { id: 1, name: 'Global NOC Wallboard', description: 'Centralized live CCTV monitoring rotation' },
    { id: 2, name: 'Core Router & Backbone NOC', description: 'Real-time telemetry and alarms' }
  ]);
});

router.get(['/tab/getTabViewDetails', '/api/tab/getTabViewDetails', '/api/json/tab/getTabViewDetails'], (req, res) => {
  res.json({
    bvDetails: {
      List: [
        { bvName: 'Global_Core_Topology', bvLabel: 'Global Core Topology' },
        { bvName: 'Regional_DataCenters', bvLabel: 'Regional DataCenters' }
      ]
    }
  });
});

router.get(['/maps/listFloors', '/api/maps/listFloors', '/api/json/maps/listFloors'], (req, res) => {
  res.json([
    { floorId: 'dc_floor_1', displayName: 'Primary DC - Floor 1' }
  ]);
});

router.get(['/maps/listRacks', '/api/maps/listRacks', '/api/json/maps/listRacks'], (req, res) => {
  const racks = db.getRacks ? db.getRacks() : [];
  res.json(racks.map(r => ({ rackId: r.rackId || r.id, displayName: r.name })));
});

router.get(['/maps/getLayer2Maps', '/api/maps/getLayer2Maps', '/api/json/maps/getLayer2Maps'], (req, res) => {
  res.json([
    { mapId: 'l2_core_fabric', mapName: 'Core L2 Fabric Mesh' }
  ]);
});

router.get(['/v2/admin/getSecurityScore', '/api/v2/admin/getSecurityScore', '/api/json/v2/admin/getSecurityScore', '/client/api/json/v2/admin/getSecurityScore'], (req, res) => {
  res.json({ SecurityScore: 96, score: 96, grade: 'Secure', status: 'Compliant' });
});

router.get(['/admin/getWebAlarmSoundFiles', '/api/admin/getWebAlarmSoundFiles', '/api/json/admin/getWebAlarmSoundFiles'], (req, res) => {
  res.json([
    { fileName: 'bell.wav', filePath: '/audio/bell.wav' },
    { fileName: 'chime.wav', filePath: '/audio/chime.wav' },
    { fileName: 'critical.wav', filePath: '/audio/critical.wav' }
  ]);
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

// Authentic ManageEngine NCM Dashboard Charts
router.get(['/ncmdashboard/getConfigConflictStatus', '/api/ncmdashboard/getConfigConflictStatus'], (req, res) => {
  res.json({
    status: 'success',
    columns: [{ columnname: 'Type', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { type: 'Synchronized (No Drift)', count: 14 },
      { type: 'Startup-Running Conflict', count: 2 }
    ]
  });
});

router.get(['/ncmdashboard/getComplianceStatus', '/api/ncmdashboard/getComplianceStatus'], (req, res) => {
  res.json({
    status: 'success',
    columns: [{ columnname: 'Severity', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { severity: 'Compliant (Pass)', count: 12 },
      { severity: 'Minor Deviation', count: 3 },
      { severity: 'Critical Violation', count: 1 }
    ]
  });
});

router.get(['/ncmreports/getconfigChangesStatus', '/api/ncmreports/getconfigChangesStatus'], (req, res) => {
  res.json({
    status: 'success',
    columns: [{ columnname: 'Type', datatype: 'ordinal' }, { columnname: 'Count', datatype: 'numeric' }],
    data: [
      { type: 'Authorized Changes', count: 28 },
      { type: 'Unauthorized / Unscheduled', count: 2 }
    ]
  });
});

// Firmware Vulnerability CVE Feeds
router.get(['/ncmcompliance/getFirmVulnDetails', '/api/ncmcompliance/getFirmVulnDetails'], (req, res) => {
  res.json({
    status: 'success',
    totalVulnerabilities: 3,
    cveList: [
      { cveId: 'CVE-2023-20198', severity: 'Critical', score: 10.0, vendor: 'Cisco Systems', advisory: 'Cisco IOS XE Web UI Privilege Escalation', impactedDevices: 1, remediated: false },
      { cveId: 'CVE-2024-3400', severity: 'Critical', score: 10.0, vendor: 'Palo Alto Networks', advisory: 'PAN-OS Command Injection in GlobalProtect', impactedDevices: 1, remediated: true },
      { cveId: 'CVE-2023-27997', severity: 'High', score: 9.8, vendor: 'Fortinet', advisory: 'FortiOS SSL-VPN Heap Buffer Overflow', impactedDevices: 1, remediated: true }
    ]
  });
});

router.get(['/ncmcompliance/getFirmVulCveSeverityStatus', '/api/ncmcompliance/getFirmVulCveSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Critical', count: 2 },
      { severity: 'High', count: 1 },
      { severity: 'Medium', count: 0 },
      { severity: 'Low', count: 0 }
    ]
  });
});

router.get(['/ncmcompliance/getFirmVulDeviceSeverityStatus', '/api/ncmcompliance/getFirmVulDeviceSeverityStatus'], (req, res) => {
  res.json({
    status: 'success',
    data: [
      { severity: 'Vulnerable Devices', count: 0 },
      { severity: 'Patched Devices', count: devices.length }
    ]
  });
});

// Startup vs Running Config Versions
router.get(['/ncmconfig/getStartupRunningVersion', '/api/ncmconfig/getStartupRunningVersion'], (req, res) => {
  const devices = db.getDevices();
  const firstDev = devices[0];
  res.json({
    status: 'success',
    device: firstDev ? firstDev.name : 'No Devices',
    runningVersion: 'v1.0 (Synchronized)',
    startupVersion: 'v1.0 (Baseline)',
    driftStatus: 'In-Sync',
    conflictingLines: 0
  });
});

// Hardware EOL / EOS Summaries
router.get(['/ncmeol/getEolSummary', '/api/ncmeol/getEolSummary'], (req, res) => {
  const devices = db.getDevices();
  res.json({
    status: 'success',
    activeHardware: devices.length,
    endOfLifeCount: 0,
    endOfSupportCount: 0,
    underWarranty: devices.length
  });
});

router.get(['/ncmeol/getUpcomingEolDevices', '/api/ncmeol/getUpcomingEolDevices'], (req, res) => {
  res.json({
    status: 'success',
    devices: []
  });
});

module.exports = router;
