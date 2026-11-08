const fs = require('fs');

// --- 1. PATCH 02_branding_and_modals.js ---
const modalsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

const newModals3Code = `
  // -------------------------------------------------------------
  // MODAL: NCM DUAL-PANE SIDE-BY-SIDE CONFIGURATION COMPARATOR
  // -------------------------------------------------------------
  function showNcmVersionCompareModal(targetDev) {
    let modal = document.getElementById('opm-ncm-diff-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ncm-diff-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const dev = targetDev || state.devices[0];

    const startupLines = [
      { num: '01', text: '! Last configuration change at 06:14:02 UTC' },
      { num: '02', text: 'version 17.09.04a' },
      { num: '03', text: 'service timestamps debug datetime msec' },
      { num: '04', text: 'service timestamps log datetime msec' },
      { num: '05', text: 'hostname DXB-CORE-SW-01' },
      { num: '06', text: '!' },
      { num: '07', text: 'boot-start-marker' },
      { num: '08', text: 'boot-end-marker' },
      { num: '09', text: '!' },
      { num: '10', text: 'no aaa new-model' },
      { num: '11', text: '!' },
      { num: '12', text: 'interface FortyGigabitEthernet1/0/48', highlight: 'del' },
      { num: '13', text: ' description Core Uplink to DXB-EDGE-RTR-01', highlight: 'del' },
      { num: '14', text: ' switchport mode trunk', highlight: 'del' },
      { num: '15', text: ' switchport trunk allowed vlan 10,20,30,40', highlight: 'del' },
      { num: '16', text: ' no shutdown  <-- BASELINE IN STARTUP', highlight: 'del' },
      { num: '17', text: '!' },
      { num: '18', text: 'interface TenGigabitEthernet1/0/1' },
      { num: '19', text: ' description Distribution Trunk to LON' },
      { num: '20', text: ' switchport mode trunk' },
      { num: '21', text: '!' },
      { num: '22', text: 'ip default-gateway 10.40.1.254' },
      { num: '23', text: 'ip forward-protocol nd' },
      { num: '24', text: '!' },
      { num: '25', text: 'snmp-server community ******* RO' },
      { num: '26', text: 'snmp-server host 10.0.0.10 version 2c *******' },
      { num: '27', text: 'line con 0' },
      { num: '28', text: 'line vty 0 4' },
      { num: '29', text: ' login' },
      { num: '30', text: 'end' }
    ];

    const runningLines = [
      { num: '01', text: '! Last configuration change at 08:30:14 UTC' },
      { num: '02', text: 'version 17.09.04a' },
      { num: '03', text: 'service timestamps debug datetime msec' },
      { num: '04', text: 'service timestamps log datetime msec' },
      { num: '05', text: 'hostname DXB-CORE-SW-01' },
      { num: '06', text: '!' },
      { num: '07', text: 'boot-start-marker' },
      { num: '08', text: 'boot-end-marker' },
      { num: '09', text: '!' },
      { num: '10', text: 'no aaa new-model' },
      { num: '11', text: '!' },
      { num: '12', text: 'interface FortyGigabitEthernet1/0/48', highlight: 'add' },
      { num: '13', text: ' description Core Uplink to DXB-EDGE-RTR-01', highlight: 'add' },
      { num: '14', text: ' switchport mode trunk', highlight: 'add' },
      { num: '15', text: ' switchport trunk allowed vlan 10,20,30,40', highlight: 'add' },
      { num: '16', text: ' shutdown  <-- REASON FOR PORT 48 CRITICAL DOWN', highlight: 'add' },
      { num: '17', text: '!' },
      { num: '18', text: 'interface TenGigabitEthernet1/0/1' },
      { num: '19', text: ' description Distribution Trunk to LON' },
      { num: '20', text: ' switchport mode trunk' },
      { num: '21', text: '!' },
      { num: '22', text: 'ip default-gateway 10.40.1.254' },
      { num: '23', text: 'ip forward-protocol nd' },
      { num: '24', text: 'ip access-list standard 101', highlight: 'add' },
      { num: '25', text: ' permit 10.0.0.0 0.255.255.255', highlight: 'add' },
      { num: '26', text: '!' },
      { num: '27', text: 'snmp-server community ******* RO' },
      { num: '28', text: 'snmp-server host 10.0.0.10 version 2c *******' },
      { num: '29', text: 'line con 0' },
      { num: '30', text: 'line vty 0 4' },
      { num: '31', text: ' login' },
      { num: '32', text: 'end' }
    ];

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NCM Dual-Pane Side-by-Side Configuration Comparator</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">\${dev.name} (\${dev.ip})</strong> &bull; Probe: \${dev.probe}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">3 Differences Detected</span>
            <button id="close-ncm-diff-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
          </div>
        </div>

        <!-- Toolbar -->
        <div style="padding: 10px 24px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="color: #334155; font-weight: 700;">Diff Legend:</span>
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #dc2626;"><span style="width: 10px; height: 10px; background: rgba(220, 38, 38, 0.2); border: 1px solid #dc2626; display: inline-block;"></span> Startup Only (Deleted)</span>
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #16a34a;"><span style="width: 10px; height: 10px; background: rgba(22, 163, 74, 0.2); border: 1px solid #16a34a; display: inline-block;"></span> Running Only (Inserted)</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="opm-ncm-sync-nvram-btn" style="background: #16a34a; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Sync Running to Startup (wr mem)
            </button>
            <button id="opm-ncm-rollback-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Rollback Running to Baseline
            </button>
            <button id="opm-ncm-export-pdf-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Export Diff PDF
            </button>
          </div>
        </div>

        <!-- Dual Pane Body -->
        <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #0f172a; font-family: monospace; font-size: 11px; line-height: 1.6;">
          <!-- Left Pane: Startup Baseline -->
          <div style="border-right: 1px solid #334155; padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>STARTUP-CONFIG (NVRAM) &bull; Version 13.0</span>
              <span style="color: #cbd5e1;">Baseline Captured 06:14 UTC</span>
            </div>
            <div>
              \${startupLines.map(l => \`
                <div style="display: flex; gap: 8px; padding: 1px 4px; \${l.highlight === 'del' ? 'background: rgba(220, 38, 38, 0.25); color: #fca5a5; border-left: 3px solid #dc2626;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 22px; text-align: right; user-select: none;">\${l.num}</span>
                  <span>\${l.text}</span>
                </div>
              \`).join('')}
            </div>
          </div>

          <!-- Right Pane: Running Config -->
          <div style="padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RUNNING-CONFIG (RAM) &bull; Version 14.2</span>
              <span style="color: #4ade80;">Live Synchronized 08:30 UTC</span>
            </div>
            <div>
              \${runningLines.map(l => \`
                <div style="display: flex; gap: 8px; padding: 1px 4px; \${l.highlight === 'add' ? 'background: rgba(22, 163, 74, 0.25); color: #86efac; border-left: 3px solid #16a34a;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 22px; text-align: right; user-select: none;">\${l.num}</span>
                  <span>\${l.text}</span>
                </div>
              \`).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine Network Configuration Manager v12.9.203 &bull; SHA256 Verification: <code>a8f23...e41</code></span>
          <button id="opm-ncm-diff-close-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Comparator</button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-ncm-diff-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-ncm-diff-close-btn').onclick = () => { modal.style.display = 'none'; };

    const syncBtn = modal.querySelector('#opm-ncm-sync-nvram-btn');
    if (syncBtn) {
      syncBtn.onclick = () => {
        state.configDriftFixed = true;
        showToast('Running configuration written to NVRAM. Baseline synchronized.');
        modal.style.display = 'none';
        if (typeof renderConfigurationView === 'function') renderConfigurationView();
      };
    }
    const rollbackBtn = modal.querySelector('#opm-ncm-rollback-btn');
    if (rollbackBtn) {
      rollbackBtn.onclick = () => {
        showToast('Rollback script executed via Probe SSH: Running config restored to Startup baseline.');
        modal.style.display = 'none';
      };
    }
    const exportBtn = modal.querySelector('#opm-ncm-export-pdf-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        window.print();
      };
    }
  }

  // -------------------------------------------------------------
  // MODAL: SNMP TRAP SIMULATOR & GENERATOR
  // -------------------------------------------------------------
  function showSnmpTrapSimulatorModal() {
    let modal = document.getElementById('opm-trap-sim-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-trap-sim-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">TRAP</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Simulate Inbound SNMP Trap (UDP 162)</div>
              <div style="font-size: 11px; color: #64748b;">Test OpManager Central Real-Time Trap Receiver &amp; Processing Rules</div>
            </div>
          </div>
          <span id="close-trap-sim-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Source Device CI</label>
              <select id="sim-trap-device" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="1">DXB-CORE-SW-01 (10.40.1.1)</option>
                <option value="2">NY-CORE-RTR-01 (10.10.1.1)</option>
                <option value="3">LON-DIST-SW-01 (10.20.1.2)</option>
                <option value="4">SG-LEAF-SW-01 (10.30.1.1)</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Trap Template / MIB Type</label>
              <select id="sim-trap-type" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="linkDown">IF-MIB::linkDown (Critical)</option>
                <option value="bgpEstablished">BGP4-MIB::bgpEstablished (Clear)</option>
                <option value="tempAlarm">CISCO-ENVMON::temperatureNotification (Trouble)</option>
                <option value="coldStart">SNMPv2-MIB::coldStart (Attention)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Destination Listener</label>
              <input type="text" value="0.0.0.0:162 (UDP Trap Daemon)" readonly style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #f8fafc; font-family: monospace;">
            </div>
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">SNMP Version &amp; Community</label>
              <input type="text" value="SNMPv2c • Community: public" readonly style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #f8fafc; font-family: monospace;">
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Variable Bindings Payload (Varbinds)</label>
            <div id="sim-trap-varbinds-box" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; line-height: 1.6; padding: 12px; border-radius: 4px; border: 1px solid #334155;">
              ifIndex.48 = 48<br>
              ifDescr.48 = FortyGigabitEthernet1/0/48<br>
              ifAdminStatus.48 = 1 (up)<br>
              ifOperStatus.48 = 2 (down)
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="sim-trap-cancel-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="sim-trap-fire-btn" style="background: #dc2626; border: none; color: #fff; padding: 7px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              ⚡ Fire Inbound SNMP Trap
            </button>
          </div>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-trap-sim-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#sim-trap-cancel-btn').onclick = () => { modal.style.display = 'none'; };

    const typeSelect = modal.querySelector('#sim-trap-type');
    const varBox = modal.querySelector('#sim-trap-varbinds-box');
    typeSelect.onchange = () => {
      const val = typeSelect.value;
      if (val === 'linkDown') {
        varBox.innerHTML = 'ifIndex.48 = 48<br>ifDescr.48 = FortyGigabitEthernet1/0/48<br>ifAdminStatus.48 = 1 (up)<br>ifOperStatus.48 = 2 (down)';
      } else if (val === 'bgpEstablished') {
        varBox.innerHTML = 'bgpPeerState.192.168.10.1 = 6 (established)<br>bgpPeerLastError.192.168.10.1 = 0000';
      } else if (val === 'tempAlarm') {
        varBox.innerHTML = 'ciscoEnvMonTemperatureStatusValue.1 = 48 (deg C)<br>ciscoEnvMonTemperatureThreshold.1 = 45 (deg C)';
      } else if (val === 'coldStart') {
        varBox.innerHTML = 'sysUpTimeInstance = 0<br>sysName.0 = DXB-CORE-SW-01';
      }
    };

    const fireBtn = modal.querySelector('#sim-trap-fire-btn');
    fireBtn.onclick = () => {
      modal.style.display = 'none';
      if (typeof playAlarmChime === 'function') playAlarmChime();
      showToast('SNMP Trap successfully ingested on UDP 162. Trap Parser processed payload.');
    };
  }
`;

