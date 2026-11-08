const fs = require('fs');

// =========================================================================
// 1. PATCH 02_branding_and_modals.js
// =========================================================================
const modalsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

const newModalsCode = `
  // -------------------------------------------------------------
  // MODAL: MANAGEENGINE STANDALONE MIB BROWSER (RFC1213 & ENTERPRISE)
  // -------------------------------------------------------------
  function showMibBrowserModal(targetIp, initialOid) {
    let modal = document.getElementById('opm-standalone-mib-browser-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-standalone-mib-browser-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const host = targetIp || '10.10.1.1';
    let currentOid = initialOid || '.1.3.6.1.2.1.1.1.0';

    const mibNodes = [
      { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr', type: 'OCTET STRING', access: 'read-only', desc: 'A textual description of the network entity. Includes hardware type, software OS, and version.' },
      { oid: '.1.3.6.1.2.1.1.2.0', name: 'sysObjectID', type: 'OBJECT IDENTIFIER', access: 'read-only', desc: 'The vendor authoritative identification of the network management subsystem.' },
      { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime', type: 'TimeTicks', access: 'read-only', desc: 'The time (in hundredths of a second) since the network management portion of the system was last re-initialized.' },
      { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact', type: 'OCTET STRING', access: 'read-write', desc: 'The textual identification of the contact person for this managed node, together with information on how to contact this person.' },
      { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName', type: 'OCTET STRING', access: 'read-write', desc: 'An administratively assigned name for this managed node. Matches the device FQDN.' },
      { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation', type: 'OCTET STRING', access: 'read-write', desc: 'The physical location of this node (e.g., telephone closet, 3rd floor).' },
      { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber', type: 'INTEGER', access: 'read-only', desc: 'The number of network interfaces (regardless of their current state) present on this system.' },
      { oid: '.1.3.6.1.2.1.2.2.1.2', name: 'ifDescr', type: 'OCTET STRING', access: 'read-only', desc: 'A textual string containing information about the interface (e.g. TenGigabitEthernet0/0/1).' },
      { oid: '.1.3.6.1.2.1.4.1.0', name: 'ipForwarding', type: 'INTEGER', access: 'read-write', desc: 'The indication of whether this entity is acting as an IP router in respect to the forwarding of datagrams.' },
      { oid: '.1.3.6.1.4.1.9.9.13.1.3.1.3', name: 'ciscoEnvMonTemperatureStatusValue', type: 'Gauge32', access: 'read-only', desc: 'Current chassis ambient temperature value in degrees Celsius.' }
    ];

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 1080px; max-width: 96vw; height: 86vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0284c7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800;">MIB</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine OpManager &bull; Standalone MIB Browser v12.9</div>
              <div style="font-size: 11px; color: #94a3b8;">RFC1213-MIB / CISCO-STACK-MIB / HOST-RESOURCES-MIB &bull; SNMPv1, v2c, v3 Engine</div>
            </div>
          </div>
          <button id="close-mib-browser-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- SNMP Connection / Query Bar -->
        <div style="padding: 10px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Target Host:</span>
            <input type="text" id="mib-host-input" value="\${host}" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 130px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Port:</span>
            <input type="text" id="mib-port-input" value="161" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 50px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Community:</span>
            <input type="password" id="mib-comm-input" value="public" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 80px; font-family: monospace;">
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; color: #475569;">Version:</span>
            <select id="mib-ver-select" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; background: #fff;">
              <option value="v2c" selected>SNMPv2c</option>
              <option value="v1">SNMPv1</option>
              <option value="v3">SNMPv3 (USM)</option>
            </select>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <span style="font-weight: 700; color: #475569;">OID:</span>
            <input type="text" id="mib-oid-input" value="\${currentOid}" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; flex: 1; font-family: monospace; font-weight: 600; color: #0284c7;">
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="mib-btn-get" style="background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; cursor: pointer;">Get</button>
            <button id="mib-btn-getnext" style="background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; cursor: pointer;">Get Next</button>
            <button id="mib-btn-walk" style="background: #16a34a; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 700; cursor: pointer;">SNMP Walk</button>
            <button id="mib-btn-clear" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Clear</button>
          </div>
        </div>

        <!-- Body: Split Tree & PDU Console -->
        <div style="flex: 1; display: flex; overflow: hidden;">
          <!-- Left: MIB Tree -->
          <div style="width: 320px; border-right: 1px solid #e2e8f0; background: #fafbfc; overflow-y: auto; padding: 12px; font-size: 11px;">
            <div style="font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Loaded MIB Modules:</div>
            
            <div style="margin-left: 4px; line-height: 1.8;">
              <div style="color: #0f172a; font-weight: 700;">📂 iso.org.dod.internet (1.3.6.1)</div>
              <div style="margin-left: 14px;">
                <div style="color: #0f172a; font-weight: 700;">📂 mgmt (2)</div>
                <div style="margin-left: 14px;">
                  <div style="color: #0f172a; font-weight: 700;">📂 mib-2 (1)</div>
                  
                  <!-- system branch -->
                  <div style="margin-left: 14px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 system (1)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      \${mibNodes.slice(0, 6).map(n => \`
                        <div class="opm-mib-tree-leaf" data-oid="\${n.oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 0 4px; border-radius: 2px; font-weight: 700;">S</span>
                          <span>\${n.name}</span>
                        </div>
                      \`).join('')}
                    </div>
                  </div>

                  <!-- interfaces branch -->
                  <div style="margin-left: 14px; margin-top: 4px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 interfaces (2)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      \${mibNodes.slice(6, 8).map(n => \`
                        <div class="opm-mib-tree-leaf" data-oid="\${n.oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 10px; background: #dcfce7; color: #15803d; padding: 0 4px; border-radius: 2px; font-weight: 700;">T</span>
                          <span>\${n.name}</span>
                        </div>
                      \`).join('')}
                    </div>
                  </div>

                  <!-- ip branch -->
                  <div style="margin-left: 14px; margin-top: 4px;">
                    <div style="color: #0369a1; font-weight: 700;">📂 ip (4)</div>
                    <div style="margin-left: 14px; display: flex; flex-direction: column; gap: 2px;">
                      <div class="opm-mib-tree-leaf" data-oid="\${mibNodes[8].oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 0 4px; border-radius: 2px; font-weight: 700;">S</span>
                        <span>\${mibNodes[8].name}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- enterprises branch -->
              <div style="margin-left: 14px; margin-top: 4px;">
                <div style="color: #0f172a; font-weight: 700;">📂 private.enterprises (4.1)</div>
                <div style="margin-left: 14px;">
                  <div style="color: #9333ea; font-weight: 700;">📂 cisco (9)</div>
                  <div style="margin-left: 14px;">
                    <div class="opm-mib-tree-leaf" data-oid="\${mibNodes[9].oid}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; color: #334155; display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 10px; background: #f3e8ff; color: #7e22ce; padding: 0 4px; border-radius: 2px; font-weight: 700;">E</span>
                      <span>\${mibNodes[9].name}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right: OID Metadata & PDU Terminal -->
          <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #ffffff;">
            <!-- Node Metadata -->
            <div id="mib-node-metadata-box" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px;">
              <div style="display: flex; gap: 20px; margin-bottom: 6px;">
                <div><span style="color: #64748b;">Node Name:</span> <strong id="meta-name" style="color: #0f172a; font-size: 12px;">sysDescr</strong></div>
                <div><span style="color: #64748b;">Syntax:</span> <strong id="meta-type" style="color: #0284c7;">OCTET STRING</strong></div>
                <div><span style="color: #64748b;">Access:</span> <strong id="meta-access" style="color: #16a34a;">read-only</strong></div>
                <div><span style="color: #64748b;">Status:</span> <strong style="color: #0f172a;">current</strong></div>
              </div>
              <div><span style="color: #64748b;">Description:</span> <span id="meta-desc" style="color: #334155;">A textual description of the network entity. Includes hardware type, software OS, and version.</span></div>
            </div>

            <!-- Terminal Output -->
            <div style="padding: 8px 18px; background: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 700; display: flex; justify-content: space-between;">
              <span>SNMP++ PDU Exchange Log Terminal</span>
              <span style="color: #4ade80;">UDP 161 ACTIVE</span>
            </div>
            <div id="mib-pdu-console" style="flex: 1; overflow-y: auto; background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11px; padding: 14px 18px; line-height: 1.6;">
              <span style="color: #64748b;">// ManageEngine MIB Browser initialized for target \${host}</span><br>
              <span style="color: #64748b;">// Ready for SNMP GET / GETNEXT / WALK operations...</span><br>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine SNMP Engine &bull; Timeout: 3000ms &bull; Retries: 2</span>
          <button id="mib-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close MIB Browser</button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-mib-browser-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#mib-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };

    const oidInput = modal.querySelector('#mib-oid-input');
    const pduConsole = modal.querySelector('#mib-pdu-console');
    const metaName = modal.querySelector('#meta-name');
    const metaType = modal.querySelector('#meta-type');
    const metaAccess = modal.querySelector('#meta-access');
    const metaDesc = modal.querySelector('#meta-desc');

    modal.querySelectorAll('.opm-mib-tree-leaf').forEach(leaf => {
      leaf.onclick = () => {
        const leafOid = leaf.getAttribute('data-oid');
        const node = mibNodes.find(n => n.oid === leafOid);
        if (node) {
          oidInput.value = node.oid;
          metaName.textContent = node.name;
          metaType.textContent = node.type;
          metaAccess.textContent = node.access;
          metaDesc.textContent = node.desc;
          modal.querySelectorAll('.opm-mib-tree-leaf').forEach(l => l.style.background = 'transparent');
          leaf.style.background = '#e2e8f0';
        }
      };
    });

    function logPdu(msg, color = '#38bdf8') {
      const time = new Date().toTimeString().split(' ')[0];
      pduConsole.innerHTML += \`<span style="color: #94a3b8;">[\${time}]</span> <span style="color: \${color};">\${msg}</span><br>\`;
      pduConsole.scrollTop = pduConsole.scrollHeight;
    }

    modal.querySelector('#mib-btn-clear').onclick = () => {
      pduConsole.innerHTML = '<span style="color: #64748b;">// Console cleared.</span><br>';
    };

    modal.querySelector('#mib-btn-get').onclick = () => {
      const targetOid = oidInput.value.trim();
      const node = mibNodes.find(n => n.oid === targetOid) || { name: 'leafNode', type: 'OCTET STRING' };
      const dev = (state.devices || []).find(d => d.ip === host) || { name: 'NY-CORE-RTR-01', vendor: 'Cisco IOS' };
      
      let val = dev.name;
      if (node.name === 'sysDescr') val = 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4, RELEASE SOFTWARE (fc1)';
      else if (node.name === 'sysObjectID') val = '.1.3.6.1.4.1.9.1.516';
      else if (node.name === 'sysUpTime') val = '148 days, 12:44:19.82 (1283305982 timeticks)';
      else if (node.name === 'sysContact') val = 'noc-support@manageengine.internal';
      else if (node.name === 'sysLocation') val = 'US-East Equinix DC4, Rack B04-U12';
      else if (node.name === 'ifNumber') val = '52 interfaces';
      else if (node.name === 'ciscoEnvMonTemperatureStatusValue') val = '34 Celsius (Normal)';

      logPdu(\`Sent GetRequest-PDU (reqId \${Math.floor(Math.random()*90000+10000)}) to \${host}:161 for \${targetOid}\`, '#94a3b8');
      setTimeout(() => {
        logPdu(\`Received Response-PDU from \${host} (errStatus=0, errIndex=0):\\n   \${targetOid} (\${node.name}) = \${node.type}: "\${val}"\`, '#4ade80');
      }, 250);
    };

    modal.querySelector('#mib-btn-getnext').onclick = () => {
      const targetOid = oidInput.value.trim();
      const idx = mibNodes.findIndex(n => n.oid === targetOid);
      const nextNode = (idx >= 0 && idx < mibNodes.length - 1) ? mibNodes[idx + 1] : mibNodes[0];
      oidInput.value = nextNode.oid;
      metaName.textContent = nextNode.name;
      metaType.textContent = nextNode.type;
      metaAccess.textContent = nextNode.access;
      metaDesc.textContent = nextNode.desc;
      logPdu(\`GetNextRequest-PDU on \${targetOid} resolved next OID: \${nextNode.oid} (\${nextNode.name})\`, '#fbbf24');
    };

    modal.querySelector('#mib-btn-walk').onclick = () => {
      logPdu(\`Executing SNMP Walk tree on \${host} starting at .1.3.6.1.2.1.1...\`, '#38bdf8');
      mibNodes.slice(0, 6).forEach((n, i) => {
        setTimeout(() => {
          let val = n.name === 'sysDescr' ? 'Cisco IOS Software C2960' : (n.name === 'sysUpTime' ? '148 days' : 'Equinix DC4');
          logPdu(\`\${n.oid} = \${n.type}: "\${val}"\`, '#4ade80');
        }, (i + 1) * 150);
      });
    };
  }

  // -------------------------------------------------------------
  // MODAL: CISCO IP SLA VOIP & JITTER TELEMETRY
  // -------------------------------------------------------------
  function showIpSlaVoipModal(linkData) {
    let modal = document.getElementById('opm-ipsla-voip-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-ipsla-voip-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const l = linkData || {
      name: 'Central HQ <--> Dubai Campus Core Trans-WAN',
      carrier: 'Tata Communications Global MPLS',
      src: 'NY-CORE-RTR-01',
      dst: 'DXB-CORE-SW-01'
    };

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 780px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #10b981; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800;">VoIP</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">ManageEngine Cisco IP SLA &bull; VoIP &amp; Jitter Telemetry</div>
              <div style="font-size: 11px; color: #94a3b8;">\${l.name} &bull; Operation ID: <strong>101 (VoIP UDP Jitter)</strong></div>
            </div>
          </div>
          <span id="close-ipsla-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px;">
          <!-- Telemetry KPI Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">VoIP MOS Score</div>
              <div style="font-size: 26px; font-weight: 900; color: #15803d; margin: 4px 0;">4.38</div>
              <span style="font-size: 10px; background: #22c55e; color: #fff; padding: 1px 6px; border-radius: 10px; font-weight: 700;">EXCELLENT (ITU-T)</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Round Trip Time</div>
              <div style="font-size: 26px; font-weight: 900; color: #0284c7; margin: 4px 0;">14.2<span style="font-size: 13px;">ms</span></div>
              <span style="font-size: 10px; color: #64748b;">SLA Threshold: &lt; 50ms</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average Jitter</div>
              <div style="font-size: 26px; font-weight: 900; color: #334155; margin: 4px 0;">1.2<span style="font-size: 13px;">ms</span></div>
              <span style="font-size: 10px; color: #16a34a; font-weight: 600;">+1.2ms / -0.8ms</span>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Packet Loss</div>
              <div style="font-size: 26px; font-weight: 900; color: #16a34a; margin: 4px 0;">0.00<span style="font-size: 13px;">%</span></div>
              <span style="font-size: 10px; color: #16a34a; font-weight: 600;">0 / 1,000 pkts</span>
            </div>
          </div>

          <!-- Codec & Technical Details -->
          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <div style="color: #64748b;">Synthesized Codec: <strong style="color: #0f172a;">G.711u (64 Kbps)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Packetization Interval: <strong style="color: #0f172a;">20 ms (160 bytes payload)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Calculated R-Factor: <strong style="color: #16a34a;">91.4 / 100</strong></div>
            </div>
            <div>
              <div style="color: #64748b;">Source Responder: <strong style="color: #0f172a;">\${l.src} (Cisco IOS-XE)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">Destination Target: <strong style="color: #0f172a;">\${l.dst} (UDP 1967)</strong></div>
              <div style="color: #64748b; margin-top: 4px;">IP SLA Compliance: <strong style="color: #16a34a;">100% (No Breaches in 24h)</strong></div>
            </div>
          </div>

          <!-- Simulated Jitter Distribution Histogram (SVG) -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>RTP Packet Jitter Distribution (Last 1,000 Synthetic Samples)</span>
              <span style="color: #10b981; font-weight: 700;">Within +/- 3ms Nominal Boundary</span>
            </div>
            <svg width="100%" height="60" viewBox="0 0 700 60" style="overflow: visible;">
              <line x1="0" y1="50" x2="700" y2="50" stroke="#cbd5e1" stroke-width="1" />
              <!-- Bars -->
              <rect x="50" y="30" width="35" height="20" fill="#38bdf8" rx="2" />
              <rect x="110" y="20" width="35" height="30" fill="#38bdf8" rx="2" />
              <rect x="170" y="10" width="35" height="40" fill="#22c55e" rx="2" />
              <rect x="230" y="5" width="35" height="45" fill="#22c55e" rx="2" />
              <rect x="290" y="8" width="35" height="42" fill="#22c55e" rx="2" />
              <rect x="350" y="15" width="35" height="35" fill="#22c55e" rx="2" />
              <rect x="410" y="22" width="35" height="28" fill="#38bdf8" rx="2" />
              <rect x="470" y="35" width="35" height="15" fill="#38bdf8" rx="2" />
              <rect x="530" y="42" width="35" height="8" fill="#94a3b8" rx="2" />
              <rect x="590" y="46" width="35" height="4" fill="#94a3b8" rx="2" />
              <text x="247" y="58" font-size="9" fill="#64748b" text-anchor="middle">1.2ms peak</text>
            </svg>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="ipsla-test-btn" style="background: #10b981; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">⚡ Trigger On-Demand 1,000 Pkt Test</button>
            <button id="close-ipsla-bottom-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-ipsla-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#close-ipsla-bottom-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#ipsla-test-btn').onclick = () => {
      showToast('Executed 1,000 UDP packet Cisco IP SLA synthetic jitter poll on ' + l.src + '. All SLAs verified healthy.');
    };
  }

  // -------------------------------------------------------------
  // MODAL: SCHEDULE DOWNTIME / ALARM SUPPRESSION
  // -------------------------------------------------------------
  function showScheduleDowntimeModal(targetDev) {
    let modal = document.getElementById('opm-schedule-downtime-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-schedule-downtime-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const dev = targetDev || (state.devices && state.devices[0]) || { name: 'NY-CORE-RTR-01', ip: '10.10.1.1' };

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 620px; max-width: 95vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #eab308; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;">⏱️</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Schedule Downtime / Alarm Suppression Window</div>
              <div style="font-size: 11px; color: #64748b;">ManageEngine OpManager Central Maintenance Engine</div>
            </div>
          </div>
          <span id="close-downtime-modal-btn" style="color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px;" title="Close">✕</span>
        </div>

        <div style="padding: 22px; font-size: 12px;">
          <!-- Target Device -->
          <div style="margin-bottom: 14px;">
            <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Target Device(s) / Business View:</label>
            <select id="downtime-dev-select" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
              \${(state.devices || []).map(d => \`<option value="\${d.id}" \${d.name === dev.name ? 'selected' : ''}>\${d.name} (\${d.ip}) - \${d.type}</option>\`).join('')}
              <option value="all-ny">All Devices in Probe [New York Central Probe]</option>
              <option value="all-core">Business View [Global WAN Core Infrastructure]</option>
            </select>
          </div>

          <!-- Schedule Type -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Maintenance Window Duration:</label>
              <select id="downtime-duration-select" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; background: #fff;">
                <option value="1">1 Hour Immediate</option>
                <option value="2" selected>2 Hours Immediate</option>
                <option value="4">4 Hours (Major Maintenance)</option>
                <option value="weekend">Recurring Weekend Window (Sat 22:00 - Sun 04:00 UTC)</option>
              </select>
            </div>
            <div>
              <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Change Reference / Ticket #:</label>
              <input type="text" id="downtime-chg-ref" value="CHG-2026-9812 (Core Switch Patching)" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
            </div>
          </div>

          <!-- Suppression Rules -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Suppression Policies during Window:</div>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Suppress new Alarm generation (Mark events as Maintenance in DB)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Mute Notification Profiles (No SMS, Email, or Slack alerts dispatched)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Suppress ServiceDesk Plus ticket auto-creation</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" checked style="cursor: pointer;">
              <span>Display yellow Maintenance Mode icon on Device Snapshot &amp; Business Views</span>
            </label>
          </div>

          <!-- Reason -->
          <div style="margin-bottom: 16px;">
            <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 5px;">Operational Reason:</label>
            <textarea id="downtime-reason-input" style="width: 100%; height: 50px; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-family: sans-serif; box-sizing: border-box;">Scheduled Cisco IOS-XE software patching and redundant power-supply failover verification.</textarea>
          </div>

          <!-- Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-downtime-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 7px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="save-downtime-btn" style="background: #eab308; color: #0f172a; border: none; padding: 7px 18px; border-radius: 4px; font-weight: 800; cursor: pointer;">🛡️ Activate Downtime Window</button>
          </div>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-downtime-modal-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#cancel-downtime-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#save-downtime-btn').onclick = () => {
      const selectedId = modal.querySelector('#downtime-dev-select').value;
      modal.style.display = 'none';
      showToast('Scheduled Downtime active for selected target. Alarms suppressed for 2 hours.');
    };
  }
`;

