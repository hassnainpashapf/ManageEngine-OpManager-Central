const fs = require("fs");
const file = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/04_views_alarms_maps.js";
let content = fs.readFileSync(file, "utf8");

// 1. Add worldmap to subtabs array
const oldSubtabs = `    const subtabs = [
      { id: 'business', name: 'Business Views' },
      { id: 'floor', name: '3D Floor Views' },
      { id: 'rack', name: '3D Rack Views (42U)' },
      { id: 'layer2', name: 'Layer 2 STP Maps' }
    ];`;

const newSubtabs = `    const subtabs = [
      { id: 'business', name: 'Business Views' },
      { id: 'floor', name: '3D Floor Views' },
      { id: 'rack', name: '3D Rack Views (42U)' },
      { id: 'layer2', name: 'Layer 2 STP Maps' },
      { id: 'worldmap', name: 'Global Probes WAN World Map' }
    ];`;

content = content.replace(oldSubtabs, newSubtabs);

// 2. Change : ` before Layer 2 Maps to : activeSub === 'layer2' ? `
const oldLayer2Start = "` : `\n          <!-- Layer 2 Maps: Authentic ManageEngine Radial Switch-to-Port STP Topology Map (layer2_sample.jpg style) -->";
const newLayer2Start = "` : activeSub === 'layer2' ? `\n          <!-- Layer 2 Maps: Authentic ManageEngine Radial Switch-to-Port STP Topology Map (layer2_sample.jpg style) -->";

content = content.replace(oldLayer2Start, newLayer2Start);

// 3. Add worldmap before `} \n      </div>\n    `;
const oldLayer2End = `                <div><strong style="color: #94a3b8;">DeviceType :</strong> Cisco Catalyst 9500-48Y4C</div>
              </div>
            </div>
          </div>
        \`}
      </div>
    \`;`;

