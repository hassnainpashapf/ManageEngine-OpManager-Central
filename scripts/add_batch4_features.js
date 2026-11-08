const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central';
const fileModals = path.join(baseDir, 'scripts/suite_modules/02_branding_and_modals.js');
const fileViewsDashInv = path.join(baseDir, 'scripts/suite_modules/03_views_dashboard_inventory.js');
const fileViewsAlarmsMaps = path.join(baseDir, 'scripts/suite_modules/04_views_alarms_maps.js');
const fileRouterInit = path.join(baseDir, 'scripts/suite_modules/06_router_and_init.js');

console.log('Reading files...');
let modalsContent = fs.readFileSync(fileModals, 'utf8');
let viewsDashInvContent = fs.readFileSync(fileViewsDashInv, 'utf8');
let viewsAlarmsMapsContent = fs.readFileSync(fileViewsAlarmsMaps, 'utf8');
let routerInitContent = fs.readFileSync(fileRouterInit, 'utf8');

// 1. ADD BATCH 4 MODALS TO 02_branding_and_modals.js
const batch4ModalsCode = `

  /* ==========================================================================
     BATCH 4 ENTERPRISE FEATURES: BGP, SD-WAN, DPI NBAR2, NDR THREAT FORENSICS
     ========================================================================== */

  // 1. ManageEngine BGP-4 Routing & Autonomous System (AS) Topology Modal
  function showBgpMonitoringModal(router) {
    let modal = document.getElementById('opm-bgp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-bgp-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10007; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const rtrName = router ? router.name : 'DXB-WAN-RTR-01';
    const rtrIp = router ? router.ip : '10.0.0.1';

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8b5cf6;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📡</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; BGP-4 Routing & Autonomous System (AS) Topology</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">RFC 4271 BGP-4 &bull; RFC 4893 4-Octet AS &bull; Router: \${rtrName} (\${rtrIp}) &bull; Local ASN: <strong>AS65001</strong></div>
            </div>
          </div>
          <button id="close-bgp-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Metric Badges Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 22px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Local Autonomous System</div>
            <div style="font-size: 16px; font-weight: 800; color: #6d28d9; margin-top: 2px;">AS65001 (Private DC)</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">BGP Daemon: RUNNING 🟢</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">BGP Neighbors (Peers)</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">4 Configured / 3 Up</div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 2px;">3 Established &bull; 1 Active (Syncing)</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Global RIB Routing Table</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">845,190 Prefixes</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">FIB HW Memory: 64% used</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">BGP Updates (Rx / Tx)</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">14,290 / 8,940 msgs</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">Flap Damping: Normal (0 damp)</div>
          </div>
        </div>

        <!-- Main Body -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- SVG Autonomous System Topology Map -->
          <div style="background: #0f172a; border-radius: 6px; padding: 16px; border: 1px solid #334155; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px;">BGP Autonomous System Interconnect Graph</span>
              <span style="font-size: 11px; color: #94a3b8;">Real-Time Peering Paths &bull; RFC 1771</span>
            </div>
            <svg viewBox="0 0 1000 180" style="width: 100%; height: 180px; display: block;">
              <!-- Connecting Lines -->
              <line x1="500" y1="90" x2="160" y2="45" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4 2" />
              <line x1="500" y1="90" x2="160" y2="135" stroke="#38bdf8" stroke-width="2.5" />
              <line x1="500" y1="90" x2="840" y2="45" stroke="#06b6d4" stroke-width="2.5" />
              <line x1="500" y1="90" x2="840" y2="135" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 5" />

              <!-- Central Node (AS65001) -->
              <circle cx="500" cy="90" r="38" fill="#6d28d9" stroke="#c4b5fd" stroke-width="3" />
              <text x="500" y="86" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="800">AS65001</text>
              <text x="500" y="102" text-anchor="middle" fill="#ddd6fe" font-size="10">Local Edge RTR</text>

              <!-- Node 1: AS3356 Lumen -->
              <circle cx="160" cy="45" r="30" fill="#065f46" stroke="#34d399" stroke-width="2.5" />
              <text x="160" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS3356</text>
              <text x="160" y="55" text-anchor="middle" fill="#a7f3d0" font-size="9">Lumen Transit</text>
              <rect x="250" y="50" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="292" y="63" text-anchor="middle" fill="#34d399" font-size="10" font-weight="600">845k pfx | 12ms</text>

              <!-- Node 2: AS13335 Cloudflare -->
              <circle cx="160" cy="135" r="30" fill="#075985" stroke="#38bdf8" stroke-width="2.5" />
              <text x="160" y="132" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS13335</text>
              <text x="160" y="145" text-anchor="middle" fill="#bae6fd" font-size="9">Cloudflare IXP</text>
              <rect x="250" y="105" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="292" y="118" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="600">42k pfx | 4.1ms</text>

              <!-- Node 3: AS15169 Google Peering -->
              <circle cx="840" cy="45" r="30" fill="#155e75" stroke="#22d3ee" stroke-width="2.5" />
              <text x="840" y="42" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS15169</text>
              <text x="840" y="55" text-anchor="middle" fill="#a5f3fc" font-size="9">Google Direct</text>
              <rect x="660" y="50" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="702" y="63" text-anchor="middle" fill="#22d3ee" font-size="10" font-weight="600">12k pfx | 8.6ms</text>

              <!-- Node 4: AS64512 Backup MPLS -->
              <circle cx="840" cy="135" r="30" fill="#78350f" stroke="#fbbf24" stroke-width="2.5" />
              <text x="840" y="132" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">AS64512</text>
              <text x="840" y="145" text-anchor="middle" fill="#fef08a" font-size="9">Backup MPLS</text>
              <rect x="660" y="105" width="85" height="18" rx="3" fill="#1e293b" />
              <text x="702" y="118" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="600">Active (Sync)</text>
            </svg>
          </div>

          <!-- BGP Neighbors Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">BGP Neighbor Peer Summary (Cisco &bull; Juniper BGP MIB)</span>
              <button id="opm-bgp-refresh-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #475569; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                ↻ Poll Peers Now
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Neighbor IP</th>
                  <th style="padding: 10px 12px;">Remote AS</th>
                  <th style="padding: 10px 12px;">Peer State</th>
                  <th style="padding: 10px 12px;">Admin</th>
                  <th style="padding: 10px 12px;">Flaps</th>
                  <th style="padding: 10px 12px;">Established Uptime</th>
                  <th style="padding: 10px 12px;">Prefixes (Rx / Tx)</th>
                  <th style="padding: 10px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="opm-bgp-table-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">198.51.100.1</td>
                  <td style="padding: 10px 12px;"><strong>AS3356</strong> <span style="color: #64748b;">(Lumen Tier-1 Transit)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">0</td>
                  <td style="padding: 10px 12px; color: #475569;">48d 14h 22m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">845,190 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="198.51.100.1" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">203.0.113.5</td>
                  <td style="padding: 10px 12px;"><strong>AS13335</strong> <span style="color: #64748b;">(Cloudflare CDN IXP)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">1</td>
                  <td style="padding: 10px 12px; color: #475569;">14d 06h 11m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">42,800 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="203.0.113.5" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">198.18.0.22</td>
                  <td style="padding: 10px 12px;"><strong>AS15169</strong> <span style="color: #64748b;">(Google Peering Direct)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Established</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Up</td>
                  <td style="padding: 10px 12px; color: #1e293b;">0</td>
                  <td style="padding: 10px 12px; color: #475569;">92d 18h 45m</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600;">12,400 / 24</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button class="opm-bgp-softclear-btn" data-peer="198.18.0.22" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ↻ Soft Clear
                    </button>
                  </td>
                </tr>
                <tr style="background: #fffbeb;">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">192.0.2.78</td>
                  <td style="padding: 10px 12px;"><strong>AS64512</strong> <span style="color: #64748b;">(Backup Telco MPLS)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px;">Active (Sync)</span></td>
                  <td style="padding: 10px 12px; color: #ea580c; font-weight: 600;">Connecting</td>
                  <td style="padding: 10px 12px; color: #dc2626; font-weight: 700;">5</td>
                  <td style="padding: 10px 12px; color: #475569;">0m 42s</td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 600; color: #64748b;">0 / 0</td>
                  <td style="padding: 10px 12px; text-align: right;">
                    <button id="opm-bgp-force-reset-btn" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ⚡ Reset Peer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CLI Console Simulation -->
          <div id="opm-bgp-terminal" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central BGP Diagnostic Terminal</div>
            <div>[BGP] Router DXB-WAN-RTR-01 BGP process ID 100 initialized.</div>
            <div>[BGP] RFC 2918 Route Refresh capability negotiated on all 3 established peers.</div>
            <div id="opm-bgp-live-log" style="color: #34d399;">✔ System steady state: Autonomous System AS65001 fully converged.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; BGP Peer Monitoring Engine (RFC 4271)</span>
          <button id="close-bgp-modal-btn-footer" style="background: #6d28d9; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close BGP View
          </button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    document.getElementById('close-bgp-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-bgp-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const liveLog = document.getElementById('opm-bgp-live-log');
    modal.querySelectorAll('.opm-bgp-softclear-btn').forEach(btn => {
      btn.onclick = () => {
        const peer = btn.getAttribute('data-peer');
        btn.disabled = true;
        btn.innerHTML = 'Executing...';
        if (liveLog) {
          liveLog.innerHTML = \`<span style="color: #fbbf24;">[CMD] clear ip bgp \${peer} soft in</span><br><span style="color: #38bdf8;">[BGP] Sent ROUTE-REFRESH request to neighbor \${peer}...</span>\`;
        }
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = '✔ Done';
          if (liveLog) {
            liveLog.innerHTML += \`<br><span style="color: #34d399;">✔ Neighbor \${peer} acknowledged refresh; 845,190 prefixes re-evaluated with 0 packet drop.</span>\`;
          }
          showToast(\`BGP Soft Inbound Refresh completed for neighbor \${peer}.\`);
        }, 1000);
      };
    });

    const resetBtn = document.getElementById('opm-bgp-force-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        resetBtn.disabled = true;
        resetBtn.innerHTML = 'Resetting TCP...';
        if (liveLog) {
          liveLog.innerHTML = \`<span style="color: #f87171;">[CMD] clear ip bgp 192.0.2.78 hard</span><br><span style="color: #fbbf24;">[BGP] Terminated TCP port 179 session with AS64512; sending SYN handshakes...</span>\`;
        }
        setTimeout(() => {
          resetBtn.innerHTML = '✔ Connected';
          resetBtn.style.background = '#dcfce7';
          resetBtn.style.color = '#15803d';
          if (liveLog) {
            liveLog.innerHTML += \`<br><span style="color: #34d399;">✔ TCP socket established. Received BGP OPEN message from AS64512. State: Established.</span>\`;
          }
          showToast('BGP session with AS64512 successfully restored to Established state.');
        }, 1200);
      };
    }
  }


  // 2. Cisco & Multi-Vendor SD-WAN Performance Controller Modal
  function showSdwanPerformanceModal(sdwanDevice) {
    let modal = document.getElementById('opm-sdwan-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-sdwan-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10008; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const devName = sdwanDevice ? sdwanDevice.name : 'DXB-SDWAN-EDGE-01';

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🚀</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; SD-WAN Fabric & BFD Tunnel Performance</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Cisco Catalyst SD-WAN (vManage 20.9.3) &bull; Edge Gateway: \${devName} &bull; BFD Polling Interval: 100ms</div>
            </div>
          </div>
          <button id="close-sdwan-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- 3 Transport Overlay Underlay Cards -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <!-- Transport 1: Biz-Internet -->
          <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #16a34a;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Biz-Internet (DIA Lumen)</span>
              <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ACTIVE 🟢</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">12.4 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">1.2 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #16a34a;">0.00%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 1 Gbps Symmetric</span>
              <strong style="color: #0f172a;">Utilization: 48%</strong>
            </div>
          </div>

          <!-- Transport 2: Private MPLS -->
          <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #0284c7;">
            <div style="display: space-between; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Private MPLS (AT&T AVPN)</span>
              <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ACTIVE 🟢</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">28.6 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">3.1 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">0.05%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 500 Mbps CIR</span>
              <strong style="color: #0f172a;">Utilization: 31%</strong>
            </div>
          </div>

          <!-- Transport 3: LTE 5G -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; border-left: 4px solid #64748b;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Cellular LTE (Verizon 5G)</span>
              <span style="background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">STANDBY 🔵</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; text-align: center;">
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Latency</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">64.2 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Jitter</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">8.7 ms</div>
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 4px;">
                <div style="font-size: 10px; color: #64748b;">Loss</div>
                <div style="font-size: 14px; font-weight: 800; color: #64748b;">0.80%</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
              <span>Capacity: 100 Mbps Metered</span>
              <strong style="color: #0f172a;">Utilization: 1% (Heartbeat)</strong>
            </div>
          </div>
        </div>

        <!-- Main Body: SLA Policies & Dynamic Application Steering -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- SLA Matrix Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Application SLA Classes & Dynamic Path Steering</span>
              <button id="opm-sdwan-simulate-brownout-btn" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                ⚡ Run Dynamic SLA Failover Test
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">SLA Profile</th>
                  <th style="padding: 10px 12px;">Target Thresholds</th>
                  <th style="padding: 10px 12px;">Current Transport</th>
                  <th style="padding: 10px 12px;">Live Metric</th>
                  <th style="padding: 10px 12px;">SLA Health</th>
                  <th style="padding: 10px 12px; text-align: right;">Policy Status</th>
                </tr>
              </thead>
              <tbody id="opm-sdwan-sla-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Voice SLA (G.711 / SIP)</td>
                  <td style="padding: 10px 12px; color: #475569;">Jitter &lt; 10ms, Loss &lt; 1%, Latency &lt; 150ms</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-voice" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet (Primary)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">MOS 4.41 (Excellent)</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Steered by Policy</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Microsoft 365 & SaaS</td>
                  <td style="padding: 10px 12px; color: #475569;">Latency &lt; 30ms, Zero Loss</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-m365" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet DIA</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">14.2 ms RTT</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Direct Cloud Breakout</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">ERP SAP S/4HANA Core</td>
                  <td style="padding: 10px 12px; color: #475569;">Latency &lt; 40ms, Jitter &lt; 5ms</td>
                  <td style="padding: 10px 12px;"><span style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Private MPLS (AVPN)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0284c7;">28.6 ms RTT</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">QoS EF Priority</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Zoom & Teams HD Video</td>
                  <td style="padding: 10px 12px; color: #475569;">Jitter &lt; 15ms, Loss &lt; 2%</td>
                  <td style="padding: 10px 12px;"><span id="sla-path-video" style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Biz-Internet (Primary)</span></td>
                  <td style="padding: 10px 12px; font-weight: 700; color: #16a34a;">1.8 ms Jitter</td>
                  <td style="padding: 10px 12px;"><span style="color: #16a34a; font-weight: 700;">100% Compliant</span></td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="color: #0284c7; font-weight: 600;">Steered by Policy</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BFD Echo & Dynamic Switch Log -->
          <div id="opm-sdwan-log-console" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 120px; overflow-y: auto;">
            <div style="color: #64748b;">// Cisco Catalyst SD-WAN BFD (Bidirectional Forwarding Detection) Daemon</div>
            <div>[BFD] Session 1042 (Biz-Internet): Echo interval 100ms, multiplier 3 &bull; State: UP</div>
            <div>[BFD] Session 1043 (MPLS AVPN): Echo interval 100ms, multiplier 3 &bull; State: UP</div>
            <div id="opm-sdwan-dynamic-msg" style="color: #34d399;">✔ Zero SLA violations in last 24 hours. Optimal application steering across all 3 WAN transports.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; SD-WAN Fabric Orchestration Engine</span>
          <button id="close-sdwan-modal-btn-footer" style="background: #10b981; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close SD-WAN Console
          </button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    document.getElementById('close-sdwan-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-sdwan-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const failoverBtn = document.getElementById('opm-sdwan-simulate-brownout-btn');
    const logConsole = document.getElementById('opm-sdwan-log-console');
    const dynamicMsg = document.getElementById('opm-sdwan-dynamic-msg');

    if (failoverBtn) {
      failoverBtn.onclick = () => {
        failoverBtn.disabled = true;
        failoverBtn.innerHTML = 'Testing Brownout...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = \`<span style="color: #f87171;">[SLA-ALERT] Injected simulated 85ms latency spike & 4% packet drop on Biz-Internet (DIA)...</span>\`;
        }
        setTimeout(() => {
          document.getElementById('sla-path-voice').innerHTML = 'Private MPLS (Failover ⚡)';
          document.getElementById('sla-path-voice').style.background = '#fef3c7';
          document.getElementById('sla-path-voice').style.color = '#b45309';

          document.getElementById('sla-path-video').innerHTML = 'Private MPLS (Failover ⚡)';
          document.getElementById('sla-path-video').style.background = '#fef3c7';
          document.getElementById('sla-path-video').style.color = '#b45309';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += \`<br><span style="color: #38bdf8;">[vManage Dynamic Steering] Voice & HD Video re-routed from DIA to MPLS in 38ms!</span><br><span style="color: #34d399;">✔ Zero dropped VoIP calls. SLA Compliance restored to 100%.</span>\`;
          }
          failoverBtn.innerHTML = '✔ Re-Route Verified';
          showToast('SD-WAN Dynamic Application Steering test passed: Voice & Video shifted to MPLS in 38ms.');
        }, 1100);
      };
    }
  }


  // 3. Deep Packet Inspection (DPI) & Cisco NBAR2 Application Classification Modal
  function showDpiTrafficModal(iface) {
    let modal = document.getElementById('opm-dpi-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-dpi-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10009; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    const ifName = iface ? (iface.name || iface) : 'GigabitEthernet0/0/1 - WAN Gateway (10 Gbps)';

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📊</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; Deep Packet Inspection (DPI) & Cisco NBAR2</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">Layer 7 Deep Packet Flow Classification &bull; Interface: \${ifName} &bull; Sampling: Full Wire Rate</div>
            </div>
          </div>
          <button id="close-dpi-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Top Rate Gauges & Split Response Time Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Bandwidth Throughput Card -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">Aggregate Interface Throughput</span>
              <span style="font-size: 11px; color: #16a34a; font-weight: 700;">Capacity: 10 Gbps</span>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 10px;">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
                  <span>Inbound Traffic</span>
                  <strong style="color: #0f172a;">4.82 Gbps (48.2%)</strong>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: 48.2%; height: 100%; background: #0284c7;"></div>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
                  <span>Outbound Traffic</span>
                  <strong style="color: #0f172a;">1.94 Gbps (19.4%)</strong>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="width: 19.4%; height: 100%; background: #10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Split Response Time: NRT vs ART -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">Network Response Time (NRT) vs App Response Time (ART)</span>
              <span style="font-size: 11px; color: #64748b;">TCP Handshake Analyzer</span>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 10px;">
              <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 6px 10px; text-align: center;">
                <div style="font-size: 10px; color: #166534; font-weight: 600;">NRT (Network Latency)</div>
                <div style="font-size: 16px; font-weight: 800; color: #15803d; margin-top: 2px;">14.2 ms</div>
                <div style="font-size: 9px; color: #166534;">Optimal WAN propagation</div>
              </div>
              <div style="flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 10px; text-align: center;">
                <div style="font-size: 10px; color: #075985; font-weight: 600;">ART (Server Processing)</div>
                <div style="font-size: 16px; font-weight: 800; color: #0284c7; margin-top: 2px;">38.5 ms</div>
                <div style="font-size: 9px; color: #075985;">Fast HTTP execution</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Body: NBAR2 Table & Actions -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Cisco NBAR2 Layer 7 Applications & DSCP Markings</span>
              <button id="opm-dpi-enforce-scavenger-btn" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🛡️ Enforce DSCP Scavenger Policy on P2P
              </button>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Layer 7 Application</th>
                  <th style="padding: 10px 12px;">Protocol / Port</th>
                  <th style="padding: 10px 12px;">Bandwidth & Share</th>
                  <th style="padding: 10px 12px;">DSCP Tagging</th>
                  <th style="padding: 10px 12px;">QoS Classification</th>
                  <th style="padding: 10px 12px; text-align: right;">Risk Profile</th>
                </tr>
              </thead>
              <tbody id="opm-dpi-table-body">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Microsoft Teams / Zoom Audio-Video</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">UDP / RTP (3478-3481)</td>
                  <td style="padding: 10px 12px;"><strong>1.84 Gbps</strong> <span style="color: #64748b;">(38.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">EF (46)</span></td>
                  <td style="padding: 10px 12px; color: #16a34a; font-weight: 600;">Expedited Forwarding</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Salesforce CRM / Workday SaaS</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / HTTPS (443)</td>
                  <td style="padding: 10px 12px;"><strong>1.12 Gbps</strong> <span style="color: #64748b;">(23.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">AF31 (26)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Assured Forwarding 3</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">AWS S3 / Azure Blob Storage</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / TLS (443)</td>
                  <td style="padding: 10px 12px;"><strong>780 Mbps</strong> <span style="color: #64748b;">(16.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">AF21 (18)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Bulk Data Forwarding</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">YouTube / Social Media Streaming</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">UDP / QUIC (443)</td>
                  <td style="padding: 10px 12px;"><strong>540 Mbps</strong> <span style="color: #64748b;">(11.2%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #f1f5f9; color: #475569; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">CS1 (8)</span></td>
                  <td style="padding: 10px 12px; color: #64748b; font-weight: 600;">Non-Critical Traffic</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #fef3c7; color: #b45309; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Medium</span></td>
                </tr>
                <tr id="dpi-row-p2p" style="background: #fff1f2;">
                  <td style="padding: 10px 12px; font-weight: 700; color: #9f1239;">Unsanctioned BitTorrent / P2P Swarm</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #9f1239;">TCP / UDP (6881-6889)</td>
                  <td style="padding: 10px 12px;"><strong id="dpi-p2p-bw" style="color: #9f1239;">320 Mbps</strong> <span style="color: #9f1239;">(6.6%)</span></td>
                  <td style="padding: 10px 12px;"><span id="dpi-p2p-dscp" style="background: #fee2e2; color: #991b1b; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">Best Effort (0)</span></td>
                  <td style="padding: 10px 12px; color: #9f1239; font-weight: 600;" id="dpi-p2p-qos">Unthrottled Bandwidth Hog</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">High Risk ⚠️</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">SSH / HTTPS Device Management</td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #475569;">TCP / SSH (22)</td>
                  <td style="padding: 10px 12px;"><strong>220 Mbps</strong> <span style="color: #64748b;">(4.6%)</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dbeafe; color: #1e40af; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 3px;">CS2 (16)</span></td>
                  <td style="padding: 10px 12px; color: #0284c7; font-weight: 600;">Network Management</td>
                  <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Low Risk</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Policy Feed & QoS Terminal -->
          <div id="opm-dpi-policy-log" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 100px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central DPI Engine &bull; QoS Shaper</div>
            <div>[DPI] Deep packet state engine actively tracking 14,890 simultaneous L7 sessions.</div>
            <div id="opm-dpi-dynamic-msg" style="color: #34d399;">✔ Wire-speed classification active. Zero packet loss on EF (46) realtime queue.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Cisco NBAR2 Deep Packet Flow Engine</span>
          <button id="close-dpi-modal-btn-footer" style="background: #0284c7; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close DPI View
          </button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    document.getElementById('close-dpi-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-dpi-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const enforceBtn = document.getElementById('opm-dpi-enforce-scavenger-btn');
    const dynamicMsg = document.getElementById('opm-dpi-dynamic-msg');

    if (enforceBtn) {
      enforceBtn.onclick = () => {
        enforceBtn.disabled = true;
        enforceBtn.innerHTML = 'Applying DSCP Scavenger...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = \`<span style="color: #fbbf24;">[QOS-CLI] class-map match-all P2P-TRAFFIC -> police cir 10000000 pir 15000000 conform-action set-dscp-transmit cs1 exceed-action drop...</span>\`;
        }
        setTimeout(() => {
          document.getElementById('dpi-p2p-bw').innerHTML = '10 Mbps';
          document.getElementById('dpi-p2p-dscp').innerHTML = 'CS1 (Scavenger 8)';
          document.getElementById('dpi-p2p-dscp').style.background = '#e2e8f0';
          document.getElementById('dpi-p2p-dscp').style.color = '#475569';
          document.getElementById('dpi-p2p-qos').innerHTML = 'Policed to 10 Mbps (Scavenger)';
          document.getElementById('dpi-p2p-qos').style.color = '#15803d';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += \`<br><span style="color: #34d399;">✔ DSCP Scavenger applied. Unsanctioned P2P bandwidth clamped from 320 Mbps down to 10 Mbps!</span>\`;
          }
          enforceBtn.innerHTML = '✔ Scavenger Policy Active';
          enforceBtn.style.background = '#dcfce7';
          enforceBtn.style.color = '#15803d';
          showToast('DSCP Scavenger Policy enforced: P2P throttled to 10 Mbps on WAN uplink.');
        }, 1100);
      };
    }
  }


  // 4. Network Detection & Response (NDR) & Security Threat Forensics Modal
  function showNdrForensicsModal(threatSource) {
    let modal = document.getElementById('opm-ndr-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ndr-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 10010; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 6px; width: 1100px; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="background: #0f172a; color: #ffffff; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">ManageEngine OpManager Central &bull; Network Detection & Response (NDR) & Threat Forensics</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">TAXII 2.1 Threat Intel Server (ndr.threatintel.default.server) &bull; STIX Feed: Active (1.8M Indicators)</div>
            </div>
          </div>
          <button id="close-ndr-modal-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>

        <!-- Threat Score & Threat Summary Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 22px; display: grid; grid-template-columns: 280px 1fr; gap: 16px; align-items: center;">
          <!-- Threat Score Gauge Card -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #dc2626; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              89
              <span style="font-size: 8px; font-weight: 600; text-transform: uppercase;">SCORE</span>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 800; color: #991b1b; text-transform: uppercase;">High Risk Incident Active</div>
              <div style="font-size: 11px; color: #b91c1c; margin-top: 2px;">4 Critical Anomalies detected in last 30 minutes</div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="opm-ndr-push-acl-btn" style="background: #dc2626; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
              🔒 Push Immediate Firewall ACL Blacklist
            </button>
            <button id="opm-ndr-quarantine-btn" style="background: #ea580c; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              🛑 Quarantine Host via 802.1X NAC
            </button>
            <button id="opm-ndr-export-stix-btn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
              📥 Export STIX 2.1 PCAP
            </button>
          </div>
        </div>

        <!-- Main Body: Threat Matrix Table -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <div style="background: #f1f5f9; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">Active Behavioral Anomaly Detections & STIX Indicators</span>
              <span style="font-size: 11px; color: #64748b;">Feed: TAXII 2.1 Threat Intel Server &bull; Updated 8 mins ago</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 700; font-size: 11px;">
                  <th style="padding: 10px 12px;">Threat Classification</th>
                  <th style="padding: 10px 12px;">Attacker Source IP</th>
                  <th style="padding: 10px 12px;">Target Host / Asset</th>
                  <th style="padding: 10px 12px;">MITRE ATT&CK ID</th>
                  <th style="padding: 10px 12px;">Severity Score</th>
                  <th style="padding: 10px 12px; text-align: right;">Mitigation State</th>
                </tr>
              </thead>
              <tbody id="opm-ndr-threat-table-body">
                <tr id="ndr-row-1" style="border-bottom: 1px solid #f1f5f9; background: #fff5f5;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #991b1b;">Horizontal TCP SYN Port Scan</div>
                    <div style="font-size: 10px; color: #64748b;">Probed 1,024 TCP ports across /24 subnet</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    198.51.100.89 <span style="font-size: 10px; color: #dc2626; font-weight: 600;">(Tor Exit Node NL)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">10.0.1.0/24 (DMZ)</td>
                  <td style="padding: 10px 12px;"><span style="background: #fee2e2; color: #991b1b; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1046 Discovery</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #dc2626; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 94</span></td>
                  <td id="ndr-status-1" style="padding: 10px 12px; text-align: right; color: #dc2626; font-weight: 700;">Block Recommended</td>
                </tr>
                <tr id="ndr-row-2" style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #9a3412;">DNS Data Exfiltration via TXT Tunneling</div>
                    <div style="font-size: 10px; color: #64748b;">High-entropy Base64 queries (48.2 MB exfiltrated)</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    10.0.1.44 <span style="font-size: 10px; color: #ea580c; font-weight: 600;">(DXB-APP-04)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">ns1.tunnel-c2.top</td>
                  <td style="padding: 10px 12px;"><span style="background: #ffedd5; color: #9a3412; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1071.004 C2</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #ea580c; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 86</span></td>
                  <td id="ndr-status-2" style="padding: 10px 12px; text-align: right; color: #ea580c; font-weight: 700;">Host Active</td>
                </tr>
                <tr id="ndr-row-3" style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #9a3412;">Automated SSH Dictionary Brute Force</div>
                    <div style="font-size: 10px; color: #64748b;">540 failed authentications in 60 seconds</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    203.0.113.190 <span style="font-size: 10px; color: #dc2626; font-weight: 600;">(Mirai C2 Botnet)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">10.0.1.15 (DXB-PROD-DB)</td>
                  <td style="padding: 10px 12px;"><span style="background: #ffedd5; color: #9a3412; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1110 Brute Force</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #ea580c; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 82</span></td>
                  <td id="ndr-status-3" style="padding: 10px 12px; text-align: right; color: #dc2626; font-weight: 700;">Block Recommended</td>
                </tr>
                <tr id="ndr-row-4">
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 700; color: #475569;">Suspicious Outbound SMB Lateral Connection</div>
                    <div style="font-size: 10px; color: #64748b;">TCP port 445 direct packet to untrusted public IP</div>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #0f172a;">
                    10.0.1.108 <span style="font-size: 10px; color: #64748b; font-weight: 600;">(DXB-STAGE-02)</span>
                  </td>
                  <td style="padding: 10px 12px; font-family: monospace; color: #334155;">198.18.44.12:445</td>
                  <td style="padding: 10px 12px;"><span style="background: #f1f5f9; color: #475569; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-size: 11px;">T1021.002 SMB</span></td>
                  <td style="padding: 10px 12px;"><span style="background: #94a3b8; color: #ffffff; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Score 65</span></td>
                  <td id="ndr-status-4" style="padding: 10px 12px; text-align: right; color: #64748b; font-weight: 600;">Monitored</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Forensic Security Console -->
          <div id="opm-ndr-console" style="background: #090d16; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 11px; color: #a5f3fc; border: 1px solid #1e293b; max-height: 100px; overflow-y: auto;">
            <div style="color: #64748b;">// ManageEngine OpManager Central NDR Threat Intelligence Engine</div>
            <div>[TAXII] Synced 1,840,290 reputation signatures from global TAXII 2.1 intelligence feeds.</div>
            <div id="opm-ndr-dynamic-msg" style="color: #f87171;">⚠️ Alert: 2 C2 botnet communication attempts flagged. Automated perimeter ACL push ready.</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central &bull; Network Detection & Response (NDR) Engine</span>
          <button id="close-ndr-modal-btn-footer" style="background: #dc2626; color: #ffffff; border: none; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Close NDR View
          </button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    document.getElementById('close-ndr-modal-btn').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('close-ndr-modal-btn-footer').onclick = () => { modal.style.display = 'none'; };

    const pushAclBtn = document.getElementById('opm-ndr-push-acl-btn');
    const quarantineBtn = document.getElementById('opm-ndr-quarantine-btn');
    const exportStixBtn = document.getElementById('opm-ndr-export-stix-btn');
    const dynamicMsg = document.getElementById('opm-ndr-dynamic-msg');

    if (pushAclBtn) {
      pushAclBtn.onclick = () => {
        pushAclBtn.disabled = true;
        pushAclBtn.innerHTML = 'Pushing ACL Rules...';
        if (dynamicMsg) {
          dynamicMsg.innerHTML = \`<span style="color: #fbbf24;">[FW-CLI] access-list 101 deny ip host 198.51.100.89 any -> applied to NY-FW-01 & DXB-EDGE-FW-01...</span><br><span style="color: #fbbf24;">[FW-CLI] access-list 101 deny ip host 203.0.113.190 any -> applied...</span>\`;
        }
        setTimeout(() => {
          document.getElementById('ndr-status-1').innerHTML = '✔ Blocked (ACL 101)';
          document.getElementById('ndr-status-1').style.color = '#15803d';
          document.getElementById('ndr-status-3').innerHTML = '✔ Blocked (ACL 101)';
          document.getElementById('ndr-status-3').style.color = '#15803d';

          if (dynamicMsg) {
            dynamicMsg.innerHTML += \`<br><span style="color: #34d399;">✔ Firewall Perimeter ACL successfully deployed. 2 malicious IPs dropped at edge.</span>\`;
          }
          pushAclBtn.innerHTML = '✔ Firewall ACL Enforced';
          pushAclBtn.style.background = '#15803d';
          showToast('Automated Perimeter Firewall ACL pushed: Tor node & Mirai C2 blocked.');
        }, 1100);
      };
    }

    if (quarantineBtn) {
      quarantineBtn.onclick = () => {
        quarantineBtn.disabled = true;
        quarantineBtn.innerHTML = 'Quarantining 802.1X...';
        setTimeout(() => {
          document.getElementById('ndr-status-2').innerHTML = '✔ Isolated (VLAN 999)';
          document.getElementById('ndr-status-2').style.color = '#ea580c';
          if (dynamicMsg) {
            dynamicMsg.innerHTML += \`<br><span style="color: #38bdf8;">[802.1X NAC] Switch port FastEthernet0/24 changed to Remediation Quarantine VLAN 999.</span>\`;
          }
          quarantineBtn.innerHTML = '✔ Host Quarantined';
          showToast('Host 10.0.1.44 (DXB-APP-04) quarantined via 802.1X NAC isolation VLAN 999.');
        }, 1000);
      };
    }

    if (exportStixBtn) {
      exportStixBtn.onclick = () => {
        showToast('Exported forensic STIX 2.1 JSON bundle & PCAP trace for SIEM ingest.');
      };
    }
  }

`;

