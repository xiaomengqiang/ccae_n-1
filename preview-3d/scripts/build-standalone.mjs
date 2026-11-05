// build-standalone.mjs — 从 src/ 组装自包含单文件 multi-cabinet-scene.html
// 形态对应原 multi-cabinet-scene.html：静态骨架 + 内联 <style>/<script> + data URI 资源，
// 零外部子资源 —— 可嵌入 sandbox="allow-scripts" 的 iframe（不透明源无法加载本地文件）。
//
// 用法: node scripts/build-standalone.mjs
// 产物: preview-3d/multi-cabinet-scene.html （与宿主工程 scenes 目录同名，直接拷贝覆盖即用）

import { readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

/* ---------- 从 scene-dom.js 提取骨架与执行清单（单一事实来源） ---------- */
const dom = readFileSync(join(SRC, "views/scene-root/scene-dom.js"), "utf8");
const skeleton = dom.match(/const SCENE_SKELETON = `([\s\S]*?)`;/)[1].trim();
const MAIN = dom.match(/const MAIN = \[([\s\S]*?)\];/)[1].match(/"([a-z0-9-]+)"/g).map((s) => s.slice(1, -1));
const ROOM = dom.match(/const ROOM = \[([\s\S]*?)\];/)[1].match(/"([a-z0-9-]+)"/g).map((s) => s.slice(1, -1));

/* ---------- 资源内联为 data URI ---------- */
const MIME = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", mp4: "video/mp4", gif: "image/gif" };
const dataUri = (name) => {
  const bytes = readFileSync(join(ROOT, "assets/uploads", name));
  return `data:${MIME[extname(name).slice(1)] || "application/octet-stream"};base64,${bytes.toString("base64")}`;
};
// JS 里的 "./assets/uploads/X" → data URI（hfAssetURL 对 data: 会走原 blob 通道，行为与原页面一致）
const inlineJsAssets = (code) => code.replace(/(['"])\.\/assets\/uploads\/([a-zA-Z0-9._-]+)\1/g, (_m, q, name) => `${q}${dataUri(name)}${q}`);
// CSS 里的 url('../../assets/uploads/X') → data URI
const inlineCssUrls = (css) => css.replace(/url\((['"]?)\.\.\/\.\.\/assets\/uploads\/([a-zA-Z0-9._-]+)\1\)/g, (_m, q, name) => `url(${q}${dataUri(name)}${q})`);

/* ---------- 读取引擎脚本（顺序 = RUNTIME_SCRIPTS 清单） ---------- */
const readJs = (p) => readFileSync(join(ROOT, p), "utf8");
const script = (code) => `<script>\n${code.trim()}\n</script>`;
const style = (css) => `<style>\n${css.trim()}\n</style>`;

const mainScripts = MAIN.map((n) => inlineJsAssets(readJs(`src/main/${n}.js`)));
const roomScripts = ROOM.map((n) => inlineJsAssets(readJs(`src/room/${n}.js`)));
const coreScript = inlineJsAssets(readJs("src/core/core-select.js"));
const threeScript = readJs("assets/library/three.min.js");
const racktexScript = inlineJsAssets(readJs("src/scene-racktex.js"));
const clusterScript = inlineJsAssets(readJs("src/cluster/cluster-view.js"));
const fitScript = inlineJsAssets(readJs("src/scene-fit.js"));

const headCss = inlineCssUrls(readJs("src/styles/head.css"));
const roomOverridesCss = inlineCssUrls(readJs("src/styles/room-overrides.css"));
const clusterPopupCss = inlineCssUrls(readJs("src/styles/cluster-popup.css"));
const tailCss = inlineCssUrls(readJs("src/styles/tail-overrides.css"));

/* ---------- 组装（结构镜像原页面：<head> 主样式 → 骨架 → 按序脚本 + 间隔样式层） ---------- */
const html = `<!DOCTYPE html>
<html lang="zh-CN" class="ccae-booting">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>CCAE 智算集群数字地图 · Atlas 950 超节点 1024</title>
<script>
/* Suppress browser double-tap zoom without suppressing demo click events or pinch zoom. */
document.addEventListener('dblclick', function(event) {
  if(event.cancelable)event.preventDefault();
}, {passive:false});
</script>
<script>
// Touch tablets use fewer continuously repainted effects; topology and hit targets stay intact.
window.CCAE_LIGHT = /Android|HarmonyOS|iPad|Tablet/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && matchMedia('(pointer: coarse)').matches);
document.documentElement.classList.toggle('ccae-light', window.CCAE_LIGHT);
</script>
${style(headCss)}
</head>
<body>
${skeleton}
${mainScripts.map(script).join("\n")}
${roomScripts.map(script).join("\n")}
${style(roomOverridesCss)}
${script(coreScript)}
${style(clusterPopupCss)}
${script(threeScript)}
${script(racktexScript)}
${script(clusterScript)}
${script(fitScript)}
${style(tailCss)}
</body>
</html>
`;

/* ---------- 校验与写出 ---------- */
const chunks = [...mainScripts, ...roomScripts, coreScript, threeScript, racktexScript, clusterScript, fitScript, headCss, roomOverridesCss, clusterPopupCss, tailCss];
for (const [i, c] of chunks.entries()) {
  if (c.includes("</script>")) { console.error(`FAIL  第 ${i} 块包含 </script>，无法内联`); process.exit(1); }
}
const all = html;
const residualJs = (all.match(/['"]\.\/assets\/uploads\//g) || []).length;
const residualCss = (all.match(/url\((['"]?)\.\.\/\.\.\/assets\//g) || []).length;
if (residualJs || residualCss) { console.error(`FAIL  残留外部资源引用: js ${residualJs}, css ${residualCss}`); process.exit(1); }
if (/\s(?:src|href)="\.\//.test(all)) { console.error("FAIL  存在相对 src/href 属性引用"); process.exit(1); }

const OUT = join(ROOT, "multi-cabinet-scene.html");
writeFileSync(OUT, html, "utf8");
console.log(`OK  ${OUT}`);
console.log(`    ${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB | scripts: main×${mainScripts.length} room×${roomScripts.length} + core/three/racktex/cluster/fit | styles×4 | 资源全部 data URI 内联`);
