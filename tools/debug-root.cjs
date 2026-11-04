const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");
const vc = new VirtualConsole();
const errs = [];
vc.on("jsDomError", (e) => { if (!String(e).includes("BABEL")) errs.push(String(e.message || e)); });
vc.on("error", (...a) => { const s = a.map(String).join(" "); if (!s.includes("BABEL")) errs.push(s.substring(0, 300)); });
const PAGE = path.resolve(__dirname, "..", "preview/index.page.html");

JSDOM.fromFile(PAGE, {
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
}).then((dom) => {
  const w = dom.window;
  const d = w.document;
  const t0 = Date.now();
  const check = () => {
    if (d.readyState === "complete") {
      setTimeout(() => {
        console.log("root:", d.getElementById("root")?.children?.length || 0);
        if (errs.length) errs.slice(0, 3).forEach((e, i) => console.log("err" + i + ":", e));
        w.close();
        process.exit(0);
      }, 3000);
    } else if (Date.now() - t0 < 30000) setTimeout(check, 200);
  };
  check();
}).catch((e) => { console.error("CRASH:", e.message); process.exit(1); });