// Check if modals are already added
if (!modalsContent.includes('showBgpMonitoringModal')) {
  modalsContent += batch4ModalsCode;
  fs.writeFileSync(fileModals, modalsContent, 'utf8');
  console.log('Appended Batch 4 modals to 02_branding_and_modals.js successfully.');
} else {
  console.log('Batch 4 modals already exist in 02_branding_and_modals.js.');
}

// 2. WIRE MODALS INTO 03_views_dashboard_inventory.js
// A. Add buttons in Inventory table row:
const oldHwBtnSnippet = `<button class="opm-inv-row-hw-btn" data-id="\${dev.id}"`;
const newActionButtonsSnippet = `
                        \${(dev.category === 'Routers') ? \`
                          <button class="opm-inv-row-bgp-btn" data-id="\${dev.id}" title="BGP-4 Routing & AS Topology" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">📡</span>
                          </button>
                          <button class="opm-inv-row-sdwan-btn" data-id="\${dev.id}" title="SD-WAN Fabric & BFD Tunnels" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🚀</span>
                          </button>
                        \` : ''}
                        \${(dev.category === 'Routers' || dev.category === 'Switches') ? \`
                          <button class="opm-inv-row-dpi-btn" data-id="\${dev.id}" title="Deep Packet Inspection & NBAR2" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">📊</span>
                          </button>
                        \` : ''}
                        \${(dev.category === 'Firewalls' || dev.category === 'Routers') ? \`
                          <button class="opm-inv-row-ndr-btn" data-id="\${dev.id}" title="NDR Threat Forensics (TAXII/STIX)" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; width: 26px; height: 26px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                            <span style="font-size: 13px;">🛡️</span>
                          </button>
                        \` : ''}
                        <button class="opm-inv-row-hw-btn" data-id="\${dev.id}"`;

