import os

# -------------------------------------------------------------
# 1. Update 02_branding_and_modals.js for Add Device real creation
# -------------------------------------------------------------
modals_path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/02_branding_and_modals.js'
with open(modals_path, 'r', encoding='utf-8') as f:
    modals_code = f.read()

# Replace save-add-dev-btn logic in showAddDeviceModal
old_save_dev = '''    document.getElementById('save-add-dev-btn').onclick = () => {
      const ip = document.getElementById('new-dev-ip').value.trim() || '10.50.1.10';
      showToast(`Device ${ip} submitted for automated SNMP discovery.`);
      modal.style.display = 'none';
    };'''

new_save_dev = '''    document.getElementById('save-add-dev-btn').onclick = () => {
      const ip = document.getElementById('new-dev-ip').value.trim() || '10.50.1.' + Math.floor(Math.random() * 200 + 10);
      const probeId = parseInt(document.getElementById('new-dev-probe').value, 10) || 1;
      const targetProbe = state.probes.find(p => p.id === probeId) || state.probes[0];
      const snmpProfile = document.getElementById('new-dev-snmp').value;

      const newId = state.devices.length + 1;
      const newDev = {
        id: newId,
        name: 'NODE-' + ip.replace(/\\./g, '-'),
        ip: ip,
        category: 'Switches',
        type: 'Managed SNMP Host (' + snmpProfile.split(' ')[1] + ')',
        vendor: 'Cisco Systems',
        probe: targetProbe.name,
        probeId: targetProbe.id,
        status: 'Clear',
        cpu: Math.floor(Math.random() * 30 + 15),
        memory: Math.floor(Math.random() * 35 + 25),
        disk: 28.0,
        temp: 31,
        responseTime: Math.floor(Math.random() * 20 + 8),
        availability: '100.0%',
        serial: 'SNMP-' + Math.floor(Math.random() * 899999 + 100000),
        osVersion: 'Enterprise Agent Monitored',
        lastBackup: 'Just now',
        interfaces: [
          { name: 'GigabitEthernet0/1', admin: 'UP', oper: 'UP', speed: '1 Gbps', inTraffic: 140.2, outTraffic: 120.5, errors: 0 }
        ]
      };

      state.devices.unshift(newDev);
      targetProbe.devices++;
      targetProbe.devicesCount++;

      // Send to server
      fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDev)
      }).catch(() => {});

      showToast(`Device ${newDev.name} (${ip}) successfully discovered and added!`);
      modal.style.display = 'none';

      if (state.currentTab === 'inventory') {
        renderInventoryView();
      } else if (state.currentTab === 'dashboard') {
        renderDashboardView();
      }
    };'''

if old_save_dev in modals_code:
    modals_code = modals_code.replace(old_save_dev, new_save_dev)
    with open(modals_path, 'w', encoding='utf-8') as f:
        f.write(modals_code)
    print("✓ Updated 02_branding_and_modals.js for live Add Device creation")
else:
    print("Warning: old_save_dev snippet not found in 02_branding_and_modals.js")

# -------------------------------------------------------------
# 2. Update 03_views_dashboard_inventory.js for Checkboxes, Bulk Toolbar, Functional Pagination
# -------------------------------------------------------------
inv_path = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js'
with open(inv_path, 'r', encoding='utf-8') as f:
    inv_code = f.read()

# Make sure state has inventoryPage and inventoryPageSize
# Let's inspect where renderInventoryView starts
print(f"Loaded 03_views_dashboard_inventory.js ({len(inv_code)} bytes)")
