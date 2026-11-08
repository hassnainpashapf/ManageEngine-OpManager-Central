const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

// Search for router definitions
const re = /this\.route\(\s*["']([^"']+)["']/g;
let m;
const routes = new Set();
while ((m = re.exec(code)) !== null) {
  routes.add(m[1]);
}
console.log("Total routes found:", routes.size);
console.log("Routes:", Array.from(routes).sort());
