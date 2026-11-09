/**
 * ManageEngine OpManager Central (Version 12.9.204-GA)
 * Authentic Enterprise Suite for Zoho ITOM Ember Framework
 * 100% Identical Replica: Official Logo, Multi-Tab Device Snapshot,
 * Rich Enterprise Dashboard Widgets, Inventory Bulk Actions & Pagination,
 * Alarms Severity Dials, 3D Rack & STP Maps, NCM Diff Viewer & Agent Downloads.
 */
(function() {
  'use strict';

  // --- GLOBAL STATE ---
  const state = {
    currentTab: 'dashboard',
    subTabs: {
      dashboard: 'overview',
      inventory: 'devices',
      alarms: 'active',
      maps: 'business',
      configuration: 'compliance',
      reports: 'sla',
      settings: 'probes'
    },
    selectedProbe: 'all',
    inventoryFilter: 'all',
    searchQuery: '',
    autoRefreshInterval: 30,
    autoRefreshCountdown: 30,
    addedWidgets: [],
    configDriftFixed: false,
    selectedAlarm: null,
    selectedDeviceCheckboxCount: 0,
    alarmsSeverityFilter: 'all',
    alarmsCategoryFilter: 'all',
    alarmsViewMode: 'list',
    nocDarkMode: false,
    syncCountdown: 15,
    devices: [],
    // Real-data only: probes and templates start EMPTY and are filled solely
    // by loadBackendData() (06_router_and_init.js) from GET /api/probes and
    // GET /api/settings/templates. Never seed demo rows here — with no API
    // data yet the UI shows honest empty states ("No probes registered").
    probes: [],
    alarms: [],
    // Collections with no real loader yet (verified: nothing in 01/06/app.js
    // ever assigns them). They stay empty so their widgets/tables render
    // honest empty states; populate one only by adding a real fetch in 06's
    // loadBackendData() — never by seeding demo rows here.
    topInterfaces: [],
    diskVolumes: [],
    virtualMachines: [],
    flowExporters: [],
    ncmAudits: [],
    discoveryRules: [],
    agents: [],
    currentTmplCategory: 'all',
    tmplSearchQuery: '',
    templates: []
  };
  state.interfaces = [];

  // --- REAL-PROBE HEADER HELPERS ---
  // The probe switcher shows ONLY probes returned by GET /api/probes (loaded
  // by 06's loadBackendData()/WebSocket). With none registered the header
  // says "No probes registered" instead of showing a fake local probe.
  function resolveProbeLabel() {
    if (!state.probes || state.probes.length === 0) return 'No probes registered';
    const activeProbe = state.probes.find(p => p.id == state.selectedProbe);
    return activeProbe ? activeProbe.name : 'All Probes';
  }

  // Count of probes whose real API status is Online (server derives this
  // from a recent heartbeat; a probe with no/unknown status is not counted).
  function probeOnlineCount() {
    return (state.probes || []).filter(p => String(p.status || '').toLowerCase() === 'online').length;
  }

  // Keep the header probe button + footer probe count in sync with live
  // state after 06 replaces state.probes. Only writes to the DOM when the
  // text actually changed. Driven by a guarded 1s interval started in
  // ensureOverlayContainer() (the old clock tick, initClockAndTimers, is
  // never invoked anywhere, so this does not ride on it).
  let probeSyncInterval = null;
  let lastProbeLabel = null;
  let lastFooterProbeText = null;
  function syncProbeHeader() {
    const labelEl = document.getElementById('opm-probe-name-display');
    const label = resolveProbeLabel();
    if (labelEl && label !== lastProbeLabel) {
      labelEl.innerText = label;
      lastProbeLabel = label;
    }
    const dotEl = document.getElementById('opm-probe-status-dot');
    if (dotEl) {
      const anyOnline = probeOnlineCount() > 0;
      dotEl.style.background = anyOnline ? '#22c55e' : '#64748b';
      dotEl.style.boxShadow = anyOnline ? '0 0 5px #22c55e' : 'none';
    }
    const footerEl = document.getElementById('opm-footer-probes');
    if (footerEl) {
      const text = probeOnlineCount() + ' / ' + state.probes.length + ' Online';
      if (text !== lastFooterProbeText) {
        footerEl.innerText = text;
        lastFooterProbeText = text;
      }
    }
  }

  // Helper Toast Notification
  function showToast(message, type = 'success') {
    let toast = document.getElementById('opm-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'opm-live-toast';
      toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 100000; padding: 12px 20px; border-radius: 4px; font-family: Roboto, -apple-system, sans-serif; font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 8px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);';
      document.body.appendChild(toast);
    }
    if (type === 'success') {
      toast.style.background = '#15803d';
      toast.style.color = '#ffffff';
      toast.innerHTML = '<span style="font-size: 15px;">✓</span> ' + message;
    } else {
      toast.style.background = '#b91c1c';
      toast.style.color = '#ffffff';
      toast.innerHTML = '<span style="font-size: 15px;">⚠</span> ' + message;
    }
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3200);
  }

  // Ensure Global Reset Styles (Eliminates fluidicv2 50px body padding & bg-1.jpg texture)
  function ensureGlobalStyles() {
    if (!document.getElementById('opm-fluidicv3-reset')) {
      const style = document.createElement('style');
      style.id = 'opm-fluidicv3-reset';
      style.textContent = `
        html {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          height: auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
        }
        body, body.NavText, body.NavHovered {
          margin: 0 !important;
          padding: 0 !important;
          background: #f4f6f9 !important;
          background-image: none !important;
          width: 100% !important;
          min-height: 100vh !important;
          height: auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          float: none !important;
          position: relative !important;
        }
        #opm-custom-suite-container {
          width: 100% !important;
          min-height: calc(100vh - 114px) !important;
          background: #f4f6f9 !important;
          display: block !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
          padding-bottom: 50px !important;
          box-sizing: border-box !important;
          float: none !important;
          position: relative !important;
        }
        #header, #nav, #PageSideBar, #main-nav .sub-main-nav,
        .web-alarm-notification, .notification-popup, .alarm-popup-container {
          display: none !important;
        }
        #main-header {
          margin: 0 !important;
          width: 100% !important;
        }
        #main-header .logo-section .relative,
        #main-header #main-nav .main-nav > ul > li > a.nav-link .submenu-icon,
        #main-header #main-nav .main-nav > ul > li > a.nav-link::after,
        #main-header #main-nav > ul > li > a.nav-link .submenu-icon,
        #main-header #main-nav > ul > li > a.nav-link::after {
          display: none !important;
        }
        #main-header {
          margin: 0 !important;
          width: 100% !important;
          height: 50px !important;
          max-height: 50px !important;
          min-height: 50px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        #main-header #main-nav,
        #main-header #main-nav ul,
        #main-header #main-nav ul.main-nav {
          height: 50px !important;
          max-height: 50px !important;
          min-height: 50px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #main-header #main-nav li,
        #main-header #main-nav li.active-menu,
        #main-header #main-nav ul.main-nav > li {
          height: 50px !important;
          max-height: 50px !important;
          min-height: 50px !important;
          overflow: hidden !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        #main-header #main-nav .main-nav > ul > li > a.nav-link,
        #main-header #main-nav > ul > li > a.nav-link,
        #main-header #main-nav a.opm-main-nav-tab {
          height: 50px !important;
          max-height: 50px !important;
          min-height: 50px !important;
          line-height: 50px !important;
          padding: 0 16px !important;
          margin: 0 !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #e2e8f0 !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0px !important;
          overflow: hidden !important;
          transform: none !important;
        }
        #main-header #main-nav a.nav-link:focus,
        #main-header #main-nav a.nav-link:focus-visible,
        #main-header #main-nav a.nav-link:active,
        #main-header #main-nav a.opm-main-nav-tab:focus,
        #main-header #main-nav a.opm-main-nav-tab:focus-visible,
        #main-header #main-nav a.opm-main-nav-tab:active,
        #main-header #main-nav li:focus,
        #main-header #main-nav li:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        #main-header #main-nav .main-nav > ul > li > a.nav-link.active,
        #main-header #main-nav > ul > li > a.nav-link.active,
        #main-header #main-nav a.opm-main-nav-tab.active {
          background: #49bd80 !important;
          background-color: #49bd80 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          height: 50px !important;
          max-height: 50px !important;
          line-height: 50px !important;
          padding: 0 16px !important;
          margin: 0 !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0px !important;
          transform: none !important;
        }
        #main-header #main-nav a .menu-name {
          font-size: 13px !important;
          line-height: 50px !important;
          height: 50px !important;
          display: inline-flex !important;
          align-items: center !important;
          color: inherit !important;
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          outline: none !important;
        }
        .opm-widget-card {
          border-radius: 3px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important;
        }
        .opm-widget-card > div:first-child {
          background: #f5f5f5 !important;
          border-bottom: 1px solid #e8e8e8 !important;
          padding: 10px 14px !important;
        }
        @keyframes opmPacketFlow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        
        /* NOC Wallboard Dark Theme */
        body.opm-noc-dark,
        body.opm-noc-dark #opm-custom-suite-container {
          background: #090d16 !important;
          color: #e2e8f0 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar {
          background: #0d1322 !important;
          border-color: #1e293b !important;
          color: #94a3b8 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar a {
          color: #38bdf8 !important;
        }
        body.opm-noc-dark #opm-header-subnav-bar span {
          color: #94a3b8 !important;
        }
        body.opm-noc-dark #opm-live-server-clock {
          color: #cbd5e1 !important;
        }
        body.opm-noc-dark .opm-widget-card {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #e2e8f0 !important;
        }
        body.opm-noc-dark .opm-widget-card > div:first-child {
          background: #162032 !important;
          border-color: #1f2937 !important;
          color: #f8fafc !important;
        }
        body.opm-noc-dark table thead tr {
          background: #162032 !important;
          color: #94a3b8 !important;
        }
        body.opm-noc-dark table tbody tr {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #cbd5e1 !important;
        }
        body.opm-noc-dark table tbody tr:hover {
          background: #1e293b !important;
        }
        body.opm-noc-dark div[style*="background: #ffffff"],
        body.opm-noc-dark div[style*="background: rgb(255, 255, 255)"],
        body.opm-noc-dark div[style*="background:#ffffff"] {
          background: #111827 !important;
          border-color: #1f2937 !important;
          color: #cbd5e1 !important;
        }

        .opm-packet-flow {
          animation: opmPacketFlow 1s linear infinite !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
    const uiLib = document.querySelector('.ember-ui-library');
    if (uiLib && !uiLib.classList.contains('itom-theme')) {
      uiLib.classList.add('itom-theme');
    }
    if (document.body) {
      document.body.style.setProperty('padding', '0px', 'important');
      document.body.style.setProperty('margin', '0px', 'important');
      document.body.style.setProperty('background', '#f4f6f9', 'important');
      document.body.style.setProperty('background-image', 'none', 'important');
    }
  }

  // Ensure Overlay Container (placed cleanly beneath #main-header)
  
  // Ensure Authentic ManageEngine Standalone #main-header (Top Primary Navigation)
  function ensureMainHeader() {
    let header = document.getElementById('main-header');
    if (!header) {
      header = document.createElement('header');
      header.id = 'main-header';
      header.style.cssText = 'width: 100%; height: 50px; background: #212121; color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; box-sizing: border-box; z-index: 1000; position: sticky; top: 0; font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.15);';

      const currentTab = state.currentTab || 'dashboard';
      const tabs = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'alarms', name: 'Alarms' },
        { id: 'maps', name: 'Maps' },
        { id: 'configuration', name: 'Configuration' },
        { id: 'reports', name: 'Reports' },
        { id: 'settings', name: 'Settings' }
      ];

      let tabsHtml = '';
      tabs.forEach(t => {
        const isAct = t.id === currentTab;
        tabsHtml += `
          <li class="${isAct ? 'active-menu' : ''}" style="list-style: none; display: inline-flex; align-items: center; justify-content: center; height: 50px; max-height: 50px; overflow: hidden; margin: 0; padding: 0; border: none; outline: none;">
            <a href="#/${t.id}" class="nav-link opm-main-nav-tab ${isAct ? 'active' : ''}" data-tab="${t.id}" style="color: ${isAct ? '#ffffff' : '#e2e8f0'}; text-decoration: none; font-size: 13px; font-weight: ${isAct ? '600' : '500'}; padding: 0 16px; height: 50px; max-height: 50px; line-height: 50px; display: inline-flex; align-items: center; justify-content: center; background: ${isAct ? '#49bd80' : 'transparent'}; border: none; outline: none; box-shadow: none; border-radius: 0; transition: all 0.15s; letter-spacing: 0.2px;">
              <span class="menu-name" style="color: ${isAct ? '#ffffff' : '#e2e8f0'}; font-size: 13px; line-height: 50px; height: 50px; display: inline-flex; align-items: center;">${t.name}</span>
            </a>
          </li>
        `;
      });

      const probeName = resolveProbeLabel();
      const probeDotOn = probeOnlineCount() > 0;

      header.innerHTML = `
        <!-- Left: Logo -->
        <div class="logo-section" style="display: flex; align-items: center;">
          <div class="logo">
            <a href="#/dashboard" style="display: flex; align-items: center; text-decoration: none; gap: 8px;">
              <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine OpManager" style="height: 26px; width: auto; vertical-align: middle;">
              <span style="font-size: 16px; font-weight: 600; color: #ffffff; letter-spacing: -0.2px; font-family: Lato, sans-serif;">Central</span>
              <span style="background: #49bd80; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 2px; letter-spacing: 0.8px;">ENTERPRISE</span>
            </a>
          </div>
        </div>

        <!-- Center: Primary Navigation Tabs -->
        <nav id="main-nav" style="display: flex; align-items: center; height: 100%;">
          <ul class="main-nav" style="display: flex; align-items: center; margin: 0; padding: 0; height: 100%;">
            ${tabsHtml}
          </ul>
        </nav>

        <!-- Right: Search, Probe Selector, Quick Actions & Profile -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Quick Omnibox Search -->
          <div id="opm-header-search-box" style="position: relative; display: flex; align-items: center;">
            <input type="text" id="opm-header-search-input" placeholder="Search devices, alarms, IPs... (Ctrl+K)" style="background: #111827; border: 1px solid #374151; color: #f8fafc; font-size: 11px; border-radius: 4px; padding: 6px 28px 6px 10px; width: 220px; outline: none; transition: width 0.2s;" onfocus="this.style.width='270px'; this.style.borderColor='#0070e0';" onblur="this.style.width='220px'; this.style.borderColor='#374151';">
            <span style="position: absolute; right: 8px; color: #64748b; font-size: 12px; pointer-events: none;">🔍</span>
          </div>

          <!-- Probe Switcher Dropdown Button -->
          <div id="itom-probe-selector-container" style="position: relative;">
            <button id="itom-probe-selector-btn" style="background: #111827; border: 1px solid #374151; color: #ffffff; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <span id="opm-probe-status-dot" style="width: 7px; height: 7px; border-radius: 50%; background: ${probeDotOn ? '#22c55e' : '#64748b'}; box-shadow: ${probeDotOn ? '0 0 5px #22c55e' : 'none'};"></span>
              <span class="zselectbox__selected" id="opm-probe-name-display">${probeName}</span>
              <span style="font-size: 9px; color: #94a3b8;">▼</span>
            </button>
          </div>

          <!-- Add Quick Action Button (+) -->
          <button id="opm-quick-add-btn" title="Add Device / Add Discovery Rule" style="background: #0070e0; color: #ffffff; border: none; width: 28px; height: 28px; border-radius: 4px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">
            +
          </button>

          <!-- Bell Notifications Button -->
          <button id="opm-header-bell-btn" data-fsoqa="user-notifications" title="Active Alarms Drawer" style="background: transparent; border: none; color: #cbd5e1; font-size: 16px; cursor: pointer; position: relative; padding: 4px 6px;">
            🔔
            <span class="opm-bell-badge" style="position: absolute; top: -2px; right: -2px; background: #dc2626; color: #ffffff; border-radius: 9px; font-size: 10px; font-weight: 700; padding: 1px 5px; min-width: 14px; text-align: center; line-height: 13px; display: ${(state.alarms && state.alarms.length > 0) ? 'inline-block' : 'none'};">${(state.alarms && state.alarms.length) || 0}</span>
          </button>

          <!-- Admin Avatar & Profile -->
          <div id="opm-header-user-btn" style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0070e0; color: #ffffff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
              A
            </div>
            <span style="font-size: 12px; font-weight: 600; color: #ffffff;">admin</span>
            <span style="font-size: 9px; color: #94a3b8;">▼</span>
          </div>
        </div>
      `;

      if (document.body.firstChild) {
        document.body.insertBefore(header, document.body.firstChild);
      } else {
        document.body.appendChild(header);
      }

      // Wire header button clicks
      const searchInput = header.querySelector('#opm-header-search-input');
      if (searchInput) {
        searchInput.onclick = (e) => {
          e.stopPropagation();
          if (typeof showGlobalSearchModal === 'function') showGlobalSearchModal();
        };
      }

      const probeBtn = header.querySelector('#itom-probe-selector-btn');
      if (probeBtn) {
        probeBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof showProbeSelectorDropdown === 'function') showProbeSelectorDropdown(probeBtn);
        };
      }

      const addBtn = header.querySelector('#opm-quick-add-btn');
      if (addBtn) {
        addBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof showAddDeviceModal === 'function') showAddDeviceModal();
        };
      }

      const bellBtn = header.querySelector('#opm-header-bell-btn');
      if (bellBtn) {
        bellBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof openAlarmDrawer === 'function') openAlarmDrawer();
          else if (typeof showAlarmDetailsDrawer === 'function') showAlarmDetailsDrawer();
        };
      }

      const userBtn = header.querySelector('#opm-header-user-btn');
      if (userBtn) {
        userBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof showAboutModal === 'function') showAboutModal();
        };
      }
    }
    if (!header.parentNode && document.body) {
      document.body.insertBefore(header, document.body.firstChild);
    }
    return header;
  }

  function ensureOverlayContainer() {
    ensureGlobalStyles();
    const header = ensureMainHeader();
    ensureSubnavBreadcrumbsBar();
    syncHeaderTabs(state.currentTab);
    let container = document.getElementById('opm-custom-suite-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'opm-custom-suite-container';
      container.style.cssText = 'width: 100%; min-height: calc(100vh - 50px); padding-bottom: 28px; background: #f4f6f9; display: block; overflow-x: hidden;';
    }

    // Ensure Authentic ManageEngine Fixed Bottom Status Bar (24px Footer)
    let statusBar = document.getElementById('opm-bottom-status-bar');
    if (!statusBar && document.body) {
      statusBar = document.createElement('div');
      statusBar.id = 'opm-bottom-status-bar';
      statusBar.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; height: 24px; background: #212121; border-top: 1px solid #334155; color: #cbd5e1; z-index: 9990; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; box-sizing: border-box; font-family: Lato, Roboto, sans-serif; font-size: 11px;';
      statusBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 5px; color: #ffffff; font-weight: 700;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #49bd80; display: inline-block;"></span>
            ManageEngine OpManager Central v12.9.204-GA (64-Bit)
          </span>
          <span style="color: #475569;">|</span>
          <span>Central Server: <strong style="color: #49bd80;">${window.location.host || '—'}</strong></span>
          <span style="color: #475569;">|</span>
          <span>Remote Probes: <strong id="opm-footer-probes" style="color: #38bdf8;">${probeOnlineCount()} / ${state.probes.length} Online</strong></span>
          <span style="color: #475569;">|</span>
          <span id="opm-footer-monitored-assets">Monitored Assets: <strong>${state.devices.length} Devices • ${state.devices.reduce((acc, d) => acc + (d.interfaces ? d.interfaces.length : 0), 0)} Interfaces</strong></span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span id="opm-footer-mib-btn" style="cursor: pointer; color: #cbd5e1;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">SNMP MIB Browser</span>
          <span style="color: #475569;">•</span>
          <a href="/noc" target="_blank" style="color: #cbd5e1; text-decoration: none;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">NOC Wallboard ↗</a>
          <span style="color: #475569;">•</span>
          <a href="/apiclient/fluidicv3/itom/pages/log-viewer.html?file=opmanager_server.log" target="_blank" style="color: #cbd5e1; text-decoration: none;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">Log Viewer ↗</a>
          <span style="color: #475569;">•</span>
          <span id="opm-footer-logs-btn" style="cursor: pointer; color: #cbd5e1;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#cbd5e1'">Support &amp; Logs</span>
          <span style="color: #475569;">|</span>
          <span style="color: #49bd80; font-weight: 600;">● Live Telemetry Socket</span>
        </div>
      `;
      document.body.appendChild(statusBar);
      const fZia = statusBar.querySelector('#opm-footer-zia-btn');
      if (fZia) fZia.onclick = () => { if (typeof showZiaAssistantModal === 'function') showZiaAssistantModal(); };
      const fMib = statusBar.querySelector('#opm-footer-mib-btn');
      if (fMib) fMib.onclick = () => { if (typeof showNetworkToolsModal === 'function') showNetworkToolsModal(null, 'mib'); };
      const fLogs = statusBar.querySelector('#opm-footer-logs-btn');
      if (fLogs) fLogs.onclick = () => { state.subTabs.settings = 'support'; window.location.hash = '#/settings'; };
    }

    const pageContainer = document.querySelector('.page-container');
    if (pageContainer && pageContainer.parentNode) {
      if (container.parentNode !== pageContainer.parentNode || container.nextSibling !== pageContainer) {
        pageContainer.parentNode.insertBefore(container, pageContainer);
      }
      pageContainer.style.display = 'none';
    } else {
      const header = document.getElementById('main-header');
      if (header && header.parentNode) {
        if (container.parentNode !== header.parentNode || container.previousSibling !== header) {
          header.parentNode.insertBefore(container, header.nextSibling);
        }
      } else if (!container.parentNode) {
        document.body.appendChild(container);
      }
    }
    // Keep the header probe switcher + footer probe count truthful as real
    // probe data arrives (06 loadBackendData / WebSocket). Guarded so only
    // one interval ever runs; syncProbeHeader() only writes on change.
    syncProbeHeader();
    if (!probeSyncInterval) probeSyncInterval = setInterval(syncProbeHeader, 1000);
    return container;
  }

  
  // --- AUTHENTIC BREADCRUMBS, SERVER CLOCK & NOC DARK THEME ENGINE ---
  let clockInterval = null;
  function initClockAndTimers() {
    if (clockInterval) return;
    const updateTime = () => {
      const clockEl = document.getElementById('opm-live-server-clock');
      if (clockEl) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const dateStr = `${pad(now.getUTCDate())}-${months[now.getUTCMonth()]}-${now.getUTCFullYear()}`;
        const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
        clockEl.innerText = `UTC ${dateStr} ${timeStr}`;
      }
      const syncEl = document.getElementById('opm-live-sync-countdown');
      if (syncEl) {
        if (typeof state.syncCountdown === 'undefined' || isNaN(state.syncCountdown)) state.syncCountdown = 15;
        state.syncCountdown--;
        if (state.syncCountdown <= 0) {
          state.syncCountdown = 15;
          syncEl.style.color = '#16a34a';
          setTimeout(() => { if (syncEl) syncEl.style.color = '#0284c7'; }, 800);
        }
        syncEl.innerText = state.syncCountdown + 's';
      }
    };
    updateTime();
    clockInterval = setInterval(updateTime, 1000);
  }

  function applyNocDarkTheme(isDark) {
    if (isDark) {
      document.body.classList.add('opm-noc-dark');
      const toggleBtn = document.getElementById('opm-subnav-theme-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<span>☀️</span> <span>Fluidic Light</span>';
        toggleBtn.style.background = '#49bd80';
        toggleBtn.style.color = '#ffffff';
        toggleBtn.style.borderColor = '#3ca66d';
      }
    } else {
      document.body.classList.remove('opm-noc-dark');
      const toggleBtn = document.getElementById('opm-subnav-theme-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<span>🌙</span> <span>NOC Dark</span>';
        toggleBtn.style.background = '#1e293b';
        toggleBtn.style.color = '#f8fafc';
        toggleBtn.style.borderColor = '#334155';
      }
    }
  }

  function toggleNocDarkMode(force) {
    state.nocDarkMode = typeof force === 'boolean' ? force : !state.nocDarkMode;
    try {
      localStorage.setItem('opm_noc_dark_mode', state.nocDarkMode ? 'true' : 'false');
    } catch (e) {}
    applyNocDarkTheme(state.nocDarkMode);
    showToast(state.nocDarkMode ? 'NOC Dark Operations Theme enabled.' : 'Fluidic v3 Light Theme enabled.');
  }

  function ensureSubnavBreadcrumbsBar() {
    const bar = document.getElementById('opm-header-subnav-bar');
    if (bar && bar.parentNode) {
      bar.parentNode.removeChild(bar);
    }
    document.querySelectorAll('#opm-header-subnav-bar').forEach(el => el.remove());
    return null;
  }

  function updateBreadcrumbs(tab, subtab) {
    const bar = document.getElementById('opm-header-subnav-bar');
    if (bar && bar.parentNode) {
      bar.parentNode.removeChild(bar);
    }
  }


  // Route Resolver
  function resolveTabFromHash() {
    const hash = window.location.hash || '#/dashboard';
    const clean = hash.replace(/^#\/?/, '');
    const parts = clean.split('/').filter(Boolean);
    const mainSeg = (parts[0] || 'dashboard').toLowerCase();
    const subSeg = (parts[1] || '').toLowerCase();

    // Prioritize Settings explicitly so #/settings always resolves to settings view
    if (mainSeg === 'settings' || mainSeg.includes('setting') || mainSeg.includes('admin') || mainSeg.includes('probe')) {
      if (subSeg && state.subTabs) {
        state.subTabs.settings = subSeg;
      }
      return 'settings';
    }
    if (mainSeg === 'inventory' || mainSeg.includes('device') || mainSeg.includes('interface')) {
      if (subSeg && state.subTabs) {
        state.subTabs.inventory = subSeg;
      }
      return 'inventory';
    }
    if (mainSeg === 'alarms' || mainSeg.includes('alarm')) {
      if (subSeg && state.subTabs) {
        state.subTabs.alarms = subSeg;
      }
      return 'alarms';
    }
    if (mainSeg === 'maps' || mainSeg.includes('map') || mainSeg.includes('businessview') || mainSeg.includes('rack') || mainSeg.includes('floor')) {
      if (subSeg && state.subTabs) {
        state.subTabs.maps = subSeg;
      }
      return 'maps';
    }
    if (mainSeg === 'configuration' || mainSeg === 'config' || mainSeg.startsWith('config') || mainSeg.includes('ncm') || mainSeg.includes('compliance')) {
      if (subSeg && state.subTabs) {
        state.subTabs.configuration = subSeg;
      }
      return 'configuration';
    }
    if (mainSeg === 'reports' || mainSeg.includes('report')) {
      if (subSeg && state.subTabs) {
        state.subTabs.reports = subSeg;
      }
      return 'reports';
    }
    if (subSeg && state.subTabs) {
      state.subTabs.dashboard = subSeg;
    }
    return 'dashboard';
  }

  // Enforce ManageEngine Emerald Green (#49bd80) on Active Tab
  function syncHeaderTabs(activeTab) {
    const tabMap = {
      'dashboard': 'dashboard',
      'inventory': 'inventory',
      'alarms': 'alarm',
      'maps': 'map',
      'configuration': 'configuration',
      'reports': 'report',
      'settings': 'setting'
    };
    const targetKey = tabMap[activeTab] || 'dashboard';

    // First clear all active classes and inline backgrounds across all nav elements
    const allNavElements = document.querySelectorAll('#main-header #main-nav li, #main-header #main-nav a');
    allNavElements.forEach(el => {
      el.classList.remove('active', 'active-menu');
      if (el.closest('.dropdown-nav')) return;
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', 'none', 'important');
      el.style.setProperty('outline', 'none', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.style.setProperty('border-radius', '0px', 'important');
      el.style.setProperty('height', '50px', 'important');
      el.style.setProperty('max-height', '50px', 'important');
      el.style.setProperty('line-height', '50px', 'important');
      el.style.setProperty('margin', '0', 'important');
      if (el.tagName === 'A' || el.classList.contains('nav-link')) {
        el.style.setProperty('font-size', '13px', 'important');
        el.style.setProperty('font-weight', '500', 'important');
        el.style.setProperty('color', '#e2e8f0', 'important');
        el.style.setProperty('padding', '0 16px', 'important');
        const span = el.querySelector('.menu-name');
        if (span) {
          span.style.setProperty('color', '#e2e8f0', 'important');
          span.style.setProperty('background', 'transparent', 'important');
          span.style.setProperty('font-size', '13px', 'important');
          span.style.setProperty('line-height', '50px', 'important');
          span.style.setProperty('height', '50px', 'important');
        }
      }
    });

    // Now highlight ONLY the matching top-level tab with uniform #49bd80 emerald green
    const topLinks = document.querySelectorAll('#main-header #main-nav .main-nav > ul > li > a.nav-link, #main-header #main-nav > ul > li > a.nav-link, #main-header #main-nav a.opm-main-nav-tab');
    let matched = false;
    topLinks.forEach(link => {
      if (matched) return;
      const nameSpan = link.querySelector('.menu-name') || link;
      const text = (nameSpan.innerText || link.innerText || '').trim().toLowerCase();
      if (text.includes(targetKey)) {
        matched = true;
        link.classList.add('active');
        link.style.setProperty('background', '#49bd80', 'important');
        link.style.setProperty('background-color', '#49bd80', 'important');
        link.style.setProperty('color', '#ffffff', 'important');
        link.style.setProperty('border', 'none', 'important');
        link.style.setProperty('outline', 'none', 'important');
        link.style.setProperty('box-shadow', 'none', 'important');
        link.style.setProperty('border-radius', '0px', 'important');
        link.style.setProperty('font-size', '13px', 'important');
        link.style.setProperty('font-weight', '600', 'important');
        link.style.setProperty('height', '50px', 'important');
        link.style.setProperty('max-height', '50px', 'important');
        link.style.setProperty('line-height', '50px', 'important');
        link.style.setProperty('padding', '0 16px', 'important');
        link.style.setProperty('margin', '0', 'important');
        if (nameSpan && nameSpan !== link) {
          nameSpan.style.setProperty('color', '#ffffff', 'important');
          nameSpan.style.setProperty('background', 'transparent', 'important');
          nameSpan.style.setProperty('font-size', '13px', 'important');
          nameSpan.style.setProperty('line-height', '50px', 'important');
          nameSpan.style.setProperty('height', '50px', 'important');
        }
        if (link.parentElement && link.parentElement.tagName === 'LI') {
          link.parentElement.classList.add('active-menu');
          link.parentElement.style.setProperty('background', '#49bd80', 'important');
          link.parentElement.style.setProperty('background-color', '#49bd80', 'important');
          link.parentElement.style.setProperty('border', 'none', 'important');
          link.parentElement.style.setProperty('outline', 'none', 'important');
          link.parentElement.style.setProperty('box-shadow', 'none', 'important');
          link.parentElement.style.setProperty('height', '50px', 'important');
          link.parentElement.style.setProperty('max-height', '50px', 'important');
          link.parentElement.style.setProperty('overflow', 'hidden', 'important');
        }
      }
    });
  }

  // SVG Helper Badges
  function getStatusBadge(status) {
    const colors = {
      'Critical': { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
      'Trouble': { bg: '#ffedd5', text: '#9a3412', dot: '#ea580c' },
      'Attention': { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
      'Clear': { bg: '#dcfce7', text: '#166534', dot: '#16a34a' }
    };
    const c = colors[status] || colors['Clear'];
    return `<span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600; font-size: 11px; padding: 2px 7px; border-radius: 3px; background: ${c.bg}; color: ${c.text};"><span style="width: 7px; height: 7px; border-radius: 50%; background: ${c.dot};"></span>${status}</span>`;
  }

  function getVendorBadge(vendor) {
    const map = {
      'Cisco Systems': { text: 'CISCO', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
      'Dell Enterprise': { text: 'DELL', bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
      'Palo Alto Networks': { text: 'PALO ALTO', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
      'Aruba Networks': { text: 'ARUBA', bg: '#fffbeb', color: '#b45309', border: '#fef3c7' },
      'HP Enterprise': { text: 'HP', bg: '#ecfeff', color: '#0e7490', border: '#cffafe' },
      'Fortinet': { text: 'FORTINET', bg: '#fef2f2', color: '#b91c1c', border: '#fee2e2' },
      'VMware Inc': { text: 'VMWARE', bg: '#f8fafc', color: '#334155', border: '#cbd5e1' },
      'Juniper Networks': { text: 'JUNIPER', bg: '#f0fdf4', color: '#15803d', border: '#dcfce7' },
      'Arista Networks': { text: 'ARISTA', bg: '#f1f5f9', color: '#1e293b', border: '#cbd5e1' },
      'Canonical': { text: 'LINUX', bg: '#fff1f2', color: '#be123c', border: '#ffe4e6' },
      'Schneider / APC': { text: 'APC', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
    };
    const b = map[vendor] || { text: 'GENERIC', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    return `<span style="display: inline-block; font-size: 9px; font-weight: 700; background: ${b.bg}; color: ${b.color}; border: 1px solid ${b.border}; padding: 1px 5px; border-radius: 2px; vertical-align: middle; letter-spacing: 0.3px;">${b.text}</span>`;
  }

  function getCategoryIcon(cat) {
    const icons = {
      'Switches': `<img src="/images/businessView/peripherals/lan-connecter.svg" alt="Switch" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#0070e0\\' stroke-width=\\'2\\'><rect x=\\'2\\' y=\\'6\\' width=\\'20\\' height=\\'12\\' rx=\\'2\\'/></svg>'" />`,
      'Routers': `<img src="/images/businessView/peripherals/Router.svg" alt="Router" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#0284c7\\' stroke-width=\\'2\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/></svg>'" />`,
      'Firewalls': `<img src="/images/businessView/peripherals/FireWall.svg" alt="Firewall" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#ea580c\\' stroke-width=\\'2\\'><path d=\\'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\\'/></svg>'" />`,
      'Servers': `<img src="/images/businessView/peripherals/Server.svg" alt="Server" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#16a34a\\' stroke-width=\\'2\\'><rect x=\\'2\\' y=\\'2\\' width=\\'20\\' height=\\'8\\' rx=\\'2\\'/></svg>'" />`,
      'Wireless': `<img src="/images/businessView/peripherals/Cloud.svg" alt="Wireless" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#ca8a04\\' stroke-width=\\'2\\'><path d=\\'M5 12.55a11 11 0 0 1 14.08 0\\'/></svg>'" />`,
      'Storage': `<img src="/images/businessView/peripherals/Rack.svg" alt="Storage" style="width: 15px; height: 15px; vertical-align: middle; display: inline-block; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" onerror="this.outerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#9333ea\\' stroke-width=\\'2\\'><ellipse cx=\\'12\\' cy=\\'5\\' rx=\\'9\\' ry=\\'3\\'/></svg>'" />`
    };
    return icons[cat] || icons['Switches'];
  }

  function getDeviceTypeIcon(type, category, size = 18) {
    const t = (type || '').toLowerCase();
    const c = (category || '').toLowerCase();
    let imgName = 'server.png';
    if (t.includes('cisco catalyst') || t.includes('3550') || t.includes('catalyst')) imgName = 'cisco_catalyst_3550.png';
    else if (c.includes('switch') || t.includes('switch') || t.includes('nexus') || t.includes('arista')) imgName = 'switch.png';
    else if (c.includes('router') || t.includes('router') || t.includes('asr') || t.includes('mx') || t.includes('3945')) imgName = 'router.png';
    else if (c.includes('firewall') || t.includes('firewall') || t.includes('palo alto') || t.includes('fortigate') || t.includes('asa')) imgName = 'firewall.png';
    else if (t.includes('windows') || t.includes('win')) imgName = 'windows.png';
    else if (t.includes('linux') || t.includes('ubuntu') || t.includes('rhel') || t.includes('centos') || t.includes('debian')) imgName = 'linux.png';
    else if (t.includes('esx') || t.includes('vmware') || t.includes('vcenter')) imgName = 'esx.png';
    else if (c.includes('storage') || t.includes('san') || t.includes('nas') || t.includes('netapp') || t.includes('dell emc')) imgName = 'storage.png';
    else if (c.includes('power') || c.includes('ups') || t.includes('ups') || t.includes('apc') || t.includes('schneider')) imgName = 'ups.png';
    else if (c.includes('wireless') || t.includes('ap') || t.includes('meraki') || t.includes('wifi') || t.includes('aruba')) imgName = 'wireless.png';
    else if (t.includes('f5') || t.includes('load balancer') || t.includes('citrix') || t.includes('netscaler')) imgName = 'loadbalancer.png';
    else if (t.includes('printer')) imgName = 'printer.png';

    return `<img src="/images/deviceicons/${imgName}" alt="${type || 'Device'}" style="width: ${size}px; height: ${size}px; vertical-align: middle; display: inline-block; object-fit: contain;" onerror="this.src='/images/deviceicons/server.png'" />`;
  }

  // --- OFFICIAL ZOHO ITOM SVG SPEEDOMETER GAUGE ---
  function createSpeedometerGauge(pct, label, deviceName, ip, size = 150) {
    const p = Math.max(0, Math.min(100, pct));
    const cx = 75, cy = 68, r = 48;
    const startAngle = -120, sweep = 240;
    const currentAngle = startAngle + (p / 100) * sweep;

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startDeg, endDeg) {
      const start = polarToCartesian(x, y, radius, endDeg);
      const end = polarToCartesian(x, y, radius, startDeg);
      const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
      return ['M', start.x.toFixed(1), start.y.toFixed(1), 'A', radius, radius, 0, largeArcFlag, 0, end.x.toFixed(1), end.y.toFixed(1)].join(' ');
    }

    const trackD = describeArc(cx, cy, r, -120, 120);
    const valueD = p > 0 ? describeArc(cx, cy, r, -120, Math.min(119.9, currentAngle)) : '';

    const color = p >= 85 ? '#dc2626' : (p >= 70 ? '#ea580c' : (p >= 50 ? '#ca8a04' : '#16a34a'));
    const needleTip = polarToCartesian(cx, cy, r - 6, currentAngle);

    return `
      <div style="display: flex; flex-direction: column; align-items: center; width: ${size}px; padding: 6px; box-sizing: border-box;">
        <svg width="${size}" height="${Math.round(size * 0.75)}" viewBox="0 0 150 115" style="overflow: visible;">
          <!-- Gauge Track -->
          <path d="${trackD}" fill="none" stroke="#e2e8f0" stroke-width="10" stroke-linecap="round" />
          <!-- Ticks -->
          <text x="24" y="92" font-size="7.5" fill="#94a3b8" font-family="monospace">0</text>
          <text x="75" y="14" font-size="7.5" fill="#94a3b8" font-family="monospace" text-anchor="middle">50</text>
          <text x="126" y="92" font-size="7.5" fill="#94a3b8" font-family="monospace" text-anchor="end">100</text>
          <!-- Filled Arc -->
          ${valueD ? `<path d="${valueD}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" />` : ''}
          <!-- Needle Pivot Base -->
          <circle cx="${cx}" cy="${cy}" r="6" fill="#1e293b" />
          <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" />
          <!-- Needle Pointer -->
          <line x1="${cx}" y1="${cy}" x2="${needleTip.x.toFixed(1)}" y2="${needleTip.y.toFixed(1)}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
          <!-- Value Text -->
          <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="Lato, sans-serif" font-size="16" font-weight="800" fill="#0f172a">${p.toFixed(1)}%</text>
          <!-- Metric Label -->
          <text x="${cx}" y="${cy + 35}" text-anchor="middle" font-family="Lato, sans-serif" font-size="10" font-weight="600" fill="#64748b">${label}</text>
        </svg>
        <div style="text-align: center; margin-top: -2px; max-width: 100%;">
          <div style="font-size: 11px; font-weight: 700; color: #0070e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${deviceName}">${deviceName}</div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">${ip}</div>
        </div>
      </div>
    `;
  }

  // --- OFFICIAL ZOHO ITOM SVG DONUT CHART ---
  function createDonutChart(slices, total, size = 150) {
    const cx = size / 2, cy = size / 2, r = (size / 2) - 15;
    const circumference = 2 * Math.PI * r;
    let accumulatedOffset = 0;

    let paths = '';
    slices.forEach(s => {
      const fraction = total > 0 ? (s.count / total) : 0;
      const strokeLength = fraction * circumference;
      const strokeDash = `${strokeLength.toFixed(1)} ${(circumference - strokeLength).toFixed(1)}`;
      const strokeOffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      if (s.count > 0) {
        paths += `
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent"
            stroke="${s.color}" stroke-width="16"
            stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeOffset.toFixed(1)}"
            transform="rotate(-90 ${cx} ${cy})" style="transition: all 0.3s;" />
        `;
      }
    });

    return `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent" stroke="#f1f5f9" stroke-width="16" />
          ${paths}
        </svg>
        <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1;">${total}</span>
          <span style="font-size: 9px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">ALARMS</span>
        </div>
      </div>
    `;
  }

  // --- OFFICIAL ZOHO ITOM SVG SPARKLINE ---
  function createSparkline(data, width = 100, height = 26, strokeColor = '#0070e0') {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const fillD = `M 2,${height} L ${points} L ${width - 2},${height} Z`;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible; display: inline-block; vertical-align: middle;">
        <path d="${fillD}" fill="${strokeColor}" fill-opacity="0.12" />
        <polyline points="${points}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }
