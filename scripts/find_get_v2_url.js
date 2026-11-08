const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const matches = [...code.matchAll(/getV2URL\([^)]*\)\s*\{/g)];
for (const m of matches) {
  const p = m.index;
  console.log("getV2URL:", code.substring(p, p + 250));
}
