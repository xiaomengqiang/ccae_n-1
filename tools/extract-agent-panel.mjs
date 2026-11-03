import { readFileSync, writeFileSync } from "node:fs";

const legacy = readFileSync("preview/src/views/agent-panel/legacy.js", "utf8");

const mascotStart = legacy.indexOf("/* Layered WebP choreography");
const mascotEnd = legacy.indexOf("})();", legacy.indexOf("pagehide", mascotStart)) + 4;
const mascot = legacy.slice(mascotStart, mascotEnd).trim();

const entranceStart = legacy.indexOf("window.addEventListener('load',()=>{", mascotEnd);
const entranceClose = "},{once:true});";
const entranceEnd = legacy.indexOf(entranceClose, entranceStart) + entranceClose.length;
const entranceWhole = legacy.slice(entranceStart, entranceEnd).trim();
const entranceBody = entranceWhole.slice("window.addEventListener('load',()=>{".length, entranceWhole.length - entranceClose.length).trim();

const contourStart = legacy.indexOf("/* Preserve the current contour geometry");
const contourEndMarker = "})();";
const contourEnd = legacy.indexOf(contourEndMarker, legacy.indexOf("new MutationObserver(fit)", contourStart)) + contourEndMarker.length;
const contour = legacy.slice(contourStart, contourEnd).trim();

const covered = legacy.slice(legacy.indexOf("export function initAgentPanel() {") + "export function initAgentPanel() {".length);
const segmentsSum = mascot.length + entranceWhole.length + contour.length;
const remainder = covered.replace(/\s+/g, "");
const accounted = (mascot + entranceWhole + contour).replace(/\s+/g, "");

writeFileSync("preview/src/views/agent-panel/mascot.js", "export function mountMascot() {\n" + mascot + "\n}\n", "utf8");
writeFileSync("preview/src/views/agent-panel/entrance.js", "export function runEntrance() {\n" + entranceBody + "\n}\n\nexport function mountEntrance() {\n  if (document.readyState === \"complete\") setTimeout(runEntrance, 0);\n  else window.addEventListener(\"load\", runEntrance, { once: true });\n}\n", "utf8");
writeFileSync("preview/src/views/agent-panel/contour.js", "export function mountContour() {\n" + contour + "\n}\n", "utf8");

console.log(`mascot: ${mascot.length}, entrance: ${entranceWhole.length} (body ${entranceBody.length}), contour: ${contour.length}`);
console.log(`whitespace-normalized coverage of initAgentPanel body: ${(accounted.length / remainder.length * 100).toFixed(2)}%`);
