const fs = require("fs");
const file = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js";
let content = fs.readFileSync(file, "utf8");

// 1. Add isSwitch check in showDeviceSnapshotModal
const targetActiveModal = "let activeModalTab = 'summary';";
const replActiveModal = `let activeModalTab = 'summary';
    const isSwitch = (dev.category || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('switch') || (dev.type || '').toLowerCase().includes('catalyst') || (dev.type || '').toLowerCase().includes('nexus') || (dev.type || '').toLowerCase().includes('leaf') || (dev.type || '').toLowerCase().includes('procurve');
    let selectedPortNumber = dev.status === 'Critical' ? 48 : 1;`;

content = content.replace(targetActiveModal, replActiveModal);

// 2. Add ports tab content in renderSnapshotBody
const targetBeforeConfig = "} else if (activeModalTab === 'config') {";
const portsTabContent = `} else if (activeModalTab === 'ports') {
        const isDown48 = (p) => p === 48 && dev.status === 'Critical';
        const isAmber = (p) => p % 7 === 0;

        function renderPortInspector(p) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const speed = p === 48 ? '40 Gbps QSFP28' : (p % 2 === 0 ? '10 Gbps SFP+' : '1 Gbps RJ45');
          const adminSt = 'UP (Administratively Enabled)';
          const operSt = isDown ? 'DOWN (Link Failure / Loss of Carrier Signal)' : 'UP (Connected & Forwarding)';
          const inRate = isDown ? '0.0 Mbps' : ((p * 18.4) % 780 + 15).toFixed(1) + ' Mbps';
          const outRate = isDown ? '0.0 Mbps' : ((p * 14.1) % 650 + 12).toFixed(1) + ' Mbps';
          const crc = isDown ? '14 CRC Errors (Transceiver Degraded)' : '0 Errors';
          const vlan = p <= 24 ? 'VLAN 100 (Enterprise-Servers)' : 'VLAN 200 (Core-Uplinks)';

          return \`
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 16px; margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 14px; font-weight: 800; color: #38bdf8;">Interface Port \${p}: \${p === 48 ? 'FortyGigabitEthernet1/0/48' : 'TenGigabitEthernet1/0/' + p}</span>
                  <span style="font-size: 10px; font-weight: 800; background: \${isDown ? '#dc2626' : '#166534'}; color: #fff; padding: 2px 7px; border-radius: 2px;">
                    \${isDown ? 'PORT DOWN (CRITICAL)' : 'OPERATIONAL UP'}
                  </span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button id="opm-port-bounce-btn" style="background: #334155; border: 1px solid #475569; color: #fff; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Shut / No-Shut
                  </button>
                  <button id="opm-port-clear-btn" style="background: #334155; border: 1px solid #475569; color: #fff; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Clear CRC Counters
                  </button>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 11px; margin-bottom: 12px;">
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">NEGOTIATED SPEED</div>
                  <div style="font-weight: 700; color: #f8fafc; font-size: 12px; margin-top: 2px;">\${speed}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">VLAN ASSIGNMENT</div>
                  <div style="font-weight: 700; color: #38bdf8; font-size: 12px; margin-top: 2px;">\${vlan}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">TRAFFIC (IN / OUT)</div>
                  <div style="font-weight: 700; color: #4ade80; font-size: 12px; margin-top: 2px;">\${inRate} / \${outRate}</div>
                </div>
                <div style="background: #0f172a; padding: 10px; border-radius: 4px; border: 1px solid #334155;">
                  <div style="color: #94a3b8; font-size: 10px;">PACKET DISCARDS &amp; CRC</div>
                  <div style="font-weight: 700; color: \${isDown ? '#f87171' : '#cbd5e1'}; font-size: 12px; margin-top: 2px;">\${crc}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                <span>Admin Status: <strong style="color: #4ade80;">\${adminSt}</strong></span>
                <span>Operational Status: <strong style="color: \${isDown ? '#f87171' : '#4ade80'};">\${operSt}</strong></span>
              </div>
            </div>
          \`;
        }

        let topRowHtml = '';
        for (let p = 1; p <= 47; p += 2) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const ledBg = isDown ? '#dc2626' : (isAmb ? '#eab308' : '#22c55e');
          const isSel = selectedPortNumber === p;
          topRowHtml += \`
            <div class="opm-faceplate-port" data-port="\${p}" title="Port \${p}: \${isDown ? 'DOWN' : 'UP'}" style="width: 28px; height: 32px; background: \${isSel ? '#1e3a8a' : '#0f172a'}; border: 1px solid \${isSel ? '#3b82f6' : '#334155'}; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3px 2px; cursor: pointer; transition: all 0.15s;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: \${ledBg}; \${isDown ? 'box-shadow: 0 0 6px #dc2626;' : 'box-shadow: 0 0 4px ' + ledBg + ';' }"></span>
              <span style="font-family: monospace; font-size: 9px; font-weight: 700; color: \${isSel ? '#93c5fd' : '#cbd5e1'};">\${p}</span>
            </div>
          \`;
        }

        let btmRowHtml = '';
        for (let p = 2; p <= 48; p += 2) {
          const isDown = isDown48(p);
          const isAmb = isAmber(p);
          const ledBg = isDown ? '#dc2626' : (isAmb ? '#eab308' : '#22c55e');
          const isSel = selectedPortNumber === p;
          btmRowHtml += \`
            <div class="opm-faceplate-port" data-port="\${p}" title="Port \${p}: \${isDown ? 'DOWN' : 'UP'}" style="width: 28px; height: 32px; background: \${isSel ? '#1e3a8a' : '#0f172a'}; border: 1px solid \${isSel ? '#3b82f6' : '#334155'}; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 3px 2px; cursor: pointer; transition: all 0.15s;">
              <span style="font-family: monospace; font-size: 9px; font-weight: 700; color: \${isSel ? '#93c5fd' : '#cbd5e1'};">\${p}</span>
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: \${ledBg}; \${isDown ? 'box-shadow: 0 0 6px #dc2626;' : 'box-shadow: 0 0 4px ' + ledBg + ';' }"></span>
            </div>
          \`;
        }

        bodyContainer.innerHTML = \`
          <div style="background: #0f172a; border-radius: 6px; padding: 20px; color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                  \${dev.name} &bull; Physical 48-Port Switch Elevation Faceplate
                </span>
                <span style="font-size: 10px; font-weight: 700; background: #334155; color: #94a3b8; padding: 2px 6px; border-radius: 2px;">
                  1U RACK CHASSIS
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 14px; font-size: 10px;">
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e;"></span> 10G/25G UP</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #eab308;"></span> 1G Link</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 4px #dc2626;"></span> DOWN (Port 48)</span>
              </div>
            </div>

            <div style="background: #1e293b; border: 2px solid #334155; border-radius: 6px; padding: 14px; display: flex; gap: 16px; align-items: center; justify-content: space-between; overflow-x: auto;">
              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding-right: 12px; border-right: 1px solid #334155;">
                <span style="font-size: 11px; font-weight: 800; color: #f8fafc; font-family: sans-serif;">CISCO</span>
                <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">CAT 9500</span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; color: #4ade80;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #22c55e;"></span> SYS OK
                </div>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; color: #4ade80;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #22c55e;"></span> PWR OK
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
                <div style="display: flex; gap: 4px;">
                  \${topRowHtml}
                </div>
                <div style="display: flex; gap: 4px;">
                  \${btmRowHtml}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; padding-left: 14px; border-left: 1px solid #334155;">
                <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">40G QSFP</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 1 (40G) - UP">Q1</div>
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 2 (40G) - UP">Q2</div>
                  <div style="width: 32px; height: 24px; background: #0f172a; border: 1px solid #22c55e; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #4ade80;" title="QSFP 3 (40G) - UP">Q3</div>
                  <div style="width: 32px; height: 24px; background: #450a0a; border: 1px solid #dc2626; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #f87171;" title="QSFP 4 (40G) - DOWN (Port 48 Uplink)">Q4 ⚠</div>
                </div>
              </div>
            </div>

            <div id="opm-port-inspector-container">
              \${renderPortInspector(selectedPortNumber)}
            </div>
          </div>
        \`;

        bodyContainer.querySelectorAll('.opm-faceplate-port').forEach(el => {
          el.onclick = () => {
            selectedPortNumber = Number(el.getAttribute('data-port'));
            renderSnapshotBody();
          };
        });

        const bounceBtn = bodyContainer.querySelector('#opm-port-bounce-btn');
        if (bounceBtn) {
          bounceBtn.onclick = () => {
            showToast(\`Administrative bounce sent for Port \${selectedPortNumber}. Interface re-negotiated.\`);
          };
        }
        const clearBtn = bodyContainer.querySelector('#opm-port-clear-btn');
        if (clearBtn) {
          clearBtn.onclick = () => {
            showToast(\`CRC error counters cleared for Port \${selectedPortNumber}.\`);
          };
        }
      `;

