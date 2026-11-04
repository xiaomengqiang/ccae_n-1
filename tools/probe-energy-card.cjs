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
  const tiles = ribbon?.querySelectorAll(".hc-metric-group[data-category=inference] .hc-metric");
  console.log("inference tiles:", tiles?.length);

  // Click the "节能中" tile (index 5)
  if (tiles && tiles.length > 5) {
    tiles[5].click();
    await sleep(500);
    console.log("after 节能中 click: category=" + ribbon.dataset.category);
    const workloadView = d.getElementById("home-workloads");
    console.log("workloadView hidden:", workloadView?.hidden);
    console.log("workloadView filter:", workloadView?.dataset?.filter);

    // Check if energy cards are rendered
    const energyCards = workloadView?.querySelectorAll(".hc-energy-card");
    console.log("energy cards:", energyCards?.length);

    // Try clicking an energy card
    if (energyCards && energyCards.length > 0) {
      energyCards[0].click();
      await sleep(500);
      const energyRoot = d.getElementById("hc-energy-root");
      console.log("energy root exists:", !!energyRoot);
      console.log("energy root hidden:", energyRoot?.hidden);
    } else {
      console.log("no energy cards found - checking workload cards:");
      const cards = workloadView?.querySelectorAll(".hc-workload");
      console.log("total workload cards:", cards?.length);
      if (cards) {
        cards.forEach((c, i) => {
          if (i < 3) console.log("  card" + i + ":", c.className.substring(0, 40), "aria:", c.getAttribute("aria-label")?.substring(0, 50));
        });
      }
    }
  }

  w.close();
  process.exit(0);
})().catch((e) => { console.error("CRASH:", e.message); process.exit(1); });