if (!viewsDashInvContent.includes('opm-inv-row-bgp-btn')) {
  viewsDashInvContent = viewsDashInvContent.replace(oldHwBtnSnippet, newActionButtonsSnippet);
  console.log('Added BGP, SD-WAN, DPI, NDR action buttons to Inventory table rows.');
}

// B. Add Event listeners for the new buttons in Inventory:
const oldHwListener = `// Row Hardware Sensor (IPMI) button`;
const newListeners = `// Row BGP Monitoring button
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

    // Row Hardware Sensor (IPMI) button`;

if (!viewsDashInvContent.includes('opm-inv-row-bgp-btn').valueOf() || !viewsDashInvContent.includes('showBgpMonitoringModal(dev)')) {
  viewsDashInvContent = viewsDashInvContent.replace(oldHwListener, newListeners);
  console.log('Added event listeners for BGP, SD-WAN, DPI, NDR buttons in Inventory view.');
}

// C. In Dashboard top action bar, add quick-access pills for BGP, SD-WAN, DPI, NDR:
const oldDashRefreshCountdown = `<span id="opm-refresh-countdown-span"`;
const newDashActionPills = `<div style="display: flex; align-items: center; gap: 6px;">
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
          <span id="opm-refresh-countdown-span"`;

if (!viewsDashInvContent.includes('opm-dash-bgp-btn')) {
  viewsDashInvContent = viewsDashInvContent.replace(oldDashRefreshCountdown, newDashActionPills);
  console.log('Added quick-access pills in Dashboard header.');
}

