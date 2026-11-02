import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("演示导出/AgentDemo-当前演示.html", "utf8");

function scanSpans(tag) {
  const spans = [];
  const open = "<" + tag;
  let pos = 0;
  while ((pos = html.indexOf(open, pos)) !== -1) {
    const gt = html.indexOf(">", pos);
    if (gt === -1) break;
    const attrs = html.slice(pos, gt + 1);
    if (/(\s(src|href)=|\/>$)/.test(attrs)) { pos = gt; continue; }
    const close = "</" + tag + ">";
    const end = html.indexOf(close, gt);
    if (end === -1) break;
    spans.push({ tag, attrStart: pos, contentStart: gt + 1, contentEnd: end, end: end + close.length, attrs: attrs.slice(0, 80) });
    pos = end + close.length;
  }
  return spans;
}

const styles = scanSpans("style");
const scripts = scanSpans("script");
console.log(`style blocks: ${styles.length}`);
styles.forEach((s, i) => console.log(`  style[${i}] @${s.attrStart} len=${s.contentEnd - s.contentStart} attrs=${s.attrs}`));
console.log(`script blocks: ${scripts.length}`);
scripts.forEach((s, i) => console.log(`  script[${i}] @${s.attrStart} len=${s.contentEnd - s.contentStart} attrs=${s.attrs}`));

const bodyOpen = html.search(/<body[^>]*>/);
const bodyClose = html.lastIndexOf("</body>");
console.log(`body: open=${bodyOpen} close=${bodyClose} attrs=${html.slice(bodyOpen, html.indexOf(">", bodyOpen) + 1)}`);

const cssText = styles.map((s) => html.slice(s.contentStart, s.contentEnd)).join("\n");
const jsText = scripts.map((s) => html.slice(s.contentStart, s.contentEnd)).join("\n");
console.log(`css chars: ${cssText.length}, js chars: ${jsText.length}`);
console.log(`fetch( count in js: ${(jsText.match(/fetch\(/g) || []).length}`);
console.log(`body> selector in css: ${(cssText.match(/body\s*>\s*/g) || []).length}`);
console.log(`css :root lines: ${(cssText.match(/^[^\n{}]*:root[^\n{]*\{/gm) || []).length}`);
console.log(`css .dark bare lines: ${(cssText.match(/^[^\n{}]*\.dark\s*\{/gm) || []).length}`);
console.log(`js </script> strings: ${(jsText.match(/<\/script>/g) || []).length}`);
console.log(`skeleton </script>: 0 expected`);
console.log(`js addEventListener(load): ${(jsText.match(/addEventListener\(['"]load/g) || []).length}`);
console.log(`first style head: ${cssText.slice(0, 200).replace(/\s+/g, " ")}`);
console.log(`first script head: ${jsText.slice(0, 200).replace(/\s+/g, " ")}`);
