  // -------------------------------------------------------------
  // VIEW: ALARMS (Active, Problems, All, EventLog, Syslog, Traps, Custom)
  // -------------------------------------------------------------
  function renderAlarmsView() {
    state.currentTab = 'alarms';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.alarms || 'active';

    const subtabs = [
      { id: 'active', name: `Active Alarms (${state.alarms.length})` },
      { id: 'rca', name: 'Root Cause Analysis (RCA)' },
      { id: 'problems', name: 'Problems & Correlated Events' },
      { id: 'all', name: 'All Alarms (142)' },
      { id: 'eventlog', name: 'Windows Event Logs (320)' },
      { id: 'syslog', name: 'Syslog (1,420)' },
      { id: 'traps', name: 'SNMP Traps (5)' },
      { id: 'nfa', name: 'NetFlow Alarms' },
      { id: 'ncm', name: 'NCM Alarms' },
      { id: 'fwa', name: 'Firewall Alarms' },
      { id: 'oputils', name: 'IPAM & SPM Alarms' },
      { id: 'custom', name: 'Custom Views' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
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
    const countAck = state.alarms.filter(a => a.technician && a.technician !== 'Unacknowledged').length;
    const countUnack = countAll - countAck;

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
            <button id="opm-alarms-view-list" style="background: ${state.alarmsViewMode === 'list' ? '#49bd80' : '#ffffff'}; color: ${state.alarmsViewMode === 'list' ? '#ffffff' : '#334155'}; border: none; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
              List View
            </button>
            <button id="opm-alarms-view-grid" style="background: ${state.alarmsViewMode === 'grid' ? '#49bd80' : '#ffffff'}; color: ${state.alarmsViewMode === 'grid' ? '#ffffff' : '#334155'}; border: none; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer; border-left: 1px solid #cbd5e1;">
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
        <!-- SUBTAB: ACTIVE ALARMS (Authentic ManageEngine Vertical Ring Strip + Alarms Table) -->
        <div style="display: flex; min-height: calc(100vh - 140px); background: #ffffff;">
          
          <!-- Authentic ManageEngine Left Vertical Circular Severity Ring Strip (68px) -->
          <div style="width: 68px; background: #fafbfc; border-right: 1px solid #e2e8f0; padding: 14px 6px; display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0;">
            <!-- Total Alarms Ring -->
            <button class="opm-alarm-dial-btn" data-sev="all" title="All Active Alarms (${countAll})" style="background: none; border: none; padding: 0; cursor: pointer; position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
              <svg width="46" height="46" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="19" fill="${state.alarmsSeverityFilter === 'all' ? '#e0f2fe' : '#ffffff'}" stroke="#0284c7" stroke-width="4"/>
                <text x="23" y="27" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">${countAll}</text>
              </svg>
            </button>

            <div style="width: 36px; height: 1px; background: #cbd5e1; margin: 2px 0;"></div>

            <!-- Critical Ring -->
            <button class="opm-alarm-dial-btn" data-sev="Critical" title="Critical Alarms (${countCrit})" style="background: none; border: none; padding: 0; cursor: pointer; position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="${state.alarmsSeverityFilter === 'Critical' ? '#fee2e2' : '#ffffff'}" stroke="#ef4444" stroke-width="2.5"/>
                <text x="20" y="24" text-anchor="middle" font-size="12" font-weight="600" fill="#212121">${countCrit}</text>
              </svg>
            </button>

            <!-- Trouble Ring -->
            <button class="opm-alarm-dial-btn" data-sev="Trouble" title="Trouble Alarms (${countTroub})" style="background: none; border: none; padding: 0; cursor: pointer; position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="${state.alarmsSeverityFilter === 'Trouble' ? '#ffedd5' : '#ffffff'}" stroke="#f97316" stroke-width="2.5"/>
                <text x="20" y="24" text-anchor="middle" font-size="12" font-weight="600" fill="#212121">${countTroub}</text>
              </svg>
            </button>

            <!-- Attention Ring -->
            <button class="opm-alarm-dial-btn" data-sev="Attention" title="Attention Alarms (${countAttn})" style="background: none; border: none; padding: 0; cursor: pointer; position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="${state.alarmsSeverityFilter === 'Attention' ? '#fef9c3' : '#ffffff'}" stroke="#eab308" stroke-width="2.5"/>
                <text x="20" y="24" text-anchor="middle" font-size="12" font-weight="600" fill="#212121">${countAttn}</text>
              </svg>
            </button>

            <!-- Service Down Ring -->
            <button class="opm-alarm-dial-btn" data-sev="Service Down" title="Service Down (${countSvc})" style="background: none; border: none; padding: 0; cursor: pointer; position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="${state.alarmsSeverityFilter === 'Service Down' ? '#f3e8ff' : '#ffffff'}" stroke="#a855f7" stroke-width="2.5"/>
                <text x="20" y="24" text-anchor="middle" font-size="12" font-weight="600" fill="#212121">${countSvc}</text>
              </svg>
            </button>

            <div style="width: 36px; height: 1px; background: #cbd5e1; margin: 4px 0;"></div>

            <!-- Acknowledged Thumbs-Up Counter -->
            <div title="Acknowledged Alarms (${countAck})" style="display: flex; flex-direction: column; align-items: center; gap: 3px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; width: 40px; padding: 6px 0;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#49bd80" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span style="font-size: 11px; font-weight: 700; color: #334155;">${countAck}</span>
            </div>

            <!-- Unacknowledged Thumbs-Down Counter -->
            <div title="Unacknowledged Alarms (${countUnack})" style="display: flex; flex-direction: column; align-items: center; gap: 3px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; width: 40px; padding: 6px 0;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
              <span style="font-size: 11px; font-weight: 700; color: #334155;">${countUnack}</span>
            </div>
          </div>

          <!-- Right Alarms Content Area -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow-x: auto;">
            <div>
              <div style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; background: #ffffff; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="checkbox" style="width: 14px; height: 14px; cursor: pointer;">
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Active Alarms (${list.length})</span>
                  <select id="opm-alarms-probe-select" style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 3px; font-size: 11px; outline: none; background: #fff; color: #334155;">
                    <option value="all" ${state.selectedProbe === 'all' ? 'selected' : ''}>All Probes (4)</option>
                    ${state.probes.map(p => `<option value="${p.id}" ${state.selectedProbe == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #64748b;">
                  <button id="opm-alarm-ndr-btn" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            🛡️ NDR Threat Forensics
          </button>
          <button id="opm-alarm-zia-rca-btn" style="background: #ede9fe; border: 1px solid #c4b5fd; color: #5b21b6; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">🧠 Zia AI RCA</button>
                  <button id="opm-alarm-netpath-btn" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">🌐 NetPath</button>
                  <button id="opm-alarm-downtime-btn" style="background: #fef9c3; border: 1px solid #fde047; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">⏱️ Schedule Downtime</button>
                  <span style="cursor: pointer; font-size: 14px;" title="List View">☰</span>
                  <span style="cursor: pointer; font-size: 14px;" title="Table View">⊞</span>
                  <span style="cursor: pointer; font-size: 13px;" title="Search Alarms">🔍</span>
                  <span style="cursor: pointer; font-size: 13px;" title="Sort Alarms">⇅</span>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-weight: 700;">
                    <th style="padding: 9px 14px; width: 32px;"></th>
                    <th style="padding: 9px 14px; width: 100px;">Severity</th>
                    <th style="padding: 9px 14px;">Alarm Message &amp; Pipe Metadata (Message | IP | Device | Probe | Technician | Severity)</th>
                    <th style="padding: 9px 14px; width: 140px;">Entity</th>
                    <th style="padding: 9px 14px; width: 110px;">Time</th>
                    <th style="padding: 9px 14px; text-align: right; width: 130px;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.length === 0 ? `
                    <tr>
                      <td colspan="6" style="padding: 40px; text-align: center; color: #94a3b8;">
                        No active alarms matching severity filter "${state.alarmsSeverityFilter}".
                      </td>
                    </tr>
                  ` : list.map(alm => {
                    const sevDotColor = alm.severity === 'Critical' ? '#ef4444' : alm.severity === 'Trouble' ? '#f97316' : '#eab308';
                    return `
                    <tr class="opm-alarm-row" data-id="${alm.id}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s;">
                      <td style="padding: 9px 14px;" onclick="event.stopPropagation();"><input type="checkbox" style="cursor: pointer;"></td>
                      <td style="padding: 9px 14px;">${getStatusBadge(alm.severity)}</td>
                      <td style="padding: 9px 14px; color: #0f172a;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${sevDotColor}; margin-right: 6px; vertical-align: middle;"></span>
                        <span style="font-weight: 600; color: #1e293b;">${alm.message}</span>
                        <span style="color: #64748b; font-size: 11px; margin-left: 6px;">| ${alm.ip || '10.40.1.1'} | ${alm.device} | ${alm.probe} | ${alm.technician} | ${alm.severity} |</span>
                      </td>
                      <td style="padding: 9px 14px; font-weight: 600; color: #475569; font-size: 11px;">${alm.entity}</td>
                      <td style="padding: 9px 14px; font-size: 11px; color: #64748b;">${alm.time}</td>
                      <td style="padding: 9px 14px; text-align: right; white-space: nowrap;" onclick="event.stopPropagation();">
                        <button class="opm-alarm-row-ndr-btn" data-id="${alm.id}" title="NDR Threat Intelligence Forensics" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; width: 24px; height: 24px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                        <span style="font-size: 11px;">🛡️</span>
                      </button>
                      <button class="opm-alarm-row-rca-btn" data-id="${alm.id}" title="Zia AI Root Cause Analysis" style="background: #ede9fe; border: 1px solid #c4b5fd; color: #5b21b6; padding: 3px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; cursor: pointer; margin-right: 4px;">
                          🧠 Zia RCA
                        </button>
                        <button class="opm-alarm-quick-ack" data-id="${alm.id}" title="Acknowledge Alarm" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#49bd80" stroke-width="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                          Ack
                        </button>
                      </td>
                    </tr>
                  `; }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Authentic ManageEngine Bottom Pagination Footer -->
            <div style="padding: 8px 18px; border-top: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
              <div></div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #cbd5e1; cursor: default;">|&lt;&lt;</span>
                <span style="color: #cbd5e1; cursor: default;">&lt;&lt;</span>
                <span>Page <input type="text" value="1" readonly style="width: 28px; text-align: center; border: 1px solid #cbd5e1; border-radius: 2px; font-size: 11px; padding: 1px 2px;"> of 1</span>
                <span style="color: #cbd5e1; cursor: default;">&gt;&gt;</span>
                <span style="color: #cbd5e1; cursor: default;">&gt;&gt;|</span>
                <select style="border: 1px solid #cbd5e1; border-radius: 2px; font-size: 11px; padding: 1px 4px; background: #fff;">
                  <option>100</option>
                  <option>50</option>
                  <option>25</option>
                </select>
              </div>
              <div>View 1 - ${list.length} of ${list.length}</div>
            </div>
          </div>

        </div>
      ` : activeSub === 'rca' ? `
        <!-- SUBTAB: ROOT CAUSE ANALYSIS (RCA) -->
        <div style="padding: 20px 24px;">
          <!-- RCA Header Banner -->
          <div style="background: #0f172a; border-radius: 8px; padding: 20px 24px; color: #ffffff; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border-left: 6px solid #dc2626; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: #dc2626; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">P1 ROOT CAUSE ACTIVE</span>
                <span style="font-size: 16px; font-weight: 800; color: #f8fafc;">Incident RCA-2026-081: Core Uplink Flap & Transceiver Degrade</span>
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">
                Identified by Zia ML Correlation Engine &bull; Confidence: <strong style="color: #4ade80;">98.4% (Deterministic)</strong> &bull; Probed via Dubai Campus Core
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button id="opm-rca-remediate-btn" style="background: #16a34a; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                Execute Auto-Failover
              </button>
              <button id="opm-rca-export-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Export Post-Mortem
              </button>
            </div>
          </div>

          <!-- Root Cause & Blast Radius Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; margin-bottom: 24px;">
            
            <!-- Primary Root Cause Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>Identified Root Entity</span>
                <span style="color: #dc2626; font-weight: 700;">Critical Threshold Breached</span>
              </div>
              <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
                <div style="font-size: 14px; font-weight: 800; color: #991b1b; display: flex; align-items: center; gap: 8px;">
                  ${getDeviceTypeIcon('Cisco Catalyst 9500-48Y4C', 'Switches', 20)}
                  DXB-CORE-SW-01 &bull; FortyGigabitEthernet1/0/48
                </div>
                <div style="font-size: 12px; color: #7f1d1d; margin-top: 6px; line-height: 1.5;">
                  <strong>Failure Hypothesis:</strong> Optical transceiver SFP+ DDM receive power dropped below -18 dBm threshold. 14 successive SNMP link-down events recorded within 90 seconds. Port administratively shutdown by errdisable recovery.
                </div>
              </div>
              
              <div style="font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Hardware Serial:</span>
                  <span style="font-family: monospace; font-weight: 700;">FCW2349L09X</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>IP Address:</span>
                  <span style="font-family: monospace; font-weight: 700; color: #0070e0;">10.40.1.1</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Event Suppression:</span>
                  <span style="font-weight: 700; color: #16a34a;">14 raw traps &rarr; 1 incident (92.8% noise reduction)</span>
                </div>
              </div>
            </div>

            <!-- Downstream Impacted Topology (Blast Radius) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>Incident Blast Radius (Dependent Topology)</span>
                <span style="color: #64748b; font-size: 11px;">4 Dependent Managed Nodes</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="border: 1px solid #e2e8f0; border-left: 4px solid #ea580c; border-radius: 4px; padding: 10px 14px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 12px;">DXB-DIST-SW-01 (10.40.1.20)</div>
                    <div style="font-size: 11px; color: #64748b;">Primary trunk uplink disconnected &bull; Secondary STP blocked</div>
                  </div>
                  <span style="background: #ffedd5; color: #9a3412; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">UNREACHABLE VIA TRUNK</span>
                </div>

                <div style="border: 1px solid #e2e8f0; border-left: 4px solid #ca8a04; border-radius: 4px; padding: 10px 14px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 12px;">DXB-DIST-SW-02 (10.40.1.21)</div>
                    <div style="font-size: 11px; color: #64748b;">Rerouted traffic via 10Gbps backup link &bull; High link utilization</div>
                  </div>
                  <span style="background: #fef9c3; color: #854d0e; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">REROUTED (88% LOAD)</span>
                </div>

                <div style="border: 1px solid #e2e8f0; border-left: 4px solid #ea580c; border-radius: 4px; padding: 10px 14px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 12px;">DXB-ARUBA-WLC-01 (10.40.2.10)</div>
                    <div style="font-size: 11px; color: #64748b;">Mobility tunnels experience latency spikes (74 ms)</div>
                  </div>
                  <span style="background: #ffedd5; color: #9a3412; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">LATENCY ALERT</span>
                </div>

                <div style="border: 1px solid #e2e8f0; border-left: 4px solid #ca8a04; border-radius: 4px; padding: 10px 14px; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 12px;">DXB-APC-UPS-01 (10.40.9.5)</div>
                    <div style="font-size: 11px; color: #64748b;">NMC management card polled via secondary VLAN</div>
                  </div>
                  <span style="background: #fef9c3; color: #854d0e; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">NORMAL STANDBY</span>
                </div>
              </div>
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
      ` : activeSub === 'nfa' ? `
        <!-- SUBTAB: NETFLOW ALARMS (Flow Analysis - thirdLevelAlarmsTab.xml) -->
        <div style="padding: 20px 24px;">
          <!-- KPI Summary Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #dc2626;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Flow Alarms</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">3</div>
              <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">1 Critical Rate Anomaly</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Max Interface Spike</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">9.2 Gbps</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">NY-CORE-RTR-01 (TenGigE0/0/0/0)</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">QoS Drop SLA Violations</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">3.4% EF Drop</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">DXB-CORE-SW-01 (Voice Queue)</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Monitored Flow Sources</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">12 Interfaces</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">NetFlow v9 & IPFIX Active</div>
            </div>
          </div>

          <!-- Flow Alarms Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">NetFlow Analyzer Traffic Alarms</div>
              <span style="font-size: 11px; color: #64748b;">Matching model: <code>flow-analysis</code></span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Time</th>
                  <th style="padding: 10px 14px;">Target Device & Interface</th>
                  <th style="padding: 10px 14px;">Probe Scope</th>
                  <th style="padding: 10px 14px;">Detection Engine</th>
                  <th style="padding: 10px 14px;">Traffic Anomaly & Threshold</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">CRITICAL</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">4 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>NY-CORE-RTR-01</strong><br><span style="font-size: 11px; color: #0070e0;">TenGigE0/0/0/0 (WAN Uplink)</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Flow Anomaly Engine</td>
                  <td style="padding: 12px 14px; color: #1e293b;">WAN Inbound Traffic Spiked to <strong>9.2 Gbps</strong> (>90% bandwidth). Top App: HTTPS/QUIC. Threshold: 8.0 Gbps.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Acknowledge</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">TROUBLE</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">18 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>DXB-CORE-SW-01</strong><br><span style="font-size: 11px; color: #0070e0;">TenGigabitEthernet1/0/1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Dubai Campus Core</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">QoS Monitor</td>
                  <td style="padding: 12px 14px; color: #1e293b;">DSCP EF (Voice/Video) packet drop rate <strong>3.4%</strong> exceeding 1.0% SLA threshold.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Acknowledge</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">ATTENTION</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">1 hour ago</td>
                  <td style="padding: 12px 14px;"><strong>LON-CORE-RTR-01</strong><br><span style="font-size: 11px; color: #0070e0;">GigabitEthernet0/0/0</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">CBQoS Shaper</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Class-default shaping queue buffer utilization reached <strong>84%</strong>.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Acknowledge</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : activeSub === 'ncm' ? `
        <!-- SUBTAB: NCM CONFIG ALARMS (Config Management - thirdLevelAlarmsTab.xml) -->
        <div style="padding: 20px 24px;">
          <!-- KPI Summary Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #dc2626;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Config Alarms</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">3</div>
              <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">1 Critical Drift Detected</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Unauthorized Drift</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">DXB-CORE-SW-01</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Outside Maintenance Window</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">CIS Compliance Violations</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">1 Benchmark Rule</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">LON-DIST-SW-01 (Password Encryption)</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Config Backups Indexed</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">1,360 Versions</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Automated TFTP/SSH Git Vault</div>
            </div>
          </div>

          <!-- NCM Alarms Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Network Configuration Manager Compliance & Drift Alarms</div>
              <span style="font-size: 11px; color: #64748b;">Matching model: <code>config-management</code></span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Time</th>
                  <th style="padding: 10px 14px;">Device & IP Address</th>
                  <th style="padding: 10px 14px;">Probe Scope</th>
                  <th style="padding: 10px 14px;">Policy Engine</th>
                  <th style="padding: 10px 14px;">Drift & Compliance Violation Details</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">CRITICAL</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">12 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>DXB-CORE-SW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.40.1.1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Dubai Campus Core</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Config Drift Engine</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Unauthorized running-config change detected outside maintenance window without approved change request ticket.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Rollback Config</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">TROUBLE</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">35 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>LON-DIST-SW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.20.1.2</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">CIS Benchmark Rule</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Compliance Violation: <code>service password-encryption</code> missing or disabled in running configuration.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Remediate</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">ATTENTION</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">2 hours ago</td>
                  <td style="padding: 12px 14px;"><strong>NY-PA-FW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.10.0.1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Startup-Running Sync</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Startup config differs from Running config. Candidate commit pending in PAN-OS.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Commit Now</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : activeSub === 'fwa' ? `
        <!-- SUBTAB: FIREWALL ALARMS (Firewall Logs & Rules - thirdLevelAlarmsTab.xml) -->
        <div style="padding: 20px 24px;">
          <!-- KPI Summary Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #dc2626;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Firewall Alarms</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">3</div>
              <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">1 Critical SYN Flood</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">DDoS Rate Limiter</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">48,000 pkts/s</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">All Drops Enforced at Edge</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Shadowed / Redundant Rules</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">1 Obsolete Rule</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">LON-FTNT-FW-01 (#42 Shadowed)</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Blocked Attack Vectors</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">14 SSH Attempts</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Auto-Quarantined in ACL</div>
            </div>
          </div>

          <!-- Firewall Alarms Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Firewall Analyzer Security Policy & Attack Alarms</div>
              <span style="font-size: 11px; color: #64748b;">Matching model: <code>firewall-logs-rules</code></span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Time</th>
                  <th style="padding: 10px 14px;">Firewall Node</th>
                  <th style="padding: 10px 14px;">Probe Scope</th>
                  <th style="padding: 10px 14px;">Security Engine</th>
                  <th style="padding: 10px 14px;">Threat Details & Mitigation</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">CRITICAL</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">8 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>NY-PA-FW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.10.0.1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Threat Prevention</td>
                  <td style="padding: 12px 14px; color: #1e293b;">TCP SYN Flood attack detected targeting VIP 10.10.0.50:443. 48,000 pkts/s dropped by DoS protection profile.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #dc2626; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Blacklist Source</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">TROUBLE</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">45 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>LON-FTNT-FW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.20.0.1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Policy Optimizer</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Rule #42 "Permit-DMZ-Legacy" is completely shadowed by Rule #18. Zero hits recorded in 90 days.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Optimize Rule</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">ATTENTION</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">1 hour ago</td>
                  <td style="padding: 12px 14px;"><strong>NY-PA-FW-01</strong><br><span style="font-size: 11px; color: #64748b;">10.10.0.1</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Auth Security Log</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Repeated failed administrative SSH login attempts (14 attempts from 198.51.100.24). Source quarantined in ACL.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Acknowledge</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ` : activeSub === 'oputils' ? `
        <!-- SUBTAB: OPUTILS IPAM & SPM ALARMS (thirdLevelAlarmsTab.xml) -->
        <div style="padding: 20px 24px;">
          <!-- KPI Summary Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #dc2626;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Port & IP Alarms</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">3</div>
              <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">1 Link Flap Suppression</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">IP Address Conflict</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">10.10.3.50</div>
              <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">Duplicate MAC Detected</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Switch Port Flap</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">Port 48 (DXB-CORE)</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">8 Transitions in 3 mins</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Rogue Detection</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">1 Quarantined MAC</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">802.1X Access Enforced</div>
            </div>
          </div>

          <!-- OpUtils Alarms Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">OpUtils IP Address Manager & Switch Port Mapper Alarms</div>
              <span style="font-size: 11px; color: #64748b;">Matching models: <code>ipaddress-manager</code> & <code>switch-port-mapper</code></span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Severity</th>
                  <th style="padding: 10px 14px;">Time</th>
                  <th style="padding: 10px 14px;">Switch Port / Subnet</th>
                  <th style="padding: 10px 14px;">Probe Scope</th>
                  <th style="padding: 10px 14px;">OpUtils Tool</th>
                  <th style="padding: 10px 14px;">Network Diagnostic Details</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">CRITICAL</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">15 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>DXB-CORE-SW-01</strong><br><span style="font-size: 11px; color: #dc2626;">FortyGigabitEthernet1/0/48</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Dubai Campus Core</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Switch Port Mapper</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Port 48 link state FLAPPING (8 transition cycles in 3 minutes). Interface administratively down to protect STP topology.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Locate Port</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #ffedd5; color: #9a3412; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">TROUBLE</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">28 mins ago</td>
                  <td style="padding: 12px 14px;"><strong>Subnet 10.10.3.0/24</strong><br><span style="font-size: 11px; color: #0070e0;">VLAN 30 (Prod DB)</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">IP Address Manager</td>
                  <td style="padding: 12px 14px; color: #1e293b;">IP Conflict: 10.10.3.50 claimed by two distinct MAC addresses (00:50:56:B2:91:A4 vs 00:50:56:84:11:FE).</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Resolve IP</button></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 14px;"><span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">ATTENTION</span></td>
                  <td style="padding: 12px 14px; color: #64748b;">2 hours ago</td>
                  <td style="padding: 12px 14px;"><strong>LON-DIST-SW-01</strong><br><span style="font-size: 11px; color: #64748b;">FastEthernet0/12</span></td>
                  <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                  <td style="padding: 12px 14px; font-weight: 600; color: #334155;">Rogue Detection</td>
                  <td style="padding: 12px 14px; color: #1e293b;">Unrecognized rogue device (MAC: b4:99:ba:c1:02:44) connected to switchport without 802.1X certificate. Port quarantined.</td>
                  <td style="padding: 12px 14px; text-align: right;"><button class="opm-net-alarm-ack-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 3px; font-size: 11px; cursor: pointer;">Quarantine</button></td>
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

    // Row NDR button
    container.querySelectorAll('.opm-alarm-row-ndr-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (typeof showNdrForensicsModal === 'function') {
          showNdrForensicsModal();
        }
      };
    });

    // Toolbar NDR button
    const toolbarNdrBtn = container.querySelector('#opm-alarm-ndr-btn');
    if (toolbarNdrBtn) {
      toolbarNdrBtn.onclick = () => {
        if (typeof showNdrForensicsModal === 'function') {
          showNdrForensicsModal();
        }
      };
    }

    // Row Zia AI RCA button
    container.querySelectorAll('.opm-alarm-row-rca-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const alm = state.alarms.find(a => a.id === id) || state.alarms[0];
        if (typeof showZiaRcaModal === 'function') {
          showZiaRcaModal(alm);
        }
      };
    });

    // Toolbar Zia AI RCA button
    const toolbarZiaBtn = container.querySelector('#opm-alarm-zia-rca-btn');
    if (toolbarZiaBtn) {
      toolbarZiaBtn.onclick = () => {
        if (typeof showZiaRcaModal === 'function') {
          showZiaRcaModal(state.alarms[0]);
        }
      };
    }

    // Toolbar NetPath button
    const toolbarNetpathBtn = container.querySelector('#opm-alarm-netpath-btn');
    if (toolbarNetpathBtn) {
      toolbarNetpathBtn.onclick = () => {
        if (typeof showNetPathModal === 'function') {
          showNetPathModal(null, 'salesforce');
        }
      };
    }

    // Schedule Downtime button
    const downtimeBtn = container.querySelector('#opm-alarm-downtime-btn');
    if (downtimeBtn) {
      downtimeBtn.onclick = () => {
        if (typeof showScheduleDowntimeModal === 'function') {
          showScheduleDowntimeModal();
        }
      };
    }

    // Network Alarms Ack & Actions
    container.querySelectorAll('.opm-net-alarm-ack-btn').forEach(btn => {
      btn.onclick = () => {
        const orig = btn.textContent;
        btn.textContent = 'Acknowledged';
        btn.disabled = true;
        btn.style.opacity = '0.6';
        showToast(`${orig} action executed successfully.`);
      };
    });

    // RCA incident remediation actions
    const remediateBtn = container.querySelector('#opm-rca-remediate-btn');
    if (remediateBtn) {
      remediateBtn.onclick = () => {
        remediateBtn.innerText = '✓ Remediation Executed (Failover Active)';
        remediateBtn.style.background = '#0070e0';
        showToast('Zia automated failover initiated: DXB-DIST-SW-01 switched to secondary trunk.');
      };
    }
    const rcaExportBtn = container.querySelector('#opm-rca-export-btn');
    if (rcaExportBtn) {
      rcaExportBtn.onclick = () => {
        showToast('Generated Root Cause Analysis PDF Post-Mortem Report.');
      };
    }

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
        if (typeof showSnmpTrapSimulatorModal === 'function') {
          showSnmpTrapSimulatorModal();
        } else {
          showToast('Simulated SNMP linkDown trap ingested via UDP 162.');
        }
      };
    }

    const trapModalBtn = container.querySelector('#opm-trap-modal-open-btn');
    if (trapModalBtn) {
      trapModalBtn.onclick = () => {
        showTrapViewerModal();
      };
    }
  }

  // Drawer renderer (Module Scope)
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
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
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

          <!-- ManageEngine 24-Hour Availability Time Line Bar (from mobile-app-opm.png) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #ffffff; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase;">Time Line (Last 24 Hours)</span>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 10px; color: #475569;">
                <span style="display: flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #9333ea;"></span> Maint (0%)</span>
                <span style="display: flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #49bd80;"></span> Up (98.4%)</span>
                <span style="display: flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444;"></span> Down (1.6%)</span>
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
            <!-- Cyan IN & Orange OUT Grouped Bar Chart (matching NFA_Alert_Sample.png) -->
            <svg width="100%" height="78" viewBox="0 0 380 78" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 10px;">
              <line x1="28" y1="15" x2="370" y2="15" stroke="#f1f5f9" stroke-width="1" />
              <line x1="28" y1="38" x2="370" y2="38" stroke="#f1f5f9" stroke-width="1" />
              <line x1="28" y1="60" x2="370" y2="60" stroke="#cbd5e1" stroke-width="1" />
              <text x="4" y="18" font-size="8" fill="#64748b">15M</text>
              <text x="4" y="41" font-size="8" fill="#64748b">7.5M</text>
              <text x="4" y="62" font-size="8" fill="#64748b">0</text>
              ${[
                { x: 42, inH: 38, outH: 20, t: '17:04' },
                { x: 96, inH: 44, outH: 18, t: '17:05' },
                { x: 150, inH: 35, outH: 26, t: '17:06' },
                { x: 204, inH: 46, outH: 39, t: '17:07' },
                { x: 258, inH: 34, outH: 29, t: '17:08' },
                { x: 312, inH: 42, outH: 33, t: '17:09' }
              ].map(b => `
                <rect x="${b.x}" y="${60 - b.inH}" width="11" height="${b.inH}" fill="#29c5f6" rx="1" />
                <rect x="${b.x + 13}" y="${60 - b.outH}" width="11" height="${b.outH}" fill="#f8a346" rx="1" />
                <text x="${b.x + 12}" y="72" font-size="8" fill="#64748b" text-anchor="middle">${b.t}</text>
              `).join('')}
            </svg>
            <div style="font-size: 10px; font-weight: 800; color: #334155; margin-bottom: 4px;">Top Application &amp; Conversation</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; background: #ffffff; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                  <th style="padding: 4px 6px;">Application</th>
                  <th style="padding: 4px 6px;">Source &rarr; Dest</th>
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
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px 6px; font-weight: 700; color: #16a34a;">SmartCard_Port</td>
                  <td style="padding: 4px 6px; font-family: monospace;">192.168.100.104 &rarr; 172.16.1.2</td>
                  <td style="padding: 4px 6px;">AF21</td>
                  <td style="padding: 4px 6px; text-align: right; font-weight: 700;">101.66 MB</td>
                </tr>
                <tr>
                  <td style="padding: 4px 6px; font-weight: 700; color: #7c3aed;">HTTPS_TLS</td>
                  <td style="padding: 4px 6px; font-family: monospace;">10.40.1.1 &rarr; 10.10.1.50</td>
                  <td style="padding: 4px 6px;">EF</td>
                  <td style="padding: 4px 6px; text-align: right; font-weight: 700;">96.26 MB</td>
                </tr>
              </tbody>
            </table>
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
            <button id="opm-drawer-sdp-btn" style="width: 100%; background: #4f46e5; color: #ffffff; border: none; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🎫</span> Log Incident in ServiceDesk Plus / Jira
            </button>
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

      // ServiceDesk Plus incident
      const sdpBtn = drawer.querySelector('#opm-drawer-sdp-btn');
      if (sdpBtn) {
        sdpBtn.onclick = () => {
          showServiceDeskIncidentModal(alm);
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
      { id: 'layer2', name: 'Layer 2 STP Maps' },
      { id: 'worldmap', name: 'Global Probes WAN World Map' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
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
          <button id="opm-maps-bgp-btn" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            📡 BGP AS Topology
          </button>
          <button id="opm-maps-sdwan-btn" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            🚀 SD-WAN Fabric
          </button>
          <button id="opm-maps-netpath-btn" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            🌐 Hop-by-Hop NetPath
          </button>
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">Interactive Topology Engine v12.9</span>
          <button id="opm-maps-fullscreen-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Fullscreen ⤢
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'business' ? `
          <!-- Business Views: Left Tree Sidebar + Geographic World Map Canvas -->
          <div style="display: flex; gap: 18px; align-items: stretch;">
            <!-- Left Business Views Tree Sidebar (Authentic ManageEngine BV Sidebar) -->
            <div style="width: 230px; flex-shrink: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); display: flex; flex-direction: column;">
              <div style="padding: 12px 14px; background: #f5f5f5; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #212121; display: flex; justify-content: space-between; align-items: center;">
                <span>Business Views (5)</span>
                <span style="color: #49bd80; font-size: 15px; font-weight: 800; cursor: pointer;" title="Create Business View">+</span>
              </div>
              <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
                <input type="text" placeholder="Search Business View..." style="width: 100%; box-sizing: border-box; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 3px; font-size: 11px;">
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; font-size: 12px;">
                <div style="padding: 10px 14px; background: #e8f5e9; border-left: 3px solid #49bd80; font-weight: 700; color: #1e293b; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 12px; height: 18px;" /> Global Multi-Probe WAN</span>
                  <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 5px; border-radius: 2px;">16</span>
                </div>
                <div class="opm-topo-node" data-probe="1" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 11px; height: 16px;" /> New York Core DC</span>
                  <span style="font-size: 10px; color: #64748b;">4 Nodes</span>
                </div>
                <div class="opm-topo-node" data-probe="2" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 11px; height: 16px;" /> London Branch Fabric</span>
                  <span style="font-size: 10px; color: #64748b;">4 Nodes</span>
                </div>
                <div class="opm-topo-node" data-probe="3" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 11px; height: 16px;" /> Singapore Cloud VPC</span>
                  <span style="font-size: 10px; color: #64748b;">4 Nodes</span>
                </div>
                <div class="opm-topo-node" data-probe="4" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #dc2626; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus1.png" style="width: 11px; height: 16px;" /> Dubai Campus Core</span>
                  <span style="font-size: 10px; background: #fee2e2; color: #991b1b; padding: 1px 5px; border-radius: 2px;">1 Crit</span>
                </div>
              </div>
              <div style="padding: 12px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Map Shortcut Legend</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span>● Click Probe Node &rarr; Drilldown</span>
                  <span>● Click Central &rarr; Master Info</span>
                  <span>● Live Traffic Poll: 30s</span>
                </div>
              </div>
            </div>

            <!-- Right Map Canvas Card -->
            <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Enterprise Multi-Probe WAN Topology (Global Map View)</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Central Master (10.0.0.10) coordinating 4 distributed regional Probes across North America, Europe, Middle East & APAC.</div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569;">
                    <span style="font-weight: 700;">Map Theme:</span>
                    <select id="opm-bv-bg-select" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #334155; outline: none; cursor: pointer;">
                      <option value="/images/maps/world_map_02.jpg" selected>ManageEngine Ocean Blue Grid (Official)</option>
                      <option value="/images/maps/WorldMap_Blue.jpg">ManageEngine Continent Blue</option>
                      <option value="/images/maps/WorldMap_BlackGreen.jpg">ManageEngine Dark Emerald</option>
                      <option value="/images/maps/WorldMap_Gray.jpg">ManageEngine Executive Gray</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Official ManageEngine Business View Designer Toolbar & Link/Status Controls (/apiclient/fluidicv2/img/bv/*) -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 7px 12px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-right: 4px;">BV Designer Tools:</span>
                  ${[
                    { label: 'Add Device', ico: '/apiclient/fluidicv2/img/bv/addDevice_default.png' },
                    { label: 'Draw Link', ico: '/apiclient/fluidicv2/img/bv/link_default.png' },
                    { label: 'Add Shortcut', ico: '/apiclient/fluidicv2/img/bv/shortcut_default.png' },
                    { label: 'Background', ico: '/apiclient/fluidicv2/img/bv/bvBgIcon.png' },
                    { label: 'Properties', ico: '/apiclient/fluidicv2/img/bv/bvPropsIcon.png' },
                    { label: 'Delete Node', ico: '/apiclient/fluidicv2/img/bv/delete_default.png' }
                  ].map(tool => `
                    <button class="opm-bv-tool-btn" data-tool="${tool.label}" style="display: inline-flex; align-items: center; gap: 5px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #1e293b; cursor: pointer;" onclick="showToast('Business View Designer: ' + '${tool.label}' + ' mode activated')">
                      <img src="${tool.ico}" style="width: 14px; height: 14px; object-fit: contain;" />
                      <span>${tool.label}</span>
                    </button>
                  `).join('')}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 5px; border-left: 1px solid #cbd5e1; padding-left: 10px;">
                    <span style="font-size: 10px; font-weight: 700; color: #64748b;">Link Routing:</span>
                    <img src="/apiclient/fluidicv2/img/bv/straight_line_mc.png" title="Straight Link" style="width: 18px; height: 14px; object-fit: contain; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 2px; padding: 1px; background: #fff;" />
                    <img src="/apiclient/fluidicv2/img/bv/curved_line_mc.png" title="Curved Spline Link" style="width: 18px; height: 14px; object-fit: contain; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 2px; padding: 1px; background: #fff;" />
                    <img src="/apiclient/fluidicv2/img/bv/dashedStraight_mc.png" title="Dashed Backup Link" style="width: 18px; height: 14px; object-fit: contain; cursor: pointer; border: 1px solid #49bd80; border-radius: 2px; padding: 1px; background: #f0fdf4;" />
                    <img src="/apiclient/fluidicv2/img/bv/traffic_load_new.gif" title="Live Link Traffic Load Animation" style="height: 14px; object-fit: contain;" />
                  </div>
                  <div style="display: flex; align-items: center; gap: 5px; border-left: 1px solid #cbd5e1; padding-left: 10px; font-size: 10px; font-weight: 600; color: #475569;">
                    <img src="/apiclient/fluidicv2/img/bv/device_status_0.png" style="width: 12px; height: 12px;" title="Clear" />
                    <img src="/apiclient/fluidicv2/img/bv/device_status_1.png" style="width: 12px; height: 12px;" title="Attention" />
                    <img src="/apiclient/fluidicv2/img/bv/device_status_2.png" style="width: 12px; height: 12px;" title="Trouble" />
                    <img src="/apiclient/fluidicv2/img/bv/device_status_3.png" style="width: 12px; height: 12px;" title="Critical" />
                  </div>
                </div>
              </div>

              <!-- ManageEngine Official Link Bandwidth Legend (from BVLegendColors.xml) -->
              <div style="background: #1e293b; border-radius: 4px; padding: 8px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                <span style="font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">WAN Link Utilization Legend:</span>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #7f7f7f;"></span> 0%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #7D41DB;"></span> &lt;1%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #131394;"></span> 1-10%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #4673da;"></span> 10-25%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #00c0ff;"></span> 25-40%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #00f000;"></span> 40-55%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #f0f000;"></span> 55-70%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #f7941d;"></span> 70-85%</span>
                  <span style="display: flex; align-items: center; gap: 4px; color: #e2e8f0;"><span style="width: 10px; height: 8px; border-radius: 1px; background: #ff0000;"></span> 85-100%</span>
                </div>
              </div>

              <div id="opm-business-view-canvas" style="width: 100%; height: 470px; background: #cfe2f3 url('/images/maps/world_map_02.jpg') no-repeat center center; background-size: 100% 100%; border: 1px solid #cbd5e1; border-radius: 4px; position: relative; overflow: hidden;">
                <svg width="100%" height="100%" viewBox="0 0 900 470" style="position: absolute; top:0; left:0;">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <!-- Geographic WAN Links from Central Hub (US Central 145, 175) to Regional Probes -->
                  <!-- Central (145, 175) to New York Probe (225, 148) -->
                  <line class="opm-packet-flow" x1="145" y1="175" x2="225" y2="148" stroke="#00c0ff" stroke-width="3" stroke-dasharray="5 3" />
                  <rect x="148" y="122" width="72" height="15" rx="3" fill="#0f172a" opacity="0.9" />
                  <text x="184" y="133" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="bold" font-family="monospace">12ms | 28%</text>

                  <!-- New York Probe (225, 148) to London Probe (422, 122) Trans-Atlantic Fiber -->
                  <line class="opm-packet-flow" x1="225" y1="148" x2="422" y2="122" stroke="#00f000" stroke-width="3" stroke-dasharray="5 3" />
                  <rect x="285" y="114" width="76" height="16" rx="3" fill="#0f172a" opacity="0.9" />
                  <text x="323" y="125" text-anchor="middle" fill="#4ade80" font-size="9.5" font-weight="bold" font-family="monospace">28ms | 18%</text>

                  <!-- Central (145, 175) to Dubai Probe (558, 205) Direct SD-WAN Tunnel -->
                  <line class="opm-packet-flow opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x1="145" y1="175" x2="558" y2="205" stroke="#ff0000" stroke-width="3.5" stroke-dasharray="6 2" filter="url(#glow)" />
                  <rect class="opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x="315" y="182" width="84" height="17" rx="3" fill="#450a0a" stroke="#dc2626" stroke-width="1" />
                  <text class="opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x="357" y="194" text-anchor="middle" fill="#fca5a5" font-size="9.5" font-weight="bold" font-family="monospace">18ms | 78% !</text>

                  <!-- Central (145, 175) to Singapore Probe (692, 268) Trans-Pacific MPLS -->
                  <line class="opm-packet-flow" x1="145" y1="175" x2="692" y2="268" stroke="#00c0ff" stroke-width="2.8" stroke-dasharray="5 3" />
                  <rect x="380" y="232" width="76" height="16" rx="3" fill="#0f172a" opacity="0.9" />
                  <text x="418" y="243" text-anchor="middle" fill="#38bdf8" font-size="9.5" font-weight="bold" font-family="monospace">45ms | 42%</text>

                  <!-- Redundant Euro-Asia Terrestrial Ring: London (422, 122) -> Dubai (558, 205) -> Singapore (692, 268) -->
                  <line class="opm-packet-flow" x1="422" y1="122" x2="558" y2="205" stroke="#4673da" stroke-width="2.2" stroke-dasharray="4 3" />
                  <line class="opm-packet-flow" x1="558" y1="205" x2="692" y2="268" stroke="#4673da" stroke-width="2.2" stroke-dasharray="4 3" />

                  <!-- Center Master Node: OPMANAGER CENTRAL HQ (North America Central - 145, 175) -->
                  <g class="opm-topo-node" data-node="central" style="cursor: pointer;">
                    <circle cx="145" cy="175" r="35" fill="#0f172a" stroke="#49bd80" stroke-width="3.5" />
                    <image href="/images/deviceicons/server.png" x="133" y="148" width="24" height="24" />
                    <text x="145" y="182" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="bold">OPMANAGER</text>
                    <text x="145" y="193" text-anchor="middle" fill="#49bd80" font-size="8" font-weight="bold">CENTRAL HQ</text>
                  </g>

                  <!-- Node 1: New York Probe (US East Coast - 225, 148) -->
                  <g class="opm-topo-node" data-probe="1" style="cursor: pointer;">
                    <circle cx="225" cy="148" r="30" fill="#0f172a" stroke="#16a34a" stroke-width="3" />
                    <image href="/images/deviceicons/cisco_catalyst_3550.png" x="213" y="123" width="24" height="24" />
                    <text x="225" y="156" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">NY Probe</text>
                    <text x="225" y="167" text-anchor="middle" fill="#4ade80" font-size="8">10.10.0.1 (4)</text>
                  </g>

                  <!-- Node 2: London Probe (UK / Europe - 422, 122) -->
                  <g class="opm-topo-node" data-probe="2" style="cursor: pointer;">
                    <circle cx="422" cy="122" r="30" fill="#0f172a" stroke="#16a34a" stroke-width="3" />
                    <image href="/images/deviceicons/windows.png" x="410" y="97" width="24" height="24" />
                    <text x="422" y="130" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">LON Probe</text>
                    <text x="422" y="141" text-anchor="middle" fill="#4ade80" font-size="8">10.20.0.1 (4)</text>
                  </g>

                  <!-- Node 4: Dubai Probe (UAE / Middle East - 558, 205 - Critical Alert) -->
                  <g class="opm-topo-node" data-probe="4" style="cursor: pointer;">
                    <circle cx="558" cy="205" r="33" fill="#450a0a" stroke="#dc2626" stroke-width="3.5" filter="url(#glow)" />
                    <image href="/images/deviceicons/firewall.png" x="546" y="179" width="24" height="24" />
                    <text x="558" y="213" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">DXB Probe</text>
                    <text x="558" y="224" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="bold">10.40.0.1 (Crit)</text>
                  </g>

                  <!-- Node 3: Singapore Probe (APAC - 692, 268) -->
                  <g class="opm-topo-node" data-probe="3" style="cursor: pointer;">
                    <circle cx="692" cy="268" r="30" fill="#0f172a" stroke="#16a34a" stroke-width="3" />
                    <image href="/images/deviceicons/router.png" x="680" y="243" width="24" height="24" />
                    <text x="692" y="276" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">SG Probe</text>
                    <text x="692" y="287" text-anchor="middle" fill="#4ade80" font-size="8">10.30.0.1 (4)</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        ` : activeSub === 'floor' ? `
          <!-- 3D Floor Views: Isometric Server Room with Official Shipped Rack Top & Cold Aisle Textures -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">3D Datacenter Floor View - Hall 1 (Hot/Cold Aisle Containment)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Interactive top-down & isometric rack floor layout using ManageEngine Rack Builder textures. Click any rack enclosure to open its 42U elevation.</div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px; font-size: 11px;">
                <span style="display: flex; align-items: center; gap: 5px; font-weight: 700; color: #16a34a;"><img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 14px; height: 14px; border-radius: 2px;" /> Clear (6 Racks)</span>
                <span style="display: flex; align-items: center; gap: 5px; font-weight: 700; color: #ea580c;"><img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Orange.jpg" style="width: 14px; height: 14px; border-radius: 2px;" /> Trouble (1 Rack)</span>
                <span style="display: flex; align-items: center; gap: 5px; font-weight: 700; color: #dc2626;"><img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Red.jpg" style="width: 14px; height: 14px; border-radius: 2px;" /> Critical (1 Rack)</span>
              </div>
            </div>
            
            <!-- Raised Floor Tile Grid Canvas -->
            <div style="background: #e2e8f0; background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: 36px 36px; border: 2px solid #94a3b8; border-radius: 6px; padding: 24px;">
              
              <!-- ROW A (North Compute & Core Switching Row) -->
              <div style="font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Row A — Core Switching & Compute Enclosures (42U)</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 16px;">
                <div class="opm-floor-rack-card" style="background: #ffffff; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #0f172a;">RACK A-01</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 2px; font-weight: 700;">CLEAR</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">NY Core Routing</div>
                  <div style="font-size: 10px; color: #64748b;">38/42U Used • 21.4°C • 6.2 kW</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 10px rgba(220,38,38,0.18);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #991b1b;">RACK A-02</span>
                    <span style="font-size: 10px; background: #dc2626; color: #ffffff; padding: 1px 6px; border-radius: 2px; font-weight: 700;">CRITICAL</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Red.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #dc2626;">DXB Core Switch (A-02)</div>
                  <div style="font-size: 10px; color: #991b1b; font-weight: 600;">40/42U Used • 31.8°C • 8.4 kW</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #ffffff; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #0f172a;">RACK A-03</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 2px; font-weight: 700;">CLEAR</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">London Hypervisor Pod</div>
                  <div style="font-size: 10px; color: #64748b;">34/42U Used • 20.8°C • 5.8 kW</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #ffffff; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #0f172a;">RACK A-04</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 2px; font-weight: 700;">CLEAR</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Singapore Cloud Edge</div>
                  <div style="font-size: 10px; color: #64748b;">30/42U Used • 20.2°C • 5.1 kW</div>
                </div>
              </div>

              <!-- COLD AISLE CONTAINMENT CORRIDOR -->
              <div style="background: #0284c7; border-radius: 4px; padding: 8px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; color: #ffffff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/apiclient/fluidicv2/img/rack/ColdAisle.png" style="height: 22px; object-fit: contain; background: #fff; padding: 2px 6px; border-radius: 3px;" />
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.4px;">PERFORATED COLD AISLE CONTAINMENT CORRIDOR (CRAC INTAKE: 18.5°C / 45% RH)</span>
                </div>
                <span style="font-size: 11px; font-family: monospace; font-weight: 700;">Airflow: 14,200 CFM Nominal</span>
              </div>

              <!-- ROW B (South Storage, Database & Power Row) -->
              <div style="font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Row B — SAN Storage, Database Cluster & Redundant UPS Power</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
                <div class="opm-floor-rack-card" style="background: #fff7ed; border: 2px solid #ea580c; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #9a3412;">RACK B-01</span>
                    <span style="font-size: 10px; background: #ffedd5; color: #9a3412; padding: 1px 6px; border-radius: 2px; font-weight: 700;">TROUBLE</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Orange.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #9a3412;">PostgreSQL & SQL Cluster</div>
                  <div style="font-size: 10px; color: #9a3412;">36/42U Used • Disk 91% Warn</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #fefce8; border: 2px solid #ca8a04; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #854d0e;">RACK B-02</span>
                    <span style="font-size: 10px; background: #fef9c3; color: #854d0e; padding: 1px 6px; border-radius: 2px; font-weight: 700;">ATTENTION</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Yellow.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #854d0e;">NetApp NVMe All-Flash SAN</div>
                  <div style="font-size: 10px; color: #854d0e;">40/42U Used • 23.1°C • 7.4 kW</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #ffffff; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #0f172a;">RACK B-03</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 2px; font-weight: 700;">CLEAR</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Palo Alto SecOps Perimeter</div>
                  <div style="font-size: 10px; color: #64748b;">28/42U Used • 21.0°C • 4.9 kW</div>
                </div>

                <div class="opm-floor-rack-card" style="background: #ffffff; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; color: #0f172a;">RACK B-04</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 2px; font-weight: 700;">ONLINE</span>
                  </div>
                  <img src="/apiclient/fluidicv2/img/rack/Rack_top_image_Green.jpg" style="width: 100%; height: 48px; object-fit: cover; border-radius: 3px; margin-bottom: 8px;" />
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Schneider Galaxy 40kVA UPS</div>
                  <div style="font-size: 10px; color: #16a34a; font-weight: 600;">Battery 100% (42m Runtime)</div>
                </div>
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

            <div style="max-width: 720px; margin: 0 auto; background: #1e293b; border: 4px solid #0f172a; border-radius: 6px; padding: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
              
              <!-- 41-42U: Cisco ASR 9006 -->
              <div class="opm-rack-unit" data-id="7" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">41-42U</span>
                  <img src="/images/racks/front/Cisco-Switch-1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/Cisco-Switch-RearView-1U.png" title="Rear PSU Panel" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Cisco ASR 9006 Core Aggregation (NY-CORE-RTR-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Front: 48x 10GE Linecard | Rear: Dual Redundant AC PSUs</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #166534; color: #dcfce7; padding: 2px 6px; border-radius: 2px;">CLEAR</span>
              </div>

              <!-- 39-40U: NetApp Storage -->
              <div class="opm-rack-unit" data-id="5" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">39-40U</span>
                  <img src="/images/racks/front/HP-Server-1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/HP-Server-RearView-1U.png" title="Rear Controller Panel" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">NetApp AFF A400 NVMe All-Flash SAN Storage</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Front: 24x NVMe SSD Bays | Rear: Dual HA Storage Controllers</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #854d0e; color: #fef9c3; padding: 2px 6px; border-radius: 2px;">ATTENTION</span>
              </div>

              <!-- 37-38U: Dell PowerEdge R750 -->
              <div class="opm-rack-unit" data-id="2" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">37-38U</span>
                  <img src="/images/racks/front/DellServer_1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/Dell-Server-RearView-1U.png" title="Rear iDRAC & PSU Panel" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Dell PowerEdge R750 (NY-DB-PROD-SQL)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Front: PERC RAID Bays | Rear: iDRAC9 Enterprise &amp; Dual 1400W PSU</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #9a3412; color: #ffedd5; padding: 2px 6px; border-radius: 2px;">TROUBLE</span>
              </div>

              <!-- 35-36U: Patch Panel -->
              <div style="background: #0f172a; border: 1px dashed #334155; padding: 6px 14px; margin-bottom: 6px; font-family: monospace; font-size: 10px; color: #64748b; display: flex; align-items: center; justify-content: space-between;">
                <span>35-36U Optical Patch Panel &amp; Cable Organizer</span>
                <img src="/images/racks/peripherals/patchPanel.png" style="width: 180px; height: 18px; object-fit: cover;" />
              </div>

              <!-- 33-34U: Cisco Catalyst 9500 (DXB-CORE-SW-01) -->
              <div class="opm-rack-unit" data-id="1" style="background: #450a0a; border: 1px solid #dc2626; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #f87171; font-weight: 700;">33-34U</span>
                  <img src="/images/racks/front/Cisco-Switch-1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/Cisco-Switch-RearView-1U.png" title="Rear Exhaust & PSU Panel" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #fca5a5;">Cisco Catalyst 9500-48Y4C (DXB-CORE-SW-01)</div>
                    <div style="font-size: 10px; color: #fecaca;">Front: 48x 25G SFP28 | Rear: Fan Tray 2 RPM Degraded Alert</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #dc2626; color: #fff; padding: 2px 6px; border-radius: 2px;">CRITICAL</span>
              </div>

              <!-- 31-32U: Cisco Nexus 93180YC-FX -->
              <div class="opm-rack-unit" data-id="8" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">31-32U</span>
                  <img src="/images/racks/front/Cisco-Switch-1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/Cisco-Switch-RearView-1U.png" title="Rear Panel" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Cisco Nexus 93180YC-FX (NY-NEXUS-SW-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Front: Spine-Leaf VXLAN Fabric | Rear: Hot-Swappable N+1 Fans</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #16a34a; color: #dcfce7; padding: 2px 6px; border-radius: 2px;">CLEAR</span>
              </div>

              <!-- 30U: Palo Alto Firewall -->
              <div class="opm-rack-unit" data-id="4" style="background: #334155; border: 1px solid #475569; border-radius: 3px; padding: 8px 14px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">30U</span>
                  <img src="/images/racks/front/VMware-Server-1U.png" title="Front Panel" style="width: 120px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <img src="/images/racks/rear/VMware-Server-RearView-1U.png" title="Rear HA Ports" style="width: 90px; height: 22px; object-fit: cover; border-radius: 2px; opacity: 0.9;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #38bdf8;">Palo Alto PA-5250 Next-Gen FW (NY-PA-FW-01)</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Front: 40G Threat Prevention | Rear: HA1/HA2 Heartbeat Links</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #854d0e; color: #fef9c3; padding: 2px 6px; border-radius: 2px;">ATTENTION</span>
              </div>

              <!-- 1U-4U: Schneider APC UPS -->
              <div class="opm-rack-unit" data-id="5" style="background: #1e3a1e; border: 1px solid #16a34a; border-radius: 3px; padding: 12px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #fff;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; color: #86efac; font-weight: 700;">1-4U</span>
                  <img src="/images/racks/peripherals/powerStrip.png" style="width: 140px; height: 22px; object-fit: cover; border-radius: 2px;" />
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #86efac;">Schneider Galaxy 3500 40kVA UPS Battery</div>
                    <div style="font-size: 10px; color: #bbf7d0;">Online Double-Conversion | 42 Mins Runtime</div>
                  </div>
                </div>
                <span style="font-size: 10px; font-weight: 700; background: #16a34a; color: #fff; padding: 2px 6px; border-radius: 2px;">ONLINE</span>
              </div>

            </div>
          </div>
        ` : activeSub === 'layer2' ? `
          <!-- Layer 2 Maps: Authentic ManageEngine Radial Switch-to-Port STP Topology Map (layer2_sample.jpg style) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Layer 2 Radial Switch-to-Port Topology & Spanning Tree (Rapid-PVST+)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Discovered via CDP / LLDP / BRIDGE-MIB from Seed Router 10.40.1.1 (DXB-CORE-SW-01). Click any node to open Device Snapshot.</div>
              </div>
              <div style="display: flex; gap: 14px; font-size: 11px; align-items: center;">
                <span style="color: #16a34a; font-weight: 700;">● Forwarding (Designated/Root Port)</span>
                <span style="color: #ea580c; font-weight: 700;">● STP Blocked (Loop Prevention)</span>
                <span style="color: #dc2626; font-weight: 700;">● Link Down / Critical</span>
              </div>
            </div>

            <!-- ManageEngine Layer 2 Radial SVG Topology Canvas -->
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; position: relative; height: 440px; overflow: hidden;">
              <svg width="100%" height="100%" viewBox="0 0 900 440">
                <!-- Radial Spokes from Root Bridge (450, 220) -->
                <!-- Spoke 1: Root to NY-NEXUS-SW-01 (170, 90) -->
                <line x1="450" y1="220" x2="170" y2="90" stroke="#16a34a" stroke-width="2" />
                <rect x="275" y="138" width="66" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="308" y="149" text-anchor="middle" fill="#0f172a" font-size="9.5" font-family="monospace" font-weight="bold">Te1/0/1 (1)</text>

                <!-- Spoke 2: Root to LON-DIST-SW-01 (730, 90) -->
                <line x1="450" y1="220" x2="730" y2="90" stroke="#16a34a" stroke-width="2" />
                <rect x="558" y="138" width="66" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="591" y="149" text-anchor="middle" fill="#0f172a" font-size="9.5" font-family="monospace" font-weight="bold">Te1/0/2 (2)</text>

                <!-- Spoke 3: Root to NY-CORE-RTR-01 (140, 240) -->
                <line x1="450" y1="220" x2="140" y2="240" stroke="#16a34a" stroke-width="2" />
                <rect x="265" y="220" width="66" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="298" y="231" text-anchor="middle" fill="#0f172a" font-size="9.5" font-family="monospace" font-weight="bold">Gi0/1 (14)</text>

                <!-- Spoke 4: Root to NY-PA-FW-01 (760, 240) -->
                <line class="opm-packet-flow" x1="450" y1="220" x2="760" y2="240" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5 3" />
                <rect x="572" y="220" width="82" height="16" rx="2" fill="#fef2f2" stroke="#fca5a5" />
                <text x="613" y="231" text-anchor="middle" fill="#dc2626" font-size="9.5" font-family="monospace" font-weight="bold">Fo1/0/48 (48)</text>

                <!-- Spoke 5: Root to SG-LEAF-SW-01 (220, 365) -->
                <line class="opm-packet-flow" x1="450" y1="220" x2="220" y2="365" stroke="#ea580c" stroke-width="2" stroke-dasharray="4 3" />
                <rect x="295" y="285" width="76" height="16" rx="2" fill="#fff7ed" stroke="#fdba74" />
                <text x="333" y="296" text-anchor="middle" fill="#ea580c" font-size="9.5" font-family="monospace" font-weight="bold">Eth1/2 [BLK]</text>

                <!-- Spoke 6: Root to NY-DB-PROD-SQL (680, 365) -->
                <line x1="450" y1="220" x2="680" y2="365" stroke="#16a34a" stroke-width="2" />
                <rect x="530" y="285" width="66" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="563" y="296" text-anchor="middle" fill="#0f172a" font-size="9.5" font-family="monospace" font-weight="bold">Gi0/24 (24)</text>

                <!-- Redundant L2 Ring between NY-NEXUS-SW-01 (170, 90) and SG-LEAF-SW-01 (220, 365) -->
                <line class="opm-packet-flow" x1="170" y1="90" x2="220" y2="365" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />

                <!-- CENTER ROOT BRIDGE NODE (Peach Box matching layer2_sample.jpg) -->
                <g class="opm-l2-node" data-id="1" style="cursor: pointer;">
                  <rect x="380" y="182" width="140" height="74" rx="6" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5" />
                  <image href="/images/deviceicons/cisco_catalyst_3550.png" x="436" y="190" width="28" height="28" />
                  <text x="450" y="232" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">DXB-CORE-SW-01</text>
                  <text x="450" y="246" text-anchor="middle" fill="#9a3412" font-size="9.5" font-weight="bold">ROOT BRIDGE (10.40.1.1)</text>
                </g>

                <!-- SPOKE NODE 1: NY-NEXUS-SW-01 (170, 90) -->
                <g class="opm-l2-node" data-id="8" style="cursor: pointer;">
                  <circle cx="170" cy="78" r="22" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
                  <image href="/images/deviceicons/cisco_catalyst_3550.png" x="158" y="66" width="24" height="24" />
                  <text x="170" y="114" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">NY-NEXUS-SW-01</text>
                  <text x="170" y="126" text-anchor="middle" fill="#64748b" font-size="9.5">10.10.2.10</text>
                </g>

                <!-- SPOKE NODE 2: LON-DIST-SW-01 (730, 90) -->
                <g class="opm-l2-node" data-id="3" style="cursor: pointer;">
                  <circle cx="730" cy="78" r="22" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
                  <image href="/images/deviceicons/switch.png" x="718" y="66" width="24" height="24" />
                  <text x="730" y="114" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">LON-DIST-SW-01</text>
                  <text x="730" y="126" text-anchor="middle" fill="#64748b" font-size="9.5">10.20.1.2</text>
                </g>

                <!-- SPOKE NODE 3: NY-CORE-RTR-01 (140, 240) -->
                <g class="opm-l2-node" data-id="7" style="cursor: pointer;">
                  <circle cx="140" cy="228" r="22" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
                  <image href="/images/deviceicons/router.png" x="128" y="216" width="24" height="24" />
                  <text x="140" y="264" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">NY-CORE-RTR-01</text>
                  <text x="140" y="276" text-anchor="middle" fill="#64748b" font-size="9.5">10.10.0.1</text>
                </g>

                <!-- SPOKE NODE 4: NY-PA-FW-01 (760, 240) -->
                <g class="opm-l2-node" data-id="4" style="cursor: pointer;">
                  <circle cx="760" cy="228" r="22" fill="#fef2f2" stroke="#dc2626" stroke-width="2" />
                  <image href="/images/deviceicons/firewall.png" x="748" y="216" width="24" height="24" />
                  <text x="760" y="264" text-anchor="middle" fill="#dc2626" font-size="10.5" font-weight="bold">NY-PA-FW-01</text>
                  <text x="760" y="276" text-anchor="middle" fill="#64748b" font-size="9.5">10.10.1.1</text>
                </g>

                <!-- SPOKE NODE 5: SG-LEAF-SW-01 (220, 365) -->
                <g class="opm-l2-node" data-id="6" style="cursor: pointer;">
                  <circle cx="220" cy="353" r="22" fill="#fff7ed" stroke="#ea580c" stroke-width="2" />
                  <image href="/images/deviceicons/switch.png" x="208" y="341" width="24" height="24" />
                  <text x="220" y="389" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">SG-LEAF-SW-01</text>
                  <text x="220" y="401" text-anchor="middle" fill="#ea580c" font-size="9.5">STP Alt Port Blocked</text>
                </g>

                <!-- SPOKE NODE 6: NY-DB-PROD-SQL (680, 365) -->
                <g class="opm-l2-node" data-id="2" style="cursor: pointer;">
                  <circle cx="680" cy="353" r="22" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
                  <image href="/images/deviceicons/windows.png" x="668" y="341" width="24" height="24" />
                  <text x="680" y="389" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">NY-DB-PROD-SQL</text>
                  <text x="680" y="401" text-anchor="middle" fill="#64748b" font-size="9.5">10.10.3.50</text>
                </g>
              </svg>

              <!-- Authentic ManageEngine Floating Dark Node Details Tooltip Card (matching layer2_sample.jpg) -->
              <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(33, 33, 33, 0.94); color: #ffffff; padding: 12px 16px; border-radius: 4px; font-size: 11px; line-height: 1.65; box-shadow: 0 8px 20px rgba(0,0,0,0.25); border-left: 3px solid #49bd80;">
                <div><strong style="color: #94a3b8;">Name :</strong> DXB-CORE-SW-01.enterprise.corp</div>
                <div><strong style="color: #94a3b8;">IpAddress :</strong> 10.40.1.1</div>
                <div><strong style="color: #94a3b8;">Category :</strong> Switch (Root Bridge Priority 4096)</div>
                <div><strong style="color: #94a3b8;">DeviceType :</strong> Cisco Catalyst 9500-48Y4C</div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Global Probes WAN World Map (ManageEngine Central Flagship View) -->
          <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">🌐</span> GLOBAL MULTI-PROBE WAN TOPOLOGY &amp; LATENCY MAP
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Real-time inter-probe synchronization across America, Europe, Middle East, and Asia Pacific datacenters.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 11px; color: #4ade80; background: #064e3b; border: 1px solid #047857; padding: 3px 8px; border-radius: 4px; font-weight: 700;">
                  ● ALL 4 PROBES ONLINE
                </div>
                <button id="opm-worldmap-sync-all-btn" style="background: #0070e0; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Initiate Global Sync
                </button>
              </div>
            </div>

            <!-- World Map SVG Canvas (1000 x 480) -->
            <div style="position: relative; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; height: 480px;">
              <svg width="100%" height="100%" viewBox="0 0 1000 480" style="background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%);">
                <!-- Continents Silhouettes SVG -->
                <!-- North America -->
                <path d="M 80,60 L 220,50 L 320,70 L 340,110 L 290,140 L 260,190 L 200,240 L 170,270 L 190,290 L 160,280 L 140,240 L 120,200 L 90,150 L 70,100 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- South America -->
                <path d="M 220,290 L 280,300 L 320,330 L 300,390 L 270,440 L 230,460 L 210,410 L 200,340 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Europe -->
                <path d="M 440,70 L 520,60 L 550,90 L 530,140 L 480,160 L 450,140 L 430,100 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Africa -->
                <path d="M 450,170 L 530,160 L 580,200 L 580,260 L 550,330 L 510,380 L 470,350 L 440,280 L 430,220 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Asia -->
                <path d="M 530,60 L 750,50 L 880,90 L 920,150 L 850,210 L 780,260 L 710,230 L 630,210 L 560,150 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Australia -->
                <path d="M 800,330 L 890,320 L 930,370 L 890,420 L 820,410 L 780,360 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>

                <!-- WAN Links with Animated Glowing Dashes -->
                <!-- Link 1: New York (260, 150) -> London (480, 120) -->
                <path class="opm-packet-flow" d="M 260,150 Q 370,90 480,120" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="340" y="96" width="60" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" />
                <text x="370" y="108" text-anchor="middle" font-size="9" font-family="monospace" fill="#38bdf8" font-weight="bold">28ms</text>

                <!-- Link 2: London (480, 120) -> Dubai (640, 210) -->
                <path class="opm-packet-flow" d="M 480,120 Q 560,150 640,210" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="535" y="152" width="60" height="16" rx="3" fill="#0f172a" stroke="#f59e0b" />
                <text x="565" y="164" text-anchor="middle" font-size="9" font-family="monospace" fill="#f59e0b" font-weight="bold">42ms</text>

                <!-- Link 3: Dubai (640, 210) -> Singapore (800, 270) -->
                <path class="opm-packet-flow" d="M 640,210 Q 720,230 800,270" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="695" y="226" width="60" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" />
                <text x="725" y="238" text-anchor="middle" font-size="9" font-family="monospace" fill="#38bdf8" font-weight="bold">54ms</text>

                <!-- Link 4: Singapore (800, 270) -> New York (260, 150) (Transpacific Arc) -->
                <path class="opm-packet-flow" d="M 800,270 C 950,300 980,100 260,150" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />

                <!-- PROBE PINS -->
                <!-- PROBE 1: New York Data Center (260, 150) -->
                <g class="opm-world-pin" data-probe="1" style="cursor: pointer;">
                  <circle cx="260" cy="150" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="260" cy="150" r="6" fill="#22c55e" />
                  <rect x="180" y="170" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="260" y="186" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇺🇸 New York Data Center</text>
                  <text x="260" y="200" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 12ms RTT</text>
                </g>

                <!-- PROBE 2: London Branch Office (480, 120) -->
                <g class="opm-world-pin" data-probe="2" style="cursor: pointer;">
                  <circle cx="480" cy="120" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="480" cy="120" r="6" fill="#22c55e" />
                  <rect x="400" y="56" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="480" y="72" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇬🇧 London Branch Office</text>
                  <text x="480" y="86" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 28ms RTT</text>
                </g>

                <!-- PROBE 4: Dubai Campus Core (640, 210) -->
                <g class="opm-world-pin" data-probe="4" style="cursor: pointer;">
                  <circle cx="640" cy="210" r="16" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="2" />
                  <circle cx="640" cy="210" r="7" fill="#ef4444" />
                  <rect x="560" y="235" width="160" height="42" rx="4" fill="#450a0a" stroke="#dc2626" />
                  <text x="640" y="251" text-anchor="middle" font-size="10" font-weight="bold" fill="#fecaca">🇦🇪 Dubai Campus Core</text>
                  <text x="640" y="265" text-anchor="middle" font-size="9" fill="#f87171">⚠ 1 Critical Alarm • 18ms</text>
                </g>

                <!-- PROBE 3: Singapore Cloud VPC (800, 270) -->
                <g class="opm-world-pin" data-probe="3" style="cursor: pointer;">
                  <circle cx="800" cy="270" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="800" cy="270" r="6" fill="#22c55e" />
                  <rect x="720" y="295" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="800" y="311" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇸🇬 Singapore Cloud VPC</text>
                  <text x="800" y="325" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 45ms RTT</text>
                </g>
              </svg>
            </div>

            <!-- Bottom Selected Probe Telemetry Matrix -->
            <div id="opm-worldmap-probe-details" style="margin-top: 16px; background: #1e293b; border-radius: 6px; padding: 14px 18px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 18px;">🇦🇪</span>
                <div>
                  <div style="font-weight: 800; color: #f87171;">Dubai Campus Core Probe (DIC Datacenter)</div>
                  <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">IP: 10.40.0.1 &bull; 4 Managed Nodes &bull; Sync State: Synchronized &bull; Comm Port: 8060</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-world-inspect-probe-btn" data-probe="4" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  View Probe CIs in Inventory &rarr;
                </button>
                <button id="opm-world-diag-probe-btn" data-probe="4" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Probe Diagnostics
                </button>
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

    // NetPath button in Maps
    const mapsBgpBtn = container.querySelector('#opm-maps-bgp-btn');
    if (mapsBgpBtn) {
      mapsBgpBtn.onclick = () => {
        if (typeof showBgpMonitoringModal === 'function') showBgpMonitoringModal();
      };
    }
    const mapsSdwanBtn = container.querySelector('#opm-maps-sdwan-btn');
    if (mapsSdwanBtn) {
      mapsSdwanBtn.onclick = () => {
        if (typeof showSdwanPerformanceModal === 'function') showSdwanPerformanceModal();
      };
    }

    const netpathBtn = container.querySelector('#opm-maps-netpath-btn');
    if (netpathBtn) {
      netpathBtn.onclick = () => {
        if (typeof showNetPathModal === 'function') {
          showNetPathModal(null, 'salesforce');
        }
      };
    }

    // Fullscreen button
    const fullBtn = container.querySelector('#opm-maps-fullscreen-btn');
    if (fullBtn) {
      fullBtn.onclick = () => {
        showToast('Entering Fullscreen Topology Canvas...');
      };
    }

    // World Map Background Selector
    const bgSel = container.querySelector('#opm-bv-bg-select');
    if (bgSel) {
      bgSel.onchange = (e) => {
        const canvas = document.getElementById('opm-business-view-canvas');
        if (canvas) {
          if (e.target.value === 'none') {
            canvas.style.backgroundImage = 'none';
            canvas.style.backgroundColor = '#0b1120';
          } else {
            canvas.style.backgroundImage = `url('${e.target.value}')`;
            canvas.style.backgroundSize = '100% 100%';
            canvas.style.backgroundPosition = 'center';
          }
          showToast(`Map background changed to: ${e.target.options[e.target.selectedIndex].text}`);
        }
      };
    }

    // World Map Pin Clicks & Actions
    container.querySelectorAll('.opm-world-pin').forEach(pin => {
      pin.onclick = () => {
        const prId = parseInt(pin.getAttribute('data-probe'), 10);
        showProbeDetailsModal(prId);
      };
    });

    const worldInspectBtn = container.querySelector('#opm-world-inspect-probe-btn');
    if (worldInspectBtn) {
      worldInspectBtn.onclick = () => {
        state.selectedProbe = parseInt(worldInspectBtn.getAttribute('data-probe'), 10);
        window.location.hash = '#/inventory';
        showToast('Filtered Inventory to selected probe.');
      };
    }
    const worldDiagBtn = container.querySelector('#opm-world-diag-probe-btn');
    if (worldDiagBtn) {
      worldDiagBtn.onclick = () => {
        showProbeDetailsModal(4);
      };
    }
    const worldSyncBtn = container.querySelector('#opm-worldmap-sync-all-btn');
    if (worldSyncBtn) {
      worldSyncBtn.onclick = () => {
        showToast('Initiated global multi-probe synchronization across all 4 datacenters.');
      };
    }

        // WAN link inspector click listener
    container.querySelectorAll('.opm-bv-wan-link').forEach(link => {
      link.onclick = (e) => {
        e.stopPropagation();
        if (typeof showWanLinkDetailsModal === 'function') {
          showWanLinkDetailsModal();
        }
      };
    });

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

    // 3D Floor Rack card clicks -> switch to 42U Rack Elevation
    container.querySelectorAll('.opm-floor-rack-card').forEach(card => {
      card.onclick = () => {
        state.subTabs.maps = 'rack';
        renderMapsView();
        showToast('Opened 42U EIA-310 Rack Elevation View');
      };
    });

    // Layer 2 node clicks -> open Device Snapshot
    container.querySelectorAll('.opm-l2-node').forEach(node => {
      node.onclick = () => {
        const id = parseInt(node.getAttribute('data-id'), 10) || 1;
        showDeviceSnapshotModal(id);
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