// Add event listeners for the dashboard pills:
const oldDashListenerHook = `const addWidgetBtn = container.querySelector('#opm-add-widget-btn');`;
const newDashListeners = `const dashBgpBtn = container.querySelector('#opm-dash-bgp-btn');
    if (dashBgpBtn) {
      dashBgpBtn.onclick = () => {
        if (typeof showBgpMonitoringModal === 'function') showBgpMonitoringModal(state.devices.find(d => d.category === 'Routers'));
      };
    }
    const dashSdwanBtn = container.querySelector('#opm-dash-sdwan-btn');
    if (dashSdwanBtn) {
      dashSdwanBtn.onclick = () => {
        if (typeof showSdwanPerformanceModal === 'function') showSdwanPerformanceModal(state.devices.find(d => d.category === 'Routers'));
      };
    }
    const dashDpiBtn = container.querySelector('#opm-dash-dpi-btn');
    if (dashDpiBtn) {
      dashDpiBtn.onclick = () => {
        if (typeof showDpiTrafficModal === 'function') showDpiTrafficModal(state.devices.find(d => d.category === 'Routers' || d.category === 'Switches'));
      };
    }
    const dashNdrBtn = container.querySelector('#opm-dash-ndr-btn');
    if (dashNdrBtn) {
      dashNdrBtn.onclick = () => {
        if (typeof showNdrForensicsModal === 'function') showNdrForensicsModal();
      };
    }

    const addWidgetBtn = container.querySelector('#opm-add-widget-btn');`;

