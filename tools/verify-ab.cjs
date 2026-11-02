const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");

const target = process.argv[2] || "demo";
const PAGE = target === "demo"
  ? path.resolve(__dirname, "..", "演示导出", "AgentDemo-当前演示.html")
  : path.resolve(__dirname, "..", "preview", "index.page.html");

const vc = new VirtualConsole();
const errors = [];
vc.on("jsDomError", (e) => { if (!/Could not parse CSS/.test(String(e))) errors.push(String(e.message || e)); });
process.on("uncaughtException", (e) => { errors.push("UNCAUGHT: " + (e && e.message)); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log(`probe: loading ${PAGE}`);
  const dom = await JSDOM.fromFile(PAGE, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    resources: {
      interceptors: [
        requestInterceptor((request, { element }) => {
          if (element && element.tagName === "SCRIPT") return undefined;
          return new Response("", { headers: { "Content-Type": "text/plain" } });
        }),
      ],
    },
    beforeParse(window) {
      window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }));
      window.IntersectionObserver = window.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
      window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
      if (!window.Element.prototype.getAnimations) window.Element.prototype.getAnimations = function () { return []; };
      if (!window.Element.prototype.animate) window.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
      if (!window.Element.prototype.scrollTo) window.Element.prototype.scrollTo = function () {};
      if (!window.Element.prototype.scrollBy) window.Element.prototype.scrollBy = function () {};
    if (!window.HTMLDivElement.prototype.scrollIntoView) window.HTMLDivElement.prototype.scrollIntoView = function () {};
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
    window.fetch = () => Promise.reject(new Error("disabled"));
    },
  });
  const w = dom.window;
  console.log("probe: dom loaded, waiting readyState");
  const t0 = Date.now();
  while (w.document.readyState !== "complete" && Date.now() - t0 < 30000) await sleep(200);
  console.log(`probe: readyState=${w.document.readyState} after ${Date.now() - t0}ms`);
  await sleep(2500);
  const steps = [
    ["openOpticalEvent", "#optical-event-root, .hc-optical-module, [class*=optical-event]"],
    ["closeOpticalEvent", null],
    ["openNicEvent", ".hc-nic-module, [class*=nic-event], #nic-event-root"],
    ["closeNicEvent", null],
    ["openEnergyService", "#hc-energy-root, [class*=hc-energy]"],
  ];
  console.log(`=== ${target} ===`);
  for (const [fn, sel] of steps) {
    const before = errors.length;
    let extra = "";
    try {
      w[fn]();
      await sleep(700);
      if (sel) extra = " sel=" + !!w.document.querySelector(sel) + " nodes=" + w.document.querySelectorAll("#screen *").length;
    } catch (e) {
      extra = " THREW: " + e.message;
    }
    const newErrs = errors.slice(before);
    console.log(`${fn}: ${extra}${newErrs.length ? " | errors: " + newErrs.slice(0, 2).join(" ; ").slice(0, 200) : " | clean"}`);
  }
  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.stack || e); process.exit(1); });
