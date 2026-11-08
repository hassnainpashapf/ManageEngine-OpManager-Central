const fs = require('fs');

const path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let content = fs.readFileSync(path, 'utf8');

// --- 1. UPGRADE showGlobalSearchModal ---
const upgradedSearchFn = `  function showGlobalSearchModal() {
    let modal = document.getElementById('opm-search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-search-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); z-index: 100000; display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      modal.innerHTML = \`
        <div style="background: #ffffff; border-radius: 8px; width: 680px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
          <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; background: #f8fafc;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#49bd80" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="global-search-input" placeholder="Search devices, IP addresses, alarms, probes, or diagnostic tools..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 15px; color: #0f172a; font-weight: 500;">
            <span style="font-size: 11px; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-family: monospace;">ESC to close</span>
            <span id="close-search-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
          </div>
          <div id="search-results-list" style="max-height: 440px; overflow-y: auto; padding: 10px 0; font-size: 12px;"></div>
          <div style="padding: 8px 18px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>ManageEngine OpManager Central Enterprise Omnibox</span>
            <span>Navigate with <kbd style="background: #e2e8f0; padding: 1px 4px; border-radius: 2px;">↑</kbd> <kbd style="background: #e2e8f0; padding: 1px 4px; border-radius: 2px;">↓</kbd> or Click</span>
          </div>
        </div>
      \`;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    const input = modal.querySelector('#global-search-input');
    const list = modal.querySelector('#search-results-list');

    const renderResults = (query = '') => {
      const q = query.toLowerCase().trim();
      let html = '';

      // 1. Devices
      const devMatches = q 
        ? state.devices.filter(d => d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.category.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q) || d.probe.toLowerCase().includes(q))
        : state.devices.slice(0, 4);

      if (devMatches.length > 0) {
        html += \`<div style="padding: 6px 18px; color: #0070e0; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f0f9ff; margin: 4px 0;">Network Devices (\${devMatches.length})</div>\`;
        html += devMatches.map(d => \`
          <div class="search-item-row" data-type="device" data-id="\${d.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              \${getDeviceTypeIcon(d.type, d.category, 18)}
              <div>
                <span style="font-weight: 700; color: #0f172a;">\${d.name}</span>
                <span style="color: #64748b; font-family: monospace; margin-left: 6px;">(\${d.ip})</span>
                <span style="font-size: 10px; background: #f1f5f9; padding: 1px 5px; border-radius: 2px; margin-left: 6px;">\${d.category}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              \${getStatusBadge(d.status)}
              <span style="font-size: 11px; color: #0284c7; font-weight: 600;">\${d.probe}</span>
            </div>
          </div>
        \`).join('');
      }

      // 2. Alarms
      const alarmMatches = q 
        ? state.alarms.filter(a => a.device.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.severity.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q))
        : state.alarms.slice(0, 3);

      if (alarmMatches.length > 0) {
        html += \`<div style="padding: 6px 18px; color: #dc2626; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef2f2; margin: 6px 0 4px 0;">Active Alarms (\${alarmMatches.length})</div>\`;
        html += alarmMatches.map(a => \`
          <div class="search-item-row" data-type="alarm" data-id="\${a.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: \${a.severity === 'Critical' ? '#dc2626' : a.severity === 'Trouble' ? '#ea580c' : '#ca8a04'}; flex-shrink: 0;"></span>
              <div>
                <span style="font-weight: 700; color: #0f172a;">\${a.device}</span>
                <span style="color: #475569; margin-left: 6px;">\${a.entity}</span>
                <div style="font-size: 11px; color: #64748b; margin-top: 1px;">\${a.message}</div>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              \${getStatusBadge(a.severity)}
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">\${a.time}</div>
            </div>
          </div>
        \`).join('');
      }

      // 3. Remote Probes
      const probeMatches = q 
        ? state.probes.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.ip.includes(q))
        : state.probes.slice(0, 4);

      if (probeMatches.length > 0) {
        html += \`<div style="padding: 6px 18px; color: #16a34a; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f0fdf4; margin: 6px 0 4px 0;">Distributed Probes (\${probeMatches.length})</div>\`;
        html += probeMatches.map(p => \`
          <div class="search-item-row" data-type="probe" data-id="\${p.id}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
              <div>
                <span style="font-weight: 700; color: #0f172a;">\${p.name}</span>
                <span style="color: #64748b; font-family: monospace; margin-left: 6px;">(\${p.ip}:8060)</span>
              </div>
            </div>
            <span style="font-size: 11px; color: #0284c7; font-weight: 600;">\${p.devicesCount || p.devices || 4} Managed Nodes</span>
          </div>
        \`).join('');
      }

      // 4. Tools
      const tools = [
        { name: 'SNMP MIB Browser', desc: 'Browse MIB tree, query OIDs, test agent values', act: 'mib' },
        { name: 'ICMP Ping & Traceroute Diagnostics', desc: 'Test packet reachability and latency', act: 'ping' },
        { name: 'Ask Zia AI Assistant', desc: 'AI-assisted RCA and operational telemetry queries', act: 'zia' },
        { name: 'Executive SLA Compliance Reports', desc: 'Generate printable high-availability SLA documents', act: 'sla' },
        { name: 'Global Probes WAN World Map', desc: 'Geographic probe distribution & latency arcs', act: 'worldmap' }
      ];
      const toolMatches = q ? tools.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) : tools.slice(0, 3);
      if (toolMatches.length > 0) {
        html += \`<div style="padding: 6px 18px; color: #7c3aed; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #faf5ff; margin: 6px 0 4px 0;">Enterprise Diagnostics &amp; Tools (\${toolMatches.length})</div>\`;
        html += toolMatches.map(t => \`
          <div class="search-item-row" data-type="tool" data-act="\${t.act}" style="padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <div>
              <span style="font-weight: 700; color: #7c3aed;">\${t.name}</span>
              <div style="font-size: 11px; color: #64748b;">\${t.desc}</div>
            </div>
            <span style="font-size: 11px; color: #0070e0; font-weight: 600;">Launch ↗</span>
          </div>
        \`).join('');
      }

      if (!html) {
        html = '<div style="padding: 30px; text-align: center; color: #94a3b8;">No matching assets, alarms, probes, or tools found.</div>';
      }

      list.innerHTML = html;

      // Event listeners on search rows
      list.querySelectorAll('.search-item-row').forEach(row => {
        row.onclick = () => {
          modal.style.display = 'none';
          const type = row.getAttribute('data-type');
          const id = row.getAttribute('data-id');
          if (type === 'device') {
            const dev = state.devices.find(d => d.id == id);
            if (dev) showDeviceSnapshotModal(dev);
          } else if (type === 'alarm') {
            const alm = state.alarms.find(a => a.id == id);
            if (alm) showAlarmDetailsDrawer(alm);
          } else if (type === 'probe') {
            showProbeDetailsModal(Number(id));
          } else if (type === 'tool') {
            const act = row.getAttribute('data-act');
            if (act === 'mib') showNetworkToolsModal(null, 'mib');
            else if (act === 'ping') showNetworkToolsModal('10.40.1.1', 'ping');
            else if (act === 'zia') showZiaAssistantModal();
            else if (act === 'sla') { state.subTabs.reports = 'sla'; window.location.hash = '#/reports'; }
            else if (act === 'worldmap') { state.subTabs.maps = 'world'; window.location.hash = '#/maps'; }
          }
        };
      });
    };

    renderResults();
    if (input) {
      input.value = '';
      input.focus();
      input.oninput = (e) => {
        renderResults(e.target.value);
      };
    }
    const closeBtn = modal.querySelector('#close-search-btn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }`;