if (!viewsDashInvContent.includes('dashBgpBtn.onclick')) {
  viewsDashInvContent = viewsDashInvContent.replace(oldDashListenerHook, newDashListeners);
  console.log('Added event listeners for Dashboard action pills.');
}

fs.writeFileSync(fileViewsDashInv, viewsDashInvContent, 'utf8');

// 3. WIRE MODALS INTO 04_views_alarms_maps.js
// A. In Alarms toolbar, add [🛡️ NDR Threat Forensics]:
const oldAlarmToolbarZia = `<button id="opm-alarm-zia-rca-btn"`;
const newAlarmToolbarNdr = `<button id="opm-alarm-ndr-btn" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            🛡️ NDR Threat Forensics
          </button>
          <button id="opm-alarm-zia-rca-btn"`;

if (!viewsAlarmsMapsContent.includes('opm-alarm-ndr-btn')) {
  viewsAlarmsMapsContent = viewsAlarmsMapsContent.replace(oldAlarmToolbarZia, newAlarmToolbarNdr);
  console.log('Added NDR button in Alarms view toolbar.');
}

// B. In Alarms row, add NDR icon button:
const oldAlarmRowRca = `<button class="opm-alarm-row-rca-btn"`;
const newAlarmRowNdr = `<button class="opm-alarm-row-ndr-btn" data-id="\${alm.id}" title="NDR Threat Intelligence Forensics" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; width: 24px; height: 24px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                        <span style="font-size: 11px;">🛡️</span>
                      </button>
                      <button class="opm-alarm-row-rca-btn"`;

