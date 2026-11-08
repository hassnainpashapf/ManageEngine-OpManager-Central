const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central';
const file01 = path.join(baseDir, 'scripts/suite_modules/01_header_state.js');
const file06 = path.join(baseDir, 'scripts/suite_modules/06_router_and_init.js');

let content01 = fs.readFileSync(file01, 'utf8');
let content06 = fs.readFileSync(file06, 'utf8');

console.log('Patching 01_header_state.js for full scrollability and standalone #main-header...');

// 1. Update ensureGlobalStyles to force overflow-y: auto and height: auto on html & body
const oldGlobalStyles = `        html, body, body.NavText, body.NavHovered {
          margin: 0 !important;
          padding: 0 !important;
          background: #f4f6f9 !important;
          background-image: none !important;
          width: 100% !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
        }`;

const newGlobalStyles = `        html {
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
        }`;

if (content01.includes(oldGlobalStyles)) {
  content01 = content01.replace(oldGlobalStyles, newGlobalStyles);
  console.log('✓ Replaced oldGlobalStyles with full scroll rules.');
} else {
  console.log('⚠ oldGlobalStyles not found directly, checking variations...');
}

// 2. Add ensureMainHeader function right before ensureOverlayContainer
const ensureMainHeaderCode = `
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
        tabsHtml += \`
          <li class="\${isAct ? 'active-menu' : ''}" style="list-style: none; display: inline-block; height: 100%;">
            <a href="#/\${t.id}" class="nav-link opm-main-nav-tab \${isAct ? 'active' : ''}" data-tab="\${t.id}" style="color: #e2e8f0; text-decoration: none; font-size: 13px; font-weight: \${isAct ? '600' : '500'}; padding: 0 16px; height: 50px; display: flex; align-items: center; background: \${isAct ? '#49bd80' : 'transparent'}; transition: all 0.15s; letter-spacing: 0.2px;">
              <span class="menu-name" style="color: \${isAct ? '#ffffff' : '#e2e8f0'};">\${t.name}</span>
            </a>
          </li>
        \`;
      });

      const activeProbe = state.probes.find(p => p.id == state.selectedProbe);
      const probeName = activeProbe ? activeProbe.name : 'All Probes (4)';

      header.innerHTML = \`
        <!-- Left: Logo & App Launcher -->
        <div class="logo-section" style="display: flex; align-items: center; gap: 8px;">
          <button id="opm-app-launcher-btn" title="ManageEngine ITOM App Launcher" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#ffffff" style="opacity: 0.9;">
              <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="13" y="1" width="4" height="4" rx="0.5"/>
              <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/><rect x="13" y="7" width="4" height="4" rx="0.5"/>
              <rect x="1" y="13" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="4" height="4" rx="0.5"/><rect x="13" y="13" width="4" height="4" rx="0.5"/>
            </svg>
          </button>
          <div class="logo">
            <a href="#/dashboard" style="display: flex; align-items: center; text-decoration: none; gap: 6px;">
              <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine OpManager" style="height: 24px; width: auto; vertical-align: middle;">
              <span style="font-size: 16px; font-weight: 600; color: #ffffff; letter-spacing: -0.2px; font-family: Lato, sans-serif;">Central</span>
              <span style="background: #49bd80; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 2px; letter-spacing: 0.8px;">ENTERPRISE</span>
            </a>
          </div>
        </div>

        <!-- Center: Primary Navigation Tabs -->
        <nav id="main-nav" style="display: flex; align-items: center; height: 100%;">
          <ul class="main-nav" style="display: flex; align-items: center; margin: 0; padding: 0; height: 100%;">
            \${tabsHtml}
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
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e;"></span>
              <span class="zselectbox__selected" id="opm-probe-name-display">\${probeName}</span>
              <span style="font-size: 9px; color: #94a3b8;">▼</span>
            </button>
          </div>

          <!-- Add Quick Action Button (+) -->
          <button id="opm-quick-add-btn" title="Add Device / Add Discovery Rule" style="background: #0070e0; color: #ffffff; border: none; width: 28px; height: 28px; border-radius: 4px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">
            +
          </button>

          <!-- Zia AI Assistant Button -->
          <button id="opm-header-zia-btn" title="ManageEngine Zia AI Assistant (Alt+Z)" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 1px 3px rgba(79,70,229,0.4);">
            <span>🧠</span> Zia AI
          </button>

          <!-- Bell Notifications Button -->
          <button id="opm-header-bell-btn" data-fsoqa="user-notifications" title="Active Alarms Drawer" style="background: transparent; border: none; color: #cbd5e1; font-size: 16px; cursor: pointer; position: relative; padding: 4px 6px;">
            🔔
            <span class="opm-bell-badge" style="position: absolute; top: -2px; right: -2px; background: #dc2626; color: #ffffff; border-radius: 9px; font-size: 10px; font-weight: 700; padding: 1px 5px; min-width: 14px; text-align: center; line-height: 13px;">\${state.alarms.length || 7}</span>
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
      \`;

      if (document.body.firstChild) {
        document.body.insertBefore(header, document.body.firstChild);
      } else {
        document.body.appendChild(header);
      }

      // Wire header button clicks
      const launcherBtn = header.querySelector('#opm-app-launcher-btn');
      if (launcherBtn) {
        launcherBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof showItomAppLauncherDropdown === 'function') showItomAppLauncherDropdown(launcherBtn);
        };
      }

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

      const ziaBtn = header.querySelector('#opm-header-zia-btn');
      if (ziaBtn) {
        ziaBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof showZiaAssistantModal === 'function') showZiaAssistantModal();
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
    return header;
  }
`;

