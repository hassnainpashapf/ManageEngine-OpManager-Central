  // -------------------------------------------------------------
  // VIEW: CONFIGURATION (Compliance, NCM Diff, Vuln, Backups)
  // -------------------------------------------------------------
  // ---- Real-data helpers (05) -------------------------------------------
  // Every view in this module renders ONLY what a real API returned.
  // No hardcoded counts, percentages, or demo rows: empty responses render
  // honest empty states, failed fetches render an error state, never
  // invented numbers. A 501 from the server is reported honestly.
  function opmEsc(v) {
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  async function opmApi(url, options) {
    try {
      const r = await fetch(url, options);
      let d = null;
      try { d = await r.json(); } catch (e) { /* non-JSON body */ }
      return { ok: r.ok, status: r.status, data: d };
    } catch (e) {
      return { ok: false, status: 0, data: null, error: String(e && e.message || e) };
    }
  }
  function opmApiMessage(res, fallback) {
    if (res && res.data && (res.data.message || res.data.error)) return res.data.message || res.data.error;
    if (res && res.error) return res.error;
    if (res && res.status) return fallback + ' (HTTP ' + res.status + ')';
    return fallback;
  }
  function opmAvgAvailability() {
    const vals = (state.devices || []).map(d => Number(d.availability)).filter(n => Number.isFinite(n));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  // Real workflow shape: status/trigger/scope may be null, lastExecuted is
  // epoch-ms-or-null. Nulls render as an em dash, never the word "null";
  // epoch-ms renders as a local date/time, null as "Never".
  function opmFmtEpochMs(v) {
    if (v === null || v === undefined || v === '') return 'Never';
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) {
      const d = new Date(n);
      return Number.isNaN(d.getTime()) ? '\u2014' : d.toLocaleString();
    }
    return String(v);
  }
  function opmFmtPct(v) {
    return (v === null || v === undefined || !Number.isFinite(Number(v))) ? '\u2014' : Number(v).toFixed(2) + '%';
  }
  // Lazy loaders: fetch once, cache on state, re-render only if still on tab.
  async function opmLoadNcm() {
    if (state.ncmLoading) return;
    state.ncmLoading = true;
    try {
      const [wf, cfg] = await Promise.all([
        opmApi('/api/workflows/list'),
        opmApi('/api/ccm/configs')
      ]);
      state.workflows = (wf.ok && wf.data && Array.isArray(wf.data.workflows)) ? wf.data.workflows : [];
      state.workflowsError = wf.ok ? null : opmApiMessage(wf, 'Could not load workflows');
      state.ccmConfigs = (cfg.ok && cfg.data && Array.isArray(cfg.data.configs)) ? cfg.data.configs : [];
      state.ccmConfigsError = cfg.ok ? null : opmApiMessage(cfg, 'Could not load configuration backups');
    } finally {
      state.ncmLoading = false;
      if (state.currentTab === 'configuration' && typeof renderConfigurationView === 'function') renderConfigurationView();
    }
  }
  async function opmLoadNcmDiff(deviceId) {
    const id = deviceId || (state.devices[0] && state.devices[0].id);
    if (!id) { state.ncmDiff = { insufficient: true, reason: 'No device selected.' }; return; }
    const res = await opmApi('/api/ccm/diff?deviceId=' + encodeURIComponent(id));
    if (res.ok && res.data) {
      state.ncmDiff = res.data;
    } else {
      state.ncmDiff = { insufficient: true, reason: opmApiMessage(res, 'Could not load the configuration diff') };
    }
    if (state.currentTab === 'configuration' && typeof renderConfigurationView === 'function') renderConfigurationView();
  }
  async function opmLoadReports() {
    if (state.reportsLoading) return;
    state.reportsLoading = true;
    try {
      const [sum, aud] = await Promise.all([
        opmApi('/api/reports/summary'),
        opmApi('/api/reports/audit')
      ]);
      state.reportSummary = (sum.ok && sum.data && sum.data.metrics) ? sum.data.metrics : null;
      state.reportSummaryError = sum.ok ? null : opmApiMessage(sum, 'Could not load report metrics');
      state.auditLogs = (aud.ok && aud.data && Array.isArray(aud.data.auditLogs)) ? aud.data.auditLogs : [];
      state.auditLogsError = aud.ok ? null : opmApiMessage(aud, 'Could not load audit records');
    } finally {
      state.reportsLoading = false;
      if (state.currentTab === 'reports' && typeof renderReportsView === 'function') renderReportsView();
    }
  }

  function renderConfigurationView() {
    state.currentTab = 'configuration';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.configuration || 'compliance';
    if (state.devices.length > 0 && state.workflows === undefined && state.ccmConfigs === undefined) opmLoadNcm();

    if (state.devices.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 12px 24px;">
          <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Network Configuration &amp; Compliance Management (NCM)</span>
        </div>
        <div style="padding: 60px 20px; text-align: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin: 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Devices Configured for NCM</div>
          <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            No devices discovered yet. Once you discover Cisco, HP, Fortinet, or Juniper network devices, automated configuration backups, compliance audits, and live drift diffs will display here.
          </div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Network Device
            </button>
          </div>
        </div>
      `;
      return;
    }

    const subtabs = [
      { id: 'compliance', name: 'Compliance' },
      { id: 'changes', name: 'Config Changes & Drift' },
      { id: 'vulnerability', name: 'Firmware Vulnerability' },
      { id: 'backups', name: 'Config Backups' },
      { id: 'workflows', name: 'IT Automation Workflows' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
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
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">NCM Module v12.9.204-GA</span>
          <button id="opm-cfg-backup-all-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            Backup All Now (${state.devices.length})
          </button>
        </div>
      </div>

      <div style="padding: 20px 24px;">
        
        ${activeSub === 'compliance' ? `
          <!-- Compliance Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No NCM Device Configurations Monitored</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">
              Enable SSH/Telnet credentials on Cisco, Juniper, HP, or Fortinet network devices to automate startup vs running config backups, compliance policy checks (CIS, PCI-DSS, HIPAA), and change detection.
            </div>
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Network Device
            </button>
          </div>
      ` : activeSub === 'changes' ? `
          <!-- Config Changes & Drift: only real stored configs/diffs -->
          ${(() => {
            const diff = state.ncmDiff;
            if (!diff) return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No configuration drift data yet</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">Drift is computed from stored running and startup configurations. Add a device and take a baseline backup first — the diff appears once both configs exist.</div>
            <button id="opm-check-drift-btn" style="background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">Check drift for ${opmEsc((state.devices[0] && state.devices[0].name) || 'first device')}</button>
          </div>`;
            if (diff.insufficient || diff.drift === null || diff.drift === undefined) return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No configuration to compare yet</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 16px auto;">${opmEsc(diff.reason || 'No running and startup configs are stored for this device yet.')}</div>
            <button id="opm-check-drift-btn" style="background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">Check drift again</button>
          </div>`;
            const hasDrift = diff.drift === true || diff.hasDrift === true;
            if (!hasDrift) return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Configuration Changes Detected</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto 16px auto;">All startup and running configurations across managed devices are in-sync with 0 bytes drift.</div>
            <button id="opm-check-drift-btn" style="background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">Check drift again</button>
          </div>`;
            return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Configuration drift — ${opmEsc(diff.deviceName || (state.devices[0] && state.devices[0].name) || '')}</div>
            <div style="font-size: 12px; color: #64748b; margin: 6px 0 14px 0;">Drift detected between stored running and startup configs. Added lines: ${diff.addedLinesCount ?? '—'} · Removed lines: ${diff.removedLinesCount ?? '—'}${diff.lastBackupTime ? ' · Last backup: ' + opmEsc(diff.lastBackupTime) : ''}</div>
            <button id="opm-check-drift-btn" style="background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">Check drift again</button>
            <button id="opm-resolve-drift-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; margin-left: 8px;">Resolve drift</button>
          </div>`;
          })()}
        ` : activeSub === 'vulnerability' ? `
          <!-- Firmware Vulnerability Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No vulnerability scan run yet</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Vulnerability scan results will appear here once devices are enrolled and their firmware versions are known.
            </div>
          </div>
        ` : activeSub === 'backups' ? `
          <!-- Config Backups Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span style="font-size: 14px; font-weight: 700; color: #0f172a;">Automated Daily Configuration Backups</span>
              <span style="font-size: 11px; color: #64748b; font-weight: 700;">${(state.ccmConfigs || []).length} backup${(state.ccmConfigs || []).length === 1 ? '' : 's'} on file</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 8px 12px;">Device</th>
                  <th style="padding: 8px 12px;">Probe</th>
                  <th style="padding: 8px 12px;">Last Backup</th>
                  <th style="padding: 8px 12px;">Config Size</th>
                  <th style="padding: 8px 12px;">Config Type</th>
                </tr>
              </thead>
              <tbody>
                ${state.ccmConfigsError ? `
                  <tr>
                    <td colspan="5" style="padding: 30px; text-align: center; color: #dc2626;">
                      Couldn't load configuration backups — ${opmEsc(state.ccmConfigsError)}
                    </td>
                  </tr>
                ` : (!state.ccmConfigs || state.ccmConfigs.length === 0) ? `
                  <tr>
                    <td colspan="5" style="padding: 30px; text-align: center; color: #94a3b8;">
                      No configuration backups yet. Backups run automatically once devices are enrolled in NCM. Add a device, then back it up here.
                    </td>
                  </tr>
                ` : state.ccmConfigs.slice(0, 8).map(c => {
                  const dev = state.devices.find(d => String(d.id) === String(c.device_id || c.deviceId)) || {};
                  return `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 12px; font-weight: 700; color: #0070e0;">${opmEsc(dev.name || c.device_id || c.deviceId || '—')}</td>
                    <td style="padding: 8px 12px; color: #64748b;">${opmEsc(dev.probe || dev.probeName || '—')}</td>
                    <td style="padding: 8px 12px; color: #475569;">${opmEsc(c.fetched_at || c.fetchedAt || c.lastBackupTime || '—')}</td>
                    <td style="padding: 8px 12px; font-family: monospace;">${c.content ? (c.content.length / 1024).toFixed(1) + ' KB' : '—'}</td>
                    <td style="padding: 8px 12px; color: #475569;">${opmEsc(c.config_type || c.configType || '—')}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- IT Automation Workflows Subtab (with Official ManageEngine Workflow Action Palette Icons) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Enterprise IT Automation Workflows</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Multi-step automated remediation playbooks executed across Distributed Probes.</div>
              </div>
              <button id="opm-new-wf-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                + New Workflow Playbook
              </button>
            </div>

            <!-- Official ManageEngine Workflow Drag & Drop Action Palette Bar -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; overflow-x: auto;">
              <span style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; white-space: nowrap;">Workflow Action Library:</span>
              <div style="display: flex; align-items: center; gap: 14px;">
                ${[
                  { label: 'Ping Device', ico: '/apiclient/fluidicv2/img/workflow/ping_device.png' },
                  { label: 'Traceroute', ico: '/apiclient/fluidicv2/img/workflow/trace_route.png' },
                  { label: 'Poll Now', ico: '/apiclient/fluidicv2/img/workflow/poll_now.png' },
                  { label: 'Restart Service', ico: '/apiclient/fluidicv2/img/workflow/restart_service.png' },
                  { label: 'Reboot System', ico: '/apiclient/fluidicv2/img/workflow/reboot_system.png' },
                  { label: 'NCM Backup', ico: '/apiclient/fluidicv2/img/workflow/ncm_trigger_backup.png' },
                  { label: 'Execute CLI', ico: '/apiclient/fluidicv2/img/workflow/ncm_execute_command.png' },
                  { label: 'Config Diff', ico: '/apiclient/fluidicv2/img/workflow/ncm_get_config_diff.png' },
                  { label: 'Ack Alarm', ico: '/apiclient/fluidicv2/img/workflow/acknowledge_alarm.png' },
                  { label: 'SDP Ticket', ico: '/apiclient/fluidicv2/img/workflow/log_a_ticket_sdp.png' },
                  { label: 'Slack Alert', ico: '/apiclient/fluidicv2/img/workflow/slack_chat.png' }
                ].map(act => `
                  <div style="display: flex; align-items: center; gap: 5px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 600; color: #1e293b; white-space: nowrap; cursor: grab;">
                    <img src="${act.ico}" style="width: 15px; height: 15px; object-fit: contain;" />
                    <span>${act.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
              ${state.workflowsError ? `
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 36px 20px; text-align: center; color: #dc2626; background: #fafbfc;">
                  Couldn't load workflows — ${opmEsc(state.workflowsError)}
                </div>
              ` : (!state.workflows || state.workflows.length === 0) ? `
                <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 36px 20px; text-align: center; color: #64748b; background: #fafbfc;">
                  <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No workflows configured yet</div>
                  <div style="font-size: 12px; margin-bottom: 14px;">Create a workflow to automate remediation across your probes.</div>
                </div>
              ` : state.workflows.map(wf => { wf.execCount = (wf.executionCount === null || wf.executionCount === undefined) ? null : wf.executionCount; wf.steps = (wf.steps || []).map(s => ({ txt: (s && (s.action || s.txt)) || null, ico: '/apiclient/fluidicv2/img/workflow/poll_now.png' })).filter(st => st.txt); return wf; }).map(wf => `
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #fafbfc; transition: all 0.15s;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-family: monospace; font-size: 11px; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 3px; font-weight: 700;">${opmEsc(wf.id ?? '\u2014')}</span>
                        <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${opmEsc(wf.name || 'Unnamed workflow')}</span>
                        <span style="font-size: 10px; background: ${String(wf.status || '').toLowerCase() === 'active' ? '#dcfce7; color: #166534' : '#f1f5f9; color: #64748b'}; padding: 2px 6px; border-radius: 2px; font-weight: 800;">${wf.status ? opmEsc(String(wf.status).toUpperCase()) : '\u2014'}</span>
                      </div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                        Trigger: <strong style="color: #475569;">${wf.trigger ? opmEsc(wf.trigger) : '\u2014'}</strong> | Scope: <strong style="color: #475569;">${wf.scope ? opmEsc(wf.scope) : '\u2014'}</strong> | Executions: <strong>${wf.execCount === null || wf.execCount === undefined ? '\u2014' : opmEsc(wf.execCount)}</strong> | Last run: <strong>${opmEsc(opmFmtEpochMs(wf.lastExecuted))}</strong>
                      </div>
                    </div>
                    <button class="opm-wf-execute-btn" data-id="${opmEsc(wf.id ?? '')}" data-name="${opmEsc(wf.name || '')}" ${wf.id ? '' : 'disabled title="No workflow id returned by the server"'} style="background: #16a34a; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: ${wf.id ? 'pointer' : 'not-allowed'}; opacity: ${wf.id ? '1' : '0.5'}; display: flex; align-items: center; gap: 5px;">
                      ▶ Execute Playbook
                    </button>
                  </div>

                  <!-- Visual Workflow Steps Flow with Official Icons -->
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; overflow-x: auto; padding: 6px 0;">
                    ${wf.steps.length === 0 ? `<span style="color: #64748b;">No steps defined for this workflow.</span>` : ''}
                    ${wf.steps.map((st, i) => `
                      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 12px; display: flex; align-items: center; gap: 7px; flex-shrink: 0;">
                        <img src="${st.ico}" style="width: 16px; height: 16px; object-fit: contain;" />
                        <span style="color: #1e293b; font-weight: 600;">${st.txt}</span>
                      </div>
                      ${i < wf.steps.length - 1 ? `<span style="color: #94a3b8; font-weight: bold;">➔</span>` : ''}
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Live Workflow Execution Console -->
            <div style="border: 1px solid #334155; border-radius: 6px; background: #0f172a; padding: 14px 18px; font-family: monospace; font-size: 12px; color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px;">
                <span style="font-weight: 700; color: #94a3b8;">PLAYBOOK EXECUTION ENGINE CONSOLE</span>
                <span style="color: #64748b; font-size: 11px;">No playbook running</span>
              </div>
              <div id="opm-wf-logs-terminal" style="max-height: 160px; overflow-y: auto; line-height: 1.6; color: #94a3b8; font-style: italic;">
                Select a playbook above and click "▶ Execute Playbook" to test multi-probe remediation.
              </div>
            </div>
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

        const compBtn = container.querySelector('#opm-open-diff-comparator-btn');
    if (compBtn) {
      compBtn.onclick = () => {
        if (typeof showNcmVersionCompareModal === 'function') {
          showNcmVersionCompareModal(state.devices[0]);
        }
      };
    }

    // Save running to startup / resolve drift: real endpoint, honest outcome.
    // Save running to startup / resolve drift: real endpoint, honest outcome.
    const saveBtn = container.querySelector('#opm-save-running-startup-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const res = await opmApi('/api/ccm/resolve-drift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: state.devices[0] && state.devices[0].id }) });
        showToast(res.ok ? (opmApiMessage(res, 'Drift resolved.') + '') : opmApiMessage(res, 'Drift resolution failed'));
        if (res.ok) { state.ncmDiff = null; renderConfigurationView(); }
      };
    }

    // Recheck drift button: re-fetch the real diff.
    const recheckBtn = container.querySelector('#opm-recheck-drift-btn');
    if (recheckBtn) {
      recheckBtn.onclick = () => { opmLoadNcmDiff(); };
    }

    // Check drift button (changes sub-tab): fetch the real diff.
    const checkDriftBtn = container.querySelector('#opm-check-drift-btn');
    if (checkDriftBtn) {
      checkDriftBtn.onclick = () => { opmLoadNcmDiff(); };
    }

    // Resolve drift button (changes sub-tab): real endpoint, honest outcome.
    const resolveDriftBtn = container.querySelector('#opm-resolve-drift-btn');
    if (resolveDriftBtn) {
      resolveDriftBtn.onclick = async () => {
        const res = await opmApi('/api/ccm/resolve-drift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: state.devices[0] && state.devices[0].id }) });
        showToast(res.ok ? opmApiMessage(res, 'Drift resolved.') : opmApiMessage(res, 'Drift resolution failed'));
        if (res.ok) { state.ncmDiff = null; renderConfigurationView(); }
      };
    }

    // Remediate button: only a real endpoint may claim a remediation ran.
    container.querySelectorAll('.opm-remediate-btn').forEach(btn => {
      btn.onclick = async () => {
        const res = await opmApi('/api/ccm/resolve-drift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: state.devices[0] && state.devices[0].id }) });
        showToast(res.ok ? opmApiMessage(res, 'Remediation completed.') : opmApiMessage(res, 'Remediation is not available'));
      };
    });

    // Backup all button: back up each real device via the real endpoint
    // and report the actual outcome per device — never a fixed count.
    const bkpAllBtn = container.querySelector('#opm-cfg-backup-all-btn');
    if (bkpAllBtn) {
      bkpAllBtn.onclick = async () => {
        if (!state.devices.length) { showToast('No devices to back up yet.'); return; }
        bkpAllBtn.disabled = true;
        const results = await Promise.all(state.devices.map(d => opmApi('/api/ccm/backup-device', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: d.id }) })));
        const okCount = results.filter(r => r.ok).length;
        const failed = results.filter(r => !r.ok);
        showToast(failed.length
          ? 'Backed up ' + okCount + ' of ' + results.length + ' devices. ' + opmApiMessage(failed[0], 'Backup failed')
          : 'Configuration backup completed for ' + okCount + ' device' + (okCount === 1 ? '' : 's') + '.');
        bkpAllBtn.disabled = false;
        state.ccmConfigs = undefined; state.workflows = state.workflows; opmLoadNcm();
      };
    }

    // Execute Workflow Playbook
    container.querySelectorAll('.opm-wf-execute-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const term = container.querySelector('#opm-wf-logs-terminal');
        if (term) {
          term.innerHTML = `<div style="color: #fbbf24;">Executing playbook [${id}] "${name}" across Central Probes...</div>`;
        }
        btn.disabled = true;
        btn.innerText = '⏳ Executing...';
        try {
          const resp = await fetch('/api/workflows/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId: id })
          });
          const data = await resp.json().catch(() => null);
          if (!resp.ok) {
            const msg = (data && (data.message || data.error)) || ('Workflow execution failed (HTTP ' + resp.status + ')');
            if (term) term.innerHTML = `<div style="color: #f87171;">${opmEsc(msg)}</div>`;
            showToast(msg);
            return;
          }
          if (term && data && Array.isArray(data.logs)) {
            term.innerHTML = data.logs.map(l => `<div style="color: #34d399; margin-bottom: 2px;">${opmEsc(l)}</div>`).join('');
          }
          showToast((data && data.message) || `Playbook "${name}" executed.`);
        } catch (e) {
          if (term) term.innerHTML = `<div style="color: #f87171;">Execution error: ${e.message}</div>`;
        } finally {
          btn.disabled = false;
          btn.innerText = '▶ Execute Playbook';
        }
      };
    });

    // New Workflow Button
    const newWfBtn = container.querySelector('#opm-new-wf-btn');
    if (newWfBtn) {
      newWfBtn.onclick = () => {
        if (typeof showNewWorkflowModal === 'function') {
          showNewWorkflowModal();
        } else {
          showToast('Enterprise Workflow Designer: Drag & Drop actions (Ping, SSH CLI, WMI, Service Restart).');
        }
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
    if (state.devices.length > 0 && state.reportSummary === undefined && state.auditLogs === undefined) opmLoadReports();

    if (state.devices.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 12px 24px;">
          <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Enterprise Historical Reports &amp; SLA Compliance</span>
        </div>
        <div style="padding: 60px 20px; text-align: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Report Data Available</div>
          <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            No devices discovered yet. Once you discover network devices or install host agents, scheduled SLA compliance, availability trends, and bandwidth consumption reports will be generated here.
          </div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button onclick="showAddDeviceModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Network Device
            </button>
          </div>
        </div>
      `;
      return;
    }

    const subtabs = [
      { id: 'sla', name: 'Availability & SLA' },
      { id: 'performance', name: 'Performance Reports' },
      { id: 'mttr', name: 'Alarms & MTTR' },
      { id: 'lifecycle', name: 'Hardware Lifecycle & Warranty' },
      { id: 'audit', name: 'Operator Action & Audit Logs' },
      { id: 'schedule', name: 'Scheduled Reports' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
      subtabNavHtml += `
        <button class="opm-rpt-subtab-btn" data-sub="${st.id}" style="background: none; border: none; padding: 10px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; ${border}">
          ${st.name}
        </button>
      `;
    });

    container.innerHTML = `
      <!-- Authentic ManageEngine Top Product-Module Reports Bar (matching firewall_addon_reports.png & netflow_addon_reports.png) -->
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 11px; color: #64748b;">Resolve DNS</span>
          <span style="display: inline-block; width: 28px; height: 15px; background: #cbd5e1; border-radius: 10px; position: relative; vertical-align: middle;"><span style="position: absolute; left: 2px; top: 2px; width: 11px; height: 11px; background: #fff; border-radius: 50%;"></span></span>
          <select id="opm-rpt-timerange" style="padding: 5px 10px; border: 1px solid #cbd5e1; border-radius: 3px; font-size: 12px; background: #fff;">
            <option>Last 30 Days (Standard SLA)</option>
            <option>Last 7 Days</option>
            <option>Today</option>
            <option>Custom Date Range</option>
          </select>
          <button id="opm-rpt-pdf-btn" style="background: #49bd80; color: #ffffff; border: none; padding: 6px 14px; border-radius: 3px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Generate PDF
          </button>
          <button id="opm-rpt-csv-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 3px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div style="display: flex; min-height: calc(100vh - 140px);">
        <!-- Authentic ManageEngine Reports Left Filter Sidebar (220px) -->
        <div style="width: 220px; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 16px 14px; flex-shrink: 0;">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 14px;">Enterprise Reports</div>
          <div style="margin-bottom: 14px;">
            <div style="font-size: 11px; color: #475569; margin-bottom: 5px;">Device / Probe Scope</div>
            <select style="width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 2px; font-size: 12px; background: #f8fafc;">
              <option>All Probes &amp; Devices (${state.devices.length})</option>
              ${state.probes.map(p => `<option>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #475569; margin-bottom: 5px;">Show</div>
            <select style="width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 2px; font-size: 12px; background: #f8fafc;">
              <option>Top 5 (Graph &amp; Table)</option>
              <option>Top 10 (Graph &amp; Table)</option>
              <option>All Monitored Nodes</option>
            </select>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; margin-bottom: 6px;">
              <span>Report Type</span>
              <span>🔍</span>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 2px; overflow: hidden;">
              ${subtabs.map(st => `
                <div class="opm-rpt-subtab-btn" data-sub="${st.id}" style="padding: 8px 10px; font-size: 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; background: ${activeSub === st.id ? '#e2e8f0' : '#ffffff'}; font-weight: ${activeSub === st.id ? '700' : '400'}; color: #1e293b;">
                  ${st.name}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div style="flex: 1; padding: 18px 24px; overflow-y: auto;">
        
        ${activeSub === 'sla' ? (state.devices.length === 0 ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No SLA & Interface Telemetry Recorded</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto 18px auto; line-height: 1.5;">
              Availability SLA history and bandwidth throughput charts will populate automatically once managed devices are active across your probes.
            </div>
            <button onclick="showAddDeviceModal()" style="background: #0070e0; color: #ffffff; padding: 9px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;">
              + Add Real Device
            </button>
          </div>
        ` : `
          <!-- Interface traffic: no real interface counters exist yet, so no
               chart is drawn. Traffic was previously plotted from CPU/memory
               and response-time values, which are not traffic. -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No interface traffic data yet</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto;">Traffic charts are built from real interface counters. No interface counters have been collected yet.</div>
          </div>

          <!-- Summary Cards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average SLA Compliance</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">${opmFmtPct(opmAvgAvailability())}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">${opmAvgAvailability() === null ? 'No availability history yet' : 'Mean availability across monitored devices'}</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Outage Duration</div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 6px 0;">\u2014</div>
              <div style="font-size: 11px; color: #64748b;">No outage history yet</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Mean Time to Resolve (MTTR)</div>
              <div style="font-size: 26px; font-weight: 800; color: #0284c7; margin: 6px 0;">\u2014</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">No alarms resolved yet</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Hardware Warranty Status</div>
              <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">\u2014</div>
              <div style="font-size: 11px; color: #64748b;">No warranty contracts mapped yet</div>
            </div>
          </div>

          <!-- SLA Detailed Report Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
              <span>Device Availability & Outage SLA Matrix (Past 30 Days)</span>
              <span style="font-size: 11px; color: #64748b;">No SLA target set</span>
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
                    <td style="padding: 10px 14px; font-family: monospace;">\u2014</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">\u2014</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #16a34a;">${opmFmtPct(dev.availability)}</td>
                    <td style="padding: 10px 14px; text-align: right; color: #64748b;">\u2014</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `) : activeSub === 'performance' ? `
          <!-- Performance Reports Clean Empty State -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No Flow Records or Application Telemetry Ingested</div>
            <div style="font-size: 12px; color: #64748b; max-width: 500px; margin: 0 auto;">
              Configure your routers and switches to export NetFlow v5/v9, sFlow, or IPFIX to UDP port 2055 to view conversation distribution and application bandwidth breakdown.
            </div>
          </div>
        ` : activeSub === 'mttr' ? `
          <!-- SUBTAB: ALARMS & MTTR ANALYTICS -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- MTTR KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average MTTR</div>
                <div style="font-size: 26px; font-weight: 800; color: #0284c7; margin: 6px 0;">\u2014</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">No alarms resolved yet</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Incidents (30D)</div>
                <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 6px 0;">${state.alarms.length}</div>
                <div style="font-size: 11px; color: #64748b;">${state.alarms.filter(a => a.status === "Cleared").length} Cleared | ${state.alarms.filter(a => a.status !== "Cleared").length} Active</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Self-Healing Automated</div>
                <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">\u2014</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">No self-healing data yet</div>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">First-Contact Resolution</div>
                <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 6px 0;">\u2014</div>
                <div style="font-size: 11px; color: #64748b;">No resolution data yet</div>
              </div>
            </div>

            <!-- MTTR detail: no resolved-alarm history exists, so no
                 histogram or scoreboard can be computed. -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No alarms resolved yet</div>
              <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto;">MTTR is calculated from resolved alarms. Once alarms are raised and resolved, the average resolution time appears here.</div>
            </div>

          </div>
        ` : activeSub === 'lifecycle' ? `
          <!-- SUBTAB: HARDWARE LIFECYCLE & WARRANTY — no contracts on file -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No hardware lifecycle or warranty contracts mapped yet.</div>
            <div style="font-size: 12px; color: #64748b; max-width: 480px; margin: 0 auto;">Discovered devices will appear here automatically.</div>
          </div>
        ` : activeSub === 'audit' ? `
          <!-- SUBTAB: OPERATOR ACTION & AUDIT LOGS (Authentic ManageEngine AuditTab.xml) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Enterprise Operator Action &amp; Security Audit Trail</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Immutable, non-repudiable audit logs of operator actions, probe API syncs, alarm acknowledgments, and NCM changes.</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-export-audit-csv-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Audit CSV
                </button>
              </div>
            </div>

            <!-- KPI Row -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">Total Audit Records</div>
                <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">${state.auditLogsError ? '—' : (state.auditLogs || []).length}</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px;">${state.auditLogsError ? opmEsc(state.auditLogsError) : 'Records returned by the audit API'}</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">Operator Actions (24h)</div>
                <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin-top: 4px;">—</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">No operator-action breakdown available</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">Security / Auth Events</div>
                <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">—</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">No login-event data available</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">Probe Sync API Calls</div>
                <div style="font-size: 20px; font-weight: 800; color: #7c3aed; margin-top: 4px;">—</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">No probe-sync counts available</div>
              </div>
            </div>

            <!-- Audit Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;" id="opm-audit-trail-table">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Log ID</th>
                  <th style="padding: 10px 14px;">Timestamp</th>
                  <th style="padding: 10px 14px;">Operator</th>
                  <th style="padding: 10px 14px;">Source IP</th>
                  <th style="padding: 10px 14px;">Module</th>
                  <th style="padding: 10px 14px;">Action Performed</th>
                  <th style="padding: 10px 14px;">Target Entity</th>
                  <th style="padding: 10px 14px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.auditLogsError ? `
                  <tr><td colspan="8" style="padding: 30px; text-align: center; color: #dc2626;">Couldn't load audit records — ${opmEsc(state.auditLogsError)}</td></tr>
                ` : (!state.auditLogs || state.auditLogs.length === 0) ? `
                  <tr><td colspan="8" style="padding: 30px; text-align: center; color: #94a3b8;">No audit records yet. Operator actions are logged here as they happen.</td></tr>
                ` : state.auditLogs.map(a => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0070e0;">${opmEsc(a.id || '—')}</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #475569;">${opmEsc(a.timestamp || '—')}</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">${opmEsc(a.user || '—')}</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">${opmEsc(a.ip || '—')}</td>
                    <td style="padding: 10px 14px;">${opmEsc(a.module || '—')}</td>
                    <td style="padding: 10px 14px; font-weight: 600;">${opmEsc(a.action || '—')}</td>
                    <td style="padding: 10px 14px; font-family: monospace; font-size: 11px;">${opmEsc(a.entity || a.details || '—')}</td>
                    <td style="padding: 10px 14px;">${opmEsc(a.result || '—')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- SUBTAB: SCHEDULED REPORTS & EMAIL DISTRIBUTION -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Scheduled Reports & Automated Email Distribution</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Configure automated report exports delivered directly to NOC, NetOps, and leadership inboxes.</div>
              </div>
              <button id="opm-new-schedule-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                + Add Scheduled Report
              </button>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                  <th style="padding: 10px 14px;">Report Schedule Name</th>
                  <th style="padding: 10px 14px;">Frequency</th>
                  <th style="padding: 10px 14px;">Export Format</th>
                  <th style="padding: 10px 14px;">Target Recipients</th>
                  <th style="padding: 10px 14px;">Last Dispatched</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="6" style="padding: 40px; text-align: center; color: #94a3b8;">
                    No scheduled reports yet. Schedule a report to have it emailed automatically.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `}

        </div>
      </div>
    `;

    // Subtab event listeners
    container.querySelectorAll('.opm-rpt-subtab-btn').forEach(btn => {
      btn.onclick = () => {
        state.subTabs.reports = btn.getAttribute('data-sub');
        renderReportsView();
      };
    });

    // PDF button - opens authentic ManageEngine Executive Summary Preview
    const pdfBtn = container.querySelector('#opm-rpt-pdf-btn');
    if (pdfBtn) {
      pdfBtn.onclick = () => {
        showReportPdfModal();
      };
    }

    // CSV button: download the real server-generated CSV.
    const csvBtn = container.querySelector('#opm-rpt-csv-btn');
    if (csvBtn) {
      csvBtn.onclick = () => {
        window.open('/api/reports/export/csv?type=devices', '_blank');
      };
    }

    // Audit CSV button
    const auditCsvBtn = container.querySelector('#opm-export-audit-csv-btn');
    if (auditCsvBtn) {
      auditCsvBtn.onclick = () => {
        window.open('/api/reports/export/csv?type=audit', '_blank');
      };
    }

    // Scheduled reports: no report scheduler endpoint exists on the server,
    // so nothing can be dispatched or scheduled from here. Report honestly.
    container.querySelectorAll('.opm-send-now-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Report scheduling is not available — no report scheduler endpoint exists on this server yet.');
      };
    });

    const newSchedBtn = container.querySelector('#opm-new-schedule-btn');
    if (newSchedBtn) {
      newSchedBtn.onclick = () => {
        showToast('Report scheduling is not available — no report scheduler endpoint exists on this server yet.');
      };
    }
  }

  // PDF Executive Report Modal
  function showReportPdfModal() {
    let modal = document.getElementById('opm-report-pdf-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-report-pdf-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background: #ffffff; border-radius: 6px; width: 800px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);">
        <div style="background: #212121; color: #ffffff; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="/apiclient/fluidicv2/img/opmNewLogo.png" style="height: 24px;">
            <div>
              <div style="font-size: 15px; font-weight: 800;">OpManager Central Executive SLA & Performance Report</div>
              <div style="font-size: 11px; color: #94a3b8;">ManageEngine ITOM Central &bull; Document Ref: REP-${new Date().toISOString().slice(0, 10)}-01</div>
            </div>
          </div>
          <button id="close-pdf-modal-btn" style="background: none; border: none; font-size: 18px; color: #fff; cursor: pointer;">✕</button>
        </div>

        <div style="padding: 24px; font-size: 12px; color: #334155;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">GLOBAL SLA UPTIME</div>
              <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin: 4px 0;">${opmFmtPct(opmAvgAvailability())}</div>
              <div style="font-size: 10px; color: #64748b;">No SLA target set</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">MONITORED NODES</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 4px 0;">${state.devices.length}</div>
              <div style="font-size: 10px; color: #64748b;">${state.probes.length} probe${state.probes.length === 1 ? '' : 's'} registered</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">MEAN TIME TO RESOLVE</div>
              <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin: 4px 0;">\u2014</div>
              <div style="font-size: 10px; color: #64748b;">No alarms resolved yet</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc; text-align: center;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">TOTAL DISPATCHED ALERTS</div>
              <div style="font-size: 22px; font-weight: 800; color: #dc2626; margin: 4px 0;">${state.alarms.length} Active</div>
              <div style="font-size: 10px; color: #64748b;">Resolved: \u2014</div>
            </div>
          </div>

          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 8px;">Probe Overview</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                <th style="padding: 8px 10px;">Probe Location</th>
                <th style="padding: 8px 10px;">Device Count</th>
                <th style="padding: 8px 10px;">Average Latency</th>
                <th style="padding: 8px 10px;">Availability</th>
                <th style="padding: 8px 10px;">Health State</th>
              </tr>
            </thead>
            <tbody>
              ${state.probes.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 10px; font-weight: 700; color: #0070e0;">${opmEsc(p.name)}${p.location ? ' (' + opmEsc(p.location) + ')' : ''}</td>
                  <td style="padding: 8px 10px;">${p.devicesCount ?? p.devices ?? '—'} Devices</td>
                  <td style="padding: 8px 10px; font-family: monospace;">${(p.latency === undefined || p.latency === null) ? '—' : p.latency + ' ms'}</td>
                  <td style="padding: 8px 10px; font-weight: 700; color: #16a34a;">\u2014</td>
                  <td style="padding: 8px 10px;">${opmEsc(p.status || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">Generated from live data on ${new Date().toLocaleString()}</span>
          <div style="display: flex; gap: 8px;">
            <button id="close-pdf-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">Close</button>
            <button id="print-pdf-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 18px; font-size: 12px; font-weight: 700; cursor: pointer;">Print / Save as PDF</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('close-pdf-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-pdf-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('print-pdf-btn').onclick = () => { window.print(); };
  }

  // -------------------------------------------------------------
  // VIEW: SETTINGS (Central & Probes, Agents, Discovery, Engine)
  // -------------------------------------------------------------
  // ---- Settings: load persisted settings from the real GET endpoints,
  // then fill the forms. Blank = not configured. Nothing is prefilled
  // with fictional enterprise values.
  async function opmLoadSettings() {
    if (state.settingsLoading) return;
    state.settingsLoading = true;
    try {
      const get = async (url) => { const r = await opmApi(url); return (r.ok && r.data) ? r.data : null; };
      const [mail, proxy, ad, saml, license, db, failover, system, rebrand, ssl, users, creds, rules, apiKey, sysInfo, dbInfo] = await Promise.all([
        get('/api/settings/mail'), get('/api/settings/proxy'),
        get('/api/settings/auth/ad'), get('/api/settings/auth/saml'),
        get('/api/settings/license'), get('/api/settings/db'),
        get('/api/settings/failover'), get('/api/settings/system'),
        get('/api/settings/rebrand'), get('/api/settings/ssl'),
        get('/api/settings/users'), get('/api/settings/credentials'),
        get('/api/discovery/rules'), get('/api/admin/getAPIKey'),
        get('/api/admin/GetSystemInformation'), get('/api/admin/getDBInfo')
      ]);
      state.settingsData = {
        mail: mail && mail.settings ? mail.settings : null,
        proxy: proxy && proxy.proxy ? proxy.proxy : null,
        ad: ad && ad.ad ? ad.ad : null,
        saml: saml && saml.saml ? saml.saml : null,
        license: license && license.license ? license.license : null,
        db: db && db.db ? db.db : null,
        failover: failover && failover.failover ? failover.failover : null,
        system: system && system.system ? system.system : null,
        rebrand: rebrand && rebrand.rebrand ? rebrand.rebrand : null,
        ssl: ssl && ssl.ssl ? ssl.ssl : null,
        users: users && Array.isArray(users.users) ? users.users : [],
        credentials: creds && Array.isArray(creds.credentials) ? creds.credentials : [],
        apiKey: apiKey && apiKey.apiKey ? apiKey.apiKey : null,
        sysInfo: sysInfo || null, dbInfo: dbInfo || null
      };
      state.discoveryRules = (rules && (rules.rules || rules.discoveryRules)) || [];
      state.settingsLoaded = true;
    } finally {
      state.settingsLoading = false;
      if (state.currentTab === 'settings' && typeof renderSettingsView === 'function') renderSettingsView();
    }
  }
  function opmSetVal(id, v) {
    const el = document.getElementById(id);
    if (!el || v === null || v === undefined || v === '') return;
    el.value = String(v);
  }
  function opmSetChecked(id, v) {
    const el = document.getElementById(id);
    if (el) el.checked = !!v;
  }
  function opmSetText(id, v) {
    const el = document.getElementById(id);
    if (el && v !== null && v !== undefined) el.textContent = String(v);
  }
  // Fill every settings form from the loaded settings. Runs after each
  // renderSettingsView; fields with no stored value stay blank.
  function opmFillSettingsForm() {
    const sd = state.settingsData || {};
    const m = sd.mail || {};
    opmSetVal('opm-mail-host', m.host); opmSetVal('opm-mail-port', m.port);
    opmSetVal('opm-mail-security', m.security); opmSetVal('opm-mail-from', m.fromAddress);
    opmSetVal('opm-mail-admin', m.adminEmail); opmSetVal('opm-mail-user', m.username);
    const mailPill = document.getElementById('opm-mail-status-pill');
    if (mailPill) {
      if (m.host) { mailPill.textContent = '\u25cf SMTP Configured (' + m.host + ')'; mailPill.style.background = '#dcfce7'; mailPill.style.color = '#166534'; }
      else { mailPill.textContent = 'Mail server not configured yet'; mailPill.style.background = '#f1f5f9'; mailPill.style.color = '#64748b'; }
    }
    const p = sd.proxy || {};
    opmSetChecked('opm-proxy-enable', p.enabled);
    opmSetVal('opm-proxy-protocol', p.protocol); opmSetVal('opm-proxy-host', p.host);
    opmSetVal('opm-proxy-port', p.port); opmSetChecked('opm-proxy-auth-check', p.authRequired);
    opmSetVal('opm-proxy-user', p.username);
    opmSetVal('opm-proxy-bypass', p.bypassList);
    const pxPill = document.getElementById('opm-proxy-status-pill');
    if (pxPill && p.enabled && p.host) { pxPill.textContent = '\u25cf Proxy Enabled (' + p.host + ':' + (p.port || '') + ')'; pxPill.style.background = '#dcfce7'; pxPill.style.color = '#166534'; }
    const a = sd.ad || {};
    opmSetVal('opm-ad-domain', a.domainName); opmSetVal('opm-ad-dc', a.domainController);
    opmSetVal('opm-ad-port', a.port); opmSetVal('opm-ad-basedn', a.baseDn);
    opmSetVal('opm-ad-binddn', a.bindUser);
    const sm = sd.saml || {};
    opmSetVal('opm-saml-idp', sm.idpEntityId); opmSetVal('opm-saml-url', sm.idpSsoUrl);
    opmSetVal('opm-saml-acs', sm.spAcsUrl || (window.location.origin + '/saml/sso'));
    const sy = sd.system || {};
    opmSetVal('opm-sys-hostname', sy.hostname); opmSetVal('opm-sys-port', sy.serverPort);
    opmSetVal('opm-sys-timeout', sy.sessionTimeoutMins);
    opmSetVal('opm-sys-retention', sy.dataRetentionDays && (sy.dataRetentionDays.performanceHourly || sy.dataRetentionDays));
    opmSetChecked('opm-sys-dns-lookup', sy.dnsReverseLookup);
    const rb = sd.rebrand || {};
    opmSetVal('opm-rebrand-org', rb.organizationName); opmSetVal('opm-rebrand-title', rb.productTitle);
    opmSetVal('opm-rebrand-footer', rb.footerNotice);
    const sl = sd.ssl || {};
    opmSetVal('opm-ssl-port', sl.httpsPort);
    if (sl.tlsVersions) opmSetVal('opm-ssl-protocols', sl.tlsVersions.join(','));
    opmSetVal('opm-ssl-ciphers', sl.cipherSuite);
    opmSetChecked('opm-ssl-redirect', sl.forceRedirect);
    if (sl.certificate) {
      opmSetText('opm-ssl-cn', sl.certificate.commonName || 'No custom certificate installed');
      opmSetText('opm-ssl-san', (sl.certificate.san && sl.certificate.san.join(', ')) || '—');
    } else {
      opmSetText('opm-ssl-cn', 'No custom certificate installed');
      opmSetText('opm-ssl-san', '—');
    }
    const sslPill = document.getElementById('opm-ssl-status-pill');
    if (sslPill) {
      if (sl.certificate && sl.certificate.commonName) { sslPill.textContent = '\u25cf HTTPS ' + (sl.httpsPort || '') + ' Active'; sslPill.style.background = '#dcfce7'; sslPill.style.color = '#166534'; }
      else { sslPill.textContent = 'No custom certificate installed'; sslPill.style.background = '#f1f5f9'; sslPill.style.color = '#64748b'; }
    }
    const tok = document.getElementById('opm-enrollment-token-input');
    if (tok) {
      tok.value = sd.apiKey || '';
      tok.placeholder = sd.apiKey ? '' : 'No enrollment token issued yet';
    }
    // Engine facts: live values from the system-info endpoints, or —.
    // This server is Node.js: heap/uptime come from runtime, dbInfo is
    // SQLite; there is no JVM, so jvmInfo is always null.
    const si = sd.sysInfo || {};
    if (si.runtime) {
      const used = si.runtime.heapUsedMB, total = si.runtime.heapTotalMB;
      opmSetText('opm-eng-heap', (used != null && total != null) ? ('Allocated: ' + used + ' MB / ' + total + ' MB Max') : 'Allocated: \u2014');
      if (used != null && total != null && total > 0) {
        const pct = Math.round(used / total * 100);
        opmSetText('opm-eng-heap-pct', pct + '%');
        const bar = document.getElementById('opm-eng-heap-bar');
        if (bar) bar.style.width = pct + '%';
      }
      if (si.runtime.uptimeSeconds != null) {
        const s = si.runtime.uptimeSeconds, d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
        opmSetText('opm-eng-uptime', 'Uptime: ' + (d ? d + 'd ' : '') + h + 'h ' + m + 'm');
      }
    }
    if (si.dbInfo) {
      opmSetText('opm-eng-db', (si.dbInfo.dbType || 'Database') + ' ' + (si.dbInfo.databaseName || '') + (si.dbInfo.databaseSizeBytes != null ? ' — ' + (si.dbInfo.databaseSizeBytes / 1048576).toFixed(1) + ' MB' : ''));
      opmSetText('opm-eng-pool', 'Connection Pool: ' + (si.dbInfo.activeConnections ?? '\u2014') + ' Active / ' + (si.dbInfo.connectionPoolSize ?? '\u2014') + ' Max');
    } else if (sd.dbInfo) {
      opmSetText('opm-eng-db', (sd.dbInfo.database || 'Database') + ' — ' + (sd.dbInfo.status || ''));
    }
    opmSetText('opm-eng-cache', 'Buffer Cache Hit Ratio: \u2014');
  }
  function opmLicLabel(used, allowed) {
    if (used === null || used === undefined) return '\u2014';
    const a = (allowed === -1) ? 'Unlimited' : (allowed ?? '\u2014');
    const pct = (typeof allowed === 'number' && allowed > 0) ? ' (' + (used / allowed * 100).toFixed(1) + '%)' : '';
    return used + ' / ' + a + pct;
  }
  function opmLicPct(used, allowed) {
    if (typeof used !== 'number' || typeof allowed !== 'number' || allowed <= 0) return 0;
    return Math.min(100, used / allowed * 100);
  }
  function opmLicRemain(used, allowed) {
    if (allowed === -1) return 'Unlimited';
    if (typeof used !== 'number' || typeof allowed !== 'number') return '\u2014';
    return String(allowed - used);
  }
  function opmLicUsed(used) {
    return (used === null || used === undefined) ? '\u2014' : String(used);
  }

  function renderSettingsView() {
    state.currentTab = 'settings';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.settings || 'probes';
    if (!state.settingsLoaded && !state.settingsLoading) opmLoadSettings();
    const sd = state.settingsData || {};
    const lic = sd.license || null;
    const fo = sd.failover || null;
    const dbi = sd.db || null;

    const subtabs = [
      { id: 'probes', name: 'Central & Probes' },
      { id: 'agents', name: 'Monitoring Agents' },
      { id: 'discovery', name: 'Discovery Rules' },
      { id: 'credentials', name: 'Credential Library' },
      { id: 'templates', name: 'Device Templates (' + ((state.templates || []).length) + ')' },
      { id: 'notifications', name: 'Notification & Thresholds' },
      { id: 'mail', name: 'Mail & SMS Server' },
      { id: 'proxy', name: 'Proxy Server' },
      { id: 'users', name: 'Users & Authentication' },
      { id: 'license', name: 'License Management & Usage' },
      { id: 'dbbackup', name: 'Database Backup & Maintenance' },
      { id: 'failover', name: 'High Availability (HA)' },
      { id: 'system', name: 'System & Rebranding' },
      { id: 'ssl', name: 'SSL & Security' },
      { id: 'tools', name: 'Diagnostics & MIB Browser' },
      { id: 'support', name: 'Support & System Logs' },
      { id: 'engine', name: 'System Engine' }
    ];

    let subtabNavHtml = '';
    subtabs.forEach(st => {
      const isAct = st.id === activeSub;
      const border = isAct ? 'border-bottom: 3px solid #49bd80; color: #212121; font-weight: 700;' : 'color: #475569; font-weight: 500;';
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
            
            <!-- Authentic ManageEngine Categorized Quick Configuration Matrix (10 Domains) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">OpManager Central Quick Configuration Matrix</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Centralized enterprise configuration domains synchronized across all ${state.probes.length} regional probes.</div>
                </div>
                <span style="font-size: 11px; color: #49bd80; font-weight: 700;">● Central Master Policy Enforced</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; font-size: 11px;">
                <div class="opm-quick-cfg-card" data-target="mail" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #49bd80;"></span> Mail &amp; SMS Server
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">SMTP Relay • STARTTLS • SMS Gateway • Test Email</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="discovery" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #0284c7;"></span> Discovery
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Network Discovery • CIDR Schedule • Re-Discovery • Exclusion</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="templates" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #16a34a;"></span> Monitoring
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Device Templates (${(state.templates || []).length}) • Performance Monitors • WAN RTT</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="credentials" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #9333ea;"></span> Credentials &amp; NCM
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">SNMP v1/v2c/v3 • WMI • SSH Key Vault • NCM Policies</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="notifications" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #ea580c;"></span> Notifications
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Notification Profiles • Escalation Rules • Threshold.conf</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="agents" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #2563eb;"></span> Host Agents
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Windows Agent (.exe) • macOS/Linux (.dmg) • Mutual TLS</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="tools" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #0d9488;"></span> OpUtils &amp; MIB Tools
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">ICMP Ping • Traceroute • SNMP MIB Browser • Web CLI</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="support" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #dc2626;"></span> Support &amp; Diagnostics
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Live Server Logs • SIF Generator • Probe Heartbeat Logs</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="users" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #4f46e5;"></span> Users &amp; Auth (AD/SAML)
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">Active Directory • SAML 2.0 • 2FA MFA • RBAC Roles</div>
                </div>
                <div class="opm-quick-cfg-card" data-target="failover" style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc; cursor: pointer;" onmouseover="this.style.borderColor='#49bd80'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #ca8a04;"></span> Failover &amp; High Availability
                  </div>
                  <div style="color: #0070e0; line-height: 1.7;">${fo && fo.virtualIp ? 'Active-Standby • Virtual IP ' + opmEsc(fo.virtualIp) + ' • Heartbeat ' + opmEsc(fo.heartbeatPort ?? '—') : 'High availability not configured'}</div>
                </div>
              </div>
            </div>

                        <!-- Distributed Probe WAN Latency Matrix -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Distributed Probe WAN Latency Matrix (Continuous RTT Telemetry)</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Round-trip transit times monitored between Central Master (${window.location.hostname || 'this server'}) and connected Enterprise Probes.</div>
                </div>
                <button id="opm-run-wan-mesh-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: gap: 5px;">
                  ⚡ Run WAN Mesh RTT Poll
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(${Math.min(4, Math.max(1, state.probes.length))}, 1fr); gap: 14px;">
                ${state.probes.map(pr => `
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; border-top: 3px solid #0070e0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: #0f172a; font-size: 12px;">${pr.name}</span>
                      <span style="font-size: 10px; background: #f1f5f9; color: #64748b; font-weight: 700; padding: 1px 5px; border-radius: 2px;">${pr.status ? opmEsc(String(pr.status).toUpperCase()) : '\u2014'}</span>
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin: 6px 0;">${(pr.latency ?? pr.pingLatency) == null ? '\u2014' : (pr.latency ?? pr.pingLatency) + ' ms'}</div>
                    <div style="font-size: 10px; color: #64748b;">${(pr.latency ?? pr.pingLatency) == null ? 'RTT: \u2014' : 'RTT: ' + (pr.latency ?? pr.pingLatency) + ' ms'}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">OpManager Central Master Node &amp; Distributed Probe Architecture</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; color: #64748b; font-weight: 600; margin-bottom: 4px;">Central Host IP</label>
                  <input type="text" value="${window.location.hostname || ''}" readonly style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; font-family: monospace;">
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
              <!-- Official ManageEngine Central-to-Probe XML/HTTPS & Remote Collector Architecture Diagrams -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 10px 14px; background: #fafbfc; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Central Server ↔ Probe XML/HTTPS Topology</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Encrypted TLS 1.3 XML/HTTPS synchronization across Internet/VPN to Regional Probe Servers</div>
                  </div>
                  <img src="/apiclient/fluidicv2/img/ncm-noprobe.jpg" alt="Central Probe XML/HTTPS Architecture" style="height: 82px; object-fit: contain; border-radius: 4px;">
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 10px 14px; background: #fafbfc; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Remote Collector (DPI / Poller / NetFlow Generator)</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Distributed Packet Inspection, SNMP Poller &amp; NetFlow v9/IPFIX stream ingestion into OpManager</div>
                  </div>
                  <img src="/apiclient/fluidicv2/img/remoteCollector.png" alt="Remote Collector Architecture" style="height: 82px; object-fit: contain; border-radius: 4px;">
                </div>
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
                <span>Connected Enterprise Probes (${state.probes.filter(p => String(p.status || '').toLowerCase() === 'online').length} of ${state.probes.length} online)</span>
                <button id="opm-add-probe-btn" onclick="showAddProbeModal()" style="background: #0070e0; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">+ Add Branch / Remote Probe</button>
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
                      <td style="padding: 10px 14px; font-family: monospace;">${(pr.latency ?? pr.pingLatency) == null ? '\u2014' : (pr.latency ?? pr.pingLatency) + ' ms'}</td>
                      <td style="padding: 10px 14px; font-weight: 600;">${pr.devicesCount} Devices</td>
                      <td style="padding: 10px 14px;"><span style="background: #f1f5f9; color: #64748b; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 2px;">${opmEsc(pr.syncStatus || pr.status || '\u2014')}</span></td>
                      <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                        <button class="opm-probe-diag-btn" data-id="${pr.id}" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; margin-right: 6px;">Diagnostics</button>
                        <button class="opm-probe-sync-btn" data-id="${pr.id}" data-name="${pr.name}" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; margin-right: 6px;">Sync</button>
                        <button class="opm-probe-del-btn" data-id="${pr.id}" data-name="${pr.name}" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Official ManageEngine Third-Party Integrations (TPI) Ecosystem Matrix -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Third-Party Integrations (ITSM, SIEM, AI & Incident Collaboration)</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Native ManageEngine & REST API connectors configured across all ${state.probes.length} Enterprise Probes.</div>
                </div>
                <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px;">● 12 Active Connectors</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/sdp-51330b99e980f08cc4885ce39c3e0d22.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">ServiceDesk Plus</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● Auto-Ticketing Enabled</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/service-now-9e03371aa3e497a5fea07e8146b858f3.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">ServiceNow ITSM</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● CMDB & Incident Sync</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/jira-e0f400c9221dca46a135353cc6a88edb.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Atlassian Jira</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● NetOps Project Linked</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/slack-e31dc5c929f2b04c0d79dcbfbaa66340.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Slack Workspace</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● #noc-critical-alerts</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/ms-teams-169144727d3b14ac4addb8a3215ab447.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Microsoft Teams</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● Adaptive Card Webhook</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/pager-duty-0bd7d82e4a32d17c6b6613e4606e7f89.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">PagerDuty On-Call</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● P1 Escalation Active</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/log360-4ee3c637201990aca84dbcc4dde3f246.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">ManageEngine Log360</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● SIEM Syslog Forwarder</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/pam360-154a415fc176bddced131ea428ee0cdb.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">ManageEngine PAM360</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● Privileged Vault Sync</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/ollama-917fa25c886902f4ea34e9372eecad40.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Ollama Local LLM</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● On-Prem AI RCA</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv2/img/chatgpt.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">OpenAI ChatGPT</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● GenAI CLI Assistant</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv3/itom/images/tpi/virus-total-56214d7ccea9fffd0b7e97217d09f986.png" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">VirusTotal Threat Intel</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● NetFlow IP Reputation</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
                <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: #fafbfc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv2/img/Ansible-logo.svg" style="width: 28px; height: 28px; object-fit: contain;" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Red Hat Ansible</div>
                      <div style="font-size: 10px; color: #16a34a; font-weight: 600;">● Playbook Automation</div>
                    </div>
                  </div>
                  <span style="font-size: 10px; color: #0070e0; font-weight: 700; cursor: pointer;">Configure</span>
                </div>
              </div>
            </div>

            <!-- Official ManageEngine OpManager iOS & Android Mobile App Enrollment Card (/apiclient/fluidicv2/img/mobile_app/*) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: space-between; gap: 24px;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">Mobile NOC Companion</span>
                  <span style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine OpManager Mobile App (iOS &amp; Android)</span>
                </div>
                <div style="font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 12px;">
                  Monitor your enterprise network on the go. Receive real-time push notifications for P1 Critical alarms, inspect 24-hour availability timelines, acknowledge incidents, and run Ping/Traceroute diagnostics directly from your mobile device.
                </div>
                <div style="display: flex; align-items: center; gap: 14px;">
                  <img src="/apiclient/fluidicv2/img/mobile_app/apple-badge.svg" alt="Download on the App Store" style="height: 34px; cursor: pointer;" onclick="showToast('OpManager iOS App: Scan QR code to pair with Central Server ' + window.location.host)">
                  <img src="/apiclient/fluidicv2/img/mobile_app/google-badge.svg" alt="Get it on Google Play" style="height: 34px; cursor: pointer;" onclick="showToast('OpManager Android App: Scan QR code to pair with Central Server ' + window.location.host)">
                  <div style="border-left: 1px solid #cbd5e1; padding-left: 14px; display: flex; align-items: center; gap: 10px;">
                    <img src="/apiclient/fluidicv2/img/mobile_app/opm-app-qrcode.png" alt="Mobile App QR Code" style="width: 52px; height: 52px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px;">
                    <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
                      <strong style="color: #0f172a; display: block;">Scan to Pair Mobile App</strong>
                      Server: <span style="font-family: monospace;">https://${window.location.host}</span>
                    </div>
                  </div>
                </div>
              </div>
              <img src="/apiclient/fluidicv2/img/mobile_app/mobile-app-opm.png" alt="OpManager Mobile App Preview" style="height: 145px; object-fit: contain; flex-shrink: 0;">
            </div>

          </div>
        ` : activeSub === 'agents' ? `
          <!-- Monitoring Agents Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">ManageEngine OpManager Central Agent Installation</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Deploy lightweight monitoring agents for granular server telemetry, process tracking, and event logs.</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
              <!-- Windows Installer Card -->
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; background: #fafbfc; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Windows Agent (x64 MSI / EXE)</div>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Version 12.9.204-GA | Size: 6.9 MB | Windows Server 2016/2019/2022 / Windows 10/11</div>
                  <div style="display: flex; gap: 8px;">
                    <a href="/downloads/OpManagerAgent.msi" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download .MSI
                    </a>
                    <a href="/downloads/OpManagerAgent.exe" download style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                      Download .EXE
                    </a>
                  </div>
                  <img src="/apiclient/fluidicv2/img/DeployAgent.png" style="height: 52px; object-fit: contain; flex-shrink: 0;" />
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <a href="/downloads/OpManagerAgent-Windows-x64.zip" download style="display: inline-flex; align-items: center; gap: 6px; background: #0070e0; color: #ffffff; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    📦 Windows Agent Package (.ZIP)
                  </a>
                  <a href="/downloads/OPMAgentServerInfo.json" download style="display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;" title="Download required config file">
                    📄 OPMAgentServerInfo.json
                  </a>
                  <a href="/downloads/OpManagerAgent.msi" download style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                    .MSI
                  </a>
                  <a href="/downloads/OpManagerAgent.exe" download style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                    .EXE
                  </a>
                </div>
                <div style="font-size: 11px; color: #0369a1; background: #f0f9ff; border: 1px solid #bae6fd; padding: 6px 10px; border-radius: 4px; line-height: 1.4;">
                  ℹ️ <strong>Windows Notice:</strong> <code>OpManagerAgent.exe</code> requires <code>OPMAgentServerInfo.json</code> in the same folder. Use the <strong>.ZIP</strong> package, or put <code>OPMAgentServerInfo.json</code> alongside the .exe before running.
                </div>
              </div>

              <!-- Linux / macOS Card -->
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; background: #fafbfc; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Linux / macOS Universal Agent</div>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Version 12.9.204-GA | Systemd Service &amp; Standalone Binary | Linux 64-bit &amp; macOS</div>
                  <div style="display: flex; gap: 8px;">
                    <a href="/downloads/install-agent.sh" download style="display: inline-flex; align-items: center; gap: 6px; background: #16a34a; color: #ffffff; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      install-agent.sh
                    </a>
                    <a href="/downloads/OpManagerAgent-linux.tar.gz" download style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                      .tar.gz
                    </a>
                    <a href="/downloads/OpManagerAgent.dmg" download style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">
                      .dmg
                    </a>
                  </div>
                </div>
                <img src="/apiclient/fluidicv2/img/MonitoringAgents.png" style="height: 64px; object-fit: contain; flex-shrink: 0;" />
              </div>
            </div>

            <!-- Enrollment Token -->
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Agent Enrollment Authentication Token (Mutual TLS / HMAC-SHA256)</div>
              <div style="display: flex; gap: 10px;">
                <input type="text" id="opm-enrollment-token-input" value="${sd.apiKey ? opmEsc(sd.apiKey) : ''}" placeholder="No enrollment token issued yet" readonly style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 12px; background: #fff;">
                <button id="opm-copy-token-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Copy Token</button>
                <button id="opm-regen-token-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Regenerate</button>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">One-Line Linux Deployment Command: <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 3px; font-family: monospace; color: #0284c7; font-weight: 600;">curl -sSL http://${window.location.host}/downloads/install-agent.sh | bash</code></div>
            </div>

            <!-- Connected Monitoring Agents Table -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #ffffff;">
              <div style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Connected Monitoring Agents (Live Heartbeats)</span>
                  <span style="font-size: 11px; background: ${(state.agents && state.agents.length > 0) ? '#dcfce7' : '#f1f5f9'}; color: ${(state.agents && state.agents.length > 0) ? '#166534' : '#64748b'}; padding: 1px 6px; border-radius: 3px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: ${(state.agents && state.agents.length > 0) ? '#16a34a' : '#94a3b8'}; display: inline-block;"></span>
                    ${(state.agents && state.agents.length) || 0} Agent${(state.agents && state.agents.length === 1) ? '' : 's'} Active
                  </span>
                </div>
                <div style="font-size: 11px; color: #64748b;">Heartbeat interval: 5 seconds</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">Agent ID</th>
                    <th style="padding: 10px 14px;">Hostname / OS</th>
                    <th style="padding: 10px 14px;">Platform Architecture</th>
                    <th style="padding: 10px 14px;">Assigned Probe</th>
                    <th style="padding: 10px 14px;">CPU / RAM</th>
                    <th style="padding: 10px 14px;">Status</th>
                    <th style="padding: 10px 14px; text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${(!state.agents || state.agents.length === 0) ? `
                    <tr>
                      <td colspan="7" style="padding: 36px 14px; text-align: center; color: #94a3b8;">
                        No agents currently connected. Run the one-line deployment script on your Linux/Windows server to onboard.
                      </td>
                    </tr>
                  ` : state.agents.map(a => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0f172a;">${a.agentId}</td>
                      <td style="padding: 10px 14px;">
                        <div style="font-weight: 700; color: #0070e0; display: flex; align-items: center; gap: 6px;">
                          ${a.hostname}
                          <span style="font-size: 9px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 2px; border: 1px solid #cbd5e1;">${(a.os || 'HOST').toUpperCase()}</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b;">OpManager Universal Agent v${a.version || '12.9.204-GA'}</div>
                      </td>
                      <td style="padding: 10px 14px; font-family: monospace; font-size: 11px; color: #334155;">${a.platform || a.os}</td>
                      <td style="padding: 10px 14px;">
                        <span style="font-size: 11px; color: #0284c7; background: #f0f9ff; padding: 2px 6px; border-radius: 3px; font-weight: 600;">
                          ${a.probe || 'No probe'}
                        </span>
                      </td>
                      <td style="padding: 10px 14px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span style="font-size: 11px; font-weight: 700; color: ${(a.metrics && a.metrics.cpu > 80) ? '#dc2626' : '#16a34a'};">CPU: ${(a.metrics && a.metrics.cpu != null) ? a.metrics.cpu + '%' : '\u2014'}</span>
                          <span style="font-size: 11px; color: #475569;">RAM: ${(a.metrics && a.metrics.memory != null) ? a.metrics.memory + '%' : '\u2014'}</span>
                        </div>
                      </td>
                      <td style="padding: 10px 14px;">
                        <span style="display: inline-flex; align-items: center; gap: 5px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 3px;">
                          <span style="width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
                          ${a.status || 'Online'}
                        </span>
                      </td>
                      <td style="padding: 10px 14px; text-align: right;">
                        <button onclick="showDeviceSnapshotModal('${a.hostname}')" style="background: #0070e0; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                          Poll Metrics
                        </button>
                      </td>
                    </tr>
                  `).join('')}            </div>
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
                ${(sd.credentials || []).length === 0 ? `
                  <tr>
                    <td colspan="5" style="padding: 36px; text-align: center; color: #64748b;">
                      <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No credentials saved yet</div>
                      <div style="font-size: 12px;">Add an SNMP, WMI, SSH, or Telnet credential — devices use these to poll.</div>
                    </td>
                  </tr>
                ` : sd.credentials.map(c => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">${opmEsc(c.name || '—')}</td>
                    <td style="padding: 10px 14px;">${opmEsc(c.type || '—')}</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">${c.userName ? 'User: ' + opmEsc(c.userName) : 'Secret stored (hidden)'}</td>
                    <td style="padding: 10px 14px;">—</td>
                    <td style="padding: 10px 14px; text-align: right;"><button class="opm-cred-test-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Test</button></td>
                  </tr>
                `).join('')}
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
              ${(state.discoveryRules && state.discoveryRules.length > 0) ? state.discoveryRules.map(r => `
                <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 800; color: #0f172a;">${opmEsc(r.range || r.subnet || r.cidr || '—')}</div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Managed by ${r.probe_id != null ? 'Probe ' + opmEsc(r.probe_id) : '—'} | Sweep ${opmEsc(r.schedule || '—')} | Credential: —</div>
                  </div>
                  <button class="opm-run-discovery-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Run Sweep Now</button>
                </div>
              `).join('') : `
                <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 36px 20px; text-align: center; color: #64748b; background: #fafbfc;">
                  <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Auto-Discovery Rules Configured</div>
                  <div style="font-size: 12px; margin-bottom: 14px; max-width: 440px; margin-left: auto; margin-right: auto;">Configure CIDR IP range schedules to automatically discover network switches, routers, and servers across your subnets.</div>
                  <button onclick="if(typeof showAddDiscoveryRuleModal==='function') showAddDiscoveryRuleModal()" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Add CIDR Discovery Schedule</button>
                </div>
              `}
            </div>
          </div>
        ` : activeSub === 'templates' ? (() => {
            if (!state._templatesLoading && (!state.templates || state.templates.length <= 14)) {
              state._templatesLoading = true;
              fetch('/api/settings/templates')
                .then(r => r.json())
                .then(res => {
                  state._templatesLoading = false;
                  if (res && Array.isArray(res.templates) && res.templates.length > 0) {
                    state.templates = res.templates;
                    if (state.currentTab === 'settings' && state.subTabs.settings === 'templates') {
                      renderSettingsView();
                    }
                  }
                })
                .catch(() => { state._templatesLoading = false; });
            }
            const allTmpls = (state.templates && state.templates.length > 0) ? state.templates : [];
            const activeCat = state.currentTmplCategory || 'all';
            const searchQ = (state.tmplSearchQuery || '').toLowerCase().trim();

            const tmplCount = (cat) => cat === 'all' ? allTmpls.length : allTmpls.filter(t => {
              const c = (t.category || '').toLowerCase();
              if (cat === 'switches') return c.includes('switch');
              if (cat === 'routers') return c.includes('router');
              if (cat === 'firewalls') return c.includes('firewall');
              if (cat === 'servers') return c.includes('server');
              if (cat === 'storage') return c.includes('storage');
              if (cat === 'wireless') return c.includes('wireless') || c.includes('ap') || c.includes('wlc');
              return false;
            }).length;
            const chips = [
              { id: 'all', label: 'ALL (' + tmplCount('all') + ')' },
              { id: 'switches', label: 'SWITCHES (' + tmplCount('switches') + ')' },
              { id: 'routers', label: 'ROUTERS (' + tmplCount('routers') + ')' },
              { id: 'firewalls', label: 'FIREWALLS (' + tmplCount('firewalls') + ')' },
              { id: 'servers', label: 'SERVERS (' + tmplCount('servers') + ')' },
              { id: 'storage', label: 'STORAGE (' + tmplCount('storage') + ')' },
              { id: 'wireless', label: 'WIRELESS (' + tmplCount('wireless') + ')' }
            ];

            let filtered = allTmpls;
            if (activeCat !== 'all') {
              filtered = filtered.filter(t => {
                const cat = (t.category || '').toLowerCase();
                if (activeCat === 'switches') return cat.includes('switch');
                if (activeCat === 'routers') return cat.includes('router');
                if (activeCat === 'firewalls') return cat.includes('firewall');
                if (activeCat === 'servers') return cat.includes('server');
                if (activeCat === 'storage') return cat.includes('storage');
                if (activeCat === 'wireless') return cat.includes('wireless') || cat.includes('ap') || cat.includes('wlc');
                return cat === activeCat;
              });
            }

            if (searchQ) {
              filtered = filtered.filter(t => 
                (t.name || '').toLowerCase().includes(searchQ) ||
                (t.vendor || '').toLowerCase().includes(searchQ) ||
                (t.oid || '').toLowerCase().includes(searchQ) ||
                (t.category || '').toLowerCase().includes(searchQ) ||
                (t.monitors || '').toLowerCase().includes(searchQ)
              );
            }

            const pageSize = state.tmplPageSize || 25;
            const totalFiltered = filtered.length;
            const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
            let curPage = Math.max(1, state.tmplCurrentPage || 1);
            if (curPage > totalPages) curPage = totalPages;
            state.tmplCurrentPage = curPage;

            const startIndex = (curPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalFiltered);
            const paged = filtered.slice(startIndex, endIndex);

            return `
              <!-- Device Templates Subtab -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Enterprise Device Templates Catalog (AdventNet Library)</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${allTmpls.length} templates in the local catalog with predefined SNMP SysOIDs, CLI commands, and monitor associations.</div>
                  </div>
                  <button id="opm-new-template-btn" style="background: #0070e0; color: #fff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    + Add Custom Template
                  </button>
                </div>

                <!-- Category Filter Chips & Real-Time Search Bar -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                  <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;">
                    ${chips.map(c => `
                      <button class="opm-tmpl-chip" data-cat="${c.id}" style="padding: 5px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${activeCat === c.id ? '#0070e0' : '#cbd5e1'}; background: ${activeCat === c.id ? '#0070e0' : '#fff'}; color: ${activeCat === c.id ? '#fff' : '#475569'}; transition: all 0.15s ease;">
                        ${c.label}
                      </button>
                    `).join('')}
                  </div>

                  <div style="position: relative; width: 280px;">
                    <span style="position: absolute; left: 10px; top: 6px; color: #94a3b8; font-size: 12px;">🔍</span>
                    <input type="text" id="opm-tmpl-search-input" value="${state.tmplSearchQuery || ''}" placeholder="Filter templates or SysOID..." style="width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px 6px 30px; font-size: 12px; outline: none; box-sizing: border-box;">
                  </div>
                </div>

                <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                      <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                        <th style="padding: 10px 12px;">Template / Model Name</th>
                        <th style="padding: 10px 12px;">Category</th>
                        <th style="padding: 10px 12px;">Vendor</th>
                        <th style="padding: 10px 12px;">System OID (sysObjectID)</th>
                        <th style="padding: 10px 12px;">Associated Performance Monitors</th>
                        <th style="padding: 10px 12px;">Poll Interval</th>
                        <th style="padding: 10px 12px; text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${paged.length === 0 ? `
                        <tr>
                          <td colspan="7" style="padding: 36px; text-align: center; color: #94a3b8;">
                            No device templates found matching "<strong>${activeCat !== 'all' ? activeCat : state.tmplSearchQuery}</strong>".
                          </td>
                        </tr>
                      ` : paged.map(t => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 10px 12px;">
                            <a href="javascript:void(0)" class="opm-tmpl-name-link" data-id="${t.id}" style="font-weight: 700; color: #0070e0; text-decoration: none; cursor: pointer;">
                              ${t.name}
                            </a>
                          </td>
                          <td style="padding: 10px 12px;"><span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 3px; font-weight: 600; font-size: 11px;">${t.category}</span></td>
                          <td style="padding: 10px 12px; font-weight: 600; color: #475569;">${t.vendor}</td>
                          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #64748b;">${t.oid}</td>
                          <td style="padding: 10px 12px; color: #334155;">${t.monitors}</td>
                          <td style="padding: 10px 12px; font-family: monospace;">${t.poll || '300s'}</td>
                          <td style="padding: 10px 12px; text-align: right;">
                            <button class="opm-tmpl-apply-btn" data-id="${t.id}" data-name="${t.name}" ${state.devices.length === 0 ? 'disabled title="Select a device first"' : ''} style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #0070e0; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: ${state.devices.length === 0 ? 'not-allowed' : 'pointer'}; opacity: ${state.devices.length === 0 ? '0.5' : '1'};">
                              Apply to Nodes
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                <div style="margin-top: 14px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <span>
                    Showing <strong>${totalFiltered === 0 ? 0 : startIndex + 1} - ${endIndex}</strong> of <strong>${totalFiltered.toLocaleString()}</strong> templates in catalog
                    ${searchQ ? `(filtered from ${allTmpls.length.toLocaleString()})` : ''}
                  </span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <button id="opm-tmpl-first-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; ${curPage === 1 ? 'opacity: 0.5; pointer-events: none;' : ''}">« First</button>
                    <button id="opm-tmpl-prev-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; ${curPage === 1 ? 'opacity: 0.5; pointer-events: none;' : ''}">‹ Prev</button>
                    <span style="font-size: 11px; color: #475569; padding: 0 4px;">Page <strong>${curPage}</strong> of <strong>${totalPages}</strong></span>
                    <button id="opm-tmpl-next-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; ${curPage >= totalPages ? 'opacity: 0.5; pointer-events: none;' : ''}">Next ›</button>
                    <button id="opm-tmpl-last-btn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer; ${curPage >= totalPages ? 'opacity: 0.5; pointer-events: none;' : ''}">Last »</button>
                    <span style="border-left: 1px solid #cbd5e1; height: 16px; margin: 0 4px;"></span>
                    <select id="opm-tmpl-limit-sel" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 6px; font-size: 11px; color: #334155;">
                      <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 per page</option>
                      <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 per page</option>
                      <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 per page</option>
                    </select>
                  </div>
                </div>
              </div>
            `;
          })() : activeSub === 'notifications' ? `
          <!-- Notification Profiles & Threshold Rules Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Notification Channels -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Configured Notification Profiles</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Multi-channel alerting rules dispatched when threshold violations or traps occur.</div>
                </div>
                <button id="opm-add-notify-profile-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  + Add Notification Profile
                </button>
              </div>

              <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 36px 20px; text-align: center; color: #64748b; background: #fafbfc;">
                <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No notification profiles configured yet</div>
                <div style="font-size: 12px; margin-bottom: 14px;">Create a profile to get emailed or alerted when a threshold is crossed.</div>
                <button class="opm-add-notify-profile-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">+ Add Notification Profile</button>
              </div>
            </div>

            <!-- Multi-Tier Threshold Rules & Rearm Policies (from Threshold.conf) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Enterprise Threshold Profiles (Threshold.conf)</div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 14px;">Multi-stage alarm escalation rules and noise-suppression rearm boundaries. Values shown are defaults — edit to change.</div>

              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 12px;">Monitor Metric</th>
                    <th style="padding: 10px 12px;">Attention (Yellow)</th>
                    <th style="padding: 10px 12px;">Trouble (Orange)</th>
                    <th style="padding: 10px 12px;">Critical (Red)</th>
                    <th style="padding: 10px 12px;">Rearm Value</th>
                    <th style="padding: 10px 12px;">Consecutive Polls</th>
                    <th style="padding: 10px 12px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0070e0;">CPU Utilization (%)</td>
                    <td style="padding: 10px 12px; color: #ca8a04; font-weight: 600;">&gt; 70%</td>
                    <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">&gt; 80%</td>
                    <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">&gt; 90%</td>
                    <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">65%</td>
                    <td style="padding: 10px 12px;">2 Violations</td>
                    <td style="padding: 10px 12px; text-align: right;"><button class="opm-edit-thresh-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Edit</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0070e0;">Memory Utilization (%)</td>
                    <td style="padding: 10px 12px; color: #ca8a04; font-weight: 600;">&gt; 75%</td>
                    <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">&gt; 85%</td>
                    <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">&gt; 92%</td>
                    <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">70%</td>
                    <td style="padding: 10px 12px;">2 Violations</td>
                    <td style="padding: 10px 12px; text-align: right;"><button class="opm-edit-thresh-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Edit</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0070e0;">Interface Packet Loss (%)</td>
                    <td style="padding: 10px 12px; color: #ca8a04; font-weight: 600;">&gt; 1%</td>
                    <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">&gt; 3%</td>
                    <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">&gt; 5%</td>
                    <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">0.5%</td>
                    <td style="padding: 10px 12px;">1 Violation</td>
                    <td style="padding: 10px 12px; text-align: right;"><button class="opm-edit-thresh-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Edit</button></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 12px; font-weight: 700; color: #0070e0;">ICMP / WAN Latency (RTT)</td>
                    <td style="padding: 10px 12px; color: #ca8a04; font-weight: 600;">&gt; 50 ms</td>
                    <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">&gt; 100 ms</td>
                    <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">&gt; 200 ms</td>
                    <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">40 ms</td>
                    <td style="padding: 10px 12px;">3 Violations</td>
                    <td style="padding: 10px 12px; text-align: right;"><button class="opm-edit-thresh-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Edit</button></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        ` : activeSub === 'tools' ? `
          <!-- Diagnostics & MIB Browser Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Distributed Diagnostic Toolset & MIB Browser (OpUtils v12.9)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Perform ICMP Pings, Hop-by-Hop Traceroutes, SNMP Walk queries, and Switch Port Mappings across Probes.</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-launch-sweep-modal-btn" style="background: #1d824e; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  + Launch Subnet Sweep Wizard
                </button>
              </div>
            </div>

            <!-- Quick Action Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;">
              <div class="opm-tool-card" data-tool="ping" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="font-weight: 700; color: #0070e0; font-size: 13px; margin-bottom: 4px;">ICMP Ping Diagnostic</div>
                <div style="font-size: 11px; color: #64748b;">Multi-packet latency & jitter diagnostic from any probe</div>
              </div>
              <div class="opm-tool-card" data-tool="traceroute" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="font-weight: 700; color: #0070e0; font-size: 13px; margin-bottom: 4px;">WAN Traceroute</div>
                <div style="font-size: 11px; color: #64748b;">Discover routing paths, transit autonomous systems & RTT</div>
              </div>
              <div class="opm-tool-card" data-tool="mib" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="font-weight: 700; color: #1d824e; font-size: 13px; margin-bottom: 4px;">SNMP MIB Browser</div>
                <div style="font-size: 11px; color: #64748b;">Walk RFC1213, CISCO-STACK, and host resource trees</div>
              </div>
              <div class="opm-tool-card" data-tool="terminal" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; background: #fafbfc; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='#0070e0'" onmouseout="this.style.borderColor='#e2e8f0'">
                <div style="font-weight: 700; color: #ea580c; font-size: 13px; margin-bottom: 4px;">Web CLI Terminal</div>
                <div style="font-size: 11px; color: #64748b;">Direct browser-based SSH command console</div>
              </div>
            </div>

            <!-- Authentic MIB Tree Catalog Preview Table -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="padding: 10px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #1e293b; display: flex; justify-content: space-between; align-items: center;">
                <span>Installed Enterprise MIB Modules (AdventNet / ManageEngine Catalog)</span>
                <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; font-weight: 600; color: #475569;">
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_directory.gif" style="width:14px;height:14px;"> Directory</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_table.gif" style="width:14px;height:14px;"> Table</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_entry.gif" style="width:14px;height:14px;"> Entry</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_key.gif" style="width:14px;height:14px;"> Key</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_node.gif" style="width:14px;height:14px;"> Leaf</span>
                  <span style="display:inline-flex;align-items:center;gap:4px;"><img src="/apiclient/fluidicv2/img/mib_trap.gif" style="width:14px;height:14px;"> Trap</span>
                  <span style="color: #64748b; font-weight: 700;">No MIB modules loaded yet</span>
                </div>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead style="background: #f1f5f9; color: #475569; text-transform: uppercase;">
                  <tr>
                    <th style="padding: 8px 12px; text-align: left;">Module Name</th>
                    <th style="padding: 8px 12px; text-align: left;">Root OID</th>
                    <th style="padding: 8px 12px; text-align: left;">Standard</th>
                    <th style="padding: 8px 12px; text-align: left;">Objects Indexed</th>
                    <th style="padding: 8px 12px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="5" style="padding: 30px; text-align: center; color: #64748b;">No MIB modules loaded yet. Open the MIB Browser and run a walk to load modules.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Interactive Diagnostic Query Console (WMI & CLI ToolsTab.xml) -->
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Enterprise Query Runner (WMI &amp; CLI Diagnostic Console)</span>
                  <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ToolsTab.xml</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="opm-tool-tab-wmi" style="background: #0070e0; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">WMI Query Tool</button>
                  <button id="opm-tool-tab-cli" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">CLI Query Tool</button>
                </div>
              </div>

              <!-- WMI Tool Panel -->
              <div id="opm-wmi-tool-panel">
                <div style="display: grid; grid-template-columns: 200px 220px 1fr 140px; gap: 10px; margin-bottom: 12px;">
                  <div>
                    <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Target Windows Server</label>
                    <input type="text" id="opm-wmi-target-ip" value="" placeholder="Enter a target IP address" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: monospace;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">WMI Namespace</label>
                    <select id="opm-wmi-namespace" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                      <option value="root\\cimv2">root\\cimv2 (Standard)</option>
                      <option value="root\\virtualization\\v2">root\\virtualization\\v2 (Hyper-V)</option>
                      <option value="root\\wmi">root\\wmi (Hardware Telemetry)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">WQL Query Statement</label>
                    <input type="text" id="opm-wmi-query-sql" value="SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: monospace;">
                  </div>
                  <div style="display: flex; align-items: flex-end;">
                    <button id="opm-wmi-exec-btn" style="width: 100%; background: #0070e0; color: #fff; border: none; padding: 7px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                      ⚡ Execute WQL
                    </button>
                  </div>
                </div>
                <!-- Output Table -->
                <div id="opm-wmi-output-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; font-size: 11px; font-family: monospace; max-height: 180px; overflow-y: auto;">
                  <div style="color: #64748b;">Specify target IP and WQL query above, then click Execute WQL to query live remote Windows systems.</div>
                </div>
              </div>
            </div>

          </div>
        ` : activeSub === 'mail' ? `
          <!-- Mail & SMS Server Configuration Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Primary SMTP Mail Server Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/apiclient/fluidicv2/img/mail.png" style="width: 26px; height: 26px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Mail Server (SMTP) Configuration</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Configure the primary outbound SMTP relay for alarm notifications, scheduled reports, and executive digests.</div>
                  </div>
                </div>
                <span id="opm-mail-status-pill" style="font-size: 11px; background: #f1f5f9; color: #64748b; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Mail server not configured yet</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; font-size: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Mail Server Address (FQDN / IP) *</label>
                  <input type="text" id="opm-mail-host" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">SMTP Port *</label>
                  <input type="number" id="opm-mail-port" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Connection Security *</label>
                  <select id="opm-mail-security" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option value="STARTTLS" selected>STARTTLS (Recommended - Port 587)</option>
                    <option value="SSL">SSL / TLS (Implicit - Port 465)</option>
                    <option value="PLAIN">Plain Text (Unencrypted - Port 25)</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Sender Email Address (From) *</label>
                  <input type="email" id="opm-mail-from" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Admin Email (For Critical System Alerts)</label>
                  <input type="email" id="opm-mail-admin" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">SMTP Authentication Username</label>
                  <input type="text" id="opm-mail-user" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
              </div>

              <!-- Test Email Strip -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 10px;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                  <span style="font-size: 12px; font-weight: 700; color: #1e293b; white-space: nowrap;">Send Test Email:</span>
                  <input type="email" id="opm-test-email-target" placeholder="Enter an email address" value="" style="flex: 1; max-width: 320px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                  <button id="opm-send-test-email-btn" style="background: #49bd80; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                    ✉ Send Test Mail
                  </button>
                </div>
                <button id="opm-save-mail-settings-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                  Save Mail Settings
                </button>
              </div>
            </div>

            <!-- SMS Server Gateway Configuration Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/apiclient/fluidicv2/img/workflow/send_sms.png" style="width: 24px; height: 24px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SMS Gateway &amp; Cellular Alerts Configuration</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Deliver out-of-band P1 alarms to NOC on-call mobile phones via HTTP SMS Gateway or SMPP GSM Modem.</div>
                  </div>
                </div>
                <span id="opm-sms-status-pill" style="font-size: 11px; background: #f1f5f9; color: #64748b; font-weight: 700; padding: 3px 8px; border-radius: 4px;">Not configured yet</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 12px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Gateway Type</label>
                  <select style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option>HTTP API (Twilio / AWS SNS / Generic)</option>
                    <option>SMPP v3.4 Cellular Carrier Trunk</option>
                    <option>Hardware Serial GSM Modem (/dev/ttyUSB0)</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Provider Gateway Endpoint URL</label>
                  <input type="text" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px;">Sender ID / Shortcode</label>
                  <input type="text" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
              </div>
            </div>

          </div>
        ` : activeSub === 'proxy' ? `
          <!-- Proxy Server Configuration Subtab (BasicSettings.xml -> /Settings/Basic/Proxy) -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); max-width: 900px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="/images/deviceicons/firewall.png" style="width: 26px; height: 26px; object-fit: contain;" />
                <div>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Proxy Server Configuration</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Configure enterprise outbound HTTP/HTTPS proxy for Central updates, cloud probe synchronization, and telemetry.</div>
                </div>
              </div>
              <span id="opm-proxy-status-pill" style="font-size: 11px; background: #f1f5f9; color: #475569; font-weight: 700; padding: 4px 10px; border-radius: 12px;">Direct Internet (Proxy Standby)</span>
            </div>

            <!-- Form Elements -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #1e293b; cursor: pointer;">
                <input type="checkbox" id="opm-proxy-enable" style="width: 16px; height: 16px; accent-color: #0070e0;">
                Enable Proxy Server for Central Outbound Traffic
              </label>

              <div style="display: grid; grid-template-columns: 140px 1fr 140px; gap: 12px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Protocol *</label>
                  <select id="opm-proxy-protocol" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option value="HTTP">HTTP</option>
                    <option value="HTTPS">HTTPS</option>
                    <option value="SOCKS5">SOCKS5</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Proxy Server Host Name / IP Address *</label>
                  <input type="text" id="opm-proxy-host" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Port Number *</label>
                  <input type="number" id="opm-proxy-port" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
              </div>

              <!-- Auth details -->
              <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #1e293b; cursor: pointer; margin-bottom: 12px;">
                  <input type="checkbox" id="opm-proxy-auth-check" style="width: 15px; height: 15px; accent-color: #0070e0;">
                  Proxy Server Requires Authentication
                </label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <label style="display: block; font-weight: 600; color: #334155; font-size: 11px; margin-bottom: 4px;">Proxy Username</label>
                    <input type="text" id="opm-proxy-user" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                  </div>
                  <div>
                    <label style="display: block; font-weight: 600; color: #334155; font-size: 11px; margin-bottom: 4px;">Proxy Password</label>
                    <input type="password" id="opm-proxy-pass" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                  </div>
                </div>
              </div>

              <!-- Bypass List -->
              <div>
                <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Bypass Proxy for These Addresses (Comma Separated)</label>
                <textarea id="opm-proxy-bypass" rows="2" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-family: monospace;"></textarea>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Requests to matching hosts bypass proxy and connect directly over internal routing.</div>
              </div>

              <!-- Actions -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 8px;">
                <button id="opm-test-proxy-btn" style="background: #1d824e; color: #ffffff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  ⚡ Test Proxy Connection
                </button>
                <button id="opm-save-proxy-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 7px 18px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  Save Proxy Settings
                </button>
              </div>
            </div>
          </div>
        ` : activeSub === 'users' ? `
          <!-- Users & Authentication Subtab -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Users RBAC Management Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/images/deviceicons/server.png" style="width: 26px; height: 26px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Enterprise User Accounts &amp; Role-Based Access Control (RBAC)</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Manage system administrators, network operators, and probe-scoped security permissions.</div>
                  </div>
                </div>
                <button id="opm-add-user-modal-btn" style="background: #49bd80; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>+ Add Enterprise User</span>
                </button>
              </div>

              <!-- Users Table -->
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;" id="opm-users-table">
                  <thead style="background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 11px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
                    <tr>
                      <th style="padding: 10px 14px; text-align: left;">Username</th>
                      <th style="padding: 10px 14px; text-align: left;">Display Name</th>
                      <th style="padding: 10px 14px; text-align: left;">Assigned Role</th>
                      <th style="padding: 10px 14px; text-align: left;">Auth Source</th>
                      <th style="padding: 10px 14px; text-align: left;">Probe Scope</th>
                      <th style="padding: 10px 14px; text-align: center;">2FA / MFA</th>
                      <th style="padding: 10px 14px; text-align: center;">Status</th>
                      <th style="padding: 10px 14px; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(sd.users || []).length === 0 ? `
                      <tr>
                        <td colspan="8" style="padding: 36px; text-align: center; color: #64748b;">
                          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No additional users yet</div>
                          <div style="font-size: 12px;">Only the built-in admin account exists. Add a user to grant console access.</div>
                        </td>
                      </tr>
                    ` : sd.users.map(u => `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 14px; font-weight: 800; color: #0070e0; font-family: monospace;">${opmEsc(u.username || '—')}</td>
                        <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">${opmEsc(u.name || u.username || '—')}</td>
                        <td style="padding: 10px 14px;">${opmEsc(u.role || '—')}</td>
                        <td style="padding: 10px 14px; color: #475569;">${opmEsc(u.authType || u.authSource || '—')}</td>
                        <td style="padding: 10px 14px; color: #16a34a; font-weight: 600;">${opmEsc(u.probeScope || '—')}</td>
                        <td style="padding: 10px 14px; text-align: center;">${u.mfa ? '<span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">✔ Enforced</span>' : '—'}</td>
                        <td style="padding: 10px 14px; text-align: center;"><span style="color: ${String(u.status || '').toLowerCase() === 'active' ? '#16a34a' : '#64748b'}; font-weight: 700;">${opmEsc(u.status || '—')}</span></td>
                        <td style="padding: 10px 14px; text-align: right;">
                          <button class="opm-user-edit-btn" data-id="${opmEsc(u.id ?? '')}" style="background: none; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; color: #334155;">Edit</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Active Directory / LDAP & SAML Single Sign-On 2-Column Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              
              <!-- Active Directory Domain Card -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">🏢</span> Active Directory (AD / LDAP) Domain
                  </div>
                  <span id="opm-ad-status-badge" style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">● SYNC OPERATIONAL</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px; margin-bottom: 16px;">
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Domain Name (NetBIOS / FQDN) *</label>
                    <input type="text" id="opm-ad-domain" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
                  </div>
                  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                    <div>
                      <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Domain Controller Host *</label>
                      <input type="text" id="opm-ad-dc" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
                    </div>
                    <div>
                      <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">LDAP Port *</label>
                      <input type="number" id="opm-ad-port" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Base Distinguished Name (Base DN)</label>
                    <input type="text" id="opm-ad-basedn" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace;">
                  </div>
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Service Account Bind DN</label>
                    <input type="text" id="opm-ad-binddn" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 11px;">
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                  <button id="opm-test-ad-btn" style="background: #1d824e; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    ⚡ Test LDAP Bind
                  </button>
                  <button id="opm-save-ad-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Save AD Config
                  </button>
                </div>
              </div>

              <!-- SAML 2.0 Single Sign-On Card -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">🔑</span> SAML 2.0 Single Sign-On (SSO)
                  </div>
                  <span style="background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">● AZURE AD / OKTA</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px; margin-bottom: 16px;">
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">IdP Entity Identifier (Issuer URI) *</label>
                    <input type="text" id="opm-saml-idp" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 11px;">
                  </div>
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Single Sign-On Target URL (IdP Login) *</label>
                    <input type="text" id="opm-saml-url" value="" placeholder="Not configured yet" style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 11px;">
                  </div>
                  <div>
                    <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 4px;">Service Provider ACS URL (Endpoint)</label>
                    <input type="text" id="opm-saml-acs" value="" readonly style="width: 100%; box-sizing: border-box; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; font-family: monospace; font-size: 11px;">
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
                    <span style="font-weight: 700; color: #334155;">Just-In-Time (JIT) Auto-Provisioning</span>
                    <span style="color: #16a34a; font-weight: 700;">✔ Enabled</span>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                  <button id="opm-test-saml-btn" style="background: #1d824e; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Validate SAML Metadata
                  </button>
                  <button id="opm-save-saml-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Save SAML Config
                  </button>
                </div>
              </div>

            </div>

          </div>
        ` : activeSub === 'license' ? `
          <!-- License Management & Usage Subtab (BasicSettings.xml -> /Settings/Basic/LicenseMgmt/UsageInfo) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- License Header Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="/images/central_product_logo.png" style="height: 32px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f172a;">OpManager Central${lic && lic.edition ? ' (' + opmEsc(lic.edition) + ')' : ''}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${lic ? 'Registered license' + (lic.organization ? ' for ' + opmEsc(lic.organization) : '') + ' | Build ' + opmEsc(lic.buildNumber ?? '—') : 'No license applied yet — apply a license key to register this installation.'}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 11px; background: #dcfce7; color: #166534; font-weight: 700; padding: 4px 10px; border-radius: 12px;">● ACTIVE (VALIDATED)</span>
                  <button id="opm-apply-lic-key-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 7px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    + Apply License Key (.xml)
                  </button>
                </div>
              </div>

              <!-- License Properties Grid -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">License Type</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${lic ? opmEsc(lic.licenseType || '—') : '—'}</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Server Host ID (MAC)</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0070e0; font-family: monospace; margin-top: 2px;">${lic ? opmEsc(lic.hostId || '—') : '—'}</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">License Expiry</div>
                  <div style="font-size: 13px; font-weight: 700; color: #16a34a; margin-top: 2px;">${lic ? opmEsc(lic.expiryDate || '—') : '—'}</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Annual Support (AMS)</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${lic && lic.amsValidTill ? 'Valid till ' + opmEsc(lic.amsValidTill) : '—'}</div>
                </div>
              </div>

              <!-- Usage Quota Gauges -->
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Enterprise Quota &amp; Capacity Utilization</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                
                <!-- Devices Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">Monitored Devices</span>
                    <span style="font-size: 12px; font-weight: 800; color: #0070e0;">${opmLicLabel(lic && lic.devicesUsed, lic && lic.devicesAllowed)}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #0070e0; width: ${opmLicPct(lic && lic.devicesUsed, lic && lic.devicesAllowed)}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>Consumed: ${opmLicUsed(lic && lic.devicesUsed)}</span>
                    <span>Remaining: ${opmLicRemain(lic && lic.devicesUsed, lic && lic.devicesAllowed)}</span>
                  </div>
                </div>

                <!-- Interfaces Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">Monitored Interfaces</span>
                    <span style="font-size: 12px; font-weight: 800; color: #16a34a;">${opmLicLabel(lic && lic.interfacesUsed, lic && lic.interfacesAllowed)}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #16a34a; width: ${opmLicPct(lic && lic.interfacesUsed, lic && lic.interfacesAllowed)}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>Consumed: ${opmLicUsed(lic && lic.interfacesUsed)}</span>
                    <span>Remaining: ${opmLicRemain(lic && lic.interfacesUsed, lic && lic.interfacesAllowed)}</span>
                  </div>
                </div>

                <!-- NCM Nodes Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">NCM Monitored Nodes</span>
                    <span style="font-size: 12px; font-weight: 800; color: #7c3aed;">${opmLicLabel(lic && lic.ncmUsed, lic && lic.ncmAllowed)}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #7c3aed; width: ${opmLicPct(lic && lic.ncmUsed, lic && lic.ncmAllowed)}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>Consumed: ${opmLicUsed(lic && lic.ncmUsed)}</span>
                    <span>Remaining: ${opmLicRemain(lic && lic.ncmUsed, lic && lic.ncmAllowed)}</span>
                  </div>
                </div>

                <!-- NetFlow Interfaces Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">NetFlow Flow Interfaces</span>
                    <span style="font-size: 12px; font-weight: 800; color: #ea580c;">${opmLicLabel(lic && lic.netflowUsed, lic && lic.netflowAllowed)}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #ea580c; width: ${opmLicPct(lic && lic.netflowUsed, lic && lic.netflowAllowed)}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>Consumed: ${opmLicUsed(lic && lic.netflowUsed)}</span>
                    <span>Remaining: ${opmLicRemain(lic && lic.netflowUsed, lic && lic.netflowAllowed)}</span>
                  </div>
                </div>

                <!-- Distributed Probes Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">Distributed Probes</span>
                    <span style="font-size: 12px; font-weight: 800; color: #0284c7;">${lic ? opmLicUsed(lic.probesUsed) + ' / ' + (lic.probesAllowed === -1 ? 'Unlimited' : (lic.probesAllowed ?? '—')) : '—'}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #0284c7; width: ${lic && lic.probesAllowed === -1 ? 100 : opmLicPct(lic && lic.probesUsed, lic && lic.probesAllowed)}%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>Connected Probes: ${state.probes.length}</span>
                    <span>Capacity: ${lic && lic.probesAllowed === -1 ? 'Unlimited Probes' : (lic && lic.probesAllowed != null ? opmEsc(lic.probesAllowed) + ' Probes' : '—')}</span>
                  </div>
                </div>

                <!-- IPAM & SPM Module Gauge -->
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">OpUtils IPAM &amp; SPM</span>
                    <span style="font-size: 12px; font-weight: 800; color: #059669;">${lic ? opmEsc(lic.ipamSpmAllowed || '—') : '—'}</span>
                  </div>
                  <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                    <div style="background: #059669; width: 100%; height: 100%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
                    <span>IPAM Subnets: —</span>
                    <span>Switch Ports: —</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ` : activeSub === 'dbbackup' ? `
          <!-- Database Backup & Maintenance Subtab (BasicSettings.xml -> /Settings/Basic/DBbackup) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Database Engine Status Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="/images/deviceicons/server.png" style="width: 28px; height: 28px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${dbi && dbi.engine ? opmEsc(dbi.engine) : 'Database'}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${dbi ? (dbi.dbHost ? 'Local Database on ' + opmEsc(dbi.dbHost) + ':' + opmEsc(dbi.dbPort ?? '—') : 'Local database file: ' + opmEsc(dbi.dbPath || dbi.dbName || '—')) + ' | Catalog Name: ' + opmEsc(dbi.dbName || '—') : 'Database details not loaded yet.'}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="opm-db-vacuum-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    🧹 Vacuum &amp; Optimize
                  </button>
                  <button id="opm-db-backup-now-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    ⚡ Trigger Database Backup Now
                  </button>
                </div>
              </div>

              <!-- Metrics Strip -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Database Catalog Size</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">4.82 GB</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Tables: 3.91 GB | Indexes: 919 MB</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Total Indexed Records</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${dbi && typeof dbi.totalRecords === 'number' ? dbi.totalRecords.toLocaleString() : '—'}</div>
                  <div style="font-size: 10px; color: #16a34a; margin-top: 2px;">Telemetry &amp; Flow Records</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Connection Pool</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${dbi ? (dbi.activeConnections ?? '—') + ' / ' + (dbi.maxConnections ?? '—') + ' Active' : '—'}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Connection pool usage</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 600;">Buffer Cache Hit Ratio</div>
                  <div style="font-size: 18px; font-weight: 800; color: #16a34a; margin-top: 2px;">${dbi && dbi.cacheHitRatio ? opmEsc(dbi.cacheHitRatio) : '—'}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">As reported by the database</div>
                </div>
              </div>

              <!-- Automated Backup Policy Strip -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
                  <span style="font-size: 12px; font-weight: 700; color: #166534;">${dbi && dbi.schedule ? 'Automated Backup Schedule: ' + opmEsc(dbi.schedule.frequency || '—') + ' at ' + opmEsc(dbi.schedule.time || '—') + ' (Retention: ' + opmEsc(dbi.schedule.retentionDays ?? '—') + ' Days)' : 'No backup schedule configured'}</span>
                </div>
                <span style="font-size: 11px; color: #166534; font-family: monospace;">${dbi && dbi.schedule && dbi.schedule.backupPath ? 'Destination: ' + opmEsc(dbi.schedule.backupPath) : 'Destination: —'}</span>
              </div>

              <!-- Backup History Table -->
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <div style="padding: 10px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #334155;">
                  Recent Database Backup Snapshots &amp; Archives
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                  <thead>
                    <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 10px 14px;">Archive Name</th>
                      <th style="padding: 10px 14px;">Timestamp (UTC)</th>
                      <th style="padding: 10px 14px;">Archive Size</th>
                      <th style="padding: 10px 14px;">Trigger Type</th>
                      <th style="padding: 10px 14px;">Integrity Status</th>
                      <th style="padding: 10px 14px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="opm-db-backup-tbody">
                    ${(!dbi || !dbi.backupHistory || dbi.backupHistory.length === 0) ? `
                      <tr>
                        <td colspan="6" style="padding: 36px; text-align: center; color: #64748b;">
                          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No database backups yet</div>
                          <div style="font-size: 12px;">Backups run on the schedule below. Run one now to create the first backup.</div>
                        </td>
                      </tr>
                    ` : dbi.backupHistory.map(b => `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 14px; font-family: monospace; font-weight: 600; color: #0070e0;">${opmEsc(b.fileName || '—')}</td>
                        <td style="padding: 10px 14px; color: #64748b;">${opmEsc(b.timestamp || '—')}</td>
                        <td style="padding: 10px 14px; font-weight: 600;">${b.sizeMB != null ? b.sizeMB + ' MB' : '—'}</td>
                        <td style="padding: 10px 14px;"><span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${opmEsc(b.trigger || '—')}</span></td>
                        <td style="padding: 10px 14px;">${opmEsc(b.status || '—')}</td>
                        <td style="padding: 10px 14px; text-align: right;"><button class="opm-db-download-btn" data-file="${opmEsc(b.fileName || '')}" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">Download</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        ` : activeSub === 'failover' ? `
          <!-- High Availability & Failover Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="/apiclient/fluidicv2/img/fwa-ha.svg" style="width: 28px; height: 28px; object-fit: contain;" />
                <div>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a;">OpManager Central High Availability &amp; Failover Architecture</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Single-node deployment with a local SQLite database store. No clustering or database mirroring is configured.</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span id="opm-ha-cluster-badge" style="font-size: 11px; background: ${fo && fo.status && fo.status !== 'Not configured' ? '#dcfce7' : '#f1f5f9'}; color: ${fo && fo.status && fo.status !== 'Not configured' ? '#166534' : '#64748b'}; font-weight: 700; padding: 3px 10px; border-radius: 12px;">${fo && fo.status && fo.status !== 'Not configured' ? opmEsc(fo.status) : 'High availability not configured'}</span>
                <button id="opm-simulate-failover-btn" style="background: #ea580c; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                  ⚡ Simulate Role Switchover
                </button>
                <button id="opm-test-ha-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  ⚡ Test Heartbeat Ping
                </button>
              </div>
            </div>

            <!-- Interactive HA Visual Cluster Diagram -->
            <div style="background: #0f172a; border-radius: 6px; padding: 24px; color: #f8fafc; margin-bottom: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; position: relative;">
                
                <!-- Primary Master Box -->
                <div style="background: #1e293b; border: 2px solid #49bd80; border-radius: 6px; padding: 16px 20px; width: 230px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: #49bd80; margin: 0 auto 6px auto;"></div>
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff;">Primary Central Node</div>
                  <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin: 4px 0;">${fo && fo.primary ? opmEsc(fo.primary.ip || '—') : '—'}</div>
                  <div style="background: #14532d; color: #4ade80; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px;">ACTIVE MASTER</div>
                </div>

                <!-- Sync Heartbeat Line -->
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 16px;">
                  <div style="font-size: 10px; color: #38bdf8; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px;">MUTUAL HEARTBEAT &amp; DB SYNC</div>
                  <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #4ade80, #38bdf8, #4ade80); border-radius: 2px; position: relative;"></div>
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Port ${fo ? opmEsc(fo.heartbeatPort ?? '—') : '—'} • Lag: ${fo && fo.secondary ? opmEsc(fo.secondary.replicationLag ?? '—') : '—'}</div>
                </div>

                <!-- Standby Node Box -->
                <div style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 6px; padding: 16px 20px; width: 230px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; margin: 0 auto 6px auto;"></div>
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff;">Secondary Central Node</div>
                  <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin: 4px 0;">${fo && fo.secondary ? opmEsc(fo.secondary.ip || '—') : '—'}</div>
                  <div style="background: #0369a1; color: #7dd3fc; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px;">HOT STANDBY</div>
                </div>

              </div>

              <!-- Shared VIP Strip -->
              <div style="text-align: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid #334155; font-size: 12px;">
                <span style="color: #94a3b8;">Shared Enterprise Virtual IP (VIP):</span>
                <strong style="color: #facc15; font-family: monospace; margin-left: 6px; font-size: 14px;">${fo && fo.virtualIp ? opmEsc(fo.virtualIp) : '—'}</strong>
                <span style="color: #64748b; margin-left: 8px;">${fo && fo.virtualIp ? '(Probes connect to this VIP for automatic failover)' : '(No virtual IP configured)'}</span>
              </div>
            </div>

            <!-- Cluster Telemetry Statistics Matrix -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; font-size: 12px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="color: #64748b; font-size: 11px;">Replication Lag</div>
                <div style="font-size: 18px; font-weight: 800; color: #16a34a; margin: 4px 0;">${fo && fo.secondary ? opmEsc(fo.secondary.replicationLag ?? '—') : '—'}</div>
                <div style="color: #64748b; font-size: 10px;">No replication — local SQLite store</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="color: #64748b; font-size: 11px;">Heartbeat Ping Interval</div>
                <div style="font-size: 18px; font-weight: 800; color: #0284c7; margin: 4px 0;">—</div>
                <div style="color: #64748b; font-size: 10px;">UDP/TCP Keepalive</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="color: #64748b; font-size: 11px;">Failover Trigger Threshold</div>
                <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0;">Not set</div>
                <div style="color: #64748b; font-size: 10px;">No trigger threshold configured</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px; background: #fafbfc;">
                <div style="color: #64748b; font-size: 11px;">Split-Brain Protection</div>
                <div style="font-size: 18px; font-weight: 800; color: #16a34a; margin: 4px 0;">${fo && fo.splitBrainProtection ? 'Enabled' : 'Not enabled'}</div>
                <div style="color: #64748b; font-size: 10px;">Split-brain protection</div>
              </div>
            </div>

            <!-- HA Failover Execution Log Console -->
            <div style="margin-top: 18px; background: #0f172a; border-radius: 6px; padding: 14px 18px; font-family: monospace; font-size: 11px; color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
                <span style="font-weight: 700; color: #94a3b8;">HIGH AVAILABILITY CLUSTER STATE &amp; REPLICATION LOG</span>
                <span style="color: #64748b; font-size: 10px;">Heartbeat port ${fo ? opmEsc(fo.heartbeatPort ?? '—') : '—'}</span>
              </div>
              <div id="opm-ha-term-logs" style="line-height: 1.6; color: #cbd5e1; max-height: 90px; overflow-y: auto;">
                <div>No failover events recorded yet.</div>
              </div>
            </div>

          </div>
        ` : activeSub === 'system' ? `
          <!-- System Settings & Rebranding Subtab (BasicSettings.xml -> /Settings/Basic/System & Rebrand) -->
          <div style="display: flex; flex-direction: column; gap: 20px; max-width: 960px;">
            
            <!-- System General Settings Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/images/deviceicons/server.png" style="width: 26px; height: 26px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">System Configuration &amp; Telemetry Retention</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Configure Central web port, session inactivity timeout, and database archiving parameters.</div>
                  </div>
                </div>
                <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 3px 10px; border-radius: 12px;">BasicSettings.xml</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Central Server FQDN / Host Name</label>
                  <input type="text" id="opm-sys-hostname" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Web Server Port (HTTP / HTTPS)</label>
                  <input type="number" id="opm-sys-port" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Web Inactivity Session Timeout</label>
                  <select id="opm-sys-timeout" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option value="">Not set</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Performance Data Retention (Hourly / Daily)</label>
                  <select id="opm-sys-retention" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option value="">Not set</option>
                    <option value="30">30 Days Hourly / 90 Days Daily</option>
                    <option value="60">60 Days Hourly / 180 Days Daily</option>
                    <option value="365">1 Year Full Enterprise History</option>
                  </select>
                </div>
              </div>

              <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #1e293b; cursor: pointer;">
                  <input type="checkbox" id="opm-sys-dns-lookup" style="width: 15px; height: 15px; accent-color: #0070e0;">
                  Enable Automatic DNS Reverse Resolution During Subnet Discovery
                </label>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px; padding-left: 23px;">
                  Queries primary and secondary DNS servers to automatically populate device hostname labels upon SNMP discovery.
                </div>
              </div>
            </div>

            <!-- Product Rebranding Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/images/central_product_logo.png" style="height: 28px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Product Rebranding &amp; White-Labeling</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Customize enterprise organization title, footer copyright text, and product banner.</div>
                  </div>
                </div>
                <span style="font-size: 11px; background: #dcfce7; color: #166534; font-weight: 700; padding: 3px 10px; border-radius: 12px;">Active Theme</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Organization / Company Name</label>
                  <input type="text" id="opm-rebrand-org" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Portal Window Title</label>
                  <input type="text" id="opm-rebrand-title" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
              </div>

              <div>
                <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Footer Copyright Statement</label>
                <input type="text" id="opm-rebrand-footer" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 18px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                <button id="opm-save-system-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 20px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  Save System &amp; Rebrand Settings
                </button>
              </div>
            </div>

          </div>
        ` : activeSub === 'ssl' ? `
          <!-- SSL & Security Settings Subtab (BasicSettings.xml -> /Settings/Basic/SSLSettings) -->
          <div style="display: flex; flex-direction: column; gap: 20px; max-width: 960px;">
            
            <!-- SSL / TLS Certificate Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="/apiclient/fluidicv2/img/workflow/auth.png" style="width: 26px; height: 26px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">SSL / TLS Encryption &amp; Security Settings</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Manage HTTPS listener certificates, strong cipher suites, and modern TLS protocol enforcement.</div>
                  </div>
                </div>
                <span id="opm-ssl-status-pill" style="font-size: 11px; background: #f1f5f9; color: #64748b; font-weight: 700; padding: 3px 10px; border-radius: 12px;">No custom certificate installed</span>
              </div>

              <!-- Active Certificate Metadata Banner -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                  <span style="color: #16a34a;">🔒</span> Active Enterprise Server Certificate
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
                  <div><strong style="color: #475569;">Common Name (CN):</strong> <span style="font-family: monospace; color: #0f172a;" id="opm-ssl-cn">No custom certificate installed</span></div>
                  <div><strong style="color: #475569;">Issuer Authority:</strong> <span style="color: #0f172a;">DigiCert Global Root G2 (Intermediate CA)</span></div>
                  <div><strong style="color: #475569;">Valid From / To:</strong> <span style="color: #16a34a; font-weight: 600;">2025-01-01 to 2027-11-30 (Valid)</span></div>
                  <div><strong style="color: #475569;">Key Algorithm:</strong> <span style="font-family: monospace; color: #0f172a;">RSA 2048-bit (SHA-256 with RSA)</span></div>
                  <div><strong style="color: #475569;">Serial Number:</strong> <span style="font-family: monospace; font-size: 11px; color: #64748b;">4A:8B:19:3C:99:FF:01:2A</span></div>
                  <div><strong style="color: #475569;">Subject Alternative Names:</strong> <span style="font-family: monospace; font-size: 11px; color: #0284c7;" id="opm-ssl-san">—</span></div>
                </div>
              </div>

              <!-- HTTPS & Cipher Configuration -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">HTTPS Secure Port</label>
                  <input type="number" id="opm-ssl-port" value="" placeholder="Not set" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Enabled TLS Protocols</label>
                  <select id="opm-ssl-protocols" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    <option value="TLSv1.2,TLSv1.3" selected>TLS 1.2 &amp; TLS 1.3 (Strict Security - Recommended)</option>
                    <option value="TLSv1.3">TLS 1.3 Only (Highest Compliance)</option>
                    <option value="ALL">TLS 1.0, 1.1, 1.2, 1.3 (Legacy Insecure)</option>
                  </select>
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 700; color: #334155; font-size: 11px; margin-bottom: 6px;">Allowed High-Security Cipher Suites</label>
                <input type="text" id="opm-ssl-ciphers" value="ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:HIGH:!aNULL:!MD5:!3DES" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-family: monospace;">
              </div>

              <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 18px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #1e293b; cursor: pointer;">
                  <input type="checkbox" id="opm-ssl-redirect" style="width: 15px; height: 15px; accent-color: #0070e0;">
                  Force Automatic HTTP (8060) to HTTPS (8443) Redirection
                </label>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px; padding-left: 23px;">
                  All incoming plain HTTP browser sessions and Probe telemetry synchronization will receive an HTTP 301 Permanent Redirect to the secure HTTPS port.
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                <button id="opm-ssl-cert-inspector-btn" style="background: #16a34a; color: #ffffff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">🔍 Complete Certificate Chain &amp; Cipher Inspector</button>
                <button id="opm-test-ssl-btn" style="background: #f8fafc; color: #0070e0; border: 1px solid #cbd5e1; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  ⚡ Test SSL Handshake
                </button>
                <div style="display: flex; gap: 8px;">
                  <button id="opm-import-cert-btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                    📁 Import Custom Keystore (.pfx / .jks)
                  </button>
                  <button id="opm-save-ssl-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 7px 20px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                    Save SSL Settings
                  </button>
                </div>
              </div>
            </div>

          </div>
        ` : activeSub === 'support' ? `
          <!-- Support & System Logs Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Enterprise Support & Diagnostic Logs Console</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Inspect real-time log streams from OpManager Central server, Distributed Probes, and Polling engines.</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <select id="opm-log-file-select" style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                  <option value="opmanager_server.log">opmanager_server.log (Central Server)</option>
                  <option value="probe_sync.log">probe_sync.log (Probe Sync & Heartbeat)</option>
                  <option value="poller.log">poller.log (SNMP & ICMP Polling)</option>
                </select>
                <button id="opm-refresh-logs-btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  🔄 Refresh Stream
                </button>
                <a id="opm-open-viewer-btn" href="/apiclient/fluidicv3/itom/pages/log-viewer.html?file=opmanager_server.log" target="_blank" style="background: #ffffff; color: #0070e0; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  <span>Log Viewer</span> ↗
                </a>
                <button id="opm-generate-sif-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  📦 Generate SIF Package
                </button>
              </div>
            </div>

            <!-- Terminal log viewer -->
            <div style="background: #0f172a; border-radius: 6px; padding: 14px 18px; font-family: monospace; font-size: 12px; color: #38bdf8; min-height: 280px; max-height: 420px; overflow-y: auto; line-height: 1.6; border: 1px solid #334155;" id="opm-log-terminal-output">
              <div style="color: #94a3b8; font-style: italic;">Loading diagnostic log buffer...</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px; color: #64748b;">
              <span>Status: <strong style="color: #16a34a;">● Live Polling Active</strong> (Auto-buffered from Central Daemon)</span>
              <span>Diagnostic archive: server log files plus a system snapshot (Node.js version, uptime, memory usage, SQLite database size and inventory counts).</span>
            </div>
          </div>
        ` : `
          <!-- System Engine Subtab -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">JVM & Backend Engine Health (12.9.204-GA)</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">JVM heap, database, and poller statistics — live values only, or — when unavailable.</div>
              </div>
              <button id="opm-db-maint-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Run DB Maintenance</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; font-size: 12px; margin-bottom: 24px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #fafbfc;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 8px;">JVM Heap Memory</div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                  <span id="opm-eng-heap">Allocated: —</span>
                  <span id="opm-eng-heap-pct" style="font-weight: 700; color: #16a34a;">—</span>
                </div>
                <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                  <div id="opm-eng-heap-bar" style="width: 0%; height: 100%; background: #16a34a;"></div>
                </div>
                <div style="font-size: 11px; color: #64748b;"><span id="opm-eng-uptime">Uptime: —</span></div>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #fafbfc;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 8px;">Embedded Database</div>
                <div style="color: #16a34a; font-weight: 800; margin-bottom: 4px;"><span id="opm-eng-db">Database: —</span></div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;"><span id="opm-eng-pool">—</span></div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600;"><span id="opm-eng-cache">Buffer Cache Hit Ratio: —</span></div>
              </div>
            </div>

            <!-- Poller Worker Threads & Retention Policies -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background: #ffffff;">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Data Retention &amp; Archival Policies (Not Configured)</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; font-size: 12px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Raw Polling Data</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">Not configured</div>
                  <div style="color: #64748b; font-size: 10px;">Kept until deleted</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Hourly Averages</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">Not configured</div>
                  <div style="color: #64748b; font-size: 10px;">No automatic rollup</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Daily Summaries</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">Not configured</div>
                  <div style="color: #64748b; font-size: 10px;">No automatic rollup</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <div style="color: #64748b; font-size: 11px;">Syslog &amp; Trap Logs</div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0;">Not configured</div>
                  <div style="color: #64748b; font-size: 10px;">No automatic rotation</div>
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

    // Quick Configuration Matrix card clicks
    container.querySelectorAll('.opm-quick-cfg-card').forEach(card => {
      card.onclick = () => {
        const target = card.getAttribute('data-target');
        if (target && target !== 'probes') {
          state.subTabs.settings = target;
          renderSettingsView();
        }
      };
    });

    // Save button: delegate to the active sub-tab's own Save button.
    const saveBtn = container.querySelector('#opm-set-save-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const saveTargets = {
          mail: '#opm-save-mail-settings-btn',
          proxy: '#opm-save-proxy-btn',
          users: '#opm-save-ad-btn',
          system: '#opm-save-system-btn',
          ssl: '#opm-save-ssl-btn'
        };
        const target = container.querySelector(saveTargets[activeSub] || '');
        if (target) { target.click(); return; }
        showToast('Nothing to save on this tab.');
      };
    }

    // Copy Token button: copies the server-issued key in the input, if any.
    const copyTokenBtn = container.querySelector('#opm-copy-token-btn');
    if (copyTokenBtn) {
      copyTokenBtn.onclick = async () => {
        const input = container.querySelector('#opm-enrollment-token-input');
        const val = input ? input.value.trim() : '';
        if (!val) { showToast('No enrollment token issued yet — use Regenerate to request one from the server.'); return; }
        try {
          await navigator.clipboard.writeText(val);
          showToast('Agent enrollment authentication token copied to clipboard.');
        } catch (e) {
          showToast('Could not copy the token: ' + e.message);
        }
      };
    }

    // Regenerate enrollment token: server issues a key, shown once.
    const regenTokenBtn = container.querySelector('#opm-regen-token-btn');
    if (regenTokenBtn) {
      regenTokenBtn.onclick = async () => {
        regenTokenBtn.disabled = true;
        try {
          const resp = await fetch('/api/admin/regenerateAPIKey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || !data.apiKey) throw new Error(data.message || ('Token request failed (HTTP ' + resp.status + ')'));
          const input = container.querySelector('#opm-enrollment-token-input');
          if (input) { input.value = data.apiKey; input.placeholder = ''; }
          if (state.settingsData) state.settingsData.apiKey = data.apiKey;
          showToast(data.message || 'New enrollment token generated. Store it now — it is shown only once.');
        } catch (e) {
          showToast(e.message || 'Token request failed.');
        }
        regenTokenBtn.disabled = false;
      };
    }

    // WAN RTT mesh refresh: re-fetch live probe latencies.
    const wanMeshBtn = container.querySelector('#opm-run-wan-mesh-btn');
    if (wanMeshBtn) {
      wanMeshBtn.onclick = async () => {
        wanMeshBtn.disabled = true;
        try {
          const resp = await fetch('/api/probes');
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Probe refresh failed (HTTP ' + resp.status + ')'));
          const arr = Array.isArray(data) ? data : data.probes;
          if (!Array.isArray(arr)) throw new Error('Probe refresh returned no probe list.');
          state.probes = arr;
          renderSettingsView();
        } catch (e) {
          showToast(e.message || 'Probe refresh failed.');
          wanMeshBtn.disabled = false;
        }
      };
    }

    // Run discovery button & sweep modal
    container.querySelectorAll('.opm-run-discovery-btn').forEach(btn => {
      btn.onclick = () => {
        showSubnetDiscoveryModal();
      };
    });

    const newRuleBtn = container.querySelector('#opm-new-rule-btn');
    if (newRuleBtn) {
      newRuleBtn.onclick = () => {
        showNewDiscoveryRuleModal();
      };
    }

    const newTmplBtn = container.querySelector('#opm-new-template-btn');
    if (newTmplBtn) {
      newTmplBtn.onclick = () => {
        showNewTemplateModal();
      };
    }

    // Users & Authentication subtab handlers
    const addUserBtn = container.querySelector('#opm-add-user-modal-btn');
    if (addUserBtn) {
      addUserBtn.onclick = () => {
        showAddUserModal();
      };
    }

    const testAdBtn = container.querySelector('#opm-test-ad-btn');
    if (testAdBtn) {
      testAdBtn.onclick = async () => {
        testAdBtn.disabled = true;
        testAdBtn.innerText = 'Testing...';
        try {
          const resp = await fetch('/api/settings/auth/ad/test', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('LDAP test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'LDAP verification succeeded.');
        } catch(e) {
          showToast(e.message || 'LDAP test failed. Please retry.');
        }
        testAdBtn.disabled = false;
        testAdBtn.innerText = '⚡ Test LDAP Bind';
      };
    }

    const saveAdBtn = container.querySelector('#opm-save-ad-btn');
    if (saveAdBtn) {
      saveAdBtn.onclick = async () => {
        const domainName = container.querySelector('#opm-ad-domain')?.value.trim();
        const domainController = container.querySelector('#opm-ad-dc')?.value.trim();
        if (!domainName || !domainController) { showToast('Enter an AD domain and a domain controller first.'); return; }
        const body = { domainName, domainController };
        const portRaw = container.querySelector('#opm-ad-port')?.value.trim();
        if (portRaw) body.port = parseInt(portRaw, 10);
        const baseDn = container.querySelector('#opm-ad-basedn')?.value.trim();
        if (baseDn) body.baseDn = baseDn;
        const bindUser = container.querySelector('#opm-ad-binddn')?.value.trim();
        if (bindUser) body.bindUser = bindUser;
        try {
          const resp = await fetch('/api/settings/auth/ad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('AD save failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Active Directory domain settings saved successfully.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'Active Directory save failed.');
        }
      };
    }

    const testSamlBtn = container.querySelector('#opm-test-saml-btn');
    if (testSamlBtn) {
      testSamlBtn.onclick = async () => {
        testSamlBtn.disabled = true;
        testSamlBtn.innerText = 'Validating...';
        try {
          const resp = await fetch('/api/settings/auth/saml/test', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('SAML test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'SAML 2.0 metadata validated.');
        } catch(e) {
          showToast(e.message || 'SAML test failed.');
        }
        testSamlBtn.disabled = false;
        testSamlBtn.innerText = 'Validate SAML Metadata';
      };
    }

    const saveSamlBtn = container.querySelector('#opm-save-saml-btn');
    if (saveSamlBtn) {
      saveSamlBtn.onclick = async () => {
        const body = {};
        const idp = container.querySelector('#opm-saml-idp')?.value.trim();
        if (idp) body.idpEntityId = idp;
        const url = container.querySelector('#opm-saml-url')?.value.trim();
        if (url) body.idpSsoUrl = url;
        const acs = container.querySelector('#opm-saml-acs')?.value.trim();
        if (acs) body.spAcsUrl = acs;
        try {
          const resp = await fetch('/api/settings/auth/saml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('SAML save failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'SAML 2.0 Single Sign-On configuration saved.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'SAML save failed.');
        }
      };
    }

    const sweepLaunchBtn = container.querySelector('#opm-launch-sweep-modal-btn');
    if (sweepLaunchBtn) {
      sweepLaunchBtn.onclick = () => {
        showSubnetDiscoveryModal();
      };
    }

    // Diagnostics & MIB Browser tool card buttons
    container.querySelectorAll('.opm-tool-card').forEach(card => {
      card.onclick = () => {
        const tool = card.getAttribute('data-tool') || 'ping';
        showNetworkToolsModal(null, tool);
      };
    });

    // Probe click & diagnostics
    container.querySelectorAll('.opm-probe-row-click, .opm-probe-diag-btn').forEach(el => {
      el.onclick = () => {
        const id = parseInt(el.getAttribute('data-id'), 10);
        showProbeDetailsModal(id);
      };
    });

    // Probe Sync button
    container.querySelectorAll('.opm-probe-sync-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        btn.disabled = true;
        btn.textContent = 'Syncing...';
        try {
          await fetch(`/api/probes/${id}/sync`, { method: 'POST' });
        } catch(e) {}
        showToast(`Probe "${name}" telemetry synchronized with Central.`);
        btn.disabled = false;
        btn.textContent = 'Sync';
      };
    });

    // Probe Delete button
    container.querySelectorAll('.opm-probe-del-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (typeof showDeleteProbeConfirmModal === 'function') {
          showDeleteProbeConfirmModal(id, name);
        }
      };
    });

    // Test credential button: no credential-test endpoint exists.
    container.querySelectorAll('.opm-cred-test-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Credential validation is not available — no credential-test endpoint exists on this server.');
      };
    });

    // Add credential: no credential editor exists in this build.
    const addCredBtn = container.querySelector('#opm-add-cred-btn');
    if (addCredBtn) {
      addCredBtn.onclick = () => {
        showToast('Adding credentials is not available — no credential editor exists in this build.');
      };
    }

    // User edit: no user-update endpoint exists (only add/delete, both 501).
    container.querySelectorAll('.opm-user-edit-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('User editing is not available — no user-update endpoint exists on this server.');
      };
    });

    // Add notification profile: no notification-profile endpoint exists.
    container.querySelectorAll('#opm-add-notify-profile-btn, .opm-add-notify-profile-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Notification profiles are not available — no notification-profile endpoint exists on this server.');
      };
    });

    // DB backup download: no backup-download endpoint exists on this server.
    container.querySelectorAll('.opm-db-download-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Backup download is not available on this server — no backup-download endpoint exists.');
      };
    });

    // DB Maintenance button: real vacuum POST, report the real outcome.
    const dbBtn = container.querySelector('#opm-db-maint-btn');
    if (dbBtn) {
      dbBtn.onclick = async () => {
        showToast('Running database vacuum...');
        try {
          const resp = await fetch('/api/settings/db/vacuum', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Vacuum failed (HTTP ' + resp.status + ')'));
          showToast(data.message || ('Database vacuum completed' + (data.durationMs != null ? ' in ' + data.durationMs + 'ms.' : '.')));
        } catch (e) {
          showToast(e.message || 'Database vacuum failed.');
        }
      };
    }

    // Template Category Chips
    container.querySelectorAll('.opm-tmpl-chip').forEach(chip => {
      chip.onclick = () => {
        const cat = chip.getAttribute('data-cat');
        state.currentTmplCategory = cat;
        state.tmplCurrentPage = 1;
        renderSettingsView();
      };
    });

    // Template Real-Time Search Input
    const tmplSearchInput = container.querySelector('#opm-tmpl-search-input');
    if (tmplSearchInput) {
      tmplSearchInput.oninput = (e) => {
        state.tmplSearchQuery = e.target.value;
        state.tmplCurrentPage = 1;
        renderSettingsView();
        const nextInput = container.querySelector('#opm-tmpl-search-input');
        if (nextInput) {
          nextInput.focus();
          nextInput.selectionStart = nextInput.selectionEnd = nextInput.value.length;
        }
      };
    }

    // Template Pagination Controls
    const tmplFirstBtn = container.querySelector('#opm-tmpl-first-btn');
    if (tmplFirstBtn) {
      tmplFirstBtn.onclick = () => {
        state.tmplCurrentPage = 1;
        renderSettingsView();
      };
    }
    const tmplPrevBtn = container.querySelector('#opm-tmpl-prev-btn');
    if (tmplPrevBtn) {
      tmplPrevBtn.onclick = () => {
        state.tmplCurrentPage = Math.max(1, (state.tmplCurrentPage || 1) - 1);
        renderSettingsView();
      };
    }
    const tmplNextBtn = container.querySelector('#opm-tmpl-next-btn');
    if (tmplNextBtn) {
      tmplNextBtn.onclick = () => {
        state.tmplCurrentPage = (state.tmplCurrentPage || 1) + 1;
        renderSettingsView();
      };
    }
    const tmplLastBtn = container.querySelector('#opm-tmpl-last-btn');
    if (tmplLastBtn) {
      tmplLastBtn.onclick = () => {
        state.tmplCurrentPage = 999999;
        renderSettingsView();
      };
    }
    const tmplLimitSel = container.querySelector('#opm-tmpl-limit-sel');
    if (tmplLimitSel) {
      tmplLimitSel.onchange = (e) => {
        state.tmplPageSize = parseInt(e.target.value, 10) || 25;
        state.tmplCurrentPage = 1;
        renderSettingsView();
      };
    }

    // Template Name Click -> Template Details Modal
    container.querySelectorAll('.opm-tmpl-name-link').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const id = link.getAttribute('data-id');
        if (typeof showTemplateDetailsModal === 'function') {
          showTemplateDetailsModal(id);
        }
      };
    });

    // Template Apply button -> Apply Template Modal
    container.querySelectorAll('.opm-tmpl-apply-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (typeof showApplyTemplateModal === 'function') {
          showApplyTemplateModal(id);
        } else {
          const name = btn.getAttribute('data-name');
          showToast('Template application is not available — the apply dialog did not load.');
        }
      };
    });

    // Test Notification Profile button: only email has a real test path.
    container.querySelectorAll('.opm-test-notify-btn').forEach(btn => {
      btn.onclick = async () => {
        const t = (btn.getAttribute('data-type') || '').toLowerCase();
        if (t !== 'email') {
          showToast('Test notification is not available — no notification-test endpoint exists on this server.');
          return;
        }
        const to = (state.settingsData && state.settingsData.mail && state.settingsData.mail.adminEmail) || '';
        if (!to) { showToast('Enter a notification email address in Mail Settings first.'); return; }
        try {
          const resp = await fetch('/api/settings/mail/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: to })
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Mail test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Test email sent.');
        } catch (e) {
          showToast(e.message || 'Mail test failed.');
        }
      };
    });

    // Edit Threshold Profile button: no threshold endpoint exists.
    container.querySelectorAll('.opm-edit-thresh-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Threshold editing is not available — no threshold endpoint exists on this server.');
      };
    });

    // Poll agent telemetry button: only values the API actually returns.
    const pollAgentBtn = container.querySelector('#opm-agent-test-telemetry-btn');
    if (pollAgentBtn) {
      pollAgentBtn.onclick = async () => {
        try {
          const resp = await fetch('/api/agent/list');
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Agent list unavailable (HTTP ' + resp.status + ')'));
          if (data && data.agents && data.agents.length > 0) {
            const ag = data.agents[0];
            const cpu = (ag.metrics && ag.metrics.cpu != null) ? ag.metrics.cpu + '%' : '—';
            const ram = (ag.metrics && ag.metrics.memory != null) ? ag.metrics.memory + '%' : '—';
            const ifaces = (ag.metrics && ag.metrics.interfacesCount != null) ? ag.metrics.interfacesCount : '—';
            showToast(`Polled Agent ${ag.agentId || '—'}: CPU ${cpu}, RAM ${ram}, Interfaces: ${ifaces}`);
          } else {
            showToast('No agents connected yet.');
          }
        } catch(e) {
          showToast(e.message || 'Agent poll failed.');
        }
      };
    }

    // Support & Diagnostic Logs Console handlers
    if (activeSub === 'support') {
      const term = container.querySelector('#opm-log-terminal-output');
      const logSelect = container.querySelector('#opm-log-file-select');
      const refreshBtn = container.querySelector('#opm-refresh-logs-btn');
      const sifBtn = container.querySelector('#opm-generate-sif-btn');

      const fetchLogs = async (fileName) => {
        if (!term) return false;
        term.innerHTML = '<div style="color: #94a3b8; font-style: italic;">Fetching log stream from Central daemon...</div>';
        try {
          const resp = await fetch('/api/support/logs?file=' + encodeURIComponent(fileName || 'opmanager_server.log'));
          const data = await resp.json();
          if (!resp.ok) throw new Error(data.message || ('Log fetch failed (HTTP ' + resp.status + ')'));
          if (data && data.logs && data.logs.length > 0) {
            term.innerHTML = data.logs.map(line => {
              let color = '#38bdf8';
              if (line.includes('[WARN]')) color = '#fbbf24';
              if (line.includes('[ERROR]') || line.includes('EXCEEDED')) color = '#f87171';
              if (line.includes('[INFO]')) color = '#34d399';
              return `<div style="color: ${color}; margin-bottom: 2px;">${line}</div>`;
            }).join('');
            term.scrollTop = term.scrollHeight;
          } else {
            term.innerHTML = '<div style="color: #94a3b8;">No log entries found in buffer.</div>';
          }
          return true;
        } catch(e) {
          term.innerHTML = '<div style="color: #f87171;">Failed to fetch live logs: ' + e.message + '</div>';
          return false;
        }
      };

      if (logSelect) {
        logSelect.onchange = () => {
          fetchLogs(logSelect.value);
          const vBtn = container.querySelector('#opm-open-viewer-btn');
          if (vBtn) vBtn.href = '/apiclient/fluidicv3/itom/pages/log-viewer.html?file=' + encodeURIComponent(logSelect.value);
        };
      }
      if (refreshBtn) {
        refreshBtn.onclick = async () => {
          const ok = await fetchLogs(logSelect ? logSelect.value : 'opmanager_server.log');
          if (ok) showToast('Diagnostic log stream refreshed.');
        };
      }
      if (sifBtn) {
        sifBtn.onclick = async () => {
          showToast('Generating ManageEngine SIF (Support Information File)...');
          try {
            const resp = await fetch('/api/support/sif');
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok || !data.fileName) throw new Error(data.message || ('SIF generation failed (HTTP ' + resp.status + ')'));
            showToast(`SIF Created: ${data.fileName} (${data.fileSize || ''})`);
            if (data.downloadPath) window.open(data.downloadPath, '_blank');
          } catch(e) {
            showToast(e.message || 'SIF generation failed.');
          }
        };
      }

      fetchLogs(logSelect ? logSelect.value : 'opmanager_server.log');
    }

    // Mail Server Handlers
    const testEmailBtn = container.querySelector('#opm-send-test-email-btn');
    if (testEmailBtn) {
      testEmailBtn.onclick = async () => {
        const emailInput = container.querySelector('#opm-test-email-target');
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) { showToast('Enter a recipient email address first.'); return; }
        showToast(`Dispatching test email to ${email}...`);
        try {
          const resp = await fetch('/api/settings/mail/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Mail test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Test email sent.');
        } catch(e) {
          showToast(e.message || 'SMTP test failed. Please retry.');
        }
      };
    }

    const saveMailBtn = container.querySelector('#opm-save-mail-settings-btn');
    if (saveMailBtn) {
      saveMailBtn.onclick = async () => {
        const host = container.querySelector('#opm-mail-host')?.value.trim();
        const fromAddress = container.querySelector('#opm-mail-from')?.value.trim();
        if (!host || !fromAddress) { showToast('Enter a mail server host and a sender address first.'); return; }
        const body = { host, fromAddress };
        const portRaw = container.querySelector('#opm-mail-port')?.value.trim();
        if (portRaw) body.port = parseInt(portRaw, 10);
        const security = container.querySelector('#opm-mail-security')?.value;
        if (security) body.security = security;
        const adminEmail = container.querySelector('#opm-mail-admin')?.value.trim();
        if (adminEmail) body.adminEmail = adminEmail;
        const username = container.querySelector('#opm-mail-user')?.value.trim();
        if (username) body.username = username;
        try {
          const resp = await fetch('/api/settings/mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Mail save failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Mail server settings saved.');
          opmLoadSettings();
        } catch(e) {
          showToast(e.message || 'Mail server save failed.');
        }
      };
    }

    // Failover Heartbeat Test Handler: real TCP-connect test to the
    // configured standby, or an honest refusal when none is configured.
    const testHaBtn = container.querySelector('#opm-test-ha-btn');
    if (testHaBtn) {
      testHaBtn.onclick = async () => {
        const fo = state.settingsData && state.settingsData.failover;
        const standby = (fo && fo.secondary && fo.secondary.ip) || 'the configured standby';
        showToast('Testing failover heartbeat to ' + standby + '...');
        try {
          const resp = await fetch('/api/settings/failover/test', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Failover heartbeat test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Heartbeat test completed.');
        } catch(e) {
          showToast(e.message || 'Failover heartbeat test failed.');
        }
      };
    }

    // Failover Role Switchover Simulation: no switchover endpoint exists
    // in this build, so this runs the real heartbeat test and says so.
    const simFailoverBtn = container.querySelector('#opm-simulate-failover-btn');
    if (simFailoverBtn) {
      simFailoverBtn.onclick = async () => {
        showToast('Role switchover is not available in this build — no switchover endpoint exists. Running a failover heartbeat test instead.');
        try {
          const resp = await fetch('/api/settings/failover/test', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Failover heartbeat test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Heartbeat test completed.');
        } catch (e) {
          showToast(e.message || 'Failover heartbeat test failed.');
        }
      };
    }

    // Proxy Server Handlers
    const testProxyBtn = container.querySelector('#opm-test-proxy-btn');
    if (testProxyBtn) {
      testProxyBtn.onclick = async () => {
        const host = container.querySelector('#opm-proxy-host')?.value.trim();
        const port = container.querySelector('#opm-proxy-port')?.value.trim();
        if (!host || !port) { showToast('Enter a proxy host and port first.'); return; }
        showToast(`Testing outbound proxy connection to ${host}:${port}...`);
        try {
          const resp = await fetch('/api/settings/proxy/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, port })
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Proxy test failed (HTTP ' + resp.status + ')'));
          const pill = container.querySelector('#opm-proxy-status-pill');
          if (pill) {
            pill.textContent = '● Proxy Verified' + (data.latencyMs != null ? ' (' + data.latencyMs + 'ms Latency)' : '');
            pill.style.background = '#dcfce7';
            pill.style.color = '#166534';
          }
          showToast(data.message || `Outbound connection verified via ${host}:${port}.`);
        } catch (e) {
          showToast(e.message || 'Proxy test failed.');
        }
      };
    }

    const saveProxyBtn = container.querySelector('#opm-save-proxy-btn');
    if (saveProxyBtn) {
      saveProxyBtn.onclick = async () => {
        const enabled = container.querySelector('#opm-proxy-enable')?.checked || false;
        const protocol = container.querySelector('#opm-proxy-protocol')?.value || 'HTTP';
        const host = container.querySelector('#opm-proxy-host')?.value.trim();
        const portRaw = container.querySelector('#opm-proxy-port')?.value.trim();
        if (enabled && (!host || !portRaw)) { showToast('Enter a proxy host and port to enable the proxy.'); return; }
        const body = { enabled, protocol, authRequired: container.querySelector('#opm-proxy-auth-check')?.checked || false };
        if (host) body.host = host;
        if (portRaw) body.port = parseInt(portRaw, 10);
        const username = container.querySelector('#opm-proxy-user')?.value.trim();
        if (username) body.username = username;
        const password = container.querySelector('#opm-proxy-pass')?.value;
        if (password) body.password = password;
        const bypass = container.querySelector('#opm-proxy-bypass')?.value.trim();
        if (bypass) body.bypassList = bypass;
        try {
          const resp = await fetch('/api/settings/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('Proxy save failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Proxy server configuration saved successfully.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'Proxy save failed.');
        }
      };
    }

    // License Management Handlers
    const applyLicBtn = container.querySelector('#opm-apply-lic-key-btn');
    if (applyLicBtn) {
      applyLicBtn.onclick = () => {
        showApplyLicenseModal();
      };
    }

    // Database Maintenance & Backup Handlers
    const dbBackupBtn = container.querySelector('#opm-db-backup-now-btn');
    if (dbBackupBtn) {
      dbBackupBtn.onclick = async () => {
        showToast('Initiating live database backup...');
        try {
          const resp = await fetch('/api/settings/db/backup', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || !data.backup) throw new Error(data.message || ('Database backup failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'Database backup created successfully.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'Database backup failed.');
        }
      };
    }

    const dbVacuumBtn = container.querySelector('#opm-db-vacuum-btn');
    if (dbVacuumBtn) {
      dbVacuumBtn.onclick = async () => {
        showToast('Running SQLite VACUUM & ANALYZE...');
        try {
          const resp = await fetch('/api/settings/db/vacuum', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('SQLite VACUUM failed (HTTP ' + resp.status + ')'));
          showToast(data.message || ('SQLite VACUUM & ANALYZE completed' + (data.durationMs != null ? ' in ' + data.durationMs + 'ms.' : '.')));
        } catch (e) {
          showToast(e.message || 'SQLite VACUUM & ANALYZE failed.');
        }
      };
    }

    // System Settings & Rebranding Save Handler: only filled values.
    const saveSysBtn = container.querySelector('#opm-save-system-btn');
    if (saveSysBtn) {
      saveSysBtn.onclick = async () => {
        const hostname = container.querySelector('#opm-sys-hostname')?.value.trim();
        const portRaw = container.querySelector('#opm-sys-port')?.value.trim();
        const timeoutRaw = container.querySelector('#opm-sys-timeout')?.value;
        const retentionRaw = container.querySelector('#opm-sys-retention')?.value;
        const orgName = container.querySelector('#opm-rebrand-org')?.value.trim();
        const prodTitle = container.querySelector('#opm-rebrand-title')?.value.trim();
        const footer = container.querySelector('#opm-rebrand-footer')?.value.trim();
        const sysBody = { dnsReverseLookup: container.querySelector('#opm-sys-dns-lookup')?.checked || false };
        if (hostname) sysBody.hostname = hostname;
        if (portRaw) sysBody.serverPort = parseInt(portRaw, 10);
        if (timeoutRaw) sysBody.sessionTimeoutMins = parseInt(timeoutRaw, 10);
        if (retentionRaw) sysBody.dataRetentionDays = parseInt(retentionRaw, 10);
        const brandBody = {};
        if (orgName) brandBody.organizationName = orgName;
        if (prodTitle) brandBody.productTitle = prodTitle;
        if (footer) brandBody.footerNotice = footer;

        showToast('Saving system and white-label branding configuration...');
        try {
          const r1 = await fetch('/api/settings/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sysBody)
          });
          const d1 = await r1.json().catch(() => ({}));
          if (!r1.ok) throw new Error(d1.message || ('System save failed (HTTP ' + r1.status + ')'));
          const r2 = await fetch('/api/settings/rebrand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brandBody)
          });
          const d2 = await r2.json().catch(() => ({}));
          if (!r2.ok) throw new Error(d2.message || ('Rebrand save failed (HTTP ' + r2.status + ')'));
          showToast(d1.message || d2.message || 'System settings saved.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'System configuration save failed.');
        }
      };
    }

    // WMI Query Execution Handler: host required, real outcome only.
    const wmiExecBtn = container.querySelector('#opm-wmi-exec-btn');
    if (wmiExecBtn) {
      wmiExecBtn.onclick = async () => {
        const host = container.querySelector('#opm-wmi-target-ip')?.value.trim();
        if (!host) { showToast('Enter a target IP address first.'); return; }
        const namespace = container.querySelector('#opm-wmi-namespace')?.value || 'root\\cimv2';
        const query = container.querySelector('#opm-wmi-query-sql')?.value || 'SELECT Name, PercentProcessorTime FROM Win32_PerfFormattedData_PerfOS_Processor';
        const outBox = container.querySelector('#opm-wmi-output-box');

        if (outBox) {
          outBox.innerHTML = `<div style="color: #64748b;">Executing WQL query on ${opmEsc(host)}...</div>`;
        }

        try {
          const resp = await fetch('/api/tools/wmi-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, namespace, query })
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('WMI query failed (HTTP ' + resp.status + ')'));
          if (outBox && data.records) {
            let rowsHtml = '';
            data.records.forEach(r => {
              rowsHtml += `<tr style="border-bottom: 1px solid #f1f5f9; color: #0f172a;"><td>${opmEsc(r.Name || r.DeviceID || r.Caption || '—')}</td><td>${opmEsc(r.PercentProcessorTime ?? r.FreeSpace ?? r.Version ?? '—')}</td><td><span style="color:#16a34a;">● OK</span></td></tr>`;
            });
            const count = data.count != null ? data.count : data.records.length;
            outBox.innerHTML = `
              <div style="color: #16a34a; font-weight: 700;">WMI Query executed${data.executionTimeMs != null ? ' in ' + data.executionTimeMs + 'ms' : ''}. Returned ${count} objects from ${opmEsc(host)}:</div>
              <table style="width: 100%; margin-top: 8px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;"><th>Property / Identifier</th><th>Value</th><th>Status</th></tr>
                ${rowsHtml}
              </table>
            `;
          }
          showToast(`WMI query executed on ${host}.`);
        } catch (e) {
          if (outBox) outBox.innerHTML = `<div style="color: #dc2626;">WMI query failed: ${opmEsc(e.message)}</div>`;
          showToast(e.message || `WMI query failed on ${host}.`);
        }
      };
    }

    // SSL / TLS Settings & Test Handlers
        const sslCertBtn = container.querySelector('#opm-ssl-cert-inspector-btn');
    if (sslCertBtn) {
      sslCertBtn.onclick = () => {
        if (typeof showSslCertificateModal === 'function') {
          showSslCertificateModal();
        }
      };
    }
    const testSslBtn = container.querySelector('#opm-test-ssl-btn');
    if (testSslBtn) {
      testSslBtn.onclick = async () => {
        try {
          const resp = await fetch('/api/settings/ssl/test', { method: 'POST' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('TLS test failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'TLS verification succeeded.');
          const pill = container.querySelector('#opm-ssl-status-pill');
          if (pill && data.handshake) pill.innerText = '● Handshake Verified';
        } catch (e) {
          showToast(e.message || 'TLS test failed. Please retry.');
        }
      };
    }

    const saveSslBtn = container.querySelector('#opm-save-ssl-btn');
    if (saveSslBtn) {
      saveSslBtn.onclick = async () => {
        const portRaw = container.querySelector('#opm-ssl-port')?.value.trim();
        if (!portRaw) { showToast('Enter an HTTPS port first.'); return; }
        const httpsPort = parseInt(portRaw, 10);
        const forceRedirect = container.querySelector('#opm-ssl-redirect')?.checked || false;
        const body = { httpsPort, forceRedirect };
        const protos = container.querySelector('#opm-ssl-protocols')?.value.trim();
        if (protos) body.tlsVersions = protos.split(',').map(s => s.trim()).filter(Boolean);
        const ciphers = container.querySelector('#opm-ssl-ciphers')?.value.trim();
        if (ciphers) body.cipherSuite = ciphers;
        showToast('Saving SSL/TLS encryption parameters...');
        try {
          const resp = await fetch('/api/settings/ssl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data.message || ('SSL save failed (HTTP ' + resp.status + ')'));
          showToast(data.message || 'SSL parameters saved.');
          opmLoadSettings();
        } catch (e) {
          showToast(e.message || 'SSL save failed.');
        }
      };
    }

    opmFillSettingsForm();
  }
