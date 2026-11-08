const fs = require('fs');

const path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/01_header_state.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add nocDarkMode and syncCountdown to state
if (!content.includes('nocDarkMode:')) {
  content = content.replace(
    "alarmsViewMode: 'list',",
    "alarmsViewMode: 'list',\n    nocDarkMode: false,\n    syncCountdown: 15,"
  );
}

// 2. Add .opm-noc-dark styles to ensureGlobalStyles
const nocDarkCss = `
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
`;

if (!content.includes('/* NOC Wallboard Dark Theme */')) {
  content = content.replace(
    '.opm-packet-flow {',
    `${nocDarkCss}\n        .opm-packet-flow {`
  );
}

// 3. Helper functions for breadcrumbs, clock, and dark theme
const helpersCode = `
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
        const dateStr = \`\${pad(now.getUTCDate())}-\${months[now.getUTCMonth()]}-\${now.getUTCFullYear()}\`;
        const timeStr = \`\${pad(now.getUTCHours())}:\${pad(now.getUTCMinutes())}:\${pad(now.getUTCSeconds())}\`;
        clockEl.innerText = \`UTC \${dateStr} \${timeStr}\`;
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
    let bar = document.getElementById('opm-header-subnav-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'opm-header-subnav-bar';
      bar.style.cssText = 'width: 100%; height: 38px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; box-sizing: border-box; font-family: Roboto, -apple-system, sans-serif; font-size: 12px; z-index: 100; transition: background 0.2s, border 0.2s;';
      bar.innerHTML = \`
        <div id="opm-breadcrumbs-container" style="display: flex; align-items: center; gap: 8px;">
          <a href="#/dashboard" style="color: #0070e0; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <span style="color: #94a3b8;">›</span>
          <span id="opm-crumb-tab" style="color: #475569; font-weight: 600; text-transform: capitalize;">Dashboard</span>
          <span id="opm-crumb-separator" style="color: #94a3b8; display: none;">›</span>
          <span id="opm-crumb-subtab" style="color: #0f172a; font-weight: 700; text-transform: capitalize; display: none;"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-family: monospace;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e;"></span>
            <span id="opm-live-server-clock">UTC Server Time</span>
          </div>
          <span style="color: #cbd5e1;">|</span>
          <span style="color: #64748b;" title="Probe Telemetry Sync Heartbeat">Sync in: <strong id="opm-live-sync-countdown" style="color: #0284c7;">15s</strong></span>
          <span style="color: #cbd5e1;">|</span>
          <button id="opm-subnav-search-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; color: #334155; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Quick Omnibox Search">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Quick Search <kbd style="background: #e2e8f0; border-radius: 2px; padding: 1px 4px; font-size: 9px; font-family: monospace;">Ctrl+K</kbd>
          </button>
          <span style="color: #cbd5e1;">|</span>
          <button id="opm-subnav-theme-toggle" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Toggle High-Contrast NOC Dark Theme">
            <span id="opm-theme-icon">🌙</span> <span id="opm-theme-text">NOC Dark</span>
          </button>
        </div>
      \`;
      const searchBtn = bar.querySelector('#opm-subnav-search-btn');
      if (searchBtn) {
        searchBtn.onclick = () => {
          if (typeof showGlobalSearchModal === 'function') showGlobalSearchModal();
        };
      }
      const themeBtn = bar.querySelector('#opm-subnav-theme-toggle');
      if (themeBtn) {
        themeBtn.onclick = () => {
          toggleNocDarkMode();
        };
      }
    }

    const header = document.getElementById('main-header');
    if (header && header.parentNode) {
      if (bar.parentNode !== header.parentNode || bar.previousSibling !== header) {
        header.parentNode.insertBefore(bar, header.nextSibling);
      }
    } else if (!bar.parentNode && document.body) {
      document.body.appendChild(bar);
    }
    return bar;
  }

  function updateBreadcrumbs(tab, subtab) {
    ensureSubnavBreadcrumbsBar();
    initClockAndTimers();
    const tabEl = document.getElementById('opm-crumb-tab');
    const sepEl = document.getElementById('opm-crumb-separator');
    const subtabEl = document.getElementById('opm-crumb-subtab');
    if (!tabEl) return;

    const titles = {
      'dashboard': 'Dashboard',
      'inventory': 'Inventory',
      'alarms': 'Alarms',
      'maps': 'Maps & Topologies',
      'configuration': 'Configuration (NCM)',
      'reports': 'Reports',
      'settings': 'Settings & Administration'
    };
    tabEl.innerText = titles[tab] || tab;

    if (subtab && subtab !== 'overview' && subtab !== 'devices' && subtab !== 'active' && subtab !== 'business' && subtab !== 'compliance' && subtab !== 'sla' && subtab !== 'probes') {
      const subTitles = {
        'noc': 'NOC Wallboard Carousel',
        'interfaces': 'Network Interfaces',
        'virtualization': 'Virtualization & Hypervisors',
        'firewall_rules': 'Firewall Rules & Policies',
        'storage': 'Storage Systems',
        'all': 'All Historical Alarms',
        'eventlog': 'Windows Event Logs',
        'syslog': 'Syslog Monitor',
        'traps': 'SNMP Trap Viewer',
        'layer2': 'Layer-2 STP Topology',
        'rack': '3D 42U Data Center Rack',
        'floor': '3D Datacenter Floor Plan',
        'world': 'Global Probes WAN World Map',
        'changes': 'Configuration Drift & Backups',
        'baseline': 'Golden Baseline Rules',
        'firmware': 'Firmware & Vulnerability Management',
        'executive': 'Executive Health Summary',
        'bandwidth': '95th Percentile Bandwidth',
        'audit': 'NCM Audit & Drift Report',
        'users': 'User Management & RBAC',
        'discovery': 'Network Discovery Profiles',
        'templates': 'Device Templates (SNMP/CLI)',
        'mail': 'Mail Server (SMTP)',
        'sms': 'SMS & Webhook Gateways',
        'ha': 'High Availability (Failsafe)',
        'license': 'License Management',
        'support': 'Support & Diagnostic Logs'
      };
      if (sepEl) sepEl.style.display = 'inline';
      if (subtabEl) {
        subtabEl.style.display = 'inline';
        subtabEl.innerText = subTitles[subtab] || subtab.replace(/_/g, ' ');
      }
    } else {
      if (sepEl) sepEl.style.display = 'none';
      if (subtabEl) subtabEl.style.display = 'none';
    }
  }
`;

if (!content.includes('ensureSubnavBreadcrumbsBar')) {
  content = content.replace(
    '// Route Resolver',
    `${helpersCode}\n\n  // Route Resolver`
  );
}

// 4. Update ensureOverlayContainer to call ensureSubnavBreadcrumbsBar and initClockAndTimers
if (!content.includes('ensureSubnavBreadcrumbsBar();')) {
  content = content.replace(
    'syncHeaderTabs(state.currentTab);',
    'syncHeaderTabs(state.currentTab);\n    ensureSubnavBreadcrumbsBar();\n    initClockAndTimers();\n    if (localStorage.getItem("opm_noc_dark_mode") === "true") applyNocDarkTheme(true);'
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched 01_header_state.js');