const worldMapHtml = `        \` : \`
          <!-- Global Probes WAN World Map (ManageEngine Central Flagship View) -->
          <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">🌐</span> GLOBAL MULTI-PROBE WAN TOPOLOGY &amp; LATENCY MAP
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Real-time inter-probe synchronization across America, Europe, Middle East, and Asia Pacific datacenters.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 11px; color: #4ade80; background: #064e3b; border: 1px solid #047857; padding: 3px 8px; border-radius: 4px; font-weight: 700;">
                  ● ALL 4 PROBES ONLINE
                </div>
                <button id="opm-worldmap-sync-all-btn" style="background: #0070e0; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Initiate Global Sync
                </button>
              </div>
            </div>

            <!-- World Map SVG Canvas (1000 x 480) -->
            <div style="position: relative; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; height: 480px;">
              <svg width="100%" height="100%" viewBox="0 0 1000 480" style="background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%);">
                <!-- Continents Silhouettes SVG -->
                <!-- North America -->
                <path d="M 80,60 L 220,50 L 320,70 L 340,110 L 290,140 L 260,190 L 200,240 L 170,270 L 190,290 L 160,280 L 140,240 L 120,200 L 90,150 L 70,100 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- South America -->
                <path d="M 220,290 L 280,300 L 320,330 L 300,390 L 270,440 L 230,460 L 210,410 L 200,340 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Europe -->
                <path d="M 440,70 L 520,60 L 550,90 L 530,140 L 480,160 L 450,140 L 430,100 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Africa -->
                <path d="M 450,170 L 530,160 L 580,200 L 580,260 L 550,330 L 510,380 L 470,350 L 440,280 L 430,220 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Asia -->
                <path d="M 530,60 L 750,50 L 880,90 L 920,150 L 850,210 L 780,260 L 710,230 L 630,210 L 560,150 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>
                <!-- Australia -->
                <path d="M 800,330 L 890,320 L 930,370 L 890,420 L 820,410 L 780,360 Z" fill="#1e293b" opacity="0.6" stroke="#334155" stroke-width="1"/>

                <!-- WAN Links with Animated Glowing Dashes -->
                <!-- Link 1: New York (260, 150) -> London (480, 120) -->
                <path class="opm-packet-flow" d="M 260,150 Q 370,90 480,120" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="340" y="96" width="60" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" />
                <text x="370" y="108" text-anchor="middle" font-size="9" font-family="monospace" fill="#38bdf8" font-weight="bold">28ms</text>

                <!-- Link 2: London (480, 120) -> Dubai (640, 210) -->
                <path class="opm-packet-flow" d="M 480,120 Q 560,150 640,210" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="535" y="152" width="60" height="16" rx="3" fill="#0f172a" stroke="#f59e0b" />
                <text x="565" y="164" text-anchor="middle" font-size="9" font-family="monospace" fill="#f59e0b" font-weight="bold">42ms</text>

                <!-- Link 3: Dubai (640, 210) -> Singapore (800, 270) -->
                <path class="opm-packet-flow" d="M 640,210 Q 720,230 800,270" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
                <rect x="695" y="226" width="60" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" />
                <text x="725" y="238" text-anchor="middle" font-size="9" font-family="monospace" fill="#38bdf8" font-weight="bold">54ms</text>

                <!-- Link 4: Singapore (800, 270) -> New York (260, 150) (Transpacific Arc) -->
                <path class="opm-packet-flow" d="M 800,270 C 950,300 980,100 260,150" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />

                <!-- PROBE PINS -->
                <!-- PROBE 1: New York Data Center (260, 150) -->
                <g class="opm-world-pin" data-probe="1" style="cursor: pointer;">
                  <circle cx="260" cy="150" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="260" cy="150" r="6" fill="#22c55e" />
                  <rect x="180" y="170" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="260" y="186" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇺🇸 New York Data Center</text>
                  <text x="260" y="200" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 12ms RTT</text>
                </g>

                <!-- PROBE 2: London Branch Office (480, 120) -->
                <g class="opm-world-pin" data-probe="2" style="cursor: pointer;">
                  <circle cx="480" cy="120" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="480" cy="120" r="6" fill="#22c55e" />
                  <rect x="400" y="56" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="480" y="72" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇬🇧 London Branch Office</text>
                  <text x="480" y="86" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 28ms RTT</text>
                </g>

                <!-- PROBE 4: Dubai Campus Core (640, 210) -->
                <g class="opm-world-pin" data-probe="4" style="cursor: pointer;">
                  <circle cx="640" cy="210" r="16" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="2" />
                  <circle cx="640" cy="210" r="7" fill="#ef4444" />
                  <rect x="560" y="235" width="160" height="42" rx="4" fill="#450a0a" stroke="#dc2626" />
                  <text x="640" y="251" text-anchor="middle" font-size="10" font-weight="bold" fill="#fecaca">🇦🇪 Dubai Campus Core</text>
                  <text x="640" y="265" text-anchor="middle" font-size="9" fill="#f87171">⚠ 1 Critical Alarm • 18ms</text>
                </g>

                <!-- PROBE 3: Singapore Cloud VPC (800, 270) -->
                <g class="opm-world-pin" data-probe="3" style="cursor: pointer;">
                  <circle cx="800" cy="270" r="14" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="1.5" />
                  <circle cx="800" cy="270" r="6" fill="#22c55e" />
                  <rect x="720" y="295" width="160" height="42" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="800" y="311" text-anchor="middle" font-size="10" font-weight="bold" fill="#f8fafc">🇸🇬 Singapore Cloud VPC</text>
                  <text x="800" y="325" text-anchor="middle" font-size="9" fill="#4ade80">● 100% UP • 45ms RTT</text>
                </g>
              </svg>
            </div>

            <!-- Bottom Selected Probe Telemetry Matrix -->
            <div id="opm-worldmap-probe-details" style="margin-top: 16px; background: #1e293b; border-radius: 6px; padding: 14px 18px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 18px;">🇦🇪</span>
                <div>
                  <div style="font-weight: 800; color: #f87171;">Dubai Campus Core Probe (DIC Datacenter)</div>
                  <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">IP: 10.40.0.1 &bull; 4 Managed Nodes &bull; Sync State: Synchronized &bull; Comm Port: 8060</div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="opm-world-inspect-probe-btn" data-probe="4" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  View Probe CIs in Inventory &rarr;
                </button>
                <button id="opm-world-diag-probe-btn" data-probe="4" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                  Probe Diagnostics
                </button>
              </div>
            </div>
          </div>
        \`}
      </div>
    \`;`;

const newLayer2End = `                <div><strong style="color: #94a3b8;">DeviceType :</strong> Cisco Catalyst 9500-48Y4C</div>
              </div>
            </div>
          </div>
${worldMapHtml}`;

content = content.replace(oldLayer2End, newLayer2End);

// 4. Add handlers for worldmap
const oldHandlersTarget = `    // Topology node clicks
    container.querySelectorAll('.opm-topo-node').forEach(node => {`;

const newHandlers = `    // World Map Pin Clicks & Actions
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
        showProbeDetailsModal(4);
      };
    }
    const worldSyncBtn = container.querySelector('#opm-worldmap-sync-all-btn');
    if (worldSyncBtn) {
      worldSyncBtn.onclick = () => {
        showToast('Initiated global multi-probe synchronization across all 4 datacenters.');
      };
    }

    // Topology node clicks
    container.querySelectorAll('.opm-topo-node').forEach(node => {`;

content = content.replace(oldHandlersTarget, newHandlers);

fs.writeFileSync(file, content, "utf8");
console.log("Successfully patched 04_views_alarms_maps.js with Global Probes WAN World Map!");
