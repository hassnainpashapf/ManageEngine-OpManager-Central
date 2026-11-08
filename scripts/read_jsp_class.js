const fs = require("fs");
const target = process.argv[2] || "/tmp/index_jsp.class";
const buf = fs.readFileSync(target);
const str = buf.toString("latin1");

const re = /[\w\/\.\<\>\=\-\"\'\?\&\%]{4,}/g;
let m;
const found = new Set();
while ((m = re.exec(str)) !== null) {
  const s = m[0];
  if (s.includes(".js") || s.includes(".css") || s.includes("<link") || s.includes("<script") || s.includes(".jsp")) {
    found.add(s);
  }
}
console.log(Array.from(found).join("\n"));
