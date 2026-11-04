import { readFileSync } from "node:fs";
const j = readFileSync("preview/src/views/home-screen/enhancements.js", "utf8");
console.log("headerSelect guard:", j.includes("if(headerSelect)"));
console.log("headerBtn guard:", j.includes("if(headerBtn)"));
console.log("rangeSelect guard:", j.includes("if(rangeSelect)"));
console.log("load event gating:", j.includes("addEventListener('load'"));
