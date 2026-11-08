import os

path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js'

with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Target to replace: from <!-- WIDGET 3: Alarms by Severity --> down to the end of WIDGET 6
start_marker = '<!-- WIDGET 3: Alarms by Severity -->'
end_marker = '<!-- WIDGET 7: Disk Partition Utilization -->'

start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"Error: Markers not found! start={start_idx}, end={end_idx}")
    exit(1)

new_widgets = '''<!-- WIDGET 3: Alarms by Severity -->
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
                          <td style="padding: 5px 4px; font-weight: 700; color: #0070e0; cursor: pointer;" class="opm-device-link" data-id="${d.id}">${d.name}</td>
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
                          <td style="padding: 5px 4px; font-weight: 700; color: #0070e0; cursor: pointer;" class="opm-device-link" data-id="${d.id}">${d.name}</td>
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

            '''

updated = code[:start_idx] + new_widgets + code[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(updated)

print(f"Successfully updated {path}!")
