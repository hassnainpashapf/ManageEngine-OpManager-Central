const fs = require('fs');

// --- 1. PATCH 04_views_alarms_maps.js ---
const mapsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/04_views_alarms_maps.js';
let mapsContent = fs.readFileSync(mapsPath, 'utf8');

// Add opm-bv-wan-link class and cursor: pointer to WAN links
if (!mapsContent.includes('opm-bv-wan-link')) {
  mapsContent = mapsContent.replace(
    '<line class="opm-packet-flow" x1="145" y1="175" x2="558" y2="205"',
    '<line class="opm-packet-flow opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x1="145" y1="175" x2="558" y2="205"'
  );
  mapsContent = mapsContent.replace(
    '<rect x="315" y="182" width="84" height="17" rx="3" fill="#450a0a" stroke="#dc2626" stroke-width="1" />',
    '<rect class="opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x="315" y="182" width="84" height="17" rx="3" fill="#450a0a" stroke="#dc2626" stroke-width="1" />'
  );
  mapsContent = mapsContent.replace(
    '<text x="357" y="194" text-anchor="middle" fill="#fca5a5" font-size="9.5" font-weight="bold" font-family="monospace">18ms | 78% !</text>',
    '<text class="opm-bv-wan-link" data-link="dubai" style="cursor: pointer;" x="357" y="194" text-anchor="middle" fill="#fca5a5" font-size="9.5" font-weight="bold" font-family="monospace">18ms | 78% !</text>'
  );

  // Attach click listener in renderMapsView
  const linkListener = `    // WAN link inspector click listener
    container.querySelectorAll('.opm-bv-wan-link').forEach(link => {
      link.onclick = (e) => {
        e.stopPropagation();
        if (typeof showWanLinkDetailsModal === 'function') {
          showWanLinkDetailsModal();
        }
      };
    });`;

  mapsContent = mapsContent.replace(
    '// Topology node clicks',
    `${linkListener}\n\n    // Topology node clicks`
  );

  fs.writeFileSync(mapsPath, mapsContent, 'utf8');
  console.log('Successfully updated 04_views_alarms_maps.js with interactive WAN links.');
}

// --- 2. PATCH 05_views_config_reports_settings.js ---
const cfgPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/05_views_config_reports_settings.js';
let cfgContent = fs.readFileSync(cfgPath, 'utf8');

// Connect .opm-remediate-btn to showNcmRemediationModal
const oldRemedCode = `    // Remediate button
    container.querySelectorAll('.opm-remediate-btn').forEach(btn => {
      btn.onclick = () => {
        showToast('Compliance remediation script executed via SSH.');
      };
    });`;

const newRemedCode = `    // Remediate button: opens ManageEngine NCM Policy Remediation Fixlet
    container.querySelectorAll('.opm-remediate-btn').forEach(btn => {
      btn.onclick = () => {
        if (typeof showNcmRemediationModal === 'function') {
          showNcmRemediationModal('Cisco IOS Golden Baseline (SSH v2 & Password Encryption)', state.devices[0]);
        } else {
          showToast('Compliance remediation script executed via SSH.');
        }
      };
    });`;

if (cfgContent.includes(oldRemedCode)) {
  cfgContent = cfgContent.replace(oldRemedCode, newRemedCode);
  console.log('Connected .opm-remediate-btn to showNcmRemediationModal');
}

