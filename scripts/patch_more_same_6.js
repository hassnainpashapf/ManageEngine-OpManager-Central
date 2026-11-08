const fs = require('fs');

// =========================================================================
// 1. PATCH 02_branding_and_modals.js
// =========================================================================
const modalsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

const newModalsCode = `
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

    modal.innerHTML = \`
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
    \`;

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

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 1160px; max-width: 96vw; height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 14px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">SPM</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpUtils &bull; Switch Port Mapper (SPM)</div>
              <div style="font-size: 11px; color: #94a3b8;">Switch: <strong style="color: #38bdf8;">\${dev.name} (\${dev.ip})</strong> &bull; Model: <strong>\${dev.model}</strong> &bull; Total Ports: <strong>48</strong></div>
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
              \${ports.map(p => \`
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 7px 10px; font-family: monospace; color: #64748b;">\${p.index}</td>
                  <td style="padding: 7px 10px; font-weight: 700; color: #0284c7; font-family: monospace;">\${p.name}</td>
                  <td style="padding: 7px 10px;">
                    <span style="background: \${p.status === 'Up' ? '#dcfce7' : (p.status.includes('Admin') ? '#fee2e2' : '#f1f5f9')}; color: \${p.status === 'Up' ? '#166534' : (p.status.includes('Admin') ? '#991b1b' : '#64748b')}; font-weight: 700; padding: 2px 6px; border-radius: 3px;">
                      \${p.status}
                    </span>
                  </td>
                  <td style="padding: 7px 10px; color: #334155;">\${p.speed}</td>
                  <td style="padding: 7px 10px; font-family: monospace; font-weight: 600; color: #0f172a;">\${p.mac}</td>
                  <td style="padding: 7px 10px; font-family: monospace; color: #0284c7;">\${p.ip}</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #475569;">\${p.hostname}</td>
                  <td style="padding: 7px 10px;"><span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 5px; border-radius: 2px;">\${p.vlan}</span></td>
                  <td style="padding: 7px 10px; color: #64748b;">\${p.vendor}</td>
                  <td style="padding: 7px 10px; text-align: right;">
                    <button class="spm-shut-btn" data-port="\${p.name}" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #dc2626; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 600; cursor: pointer;">Shut</button>
                  </td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine SPM Engine &bull; MAC IP Address Mapping Engine &bull; Zero Rogue Devices Detected</span>
          <button id="spm-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close SPM</button>
        </div>
      </div>
    \`;

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

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 860px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px;">💾</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpManager Central &bull; SAN Storage &amp; LUN Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8;">\${arr.name} (\${arr.ip}) &bull; \${arr.controllers}</div>
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
    \`;

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

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 840px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #16a34a; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">🔒</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine SSL / TLS Certificate &amp; Cipher Suite Inspector</div>
              <div style="font-size: 11px; color: #94a3b8;">Host: <strong style="color: #38bdf8;">\${host}</strong> &bull; Protocol: <strong>TLSv1.3</strong></div>
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
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-ssl-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-ssl-bottom-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ssl-handshake-poll-btn').onclick = () => {
      showToast('Live TLS 1.3 handshake probed for ' + host + '. Certificate valid with A+ rating.');
    };
  }
`;

if (!modalsContent.includes('showNewWorkflowModal')) {
  modalsContent = modalsContent.replace(
    '// --- TRAINING VIDEOS MODAL ---',
    `${newModalsCode}\n\n  // --- TRAINING VIDEOS MODAL ---`
  );
  console.log('Added showNewWorkflowModal, showSwitchPortMapperModal, showStorageArrayModal, showSslCertificateModal to 02_branding_and_modals.js');
}

fs.writeFileSync(modalsPath, modalsContent, 'utf8');

// =========================================================================
// 2. PATCH 05_views_config_reports_settings.js
// =========================================================================
const configPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/05_views_config_reports_settings.js';
let configContent = fs.readFileSync(configPath, 'utf8');

// Wire New Workflow Button to showNewWorkflowModal
if (configContent.includes("showToast('Enterprise Workflow Designer: Drag & Drop actions (Ping, SSH CLI, WMI, Service Restart).');")) {
  configContent = configContent.replace(
    "showToast('Enterprise Workflow Designer: Drag & Drop actions (Ping, SSH CLI, WMI, Service Restart).');",
    `if (typeof showNewWorkflowModal === 'function') {
          showNewWorkflowModal();
        } else {
          showToast('Enterprise Workflow Designer: Drag & Drop actions (Ping, SSH CLI, WMI, Service Restart).');
        }`
  );
  console.log('Wired showNewWorkflowModal in 05_views_config_reports_settings.js');
}

