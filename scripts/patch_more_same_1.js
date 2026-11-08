const fs = require('fs');

// 1. PATCH 01_header_state.js: Add Audio Chime Toggle Button to Subnav
const headerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/01_header_state.js';
let headerContent = fs.readFileSync(headerPath, 'utf8');

const soundBtnHtml = `<span style="color: #cbd5e1;">|</span>
          <button id="opm-subnav-sound-toggle" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; color: #334155; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Toggle Critical Alarm Sound Chimes">
            <span id="opm-sound-icon">🔊</span> <span id="opm-sound-text">Chime: ON</span>
          </button>`;

if (!headerContent.includes('opm-subnav-sound-toggle')) {
  headerContent = headerContent.replace(
    '<button id="opm-subnav-search-btn"',
    `${soundBtnHtml}\n          <button id="opm-subnav-search-btn"`
  );

  const soundWiring = `      const soundBtn = bar.querySelector('#opm-subnav-sound-toggle');
      if (soundBtn) {
        const updateSoundUi = () => {
          const isEnabled = localStorage.getItem('opm_sound_enabled') !== 'false';
          const icon = soundBtn.querySelector('#opm-sound-icon');
          const text = soundBtn.querySelector('#opm-sound-text');
          if (icon && text) {
            icon.innerText = isEnabled ? '🔊' : '🔇';
            text.innerText = isEnabled ? 'Chime: ON' : 'Chime: OFF';
            soundBtn.style.color = isEnabled ? '#166534' : '#64748b';
            soundBtn.style.background = isEnabled ? '#f0fdf4' : '#f8fafc';
          }
        };
        updateSoundUi();
        soundBtn.onclick = () => {
          const current = localStorage.getItem('opm_sound_enabled') !== 'false';
          localStorage.setItem('opm_sound_enabled', current ? 'false' : 'true');
          updateSoundUi();
          if (!current && typeof playAlarmChime === 'function') {
            playAlarmChime();
          }
          showToast(current ? 'Critical alarm audio chimes muted.' : 'Audio alarm chime enabled (880Hz / 1175Hz).');
        };
      }`;

  headerContent = headerContent.replace(
    "const searchBtn = bar.querySelector('#opm-subnav-search-btn');",
    `${soundWiring}\n      const searchBtn = bar.querySelector('#opm-subnav-search-btn');`
  );
  fs.writeFileSync(headerPath, headerContent, 'utf8');
  console.log('Successfully added Audio Chime toggle to 01_header_state.js');
}

// 2. PATCH 02_branding_and_modals.js: Add showNcmRemediationModal & showWanLinkDetailsModal
const modalsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

const newModalsCode = `
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

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 720px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NCM</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine NCM Automated Policy Remediation Fixlet</div>
              <div style="font-size: 11px; color: #64748b;">Target Device: <strong style="color: #0070e0;">\${dev.name} (\${dev.ip})</strong> &bull; Monitored via \${dev.probe}</div>
            </div>
          </div>
          <span id="close-ncm-remed-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 20px;">
          <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #991b1b;">Violated Policy Rule: \${rule}</div>
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
    \`;

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

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 660px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">WAN</div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">ManageEngine Business View &bull; WAN Link Telemetry</div>
              <div style="font-size: 11px; color: #64748b;">\${l.name}</div>
            </div>
          </div>
          <span id="close-wan-link-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 20px;">
          <div style="background: \${l.status.includes('Critical') ? '#fef2f2' : '#f0fdf4'}; border: 1px solid \${l.status.includes('Critical') ? '#fee2e2' : '#bbf7d0'}; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: \${l.status.includes('Critical') ? '#991b1b' : '#166534'};">\${l.carrier}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Latency: <strong>\${l.rtt}</strong> &bull; Packet Loss: <strong>0.0%</strong> &bull; MTU: <strong>1500</strong></div>
            </div>
            <span style="background: \${l.status.includes('Critical') ? '#dc2626' : '#16a34a'}; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">\${l.status}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Near-End (Source CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">\${l.src}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">\${l.srcInf}</div>
              <div style="font-size: 12px; color: #16a34a; font-weight: 700; margin-top: 6px;">IN: \${l.inRate} (\${l.inUtil})</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Far-End (Destination CI)</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">\${l.dst}</div>
              <div style="font-size: 11px; color: #0070e0; font-family: monospace; margin-top: 2px;">\${l.dstInf}</div>
              <div style="font-size: 12px; color: #0284c7; font-weight: 700; margin-top: 6px;">OUT: \${l.outRate} (\${l.outUtil})</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #64748b; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px;">
            <strong>Interface Health Warning:</strong> 14 CRC alignment errors recorded on \${l.dstInf}. Optical transceiver DDM diagnostics show RX light at -19.8 dBm (Below -14.0 dBm optical threshold).
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="wan-link-poll-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">⚡ Re-poll Link Interfaces</button>
            <button id="wan-link-close-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-wan-link-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#wan-link-close-btn').onclick = () => { modal.style.display = 'none'; };
    const pBtn = modal.querySelector('#wan-link-poll-btn');
    if (pBtn) {
      pBtn.onclick = () => {
        showToast('Direct SNMP interface counter re-poll executed for ' + l.srcInf + ' and ' + l.dstInf + '.');
      };
    }
  }
`;

if (!modalsContent.includes('showNcmRemediationModal')) {
  modalsContent = modalsContent.replace(
    '// --- TRAINING VIDEOS MODAL ---',
    `${newModalsCode}\n\n  // --- TRAINING VIDEOS MODAL ---`
  );
  fs.writeFileSync(modalsPath, modalsContent, 'utf8');
  console.log('Successfully added showNcmRemediationModal & showWanLinkDetailsModal to 02_branding_and_modals.js');
}
