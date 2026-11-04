// 用 Edge headless 截图验证页面状态
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const page = pathToFileURL(resolve("preview/index.page.html")).href;
const out = resolve("C:/Users/WANGQI~1/AppData/Local/Temp/opencode/shot.png");

execFileSync(edge, [
  "--headless=new",
  "--disable-gpu",
  "--window-size=1920,1080",
  `--screenshot=${out}`,
  "--virtual-time-budget=8000",
  page,
], { stdio: "ignore" });

console.log("saved:", out);
