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
      { id: 'all', name: `All Alarms (${state.alarms.length})` },
      { id: 'eventlog', name: 'Windows Event Logs (0)' },
      { id: 'syslog', name: 'Syslog (0)' },
      { id: 'traps', name: 'SNMP Traps (0)' },
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
                    <option value="all" ${state.selectedProbe === 'all' ? 'selected' : ''}>All Probes (${state.probes.length})</option>
                    ${state.probes.map(p => `<option value="${p.id}" ${state.selectedProbe == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #64748b;">
                  <button id="opm-alarm-zia-rca-btn" style="background: #ede9fe; border: 1px solid #c4b5fd; color: #5b21b6; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">🧠 Zia AI RCA</button>
                  <button id="opm-alarm-downtime-btn" style="background: #fef9c3; border: 1px solid #fde047; color: #854d0e; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">⏱️ Schedule Downtime</button>
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
                      <td colspan="6" style="padding: 50px 20px; text-align: center;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div style="font-size: 15px; font-weight: 700; color: #166534; margin-bottom: 4px;">No Active Alarms</div>
                        <div style="font-size: 12px; color: #64748b;">All monitored infrastructure devices, servers, and threshold monitors are healthy.</div>
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
                        <span style="color: #64748b; font-size: 11px; margin-left: 6px;">| ${alm.ip || '127.0.0.1'} | ${alm.device} | ${alm.probe} | ${alm.technician || 'NOC Admin'} | ${alm.severity} |</span>
                      </td>
                      <td style="padding: 9px 14px; font-weight: 600; color: #475569; font-size: 11px;">${alm.entity}</td>
                      <td style="padding: 9px 14px; font-size: 11px; color: #64748b;">${alm.time}</td>
                      <td style="padding: 9px 14px; text-align: right; white-space: nowrap;" onclick="event.stopPropagation();">
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
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Active Root Cause Incidents</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Zia AI machine-learning correlation engine is standby. Root cause blast-radius graphs will render here if critical incidents occur.
            </div>
          </div>
        ` : activeSub === 'problems' ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">Zero Correlated Network Problems</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Cross-device event correlation has zero open tickets. All distributed services operating within SLA.
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
                <tr>
                  <td colspan="7" style="padding: 40px; text-align: center; color: #94a3b8;">
                    No historical alarms recorded. All monitored systems are operating normally.
                  </td>
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
        <!-- SUBTAB: WINDOWS EVENT LOGS -->
        <div style="padding: 20px 24px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Windows Event Log Records</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Install the OpManager Windows Agent (<code>OpManagerAgent.msi</code>) or configure WMI credentials to collect Windows System, Application, and Security event logs.
            </div>
          </div>
        </div>
      ` : activeSub === 'syslog' ? `
        <!-- SUBTAB: SYSLOG (REAL-TIME STREAM) -->
        <div style="padding: 20px 24px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Syslog Messages Received</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              OpManager Central Syslog Receiver daemon is listening on UDP port 514 (RFC 5424). Configure network devices to forward logs.
            </div>
          </div>
        </div>
      ` : activeSub === 'traps' ? `
        <!-- SUBTAB: SNMP TRAPS -->
        <div style="padding: 20px 24px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No SNMP Traps Received</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              OpManager Central SNMP Trap Listener is active on UDP port 162. Forward traps from your routers, switches, and firewalls to begin receiving real-time trap events.
            </div>
          </div>
        </div>
      ` : activeSub === 'nfa' ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No NetFlow Alarms</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              No flow bandwidth spikes or QoS degradation detected across flow export collectors.
            </div>
          </div>
        ` : activeSub === 'ncm' ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Configuration Compliance Alarms</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              All managed device configurations are baseline compliant with zero unapproved changes.
            </div>
          </div>
        ` : activeSub === 'fwa' ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Security or Threat Alarms</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Firewall threat log inspection reports zero active security incidents or attack patterns.
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
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">0 Conflicts</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">No Duplicates Detected</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Switch Port Flap</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">0 Flaps</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">All Ports Stable</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Rogue Detection</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">0 Rogue Devices</div>
              <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Perimeter Clean</div>
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
                <tr>
                  <td colspan="7" style="padding: 40px; text-align: center; color: #94a3b8;">
                    No IP address conflicts, rogue MACs, or switch port flaps detected.
                  </td>
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
        showToast('Automated failover initiated: Core interface switched to secondary trunk.');
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
                ? `High correlation with network traffic on ${alm.probe || 'Enterprise Site LAN'}. Recommend checking optical transceiver diagnostics or suppressing non-essential polling threads.`
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
                  <td style="padding: 4px 6px; font-family: monospace;">192.168.1.10 &rarr; 192.168.1.50</td>
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

    if (state.devices.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 10px 24px;">
          <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Maps &amp; Business Views</span>
        </div>
        <div style="padding: 60px 20px; text-align: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin: 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Topology Mapped Yet</div>
          <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            All demo devices have been cleared. Once you install the host agent or discover devices via SNMP, your network topology, 3D rack elevations, and business service views will be rendered here automatically.
          </div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <a href="/downloads/OpManagerAgent.msi" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none;">
              Windows Agent (.msi)
            </a>
            <a href="/downloads/install-agent.sh" download style="display: inline-flex; align-items: center; gap: 6px; background: #1e293b; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none;">
              Linux Agent Script (.sh)
            </a>
          </div>
        </div>
      `;
      return;
    }

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
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: #64748b; font-weight: 600;">Interactive Topology Engine v12.9</span>
          <button id="opm-maps-refresh-btn" onclick="renderMapsView()" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ⟳ Refresh
          </button>
          <button id="opm-maps-fullscreen-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
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
                <span>Business Views (${state.probes.length})</span>
                <span onclick="showAddProbeModal()" style="color: #49bd80; font-size: 15px; font-weight: 800; cursor: pointer;" title="Create Branch / Remote Probe View">+</span>
              </div>
              <div style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
                <input type="text" placeholder="Search Business View..." style="width: 100%; box-sizing: border-box; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 3px; font-size: 11px;">
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; font-size: 12px;">
                <div style="padding: 10px 14px; background: #e8f5e9; border-left: 3px solid #49bd80; font-weight: 700; color: #1e293b; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 12px; height: 18px;" /> Enterprise Network Topology</span>
                  <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 1px 5px; border-radius: 2px;">${state.devices.length}</span>
                </div>
                ${state.probes.map(pr => `
                  <div class="opm-topo-node" data-probe="${pr.id}" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="showProbeDetailsModal(${pr.id})">
                    <span style="display: flex; align-items: center; gap: 7px;"><img src="/images/GMaps/Gstatus5.png" style="width: 11px; height: 16px;" /> ${pr.name}</span>
                    <span style="font-size: 10px; color: #64748b;">${pr.devicesCount || 0} Nodes</span>
                  </div>
                `).join('')}
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
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Central Master coordinating ${state.probes.length} distributed Remote Probes across enterprise sites.</div>
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

                  <!-- Geographic Dynamic WAN Links & Nodes from Central Hub to Registered Probes -->
                  ${state.probes.map((pr, idx) => {
                    const x = 320 + (idx * 160);
                    const y = 175 + (idx % 2 === 0 ? -35 : 35);
                    const isOk = pr.status === 'Online' || pr.status === 'Synchronized';
                    const strokeColor = isOk ? '#00f000' : '#dc2626';
                    return `
                      <line class="opm-packet-flow" x1="145" y1="175" x2="${x}" y2="${y}" stroke="${strokeColor}" stroke-width="2.8" stroke-dasharray="5 3" />
                      <rect x="${Math.round((145 + x) / 2) - 35}" y="${Math.round((175 + y) / 2) - 8}" width="70" height="16" rx="3" fill="#0f172a" opacity="0.9" />
                      <text x="${Math.round((145 + x) / 2)}" y="${Math.round((175 + y) / 2) + 4}" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="bold" font-family="monospace">${pr.latency || 2}ms | 0%</text>

                      <g class="opm-topo-node" data-probe="${pr.id}" style="cursor: pointer;" onclick="if(typeof showProbeDetailsModal==='function') showProbeDetailsModal(${pr.id})">
                        <circle cx="${x}" cy="${y}" r="28" fill="#0f172a" stroke="${isOk ? '#16a34a' : '#dc2626'}" stroke-width="2.5" />
                        <image href="/images/deviceicons/server.png" x="${x - 12}" y="${y - 20}" width="24" height="24" />
                        <text x="${x}" y="${y + 12}" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="bold">${pr.name}</text>
                        <text x="${x}" y="${y + 22}" text-anchor="middle" fill="#4ade80" font-size="7.5">${pr.ip} (${pr.devicesCount || 0})</text>
                      </g>
                    `;
                  }).join('')}

                  <!-- Center Master Node: OPMANAGER CENTRAL MASTER -->
                  <g class="opm-topo-node" data-node="central" style="cursor: pointer;">
                    <circle cx="145" cy="175" r="35" fill="#0f172a" stroke="#49bd80" stroke-width="3.5" />
                    <image href="/images/deviceicons/server.png" x="133" y="148" width="24" height="24" />
                    <text x="145" y="182" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="bold">OPMANAGER</text>
                    <text x="145" y="193" text-anchor="middle" fill="#49bd80" font-size="8" font-weight="bold">CENTRAL MASTER</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        ` : activeSub === 'floor' ? `
          <!-- 3D Floor Views Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No 3D Datacenter Floor Views Configured</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Map your physical server room floor grid, aisle containment, and rack elevations to monitor thermal and power metrics.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Datacenter Rack
            </button>
          </div>
        ` : activeSub === 'rack' ? `
          <!-- 3D Rack Views -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No 3D Datacenter Racks Configured</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto 16px auto;">
              Create 3D datacenter racks and mount servers, switches, and UPS units to visualize rack space, thermal capacity, and front/rear port connectivity.
            </div>
            <button id="opm-create-rack-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              + Create New Rack
            </button>
          </div>
        ` : activeSub === 'layer2' ? `
          <!-- Layer 2 Maps -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="12" cy="6" r="3"/><line x1="12" y1="9" x2="6" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Layer 2 Network Topology Discovered</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto 16px auto;">
              Run Layer 2 Discovery or add network switches via SNMP to automatically map physical switch-to-port connections, VLAN trunks, and Spanning Tree topology.
            </div>
            <button id="opm-run-l2-discovery-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Run Layer 2 Discovery
            </button>
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
                  ● ALL ${state.probes.length} PROBES ONLINE
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

                <!-- Dynamic WAN Links & Probe Pins from state.probes -->
                ${state.probes.map((pr, idx) => {
                  const cx = 260 + (idx * 220);
                  const cy = 150 + (idx % 2 === 0 ? 0 : 70);
                  const isOk = pr.status === 'Online' || pr.status === 'Synchronized';
                  return `
                    <g class="opm-world-pin" data-probe="${pr.id}" style="cursor: pointer;" onclick="if(typeof showProbeDetailsModal==='function') showProbeDetailsModal(${pr.id})">
                      <circle cx="${cx}" cy="${cy}" r="14" fill="${isOk ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.25)'}" stroke="${isOk ? '#22c55e' : '#ef4444'}" stroke-width="1.5" />
                      <circle cx="${cx}" cy="${cy}" r="6" fill="${isOk ? '#22c55e' : '#ef4444'}" />
                      <rect x="${cx - 80}" y="${cy + 20}" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                      <text x="${cx}" y="${cy + 36}" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🌐 ${pr.name}</text>
                      <text x="${cx}" y="${cy + 50}" text-anchor="middle" font-size="9" fill="${isOk ? '#4ade80' : '#f87171'}">● ${pr.status || 'Online'} • ${pr.latency || 2}ms RTT</text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>

            <!-- Bottom Selected Probe Telemetry Matrix -->
            <div id="opm-worldmap-probe-details" style="margin-top: 16px; background: #1e293b; border-radius: 6px; padding: 14px 18px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 18px;">🌐</span>
                <div>
                  <div style="font-weight: 800; color: #38bdf8;">${state.probes[0]?.name || 'Central Site Probe'} (${state.probes[0]?.location || 'Local Server Node'})</div>
                  <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">IP: ${state.probes[0]?.ip || '127.0.0.1'} &bull; ${state.probes[0]?.devicesCount || 0} Managed Nodes &bull; Sync State: ${state.probes[0]?.syncStatus || 'Synchronized'} &bull; Comm Port: ${state.probes[0]?.commPort || 8060}</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-world-inspect-probe-btn" data-probe="${state.probes[0]?.id || 101}" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  View Probe CIs in Inventory &rarr;
                </button>
                <button id="opm-world-diag-probe-btn" data-probe="${state.probes[0]?.id || 101}" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
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
        showToast('Initiated global multi-probe synchronization across all enterprise probes.');
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