if (!viewsAlarmsMapsContent.includes('opm-alarm-row-ndr-btn')) {
  viewsAlarmsMapsContent = viewsAlarmsMapsContent.replace(oldAlarmRowRca, newAlarmRowNdr);
  console.log('Added NDR icon button to alarm table rows.');
}

// C. Add event listeners in Alarms view:
const oldAlarmRcaListener = `// Row Zia AI RCA button`;
const newAlarmNdrListeners = `// Row NDR button
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

    // Row Zia AI RCA button`;

if (!viewsAlarmsMapsContent.includes('toolbarNdrBtn.onclick')) {
  viewsAlarmsMapsContent = viewsAlarmsMapsContent.replace(oldAlarmRcaListener, newAlarmNdrListeners);
  console.log('Added NDR event listeners in Alarms view.');
}

// D. In Maps view toolbar, add BGP AS Topology & SD-WAN buttons next to NetPath:
const oldMapsNetpathBtn = `<button id="opm-maps-netpath-btn"`;
const newMapsBgpSdwanBtns = `<button id="opm-maps-bgp-btn" style="background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            📡 BGP AS Topology
          </button>
          <button id="opm-maps-sdwan-btn" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            🚀 SD-WAN Fabric
          </button>
          <button id="opm-maps-netpath-btn"`;

