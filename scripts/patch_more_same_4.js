const fs = require('fs');

// --- 1. PATCH 02_branding_and_modals.js ---
const modalsPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js';
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

const nfaModalCode = `
  // -------------------------------------------------------------
  // MODAL: NETFLOW ANALYZER RAW FLOW RECORDS STREAM
  // -------------------------------------------------------------
  function showNetFlowRawRecordsModal(convData) {
    let modal = document.getElementById('opm-nfa-records-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'opm-nfa-records-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: Roboto, -apple-system, sans-serif;';
      document.body.appendChild(modal);
    }

    const records = [
      { time: '14:20:01.412', src: '10.10.1.50:5432', dst: '10.20.1.50:5432', proto: 'TCP (06)', app: 'PostgreSQL_Sync', bytes: '18.42 MB', pkts: '12,840', flags: 'ACK, PSH', nextHop: '10.40.1.1', dscp: 'AF41 (Priority)' },
      { time: '14:20:00.890', src: '10.40.1.50:443', dst: '172.217.14.206:58210', proto: 'TCP (06)', app: 'HTTPS_SSL', bytes: '14.19 MB', pkts: '9,410', flags: 'ACK', nextHop: '10.10.0.1', dscp: 'CS0 (Default)' },
      { time: '14:19:59.124', src: '10.10.1.1:500', dst: '10.30.1.1:500', proto: 'UDP (17)', app: 'IPSec_ESP', bytes: '9.84 MB', pkts: '6,720', flags: '-', nextHop: '10.0.0.1', dscp: 'CS6 (Routing)' },
      { time: '14:19:57.652', src: '10.20.1.10:445', dst: '10.20.1.50:49280', proto: 'TCP (06)', app: 'SMBv3_Storage', bytes: '6.12 MB', pkts: '4,180', flags: 'ACK, PSH', nextHop: 'Direct', dscp: 'AF12 (Bulk)' },
      { time: '14:19:55.318', src: '10.40.1.1:179', dst: '192.168.10.1:179', proto: 'TCP (06)', app: 'BGP_Routing', bytes: '1.24 MB', pkts: '840', flags: 'ACK', nextHop: '10.40.1.1', dscp: 'CS6 (Control)' },
      { time: '14:19:52.109', src: '10.10.1.50:53', dst: '8.8.8.8:53', proto: 'UDP (17)', app: 'DNS_Query', bytes: '420 KB', pkts: '3,100', flags: '-', nextHop: '10.10.0.1', dscp: 'CS0 (Default)' }
    ];

    modal.innerHTML = \`
      <div style="background: #ffffff; border-radius: 8px; width: 1040px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: #0070e0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800;">NFA</div>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a;">ManageEngine NetFlow Analyzer &bull; Raw Flow Records Stream</div>
              <div style="font-size: 11px; color: #64748b;">UDP 2055 / 9996 Ingestion &bull; Monitored on <strong style="color: #0070e0;">NY-CORE-RTR-01 (TenGigE0/0/0/0)</strong> &bull; IPFIX v10</div>
            </div>
          </div>
          <button id="close-nfa-records-btn" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;" title="Close">✕</button>
        </div>

        <!-- Filter Bar -->
        <div style="padding: 10px 24px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #334155; font-weight: 700;">Filter Streams:</span>
            <input type="text" id="nfa-filter-input" placeholder="Search IP, Port or App..." style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; width: 220px; outline: none;">
            <select id="nfa-proto-select" style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; background: #fff;">
              <option value="all">All Protocols (TCP/UDP/ICMP)</option>
              <option value="tcp">TCP (06)</option>
              <option value="udp">UDP (17)</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="nfa-export-pcap-btn" style="background: #0070e0; color: #ffffff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Export PCAP / Flow CSV</button>
          </div>
        </div>

        <!-- Flow Records Table -->
        <div style="flex: 1; overflow-y: auto; padding: 14px 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left; font-weight: 700;">
                <th style="padding: 8px 10px;">Time</th>
                <th style="padding: 8px 10px;">Source (IP:Port)</th>
                <th style="padding: 8px 10px;">Destination (IP:Port)</th>
                <th style="padding: 8px 10px;">Protocol</th>
                <th style="padding: 8px 10px;">Application</th>
                <th style="padding: 8px 10px;">Volume / Pkts</th>
                <th style="padding: 8px 10px;">TCP Flags</th>
                <th style="padding: 8px 10px;">Next Hop</th>
                <th style="padding: 8px 10px;">DSCP QoS</th>
              </tr>
            </thead>
            <tbody id="nfa-records-tbody">
              \${records.map(r => \`
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 10px; font-family: monospace; color: #64748b;">\${r.time}</td>
                  <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0284c7;">\${r.src}</td>
                  <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0f172a;">\${r.dst}</td>
                  <td style="padding: 8px 10px;"><span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-weight: 600;">\${r.proto}</span></td>
                  <td style="padding: 8px 10px; font-weight: 600; color: #16a34a;">\${r.app}</td>
                  <td style="padding: 8px 10px; font-weight: 700;">\${r.bytes} <span style="font-size: 10px; color: #64748b;">(\${r.pkts})</span></td>
                  <td style="padding: 8px 10px; font-family: monospace; color: #475569;">\${r.flags}</td>
                  <td style="padding: 8px 10px; font-family: monospace; color: #64748b;">\${r.nextHop}</td>
                  <td style="padding: 8px 10px;"><span style="background: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 2px;">\${r.dscp}</span></td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 10px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <span>ManageEngine NetFlow Collector Engine &bull; UDP Listener Rate: <strong>1,480 flows/sec</strong> &bull; Zero Drops</span>
          <button id="nfa-close-btn-bottom" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; color: #334155;">Close Stream</button>
        </div>
      </div>
    \`;

    modal.style.display = 'flex';
    modal.querySelector('#close-nfa-records-btn').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-close-btn-bottom').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#nfa-export-pcap-btn').onclick = () => {
      showToast('Exported NetFlow IPFIX packet capture (PCAP) archive.');
    };
  }
`;

