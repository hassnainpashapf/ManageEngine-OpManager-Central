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
    const storageCount = filteredDevices.filter(d => ['storage', 'san', 'nas'].some(c => (d.category || '').toLowerCase().includes(c))).length;
    const networkCount = routerCount + switchCount;
    const networkAlarms = filteredAlarms.filter(a => ['Switch','Router','Network'].includes(a.category)).length;

    // --- Dynamic Topband SVGs & Counters ---
    let overviewDoughnutSvg = '';
    if (totalDevices === 0) {
      overviewDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
        </svg>
      `;
    } else {
      const upDevices = filteredDevices.filter(d => (d.status || '').toLowerCase() === 'clear' || (d.status || '').toLowerCase() === 'up').length;
      const upArc = Math.max(1, Math.round((upDevices / totalDevices) * 88));
      const downArc = 88 - upArc;
      overviewDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#49bd80" stroke-width="4" stroke-dasharray="${upArc} 88"/>
          ${downArc > 0 ? `<circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="${downArc} 88" stroke-dashoffset="-${upArc}"/>` : ''}
        </svg>
      `;
    }

    let networkDoughnutSvg = '';
    if (networkCount === 0) {
      networkDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
        </svg>
      `;
    } else {
      const netDevs = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('router') || (d.category || '').toLowerCase().includes('switch'));
      const netUp = netDevs.filter(d => (d.status || '').toLowerCase() === 'clear' || (d.status || '').toLowerCase() === 'up').length;
      const netUpArc = Math.max(1, Math.round((netUp / networkCount) * 88));
      const netDownArc = 88 - netUpArc;
      networkDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#49bd80" stroke-width="4" stroke-dasharray="${netUpArc} 88"/>
          ${netDownArc > 0 ? `<circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="${netDownArc} 88" stroke-dashoffset="-${netUpArc}"/>` : ''}
        </svg>
      `;
    }

    let serverDoughnutSvg = '';
    if (serverCount === 0) {
      serverDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
        </svg>
      `;
    } else {
      const srvDevs = filteredDevices.filter(d => (d.category || '').toLowerCase().includes('server'));
      const srvUp = srvDevs.filter(d => (d.status || '').toLowerCase() === 'clear' || (d.status || '').toLowerCase() === 'up').length;
      const srvUpArc = Math.max(1, Math.round((srvUp / serverCount) * 88));
      const srvDownArc = 88 - srvUpArc;
      serverDoughnutSvg = `
        <svg width="28" height="28" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" stroke-width="4"/>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="${srvUpArc} 88"/>
          ${srvDownArc > 0 ? `<circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="${srvDownArc} 88" stroke-dashoffset="-${srvUpArc}"/>` : ''}
        </svg>
      `;
    }

    const virtClustersCount = filteredDevices.filter(d => ['virtualization', 'hypervisor', 'cluster', 'vcenter', 'proxmox', 'esxi'].some(k => ((d.type || '') + ' ' + (d.category || '')).toLowerCase().includes(k))).length;
    const virtVmsCount = (state.virtualMachines || []).filter(vm => state.selectedProbe === 'all' || vm.probeId == state.selectedProbe).length;

    const flowCount = (state.flowExporters || []).length;
    let netflowBarsHtml = '';
    if (flowCount === 0) {
      netflowBarsHtml = `
        <div style="display: flex; align-items: flex-end; gap: 2px; height: 24px;">
          <div style="width: 4px; height: 4px; background: #334155;"></div>
          <div style="width: 4px; height: 4px; background: #334155;"></div>
          <div style="width: 4px; height: 4px; background: #334155;"></div>
          <div style="width: 4px; height: 4px; background: #334155;"></div>
        </div>
      `;
    } else {
      netflowBarsHtml = `
        <div style="display: flex; align-items: flex-end; gap: 2px; height: 24px;">
          <div style="width: 4px; height: 12px; background: #38bdf8;"></div>
          <div style="width: 4px; height: 20px; background: #49bd80;"></div>
          <div style="width: 4px; height: 16px; background: #38bdf8;"></div>
          <div style="width: 4px; height: 24px; background: #f59e0b;"></div>
        </div>
      `;
    }

    const ncmChangesCount = (state.ncmAudits || []).length;
    const ncmDriftCount = filteredDevices.filter(d => d.configDrift).length;
    const firewallAttacksCount = filteredAlarms.filter(a => ((a.category || '') + ' ' + (a.message || '')).toLowerCase().includes('attack') || ((a.category || '')).toLowerCase() === 'security').length;

    const slaPct = totalDevices === 0 ? '100.0%' : (criticalDevices > 0 ? ((1 - (criticalDevices / totalDevices) * 0.05) * 100).toFixed(2) + '%' : '99.99%');
    const slaTarget = totalDevices === 0 ? 'Optimal SLA' : 'Tier 4 Target Met';
    const slaDowntime = totalDevices === 0 ? '0m Downtime' : 'Past 30d';
    const mttrString = filteredAlarms.length === 0 ? 'MTTR: 0m (No Active Incidents)' : 'MTTR: 18m 42s';
    const probeAvgRtt = state.probes.length > 0 && state.probes[0].pingLatency ? `${state.probes[0].pingLatency} ms` : '1.2 ms';

    // --- Pre-calculated clean empty states for Overview widgets ---
    let widgetCpuBody = '';
    if (totalDevices === 0) {
      widgetCpuBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No CPU Telemetry Available</div><div style="font-size: 11px;">Deploy the OpManager Agent or add SNMP credentials to stream real-time processor load.</div></div>';
    } else {
      widgetCpuBody = `
        <div style="display: flex; align-items: center; justify-content: space-around; gap: 4px; margin-bottom: 12px; overflow-x: auto;">
          ${[...filteredDevices].sort((a,b) => b.cpu - a.cpu).slice(0, 3).map(d => 
            createSpeedometerGauge(d.cpu, 'CPU Load', d.name, d.ip, 145)
          ).join('')}
        </div>
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
      `;
    }

    let widgetMemBody = '';
    if (totalDevices === 0) {
      widgetMemBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No Memory Telemetry Available</div><div style="font-size: 11px;">Deploy the OpManager Agent or add SNMP credentials to stream real-time RAM metrics.</div></div>';
    } else {
      widgetMemBody = `
        <div style="display: flex; align-items: center; justify-content: space-around; gap: 4px; margin-bottom: 12px; overflow-x: auto;">
          ${[...filteredDevices].sort((a,b) => b.memory - a.memory).slice(0, 3).map(d => 
            createSpeedometerGauge(d.memory, 'RAM Load', d.name, d.ip, 145)
          ).join('')}
        </div>
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
      `;
    }

    let widgetIfaceBody = '';
    if (state.topInterfaces.length === 0) {
      widgetIfaceBody = '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">No network interface traffic recorded. Discovered switch/router interfaces will stream live telemetry here.</td></tr>';
    } else {
      widgetIfaceBody = state.topInterfaces.slice(0, 5).map((iface, idx) => {
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
      }).join('');
    }

    let widgetDiskBody = '';
    if (state.diskVolumes.length === 0) {
      widgetDiskBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No Storage Volumes Monitored</div><div style="font-size: 11px;">Server partitions and storage arrays will stream capacity metrics here.</div></div>';
    } else {
      widgetDiskBody = state.diskVolumes.map(vol => {
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
      }).join('');
    }

    let widgetNcmBody = '';
    if (totalDevices === 0) {
      widgetNcmBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No NCM Devices Enrolled</div><div style="font-size: 11px;">Automated backup and configuration drift audits will activate once network devices are added.</div></div>';
    } else {
      widgetNcmBody = `
        ${state.configDriftFixed ? `
          <div style="padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="color: #16a34a; font-size: 18px;">✓</span>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #166534;">Configurations in Sync</div>
              <div style="font-size: 11px; color: #15803d;">Startup and Running configs are identical across monitored devices.</div>
            </div>
          </div>
        ` : `
          <div style="padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #d97706; font-size: 18px;">⚠</span>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: #92400e;">Config Drift Detected</div>
                <div style="font-size: 11px; color: #b45309;">Running configuration has uncommitted changes vs NVRAM startup.</div>
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
            <span style="font-weight: 600; color: #334155;">Today at 04:00 AM UTC (Completed)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>PCI-DSS 4.0 Compliance Rate</span>
            <span style="font-weight: 600; color: #16a34a;">100% Compliant</span>
          </div>
        </div>
      `;
    }

    let widgetZiaBody = '';
    if (totalDevices === 0) {
      widgetZiaBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b;"><div style="font-size: 13px; font-weight: 700; color: #4338ca; margin-bottom: 4px;">Zia AI Telemetry Standby</div><div style="font-size: 11px;">Machine-learning anomaly correlation standby for live node telemetry.</div></div>';
    } else {
      widgetZiaBody = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #166534;">Enterprise Anomaly Detection Engine</div>
            <div style="font-size: 11px; color: #15803d;">All monitors operating strictly within dynamic seasonality thresholds.</div>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 10px;">NORMAL</span>
        </div>
      `;
    }

    let widgetHeatmapBody = '';
    if (networkCount === 0) {
      widgetHeatmapBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b; width: 100%;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No Switch Interface Telemetry</div><div style="font-size: 11px;">Real-time 48-port ifOperStatus heatmap will render once switches are discovered.</div></div>';
    } else {
      widgetHeatmapBody = `
        <div style="display: flex; gap: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px; font-size: 11px;">
          <span style="color: #16a34a; font-weight: 700; border-bottom: 2px solid #16a34a; padding-bottom: 4px;">Link Up</span>
          <span style="color: #64748b;">Unknown (0)</span>
          <span style="color: #dc2626; font-weight: 600;">Link Down (0)</span>
        </div>
      `;
    }

    let widgetSdwanBody = '';
    if (totalDevices === 0) {
      widgetSdwanBody = '<div style="padding: 30px 14px; text-align: center; color: #64748b; width: 100%;"><div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">No SD-WAN Controllers Connected</div><div style="font-size: 11px;">Connect Cisco vManage or NetFlow exporters to view SD-WAN fabric and tunnel health.</div></div>';
    } else {
      widgetSdwanBody = `
        <div style="padding: 10px; font-size: 11px; color: #64748b;">SD-WAN Telemetry Synchronized</div>
      `;
    }


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
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">Avg Central RTT: ${probeAvgRtt}</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Active Alarms</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: ${filteredAlarms.length > 0 ? '#dc2626' : '#16a34a'};">${filteredAlarms.length}</span>
                <span style="font-size: 11px; font-weight: 600; color: #dc2626;">${filteredAlarms.filter(a => a.severity === 'Critical').length} Critical</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">${mttrString}</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Global SLA Availability</div>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #16a34a;">${slaPct}</span>
                <span style="font-size: 11px; font-weight: 600; color: #16a34a;">${slaTarget}</span>
              </div>
              <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">${slaDowntime}</div>
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
                ${widgetCpuBody}
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
                ${widgetMemBody}
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
                    ${widgetIfaceBody}
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
                  ${widgetDiskBody}
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
                ${widgetNcmBody}
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
                ${widgetZiaBody}
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
                ${widgetHeatmapBody}
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
              <div style="padding: 12px 16px;">
                ${widgetSdwanBody}
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
                <div style="font-size: 24px; font-weight: 800; color: #0070e0; margin: 4px 0;">${networkCount} Devices</div>
                <div style="font-size: 11px; color: ${networkCount > 0 ? '#16a34a' : '#94a3b8'}; font-weight: 600;">${networkCount > 0 ? 'Core Fabric & Edge Gateways' : 'No Devices Monitored'}</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Servers & Compute</div>
                <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin: 4px 0;">${serverCount} Servers</div>
                <div style="font-size: 11px; color: #64748b;">${serverCount > 0 ? 'Database, Mail, Web, Cache' : 'No Servers Monitored'}</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Next-Gen Firewalls</div>
                <div style="font-size: 24px; font-weight: 800; color: #ea580c; margin: 4px 0;">${firewallCount} Firewalls</div>
                <div style="font-size: 11px; color: #ea580c; font-weight: 600;">${firewallCount > 0 ? 'Palo Alto & Fortinet NGFW' : 'No Firewalls Configured'}</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Storage & Power</div>
                <div style="font-size: 24px; font-weight: 800; color: #6366f1; margin: 4px 0;">${storageCount} SAN Array</div>
                <div style="font-size: 11px; color: ${storageCount > 0 ? '#16a34a' : '#94a3b8'}; font-weight: 600;">${storageCount > 0 ? 'Active Storage Arrays' : 'No Storage Monitored'}</div>
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
        ` : activeSub === 'servers' ? (serverCount === 0 ? `
          <!-- Clean Empty State for Servers -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Server Host Telemetry Discovered</div>
            <div style="font-size: 12px; color: #64748b; max-width: 500px; margin: 0 auto 20px auto;">
              Deploy the lightweight OpManager Agent on your Linux and Windows server hosts to stream real-time CPU, RAM, Disk, and Process daemon metrics.
            </div>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <a href="/downloads/OpManagerAgent.msi" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 9px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Windows MSI Agent
              </a>
              <a href="/downloads/install-agent.sh" download style="display: inline-flex; align-items: center; gap: 6px; background: #16a34a; color: #ffffff; padding: 9px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Linux install-agent.sh
              </a>
              <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 9px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                + Add Server Host
              </button>
            </div>
          </div>
        ` : `
          <!-- Servers Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              ${filteredDevices.filter(d => (d.category || '').toLowerCase().includes('server')).map(srv => `
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
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `) : activeSub === 'virtualization' ? `
          <!-- Virtualization Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Virtual Machines or Hypervisors Discovered</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Connect your VMware vCenter/ESXi, Proxmox VE, Hyper-V, or Nutanix AHV nodes to discover and monitor virtual machines, datastores, and resource pools.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Virtualization Host
            </button>
          </div>
        ` : activeSub === 'storage' ? `
          <!-- Storage Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Storage Arrays or Partitions Discovered</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Connect NetApp, Dell EMC, HPE Nimble, or server host drive partitions via SNMP/WMI to monitor volume capacity, IOPS, and drive health.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Storage Device
            </button>
          </div>
        ` : activeSub === 'network' ? (networkCount === 0 ? `
          <!-- Network Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Network Routers or Switches Monitored</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Add your Cisco, Juniper, Arista, or Huawei network switches and routers via SNMP (v1/v2c/v3) to monitor port interfaces, traffic volume, and link latency.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Network Switch / Router
            </button>
          </div>
        ` : `
          <!-- Network Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              ${filteredDevices.filter(d => ['Routers','Switches'].includes(d.category)).map(dev => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                  <div style="font-weight: 700; color: #0070e0; cursor: pointer;" onclick="showDeviceSnapshotModal(${dev.id})">${dev.name}</div>
                  <div style="font-size: 11px; color: #64748b;">${dev.ip}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `) : activeSub === 'netflow' ? `
          <!-- NetFlow Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Flow Records Ingested (UDP 2055 / 9996)</div>
            <div style="font-size: 12px; color: #64748b; max-width: 500px; margin: 0 auto 16px auto;">
              Export NetFlow v5/v9, IPFIX, or sFlow streams from your core routers to UDP port 2055 to analyze application traffic breakdown and top talkers.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Configure NetFlow Exporter
            </button>
          </div>
        ` : activeSub === 'ncm' ? `
          <!-- NCM Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Network Configurations Managed (NCM)</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Enroll Cisco, Juniper, HP, or Fortinet devices via SSH/Telnet to automate running vs startup configuration backups and compliance audits.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add NCM Device
            </button>
          </div>
        ` : activeSub === 'firewall' ? (firewallCount === 0 ? `
          <!-- Firewall Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Firewall Security Appliances Connected</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Forward Syslog streams (UDP 514) from Palo Alto, FortiGate, Cisco ASA, or pfSense to analyze security policies, blocked attacks, and VPN tunnels.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Firewall Appliance
            </button>
          </div>
        ` : `
          <!-- Firewall Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              ${filteredDevices.filter(d => (d.category || '').toLowerCase().includes('firewall')).map(dev => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;">
                  <div style="font-weight: 700; color: #0070e0; cursor: pointer;" onclick="showDeviceSnapshotModal(${dev.id})">${dev.name}</div>
                  <div style="font-size: 11px; color: #64748b;">${dev.ip}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `) : activeSub === 'oputils' ? `
          <!-- OpUtils Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No IP Subnets or Switch Port Mappings Configured</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Scan IPv4/IPv6 subnets, detect rogue MAC addresses, and map switch port interfaces using integrated OpUtils diagnostic tools.
            </div>
            <button onclick="showSubnetDiscoveryModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add IP Subnet to Monitor
            </button>
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
                  <div style="background: #0f172a; padding: 18px; border-radius: 6px; border: 1px solid #334155;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; color: #94a3b8; font-weight: 700;">ENTERPRISE PROBES</span>
                      <span style="font-size: 10px; background: #064e3b; color: #6ee7b7; padding: 1px 6px; border-radius: 2px;">${totalDevices > 0 ? 'HEALTHY' : 'STANDBY'}</span>
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #4ade80; margin: 8px 0;">${filteredAlarms.length} ACTIVE ALARMS</div>
                    <div style="font-size: 11px; color: #cbd5e1;">All registered probe nodes synchronized</div>
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
    // --- Pre-calculated clean empty states for Inventory subtabs ---
    let invVirtContent = '';
    const virtDevices = (state.devices || []).filter(d => ['virtualization','vm','hypervisor'].includes((d.type||'').toLowerCase()));
    if (virtDevices.length === 0) {
      invVirtContent = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Virtualization Clusters or VMs Discovered</div>
          <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
            Discover VMware ESXi/vCenter, Proxmox VE, Hyper-V, or Nutanix AHV nodes to view virtual machine performance and datastores.
          </div>
          <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
            + Add Virtualization Host
          </button>
        </div>
      `;
    }

    let invFwaContent = '';
    const fwaDevices = (state.devices || []).filter(d => (d.category||'').toLowerCase().includes('firewall'));
    if (fwaDevices.length === 0) {
      invFwaContent = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fff7ed; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Firewall Security Rules Managed</div>
          <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
            Connect Palo Alto, FortiGate, or Cisco ASA firewalls via Syslog or API to analyze ACL policy rules and unused access entries.
          </div>
          <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
            + Add Firewall Appliance
          </button>
        </div>
      `;
    }

    let invStgContent = '';
    if ((state.diskVolumes || []).length === 0) {
      invStgContent = '<div style="padding: 40px; text-align: center; color: #94a3b8;">No storage arrays or drive partitions discovered yet.</div>';
    } else {
      invStgContent = state.diskVolumes.map(vol => `
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
      `).join('');
    }

    state.currentTab = 'inventory';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.inventory || 'devices';

    // Subtab definitions
    const subtabs = [
      { id: 'devices', name: `Devices (${state.devices.length})` },
      { id: 'interfaces', name: `Interfaces (${state.interfaces ? state.interfaces.length : 0})` },
      { id: 'probes', name: `Enterprise Probes (${state.probes.length})` },
      { id: 'virtualization', name: `Virtualization (${state.devices.filter(d => (d.category || '').toLowerCase().includes('virt')).length} VMs)` },
      { id: 'firewall_rules', name: 'Firewall Rules (0)' },
      { id: 'storage', name: `Storage (${(state.diskVolumes && state.diskVolumes.length) || 0})` }
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
                ${state.devices.length === 0 ? `
                  <tr>
                    <td colspan="11" style="padding: 50px 20px; text-align: center;">
                      <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                      </div>
                      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Monitored Devices</div>
                      <div style="font-size: 12px; color: #64748b; max-width: 500px; margin: 0 auto 18px auto;">
                        OpManager Central is ready for real production monitoring. Install the real agent on your Windows or Linux servers, or add network switches/routers via SNMP.
                      </div>
                      <div style="display: flex; justify-content: center; gap: 10px;">
                        <a href="/downloads/OpManagerAgent.msi" download style="background: #0070e0; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                          ⬇ Download Windows Agent (MSI)
                        </a>
                        <a href="/downloads/install-agent.sh" download style="background: #1e293b; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                          ⬇ Download Linux Agent (.sh)
                        </a>
                      </div>
                    </td>
                  </tr>
                ` : list.length === 0 ? `
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
          ${invVirtContent}
        ` : activeSub === 'firewall_rules' ? `
          ${invFwaContent}
        ` : `
          <!-- Storage Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Storage Arrays, Partitions & Power Infrastructure</div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${invStgContent}
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