if (!modalsContent.includes('showMibBrowserModal')) {
  modalsContent = modalsContent.replace(
    '// --- TRAINING VIDEOS MODAL ---',
    `${newModalsCode}\n\n  // --- TRAINING VIDEOS MODAL ---`
  );
  console.log('Added showMibBrowserModal, showIpSlaVoipModal, showScheduleDowntimeModal to 02_branding_and_modals.js');
}

// Wire MIB Browser button into showDeviceSnapshotModal (Diagnostics tab)
if (!modalsContent.includes('mib-browser-from-snapshot-btn')) {
  modalsContent = modalsContent.replace(
    '<button id="cli-btn-clear"',
    '<button id="mib-browser-from-snapshot-btn" style="background: #0284c7; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; cursor: pointer;">🌐 Open MIB Browser</button>\n                <button id="cli-btn-clear"'
  );
  
  const mibBtnWiring = `      const mibBrowserBtn = modal.querySelector('#mib-browser-from-snapshot-btn');
      if (mibBrowserBtn) {
        mibBrowserBtn.onclick = () => {
          showMibBrowserModal(dev.ip);
        };
      }`;

  modalsContent = modalsContent.replace(
    'clearBtn.onclick = () => {',
    `${mibBtnWiring}\n      clearBtn.onclick = () => {`
  );
  console.log('Wired MIB Browser button into showDeviceSnapshotModal diagnostics tab');
}

