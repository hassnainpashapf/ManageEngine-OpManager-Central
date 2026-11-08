const fs = require("fs");
const file = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js";
const content = fs.readFileSync(file, "utf8");

// Search for API endpoint strings
const endpoints = new Set();
const re = /["'](\/(?:api|v2|admin|device|alarm|inventory|dashboard|report|probe|settings)\/[a-zA-Z0-9_\-\/]+)["']/g;
let m;
while ((m = re.exec(content)) !== null) {
  endpoints.add(m[1]);
}

console.log("Found", endpoints.size, "exact API endpoints in itom bundle. Sample:");
console.log(Array.from(endpoints).slice(0, 50));