if (!modalsContent.includes('showNcmVersionCompareModal')) {
  modalsContent = modalsContent.replace(
    '// -------------------------------------------------------------',
    `${newModals3Code}\n\n  // -------------------------------------------------------------`
  );
  fs.writeFileSync(modalsPath, modalsContent, 'utf8');
  console.log('Added showNcmVersionCompareModal & showSnmpTrapSimulatorModal to 02_branding_and_modals.js');
}

// --- 2. PATCH 04_views_alarms_maps.js: Wire opm-trap-sim-btn to showSnmpTrapSimulatorModal ---
const alarmsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/04_views_alarms_maps.js';
let alarmsContent = fs.readFileSync(alarmsPath, 'utf8');

const oldSimBtnCode = `    const simTrapBtn = container.querySelector('#opm-trap-sim-btn');
    if (simTrapBtn) {
      simTrapBtn.onclick = () => {
        showToast('Simulated SNMP linkDown trap ingested via UDP 162.');
      };
    }`;

const newSimBtnCode = `    const simTrapBtn = container.querySelector('#opm-trap-sim-btn');
    if (simTrapBtn) {
      simTrapBtn.onclick = () => {
        if (typeof showSnmpTrapSimulatorModal === 'function') {
          showSnmpTrapSimulatorModal();
        } else {
          showToast('Simulated SNMP linkDown trap ingested via UDP 162.');
        }
      };
    }`;