// Add Distributed Probe WAN Latency Matrix in Settings -> Probes
const matrixHtml = `            <!-- Distributed Probe WAN Latency Matrix -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Distributed Probe WAN Latency Matrix (Continuous RTT Telemetry)</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Round-trip transit times monitored between Central Master (10.0.0.10) and all distributed geographical Probes.</div>
                </div>
                <button id="opm-run-wan-mesh-btn" style="background: #0070e0; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                  ⚡ Run WAN Mesh RTT Poll
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; border-top: 3px solid #0070e0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 12px;">New York Data Center</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; font-weight: 700; padding: 1px 5px; border-radius: 2px;">OPTIMAL</span>
                  </div>
                  <div id="opm-matrix-ny" style="font-size: 20px; font-weight: 800; color: #0284c7; margin: 6px 0;">12.4 ms</div>
                  <div style="font-size: 10px; color: #64748b;">RTT Min/Avg/Max: 11.8 / 12.4 / 13.1 ms &bull; 0% Loss</div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; border-top: 3px solid #16a34a;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 12px;">London Branch Office</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; font-weight: 700; padding: 1px 5px; border-radius: 2px;">OPTIMAL</span>
                  </div>
                  <div id="opm-matrix-lon" style="font-size: 20px; font-weight: 800; color: #16a34a; margin: 6px 0;">28.1 ms</div>
                  <div style="font-size: 10px; color: #64748b;">RTT Min/Avg/Max: 27.2 / 28.1 / 29.5 ms &bull; 0% Loss</div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; border-top: 3px solid #ea580c;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 12px;">Dubai Campus Core</span>
                    <span style="font-size: 10px; background: #ffedd5; color: #9a3412; font-weight: 700; padding: 1px 5px; border-radius: 2px;">JITTER ALERT</span>
                  </div>
                  <div id="opm-matrix-dxb" style="font-size: 20px; font-weight: 800; color: #ea580c; margin: 6px 0;">18.2 ms</div>
                  <div style="font-size: 10px; color: #64748b;">RTT Min/Avg/Max: 17.5 / 18.2 / 24.8 ms &bull; 1.2% Loss</div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; border-top: 3px solid #7c3aed;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 12px;">Singapore Cloud VPC</span>
                    <span style="font-size: 10px; background: #dcfce7; color: #166534; font-weight: 700; padding: 1px 5px; border-radius: 2px;">OPTIMAL</span>
                  </div>
                  <div id="opm-matrix-sg" style="font-size: 20px; font-weight: 800; color: #7c3aed; margin: 6px 0;">45.0 ms</div>
                  <div style="font-size: 10px; color: #64748b;">RTT Min/Avg/Max: 44.1 / 45.0 / 46.8 ms &bull; 0% Loss</div>
                </div>
              </div>
            </div>`;

if (!cfgContent.includes('Distributed Probe WAN Latency Matrix')) {
  cfgContent = cfgContent.replace(
    '<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">\n              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">OpManager Central Master Node &amp; Distributed Probe Architecture</div>',
    `${matrixHtml}\n\n            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">\n              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">OpManager Central Master Node &amp; Distributed Probe Architecture</div>`
  );

  // Wire #opm-run-wan-mesh-btn in event listeners
  const meshBtnWiring = `    const meshBtn = container.querySelector('#opm-run-wan-mesh-btn');
    if (meshBtn) {
      meshBtn.onclick = () => {
        meshBtn.disabled = true;
        meshBtn.innerText = 'Testing WAN Mesh...';
        setTimeout(() => {
          const ny = container.querySelector('#opm-matrix-ny');
          const lon = container.querySelector('#opm-matrix-lon');
          const dxb = container.querySelector('#opm-matrix-dxb');
          const sg = container.querySelector('#opm-matrix-sg');
          if (ny) ny.innerText = (12 + (Math.random()*0.8 - 0.4)).toFixed(1) + ' ms';
          if (lon) lon.innerText = (28 + (Math.random()*1.2 - 0.6)).toFixed(1) + ' ms';
          if (dxb) dxb.innerText = (18 + (Math.random()*1.5 - 0.7)).toFixed(1) + ' ms';
          if (sg) sg.innerText = (45 + (Math.random()*2.0 - 1.0)).toFixed(1) + ' ms';
          meshBtn.disabled = false;
          meshBtn.innerText = '⚡ Run WAN Mesh RTT Poll';
          showToast('Multi-Probe WAN Mesh RTT poll completed. 4/4 Probes verified.');
        }, 600);
      };
    }`;

  cfgContent = cfgContent.replace(
    '// User Subtab listeners',
    `${meshBtnWiring}\n\n    // User Subtab listeners`
  );

  fs.writeFileSync(cfgPath, cfgContent, 'utf8');
  console.log('Added Distributed Probe WAN Latency Matrix to 05_views_config_reports_settings.js');
}

// --- 3. PATCH 06_router_and_init.js ---
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('showNcmRemediationModal,')) {
  routerContent = routerContent.replace(
    'showReportPdfModal,',
    'showReportPdfModal,\n    showNcmRemediationModal,\n    showWanLinkDetailsModal,'
  );
  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('Exported showNcmRemediationModal and showWanLinkDetailsModal on OpManagerSuite');
}
