const fs = require("fs");
const file = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js";
let content = fs.readFileSync(file, "utf8");

const oldNocBlock = `          <!-- Fullscreen NOC Wallboard View (noc) -->
          <div style="background: #0f172a; border-radius: 8px; padding: 24px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #16a34a;"></span>
                <span style="font-size: 18px; font-weight: 800; color: #38bdf8;">OPMANAGER CENTRAL OPERATIONS WALLBOARD (NOC)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="opm-noc-fullscreen-btn" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  ⤢ Fullscreen Wallboard
                </button>
                <a href="/noc" target="_blank" style="background: #0070e0; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700;">Open Standalone NOC Window ↗</a>
              </div>
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
                \${state.alarms.slice(0, 4).map(a => \`
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px;">
                    <span style="color: \${a.severity === 'Critical' ? '#f87171' : '#fcd34d'}; font-weight: 700;">[\${a.severity.toUpperCase()}] \${a.device}</span>
                    <span style="color: #cbd5e1;">\${a.message}</span>
                    <span style="color: #94a3b8; font-family: monospace;">\${a.time}</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          </div>`;

const newNocBlock = `          <!-- Multi-Slide Fullscreen NOC Wallboard View (noc) -->
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
                <button class="opm-noc-slide-btn" data-slide="0" style="background: \${(state.nocSlide || 0) === 0 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">1. Probes Health</button>
                <button class="opm-noc-slide-btn" data-slide="1" style="background: \${state.nocSlide === 1 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">2. Active Alarms & RCA</button>
                <button class="opm-noc-slide-btn" data-slide="2" style="background: \${state.nocSlide === 2 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">3. Bandwidth Utilization</button>
                <button class="opm-noc-slide-btn" data-slide="3" style="background: \${state.nocSlide === 3 ? '#0070e0' : '#0f172a'}; color: #fff; border: 1px solid #334155; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">4. Power & Thermal</button>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 11px; color: #38bdf8; font-family: monospace;">
                  Rotation: <strong>\${state.nocAutoPlay !== false ? 'Active (15s)' : 'Manual'}</strong>
                </div>
                <button id="opm-noc-autoplay-toggle" style="background: \${state.nocAutoPlay !== false ? '#166534' : '#334155'}; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  \${state.nocAutoPlay !== false ? '⏸ Pause Carousel' : '▶ Play Carousel'}
                </button>
              </div>
            </div>

            <!-- Dynamic Slide Content -->
            \${(state.nocSlide || 0) === 0 ? \`
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
            \` : state.nocSlide === 1 ? \`
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
                      \${state.alarms.map(a => \`
                        <tr style="border-bottom: 1px solid #283347;">
                          <td style="padding: 8px 8px;">\${getStatusBadge(a.severity)}</td>
                          <td style="padding: 8px 8px; font-weight: 700; color: #38bdf8; cursor: pointer;" onclick="showDeviceSnapshotModal('\${a.device}')">\${a.device}</td>
                          <td style="padding: 8px 8px; color: #cbd5e1;">\${a.entity}</td>
                          <td style="padding: 8px 8px; color: #f8fafc;">\${a.message}</td>
                          <td style="padding: 8px 8px; color: #94a3b8;">\${a.probe}</td>
                          <td style="padding: 8px 8px; color: #a5b4fc; font-weight: 600;">\${a.technician}</td>
                          <td style="padding: 8px 8px; text-align: right; color: #94a3b8; font-family: monospace;">\${a.time}</td>
                        </tr>
                      \`).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            \` : state.nocSlide === 2 ? \`
              <!-- SLIDE 2: TOP BANDWIDTH CONSUMING LINKS -->
              <div style="background: #1e293b; border-radius: 6px; padding: 18px; border: 1px solid #334155;">
                <div style="font-weight: 800; font-size: 14px; color: #38bdf8; margin-bottom: 14px;">ENTERPRISE INTERFACES BANDWIDTH CONSUMPTION MATRIX</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
                  \${(state.topInterfaces || []).slice(0, 6).map(inf => \`
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 14px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                          <div style="font-weight: 700; font-size: 12px; color: #f8fafc;">\${inf.device} - \${inf.name}</div>
                          <div style="font-size: 10px; color: #94a3b8;">Probe: \${inf.probe} &bull; Capacity: \${inf.speed}</div>
                        </div>
                        <span style="font-size: 10px; font-weight: 800; background: #064e3b; color: #34d399; padding: 2px 6px; border-radius: 2px;">UP</span>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                        <div>
                          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="color: #4ade80;">IN Rate: \${inf.inTraffic} Mbps (\${inf.inPercent || 48}%)</span>
                          </div>
                          <div style="height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                            <div style="width: \${inf.inPercent || 48}%; height: 100%; background: #22c55e;"></div>
                          </div>
                        </div>
                        <div>
                          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="color: #38bdf8;">OUT Rate: \${inf.outTraffic} Mbps (\${inf.outPercent || 42}%)</span>
                          </div>
                          <div style="height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                            <div style="width: \${inf.outPercent || 42}%; height: 100%; background: #0284c7;"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  \`).join('')}
                </div>
              </div>
            \` : \`
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
            \`}
          </div>`;

content = content.replace(oldNocBlock, newNocBlock);

// Add event handlers for NOC slides
const targetNocHandlers = `    // NOC Wallboard Fullscreen Toggle
    const nocFsBtn = container.querySelector('#opm-noc-fullscreen-btn');`;

const newNocHandlers = `    // NOC Slide Buttons
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
    const nocFsBtn = container.querySelector('#opm-noc-fullscreen-btn');`;

content = content.replace(targetNocHandlers, newNocHandlers);

fs.writeFileSync(file, content, "utf8");
console.log("Successfully updated 03_views_dashboard_inventory.js with NOC Wallboard carousel!");
