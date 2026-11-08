const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const idx = code.indexOf('this.route("alarms"');
console.log("Index of this.route(alarms):", idx);
if (idx !== -1) {
  // Let's print 3000 chars around this
  console.log(code.substring(idx - 200, idx + 4000));
}
