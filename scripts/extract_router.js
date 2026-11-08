const fs = require("fs");
const code = fs.readFileSync("/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-extracted/product_home/apiclient/fluidicv3/itom/assets/itom-1041cd8b105b495c4de9857f11122596.js", "utf8");

const start = code.indexOf(".Router.map(function");
if (start !== -1) {
  // Extract up to 10000 chars
  const slice = code.slice(start, start + 12000);
  console.log(slice.substring(0, 4000));
  fs.writeFileSync("/tmp/ember_router_def.js", slice);
} else {
  console.log("Router.map not found with standard string, searching...");
  const match = code.match(/Router\.map\(\s*function\s*\(\)\s*\{/);
  console.log("Match:", match);
}