if (alarmsContent.includes(oldSimBtnCode)) {
  alarmsContent = alarmsContent.replace(oldSimBtnCode, newSimBtnCode);
  fs.writeFileSync(alarmsPath, alarmsContent, 'utf8');
  console.log('Connected #opm-trap-sim-btn to showSnmpTrapSimulatorModal in 04_views_alarms_maps.js');
}

// --- 3. PATCH 05_views_config_reports_settings.js: Add comparator button in Changes ---
const configPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/05_views_config_reports_settings.js';
let configContent = fs.readFileSync(configPath, 'utf8');

const compareBtnHtml = `<button id="opm-open-diff-comparator-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                  🔍 Dual-Pane Version Comparator
                </button>`;

if (!configContent.includes('opm-open-diff-comparator-btn')) {
  configContent = configContent.replace(
    '<button id="opm-recheck-drift-btn"',
    `${compareBtnHtml}\n                <button id="opm-recheck-drift-btn"`
  );

  const compareBtnWiring = `    const compBtn = container.querySelector('#opm-open-diff-comparator-btn');
    if (compBtn) {
      compBtn.onclick = () => {
        if (typeof showNcmVersionCompareModal === 'function') {
          showNcmVersionCompareModal(state.devices[0]);
        }
      };
    }`;

  configContent = configContent.replace(
    '// Save running to startup button',
    `${compareBtnWiring}\n\n    // Save running to startup button`
  );

  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('Added Dual-Pane Version Comparator button in 05_views_config_reports_settings.js');
}

// --- 4. PATCH 06_router_and_init.js: Export modals on OpManagerSuite ---
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('showNcmVersionCompareModal,')) {
  routerContent = routerContent.replace(
    'showWanLinkDetailsModal,',
    'showWanLinkDetailsModal,\n    showNcmVersionCompareModal,\n    showSnmpTrapSimulatorModal,'
  );
  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('Exported showNcmVersionCompareModal and showSnmpTrapSimulatorModal on OpManagerSuite');
}