// Replace showGlobalSearchModal in content
const oldSearchStart = content.indexOf('function showGlobalSearchModal() {');
const oldSearchEnd = content.indexOf('// --- TRAINING VIDEOS MODAL ---', oldSearchStart);
if (oldSearchStart !== -1 && oldSearchEnd !== -1) {
  content = content.slice(0, oldSearchStart) + upgradedSearchFn + '\n\n  ' + content.slice(oldSearchEnd);
  console.log('showGlobalSearchModal replaced successfully.');
} else {
  console.error('Could not locate old showGlobalSearchModal bounds.');
}

// --- 2. ADD DIAGNOSTIC CLI TAB TO showDeviceSnapshotModal ---
const diagnosticsTabCode = `
      } else if (activeModalTab === 'diagnostics') {
        bodyContainer.innerHTML = \`
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #161b22; border-bottom: 1px solid #30363d; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 9px; height: 9px; border-radius: 50%; background: #238636; display: inline-block;"></span>
                <span style="font-size: 12px; font-weight: 700; color: #f0f6fc; font-family: monospace;">OpManager Central Diagnostic Console &bull; \${dev.ip} (\${dev.name})</span>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="cli-run-ping-btn" style="background: #238636; color: #fff; border: 1px solid #2ea043; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ ICMP Ping (4 pkts)</button>
                <button id="cli-run-trace-btn" style="background: #1f6feb; color: #fff; border: 1px solid #388bfd; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ WAN Traceroute</button>
                <button id="cli-run-snmp-btn" style="background: #8957e5; color: #fff; border: 1px solid #a371f7; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">▶ SNMP MIB Walk</button>
                <button id="cli-clear-btn" style="background: #21262d; color: #c9d1d9; border: 1px solid #30363d; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">Clear</button>
              </div>
            </div>
            <div id="cli-terminal-screen" style="padding: 16px; min-height: 260px; max-height: 320px; overflow-y: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; line-height: 1.6; color: #39d353;">
              <div style="color: #8b949e;">ManageEngine OpManager Central Diagnostic Terminal v12.9.203 GA</div>
              <div style="color: #8b949e;">Probe Agent: \${dev.probe} (Host ID: probe_\${dev.probeId || 1})</div>
              <div style="color: #8b949e;">Target node: \${dev.name} [\${dev.ip}] &bull; SNMP Port: 161 &bull; ICMP Status: ALIVE</div>
              <div style="color: #58a6ff; margin-top: 8px;">Ready. Select a diagnostic utility above to execute live test against this asset.</div>
            </div>
          </div>
        \`;

        const term = bodyContainer.querySelector('#cli-terminal-screen');
        const appendLog = (lines) => {
          if (!term) return;
          lines.forEach(l => {
            const d = document.createElement('div');
            d.innerHTML = l;
            term.appendChild(d);
          });
          term.scrollTop = term.scrollHeight;
        };

        const runPing = () => {
          appendLog([
            \`<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ ping -c 4 \${dev.ip}</div>\`,
            \`<div style="color: #8b949e;">PING \${dev.ip} (\${dev.ip}): 56 data bytes</div>\`,
            \`<div>64 bytes from \${dev.ip}: icmp_seq=0 ttl=62 time=\${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>\`,
            \`<div>64 bytes from \${dev.ip}: icmp_seq=1 ttl=62 time=\${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>\`,
            \`<div>64 bytes from \${dev.ip}: icmp_seq=2 ttl=62 time=\${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>\`,
            \`<div>64 bytes from \${dev.ip}: icmp_seq=3 ttl=62 time=\${(dev.responseTime + (Math.random()*2 - 1)).toFixed(2)} ms</div>\`,
            \`<div style="color: #8b949e;">--- \${dev.ip} ping statistics ---</div>\`,
            \`<div style="color: #39d353; font-weight: 700;">4 packets transmitted, 4 packets received, 0.0% packet loss</div>\`,
            \`<div style="color: #58a6ff;">round-trip min/avg/max = \${(dev.responseTime - 0.4).toFixed(2)}/\${dev.responseTime.toFixed(2)}/\${(dev.responseTime + 0.6).toFixed(2)} ms</div>\`
          ]);
        };

        const runTrace = () => {
          appendLog([
            \`<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ traceroute -m 30 -q 1 \${dev.ip}</div>\`,
            \`<div style="color: #8b949e;">traceroute to \${dev.ip} (\${dev.ip}), 30 hops max, 60 byte packets</div>\`,
            \`<div> 1  opm-central-gw (10.0.0.1)  0.421 ms</div>\`,
            \`<div> 2  probe-wan-uplink (10.\${dev.probeId || 1}0.0.1)  \${(dev.responseTime * 0.4).toFixed(2)} ms</div>\`,
            \`<div> 3  \${dev.name.toLowerCase()} (\${dev.ip})  \${dev.responseTime.toFixed(2)} ms</div>\`,
            \`<div style="color: #39d353; font-weight: 700;">Trace complete. Destination reached in 3 hops (0 drops, MTU: 1500).</div>\`
          ]);
        };

        const runSnmp = () => {
          appendLog([
            \`<div style="color: #f0f6fc; margin-top: 10px; font-weight: 700;">$ snmpwalk -v 2c -c ******* \${dev.ip} RFC1213-MIB::system</div>\`,
            \`<div>SNMPv2-MIB::sysDescr.0 = STRING: \${dev.vendor} \${dev.type} (\${dev.osVersion || 'Enterprise OS'})</div>\`,
            \`<div>SNMPv2-MIB::sysObjectID.0 = OID: SNMPv2-SMI::enterprises.9.1.2548</div>\`,
            \`<div>DISMAN-EVENT-MIB::sysUpTimeInstance = Timeticks: (124892010) 14 days, 10:55:20.10</div>\`,
            \`<div>SNMPv2-MIB::sysContact.0 = STRING: noc-admin@manageengine.internal</div>\`,
            \`<div>SNMPv2-MIB::sysName.0 = STRING: \${dev.name}</div>\`,
            \`<div>SNMPv2-MIB::sysLocation.0 = STRING: \${dev.probe}</div>\`,
            \`<div>IF-MIB::ifNumber.0 = INTEGER: \${(dev.interfaces || []).length || 48}</div>\`,
            \`<div style="color: #39d353; font-weight: 700;">End of MIB view reached (sysServices: 78).</div>\`
          ]);
        };

        const pBtn = bodyContainer.querySelector('#cli-run-ping-btn');
        if (pBtn) pBtn.onclick = runPing;
        const tBtn = bodyContainer.querySelector('#cli-run-trace-btn');
        if (tBtn) tBtn.onclick = runTrace;
        const sBtn = bodyContainer.querySelector('#cli-run-snmp-btn');
        if (sBtn) sBtn.onclick = runSnmp;
        const cBtn = bodyContainer.querySelector('#cli-clear-btn');
        if (cBtn) cBtn.onclick = () => {
          if (term) term.innerHTML = '<div style="color: #8b949e;">Terminal output cleared.</div>';
        };
`;

