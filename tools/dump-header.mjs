// dump 最终 DOM 中 header/mode/select 的状态
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const page = pathToFileURL(resolve("preview/index.page.html")).href;

const dom = execFileSync(edge, [
  "--headless=new",
  "--disable-gpu",
  "--window-size=1920,1080",
  "--virtual-time-budget=8000",
  "--dump-dom",
  page,
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const i = dom.indexOf('id="home-header"');
const headerHtml = i >= 0 ? dom.substring(i - 60, i + 2200) : "NOT FOUND";
writeFileSync("C:/Users/WANGQI~1/AppData/Local/Temp/opencode/header-dump.txt", headerHtml, "utf8");
console.log(headerHtml);
