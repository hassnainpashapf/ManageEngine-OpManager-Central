const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const matches = [...code.matchAll(/MAIN_TAB_IDENTIFIERS[^{};]*\{([^}]+)\}/g)];
for (const m of matches) {
  console.log("Found match:\n", m[0].substring(0, 500));
}
