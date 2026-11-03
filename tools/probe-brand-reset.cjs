const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");
const vc = new VirtualConsole();
const PAGE = path.resolve(__dirname, "..", "preview", "index.page.html");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dom = await JSDOM.fromFile(PAGE, {
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    resources: { interceptors: [requestInterceptor((req, { element }) => element && element.tagName === "SCRIPT" ? undefined : new Response("", { headers: { "Content-Type": "text/plain" } }))] },
    beforeParse(w) {
      w.matchMedia = w.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }));
      w.IntersectionObserver = w.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
      w.ResizeObserver = w.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
      if (!w.Element.prototype.getAnimations) w.Element.prototype.getAnimations = function () { return []; };
      if (!w.Element.prototype.animate) w.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
      if (!w.Element.prototype.scrollTo) w.Element.prototype.scrollTo = function () {};
      if (!w.HTMLDivElement.prototype.scrollIntoView) w.HTMLDivElement.prototype.scrollIntoView = function () {};
      if (!w.HTMLCanvasElement.prototype.getContext.__stubbed) {
        const p = w.HTMLCanvasElement.prototype;
        p.getContext = function () { const el = this; return new Proxy({}, { get(_, k) { if (k === "canvas") return el; return () => {}; }, set() { return true; } }); };
        p.getContext.__stubbed = true;
      }
      w.fetch = () => Promise.reject(new Error("disabled"));
    },
  });
  const w = dom.window;
  const d = w.document;
  const t0 = Date.now();
  while (d.readyState !== "complete" && Date.now() - t0 < 30000) await sleep(200);
  await sleep(3000);

  const ribbon = d.querySelector("#home-metrics .hc-ribbon");
  const titles = ribbon ? ribbon.querySelectorAll(".hc-metric-title") : [];
  const brand = d.querySelector("#home-header button");

  console.log("ribbon:", !!ribbon, "brand:", !!brand);

  // 1. 切到训练
  if (titles[1]) {
    titles[1].click();
    await sleep(500);
    console.log("after training click: category=" + ribbon.dataset.category + " g1_class=" + ribbon.querySelectorAll(".hc-metric-group")[1].className);
  }

  // 2. 点品牌重置
  if (brand) {
    brand.click();
    await sleep(500);
    const g0 = ribbon.querySelectorAll(".hc-metric-group")[0];
    console.log("after brand click: category=" + ribbon.dataset.category + " g0_class=" + g0.className);
    const style = w.getComputedStyle(g0.querySelector(".hc-metric-row"));
    console.log("resource row visible:", style.visibility !== "hidden");
  }

  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.message); process.exit(1); });
