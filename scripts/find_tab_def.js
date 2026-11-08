const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const idx = code.indexOf('MAIN_TAB_IDENTIFIERS:');
if (idx === -1) {
  const idx2 = code.indexOf('MAIN_TAB_IDENTIFIERS =');
  console.log("Index of MAIN_TAB_IDENTIFIERS =:", idx2);
  if (idx2 !== -1) console.log(code.substring(idx2 - 100, idx2 + 1000));
} else {
  console.log("Index of MAIN_TAB_IDENTIFIERS::", idx);
  console.log(code.substring(idx - 100, idx + 1000));
}
