import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const legacy = readFileSync("preview/src/views/agent-panel/legacy.js", "utf8");

const entranceStart = legacy.indexOf("window.addEventListener('load',()=>{");
const entranceClose = "},{once:true});";
const entranceEnd = legacy.indexOf(entranceClose, entranceStart) + entranceClose.length;
const entranceWhole = legacy.slice(entranceStart, entranceEnd).trim();
const entranceBody = entranceWhole.slice("window.addEventListener('load',()=>{".length, entranceWhole.length - entranceClose.length).trim();

const tplMarker = 'parseFromString("';
const tplStart = legacy.indexOf(tplMarker, legacy.indexOf("panel-contour")) + tplMarker.length;
const tplEndMarker = "\",'image/svg+xml')";
const tplEnd = legacy.indexOf(tplEndMarker, tplStart);
const template = legacy.slice(tplStart, tplEnd);
if (!tplStart || tplEnd === -1 || !template.startsWith("<svg") || !template.endsWith("</svg>")) {
  throw new Error(`contour template extraction failed: start=${tplStart} end=${tplEnd} head=${template.slice(0, 40)} tail=${template.slice(-40)}`);
}

mkdirSync("preview/src/hooks", { recursive: true });
writeFileSync("preview/src/hooks/use-entrance.js",
  "import { useEffect } from \"react\";\n\n" +
  "export function useEntrance() {\n" +
  "  useEffect(() => {\n" +
  "    const run = () => {\n" + entranceBody.split("\n").map((l) => "  " + l).join("\n") + "\n    };\n" +
  "    if (document.readyState === \"complete\") run();\n" +
  "    else window.addEventListener(\"load\", run, { once: true });\n" +
  "    return () => window.removeEventListener(\"load\", run);\n" +
  "  }, []);\n}\n", "utf8");

writeFileSync("preview/src/views/agent-panel/contour-template.js",
  "export const CONTOUR_TEMPLATE = \"" + template + "\";\n", "utf8");

console.log(`entrance body: ${entranceBody.length} -> src/hooks/use-entrance.js`);
console.log(`contour template: ${template.length} chars -> src/views/agent-panel/contour-template.js`);
