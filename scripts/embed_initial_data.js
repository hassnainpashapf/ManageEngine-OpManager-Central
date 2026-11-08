const fs = require("fs");
const path = require("path");
const db = require(path.join(__dirname, "../server/services/db.js"));
const indexJspPath = path.join(__dirname, "../client/apiclient/ember/index.jsp");
let content = fs.readFileSync(indexJspPath, "utf8");

const devicesJson = JSON.stringify(db.getDevices());
const probesJson = JSON.stringify(db.getProbes());
const alarmsJson = JSON.stringify(db.getAlarms());

const replacement = `let globalState = {
      devices: ${devicesJson},
      probes: ${probesJson},
      alarms: ${alarmsJson},
      selectedProbe: "All Probes",
      activeFilter: "all"
    };`;

content = content.replace(/let globalState = \{[\s\S]*?activeFilter:\s*['"]all['"]\s*\};/, replacement);

// Also make sure renderCurrentRoute() is called on DOMContentLoaded
if (!content.includes("renderCurrentRoute(); // Instant")) {
  content = content.replace("fetchInitialData();", "renderCurrentRoute(); // Instant\n      fetchInitialData();");
}

fs.writeFileSync(indexJspPath, content, "utf8");
console.log("Successfully embedded initial data and instant render into index.jsp!");
