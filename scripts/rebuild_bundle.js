const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const modulesDir = path.join(__dirname, 'suite_modules');
const extractedTarget = '/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/opmanager-suite.js';
const clientTarget = path.join(__dirname, '../client/apiclient/fluidicv3/itom/assets/opmanager-suite.js');

const moduleNames = [
  '01_header_state.js',
  '02_branding_and_modals.js',
  '03_views_dashboard_inventory.js',
  '04_views_alarms_maps.js',
  '05_views_config_reports_settings.js',
  '06_router_and_init.js'
];

console.log('Concatenating 6 suite modules...');
let combined = '';
for (const mod of moduleNames) {
  const filePath = path.join(modulesDir, mod);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Module file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(` - ${mod} (${(content.length / 1024).toFixed(1)} KB)`);
  combined += content + '\n\n';
}

if (fs.existsSync(path.dirname(extractedTarget))) {
  fs.writeFileSync(extractedTarget, combined, 'utf8');
  console.log(`Successfully wrote combined bundle to extracted product home: ${extractedTarget} (${(combined.length / 1024).toFixed(1)} KB)`);
}

fs.mkdirSync(path.dirname(clientTarget), { recursive: true });
fs.writeFileSync(clientTarget, combined, 'utf8');
console.log(`Successfully wrote combined bundle to local client: ${clientTarget} (${(combined.length / 1024).toFixed(1)} KB)`);

console.log('Verifying bundle JavaScript syntax with node -c ...');
execSync(`node -c "${clientTarget}"`, { stdio: 'inherit' });
console.log('Syntax check PASSED!');
