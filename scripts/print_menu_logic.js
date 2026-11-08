const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const idx = code.indexOf('/ncmclient/getMainMenuTabs');
console.log("=== getProductMenuList ===");
console.log(code.substring(idx - 100, idx + 2500));
