import os

code = r'''  // -------------------------------------------------------------
  // VIEW: ALARMS (Active, Problems, All, EventLog, Syslog, Traps, Custom)
  // -------------------------------------------------------------
  function renderAlarmsView() {
    state.currentTab = 'alarms';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.alarms || 'active';

    const subtabs = [
      { id: 'active', name: `Active Alarms (${state.alarms.length})` },
      { id: 'problems', name: 'Problems & Correlated Events' },
      { id: 'all', name: 'All Alarms (142)' },
      { id: 'eventlog', name: 'Windows Event Logs (320)' },
      { id: 'syslog', name: 'Syslog (1,420)' },
      { id: 'traps', name: 'SNMP Traps (5)' },
      { id: 'custom', name: 'Custom Views' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-alarms-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 14px; font-size: 12px; cursor: pointer; transition: all 0.2s; white-space: nowrap; ${border}">
          ${st.name}
        </button>
      `;
    });

    // Calculate alarm counts
    const countAll = state.alarms.length;
    const countCrit = state.alarms.filter(a => a.severity === 'Critical').length;
    const countTroub = state.alarms.filter(a => a.severity === 'Trouble').length;
    const countAttn = state.alarms.filter(a => a.severity === 'Attention').length;
    const countSvc = state.alarms.filter(a => a.severity === 'Service Down').length;
    const countClr = state.alarms.filter(a => a.severity === 'Clear').length;

    // Filter alarms for active subtab
    let list = state.alarms;
    if (state.selectedProbe !== 'all') {
      list = list.filter(a => a.probeId == state.selectedProbe);
    }
    if (state.alarmsSeverityFilter !== 'all') {
      list = list.filter(a => a.severity.toLowerCase() === state.alarmsSeverityFilter.toLowerCase());
    }

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; overflow-x: auto;">
        <div style="display: flex; align-items: center; gap: 2px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding-left: 12px;">
          <!-- Noise Reduction Pill Badge (Reverse Engineered) -->
          <div title="Event Correlation Noise Reduction: 116 raw alerts suppressed into actionable incidents" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 5px; cursor: default;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
            82% Noise Reduction
          </div>

          <!-- Zia AI Summarize Action Button (Reverse Engineered) -->
          <button id="opm-alarms-zia-summarize-btn" data-fsoqa="alarms-actions-summarize-btn" style="background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; padding: 5px 11px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <span style="font-size: 12px;">✨</span>
            AI Summarize
          </button>

          <!-- Trap Viewer Action Button (Reverse Engineered) -->
          <button id="opm-alarms-trap-viewer-btn" data-fsoqa="alarms-actions-trap-viewer-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 11px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            Trap Viewer
          </button>

          <!-- Column Chooser Button (Reverse Engineered) -->
          <button id="opm-alarms-col-chooser-btn" data-fsoqa="alarms-actions-column-chooser-btn" title="Customize Columns" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; display: flex; align-items: center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>

          <div style="display: inline-flex; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;">
            <button id="opm-alarms-view-list" style="background: ${state.alarmsViewMode === 'list' ? '#0070e0' : '#ffffff'}; color: ${state.alarmsViewMode === 'list' ? '#ffffff' : '#334155'}; border: none; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
              List View
            </button>
            <button id="opm-alarms-view-grid" style="background: ${state.alarmsViewMode === 'grid' ? '#0070e0' : '#ffffff'}; color: ${state.alarmsViewMode === 'grid' ? '#ffffff' : '#334155'}; border: none; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer; border-left: 1px solid #cbd5e1;">
              Grid View
            </button>
          </div>
          <button id="opm-alarms-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 11px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT PER SUBTAB -->
      ${activeSub === 'active' ? `
        <!-- SUBTAB: ACTIVE ALARMS -->
        <div style="display: flex; min-height: calc(100vh - 140px);">
          
          <!-- Left Severity Dial Sidebar -->
          <div style="width: 220px; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 16px 12px; flex-shrink: 0;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 8px; margin-bottom: 10px;">Severity Dials</div>
            
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <button class="opm-alarm-dial-btn" data-sev="all" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'all' ? '#0070e0' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'all' ? '#f0f9ff' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="font-size: 12px; font-weight: 600; color: #1e293b;">All Severities</span>
                <span style="font-size: 11px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 2px 7px; border-radius: 10px;">${countAll}</span>
              </button>

              <button class="opm-alarm-dial-btn" data-sev="Critical" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'Critical' ? '#dc2626' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'Critical' ? '#fef2f2' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #991b1b;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #dc2626;"></span>
                  Critical
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #fee2e2; color: #991b1b; padding: 2px 7px; border-radius: 10px;">${countCrit}</span>
              </button>

              <button class="opm-alarm-dial-btn" data-sev="Trouble" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'Trouble' ? '#ea580c' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'Trouble' ? '#fff7ed' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #9a3412;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c;"></span>
                  Trouble
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #ffedd5; color: #9a3412; padding: 2px 7px; border-radius: 10px;">${countTroub}</span>
              </button>

              <button class="opm-alarm-dial-btn" data-sev="Attention" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'Attention' ? '#ca8a04' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'Attention' ? '#fefce8' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #854d0e;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #ca8a04;"></span>
                  Attention
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #fef9c3; color: #854d0e; padding: 2px 7px; border-radius: 10px;">${countAttn}</span>
              </button>

              <button class="opm-alarm-dial-btn" data-sev="Service Down" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'Service Down' ? '#9d174d' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'Service Down' ? '#fdf2f8' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #831843;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #9d174d;"></span>
                  Service Down
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #fce7f3; color: #831843; padding: 2px 7px; border-radius: 10px;">${countSvc}</span>
              </button>

              <button class="opm-alarm-dial-btn" data-sev="Clear" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 4px; border: 1px solid ${state.alarmsSeverityFilter === 'Clear' ? '#16a34a' : 'transparent'}; background: ${state.alarmsSeverityFilter === 'Clear' ? '#f0fdf4' : 'transparent'}; cursor: pointer; text-align: left;">
                <span style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #166534;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
                  Clear
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 7px; border-radius: 10px;">${countClr}</span>
              </button>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 8px; margin-bottom: 8px;">Active Probe</div>
              <select id="opm-alarms-probe-select" style="width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; outline: none; background: #fff;">
                <option value="all" ${state.selectedProbe === 'all' ? 'selected' : ''}>All Probes (4)</option>
                ${state.probes.map(p => `<option value="${p.id}" ${state.selectedProbe == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Right Alarms Content Area -->
          <div style="flex: 1; padding: 18px 24px; overflow-y: auto;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 700; color: #334155;">Showing ${list.length} Alarms</span>
                <span style="font-size: 11px; color: #64748b;">Click any alarm to open Zia AI Root Cause Analysis drawer</span>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #ffffff; border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-weight: 700;">
                    <th style="padding: 10px 14px; width: 105px;">Severity</th>
                    <th style="padding: 10px 14px;">Device / Source</th>
                    <th style="padding: 10px 14px;">Entity</th>
                    <th style="padding: 10px 14px;">Alarm Message</th>
                    <th style="padding: 10px 14px; width: 110px;">Time</th>
                    <th style="padding: 10px 14px; width: 120px;">Technician</th>
                    <th style="padding: 10px 14px; text-align: right; width: 100px;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.length === 0 ? `
                    <tr>
                      <td colspan="7" style="padding: 40px; text-align: center; color: #94a3b8;">
                        No active alarms matching severity filter "${state.alarmsSeverityFilter}".
                      </td>
                    </tr>
                  ` : list.map(alm => `
                    <tr class="opm-alarm-row" data-id="${alm.id}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s;">
                      <td style="padding: 10px 14px;">${getStatusBadge(alm.severity)}</td>
                      <td style="padding: 10px 14px;">
                        <div style="font-weight: 700; color: #0070e0;">${alm.device}</div>
                        <div style="font-size: 11px; color: #64748b;">${alm.probe}</div>
                      </td>
                      <td style="padding: 10px 14px; font-weight: 600; color: #334155;">${alm.entity}</td>
                      <td style="padding: 10px 14px; color: #0f172a; max-width: 320px;">${alm.message}</td>
                      <td style="padding: 10px 14px; font-size: 11px; color: #64748b;">${alm.time}</td>
                      <td style="padding: 10px 14px; font-size: 11px;">
                        <span style="padding: 2px 6px; border-radius: 3px; font-weight: 600; ${alm.technician === 'Unacknowledged' ? 'background: #fef2f2; color: #991b1b;' : 'background: #f0fdf4; color: #166534;'}">
                          ${alm.technician}
                        </span>
                      </td>
                      <td style="padding: 10px 14px; text-align: right;" onclick="event.stopPropagation();">
                        <button class="opm-alarm-quick-ack" data-id="${alm.id}" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                          Ack
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ` : activeSub === 'problems' ? `
        <!-- SUBTAB: PROBLEMS & CORRELATED EVENTS (ZIA RCA CONSOLE) -->
        <div style="padding: 20px 24px;">
          <!-- Noise Reduction Banner -->
          <div style="background: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%); border-radius: 8px; padding: 16px 20px; color: #ffffff; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(49, 46, 129, 0.15);">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 20px;">✨</div>
              <div>
                <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">Zia AI Event Correlation & Automated Noise Reduction</div>
                <div style="font-size: 12px; color: #c7d2fe; margin-top: 2px;">82% Event Noise Suppressed: 116 raw SNMP traps and link-state flaps clustered into 1 actionable incident.</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="background: #22c55e; color: #052e16; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">● Live Correlation Active</span>
              <button id="opm-prb-refresh-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Re-analyze</button>
            </div>
          </div>

          <!-- Correlated Incident Card -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 20px;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px;">P1 CRITICAL</span>
                <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Incident #PRB-9201: Optical SFP Transceiver Failure on DXB-CORE-SW-01</span>
              </div>
              <div style="font-size: 12px; color: #64748b;">Identified: 8 mins ago | Probe: Dubai Campus Core</div>
            </div>

            <div style="padding: 20px;">
              <!-- AI Hypothesis Box -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 12px; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px;">
                    <span>⚡</span> Zia Root Cause Hypothesis
                  </span>
                  <span style="font-size: 11px; font-weight: 800; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px;">98.2% Confidence</span>
                </div>
                <div style="font-size: 12px; color: #14532d; line-height: 1.5;">
                  Optical Transceiver SFP-10G-LR degradation on <strong>TenGigabitEthernet1/0/48</strong> caused intermittent PHY-layer carrier loss. This triggered BGP neighbor 192.168.10.1 hold-time expiration, resulting in an automated routing recalculation spike (CPU 93.4%) and cascading link flaps.
                </div>
              </div>

              <!-- Correlated Event Chain Timeline -->
              <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Correlated Event Sequence (116 Raw Signals Suppressed)</div>
                <div style="border-left: 2px solid #cbd5e1; margin-left: 10px; padding-left: 18px; display: flex; flex-direction: column; gap: 14px;">
                  <div style="position: relative;">
                    <span style="position: absolute; left: -24px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: #dc2626;"></span>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">10:41:02 - LinkDown Trap Received (OID: .1.3.6.1.6.3.1.1.5.3)</div>
                    <div style="font-size: 11px; color: #64748b;">Interface TenGigabitEthernet1/0/48 operational status changed to DOWN. RX Power dropped below -18 dBm.</div>
                  </div>
                  <div style="position: relative;">
                    <span style="position: absolute; left: -24px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: #ea580c;"></span>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">10:41:08 - BGP Peer 192.168.10.1 Session Terminated</div>
                    <div style="font-size: 11px; color: #64748b;">Neighbor session reset: HoldTimerExpired. 14 WAN routes withdrawn from core table.</div>
                  </div>
                  <div style="position: relative;">
                    <span style="position: absolute; left: -24px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: #ca8a04;"></span>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">10:41:14 - Switch CPU & Memory Utilization Exceeded Critical Threshold</div>
                    <div style="font-size: 11px; color: #64748b;">CPU at 93.4% (Process BGP Router 68%). Memory at 94.1%. Thermal sensor 48°C.</div>
                  </div>
                  <div style="position: relative;">
                    <span style="position: absolute; left: -24px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: #0284c7;"></span>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">10:41:35 - Latency Increase on DXB-ARUBA-WLC-01</div>
                    <div style="font-size: 11px; color: #64748b;">Ping response time climbed to 74 ms due to redundant path transit latency.</div>
                  </div>
                </div>
              </div>

              <!-- Technician Investigation Notes -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">Investigation Log & Remediation Notes</div>
                <div id="opm-rca-notes-container" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #334155; margin-bottom: 10px; font-family: monospace;">
                  [10:43:10] admin@opmanager: SFP optical diagnostics checked: TX power -2.4 dBm (Normal), RX power -19.8 dBm (Below threshold -14.0 dBm). Fiber patch cord replacement dispatched.
                </div>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="opm-rca-note-input" placeholder="Add technician investigation note..." style="flex: 1; padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                  <button id="opm-rca-add-note-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Add Note</button>
                </div>
              </div>

              <!-- Remediation Actions -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="opm-prb-bounce-btn" style="background: #dc2626; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Bounce Interface Te1/0/48</button>
                <button id="opm-prb-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Acknowledge Incident</button>
                <button id="opm-prb-ticket-btn" style="background: #ffffff; border: 1px solid #0070e0; color: #0070e0; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Create ServiceDesk Ticket</button>
              </div>
            </div>
          </div>
        </div>
      ` : activeSub === 'all' ? `
        <!-- SUBTAB: ALL ALARMS (HISTORICAL ARCHIVE - 142 ALARMS) -->
        <div style="padding: 20px 24px;">
          <!-- Filter Toolbar -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option>Past 24 Hours</option>
                <option selected>Past 7 Days (142 Alarms)</option>
                <option>Past 30 Days</option>
                <option>Custom Date Range</option>
              </select>
              <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="all">All Severities</option>
                <option value="Critical">Critical Only</option>
                <option value="Trouble">Trouble Only</option>
                <option value="Attention">Attention Only</option>
              </select>
              <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="all">All Statuses</option>
                <option value="cleared" selected>Cleared Only (135)</option>
                <option value="suppressed">Suppressed (116)</option>
              </select>
              <input type="text" placeholder="Search archive alarms..." style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; width: 220px;">
            </div>
            <button id="opm-export-archive-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Export Archive CSV</button>
          </div>

          <!-- Archive Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Device / Probe</th>
                  <th style="padding: 10px 14px;">Entity</th>
                  <th style="padding: 10px 14px;">Message</th>
                  <th style="padding: 10px 14px;">Duration</th>
                  <th style="padding: 10px 14px;">Resolved By</th>
                  <th style="padding: 10px 14px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CRITICAL</span></td>
                  <td style="padding: 10px 14px;"><strong>NY-CORE-RTR-01</strong><br><span style="font-size: 10px; color: #64748b;">New York Data Center</span></td>
                  <td style="padding: 10px 14px;">BGP Neighbor 198.51.100.2</td>
                  <td style="padding: 10px 14px; color: #334155;">BGP Session flap cleared after carrier ISP fiber re-splice</td>
                  <td style="padding: 10px 14px; font-family: monospace;">18m 42s</td>
                  <td style="padding: 10px 14px;">admin@opmanager</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CLEARED</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">TROUBLE</span></td>
                  <td style="padding: 10px 14px;"><strong>LON-MAIL-EXCH-01</strong><br><span style="font-size: 10px; color: #64748b;">London Branch Office</span></td>
                  <td style="padding: 10px 14px;">Disk Volume C:\\</td>
                  <td style="padding: 10px 14px; color: #334155;">Volume usage normalized to 62% after automated log cleanup</td>
                  <td style="padding: 10px 14px; font-family: monospace;">42m 10s</td>
                  <td style="padding: 10px 14px;">Auto-cleared (Poller)</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CLEARED</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #fef9c3; color: #854d0e; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">ATTENTION</span></td>
                  <td style="padding: 10px 14px;"><strong>SG-K8S-MSTR-01</strong><br><span style="font-size: 10px; color: #64748b;">Singapore Cloud VPC</span></td>
                  <td style="padding: 10px 14px;">Node Memory 84%</td>
                  <td style="padding: 10px 14px; color: #334155;">Memory usage dropped below 70% following pod eviction</td>
                  <td style="padding: 10px 14px; font-family: monospace;">1h 05m</td>
                  <td style="padding: 10px 14px;">johndoe</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CLEARED</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CRITICAL</span></td>
                  <td style="padding: 10px 14px;"><strong>DXB-EDGE-RTR-01</strong><br><span style="font-size: 10px; color: #64748b;">Dubai Campus Core</span></td>
                  <td style="padding: 10px 14px;">Power Supply 2 Failure</td>
                  <td style="padding: 10px 14px; color: #334155;">Dual PSU redundant feed restored after maintenance window</td>
                  <td style="padding: 10px 14px; font-family: monospace;">2h 15m</td>
                  <td style="padding: 10px 14px;">admin@opmanager</td>
                  <td style="padding: 10px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CLEARED</span></td>
                </tr>
              </tbody>
            </table>
            <div style="padding: 10px 16px; background: #fafbfc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Showing 4 of 142 historical alarms</span>
              <span>Page 1 of 36</span>
            </div>
          </div>
        </div>
      ` : activeSub === 'eventlog' ? `
        <!-- SUBTAB: WINDOWS EVENT LOGS (320 EVENTS) -->
        <div style="padding: 20px 24px;">
          <!-- Filter Toolbar -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="all">All Event Levels</option>
                <option value="Error">Error (18)</option>
                <option value="Warning">Warning (42)</option>
                <option value="Information">Information (260)</option>
              </select>
              <select style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option>All Monitored Windows Servers</option>
                <option>NY-DB-PROD-SQL (10.10.3.50)</option>
                <option>LON-MAIL-EXCH-01 (10.20.3.10)</option>
              </select>
              <input type="text" placeholder="Search Event ID or Source..." style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; width: 220px;">
            </div>
            <button style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Poll Windows Logs Now</button>
          </div>

          <!-- Event Log Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px; width: 80px;">Level</th>
                  <th style="padding: 10px 14px; width: 90px;">Event ID</th>
                  <th style="padding: 10px 14px;">Source</th>
                  <th style="padding: 10px 14px;">Computer Hostname</th>
                  <th style="padding: 10px 14px;">User / Account</th>
                  <th style="padding: 10px 14px;">Message</th>
                  <th style="padding: 10px 14px; width: 120px;">Date / Time</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">ERROR</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">1000</td>
                  <td style="padding: 10px 14px; font-weight: 600;">Application Error</td>
                  <td style="padding: 10px 14px;">NY-DB-PROD-SQL</td>
                  <td style="padding: 10px 14px;">NT AUTHORITY\SYSTEM</td>
                  <td style="padding: 10px 14px; color: #334155;">Faulting application name: pg_dump.exe, version 14.7.0.0, faulting module: ntdll.dll</td>
                  <td style="padding: 10px 14px; font-size: 11px; color: #64748b;">10 mins ago</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">WARNING</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">7036</td>
                  <td style="padding: 10px 14px; font-weight: 600;">Service Control Manager</td>
                  <td style="padding: 10px 14px;">LON-MAIL-EXCH-01</td>
                  <td style="padding: 10px 14px;">CORP\admin</td>
                  <td style="padding: 10px 14px; color: #334155;">The Microsoft Exchange Transport service entered the stopped state.</td>
                  <td style="padding: 10px 14px; font-size: 11px; color: #64748b;">24 mins ago</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #f0fdf4; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">INFO</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">4624</td>
                  <td style="padding: 10px 14px; font-weight: 600;">Microsoft-Windows-Security-Auditing</td>
                  <td style="padding: 10px 14px;">NY-DB-PROD-SQL</td>
                  <td style="padding: 10px 14px;">CORP\svc-backup</td>
                  <td style="padding: 10px 14px; color: #334155;">An account was successfully logged on. Logon Type: 3 (Network).</td>
                  <td style="padding: 10px 14px; font-size: 11px; color: #64748b;">32 mins ago</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px;"><span style="background: #f0fdf4; color: #166534; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">INFO</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">7040</td>
                  <td style="padding: 10px 14px; font-weight: 600;">Service Control Manager</td>
                  <td style="padding: 10px 14px;">LON-MAIL-EXCH-01</td>
                  <td style="padding: 10px 14px;">CORP\svc-opmanager</td>
                  <td style="padding: 10px 14px; color: #334155;">The start type of the Windows Remote Management (WS-Management) service was changed.</td>
                  <td style="padding: 10px 14px; font-size: 11px; color: #64748b;">1 hour ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : activeSub === 'syslog' ? `
        <!-- SUBTAB: SYSLOG (REAL-TIME STREAM - 1,420 MSGS) -->
        <div style="padding: 20px 24px;">
          <!-- Stream Status Bar -->
          <div style="background: #0f172a; border-radius: 6px; padding: 12px 18px; margin-bottom: 16px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: flex; align-items: center; gap: 6px; background: #15803d; color: #dcfce7; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #4ade80;"></span>
                LIVE STREAMING (12 msgs/sec)
              </span>
              <span style="font-size: 12px; color: #94a3b8;">Port: UDP 514 / RFC 5424 Format | Total Buffer: 1,420</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="opm-syslog-pause-btn" style="background: #334155; border: 1px solid #475569; color: #f8fafc; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Pause Stream</button>
              <button id="opm-syslog-clear-btn" style="background: #334155; border: 1px solid #475569; color: #f8fafc; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Clear Console</button>
            </div>
          </div>

          <!-- Syslog Stream Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: monospace;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700; font-family: -apple-system, sans-serif;">
                  <th style="padding: 8px 12px; width: 140px;">Timestamp</th>
                  <th style="padding: 8px 12px; width: 130px;">Host IP / Device</th>
                  <th style="padding: 8px 12px; width: 80px;">Facility</th>
                  <th style="padding: 8px 12px; width: 80px;">Severity</th>
                  <th style="padding: 8px 12px; width: 180px;">Mnemonic Tag</th>
                  <th style="padding: 8px 12px;">Raw Syslog Payload</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9; background: #fef2f2;">
                  <td style="padding: 8px 12px; color: #64748b;">10:41:02.192</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                  <td style="padding: 8px 12px;">local7</td>
                  <td style="padding: 8px 12px;"><span style="color: #dc2626; font-weight: 800;">CRIT (2)</span></td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #991b1b;">%LINK-3-UPDOWN</td>
                  <td style="padding: 8px 12px; color: #0f172a;">Interface TenGigabitEthernet1/0/48, changed state to down (carrier lost)</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9; background: #fff7ed;">
                  <td style="padding: 8px 12px; color: #64748b;">10:41:08.411</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                  <td style="padding: 8px 12px;">local7</td>
                  <td style="padding: 8px 12px;"><span style="color: #ea580c; font-weight: 800;">WARN (4)</span></td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #c2410c;">%BGP-5-ADJCHANGE</td>
                  <td style="padding: 8px 12px; color: #0f172a;">neighbor 192.168.10.1 Down: Hold timer expired</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 12px; color: #64748b;">10:41:14.020</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                  <td style="padding: 8px 12px;">local7</td>
                  <td style="padding: 8px 12px;"><span style="color: #ea580c; font-weight: 800;">WARN (4)</span></td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #c2410c;">%OSPF-5-ADJCHANGE</td>
                  <td style="padding: 8px 12px; color: #0f172a;">Process 1, Nbr 10.40.1.254 on Gi0/1 from FULL to DOWN, Neighbor Down: Dead timer</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 12px; color: #64748b;">10:38:00.104</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">NY-CORE-RTR-01</td>
                  <td style="padding: 8px 12px;">daemon</td>
                  <td style="padding: 8px 12px;"><span style="color: #16a34a; font-weight: 800;">NOTICE (5)</span></td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #15803d;">%SYS-5-CONFIG_I</td>
                  <td style="padding: 8px 12px; color: #0f172a;">Configured from console by admin on vty0 (10.10.3.50)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : activeSub === 'traps' ? `
        <!-- SUBTAB: SNMP TRAPS (IN-PAGE RECEIVER CONSOLE) -->
        <div style="padding: 20px 24px;">
          <!-- Trap Listener Status -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 20px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #16a34a;"></span>
                UDP 0.0.0.0:162 LISTENING
              </span>
              <span style="font-size: 12px; color: #475569;">Received: <strong>12,840</strong> | Processed: <strong>12,835</strong> | Dropped: <strong>5</strong> | Ingestion Rate: <strong>4.2 traps/sec</strong></span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button id="opm-trap-sim-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Send Simulated Trap</button>
              <button id="opm-trap-modal-open-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Open Trap Modal</button>
            </div>
          </div>

          <!-- Trap Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px; width: 130px;">Timestamp</th>
                  <th style="padding: 10px 14px; width: 140px;">Source Host / IP</th>
                  <th style="padding: 10px 14px;">Trap OID & Enterprise MIB</th>
                  <th style="padding: 10px 14px;">Trap Type</th>
                  <th style="padding: 10px 14px;">Variable Bindings (Varbinds)</th>
                  <th style="padding: 10px 14px; width: 100px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; color: #64748b;">10:41:02</td>
                  <td style="padding: 10px 14px;"><strong>DXB-CORE-SW-01</strong><br><span style="font-size: 10px; color: #64748b;">10.40.1.1</span></td>
                  <td style="padding: 10px 14px;">
                    <div style="font-family: monospace; font-size: 11px; color: #dc2626;">.1.3.6.1.6.3.1.1.5.3 (linkDown)</div>
                    <div style="font-size: 10px; color: #64748b;">MIB: IF-MIB (RFC 2863)</div>
                  </td>
                  <td style="padding: 10px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">SPECIFIC 2</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-size: 11px; color: #334155;">ifIndex.48 = 48, ifAdminStatus.48 = 1(up), ifOperStatus.48 = 2(down)</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-trap-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Ack</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 14px; color: #64748b;">10:38:00</td>
                  <td style="padding: 10px 14px;"><strong>NY-CORE-RTR-01</strong><br><span style="font-size: 10px; color: #64748b;">10.10.1.1</span></td>
                  <td style="padding: 10px 14px;">
                    <div style="font-family: monospace; font-size: 11px; color: #0070e0;">.1.3.6.1.4.1.9.9.43.2.0.1 (ciscoConfigManEvent)</div>
                    <div style="font-size: 10px; color: #64748b;">MIB: CISCO-CONFIG-MAN-MIB</div>
                  </td>
                  <td style="padding: 10px 14px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CONFIG EVENT</span></td>
                  <td style="padding: 10px 14px; font-family: monospace; font-size: 11px; color: #334155;">ccmHistoryEventCommandSource = 1(commandLine), ccmHistoryEventConfigSource = 2(running)</td>
                  <td style="padding: 10px 14px; text-align: right;"><button class="opm-trap-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Ack</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : `
        <!-- SUBTAB: CUSTOM VIEWS -->
        <div style="padding: 20px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Custom Saved Filter Views</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Filtered operational lenses configured for Network, Database, and Security teams.</div>
            </div>
            <button id="opm-create-view-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Create Custom View</button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">P1 Core Infrastructure Outages</span>
                <span style="background: #fee2e2; color: #991b1b; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">2 MATCHES</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Criteria: Severity = Critical AND Category IN (Routers, Switches)</div>
              <button class="opm-run-custom-view-btn" data-view="p1" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Run Filtered View</button>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Database Storage Warnings (>85%)</span>
                <span style="background: #ffedd5; color: #9a3412; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">1 MATCH</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Criteria: Entity CONTAINS 'Disk' AND DiskUsed% > 85.0%</div>
              <button class="opm-run-custom-view-btn" data-view="storage" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Run Filtered View</button>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Unacknowledged Escalations (>30m)</span>
                <span style="background: #fef2f2; color: #991b1b; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">3 MATCHES</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Criteria: Technician = 'Unacknowledged' AND Age > 30m</div>
              <button class="opm-run-custom-view-btn" data-view="unack" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Run Filtered View</button>
            </div>
          </div>
        </div>
      `}

      <!-- Slide-Out Alarm Drawer -->
      <div id="opm-alarm-drawer" style="display: none; position: fixed; top: 88px; right: 0; bottom: 0; width: 460px; background: #ffffff; border-left: 1px solid #cbd5e1; box-shadow: -4px 0 20px rgba(0,0,0,0.12); z-index: 9999; flex-direction: column; overflow-y: auto;">
        <div id="opm-alarm-drawer-content"></div>
      </div>
    `;

    // Severity Dial buttons
    container.querySelectorAll('.opm-alarm-dial-btn').forEach(btn => {
      btn.onclick = () => {
        state.alarmsSeverityFilter = btn.getAttribute('data-sev');
        renderAlarmsView();
      };
    });

    // Probe Select
    const probeSelect = container.querySelector('#opm-alarms-probe-select');
    if (probeSelect) {
      probeSelect.onchange = (e) => {
        state.selectedProbe = e.target.value;
        renderAlarmsView();
      };
    }

    // View toggle buttons
    const btnList = container.querySelector('#opm-alarms-view-list');
    const btnGrid = container.querySelector('#opm-alarms-view-grid');
    if (btnList && btnGrid) {
      btnList.onclick = () => { state.alarmsViewMode = 'list'; renderAlarmsView(); };
      btnGrid.onclick = () => { state.alarmsViewMode = 'grid'; renderAlarmsView(); };
    }

    // Export button
    const expBtn = container.querySelector('#opm-alarms-export-btn');
    if (expBtn) {
      expBtn.onclick = () => {
        const header = 'Alarm ID,Severity,Device,Entity,Probe,Message,Timestamp,Technician\n';
        const rows = state.alarms.map(a =>
          `"${a.id}","${a.severity}","${a.device}","${a.entity}","${a.probe}","${a.message}","${a.time}","${a.technician}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpManager_Central_Alarms_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported OpManager Central Alarms CSV successfully.');
      };
    }

    // Subtab click listeners
    container.querySelectorAll('.opm-alarms-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        const sub = btn.getAttribute('data-sub');
        state.subTabs.alarms = sub;
        renderAlarmsView();
      };
    });

    // Authentic Toolbar Actions
    const ziaSummBtn = container.querySelector('#opm-alarms-zia-summarize-btn');
    if (ziaSummBtn) {
      ziaSummBtn.onclick = () => {
        showZiaAssistantModal();
      };
    }

    const trapVwBtn = container.querySelector('#opm-alarms-trap-viewer-btn');
    if (trapVwBtn) {
      trapVwBtn.onclick = () => {
        showTrapViewerModal();
      };
    }

    const colChooserBtn = container.querySelector('#opm-alarms-col-chooser-btn');
    if (colChooserBtn) {
      colChooserBtn.onclick = () => {
        showColumnChooserModal('Alarms', () => renderAlarmsView());
      };
    }

    // Alarm row click opens Drawer
    container.querySelectorAll('.opm-alarm-row').forEach(row => {
      row.onclick = () => {
        const id = row.getAttribute('data-id');
        openAlarmDrawer(id);
      };
    });

    // Quick Ack
    container.querySelectorAll('.opm-alarm-quick-ack').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const alm = state.alarms.find(a => a.id === id);
        if (alm) {
          alm.technician = alm.technician === 'Unacknowledged' ? 'admin' : 'Unacknowledged';
          showToast(`Alarm ${alm.id} marked as ${alm.technician}.`);
          renderAlarmsView();
        }
      };
    });

    // Problems subtab actions
    const noteBtn = container.querySelector('#opm-rca-add-note-btn');
    const noteInput = container.querySelector('#opm-rca-note-input');
    if (noteBtn && noteInput) {
      noteBtn.onclick = () => {
        const val = noteInput.value.trim();
        if (val) {
          fetch('/api/json/alarm/addRCANotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alarmId: 'alm_801', note: val, technician: 'admin@opmanager' })
          }).catch(() => {});
          showToast('Investigation note saved to incident #PRB-9201.');
          noteInput.value = '';
          const notesBox = container.querySelector('#opm-rca-notes-container');
          if (notesBox) {
            notesBox.innerHTML += `<br>[Just now] admin@opmanager: ${val}`;
          }
        }
      };
    }

    const bounceBtn = container.querySelector('#opm-prb-bounce-btn');
    if (bounceBtn) {
      bounceBtn.onclick = () => {
        showToast('Interface TenGigabitEthernet1/0/48 bounce command executed successfully.');
      };
    }

    const simTrapBtn = container.querySelector('#opm-trap-sim-btn');
    if (simTrapBtn) {
      simTrapBtn.onclick = () => {
        showToast('Simulated SNMP linkDown trap ingested via UDP 162.');
      };
    }

    const trapModalBtn = container.querySelector('#opm-trap-modal-open-btn');
    if (trapModalBtn) {
      trapModalBtn.onclick = () => {
        showTrapViewerModal();
      };
    }

    // Drawer renderer
    function openAlarmDrawer(id) {
      const alm = state.alarms.find(a => a.id === id);
      if (!alm) return;

      const drawer = document.getElementById('opm-alarm-drawer');
      const drawerContent = document.getElementById('opm-alarm-drawer-content');
      if (!drawer || !drawerContent) return;

      drawerContent.innerHTML = `
        <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a;">Alarm Details - ${alm.id}</span>
            ${getStatusBadge(alm.severity)}
          </div>
          <button id="opm-close-alarm-drawer" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer;">✕</button>
        </div>

        <div style="padding: 20px;">
          
          <!-- Key Attributes -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Target Entity</div>
            <div style="font-size: 15px; font-weight: 800; color: #0070e0; cursor: pointer;" id="opm-drawer-device-link">${alm.device}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">${alm.entity} | Managed by ${alm.probe}</div>
          </div>

          <!-- Message Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Alarm Message</div>
            <div style="font-size: 13px; color: #0f172a; line-height: 1.4;">${alm.message}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Reported: ${alm.time}</div>
          </div>

          <!-- Zia AI RCA Analysis Section -->
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 800; color: #3730a3; display: flex; align-items: center; gap: 5px;">
                <span>✨</span> Zia AI Root Cause Analysis
              </span>
              <span style="font-size: 10px; font-weight: 800; background: #c7d2fe; color: #312e81; padding: 2px 6px; border-radius: 4px;">CONFIDENCE 94%</span>
            </div>
            <div style="font-size: 12px; color: #1e1b4b; line-height: 1.4;">
              ${alm.severity === 'Critical' 
                ? 'High correlation with scheduled backup flow running on Dubai Campus LAN. Recommend checking optical transceiver diagnostics on Gi0/1 or suppressing non-essential polling threads.'
                : 'Metric deviation detected during standard shift handoff. Threshold crossed baseline by 14%. No immediate service impact predicted.'}
            </div>
          </div>

          <!-- Actions & Notes -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Technician Assignment</div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <select id="opm-drawer-tech-select" style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                <option ${alm.technician === 'Unacknowledged' ? 'selected' : ''}>Unacknowledged</option>
                <option ${alm.technician === 'admin@opmanager' ? 'selected' : ''}>admin@opmanager</option>
                <option ${alm.technician === 'johndoe' ? 'selected' : ''}>johndoe</option>
                <option ${alm.technician === 'noc_lead' ? 'selected' : ''}>noc_lead</option>
              </select>
              <button id="opm-drawer-assign-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Assign</button>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="opm-drawer-clear-btn" style="width: 100%; background: #16a34a; color: #ffffff; border: none; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Clear Alarm (Mark Resolved)
            </button>
            <button id="opm-drawer-suppress-btn" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Suppress Similar Alarms (2 Hours)
            </button>
          </div>

        </div>
      `;

      drawer.style.display = 'flex';

      // Close drawer event
      const closeBtn = drawer.querySelector('#opm-close-alarm-drawer');
      if (closeBtn) closeBtn.onclick = () => { drawer.style.display = 'none'; };

      // Device click opens Snapshot
      const devLink = drawer.querySelector('#opm-drawer-device-link');
      if (devLink) {
        devLink.onclick = () => {
          const dev = state.devices.find(d => d.name === alm.device);
          if (dev) showDeviceSnapshotModal(dev.id);
        };
      }

      // Assign technician
      const assignBtn = drawer.querySelector('#opm-drawer-assign-btn');
      if (assignBtn) {
        assignBtn.onclick = () => {
          const select = drawer.querySelector('#opm-drawer-tech-select');
          alm.technician = select.value;
          showToast(`Alarm ${alm.id} assigned to ${alm.technician}.`);
          renderAlarmsView();
          openAlarmDrawer(alm.id);
        };
      }

      // Clear alarm
      const clearBtn = drawer.querySelector('#opm-drawer-clear-btn');
      if (clearBtn) {
        clearBtn.onclick = () => {
          alm.severity = 'Clear';
          showToast(`Alarm ${alm.id} marked as Clear.`);
          drawer.style.display = 'none';
          renderAlarmsView();
        };
      }

      // Suppress alarm
      const suppBtn = drawer.querySelector('#opm-drawer-suppress-btn');
      if (suppBtn) {
        suppBtn.onclick = () => {
          showToast(`Alarm ${alm.id} suppressed for 2 hours.`);
          drawer.style.display = 'none';
        };
      }
    }
  }

  // -------------------------------------------------------------
  // VIEW: MAPS (Business Views, 3D Floor, 3D Rack, Layer 2 STP)
  // -------------------------------------------------------------
  function renderMapsView() {
    state.currentTab = 'maps';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.maps || 'business';

    const subtabs = [
      { id: 'business', name: 'Business Views' },
      { id: 'floor', name: '3D Floor Views' },
      { id: 'rack', name: '3D Rack Views (42U)' },
      { id: 'layer2', name: 'Layer 2 STP Maps' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-maps-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
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
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">Interactive Topology Engine v12.9</span>
          <button id="opm-maps-fullscreen-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Fullscreen ⤢
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'business' ? `
          <!-- Business Views: Central-to-Probe SVG Architecture -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Enterprise Multi-Probe WAN Topology</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Central Master coordinating 4 distributed geographic Probes in real-time.</div>
              </div>
              <div style="display: flex; gap: 10px; font-size: 11px;">
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #166534;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span> Probe Synchronized</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; color: #dc2626;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #dc2626;"></span> Active Alarms</span>
              </div>
            </div>

            <!-- ManageEngine Official Link Bandwidth Legend (from BVLegendColors.xml) -->
            <div style="background: #1e293b; border-radius: 6px; padding: 10px 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
              <span style="font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Link Bandwidth Utilization:</span>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #7f7f7f;"></span> 0%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #7D41DB;"></span> &lt;1%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #131394;"></span> 1-10%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #4673da;"></span> 10-25%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #00c0ff;"></span> 25-40%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #00f000;"></span> 40-55%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #f0f000;"></span> 55-70%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #f7941d;"></span> 70-85%</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #ff0000;"></span> 85-100%</span>
              </div>
            </div>

            <div style="width: 100%; height: 500px; background: #0b1120; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <svg width="100%" height="100%" viewBox="0 0 900 500" style="position: absolute; top:0; left:0;">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <!-- Connection Lines from Central to Probes -->
                <!-- Central (450, 250) to NY Probe (180, 110) -->
                <line x1="450" y1="250" x2="180" y2="110" stroke="#00c0ff" stroke-width="2.5" stroke-dasharray="4 2" />
                <text x="315" y="170" fill="#38bdf8" font-size="11" font-family="monospace">12ms | 28%</text>

                <!-- Central (450, 250) to London Probe (720, 110) -->
                <line x1="450" y1="250" x2="720" y2="110" stroke="#4673da" stroke-width="2.5" stroke-dasharray="4 2" />
                <text x="585" y="170" fill="#818cf8" font-size="11" font-family="monospace">28ms | 18%</text>

                <!-- Central (450, 250) to SG Probe (180, 390) -->
                <line x1="450" y1="250" x2="180" y2="390" stroke="#00f000" stroke-width="2.5" stroke-dasharray="4 2" />
                <text x="315" y="330" fill="#4ade80" font-size="11" font-family="monospace">45ms | 42%</text>

                <!-- Central (450, 250) to Dubai Probe (720, 390) -->
                <line x1="450" y1="250" x2="720" y2="390" stroke="#f7941d" stroke-width="3" stroke-dasharray="6 2" filter="url(#glow)" />
                <text x="585" y="330" fill="#f97316" font-size="11" font-family="monospace">18ms | 78%</text>

                <!-- Center Node: OPManager Central Master -->
                <g class="opm-topo-node" data-node="central" style="cursor: pointer;">
                  <circle cx="450" cy="250" r="46" fill="#1e293b" stroke="#0070e0" stroke-width="3" />
                  <circle cx="450" cy="250" r="38" fill="#0f172a" />
                  <text x="450" y="246" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">OPMANAGER</text>
                  <text x="450" y="262" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="bold">CENTRAL</text>
                </g>

                <!-- Node: NY Probe -->
                <g class="opm-topo-node" data-probe="1" style="cursor: pointer;">
                  <circle cx="180" cy="110" r="36" fill="#1e293b" stroke="#16a34a" stroke-width="2.5" />
                  <text x="180" y="106" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">NY Probe</text>
                  <text x="180" y="122" text-anchor="middle" fill="#86efac" font-size="10">4 Nodes</text>
                </g>

                <!-- Node: London Probe -->
                <g class="opm-topo-node" data-probe="2" style="cursor: pointer;">
                  <circle cx="720" cy="110" r="36" fill="#1e293b" stroke="#16a34a" stroke-width="2.5" />
                  <text x="720" y="106" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">LON Probe</text>
                  <text x="720" y="122" text-anchor="middle" fill="#86efac" font-size="10">4 Nodes</text>
                </g>

                <!-- Node: Singapore Probe -->
                <g class="opm-topo-node" data-probe="3" style="cursor: pointer;">
                  <circle cx="180" cy="390" r="36" fill="#1e293b" stroke="#16a34a" stroke-width="2.5" />
                  <text x="180" y="386" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">SG Probe</text>
                  <text x="180" y="402" text-anchor="middle" fill="#86efac" font-size="10">4 Nodes</text>
                </g>

                <!-- Node: Dubai Probe (Critical Alarm) -->
                <g class="opm-topo-node" data-probe="4" style="cursor: pointer;">
                  <circle cx="720" cy="390" r="36" fill="#450a0a" stroke="#dc2626" stroke-width="3" filter="url(#glow)" />
                  <text x="720" y="386" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">DXB Probe</text>
                  <text x="720" y="402" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="bold">4 Alarms</text>
                </g>
              </svg>
            </div>
          </div>
        ` : activeSub === 'floor' ? `
          <!-- 3D Floor Views: Isometric Server Room -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 18px;">
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Datacenter Floor View - Zone 1 (High Density Hall)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Rack enclosures A1-A4 (Compute) and B1-B4 (Storage & Core Routing) with in-row CRAC cooling.</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
              <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b;">ROW A: RACK A-01</div>
                <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 8px 0;">Compute Tier</div>
                <div style="font-size: 12px; color: #16a34a; font-weight: 600;">● 42U Occupied (88%)</div>
              </div>
              <div style="border: 2px solid #fee2e2; border-radius: 8px; padding: 16px; background: #fef2f2; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #991b1b;">ROW A: RACK A-02</div>
                <div style="font-size: 18px; font-weight: 800; color: #dc2626; margin: 8px 0;">DXB Core Switch</div>
                <div style="font-size: 12px; color: #dc2626; font-weight: 600;">● 1 Critical Alarm (CPU)</div>
              </div>
              <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b;">ROW B: RACK B-01</div>
                <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 8px 0;">PostgreSQL Cluster</div>
                <div style="font-size: 12px; color: #ea580c; font-weight: 600;">● Disk Warning 91%</div>
              </div>
              <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b;">ROW B: RACK B-02</div>
                <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 8px 0;">Storage & UPS</div>
                <div style="font-size: 12px; color: #16a34a; font-weight: 600;">● Power Nominal</div>
              </div>
            </div>
          </div>
        ` : activeSub === 'rack' ? `
          <!-- 3D Rack Views: EIA-310 42U Official Elevation -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Standard 42U EIA-310 Server Rack Elevation (Rack A-02)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Realistic enterprise chassis facings. Click any mounted equipment to inspect telemetry snapshot.</div>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #0070e0; background: #e0f2fe; padding: 4px 10px; border-radius: 4px;">
                Total Load: 8.4 kW | Weight: 480 kg
              </div>
            </div>

            <div style="max-width: 650px; margin: 0 auto; background: #1e293b; border: 4px solid #0f172a; border-radius: 6px; padding: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
              
              <!-- 41-42U: Cisco ASR 9006 -->
              <div class="opm-rack-unit" data-id="7" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">41-42U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Cisco ASR 9006 Core Aggregation (NY-CORE-RTR-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">48x 10GE Linecard | Dual Route Processors</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #166534; color: #dcfce7; padding: 2px 6px; border-radius: 2px;">CLEAR</span>
              </div>

              <!-- 39-40U: NetApp Storage -->
              <div class="opm-rack-unit" data-id="5" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">39-40U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">NetApp AFF A400 NVMe All-Flash SAN Storage</div>
                    <div style="font-size: 10px; color: #cbd5e1;">24x NVMe SSD Bays (Active-Active NVRAM)</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #854d0e; color: #fef9c3; padding: 2px 6px; border-radius: 2px;">ATTENTION</span>
              </div>

              <!-- 37-38U: Dell PowerEdge R750 -->
              <div class="opm-rack-unit" data-id="2" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">37-38U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Dell PowerEdge R750 (NY-DB-PROD-SQL)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">2x Intel Xeon Platinum 8380 | 256 GB ECC DDR4</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #9a3412; color: #ffedd5; padding: 2px 6px; border-radius: 2px;">TROUBLE</span>
              </div>

              <!-- 35-36U: Blanking Panel -->
              <div style="background: #0f172a; border: 1px dashed #334155; padding: 6px 14px; margin-bottom: 6px; font-family: monospace; font-size: 10px; color: #64748b; text-align: center;">
                35-36U Vented Airflow Blanking Panel
              </div>

              <!-- 33-34U: Cisco Catalyst 9500 (DXB-CORE-SW-01) -->
              <div class="opm-rack-unit" data-id="1" style="background: #450a0a; border: 1px solid #dc2626; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #f87171; font-weight: 700;">33-34U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #fca5a5;">Cisco Catalyst 9500-48Y4C (DXB-CORE-SW-01)</div>
                    <div style="font-size: 10px; color: #fecaca;">48x 25G SFP28 + 4x 100G QSFP28 Uplinks</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #dc2626; color: #fff; padding: 2px 6px; border-radius: 2px;">CRITICAL</span>
              </div>

              <!-- 31-32U: Cisco Nexus 93180YC-FX -->
              <div class="opm-rack-unit" data-id="8" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">31-32U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Cisco Nexus 93180YC-FX (NY-NEXUS-SW-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Spine-Leaf VXLAN Fabric EVPN</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #16a34a; color: #dcfce7; padding: 2px 6px; border-radius: 2px;">CLEAR</span>
              </div>

              <!-- 30U: Palo Alto Firewall -->
              <div class="opm-rack-unit" data-id="4" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">30U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Palo Alto PA-5250 Next-Gen FW (NY-PA-FW-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">40 Gbps Threat Prevention Engine</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #854d0e; color: #fef9c3; padding: 2px 6px; border-radius: 2px;">ATTENTION</span>
              </div>

              <!-- 1U-4U: Schneider APC UPS -->
              <div class="opm-rack-unit" data-id="5" style="background: #1e3a1e; border: 1px solid #16a34a; border-radius: 3px; padding: 12px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #86efac; font-weight: 700;">1-4U</span>
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #86efac;">Schneider Galaxy 3500 40kVA UPS Battery</div>
                    <div style="font-size: 10px; color: #bbf7d0;">Online Double-Conversion | 42 Mins Runtime</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #16a34a; color: #fff; padding: 2px 6px; border-radius: 2px;">ONLINE</span>
              </div>

            </div>
          </div>
        ` : `
          <!-- Layer 2 Maps: Rapid-PVST+ STP Topology -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Layer 2 Spanning Tree (Rapid-PVST+) Topology Map</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">IEEE 802.1w loop prevention protocol state across campus and datacenter fabric.</div>
              </div>
              <div style="display: flex; gap: 12px; font-size: 11px;">
                <span style="color: #166534; font-weight: 600;">● Designated Port (Forwarding)</span>
                <span style="color: #0284c7; font-weight: 600;">● Root Port</span>
                <span style="color: #ea580c; font-weight: 600;">● Alternate / Blocked Port (Loop Prevention)</span>
              </div>
            </div>

            <div style="background: #0f172a; border-radius: 8px; padding: 24px; color: #ffffff; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 16px;">Root Bridge: DXB-CORE-SW-01 (Priority 4096 / SysID 0014.a821.9000)</div>
              <div style="display: flex; justify-content: space-around; align-items: center; max-width: 700px; margin: 0 auto;">
                <div style="border: 2px solid #16a34a; border-radius: 6px; padding: 12px; background: #1e293b; width: 180px;">
                  <div style="font-size: 12px; font-weight: 700; color: #86efac;">NY-NEXUS-SW-01</div>
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Eth1/1: Root Port (Forwarding)</div>
                </div>
                <div style="font-size: 20px; color: #16a34a;">⟷</div>
                <div style="border: 2px solid #ea580c; border-radius: 6px; padding: 12px; background: #1e293b; width: 180px;">
                  <div style="font-size: 12px; font-weight: 700; color: #fdba74;">SG-LEAF-SW-01</div>
                  <div style="font-size: 10px; color: #ea580c; margin-top: 4px;">Eth1/2: Blocked (Discarding)</div>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Subtab event listeners
    container.querySelectorAll('.opm-maps-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.maps = btn.getAttribute('data-sub');
        renderMapsView();
      };
    });

    // Fullscreen button
    const fullBtn = container.querySelector('#opm-maps-fullscreen-btn');
    if (fullBtn) {
      fullBtn.onclick = () => {
        showToast('Entering Fullscreen Topology Canvas...');
      };
    }

    // Topology node clicks
    container.querySelectorAll('.opm-topo-node').forEach(node => {
      node.onclick = () => {
        const prId = node.getAttribute('data-probe');
        if (prId) {
          showProbeDetailsModal(parseInt(prId, 10));
        } else {
          showAboutModal();
        }
      };
    });

    // Rack unit clicks
    container.querySelectorAll('.opm-rack-unit').forEach(unit => {
      unit.onclick = () => {
        const id = parseInt(unit.getAttribute('data-id'), 10);
        showDeviceSnapshotModal(id);
      };
    });
  }
'''

target_path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/04_views_alarms_maps.js'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(code)

print(f"Successfully generated {target_path} ({len(code)} bytes)")