// Add SSL Cert Inspector button
if (!configContent.includes('opm-ssl-cert-inspector-btn')) {
  configContent = configContent.replace(
    '<button id="opm-test-ssl-btn"',
    '<button id="opm-ssl-cert-inspector-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">🔍 Complete Certificate Chain &amp; Cipher Inspector</button>\n                <button id="opm-test-ssl-btn"'
  );

  const sslBtnWiring = `    const sslCertBtn = container.querySelector('#opm-ssl-cert-inspector-btn');
    if (sslCertBtn) {
      sslCertBtn.onclick = () => {
        if (typeof showSslCertificateModal === 'function') {
          showSslCertificateModal();
        }
      };
    }`;

  configContent = configContent.replace(
    'const testSslBtn = container.querySelector(\'#opm-test-ssl-btn\');',
    `${sslBtnWiring}\n    const testSslBtn = container.querySelector('#opm-test-ssl-btn');`
  );

  console.log('Added SSL Cert Inspector button in 05_views_config_reports_settings.js');
}

fs.writeFileSync(configPath, configContent, 'utf8');

// =========================================================================
// 3. PATCH 03_views_dashboard_inventory.js
// =========================================================================
const invPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js';
let invContent = fs.readFileSync(invPath, 'utf8');

// Storage LUN Inspector button
if (!invContent.includes('opm-storage-lun-inspector-btn')) {
  invContent = invContent.replace(
    '<span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px;">OPERATIONAL</span>',
    '<div style="display: flex; gap: 8px; align-items: center;">\n                  <button id="opm-storage-lun-inspector-btn" style="background: #0284c7; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">🔍 LUN &amp; RAID Latency Inspector</button>\n                  <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px;">OPERATIONAL</span>\n                </div>'
  );
  console.log('Added Storage LUN Inspector button in 03_views_dashboard_inventory.js');
}

// OpUtils Switch Port Mapper button
if (!invContent.includes('opm-open-spm-btn')) {
  invContent = invContent.replace(
    '<span style="color: #64748b; font-size: 13px;">↻ ⋮</span>\n              </div>\n              <div style="padding: 16px;',
    '<div style="display: flex; gap: 6px; align-items: center;"><button id="opm-open-spm-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer;">🔍 Open 48-Port Switch Port Mapper</button><span style="color: #64748b; font-size: 13px;">↻ ⋮</span></div>\n              </div>\n              <div style="padding: 16px;'
  );
  console.log('Added OpUtils Switch Port Mapper button in 03_views_dashboard_inventory.js');
}

// Wire Storage LUN and SPM buttons
if (!invContent.includes('opm-storage-lun-inspector-btn-listener')) {
  const listeners = `    // Storage LUN Inspector and SPM Button Listeners opm-storage-lun-inspector-btn-listener
    const storageLunBtn = container.querySelector('#opm-storage-lun-inspector-btn');
    if (storageLunBtn) {
      storageLunBtn.onclick = () => {
        if (typeof showStorageArrayModal === 'function') {
          showStorageArrayModal();
        }
      };
    }
    const spmBtn = container.querySelector('#opm-open-spm-btn');
    if (spmBtn) {
      spmBtn.onclick = () => {
        if (typeof showSwitchPortMapperModal === 'function') {
          showSwitchPortMapperModal();
        }
      };
    }`;

  invContent = invContent.replace(
    '// Bulk actions buttons',
    `${listeners}\n\n    // Bulk actions buttons`
  );
  console.log('Wired Storage LUN and SPM listeners in 03_views_dashboard_inventory.js');
}

fs.writeFileSync(invPath, invContent, 'utf8');

// =========================================================================
// 4. PATCH 06_router_and_init.js
// =========================================================================
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('showNewWorkflowModal,')) {
  routerContent = routerContent.replace(
    'showScheduleDowntimeModal,',
    'showScheduleDowntimeModal,\n    showNewWorkflowModal,\n    showSwitchPortMapperModal,\n    showStorageArrayModal,\n    showSslCertificateModal,'
  );
  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('Exported 4 new modals on OpManagerSuite in 06_router_and_init.js');
}
