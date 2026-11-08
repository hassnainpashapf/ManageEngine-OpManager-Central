const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const idx = code.indexOf('getFluidicv2Url=');
if (idx !== -1) {
  console.log(code.substring(idx - 50, idx + 250));
} else {
  const matches = [...code.matchAll(/getFluidicv2Url\s*[:=]/g)];
  for (const m of matches) {
    console.log("Match at", m.index, code.substring(m.index - 50, m.index + 250));
  }
}
