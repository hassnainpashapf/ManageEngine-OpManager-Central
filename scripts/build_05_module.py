import os

code = r'''  // -------------------------------------------------------------
  // VIEW: CONFIGURATION (Compliance, NCM Diff, Vuln, Backups)
  // -------------------------------------------------------------
  function renderConfigurationView() {
    state.currentTab = 'configuration';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.configuration || 'compliance';

    const subtabs = [
      { id: 'compliance', name: 'Compliance' },
      { id: 'changes', name: 'Config Changes & Drift' },
      { id: 'vulnerability', name: 'Firmware Vulnerability' },
      { id: 'backups', name: 'Config Backups' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-cfg-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">NCM Module v12.9.203</span>
          <button id="opm-cfg-backup-all-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            Backup All Now (16)
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'compliance' ? `
          <!-- Compliance Scorecards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">CIS Cisco Benchmark</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">92.4%</div>
              <div style="font-size: 11px; color: #64748b;">48 Rules Evaluated | 2 Violations</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">PCI-DSS 4.0 Standard</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">96.8%</div>
              <div style="font-size: 11px; color: #64748b;">Firewall & Access Rules Compliant</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">SOX Section 404</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">100.0%</div>
              <div style="font-size: 11px; color: #64748b;">Audit Logging & Access Vaults</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">HIPAA Security Rule</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">98.2%</div>
              <div style="font-size: 11px; color: #64748b;">Encrypted SNMPv3 & SSH Enforced</div>
            </div>
          </div>

          <!-- Compliance Violations Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
              <span>Active Compliance Violations</span>
              <span style="font-size: 11px; color: #64748b;">Automated Remediation Scripts Available</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Rule Name</th>
                  <th style="padding: 10px 14px;">Standard</th>
                  <th style="padding: 10px 14px;">Device</th>
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Status</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">Password Encryption Missing (service password-encryption)</td>
                  <td style="padding: 10px 14px; color: #64748b;">CIS Cisco IOS 1.2</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                  <td style="padding: 10px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">HIGH</span></td>
                  <td style="padding: 10px 14px; color: #dc2626; font-weight: 600;">Non-Compliant</td>
                  <td style="padding: 10px 14px; text-align: right;">
                    <button class="opm-remediate-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Execute Fix</button>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">SNMP Community String 'public' in use</td>
                  <td style="padding: 10px 14px; color: #64748b;">PCI-DSS 4.0 (Req 2.1)</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">LON-DIST-SW-01</td>
                  <td style="padding: 10px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">MEDIUM</span></td>
                  <td style="padding: 10px 14px; color: #ea580c; font-weight: 600;">Non-Compliant</td>
                  <td style="padding: 10px 14px; text-align: right;">
                    <button class="opm-remediate-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Execute Fix</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : activeSub === 'changes' ? `
          <!-- Config Changes & NCM Drift Side-by-Side Diff Viewer -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Configuration Drift Detected: DXB-CORE-SW-01</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Running-config in RAM differs from Startup-config stored in NVRAM.</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-save-running-startup-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  Save Running to Startup (wr mem)
                </button>
                <button id="opm-recheck-drift-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  Re-check
                </button>
              </div>
            </div>

            <!-- Diff Viewer Container -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #0f172a; border-radius: 6px; padding: 16px; font-family: monospace; font-size: 11px; color: #f8fafc; overflow-x: auto;">
              <div>
                <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
                  STARTUP-CONFIG (NVRAM) - Backed up 2h ago
                </div>
                <div style="line-height: 1.6; color: #cbd5e1;">
                  <div>! Last configuration change at 08:30:14 UTC</div>
                  <div>version 17.09.04a</div>
                  <div>hostname DXB-CORE-SW-01</div>
                  <div>!</div>
                  <div>interface TenGigabitEthernet1/0/48</div>
                  <div> description Core Uplink to DXB-EDGE-RTR-01</div>
                  <div> switchport mode trunk</div>
                  <div> switchport trunk allowed vlan 10,20,30,40</div>
                  <div style="background: rgba(220, 38, 38, 0.2); color: #fca5a5; padding: 2px 4px; border-left: 3px solid #dc2626;">- no shutdown</div>
                  <div>!</div>
                  <div>snmp-server community ******* RO</div>
                  <div>end</div>
                </div>
              </div>

              <div>
                <div style="color: #94a3b8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
                  RUNNING-CONFIG (RAM) - Captured Just Now
                </div>
                <div style="line-height: 1.6; color: #cbd5e1;">
                  <div>! Last configuration change at 10:41:02 UTC by admin</div>
                  <div>version 17.09.04a</div>
                  <div>hostname DXB-CORE-SW-01</div>
                  <div>!</div>
                  <div>interface TenGigabitEthernet1/0/48</div>
                  <div> description Core Uplink to DXB-EDGE-RTR-01 [MAINTENANCE]</div>
                  <div> switchport mode trunk</div>
                  <div> switchport trunk allowed vlan 10,20,30,40</div>
                  <div style="background: rgba(22, 163, 74, 0.2); color: #86efac; padding: 2px 4px; border-left: 3px solid #16a34a;">+ shutdown</div>
                  <div>!</div>
                  <div>snmp-server community ******* RO</div>
                  <div>end</div>
                </div>
              </div>
            </div>

          </div>
        ` : activeSub === 'vulnerability' ? `
          <!-- Firmware Vulnerability Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Firmware CVE Vulnerability Database Sync</div>
            <div style="border: 1px solid #fee2e2; background: #fef2f2; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #991b1b;">CVE-2023-20198 - Cisco IOS XE Web UI Privilege Escalation</div>
                  <div style="font-size: 12px; color: #7f1d1d; margin-top: 4px;">Affected device: DXB-CORE-SW-01 (Cisco IOS-XE 17.09.04a). Recommended action: Update to 17.09.04b.</div>
                </div>
                <span style="background: #dc2626; color: #fff; font-weight: 800; padding: 4px 8px; border-radius: 4px; font-size: 12px;">CVSS 10.0 CRITICAL</span>
              </div>
            </div>
            <div style="font-size: 12px; color: #64748b;">NIST NVD database feed updated 4 hours ago. 1 matching CVE found across 16 monitored enterprise nodes.</div>
          </div>
        ` : `
          <!-- Config Backups Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span style="font-size: 14px; font-weight: 700; color: #0f172a;">Automated Daily Configuration Backups</span>
              <span style="font-size: 11px; color: #16a34a; font-weight: 700;">● 16/16 Successful Today</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 8px 12px;">Device</th>
                  <th style="padding: 8px 12px;">Probe</th>
                  <th style="padding: 8px 12px;">Last Backup</th>
                  <th style="padding: 8px 12px;">Config Size</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.devices.slice(0, 8).map(d => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">${d.name}</td>
                    <td style="padding: 8px 12px; color: #64748b;">${d.probe}</td>
                    <td style="padding: 8px 12px; color: #475569;">${d.lastBackup}</td>
                    <td style="padding: 8px 12px; font-family: monospace;">42.8 KB</td>
                    <td style="padding: 8px 12px;"><span style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 2px;">SUCCESS</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    // Subtab event listeners
    container.querySelectorAll('.opm-cfg-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.configuration = btn.getAttribute('data-sub');
        renderConfigurationView();
      };
    });

    // Save running to startup button
    const saveBtn = container.querySelector('#opm-save-running-startup-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        state.configDriftFixed = true;
        showToast('Running configuration saved to startup NVRAM on DXB-CORE-SW-01. Drift resolved.');
        renderConfigurationView();
      };
    }

    // Recheck drift button
    const recheckBtn = container.querySelector('#opm-recheck-drift-btn');
    if (recheckBtn) {
      recheckBtn.onclick = () => {
        state.configDriftFixed = false;
        showToast('Config drift simulation reset.');
        renderConfigurationView();
      };
    }

    // Remediate button
    container.querySelectorAll('.opm-remediate-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Compliance remediation script executed via SSH.');
      };
    });

    // Backup all button
    const bkpAllBtn = container.querySelector('#opm-cfg-backup-all-btn');
    if (bkpAllBtn) {
      bkpAllBtn.onclick = () => {
        showToast('Triggered automated configuration backup across all 16 devices.');
      };
    }
  }

  // -------------------------------------------------------------
  // VIEW: REPORTS (SLA, Performance, MTTR, Hardware Lifecycle)
  // -------------------------------------------------------------
  function renderReportsView() {
    state.currentTab = 'reports';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.reports || 'sla';

    const subtabs = [
      { id: 'sla', name: 'Availability & SLA' },
      { id: 'performance', name: 'Performance Reports' },
      { id: 'mttr', name: 'Alarms & MTTR' },
      { id: 'lifecycle', name: 'Hardware Lifecycle & Warranty' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-rpt-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <select id="opm-rpt-timerange" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
            <option>Last 30 Days (Standard SLA)</option>
            <option>Last 7 Days</option>
            <option>Today</option>
            <option>Custom Date Range</option>
          </select>
          <button id="opm-rpt-pdf-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Generate PDF
          </button>
          <button id="opm-rpt-csv-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'sla' ? `
          <!-- Summary Cards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average SLA Compliance</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">99.98%</div>
              <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Tier-4 Enterprise Benchmark Met</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Outage Duration</div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 6px 0;">0h 08m</div>
              <div style="font-size: 11px; color: #64748b;">Past 30 days across 16 nodes</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Mean Time to Resolve (MTTR)</div>
              <div style="font-size: 26px; font-weight: 800; color: #0284c7; margin: 6px 0;">18m 42s</div>
              <div style="font-size: 11px; color: #0284c7; font-weight: 600;">12% faster than last month</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Hardware Warranty Status</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">100%</div>
              <div style="font-size: 11px; color: #64748b;">SmartNet / ProSupport Active</div>
            </div>
          </div>

          <!-- SLA Detailed Report Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
              <span>Device Availability & Outage SLA Matrix (Past 30 Days)</span>
              <span style="font-size: 11px; color: #64748b;">SLA Target: 99.900%</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Device Name</th>
                  <th style="padding: 10px 14px;">IP Address</th>
                  <th style="padding: 10px 14px;">Probe Location</th>
                  <th style="padding: 10px 14px;">Total Uptime</th>
                  <th style="padding: 10px 14px;">Outage Time</th>
                  <th style="padding: 10px 14px;">Availability</th>
                  <th style="padding: 10px 14px; text-align: right;">SLA Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.devices.map(dev => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">${dev.name}</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #475569;">${dev.ip}</td>
                    <td style="padding: 10px 14px; color: #64748b;">${dev.probe}</td>
                    <td style="padding: 10px 14px; font-family: monospace;">719h 52m</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: ${dev.status === 'Critical' ? '#dc2626' : '#64748b'};">
                      ${dev.status === 'Critical' ? '0h 08m' : '0h 00m'}
                    </td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #16a34a;">${dev.availability}</td>
                    <td style="padding: 10px 14px; text-align: right;">
                      <span style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 10px; padding: 2px 7px; border-radius: 10px;">
                        MET (99.9%)
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : activeSub === 'performance' ? `
          <!-- SUBTAB: PERFORMANCE REPORTS (TOP 10 ANALYTICS) -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            
            <!-- Top 5 CPU Utilization -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>Top 5 Devices by CPU Utilization</span>
                <span style="font-size: 11px; color: #64748b;">Peak / Current</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${[...state.devices].sort((a,b) => b.cpu - a.cpu).slice(0, 5).map(d => `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 700; color: #0070e0;">${d.name} (${d.category})</span>
                      <span style="font-weight: 800; color: ${d.cpu > 90 ? '#dc2626' : d.cpu > 75 ? '#ea580c' : '#16a34a'};">${d.cpu}%</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${d.cpu}%; height: 100%; background: ${d.cpu > 90 ? '#dc2626' : d.cpu > 75 ? '#ea580c' : '#16a34a'};"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Top 5 Memory Utilization -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>Top 5 Devices by Memory Utilization</span>
                <span style="font-size: 11px; color: #64748b;">Peak / Current</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${[...state.devices].sort((a,b) => b.memory - a.memory).slice(0, 5).map(d => `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 700; color: #0070e0;">${d.name} (${d.probe})</span>
                      <span style="font-weight: 800; color: ${d.memory > 90 ? '#dc2626' : d.memory > 75 ? '#ea580c' : '#16a34a'};">${d.memory}%</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${d.memory}%; height: 100%; background: ${d.memory > 90 ? '#dc2626' : d.memory > 75 ? '#ea580c' : '#16a34a'};"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Top 5 High-Traffic Interfaces -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">Top 5 High-Traffic Network Interfaces</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b;">
                    <th style="padding: 6px 8px;">Interface</th>
                    <th style="padding: 6px 8px;">In Traffic</th>
                    <th style="padding: 6px 8px;">Out Traffic</th>
                    <th style="padding: 6px 8px;">Util %</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.interfaces.slice(0, 5).map(intf => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px; font-weight: 600; color: #0f172a;">${intf.name}<br><span style="font-size: 10px; color: #64748b;">${intf.device}</span></td>
                      <td style="padding: 8px; font-family: monospace;">${intf.inTraffic} Mbps</td>
                      <td style="padding: 8px; font-family: monospace;">${intf.outTraffic} Mbps</td>
                      <td style="padding: 8px; font-weight: 700; color: ${intf.inPercent > 75 ? '#dc2626' : '#16a34a'};">${intf.inPercent}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Top 5 Storage Partitions -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">Top Storage Volumes by Utilization</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b;">
                    <th style="padding: 6px 8px;">Partition</th>
                    <th style="padding: 6px 8px;">Device</th>
                    <th style="padding: 6px 8px;">Total</th>
                    <th style="padding: 6px 8px;">Used %</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.diskVolumes.map(vol => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px; font-weight: 600; color: #0f172a; font-family: monospace;">${vol.partition}</td>
                      <td style="padding: 8px; color: #0070e0; font-weight: 600;">${vol.device}</td>
                      <td style="padding: 8px; font-family: monospace;">${vol.total}</td>
                      <td style="padding: 8px; font-weight: 800; color: ${vol.percent > 90 ? '#dc2626' : vol.percent > 75 ? '#ea580c' : '#16a34a'};">${vol.percent}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

          </div>
        ` : activeSub === 'mttr' ? `
          <!-- SUBTAB: ALARMS & MTTR ANALYTICS -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- MTTR KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average MTTR</div>
                <div style="font-size: 26px; font-weight: 800; color: #0284c7; margin: 6px 0;">18m 42s</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">▼ 12% faster than 20m target</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Incidents (30D)</div>
                <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 6px 0;">142</div>
                <div style="font-size: 11px; color: #64748b;">135 Cleared | 7 Active</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Self-Healing Automated</div>
                <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">48 (33.8%)</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Resolved by OpManager Engine</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">First-Contact Resolution</div>
                <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">84.6%</div>
                <div style="font-size: 11px; color: #64748b;">Resolved in &lt; 15 mins</div>
              </div>
            </div>

            <!-- MTTR Details & Technician Scoreboard -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Resolution Time Histogram</div>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span>&lt; 15 Minutes (Rapid Remediation)</span>
                      <span style="font-weight: 700;">68% (96 Incidents)</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 68%; height: 100%; background: #16a34a;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span>15 - 60 Minutes (Standard Triaging)</span>
                      <span style="font-weight: 700;">24% (34 Incidents)</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 24%; height: 100%; background: #0284c7;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span>1 - 4 Hours (Escalated Root Cause)</span>
                      <span style="font-weight: 700;">6% (9 Incidents)</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 6%; height: 100%; background: #ea580c;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span>&gt; 4 Hours (Hardware Replacement)</span>
                      <span style="font-weight: 700;">2% (3 Incidents)</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 2%; height: 100%; background: #dc2626;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Technician Scoreboard -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Technician Resolution Scoreboard</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b;">
                      <th style="padding: 6px 8px;">Technician</th>
                      <th style="padding: 6px 8px;">Resolved</th>
                      <th style="padding: 6px 8px;">Avg MTTR</th>
                      <th style="padding: 6px 8px;">SLA %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px; font-weight: 700; color: #0070e0;">admin@opmanager</td>
                      <td style="padding: 8px; font-weight: 600;">54 Incidents</td>
                      <td style="padding: 8px; font-family: monospace;">14m 10s</td>
                      <td style="padding: 8px; font-weight: 700; color: #16a34a;">98.2%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px; font-weight: 700; color: #0070e0;">johndoe</td>
                      <td style="padding: 8px; font-weight: 600;">42 Incidents</td>
                      <td style="padding: 8px; font-family: monospace;">19m 22s</td>
                      <td style="padding: 8px; font-weight: 700; color: #16a34a;">95.4%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px; font-weight: 700; color: #0070e0;">noc_lead</td>
                      <td style="padding: 8px; font-weight: 600;">39 Incidents</td>
                      <td style="padding: 8px; font-family: monospace;">22m 45s</td>
                      <td style="padding: 8px; font-weight: 700; color: #16a34a;">94.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ` : `
          <!-- SUBTAB: HARDWARE LIFECYCLE & WARRANTY (EOL / EOS) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Enterprise Hardware Lifecycle & Warranty Status</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Cisco SmartNet, Dell ProSupport Plus, and NetApp SupportEdge contract tracker.</div>
              </div>
              <span style="background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; border: 1px solid #bbf7d0;">
                ● 15/16 Active Support Contracts
              </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Device / Hostname</th>
                  <th style="padding: 10px 14px;">Model & Serial Number</th>
                  <th style="padding: 10px 14px;">Service Contract</th>
                  <th style="padding: 10px 14px;">Expiry Date</th>
                  <th style="padding: 10px 14px;">Lifecycle State</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                  <td style="padding: 10px 14px;">Cisco Catalyst 9500-48Y4C<br><span style="font-size: 10px; font-family: monospace; color: #64748b;">SN: FCW2349L09X</span></td>
                  <td style="padding: 10px 14px;">Cisco SmartNet Total Care 24x7x4</td>
                  <td style="padding: 10px 14px; font-family: monospace;">2028-12-31</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">ACTIVE WARRANTY</span></td>
                  <td style="padding: 10px 14px; text-align: right;"><button style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Details</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">NY-DB-PROD-SQL</td>
                  <td style="padding: 10px 14px;">Dell PowerEdge R750<br><span style="font-size: 10px; font-family: monospace; color: #64748b;">Service Tag: 8K2M193</span></td>
                  <td style="padding: 10px 14px;">Dell ProSupport Plus 4-Hour Onsite</td>
                  <td style="padding: 10px 14px; font-family: monospace;">2027-06-15</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">ACTIVE WARRANTY</span></td>
                  <td style="padding: 10px 14px; text-align: right;"><button style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Details</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9; background: #fffbeb;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">LON-DIST-SW-01</td>
                  <td style="padding: 10px 14px;">HP ProCurve 5406R zl2<br><span style="font-size: 10px; font-family: monospace; color: #64748b;">SN: SG48291039</span></td>
                  <td style="padding: 10px 14px;">HPE Pointnext Care Pack</td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #b45309; font-weight: 700;">2026-12-15 (&lt; 45 Days)</td>
                  <td style="padding: 10px 14px;"><span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">EXPIRING SOON</span></td>
                  <td style="padding: 10px 14px; text-align: right;"><button style="background: #d97706; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">Renew SmartNet</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0070e0;">DXB-APC-UPS-01</td>
                  <td style="padding: 10px 14px;">Schneider Galaxy 3500 40kVA<br><span style="font-size: 10px; font-family: monospace; color: #64748b;">SN: APC8392109</span></td>
                  <td style="padding: 10px 14px;">Schneider Electric Advantage Plus</td>
                  <td style="padding: 10px 14px; font-family: monospace;">2029-04-30</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">ACTIVE WARRANTY</span></td>
                  <td style="padding: 10px 14px; text-align: right;"><button style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        `}

      </div>
    `;

    // Subtab event listeners
    container.querySelectorAll('.opm-rpt-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.reports = btn.getAttribute('data-sub');
        renderReportsView();
      };
    });

    // PDF button
    const pdfBtn = container.querySelector('#opm-rpt-pdf-btn');
    if (pdfBtn) {
      pdfBtn.onclick = () => {
        window.print();
      };
    }

    // CSV button
    const csvBtn = container.querySelector('#opm-rpt-csv-btn');
    if (csvBtn) {
      csvBtn.onclick = () => {
        const header = 'Device Name,IP Address,Probe,Availability,Outage Minutes\n';
        const rows = state.devices.map(d => `"${d.name}","${d.ip}","${d.probe}","${d.availability}","0"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpManager_Central_SLA_Report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported OpManager SLA Report CSV successfully.');
      };
    }
  }

  // -------------------------------------------------------------
  // VIEW: SETTINGS (Central & Probes, Agents, Discovery, Engine)
  // -------------------------------------------------------------
  function renderSettingsView() {
    state.currentTab = 'settings';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.settings || 'probes';

    const subtabs = [
      { id: 'probes', name: 'Central & Probes' },
      { id: 'agents', name: 'Monitoring Agents' },
      { id: 'discovery', name: 'Discovery Rules' },
      { id: 'credentials', name: 'Credential Library' },
      { id: 'engine', name: 'System Engine' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-set-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">Enterprise Admin Console</span>
          <button id="opm-set-save-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Save Settings
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'probes' ? `
          <!-- Central & Probes Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">OpManager Central Master Node Configuration</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 12px;">
                <div>
                  <label style="display: block; color: #64748b; font-weight: 600; margin-bottom: 4px;">Central Host IP</label>
                  <input type="text" value="10.0.0.10" readonly style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; font-family: monospace;">
                </div>
                <div>
                  <label style="display: block; color: #64748b; font-weight: 600; margin-bottom: 4px;">Probe Sync Port (TLS)</label>
                  <input type="text" value="8060" readonly style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; font-family: monospace;">
                </div>
                <div>
                  <label style="display: block; color: #64748b; font-weight: 600; margin-bottom: 4px;">Replication Interval</label>
                  <input type="text" value="30 seconds" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
                </div>
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
                <span>Connected Enterprise Probes (4 Online)</span>
                <button id="opm-add-probe-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">+ Add Remote Probe</button>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">Probe Name</th>
                    <th style="padding: 10px 14px;">IP Address</th>
                    <th style="padding: 10px 14px;">Location</th>
                    <th style="padding: 10px 14px;">Latency</th>
                    <th style="padding: 10px 14px;">Monitored Nodes</th>
                    <th style="padding: 10px 14px;">Sync Status</th>
                    <th style="padding: 10px 14px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.probes.map(pr => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 14px; font-weight: 700; color: #0070e0; cursor: pointer;" class="opm-probe-row-click" data-id="${pr.id}">${pr.name}</td>
                      <td style="padding: 10px 14px; font-family: monospace;">${pr.ip}</td>
                      <td style="padding: 10px 14px; color: #64748b;">${pr.location}</td>
                      <td style="padding: 10px 14px; font-family: monospace;">${pr.latency} ms</td>
                      <td style="padding: 10px 14px; font-weight: 600;">${pr.devicesCount} Devices</td>
                      <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 2px;">SYNCHRONIZED</span></td>
                      <td style="padding: 10px 14px; text-align: right;">
                        <button class="opm-probe-diag-btn" data-id="${pr.id}" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Diagnostics</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

          </div>
        ` : activeSub === 'agents' ? `
          <!-- Monitoring Agents Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">ManageEngine OpManager Central Agent Installation</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Deploy lightweight monitoring agents for granular server telemetry, process tracking, and event logs.</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
              <!-- Windows Installer Card -->
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; background: #fafbfc;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Windows Agent (x64)</div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Version 12.9.203 | Size: 24.2 MB | Windows Server 2016/2019/2022</div>
                <a href="/agents/OpManagerAgent.exe" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download OpManagerAgent.exe
                </a>
              </div>

              <!-- macOS / Linux Card -->
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; background: #fafbfc;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">macOS / Linux Package</div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Version 12.9.203 | Universal Binary | macOS 12+ & Linux kernel 4.x+</div>
                <a href="/agents/OpManagerAgent.dmg" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download OpManagerAgent.dmg
                </a>
              </div>
            </div>

            <!-- Enrollment Token -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Agent Enrollment Authentication Token</div>
              <div style="display: flex; gap: 10px;">
                <input type="text" value="OPM-CENTRAL-AUTH-TOKEN-9281-GA-129203" readonly style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 12px; background: #fff;">
                <button id="opm-copy-token-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Copy Token</button>
              </div>
            </div>
          </div>
        ` : activeSub === 'credentials' ? `
          <!-- Credential Library Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
              <span>Enterprise Credential Vault</span>
              <button id="opm-add-cred-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">+ Add Credential</button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Credential Name</th>
                  <th style="padding: 10px 14px;">Protocol Type</th>
                  <th style="padding: 10px 14px;">Details</th>
                  <th style="padding: 10px 14px;">Associated Nodes</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">Enterprise SNMPv2c Community</td>
                  <td style="padding: 10px 14px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">SNMP v2c</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">Community: ********** (RO)</td>
                  <td style="padding: 10px 14px;">12 Devices</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-cred-test-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Test</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">Secure Campus SNMPv3 USM</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">SNMP v3</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">User: opm_admin | SHA-256 / AES-256</td>
                  <td style="padding: 10px 14px;">4 Core Routers</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-cred-test-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Test</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">Windows Domain WMI/WinRM</td>
                  <td style="padding: 10px 14px;"><span style="background: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">WMI / WinRM</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">CORP\svc-opmanager-wmi</td>
                  <td style="padding: 10px 14px;">5 Windows Nodes</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-cred-test-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Test</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">Linux SSH Key Vault</td>
                  <td style="padding: 10px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">SSH (Key)</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">User: opm_linux_admin | RSA 4096-bit</td>
                  <td style="padding: 10px 14px;">6 Linux Nodes</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-cred-test-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Test</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : activeSub === 'discovery' ? `
          <!-- Discovery Rules Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Automated Discovery Schedules & CIDR Subnets</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Recurring sweeps for automatic device provisioning across multi-region probes.</div>
              </div>
              <button id="opm-new-rule-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">+ New Discovery Rule</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; color: #0f172a;">Dubai Campus LAN (10.40.0.0/20)</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Managed by Dubai Campus Core Probe | Sweep Daily at 02:00 AM | Credential: SNMPv2c Community</div>
                </div>
                <button class="opm-run-discovery-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Run Sweep Now</button>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; color: #0f172a;">New York Datacenter VPC (10.10.0.0/16)</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Managed by New York Data Center Probe | Sweep Daily at 03:00 AM | Credential: SNMPv3 USM</div>
                </div>
                <button class="opm-run-discovery-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Run Sweep Now</button>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; color: #0f172a;">London Branch Office (10.20.0.0/24)</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Managed by London Branch Office Probe | Sweep Daily at 04:00 AM | Credential: WMI / WinRM</div>
                </div>
                <button class="opm-run-discovery-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Run Sweep Now</button>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; color: #0f172a;">Singapore Cloud VPC (10.30.0.0/16)</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Managed by Singapore Cloud VPC Probe | Sweep Daily at 05:00 AM | Credential: Linux SSH Key Vault</div>
                </div>
                <button class="opm-run-discovery-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Run Sweep Now</button>
              </div>
            </div>
          </div>
        ` : `
          <!-- System Engine Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">JVM & Backend Engine Health (Build 129203)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Embedded PostgreSQL 14.7, JVM Heap Allocation, and Poller Thread Statistics.</div>
              </div>
              <button id="opm-db-maint-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Run DB Maintenance</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; font-size: 12px; margin-bottom: 24px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #fafbfc;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 8px;">JVM Heap Memory</div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                  <span>Allocated: 2,450 MB / 8,192 MB Max</span>
                  <span style="font-weight: 700; color: #16a34a;">30% (Healthy)</span>
                </div>
                <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                  <div style="width: 30%; height: 100%; background: #16a34a;"></div>
                </div>
                <div style="font-size: 11px; color: #64748b;">Garbage Collector: G1GC | Uptime: 14 days 6 hours</div>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #fafbfc;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 8px;">Embedded Database</div>
                <div style="color: #16a34a; font-weight: 800; margin-bottom: 4px;">PostgreSQL 14.7 Active (Port 13306)</div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Connection Pool: 14 Active / 150 Max | Database Size: 14.2 GB</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Buffer Cache Hit Ratio: 99.4%</div>
              </div>
            </div>

            <!-- Poller Worker Threads & Retention Policies -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #ffffff;">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Data Retention & Archival Policies</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; font-size: 12px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Raw Polling Data</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">7 Days</div>
                  <div style="color: #16a34a; font-size: 10px;">Automated Rollup</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Hourly Averages</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">30 Days</div>
                  <div style="color: #16a34a; font-size: 10px;">Trend Analysis</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Daily Summaries</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">365 Days</div>
                  <div style="color: #16a34a; font-size: 10px;">Annual SLA Reports</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Syslog & Trap Logs</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">15 Days</div>
                  <div style="color: #16a34a; font-size: 10px;">Rotated Daily</div>
                </div>
              </div>
            </div>

          </div>
        `}
      </div>
    `;

    // Subtab event listeners
    container.querySelectorAll('.opm-set-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.settings = btn.getAttribute('data-sub');
        renderSettingsView();
      };
    });

    // Save button
    const saveBtn = container.querySelector('#opm-set-save-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        showToast('OpManager Central settings saved successfully.');
      };
    }

    // Copy Token button
    const copyTokenBtn = container.querySelector('#opm-copy-token-btn');
    if (copyTokenBtn) {
      copyTokenBtn.onclick = () => {
        navigator.clipboard.writeText('OPM-CENTRAL-AUTH-TOKEN-9281-GA-129203');
        showToast('Agent enrollment authentication token copied to clipboard.');
      };
    }

    // Run discovery button
    container.querySelectorAll('.opm-run-discovery-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Initiated CIDR subnet discovery sweep across probe.');
      };
    });

    // Probe click
    container.querySelectorAll('.opm-probe-row-click, .opm-probe-diag-btn').forEach(el => {
      el.onclick = () => {
        const id = parseInt(el.getAttribute('data-id'), 10);
        showProbeDetailsModal(id);
      };
    });

    // Test credential button
    container.querySelectorAll('.opm-cred-test-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Credential validated successfully against target nodes.');
      };
    });

    // DB Maintenance button
    const dbBtn = container.querySelector('#opm-db-maint-btn');
    if (dbBtn) {
      dbBtn.onclick = () => {
        showToast('PostgreSQL VACUUM, ANALYZE & Reindex completed in 1.4s.');
      };
    }
  }
'''

target_path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/05_views_config_reports_settings.js'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(code)

print(f"Successfully generated {target_path} ({len(code)} bytes)")
