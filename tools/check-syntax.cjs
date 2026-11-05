// 用页面里的 babel 对新 JSX 文件做语法检查（模拟 inline 编译）
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { JSDOM } = require(path.join(__dirname, "verify-env/node_modules/jsdom"));

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const babelSrc = readFileSync("preview/assets/library/babel.min.js", "utf8");
dom.window.eval(babelSrc);

const files = process.argv.slice(2);
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const isJsx = f.endsWith(".jsx") || f.endsWith(".js");
  try {
    dom.window.Babel.transform(src, {
      presets: [["react", { runtime: "classic" }]],
      filename: path.basename(f),
      sourceType: "module",
    });
    console.log("OK  ", f);
  } catch (e) {
    console.log("FAIL", f, "→", e.message.split("\n").slice(0, 3).join(" | "));
  }
}
