  

  // --- Real-data modal helpers (02) --------------------------------------
  // Every modal in this module fetches the authed API (HttpOnly
  // `opm_session` cookie, same-origin) and renders only what the server
  // returned. Unknown values render as "—", never as invented data.
  // No enrollment/auth token is hardcoded anywhere in this file: probe
  // enrollment uses the server-issued key returned once by POST /api/probes.
  function opmModalEmpty(label, nextStep) {
    return `<div style="padding: 48px 20px; text-align: center;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${opmEsc(label)}</div>
      <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto; line-height: 1.5;">${opmEsc(nextStep)}</div>
    </div>`;
  }
  function opmModalLoading(label) {
    return `<div style="padding: 48px 20px; text-align: center; font-size: 12px; color: #64748b;">${opmEsc(label || 'Loading…')}</div>`;
  }
  function opmModalError(message) {
    return `<div style="padding: 48px 20px; text-align: center;">
      <div style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 6px;">Couldn\u2019t load this data</div>
      <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto; line-height: 1.5;">${opmEsc(message || 'The server could not be reached. Try again.')}</div>
    </div>`;
  }
  function opmDash(v) { return (v === null || v === undefined || v === '') ? '\u2014' : v; }
  function opmNum(v) { return (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) ? '\u2014' : Number(v); }

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

    const renderLines = (lines) => (lines || []).map(l => {
      const hl = l.type === 'added' ? 'background: rgba(22, 163, 74, 0.25); color: #86efac; border-left: 3px solid #16a34a;' : (l.type === 'removed' ? 'background: rgba(220, 38, 38, 0.25); color: #fca5a5; border-left: 3px solid #dc2626;' : 'color: #cbd5e1;');
      return `
                <div style="display: flex; gap: 8px; padding: 1px 4px; ${hl}">
                  <span style="color: #64748b; width: 22px; text-align: right; user-select: none;">${opmEsc(l.line)}</span>
                  <span>${opmEsc(l.text)}</span>
                </div>`;
    }).join('');

    const renderDiff = (diff) => {
      const added = diff.addedLinesCount ?? 0;
      const removed = diff.removedLinesCount ?? 0;
      const total = added + removed;
      const badge = total === 0
        ? '<span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">In Sync</span>'
        : `<span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">${total} Differences Detected</span>`;
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #cbd5e1;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NCM Dual-Pane Side-by-Side Configuration Comparator</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${opmEsc(dev.name)} (${opmEsc(dev.ip)})</strong> &bull; Probe: ${opmEsc(dev.probe)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${badge}
            <button id="close-ncm-diff-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
          </div>
        </div>
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
        <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #0f172a; font-family: monospace; font-size: 11px; line-height: 1.6;">
          <div style="border-right: 1px solid #334155; padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>STARTUP-CONFIG (NVRAM)</span>
              <span style="color: #cbd5e1;">Baseline Captured ${opmEsc(diff.startupFetchedAt || '—')}</span>
            </div>
            <div>${renderLines(diff.startupConfig)}</div>
          </div>
          <div style="padding: 14px; overflow-x: auto;">
            <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RUNNING-CONFIG (RAM)</span>
              <span style="color: #4ade80;">Live Synchronized ${opmEsc(diff.runningFetchedAt || '—')}</span>
            </div>
            <div>${renderLines(diff.runningConfig)}</div>
          </div>
        </div>
        <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine Network Configuration Manager v12.9.204-GA &bull; Added lines: ${added} &bull; Removed lines: ${removed}</span>
          <button id="opm-ncm-diff-close-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Comparator</button>
        </div>
      </div>
    `;
      modal.style.display = 'flex';
      modal.querySelector('#close-ncm-diff-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#opm-ncm-diff-close-btn').onclick = () => { modal.style.display = 'none'; };
      const syncBtn = modal.querySelector('#opm-ncm-sync-nvram-btn');
      if (syncBtn) {
        syncBtn.onclick = async () => {
          const res = await opmApi('/api/ccm/backup-device', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
          showToast(opmApiMessage(res, res.ok ? 'Backup requested.' : 'Backup could not be started.'), res.ok ? 'success' : 'error');
        };
      }
      const rollbackBtn = modal.querySelector('#opm-ncm-rollback-btn');
      if (rollbackBtn) {
        rollbackBtn.onclick = async () => {
          const res = await opmApi('/api/ccm/resolve-drift', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
          showToast(opmApiMessage(res, res.ok ? 'Drift resolved.' : 'Rollback could not be performed.'), res.ok ? 'success' : 'error');
        };
      }
      const exportBtn = modal.querySelector('#opm-ncm-export-pdf-btn');
      if (exportBtn) {
        exportBtn.onclick = () => { window.print(); };
      }
    };

    modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; max-height: 92vh; overflow: hidden;">${opmModalLoading('Loading configuration diff…')}</div>`;
    modal.style.display = 'flex';
    (async () => {
      const res = await opmApi('/api/ccm/diff?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
      if (!res.ok || !res.data) {
        modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; overflow: hidden;">${opmModalError(opmApiMessage(res, 'Could not load the configuration diff.'))}<div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-ncm-diff-modal').style.display='none';" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close</button></div></div>`;
        return;
      }
      const diff = res.data;
      if (diff.reason) {
        modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 95vw; overflow: hidden;">${opmModalEmpty('No configuration to compare yet', 'Add a device and take a baseline backup first — the diff appears once running and startup configs both exist. ' + (diff.reason || ''))}<div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-ncm-diff-modal').style.display='none';" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close</button></div></div>`;
        return;
      }
      renderDiff(diff);
    })();
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
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">SNMP Trap Simulator (test tool)</div>
              <div style="font-size: 11px; color: #64748b;">Generates a local test trap preview only. It is not a received trap and is not sent to the live trap receiver.</div>
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
                  <option value="" disabled>No devices enrolled yet</option>
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
              <input type="text" value="Test only — no live listener" readonly style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #f8fafc; font-family: monospace;">
            </div>
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">SNMP Version &amp; Community</label>
              <input type="text" value="Test only — no community sent" readonly style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #f8fafc; font-family: monospace;">
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
      const vb = modal.querySelector('#sim-trap-varbinds-box');
      if (vb) vb.innerHTML += '<br><span style="color: #fbbf24;">Test trap generated locally for preview only — nothing was sent to the trap receiver.</span>';
      showToast('Test trap generated locally for preview only — nothing was sent to the trap receiver.');
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
        <span style="font-size: 10px; background: #49bd80; color: #fff; padding: 1px 6px; border-radius: 2px;">v12.9.204-GA</span>
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
              <span style="font-family: monospace; font-weight: 700; color: #0070e0;">12.9.204-GA</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">License Type:</span>
              <span id="opm-about-license" style="color: #16a34a; font-weight: 700;">—</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Registered Remote Probes:</span>
              <span style="font-weight: 700;">${(state.probes || []).filter(p => String(p.status || '').toLowerCase() === 'online').length} / ${state.probes.length} Online</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Database Engine:</span>
              <span id="opm-about-db" style="font-family: monospace;">—</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Java Runtime:</span>
              <span id="opm-about-jvm" style="font-family: monospace;">—</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 4px;">
              <span style="font-weight: 600;">Server Uptime:</span>
              <span id="opm-about-uptime">—</span>
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
    // Live facts only: version/JVM/OS from the server, licence from the
    // server. Uptime and database engine are shown only if the server
    // reports them; otherwise "—", never an invented value.
    (async () => {
      const sys = await opmApi('/api/admin/GetSystemInformation', { credentials: 'same-origin' });
      const d = sys.ok && sys.data ? sys.data : {};
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = (v === null || v === undefined || v === '') ? '—' : String(v); };
      set('opm-about-jvm', d.jvmInfo && d.jvmInfo.javaVersion);
      set('opm-about-db', d.dbInfo && (d.dbInfo.engine || d.dbInfo.type));
      set('opm-about-uptime', d.uptime || d.serverUptime || d.osInfo && d.osInfo.uptime);
      const lic = await opmApi('/api/settings/license', { credentials: 'same-origin' });
      const l = lic.ok && lic.data && lic.data.license ? lic.data.license : null;
      set('opm-about-license', l ? ((l.edition || l.licenseType || '') + (l.probesAllowed === -1 ? ' (Unlimited Probes)' : '')) : null);
    })();
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
        <div id="opm-profile-name" style="font-weight: 700; color: #0f172a; font-size: 13px;">—</div>
        <div id="opm-profile-email" style="font-size: 11px; color: #64748b;">—</div>
        <div id="opm-profile-role" style="font-size: 10px; font-weight: 600; color: #16a34a; margin-top: 4px;">—</div>
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
    (async () => {
      const s = await opmApi('/api/auth/session', { credentials: 'same-origin' });
      const u = s.ok && s.data && s.data.user ? s.data.user : null;
      const set = (id, v) => { const el = pop.querySelector('#' + id); if (el) el.textContent = v || '—'; };
      set('opm-profile-name', u && (u.username || u.name));
      set('opm-profile-email', u && (u.email || u.username));
      set('opm-profile-role', u && u.role ? ('● ' + u.role) : null);
    })();
    const logout = pop.querySelector('#logout-btn');
    if (logout) {
      logout.onclick = async () => {
        try { await opmApi('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
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
        ${state.alarms.length === 0 ? `<div style="padding: 30px 16px; text-align: center;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No notifications yet</div><div style="font-size: 11px; color: #64748b;">Alarms and system notices will appear here.</div></div>` : ''}
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
    if (markRead) {
      if (!state.alarms.length) {
        markRead.style.opacity = '0.5';
        markRead.style.pointerEvents = 'none';
        markRead.title = 'Nothing to mark as read';
      }
      markRead.onclick = async () => {
        const res = await opmApi('/api/dashboard/clearUserNotification', { method: 'POST', credentials: 'same-origin' });
        if (res.ok) {
          showToast('All notifications marked as read.');
          const badge = document.querySelector('.opm-bell-badge');
          if (badge) badge.style.display = 'none';
          pop.style.display = 'none';
        } else {
          showToast(opmApiMessage(res, 'Could not mark notifications as read.'), 'error');
        }
      };
    }
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
    pop.querySelector('#ql-backup').onclick = async () => {
      pop.style.display = 'none';
      const dev = state.devices && state.devices[0];
      if (!dev) { showToast('No devices to back up yet — add a device first.', 'error'); return; }
      const res = await opmApi('/api/ccm/backup-device', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
      showToast(opmApiMessage(res, res.ok ? 'Backup requested.' : 'Backup could not be started.'), res.ok ? 'success' : 'error');
    };
    pop.querySelector('#ql-snmp').onclick = () => { pop.style.display = 'none'; showMibBrowserModal(); };
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
          <span style="background: #f1f5f9; color: #64748b; font-weight: 700; padding: 2px 8px; border-radius: 10px; font-size: 11px;">—</span>
        </div>
      </div>
      <div style="padding: 12px 16px; font-size: 11px; line-height: 1.6; color: #475569;">
        <div style="margin-bottom: 4px;">Loading security score…</div>
      </div>
    `;
    pop.style.display = 'block';
    (async () => {
      const res = await opmApi('/api/v2/admin/getSecurityScore', { credentials: 'same-origin' });
      const d = (res.ok && res.data) ? res.data : null;
      const score = d ? (d.score ?? d.SecurityScore) : null;
      const row = (label, v) => `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>${label}</span><span style="color: #64748b; font-weight: 600;">${opmEsc(v === null || v === undefined || v === '' ? '—' : String(v))}</span></div>`;
      pop.innerHTML = `
      <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #0f172a; font-size: 13px;">Security Posture</span>
          <span style="background: ${score === null ? '#f1f5f9' : '#dcfce7'}; color: ${score === null ? '#64748b' : '#166534'}; font-weight: 700; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${score === null ? '—' : opmEsc(String(score)) + (d.grade ? ' (' + opmEsc(String(d.grade)) + ')' : '')}</span>
        </div>
      </div>
      <div style="padding: 12px 16px; font-size: 11px; line-height: 1.6; color: #475569;">
        ${row('Probe TLS Encryption:', d ? d.tls : null)}
        ${row('SNMP v3 Enforcement:', d ? d.snmpV3 : null)}
        ${row('Configuration Drift:', d ? d.drift : null)}
        ${score === null ? '<div style="margin-top: 6px; color: #64748b;">No security assessment run yet — run a security assessment to populate this panel.</div>' : ''}
      </div>
    `;
    })();
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
            <span style="font-size: 11px; color: #0284c7; font-weight: 600;">${p.devicesCount ?? p.devices ?? '—'} Managed Nodes</span>
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
            else if (act === 'ping') showNetworkToolsModal(null, 'ping');
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
    const dev = targetDev || (state.devices && state.devices[0]) || null;
    const rule = ruleTitle || null;
    if (!rule || !dev) {
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;"><div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine NCM Automated Policy Remediation Fixlet</div></div>
        ${opmModalEmpty('No remediation available', 'Remediation fixlets appear here when a compliance rule fails on a real device.')}
        <div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-ncm-remed-modal').style.display='none';" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button></div>
      </div>`;
      modal.style.display = 'flex';
      return;
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine NCM Automated Policy Remediation Fixlet</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">${opmEsc(dev.name)} (${opmEsc(dev.ip)})</strong> &bull; Monitored via ${opmEsc(dev.probe || '—')}</div>
            </div>
          </div>
          <span id="close-ncm-remed-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #991b1b;">Violated Policy Rule: ${opmEsc(rule)}</div>
              <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">This rule failed on the target device. Review the proposed remediation script below — it has not been executed.</div>
            </div>
            <span style="background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 3px;">NON-COMPLIANT</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Proposed Remediation Script (not executed yet):</div>
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
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; color: #64748b;">Remediation execution is not available yet — no config push endpoint is configured.</div>
            <div style="display: flex; gap: 10px;">
              <button id="ncm-cancel-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button id="ncm-execute-script-btn" disabled title="Remediation execution is not available yet — no config push endpoint is configured." style="background: #94a3b8; border: none; color: #fff; padding: 7px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: not-allowed;">▶ Push Config via Probe SSH</button>
            </div>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    modal.querySelector('#close-ncm-remed-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ncm-cancel-btn').onclick = () => { modal.style.display = 'none'; };
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
    // Caller-supplied link data (from a real view) is rendered as-is; when
    // nothing is supplied, the first discovered interface of the first
    // device is used. No link is ever invented.
    const render = (l, dev, error) => {
      const name = (l && l.name) || (dev ? `${dev.name || '—'} WAN link` : 'WAN Link');
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 660px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">WAN</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine Business View &bull; WAN Link Telemetry</div>
              <div style="font-size: 11px; color: #64748b;">${opmEsc(name)}</div>
            </div>
          </div>
          <span id="close-wan-link-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${error ? opmModalError(error) : ''}
          ${!error && !l ? opmModalEmpty('No WAN link data yet', 'Add a device and discover its interfaces — link rates, latency and errors appear here once interface counters are polled.') : ''}
          ${l ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${opmEsc(l.carrier || l.name || '—')}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Latency: <strong>${opmEsc(l.rtt || '—')}</strong> &bull; Packet Loss: <strong>${opmEsc(l.loss || '—')}</strong> &bull; MTU: <strong>${opmEsc(l.mtu || '—')}</strong></div>
            </div>
            <span style="background: #16a34a; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">${opmEsc(l.status || '—')}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Near-End (Source CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">${opmEsc(l.src || '—')}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">${opmEsc(l.srcInf || '—')}</div>
              <div style="font-size: 12px; color: #16a34a; font-weight: 700; margin-top: 6px;">IN: ${opmEsc(l.inRate || '—')}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Far-End (Destination CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">${opmEsc(l.dst || '—')}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">${opmEsc(l.dstInf || '—')}</div>
              <div style="font-size: 12px; color: #0284c7; font-weight: 700; margin-top: 6px;">OUT: ${opmEsc(l.outRate || '—')}</div>
            </div>
          </div>
          ${l.discards ? `<div style="font-size: 11px; color: #64748b; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px;"><strong>Interface Health:</strong> ${opmEsc(l.discards)}</div>` : ''}
          ` : ''}
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="wan-link-ipsla-btn" style="background: #10b981; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">📞 Cisco IP SLA VoIP</button>
            <button id="wan-link-poll-btn" ${dev ? '' : 'disabled title="Re-poll needs a device first." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;"'} ${dev ? 'style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;"' : ''}>⚡ Re-poll Link Interfaces</button>
            <button id="wan-link-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-wan-link-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#wan-link-close-btn').onclick = () => { modal.style.display = 'none'; };
      const ipslaBtn = modal.querySelector('#wan-link-ipsla-btn');
      if (ipslaBtn) ipslaBtn.onclick = () => { showIpSlaVoipModal(l); };
      const pBtn = modal.querySelector('#wan-link-poll-btn');
      if (pBtn && dev) {
        pBtn.onclick = async () => {
          const res = await opmApi('/api/devices/' + encodeURIComponent(dev.id) + '/poll-now', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
          showToast(opmApiMessage(res, res.ok ? 'Link interfaces re-polled.' : 'Re-poll failed.'), res.ok ? 'success' : 'error');
          if (res.ok) load();
        };
      }
    };
    const load = async () => {
      if (linkData && (linkData.srcInf || linkData.dstInf || linkData.inRate || linkData.outRate || linkData.rtt)) {
        render(linkData, (state.devices && state.devices[0]) || null, null);
        return;
      }
      const dev = (state.devices && state.devices[0]) || null;
      if (!dev) { render(null, null, null); return; }
      modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 660px; max-width: 95vw; overflow: hidden;">${opmModalLoading('Loading WAN link telemetry…')}</div>`;
      modal.style.display = 'flex';
      const res = await opmApi('/api/devices/' + encodeURIComponent(dev.id) + '/interfaces', { credentials: 'same-origin' });
      if (!res.ok || !res.data) { render(null, dev, opmApiMessage(res, 'Could not load interface counters.')); return; }
      const ifaces = Array.isArray(res.data.interfaces) ? res.data.interfaces : [];
      if (!ifaces.length) { render(null, dev, null); return; }
      const inf = ifaces[0];
      render({
        name: `${dev.name || '—'} <--> ${inf.name || '—'}`,
        carrier: 'WAN Link',
        src: `${dev.name || '—'} (${dev.ip || '—'})`,
        dst: `${inf.name || '—'}`,
        srcInf: inf.name || '—',
        dstInf: inf.descr || '—',
        speed: inf.speed || '—',
        rtt: (dev.responseTime !== undefined && dev.responseTime !== null) ? (dev.responseTime + ' ms') : '—',
        inRate: (inf.inTraffic !== undefined && inf.inTraffic !== null) ? (inf.inTraffic + ' Mbps') : '—',
        outRate: (inf.outTraffic !== undefined && inf.outTraffic !== null) ? (inf.outTraffic + ' Mbps') : '—',
        status: inf.oper || '—',
        discards: (inf.errors !== undefined && inf.errors !== null) ? (inf.errors + ' errors') : null
      }, dev, null);
    };
    load();
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
    const monitoredTarget = dev ? `${dev.name} (${dev.ip})` : `Central NetFlow Listener (${window.location.hostname || '—'})`;
    const records = [];

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
                    <div>Configure NetFlow / IPFIX exporter on your routers/switches to UDP 2055 or 9996 on ${window.location.hostname || '—'}.</div>
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
          <span>ManageEngine NetFlow Collector Engine &bull; No flow records ingested yet</span>
          <button id="nfa-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Stream</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-nfa-records-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-export-pcap-btn').onclick = () => {
      showToast('Nothing to export yet — no flow records captured.', 'error');
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

    const host = targetIp || '';
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
            <input type="text" id="mib-host-input" value="${host}" placeholder="Enter device IP" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 130px; font-family: monospace;">
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

    modal.querySelector('#mib-btn-get').onclick = async () => {
      const targetOid = oidInput.value.trim();
      const targetHost = (modal.querySelector('#mib-host-input').value || '').trim();
      if (!targetHost) { showToast('Enter a target IP address first.', 'error'); return; }
      if (!targetOid) { showToast('Enter an OID first.', 'error'); return; }
      const node = mibNodes.find(n => n.oid === targetOid) || { name: 'leafNode', type: 'OCTET STRING' };
      logPdu(`Sent GetRequest-PDU to ${targetHost}:161 for ${targetOid}`, '#94a3b8');
      const res = await opmApi('/api/tools/snmp-query', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: targetHost, oid: targetOid }) });
      if (res.ok && res.data) {
        logPdu(`Received Response-PDU from ${targetHost} (errStatus=0, errIndex=0): ${res.data.oid || targetOid} (${res.data.name || node.name}) = ${res.data.type || node.type}: "${res.data.value}"`, '#4ade80');
      } else {
        logPdu(`SNMP GET failed: ${opmApiMessage(res, 'No response from ' + targetHost)}`, '#f87171');
        showToast(opmApiMessage(res, 'SNMP GET failed.'), 'error');
      }
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

    modal.querySelector('#mib-btn-walk').onclick = async () => {
      const targetHost = (modal.querySelector('#mib-host-input').value || '').trim();
      if (!targetHost) { showToast('Enter a target IP address first.', 'error'); return; }
      const rootOid = (oidInput.value || '').trim() || '.1.3.6.1.2.1.1';
      logPdu(`Executing SNMP Walk tree on ${targetHost} starting at ${rootOid}...`, '#38bdf8');
      const res = await opmApi('/api/tools/snmp-walk', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: targetHost, rootOid }) });
      if (res.ok && res.data && Array.isArray(res.data.results)) {
        if (res.data.results.length === 0) logPdu('Walk returned no varbinds for ' + rootOid + '.', '#fbbf24');
        res.data.results.forEach(vb => {
          logPdu(`${vb.oid} = ${vb.type || ''}: "${vb.value}"`, '#4ade80');
        });
      } else {
        logPdu(`SNMP Walk failed: ${opmApiMessage(res, 'No response from ' + targetHost)}`, '#f87171');
        showToast(opmApiMessage(res, 'SNMP Walk failed.'), 'error');
      }
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
    const srcName = (linkData && linkData.src) || (state.devices && state.devices[0]?.name) || null;
    const dstName = (linkData && linkData.dst) || (state.devices && state.devices[1]?.name) || null;
    const linkName = (linkData && linkData.name) || (srcName && dstName ? `${srcName} <--> ${dstName} Link` : null);
    if (!srcName || !dstName) {
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 780px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine Cisco IP SLA &bull; VoIP &amp; Jitter Telemetry</div>
          <span id="close-ipsla-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        ${opmModalEmpty('No IP SLA data yet', 'Select a device first, then configure an IP SLA operation on the link to measure jitter, MOS and packet loss.')}
        <div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-ipsla-voip-modal').style.display='none';" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button></div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-ipsla-modal-btn').onclick = () => { modal.style.display = 'none'; };
      return;
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 780px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #10b981; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800;">VoIP</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine Cisco IP SLA &bull; VoIP &amp; Jitter Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8;">${opmEsc(linkName)}</div>
            </div>
          </div>
          <span id="close-ipsla-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 22px;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">VoIP MOS Score</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">—</div>
              <span style="font-size: 10px; color: #64748b;">No measurement yet</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Round Trip Time</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">—</div>
              <span style="font-size: 10px; color: #64748b;">No measurement yet</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average Jitter</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">—</div>
              <span style="font-size: 10px; color: #64748b;">No measurement yet</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Packet Loss</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">—</div>
              <span style="font-size: 10px; color: #64748b;">No measurement yet</span>
            </div>
          </div>
          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <div style="color: #64748b;">Source: <strong style="color: #0f172a;">${opmEsc(srcName)}</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Destination: <strong style="color: #0f172a;">${opmEsc(dstName)}</strong></div>
            </div>
            <div>
              <div style="color: #64748b;">Codec: <strong style="color: #0f172a;">—</strong></div>
              <div style="color: #64748b; margin-top: 4px;">IP SLA Compliance: <strong style="color: #0f172a;">—</strong></div>
            </div>
          </div>
          ${opmModalEmpty('No IP SLA measurements yet', 'Configure an IP SLA operation on this link first — jitter samples, MOS and packet loss appear here once the operation reports.')}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="ipsla-test-btn" disabled title="IP SLA test is not available yet — no IP SLA source is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: not-allowed;">⚡ Trigger On-Demand 1,000 Pkt Test</button>
            <button id="close-ipsla-bottom-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    modal.querySelector('#close-ipsla-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-ipsla-bottom-btn').onclick = () => { modal.style.display = 'none'; };
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

    const dev = targetDev || (state.devices && state.devices[0]) || null;
    if (!dev) {
      modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">${opmModalEmpty('Select a device first', 'Downtime scheduling needs a target device — add a device first, then schedule its maintenance window.')}<div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-schedule-downtime-modal').style.display='none';" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button></div></div>`;
      modal.style.display = 'flex';
      return;
    }

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
              ${(state.devices || []).map(d => `<option value="${d.id}" ${d.name === dev.name ? 'selected' : ''}>${d.name} (${d.ip}) - ${d.type || '—'}</option>`).join('')}
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
              <input type="text" id="downtime-chg-ref" placeholder="e.g. CHG-2026-9812" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
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
            <textarea id="downtime-reason-input" placeholder="e.g. Scheduled software patching and power-supply failover verification." style="width: 100%; height: 50px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-family: sans-serif; box-sizing: border-box;"></textarea>
          </div>

          <!-- Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; color: #64748b;">Downtime scheduling is not available yet — no downtime endpoint is configured.</div>
            <div style="display: flex; gap: 10px;">
              <button id="cancel-downtime-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">Cancel</button>
              <button id="save-downtime-btn" disabled title="Downtime scheduling is not available yet — no downtime endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 18px; border-radius: 4px; font-weight: 800; cursor: not-allowed;">🛡️ Activate Downtime Window</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('#close-downtime-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#cancel-downtime-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#save-downtime-btn').onclick = () => {
      showToast('Downtime scheduling is not available yet — no downtime endpoint is configured. No downtime was scheduled.', 'error');
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
            <input type="text" id="wf-name-input" placeholder="e.g. Core Switch Auto-Remediation" style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #0f172a;">
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
              <option value="all">All Enterprise Devices</option>
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
            ▶ Test Run Playbook
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
      consoleBox.style.display = 'block';
      consoleBox.innerHTML = '<span style="color: #94a3b8;">Loading workflows…</span><br>';
      const list = await opmApi('/api/workflows/list', { credentials: 'same-origin' });
      const workflows = (list.ok && list.data && Array.isArray(list.data.workflows)) ? list.data.workflows : [];
      if (!workflows.length) {
        consoleBox.innerHTML = '<span style="color: #fbbf24;">No workflows configured yet — create one first.</span>';
        return;
      }
      const wf = workflows[0];
      consoleBox.innerHTML = `<span style="color: #94a3b8;">Executing workflow "${opmEsc(wf.name)}" (${opmEsc(wf.id)})…</span><br>`;
      const res = await opmApi('/api/workflows/execute', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflowId: wf.id }) });
      if (res.ok && res.data) {
        const logs = Array.isArray(res.data.logs) ? res.data.logs : [res.data.message || 'Workflow executed.'];
        consoleBox.innerHTML = logs.map(l => `<span style="color: #4ade80;">${opmEsc(l)}</span>`).join('<br>');
        showToast(opmApiMessage(res, 'Workflow executed.'));
      } else {
        consoleBox.innerHTML = `<span style="color: #f87171;">Execution failed: ${opmEsc(opmApiMessage(res, 'Workflow execution failed.'))}</span>`;
        showToast(opmApiMessage(res, 'Workflow execution failed.'), 'error');
      }
    };

    modal.querySelector('#wf-save-btn').onclick = () => {
      // No workflow-create endpoint exists on the server yet: report that
      // honestly instead of claiming the playbook was deployed.
      showToast('Workflow saving is not available yet — no workflow was created.', 'error');
    };
  }

  // -------------------------------------------------------------
  // MODAL: OPUTILS 48-PORT SWITCH PORT MAPPER (SPM) & ROGUE MAC
  // -------------------------------------------------------------
  function showSwitchPortMapperModal(switchDev) {
    let modal = document.getElementById('opm-port-mapper-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-port-mapper-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const dev = (switchDev && typeof switchDev === 'object') ? switchDev
      : (switchDev ? (state.devices || []).find(d => d.id == switchDev) : null)
      || (state.devices && state.devices[0]) || null;
    let ports = [];
    const render = (error) => {
      const name = dev ? (dev.name || '—') : '—';
      const ip = dev ? (dev.ip || '—') : '—';
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 980px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Switch Port Mapper</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(name)} (${opmEsc(ip)}) &bull; ${ports.length} port(s) discovered via SNMP ifTable</div>
          </div>
          <span id="close-port-mapper-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px; overflow-y: auto;">
          ${error ? opmModalError(error) : ''}
          ${!error && !dev ? opmModalEmpty('Select a device first', 'Add a switch to map its ports — port data comes from a live SNMP ifTable walk.') : ''}
          ${!error && dev && !ports.length ? opmModalEmpty('No switch ports discovered yet', 'Run a switch-port discovery (ifTable walk) on this switch — ports appear here once they are discovered.') : ''}
          ${ports.length ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left;">
              <th style="padding: 8px 10px;">Port</th><th style="padding: 8px 10px;">Alias</th><th style="padding: 8px 10px;">Admin</th><th style="padding: 8px 10px;">Oper</th><th style="padding: 8px 10px;">Speed</th><th style="padding: 8px 10px;">VLAN</th><th style="padding: 8px 10px;">MAC</th><th style="padding: 8px 10px;">IP</th>
            </tr></thead>
            <tbody>
              ${ports.map(p => `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 10px; font-weight: 700; color: #0070e0;">${opmEsc(p.port || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(p.alias || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(p.adminStatus || '—')}</td>
                <td style="padding: 8px 10px; font-weight: 700; color: ${String(p.operStatus || '').toLowerCase() === 'up' ? '#16a34a' : '#dc2626'};">${opmEsc(p.operStatus || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(p.speed || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(p.vlan === null || p.vlan === undefined ? '—' : String(p.vlan))}</td>
                <td style="padding: 8px 10px; font-family: monospace;">${opmEsc(p.mac || '—')}</td>
                <td style="padding: 8px 10px; font-family: monospace;">${opmEsc(p.ip || '—')}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : ''}
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button id="port-mapper-refresh-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Refresh ports</button>
            <button id="port-mapper-export-btn" ${ports.length ? '' : 'disabled title="Nothing to export yet."'} style="background: ${ports.length ? '#0070e0' : '#94a3b8'}; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: ${ports.length ? 'pointer' : 'not-allowed'};">Export CSV</button>
            <button id="port-mapper-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-port-mapper-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#port-mapper-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#port-mapper-refresh-btn').onclick = () => { load(); };
      modal.querySelector('#port-mapper-export-btn').onclick = () => {
        if (!ports.length) { showToast('Nothing to export yet — no ports discovered.', 'error'); return; }
        const csv = 'port,alias,admin,oper,speed,vlan,mac,ip\n' + ports.map(p => [p.port, p.alias, p.adminStatus, p.operStatus, p.speed, p.vlan, p.mac, p.ip].map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'switch-port-map.csv';
        a.click();
        showToast(`Exported ${ports.length} switch port(s) as CSV.`);
      };
    };
    const load = async () => {
      if (!dev) { render(null); return; }
      modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 980px; max-width: 95vw; overflow: hidden;">${opmModalLoading('Loading switch ports…')}</div>`;
      modal.style.display = 'flex';
      const res = await opmApi('/api/tools/switch-ports?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
      if (!res.ok || !res.data) { ports = []; render(opmApiMessage(res, 'Could not load switch ports.')); return; }
      ports = Array.isArray(res.data.ports) ? res.data.ports : [];
      render(null);
    };
    load();
  }

  // -------------------------------------------------------------
  // MODAL: STORAGE ARRAY & LUN LATENCY INSPECTOR
  // -------------------------------------------------------------
  function showStorageArrayModal(targetArray) {
    let modal = document.getElementById('opm-storage-array-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-storage-array-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const dev = (targetArray && typeof targetArray === 'object') ? targetArray
      : (targetArray ? (state.devices || []).find(d => d.id == targetArray) : null)
      || (state.devices && state.devices[0]) || null;
    const render = (hw, error) => {
      const name = (hw && (hw.deviceName || hw.model)) || (dev && dev.name) || '—';
      const ip = (hw && hw.ip) || (dev && dev.ip) || '—';
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">SAN</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Storage Array — ${opmEsc(name)}</div>
              <div style="font-size: 11px; color: #64748b;">${opmEsc(ip)} &bull; Hardware inventory reported by the device over SNMP</div>
            </div>
          </div>
          <span id="close-storage-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${error ? opmModalError(error) : ''}
          ${!error && !hw ? opmModalEmpty('No storage data reported yet', 'Poll the device or check its SNMP credentials — capacity, IOPS and volume data appear here once the device reports them.') : ''}
          ${hw ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 12px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">MODEL</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${opmEsc(hw.model || '—')}</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">SERIAL NUMBER</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px; font-family: monospace;">${opmEsc(hw.serialNumber || '—')}</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">TOTAL RAM</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${opmEsc(hw.totalRam || '—')}</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">FLASH MEMORY</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${opmEsc(hw.flashMemory || '—')}</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">CACHE HIT RATE</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px;">—</div></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 11px; font-weight: 700; color: #64748b;">IOPS</div><div style="font-weight: 700; color: #0f172a; margin-top: 4px;">—</div></div>
          </div>
          <div style="font-size: 12px; color: #64748b;">No storage volumes reported yet — volume and LUN data appear here once the device reports them.</div>
          ` : ''}
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button id="storage-poll-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Re-poll Storage</button>
            <button id="storage-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-storage-modal-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#storage-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#storage-poll-btn').onclick = () => { load(); };
    };
    const load = async () => {
      if (!dev) {
        render(null, null);
        modal.querySelector('#storage-poll-btn').style.display = 'none';
        return;
      }
      modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; overflow: hidden;">${opmModalLoading('Loading storage inventory…')}</div>`;
      modal.style.display = 'flex';
      const res = await opmApi('/api/hardware/details?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
      if (res.ok && res.data && res.data.hardware) render(res.data.hardware, null);
      else if (res.ok && res.data && res.data.hardware === null) render(null, null);
      else render(null, opmApiMessage(res, 'Could not load storage inventory.'));
    };
    load();
  }

  // -------------------------------------------------------------
  // MODAL: SSL / TLS CERTIFICATE CHAIN & CIPHER SUITE INSPECTOR
  // -------------------------------------------------------------
  function showSslCertificateModal(targetHost) {
    let modal = document.getElementById('opm-ssl-cert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ssl-cert-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const host = (targetHost && (targetHost.name || targetHost)) || window.location.hostname || '—';
    const render = (ssl, error) => {
      const cert = ssl && ssl.certificate ? ssl.certificate : null;
      const certRows = cert && typeof cert === 'object' ? Object.entries(cert).map(([k, v]) => `
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;"><span style="color: #64748b;">${opmEsc(k)}</span><span style="font-weight: 600; color: #0f172a;">${opmEsc(v === null || v === undefined ? '—' : String(v))}</span></div>`).join('') : '';
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">SSL / TLS Certificate</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(typeof host === 'string' ? host : '—')}</div>
          </div>
          <span id="close-ssl-cert-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${error ? opmModalError(error) : ''}
          ${!error && !ssl ? opmModalEmpty('No custom certificate installed', 'Upload a certificate or keep the built-in one.') : ''}
          ${ssl ? `
          <div style="font-size: 12px; color: #334155; line-height: 1.8;">
            <div><strong>Status:</strong> ${opmEsc(ssl.status || '—')}</div>
            <div><strong>HTTPS enabled:</strong> ${ssl.httpsEnabled ? 'Yes' : 'No'}</div>
            <div><strong>HTTPS port:</strong> ${opmEsc(ssl.httpsPort === null || ssl.httpsPort === undefined ? '—' : String(ssl.httpsPort))}</div>
            <div><strong>TLS versions:</strong> ${opmEsc(Array.isArray(ssl.tlsVersions) && ssl.tlsVersions.length ? ssl.tlsVersions.join(', ') : '—')}</div>
            <div><strong>Cipher suite:</strong> ${opmEsc(ssl.cipherSuite || '—')}</div>
          </div>
          ${cert ? `<div style="margin-top: 14px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;"><div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Certificate</div>${certRows}</div>` : '<div style="margin-top: 14px; font-size: 12px; color: #64748b;">No certificate details stored — no TLS rating is claimed without a real probe.</div>'}
          ` : ''}
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button id="ssl-test-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Verify TLS</button>
            <button id="ssl-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-ssl-cert-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#ssl-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#ssl-test-btn').onclick = async () => {
        const res = await opmApi('/api/settings/ssl/test', { method: 'POST', credentials: 'same-origin' });
        showToast(opmApiMessage(res, res.ok ? 'TLS verification completed.' : 'TLS verification is not available.'), res.ok ? 'success' : 'error');
      };
    };
    modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; overflow: hidden;">${opmModalLoading('Loading SSL / TLS settings…')}</div>`;
    modal.style.display = 'flex';
    (async () => {
      const res = await opmApi('/api/settings/ssl', { credentials: 'same-origin' });
      if (!res.ok || !res.data) render(null, opmApiMessage(res, 'Could not load SSL / TLS settings.'));
      else render(res.data.ssl || null, null);
    })();
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
              <div style="font-size: 11px; color: #94a3b8;">Step-by-step enterprise ITOM walkthroughs for v12.9.204-GA</div>
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
    const dev = (state.devices || []).find(d => d.name === alm.device) || null;
    const availability = dev && dev.availability !== undefined && dev.availability !== null && dev.availability !== '' ? dev.availability : null;
    drawer.innerHTML = `
      <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${getStatusBadge(alm.severity)}
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${opmEsc(alm.device)}</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(alm.probe || '—')} • Entity: ${opmEsc(alm.entity || '—')}</div>
          </div>
        </div>
        <button id="close-drawer-btn" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 24px;">
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 16px;">✨</span>
            <span style="font-size: 13px; font-weight: 700; color: #5b21b6;">Zia AI Anomaly Correlation & Root Cause Analysis</span>
          </div>
          <p style="font-size: 12px; color: #4c1d95; line-height: 1.5; margin-bottom: 10px;">
            Alarm on ${opmEsc(alm.device)} (${opmEsc(alm.probe || 'Central Probe')}): &ldquo;${opmEsc(alm.message)}&rdquo;.
          </p>
          <div style="background: #ffffff; border: 1px solid #c4b5fd; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #5b21b6;">
            <strong>Recommended Action:</strong> Inspect real-time SNMP/WMI telemetry metrics and verify health threshold state on ${opmEsc(alm.device)}.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #ffffff; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 6px;">Availability (Last 24 Hours)</div>
          ${availability !== null
            ? `<div style="font-size: 12px; color: #334155;">Up Time: <strong>${opmEsc(String(availability))}${String(availability).includes('%') ? '' : '%'}</strong></div>`
            : '<div style="font-size: 12px; color: #64748b;">No availability history yet for this device.</div>'}
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #fafbfc; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">NetFlow Alert Traffic Drilldown (IN / OUT)</div>
          <div style="font-size: 12px; color: #64748b;">No NetFlow drilldown data for this alarm yet — flow records appear here once a NetFlow exporter reports traffic for this device.</div>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Full Alert Telemetry</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; font-size: 12px; line-height: 1.8; margin-bottom: 20px;">
          <div><strong>Message:</strong> ${opmEsc(alm.message)}</div>
          <div><strong>First Occurred:</strong> ${opmEsc(alm.firstSeen || alm.time || '—')}</div>
          <div><strong>Last Occurred:</strong> ${opmEsc(alm.time || '—')}</div>
          <div><strong>Repeat Count:</strong> ${opmEsc(alm.repeatCount === null || alm.repeatCount === undefined ? '—' : String(alm.repeatCount))}</div>
          <div><strong>Assigned Technician:</strong> <span style="color: #0070e0; font-weight: 600;">${opmEsc(alm.technician || 'Unassigned')}</span></div>
          <div><strong>Last Operator Note:</strong> ${opmEsc(alm.lastNote || 'None recorded')}</div>
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
    const rerenderAlarms = () => {
      const c = document.getElementById('opm-custom-suite-container');
      if (c) {
        if (state.currentTab === 'dashboard' && typeof renderDashboardView === 'function') renderDashboardView(c);
        else if (state.currentTab === 'alarms' && typeof renderAlarmsView === 'function') renderAlarmsView(c);
      }
    };

    document.getElementById('close-drawer-btn').onclick = () => { drawer.style.display = 'none'; };
    document.getElementById('drawer-add-note-btn').onclick = async () => {
      const note = (document.getElementById('drawer-note-input').value || '').trim();
      if (!note) { showToast('Type a note first.', 'error'); return; }
      const res = await opmApi('/api/json/alarms/addNotes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alarmId: alm.id, note }) });
      showToast(opmApiMessage(res, res.ok ? 'Note added.' : 'Note could not be saved.'), res.ok ? 'success' : 'error');
    };
    document.getElementById('drawer-ack-btn').onclick = async () => {
      const res = await opmApi('/api/json/alarms/acknowledge', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alarmId: alm.id }) });
      if (res.ok && res.data && res.data.alarm) {
        const idx = state.alarms.findIndex(a => a.id === alm.id);
        if (idx >= 0) state.alarms[idx] = Object.assign({}, state.alarms[idx], res.data.alarm);
        alm.status = 'Acknowledged';
        showToast(opmApiMessage(res, 'Alarm acknowledged.'));
        drawer.style.display = 'none';
        rerenderAlarms();
      } else {
        showToast(opmApiMessage(res, 'Could not acknowledge alarm.'), 'error');
      }
    };
    document.getElementById('drawer-clear-btn').onclick = async () => {
      const res = await opmApi('/api/json/alarms/clear', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alarmId: alm.id }) });
      if (res.ok) {
        state.alarms = state.alarms.filter(a => a.id !== alm.id);
        showToast(opmApiMessage(res, 'Alarm cleared.'));
        drawer.style.display = 'none';
        rerenderAlarms();
      } else {
        showToast(opmApiMessage(res, 'Could not clear alarm.'), 'error');
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
          ? `Currently monitoring ${devCount} core nodes across ${prbCount} distributed probes. Primary attention is required on ${critAlarms[0].device} reporting: "${critAlarms[0].message}".`
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
          credentials: 'same-origin',
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
              ${data.response.confidence ? `<span style="font-size: 10px; background: #e0e7ff; color: #4338ca; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Confidence: ${opmEsc(data.response.confidence)}</span>` : ''}
            </div>
            <div>${data.response.summary.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')}</div>
            ${recHtml}
            ${devHtml}
          `;
        } else {
          area.innerHTML = '<strong>Zia AI:</strong> Could not reach the Zia service — check the connection and try again.';
        }
      } catch (e) {
        area.innerHTML = '<strong>Zia AI:</strong> Could not reach the Zia service — check the connection and try again.';
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
                <option value="v2c">SNMP v2c</option>
                <option value="v3">SNMP v3</option>
                <option value="wmi">WMI / Windows</option>
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
    // Ensure probe select is up-to-date with current probes
    const probeSelect = modal.querySelector('#new-dev-probe');
    if (probeSelect && state.probes && state.probes.length > 0) {
      probeSelect.innerHTML = state.probes.map(p => `<option value="${p.id}">${p.name} (${p.location || p.ip})</option>`).join('');
    }

    modal.style.display = 'flex';
    document.getElementById('close-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancel-add-dev-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('save-add-dev-btn').onclick = async () => {
      const ip = document.getElementById('new-dev-ip').value.trim();
      if (!ip) { showToast('Enter a device IP address or hostname first.', 'error'); return; }
      const probeRaw = document.getElementById('new-dev-probe').value;
      const probeId = probeRaw ? parseInt(probeRaw, 10) : null;
      const snmpVersion = document.getElementById('new-dev-snmp').value || undefined;
      // Only user-entered facts are sent. CPU/memory/serial/interfaces are
      // left unset — the poller measures them after the device is added.
      const res = await opmApi('/api/devices', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip, probeId, snmpVersion }) });
      if (!res.ok) { showToast(opmApiMessage(res, 'Could not add device.'), 'error'); return; }
      showToast(opmApiMessage(res, 'Device added.'));
      modal.style.display = 'none';
      if (typeof loadBackendData === 'function') loadBackendData();
      if (state.currentTab === 'inventory' && typeof renderInventoryView === 'function') {
        renderInventoryView();
      } else if (state.currentTab === 'dashboard' && typeof renderDashboardView === 'function') {
        renderDashboardView();
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
              <strong>Probe Architecture:</strong> Probes act as local data collectors at remote branch sites. Once registered, install the probe service on the remote host${window.location.host ? ` pointing to Central: <code style="color: #0070e0;">http://${window.location.host}</code>` : ''}.
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
      const ip = (document.getElementById('new-probe-ip').value || '').trim();
      const port = parseInt(document.getElementById('new-probe-port').value, 10) || 8060;
      if (!name) { showToast('Enter a branch / site name first.', 'error'); return; }
      if (!ip) { showToast('Enter a probe IP address or hostname first.', 'error'); return; }
      // The server verifies the probe is reachable, measures the real
      // round-trip, and issues a fresh enrollment key shown exactly once.
      // Nothing is added locally until the server confirms registration.
      const res = await opmApi('/api/probes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, ip, port }) });
      if (!res.ok || !res.data) { showToast(opmApiMessage(res, 'Could not register probe.'), 'error'); return; }
      const d = res.data;
      const rtt = d.verified && d.verified.rttMs !== undefined && d.verified.rttMs !== null ? d.verified.rttMs + ' ms' : '—';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #cbd5e1;">
          <div style="background: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 16px 22px;">
            <div style="font-size: 15px; font-weight: 700; color: #166534;">Probe registered: ${opmEsc(name)}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">${opmEsc(d.message || '')} Measured round-trip: ${opmEsc(rtt)}.</div>
          </div>
          <div style="padding: 22px; font-size: 12px; color: #334155;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Probe enrollment key — shown only once</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${opmEsc(d.authKeyNote || 'Store this key on the probe now — it is shown only once and cannot be recovered from Central.')}</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <code id="opm-new-probe-key" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 11px; word-break: break-all;">${opmEsc(d.authKey || '—')}</code>
              <button id="opm-copy-probe-key-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; color: #0070e0; font-weight: 600;">Copy key</button>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: flex-end;">
            <button id="opm-probe-done-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">Done</button>
          </div>
        </div>
      `;
      const copyBtn = document.getElementById('opm-copy-probe-key-btn');
      if (copyBtn) copyBtn.onclick = () => { const k = document.getElementById('opm-new-probe-key'); if (k) navigator.clipboard.writeText(k.textContent); showToast('Enrollment key copied to clipboard.'); };
      document.getElementById('opm-probe-done-btn').onclick = () => {
        modal.style.display = 'none';
        if (typeof loadBackendData === 'function') loadBackendData();
        if (state.currentTab === 'settings' && typeof renderSettingsView === 'function') renderSettingsView();
      };
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
    // No ServiceDesk endpoint exists: no ticket number is invented here.
    // The form below is display-only until the integration is connected.
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 560px; max-width: 95vw; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
        <div style="background: #1e1b4b; color: #ffffff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 24px; height: 24px; border-radius: 4px; background: #6366f1; color: #fff; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center;">SD</div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #a5b4fc;">ServiceDesk Plus Cloud Integration</div>
              <div style="font-size: 11px; color: #c7d2fe;">Create Enterprise Incident Ticket &bull; ServiceDesk Plus is not connected yet</div>
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
              <input type="text" value="${alarm.device}${alarm.ip ? ' (' + alarm.ip + ')' : ''}" readonly style="width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; color: #64748b;">
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
            <textarea rows="4" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 11px; font-family: monospace; box-sizing: border-box; line-height: 1.5;">${alarm.message}&#10;Managed by Probe: ${alarm.probe}&#10;Reported: ${alarm.time}</textarea>
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
    const sdpBtn = document.getElementById("submit-sdp-modal-btn");
    if (sdpBtn) {
      sdpBtn.disabled = true;
      sdpBtn.style.opacity = '0.5';
      sdpBtn.style.cursor = 'not-allowed';
      sdpBtn.title = 'ServiceDesk Plus is not connected yet — no ticket can be created.';
      sdpBtn.onclick = () => { showToast('ServiceDesk Plus is not connected — no ticket was created.', 'error'); };
    }
  }

  // --- MASTER MULTI-TAB DEVICE SNAPSHOT MODAL ---
  function showDeviceSnapshotModal(dev) {
    if (typeof dev === 'number' || typeof dev === 'string') {
      dev = state.devices.find(d => d.id == dev || d.id === 'dev_' + dev || d.name === dev) || null;
    }
    if (!dev) {
      let emptyModal = document.getElementById('device-snapshot-modal');
      if (!emptyModal) {
        emptyModal = document.createElement('div');
        emptyModal.id = 'device-snapshot-modal';
        emptyModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
        document.body.appendChild(emptyModal);
      }
      emptyModal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 640px; max-width: 95vw; overflow: hidden;">${opmModalEmpty('No device selected', 'Select a device from the inventory to see its snapshot.')}<div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('device-snapshot-modal').style.display='none';" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button></div></div>`;
      emptyModal.style.display = 'flex';
      return;
    }
    let modal = document.getElementById('device-snapshot-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'device-snapshot-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    let activeModalTab = 'summary';
    const isSwitch = (dev.category || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('catalyst') || (dev.type || '').toLowerCase().includes('nexus') || (dev.type || '').toLowerCase().includes('leaf') || (dev.type || '').toLowerCase().includes('procurve');
    let selectedPortNumber = 1;

    // Per-modal caches: undefined = not loaded yet, null = loaded with no data / failed.
    let snapHw = undefined;
    let snapIfaces = undefined;
    let snapPorts = undefined;
    let snapDiff = undefined;

    async function renderSnapshotBody() {
      const bodyContainer = modal.querySelector('#snapshot-body-container');
      if (!bodyContainer) return;

      const numOrNull = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) ? null : Number(v);
      const gaugeCard = (label, v, unit) => {
        const n = numOrNull(v);
        return `<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${opmEsc(label)}</div>
          <div style="font-size: 24px; font-weight: 800; color: ${n === null ? '#94a3b8' : '#0f172a'}; margin-top: 6px;">${n === null ? '—' : n + (unit || '')}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${n === null ? 'No data yet' : 'Last poll'}</div>
        </div>`;
      };
      const infoRow = (label, v) => `<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px;"><span style="color: #64748b;">${label}</span><span style="font-weight: 600; color: #0f172a;">${opmEsc(v === null || v === undefined || v === '' ? '—' : String(v))}</span></div>`;
      const rerenderIfStillOn = (tab) => {
        if (activeModalTab === tab && modal.style.display !== 'none') renderSnapshotBody();
      };

      // ---------------- SUMMARY ----------------
      if (activeModalTab === 'summary') {
        const hw = snapHw;
        const hwLoaded = hw !== undefined;
        const hwObj = (hw && hw.hardware) ? hw.hardware : null;
        const avail = numOrNull(dev.availability);
        let html = `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
          ${gaugeCard('CPU Utilization', dev.cpu, '%')}
          ${gaugeCard('Memory Utilization', dev.memory, '%')}
          ${gaugeCard('Disk Utilization', dev.disk, '%')}
        </div>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Device Details</div>
            ${infoRow('IP Address', dev.ip)}
            ${infoRow('Category', dev.category)}
            ${infoRow('Vendor', hwObj ? hwObj.vendor : '—')}
            ${infoRow('Model', hwObj ? hwObj.model : '—')}
            ${infoRow('Serial Number', hwObj ? hwObj.serialNumber : '—')}
            ${infoRow('OS Version', dev.osVersion)}
            ${infoRow('Last Poll', dev.lastPolledAt || dev.lastPoll)}
            ${infoRow('SNMP Response Time', numOrNull(dev.responseTime) === null ? '—' : (dev.responseTime + ' ms'))}
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Availability (Last 24 Hours)</div>
            ${avail === null
              ? '<div style="font-size: 12px; color: #64748b;">No availability history yet for this device.</div>'
              : `<div style="font-size: 12px; color: #334155; margin-bottom: 6px;">Up Time: <strong>${avail}%</strong></div>
                 <div style="height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;"><div style="height: 100%; width: ${Math.max(0, Math.min(100, avail))}%; background: #16a34a;"></div></div>`}
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 16px 0 8px;">Hardware</div>
            ${!hwLoaded ? '<div style="font-size: 12px; color: #64748b;">Loading hardware details…</div>'
              : !hwObj ? '<div style="font-size: 12px; color: #64748b;">No hardware details reported for this device.</div>'
              : `${infoRow('Total RAM', hwObj.totalRam)}${infoRow('Flash Memory', hwObj.flashMemory)}${infoRow('Fan Trays', Array.isArray(hwObj.fanTrays) ? hwObj.fanTrays.length + ' reported' : '—')}${infoRow('Power Supplies', Array.isArray(hwObj.powerSupplies) ? hwObj.powerSupplies.length + ' reported' : '—')}${infoRow('Thermal Sensors', Array.isArray(hwObj.thermalSensors) ? hwObj.thermalSensors.length + ' reported' : '—')}`}
          </div>
        </div>`;
        html += `<div style="margin-top: 16px; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; font-size: 12px; color: #64748b;">No traffic statistics yet — interface counters appear here once polls complete.</div>`;
        bodyContainer.innerHTML = html;
        if (!hwLoaded) {
          const res = await opmApi('/api/hardware/details?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
          snapHw = (res.ok && res.data) ? res.data : null;
          rerenderIfStillOn('summary');
        }
        return;
      }

      // ---------------- PERFORMANCE ----------------
      if (activeModalTab === 'performance') {
        bodyContainer.innerHTML = opmModalEmpty('No performance history yet', 'Graphs fill in as polls complete — up to 24 hours of history is shown once the device has been polled.');
        return;
      }

      // ---------------- MONITORS ----------------
      if (activeModalTab === 'monitors') {
        const monitorsList = [];
        if (numOrNull(dev.cpu) !== null) monitorsList.push({ name: 'CPU Utilization', type: 'SNMP', value: dev.cpu + '%', threshold: '85%', warn: dev.cpu > 85 });
        if (numOrNull(dev.memory) !== null) monitorsList.push({ name: 'Memory Utilization', type: 'SNMP', value: dev.memory + '%', threshold: '90%', warn: dev.memory > 90 });
        if (numOrNull(dev.disk) !== null) monitorsList.push({ name: 'Disk Utilization', type: 'SNMP', value: dev.disk + '%', threshold: '90%', warn: dev.disk > 90 });
        if (numOrNull(dev.responseTime) !== null) monitorsList.push({ name: 'Ping Response Time', type: 'ICMP', value: dev.responseTime + ' ms', threshold: '300 ms', warn: dev.responseTime > 300 });
        if (numOrNull(dev.temp) !== null) monitorsList.push({ name: 'Device Temperature', type: 'SNMP', value: dev.temp + ' °C', threshold: '75 °C', warn: dev.temp > 75 });
        if (!monitorsList.length) {
          bodyContainer.innerHTML = opmModalEmpty('No monitors assigned yet', 'Assign a device template to add monitors — monitor values appear here once the device reports them.');
          return;
        }
        bodyContainer.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Associated Performance Monitors (${monitorsList.length})</span>
            <button id="snap-poll-now-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Poll Now</button>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead><tr style="background: #f8fafc; text-align: left; color: #64748b;">
              <th style="padding: 8px 10px;">Monitor</th><th style="padding: 8px 10px;">Type</th><th style="padding: 8px 10px;">Last Value</th><th style="padding: 8px 10px;">Threshold</th><th style="padding: 8px 10px;">Status</th><th style="padding: 8px 10px;"></th>
            </tr></thead>
            <tbody>
              ${monitorsList.map(m => `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 10px; font-weight: 600;">${opmEsc(m.name)}</td>
                <td style="padding: 8px 10px;">${opmEsc(m.type)}</td>
                <td style="padding: 8px 10px;">${opmEsc(m.value)}</td>
                <td style="padding: 8px 10px;">${opmEsc(m.threshold)}</td>
                <td style="padding: 8px 10px; font-weight: 700; color: ${m.warn ? '#dc2626' : '#16a34a'};">${m.warn ? 'Warning' : 'OK'}</td>
                <td style="padding: 8px 10px;"><button class="snap-test-monitor-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">Test</button></td>
              </tr>`).join('')}
            </tbody>
          </table>`;
        bodyContainer.querySelector('#snap-poll-now-btn').onclick = async () => {
          const res = await opmApi('/api/devices/' + encodeURIComponent(dev.id) + '/poll-now', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
          showToast(opmApiMessage(res, res.ok ? 'Poll completed.' : 'Poll failed.'), res.ok ? 'success' : 'error');
          if (res.ok && typeof loadBackendData === 'function') { await loadBackendData(); rerenderIfStillOn('monitors'); }
        };
        bodyContainer.querySelectorAll('.snap-test-monitor-btn').forEach(btn => {
          btn.onclick = async () => {
            const res = await opmApi('/api/devices/' + encodeURIComponent(dev.id) + '/test-monitors', { credentials: 'same-origin' });
            showToast(opmApiMessage(res, res.ok ? 'Monitor test completed.' : 'Monitor test failed.'), res.ok ? 'success' : 'error');
          };
        });
        return;
      }

      // ---------------- INTERFACES ----------------
      if (activeModalTab === 'interfaces') {
        if (snapIfaces === undefined) {
          bodyContainer.innerHTML = opmModalLoading('Loading interfaces…');
          const res = await opmApi('/api/devices/' + encodeURIComponent(dev.id) + '/interfaces', { credentials: 'same-origin' });
          snapIfaces = (res.ok && res.data && Array.isArray(res.data.interfaces)) ? res.data.interfaces : null;
          rerenderIfStillOn('interfaces');
          return;
        }
        if (!snapIfaces || !snapIfaces.length) {
          bodyContainer.innerHTML = opmModalEmpty('No interfaces discovered yet', 'Run an SNMP interface discovery on this device — interfaces appear here once they are discovered.');
          return;
        }
        bodyContainer.innerHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead><tr style="background: #f8fafc; text-align: left; color: #64748b;">
              <th style="padding: 8px 10px;">Interface</th><th style="padding: 8px 10px;">Admin</th><th style="padding: 8px 10px;">Oper</th><th style="padding: 8px 10px;">Speed</th><th style="padding: 8px 10px;">In Traffic</th><th style="padding: 8px 10px;">Out Traffic</th><th style="padding: 8px 10px;">Errors</th>
            </tr></thead>
            <tbody>
              ${snapIfaces.map(i => `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 10px; font-weight: 600;">${opmEsc(i.name || i.descr || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(i.admin || '—')}</td>
                <td style="padding: 8px 10px; font-weight: 700; color: ${String(i.oper || '').toLowerCase() === 'up' ? '#16a34a' : '#dc2626'};">${opmEsc(i.oper || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(i.speed || '—')}</td>
                <td style="padding: 8px 10px;">${opmEsc(i.inTraffic === null || i.inTraffic === undefined ? '—' : String(i.inTraffic))}</td>
                <td style="padding: 8px 10px;">${opmEsc(i.outTraffic === null || i.outTraffic === undefined ? '—' : String(i.outTraffic))}</td>
                <td style="padding: 8px 10px;">${opmEsc(i.errors === null || i.errors === undefined ? '—' : String(i.errors))}</td>
              </tr>`).join('')}
            </tbody>
          </table>`;
        return;
      }

      // ---------------- ALARMS ----------------
      if (activeModalTab === 'alarms') {
        const devAlarms = (state.alarms || []).filter(a => a.device === dev.name || a.deviceId === dev.id);
        if (!devAlarms.length) {
          bodyContainer.innerHTML = opmModalEmpty('No alarms for this device', 'Good news — no alarms are currently open on this device.');
          return;
        }
        bodyContainer.innerHTML = devAlarms.map(a => `
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 10px; display: flex; gap: 10px; align-items: flex-start;">
            ${getStatusBadge(a.severity)}
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${opmEsc(a.message || '—')}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${opmEsc(a.time || '—')} &bull; ${opmEsc(a.entity || '—')} &bull; ${opmEsc(a.status || '—')}</div>
            </div>
          </div>`).join('');
        return;
      }

      // ---------------- PORTS ----------------
      if (activeModalTab === 'ports') {
        if (snapPorts === undefined) {
          bodyContainer.innerHTML = opmModalLoading('Loading switch ports…');
          const res = await opmApi('/api/tools/switch-ports?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
          snapPorts = (res.ok && res.data && Array.isArray(res.data.ports)) ? res.data.ports : null;
          rerenderIfStillOn('ports');
          return;
        }
        if (!snapPorts || !snapPorts.length) {
          bodyContainer.innerHTML = opmModalEmpty('No switch ports discovered yet', 'Run a switch-port discovery (ifTable walk) on this switch — ports appear here once they are discovered.');
          return;
        }
        const sel = snapPorts.find(p => String(p.port) === String(selectedPortNumber)) || snapPorts[0];
        if (sel) selectedPortNumber = sel.port;
        bodyContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 8px; align-content: start;">
              ${snapPorts.map(p => `<div class="snap-port-cell" data-port="${opmEsc(String(p.port))}" style="border: 1px solid ${String(p.port) === String(selectedPortNumber) ? '#0070e0' : '#e2e8f0'}; border-radius: 6px; padding: 10px 6px; text-align: center; cursor: pointer; background: ${String(p.operStatus || '').toLowerCase() === 'up' ? '#f0fdf4' : '#fef2f2'};">
                <div style="font-size: 11px; font-weight: 700; color: #0f172a;">${opmEsc(String(p.port))}</div>
                <div style="font-size: 10px; color: ${String(p.operStatus || '').toLowerCase() === 'up' ? '#16a34a' : '#dc2626'}; font-weight: 700;">${opmEsc(p.operStatus || '—')}</div>
              </div>`).join('')}
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Port ${opmEsc(String(sel.port))} Details</div>
              ${infoRow('Alias', sel.alias)}
              ${infoRow('Admin Status', sel.adminStatus)}
              ${infoRow('Oper Status', sel.operStatus)}
              ${infoRow('Speed', sel.speed)}
              ${infoRow('VLAN', sel.vlan)}
              ${infoRow('MAC', sel.mac)}
              ${infoRow('IP', sel.ip)}
              ${infoRow('CRC Errors', '—')}
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button disabled title="Port bounce is not available yet — no port-control endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: not-allowed;">Bounce Port</button>
                <button disabled title="CRC clearing is not available yet — no port-control endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: not-allowed;">Clear CRC</button>
              </div>
            </div>
          </div>`;
        bodyContainer.querySelectorAll('.snap-port-cell').forEach(cell => {
          cell.onclick = () => { selectedPortNumber = cell.getAttribute('data-port'); renderSnapshotBody(); };
        });
        return;
      }

      // ---------------- DIAGNOSTICS ----------------
      if (activeModalTab === 'diagnostics') {
        bodyContainer.innerHTML = `
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button id="cli-run-ping-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Ping ${opmEsc(dev.ip || '')}</button>
            <button id="cli-run-trace-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">Traceroute</button>
            <button id="cli-run-snmp-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">SNMP Walk (system)</button>
          </div>
          <div id="cli-terminal-screen" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; line-height: 1.6; padding: 14px; border-radius: 6px; min-height: 120px; white-space: pre-wrap; word-break: break-word;">No diagnostic output yet — run a command or an SNMP query.</div>`;
        const termEl = bodyContainer.querySelector('#cli-terminal-screen');
        const setTerm = (text) => { if (termEl) termEl.textContent = text; };
        bodyContainer.querySelector('#cli-run-ping-btn').onclick = async () => {
          setTerm('Running ping…');
          const res = await opmApi('/api/tools/ping', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: dev.ip, count: 4 }) });
          setTerm(res.ok && res.data ? (res.data.output || JSON.stringify(res.data, null, 2)) : opmApiMessage(res, 'Ping failed.'));
        };
        bodyContainer.querySelector('#cli-run-trace-btn').onclick = async () => {
          setTerm('Running traceroute…');
          const res = await opmApi('/api/tools/traceroute', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: dev.ip }) });
          setTerm(res.ok && res.data ? (res.data.output || JSON.stringify(res.data, null, 2)) : opmApiMessage(res, 'Traceroute failed.'));
        };
        bodyContainer.querySelector('#cli-run-snmp-btn').onclick = async () => {
          setTerm('Running SNMP walk…');
          const res = await opmApi('/api/tools/snmp-walk', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: dev.ip, rootOid: '.1.3.6.1.2.1.1' }) });
          if (res.ok && res.data && Array.isArray(res.data.results)) {
            setTerm(res.data.results.length ? res.data.results.map(r => `${r.oid} = ${r.value}`).join('\n') : 'SNMP walk returned no results for this device.');
          } else {
            setTerm(opmApiMessage(res, 'SNMP walk failed.'));
          }
        };
        return;
      }

      // ---------------- CONFIG ----------------
      if (activeModalTab === 'config') {
        if (snapDiff === undefined) {
          bodyContainer.innerHTML = opmModalLoading('Loading configuration status…');
          const res = await opmApi('/api/ccm/diff?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
          snapDiff = (res.ok && res.data) ? res.data : null;
          rerenderIfStillOn('config');
          return;
        }
        const d = snapDiff;
        const drift = d ? (d.drift === true || d.hasDrift === true) : null;
        const added = d ? (d.addedLinesCount || 0) : 0;
        const removed = d ? (d.removedLinesCount || 0) : 0;
        bodyContainer.innerHTML = `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Configuration Status</div>
            ${!d ? opmModalEmpty('No configuration backed up yet', 'Take a baseline backup to enable diff and drift checks for this device.')
              : drift === false ? '<div style="font-size: 12px; color: #16a34a; font-weight: 700;">In Sync — running and startup configurations match.</div>'
              : drift === true ? `<div style="font-size: 12px; color: #dc2626; font-weight: 700;">Drift detected — ${added} line(s) added, ${removed} line(s) removed.</div>`
              : `<div style="font-size: 12px; color: #64748b;">${opmEsc(d.reason || 'Configuration status is not available for this device.')}</div>`}
            ${d ? `<div style="font-size: 12px; color: #64748b; margin-top: 8px;">Last backup: ${opmEsc(d.lastBackupTime || '—')}</div>` : ''}
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <button id="snap-backup-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Backup Config</button>
              <button id="snap-diff-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">View Drift Diff</button>
            </div>
          </div>`;
        bodyContainer.querySelector('#snap-backup-btn').onclick = async () => {
          const res = await opmApi('/api/ccm/backup-device', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev.id }) });
          showToast(opmApiMessage(res, res.ok ? 'Backup completed.' : 'Backup failed.'), res.ok ? 'success' : 'error');
          if (res.ok) { snapDiff = undefined; renderSnapshotBody(); }
        };
        bodyContainer.querySelector('#snap-diff-btn').onclick = () => { showNcmVersionCompareModal(dev); };
        return;
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
            { id: 'monitors', label: 'Performance Monitors' },
            { id: 'interfaces', label: 'Interfaces' },
            ...(isSwitch ? [{ id: 'ports', label: 'Port Matrix' }] : []),
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
          <span>ManageEngine OpManager Central (Version 12.9.204-GA) • Monitored via ${dev.probe || '—'}</span>
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
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 860px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">SNMP Trap Viewer</div>
            <div style="font-size: 11px; color: #64748b;">Traps received by the Central trap listener (UDP 162)</div>
          </div>
          <span id="close-trap-viewer-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div id="opm-trap-viewer-body" style="padding: 20px; overflow-y: auto;">${opmModalLoading('Loading traps…')}</div>
        <div style="padding: 10px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span id="opm-trap-viewer-count">—</span>
          <div style="display: flex; gap: 8px;">
            <button id="opm-trap-test-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; color: #334155;">Open Trap Simulator (test tool)</button>
            <button id="opm-trap-export-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export CSV</button>
            <button id="opm-trap-close-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; color: #334155;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-trap-viewer-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-trap-close-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-trap-test-btn').onclick = () => { showSnmpTrapSimulatorModal(); };
    let trapRows = [];
    const exportBtn = modal.querySelector('#opm-trap-export-btn');
    exportBtn.onclick = () => {
      if (!trapRows.length) { showToast('Nothing to export yet — no traps received.', 'error'); return; }
      const csv = 'received_at,source_ip,oid,value\n' + trapRows.map(t => [t.received_at || '', t.source_ip || '', t.oid || '', String(t.value || '').replace(/"/g, '""')].map(v => `"${v}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'snmp-traps.csv';
      a.click();
      showToast(`Exported ${trapRows.length} received trap(s) as CSV.`);
    };
    (async () => {
      const body = modal.querySelector('#opm-trap-viewer-body');
      const countEl = modal.querySelector('#opm-trap-viewer-count');
      const res = await opmApi('/api/traps/list', { credentials: 'same-origin' });
      if (!res.ok || !res.data) {
        body.innerHTML = opmModalError(opmApiMessage(res, 'Could not load traps.'));
        countEl.textContent = '—';
        return;
      }
      trapRows = Array.isArray(res.data.traps) ? res.data.traps : [];
      const total = (res.data.total !== undefined && res.data.total !== null) ? res.data.total : trapRows.length;
      countEl.textContent = `${total} Trap(s) Received`;
      if (!trapRows.length) {
        body.innerHTML = opmModalEmpty('No SNMP Traps Received', 'OpManager Central SNMP Trap Listener is active on UDP port 162. Forward traps from your routers, switches, and firewalls to begin receiving real-time trap events.');
        return;
      }
      body.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead><tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left;">
            <th style="padding: 8px 10px;">Received</th><th style="padding: 8px 10px;">Source IP</th><th style="padding: 8px 10px;">OID</th><th style="padding: 8px 10px;">Value</th>
          </tr></thead>
          <tbody>
            ${trapRows.map(t => `<tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 10px; font-family: monospace;">${opmEsc(t.received_at || '—')}</td>
              <td style="padding: 8px 10px; font-family: monospace;">${opmEsc(t.source_ip || '—')}</td>
              <td style="padding: 8px 10px; font-family: monospace;">${opmEsc(t.oid || '—')}</td>
              <td style="padding: 8px 10px;">${opmEsc(t.value === null || t.value === undefined ? '—' : String(t.value))}</td>
            </tr>`).join('')}
          </tbody>
        </table>`;
    })();
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
              <input type="text" id="disc-start-ip" placeholder="e.g. 192.168.1.1" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 5px; color: #475569;">Ending IP Address *</label>
              <input type="text" id="disc-end-ip" placeholder="e.g. 192.168.1.254" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
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
                <option value="v2c">SNMP v1/v2c (Community: public)</option>
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
            <span style="color: #94a3b8;">OpManager Central Subnet Discovery Engine v12.9.204-GA ready.</span><br>
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
    const ip = targetIp || '';

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
            <span style="color: #4ade80;">ManageEngine OpManager Central Web CLI Terminal v12.9.204-GA</span><br>
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
              body: JSON.stringify({ command: cmd, hostname: ip || '' })
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
          <span>ManageEngine OpManager Central (Version 12.9.204-GA)</span>
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
      const u = document.getElementById('new-user-username').value.trim();
      if (!u) { showToast('Enter a username first.', 'error'); return; }
      const fn = document.getElementById('new-user-fullname').value.trim() || u;
      const em = document.getElementById('new-user-email').value.trim();
      const rl = document.getElementById('new-user-role').value;
      const at = document.getElementById('new-user-auth').value;
      const sc = document.getElementById('new-user-scope').value;

      const res = await opmApi('/api/settings/users', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, name: fn, email: em || undefined, role: rl, authType: at, probeScope: sc })
      });
      if (!res.ok) { showToast(opmApiMessage(res, 'Could not create user account.'), 'error'); return; }
      showToast(opmApiMessage(res, `User account ${u} (${fn}) created successfully with role ${rl}.`));
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
              <input type="text" id="new-rule-name" placeholder="e.g. Branch Office Subnet Sweep" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">CIDR Subnet / Range *</label>
                <input type="text" id="new-rule-subnet" placeholder="e.g. 10.60.0.0/24" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
              </div>
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Assigned Probe *</label>
                <select id="new-rule-probe" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; background: #fff; box-sizing: border-box;">
                  ${state.probes.map(p => `<option value="${p.name}">${p.name}${p.location ? ' (' + p.location + ')' : ''}</option>`).join('')}
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
                  <option>SNMPv2c Community</option>
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
      const nm = document.getElementById('new-rule-name').value.trim();
      const sub = document.getElementById('new-rule-subnet').value.trim();
      if (!nm) { showToast('Enter a discovery rule name first.', 'error'); return; }
      if (!sub) { showToast('Enter a subnet or range first.', 'error'); return; }
      const prb = document.getElementById('new-rule-probe').value;
      const sch = document.getElementById('new-rule-sched').value;
      const crd = document.getElementById('new-rule-cred').value;

      const res = await opmApi('/api/discovery/rules', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nm, subnet: sub, probe: prb, schedule: sch, credential: crd })
      });
      if (!res.ok) { showToast(opmApiMessage(res, 'Could not save discovery rule.'), 'error'); return; }
      showToast(opmApiMessage(res, `Discovery rule "${nm}" scheduled on ${prb}.`));
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
            <input type="text" id="new-tmpl-name" placeholder="e.g. Cisco Nexus 9300-FX3" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 4px;">Hardware Vendor *</label>
              <input type="text" id="new-tmpl-vendor" placeholder="e.g. Cisco Systems" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
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
              <input type="text" id="new-tmpl-sysoid" placeholder="e.g. .1.3.6.1.4.1.9.1.2840" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box; font-family: monospace;">
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
    document.getElementById('save-new-tmpl-btn').onclick = async () => {
      const nm = document.getElementById('new-tmpl-name').value.trim();
      const vendor = document.getElementById('new-tmpl-vendor').value.trim();
      const cat = document.getElementById('new-tmpl-cat').value;
      const sysoid = document.getElementById('new-tmpl-sysoid').value.trim();
      if (!nm) { showToast('Enter a template name first.', 'error'); return; }
      if (!vendor) { showToast('Enter a hardware vendor first.', 'error'); return; }
      if (!sysoid) { showToast('Enter an enterprise SysOID first.', 'error'); return; }
      const poll = document.getElementById('new-tmpl-poll') ? document.getElementById('new-tmpl-poll').value : '300s';

      const checkedMonitors = [];
      modal.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const lbl = cb.parentElement ? cb.parentElement.textContent.trim() : '';
        if (lbl) checkedMonitors.push(lbl);
      });
      const monitors = checkedMonitors.length > 0 ? checkedMonitors.join(', ') : '';

      const newTmplObj = {
        id: 'tmpl-' + Date.now(),
        name: nm,
        category: cat,
        vendor: vendor,
        oid: sysoid,
        monitors: monitors,
        poll: poll
      };

      const res = await opmApi('/api/settings/templates', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTmplObj)
      });
      if (!res.ok) { showToast(opmApiMessage(res, 'Could not save device template.'), 'error'); return; }
      if (!state.templates) state.templates = [];
      state.templates.unshift(newTmplObj);
      showToast(opmApiMessage(res, `Device Template "${nm}" added.`));
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
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const render = (lic, error) => {
      const row = (label, v) => `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;"><span style="font-weight: 600;">${label}:</span><span style="font-weight: 700;">${opmEsc(v === null || v === undefined || v === '' ? '—' : String(v))}</span></div>`;
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 6px; width: 560px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden;">
          <div style="background: #0f172a; padding: 20px 24px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 16px; font-weight: 700;">Apply License</div>
              <div style="font-size: 11px; color: #94a3b8;">License facts below come from the server — nothing is pre-filled.</div>
            </div>
            <button id="close-license-btn" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 24px; font-size: 12px; color: #334155; line-height: 1.7;">
            ${error ? opmModalError(error) : ''}
            ${!error && !lic ? opmModalEmpty('No license applied yet', 'Apply a license key to register this installation.') : ''}
            ${lic ? `
            ${row('Edition', lic.edition)}
            ${row('Version', lic.version)}
            ${row('License type', lic.licenseType)}
            ${row('Registered user', lic.registeredUser)}
            ${row('Organization', lic.organization)}
            ${row('Expiry', lic.expiryDate)}
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: 600;">Host ID:</span>
              <span style="display: flex; align-items: center; gap: 8px;">
                <span id="opm-license-hostid" style="font-family: monospace; font-weight: 700; color: #0f172a;">${opmEsc(lic.hostId || '—')}</span>
                <button id="opm-copy-hostid-btn" ${lic.hostId ? '' : 'disabled'} style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; color: #0070e0; font-weight: 600;">Copy Host ID</button>
              </span>
            </div>
            ${row('Probes used / allowed', (lic.probesUsed ?? '—') + ' / ' + (lic.probesAllowed === -1 ? 'Unlimited' : (lic.probesAllowed ?? '—')))}
            ${row('Devices used / allowed', (lic.devicesUsed ?? '—') + ' / ' + (lic.devicesAllowed ?? '—'))}
            ` : ''}
            <div style="margin-top: 16px;">
              <label style="display: block; font-weight: 700; color: #0f172a; margin-bottom: 6px;">License file (.xml)</label>
              <input type="file" id="opm-license-file" accept=".xml" style="width: 100%; font-size: 12px; box-sizing: border-box;">
              <div id="opm-license-file-name" style="font-size: 11px; color: #64748b; margin-top: 6px;">No file chosen yet.</div>
            </div>
            <div style="margin-top: 12px;">
              <label style="display: block; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Or license key string</label>
              <input type="text" id="opm-license-key" placeholder="Paste a license key string (optional)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 7px 10px; font-size: 12px; box-sizing: border-box;">
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #64748b;">Applying a license validates it on the server and reports the real result.</span>
            <div style="display: flex; gap: 8px;">
              <button id="license-cancel-btn" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Cancel</button>
              <button id="license-apply-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 16px; font-weight: 600; cursor: pointer;">Validate &amp; Apply</button>
            </div>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      document.getElementById('close-license-btn').onclick = () => { modal.style.display = 'none'; };
      document.getElementById('license-cancel-btn').onclick = () => { modal.style.display = 'none'; };
      const fileInput = document.getElementById('opm-license-file');
      if (fileInput) fileInput.onchange = () => {
        const nameEl = document.getElementById('opm-license-file-name');
        if (nameEl) nameEl.textContent = fileInput.files && fileInput.files[0] ? ('Selected: ' + fileInput.files[0].name) : 'No file chosen yet.';
      };
      const copyBtn = document.getElementById('opm-copy-hostid-btn');
      if (copyBtn) copyBtn.onclick = () => {
        const el = document.getElementById('opm-license-hostid');
        if (el) navigator.clipboard.writeText(el.textContent);
        showToast('Copied Host ID to clipboard.');
      };
      document.getElementById('license-apply-btn').onclick = async () => {
        const keyString = (document.getElementById('opm-license-key').value || '').trim();
        let licenseXml = null;
        if (fileInput && fileInput.files && fileInput.files[0]) {
          try { licenseXml = await fileInput.files[0].text(); } catch (e) { showToast('Could not read the license file.', 'error'); return; }
        }
        if (!licenseXml && !keyString) { showToast('Choose a license file or paste a license key first.', 'error'); return; }
        const res = await opmApi('/api/settings/license/apply', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ licenseXml, keyString }) });
        showToast(opmApiMessage(res, res.ok ? 'License applied.' : 'License could not be applied.'), res.ok ? 'success' : 'error');
        if (res.ok) { modal.style.display = 'none'; if (typeof loadBackendData === 'function') loadBackendData(); }
      };
    };
    modal.innerHTML = `<div style="background: #ffffff; border-radius: 6px; width: 560px; overflow: hidden;">${opmModalLoading('Loading license…')}</div>`;
    modal.style.display = 'flex';
    (async () => {
      const res = await opmApi('/api/settings/license', { credentials: 'same-origin' });
      if (!res.ok || !res.data) render(null, opmApiMessage(res, 'Could not load license details.'));
      else render(res.data.license || null, null);
    })();
  }



  // -------------------------------------------------------------
  // MODAL: ManageEngine NetPath Hop-by-Hop Visual Path Analyzer
  // -------------------------------------------------------------
  function showNetPathModal(sourceProbe, targetService) {
    let modal = document.getElementById('opm-netpath-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-netpath-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const guess = (typeof targetService === 'string' && targetService.trim()) ? targetService.trim()
      : (sourceProbe && sourceProbe.ip) ? sourceProbe.ip : '';
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 780px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">NetPath — Path Tracing</div>
            <div style="font-size: 11px; color: #64748b;">Hops, round-trip time and loss are measured live by traceroute — nothing here is pre-filled.</div>
          </div>
          <span id="close-netpath-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <input type="text" id="opm-netpath-target" value="${opmEsc(guess)}" placeholder="Enter destination hostname or IP" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <button id="opm-netpath-run-btn" style="background: #0070e0; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">Run trace</button>
          </div>
          <div id="opm-netpath-output" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; line-height: 1.6; padding: 14px; border-radius: 6px; min-height: 120px; white-space: pre-wrap;">No result yet — enter a target and run the check.</div>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
            <button id="opm-netpath-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-netpath-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-netpath-close-btn').onclick = () => { modal.style.display = 'none'; };
    const runTrace = async () => {
      const out = modal.querySelector('#opm-netpath-output');
      const target = (modal.querySelector('#opm-netpath-target').value || '').trim();
      if (!target) { showToast('Enter a destination hostname or IP first.', 'error'); return; }
      out.textContent = 'Tracing route to ' + target + '…';
      const res = await opmApi('/api/tools/traceroute', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: target }) });
      if (res.ok && res.data) {
        if (res.data.output) out.textContent = res.data.output;
        else if (Array.isArray(res.data.hops) && res.data.hops.length) out.textContent = res.data.hops.map(h => `${h.hop || ''}  ${h.ip || h.hostname || '*'}  ${h.rtt !== undefined && h.rtt !== null ? h.rtt + ' ms' : '—'}`).join('\n');
        else out.textContent = 'Trace completed with no hops returned.';
      } else {
        out.textContent = 'Trace failed: ' + opmApiMessage(res, 'Traceroute could not run.');
        showToast(opmApiMessage(res, 'Traceroute failed.'), 'error');
      }
    };
    modal.querySelector('#opm-netpath-run-btn').onclick = runTrace;
    if (guess) runTrace();
  }

  // -------------------------------------------------------------
  // MODAL: ManageEngine Hardware Health & Sensor Telemetry (IPMI/iDRAC)
  // -------------------------------------------------------------
  function showHardwareSensorsModal(targetServer) {
    let modal = document.getElementById('opm-hw-sensors-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-hw-sensors-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const dev = (targetServer && typeof targetServer === 'object') ? targetServer
      : (targetServer ? (state.devices || []).find(d => d.id == targetServer) : null)
      || (state.devices && state.devices[0]) || null;
    const render = (hw, error) => {
      const name = (hw && (hw.deviceName || hw.model)) || (dev && dev.name) || '—';
      const fans = (hw && Array.isArray(hw.fanTrays)) ? hw.fanTrays : [];
      const temps = (hw && Array.isArray(hw.thermalSensors)) ? hw.thermalSensors : [];
      const psus = (hw && Array.isArray(hw.powerSupplies)) ? hw.powerSupplies : [];
      const anyData = fans.length > 0 || temps.length > 0 || psus.length > 0;
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Hardware Sensors — ${opmEsc(name)}</div>
            <div style="font-size: 11px; color: #64748b;">Fan, temperature and power data reported by the device over SNMP/IPMI</div>
          </div>
          <span id="close-hw-sensors-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${error ? opmModalError(error) : ''}
          ${!error && !anyData ? opmModalEmpty('No hardware sensor data reported yet', 'Poll the device or check its SNMP credentials — fan speeds, temperatures and power supplies appear here once the device reports them.') : ''}
          ${anyData ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Fans (${fans.length})</div>
              ${fans.length === 0 ? '<div style="font-size: 11px; color: #64748b;">No fan data reported.</div>' : fans.map(f => `
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;"><span>${opmEsc(f.id || 'Fan')}</span><span style="font-weight: 700;">${opmEsc(f.speed === null || f.speed === undefined ? '—' : String(f.speed))}</span></div>`).join('')}
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Power Supplies (${psus.length})</div>
              ${psus.length === 0 ? '<div style="font-size: 11px; color: #64748b;">No power supply data reported.</div>' : psus.map(p => `
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;"><span>${opmEsc(p.id || 'PSU')}</span><span style="font-weight: 700;">${opmEsc(p.model || '—')}</span></div>`).join('')}
            </div>
          </div>
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-top: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Temperature Sensors (${temps.length})</div>
            ${temps.length === 0 ? '<div style="font-size: 11px; color: #64748b;">No temperature data reported.</div>' : temps.map(t => `
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;"><span>${opmEsc(t.location || 'Sensor')}</span><span>${opmEsc(t.temperature || '—')} &bull; Limit ${opmEsc(t.threshold || '—')} &bull; ${opmEsc(t.status || '—')}</span></div>`).join('')}
          </div>
          ` : ''}
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button id="hw-sensors-refresh-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Refresh sensors</button>
            <button id="hw-sensors-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
      modal.style.display = 'flex';
      modal.querySelector('#close-hw-sensors-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#hw-sensors-close-btn').onclick = () => { modal.style.display = 'none'; };
      modal.querySelector('#hw-sensors-refresh-btn').onclick = () => { load(); };
    };
    const load = async () => {
      if (!dev) { render(null, null); return; }
      modal.innerHTML = `<div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; overflow: hidden;">${opmModalLoading('Loading hardware sensors…')}</div>`;
      modal.style.display = 'flex';
      const res = await opmApi('/api/hardware/details?deviceId=' + encodeURIComponent(dev.id), { credentials: 'same-origin' });
      if (res.ok && res.data && res.data.hardware) render(res.data.hardware, null);
      else if (res.ok && res.data && res.data.hardware === null) render(null, null);
      else render(null, opmApiMessage(res, 'Could not load hardware sensors.'));
    };
    load();
  }

  // -------------------------------------------------------------
  // MODAL: ManageEngine Zia AI Root Cause Analysis (RCA) & Narrative
  // -------------------------------------------------------------
  function showZiaRcaModal(alarm) {
    let modal = document.getElementById('opm-zia-rca-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-zia-rca-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    const alm = alarm || (state.alarms && state.alarms[0]) || null;
    if (!alm) {
      modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;"><div style="font-size: 14px; font-weight: 800; color: #0f172a;">Zia AI Root Cause Analysis</div></div>
        ${opmModalEmpty('No root cause found yet', 'Root cause analysis runs on a real alarm — open it from an active alarm. No incident is open right now.')}
        <div style="text-align: center; padding-bottom: 20px;"><button onclick="document.getElementById('opm-zia-rca-modal').style.display='none';" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button></div>
      </div>`;
      modal.style.display = 'flex';
      return;
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f5f3ff;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #5b21b6;">✨ Zia AI Root Cause Analysis</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(alm.device)} &bull; ${opmEsc(alm.entity || '')} &bull; ${opmEsc(alm.time || '')}</div>
          </div>
          <span id="close-zia-rca-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div id="opm-rca-body" style="padding: 20px;">${opmModalLoading('Loading root cause analysis…')}</div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-zia-rca-btn').onclick = () => { modal.style.display = 'none'; };
    (async () => {
      const body = modal.querySelector('#opm-rca-body');
      const res = await opmApi('/api/alarm/getRCAData?alarmId=' + encodeURIComponent(alm.id), { credentials: 'same-origin' });
      if (!res.ok || !res.data) { body.innerHTML = opmModalError(opmApiMessage(res, 'Could not load root cause analysis.')); return; }
      const d = res.data;
      const events = Array.isArray(d.correlatedEvents) ? d.correlatedEvents : [];
      body.innerHTML = `
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 14px 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 700; color: #5b21b6;">Correlation result</span>
            ${d.confidencePercent ? `<span style="font-size: 20px; font-weight: 900; color: #4f46e5;">${opmEsc(d.confidencePercent)}</span>` : '<span style="font-size: 12px; color: #64748b;">Confidence: —</span>'}
          </div>
          <div style="font-size: 12px; color: #4c1d95; line-height: 1.5; margin-top: 6px;">${opmEsc(d.hypothesis || alm.message || 'No hypothesis returned for this alarm.')}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Root cause entity: <strong>${opmEsc(d.rootCauseEntity || alm.entity || '—')}</strong> &bull; Device: <strong>${opmEsc(d.device || alm.device || '—')}</strong></div>
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Correlated events (${events.length})</div>
        ${events.length === 0 ? '<div style="font-size: 12px; color: #64748b;">No correlated events recorded for this alarm.</div>' : events.map(e => `
          <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 12px; margin-bottom: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: 700; color: #0f172a;">${opmEsc(e.message || '')}</span><span style="color: #64748b; font-size: 11px;">${opmEsc(e.time || '')}</span></div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Severity: ${opmEsc(e.severity || '—')}</div>
          </div>`).join('')}
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
          <button id="opm-rca-suppress-btn" disabled title="Alarm suppression is not available yet." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Suppress cascaded alarms</button>
          <button id="opm-rca-rollback-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Rollback via NCM</button>
        </div>`;
      const rb = body.querySelector('#opm-rca-rollback-btn');
      if (rb) rb.onclick = async () => {
        const dev = (state.devices || []).find(x => x.name === alm.device);
        const r = await opmApi('/api/ccm/resolve-drift', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: dev ? dev.id : undefined }) });
        showToast(opmApiMessage(r, r.ok ? 'Rollback requested.' : 'Rollback could not be performed.'), r.ok ? 'success' : 'error');
      };
    })();
  }



  /* ==========================================================================
     BATCH 4 ENTERPRISE FEATURES: BGP, SD-WAN, DPI NBAR2, NDR THREAT FORENSICS
     ========================================================================== */

  // 1. ManageEngine BGP-4 Routing & Autonomous System (AS) Topology Modal
  function showBgpMonitoringModal(router) {
    const rtr = (router && typeof router === 'object') ? router : (state.devices && state.devices[0]) || null;
    const rtrName = rtr ? (rtr.name || '—') : '—';
    const rtrIp = rtr ? (rtr.ip || '—') : '—';
    let modal = document.getElementById('opm-bgp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-bgp-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">BGP Monitoring</div>
            <div style="font-size: 11px; color: #64748b;">Router: ${opmEsc(rtrName)} (${opmEsc(rtrIp)})</div>
          </div>
          <span id="close-bgp-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${opmModalEmpty('No BGP peer data yet', 'BGP monitoring is not connected — peer state, AS numbers and prefix counts appear here once a BGP poller reports them.')}
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button disabled title="BGP refresh is not available yet — no BGP endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Refresh peers</button>
            <button id="opm-bgp-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-bgp-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-bgp-close-btn').onclick = () => { modal.style.display = 'none'; };
  }


  // 2. Cisco & Multi-Vendor SD-WAN Performance Controller Modal
  function showSdwanPerformanceModal(sdwanDevice) {
    const dev = (sdwanDevice && typeof sdwanDevice === 'object') ? sdwanDevice : (state.devices && state.devices[0]) || null;
    const name = dev ? (dev.name || '—') : '—';
    const ip = dev ? (dev.ip || '—') : '—';
    let modal = document.getElementById('opm-sdwan-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-sdwan-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">SD-WAN Performance</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(name)} (${opmEsc(ip)})</div>
          </div>
          <span id="close-sdwan-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${opmModalEmpty('No SD-WAN telemetry yet', 'Connect an SD-WAN edge device to see tunnel health, SLA and steering data here. No tunnels are reporting yet.')}
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="opm-sdwan-test-btn" disabled title="Application steering test is not available yet — no SD-WAN controller is connected." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Test application steering</button>
            <button id="opm-sdwan-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-sdwan-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-sdwan-close-btn').onclick = () => { modal.style.display = 'none'; };
  }


  // 3. Deep Packet Inspection (DPI) & Cisco NBAR2 Application Classification Modal
  function showDpiTrafficModal(iface) {
    const name = (iface && (iface.name || iface)) || (state.devices && state.devices[0] && state.devices[0].name) || '—';
    let modal = document.getElementById('opm-dpi-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-dpi-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">DPI Traffic Analysis</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(typeof name === 'string' ? name : '—')}</div>
          </div>
          <span id="close-dpi-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${opmModalEmpty('No DPI traffic data yet', 'Configure a flow exporter on this interface to see the application breakdown — no flow records have been ingested for it yet.')}
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button disabled title="Traffic policy actions are not available yet — no DPI/policy endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Enforce DSCP policy</button>
            <button id="opm-dpi-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-dpi-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-dpi-close-btn').onclick = () => { modal.style.display = 'none'; };
  }


  // 4. Network Detection & Response (NDR) & Security Threat Forensics Modal
  function showNdrForensicsModal(threatSource) {
    const src = (threatSource && (threatSource.name || threatSource)) || '—';
    let modal = document.getElementById('opm-ndr-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ndr-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">NDR Forensics</div>
            <div style="font-size: 11px; color: #64748b;">${opmEsc(typeof src === 'string' ? src : '—')}</div>
          </div>
          <span id="close-ndr-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>
        <div style="padding: 20px;">
          ${opmModalEmpty('No threat indicators yet', 'No NDR feed is connected — threat indicators, blocked hosts and forensic timelines appear here once a feed reports them.')}
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button disabled title="Firewall ACL push is not available yet — no NDR enforcement endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Push firewall ACL</button>
            <button disabled title="Host quarantine is not available yet — no NAC endpoint is configured." style="background: #94a3b8; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: not-allowed;">Quarantine host</button>
            <button id="opm-ndr-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>`;
    modal.style.display = 'flex';
    modal.querySelector('#close-ndr-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#opm-ndr-close-btn').onclick = () => { modal.style.display = 'none'; };
  }

