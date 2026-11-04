import { readFileSync } from "node:fs";
const icon = readFileSync("preview/assets/icons/-5.svg");
const b64 = icon.toString("base64");
console.log("base64 only length:", b64.length);
const j = readFileSync("preview/src/views/room-overview/index.jsx", "utf8");
const m = j.match(/RED_HAND_SVG = "([^"]+)"/);
console.log("in code length:", m[1].length);
console.log("match:", m[1] === b64);