// Wire IP SLA button into showWanLinkDetailsModal
if (!modalsContent.includes('wan-link-ipsla-btn')) {
  modalsContent = modalsContent.replace(
    '<button id="wan-link-poll-btn"',
    '<button id="wan-link-ipsla-btn" style="background: #10b981; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer;">📞 Cisco IP SLA VoIP</button>\n            <button id="wan-link-poll-btn"'
  );
  
  const ipslaWiring = `    const ipslaBtn = modal.querySelector('#wan-link-ipsla-btn');
    if (ipslaBtn) {
      ipslaBtn.onclick = () => {
        showIpSlaVoipModal(l);
      };
    }`;
  
  modalsContent = modalsContent.replace(
    'if (pBtn) {',
    `${ipslaWiring}\n    if (pBtn) {`
  );
  console.log('Wired IP SLA button into showWanLinkDetailsModal');
}

fs.writeFileSync(modalsPath, modalsContent, 'utf8');

// =========================================================================
// 2. PATCH 04_views_alarms_maps.js: Add Schedule Downtime button in Alarms
// =========================================================================
const alarmsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/04_views_alarms_maps.js';
let alarmsContent = fs.readFileSync(alarmsPath, 'utf8');

if (!alarmsContent.includes('opm-alarm-downtime-btn')) {
  alarmsContent = alarmsContent.replace(
    '<span style="font-size: 11px;">Click any alarm row to inspect Zia Root Cause Analysis</span>',
    '<button id="opm-alarm-downtime-btn" style="background: #fef9c3; border: 1px solid #fde047; color: #854d0e; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">⏱️ Schedule Downtime</button>\n                  <span style="font-size: 11px; margin-left: 6px;">Click row for Zia RCA</span>'
  );

  const downtimeWiring = `    // Wire Schedule Downtime button
    const downtimeBtn = container.querySelector('#opm-alarm-downtime-btn');
    if (downtimeBtn) {
      downtimeBtn.onclick = () => {
        if (typeof showScheduleDowntimeModal === 'function') {
          showScheduleDowntimeModal();
        }
      };
    }`;

  alarmsContent = alarmsContent.replace(
    '// Wire Dial buttons',
    `${downtimeWiring}\n\n    // Wire Dial buttons`
  );

  fs.writeFileSync(alarmsPath, alarmsContent, 'utf8');
  console.log('Added Schedule Downtime button to 04_views_alarms_maps.js');
}

// =========================================================================
// 3. PATCH 06_router_and_init.js: Export new modals
// =========================================================================
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('showMibBrowserModal,')) {
  routerContent = routerContent.replace(
    'showNetFlowRawRecordsModal,',
    'showNetFlowRawRecordsModal,\n    showMibBrowserModal,\n    showIpSlaVoipModal,\n    showScheduleDowntimeModal,'
  );
  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('Exported new modals on OpManagerSuite in 06_router_and_init.js');
}
