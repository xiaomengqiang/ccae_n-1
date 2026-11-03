const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");
const fs = require("node:fs");

const PAGE = path.resolve(__dirname, "..", "preview", "index.page.html");
const vc = new VirtualConsole();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dom = await JSDOM.fromFile(PAGE, {
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    resources: { interceptors: [requestInterceptor((request, { element }) => element && element.tagName === "SCRIPT" ? undefined : new Response("", { headers: { "Content-Type": "text/plain" } }))] },
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
  await sleep(2000);
  console.log(`time-now present: ${!!d.querySelector(".time-now")}`);
  console.log(`room-overview present: ${!!d.getElementById("home-room-overview")}`);
  console.log(`legend present: ${!!d.getElementById("cabinet-device-legend")}`);
  console.log(`HCStory: ${!!w.HCStory}, markers now: ${d.getElementById("home-timeline-markers")?.children.length}`);
  try { w.HCStory.start(); console.log("start ok"); } catch (e) { console.log("start THREW: " + e.message); }
  await sleep(1500);
  console.log(`after start: time-now=${!!d.querySelector(".time-now")} markers=${d.getElementById("home-timeline-markers")?.children.length}`);
  console.log(`main#screen children: ${d.getElementById("screen")?.children.length}`);
  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.stack || e); process.exit(1); });
