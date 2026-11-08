#!/usr/bin/env python3
import os

target_path = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js"

with open(target_path, "a", encoding="utf-8") as f:
    f.write(r'''
  // -------------------------------------------------------------
  // VIEW 1: DASHBOARD
  // -------------------------------------------------------------
  function renderDashboardView(container) {
    const currentSub = state.subTabs.dashboard || 'overview';
    const filteredDevices = state.selectedProbe === 'all' 
      ? state.devices 
      : state.devices.filter(d => String(d.probeId) === String(state.selectedProbe));

    const critAlarms = filteredDevices.filter(d => d.status === 'Critical').length;
    const trbAlarms = filteredDevices.filter(d => d.status === 'Trouble').length;
    const attnAlarms = filteredDevices.filter(d => d.status === 'Attention').length;

    let mainContentHtml = '';

    if (currentSub === 'overview') {
      mainContentHtml = `
        <!-- KPI Strip -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">CENTRAL PROBE STATUS</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 22px; font-weight: 700; color: #0f172a;">4 / 4 Probes</span>
              <span style="font-size: 12px; font-weight: 600; color: #16a34a;">100% ONLINE</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">New York • London • Singapore • Dubai</div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">MONITORED DEVICES</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 22px; font-weight: 700; color: #0f172a;">${filteredDevices.length} Devices</span>
              <span style="font-size: 12px; font-weight: 600; color: #0070e0;">All Monitored</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">3 Routers, 4 Switches, 2 FWs, 4 Servers, 3 Others</div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">ACTIVE ALARMS</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 22px; font-weight: 700; color: #dc2626;">${critAlarms + trbAlarms + attnAlarms} Active</span>
              <span style="font-size: 11px; font-weight: 600; color: #dc2626;">${critAlarms} Critical</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${trbAlarms} Trouble, ${attnAlarms} Attention, 0 Service Down</div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">BACKBONE SLA & HEALTH</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 22px; font-weight: 700; color: #16a34a;">99.98%</span>
              <span style="font-size: 12px; font-weight: 600; color: #64748b;">18.2 ms RTT</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Zero packet loss across all TLS tunnel links</div>
          </div>
        </div>

        <!-- 2-Column Widget Grid (Row 1) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Widget 1: Probe Health & Sync -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Distributed Probes Health & Sync</span>
              <div style="display: flex; gap: 10px; align-items: center;">
                <span class="w-refresh-btn" title="Refresh Widget" style="cursor: pointer; display: flex; align-items: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></span>
                <span class="w-max-btn" data-title="Distributed Probes Health & Sync" title="Maximize" style="cursor: pointer; display: flex; align-items: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>
                <span class="w-menu-btn" title="Options" style="cursor: pointer; display: flex; align-items: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></span>
              </div>
            </div>
            <div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #fcfdfe; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 9px 14px; text-align: left;">Probe Name</th>
                    <th style="padding: 9px 14px; text-align: left;">IP Address</th>
                    <th style="padding: 9px 14px; text-align: left;">RTT</th>
                    <th style="padding: 9px 14px; text-align: left;">Assets</th>
                    <th style="padding: 9px 14px; text-align: left;">Status</th>
                    <th style="padding: 9px 14px; text-align: left;">Sync State</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.probes.map(p => `
                    <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 9px 14px; font-weight: 600;">
                        <span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 4px; border-radius: 2px; margin-right: 6px;">${p.flag}</span>
                        <a href="javascript:void(0)" class="probe-name-link" data-id="${p.id}" style="color: #0070e0; text-decoration: none;">${p.name}</a>
                      </td>
                      <td style="padding: 9px 14px; color: #475569; font-family: monospace;">${p.ip}</td>
                      <td style="padding: 9px 14px; color: #64748b;">${p.latency} ms</td>
                      <td style="padding: 9px 14px; color: #334155;">${p.devicesCount} Devices</td>
                      <td style="padding: 9px 14px;">${getStatusBadge(p.status === 'Online' ? 'Clear' : 'Critical')}</td>
                      <td style="padding: 9px 14px; color: #0284c7; font-weight: 600;">✓ ${p.syncStatus}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Widget 2: Alarms by Severity -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Alarms by Severity</span>
              <a href="#/alarms/list/active" style="font-size: 12px; color: #0070e0; text-decoration: none; font-weight: 600;">View All Alarms (${state.alarms.length}) →</a>
            </div>
            <div style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #64748b; font-weight: 600;">Alarm Breakdown (16 Monitored Devices)</span>
                <span style="font-size: 11px; color: #334155; font-weight: 700;">7 Active / 9 Clear</span>
              </div>
              <!-- Stacked Severity Bar -->
              <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 16px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                <div style="width: 14%; background: #dc2626;" title="Critical: 2 (14%)"></div>
                <div style="width: 28%; background: #ea580c;" title="Trouble: 2 (28%)"></div>
                <div style="width: 28%; background: #ca8a04;" title="Attention: 3 (28%)"></div>
                <div style="width: 30%; background: #16a34a;" title="Clear: 10 (30%)"></div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px 6px;">
                  <div style="font-size: 20px; font-weight: 800; color: #dc2626;">1</div>
                  <div style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase; margin-top: 2px;">CRITICAL</div>
                </div>
                <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 4px; padding: 12px 6px;">
                  <div style="font-size: 20px; font-weight: 800; color: #ea580c;">2</div>
                  <div style="font-size: 10px; font-weight: 700; color: #9a3412; text-transform: uppercase; margin-top: 2px;">TROUBLE</div>
                </div>
                <div style="background: #fefce8; border: 1px solid #fef9c3; border-radius: 4px; padding: 12px 6px;">
                  <div style="font-size: 20px; font-weight: 800; color: #ca8a04;">3</div>
                  <div style="font-size: 10px; font-weight: 700; color: #854d0e; text-transform: uppercase; margin-top: 2px;">ATTENTION</div>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 4px; padding: 12px 6px;">
                  <div style="font-size: 20px; font-weight: 800; color: #16a34a;">10</div>
                  <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; margin-top: 2px;">CLEAR</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2-Column Widget Grid (Row 2: Top CPU & Top Memory) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Widget 3: Top CPU -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top 5 Devices by CPU Utilization</span>
              <span style="font-size: 11px; color: #64748b;">Threshold: 80% / 90%</span>
            </div>
            <div style="padding: 14px;">
              ${[...filteredDevices].sort((a,b) => b.cpu - a.cpu).slice(0, 5).map(d => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      ${getCategoryIcon(d.category)}
                      <a href="javascript:void(0)" class="device-name-click" data-name="${d.name}" style="color: #0070e0; font-weight: 600; text-decoration: none;">${d.name}</a>
                      <span style="font-size: 10px; color: #64748b;">(${d.probe})</span>
                    </span>
                    <span style="font-weight: 700; color: ${d.cpu >= 90 ? '#dc2626' : d.cpu >= 75 ? '#ea580c' : '#0284c7'};">${d.cpu}%</span>
                  </div>
                  <div style="background: #edf2f7; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="background: ${d.cpu >= 90 ? '#dc2626' : d.cpu >= 75 ? '#ea580c' : '#0070e0'}; width: ${d.cpu}%; height: 100%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Widget 4: Top Memory -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top 5 Devices by Memory Utilization</span>
              <span style="font-size: 11px; color: #64748b;">Threshold: 80% / 90%</span>
            </div>
            <div style="padding: 14px;">
              ${[...filteredDevices].sort((a,b) => b.memory - a.memory).slice(0, 5).map(d => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      ${getCategoryIcon(d.category)}
                      <a href="javascript:void(0)" class="device-name-click" data-name="${d.name}" style="color: #0070e0; font-weight: 600; text-decoration: none;">${d.name}</a>
                      <span style="font-size: 10px; color: #64748b;">(${d.probe})</span>
                    </span>
                    <span style="font-weight: 700; color: ${d.memory >= 90 ? '#dc2626' : d.memory >= 75 ? '#ea580c' : '#0284c7'};">${d.memory}%</span>
                  </div>
                  <div style="background: #edf2f7; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="background: ${d.memory >= 90 ? '#dc2626' : d.memory >= 75 ? '#ea580c' : '#0070e0'}; width: ${d.memory}%; height: 100%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 2-Column Widget Grid (Row 3: Top Interfaces & Storage Health) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <!-- Widget 5: Top Interfaces -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Top 10 Monitored Interfaces by Traffic (bps)</span>
              <span style="font-size: 11px; color: #16a34a; font-weight: 600;">● Live Bandwidth</span>
            </div>
            <div>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: #fcfdfe; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 10px; text-transform: uppercase;">
                    <th style="padding: 8px 12px; text-align: left;">Port Name & Device</th>
                    <th style="padding: 8px 12px; text-align: left;">Speed</th>
                    <th style="padding: 8px 12px; text-align: left;">In / Out Rate</th>
                    <th style="padding: 8px 12px; text-align: left;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.topInterfaces.slice(0, 5).map(iface => `
                    <tr style="border-bottom: 1px solid #f8fafc;">
                      <td style="padding: 7px 12px;">
                        <div style="font-weight: 600; color: #0070e0;">${iface.name}</div>
                        <div style="font-size: 10px; color: #64748b;">${iface.device}</div>
                      </td>
                      <td style="padding: 7px 12px; color: #475569;">${iface.speed}</td>
                      <td style="padding: 7px 12px; font-family: monospace;">
                        <span style="color: #16a34a;">↓ ${iface.inTraffic} Mbps (${iface.inPercent}%)</span><br>
                        <span style="color: #0284c7;">↑ ${iface.outTraffic} Mbps (${iface.outPercent}%)</span>
                      </td>
                      <td style="padding: 7px 12px;">
                        <span style="font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 2px; ${iface.status === 'UP' ? 'background:#dcfce7;color:#166534;' : 'background:#fee2e2;color:#991b1b;'}">${iface.status}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Widget 6: Disk Space Health -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Disk Space & Storage Partition Health</span>
              <span style="font-size: 11px; color: #64748b;">Warning Threshold: 85%</span>
            </div>
            <div style="padding: 14px;">
              ${state.diskVolumes.map(vol => `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: #1e293b; font-family: monospace;">${vol.partition} <span style="font-size: 10px; color: #64748b; font-family: sans-serif;">(${vol.device})</span></span>
                    <span style="font-weight: 700; color: ${vol.percent >= 90 ? '#dc2626' : vol.percent >= 75 ? '#ea580c' : '#16a34a'};">${vol.used} / ${vol.total} (${vol.percent}%)</span>
                  </div>
                  <div style="background: #edf2f7; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="background: ${vol.percent >= 90 ? '#dc2626' : vol.percent >= 75 ? '#ea580c' : '#16a34a'}; width: ${vol.percent}%; height: 100%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 2-Column Widget Grid (Row 4: Backbone Traffic & Recent Critical Alarms) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Widget 7: Backbone Traffic Spline -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Enterprise Backbone Transit Traffic (bps)</span>
              <div style="display: flex; gap: 12px; font-size: 11px;">
                <span style="color: #16a34a; font-weight: 600;">● In: 1.84 Gbps</span>
                <span style="color: #0284c7; font-weight: 600;">● Out: 1.28 Gbps</span>
              </div>
            </div>
            <div style="padding: 12px;">
              <svg viewBox="0 0 500 120" style="width: 100%; height: 120px;">
                <defs>
                  <linearGradient id="gradIn" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#16a34a;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#16a34a;stop-opacity:0.0" />
                  </linearGradient>
                  <linearGradient id="gradOut" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#0284c7;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#0284c7;stop-opacity:0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0,100 Q 120,40 240,70 T 500,30 L 500,120 L 0,120 Z" fill="url(#gradIn)" />
                <path d="M 0,100 Q 120,40 240,70 T 500,30" fill="none" stroke="#16a34a" stroke-width="2" />
                <path d="M 0,110 Q 130,60 250,90 T 500,50 L 500,120 L 0,120 Z" fill="url(#gradOut)" />
                <path d="M 0,110 Q 130,60 250,90 T 500,50" fill="none" stroke="#0284c7" stroke-width="2" />
              </svg>
            </div>
          </div>

          <!-- Widget 8: Recent Critical Alarms -->
          <div class="opm-widget-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="background: #f8fafc; border-bottom: 1px solid #edf2f7; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Recent Critical Alarms (Live Feed)</span>
              <span style="font-size: 11px; color: #dc2626; font-weight: 700;">● Real-time Stream</span>
            </div>
            <div style="padding: 8px 14px;">
              ${state.alarms.slice(0, 4).map(alm => `
                <div style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; ${alm.severity === 'Critical' ? 'background:#dc2626;' : alm.severity === 'Trouble' ? 'background:#ea580c;' : 'background:#ca8a04;'}"></span>
                    <a href="javascript:void(0)" class="device-name-click" data-name="${alm.device}" style="font-size: 12px; font-weight: 700; color: #0070e0; text-decoration: none;">${alm.device}</a>
                    <span style="font-size: 11px; color: #475569; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${alm.message}</span>
                  </div>
                  <span style="font-size: 10px; color: #94a3b8;">${alm.time}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (currentSub === 'summary') {
      mainContentHtml = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Executive Infrastructure Scorecard</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Global health posture across 4 distributed enterprise regions.</p>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">DEVICE AVAILABILITY</div>
              <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 4px;">99.98%</div>
              <div style="font-size: 11px; color: #64748b;">Enterprise SLA Target: 99.9%</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">MEAN TIME TO RESOLVE</div>
              <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">14.2 Mins</div>
              <div style="font-size: 11px; color: #16a34a;">-3.4 mins from last month</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">CONFIG DRIFT POSTURE</div>
              <div style="font-size: 24px; font-weight: 800; color: #0284c7; margin-top: 4px;">15 / 16 Synced</div>
              <div style="font-size: 11px; color: #ea580c;">1 Drift Detected in Dubai</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px; background: #fafbfc;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">COMPLIANCE AUDIT</div>
              <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 4px;">94.0% PCI-DSS</div>
              <div style="font-size: 11px; color: #64748b;">CIS Benchmark: 88.0%</div>
            </div>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">Device Category Breakdown</div>
          <div style="display: flex; gap: 12px;">
            ${[
              { cat: 'Routers', count: 4, icon: 'Routers' },
              { cat: 'Switches', count: 4, icon: 'Switches' },
              { cat: 'Firewalls', count: 2, icon: 'Firewalls' },
              { cat: 'Servers', count: 4, icon: 'Servers' },
              { cat: 'Wireless', count: 1, icon: 'Wireless' },
              { cat: 'Storage', count: 1, icon: 'Storage' }
            ].map(c => `
              <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                ${getCategoryIcon(c.icon)}
                <div>
                  <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${c.count}</div>
                  <div style="font-size: 11px; color: #64748b;">${c.cat}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (currentSub === 'servers') {
      mainContentHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${state.devices.filter(d => d.category === 'Servers').map(srv => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${getCategoryIcon('Servers')}
                  <a href="javascript:void(0)" class="device-name-click" data-name="${srv.name}" style="font-size: 14px; font-weight: 700; color: #0070e0; text-decoration: none;">${srv.name}</a>
                </div>
                ${getStatusBadge(srv.status)}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 14px;">${srv.type} • IP: ${srv.ip} • Probe: ${srv.probe}</div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
                <div style="background: #f8fafc; border: 1px solid #edf2f7; border-radius: 3px; padding: 8px; text-align: center;">
                  <div style="font-size: 10px; color: #64748b; font-weight: 700;">CPU</div>
                  <div style="font-size: 16px; font-weight: 800; color: ${srv.cpu >= 80 ? '#dc2626' : '#0070e0'};">${srv.cpu}%</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #edf2f7; border-radius: 3px; padding: 8px; text-align: center;">
                  <div style="font-size: 10px; color: #64748b; font-weight: 700;">MEMORY</div>
                  <div style="font-size: 16px; font-weight: 800; color: ${srv.memory >= 80 ? '#dc2626' : '#0070e0'};">${srv.memory}%</div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #edf2f7; border-radius: 3px; padding: 8px; text-align: center;">
                  <div style="font-size: 10px; color: #64748b; font-weight: 700;">DISK</div>
                  <div style="font-size: 16px; font-weight: 800; color: ${srv.disk >= 85 ? '#dc2626' : '#16a34a'};">${srv.disk}%</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                <span>OS: ${srv.osVersion}</span>
                <span style="color: #16a34a; font-weight: 600;">● Service Active</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (currentSub === 'virtualization') {
      mainContentHtml = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">VMware ESXi 8.0 & Hyper-V Cluster Telemetry</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Virtual infrastructure monitoring across London, Singapore, and New York.</p>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700;">ESXi HOSTS</div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">3 Hosts</div>
              <div style="font-size: 11px; color: #16a34a;">100% Up</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700;">MONITORED VMS</div>
              <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin-top: 4px;">24 Active</div>
              <div style="font-size: 11px; color: #64748b;">0 Sprawl Warnings</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700;">RAM OVERCOMMIT</div>
              <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">1.18x</div>
              <div style="font-size: 11px; color: #64748b;">Optimal < 1.5x</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background: #fafbfc;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700;">DATASTORE CAPACITY</div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">5.2 / 8.0 TB</div>
              <div style="font-size: 11px; color: #16a34a;">65% Utilized</div>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; text-align: left;">Virtual Host / VM Name</th>
                <th style="padding: 8px 12px; text-align: left;">Hypervisor</th>
                <th style="padding: 8px 12px; text-align: left;">Assigned vCPUs</th>
                <th style="padding: 8px 12px; text-align: left;">Memory Provisioned</th>
                <th style="padding: 8px 12px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">esxi-host-lon-01.corp</td>
                <td style="padding: 9px 12px; color: #475569;">VMware ESXi 8.0.1</td>
                <td style="padding: 9px 12px; color: #334155;">32 Logical vCPUs</td>
                <td style="padding: 9px 12px; color: #334155;">128 GB ECC DDR4</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Clear')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">LON-MAIL-EXCH-01 (VM)</td>
                <td style="padding: 9px 12px; color: #475569;">Guest: Win Server 2022</td>
                <td style="padding: 9px 12px; color: #334155;">8 vCPUs (39.5% Util)</td>
                <td style="padding: 9px 12px; color: #334155;">32 GB (58% Util)</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Clear')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">sg-k8s-worker-01 (VM)</td>
                <td style="padding: 9px 12px; color: #475569;">Guest: Ubuntu 22.04</td>
                <td style="padding: 9px 12px; color: #334155;">16 vCPUs (46.0% Util)</td>
                <td style="padding: 9px 12px; color: #334155;">64 GB (62% Util)</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Clear')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else if (currentSub === 'storage') {
      mainContentHtml = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Enterprise Storage Arrays & Power UPS Matrix</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">LUN capacity, SAN fabric throughput, and UPS runtime battery telemetry.</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; background: #fafbfc;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Schneider Galaxy 3500 40kVA UPS</span>
                ${getStatusBadge('Attention')}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Dubai Datacenter Main Feed • IP: 10.40.9.5</div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span>Battery Runtime Remaining:</span>
                <span style="font-weight: 700; color: #ea580c;">42 Minutes (Threshold: 45m)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span>UPS Inverter Load:</span>
                <span style="font-weight: 700; color: #0284c7;">58.4% (23.3 kW)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>Battery Internal Temperature:</span>
                <span style="font-weight: 700; color: #16a34a;">32.0°C (Normal)</span>
              </div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; background: #fafbfc;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 13px; font-weight: 700; color: #1e293b;">PostgreSQL SAN Cluster Volumes</span>
                ${getStatusBadge('Trouble')}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">New York Data Center • Dell PowerEdge R750</div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span>/var/lib/postgresql:</span>
                <span style="font-weight: 700; color: #dc2626;">456 GB / 500 GB (91.2% - Alert)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span>D:\\Data (Postgres Arch):</span>
                <span style="font-weight: 700; color: #ca8a04;">912 GB / 1.2 TB (76.0%)</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>RAID 10 Controller Status:</span>
                <span style="font-weight: 700; color: #16a34a;">Optimal (8 Disks Online)</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (currentSub === 'network') {
      mainContentHtml = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Enterprise Network Fabric & Routing Peers</div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">88 Total Monitored Interfaces (82 UP, 6 DOWN) across Cisco, Juniper, Arista and Fortinet switches.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; text-align: left;">Network Core Node</th>
                <th style="padding: 8px 12px; text-align: left;">Probe Region</th>
                <th style="padding: 8px 12px; text-align: left;">Vendor & Model</th>
                <th style="padding: 8px 12px; text-align: left;">Routing Protocol</th>
                <th style="padding: 8px 12px; text-align: left;">Peer State</th>
                <th style="padding: 8px 12px; text-align: left;">Health</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">DXB-CORE-SW-01</td>
                <td style="padding: 9px 12px; color: #64748b;">Dubai Campus Core</td>
                <td style="padding: 9px 12px;">Cisco Catalyst 9500-48Y4C</td>
                <td style="padding: 9px 12px; font-family: monospace;">BGP AS 65001</td>
                <td style="padding: 9px 12px; color: #16a34a; font-weight: 600;">Established (4 Peers)</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Critical')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">NY-NEXUS-SW-01</td>
                <td style="padding: 9px 12px; color: #64748b;">New York Data Center</td>
                <td style="padding: 9px 12px;">Cisco Nexus 93180YC-FX</td>
                <td style="padding: 9px 12px; font-family: monospace;">OSPF Area 0</td>
                <td style="padding: 9px 12px; color: #16a34a; font-weight: 600;">Full / DR (24 Adj)</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Clear')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f8fafc;">
                <td style="padding: 9px 12px; font-weight: 600; color: #0070e0;">SG-VPNGW-RTR-01</td>
                <td style="padding: 9px 12px; color: #64748b;">Singapore Cloud VPC</td>
                <td style="padding: 9px 12px;">Juniper MX204 3D Edge</td>
                <td style="padding: 9px 12px; font-family: monospace;">IPSec Hub & Spoke</td>
                <td style="padding: 9px 12px; color: #16a34a; font-weight: 600;">Phase 2 Active</td>
                <td style="padding: 9px 12px;">${getStatusBadge('Clear')}</td>
              </tr>
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
            { key: 'overview', label: 'Overview' },
            { key: 'summary', label: 'Summary' },
            { key: 'servers', label: 'Servers' },
            { key: 'virtualization', label: 'Virtualization' },
            { key: 'storage', label: 'Storage' },
            { key: 'network', label: 'Network' },
            { key: 'noc', label: 'NOC View ↗' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="dash-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="add-widget-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>+ Add Widget</span>
          </button>
          <div style="position: relative; display: inline-block;">
            <button id="auto-refresh-selector" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
              <span id="opm-refresh-countdown-span" style="color: #16a34a;">● Auto Refresh: ${state.autoRefreshCountdown}s ▾</span>
            </button>
          </div>
          <button id="toggle-fullscreen-btn" title="Toggle Fullscreen" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; font-size: 12px; color: #334155; cursor: pointer;">
            ⛶
          </button>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        ${mainContentHtml}
      </div>
    `;

    // Hook Subtabs click
    container.querySelectorAll('.dash-subtab').forEach(el => {
      el.onclick = () => {
        const sub = el.getAttribute('data-sub');
        if (sub === 'noc') {
          window.open('/noc', '_blank');
          return;
        }
        state.subTabs.dashboard = sub;
        renderDashboardView(container);
      };
    });

    // Hook Add Widget Button
    const addWBtn = container.querySelector('#add-widget-btn');
    if (addWBtn) addWBtn.onclick = () => showAddWidgetModal();

    // Hook Probe Links
    container.querySelectorAll('.probe-name-link').forEach(el => {
      el.onclick = () => {
        const pId = el.getAttribute('data-id');
        const probe = state.probes.find(p => String(p.id) === String(pId));
        if (probe) showProbeDetailsModal(probe);
      };
    });

    // Hook Device Name clicks for master snapshot
    container.querySelectorAll('.device-name-click').forEach(el => {
      el.onclick = () => {
        const name = el.getAttribute('data-name');
        const dev = state.devices.find(d => d.name === name);
        if (dev) showDeviceSnapshotModal(dev);
      };
    });

    // Hook Widget Toolbar buttons
    container.querySelectorAll('.w-refresh-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        showToast('Widget telemetry refreshed from Central Poller.');
      };
    });

    container.querySelectorAll('.w-max-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const title = btn.getAttribute('data-title') || 'Enterprise Widget';
        showToast(`Expanded: ${title}`);
      };
    });
  }
''')

print("Dashboard View appended.")
