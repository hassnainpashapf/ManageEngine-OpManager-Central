  // -------------------------------------------------------------
  // REAL-DATA HELPERS (04): no invented values. Every number,
  // timestamp and status below comes from a real API response.
  // Unknown fields render as '—', never as a plausible default.
  // -------------------------------------------------------------
  function alarmTech(alm) {
    return (alm && (alm.technician || alm.who)) || '—';
  }

  function alarmTime(alm) {
    return (alm && (alm.time || alm.prettyTime)) || '—';
  }

  function fmtTime(ts) {
    if (ts === null || ts === undefined || ts === '') return '—';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }

  function probeLatency(pr) {
    if (!pr) return null;
    const v = pr.latency_ms ?? pr.latency;
    return (typeof v === 'number' && Number.isFinite(v)) ? v : null;
  }

  function probeDeviceCount(pr) {
    if (!pr) return 0;
    return state.devices.filter(d => String(d.probeId ?? d.probe_id) === String(pr.id)).length;
  }

  function escHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('opm_auth_token');
      if (token) headers['Authorization'] = 'Bearer ' + token;
    } catch (e) { /* storage unavailable — proceed without a token */ }
    return headers;
  }

  async function apiPost(path, body) {
    const res = await fetch(path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body || {}) });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || ('Request failed (' + res.status + ')'));
    return data || {};
  }

  function apiGetJson(path) {
    return fetch(path).then(async res => {
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || ('Request failed (' + res.status + ')'));
      return data || {};
    });
  }

  // Alarm aux counts (traps / syslog / suppression) — fetched at most
  // once every 30 s; the view re-renders only when a count changes.
  let alarmAuxLastFetch = 0;
  let alarmAuxFetching = false;
  function refreshAlarmAuxData() {
    const now = Date.now();
    if (alarmAuxFetching || now - alarmAuxLastFetch < 30000) return;
    alarmAuxFetching = true;
    alarmAuxLastFetch = now;
    Promise.all([
      apiGetJson('/api/traps/list').catch(() => null),
      apiGetJson('/api/syslog/list').catch(() => null),
      apiGetJson('/api/alarm/getSuppressionCount').catch(() => null)
    ]).then(([traps, syslog, supp]) => {
      const nextCounts = {
        traps: traps && typeof traps.total === 'number' ? traps.total : (traps && Array.isArray(traps.traps) ? traps.traps.length : null),
        syslog: syslog && typeof syslog.total === 'number' ? syslog.total : (syslog && Array.isArray(syslog.messages) ? syslog.messages.length : null)
      };
      const nextSupp = supp ? { suppressedCount: supp.suppressedCount ?? 0, activeProblems: supp.activeProblems ?? 0, noiseReductionPercent: supp.noiseReductionPercent ?? null } : null;
      const changed = JSON.stringify(nextCounts) !== JSON.stringify(state.alarmAuxCounts) || JSON.stringify(nextSupp) !== JSON.stringify(state.alarmSuppression);
      state.alarmAuxCounts = nextCounts;
      state.alarmSuppression = nextSupp;
      if (changed && state.currentTab === 'alarms' && typeof renderAlarmsView === 'function') renderAlarmsView();
    }).finally(() => { alarmAuxFetching = false; });
  }

  // RCA incidents — real stored alarms grouped by device.
  let rcaLastFetch = 0;
  let rcaFetching = false;
  function loadRcaIncidents() {
    const now = Date.now();
    if (rcaFetching || now - rcaLastFetch < 30000) return;
    rcaFetching = true;
    rcaLastFetch = now;
    apiGetJson('/api/alarm/getRCAIncidents')
      .then(data => {
        const incidents = Array.isArray(data.incidents) ? data.incidents : [];
        if (JSON.stringify(incidents) !== JSON.stringify(state.rcaIncidents)) {
          state.rcaIncidents = incidents;
          if (state.currentTab === 'alarms' && state.subTabs.alarms === 'rca' && typeof renderAlarmsView === 'function') renderAlarmsView();
        }
      })
      .catch(() => {})
      .finally(() => { rcaFetching = false; });
  }

  // Racks — only racks actually created via POST /api/racks/create.
  let racksLoading = false;
  async function loadRacks() {
    if (racksLoading) return;
    racksLoading = true;
    try {
      const data = await apiGetJson('/api/racks/list');
      const racks = Array.isArray(data.racks) ? data.racks : [];
      if (JSON.stringify(racks) !== JSON.stringify(state.racks)) {
        state.racks = racks;
        if (state.currentTab === 'maps' && state.subTabs.maps === 'rack' && typeof renderMapsView === 'function') renderMapsView();
      }
    } catch (err) {
      state.racks = null;
      state.racksError = err.message;
      if (state.currentTab === 'maps' && state.subTabs.maps === 'rack' && typeof renderMapsView === 'function') renderMapsView();
    } finally {
      racksLoading = false;
    }
  }

  // Rack sub-tab body: real racks from /api/racks/list, or an honest
  // empty / loading / error state. Never invented racks.
  function renderRackSubtab() {
    if (state.racks === undefined) {
      loadRacks();
      return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Loading racks…</div>
            <div style="font-size: 12px; color: #64748b;">Fetching racks created via the API.</div>
          </div>`;
    }
    if (state.racks === null) {
      return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Couldn’t load racks</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto 16px auto;">${escHtml(state.racksError || 'The rack list could not be loaded.')}</div>
            <button id="opm-racks-retry-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Retry</button>
          </div>`;
    }
    if (state.racks.length === 0) {
      return `
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
          </div>`;
    }
    const selected = state.racks.find(r => String(r.id) === String(state.selectedRackId)) || state.racks[0];
    const assignments = Array.isArray(selected.assignments) ? selected.assignments : [];
    const byUnit = {};
    assignments.forEach(a => { byUnit[a.unit] = a; });
    const totalUnits = Math.min(selected.units || 0, 100);
    const occupied = Object.keys(byUnit).filter(u => Number(u) >= 1 && Number(u) <= totalUnits).length;
    let unitRows = '';
    for (let u = totalUnits; u >= 1; u--) {
      const a = byUnit[u];
      unitRows += a ? `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f1f5f9;">
              <span style="width: 44px; font-size: 11px; font-weight: 700; color: #64748b;">U${u}</span>
              <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${escHtml(a.deviceName || '—')}</span>
              <span style="font-size: 11px; color: #64748b;">${escHtml(a.deviceIp || '—')}</span>
              <span style="font-size: 11px; color: #64748b;">${escHtml(a.deviceCategory || '')}</span>
            </div>` : `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f1f5f9; opacity: 0.6;">
              <span style="width: 44px; font-size: 11px; font-weight: 700; color: #64748b;">U${u}</span>
              <span style="font-size: 11px; color: #475569; font-style: italic;">Empty slot</span>
            </div>`;
    }
    return `
          <div style="padding: 20px 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escHtml(selected.name || '—')}</span>
                  <span style="font-size: 11px; color: #64748b; margin-left: 8px;">${occupied} of ${selected.units || 0} units occupied</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <select id="opm-rack-select" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                    ${state.racks.map(r => `<option value="${r.id}" ${String(r.id) === String(selected.id) ? 'selected' : ''}>${escHtml(r.name || '—')} (${r.units || 0}U)</option>`).join('')}
                  </select>
                  <button id="opm-create-rack-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Create New Rack</button>
                </div>
              </div>
              ${unitRows || '<div style="padding: 40px; text-align: center; color: #94a3b8;">No units in this rack yet.</div>'}
            </div>
          </div>`;
  }

  // -------------------------------------------------------------
  // VIEW: ALARMS (Active, Problems, All, EventLog, Syslog, Traps, Custom)
  // -------------------------------------------------------------
  function renderAlarmsView() {
    state.currentTab = 'alarms';
    const container = ensureOverlayContainer();
    const activeSub = state.subTabs.alarms || 'active';
    refreshAlarmAuxData();
    if (activeSub === 'rca') loadRcaIncidents();

    const subtabs = [
      { id: 'active', name: `Active Alarms (${state.alarms.length})` },
      { id: 'rca', name: 'Root Cause Analysis (RCA)' },
      { id: 'problems', name: 'Problems & Correlated Events' },
      { id: 'all', name: `All Alarms (${state.alarms.length})` },
      { id: 'eventlog', name: 'Windows Event Logs' },
      { id: 'syslog', name: state.alarmAuxCounts && state.alarmAuxCounts.syslog != null ? `Syslog (${state.alarmAuxCounts.syslog})` : 'Syslog' },
      { id: 'traps', name: state.alarmAuxCounts && state.alarmAuxCounts.traps != null ? `SNMP Traps (${state.alarmAuxCounts.traps})` : 'SNMP Traps' },
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
    const countAck = state.alarms.filter(a => { const t = a.technician || a.who; return t && t !== 'Unacknowledged'; }).length;
    const countUnack = countAll - countAck;
    const oputilsAlarmCount = state.alarms.filter(a => ['Switch','Router','Port','IPAM'].includes(a.category)).length;
    const critMatches = state.alarms.filter(a => a.severity === 'Critical' && ['Routers', 'Switches', 'Switch', 'Router'].includes(a.category)).length;
    const storageMatches = state.alarms.filter(a => (a.entity || '').toLowerCase().includes('disk')).length;
    const unackMatches = countUnack;

    // Filter alarms for active subtab
    let list = state.alarms;
    if (state.selectedProbe !== 'all') {
      list = list.filter(a => a.probeId == state.selectedProbe);
    }
    if (state.alarmsSeverityFilter !== 'all') {
      list = list.filter(a => a.severity.toLowerCase() === state.alarmsSeverityFilter.toLowerCase());
    }

    // All Alarms archive — real stored alarms only; no invented totals.
    const archiveFilter = state.alarmsArchiveFilter || { range: '7d', severity: 'all', status: 'cleared', search: '' };
    const archiveRangeMs = (range) => range === '24h' ? 86400000 : range === '7d' ? 7 * 86400000 : range === '30d' ? 30 * 86400000 : 0;
    const archiveRangeCount = (range) => {
      const ms = archiveRangeMs(range);
      if (!ms) return state.alarms.length;
      return state.alarms.filter(a => { const ts = a.timestamp || a.created_at || 0; return ts === 0 || ts >= Date.now() - ms; }).length;
    };
    const archiveClearedCount = state.alarms.filter(a => String(a.severity || '').toLowerCase() === 'clear').length;
    const archiveRows = state.alarms.filter(a => {
      const ts = a.timestamp || a.created_at || 0;
      const ms = archiveRangeMs(archiveFilter.range);
      if (ms && ts !== 0 && ts < Date.now() - ms) return false;
      if (archiveFilter.severity !== 'all' && String(a.severity || '').toLowerCase() !== String(archiveFilter.severity).toLowerCase()) return false;
      if (archiveFilter.status === 'cleared' && String(a.severity || '').toLowerCase() !== 'clear') return false;
      if (archiveFilter.search) {
        const q = archiveFilter.search.toLowerCase();
        const hay = `${a.message || ''} ${a.device || ''} ${a.entity || ''} ${a.probe || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; overflow-x: auto;">
        <div style="display: flex; align-items: center; gap: 2px;">
          ${subtabNavHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding-left: 12px;">
          ${state.alarmSuppression && state.alarmSuppression.suppressedCount > 0 ? `
          <div title="Event Correlation Noise Reduction: ${state.alarmSuppression.suppressedCount} raw alerts suppressed into ${state.alarmSuppression.activeProblems} actionable incidents" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 5px; cursor: default;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
            ${state.alarmSuppression.noiseReductionPercent || ''} Noise Reduction
          </div>
          ` : ''}

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
          <button id="opm-alarms-export-btn" ${list.length === 0 ? 'disabled title="Nothing to export yet"' : ''} style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 5px 11px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
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
                        <span style="font-weight: 600; color: #1e293b;">${escHtml(alm.message || '—')}</span>
                        <span style="color: #64748b; font-size: 11px; margin-left: 6px;">| ${alm.ip || '—'} | ${alm.device || '—'} | ${alm.probe || '—'} | ${alarmTech(alm)} | ${alm.severity} |</span>
                      </td>
                      <td style="padding: 9px 14px; font-weight: 600; color: #475569; font-size: 11px;">${escHtml(alm.entity || '—')}</td>
                      <td style="padding: 9px 14px; font-size: 11px; color: #64748b;">${escHtml(alarmTime(alm))}</td>
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
          ${state.rcaIncidents && state.rcaIncidents.length > 0 ? `
          <div style="padding: 20px 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">Device</th>
                    <th style="padding: 10px 14px;">Alarms</th>
                    <th style="padding: 10px 14px;">Started</th>
                    <th style="padding: 10px 14px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.rcaIncidents.map(inc => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 9px 14px; font-weight: 600; color: #0f172a;">${escHtml(inc.deviceName || '—')}</td>
                    <td style="padding: 9px 14px; color: #475569;">${inc.alarmCount || 0}</td>
                    <td style="padding: 9px 14px; color: #64748b;">${fmtTime(inc.startedAt)}</td>
                    <td style="padding: 9px 14px; color: #475569;">${inc.status === 'open' ? 'Open' : 'Cleared'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
              <div style="padding: 10px 16px; background: #fafbfc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">Showing ${state.rcaIncidents.length} of ${state.rcaIncidents.length} root cause incidents</div>
            </div>
          </div>
          ` : `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No Active Root Cause Incidents</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Zia AI machine-learning correlation engine is standby. Root cause blast-radius graphs will render here if critical incidents occur.
            </div>
          </div>
          `}
      ` : activeSub === 'problems' ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 6px;">No problems detected</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Correlated problem events will appear here when alarms cluster on the same device or service.
            </div>
          </div>
        ` : activeSub === 'all' ? `
        <!-- SUBTAB: ALL ALARMS (HISTORICAL ARCHIVE — real stored alarms) -->
        <div style="padding: 20px 24px;">
          <!-- Filter Toolbar -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <select id="opm-archive-range" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="24h" ${archiveFilter.range === '24h' ? 'selected' : ''}>Past 24 Hours (${archiveRangeCount('24h')})</option>
                <option value="7d" ${archiveFilter.range === '7d' ? 'selected' : ''}>Past 7 Days (${archiveRangeCount('7d')})</option>
                <option value="30d" ${archiveFilter.range === '30d' ? 'selected' : ''}>Past 30 Days (${archiveRangeCount('30d')})</option>
                <option value="all" ${archiveFilter.range === 'all' ? 'selected' : ''}>All Time (${state.alarms.length})</option>
              </select>
              <select id="opm-archive-severity" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="all" ${archiveFilter.severity === 'all' ? 'selected' : ''}>All Severities</option>
                <option value="Critical" ${archiveFilter.severity === 'Critical' ? 'selected' : ''}>Critical Only</option>
                <option value="Trouble" ${archiveFilter.severity === 'Trouble' ? 'selected' : ''}>Trouble Only</option>
                <option value="Attention" ${archiveFilter.severity === 'Attention' ? 'selected' : ''}>Attention Only</option>
              </select>
              <select id="opm-archive-status" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="all" ${archiveFilter.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="cleared" ${archiveFilter.status === 'cleared' ? 'selected' : ''}>Cleared Only (${archiveClearedCount})</option>
              </select>
              <input id="opm-archive-search" type="text" placeholder="Search archive alarms..." value="${escHtml(archiveFilter.search)}" style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; width: 220px;">
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
                ${archiveRows.length === 0 ? `
                <tr>
                  <td colspan="7" style="padding: 40px; text-align: center; color: #94a3b8;">
                    ${state.alarms.length === 0 ? 'No historical alarms recorded. All monitored systems are operating normally.' : 'No alarms match these filters.'}
                    ${state.alarms.length === 0 ? '' : `<br><button id="opm-archive-clear-filters" style="margin-top: 10px; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Clear filters</button>`}
                  </td>
                </tr>
                ` : archiveRows.map(alm => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 14px;">${getStatusBadge(alm.severity)}</td>
                  <td style="padding: 9px 14px;"><div style="font-weight: 600; color: #0f172a;">${escHtml(alm.device || '—')}</div><div style="font-size: 11px; color: #64748b;">${escHtml(alm.probe || '—')}</div></td>
                  <td style="padding: 9px 14px; color: #475569;">${escHtml(alm.entity || '—')}</td>
                  <td style="padding: 9px 14px; color: #0f172a;">${escHtml(alm.message || '—')}</td>
                  <td style="padding: 9px 14px; color: #64748b;">—</td>
                  <td style="padding: 9px 14px; color: #64748b;">${String(alm.severity || '').toLowerCase() === 'clear' ? escHtml(alarmTech(alm)) : '—'}</td>
                  <td style="padding: 9px 14px; color: #475569;">${String(alm.severity || '').toLowerCase() === 'clear' ? 'Cleared' : escHtml(alm.status || 'Active')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <div style="padding: 10px 16px; background: #fafbfc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Showing ${archiveRows.length} of ${state.alarms.length} historical alarms</span>
              <span>Page 1 of 1</span>
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
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid ${oputilsAlarmCount > 0 ? '#dc2626' : '#16a34a'};">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Port & IP Alarms</div>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">${oputilsAlarmCount}</div>
              <div style="font-size: 11px; color: ${oputilsAlarmCount > 0 ? '#dc2626' : '#16a34a'}; margin-top: 2px;">${oputilsAlarmCount === 0 ? 'All Ports & Subnets Clean' : 'Active Port Alerts'}</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ea580c;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">IP Address Conflict</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">—</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">No IPAM data yet — run discovery first</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #ca8a04;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Switch Port Flap</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">—</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">No port data yet — run discovery first</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; border-left: 4px solid #0070e0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Rogue Detection</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">—</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">No rogue scan data yet</div>
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
                <span style="background: ${critMatches > 0 ? '#fee2e2' : '#f1f5f9'}; color: ${critMatches > 0 ? '#991b1b' : '#64748b'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${critMatches} MATCH${critMatches === 1 ? '' : 'ES'}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Criteria: Severity = Critical AND Category IN (Routers, Switches)</div>
              <button class="opm-run-custom-view-btn" data-view="p1" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Run Filtered View</button>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Database Storage Warnings (>85%)</span>
                <span style="background: ${storageMatches > 0 ? '#ffedd5' : '#f1f5f9'}; color: ${storageMatches > 0 ? '#9a3412' : '#64748b'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${storageMatches} MATCH${storageMatches === 1 ? '' : 'ES'}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Criteria: Entity CONTAINS 'Disk' AND DiskUsed% > 85.0%</div>
              <button class="opm-run-custom-view-btn" data-view="storage" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; color: #0070e0; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Run Filtered View</button>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Unacknowledged Escalations (>30m)</span>
                <span style="background: ${unackMatches > 0 ? '#fef2f2' : '#f1f5f9'}; color: ${unackMatches > 0 ? '#991b1b' : '#64748b'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${unackMatches} MATCH${unackMatches === 1 ? '' : 'ES'}</span>
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
        if (state.alarms.length === 0) { showToast('Nothing to export yet.'); return; }
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

    // Archive filter controls (real stored alarms only)
    const archiveRange = container.querySelector('#opm-archive-range');
    if (archiveRange) archiveRange.onchange = (e) => { state.alarmsArchiveFilter = { ...archiveFilter, range: e.target.value }; renderAlarmsView(); };
    const archiveSeverity = container.querySelector('#opm-archive-severity');
    if (archiveSeverity) archiveSeverity.onchange = (e) => { state.alarmsArchiveFilter = { ...archiveFilter, severity: e.target.value }; renderAlarmsView(); };
    const archiveStatus = container.querySelector('#opm-archive-status');
    if (archiveStatus) archiveStatus.onchange = (e) => { state.alarmsArchiveFilter = { ...archiveFilter, status: e.target.value }; renderAlarmsView(); };
    const archiveSearch = container.querySelector('#opm-archive-search');
    if (archiveSearch) archiveSearch.onchange = (e) => { state.alarmsArchiveFilter = { ...archiveFilter, search: e.target.value.trim() }; renderAlarmsView(); };
    const archiveClear = container.querySelector('#opm-archive-clear-filters');
    if (archiveClear) archiveClear.onclick = () => { state.alarmsArchiveFilter = { range: '7d', severity: 'all', status: 'all', search: '' }; renderAlarmsView(); };
    const archiveExportBtn = container.querySelector('#opm-export-archive-btn');
    if (archiveExportBtn) {
      archiveExportBtn.onclick = () => {
        if (archiveRows.length === 0) { showToast('Nothing to export yet.'); return; }
        const header = 'Alarm ID,Severity,Device,Entity,Probe,Message,Timestamp,Technician\n';
        const rows = archiveRows.map(a =>
          `"${a.id}","${a.severity}","${(a.device || '').replace(/"/g, '""')}","${(a.entity || '').replace(/"/g, '""')}","${(a.probe || '').replace(/"/g, '""')}","${(a.message || '').replace(/"/g, '""')}","${alarmTime(a)}","${alarmTech(a)}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpManager_Central_Alarm_Archive_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported alarm archive CSV successfully.');
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

    // Quick Ack — real POST to /api/json/alarms/acknowledge; local state
    // changes only when the server confirms.
    container.querySelectorAll('.opm-alarm-quick-ack').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const alm = state.alarms.find(a => String(a.id) === String(id));
        if (!alm) return;
        const tech = alm.technician || alm.who;
        if (alm.acknowledged || (tech && tech !== 'Unacknowledged')) {
          showToast(`Alarm ${alm.id} is already acknowledged.`);
          return;
        }
        btn.disabled = true;
        try {
          const data = await apiPost('/api/json/alarms/acknowledge', { alarmId: alm.id });
          alm.acknowledged = true;
          alm.status = 'Acknowledged';
          if (data && data.alarm) alm.who = data.alarm.ackUser || data.alarm.acknowledgedBy || alm.who;
          if (!alm.who || alm.who === 'Unacknowledged') alm.who = 'administrator';
          showToast((data && data.message) || `Alarm ${alm.id} acknowledged.`);
          renderAlarmsView();
        } catch (err) {
          showToast(`Acknowledge failed: ${err.message}`);
          btn.disabled = false;
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
        const alm = state.alarms.find(a => String(a.id) === String(id)) || state.alarms[0];
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

    // Network Alarms Ack — real POST; button changes only on success.
    container.querySelectorAll('.opm-net-alarm-ack-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const alm = id ? state.alarms.find(a => String(a.id) === String(id)) : null;
        if (!alm) { showToast('No alarm selected to acknowledge.'); return; }
        try {
          const data = await apiPost('/api/json/alarms/acknowledge', { alarmId: alm.id });
          alm.acknowledged = true;
          alm.status = 'Acknowledged';
          btn.textContent = 'Acknowledged';
          btn.disabled = true;
          btn.style.opacity = '0.6';
          showToast((data && data.message) || `Alarm ${alm.id} acknowledged.`);
          renderAlarmsView();
        } catch (err) {
          showToast(`Acknowledge failed: ${err.message}`);
        }
      };
    });

    // RCA incident remediation actions
    const remediateBtn = container.querySelector('#opm-rca-remediate-btn');
    if (remediateBtn) {
      remediateBtn.onclick = () => {
        showToast('No remediation workflow is configured for this incident yet.');
      };
    }
    const rcaExportBtn = container.querySelector('#opm-rca-export-btn');
    if (rcaExportBtn) {
      rcaExportBtn.onclick = () => {
        showToast('No RCA report export is available yet.');
      };
    }

    // Problems subtab actions
    const noteBtn = container.querySelector('#opm-rca-add-note-btn');
    const noteInput = container.querySelector('#opm-rca-note-input');
    if (noteBtn && noteInput) {
      noteBtn.onclick = async () => {
        const val = noteInput.value.trim();
        if (!val) return;
        const alm = state.alarms[0];
        if (!alm) { showToast('No alarm to attach this note to yet.'); return; }
        try {
          const data = await apiPost('/api/alarm/addRCANotes', { alarmId: alm.id, note: val, technician: 'admin@opmanager' });
          showToast((data && data.message) || 'Investigation note saved.');
        } catch (err) {
          // Server honestly refuses (501): notes are not stored in this build.
          showToast(`Note not saved: ${err.message}`);
          return;
        }
        noteInput.value = '';
        const notesBox = container.querySelector('#opm-rca-notes-container');
        if (notesBox) {
          notesBox.innerHTML += `<br>[${escHtml(new Date().toLocaleTimeString())}] admin@opmanager: ${escHtml(val)}`;
        }
      };
    }

    const bounceBtn = container.querySelector('#opm-prb-bounce-btn');
    if (bounceBtn) {
      bounceBtn.onclick = () => {
        showToast('Port bounce is not available yet — no bounce endpoint.');
      };
    }

    const simTrapBtn = container.querySelector('#opm-trap-sim-btn');
    if (simTrapBtn) {
      simTrapBtn.onclick = () => {
        if (typeof showSnmpTrapSimulatorModal === 'function') {
          showSnmpTrapSimulatorModal();
        } else {
          showToast('Trap simulator is not available.');
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
      const alm = state.alarms.find(a => String(a.id) === String(id));
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
            <div style="font-size: 15px; font-weight: 800; color: #0070e0; cursor: pointer;" id="opm-drawer-device-link">${escHtml(alm.device || '—')}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">${escHtml(alm.entity || '—')} | Managed by ${escHtml(alm.probe || '—')}</div>
          </div>

          <!-- Message Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Alarm Message</div>
            <div style="font-size: 13px; color: #0f172a; line-height: 1.4;">${escHtml(alm.message || '—')}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Reported: ${escHtml(alarmTime(alm))}</div>
          </div>

          <!-- Zia AI RCA Analysis Section (real data only) -->
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 800; color: #3730a3; display: flex; align-items: center; gap: 5px;">
                <span>✨</span> Zia AI Root Cause Analysis
              </span>
            </div>
            <div id="opm-drawer-rca-body" style="font-size: 12px; color: #1e1b4b; line-height: 1.4;">
              Loading root-cause analysis…
            </div>
          </div>

          <!-- Device Availability (no history source yet) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #ffffff; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 4px;">Availability (Last 24 Hours)</div>
            <div style="font-size: 12px; color: #64748b;">No availability history recorded for this device yet.</div>
          </div>

          <!-- NetFlow Alert Traffic Drilldown (no flow source yet) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #fafbfc; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">NetFlow Alert Traffic Drilldown (IN / OUT)</div>
            <div style="font-size: 12px; color: #64748b;">No flow data available for this alarm. Configure a NetFlow exporter first.</div>
          </div>

          <!-- Actions & Notes -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Technician Assignment</div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <select id="opm-drawer-tech-select" disabled title="Technician assignment is not available yet — no assignment endpoint." style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px;">
                <option>Unacknowledged</option>
                ${(() => { const t = alm.technician || alm.who; return (t && t !== 'Unacknowledged') ? `<option selected>${escHtml(t)}</option>` : ''; })()}
              </select>
              <button id="opm-drawer-assign-btn" disabled title="Technician assignment is not available yet — no assignment endpoint." style="background: #0070e0; color: #ffffff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; opacity: 0.6;">Assign</button>
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
            <button id="opm-drawer-suppress-btn" disabled title="Alarm suppression is not available yet." style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; opacity: 0.6;">
              Suppress Similar Alarms (2 Hours)
            </button>
          </div>

        </div>
      `;

      drawer.style.display = 'flex';

      // Load real RCA data for this alarm — no invented confidence,
      // hypothesis or cascade. Empty when the API has nothing.
      (async () => {
        const body = drawer.querySelector('#opm-drawer-rca-body');
        if (!body) return;
        try {
          const data = await apiGetJson(`/api/alarm/getRCAData?alarmId=${encodeURIComponent(alm.id)}`);
          const parts = [];
          if (data.hypothesis) parts.push(`<div>${escHtml(data.hypothesis)}</div>`);
          if (data.latestMetric) {
            const m = data.latestMetric;
            parts.push(`<div style="margin-top: 6px;">Latest device metric: CPU ${m.cpuPct ?? '—'}% · Memory ${m.memUsedPct ?? '—'}% · Response ${m.responseMs ?? '—'} ms</div>`);
          }
          if (Array.isArray(data.correlatedEvents) && data.correlatedEvents.length > 0) {
            parts.push('<div style="margin-top: 6px; font-weight: 700;">Related alarms on this device:</div>' + data.correlatedEvents.map(ev => `<div>• ${escHtml(ev.message || '—')} (${escHtml(ev.severity || '—')})</div>`).join(''));
          }
          body.innerHTML = parts.length > 0 ? parts.join('') : 'No root-cause data available for this alarm yet.';
        } catch (err) {
          body.textContent = `Root-cause analysis is not available: ${err.message}`;
        }
      })();

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

      // ServiceDesk Plus incident
      const sdpBtn = drawer.querySelector('#opm-drawer-sdp-btn');
      if (sdpBtn) {
        sdpBtn.onclick = () => {
          showServiceDeskIncidentModal(alm);
        };
      }

      // Clear alarm — real POST to /api/json/alarms/clear.
      const clearBtn = drawer.querySelector('#opm-drawer-clear-btn');
      if (clearBtn) {
        clearBtn.onclick = async () => {
          clearBtn.disabled = true;
          try {
            const data = await apiPost('/api/json/alarms/clear', { alarmId: alm.id });
            state.alarms = state.alarms.filter(a => String(a.id) !== String(alm.id));
            showToast((data && data.message) || `Alarm ${alm.id} cleared.`);
            drawer.style.display = 'none';
            renderAlarmsView();
          } catch (err) {
            showToast(`Clear failed: ${err.message}`);
            clearBtn.disabled = false;
          }
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
    const worldOnlineCount = state.probes.filter(p => p.status === 'Online').length;

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
            No devices discovered yet. Once you install the host agent or discover devices via SNMP, your network topology, 3D rack elevations, and business service views will be rendered here automatically.
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
                    <span style="font-size: 10px; color: #64748b;">${probeDeviceCount(pr)} Nodes</span>
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
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Enterprise Multi-Probe Topology</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Central coordinating ${state.probes.length} registered probe${state.probes.length === 1 ? '' : 's'}. Node positions are schematic — probes report no geographic coordinates.</div>
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
                    <button class="opm-bv-tool-btn" data-tool="${tool.label}" style="display: inline-flex; align-items: center; gap: 5px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #1e293b; cursor: pointer;" onclick="showToast('Business View Designer is not available yet.')">
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

              <div id="opm-business-view-canvas" style="width: 100%; height: 470px; background: #eef2f7; border: 1px solid #cbd5e1; border-radius: 4px; position: relative; overflow: hidden;">
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
                    const isOk = pr.status === 'Online';
                    const strokeColor = isOk ? '#00f000' : '#dc2626';
                    const lat = probeLatency(pr);
                    return `
                      <line class="opm-packet-flow" x1="145" y1="175" x2="${x}" y2="${y}" stroke="${strokeColor}" stroke-width="2.8" stroke-dasharray="5 3" />
                      <rect x="${Math.round((145 + x) / 2) - 35}" y="${Math.round((175 + y) / 2) - 8}" width="70" height="16" rx="3" fill="#0f172a" opacity="0.9" />
                      <text x="${Math.round((145 + x) / 2)}" y="${Math.round((175 + y) / 2) + 4}" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="bold" font-family="monospace">${lat != null ? lat + 'ms' : '—'}</text>

                      <g class="opm-topo-node" data-probe="${pr.id}" style="cursor: pointer;" onclick="if(typeof showProbeDetailsModal==='function') showProbeDetailsModal(${pr.id})">
                        <circle cx="${x}" cy="${y}" r="28" fill="#0f172a" stroke="${isOk ? '#16a34a' : '#dc2626'}" stroke-width="2.5" />
                        <image href="/images/deviceicons/server.png" x="${x - 12}" y="${y - 20}" width="24" height="24" />
                        <text x="${x}" y="${y + 12}" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="bold">${pr.name || '—'}</text>
                        <text x="${x}" y="${y + 22}" text-anchor="middle" fill="#4ade80" font-size="7.5">${pr.ip || '—'} (${probeDeviceCount(pr)})</text>
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
          ${renderRackSubtab()}
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
          ${state.probes.length <= 1 ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 60px 20px; text-align: center; margin: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0070e0" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">No remote probes to map yet</div>
            <div style="font-size: 12px; color: #64748b; max-width: 440px; margin: 0 auto;">
              Only one probe is registered. Register a remote probe to see it on the world map.
            </div>
          </div>
          ` : `
          <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">🌐</span> GLOBAL MULTI-PROBE TOPOLOGY &amp; LATENCY MAP
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Probe status from live probe heartbeats. Pin positions are schematic — probes report no geographic coordinates.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 11px; color: #4ade80; background: #064e3b; border: 1px solid #047857; padding: 3px 8px; border-radius: 4px; font-weight: 700;">
                  ● ${worldOnlineCount} OF ${state.probes.length} PROBE${state.probes.length === 1 ? '' : 'S'} ONLINE
                </div>
                <button id="opm-worldmap-sync-all-btn" style="background: #0070e0; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Initiate Global Sync
                </button>
              </div>
            </div>

            <div style="position: relative; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; height: 480px;">
              <svg width="100%" height="100%" viewBox="0 0 1000 480" style="background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%);">
                ${state.probes.map((pr, idx) => {
                  const spacing = state.probes.length > 1 ? Math.min(220, 760 / (state.probes.length - 1)) : 220;
                  const cx = 120 + (idx * spacing);
                  const cy = 210;
                  const isOk = pr.status === 'Online';
                  const lat = probeLatency(pr);
                  return `
                    <g class="opm-world-pin" data-probe="${pr.id}" style="cursor: pointer;" onclick="if(typeof showProbeDetailsModal==='function') showProbeDetailsModal(${pr.id})">
                      <circle cx="${cx}" cy="${cy}" r="14" fill="${isOk ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.25)'}" stroke="${isOk ? '#22c55e' : '#ef4444'}" stroke-width="1.5" />
                      <circle cx="${cx}" cy="${cy}" r="6" fill="${isOk ? '#22c55e' : '#ef4444'}" />
                      <rect x="${cx - 80}" y="${cy + 20}" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                      <text x="${cx}" y="${cy + 36}" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🌐 ${pr.name || '—'}</text>
                      <text x="${cx}" y="${cy + 50}" text-anchor="middle" font-size="9" fill="${isOk ? '#4ade80' : '#f87171'}">● ${pr.status || '—'} • ${lat != null ? lat + 'ms RTT' : '—'}</text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>

            <div id="opm-worldmap-probe-details" style="margin-top: 16px; background: #1e293b; border-radius: 6px; padding: 14px 18px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 18px;">🌐</span>
                <div>
                  <div style="font-weight: 800; color: #38bdf8;">${state.probes[0]?.name || '—'}</div>
                  <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">IP: ${state.probes[0]?.ip || '—'} &bull; ${probeDeviceCount(state.probes[0])} Managed Nodes &bull; ${state.probes[0]?.last_heartbeat_at ? 'Last heartbeat ' + fmtTime(state.probes[0].last_heartbeat_at) : 'No heartbeat yet'}</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-world-inspect-probe-btn" data-probe="${state.probes[0] ? state.probes[0].id : ''}" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  View Probe CIs in Inventory &rarr;
                </button>
                <button id="opm-world-diag-probe-btn" data-probe="${state.probes[0] ? state.probes[0].id : ''}" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Probe Diagnostics
                </button>
              </div>
            </div>
          </div>
          `}
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

    // Fullscreen button — real fullscreen on the topology canvas.
    const fullBtn = container.querySelector('#opm-maps-fullscreen-btn');
    if (fullBtn) {
      fullBtn.onclick = () => {
        const canvas = document.getElementById('opm-business-view-canvas');
        if (canvas && canvas.requestFullscreen) {
          canvas.requestFullscreen().catch(() => showToast('Fullscreen is not available in this browser.'));
        } else {
          showToast('Fullscreen is not available in this browser.');
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
        const prId = parseInt(worldDiagBtn.getAttribute('data-probe'), 10);
        if (Number.isInteger(prId) && typeof showProbeDetailsModal === 'function') showProbeDetailsModal(prId);
      };
    }
    const worldSyncBtn = container.querySelector('#opm-worldmap-sync-all-btn');
    if (worldSyncBtn) {
      worldSyncBtn.onclick = async () => {
        worldSyncBtn.disabled = true;
        try {
          const data = await apiPost('/api/json/enterprise/syncAllProbes', {});
          showToast((data && data.message) || 'Probe sync completed.');
          if (typeof loadBackendData === 'function') loadBackendData();
        } catch (err) {
          showToast(`Probe sync failed: ${err.message}`);
        } finally {
          worldSyncBtn.disabled = false;
        }
      };
    }

    // Rack controls — selector switches the rendered rack; create posts
    // to the real endpoint and reports its actual outcome.
    const rackSelect = container.querySelector('#opm-rack-select');
    if (rackSelect) {
      rackSelect.onchange = (e) => { state.selectedRackId = e.target.value; renderMapsView(); };
    }
    const racksRetryBtn = container.querySelector('#opm-racks-retry-btn');
    if (racksRetryBtn) {
      racksRetryBtn.onclick = () => { state.racks = undefined; state.racksError = null; renderMapsView(); };
    }
    const createRackBtn = container.querySelector('#opm-create-rack-btn');
    if (createRackBtn) {
      createRackBtn.onclick = async () => {
        const name = window.prompt('Rack name (e.g. DC-Core-Rack-01):');
        if (name === null || name.trim() === '') return;
        const unitsRaw = window.prompt('Rack size in units (e.g. 42):', '42');
        if (unitsRaw === null) return;
        const units = Number(unitsRaw);
        if (!Number.isInteger(units) || units <= 0) { showToast('Units must be a positive whole number.'); return; }
        try {
          const data = await apiPost('/api/racks/create', { name: name.trim(), units });
          showToast((data && data.message) || `Rack "${name.trim()}" created.`);
          state.racks = undefined;
          await loadRacks();
          if (state.currentTab === 'maps') renderMapsView();
        } catch (err) {
          showToast(`Create rack failed: ${err.message}`);
        }
      };
    }

    // Layer 2 discovery — no Layer 2 endpoint exists; say so.
    const l2Btn = container.querySelector('#opm-run-l2-discovery-btn');
    if (l2Btn) {
      l2Btn.onclick = () => {
        showToast('Layer 2 discovery is not available yet — add network switches via SNMP to map switch-to-port connections.');
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
