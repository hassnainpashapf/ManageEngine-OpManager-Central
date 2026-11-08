const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const idx = code.indexOf('gotoV2Page(t){');
if (idx === -1) {
  const matches = [...code.matchAll(/gotoV2Page\([^)]*\)\s*\{/g)];
  for (const m of matches) {
    const p = m.index;
    console.log("Def:", code.substring(p, p + 250));
  }
} else {
  console.log(code.substring(idx, idx + 400));
}
