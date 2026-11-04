import { readFileSync, writeFileSync } from "node:fs";
const icon = readFileSync("preview/assets/icons/-5.svg");
const dataUri = "data:image/svg+xml;base64," + icon.toString("base64");

const jsx = readFileSync("preview/src/views/room-overview/index.jsx", "utf8");

const old = /const RED_HAND_SVG = "[^"]+";/;
const replacement = `const RED_HAND_SVG = "${dataUri.replace("data:image/svg+xml;base64,", "")}";`;

const newJsx = jsx.replace(old, replacement);
writeFileSync("preview/src/views/room-overview/index.jsx", newJsx, "utf8");
console.log("RED_HAND_SVG length written:", dataUri.length - 28);
