  
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

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NCM Dual-Pane Side-by-Side Configuration Comparator</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${dev.name} (${dev.ip})</strong> &bull; Probe: ${dev.probe}</div>
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
              ${startupLines.map(l => `
                <div style="display: flex; gap: 8px; padding: 1px 4px; ${l.highlight === 'del' ? 'background: rgba(220, 38, 38, 0.25); color: #fca5a5; border-left: 3px solid #dc2626;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 22px; text-align: right; user-select: none;">${l.num}</span>
                  <span>${l.text}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Pane: Running Config -->
          <div style="padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RUNNING-CONFIG (RAM) &bull; Version 14.2</span>
              <span style="color: #4ade80;">Live Synchronized 08:30 UTC</span>
            </div>
            <div>
              ${runningLines.map(l => `
                <div style="display: flex; gap: 8px; padding: 1px 4px; ${l.highlight === 'add' ? 'background: rgba(22, 163, 74, 0.25); color: #86efac; border-left: 3px solid #16a34a;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 22px; text-align: right; user-select: none;">${l.num}</span>
                  <span>${l.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine Network Configuration Manager v12.9.203 &bull; SHA256 Verification: <code>a8f23...e41</code></span>
          <button id="opm-ncm-diff-close-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Comparator</button>
        </div>
      </div>
    `;

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

    modal.innerHTML = `
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
    `;

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


  // -------------------------------------------------------------
  // HEADER BRANDING & POPOVERS
  // -------------------------------------------------------------
  let opmAudioCtx = null;
  function playAlarmChime() {
    if (localStorage.getItem('opm_sound_enabled') === 'false') return;
    try {
      const audio = new Audio('/apiclient/fluidicv2/sounds/webalarm.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {
        synthesizeAlarmChime();
      });
    } catch (e) {
      synthesizeAlarmChime();
    }
  }

  function synthesizeAlarmChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!opmAudioCtx) opmAudioCtx = new AudioCtx();
      if (opmAudioCtx.state === 'suspended') {
        opmAudioCtx.resume();
      }
      const now = opmAudioCtx.currentTime;
      // ManageEngine signature dual-tone alarm chime (880Hz -> 1175Hz)
      const osc1 = opmAudioCtx.createOscillator();
      const gain1 = opmAudioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(opmAudioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);

      const osc2 = opmAudioCtx.createOscillator();
      const gain2 = opmAudioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1175, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(opmAudioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.42);
    } catch (e) {}
  }

  function setupHeaderBrandingAndIcons() {
    const hdr = document.getElementById('main-header');
    if (hdr) {
      hdr.style.backgroundColor = '#212121';
    }

    const logoLink = document.querySelector('#main-header .logo a');
    if (logoLink && !logoLink.getAttribute('data-branded')) {
      logoLink.setAttribute('data-branded', 'true');
      logoLink.style.display = 'inline-flex';
      logoLink.style.alignItems = 'center';
      logoLink.style.textDecoration = 'none';
      logoLink.innerHTML = `
        <span id="opm-app-launcher-trigger" title="ManageEngine ITOM Suite App Switcher" style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 4px; margin-right: 8px; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="#212121" style="opacity: 0.85; flex-shrink: 0;">
            <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="13" y="1" width="4" height="4" rx="0.5"/>
            <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/><rect x="13" y="7" width="4" height="4" rx="0.5"/>
            <rect x="1" y="13" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="4" height="4" rx="0.5"/><rect x="13" y="13" width="4" height="4" rx="0.5"/>
          </svg>
        </span>
        <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine OpManager" style="height: 26px; width: auto; vertical-align: middle; margin-right: 6px; display: inline-block;">
        <span style="font-size: 16px; font-weight: 400; color: #212121; letter-spacing: -0.2px; vertical-align: middle; font-family: Lato, sans-serif;">Central</span>
        <span style="background: #49bd80; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 2px; letter-spacing: 0.8px; margin-left: 7px; vertical-align: middle;">ENTERPRISE</span>
      `;
      const launcherBtn = logoLink.querySelector('#opm-app-launcher-trigger');
      if (launcherBtn) {
        launcherBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          showItomAppLauncherDropdown(launcherBtn);
        };
      }
    }

    const centralBadge = document.querySelector('#main-header .logo-section .relative');
    if (centralBadge) {
      centralBadge.style.display = 'none';
    }

    let probeSelector = document.getElementById('itom-probe-selector-container');
    if (probeSelector) {
      if (!probeSelector.hasAttribute('data-hooked')) {
        probeSelector.setAttribute('data-hooked', 'true');
        probeSelector.style.cursor = 'pointer';
        probeSelector.style.position = 'relative';
        probeSelector.onclick = (e) => {
          e.stopPropagation();
          showProbeSelectorDropdown(probeSelector);
        };
      }
      const selectedLabel = probeSelector.querySelector('.zselectbox__selected');
      if (selectedLabel) {
        const pr = state.probes.find(p => p.id == state.selectedProbe);
        const name = pr ? pr.name : 'All Probes';
        selectedLabel.innerHTML = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; margin-right:6px; box-shadow:0 0 6px rgba(34,197,94,0.6); vertical-align:middle;"></span><span style="vertical-align:middle;">${name}</span>`;
      }
    }

    if (hdr) {
      // Bell notification button & badge
      const bellBtn = hdr.querySelector('button[data-fsoqa="user-notifications"]');
      if (bellBtn && !bellBtn.hasAttribute('data-hooked')) {
        bellBtn.setAttribute('data-hooked', 'true');
        bellBtn.style.position = 'relative';
        bellBtn.style.cursor = 'pointer';
        let badge = bellBtn.querySelector('.opm-bell-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'opm-bell-badge';
          badge.style.cssText = 'position: absolute; top: -3px; right: -3px; background: #dc2626; color: #ffffff; border-radius: 9px; font-size: 10px; font-weight: 700; padding: 1px 5px; min-width: 14px; text-align: center; line-height: 14px; pointer-events: none; box-shadow: 0 1px 2px rgba(0,0,0,0.2);';
          bellBtn.appendChild(badge);
        }
        badge.innerText = String(state.alarms.length || 7);
        bellBtn.onclick = (e) => {
          e.stopPropagation();
          showNotificationsDropdown(bellBtn);
        };
      }

      // Audio Alert Toggle Button (Speaker Icon)
      let soundBtn = hdr.querySelector('#opm-header-sound-btn');
      if (!soundBtn && bellBtn && bellBtn.parentElement) {
        soundBtn = document.createElement('button');
        soundBtn.id = 'opm-header-sound-btn';
        soundBtn.className = 'btn text-btn p-none';
        soundBtn.style.cssText = 'background: none; border: none; cursor: pointer; color: #cbd5e1; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 4px; margin-right: 4px; transition: color 0.15s; vertical-align: middle;';
        
        function updateSoundIcon() {
          const enabled = localStorage.getItem('opm_sound_enabled') !== 'false';
          soundBtn.title = enabled ? 'Alarm Sound: Enabled (Click to Mute)' : 'Alarm Sound: Muted (Click to Unmute)';
          soundBtn.innerHTML = enabled ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
        }
        updateSoundIcon();
        soundBtn.onclick = (e) => {
          e.stopPropagation();
          const cur = localStorage.getItem('opm_sound_enabled') !== 'false';
          localStorage.setItem('opm_sound_enabled', cur ? 'false' : 'true');
          updateSoundIcon();
          if (!cur) {
            playAlarmChime();
            showToast('OpManager Central critical alarm audible sound enabled.');
          } else {
            showToast('Alarm audio sound muted.');
          }
        };
        bellBtn.parentElement.insertBefore(soundBtn, bellBtn);
      }

      // User profile button & avatar
      const profileBtn = hdr.querySelector('button[data-fsoqa="user-profile"]');
      if (profileBtn && !profileBtn.hasAttribute('data-hooked')) {
        profileBtn.setAttribute('data-hooked', 'true');
        profileBtn.style.cursor = 'pointer';
        let avatarImg = profileBtn.querySelector('.profile-img');
        if (avatarImg) avatarImg.style.display = 'none';
        let customAvatar = profileBtn.querySelector('.opm-custom-avatar');
        if (!customAvatar) {
          customAvatar = document.createElement('span');
          customAvatar.className = 'opm-custom-avatar';
          customAvatar.style.cssText = 'width: 26px; height: 26px; border-radius: 50%; background: #1d824e; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; text-transform: uppercase; box-shadow: 0 1px 2px rgba(0,0,0,0.15);';
          customAvatar.innerText = 'A';
          profileBtn.appendChild(customAvatar);
        }
        profileBtn.onclick = (e) => {
          e.stopPropagation();
          showProfileDropdown(profileBtn);
        };
      }

      // Dedicated Help & About Button (?)
      let helpBtn = hdr.querySelector('#opm-header-help-btn');
      if (!helpBtn && profileBtn && profileBtn.parentElement) {
        helpBtn = document.createElement('button');
        helpBtn.id = 'opm-header-help-btn';
        helpBtn.title = 'About OpManager Central & License Info';
        helpBtn.style.cssText = 'background: #e2e8f0; border: 1px solid #cbd5e1; color: #0f172a; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 8px; vertical-align: middle; transition: all 0.15s;';
        helpBtn.innerHTML = '?';
        helpBtn.onmouseenter = () => { helpBtn.style.background = '#cbd5e1'; helpBtn.style.borderColor = '#94a3b8'; };
        helpBtn.onmouseleave = () => { helpBtn.style.background = '#e2e8f0'; helpBtn.style.borderColor = '#cbd5e1'; };
        helpBtn.onclick = (e) => {
          e.stopPropagation();
          showAboutModal();
        };
        profileBtn.parentElement.appendChild(helpBtn);
      }

      // Quick links (gear)
      const gearBtn = hdr.querySelector('button[data-fsoqa="quick-links"]');
      if (gearBtn && !gearBtn.hasAttribute('data-hooked')) {
        gearBtn.setAttribute('data-hooked', 'true');
        gearBtn.style.cursor = 'pointer';
        gearBtn.onclick = (e) => {
          e.stopPropagation();
          showQuickLinksDropdown(gearBtn);
        };
      }

      // Security score (shield)
      const secBtn = hdr.querySelector('button[data-fsoqa="security-score"]');
      if (secBtn && !secBtn.hasAttribute('data-hooked')) {
        secBtn.setAttribute('data-hooked', 'true');
        secBtn.style.cursor = 'pointer';
        secBtn.onclick = (e) => {
          e.stopPropagation();
          showSecurityScoreDropdown(secBtn);
        };
      }

      // Global search
      const searchBtn = hdr.querySelector('button[data-fsoqa="global-search"]');
      if (searchBtn && !searchBtn.hasAttribute('data-hooked')) {
        searchBtn.setAttribute('data-hooked', 'true');
        searchBtn.style.cursor = 'pointer';
        searchBtn.onclick = (e) => {
          e.stopPropagation();
          showGlobalSearchModal();
        };
      }

      // Training videos
      const videoBtn = hdr.querySelector('button[data-fsoqa="training-videos"]');
      if (videoBtn && !videoBtn.hasAttribute('data-hooked')) {
        videoBtn.setAttribute('data-hooked', 'true');
        videoBtn.style.cursor = 'pointer';
        videoBtn.onclick = (e) => {
          e.stopPropagation();
          showTrainingVideosModal();
        };
      }

      // About
      const aboutBtn = hdr.querySelector('button[data-fsoqa="about-opmanager"]');
      if (aboutBtn && !aboutBtn.hasAttribute('data-hooked')) {
        aboutBtn.setAttribute('data-hooked', 'true');
        aboutBtn.style.cursor = 'pointer';
        aboutBtn.onclick = (e) => {
          e.stopPropagation();
          showAboutModal();
        };
      }

      // Quick Actions (+) Button
      let quickAddBtn = hdr.querySelector('#opm-header-quickadd-btn');
      if (!quickAddBtn) {
        const searchBtn = hdr.querySelector('button[data-fsoqa="global-search"]');
        if (searchBtn && searchBtn.parentElement) {
          quickAddBtn = document.createElement('button');
          quickAddBtn.id = 'opm-header-quickadd-btn';
          quickAddBtn.title = 'Quick Actions (Add Device, Probe, Widget, Diagnostic)';
          quickAddBtn.style.cssText = 'background: #1d824e; border: none; color: #ffffff; width: 26px; height: 26px; border-radius: 4px; font-size: 16px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: background 0.15s; line-height: 1; vertical-align: middle;';
          quickAddBtn.innerHTML = '+';
          quickAddBtn.onmouseenter = () => quickAddBtn.style.background = '#166534';
          quickAddBtn.onmouseleave = () => quickAddBtn.style.background = '#1d824e';
          quickAddBtn.onclick = (e) => {
            e.stopPropagation();
            showQuickAddDropdown(quickAddBtn);
          };
          searchBtn.parentElement.insertBefore(quickAddBtn, searchBtn);
        }
      }

      // Zia AI Assistant Pill Button in Top Header (ManageEngine ITOM Copilot)
      let headerZiaBtn = hdr.querySelector('#opm-header-zia-btn');
      if (!headerZiaBtn) {
        const searchBtn = hdr.querySelector('button[data-fsoqa="global-search"]');
        if (searchBtn && searchBtn.parentElement) {
          headerZiaBtn = document.createElement('button');
          headerZiaBtn.id = 'opm-header-zia-btn';
          headerZiaBtn.title = 'Ask Zia AI Assistant (Natural Language ITOM Copilot)';
          headerZiaBtn.style.cssText = 'background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; color: #ffffff; height: 24px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; padding: 0 9px; cursor: pointer; margin-right: 8px; box-shadow: 0 1px 3px rgba(124,58,237,0.35); transition: all 0.15s; vertical-align: middle;';
          headerZiaBtn.innerHTML = '<span style="font-size: 12px; line-height: 1;">✨</span><span>Ask Zia</span>';
          headerZiaBtn.onmouseenter = () => { headerZiaBtn.style.transform = 'translateY(-1px)'; headerZiaBtn.style.boxShadow = '0 3px 6px rgba(124,58,237,0.45)'; };
          headerZiaBtn.onmouseleave = () => { headerZiaBtn.style.transform = 'none'; headerZiaBtn.style.boxShadow = '0 1px 3px rgba(124,58,237,0.35)'; };
          headerZiaBtn.onclick = (e) => {
            e.stopPropagation();
            showZiaAssistantModal();
          };
          searchBtn.parentElement.insertBefore(headerZiaBtn, searchBtn);
        }
      }
    }
  }

  // --- ITOM 9-DOTS APP LAUNCHER POPOVER ---
  function showItomAppLauncherDropdown(triggerEl) {
    let pop = document.getElementById('opm-app-launcher-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-app-launcher-popover';
      pop.style.cssText = 'position: fixed; width: 340px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 12px 24px -4px rgba(0,0,0,0.18); z-index: 100000; font-family: Lato, Roboto, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && !triggerEl.contains(e.target)) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 8) + 'px';
    pop.style.left = Math.max(8, rect.left) + 'px';
    pop.innerHTML = `
      <div style="background: #212121; color: #ffffff; padding: 10px 14px; font-weight: 700; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span>ManageEngine ITOM Integrated Suite</span>
        <span style="font-size: 10px; background: #49bd80; color: #fff; padding: 1px 6px; border-radius: 2px;">v12.9.203</span>
      </div>
      <div style="padding: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #fafbfc;">
        <div class="opm-app-tile" data-target="overview" style="border: 1px solid #49bd80; background: #f0fdf4; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/opm-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #166534; font-weight: 700;">● Active Console</div>
        </div>
        <div class="opm-app-tile" data-target="netflow" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/nfa-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #64748b;">Bandwidth &amp; NetFlow</div>
        </div>
        <div class="opm-app-tile" data-target="ncm" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/ncm-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #64748b;">Config &amp; Compliance</div>
        </div>
        <div class="opm-app-tile" data-target="firewall" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/fwa-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #64748b;">Firewall Log &amp; Security</div>
        </div>
        <div class="opm-app-tile" data-target="oputils" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/opu-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #64748b;">IPAM &amp; Port Mapper</div>
        </div>
        <div class="opm-app-tile" data-target="apm" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 5px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
          <img src="/apiclient/fluidicv3/itom/images/product_logos/apm-light.svg" style="height: 22px; width: auto; object-fit: contain; align-self: flex-start;" />
          <div style="font-size: 10px; color: #64748b;">Applications Manager</div>
        </div>
      </div>
    `;
    pop.style.display = 'block';
    pop.querySelectorAll('.opm-app-tile').forEach(tile => {
      tile.onclick = () => {
        const t = tile.getAttribute('data-target');
        pop.style.display = 'none';
        if (t === 'apm') {
          state.subTabs.inventory = 'virtualization';
          window.location.hash = '#/inventory';
        } else {
          state.subTabs.dashboard = t;
          window.location.hash = '#/dashboard';
          if (state.currentTab === 'dashboard' && typeof renderDashboardView === 'function') renderDashboardView();
        }
        showToast(`Switched to ManageEngine ${t.toUpperCase()} workspace.`);
      };
    });
  }

  // --- ABOUT MODAL ---
  function showAboutModal() {
    let modal = document.getElementById('opm-about-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-about-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #0f172a; padding: 24px 28px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine" style="height: 32px; width: auto; filter: brightness(0) invert(1);">
              <div>
                <div style="font-size: 17px; font-weight: 700; letter-spacing: -0.3px;">OpManager Central</div>
                <div style="font-size: 11px; color: #94a3b8;">Enterprise IT Operations Management</div>
              </div>
            </div>
            <button id="close-about-btn" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 24px 28px; font-size: 12px; color: #334155; line-height: 1.7;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Product Version:</span>
              <span style="font-family: monospace; font-weight: 700; color: #0070e0;">12.9.203 GA (Build 129203)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">License Type:</span>
              <span style="color: #16a34a; font-weight: 700;">Central Enterprise Edition (Unlimited Probes)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Registered Remote Probes:</span>
              <span style="font-weight: 700;">4 / 4 Online (US, UK, SG, AE)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Database Engine:</span>
              <span style="font-family: monospace;">PostgreSQL 14.5 (64-bit embedded)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Java Runtime:</span>
              <span style="font-family: monospace;">OpenJDK 17.0.7 (Zoho JVM Server)</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 4px;">
              <span style="font-weight: 600;">Server Uptime:</span>
              <span>184 Days 14 Hours (Continuous)</span>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>© 2026 Zoho Corporation Pvt. Ltd. All rights reserved.</span>
            <button id="about-ok-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 16px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-about-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('about-ok-btn').onclick = () => { modal.style.display = 'none'; };
  }

  // --- USER PROFILE DROPDOWN ---
  function showProfileDropdown(triggerEl) {
    let pop = document.getElementById('opm-profile-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-profile-popover';
      pop.style.cssText = 'position: fixed; width: 260px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100000; font-family: Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.right = (window.innerWidth - rect.right) + 'px';
    pop.innerHTML = `
      <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 16px;">
        <div style="font-weight: 700; color: #0f172a; font-size: 13px;">Administrator</div>
        <div style="font-size: 11px; color: #64748b;">admin@opmanager.corp</div>
        <div style="font-size: 10px; font-weight: 600; color: #16a34a; margin-top: 4px;">● Super Administrator (Full Central Control)</div>
      </div>
      <div style="padding: 6px 0; font-size: 12px;">
        <div class="pop-item" style="padding: 8px 16px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">My Account & API Keys</div>
        <div class="pop-item" style="padding: 8px 16px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Audit Trail & Logins</div>
        <div class="pop-item" style="padding: 8px 16px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Security & 2FA Status (Enabled)</div>
        <div style="border-top: 1px solid #f1f5f9; margin: 4px 0;"></div>
        <div class="pop-item" id="logout-btn" style="padding: 8px 16px; color: #dc2626; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">Sign Out of Central</div>
      </div>
    `;
    pop.style.display = 'block';
    const logout = pop.querySelector('#logout-btn');
    if (logout) {
      logout.onclick = () => {
        localStorage.removeItem('opm_auth_user');
        localStorage.removeItem('opm_auth_token');
        showToast('Signing out of OpManager Central administrative session...');
        pop.style.display = 'none';
        setTimeout(() => { window.location.href = '/login.html'; }, 300);
      };
    }
  }

  // --- NOTIFICATIONS DROPDOWN ---
  function showNotificationsDropdown(triggerEl) {
    let pop = document.getElementById('opm-notif-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-notif-popover';
      pop.style.cssText = 'position: fixed; width: 340px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100000; font-family: Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.right = (window.innerWidth - rect.right) + 'px';
    pop.innerHTML = `
      <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: #0f172a; font-size: 13px;">Active Central Notifications (${state.alarms.length})</span>
        <span id="mark-all-read" style="font-size: 11px; color: #0070e0; cursor: pointer; font-weight: 600;">Mark all read</span>
      </div>
      <div style="max-height: 320px; overflow-y: auto; font-size: 12px;">
        ${state.alarms.slice(0, 4).map(a => `
          <div style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-weight: 700; color: #0070e0;">${a.device}</span>
              <span style="font-size: 10px; color: #94a3b8;">${a.time}</span>
            </div>
            <div style="color: #334155; font-size: 11px; line-height: 1.4;">${a.message}</div>
          </div>
        `).join('')}
      </div>
      <div style="background: #ffffff; border-top: 1px solid #e2e8f0; padding: 8px 16px; text-align: center;">
        <a href="#/alarms/list/active" style="font-size: 11px; color: #0070e0; text-decoration: none; font-weight: 600;">View All in Alarms Workspace →</a>
      </div>
    `;
    pop.style.display = 'block';
    const markRead = pop.querySelector('#mark-all-read');
    if (markRead) markRead.onclick = () => {
      showToast('All notifications marked as read.');
      const badge = document.querySelector('.opm-bell-badge');
      if (badge) badge.style.display = 'none';
      pop.style.display = 'none';
    };
  }

  // --- QUICK LINKS DROPDOWN ---
  function showQuickLinksDropdown(triggerEl) {
    let pop = document.getElementById('opm-quick-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-quick-popover';
      pop.style.cssText = 'position: fixed; width: 220px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100000; font-family: Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.right = (window.innerWidth - rect.right) + 'px';
    pop.innerHTML = `
      <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 14px; font-weight: 700; color: #0f172a; font-size: 12px;">Quick Utilities</div>
      <div style="padding: 4px 0; font-size: 12px;">
        <div id="ql-add-dev" style="padding: 8px 14px; font-size: 12px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">+ Add New Device</div>
        <div id="ql-disc" style="padding: 8px 14px; font-size: 12px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Run Discovery Rule</div>
        <div id="ql-backup" style="padding: 8px 14px; font-size: 12px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Backup Configuration Now</div>
        <div id="ql-snmp" style="padding: 8px 14px; font-size: 12px; color: #334155; cursor: pointer;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">SNMP Credential Test</div>
      </div>
    `;
    pop.style.display = 'block';
    pop.querySelector('#ql-add-dev').onclick = () => { pop.style.display = 'none'; showAddDeviceModal(); };
    pop.querySelector('#ql-disc').onclick = () => { pop.style.display = 'none'; showToast('Subnet discovery scheduled on Dubai & NY probes.'); };
    pop.querySelector('#ql-backup').onclick = () => { pop.style.display = 'none'; showToast('Backup triggered for core routers and switches.'); };
    pop.querySelector('#ql-snmp').onclick = () => { pop.style.display = 'none'; showToast('SNMP v2c credentials verified: OK.'); };
  }

  // --- QUICK ACTIONS DROPDOWN (+) ---
  function showQuickAddDropdown(triggerEl) {
    let pop = document.getElementById('opm-quickadd-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-quickadd-popover';
      pop.style.cssText = 'position: fixed; width: 280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 20px -3px rgba(0,0,0,0.18); z-index: 100000; font-family: Lato, Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.right = (window.innerWidth - rect.right) + 'px';
    pop.innerHTML = `
      <div style="background: #212121; color: #ffffff; padding: 10px 14px; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span>Central Quick Actions</span>
        <span style="font-size: 10px; background: #1d824e; padding: 1px 6px; border-radius: 3px; font-weight: 700;">PROBE GRID</span>
      </div>
      <div style="padding: 6px 0; font-size: 12px; color: #334155;">
        <div class="opm-qa-item" data-action="add-device" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <img src="/images/deviceicons/server.png" style="width: 16px; height: 16px;" />
          <div>
            <div style="font-weight: 600; color: #0f172a;">+ Add Single Device</div>
            <div style="font-size: 10px; color: #64748b;">Add IP / SNMP / WMI / SSH node</div>
          </div>
        </div>
        <div class="opm-qa-item" data-action="subnet-sweep" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d824e" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          <div>
            <div style="font-weight: 600; color: #0f172a;">Subnet Sweep Discovery Wizard</div>
            <div style="font-size: 10px; color: #64748b;">Automated CIDR / IP range probe scan</div>
          </div>
        </div>
        <div class="opm-qa-item" data-action="diagnostic-tools" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <div>
            <div style="font-weight: 600; color: #0f172a;">OpUtils Diagnostics & Ping Suite</div>
            <div style="font-size: 10px; color: #64748b;">Ping, Traceroute, Port Mapper & Terminal</div>
          </div>
        </div>
        <div class="opm-qa-item" data-action="mib-browser" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <div>
            <div style="font-weight: 600; color: #0f172a;">SNMP MIB Browser & Catalog</div>
            <div style="font-size: 10px; color: #64748b;">Walk RFC1213 / Cisco MIB OIDs</div>
          </div>
        </div>
        <div class="opm-qa-item" data-action="add-probe" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <div>
            <div style="font-weight: 600; color: #0f172a;">Register Remote Probe</div>
            <div style="font-size: 10px; color: #64748b;">Connect branch office or cloud probe</div>
          </div>
        </div>
        <div class="opm-qa-item" data-action="add-widget" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <div>
            <div style="font-weight: 600; color: #0f172a;">Add Dashboard Widget</div>
            <div style="font-size: 10px; color: #64748b;">Customize Central NOC views & graphs</div>
          </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; margin: 4px 0;"></div>
        <div class="opm-qa-item" data-action="download-agent" style="padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <div>
            <div style="font-weight: 600; color: #0070e0;">Download Monitoring Agent</div>
            <div style="font-size: 10px; color: #64748b;">OpManagerAgent (Windows / macOS)</div>
          </div>
        </div>
      </div>
    `;
    pop.style.display = 'block';

    pop.querySelectorAll('.opm-qa-item').forEach(item => {
      item.onmouseenter = () => item.style.background = '#f8fafc';
      item.onmouseleave = () => item.style.background = 'transparent';
      item.onclick = (e) => {
        e.stopPropagation();
        pop.style.display = 'none';
        const action = item.getAttribute('data-action');
        if (action === 'add-device') showAddDeviceModal();
        else if (action === 'subnet-sweep') showSubnetDiscoveryModal();
        else if (action === 'diagnostic-tools') showNetworkToolsModal(null, 'ping');
        else if (action === 'mib-browser') showNetworkToolsModal(null, 'mib');
        else if (action === 'add-probe') showProbeDetailsModal('new');
        else if (action === 'add-widget') showAddWidgetModal();
        else if (action === 'download-agent') {
          window.open('/agents/OpManagerAgent.exe', '_blank');
          showToast('Downloading OpManager Host Monitoring Agent...');
        }
      };
    });
  }

  // --- PROBE SELECTOR DROPDOWN ---
  function showProbeSelectorDropdown(triggerEl) {
    let pop = document.getElementById('opm-probe-selector-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-probe-selector-popover';
      pop.style.cssText = 'position: fixed; width: 280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 20px -3px rgba(0,0,0,0.18); z-index: 100000; font-family: Lato, Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.left = rect.left + 'px';
    pop.innerHTML = `
      <div style="background: #212121; color: #ffffff; padding: 10px 14px; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span>Select Monitoring Probe</span>
        <span style="font-size: 10px; background: #1d824e; padding: 1px 6px; border-radius: 3px; font-weight: 700;">4 ONLINE</span>
      </div>
      <div style="padding: 4px 0; font-size: 12px; max-height: 300px; overflow-y: auto;">
        <div class="opm-probe-sel-item" data-id="all" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; ${state.selectedProbe === 'all' ? 'background: #eff6ff; font-weight: 700;' : ''}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #0070e0;"></span>
            <span style="color: #0f172a;">All Probes (${state.probes.length})</span>
          </div>
          <span style="font-size: 11px; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 3px;">Consolidated</span>
        </div>
        ${state.probes.map(pr => `
          <div class="opm-probe-sel-item" data-id="${pr.id}" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f8fafc; ${state.selectedProbe == pr.id ? 'background: #eff6ff; font-weight: 700;' : ''}">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
                <span style="color: #0f172a;">${pr.name}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; margin-left: 16px;">${pr.ip} • ${pr.latency}ms • ${pr.devicesCount} devices</div>
            </div>
            <span style="font-size: 10px; color: #166534; font-weight: 600;">UP</span>
          </div>
        `).join('')}
      </div>
      <div style="background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 8px 14px; text-align: center;">
        <a href="#/settings/probes" style="font-size: 11px; color: #0070e0; text-decoration: none; font-weight: 600;">Manage Probes & Clusters →</a>
      </div>
    `;
    pop.style.display = 'block';

    pop.querySelectorAll('.opm-probe-sel-item').forEach(item => {
      item.onmouseenter = () => { if (item.getAttribute('data-id') != state.selectedProbe) item.style.background = '#f8fafc'; };
      item.onmouseleave = () => { if (item.getAttribute('data-id') != state.selectedProbe) item.style.background = 'transparent'; };
      item.onclick = (e) => {
        e.stopPropagation();
        pop.style.display = 'none';
        const id = item.getAttribute('data-id');
        state.selectedProbe = id;
        const selectedLabel = triggerEl.querySelector('.zselectbox__selected');
        if (selectedLabel) {
          const pr = state.probes.find(p => p.id == id);
          selectedLabel.innerText = pr ? pr.name : 'All Probes';
        }
        showToast(id === 'all' ? 'Switched view to All Probes' : `Switched view to ${state.probes.find(p => p.id == id)?.name || id}`);
        handleRoute();
      };
    });
  }

  // --- SECURITY SCORE DROPDOWN ---
  function showSecurityScoreDropdown(triggerEl) {
    let pop = document.getElementById('opm-sec-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'opm-sec-popover';
      pop.style.cssText = 'position: fixed; width: 280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100000; font-family: Roboto, -apple-system, sans-serif; overflow: hidden;';
      document.body.appendChild(pop);
      document.addEventListener('click', (e) => {
        if (!pop.contains(e.target) && e.target !== triggerEl) pop.style.display = 'none';
      });
    }
    const rect = triggerEl.getBoundingClientRect();
    pop.style.top = (rect.bottom + 6) + 'px';
    pop.style.right = (window.innerWidth - rect.right) + 'px';
    pop.innerHTML = `
      <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #0f172a; font-size: 13px;">Security Posture</span>
          <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 8px; border-radius: 10px; font-size: 11px;">88 / 100</span>
        </div>
      </div>
      <div style="padding: 12px 16px; font-size: 11px; line-height: 1.6; color: #475569;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Probe TLS Encryption:</span>
          <span style="color: #16a34a; font-weight: 600;">Enforced (TLS 1.3)</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>SNMP v3 Enforcement:</span>
          <span style="color: #ea580c; font-weight: 600;">82% (2 Legacy v2c)</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Configuration Drift:</span>
          <span style="color: ${state.configDriftFixed ? '#16a34a' : '#dc2626'}; font-weight: 600;">${state.configDriftFixed ? '0 Unsaved' : '1 Unsaved Drift'}</span>
        </div>
      </div>
    `;
    pop.style.display = 'block';
  }

  // --- GLOBAL SEARCH MODAL ---
    function showGlobalSearchModal() {
    let modal = document.getElementById('opm-search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-search-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 680px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
          <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; background: #f8fafc;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#49bd80" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="global-search-input" placeholder="Search devices, IP addresses, alarms, probes, or diagnostic tools..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 15px; color: #0f172a; font-weight: 500;">
            <span style="font-size: 11px; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-family: monospace;">ESC to close</span>
            <span id="close-search-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
          </div>
          <div id="search-results-list" style="max-height: 440px; overflow-y: auto; padding: 10px 0; font-size: 12px;"></div>
          <div style="padding: 8px 18px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>ManageEngine OpManager Central Enterprise Omnibox</span>
            <span>Navigate with <kbd style="background: #e2e8f0; padding: 1px 4px; border-radius: 2px;">↑</kbd> <kbd style="background: #e2e8f0; padding: 1px 4px; border-radius: 2px;">↓</kbd> or Click</span>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    const input = modal.querySelector('#global-search-input');
    const list = modal.querySelector('#search-results-list');

    const renderResults = (query = '') => {
      const q = query.toLowerCase().trim();
      let html = '';

      // 1. Devices
      const devMatches = q 
        ? state.devices.filter(d => d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.category.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q) || d.probe.toLowerCase().includes(q))
        : state.devices.slice(0, 4);

      if (devMatches.length > 0) {
        html += `<div style="padding: 6px 18px; color: #0070e0; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f0f9ff; margin: 4px 0;">Network Devices (${devMatches.length})</div>`;
        html += devMatches.map(d => `
          <div class="search-item-row" data-type="device" data-id="${d.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getDeviceTypeIcon(d.type, d.category, 18)}
              <div>
                <span style="font-weight: 700; color: #0f172a;">${d.name}</span>
                <span style="color: #64748b; font-family: monospace; margin-left: 6px;">(${d.ip})</span>
                <span style="font-size: 10px; background: #f1f5f9; padding: 1px 5px; border-radius: 2px; margin-left: 6px;">${d.category}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getStatusBadge(d.status)}
              <span style="font-size: 11px; color: #0284c7; font-weight: 600;">${d.probe}</span>
            </div>
          </div>
        `).join('');
      }

      // 2. Alarms
      const alarmMatches = q 
        ? state.alarms.filter(a => a.device.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.severity.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q))
        : state.alarms.slice(0, 3);

      if (alarmMatches.length > 0) {
        html += `<div style="padding: 6px 18px; color: #dc2626; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef2f2; margin: 6px 0 4px 0;">Active Alarms (${alarmMatches.length})</div>`;
        html += alarmMatches.map(a => `
          <div class="search-item-row" data-type="alarm" data-id="${a.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${a.severity === 'Critical' ? '#dc2626' : a.severity === 'Trouble' ? '#ea580c' : '#ca8a04'}; flex-shrink: 0;"></span>
              <div>
                <span style="font-weight: 700; color: #0f172a;">${a.device}</span>
                <span style="color: #475569; margin-left: 6px;">${a.entity}</span>
                <div style="font-size: 11px; color: #64748b; margin-top: 1px;">${a.message}</div>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              ${getStatusBadge(a.severity)}
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${a.time}</div>
            </div>
          </div>
        `).join('');
      }

      // 3. Remote Probes
      const probeMatches = q 
        ? state.probes.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.ip.includes(q))
        : state.probes.slice(0, 4);

      if (probeMatches.length > 0) {
        html += `<div style="padding: 6px 18px; color: #16a34a; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f0fdf4; margin: 6px 0 4px 0;">Distributed Probes (${probeMatches.length})</div>`;
        html += probeMatches.map(p => `
          <div class="search-item-row" data-type="probe" data-id="${p.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
              <div>
                <span style="font-weight: 700; color: #0f172a;">${p.name}</span>
                <span style="color: #64748b; font-family: monospace; margin-left: 6px;">(${p.ip}:8060)</span>
              </div>
            </div>
            <span style="font-size: 11px; color: #0284c7; font-weight: 600;">${p.devicesCount || p.devices || 4} Managed Nodes</span>
          </div>
        `).join('');
      }

      // 4. Tools
      const tools = [
        { name: 'SNMP MIB Browser', desc: 'Browse MIB tree, query OIDs, test agent values', act: 'mib' },
        { name: 'ICMP Ping & Traceroute Diagnostics', desc: 'Test packet reachability and latency', act: 'ping' },
        { name: 'Ask Zia AI Assistant', desc: 'AI-assisted RCA and operational telemetry queries', act: 'zia' },
        { name: 'Executive SLA Compliance Reports', desc: 'Generate printable high-availability SLA documents', act: 'sla' },
        { name: 'Global Probes WAN World Map', desc: 'Geographic probe distribution & latency arcs', act: 'worldmap' }
      ];
      const toolMatches = q ? tools.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) : tools.slice(0, 3);
      if (toolMatches.length > 0) {
        html += `<div style="padding: 6px 18px; color: #7c3aed; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #faf5ff; margin: 6px 0 4px 0;">Enterprise Diagnostics &amp; Tools (${toolMatches.length})</div>`;
        html += toolMatches.map(t => `
          <div class="search-item-row" data-type="tool" data-act="${t.act}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div>
              <span style="font-weight: 700; color: #7c3aed;">${t.name}</span>
              <div style="font-size: 11px; color: #64748b;">${t.desc}</div>
            </div>
            <span style="font-size: 11px; color: #0070e0; font-weight: 600;">Launch ↗</span>
          </div>
        `).join('');
      }

      if (!html) {
        html = '<div style="padding: 30px; text-align: center; color: #94a3b8;">No matching assets, alarms, probes, or tools found.</div>';
      }

      list.innerHTML = html;

      // Event listeners on search rows
      list.querySelectorAll('.search-item-row').forEach(row => {
        row.onclick = () => {
          modal.style.display = 'none';
          const type = row.getAttribute('data-type');
          const id = row.getAttribute('data-id');
          if (type === 'device') {
            const dev = state.devices.find(d => d.id == id);
            if (dev) showDeviceSnapshotModal(dev);
          } else if (type === 'alarm') {
            const alm = state.alarms.find(a => a.id == id);
            if (alm) showAlarmDetailsDrawer(alm);
          } else if (type === 'probe') {
            showProbeDetailsModal(Number(id));
          } else if (type === 'tool') {
            const act = row.getAttribute('data-act');
            if (act === 'mib') showNetworkToolsModal(null, 'mib');
            else if (act === 'ping') showNetworkToolsModal('10.40.1.1', 'ping');
            else if (act === 'zia') showZiaAssistantModal();
            else if (act === 'sla') { state.subTabs.reports = 'sla'; window.location.hash = '#/reports'; }
            else if (act === 'worldmap') { state.subTabs.maps = 'world'; window.location.hash = '#/maps'; }
          }
        };
      });
    };

    renderResults();
    if (input) {
      input.value = '';
      input.focus();
      input.oninput = (e) => {
        renderResults(e.target.value);
      };
    }
    const closeBtn = modal.querySelector('#close-search-btn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }

  
  // -------------------------------------------------------------
  // MODAL: NCM AUTOMATED POLICY REMEDIATION FIXLET
  // -------------------------------------------------------------
  function showNcmRemediationModal(ruleTitle, targetDev) {
    let modal = document.getElementById('opm-ncm-remed-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ncm-remed-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const dev = targetDev || state.devices[0];
    const rule = ruleTitle || 'Cisco IOS Golden Baseline (SSH v2 & Password Encryption)';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine NCM Automated Policy Remediation Fixlet</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${dev.name} (${dev.ip})</strong> &bull; Monitored via ${dev.probe}</div>
            </div>
          </div>
          <span id="close-ncm-remed-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 20px;">
          <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #991b1b;">Violated Policy Rule: ${rule}</div>
              <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Running configuration lacks SSH v2 timeout parameters and global password-encryption service.</div>
            </div>
            <span style="background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 3px;">NON-COMPLIANT</span>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Remediation CLI Batch Script (Cisco IOS-XE / JunOS Syntax):</div>
          <div style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; line-height: 1.6; padding: 14px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #334155;">
            configure terminal<br>
            <span style="color: #4ade80;">service password-encryption</span><br>
            <span style="color: #4ade80;">no ip http server</span><br>
            <span style="color: #4ade80;">ip ssh time-out 60</span><br>
            <span style="color: #4ade80;">ip ssh authentication-retries 3</span><br>
            <span style="color: #4ade80;">ip ssh version 2</span><br>
            <span style="color: #4ade80;">line vty 0 4</span><br>
            <span style="color: #4ade80;"> transport input ssh</span><br>
            end<br>
            write memory
          </div>

          <div id="ncm-exec-terminal" style="display: none; background: #0b0f19; border: 1px solid #1e293b; border-radius: 6px; padding: 14px; font-family: monospace; font-size: 11px; line-height: 1.6; color: #34d399; max-height: 150px; overflow-y: auto; margin-bottom: 16px;"></div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; color: #64748b;">
              Protocol: <strong>SSH Port 22</strong> &bull; Auth: <strong>Probe Stored Key</strong> &bull; Rollback: <strong>Enabled</strong>
            </div>
            <div style="display: flex; gap: 10px;">
              <button id="ncm-cancel-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button id="ncm-execute-script-btn" style="background: #16a34a; border: none; color: #fff; padding: 7px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                ▶ Push Config via Probe SSH
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-ncm-remed-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ncm-cancel-btn').onclick = () => { modal.style.display = 'none'; };

    const execBtn = modal.querySelector('#ncm-execute-script-btn');
    const term = modal.querySelector('#ncm-exec-terminal');

    execBtn.onclick = () => {
      execBtn.disabled = true;
      execBtn.innerText = 'Pushing Config...';
      term.style.display = 'block';
      term.innerHTML = '<div style="color: #94a3b8;">[1/4] Establishing SSHv2 session to 10.40.1.1:22 via Dubai Campus Core Probe...</div>';
      
      setTimeout(() => {
        term.innerHTML += '<div style="color: #38bdf8;">[2/4] Probe authenticated. Session encryption: aes256-gcm. Pushing configuration commands...</div>';
      }, 400);

      setTimeout(() => {
        term.innerHTML += '<div style="color: #38bdf8;">[3/4] DXB-CORE-SW-01(config)# service password-encryption<br>DXB-CORE-SW-01(config)# ip ssh version 2<br>DXB-CORE-SW-01# write memory [OK]</div>';
      }, 900);

      setTimeout(() => {
        term.innerHTML += '<div style="color: #4ade80; font-weight: 700;">[4/4] Commit SUCCESS: 0 errors. Compliance rule verified as 100% COMPLIANT.</div>';
        execBtn.style.background = '#475569';
        execBtn.innerText = '✓ Remediation Applied';
        state.configDriftFixed = true;
        showToast('NCM Remediation Fixlet successfully executed on ' + dev.name + '.');
      }, 1400);
    };
  }

  // -------------------------------------------------------------
  // MODAL: WAN LINK TRAFFIC & CARRIER INSPECTOR
  // -------------------------------------------------------------
  function showWanLinkDetailsModal(linkData) {
    let modal = document.getElementById('opm-wan-link-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-wan-link-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const l = linkData || {
      name: 'Central HQ <--> Dubai Campus Core Trans-WAN',
      carrier: 'Tata Communications Global MPLS & SD-WAN',
      src: 'Central HQ (10.0.0.10)',
      dst: 'DXB-CORE-SW-01 (10.40.1.1)',
      srcInf: 'TenGigabitEthernet0/0/1',
      dstInf: 'FortyGigabitEthernet1/0/48',
      speed: '10 Gbps Committed / 40 Gbps Burst',
      rtt: '18.2 ms',
      inUtil: '78.5%',
      outUtil: '62.0%',
      inRate: '1,840 Mbps',
      outRate: '1,280 Mbps',
      status: 'Critical Alert',
      discards: '14 CRC Errors'
    };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 660px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">WAN</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine Business View &bull; WAN Link Telemetry</div>
              <div style="font-size: 11px; color: #64748b;">${l.name}</div>
            </div>
          </div>
          <span id="close-wan-link-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 20px;">
          <div style="background: ${l.status.includes('Critical') ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${l.status.includes('Critical') ? '#fee2e2' : '#bbf7d0'}; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: ${l.status.includes('Critical') ? '#991b1b' : '#166534'};">${l.carrier}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Latency: <strong>${l.rtt}</strong> &bull; Packet Loss: <strong>0.0%</strong> &bull; MTU: <strong>1500</strong></div>
            </div>
            <span style="background: ${l.status.includes('Critical') ? '#dc2626' : '#16a34a'}; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">${l.status}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Near-End (Source CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">${l.src}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">${l.srcInf}</div>
              <div style="font-size: 12px; color: #16a34a; font-weight: 700; margin-top: 6px;">IN: ${l.inRate} (${l.inUtil})</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Far-End (Destination CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">${l.dst}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">${l.dstInf}</div>
              <div style="font-size: 12px; color: #0284c7; font-weight: 700; margin-top: 6px;">OUT: ${l.outRate} (${l.outUtil})</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #64748b; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px;">
            <strong>Interface Health Warning:</strong> 14 CRC alignment errors recorded on ${l.dstInf}. Optical transceiver DDM diagnostics show RX light at -19.8 dBm (Below -14.0 dBm optical threshold).
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="wan-link-ipsla-btn" style="background: #10b981; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">📞 Cisco IP SLA VoIP</button>
            <button id="wan-link-poll-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">⚡ Re-poll Link Interfaces</button>
            <button id="wan-link-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-wan-link-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#wan-link-close-btn').onclick = () => { modal.style.display = 'none'; };
    const pBtn = modal.querySelector('#wan-link-poll-btn');
        const ipslaBtn = modal.querySelector('#wan-link-ipsla-btn');
    if (ipslaBtn) {
      ipslaBtn.onclick = () => {
        showIpSlaVoipModal(l);
      };
    }
    if (pBtn) {
      pBtn.onclick = () => {
        showToast('Direct SNMP interface counter re-poll executed for ' + l.srcInf + ' and ' + l.dstInf + '.');
      };
    }
  }


  
  // -------------------------------------------------------------
  // MODAL: NETFLOW ANALYZER RAW FLOW RECORDS STREAM
  // -------------------------------------------------------------
  function showNetFlowRawRecordsModal(convData) {
    let modal = document.getElementById('opm-nfa-records-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-nfa-records-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const records = [
      { time: '14:20:01.412', src: '10.10.1.50:5432', dst: '10.20.1.50:5432', proto: 'TCP (06)', app: 'PostgreSQL_Sync', bytes: '18.42 MB', pkts: '12,840', flags: 'ACK, PSH', nextHop: '10.40.1.1', dscp: 'AF41 (Priority)' },
      { time: '14:20:00.890', src: '10.40.1.50:443', dst: '172.217.14.206:58210', proto: 'TCP (06)', app: 'HTTPS_SSL', bytes: '14.19 MB', pkts: '9,410', flags: 'ACK', nextHop: '10.10.0.1', dscp: 'CS0 (Default)' },
      { time: '14:19:59.124', src: '10.10.1.1:500', dst: '10.30.1.1:500', proto: 'UDP (17)', app: 'IPSec_ESP', bytes: '9.84 MB', pkts: '6,720', flags: '-', nextHop: '10.0.0.1', dscp: 'CS6 (Routing)' },
      { time: '14:19:57.652', src: '10.20.1.10:445', dst: '10.20.1.50:49280', proto: 'TCP (06)', app: 'SMBv3_Storage', bytes: '6.12 MB', pkts: '4,180', flags: 'ACK, PSH', nextHop: 'Direct', dscp: 'AF12 (Bulk)' },
      { time: '14:19:55.318', src: '10.40.1.1:179', dst: '192.168.10.1:179', proto: 'TCP (06)', app: 'BGP_Routing', bytes: '1.24 MB', pkts: '840', flags: 'ACK', nextHop: '10.40.1.1', dscp: 'CS6 (Control)' },
      { time: '14:19:52.109', src: '10.10.1.50:53', dst: '8.8.8.8:53', proto: 'UDP (17)', app: 'DNS_Query', bytes: '420 KB', pkts: '3,100', flags: '-', nextHop: '10.10.0.1', dscp: 'CS0 (Default)' }
    ];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1040px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NFA</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NetFlow Analyzer &bull; Raw Flow Records Stream</div>
              <div style="font-size: 11px; color: #64748b;">UDP 2055 / 9996 Ingestion &bull; Monitored on <strong style="color: #0070e0;">NY-CORE-RTR-01 (TenGigE0/0/0/0)</strong> &bull; IPFIX v10</div>
            </div>
          </div>
          <button id="close-nfa-records-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- Filter Bar -->
        <div style="padding: 10px 24px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #334155; font-weight: 700;">Filter Streams:</span>
            <input type="text" id="nfa-filter-input" placeholder="Search IP, Port or App..." style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 220px; outline: none;">
            <select id="nfa-proto-select" style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; background: #fff;">
              <option value="all">All Protocols (TCP/UDP/ICMP)</option>
              <option value="tcp">TCP (06)</option>
              <option value="udp">UDP (17)</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="nfa-export-pcap-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export PCAP / Flow CSV</button>
          </div>
        </div>

        <!-- Flow Records Table -->
        <div style="flex: 1; overflow-y: auto; padding: 14px 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left; font-weight: 700;">
                <th style="padding: 8px 10px;">Time</th>
                <th style="padding: 8px 10px;">Source (IP:Port)</th>
                <th style="padding: 8px 10px;">Destination (IP:Port)</th>
                <th style="padding: 8px 10px;">Protocol</th>
                <th style="padding: 8px 10px;">Application</th>
                <th style="padding: 8px 10px;">Volume / Pkts</th>
                <th style="padding: 8px 10px;">TCP Flags</th>
                <th style="padding: 8px 10px;">Next Hop</th>
                <th style="padding: 8px 10px;">DSCP QoS</th>
              </tr>
            </thead>
            <tbody id="nfa-records-tbody">
              ${records.map(r => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 10px; font-family: monospace; color: #64748b;">${r.time}</td>
                  <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0284c7;">${r.src}</td>
                  <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0f172a;">${r.dst}</td>
                  <td style="padding: 8px 10px;"><span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-weight: 600;">${r.proto}</span></td>
                  <td style="padding: 8px 10px; font-weight: 600; color: #16a34a;">${r.app}</td>
                  <td style="padding: 8px 10px; font-weight: 700;">${r.bytes} <span style="font-size: 10px; color: #64748b;">(${r.pkts})</span></td>
                  <td style="padding: 8px 10px; font-family: monospace; color: #475569;">${r.flags}</td>
                  <td style="padding: 8px 10px; font-family: monospace; color: #64748b;">${r.nextHop}</td>
                  <td style="padding: 8px 10px;"><span style="background: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 2px;">${r.dscp}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine NetFlow Collector Engine &bull; UDP Listener Rate: <strong>1,480 flows/sec</strong> &bull; Zero Drops</span>
          <button id="nfa-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Stream</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-nfa-records-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-export-pcap-btn').onclick = () => {
      showToast('Exported NetFlow IPFIX packet capture (PCAP) archive.');
    };
  }


  
  // -------------------------------------------------------------
  // MODAL: MANAGEENGINE STANDALONE MIB BROWSER (RFC1213 & ENTERPRISE)
  // -------------------------------------------------------------
  function showMibBrowserModal(targetIp, initialOid) {
    let modal = document.getElementById('opm-standalone-mib-browser-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-standalone-mib-browser-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const host = targetIp || '10.10.1.1';
    let currentOid = initialOid || '.1.3.6.1.2.1.1.1.0';

    const mibNodes = [
      { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr', type: 'OCTET STRING', access: 'read-only', desc: 'A textual description of the network entity. Includes hardware type, software OS, and version.' },
      { oid: '.1.3.6.1.2.1.1.2.0', name: 'sysObjectID', type: 'OBJECT IDENTIFIER', access: 'read-only', desc: 'The vendor authoritative identification of the network management subsystem.' },
      { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime', type: 'TimeTicks', access: 'read-only', desc: 'The time (in hundredths of a second) since the network management portion of the system was last re-initialized.' },
      { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact', type: 'OCTET STRING', access: 'read-write', desc: 'The textual identification of the contact person for this managed node, together with information on how to contact this person.' },
      { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName', type: 'OCTET STRING', access: 'read-write', desc: 'An administratively assigned name for this managed node. Matches the device FQDN.' },
      { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation', type: 'OCTET STRING', access: 'read-write', desc: 'The physical location of this node (e.g., telephone closet, 3rd floor).' },
      { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber', type: 'INTEGER', access: 'read-only', desc: 'The number of network interfaces (regardless of their current state) present on this system.' },
      { oid: '.1.3.6.1.2.1.2.2.1.2', name: 'ifDescr', type: 'OCTET STRING', access: 'read-only', desc: 'A textual string containing information about the interface (e.g. TenGigabitEthernet0/0/1).' },
      { oid: '.1.3.6.1.2.1.4.1.0', name: 'ipForwarding', type: 'INTEGER', access: 'read-write', desc: 'The indication of whether this entity is acting as an IP router in respect to the forwarding of datagrams.' },
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3', name: 'ciscoEnvMonTemperatureStatusValue', type: 'Gauge32', access: 'read-only', desc: 'Current chassis ambient temperature value in degrees Celsius.' }
    ];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 96vw; height: 86vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800;">MIB</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpManager &bull; Standalone MIB Browser v12.9</div>
              <div style="font-size: 11px; color: #94a3b8;">RFC1213-MIB / CISCO-STACK-MIB / HOST-RESOURCES-MIB &bull; SNMPv1, v2c, v3 Engine</div>
            </div>
          </div>
          <button id="close-mib-browser-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- SNMP Connection / Query Bar -->
        <div style="padding: 10px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Target Host:</span>
            <input type="text" id="mib-host-input" value="${host}" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 130px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Port:</span>
            <input type="text" id="mib-port-input" value="161" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 50px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Community:</span>
            <input type="password" id="mib-comm-input" value="public" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 80px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Version:</span>
            <select id="mib-ver-select" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; background: #fff;">
              <option value="v2c" selected>SNMPv2c</option>
              <option value="v1">SNMPv1</option>
              <option value="v3">SNMPv3 (USM)</option>
            </select>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <span style="font-weight: 700; color: #475569;">OID:</span>
            <input type="text" id="mib-oid-input" value="${currentOid}" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; flex: 1; font-family: monospace; font-weight: 600; color: #0284c7;">
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="mib-btn-get" style="background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; cursor: pointer;">Get</button>
            <button id="mib-btn-getnext" style="background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; cursor: pointer;">Get Next</button>
            <button id="mib-btn-walk" style="background: #16a34a; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 700; cursor: pointer;">SNMP Walk</button>
            <button id="mib-btn-clear" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Clear</button>
          </div>
        </div>

        <!-- Body: Split Tree & PDU Console -->
        <div style="flex: 1; display: flex; overflow: hidden;">
          <!-- Left: MIB Tree -->
          <div style="width: 320px; border-right: 1px solid #e2e8f0; background: #fafbfc; overflow-y: auto; padding: 12px; font-size: 11px;">
            <div style="font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Loaded MIB Modules:</div>
            
            <div style="margin-left: 4px; line-height: 1.8;">
              <div style="color: #0f172a; font-weight: 700;">📂 iso.org.dod.internet (1.3.6.1)</div>
              <div style="margin-left: 14px;">
                <div style="color: #0f172a; font-weight: 700;">📂 mgmt (2)</div>
                <div style="margin-left: 14px;">
                  <div style="color: #0f172a; font-weight: 700;">📂 mib-2 (1)</div>
                  
                  <!-- system branch -->
                  <div style="margin-left: 14px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 system (1)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      ${mibNodes.slice(0, 6).map(n => `
                        <div class="opm-mib-tree-leaf" data-oid="${n.oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 0 4px; border-radius: 2px; font-weight: 700;">S</span>
                          <span>${n.name}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- interfaces branch -->
                  <div style="margin-left: 14px; margin-top: 4px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 interfaces (2)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      ${mibNodes.slice(6, 8).map(n => `
                        <div class="opm-mib-tree-leaf" data-oid="${n.oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 10px; background: #dcfce7; color: #15803d; padding: 0 4px; border-radius: 2px; font-weight: 700;">T</span>
                          <span>${n.name}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- ip branch -->
                  <div style="margin-left: 14px; margin-top: 4px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 ip (4)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      <div class="opm-mib-tree-leaf" data-oid="${mibNodes[8].oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 0 4px; border-radius: 2px; font-weight: 700;">S</span>
                        <span>${mibNodes[8].name}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- enterprises branch -->
              <div style="margin-left: 14px; margin-top: 4px;">
                <div style="color: #0f172a; font-weight: 700;">📂 private.enterprises (4.1)</div>
                <div style="margin-left: 14px;">
                  <div style="color: #9333ea; font-weight: 700;">📂 cisco (9)</div>
                  <div style="margin-left: 14px;">
                    <div class="opm-mib-tree-leaf" data-oid="${mibNodes[9].oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 10px; background: #f3e8ff; color: #7e22ce; padding: 0 4px; border-radius: 2px; font-weight: 700;">E</span>
                      <span>${mibNodes[9].name}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right: OID Metadata & PDU Terminal -->
          <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #ffffff;">
            <!-- Node Metadata -->
            <div id="mib-node-metadata-box" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px;">
              <div style="display: flex; gap: 20px; margin-bottom: 6px;">
                <div><span style="color: #64748b;">Node Name:</span> <strong id="meta-name" style="color: #0f172a; font-size: 12px;">sysDescr</strong></div>
                <div><span style="color: #64748b;">Syntax:</span> <strong id="meta-type" style="color: #0284c7;">OCTET STRING</strong></div>
                <div><span style="color: #64748b;">Access:</span> <strong id="meta-access" style="color: #16a34a;">read-only</strong></div>
                <div><span style="color: #64748b;">Status:</span> <strong style="color: #0f172a;">current</strong></div>
              </div>
              <div><span style="color: #64748b;">Description:</span> <span id="meta-desc" style="color: #334155;">A textual description of the network entity. Includes hardware type, software OS, and version.</span></div>
            </div>

            <!-- Terminal Output -->
            <div style="padding: 8px 18px; background: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 700; display: flex; justify-content: space-between;">
              <span>SNMP++ PDU Exchange Log Terminal</span>
              <span style="color: #4ade80;">UDP 161 ACTIVE</span>
            </div>
            <div id="mib-pdu-console" style="flex: 1; overflow-y: auto; background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 14px 18px; line-height: 1.6;">
              <span style="color: #64748b;">// ManageEngine MIB Browser initialized for target ${host}</span><br>
              <span style="color: #64748b;">// Ready for SNMP GET / GETNEXT / WALK operations...</span><br>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine SNMP Engine &bull; Timeout: 3000ms &bull; Retries: 2</span>
          <button id="mib-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close MIB Browser</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-mib-browser-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#mib-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };

    const oidInput = modal.querySelector('#mib-oid-input');
    const pduConsole = modal.querySelector('#mib-pdu-console');
    const metaName = modal.querySelector('#meta-name');
    const metaType = modal.querySelector('#meta-type');
    const metaAccess = modal.querySelector('#meta-access');
    const metaDesc = modal.querySelector('#meta-desc');

    modal.querySelectorAll('.opm-mib-tree-leaf').forEach(leaf => {
      leaf.onclick = () => {
        const leafOid = leaf.getAttribute('data-oid');
        const node = mibNodes.find(n => n.oid === leafOid);
        if (node) {
          oidInput.value = node.oid;
          metaName.textContent = node.name;
          metaType.textContent = node.type;
          metaAccess.textContent = node.access;
          metaDesc.textContent = node.desc;
          modal.querySelectorAll('.opm-mib-tree-leaf').forEach(l => l.style.background = 'transparent');
          leaf.style.background = '#e2e8f0';
        }
      };
    });

    function logPdu(msg, color = '#38bdf8') {
      const time = new Date().toTimeString().split(' ')[0];
      pduConsole.innerHTML += `<span style="color: #94a3b8;">[${time}]</span> <span style="color: ${color};">${msg}</span><br>`;
      pduConsole.scrollTop = pduConsole.scrollHeight;
    }

    modal.querySelector('#mib-btn-clear').onclick = () => {
      pduConsole.innerHTML = '<span style="color: #64748b;">// Console cleared.</span><br>';
    };

    modal.querySelector('#mib-btn-get').onclick = () => {
      const targetOid = oidInput.value.trim();
      const node = mibNodes.find(n => n.oid === targetOid) || { name: 'leafNode', type: 'OCTET STRING' };
      const dev = (state.devices || []).find(d => d.ip === host) || { name: 'NY-CORE-RTR-01', vendor: 'Cisco IOS' };
      
      let val = dev.name;
      if (node.name === 'sysDescr') val = 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4, RELEASE SOFTWARE (fc1)';
      else if (node.name === 'sysObjectID') val = '.1.3.6.1.4.1.9.1.516';
      else if (node.name === 'sysUpTime') val = '148 days, 12:44:19.82 (1283305982 timeticks)';
      else if (node.name === 'sysContact') val = 'noc-support@manageengine.internal';
      else if (node.name === 'sysLocation') val = 'US-East Equinix DC4, Rack B04-U12';
      else if (node.name === 'ifNumber') val = '52 interfaces';
      else if (node.name === 'ciscoEnvMonTemperatureStatusValue') val = '34 Celsius (Normal)';

      logPdu(`Sent GetRequest-PDU (reqId ${Math.floor(Math.random()*90000+10000)}) to ${host}:161 for ${targetOid}`, '#94a3b8');
      setTimeout(() => {
        logPdu(`Received Response-PDU from ${host} (errStatus=0, errIndex=0):\n   ${targetOid} (${node.name}) = ${node.type}: "${val}"`, '#4ade80');
      }, 250);
    };

    modal.querySelector('#mib-btn-getnext').onclick = () => {
      const targetOid = oidInput.value.trim();
      const idx = mibNodes.findIndex(n => n.oid === targetOid);
      const nextNode = (idx >= 0 && idx < mibNodes.length - 1) ? mibNodes[idx + 1] : mibNodes[0];
      oidInput.value = nextNode.oid;
      metaName.textContent = nextNode.name;
      metaType.textContent = nextNode.type;
      metaAccess.textContent = nextNode.access;
      metaDesc.textContent = nextNode.desc;
      logPdu(`GetNextRequest-PDU on ${targetOid} resolved next OID: ${nextNode.oid} (${nextNode.name})`, '#fbbf24');
    };

    modal.querySelector('#mib-btn-walk').onclick = () => {
      logPdu(`Executing SNMP Walk tree on ${host} starting at .1.3.6.1.2.1.1...`, '#38bdf8');
      mibNodes.slice(0, 6).forEach((n, i) => {
        setTimeout(() => {
          let val = n.name === 'sysDescr' ? 'Cisco IOS Software C2960' : (n.name === 'sysUpTime' ? '148 days' : 'Equinix DC4');
          logPdu(`${n.oid} = ${n.type}: "${val}"`, '#4ade80');
        }, (i + 1) * 150);
      });
    };
  }

  // -------------------------------------------------------------
  // MODAL: CISCO IP SLA VOIP & JITTER TELEMETRY
  // -------------------------------------------------------------
  function showIpSlaVoipModal(linkData) {
    let modal = document.getElementById('opm-ipsla-voip-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ipsla-voip-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const l = linkData || {
      name: 'Central HQ <--> Dubai Campus Core Trans-WAN',
      carrier: 'Tata Communications Global MPLS',
      src: 'NY-CORE-RTR-01',
      dst: 'DXB-CORE-SW-01'
    };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 780px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #10b981; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800;">VoIP</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine Cisco IP SLA &bull; VoIP &amp; Jitter Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8;">${l.name} &bull; Operation ID: <strong>101 (VoIP UDP Jitter)</strong></div>
            </div>
          </div>
          <span id="close-ipsla-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px;">
          <!-- Telemetry KPI Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">VoIP MOS Score</div>
              <div style="font-size: 26px; font-weight: 900; color: #15803d; margin: 4px 0;">4.38</div>
              <span style="font-size: 10px; background: #22c55e; color: #fff; padding: 1px 6px; border-radius: 10px; font-weight: 700;">EXCELLENT (ITU-T)</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Round Trip Time</div>
              <div style="font-size: 26px; font-weight: 900; color: #0284c7; margin: 4px 0;">14.2<span style="font-size: 13px;">ms</span></div>
              <span style="font-size: 10px; color: #64748b;">SLA Threshold: &lt; 50ms</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average Jitter</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">1.2<span style="font-size: 13px;">ms</span></div>
              <span style="font-size: 10px; color: #16a34a; font-weight: 600;">+1.2ms / -0.8ms</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Packet Loss</div>
              <div style="font-size: 26px; font-weight: 900; color: #16a34a; margin: 4px 0;">0.00<span style="font-size: 13px;">%</span></div>
              <span style="font-size: 10px; color: #16a34a; font-weight: 600;">0 / 1,000 pkts</span>
            </div>
          </div>

          <!-- Codec & Technical Details -->
          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <div style="color: #64748b;">Synthesized Codec: <strong style="color: #0f172a;">G.711u (64 Kbps)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Packetization Interval: <strong style="color: #0f172a;">20 ms (160 bytes payload)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Calculated R-Factor: <strong style="color: #16a34a;">91.4 / 100</strong></div>
            </div>
            <div>
              <div style="color: #64748b;">Source Responder: <strong style="color: #0f172a;">${l.src} (Cisco IOS-XE)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Destination Target: <strong style="color: #0f172a;">${l.dst} (UDP 1967)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">IP SLA Compliance: <strong style="color: #16a34a;">100% (No Breaches in 24h)</strong></div>
            </div>
          </div>

          <!-- Simulated Jitter Distribution Histogram (SVG) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RTP Packet Jitter Distribution (Last 1,000 Synthetic Samples)</span>
              <span style="color: #10b981; font-weight: 700;">Within +/- 3ms Nominal Boundary</span>
            </div>
            <svg width="100%" height="60" viewBox="0 0 700 60" style="overflow: visible;">
              <line x1="0" y1="50" x2="700" y2="50" stroke="#cbd5e1" stroke-width="1" />
              <!-- Bars -->
              <rect x="50" y="30" width="35" height="20" fill="#38bdf8" rx="2" />
              <rect x="110" y="20" width="35" height="30" fill="#38bdf8" rx="2" />
              <rect x="170" y="10" width="35" height="40" fill="#22c55e" rx="2" />
              <rect x="230" y="5" width="35" height="45" fill="#22c55e" rx="2" />
              <rect x="290" y="8" width="35" height="42" fill="#22c55e" rx="2" />
              <rect x="350" y="15" width="35" height="35" fill="#22c55e" rx="2" />
              <rect x="410" y="22" width="35" height="28" fill="#38bdf8" rx="2" />
              <rect x="470" y="35" width="35" height="15" fill="#38bdf8" rx="2" />
              <rect x="530" y="42" width="35" height="8" fill="#94a3b8" rx="2" />
              <rect x="590" y="46" width="35" height="4" fill="#94a3b8" rx="2" />
              <text x="247" y="58" font-size="9" fill="#64748b" text-anchor="middle">1.2ms peak</text>
            </svg>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="ipsla-test-btn" style="background: #10b981; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">⚡ Trigger On-Demand 1,000 Pkt Test</button>
            <button id="close-ipsla-bottom-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-ipsla-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-ipsla-bottom-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ipsla-test-btn').onclick = () => {
      showToast('Executed 1,000 UDP packet Cisco IP SLA synthetic jitter poll on ' + l.src + '. All SLAs verified healthy.');
    };
  }

  // -------------------------------------------------------------
  // MODAL: SCHEDULE DOWNTIME / ALARM SUPPRESSION
  // -------------------------------------------------------------
  function showScheduleDowntimeModal(targetDev) {
    let modal = document.getElementById('opm-schedule-downtime-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-schedule-downtime-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const dev = targetDev || (state.devices && state.devices[0]) || { name: 'NY-CORE-RTR-01', ip: '10.10.1.1' };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #eab308; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">⏱️</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Schedule Downtime / Alarm Suppression Window</div>
              <div style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central Maintenance Engine</div>
            </div>
          </div>
          <span id="close-downtime-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px; font-size: 12px;">
          <!-- Target Device -->
          <div style="margin-bottom: 14px;">
            <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Target Device(s) / Business View:</label>
            <select id="downtime-dev-select" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
              ${(state.devices || []).map(d => `<option value="${d.id}" ${d.name === dev.name ? 'selected' : ''}>${d.name} (${d.ip}) - ${d.type}</option>`).join('')}
              <option value="all-ny">All Devices in Probe [New York Central Probe]</option>
              <option value="all-core">Business View [Global WAN Core Infrastructure]</option>
            </select>
          </div>

          <!-- Schedule Type -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Maintenance Window Duration:</label>
              <select id="downtime-duration-select" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="1">1 Hour Immediate</option>
                <option value="2" selected>2 Hours Immediate</option>
                <option value="4">4 Hours (Major Maintenance)</option>
                <option value="weekend">Recurring Weekend Window (Sat 22:00 - Sun 04:00 UTC)</option>
              </select>
            </div>
            <div>
              <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Change Reference / Ticket #:</label>
              <input type="text" id="downtime-chg-ref" value="CHG-2026-9812 (Core Switch Patching)" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
            </div>
          </div>

          <!-- Suppression Rules -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Suppression Policies during Window:</div>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Suppress new Alarm generation (Mark events as Maintenance in DB)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Mute Notification Profiles (No SMS, Email, or Slack alerts dispatched)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Suppress ServiceDesk Plus ticket auto-creation</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Display yellow Maintenance Mode icon on Device Snapshot &amp; Business Views</span>
            </label>
          </div>

          <!-- Reason -->
          <div style="margin-bottom: 16px;">
            <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Operational Reason:</label>
            <textarea id="downtime-reason-input" style="width: 100%; height: 50px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-family: sans-serif; box-sizing: border-box;">Scheduled Cisco IOS-XE software patching and redundant power-supply failover verification.</textarea>
          </div>

          <!-- Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-downtime-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="save-downtime-btn" style="background: #eab308; color: #0f172a; border: none; padding: 7px 18px; border-radius: 4px; font-weight: 800; cursor: pointer;">🛡️ Activate Downtime Window</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-downtime-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#cancel-downtime-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#save-downtime-btn').onclick = () => {
      const selectedId = modal.querySelector('#downtime-dev-select').value;
      modal.style.display = 'none';
      showToast('Scheduled Downtime active for selected target. Alarms suppressed for 2 hours.');
    };
  }


  
  // -------------------------------------------------------------
  // MODAL: MANAGEENGINE VISUAL WORKFLOW PLAYBOOK DESIGNER
  // -------------------------------------------------------------
  function showNewWorkflowModal() {
    let modal = document.getElementById('opm-visual-workflow-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-visual-workflow-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1120px; max-width: 96vw; height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #8b5cf6; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">⚡</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpManager Central &bull; Visual IT Automation Workflow Designer</div>
              <div style="font-size: 11px; color: #94a3b8;">Event-Driven Remediation Playbook Builder &bull; Drag &amp; Drop Action Canvas</div>
            </div>
          </div>
          <button id="close-wf-designer-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- Top Configuration Bar -->
        <div style="padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; gap: 16px; align-items: center; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <span style="font-weight: 700; color: #334155;">Workflow Name:</span>
            <input type="text" id="wf-name-input" value="Core Switch Auto-Remediation & Failover Playbook" style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #0f172a;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #334155;">Trigger Criteria:</span>
            <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
              <option value="alarm-crit">On Alarm: Severity = Critical</option>
              <option value="alarm-down">On Alarm: Device Down</option>
              <option value="trap">On SNMP Trap: IF-MIB::linkDown</option>
            </select>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #334155;">Target Scope:</span>
            <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
              <option value="category">Category: Routers &amp; Core Switches</option>
              <option value="probe">Probe: New York Central</option>
              <option value="all">All Enterprise Devices (16)</option>
            </select>
          </div>
        </div>

        <!-- Main Workspace: Palette + Canvas -->
        <div style="flex: 1; display: flex; overflow: hidden;">
          <!-- Left: Action Library Palette -->
          <div style="width: 260px; border-right: 1px solid #e2e8f0; background: #fafbfc; overflow-y: auto; padding: 14px; font-size: 11px;">
            <div style="font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase;">ManageEngine Action Palette</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="color: #64748b; font-weight: 700; margin-top: 4px;">Network Diagnostics</div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">🌐</span>
                <span style="font-weight: 600; color: #1e293b;">Ping Device (ICMP)</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">🛣️</span>
                <span style="font-weight: 600; color: #1e293b;">Traceroute Hop Check</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">⚡</span>
                <span style="font-weight: 600; color: #1e293b;">Trigger Immediate Poll</span>
              </div>

              <div style="color: #64748b; font-weight: 700; margin-top: 8px;">Remediation &amp; Scripting</div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">🔄</span>
                <span style="font-weight: 600; color: #1e293b;">Restart Service (SSH/WMI)</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">💻</span>
                <span style="font-weight: 600; color: #1e293b;">Push CLI Configuration</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">💾</span>
                <span style="font-weight: 600; color: #1e293b;">NCM Trigger Backup</span>
              </div>

              <div style="color: #64748b; font-weight: 700; margin-top: 8px;">ITSM &amp; Notifications</div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">🎫</span>
                <span style="font-weight: 600; color: #1e293b;">Log SDP Priority 1 Ticket</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">💬</span>
                <span style="font-weight: 600; color: #1e293b;">Send Slack SecOps Alert</span>
              </div>
              <div class="wf-palette-item" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #ffffff; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span style="font-size: 14px;">✅</span>
                <span style="font-weight: 600; color: #1e293b;">Acknowledge Alarm</span>
              </div>
            </div>
          </div>

          <!-- Center: Visual Workflow Canvas -->
          <div style="flex: 1; background: #f1f5f9; position: relative; overflow: auto; padding: 30px; display: flex; flex-direction: column; align-items: center;">
            
            <!-- Step 1: Start Trigger -->
            <div style="background: #ffffff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 12px 20px; width: 340px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; position: relative;">
              <div style="font-size: 10px; font-weight: 800; color: #8b5cf6; text-transform: uppercase;">Playbook Trigger</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">⚡ Critical Alarm Generated</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Scope: Routers &amp; Core Switches</div>
            </div>

            <!-- Connector Line -->
            <div style="width: 2px; height: 32px; background: #94a3b8;"></div>

            <!-- Step 2: Decision Node -->
            <div style="background: #ffffff; border: 2px solid #0284c7; border-radius: 8px; padding: 12px 20px; width: 340px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center;">
              <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">Condition Check</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">🌐 ICMP Ping Target Reachable?</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Timeout 2000ms &bull; 3 Packets</div>
            </div>

            <!-- Split Connector -->
            <div style="width: 2px; height: 24px; background: #94a3b8;"></div>
            <div style="display: flex; gap: 140px; align-items: flex-start;">
              
              <!-- Branch YES -->
              <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="font-size: 10px; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">YES (Reachable)</div>
                <div style="width: 2px; height: 16px; background: #22c55e;"></div>
                
                <div style="background: #ffffff; border: 2px solid #22c55e; border-radius: 8px; padding: 10px 16px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;">
                  <div style="font-size: 10px; font-weight: 800; color: #16a34a;">Action 1</div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">💻 Push SSH CLI Script</div>
                  <div style="font-size: 10px; color: #64748b; font-family: monospace;">clear ip arp-cache</div>
                </div>

                <div style="width: 2px; height: 16px; background: #22c55e;"></div>

                <div style="background: #ffffff; border: 2px solid #22c55e; border-radius: 8px; padding: 10px 16px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;">
                  <div style="font-size: 10px; font-weight: 800; color: #16a34a;">Action 2</div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">✅ Acknowledge Alarm</div>
                  <div style="font-size: 10px; color: #64748b;">Annotate: Auto-healed</div>
                </div>
              </div>

              <!-- Branch NO -->
              <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="font-size: 10px; font-weight: 800; color: #dc2626; background: #fee2e2; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">NO (Unreachable)</div>
                <div style="width: 2px; height: 16px; background: #ef4444;"></div>
                
                <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 8px; padding: 10px 16px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;">
                  <div style="font-size: 10px; font-weight: 800; color: #dc2626;">Action 1</div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">🎫 Log SDP Priority 1 Ticket</div>
                  <div style="font-size: 10px; color: #64748b;">Assign: Core NetOps Team</div>
                </div>

                <div style="width: 2px; height: 16px; background: #ef4444;"></div>

                <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 8px; padding: 10px 16px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;">
                  <div style="font-size: 10px; font-weight: 800; color: #dc2626;">Action 2</div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">💬 Slack #noc-critical</div>
                  <div style="font-size: 10px; color: #64748b;">Dispatch PagerDuty webhook</div>
                </div>
              </div>

            </div>

            <!-- Execution Simulation Console -->
            <div id="wf-test-output-console" style="margin-top: 24px; width: 700px; background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 12px 16px; border-radius: 6px; display: none; line-height: 1.6;">
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <button id="wf-test-run-btn" style="background: #0284c7; color: #ffffff; border: none; padding: 8px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            ▶ Test Run Playbook on NY-CORE-RTR-01
          </button>
          <div style="display: flex; gap: 10px;">
            <button id="wf-cancel-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="wf-save-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 8px 20px; border-radius: 4px; font-size: 12px; font-weight: 800; cursor: pointer;">💾 Deploy &amp; Activate Playbook</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-wf-designer-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#wf-cancel-btn').onclick = () => { modal.style.display = 'none'; };
    
    const consoleBox = modal.querySelector('#wf-test-output-console');
    modal.querySelector('#wf-test-run-btn').onclick = () => {
      consoleBox.style.display = 'block';
      consoleBox.innerHTML = '<span style="color: #94a3b8;">[14:26:01] Initializing simulated workflow execution against NY-CORE-RTR-01 (10.10.1.1)...</span><br>';
      setTimeout(() => {
        consoleBox.innerHTML += '<span style="color: #4ade80;">[14:26:02] Step 1: Evaluating trigger criteria... MATCH (Severity Critical).</span><br>';
      }, 300);
      setTimeout(() => {
        consoleBox.innerHTML += '<span style="color: #4ade80;">[14:26:03] Step 2: Testing ICMP reachability... 3/3 packets answered (0.8ms RTT) -> Branch YES.</span><br>';
      }, 600);
      setTimeout(() => {
        consoleBox.innerHTML += '<span style="color: #38bdf8;">[14:26:04] Step 3: Executing SSH CLI script ("clear ip arp-cache")... SUCCESS (exit code 0).</span><br>';
      }, 900);
      setTimeout(() => {
        consoleBox.innerHTML += '<span style="color: #22c55e; font-weight: 700;">[14:26:05] Step 4: Alarm acknowledged and annotated. Playbook execution PASSED in 1.4s.</span>';
      }, 1200);
    };

    modal.querySelector('#wf-save-btn').onclick = () => {
      modal.style.display = 'none';
      showToast('Workflow Playbook "Core Switch Auto-Remediation" deployed and active across all Core Switches.');
    };
  }

  // -------------------------------------------------------------
  // MODAL: OPUTILS 48-PORT SWITCH PORT MAPPER (SPM) & ROGUE MAC
  // -------------------------------------------------------------
  function showSwitchPortMapperModal(switchDev) {
    let modal = document.getElementById('opm-spm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-spm-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const dev = switchDev || { name: 'NY-CORE-RTR-01', ip: '10.10.1.1', model: 'Cisco Catalyst 2960-X 48-GigE' };

    const ports = [];
    for (let i = 1; i <= 48; i++) {
      const isUp = i <= 38;
      const portName = 'GigabitEthernet0/' + i;
      const speed = i > 44 ? '10 Gbps Full' : '1000 Mbps Full';
      const mac = isUp ? ('00:1A:2B:' + (i < 10 ? '0' + i : i) + ':4C:' + (99 - i)) : '-';
      const ip = isUp ? ('10.10.1.' + (100 + i)) : '-';
      const hostname = isUp ? (i % 3 === 0 ? 'corp-srv-db' + i : (i % 2 === 0 ? 'workstation-ny' + i : 'ap-cisco-wifi' + i)) : '-';
      const vlan = i <= 24 ? 'VLAN 10 (Users)' : (i <= 44 ? 'VLAN 20 (Servers)' : 'VLAN 99 (Core Trunk)');
      const vendor = isUp ? (i % 4 === 0 ? 'Dell Inc.' : (i % 3 === 0 ? 'Intel Corp.' : (i % 2 === 0 ? 'Apple Inc.' : 'Cisco Systems'))) : '-';
      const status = isUp ? 'Up' : (i === 42 ? 'Admin Disabled' : 'Down');
      ports.push({ index: i, name: portName, status, speed, mac, ip, hostname, vlan, vendor });
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1160px; max-width: 96vw; height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">SPM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpUtils &bull; Switch Port Mapper (SPM)</div>
              <div style="font-size: 11px; color: #94a3b8;">Switch: <strong style="color: #38bdf8;">${dev.name} (${dev.ip})</strong> &bull; Model: <strong>${dev.model}</strong> &bull; Total Ports: <strong>48</strong></div>
            </div>
          </div>
          <button id="close-spm-modal-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- Port KPI Bar -->
        <div style="padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 3px 10px; border-radius: 12px;">● 38 Connected (Up)</span>
            <span style="background: #f1f5f9; color: #475569; font-weight: 700; padding: 3px 10px; border-radius: 12px;">○ 10 Available (Free)</span>
            <span style="background: #fee2e2; color: #991b1b; font-weight: 700; padding: 3px 10px; border-radius: 12px;">0 Rogue Devices</span>
            <span style="color: #64748b;">SNMP ifTable Polling Interval: <strong>5 Mins</strong></span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="spm-rescan-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Re-Scan Ports via SNMP</button>
            <button id="spm-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export CSV</button>
          </div>
        </div>

        <!-- 48-Port Table -->
        <div style="flex: 1; overflow-y: auto; padding: 14px 22px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                <th style="padding: 8px 10px; width: 40px;">#</th>
                <th style="padding: 8px 10px;">Port Name</th>
                <th style="padding: 8px 10px;">Status</th>
                <th style="padding: 8px 10px;">Speed / Duplex</th>
                <th style="padding: 8px 10px;">Connected MAC</th>
                <th style="padding: 8px 10px;">Bound IP Address</th>
                <th style="padding: 8px 10px;">DNS Hostname</th>
                <th style="padding: 8px 10px;">VLAN</th>
                <th style="padding: 8px 10px;">NIC Vendor</th>
                <th style="padding: 8px 10px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${ports.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 7px 10px; font-family: monospace; color: #64748b;">${p.index}</td>
                  <td style="padding: 7px 10px; font-weight: 700; color: #0284c7; font-family: monospace;">${p.name}</td>
                  <td style="padding: 7px 10px;">
                    <span style="background: ${p.status === 'Up' ? '#dcfce7' : (p.status.includes('Admin') ? '#fee2e2' : '#f1f5f9')}; color: ${p.status === 'Up' ? '#166534' : (p.status.includes('Admin') ? '#991b1b' : '#64748b')}; font-weight: 700; padding: 2px 6px; border-radius: 3px;">
                      ${p.status}
                    </span>
                  </td>
                  <td style="padding: 7px 10px; color: #334155;">${p.speed}</td>
                  <td style="padding: 7px 10px; font-family: monospace; font-weight: 600; color: #0f172a;">${p.mac}</td>
                  <td style="padding: 7px 10px; font-family: monospace; color: #0284c7;">${p.ip}</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #475569;">${p.hostname}</td>
                  <td style="padding: 7px 10px;"><span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 5px; border-radius: 2px;">${p.vlan}</span></td>
                  <td style="padding: 7px 10px; color: #64748b;">${p.vendor}</td>
                  <td style="padding: 7px 10px; text-align: right;">
                    <button class="spm-shut-btn" data-port="${p.name}" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #dc2626; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 600; cursor: pointer;">Shut</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine SPM Engine &bull; MAC IP Address Mapping Engine &bull; Zero Rogue Devices Detected</span>
          <button id="spm-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close SPM</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-spm-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#spm-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#spm-rescan-btn').onclick = () => {
      showToast('SNMP ifTable / ipNetToMediaTable walk initiated on ' + dev.name + '. Refreshing 48 switch ports.');
    };
    modal.querySelector('#spm-export-btn').onclick = () => {
      showToast('Exported 48-port switch port map CSV.');
    };
    modal.querySelectorAll('.spm-shut-btn').forEach(btn => {
      btn.onclick = () => {
        const port = btn.getAttribute('data-port');
        showToast('SSH Command dispatched to ' + dev.name + ': interface ' + port + ' -> shutdown.');
      };
    });
  }

  // -------------------------------------------------------------
  // MODAL: STORAGE ARRAY & LUN LATENCY INSPECTOR
  // -------------------------------------------------------------
  function showStorageArrayModal(targetArray) {
    let modal = document.getElementById('opm-storage-array-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-storage-array-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const arr = targetArray || {
      name: 'NetApp AFF A400 NVMe All-Flash SAN',
      ip: '10.10.1.80',
      controllers: 'Active-Active Dual Node HA (Node-01 / Node-02)',
      protocol: 'FCP (16 Gbps) & NVMe-oF'
    };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 860px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px;">💾</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpManager Central &bull; SAN Storage &amp; LUN Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8;">${arr.name} (${arr.ip}) &bull; ${arr.controllers}</div>
            </div>
          </div>
          <span id="close-storage-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px; font-size: 12px;">
          <!-- Dual Controller Telemetry -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <div style="font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase;">Storage Processor Node-01 (Primary)</div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 4px 0;">12% CPU &bull; 0.4ms RTT</div>
              <div style="font-size: 11px; color: #64748b;">Read Cache Hit Rate: <strong>98.4%</strong> &bull; IOPS: <strong>21,800</strong></div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <div style="font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase;">Storage Processor Node-02 (HA Partner)</div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 4px 0;">14% CPU &bull; 0.4ms RTT</div>
              <div style="font-size: 11px; color: #64748b;">NVRAM Mirrored Log: <strong>Synchronized</strong> &bull; IOPS: <strong>20,700</strong></div>
            </div>
          </div>

          <!-- LUNs Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
            <div style="padding: 10px 14px; background: #fafbfc; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">
              Allocated Storage LUNs &amp; Datastores
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 8px 10px;">LUN Name</th>
                  <th style="padding: 8px 10px;">Datastore Target</th>
                  <th style="padding: 8px 10px;">Capacity</th>
                  <th style="padding: 8px 10px;">IOPS</th>
                  <th style="padding: 8px 10px;">Read Latency</th>
                  <th style="padding: 8px 10px;">Write Latency</th>
                  <th style="padding: 8px 10px;">Queue Depth</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 10px; font-weight: 700; color: #0284c7;">LUN_VMWARE_DS01</td>
                  <td style="padding: 8px 10px; color: #334155;">ESXi Cluster (NY-DC4)</td>
                  <td style="padding: 8px 10px; font-family: monospace;">8.4 TB / 12 TB (70%)</td>
                  <td style="padding: 8px 10px; font-weight: 700; color: #16a34a;">14,800</td>
                  <td style="padding: 8px 10px; font-weight: 600;">0.6 ms</td>
                  <td style="padding: 8px 10px; font-weight: 600;">0.9 ms</td>
                  <td style="padding: 8px 10px; color: #64748b;">4.2</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 10px; font-weight: 700; color: #0284c7;">LUN_ORACLE_REDO</td>
                  <td style="padding: 8px 10px; color: #334155;">Oracle RAC Production</td>
                  <td style="padding: 8px 10px; font-family: monospace;">2.1 TB / 4 TB (52%)</td>
                  <td style="padding: 8px 10px; font-weight: 700; color: #16a34a;">22,400</td>
                  <td style="padding: 8px 10px; font-weight: 600;">0.3 ms</td>
                  <td style="padding: 8px 10px; font-weight: 600;">0.5 ms</td>
                  <td style="padding: 8px 10px; color: #64748b;">2.1</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; font-weight: 700; color: #0284c7;">LUN_POSTGRES_DATA</td>
                  <td style="padding: 8px 10px; color: #334155;">PostgreSQL High-Availability</td>
                  <td style="padding: 8px 10px; font-family: monospace;">6.8 TB / 10 TB (68%)</td>
                  <td style="padding: 8px 10px; font-weight: 700; color: #16a34a;">12,100</td>
                  <td style="padding: 8px 10px; font-weight: 600;">0.7 ms</td>
                  <td style="padding: 8px 10px; font-weight: 600;">1.1 ms</td>
                  <td style="padding: 8px 10px; color: #64748b;">3.8</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="storage-repoll-btn" style="background: #0284c7; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">⚡ Re-poll SMI-S / REST Counters</button>
            <button id="close-storage-bottom-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-storage-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-storage-bottom-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#storage-repoll-btn').onclick = () => {
      showToast('Polled NetApp REST API / SMI-S counters. All 3 LUNs reporting normal NVMe performance.');
    };
  }

  // -------------------------------------------------------------
  // MODAL: SSL / TLS CERTIFICATE CHAIN & CIPHER SUITE INSPECTOR
  // -------------------------------------------------------------
  function showSslCertificateModal(targetHost) {
    let modal = document.getElementById('opm-ssl-cert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ssl-cert-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const host = targetHost || 'opmanager-central.enterprise.corp:8443';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 840px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #16a34a; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">🔒</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine SSL / TLS Certificate &amp; Cipher Suite Inspector</div>
              <div style="font-size: 11px; color: #94a3b8;">Host: <strong style="color: #38bdf8;">${host}</strong> &bull; Protocol: <strong>TLSv1.3</strong></div>
            </div>
          </div>
          <span id="close-ssl-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px; font-size: 12px;">
          <!-- Trust Chain -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Certificate Trust Chain (PKI Hierarchy)</div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-family: monospace;">
              <div style="color: #64748b;">🔒 Root CA: <strong>DigiCert Global Root G2</strong> (Valid to 2031-01-15)</div>
              <div style="padding-left: 20px; color: #64748b;">↳ 🔒 Intermediate CA: <strong>DigiCert TLS RSA SHA256 2020 CA1</strong> (Valid to 2029-09-23)</div>
              <div style="padding-left: 40px; color: #16a34a; font-weight: 700;">↳ 🔒 Server Leaf: <strong>opmanager-central.enterprise.corp</strong> (Valid to 2027-11-30 &bull; 387 Days Remaining)</div>
            </div>
          </div>

          <!-- Cipher & Protocol Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Negotiated Cipher Suite:</div>
              <div style="font-family: monospace; font-size: 11px; color: #0284c7; font-weight: 700;">TLS_AES_256_GCM_SHA384</div>
              <div style="margin-top: 6px; font-size: 11px; color: #64748b;">Key Exchange: <strong>ECDHE (X25519)</strong></div>
              <div style="font-size: 11px; color: #64748b;">Bulk Encryption: <strong>AES-256 (GCM Authenticated)</strong></div>
              <div style="font-size: 11px; color: #16a34a; font-weight: 700; margin-top: 4px;">✓ Forward Secrecy Enabled (PFS)</div>
            </div>

            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Vulnerability Assessment:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                <div>Heartbleed: <strong style="color: #16a34a;">Safe ✓</strong></div>
                <div>POODLE: <strong style="color: #16a34a;">Safe ✓</strong></div>
                <div>ROBOT: <strong style="color: #16a34a;">Safe ✓</strong></div>
                <div>DROWN: <strong style="color: #16a34a;">Safe ✓</strong></div>
                <div>LOGJAM: <strong style="color: #16a34a;">Safe ✓</strong></div>
                <div>BEAST: <strong style="color: #16a34a;">Safe ✓</strong></div>
              </div>
              <div style="font-size: 10px; color: #166534; background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-weight: 700; display: inline-block; margin-top: 6px;">Qualys SSL Labs Score: A+</div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="ssl-handshake-poll-btn" style="background: #16a34a; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">⚡ Probe Live TLS Handshake</button>
            <button id="close-ssl-bottom-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-ssl-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-ssl-bottom-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ssl-handshake-poll-btn').onclick = () => {
      showToast('Live TLS 1.3 handshake probed for ' + host + '. Certificate valid with A+ rating.');
    };
  }


  // --- TRAINING VIDEOS MODAL ---
  function showTrainingVideosModal() {
    let modal = document.getElementById('opm-videos-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-videos-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 740px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); overflow: hidden;">
          <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #212121; color: #ffffff;">
            <div>
              <div style="font-size: 15px; font-weight: 700;">ManageEngine OpManager Central Official Video Tutorials</div>
              <div style="font-size: 11px; color: #94a3b8;">Step-by-step enterprise ITOM walkthroughs for v12.9.203 (Build 129203)</div>
            </div>
            <button id="close-videos-btn" style="background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-height: 480px; overflow-y: auto;">
            ${[
              { title: '1. Network Discovery & Probe Deployment', duration: '14:32', author: 'Zoho ITOM Architect', thumb: '/apiclient/fluidicv3/itom/images/training/opm_nwdiscovery-22909e42002f86a7d9fbbe8bbb7c06a8.png' },
              { title: '2. Device Templates, SNMP & WMI Monitoring', duration: '12:20', author: 'Product Specialist', thumb: '/apiclient/fluidicv3/itom/images/training/opm_monitoring-0f4f380ce27ac12c503479169bcd181c.png' },
              { title: '3. Alerts, Business Views, Reports & 3D Maps', duration: '09:45', author: 'Network Engineer', thumb: '/apiclient/fluidicv3/itom/images/training/opm_alertsreportsmaps-05296ca681af198d4b29a43a06293df4.png' },
              { title: '4. NCM, NetFlow, Firewall & IPAM Add-Ons', duration: '08:15', author: 'ITOM Solutions Lead', thumb: '/apiclient/fluidicv3/itom/images/training/opm_addons-0a705d2abdecdb6765f0e738ebcad7d2.png' }
            ].map(v => `
              <div class="opm-video-card" data-title="${v.title}" style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fafbfc; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="height: 120px; background: #0f172a; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img src="${v.thumb}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" />
                  <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(73, 189, 128, 0.92); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">▶</div>
                  <span style="position: absolute; bottom: 6px; right: 8px; background: rgba(15, 23, 42, 0.85); color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${v.duration}</span>
                </div>
                <div style="padding: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${v.title}</div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 6px;">
                    <span>${v.author}</span>
                    <span style="font-weight: 700; color: #0070e0;">Watch HD →</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-videos-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelectorAll('.opm-video-card').forEach(c => {
      c.onclick = () => {
        showToast('Playing tutorial: ' + c.getAttribute('data-title'));
      };
    });
  }

  // --- SLIDE-OUT ALARM DETAILS DRAWER ---
  function showAlarmDetailsDrawer(alm) {
    state.selectedAlarm = alm;
    let drawer = document.getElementById('opm-alarm-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'opm-alarm-drawer';
      drawer.style.cssText = 'position: fixed; top: 0; right: 0; width: 620px; max-width: 90vw; height: 100vh; background: #ffffff; box-shadow: -10px 0 25px rgba(0,0,0,0.15); z-index: 99999; display: flex; flex-direction: column; font-family: Roboto, -apple-system, sans-serif; transition: transform 0.3s ease;';
      document.body.appendChild(drawer);
    }
    drawer.innerHTML = `
      <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${getStatusBadge(alm.severity)}
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${alm.device}</div>
            <div style="font-size: 11px; color: #64748b;">${alm.probe} • Entity: ${alm.entity}</div>
          </div>
        </div>
        <button id="close-drawer-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 24px;">
        <!-- Zia AI Root Cause Analysis -->
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 16px;">✨</span>
            <span style="font-size: 13px; font-weight: 700; color: #5b21b6;">Zia AI Anomaly Correlation & Root Cause Analysis</span>
          </div>
          <p style="font-size: 12px; color: #4c1d95; line-height: 1.5; margin-bottom: 10px;">
            Zia correlated this CPU spike (93.4%) with interface FortyGigE1/0/48 flapping down 1 minute prior. Automated STP reconvergence generated 42,000 packets/sec broadcast surge across Dubai VLAN 10.
          </p>
          <div style="background: #ffffff; border: 1px solid #c4b5fd; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #5b21b6;">
            <strong>Recommended Action:</strong> Run 'show logging | include STP' and verify rapid-pvst portfast state on leaf switches.
          </div>
        </div>

        <!-- ManageEngine 24-Hour Availability Time Line Bar (from mobile-app-opm.png) -->
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #ffffff; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase;">Time Line (Last 24 Hours)</span>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 10px; color: #475569;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #9333ea;"></span> On Maintenance (0%)</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #49bd80;"></span> Up Time (98.4%)</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444;"></span> Down Time (1.6%)</span>
            </div>
          </div>
          <div style="height: 12px; width: 100%; border-radius: 6px; overflow: hidden; display: flex; background: #e2e8f0;">
            <div style="width: 82%; background: #49bd80;" title="Up Time (10:00 - 06:15)"></div>
            <div style="width: 4%; background: #ef4444;" title="Alert Window (06:15 - 06:40)"></div>
            <div style="width: 14%; background: #49bd80;" title="Up Time (06:40 - 09:59)"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">
            <span>10:00</span>
            <span>22:00</span>
            <span>09:59</span>
          </div>
        </div>

        <!-- Official NetFlow Alert Traffic Drilldown (Exact replica of NFA_Alert_Sample.png) -->
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #fafbfc; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase;">NetFlow Alert Traffic Drilldown (IN / OUT)</span>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 10px; font-weight: 700;">
              <span style="display: flex; align-items: center; gap: 4px; color: #334155;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #29c5f6;"></span> IN</span>
              <span style="display: flex; align-items: center; gap: 4px; color: #334155;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f8a346;"></span> OUT</span>
            </div>
          </div>
          <svg width="100%" height="76" viewBox="0 0 420 76" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 8px;">
            <line x1="30" y1="15" x2="405" y2="15" stroke="#f1f5f9" stroke-width="1" />
            <line x1="30" y1="36" x2="405" y2="36" stroke="#f1f5f9" stroke-width="1" />
            <line x1="30" y1="58" x2="405" y2="58" stroke="#cbd5e1" stroke-width="1" />
            <text x="4" y="18" font-size="8" fill="#64748b">15M</text>
            <text x="4" y="39" font-size="8" fill="#64748b">7.5M</text>
            <text x="4" y="60" font-size="8" fill="#64748b">0</text>
            ${[
              { x: 48, inH: 36, outH: 18, t: '17:04' },
              { x: 108, inH: 42, outH: 16, t: '17:05' },
              { x: 168, inH: 34, outH: 24, t: '17:06' },
              { x: 228, inH: 44, outH: 36, t: '17:07' },
              { x: 288, inH: 32, outH: 28, t: '17:08' },
              { x: 348, inH: 40, outH: 31, t: '17:09' }
            ].map(b => `
              <rect x="${b.x}" y="${58 - b.inH}" width="12" height="${b.inH}" fill="#29c5f6" rx="1" />
              <rect x="${b.x + 14}" y="${58 - b.outH}" width="12" height="${b.outH}" fill="#f8a346" rx="1" />
              <text x="${b.x + 13}" y="70" font-size="8" fill="#64748b" text-anchor="middle">${b.t}</text>
            `).join('')}
          </svg>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; background: #ffffff; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                <th style="padding: 4px 6px;">Top Application</th>
                <th style="padding: 4px 6px;">Top Conversation (Src &rarr; Dst)</th>
                <th style="padding: 4px 6px;">DSCP</th>
                <th style="padding: 4px 6px; text-align: right;">Traffic</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px 6px; font-weight: 700; color: #0284c7;">Menu (TCP/1111)</td>
                <td style="padding: 4px 6px; font-family: monospace;">11.0.2.100 &rarr; 172.21.149.155</td>
                <td style="padding: 4px 6px;">CS0</td>
                <td style="padding: 4px 6px; text-align: right; font-weight: 700;">161.34 MB</td>
              </tr>
              <tr>
                <td style="padding: 4px 6px; font-weight: 700; color: #16a34a;">SmartCard_Port</td>
                <td style="padding: 4px 6px; font-family: monospace;">192.168.100.104 &rarr; 172.16.1.2</td>
                <td style="padding: 4px 6px;">AF21</td>
                <td style="padding: 4px 6px; text-align: right; font-weight: 700;">101.66 MB</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Full Alert Telemetry</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; font-size: 12px; line-height: 1.8; margin-bottom: 20px;">
          <div><strong>Message:</strong> ${alm.message}</div>
          <div><strong>First Occurred:</strong> Today at 08:42:10 UTC</div>
          <div><strong>Last Occurred:</strong> ${alm.time}</div>
          <div><strong>Repeat Count:</strong> 14 polls</div>
          <div><strong>Assigned Technician:</strong> <span style="color: #0070e0; font-weight: 600;">${alm.technician}</span></div>
          <div><strong>Last Operator Note:</strong> ${alm.lastNote || 'None recorded'}</div>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Add Resolution Note</div>
        <textarea id="drawer-note-input" placeholder="Type diagnostic findings or remediation steps..." style="width: 100%; height: 70px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 12px; outline: none; margin-bottom: 8px; box-sizing: border-box;"></textarea>
        <button id="drawer-add-note-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer;">Submit Note</button>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;">
        <button id="drawer-ack-btn" style="background: #16a34a; color: #ffffff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">
          ✔ Acknowledge Alarm
        </button>
        <button id="drawer-clear-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
          Clear Alarm
        </button>
      </div>
    `;
    drawer.style.display = 'flex';

    document.getElementById('close-drawer-btn').onclick = () => { drawer.style.display = 'none'; };
    document.getElementById('drawer-ack-btn').onclick = () => {
      alm.technician = 'admin@opmanager';
      showToast(`Alarm for ${alm.device} acknowledged by admin.`);
      drawer.style.display = 'none';
      const c = document.getElementById('opm-custom-suite-container');
      if (c && state.currentTab === 'alarms') renderAlarmsView(c);
    };
    document.getElementById('drawer-clear-btn').onclick = () => {
      state.alarms = state.alarms.filter(a => a.id !== alm.id);
      showToast(`Alarm for ${alm.device} marked as Clear.`);
      drawer.style.display = 'none';
      const c = document.getElementById('opm-custom-suite-container');
      if (c) {
        if (state.currentTab === 'dashboard') renderDashboardView(c);
        else if (state.currentTab === 'alarms') renderAlarmsView(c);
      }
    };
  }

  // --- ZIA ASSISTANT MODAL ---
  function showZiaAssistantModal() {
    let modal = document.getElementById('opm-zia-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-zia-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 560px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 18px 24px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">✨</span>
              <span style="font-size: 15px; font-weight: 700;">Zia AI Network Assistant</span>
            </div>
            <button id="close-zia-btn" style="background: none; border: none; color: #ffffff; font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 24px; font-size: 12px; color: #334155; line-height: 1.6;">
            <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; padding: 14px; margin-bottom: 16px;">
              <div style="font-weight: 700; color: #5b21b6; margin-bottom: 4px;">Automated Executive Health Summary</div>
              <p style="margin: 0; color: #4c1d95;">
                Currently monitoring 16 core nodes across 4 distributed probes. Overall availability is at 99.98%. 
                Primary attention is required on Dubai Campus Core switch DXB-CORE-SW-01 experiencing 93.4% CPU spike correlated with link flap on FortyGigE1/0/48.
              </p>
            </div>
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 8px;">Ask Zia AI a Question:</div>
            <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
              <button class="opm-zia-quick-chip" data-q="Show all critical alarms" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 11px; padding: 3px 10px; color: #475569; cursor: pointer; transition: all 0.15s;">🚨 Critical Alarms</button>
              <button class="opm-zia-quick-chip" data-q="What is the status of remote probes?" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 11px; padding: 3px 10px; color: #475569; cursor: pointer; transition: all 0.15s;">🌐 Probe Health</button>
              <button class="opm-zia-quick-chip" data-q="Which device has high CPU usage?" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 11px; padding: 3px 10px; color: #475569; cursor: pointer; transition: all 0.15s;">🔥 High CPU</button>
              <button class="opm-zia-quick-chip" data-q="Check configuration compliance and drift" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 11px; padding: 3px 10px; color: #475569; cursor: pointer; transition: all 0.15s;">📜 NCM Compliance</button>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <input type="text" id="zia-prompt-input" placeholder="e.g. Which interface had the highest packet loss today?" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 12px; font-size: 12px; outline: none;">
              <button id="zia-send-btn" style="background: #7c3aed; color: #ffffff; border: none; border-radius: 4px; padding: 8px 16px; font-weight: 600; cursor: pointer;">Ask</button>
            </div>
            <div id="zia-response-area" style="display: none; background: #fafbfc; border: 1px solid #edf2f7; border-radius: 4px; padding: 14px; color: #1e293b; font-size: 12px; line-height: 1.6;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-zia-btn').onclick = () => { modal.style.display = 'none'; };
    const promptInput = document.getElementById('zia-prompt-input');
    const sendBtn = document.getElementById('zia-send-btn');
    const area = document.getElementById('zia-response-area');

    async function executeZiaQuery(queryText) {
      if (!queryText) queryText = promptInput.value.trim() || 'status of probes';
      area.style.display = 'block';
      area.innerHTML = '<span style="color: #7c3aed; font-weight: 600;">✨ Zia AI:</span> Correlating enterprise metrics across probes...';
      try {
        const resp = await fetch('/api/zia/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, prompt: queryText })
        });
        const data = await resp.json();
        if (data && data.response) {
          let recHtml = '';
          if (data.response.recommendations && data.response.recommendations.length) {
            recHtml = `<div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0;"><strong style="color: #4338ca;">Recommendations:</strong><ul style="margin: 4px 0 0 16px; padding: 0;">${data.response.recommendations.map(r => `<li>${r}</li>`).join('')}</ul></div>`;
          }
          let devHtml = '';
          if (data.response.relatedDevices && data.response.relatedDevices.length) {
            devHtml = `<div style="margin-top: 8px; font-size: 11px; color: #64748b;">Related Monitored Nodes: ${data.response.relatedDevices.map(d => `<span style="color: #0070e0; font-weight: 700; cursor: pointer; text-decoration: underline; margin-right: 6px;" onclick="showDeviceSnapshotModal('${d}')">${d}</span>`).join('')}</div>`;
          }
          area.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #7c3aed; font-weight: 700; font-size: 13px;">✨ Zia AI Assistant:</span>
              <span style="font-size: 10px; background: #e0e7ff; color: #4338ca; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Confidence: 98%</span>
            </div>
            <div>${data.response.summary.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')}</div>
            ${recHtml}
            ${devHtml}
          `;
        } else {
          area.innerHTML = '<strong>Zia AI:</strong> Telemetry analysis complete. All regional systems normal.';
        }
      } catch (e) {
        area.innerHTML = '<strong>Zia AI:</strong> Telemetry analysis complete. All regional systems normal.';
      }
    }

    if (sendBtn) {
      sendBtn.onclick = () => executeZiaQuery();
    }
    if (promptInput) {
      promptInput.onkeydown = (e) => {
        if (e.key === 'Enter') executeZiaQuery();
      };
    }
    modal.querySelectorAll('.opm-zia-quick-chip').forEach(chip => {
      chip.onclick = () => {
        const q = chip.getAttribute('data-q');
        promptInput.value = q;
        executeZiaQuery(q);
      };
    });
  }
  const showZiaAIModal = showZiaAssistantModal;

  // --- ADD DEVICE MODAL ---
  function showAddDeviceModal() {
    let modal = document.getElementById('opm-add-dev-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-add-dev-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Add New Monitored Device</span>
            <button id="close-add-dev-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Device IP Address / Hostname *</label>
              <input type="text" id="new-dev-ip" placeholder="10.x.x.x or switch.corp" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Assign to Remote Probe *</label>
              <select id="new-dev-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box; background: #ffffff;">
                ${state.probes.map(p => `<option value="${p.id}">${p.name} (${p.location})</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">SNMP Credentials Profile</label>
              <select id="new-dev-snmp" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box; background: #ffffff;">
                <option>Enterprise SNMP v2c (dxb-ro / pub-ro)</option>
                <option>Enterprise SNMP v3 (SHA-256 / AES-256)</option>
                <option>WMI / Windows Admin Credentials</option>
              </select>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-add-dev-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-add-dev-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Discover & Add</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-add-dev-btn').onclick = () => {
      const ip = document.getElementById('new-dev-ip').value.trim() || '10.50.1.' + Math.floor(Math.random() * 200 + 10);
      const probeId = parseInt(document.getElementById('new-dev-probe').value, 10) || 1;
      const targetProbe = state.probes.find(p => p.id === probeId) || state.probes[0];
      const snmpProfile = document.getElementById('new-dev-snmp').value;

      const newId = state.devices.length + 1;
      const newDev = {
        id: newId,
        name: 'NODE-' + ip.replace(/\./g, '-'),
        ip: ip,
        category: 'Switches',
        type: 'Managed SNMP Host (' + snmpProfile.split(' ')[1] + ')',
        vendor: 'Cisco Systems',
        probe: targetProbe.name,
        probeId: targetProbe.id,
        status: 'Clear',
        cpu: Math.floor(Math.random() * 30 + 15),
        memory: Math.floor(Math.random() * 35 + 25),
        disk: 28.0,
        temp: 31,
        responseTime: Math.floor(Math.random() * 20 + 8),
        availability: '100.0%',
        serial: 'SNMP-' + Math.floor(Math.random() * 899999 + 100000),
        osVersion: 'Enterprise Agent Monitored',
        lastBackup: 'Just now',
        interfaces: [
          { name: 'GigabitEthernet0/1', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 140.2, outTraffic: 120.5, errors: 0 }
        ]
      };

      state.devices.unshift(newDev);
      targetProbe.devices++;
      targetProbe.devicesCount++;

      // Send to server
      fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDev)
      }).catch(() => {});

      showToast(`Device ${newDev.name} (${ip}) successfully discovered and added!`);
      modal.style.display = 'none';

      if (state.currentTab === 'inventory') {
        renderInventoryView();
      } else if (state.currentTab === 'dashboard') {
        renderDashboardView();
      }
    };
  }

  // --- ADD WIDGET MODAL ---
  function showAddWidgetModal() {
    let modal = document.getElementById('opm-add-widget-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-add-widget-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 620px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Enterprise Dashboard Widget Library</span>
            <button id="close-widget-modal-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 20px 22px; max-height: 400px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
            ${[
              { name: 'BGP / Routing Table Health', desc: 'Monitors autonomous system peer stability' },
              { name: 'Firewall Threat Events & Drops', desc: 'Real-time Palo Alto & FortiGate denial feeds' },
              { name: 'Disk I/O Latency & Queue Depth', desc: 'Storage array disk bottleneck indicator' },
              { name: 'Wireless AP Client Density', desc: 'Active WiFi associations per controller' }
            ].map(w => `
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-weight: 700; color: #0070e0; margin-bottom: 4px;">${w.name}</div>
                  <div style="font-size: 11px; color: #64748b;">${w.desc}</div>
                </div>
                <button class="add-this-widget-btn" data-title="${w.name}" style="align-self: flex-start; margin-top: 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 600; color: #0070e0; cursor: pointer;">+ Add to Dashboard</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-widget-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelectorAll('.add-this-widget-btn').forEach(btn => {
      btn.onclick = () => {
        const title = btn.getAttribute('data-title');
        state.addedWidgets.push({
          title,
          metric: 'Normal (100%)',
          description: 'Real-time telemetry metric synchronized across all active Probes.'
        });
        showToast(`Widget "${title}" added to Overview dashboard.`);
        modal.style.display = 'none';
        if (state.currentTab === 'dashboard') {
          renderDashboardView();
        }
      };
    });
  }

  // --- REMOTE PROBE DETAILS MODAL ---
  function showProbeDetailsModal(probe) {
    if (typeof probe === 'number' || typeof probe === 'string') {
      probe = state.probes.find(p => p.id == probe) || state.probes[0];
    }
    if (!probe) probe = state.probes[0];
    let modal = document.getElementById('opm-probe-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-probe-details-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 680px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px;">${probe.flag}</span>
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">${probe.name} — Central-to-Probe XML/HTTPS Diagnostics</span>
          </div>
          <button id="close-probe-modal-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 18px 22px; font-size: 12px; color: #334155; line-height: 1.7;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px;">Central ↔ Probe XML/HTTPS VPN Tunnel</div>
              <img src="/apiclient/fluidicv2/img/ncm-noprobe.jpg" alt="Central Probe Architecture" style="max-width: 100%; height: 95px; object-fit: contain;">
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px;">Remote Collector (DPI / Poller / NetFlow)</div>
              <img src="/apiclient/fluidicv2/img/remoteCollector.png" alt="Remote Collector Architecture" style="max-width: 100%; height: 95px; object-fit: contain;">
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-weight: 600;">Location:</span>
            <span>${probe.location}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-weight: 600;">Host IP:</span>
            <span style="font-family: monospace;">${probe.ip}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-weight: 600;">Central Comm Port:</span>
            <span style="font-family: monospace;">TCP ${probe.commPort} (TLS 1.3 XML/HTTPS Encrypted)</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-weight: 600;">Heartbeat Round-Trip:</span>
            <span style="color: #16a34a; font-weight: 700;">${probe.latency} ms</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-weight: 600;">Active Monitored Nodes:</span>
            <span style="font-weight: 700;">${probe.devicesCount} Devices</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Data Sync State:</span>
            <span style="color: #0284c7; font-weight: 600;">✓ ${probe.syncStatus} (${probe.lastSync})</span>
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end;">
          <button id="probe-modal-close-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-probe-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('probe-modal-close-btn').onclick = () => { modal.style.display = 'none'; };
  }


  // --- SERVICEDESK PLUS / JIRA INCIDENT MODAL ---
  function showServiceDeskIncidentModal(alarm) {
    if (!alarm) alarm = state.alarms[0];
    let modal = document.getElementById("opm-sdp-incident-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "opm-sdp-incident-modal";
      modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Lato, Roboto, -apple-system, sans-serif;";
      document.body.appendChild(modal);
    }
    const incNum = "SDP-WO#" + (10000 + Math.floor(Math.random() * 9000));
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 560px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
        <div style="background: #1e1b4b; color: #ffffff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 4px; background: #6366f1; color: #fff; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center;">SD</div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #a5b4fc;">ServiceDesk Plus Cloud Integration</div>
              <div style="font-size: 11px; color: #c7d2fe;">Create Enterprise Incident Ticket &bull; ${incNum}</div>
            </div>
          </div>
          <button id="close-sdp-modal-btn" style="background: none; border: none; font-size: 18px; color: #a5b4fc; cursor: pointer;">✕</button>
        </div>

        <div style="padding: 22px; font-size: 12px; color: #334155; max-height: 70vh; overflow-y: auto;">
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Request Title / Subject *</label>
            <input type="text" id="sdp-title" value="[OpManager ${alarm.severity.toUpperCase()}] ${alarm.device}: ${alarm.entity} Threshold Exceeded" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-weight: 600;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Priority Level</label>
              <select id="sdp-priority" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
                <option ${alarm.severity === "Critical" ? "selected" : ""}>P1 - Urgent (Service Down)</option>
                <option ${alarm.severity === "Trouble" ? "selected" : ""}>P2 - High (Degraded Performance)</option>
                <option ${alarm.severity === "Attention" ? "selected" : ""}>P3 - Medium (Warning)</option>
                <option>P4 - Low (Informational)</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Category</label>
              <select id="sdp-category" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
                <option>Network Infrastructure</option>
                <option>Hardware Fault</option>
                <option>Storage &amp; Virtualization</option>
                <option>Bandwidth &amp; Security</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Associated CI Asset</label>
              <input type="text" value="${alarm.device} (${alarm.ip || "10.40.1.1"})" readonly style="width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; color: #64748b;">
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Assigned Support Group</label>
              <select style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
                <option>NOC Operations Tier 2 (Dubai/US Core)</option>
                <option>Datacenter Infrastructure Engineering</option>
                <option>Network Core Routing Specialists</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Detailed Description &amp; Diagnostic Telemetry</label>
            <textarea rows="4" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 11px; font-family: monospace; box-sizing: border-box; line-height: 1.5;">${alarm.message}&#10;Managed by Probe: ${alarm.probe}&#10;Reported: ${alarm.time}&#10;Zia AI Root Cause: Automated correlation identified high resource contention during scheduled maintenance window.</textarea>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px 14px; font-size: 11px; color: #166534; display: flex; align-items: center; gap: 8px;">
            <span>✓</span>
            <span>SLA Timer will automatically initiate upon submission (4-Hour Resolution Target).</span>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="cancel-sdp-modal-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
          <button id="submit-sdp-modal-btn" style="background: #4f46e5; color: #ffffff; border: none; border-radius: 4px; padding: 6px 18px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>Submit WorkOrder to ServiceDesk Plus</span>
          </button>
        </div>
      </div>
    `;
    modal.style.display = "flex";
    document.getElementById("close-sdp-modal-btn").onclick = () => { modal.style.display = "none"; };
    document.getElementById("cancel-sdp-modal-btn").onclick = () => { modal.style.display = "none"; };
    document.getElementById("submit-sdp-modal-btn").onclick = () => {
      alarm.technician = incNum + " (NOC Assigned)";
      modal.style.display = "none";
      showToast(`WorkOrder ${incNum} created in ServiceDesk Plus for ${alarm.device}!`);
      if (state.currentTab === "alarms" && typeof renderAlarmsView === "function") {
        renderAlarmsView();
      }
      const drawer = document.getElementById("opm-alarm-drawer");
      if (drawer && drawer.style.display === "flex" && typeof openAlarmDrawer === "function") {
        openAlarmDrawer(alarm.id);
      }
    };
  }

  // --- MASTER MULTI-TAB DEVICE SNAPSHOT MODAL ---
  function showDeviceSnapshotModal(dev) {
    if (typeof dev === 'number' || typeof dev === 'string') {
      dev = state.devices.find(d => d.id == dev || d.id === 'dev_' + dev || d.name === dev) || state.devices[0];
    }
    if (!dev) dev = state.devices[0];
    let modal = document.getElementById('device-snapshot-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'device-snapshot-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    let activeModalTab = 'summary';
    const isSwitch = (dev.category || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('catalyst') || (dev.type || '').toLowerCase().includes('nexus') || (dev.type || '').toLowerCase().includes('leaf') || (dev.type || '').toLowerCase().includes('procurve');
    let selectedPortNumber = dev.status === 'Critical' ? 48 : 1;

    function renderSnapshotBody() {
      const bodyContainer = modal.querySelector('#snapshot-body-container');
      if (!bodyContainer) return;

      if (activeModalTab === 'summary') {
        // Dynamic gauges from reverse-engineered opmanager_snapshot_dial.xml
        const isSwitch = (dev.category || '').toLowerCase().includes('switch');
        const isRouter = (dev.category || '').toLowerCase().includes('router');
        const isStorage = (dev.category || '').toLowerCase().includes('storage');

        let dynamicGauges = [
          { label: 'CPU UTILIZATION', val: dev.cpu, color: dev.cpu >= 90 ? '#dc2626' : dev.cpu >= 75 ? '#ea580c' : '#0070e0', unit: '%' },
          { label: 'MEMORY UTILIZATION', val: dev.memory, color: dev.memory >= 90 ? '#dc2626' : dev.memory >= 75 ? '#ea580c' : '#0070e0', unit: '%' }
        ];

        if (isSwitch) {
          dynamicGauges.push(
            { label: 'BACKPLANE UTILIZATION', val: dev.backplane || 24, color: '#0070e0', unit: '%' },
            { label: 'CHASSIS THERMAL', val: dev.temp || 32, unit: '°C', color: (dev.temp || 32) >= 45 ? '#ea580c' : '#16a34a' }
          );
        } else if (isRouter) {
          dynamicGauges.push(
            { label: 'CHASSIS THERMAL', val: dev.temp || 38, unit: '°C', color: (dev.temp || 38) >= 45 ? '#ea580c' : '#16a34a' },
            { label: 'ACTIVE FLOWS', val: dev.connections || 1840, unit: '', color: '#0070e0' }
          );
        } else if (isStorage) {
          dynamicGauges.push(
            { label: 'VOLUMES USED', val: dev.disk || 76, unit: '%', color: (dev.disk || 76) >= 85 ? '#dc2626' : '#16a34a' },
            { label: 'FAILED DISKS', val: 0, unit: '', color: '#16a34a' }
          );
        } else {
          dynamicGauges.push(
            { label: 'LOCAL STORAGE', val: dev.disk, color: dev.disk >= 85 ? '#dc2626' : '#16a34a', unit: '%' },
            { label: 'CHASSIS THERMAL', val: dev.temp, unit: '°C', color: dev.temp >= 45 ? '#ea580c' : '#16a34a' }
          );
        }

        bodyContainer.innerHTML = `
          <!-- 4 Circular SVG Gauges (Reverse Engineered XML) -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            ${dynamicGauges.map(g => {
              const r = 38;
              const c = 2 * Math.PI * r;
              const pct = typeof g.val === 'number' && g.unit === '%' ? Math.min(100, g.val) : 65;
              const offset = c - (pct / 100) * c;
              return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                  <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 8px;">${g.label}</div>
                  <div style="position: relative; width: 90px; height: 90px; margin: 0 auto;">
                    <svg width="90" height="90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#edf2f7" stroke-width="8" />
                      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${g.color}" stroke-width="8" stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #0f172a;">
                      ${g.val}${g.unit || ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Hardware Sensors (Fans, PSUs) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Chassis Fan Trays</div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span>Fan Tray 1 (Front-to-Back):</span>
                <span style="color: #16a34a; font-weight: 700;">● 4,200 RPM (Normal)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span>Fan Tray 2 (Chassis Exhaust):</span>
                <span style="color: ${dev.status === 'Critical' ? '#dc2626' : '#16a34a'}; font-weight: 700;">● ${dev.status === 'Critical' ? '1,800 RPM (Speed Degraded)' : '4,150 RPM (Normal)'}</span>
              </div>
            </div>

            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Dual Redundant Power Supplies</span>
                <span style="font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 1px 5px; border-radius: 2px;">REDUNDANT OK</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span>PSU 1 (AC 230V Ingest):</span>
                <span style="color: #16a34a; font-weight: 600;">Optimal (142 Watts draw)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span>PSU 2 (Hot-Standby Feed):</span>
                <span style="color: #16a34a; font-weight: 600;">Optimal (138 Watts draw)</span>
              </div>
            </div>
          </div>

          <!-- Hardware Chassis Front & Rear Panel Elevation Strip -->
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px 16px; background: #1e293b; color: #f8fafc; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div>
                <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Live Physical Chassis Front-Panel View (Port LED Telemetry)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">47 Ports UP (Green) • ${dev.status === 'Critical' ? '1 Port DOWN: FortyGigE1/0/48 (Red)' : '0 Ports Down'}</div>
              </div>
              <img src="/images/racks/front/Cisco-Switch-1U.png" style="height: 30px; width: 420px; object-fit: fill; border-radius: 2px; border: 1px solid #475569;" />
            </div>
            <div style="border-top: 1px solid #334155; padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div>
                <div style="font-size: 11px; font-weight: 700; color: #4ade80; text-transform: uppercase;">Live Physical Chassis Rear-Panel View (Dual PSU &amp; Fan Modules)</div>
                <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">PSU-1: 230V AC Active • PSU-2: Redundant Active • Grounding &amp; Console RJ45 Connected</div>
              </div>
              <img src="/images/racks/rear/Cisco-Switch-RearView-1U.png" style="height: 30px; width: 420px; object-fit: fill; border-radius: 2px; border: 1px solid #475569;" />
            </div>
          </div>

          <!-- System Specs Matrix -->
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; background: #ffffff; margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">System Specifications &amp; Inventory Data</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: #334155;">
              <div><strong>System Uptime:</strong> 184 Days 14 Hours</div>
              <div><strong>Serial Number:</strong> <span style="font-family: monospace;">${dev.serial}</span></div>
              <div><strong>Operating System:</strong> ${dev.osVersion}</div>
              <div><strong>Last Config Backup:</strong> ${dev.lastBackup}</div>
              <div><strong>SNMP Response Time:</strong> ${dev.responseTime} ms (0% Packet Loss)</div>
              <div><strong>Remote Probe:</strong> ${dev.probe}</div>
            </div>
          </div>

          <!-- ManageEngine 24-Hour Availability Time Line Bar (from mobile-app-opm.png) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 16px; background: #ffffff; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #1e293b;">Time Line (Last 24 Hours Availability)</span>
              <div style="display: flex; align-items: center; gap: 14px; font-size: 10px; font-weight: 600; color: #475569;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #9333ea;"></span> On Maintenance (0.0%)</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #49bd80;"></span> Up Time (${dev.availability || '99.98%'})</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span> Down Time (${dev.status === 'Critical' ? '0.42%' : '0.00%'})</span>
              </div>
            </div>
            <div style="height: 12px; width: 100%; border-radius: 6px; overflow: hidden; display: flex; background: #e2e8f0;">
              ${dev.status === 'Critical' ? `
                <div style="width: 86%; background: #49bd80;" title="Up Time (10:00 - 06:40)"></div>
                <div style="width: 2%; background: #ef4444;" title="Brief Flap (06:40 - 06:46)"></div>
                <div style="width: 12%; background: #49bd80;" title="Up Time (06:46 - 09:59)"></div>
              ` : `
                <div style="width: 100%; background: #49bd80;" title="100% Up Time (Last 24 Hours)"></div>
              `}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">
              <span>10:00</span>
              <span>22:00</span>
              <span>09:59</span>
            </div>
          </div>

          <!-- ManageEngine 95th Percentile Traffic Statistical Summary (Modeled on netflow_addon_inventory.png) -->
          <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: #ffffff;">
            <div style="width: 130px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px;">
              <div style="font-size: 16px; color: #64748b;">🕒</div>
              <div style="font-size: 10px; font-weight: 700; color: #334155;">00:00 - 24:00</div>
              <div style="font-size: 9px; color: #94a3b8;">95th Percentile</div>
            </div>
            <table style="flex: 1; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                  <th style="padding: 6px 10px;">Category</th>
                  <th style="padding: 6px 10px;">Total</th>
                  <th style="padding: 6px 10px;">Maximum</th>
                  <th style="padding: 6px 10px;">Minimum</th>
                  <th style="padding: 6px 10px;">Average</th>
                  <th style="padding: 6px 10px;">Std Deviation</th>
                  <th style="padding: 6px 10px;">95th Percentile</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-weight: 700; color: #16a34a;">Traffic IN</td>
                  <td style="padding: 6px 10px; font-family: monospace; font-weight: 700;">450.94 MB</td>
                  <td style="padding: 6px 10px; font-family: monospace;">942.5 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">112.4 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">464.56 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">198.49 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace; font-weight: 700; color: #dc2626;">935.12 kbps</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-weight: 700; color: #0284c7;">Traffic OUT</td>
                  <td style="padding: 6px 10px; font-family: monospace; font-weight: 700;">450.94 MB</td>
                  <td style="padding: 6px 10px; font-family: monospace;">942.5 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">108.2 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">464.56 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace;">198.49 kbps</td>
                  <td style="padding: 6px 10px; font-family: monospace; font-weight: 700; color: #dc2626;">935.12 kbps</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } else if (activeModalTab === 'performance') {
        bodyContainer.innerHTML = `
          <div style="padding: 10px 0;">
            <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">1-Minute Average Traffic &amp; 95th Percentile Threshold (IN / OUT)</div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; margin-bottom: 16px;">
              <svg viewBox="0 0 700 150" style="width: 100%; height: 150px;">
                <line x1="0" y1="35" x2="700" y2="35" stroke="#edf2f7" stroke-width="1" />
                <line x1="0" y1="70" x2="700" y2="70" stroke="#edf2f7" stroke-width="1" />
                <line x1="0" y1="105" x2="700" y2="105" stroke="#edf2f7" stroke-width="1" />
                <polygon points="0,135 0,85 120,62 240,48 360,55 480,38 600,45 700,40 700,135" fill="rgba(73,189,128,0.22)" />
                <polyline points="0,85 120,62 240,48 360,55 480,38 600,45 700,40" fill="none" stroke="#49bd80" stroke-width="2" />
                <polygon points="0,135 0,98 120,82 240,70 360,76 480,58 600,65 700,60 700,135" fill="rgba(56,189,248,0.22)" />
                <polyline points="0,98 120,82 240,70 360,76 480,58 600,65 700,60" fill="none" stroke="#38bdf8" stroke-width="2" />
                <line x1="0" y1="42" x2="700" y2="42" stroke="#ef4444" stroke-width="1.5" />
                <text x="580" y="37" font-size="9" font-weight="700" fill="#ef4444">IN 95th Percentile</text>
                <line x1="0" y1="62" x2="700" y2="62" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,3" />
                <text x="575" y="57" font-size="9" font-weight="700" fill="#dc2626">OUT 95th Percentile</text>
              </svg>
              <div style="display: flex; gap: 16px; font-size: 11px; margin-top: 8px;">
                <span style="color: #49bd80; font-weight: 700;">■ IN Traffic (Mbps)</span>
                <span style="color: #38bdf8; font-weight: 700;">■ OUT Traffic (Mbps)</span>
                <span style="color: #ef4444; font-weight: 700;">— IN 95th Percentile</span>
                <span style="color: #dc2626; font-weight: 700;">--- OUT 95th Percentile</span>
              </div>
            </div>
          </div>
        `;
      } else if (activeModalTab === 'monitors') {
        const monitorsList = [
          { name: 'CPU Utilization', type: 'SNMP Gauge', interval: '1 Min', threshold: '> 85%', lastVal: dev.cpu + ' %', status: dev.cpu >= 85 ? 'Critical' : 'Clear' },
          { name: 'Memory Utilization', type: 'SNMP Gauge', interval: '1 Min', threshold: '> 85%', lastVal: dev.memory + ' %', status: dev.memory >= 85 ? 'Trouble' : 'Clear' },
          { name: 'Disk Space Utilization', type: 'SNMP Storage', interval: '5 Min', threshold: '> 90%', lastVal: (dev.disk || 42) + ' %', status: (dev.disk || 42) >= 90 ? 'Critical' : 'Clear' },
          { name: 'Ping Response Time', type: 'ICMP Echo', interval: '1 Min', threshold: '> 50 ms', lastVal: dev.responseTime + ' ms', status: dev.responseTime > 50 ? 'Trouble' : 'Clear' },
          { name: 'Packet Loss', type: 'ICMP Echo', interval: '1 Min', threshold: '> 5 %', lastVal: '0.0 %', status: 'Clear' },
          { name: 'Chassis Temperature', type: 'SNMP Sensor', interval: '5 Min', threshold: '> 45 °C', lastVal: (dev.temp || 32) + ' °C', status: (dev.temp || 32) >= 45 ? 'Attention' : 'Clear' },
          { name: 'Dual PSU Status', type: 'SNMP Traps', interval: 'Event Driven', threshold: 'Redundant Fail', lastVal: 'Optimal', status: 'Clear' }
        ];

        bodyContainer.innerHTML = `
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="padding: 10px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Associated Performance Monitors (${monitorsList.length})</span>
              <button id="poll-all-monitors-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 4px 12px; font-size: 11px; font-weight: 600; cursor: pointer;">Poll All Now</button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 10px; text-transform: uppercase;">
                  <th style="padding: 8px 12px; text-align: left;">Monitor Name</th>
                  <th style="padding: 8px 12px; text-align: left;">Type</th>
                  <th style="padding: 8px 12px; text-align: left;">Polling Interval</th>
                  <th style="padding: 8px 12px; text-align: left;">Threshold</th>
                  <th style="padding: 8px 12px; text-align: left;">Last Polled Value</th>
                  <th style="padding: 8px 12px; text-align: left;">Status</th>
                  <th style="padding: 8px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${monitorsList.map(m => `
                  <tr style="border-bottom: 1px solid #f8fafc;">
                    <td style="padding: 8px 12px; font-weight: 600; color: #0070e0;">${m.name}</td>
                    <td style="padding: 8px 12px; color: #64748b;">${m.type}</td>
                    <td style="padding: 8px 12px; color: #334155;">${m.interval}</td>
                    <td style="padding: 8px 12px; color: #64748b;">${m.threshold}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">${m.lastVal}</td>
                    <td style="padding: 8px 12px;">${getStatusBadge(m.status)}</td>
                    <td style="padding: 8px 12px; text-align: right;">
                      <button class="test-mon-btn" data-mon="${m.name}" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer;">Test</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        bodyContainer.querySelectorAll('.test-mon-btn').forEach(b => {
          b.onclick = () => {
            const mName = b.getAttribute('data-mon');
            showToast(`SNMP Test executed for "${mName}": Response OK (14ms).`);
          };
        });
        const pollAllBtn = bodyContainer.querySelector('#poll-all-monitors-btn');
        if (pollAllBtn) {
          pollAllBtn.onclick = () => {
            showToast(`Initiated immediate probe re-poll for all ${monitorsList.length} monitors on ${dev.name}.`);
          };
        }
      } else if (activeModalTab === 'interfaces') {
        bodyContainer.innerHTML = `
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 10px; text-transform: uppercase;">
                  <th style="padding: 8px 12px; text-align: left;">Interface Name</th>
                  <th style="padding: 8px 12px; text-align: left;">Admin</th>
                  <th style="padding: 8px 12px; text-align: left;">Oper</th>
                  <th style="padding: 8px 12px; text-align: left;">Speed</th>
                  <th style="padding: 8px 12px; text-align: left;">In Rate</th>
                  <th style="padding: 8px 12px; text-align: left;">Out Rate</th>
                  <th style="padding: 8px 12px; text-align: left;">Errors</th>
                </tr>
              </thead>
              <tbody>
                ${(dev.interfaces || []).map(inf => `
                  <tr style="border-bottom: 1px solid #f8fafc;">
                    <td style="padding: 8px 12px; font-weight: 600; color: #0070e0; display: flex; align-items: center; gap: 6px;">
                      <img src="/apiclient/fluidicv2/img/${inf.oper === 'UP' ? 'port_up.gif' : 'port_down.gif'}" style="width: 13px; height: 13px;">
                      ${inf.name}
                    </td>
                    <td style="padding: 8px 12px; color: #16a34a; font-weight: 600;"><img src="/apiclient/fluidicv2/img/port_up.gif" style="width: 10px; height: 10px; vertical-align: middle;"> ${inf.admin}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: ${inf.oper === 'UP' ? '#16a34a' : '#dc2626'};"><img src="/apiclient/fluidicv2/img/${inf.oper === 'UP' ? 'port_up.gif' : 'port_down.gif'}" style="width: 10px; height: 10px; vertical-align: middle;"> ${inf.oper}</td>
                    <td style="padding: 8px 12px; color: #475569;">${inf.speed}</td>
                    <td style="padding: 8px 12px; color: #16a34a;">${inf.inTraffic} Mbps</td>
                    <td style="padding: 8px 12px; color: #0284c7;">${inf.outTraffic} Mbps</td>
                    <td style="padding: 8px 12px; color: ${inf.errors > 0 ? '#dc2626' : '#64748b'}; font-weight: ${inf.errors > 0 ? '700' : 'normal'};">${inf.errors}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (activeModalTab === 'alarms') {
        const devAlarms = state.alarms.filter(a => a.device === dev.name);
        bodyContainer.innerHTML = `
          <div style="font-size: 12px;">
            ${devAlarms.length === 0 ? `
              <div style="padding: 30px; text-align: center; color: #16a34a; font-weight: 600;">✓ No active unresolved alarms for this node.</div>
            ` : devAlarms.map(a => `
              <div style="border: 1px solid #e2e8f0; border-left: 4px solid #dc2626; border-radius: 4px; padding: 12px; margin-bottom: 8px; background: #fafbfc;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-weight: 700; color: #dc2626;">${a.severity}: ${a.entity}</span>
                  <span style="font-size: 10px; color: #64748b;">${a.time}</span>
                </div>
                <div style="font-size: 11px; color: #334155;">${a.message}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (activeModalTab === 'ports') {
        const isDown48 = (p) => p === 48 && dev.status === 'Critical';
        const isAmber = (p) => p % 7 === 0;

        function renderPortInspector(p) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const speed = p === 48 ? '40 Gbps QSFP28' : (p % 2 === 0 ? '10 Gbps SFP+' : '1 Gbps RJ45');
          const adminSt = 'UP (Administratively Enabled)';
          const operSt = isDown ? 'DOWN (Link Failure / Loss of Carrier Signal)' : 'UP (Connected & Forwarding)';
          const inRate = isDown ? '0.0 Mbps' : ((p * 18.4) % 780 + 15).toFixed(1) + ' Mbps';
          const outRate = isDown ? '0.0 Mbps' : ((p * 14.1) % 650 + 12).toFixed(1) + ' Mbps';
          const crc = isDown ? '14 CRC Errors (Transceiver Degraded)' : '0 Errors';
          const vlan = p <= 24 ? 'VLAN 100 (Enterprise-Servers)' : 'VLAN 200 (Core-Uplinks)';

          return `
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 16px; margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 14px; font-weight: 800; color: #38bdf8;">Interface Port ${p}: ${p === 48 ? 'FortyGigabitEthernet1/0/48' : 'TenGigabitEthernet1/0/' + p}</span>
                  <span style="font-size: 10px; font-weight: 800; background: ${isDown ? '#dc2626' : '#166534'}; color: #fff; padding: 2px 7px; border-radius: 2px;">
                    ${isDown ? 'PORT DOWN (CRITICAL)' : 'OPERATIONAL UP'}
                  </span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="opm-port-bounce-btn" style="background: #334155; border: 1px solid #475569; color: #fff; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Shut / No-Shut
                  </button>
                  <button id="opm-port-clear-btn" style="background: #334155; border: 1px solid #475569; color: #fff; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Clear CRC Counters
                  </button>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 11px; margin-bottom: 12px;">
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">NEGOTIATED SPEED</div>
                  <div style="font-weight: 700; color: #f8fafc; font-size: 12px; margin-top: 2px;">${speed}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">VLAN ASSIGNMENT</div>
                  <div style="font-weight: 700; color: #38bdf8; font-size: 12px; margin-top: 2px;">${vlan}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">TRAFFIC (IN / OUT)</div>
                  <div style="font-weight: 700; color: #4ade80; font-size: 12px; margin-top: 2px;">${inRate} / ${outRate}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">PACKET DISCARDS &amp; CRC</div>
                  <div style="font-weight: 700; color: ${isDown ? '#f87171' : '#cbd5e1'}; font-size: 12px; margin-top: 2px;">${crc}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                <span>Admin Status: <strong style="color: #4ade80;">${adminSt}</strong></span>
                <span>Operational Status: <strong style="color: ${isDown ? '#f87171' : '#4ade80'};">${operSt}</strong></span>
              </div>
            </div>
          `;
        }

        let topRowHtml = '';
        for (let p = 1; p <= 47; p += 2) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const ledBg = isDown ? '#dc2626' : (isAmb ? '#eab308' : '#22c55e');
          const isSel = selectedPortNumber === p;
          topRowHtml += `
            <div class="opm-faceplate-port" data-port="${p}" title="Port ${p}: ${isDown ? 'DOWN' : 'UP'}" style="width: 28px; height: 32px; background: ${isSel ? '#1e3a8a' : '#0f172a'}; border: 1px solid ${isSel ? '#3b82f6' : '#334155'}; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3px 2px; cursor: pointer; transition: all 0.15s;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${ledBg}; ${isDown ? 'box-shadow: 0 0 6px #dc2626;' : 'box-shadow: 0 0 4px ' + ledBg + ';' }"></span>
              <span style="font-family: monospace; font-size: 9px; font-weight: 700; color: ${isSel ? '#93c5fd' : '#cbd5e1'};">${p}</span>
            </div>
          `;
        }

        let btmRowHtml = '';
        for (let p = 2; p <= 48; p += 2) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const ledBg = isDown ? '#dc2626' : (isAmb ? '#eab308' : '#22c55e');
          const isSel = selectedPortNumber === p;
          btmRowHtml += `
            <div class="opm-faceplate-port" data-port="${p}" title="Port ${p}: ${isDown ? 'DOWN' : 'UP'}" style="width: 28px; height: 32px; background: ${isSel ? '#1e3a8a' : '#0f172a'}; border: 1px solid ${isSel ? '#3b82f6' : '#334155'}; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3px 2px; cursor: pointer; transition: all 0.15s;">
              <span style="font-family: monospace; font-size: 9px; font-weight: 700; color: ${isSel ? '#93c5fd' : '#cbd5e1'};">${p}</span>
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${ledBg}; ${isDown ? 'box-shadow: 0 0 6px #dc2626;' : 'box-shadow: 0 0 4px ' + ledBg + ';' }"></span>
            </div>
          `;
        }

        bodyContainer.innerHTML = `
          <div style="background: #0f172a; border-radius: 6px; padding: 20px; color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                  ${dev.name} &bull; Physical 48-Port Switch Elevation Faceplate
                </span>
                <span style="font-size: 10px; font-weight: 700; background: #334155; color: #94a3b8; padding: 2px 6px; border-radius: 2px;">
                  1U RACK CHASSIS
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 14px; font-size: 10px;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e;"></span> 10G/25G UP</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #eab308;"></span> 1G Link</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 4px #dc2626;"></span> DOWN (Port 48)</span>
              </div>
            </div>

            <div style="background: #1e293b; border: 2px solid #334155; border-radius: 6px; padding: 14px; display: flex; gap: 16px; align-items: center; justify-content: space-between; overflow-x: auto;">
              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding-right: 12px; border-right: 1px solid #334155;">
                <span style="font-size: 11px; font-weight: 800; color: #f8fafc; font-family: sans-serif;">CISCO</span>
                <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">CAT 9500</span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; color: #4ade80;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #22c55e;"></span> SYS OK
                </div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; color: #4ade80;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #22c55e;"></span> PWR OK
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
                <div style="display: flex; gap: 4px;">
                  ${topRowHtml}
                </div>
                <div style="display: flex; gap: 4px;">
                  ${btmRowHtml}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding-left: 14px; border-left: 1px solid #334155;">
                <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">40G QSFP</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 1 (40G) - UP">Q1</div>
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 2 (40G) - UP">Q2</div>
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 3 (40G) - UP">Q3</div>
                  <div style="width: 32px; height: 24px; background: #450a0a; border: 1px solid #dc2626; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #f87171;" title="QSFP 4 (40G) - DOWN (Port 48 Uplink)">Q4 ⚠</div>
                </div>
              </div>
            </div>

            <div id="opm-port-inspector-container">
              ${renderPortInspector(selectedPortNumber)}
            </div>
          </div>
        `;

        bodyContainer.querySelectorAll('.opm-faceplate-port').forEach(el => {
          el.onclick = () => {
            selectedPortNumber = Number(el.getAttribute('data-port'));
            renderSnapshotBody();
          };
        });

        const bounceBtn = bodyContainer.querySelector('#opm-port-bounce-btn');
        if (bounceBtn) {
          bounceBtn.onclick = () => {
            showToast(`Administrative bounce sent for Port ${selectedPortNumber}. Interface re-negotiated.`);
          };
        }
        const clearBtn = bodyContainer.querySelector('#opm-port-clear-btn');
        if (clearBtn) {
                const mibBrowserBtn = modal.querySelector('#mib-browser-from-snapshot-btn');
      if (mibBrowserBtn) {
        mibBrowserBtn.onclick = () => {
          showMibBrowserModal(dev.ip);
        };
      }
      clearBtn.onclick = () => {
            showToast(`CRC error counters cleared for Port ${selectedPortNumber}.`);
          };
        }
      

      } else if (activeModalTab === 'diagnostics') {
        bodyContainer.innerHTML = `
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #161b22; border-bottom: 1px solid #30363d; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 9px; height: 9px; border-radius: 50%; background: #238636; display: inline-block;"></span>
                <span style="font-size: 12px; font-weight: 700; color: #f0f6fc; font-family: monospace;">OpManager Central Diagnostic Console &bull; ${dev.ip} (${dev.name})</span>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="cli-run-ping-btn" style="background: #238636; color: #fff; border: 1px solid #2ea043; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ ICMP Ping (4 pkts)</button>
                <button id="cli-run-trace-btn" style="background: #1f6feb; color: #fff; border: 1px solid #388bfd; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ WAN Traceroute</button>
                <button id="cli-run-snmp-btn" style="background: #8957e5; color: #fff; border: 1px solid #a371f7; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ SNMP MIB Walk</button>
                <button id="cli-clear-btn" style="background: #21262d; color: #c9d1d9; border: 1px solid #30363d; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">Clear</button>
              </div>
            </div>
            
            <!-- Live ICMP Ping Waveform & Oscilloscope Strip -->
            <div style="background: #161b22; border-bottom: 1px solid #30363d; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 14px; font-size: 11px;">
                <span style="color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 5px;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e;"></span>
                  Continuous ICMP Waveform:
                </span>
                <span style="color: #c9d1d9;">Min: <strong style="color: #4ade80;">${(dev.responseTime - 0.4).toFixed(1)}ms</strong></span>
                <span style="color: #c9d1d9;">Avg: <strong style="color: #38bdf8;">${dev.responseTime}ms</strong></span>
                <span style="color: #c9d1d9;">Max: <strong style="color: #fca5a5;">${(dev.responseTime + 0.7).toFixed(1)}ms</strong></span>
                <span style="color: #c9d1d9;">Jitter: <strong style="color: #34d399;">0.4ms</strong></span>
                <span style="color: #c9d1d9;">Loss: <strong style="color: #4ade80;">0.0%</strong></span>
              </div>
              <span style="font-size: 10px; background: #238636; color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 700;">LIVE TELEMETRY</span>
            </div>
            <div style="background: #090d16; padding: 6px 16px; border-bottom: 1px solid #30363d;">
              <svg width="100%" height="40" viewBox="0 0 700 40" style="overflow: visible;">
                <line x1="0" y1="10" x2="700" y2="10" stroke="#21262d" stroke-width="1" />
                <line x1="0" y1="25" x2="700" y2="25" stroke="#21262d" stroke-width="1" />
                <polyline points="10,25 60,22 110,24 160,20 210,23 260,18 310,24 360,21 410,25 460,19 510,23 560,21 610,24 660,20 690,22" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                <polygon points="10,38 10,25 60,22 110,24 160,20 210,23 260,18 310,24 360,21 410,25 460,19 510,23 560,21 610,24 660,20 690,22 690,38" fill="rgba(56, 189, 248, 0.12)" />
                <circle cx="690" cy="22" r="3.5" fill="#38bdf8" />
              </svg>
            </div>

            <div id="cli-terminal-screen" style="padding: 16px; min-height: 260px; max-height: 320px; overflow-y: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; line-height: 1.6; color: #39d353;">
              <div style="color: #8b949e;">ManageEngine OpManager Central Diagnostic Terminal v12.9.203 GA</div>
              <div style="color: #8b949e;">Probe Agent: ${dev.probe} (Host ID: probe_${dev.probeId || 1})</div>
              <div style="color: #8b949e;">Target node: ${dev.name} [${dev.ip}] &bull; SNMP Port: 161 &bull; ICMP Status: ALIVE</div>
              <div style="color: #58a6ff; margin-top: 8px;">Ready. Select a diagnostic utility above to execute live test against this asset.</div>
            </div>
          </div>
        `;

        const term = bodyContainer.querySelector('#cli-terminal-screen');
        const appendLog = (lines) => {
          if (!term) return;
          lines.forEach(l => {
            const d = document.createElement('div');
            d.innerHTML = l;
            term.appendChild(d);
          });
          term.scrollTop = term.scrollHeight;
        };

        const runPing = () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ ping -c 4 ${dev.ip}</div>`,
            `<div style="color: #8b949e;">PING ${dev.ip} (${dev.ip}): 56 data bytes</div>`,
            `<div>64 bytes from ${dev.ip}: icmp_seq=0 ttl=62 time=${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>`,
            `<div>64 bytes from ${dev.ip}: icmp_seq=1 ttl=62 time=${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>`,
            `<div>64 bytes from ${dev.ip}: icmp_seq=2 ttl=62 time=${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>`,
            `<div>64 bytes from ${dev.ip}: icmp_seq=3 ttl=62 time=${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>`,
            `<div style="color: #8b949e;">--- ${dev.ip} ping statistics ---</div>`,
            `<div style="color: #39d353; font-weight: 700;">4 packets transmitted, 4 packets received, 0.0% packet loss</div>`,
            `<div style="color: #58a6ff;">round-trip min/avg/max = ${(dev.responseTime - 0.4).toFixed(2)}/${dev.responseTime.toFixed(2)}/${(dev.responseTime + 0.6).toFixed(2)} ms</div>`
          ]);
        };

        const runTrace = () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ traceroute -m 30 -q 1 ${dev.ip}</div>`,
            `<div style="color: #8b949e;">traceroute to ${dev.ip} (${dev.ip}), 30 hops max, 60 byte packets</div>`,
            `<div> 1  opm-central-gw (10.0.0.1)  0.421 ms</div>`,
            `<div> 2  probe-wan-uplink (10.${dev.probeId || 1}0.0.1)  ${(dev.responseTime * 0.4).toFixed(2)} ms</div>`,
            `<div> 3  ${dev.name.toLowerCase()} (${dev.ip})  ${dev.responseTime.toFixed(2)} ms</div>`,
            `<div style="color: #39d353; font-weight: 700;">Trace complete. Destination reached in 3 hops (0 drops, MTU: 1500).</div>`
          ]);
        };

        const runSnmp = () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ snmpwalk -v 2c -c ******* ${dev.ip} RFC1213-MIB::system</div>`,
            `<div>SNMPv2-MIB::sysDescr.0 = STRING: ${dev.vendor} ${dev.type} (${dev.osVersion || 'Enterprise OS'})</div>`,
            `<div>SNMPv2-MIB::sysObjectID.0 = OID: SNMPv2-SMI::enterprises.9.1.2548</div>`,
            `<div>DISMAN-EVENT-MIB::sysUpTimeInstance = Timeticks: (124892010) 14 days, 10:55:20.10</div>`,
            `<div>SNMPv2-MIB::sysContact.0 = STRING: noc-admin@manageengine.internal</div>`,
            `<div>SNMPv2-MIB::sysName.0 = STRING: ${dev.name}</div>`,
            `<div>SNMPv2-MIB::sysLocation.0 = STRING: ${dev.probe}</div>`,
            `<div>IF-MIB::ifNumber.0 = INTEGER: ${(dev.interfaces || []).length || 48}</div>`,
            `<div style="color: #39d353; font-weight: 700;">End of MIB view reached (sysServices: 78).</div>`
          ]);
        };

        const pBtn = bodyContainer.querySelector('#cli-run-ping-btn');
        if (pBtn) pBtn.onclick = runPing;
        const tBtn = bodyContainer.querySelector('#cli-run-trace-btn');
        if (tBtn) tBtn.onclick = runTrace;
        const sBtn = bodyContainer.querySelector('#cli-run-snmp-btn');
        if (sBtn) sBtn.onclick = runSnmp;
        const cBtn = bodyContainer.querySelector('#cli-clear-btn');
        if (cBtn) cBtn.onclick = () => {
          if (term) term.innerHTML = '<div style="color: #8b949e;">Terminal output cleared.</div>';
        };

      } else if (activeModalTab === 'config') {
        bodyContainer.innerHTML = `
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">NCM Configuration Diff (Baseline Startup vs Live Running)</div>
            <div style="background: #0f172a; color: #f8fafc; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; line-height: 1.6; max-height: 240px; overflow-y: auto;">
              <span style="color: #94a3b8;">! Current running configuration drift detected on FortyGigE1/0/48</span><br>
              interface FortyGigabitEthernet1/0/48<br>
              <span style="color: #f87171;">- no shutdown (in Startup baseline)</span><br>
              <span style="color: #f87171;">+ shutdown <-- REASON FOR PORT DOWN ALARM</span><br>
              <span style="color: #4ade80;">+ access-list 101 permit tcp any host 10.40.1.1 eq 22</span>
            </div>
          </div>
        `;
      }
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 920px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); font-family: Roboto, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${getDeviceTypeIcon(dev.type, dev.category, 30)}
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 800; color: #0f172a;">${dev.name}</span>
                ${getStatusBadge(dev.status)}
                ${getVendorBadge(dev.vendor)}
              </div>
              <span style="font-size: 12px; color: #64748b; font-family: monospace;">${dev.ip} • ${dev.type} • Probe: <strong style="color: #0284c7;">${dev.probe}</strong></span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="modal-ping-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer;">Ping</button>
            <button id="modal-trace-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: #334155; cursor: pointer;">Traceroute</button>
            <button id="modal-cli-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: #334155; cursor: pointer;">Web CLI</button>
            <button id="close-snapshot-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; margin-left: 8px;">✕</button>
          </div>
        </div>

        <!-- Enterprise Multi-Tab Strip -->
        <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 0 24px; overflow-x: auto;">
          ${[
            { id: 'summary', label: 'Summary & Hardware' },
            { id: 'performance', label: 'Telemetry Graphs' },
            { id: 'monitors', label: 'Performance Monitors (7)' },
            { id: 'interfaces', label: `Interfaces (${(dev.interfaces || []).length})` },
            ...(isSwitch ? [{ id: 'ports', label: 'Port Matrix (48-Port)' }] : []),
            { id: 'diagnostics', label: 'Diagnostic CLI & SNMP' },
            { id: 'alarms', label: 'Active Alarms' },
            { id: 'config', label: 'Configuration (NCM)' }
          ].map(t => `
            <div class="snap-tab-item" data-tab="${t.id}" style="padding: 12px 16px; font-size: 12px; font-weight: ${t.id === activeModalTab ? '700' : '500'}; color: ${t.id === activeModalTab ? '#212121' : '#64748b'}; border-bottom: ${t.id === activeModalTab ? '3px solid #49bd80' : 'none'}; cursor: pointer; white-space: nowrap;">
              ${t.label}
            </div>
          `).join('')}
        </div>

        <!-- Modal Dynamic Body -->
        <div id="snapshot-body-container" style="padding: 24px;"></div>

        <!-- Diagnostics Output Terminal -->
        <div id="modal-term-container" style="display: none; padding: 0 24px 24px 24px;">
          <div style="background: #0f172a; border-radius: 4px; padding: 14px; font-family: monospace; font-size: 11px; color: #38bdf8; line-height: 1.6; max-height: 140px; overflow-y: auto;">
            <div id="modal-term-output"></div>
          </div>
        </div>

        <!-- Authentic ManageEngine Support & Build Footer -->
        <div style="padding: 10px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine OpManager Central (Version 12.9.203 GA Build 129203) • Monitored via ${dev.probe}</span>
          <span>Support: +1-888-720-9500 • <a href="mailto:opmanager-support@manageengine.com" style="color: #0070e0; text-decoration: none;">opmanager-support@manageengine.com</a></span>
        </div>
      </div>
    `;

    renderSnapshotBody();
    modal.style.display = 'flex';

    modal.querySelectorAll('.snap-tab-item').forEach(tab => {
      tab.onclick = () => {
        activeModalTab = tab.getAttribute('data-tab');
        modal.querySelectorAll('.snap-tab-item').forEach(t => {
          const isAct = t.getAttribute('data-tab') === activeModalTab;
          t.style.fontWeight = isAct ? '700' : '500';
          t.style.color = isAct ? '#212121' : '#64748b';
          t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
        });
        renderSnapshotBody();
      };
    });

    document.getElementById('close-snapshot-btn').onclick = () => { modal.style.display = 'none'; };

    // Diagnostic Tools handler
    const termCont = modal.querySelector('#modal-term-container');
    const termOut = modal.querySelector('#modal-term-output');

        document.getElementById('modal-ping-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-ping-btn');
        if (btn) btn.click();
      }, 50);
    };

    document.getElementById('modal-trace-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-trace-btn');
        if (btn) btn.click();
      }, 50);
    };

    document.getElementById('modal-cli-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-snmp-btn');
        if (btn) btn.click();
      }, 50);
    };
  }

  // -------------------------------------------------------------
  // MODAL: SNMP TRAP VIEWER & INGESTION (data-fsoqa="alarms-actions-trap-viewer-btn")
  // -------------------------------------------------------------
  function showTrapViewerModal() {
    let modal = document.getElementById('opm-trap-viewer-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-trap-viewer-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.55); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const traps = [
      { id: 'TRP-1092', time: '15:42:01 UTC', source: '10.40.1.1 (DXB-CORE-SW-01)', probe: 'Dubai DC Core', oid: '.1.3.6.1.6.3.1.1.5.3', name: 'linkDown', severity: 'Critical', bindings: 'ifIndex=2, ifDescr=GigabitEthernet0/1, ifOperStatus=2(down)' },
      { id: 'TRP-1091', time: '15:40:15 UTC', source: '10.10.1.20 (NY-CORE-RTR-01)', probe: 'New York Central DC', oid: '.1.3.6.1.6.3.1.1.5.1', name: 'coldStart', severity: 'Attention', bindings: 'sysUpTime.0=0, sysName.0=NY-CORE-RTR-01' },
      { id: 'TRP-1090', time: '15:35:48 UTC', source: '10.20.1.50 (LDN-DIST-SW-01)', probe: 'London Regional', oid: '.1.3.6.1.6.3.1.1.5.5', name: 'authenticationFailure', severity: 'Trouble', bindings: 'snmpTrapAddress.0=10.20.1.99, badCommunity=public' },
      { id: 'TRP-1089', time: '15:28:10 UTC', source: '10.40.1.1 (DXB-CORE-SW-01)', probe: 'Dubai DC Core', oid: '.1.3.6.1.4.1.9.9.43.2.0.1', name: 'ciscoConfigManEvent', severity: 'Attention', bindings: 'ccmHistoryEventCommandSource=commandLine(1), ccmHistoryEventConfigSource=running(3)' },
      { id: 'TRP-1088', time: '15:15:22 UTC', source: '10.30.1.10 (SG-CORE-RTR-01)', probe: 'Singapore APAC', oid: '.1.3.6.1.2.1.15.0.1', name: 'bgpEstablished', severity: 'Clear', bindings: 'bgpPeerLastError=0, bgpPeerState=6(established)' }
    ];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 920px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SNMP Trap Viewer & Parser Console</div>
              <div style="font-size: 11px; color: #64748b;">UDP Port 162 Listener • Central Master aggregating across 4 distributed Probes</div>
            </div>
          </div>
          <button id="opm-close-traps-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <!-- Filter Bar -->
        <div style="padding: 12px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; font-weight: 700; color: #475569;">Filter Traps:</span>
            <select id="opm-trap-probe-filter" style="font-size: 11px; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff;">
              <option value="all">All Probes (4)</option>
              <option value="1">New York Central DC</option>
              <option value="2">London Regional</option>
              <option value="3">Singapore APAC</option>
              <option value="4">Dubai DC Core</option>
            </select>
            <input type="text" placeholder="Search Trap OID or IP..." style="font-size: 11px; padding: 5px 10px; border: 1px solid #cbd5e1; border-radius: 4px; width: 180px;">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="opm-trap-test-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Simulate Inbound Trap
            </button>
            <button id="opm-trap-export-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Export Trap Log
            </button>
          </div>
        </div>

        <!-- Table Body -->
        <div style="flex: 1; overflow-y: auto; padding: 16px 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #475569; font-weight: 700;">
                <th style="padding: 8px 10px;">Severity</th>
                <th style="padding: 8px 10px;">Trap Name & OID</th>
                <th style="padding: 8px 10px;">Source Device</th>
                <th style="padding: 8px 10px;">Probe</th>
                <th style="padding: 8px 10px;">Variable Bindings</th>
                <th style="padding: 8px 10px;">Received</th>
              </tr>
            </thead>
            <tbody>
              ${traps.map(t => {
                const badgeColor = t.severity === 'Critical' ? '#dc2626' : (t.severity === 'Trouble' ? '#ea580c' : (t.severity === 'Attention' ? '#ca8a04' : '#16a34a'));
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 10px;">
                      <span style="font-size: 10px; font-weight: 700; color: #fff; background: ${badgeColor}; padding: 2px 6px; border-radius: 3px;">${t.severity}</span>
                    </td>
                    <td style="padding: 10px 10px;">
                      <div style="font-weight: 700; color: #0070e0;">${t.name}</div>
                      <div style="font-size: 10px; font-family: monospace; color: #64748b;">${t.oid}</div>
                    </td>
                    <td style="padding: 10px 10px; font-weight: 600; color: #1e293b;">${t.source}</td>
                    <td style="padding: 10px 10px; color: #64748b;">${t.probe}</td>
                    <td style="padding: 10px 10px; font-family: monospace; font-size: 11px; color: #334155; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.bindings}</td>
                    <td style="padding: 10px 10px; color: #64748b; font-size: 11px;">${t.time}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 24px; background: #fafbfc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>5 Traps Captured (Last 1 Hour) • Trap-to-Alarm Correlation Rule: <strong>ACTIVE</strong></span>
          <button id="opm-trap-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('opm-close-traps-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('opm-trap-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('opm-trap-test-btn').onclick = () => {
      showToast('Simulated RFC1213 linkDown SNMP trap injected successfully.');
    };
    document.getElementById('opm-trap-export-btn').onclick = () => {
      showToast('Exported SNMP Traps log as CSV.');
    };
  }

  // -------------------------------------------------------------
  // MODAL: COLUMN CHOOSER (data-fsoqa="alarms-actions-column-chooser-btn")
  // -------------------------------------------------------------
  function showColumnChooserModal(viewType, onSave) {
    let modal = document.getElementById('opm-column-chooser-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-column-chooser-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.55); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const availableCols = [
      { id: 'severity', label: 'Severity Status', checked: true },
      { id: 'device', label: 'Device / Source Name', checked: true },
      { id: 'ip', label: 'IP Address', checked: true },
      { id: 'entity', label: 'Entity / Metric Identifier', checked: true },
      { id: 'message', label: 'Alarm Description Message', checked: true },
      { id: 'probe', label: 'Distributed Enterprise Probe', checked: true },
      { id: 'time', label: 'Logged Timestamp', checked: true },
      { id: 'technician', label: 'Assigned Operator / Status', checked: true },
      { id: 'category', label: 'Device Category', checked: false },
      { id: 'sysoid', label: 'SNMP System OID', checked: false }
    ];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 440px; max-width: 90vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fafbfc;">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">Customize Table Columns</div>
          <button id="opm-col-chooser-close" style="background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 20px; max-height: 380px; overflow-y: auto;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 14px;">Select the columns to display in the ${viewType || 'Alarms'} view:</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${availableCols.map(c => `
              <label style="display: flex; align-items: center; gap: 10px; font-size: 12px; color: #1e293b; cursor: pointer;">
                <input type="checkbox" ${c.checked ? 'checked' : ''} style="cursor: pointer; width: 15px; height: 15px;">
                <span>${c.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div style="padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button id="opm-col-chooser-cancel" style="background: #fff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
          <button id="opm-col-chooser-save" style="background: #0070e0; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Apply Columns</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('opm-col-chooser-close').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('opm-col-chooser-cancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('opm-col-chooser-save').onclick = () => {
      modal.style.display = 'none';
      showToast('Table columns updated successfully.');
      if (typeof onSave === 'function') onSave();
    };
  }

  // --- REAL-TIME SUBNET SWEEP DISCOVERY WIZARD ---
  function showSubnetDiscoveryModal(targetProbeId) {
    let modal = document.getElementById('opm-subnet-discovery-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-subnet-discovery-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Lato, Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const defaultProbe = targetProbeId ? state.probes.find(p => p.id == targetProbeId) : state.probes[0];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 680px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); overflow: hidden; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <div style="padding: 16px 24px; background: #212121; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d824e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <div>
              <div style="font-size: 15px; font-weight: 700;">Subnet Sweep Discovery Wizard</div>
              <div style="font-size: 11px; color: #94a3b8;">Probe-Distributed ICMP / SNMP CIDR Auto-Discovery</div>
            </div>
          </div>
          <button id="close-subnet-disc-btn" style="background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer;">✕</button>
        </div>

        <!-- Form / Sweep Configuration -->
        <div style="padding: 20px 24px; font-size: 12px; color: #334155;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Starting IP Address *</label>
              <input type="text" id="disc-start-ip" value="10.10.0.1" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Ending IP Address *</label>
              <input type="text" id="disc-end-ip" value="10.10.0.16" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Assigned Distributed Probe *</label>
              <select id="disc-probe-sel" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #ffffff; box-sizing: border-box;">
                ${state.probes.map(p => `<option value="${p.id}" ${defaultProbe && p.id === defaultProbe.id ? 'selected' : ''}>${p.name} (${p.location})</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Discovery Protocol Profile</label>
              <select id="disc-cred-sel" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #ffffff; box-sizing: border-box;">
                <option value="v2c">SNMP v1/v2c (Community: public, dxb-ro)</option>
                <option value="v3">SNMP v3 (SHA-256 Auth / AES-256 Priv)</option>
                <option value="wmi">Windows WMI / PowerShell RPC</option>
                <option value="ssh">Linux SSH Key (opm-monitoring)</option>
              </select>
            </div>
          </div>

          <!-- Progress Area -->
          <div id="disc-progress-box" style="display: none; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px;">
              <span id="disc-progress-status" style="color: #0070e0;">Executing multi-threaded probe sweep...</span>
              <span id="disc-progress-pct" style="color: #0f172a;">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
              <div id="disc-progress-bar" style="width: 0%; height: 100%; background: #1d824e; transition: width 0.2s ease;"></div>
            </div>
          </div>

          <!-- Real-Time Terminal Output -->
          <div style="border: 1px solid #cbd5e1; border-radius: 4px; background: #0f172a; padding: 12px; font-family: monospace; font-size: 11px; color: #38bdf8; height: 140px; overflow-y: auto; line-height: 1.5;" id="disc-terminal">
            <span style="color: #94a3b8;">OpManager Central Subnet Discovery Engine v12.9.203 ready.</span><br>
            <span style="color: #64748b;">Specify target IP range and click "Start Discovery Sweep" to query live probe agents.</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <span id="disc-summary-txt" style="font-size: 11px; color: #64748b;">Ready to discover</span>
          <div style="display: flex; gap: 8px;">
            <button id="cancel-subnet-disc-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Close</button>
            <button id="start-subnet-disc-btn" style="background: #1d824e; color: #ffffff; border: none; border-radius: 4px; padding: 6px 18px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>Start Discovery Sweep</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button id="apply-subnet-disc-btn" style="display: none; background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 18px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Commit Discovered Devices to Central Inventory
            </button>
          </div>
        </div>

      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-subnet-disc-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-subnet-disc-btn').onclick = () => { modal.style.display = 'none'; };

    const startBtn = document.getElementById('start-subnet-disc-btn');
    const applyBtn = document.getElementById('apply-subnet-disc-btn');
    const progBox = document.getElementById('disc-progress-box');
    const progBar = document.getElementById('disc-progress-bar');
    const progPct = document.getElementById('disc-progress-pct');
    const progStat = document.getElementById('disc-progress-status');
    const term = document.getElementById('disc-terminal');
    const summaryTxt = document.getElementById('disc-summary-txt');

    let stagedDevices = [];

    startBtn.onclick = async () => {
      startBtn.disabled = true;
      startBtn.style.opacity = '0.6';
      progBox.style.display = 'block';
      progBar.style.width = '10%';
      progPct.innerText = '10%';
      term.innerHTML = `<span style="color: #4ade80;">[${new Date().toLocaleTimeString()}] Subnet sweep started via Probe...</span><br>`;

      const startIp = document.getElementById('disc-start-ip').value.trim();
      const endIp = document.getElementById('disc-end-ip').value.trim();
      const probeId = parseInt(document.getElementById('disc-probe-sel').value, 10);
      const snmpVer = document.getElementById('disc-cred-sel').value;

      term.innerHTML += `<span style="color: #cbd5e1;">[Probe Poller] Scanning CIDR scope ${startIp} to ${endIp} on Port 161/SNMP...</span><br>`;

      let currentPct = 10;
      const progressTimer = setInterval(() => {
        if (currentPct < 90) {
          currentPct += 15;
          progBar.style.width = currentPct + '%';
          progPct.innerText = currentPct + '%';
        }
      }, 300);

      try {
        const res = await fetch('/api/discovery/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ probeId, startIp, endIp, snmpVersion: snmpVer })
        });
        const data = await res.json();
        clearInterval(progressTimer);

        progBar.style.width = '100%';
        progPct.innerText = '100%';
        progStat.innerText = 'Discovery sweep complete!';
        progStat.style.color = '#16a34a';

        if (data.status === 'success' && data.discoveredDevices && data.discoveredDevices.length > 0) {
          stagedDevices = data.discoveredDevices;
          stagedDevices.forEach(d => {
            term.innerHTML += `<span style="color: #4ade80;">[FOUND] ${d.ip} - ${d.displayName} (${d.category}) [SNMP sysDescr OK]</span><br>`;
          });
          summaryTxt.innerHTML = `<strong style="color: #16a34a;">${stagedDevices.length} new devices identified!</strong>`;
          startBtn.style.display = 'none';
          applyBtn.style.display = 'inline-block';
        } else {
          term.innerHTML += `<span style="color: #f87171;">Sweep finished. No responsive unmanaged nodes in range.</span><br>`;
          startBtn.disabled = false;
          startBtn.style.opacity = '1';
        }
        term.scrollTop = term.scrollHeight;
      } catch (err) {
        clearInterval(progressTimer);
        term.innerHTML += `<span style="color: #f87171;">Discovery error: ${err.message}</span><br>`;
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
      }
    };

    applyBtn.onclick = () => {
      stagedDevices.forEach(d => {
        if (!state.devices.find(x => x.id === d.id)) {
          state.devices.unshift(d);
        }
      });
      showToast(`${stagedDevices.length} devices successfully enrolled into OpManager Central Inventory!`);
      modal.style.display = 'none';
      if (state.currentTab === 'inventory') renderInventoryView();
      else if (state.currentTab === 'dashboard') renderDashboardView();
      else if (state.currentTab === 'settings') renderSettingsView();
    };
  }

  // --- REAL-TIME OPUTILS DIAGNOSTIC SUITE MODAL ---
  function showNetworkToolsModal(targetIp, defaultTab = 'ping') {
    let modal = document.getElementById('opm-network-tools-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-network-tools-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Lato, Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    let activeTool = defaultTab;
    const ip = targetIp || (state.devices[0] ? state.devices[0].ip : '10.10.0.1');

    function renderToolsContent() {
      const container = modal.querySelector('#tools-tab-content');
      if (!container) return;

      if (activeTool === 'ping') {
        container.innerHTML = `
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="tool-ping-ip" value="${ip}" placeholder="Target IP or Hostname" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <select id="tool-ping-probe" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
              <option value="local">Local Mac</option>
            </select>
            <button id="tool-exec-ping-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">Ping Now</button>
          </div>
          <div id="tool-ping-out" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; height: 200px; overflow-y: auto; line-height: 1.6;">
            Ready to send ICMP packets from this Mac.
          </div>
        `;
        const btn = container.querySelector('#tool-exec-ping-btn');
        const out = container.querySelector('#tool-ping-out');
        btn.onclick = async () => {
          const tgt = container.querySelector('#tool-ping-ip').value.trim();
          btn.disabled = true;
          out.textContent = `Sending 4 ICMP packets to ${tgt} from this Mac…`;
          try {
            const res = await fetch('/api/tools/ping', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: tgt, count: 4 })
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message || 'Ping failed.');
            if (d.source !== 'local-mac') throw new Error('Live ping requires the updated local backend.');
            out.innerHTML = `--- Ping results for ${d.target} via ${d.probe} ---<br>`;
            (d.packets || []).forEach(p => {
              out.innerHTML += `<span style="color: #4ade80;">${p.status}</span><br>`;
            });
            out.innerHTML += `<br>Packets: Sent = ${d.transmitted}, Received = ${d.received}, Lost = ${d.lossPercent}%`;
            if (d.avgRtt !== null) out.innerHTML += `<br>RTT: Min = ${d.minRtt}ms, Max = ${d.maxRtt}ms, Avg = ${d.avgRtt}ms`;
          } catch (e) {
            out.textContent = e.message;
          }
          btn.disabled = false;
        };
      } else if (activeTool === 'traceroute') {
        container.innerHTML = `
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="tool-trace-ip" value="${ip}" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <button id="tool-exec-trace-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">Traceroute</button>
          </div>
          <div id="tool-trace-out" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; height: 200px; overflow-y: auto; line-height: 1.6;">
            Click Traceroute to discover routing path and hop latencies.
          </div>
        `;
        const btn = container.querySelector('#tool-exec-trace-btn');
        const out = container.querySelector('#tool-trace-out');
        btn.onclick = async () => {
          const tgt = container.querySelector('#tool-trace-ip').value.trim();
          btn.disabled = true;
          out.textContent = `Tracing route to ${tgt} from this Mac (up to 20 hops)…`;
          try {
            const res = await fetch('/api/tools/traceroute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: tgt })
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message || 'Traceroute failed.');
            if (d.source !== 'local-mac') throw new Error('Live traceroute requires the updated local backend.');
            out.textContent = '';
            (d.hops || []).forEach(h => {
              out.innerHTML += `Hop ${h.hop}:  ${h.rtt1}  ${h.rtt2}  ${h.rtt3}  ${h.hostname} [${h.ip}]<br>`;
            });
            out.innerHTML += d.destinationResponded ? '<br>Destination replied.' : '<br>No reply from destination.';
          } catch (e) {
            out.textContent = e.message;
          }
          btn.disabled = false;
        };
      } else if (activeTool === 'mib') {
        container.innerHTML = `
          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <select id="tool-mib-module" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
              <option value="RFC1213-MIB">RFC1213-MIB (MIB-II Standard)</option>
              <option value="CISCO-STACK-MIB">CISCO-STACK-MIB (Cisco Hardware)</option>
              <option value="HOST-RESOURCES-MIB">HOST-RESOURCES-MIB (Server OS)</option>
            </select>
            <input type="text" id="tool-mib-oid" value=".1.3.6.1.2.1.1" placeholder="OID string" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <button id="tool-exec-mib-btn" style="background: #1d824e; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">SNMP Walk</button>
          </div>
          <div style="display: flex; gap: 14px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 12px; margin-bottom: 10px; font-size: 11px; color: #475569;">
            <span style="font-weight: 700; color: #0f172a;">MIB Tree Legend:</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_directory.gif" style="width:14px;height:14px;"> Directory</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_table.gif" style="width:14px;height:14px;"> Table</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_entry.gif" style="width:14px;height:14px;"> Entry</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_key.gif" style="width:14px;height:14px;"> Index Key</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_node.gif" style="width:14px;height:14px;"> Scalar Leaf</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_trap.gif" style="width:14px;height:14px;"> Trap</span>
          </div>
          <div id="tool-mib-out" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; height: 200px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">
                <tr>
                  <th style="padding: 6px 10px; text-align: left;">OID</th>
                  <th style="padding: 6px 10px; text-align: left;">Name</th>
                  <th style="padding: 6px 10px; text-align: left;">Type</th>
                  <th style="padding: 6px 10px; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody id="tool-mib-tbody">
                <tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">Click 'SNMP Walk' to query authentic OIDs on ${ip}</td></tr>
              </tbody>
            </table>
          </div>
        `;
        const btn = container.querySelector('#tool-exec-mib-btn');
        const tbody = container.querySelector('#tool-mib-tbody');
        btn.onclick = async () => {
          const oid = container.querySelector('#tool-mib-oid').value.trim();
          btn.disabled = true;
          tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #0070e0;">Performing SNMP Walk on ${ip} for OID ${oid}...</td></tr>`;
          try {
            const res = await fetch('/api/tools/snmp-walk?ip=' + encodeURIComponent(ip) + '&oid=' + encodeURIComponent(oid));
            const d = await res.json();
            if (d.results && d.results.length > 0) {
              tbody.innerHTML = d.results.map(r => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-family: monospace; color: #0070e0;">${r.oid}</td>
                  <td style="padding: 6px 10px; font-weight: 600; display: flex; align-items: center; gap: 6px;"><img src="/apiclient/fluidicv2/img/${r.name.includes('Index') ? 'mib_key.gif' : (r.name.includes('Table') ? 'mib_table.gif' : 'mib_node.gif')}" style="width:13px;height:13px;"> ${r.name}</td>
                  <td style="padding: 6px 10px; color: #64748b;">${r.type}</td>
                  <td style="padding: 6px 10px; font-family: monospace; color: #16a34a; font-weight: 600;">${r.value}</td>
                </tr>
              `).join('');
            } else {
              tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #f87171;">No matching SNMP OID entries found.</td></tr>`;
            }
          } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #f87171;">SNMP query error: ${e.message}</td></tr>`;
          }
          btn.disabled = false;
        };
      } else if (activeTool === 'ports') {
        container.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b;">Switch Port Status &amp; MAC-to-IP Binding</div>
            <button id="tool-refresh-ports-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer;">Scan Ports</button>
          </div>
          <div id="tool-ports-box" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; height: 210px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #475569;">
                <tr>
                  <th style="padding: 6px 10px; text-align: left;">Port</th>
                  <th style="padding: 6px 10px; text-align: left;">Alias / Description</th>
                  <th style="padding: 6px 10px; text-align: left;">Status</th>
                  <th style="padding: 6px 10px; text-align: left;">Speed</th>
                  <th style="padding: 6px 10px; text-align: left;">VLAN</th>
                  <th style="padding: 6px 10px; text-align: left;">Connected MAC / IP</th>
                </tr>
              </thead>
              <tbody id="tool-ports-tbody">
                <tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">Click 'Scan Ports' to retrieve real-time switch port mapping.</td></tr>
              </tbody>
            </table>
          </div>
        `;
        const btn = container.querySelector('#tool-refresh-ports-btn');
        const tbody = container.querySelector('#tool-ports-tbody');
        const loadPorts = async () => {
          tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #0070e0;">Scanning 802.1Q port tables on switch...</td></tr>`;
          try {
            const res = await fetch('/api/tools/switch-ports?ip=' + encodeURIComponent(ip));
            const d = await res.json();
            if (d.ports) {
              tbody.innerHTML = d.ports.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 6px;"><img src="/apiclient/fluidicv2/img/${p.operStatus === 'Up' ? 'port_up.gif' : 'port_down.gif'}" style="width:13px;height:13px;"> ${p.port}</td>
                  <td style="padding: 6px 10px; color: #334155;">${p.alias}</td>
                  <td style="padding: 6px 10px;"><span style="color: ${p.operStatus === 'Up' ? '#16a34a' : '#dc2626'}; font-weight: 700;"><img src="/apiclient/fluidicv2/img/${p.operStatus === 'Up' ? 'port_up.gif' : 'port_down.gif'}" style="width:10px;height:10px;vertical-align:middle;"> ${p.operStatus}</span></td>
                  <td style="padding: 6px 10px; color: #64748b;">${p.speed}</td>
                  <td style="padding: 6px 10px; font-weight: 600;">VLAN ${p.vlan}</td>
                  <td style="padding: 6px 10px; font-family: monospace;">${p.mac} (${p.ip})</td>
                </tr>
              `).join('');
            }
          } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #f87171;">Port scan error: ${e.message}</td></tr>`;
          }
        };
        btn.onclick = loadPorts;
        loadPorts();
      } else if (activeTool === 'terminal') {
        container.innerHTML = `
          <div style="background: #0f172a; color: #f8fafc; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; height: 180px; overflow-y: auto; line-height: 1.5;" id="tool-term-screen">
            <span style="color: #4ade80;">ManageEngine OpManager Central Web CLI Terminal v12.9.203</span><br>
            <span style="color: #94a3b8;">Connected to ${ip} via Secure Shell (SSHv2). Type commands below (e.g. 'show ip int br', 'show version', 'show running-config', 'ping 10.0.0.1').</span><br><br>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <input type="text" id="tool-cli-input" value="show ip int br" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <button id="tool-cli-send-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">Execute</button>
          </div>
        `;
        const scr = container.querySelector('#tool-term-screen');
        const inp = container.querySelector('#tool-cli-input');
        const sendBtn = container.querySelector('#tool-cli-send-btn');

        const execCmd = async () => {
          const cmd = inp.value.trim();
          if (!cmd) return;
          scr.innerHTML += `<span style="color: #38bdf8;">CORE# ${cmd}</span><br>`;
          try {
            const res = await fetch('/api/tools/terminal-exec', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ command: cmd, hostname: 'CORE-RTR-01' })
            });
            const d = await res.json();
            scr.innerHTML += `<span style="color: #f1f5f9;">${(d.output || '').replace(/\n/g, '<br>')}</span><br><br>`;
          } catch (e) {
            scr.innerHTML += `<span style="color: #f87171;">Terminal exec error: ${e.message}</span><br>`;
          }
          scr.scrollTop = scr.scrollHeight;
          inp.value = '';
        };

        sendBtn.onclick = execCmd;
        inp.onkeydown = (e) => { if (e.key === 'Enter') execCmd(); };
      }
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 760px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); overflow: hidden; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="padding: 14px 20px; background: #212121; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <div>
              <div style="font-size: 14px; font-weight: 700;">OpUtils Diagnostics & Network Tools</div>
              <div style="font-size: 11px; color: #94a3b8;">Target Node: <strong style="color: #38bdf8;">${ip}</strong> • Distributed Probing</div>
            </div>
          </div>
          <button id="close-tools-modal-btn" style="background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer;">✕</button>
        </div>

        <!-- Tool Selection Tabs -->
        <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; padding: 0 20px;">
          ${[
            { id: 'ping', label: 'ICMP Ping' },
            { id: 'traceroute', label: 'Traceroute' },
            { id: 'mib', label: 'SNMP MIB Browser' },
            { id: 'ports', label: 'Switch Port Mapper' },
            { id: 'terminal', label: 'Web CLI Terminal' }
          ].map(t => `
            <div class="tool-tab-btn" data-tool="${t.id}" style="padding: 10px 14px; font-size: 12px; font-weight: ${t.id === activeTool ? '700' : '500'}; color: ${t.id === activeTool ? '#0070e0' : '#64748b'}; border-bottom: ${t.id === activeTool ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
              ${t.label}
            </div>
          `).join('')}
        </div>

        <div id="tools-tab-content" style="padding: 20px;"></div>

        <!-- Footer -->
        <div style="padding: 10px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine OpManager Central (Version 12.9.203 GA Build 129203)</span>
          <button id="ok-tools-modal-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 5px 14px; font-size: 11px; font-weight: 600; cursor: pointer;">Done</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-tools-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('ok-tools-modal-btn').onclick = () => { modal.style.display = 'none'; };

    modal.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeTool = btn.getAttribute('data-tool');
        modal.querySelectorAll('.tool-tab-btn').forEach(b => {
          const isAct = b.getAttribute('data-tool') === activeTool;
          b.style.fontWeight = isAct ? '700' : '500';
          b.style.color = isAct ? '#0070e0' : '#64748b';
          b.style.borderBottom = isAct ? '2px solid #0070e0' : 'none';
        });
        renderToolsContent();
      };
    });

    renderToolsContent();
  }

  // --- ADD ENTERPRISE USER MODAL ---
  function showAddUserModal() {
    let modal = document.getElementById('opm-add-user-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-add-user-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Add Enterprise User Account</span>
            <button id="close-add-user-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Username *</label>
              <input type="text" id="new-user-username" placeholder="e.g. s_khan" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Full Display Name *</label>
              <input type="text" id="new-user-fullname" placeholder="e.g. Salman Khan" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Email Address *</label>
              <input type="email" id="new-user-email" placeholder="user@enterprise.corp" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Role Profile *</label>
                <select id="new-user-role" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option>Network Operator</option>
                  <option>Super Administrator</option>
                  <option>Security Auditor (NCM/FWA)</option>
                  <option>Read-Only Guest</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Authentication Type</label>
                <select id="new-user-auth" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option>Local Authentication</option>
                  <option>Active Directory (LDAP)</option>
                  <option>SAML 2.0 Single Sign-On</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Probe Scope Permission</label>
              <select id="new-user-scope" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option>Global Central (All Probes)</option>
                <option>Dubai Campus Core</option>
                <option>New York Data Center</option>
                <option>London Branch Office</option>
                <option>Singapore Cloud VPC</option>
              </select>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-add-user-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-add-user-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Create User Account</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-add-user-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-add-user-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-add-user-btn').onclick = async () => {
      const u = document.getElementById('new-user-username').value.trim() || 'user_' + Math.floor(Math.random() * 900 + 100);
      const fn = document.getElementById('new-user-fullname').value.trim() || u;
      const em = document.getElementById('new-user-email').value.trim() || `${u}@enterprise.corp`;
      const rl = document.getElementById('new-user-role').value;
      const at = document.getElementById('new-user-auth').value;
      const sc = document.getElementById('new-user-scope').value;

      try {
        await fetch('/api/settings/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, name: fn, email: em, role: rl, authType: at, probeScope: sc })
        });
      } catch(e) {}

      showToast(`User account ${u} (${fn}) created successfully with role ${rl}.`);
      modal.style.display = 'none';
      if (state.currentTab === 'settings') {
        renderSettingsView();
      }
    };
  }

  function showNewDiscoveryRuleModal() {
    let modal = document.getElementById('opm-new-rule-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-new-rule-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 540px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Create Scheduled Discovery Rule</span>
            <button id="close-new-rule-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Discovery Rule Name *</label>
              <input type="text" id="new-rule-name" placeholder="e.g. Branch Office Subnet Sweep" value="Branch Office Subnet Sweep (10.60.0.0/24)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">CIDR Subnet / Range *</label>
                <input type="text" id="new-rule-subnet" value="10.60.0.0/24" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Assigned Probe *</label>
                <select id="new-rule-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  ${state.probes.map(p => `<option value="${p.name}">${p.name} (${p.location})</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Sweep Schedule</label>
                <select id="new-rule-sched" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option>Daily at 02:00 AM</option>
                  <option>Daily at 06:00 AM</option>
                  <option>Weekly (Sunday 01:00 AM)</option>
                  <option>On-Demand Manual Only</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Credential Profile</label>
                <select id="new-rule-cred" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option>SNMPv2c Community (dxb-ro)</option>
                  <option>SNMPv3 USM (SHA-256 / AES-256)</option>
                  <option>WMI / Windows WinRM</option>
                  <option>Linux SSH Key Vault</option>
                </select>
              </div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; font-size: 11px; color: #475569;">
              <span style="font-weight: 700; color: #1e293b;">Auto-Action:</span> Matches will automatically be assigned device templates based on SNMP SysOID and added to OpManager Central inventory.
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-new-rule-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-new-rule-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Save Discovery Schedule</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-new-rule-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-new-rule-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-new-rule-btn').onclick = async () => {
      const nm = document.getElementById('new-rule-name').value.trim() || 'Subnet Sweep';
      const sub = document.getElementById('new-rule-subnet').value.trim() || '10.60.0.0/24';
      const prb = document.getElementById('new-rule-probe').value;
      const sch = document.getElementById('new-rule-sched').value;
      const crd = document.getElementById('new-rule-cred').value;

      try {
        await fetch('/api/discovery/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nm, subnet: sub, probe: prb, schedule: sch, credential: crd })
        });
      } catch(e) {}

      showToast(`Discovery rule "${nm}" scheduled on ${prb}.`);
      modal.style.display = 'none';
      if (state.currentTab === 'settings') {
        renderSettingsView();
      }
    };
  }

  function showNewTemplateModal() {
    let modal = document.getElementById('opm-new-tmpl-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-new-tmpl-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 540px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Add Custom Device Template</span>
            <button id="close-new-tmpl-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Template Name *</label>
              <input type="text" id="new-tmpl-name" placeholder="e.g. Cisco Nexus 9300-FX3" value="Cisco Nexus 9300-FX3 Series" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Hardware Vendor *</label>
                <input type="text" id="new-tmpl-vendor" value="Cisco Systems" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Device Category *</label>
                <select id="new-tmpl-cat" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option>Switches</option>
                  <option>Routers</option>
                  <option>Firewalls</option>
                  <option>Servers</option>
                  <option>Storage</option>
                  <option>Wireless</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Enterprise SysOID String *</label>
              <input type="text" id="new-tmpl-sysoid" value=".1.3.6.1.4.1.9.1.2840" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Performance Monitors Associated</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <label><input type="checkbox" checked> CPU Utilization</label>
                <label><input type="checkbox" checked> Memory Buffer</label>
                <label><input type="checkbox" checked> Temperature Gauge</label>
                <label><input type="checkbox" checked> Power Supply Redundancy</label>
              </div>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-new-tmpl-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-new-tmpl-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Save Template</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-new-tmpl-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-new-tmpl-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-new-tmpl-btn').onclick = () => {
      const nm = document.getElementById('new-tmpl-name').value.trim() || 'Custom Device Template';
      showToast(`Device Template "${nm}" added to AdventNet template repository.`);
      modal.style.display = 'none';
      if (state.currentTab === 'settings') {
        renderSettingsView();
      }
    };
  }

  function showApplyLicenseModal() {
    let modal = document.getElementById('opm-apply-license-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-apply-license-modal';
      modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(2px);';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 560px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Apply License Key (.xml)</span>
              <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">GA BUILD 129203</span>
            </div>
            <button id="close-apply-license-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <!-- Server Machine Host ID -->
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">Central Server Host ID (MAC Address):</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace; margin-top: 2px;">00:50:56:B2:91:A4</div>
              </div>
              <button onclick="navigator.clipboard.writeText('00:50:56:B2:91:A4'); window.showToast('Copied Host ID to clipboard');" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; color: #0070e0; font-weight: 600;">Copy Host ID</button>
            </div>

            <!-- License XML File Selector -->
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 6px;">Select AdventNetLicense.xml File *</label>
              <div style="border: 2px dashed #cbd5e1; border-radius: 6px; padding: 18px; text-align: center; background: #fafbfc; cursor: pointer;" onclick="document.getElementById('license-file-input').click()">
                <div style="font-size: 13px; font-weight: 600; color: #0070e0;">Click to browse or drop AdventNetLicense.xml</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Official XML license certificate provided by Zoho Corporation Pvt. Ltd.</div>
                <input type="file" id="license-file-input" accept=".xml" style="display: none;" onchange="document.getElementById('selected-lic-name').textContent = this.files[0] ? this.files[0].name : '';">
                <div id="selected-lic-name" style="font-size: 11px; font-weight: 700; color: #16a34a; margin-top: 6px;">AdventNetLicense_GA_Perpetual_Central.xml (Attached)</div>
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">License Key XML Content (Optional Text Input)</label>
              <textarea id="license-xml-text" rows="4" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 11px; font-family: monospace; box-sizing: border-box;" placeholder="<?xml version='1.0' encoding='UTF-8'?><AdventNetLicense><Product>OpManager-Central</Product><Type>Perpetual</Type></AdventNetLicense>"></textarea>
            </div>
            
            <div style="font-size: 11px; color: #64748b; line-height: 1.5;">
              Applying a new license key automatically distributes probe licenses across all connected probes (New York, London, Singapore, Dubai).
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-apply-license-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-apply-license-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Validate & Apply License</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-apply-license-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-apply-license-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-apply-license-btn').onclick = async () => {
      try {
        const res = await fetch('/api/settings/license/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseXml: 'AdventNetLicense_GA_Perpetual.xml' })
        });
        const data = await res.json();
        showToast(data.message || 'Perpetual License applied successfully.');
      } catch (e) {
        showToast('Perpetual License applied successfully.');
      }
      modal.style.display = 'none';
      if (state.currentTab === 'settings') {
        renderSettingsView();
      }
    };
  }



  // -------------------------------------------------------------
  // MODAL: ManageEngine NetPath Hop-by-Hop Visual Path Analyzer
  // -------------------------------------------------------------
  function showNetPathModal(sourceProbe, targetService) {
    let modal = document.getElementById('opm-netpath-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-netpath-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10006; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const services = [
      { id: 'salesforce', name: 'Salesforce CRM Cloud', ip: '13.107.6.156', port: 443, as: 'AS8075 Microsoft/Salesforce' },
      { id: 'o365', name: 'Microsoft 365 Exchange', ip: '52.96.0.0', port: 443, as: 'AS8075 Microsoft Corp' },
      { id: 'aws', name: 'AWS us-east-1 RDS Core', ip: '172.31.0.12', port: 5432, as: 'AS16509 Amazon.com' },
      { id: 'gcp', name: 'Google Cloud Storage VPC', ip: '142.250.190.46', port: 443, as: 'AS15169 Google LLC' }
    ];

    const currentSvc = services.find(s => s.id === targetService) || services[0];
    const probeName = sourceProbe ? sourceProbe.name : 'New York Data Center (Probe-01)';

    const hops = [
      { num: 0, name: 'Source Probe', host: 'opm-ny-probe.enterprise.corp', ip: '10.0.0.10', rtt: '0.0 ms', loss: '0.0%', as: 'Private Enterprise DC', status: 'optimal' },
      { num: 1, name: 'Top-of-Rack Switch', host: 'NY-TOR-SW-01.mgmt', ip: '10.0.0.1', rtt: '0.8 ms', loss: '0.0%', as: 'LAN Gateway', status: 'optimal' },
      { num: 2, name: 'Core Distribution', host: 'NY-CORE-RTR-01.corp', ip: '172.16.0.1', rtt: '1.4 ms', loss: '0.0%', as: 'Core Backbone', status: 'optimal' },
      { num: 3, name: 'Perimeter Edge Firewall', host: 'NY-FW-01.transit', ip: '192.168.100.1', rtt: '2.1 ms', loss: '0.0%', as: 'Enterprise Border', status: 'optimal' },
      { num: 4, name: 'Tier-1 Carrier Transit', host: 'ae2.cr01.lga.lumen.net', ip: '4.69.130.1', rtt: '12.6 ms', loss: '0.0%', as: 'AS3356 Lumen Technologies', status: 'optimal' },
      { num: 5, name: 'Edge Interconnect IXP', host: 'ash-b1-link.telia.net', ip: '172.70.240.1', rtt: '18.4 ms', loss: '0.0%', as: 'AS13335 Cloudflare / Edge IXP', status: 'optimal' },
      { num: 6, name: 'Target Cloud Endpoint', host: currentSvc.name, ip: currentSvc.ip, rtt: '22.8 ms', loss: '0.0%', as: currentSvc.as, status: 'optimal' }
    ];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0070e0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🌐</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine NetPath &trade; - Hop-by-Hop Visual Network Path Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">TraceTCP / MTR Hybrid Continuous Latency & Packet Loss Profiler (RFC 1393)</div>
            </div>
          </div>
          <button id="close-netpath-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Controls Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 14px; font-size: 12px;">
            <div>
              <span style="color: #64748b; font-weight: 600;">Source Probe:</span>
              <strong style="color: #0f172a; margin-left: 4px;">${probeName}</strong>
            </div>
            <span style="color: #cbd5e1;">|</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #64748b; font-weight: 600;">Destination Service:</span>
              <select id="opm-netpath-svc-select" style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #0f172a; background: #fff;">
                ${services.map(s => `<option value="${s.id}" ${s.id === currentSvc.id ? 'selected' : ''}>${s.name} (${s.ip}:${s.port})</option>`).join('')}
              </select>
            </div>
            <span style="color: #cbd5e1;">|</span>
            <div>
              <span style="color: #64748b; font-weight: 600;">End-to-End Latency:</span>
              <strong style="color: #16a34a; margin-left: 4px;">22.8 ms</strong>
            </div>
            <div>
              <span style="color: #64748b; font-weight: 600;">Total Packet Loss:</span>
              <strong style="color: #16a34a; margin-left: 4px;">0.00%</strong>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="opm-netpath-run-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              ▶ Run Live TraceTCP Poll
            </button>
            <button id="opm-netpath-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Export CSV
            </button>
          </div>
        </div>

        <!-- Body Canvas -->
        <div style="padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- Hop-by-Hop Visual Pipeline Flow -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <span>End-to-End Hop-by-Hop Node Telemetry (7 Hops Discovered)</span>
              <span style="color: #16a34a; font-size: 11px; font-weight: 700;">● All Hops Responsive</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; position: relative; padding: 10px 0;">
              ${hops.map((hp, idx) => `
                <div style="display: flex; flex-direction: column; align-items: center; width: 130px; text-align: center; position: relative; z-index: 2;">
                  <div id="opm-hop-bubble-${hp.num}" style="width: 38px; height: 38px; border-radius: 50%; background: #ffffff; border: 2px solid #16a34a; color: #16a34a; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.06); transition: all 0.3s;">
                    ${hp.num === 0 ? 'SRC' : hp.num === hops.length - 1 ? 'DST' : hp.num}
                  </div>
                  <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 125px;" title="${hp.name}">
                    ${hp.name}
                  </div>
                  <div style="font-family: monospace; font-size: 10px; color: #0284c7; margin-top: 2px;">
                    ${hp.ip}
                  </div>
                  <div style="margin-top: 4px; font-size: 11px; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 1px 6px; border-radius: 3px; border: 1px solid #bbf7d0;">
                    ${hp.rtt}
                  </div>
                  <div style="font-size: 9px; color: #64748b; margin-top: 3px; max-width: 120px; line-height: 1.2;">
                    ${hp.as}
                  </div>
                </div>

                ${idx < hops.length - 1 ? `
                  <div style="flex: 1; height: 2px; background: #cbd5e1; position: relative; margin: -42px -6px 0 -6px; z-index: 1;">
                    <div id="opm-hop-link-${hp.num}" style="width: 100%; height: 100%; background: #16a34a; transition: all 0.4s;"></div>
                    <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; color: #64748b; background: #ffffff; padding: 0 4px; border-radius: 2px;">
                      +${(parseFloat(hops[idx+1].rtt) - parseFloat(hp.rtt)).toFixed(1)}ms
                    </div>
                  </div>
                ` : ''}
              `).join('')}
            </div>
          </div>

          <!-- Hop Details Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f8fafc; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0;">
              Hop-by-Hop Latency, Loss & Autonomous System (AS) Breakdown
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #fafbfc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-weight: 700;">
                  <th style="padding: 8px 12px;">Hop #</th>
                  <th style="padding: 8px 12px;">Device / Hostname</th>
                  <th style="padding: 8px 12px;">IP Address</th>
                  <th style="padding: 8px 12px;">Transit AS / Provider</th>
                  <th style="padding: 8px 12px;">RTT (ms)</th>
                  <th style="padding: 8px 12px;">Packet Loss</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${hops.map(hp => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-weight: 700; color: #475569;">${hp.num}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">${hp.host}</td>
                    <td style="padding: 8px 12px; font-family: monospace;">${hp.ip}</td>
                    <td style="padding: 8px 12px; color: #475569;">${hp.as}</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">${hp.rtt}</td>
                    <td style="padding: 8px 12px; color: #64748b;">${hp.loss}</td>
                    <td style="padding: 8px 12px;">
                      <span style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 9px; padding: 2px 6px; border-radius: 2px;">ONLINE</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Trace Output Terminal -->
          <div style="background: #0f172a; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #38bdf8;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 700; color: #94a3b8;">NETPATH CONTINUOUS MTR PROBE OUTPUT</span>
              <span style="color: #16a34a; font-size: 10px;">● Poller Active (Interval: 120s)</span>
            </div>
            <div id="opm-netpath-term-logs" style="line-height: 1.6; color: #cbd5e1; max-height: 100px; overflow-y: auto;">
              <div>[00:00:01] TraceTCP initiating sync from New York Data Center (10.0.0.10) to ${currentSvc.name} (${currentSvc.ip}:${currentSvc.port})...</div>
              <div>[00:00:02] Hop 1 (10.0.0.1) answered in 0.82ms. SYN-ACK verified.</div>
              <div>[00:00:03] Hop 4 (4.69.130.1 AS3356 Lumen) transit latency nominal at 12.64ms. Jitter: 0.3ms.</div>
              <div>[00:00:04] Hop 6 (${currentSvc.ip} ${currentSvc.as}) answered on port ${currentSvc.port}. Total RTT: 22.8ms. Packet loss: 0.00%.</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine NetPath &bull; OpManager Central GA Build 129203</span>
          <button id="close-netpath-btn-footer" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close NetPath
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('close-netpath-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-netpath-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const svcSelect = document.getElementById('opm-netpath-svc-select');
    if (svcSelect) {
      svcSelect.onchange = (e) => {
        showNetPathModal(sourceProbe, e.target.value);
      };
    }

    const runBtn = document.getElementById('opm-netpath-run-btn');
    if (runBtn) {
      runBtn.onclick = () => {
        runBtn.disabled = true;
        runBtn.innerHTML = '⚡ Polling Hops...';
        const term = document.getElementById('opm-netpath-term-logs');
        if (term) {
          term.innerHTML += `<div style="color: #49bd80;">[${new Date().toLocaleTimeString()}] Triggering manual TraceTCP poll across 7 hops...</div>`;
        }
        setTimeout(() => {
          if (term) {
            term.innerHTML += `<div style="color: #86efac;">[${new Date().toLocaleTimeString()}] ✔ All 7 hops verified! Nominal path latency: 22.4ms (Δ -0.4ms). 0% loss.</div>`;
            term.scrollTop = term.scrollHeight;
          }
          runBtn.disabled = false;
          runBtn.innerHTML = '▶ Run Live TraceTCP Poll';
          showToast('NetPath TraceTCP poll completed successfully across 7 hops.');
        }, 1200);
      };
    }

    const exportBtn = document.getElementById('opm-netpath-export-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        showToast('Exported NetPath telemetry to CSV successfully.');
      };
    }
  }

  // -------------------------------------------------------------
  // MODAL: ManageEngine Hardware Health & Sensor Telemetry (IPMI/iDRAC)
  // -------------------------------------------------------------
  function showHardwareSensorsModal(targetServer) {
    let modal = document.getElementById('opm-hardware-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-hardware-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10006; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const srv = targetServer || (state.devices.find(d => d.type === 'Windows' || d.type === 'Linux') || state.devices[0]);

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1040px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🌡️</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine Hardware Health &amp; Sensor Telemetry Inspector</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">IPMI 2.0 / DMTF Redfish / Dell iDRAC9 / HPE iLO5 Sensor Poller</div>
            </div>
          </div>
          <button id="close-hw-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Server Identity Banner -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 16px; font-size: 12px;">
            <div>
              <span style="color: #64748b; font-weight: 600;">Server Node:</span>
              <strong style="color: #0070e0; font-size: 13px; margin-left: 4px;">${srv.name}</strong>
            </div>
            <span style="color: #cbd5e1;">|</span>
            <div>
              <span style="color: #64748b; font-weight: 600;">Model:</span>
              <span style="color: #1e293b; margin-left: 4px; font-weight: 600;">Dell PowerEdge R750 (2x Intel Xeon Gold 6348)</span>
            </div>
            <span style="color: #cbd5e1;">|</span>
            <div>
              <span style="color: #64748b; font-weight: 600;">BMC / iDRAC IP:</span>
              <span style="font-family: monospace; color: #0284c7; margin-left: 4px;">10.0.1.200 (iDRAC9 Enterprise v6.10.30)</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; border: 1px solid #86efac;">
              ● ALL SENSORS HEALTHY
            </span>
            <button id="opm-hw-poll-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              ⚡ Re-Poll IPMI
            </button>
          </div>
        </div>

        <!-- 4-Quadrant Sensor Telemetry Grid -->
        <div style="padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            
            <!-- Quadrant 1: Power Supplies (PSUs) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                  <span>⚡</span> Power Supply Units (2x 750W Titanium Redundant)
                </span>
                <span style="font-size: 10px; background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 2px;">REDUNDANT OK</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 11px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">PSU 1 (Primary Active)</div>
                    <div style="color: #64748b; font-size: 10px;">Input: 120.4V AC &bull; Current: 1.42A &bull; Output: 171.0W</div>
                  </div>
                  <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 2px;">ACTIVE 🟢</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">PSU 2 (Secondary Standby)</div>
                    <div style="color: #64748b; font-size: 10px;">Input: 120.1V AC &bull; Current: 0.12A &bull; Output: 14.4W</div>
                  </div>
                  <span style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 2px 6px; border-radius: 2px;">HOT STANDBY 🔵</span>
                </div>
              </div>
            </div>

            <!-- Quadrant 2: Chassis Cooling Fans (6x PWM) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                  <span>🌀</span> Chassis Cooling Fans (6x Redundant PWM)
                </span>
                <span style="font-size: 10px; color: #16a34a; font-weight: 700;">Average: 4,838 RPM</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px;">
                ${[
                  { name: 'Fan 1 (Inlet)', rpm: '4,800 RPM' },
                  { name: 'Fan 2 (Inlet)', rpm: '4,860 RPM' },
                  { name: 'Fan 3 (CPU 1)', rpm: '4,920 RPM' },
                  { name: 'Fan 4 (CPU 2)', rpm: '4,810 RPM' },
                  { name: 'Fan 5 (PCIe)', rpm: '4,790 RPM' },
                  { name: 'Fan 6 (Power)', rpm: '4,850 RPM' }
                ].map(f => `
                  <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; text-align: center;">
                    <div style="font-size: 10px; color: #64748b;">${f.name}</div>
                    <div style="font-size: 12px; font-weight: 800; color: #16a34a; margin-top: 2px;">${f.rpm}</div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            
            <!-- Quadrant 3: Thermal Temperature Probes -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                  <span>🌡️</span> Thermal Temperature Sensors
                </span>
                <span style="font-size: 10px; color: #16a34a; font-weight: 700;">Within Normal Thresholds</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
                ${[
                  { name: 'Processor 1 Die (CPU 1)', temp: '41.5 °C', limit: 'Max 82 °C', pct: '50%' },
                  { name: 'Processor 2 Die (CPU 2)', temp: '43.8 °C', limit: 'Max 82 °C', pct: '53%' },
                  { name: 'System Board Inlet Air', temp: '23.5 °C', limit: 'Max 42 °C', pct: '40%' },
                  { name: 'Exhaust Air Sensor', temp: '31.8 °C', limit: 'Max 55 °C', pct: '48%' },
                  { name: 'Memory Ambient Zone', temp: '34.2 °C', limit: 'Max 65 °C', pct: '45%' }
                ].map(t => `
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                      <span style="color: #334155; font-weight: 600;">${t.name}</span>
                      <span style="font-weight: 700; color: #16a34a;">${t.temp} <span style="font-size: 9px; color: #94a3b8; font-weight: normal;">(${t.limit})</span></span>
                    </div>
                    <div style="height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${t.pct}; height: 100%; background: #16a34a; border-radius: 3px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Quadrant 4: Voltage Rails & RAID Storage Enclosure -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                  <span>💾</span> Voltage Rails &amp; Physical Disk Enclosure
                </span>
                <span style="font-size: 10px; color: #0284c7; font-weight: 700;">PERC H745 RAID 6</span>
              </div>
              
              <!-- Voltages -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; font-size: 10px; text-align: center;">
                <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 4px;">
                  <div style="color: #64748b;">+12.0V Rail</div>
                  <div style="font-weight: 800; color: #16a34a;">12.06 V</div>
                </div>
                <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 4px;">
                  <div style="color: #64748b;">+5.0V Rail</div>
                  <div style="font-weight: 800; color: #16a34a;">5.02 V</div>
                </div>
                <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 4px;">
                  <div style="color: #64748b;">+3.3V Rail</div>
                  <div style="font-weight: 800; color: #16a34a;">3.31 V</div>
                </div>
                <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 3px; padding: 4px;">
                  <div style="color: #64748b;">CMOS Battery</div>
                  <div style="font-weight: 800; color: #16a34a;">3.14 V (Good)</div>
                </div>
              </div>

              <!-- Drives -->
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">8x SAS 10K RPM 1.8TB Drives in Hardware RAID 6:</div>
              <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px;">
                ${[0,1,2,3,4,5,6,7].map(idx => `
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 3px; padding: 4px 2px; text-align: center; font-size: 9px;">
                    <div style="color: #166534; font-weight: 700;">Disk ${idx}</div>
                    <div style="color: #16a34a; font-size: 8px;">OK 🟢</div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">IPMI Sensor Poller &bull; OpManager Central Hardware Health Subsystem</span>
          <button id="close-hw-btn-footer" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close Inspector
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-hw-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-hw-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const pollBtn = document.getElementById('opm-hw-poll-btn');
    if (pollBtn) {
      pollBtn.onclick = () => {
        pollBtn.disabled = true;
        pollBtn.innerHTML = '⚡ Polling BMC...';
        setTimeout(() => {
          pollBtn.disabled = false;
          pollBtn.innerHTML = '⚡ Re-Poll IPMI';
          showToast(`Successfully refreshed IPMI telemetry for ${srv.name}. All 24 hardware sensors normal.`);
        }, 800);
      };
    }
  }

  // -------------------------------------------------------------
  // MODAL: ManageEngine Zia AI Root Cause Analysis (RCA) & Narrative
  // -------------------------------------------------------------
  function showZiaRcaModal(alarm) {
    let modal = document.getElementById('opm-zia-rca-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-zia-rca-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10006; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const alm = alarm || state.alarms[0] || {
      id: 'ALM-101',
      device: 'DXB-CORE-SW-01',
      severity: 'Critical',
      message: 'Interface TenGigabitEthernet1/0/48 down',
      timestamp: '10:41:02 UTC'
    };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 920px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #818cf8;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🧠</span>
            <div>
              <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine Zia AI &trade; Root Cause Analysis (RCA) &amp; Incident Correlation</div>
              <div style="font-size: 11px; color: #c7d2fe; margin-top: 1px;">Machine Learning Causality Inference &bull; Event Deduplication &bull; Automated Remediation</div>
            </div>
          </div>
          <button id="close-zia-rca-btn" style="background: transparent; border: none; color: #c7d2fe; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#c7d2fe'">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- Primary Incident Card -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: #dc2626; color: #fff; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px;">${alm.severity}</span>
                <span style="font-weight: 800; color: #0f172a; font-size: 13px;">${alm.device}: ${alm.message}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Alarm ID: <strong style="font-family: monospace;">${alm.id}</strong> &bull; First Event: <strong>${alm.timestamp || 'Today 10:41 UTC'}</strong> &bull; Category: <strong>Network Interface / Routing</strong>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #4338ca; font-weight: 700; text-transform: uppercase;">Zia ML Confidence</div>
              <div style="font-size: 20px; font-weight: 900; color: #4f46e5;">98.8%</div>
            </div>
          </div>

          <!-- Correlated Multi-Event Causality Timeline -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 12px;">
              Multi-Event Causality Graph (4 Correlated Incidents Detected Within 60 Seconds)
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
              ${[
                { time: '10:41:02 UTC', title: 'NCM Configuration Change Committed', desc: 'admin executed "interface TenGigabitEthernet1/0/48 shutdown" via SSH terminal.', badge: 'TRIGGER', color: '#dc2626' },
                { time: '10:41:08 UTC', title: 'BGP Neighbor Hold Timer Expired', desc: 'BGP Peering 10.100.1.1 (AS65001) transitioned from ESTABLISHED to IDLE state.', badge: 'CASCADE', color: '#ea580c' },
                { time: '10:41:15 UTC', title: 'Inbound WAN Link Saturation & Packet Drop', desc: 'Failover traffic shifted to secondary 1Gbps backup trunk, causing 98% link congestion.', badge: 'IMPACT', color: '#d97706' },
                { time: '10:41:22 UTC', title: '14 Downstream Edge Switch Alarms Cascaded', desc: 'Access switches lost primary gateway reachability. Suppressed by Zia AI deduplication.', badge: 'DEDUPLICATED', color: '#4f46e5' }
              ].map(ev => `
                <div style="display: flex; gap: 12px; align-items: flex-start; padding: 8px 12px; background: #fafbfc; border: 1px solid #e2e8f0; border-left: 3px solid ${ev.color}; border-radius: 4px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #64748b; white-space: nowrap; margin-top: 1px;">${ev.time}</span>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${ev.title}</span>
                      <span style="font-size: 9px; font-weight: 800; background: ${ev.color}15; color: ${ev.color}; padding: 1px 5px; border-radius: 2px;">${ev.badge}</span>
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${ev.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Natural Language Narrative -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px;">
            <div style="font-size: 12px; font-weight: 800; color: #312e81; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span>🤖</span> Zia AI Natural Language Incident Summary:
            </div>
            <div style="font-size: 12px; color: #334155; line-height: 1.6;">
              "Zia AI Analysis confirms the primary root cause is an unauthorized configuration commit on <strong>DXB-CORE-SW-01</strong> at 10:41:02 UTC that disabled the TenGigabitEthernet1/0/48 uplink interface. This directly severed the primary BGP peering session, causing secondary circuit congestion and 14 cascaded downtime alerts. Executing an immediate NCM baseline rollback will restore connectivity in under 15 seconds."
            </div>
          </div>

          <!-- Remediation Actions -->
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; background: #ffffff;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">
              Automated Remediation Actions Recommended by Zia AI:
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button id="opm-zia-rollback-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                ⚡ Execute NCM Rollback (no shutdown)
              </button>
              <button id="opm-zia-ticket-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Log P1 Incident in ServiceDesk Plus
              </button>
              <button id="opm-zia-mute-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #475569; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Mute 14 Downstream Alarms
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine Zia AI Engine &bull; Incident Correlation Module</span>
          <button id="close-zia-rca-btn-footer" style="background: #4f46e5; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close Analysis
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-zia-rca-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-zia-rca-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const rollbackBtn = document.getElementById('opm-zia-rollback-btn');
    if (rollbackBtn) {
      rollbackBtn.onclick = () => {
        rollbackBtn.disabled = true;
        rollbackBtn.innerHTML = '⚡ Rolling back configuration via SSH...';
        setTimeout(() => {
          state.configDriftFixed = true;
          rollbackBtn.innerHTML = '✔ Baseline Restored Successfully';
          showToast('NCM Rollback completed on DXB-CORE-SW-01: interface TenGigabitEthernet1/0/48 is now UP. Alarm cleared.');
          // Remove or downgrade alarm
          const found = state.alarms.find(a => a.id === alm.id);
          if (found) {
            found.severity = 'Clear';
            found.message += ' (Resolved via Zia AI Rollback)';
          }
          if (state.currentTab === 'alarms') {
            renderAlarmsView();
          }
        }, 1200);
      };
    }

    const ticketBtn = document.getElementById('opm-zia-ticket-btn');
    if (ticketBtn) {
      ticketBtn.onclick = () => {
        if (typeof showServiceDeskIncidentModal === 'function') {
          modal.style.display = 'none';
          showServiceDeskIncidentModal(alm);
        }
      };
    }

    const muteBtn = document.getElementById('opm-zia-mute-btn');
    if (muteBtn) {
      muteBtn.onclick = () => {
        showToast('Suppressed 14 cascaded downstream alarms under Zia AI Incident Correlation.');
        modal.style.display = 'none';
      };
    }
  }



  /* ==========================================================================
     BATCH 4 ENTERPRISE FEATURES: BGP, SD-WAN, DPI NBAR2, NDR THREAT FORENSICS
     ========================================================================== */

  // 1. ManageEngine BGP-4 Routing & Autonomous System (AS) Topology Modal
  function showBgpMonitoringModal(router) {
    let modal = document.getElementById('opm-bgp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-bgp-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10007; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const rtrName = router ? router.name : 'DXB-WAN-RTR-01';
    const rtrIp = router ? router.ip : '10.0.0.1';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8b5cf6;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📡</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; BGP-4 Routing & Autonomous System (AS) Topology</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">RFC 4271 BGP-4 &bull; RFC 4893 4-Octet AS &bull; Router: ${rtrName} (${rtrIp}) &bull; Local ASN: <strong>AS65001</strong></div>
            </div>
          </div>
          <button id="close-bgp-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Metric Badges Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Local Autonomous System</div>
            <div style="font-size: 16px; font-weight: 800; color: #6d28d9; margin-top: 2px;">AS65001 (Private DC)</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">BGP Daemon: RUNNING 🟢</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">BGP Neighbors (Peers)</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">4 Configured / 3 Up</div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 2px;">3 Established &bull; 1 Active (Syncing)</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Global RIB Routing Table</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">845,190 Prefixes</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">FIB HW Memory: 64% used</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">BGP Updates (Rx / Tx)</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">14,290 / 8,940 msgs</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">Flap Damping: Normal (0 damp)</div>
          </div>
        </div>

        <!-- Main Body -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- SVG Autonomous System Topology Map -->
          <div style="background: #0f172a; border-radius: 6px; padding: 16px; border: 1px solid #334155; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px;">BGP Autonomous System Interconnect Graph</span>
              <span style="font-size: 11px; color: #94a3b8;">Real-Time Peering Paths &bull; RFC 1771</span>
            </div>
            <svg viewBox="0 0 1000 180" style="width: 100%; height: 180px; display: block;">
              <!-- Connecting Lines -->
              <line x1="500" y1="90" x2="160" y2="45" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4 2" />
              <line x1="500" y1="90" x2="160" y2="135" stroke="#38bdf8" stroke-width="2.5" />
              <line x1="500" y1="90" x2="840" y2="45" stroke="#06b6d4" stroke-width="2.5" />
              <line x1="500" y1="90" x2="840" y2="135" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 5" />

              <!-- Central Node (AS65001) -->
              <circle cx="500" cy="90" r="38" fill="#6d28d9" stroke="#c4b5fd" stroke-width="3" />
              <text x="500" y="86" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="800">AS65001</text>
              <text x="500" y="102" text-anchor="middle" fill="#ddd6fe" font-size="10">Local Edge RTR</text>

              <!-- Node 1: AS3356 Lumen -->
              <circle cx="160" cy="45" r="30" fill="#065f46" stroke="#34d399" stroke-width="2.5" />
              <text x="160" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS3356</text>
              <text x="160" y="55" text-anchor="middle" fill="#a7f3d0" font-size="9">Lumen Transit</text>
              <rect x="250" y="50" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="292" y="63" text-anchor="middle" fill="#34d399" font-size="10" font-weight="600">845k pfx | 12ms</text>

              <!-- Node 2: AS13335 Cloudflare -->
              <circle cx="160" cy="135" r="30" fill="#075985" stroke="#38bdf8" stroke-width="2.5" />
              <text x="160" y="132" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS13335</text>
              <text x="160" y="145" text-anchor="middle" fill="#bae6fd" font-size="9">Cloudflare IXP</text>
              <rect x="250" y="105" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="292" y="118" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="600">42k pfx | 4.1ms</text>

              <!-- Node 3: AS15169 Google Peering -->
              <circle cx="840" cy="45" r="30" fill="#155e75" stroke="#22d3ee" stroke-width="2.5" />
              <text x="840" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS15169</text>
              <text x="840" y="55" text-anchor="middle" fill="#a5f3fc" font-size="9">Google Direct</text>
              <rect x="660" y="50" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="702" y="63" text-anchor="middle" fill="#22d3ee" font-size="10" font-weight="600">12k pfx | 8.6ms</text>

              <!-- Node 4: AS64512 Backup MPLS -->
              <circle cx="840" cy="135" r="30" fill="#78350f" stroke="#fbbf24" stroke-width="2.5" />
              <text x="840" y="132" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS64512</text>
              <text x="840" y="145" text-anchor="middle" fill="#fef08a" font-size="9">Backup MPLS</text>
              <rect x="660" y="105" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="702" y="118" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="600">Active (Sync)</text>
            </svg>
          </div>

          <!-- BGP Neighbors Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">BGP Neighbor Peer Summary (Cisco &bull; Juniper BGP MIB)</span>
              <button id="opm-bgp-refresh-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #475569; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                ↻ Poll Peers Now
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Neighbor IP</th>
                  <th style="padding: 10px 12px;">Remote AS</th>
                  <th style="padding: 10px 12px;">Peer State</th>
                  <th style="padding: 10px 12px;">Admin</th>
                  <th style="padding: 10px 12px;">Flaps</th>
                  <th style="padding: 10px 12px;">Established Uptime</th>
                  <th style="padding: 10px 12px;">Prefixes (Rx / Tx)</th>
                  <th style="padding: 10px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="opm-bgp-table-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">198.51.100.1</td>
                  <td style="padding: 10px 12px;"><strong>AS3356</strong> <span style="color: #64748b;">(Lumen Tier-1 Transit)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">0</td>
                  <td style="padding: 10px 12px; color: #475569;">48d 14h 22m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">845,190 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="198.51.100.1" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">203.0.113.5</td>
                  <td style="padding: 10px 12px;"><strong>AS13335</strong> <span style="color: #64748b;">(Cloudflare CDN IXP)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">1</td>
                  <td style="padding: 10px 12px; color: #475569;">14d 06h 11m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">42,800 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="203.0.113.5" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">198.18.0.22</td>
                  <td style="padding: 10px 12px;"><strong>AS15169</strong> <span style="color: #64748b;">(Google Peering Direct)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">0</td>
                  <td style="padding: 10px 12px; color: #475569;">92d 18h 45m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">12,400 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="198.18.0.22" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="background: #fffbeb;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">192.0.2.78</td>
                  <td style="padding: 10px 12px;"><strong>AS64512</strong> <span style="color: #64748b;">(Backup Telco MPLS)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Active (Sync)</span></td>
                  <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">Connecting</td>
                  <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">5</td>
                  <td style="padding: 10px 12px; color: #475569;">0m 42s</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600; color: #64748b;">0 / 0</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button id="opm-bgp-force-reset-btn" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ⚡ Reset Peer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CLI Console Simulation -->
          <div id="opm-bgp-terminal" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central BGP Diagnostic Terminal</div>
            <div>[BGP] Router DXB-WAN-RTR-01 BGP process ID 100 initialized.</div>
            <div>[BGP] RFC 2918 Route Refresh capability negotiated on all 3 established peers.</div>
            <div id="opm-bgp-live-log" style="color: #34d399;">✔ System steady state: Autonomous System AS65001 fully converged.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; BGP Peer Monitoring Engine (RFC 4271)</span>
          <button id="close-bgp-modal-btn-footer" style="background: #6d28d9; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close BGP View
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-bgp-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-bgp-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const liveLog = document.getElementById('opm-bgp-live-log');
    modal.querySelectorAll('.opm-bgp-softclear-btn').forEach(btn => {
      btn.onclick = () => {
        const peer = btn.getAttribute('data-peer');
        btn.disabled = true;
        btn.innerHTML = 'Executing...';
        if (liveLog) {
          liveLog.innerHTML = `<span style="color: #fbbf24;">[CMD] clear ip bgp ${peer} soft in</span><br><span style="color: #38bdf8;">[BGP] Sent ROUTE-REFRESH request to neighbor ${peer}...</span>`;
        }
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = '✔ Done';
          if (liveLog) {
            liveLog.innerHTML += `<br><span style="color: #34d399;">✔ Neighbor ${peer} acknowledged refresh; 845,190 prefixes re-evaluated with 0 packet drop.</span>`;
          }
          showToast(`BGP Soft Inbound Refresh completed for neighbor ${peer}.`);
        }, 1000);
      };
    });

    const resetBtn = document.getElementById('opm-bgp-force-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        resetBtn.disabled = true;
        resetBtn.innerHTML = 'Resetting TCP...';
        if (liveLog) {
          liveLog.innerHTML = `<span style="color: #f87171;">[CMD] clear ip bgp 192.0.2.78 hard</span><br><span style="color: #fbbf24;">[BGP] Terminated TCP port 179 session with AS64512; sending SYN handshakes...</span>`;
        }
        setTimeout(() => {
          resetBtn.innerHTML = '✔ Connected';
          resetBtn.style.background = '#dcfce7';
          resetBtn.style.color = '#15803d';
          if (liveLog) {
            liveLog.innerHTML += `<br><span style="color: #34d399;">✔ TCP socket established. Received BGP OPEN message from AS64512. State: Established.</span>`;
          }
          showToast('BGP session with AS64512 successfully restored to Established state.');
        }, 1200);
      };
    }
  }


  // 2. Cisco & Multi-Vendor SD-WAN Performance Controller Modal
  function showSdwanPerformanceModal(sdwanDevice) {
    let modal = document.getElementById('opm-sdwan-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-sdwan-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10008; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const devName = sdwanDevice ? sdwanDevice.name : 'DXB-SDWAN-EDGE-01';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🚀</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; SD-WAN Fabric & BFD Tunnel Performance</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Cisco Catalyst SD-WAN (vManage 20.9.3) &bull; Edge Gateway: ${devName} &bull; BFD Polling Interval: 100ms</div>
            </div>
          </div>
          <button id="close-sdwan-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- 3 Transport Overlay Underlay Cards -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <!-- Transport 1: Biz-Internet -->
          <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #16a34a;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Biz-Internet (DIA Lumen)</span>
              <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ACTIVE 🟢</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">12.4 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">1.2 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">0.00%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 1 Gbps Symmetric</span>
              <strong style="color: #0f172a;">Utilization: 48%</strong>
            </div>
          </div>

          <!-- Transport 2: Private MPLS -->
          <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #0284c7;">
            <div style="display: space-between; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Private MPLS (AT&T AVPN)</span>
              <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ACTIVE 🟢</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">28.6 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">3.1 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">0.05%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 500 Mbps CIR</span>
              <strong style="color: #0f172a;">Utilization: 31%</strong>
            </div>
          </div>

          <!-- Transport 3: LTE 5G -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #64748b;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Cellular LTE (Verizon 5G)</span>
              <span style="background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">STANDBY 🔵</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">64.2 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">8.7 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">0.80%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 100 Mbps Metered</span>
              <strong style="color: #0f172a;">Utilization: 1% (Heartbeat)</strong>
            </div>
          </div>
        </div>

        <!-- Main Body: SLA Policies & Dynamic Application Steering -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- SLA Matrix Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Application SLA Classes & Dynamic Path Steering</span>
              <button id="opm-sdwan-simulate-brownout-btn" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                ⚡ Run Dynamic SLA Failover Test
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">SLA Profile</th>
                  <th style="padding: 10px 12px;">Target Thresholds</th>
                  <th style="padding: 10px 12px;">Current Transport</th>
                  <th style="padding: 10px 12px;">Live Metric</th>
                  <th style="padding: 10px 12px;">SLA Health</th>
                  <th style="padding: 10px 12px; text-align: right;">Policy Status</th>
                </tr>
              </thead>
              <tbody id="opm-sdwan-sla-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Voice SLA (G.711 / SIP)</td>
                  <td style="padding: 10px 12px; color: #475569;">Jitter &lt; 10ms, Loss &lt; 1%, Latency &lt; 150ms</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-voice" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet (Primary)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">MOS 4.41 (Excellent)</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Steered by Policy</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Microsoft 365 & SaaS</td>
                  <td style="padding: 10px 12px; color: #475569;">Latency &lt; 30ms, Zero Loss</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-m365" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet DIA</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">14.2 ms RTT</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Direct Cloud Breakout</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">ERP SAP S/4HANA Core</td>
                  <td style="padding: 10px 12px; color: #475569;">Latency &lt; 40ms, Jitter &lt; 5ms</td>
                  <td style="padding: 10px 12px;"><span style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Private MPLS (AVPN)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0284c7;">28.6 ms RTT</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">QoS EF Priority</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Zoom & Teams HD Video</td>
                  <td style="padding: 10px 12px; color: #475569;">Jitter &lt; 15ms, Loss &lt; 2%</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-video" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet (Primary)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">1.8 ms Jitter</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Steered by Policy</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BFD Echo & Dynamic Switch Log -->
          <div id="opm-sdwan-log-console" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
            <div style="color: #64748b;">// Cisco Catalyst SD-WAN BFD (Bidirectional Forwarding Detection) Daemon</div>
            <div>[BFD] Session 1042 (Biz-Internet): Echo interval 100ms, multiplier 3 &bull; State: UP</div>
            <div>[BFD] Session 1043 (MPLS AVPN): Echo interval 100ms, multiplier 3 &bull; State: UP</div>
            <div id="opm-sdwan-dynamic-msg" style="color: #34d399;">✔ Zero SLA violations in last 24 hours. Optimal application steering across all 3 WAN transports.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; SD-WAN Fabric Orchestration Engine</span>
          <button id="close-sdwan-modal-btn-footer" style="background: #10b981; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close SD-WAN Console
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-sdwan-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-sdwan-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const failoverBtn = document.getElementById('opm-sdwan-simulate-brownout-btn');
    const logConsole = document.getElementById('opm-sdwan-log-console');
    const dynamicMsg = document.getElementById('opm-sdwan-dynamic-msg');

    if (failoverBtn) {
      failoverBtn.onclick = () => {
        failoverBtn.disabled = true;
        failoverBtn.innerHTML = 'Testing Brownout...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = `<span style="color: #f87171;">[SLA-ALERT] Injected simulated 85ms latency spike & 4% packet drop on Biz-Internet (DIA)...</span>`;
        }
        setTimeout(() => {
          document.getElementById('sla-path-voice').innerHTML = 'Private MPLS (Failover ⚡)';
          document.getElementById('sla-path-voice').style.background = '#fef3c7';
          document.getElementById('sla-path-voice').style.color = '#b45309';

          document.getElementById('sla-path-video').innerHTML = 'Private MPLS (Failover ⚡)';
          document.getElementById('sla-path-video').style.background = '#fef3c7';
          document.getElementById('sla-path-video').style.color = '#b45309';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += `<br><span style="color: #38bdf8;">[vManage Dynamic Steering] Voice & HD Video re-routed from DIA to MPLS in 38ms!</span><br><span style="color: #34d399;">✔ Zero dropped VoIP calls. SLA Compliance restored to 100%.</span>`;
          }
          failoverBtn.innerHTML = '✔ Re-Route Verified';
          showToast('SD-WAN Dynamic Application Steering test passed: Voice & Video shifted to MPLS in 38ms.');
        }, 1100);
      };
    }
  }


  // 3. Deep Packet Inspection (DPI) & Cisco NBAR2 Application Classification Modal
  function showDpiTrafficModal(iface) {
    let modal = document.getElementById('opm-dpi-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-dpi-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10009; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const ifName = iface ? (iface.name || iface) : 'GigabitEthernet0/0/1 - WAN Gateway (10 Gbps)';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📊</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; Deep Packet Inspection (DPI) & Cisco NBAR2</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Layer 7 Deep Packet Flow Classification &bull; Interface: ${ifName} &bull; Sampling: Full Wire Rate</div>
            </div>
          </div>
          <button id="close-dpi-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Top Rate Gauges & Split Response Time Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Bandwidth Throughput Card -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">Aggregate Interface Throughput</span>
              <span style="font-size: 11px; color: #16a34a; font-weight: 700;">Capacity: 10 Gbps</span>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 10px;">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
                  <span>Inbound Traffic</span>
                  <strong style="color: #0f172a;">4.82 Gbps (48.2%)</strong>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: 48.2%; height: 100%; background: #0284c7;"></div>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
                  <span>Outbound Traffic</span>
                  <strong style="color: #0f172a;">1.94 Gbps (19.4%)</strong>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: 19.4%; height: 100%; background: #10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Split Response Time: NRT vs ART -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">Network Response Time (NRT) vs App Response Time (ART)</span>
              <span style="font-size: 11px; color: #64748b;">TCP Handshake Analyzer</span>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 10px;">
              <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 6px 10px; text-align: center;">
                <div style="font-size: 10px; color: #166534; font-weight: 600;">NRT (Network Latency)</div>
                <div style="font-size: 16px; font-weight: 800; color: #15803d; margin-top: 2px;">14.2 ms</div>
                <div style="font-size: 9px; color: #166534;">Optimal WAN propagation</div>
              </div>
              <div style="flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 10px; text-align: center;">
                <div style="font-size: 10px; color: #075985; font-weight: 600;">ART (Server Processing)</div>
                <div style="font-size: 16px; font-weight: 800; color: #0284c7; margin-top: 2px;">38.5 ms</div>
                <div style="font-size: 9px; color: #075985;">Fast HTTP execution</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Body: NBAR2 Table & Actions -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Cisco NBAR2 Layer 7 Applications & DSCP Markings</span>
              <button id="opm-dpi-enforce-scavenger-btn" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🛡️ Enforce DSCP Scavenger Policy on P2P
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Layer 7 Application</th>
                  <th style="padding: 10px 12px;">Protocol / Port</th>
                  <th style="padding: 10px 12px;">Bandwidth & Share</th>
                  <th style="padding: 10px 12px;">DSCP Tagging</th>
                  <th style="padding: 10px 12px;">QoS Classification</th>
                  <th style="padding: 10px 12px; text-align: right;">Risk Profile</th>
                </tr>
              </thead>
              <tbody id="opm-dpi-table-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Microsoft Teams / Zoom Audio-Video</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">UDP / RTP (3478-3481)</td>
                  <td style="padding: 10px 12px;"><strong>1.84 Gbps</strong> <span style="color: #64748b;">(38.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">EF (46)</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Expedited Forwarding</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Salesforce CRM / Workday SaaS</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / HTTPS (443)</td>
                  <td style="padding: 10px 12px;"><strong>1.12 Gbps</strong> <span style="color: #64748b;">(23.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">AF31 (26)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Assured Forwarding 3</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">AWS S3 / Azure Blob Storage</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / TLS (443)</td>
                  <td style="padding: 10px 12px;"><strong>780 Mbps</strong> <span style="color: #64748b;">(16.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">AF21 (18)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Bulk Data Forwarding</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">YouTube / Social Media Streaming</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">UDP / QUIC (443)</td>
                  <td style="padding: 10px 12px;"><strong>540 Mbps</strong> <span style="color: #64748b;">(11.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #f1f5f9; color: #475569; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">CS1 (8)</span></td>
                  <td style="padding: 10px 12px; color: #64748b; font-weight: 600;">Non-Critical Traffic</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #fef3c7; color: #b45309; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Medium</span></td>
                </tr>
                <tr id="dpi-row-p2p" style="background: #fff1f2;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #9f1239;">Unsanctioned BitTorrent / P2P Swarm</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #9f1239;">TCP / UDP (6881-6889)</td>
                  <td style="padding: 10px 12px;"><strong id="dpi-p2p-bw" style="color: #9f1239;">320 Mbps</strong> <span style="color: #9f1239;">(6.6%)</span></td>
                  <td style="padding: 10px 12px;"><span id="dpi-p2p-dscp" style="background: #fee2e2; color: #991b1b; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Best Effort (0)</span></td>
                  <td style="padding: 10px 12px; color: #9f1239; font-weight: 600;" id="dpi-p2p-qos">Unthrottled Bandwidth Hog</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">High Risk ⚠️</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">SSH / HTTPS Device Management</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / SSH (22)</td>
                  <td style="padding: 10px 12px;"><strong>220 Mbps</strong> <span style="color: #64748b;">(4.6%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">CS2 (16)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Network Management</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Policy Feed & QoS Terminal -->
          <div id="opm-dpi-policy-log" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 100px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central DPI Engine &bull; QoS Shaper</div>
            <div>[DPI] Deep packet state engine actively tracking 14,890 simultaneous L7 sessions.</div>
            <div id="opm-dpi-dynamic-msg" style="color: #34d399;">✔ Wire-speed classification active. Zero packet loss on EF (46) realtime queue.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Cisco NBAR2 Deep Packet Flow Engine</span>
          <button id="close-dpi-modal-btn-footer" style="background: #0284c7; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close DPI View
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-dpi-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-dpi-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const enforceBtn = document.getElementById('opm-dpi-enforce-scavenger-btn');
    const dynamicMsg = document.getElementById('opm-dpi-dynamic-msg');

    if (enforceBtn) {
      enforceBtn.onclick = () => {
        enforceBtn.disabled = true;
        enforceBtn.innerHTML = 'Applying DSCP Scavenger...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = `<span style="color: #fbbf24;">[QOS-CLI] class-map match-all P2P-TRAFFIC -> police cir 10000000 pir 15000000 conform-action set-dscp-transmit cs1 exceed-action drop...</span>`;
        }
        setTimeout(() => {
          document.getElementById('dpi-p2p-bw').innerHTML = '10 Mbps';
          document.getElementById('dpi-p2p-dscp').innerHTML = 'CS1 (Scavenger 8)';
          document.getElementById('dpi-p2p-dscp').style.background = '#e2e8f0';
          document.getElementById('dpi-p2p-dscp').style.color = '#475569';
          document.getElementById('dpi-p2p-qos').innerHTML = 'Policed to 10 Mbps (Scavenger)';
          document.getElementById('dpi-p2p-qos').style.color = '#15803d';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += `<br><span style="color: #34d399;">✔ DSCP Scavenger applied. Unsanctioned P2P bandwidth clamped from 320 Mbps down to 10 Mbps!</span>`;
          }
          enforceBtn.innerHTML = '✔ Scavenger Policy Active';
          enforceBtn.style.background = '#dcfce7';
          enforceBtn.style.color = '#15803d';
          showToast('DSCP Scavenger Policy enforced: P2P throttled to 10 Mbps on WAN uplink.');
        }, 1100);
      };
    }
  }


  // 4. Network Detection & Response (NDR) & Security Threat Forensics Modal
  function showNdrForensicsModal(threatSource) {
    let modal = document.getElementById('opm-ndr-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ndr-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10010; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; Network Detection & Response (NDR) & Threat Forensics</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">TAXII 2.1 Threat Intel Server (ndr.threatintel.default.server) &bull; STIX Feed: Active (1.8M Indicators)</div>
            </div>
          </div>
          <button id="close-ndr-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Threat Score & Threat Summary Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: 280px 1fr; gap: 16px; align-items: center;">
          <!-- Threat Score Gauge Card -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dc2626; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              89
              <span style="font-size: 8px; font-weight: 600; text-transform: uppercase;">SCORE</span>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 800; color: #991b1b; text-transform: uppercase;">High Risk Incident Active</div>
              <div style="font-size: 11px; color: #b91c1c; margin-top: 2px;">4 Critical Anomalies detected in last 30 minutes</div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="opm-ndr-push-acl-btn" style="background: #dc2626; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
              🔒 Push Immediate Firewall ACL Blacklist
            </button>
            <button id="opm-ndr-quarantine-btn" style="background: #ea580c; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              🛑 Quarantine Host via 802.1X NAC
            </button>
            <button id="opm-ndr-export-stix-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              📥 Export STIX 2.1 PCAP
            </button>
          </div>
        </div>

        <!-- Main Body: Threat Matrix Table -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Active Behavioral Anomaly Detections & STIX Indicators</span>
              <span style="font-size: 11px; color: #64748b;">Feed: TAXII 2.1 Threat Intel Server &bull; Updated 8 mins ago</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Threat Classification</th>
                  <th style="padding: 10px 12px;">Attacker Source IP</th>
                  <th style="padding: 10px 12px;">Target Host / Asset</th>
                  <th style="padding: 10px 12px;">MITRE ATT&CK ID</th>
                  <th style="padding: 10px 12px;">Severity Score</th>
                  <th style="padding: 10px 12px; text-align: right;">Mitigation State</th>
                </tr>
              </thead>
              <tbody id="opm-ndr-threat-table-body">
                <tr id="ndr-row-1" style="border-bottom: 1px solid #f1f5f9; background: #fff5f5;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #991b1b;">Horizontal TCP SYN Port Scan</div>
                    <div style="font-size: 10px; color: #64748b;">Probed 1,024 TCP ports across /24 subnet</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    198.51.100.89 <span style="font-size: 10px; color: #dc2626; font-weight: 600;">(Tor Exit Node NL)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">10.0.1.0/24 (DMZ)</td>
                  <td style="padding: 10px 12px;"><span style="background: #fee2e2; color: #991b1b; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1046 Discovery</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dc2626; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 94</span></td>
                  <td id="ndr-status-1" style="padding: 10px 12px; text-align: right; color: #dc2626; font-weight: 700;">Block Recommended</td>
                </tr>
                <tr id="ndr-row-2" style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #9a3412;">DNS Data Exfiltration via TXT Tunneling</div>
                    <div style="font-size: 10px; color: #64748b;">High-entropy Base64 queries (48.2 MB exfiltrated)</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    10.0.1.44 <span style="font-size: 10px; color: #ea580c; font-weight: 600;">(DXB-APP-04)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">ns1.tunnel-c2.top</td>
                  <td style="padding: 10px 12px;"><span style="background: #ffedd5; color: #9a3412; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1071.004 C2</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #ea580c; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 86</span></td>
                  <td id="ndr-status-2" style="padding: 10px 12px; text-align: right; color: #ea580c; font-weight: 700;">Host Active</td>
                </tr>
                <tr id="ndr-row-3" style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #9a3412;">Automated SSH Dictionary Brute Force</div>
                    <div style="font-size: 10px; color: #64748b;">540 failed authentications in 60 seconds</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    203.0.113.190 <span style="font-size: 10px; color: #dc2626; font-weight: 600;">(Mirai C2 Botnet)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">10.0.1.15 (DXB-PROD-DB)</td>
                  <td style="padding: 10px 12px;"><span style="background: #ffedd5; color: #9a3412; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1110 Brute Force</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #ea580c; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 82</span></td>
                  <td id="ndr-status-3" style="padding: 10px 12px; text-align: right; color: #dc2626; font-weight: 700;">Block Recommended</td>
                </tr>
                <tr id="ndr-row-4">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #475569;">Suspicious Outbound SMB Lateral Connection</div>
                    <div style="font-size: 10px; color: #64748b;">TCP port 445 direct packet to untrusted public IP</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    10.0.1.108 <span style="font-size: 10px; color: #64748b; font-weight: 600;">(DXB-STAGE-02)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">198.18.44.12:445</td>
                  <td style="padding: 10px 12px;"><span style="background: #f1f5f9; color: #475569; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1021.002 SMB</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #94a3b8; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 65</span></td>
                  <td id="ndr-status-4" style="padding: 10px 12px; text-align: right; color: #64748b; font-weight: 600;">Monitored</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Forensic Security Console -->
          <div id="opm-ndr-console" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 100px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central NDR Threat Intelligence Engine</div>
            <div>[TAXII] Synced 1,840,290 reputation signatures from global TAXII 2.1 intelligence feeds.</div>
            <div id="opm-ndr-dynamic-msg" style="color: #f87171;">⚠️ Alert: 2 C2 botnet communication attempts flagged. Automated perimeter ACL push ready.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Network Detection & Response (NDR) Engine</span>
          <button id="close-ndr-modal-btn-footer" style="background: #dc2626; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close NDR View
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-ndr-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-ndr-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const pushAclBtn = document.getElementById('opm-ndr-push-acl-btn');
    const quarantineBtn = document.getElementById('opm-ndr-quarantine-btn');
    const exportStixBtn = document.getElementById('opm-ndr-export-stix-btn');
    const dynamicMsg = document.getElementById('opm-ndr-dynamic-msg');

    if (pushAclBtn) {
      pushAclBtn.onclick = () => {
        pushAclBtn.disabled = true;
        pushAclBtn.innerHTML = 'Pushing ACL Rules...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = `<span style="color: #fbbf24;">[FW-CLI] access-list 101 deny ip host 198.51.100.89 any -> applied to NY-FW-01 & DXB-EDGE-FW-01...</span><br><span style="color: #fbbf24;">[FW-CLI] access-list 101 deny ip host 203.0.113.190 any -> applied...</span>`;
        }
        setTimeout(() => {
          document.getElementById('ndr-status-1').innerHTML = '✔ Blocked (ACL 101)';
          document.getElementById('ndr-status-1').style.color = '#15803d';
          document.getElementById('ndr-status-3').innerHTML = '✔ Blocked (ACL 101)';
          document.getElementById('ndr-status-3').style.color = '#15803d';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += `<br><span style="color: #34d399;">✔ Firewall Perimeter ACL successfully deployed. 2 malicious IPs dropped at edge.</span>`;
          }
          pushAclBtn.innerHTML = '✔ Firewall ACL Enforced';
          pushAclBtn.style.background = '#15803d';
          showToast('Automated Perimeter Firewall ACL pushed: Tor node & Mirai C2 blocked.');
        }, 1100);
      };
    }

    if (quarantineBtn) {
      quarantineBtn.onclick = () => {
        quarantineBtn.disabled = true;
        quarantineBtn.innerHTML = 'Quarantining 802.1X...';
        setTimeout(() => {
          document.getElementById('ndr-status-2').innerHTML = '✔ Isolated (VLAN 999)';
          document.getElementById('ndr-status-2').style.color = '#ea580c';
          if (dynamicMsg) {
            dynamicMsg.innerHTML += `<br><span style="color: #38bdf8;">[802.1X NAC] Switch port FastEthernet0/24 changed to Remediation Quarantine VLAN 999.</span>`;
          }
          quarantineBtn.innerHTML = '✔ Host Quarantined';
          showToast('Host 10.0.1.44 (DXB-APP-04) quarantined via 802.1X NAC isolation VLAN 999.');
        }, 1000);
      };
    }

    if (exportStixBtn) {
      exportStixBtn.onclick = () => {
        showToast('Exported forensic STIX 2.1 JSON bundle & PCAP trace for SIEM ingest.');
      };
    }
  }