if (!content01.includes('function ensureMainHeader()')) {
  content01 = content01.replace('function ensureOverlayContainer() {', ensureMainHeaderCode + '\n  function ensureOverlayContainer() {');
  console.log('✓ Added ensureMainHeader() function to 01_header_state.js.');
}

// 3. Update ensureOverlayContainer to call ensureMainHeader and place container after subnav
const oldEnsureOverlayStart = `  function ensureOverlayContainer() {
    ensureGlobalStyles();
    syncHeaderTabs(state.currentTab);`;

const newEnsureOverlayStart = `  function ensureOverlayContainer() {
    ensureGlobalStyles();
    ensureMainHeader();
    ensureSubnavBreadcrumbsBar();
    syncHeaderTabs(state.currentTab);`;

if (content01.includes(oldEnsureOverlayStart)) {
  content01 = content01.replace(oldEnsureOverlayStart, newEnsureOverlayStart);
  console.log('✓ Updated ensureOverlayContainer() to guarantee header & subnav initialization.');
}

// 4. Update ensureLayoutPlacement in 06_router_and_init.js
const oldEnsureLayoutPlacement = `  function ensureLayoutPlacement() {
    const h = document.getElementById('main-header');
    let c = document.getElementById('opm-custom-suite-container');
    if (!c) {
      c = ensureOverlayContainer();
    }
    if (h && c && h.parentNode) {
      if (c.parentElement === h.parentElement && c.previousElementSibling === h) {
        return;
      }
      h.parentNode.insertBefore(c, h.nextSibling);
    } else if (c && !c.parentNode && document.body) {
      document.body.appendChild(c);
    }
    const pc = document.querySelector('.page-container');
    if (pc && pc.style.display !== 'none') {
      pc.style.setProperty('display', 'none', 'important');
    }
  }`;

const newEnsureLayoutPlacement = `  function ensureLayoutPlacement() {
    ensureGlobalStyles();
    const h = ensureMainHeader();
    const s = ensureSubnavBreadcrumbsBar();
    let c = document.getElementById('opm-custom-suite-container');
    if (!c) {
      c = ensureOverlayContainer();
    }
    if (s && c && s.parentNode) {
      if (c.parentElement === s.parentElement && c.previousElementSibling === s) {
        return;
      }
      s.parentNode.insertBefore(c, s.nextSibling);
    } else if (h && c && h.parentNode) {
      if (c.parentElement === h.parentElement && c.previousElementSibling === h) {
        return;
      }
      h.parentNode.insertBefore(c, h.nextSibling);
    } else if (c && !c.parentNode && document.body) {
      document.body.appendChild(c);
    }
    const pc = document.querySelector('.page-container');
    if (pc && pc.style.display !== 'none') {
      pc.style.setProperty('display', 'none', 'important');
    }
  }`;

if (content06.includes(oldEnsureLayoutPlacement)) {
  content06 = content06.replace(oldEnsureLayoutPlacement, newEnsureLayoutPlacement);
  console.log('✓ Updated ensureLayoutPlacement() in 06_router_and_init.js.');
}

// Write modified module files
fs.writeFileSync(file01, content01, 'utf8');
fs.writeFileSync(file06, content06, 'utf8');
console.log('Modules written. Rebuilding bundle...');

const rebuildOut = execSync('node scripts/rebuild_bundle.js', { cwd: baseDir, encoding: 'utf8' });
console.log(rebuildOut);

