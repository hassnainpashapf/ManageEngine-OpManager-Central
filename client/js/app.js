/**
 * ManageEngine OpManager Central - Enterprise Client Application Engine
 * 100% Visual and Behavioral Recreation based on Product Disassembly
 */
(function () {
  'use strict';

  // Global Application State
  const state = {
    currentTab: 'dashboard',
    currentSubTab: 'Overview NOC',
    selectedProbeId: 'all',
    searchQuery: '',
    probes: [],
    devices: [],
    alarms: [],
    central: {},
    activeModalDevice: null,
    activeSnapTab: 'overview',
    soundEnabled: true,
    currentUser: null,
    authenticated: false,
    lastCriticalChimeAt: 0,
    selectedAlarmIds: new Set(),
    widgetsVisibility: {
      alarmsDonut: true,
      slaMeter: true,
      quickTools: true,
      topCpu: true,
      topMem: true,
      recentAlarms: true
    },
    ws: null,
    autoRefreshInterval: null,
    topologyAnimId: null,
    topologyNodes: []
  };

  // Sub-navigation definitions matching ManageEngine OpManager Central
  const MENU_DEFINITIONS = {
    dashboard: {
      title: 'Enterprise Dashboard',
      subTabs: ['Overview NOC', 'NCM Enterprise (NCMEE)', 'Top 10 Performance', 'Device Health Heatmap', 'Alarms Summary']
    },
    inventory: {
      title: 'Infrastructure Inventory',
      subTabs: ['All Devices', 'Routers', 'Switches', 'Firewalls', 'Servers', 'Flow Analysis (NetFlow)', 'IP & Switch Ports', 'Interfaces (IF-MIB)', 'Host Agents', 'Storage & UPS']
    },
    alarms: {
      title: 'Alarm Console',
      subTabs: ['All Active', 'SNMP Trap Viewer', 'Syslog Console', 'Root Cause Analysis (RCA)', 'Critical', 'Trouble', 'Attention', 'Acknowledged']
    },
    topology: {
      title: 'Network Maps & Topology',
      subTabs: ['Enterprise Probe Map', '3D Datacenter Rack View', 'Business Views']
    },
    probes: {
      title: 'Enterprise Remote Probes',
      subTabs: ['Probe Grid', 'Health & Latency', 'Synchronization Status']
    },
    discovery: {
      title: 'Network Discovery',
      subTabs: ['Discovery Profiles', 'Quick Subnet Scan', 'SNMP Sweep']
    },
    ccm: {
      title: 'Network Configuration (CCM)',
      subTabs: ['Configuration Backups', 'Config Diff Inspector', 'Compliance Audit', 'Push Central Baseline']
    },
    reports: {
      title: 'Performance Reports',
      subTabs: ['Executive Health Summary', 'Device Availability (SLA)', 'Bandwidth Utilization']
    },
    settings: {
      title: 'Central Administration',
      subTabs: ['Central System Info', 'Workflow Automation', 'Probe Mutual Auth', 'SNMP / WMI Credentials']
    }
  };

  // DOM Elements
  const DOM = {
    workspace: document.getElementById('workspaceContent'),
    globalProbeSelect: document.getElementById('globalProbeSelect'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    headerAlarmsBadge: document.getElementById('headerAlarmsBadge'),
    headerAlarmsBtn: document.getElementById('headerAlarmsBtn'),
    btnHeaderAddDevice: document.getElementById('btnHeaderAddDevice'),
    btnHeaderAddProbe: document.getElementById('btnHeaderAddProbe'),
    btnHeaderDownloadAgent: document.getElementById('btnHeaderDownloadAgent'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeToggleIcon: document.getElementById('themeToggleIcon'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    soundToggleIcon: document.getElementById('soundToggleIcon'),
    autoRefreshSelect: document.getElementById('autoRefreshSelect'),
    mainNavTabs: document.getElementById('mainNavTabs'),
    subnavBar: document.getElementById('subnavBar'),
    subnavList: document.getElementById('subnavList'),
    subnavActions: document.getElementById('subnavActions'),
    centralStatusText: document.getElementById('centralStatusText'),

    // User Profile Menu
    btnUserMenu: document.getElementById('btnUserMenu'),
    userMenuDropdown: document.getElementById('userMenuDropdown'),
    menuItemAbout: document.getElementById('menuItemAbout'),
    menuItemLicense: document.getElementById('menuItemLicense'),
    menuItemTestSound: document.getElementById('menuItemTestSound'),
    menuItemSignOut: document.getElementById('menuItemSignOut'),

    // Login Overlay
    loginOverlay: document.getElementById('loginOverlay'),
    loginForm: document.getElementById('loginForm'),
    loginUser: document.getElementById('loginUser'),
    loginPass: document.getElementById('loginPass'),
    loginDomain: document.getElementById('loginDomain'),
    keepSignedIn: document.getElementById('keepSignedIn'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),

    // About & Widget Catalog Modals
    aboutModal: document.getElementById('aboutModal'),
    closeAboutModal: document.getElementById('closeAboutModal'),
    closeAboutBottom: document.getElementById('closeAboutBottom'),

    widgetCatalogModal: document.getElementById('widgetCatalogModal'),
    closeWidgetCatalogModal: document.getElementById('closeWidgetCatalogModal'),
    closeWidgetCatalogBottom: document.getElementById('closeWidgetCatalogBottom'),
    widgetCatalogList: document.getElementById('widgetCatalogList'),

    // Agent Downloads Modal
    downloadAgentModal: document.getElementById('downloadAgentModal'),
    closeDownloadAgentModal: document.getElementById('closeDownloadAgentModal'),
    closeDownloadAgentBottom: document.getElementById('closeDownloadAgentBottom'),
    btnRefreshAgentsList: document.getElementById('btnRefreshAgentsList'),
    liveAgentsList: document.getElementById('liveAgentsList'),

    // Zia AI Drawer
    btnHeaderZia: document.getElementById('btnHeaderZia'),
    ziaDrawer: document.getElementById('ziaDrawer'),
    closeZiaDrawer: document.getElementById('closeZiaDrawer'),
    ziaChatBox: document.getElementById('ziaChatBox'),
    ziaInput: document.getElementById('ziaInput'),
    btnSendZia: document.getElementById('btnSendZia'),

    // Modals
    deviceSnapshotModal: document.getElementById('deviceSnapshotModal'),
    snapDevTitle: document.getElementById('snapDevTitle'),
    snapDevSubtitle: document.getElementById('snapDevSubtitle'),
    snapDevBody: document.getElementById('snapDevBody'),
    closeDeviceSnapshot: document.getElementById('closeDeviceSnapshot'),
    closeDeviceSnapshotBottom: document.getElementById('closeDeviceSnapshotBottom'),
    btnSnapPollNow: document.getElementById('btnSnapPollNow'),
    btnSnapBackupConfig: document.getElementById('btnSnapBackupConfig'),
    btnSnapDrift: document.getElementById('btnSnapDrift'),
    btnSnapPing: document.getElementById('btnSnapPing'),
    btnSnapMibBrowser: document.getElementById('btnSnapMibBrowser'),
    btnSnapTerminal: document.getElementById('btnSnapTerminal'),
    btnSnapSwitchPorts: document.getElementById('btnSnapSwitchPorts'),
    btnSnapTraceroute: document.getElementById('btnSnapTraceroute'),
    alarmToastContainer: document.getElementById('alarmToastContainer'),

    // Terminal Modal
    terminalModal: document.getElementById('terminalModal'),
    termModalTitle: document.getElementById('termModalTitle'),
    terminalScreenText: document.getElementById('terminalScreenText'),
    termPromptLbl: document.getElementById('termPromptLbl'),
    terminalInput: document.getElementById('terminalInput'),
    btnSendTerminalCmd: document.getElementById('btnSendTerminalCmd'),
    closeTerminalModal: document.getElementById('closeTerminalModal'),
    closeTerminalBottom: document.getElementById('closeTerminalBottom'),

    // Switch Port Modal
    switchPortModal: document.getElementById('switchPortModal'),
    switchPortTitle: document.getElementById('switchPortTitle'),
    switchPortBody: document.getElementById('switchPortBody'),
    closeSwitchPortModal: document.getElementById('closeSwitchPortModal'),
    closeSwitchPortBottom: document.getElementById('closeSwitchPortBottom'),

    // Traceroute Modal
    tracerouteModal: document.getElementById('tracerouteModal'),
    traceTargetIp: document.getElementById('traceTargetIp'),
    tracerouteOutput: document.getElementById('tracerouteOutput'),
    closeTracerouteModal: document.getElementById('closeTracerouteModal'),
    closeTracerouteBottom: document.getElementById('closeTracerouteBottom'),

    // Add Probe Modal
    addProbeModal: document.getElementById('addProbeModal'),
    addProbeForm: document.getElementById('addProbeForm'),
    closeAddProbeModal: document.getElementById('closeAddProbeModal'),

    // Add Device Modal
    addDeviceModal: document.getElementById('addDeviceModal'),
    addDeviceForm: document.getElementById('addDeviceForm'),
    closeAddDeviceModal: document.getElementById('closeAddDeviceModal'),
    devProbeAssign: document.getElementById('devProbeAssign'),

    // MIB Browser Modal
    btnHeaderMibBrowser: document.getElementById('btnHeaderMibBrowser'),
    mibBrowserModal: document.getElementById('mibBrowserModal'),
    closeMibBrowserModal: document.getElementById('closeMibBrowserModal'),
    closeMibBrowserBottom: document.getElementById('closeMibBrowserBottom'),
    mibTargetIp: document.getElementById('mibTargetIp'),
    mibCommunity: document.getElementById('mibCommunity'),
    mibVersion: document.getElementById('mibVersion'),
    mibCurrentOid: document.getElementById('mibCurrentOid'),
    btnMibGet: document.getElementById('btnMibGet'),
    btnMibWalk: document.getElementById('btnMibWalk'),
    mibTreeContainer: document.getElementById('mibTreeContainer'),
    mibSelectedDesc: document.getElementById('mibSelectedDesc'),
    mibResultsTableBody: document.getElementById('mibResultsTableBody'),

    // Spotlight Search Modal
    spotlightSearchModal: document.getElementById('spotlightSearchModal'),
    spotlightInput: document.getElementById('spotlightInput'),
    spotlightResultsList: document.getElementById('spotlightResultsList'),

    // Config Diff Modal
    configDiffModal: document.getElementById('configDiffModal'),
    closeConfigDiffModal: document.getElementById('closeConfigDiffModal'),
    closeConfigDiffBottom: document.getElementById('closeConfigDiffBottom'),
    diffDevName: document.getElementById('diffDevName'),
    diffMeta: document.getElementById('diffMeta'),
    btnResolveDrift: document.getElementById('btnResolveDrift'),
    diffRunningText: document.getElementById('diffRunningText'),
    diffStartupText: document.getElementById('diffStartupText'),
    diffRunningVer: document.getElementById('diffRunningVer'),
    diffStartupVer: document.getElementById('diffStartupVer')
  };


  // =========================================================================
  // Real-data helpers (real-data rebuild)
  // Every number, status and list below must come from a real API response
  // or from state populated by one. Nothing is invented client-side: an
  // unknown value is rendered as "—" and a view with no data renders an
  // honest empty state (short label + one line telling the user what to
  // do next), never demo rows.
  // =========================================================================
  function emptyStateHtml(label, nextStep, icon) {
    return `
      <div class="me-card" style="padding: 60px 20px; text-align: center;">
        <div style="font-size: 28px;">${icon || '📭'}</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-top: 8px;">${escapeHtml(label)}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px; max-width: 480px; margin-left: auto; margin-right: auto;">${escapeHtml(nextStep)}</div>
      </div>
    `;
  }

  // Fetch JSON with the session cookie; throws on HTTP error with the
  // server's own message so the UI reports the real outcome.
  async function apiJson(url, options) {
    const res = await fetch(url, { credentials: 'include', ...(options || {}) });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function displayVal(v) {
    return (v === null || v === undefined || v === '') ? '—' : v;
  }

  function fmtTime(v) {
    if (v === null || v === undefined || v === '') return '—';
    const d = new Date(typeof v === 'number' ? v : v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  }

  // Availability is only a number when the API actually returned one for
  // the device (a numeric value or a numeric string). No history -> null.
  function numericAvailability(dev) {
    if (!dev || dev.availability === null || dev.availability === undefined || dev.availability === '') return null;
    const n = Number(String(dev.availability).replace('%', ''));
    return Number.isFinite(n) ? n : null;
  }

  function availabilityStats(devices) {
    const vals = (devices || []).map(numericAvailability).filter(v => v !== null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function probeDisplayName(dev) {
    const p = state.probes.find(x => String(x.id) === String(dev.probeId));
    if (p) return p.displayName || p.name || '—';
    return dev.probeName || '—';
  }

  function firstDevice() {
    return getFilteredDevices()[0] || state.devices[0] || null;
  }

  function openTerminalForFirstDevice() {
    const d = firstDevice();
    if (d) openTerminal(d.name || d.hostname || d.ip, d.ip);
  }

  function openSwitchPortsForFirstDevice() {
    const d = firstDevice();
    if (d) openSwitchPorts(d.name || d.hostname || d.ip, d.ip);
  }

  function showToastMessage(msg, severity) {
    showAlarmToast({
      id: 'msg-' + Date.now(),
      severity: severity || 'Clear',
      deviceName: 'OpManager Central',
      message: msg
    });
  }

  // =========================================================================
  // Initialization
  // =========================================================================
  async function init() {
    const authed = await initAuth();
    initTheme();
    initSound();
    bindHeaderEvents();
    bindUserMenu();
    bindZiaDrawer();
    bindModals();
    if (authed) {
      await fetchInitialData();
      initWebSocket();
    }
    setupAutoRefresh();
    renderNavigation();
    renderCurrentView();
  }

  // Authentication is a real server session: the HttpOnly cookie
  // `opm_session` set by POST /api/auth/login, verified on every load
  // with GET /api/auth/session. There is no client-side login flag.
  async function initAuth() {
    let authed = false;
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && (data.authenticated === true || data.user)) {
          state.authenticated = true;
          state.currentUser = data.user || null;
          authed = true;
        }
      }
    } catch (e) {
      authed = false;
    }

    if (authed) {
      DOM.loginOverlay.classList.add('hidden');
    } else {
      state.authenticated = false;
      state.currentUser = null;
      DOM.loginOverlay.classList.remove('hidden');
    }

    DOM.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = DOM.loginUser.value.trim();
      const pass = DOM.loginPass.value.trim();
      const domain = DOM.loginDomain.value;

      DOM.loginErrorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass, domain })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.status === 'success' || data.authenticated === true || data.user)) {
          state.authenticated = true;
          state.currentUser = data.user || { username: user };
          DOM.loginOverlay.classList.add('hidden');
          playManageEngineAlertChime();
          await fetchInitialData();
          initWebSocket();
          renderCurrentView();
        } else {
          DOM.loginErrorMsg.textContent = data.message || 'Invalid username or password';
          DOM.loginErrorMsg.style.display = 'block';
        }
      } catch (err) {
        DOM.loginErrorMsg.textContent = 'Server connection failed: ' + err.message;
        DOM.loginErrorMsg.style.display = 'block';
      }
    });

    DOM.menuItemSignOut.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (e) {
        // Logout is best-effort on the wire; the overlay still shows.
      }
      state.authenticated = false;
      state.currentUser = null;
      if (state.ws) { try { state.ws.close(); } catch (e) {} state.ws = null; }
      DOM.userMenuDropdown.classList.remove('active');
      DOM.loginOverlay.classList.remove('hidden');
    });
    return authed;
  }

  function bindUserMenu() {
    DOM.btnUserMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.userMenuDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!DOM.userMenuDropdown.contains(e.target) && e.target !== DOM.btnUserMenu) {
        DOM.userMenuDropdown.classList.remove('active');
      }
    });

    DOM.menuItemAbout.addEventListener('click', () => {
      DOM.userMenuDropdown.classList.remove('active');
      DOM.aboutModal.classList.add('active');
    });

    DOM.menuItemLicense.addEventListener('click', () => {
      DOM.userMenuDropdown.classList.remove('active');
      DOM.aboutModal.classList.add('active');
    });

    DOM.menuItemTestSound.addEventListener('click', () => {
      playManageEngineAlertChime();
    });
  }

  // =========================================================================
  // ManageEngine Sound Alerts (Web Audio Synthesizer)
  // =========================================================================
  function initSound() {
    const saved = localStorage.getItem('opm_sound_enabled');
    state.soundEnabled = saved !== 'false';
    updateSoundIcon();

    DOM.btnSoundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('opm_sound_enabled', String(state.soundEnabled));
      updateSoundIcon();
      if (state.soundEnabled) {
        playManageEngineAlertChime();
      }
    });
  }

  function updateSoundIcon() {
    if (DOM.soundToggleIcon) {
      DOM.soundToggleIcon.textContent = state.soundEnabled ? '🔔' : '🔕';
      DOM.btnSoundToggle.title = state.soundEnabled ? 'Alarm Audio Chimes Active (Click to Mute)' : 'Alarm Audio Muted (Click to Enable)';
    }
  }

  function playManageEngineAlertChime() {
    if (!state.soundEnabled) return;
    try {
      const audio = new Audio('/apiclient/fluidicv2/sounds/webalarm.mp3');
      audio.volume = 0.75;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthesizedChime();
        });
      }
    } catch (e) {
      playSynthesizedChime();
    }
  }

  function playSynthesizedChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // Low pitch E5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.38);
    } catch (e) {}
  }

  // Authentic ManageEngine Device Category / Vendor Icon Resolver
  function getDeviceIcon(category, vendor) {
    const cat = (category || '').toLowerCase();
    const ven = (vendor || '').toLowerCase();
    if (cat.includes('switch')) return '/images/deviceicons/cisco_catalyst_3550.png';
    if (cat.includes('router')) return '/images/deviceicons/cisco3200.png';
    if (cat.includes('firewall') || cat.includes('security')) return '/images/deviceicons/merakisecurity.png';
    if (cat.includes('ups') || cat.includes('power')) return '/images/deviceicons/GenericUps.png';
    if (cat.includes('wireless') || cat.includes('ap')) return '/images/deviceicons/accessPointCisco.png';
    if (ven.includes('windows') || cat.includes('windows')) return '/images/deviceicons/windows11.png';
    if (ven.includes('linux') || cat.includes('linux')) return '/images/deviceicons/linux.png';
    if (ven.includes('vmware') || cat.includes('virtual') || cat.includes('esx')) return '/images/deviceicons/esx.png';
    if (cat.includes('loadbalancer') || ven.includes('f5')) return '/images/deviceicons/loadbalancer.png';
    if (cat.includes('storage')) return '/images/deviceicons/storage.png';
    return '/images/deviceicons/server.png';
  }

  // =========================================================================
  // Theme Handling (Enterprise Light / NOC Dark)
  // =========================================================================
  function initTheme() {
    const saved = localStorage.getItem('me_opm_theme') || 'dark';
    if (saved === 'light') {
      document.body.classList.remove('dark-mode');
      DOM.themeToggleIcon.textContent = '🌙';
    } else {
      document.body.classList.add('dark-mode');
      DOM.themeToggleIcon.textContent = '☀️';
    }

    DOM.themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('me_opm_theme', isDark ? 'dark' : 'light');
      DOM.themeToggleIcon.textContent = isDark ? '☀️' : '🌙';
      if (state.currentTab === 'topology') {
        renderTopologyCanvas();
      }
    });
  }

  // =========================================================================
  // API Data Loading
  // =========================================================================
  async function fetchInitialData() {
    try {
      const [probesRes, devicesRes, alarmsRes, centralRes] = await Promise.all([
        fetch('/api/json/admin/listProbes', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/json/device/list', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/json/alarms/listAlarms', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/settings/central', { credentials: 'include' }).then(r => r.json())
      ]);

      state.probes = probesRes.result || probesRes.probes || [];
      state.devices = devicesRes.devices || [];
      state.alarms = alarmsRes.alarms || [];
      state.central = centralRes.central || centralRes || {};

      populateProbeSelector();
      updateHeaderBadges();
      populateProbeModalSelect();

      if (state.central.host) {
        DOM.centralStatusText.innerHTML = `Central: <strong>${state.central.host}:${state.central.port || 8060}</strong> (${state.central.haStatus || 'Primary Active'})`;
      }
    } catch (err) {
      console.error('Error fetching initial OpManager Central data:', err);
    }
  }

  function populateProbeSelector() {
    const totalDevices = state.devices.length;
    DOM.globalProbeSelect.innerHTML = `<option value="all">🌐 All Enterprise Probes (${state.probes.length} Probes • ${totalDevices} Devices)</option>`;
    state.probes.forEach(probe => {
      const opt = document.createElement('option');
      opt.value = probe.id;
      opt.textContent = `📍 ${probe.displayName} (${probe.location || 'Remote'} • ${probe.devicesCount} dev)`;
      DOM.globalProbeSelect.appendChild(opt);
    });
    DOM.globalProbeSelect.value = state.selectedProbeId;
  }

  function populateProbeModalSelect() {
    if (!DOM.devProbeAssign) return;
    DOM.devProbeAssign.innerHTML = '';
    state.probes.forEach(probe => {
      const opt = document.createElement('option');
      opt.value = probe.id;
      opt.textContent = `${probe.displayName} (${probe.ip})`;
      DOM.devProbeAssign.appendChild(opt);
    });
  }

  function updateHeaderBadges() {
    const active = state.alarms.filter(a => a.status === 'Active');
    DOM.headerAlarmsBadge.textContent = active.length;
    DOM.headerAlarmsBadge.style.display = active.length > 0 ? 'inline-block' : 'none';
  }

  // =========================================================================
  // WebSocket Live Telemetry
  // =========================================================================
  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      state.ws = new WebSocket(wsUrl);

      state.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'METRIC_TICK' && data.devices) {
            handleMetricTick(data.devices);
          } else if (data.type === 'ALARM_TOAST' && data.alarm) {
            showAlarmToast(data.alarm);
          }
        } catch (e) {}
      };

      state.ws.onclose = () => {
        setTimeout(initWebSocket, 4000);
      };
    } catch (e) {
      console.warn('WebSocket unavailable; falling back to polling.');
    }
  }

  function handleMetricTick(tickDevices) {
    let hasCriticalTick = false;
    tickDevices.forEach(t => {
      const dev = state.devices.find(d => d.id === t.id);
      if (dev) {
        dev.cpu = t.cpu;
        dev.memory = t.memory;
        dev.responseTime = t.responseTime;
        if (t.temperature) dev.temperature = t.temperature;
        if (dev.cpu > 92 || dev.memory > 92) {
          hasCriticalTick = true;
        }
      }
    });

    // Deterministic throttle, not a random gate: at most one critical
    // chime per minute while a device stays critical.
    if (hasCriticalTick && Date.now() - (state.lastCriticalChimeAt || 0) > 60000) {
      state.lastCriticalChimeAt = Date.now();
      playManageEngineAlertChime();
    }

    if (state.activeModalDevice) {
      const activeLive = state.devices.find(d => d.id === state.activeModalDevice.id);
      if (activeLive && state.activeSnapTab === 'overview') {
        updateDeviceModalMetrics(activeLive);
      }
    }

    if (state.currentTab === 'dashboard' && state.currentSubTab === 'Overview NOC') {
      updateDashboardRealtimeCounters();
    }
  }

  // ManageEngine Real-Time Alarm Toast Notification System
  function showAlarmToast(alarm) {
    if (!alarm) return;
    const container = document.getElementById('alarmToastContainer');
    if (!container) return;

    if (document.getElementById(`toast-${alarm.id}`)) return;

    const severity = (alarm.severity || 'Critical').toLowerCase();
    const toast = document.createElement('div');
    toast.id = `toast-${alarm.id}`;
    toast.className = `me-alarm-toast severity-${severity}`;

    const icon = severity === 'critical' ? '🔴' : severity === 'trouble' ? '🟠' : severity === 'attention' ? '🟡' : '🟢';

    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-probe-badge">🌐 ${alarm.probeName || '—'} • ${alarm.timestamp ? new Date(alarm.timestamp).toLocaleString() : '—'}</span>
        <button class="toast-close-btn" title="Dismiss">&times;</button>
      </div>
      <div class="toast-title">
        <span>${icon} [${(alarm.severity || 'Critical').toUpperCase()}]</span>
        <span>${alarm.deviceName || 'Device'} ${alarm.ip ? `(${alarm.ip})` : ''}</span>
      </div>
      <div class="toast-msg">${alarm.message || 'Alarm triggered on monitored network node'}</div>
      <div class="toast-actions">
        <button class="toast-btn-ack">✓ Acknowledge</button>
        <button class="toast-btn-inspect">🔍 Inspect Device</button>
      </div>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    const ackBtn = toast.querySelector('.toast-btn-ack');
    ackBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      ackBtn.textContent = 'Acknowledged ✓';
      ackBtn.disabled = true;
      try {
        await fetch('/api/json/alarms/acknowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alarmId: alarm.id, user: (state.currentUser && state.currentUser.username) || 'admin' })
        });
        const localAlarm = state.alarms.find(a => a.id === alarm.id);
        if (localAlarm) {
          localAlarm.acknowledged = true;
          localAlarm.ackUser = (state.currentUser && state.currentUser.username) || 'admin';
        }
        if (state.currentTab === 'alarms') {
          renderAlarmsView();
        }
      } catch (err) {}
      setTimeout(() => dismissToast(toast), 1000);
    });

    const inspectBtn = toast.querySelector('.toast-btn-inspect');
    inspectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast(toast);
      if (alarm.deviceId) {
        inspectDevice(alarm.deviceId);
      } else {
        const dev = state.devices.find(d => d.name === alarm.deviceName || d.ip === alarm.ip);
        if (dev) inspectDevice(dev.id);
      }
    });

    if (state.soundAlertsEnabled) {
      playManageEngineAlertChime();
    }

    container.appendChild(toast);

    const autoTimer = setTimeout(() => {
      dismissToast(toast);
    }, 10000);

    function dismissToast(el) {
      clearTimeout(autoTimer);
      el.classList.add('toast-hiding');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }
  }

  function setupAutoRefresh() {
    DOM.autoRefreshSelect.addEventListener('change', () => {
      if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
      const val = parseInt(DOM.autoRefreshSelect.value, 10);
      if (val > 0) {
        state.autoRefreshInterval = setInterval(async () => {
          await fetchInitialData();
          renderCurrentView();
        }, val * 1000);
      }
    });
  }

  // =========================================================================
  // Zia AI Operations Assistant
  // =========================================================================
  function bindZiaDrawer() {
    DOM.btnHeaderZia.addEventListener('click', () => {
      DOM.ziaDrawer.classList.toggle('active');
      if (DOM.ziaDrawer.classList.contains('active')) {
        DOM.ziaInput.focus();
      }
    });

    DOM.closeZiaDrawer.addEventListener('click', () => {
      DOM.ziaDrawer.classList.remove('active');
    });

    const chips = DOM.ziaDrawer.querySelectorAll('.zia-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        askZia(q);
      });
    });

    DOM.btnSendZia.addEventListener('click', () => {
      const q = DOM.ziaInput.value.trim();
      if (q) {
        askZia(q);
        DOM.ziaInput.value = '';
      }
    });

    DOM.ziaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = DOM.ziaInput.value.trim();
        if (q) {
          askZia(q);
          DOM.ziaInput.value = '';
        }
      }
    });
  }

  async function askZia(queryText) {
    const userMsg = document.createElement('div');
    userMsg.className = 'zia-msg user';
    userMsg.textContent = queryText;
    DOM.ziaChatBox.appendChild(userMsg);
    DOM.ziaChatBox.scrollTop = DOM.ziaChatBox.scrollHeight;

    const botMsg = document.createElement('div');
    botMsg.className = 'zia-msg bot';
    botMsg.innerHTML = `<strong>Zia AI:</strong> <div><em>Analyzing Enterprise telemetry &amp; correlations...</em></div>`;
    DOM.ziaChatBox.appendChild(botMsg);
    DOM.ziaChatBox.scrollTop = DOM.ziaChatBox.scrollHeight;

    try {
      const res = await fetch('/api/zia/query', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText })
      }).then(r => r.json());

      const ans = res.response || res || {};
      let recsHtml = '';
      if (ans.recommendations && ans.recommendations.length) {
        recsHtml = `<div style="margin-top: 8px; font-weight: 700;">Recommended Next Steps:</div><ul style="margin-left: 16px; margin-top: 4px;">${ans.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>`;
      }
      // Confidence is shown only if the API actually scored the answer.
      // There is no inference to score, so the API returns null — and the
      // UI shows nothing rather than an invented percentage.
      const conf = (typeof ans.confidence === 'number' && Number.isFinite(ans.confidence))
        ? `<span style="font-size: 10px; color: var(--text-muted);">Confidence: ${ans.confidence}%</span>` : '';

      botMsg.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong>Zia AI Operations:</strong>
          ${conf}
        </div>
        <div>${ans.summary || ans.answer || 'No answer returned for this question.'}</div>
        ${recsHtml}
      `;
    } catch (e) {
      botMsg.innerHTML = `<strong>Zia AI:</strong> <div>Telemetry analysis failed: ${e.message}</div>`;
    }

    DOM.ziaChatBox.scrollTop = DOM.ziaChatBox.scrollHeight;
  }

  function bindHeaderEvents() {
    DOM.globalProbeSelect.addEventListener('change', (e) => {
      state.selectedProbeId = e.target.value;
      renderCurrentView();
    });

    DOM.globalSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (state.currentTab !== 'inventory' && state.currentTab !== 'alarms') {
        state.currentTab = 'inventory';
        state.currentSubTab = 'All Devices';
        renderNavigation();
      }
      renderCurrentView();
    });

    DOM.headerAlarmsBtn.addEventListener('click', () => {
      switchTab('alarms', 'All Active');
    });

    DOM.btnHeaderAddDevice.addEventListener('click', () => {
      DOM.addDeviceModal.classList.add('active');
    });

    DOM.btnHeaderAddProbe.addEventListener('click', () => {
      DOM.addProbeModal.classList.add('active');
    });

    DOM.btnHeaderDownloadAgent.addEventListener('click', () => {
      openDownloadAgentModal();
    });

    const tabs = DOM.mainNavTabs.querySelectorAll('.me-tab-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabKey = tab.getAttribute('data-tab');
        switchTab(tabKey);
      });
    });
  }

  function switchTab(tabKey, subTabKey) {
    if (!MENU_DEFINITIONS[tabKey]) return;
    state.currentTab = tabKey;
    state.currentSubTab = subTabKey || MENU_DEFINITIONS[tabKey].subTabs[0];

    const tabs = DOM.mainNavTabs.querySelectorAll('.me-tab-item');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabKey) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    renderNavigation();
    renderCurrentView();
  }

  function renderNavigation() {
    const currentDef = MENU_DEFINITIONS[state.currentTab];
    if (!currentDef) return;

    DOM.subnavList.innerHTML = '';
    currentDef.subTabs.forEach(sub => {
      const li = document.createElement('li');
      li.className = `me-subnav-item ${sub === state.currentSubTab ? 'active' : ''}`;
      li.textContent = sub;
      li.addEventListener('click', () => {
        state.currentSubTab = sub;
        renderNavigation();
        renderCurrentView();
      });
      DOM.subnavList.appendChild(li);
    });

    DOM.subnavActions.innerHTML = '';
    if (state.currentTab === 'inventory') {
      DOM.subnavActions.innerHTML = `
        <button class="btn-me-primary" id="subnavAddDevice">+ Add Monitored Device</button>
      `;
      document.getElementById('subnavAddDevice')?.addEventListener('click', () => {
        DOM.addDeviceModal.classList.add('active');
      });
    } else if (state.currentTab === 'probes') {
      DOM.subnavActions.innerHTML = `
        <button class="btn-me-primary" id="subnavAddProbe">+ Add Enterprise Probe</button>
        <button class="btn-me-secondary" id="subnavSyncAll">🔄 Sync All Probes</button>
      `;
      document.getElementById('subnavAddProbe')?.addEventListener('click', () => {
        DOM.addProbeModal.classList.add('active');
      });
      document.getElementById('subnavSyncAll')?.addEventListener('click', syncAllProbes);
    } else if (state.currentTab === 'alarms') {
      DOM.subnavActions.innerHTML = `
        <button class="btn-me-secondary" id="subnavBatchAck">✓ Ack Selected</button>
        <button class="btn-me-secondary" id="subnavBatchClear">✕ Clear Selected</button>
      `;
      document.getElementById('subnavBatchAck')?.addEventListener('click', batchAcknowledge);
      document.getElementById('subnavBatchClear')?.addEventListener('click', batchClear);
    } else if (state.currentTab === 'dashboard') {
      DOM.subnavActions.innerHTML = `
        <button class="btn-me-secondary" id="subnavAddWidget">➕ Add Widget</button>
        <button class="btn-me-secondary" id="subnavRefreshDash">🔄 Refresh NOC</button>
      `;
      document.getElementById('subnavAddWidget')?.addEventListener('click', openWidgetCatalog);
      document.getElementById('subnavRefreshDash')?.addEventListener('click', () => {
        fetchInitialData().then(renderCurrentView);
      });
    }
  }

  // =========================================================================
  // Filtering Logic
  // =========================================================================
  function getFilteredDevices() {
    let list = state.devices;

    if (state.selectedProbeId !== 'all') {
      list = list.filter(d => String(d.probeId) === String(state.selectedProbeId));
    }

    if (state.currentTab === 'inventory') {
      if (state.currentSubTab === 'Routers') list = list.filter(d => d.category === 'Router');
      else if (state.currentSubTab === 'Switches') list = list.filter(d => d.category === 'Switch');
      else if (state.currentSubTab === 'Firewalls') list = list.filter(d => d.category === 'Firewall');
      else if (state.currentSubTab === 'Servers') list = list.filter(d => d.category === 'Server');
      else if (state.currentSubTab === 'Storage & UPS') list = list.filter(d => ['Storage', 'UPS', 'LoadBalancer'].includes(d.category));
    }

    if (state.searchQuery) {
      list = list.filter(d =>
        (d.name || '').toLowerCase().includes(state.searchQuery) ||
        (d.displayName || '').toLowerCase().includes(state.searchQuery) ||
        (d.ip || '').includes(state.searchQuery) ||
        (d.vendor || '').toLowerCase().includes(state.searchQuery) ||
        (d.category || '').toLowerCase().includes(state.searchQuery)
      );
    }

    return list;
  }

  function getFilteredAlarms() {
    let list = state.alarms;

    if (state.selectedProbeId !== 'all') {
      list = list.filter(a => String(a.probeId) === String(state.selectedProbeId));
    }

    if (state.currentTab === 'alarms') {
      if (state.currentSubTab === 'Critical') list = list.filter(a => a.severity === 'Critical');
      else if (state.currentSubTab === 'Trouble') list = list.filter(a => a.severity === 'Trouble');
      else if (state.currentSubTab === 'Attention') list = list.filter(a => a.severity === 'Attention');
      else if (state.currentSubTab === 'Acknowledged') list = list.filter(a => a.status === 'Acknowledged');
    }

    if (state.searchQuery) {
      list = list.filter(a =>
        (a.deviceName || '').toLowerCase().includes(state.searchQuery) ||
        (a.message || '').toLowerCase().includes(state.searchQuery) ||
        (a.ip || '').includes(state.searchQuery)
      );
    }

    return list;
  }

  // =========================================================================
  // View Router
  // =========================================================================
  function renderCurrentView() {
    if (state.topologyAnimId) {
      cancelAnimationFrame(state.topologyAnimId);
      state.topologyAnimId = null;
    }

    switch (state.currentTab) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'inventory':
        renderInventoryView();
        break;
      case 'alarms':
        renderAlarmsView();
        break;
      case 'topology':
        renderTopologyView();
        break;
      case 'probes':
        renderProbesView();
        break;
      case 'discovery':
        renderDiscoveryView();
        break;
      case 'ccm':
        renderCCMView();
        break;
      case 'reports':
        renderReportsView();
        break;
      case 'settings':
        renderSettingsView();
        break;
      default:
        renderDashboardView();
    }
  }

  // =========================================================================
  // VIEW: DASHBOARD (Authentic ManageEngine OpManager Central NOC Grid)
  // =========================================================================
  function renderDashboardView() {
    const devices = getFilteredDevices();
    const alarms = getFilteredAlarms();
    const activeProbes = state.probes.filter(p => p.status === 'Online');

    const criticalAlarms = alarms.filter(a => a.severity === 'Critical');
    const troubleAlarms = alarms.filter(a => a.severity === 'Trouble');
    const attentionAlarms = alarms.filter(a => a.severity === 'Attention');
    const clearAlarms = alarms.filter(a => a.severity === 'Clear');

    const avgLatency = devices.length
      ? Math.round(devices.reduce((acc, d) => acc + (d.responseTime || 0), 0) / devices.length)
      : 0;
    // SLA only from availability the API actually returned per device;
    // with no availability history there is no SLA number to show.
    const slaAvg = availabilityStats(devices);

    if (state.currentSubTab === 'NCM Enterprise (NCMEE)') {
      renderNcmeeDashboard();
      return;
    }

    if (state.currentSubTab === 'Overview NOC') {
      const topCpu = [...devices].sort((a, b) => b.cpu - a.cpu).slice(0, 5);
      const topMem = [...devices].sort((a, b) => b.memory - a.memory).slice(0, 5);
      const recentAlarms = [...alarms].slice(0, 6);

      DOM.workspace.innerHTML = `
        <!-- KPI Summary Ribbon -->
        <div class="me-kpi-ribbon">
          <div class="me-kpi-tile">
            <div class="kpi-tile-icon" style="background: rgba(14, 165, 233, 0.15); color: #0284c7;">🖥️</div>
            <div>
              <div class="kpi-tile-num" id="kpiDevCount">${devices.length}</div>
              <div class="kpi-tile-txt">Monitored Devices</div>
            </div>
          </div>

          <div class="me-kpi-tile">
            <div class="kpi-tile-icon" style="background: rgba(34, 197, 94, 0.15); color: #16a34a;">📡</div>
            <div>
              <div class="kpi-tile-num">${state.selectedProbeId === 'all' ? `${activeProbes.length} / ${state.probes.length}` : 'Active'}</div>
              <div class="kpi-tile-txt">Enterprise Probes</div>
            </div>
          </div>

          <div class="me-kpi-tile">
            <div class="kpi-tile-icon" style="background: rgba(239, 68, 68, 0.15); color: #dc2626;">🚨</div>
            <div>
              <div class="kpi-tile-num" style="color: var(--severity-critical);">${criticalAlarms.length}</div>
              <div class="kpi-tile-txt">Critical Alarms</div>
            </div>
          </div>

          <div class="me-kpi-tile">
            <div class="kpi-tile-icon" style="background: rgba(245, 158, 11, 0.15); color: #d97706;">⚠️</div>
            <div>
              <div class="kpi-tile-num" style="color: var(--severity-trouble);">${troubleAlarms.length}</div>
              <div class="kpi-tile-txt">Trouble / Warning</div>
            </div>
          </div>

          <div class="me-kpi-tile">
            <div class="kpi-tile-icon" style="background: rgba(168, 85, 247, 0.15); color: #9333ea;">⚡</div>
            <div>
              <div class="kpi-tile-num" id="kpiAvgLatency">${avgLatency} ms</div>
              <div class="kpi-tile-txt">Avg Probe Latency</div>
            </div>
          </div>
        </div>

        <!-- 3-Column Widget Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Widget 1: Alarms by Severity Donut Chart -->
          ${state.widgetsVisibility.alarmsDonut ? `
            <div class="me-card" style="margin-bottom: 0;">
              <div class="me-card-header">
                <span class="me-card-title">🚨 Alarms by Severity</span>
                <span style="font-size: 11px; color: var(--text-muted); cursor: pointer;" onclick="window.OpManager.switchTab('alarms')">View All →</span>
              </div>
              <div class="me-card-body">
                <div class="donut-widget-layout">
                  ${renderAlarmsDonut(criticalAlarms.length, troubleAlarms.length, attentionAlarms.length, clearAlarms.length, alarms.length)}
                  <div class="donut-legend-list">
                    <div class="donut-legend-item" onclick="window.OpManager.switchTab('alarms', 'Critical')">
                      <span class="legend-color-dot" style="background-color: var(--severity-critical);"></span>
                      <span>Critical: <strong>${criticalAlarms.length}</strong></span>
                    </div>
                    <div class="donut-legend-item" onclick="window.OpManager.switchTab('alarms', 'Trouble')">
                      <span class="legend-color-dot" style="background-color: var(--severity-trouble);"></span>
                      <span>Trouble: <strong>${troubleAlarms.length}</strong></span>
                    </div>
                    <div class="donut-legend-item" onclick="window.OpManager.switchTab('alarms', 'Attention')">
                      <span class="legend-color-dot" style="background-color: var(--severity-attention);"></span>
                      <span>Attention: <strong>${attentionAlarms.length}</strong></span>
                    </div>
                    <div class="donut-legend-item">
                      <span class="legend-color-dot" style="background-color: var(--severity-clear);"></span>
                      <span>Normal: <strong>${devices.length - criticalAlarms.length - troubleAlarms.length}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Widget 2: Network SLA Availability & Uptime -->
          ${state.widgetsVisibility.slaMeter ? `
            <div class="me-card" style="margin-bottom: 0;">
              <div class="me-card-header">
                <span class="me-card-title">🏆 Network SLA Availability</span>
                ${slaAvg !== null ? `<span class="badge-me clear" style="font-size: 9px;">${slaAvg.toFixed(2)}% availability</span>` : `<span class="badge-me" style="font-size: 9px;">No SLA data yet</span>`}
              </div>
              <div class="me-card-body" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: var(--severity-clear); margin-bottom: 4px;">${slaAvg !== null ? slaAvg.toFixed(2) + ' %' : '—'}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">${slaAvg !== null ? '30-Day Operational Availability SLA' : 'No availability history yet — add devices and let them poll.'}</div>
                <div class="progress-me-bg" style="width: 80%; height: 8px;">
                  <div class="progress-me-bar green" style="width: ${slaAvg !== null ? slaAvg : 0}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; width: 80%; font-size: 10px; color: var(--text-muted); margin-top: 6px;">
                  <span>No SLA target set</span>
                  <span>Current: ${slaAvg !== null ? slaAvg.toFixed(2) + '%' : '—'}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Widget 3: Quick Diagnostic Utilities -->
          ${state.widgetsVisibility.quickTools ? `
            <div class="me-card" style="margin-bottom: 0;">
              <div class="me-card-header">
                <span class="me-card-title">⚡ Quick Diagnostic Tools</span>
              </div>
              <div class="me-card-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" onclick="window.OpManager.runQuickPing()">
                  📡 ICMP Ping
                </button>
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" onclick="document.getElementById('mibBrowserModal').classList.add('active')">
                  🔍 MIB Browser
                </button>
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" ${devices.length ? '' : 'disabled title="Add a device first"'} onclick="window.OpManager.openTerminalForFirstDevice()">
                  💻 CLI Terminal
                </button>
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" ${devices.length ? '' : 'disabled title="Add a device first"'} onclick="window.OpManager.openSwitchPortsForFirstDevice()">
                  🔌 Port Mapper
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 2-Column Performance Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Top 5 CPU -->
          ${state.widgetsVisibility.topCpu ? `
            <div class="me-card" style="margin-bottom: 0;">
              <div class="me-card-header">
                <span class="me-card-title">🔥 Top 5 Devices by CPU Utilization</span>
                <span style="font-size: 11px; color: var(--text-muted);">Real-time SNMP/WMI</span>
              </div>
              <div class="me-card-body" style="padding: 10px 14px;">
                ${topCpu.map(dev => `
                  <div style="margin-bottom: 12px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${dev.id}')">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                      <span>${dev.name} <span style="color: var(--text-muted); font-weight: normal;">(${dev.ip})</span></span>
                      <span style="color: ${getUtilizationColor(dev.cpu)};">${dev.cpu ?? '—'}%</span>
                    </div>
                    <div class="progress-me-bg">
                      <div class="progress-me-bar ${getProgressBarClass(dev.cpu)}" style="width: ${Number(dev.cpu) || 0}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Top 5 Memory -->
          ${state.widgetsVisibility.topMem ? `
            <div class="me-card" style="margin-bottom: 0;">
              <div class="me-card-header">
                <span class="me-card-title">💾 Top 5 Devices by Memory Utilization</span>
                <span style="font-size: 11px; color: var(--text-muted);">Real-time Telemetry</span>
              </div>
              <div class="me-card-body" style="padding: 10px 14px;">
                ${topMem.map(dev => `
                  <div style="margin-bottom: 12px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${dev.id}')">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                      <span>${dev.name} <span style="color: var(--text-muted); font-weight: normal;">(${dev.ip})</span></span>
                      <span style="color: ${getUtilizationColor(dev.memory)};">${dev.memory ?? '—'}%</span>
                    </div>
                    <div class="progress-me-bg">
                      <div class="progress-me-bar ${getProgressBarClass(dev.memory)}" style="width: ${Number(dev.memory) || 0}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Unified Central Alarms Live Console Widget -->
        ${state.widgetsVisibility.recentAlarms ? `
          <div class="me-card">
            <div class="me-card-header">
              <span class="me-card-title">🚨 Recent Alarms Console (Central Feed)</span>
              <button class="btn-me-secondary" style="font-size: 11px;" onclick="window.OpManager.switchTab('alarms')">Open Alarm Console →</button>
            </div>
            <div class="me-table-wrap">
              <table class="me-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Remote Probe</th>
                    <th>Message</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentAlarms.map(a => {
                    const probe = state.probes.find(p => p.id === a.probeId) || { displayName: 'Central' };
                    return `
                      <tr>
                        <td><span class="badge-me ${a.severity.toLowerCase()}">${a.severity}</span></td>
                        <td><strong>${a.deviceName}</strong></td>
                        <td><code>${a.ip}</code></td>
                        <td>📍 ${probe.displayName}</td>
                        <td>${a.message}</td>
                        <td>${a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : '—'}</td>
                        <td>
                          <button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.acknowledgeAlarm('${a.id}')">Ack</button>
                          <button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.clearAlarm('${a.id}')">Clear</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      `;
    } else if (state.currentSubTab === 'Top 10 Performance') {
      const topCpu10 = [...devices].sort((a, b) => b.cpu - a.cpu).slice(0, 10);
      const topMem10 = [...devices].sort((a, b) => b.memory - a.memory).slice(0, 10);

      if (!devices.length) {
        DOM.workspace.innerHTML = emptyStateHtml('No performance data yet', 'Add a device or run discovery — performance data fills in once devices are polled.');
      } else {
      DOM.workspace.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="me-card">
            <div class="me-card-header"><span class="me-card-title">🔥 Top 10 CPU Consumption</span></div>
            <div class="me-card-body">
              ${topCpu10.map((d, i) => `
                <div style="margin-bottom: 10px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${d.id}')">
                  <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 2px;">
                    <span>#${i+1} <strong>${d.name}</strong> (${d.ip})</span>
                    <span style="font-weight: 700; color: ${getUtilizationColor(d.cpu)};">${d.cpu ?? '—'}%</span>
                  </div>
                  <div class="progress-me-bg"><div class="progress-me-bar ${getProgressBarClass(d.cpu)}" style="width:${Number(d.cpu) || 0}%;"></div></div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="me-card">
            <div class="me-card-header"><span class="me-card-title">💾 Top 10 Memory Consumption</span></div>
            <div class="me-card-body">
              ${topMem10.map((d, i) => `
                <div style="margin-bottom: 10px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${d.id}')">
                  <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 2px;">
                    <span>#${i+1} <strong>${d.name}</strong> (${d.ip})</span>
                    <span style="font-weight: 700; color: ${getUtilizationColor(d.memory)};">${d.memory ?? '—'}%</span>
                  </div>
                  <div class="progress-me-bg"><div class="progress-me-bar ${getProgressBarClass(d.memory)}" style="width:${Number(d.memory) || 0}%;"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      }
    } else if (state.currentSubTab === 'Device Health Heatmap') {
      if (!devices.length) {
        DOM.workspace.innerHTML = emptyStateHtml('No Switch Interface Telemetry', 'Real-time interface heatmap will render once switches are discovered.');
      } else {
      DOM.workspace.innerHTML = `
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🗺️ Unified Enterprise Infrastructure Heatmap (${devices.length} Devices)</span>
            <div style="display: flex; gap: 12px; font-size: 11px;">
              <span><span class="badge-me clear" style="padding: 1px 5px;">Clear</span> Normal</span>
              <span><span class="badge-me attention" style="padding: 1px 5px;">Attention</span> >70% Load</span>
              <span><span class="badge-me trouble" style="padding: 1px 5px;">Trouble</span> >85% Load</span>
              <span><span class="badge-me critical" style="padding: 1px 5px;">Critical</span> >95% Load</span>
              <span><span class="badge-me down" style="padding: 1px 5px;">Down</span> Unreachable</span>
            </div>
          </div>
          <div class="me-card-body">
            <div class="me-heat-grid">
              ${devices.map(dev => {
                let heatClass = '';
                if (dev.status === 'Down') heatClass = 'down';
                else if (dev.cpu > 92 || dev.memory > 92) heatClass = 'critical';
                else if (dev.cpu > 80 || dev.memory > 80) heatClass = 'trouble';
                else if (dev.cpu > 65 || dev.memory > 65) heatClass = 'attention';

                return `
                  <div class="me-heat-cell ${heatClass}" onclick="window.OpManager.inspectDevice('${dev.id}')" title="${dev.name} (${dev.ip}) - CPU: ${dev.cpu ?? '—'}%, Mem: ${dev.memory ?? '—'}%">
                    <div class="heat-cell-name">${dev.name}</div>
                    <div class="heat-cell-ip">${dev.ip}</div>
                    <div style="display:flex; justify-content:space-between; font-size: 10px; margin-top: 4px; color: var(--text-muted);">
                      <span>${dev.category}</span>
                      <span>${dev.cpu ?? '—'}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
      }
    } else if (state.currentSubTab === 'Alarms Summary') {
      renderAlarmsView();
    }
  }

  function renderAlarmsDonut(crit, troub, att, clear, total) {
    const tot = Math.max(1, crit + troub + att + clear);
    const radius = 45;
    const circ = 2 * Math.PI * radius;

    const pCrit = crit / tot;
    const pTroub = troub / tot;
    const pAtt = att / tot;

    const dashCrit = pCrit * circ;
    const dashTroub = pTroub * circ;
    const dashAtt = pAtt * circ;

    return `
      <div class="donut-svg-box">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--severity-clear)" stroke-width="14" />
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--severity-attention)" stroke-width="14"
            stroke-dasharray="${dashAtt} ${circ}" stroke-dashoffset="0" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--severity-trouble)" stroke-width="14"
            stroke-dasharray="${dashTroub} ${circ}" stroke-dashoffset="-${dashAtt}" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--severity-critical)" stroke-width="14"
            stroke-dasharray="${dashCrit} ${circ}" stroke-dashoffset="-${dashAtt + dashTroub}" transform="rotate(-90 60 60)" />
        </svg>
        <div class="donut-center-stat">
          <div class="donut-center-num">${total}</div>
          <div class="donut-center-lbl">Alarms</div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine NCM Enterprise (NCMEE) Dashboard View
  // =========================================================================
  async function renderNcmeeDashboard() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🛡️ Network Configuration Management Enterprise (NCM EE)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Centralized multi-probe configuration compliance, change tracking, and automated drift detection</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-secondary" onclick="window.OpManager.pushBaselineToProbes()">⚡ Push Baseline</button>
        </div>
      </div>
      <div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--text-muted);">Loading configuration backups…</div>
    `;

    let configs = [];
    try {
      const res = await apiJson('/api/ccm/configs');
      configs = res.configs || res.rows || [];
    } catch (e) {
      DOM.workspace.innerHTML = `<div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--severity-critical);">Couldn't load configuration backups — ${escapeHtml(e.message)}</div>`;
      return;
    }

    if (!configs.length) {
      DOM.workspace.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
          <div>
            <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🛡️ Network Configuration Management Enterprise (NCM EE)</span>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Centralized multi-probe configuration compliance, change tracking, and automated drift detection</div>
          </div>
        </div>
        ${emptyStateHtml('No NCM Devices Enrolled', 'Add a device, then back it up here — automated backup and drift audits activate once network devices are added.')}
      `;
      return;
    }

    const rows = configs.map(cfg => {
      const dev = state.devices.find(d => String(d.id) === String(cfg.device_id || cfg.deviceId)) || {};
      const name = cfg.deviceName || cfg.device_name || dev.name || dev.hostname || '—';
      const ip = cfg.ip || dev.ip || '—';
      const fetched = cfg.fetched_at || cfg.fetchedAt || cfg.lastBackup || cfg.backupTime || null;
      return `
        <tr>
          <td><strong>${escapeHtml(String(name))}</strong></td>
          <td><code>${escapeHtml(String(ip))}</code></td>
          <td>${escapeHtml(String(cfg.config_type || cfg.configType || cfg.type || '—'))}</td>
          <td>${fmtTime(fetched)}</td>
          <td>${cfg.device_id || cfg.deviceId ? `<button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.openConfigDiff('${cfg.device_id || cfg.deviceId}')">View Diff</button>` : '—'}</td>
        </tr>
      `;
    }).join('');

    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🛡️ Network Configuration Management Enterprise (NCM EE)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Backed-up configurations from the server — ${configs.length} on file</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-secondary" onclick="window.OpManager.pushBaselineToProbes()">⚡ Push Baseline</button>
        </div>
      </div>
      <div class="me-card">
        <div class="me-card-header"><span class="me-card-title">💾 Configuration Backups</span></div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead><tr><th>Device</th><th>IP Address</th><th>Config Type</th><th>Fetched</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderFlowAnalysisView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">📊 ManageEngine NetFlow Analyzer (NFA Module)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">NetFlow v5/v9, sFlow, J-Flow, and IPFIX packet stream ingestion</div>
        </div>
      </div>
      ${emptyStateHtml('No Flow Records Ingested (UDP 2055 / 9996)', 'Export NetFlow v5/v9, IPFIX, or sFlow streams from your core routers to UDP port 2055 to analyze application traffic breakdown and top talkers.')}
    `;
  }

  function renderIpManagementView() {
    const first = firstDevice();
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🏢 IP Address Management (OpUtils)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Subnet utilization, rogue device detection, and switch port mapping</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" ${first ? '' : 'disabled title="Add a device first"'} onclick="window.OpManager.openSwitchPortsForFirstDevice()">🔌 Map Switch Ports</button>
        </div>
      </div>
      ${emptyStateHtml('No IP Subnets or Switch Port Mappings Configured', 'Scan IPv4/IPv6 subnets, detect rogue MAC addresses, and map switch port interfaces using integrated OpUtils diagnostic tools.')}
    `;
  }

  function renderInterfacesInventory() {
    const devices = getFilteredDevices();
    const interfacesList = [];

    devices.forEach(dev => {
      (dev.interfaces || []).forEach(intf => {
        interfacesList.push({
          deviceName: dev.name || dev.hostname,
          deviceId: dev.id,
          ip: dev.ip,
          probeName: probeDisplayName(dev),
          ...intf
        });
      });
    });

    if (!interfacesList.length) {
      DOM.workspace.innerHTML = `
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🌐 Monitored Network Interfaces (IF-MIB: 0 Active Ports)</span>
          </div>
        </div>
        ${emptyStateHtml('No network interface traffic recorded.', 'Discovered switch/router interfaces will stream live telemetry here. Add a device or run discovery first.')}
      `;
      return;
    }

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🌐 Monitored Network Interfaces (IF-MIB: ${interfacesList.length} Active Ports)</span>
          <div style="font-size: 11px; color: var(--text-muted);">Real-time RFC1213 / IF-MIB Traffic Throughput &amp; Operational States</div>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Oper Status</th>
                <th>Device</th>
                <th>Interface Name</th>
                <th>Port Speed</th>
                <th>Inbound Traffic (Mbps)</th>
                <th>Outbound Traffic (Mbps)</th>
                <th>Remote Probe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${interfacesList.map(intf => `
                <tr>
                  <td><span class="badge-me ${(String(intf.status || intf.operStatus || '').toLowerCase() === 'up') ? 'clear' : 'down'}">${displayVal(intf.status || intf.operStatus)}</span></td>
                  <td><strong style="cursor: pointer;" onclick="window.OpManager.inspectDevice('${intf.deviceId}')">${escapeHtml(String(intf.deviceName || '—'))}</strong> <span style="font-size: 10px; color: var(--text-muted);">(${escapeHtml(String(intf.ip || ''))})</span></td>
                  <td><code>${escapeHtml(String(intf.name || '—'))}</code></td>
                  <td>${displayVal(intf.speed)}</td>
                  <td><span style="font-weight: 700;">${displayVal(intf.inTraffic)}</span></td>
                  <td><span style="font-weight: 700;">${displayVal(intf.outTraffic)}</span></td>
                  <td>📍 ${escapeHtml(String(intf.probeName || '—'))}</td>
                  <td>
                    <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.openSwitchPorts('${escapeHtml(String(intf.deviceName || ''))}', '${escapeHtml(String(intf.ip || ''))}')">Port Mapper</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function renderHostAgentsInventory() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🖥️ OpManager Central Monitored Host Agents</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Lightweight cross-platform telemetry daemon compiled for Windows (x64) and macOS (Universal)</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.openDownloadAgentModal()">⬇️ Download Agent (EXE / DMG)</button>
        </div>
      </div>
      <div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--text-muted);">Loading registered agents…</div>
    `;

    let agents = [];
    try {
      const res = await apiJson('/api/agent/list');
      agents = res.agents || [];
    } catch (e) {
      DOM.workspace.innerHTML = `<div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--severity-critical);">Couldn't load host agents — ${escapeHtml(e.message)}</div>`;
      return;
    }

    if (!agents.length) {
      DOM.workspace.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
          <div>
            <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🖥️ OpManager Central Monitored Host Agents</span>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Lightweight cross-platform telemetry daemon compiled for Windows (x64) and macOS (Universal)</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-primary" onclick="window.OpManager.openDownloadAgentModal()">⬇️ Download Agent (EXE / DMG)</button>
          </div>
        </div>
        ${emptyStateHtml('No monitoring agents enrolled yet', 'Download the agent and install it on a server host — enrolled agents with live heartbeats appear here.')}
      `;
      return;
    }

    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🖥️ OpManager Central Monitored Host Agents</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Lightweight cross-platform telemetry daemon compiled for Windows (x64) and macOS (Universal)</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.openDownloadAgentModal()">⬇️ Download Agent (EXE / DMG)</button>
        </div>
      </div>
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">📡 Active Host Agents Telemetry Stream</span>
          <span class="badge-me clear">${agents.length} agent${agents.length === 1 ? '' : 's'} registered</span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Agent Identifier</th>
                <th>Hostname</th>
                <th>Operating System</th>
                <th>Host IP</th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>Disk %</th>
                <th>Last Heartbeat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${agents.map(a => `
                <tr>
                  <td><span class="badge-me ${a.status === 'Online' ? 'clear' : 'down'}">${escapeHtml(String(a.status || '—'))}</span></td>
                  <td><code>${escapeHtml(String(a.agentId || '—'))}</code></td>
                  <td><strong>${escapeHtml(String(a.hostname || '—'))}</strong></td>
                  <td>${escapeHtml(String(a.platform || a.os || '—'))}</td>
                  <td><code>${escapeHtml(String(a.ip || '—'))}</code></td>
                  <td><span style="font-weight: 700;">${displayVal(a.metrics && a.metrics.cpu)}${a.metrics && a.metrics.cpu != null ? '%' : ''}</span></td>
                  <td><span style="font-weight: 700;">${displayVal(a.metrics && a.metrics.memory)}${a.metrics && a.metrics.memory != null ? '%' : ''}</span></td>
                  <td><span style="font-weight: 700;">${displayVal(a.metrics && a.metrics.disk)}${a.metrics && a.metrics.disk != null ? '%' : ''}</span></td>
                  <td>${fmtTime(a.lastHeartbeat || a.registeredAt)}</td>
                  <td>${a.ip ? `<button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.runQuickPing('${escapeHtml(String(a.ip))}')">Ping</button>` : '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderRcaView() {
    const critical = getFilteredAlarms().filter(a => a.severity === 'Critical' || a.severity === 'Trouble');
    const header = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🔬 Automated Root Cause Analysis (RCA Engine)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Correlation is derived only from live alarms — no incident is shown until one actually occurs</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-secondary" onclick="window.OpManager.switchTab('alarms')">Open Alarm Console →</button>
        </div>
      </div>
    `;

    if (!critical.length) {
      DOM.workspace.innerHTML = header + emptyStateHtml('No Active Root Cause Incidents', 'Root cause analysis will appear here when critical alarms occur. The correlation engine is standby until then.');
      return;
    }

    DOM.workspace.innerHTML = header + `
      <div class="me-card">
        <div class="me-card-header"><span class="me-card-title">🚨 Open Critical / Trouble Alarms (${critical.length})</span></div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead><tr><th>Severity</th><th>Device</th><th>IP Address</th><th>Message</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              ${critical.map(a => `
                <tr>
                  <td><span class="badge-me ${(a.severity || '').toLowerCase()}">${escapeHtml(String(a.severity || '—'))}</span></td>
                  <td><strong>${escapeHtml(String(a.deviceName || a.device || '—'))}</strong></td>
                  <td><code>${escapeHtml(String(a.ip || '—'))}</code></td>
                  <td>${escapeHtml(String(a.message || '—'))}</td>
                  <td>${fmtTime(a.timestamp || a.created_at)}</td>
                  <td>${a.deviceId ? `<button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.inspectDevice('${a.deviceId}')">Inspect</button>` : '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderComplianceAuditView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">📜 Regulatory &amp; Security Compliance Audit</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Compliance auditing against CIS, PCI-DSS 4.0, HIPAA, and SOX standards</div>
        </div>
      </div>
      ${emptyStateHtml('No NCM Device Configurations Monitored', 'Enable SSH/Telnet credentials on network devices to automate startup vs running config backups and compliance policy checks. Add a device and take a baseline backup first.')}
    `;
  }

  function renderProbeMutualAuthView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🔑 Central-Probe Mutual TLS &amp; Probe Authentication</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Probe authentication state as reported by the server — keys are never displayed in the UI</div>
        </div>
      </div>
      ${state.probes.length ? `
        <div class="me-card">
          <div class="me-table-wrap">
            <table class="me-table">
              <thead><tr><th>Probe</th><th>IP Address</th><th>Status</th><th>Auth Key</th><th>Cipher</th><th>Actions</th></tr></thead>
              <tbody>
                ${state.probes.map(p => `
                  <tr>
                    <td><strong>${escapeHtml(String(p.displayName || p.name || '—'))}</strong></td>
                    <td><code>${escapeHtml(String(p.ip || '—'))}</code></td>
                    <td><span class="badge-me ${String(p.status || '').toLowerCase() === 'online' ? 'clear' : 'down'}">${escapeHtml(String(p.status || '—'))}</span></td>
                    <td>${p.eeAuthKey ? 'Key on file (not shown)' : 'No key on file'}</td>
                    <td>${escapeHtml(String(p.cipher || '—'))}</td>
                    <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.testProbeConnection('${p.id}')">Test Link</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : emptyStateHtml('No probes registered yet', 'Register a remote probe to see its authentication state here.')}
    `;
  }

  function renderCentralSystemInfoView() {
    const c = state.central || {};
    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header"><span class="me-card-title">🖥️ Central System Info</span></div>
        <div class="me-card-body" style="font-size: 12px; line-height: 1.8;">
          <div><strong>Product:</strong> ManageEngine OpManager Central 12.9.204-GA</div>
          <div><strong>Version:</strong> ${escapeHtml(String(c.version || '—'))}</div>
          <div><strong>Host Binding:</strong> <code>${escapeHtml(String(c.host || '—'))}:${escapeHtml(String(c.port || '—'))}</code></div>
          <div><strong>High Availability:</strong> ${escapeHtml(String(c.haStatus || '—'))}</div>
          <div><strong>Database Engine:</strong> ${escapeHtml(String(c.dbType || c.database || '—'))}</div>
          <div><strong>Uptime:</strong> ${escapeHtml(String(c.uptime || '—'))}</div>
          <div><strong>License:</strong> ${c.license ? escapeHtml(String(c.license)) : 'No license applied yet — apply a license key to register this installation.'}</div>
          <div><strong>Probes:</strong> ${state.probes.length} registered · <strong>Devices:</strong> ${state.devices.length} monitored</div>
        </div>
      </div>
    `;
  }

  function updateDashboardRealtimeCounters() {
    const devices = getFilteredDevices();
    const avgLatency = devices.length
      ? Math.round(devices.reduce((acc, d) => acc + (d.responseTime || 0), 0) / devices.length)
      : 0;
    // SLA only from availability the API actually returned per device;
    // with no availability history there is no SLA number to show.
    const latEl = document.getElementById('kpiAvgLatency');
    if (latEl) latEl.textContent = devices.length ? `${avgLatency} ms` : '—';
  }

  // =========================================================================
  // Widget Catalog (+ Add Widget Modal)
  // =========================================================================
  function openWidgetCatalog() {
    DOM.widgetCatalogList.innerHTML = `
      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckDonut" ${state.widgetsVisibility.alarmsDonut ? 'checked' : ''}>
          <span>🚨 Alarms by Severity Donut</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">SVG radial ring breakdown of active alarms</p>
      </div>

      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckSla" ${state.widgetsVisibility.slaMeter ? 'checked' : ''}>
          <span>🏆 Network SLA Availability Meter</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Uptime percentage vs 30-day target</p>
      </div>

      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckTools" ${state.widgetsVisibility.quickTools ? 'checked' : ''}>
          <span>⚡ Quick Diagnostic Tools Launcher</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">1-click Ping, Trace, MIB Browser, Terminal</p>
      </div>

      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckCpu" ${state.widgetsVisibility.topCpu ? 'checked' : ''}>
          <span>🔥 Top 5 CPU Utilization</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Live CPU utilization progress bars</p>
      </div>

      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckMem" ${state.widgetsVisibility.topMem ? 'checked' : ''}>
          <span>💾 Top 5 Memory Utilization</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Live Memory utilization progress bars</p>
      </div>

      <div class="me-card" style="padding: 10px; margin-bottom: 0;">
        <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;">
          <input type="checkbox" id="wCheckAlarms" ${state.widgetsVisibility.recentAlarms ? 'checked' : ''}>
          <span>📋 Recent Alarms Central Feed</span>
        </label>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Unified stream of active alarms</p>
      </div>
    `;

    DOM.widgetCatalogModal.classList.add('active');

    const updateCheck = (id, prop) => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        state.widgetsVisibility[prop] = e.target.checked;
        renderDashboardView();
      });
    };

    updateCheck('wCheckDonut', 'alarmsDonut');
    updateCheck('wCheckSla', 'slaMeter');
    updateCheck('wCheckTools', 'quickTools');
    updateCheck('wCheckCpu', 'topCpu');
    updateCheck('wCheckMem', 'topMem');
    updateCheck('wCheckAlarms', 'recentAlarms');
  }

  // =========================================================================
  // VIEW: INVENTORY
  // =========================================================================
  function renderInventoryView() {
    if (state.currentSubTab === 'Flow Analysis (NetFlow)') {
      renderFlowAnalysisView();
      return;
    }
    if (state.currentSubTab === 'IP & Switch Ports') {
      renderIpManagementView();
      return;
    }
    if (state.currentSubTab === 'Host Agents') {
      renderHostAgentsInventory();
      return;
    }
    if (state.currentSubTab === 'Interfaces (IF-MIB)') {
      renderInterfacesInventory();
      return;
    }

    const devices = getFilteredDevices();

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🖥️ Managed Infrastructure Devices (${devices.length} Found)</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-secondary" onclick="window.OpManager.exportInventoryCSV()">📥 Export CSV</button>
            <button class="btn-me-primary" onclick="document.getElementById('addDeviceModal').classList.add('active')">+ Add Device</button>
          </div>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Device Name</th>
                <th>IP Address</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Remote Probe</th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${devices.length === 0 ? `
                <tr><td colspan="10" style="text-align:center; padding: 24px; color: var(--text-muted);">No devices match the active filter criteria.</td></tr>
              ` : devices.map(dev => {
                const probe = state.probes.find(p => p.id === dev.probeId) || { displayName: 'Central' };
                const badgeStatus = (dev.status || '').toLowerCase();
                return `
                  <tr style="cursor: pointer;">
                    <td><span class="badge-me ${badgeStatus}">${displayVal(dev.status)}</span></td>
                    <td onclick="window.OpManager.inspectDevice('${dev.id}')">
                      <img src="${getDeviceIcon(dev.category, dev.vendor)}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;" alt="${dev.category}">
                      <strong>${dev.name}</strong>
                    </td>
                    <td><code>${dev.ip}</code></td>
                    <td>${dev.category}</td>
                    <td>${displayVal(dev.vendor)}</td>
                    <td>📍 ${probe.displayName}</td>
                    <td style="min-width: 90px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px;">
                        <span>${dev.cpu ?? '—'}%</span>
                      </div>
                      <div class="progress-me-bg">
                        <div class="progress-me-bar ${getProgressBarClass(dev.cpu)}" style="width: ${Number(dev.cpu) || 0}%;"></div>
                      </div>
                    </td>
                    <td style="min-width: 90px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px;">
                        <span>${dev.memory ?? '—'}%</span>
                      </div>
                      <div class="progress-me-bg">
                        <div class="progress-me-bar ${getProgressBarClass(dev.memory)}" style="width: ${Number(dev.memory) || 0}%;"></div>
                      </div>
                    </td>
                    <td>${dev.responseTime != null ? dev.responseTime + ' ms' : '—'}</td>
                    <td>
                      <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.inspectDevice('${dev.id}')">🔍 Snapshot</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================

  // =========================================================================
  // VIEW: ALARMS (With Multi-Select Batch Actions, SNMP Traps & Syslogs)
  // =========================================================================
  function renderAlarmsView() {
    if (state.currentSubTab === 'SNMP Trap Viewer') {
      renderTrapsView();
      return;
    }
    if (state.currentSubTab === 'Syslog Console') {
      renderSyslogView();
      return;
    }
    if (state.currentSubTab === 'Root Cause Analysis (RCA)') {
      renderRcaView();
      return;
    }

    const alarms = getFilteredAlarms();

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🚨 Active Enterprise Network Alarms (${alarms.length})</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-secondary" onclick="window.OpManager.batchAcknowledge()">✓ Acknowledge</button>
            <button class="btn-me-secondary" onclick="window.OpManager.batchClear()">✕ Clear</button>
            <button class="btn-me-secondary" onclick="window.OpManager.exportAlarmsCSV()">📥 Export CSV</button>
          </div>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th style="width: 30px;"><input type="checkbox" id="chkSelectAllAlarms"></th>
                <th>Severity</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Remote Probe</th>
                <th>Alarm Message</th>
                <th>Source Monitor</th>
                <th>Time Occurred</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${alarms.length === 0 ? `
                <tr><td colspan="10" style="text-align:center; padding: 24px; color: var(--severity-clear); font-weight: 600;">✅ All systems normal. No active alarms for current probe filter.</td></tr>
              ` : alarms.map(alarm => {
                const probe = state.probes.find(p => p.id === alarm.probeId) || { displayName: 'Central' };
                const sevClass = alarm.severity.toLowerCase();
                const isChecked = state.selectedAlarmIds.has(alarm.id);
                return `
                  <tr>
                    <td><input type="checkbox" class="chkAlarmItem" data-id="${alarm.id}" ${isChecked ? 'checked' : ''}></td>
                    <td><span class="badge-me ${sevClass}">${alarm.severity}</span></td>
                    <td><strong>${alarm.deviceName}</strong></td>
                    <td><code>${alarm.ip}</code></td>
                    <td>📍 ${probe.displayName}</td>
                    <td>${alarm.message}</td>
                    <td><code>${displayVal(alarm.source)}</code></td>
                    <td>${fmtTime(alarm.timestamp || alarm.created_at)}</td>
                    <td><strong>${alarm.status}</strong></td>
                    <td>
                      ${alarm.status === 'Active' ? `
                        <button class="btn-me-secondary" style="padding: 2px 7px; font-size: 11px;" onclick="window.OpManager.acknowledgeAlarm('${alarm.id}')">✓ Ack</button>
                      ` : ''}
                      <button class="btn-me-secondary" style="padding: 2px 7px; font-size: 11px;" onclick="window.OpManager.clearAlarm('${alarm.id}')">✕ Clear</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('chkSelectAllAlarms')?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      const boxes = document.querySelectorAll('.chkAlarmItem');
      boxes.forEach(b => {
        b.checked = checked;
        const id = b.getAttribute('data-id');
        if (checked) state.selectedAlarmIds.add(id);
        else state.selectedAlarmIds.delete(id);
      });
    });

    document.querySelectorAll('.chkAlarmItem').forEach(b => {
      b.addEventListener('change', () => {
        const id = b.getAttribute('data-id');
        if (b.checked) state.selectedAlarmIds.add(id);
        else state.selectedAlarmIds.delete(id);
      });
    });
  }

  async function batchAcknowledge() {
    if (state.selectedAlarmIds.size === 0) {
      alert('Please select one or more alarms using the checkboxes.');
      return;
    }
    const ids = [...state.selectedAlarmIds];
    const results = await Promise.allSettled(ids.map(id =>
      apiJson('/api/json/alarms/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId: id })
      })
    ));
    let okCount = 0;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        okCount++;
        const a = state.alarms.find(x => String(x.id) === String(ids[i]));
        if (a) a.status = 'Acknowledged';
      }
    });
    state.selectedAlarmIds.clear();
    updateHeaderBadges();
    renderCurrentView();
    if (okCount < ids.length) alert(`Acknowledged ${okCount} of ${ids.length} alarms — ${ids.length - okCount} failed on the server.`);
  }

  async function batchClear() {
    if (state.selectedAlarmIds.size === 0) {
      alert('Please select one or more alarms using the checkboxes.');
      return;
    }
    const ids = [...state.selectedAlarmIds];
    const results = await Promise.allSettled(ids.map(id =>
      apiJson('/api/json/alarms/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId: id })
      })
    ));
    let okCount = 0;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        okCount++;
        state.alarms = state.alarms.filter(a => String(a.id) !== String(ids[i]));
      }
    });
    state.selectedAlarmIds.clear();
    updateHeaderBadges();
    renderCurrentView();
    if (okCount < ids.length) alert(`Cleared ${okCount} of ${ids.length} alarms — ${ids.length - okCount} failed on the server.`);
  }

  function exportAlarmsCSV() {
    const alarms = getFilteredAlarms();
    let csv = 'Severity,Device Name,IP Address,Probe,Message,Source,Timestamp,Status\n';
    alarms.forEach(a => {
      csv += `"${a.severity}","${a.deviceName}","${a.ip}","${a.probeId}","${a.message}","${a.source}","${a.timestamp}","${a.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opmanager_alarms_${Date.now()}.csv`;
    a.click();
  }

  // Authentic ManageEngine SNMP Trap Viewer
  async function renderTrapsView() {
    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="me-card-title">📡 ManageEngine Real-Time SNMP Trap Viewer</span>
            <span class="badge-me clear" style="font-size: 10px;">UDP 162 Listening</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-secondary" onclick="window.OpManager.renderTrapsView()">🔄 Refresh Traps</button>
            <button class="btn-me-secondary" disabled title="No trap-rule endpoint yet">⚙️ Trap Rules</button>
          </div>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Trap Name</th>
                <th>Trap OID</th>
                <th>Source Host</th>
                <th>Managing Probe</th>
                <th>Varbinds Summary</th>
                <th>Time Occurred</th>
              </tr>
            </thead>
            <tbody id="trapsTableBody">
              <tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Loading incoming SNMP traps...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    try {
      const res = await fetch('/api/traps/list').then(r => r.json());
      const tbody = document.getElementById('trapsTableBody');
      if (res.status === 'success' && res.traps && tbody) {
        // Real rows from /api/traps/list are the stored columns
        // { id, source_ip, oid, value, received_at }; `value` is the JSON
        // string of parsed varbinds [{ oid, value }]. The previous code
        // read fake-shape fields (trap.varbinds, trap.severity,
        // trap.trapName, trap.deviceName, trap.probeName, trap.time) that
        // this API never returns, so trap.varbinds.map threw on the first
        // real trap and the view showed "Failed to load traps".
        const TRAP_NAMES = {
          '1.3.6.1.6.3.1.1.5.1': 'coldStart',
          '1.3.6.1.6.3.1.1.5.2': 'warmStart',
          '1.3.6.1.6.3.1.1.5.3': 'linkDown',
          '1.3.6.1.6.3.1.1.5.4': 'linkUp',
          '1.3.6.1.6.3.1.1.5.5': 'authenticationFailure',
          '1.3.6.1.6.3.1.1.5.6': 'egpNeighborLoss',
        };
        const TRAP_SEVERITY = {
          '1.3.6.1.6.3.1.1.5.3': 'Critical',
          '1.3.6.1.6.3.1.1.5.5': 'Critical',
          '1.3.6.1.6.3.1.1.5.6': 'Critical',
        };
        if (res.traps.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">No traps received yet — the receiver listens on UDP 162.</td></tr>`;
        } else {
          tbody.innerHTML = res.traps.map(trap => {
            let varbinds = [];
            try { varbinds = JSON.parse(trap.value || '[]'); } catch (_) { varbinds = []; }
            const varbindsStr = Array.isArray(varbinds) && varbinds.length > 0
              ? varbinds.map(v => `${v.oid} = ${v.value}`).join(' | ')
              : (typeof trap.value === 'string' ? trap.value : '');
            const severity = TRAP_SEVERITY[trap.oid] || 'Clear';
            const trapName = TRAP_NAMES[trap.oid] || trap.oid || 'unknown';
            return `
            <tr>
              <td><span class="badge-me ${severity.toLowerCase()}">${severity}</span></td>
              <td><strong>${escapeHtml(trapName)}</strong></td>
              <td><code>${escapeHtml(trap.oid || '')}</code></td>
              <td><strong>${escapeHtml(trap.source_ip || '')}</strong></td>
              <td>📍 Central (direct)</td>
              <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; font-size: 10px; color: var(--text-muted);" title="${escapeHtml(varbindsStr)}">
                ${escapeHtml(varbindsStr)}
              </td>
              <td style="font-size: 11px; color: var(--text-muted);">${escapeHtml(trap.received_at || '')}</td>
            </tr>
          `;
          }).join('');
        }
      }
    } catch (e) {
      const tbody = document.getElementById('trapsTableBody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color: var(--severity-critical); padding: 14px;">Failed to load traps: ${e.message}</td></tr>`;
    }
  }

  // Authentic ManageEngine Syslog Console
  async function renderSyslogView() {
    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="me-card-title">📜 ManageEngine Syslog Event Console</span>
            <span class="badge-me clear" style="font-size: 10px;">UDP 514 Listening</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-secondary" onclick="window.OpManager.renderSyslogView()">🔄 Refresh Logs</button>
            <button class="btn-me-secondary" disabled title="No syslog-rule endpoint yet">⚙️ Alert Rules</button>
          </div>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Host Device</th>
                <th>IP Address</th>
                <th>Probe</th>
                <th>Facility</th>
                <th>Severity</th>
                <th>Syslog Message Content</th>
              </tr>
            </thead>
            <tbody id="syslogTableBody">
              <tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Loading incoming syslog events...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    try {
      const res = await fetch('/api/syslog/list').then(r => r.json());
      const tbody = document.getElementById('syslogTableBody');
      if (res.status === 'success' && res.messages && tbody) {
        // Real rows from /api/syslog/list are the stored columns
        // { id, source_ip, oid, value, received_at }; `value` is the
        // message text. The previous code read fake-shape fields
        // (log.time, log.host, log.ip, log.probe, log.facility,
        // log.severity, log.message) that this API never returns, so
        // every cell rendered "undefined". Facility/severity are not
        // stored by the receiver (see server/routes/traps.js), so they
        // honestly render as '—' rather than invented values.
        if (res.messages.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">No syslog messages received yet — the receiver listens on UDP 514.</td></tr>`;
        } else {
          tbody.innerHTML = res.messages.map(log => {
            return `
            <tr>
              <td style="font-family: monospace; font-size: 11px;">${escapeHtml(log.received_at || '')}</td>
              <td><strong>${escapeHtml(log.source_ip || '')}</strong></td>
              <td><code>${escapeHtml(log.source_ip || '')}</code></td>
              <td>📍 Central (direct)</td>
              <td><span style="font-size: 10px; font-weight: 700; color: #a855f7;">—</span></td>
              <td><span class="badge-me clear">—</span></td>
              <td style="font-family: monospace; font-size: 11px; color: #f8fafc;">${escapeHtml(log.value || '')}</td>
            </tr>
          `;
          }).join('');
        }
      }
    } catch (e) {
      const tbody = document.getElementById('syslogTableBody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color: var(--severity-critical); padding: 14px;">Failed to load syslogs: ${e.message}</td></tr>`;
    }
  }

  // =========================================================================
  // VIEW: MAPS & TOPOLOGY (Interactive HTML5 Canvas, 3D Rack View, Business Views)
  // =========================================================================
  function renderTopologyView() {
    if (state.currentSubTab === '3D Datacenter Rack View') {
      renderRackView();
      return;
    }
    if (state.currentSubTab === 'Business Views') {
      renderBusinessViews();
      return;
    }

    DOM.workspace.innerHTML = `
      <div class="me-card" style="margin-bottom: 0; display: flex; flex-direction: column; height: calc(100vh - 150px);">
        <div class="me-card-header">
          <span class="me-card-title">🗺️ Enterprise Multi-Probe Topology & Live Mesh</span>
          <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 14px; align-items: center;">
            <span><span style="color: #38bdf8;">■</span> Central Server</span>
            <span><span style="color: #22c55e;">●</span> Distributed Probes</span>
            <span><span style="color: #94a3b8;">▲</span> Edge Routers / Devices</span>
            <button class="btn-me-secondary" style="padding: 2px 8px;" onclick="window.OpManager.resetTopology()">Center Map</button>
          </div>
        </div>
        <div style="flex: 1; position: relative; background: var(--bg-card); overflow: hidden;">
          <canvas id="topologyCanvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>
      </div>
    `;

    setTimeout(renderTopologyCanvas, 50);
  }

  // ManageEngine 3D Datacenter Rack Visualizer
  async function renderRackView() {
    DOM.workspace.innerHTML = `
      <div class="me-card" style="margin-bottom: 0;">
        <div class="me-card-header">
          <span class="me-card-title">🖥️ 3D Datacenter Rack Visualizer (42U Standard)</span>
        </div>
        <div class="me-card-body" style="padding: 16px;">
          <div id="rackViewContainer" class="rack-visualizer-wrap">
            <div style="text-align: center; width: 100%; color: var(--text-muted); padding: 40px;">Loading racks…</div>
          </div>
        </div>
      </div>
    `;
    try {
      const res = await apiJson('/api/racks/list');
      const racks = res.racks || [];
      if (!racks.length) {
        document.getElementById('rackViewContainer').innerHTML = emptyStateHtml('No 3D Datacenter Racks Configured', 'Create 3D datacenter racks and mount servers, switches, and UPS units to visualize rack space, thermal capacity, and front/rear port connectivity.');
        return;
      }
      const sel = document.createElement('select');
      sel.id = 'rackSelector';
      sel.className = 'form-input-me';
      sel.style.cssText = 'width: 260px; padding: 3px 8px; font-size: 11px;';
      racks.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name || r.id} (${r.units || 42}U${r.datacenter ? ' • ' + r.datacenter : ''})`;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', (e) => loadRackData(e.target.value));
      document.querySelector('#rackViewContainer')?.closest('.me-card')?.querySelector('.me-card-header')?.appendChild(sel);
      loadRackData(racks[0].id);
    } catch (e) {
      const c = document.getElementById('rackViewContainer');
      if (c) c.innerHTML = `<div style="color: var(--severity-critical);">Failed to load racks: ${escapeHtml(e.message)}</div>`;
    }
  }

  async function loadRackData(rackId) {
    try {
      const res = await apiJson('/api/racks/list');
      const racks = res.racks || [];
      const rack = racks.find(r => String(r.id) === String(rackId)) || racks[0];
      if (!rack) {
        const c = document.getElementById('rackViewContainer');
        if (c) c.innerHTML = emptyStateHtml('No 3D Datacenter Racks Configured', 'Create a rack to see its layout here.');
        return;
      }
      renderRackCabinet(rack);
    } catch (e) {
      const c = document.getElementById('rackViewContainer');
      if (c) c.innerHTML = `<div style="color: var(--severity-critical);">Failed to load rack: ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderRackCabinet(rack) {
    const container = document.getElementById('rackViewContainer');
    if (!container) return;

    const slotMap = {};
    (rack.units || []).forEach(u => {
      for (let i = 0; i < u.heightU; i++) {
        slotMap[u.startU + i] = { unit: u, isPrimary: i === 0, offset: i };
      }
    });

    let unitsHtml = '';
    for (let u = 42; u >= 1; u--) {
      const slot = slotMap[u];
      if (slot) {
        if (slot.isPrimary) {
          const item = slot.unit;
          const statusClass = item.status === 'Clear' ? 'clear' : item.status === 'Trouble' ? 'trouble' : 'critical';
          const heightPx = item.heightU * 26;
          unitsHtml += `
            <div class="rack-u-row" style="height: ${heightPx}px; background: #0b1329; border: 1px solid #1e293b;" onclick="window.OpManager.inspectDevice('${item.deviceId}')">
              <div class="rack-u-label" style="height: 100%; display: flex; flex-direction: column; justify-content: center;">
                <span>U${item.startU + item.heightU - 1}</span>
                ${item.heightU > 1 ? `<span style="font-size: 8px; color: #64748b;">|</span><span>U${item.startU}</span>` : ''}
              </div>
              <div class="rack-device-faceplate">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="rack-led ${statusClass}" title="Status: ${item.status}"></span>
                  <img src="${item.image}" class="rack-faceplate-img" alt="${item.deviceName}" onerror="this.src='/images/racks/front/DellServer_1U.png'">
                  <div>
                    <div style="font-weight: 800; font-size: 11px; color: #f8fafc;">${item.deviceName}</div>
                    <div style="font-size: 9px; color: #94a3b8;">${item.type}</div>
                  </div>
                </div>
                <div style="text-align: right; font-size: 10px; font-family: monospace;">
                  <span style="color: #38bdf8; margin-right: 8px;">🌡️ ${item.temp}</span>
                  <span style="color: #4ade80;">⚡ ${item.power}</span>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        unitsHtml += `
          <div class="rack-u-row" style="opacity: 0.6;">
            <div class="rack-u-label">U${u}</div>
            <div style="flex: 1; padding: 0 10px; font-size: 9px; color: #475569; font-style: italic;">
              Empty Slot (${u}U)
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="rack-cabinet-frame">
        <div class="rack-cabinet-header">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>🏢</span>
            <span>${rack.name}</span>
          </div>
          <span class="badge-me clear" style="font-size: 9px;">42U Enclosure</span>
        </div>
        <div class="rack-units-scroll">
          ${unitsHtml}
        </div>
      </div>

      <div class="rack-sidebar-info">
        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">📊 Rack Environment & Capacity Telemetry</span>
          </div>
          <div class="me-card-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div style="background: var(--bg-subnav); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Thermal Ambient</div>
                <div style="font-size: 22px; font-weight: 800; color: #22c55e; margin-top: 4px;">${rack.temperature}</div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">ASHRAE TC 9.9 Recommended</div>
              </div>

              <div style="background: var(--bg-subnav); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Active Power Draw</div>
                <div style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${rack.powerDraw}</div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Dual PDU Feed A+B Normal</div>
              </div>
            </div>

            <div style="font-size: 11px; line-height: 1.8; color: var(--text-main);">
              <div><strong>Facility:</strong> ${rack.datacenter}</div>
              <div><strong>Managing Probe:</strong> 📍 ${rack.probeName}</div>
              <div><strong>Space Utilization:</strong> ${(rack.units || []).length} of 42 Units Occupied (${(((rack.units || []).length / 42) * 100).toFixed(1)}%)</div>
              ${rack.cooling ? `<div><strong>Redundant Cooling:</strong> ${escapeHtml(String(rack.cooling))}</div>` : ''}
            </div>

            <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <div style="font-weight: 700; font-size: 11px; margin-bottom: 6px;">Mounted Devices in Rack (${(rack.units || []).length}):</div>
              <div style="display: flex; flex-direction: column; gap: 4px; max-height: 160px; overflow-y: auto;">
                ${(rack.units || []).map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: var(--bg-subnav); border-radius: 4px; font-size: 10px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${item.deviceId}')">
                    <span><strong>U${item.startU}:</strong> ${item.deviceName} (${item.category})</span>
                    <span class="badge-me ${item.status.toLowerCase()}">${item.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================

  // ManageEngine Business Views (Custom Topology Canvas)
  function renderBusinessViews() {
    const devices = getFilteredDevices();
    if (!devices.length) {
      DOM.workspace.innerHTML = `
        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">🗺️ ManageEngine Business Views (Custom Network Topology)</span>
          </div>
        </div>
        ${emptyStateHtml('No business views configured yet', 'Create a business view to group devices into the services they support. Add a device or run discovery first.')}
      `;
      return;
    }
    DOM.workspace.innerHTML = `
      <div class="me-card" style="margin-bottom: 0;">
        <div class="me-card-header">
          <span class="me-card-title">🗺️ ManageEngine Business Views (Custom Network Topology)</span>
          <span style="font-size: 11px; color: var(--text-muted);">${devices.length} device${devices.length === 1 ? '' : 's'} from live inventory</span>
        </div>
        <div class="me-card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
            ${devices.map(dev => `
              <div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${dev.id}')">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="${getDeviceIcon(dev.category, dev.vendor)}" style="width: 32px; height: 32px;" alt="${escapeHtml(String(dev.category || ''))}">
                  <div>
                    <div style="font-weight: 800; font-size: 12px;">${escapeHtml(String(dev.name || dev.hostname || '—'))}</div>
                    <div style="font-size: 10px; color: var(--text-muted);"><code>${escapeHtml(String(dev.ip || ''))}</code></div>
                  </div>
                </div>
                <div style="margin-top: 8px; font-size: 11px;">
                  <span class="badge-me ${(String(dev.status || '').toLowerCase() === 'clear' || String(dev.status || '').toLowerCase() === 'up') ? 'clear' : 'down'}">${escapeHtml(String(dev.status || '—'))}</span>
                  <span style="color: var(--text-muted); margin-left: 6px;">${escapeHtml(String(dev.category || '—'))} • ${escapeHtml(String(dev.vendor || '—'))}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderTopologyCanvas() {
    const canvas = document.getElementById('topologyCanvas');
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const nodes = [];

    nodes.push({
      id: 'central',
      type: 'central',
      label: 'OpManager Central (Primary)',
      sub: state.central.host ? state.central.host + ':' + (state.central.port || 8060) : '',
      x: centerX,
      y: centerY,
      radius: 28,
      color: '#0284c7'
    });

    const probeCount = state.probes.length;
    const probeOrbitRadius = Math.min(centerX, centerY) * 0.48;

    state.probes.forEach((probe, idx) => {
      const angle = (idx / probeCount) * Math.PI * 2 - Math.PI / 2;
      const px = centerX + Math.cos(angle) * probeOrbitRadius;
      const py = centerY + Math.sin(angle) * probeOrbitRadius;

      nodes.push({
        id: probe.id,
        type: 'probe',
        label: probe.displayName,
        sub: `${probe.ip}:${probe.port || 8060}`,
        x: px,
        y: py,
        radius: 20,
        color: '#16a34a',
        parentId: 'central',
        probeId: probe.id
      });

      const probeDevs = state.devices.filter(d => d.probeId === probe.id).slice(0, 4);
      const devRadius = 55;
      probeDevs.forEach((dev, dIdx) => {
        const devAngle = angle + (dIdx - 1.5) * 0.45;
        const dx = px + Math.cos(devAngle) * devRadius;
        const dy = py + Math.sin(devAngle) * devRadius;

        nodes.push({
          id: dev.id,
          type: 'device',
          label: dev.name,
          sub: dev.ip,
          x: dx,
          y: dy,
          radius: 12,
          color: dev.status === 'Down' ? '#dc2626' : (dev.cpu > 85 ? '#f59e0b' : '#64748b'),
          parentId: probe.id,
          devRef: dev
        });
      });
    });

    state.topologyNodes = nodes;

    canvas.onclick = (e) => {
      const cRect = canvas.getBoundingClientRect();
      const clickX = e.clientX - cRect.left;
      const clickY = e.clientY - cRect.top;

      const hit = nodes.find(n => {
        const dist = Math.hypot(n.x - clickX, n.y - clickY);
        return dist <= n.radius + 6;
      });

      if (hit && hit.type === 'device' && hit.devRef) {
        inspectDevice(hit.devRef.id);
      } else if (hit && hit.type === 'probe') {
        switchTab('probes');
      }
    };

    let pulseOffset = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.body.classList.contains('dark-mode');

      nodes.forEach(node => {
        if (!node.parentId) return;
        const parent = nodes.find(n => n.id === node.parentId);
        if (!parent) return;

        ctx.beginPath();
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = node.type === 'probe' ? 2 : 1;
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        if (node.type === 'probe') {
          const t = ((pulseOffset / 100) + (nodes.indexOf(node) * 0.25)) % 1;
          const pulseX = parent.x + (node.x - parent.x) * t;
          const pulseY = parent.y + (node.y - parent.y) * t;

          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
      });

      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
        ctx.font = node.type === 'central' ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);

        if (node.sub && node.type !== 'device') {
          ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
          ctx.font = '9px monospace';
          ctx.fillText(node.sub, node.x, node.y + node.radius + 25);
        }
      });

      pulseOffset = (pulseOffset + 0.8) % 100;
      state.topologyAnimId = requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // VIEW: ENTERPRISE PROBES
  // =========================================================================
  function renderProbesView() {
    const onlineProbes = state.probes.filter(p => String(p.status || '').toLowerCase() === 'online').length;
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">Federated Enterprise Probes (${state.probes.length})</span>
          <span class="badge-me clear">${onlineProbes} / ${state.probes.length} Online</span>
          <span style="font-size: 11px; color: var(--text-muted);">Sync Mode: Bidirectional REST + WebSocket Push</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.syncAllProbes()">🔄 Sync All Probes</button>
          <button class="btn-me-secondary" onclick="document.getElementById('addProbeModal').classList.add('active')">+ Register Probe</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
        ${state.probes.map(p => `
          <div class="me-card">
            <div class="me-card-header">
              <span class="me-card-title">📡 ${p.displayName}</span>
              <span class="badge-me ${String(p.status || '').toLowerCase() === 'online' ? 'clear' : 'down'}">${displayVal(p.status)}</span>
            </div>
            <div class="me-card-body">
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Probe ID:</strong> <code>${p.name}</code>
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Location:</strong> 📍 ${displayVal(p.location)}
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Endpoint:</strong> <code>http://${p.ip}${p.port ? ':' + p.port : ''}</code>
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Mutual Auth Key:</strong> ${p.eeAuthKey ? 'Key on file (not shown)' : 'No key on file'}
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 11px;">
                <span>Monitored: <strong>${displayVal(p.devicesCount ?? p.deviceCount)} devices</strong></span>
                <span>Latency: <strong>${p.syncLatency != null ? p.syncLatency + ' ms' : (p.latency != null ? p.latency + ' ms' : '—')}</strong></span>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="btn-me-primary" style="flex: 1; justify-content: center;" onclick="window.OpManager.syncProbe('${p.id}')">🔄 Sync from Probe</button>
                <button class="btn-me-secondary" onclick="window.OpManager.testProbeConnection('${p.id}')">⚡ Test Link</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🛡️ Central-Probe High Availability & Scaling Architecture</span>
        </div>
        <div class="me-card-body" style="font-size: 12px; line-height: 1.6;">
          <p>OpManager Central coordinates distributed remote probes deployed across geographic datacenters, VPCs, and campuses. Polling overhead is distributed locally at each probe, and unified telemetry, traps, and alarms are continuously synchronized back to the Central database via REST APIs and WebSockets.</p>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================

  // =========================================================================
  // VIEW: DISCOVERY
  // =========================================================================
  async function renderDiscoveryView() {
    let rules = [];
    let creds = [];
    try { rules = (await apiJson('/api/discovery/rules')).rules || []; } catch (e) { rules = []; }
    try { creds = (await apiJson('/api/settings/credentials')).credentials || []; } catch (e) { creds = []; }

    DOM.workspace.innerHTML = `
      <div class="me-card" style="max-width: 750px; margin: 0 auto 20px;">
        <div class="me-card-header">
          <span class="me-card-title">🔍 Unified Network Subnet & IP Range Discovery</span>
        </div>
        <div class="me-card-body">
          <form id="discoveryForm">
            <div class="form-group-me">
              <label>Select Executing Probe</label>
              <select class="form-input-me" id="discProbeSelect">
                ${state.probes.map(p => `<option value="${p.id}">${escapeHtml(String(p.displayName || p.name || '—'))} (${escapeHtml(String(p.ip || ''))})</option>`).join('')}
              </select>
            </div>
            <div class="form-group-me">
              <label>Subnet CIDR / IP Range</label>
              <input type="text" class="form-input-me" id="discSubnet" placeholder="e.g. 192.168.1.0/24 or 10.10.1.1-10.10.1.254">
            </div>
            <div class="form-group-me">
              <label>SNMP Credential Profile</label>
              <select class="form-input-me" id="discCred">
                ${creds.length ? creds.map(c => `<option value="${escapeHtml(String(c.id || c.name || ''))}">${escapeHtml(String(c.name || c.id || 'Credential'))}</option>`).join('') : '<option value="">No credentials saved yet — add one in Settings</option>'}
              </select>
            </div>
            <button type="submit" class="btn-me-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
              ⚡ Launch Enterprise Discovery Sweep
            </button>
          </form>

          <div id="discoveryResultsBox" style="margin-top: 16px; display: none;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">DISCOVERY STATUS & PROGRESS:</div>
            <div class="progress-me-bg" style="height: 10px; margin-bottom: 10px;">
              <div class="progress-me-bar green" id="discProgressBar" style="width: 0%;"></div>
            </div>
            <div id="discLog" style="background: #0f172a; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px; color: #38bdf8; max-height: 180px; overflow-y: auto;"></div>
            <div id="discResults" style="margin-top: 10px;"></div>
          </div>
        </div>
      </div>

      <div class="me-card" style="max-width: 750px; margin: 0 auto;">
        <div class="me-card-header"><span class="me-card-title">📋 Saved Discovery Rules (${rules.length})</span></div>
        <div class="me-card-body">
          ${rules.length ? rules.map(r => `
            <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 11px; margin-bottom: 6px;">
              <strong>${escapeHtml(String(r.name || '—'))}</strong> — ${escapeHtml(String(r.subnet || r.ipRange || '—'))} • ${escapeHtml(String(r.schedule || '—'))}
            </div>
          `).join('') : '<div style="font-size: 12px; color: var(--text-muted);">No Auto-Discovery Rules Configured — configure a CIDR IP range schedule to automatically discover network devices.</div>'}
        </div>
      </div>
    `;

    document.getElementById('discoveryForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      runRealDiscovery();
    });
  }

  // Discovery runs are async: POST /api/discovery/run returns 202 with
  // { runId, runStatus: 'running', startedAt } and NO device list. The
  // sweep persists its run to GET /api/discovery/history when it finishes
  // (rows: { id, range, found_count, started_at, finished_at, status } —
  // no per-run device link), and the devices it found land in the device
  // inventory. So this handler never renders anything from the POST
  // response: it polls history until this run's row is terminal, reloads
  // the device list, and renders only devices that are actually in the
  // store. The headline count is the run's real found_count from history.
  let discoveryRunSeq = 0;

  function ipToInt(ip) {
    const parts = String(ip || '').trim().split('.');
    if (parts.length !== 4) return null;
    let n = 0;
    for (const p of parts) {
      if (!/^\d+$/.test(p)) return null;
      const v = Number(p);
      if (!Number.isInteger(v) || v < 0 || v > 255) return null;
      n = n * 256 + v;
    }
    return n >>> 0;
  }

  function ipInScannedRange(ip, rangeText) {
    const n = ipToInt(ip);
    if (n === null) return false;
    const text = String(rangeText || '').trim();
    const cidr = text.match(/^(\d+\.\d+\.\d+\.\d+)\s*\/\s*(\d{1,2})$/);
    if (cidr) {
      const base = ipToInt(cidr[1]);
      const prefix = Number(cidr[2]);
      if (base === null || prefix < 0 || prefix > 32) return false;
      const hostBits = 32 - prefix;
      const mask = hostBits === 32 ? 0 : ((0xffffffff << hostBits) >>> 0);
      return (n & mask) >>> 0 === (base & mask) >>> 0;
    }
    if (text.includes('-')) {
      const [a, b] = text.split('-').map((s) => s.trim());
      const start = ipToInt(a);
      const end = ipToInt(b);
      return start !== null && end !== null && n >= start && n <= end;
    }
    const single = ipToInt(text);
    return single !== null && n === single;
  }

  async function runRealDiscovery() {
    const box = document.getElementById('discoveryResultsBox');
    const bar = document.getElementById('discProgressBar');
    const log = document.getElementById('discLog');
    const resultsEl = document.getElementById('discResults');
    const submitBtn = document.querySelector('#discoveryForm button[type="submit"]');
    const subnet = document.getElementById('discSubnet').value.trim();
    const probeId = document.getElementById('discProbeSelect').value;
    const snmpVersion = document.getElementById('discCred').value || undefined;

    if (!subnet) {
      alert('Enter a subnet CIDR or IP range to scan.');
      return;
    }

    const myRun = ++discoveryRunSeq;
    // Snapshot the inventory before the sweep so "new" means "created by
    // this run", not "already in the store from an earlier scan".
    const beforeIps = new Set((state.devices || []).map((d) => String(d.ip)));

    box.style.display = 'block';
    bar.style.width = '25%';
    log.innerHTML = `[INFO] Starting discovery sweep on ${escapeHtml(subnet)}…<br>`;
    if (resultsEl) resultsEl.innerHTML = '';
    if (submitBtn) submitBtn.disabled = true;

    const stillCurrent = () => myRun === discoveryRunSeq
      && document.getElementById('discoveryResultsBox') === box;

    try {
      const res = await apiJson('/api/discovery/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probeId, ipRange: subnet, snmpVersion })
      });
      if (!stillCurrent()) return;

      // 202: the sweep is running, nothing has been found yet. The run id
      // is DISC-<epoch-ms>; the persisted history row carries no run id,
      // so correlate on range + started_at instead.
      const runStartedAt = Number(res.startedAt)
        || Number(String(res.runId || '').replace(/^DISC-/, '')) || Date.now();
      const ipRange = res.ipRange || subnet;
      bar.style.width = '50%';
      log.innerHTML += `[INFO] Discovery running… (run ${escapeHtml(String(res.runId || ''))}) Waiting for the sweep to finish — no results yet.<br>`;
      if (resultsEl) {
        resultsEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">Discovery running… devices will appear here only once the sweep finishes and they are in the inventory.</div>';
      }

      // Poll history until this run's row reaches a terminal status.
      const POLL_MS = 2000;
      const MAX_WAIT_MS = 180000;
      const deadline = Date.now() + MAX_WAIT_MS;
      let runRow = null;
      while (Date.now() < deadline) {
        if (!stillCurrent()) return;
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (!stillCurrent()) return;
        let rows = [];
        try {
          const hist = await apiJson('/api/discovery/history');
          rows = hist.history || hist.runs || [];
        } catch (e) {
          // Transient history read failure: keep waiting until the deadline
          // rather than reporting a failure the sweep did not have.
          continue;
        }
        const matches = rows.filter((r) => String(r.range) === String(ipRange)
          && Number(r.started_at) >= runStartedAt - 1000
          && (r.status === 'completed' || r.status === 'failed'));
        if (matches.length) {
          matches.sort((a, b) => Number(b.started_at) - Number(a.started_at));
          runRow = matches[0];
          break;
        }
      }

      if (!runRow) {
        bar.style.width = '100%';
        log.innerHTML += '[WARN] Discovery is still running after 3 minutes — the sweep has not finished yet. Check the discovery history later; no devices are shown because none have been confirmed.<br>';
        if (resultsEl) resultsEl.innerHTML = emptyStateHtml('Discovery still running', 'The sweep has not finished yet — no devices have been confirmed. Check back or look at the discovery history.');
        return;
      }

      bar.style.width = '100%';
      if (runRow.status === 'failed') {
        log.innerHTML += `[ERROR] Discovery run failed for ${escapeHtml(String(ipRange))}.<br>`;
        if (resultsEl) resultsEl.innerHTML = emptyStateHtml('Discovery run failed', 'The sweep ended in failure — no devices were confirmed. Check the discovery history and try again.');
        await fetchInitialData();
        renderNavigation();
        return;
      }

      // Completed: reload the inventory and render only devices that are
      // actually in the store. History carries no per-run device link, so
      // the list is the devices this run added (new IPs) — or, when the
      // sweep re-found devices already in the inventory, the in-range
      // devices now in the store. The count is the run's real found_count.
      await fetchInitialData();
      if (!stillCurrent()) return;
      const foundCount = Number(runRow.found_count) || 0;
      const inStore = state.devices || [];
      const newlyAdded = inStore.filter((d) => !beforeIps.has(String(d.ip)));
      let found = newlyAdded;
      if (!found.length && foundCount > 0) {
        found = inStore.filter((d) => ipInScannedRange(d.ip, ipRange));
      }
      log.innerHTML += `[DONE] ${escapeHtml(res.message || 'Discovery sweep finished.')} Found ${foundCount} device(s) in ${escapeHtml(String(ipRange))}.<br>`;
      if (!foundCount || !found.length) {
        if (resultsEl) resultsEl.innerHTML = emptyStateHtml('No devices found in this range yet', 'Check the range and credentials, then scan again.');
      } else {
        if (resultsEl) resultsEl.innerHTML = `
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 6px;">Discovered (${foundCount}):</div>
          <div class="me-table-wrap"><table class="me-table">
            <thead><tr><th>Device</th><th>IP Address</th><th>Category</th></tr></thead>
            <tbody>
              ${found.map(d => `
                <tr>
                  <td><strong>${escapeHtml(String(d.name || d.hostname || '—'))}</strong></td>
                  <td><code>${escapeHtml(String(d.ip || '—'))}</code></td>
                  <td>${escapeHtml(String(d.category || '—'))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table></div>
        `;
      }
      renderNavigation();
    } catch (e) {
      if (!stillCurrent()) return;
      bar.style.width = '100%';
      log.innerHTML += `[ERROR] Discovery failed: ${escapeHtml(e.message)}<br>`;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }


  async function renderCCMView() {
    if (state.currentSubTab === 'Compliance Audit') {
      renderComplianceAuditView();
      return;
    }
    if (state.currentSubTab === 'Config Diff Inspector') {
      const first = state.devices[0];
      if (!first) {
        DOM.workspace.innerHTML = emptyStateHtml('No configuration to compare yet', 'Add a device and take a baseline backup first — the diff appears once running and startup configs both exist.');
        return;
      }
      openConfigDiff(first.id);
      return;
    }

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">⚙️ Enterprise Network Configuration Management (CCM / NCM)</span>
          <button class="btn-me-primary" onclick="window.OpManager.pushBaselineToProbes()">Push Central Baseline to Probes</button>
        </div>
        <div class="me-card-body" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading configuration backups…</div>
      </div>
    `;

    let configs = [];
    try {
      const res = await apiJson('/api/ccm/configs');
      configs = res.configs || res.rows || [];
    } catch (e) {
      DOM.workspace.innerHTML = `<div class="me-card" style="padding: 30px 14px; text-align: center; color: var(--severity-critical);">Couldn't load configuration backups — ${escapeHtml(e.message)}</div>`;
      return;
    }

    if (!configs.length) {
      DOM.workspace.innerHTML = `
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">⚙️ Enterprise Network Configuration Management (CCM / NCM)</span>
            <button class="btn-me-primary" onclick="window.OpManager.pushBaselineToProbes()">Push Central Baseline to Probes</button>
          </div>
        </div>
        ${emptyStateHtml('No configuration backups yet', 'Backups run automatically once devices are enrolled in NCM. Add a device, then back it up here.')}
      `;
      return;
    }

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">⚙️ Enterprise Network Configuration Management (CCM / NCM)</span>
          <button class="btn-me-primary" onclick="window.OpManager.pushBaselineToProbes()">Push Central Baseline to Probes</button>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>IP Address</th>
                <th>Probe</th>
                <th>Last Backup</th>
                <th>Config Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${configs.map(cfg => {
                const dev = state.devices.find(d => String(d.id) === String(cfg.device_id || cfg.deviceId)) || {};
                return `
                  <tr>
                    <td><strong>${escapeHtml(String(cfg.deviceName || cfg.device_name || dev.name || dev.hostname || '—'))}</strong></td>
                    <td><code>${escapeHtml(String(cfg.ip || dev.ip || '—'))}</code></td>
                    <td>📍 ${escapeHtml(String(probeDisplayName(dev)))}</td>
                    <td>${fmtTime(cfg.fetched_at || cfg.fetchedAt || cfg.lastBackup || null)}</td>
                    <td>${escapeHtml(String(cfg.config_type || cfg.configType || cfg.type || '—'))}</td>
                    <td>${cfg.status ? escapeHtml(String(cfg.status)) : '—'}</td>
                    <td>${cfg.device_id || cfg.deviceId ? `<button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.openConfigDiff('${cfg.device_id || cfg.deviceId}')">View Diff</button>` : '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function openConfigDiff(deviceId) {
    if (!deviceId) {
      alert('Select a device first — there is no configuration to compare yet.');
      return;
    }
    DOM.configDiffModal.classList.add('active');
    DOM.diffRunningText.textContent = 'Loading running-config…';
    DOM.diffStartupText.textContent = 'Loading startup-config…';

    try {
      const res = await apiJson(`/api/ccm/diff?deviceId=${encodeURIComponent(deviceId)}`);
      const devName = res.deviceName || res.ip || ('Device ' + deviceId);
      const added = res.addedLinesCount;
      const removed = res.removedLinesCount;
      const hasDrift = res.drift === true || res.hasDrift === true;
      DOM.diffDevName.textContent = `${devName} (${res.ip || '—'})`;
      if (res.reason) {
        DOM.diffMeta.innerHTML = `<span class="badge-me attention">No diff available</span> • ${escapeHtml(String(res.reason))}`;
        DOM.diffRunningText.textContent = 'No running config on file for this device.';
        DOM.diffStartupText.textContent = 'No startup config on file for this device.';
        DOM.diffRunningVer.textContent = '—';
        DOM.diffStartupVer.textContent = '—';
        return;
      }
      DOM.diffMeta.innerHTML = `<span class="badge-me ${hasDrift ? 'trouble' : 'clear'}">${hasDrift ? 'Diff Detected' : 'In Sync'}</span> • <strong>${added != null ? added : '—'} Added Lines</strong>, <strong>${removed != null ? removed : '—'} Removed Lines</strong> • Last Backup: ${fmtTime(res.lastBackupTime)}`;
      DOM.diffRunningVer.textContent = res.runningVersion || '—';
      DOM.diffStartupVer.textContent = res.startupVersion || '—';

      DOM.diffRunningText.innerHTML = (res.runningConfig || []).map(line => `
        <div class="diff-line ${line.type}">
          <span style="color: #64748b; margin-right: 6px; user-select: none;">${String(line.line).padStart(2, ' ')}</span>
          <span>${line.type === 'added' ? '+ ' : '  '}${escapeHtml(line.text)}</span>
        </div>
      `).join('') || 'No running config lines returned.';

      DOM.diffStartupText.innerHTML = (res.startupConfig || []).map(line => `
        <div class="diff-line ${line.type}">
          <span style="color: #64748b; margin-right: 6px; user-select: none;">${String(line.line).padStart(2, ' ')}</span>
          <span>${line.type === 'removed' ? '- ' : '  '}${escapeHtml(line.text)}</span>
        </div>
      `).join('') || 'No startup config lines returned.';

      DOM.btnResolveDrift.onclick = async () => {
        DOM.btnResolveDrift.disabled = true;
        DOM.btnResolveDrift.textContent = 'Resolving drift…';
        try {
          const r = await apiJson('/api/ccm/resolve-drift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId })
          });
          alert(r.message || 'Config drift resolved.');
          DOM.configDiffModal.classList.remove('active');
          renderCurrentView();
        } catch (e) {
          alert('Could not resolve drift: ' + e.message);
        } finally {
          DOM.btnResolveDrift.disabled = false;
          DOM.btnResolveDrift.textContent = '✓ Synchronized';
        }
      };
    } catch (e) {
      DOM.diffRunningText.textContent = 'Diff error: ' + e.message;
      DOM.diffStartupText.textContent = '';
    }
  }

  async function renderReportsView() {
    const devices = getFilteredDevices();
    const slaAvg = availabilityStats(devices);
    const localLatency = devices.length
      ? Math.round(devices.reduce((acc, d) => acc + (d.responseTime || 0), 0) / devices.length)
      : null;

    let summary = null;
    try {
      summary = await apiJson('/api/reports/summary');
    } catch (e) {
      summary = null;
    }
    const metrics = (summary && summary.metrics) || {};
    const avgLatency = (typeof metrics.avgResponseTime === 'number') ? metrics.avgResponseTime : localLatency;

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">📈 Executive Network Health & SLA Availability Summary</span>
          <div style="display: flex; gap: 8px;">
            <a href="/api/reports/print-preview" target="_blank" class="btn-me-primary" style="text-decoration: none; display: flex; align-items: center; gap: 6px;">
              🖨️ Print / Save PDF
            </a>
            <button class="btn-me-secondary" onclick="window.location.href='/api/reports/export/csv?type=devices'" ${devices.length ? '' : 'disabled title="Nothing to export yet"'}>📥 Export Inventory CSV</button>
            <button class="btn-me-secondary" onclick="window.location.href='/api/reports/export/csv?type=alarms'" ${getFilteredAlarms().length ? '' : 'disabled title="Nothing to export yet"'}>📥 Export Alarms CSV</button>
          </div>
        </div>
        <div class="me-card-body">
          ${!devices.length ? emptyStateHtml('No report data available', 'Add devices first — the executive report is generated from live SLA and performance data.') : `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
            <div class="me-kpi-tile">
              <div class="kpi-tile-icon" style="background: rgba(34, 197, 94, 0.15); color: #16a34a;">🏆</div>
              <div>
                <div class="kpi-tile-num">${slaAvg !== null ? slaAvg.toFixed(2) + ' %' : '—'}</div>
                <div class="kpi-tile-txt">Network Availability (30d SLA)${slaAvg === null ? ' — no availability history yet' : ''}</div>
              </div>
            </div>
            <div class="me-kpi-tile">
              <div class="kpi-tile-icon" style="background: rgba(14, 165, 233, 0.15); color: #0284c7;">⏱️</div>
              <div>
                <div class="kpi-tile-num">${avgLatency != null ? avgLatency + ' ms' : '—'}</div>
                <div class="kpi-tile-txt">Global Multi-Probe Latency</div>
              </div>
            </div>
            <div class="me-kpi-tile">
              <div class="kpi-tile-icon" style="background: rgba(168, 85, 247, 0.15); color: #9333ea;">⚡</div>
              <div>
                <div class="kpi-tile-num">${devices.length} Nodes</div>
                <div class="kpi-tile-txt">Monitored Multi-Probe Assets</div>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
            <div style="font-weight: 700; margin-bottom: 8px;">Probe Availability Breakdown:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${state.probes.map(p => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 2px;">
                    <span>📍 ${escapeHtml(String(p.displayName || p.name || '—'))}</span>
                    <span>Latency: <strong>${p.syncLatency != null ? p.syncLatency + ' ms' : (p.latency != null ? p.latency + ' ms' : '—')}</strong> • SLA: <strong>—</strong> (no availability history yet)</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          `}
        </div>
      </div>
    `;
  }

  async function renderSettingsView() {
    if (state.currentSubTab === 'Workflow Automation') {
      renderWorkflowView();
      return;
    }
    if (state.currentSubTab === 'Probe Mutual Auth') {
      renderProbeMutualAuthView();
      return;
    }
    if (state.currentSubTab === 'Central System Info') {
      renderCentralSystemInfoView();
      return;
    }

    const c = state.central || {};
    let credentials = [];
    try {
      const res = await apiJson('/api/settings/credentials');
      credentials = res.credentials || res.rows || [];
    } catch (e) {
      credentials = [];
    }

    DOM.workspace.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🔧 Central Server Parameters</span>
          </div>
          <div class="me-card-body" style="font-size: 12px; line-height: 1.8;">
            <div><strong>Product:</strong> ManageEngine OpManager Central</div>
            <div><strong>Version:</strong> ${escapeHtml(String(c.version || '—'))} (GA 64-bit Enterprise)</div>
            <div><strong>Host Binding:</strong> <code>${escapeHtml(String(c.host || '—'))}:${escapeHtml(String(c.port || '—'))}</code></div>
            <div><strong>High Availability:</strong> ${escapeHtml(String(c.haStatus || '—'))}</div>
            <div><strong>Database Engine:</strong> ${escapeHtml(String(c.dbType || c.database || '—'))}</div>
          </div>
        </div>

        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🔑 SNMP / WMI Credential Library</span>
          </div>
          <div class="me-card-body">
            ${credentials.length ? `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${credentials.map(cr => `
                  <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 11px;">
                    <div style="font-weight: 700;">${escapeHtml(String(cr.name || cr.id || 'Credential'))}</div>
                    <div style="color: var(--text-muted);">Protocol: ${escapeHtml(String(cr.protocol || cr.type || '—'))}${cr.details ? ' • ' + escapeHtml(String(cr.details)) : ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : emptyStateHtml('No credentials saved yet', 'Add an SNMP, WMI, SSH, or Telnet credential — devices use these to poll.')}
          </div>
        </div>
      </div>
    `;
  }

  async function renderWorkflowView() {
    try {
      const res = await fetch('/api/workflows/list').then(r => r.json());
      const workflows = res.workflows || [];

      DOM.workspace.innerHTML = `
        <div class="me-card">
          <div class="me-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="me-card-title">⚡ ManageEngine ITOM Workflow Automation Studio</span>
              <span class="badge-me clear" style="font-size: 10px;">${workflows.length} Active Automation Rules</span>
            </div>
            <button class="btn-me-primary" disabled title="Workflow creation is not available yet">+ New Workflow</button>
          </div>
          <div class="me-card-body">
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">
              Automate multi-step remediation actions across probes when alarms trigger (Service restart, CLI script execution, configuration backup, SNMP trap handling).
            </p>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${workflows.map(wf => `
                <div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                      <div style="font-weight: 800; font-size: 13px; color: var(--text-main);">${wf.name}</div>
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                        Scope: <strong>${wf.scope}</strong> • Executed: <strong>${wf.executionCount} times</strong> • Last: ${wf.lastExecuted}
                      </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <span class="badge-me clear">Active</span>
                      <button class="btn-me-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="window.OpManager.executeWorkflow('${wf.id}')">⚡ Test Run</button>
                    </div>
                  </div>

                  <div style="font-size: 11px; margin-bottom: 10px; padding: 6px 10px; background: rgba(0,115,230,0.08); border-left: 3px solid var(--primary); border-radius: 2px;">
                    <strong>Trigger Condition:</strong> <code>${wf.trigger}</code>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; flex-wrap: wrap;">
                    ${wf.steps.map((st, i) => `
                      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; display: flex; align-items: center; gap: 6px;">
                        <span style="background: var(--primary); color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800;">${st.order}</span>
                        <span>${st.action}</span>
                      </div>
                      ${i < wf.steps.length - 1 ? '<span style="color: var(--text-muted);">➔</span>' : ''}
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Execution Live Terminal -->
            <div id="workflowLogBox" style="margin-top: 20px; display: none;">
              <div style="font-weight: 700; font-size: 12px; margin-bottom: 6px;">Live Execution Output:</div>
              <pre id="workflowLogText" style="background: #090d16; border: 1px solid #1e293b; color: #4ade80; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11px;"></pre>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      DOM.workspace.innerHTML = `<div style="color: var(--severity-critical); padding: 20px;">Failed to load workflows: ${e.message}</div>`;
    }
  }

  async function executeWorkflow(workflowId) {
    const logBox = document.getElementById('workflowLogBox');
    const logText = document.getElementById('workflowLogText');
    if (logBox) logBox.style.display = 'block';
    if (logText) logText.textContent = 'Executing workflow trigger & pipeline...';

    try {
      const res = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      }).then(r => r.json());

      if (res.status === 'success') {
        if (logText) logText.textContent = res.logs.join('\n');
      }
    } catch (e) {
      if (logText) logText.textContent = 'Execution error: ' + e.message;
    }
  }

  // =========================================================================
  // DEEP DEVICE SNAPSHOT MODAL (Multi-Tab Layout)
  // =========================================================================
  function inspectDevice(deviceId) {
    const dev = state.devices.find(d => d.id === deviceId);
    if (!dev) return;

    state.activeModalDevice = dev;
    state.activeSnapTab = 'overview';
    const probe = state.probes.find(p => p.id === dev.probeId) || { displayName: 'Central' };

    DOM.snapDevTitle.innerHTML = `<img src="${getDeviceIcon(dev.category, dev.vendor)}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px;" alt="${dev.category}"> ${dev.name} - Device Snapshot`;
    DOM.snapDevSubtitle.textContent = `${dev.vendor} ${dev.category} • IP: ${dev.ip} • Monitored by: ${probe.displayName}`;

    renderDeviceModalBody(dev);
    DOM.deviceSnapshotModal.classList.add('active');
  }

  function renderDeviceModalBody(dev) {
    const ifaces = dev.interfaces || [];
    const cpu = (typeof dev.cpu === 'number') ? dev.cpu : null;
    const mem = (typeof dev.memory === 'number') ? dev.memory : null;
    const disk = (typeof dev.disk === 'number') ? dev.disk : null;
    const temp = (typeof dev.temperature === 'number') ? dev.temperature : null;
    // Monitors are derived only from values this device actually reported.
    const monitors = [];
    if (dev.status) monitors.push({ name: 'Ping Echo', type: 'Availability', interval: '60s', protocol: 'ICMP', status: dev.status });
    if (cpu !== null) monitors.push({ name: 'CPU Utilization', type: 'Performance', interval: '120s', protocol: 'SNMP RFC1213', status: 'Active' });
    if (mem !== null) monitors.push({ name: 'Memory Utilization', type: 'Performance', interval: '120s', protocol: 'HOST-RESOURCES-MIB', status: 'Active' });
    if (disk !== null) monitors.push({ name: 'Disk Space', type: 'Capacity', interval: '300s', protocol: 'HOST-RESOURCES-MIB', status: 'Active' });
    if (temp !== null) monitors.push({ name: 'Temperature', type: 'Hardware Health', interval: '300s', protocol: 'CISCO-ENVMON-MIB', status: 'Active' });

    DOM.snapDevBody.innerHTML = `
      <!-- Snapshot Tabs Bar -->
      <div class="snap-tabs-bar">
        <div class="snap-tab-btn ${state.activeSnapTab === 'overview' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('overview')">📊 Overview</div>
        <div class="snap-tab-btn ${state.activeSnapTab === 'hardware' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('hardware')">🏷️ Hardware Specs</div>
        <div class="snap-tab-btn ${state.activeSnapTab === 'performance' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('performance')">📈 Performance Trends (24h)</div>
        <div class="snap-tab-btn ${state.activeSnapTab === 'interfaces' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('interfaces')">🌐 Interfaces (IF-MIB)</div>
        <div class="snap-tab-btn ${state.activeSnapTab === 'monitors' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('monitors')">💻 Active Monitors</div>
        <div class="snap-tab-btn ${state.activeSnapTab === 'ccm' ? 'active' : ''}" onclick="window.OpManager.switchSnapTab('ccm')">⚙️ CCM Config</div>
      </div>

      <!-- Tab Pane 1: Overview -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'overview' ? 'active' : ''}">
        <div class="dials-grid-me">
          <div class="dial-box-me">
            ${renderSvgDial(cpu !== null ? cpu : 0, cpu !== null ? cpu + '%' : '—')}
            <div class="dial-label-me">CPU Utilization</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(mem !== null ? mem : 0, mem !== null ? mem + '%' : '—')}
            <div class="dial-label-me">Memory Usage</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(disk !== null ? disk : 0, disk !== null ? disk + '%' : '—')}
            <div class="dial-label-me">Storage Disk</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(temp !== null ? Math.min(100, Math.round((temp / 70) * 100)) : 0, temp !== null ? temp + '°C' : '—')}
            <div class="dial-label-me">Temperature</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; font-size: 11px;">
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Response Time</div>
            <div style="font-size: 14px; font-weight: 700;">${dev.responseTime != null ? dev.responseTime + ' ms' : '—'}</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Packet Loss</div>
            <div style="font-size: 14px; font-weight: 700;">${dev.packetLoss != null ? dev.packetLoss + ' %' : '—'}</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">System Uptime</div>
            <div style="font-size: 14px; font-weight: 700;">${displayVal(dev.uptime || dev.sysUpTime)}</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Operating System</div>
            <div style="font-size: 14px; font-weight: 700;">${escapeHtml(String(dev.osVersion || dev.os || '—'))}</div>
          </div>
        </div>
        ${cpu === null && mem === null && disk === null && temp === null ? '<div style="font-size: 11px; color: var(--text-muted);">No hardware details reported yet — poll the device or check its SNMP/WMI credentials.</div>' : ''}
      </div>

      <!-- Tab Pane 2: Hardware Specs -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'hardware' ? 'active' : ''}">
        <div id="snapHardwarePane">
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">Querying Hardware Inventory from Device...</div>
        </div>
      </div>

      <!-- Tab Pane 2: Performance Trends (Sparklines) -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'performance' ? 'active' : ''}">
        ${emptyStateHtml('No performance history yet', 'Graphs fill in as polls complete. Current values: CPU ' + (cpu !== null ? cpu + '%' : '—') + ', memory ' + (mem !== null ? mem + '%' : '—') + ', response ' + (dev.responseTime != null ? dev.responseTime + ' ms' : '—') + '.')}
      </div>

      <!-- Tab Pane 3: Interfaces -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'interfaces' ? 'active' : ''}">
        ${ifaces.length ? `
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Interface</th>
                <th>Admin Status</th>
                <th>Oper Status</th>
                <th>Speed</th>
                <th>In Traffic (Mbps)</th>
                <th>Out Traffic (Mbps)</th>
              </tr>
            </thead>
            <tbody>
              ${ifaces.map(i => `
                <tr>
                  <td><code>${escapeHtml(String(i.name || '—'))}</code></td>
                  <td><span class="badge-me ${String(i.admin || i.adminStatus || '').toLowerCase() === 'up' ? 'clear' : 'down'}">${displayVal(i.admin || i.adminStatus)}</span></td>
                  <td><span class="badge-me ${String(i.oper || i.operStatus || i.status || '').toLowerCase() === 'up' ? 'clear' : 'down'}">${displayVal(i.oper || i.operStatus || i.status)}</span></td>
                  <td>${displayVal(i.speed)}</td>
                  <td>${displayVal(i.inTraffic)}</td>
                  <td>${displayVal(i.outTraffic)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : emptyStateHtml('No interfaces discovered yet', 'Run an SNMP interface discovery on this device.')}
      </div>

      <!-- Tab Pane 4: Monitors -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'monitors' ? 'active' : ''}">
        ${monitors.length ? `
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Monitor Name</th>
                <th>Type</th>
                <th>Interval</th>
                <th>Protocol</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${monitors.map(mo => `
                <tr><td><strong>${escapeHtml(mo.name)}</strong></td><td>${escapeHtml(mo.type)}</td><td>${escapeHtml(mo.interval)}</td><td>${escapeHtml(mo.protocol)}</td><td><span class="badge-me clear">${escapeHtml(mo.status)}</span></td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : emptyStateHtml('No monitors assigned yet', 'Assign a device template to add monitors.')}
      </div>

      <!-- Tab Pane 5: CCM -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'ccm' ? 'active' : ''}">
        <div id="snapCcmPane">
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">Loading configuration status…</div>
        </div>
      </div>
    `;
    if (state.activeSnapTab === 'ccm') loadSnapCcm(dev.id);
  }

  async function loadSnapCcm(deviceId) {
    const pane = document.getElementById('snapCcmPane');
    if (!pane) return;
    try {
      const res = await apiJson(`/api/ccm/diff?deviceId=${encodeURIComponent(deviceId)}`);
      if (res.reason) {
        pane.innerHTML = emptyStateHtml('No configuration backed up yet', 'Take a baseline backup to enable diff and drift checks.');
        return;
      }
      const hasDrift = res.drift === true || res.hasDrift === true;
      pane.innerHTML = `
        <div style="font-size: 11px; margin-bottom: 8px;">
          Configuration Baseline Status: <span class="badge-me ${hasDrift ? 'trouble' : 'clear'}">${hasDrift ? 'Drift Detected' : 'In Compliance'}</span>
          (${res.addedLinesCount != null ? res.addedLinesCount : '—'} added, ${res.removedLinesCount != null ? res.removedLinesCount : '—'} removed)
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">Last backup: ${fmtTime(res.lastBackupTime)} • Running version: ${escapeHtml(String(res.runningVersion || '—'))} • Startup version: ${escapeHtml(String(res.startupVersion || '—'))}</div>
        <div style="margin-top: 10px;"><button class="btn-me-secondary" onclick="window.OpManager.openConfigDiff('${deviceId}')">Open Diff Inspector</button></div>
      `;
    } catch (e) {
      pane.innerHTML = `<div style="color: var(--severity-critical);">Couldn't load configuration status: ${escapeHtml(e.message)}</div>`;
    }
  }

  function switchSnapTab(tabName) {
    state.activeSnapTab = tabName;
    if (state.activeModalDevice) {
      renderDeviceModalBody(state.activeModalDevice);
      if (tabName === 'hardware') {
        loadHardwareSpecs(state.activeModalDevice.id);
      }
    }
  }

  // ManageEngine Device Inventory & Hardware Specs Loader (from DeviceInventoryInfo.xml)
  async function loadHardwareSpecs(deviceId) {
    const pane = document.getElementById('snapHardwarePane');
    if (!pane) return;

    try {
      const res = await fetch(`/api/hardware/details?deviceId=${deviceId}`, { credentials: 'include' }).then(r => r.json());
      if (!res.hardware) {
        pane.innerHTML = emptyStateHtml('No hardware details reported yet', 'Poll the device or check its SNMP/WMI credentials.');
      } else if (res.status === 'success' && res.hardware) {
        const h = res.hardware;
        pane.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 11px;">
            <div style="background: var(--bg-subnav); padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); line-height: 1.8;">
              <div style="font-weight: 800; color: var(--primary); margin-bottom: 4px;">CHASSIS &amp; PROCESSOR SPECIFICATIONS</div>
              <div><strong>Hardware Model:</strong> ${h.model}</div>
              <div><strong>Serial Number:</strong> <code>${h.serialNumber}</code></div>
              <div><strong>MAC Address:</strong> <code>${h.macAddress}</code></div>
              <div><strong>System OID:</strong> <code>${h.systemOid}</code></div>
              <div><strong>ROM / Bootloader:</strong> ${h.romVersion}</div>
              <div><strong>Firmware Version:</strong> ${h.firmwareVersion}</div>
            </div>

            <div style="background: var(--bg-subnav); padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); line-height: 1.8;">
              <div style="font-weight: 800; color: var(--primary); margin-bottom: 4px;">MEMORY &amp; PHYSICAL INVENTORY</div>
              <div><strong>Total System RAM:</strong> ${h.totalRam}</div>
              <div><strong>Flash Memory:</strong> ${h.flashMemory}</div>
              <div><strong>Asset Tag:</strong> ${h.assetTag}</div>
              <div><strong>Facility / Rack:</strong> ${h.rackLocation}</div>
              <div><strong>Maintenance Window:</strong> ${h.maintenanceWindow}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px;">
            <div style="background: var(--bg-subnav); padding: 10px; border-radius: 4px; border: 1px solid var(--border-color);">
              <div style="font-weight: 700; margin-bottom: 6px;">⚡ Redundant Power Supplies (${h.powerSupplies.length}):</div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${h.powerSupplies.map(p => `
                  <div style="display: flex; justify-content: space-between; padding: 4px 6px; background: var(--bg-card); border-radius: 3px; font-size: 10px;">
                    <span><strong>${p.id}:</strong> ${p.model}</span>
                    <span style="color: #22c55e;">${p.status} (${p.output})</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background: var(--bg-subnav); padding: 10px; border-radius: 4px; border: 1px solid var(--border-color);">
              <div style="font-weight: 700; margin-bottom: 6px;">🌀 Active Cooling Fan Trays (${h.fanTrays.length}):</div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${h.fanTrays.map(f => `
                  <div style="display: flex; justify-content: space-between; padding: 4px 6px; background: var(--bg-card); border-radius: 3px; font-size: 10px;">
                    <span><strong>${f.id}:</strong> ${f.airflow}</span>
                    <span style="color: #38bdf8;">${f.speed} (${f.status})</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }
    } catch (e) {
      if (pane) pane.innerHTML = `<div style="color: var(--severity-critical);">Failed to load hardware inventory: ${e.message}</div>`;
    }
  }

  function renderSparklineChart(points, color, unit) {
    const w = 280;
    const h = 70;
    const maxVal = Math.max(...points, 100);
    const minVal = 0;

    let pathD = '';
    points.forEach((pt, idx) => {
      const x = (idx / (points.length - 1)) * w;
      const y = h - ((pt - minVal) / (maxVal - minVal)) * (h - 10) - 5;
      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return `
      <div>
        <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
          <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${points.map((pt, idx) => {
            const x = (idx / (points.length - 1)) * w;
            const y = h - ((pt - minVal) / (maxVal - minVal)) * (h - 10) - 5;
            return `<circle cx="${x}" cy="${y}" r="3" fill="${color}" />`;
          }).join('')}
        </svg>
        <div style="display:flex; justify-content:space-between; font-size: 10px; color: var(--text-muted); margin-top: 4px;">
          <span>Min: ${Math.min(...points)}${unit}</span>
          <span>Current: <strong>${points[points.length - 1]}${unit}</strong></span>
          <span>Peak: ${Math.max(...points)}${unit}</span>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================

  function renderSvgDial(percent, text) {
    const radius = 34;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (percent / 100) * circ;
    const color = percent > 85 ? '#e53935' : (percent > 70 ? '#fb8c00' : '#43a047');

    return `
      <div class="dial-svg">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="${radius}" stroke="rgba(255,255,255,0.1)" stroke-width="7" fill="none"/>
          <circle cx="40" cy="40" r="${radius}" stroke="${color}" stroke-width="7" fill="none"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
            transform="rotate(-90 40 40)"/>
          <text x="40" y="45" font-size="12" font-weight="bold" fill="currentColor" text-anchor="middle">
            ${text ? text : `${percent}%`}
          </text>
        </svg>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================

  function updateDeviceModalMetrics(dev) {
    renderDeviceModalBody(dev);
  }

  // =========================================================================
  // Modals & Diagnostic Tools Binding
  // =========================================================================
  function bindModals() {
    DOM.closeDeviceSnapshot.addEventListener('click', () => DOM.deviceSnapshotModal.classList.remove('active'));
    DOM.closeDeviceSnapshotBottom.addEventListener('click', () => DOM.deviceSnapshotModal.classList.remove('active'));

    // About Modal
    DOM.closeAboutModal.addEventListener('click', () => DOM.aboutModal.classList.remove('active'));
    DOM.closeAboutBottom.addEventListener('click', () => DOM.aboutModal.classList.remove('active'));

    // Widget Catalog Modal
    DOM.closeWidgetCatalogModal.addEventListener('click', () => DOM.widgetCatalogModal.classList.remove('active'));
    DOM.closeWidgetCatalogBottom.addEventListener('click', () => DOM.widgetCatalogModal.classList.remove('active'));

    // Download Agent Modal
    DOM.closeDownloadAgentModal.addEventListener('click', () => DOM.downloadAgentModal.classList.remove('active'));
    DOM.closeDownloadAgentBottom.addEventListener('click', () => DOM.downloadAgentModal.classList.remove('active'));
    DOM.btnRefreshAgentsList.addEventListener('click', loadLiveAgentsList);

    // Snap buttons
    DOM.btnSnapTerminal.addEventListener('click', () => {
      if (!state.activeModalDevice) return;
      openTerminal(state.activeModalDevice.name, state.activeModalDevice.ip);
    });

    DOM.btnSnapPollNow?.addEventListener('click', async () => {
      if (!state.activeModalDevice) return;
      const btn = DOM.btnSnapPollNow;
      const origText = btn.innerHTML;
      btn.innerHTML = '⚡ Polling...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/json/device/pollNow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: state.activeModalDevice.id })
        }).then(r => r.json());

        if (res.status === 'success' && res.device) {
          Object.assign(state.activeModalDevice, res.device);
          renderDeviceModalBody(state.activeModalDevice);
          showAlarmToast({
            id: `poll-${Date.now()}`,
            severity: 'Clear',
            deviceName: res.device.name,
            ip: res.device.ip,
            probeName: res.device.probeName || '—',
            message: `Instant SNMP Poll completed (Ping: ${res.device.responseTime}ms, CPU: ${res.device.cpu}%, Mem: ${res.device.memory}%)`
          });
        }
      } catch (err) {
        console.error('Failed to poll device', err);
      } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    });

    DOM.btnSnapBackupConfig?.addEventListener('click', async () => {
      if (!state.activeModalDevice) return;
      const btn = DOM.btnSnapBackupConfig;
      const origText = btn.innerHTML;
      btn.innerHTML = '💾 Backing up...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/ccm/backup-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: state.activeModalDevice.id })
        }).then(r => r.json());

        if (res.status === 'success') {
          showAlarmToast({
            id: `ccm-backup-${Date.now()}`,
            severity: 'Clear',
            deviceName: state.activeModalDevice.name,
            ip: state.activeModalDevice.ip,
            probeName: 'NCM Central Engine',
            message: `Cisco IOS Running Config backed up to NCM Repository (Revision ${res.revision}, ${res.fileSize})`
          });
          state.activeSnapTab = 'ccm';
          renderDeviceModalBody(state.activeModalDevice);
        }
      } catch (err) {
        console.error('Config backup error', err);
      } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    });

    DOM.btnSnapDrift?.addEventListener('click', () => {
      if (!state.activeModalDevice) return;
      openConfigDiff(state.activeModalDevice.id);
    });

    DOM.btnSnapSwitchPorts.addEventListener('click', () => {
      if (!state.activeModalDevice) return;
      openSwitchPorts(state.activeModalDevice.name, state.activeModalDevice.ip);
    });

    DOM.btnSnapPing.addEventListener('click', () => {
      if (!state.activeModalDevice) return;
      runPingTool(state.activeModalDevice.ip, state.activeModalDevice.probeId);
    });

    DOM.btnSnapTraceroute.addEventListener('click', () => {
      if (!state.activeModalDevice) return;
      runTracerouteTool(state.activeModalDevice.ip);
    });

    DOM.btnSnapMibBrowser.addEventListener('click', () => {
      openMibBrowser(state.activeModalDevice?.ip);
    });

    // Terminal Modal
    DOM.closeTerminalModal.addEventListener('click', () => DOM.terminalModal.classList.remove('active'));
    DOM.closeTerminalBottom.addEventListener('click', () => DOM.terminalModal.classList.remove('active'));

    DOM.btnSendTerminalCmd.addEventListener('click', sendTerminalCommand);
    DOM.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendTerminalCommand();
    });

    // Switch Port Modal
    DOM.closeSwitchPortModal.addEventListener('click', () => DOM.switchPortModal.classList.remove('active'));
    DOM.closeSwitchPortBottom.addEventListener('click', () => DOM.switchPortModal.classList.remove('active'));

    // Traceroute Modal
    DOM.closeTracerouteModal.addEventListener('click', () => DOM.tracerouteModal.classList.remove('active'));
    DOM.closeTracerouteBottom.addEventListener('click', () => DOM.tracerouteModal.classList.remove('active'));

    // Probe modal
    DOM.closeAddProbeModal.addEventListener('click', () => DOM.addProbeModal.classList.remove('active'));
    DOM.addProbeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newP = {
        name: document.getElementById('pName').value.trim(),
        displayName: document.getElementById('pDisplayName').value.trim(),
        location: document.getElementById('pLocation').value.trim(),
        ip: document.getElementById('pIp').value.trim(),
        port: parseInt(document.getElementById('pPort').value, 10) || 8060
      };
      if (!newP.name || !newP.ip) {
        alert('Probe name and IP are required.');
        return;
      }

      try {
        const res = await fetch('/api/json/enterprise/addProbe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newP)
        }).then(r => r.json());

        if (res.status === 'success') {
          DOM.addProbeModal.classList.remove('active');
          DOM.addProbeForm.reset();
          await fetchInitialData();
          renderCurrentView();
        } else {
          alert(res.message || 'Failed to register probe.');
        }
      } catch (err) {
        alert('Failed to register probe: ' + err.message);
      }
    });

    // Device modal
    DOM.closeAddDeviceModal.addEventListener('click', () => DOM.addDeviceModal.classList.remove('active'));
    DOM.addDeviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newD = {
        probeId: DOM.devProbeAssign.value,
        ip: document.getElementById('devIp').value.trim(),
        name: document.getElementById('devName').value.trim(),
        category: document.getElementById('devCat').value,
        credential: document.getElementById('devCred').value
      };
      if (!newD.ip || !newD.name) {
        alert('Device IP and name are required.');
        return;
      }

      try {
        const res = await fetch('/api/json/device/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newD)
        }).then(r => r.json());

        if (res.status === 'success') {
          DOM.addDeviceModal.classList.remove('active');
          DOM.addDeviceForm.reset();
          await fetchInitialData();
          renderCurrentView();
        } else {
          alert(res.message || 'Failed to add device.');
        }
      } catch (err) {
        alert('Failed to add device: ' + err.message);
      }
    });

    // MIB Browser Modal
    DOM.btnHeaderMibBrowser?.addEventListener('click', () => openMibBrowser());
    DOM.closeMibBrowserModal?.addEventListener('click', () => DOM.mibBrowserModal.classList.remove('active'));
    DOM.closeMibBrowserBottom?.addEventListener('click', () => DOM.mibBrowserModal.classList.remove('active'));
    DOM.btnMibGet?.addEventListener('click', executeMibGet);
    DOM.btnMibWalk?.addEventListener('click', executeMibWalk);

    // Config Diff Modal
    DOM.closeConfigDiffModal?.addEventListener('click', () => DOM.configDiffModal.classList.remove('active'));
    DOM.closeConfigDiffBottom?.addEventListener('click', () => DOM.configDiffModal.classList.remove('active'));

    // Global Spotlight Search (Ctrl+K / Cmd+K)
    initSpotlightSearch();
  }

  // =========================================================================
  // Global Spotlight Omnibox Search (Ctrl+K / Cmd+K / '/')
  // =========================================================================
  function initSpotlightSearch() {
    DOM.globalSearchInput.addEventListener('focus', openSpotlight);
    DOM.globalSearchInput.addEventListener('click', openSpotlight);

    DOM.spotlightInput.addEventListener('input', (e) => {
      renderSpotlightResults(e.target.value.trim().toLowerCase());
    });

    DOM.spotlightSearchModal.addEventListener('click', (e) => {
      if (e.target === DOM.spotlightSearchModal) closeSpotlight();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSpotlight();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSpotlight();
      } else if (e.key === 'Escape') {
        closeSpotlight();
      }
    });
  }

  function openSpotlight() {
    DOM.spotlightSearchModal.classList.add('active');
    DOM.spotlightInput.value = '';
    setTimeout(() => DOM.spotlightInput.focus(), 50);
    renderSpotlightResults('');
  }

  function closeSpotlight() {
    DOM.spotlightSearchModal.classList.remove('active');
  }

  function renderSpotlightResults(query) {
    const list = DOM.spotlightResultsList;
    if (!list) return;

    if (!query) {
      list.innerHTML = `
        <div class="spotlight-category-title">Quick Actions &amp; Diagnostic Tools</div>
        <div class="spotlight-item" onclick="window.OpManager.openMibBrowser(); window.OpManager.closeSpotlight();">
          <div class="spotlight-item-left">
            <span style="font-size: 18px;">🔬</span>
            <div>
              <div class="spotlight-item-title">SNMP MIB Browser</div>
              <div class="spotlight-item-sub">Query RFC1213-MIB, CISCO-STACK-MIB, IF-MIB OIDs via SNMP GET / WALK</div>
            </div>
          </div>
          <span class="badge-me clear">Tool</span>
        </div>
        <div class="spotlight-item" onclick="window.OpManager.switchTab('topology', '3D Datacenter Rack View'); window.OpManager.closeSpotlight();">
          <div class="spotlight-item-left">
            <span style="font-size: 18px;">🏢</span>
            <div>
              <div class="spotlight-item-title">3D Datacenter Rack Visualizer</div>
              <div class="spotlight-item-sub">View 42U Server Racks, faceplate slots, thermal sensors, and power draw</div>
            </div>
          </div>
          <span class="badge-me clear">Topology</span>
        </div>
        <div class="spotlight-item" onclick="window.OpManager.switchTab('topology', 'Business Views'); window.OpManager.closeSpotlight();">
          <div class="spotlight-item-left">
            <span style="font-size: 18px;">🗺️</span>
            <div>
              <div class="spotlight-item-title">Business Views (Custom Maps)</div>
              <div class="spotlight-item-sub">Enterprise WAN, DMZ Firewalls, Active Directory &amp; SAN storage layout</div>
            </div>
          </div>
          <span class="badge-me clear">Topology</span>
        </div>
        <div class="spotlight-item" onclick="window.OpManager.switchTab('alarms', 'SNMP Trap Viewer'); window.OpManager.closeSpotlight();">
          <div class="spotlight-item-left">
            <span style="font-size: 18px;">📡</span>
            <div>
              <div class="spotlight-item-title">SNMP Trap Viewer</div>
              <div class="spotlight-item-sub">Live incoming linkDown, bgpPeerDown, authenticationFailure traps</div>
            </div>
          </div>
          <span class="badge-me clear">Alarms</span>
        </div>
        <div class="spotlight-item" onclick="window.OpManager.switchTab('settings', 'Workflow Automation'); window.OpManager.closeSpotlight();">
          <div class="spotlight-item-left">
            <span style="font-size: 18px;">⚡</span>
            <div>
              <div class="spotlight-item-title">Workflow Automation Studio</div>
              <div class="spotlight-item-sub">Automated ITOM remediation actions &amp; scripts across remote probes</div>
            </div>
          </div>
          <span class="badge-me clear">Automation</span>
        </div>
      `;
      return;
    }

    const matchedDevs = state.devices.filter(d => 
      d.name.toLowerCase().includes(query) || 
      d.ip.includes(query) || 
      (d.category || '').toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedAlarms = state.alarms.filter(a =>
      a.message.toLowerCase().includes(query) ||
      a.deviceName.toLowerCase().includes(query)
    ).slice(0, 4);

    const matchedProbes = state.probes.filter(p =>
      p.displayName.toLowerCase().includes(query) ||
      p.ip.includes(query)
    );

    let html = '';

    if (matchedDevs.length > 0) {
      html += `<div class="spotlight-category-title">🖥️ Matching Devices (${matchedDevs.length})</div>`;
      matchedDevs.forEach(d => {
        html += `
          <div class="spotlight-item" onclick="window.OpManager.inspectDevice('${d.id}'); window.OpManager.closeSpotlight();">
            <div class="spotlight-item-left">
              <img src="${getDeviceIcon(d.category, d.vendor)}" style="width: 22px; height: 22px;" alt="${d.category}">
              <div>
                <div class="spotlight-item-title">${d.name} (${d.ip})</div>
                <div class="spotlight-item-sub">${d.vendor} ${d.category} • Probe: ${d.probeName}</div>
              </div>
            </div>
            <span class="badge-me ${d.status.toLowerCase()}">${d.status}</span>
          </div>
        `;
      });
    }

    if (matchedAlarms.length > 0) {
      html += `<div class="spotlight-category-title">🚨 Matching Alarms (${matchedAlarms.length})</div>`;
      matchedAlarms.forEach(a => {
        html += `
          <div class="spotlight-item" onclick="window.OpManager.switchTab('alarms', 'All Active'); window.OpManager.closeSpotlight();">
            <div class="spotlight-item-left">
              <span style="font-size: 16px;">⚠️</span>
              <div>
                <div class="spotlight-item-title">${a.deviceName}: ${a.message}</div>
                <div class="spotlight-item-sub">Source: ${a.source} • Time: ${a.timestamp}</div>
              </div>
            </div>
            <span class="badge-me ${a.severity.toLowerCase()}">${a.severity}</span>
          </div>
        `;
      });
    }

    if (matchedProbes.length > 0) {
      html += `<div class="spotlight-category-title">📡 Matching Probes (${matchedProbes.length})</div>`;
      matchedProbes.forEach(p => {
        html += `
          <div class="spotlight-item" onclick="window.OpManager.switchTab('probes', 'Probe Grid'); window.OpManager.closeSpotlight();">
            <div class="spotlight-item-left">
              <span style="font-size: 16px;">🌐</span>
              <div>
                <div class="spotlight-item-title">${p.displayName} (${p.ip}:${p.port || 8060})</div>
                <div class="spotlight-item-sub">${p.location} • Monitored Devices: ${p.deviceCount}</div>
              </div>
            </div>
            <span class="badge-me clear">${p.status}</span>
          </div>
        `;
      });
    }

    if (!html) {
      html = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No matching devices, alarms, or probes found for "<strong>${escapeHtml(query)}</strong>".</div>`;
    }

    list.innerHTML = html;
  }

  // =========================================================================
  // Authentic ManageEngine SNMP MIB Browser Logic
  // =========================================================================
  async function openMibBrowser(targetIp) {
    if (targetIp && DOM.mibTargetIp) {
      DOM.mibTargetIp.value = targetIp;
    }
    DOM.mibBrowserModal.classList.add('active');
    loadMibTree();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  async function loadMibTree() {
    try {
      const res = await fetch('/api/tools/mib-tree').then(r => r.json());
      if (res.status === 'success' && res.modules) {
        DOM.mibTreeContainer.innerHTML = res.modules.map(mod => `
          <div style="margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 11px; color: var(--primary); margin-bottom: 4px;">📂 ${mod.name}</div>
            <div style="padding-left: 10px; display: flex; flex-direction: column; gap: 2px;">
              ${mod.oids.map(o => `
                <div class="mib-tree-item ${o.oid === DOM.mibCurrentOid.value ? 'active' : ''}" 
                     onclick="window.OpManager.selectMibOid('${o.oid}', '${o.name}', '${escapeHtml(o.desc)}')">
                  <span>📄</span>
                  <span>${o.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      DOM.mibTreeContainer.innerHTML = `<div style="color: var(--severity-critical);">Failed to load MIB tree</div>`;
    }
  }

  function selectMibOid(oid, name, desc) {
    DOM.mibCurrentOid.value = oid;
    DOM.mibSelectedDesc.innerHTML = `<strong>Selected:</strong> <code>${oid}</code> (${name}) - <em>${desc}</em>`;
    document.querySelectorAll('.mib-tree-item').forEach(el => el.classList.remove('active'));
    event?.currentTarget?.classList.add('active');
  }

  async function executeMibGet() {
    const ip = DOM.mibTargetIp.value.trim();
    const oid = DOM.mibCurrentOid.value.trim();
    const community = DOM.mibCommunity.value.trim();
    const version = DOM.mibVersion.value;

    DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">Querying ${ip} via SNMP ${version}...</td></tr>`;

    try {
      const res = await fetch('/api/tools/snmp-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, oid, community, version })
      }).then(r => r.json());

      if (res.status === 'success') {
        DOM.mibResultsTableBody.innerHTML = `
          <tr>
            <td><code>${res.oid}</code></td>
            <td><strong>${res.name}</strong></td>
            <td><span class="badge-me clear">${res.type}</span></td>
            <td style="color: #38bdf8;">${res.value}</td>
          </tr>
        `;
      } else {
        DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="color: var(--severity-critical); padding: 14px;">${res.message || 'SNMP query timed out'}</td></tr>`;
      }
    } catch (e) {
      DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="color: var(--severity-critical); padding: 14px;">Query error: ${e.message}</td></tr>`;
    }
  }

  async function executeMibWalk() {
    const ip = DOM.mibTargetIp.value.trim();
    const rootOid = DOM.mibCurrentOid.value.trim();
    const community = DOM.mibCommunity.value.trim();
    const version = DOM.mibVersion.value;

    DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">Walking OID tree from ${rootOid} on ${ip}...</td></tr>`;

    try {
      const res = await fetch('/api/tools/snmp-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, rootOid, community, version })
      }).then(r => r.json());

      if (res.status === 'success' && res.results.length > 0) {
        DOM.mibResultsTableBody.innerHTML = res.results.map(r => `
          <tr>
            <td><code>${r.oid}</code></td>
            <td><strong>${r.name}</strong></td>
            <td><span class="badge-me clear">${r.type}</span></td>
            <td style="color: #38bdf8;">${r.value}</td>
          </tr>
        `).join('');
      } else {
        DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">No objects found under this subtree.</td></tr>`;
      }
    } catch (e) {
      DOM.mibResultsTableBody.innerHTML = `<tr><td colspan="4" style="color: var(--severity-critical); padding: 14px;">Walk error: ${e.message}</td></tr>`;
    }
  }

  // =========================================================================
  // Interactive Terminal Actions
  // =========================================================================
  function openTerminal(name, ip) {
    DOM.termModalTitle.textContent = `💻 Web CLI SSH Terminal (${name} - ${ip}:22)`;
    DOM.termPromptLbl.textContent = `${name}#`;
    DOM.terminalScreenText.textContent = `${name}# Terminal ready for ${ip}:22 — not connected yet.\nType a command to run it via the terminal service (e.g. 'show ip int br').\n`;
    DOM.terminalInput.value = 'show ip int br';
    DOM.terminalModal.classList.add('active');
    setTimeout(() => DOM.terminalInput.focus(), 100);
  }

  async function sendTerminalCommand() {
    const cmd = DOM.terminalInput.value.trim();
    if (!cmd) return;

    const promptText = DOM.termPromptLbl.textContent;
    DOM.terminalScreenText.textContent += `\n${promptText} ${cmd}\n`;
    DOM.terminalInput.value = '';

    try {
      const res = await fetch('/api/tools/terminal-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, hostname: promptText.replace('#', '') })
      }).then(r => r.json());

      DOM.terminalScreenText.textContent += `${res.output}\n`;
      DOM.terminalScreenText.scrollTop = DOM.terminalScreenText.scrollHeight;
    } catch (e) {
      DOM.terminalScreenText.textContent += `Error: ${e.message}\n`;
    }
  }

  // =========================================================================
  // Interactive Switch Port Mapper
  // =========================================================================
  async function openSwitchPorts(name, ip) {
    DOM.switchPortTitle.textContent = `🔌 Switch Port Mapper (${name} - ${ip})`;
    DOM.switchPortBody.innerHTML = `<div style="padding: 20px; text-align: center;">Scanning ports via RFC1213-MIB / IF-MIB...</div>`;
    DOM.switchPortModal.classList.add('active');

    try {
      const res = await fetch(`/api/tools/switch-ports?ip=${encodeURIComponent(ip)}`).then(r => r.json());
      const ports = res.ports || [];

      DOM.switchPortBody.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px;">
          <span>Total Ports: <strong>${res.totalPorts}</strong></span>
          <span>Active / Linked Ports: <strong style="color: var(--severity-clear);">${res.activePorts}</strong></span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Interface Alias</th>
                <th>Admin</th>
                <th>Oper</th>
                <th>Speed</th>
                <th>VLAN</th>
                <th>Connected MAC</th>
                <th>IP Address</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${ports.map(p => `
                <tr>
                  <td><strong>${p.port}</strong></td>
                  <td>${p.alias}</td>
                  <td><span class="badge-me ${p.adminStatus === 'Up' ? 'clear' : 'down'}">${p.adminStatus}</span></td>
                  <td><span class="badge-me ${p.operStatus === 'Up' ? 'clear' : 'down'}">${p.operStatus}</span></td>
                  <td>${p.speed}</td>
                  <td>${p.vlan}</td>
                  <td><code>${p.mac}</code></td>
                  <td><code>${p.ip}</code></td>
                  <td>${p.type}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      DOM.switchPortBody.innerHTML = `<div style="color: var(--severity-critical);">Failed to map switch ports: ${e.message}</div>`;
    }
  }

  // =========================================================================
  // Traceroute Tool
  // =========================================================================
  async function runTracerouteTool(ip) {
    DOM.traceTargetIp.textContent = ip;
    DOM.tracerouteOutput.textContent = `Tracing route to ${ip} over a maximum of 30 hops...\n`;
    DOM.tracerouteModal.classList.add('active');

    try {
      const res = await fetch('/api/tools/traceroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      }).then(r => r.json());

      let lines = `Tracing route to ${ip} over a maximum of 30 hops:\n\n`;
      (res.hops || []).forEach(h => {
        lines += `  ${h.hop}    ${h.rtt1}    ${h.rtt2}    ${h.rtt3}    ${h.hostname} [${h.ip}]\n`;
      });
      if (res.lossPercent != null) lines += `\nTrace complete. Packet loss: ${res.lossPercent}%.`;
      else lines += `\nTrace complete.`;
      DOM.tracerouteOutput.textContent = lines;
    } catch (e) {
      DOM.tracerouteOutput.textContent = `Traceroute error: ${e.message}`;
    }
  }

  async function runPingTool(ip, probeId) {
    alert(`Initiating Probe ICMP Ping to ${ip}...`);
    try {
      const res = await fetch('/api/tools/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, probeId })
      }).then(r => r.json());

      const lines = (res.packets || []).map(p => `  ${p.status || p}`).join('\n');
      alert(`Ping Results for ${ip} (Executed by: ${res.probe || '—'}):\n\n${lines}\n\nPackets: Sent = ${res.transmitted != null ? res.transmitted : '—'}, Received = ${res.received != null ? res.received : '—'}, Lost = ${res.lossPercent != null ? res.lossPercent + '%' : '—'}\nApproximate round trip times: Minimum = ${res.minRtt != null ? res.minRtt + 'ms' : '—'}, Maximum = ${res.maxRtt != null ? res.maxRtt + 'ms' : '—'}, Average = ${res.avgRtt != null ? res.avgRtt + 'ms' : '—'}`);
    } catch (e) {
      alert('Ping failed: ' + e.message);
    }
  }

  function runQuickPing(ip) {
    const target = ip || prompt('Enter IP Address or Hostname to Ping from Central Poller:', '');
    if (target) runPingTool(target.trim(), state.probes[0] ? state.probes[0].id : undefined);
  }

  // =========================================================================
  // Agent Downloads & Management
  // =========================================================================
  async function openDownloadAgentModal() {
    DOM.downloadAgentModal.classList.add('active');
    await loadLiveAgentsList();
  }

  async function loadLiveAgentsList() {
    if (!DOM.liveAgentsList) return;
    DOM.liveAgentsList.innerHTML = 'Loading registered agents...';

    try {
      const res = await fetch('/api/agent/list').then(r => r.json());
      const agents = res.agents || [];
      if (agents.length === 0) {
        DOM.liveAgentsList.innerHTML = '<div style="color: var(--text-muted); padding: 8px 0;">No active agents connected. Run <code>OpManagerAgent.exe</code> or <code>OpManagerAgent.app</code> to register a host.</div>';
        return;
      }

      DOM.liveAgentsList.innerHTML = `
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Agent ID</th>
                <th>Hostname</th>
                <th>Platform</th>
                <th>IP Address</th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>Disk %</th>
                <th>Last Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              ${agents.map(a => `
                <tr>
                  <td><span class="badge-me ${a.status === 'Online' ? 'clear' : 'down'}">${a.status}</span></td>
                  <td><code>${a.agentId}</code></td>
                  <td><strong>${a.hostname}</strong></td>
                  <td>${a.platform || a.os}</td>
                  <td><code>${a.ip}</code></td>
                  <td>${a.metrics && a.metrics.cpu != null ? a.metrics.cpu + '%' : '—'}</td>
                  <td>${a.metrics && a.metrics.memory != null ? a.metrics.memory + '%' : '—'}</td>
                  <td>${a.metrics && a.metrics.disk != null ? a.metrics.disk + '%' : '—'}</td>
                  <td>${fmtTime(a.lastHeartbeat || a.registeredAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      DOM.liveAgentsList.innerHTML = `<div style="color: var(--severity-critical);">Failed to load agents: ${e.message}</div>`;
    }
  }

  // =========================================================================
  // Probe & Alarm Operations
  // =========================================================================
  async function syncProbe(probeId) {
    const knownProbe = (state.probes || []).find((p) => String(p.id) === String(probeId));
    const probeLabel = knownProbe ? (knownProbe.displayName || knownProbe.name || 'Remote Probe') : 'Remote Probe';
    try {
      // apiJson throws on any non-2xx with the server's own message, so an
      // HTTP 404/502 from the sync endpoint can no longer fall through to
      // a success toast. Raw fetch() would not throw on those statuses.
      // NOTE: this calls /api/probes/:id/sync, NOT the legacy
      // /api/json/enterprise/syncDataFromProbe URL: server/index.js rewrites
      // /api/json/* to its legacy form (/enterprise/syncDataFromProbe) and
      // no POST route exists for that rewritten path, so the legacy URL
      // always answers 404 {"error":"not_found"} (verified live). Both URLs
      // are registered on the same handler in server/routes/probes.js; this
      // one is the reachable half. The legacy URL needs a server-side fix
      // (register the legacy path or exempt it from the rewrite).
      const res = await apiJson(`/api/probes/${probeId}/sync`, { method: 'POST' });

      // The single-probe endpoint only returns 'success' or 'error', but a
      // 'partial' status is handled honestly too (never as a success), and
      // any other non-success status is a failure, not a success.
      if (res.status && res.status !== 'success' && res.status !== 'partial') {
        showAlarmToast({
          id: `sync-${probeId}-${Date.now()}`,
          severity: 'Critical',
          deviceName: res.probe?.displayName || probeLabel,
          ip: res.probe?.ip || knownProbe?.ip || 'Probe',
          probeName: res.probe?.name || knownProbe?.name || 'Enterprise Probe',
          message: res.message || `Probe sync failed for ${probeLabel}.`
        });
        return;
      }
      const partial = res.status === 'partial';
      showAlarmToast({
        id: `sync-${probeId}-${Date.now()}`,
        severity: partial ? 'Attention' : 'Clear',
        deviceName: res.probe?.displayName || probeLabel,
        ip: res.probe?.ip || knownProbe?.ip || 'Probe',
        probeName: res.probe?.name || knownProbe?.name || 'Enterprise Probe',
        message: partial
          ? (res.message || `Probe sync partially completed for ${probeLabel}.`)
          : (res.message || 'Probe data synchronized successfully with Central.')
      });
      await fetchInitialData();
      renderCurrentView();
    } catch (e) {
      // Real failure: a Critical (red) toast carrying the server's own
      // error (e.g. "Probe 999999 not found"), never a success toast, and
      // no data refresh presented as if the sync had succeeded.
      showAlarmToast({
        id: `sync-${probeId}-${Date.now()}`,
        severity: 'Critical',
        deviceName: probeLabel,
        ip: knownProbe?.ip || 'Probe',
        probeName: knownProbe?.name || 'Enterprise Probe',
        message: `Probe sync failed: ${e.message || 'Unknown error'}`
      });
    }
  }

  async function syncAllProbes() {
    try {
      const res = await apiJson('/api/json/enterprise/syncAllProbes', { method: 'POST' });
      await fetchInitialData();
      renderCurrentView();
      if (res.status === 'partial') {
        showToastMessage(res.message || `Sync partially completed: ${res.synced || 0} of ${res.totalProbes || state.probes.length} probe(s) synchronized.`, 'Attention');
      } else if (res.status === 'success') {
        showToastMessage(res.message || `Sync completed for ${state.probes.length} probe(s).`, 'Clear');
      } else {
        showToastMessage(res.message || 'Probe sync failed.', 'Critical');
      }
    } catch (e) {
      showToastMessage('Sync failed: ' + e.message, 'Critical');
    }
  }

  async function testProbeConnection(probeId) {
    try {
      const res = await apiJson('/api/json/enterprise/testCentralConnection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probeId })
      });
      const ok = res.status === 'success';
      alert(`Link Test: ${ok ? 'Connected' : 'Failed'}\nLatency: ${res.latency != null ? res.latency + ' ms' : '—'}${res.message ? '\n' + res.message : ''}`);
    } catch (e) {
      alert('Link Test Error: ' + e.message);
    }
  }

  async function acknowledgeAlarm(alarmId) {
    try {
      const res = await apiJson('/api/json/alarms/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      if (res.status && res.status !== 'success') {
        alert(res.message || 'Ack failed on the server.');
        return;
      }
      const a = state.alarms.find(x => String(x.id) === String(alarmId));
      if (a) a.status = 'Acknowledged';
      updateHeaderBadges();
      renderCurrentView();
    } catch (e) {
      alert('Ack failed: ' + e.message);
    }
  }

  async function clearAlarm(alarmId) {
    try {
      const res = await apiJson('/api/json/alarms/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      if (res.status && res.status !== 'success') {
        alert(res.message || 'Clear failed on the server.');
        return;
      }
      state.alarms = state.alarms.filter(x => String(x.id) !== String(alarmId));
      updateHeaderBadges();
      renderCurrentView();
    } catch (e) {
      alert('Clear failed: ' + e.message);
    }
  }

  async function pushBaselineToProbes() {
    try {
      const res = await apiJson('/api/ccm/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configurationType: 'Central Baseline' })
      });
      showToastMessage(res.message || 'Central baseline push completed.', 'Clear');
      await fetchInitialData();
      renderCurrentView();
    } catch (e) {
      alert('Baseline push failed: ' + e.message);
    }
  }

  function exportInventoryCSV() {
    const devs = getFilteredDevices();
    let csv = 'Device Name,IP Address,Category,Vendor,Probe ID,CPU,Memory,ResponseTime,Status\n';
    devs.forEach(d => {
      csv += `"${d.name || ''}","${d.ip || ''}","${d.category || ''}","${d.vendor || ''}","${d.probeId || ''}","${d.cpu != null ? d.cpu + '%' : ''}","${d.memory != null ? d.memory + '%' : ''}","${d.responseTime != null ? d.responseTime + 'ms' : ''}","${d.status || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opmanager_central_inventory_${Date.now()}.csv`;
    a.click();
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  function getUtilizationColor(val) {
    if (val >= 90) return 'var(--severity-critical)';
    if (val >= 80) return 'var(--severity-trouble)';
    if (val >= 65) return 'var(--severity-attention)';
    return 'var(--severity-clear)';
  }

  function getProgressBarClass(val) {
    if (val >= 90) return 'red';
    if (val >= 80) return 'orange';
    if (val >= 65) return 'yellow';
    return 'green';
  }

  // Global Controller
  window.OpManager = {
    switchTab,
    inspectDevice,
    syncProbe,
    syncAllProbes,
    testProbeConnection,
    acknowledgeAlarm,
    clearAlarm,
    batchAcknowledge,
    batchClear,
    exportAlarmsCSV,
    pushBaselineToProbes,
    exportInventoryCSV,
    openTerminal,
    openTerminalForFirstDevice,
    openSwitchPorts,
    openSwitchPortsForFirstDevice,
    runQuickPing,
    switchSnapTab,
    openDownloadAgentModal,
    loadLiveAgentsList,
    playAlertChime: playManageEngineAlertChime,
    showAlarmToast,
    resetTopology: renderTopologyCanvas,
    renderRackView,
    renderBusinessViews,
    executeWorkflow,
    openMibBrowser,
    selectMibOid,
    executeMibGet,
    executeMibWalk,
    openConfigDiff,
    openSpotlight,
    closeSpotlight,
    renderTrapsView,
    renderSyslogView,
    loadHardwareSpecs,
    renderNcmeeDashboard,
    renderFlowAnalysisView,
    renderIpManagementView,
    renderInterfacesInventory,
    renderHostAgentsInventory,
    renderRcaView,
    renderComplianceAuditView,
    renderProbeMutualAuthView,
    renderCentralSystemInfoView
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
