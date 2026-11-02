const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");

const PAGE = path.resolve(__dirname, "..", "preview", "index.page.html");
const vc = new VirtualConsole();
const errors = [];
const ignoreErr = (s) => /Could not parse CSS/.test(s) || /\[BABEL\] Note:/.test(s);
vc.on("jsDomError", (e) => { if (!ignoreErr(String(e))) errors.push(String(e.message || e)); });
vc.on("error", (...a) => { const s = a.map(String).join(" "); if (!ignoreErr(s)) errors.push(s); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
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
      if (!window.HTMLDivElement.prototype.scrollIntoView) window.HTMLDivElement.prototype.scrollIntoView = function () {};
      if (!window.HTMLCanvasElement.prototype.getContext.__stubbed) {
        const proto = window.HTMLCanvasElement.prototype;
        proto.getContext = function () {
          const el = this;
          return new Proxy({}, { get(_t, k) { if (k === "canvas") return el; return () => {}; }, set() { return true; } });
        };
        proto.getContext.__stubbed = true;
      }
      window.fetch = () => Promise.reject(new Error("disabled"));
    },
  });
  const w = dom.window;
  const d = w.document;
  const t0 = Date.now();
  while (d.readyState !== "complete" && Date.now() - t0 < 60000) await sleep(200);
  await sleep(5000);
  console.log(`story: ${JSON.stringify(w.HCStory && w.HCStory.get())}`);
  console.log(`pre-state: nic-in-dom=${!!d.querySelector(".hc-nic-module")} event-modules=${d.querySelectorAll(".hc-event-module").length}`);
  try { w.openNicEvent(); } catch (e) { console.log("openNicEvent THREW:", e.message); }
  for (let i = 1; i <= 12; i++) {
    await sleep(500);
    const nic = d.querySelector(".hc-nic-module");
    console.log(`t=${i * 500}ms nic=${!!nic} modules=${d.querySelectorAll(".hc-event-module").length} errors=${errors.length}`);
    if (nic) break;
  }
  try { w.resetNicEvent(); w.openNicEvent(); } catch (e) { console.log("retry THREW:", e.message); }
  await sleep(2000);
  console.log(`after retry: nic=${!!d.querySelector(".hc-nic-module")} errors=${errors.length ? errors.slice(0, 3).join(" | ") : "none"}`);
  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.stack || e); process.exit(1); });