if (!content.includes("activeModalTab === 'diagnostics'")) {
  content = content.replace(
    "} else if (activeModalTab === 'config') {",
    `${diagnosticsTabCode}\n      } else if (activeModalTab === 'config') {`
  );
  console.log('Added diagnosticsTabCode to renderSnapshotBody');
}

// Add diagnostics tab to modal header tab list
if (!content.includes("{ id: 'diagnostics', label: 'Diagnostic CLI & SNMP' }")) {
  content = content.replace(
    "{ id: 'alarms', label: 'Active Alarms' },",
    "{ id: 'diagnostics', label: 'Diagnostic CLI & SNMP' },\n            { id: 'alarms', label: 'Active Alarms' },"
  );
  console.log('Added diagnostics tab item to tab strip.');
}

// Wire modal ping and traceroute buttons to switch to diagnostics tab and auto-run
const headerBtnWiring = `    document.getElementById('modal-ping-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-ping-btn');
        if (btn) btn.click();
      }, 50);
    };

    document.getElementById('modal-trace-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-trace-btn');
        if (btn) btn.click();
      }, 50);
    };

    document.getElementById('modal-cli-btn').onclick = () => {
      activeModalTab = 'diagnostics';
      modal.querySelectorAll('.snap-tab-item').forEach(t => {
        const isAct = t.getAttribute('data-tab') === 'diagnostics';
        t.style.fontWeight = isAct ? '700' : '500';
        t.style.color = isAct ? '#212121' : '#64748b';
        t.style.borderBottom = isAct ? '3px solid #49bd80' : 'none';
      });
      renderSnapshotBody();
      setTimeout(() => {
        const btn = modal.querySelector('#cli-run-snmp-btn');
        if (btn) btn.click();
      }, 50);
    };`;

const oldBtnStart = content.indexOf("document.getElementById('modal-ping-btn').onclick = () => {");
const oldBtnEnd = content.indexOf("};", content.indexOf("document.getElementById('modal-cli-btn').onclick")) + 2;
if (oldBtnStart !== -1 && oldBtnEnd !== -1) {
  content = content.slice(0, oldBtnStart) + headerBtnWiring + content.slice(oldBtnEnd);
  console.log('Replaced header buttons wiring with direct diagnostics tab activation.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated 02_branding_and_modals.js');
