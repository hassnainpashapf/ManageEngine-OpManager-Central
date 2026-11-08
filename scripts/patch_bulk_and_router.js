const fs = require('fs');

// --- 1. PATCH 03_views_dashboard_inventory.js ---
const invPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/03_views_dashboard_inventory.js';
let invContent = fs.readFileSync(invPath, 'utf8');

const upgradedBulkBar = `          <!-- Enterprise Floating Bulk Actions Bar -->
          <div id="opm-bulk-bar" style="display: \${state.selectedDeviceCheckboxCount > 0 ? 'flex' : 'none'}; position: sticky; bottom: 32px; z-index: 1000; align-items: center; justify-content: space-between; background: #0f172a; color: #ffffff; padding: 12px 22px; border-radius: 8px; margin: 12px 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.35); border: 1px solid #334155;">
            <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
              <span style="background: #0070e0; color: #fff; padding: 3px 10px; border-radius: 14px; font-size: 12px; font-weight: 800;" id="opm-bulk-count">\${state.selectedDeviceCheckboxCount}</span>
              <span>Devices Selected for Bulk Management</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="opm-bulk-action-btn" data-action="poll" style="background: #2563eb; color: #fff; border: 1px solid #3b82f6; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">⚡ Poll Now</button>
              <button class="opm-bulk-action-btn" data-action="rediscover" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Rediscover</button>
              <button class="opm-bulk-action-btn" data-action="testcred" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Test Credentials</button>
              <button class="opm-bulk-action-btn" data-action="interval" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">⏱️ Polling Interval</button>
              <button class="opm-bulk-action-btn" data-action="maintenance" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">🛡️ Maintenance Mode</button>
              <button class="opm-bulk-action-btn" data-action="template" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">Assign Template</button>
              <button class="opm-bulk-action-btn" data-action="clear" style="background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">✕ Deselect All</button>
            </div>
          </div>`;

const oldBulkStart = invContent.indexOf('<!-- Sticky Bulk Actions Bar -->');
const oldBulkEnd = invContent.indexOf('<!-- Inventory Data Table -->');
if (oldBulkStart !== -1 && oldBulkEnd !== -1) {
  invContent = invContent.slice(0, oldBulkStart) + upgradedBulkBar + '\n\n          ' + invContent.slice(oldBulkEnd);
  console.log('Replaced old bulk bar with upgraded floating bar.');
}

// Update bulk actions click handlers
const upgradedBulkHandlers = `        if (act === 'clear') {
          container.querySelectorAll('.opm-inv-row-cb').forEach(cb => cb.checked = false);
          const selectAll = container.querySelector('#opm-inv-select-all');
          if (selectAll) selectAll.checked = false;
          state.selectedDeviceCheckboxCount = 0;
          const bulkBar = document.getElementById('opm-bulk-bar');
          if (bulkBar) bulkBar.style.display = 'none';
        } else if (act === 'poll') {
          state.devices.forEach(d => {
            if (ids.includes(d.id)) {
              d.lastBackup = 'Just now';
              d.responseTime = Math.max(8, d.responseTime + Math.floor(Math.random() * 4 - 2));
            }
          });
          showToast(\`Initiated live parallel SNMP poll across \${ids.length} selected devices. Telemetry synchronized.\`);
          renderInventoryView();
        } else if (act === 'interval') {
          showToast(\`Updated polling frequency to 1-minute high-frequency interval for \${ids.length} devices.\`);
        } else if (act === 'maintenance') {
          showToast(\`Configured 2-hour Maintenance Window. Alarms suppressed for \${ids.length} devices.\`);
        } else if (act === 'delete') {`;

if (invContent.includes("if (act === 'delete') {")) {
  invContent = invContent.replace(
    "if (act === 'delete') {",
    upgradedBulkHandlers
  );
  console.log('Added poll, interval, maintenance, and clear to bulk action button handlers.');
}

fs.writeFileSync(invPath, invContent, 'utf8');
console.log('Successfully updated 03_views_dashboard_inventory.js');

// --- 2. PATCH 06_router_and_init.js ---
const routerPath = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/scripts/suite_modules/06_router_and_init.js';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('updateBreadcrumbs(')) {
  routerContent = routerContent.replace(
    'syncHeaderTabs(tab);',
    'syncHeaderTabs(tab);\n    if (typeof updateBreadcrumbs === "function") {\n      updateBreadcrumbs(tab, state.subTabs[tab]);\n    }'
  );
  console.log('Added updateBreadcrumbs to renderActiveTab');
}

// Export toggleNocDarkMode, updateBreadcrumbs in OpManagerSuite
if (!routerContent.includes('toggleNocDarkMode,')) {
  routerContent = routerContent.replace(
    'showToast\n  };',
    'showToast,\n    toggleNocDarkMode,\n    applyNocDarkTheme,\n    updateBreadcrumbs\n  };'
  );
  console.log('Exported toggleNocDarkMode, applyNocDarkTheme, updateBreadcrumbs to OpManagerSuite');
}

fs.writeFileSync(routerPath, routerContent, 'utf8');
console.log('Successfully updated 06_router_and_init.js');
