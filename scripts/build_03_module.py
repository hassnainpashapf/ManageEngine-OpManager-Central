import os

content = '''  // -------------------------------------------------------------
  // VIEW: DASHBOARD (Overview, Summary, Servers, Virt, Storage, Network, NOC)
  // -------------------------------------------------------------
  function renderDashboardView() {
    state.currentTab = 'dashboard';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.dashboard || 'overview';

    // Subtab definitions
    const subtabs = [
      { id: 'overview', name: 'Overview' },
      { id: 'summary', name: 'Summary' },
      { id: 'servers', name: 'Servers' },
      { id: 'virtualization', name: 'Virtualization' },
      { id: 'storage', name: 'Storage' },
      { id: 'network', name: 'Network' },
      { id: 'noc', name: 'NOC View ↗' }
    ];

    // Filter devices based on probe selection
    const filteredDevices = state.selectedProbe === 'all'
      ? state.devices
      : state.devices.filter(d => d.probeId == state.selectedProbe);

    // Filter alarms based on probe selection
    const filteredAlarms = state.selectedProbe === 'all'
      ? state.alarms
      : state.alarms.filter(a => a.probeId == state.selectedProbe);

    // Calculate metrics
    const totalDevices = filteredDevices.length;
    const criticalDevices = filteredDevices.filter(d => d.status === 'Critical').length;
    const troubleDevices = filteredDevices.filter(d => d.status === 'Trouble').length;
    const attentionDevices = filteredDevices.filter(d => d.status === 'Attention').length;
    const clearDevices = filteredDevices.filter(d => d.status === 'Clear').length;

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-dash-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; overflow-x: auto;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
          <span id="opm-refresh-countdown-span" style="font-size: 12px; color: #64748b; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 10px; border-radius: 4px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #16a34a;"></span>
            Auto Refresh: ${state.autoRefreshCountdown}s
          </span>
          <button id="opm-dash-add-widget-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Widget
          </button>
          <button id="opm-dash-refresh-all-btn" title="Refresh Now" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 10px; border-radius: 4px; font-size: 13px; cursor: pointer;">
            ⟳
          </button>
        </div>
      </div>

      <div style="padding: 18px 24px 30px 24px;">

        ${activeSub === 'overview' ? `
          <!-- KPI Executive Ribbon -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Monitored Devices</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #0f172a;">${totalDevices}</span>
                <span style="font-size: 11px; font-weight: 600; color: #16a34a;">100% Licensed</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Across ${state.probes.length} Enterprise Probes</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Enterprise Probes</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #16a34a;">4 / 4</span>
                <span style="font-size: 11px; font-weight: 600; color: #16a34a;">● Synchronized</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Avg Central RTT: 25.7 ms</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Active Alarms</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: ${filteredAlarms.length > 0 ? '#dc2626' : '#16a34a'};">${filteredAlarms.length}</span>
                <span style="font-size: 11px; font-weight: 600; color: #dc2626;">${filteredAlarms.filter(a => a.severity === 'Critical').length} Critical</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">MTTR: 18m 42s</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Global SLA Availability</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #16a34a;">99.98%</span>
                <span style="font-size: 11px; font-weight: 600; color: #16a34a;">Tier 4 Target Met</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Downtime: 0h 08m past 30d</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Peak Bandwidth Ingress</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #0284c7;">3.84 Gbps</span>
                <span style="font-size: 11px; font-weight: 600; color: #0284c7;">NY-PA-FW-01</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Aggregate: 9.8 Gbps Fabric</div>
            </div>
          </div>

          <!-- 10 ENTERPRISE WIDGETS GRID -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; padding-bottom: 10px;">
            
            <!-- WIDGET 1: Enterprise Probes Health -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Enterprise Probes Status</span>
                  <span style="font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Central Architecture</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Enterprise Probes Status" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #f1f5f9; text-align: left; color: #64748b; font-weight: 600;">
                      <th style="padding: 6px 8px;">Probe Name</th>
                      <th style="padding: 6px 8px;">IP Address</th>
                      <th style="padding: 6px 8px;">Devices</th>
                      <th style="padding: 6px 8px;">Ping Latency</th>
                      <th style="padding: 6px 8px;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.probes.map(pr => `
                      <tr style="border-bottom: 1px solid #f8fafc;">
                        <td style="padding: 8px; font-weight: 600; color: #0070e0; cursor: pointer;" onclick="showProbeDetailsModal(${pr.id})">
                          <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #16a34a; margin-right: 6px;"></span>
                          ${pr.name}
                        </td>
                        <td style="padding: 8px; color: #475569; font-family: monospace;">${pr.ip}</td>
                        <td style="padding: 8px; color: #334155; font-weight: 600;">${pr.devicesCount || pr.devices || 4}</td>
                        <td style="padding: 8px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 50px; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                              <div style="width: ${Math.min(100, (pr.latency / 60) * 100)}%; height: 100%; background: ${pr.latency > 40 ? '#ea580c' : '#16a34a'};"></div>
                            </div>
                            <span style="font-size: 11px; color: #64748b;">${pr.latency}ms</span>
                          </div>
                        </td>
                        <td style="padding: 8px;">
                          <span style="font-size: 11px; font-weight: 600; color: #166534; background: #dcfce7; padding: 2px 6px; border-radius: 3px;">Online</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- WIDGET 2: Infrastructure Health Summary -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Infrastructure Health by Category</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Infrastructure Health by Category" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Routers')} Routers (4)</span>
                      <span style="color: #16a34a; font-weight: 600;">100% Healthy</span>
                    </div>
                    <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                      <div style="width: 100%; background: #16a34a;" title="4 Clear"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Switches')} Switches (4)</span>
                      <span style="color: #dc2626; font-weight: 600;">1 Critical, 1 Attention, 2 Clear</span>
                    </div>
                    <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                      <div style="width: 25%; background: #dc2626;" title="1 Critical"></div>
                      <div style="width: 25%; background: #ca8a04;" title="1 Attention"></div>
                      <div style="width: 50%; background: #16a34a;" title="2 Clear"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Servers')} Servers (5)</span>
                      <span style="color: #ea580c; font-weight: 600;">1 Trouble, 4 Clear</span>
                    </div>
                    <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                      <div style="width: 20%; background: #ea580c;" title="1 Trouble"></div>
                      <div style="width: 80%; background: #16a34a;" title="4 Clear"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Firewalls')} Firewalls (2)</span>
                      <span style="color: #ca8a04; font-weight: 600;">1 Attention, 1 Clear</span>
                    </div>
                    <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                      <div style="width: 50%; background: #ca8a04;" title="1 Attention"></div>
                      <div style="width: 50%; background: #16a34a;" title="1 Clear"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Storage')} Storage & Power (1)</span>
                      <span style="color: #ca8a04; font-weight: 600;">1 Attention</span>
                    </div>
                    <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                      <div style="width: 100%; background: #ca8a04;" title="1 Attention"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 3: Alarms by Severity -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Alarms by Severity</span>
                  <span style="font-size: 11px; color: #64748b;">(Click to Filter)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Alarms by Severity" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 16px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                <div class="opm-dash-alarm-card" data-severity="Critical" style="cursor: pointer; text-align: center; padding: 12px 8px; border-radius: 6px; background: #fef2f2; border: 1px solid #fee2e2; transition: all 0.2s;">
                  <div style="font-size: 22px; font-weight: 800; color: #dc2626;">${filteredAlarms.filter(a => a.severity === 'Critical').length}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #991b1b; margin-top: 4px;">Critical</div>
                </div>
                <div class="opm-dash-alarm-card" data-severity="Trouble" style="cursor: pointer; text-align: center; padding: 12px 8px; border-radius: 6px; background: #fff7ed; border: 1px solid #ffedd5; transition: all 0.2s;">
                  <div style="font-size: 22px; font-weight: 800; color: #ea580c;">${filteredAlarms.filter(a => a.severity === 'Trouble').length}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #9a3412; margin-top: 4px;">Trouble</div>
                </div>
                <div class="opm-dash-alarm-card" data-severity="Attention" style="cursor: pointer; text-align: center; padding: 12px 8px; border-radius: 6px; background: #fefce8; border: 1px solid #fef9c3; transition: all 0.2s;">
                  <div style="font-size: 22px; font-weight: 800; color: #ca8a04;">${filteredAlarms.filter(a => a.severity === 'Attention').length}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #854d0e; margin-top: 4px;">Attention</div>
                </div>
                <div class="opm-dash-alarm-card" data-severity="Service Down" style="cursor: pointer; text-align: center; padding: 12px 8px; border-radius: 6px; background: #fdf2f8; border: 1px solid #fce7f3; transition: all 0.2s;">
                  <div style="font-size: 22px; font-weight: 800; color: #9d174d;">0</div>
                  <div style="font-size: 11px; font-weight: 700; color: #831843; margin-top: 4px;">Svc Down</div>
                </div>
                <div class="opm-dash-alarm-card" data-severity="Clear" style="cursor: pointer; text-align: center; padding: 12px 8px; border-radius: 6px; background: #f0fdf4; border: 1px solid #dcfce7; transition: all 0.2s;">
                  <div style="font-size: 22px; font-weight: 800; color: #16a34a;">0</div>
                  <div style="font-size: 11px; font-weight: 700; color: #166534; margin-top: 4px;">Clear</div>
                </div>
              </div>
            </div>

            <!-- WIDGET 4: Top 5 CPU Utilization -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top 5 CPU Utilization</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top 5 CPU Utilization" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${[...filteredDevices].sort((a,b) => b.cpu - a.cpu).slice(0, 5).map(d => {
                    const barColor = d.cpu >= 90 ? '#dc2626' : (d.cpu >= 75 ? '#ea580c' : '#0284c7');
                    return `
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                          <span class="opm-device-link" data-id="${d.id}" style="font-weight: 600; color: #0070e0; cursor: pointer;">${d.name} <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">(${d.probe})</span></span>
                          <span style="font-weight: 700; color: ${barColor};">${d.cpu}%</span>
                        </div>
                        <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${d.cpu}%; height: 100%; background: ${barColor};"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- WIDGET 5: Top 5 Memory Utilization -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top 5 Memory Utilization</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top 5 Memory Utilization" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${[...filteredDevices].sort((a,b) => b.memory - a.memory).slice(0, 5).map(d => {
                    const barColor = d.memory >= 90 ? '#dc2626' : (d.memory >= 75 ? '#ea580c' : '#0284c7');
                    return `
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                          <span class="opm-device-link" data-id="${d.id}" style="font-weight: 600; color: #0070e0; cursor: pointer;">${d.name} <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">(${d.probe})</span></span>
                          <span style="font-weight: 700; color: ${barColor};">${d.memory}%</span>
                        </div>
                        <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${d.memory}%; height: 100%; background: ${barColor};"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- WIDGET 6: Top Interfaces by Traffic -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top Interfaces by Bandwidth Traffic</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top Interfaces by Bandwidth Traffic" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 12px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #f1f5f9; text-align: left; color: #64748b; font-weight: 600;">
                      <th style="padding: 6px 4px;">Interface</th>
                      <th style="padding: 6px 4px;">Device</th>
                      <th style="padding: 6px 4px;">In (Mbps)</th>
                      <th style="padding: 6px 4px;">Out (Mbps)</th>
                      <th style="padding: 6px 4px;">Oper</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.topInterfaces.slice(0, 5).map(iface => `
                      <tr style="border-bottom: 1px solid #f8fafc;">
                        <td style="padding: 6px 4px; font-weight: 600; color: #0f172a;">${iface.name}</td>
                        <td style="padding: 6px 4px; color: #0070e0;">${iface.device}</td>
                        <td style="padding: 6px 4px; font-family: monospace; font-weight: 600; color: #0284c7;">${iface.inTraffic}</td>
                        <td style="padding: 6px 4px; font-family: monospace; font-weight: 600; color: #64748b;">${iface.outTraffic}</td>
                        <td style="padding: 6px 4px;">
                          <span style="font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 2px; ${iface.status === 'UP' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'}">${iface.status}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- WIDGET 7: Disk Partition Utilization -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Storage & Partition Heatmap</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Storage & Partition Heatmap" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${state.diskVolumes.map(vol => {
                    const barColor = vol.percent >= 90 ? '#dc2626' : (vol.percent >= 75 ? '#ea580c' : '#16a34a');
                    return `
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                          <span style="font-weight: 600; color: #0f172a;">${vol.partition} <span style="font-size: 11px; color: #64748b; font-weight: 400;">(${vol.device})</span></span>
                          <span style="font-weight: 700; color: ${barColor};">${vol.used} / ${vol.total} (${vol.percent}%)</span>
                        </div>
                        <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${vol.percent}%; height: 100%; background: ${barColor};"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- WIDGET 8: Recent NCM Configuration Drift -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">NCM Configuration Audit & Drift</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="NCM Configuration Audit & Drift" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                ${state.configDriftFixed ? `
                  <div style="padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <span style="color: #16a34a; font-size: 18px;">✓</span>
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #166534;">Configurations in Sync</div>
                      <div style="font-size: 11px; color: #15803d;">Startup and Running configs for DXB-CORE-SW-01 are identical.</div>
                    </div>
                  </div>
                ` : `
                  <div style="padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="color: #d97706; font-size: 18px;">⚠</span>
                      <div>
                        <div style="font-size: 12px; font-weight: 700; color: #92400e;">Config Drift Detected: DXB-CORE-SW-01</div>
                        <div style="font-size: 11px; color: #b45309;">Running configuration has 18 uncommitted changes vs NVRAM startup.</div>
                      </div>
                    </div>
                    <button id="opm-dash-ncm-diff-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      Review Diff
                    </button>
                  </div>
                `}
                <div style="font-size: 11px; color: #64748b; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
                    <span>Last Automated Backup Run</span>
                    <span style="font-weight: 600; color: #334155;">Today at 04:00 AM UTC (16/16 Succeeded)</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>PCI-DSS 4.0 Compliance Rate</span>
                    <span style="font-weight: 600; color: #16a34a;">96.4% Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 9: Zia AI Operational Recommendations -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 15px;">✨</span>
                  <span style="font-size: 13px; font-weight: 700; color: #4338ca;">Zia AI Operational Insights</span>
                  <span style="font-size: 10px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 3px; font-weight: 700;">ML Correlated</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Zia AI Operational Insights" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
                <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 6px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #5b21b6;">High Impact Risk on DXB-CORE-SW-01</span>
                    <span style="font-size: 10px; font-weight: 700; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 2px;">98.2% Probability</span>
                  </div>
                  <div style="font-size: 11px; color: #4c1d95; line-height: 1.4;">
                    Possible transit bottleneck due to recurring packet loss on GigabitEthernet0/1. BGP flapping observed from upstream ISP gateway.
                  </div>
                  <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; font-weight: 600; color: #6d28d9;">Zia Recommendation: Apply QOS rate-limiting policy</span>
                    <button id="opm-dash-zia-action-btn" style="background: #4338ca; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      Execute Fix
                    </button>
                  </div>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-size: 11px; font-weight: 700; color: #166534;">Enterprise Anomaly Detection Engine</div>
                    <div style="font-size: 11px; color: #15803d;">47 / 48 monitors operating strictly within dynamic seasonality thresholds.</div>
                  </div>
                  <span style="font-size: 11px; font-weight: 700; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 10px;">NORMAL</span>
                </div>
              </div>
            </div>

            <!-- WIDGET 10: Devices Across Enterprise Remote Probes -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Devices Across Enterprise Probes</span>
                  <span style="font-size: 10px; background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Managed Grid</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">⟳</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Devices Across Enterprise Probes" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                </div>
              </div>
              <div style="padding: 14px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #f1f5f9; text-align: left; color: #64748b; font-weight: 600;">
                      <th style="padding: 6px 8px;">Probe Name</th>
                      <th style="padding: 6px 8px;">Managed</th>
                      <th style="padding: 6px 8px;">Unmanaged</th>
                      <th style="padding: 6px 8px;">Interfaces</th>
                      <th style="padding: 6px 8px;">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.probes.map(pr => `
                      <tr style="border-bottom: 1px solid #f8fafc;">
                        <td style="padding: 7px 8px; font-weight: 600; color: #0070e0; cursor: pointer;" onclick="showProbeDetailsModal(${pr.id})">${pr.name}</td>
                        <td style="padding: 7px 8px; font-weight: 700; color: #0f172a;">${pr.devicesCount || pr.devices || 4}</td>
                        <td style="padding: 7px 8px; color: #64748b;">0</td>
                        <td style="padding: 7px 8px; font-family: monospace; color: #334155;">${(pr.devicesCount || pr.devices || 4) * 3}</td>
                        <td style="padding: 7px 8px;">
                          <span style="font-size: 10px; font-weight: 700; color: #166534; background: #dcfce7; padding: 1px 6px; border-radius: 2px;">SYNC OK</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- DYNAMIC USER WIDGETS -->
            ${state.addedWidgets.map((w, idx) => `
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e293b;">${w.title}</span>
                    <span style="font-size: 11px; background: #f1f5f9; color: #475569; padding: 1px 6px; border-radius: 3px;">Custom Widget</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="opm-remove-widget-btn" data-index="${idx}" style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 14px;">✕</button>
                  </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                  <div style="font-size: 28px; font-weight: 800; color: #0070e0; margin-bottom: 6px;">${w.metric || 'Active'}</div>
                  <div>${w.description || 'Real-time telemetry metric synchronized across all active Probes.'}</div>
                </div>
              </div>
            `).join('')}

          </div>
        ` : activeSub === 'summary' ? `
          <!-- Enterprise Rollup Summary Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Routers & Switches</div>
                <div style="font-size: 24px; font-weight: 800; color: #0070e0; margin: 4px 0;">8 Devices</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Core Fabric & Edge Gateways</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Servers & Compute</div>
                <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin: 4px 0;">5 Servers</div>
                <div style="font-size: 11px; color: #64748b;">Database, Mail, Web, Cache</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Next-Gen Firewalls</div>
                <div style="font-size: 24px; font-weight: 800; color: #ea580c; margin: 4px 0;">2 Firewalls</div>
                <div style="font-size: 11px; color: #ea580c; font-weight: 600;">Palo Alto & Fortinet NGFW</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Storage & Power</div>
                <div style="font-size: 24px; font-weight: 800; color: #6366f1; margin: 4px 0;">1 SAN Array</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">NetApp AFF A400 NVMe</div>
              </div>
            </div>

            <!-- Probe Matrix -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 14px; font-weight: 800; color: #0f172a;">
                Enterprise Probe Health & Telemetry Synchronization
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">Probe Name</th>
                    <th style="padding: 10px 14px;">IP Address</th>
                    <th style="padding: 10px 14px;">Location / Region</th>
                    <th style="padding: 10px 14px;">Assigned Devices</th>
                    <th style="padding: 10px 14px;">Active Alarms</th>
                    <th style="padding: 10px 14px;">RTT Latency</th>
                    <th style="padding: 10px 14px; text-align: right;">Central Sync</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.probes.map(pr => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 14px; font-weight: 700; color: #0070e0; cursor: pointer;" onclick="showProbeDetailsModal(${pr.id})">${pr.name}</td>
                      <td style="padding: 10px 14px; font-family: monospace;">${pr.ip}</td>
                      <td style="padding: 10px 14px; color: #64748b;">${pr.location}</td>
                      <td style="padding: 10px 14px; font-weight: 700;">${pr.devicesCount || pr.devices || 4}</td>
                      <td style="padding: 10px 14px;"><span style="font-weight: 700; color: ${(pr.alarmsCount || pr.alarms || 0) > 0 ? '#dc2626' : '#16a34a'};">${pr.alarmsCount || pr.alarms || 0}</span></td>
                      <td style="padding: 10px 14px; font-family: monospace; color: #0284c7; font-weight: 600;">${pr.latency} ms</td>
                      <td style="padding: 10px 14px; text-align: right;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 8px; border-radius: 3px; font-size: 10px;">CONNECTED</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : activeSub === 'servers' ? `
          <!-- Servers Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              ${state.devices.filter(d => d.category === 'Servers').map(srv => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                      <div style="font-weight: 700; font-size: 13px; color: #0070e0; cursor: pointer;" onclick="showDeviceSnapshotModal(${srv.id})">${srv.name}</div>
                      <div style="font-size: 11px; color: #64748b; font-family: monospace;">${srv.ip} • ${srv.probe}</div>
                    </div>
                    ${getStatusBadge(srv.status)}
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span>CPU Utilization</span>
                        <strong style="color: ${srv.cpu > 80 ? '#dc2626' : '#16a34a'};">${srv.cpu}%</strong>
                      </div>
                      <div style="height: 5px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${srv.cpu}%; height: 100%; background: ${srv.cpu > 80 ? '#dc2626' : '#16a34a'};"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span>Memory Utilization</span>
                        <strong style="color: ${srv.memory > 80 ? '#ea580c' : '#0284c7'};">${srv.memory}%</strong>
                      </div>
                      <div style="height: 5px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${srv.memory}%; height: 100%; background: ${srv.memory > 80 ? '#ea580c' : '#0284c7'};"></div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Server Process Monitors Table -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a;">
                Active Server Daemon & Process Telemetry (HOST-RESOURCES-MIB hrSWRunTable)
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 8px 12px;">PID</th>
                    <th style="padding: 8px 12px;">Process Name</th>
                    <th style="padding: 8px 12px;">Target Server</th>
                    <th style="padding: 8px 12px;">CPU %</th>
                    <th style="padding: 8px 12px;">Memory Allocation</th>
                    <th style="padding: 8px 12px;">Instance Count</th>
                    <th style="padding: 8px 12px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">1420</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">postgres: main server process</td>
                    <td style="padding: 8px 12px; color: #0070e0;">NY-DB-PROD-SQL</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #ea580c;">48.2%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">3.8 GB (DRAM)</td>
                    <td style="padding: 8px 12px;">12 workers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">1804</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">mysqld daemon</td>
                    <td style="padding: 8px 12px; color: #0070e0;">LON-MAIL-EXCH-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">22.4%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">2.1 GB (DRAM)</td>
                    <td style="padding: 8px 12px;">64 threads</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">2102</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">nginx: worker process</td>
                    <td style="padding: 8px 12px; color: #0070e0;">DXB-WEB-FRONTEND-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0284c7;">14.1%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">410 MB</td>
                    <td style="padding: 8px 12px;">8 workers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">844</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">containerd runtime daemon</td>
                    <td style="padding: 8px 12px; color: #0070e0;">SG-APP-CLUSTER-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">8.6%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">890 MB</td>
                    <td style="padding: 8px 12px;">24 containers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ` : activeSub === 'virtualization' ? `
          <!-- Virtualization Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">VMware vSphere ESXi 8.0</div>
                <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 4px 0;">12 Guest VMs</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">London Branch DC • Healthy</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Proxmox VE 8.1 HA Cluster</div>
                <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 4px 0;">24 LXC Containers</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">New York DC • 3 Nodes Active</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Microsoft Hyper-V 2022</div>
                <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 4px 0;">16 Guest VMs</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Dubai DC Core • Cluster OK</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Nutanix AHV Enterprise</div>
                <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 4px 0;">32 Microservices</div>
                <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Singapore VPC • Tier 1</div>
              </div>
            </div>

            <!-- Overcommit & Zombie VM reclamation -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Host CPU & Memory Over-Commitment</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span>vCPU Allocation Ratio (Target: &lt; 3:1)</span>
                      <strong>2.1 : 1 (Optimal)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 70%; height: 100%; background: #16a34a;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span>vRAM Memory Ballooning & Over-commit</span>
                      <strong>68.4% (No Swapping)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 68.4%; height: 100%; background: #0284c7;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Zombie & Idle VM Reclamation Advisor</div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px; margin-bottom: 10px;">
                  <div style="font-size: 12px; font-weight: 700; color: #166534;">Reclaimable Compute Capacity: 180 GB RAM, 12 vCPUs</div>
                  <div style="font-size: 11px; color: #15803d; margin-top: 2px;">2 inactive staging VMs powered on with 0% network I/O for 21 days.</div>
                </div>
                <button style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Reclaim Idle Resources
                </button>
              </div>
            </div>
          </div>
        ` : activeSub === 'storage' ? `
          <!-- Storage Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 16px; font-weight: 800; color: #0f172a;">NetApp AFF A400 NVMe All-Flash SAN Storage</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Active-Active Dual Storage Controller • 24x NVMe SSD Bays (100% Healthy)</div>
                </div>
                <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px;">OPERATIONAL</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 11px; color: #64748b;">Raw Storage Capacity</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0;">48.0 TB</div>
                  <div style="font-size: 10px; color: #16a34a; font-weight: 600;">RAID-DP Dual Parity</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 11px; color: #64748b;">Allocated Volume Pool</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin: 4px 0;">36.4 TB</div>
                  <div style="font-size: 10px; color: #64748b;">75.8% Utilization</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 11px; color: #64748b;">Aggregate SAN IOPS</div>
                  <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin: 4px 0;">42,500</div>
                  <div style="font-size: 10px; color: #16a34a; font-weight: 600;">Read 65% / Write 35%</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 11px; color: #64748b;">Controller Latency</div>
                  <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin: 4px 0;">0.8 ms</div>
                  <div style="font-size: 10px; color: #16a34a; font-weight: 600;">Sub-millisecond NVMe</div>
                </div>
              </div>
            </div>

            <!-- Volume Allocations & Capacity Runout -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a;">
                Storage Volumes & Forecasted Runout Dates
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 8px 12px;">Volume Name</th>
                    <th style="padding: 8px 12px;">Mounted Host / Target</th>
                    <th style="padding: 8px 12px;">Used / Total</th>
                    <th style="padding: 8px 12px;">Utilization</th>
                    <th style="padding: 8px 12px;">Growth Rate</th>
                    <th style="padding: 8px 12px;">Runout Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.diskVolumes.map(v => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">${v.partition}</td>
                      <td style="padding: 10px 12px; color: #0070e0;">${v.device}</td>
                      <td style="padding: 10px 12px; font-family: monospace;">${v.used} / ${v.total}</td>
                      <td style="padding: 10px 12px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <div style="width: 60px; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${v.percent}%; height: 100%; background: ${v.percent > 90 ? '#dc2626' : (v.percent > 75 ? '#ea580c' : '#16a34a')};"></div>
                          </div>
                          <strong>${v.percent}%</strong>
                        </div>
                      </td>
                      <td style="padding: 10px 12px; color: #64748b;">+1.2 GB / day</td>
                      <td style="padding: 10px 12px; font-weight: 600; color: ${v.percent > 90 ? '#dc2626' : '#166534'};">${v.percent > 90 ? '42 Days Remaining' : '480+ Days Remaining'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : activeSub === 'network' ? `
          <!-- Network Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              
              <!-- NFA Top Applications -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">NetFlow (NFA) Top Applications by Bandwidth</div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                      <span style="font-weight: 600;">HTTPS Web Services</span>
                      <strong style="color: #0070e0;">1.84 Gbps (47.9%)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 47.9%; height: 100%; background: #0070e0;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                      <span style="font-weight: 600;">BGP & Core Transit</span>
                      <strong style="color: #10b981;">980 Mbps (25.5%)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 25.5%; height: 100%; background: #10b981;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                      <span style="font-weight: 600;">Database Replication (PostgreSQL/MySQL)</span>
                      <strong style="color: #6366f1;">420 Mbps (11.0%)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 11%; height: 100%; background: #6366f1;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                      <span style="font-weight: 600;">SSH / Secure Shell</span>
                      <strong style="color: #f59e0b;">420 Mbps (10.9%)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 10.9%; height: 100%; background: #f59e0b;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                      <span style="font-weight: 600;">DNS Queries (UDP 53)</span>
                      <strong style="color: #8b5cf6;">180 Mbps (4.7%)</strong>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: 4.7%; height: 100%; background: #8b5cf6;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cisco IP SLA & WAN RTT VoIP Metrics -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">WAN RTT IP SLA & Quality of Service (QoS)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                  <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">VoIP MOS Score</div>
                    <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin: 4px 0;">4.38 / 5.0</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 600;">High Fidelity Voice</div>
                  </div>
                  <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">WAN Path Jitter</div>
                    <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin: 4px 0;">1.42 ms</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 600;">Stable Buffer</div>
                  </div>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: #166534;">Cisco CBQoS Priority Queuing Active</div>
                  <div style="font-size: 11px; color: #15803d; margin-top: 2px;">Voice/Video class-map 0 packet drops across 48 monitored interfaces.</div>
                </div>
              </div>

            </div>
          </div>
        ` : `
          <!-- Fullscreen NOC Wallboard View (noc) -->
          <div style="background: #0f172a; border-radius: 8px; padding: 24px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #16a34a;"></span>
                <span style="font-size: 18px; font-weight: 800; color: #38bdf8;">OPMANAGER CENTRAL OPERATIONS WALLBOARD (NOC)</span>
              </div>
              <a href="/noc" target="_blank" style="background: #0070e0; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700;">Open Standalone NOC Window ↗</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
              <div style="background: #1e293b; padding: 16px; border-radius: 6px; border: 1px solid #334155;">
                <div style="font-size: 11px; color: #94a3b8;">NEW YORK PROBE</div>
                <div style="font-size: 24px; font-weight: 800; color: #34d399; margin: 6px 0;">100% HEALTHY</div>
                <div style="font-size: 11px; color: #cbd5e1;">4 Devices • Latency 12ms</div>
              </div>
              <div style="background: #1e293b; padding: 16px; border-radius: 6px; border: 1px solid #334155;">
                <div style="font-size: 11px; color: #94a3b8;">LONDON PROBE</div>
                <div style="font-size: 24px; font-weight: 800; color: #34d399; margin: 6px 0;">100% HEALTHY</div>
                <div style="font-size: 11px; color: #cbd5e1;">4 Devices • Latency 28ms</div>
              </div>
              <div style="background: #1e293b; padding: 16px; border-radius: 6px; border: 1px solid #334155;">
                <div style="font-size: 11px; color: #94a3b8;">SINGAPORE PROBE</div>
                <div style="font-size: 24px; font-weight: 800; color: #34d399; margin: 6px 0;">100% HEALTHY</div>
                <div style="font-size: 11px; color: #cbd5e1;">4 Devices • Latency 45ms</div>
              </div>
              <div style="background: #450a0a; padding: 16px; border-radius: 6px; border: 1px solid #dc2626;">
                <div style="font-size: 11px; color: #fca5a5;">DUBAI CORE PROBE</div>
                <div style="font-size: 24px; font-weight: 800; color: #f87171; margin: 6px 0;">1 CRITICAL ALARM</div>
                <div style="font-size: 11px; color: #fecaca;">DXB-CORE-SW-01 High Contention</div>
              </div>
            </div>
            <div style="background: #1e293b; border-radius: 6px; padding: 14px; font-size: 12px;">
              <div style="font-weight: 700; color: #38bdf8; margin-bottom: 8px;">LIVE INCOMING ALARMS TICKER</div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${state.alarms.slice(0, 4).map(a => `
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px;">
                    <span style="color: ${a.severity === 'Critical' ? '#f87171' : '#fcd34d'}; font-weight: 700;">[${a.severity.toUpperCase()}] ${a.device}</span>
                    <span style="color: #cbd5e1;">${a.message}</span>
                    <span style="color: #94a3b8; font-family: monospace;">${a.time}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `}

      </div>
    `;

    // Event listeners for Dashboard Subtabs
    container.querySelectorAll('.opm-dash-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        const sub = btn.getAttribute('data-sub');
        state.subTabs.dashboard = sub;
        renderDashboardView();
      };
    });

    // Add Widget Button
    const addWidgetBtn = container.querySelector('#opm-dash-add-widget-btn');
    if (addWidgetBtn) {
      addWidgetBtn.onclick = () => {
        showAddWidgetModal();
      };
    }

    // Refresh All Button
    const refreshAllBtn = container.querySelector('#opm-dash-refresh-all-btn');
    if (refreshAllBtn) {
      refreshAllBtn.onclick = () => {
        state.autoRefreshCountdown = 30;
        showToast('Refreshing all dashboard telemetry metrics...');
        renderDashboardView();
      };
    }

    // Alarm cards click-to-filter
    container.querySelectorAll('.opm-dash-alarm-card').forEach(card => {
      card.onclick = () => {
        const sev = card.getAttribute('data-severity');
        state.alarmsSeverityFilter = sev;
        window.location.hash = '#/alarms';
      };
    });

    // Device link clicks inside dashboard widgets
    container.querySelectorAll('.opm-device-link').forEach(link => {
      link.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(link.getAttribute('data-id'), 10);
        showDeviceSnapshotModal(id);
      };
    });

    // Review Diff button inside drift widget
    const reviewDiffBtn = container.querySelector('#opm-dash-ncm-diff-btn');
    if (reviewDiffBtn) {
      reviewDiffBtn.onclick = () => {
        window.location.hash = '#/configuration';
      };
    }

    // Zia execute fix button
    const ziaFixBtn = container.querySelector('#opm-dash-zia-action-btn');
    if (ziaFixBtn) {
      ziaFixBtn.onclick = () => {
        showToast('Zia AI applied rate-limiting policy map to DXB-CORE-SW-01.');
      };
    }

    // Remove custom widget buttons
    container.querySelectorAll('.opm-remove-widget-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        state.addedWidgets.splice(idx, 1);
        renderDashboardView();
        showToast('Widget removed from dashboard.');
      };
    });

    // Widget Maximize buttons
    container.querySelectorAll('.opm-widget-btn-max').forEach(btn => {
      btn.onclick = () => {
        const title = btn.getAttribute('data-title') || 'Widget Maximize View';
        showToast(`Maximizing ${title}...`);
      };
    });

    // Widget Refresh buttons
    container.querySelectorAll('.opm-widget-btn-refresh').forEach(btn => {
      btn.onclick = () => {
        showToast('Telemetry updated.');
      };
    });
  }

  // -------------------------------------------------------------
  // VIEW: INVENTORY (Devices, Interfaces, Probes, Virt, Storage)
  // -------------------------------------------------------------
  function renderInventoryView() {
    state.currentTab = 'inventory';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.inventory || 'devices';

    // Subtab definitions
    const subtabs = [
      { id: 'devices', name: `Devices (${state.devices.length})` },
      { id: 'interfaces', name: 'Interfaces (48)' },
      { id: 'probes', name: `Enterprise Probes (${state.probes.length})` },
      { id: 'virtualization', name: 'Virtualization (4)' },
      { id: 'storage', name: 'Storage (1)' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 2px solid #0070e0; color: #0070e0; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-inv-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    // Category chips
    const categories = ['ALL', 'ROUTERS', 'SWITCHES', 'SERVERS', 'FIREWALLS', 'WIRELESS', 'STORAGE'];
    let categoryChipsHtml = '';
    categories.forEach(cat => {
      const isSel = state.inventoryFilter.toUpperCase() === cat;
      const count = cat === 'ALL'
        ? state.devices.length
        : state.devices.filter(d => d.category.toUpperCase() === cat).length;
      categoryChipsHtml += `
        <button class="opm-inv-cat-chip" data-cat="${cat.toLowerCase()}" style="padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${isSel ? '#0070e0' : '#cbd5e1'}; background: ${isSel ? '#0070e0' : '#ffffff'}; color: ${isSel ? '#ffffff' : '#475569'}; transition: all 0.15s;">
          ${cat} (${count})
        </button>
      `;
    });

    // Filter devices based on category, probe, and search
    let list = state.devices;
    if (state.selectedProbe !== 'all') {
      list = list.filter(d => d.probeId == state.selectedProbe);
    }
    if (state.inventoryFilter !== 'all') {
      list = list.filter(d => d.category.toLowerCase() === state.inventoryFilter);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.probe.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button id="opm-inv-add-device-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Device
          </button>
          <button id="opm-inv-export-csv-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div style="padding: 16px 24px 30px 24px;">
        
        ${activeSub === 'devices' ? `
          <!-- Category Chips & Search Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${categoryChipsHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="position: relative; width: 280px;">
                <input id="opm-inv-search-input" type="text" placeholder="Search by name, IP, vendor, probe..." value="${state.searchQuery}" style="width: 100%; box-sizing: border-box; padding: 6px 12px 6px 30px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position: absolute; left: 10px; top: 9px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>
          </div>

          <!-- Sticky Bulk Actions Bar -->
          <div id="opm-bulk-bar" style="display: ${state.selectedDeviceCheckboxCount > 0 ? 'flex' : 'none'}; align-items: center; justify-content: space-between; background: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 6px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span style="background: #0070e0; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px;" id="opm-bulk-count">${state.selectedDeviceCheckboxCount}</span>
              Devices Selected across Probes
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="opm-bulk-action-btn" data-action="rediscover" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Rediscover</button>
              <button class="opm-bulk-action-btn" data-action="testcred" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Test Credentials</button>
              <button class="opm-bulk-action-btn" data-action="manage" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Manage / Unmanage</button>
              <button class="opm-bulk-action-btn" data-action="template" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Assign Template</button>
              <button class="opm-bulk-action-btn" data-action="delete" style="background: #dc2626; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Delete</button>
            </div>
          </div>

          <!-- Inventory Data Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 12px; width: 30px;"><input type="checkbox" id="opm-inv-select-all" style="cursor: pointer;"></th>
                  <th style="padding: 10px 12px; width: 95px;">Status</th>
                  <th style="padding: 10px 12px;">Device Name</th>
                  <th style="padding: 10px 12px;">IP Address</th>
                  <th style="padding: 10px 12px;">Category</th>
                  <th style="padding: 10px 12px;">Probe / Location</th>
                  <th style="padding: 10px 12px;">CPU %</th>
                  <th style="padding: 10px 12px;">Memory %</th>
                  <th style="padding: 10px 12px;">Response</th>
                  <th style="padding: 10px 12px;">Availability</th>
                  <th style="padding: 10px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${list.length === 0 ? `
                  <tr>
                    <td colspan="11" style="padding: 40px; text-align: center; color: #94a3b8;">
                      No devices found matching filter "${state.inventoryFilter}" and query "${state.searchQuery}".
                    </td>
                  </tr>
                ` : list.map(dev => `
                  <tr class="opm-inv-row" data-id="${dev.id}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s;">
                    <td style="padding: 10px 12px;" onclick="event.stopPropagation();">
                      <input type="checkbox" class="opm-inv-row-cb" data-id="${dev.id}" style="cursor: pointer;">
                    </td>
                    <td style="padding: 10px 12px;">${getStatusBadge(dev.status)}</td>
                    <td style="padding: 10px 12px;">
                      <div style="font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 6px;">
                        ${dev.name}
                        ${getVendorBadge(dev.vendor)}
                      </div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${dev.type}</div>
                    </td>
                    <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #334155;">${dev.ip}</td>
                    <td style="padding: 10px 12px;">
                      <span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600; color: #475569;">
                        ${getCategoryIcon(dev.category)}
                        ${dev.category}
                      </span>
                    </td>
                    <td style="padding: 10px 12px;">
                      <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #0284c7; background: #f0f9ff; padding: 2px 6px; border-radius: 3px; font-weight: 600;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                        ${dev.probe}
                      </span>
                    </td>
                    <td style="padding: 10px 12px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 45px; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${dev.cpu}%; height: 100%; background: ${dev.cpu >= 90 ? '#dc2626' : (dev.cpu >= 75 ? '#ea580c' : '#16a34a')};"></div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: #334155;">${dev.cpu}%</span>
                      </div>
                    </td>
                    <td style="padding: 10px 12px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 45px; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${dev.memory}%; height: 100%; background: ${dev.memory >= 90 ? '#dc2626' : (dev.memory >= 75 ? '#ea580c' : '#0284c7')};"></div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: #334155;">${dev.memory}%</span>
                      </div>
                    </td>
                    <td style="padding: 10px 12px; font-size: 11px; color: #64748b;">${dev.responseTime} ms</td>
                    <td style="padding: 10px 12px; font-weight: 600; font-size: 11px; color: #166534;">${dev.availability}</td>
                    <td style="padding: 10px 12px; text-align: right;" onclick="event.stopPropagation();">
                      <button class="opm-inv-snapshot-btn" data-id="${dev.id}" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #0070e0; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                        Inspect
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Pagination Footer -->
            <div style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #64748b;">
              <div>Showing 1-${list.length} of ${list.length} devices</div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span>Rows per page: <strong>25</strong></span>
                <div style="display: flex; gap: 4px;">
                  <button style="background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; cursor: pointer; color: #94a3b8;" disabled>⏮</button>
                  <button style="background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; cursor: pointer; color: #94a3b8;" disabled>◀</button>
                  <span style="padding: 3px 8px; font-weight: 600; color: #0f172a;">Page 1 of 1</span>
                  <button style="background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; cursor: pointer; color: #94a3b8;" disabled>▶</button>
                  <button style="background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; cursor: pointer; color: #94a3b8;" disabled>⏭</button>
                </div>
              </div>
            </div>
          </div>
        ` : activeSub === 'interfaces' ? `
          <!-- Interfaces Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Monitored Enterprise Interfaces (48 Active Ports)</span>
              <span style="font-size: 11px; color: #64748b;">Telemetry interval: 60 seconds</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 12px;">Interface Name</th>
                  <th style="padding: 10px 12px;">Host Device</th>
                  <th style="padding: 10px 12px;">Probe Location</th>
                  <th style="padding: 10px 12px;">Configured Speed</th>
                  <th style="padding: 10px 12px;">In Traffic</th>
                  <th style="padding: 10px 12px;">Out Traffic</th>
                  <th style="padding: 10px 12px;">Admin</th>
                  <th style="padding: 10px 12px;">Oper</th>
                  <th style="padding: 10px 12px;">Errors</th>
                </tr>
              </thead>
              <tbody>
                ${state.topInterfaces.map(it => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">${it.name}</td>
                    <td style="padding: 10px 12px; color: #0070e0; font-weight: 600;">${it.device}</td>
                    <td style="padding: 10px 12px; color: #64748b;">${it.probe}</td>
                    <td style="padding: 10px 12px; font-family: monospace;">${it.speed}</td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #0284c7; font-weight: 600;">${it.inTraffic} Mbps (${it.inPercent}%)</td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #64748b; font-weight: 600;">${it.outTraffic} Mbps (${it.outPercent}%)</td>
                    <td style="padding: 10px 12px;"><span style="font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 2px;">UP</span></td>
                    <td style="padding: 10px 12px;"><span style="font-size: 10px; font-weight: 700; ${it.status === 'UP' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'} padding: 2px 6px; border-radius: 2px;">${it.status}</span></td>
                    <td style="padding: 10px 12px; font-weight: 600; color: ${it.errors > 0 ? '#dc2626' : '#16a34a'};">${it.errors}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : activeSub === 'probes' ? `
          <!-- Probes Subtab -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
            ${state.probes.map(pr => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
                      ${pr.name}
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-family: monospace; margin-top: 2px;">IP: ${pr.ip} | Port: 8060</div>
                  </div>
                  <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px;">Connected</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; padding: 10px; border-radius: 4px; font-size: 12px; margin-bottom: 12px;">
                  <div>
                    <div style="color: #64748b; font-size: 11px;">Devices</div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${pr.devicesCount || pr.devices || 4}</div>
                  </div>
                  <div>
                    <div style="color: #64748b; font-size: 11px;">Alarms</div>
                    <div style="font-weight: 700; color: ${(pr.alarmsCount || pr.alarms || 0) > 0 ? '#dc2626' : '#16a34a'}; font-size: 14px;">${pr.alarmsCount || pr.alarms || 0}</div>
                  </div>
                  <div>
                    <div style="color: #64748b; font-size: 11px;">RTT Latency</div>
                    <div style="font-weight: 700; color: #0284c7; font-size: 14px;">${pr.latency} ms</div>
                  </div>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                  <button class="opm-open-probe-modal-btn" data-id="${pr.id}" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Probe Diagnostics ↗
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : activeSub === 'virtualization' ? `
          <!-- Virtualization Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Discovered Virtualization Clusters & Hypervisors</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc;">
                <div style="font-weight: 700; color: #0070e0;">VMware vCenter 8.0 - London DC</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Host: LON-MAIL-EXCH-01 (10.20.3.10)</div>
                <div style="font-size: 12px; color: #334155; margin-top: 8px;">1 ESXi Host | 12 Guest Virtual Machines | 99.7% Uptime</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc;">
                <div style="font-weight: 700; color: #0070e0;">Kubernetes v1.27 Cluster - Singapore VPC</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Master: SG-K8S-MSTR-01 (10.30.4.10)</div>
                <div style="font-size: 12px; color: #334155; margin-top: 8px;">3 Worker Nodes | 48 Container Pods | 100.0% Uptime</div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Storage Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Storage Arrays, Partitions & Power Infrastructure</div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${state.diskVolumes.map(vol => `
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-weight: 700; color: #0f172a;">${vol.partition}</div>
                    <div style="font-size: 11px; color: #64748b;">Target: ${vol.device}</div>
                  </div>
                  <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                      <span>Used: ${vol.used} of ${vol.total}</span>
                      <span style="font-weight: 700;">${vol.percent}%</span>
                    </div>
                    <div style="height: 6px; width: 100%; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${vol.percent}%; height: 100%; background: ${vol.percent > 90 ? '#dc2626' : '#16a34a'};"></div>
                    </div>
                  </div>
                  <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; ${vol.status === 'Clear' ? 'background: #dcfce7; color: #166534;' : 'background: #fff7ed; color: #ea580c;'}">${vol.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `}
      </div>
    `;

    // Event listeners for Inventory Subtabs
    container.querySelectorAll('.opm-inv-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.inventory = btn.getAttribute('data-sub');
        renderInventoryView();
      };
    });

    // Add Device button
    const addDevBtn = container.querySelector('#opm-inv-add-device-btn');
    if (addDevBtn) {
      addDevBtn.onclick = () => {
        showAddDeviceModal();
      };
    }

    // Export CSV button
    const exportCsvBtn = container.querySelector('#opm-inv-export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.onclick = () => {
        const header = 'Device Name,IP Address,Category,Vendor,Model Type,Probe Location,Status,CPU %,Memory %,Response Time (ms),Availability\\n';
        const rows = state.devices.map(d =>
          `"${d.name}","${d.ip}","${d.category}","${d.vendor}","${d.type}","${d.probe}","${d.status}",${d.cpu},${d.memory},${d.responseTime},"${d.availability}"`
        ).join('\\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpManager_Central_Inventory_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported OpManager Central Inventory CSV successfully.');
      };
    }

    // Category chips filter
    container.querySelectorAll('.opm-inv-cat-chip').forEach(chip => {
      chip.onclick = () => {
        state.inventoryFilter = chip.getAttribute('data-cat');
        renderInventoryView();
      };
    });

    // Search input (debounced)
    const searchInput = container.querySelector('#opm-inv-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderInventoryView();
        const reInput = document.getElementById('opm-inv-search-input');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      };
    }

    // Row click -> opens Device Snapshot Modal
    container.querySelectorAll('.opm-inv-row').forEach(row => {
      row.onclick = () => {
        const id = parseInt(row.getAttribute('data-id'), 10);
        showDeviceSnapshotModal(id);
      };
    });

    // Snapshot button click inside table
    container.querySelectorAll('.opm-inv-snapshot-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        showDeviceSnapshotModal(id);
      };
    });

    // Select all checkbox
    const selectAllCb = container.querySelector('#opm-inv-select-all');
    if (selectAllCb) {
      selectAllCb.onchange = (e) => {
        const checked = e.target.checked;
        container.querySelectorAll('.opm-inv-row-cb').forEach(cb => cb.checked = checked);
        state.selectedDeviceCheckboxCount = checked ? list.length : 0;
        const bulkBar = document.getElementById('opm-bulk-bar');
        const bulkCount = document.getElementById('opm-bulk-count');
        if (bulkBar && bulkCount) {
          bulkBar.style.display = checked ? 'flex' : 'none';
          bulkCount.innerText = state.selectedDeviceCheckboxCount;
        }
      };
    }

    // Row checkbox
    container.querySelectorAll('.opm-inv-row-cb').forEach(cb => {
      cb.onchange = () => {
        const checkedCount = container.querySelectorAll('.opm-inv-row-cb:checked').length;
        state.selectedDeviceCheckboxCount = checkedCount;
        const bulkBar = document.getElementById('opm-bulk-bar');
        const bulkCount = document.getElementById('opm-bulk-count');
        if (bulkBar && bulkCount) {
          bulkBar.style.display = checkedCount > 0 ? 'flex' : 'none';
          bulkCount.innerText = checkedCount;
        }
      };
    });

    // Bulk actions buttons
    container.querySelectorAll('.opm-bulk-action-btn').forEach(btn => {
      btn.onclick = () => {
        const act = btn.getAttribute('data-action');
        showToast(`Executed bulk action "${act}" across ${state.selectedDeviceCheckboxCount} devices.`);
      };
    });

    // Probe Diagnostics buttons inside Probes subtab
    container.querySelectorAll('.opm-open-probe-modal-btn').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        showProbeDetailsModal(id);
      };
    });
  }
'''

with open('/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js', 'w') as f:
    f.write(content)

print('Updated 03_views_dashboard_inventory.js successfully')
