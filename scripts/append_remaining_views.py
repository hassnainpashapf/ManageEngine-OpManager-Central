#!/usr/bin/env python3
import os

target_path = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js"

with open(target_path, "a", encoding="utf-8") as f:
    f.write(r'''
  // -------------------------------------------------------------
  // VIEW 4: MAPS
  // -------------------------------------------------------------
  function renderMapsView(container) {
    const currentSub = state.subTabs.maps || 'business';

    let mapBody = '';

    if (currentSub === 'business') {
      mapBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); min-height: 580px; position: relative;">
          <!-- SVG Map Canvas -->
          <svg viewBox="0 0 1000 520" style="width: 100%; height: 520px; background: #ffffff;">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="1000" height="520" fill="url(#grid)" />

            <!-- Connecting Lines with Live Animated Flow -->
            <line x1="500" y1="260" x2="260" y2="130" stroke="#0070e0" stroke-width="2.5" stroke-dasharray="6,4" />
            <line x1="500" y1="260" x2="740" y2="130" stroke="#0070e0" stroke-width="2.5" stroke-dasharray="6,4" />
            <line x1="500" y1="260" x2="260" y2="390" stroke="#0070e0" stroke-width="2.5" stroke-dasharray="6,4" />
            <line x1="500" y1="260" x2="740" y2="390" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="6,4" />

            <!-- Central Hub (Primary Master) -->
            <circle cx="500" cy="260" r="54" fill="#0284c7" fill-opacity="0.12" />
            <circle class="map-node" data-name="OpManager Central Master Server" cx="500" cy="260" r="46" fill="#0070e0" style="cursor: pointer; filter: drop-shadow(0 2px 8px rgba(0,112,224,0.3));" />
            <text x="500" y="248" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle" pointer-events="none">OPMANAGER</text>
            <text x="500" y="263" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle" pointer-events="none">CENTRAL</text>
            <text x="500" y="278" fill="#e0f2fe" font-size="9" text-anchor="middle" pointer-events="none">10.0.0.10:8060</text>

            <!-- Link Labels (Transit & Latency) -->
            <rect x="340" y="180" width="84" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1" />
            <text x="382" y="194" fill="#475569" font-size="9" font-weight="600" text-anchor="middle">1.4G • 12ms</text>

            <rect x="580" y="180" width="84" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1" />
            <text x="622" y="194" fill="#475569" font-size="9" font-weight="600" text-anchor="middle">850M • 28ms</text>

            <rect x="340" y="320" width="84" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1" />
            <text x="382" y="334" fill="#475569" font-size="9" font-weight="600" text-anchor="middle">620M • 45ms</text>

            <rect x="580" y="320" width="94" height="20" rx="3" fill="#fee2e2" stroke="#fca5a5" />
            <text x="627" y="334" fill="#dc2626" font-size="9" font-weight="700" text-anchor="middle">2.1G • 18ms (!)</text>

            <!-- Probe 1: New York -->
            <circle cx="260" cy="130" r="38" fill="#16a34a" fill-opacity="0.12" />
            <circle class="map-node" data-id="1" cx="260" cy="130" r="32" fill="#16a34a" style="cursor: pointer; filter: drop-shadow(0 2px 6px rgba(22,163,74,0.3));" />
            <text x="260" y="126" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" pointer-events="none">NEW YORK</text>
            <text x="260" y="139" fill="#f0fdf4" font-size="8" text-anchor="middle" pointer-events="none">10.10.0.1</text>
            <text x="260" y="182" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Probe 1 (4 Assets)</text>

            <!-- Probe 2: London -->
            <circle cx="740" cy="130" r="38" fill="#16a34a" fill-opacity="0.12" />
            <circle class="map-node" data-id="2" cx="740" cy="130" r="32" fill="#16a34a" style="cursor: pointer; filter: drop-shadow(0 2px 6px rgba(22,163,74,0.3));" />
            <text x="740" y="126" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" pointer-events="none">LONDON</text>
            <text x="740" y="139" fill="#f0fdf4" font-size="8" text-anchor="middle" pointer-events="none">10.20.0.1</text>
            <text x="740" y="182" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Probe 2 (4 Assets)</text>

            <!-- Probe 3: Singapore -->
            <circle cx="260" cy="390" r="38" fill="#16a34a" fill-opacity="0.12" />
            <circle class="map-node" data-id="3" cx="260" cy="390" r="32" fill="#16a34a" style="cursor: pointer; filter: drop-shadow(0 2px 6px rgba(22,163,74,0.3));" />
            <text x="260" y="386" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" pointer-events="none">SINGAPORE</text>
            <text x="260" y="399" fill="#f0fdf4" font-size="8" text-anchor="middle" pointer-events="none">10.30.0.1</text>
            <text x="260" y="442" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Probe 3 (4 Assets)</text>

            <!-- Probe 4: Dubai (Critical) -->
            <circle cx="740" cy="390" r="38" fill="#dc2626" fill-opacity="0.12" />
            <circle class="map-node" data-id="4" cx="740" cy="390" r="32" fill="#dc2626" style="cursor: pointer; filter: drop-shadow(0 2px 6px rgba(220,38,38,0.3));" />
            <text x="740" y="386" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" pointer-events="none">DUBAI</text>
            <text x="740" y="399" fill="#fef2f2" font-size="8" text-anchor="middle" pointer-events="none">10.40.0.1</text>
            <text x="740" y="442" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Probe 4 (CRITICAL)</text>

            <!-- Map Legend -->
            <g transform="translate(250, 470)">
              <rect x="0" y="0" width="500" height="34" rx="4" fill="#ffffff" stroke="#e2e8f0" />
              <circle cx="20" cy="17" r="5" fill="#16a34a" />
              <text x="32" y="21" fill="#475569" font-size="10">Probe Healthy</text>
              <circle cx="120" cy="17" r="5" fill="#dc2626" />
              <text x="132" y="21" fill="#475569" font-size="10">Critical Alarm</text>
              <line x1="220" y1="17" x2="250" y2="17" stroke="#0070e0" stroke-width="2" stroke-dasharray="4,2" />
              <text x="260" y="21" fill="#475569" font-size="10">TLS Tunnel Link</text>
            </g>
          </svg>
        </div>
      `;
    } else if (currentSub === 'floor') {
      mapBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 24px; min-height: 520px;">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">3D Datacenter Floor Plan (Zone A - Core Datacenter)</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Real-time environmental monitoring: Cold-aisle containment at 21.4°C, Total power draw 42.8 kW.</p>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            ${['Rack A01 (Routers)', 'Rack A02 (Core Switches)', 'Rack B01 (SQL & App Servers)', 'Rack B02 (SAN & Power UPS)'].map((rack, i) => `
              <div style="border: 2px solid ${i === 1 ? '#dc2626' : '#cbd5e1'}; border-radius: 4px; padding: 16px; background: #fafbfc;">
                <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">${rack}</div>
                <div style="font-size: 11px; color: ${i === 1 ? '#dc2626' : '#16a34a'}; font-weight: 600; margin-bottom: 12px;">● ${i === 1 ? 'High Temp Warning (28°C)' : 'Optimal (21°C)'}</div>
                <div style="background: #e2e8f0; border-radius: 2px; height: 160px; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
                  <div style="background: #ffffff; border: 1px solid #cbd5e1; height: 24px; font-size: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px;"><span>Patch Panel 1</span><span style="color:#16a34a;">●</span></div>
                  <div style="background: #ffffff; border: 1px solid #cbd5e1; height: 32px; font-size: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px;"><span>Cisco 9500 (48Y)</span><span style="color:${i === 1 ? '#dc2626' : '#16a34a'};">●</span></div>
                  <div style="background: #ffffff; border: 1px solid #cbd5e1; height: 32px; font-size: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px;"><span>Dell PowerEdge</span><span style="color:#16a34a;">●</span></div>
                  <div style="background: #ffffff; border: 1px solid #cbd5e1; height: 40px; font-size: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px;"><span>Galaxy UPS</span><span style="color:#16a34a;">●</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (currentSub === 'rack') {
      mapBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 24px;">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 16px;">42U Server Rack View (Rack A-01 Standard EIA-310)</div>
          <div style="max-width: 600px; margin: 0 auto; border: 4px solid #334155; border-radius: 4px; background: #0f172a; padding: 12px; color: #ffffff;">
            <div style="text-align: center; font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 10px;">RACK FRONT ELEVATION (42U)</div>
            ${[
              { u: '40-42U', name: 'Schneider APC Galaxy 3500 UPS (4U)', status: 'Optimal' },
              { u: '36-38U', name: 'Dell PowerEdge R750 PostgreSQL (2U)', status: 'High Memory' },
              { u: '30-31U', name: 'Palo Alto PA-5250 Firewall (2U)', status: 'Optimal' },
              { u: '24-25U', name: 'Cisco Catalyst 9500-48Y4C (1U)', status: 'CRITICAL CPU' },
              { u: '18-19U', name: 'Cisco ASR 9006 Core Aggregator (3U)', status: 'Optimal' }
            ].map(slot => `
              <div style="background: #1e293b; border: 1px solid #475569; border-radius: 3px; padding: 8px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 11px;">
                <span style="color: #38bdf8;">[${slot.u}]</span>
                <span style="font-weight: 600; color: #f8fafc;">${slot.name}</span>
                <span style="color: ${slot.status.includes('CRITICAL') ? '#f87171' : slot.status.includes('High') ? '#fbbf24' : '#4ade80'}; font-weight: 700;">● ${slot.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      mapBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px;">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Layer 2 Spanning Tree (STP) & LLDP Topology Map</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Discovered broadcast domain connections across enterprise switches. Protocol: Rapid PVST+ (IEEE 802.1w).</p>
          <svg viewBox="0 0 1000 420" style="width: 100%; height: 420px; background: #fafbfc; border: 1px solid #edf2f7; border-radius: 4px;">
            <line x1="500" y1="90" x2="250" y2="280" stroke="#16a34a" stroke-width="3" />
            <text x="350" y="175" fill="#15803d" font-size="10" font-weight="600">Trunk 1 (FWD)</text>

            <line x1="500" y1="90" x2="750" y2="280" stroke="#dc2626" stroke-width="3" stroke-dasharray="4,4" />
            <text x="650" y="175" fill="#dc2626" font-size="10" font-weight="700">FortyGigE1/0/48 (DOWN)</text>

            <line x1="250" y1="280" x2="750" y2="280" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
            <text x="500" y="300" fill="#b45309" font-size="10" font-weight="600" text-anchor="middle">Inter-Switch Link (STP BLK - Loop Free)</text>

            <g transform="translate(500, 90)" style="cursor: pointer;" class="device-name-click" data-name="NY-NEXUS-SW-01">
              <rect x="-110" y="-35" width="220" height="70" rx="4" fill="#ffffff" stroke="#0070e0" stroke-width="2" />
              <text x="0" y="-12" fill="#0070e0" font-size="12" font-weight="700" text-anchor="middle">NY-NEXUS-SW-01</text>
              <text x="0" y="5" fill="#64748b" font-size="10" text-anchor="middle">STP Root Bridge (Priority 4096)</text>
              <text x="0" y="20" fill="#16a34a" font-size="9" font-weight="600" text-anchor="middle">● Rapid-PVST Active</text>
            </g>

            <g transform="translate(250, 280)" style="cursor: pointer;" class="device-name-click" data-name="LON-DIST-SW-01">
              <rect x="-100" y="-35" width="200" height="70" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
              <text x="0" y="-12" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">LON-DIST-SW-01</text>
              <text x="0" y="5" fill="#64748b" font-size="10" text-anchor="middle">Distribution Switch (8192)</text>
              <text x="0" y="20" fill="#16a34a" font-size="9" font-weight="600" text-anchor="middle">● 48 Ports Forwarding</text>
            </g>

            <g transform="translate(750, 280)" style="cursor: pointer;" class="device-name-click" data-name="DXB-CORE-SW-01">
              <rect x="-100" y="-35" width="200" height="70" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
              <text x="0" y="-12" fill="#dc2626" font-size="12" font-weight="700" text-anchor="middle">DXB-CORE-SW-01</text>
              <text x="0" y="5" fill="#991b1b" font-size="10" text-anchor="middle">Core Switch (32768)</text>
              <text x="0" y="20" fill="#dc2626" font-size="9" font-weight="700" text-anchor="middle">● Port 48 Link Flap Reported</text>
            </g>
          </svg>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Sub-tabs strip -->
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'business', label: 'Business Views' },
            { key: 'floor', label: '3D Floor Views' },
            { key: 'rack', label: '3D Rack Views' },
            { key: 'layer2', label: 'Layer 2 Maps' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="maps-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="map-auto-layout-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">Auto Layout</button>
          <button id="map-zoom-in" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 10px; font-size: 12px; color: #334155; cursor: pointer;">Zoom (+)</button>
          <button id="map-zoom-out" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 10px; font-size: 12px; color: #334155; cursor: pointer;">Zoom (-)</button>
          <button id="map-save-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer;">Save Layout</button>
        </div>
      </div>

      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        ${mapBody}
      </div>
    `;

    // Hook Subtabs click
    container.querySelectorAll('.maps-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.maps = el.getAttribute('data-sub');
        renderMapsView(container);
      };
    });

    // Hook Device Name clicks
    container.querySelectorAll('.device-name-click').forEach(el => {
      el.onclick = () => {
        const name = el.getAttribute('data-name');
        const dev = state.devices.find(d => d.name === name);
        if (dev) showDeviceSnapshotModal(dev);
      };
    });

    // Hook Probe Nodes
    container.querySelectorAll('.map-node').forEach(node => {
      node.onclick = () => {
        const id = node.getAttribute('data-id');
        const p = state.probes.find(x => String(x.id) === String(id));
        if (p) showProbeDetailsModal(p);
      };
    });
  }

  // -------------------------------------------------------------
  // VIEW 5: CONFIGURATION (NCM)
  // -------------------------------------------------------------
  function renderConfigurationView(container) {
    const currentSub = state.subTabs.configuration || 'compliance';

    let configBody = '';

    if (currentSub === 'compliance') {
      configBody = `
        <!-- Compliance Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">PCI-DSS 4.0 STANDARD</div>
            <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 6px;">94% Compliant</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">15 Devices passed, 1 Device requires password review</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">CIS CISCO BENCHMARK</div>
            <div style="font-size: 24px; font-weight: 800; color: #ea580c; margin-top: 6px;">88% Compliant</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">2 Policy violations: Telnet enabled on legacy vty</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">ISO 27001 AUDIT</div>
            <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 6px;">100% Compliant</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">All access logging and encryption criteria satisfied</div>
          </div>
        </div>

        <!-- Drift Alert Strip -->
        <div id="ncm-drift-banner" style="background: ${state.configDriftFixed ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${state.configDriftFixed ? '#bbf7d0' : '#fef3c7'}; border-radius: 4px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${state.configDriftFixed ? '✓' : '⚠'}</span>
            ${state.configDriftFixed ? `
              <span style="font-size: 13px; font-weight: 600; color: #166534;">Startup and Running Configurations are Synchronized</span>
            ` : `
              <span style="font-size: 13px; font-weight: 600; color: #92400e;">Active Drift Detected on DXB-CORE-SW-01</span>
              <span style="font-size: 12px; color: #b45309;">(Running config modified 24 mins ago by operator 'admin' - uncommitted to Startup)</span>
            `}
          </div>
          <div>
            ${state.configDriftFixed ? `
              <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 3px;">NVRAM Synchronized</span>
            ` : `
              <button id="ncm-save-startup-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 3px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">
                Save Running to Startup
              </button>
            `}
          </div>
        </div>

        <!-- Side-by-side Diff Viewer -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Configuration Comparison (Startup vs Running)</span>
            <span style="font-size: 11px; color: #64748b;">Device: Cisco Catalyst 9500-48Y4C</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; font-family: monospace; font-size: 11px; line-height: 1.6;">
            <!-- Baseline Startup -->
            <div style="padding: 16px; background: #ffffff; border-right: 1px solid #edf2f7;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">STARTUP CONFIGURATION (BASELINE)</div>
              <div style="color: #475569;">hostname DXB-CORE-SW-01</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">ip routing</div>
              <div style="color: #475569;">spanning-tree mode rapid-pvst</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">interface TenGigabitEthernet1/0/1</div>
              <div style="color: #475569;"> description Uplink to Spine Router</div>
              <div style="color: #475569;"> switchport mode trunk</div>
              <div style="color: #475569;"> switchport trunk allowed vlan 10,20,30,40</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">interface FortyGigabitEthernet1/0/48</div>
              <div style="color: #475569;"> description Core Uplink to Edge</div>
              <div style="color: #475569;"> switchport mode trunk</div>
              <div style="background: ${state.configDriftFixed ? 'transparent' : '#fee2e2'}; color: ${state.configDriftFixed ? '#475569' : '#dc2626'};"> no shutdown</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">snmp-server community dxb-ro RO</div>
              <div style="color: #475569;">snmp-server host 10.0.0.10 version 2c dxb-ro</div>
            </div>

            <!-- Running Configuration -->
            <div style="padding: 16px; background: #fafbfc;">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 8px;">RUNNING CONFIGURATION (LIVE)</div>
              <div style="color: #475569;">hostname DXB-CORE-SW-01</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">ip routing</div>
              <div style="color: #475569;">spanning-tree mode rapid-pvst</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">interface TenGigabitEthernet1/0/1</div>
              <div style="color: #475569;"> description Uplink to Spine Router</div>
              <div style="color: #475569;"> switchport mode trunk</div>
              <div style="color: #475569;"> switchport trunk allowed vlan 10,20,30,40</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">interface FortyGigabitEthernet1/0/48</div>
              <div style="color: #475569;"> description Core Uplink to Edge</div>
              <div style="color: #475569;"> switchport mode trunk</div>
              <div style="background: ${state.configDriftFixed ? 'transparent' : '#fee2e2'}; color: ${state.configDriftFixed ? '#475569' : '#dc2626'}; font-weight: ${state.configDriftFixed ? 'normal' : '700'};"> ${state.configDriftFixed ? 'no shutdown' : 'shutdown <-- REASON FOR PORT DOWN ALARM'}</div>
              <div style="color: #475569;">!</div>
              <div style="color: #475569;">snmp-server community dxb-ro RO</div>
              <div style="color: #475569;">snmp-server host 10.0.0.10 version 2c dxb-ro</div>
              <div style="background: #dcfce7; color: #166534;">+ access-list 101 permit tcp any host 10.40.1.1 eq 22</div>
            </div>
          </div>
        </div>
      `;
    } else {
      configBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Automated Scheduled Configuration Backups</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Nightly backup job status across New York, London, Singapore, and Dubai network devices.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; text-align: left;">Device Name</th>
                <th style="padding: 8px 12px; text-align: left;">Remote Probe</th>
                <th style="padding: 8px 12px; text-align: left;">Last Backup Time</th>
                <th style="padding: 8px 12px; text-align: left;">Protocol</th>
                <th style="padding: 8px 12px; text-align: left;">Status</th>
                <th style="padding: 8px 12px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.devices.slice(0, 5).map(d => `
                <tr style="border-bottom: 1px solid #f8fafc;">
                  <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">${d.name}</td>
                  <td style="padding: 9px 12px; color: #64748b;">${d.probe}</td>
                  <td style="padding: 9px 12px; color: #334155;">${d.lastBackup}</td>
                  <td style="padding: 9px 12px; color: #475569;">SSHv2 / SCP</td>
                  <td style="padding: 9px 12px;"><span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px;">SUCCESS</span></td>
                  <td style="padding: 9px 12px; text-align: center;">
                    <button class="backup-single-btn" data-name="${d.name}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; color: #0070e0; cursor: pointer;">Backup</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Sub-tabs strip -->
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'compliance', label: 'Compliance' },
            { key: 'changes', label: 'Config Changes' },
            { key: 'vulnerability', label: 'Firmware Vulnerability' },
            { key: 'backups', label: 'Config Backups' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="config-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="ncm-audit-now-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer;">Audit Now</button>
          <button id="ncm-backup-all-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">Backup All</button>
        </div>
      </div>

      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        ${configBody}
      </div>
    `;

    // Hook Subtabs click
    container.querySelectorAll('.config-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.configuration = el.getAttribute('data-sub');
        renderConfigurationView(container);
      };
    });

    // Hook Save Startup Button
    const saveStartupBtn = container.querySelector('#ncm-save-startup-btn');
    if (saveStartupBtn) {
      saveStartupBtn.onclick = () => {
        state.configDriftFixed = true;
        showToast('Running configuration saved to NVRAM Startup on DXB-CORE-SW-01.');
        renderConfigurationView(container);
      };
    }

    // Hook Backup All Button
    const backupAllBtn = container.querySelector('#ncm-backup-all-btn');
    if (backupAllBtn) {
      backupAllBtn.onclick = () => {
        showToast('NCM backup completed across all 16 devices in 4 probes.');
      };
    }
  }

  // -------------------------------------------------------------
  // VIEW 6: REPORTS
  // -------------------------------------------------------------
  function renderReportsView(container) {
    const currentSub = state.subTabs.reports || 'sla';

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'sla', label: 'Availability & SLA' },
            { key: 'performance', label: 'Performance Reports' },
            { key: 'mttr', label: 'Alarms & MTTR' },
            { key: 'lifecycle', label: 'Hardware Lifecycle & Warranty' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="rep-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="report-pdf-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer;">Generate PDF</button>
          <button id="report-csv-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">Export CSV</button>
        </div>
      </div>

      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">ENTERPRISE AVAILABILITY</div>
            <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin-top: 4px;">99.98%</div>
            <div style="font-size: 11px; color: #64748b;">Past 30 Days Cumulative</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">MEAN TIME TO RESOLVE (MTTR)</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">14.2 Mins</div>
            <div style="font-size: 11px; color: #16a34a;">-3.4 mins from last month</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">TOTAL OUTAGE DOWNTIME</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">0 Hrs 8 Mins</div>
            <div style="font-size: 11px; color: #64748b;">Scheduled maintenance window</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">ACTIVE PROBES ONLINE</div>
            <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin-top: 4px;">4 / 4 Probes</div>
            <div style="font-size: 11px; color: #0284c7;">100% Heartbeat SLA</div>
          </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Device Uptime & Availability Ranking</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; text-align: left;">Device Name</th>
                <th style="padding: 8px 12px; text-align: left;">Remote Probe</th>
                <th style="padding: 8px 12px; text-align: left;">Type</th>
                <th style="padding: 8px 12px; text-align: left;">Availability %</th>
                <th style="padding: 8px 12px; text-align: left;">Downtime</th>
              </tr>
            </thead>
            <tbody>
              ${state.devices.map(d => `
                <tr style="border-bottom: 1px solid #f8fafc;">
                  <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">
                    <a href="javascript:void(0)" class="device-name-click" data-name="${d.name}" style="color: #0070e0; text-decoration: none;">${d.name}</a>
                  </td>
                  <td style="padding: 9px 12px; color: #64748b;">${d.probe}</td>
                  <td style="padding: 9px 12px; color: #475569;">${d.category}</td>
                  <td style="padding: 9px 12px; font-weight: 700; color: ${parseFloat(d.availability) >= 99.5 ? '#16a34a' : '#dc2626'};">${d.availability}</td>
                  <td style="padding: 9px 12px; color: #64748b;">0 mins</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Hook Subtabs
    container.querySelectorAll('.rep-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.reports = el.getAttribute('data-sub');
        renderReportsView(container);
      };
    });

    const pdfBtn = container.querySelector('#report-pdf-btn');
    if (pdfBtn) pdfBtn.onclick = () => showToast('Executive PDF availability report compiled and ready.');

    const csvBtn = container.querySelector('#report-csv-btn');
    if (csvBtn) csvBtn.onclick = () => showToast('OpManager Central Availability Report exported to CSV.');

    container.querySelectorAll('.device-name-click').forEach(el => {
      el.onclick = () => {
        const name = el.getAttribute('data-name');
        const dev = state.devices.find(d => d.name === name);
        if (dev) showDeviceSnapshotModal(dev);
      };
    });
  }

  // -------------------------------------------------------------
  // VIEW 7: SETTINGS & AGENTS
  // -------------------------------------------------------------
  function renderSettingsView(container) {
    const currentSub = state.subTabs.settings || 'probes';

    container.innerHTML = `
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'probes', label: 'Central & Probes' },
            { key: 'agents', label: 'Monitoring Agents' },
            { key: 'discovery', label: 'Discovery Rules' },
            { key: 'credentials', label: 'Credential Library' },
            { key: 'engine', label: 'System Engine' }
          ].map(item => {
            const isActive = currentSub === item.key;
            return `
              <div class="settings-subtab" data-sub="${item.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${item.label}
              </div>
            `;
          }).join('')}
        </div>
        <div>
          <button id="register-probe-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Register Remote Probe</button>
        </div>
      </div>

      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        <!-- Monitoring Agents Card (Direct Downloads) -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Official Monitoring Agents (Windows & macOS)</div>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 16px;">Lightweight native agents for high-resolution telemetry, event logs, and WMI services</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <!-- Windows Agent Card -->
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; background: #fafbfc;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0070e0;">Windows Agent (64-bit EXE)</span>
                <span style="font-size: 10px; font-weight: 600; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px;">Build 129203</span>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Compatible with Windows Server 2016/2019/2022 & Windows 10/11 x64.</p>
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 8px 10px; font-family: monospace; font-size: 11px; margin-bottom: 12px; color: #334155;">
                OpManagerAgent.exe --central=http://localhost:8060 --auth=OPM_EE_AUTH_77a82b9
              </div>
              <div style="display: flex; gap: 8px;">
                <a href="/downloads/OpManagerAgent.exe" download style="background: #0070e0; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 3px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                  <span>↓ Download OpManagerAgent.exe</span>
                </a>
                <a href="/downloads/OpManagerAgent.exe" download style="background: #ffffff; border: 1px solid #cbd5e1; color: #475569; text-decoration: none; padding: 6px 12px; border-radius: 3px; font-size: 12px; font-weight: 600;">
                  ZIP
                </a>
              </div>
            </div>

            <!-- macOS Agent Card -->
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; background: #fafbfc;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">macOS Agent (Universal DMG)</span>
                <span style="font-size: 10px; font-weight: 600; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 3px;">Universal Binary</span>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Apple Disk Image (.dmg) bundle for macOS Monterey, Ventura, Sonoma & Sequoia.</p>
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 8px 10px; font-family: monospace; font-size: 11px; margin-bottom: 12px; color: #334155;">
                sudo ./OpManagerAgent.app/Contents/MacOS/agent --server=http://localhost:8060
              </div>
              <div>
                <a href="/downloads/OpManagerAgent.dmg" download style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 3px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                  <span>↓ Download OpManagerAgent.dmg</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Central Communication & Settings Cards -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Central Communication & Coordination Settings</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">CENTRAL AUTH TOKEN</div>
              <div style="font-size: 12px; font-family: monospace; font-weight: 700; color: #0f172a; margin-top: 4px;">OPM_EE_AUTH_77a82b9e64f89c01</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">PROBE COMM PORT</div>
              <div style="font-size: 12px; font-family: monospace; font-weight: 700; color: #0070e0; margin-top: 4px;">TCP 8060 (TLS Encrypted)</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b;">FAST POLLING INTERVAL</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 4px;">4 Seconds (Adaptive Stream)</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook Subtabs
    container.querySelectorAll('.settings-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.settings = el.getAttribute('data-sub');
        renderSettingsView(container);
      };
    });
  }

  // -------------------------------------------------------------
  // MASTER ROUTE DISPATCHER
  // -------------------------------------------------------------
  function handleRoute() {
    const activeTab = resolveTabFromHash();
    state.currentTab = activeTab;

    syncHeaderTabs(activeTab);
    setupHeaderBrandingAndIcons();

    const titleMap = {
      'dashboard': 'Dashboard - OpManager Central',
      'inventory': 'Device Inventory - OpManager Central',
      'alarms': 'Active Alarms - Alarms - OpManager Central',
      'maps': 'Topology & Business Views - OpManager Central',
      'configuration': 'Network Configuration Management - OpManager Central',
      'reports': 'Executive Summary Reports - OpManager Central',
      'settings': 'Enterprise Settings - OpManager Central'
    };
    document.title = titleMap[activeTab] || 'OpManager Central';

    const overlay = ensureOverlayContainer();
    const nativeContainer = document.querySelector('.page-container');
    if (nativeContainer) nativeContainer.style.display = 'none';
    overlay.style.display = 'block';

    switch (activeTab) {
      case 'dashboard':
        renderDashboardView(overlay);
        break;
      case 'inventory':
        renderInventoryView(overlay);
        break;
      case 'alarms':
        renderAlarmsView(overlay);
        break;
      case 'maps':
        renderMapsView(overlay);
        break;
      case 'configuration':
        renderConfigurationView(overlay);
        break;
      case 'reports':
        renderReportsView(overlay);
        break;
      case 'settings':
        renderSettingsView(overlay);
        break;
      default:
        renderDashboardView(overlay);
    }
  }

  // Hook Header Events for Navigation
  function hookMainHeaderEvents() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const navItems = header.querySelectorAll('#main-nav ul li, #main-nav ul li a, .tab-container .tab-item');
    navItems.forEach(el => {
      if (el.hasAttribute('data-route-hooked')) return;
      el.setAttribute('data-route-hooked', 'true');
      el.style.cursor = 'pointer';

      el.addEventListener('click', (e) => {
        const text = (el.innerText || '').trim().toLowerCase();
        let target = '';
        if (text.includes('dashboard')) target = '#/dashboard';
        else if (text.includes('inventory')) target = '#/inventory';
        else if (text.includes('alarm')) target = '#/alarms/list/active';
        else if (text.includes('map')) target = '#/maps';
        else if (text.includes('configuration')) target = '#/configuration';
        else if (text.includes('report')) target = '#/reports';
        else if (text.includes('setting')) target = '#/settings';

        if (target) {
          e.preventDefault();
          e.stopPropagation();
          window.location.hash = target;
          handleRoute();
        }
      });
    });
  }

  // WebSocket Integration for Live Poller Events
  function initWebSocket() {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${window.location.host}/PNSHandler`;
    try {
      const socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ALARM_TOAST') {
            showToast(`${data.alarm.device}: ${data.alarm.message}`, 'error');
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  // Auto-Refresh Countdown Ticker (Every 1 second)
  setInterval(() => {
    if (state.autoRefreshInterval > 0) {
      state.autoRefreshCountdown--;
      if (state.autoRefreshCountdown <= 0) {
        state.autoRefreshCountdown = state.autoRefreshInterval;
        // Jitter metrics on tick
        state.devices.forEach(d => {
          if (d.status === 'Clear') {
            d.cpu = Math.max(15, Math.min(85, Math.round(d.cpu + (Math.random() * 4 - 2))));
            d.memory = Math.max(20, Math.min(85, Math.round(d.memory + (Math.random() * 2 - 1))));
          }
        });
        const container = document.getElementById('opm-custom-suite-container');
        if (container && state.currentTab === 'dashboard' && state.subTabs.dashboard === 'overview') {
          renderDashboardView(container);
        }
      } else {
        const span = document.getElementById('opm-refresh-countdown-span');
        if (span) {
          span.innerText = `● Auto Refresh: ${state.autoRefreshCountdown}s ▾`;
        }
      }
    }
  }, 1000);

  // Periodic Poller for Header & Observer
  setInterval(() => {
    hookMainHeaderEvents();
    syncHeaderTabs(state.currentTab);
    setupHeaderBrandingAndIcons();
  }, 1500);

  // Initialization Listeners
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', () => {
    hookMainHeaderEvents();
    initWebSocket();
    setTimeout(handleRoute, 300);
  });

  // Public API helpers for automated verification and external hooks
  window.OpManagerSuite = {
    showAboutModal,
    showProbeDetailsModal,
    showDeviceSnapshotModal,
    showAlarmDetailsDrawer,
    showZiaAssistantModal,
    showAddDeviceModal,
    showAddWidgetModal,
    renderDashboardView,
    renderInventoryView,
    renderAlarmsView,
    renderMapsView,
    renderConfigurationView,
    renderReportsView,
    renderSettingsView,
    state
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    hookMainHeaderEvents();
    initWebSocket();
    setTimeout(handleRoute, 300);
  }
})();
''')

print("All remaining views and router appended successfully.")
