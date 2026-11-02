const path = require("node:path");
const { JSDOM, VirtualConsole } = require("./verify-env/node_modules/jsdom");

const PAGE = path.resolve(__dirname, "..", "演示导出", "AgentDemo-当前演示.html");
const vc = new VirtualConsole();
const t0 = Date.now();
JSDOM.fromFile(PAGE, { runScripts: undefined, virtualConsole: vc })
  .then((dom) => {
    console.log(`parse-only done in ${Date.now() - t0}ms, nodes=${dom.window.document.getElementsByTagName("*").length}`);
    dom.window.close();
    process.exit(0);
  })
  .catch((e) => { console.error("parse failed:", e.message); process.exit(1); });
