const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

let pos = 0;
while (true) {
  const idx = code.indexOf('handleV3Redirect', pos);
  if (idx === -1) break;
  console.log("Found at:", idx);
  console.log(code.substring(Math.max(0, idx - 100), idx + 400));
  console.log("------------------------");
  pos = idx + 16;
}
