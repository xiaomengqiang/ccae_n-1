const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require(path.join(__dirname, "verify-env/node_modules/jsdom"));
const vc = new VirtualConsole();
const page = path.resolve(__dirname, "../preview/index.page.html");
JSDOM.fromFile(page, {
  runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
  resources: { interceptors: [requestInterceptor((req, { element }) => {
    if (element && element.tagName === "SCRIPT") return undefined;
    return new Response("", { headers: { "Content-Type": "text/plain" } });
  })] },
  beforeParse(window) {
    window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }));
    window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
    if (!window.Element.prototype.scrollTo) window.Element.prototype.scrollTo = function () {};
    if (!window.Element.prototype.animate) window.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
    if (!window.HTMLCanvasElement.prototype.getContext.__stubbed) { const p = window.HTMLCanvasElement.prototype; p.getContext = function () { const el = this; return new Proxy({}, { get(_t, k) { if (k === "canvas") return el; return () => {}; }, set() { return true; } }); }; p.getContext.__stubbed = true; }
  },
}).then((dom) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const t0 = Date.now();
  (async () => {
    while (dom.window.document.readyState !== "complete" && Date.now() - t0 < 30000) await sleep(200);
    await sleep(4000);
    const w = dom.window, d = w.document;
    const wl = d.getElementById("home-workloads");
    console.log("parent is #screen (direct child):", wl?.parentElement?.id === "screen");
    console.log("hidden:", wl?.hidden, "| children:", wl?.children.length);
    try { w.showWorkloads("training", 0); } catch (e) { console.log("throw:", e.message); }
    await sleep(600);
    console.log("after activate — hidden:", d.getElementById("home-workloads")?.hidden, "| cards:", d.querySelectorAll(".workload-list > *").length, "| rail:", d.querySelectorAll(".workload-rail-item").length);
    try { w.showWorkloads("inference", 5); } catch (e) { console.log("throw2:", e.message); }
    await sleep(600);
    console.log("inference/节能筛选 — cards:", d.querySelectorAll(".workload-list > *").length, "| energy cards:", d.querySelectorAll(".hc-energy-card").length);
    process.exit(0);
  })();
});
