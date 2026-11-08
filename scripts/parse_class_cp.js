const fs = require("fs");

function parseClass(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 0;
  const magic = buf.readUInt32BE(offset);
  offset += 4;
  if (magic !== 0xCAFEBABE) {
    console.error("Not a class file");
    return;
  }
  const minor = buf.readUInt16BE(offset); offset += 2;
  const major = buf.readUInt16BE(offset); offset += 2;
  const cpCount = buf.readUInt16BE(offset); offset += 2;

  const cp = [null];
  for (let i = 1; i < cpCount; i++) {
    const tag = buf.readUInt8(offset); offset += 1;
    if (tag === 1) { // Utf8
      const len = buf.readUInt16BE(offset); offset += 2;
      const str = buf.toString("utf8", offset, offset + len);
      offset += len;
      cp.push({ tag: 1, val: str });
    } else if (tag === 3 || tag === 4) { // Integer, Float
      offset += 4; cp.push({ tag });
    } else if (tag === 5 || tag === 6) { // Long, Double (takes 2 entries)
      offset += 8; cp.push({ tag }); cp.push(null); i++;
    } else if (tag === 7 || tag === 8) { // Class, String
      const idx = buf.readUInt16BE(offset); offset += 2;
      cp.push({ tag, string_index: idx });
    } else if (tag === 9 || tag === 10 || tag === 11 || tag === 12) { // Ref, NameAndType
      offset += 4; cp.push({ tag });
    } else if (tag === 15) { // MethodHandle
      offset += 3; cp.push({ tag });
    } else if (tag === 16 || tag === 19 || tag === 20) { // MethodType, Module, Package
      offset += 2; cp.push({ tag });
    } else if (tag === 17 || tag === 18) { // Dynamic, InvokeDynamic
      offset += 4; cp.push({ tag });
    } else {
      console.warn("Unknown tag:", tag, "at offset", offset);
      break;
    }
  }

  // Find all String constants
  const htmlStrings = [];
  for (let i = 1; i < cp.length; i++) {
    const entry = cp[i];
    if (entry && entry.tag === 8) {
      const utf = cp[entry.string_index];
      if (utf && utf.val) {
        htmlStrings.push(utf.val);
      }
    }
  }
  return htmlStrings;
}

const strings = parseClass("/tmp/index_jsp.class");
console.log("Total string constants:", strings.length);

const chunks = strings.filter(s => s.includes("<") || s.includes("script") || s.includes("link") || s.includes("div"));
console.log("HTML/script chunks:", chunks.length);
fs.writeFileSync("/tmp/jsp_chunks.json", JSON.stringify(chunks, null, 2));
console.log("Sample chunks written to /tmp/jsp_chunks.json");
