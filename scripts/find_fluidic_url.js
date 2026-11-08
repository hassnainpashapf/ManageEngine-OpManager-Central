const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const matches = [...code.matchAll(/getFluidicv2Url\s*=\s*function[^{]*\{([^}]+)\}/g)];
for (const m of matches) {
  console.log("getFluidicv2Url:", m[0]);
}
if (matches.length === 0) {
  const matches2 = [...code.matchAll(/function\s+([a-zA-Z0-9_]*getFluidicv2Url[^{]*)\{([^}]+)\}/g)];
  for (const m of matches2) {
    console.log("fn:", m[0]);
  }
}
const idx = code.indexOf('getFluidicv2Url');
console.log("Around getFluidicv2Url:", code.substring(idx - 100, idx + 300));
