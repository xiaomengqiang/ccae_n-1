import { readFileSync } from "node:fs";
const j = readFileSync("preview/src/views/nic-event/legacy.js", "utf8");
console.log("lastIndexOf })()  at:", j.lastIndexOf("})();"));
console.log("file length:", j.length);
console.log("last 80 chars:", JSON.stringify(j.slice(-80)));
console.log("first IIFE at:", j.indexOf("(()=>{"));