content = content.replace(targetBeforeConfig, portsTabContent + "\n" + targetBeforeConfig);

// 3. Update tabs strip
const targetTabsStrip = `        <!-- 6 Tabs Strip -->
        <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 0 24px; overflow-x: auto;">
          \${[
            { id: 'summary', label: 'Summary & Hardware' },
            { id: 'performance', label: 'Telemetry Graphs' },
            { id: 'monitors', label: 'Performance Monitors (7)' },
            { id: 'interfaces', label: \`Interfaces (\${(dev.interfaces || []).length})\` },
            { id: 'alarms', label: 'Active Alarms' },
            { id: 'config', label: 'Configuration (NCM)' }
          ].map(t => \`
            <div class="snap-tab-item" data-tab="\${t.id}" style="padding: 12px 16px; font-size: 12px; font-weight: \${t.id === 'summary' ? '700' : '500'}; color: \${t.id === 'summary' ? '#212121' : '#64748b'}; border-bottom: \${t.id === 'summary' ? '3px solid #49bd80' : 'none'}; cursor: pointer; white-space: nowrap;">
              \${t.label}
            </div>
          \`).join('')}
        </div>`;

const newTabsStrip = `        <!-- Enterprise Multi-Tab Strip -->
        <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 0 24px; overflow-x: auto;">
          \${[
            { id: 'summary', label: 'Summary & Hardware' },
            { id: 'performance', label: 'Telemetry Graphs' },
            { id: 'monitors', label: 'Performance Monitors (7)' },
            { id: 'interfaces', label: \`Interfaces (\${(dev.interfaces || []).length})\` },
            ...(isSwitch ? [{ id: 'ports', label: 'Port Matrix (48-Port)' }] : []),
            { id: 'alarms', label: 'Active Alarms' },
            { id: 'config', label: 'Configuration (NCM)' }
          ].map(t => \`
            <div class="snap-tab-item" data-tab="\${t.id}" style="padding: 12px 16px; font-size: 12px; font-weight: \${t.id === activeModalTab ? '700' : '500'}; color: \${t.id === activeModalTab ? '#212121' : '#64748b'}; border-bottom: \${t.id === activeModalTab ? '3px solid #49bd80' : 'none'}; cursor: pointer; white-space: nowrap;">
              \${t.label}
            </div>
          \`).join('')}
        </div>`;

content = content.replace(targetTabsStrip, newTabsStrip);

fs.writeFileSync(file, content, "utf8");
console.log("Successfully updated 02_branding_and_modals.js with 48-port switch faceplate!");
