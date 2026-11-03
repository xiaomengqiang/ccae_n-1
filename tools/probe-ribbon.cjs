const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");

const PAGE = path.resolve(__dirname, "..", "preview", "index.page.html");
const vc = new VirtualConsole();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dom = await JSDOM.fromFile(PAGE, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    resources: {
      interceptors: [requestInterceptor((request, { element }) => {
        if (element && element.tagName === "SCRIPT") return undefined;
        return new Response("", { headers: { "Content-Type": "text/plain" } });
      })],
    },
    beforeParse(window) {
      window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }));
      window.IntersectionObserver = window.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
      window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
      if (!window.Element.prototype.getAnimations) window.Element.prototype.getAnimations = function () { return []; };
      if (!window.Element.prototype.animate) window.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
      if (!window.Element.prototype.scrollTo) window.Element.prototype.scrollTo = function () {};
      if (!window.HTMLDivElement.prototype.scrollIntoView) window.HTMLDivElement.prototype.scrollIntoView = function () {};
      if (!window.HTMLCanvasElement.prototype.getContext.__stubbed) {
        const proto = window.HTMLCanvasElement.prototype;
        proto.getContext = function () { const el = this; return new Proxy({}, { get(_t, k) { if (k === "canvas") return el; return () => {}; }, set() { return true; } }); };
        proto.getContext.__stubbed = true;
      }
      window.fetch = () => Promise.reject(new Error("disabled"));
    },
  });
  const w = dom.window;
  const d = w.document;
  const t0 = Date.now();
  while (d.readyState !== "complete" && Date.now() - t0 < 60000) await sleep(200);
  await sleep(3000);
  const groups = [...d.querySelectorAll("#home-metrics .hc-metric-group")];
  for (const g of groups) {
    const row = g.querySelector(".hc-metric-row");
    console.log(`${g.dataset.category}: class="${g.className}" flexGrow="${g.style.flexGrow}" tiles=${row ? row.children.length : "no-row"} rowWidthAttr="${row ? row.style.width : ""}"`);
  }
  const ribbon = d.querySelector("#home-metrics .hc-ribbon");
  console.log(`ribbon exists: ${!!ribbon}, has activate: ${!!(ribbon && ribbon.activate)}`);
  if (ribbon && ribbon.activate) {
    ribbon.activate("training", 0, false, true);
    await sleep(200);
    for (const g of [...d.querySelectorAll("#home-metrics .hc-metric-group")]) {
      console.log(`after switch: ${g.dataset.category} class="${g.className}" flexGrow="${g.style.flexGrow}"`);
    }
  }
  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.stack || e); process.exit(1); });