if (!modalsContent.includes('showNetFlowRawRecordsModal')) {
  modalsContent = modalsContent.replace(
    '// --- TRAINING VIDEOS MODAL ---',
    `${nfaModalCode}\n\n  // --- TRAINING VIDEOS MODAL ---`
  );
  console.log('Added showNetFlowRawRecordsModal to 02_branding_and_modals.js');
}

// Add Live Latency Waveform to activeModalTab === 'diagnostics' in showDeviceSnapshotModal
const waveformHtml = `
            <!-- Live ICMP Ping Waveform & Oscilloscope Strip -->
            <div style="background: #161b22; border-bottom: 1px solid #30363d; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 14px; font-size: 11px;">
                <span style="color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 5px;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e;"></span>
                  Continuous ICMP Waveform:
                </span>
                <span style="color: #c9d1d9;">Min: <strong style="color: #4ade80;">\${(dev.responseTime - 0.4).toFixed(1)}ms</strong></span>
                <span style="color: #c9d1d9;">Avg: <strong style="color: #38bdf8;">\${dev.responseTime}ms</strong></span>
                <span style="color: #c9d1d9;">Max: <strong style="color: #fca5a5;">\${(dev.responseTime + 0.7).toFixed(1)}ms</strong></span>
                <span style="color: #c9d1d9;">Jitter: <strong style="color: #34d399;">0.4ms</strong></span>
                <span style="color: #c9d1d9;">Loss: <strong style="color: #4ade80;">0.0%</strong></span>
              </div>
              <span style="font-size: 10px; background: #238636; color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 700;">LIVE TELEMETRY</span>
            </div>
            <div style="background: #090d16; padding: 6px 16px; border-bottom: 1px solid #30363d;">
              <svg width="100%" height="40" viewBox="0 0 700 40" style="overflow: visible;">
                <line x1="0" y1="10" x2="700" y2="10" stroke="#21262d" stroke-width="1" />
                <line x1="0" y1="25" x2="700" y2="25" stroke="#21262d" stroke-width="1" />
                <polyline points="10,25 60,22 110,24 160,20 210,23 260,18 310,24 360,21 410,25 460,19 510,23 560,21 610,24 660,20 690,22" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                <polygon points="10,38 10,25 60,22 110,24 160,20 210,23 260,18 310,24 360,21 410,25 460,19 510,23 560,21 610,24 660,20 690,22 690,38" fill="rgba(56, 189, 248, 0.12)" />
                <circle cx="690" cy="22" r="3.5" fill="#38bdf8" />
              </svg>
            </div>
`;

if (!modalsContent.includes('Continuous ICMP Waveform:')) {
  modalsContent = modalsContent.replace(
    '<div id="cli-terminal-screen"',
    `${waveformHtml}\n            <div id="cli-terminal-screen"`
  );
  console.log('Added live ICMP waveform to showDeviceSnapshotModal in 02_branding_and_modals.js');
}

fs.writeFileSync(modalsPath, modalsContent, 'utf8');

// --- 2. PATCH 03_views_dashboard_inventory.js: Add NetFlow Drilldown click event ---
const invPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js';
let invContent = fs.readFileSync(invPath, 'utf8');

if (!invContent.includes('opm-nfa-conv-row')) {
  invContent = invContent.replace(
    '<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace;">10.10.1.50</td>',
    '<tr class="opm-nfa-conv-row" style="border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'transparent\'"><td style="padding: 7px 4px; font-family: monospace;">10.10.1.50</td>'
  );
  invContent = invContent.replace(
    '<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 7px 4px; font-family: monospace;">10.40.1.50</td>',
    '<tr class="opm-nfa-conv-row" style="border-bottom: 1px solid #f1f5f9; cursor: pointer;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'transparent\'"><td style="padding: 7px 4px; font-family: monospace;">10.40.1.50</td>'
  );

  const nfaRowListener = `    // NetFlow raw flow records drilldown listener
    container.querySelectorAll('.opm-nfa-conv-row').forEach(row => {
      row.onclick = () => {
        if (typeof showNetFlowRawRecordsModal === 'function') {
          showNetFlowRawRecordsModal();
        }
      };
    });`;

  invContent = invContent.replace(
    '// Bulk actions buttons',
    `${nfaRowListener}\n\n    // Bulk actions buttons`
  );

  fs.writeFileSync(invPath, invContent, 'utf8');
  console.log('Added NetFlow conversation click listener in 03_views_dashboard_inventory.js');
}

// --- 3. PATCH 06_router_and_init.js: Export showNetFlowRawRecordsModal ---
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('showNetFlowRawRecordsModal,')) {
  routerContent = routerContent.replace(
    'showSnmpTrapSimulatorModal,',
    'showSnmpTrapSimulatorModal,\n    showNetFlowRawRecordsModal,'
  );
  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('Exported showNetFlowRawRecordsModal on OpManagerSuite');
}
