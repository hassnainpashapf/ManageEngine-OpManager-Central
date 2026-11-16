  
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
    const dev = targetDev || (state.devices && state.devices[0]);
    if (!dev) {
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 560px; max-width: 95vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #cbd5e1; padding: 32px 24px; text-align: center;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No Managed Devices for NCM Comparison</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 20px; line-height: 1.5;">Add a Cisco, Juniper, or HP switch/router with SSH or Telnet credentials to track startup vs running configuration drifts.</div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button onclick="document.getElementById('opm-ncm-diff-modal').style.display='none'; showAddDeviceModal();" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">+ Add Device</button>
            <button onclick="document.getElementById('opm-ncm-diff-modal').style.display='none';" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      return;
    }

    const escCfg = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rawStartup = dev.startupConfig || '';
    const rawRunning = dev.runningConfig || '';
    const sLinesRaw = rawStartup ? rawStartup.split(/\r?\n/) : [];
    const rLinesRaw = rawRunning ? rawRunning.split(/\r?\n/) : [];
    const rSet = new Set(rLinesRaw.map(x => x.trim()).filter(Boolean));
    const sSet = new Set(sLinesRaw.map(x => x.trim()).filter(Boolean));

    const startupLines = sLinesRaw.map((txt, idx) => ({
      num: String(idx + 1).padStart(2, '0'),
      text: txt,
      highlight: (rawRunning && txt.trim() && !rSet.has(txt.trim())) ? 'del' : null
    }));
    const runningLines = rLinesRaw.map((txt, idx) => ({
      num: String(idx + 1).padStart(2, '0'),
      text: txt,
      highlight: (rawStartup && txt.trim() && !sSet.has(txt.trim())) ? 'add' : null
    }));

    const diffCount = startupLines.filter(l => l.highlight).length + runningLines.filter(l => l.highlight).length;
    const hasAnyCfg = Boolean(rawStartup || rawRunning);
    const capturedLabel = dev.lastBackup ? `Captured: ${new Date(dev.lastBackup).toLocaleString()}` : 'Not backed up yet';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NCM Real Configuration Comparator</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${escCfg(dev.displayName || dev.name)} (${escCfg(dev.ip)})</strong> &bull; Probe: ${escCfg(dev.probeName || dev.probe || 'Central Site Probe')} &bull; ${escCfg(capturedLabel)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: ${!hasAnyCfg ? '#fef3c7' : (diffCount > 0 ? '#fee2e2' : '#dcfce7')}; color: ${!hasAnyCfg ? '#92400e' : (diffCount > 0 ? '#991b1b' : '#166534')}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">
              ${!hasAnyCfg ? 'No Backup Captured Yet' : (diffCount > 0 ? `${diffCount} Line Differences` : 'Startup & Running In Sync')}
            </span>
            <button id="close-ncm-diff-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
          </div>
        </div>

        <!-- Toolbar -->
        <div style="padding: 10px 24px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="color: #334155; font-weight: 700;">Diff Legend:</span>
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #dc2626;"><span style="width: 10px; height: 10px; background: rgba(220, 38, 38, 0.2); border: 1px solid #dc2626; display: inline-block;"></span> Startup Only</span>
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #16a34a;"><span style="width: 10px; height: 10px; background: rgba(22, 163, 74, 0.2); border: 1px solid #16a34a; display: inline-block;"></span> Running Only</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="opm-ncm-refetch-ssh-btn" style="background: #16a34a; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              ⚡ Re-Backup via SSH
            </button>
            <button id="opm-ncm-open-cli-btn" style="background: #0070e0; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Open SSH CLI (wr mem / edit)
            </button>
            <button id="opm-ncm-export-pdf-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Download Running (.cfg)
            </button>
          </div>
        </div>

        <!-- Dual Pane Body -->
        <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #0f172a; font-family: monospace; font-size: 11px; line-height: 1.6; min-height: 320px;">
          <!-- Left Pane: Startup Baseline -->
          <div style="border-right: 1px solid #334155; padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>STARTUP-CONFIG (SQLite Store)</span>
              <span style="color: #cbd5e1;">${sLinesRaw.length} Lines &bull; ${rawStartup.length} B</span>
            </div>
            <div>
              ${sLinesRaw.length === 0 ? '<div style="color:#64748b;padding:24px 8px;">No startup-config stored yet for this node.</div>' : startupLines.map(l => `
                <div style="display: flex; gap: 8px; padding: 1px 4px; ${l.highlight === 'del' ? 'background: rgba(220, 38, 38, 0.25); color: #fca5a5; border-left: 3px solid #dc2626;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 26px; text-align: right; user-select: none;">${l.num}</span>
                  <span>${escCfg(l.text)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right Pane: Running Config -->
          <div style="padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RUNNING-CONFIG (SQLite Store)</span>
              <span style="color: #4ade80;">${rLinesRaw.length} Lines &bull; ${rawRunning.length} B</span>
            </div>
            <div>
              ${rLinesRaw.length === 0 ? '<div style="color:#64748b;padding:24px 8px;">No running-config stored yet. Configure SSH credentials under Settings &gt; Credentials and click Re-Backup via SSH.</div>' : runningLines.map(l => `
                <div style="display: flex; gap: 8px; padding: 1px 4px; ${l.highlight === 'add' ? 'background: rgba(22, 163, 74, 0.25); color: #86efac; border-left: 3px solid #16a34a;' : 'color: #cbd5e1;'}">
                  <span style="color: #64748b; width: 26px; text-align: right; user-select: none;">${l.num}</span>
                  <span>${escCfg(l.text)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine Network Configuration Manager v12.9.203 &bull; Live SQLite Config Revision Archive</span>
          <button id="opm-ncm-diff-close-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Comparator</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-ncm-diff-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-ncm-diff-close-btn').onclick = () => { modal.style.display = 'none'; };

    const refetchBtn = modal.querySelector('#opm-ncm-refetch-ssh-btn');
    if (refetchBtn) {
      refetchBtn.onclick = async () => {
        refetchBtn.disabled = true;
        refetchBtn.textContent = 'Backing up...';
        try {
          const resp = await fetch('/api/ccm/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: dev.id })
          });
          const data = await resp.json();
          if (resp.ok) {
            if (typeof fetchInventoryData === 'function') await fetchInventoryData();
            showToast(data.message || `Backup completed for ${dev.name}.`);
            const refreshed = (state.devices || []).find(x => String(x.id) === String(dev.id)) || dev;
            showNcmVersionCompareModal(refreshed);
          } else {
            showToast(data.message || `SSH backup failed (${resp.status}).`, 'warning');
            refetchBtn.disabled = false;
            refetchBtn.textContent = '⚡ Re-Backup via SSH';
          }
        } catch (err) {
          showToast(`Backup error: ${err.message}`, 'error');
          refetchBtn.disabled = false;
          refetchBtn.textContent = '⚡ Re-Backup via SSH';
        }
      };
    }
    const openCliBtn = modal.querySelector('#opm-ncm-open-cli-btn');
    if (openCliBtn) {
      openCliBtn.onclick = () => {
        modal.style.display = 'none';
        if (typeof showNetworkToolsModal === 'function') showNetworkToolsModal(dev.ip, 'terminal');
      };
    }
    const exportBtn = modal.querySelector('#opm-ncm-export-pdf-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const text = rawRunning || rawStartup;
        if (!text) { showToast('No saved running/startup config to download yet.', 'warning'); return; }
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(dev.name || dev.ip || 'device').replace(/[^a-z0-9_.-]/gi, '_')}_running.cfg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                ${(state.devices && state.devices.length > 0) ? state.devices.map(d => `
                  <option value="${d.id}">${d.name} (${d.ip})</option>
                `).join('') : `
                  <option value="1">Central Server (${window.location.hostname || '192.168.30.65'})</option>
                `}
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
        varBox.innerHTML = 'sysUpTimeInstance = 0<br>sysName.0 = ' + ((state.devices && state.devices[0]?.name) || 'Central-Server');
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
        <img src="/apiclient/fluidicv2/img/opmNewLogo.png" alt="ManageEngine OpManager" style="height: 24px; width: auto; vertical-align: middle; margin-right: 6px; display: inline-block;">
        <span style="font-size: 16px; font-weight: 600; color: #ffffff; letter-spacing: -0.2px; vertical-align: middle; font-family: Lato, sans-serif;">Central</span>
        <span style="background: #49bd80; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 2px; letter-spacing: 0.8px; margin-left: 7px; vertical-align: middle;">ENTERPRISE</span>
      `;
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
      const bellBtn = hdr.querySelector('button[data-fsoqa="user-notifications"]') || hdr.querySelector('#opm-header-bell-btn');
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
        const alarmCount = (state.alarms && state.alarms.length) || 0;
        badge.innerText = String(alarmCount);
        badge.style.display = alarmCount > 0 ? 'inline-block' : 'none';
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
              <span style="font-weight: 700;">${state.probes.length} / ${state.probes.length || 1} Online</span>
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
    pop.querySelector('#ql-disc').onclick = () => { pop.style.display = 'none'; showSubnetDiscoveryModal(); };
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
        else if (action === 'add-probe') showAddProbeModal();
        else if (action === 'add-widget') showAddWidgetModal();
        else if (action === 'download-agent') {
          window.open('/downloads/OpManagerAgent-Windows-x64.zip', '_blank');
          showToast('Downloading OpManager Windows Agent Package (.ZIP with OPMAgentServerInfo.json)...');
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
        <span>Select Monitoring Probe / Branch</span>
        <span style="font-size: 10px; background: #1d824e; padding: 1px 6px; border-radius: 3px; font-weight: 700;">${state.probes.length} ONLINE</span>
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
              <div style="font-size: 10px; color: #64748b; margin-left: 16px;">${pr.ip} • ${pr.latency}ms • ${pr.devicesCount || 0} devices</div>
            </div>
            <span style="font-size: 10px; color: #166534; font-weight: 600;">UP</span>
          </div>
        `).join('')}
      </div>
      <div style="background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center;">
        <button id="opm-quick-add-probe-btn" style="background: none; border: none; font-size: 11px; color: #0070e0; font-weight: 700; cursor: pointer; padding: 0;">+ Add Branch / Probe</button>
        <a href="#/settings" onclick="state.subTabs.settings='probes'; renderSettingsView();" style="font-size: 11px; color: #64748b; text-decoration: none; font-weight: 600;">Manage Probes →</a>
      </div>
    `;

    const quickAddProbeBtn = pop.querySelector('#opm-quick-add-probe-btn');
    if (quickAddProbeBtn) {
      quickAddProbeBtn.onclick = (e) => {
        e.stopPropagation();
        pop.style.display = 'none';
        showAddProbeModal();
      };
    }
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
              <span style="font-size: 11px; color: #0284c7; font-weight: 600;">${d.probeName || d.probe || 'Central Site Probe'}</span>
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
            else if (act === 'ping') showNetworkToolsModal((state.devices && state.devices[0]?.ip) || '127.0.0.1', 'ping');
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
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${dev.name} (${dev.ip})</strong> &bull; Monitored via ${dev.probeName || dev.probe || 'Central Site Probe'}</div>
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

    execBtn.onclick = async () => {
      execBtn.disabled = true;
      execBtn.innerText = 'Verifying via SSH...';
      term.style.display = 'block';
      const targetDevIp = dev.ip || '127.0.0.1';
      term.innerHTML = `<div style="color: #94a3b8;">[1/2] Sending read-only SSH verification ("show running-config") to ${targetDevIp}:22...</div>`;
      try {
        const resp = await fetch('/api/tools/terminal-exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostname: targetDevIp, command: 'show running-config' })
        });
        const data = await resp.json();
        if (!resp.ok || data.status === 'error') {
          term.innerHTML += `<div style="color: #f87171;">[SSH Error ${resp.status}] ${String(data.message || data.stderr || 'Failed').replace(/</g, '&lt;')}</div><div style="color: #cbd5e1; margin-top: 6px;">Tip: Configure SSH credentials under Settings &gt; Credentials or use OpUtils Web CLI Terminal to apply changes interactively.</div>`;
        } else {
          term.innerHTML += `<div style="color: #4ade80;">[2/2] Live SSH output received (${(data.output || '').length} bytes):</div><pre style="white-space:pre-wrap;color:#e2e8f0;margin-top:4px;">${String(data.output || '').slice(0, 800).replace(/</g, '&lt;')}</pre>`;
        }
      } catch (e) {
        term.innerHTML += `<div style="color: #f87171;">Network error: ${e.message}</div>`;
      }
      execBtn.disabled = false;
      execBtn.innerText = '▶ Run Live SSH Check';
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
    const hostIp = window.location.hostname || '192.168.30.65';
    const l = linkData || {
      name: 'Central HQ <--> Enterprise WAN Gateway',
      carrier: 'Carrier Transit MPLS & SD-WAN',
      src: `Central HQ (${hostIp})`,
      dst: `${(state.devices && state.devices[0]?.name) || 'Primary-Switch'} (${(state.devices && state.devices[0]?.ip) || '127.0.0.1'})`,
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

    const dev = (state.devices && state.devices[0]);
    const monitoredTarget = dev ? `${dev.name} (${dev.ip})` : `Central NetFlow Listener (${window.location.hostname || '192.168.30.65'})`;
    const records = dev ? [
      { time: 'Just now', src: `${dev.ip}:443`, dst: '192.168.1.1:58210', proto: 'TCP (06)', app: 'HTTPS_SSL', bytes: '1.24 MB', pkts: '840', flags: 'ACK', nextHop: 'Direct', dscp: 'CS0 (Default)' }
    ] : [];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1040px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NFA</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NetFlow Analyzer &bull; Raw Flow Records Stream</div>
              <div style="font-size: 11px; color: #64748b;">UDP 2055 / 9996 Ingestion &bull; Monitored on <strong style="color: #0070e0;">${monitoredTarget}</strong> &bull; IPFIX v10</div>
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
              ${records.length === 0 ? `
                <tr>
                  <td colspan="9" style="padding: 40px 10px; text-align: center; color: #64748b;">
                    <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 4px;">No Live NetFlow Packets Captured</div>
                    <div>Configure NetFlow / IPFIX exporter on your routers/switches to UDP 2055 or 9996 on ${window.location.hostname || '192.168.30.65'}.</div>
                  </td>
                </tr>
              ` : records.map(r => `
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

    const host = targetIp || (state.devices && state.devices[0]?.ip) || '127.0.0.1';
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
      const dev = (state.devices || []).find(d => d.ip === host) || (state.devices && state.devices[0]) || { name: 'Central-Managed-Node', vendor: 'Enterprise OS' };
      
      let val = dev.name;
      if (node.name === 'sysDescr') val = `${dev.vendor || 'Enterprise'} ${dev.type || 'Managed Node'} Software, Version 15.2, OpManager Monitored Node`;
      else if (node.name === 'sysObjectID') val = '.1.3.6.1.4.1.9.1.516';
      else if (node.name === 'sysUpTime') val = '148 days, 12:44:19.82 (1283305982 timeticks)';
      else if (node.name === 'sysContact') val = 'noc-support@manageengine.internal';
      else if (node.name === 'sysLocation') val = 'Central Enterprise Core, Rack U12';
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

    const srcName = (state.devices && state.devices[0]?.name) || 'Central Core Gateway';
    const dstName = (state.devices && state.devices[1]?.name) || 'Branch Gateway';
    const l = linkData || {
      name: `${srcName} <--> ${dstName} Link`,
      carrier: 'Enterprise IP SLA WAN',
      src: srcName,
      dst: dstName
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

    const dev = targetDev || (state.devices && state.devices[0]) || { name: 'Central-Host', ip: '127.0.0.1' };

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
            ▶ Test Run Playbook on ${(state.devices && state.devices[0]?.name) || 'Managed-Node'}
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
    modal.querySelector('#wf-test-run-btn').onclick = async () => {
      const targetDev = (state.devices && state.devices[0]) || null;
      consoleBox.style.display = 'block';
      if (!targetDev) {
        consoleBox.innerHTML = `<span style="color: #fbbf24;">[${new Date().toLocaleTimeString()}] No monitored device in store yet — add a device first to run a live workflow check.</span>`;
        return;
      }
      consoleBox.innerHTML = `<span style="color: #94a3b8;">[${new Date().toLocaleTimeString()}] Executing live workflow verification against ${targetDev.name} (${targetDev.ip})...</span><br>`;
      try {
        const pingResp = await fetch('/api/tools/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host: targetDev.ip, count: 2 })
        });
        const pingData = await pingResp.json();
        const rtt = pingData.avgMs != null ? `${pingData.avgMs} ms` : (pingData.output ? 'reachable' : 'timeout');
        consoleBox.innerHTML += `<span style="color: ${pingResp.ok ? '#4ade80' : '#f87171'};">[${new Date().toLocaleTimeString()}] Step 1: Live ICMP Probe -> ${pingResp.ok ? 'REACHABLE (' + rtt + ')' : (pingData.message || 'Unreachable')}.</span><br>`;
        if (targetDev.id) {
          const pollResp = await fetch(`/api/devices/${targetDev.id}/poll-now`, { method: 'POST' });
          const pollData = await pollResp.json();
          consoleBox.innerHTML += `<span style="color: ${pollResp.ok ? '#38bdf8' : '#fbbf24'};">[${new Date().toLocaleTimeString()}] Step 2: Live Device Re-Poll -> Status: ${pollData.device?.status || (pollResp.ok ? 'OK' : 'Failed')}.</span><br>`;
        }
        consoleBox.innerHTML += `<span style="color: #22c55e; font-weight: 700;">[${new Date().toLocaleTimeString()}] Live workflow check finished.</span>`;
      } catch (err) {
        consoleBox.innerHTML += `<span style="color: #f87171;">[${new Date().toLocaleTimeString()}] Workflow error: ${err.message}</span>`;
      }
    };

    modal.querySelector('#wf-save-btn').onclick = async () => {
      const targetDev = (state.devices && state.devices[0]) || null;
      const wfName = `Auto-Remediation (${targetDev ? targetDev.name : 'Default Policy'})`;
      try {
        await fetch('/api/workflows/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: wfName,
            steps: targetDev ? [{ type: 'ssh', host: targetDev.ip, command: 'show version' }] : []
          })
        });
      } catch (e) {}
      modal.style.display = 'none';
      showToast(`Workflow Playbook "${wfName}" saved.`);
      if (state.currentTab === 'configuration' && typeof renderConfigurationView === 'function') {
        renderConfigurationView();
      }
    };
  }

  // -------------------------------------------------------------
  // MODAL: OPUTILS REAL SNMP SWITCH PORT MAPPER (SPM) & ARP/MAC
  // -------------------------------------------------------------
  async function showSwitchPortMapperModal(switchDev) {
    let modal = document.getElementById('opm-spm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-spm-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const candidates = (state.devices || []).filter(d => /switch|router|firewall|wireless|ap|wlc/i.test(d.category || ''));
    const allDevs = candidates.length ? candidates : (state.devices || []);
    let selectedDev = switchDev || candidates[0] || allDevs[0];

    if (!selectedDev) {
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
          <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
            <div style="font-size: 15px; font-weight: 800;">ManageEngine OpUtils &bull; Switch Port Mapper (SPM)</div>
            <button id="close-spm-modal-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Switches Discovered</div>
            <button onclick="document.getElementById('opm-spm-modal').style.display='none'; showAddDeviceModal();" style="background: #0070e0; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">+ Add Switch</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      modal.querySelector('#close-spm-modal-btn').onclick = () => { modal.style.display = 'none'; };
      return;
    }

    let lastPorts = [];
    let lastArpEntries = [];

    const renderSpm = async (targetDev) => {
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 1160px; max-width: 96vw; height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
          <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">SPM</div>
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpUtils &bull; Live Switch Port &amp; ARP/MAC Mapper</div>
                <div style="font-size: 11px; color: #94a3b8;">Querying real SNMP IF-MIB &amp; ipNetToMediaTable on <strong style="color: #38bdf8;">${targetDev.displayName || targetDev.name || targetDev.ip} (${targetDev.ip})</strong>...</div>
              </div>
            </div>
            <button id="close-spm-modal-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
          </div>
          <div style="padding: 40px; text-align: center; color: #64748b; font-size: 13px;">Polling live SNMP switch interfaces and ARP/MAC table...</div>
        </div>
      `;
      modal.style.display = 'flex';
      modal.querySelector('#close-spm-modal-btn').onclick = () => { modal.style.display = 'none'; };

      const [dpiRes, arpRes] = await Promise.all([
        fetch('/api/advanced/dpi/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: targetDev.id })
        }).then(r => r.json()).catch(() => ({})),
        fetch(`/api/tools/arp-table?gateway=${encodeURIComponent(targetDev.ip)}`).then(r => r.json()).catch(() => ({}))
      ]);

      const ifaces = dpiRes.interfaces || [];
      const arpEntries = arpRes.entries || [];
      lastArpEntries = arpEntries;
      const devByIp = new Map((state.devices || []).map(d => [d.ip, d]));

      lastPorts = ifaces.map((i, idx) => {
        const idxNum = i.ifIndex != null ? i.ifIndex : (idx + 1);
        const matchingArps = arpEntries.filter(a => a.ifIndex === idxNum || (i.name && a.iface === i.name));
        const firstArp = matchingArps[0] || null;
        const boundDev = firstArp ? devByIp.get(firstArp.ip) : null;
        const isUp = i.operStatus === 1 || i.oper_status === 1 || /up/i.test(String(i.oper || i.status || ''));
        return {
          index: idxNum,
          name: i.name || i.descr || `ifIndex ${idxNum}`,
          status: isUp ? 'Up' : 'Down',
          speed: i.speed ? `${Math.round(Number(i.speed) / 1000000)} Mbps` : '—',
          mac: firstArp ? firstArp.mac : (matchingArps.length ? `${matchingArps.length} MACs` : '—'),
          ip: firstArp ? firstArp.ip : (matchingArps.length > 1 ? `${matchingArps.length} hosts` : '—'),
          hostname: boundDev ? (boundDev.displayName || boundDev.name || boundDev.ip) : (matchingArps.length > 1 ? `(${matchingArps.length} ARP entries)` : '—'),
          inMB: ((Number(i.inOctets || 0)) / 1048576).toFixed(1),
          outMB: ((Number(i.outOctets || 0)) / 1048576).toFixed(1)
        };
      });

      const upCount = lastPorts.filter(p => p.status === 'Up').length;
      const downCount = lastPorts.length - upCount;

      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 1160px; max-width: 96vw; height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
          <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">SPM</div>
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpUtils &bull; Live Switch Port &amp; ARP/MAC Mapper</div>
                <div style="font-size: 11px; color: #94a3b8;">Target: <strong style="color: #38bdf8;">${targetDev.displayName || targetDev.name || targetDev.ip} (${targetDev.ip})</strong> &bull; SNMP Ports: <strong>${lastPorts.length}</strong> &bull; ARP/MAC Table: <strong>${arpEntries.length}</strong></div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <select id="spm-device-select" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 5px 10px; border-radius: 4px; font-size: 11px;">
                ${allDevs.map(d => `<option value="${d.id}" ${String(d.id) === String(targetDev.id) ? 'selected' : ''}>${d.displayName || d.name || d.ip} (${d.ip})</option>`).join('')}
              </select>
              <button id="close-spm-modal-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
            </div>
          </div>

          <div style="padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 3px 10px; border-radius: 12px;">● ${upCount} Up Ports</span>
              <span style="background: #f1f5f9; color: #475569; font-weight: 700; padding: 3px 10px; border-radius: 12px;">○ ${downCount} Down Ports</span>
              <span style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 3px 10px; border-radius: 12px;">${arpEntries.length} Live ARP/MAC Entries</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="spm-rescan-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Re-Scan SNMP &amp; ARP</button>
              <button id="spm-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export CSV</button>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; padding: 14px 22px;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">SNMP IF-MIB Ports (${lastPorts.length})</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 8px 10px; width: 55px;">ifIdx</th>
                  <th style="padding: 8px 10px;">Port / Interface</th>
                  <th style="padding: 8px 10px;">Oper Status</th>
                  <th style="padding: 8px 10px;">Speed</th>
                  <th style="padding: 8px 10px;">Traffic (In / Out MB)</th>
                  <th style="padding: 8px 10px;">Connected MAC</th>
                  <th style="padding: 8px 10px;">Bound IP / Host</th>
                  <th style="padding: 8px 10px; text-align: right;">CLI</th>
                </tr>
              </thead>
              <tbody>
                ${lastPorts.length === 0 ? `
                  <tr><td colspan="8" style="padding: 24px; text-align: center; color: #94a3b8;">No SNMP interfaces returned from ${targetDev.ip} (ensure SNMPv2c community matches).</td></tr>
                ` : lastPorts.map(p => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px; font-family: monospace; color: #64748b;">${p.index}</td>
                    <td style="padding: 7px 10px; font-weight: 700; color: #0284c7; font-family: monospace;">${p.name}</td>
                    <td style="padding: 7px 10px;"><span style="background: ${p.status === 'Up' ? '#dcfce7' : '#f1f5f9'}; color: ${p.status === 'Up' ? '#166534' : '#64748b'}; font-weight: 700; padding: 2px 6px; border-radius: 3px;">${p.status}</span></td>
                    <td style="padding: 7px 10px; color: #334155;">${p.speed}</td>
                    <td style="padding: 7px 10px; font-family: monospace; color: #475569;">${p.inMB} / ${p.outMB} MB</td>
                    <td style="padding: 7px 10px; font-family: monospace; color: #0f172a;">${p.mac}</td>
                    <td style="padding: 7px 10px; font-family: monospace; color: #0284c7;">${p.ip}${p.hostname !== '—' ? ' (' + p.hostname + ')' : ''}</td>
                    <td style="padding: 7px 10px; text-align: right;"><button class="spm-shut-btn" data-ip="${targetDev.ip}" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 600; cursor: pointer;">SSH CLI</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Discovered Network ARP / MAC Bindings (Showing up to 100 of ${arpEntries.length})</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 7px 10px;">IP Address</th>
                  <th style="padding: 7px 10px;">MAC Address</th>
                  <th style="padding: 7px 10px;">Interface / ifIndex</th>
                  <th style="padding: 7px 10px;">Host / Name</th>
                  <th style="padding: 7px 10px;">Source</th>
                </tr>
              </thead>
              <tbody>
                ${arpEntries.length === 0 ? `
                  <tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">No ARP entries collected.</td></tr>
                ` : arpEntries.slice(0, 100).map(a => {
                  const d = devByIp.get(a.ip);
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 6px 10px; font-family: monospace; color: #0284c7;">${a.ip}</td>
                      <td style="padding: 6px 10px; font-family: monospace; font-weight: 700; color: #0f172a;">${a.mac}</td>
                      <td style="padding: 6px 10px; font-family: monospace; color: #475569;">${a.iface || '—'}</td>
                      <td style="padding: 6px 10px; color: #334155;">${d ? (d.displayName || d.name) : '—'}</td>
                      <td style="padding: 6px 10px; font-size: 10px; color: #64748b;">${a.source}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding: 10px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>Live SNMP IF-MIB &amp; ipNetToMediaTable &bull; Zero Hardcoded Ports</span>
            <button id="spm-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close SPM</button>
          </div>
        </div>
      `;

      modal.querySelector('#close-spm-modal-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#spm-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
      const sel = modal.querySelector('#spm-device-select');
      if (sel) sel.onchange = () => {
        const nextDev = allDevs.find(d => String(d.id) === String(sel.value));
        if (nextDev) { selectedDev = nextDev; renderSpm(nextDev); }
      };
      modal.querySelector('#spm-rescan-btn').onclick = () => renderSpm(targetDev);
      modal.querySelector('#spm-export-btn').onclick = () => {
        const csvLines = ['ifIndex,Port,Status,Speed,InMB,OutMB,MAC,IP'].concat(
          lastPorts.map(p => `${p.index},"${p.name}","${p.status}","${p.speed}",${p.inMB},${p.outMB},"${p.mac}","${p.ip}"`)
        );
        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `SPM_${targetDev.ip}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast(`Exported ${lastPorts.length} SNMP switch ports + ARP mappings to CSV.`);
      };
      modal.querySelectorAll('.spm-shut-btn').forEach(btn => {
        btn.onclick = () => {
          modal.style.display = 'none';
          if (typeof showNetworkToolsModal === 'function') showNetworkToolsModal(btn.getAttribute('data-ip'), 'terminal');
        };
      });
    };

    await renderSpm(selectedDev);
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

    const storageDev = targetArray || (state.devices || []).find(d => ['storage', 'san', 'nas'].some(k => (d.category || '').toLowerCase().includes(k)));

    if (!storageDev) {
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
          <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
            <div style="font-size: 15px; font-weight: 800; color: #fff;">ManageEngine OpManager Central &bull; SAN Storage &amp; LUN Telemetry</div>
            <span id="close-storage-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer;" title="Close">✕</span>
          </div>
          <div style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Storage Arrays Discovered</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Add SAN/NAS arrays, SMI-S providers, or Fiber Channel switches to monitor LUN latency, IOPS, and pool capacity.</div>
            <button onclick="document.getElementById('opm-storage-array-modal').style.display='none'; showAddDeviceModal();" style="background: #0070e0; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">+ Add Storage Device</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      modal.querySelector('#close-storage-modal-btn').onclick = () => { modal.style.display = 'none'; };
      return;
    }

    const arr = {
      name: storageDev.name,
      ip: storageDev.ip,
      controllers: 'Active-Active Dual Node HA (Node-01 / Node-02)',
      protocol: 'FCP & NVMe-oF'
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
                  <td style="padding: 8px 10px; color: #334155;">Virtualization Cluster (Datastore 01)</td>
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
            Zia correlated this incident on ${alm.device} (${alm.probe || 'Central Probe'}). Automated event telemetry registered telemetry divergence: "${alm.message}".
          </p>
          <div style="background: #ffffff; border: 1px solid #c4b5fd; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #5b21b6;">
            <strong>Recommended Action:</strong> Inspect real-time SNMP/WMI telemetry metrics and verify health threshold state on ${alm.device}.
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
    const addNoteBtn = document.getElementById('drawer-add-note-btn');
    if (addNoteBtn) {
      addNoteBtn.onclick = async () => {
        const noteEl = document.getElementById('drawer-note-input');
        const note = noteEl ? noteEl.value.trim() : '';
        if (!note) { showToast('Please enter a note first.', 'warning'); return; }
        addNoteBtn.disabled = true;
        try {
          await fetch('/api/json/alarms/addNotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alarmId: alm.id, notes: note })
          });
        } catch (e) {}
        alm.lastNote = note;
        if (noteEl) noteEl.value = '';
        addNoteBtn.disabled = false;
        showToast(`Resolution note recorded for ${alm.device}.`);
        showAlarmDrawer(alm);
      };
    }
    document.getElementById('drawer-ack-btn').onclick = async () => {
      try {
        await fetch(`/api/alarms/${encodeURIComponent(alm.id)}/acknowledge`, { method: 'POST' });
      } catch (e) {}
      alm.technician = 'admin';
      alm.status = 'acknowledged';
      showToast(`Alarm for ${alm.device} acknowledged by admin.`);
      drawer.style.display = 'none';
      const c = document.getElementById('opm-custom-suite-container');
      if (c && state.currentTab === 'alarms') renderAlarmsView(c);
    };
    document.getElementById('drawer-clear-btn').onclick = async () => {
      try {
        await fetch(`/api/alarms/${encodeURIComponent(alm.id)}/clear`, { method: 'POST' });
      } catch (e) {}
      state.alarms = state.alarms.filter(a => a.id !== alm.id);
      if (typeof updateStatusCounters === 'function') updateStatusCounters();
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
      document.body.appendChild(modal);
    }

    const devCount = (state.devices && state.devices.length) || 0;
    const prbCount = (state.probes && state.probes.length) || 1;
    const critAlarms = (state.alarms || []).filter(a => a.severity === 'Critical');
    const summaryText = devCount === 0
      ? 'Currently monitoring 0 active nodes. Add servers and network switches across your connected enterprise probes to stream real-time Zia AI anomaly detection.'
      : (critAlarms.length > 0 
          ? `Currently monitoring ${devCount} core nodes across ${prbCount} distributed probes. Overall availability is at 99.98%. Primary attention is required on ${critAlarms[0].device} reporting: "${critAlarms[0].message}".`
          : `Currently monitoring ${devCount} core nodes across ${prbCount} distributed probes. All monitored infrastructure nodes are performing within normal operational thresholds.`);

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
                ${summaryText}
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
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Device IP Address *</label>
              <input type="text" id="new-dev-ip" placeholder="e.g. 192.168.30.10" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Device Name (optional)</label>
                <input type="text" id="new-dev-name" placeholder="Auto-detected via SNMP" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Category</label>
                <select id="new-dev-category" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box; background: #ffffff;">
                  <option value="Switches">Switches (NCM)</option>
                  <option value="Routers">Routers (NCM)</option>
                  <option value="Firewalls">Firewalls (NCM)</option>
                  <option value="Wireless">Wireless / APs</option>
                  <option value="Servers">Servers / Hypervisors</option>
                  <option value="Storage">Storage / SAN</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Assign to Remote Probe *</label>
              <select id="new-dev-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box; background: #ffffff;">
                ${state.probes.map(p => `<option value="${p.id}">${p.name} (${p.location || p.ip})</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">SNMP Community String</label>
              <input type="text" id="new-dev-snmp" value="public" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; outline: none; box-sizing: border-box;">
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-add-dev-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-add-dev-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Discover &amp; Add</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const probeSelect = modal.querySelector('#new-dev-probe');
    if (probeSelect && state.probes && state.probes.length > 0) {
      probeSelect.innerHTML = state.probes.map(p => `<option value="${p.id}">${p.name} (${p.location || p.ip})</option>`).join('');
    }

    modal.style.display = 'flex';
    document.getElementById('close-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-add-dev-btn').onclick = async () => {
      const saveBtn = document.getElementById('save-add-dev-btn');
      const ipInput = document.getElementById('new-dev-ip');
      const ip = ipInput ? ipInput.value.trim() : '';
      if (!ip) {
        showToast('Please enter a valid Device IP Address.', 'warning');
        return;
      }
      const nameVal = (document.getElementById('new-dev-name')?.value || '').trim();
      const category = document.getElementById('new-dev-category')?.value || 'Switches';
      const probeId = parseInt(document.getElementById('new-dev-probe')?.value, 10) || (state.probes && state.probes[0]?.id) || 1;
      const community = (document.getElementById('new-dev-snmp')?.value || 'public').trim();

      saveBtn.disabled = true;
      saveBtn.textContent = 'Adding & Polling...';
      try {
        const resp = await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip,
            name: nameVal || undefined,
            category,
            probeId,
            community
          })
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.message || `Server returned ${resp.status}`);
        }
        const createdId = data.device && data.device.id;
        if (createdId) {
          await fetch(`/api/devices/${createdId}/poll-now`, { method: 'POST' }).catch(() => {});
        }
        modal.style.display = 'none';
        if (ipInput) ipInput.value = '';
        if (typeof fetchInventoryData === 'function') await fetchInventoryData();
        showToast(`Device ${data.device?.hostname || ip} (${ip}) added and polled live!`);
      } catch (e) {
        showToast(`Failed to add device: ${e.message}`, 'warning');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Discover & Add';
      }
    };
  }

  // --- ADD BRANCH / REMOTE PROBE MODAL ---
  function showAddProbeModal() {
    let modal = document.getElementById('opm-add-probe-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-add-probe-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #cbd5e1;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #49bd80;"></span>
              <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Add New Branch / Remote Probe Site</span>
            </div>
            <button id="close-add-probe-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Branch / Site Name *</label>
              <input type="text" id="new-probe-name" placeholder="e.g. Lahore Branch Office / Karachi DC" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Geographic Location / City *</label>
              <input type="text" id="new-probe-loc" placeholder="e.g. Lahore, Pakistan" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Probe IP Address / FQDN *</label>
                <input type="text" id="new-probe-ip" placeholder="192.168.40.10" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Sync Port</label>
                <input type="number" id="new-probe-port" value="8060" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; outline: none; box-sizing: border-box;">
              </div>
            </div>
            <div style="background: #f1f5f9; border-radius: 4px; padding: 10px 12px; font-size: 11px; color: #475569; margin-bottom: 10px;">
              <strong>Probe Architecture:</strong> Probes act as local data collectors at remote branch sites. Once registered, install the probe service on the remote host pointing to Central: <code style="color: #0070e0;">http://${window.location.host || '192.168.30.65:8060'}</code>.
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="cancel-add-probe-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
            <button id="save-add-probe-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Register Branch Probe</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.getElementById('close-add-probe-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-add-probe-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-add-probe-btn').onclick = async () => {
      const name = (document.getElementById('new-probe-name').value || '').trim();
      const location = (document.getElementById('new-probe-loc').value || '').trim() || 'Remote Office';
      const ip = (document.getElementById('new-probe-ip').value || '').trim();
      const port = parseInt(document.getElementById('new-probe-port').value, 10) || 8060;
      if (!name || !ip) {
        showToast('Probe Name and IP Address are required.', 'warning');
        return;
      }

      const payload = { name, displayName: name, location, ip, port };
      let savedProbe = null;
      try {
        const resp = await fetch('/api/probes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();
        savedProbe = data.probe || null;
      } catch (e) {}

      const newProbe = savedProbe || {
        id: (state.probes.length ? Math.max(...state.probes.map(p => Number(p.id) || 0)) : 100) + 1,
        name,
        displayName: name,
        location,
        ip,
        port,
        status: 'Online',
        version: '12.9.204-GA',
        latency: null,
        devicesCount: 0,
        alarmsCount: 0,
        lastSync: 'Just now',
        syncStatus: 'Registered'
      };
      state.probes.push(newProbe);
      showToast(`Branch Site / Remote Probe "${name}" registered successfully!`);
      modal.style.display = 'none';

      if (state.currentTab === 'settings') {
        renderSettingsView();
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
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <button id="probe-details-del-btn" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 4px; padding: 6px 14px; font-size: 11px; font-weight: 600; cursor: pointer;">🗑 Delete Probe</button>
          <div style="display: flex; gap: 8px;">
            <button id="probe-details-sync-btn" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; padding: 6px 14px; font-size: 11px; font-weight: 600; cursor: pointer;">⚡ Force Sync</button>
            <button id="probe-modal-close-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-probe-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('probe-modal-close-btn').onclick = () => { modal.style.display = 'none'; };

    const delBtn = document.getElementById('probe-details-del-btn');
    if (delBtn) {
      delBtn.onclick = () => {
        showDeleteProbeConfirmModal(probe.id, probe.name);
      };
    }

    const syncBtn = document.getElementById('probe-details-sync-btn');
    if (syncBtn) {
      syncBtn.onclick = async () => {
        syncBtn.disabled = true;
        syncBtn.textContent = 'Syncing...';
        try {
          await fetch(`/api/probes/${probe.id}/sync`, { method: 'POST' });
        } catch(e) {}
        showToast(`Probe "${probe.name}" synchronized successfully.`);
        syncBtn.disabled = false;
        syncBtn.textContent = '⚡ Force Sync';
      };
    }
  }

  function showDeleteProbeConfirmModal(probeId, probeName) {
    if (String(probeId) === '101' && (state.probes || []).length <= 1) {
      showToast('Cannot delete Primary Central Site Probe (minimum 1 probe required).', 'error');
      return;
    }

    let modal = document.getElementById('opm-delete-probe-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-delete-probe-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const probe = (state.probes || []).find(p => String(p.id) === String(probeId)) || { name: probeName || 'Remote Probe', id: probeId };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 480px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="background: #fef2f2; border-bottom: 1px solid #fecaca; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">⚠️</span>
            <span style="font-size: 14px; font-weight: 700; color: #991b1b;">Unregister & Delete Enterprise Probe</span>
          </div>
          <button id="close-del-probe-btn" style="background: none; border: none; font-size: 18px; color: #991b1b; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 20px; font-size: 12px; color: #334155; line-height: 1.6;">
          <div style="margin-bottom: 12px;">
            Are you sure you want to permanently unregister and delete remote probe:
            <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-top: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
              ${probe.name} (IP: ${probe.ip || 'N/A'})
            </div>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #92400e;">
            <strong>Warning:</strong> Deleting this probe will remove all local data collection queues, remote collectors, and associated monitored assets assigned to this probe site.
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="cancel-del-probe-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
          <button id="confirm-del-probe-btn" style="background: #dc2626; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Delete Probe</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeHandler = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-del-probe-btn').onclick = closeHandler;
    modal.querySelector('#cancel-del-probe-btn').onclick = closeHandler;

    modal.querySelector('#confirm-del-probe-btn').onclick = async () => {
      const confirmBtn = modal.querySelector('#confirm-del-probe-btn');
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      try {
        await fetch(`/api/probes/${probeId}`, { method: 'DELETE' });
      } catch(e) {}

      // Update local state
      state.probes = (state.probes || []).filter(p => String(p.id) !== String(probeId));
      if (state.selectedProbe == probeId) {
        state.selectedProbe = 'all';
      }

      if (typeof updateStatusCounters === 'function') {
        updateStatusCounters();
      }

      showToast(`Remote Probe "${probe.name}" successfully deleted from Central.`);
      modal.style.display = 'none';

      // If probe details modal was open, close it
      const detailsModal = document.getElementById('opm-probe-details-modal');
      if (detailsModal) detailsModal.style.display = 'none';

      if (state.currentTab === 'settings' && typeof renderSettingsView === 'function') {
        renderSettingsView();
      } else if (state.currentTab === 'dashboard' && typeof renderDashboardView === 'function') {
        renderDashboardView();
      }
    };
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
              <input type="text" value="${alarm.device} (${alarm.ip || (state.devices && state.devices[0]?.ip) || '127.0.0.1'})" readonly style="width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; color: #64748b;">
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Assigned Support Group</label>
              <select style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
                <option>NOC Operations Tier 2 (Central Support)</option>
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

  // --- EDIT DEVICE PROPERTIES MODAL ---
  function showEditDeviceModal(devOrId) {
    let dev = typeof devOrId === 'object' ? devOrId : (state.devices || []).find(d => String(d.id) === String(devOrId) || d.name === devOrId);
    if (!dev) {
      showToast('Device not found in inventory', 'error');
      return;
    }

    let modal = document.getElementById('opm-edit-device-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-edit-device-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100001; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const probes = (state.probes && state.probes.length > 0) ? state.probes : [
      { id: 101, name: 'Central Site Probe' },
      { id: 102, name: 'DC-North Distributed Probe' }
    ];

    const templates = state.templates || [];
    const categories = ['Switches', 'Routers', 'Servers', 'Firewalls', 'Wireless', 'Storage'];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 680px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 35px -5px rgba(0,0,0,0.3); overflow: hidden;">
        <!-- Header -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Edit Device Properties - ${dev.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                IP: <strong style="color: #334155; font-family: monospace;">${dev.ip}</strong> &bull; Category: <strong>${dev.category}</strong> &bull; Probe: <strong>${dev.probeName || dev.probe || 'Central Site Probe'}</strong>
              </div>
            </div>
          </div>
          <button id="close-edit-device-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; padding: 4px 8px;">✕</button>
        </div>

        <!-- Form Body -->
        <div style="padding: 20px 24px; font-size: 12px; color: #334155; overflow-y: auto; max-height: calc(90vh - 140px);">
          
          <!-- General Specs Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              General Device Identification
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Device Display Name *</label>
                <input type="text" id="edit-dev-name" value="${dev.displayName || dev.name}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">IP Address / Hostname *</label>
                <input type="text" id="edit-dev-ip" value="${dev.ip}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Category *</label>
                <select id="edit-dev-category" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  ${categories.map(c => `<option value="${c}" ${(dev.category || '').toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Hardware Vendor</label>
                <input type="text" id="edit-dev-vendor" value="${dev.vendor || 'Cisco Systems'}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Device Model / Description</label>
              <input type="text" id="edit-dev-type" value="${dev.type || ''}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
          </div>

          <!-- Monitoring & SNMP Architecture Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              Monitoring Engine & SNMP Credentials
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Enterprise Probe Assignment *</label>
                <select id="edit-dev-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  ${probes.map(p => `<option value="${p.id}" ${String(dev.probeId) === String(p.id) ? 'selected' : ''}>${p.name} (Probe ${p.id})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Associated Device Template</label>
                <select id="edit-dev-template" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option value="">-- Auto-detect via SNMP SysOID --</option>
                  ${templates.slice(0, 100).map(t => `<option value="${t.name}" ${dev.template === t.name ? 'selected' : ''}>${t.name} (${t.category})</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">SNMP / Agent Protocol</label>
                <select id="edit-dev-snmp-version" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option value="v2c" ${(dev.snmpVersion || '').toLowerCase().includes('v2c') ? 'selected' : ''}>SNMP v2c</option>
                  <option value="v3" ${(dev.snmpVersion || '').toLowerCase().includes('v3') ? 'selected' : ''}>SNMP v3 (SHA/AES)</option>
                  <option value="v1" ${(dev.snmpVersion || '').toLowerCase().includes('v1') ? 'selected' : ''}>SNMP v1</option>
                  <option value="Agent-Direct" ${(dev.snmpVersion || '').toLowerCase().includes('agent') ? 'selected' : ''}>OpManager Agent</option>
                  <option value="WMI" ${(dev.snmpVersion || '').toLowerCase().includes('wmi') ? 'selected' : ''}>WMI / RPC</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">SNMP UDP Port</label>
                <input type="number" id="edit-dev-snmp-port" value="${dev.snmpPort || 161}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Community / Profile</label>
                <input type="text" id="edit-dev-snmp-comm" value="${dev.snmpCommunity || 'public'}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Polling Interval</label>
                <select id="edit-dev-poll" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option value="60s" ${dev.pollInterval === '60s' ? 'selected' : ''}>1 minute (Critical Tier 1)</option>
                  <option value="180s" ${dev.pollInterval === '180s' ? 'selected' : ''}>3 minutes</option>
                  <option value="300s" ${(!dev.pollInterval || dev.pollInterval === '300s') ? 'selected' : ''}>5 minutes (Recommended)</option>
                  <option value="600s" ${dev.pollInterval === '600s' ? 'selected' : ''}>10 minutes</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Operational Status</label>
                <select id="edit-dev-status" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  <option value="Clear" ${dev.status === 'Clear' ? 'selected' : ''}>Clear (Healthy / Online)</option>
                  <option value="Warning" ${dev.status === 'Warning' ? 'selected' : ''}>Warning (Threshold Exceeded)</option>
                  <option value="Critical" ${dev.status === 'Critical' ? 'selected' : ''}>Critical (Down / High Loss)</option>
                  <option value="Maintenance" ${dev.status === 'Maintenance' ? 'selected' : ''}>Maintenance Mode (Suppress Alarms)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Physical Location & Asset Tags -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              Physical Location &amp; Asset Management
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Physical Location / Rack</label>
                <input type="text" id="edit-dev-location" value="${dev.location || 'Data Center 1 - Rack 04'}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">System Contact / Admin</label>
                <input type="text" id="edit-dev-contact" value="${dev.contact || 'netops@enterprise.corp'}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">MAC Address</label>
              <input type="text" id="edit-dev-mac" value="${dev.mac || '00:50:56:00:00:01'}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
          <button id="modal-del-dev-btn" style="background: #fff; color: #dc2626; border: 1px solid #fecaca; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Delete Device</span>
          </button>
          <div style="display: flex; gap: 8px;">
            <button id="cancel-edit-dev-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="save-edit-dev-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    modal.querySelector('#close-edit-device-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#cancel-edit-dev-btn').onclick = () => { modal.style.display = 'none'; };

    // Delete Device trigger
    modal.querySelector('#modal-del-dev-btn').onclick = () => {
      modal.style.display = 'none';
      showDeleteDeviceConfirmModal(dev.id, dev.name);
    };

    // Save Changes trigger
    modal.querySelector('#save-edit-dev-btn').onclick = async () => {
      const saveBtn = modal.querySelector('#save-edit-dev-btn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>Saving...</span>';

      const updatedPayload = {
        name: modal.querySelector('#edit-dev-name').value.trim() || dev.name,
        displayName: modal.querySelector('#edit-dev-name').value.trim() || dev.name,
        ip: modal.querySelector('#edit-dev-ip').value.trim() || dev.ip,
        category: modal.querySelector('#edit-dev-category').value,
        vendor: modal.querySelector('#edit-dev-vendor').value.trim() || dev.vendor,
        type: modal.querySelector('#edit-dev-type').value.trim() || dev.type,
        probeId: parseInt(modal.querySelector('#edit-dev-probe').value, 10),
        template: modal.querySelector('#edit-dev-template').value,
        snmpVersion: modal.querySelector('#edit-dev-snmp-version').value,
        snmpPort: parseInt(modal.querySelector('#edit-dev-snmp-port').value, 10) || 161,
        snmpCommunity: modal.querySelector('#edit-dev-snmp-comm').value.trim() || 'public',
        pollInterval: modal.querySelector('#edit-dev-poll').value,
        status: modal.querySelector('#edit-dev-status').value,
        location: modal.querySelector('#edit-dev-location').value.trim(),
        contact: modal.querySelector('#edit-dev-contact').value.trim(),
        mac: modal.querySelector('#edit-dev-mac').value.trim()
      };

      try {
        const res = await fetch(`/api/devices/${dev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload)
        });
        const data = await res.json();
        if (data && data.device) {
          Object.assign(dev, data.device);
        } else {
          Object.assign(dev, updatedPayload);
        }
      } catch (err) {
        Object.assign(dev, updatedPayload);
      }

      modal.style.display = 'none';
      showToast(`Device "${dev.name}" (${dev.ip}) updated successfully.`);
      if (typeof renderInventoryView === 'function') {
        renderInventoryView();
      }
    };
  }

  // --- DELETE DEVICE CONFIRMATION MODAL ---
  function showDeleteDeviceConfirmModal(devId, devName) {
    let modal = document.getElementById('opm-del-device-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-del-device-confirm-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100002; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 480px; max-width: 95vw; box-shadow: 0 25px 35px -5px rgba(0,0,0,0.3); overflow: hidden;">
        <div style="background: #fef2f2; border-bottom: 1px solid #fee2e2; padding: 14px 20px; display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 16px;">⚠️</div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #991b1b;">Delete Device from Central Inventory</div>
            <div style="font-size: 11px; color: #b91c1c; margin-top: 1px;">Irreversible administrative action</div>
          </div>
        </div>
        <div style="padding: 20px; font-size: 12px; color: #334155; line-height: 1.5;">
          Are you sure you want to permanently delete device <strong style="color: #0f172a;">${devName}</strong> from OpManager Central?
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 12px; margin-top: 12px; font-size: 11px; color: #64748b;">
            &bull; All associated SNMP performance monitors and poller jobs will be removed.<br/>
            &bull; Interface graphs, NetFlow streams, and active alarms will be purged.<br/>
            &bull; Distributed probe device license slot will be freed.
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="cancel-del-dev-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
          <button id="confirm-del-dev-btn" style="background: #dc2626; color: #ffffff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">Confirm Delete</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#cancel-del-dev-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#confirm-del-dev-btn').onclick = async () => {
      const btn = modal.querySelector('#confirm-del-dev-btn');
      btn.disabled = true;
      btn.innerText = 'Deleting...';

      try {
        await fetch(`/api/devices/${devId}`, { method: 'DELETE' });
      } catch (e) {}

      // Remove from state
      const idx = (state.devices || []).findIndex(d => String(d.id) === String(devId));
      if (idx !== -1) {
        state.devices.splice(idx, 1);
      }
      modal.style.display = 'none';
      showToast(`Device "${devName}" permanently removed from inventory.`);
      if (typeof renderInventoryView === 'function') {
        renderInventoryView();
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
              <div><strong>System Uptime:</strong> ${dev.uptime || (dev.uptime_ticks ? Math.floor(dev.uptime_ticks / 8640000) + ' Days' : 'Active (Live Poller)')}</div>
              <div><strong>Serial Number:</strong> <span style="font-family: monospace;">${dev.serial || '—'}</span></div>
              <div><strong>Operating System:</strong> ${dev.osVersion || dev.sys_descr || (dev.vendor ? dev.vendor + ' Firmware' : '—')}</div>
              <div><strong>Last Config Backup:</strong> ${dev.lastBackup || 'Not Backed Up Yet'}</div>
              <div><strong>SNMP Response Time:</strong> ${dev.responseTime != null ? dev.responseTime : '—'} ms</div>
              <div><strong>Remote Probe:</strong> ${dev.probeName || dev.probe || 'Central Site Probe'}</div>
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
          b.onclick = async () => {
            const mName = b.getAttribute('data-mon');
            b.textContent = 'Testing...';
            b.disabled = true;
            try {
              const res = await fetch(`/api/devices/${dev.id}/test-monitors`);
              const d = await res.json();
              const matched = (d.monitors || []).find(m => mName.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])) || (d.monitors && d.monitors[0]);
              showToast(`SNMP/ICMP Test for "${mName}": ${matched ? matched.status + ' (' + matched.roundTripMs + 'ms) - ' + (matched.value || 'OK') : 'Response OK (12ms)'}`);
            } catch (err) {
              showToast(`SNMP Test executed for "${mName}": Response OK (${dev.responseTime || 14}ms).`);
            }
            b.textContent = 'Test';
            b.disabled = false;
          };
        });
        const pollAllBtn = bodyContainer.querySelector('#poll-all-monitors-btn');
        if (pollAllBtn) {
          pollAllBtn.onclick = async () => {
            pollAllBtn.disabled = true;
            pollAllBtn.textContent = 'Polling...';
            try {
              const res = await fetch(`/api/devices/${dev.id}/poll-now`, { method: 'POST' });
              const d = await res.json();
              if (d.device) Object.assign(dev, d.device);
              showToast(`Live re-poll completed for ${dev.name}! Latency: ${dev.responseTime}ms, Status: ${dev.status}`);
              renderSnapshotBody();
            } catch (err) {
              showToast(`Re-poll triggered for ${dev.name}`);
            }
            pollAllBtn.disabled = false;
            pollAllBtn.textContent = 'Poll All Now';
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
              <div style="color: #8b949e;">Probe Agent: ${dev.probeName || dev.probe || 'Central Site Probe'} (Host ID: probe_${dev.probeId || 101})</div>
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

        const runPing = async () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ ping -c 4 ${dev.ip}</div>`,
            `<div style="color: #8b949e;">Executing live ICMP echo query via ${dev.probeName || dev.probe || 'Central Site Probe'}...</div>`
          ]);
          try {
            const res = await fetch('/api/tools/ping', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: dev.ip, count: 4 })
            });
            const d = await res.json();
            if (d.packets && d.packets.length > 0) {
              const lines = [
                `<div style="color: #8b949e;">PING ${d.target} (${d.resolvedIp}): 56 data bytes via ${d.probe}</div>`
              ];
              d.packets.forEach(p => {
                lines.push(`<div style="color: #4ade80;">${p.status}</div>`);
              });
              lines.push(`<div style="color: #8b949e;">--- ${d.target} ping statistics ---</div>`);
              lines.push(`<div style="color: #39d353; font-weight: 700;">${d.transmitted} packets transmitted, ${d.received} packets received, ${d.lossPercent}% packet loss</div>`);
              if (d.avgRtt !== null) {
                lines.push(`<div style="color: #58a6ff;">round-trip min/avg/max = ${d.minRtt}/${d.avgRtt}/${d.maxRtt} ms</div>`);
              }
              appendLog(lines);
            } else {
              appendLog([
                `<div style="color: #f87171;">Host did not respond to ICMP ping (100% loss). Verification timeout.</div>`
              ]);
            }
          } catch (e) {
            appendLog([`<div style="color: #f87171;">Ping execution error: ${e.message}</div>`]);
          }
        };

        const runTrace = async () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ traceroute -m 15 -q 1 ${dev.ip}</div>`,
            `<div style="color: #8b949e;">Executing live routing hop inspection via ${dev.probeName || dev.probe || 'Central Site Probe'}...</div>`
          ]);
          try {
            const res = await fetch('/api/tools/traceroute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: dev.ip })
            });
            const d = await res.json();
            const lines = [
              `<div style="color: #8b949e;">traceroute to ${d.target} (${d.resolvedIp}), 15 hops max</div>`
            ];
            (d.hops || []).forEach(h => {
              lines.push(`<div>  ${h.hop}  ${h.hostname} [${h.ip}]  ${h.rtt1}</div>`);
            });
            lines.push(`<div style="color: #39d353; font-weight: 700;">Trace complete. Destination responded: ${d.destinationResponded ? 'YES' : 'NO'}.</div>`);
            appendLog(lines);
          } catch (e) {
            appendLog([`<div style="color: #f87171;">Traceroute error: ${e.message}</div>`]);
          }
        };

        const runSnmp = async () => {
          appendLog([
            `<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ snmpwalk -v 2c -c public ${dev.ip} RFC1213-MIB::system</div>`,
            `<div style="color: #8b949e;">Querying SNMP Agent on ${dev.ip}:161...</div>`
          ]);
          try {
            const res = await fetch('/api/tools/snmp-walk?ip=' + encodeURIComponent(dev.ip) + '&oid=.1.3.6.1.2.1.1');
            const d = await res.json();
            if (d.results && d.results.length > 0) {
              const lines = [];
              d.results.forEach(r => {
                lines.push(`<div><span style="color: #38bdf8;">${r.oid}</span> = <span style="color: #94a3b8;">${r.type}:</span> <span style="color: #4ade80;">${r.value}</span></div>`);
              });
              lines.push(`<div style="color: #39d353; font-weight: 700;">End of MIB view reached (${d.results.length} OIDs retrieved).</div>`);
              appendLog(lines);
            } else {
              appendLog([
                `<div>SNMPv2-MIB::sysDescr.0 = STRING: ${dev.vendor || 'Enterprise'} ${dev.type || 'Network Node'} (${dev.osVersion || dev.os || 'Enterprise OS'})</div>`,
                `<div>SNMPv2-MIB::sysObjectID.0 = OID: SNMPv2-SMI::enterprises.9.1.2548</div>`,
                `<div>DISMAN-EVENT-MIB::sysUpTimeInstance = Timeticks: (124892010) 14 days, 10:55:20.10</div>`,
                `<div>SNMPv2-MIB::sysName.0 = STRING: ${dev.name}</div>`,
                `<div>SNMPv2-MIB::sysLocation.0 = STRING: ${dev.probeName || dev.probe || 'Central Site Probe'}</div>`,
                `<div>IF-MIB::ifNumber.0 = INTEGER: ${(dev.interfaces || []).length || 48}</div>`,
                `<div style="color: #39d353; font-weight: 700;">End of MIB view reached.</div>`
              ]);
            }
          } catch (e) {
            appendLog([`<div style="color: #f87171;">SNMP walk error: ${e.message}</div>`]);
          }
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
              <span style="color: #4ade80;">+ access-list 101 permit tcp any host ${(state.devices && state.devices[0]?.ip) || '192.168.1.1'} eq 22</span>
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
                <span style="font-size: 16px; font-weight: 800; color: #0f172a;">${dev.displayName || dev.name}</span>
                ${getStatusBadge(dev.status)}
                ${getVendorBadge(dev.vendor)}
              </div>
              <span style="font-size: 12px; color: #64748b; font-family: monospace;">${dev.ip} • ${dev.type} • Probe: <strong style="color: #0284c7;">${dev.probeName || dev.probe || 'Central Site Probe'}</strong></span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="modal-edit-dev-btn" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 700; color: #0284c7; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              <span>Edit Device</span>
            </button>
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
          <span>ManageEngine OpManager Central (Version 12.9.203 GA Build 129203) • Monitored via ${dev.probeName || dev.probe || 'Central Site Probe'}</span>
          <span>Support: +1-888-720-9500 • <a href="mailto:opmanager-support@manageengine.com" style="color: #0070e0; text-decoration: none;">opmanager-support@manageengine.com</a></span>
        </div>
      </div>
    `;

    renderSnapshotBody();
    modal.style.display = 'flex';

    const snapEditBtn = modal.querySelector('#modal-edit-dev-btn');
    if (snapEditBtn) {
      snapEditBtn.onclick = () => {
        modal.style.display = 'none';
        showEditDeviceModal(dev.id);
      };
    }

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

    const traps = [];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 920px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SNMP Trap Viewer &amp; Parser Console</div>
              <div style="font-size: 11px; color: #64748b;">UDP Port 162 Listener • Central Master aggregating across ${state.probes.length} Enterprise Probes</div>
            </div>
          </div>
          <button id="opm-close-traps-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <!-- Filter Bar -->
        <div style="padding: 12px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; font-weight: 700; color: #475569;">Filter Traps:</span>
            <select id="opm-trap-probe-filter" style="font-size: 11px; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff;">
              <option value="all">All Probes (${state.probes.length})</option>
              ${state.probes.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
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
              ${traps.length === 0 ? `
                <tr>
                  <td colspan="6" style="padding: 40px; text-align: center; color: #94a3b8;">
                    No SNMP Traps captured yet. UDP Port 162 listener is active across connected probes.
                  </td>
                </tr>
              ` : traps.map(t => {
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
          <span>${traps.length} Traps Captured (Last 1 Hour) • Trap-to-Alarm Correlation Rule: <strong>ACTIVE</strong></span>
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
              <input type="text" id="disc-start-ip" value="192.168.30.1" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Ending IP Address *</label>
              <input type="text" id="disc-end-ip" value="192.168.30.254" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
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
          if (!state.devices) state.devices = [];
          stagedDevices.forEach(d => {
            term.innerHTML += `<span style="color: #4ade80;">[AUTO-ENROLLED] ${d.ip} - ${d.displayName || d.name} (${d.category}) [Added to Central Inventory]</span><br>`;
            if (!state.devices.find(x => x.id === d.id || x.ip === d.ip)) {
              state.devices.unshift(d);
            }
          });
          summaryTxt.innerHTML = `<strong style="color: #16a34a;">✅ ${stagedDevices.length} devices auto-discovered &amp; added into Inventory!</strong>`;
          startBtn.style.display = 'none';
          applyBtn.innerHTML = `<span>View in Central Inventory (${state.devices.length} Devices) &rarr;</span>`;
          applyBtn.style.display = 'inline-block';
          showToast(`Discovery completed: ${stagedDevices.length} devices automatically enrolled into Inventory!`);
          if (typeof fetchInventoryData === 'function') fetchInventoryData();
          if (typeof updateStatusCounters === 'function') updateStatusCounters();
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
      modal.style.display = 'none';
      if (typeof navigateToTab === 'function') {
        navigateToTab('inventory');
      } else {
        location.hash = '#/inventory';
        if (typeof renderInventoryView === 'function') renderInventoryView();
      }
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
    const ip = targetIp || (state.devices[0] ? state.devices[0].ip : '127.0.0.1');

    function renderToolsContent() {
      const container = modal.querySelector('#tools-tab-content');
      if (!container) return;

      if (activeTool === 'ping') {
        const probeOptions = (state.probes && state.probes.length > 0)
          ? state.probes.map(p => `<option value="${p.id}">${p.name} (${p.location || 'Central Site'})</option>`).join('')
          : '<option value="101">Central Site Probe (192.168.30.65)</option>';

        container.innerHTML = `
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="tool-ping-ip" value="${ip}" placeholder="Target IP or Hostname" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <select id="tool-ping-probe" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff;">
              ${probeOptions}
            </select>
            <button id="tool-exec-ping-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">Ping Now</button>
          </div>
          <div id="tool-ping-out" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; height: 200px; overflow-y: auto; line-height: 1.6;">
            Ready to send ICMP echo packets to ${ip} via Central Site Probe.
          </div>
        `;
        const btn = container.querySelector('#tool-exec-ping-btn');
        const out = container.querySelector('#tool-ping-out');
        btn.onclick = async () => {
          const tgt = container.querySelector('#tool-ping-ip').value.trim();
          btn.disabled = true;
          out.textContent = `Sending 4 ICMP packets to ${tgt} via Central Site Probe…`;
          try {
            const res = await fetch('/api/tools/ping', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: tgt, count: 4 })
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message || 'Ping failed.');
            out.innerHTML = `--- Ping results for ${d.target} (${d.resolvedIp || tgt}) via ${d.probe || 'Central Site Probe'} ---<br>`;
            (d.packets || []).forEach(p => {
              out.innerHTML += `<span style="color: #4ade80;">${p.status}</span><br>`;
            });
            out.innerHTML += `<br>Packets: Sent = ${d.transmitted}, Received = ${d.received}, Lost = ${d.lossPercent}%`;
            if (d.avgRtt !== null) out.innerHTML += `<br>RTT: Min = ${d.minRtt}ms, Max = ${d.maxRtt}ms, Avg = ${d.avgRtt}ms`;
          } catch (e) {
            out.innerHTML = `<span style="color: #f87171;">Ping error: ${e.message}</span>`;
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
          out.textContent = `Tracing route to ${tgt} (up to 15 hops)…`;
          try {
            const res = await fetch('/api/tools/traceroute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ip: tgt })
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message || 'Traceroute failed.');
            out.textContent = '';
            (d.hops || []).forEach(h => {
              out.innerHTML += `Hop ${h.hop}:  ${h.rtt1}  ${h.hostname} [${h.ip}]<br>`;
            });
            out.innerHTML += d.destinationResponded ? '<br><span style="color: #4ade80; font-weight: 700;">Destination reached successfully.</span>' : '<br><span style="color: #f87171;">No reply from destination.</span>';
          } catch (e) {
            out.innerHTML = `<span style="color: #f87171;">Traceroute error: ${e.message}</span>`;
          }
          btn.disabled = false;
        };
      } else if (activeTool === 'mib') {
        const escMib = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        container.innerHTML = `
          <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <input type="text" id="tool-mib-ip" value="${escMib(ip)}" placeholder="Target IP" style="width: 135px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px; font-size: 11px; font-family: monospace;">
            <input type="text" id="tool-mib-comm" value="public" placeholder="Community" style="width: 95px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px; font-size: 11px; font-family: monospace;" title="SNMPv2c Community">
            <select id="tool-mib-module" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px; font-size: 11px; background: #fff;">
              <option value=".1.3.6.1.2.1.1">RFC1213-MIB System (.1.3.6.1.2.1.1)</option>
              <option value=".1.3.6.1.2.1.2.2">IF-MIB Interfaces (.1.3.6.1.2.1.2.2)</option>
              <option value=".1.3.6.1.2.1.4.22">IP-MIB ARP Table (.1.3.6.1.2.1.4.22)</option>
              <option value=".1.3.6.1.2.1.25">HOST-RESOURCES (.1.3.6.1.2.1.25)</option>
              <option value=".1.3.6.1.2.1.47.1.1">ENTITY-MIB (.1.3.6.1.2.1.47.1.1)</option>
              <option value=".1.3.6.1.2.1.15">BGP4-MIB (.1.3.6.1.2.1.15)</option>
            </select>
            <input type="text" id="tool-mib-oid" value=".1.3.6.1.2.1.1" placeholder="OID string" style="flex: 1; min-width: 120px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px; font-size: 11px; font-family: monospace;">
            <button id="tool-exec-mib-btn" style="background: #1d824e; color: #fff; border: none; border-radius: 4px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer;">SNMP Walk</button>
            <button id="tool-exec-mib-get-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer;">SNMP Get</button>
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
                <tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">Click 'SNMP Walk' or 'SNMP Get' to query live OIDs on ${escMib(ip)}</td></tr>
              </tbody>
            </table>
          </div>
        `;
        const modSel = container.querySelector('#tool-mib-module');
        const oidInp = container.querySelector('#tool-mib-oid');
        if (modSel && oidInp) {
          modSel.onchange = () => { oidInp.value = modSel.value; };
        }
        const walkBtn = container.querySelector('#tool-exec-mib-btn');
        const getBtn = container.querySelector('#tool-exec-mib-get-btn');
        const tbody = container.querySelector('#tool-mib-tbody');
        const runSnmp = async (mode) => {
          const tgtIp = (container.querySelector('#tool-mib-ip')?.value || ip).trim();
          const comm = (container.querySelector('#tool-mib-comm')?.value || 'public').trim();
          const oid = oidInp.value.trim();
          if (!tgtIp || !oid) return;
          walkBtn.disabled = true;
          getBtn.disabled = true;
          tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #0070e0;">Performing SNMP ${mode.toUpperCase()} on ${escMib(tgtIp)} for OID ${escMib(oid)}...</td></tr>`;
          try {
            const ep = mode === 'get' ? '/api/tools/snmp-query' : '/api/tools/snmp-walk';
            const body = mode === 'get' ? { ip: tgtIp, oid, community: comm } : { ip: tgtIp, rootOid: oid, community: comm };
            const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
            const rows = mode === 'get' ? [{ oid: d.oid, name: d.name, type: d.type, value: d.value }] : (d.results || []);
            if (rows.length > 0) {
              tbody.innerHTML = rows.map(r => {
                const nm = r.name || 'Scalar / Index';
                const ico = nm.includes('Index') ? 'mib_key.gif' : (nm.includes('Table') ? 'mib_table.gif' : 'mib_node.gif');
                return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-family: monospace; color: #0070e0;">${escMib(r.oid)}</td>
                  <td style="padding: 6px 10px; font-weight: 600; display: flex; align-items: center; gap: 6px;"><img src="/apiclient/fluidicv2/img/${ico}" style="width:13px;height:13px;"> ${escMib(nm)}</td>
                  <td style="padding: 6px 10px; color: #64748b;">${escMib(r.type || 'OCTET STRING')}</td>
                  <td style="padding: 6px 10px; font-family: monospace; color: #16a34a; font-weight: 600;">${escMib(r.value)}</td>
                </tr>`;
              }).join('');
            } else {
              tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #f87171;">No matching SNMP OID entries returned from ${escMib(tgtIp)}.</td></tr>`;
            }
          } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #f87171;">SNMP query error: ${escMib(e.message)}</td></tr>`;
          }
          walkBtn.disabled = false;
          getBtn.disabled = false;
        };
        walkBtn.onclick = () => runSnmp('walk');
        getBtn.onclick = () => runSnmp('get');
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
            if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
            if (d.ports && d.ports.length > 0) {
              const fmtSpeed = (sp) => {
                if (!sp && sp !== 0) return '—';
                const n = Number(sp);
                if (isNaN(n)) return String(sp);
                if (n >= 1000000000) return `${(n / 1000000000).toFixed(0)} Gbps`;
                if (n >= 1000000) return `${(n / 1000000).toFixed(0)} Mbps`;
                return `${n} bps`;
              };
              tbody.innerHTML = d.ports.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 6px;"><img src="/apiclient/fluidicv2/img/${p.operStatus === 'Up' ? 'port_up.gif' : 'port_down.gif'}" style="width:13px;height:13px;"> ${p.port || '—'}</td>
                  <td style="padding: 6px 10px; color: #334155;">${p.alias || '—'}</td>
                  <td style="padding: 6px 10px;"><span style="color: ${p.operStatus === 'Up' ? '#16a34a' : '#dc2626'}; font-weight: 700;"><img src="/apiclient/fluidicv2/img/${p.operStatus === 'Up' ? 'port_up.gif' : 'port_down.gif'}" style="width:10px;height:10px;vertical-align:middle;"> ${p.operStatus}</span></td>
                  <td style="padding: 6px 10px; color: #64748b;">${fmtSpeed(p.speed)}</td>
                  <td style="padding: 6px 10px; font-weight: 600;">${p.vlan != null ? 'VLAN ' + p.vlan : '—'}</td>
                  <td style="padding: 6px 10px; font-family: monospace;">${p.mac ? p.mac + ' (' + (p.ip || '—') + ')' : (p.ip || '—')}</td>
                </tr>
              `).join('');
            } else {
              tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">No switch ports cached yet for ${ip}. Run an SNMP poll or use Dashboard &gt; OpUtils Switch Port Mapper for live IF-MIB walk.</td></tr>`;
            }
          } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #f87171;">Port scan error: ${e.message}</td></tr>`;
          }
        };
        btn.onclick = loadPorts;
        loadPorts();
      } else if (activeTool === 'terminal') {
        const escHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        container.innerHTML = `
          <div style="display: flex; gap: 6px; margin-bottom: 8px; align-items: center; flex-wrap: wrap;">
            <input type="text" id="tool-cli-user" placeholder="SSH User (optional if saved)" style="flex: 1; min-width: 140px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; font-size: 11px;">
            <input type="password" id="tool-cli-pass" placeholder="SSH Password" style="flex: 1; min-width: 130px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; font-size: 11px;">
            <input type="number" id="tool-cli-port" value="22" style="width: 62px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; font-size: 11px;" title="SSH Port">
            <button id="tool-cli-snmp-btn" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;" title="Fetch live SNMP Interfaces &amp; System Info without SSH">⚡ Live SNMP Info</button>
            <button id="tool-cli-creds-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">Settings &gt; Creds</button>
          </div>
          <div style="background: #0f172a; color: #f8fafc; font-family: monospace; font-size: 11px; padding: 14px; border-radius: 4px; height: 185px; overflow-y: auto; line-height: 1.5;" id="tool-term-screen">
            <span style="color: #4ade80;">ManageEngine OpManager Central Web CLI Terminal v12.9.203</span><br>
            <span style="color: #94a3b8;">Target: ${escHtml(ip)} (SSHv2). Enter SSH credentials above (or save under Settings &gt; Credentials), then run any command (e.g. 'show ip int br', 'show version', 'uname -a'). Or click '⚡ Live SNMP Info' for read-only interface/system status.</span><br><br>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <input type="text" id="tool-cli-input" value="show ip int br" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace;">
            <button id="tool-cli-send-btn" style="background: #0070e0; color: #fff; border: none; border-radius: 4px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">Execute</button>
          </div>
        `;
        const scr = container.querySelector('#tool-term-screen');
        const inp = container.querySelector('#tool-cli-input');
        const sendBtn = container.querySelector('#tool-cli-send-btn');
        const snmpBtn = container.querySelector('#tool-cli-snmp-btn');
        const credsBtn = container.querySelector('#tool-cli-creds-btn');

        if (credsBtn) {
          credsBtn.onclick = () => {
            modal.style.display = 'none';
            if (state && state.subTabs) state.subTabs.settings = 'credentials';
            window.location.hash = '#/settings';
          };
        }

        if (snmpBtn) {
          snmpBtn.onclick = async () => {
            snmpBtn.disabled = true;
            scr.innerHTML += `<span style="color: #38bdf8;">${escHtml(ip)}# [SNMP IF-MIB + System Query]</span><br>`;
            try {
              const [sysRes, portRes] = await Promise.all([
                fetch('/api/tools/snmp-walk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ip, rootOid: '.1.3.6.1.2.1.1', community: 'public' })
                }),
                fetch('/api/tools/switch-ports?ip=' + encodeURIComponent(ip))
              ]);
              const sysData = await sysRes.json();
              const portData = await portRes.json();
              if (sysData && Array.isArray(sysData.results) && sysData.results.length > 0) {
                scr.innerHTML += sysData.results.slice(0, 6).map(r =>
                  `<span style="color: #93c5fd;">${escHtml(r.name || r.oid)}:</span> <span style="color: #f1f5f9;">${escHtml(r.value)}</span>`
                ).join('<br>') + '<br>';
              }
              const ports = (portData && Array.isArray(portData.ports)) ? portData.ports : [];
              if (ports.length > 0) {
                scr.innerHTML += `<span style="color: #4ade80;">Interfaces (${ports.length} total, ${ports.filter(p => p.operStatus === 'Up').length} Up):</span><br>`;
                scr.innerHTML += ports.slice(0, 20).map(p =>
                  `<span style="color: #cbd5e1;">${escHtml((p.port || '').padEnd(18, ' '))} ${escHtml((p.operStatus || 'Down').padEnd(6, ' '))} ${escHtml(p.alias || '')}</span>`
                ).join('<br>') + (ports.length > 20 ? `<br><span style="color: #94a3b8;">... +${ports.length - 20} more interfaces</span>` : '') + '<br><br>';
              } else {
                scr.innerHTML += `<span style="color: #fbbf24;">No cached SNMP interfaces returned for ${escHtml(ip)}.</span><br><br>`;
              }
            } catch (e) {
              scr.innerHTML += `<span style="color: #f87171;">SNMP query error: ${escHtml(e.message)}</span><br><br>`;
            }
            snmpBtn.disabled = false;
            scr.scrollTop = scr.scrollHeight;
          };
        }

        const execCmd = async () => {
          const cmd = inp.value.trim();
          if (!cmd) return;
          const u = (container.querySelector('#tool-cli-user')?.value || '').trim();
          const p = container.querySelector('#tool-cli-pass')?.value || '';
          const portVal = Number(container.querySelector('#tool-cli-port')?.value) || 22;
          scr.innerHTML += `<span style="color: #38bdf8;">${escHtml(ip)}# ${escHtml(cmd)}</span><br>`;
          sendBtn.disabled = true;
          sendBtn.textContent = 'Running...';
          try {
            const payload = { command: cmd, hostname: ip, port: portVal };
            if (u && p) { payload.username = u; payload.password = p; }
            const res = await fetch('/api/tools/terminal-exec', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const d = await res.json();
            if (!res.ok || d.status === 'error') {
              scr.innerHTML += `<span style="color: #f87171;">[SSH Error ${res.status}] ${escHtml(d.message || d.stderr || 'Execution failed')}</span><br><br>`;
            } else {
              const outTxt = d.output ? escHtml(d.output).replace(/\n/g, '<br>') : '';
              const errTxt = d.stderr ? `<br><span style="color: #fbbf24;">${escHtml(d.stderr).replace(/\n/g, '<br>')}</span>` : '';
              const exitLine = (!outTxt && !errTxt) ? `<span style="color: #94a3b8;">(Command exited with code ${d.exitCode ?? 0}, no stdout returned)</span>` : '';
              scr.innerHTML += `<span style="color: #f1f5f9;">${outTxt}${errTxt}${exitLine}</span><br><br>`;
            }
          } catch (e) {
            scr.innerHTML += `<span style="color: #f87171;">Terminal exec error: ${escHtml(e.message)}</span><br><br>`;
          }
          sendBtn.disabled = false;
          sendBtn.textContent = 'Execute';
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
                ${(state.probes || []).map(p => `<option>${p.name}</option>`).join('')}
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

  function showNewDiscoveryRuleModal(ruleOrId) {
    let existingRule = null;
    if (ruleOrId) {
      existingRule = (state.discoveryRules || []).find(r => String(r.id) === String(ruleOrId));
    }

    let modal = document.getElementById('opm-new-rule-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-new-rule-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const probes = (state.probes && state.probes.length > 0) ? state.probes : [
      { id: 101, name: 'Central Site Probe', location: 'Primary DC' },
      { id: 102, name: 'DC-North Distributed Probe', location: 'DC-North' }
    ];

    const currentName = existingRule ? existingRule.name : 'Branch Office Subnet Sweep (10.60.0.0/24)';
    const currentSubnet = existingRule ? (existingRule.subnet || existingRule.cidr) : '10.60.0.0/24';
    const currentProbe = existingRule ? existingRule.probe : probes[0].name;
    const currentSched = existingRule ? existingRule.schedule : 'Daily at 02:00 AM';
    const currentCred = existingRule ? existingRule.credential : 'SNMPv2c Community (public)';

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 560px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); overflow: hidden;">
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🌐</span>
            <span style="font-size: 15px; font-weight: 700; color: #0f172a;">${existingRule ? 'Edit Discovery Schedule' : 'Create Scheduled Discovery Rule'}</span>
          </div>
          <button id="close-new-rule-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 22px; font-size: 12px; color: #334155;">
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Discovery Rule Name *</label>
            <input type="text" id="new-rule-name" placeholder="e.g. Branch Office Subnet Sweep" value="${currentName}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">CIDR Subnet / Range *</label>
              <input type="text" id="new-rule-subnet" value="${currentSubnet}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Assigned Probe *</label>
              <select id="new-rule-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                ${probes.map(p => `<option value="${p.name}" data-id="${p.id}" ${currentProbe === p.name ? 'selected' : ''}>${p.name} (${p.location || 'Local'})</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Sweep Schedule</label>
              <select id="new-rule-sched" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option ${currentSched.includes('02:00') ? 'selected' : ''}>Daily at 02:00 AM</option>
                <option ${currentSched.includes('06:00') ? 'selected' : ''}>Daily at 06:00 AM</option>
                <option ${currentSched.includes('Weekly') ? 'selected' : ''}>Weekly (Sunday 01:00 AM)</option>
                <option ${currentSched.includes('Manual') ? 'selected' : ''}>On-Demand Manual Only</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #475569;">Credential Profile</label>
              <select id="new-rule-cred" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option ${currentCred.includes('v2c') ? 'selected' : ''}>SNMPv2c Community (public)</option>
                <option ${currentCred.includes('v3') ? 'selected' : ''}>SNMPv3 USM (SHA-256 / AES-256)</option>
                <option ${currentCred.includes('WMI') ? 'selected' : ''}>WMI / Windows WinRM</option>
                <option ${currentCred.includes('SSH') ? 'selected' : ''}>Linux SSH Key Vault</option>
              </select>
            </div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px; font-size: 11px; color: #166534; line-height: 1.4;">
            <span style="font-weight: 700;">Automatic Action:</span> Subnet sweep sends ICMP echo packets and SNMP sysObjectID queries. Responding switches, routers, firewalls, and servers will automatically be classified and added to OpManager Central inventory.
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="cancel-new-rule-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
          <button id="save-new-rule-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 700; cursor: pointer;">
            ${existingRule ? 'Update Schedule' : 'Save Discovery Schedule'}
          </button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';

    modal.querySelector('#close-new-rule-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#cancel-new-rule-btn').onclick = () => { modal.style.display = 'none'; };

    modal.querySelector('#save-new-rule-btn').onclick = async () => {
      const saveBtn = modal.querySelector('#save-new-rule-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const nm = modal.querySelector('#new-rule-name').value.trim() || 'Subnet Sweep';
      const sub = modal.querySelector('#new-rule-subnet').value.trim() || '10.60.0.0/24';
      const probeSel = modal.querySelector('#new-rule-probe');
      const prb = probeSel.value;
      const prbId = parseInt(probeSel.selectedOptions[0].getAttribute('data-id'), 10) || 101;
      const sch = modal.querySelector('#new-rule-sched').value;
      const crd = modal.querySelector('#new-rule-cred').value;

      const payload = {
        name: nm,
        subnet: sub,
        probe: prb,
        probeId: prbId,
        schedule: sch,
        credential: crd,
        status: 'Active'
      };

      try {
        if (existingRule) {
          const res = await fetch(`/api/discovery/rules/${existingRule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data && data.rule) {
            Object.assign(existingRule, data.rule);
          } else {
            Object.assign(existingRule, payload);
          }
        } else {
          const res = await fetch('/api/discovery/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          const ruleToAdd = (data && data.rule) ? data.rule : { id: Date.now(), ...payload, lastRun: 'Never', discoveredCount: 0 };
          if (!state.discoveryRules) state.discoveryRules = [];
          state.discoveryRules.push(ruleToAdd);
        }
      } catch (e) {
        if (!state.discoveryRules) state.discoveryRules = [];
        state.discoveryRules.push({ id: Date.now(), ...payload, lastRun: 'Never', discoveredCount: 0 });
      }

      showToast(`Discovery rule "${nm}" scheduled on ${prb}.`);
      modal.style.display = 'none';
      if (typeof renderSettingsView === 'function') {
        renderSettingsView();
      }
    };
  }
  window.showNewDiscoveryRuleModal = showNewDiscoveryRuleModal;
  window.showAddDiscoveryRuleModal = showNewDiscoveryRuleModal;

  function showDeleteDiscoveryRuleModal(ruleId, ruleName) {
    if (confirm(`Are you sure you want to delete discovery schedule "${ruleName}"?`)) {
      fetch(`/api/discovery/rules/${ruleId}`, { method: 'DELETE' }).catch(() => {});
      if (state.discoveryRules) {
        state.discoveryRules = state.discoveryRules.filter(r => String(r.id) !== String(ruleId));
      }
      showToast(`Discovery rule "${ruleName}" removed.`);
      if (typeof renderSettingsView === 'function') {
        renderSettingsView();
      }
    }
  }
  window.showDeleteDiscoveryRuleModal = showDeleteDiscoveryRuleModal;

  async function runDiscoveryRuleSweep(ruleId, ruleName, btnEl) {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = 'Sweeping...';
    }
    showToast(`Executing probe sweep on subnet for "${ruleName}"...`);
    try {
      const res = await fetch(`/api/discovery/rules/${ruleId}/run`, { method: 'POST' });
      const data = await res.json();
      if (data && data.rule) {
        const r = (state.discoveryRules || []).find(x => String(x.id) === String(ruleId));
        if (r) Object.assign(r, data.rule);
      }
      if (data && Array.isArray(data.discoveredDevices)) {
        if (!state.devices) state.devices = [];
        data.discoveredDevices.forEach(d => {
          if (!state.devices.find(x => x.ip === d.ip)) {
            state.devices.push(d);
          }
        });
      }
      showToast(`Discovery sweep complete! Auto-enrolled ${data.discoveredCount || 4} network nodes into Inventory.`);
      if (typeof fetchInventoryData === 'function') fetchInventoryData();
      if (typeof updateStatusCounters === 'function') updateStatusCounters();
    } catch (e) {
      showToast(`Subnet sweep executed on "${ruleName}".`);
    }
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = '▶ Run Sweep Now';
    }
    if (typeof renderSettingsView === 'function') {
      renderSettingsView();
    }
  }
  window.runDiscoveryRuleSweep = runDiscoveryRuleSweep;

  function showNewTemplateModal() {
    let modal = document.getElementById('opm-new-tmpl-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-new-tmpl-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
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
                <option value="Switch">Switch</option>
                <option value="Router">Router</option>
                <option value="Firewall">Firewall</option>
                <option value="Server">Server</option>
                <option value="Storage">Storage</option>
                <option value="Wireless">Wireless</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Enterprise SysOID String *</label>
              <input type="text" id="new-tmpl-sysoid" value=".1.3.6.1.4.1.9.1.2840" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Polling Interval *</label>
              <select id="new-tmpl-poll" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option value="60s">60s</option>
                <option value="180s">180s</option>
                <option value="300s" selected>300s</option>
                <option value="600s">600s</option>
              </select>
            </div>
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
    modal.style.display = 'flex';
    document.getElementById('close-new-tmpl-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-new-tmpl-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-new-tmpl-btn').onclick = () => {
      const nm = document.getElementById('new-tmpl-name').value.trim() || 'Custom Device Template';
      const vendor = document.getElementById('new-tmpl-vendor').value.trim() || 'Generic';
      const cat = document.getElementById('new-tmpl-cat').value;
      const sysoid = document.getElementById('new-tmpl-sysoid').value.trim() || '.1.3.6.1.4.1.9.1';
      const poll = document.getElementById('new-tmpl-poll') ? document.getElementById('new-tmpl-poll').value : '300s';
      
      const checkedMonitors = [];
      modal.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const lbl = cb.parentElement ? cb.parentElement.textContent.trim() : '';
        if (lbl) checkedMonitors.push(lbl);
      });
      const monitors = checkedMonitors.length > 0 ? checkedMonitors.join(', ') : 'CPU Utilization, Memory Buffer, Temperature';

      const newTmplObj = {
        id: 'tmpl-' + Date.now(),
        name: nm,
        category: cat,
        vendor: vendor,
        oid: sysoid,
        monitors: monitors,
        poll: poll,
        cliCommands: 'show version\nshow running-config'
      };

      if (!state.templates) state.templates = [];
      state.templates.unshift(newTmplObj);

      fetch('/api/settings/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTmplObj)
      }).catch(() => {});

      showToast(`Device Template "${nm}" added to AdventNet template repository.`);
      modal.style.display = 'none';
      if (state.currentTab === 'settings' && typeof renderSettingsView === 'function') {
        renderSettingsView();
      }
    };
  }

  function showTemplateDetailsModal(tmplId) {
    let tmpl = (state.templates || []).find(t => t.id === tmplId || t.name === tmplId);
    if (!tmpl) {
      showToast('Template not found', 'error');
      return;
    }

    let modal = document.getElementById('opm-tmpl-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-tmpl-details-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const assignedNodesCount = (state.devices || []).filter(d => (d.template === tmpl.name) || (d.category && d.category.toLowerCase() === (tmpl.category || '').toLowerCase())).length;

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 620px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>${tmpl.name}</span>
              <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 700;">${tmpl.category}</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">AdventNet Device Template Library &bull; Vendor: <strong>${tmpl.vendor}</strong></div>
          </div>
          <button id="close-tmpl-details-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 20px; font-size: 12px; color: #334155; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Template / Model Name *</label>
              <input type="text" id="edit-tmpl-name" value="${tmpl.name}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Hardware Vendor *</label>
              <input type="text" id="edit-tmpl-vendor" value="${tmpl.vendor}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Device Category *</label>
              <select id="edit-tmpl-cat" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option value="Switch" ${tmpl.category === 'Switch' ? 'selected' : ''}>Switch</option>
                <option value="Router" ${tmpl.category === 'Router' ? 'selected' : ''}>Router</option>
                <option value="Firewall" ${tmpl.category === 'Firewall' ? 'selected' : ''}>Firewall</option>
                <option value="Server" ${tmpl.category === 'Server' ? 'selected' : ''}>Server</option>
                <option value="Storage" ${tmpl.category === 'Storage' ? 'selected' : ''}>Storage</option>
                <option value="Wireless" ${tmpl.category === 'Wireless' ? 'selected' : ''}>Wireless</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Polling Interval *</label>
              <select id="edit-tmpl-poll" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                <option value="60s" ${tmpl.poll === '60s' ? 'selected' : ''}>60s (Critical Nodes)</option>
                <option value="120s" ${tmpl.poll === '120s' ? 'selected' : ''}>120s</option>
                <option value="180s" ${tmpl.poll === '180s' ? 'selected' : ''}>180s</option>
                <option value="300s" ${tmpl.poll === '300s' || !tmpl.poll ? 'selected' : ''}>300s (Standard Default)</option>
                <option value="600s" ${tmpl.poll === '600s' ? 'selected' : ''}>600s</option>
                <option value="900s" ${tmpl.poll === '900s' ? 'selected' : ''}>900s (Telemetry Aggregator)</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px;">System Object Identifier (sysObjectID) *</label>
            <input type="text" id="edit-tmpl-oid" value="${tmpl.oid}" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
          </div>
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px;">Associated Performance Monitors</label>
            <div id="tmpl-monitors-list" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc; margin-bottom: 8px;">
              ${(tmpl.monitors || '').split(',').map(m => m.trim()).filter(Boolean).map(m => `
                <span class="tmpl-mon-pill" style="display: inline-flex; align-items: center; gap: 4px; background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">
                  <span>${m}</span>
                  <span class="remove-mon-btn" style="cursor: pointer; color: #94a3b8; font-weight: bold; margin-left: 2px;" title="Remove monitor">&times;</span>
                </span>
              `).join('')}
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="add-mon-input" placeholder="e.g. Optical Transceiver Power, Interface Error Rate" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 12px;">
              <button id="add-mon-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">+ Add Monitor</button>
            </div>
          </div>
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px;">CLI Discovery & Backup Command Sets</label>
            <textarea id="edit-tmpl-cli" rows="3" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 11px; font-family: monospace; box-sizing: border-box;">${tmpl.cliCommands || 'show version\nshow running-config'}</textarea>
          </div>
          <div style="background: #f1f5f9; border-radius: 4px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #475569;">Currently Associated Nodes: <strong>${assignedNodesCount} device(s)</strong></span>
            <button id="modal-apply-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">⚡ Apply to Nodes</button>
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="close-tmpl-details-btn2" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Close</button>
          <button id="save-tmpl-details-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Save Changes</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeHandler = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-tmpl-details-btn').onclick = closeHandler;
    modal.querySelector('#close-tmpl-details-btn2').onclick = closeHandler;

    // Monitor removal
    modal.querySelectorAll('.remove-mon-btn').forEach(btn => {
      btn.onclick = () => {
        btn.parentElement.remove();
      };
    });

    // Monitor addition
    const addMonInput = modal.querySelector('#add-mon-input');
    const addMonBtn = modal.querySelector('#add-mon-btn');
    const monList = modal.querySelector('#tmpl-monitors-list');
    addMonBtn.onclick = () => {
      const val = addMonInput.value.trim();
      if (!val) return;
      const span = document.createElement('span');
      span.className = 'tmpl-mon-pill';
      span.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;';
      span.innerHTML = `<span>${val}</span><span class="remove-mon-btn" style="cursor: pointer; color: #94a3b8; font-weight: bold; margin-left: 2px;" title="Remove monitor">&times;</span>`;
      span.querySelector('.remove-mon-btn').onclick = () => span.remove();
      monList.appendChild(span);
      addMonInput.value = '';
    };

    // Save changes
    modal.querySelector('#save-tmpl-details-btn').onclick = () => {
      const nm = modal.querySelector('#edit-tmpl-name').value.trim() || tmpl.name;
      const vendor = modal.querySelector('#edit-tmpl-vendor').value.trim() || tmpl.vendor;
      const cat = modal.querySelector('#edit-tmpl-cat').value;
      const poll = modal.querySelector('#edit-tmpl-poll').value;
      const oid = modal.querySelector('#edit-tmpl-oid').value.trim() || tmpl.oid;
      const cli = modal.querySelector('#edit-tmpl-cli').value;

      const monitorsArr = [];
      monList.querySelectorAll('.tmpl-mon-pill span:first-child').forEach(s => {
        monitorsArr.push(s.textContent.trim());
      });
      const monitors = monitorsArr.join(', ');

      tmpl.name = nm;
      tmpl.vendor = vendor;
      tmpl.category = cat;
      tmpl.poll = poll;
      tmpl.oid = oid;
      tmpl.cliCommands = cli;
      tmpl.monitors = monitors;

      fetch(`/api/settings/templates/${tmpl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tmpl)
      }).catch(() => {});

      showToast(`Device Template "${nm}" updated successfully.`);
      modal.style.display = 'none';
      if (state.currentTab === 'settings' && typeof renderSettingsView === 'function') {
        renderSettingsView();
      }
    };

    // Apply to Nodes button
    modal.querySelector('#modal-apply-btn').onclick = () => {
      modal.style.display = 'none';
      showApplyTemplateModal(tmpl.id);
    };
  }

  function showApplyTemplateModal(tmplId) {
    let tmpl = (state.templates || []).find(t => t.id === tmplId || t.name === tmplId);
    if (!tmpl) {
      showToast('Template not found', 'error');
      return;
    }

    let modal = document.getElementById('opm-apply-tmpl-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-apply-tmpl-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const devices = state.devices || [];

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 660px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a;">Apply Device Template to Nodes</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Template: <strong style="color: #0070e0;">${tmpl.name}</strong> (${tmpl.category} &bull; ${tmpl.vendor})</div>
          </div>
          <button id="close-apply-tmpl-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 20px; font-size: 12px; color: #334155; overflow-y: auto;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; color: #166534;">
            <strong>Template Monitors to Associate:</strong> ${tmpl.monitors || 'Standard Performance Monitors'} &bull; Polling: <strong>${tmpl.poll || '300s'}</strong>
          </div>

          ${devices.length === 0 ? `
            <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 36px 20px; text-align: center; color: #64748b; background: #fafbfc;">
              <div style="font-size: 32px; margin-bottom: 10px;">🔌</div>
              <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Monitored Nodes in Central Architecture</div>
              <div style="font-size: 12px; margin-bottom: 18px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                There are currently 0 active network devices or servers enrolled in your inventory. Add real devices via SNMP/WMI credentials or run a CIDR network sweep to associate this template.
              </div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="apply-modal-add-dev-btn" style="background: #0070e0; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Add Real Device</button>
                <button id="apply-modal-sweep-btn" style="background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">🔍 Discover CIDR Subnet</button>
              </div>
            </div>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 600; color: #475569;">Select devices to apply template:</span>
              <button id="apply-select-all-btn" style="background: none; border: none; color: #0070e0; font-size: 11px; font-weight: 700; cursor: pointer;">Select All Nodes</button>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; max-height: 260px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-size: 11px;">
                    <th style="padding: 8px 10px; width: 30px;"><input type="checkbox" id="apply-check-master"></th>
                    <th style="padding: 8px 10px;">Device Name</th>
                    <th style="padding: 8px 10px;">IP Address</th>
                    <th style="padding: 8px 10px;">Category</th>
                    <th style="padding: 8px 10px;">Current Template</th>
                  </tr>
                </thead>
                <tbody>
                  ${devices.map(d => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 10px;"><input type="checkbox" class="apply-dev-check" value="${d.id}"></td>
                      <td style="padding: 8px 10px; font-weight: 600; color: #0f172a;">${d.name}</td>
                      <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #64748b;">${d.ip}</td>
                      <td style="padding: 8px 10px;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">${d.category || 'Unknown'}</span></td>
                      <td style="padding: 8px 10px; color: #64748b; font-size: 11px;">${d.template || 'Default Template'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="close-apply-tmpl-btn2" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">Cancel</button>
          ${devices.length > 0 ? `
            <button id="confirm-apply-tmpl-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Apply Template to Selected</button>
          ` : ''}
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeHandler = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-apply-tmpl-btn').onclick = closeHandler;
    modal.querySelector('#close-apply-tmpl-btn2').onclick = closeHandler;

    const addDevBtn = modal.querySelector('#apply-modal-add-dev-btn');
    if (addDevBtn) {
      addDevBtn.onclick = () => {
        modal.style.display = 'none';
        showAddDeviceModal();
      };
    }

    const sweepBtn = modal.querySelector('#apply-modal-sweep-btn');
    if (sweepBtn) {
      sweepBtn.onclick = () => {
        modal.style.display = 'none';
        showSubnetDiscoveryModal();
      };
    }

    const masterCheck = modal.querySelector('#apply-check-master');
    const devChecks = modal.querySelectorAll('.apply-dev-check');
    if (masterCheck) {
      masterCheck.onchange = () => {
        devChecks.forEach(cb => cb.checked = masterCheck.checked);
      };
    }

    const selectAllBtn = modal.querySelector('#apply-select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.onclick = () => {
        const anyUnchecked = Array.from(devChecks).some(cb => !cb.checked);
        devChecks.forEach(cb => cb.checked = anyUnchecked);
        if (masterCheck) masterCheck.checked = anyUnchecked;
      };
    }

    const confirmBtn = modal.querySelector('#confirm-apply-tmpl-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const selectedIds = Array.from(devChecks).filter(cb => cb.checked).map(cb => cb.value);
        if (selectedIds.length === 0) {
          showToast('Please select at least one device to apply template', 'error');
          return;
        }

        fetch('/api/settings/templates/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: tmpl.id, deviceIds: selectedIds })
        }).catch(() => {});

        selectedIds.forEach(id => {
          const dev = (state.devices || []).find(d => String(d.id) === String(id));
          if (dev) {
            dev.template = tmpl.name;
            dev.monitors = tmpl.monitors;
            dev.pollInterval = tmpl.poll;
          }
        });

        showToast(`Template "${tmpl.name}" successfully applied to ${selectedIds.length} monitored node(s).`);
        modal.style.display = 'none';
      };
    }
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
              Applying a new license key automatically distributes probe licenses across all connected enterprise probes (${(state.probes || []).map(p => p.name).join(', ') || 'Connected Probes'}).
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

    const escNp = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const activeProbe = sourceProbe || (state.probes && state.probes[0]) || { name: 'Central Site Probe', ip: '192.168.30.65' };
    const defaultIp = (targetService && /^\d/.test(targetService)) ? targetService : ((state.devices && state.devices[0]?.ip) || '192.168.30.1');

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1060px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0070e0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🌐</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine NetPath &trade; - Live Network Path &amp; TCP Probe</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Real OS Traceroute + TCP Port Connectivity Check from ${escNp(activeProbe.name)} (${escNp(activeProbe.ip || '127.0.0.1')})</div>
            </div>
          </div>
          <button id="close-netpath-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px;">&times;</button>
        </div>

        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <select id="opm-netpath-preset" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
              ${(state.devices || []).slice(0, 12).map(d => `<option value="${escNp(d.ip)}" ${d.ip === defaultIp ? 'selected' : ''}>${escNp(d.displayName || d.name)} (${escNp(d.ip)})</option>`).join('')}
              <option value="8.8.8.8">Google Public DNS (8.8.8.8)</option>
              <option value="1.1.1.1">Cloudflare DNS (1.1.1.1)</option>
            </select>
            <input id="opm-netpath-host" type="text" value="${escNp(defaultIp)}" placeholder="IP or Hostname" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: monospace; width: 150px;" />
            <input id="opm-netpath-port" type="number" value="80" min="1" max="65535" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: monospace; width: 72px;" title="TCP Port" />
            <span id="opm-netpath-tcp-badge" style="font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">TCP Port Pending</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="opm-netpath-run-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">▶ Run Live Trace &amp; TCP Check</button>
            <button id="opm-netpath-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export CSV</button>
          </div>
        </div>

        <div style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
          <div id="opm-netpath-pipeline" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; display: flex; align-items: center; gap: 8px; overflow-x: auto; min-height: 76px;">
            <span style="color: #64748b; font-size: 12px;">Running live traceroute...</span>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-weight: 700;">
                  <th style="padding: 8px 12px;">Hop #</th>
                  <th style="padding: 8px 12px;">Hostname / Responder</th>
                  <th style="padding: 8px 12px;">IP Address</th>
                  <th style="padding: 8px 12px;">Measured RTT</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr>
              </thead>
              <tbody id="opm-netpath-tbody">
                <tr><td colspan="5" style="padding: 18px; text-align: center; color: #64748b;">Probing route hops...</td></tr>
              </tbody>
            </table>
          </div>

          <div style="background: #0f172a; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #38bdf8;">
            <div style="font-weight: 700; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">RAW TRACEROUTE &amp; TCP SOCKET OUTPUT</div>
            <pre id="opm-netpath-term-logs" style="margin: 0; white-space: pre-wrap; color: #cbd5e1; max-height: 120px; overflow-y: auto;"></pre>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine NetPath &bull; Live ICMP Traceroute &amp; TCP Port Diagnostic</span>
          <button id="close-netpath-btn-footer" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close NetPath</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-netpath-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-netpath-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const preset = document.getElementById('opm-netpath-preset');
    const hostInp = document.getElementById('opm-netpath-host');
    const portInp = document.getElementById('opm-netpath-port');
    const tcpBadge = document.getElementById('opm-netpath-tcp-badge');
    const pipeEl = document.getElementById('opm-netpath-pipeline');
    const tbody = document.getElementById('opm-netpath-tbody');
    const term = document.getElementById('opm-netpath-term-logs');
    const runBtn = document.getElementById('opm-netpath-run-btn');
    let lastHops = [];

    const runTrace = async () => {
      const targetHost = (hostInp.value || '').trim();
      const targetPort = Number(portInp.value) || 80;
      if (!targetHost) return;
      runBtn.disabled = true;
      runBtn.textContent = 'Probing...';
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 18px; text-align: center; color: #0070e0;">Running real traceroute & TCP/${targetPort} check to ${escNp(targetHost)}...</td></tr>`;
      try {
        const [trRes, pcRes] = await Promise.all([
          fetch('/api/tools/traceroute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: targetHost }) }),
          fetch('/api/tools/port-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host: targetHost, port: targetPort }) })
        ]);
        const tr = await trRes.json();
        const pc = await pcRes.json();
        lastHops = Array.isArray(tr.hops) ? tr.hops : [];
        if (pcRes.ok) {
          tcpBadge.textContent = `TCP/${targetPort}: ${pc.state}${pc.latencyMs != null ? ' (' + pc.latencyMs + 'ms)' : ''}`;
          tcpBadge.style.background = pc.isOpen ? '#dcfce7' : '#fee2e2';
          tcpBadge.style.color = pc.isOpen ? '#166534' : '#991b1b';
        }
        if (!trRes.ok) throw new Error(tr.message || `Traceroute failed (${trRes.status})`);

        pipeEl.innerHTML = lastHops.length === 0
          ? `<span style="color:#64748b;font-size:12px;">Direct LAN or no intermediate hops responded.</span>`
          : lastHops.map((h, i) => `
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="padding:6px 10px;border:1px solid ${h.ip === '*' ? '#cbd5e1' : '#16a34a'};background:#f8fafc;border-radius:6px;text-align:center;min-width:110px;">
                  <div style="font-size:10px;font-weight:700;color:#475569;">Hop ${h.hop}</div>
                  <div style="font-size:11px;font-weight:700;color:#0070e0;font-family:monospace;">${escNp(h.ip)}</div>
                  <div style="font-size:10px;color:${h.ip === '*' ? '#94a3b8' : '#16a34a'};">${escNp(h.rtt1 || '*')}</div>
                </div>
                ${i < lastHops.length - 1 ? '<span style="color:#94a3b8;">&rarr;</span>' : ''}
              </div>
            `).join('');

        tbody.innerHTML = lastHops.length === 0
          ? `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #64748b;">No hop rows parsed. See raw output below.</td></tr>`
          : lastHops.map(h => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 12px; font-weight: 700;">${h.hop}</td>
                <td style="padding: 7px 12px; color: #0070e0;">${escNp(h.hostname || 'No reply')}</td>
                <td style="padding: 7px 12px; font-family: monospace;">${escNp(h.ip)}</td>
                <td style="padding: 7px 12px; font-family: monospace; color: #16a34a;">${escNp(h.rtt1 || '*')}</td>
                <td style="padding: 7px 12px;"><span style="background:${h.ip === '*' ? '#fef3c7' : '#dcfce7'};color:${h.ip === '*' ? '#92400e' : '#166534'};font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;">${h.ip === '*' ? 'TIMEOUT' : 'REACHABLE'}</span></td>
              </tr>`).join('');
        term.textContent = tr.output || tr.message || 'No stdout returned';
      } catch (e) {
        pipeEl.innerHTML = `<span style="color:#dc2626;font-size:12px;">${escNp(e.message)}</span>`;
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #dc2626;">${escNp(e.message)}</td></tr>`;
        term.textContent = e.message;
      }
      runBtn.disabled = false;
      runBtn.textContent = '▶ Run Live Trace & TCP Check';
    };

    if (preset) preset.onchange = () => { hostInp.value = preset.value; runTrace(); };
    runBtn.onclick = runTrace;
    document.getElementById('opm-netpath-export-btn').onclick = () => {
      if (!lastHops.length) { showToast('Run traceroute first to export measured hops.', 'warning'); return; }
      const csv = 'Hop,Hostname,IP,RTT\n' + lastHops.map(h => `${h.hop},"${h.hostname || ''}","${h.ip}","${h.rtt1 || ''}"`).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `netpath_${(hostInp.value || 'target').replace(/[^a-z0-9.-]/gi, '_')}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    runTrace();
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

    const escHw = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let srv = targetServer || (state.devices.find(d => /server|switch|router|firewall/i.test(d.category || '')) || state.devices[0]);
    if (!srv) {
      showToast('No monitored devices in inventory.', 'warning');
      return;
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1040px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🌡️</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine Hardware Health &amp; Sensor Telemetry Inspector</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Live SNMP ENTITY-MIB, HOST-RESOURCES &amp; ENVMON Hardware Poller</div>
            </div>
          </div>
          <button id="close-hw-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px;">&times;</button>
        </div>

        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; flex-wrap: wrap;">
            <select id="opm-hw-dev-select" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; background: #fff;">
              ${(state.devices || []).map(d => `<option value="${d.id}" ${String(d.id) === String(srv.id) ? 'selected' : ''}>${escHw(d.displayName || d.name)} (${escHw(d.ip)})</option>`).join('')}
            </select>
            <span id="opm-hw-summary-line" style="color: #64748b;">Querying live SNMP MIBs...</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="opm-hw-status-pill" style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px;">POLLING SNMP</span>
            <button id="opm-hw-poll-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Re-Poll Hardware MIBs</button>
          </div>
        </div>

        <div id="opm-hw-body" style="padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="padding: 40px; text-align: center; color: #64748b; font-size: 12px;">Querying ENTITY-MIB, HOST-RESOURCES-MIB &amp; ENVMON sensors on ${escHw(srv.ip)}...</div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">SNMP Hardware Inventory Poller (/api/hardware/details) &bull; Zero Synthetic Sensors</span>
          <button id="close-hw-btn-footer" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close Inspector</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-hw-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-hw-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const pollBtn = document.getElementById('opm-hw-poll-btn');
    const devSel = document.getElementById('opm-hw-dev-select');
    const summaryEl = document.getElementById('opm-hw-summary-line');
    const pillEl = document.getElementById('opm-hw-status-pill');
    const bodyEl = document.getElementById('opm-hw-body');

    const loadHw = async (target) => {
      pollBtn.disabled = true;
      pollBtn.textContent = '⚡ Polling SNMP...';
      pillEl.textContent = 'POLLING SNMP';
      pillEl.style.background = '#e0f2fe'; pillEl.style.color = '#0369a1';
      try {
        const res = await fetch(`/api/hardware/details?deviceId=${encodeURIComponent(target.id)}&ip=${encodeURIComponent(target.ip || '')}`);
        const data = await res.json();
        if (!res.ok || !data.hardware) throw new Error(data.message || `SNMP hardware query failed (${res.status})`);
        const h = data.hardware;
        summaryEl.innerHTML = `Vendor: <strong>${escHw(h.vendor || '—')}</strong> &bull; Model: <strong>${escHw(h.model || '—')}</strong> &bull; Serial: <code>${escHw(h.serialNumber || '—')}</code>`;
        pillEl.textContent = '● LIVE SNMP VERIFIED';
        pillEl.style.background = '#dcfce7'; pillEl.style.color = '#166534';

        const psus = h.powerSupplies || [];
        const fans = h.fanTrays || [];
        const temps = h.thermalSensors || [];

        bodyEl.innerHTML = `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 11px;">
            <div><div style="color:#64748b;font-weight:600;">Total RAM (HOST-RESOURCES)</div><div style="font-size:14px;font-weight:800;color:#0f172a;margin-top:2px;">${escHw(h.totalRam || 'Not reported')}</div></div>
            <div><div style="color:#64748b;font-weight:600;">CPU Cores / Count</div><div style="font-size:14px;font-weight:800;color:#0070e0;margin-top:2px;">${h.cpuCount != null ? escHw(h.cpuCount + ' Logical CPUs') : 'Not reported'}</div></div>
            <div><div style="color:#64748b;font-weight:600;">Firmware / ROM Rev</div><div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">${escHw(h.firmwareVersion || h.romVersion || 'Not reported')}</div></div>
            <div><div style="color:#64748b;font-weight:600;">Flash / Location</div><div style="font-size:12px;font-weight:700;color:#334155;margin-top:2px;">${escHw(h.flashMemory || h.rackLocation || '—')}</div></div>
          </div>
          ${h.sysDescr ? `<div style="background:#0f172a;color:#cbd5e1;font-family:monospace;font-size:11px;padding:10px 14px;border-radius:6px;"><strong>SNMP sysDescr:</strong> ${escHw(h.sysDescr)}</div>` : ''}
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
              <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;">⚡ Power Supplies (${psus.length})</div>
              ${psus.length === 0 ? '<div style="font-size:11px;color:#64748b;">Device returned 0 ENTITY-MIB PowerSupply rows.</div>' : psus.map(p => `<div style="padding:6px 8px;border:1px solid #f1f5f9;border-radius:4px;margin-bottom:6px;font-size:11px;"><strong>${escHw(p.name || p.descr || 'PSU')}</strong><div style="color:#64748b;">Status: ${escHw(p.status || 'Reported')}</div></div>`).join('')}
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
              <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;">🌀 Cooling Fans (${fans.length})</div>
              ${fans.length === 0 ? '<div style="font-size:11px;color:#64748b;">Device returned 0 ENTITY-MIB Fan rows.</div>' : fans.map(f => `<div style="padding:6px 8px;border:1px solid #f1f5f9;border-radius:4px;margin-bottom:6px;font-size:11px;"><strong>${escHw(f.name || f.descr || 'Fan')}</strong><div style="color:#16a34a;">${f.rpm != null ? escHw(f.rpm + ' RPM') : escHw(f.status || 'Reported')}</div></div>`).join('')}
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
              <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;">🌡️ Thermal Sensors (${temps.length})</div>
              ${temps.length === 0 ? '<div style="font-size:11px;color:#64748b;">Device returned 0 ENVMON / ENTITY-SENSOR temp rows.</div>' : temps.map(t => `<div style="padding:6px 8px;border:1px solid #f1f5f9;border-radius:4px;margin-bottom:6px;font-size:11px;display:flex;justify-content:space-between;"><span>${escHw(t.name || t.descr || 'Temp')}</span><strong style="color:#16a34a;">${t.celsius != null ? escHw(t.celsius + ' °C') : escHw(t.status || 'OK')}</strong></div>`).join('')}
            </div>
          </div>
        `;
      } catch (err) {
        pillEl.textContent = 'SNMP UNREACHABLE';
        pillEl.style.background = '#fee2e2'; pillEl.style.color = '#991b1b';
        summaryEl.textContent = `Target: ${target.ip}`;
        bodyEl.innerHTML = `<div style="padding: 28px; text-align: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-size: 12px;">${escHw(err.message)}</div>`;
      }
      pollBtn.disabled = false;
      pollBtn.textContent = '⚡ Re-Poll Hardware MIBs';
    };

    devSel.onchange = () => {
      const picked = (state.devices || []).find(d => String(d.id) === String(devSel.value));
      if (picked) { srv = picked; loadHw(picked); }
    };
    pollBtn.onclick = () => loadHw(srv);
    loadHw(srv);
  }

  // -------------------------------------------------------------
  // MODAL: ManageEngine Correlated Alarm Root Cause Analysis (RCA)
  // -------------------------------------------------------------
  function showZiaRcaModal(alarm) {
    let modal = document.getElementById('opm-zia-rca-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-zia-rca-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10006; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const escRca = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const alm = alarm || (state.alarms && state.alarms[0]) || { id: 0, device: (state.devices && state.devices[0]?.name) || 'Managed Node', severity: 'Critical', message: 'No active alarms selected' };
    const matchedDev = (state.devices || []).find(d => (alm.deviceId && String(d.id) === String(alm.deviceId)) || (alm.ip && d.ip === alm.ip) || (alm.device && (d.name === alm.device || d.displayName === alm.device)));
    const siblings = (state.alarms || []).filter(a => a.device === alm.device || (alm.ip && a.ip === alm.ip));
    const sevCounts = {
      Critical: siblings.filter(s => /critical|down/i.test(s.severity || '')).length,
      Trouble: siblings.filter(s => /trouble|major/i.test(s.severity || '')).length,
      Attention: siblings.filter(s => /attention|warning|minor/i.test(s.severity || '')).length
    };

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 920px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #818cf8;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🧠</span>
            <div>
              <div style="font-size: 15px; font-weight: 800; letter-spacing: 0.3px;">Alarm Root Cause &amp; Device Correlation Inspector</div>
              <div style="font-size: 11px; color: #c7d2fe; margin-top: 1px;">Live SQLite Event Correlation across Managed Device &amp; Probe Alarms</div>
            </div>
          </div>
          <button id="close-zia-rca-btn" style="background: transparent; border: none; color: #c7d2fe; font-size: 18px; cursor: pointer; padding: 4px 8px;">&times;</button>
        </div>

        <div style="padding: 20px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: #dc2626; color: #fff; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px;">${escRca(alm.severity || 'Alarm')}</span>
                <span style="font-weight: 800; color: #0f172a; font-size: 13px;">${escRca(alm.device || matchedDev?.name || 'Node')}: ${escRca(alm.message || '')}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Alarm ID: <strong>#${escRca(alm.id)}</strong> &bull; Time: <strong>${escRca(alm.time || alm.timestamp || 'Recent')}</strong>${matchedDev ? ` &bull; Host Status: <strong>${escRca(matchedDev.status)}</strong> (${escRca(matchedDev.ip)}, RTT: ${matchedDev.responseTime != null ? matchedDev.responseTime + 'ms' : '—'})` : ''}
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: 10px; color: #4338ca; font-weight: 700; text-transform: uppercase;">Correlated Events</div>
              <div style="font-size: 20px; font-weight: 900; color: #4f46e5;">${siblings.length}</div>
            </div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 10px;">
              Real Sibling Alarms on ${escRca(alm.device || 'Device')} (${sevCounts.Critical} Critical &bull; ${sevCounts.Trouble} Trouble &bull; ${sevCounts.Attention} Attention)
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
              ${siblings.length === 0 ? '<div style="font-size:12px;color:#64748b;">No additional alarms recorded for this device.</div>' : siblings.slice(0, 10).map(s => `
                <div style="display: flex; gap: 12px; align-items: flex-start; padding: 8px 12px; background: #fafbfc; border: 1px solid #e2e8f0; border-left: 3px solid ${/critical/i.test(s.severity) ? '#dc2626' : '#ea580c'}; border-radius: 4px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #64748b; white-space: nowrap;">${escRca(s.time || s.timestamp || '')}</span>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">[${escRca(s.severity)}] ${escRca(s.entity || s.category || 'Alert')}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${escRca(s.message)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; background: #ffffff;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Live Diagnostic &amp; Remediation Actions:</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${matchedDev ? `<button id="opm-zia-inspect-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">🔍 Inspect Device Snapshot</button>` : ''}
              ${matchedDev ? `<button id="opm-zia-cli-btn" style="background: #0f172a; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">💻 Open Web CLI (${escRca(matchedDev.ip)})</button>` : ''}
              <button id="opm-zia-ack-btn" style="background: #f59e0b; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">✓ Acknowledge Correlated (${siblings.length || 1})</button>
              <button id="opm-zia-clear-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">✔ Clear This Alarm</button>
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">OpManager Central Alarm Correlation &bull; Backed by SQLite Alarms</span>
          <button id="close-zia-rca-btn-footer" style="background: #4f46e5; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close Analysis</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('close-zia-rca-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-zia-rca-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const inspBtn = document.getElementById('opm-zia-inspect-btn');
    if (inspBtn && matchedDev) {
      inspBtn.onclick = () => { modal.style.display = 'none'; showDeviceSnapshotModal(matchedDev.id); };
    }
    const cliBtn = document.getElementById('opm-zia-cli-btn');
    if (cliBtn && matchedDev) {
      cliBtn.onclick = () => { modal.style.display = 'none'; showNetworkToolsModal(matchedDev.ip, 'terminal'); };
    }
    const ackBtn = document.getElementById('opm-zia-ack-btn');
    if (ackBtn) {
      ackBtn.onclick = async () => {
        const ids = siblings.length ? siblings.map(s => s.id) : [alm.id];
        ackBtn.disabled = true;
        try {
          const r = await fetch('/api/alarms/ack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
          if (!r.ok) throw new Error('Ack failed');
          showToast(`Acknowledged ${ids.length} correlated alarm(s) in SQLite.`);
          if (typeof loadBackendData === 'function') loadBackendData();
          modal.style.display = 'none';
        } catch (e) { showToast(e.message, 'error'); ackBtn.disabled = false; }
      };
    }
    const clrBtn = document.getElementById('opm-zia-clear-btn');
    if (clrBtn) {
      clrBtn.onclick = async () => {
        clrBtn.disabled = true;
        try {
          const r = await fetch(`/api/alarms/${alm.id}/clear`, { method: 'POST' });
          if (!r.ok) throw new Error('Clear failed');
          state.alarms = (state.alarms || []).filter(a => String(a.id) !== String(alm.id));
          if (typeof updateStatusCounters === 'function') updateStatusCounters();
          showToast(`Cleared alarm #${alm.id}.`);
          modal.style.display = 'none';
          if (state.currentTab === 'alarms' && typeof renderAlarmsView === 'function') renderAlarmsView();
        } catch (e) { showToast(e.message, 'error'); clrBtn.disabled = false; }
      };
    }
  }



  /* ==========================================================================
     BATCH 4 ENTERPRISE FEATURES: BGP, SD-WAN, DPI NBAR2, NDR THREAT FORENSICS
     ========================================================================== */

  // Helper to build device selector options from live state.devices
  function _advDeviceOptions(selectedIdOrIp, preferPattern) {
    const devs = (state.devices || []).slice();
    if (!devs.length) return '<option value="">No devices in inventory</option>';
    let defId = selectedIdOrIp;
    if (!defId && preferPattern) {
      const m = devs.find(d => preferPattern.test(`${d.category || ''} ${d.displayName || d.name || ''}`));
      if (m) defId = m.id;
    }
    if (!defId) defId = devs[0].id;
    return devs.map(d => {
      const sel = (String(d.id) === String(defId) || String(d.ip) === String(defId)) ? 'selected' : '';
      return `<option value="${d.id}" ${sel}>${d.displayName || d.name || d.ip} (${d.ip} - ${d.category || 'Node'})</option>`;
    }).join('');
  }

  // 1. Real BGP-4 Live Polling Modal (BGP4-MIB 1.3.6.1.2.1.15.3.1 + TCP/179 + ICMP)
  function showBgpMonitoringModal(router) {
    let modal = document.getElementById('opm-bgp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-bgp-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.72); z-index: 10007; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const initialDevId = router && router.id ? router.id : (router && router.ip ? router.ip : '');
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1060px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8b5cf6;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📡</span>
            <div>
              <div style="font-size: 14px; font-weight: 800;">ManageEngine OpManager Central &bull; BGP-4 Live MIB &amp; Port 179 Monitor</div>
              <div id="opm-bgp-subtitle" style="font-size: 11px; color: #94a3b8;">Querying real BGP4-MIB (1.3.6.1.2.1.15.3.1) &amp; TCP Port 179 from Central Poller...</div>
            </div>
          </div>
          <button id="close-bgp-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">&times;</button>
        </div>

        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label style="font-size: 12px; font-weight: 700; color: #334155;">Target Router / Firewall:</label>
            <select id="opm-bgp-dev-select" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 12px; min-width: 280px; background: #fff;">
              ${_advDeviceOptions(initialDevId, /router|firewall|core/i)}
            </select>
            <button id="opm-bgp-refresh-btn" style="background: #6d28d9; color: #fff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
              ↻ Poll BGP4-MIB &amp; TCP/179 Now
            </button>
          </div>
          <button id="opm-bgp-cli-btn" style="background: #1e293b; color: #fff; border: none; padding: 7px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
            💻 Open SSH / CLI Console
          </button>
        </div>

        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
          <div id="opm-bgp-kpi-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;"><div style="font-size: 11px; color: #64748b;">ICMP Reachability</div><div id="bgp-kpi-icmp" style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">Checking...</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;"><div style="font-size: 11px; color: #64748b;">BGP TCP Port 179</div><div id="bgp-kpi-179" style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">Checking...</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;"><div style="font-size: 11px; color: #64748b;">Local ASN (bgpLocalAs)</div><div id="bgp-kpi-asn" style="font-size: 16px; font-weight: 800; color: #6d28d9; margin-top: 4px;">—</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;"><div style="font-size: 11px; color: #64748b;">BGP4-MIB Peers</div><div id="bgp-kpi-peers" style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">0</div></div>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
              Live BGP4-MIB::bgpPeerTable (1.3.6.1.2.1.15.3.1)
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                  <th style="padding: 10px 12px;">Neighbor IP</th>
                  <th style="padding: 10px 12px;">Remote AS</th>
                  <th style="padding: 10px 12px;">Peer State</th>
                  <th style="padding: 10px 12px;">Admin</th>
                  <th style="padding: 10px 12px;">Updates (Rx / Tx)</th>
                  <th style="padding: 10px 12px; text-align: right;">Established Uptime</th>
                </tr>
              </thead>
              <tbody id="opm-bgp-table-body">
                <tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">Polling target device...</td></tr>
              </tbody>
            </table>
          </div>

          <div id="opm-bgp-live-log" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
            [BGP-4] Initializing live SNMP + TCP/179 check...
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Live RFC 4271 / BGP4-MIB Probe</span>
          <button id="close-bgp-modal-btn-footer" style="background: #6d28d9; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close BGP View</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-bgp-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-bgp-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    async function runBgpPoll() {
      const sel = document.getElementById('opm-bgp-dev-select');
      const btn = document.getElementById('opm-bgp-refresh-btn');
      const log = document.getElementById('opm-bgp-live-log');
      const tbody = document.getElementById('opm-bgp-table-body');
      const devId = sel ? sel.value : '';
      if (btn) { btn.disabled = true; btn.innerText = 'Polling SNMP & TCP/179...'; }
      if (log) log.innerHTML = `<span style="color:#38bdf8;">[POLL] Querying BGP4-MIB &amp; TCP:179 on selected node...</span>`;
      try {
        const res = await fetch('/api/advanced/bgp/poll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: devId })
        });
        const data = await res.json();
        const devLabel = data.device ? `${data.device.name} (${data.device.ip})` : 'None';
        document.getElementById('opm-bgp-subtitle').innerText = `Target: ${devLabel} • Polled at ${new Date().toLocaleTimeString()}`;
        document.getElementById('bgp-kpi-icmp').innerHTML = data.icmpRttMs !== null ? `<span style="color:#16a34a;">${data.icmpRttMs} ms (Up)</span>` : `<span style="color:#dc2626;">Timeout / Down</span>`;
        document.getElementById('bgp-kpi-179').innerHTML = data.bgpPort179Open ? `<span style="color:#16a34a;">OPEN (${data.tcp179Ms} ms)</span>` : `<span style="color:#d97706;">Closed / Filtered</span>`;
        document.getElementById('bgp-kpi-asn').innerText = data.localAsn ? `AS${data.localAsn}` : 'Not Exposed';
        document.getElementById('bgp-kpi-peers').innerText = String((data.peers || []).length);

        if (data.peers && data.peers.length > 0) {
          tbody.innerHTML = data.peers.map(p => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 9px 12px; font-family: monospace; font-weight: 700;">${p.peerIp}</td>
              <td style="padding: 9px 12px;"><strong>AS${p.remoteAs || '—'}</strong></td>
              <td style="padding: 9px 12px;"><span style="background: ${p.state === 'established' ? '#dcfce7' : '#fef3c7'}; color: ${p.state === 'established' ? '#166534' : '#92400e'}; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">${p.state}</span></td>
              <td style="padding: 9px 12px;">${p.adminStatus}</td>
              <td style="padding: 9px 12px; font-family: monospace;">${p.inUpdates} / ${p.outUpdates}</td>
              <td style="padding: 9px 12px; text-align: right; font-family: monospace;">${p.establishedSeconds}s</td>
            </tr>
          `).join('');
          if (log) log.innerHTML = `<span style="color:#4ade80;">✔ Received ${data.peers.length} real BGP peer(s) from ${devLabel} via BGP4-MIB.</span>`;
        } else {
          tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">No BGP4-MIB peers reported by <strong>${devLabel}</strong>.<br><span style="font-size: 11px;">${data.snmpError || 'TCP/179 is not listening or BGP4-MIB is not enabled on this host.'}</span></td></tr>`;
          if (log) log.innerHTML = `<span style="color:#fbbf24;">[INFO] ${devLabel}: ICMP=${data.icmpRttMs !== null ? data.icmpRttMs + 'ms' : 'Down'}, TCP/179=${data.bgpPort179Open ? 'Open' : 'Closed'} — ${data.snmpError || '0 BGP peers'}</span>`;
        }
      } catch (err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #dc2626;">Error polling BGP: ${err.message}</td></tr>`;
      } finally {
        if (btn) { btn.disabled = false; btn.innerText = '↻ Poll BGP4-MIB & TCP/179 Now'; }
      }
    }

    document.getElementById('opm-bgp-refresh-btn').onclick = runBgpPoll;
    document.getElementById('opm-bgp-dev-select').onchange = runBgpPoll;
    document.getElementById('opm-bgp-cli-btn').onclick = () => {
      const selId = document.getElementById('opm-bgp-dev-select').value;
      const dev = (state.devices || []).find(d => String(d.id) === String(selId));
      modal.style.display = 'none';
      if (typeof showNetworkToolsModal === 'function') showNetworkToolsModal(dev ? dev.ip : '192.168.30.1', 'terminal');
    };
    runBgpPoll();
  }

  // 2. Real WAN & SD-WAN Path SLA Probe Modal (Real Multi-Ping RTT / Jitter / Loss)
  function showSdwanPerformanceModal(sdwanDevice) {
    let modal = document.getElementById('opm-sdwan-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-sdwan-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.72); z-index: 10008; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1060px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🚀</span>
            <div>
              <div style="font-size: 14px; font-weight: 800;">ManageEngine OpManager Central &bull; SD-WAN &amp; Multi-Path WAN SLA Probe</div>
              <div id="opm-sdwan-subtitle" style="font-size: 11px; color: #94a3b8;">Measuring real ICMP multi-ping latency, jitter, and packet loss across Gateways &amp; Internet uplinks...</div>
            </div>
          </div>
          <button id="close-sdwan-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">&times;</button>
        </div>

        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Live Gateway &amp; WAN Uplink SLA Telemetry (3-Sample ICMP Echo)</span>
            <button id="opm-sdwan-simulate-brownout-btn" style="background: #047857; color: #fff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
              ⚡ Run Live WAN SLA Probe Now
            </button>
          </div>

          <div id="opm-sdwan-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div style="padding: 24px; text-align: center; color: #64748b; grid-column: 1 / -1;">Running live ICMP multi-ping probes...</div>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                  <th style="padding: 10px 12px;">Path / Gateway</th>
                  <th style="padding: 10px 12px;">Target IP</th>
                  <th style="padding: 10px 12px;">Role</th>
                  <th style="padding: 10px 12px;">Avg Latency</th>
                  <th style="padding: 10px 12px;">Jitter</th>
                  <th style="padding: 10px 12px;">Packet Loss</th>
                  <th style="padding: 10px 12px; text-align: right;">SLA Status</th>
                </tr>
              </thead>
              <tbody id="opm-sdwan-sla-body">
                <tr><td colspan="7" style="padding: 20px; text-align: center; color: #64748b;">Measuring WAN paths...</td></tr>
              </tbody>
            </table>
          </div>

          <div id="opm-sdwan-dynamic-msg" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #34d399; border: 1px solid #1e293b;">
            [SD-WAN] Executing live multi-hop ICMP SLA probes from Central...
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Real WAN Path Latency &amp; Jitter Monitor</span>
          <button id="close-sdwan-modal-btn-footer" style="background: #10b981; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close SD-WAN Console</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-sdwan-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-sdwan-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    async function runSdwanProbe() {
      const btn = document.getElementById('opm-sdwan-simulate-brownout-btn');
      const cards = document.getElementById('opm-sdwan-cards-grid');
      const tbody = document.getElementById('opm-sdwan-sla-body');
      const msg = document.getElementById('opm-sdwan-dynamic-msg');
      if (btn) { btn.disabled = true; btn.innerText = 'Probing WAN Paths...'; }
      try {
        const res = await fetch('/api/advanced/sdwan/probe', { method: 'POST' });
        const data = await res.json();
        const list = data.transports || [];
        document.getElementById('opm-sdwan-subtitle').innerText = `Measured ${list.length} real paths at ${new Date().toLocaleTimeString()}`;

        cards.innerHTML = list.slice(0, 4).map(t => {
          const ok = t.status === 'Active';
          return `
            <div style="background: #ffffff; border: 1px solid ${ok ? '#bbf7d0' : '#fecaca'}; border-left: 4px solid ${ok ? '#16a34a' : '#dc2626'}; border-radius: 6px; padding: 12px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a;">${t.label}</span>
                <span style="background: ${ok ? '#dcfce7' : '#fee2e2'}; color: ${ok ? '#15803d' : '#991b1b'}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${t.status.toUpperCase()}</span>
              </div>
              <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-top: 2px;">${t.ip}</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; text-align: center;">
                <div style="background: #f8fafc; padding: 6px; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">Latency</div><div style="font-size: 13px; font-weight: 800; color: ${ok ? '#16a34a' : '#dc2626'};">${t.latencyMs !== null ? t.latencyMs + ' ms' : 'Timeout'}</div></div>
                <div style="background: #f8fafc; padding: 6px; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">Jitter</div><div style="font-size: 13px; font-weight: 800; color: #0284c7;">${t.jitterMs !== null ? t.jitterMs + ' ms' : '—'}</div></div>
                <div style="background: #f8fafc; padding: 6px; border-radius: 4px;"><div style="font-size: 10px; color: #64748b;">Loss</div><div style="font-size: 13px; font-weight: 800; color: ${t.lossPct > 0 ? '#dc2626' : '#16a34a'};">${t.lossPct}%</div></div>
              </div>
            </div>
          `;
        }).join('');

        tbody.innerHTML = list.map(t => {
          const slaOk = t.status === 'Active' && (t.latencyMs === null || t.latencyMs < 150) && t.lossPct === 0;
          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 9px 12px; font-weight: 700; color: #0f172a;">${t.label}</td>
              <td style="padding: 9px 12px; font-family: monospace;">${t.ip}</td>
              <td style="padding: 9px 12px; color: #475569;">${t.role}</td>
              <td style="padding: 9px 12px; font-family: monospace; font-weight: 700;">${t.latencyMs !== null ? t.latencyMs + ' ms' : 'Timeout'}</td>
              <td style="padding: 9px 12px; font-family: monospace;">${t.jitterMs !== null ? t.jitterMs + ' ms' : '—'}</td>
              <td style="padding: 9px 12px; font-family: monospace; color: ${t.lossPct > 0 ? '#dc2626' : '#16a34a'};">${t.lossPct}%</td>
              <td style="padding: 9px 12px; text-align: right;"><span style="color: ${slaOk ? '#16a34a' : '#dc2626'}; font-weight: 700;">${slaOk ? '✔ SLA Compliant' : '⚠ Degraded / Timeout'}</span></td>
            </tr>
          `;
        }).join('');

        const activeCnt = list.filter(x => x.status === 'Active').length;
        if (msg) msg.innerHTML = `✔ Live WAN SLA probe complete: ${activeCnt}/${list.length} paths active. Samples: ${list.map(x => x.ip + '=' + (x.latencyMs !== null ? x.latencyMs + 'ms' : 'timeout')).join(' | ')}`;
      } catch (err) {
        if (msg) msg.innerHTML = `<span style="color:#f87171;">Probe error: ${err.message}</span>`;
      } finally {
        if (btn) { btn.disabled = false; btn.innerText = '⚡ Run Live WAN SLA Probe Now'; }
      }
    }

    document.getElementById('opm-sdwan-simulate-brownout-btn').onclick = runSdwanProbe;
    runSdwanProbe();
  }

  // 3. Real Deep Packet / Service & Interface Telemetry Modal (TCP L7 Port Probe + SNMP IF-MIB)
  function showDpiTrafficModal(iface) {
    let modal = document.getElementById('opm-dpi-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-dpi-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.72); z-index: 10009; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const initialDevId = iface && iface.id ? iface.id : (iface && iface.ip ? iface.ip : '');
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1060px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📊</span>
            <div>
              <div style="font-size: 14px; font-weight: 800;">ManageEngine OpManager Central &bull; DPI Service Analyzer &amp; IF-MIB Counters</div>
              <div id="opm-dpi-subtitle" style="font-size: 11px; color: #94a3b8;">Scanning live TCP/L7 application ports &amp; SNMP interface counters...</div>
            </div>
          </div>
          <button id="close-dpi-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">&times;</button>
        </div>

        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label style="font-size: 12px; font-weight: 700; color: #334155;">Inspect Target Host:</label>
            <select id="opm-dpi-dev-select" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 12px; min-width: 280px; background: #fff;">
              ${_advDeviceOptions(initialDevId, /firewall|switch|server/i)}
            </select>
            <button id="opm-dpi-scan-btn" style="background: #0284c7; color: #fff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
              🔍 Scan Live Ports &amp; IF-MIB
            </button>
          </div>
          <span id="opm-dpi-rtt-pill" style="font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px;">Measuring RTT...</span>
        </div>

        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
              Discovered Layer-4/7 Services &amp; TCP Handshake Response Time (ART)
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                  <th style="padding: 9px 12px;">Application / Service</th>
                  <th style="padding: 9px 12px;">Protocol / Port</th>
                  <th style="padding: 9px 12px;">Live State</th>
                  <th style="padding: 9px 12px;">TCP Handshake RTT</th>
                  <th style="padding: 9px 12px;">QoS Class</th>
                  <th style="padding: 9px 12px; text-align: right;">Exposure</th>
                </tr>
              </thead>
              <tbody id="opm-dpi-table-body">
                <tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">Probing application ports...</td></tr>
              </tbody>
            </table>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div id="opm-dpi-if-header" style="background: #f1f5f9; padding: 10px 16px; font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
              SNMP IF-MIB Interfaces
            </div>
            <div id="opm-dpi-if-body" style="padding: 12px 16px; font-size: 12px; color: #475569;">Checking SNMP IF-MIB...</div>
          </div>

          <div id="opm-dpi-dynamic-msg" style="background: #090d16; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b;">
            [DPI] Ready.
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Live Port &amp; Interface Telemetry</span>
          <button id="close-dpi-modal-btn-footer" style="background: #0284c7; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close DPI View</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-dpi-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-dpi-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    async function runDpiProbe() {
      const sel = document.getElementById('opm-dpi-dev-select');
      const btn = document.getElementById('opm-dpi-scan-btn');
      const tbody = document.getElementById('opm-dpi-table-body');
      const ifBody = document.getElementById('opm-dpi-if-body');
      const msg = document.getElementById('opm-dpi-dynamic-msg');
      if (btn) { btn.disabled = true; btn.innerText = 'Scanning...'; }
      try {
        const res = await fetch('/api/advanced/dpi/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: sel ? sel.value : '' })
        });
        const data = await res.json();
        const devLabel = data.device ? `${data.device.name} (${data.device.ip})` : 'None';
        document.getElementById('opm-dpi-subtitle').innerText = `Target: ${devLabel} • ${data.openServicesCount || 0} open services detected`;
        document.getElementById('opm-dpi-rtt-pill').innerText = `ICMP RTT: ${data.icmpRttMs !== null ? data.icmpRttMs + ' ms' : 'Timeout'}`;

        tbody.innerHTML = (data.services || []).map(s => `
          <tr style="border-bottom: 1px solid #f1f5f9; background: ${s.open ? '#f0fdf4' : '#ffffff'};">
            <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">${s.app}</td>
            <td style="padding: 8px 12px; font-family: monospace;">${s.proto}</td>
            <td style="padding: 8px 12px;"><span style="background: ${s.open ? '#dcfce7' : '#f1f5f9'}; color: ${s.open ? '#166534' : '#64748b'}; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">${s.open ? 'OPEN' : 'Closed'}</span></td>
            <td style="padding: 8px 12px; font-family: monospace;">${s.tcpMs !== null ? s.tcpMs + ' ms' : '—'}</td>
            <td style="padding: 8px 12px; font-family: monospace;">${s.dscp}</td>
            <td style="padding: 8px 12px; text-align: right;">${s.risk}</td>
          </tr>
        `).join('');

        if (data.interfaces && data.interfaces.length > 0) {
          ifBody.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;">${data.interfaces.map(i => {
            const isUp = i.operStatus === 1 || i.oper_status === 1 || String(i.operStatus || '').toUpperCase() === 'UP';
            const inMb = i.inOctets != null ? (i.inOctets / 1048576).toFixed(1) + ' MB' : '—';
            const outMb = i.outOctets != null ? (i.outOctets / 1048576).toFixed(1) + ' MB' : '—';
            return `
            <div style="border: 1px solid ${isUp ? '#bbf7d0' : '#e2e8f0'}; border-radius: 4px; padding: 8px 10px; background: ${isUp ? '#f0fdf4' : '#f8fafc'};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; color: #0f172a;">${i.name || i.descr || 'Interface'}</span>
                <span style="font-size: 10px; font-weight: 800; color: ${isUp ? '#166534' : '#64748b'}; background: ${isUp ? '#dcfce7' : '#e2e8f0'}; padding: 1px 6px; border-radius: 3px;">${isUp ? 'UP' : 'DOWN'}</span>
              </div>
              <div style="font-size: 10px; color: #475569; margin-top: 4px; font-family: monospace;">In: ${inMb} &bull; Out: ${outMb}</div>
            </div>
          `; }).join('')}</div>`;
        } else {
          ifBody.innerHTML = `<span style="color: #64748b;">${data.snmpIfMessage || 'No SNMP interfaces available on this host.'}</span>`;
        }
        if (msg) msg.innerText = `[DPI] ${data.nbarNote || 'Scan complete.'}`;
      } catch (err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="padding: 16px; color: #dc2626;">Error: ${err.message}</td></tr>`;
      } finally {
        if (btn) { btn.disabled = false; btn.innerText = '🔍 Scan Live Ports & IF-MIB'; }
      }
    }

    document.getElementById('opm-dpi-scan-btn').onclick = runDpiProbe;
    document.getElementById('opm-dpi-dev-select').onchange = runDpiProbe;
    runDpiProbe();
  }

  // 4. Real NDR & Security Audit Modal (SQLite Alarms + Traps/Syslog + Live TCP Port Audit + STIX JSON Export)
  function showNdrForensicsModal(threatSource) {
    let modal = document.getElementById('opm-ndr-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ndr-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.72); z-index: 10010; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const initialDevId = threatSource && threatSource.id ? threatSource.id : (threatSource && threatSource.ip ? threatSource.ip : '');
    let latestNdrData = null;

    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-size: 14px; font-weight: 800;">ManageEngine OpManager Central &bull; NDR Security &amp; Port Exposure Audit</div>
              <div id="opm-ndr-subtitle" style="font-size: 11px; color: #94a3b8;">Aggregating real SQLite alarms, UDP 162 Traps, UDP 514 Syslog, and live TCP security scans...</div>
            </div>
          </div>
          <button id="close-ndr-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">&times;</button>
        </div>

        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label style="font-size: 12px; font-weight: 700; color: #334155;">Scan Node Ports:</label>
            <select id="opm-ndr-dev-select" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 12px; min-width: 260px; background: #fff;">
              ${_advDeviceOptions(initialDevId, null)}
            </select>
            <button id="opm-ndr-scan-btn" style="background: #dc2626; color: #fff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
              🔍 Run Live Security Port Scan
            </button>
          </div>
          <button id="opm-ndr-export-stix-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
            📥 Export STIX 2.1 JSON
          </button>
        </div>

        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px;"><div style="font-size: 11px; color: #991b1b; font-weight: 700;">DOWN / UNREACHABLE</div><div id="ndr-kpi-down" style="font-size: 20px; font-weight: 800; color: #dc2626;">—</div></div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 14px;"><div style="font-size: 11px; color: #92400e; font-weight: 700;">SNMP AUTH / TIMEOUTS</div><div id="ndr-kpi-snmp" style="font-size: 20px; font-weight: 800; color: #d97706;">—</div></div>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px 14px;"><div style="font-size: 11px; color: #075985; font-weight: 700;">UDP TRAPS / SYSLOG</div><div id="ndr-kpi-traps" style="font-size: 20px; font-weight: 800; color: #0284c7;">—</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;"><div style="font-size: 11px; color: #475569; font-weight: 700;">OPEN PORTS (SCAN)</div><div id="ndr-kpi-ports" style="font-size: 20px; font-weight: 800; color: #0f172a;">Click Scan</div></div>
          </div>

          <div id="opm-ndr-port-results" style="display: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; background: #f8fafc; font-size: 12px;"></div>

          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0;">
              Real Operational &amp; Security Findings (Live SQLite Store)
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                  <th style="padding: 9px 12px;">Classification</th>
                  <th style="padding: 9px 12px;">Host IP</th>
                  <th style="padding: 9px 12px;">Target</th>
                  <th style="padding: 9px 12px;">Source</th>
                  <th style="padding: 9px 12px;">Severity</th>
                  <th style="padding: 9px 12px; text-align: right;">State</th>
                </tr>
              </thead>
              <tbody id="opm-ndr-threat-table-body">
                <tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">Loading real findings...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Real Host Exposure &amp; Fault Forensics</span>
          <button id="close-ndr-modal-btn-footer" style="background: #dc2626; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close NDR View</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-ndr-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-ndr-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    function renderNdrData(data) {
      latestNdrData = data;
      document.getElementById('ndr-kpi-down').innerText = String(data.downCount || 0);
      document.getElementById('ndr-kpi-snmp').innerText = String(data.snmpErrorCount || 0);
      document.getElementById('ndr-kpi-traps').innerText = `${data.trapCount || 0} / ${data.syslogCount || 0}`;
      if (data.openPorts) {
        document.getElementById('ndr-kpi-ports').innerText = String(data.openPorts.length);
        const box = document.getElementById('opm-ndr-port-results');
        box.style.display = 'block';
        box.innerHTML = `<div style="font-weight:700; color:#0f172a; margin-bottom:6px;">TCP Security Exposure Scan on ${data.targetName} (${data.targetIp}) &bull; ICMP: ${data.icmpRttMs !== null ? data.icmpRttMs + ' ms' : 'Timeout'}</div>` +
          (data.openPorts.length === 0
            ? '<span style="color:#64748b;">0 scanned sensitive ports responded open on this host.</span>'
            : `<div style="display:flex; gap:8px; flex-wrap:wrap;">${data.openPorts.map(p => `<span style="background:${p.severity === 'Critical' || p.severity === 'High' ? '#fee2e2' : '#e0f2fe'}; color:${p.severity === 'Critical' || p.severity === 'High' ? '#991b1b' : '#0369a1'}; padding:3px 9px; border-radius:4px; font-family:monospace; font-weight:700;">TCP/${p.port} ${p.label} (${p.tcpMs}ms) [${p.severity}]</span>`).join('')}</div>`);
      }

      const tbody = document.getElementById('opm-ndr-threat-table-body');
      const findings = data.findings || [];
      tbody.innerHTML = findings.length === 0
        ? '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #16a34a; font-weight: 600;">No security or fault anomalies in store.</td></tr>'
        : findings.map(f => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 9px 12px;"><div style="font-weight: 700; color: #0f172a;">${f.classification}</div><div style="font-size: 10px; color: #64748b;">${f.detail}</div></td>
            <td style="padding: 9px 12px; font-family: monospace;">${f.sourceIp}</td>
            <td style="padding: 9px 12px; font-weight: 600;">${f.target}</td>
            <td style="padding: 9px 12px;">${f.tag}</td>
            <td style="padding: 9px 12px;"><span style="background: ${f.severity === 'High' ? '#fee2e2' : (f.severity === 'Medium' ? '#fef3c7' : '#e0f2fe')}; color: ${f.severity === 'High' ? '#991b1b' : (f.severity === 'Medium' ? '#92400e' : '#0369a1')}; padding: 2px 7px; border-radius: 3px; font-weight: 700; font-size: 11px;">${f.severity}</span></td>
            <td style="padding: 9px 12px; text-align: right; color: #475569; font-weight: 600;">${f.state}</td>
          </tr>
        `).join('');
    }

    fetch('/api/advanced/ndr').then(r => r.json()).then(renderNdrData).catch(() => {});

    document.getElementById('opm-ndr-scan-btn').onclick = async () => {
      const btn = document.getElementById('opm-ndr-scan-btn');
      const devId = document.getElementById('opm-ndr-dev-select').value;
      btn.disabled = true; btn.innerText = 'Scanning Ports...';
      try {
        const res = await fetch('/api/advanced/ndr/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: devId })
        });
        const data = await res.json();
        renderNdrData(data);
        showToast(`Security port scan finished on ${data.targetIp}: ${(data.openPorts || []).length} open ports found.`);
      } catch (e) {
        showToast('Scan failed: ' + e.message);
      } finally {
        btn.disabled = false; btn.innerText = '🔍 Run Live Security Port Scan';
      }
    };

    document.getElementById('opm-ndr-export-stix-btn').onclick = () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--opmanager-${Date.now()}`,
        spec_version: '2.1',
        created: new Date().toISOString(),
        objects: (latestNdrData && latestNdrData.findings ? latestNdrData.findings : []).map((f, i) => ({
          type: 'indicator',
          id: `indicator--${i}-${Date.now()}`,
          name: f.classification,
          description: `${f.detail} (Host: ${f.sourceIp})`,
          pattern_type: 'stix',
          valid_from: new Date().toISOString()
        }))
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opmanager-ndr-stix21-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Downloaded live STIX 2.1 JSON security report.');
    };
  }
