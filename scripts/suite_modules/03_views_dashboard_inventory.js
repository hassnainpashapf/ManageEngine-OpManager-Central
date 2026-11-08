  // -------------------------------------------------------------
  // VIEW: DASHBOARD (Overview, Summary, Servers, Virt, Storage, Network, NOC)
  // -------------------------------------------------------------
  function renderDashboardView() {
    state.currentTab = 'dashboard';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.dashboard || 'overview';

    // Subtab definitions (matches ManageEngine OpManager Plus / Central ITOM bar)
    const subtabs = [
      { id: 'overview', name: 'Overview' },
      { id: 'summary', name: 'Summary' },
      { id: 'network', name: 'Network' },
      { id: 'servers', name: 'Servers' },
      { id: 'virtualization', name: 'Virtualization' },
      { id: 'storage', name: 'Storage' },
      { id: 'netflow', name: 'NetFlow' },
      { id: 'ncm', name: 'NCM' },
      { id: 'firewall', name: 'Firewall' },
      { id: 'oputils', name: 'OpUtils' },
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

    // Dynamic category counters
    const routerCount = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('router')).length;
    const switchCount = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('switch')).length;
    const serverCount = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('server')).length;
    const firewallCount = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('firewall')).length;
    const networkCount = routerCount + switchCount;
    const networkAlarms = filteredAlarms.filter(a => ['Switch','Router','Network'].includes(a.category)).length;

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-dash-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 0 0 24px; display: flex; align-items: center; justify-content: space-between; overflow-x: auto; height: 40px;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0; height: 100%;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="opm-dash-bgp-btn" title="BGP-4 Autonomous System Topology" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              📡 BGP-4
            </button>
            <button id="opm-dash-sdwan-btn" title="SD-WAN Fabric & BFD Tunnels" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              🚀 SD-WAN
            </button>
            <button id="opm-dash-dpi-btn" title="Deep Packet Inspection & Cisco NBAR2" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              📊 DPI
            </button>
            <button id="opm-dash-ndr-btn" title="Network Detection & Response (NDR Threat Forensics)" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              🛡️ NDR
            </button>
          </div>
          <span id="opm-refresh-countdown-span" style="font-size: 11px; color: #64748b; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 3px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #49bd80;"></span>
            Auto Refresh: ${state.autoRefreshCountdown}s
          </span>
          <button id="opm-dash-refresh-all-btn" title="Refresh Dashboard" style="background: none; border: none; color: #64748b; padding: 4px 8px; font-size: 15px; cursor: pointer;">
            ⟳
          </button>
          <span title="Favorite Dashboard View" style="color: #94a3b8; font-size: 16px; cursor: pointer; padding: 0 4px;">★</span>
          <button id="opm-dash-add-widget-btn" title="Add Widget / Customize Dashboard" style="background: #49bd80; color: #ffffff; border: none; width: 42px; height: 40px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; position: relative;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="13" y2="12"/><line x1="3" y1="18" x2="11" y2="18"/><circle cx="17" cy="16" r="4" fill="#ffffff" stroke="#49bd80" stroke-width="1.5"/><line x1="17" y1="14" x2="17" y2="18" stroke="#49bd80" stroke-width="2"/><line x1="15" y1="16" x2="19" y2="16" stroke="#49bd80" stroke-width="2"/></svg>
          </button>
        </div>
      </div>

      <!-- ManageEngine OpManager 12 Collapsible Dark Executive Integrated Top Band (Tour/IntegratedDashboard.jpg replica) -->
      ${state.topBandCollapsed ? `
        <div style="background: #1e242c; border-bottom: 1px solid #0f172a; padding: 3px 24px; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 10px;">
          <span>Integrated ITOM Executive Summary Band (Collapsed) • 16 Devices • 4 Enterprise Probes • 7 Alarms</span>
          <button id="opm-toggle-topband-btn" title="Expand Executive Summary Band" style="background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; color: #cbd5e1; font-size: 10px;">
            <img src="/apiclient/fluidicv2/img/TopBandExpand.svg" alt="Expand" style="height: 12px;"> Expand Band
          </button>
        </div>
      ` : `
        <div style="background: #232a34; border-bottom: 1px solid #14181f; padding: 8px 20px 6px 20px; position: relative; color: #e2e8f0; box-shadow: inset 0 -2px 6px rgba(0,0,0,0.25);">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; align-items: center;">
            <!-- 1. Overview -->
            <div class="opm-topband-card" data-sub="overview" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'overview' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'overview' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <span>Overview</span>
                <span style="font-size: 9px; color: #94a3b8;">${state.probes.length} Probes</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="28" height="28" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="5"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#49bd80" stroke-width="5" stroke-dasharray="70 88"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" stroke-width="5" stroke-dasharray="18 88" stroke-dashoffset="-70"/>
                </svg>
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">${totalDevices}</strong> <span style="color: #94a3b8;">Devices</span></div>
                  <div><strong style="color: #f87171; font-size: 11px;">${filteredAlarms.length}</strong> <span style="color: #94a3b8;">Alarms</span></div>
                </div>
              </div>
            </div>
            <!-- 2. Network -->
            <div class="opm-topband-card" data-sub="network" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'network' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'network' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">Network</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="28" height="28" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#49bd80" stroke-width="5" stroke-dasharray="75 88"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" stroke-width="5" stroke-dasharray="13 88" stroke-dashoffset="-75"/>
                </svg>
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">${networkCount}</strong> <span style="color: #94a3b8;">Routers/SW</span></div>
                  <div><strong style="color: #fbbf24; font-size: 11px;">${networkAlarms}</strong> <span style="color: #94a3b8;">Alarms</span></div>
                </div>
              </div>
            </div>
            <!-- 3. Servers -->
            <div class="opm-topband-card" data-sub="servers" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'servers' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'servers' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">Server &amp; APM</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="28" height="28" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" stroke-width="5" stroke-dasharray="72 88"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" stroke-width="5" stroke-dasharray="16 88" stroke-dashoffset="-72"/>
                </svg>
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">${serverCount}</strong> <span style="color: #94a3b8;">Servers</span></div>
                  <div><strong style="color: #38bdf8; font-size: 11px;">0</strong> <span style="color: #94a3b8;">APM Apps</span></div>
                </div>
              </div>
            </div>
            <!-- 4. Virtualization -->
            <div class="opm-topband-card" data-sub="virtualization" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'virtualization' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'virtualization' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">Virtualization</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="/apiclient/fluidicv2/img/vmware/vCenter.png" style="width: 24px; height: 24px; object-fit: contain;">
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">0</strong> <span style="color: #94a3b8;">Clusters</span></div>
                  <div><strong style="color: #49bd80; font-size: 11px;">0</strong> <span style="color: #94a3b8;">VMs/LXC</span></div>
                </div>
              </div>
            </div>
            <!-- 5. NetFlow -->
            <div class="opm-topband-card" data-sub="netflow" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'netflow' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'netflow' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">NetFlow (NFA)</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: flex-end; gap: 2px; height: 24px;">
                  <div style="width: 4px; height: 12px; background: #38bdf8;"></div>
                  <div style="width: 4px; height: 20px; background: #49bd80;"></div>
                  <div style="width: 4px; height: 16px; background: #38bdf8;"></div>
                  <div style="width: 4px; height: 24px; background: #f59e0b;"></div>
                </div>
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">0</strong> <span style="color: #94a3b8;">Flows</span></div>
                  <div><strong style="color: #38bdf8; font-size: 11px;">0.00</strong> <span style="color: #94a3b8;">Gbps</span></div>
                </div>
              </div>
            </div>
            <!-- 6. NCM -->
            <div class="opm-topband-card" data-sub="ncm" style="cursor: pointer; padding: 4px 10px; border-right: 1px solid #36404e; border-bottom: ${activeSub === 'ncm' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'ncm' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">NCM Config</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="/apiclient/fluidicv2/img/ncm/icon_csh_success.gif" style="width: 18px; height: 18px;">
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">0</strong> <span style="color: #94a3b8;">Changes</span></div>
                  <div><strong style="color: #f59e0b; font-size: 11px;">0</strong> <span style="color: #94a3b8;">Drift</span></div>
                </div>
              </div>
            </div>
            <!-- 7. Firewall -->
            <div class="opm-topband-card" data-sub="firewall" style="cursor: pointer; padding: 4px 10px; border-bottom: ${activeSub === 'firewall' ? '2px solid #49bd80' : '2px solid transparent'};">
              <div style="font-size: 11px; font-weight: 700; color: ${activeSub === 'firewall' ? '#49bd80' : '#cbd5e1'}; margin-bottom: 4px;">Firewall (FWA)</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <div style="font-size: 10px; line-height: 1.35;">
                  <div><strong style="color: #fff; font-size: 12px;">0</strong> <span style="color: #94a3b8;">Sites</span></div>
                  <div><strong style="color: #f87171; font-size: 11px;">0</strong> <span style="color: #94a3b8;">Attacks</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Official TopBandCollapse.svg handle at bottom-center -->
          <button id="opm-toggle-topband-btn" title="Collapse Executive Summary Band" style="position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); background: transparent; border: none; padding: 0; cursor: pointer; z-index: 10;">
            <img src="/apiclient/fluidicv2/img/TopBandCollapse.svg" alt="Collapse" style="height: 13px; display: block;">
          </button>
        </div>
      `}

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
                <span style="font-size: 24px; font-weight: 800; color: #16a34a;">${state.probes.length} / ${state.probes.length}</span>
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
                <span style="font-size: 24px; font-weight: 800; color: #0284c7;">0.00 Mbps</span>
                <span style="font-size: 11px; font-weight: 600; color: #64748b;">No active flow</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Real-Time Flow Ingress</div>
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
                        <td style="padding: 8px; color: #334155; font-weight: 600;">${typeof pr.devicesCount !== "undefined" ? pr.devicesCount : (pr.devices || 0)}</td>
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
                ${totalDevices === 0 ? `
                  <div style="padding: 40px 16px; text-align: center; color: #64748b;">
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No Monitored Devices</div>
                    <div style="font-size: 11px;">Install the OpManager agent on servers or run discovery to view categorized infrastructure health.</div>
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Routers')} Routers (${routerCount})</span>
                        <span style="color: #16a34a; font-weight: 600;">100% Healthy</span>
                      </div>
                      <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                        <div style="width: 100%; background: #16a34a;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Switches')} Switches (${switchCount})</span>
                        <span style="color: #16a34a; font-weight: 600;">100% Healthy</span>
                      </div>
                      <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                        <div style="width: 100%; background: #16a34a;"></div>
                      </div>
                    </div>
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 5px;">${getCategoryIcon('Servers')} Servers (${serverCount})</span>
                        <span style="color: #16a34a; font-weight: 600;">100% Healthy</span>
                      </div>
                      <div style="height: 8px; width: 100%; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
                        <div style="width: 100%; background: #16a34a;"></div>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <!-- WIDGET 3: Alarms by Severity -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #dcdcdc; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b; font-family: Lato, sans-serif;">Alarms by Severity</span>
                  <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Active Matrix</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">↻</button>
                  <button title="Configure" style="background: none; border: none; cursor: pointer; color: #64748b;">✎</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Alarms by Severity" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                  <button title="More" style="background: none; border: none; cursor: pointer; color: #64748b;">⋮</button>
                </div>
              </div>
              <div style="padding: 16px; display: flex; align-items: center; justify-content: space-around; gap: 16px;">
                <!-- Authentic Donut Chart -->
                ${createDonutChart([
                  { label: 'Critical', count: filteredAlarms.filter(a => a.severity === 'Critical').length, color: '#dc2626' },
                  { label: 'Trouble', count: filteredAlarms.filter(a => a.severity === 'Trouble').length, color: '#ea580c' },
                  { label: 'Attention', count: filteredAlarms.filter(a => a.severity === 'Attention').length, color: '#ca8a04' },
                  { label: 'Clear', count: filteredDevices.filter(d => d.status === 'Clear').length, color: '#16a34a' }
                ], filteredAlarms.length + filteredDevices.filter(d => d.status === 'Clear').length, 140)}

                <!-- Severity Distribution List -->
                <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                  <div class="opm-dash-alarm-card" data-severity="Critical" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-radius: 4px; background: #fef2f2; border: 1px solid #fee2e2;">
                    <span style="font-size: 12px; font-weight: 700; color: #991b1b; display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #dc2626;"></span>Critical</span>
                    <span style="font-size: 13px; font-weight: 800; color: #dc2626;">${filteredAlarms.filter(a => a.severity === 'Critical').length}</span>
                  </div>
                  <div class="opm-dash-alarm-card" data-severity="Trouble" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-radius: 4px; background: #fff7ed; border: 1px solid #ffedd5;">
                    <span style="font-size: 12px; font-weight: 700; color: #9a3412; display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c;"></span>Trouble</span>
                    <span style="font-size: 13px; font-weight: 800; color: #ea580c;">${filteredAlarms.filter(a => a.severity === 'Trouble').length}</span>
                  </div>
                  <div class="opm-dash-alarm-card" data-severity="Attention" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-radius: 4px; background: #fefce8; border: 1px solid #fef9c3;">
                    <span style="font-size: 12px; font-weight: 700; color: #854d0e; display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ca8a04;"></span>Attention</span>
                    <span style="font-size: 13px; font-weight: 800; color: #ca8a04;">${filteredAlarms.filter(a => a.severity === 'Attention').length}</span>
                  </div>
                  <div class="opm-dash-alarm-card" data-severity="Clear" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-radius: 4px; background: #f0fdf4; border: 1px solid #dcfce7;">
                    <span style="font-size: 12px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>Clear</span>
                    <span style="font-size: 13px; font-weight: 800; color: #16a34a;">${filteredDevices.filter(d => d.status === 'Clear').length}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 4: Top 5 CPU Utilization -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #dcdcdc; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="/images/businessView/peripherals/CPU.svg" style="width: 16px; height: 16px;" onerror="this.style.display='none'" />
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b; font-family: Lato, sans-serif;">Top CPU Utilization</span>
                  <span style="font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Dial View</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">↻</button>
                  <button title="Configure" style="background: none; border: none; cursor: pointer; color: #64748b;">✎</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top CPU Utilization" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                  <button title="More" style="background: none; border: none; cursor: pointer; color: #64748b;">⋮</button>
                </div>
              </div>
              <div style="padding: 12px 14px;">
                <!-- Radial Speedometer Dials Row -->
                <div style="display: flex; align-items: center; justify-content: space-around; gap: 4px; margin-bottom: 12px; overflow-x: auto;">
                  ${[...filteredDevices].sort((a,b) => b.cpu - a.cpu).slice(0, 3).map(d => 
                    createSpeedometerGauge(d.cpu, 'CPU Load', d.name, d.ip, 145)
                  ).join('')}
                </div>
                <!-- Device Details Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
                  <tbody>
                    ${[...filteredDevices].sort((a,b) => b.cpu - a.cpu).slice(0, 4).map(d => {
                      const barColor = d.cpu >= 85 ? '#dc2626' : (d.cpu >= 70 ? '#ea580c' : '#16a34a');
                      return `
                        <tr style="border-top: 1px solid #f1f5f9;">
                          <td style="padding: 5px 4px; font-weight: 700; color: #0070e0; cursor: pointer; display: flex; align-items: center; gap: 5px;" class="opm-device-link" data-id="${d.id}">${getDeviceTypeIcon(d.type, d.category, 14)}<span>${d.name}</span></td>
                          <td style="padding: 5px 4px; color: #64748b;">${d.probe}</td>
                          <td style="padding: 5px 4px; width: 45%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${d.cpu}%; height: 100%; background: ${barColor};"></div>
                              </div>
                              <span style="font-weight: 800; color: ${barColor}; min-width: 38px; text-align: right;">${d.cpu.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- WIDGET 5: Top 5 Memory Utilization -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #dcdcdc; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="/images/businessView/peripherals/Server.svg" style="width: 16px; height: 16px;" onerror="this.style.display='none'" />
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b; font-family: Lato, sans-serif;">Top Memory Utilization</span>
                  <span style="font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Dial View</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">↻</button>
                  <button title="Configure" style="background: none; border: none; cursor: pointer; color: #64748b;">✎</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top Memory Utilization" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                  <button title="More" style="background: none; border: none; cursor: pointer; color: #64748b;">⋮</button>
                </div>
              </div>
              <div style="padding: 12px 14px;">
                <!-- Radial Speedometer Dials Row -->
                <div style="display: flex; align-items: center; justify-content: space-around; gap: 4px; margin-bottom: 12px; overflow-x: auto;">
                  ${[...filteredDevices].sort((a,b) => b.memory - a.memory).slice(0, 3).map(d => 
                    createSpeedometerGauge(d.memory, 'RAM Load', d.name, d.ip, 145)
                  ).join('')}
                </div>
                <!-- Device Details Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
                  <tbody>
                    ${[...filteredDevices].sort((a,b) => b.memory - a.memory).slice(0, 4).map(d => {
                      const barColor = d.memory >= 85 ? '#dc2626' : (d.memory >= 70 ? '#ea580c' : '#16a34a');
                      return `
                        <tr style="border-top: 1px solid #f1f5f9;">
                          <td style="padding: 5px 4px; font-weight: 700; color: #0070e0; cursor: pointer; display: flex; align-items: center; gap: 5px;" class="opm-device-link" data-id="${d.id}">${getDeviceTypeIcon(d.type, d.category, 14)}<span>${d.name}</span></td>
                          <td style="padding: 5px 4px; color: #64748b;">${d.probe}</td>
                          <td style="padding: 5px 4px; width: 45%;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${d.memory}%; height: 100%; background: ${barColor};"></div>
                              </div>
                              <span style="font-weight: 800; color: ${barColor}; min-width: 38px; text-align: right;">${d.memory.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- WIDGET 6: Top Interfaces by Traffic -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #dcdcdc; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #ffffff 0%, #f7f7f8 100%);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="/images/businessView/peripherals/lan-connecter.svg" style="width: 16px; height: 16px;" onerror="this.style.display='none'" />
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b; font-family: Lato, sans-serif;">Top Interfaces by Bandwidth Traffic</span>
                  <span style="font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 1px 6px; border-radius: 3px; font-weight: 600;">Sparkline Telemetry</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
                  <button title="Refresh" class="opm-widget-btn-refresh" style="background: none; border: none; cursor: pointer; color: #64748b;">↻</button>
                  <button title="Configure" style="background: none; border: none; cursor: pointer; color: #64748b;">✎</button>
                  <button title="Maximize" class="opm-widget-btn-max" data-title="Top Interfaces by Bandwidth Traffic" style="background: none; border: none; cursor: pointer; color: #64748b;">⤢</button>
                  <button title="More" style="background: none; border: none; cursor: pointer; color: #64748b;">⋮</button>
                </div>
              </div>
              <div style="padding: 12px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #f1f5f9; text-align: left; color: #64748b; font-weight: 600;">
                      <th style="padding: 6px 4px;">Interface</th>
                      <th style="padding: 6px 4px;">Device</th>
                      <th style="padding: 6px 4px;">Trend (1h)</th>
                      <th style="padding: 6px 4px;">In (Mbps)</th>
                      <th style="padding: 6px 4px;">Out (Mbps)</th>
                      <th style="padding: 6px 4px;">Oper</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.topInterfaces.slice(0, 5).map((iface, idx) => {
                      const trends = [
                        [120, 150, 180, 240, 310, 380, 420],
                        [850, 890, 810, 780, 800, 840, 820],
                        [2100, 2250, 2300, 2400, 2380, 2450, 2400],
                        [1100, 1250, 1180, 1300, 1400, 1390, 1450],
                        [90, 110, 105, 120, 95, 100, 110]
                      ];
                      const spark = createSparkline(trends[idx % trends.length], 75, 22, '#0070e0');
                      return `
                        <tr style="border-bottom: 1px solid #f8fafc;">
                          <td style="padding: 6px 4px; font-weight: 700; color: #0f172a;">${iface.name}</td>
                          <td style="padding: 6px 4px; color: #0070e0; font-weight: 600;">${iface.device}</td>
                          <td style="padding: 6px 4px;">${spark}</td>
                          <td style="padding: 6px 4px; font-family: monospace; font-weight: 700; color: #0284c7;">${iface.inTraffic}</td>
                          <td style="padding: 6px 4px; font-family: monospace; font-weight: 700; color: #64748b;">${iface.outTraffic}</td>
                          <td style="padding: 6px 4px;">
                            <span style="font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 2px; ${iface.status === 'UP' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'}">${iface.status}</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
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
                        <td style="padding: 7px 8px; font-weight: 700; color: #0f172a;">${typeof pr.devicesCount !== "undefined" ? pr.devicesCount : (pr.devices || 0)}</td>
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

            <!-- WIDGET 11: Interface Link Status HeatMap (Modeled on netflow_addon_dashboard.png) -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">HeatMap - Interface Link Status (48 Ports)</span>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | Real-Time SNMP ifOperStatus &amp; NetFlow Stream</div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8;">
                  <button class="opm-widget-btn-refresh" title="Refresh" style="background:none;border:none;cursor:pointer;color:#64748b;padding:2px;">↻</button>
                  <button class="opm-widget-btn-max" data-title="Interface Link Status HeatMap" title="Maximize" style="background:none;border:none;cursor:pointer;color:#64748b;padding:2px;">⋮</button>
                </div>
              </div>
              <div style="padding: 12px 16px;">
                <div style="display: flex; gap: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px; font-size: 11px;">
                  <span style="color: #16a34a; font-weight: 700; border-bottom: 2px solid #16a34a; padding-bottom: 4px;">Link Up (45)</span>
                  <span style="color: #64748b;">Unknown (0)</span>
                  <span style="color: #dc2626; font-weight: 600;">Link Down (1)</span>
                  <span style="color: #0284c7; font-weight: 600;">Link Up &amp; NoFlows (2)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 18px;">
                  <div style="width: 115px; text-align: center; flex-shrink: 0;">
                    <svg width="105" height="64" viewBox="0 0 110 66">
                      <path d="M 12 56 A 42 42 0 0 1 98 56" fill="none" stroke="#e2e8f0" stroke-width="9" stroke-linecap="round"/>
                      <path d="M 12 56 A 42 42 0 0 1 93 38" fill="none" stroke="#49bd80" stroke-width="9" stroke-linecap="round"/>
                      <text x="55" y="50" text-anchor="middle" font-size="20" font-weight="800" fill="#1e293b">45</text>
                      <text x="55" y="63" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b">Interfaces UP</text>
                    </svg>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 5px; flex: 1;">
                    ${Array.from({ length: 48 }).map((_, idx) => {
                      const isCritical = idx === 14;
                      const isNoFlow = idx === 29 || idx === 41;
                      const bg = isCritical ? '#ef4444' : (isNoFlow ? '#38bdf8' : '#49bd80');
                      const tip = isCritical ? 'DXB-CORE-SW-01 :: TenGigE1/0/1 (96% Peak / Link Alert)' : (isNoFlow ? `Port #${idx + 1} (Link Up & NoFlows)` : `Port #${idx + 1} (Link Up - Normal)`);
                      return `<div title="${tip}" style="height: 16px; border-radius: 2px; background: ${bg}; cursor: pointer; box-shadow: inset 0 -1px 0 rgba(0,0,0,0.12);"></div>`;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 12: Cisco SD-WAN Overlay & NetFlow Export Summary -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Cisco SD-WAN Fabric &amp; NetFlow Exporter Summary</span>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | vManage API &amp; NetFlow v9/IPFIX Collectors</div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8;">
                  <button class="opm-widget-btn-refresh" title="Refresh" style="background:none;border:none;cursor:pointer;color:#64748b;padding:2px;">↻</button>
                  <button class="opm-widget-btn-max" data-title="SD-WAN & NetFlow Summary" title="Maximize" style="background:none;border:none;cursor:pointer;color:#64748b;padding:2px;">⋮</button>
                </div>
              </div>
              <div style="padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; flex: 1;">
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; text-align: center;">
                    <img src="/apiclient/fluidicv2/img/v-manage.svg" alt="vManage" style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a;">1 UP</div>
                    <div style="font-size: 9px; color: #64748b; font-weight: 700;">vManage</div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; text-align: center;">
                    <img src="/apiclient/fluidicv2/img/v-smart.svg" alt="vSmart" style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;">
                    <div style="font-size: 13px; font-weight: 800; color: #16a34a;">2 UP</div>
                    <div style="font-size: 9px; color: #64748b; font-weight: 700;">vSmart</div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; text-align: center;">
                    <img src="/apiclient/fluidicv2/img/v-bond.svg" alt="vBond" style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;">
                    <div style="font-size: 13px; font-weight: 800; color: #0284c7;">2 UP</div>
                    <div style="font-size: 9px; color: #64748b; font-weight: 700;">vBond</div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; text-align: center;">
                    <img src="/apiclient/fluidicv2/img/v-edge.svg" alt="vEdge" style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;">
                    <div style="font-size: 13px; font-weight: 800; color: #16a34a;">8 UP</div>
                    <div style="font-size: 9px; color: #64748b; font-weight: 700;">WAN vEdge</div>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-end; gap: 12px; padding-left: 12px; border-left: 1px solid #f1f5f9;">
                  ${[
                    { label: 'V5', count: 0, pct: 6, color: '#94a3b8' },
                    { label: 'V9', count: 10, pct: 85, color: '#49bd80' },
                    { label: 'NSEL', count: 4, pct: 48, color: '#38bdf8' },
                    { label: 'sFlow', count: 2, pct: 28, color: '#f59e0b' }
                  ].map(col => `
                    <div style="text-align: center;">
                      <div style="font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 3px;">${col.count}</div>
                      <div style="width: 8px; height: 42px; background: #e2e8f0; border-radius: 4px; margin: 0 auto; display: flex; align-items: flex-end; overflow: hidden;">
                        <div style="width: 100%; height: ${col.pct}%; background: ${col.color};"></div>
                      </div>
                      <div style="font-size: 9px; color: #64748b; font-weight: 700; margin-top: 3px;">${col.label}</div>
                    </div>
                  `).join('')}
                </div>
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
                      <td style="padding: 10px 14px; font-weight: 700;">${typeof pr.devicesCount !== "undefined" ? pr.devicesCount : (pr.devices || 0)}</td>
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

            <!-- Server Process Monitors Table + Official ManageEngine Applications Manager (APM) Logos -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/apiclient/fluidicv2/img/apm-logo.svg" alt="APM" style="height: 22px; object-fit: contain;">
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Active Server Daemon, Process &amp; APM Application Telemetry (HOST-RESOURCES-MIB hrSWRunTable)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/linux.svg" style="width: 18px; height: 18px;" title="Linux">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/windows.svg" style="width: 18px; height: 18px;" title="Windows Server">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/postgresql.svg" style="width: 18px; height: 18px;" title="PostgreSQL">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/mysql.svg" style="width: 18px; height: 18px;" title="MySQL">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/nginx.svg" style="width: 18px; height: 18px;" title="NGINX">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/docker.svg" style="width: 18px; height: 18px;" title="Docker">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/redis.svg" style="width: 18px; height: 18px;" title="Redis">
                  <img src="/apiclient/fluidicv2/img/apm-apps-logos/tomcat.svg" style="width: 18px; height: 18px;" title="Apache Tomcat">
                </div>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 8px 12px;">PID</th>
                    <th style="padding: 8px 12px;">Application / Process Name</th>
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
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/apm-apps-logos/postgresql.svg" style="width: 16px; height: 16px;"> postgres: main server process</td>
                    <td style="padding: 8px 12px; color: #0070e0;">NY-DB-PROD-SQL</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #ea580c;">48.2%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">3.8 GB (DRAM)</td>
                    <td style="padding: 8px 12px;">12 workers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">1804</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/apm-apps-logos/mysql.svg" style="width: 16px; height: 16px;"> mysqld daemon</td>
                    <td style="padding: 8px 12px; color: #0070e0;">LON-MAIL-EXCH-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">22.4%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">2.1 GB (DRAM)</td>
                    <td style="padding: 8px 12px;">64 threads</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">2102</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/apm-apps-logos/nginx.svg" style="width: 16px; height: 16px;"> nginx: worker process</td>
                    <td style="padding: 8px 12px; color: #0070e0;">DXB-WEB-FRONTEND-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0284c7;">14.1%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">410 MB</td>
                    <td style="padding: 8px 12px;">8 workers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">844</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/apm-apps-logos/docker.svg" style="width: 16px; height: 16px;"> containerd / docker runtime daemon</td>
                    <td style="padding: 8px 12px; color: #0070e0;">SG-APP-CLUSTER-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">8.6%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">890 MB</td>
                    <td style="padding: 8px 12px;">24 containers</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-family: monospace;">3190</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/apm-apps-logos/redis.svg" style="width: 16px; height: 16px;"> redis-server *:6379 [cluster]</td>
                    <td style="padding: 8px 12px; color: #0070e0;">SG-REDIS-CACHE-01</td>
                    <td style="padding: 8px 12px; font-weight: 700; color: #16a34a;">6.2%</td>
                    <td style="padding: 8px 12px; font-family: monospace;">1.4 GB (DRAM)</td>
                    <td style="padding: 8px 12px;">4 shards</td>
                    <td style="padding: 8px 12px;"><span style="color: #166534; font-weight: 700;">● RUNNING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ` : activeSub === 'virtualization' ? `
          <!-- Virtualization Subtab (With Official Shipped /apiclient/fluidicv2/img/vmware/* Icons) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <img src="/apiclient/fluidicv2/img/vmware/vCenter.png" alt="VMware vCenter" style="width: 38px; height: 38px; object-fit: contain;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">VMware vSphere ESXi 8.0</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 2px 0;">12 Guest VMs</div>
                  <div style="font-size: 11px; color: #16a34a; font-weight: 600;">London Branch DC • Healthy</div>
                </div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <img src="/apiclient/fluidicv2/img/vmware/Proxmox-Node.png" alt="Proxmox VE" style="width: 38px; height: 38px; object-fit: contain;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Proxmox VE 8.1 HA Cluster</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 2px 0;">24 LXC Containers</div>
                  <div style="font-size: 11px; color: #16a34a; font-weight: 600;">New York DC • 3 Nodes Active</div>
                </div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <img src="/apiclient/fluidicv2/img/vmware/HostSystem.png" alt="Hyper-V Host" style="width: 38px; height: 38px; object-fit: contain;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Microsoft Hyper-V 2022</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 2px 0;">16 Guest VMs</div>
                  <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Dubai DC Core • Cluster OK</div>
                </div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <img src="/apiclient/fluidicv2/img/vmware/PrismCentral.svg" alt="Nutanix Prism Central" style="width: 38px; height: 38px; object-fit: contain;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Nutanix AHV Prism Central</div>
                  <div style="font-size: 20px; font-weight: 800; color: #0070e0; margin: 2px 0;">32 Microservices</div>
                  <div style="font-size: 11px; color: #16a34a; font-weight: 600;">Singapore VPC • Tier 1</div>
                </div>
              </div>
            </div>

            <!-- Official VMware / Proxmox / Nutanix Virtual Entity Topology & Resource Metrics Table -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Virtualization Infrastructure Inventory (vCenter, ESXi, Proxmox VE &amp; Datastores)</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Polled via VMware vSphere SDK, Proxmox REST API &amp; Nutanix Prism v3 API</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 12px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                      <th style="padding: 8px 10px;">Virtual Entity</th>
                      <th style="padding: 8px 10px;">Type</th>
                      <th style="padding: 8px 10px;"><img src="/apiclient/fluidicv2/img/vmware/vmcpu.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;">vCPU</th>
                      <th style="padding: 8px 10px;"><img src="/apiclient/fluidicv2/img/vmware/vmmemory.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;">vRAM</th>
                      <th style="padding: 8px 10px;"><img src="/apiclient/fluidicv2/img/vmware/vmdisk.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;">Datastore I/O</th>
                      <th style="padding: 8px 10px;"><img src="/apiclient/fluidicv2/img/vmware/vmnetwork.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;">vSwitch Traffic</th>
                      <th style="padding: 8px 10px;">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/vmware/HostSystem.png" style="width: 18px; height: 18px;"> LON-ESXI-HOST-01.corp.local</td>
                      <td style="padding: 8px 10px;">ESXi 8.0 Hypervisor</td>
                      <td style="padding: 8px 10px; font-family: monospace;">44.2% (32 Cores)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">68.4% (256 GB)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">1,840 IOPS</td>
                      <td style="padding: 8px 10px; font-family: monospace;">1.42 Gbps</td>
                      <td style="padding: 8px 10px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">CONNECTED</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/vmware/VirtualMachine.png" style="width: 18px; height: 18px;"> LON-ERP-SAP-VM01</td>
                      <td style="padding: 8px 10px;">VMware Guest VM</td>
                      <td style="padding: 8px 10px; font-family: monospace;">38.0% (16 vCPU)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">71.5% (64 GB)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">620 IOPS</td>
                      <td style="padding: 8px 10px; font-family: monospace;">410 Mbps</td>
                      <td style="padding: 8px 10px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">POWERED ON</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/vmware/Datastore.png" style="width: 18px; height: 18px;"> LON-VMFS6-NVME-DS01</td>
                      <td style="padding: 8px 10px;">VMFS-6 Datastore</td>
                      <td style="padding: 8px 10px; font-family: monospace;">—</td>
                      <td style="padding: 8px 10px; font-family: monospace;">11.4 TB / 16 TB</td>
                      <td style="padding: 8px 10px; font-family: monospace;">0.6 ms Latency</td>
                      <td style="padding: 8px 10px; font-family: monospace;">16G FC SAN</td>
                      <td style="padding: 8px 10px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">HEALTHY</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/vmware/DistributedVirtualSwitch.png" style="width: 18px; height: 18px;"> DSwitch-Core-Production</td>
                      <td style="padding: 8px 10px;">vSphere Distributed Switch</td>
                      <td style="padding: 8px 10px; font-family: monospace;">—</td>
                      <td style="padding: 8px 10px; font-family: monospace;">48 PortGroups</td>
                      <td style="padding: 8px 10px; font-family: monospace;">0 Drops</td>
                      <td style="padding: 8px 10px; font-family: monospace;">3.80 Gbps</td>
                      <td style="padding: 8px 10px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">UP (10GbE)</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 10px; font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 8px;"><img src="/apiclient/fluidicv2/img/vmware/Proxmox-Container.png" style="width: 18px; height: 18px;"> NY-PVE-LXC-REDIS-04</td>
                      <td style="padding: 8px 10px;">Proxmox LXC Container</td>
                      <td style="padding: 8px 10px; font-family: monospace;">19.4% (8 vCPU)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">52.0% (32 GB)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">940 IOPS (ZFS)</td>
                      <td style="padding: 8px 10px; font-family: monospace;">285 Mbps</td>
                      <td style="padding: 8px 10px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">RUNNING</span></td>
                    </tr>
                  </tbody>
                </table>
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
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button id="opm-storage-lun-inspector-btn" style="background: #0284c7; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">🔍 LUN &amp; RAID Latency Inspector</button>
                  <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px;">OPERATIONAL</span>
                </div>
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

            <!-- Cisco SD-WAN Fabric Controller Telemetry (vManage / vSmart / vBond / vEdge) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Cisco SD-WAN (Viptela) Control &amp; Data Plane Telemetry</div>
                  <div style="font-size: 11px; color: #64748b;">Overlay OMP Peers, BFD Tunnels &amp; Control Elements across 4 Global Regions</div>
                </div>
                <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px;">OMP Control Plane 100% Up</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                  <img src="/apiclient/fluidicv2/img/v-manage.svg" alt="vManage" style="width: 36px; height: 36px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Cisco vManage NMS</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a;">1 / 1 Active</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 700;">Cluster Quorum OK</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                  <img src="/apiclient/fluidicv2/img/v-smart.svg" alt="vSmart" style="width: 36px; height: 36px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Cisco vSmart Controllers</div>
                    <div style="font-size: 18px; font-weight: 800; color: #16a34a;">2 / 2 Active</div>
                    <div style="font-size: 10px; color: #0284c7; font-weight: 700;">OMP Routes: 428</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                  <img src="/apiclient/fluidicv2/img/v-bond.svg" alt="vBond" style="width: 36px; height: 36px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Cisco vBond Orchestrator</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0284c7;">2 / 2 Active</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 700;">DTLS Auth Verified</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                  <img src="/apiclient/fluidicv2/img/v-edge.svg" alt="vEdge" style="width: 36px; height: 36px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">WAN Edge Routers (vEdge)</div>
                    <div style="font-size: 18px; font-weight: 800; color: #16a34a;">8 / 8 Active</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 700;">32 BFD Sessions Up</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : activeSub === 'netflow' ? `
          <!-- NetFlow Analyzer Addon Dashboard Subtab (Exact replica of netflow_addon_dashboard.png) -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
            
            <!-- Widget 1: Device Summary (V5, V9, NSEL, SFlow, WLC vertical bars) -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Device Summary</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Devices | Last Hour</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 24px 28px; display: flex; align-items: flex-end; justify-content: space-around; height: 185px; box-sizing: border-box;">
                ${[
                  { label: 'V5', count: 0, pct: 4, color: '#94a3b8' },
                  { label: 'V9', count: 10, pct: 82, color: '#49bd80' },
                  { label: 'NSEL', count: 6, pct: 58, color: '#49bd80' },
                  { label: 'SFlow', count: 0, pct: 4, color: '#94a3b8' },
                  { label: 'WLC', count: 2, pct: 24, color: '#49bd80' }
                ].map(bar => `
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="font-size: 18px; font-weight: 700; color: #334155;">${bar.count}</div>
                    <div style="width: 8px; height: 92px; background: #e2e8f0; border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden;">
                      <div style="width: 100%; height: ${bar.pct}%; background: ${bar.color}; border-radius: 4px;"></div>
                    </div>
                    <div style="font-size: 11px; color: #475569; font-weight: 600;">${bar.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Widget 2: HeatMap (Link Up, Unknown, Link Down, Link Up & NoFlows + 48-tile grid) -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">HeatMap</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Devices | Last Hour</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 14px 18px;">
                <div style="display: flex; gap: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 14px; font-size: 11px;">
                  <span style="color: #16a34a; font-weight: 700; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">Link Up</span>
                  <span style="color: #64748b;">Unknown</span>
                  <span style="color: #64748b;">Link Down</span>
                  <span style="color: #64748b;">Link Up &amp; NoFlows</span>
                </div>
                <div style="display: flex; align-items: center; gap: 22px;">
                  <div style="width: 120px; text-align: center; flex-shrink: 0;">
                    <svg width="115" height="72" viewBox="0 0 120 74">
                      <path d="M 14 62 A 46 46 0 0 1 106 62" fill="none" stroke="#e2e8f0" stroke-width="9" stroke-linecap="round"/>
                      <path d="M 14 62 A 46 46 0 0 1 101 44" fill="none" stroke="#49bd80" stroke-width="9" stroke-linecap="round"/>
                      <text x="60" y="54" text-anchor="middle" font-size="22" font-weight="700" fill="#1e293b">48</text>
                      <text x="60" y="68" text-anchor="middle" font-size="10" font-weight="600" fill="#64748b">Interfaces</text>
                    </svg>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; flex: 1;">
                    ${Array.from({ length: 48 }).map((_, i) => `
                      <div title="Interface #${i + 1} (${i === 14 ? 'Critical Utilization 96%' : 'Link Up'})" style="height: 16px; border-radius: 2px; background: ${i === 14 ? '#ef4444' : '#49bd80'};"></div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Widget 3: Top N Protocol & Top N QoS Pie Charts -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Top N Protocol &amp; QoS Distribution</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Devices | Last Hour (Volume)</div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;"><button id="opm-open-spm-btn" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer;">🔍 Open 48-Port Switch Port Mapper</button><span style="color: #64748b; font-size: 13px;">↻ ⋮</span></div>
              </div>
              <div style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 92px; height: 92px; border-radius: 50%; background: conic-gradient(#10b981 0% 59.5%, #0284c7 59.5% 97.3%, #f59e0b 97.3% 99.1%, #ef4444 99.1% 100%); flex-shrink: 0;"></div>
                  <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                    <div><span style="color:#10b981;">●</span> IPv6-NoNxt (59.56%)</div>
                    <div><span style="color:#0284c7;">●</span> TCP (37.8%)</div>
                    <div><span style="color:#f59e0b;">●</span> UDP (1.81%)</div>
                    <div><span style="color:#ef4444;">●</span> ICMP (0.76%)</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; border-left: 1px solid #f1f5f9; padding-left: 12px;">
                  <div style="width: 92px; height: 92px; border-radius: 50%; background: conic-gradient(#10b981 0% 87.8%, #0284c7 87.8% 93.9%, #f59e0b 93.9% 96.8%, #6366f1 96.8% 100%); flex-shrink: 0;"></div>
                  <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                    <div><span style="color:#10b981;">●</span> CS0 / Best Effort (87.84%)</div>
                    <div><span style="color:#0284c7;">●</span> CS6 / Control (6.08%)</div>
                    <div><span style="color:#f59e0b;">●</span> AF12 / Priority (2.86%)</div>
                    <div><span style="color:#6366f1;">●</span> EF / Voice (3.22%)</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Widget 4: Top N Conversation (Traffic) -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Top N Conversation (Traffic)</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Devices | Last Hour</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 14px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                      <th style="padding: 6px 4px;">Source</th>
                      <th style="padding: 6px 4px;">Destination</th>
                      <th style="padding: 6px 4px;">Application</th>
                      <th style="padding: 6px 4px;">DSCP</th>
                      <th style="padding: 6px 4px; text-align: right;">Traffic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="opm-nfa-conv-row" style="border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'"><td style="padding: 7px 4px; font-family: monospace;">10.10.1.50</td><td style="padding: 7px 4px; font-family: monospace;">10.20.1.50</td><td style="padding: 7px 4px; color: #0284c7; font-weight: 600;">PostgreSQL_Sync</td><td style="padding: 7px 4px;">AF41</td><td style="padding: 7px 4px; text-align: right; font-weight: 700;">18.42 GB</td></tr>
                    <tr class="opm-nfa-conv-row" style="border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'"><td style="padding: 7px 4px; font-family: monospace;">10.40.1.50</td><td style="padding: 7px 4px; font-family: monospace;">172.217.14.206</td><td style="padding: 7px 4px; color: #16a34a; font-weight: 600;">HTTPS_SSL</td><td style="padding: 7px 4px;">CS0</td><td style="padding: 7px 4px; text-align: right; font-weight: 700;">14.19 GB</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace;">10.10.1.1</td><td style="padding: 7px 4px; font-family: monospace;">10.30.1.1</td><td style="padding: 7px 4px; color: #7c3aed; font-weight: 600;">IPSec_ESP</td><td style="padding: 7px 4px;">CS6</td><td style="padding: 7px 4px; text-align: right; font-weight: 700;">9.84 GB</td></tr>
                    <tr><td style="padding: 7px 4px; font-family: monospace;">10.20.1.10</td><td style="padding: 7px 4px; font-family: monospace;">10.20.1.50</td><td style="padding: 7px 4px; color: #ea580c; font-weight: 600;">SMBv3_Storage</td><td style="padding: 7px 4px;">AF12</td><td style="padding: 7px 4px; text-align: right; font-weight: 700;">6.12 GB</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Widget 5: Wireless Controller (WLC) Access Point Traffic & Client Density (Replica of nfa_accesspoint_sample_data.png) -->
            <div class="opm-widget-card" style="grid-column: span 2; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">WLC Access Point Traffic &amp; Client Count (DXB-ARUBA-WLC-01)</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Wireless NetFlow Telemetry | IN / OUT Volume &amp; Drop Bytes</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 12px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                      <th style="padding: 6px 8px;">Access Point</th>
                      <th style="padding: 6px 8px;">Client Count</th>
                      <th style="padding: 6px 8px; width: 45%;">Traffic (IN / OUT)</th>
                      <th style="padding: 6px 8px; text-align: right;">Drop Bytes</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${[
                      { ap: 'AP78ba.f9a2.8fe4 (Lobby-WiFi6E)', clients: 42, inPct: 84, outPct: 68, vol: '2.84 GB', drop: '0 B' },
                      { ap: 'AP78ba.f948.d5c0 (Exec-Floor-3)', clients: 29, inPct: 62, outPct: 48, vol: '1.92 GB', drop: '0 B' },
                      { ap: 'AP689c.e2a6.447d (NOC-WarRoom)', clients: 19, inPct: 45, outPct: 36, vol: '1.18 GB', drop: '124 KB' }
                    ].map(row => `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 8px; font-weight: 700; color: #0070e0;">${row.ap}</td>
                        <td style="padding: 7px 8px; font-weight: 700; color: #1e293b;">${row.clients} Clients</td>
                        <td style="padding: 7px 8px;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
                              <div style="height: 5px; width: ${row.inPct}%; background: #49bd80; border-radius: 2px;"></div>
                              <div style="height: 5px; width: ${row.outPct}%; background: #29c5f6; border-radius: 2px;"></div>
                            </div>
                            <span style="font-family: monospace; font-weight: 700; color: #0f172a; min-width: 55px; text-align: right;">${row.vol}</span>
                          </div>
                        </td>
                        <td style="padding: 7px 8px; text-align: right; font-family: monospace; color: ${row.drop === '0 B' ? '#64748b' : '#dc2626'}; font-weight: 600;">${row.drop}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ` : activeSub === 'ncm' ? `
          <!-- Network Configuration Manager (NCM) Dashboard Subtab (1:1 Replica of ncm_sample_data.png) -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Top Row: All Config Changes [ 1360 ] Table + Config Details & Diff Circles -->
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px;">
              <!-- All Config Changes [ 1360 ] -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">All Config Changes [ <span style="color: #0284c7;">1360</span> ]</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Real-time Syslog Change Detection &amp; Scheduled SSH/Telnet Config Archival</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">🔍 ↻ ⋮</span>
                </div>
                <div style="padding: 10px 14px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                        <th style="padding: 7px 6px;">Captured on</th>
                        <th style="padding: 7px 6px;">Host name</th>
                        <th style="padding: 7px 6px;">IP Address</th>
                        <th style="padding: 7px 6px;">Version</th>
                        <th style="padding: 7px 6px;">Changed by</th>
                        <th style="padding: 7px 6px;">Config type</th>
                        <th style="padding: 7px 6px;">Change Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; color: #0284c7; font-family: monospace;">08 Nov 06:40:12</td>
                        <td style="padding: 7px 6px; font-weight: 700; color: #0070e0;">DXB-CORE-SW-01</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.40.1.2</td>
                        <td style="padding: 7px 6px; font-weight: 700;">14 <img src="/apiclient/fluidicv2/img/ncm/icon_editlabel.gif" style="width:11px;height:11px;vertical-align:middle;margin-left:3px;"></td>
                        <td style="padding: 7px 6px;">admin</td>
                        <td style="padding: 7px 6px;">Running</td>
                        <td style="padding: 7px 6px;"><span style="color: #dc2626; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><img src="/apiclient/fluidicv2/img/ncm/unauthorized_change_ico.gif" style="width:12px;height:12px;"> Unauthorized</span></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; color: #0284c7; font-family: monospace;">08 Nov 05:15:00</td>
                        <td style="padding: 7px 6px; font-weight: 700; color: #0070e0;">NY-CORE-RTR-01</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.10.1.1</td>
                        <td style="padding: 7px 6px; font-weight: 700;">42 <img src="/apiclient/fluidicv2/img/ncm/icon_editlabel.gif" style="width:11px;height:11px;vertical-align:middle;margin-left:3px;"></td>
                        <td style="padding: 7px 6px;">netops_ci</td>
                        <td style="padding: 7px 6px;">Startup</td>
                        <td style="padding: 7px 6px;"><span style="color: #16a34a; font-weight: 700;">Authorized</span></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; color: #0284c7; font-family: monospace;">08 Nov 03:30:44</td>
                        <td style="padding: 7px 6px; font-weight: 700; color: #0070e0;">NY-PA-FW-01</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.10.1.4</td>
                        <td style="padding: 7px 6px; font-weight: 700;">29 <img src="/apiclient/fluidicv2/img/ncm/icon_editlabel.gif" style="width:11px;height:11px;vertical-align:middle;margin-left:3px;"></td>
                        <td style="padding: 7px 6px;">sec_admin</td>
                        <td style="padding: 7px 6px;">Running</td>
                        <td style="padding: 7px 6px;"><span style="color: #16a34a; font-weight: 700;">Authorized</span></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; color: #0284c7; font-family: monospace;">07 Nov 22:18:09</td>
                        <td style="padding: 7px 6px; font-weight: 700; color: #0070e0;">LON-EDGE-RTR-01</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.20.1.1</td>
                        <td style="padding: 7px 6px; font-weight: 700;">19 <img src="/apiclient/fluidicv2/img/ncm/icon_editlabel.gif" style="width:11px;height:11px;vertical-align:middle;margin-left:3px;"></td>
                        <td style="padding: 7px 6px;">Unknown</td>
                        <td style="padding: 7px 6px;">Running</td>
                        <td style="padding: 7px 6px;"><span style="color: #dc2626; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><img src="/apiclient/fluidicv2/img/ncm/unauthorized_change_ico.gif" style="width:12px;height:12px;"> Unauthorized</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 6px; color: #0284c7; font-family: monospace;">07 Nov 19:00:02</td>
                        <td style="padding: 7px 6px; font-weight: 700; color: #0070e0;">SG-FORTI-FW-01</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.30.1.4</td>
                        <td style="padding: 7px 6px; font-weight: 700;">31 <img src="/apiclient/fluidicv2/img/ncm/icon_editlabel.gif" style="width:11px;height:11px;vertical-align:middle;margin-left:3px;"></td>
                        <td style="padding: 7px 6px;">admin</td>
                        <td style="padding: 7px 6px;">Running</td>
                        <td style="padding: 7px 6px;"><span style="color: #16a34a; font-weight: 700;">Authorized</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Config Details & Startup/Running/Baseline Diff Circles (ncm_sample_data.png) -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Config Details &amp; Conflict Diff Summary</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Selected Device: DXB-CORE-SW-01 (Cisco Catalyst 9500)</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 12px 16px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 12px; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <div><span style="color:#64748b;">Backup Status:</span> <strong style="color:#16a34a;"><img src="/apiclient/fluidicv2/img/ncm/icon_csh_success.gif" style="width:12px;height:12px;vertical-align:middle;"> Success</strong></div>
                    <div><span style="color:#64748b;">Policy Compliance:</span> <img src="/apiclient/fluidicv2/img/ncm/critical_ico.gif" style="width:11px;vertical-align:middle;"> <strong>3</strong> &nbsp;<img src="/apiclient/fluidicv2/img/ncm/major_ico.gif" style="width:11px;vertical-align:middle;"> <strong>5</strong> &nbsp;<img src="/apiclient/fluidicv2/img/ncm/warning_ico.gif" style="width:11px;vertical-align:middle;"> <strong>1</strong></div>
                    <div><span style="color:#64748b;">Running Config:</span> <strong style="color:#0284c7;">v14</strong> (Baseline: <strong>v1</strong>)</div>
                    <div><span style="color:#64748b;">Startup Config:</span> <strong style="color:#0284c7;">v13</strong> (Baseline: <strong>v1</strong>)</div>
                  </div>
                  <!-- Startup Running Conflict Diff + Diff with Baseline Circles -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center;">
                    <div style="border: 1px solid #f1f5f9; border-radius: 4px; padding: 8px;">
                      <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 8px;">Startup Running Conflict Diff</div>
                      <div style="display: flex; justify-content: center; gap: 10px;">
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #49bd80; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">34</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Added</div></div>
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #38bdf8; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">100</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Modified</div></div>
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #f87171; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">0</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Deleted</div></div>
                      </div>
                    </div>
                    <div style="border: 1px solid #f1f5f9; border-radius: 4px; padding: 8px;">
                      <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 8px;">Diff with Baseline</div>
                      <div style="display: flex; justify-content: center; gap: 10px;">
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #49bd80; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">54</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Added</div></div>
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #38bdf8; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">1k</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Modified</div></div>
                        <div><div style="width: 38px; height: 38px; border-radius: 50%; background: #f87171; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin: 0 auto;">7</div><div style="font-size: 9px; color: #64748b; margin-top: 3px;">Deleted</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Second Row: Config Change Trend (7-Day Red Bar Chart) + Backup Summary (Dual Area Chart + 7-Day Step Timeline) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <!-- Config change trend -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Config change trend (Last 7 Days)</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Total Config Revisions Captured Across 16 Devices</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 14px 16px;">
                  <svg width="100%" height="130" viewBox="0 0 420 130">
                    <line x1="35" y1="20" x2="400" y2="20" stroke="#f1f5f9"/>
                    <line x1="35" y1="60" x2="400" y2="60" stroke="#f1f5f9"/>
                    <line x1="35" y1="100" x2="400" y2="100" stroke="#e2e8f0"/>
                    <text x="6" y="24" font-size="9" fill="#94a3b8">200</text>
                    <text x="6" y="64" font-size="9" fill="#94a3b8">100</text>
                    <text x="16" y="104" font-size="9" fill="#94a3b8">0</text>
                    ${[
                      { d: '02 Nov', h: 52, v: 130 },
                      { d: '03 Nov', h: 36, v: 90 },
                      { d: '04 Nov', h: 68, v: 170 },
                      { d: '05 Nov', h: 44, v: 110 },
                      { d: '06 Nov', h: 76, v: 192 },
                      { d: '07 Nov', h: 60, v: 150 },
                      { d: 'Today', h: 72, v: 184 }
                    ].map((b, idx) => `
                      <rect x="${55 + idx * 48}" y="${100 - b.h}" width="20" height="${b.h}" fill="#f06262" rx="2"/>
                      <text x="${65 + idx * 48}" y="${95 - b.h}" font-size="8" font-weight="700" fill="#dc2626" text-anchor="middle">${b.v}</text>
                      <text x="${65 + idx * 48}" y="116" font-size="9" fill="#64748b" text-anchor="middle">${b.d}</text>
                    `).join('')}
                  </svg>
                </div>
              </div>

              <!-- Backup Summary (Dual Area Chart + 7-Day Step Timeline) -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Backup Summary &amp; Daily Schedule Status</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Succeeded vs Failed Config Backups</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 14px 16px;">
                  <svg width="100%" height="95" viewBox="0 0 420 95">
                    <polygon points="30,80 30,28 95,24 160,30 225,22 290,26 355,20 400,22 400,80" fill="rgba(73,189,128,0.28)" stroke="#49bd80" stroke-width="2"/>
                    <polygon points="30,80 30,74 95,78 160,72 225,76 290,75 355,78 400,77 400,80" fill="rgba(248,113,113,0.35)" stroke="#f87171" stroke-width="1.5"/>
                  </svg>
                  <!-- 7-Day Step Dot Timeline -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 6px 10px; background: #f8fafc; border-radius: 4px;">
                    ${['Today', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday'].map((day, idx) => `
                      <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #334155; font-weight: 600;">
                        <img src="/apiclient/fluidicv2/img/ncm/${idx === 3 ? 'warning_ico.gif' : 'icon_csh_success.gif'}" style="width: 11px; height: 11px;">
                        <span>${day}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Third Row: Compliance Status (CiscoIOSPolicy) + NIST NVD Firmware Vulnerability Scanner -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Compliance status</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | Audited Devices: 16</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 14px 16px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                        <th style="padding: 6px 4px;">Policy Name</th>
                        <th style="padding: 6px 4px;"><img src="/apiclient/fluidicv2/img/ncm/critical_ico.gif" style="width:11px;vertical-align:middle;"> Critical</th>
                        <th style="padding: 6px 4px;"><img src="/apiclient/fluidicv2/img/ncm/major_ico.gif" style="width:11px;vertical-align:middle;"> Major</th>
                        <th style="padding: 6px 4px;"><img src="/apiclient/fluidicv2/img/ncm/warning_ico.gif" style="width:11px;vertical-align:middle;"> Warning</th>
                        <th style="padding: 6px 4px;"><img src="/apiclient/fluidicv2/img/ncm/icon_csh_success.gif" style="width:11px;vertical-align:middle;"> Compliant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 700; color: #0070e0;">CiscoIOSPolicy</td><td style="padding: 8px 4px; font-weight: 700; color: #dc2626;">23</td><td style="padding: 8px 4px; font-weight: 700; color: #ea580c;">13</td><td style="padding: 8px 4px; font-weight: 700; color: #ca8a04;">13</td><td style="padding: 8px 4px; font-weight: 700; color: #16a34a;">13</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 700; color: #0070e0;">PCI_DSS_v4_Hardening</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #ca8a04;">2</td><td style="padding: 8px 4px; font-weight: 700; color: #16a34a;">16</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 700; color: #0070e0;">HIPAA_Core_Encryption</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #ea580c;">1</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #16a34a;">15</td></tr>
                      <tr><td style="padding: 8px 4px; font-weight: 700; color: #0070e0;">SOX_Audit_Trail_Policy</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #64748b;">0</td><td style="padding: 8px 4px; font-weight: 700; color: #16a34a;">16</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Firmware Vulnerabilities [ <span style="color: #dc2626;">67</span> ]</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | Synced with NIST CVE Feed</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 14px 16px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                        <th style="padding: 6px 4px;">CVE ID</th>
                        <th style="padding: 6px 4px;">Target OS</th>
                        <th style="padding: 6px 4px;">CVSS</th>
                        <th style="padding: 6px 4px;">Patch Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-weight: 700; color: #dc2626;">CVE-2023-20198</td><td style="padding: 7px 4px;">Cisco IOS-XE 17.6</td><td style="padding: 7px 4px; font-weight: 800; color: #dc2626;">10.0</td><td style="padding: 7px 4px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">PATCHED</span></td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-weight: 700; color: #ea580c;">CVE-2024-3400</td><td style="padding: 7px 4px;">PAN-OS 11.0.2</td><td style="padding: 7px 4px; font-weight: 800; color: #ea580c;">10.0</td><td style="padding: 7px 4px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">MITIGATED</span></td></tr>
                      <tr><td style="padding: 7px 4px; font-weight: 700; color: #ca8a04;">CVE-2024-21762</td><td style="padding: 7px 4px;">FortiOS 7.4.3</td><td style="padding: 7px 4px; font-weight: 800; color: #ca8a04;">9.6</td><td style="padding: 7px 4px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">PATCHED</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ` : activeSub === 'firewall' ? `
          <!-- Firewall Log Analyzer Addon Dashboard (1:1 Replica of fwa_sample_data.png & fwa_policy_fine_tune_sample_1.png) -->
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Top Row: Top Attack with Status (10) & Top Virus with Status (5) -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
              <!-- Top Attack with Status (10) -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Top Attack with Status (10)</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Firewalls (NY-PA-FW-01, SG-FORTI-FW-01) | Today</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b;">
                    <span>Resolve DNS</span>
                    <span style="display:inline-block;width:26px;height:14px;background:#cbd5e1;border-radius:10px;position:relative;"><span style="position:absolute;left:2px;top:2px;width:10px;height:10px;background:#fff;border-radius:50%;"></span></span>
                    <span>↻ ⋮</span>
                  </div>
                </div>
                <div style="padding: 10px 14px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                        <th style="padding: 6px 8px;">Attack</th>
                        <th style="padding: 6px 8px;">Status</th>
                        <th style="padding: 6px 8px; text-align: right;">Hits</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">tcp_dst_session</td><td style="padding: 6px 8px; color: #16a34a; font-weight: 600;">Permit</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">67</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">SNMP.Public.String.UDP</td><td style="padding: 6px 8px; color: #16a34a; font-weight: 600;">Permit</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">54</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">xss</td><td style="padding: 6px 8px; color: #dc2626; font-weight: 600;">deny</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">33</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">Vulnerability</td><td style="padding: 6px 8px; color: #16a34a; font-weight: 600;">Permit</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">19</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">SQLInjection</td><td style="padding: 6px 8px; color: #16a34a; font-weight: 600;">Permit</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">5</td></tr>
                      <tr><td style="padding: 6px 8px; color: #0070e0; font-weight: 600;">ARP Poisoning</td><td style="padding: 6px 8px; color: #dc2626; font-weight: 600;">deny</td><td style="padding: 6px 8px; text-align: right; font-weight: 700;">1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Top Virus with Status (5) & Denied User Logons (1) -->
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Top Virus with Status (5)</div>
                      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Gateway Anti-Virus Inspection</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b;">
                      <span>Resolve DNS</span>
                      <span style="display:inline-block;width:26px;height:14px;background:#cbd5e1;border-radius:10px;position:relative;"><span style="position:absolute;left:2px;top:2px;width:10px;height:10px;background:#fff;border-radius:50%;"></span></span>
                    </div>
                  </div>
                  <div style="padding: 8px 14px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                          <th style="padding: 5px 8px;">Virus</th>
                          <th style="padding: 5px 8px;">Status</th>
                          <th style="padding: 5px 8px; text-align: right;">Hits</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 5px 8px; color: #0070e0; font-weight: 600;">Malicious Websites</td><td style="padding: 5px 8px; color: #16a34a;">Permit</td><td style="padding: 5px 8px; text-align: right; font-weight: 700;">9</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 5px 8px; color: #0070e0; font-weight: 600;">Virus_17</td><td style="padding: 5px 8px; color: #dc2626;">deny</td><td style="padding: 5px 8px; text-align: right; font-weight: 700;">1</td></tr>
                        <tr><td style="padding: 5px 8px; color: #0070e0; font-weight: 600;">Virus_92</td><td style="padding: 5px 8px; color: #dc2626;">deny</td><td style="padding: 5px 8px; text-align: right; font-weight: 700;">1</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Denied User Logons ( 1 ) -->
                <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Denied User Logons ( 1 )</div>
                    <span style="color: #64748b; font-size: 11px;">VPN &amp; SSL Auth</span>
                  </div>
                  <div style="padding: 8px 14px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                          <th style="padding: 5px 6px;">User</th>
                          <th style="padding: 5px 6px;">Source</th>
                          <th style="padding: 5px 6px;">Destination</th>
                          <th style="padding: 5px 6px;">Context</th>
                          <th style="padding: 5px 6px; text-align: right;">Hits</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style="padding: 5px 6px; font-weight: 700; color: #dc2626;">Deva</td><td style="padding: 5px 6px; font-family: monospace;">112.76.3.82</td><td style="padding: 5px 6px; font-family: monospace;">10.59.11.9</td><td style="padding: 5px 6px;">AnyConnect</td><td style="padding: 5px 6px; text-align: right; font-weight: 700;">1</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Second Row: Allowed Websites ( 1313 ) Pie + Table & Firewall Rule Policy Optimization (Fine Tuning) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <!-- Allowed Websites ( 1313 ) -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Allowed Websites ( 1313 )</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Web Filtering &amp; URL Category Telemetry</div>
                  </div>
                  <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
                </div>
                <div style="padding: 12px 16px; display: grid; grid-template-columns: 135px 1fr; gap: 14px; align-items: center;">
                  <div style="text-align: center;">
                    <svg width="115" height="115" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" stroke-width="8" stroke-dasharray="34 66" stroke-dashoffset="25"/>
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#06b6d4" stroke-width="8" stroke-dasharray="24 76" stroke-dashoffset="91"/>
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" stroke-width="8" stroke-dasharray="18 82" stroke-dashoffset="67"/>
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" stroke-width="8" stroke-dasharray="14 86" stroke-dashoffset="49"/>
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" stroke-width="8" stroke-dasharray="10 90" stroke-dashoffset="35"/>
                    </svg>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                        <th style="padding: 5px 4px;">Host</th>
                        <th style="padding: 5px 4px;">Hits</th>
                        <th style="padding: 5px 4px;">% Hits</th>
                        <th style="padding: 5px 4px; text-align: right;">Bytes (MB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 5px 4px; color: #0070e0;">172.217.26.174 (google)</td><td style="padding: 5px 4px;">10,837</td><td style="padding: 5px 4px;">18.92%</td><td style="padding: 5px 4px; text-align: right; font-weight: 700;">428.4</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 5px 4px; color: #0070e0;">204.79.197.200 (microsoft)</td><td style="padding: 5px 4px;">9,310</td><td style="padding: 5px 4px;">16.25%</td><td style="padding: 5px 4px; text-align: right; font-weight: 700;">312.8</td></tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 5px 4px; color: #0070e0;">52.94.236.248 (aws.amazon)</td><td style="padding: 5px 4px;">6,412</td><td style="padding: 5px 4px;">11.19%</td><td style="padding: 5px 4px; text-align: right; font-weight: 700;">695.1</td></tr>
                      <tr><td style="padding: 5px 4px; color: #0070e0;">151.101.1.69 (github.com)</td><td style="padding: 5px 4px;">4,180</td><td style="padding: 5px 4px;">7.30%</td><td style="padding: 5px 4px; text-align: right; font-weight: 700;">184.2</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Firewall Rule Management -> Policy Optimization (fwa_policy_fine_tune_sample_1.png) -->
              <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Rule Management &rarr; Policy Optimization</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Policy Anomalies | Rule Suggestion | <strong style="color:#49bd80;">Policy Fine Tuning</strong></div>
                  </div>
                  <button onclick="window.showToast && window.showToast('Executing Firewall Rule10 Policy Fine-Tuning Optimization...')" style="background: #49bd80; color: #fff; border: none; padding: 4px 12px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer;">Fine Tune</button>
                </div>
                <div style="padding: 12px 16px;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 11px;">
                    <span style="color: #64748b; font-weight: 600;">Rule Name:</span>
                    <span style="border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 3px; background: #f8fafc; font-weight: 700; color: #0f172a;">Rule10 (Only allowed rules) ▾</span>
                  </div>
                  <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 6px;">Existing Rule &amp; Traffic Hits Breakdown</div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left; background: #f8fafc;">
                        <th style="padding: 6px 6px;">Rule</th>
                        <th style="padding: 6px 6px;">Source</th>
                        <th style="padding: 6px 6px;">Destination</th>
                        <th style="padding: 6px 6px;">Service</th>
                        <th style="padding: 6px 6px;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; font-weight: 700; color: #0f172a;">Rule10</td>
                        <td style="padding: 7px 6px; font-family: monospace;">SrcObj1 (10.10.1.0/24)</td>
                        <td style="padding: 7px 6px; font-family: monospace;">NetworkObj1, NetworkObj2</td>
                        <td style="padding: 7px 6px; color: #dc2626; font-weight: 700;">Any (Over-permissive)</td>
                        <td style="padding: 7px 6px;"><span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">Allow</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 6px; font-weight: 700; color: #16a34a;">Suggested</td>
                        <td style="padding: 7px 6px; font-family: monospace;">10.10.1.15, 10.10.1.22</td>
                        <td style="padding: 7px 6px; font-family: monospace;">172.16.10.5</td>
                        <td style="padding: 7px 6px; color: #16a34a; font-weight: 700;">HTTPS (443), SSH (22)</td>
                        <td style="padding: 7px 6px;"><span style="background:#e0f2fe;color:#0284c7;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700;">Restrict</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ` : activeSub === 'oputils' ? `
          <!-- OpUtils IPAM & Switch Port Mapper Dashboard Subtab -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">IP Address Manager (IPAM) Subnet Utilization</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | 4 Enterprise Subnets</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 14px 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                      <th style="padding: 6px 4px;">Subnet CIDR</th>
                      <th style="padding: 6px 4px;">Probe Region</th>
                      <th style="padding: 6px 4px;">Used / Total IPs</th>
                      <th style="padding: 6px 4px;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace; font-weight: 700;">10.10.1.0/24</td><td style="padding: 7px 4px;">New York Primary</td><td style="padding: 7px 4px;">184 / 254 (72%)</td><td style="padding: 7px 4px; color: #16a34a; font-weight: 700;">Healthy</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace; font-weight: 700;">10.20.1.0/24</td><td style="padding: 7px 4px;">London Branch</td><td style="padding: 7px 4px;">142 / 254 (56%)</td><td style="padding: 7px 4px; color: #16a34a; font-weight: 700;">Healthy</td></tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace; font-weight: 700;">10.30.1.0/24</td><td style="padding: 7px 4px;">Singapore APAC</td><td style="padding: 7px 4px;">118 / 254 (46%)</td><td style="padding: 7px 4px; color: #16a34a; font-weight: 700;">Healthy</td></tr>
                    <tr><td style="padding: 7px 4px; font-family: monospace; font-weight: 700;">10.40.1.0/24</td><td style="padding: 7px 4px;">Dubai DC Core</td><td style="padding: 7px 4px;">212 / 254 (83%)</td><td style="padding: 7px 4px; color: #ea580c; font-weight: 700;">High Usage</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Switch Port Mapper & Rogue MAC Detection</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">All Probes | 192 Physical Switch Ports</div>
                </div>
                <span style="color: #64748b; font-size: 13px;">↻ ⋮</span>
              </div>
              <div style="padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:4px;"><div style="font-size:22px;font-weight:800;color:#16a34a;">148</div><div style="font-size:11px;color:#166534;font-weight:600;">Connected Ports</div></div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:4px;"><div style="font-size:22px;font-weight:800;color:#0284c7;">44</div><div style="font-size:11px;color:#475569;font-weight:600;">Available Free Ports</div></div>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:4px;"><div style="font-size:22px;font-weight:800;color:#16a34a;">0</div><div style="font-size:11px;color:#166534;font-weight:600;">Rogue MAC Hosts</div></div>
              </div>
            </div>
            <!-- Official ManageEngine DHCP & DNS DPI Collector Architecture Diagrams (/apiclient/fluidicv2/img/dhcp-architecture.png & dns-architecture.png) -->
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">DHCP Scope &amp; Port Mirror DPI Collector Architecture</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">DHCP Server &rarr; Switch Mirror Port &rarr; Remote Collector DPI Engine &rarr; OpManager Central</div>
                </div>
                <span style="color: #16a34a; font-size: 11px; font-weight: 700;">● DPI Active</span>
              </div>
              <div style="padding: 14px 16px; text-align: center; background: #fafbfc;">
                <img src="/apiclient/fluidicv2/img/dhcp-architecture.png" alt="DHCP DPI Collector Architecture" style="max-width: 100%; height: 115px; object-fit: contain;">
              </div>
            </div>
            <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">DNS Query Latency &amp; Port Mirror DPI Collector Architecture</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">DNS Server &rarr; Switch Mirror Port &rarr; Remote Collector DPI Engine &rarr; OpManager Central</div>
                </div>
                <span style="color: #0284c7; font-size: 11px; font-weight: 700;">● 1.8 ms Avg Resolution</span>
              </div>
              <div style="padding: 14px 16px; text-align: center; background: #fafbfc;">
                <img src="/apiclient/fluidicv2/img/dns-architecture.png" alt="DNS DPI Collector Architecture" style="max-width: 100%; height: 115px; object-fit: contain;">
              </div>
            </div>
          </div>
        ` : `
          <!-- Multi-Slide Fullscreen NOC Wallboard View (noc) -->
          <div style="background: #0f172a; border-radius: 8px; padding: 24px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <!-- NOC Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #16a34a; box-shadow: 0 0 8px #16a34a;"></span>
                <span style="font-size: 18px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px;">OPMANAGER CENTRAL OPERATIONS WALLBOARD (NOC)</span>
                <span style="background: #1e293b; color: #4ade80; border: 1px solid #334155; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px;">LIVE STREAMING</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="opm-noc-fullscreen-btn" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  ⤢ Fullscreen Wallboard
                </button>
                <a href="/noc" target="_blank" style="background: #0070e0; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700;">Open Standalone Window ↗</a>
              </div>
            </div>

            <!-- NOC Carousel Slide Selector Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-radius: 6px; padding: 8px 14px; margin-bottom: 18px; border: 1px solid #334155;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">WALLBOARD SLIDE:</span>
                <button class="opm-noc-slide-btn" data-slide="0" style="background: ${(state.nocSlide || 0) === 0 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">1. Probes Health</button>
                <button class="opm-noc-slide-btn" data-slide="1" style="background: ${state.nocSlide === 1 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">2. Active Alarms & RCA</button>
                <button class="opm-noc-slide-btn" data-slide="2" style="background: ${state.nocSlide === 2 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">3. Bandwidth Utilization</button>
                <button class="opm-noc-slide-btn" data-slide="3" style="background: ${state.nocSlide === 3 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">4. Power & Thermal</button>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 11px; color: #38bdf8; font-family: monospace;">
                  Rotation: <strong>${state.nocAutoPlay !== false ? 'Active (15s)' : 'Manual'}</strong>
                </div>
                <button id="opm-noc-autoplay-toggle" style="background: ${state.nocAutoPlay !== false ? '#166534' : '#334155'}; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  ${state.nocAutoPlay !== false ? '⏸ Pause Carousel' : '▶ Play Carousel'}
                </button>
              </div>
            </div>

            <!-- Dynamic Slide Content -->
            ${(state.nocSlide || 0) === 0 ? `
              <!-- SLIDE 0: PROBES HEALTH & LATENCIES -->
              <div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
                  <div style="background: #1e293b; padding: 18px; border-radius: 6px; border: 1px solid #334155;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; color: #94a3b8; font-weight: 700;">NEW YORK PROBE</span>
                      <span style="font-size: 10px; background: #064e3b; color: #34d399; padding: 1px 6px; border-radius: 2px;">ONLINE</span>
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #34d399; margin: 8px 0;">100% HEALTHY</div>
                    <div style="font-size: 11px; color: #cbd5e1;">4 Managed Nodes &bull; Latency: <strong>12ms</strong> &bull; Sync: Synchronized</div>
                  </div>
                  <div style="background: #1e293b; padding: 18px; border-radius: 6px; border: 1px solid #334155;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; color: #94a3b8; font-weight: 700;">LONDON PROBE</span>
                      <span style="font-size: 10px; background: #064e3b; color: #34d399; padding: 1px 6px; border-radius: 2px;">ONLINE</span>
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #34d399; margin: 8px 0;">100% HEALTHY</div>
                    <div style="font-size: 11px; color: #cbd5e1;">4 Managed Nodes &bull; Latency: <strong>28ms</strong> &bull; Sync: Synchronized</div>
                  </div>
                  <div style="background: #1e293b; padding: 18px; border-radius: 6px; border: 1px solid #334155;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; color: #94a3b8; font-weight: 700;">SINGAPORE PROBE</span>
                      <span style="font-size: 10px; background: #064e3b; color: #34d399; padding: 1px 6px; border-radius: 2px;">ONLINE</span>
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #34d399; margin: 8px 0;">100% HEALTHY</div>
                    <div style="font-size: 11px; color: #cbd5e1;">4 Managed Nodes &bull; Latency: <strong>45ms</strong> &bull; Sync: Synchronized</div>
                  </div>
                  <div style="background: #450a0a; padding: 18px; border-radius: 6px; border: 1px solid #dc2626;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; color: #fca5a5; font-weight: 700;">DUBAI CORE PROBE</span>
                      <span style="font-size: 10px; background: #7f1d1d; color: #fca5a5; padding: 1px 6px; border-radius: 2px;">DEGRADED</span>
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #f87171; margin: 8px 0;">1 CRITICAL ALARM</div>
                    <div style="font-size: 11px; color: #fecaca;">DXB-CORE-SW-01 High Contention &bull; Latency: <strong>18ms</strong></div>
                  </div>
                </div>

                <!-- Central Telemetry Status Bar -->
                <div style="background: #1e293b; border-radius: 6px; padding: 14px 18px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                  <div style="display: flex; gap: 24px;">
                    <span>PostgreSQL Database: <strong style="color: #4ade80;">Active (Cluster Primary)</strong></span>
                    <span>Active Probe Sync: <strong style="color: #38bdf8;">4 / 4 Live Heartbeats</strong></span>
                    <span>Central Engine Uptime: <strong style="color: #cbd5e1;">184 Days 14 Hours</strong></span>
                  </div>
                  <div style="color: #94a3b8; font-family: monospace;">OpManager Central v12.9.203 GA Build 129203</div>
                </div>
              </div>
            ` : state.nocSlide === 1 ? `
              <!-- SLIDE 1: ACTIVE CORRELATED ALARMS & RCA TICKER -->
              <div>
                <div style="background: #1e1b4b; border: 1px solid #6366f1; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 16px;">✨</span>
                    <div>
                      <div style="font-weight: 800; font-size: 13px; color: #c7d2fe;">Zia AI Correlated Root Cause (Incident RCA-2026-081)</div>
                      <div style="font-size: 11px; color: #a5b4fc;">Core Uplink Flap & Transceiver Degrade on DXB-CORE-SW-01 &bull; Confidence: 98.4%</div>
                    </div>
                  </div>
                  <button onclick="window.location.hash='#/alarms'" style="background: #4f46e5; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Open Alarms Studio &rarr;</button>
                </div>

                <div style="background: #1e293b; border-radius: 6px; padding: 16px; font-size: 12px; border: 1px solid #334155;">
                  <div style="font-weight: 700; color: #38bdf8; margin-bottom: 12px; font-size: 13px;">ACTIVE CENTRAL ALARMS TICKER</div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #334155; color: #94a3b8; text-align: left;">
                        <th style="padding: 6px 8px;">Severity</th>
                        <th style="padding: 6px 8px;">Device Node</th>
                        <th style="padding: 6px 8px;">Entity / Monitor</th>
                        <th style="padding: 6px 8px;">Message</th>
                        <th style="padding: 6px 8px;">Probe</th>
                        <th style="padding: 6px 8px;">Technician</th>
                        <th style="padding: 6px 8px; text-align: right;">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${state.alarms.map(a => `
                        <tr style="border-bottom: 1px solid #283347;">
                          <td style="padding: 8px 8px;">${getStatusBadge(a.severity)}</td>
                          <td style="padding: 8px 8px; font-weight: 700; color: #38bdf8; cursor: pointer;" onclick="showDeviceSnapshotModal('${a.device}')">${a.device}</td>
                          <td style="padding: 8px 8px; color: #cbd5e1;">${a.entity}</td>
                          <td style="padding: 8px 8px; color: #f8fafc;">${a.message}</td>
                          <td style="padding: 8px 8px; color: #94a3b8;">${a.probe}</td>
                          <td style="padding: 8px 8px; color: #a5b4fc; font-weight: 600;">${a.technician}</td>
                          <td style="padding: 8px 8px; text-align: right; color: #94a3b8; font-family: monospace;">${a.time}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : state.nocSlide === 2 ? `
              <!-- SLIDE 2: TOP BANDWIDTH CONSUMING LINKS -->
              <div style="background: #1e293b; border-radius: 6px; padding: 18px; border: 1px solid #334155;">
                <div style="font-weight: 800; font-size: 14px; color: #38bdf8; margin-bottom: 14px;">ENTERPRISE INTERFACES BANDWIDTH CONSUMPTION MATRIX</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
                  ${(state.topInterfaces || []).slice(0, 6).map(inf => `
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 14px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                          <div style="font-weight: 700; font-size: 12px; color: #f8fafc;">${inf.device} - ${inf.name}</div>
                          <div style="font-size: 10px; color: #94a3b8;">Probe: ${inf.probe} &bull; Capacity: ${inf.speed}</div>
                        </div>
                        <span style="font-size: 10px; font-weight: 800; background: #064e3b; color: #34d399; padding: 2px 6px; border-radius: 2px;">UP</span>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                        <div>
                          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="color: #4ade80;">IN Rate: ${inf.inTraffic} Mbps (${inf.inPercent || 48}%)</span>
                          </div>
                          <div style="height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${inf.inPercent || 48}%; height: 100%; background: #22c55e;"></div>
                          </div>
                        </div>
                        <div>
                          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="color: #38bdf8;">OUT Rate: ${inf.outTraffic} Mbps (${inf.outPercent || 42}%)</span>
                          </div>
                          <div style="height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${inf.outPercent || 42}%; height: 100%; background: #0284c7;"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <!-- SLIDE 3: POWER & THERMAL SENSORS -->
              <div style="background: #1e293b; border-radius: 6px; padding: 18px; border: 1px solid #334155;">
                <div style="font-weight: 800; font-size: 14px; color: #38bdf8; margin-bottom: 14px;">FACILITY POWER, UPS RUNTIME &amp; THERMAL METRICS</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px;">
                  <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8;">SCHNEIDER GALAXY 3500 UPS</div>
                    <div style="font-size: 24px; font-weight: 800; color: #4ade80; margin: 6px 0;">42.8% LOAD</div>
                    <div style="font-size: 10px; color: #cbd5e1;">48 Mins Estimated Runtime</div>
                  </div>
                  <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8;">CHASSIS TEMPERATURE PEAK</div>
                    <div style="font-size: 24px; font-weight: 800; color: #f87171; margin: 6px 0;">48 °C</div>
                    <div style="font-size: 10px; color: #cbd5e1;">DXB-CORE-SW-01 Chassis</div>
                  </div>
                  <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8;">TOTAL POWER CONSUMPTION</div>
                    <div style="font-size: 24px; font-weight: 800; color: #38bdf8; margin: 6px 0;">8.42 kW</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Across 16 Core Assets</div>
                  </div>
                  <div style="background: #0f172a; padding: 14px; border-radius: 6px; border: 1px solid #334155; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8;">DUAL PSU REDUNDANCY</div>
                    <div style="font-size: 24px; font-weight: 800; color: #34d399; margin: 6px 0;">32 / 32 ACTIVE</div>
                    <div style="font-size: 10px; color: #cbd5e1;">Zero PSU Faults Reported</div>
                  </div>
                </div>
              </div>
            `}
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

    // Event listeners for Dark Integrated Executive Top Band Cards & Collapse/Expand Button
    container.querySelectorAll('.opm-topband-card').forEach(card => {
      card.onclick = () => {
        const sub = card.getAttribute('data-sub');
        state.subTabs.dashboard = sub;
        renderDashboardView();
      };
    });

    const toggleTopBandBtn = container.querySelector('#opm-toggle-topband-btn');
    if (toggleTopBandBtn) {
      toggleTopBandBtn.onclick = () => {
        state.topBandCollapsed = !state.topBandCollapsed;
        renderDashboardView();
      };
    }

    // NOC Slide Buttons
    container.querySelectorAll('.opm-noc-slide-btn').forEach(btn => {
      btn.onclick = () => {
        state.nocSlide = Number(btn.getAttribute('data-slide'));
        renderDashboardView();
      };
    });

    const autoPlayBtn = container.querySelector('#opm-noc-autoplay-toggle');
    if (autoPlayBtn) {
      autoPlayBtn.onclick = () => {
        state.nocAutoPlay = state.nocAutoPlay === false ? true : false;
        showToast(state.nocAutoPlay ? 'NOC Wallboard auto-rotation enabled (15s).' : 'NOC Wallboard auto-rotation paused.');
        renderDashboardView();
      };
    }

    // NOC Wallboard Fullscreen Toggle
    const nocFsBtn = container.querySelector('#opm-noc-fullscreen-btn');
    if (nocFsBtn) {
      nocFsBtn.onclick = () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen?.().catch(() => {});
          nocFsBtn.innerText = 'Exit Fullscreen ✕';
        } else {
          document.exitFullscreen?.().catch(() => {});
          nocFsBtn.innerText = '⤢ Fullscreen Wallboard';
        }
      };
    }

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
        const id = link.getAttribute('data-id');
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
      { id: 'virtualization', name: 'Virtualization (84 VMs)' },
      { id: 'firewall_rules', name: 'Firewall Rules (142)' },
      { id: 'storage', name: 'Storage (1)' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
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
        <button class="opm-inv-cat-chip" data-cat="${cat.toLowerCase()}" style="padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${isSel ? '#49bd80' : '#cbd5e1'}; background: ${isSel ? '#49bd80' : '#ffffff'}; color: ${isSel ? '#ffffff' : '#475569'}; transition: all 0.15s;">
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
          <button id="opm-inv-add-device-btn" style="background: #49bd80; color: #ffffff; border: 1px solid #3ca66d; padding: 6px 14px; border-radius: 3px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Device
          </button>
          <button id="opm-inv-export-csv-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button id="opm-inv-col-chooser-btn" title="Customize Columns (ManageEngine Table Field Chooser)" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            Columns
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

                    <!-- Enterprise Floating Bulk Actions Bar -->
          <div id="opm-bulk-bar" style="display: ${state.selectedDeviceCheckboxCount > 0 ? 'flex' : 'none'}; position: sticky; bottom: 32px; z-index: 1000; align-items: center; justify-content: space-between; background: #0f172a; color: #ffffff; padding: 12px 22px; border-radius: 8px; margin: 12px 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.35); border: 1px solid #334155;">
            <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0070e0; color: #fff; padding: 3px 10px; border-radius: 14px; font-size: 12px; font-weight: 800;" id="opm-bulk-count">${state.selectedDeviceCheckboxCount}</span>
              <span>Devices Selected for Bulk Management</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="opm-bulk-action-btn" data-action="poll" style="background: #2563eb; color: #fff; border: 1px solid #3b82f6; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">⚡ Poll Now</button>
              <button class="opm-bulk-action-btn" data-action="rediscover" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Rediscover</button>
              <button class="opm-bulk-action-btn" data-action="testcred" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Test Credentials</button>
              <button class="opm-bulk-action-btn" data-action="interval" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">⏱️ Polling Interval</button>
              <button class="opm-bulk-action-btn" data-action="maintenance" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">🛡️ Maintenance Mode</button>
              <button class="opm-bulk-action-btn" data-action="template" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Assign Template</button>
              <button class="opm-bulk-action-btn" data-action="clear" style="background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">✕ Deselect All</button>
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
                        ${getDeviceTypeIcon(dev.type, dev.category, 18)}
                        <span>${dev.name}</span>
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
                      <div style="display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end;">
                        ${(dev.category === 'Servers' || dev.type === 'Windows' || dev.type === 'Linux') ? `
                          
                        ${(dev.category === 'Routers') ? `
                          <button class="opm-inv-row-bgp-btn" data-id="${dev.id}" title="BGP-4 Routing & AS Topology" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">📡</span>
                          </button>
                          <button class="opm-inv-row-sdwan-btn" data-id="${dev.id}" title="SD-WAN Fabric & BFD Tunnels" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🚀</span>
                          </button>
                        ` : ''}
                        ${(dev.category === 'Routers' || dev.category === 'Switches') ? `
                          <button class="opm-inv-row-dpi-btn" data-id="${dev.id}" title="Deep Packet Inspection & NBAR2" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">📊</span>
                          </button>
                        ` : ''}
                        ${(dev.category === 'Firewalls' || dev.category === 'Routers') ? `
                          <button class="opm-inv-row-ndr-btn" data-id="${dev.id}" title="NDR Threat Forensics (TAXII/STIX)" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🛡️</span>
                          </button>
                        ` : ''}
                        <button class="opm-inv-row-hw-btn" data-id="${dev.id}" title="Hardware Health & IPMI Sensors" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🌡️</span>
                          </button>
                        ` : ''}
                        ${(dev.category === 'Routers' || dev.category === 'Switches') ? `
                          <button class="opm-inv-row-netpath-btn" data-id="${dev.id}" title="NetPath Hop-by-Hop Telemetry" style="background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🌐</span>
                          </button>
                        ` : ''}
                        <button class="opm-inv-row-ping-btn" data-ip="${dev.ip}" title="ICMP Ping ${dev.ip}" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #0284c7; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </button>
                        <button class="opm-inv-row-cli-btn" data-ip="${dev.ip}" title="Web CLI Terminal (${dev.ip})" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                        </button>
                        <button class="opm-inv-row-poll-btn" data-id="${dev.id}" data-name="${dev.name}" title="Poll Device Now (SNMP)" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #16a34a; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        </button>
                        <button class="opm-inv-snapshot-btn" data-id="${dev.id}" title="Device Snapshot" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0070e0; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer;">
                          Inspect
                        </button>
                      </div>
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
          <!-- Interfaces Subtab (With Shipped 95th Percentile Graph, Statistical Box & port_up.gif / port_down.gif) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Enterprise Interface Traffic Summary (1-Minute Average &amp; 95th Percentile Threshold)</div>
                <div style="font-size: 11px; color: #64748b;">Aggregated across 48 Monitored SNMP/NetFlow Ports | Today (00:00 - 24:00)</div>
              </div>
              <div style="display: flex; gap: 14px; font-size: 11px; font-weight: 600;">
                <span><span style="color:#49bd80;">■</span> IN Traffic</span>
                <span><span style="color:#38bdf8;">■</span> OUT Traffic</span>
                <span><span style="color:#ef4444;">―</span> IN 95th Percentile (9.35 Gbps)</span>
                <span><span style="color:#dc2626;">--</span> OUT 95th Percentile (7.12 Gbps)</span>
              </div>
            </div>
            <svg width="100%" height="150" viewBox="0 0 900 150" style="background: #fafbfc; border: 1px solid #f1f5f9; border-radius: 4px; margin-bottom: 14px;">
              <line x1="50" y1="30" x2="880" y2="30" stroke="#e2e8f0" stroke-dasharray="2,2"/>
              <line x1="50" y1="70" x2="880" y2="70" stroke="#e2e8f0" stroke-dasharray="2,2"/>
              <line x1="50" y1="110" x2="880" y2="110" stroke="#e2e8f0" stroke-dasharray="2,2"/>
              <text x="8" y="34" font-size="9" fill="#64748b">12 Gbps</text>
              <text x="8" y="74" font-size="9" fill="#64748b">6 Gbps</text>
              <text x="8" y="114" font-size="9" fill="#64748b">2 Gbps</text>
              <!-- IN Area & Line -->
              <polygon points="50,130 50,82 140,68 230,52 320,60 410,36 500,44 590,32 680,48 770,40 880,45 880,130" fill="rgba(73,189,128,0.22)"/>
              <polyline points="50,82 140,68 230,52 320,60 410,36 500,44 590,32 680,48 770,40 880,45" fill="none" stroke="#49bd80" stroke-width="2"/>
              <!-- OUT Area & Line -->
              <polygon points="50,130 50,98 140,88 230,76 320,84 410,64 500,72 590,58 680,70 770,62 880,68 880,130" fill="rgba(56,189,248,0.22)"/>
              <polyline points="50,98 140,88 230,76 320,84 410,64 500,72 590,58 680,70 770,62 880,68" fill="none" stroke="#38bdf8" stroke-width="2"/>
              <!-- Red 95th Percentile Threshold Lines -->
              <line x1="50" y1="42" x2="880" y2="42" stroke="#ef4444" stroke-width="1.5"/>
              <text x="740" y="38" font-size="9" font-weight="700" fill="#ef4444">IN 95th Percentile</text>
              <line x1="50" y1="63" x2="880" y2="63" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,3"/>
              <text x="735" y="59" font-size="9" font-weight="700" fill="#dc2626">OUT 95th Percentile</text>
            </svg>
            <!-- Authentic ManageEngine 95th Percentile Statistical Summary Box (Matches netflow_addon_inventory.png) -->
            <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: #ffffff;">
              <div style="width: 150px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px;">
                <div style="font-size: 18px; color: #64748b;">🕒</div>
                <div style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 2px;">00:00 - 24:00</div>
                <div style="font-size: 9px; color: #94a3b8;">1-Min Granularity</div>
              </div>
              <table style="flex: 1; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                    <th style="padding: 7px 12px;">Category</th>
                    <th style="padding: 7px 12px;">Total Volume</th>
                    <th style="padding: 7px 12px;">Maximum</th>
                    <th style="padding: 7px 12px;">Minimum</th>
                    <th style="padding: 7px 12px;">Average</th>
                    <th style="padding: 7px 12px;">Standard Deviation</th>
                    <th style="padding: 7px 12px;">95th Percentile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 12px; font-weight: 700; color: #16a34a;">Traffic IN</td>
                    <td style="padding: 7px 12px; font-family: monospace; font-weight: 700;">450.94 GB</td>
                    <td style="padding: 7px 12px; font-family: monospace;">11.42 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">1.18 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">5.84 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">1.92 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace; font-weight: 700; color: #dc2626;">9.35 Gbps</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 12px; font-weight: 700; color: #0284c7;">Traffic OUT</td>
                    <td style="padding: 7px 12px; font-family: monospace; font-weight: 700;">318.62 GB</td>
                    <td style="padding: 7px 12px; font-family: monospace;">8.64 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">840.5 Mbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">4.12 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace;">1.34 Gbps</td>
                    <td style="padding: 7px 12px; font-family: monospace; font-weight: 700; color: #dc2626;">7.12 Gbps</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                    <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                      <img src="/apiclient/fluidicv2/img/${it.status === 'UP' ? 'port_up.gif' : 'port_down.gif'}" alt="${it.status}" style="width: 14px; height: 14px;">
                      ${it.name}
                    </td>
                    <td style="padding: 10px 12px; color: #0070e0; font-weight: 600;">${it.device}</td>
                    <td style="padding: 10px 12px; color: #64748b;">${it.probe}</td>
                    <td style="padding: 10px 12px; font-family: monospace;">${it.speed}</td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #0284c7; font-weight: 600;">${it.inTraffic} Mbps (${it.inPercent}%)</td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #64748b; font-weight: 600;">${it.outTraffic} Mbps (${it.outPercent}%)</td>
                    <td style="padding: 10px 12px;"><span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 2px;"><img src="/apiclient/fluidicv2/img/port_up.gif" style="width:10px;height:10px;"> UP</span></td>
                    <td style="padding: 10px 12px;"><span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; ${it.status === 'UP' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'} padding: 2px 6px; border-radius: 2px;"><img src="/apiclient/fluidicv2/img/${it.status === 'UP' ? 'port_up.gif' : 'port_down.gif'}" style="width:10px;height:10px;"> ${it.status}</span></td>
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
                    <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${typeof pr.devicesCount !== "undefined" ? pr.devicesCount : (pr.devices || 0)}</div>
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
          <!-- Virtualization Subtab (OPM/Virtualization.xml -> /Inventory/List/Virtualization/*) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Virtualization KPI Strip -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Virtual Machines</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">84 VMs</div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">82 Running • 2 Suspended</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #16a34a;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Allocated vCPUs</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">348 Cores</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Avg Utilization: 32.4%</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #7c3aed;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Allocated Memory (vRAM)</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">1.4 TB</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Buffer Cache: 88% Optimal</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0284c7;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Hypervisor Clusters</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">4 Active</div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">VMware, Proxmox, Nutanix, K8s</div>
              </div>
            </div>

            <!-- Hypervisor Clusters Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <img src="/apiclient/fluidicv2/img/vmware/vCenter.png" style="width: 36px; height: 36px; object-fit: contain;">
                <div>
                  <div style="font-weight: 700; color: #0070e0; font-size: 13px;">VMware vCenter 8.0 - London DC</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Host: LON-MAIL-EXCH-01 (10.20.3.10) • Probe: London Branch Office</div>
                  <div style="font-size: 12px; color: #334155; margin-top: 4px;">1 ESXi Host | 42 Guest Virtual Machines | 99.98% Uptime</div>
                </div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <img src="/apiclient/fluidicv2/img/vmware/Proxmox-Node.png" style="width: 36px; height: 36px; object-fit: contain;">
                <div>
                  <div style="font-weight: 700; color: #0070e0; font-size: 13px;">Proxmox VE 8.1 HA Cluster - Dubai Campus</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Master: DXB-PVE-01 (10.40.5.10) • Probe: Dubai Campus Core</div>
                  <div style="font-size: 12px; color: #334155; margin-top: 4px;">3 Quorum Nodes | 24 Guest VMs/LXC | ZFS Pool Healthy</div>
                </div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <img src="/apiclient/fluidicv2/img/vmware/PrismCentral.svg" style="width: 36px; height: 36px; object-fit: contain;">
                <div>
                  <div style="font-weight: 700; color: #0070e0; font-size: 13px;">Nutanix AHV Prism Central - New York DC</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Controller: NY-NTNX-PRISM-01 (10.10.8.20) • Probe: New York Data Center</div>
                  <div style="font-size: 12px; color: #334155; margin-top: 4px;">4 AHV Nodes | 10 Analytics VMs | Acropolis OS v6.5</div>
                </div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #ffffff; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <img src="/apiclient/fluidicv2/img/vmware/HostSystem.png" style="width: 36px; height: 36px; object-fit: contain;">
                <div>
                  <div style="font-weight: 700; color: #0070e0; font-size: 13px;">Kubernetes Container Control Plane - Singapore VPC</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Host: SG-K8S-MSTR-01 (10.30.4.10) • Probe: Singapore Cloud VPC</div>
                  <div style="font-size: 12px; color: #334155; margin-top: 4px;">8 Microservice Pods | Containerd Runtime | K8s v1.27</div>
                </div>
              </div>
            </div>

            <!-- Virtual Machines Table -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Virtual Machine Inventory &amp; Performance Telemetry</div>
                <div style="font-size: 11px; color: #64748b;">Showing 6 of 84 Discovered Virtual Machines</div>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 14px;">Virtual Machine</th>
                    <th style="padding: 10px 14px;">Hypervisor &amp; Cluster</th>
                    <th style="padding: 10px 14px;">Probe Scope</th>
                    <th style="padding: 10px 14px;">Guest OS</th>
                    <th style="padding: 10px 14px;">vCPU (Load%)</th>
                    <th style="padding: 10px 14px;">Allocated RAM</th>
                    <th style="padding: 10px 14px;">IP Address</th>
                    <th style="padding: 10px 14px;">Status</th>
                    <th style="padding: 10px 14px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-weight: 700; color: #0070e0;">lon-exch-mbx-01</td>
                    <td style="padding: 12px 14px;">VMware ESXi 8.0<br><span style="font-size: 10px; color: #64748b;">LON-CLUSTER-01</span></td>
                    <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                    <td style="padding: 12px 14px;">Windows Server 2022</td>
                    <td style="padding: 12px 14px; font-weight: 600;">8 vCPU (42%)</td>
                    <td style="padding: 12px 14px;">32 GB (68% used)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">10.20.3.11</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700;">● RUNNING</span></td>
                    <td style="padding: 12px 14px; text-align: right;"><button onclick="window.showToast('Rebooting guest VM lon-exch-mbx-01')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Actions ▾</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-weight: 700; color: #0070e0;">lon-exch-cas-01</td>
                    <td style="padding: 12px 14px;">VMware ESXi 8.0<br><span style="font-size: 10px; color: #64748b;">LON-CLUSTER-01</span></td>
                    <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">London Branch Office</span></td>
                    <td style="padding: 12px 14px;">Windows Server 2022</td>
                    <td style="padding: 12px 14px; font-weight: 600;">4 vCPU (28%)</td>
                    <td style="padding: 12px 14px;">16 GB (54% used)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">10.20.3.12</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700;">● RUNNING</span></td>
                    <td style="padding: 12px 14px; text-align: right;"><button onclick="window.showToast('Actions menu')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Actions ▾</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-weight: 700; color: #0070e0;">pve-web-frontend-01</td>
                    <td style="padding: 12px 14px;">Proxmox VE 8.1<br><span style="font-size: 10px; color: #64748b;">PVE-HA-CLUSTER</span></td>
                    <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Dubai Campus Core</span></td>
                    <td style="padding: 12px 14px;">Debian 12 Bookworm</td>
                    <td style="padding: 12px 14px; font-weight: 600;">4 vCPU (18%)</td>
                    <td style="padding: 12px 14px;">8 GB (41% used)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">10.40.5.10</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700;">● RUNNING</span></td>
                    <td style="padding: 12px 14px; text-align: right;"><button onclick="window.showToast('Actions menu')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Actions ▾</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-weight: 700; color: #0070e0;">ntnx-analytics-worker-01</td>
                    <td style="padding: 12px 14px;">Nutanix AHV<br><span style="font-size: 10px; color: #64748b;">PRISM-CENTRAL-01</span></td>
                    <td style="padding: 12px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">New York Data Center</span></td>
                    <td style="padding: 12px 14px;">RHEL 9.2 Enterprise</td>
                    <td style="padding: 12px 14px; font-weight: 600;">16 vCPU (64%)</td>
                    <td style="padding: 12px 14px;">64 GB (78% used)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">10.10.8.20</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 700;">● RUNNING</span></td>
                    <td style="padding: 12px 14px; text-align: right;"><button onclick="window.showToast('Actions menu')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Actions ▾</button></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        ` : activeSub === 'firewall_rules' ? `
          <!-- Firewall Rules Subtab (FWA/secondaryLevelMenuTab.xml -> /Inventory/List/LogMgmt/Rulemgmt) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Firewall Rules KPI Strip -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Security Rules</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">142 Rules</div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Indexed across Palo Alto &amp; Fortinet</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #16a34a;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Policy Rules</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">141 Active</div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">99.3% Policy Efficiency</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #dc2626;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Shadowed / Obsolete Rules</div>
                <div style="font-size: 22px; font-weight: 800; color: #dc2626; margin-top: 4px;">1 Conflict</div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 2px;">Rule #42 completely shadowed</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Blocked Attack Packets</div>
                <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">84,920 pkts</div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Enforced at Network Perimeter</div>
              </div>
            </div>

            <!-- Rules Table -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Firewall Analyzer Security Policy Rule Management</div>
                <div style="font-size: 11px; color: #64748b;">Matching route: <code>/Inventory/List/LogMgmt/Rulemgmt</code></div>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 14px;">Rule ID</th>
                    <th style="padding: 10px 14px;">Policy Name</th>
                    <th style="padding: 10px 14px;">Firewall &amp; Probe</th>
                    <th style="padding: 10px 14px;">Source Zone</th>
                    <th style="padding: 10px 14px;">Destination Zone</th>
                    <th style="padding: 10px 14px;">Service / Port</th>
                    <th style="padding: 10px 14px;">Action</th>
                    <th style="padding: 10px 14px;">Hit Count</th>
                    <th style="padding: 10px 14px; text-align: right;">Optimization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">RULE-01</td>
                    <td style="padding: 12px 14px; font-weight: 600;">Permit-HTTPS-Inbound</td>
                    <td style="padding: 12px 14px;">NY-PA-FW-01<br><span style="font-size: 10px; color: #64748b;">New York Data Center</span></td>
                    <td style="padding: 12px 14px;">Untrust (WAN)</td>
                    <td style="padding: 12px 14px;">DMZ (10.10.0.50)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">TCP/443</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-weight: 700; font-size: 10px;">PERMIT</span></td>
                    <td style="padding: 12px 14px; font-weight: 700;">14,820,194</td>
                    <td style="padding: 12px 14px; text-align: right;"><span style="color: #16a34a; font-size: 11px; font-weight: 600;">✓ Optimized</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">RULE-02</td>
                    <td style="padding: 12px 14px; font-weight: 600;">Drop-Telnet-Inbound</td>
                    <td style="padding: 12px 14px;">NY-PA-FW-01<br><span style="font-size: 10px; color: #64748b;">New York Data Center</span></td>
                    <td style="padding: 12px 14px;">Any</td>
                    <td style="padding: 12px 14px;">Internal (10.10.0.0/16)</td>
                    <td style="padding: 12px 14px; font-family: monospace;">TCP/23</td>
                    <td style="padding: 12px 14px;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 3px; font-weight: 700; font-size: 10px;">DENY (DROP)</span></td>
                    <td style="padding: 12px 14px; font-weight: 700;">84,920</td>
                    <td style="padding: 12px 14px; text-align: right;"><span style="color: #16a34a; font-size: 11px; font-weight: 600;">✓ Enforced</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background: #fffbeb;">
                    <td style="padding: 12px 14px; font-family: monospace; font-weight: 700; color: #dc2626;">RULE-42</td>
                    <td style="padding: 12px 14px; font-weight: 600; color: #b45309;">Permit-DMZ-Legacy</td>
                    <td style="padding: 12px 14px;">LON-FTNT-FW-01<br><span style="font-size: 10px; color: #64748b;">London Branch Office</span></td>
                    <td style="padding: 12px 14px;">WAN</td>
                    <td style="padding: 12px 14px;">DMZ</td>
                    <td style="padding: 12px 14px; font-family: monospace;">TCP/8080</td>
                    <td style="padding: 12px 14px;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-weight: 700; font-size: 10px;">PERMIT</span></td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #dc2626;">0 hits (90d)</td>
                    <td style="padding: 12px 14px; text-align: right;"><button onclick="window.showToast('Recommending rule purge for #42')" style="background: #ea580c; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; cursor: pointer;">Shadowed (Purge)</button></td>
                  </tr>
                </tbody>
              </table>
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
        const header = 'Device Name,IP Address,Category,Vendor,Model Type,Probe Location,Status,CPU %,Memory %,Response Time (ms),Availability\n';
        const rows = state.devices.map(d =>
          `"${d.name}","${d.ip}","${d.category}","${d.vendor}","${d.type}","${d.probe}","${d.status}",${d.cpu},${d.memory},${d.responseTime},"${d.availability}"`
        ).join('\n');
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

    // Column Chooser Button
    const colChooserBtn = container.querySelector('#opm-inv-col-chooser-btn');
    if (colChooserBtn) {
      colChooserBtn.onclick = () => {
        showColumnChooserModal('Inventory', () => renderInventoryView());
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

    // Row click -> opens Device Snapshot Modal (only if not clicking checkbox or button)
    container.querySelectorAll('.opm-inv-row').forEach(row => {
      row.onclick = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('input') || e.target.closest('button')) return;
        const id = row.getAttribute('data-id');
        showDeviceSnapshotModal(id);
      };
    });

    // Snapshot button click inside table
    container.querySelectorAll('.opm-inv-snapshot-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        showDeviceSnapshotModal(id);
      };
    });

    // Row BGP Monitoring button
    container.querySelectorAll('.opm-inv-row-bgp-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showBgpMonitoringModal === 'function') {
          showBgpMonitoringModal(dev);
        }
      };
    });

    // Row SD-WAN button
    container.querySelectorAll('.opm-inv-row-sdwan-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showSdwanPerformanceModal === 'function') {
          showSdwanPerformanceModal(dev);
        }
      };
    });

    // Row DPI NBAR2 button
    container.querySelectorAll('.opm-inv-row-dpi-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showDpiTrafficModal === 'function') {
          showDpiTrafficModal(dev);
        }
      };
    });

    // Row NDR Threat button
    container.querySelectorAll('.opm-inv-row-ndr-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showNdrForensicsModal === 'function') {
          showNdrForensicsModal(dev);
        }
      };
    });

    // Row Hardware Sensor (IPMI) button
    container.querySelectorAll('.opm-inv-row-hw-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showHardwareSensorsModal === 'function') {
          showHardwareSensorsModal(dev);
        }
      };
    });

    // Row NetPath button
    container.querySelectorAll('.opm-inv-row-netpath-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const dev = state.devices.find(d => d.id == id);
        if (typeof showNetPathModal === 'function') {
          showNetPathModal(null, 'salesforce');
        }
      };
    });

    // Row Ping button
    container.querySelectorAll('.opm-inv-row-ping-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const ip = btn.getAttribute('data-ip');
        showNetworkToolsModal(ip, 'ping');
      };
    });

    // Row CLI button
    container.querySelectorAll('.opm-inv-row-cli-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const ip = btn.getAttribute('data-ip');
        showNetworkToolsModal(ip, 'terminal');
      };
    });

    // Row Poll button
    container.querySelectorAll('.opm-inv-row-poll-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const name = btn.getAttribute('data-name');
        showToast('Polling ' + name + ' now... SNMP OIDs & ICMP updated.');
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
      cb.onchange = (e) => {
        e.stopPropagation();
        const checkedCount = container.querySelectorAll('.opm-inv-row-cb:checked').length;
        state.selectedDeviceCheckboxCount = checkedCount;
        const bulkBar = document.getElementById('opm-bulk-bar');
        const bulkCount = document.getElementById('opm-bulk-count');
        if (bulkBar && bulkCount) {
          bulkBar.style.display = checkedCount > 0 ? 'flex' : 'none';
          bulkCount.innerText = checkedCount;
        }
        if (selectAllCb) {
          selectAllCb.checked = checkedCount === list.length && list.length > 0;
        }
      };
    });

        // NetFlow raw flow records drilldown listener
    container.querySelectorAll('.opm-nfa-conv-row').forEach(row => {
      row.onclick = () => {
        if (typeof showNetFlowRawRecordsModal === 'function') {
          showNetFlowRawRecordsModal();
        }
      };
    });

        // Storage LUN Inspector and SPM Button Listeners opm-storage-lun-inspector-btn-listener
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
    }

    // Bulk actions buttons
    container.querySelectorAll('.opm-bulk-action-btn').forEach(btn => {
      btn.onclick = () => {
        const act = btn.getAttribute('data-action');
        const selectedCbs = Array.from(container.querySelectorAll('.opm-inv-row-cb:checked'));
        const ids = selectedCbs.map(c => parseInt(c.getAttribute('data-id'), 10));

                if (act === 'clear') {
          container.querySelectorAll('.opm-inv-row-cb').forEach(cb => cb.checked = false);
          const selectAll = container.querySelector('#opm-inv-select-all');
          if (selectAll) selectAll.checked = false;
          state.selectedDeviceCheckboxCount = 0;
          const bulkBar = document.getElementById('opm-bulk-bar');
          if (bulkBar) bulkBar.style.display = 'none';
        } else if (act === 'poll') {
          state.devices.forEach(d => {
            if (ids.includes(d.id)) {
              d.lastBackup = 'Just now';
              d.responseTime = Math.max(8, d.responseTime + Math.floor(Math.random() * 4 - 2));
            }
          });
          showToast(`Initiated live parallel SNMP poll across ${ids.length} selected devices. Telemetry synchronized.`);
          renderInventoryView();
        } else if (act === 'interval') {
          showToast(`Updated polling frequency to 1-minute high-frequency interval for ${ids.length} devices.`);
        } else if (act === 'maintenance') {
          showToast(`Configured 2-hour Maintenance Window. Alarms suppressed for ${ids.length} devices.`);
        } else if (act === 'delete') {
          if (confirm(`Are you sure you want to remove ${ids.length} device(s) from OpManager Central Inventory?`)) {
            state.devices = state.devices.filter(d => !ids.includes(d.id));
            state.selectedDeviceCheckboxCount = 0;
            showToast(`Successfully removed ${ids.length} device(s) from Central Inventory.`);
            renderInventoryView();
          }
        } else if (act === 'rediscover') {
          state.devices.forEach(d => {
            if (ids.includes(d.id)) {
              d.lastBackup = 'Just now';
              d.responseTime = Math.floor(Math.random() * 15 + 8);
            }
          });
          showToast(`Triggered background rediscovery for ${ids.length} devices.`);
          renderInventoryView();
        } else if (act === 'testcred') {
          showToast(`SNMP Credential Test completed: ${ids.length} / ${ids.length} PASSED (SNMPv2c & SNMPv3).`);
        } else if (act === 'manage') {
          showToast(`Management status toggled for ${ids.length} monitored nodes.`);
        } else if (act === 'template') {
          showToast(`Applied Enterprise Device Template across ${ids.length} selected nodes.`);
        } else {
          showToast(`Executed bulk action "${act}" across ${state.selectedDeviceCheckboxCount} devices.`);
        }
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
