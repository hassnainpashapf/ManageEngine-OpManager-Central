#!/usr/bin/env python3
import os

target_path = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js"

with open(target_path, "a", encoding="utf-8") as f:
    f.write(r'''
  // -------------------------------------------------------------
  // VIEW 2: INVENTORY
  // -------------------------------------------------------------
  function renderInventoryView(container) {
    const currentSub = state.subTabs.inventory || 'devices';

    let inventoryBody = '';

    if (currentSub === 'devices') {
      const q = (state.searchQuery || '').toLowerCase().trim();
      let displayed = state.devices.filter(d => {
        if (state.selectedProbe !== 'all' && String(d.probeId) !== String(state.selectedProbe)) return false;
        if (state.inventoryFilter !== 'all' && d.category.toLowerCase() !== state.inventoryFilter.toLowerCase()) return false;
        if (q) {
          return d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.type.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q);
        }
        return true;
      });

      inventoryBody = `
        <!-- Filter chips bar -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center; flex-wrap: wrap;">
          ${[
            { key: 'all', label: `ALL (${state.devices.length})` },
            { key: 'routers', label: `ROUTERS (${state.devices.filter(d => d.category === 'Routers').length})` },
            { key: 'switches', label: `SWITCHES (${state.devices.filter(d => d.category === 'Switches').length})` },
            { key: 'firewalls', label: `FIREWALLS (${state.devices.filter(d => d.category === 'Firewalls').length})` },
            { key: 'servers', label: `SERVERS (${state.devices.filter(d => d.category === 'Servers').length})` },
            { key: 'wireless', label: `WIRELESS (${state.devices.filter(d => d.category === 'Wireless').length})` },
            { key: 'storage', label: `STORAGE (${state.devices.filter(d => d.category === 'Storage').length})` }
          ].map(chip => {
            const isChipActive = state.inventoryFilter.toLowerCase() === chip.key.toLowerCase();
            return `
              <button class="inv-filter-chip" data-filter="${chip.key}" style="background: ${isChipActive ? '#0070e0' : '#ffffff'}; color: ${isChipActive ? '#ffffff' : '#475569'}; border: 1px solid ${isChipActive ? '#0070e0' : '#cbd5e1'}; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                ${chip.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Sticky Bulk Actions Bar -->
        <div id="sticky-bulk-bar" style="display: ${state.selectedDeviceCheckboxCount > 0 ? 'flex' : 'none'}; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 4px; margin-bottom: 14px; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: fadeIn 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600;">
            <span style="background: #0284c7; padding: 2px 8px; border-radius: 3px; font-size: 11px;">${state.selectedDeviceCheckboxCount} Device(s) Selected</span>
            <span>Bulk Enterprise Actions:</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="bulk-ack-btn" style="background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">✔ Acknowledge Alarms</button>
            <button id="bulk-snmp-btn" style="background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">⚡ Test SNMP Credentials</button>
            <button id="bulk-rediscover-btn" style="background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">🔄 Rediscover Selected</button>
            <button id="bulk-backup-btn" style="background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">💾 Backup Configurations</button>
            <button id="bulk-deselect-btn" style="background: transparent; color: #94a3b8; border: none; font-size: 11px; cursor: pointer;">✕ Deselect</button>
          </div>
        </div>

        <!-- Inventory Data Table -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: Roboto, -apple-system, sans-serif;">
            <thead>
              <tr style="background: #ffffff; border-bottom: 2px solid #edf2f7; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                <th style="padding: 10px 14px; width: 36px; text-align: center;"><input type="checkbox" id="inv-select-all" style="cursor: pointer;"></th>
                <th style="padding: 10px 14px; text-align: left; width: 100px;">Status</th>
                <th style="padding: 10px 14px; text-align: left;">Device Name</th>
                <th style="padding: 10px 14px; text-align: left;">IP Address</th>
                <th style="padding: 10px 14px; text-align: left;">Category</th>
                <th style="padding: 10px 14px; text-align: left;">Remote Probe</th>
                <th style="padding: 10px 14px; text-align: left;">Vendor & Model</th>
                <th style="padding: 10px 14px; text-align: left;">CPU %</th>
                <th style="padding: 10px 14px; text-align: left;">Memory %</th>
                <th style="padding: 10px 14px; text-align: left;">Availability</th>
                <th style="padding: 10px 14px; text-align: center; width: 80px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${displayed.length === 0 ? `
                <tr><td colspan="11" style="padding: 30px; text-align: center; color: #94a3b8; font-size: 13px;">No devices matching your filter criteria.</td></tr>
              ` : displayed.map(d => `
                <tr class="inv-device-row" style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 10px 14px; text-align: center;">
                    <input type="checkbox" class="inv-row-cbox" data-id="${d.id}" style="cursor: pointer;">
                  </td>
                  <td style="padding: 10px 14px;">${getStatusBadge(d.status)}</td>
                  <td style="padding: 10px 14px; font-weight: 600;">
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                      ${getCategoryIcon(d.category)}
                      <a href="javascript:void(0)" class="device-name-click" data-name="${d.name}" style="color: #0070e0; text-decoration: none;">${d.name}</a>
                    </span>
                  </td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #475569;">${d.ip}</td>
                  <td style="padding: 10px 14px; color: #1e293b;"><span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-weight: 500;">${d.category}</span></td>
                  <td style="padding: 10px 14px;">
                    <span style="font-size: 11px; font-weight: 600; color: #0284c7; background: #f0f9ff; border: 1px solid #e0f2fe; padding: 2px 6px; border-radius: 3px;">${d.probe}</span>
                  </td>
                  <td style="padding: 10px 14px; color: #334155;">
                    ${getVendorBadge(d.vendor)}
                    <span style="margin-left: 6px; font-size: 11px;">${d.type}</span>
                  </td>
                  <td style="padding: 10px 14px; font-weight: 700; color: ${d.cpu >= 90 ? '#dc2626' : d.cpu >= 75 ? '#ea580c' : '#16a34a'};">${d.cpu}%</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: ${d.memory >= 90 ? '#dc2626' : d.memory >= 75 ? '#ea580c' : '#16a34a'};">${d.memory}%</td>
                  <td style="padding: 10px 14px; font-weight: 600; color: #16a34a;">${d.availability}</td>
                  <td style="padding: 10px 14px; text-align: center;">
                    <button class="device-name-click" data-name="${d.name}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #0070e0; cursor: pointer;">
                      Snapshot
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Authentic Pagination Toolbar -->
          <div style="background: #ffffff; border-top: 1px solid #e2e8f0; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
            <div>Showing 1 - ${displayed.length} of ${displayed.length} records</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>Page 1 of 1</span>
              <button style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 7px; color: #94a3b8; cursor: not-allowed;">&lt;&lt;</button>
              <button style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 7px; color: #94a3b8; cursor: not-allowed;">&lt;</button>
              <span style="background: #0070e0; color: #ffffff; border-radius: 3px; padding: 2px 8px; font-weight: 700;">1</span>
              <button style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 7px; color: #94a3b8; cursor: not-allowed;">&gt;</button>
              <button style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 7px; color: #94a3b8; cursor: not-allowed;">&gt;&gt;</button>
              <span style="margin-left: 8px;">Rows per page: 25 ▾</span>
            </div>
          </div>
        </div>
      `;
    } else if (currentSub === 'interfaces') {
      inventoryBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="padding: 14px 18px; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Monitored Enterprise Interfaces (48 Total Ports)</span>
            <span style="font-size: 11px; color: #16a34a; font-weight: 600;">● Polling Interval: 60s</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 9px 14px; text-align: left;">Interface Name</th>
                <th style="padding: 9px 14px; text-align: left;">Monitored Device</th>
                <th style="padding: 9px 14px; text-align: left;">Remote Probe</th>
                <th style="padding: 9px 14px; text-align: left;">Speed</th>
                <th style="padding: 9px 14px; text-align: left;">Inbound Rate</th>
                <th style="padding: 9px 14px; text-align: left;">Outbound Rate</th>
                <th style="padding: 9px 14px; text-align: left;">Errors</th>
                <th style="padding: 9px 14px; text-align: left;">Oper Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.topInterfaces.map(iface => `
                <tr style="border-bottom: 1px solid #f8fafc;">
                  <td style="padding: 9px 14px; font-weight: 600; color: #0070e0;">${iface.name}</td>
                  <td style="padding: 9px 14px; color: #334155;">${iface.device}</td>
                  <td style="padding: 9px 14px; color: #64748b;">${iface.probe}</td>
                  <td style="padding: 9px 14px; color: #475569;">${iface.speed}</td>
                  <td style="padding: 9px 14px; font-family: monospace; color: #16a34a;">${iface.inTraffic} Mbps (${iface.inPercent}%)</td>
                  <td style="padding: 9px 14px; font-family: monospace; color: #0284c7;">${iface.outTraffic} Mbps (${iface.outPercent}%)</td>
                  <td style="padding: 9px 14px; color: ${iface.errors > 0 ? '#dc2626' : '#64748b'}; font-weight: ${iface.errors > 0 ? '700' : 'normal'};">${iface.errors}</td>
                  <td style="padding: 9px 14px;">
                    <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 2px; ${iface.status === 'UP' ? 'background:#dcfce7;color:#166534;' : 'background:#fee2e2;color:#991b1b;'}">${iface.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentSub === 'probes') {
      inventoryBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="padding: 14px 18px; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 700; color: #1e293b;">Distributed Remote Probes (OpManager Central Architecture)</span>
            <button id="add-probe-inv-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Register Remote Probe</button>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 9px 14px; text-align: left;">Probe Name</th>
                <th style="padding: 9px 14px; text-align: left;">Datacenter Location</th>
                <th style="padding: 9px 14px; text-align: left;">Host IP</th>
                <th style="padding: 9px 14px; text-align: left;">Comm Port</th>
                <th style="padding: 9px 14px; text-align: left;">Heartbeat RTT</th>
                <th style="padding: 9px 14px; text-align: left;">Assets</th>
                <th style="padding: 9px 14px; text-align: left;">Sync State</th>
                <th style="padding: 9px 14px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.probes.map(p => `
                <tr style="border-bottom: 1px solid #f8fafc;">
                  <td style="padding: 9px 14px; font-weight: 600; color: #0070e0;">
                    <span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 4px; border-radius: 2px; margin-right: 6px;">${p.flag}</span>
                    ${p.name}
                  </td>
                  <td style="padding: 9px 14px; color: #475569;">${p.location}</td>
                  <td style="padding: 9px 14px; font-family: monospace; color: #334155;">${p.ip}</td>
                  <td style="padding: 9px 14px; color: #64748b;">TCP ${p.commPort}</td>
                  <td style="padding: 9px 14px; color: #16a34a; font-weight: 600;">${p.latency} ms</td>
                  <td style="padding: 9px 14px; color: #0f172a; font-weight: 700;">${p.devicesCount} Monitored</td>
                  <td style="padding: 9px 14px; color: #0284c7; font-weight: 600;">✓ Synchronized</td>
                  <td style="padding: 9px 14px; text-align: center;">
                    <button class="probe-sync-btn" data-name="${p.name}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #0070e0; cursor: pointer;">
                      Sync Now
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      inventoryBody = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Specialized Monitored Inventory</div>
          <p style="font-size: 12px; color: #64748b;">Displaying active asset nodes across storage pools, hypervisors, and SAN controllers.</p>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Sub-tabs strip -->
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'devices', label: `Devices (${state.devices.length})` },
            { key: 'interfaces', label: 'Interfaces (48)' },
            { key: 'probes', label: `Enterprise Probes (${state.probes.length})` },
            { key: 'virtualization', label: 'Virtualization (4)' },
            { key: 'storage', label: 'Storage (1)' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="inv-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="text" id="inv-search-input" placeholder="Search devices, IP, vendor..." value="${state.searchQuery || ''}" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 10px; font-size: 12px; width: 220px; outline: none;">
          <button id="add-device-btn" style="background: #0070e0; color: #ffffff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">
            + Add Device
          </button>
          <button id="inv-actions-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 10px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
            Actions ▾
          </button>
          <button id="inv-export-btn" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 10px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
            Export ▾
          </button>
        </div>
      </div>

      <!-- Main Inventory Content -->
      <div style="padding: 20px; max-width: 1760px; margin: 0 auto; font-family: Roboto, -apple-system, sans-serif;">
        ${inventoryBody}
      </div>
    `;

    // Hook Subtabs click
    container.querySelectorAll('.inv-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.inventory = el.getAttribute('data-sub');
        renderInventoryView(container);
      };
    });

    // Hook Filter chips
    container.querySelectorAll('.inv-filter-chip').forEach(el => {
      el.onclick = () => {
        state.inventoryFilter = el.getAttribute('data-filter');
        renderInventoryView(container);
      };
    });

    // Hook Search Input with Debounce
    const searchInput = container.querySelector('#inv-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        const q = state.searchQuery.toLowerCase().trim();
        const rows = container.querySelectorAll('.inv-device-row');
        rows.forEach(r => {
          const text = r.innerText.toLowerCase();
          r.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    // Hook Select All Checkbox
    const selectAll = container.querySelector('#inv-select-all');
    if (selectAll) {
      selectAll.onchange = (e) => {
        const checked = e.target.checked;
        container.querySelectorAll('.inv-row-cbox').forEach(cb => {
          cb.checked = checked;
        });
        state.selectedDeviceCheckboxCount = checked ? state.devices.length : 0;
        const bulkBar = container.querySelector('#sticky-bulk-bar');
        if (bulkBar) bulkBar.style.display = checked ? 'flex' : 'none';
      };
    }

    // Hook Individual Row Checkboxes
    container.querySelectorAll('.inv-row-cbox').forEach(cb => {
      cb.onchange = () => {
        const checkedCount = container.querySelectorAll('.inv-row-cbox:checked').length;
        state.selectedDeviceCheckboxCount = checkedCount;
        const bulkBar = container.querySelector('#sticky-bulk-bar');
        if (bulkBar) bulkBar.style.display = checkedCount > 0 ? 'flex' : 'none';
      };
    });

    // Hook Bulk Actions
    const bulkDeselect = container.querySelector('#bulk-deselect-btn');
    if (bulkDeselect) {
      bulkDeselect.onclick = () => {
        container.querySelectorAll('.inv-row-cbox').forEach(cb => { cb.checked = false; });
        if (selectAll) selectAll.checked = false;
        state.selectedDeviceCheckboxCount = 0;
        const bulkBar = container.querySelector('#sticky-bulk-bar');
        if (bulkBar) bulkBar.style.display = 'none';
      };
    }

    const bulkSnmp = container.querySelector('#bulk-snmp-btn');
    if (bulkSnmp) {
      bulkSnmp.onclick = () => {
        showToast(`Testing SNMP v2c credentials on ${state.selectedDeviceCheckboxCount} devices... Success!`);
      };
    }

    const bulkBackup = container.querySelector('#bulk-backup-btn');
    if (bulkBackup) {
      bulkBackup.onclick = () => {
        showToast(`Initiating NCM backup on ${state.selectedDeviceCheckboxCount} devices... Done.`);
      };
    }

    // Hook Device Name Snapshot clicks
    container.querySelectorAll('.device-name-click').forEach(el => {
      el.onclick = () => {
        const name = el.getAttribute('data-name');
        const dev = state.devices.find(d => d.name === name);
        if (dev) showDeviceSnapshotModal(dev);
      };
    });

    // Hook Add Device Button
    const addDevBtn = container.querySelector('#add-device-btn');
    if (addDevBtn) addDevBtn.onclick = () => showAddDeviceModal();

    // Hook Export Button
    const exportBtn = container.querySelector('#inv-export-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        showToast('Exporting OpManager Central inventory to CSV...');
      };
    }
  }

  // -------------------------------------------------------------
  // VIEW 3: ALARMS (FULL ENTERPRISE GRID & LIST MODES)
  // -------------------------------------------------------------
  function renderAlarmsView(container) {
    const currentSub = state.subTabs.alarms || 'active';
    const activeSevFilter = state.alarmsSeverityFilter || 'all';

    let filteredAlarms = state.alarms;
    if (activeSevFilter !== 'all') {
      filteredAlarms = filteredAlarms.filter(a => a.severity.toLowerCase() === activeSevFilter.toLowerCase());
    }

    const critCount = state.alarms.filter(a => a.severity === 'Critical').length;
    const trbCount = state.alarms.filter(a => a.severity === 'Trouble').length;
    const attnCount = state.alarms.filter(a => a.severity === 'Attention').length;
    const clrCount = 10;

    container.innerHTML = `
      <!-- Alarms Subtabs & Actions Bar -->
      <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-family: Roboto, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; gap: 4px; height: 100%;">
          ${[
            { key: 'active', label: `Active Alarms (${state.alarms.length})` },
            { key: 'all', label: `All Alarms (${state.alarms.length + clrCount})` },
            { key: 'events', label: 'Events (3,420)' },
            { key: 'custom', label: 'Custom Views' }
          ].map(tab => {
            const isActive = currentSub === tab.key;
            return `
              <div class="alarm-subtab" data-sub="${tab.key}" style="padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; font-weight: ${isActive ? '600' : '500'}; color: ${isActive ? '#0070e0' : '#64748b'}; border-bottom: ${isActive ? '2px solid #0070e0' : 'none'}; cursor: pointer;">
                ${tab.label}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="alarms-zia-btn" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <span>✨ Summarize (Zia AI)</span>
          </button>
          <select id="alarms-view-toggle" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer; outline: none;">
            <option value="list" ${state.alarmsViewMode === 'list' ? 'selected' : ''}>List View</option>
            <option value="table" ${state.alarmsViewMode === 'table' ? 'selected' : ''}>Table View (Grid)</option>
          </select>
        </div>
      </div>

      <!-- Main Layout: Left Severity Sidebar + Right Alarms Content -->
      <div style="display: flex; min-height: calc(100vh - 134px); font-family: Roboto, -apple-system, sans-serif;">
        <!-- Left Severity Dials Sidebar -->
        <div style="width: 76px; background: #ffffff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 8px;">
          ${[
            { key: 'all', count: state.alarms.length, label: 'All', color: '#0070e0', bg: '#e0f2fe', icon: '🔔' },
            { key: 'critical', count: critCount, label: 'Critical', color: '#dc2626', bg: '#fee2e2', icon: '✕' },
            { key: 'trouble', count: trbCount, label: 'Trouble', color: '#ea580c', bg: '#ffedd5', icon: '!' },
            { key: 'attention', count: attnCount, label: 'Attention', color: '#ca8a04', bg: '#fef9c3', icon: '!' },
            { key: 'servicedown', count: 0, label: 'Down', color: '#7d41db', bg: '#f3e8ff', icon: '↓' },
            { key: 'clear', count: clrCount, label: 'Clear', color: '#16a34a', bg: '#dcfce7', icon: '✓' }
          ].map(dial => {
            const isDialActive = activeSevFilter === dial.key;
            return `
              <div class="alarm-dial-btn" data-key="${dial.key}" title="${dial.label} (${dial.count})" style="width: 54px; padding: 8px 4px; border-radius: 6px; text-align: center; cursor: pointer; border: ${isDialActive ? `2px solid ${dial.color}` : '1px solid #edf2f7'}; background: ${isDialActive ? dial.bg : '#ffffff'}; transition: all 0.2s ease;">
                <div style="font-size: 13px; font-weight: 800; color: ${dial.color}; line-height: 1;">${dial.icon}</div>
                <div style="font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 4px;">${dial.count}</div>
                <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">${dial.label}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right Content: Alarms Records -->
        <div style="flex: 1; padding: 16px 20px; background: #f8fafc; overflow-y: auto;">
          <!-- Active filter status strip -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: #1e293b;">Active Alarms (${filteredAlarms.length})</span>
              ${activeSevFilter !== 'all' ? `
                <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 600;">
                  Filter: ${activeSevFilter.toUpperCase()} <span class="clear-sev-filter" style="cursor: pointer; margin-left: 4px;">✕</span>
                </span>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: #64748b;">
              Showing alerts correlated across New York, London, Singapore, and Dubai Probes
            </div>
          </div>

          ${state.alarmsViewMode === 'table' ? `
            <!-- Table View Grid -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #fcfdfe; border-bottom: 1px solid #edf2f7; color: #64748b; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 14px; text-align: left; width: 110px;">Severity</th>
                    <th style="padding: 10px 14px; text-align: left;">Device Name</th>
                    <th style="padding: 10px 14px; text-align: left;">Monitored Entity</th>
                    <th style="padding: 10px 14px; text-align: left;">Message</th>
                    <th style="padding: 10px 14px; text-align: left;">Remote Probe</th>
                    <th style="padding: 10px 14px; text-align: left;">Occurred</th>
                    <th style="padding: 10px 14px; text-align: left;">Technician</th>
                    <th style="padding: 10px 14px; text-align: center; width: 80px;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredAlarms.map(a => `
                    <tr class="alarm-row-item" data-id="${a.id}" style="border-bottom: 1px solid #f8fafc; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 10px 14px;">${getStatusBadge(a.severity)}</td>
                      <td style="padding: 10px 14px; font-weight: 700;">
                        <a href="javascript:void(0)" class="device-name-click" data-name="${a.device}" style="color: #0070e0; text-decoration: none;">${a.device}</a>
                      </td>
                      <td style="padding: 10px 14px; color: #475569; font-weight: 500;">${a.entity}</td>
                      <td style="padding: 10px 14px; color: #1e293b; max-width: 380px;">${a.message}</td>
                      <td style="padding: 10px 14px; color: #0284c7; font-weight: 600;">${a.probe}</td>
                      <td style="padding: 10px 14px; color: #64748b;">${a.time}</td>
                      <td style="padding: 10px 14px;">
                        <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px; ${a.technician.includes('Unacknowledged') ? 'background:#fee2e2;color:#991b1b;' : 'background:#dcfce7;color:#166534;'}">${a.technician}</span>
                      </td>
                      <td style="padding: 10px 14px; text-align: center;">
                        <button class="alarm-ack-quick-btn" data-id="${a.id}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #15803d; cursor: pointer;">
                          Ack
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <!-- List View Mode (Card Rows) -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${filteredAlarms.map(a => {
                const borderColors = { 'Critical': '#dc2626', 'Trouble': '#ea580c', 'Attention': '#ca8a04', 'Clear': '#16a34a' };
                const bColor = borderColors[a.severity] || '#0070e0';
                return `
                  <div class="alarm-row-item" data-id="${a.id}" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid ${bColor}; border-radius: 4px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.03); cursor: pointer; transition: all 0.2s ease;">
                    <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
                      <div>${getStatusBadge(a.severity)}</div>
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                          <a href="javascript:void(0)" class="device-name-click" data-name="${a.device}" style="font-size: 13px; font-weight: 700; color: #0070e0; text-decoration: none;">${a.device}</a>
                          <span style="font-size: 11px; background: #f1f5f9; color: #475569; padding: 1px 6px; border-radius: 3px;">${a.category}</span>
                          <span style="font-size: 11px; color: #64748b;">${a.ip}</span>
                          <span style="font-size: 11px; color: #0284c7; font-weight: 600;">• ${a.probe}</span>
                        </div>
                        <div style="font-size: 12px; color: #1e293b; font-weight: 500;">${a.message}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Entity: <span style="color: #334155; font-weight: 600;">${a.entity}</span></div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <div style="text-align: right;">
                        <div style="font-size: 11px; color: #64748b;">${a.time}</div>
                        <div style="font-size: 10px; font-weight: 600; margin-top: 2px; color: ${a.technician.includes('Unacknowledged') ? '#dc2626' : '#16a34a'};">${a.technician}</div>
                      </div>
                      <button class="alarm-ack-quick-btn" data-id="${a.id}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #15803d; cursor: pointer;">
                        ✔ Ack
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Hook Alarms Subtabs
    container.querySelectorAll('.alarm-subtab').forEach(el => {
      el.onclick = () => {
        state.subTabs.alarms = el.getAttribute('data-sub');
        renderAlarmsView(container);
      };
    });

    // Hook Severity Dials click
    container.querySelectorAll('.alarm-dial-btn').forEach(el => {
      el.onclick = () => {
        state.alarmsSeverityFilter = el.getAttribute('data-key');
        renderAlarmsView(container);
      };
    });

    // Hook Clear Filter
    const clrFilter = container.querySelector('.clear-sev-filter');
    if (clrFilter) {
      clrFilter.onclick = () => {
        state.alarmsSeverityFilter = 'all';
        renderAlarmsView(container);
      };
    }

    // Hook View Toggle
    const viewToggle = container.querySelector('#alarms-view-toggle');
    if (viewToggle) {
      viewToggle.onchange = (e) => {
        state.alarmsViewMode = e.target.value;
        renderAlarmsView(container);
      };
    }

    // Hook Zia AI Summarize button
    const ziaBtn = container.querySelector('#alarms-zia-btn');
    if (ziaBtn) ziaBtn.onclick = () => showZiaAssistantModal();

    // Hook Alarm Row Click to open Slide-out Drawer
    container.querySelectorAll('.alarm-row-item').forEach(el => {
      el.onclick = (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        const aId = el.getAttribute('data-id');
        const alm = state.alarms.find(a => a.id === aId);
        if (alm) showAlarmDetailsDrawer(alm);
      };
    });

    // Hook Quick Ack button
    container.querySelectorAll('.alarm-ack-quick-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const aId = btn.getAttribute('data-id');
        const alm = state.alarms.find(a => a.id === aId);
        if (alm) {
          alm.technician = 'admin@opmanager';
          showToast(`Alarm for ${alm.device} acknowledged.`);
          renderAlarmsView(container);
        }
      };
    });

    // Hook Device Name Snapshot clicks
    container.querySelectorAll('.device-name-click').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const name = el.getAttribute('data-name');
        const dev = state.devices.find(d => d.name === name);
        if (dev) showDeviceSnapshotModal(dev);
      };
    });
  }
''')

print("Inventory and Alarms Views appended.")
