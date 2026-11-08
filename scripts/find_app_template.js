const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const matches = [...code.matchAll(/define\(\s*["']itom\/templates\/application["']/g)];
for (const m of matches) {
  console.log("Template application found at:", m.index);
  console.log(code.substring(m.index, m.index + 1000));
}
