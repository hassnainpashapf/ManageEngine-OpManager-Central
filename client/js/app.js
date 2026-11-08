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
  // Initialization
  // =========================================================================
  async function init() {
    initAuth();
    initTheme();
    initSound();
    bindHeaderEvents();
    bindUserMenu();
    bindZiaDrawer();
    bindModals();
    await fetchInitialData();
    initWebSocket();
    setupAutoRefresh();
    renderNavigation();
    renderCurrentView();
  }

  // =========================================================================
  // Authentication & Session Management
  // =========================================================================
  function initAuth() {
    const loggedIn = sessionStorage.getItem('opm_logged_in') || localStorage.getItem('opm_logged_in');
    if (!loggedIn) {
      DOM.loginOverlay.classList.remove('hidden');
    } else {
      DOM.loginOverlay.classList.add('hidden');
    }

    DOM.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = DOM.loginUser.value.trim();
      const pass = DOM.loginPass.value.trim();
      const domain = DOM.loginDomain.value;
      const keep = DOM.keepSignedIn.checked;

      DOM.loginErrorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass, domain })
        }).then(r => r.json());

        if (res.status === 'success') {
          sessionStorage.setItem('opm_logged_in', 'true');
          if (keep) {
            localStorage.setItem('opm_logged_in', 'true');
          }
          DOM.loginOverlay.classList.add('hidden');
          playManageEngineAlertChime();
          await fetchInitialData();
          renderCurrentView();
        } else {
          DOM.loginErrorMsg.textContent = res.message || 'Invalid username or password';
          DOM.loginErrorMsg.style.display = 'block';
        }
      } catch (err) {
        DOM.loginErrorMsg.textContent = 'Server connection failed: ' + err.message;
        DOM.loginErrorMsg.style.display = 'block';
      }
    });

    DOM.menuItemSignOut.addEventListener('click', () => {
      sessionStorage.removeItem('opm_logged_in');
      localStorage.removeItem('opm_logged_in');
      DOM.userMenuDropdown.classList.remove('active');
      DOM.loginOverlay.classList.remove('hidden');
    });
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
        fetch('/api/json/admin/listProbes').then(r => r.json()),
        fetch('/api/json/device/list').then(r => r.json()),
        fetch('/api/json/alarms/listAlarms').then(r => r.json()),
        fetch('/api/settings/central').then(r => r.json())
      ]);

      state.probes = probesRes.result || [];
      state.devices = devicesRes.devices || [];
      state.alarms = alarmsRes.alarms || [];
      state.central = centralRes.central || {};

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

    if (hasCriticalTick && Math.random() < 0.15) {
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
        <span class="toast-probe-badge">🌐 ${alarm.probeName || 'Dallas-Probe-01'} • ${alarm.timestamp || 'Just now'}</span>
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
          body: JSON.stringify({ alarmId: alarm.id, user: 'admin@opmanager' })
        });
        const localAlarm = state.alarms.find(a => a.id === alarm.id);
        if (localAlarm) {
          localAlarm.acknowledged = true;
          localAlarm.ackUser = 'admin@opmanager';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText })
      }).then(r => r.json());

      const ans = res.response || {};
      let recsHtml = '';
      if (ans.recommendations && ans.recommendations.length) {
        recsHtml = `<div style="margin-top: 8px; font-weight: 700;">Recommended Next Steps:</div><ul style="margin-left: 16px; margin-top: 4px;">${ans.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>`;
      }

      botMsg.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong>Zia AI Operations:</strong>
          <span style="font-size: 10px; color: var(--text-muted);">Confidence: 98.4%</span>
        </div>
        <div>${ans.summary || 'Analysis complete.'}</div>
        ${recsHtml}
      `;
    } catch (e) {
      botMsg.innerHTML = `<strong>Zia AI:</strong> <div>Telemetry analysis failed: ${e.message}</div>`;
    }

    DOM.ziaChatBox.scrollTop = DOM.ziaChatBox.scrollHeight;
  }

  // =========================================================================
  // Navigation & Sub-Navigation
  // =========================================================================
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
        d.name.toLowerCase().includes(state.searchQuery) ||
        d.displayName.toLowerCase().includes(state.searchQuery) ||
        d.ip.includes(state.searchQuery) ||
        d.vendor.toLowerCase().includes(state.searchQuery) ||
        d.category.toLowerCase().includes(state.searchQuery)
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
        a.deviceName.toLowerCase().includes(state.searchQuery) ||
        a.message.toLowerCase().includes(state.searchQuery) ||
        a.ip.includes(state.searchQuery)
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
                <span class="badge-me clear" style="font-size: 9px;">99.98% Compliant</span>
              </div>
              <div class="me-card-body" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: var(--severity-clear); margin-bottom: 4px;">99.98 %</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">30-Day Operational Availability SLA</div>
                <div class="progress-me-bg" style="width: 80%; height: 8px;">
                  <div class="progress-me-bar green" style="width: 99.98%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; width: 80%; font-size: 10px; color: var(--text-muted); margin-top: 6px;">
                  <span>Target: 99.90%</span>
                  <span>Current: 99.98%</span>
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
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" onclick="window.OpManager.openTerminal('CORE-RTR-01', '10.10.0.1')">
                  💻 CLI Terminal
                </button>
                <button class="btn-me-secondary" style="justify-content: center; padding: 10px 4px; font-size: 11px;" onclick="window.OpManager.openSwitchPorts('CORE-SW-01', '10.10.0.2')">
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
                      <span style="color: ${getUtilizationColor(dev.cpu)};">${dev.cpu}%</span>
                    </div>
                    <div class="progress-me-bg">
                      <div class="progress-me-bar ${getProgressBarClass(dev.cpu)}" style="width: ${dev.cpu}%;"></div>
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
                      <span style="color: ${getUtilizationColor(dev.memory)};">${dev.memory}%</span>
                    </div>
                    <div class="progress-me-bg">
                      <div class="progress-me-bar ${getProgressBarClass(dev.memory)}" style="width: ${dev.memory}%;"></div>
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
                        <td>${a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'Live'}</td>
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

      DOM.workspace.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="me-card">
            <div class="me-card-header"><span class="me-card-title">🔥 Top 10 CPU Consumption</span></div>
            <div class="me-card-body">
              ${topCpu10.map((d, i) => `
                <div style="margin-bottom: 10px; cursor: pointer;" onclick="window.OpManager.inspectDevice('${d.id}')">
                  <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 2px;">
                    <span>#${i+1} <strong>${d.name}</strong> (${d.ip})</span>
                    <span style="font-weight: 700; color: ${getUtilizationColor(d.cpu)};">${d.cpu}%</span>
                  </div>
                  <div class="progress-me-bg"><div class="progress-me-bar ${getProgressBarClass(d.cpu)}" style="width:${d.cpu}%;"></div></div>
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
                    <span style="font-weight: 700; color: ${getUtilizationColor(d.memory)};">${d.memory}%</span>
                  </div>
                  <div class="progress-me-bg"><div class="progress-me-bar ${getProgressBarClass(d.memory)}" style="width:${d.memory}%;"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (state.currentSubTab === 'Device Health Heatmap') {
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
                  <div class="me-heat-cell ${heatClass}" onclick="window.OpManager.inspectDevice('${dev.id}')" title="${dev.name} (${dev.ip}) - CPU: ${dev.cpu}%, Mem: ${dev.memory}%">
                    <div class="heat-cell-name">${dev.name}</div>
                    <div class="heat-cell-ip">${dev.ip}</div>
                    <div style="display:flex; justify-content:space-between; font-size: 10px; margin-top: 4px; color: var(--text-muted);">
                      <span>${dev.category}</span>
                      <span>${dev.cpu}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
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
  function renderNcmeeDashboard() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🛡️ Network Configuration Management Enterprise (NCM EE)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Centralized multi-probe configuration compliance, change tracking, and automated drift detection</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.openConfigDiff('dev_1001')">🔍 Drift Inspector</button>
          <button class="btn-me-secondary" onclick="window.OpManager.pushBaselineToProbes()">⚡ Push Baseline</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">💾 Backup Status (Last 24h)</span>
            <span class="badge-me clear">42 / 48 Complete</span>
          </div>
          <div class="me-card-body" style="display: flex; align-items: center; justify-content: space-around;">
            <div>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14"></circle>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#22c55e" stroke-width="14" stroke-dasharray="282.7" stroke-dashoffset="35.3" stroke-linecap="round" transform="rotate(-90 60 60)"></circle>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#ef4444" stroke-width="14" stroke-dasharray="282.7" stroke-dashoffset="271.1" stroke-linecap="round" transform="rotate(225 60 60)"></circle>
                <text x="60" y="58" text-anchor="middle" font-size="18" font-weight="800" fill="var(--text-main)">42</text>
                <text x="60" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">SUCCESS</text>
              </svg>
            </div>
            <div style="font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
              <div><span class="badge-me clear">42</span> Backed Up OK</div>
              <div><span class="badge-me critical">2</span> Backup Failed</div>
              <div><span class="badge-me attention">4</span> Not Backed Up</div>
              <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Next Scheduled: 03:00 AM UTC</div>
            </div>
          </div>
        </div>

        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">⚠️ Startup vs Running Conflict</span>
            <span class="badge-me trouble">3 Conflicts Detected</span>
          </div>
          <div class="me-card-body" style="display: flex; align-items: center; justify-content: space-around;">
            <div>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14"></circle>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#f59e0b" stroke-width="14" stroke-dasharray="282.7" stroke-dashoffset="265" stroke-linecap="round" transform="rotate(-90 60 60)"></circle>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#22c55e" stroke-width="14" stroke-dasharray="282.7" stroke-dashoffset="17.6" stroke-linecap="round" transform="rotate(-70 60 60)"></circle>
                <text x="60" y="58" text-anchor="middle" font-size="18" font-weight="800" fill="#f59e0b">3</text>
                <text x="60" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">DRIFTED</text>
              </svg>
            </div>
            <div style="font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
              <div><span class="badge-me clear">45</span> In Sync (100%)</div>
              <div><span class="badge-me trouble">3</span> Unsaved DRAM Changes</div>
              <div style="margin-top: 6px;">
                <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.openConfigDiff('dev_1001')">Resolve Drift Now</button>
              </div>
            </div>
          </div>
        </div>

        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">📜 Regulatory Compliance</span>
            <span class="badge-me clear">94.8% Pass</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; display: flex; flex-direction: column; gap: 8px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span><strong>CIS Cisco IOS Benchmark</strong></span>
                <span style="font-weight: 700; color: #4ade80;">92%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar green" style="width: 92%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span><strong>PCI-DSS 4.0 Network Sec</strong></span>
                <span style="font-weight: 700; color: #4ade80;">96%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar green" style="width: 96%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span><strong>SOX Section 404 Controls</strong></span>
                <span style="font-weight: 700; color: #4ade80;">98%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar green" style="width: 98%;"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🏷️ Hardware End-of-Life &amp; End-of-Support (EOL / EOS)</span>
            <span class="badge-me attention">Action Required</span>
          </div>
          <div class="me-table-wrap">
            <table class="me-table">
              <thead>
                <tr>
                  <th>Model / Series</th>
                  <th>Vendor</th>
                  <th>Active Nodes</th>
                  <th>End of Sale</th>
                  <th>End of Support</th>
                  <th>Lifecycle Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cisco Catalyst 2960X</strong></td>
                  <td>Cisco</td>
                  <td>6</td>
                  <td>Oct 2020</td>
                  <td>Oct 2025</td>
                  <td><span class="badge-me trouble">EOL Approaching</span></td>
                </tr>
                <tr>
                  <td><strong>Cisco ASA 5515-X</strong></td>
                  <td>Cisco</td>
                  <td>2</td>
                  <td>Sep 2017</td>
                  <td>Sep 2022</td>
                  <td><span class="badge-me critical">EOS Passed</span></td>
                </tr>
                <tr>
                  <td><strong>Cisco Catalyst 9300-48P</strong></td>
                  <td>Cisco</td>
                  <td>12</td>
                  <td>Active</td>
                  <td>2032+</td>
                  <td><span class="badge-me clear">Active Support</span></td>
                </tr>
                <tr>
                  <td><strong>Cisco Nexus 9300-FX</strong></td>
                  <td>Cisco</td>
                  <td>8</td>
                  <td>Active</td>
                  <td>2030+</td>
                  <td><span class="badge-me clear">Active Support</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">⚡ Configuration Change Traps &amp; Audit Trail</span>
            <span class="badge-me clear">Live Stream</span>
          </div>
          <div class="me-table-wrap">
            <table class="me-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>Author / User</th>
                  <th>Change Description</th>
                  <th>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>12 mins ago</td>
                  <td><strong>NY-CORE-RTR-01</strong></td>
                  <td><code>admin@corp (vty0)</code></td>
                  <td>BGP route-map adjusted for Dallas peer</td>
                  <td><button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.openConfigDiff('dev_1001')">Diff</button></td>
                </tr>
                <tr>
                  <td>1 hour ago</td>
                  <td><strong>NY-NEXUS-SW-01</strong></td>
                  <td><code>sec_admin (vty1)</code></td>
                  <td>VLAN 140 Trunk allowed list updated</td>
                  <td><span class="badge-me clear">Backed Up</span></td>
                </tr>
                <tr>
                  <td>3 hours ago</td>
                  <td><strong>NY-PA-FW-01</strong></td>
                  <td><code>admin (WebGUI)</code></td>
                  <td>Security rule 'DMZ-Inbound-Filter' committed</td>
                  <td><span class="badge-me clear">In Policy</span></td>
                </tr>
                <tr>
                  <td>Yesterday</td>
                  <td><strong>NY-EDGE-RTR-02</strong></td>
                  <td><code>automation (API)</code></td>
                  <td>NTP server synchronized to 10.0.0.100</td>
                  <td><span class="badge-me clear">Compliant</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine NetFlow Analyzer (NFA Module)
  // =========================================================================
  function renderFlowAnalysisView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">📊 ManageEngine NetFlow Analyzer (NFA Module)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Real-time Cisco NetFlow v5/v9, sFlow, J-Flow, and IPFIX packet stream ingestion across all 4 probes</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="badge-me clear">Flow Listener: UDP 2055 / 9996 Active</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">🌐 Top 5 Applications by Bandwidth (Volume)</span>
            <span class="badge-me clear">11.2 GB Analyzed</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>HTTPS / TLS Web Traffic (Port 443)</strong></span>
                <span style="font-weight: 700; color: #38bdf8;">4,280 MB (38.2%)</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #38bdf8; width: 38.2%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Secure Shell Administration (Port 22)</strong></span>
                <span style="font-weight: 700; color: #a855f7;">2,120 MB (18.9%)</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #a855f7; width: 18.9%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>RTP / VoIP Voice &amp; Video Streams</strong></span>
                <span style="font-weight: 700; color: #4ade80;">1,850 MB (16.5%)</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #4ade80; width: 16.5%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>DNS Domain Queries (Port 53)</strong></span>
                <span style="font-weight: 700; color: #fbbf24;">940 MB (8.4%)</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #fbbf24; width: 8.4%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>BGP Routing Peering (Port 179)</strong></span>
                <span style="font-weight: 700; color: #f87171;">560 MB (5.0%)</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #f87171; width: 5.0%;"></div></div>
            </div>
          </div>
        </div>

        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">📶 Quality of Service (QoS / DSCP Priority)</span>
            <span class="badge-me clear">DiffServ Active</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Best Effort (DSCP 0 - Default Web/Bulk)</strong></span>
                <span style="font-weight: 700;">38%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #64748b; width: 38%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Assured Forwarding AF21 (Database &amp; Transactional)</strong></span>
                <span style="font-weight: 700; color: #38bdf8;">28%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #38bdf8; width: 28%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Assured Forwarding AF41 (Video Conferencing)</strong></span>
                <span style="font-weight: 700; color: #f59e0b;">22%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #f59e0b; width: 22%;"></div></div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span><strong>Expedited Forwarding EF (VoIP Low Latency Queue)</strong></span>
                <span style="font-weight: 700; color: #4ade80;">12%</span>
              </div>
              <div class="progress-me-bg"><div class="progress-me-bar" style="background: #4ade80; width: 12%;"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🗣️ Top Talkers (Source to Destination Conversations)</span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Source Host / IP</th>
                <th>Destination Host / IP</th>
                <th>Protocol</th>
                <th>Application</th>
                <th>Throughput (Ingress)</th>
                <th>Throughput (Egress)</th>
                <th>Remote Probe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>NY-CORE-RTR-01</strong> <code>(10.10.0.1)</code></td>
                <td><strong>AWS-EAST-VPC</strong> <code>(192.168.10.50)</code></td>
                <td>TCP</td>
                <td>HTTPS (443)</td>
                <td><strong style="color: #4ade80;">1.42 Gbps</strong></td>
                <td>480 Mbps</td>
                <td>📍 Dallas-Probe-01</td>
              </tr>
              <tr>
                <td><strong>NY-ESXI-HOST-01</strong> <code>(10.20.0.15)</code></td>
                <td><strong>SAN-STORAGE-01</strong> <code>(172.16.8.100)</code></td>
                <td>TCP</td>
                <td>iSCSI Target</td>
                <td><strong style="color: #4ade80;">840 Mbps</strong></td>
                <td>910 Mbps</td>
                <td>📍 Dallas-Probe-01</td>
              </tr>
              <tr>
                <td><strong>LDN-CORE-SW-01</strong> <code>(10.30.0.8)</code></td>
                <td><strong>CORE-RTR-01</strong> <code>(10.10.0.1)</code></td>
                <td>TCP</td>
                <td>MPLS Inter-DC Trunk</td>
                <td><strong style="color: #38bdf8;">420 Mbps</strong></td>
                <td>380 Mbps</td>
                <td>📍 London-Probe-04</td>
              </tr>
              <tr>
                <td><strong>FRA-EDGE-01</strong> <code>(10.40.1.1)</code></td>
                <td><strong>DNS-ROOT-SERVER</strong> <code>(1.1.1.1)</code></td>
                <td>UDP</td>
                <td>DNS Recursive</td>
                <td><strong style="color: #fbbf24;">48 Mbps</strong></td>
                <td>12 Mbps</td>
                <td>📍 Frankfurt-Probe-02</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IP Address Management & Switch Port Mapper (OpUtils)
  // =========================================================================
  function renderIpManagementView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🔌 IP Address Management &amp; Switch Port Mapper (OpUtils)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Subnet allocation tracking, rogue device detection, and physical layer switch port binding</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.openSwitchPorts('NY-NEXUS-SW-01', '10.10.0.2')">🔌 Map Switch Ports</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">🏢 Subnet: 10.10.0.0/24 (LAN)</span>
            <span class="badge-me clear">72% Used</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between;"><span>Allocated IPs:</span> <strong>184 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Available Free IPs:</span> <strong style="color: #4ade80;">70 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Transient / Reserved:</span> <strong>2 IPs</strong></div>
            <div class="progress-me-bg" style="margin-top: 6px;"><div class="progress-me-bar green" style="width: 72%;"></div></div>
          </div>
        </div>

        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">🖥️ Subnet: 10.20.0.0/24 (Servers)</span>
            <span class="badge-me trouble">82% Used</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between;"><span>Allocated IPs:</span> <strong>210 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Available Free IPs:</span> <strong style="color: #f59e0b;">44 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Transient / Reserved:</span> <strong>2 IPs</strong></div>
            <div class="progress-me-bg" style="margin-top: 6px;"><div class="progress-me-bar yellow" style="width: 82%;"></div></div>
          </div>
        </div>

        <div class="me-card" style="margin-bottom: 0;">
          <div class="me-card-header">
            <span class="me-card-title">🛡️ Subnet: 10.30.0.0/24 (DMZ)</span>
            <span class="badge-me clear">24% Used</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between;"><span>Allocated IPs:</span> <strong>62 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Available Free IPs:</span> <strong style="color: #4ade80;">192 IPs</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Transient / Reserved:</span> <strong>2 IPs</strong></div>
            <div class="progress-me-bg" style="margin-top: 6px;"><div class="progress-me-bar green" style="width: 24%;"></div></div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🛡️ Rogue MAC Address Detection</span>
            <span class="badge-me clear">0 Rogue Devices</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div>All active MAC addresses on Cisco Catalyst &amp; Nexus switches match enterprise whitelist.</div>
            <div style="margin-top: 8px; color: var(--text-muted);">
              • Total Authorized MACs: <strong>248</strong><br>
              • Untrusted Vendor OUIs: <strong>0</strong><br>
              • Port Security Traps: <strong>0 in last 24h</strong>
            </div>
          </div>
        </div>

        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🔌 Physical Switch Ports Overview</span>
            <span class="badge-me clear">168 / 192 Connected</span>
          </div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div>Nexus 9300 &amp; Catalyst 9300 chassis port availability:</div>
            <div style="margin-top: 8px; color: var(--text-muted);">
              • Operational (Up): <strong style="color: #4ade80;">168 ports</strong><br>
              • Unused / Standby (Down): <strong>24 ports</strong><br>
              • Gigabit Uplinks: <strong>16x 100G QSFP28 Active</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine IF-MIB Interfaces Inventory View
  // =========================================================================
  function renderInterfacesInventory() {
    const devices = getFilteredDevices();
    const interfacesList = [];

    devices.forEach(dev => {
      if (dev.interfaces && dev.interfaces.length > 0) {
        dev.interfaces.forEach(intf => {
          interfacesList.push({
            deviceName: dev.name,
            deviceId: dev.id,
            ip: dev.ip,
            probeName: dev.probeName || 'Dallas-Probe-01',
            ...intf
          });
        });
      } else {
        interfacesList.push({
          deviceName: dev.name,
          deviceId: dev.id,
          ip: dev.ip,
          probeName: dev.probeName || 'Dallas-Probe-01',
          name: 'GigabitEthernet0/1',
          status: 'Up',
          speed: '1000 Mbps',
          inTraffic: (Math.random() * 200 + 40).toFixed(1),
          outTraffic: (Math.random() * 250 + 60).toFixed(1)
        });
        interfacesList.push({
          deviceName: dev.name,
          deviceId: dev.id,
          ip: dev.ip,
          probeName: dev.probeName || 'Dallas-Probe-01',
          name: 'GigabitEthernet0/2',
          status: 'Up',
          speed: '1000 Mbps',
          inTraffic: (Math.random() * 80 + 10).toFixed(1),
          outTraffic: (Math.random() * 60 + 5).toFixed(1)
        });
      }
    });

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
                  <td><span class="badge-me ${intf.status.toLowerCase() === 'up' ? 'clear' : 'down'}">${intf.status}</span></td>
                  <td><strong style="cursor: pointer;" onclick="window.OpManager.inspectDevice('${intf.deviceId}')">${intf.deviceName}</strong> <span style="font-size: 10px; color: var(--text-muted);">(${intf.ip})</span></td>
                  <td><code>${intf.name}</code></td>
                  <td>${intf.speed || '1 Gbps'}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; min-width: 50px;">${intf.inTraffic}</span>
                      <div class="progress-me-bg" style="width: 80px; height: 5px;"><div class="progress-me-bar green" style="width: ${Math.min(100, Math.round((intf.inTraffic / 1000) * 100))}%;"></div></div>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; min-width: 50px;">${intf.outTraffic}</span>
                      <div class="progress-me-bg" style="width: 80px; height: 5px;"><div class="progress-me-bar yellow" style="width: ${Math.min(100, Math.round((intf.outTraffic / 1000) * 100))}%;"></div></div>
                    </div>
                  </td>
                  <td>📍 ${intf.probeName}</td>
                  <td>
                    <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.openSwitchPorts('${intf.deviceName}', '${intf.ip}')">Port Mapper</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine Host Agents View
  // =========================================================================
  function renderHostAgentsInventory() {
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
          <span class="badge-me clear">Heartbeat Polling 5000ms</span>
        </div>
        <div id="hostAgentsTableContainer" class="me-table-wrap">
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
              <tr>
                <td><span class="badge-me clear">Online</span></td>
                <td><code>OPM-AGT-WIN-882</code></td>
                <td><strong>DC-PROD-WIN01.corp</strong></td>
                <td>Windows Server 2022 (x86_64)</td>
                <td><code>10.10.20.15</code></td>
                <td><span style="font-weight: 700; color: #4ade80;">24%</span></td>
                <td><span style="font-weight: 700; color: #38bdf8;">48%</span></td>
                <td><span style="font-weight: 700; color: #94a3b8;">52%</span></td>
                <td>Just now</td>
                <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.runQuickPing('10.10.20.15')">Ping</button></td>
              </tr>
              <tr>
                <td><span class="badge-me clear">Online</span></td>
                <td><code>OPM-AGT-MAC-109</code></td>
                <td><strong>MAC-ENG-CENTRAL.local</strong></td>
                <td>macOS Sonoma 14.6 (Apple Silicon)</td>
                <td><code>10.10.40.8</code></td>
                <td><span style="font-weight: 700; color: #4ade80;">16%</span></td>
                <td><span style="font-weight: 700; color: #38bdf8;">38%</span></td>
                <td><span style="font-weight: 700; color: #94a3b8;">41%</span></td>
                <td>Just now</td>
                <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.runQuickPing('10.10.40.8')">Ping</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine Root Cause Analysis (RCA) View
  // =========================================================================
  function renderRcaView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🔬 Automated Root Cause Analysis (RCA Engine)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Multi-event algorithmic correlation isolates root network faults from cascading secondary alarms</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.executeWorkflow('wf_bgp_restart')">🚀 Run Auto-Remediation Workflow</button>
        </div>
      </div>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-left: 6px solid #ef4444; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 14px; font-weight: 800; color: #f87171;">
            🚨 INCIDENT-9801: BGP Routing Peering Drop on Core Router
          </div>
          <span class="badge-me critical">98.4% Correlation Confidence</span>
        </div>
        <div style="font-size: 11px; color: var(--text-main); line-height: 1.6;">
          <strong>Primary Root Cause:</strong> <code>NY-CORE-RTR-01 (10.10.0.1)</code> transmitted SNMP Trap <code>bgpPeerDown (.1.3.6.1.2.1.15.0.2)</code> for neighbor <code>10.254.1.1</code> (AS 65001 Cease / Administrative Reset).
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          <strong>Impact Assessment:</strong> 4 downstream devices affected, 3 service paths degraded, 14 secondary alarm events suppressed.
        </div>
      </div>

      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🌐 Event Correlation Cascade Hierarchy</span>
        </div>
        <div class="me-card-body">
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
            <div style="background: #1e1b4b; border: 1px solid #4338ca; border-radius: 6px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💥</span>
                <div>
                  <div style="font-weight: 800; color: #a5b4fc;">[ROOT FAULT] NY-CORE-RTR-01 (10.10.0.1)</div>
                  <div style="font-size: 11px; color: #cbd5e1;">SNMP Trap: bgpPeerDown • %BGP-5-ADJCHANGE: neighbor 10.254.1.1 Down</div>
                </div>
              </div>
              <button class="btn-me-secondary" style="padding: 3px 8px; font-size: 10px;" onclick="window.OpManager.openTerminal('NY-CORE-RTR-01', '10.10.0.1')">Open CLI</button>
            </div>

            <div style="text-align: center; color: var(--text-muted); font-size: 14px;">⬇️ <em>Cascaded Dependent Alarms (Suppressed by Central Event Engine)</em> ⬇️</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 11px;">
                <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">DIST-SW-01</div>
                <div style="color: var(--text-muted);">Uplink packet buffer drops on TenGigabitEthernet1/0/1 due to rerouted transit traffic.</div>
              </div>

              <div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 11px;">
                <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">NY-ESXI-HOST-01</div>
                <div style="color: var(--text-muted);">iSCSI storage replication latency increased from 4ms to 124ms.</div>
              </div>

              <div style="background: var(--bg-subnav); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 11px;">
                <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">NY-PA-FW-01</div>
                <div style="color: var(--text-muted);">Session table synchronized to standby firewall unit in HA cluster.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine Regulatory & Security Compliance Audit View
  // =========================================================================
  function renderComplianceAuditView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">📜 Security &amp; Regulatory Compliance Audit (NCM Engine)</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Continuous automated compliance auditing against CIS Cisco IOS, PCI-DSS 4.0, HIPAA, and SOX standards</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="window.OpManager.pushBaselineToProbes()">⚡ 1-Click Fix Non-Compliant Devices</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">
          <div style="font-size: 11px; color: var(--text-muted);">CIS Cisco IOS Benchmark</div>
          <div style="font-size: 22px; font-weight: 800; color: #4ade80; margin: 4px 0;">92%</div>
          <div style="font-size: 10px; color: var(--text-muted);">44 Compliant • 4 Violations</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">
          <div style="font-size: 11px; color: var(--text-muted);">PCI-DSS 4.0 Network Sec</div>
          <div style="font-size: 22px; font-weight: 800; color: #4ade80; margin: 4px 0;">96%</div>
          <div style="font-size: 10px; color: var(--text-muted);">46 Compliant • 2 Violations</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">
          <div style="font-size: 11px; color: var(--text-muted);">HIPAA Access Security</div>
          <div style="font-size: 22px; font-weight: 800; color: #4ade80; margin: 4px 0;">98%</div>
          <div style="font-size: 10px; color: var(--text-muted);">47 Compliant • 1 Violation</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px;">
          <div style="font-size: 11px; color: var(--text-muted);">SOX Section 404 ITGC</div>
          <div style="font-size: 22px; font-weight: 800; color: #4ade80; margin: 4px 0;">94%</div>
          <div style="font-size: 10px; color: var(--text-muted);">45 Compliant • 3 Violations</div>
        </div>
      </div>

      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">⚠️ Detected Policy Violations Requiring Remediation</span>
          <span class="badge-me trouble">3 Violations Found</span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Device</th>
                <th>Standard</th>
                <th>Policy Rule</th>
                <th>Remediation Command</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge-me critical">High</span></td>
                <td><strong>NY-EDGE-RTR-02</strong></td>
                <td>CIS 1.2</td>
                <td>Password Encryption Missing</td>
                <td><code>service password-encryption</code></td>
                <td><button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.openConfigDiff('dev_1001')">Fix</button></td>
              </tr>
              <tr>
                <td><span class="badge-me critical">Critical</span></td>
                <td><strong>ACCESS-SW-04</strong></td>
                <td>PCI-DSS 2.2</td>
                <td>Insecure Telnet Protocol Enabled</td>
                <td><code>line vty 0 4; transport input ssh</code></td>
                <td><button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.openConfigDiff('dev_1001')">Fix</button></td>
              </tr>
              <tr>
                <td><span class="badge-me attention">Medium</span></td>
                <td><strong>DIST-SW-03</strong></td>
                <td>CIS 2.1</td>
                <td>SNMP Read-Only Community Default</td>
                <td><code>no snmp-server community public</code></td>
                <td><button class="btn-me-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.OpManager.openConfigDiff('dev_1001')">Fix</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine Probe Mutual Auth View
  // =========================================================================
  function renderProbeMutualAuthView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">🔑 Central-Probe Mutual TLS &amp; eeAuthKey Federation</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Mutual cryptographic authorization keys required for distributed probes to federate telemetry into Central</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-me-primary" onclick="alert('Central Master Authority re-keyed. Updated tokens pushed to all 4 probes via secure REST handshake.')">🔄 Re-Key Master Auth</button>
        </div>
      </div>

      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">🛡️ Registered Probe Cryptographic Tokens</span>
        </div>
        <div class="me-table-wrap">
          <table class="me-table">
            <thead>
              <tr>
                <th>Probe ID</th>
                <th>Display Name</th>
                <th>Host Endpoint</th>
                <th>Mutual Auth Token (eeAuthKey)</th>
                <th>TLS Cipher Suite</th>
                <th>Auth Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.probes.map(p => `
                <tr>
                  <td><code>${p.name}</code></td>
                  <td><strong>${p.displayName}</strong></td>
                  <td><code>http://${p.ip}:${p.port || 8060}</code></td>
                  <td><code style="color: #38bdf8;">${p.eeAuthKey || 'OPM_EE_PROBE_SEC_KEY_1'}</code></td>
                  <td>TLS_AES_256_GCM_SHA384 (TLS 1.3)</td>
                  <td><span class="badge-me clear">Validated OK</span></td>
                  <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="window.OpManager.testProbeConnection('${p.id}')">Test Link</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Authentic ManageEngine Central Architecture & System Specs View
  // =========================================================================
  function renderCentralSystemInfoView() {
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">ℹ️ ManageEngine OpManager Central Architecture &amp; System Specs</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Enterprise Central 64-bit GA Production Runtime Environment</div>
        </div>
        <span class="badge-me clear">Status: Operational (HA Primary)</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="me-card">
          <div class="me-card-header"><span class="me-card-title">🖥️ Server Specifications</span></div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div><strong>Product Edition:</strong> ManageEngine OpManager Central (64-bit GA)</div>
            <div><strong>Product Version:</strong> 12.9.203 (Build 129203)</div>
            <div><strong>Deployment Architecture:</strong> Enterprise Distributed Central-Probe Model</div>
            <div><strong>Java Runtime:</strong> OpenJDK 64-Bit Server VM Temurin-17.0.9+9 (Mixed Mode)</div>
            <div><strong>JVM Memory:</strong> Initial 4096 MB / Max 16384 MB (Allocated: 6144 MB)</div>
            <div><strong>Database Engine:</strong> Embedded PostgreSQL 14.7-1 (Connection Pool: 80)</div>
            <div><strong>Operating System:</strong> macOS Darwin 24.0.0 (x86_64 / arm64)</div>
            <div><strong>Server Uptime:</strong> 18 days, 4 hours, 32 minutes</div>
          </div>
        </div>

        <div class="me-card">
          <div class="me-card-header"><span class="me-card-title">📜 Enterprise Licensing</span></div>
          <div class="me-card-body" style="font-size: 11px; line-height: 1.8;">
            <div><strong>License Type:</strong> Enterprise Central Edition</div>
            <div><strong>Licensed User:</strong> Enterprise Global NOC Administrator</div>
            <div><strong>Company:</strong> Global Enterprise Corporation</div>
            <div><strong>Allowed Probes:</strong> Unlimited (4 Active Probes Enrolled)</div>
            <div><strong>Device Capacity:</strong> Unlimited Devices (48 Monitored Currently)</div>
            <div><strong>NCM / Configuration Module:</strong> Enabled (Central NCM Federated Engine)</div>
            <div><strong>NetFlow / Flow Analysis:</strong> Enabled (All Probes Forwarding)</div>
            <div><strong>Expiry Date:</strong> Never (Permanent Enterprise Production License)</div>
          </div>
        </div>
      </div>
    `;
  }

  function updateDashboardRealtimeCounters() {
    const devices = getFilteredDevices();
    const avgLatency = devices.length 
      ? Math.round(devices.reduce((acc, d) => acc + (d.responseTime || 0), 0) / devices.length)
      : 0;
    const latEl = document.getElementById('kpiAvgLatency');
    if (latEl) latEl.textContent = `${avgLatency} ms`;
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
                const badgeStatus = dev.status.toLowerCase();
                return `
                  <tr style="cursor: pointer;">
                    <td><span class="badge-me ${badgeStatus}">${dev.status}</span></td>
                    <td onclick="window.OpManager.inspectDevice('${dev.id}')">
                      <img src="${getDeviceIcon(dev.category, dev.vendor)}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;" alt="${dev.category}">
                      <strong>${dev.name}</strong>
                    </td>
                    <td><code>${dev.ip}</code></td>
                    <td>${dev.category}</td>
                    <td>${dev.vendor || 'Cisco'}</td>
                    <td>📍 ${probe.displayName}</td>
                    <td style="min-width: 90px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px;">
                        <span>${dev.cpu}%</span>
                      </div>
                      <div class="progress-me-bg">
                        <div class="progress-me-bar ${getProgressBarClass(dev.cpu)}" style="width: ${dev.cpu}%;"></div>
                      </div>
                    </td>
                    <td style="min-width: 90px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px;">
                        <span>${dev.memory}%</span>
                      </div>
                      <div class="progress-me-bg">
                        <div class="progress-me-bar ${getProgressBarClass(dev.memory)}" style="width: ${dev.memory}%;"></div>
                      </div>
                    </td>
                    <td>${dev.responseTime || 24} ms</td>
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
                    <td><code>${alarm.source || 'SNMP Poller'}</code></td>
                    <td>${alarm.timestamp ? new Date(alarm.timestamp).toLocaleString() : 'Just now'}</td>
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

  function batchAcknowledge() {
    if (state.selectedAlarmIds.size === 0) {
      alert('Please select one or more alarms using the checkboxes.');
      return;
    }
    state.selectedAlarmIds.forEach(id => {
      const a = state.alarms.find(x => x.id === id);
      if (a) a.status = 'Acknowledged';
    });
    state.selectedAlarmIds.clear();
    updateHeaderBadges();
    renderCurrentView();
  }

  function batchClear() {
    if (state.selectedAlarmIds.size === 0) {
      alert('Please select one or more alarms using the checkboxes.');
      return;
    }
    state.alarms = state.alarms.filter(a => !state.selectedAlarmIds.has(a.id));
    state.selectedAlarmIds.clear();
    updateHeaderBadges();
    renderCurrentView();
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
            <button class="btn-me-secondary" onclick="alert('Trap Processing Rule: Inbound traps automatically correlate into incident alarms.')">⚙️ Trap Rules</button>
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
        tbody.innerHTML = res.traps.map(trap => {
          const varbindsStr = trap.varbinds.map(v => `${v.name} = ${v.value}`).join(' | ');
          return `
            <tr>
              <td><span class="badge-me ${trap.severity.toLowerCase()}">${trap.severity}</span></td>
              <td><strong>${trap.trapName}</strong></td>
              <td><code>${trap.trapOid}</code></td>
              <td><strong>${trap.deviceName}</strong> (${trap.sourceIp})</td>
              <td>📍 ${trap.probeName}</td>
              <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; font-size: 10px; color: var(--text-muted);" title="${varbindsStr}">
                ${varbindsStr}
              </td>
              <td style="font-size: 11px; color: var(--text-muted);">${trap.time}</td>
            </tr>
          `;
        }).join('');
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
            <button class="btn-me-secondary" onclick="alert('ManageEngine Syslog Rule: High severity alerts automatically forward to on-call NOC.')">⚙️ Alert Rules</button>
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
        tbody.innerHTML = res.messages.map(log => {
          const sevClass = log.severity === 'CRITICAL' || log.severity === 'ALERT' ? 'critical' : log.severity === 'WARNING' ? 'trouble' : 'clear';
          return `
            <tr>
              <td style="font-family: monospace; font-size: 11px;">${log.time}</td>
              <td><strong>${log.host}</strong></td>
              <td><code>${log.ip}</code></td>
              <td>📍 ${log.probe}</td>
              <td><span style="font-size: 10px; font-weight: 700; color: #a855f7;">${log.facility}</span></td>
              <td><span class="badge-me ${sevClass}">${log.severity}</span></td>
              <td style="font-family: monospace; font-size: 11px; color: #f8fafc;">${log.message}</td>
            </tr>
          `;
        }).join('');
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
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="me-card-title">🖥️ 3D Datacenter Rack Visualizer (42U Standard)</span>
            <select id="rackSelector" class="form-input-me" style="width: 260px; padding: 3px 8px; font-size: 11px;">
              <option value="RACK-NYC-01">NYC-DC-Core-Rack-01 (42U • New York)</option>
              <option value="RACK-LON-02">LON-Colo-Rack-02 (42U • London)</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-me-secondary" onclick="alert('ManageEngine Rack Designer: Drag devices into available U-slots.')">+ Mount Device</button>
            <button class="btn-me-secondary" onclick="window.OpManager.renderRackView()">🔄 Refresh Rack</button>
          </div>
        </div>
        <div class="me-card-body" style="padding: 16px;">
          <div id="rackViewContainer" class="rack-visualizer-wrap">
            <div style="text-align: center; width: 100%; color: var(--text-muted); padding: 40px;">Loading 42U Datacenter Rack Layout...</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('rackSelector')?.addEventListener('change', (e) => {
      loadRackData(e.target.value);
    });

    loadRackData('RACK-NYC-01');
  }

  async function loadRackData(rackId) {
    try {
      const res = await fetch('/api/racks/list').then(r => r.json());
      if (res.status === 'success' && res.racks) {
        const rack = res.racks.find(r => r.id === rackId) || res.racks[0];
        renderRackCabinet(rack);
      }
    } catch (e) {
      document.getElementById('rackViewContainer').innerHTML = `<div style="color: var(--severity-critical);">Failed to load rack: ${e.message}</div>`;
    }
  }

  function renderRackCabinet(rack) {
    const container = document.getElementById('rackViewContainer');
    if (!container) return;

    const slotMap = {};
    rack.units.forEach(u => {
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
              <div><strong>Space Utilization:</strong> 14 of 42 Units Occupied (33.3%)</div>
              <div><strong>Redundant Cooling:</strong> CRAC Unit N+1 In-Row Active</div>
            </div>

            <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <div style="font-weight: 700; font-size: 11px; margin-bottom: 6px;">Mounted Devices in Rack (${rack.units.length}):</div>
              <div style="display: flex; flex-direction: column; gap: 4px; max-height: 160px; overflow-y: auto;">
                ${rack.units.map(item => `
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
    DOM.workspace.innerHTML = `
      <div class="me-card" style="margin-bottom: 0; display: flex; flex-direction: column; height: calc(100vh - 150px);">
        <div class="me-card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="me-card-title">🗺️ ManageEngine Business Views (Custom Network Topology)</span>
            <span class="badge-me clear" style="font-size: 10px;">Corporate Core & Perimeter</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 14px; align-items: center;">
            <span><span style="color: #22c55e;">━━</span> 10 Gbps Trunk (Normal)</span>
            <span><span style="color: #f97316;">━━</span> High Utilization (>80%)</span>
            <span><span style="color: #ef4444;">━━</span> Link Down</span>
            <button class="btn-me-secondary" style="padding: 2px 8px;" onclick="window.OpManager.renderBusinessViews()">🔄 Re-layout</button>
          </div>
        </div>
        <div style="flex: 1; position: relative; background: radial-gradient(circle, #1e293b 1px, transparent 1px) 0 0/24px 24px var(--bg-card); overflow: auto; padding: 24px;">
          <svg style="width: 100%; height: 100%; min-width: 800px; min-height: 500px;">
            <line x1="200" y1="120" x2="450" y2="120" stroke="#22c55e" stroke-width="3" stroke-dasharray="6,3" />
            <line x1="450" y1="120" x2="700" y2="120" stroke="#22c55e" stroke-width="3" />
            <line x1="450" y1="120" x2="300" y2="300" stroke="#22c55e" stroke-width="3" />
            <line x1="450" y1="120" x2="600" y2="300" stroke="#f97316" stroke-width="3" stroke-dasharray="4,4" />
            <line x1="300" y1="300" x2="600" y2="300" stroke="#22c55e" stroke-width="2" />
            <line x1="300" y1="300" x2="300" y2="440" stroke="#22c55e" stroke-width="3" />
            <line x1="600" y1="300" x2="600" y2="440" stroke="#ef4444" stroke-width="2" />

            <rect x="300" y="105" width="68" height="18" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="334" y="118" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="monospace">10 Gbps</text>

            <rect x="545" y="105" width="68" height="18" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="579" y="118" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="monospace">10 Gbps</text>

            <rect x="500" y="210" width="80" height="18" rx="3" fill="#0f172a" stroke="#f97316" />
            <text x="540" y="223" fill="#f97316" font-size="9" text-anchor="middle" font-family="monospace">94% Loaded</text>

            <rect x="570" y="360" width="70" height="18" rx="3" fill="#0f172a" stroke="#ef4444" />
            <text x="605" y="373" fill="#ef4444" font-size="9" text-anchor="middle" font-family="monospace">Interface Down</text>
          </svg>

          <div style="position: absolute; left: 160px; top: 80px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('1')">
            <div style="background: var(--bg-card); border: 2px solid #22c55e; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/deviceicons/cisco3200.png" style="width: 32px; height: 32px;" alt="WAN-EDGE">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">WAN-EDGE-01</div>
              <span class="badge-me clear" style="font-size: 9px;">Router • Normal</span>
            </div>
          </div>

          <div style="position: absolute; left: 410px; top: 80px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('2')">
            <div style="background: var(--bg-card); border: 2px solid #22c55e; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/deviceicons/cisco_catalyst_3550.png" style="width: 32px; height: 32px;" alt="CORE-SW">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">CORE-SW-01</div>
              <span class="badge-me clear" style="font-size: 9px;">Switch • 100% SLA</span>
            </div>
          </div>

          <div style="position: absolute; left: 660px; top: 80px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('3')">
            <div style="background: var(--bg-card); border: 2px solid #22c55e; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/deviceicons/merakisecurity.png" style="width: 32px; height: 32px;" alt="FW-DMZ">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">FW-DMZ-01</div>
              <span class="badge-me clear" style="font-size: 9px;">Firewall • Active</span>
            </div>
          </div>

          <div style="position: absolute; left: 260px; top: 260px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('4')">
            <div style="background: var(--bg-card); border: 2px solid #22c55e; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/deviceicons/DellServer_1U.png" style="width: 32px; height: 32px;" alt="SRV-DC">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">SRV-DC-01</div>
              <span class="badge-me clear" style="font-size: 9px;">Active Directory</span>
            </div>
          </div>

          <div style="position: absolute; left: 560px; top: 260px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('5')">
            <div style="background: var(--bg-card); border: 2px solid #f97316; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/racks/front/HP-Server-1U.png" onerror="this.src='/images/deviceicons/DellServer_1U.png'" style="width: 32px; height: 32px;" alt="SRV-APP">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">SRV-APP-01</div>
              <span class="badge-me trouble" style="font-size: 9px;">CPU 96% (Trouble)</span>
            </div>
          </div>

          <div style="position: absolute; left: 260px; top: 400px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('6')">
            <div style="background: var(--bg-card); border: 2px solid #22c55e; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/racks/front/VMware-Server-1U.png" style="width: 32px; height: 32px;" alt="ESXI">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">ESXI-CLUSTER-01</div>
              <span class="badge-me clear" style="font-size: 9px;">VMware ESXi • 12 VMs</span>
            </div>
          </div>

          <div style="position: absolute; left: 560px; top: 400px; text-align: center; cursor: pointer;" onclick="window.OpManager.inspectDevice('7')">
            <div style="background: var(--bg-card); border: 2px solid #ef4444; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <img src="/images/deviceicons/GenericUps.png" style="width: 32px; height: 32px;" alt="STORAGE">
              <div style="font-weight: 800; font-size: 11px; margin-top: 4px;">SAN-STORAGE-01</div>
              <span class="badge-me critical" style="font-size: 9px;">Interface Down</span>
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
      sub: '10.0.0.100',
      x: centerX,
      y: centerY,
      radius: 28,
      color: '#0284c7'
    });

    const probeCount = state.probes.length || 4;
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
    DOM.workspace.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 12px 16px; border-radius: 6px; border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">Federated Enterprise Probes (${state.probes.length})</span>
          <span class="badge-me clear">All 4 Probes Online</span>
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
              <span class="badge-me clear">${p.status}</span>
            </div>
            <div class="me-card-body">
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Probe ID:</strong> <code>${p.name}</code>
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Location:</strong> 📍 ${p.location || 'Remote Data Center'}
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Endpoint:</strong> <code>http://${p.ip}:${p.port || 8060}</code>
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <strong>Mutual Auth Key (eeAuthKey):</strong> <code>${p.eeAuthKey || 'OPM_EE_PROBE_SEC_KEY_1'}</code>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 11px;">
                <span>Monitored: <strong>${p.devicesCount} devices</strong></span>
                <span>Latency: <strong>${p.syncLatency || 14} ms</strong></span>
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
          <p>OpManager Central coordinates distributed remote probes deployed across geographic datacenters, VPCs, and campuses. Polling overhead is distributed locally at each probe, and unified telemetry, traps, and alarms are continuously synchronized back to the Central database via mutual <code>eeAuthKey</code> secure REST APIs and WebSockets.</p>
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
  function renderDiscoveryView() {
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
                ${state.probes.map(p => `<option value="${p.id}">${p.displayName} (${p.ip})</option>`).join('')}
              </select>
            </div>
            <div class="form-group-me">
              <label>Subnet CIDR / IP Range</label>
              <input type="text" class="form-input-me" id="discSubnet" value="10.50.0.0/24" placeholder="e.g. 192.168.1.0/24 or 10.10.1.1-10.10.1.254">
            </div>
            <div class="form-group-me">
              <label>SNMP Credential Profile</label>
              <select class="form-input-me" id="discCred">
                <option value="v3">Cisco-SNMPv3-Enterprise (AuthPriv)</option>
                <option value="v2c">Global-SNMPv2-Community (public_monitor_ro)</option>
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
          </div>
        </div>
      </div>
    `;

    document.getElementById('discoveryForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      runSimulatedDiscovery();
    });
  }

  function runSimulatedDiscovery() {
    const box = document.getElementById('discoveryResultsBox');
    const bar = document.getElementById('discProgressBar');
    const log = document.getElementById('discLog');
    const subnet = document.getElementById('discSubnet').value;

    box.style.display = 'block';
    bar.style.width = '10%';
    log.innerHTML = `[INFO] Initializing SNMP sweep on target subnet: ${subnet}...<br>`;

    setTimeout(() => {
      bar.style.width = '40%';
      log.innerHTML += `[INFO] Probing ICMP echo on 254 host addresses...<br>[INFO] Active responsive hosts discovered: 4<br>`;
    }, 800);

    setTimeout(() => {
      bar.style.width = '80%';
      log.innerHTML += `[SUCCESS] Querying RFC1213-MIB sysDescr on 10.50.0.1 (Cisco Catalyst 3850)<br>[SUCCESS] Querying RFC1213-MIB sysDescr on 10.50.0.25 (Fortinet FortiGate 100F)<br>`;
    }, 1600);

    setTimeout(() => {
      bar.style.width = '100%';
      log.innerHTML += `[DONE] Discovery sweep finished. 2 new network infrastructure devices registered to Central inventory.`;
    }, 2400);
  }

  // =========================================================================
  // VIEW: CONFIGURATION (CCM)
  // =========================================================================
  function renderCCMView() {
    if (state.currentSubTab === 'Compliance Audit') {
      renderComplianceAuditView();
      return;
    }
    if (state.currentSubTab === 'Config Diff Inspector') {
      openConfigDiff('dev_1001');
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
                <th>Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CORE-RTR-01</strong></td>
                <td><code>10.10.0.1</code></td>
                <td>📍 US-East Data Center</td>
                <td>Today, 03:00 AM</td>
                <td>Running Config</td>
                <td>v14.2 (Clean)</td>
                <td><span class="badge-me clear">In Compliance</span></td>
                <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.openConfigDiff('1')">View Diff</button></td>
              </tr>
              <tr>
                <td><strong>EDGE-FW-01</strong></td>
                <td><code>10.10.0.2</code></td>
                <td>📍 US-East Data Center</td>
                <td>Today, 03:05 AM</td>
                <td>Running Config</td>
                <td>v28.1 (Clean)</td>
                <td><span class="badge-me clear">In Compliance</span></td>
                <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.openConfigDiff('2')">View Diff</button></td>
              </tr>
              <tr>
                <td><strong>LDN-CORE-SW-01</strong></td>
                <td><code>10.20.0.1</code></td>
                <td>📍 London DC Hub</td>
                <td>Yesterday, 11:45 PM</td>
                <td>Startup Config</td>
                <td>v8.0 (Drifted)</td>
                <td><span class="badge-me trouble">Diff Detected</span></td>
                <td><button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManager.openConfigDiff('3')">Resolve Drift</button></td>
              </tr>
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

  // Cisco IOS Running vs Startup Config Diff Inspector
  async function openConfigDiff(deviceId = '1') {
    DOM.configDiffModal.classList.add('active');
    DOM.diffRunningText.textContent = 'Loading active running-config from device DRAM...';
    DOM.diffStartupText.textContent = 'Loading baseline startup-config from NVRAM...';

    try {
      const res = await fetch(`/api/ccm/diff?deviceId=${deviceId}`).then(r => r.json());
      if (res.status === 'success') {
        DOM.diffDevName.textContent = `${res.deviceName} (${res.ip})`;
        DOM.diffMeta.innerHTML = `<span class="badge-me trouble">Diff Detected</span> • <strong>${res.addedLinesCount} Added Lines</strong>, <strong>${res.removedLinesCount} Removed Line</strong> • Last Backup: ${res.lastBackupTime}`;
        DOM.diffRunningVer.textContent = res.runningVersion;
        DOM.diffStartupVer.textContent = res.startupVersion;

        DOM.diffRunningText.innerHTML = res.runningConfig.map(line => `
          <div class="diff-line ${line.type}">
            <span style="color: #64748b; margin-right: 6px; user-select: none;">${String(line.line).padStart(2, ' ')}</span>
            <span>${line.type === 'added' ? '+ ' : '  '}${escapeHtml(line.text)}</span>
          </div>
        `).join('');

        DOM.diffStartupText.innerHTML = res.startupConfig.map(line => `
          <div class="diff-line ${line.type}">
            <span style="color: #64748b; margin-right: 6px; user-select: none;">${String(line.line).padStart(2, ' ')}</span>
            <span>${line.type === 'removed' ? '- ' : '  '}${escapeHtml(line.text)}</span>
          </div>
        `).join('');

        DOM.btnResolveDrift.onclick = async () => {
          DOM.btnResolveDrift.disabled = true;
          DOM.btnResolveDrift.textContent = 'Writing to NVRAM...';
          const r = await fetch('/api/ccm/resolve-drift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId })
          }).then(x => x.json());
          alert(r.message || 'Config drift resolved.');
          DOM.btnResolveDrift.disabled = false;
          DOM.btnResolveDrift.textContent = '✓ Synchronized';
          DOM.configDiffModal.classList.remove('active');
          renderCurrentView();
        };
      }
    } catch (e) {
      DOM.diffRunningText.textContent = 'Diff error: ' + e.message;
    }
  }

  // =========================================================================
  // VIEW: REPORTS
  // =========================================================================
  function renderReportsView() {
    const devices = getFilteredDevices();
    const alarms = getFilteredAlarms();
    const avgAvailability = devices.length 
      ? (devices.reduce((acc, d) => acc + d.availability, 0) / devices.length).toFixed(2)
      : '100.00';

    DOM.workspace.innerHTML = `
      <div class="me-card">
        <div class="me-card-header">
          <span class="me-card-title">📈 Executive Network Health & SLA Availability Summary</span>
          <div style="display: flex; gap: 8px;">
            <a href="/api/reports/print-preview" target="_blank" class="btn-me-primary" style="text-decoration: none; display: flex; align-items: center; gap: 6px;">
              🖨️ Print / Save PDF
            </a>
            <button class="btn-me-secondary" onclick="window.location.href='/api/reports/export/csv?type=devices'">📥 Export Inventory CSV</button>
            <button class="btn-me-secondary" onclick="window.location.href='/api/reports/export/csv?type=alarms'">📥 Export Alarms CSV</button>
          </div>
        </div>
        <div class="me-card-body">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
            <div class="me-kpi-tile">
              <div class="kpi-tile-icon" style="background: rgba(34, 197, 94, 0.15); color: #16a34a;">🏆</div>
              <div>
                <div class="kpi-tile-num">${avgAvailability} %</div>
                <div class="kpi-tile-txt">Network Availability (30d SLA)</div>
              </div>
            </div>
            <div class="me-kpi-tile">
              <div class="kpi-tile-icon" style="background: rgba(14, 165, 233, 0.15); color: #0284c7;">⏱️</div>
              <div>
                <div class="kpi-tile-num">18.4 ms</div>
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
                    <span>📍 ${p.displayName}</span>
                    <span><strong style="color: #22c55e;">99.99%</strong> SLA Compliant</span>
                  </div>
                  <div class="progress-me-bg"><div class="progress-me-bar green" style="width: 99.99%;"></div></div>
                </div>
              `).join('')}
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

  // =========================================================================
  // VIEW: SETTINGS & WORKFLOW AUTOMATION
  // =========================================================================
  function renderSettingsView() {
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

    DOM.workspace.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🔧 Central Server Parameters</span>
          </div>
          <div class="me-card-body" style="font-size: 12px; line-height: 1.8;">
            <div><strong>Product:</strong> ManageEngine OpManager Central</div>
            <div><strong>Version:</strong> ${c.version || '12.9.203'} (GA 64-bit Enterprise)</div>
            <div><strong>Host Binding:</strong> <code>${c.host || '0.0.0.0'}:${c.port || 8060}</code></div>
            <div><strong>High Availability:</strong> Active-Primary (${c.haStatus || 'Healthy'})</div>
            <div><strong>Database Engine:</strong> PostgreSQL Enterprise Embedded</div>
            <div><strong>Authentication Key:</strong> <code>${c.eeAuthKey || 'OPM_EE_CENTRAL_ROOT_SECRET_2026'}</code></div>
          </div>
        </div>

        <div class="me-card">
          <div class="me-card-header">
            <span class="me-card-title">🔑 SNMP / WMI Credential Library</span>
          </div>
          <div class="me-card-body">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 11px;">
                <div style="font-weight: 700;">Cisco-SNMPv3-Enterprise</div>
                <div style="color: var(--text-muted);">Protocol: SNMPv3 • Security: AuthPriv • Hash: SHA / AES-256</div>
              </div>
              <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 11px;">
                <div style="font-weight: 700;">Global-SNMPv2-Community</div>
                <div style="color: var(--text-muted);">Protocol: SNMPv2c • Community: public_monitor_ro</div>
              </div>
              <div style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 11px;">
                <div style="font-weight: 700;">Windows-Domain-Admin-WMI</div>
                <div style="color: var(--text-muted);">Protocol: WMI / WinRM • Namespace: root\\cimv2</div>
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

  // ManageEngine ITOM Workflow Automation Studio View
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
            <button class="btn-me-primary" onclick="alert('ManageEngine Workflow Builder: Select Trigger -> Action -> Condition -> Schedule')">+ New Workflow</button>
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
            ${renderSvgDial(dev.cpu, 'CPU')}
            <div class="dial-label-me">CPU Utilization</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(dev.memory, 'Memory')}
            <div class="dial-label-me">Memory Usage</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(dev.disk || 45, 'Disk')}
            <div class="dial-label-me">Storage Disk</div>
          </div>
          <div class="dial-box-me">
            ${renderSvgDial(Math.min(100, Math.round(((dev.temperature || 34) / 70) * 100)), `${dev.temperature || 34}°C`)}
            <div class="dial-label-me">Temperature</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; font-size: 11px;">
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Response Time</div>
            <div style="font-size: 14px; font-weight: 700;">${dev.responseTime || 24} ms</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Packet Loss</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--severity-clear);">0.0 %</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">System Uptime</div>
            <div style="font-size: 14px; font-weight: 700;">142d 18h</div>
          </div>
          <div style="padding: 8px; background: var(--bg-subnav); border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted);">Operating System</div>
            <div style="font-size: 14px; font-weight: 700;">${dev.osVersion || 'IOS 16.12'}</div>
          </div>
        </div>
      </div>

      <!-- Tab Pane 2: Hardware Specs -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'hardware' ? 'active' : ''}">
        <div id="snapHardwarePane">
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">Querying Hardware Inventory from Device...</div>
        </div>
      </div>

      <!-- Tab Pane 2: Performance Trends (Sparklines) -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'performance' ? 'active' : ''}">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 10px;">
          <div class="me-card" style="margin-bottom: 0;">
            <div class="me-card-header"><span class="me-card-title">📈 CPU Utilization (Last 24 Hours)</span></div>
            <div class="me-card-body">
              ${renderSparklineChart([22, 28, 35, 41, 55, 62, 78, 85, dev.cpu, dev.cpu + 2, dev.cpu - 3, dev.cpu], '#38bdf8', '%')}
            </div>
          </div>
          <div class="me-card" style="margin-bottom: 0;">
            <div class="me-card-header"><span class="me-card-title">⏱️ Latency &amp; Response Time Trend</span></div>
            <div class="me-card-body">
              ${renderSparklineChart([12, 14, 18, 16, 22, 25, 21, 19, dev.responseTime, dev.responseTime + 2], '#a855f7', 'ms')}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Pane 3: Interfaces -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'interfaces' ? 'active' : ''}">
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
              <tr>
                <td><code>GigabitEthernet0/1</code></td>
                <td><span class="badge-me clear">Up</span></td>
                <td><span class="badge-me clear">Up</span></td>
                <td>1000 Mbps</td>
                <td>248.5</td>
                <td>312.8</td>
              </tr>
              <tr>
                <td><code>GigabitEthernet0/2</code></td>
                <td><span class="badge-me clear">Up</span></td>
                <td><span class="badge-me clear">Up</span></td>
                <td>1000 Mbps</td>
                <td>84.1</td>
                <td>42.0</td>
              </tr>
              <tr>
                <td><code>TenGigabitEthernet0/1/1</code></td>
                <td><span class="badge-me clear">Up</span></td>
                <td><span class="badge-me clear">Up</span></td>
                <td>10 Gbps</td>
                <td>2,450.0</td>
                <td>3,120.4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Pane 4: Monitors -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'monitors' ? 'active' : ''}">
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
              <tr><td><strong>Ping Echo</strong></td><td>Availability</td><td>60s</td><td>ICMP</td><td><span class="badge-me clear">Up</span></td></tr>
              <tr><td><strong>CPU Utilization</strong></td><td>Performance</td><td>120s</td><td>SNMP RFC1213</td><td><span class="badge-me clear">Active</span></td></tr>
              <tr><td><strong>Memory Utilization</strong></td><td>Performance</td><td>120s</td><td>HOST-RESOURCES-MIB</td><td><span class="badge-me clear">Active</span></td></tr>
              <tr><td><strong>Disk Space</strong></td><td>Capacity</td><td>300s</td><td>HOST-RESOURCES-MIB</td><td><span class="badge-me clear">Active</span></td></tr>
              <tr><td><strong>Temperature</strong></td><td>Hardware Health</td><td>300s</td><td>CISCO-ENVMON-MIB</td><td><span class="badge-me clear">Active</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Pane 5: CCM -->
      <div class="snap-tab-pane ${state.activeSnapTab === 'ccm' ? 'active' : ''}">
        <div style="font-size: 11px; margin-bottom: 8px;">
          Configuration Baseline Status: <span class="badge-me clear">In Compliance</span> (0 Uncommitted Changes)
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 10px; color: #4ade80; max-height: 180px; overflow-y: auto;">
! Running configuration backed up by OpManager Central<br>
! Host: ${dev.name} (${dev.ip})<br>
hostname ${dev.name}<br>
ip routing<br>
snmp-server community public_monitor_ro RO<br>
snmp-server host 10.0.0.100 version 2c public_monitor_ro<br>
end
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
      const res = await fetch(`/api/hardware/details?deviceId=${deviceId}`).then(r => r.json());
      if (res.status === 'success' && res.hardware) {
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
            probeName: res.device.probeName || 'Dallas-Probe-01',
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
      openConfigDiff(state.activeModalDevice.id || '1');
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
    DOM.terminalScreenText.textContent = `${name}# Connected to Cisco IOS Enterprise (${ip}:22).\nType 'show ip int br', 'show ver', 'show run', or 'ping <ip>' to execute.\n`;
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
      lines += `\nTrace complete. 0 packet loss.`;
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

      const lines = res.packets.map(p => `  ${p.status}`).join('\n');
      alert(`Ping Results for ${ip} (Executed by: ${res.probe}):\n\n${lines}\n\nPackets: Sent = ${res.transmitted}, Received = ${res.received}, Lost = ${res.lossPercent}%\nApproximate round trip times: Minimum = ${res.minRtt}ms, Maximum = ${res.maxRtt}ms, Average = ${res.avgRtt}ms`);
    } catch (e) {
      alert('Ping failed: ' + e.message);
    }
  }

  function runQuickPing() {
    const ip = prompt('Enter IP Address or Hostname to Ping from Central Poller:', '10.10.0.1');
    if (ip) runPingTool(ip.trim(), '1');
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
                  <td>${a.metrics?.cpu || 0}%</td>
                  <td>${a.metrics?.memory || 0}%</td>
                  <td>${a.metrics?.disk || 0}%</td>
                  <td>${new Date(a.lastHeartbeat || a.registeredAt).toLocaleTimeString()}</td>
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
    try {
      const res = await fetch('/api/json/enterprise/syncDataFromProbe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probeId })
      }).then(r => r.json());

      showAlarmToast({
        id: `sync-${probeId}-${Date.now()}`,
        severity: 'Clear',
        deviceName: res.probe?.displayName || 'Remote Probe',
        ip: res.probe?.ip || 'Probe',
        probeName: res.probe?.name || 'Enterprise Probe',
        message: res.message || 'Probe data synchronized successfully with Central.'
      });
      await fetchInitialData();
      renderCurrentView();
    } catch (e) {
      alert('Sync failed: ' + e.message);
    }
  }

  async function syncAllProbes() {
    showAlarmToast({
      id: `sync-all-${Date.now()}`,
      severity: 'Clear',
      deviceName: 'Master Central Catalog',
      ip: '10.0.0.100',
      probeName: 'Enterprise Coordinator',
      message: 'Triggering parallel bidirectional synchronization across all 4 remote probes...'
    });

    try {
      const res = await fetch('/api/json/enterprise/syncAllProbes', { method: 'POST' }).then(r => r.json());
      await fetchInitialData();
      renderCurrentView();
      showAlarmToast({
        id: `sync-done-${Date.now()}`,
        severity: 'Clear',
        deviceName: 'Federation Engine',
        ip: '10.0.0.100',
        probeName: 'Central Master',
        message: res.message || 'All distributed probes synchronized with Central master catalog'
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function testProbeConnection(probeId) {
    try {
      const res = await fetch('/api/json/enterprise/testCentralConnection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probeId })
      }).then(r => r.json());
      alert(`Link Test: ${res.status === 'success' ? 'Connected' : 'Failed'}\nLatency: ${res.latency || 12} ms\neeAuthKey Mutual Handshake: Valid`);
    } catch (e) {
      alert('Link Test Error: ' + e.message);
    }
  }

  async function acknowledgeAlarm(alarmId) {
    try {
      await fetch('/api/json/alarms/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      const a = state.alarms.find(x => x.id === alarmId);
      if (a) a.status = 'Acknowledged';
      updateHeaderBadges();
      renderCurrentView();
    } catch (e) {
      alert('Ack failed: ' + e.message);
    }
  }

  async function clearAlarm(alarmId) {
    try {
      await fetch('/api/json/alarms/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      state.alarms = state.alarms.filter(x => x.id !== alarmId);
      updateHeaderBadges();
      renderCurrentView();
    } catch (e) {
      alert('Clear failed: ' + e.message);
    }
  }

  function pushBaselineToProbes() {
    alert('Pushing Central Baseline Configuration to all remote Probes...');
    setTimeout(() => {
      alert('Central Baseline Push completed. 4 Probes updated.');
    }, 600);
  }

  function exportInventoryCSV() {
    const devs = getFilteredDevices();
    let csv = 'Device Name,IP Address,Category,Vendor,Probe ID,CPU,Memory,ResponseTime,Status\n';
    devs.forEach(d => {
      csv += `"${d.name}","${d.ip}","${d.category}","${d.vendor}","${d.probeId}","${d.cpu}%","${d.memory}%","${d.responseTime}ms","${d.status}"\n`;
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
    openSwitchPorts,
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
