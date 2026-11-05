// 将 charts.jsx REPORT_ICONS 的 8 个 base64 图标与 assets/uploads 现有文件做 MD5 对照，
// 找出已有落盘文件的图标；无匹配的图标解码写出为新 PNG。
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const PREVIEW = "F:\\ccae_n-1\\preview";
const charts = fs.readFileSync(path.join(PREVIEW, "src/views/energy-detail/charts.jsx"), "utf8");
const block = charts.match(/export const REPORT_ICONS = \{[\s\S]*?\n\};/)[0];
const icons = {};
for (const m of block.matchAll(/"([a-z0-9-]+)":\s*"data:image\/png;base64,([^"]+)"/g)) icons[m[1]] = m[2];
console.log("icons found:", Object.keys(icons).join(", "));

const uploads = path.join(PREVIEW, "assets/uploads");
const byHash = new Map();
for (const f of fs.readdirSync(uploads)) {
  const fp = path.join(uploads, f);
  if (!fs.statSync(fp).isFile()) continue;
  const buf = fs.readFileSync(fp);
  byHash.set(crypto.createHash("md5").update(buf).digest("hex"), f);
}

const result = {};
for (const [name, b64] of Object.entries(icons)) {
  const buf = Buffer.from(b64, "base64");
  const md5 = crypto.createHash("md5").update(buf).digest("hex");
  const hit = byHash.get(md5);
  if (hit) {
    result[name] = "./assets/uploads/" + hit;
    console.log(`${name}: MATCH existing file ${hit} (${buf.length} bytes)`);
  } else {
    const newName = `energy-${name}.png`;
    fs.writeFileSync(path.join(uploads, newName), buf);
    result[name] = "./assets/uploads/" + newName;
    console.log(`${name}: no match -> wrote ${newName} (${buf.length} bytes)`);
  }
}
console.log("\nREPORT_ICONS path map:");
console.log(JSON.stringify(result, null, 2));
