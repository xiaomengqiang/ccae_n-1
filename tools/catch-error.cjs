// 抓运行时错误完整 stack —— 环境与 verify-page.cjs 完全一致
const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");

const page = path.resolve(__dirname, "../preview/index.page.html");

const vc = new VirtualConsole();
let errCount = 0;
vc.on("error", (...a) => {
  if (errCount < 2) {
    console.log("=== console.error ===");
    a.forEach((x) => console.log(String(x && x.stack ? x.stack : x).slice(0, 2000)));
  }
  errCount++;
});
vc.on("jsdomError", (e) => {
  const inner = e.detail;
  console.log("=== jsdomError:", inner?.message || e.message);
  if (inner?.stack) console.log(inner.stack.split("\n").slice(0, 6).join("\n"));
});

JSDOM.fromFile(page, {
  runScripts: "dangerously",
  resources: {
    interceptors: [
      requestInterceptor((request, { element }) => {
        if (element && element.tagName === "SCRIPT") return undefined;
        return new Response("", { headers: { "Content-Type": "text/plain" } });
      }),
    ],
  },
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.addEventListener("error", (e) => {
      console.log("=== window error (early) ===");
      console.log((e.error && e.error.stack) || e.message);
    });
    window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }));
    window.IntersectionObserver = window.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
    window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
    if (!window.HTMLDivElement.prototype.scrollIntoView) window.HTMLDivElement.prototype.scrollIntoView = function () {};
    if (!window.Element.prototype.getAnimations) window.Element.prototype.getAnimations = function () { return []; };
    if (!window.Element.prototype.scrollTo) window.Element.prototype.scrollTo = function () {};
    if (!window.Element.prototype.scrollBy) window.Element.prototype.scrollBy = function () {};
    if (!window.HTMLCanvasElement.prototype.getContext.__stubbed) {
      const proto = window.HTMLCanvasElement.prototype;
      proto.getContext = function () {
        const el = this;
        return new Proxy({}, {
          get(_t, k) { if (k === "canvas") return el; return () => {}; },
          set() { return true; },
        });
      };
      proto.getContext.__stubbed = true;
    }
    if (!window.Element.prototype.animate) window.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
  },
}).then((dom) => {
  dom.window.addEventListener("error", (e) => {
    console.log("=== window error ===");
    console.log(e.error?.stack || e.message);
  });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const t0 = Date.now();
  const step = async () => {
    while (dom.window.document.readyState !== "complete" && Date.now() - t0 < 30000) await sleep(200);
    await sleep(4000);
    const w = dom.window, d = w.document;
    console.log("=== calling openEnergyService ===");
    try { w.openEnergyService({ name: "Qwen3.7" }); } catch (e) { console.log("SYNC THROW:", e.stack); }
    for (let i = 0; i < 10; i++) { await sleep(500); if (d.querySelectorAll(".hc-energy-service").length) break; }
    const q = (s) => d.querySelectorAll(s).length;
    console.log("=== DOM state ===");
    console.log("root children:", d.getElementById("root")?.children.length);
    console.log("#screen nodes:", q("#screen *"));
    console.log("#hc-energy-root:", q("#hc-energy-root"), "| .hc-energy-service:", q(".hc-energy-service"), "| hc-energy-card:", q(".hc-energy-card"));
    console.log("done");
    process.exit(0);
  };
  step();
});
