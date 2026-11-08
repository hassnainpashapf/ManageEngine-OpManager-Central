const fs = require("fs");
const file = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js";
const content = fs.readFileSync(file, "utf8");

const routerMatches = content.match(/this\.route\([^)]+\)/g);
if (routerMatches) {
  console.log("Found", routerMatches.length, "route calls. Sample:");
  console.log(routerMatches.slice(0, 30));
}

// Find tab configurations
const tabMatches = content.match(/tabList|menuList|mainTabs|navItems|headerTabs/gi);
console.log("Tab keyword matches:", tabMatches?.length);

// Look for alarms subtabs
const alarmsMatches = content.match(/["']active-alarms["']|["']all-alarms["']|["']events["']|["']custom-views["']/g);
console.log("Alarms routes:", Array.from(new Set(alarmsMatches)));

// Look for inventory subtabs
const invMatches = content.match(/["']devices["']|["']interfaces["']|["']probes["']|["']virtualization["']|["']storage["']/g);
console.log("Inventory subtabs:", Array.from(new Set(invMatches)));