if (!viewsAlarmsMapsContent.includes('opm-maps-bgp-btn')) {
  viewsAlarmsMapsContent = viewsAlarmsMapsContent.replace(oldMapsNetpathBtn, newMapsBgpSdwanBtns);
  console.log('Added BGP & SD-WAN buttons to Maps view toolbar.');
}

// E. Add event listeners in Maps view for BGP & SD-WAN:
const oldMapsNetpathListener = `const netpathBtn = container.querySelector('#opm-maps-netpath-btn');`;
const newMapsListeners = `const mapsBgpBtn = container.querySelector('#opm-maps-bgp-btn');
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

    const netpathBtn = container.querySelector('#opm-maps-netpath-btn');`;

if (!viewsAlarmsMapsContent.includes('mapsBgpBtn.onclick')) {
  viewsAlarmsMapsContent = viewsAlarmsMapsContent.replace(oldMapsNetpathListener, newMapsListeners);
  console.log('Added Maps toolbar event listeners for BGP & SD-WAN.');
}

fs.writeFileSync(fileViewsAlarmsMaps, viewsAlarmsMapsContent, 'utf8');

// 4. EXPORT NEW METHODS IN 06_router_and_init.js
const oldExportTarget = `    showZiaRcaModal,`;
const newExportCode = `    showZiaRcaModal,
    showBgpMonitoringModal,
    showSdwanPerformanceModal,
    showDpiTrafficModal,
    showNdrForensicsModal,`;

if (!routerInitContent.includes('showBgpMonitoringModal,')) {
  routerInitContent = routerInitContent.replace(oldExportTarget, newExportCode);
  fs.writeFileSync(fileRouterInit, routerInitContent, 'utf8');
  console.log('Exported Batch 4 methods in 06_router_and_init.js.');
}

console.log('ALL MODULES UPDATED SUCCESSFULLY!');

// 5. REBUILD BUNDLE
console.log('Running rebuild_bundle.js...');
const rebuildOutput = execSync('node scripts/rebuild_bundle.js', { cwd: baseDir, encoding: 'utf8' });
console.log(rebuildOutput);
