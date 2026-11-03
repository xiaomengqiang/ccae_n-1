const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("./verify-env/node_modules/jsdom");

const ROOT = path.resolve(__dirname, "..");
const PREVIEW = path.join(ROOT, "preview");
const PAGE = path.join(PREVIEW, "index.page.html");
const results = [];
let failed = 0;

function check(name, ok, detail) {
  if (ok) results.push(`PASS  ${name}${detail ? " — " + detail : ""}`);
  else { results.push(`FAIL  ${name}${detail ? " — " + detail : ""}`); failed++; }
}

const html = fs.readFileSync(PAGE, "utf8");
const refs = [...html.matchAll(/["'(](\.\/assets\/[A-Za-z0-9._\-/@]+)["')]/g)].map((m) => m[1]);
const uniqRefs = [...new Set(refs)];
let missing = uniqRefs.filter((r) => !fs.existsSync(path.join(PREVIEW, r)));
check("asset references resolve on disk", missing.length === 0, `${uniqRefs.length} unique refs${missing.length ? ", missing: " + missing.slice(0, 5).join(", ") : ""}`);

const vc = new VirtualConsole();
const jsErrors = [];
const ignoreErr = (s) => /Could not parse CSS/.test(s) || /\[BABEL\] Note:/.test(s);
vc.on("jsDomError", (e) => { if (!ignoreErr(String(e))) jsErrors.push(String(e.message || e)); });
vc.on("error", (...a) => { const s = a.map(String).join(" "); if (!ignoreErr(s)) jsErrors.push(s); });

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
      window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, addEventListener() {}, dispatchEvent() { return false; } }));
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
      };
      if (!window.Element.prototype.animate) window.Element.prototype.animate = function () { return { cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve() }; };
      window.__verifyFetchCalls = 0;
      window.fetch = () => { window.__verifyFetchCalls++; return Promise.reject(new Error("fetch disabled in verify")); };
    },
  });
  const w = dom.window;
  const t0 = Date.now();
  while (w.document.readyState !== "complete" && Date.now() - t0 < 30000) await sleep(200);
  await sleep(4000);

  const d = w.document;
  const root = d.getElementById("root");
  check("React mounted into #root", !!root && root.children.length > 0);

  const screen = d.querySelector("main#screen");
  check("main#screen rendered", !!screen);
  check("#screen has hc-surface class", !!screen && screen.classList.contains("hc-surface"));

  const cabinet = d.querySelector(".cabinet-art");
  check("cabinet art img present with asset path", !!cabinet && String(cabinet.getAttribute("src")).includes("./assets/icons/"), cabinet ? String(cabinet.getAttribute("src")).slice(0, 60) : "missing");
  const npuArt = d.querySelector(".cabinet-npu-art");
  check("cabinet NPU/HBM/energy art present", !!npuArt && !!d.querySelector(".cabinet-hbm-art") && !!d.querySelector(".cabinet-energy-art"));

  const contour = d.querySelector(".panel-contour");
  check("panel-contour present (svg after entrance swap)", !!contour, contour ? contour.tagName : "missing");

  const events = d.getElementById("home-events");
  check("guard events list populated (#home-events)", !!events && events.children.length > 0, events ? events.children.length + " children" : "missing");

  const markers = d.getElementById("home-timeline-markers");
  let markerCount = markers ? markers.children.length : 0;
  if (markerCount === 0 && w.HCStory && typeof w.HCStory.start === "function") {
    w.HCStory.start();
    await sleep(2600);
    markerCount = markers ? markers.children.length : 0;
  }
  check("timeline markers advanced", markerCount >= 1, markerCount + " markers");

  const motion = d.querySelector(".agent-motion");
  const layers = motion ? motion.querySelectorAll("[data-motion]") : [];
  check("mascot motion layers present", layers.length >= 7, layers.length + " layers");
  const mascotSrcOk = [...layers].every((el) => String(el.getAttribute("src") || "").includes("/assets/mascot/") || String(el.getAttribute("src") || "").startsWith("data:"));
  check("mascot layer srcs use extracted assets", layers.length > 0 && mascotSrcOk);

  const workloads = d.getElementById("home-workloads");
  let wlChildren = workloads ? workloads.children.length : -1;
  if (wlChildren === 0) {
    const ribbon = d.querySelector("#home-metrics .hc-ribbon");
    if (ribbon && typeof ribbon.activate === "function") {
      try { ribbon.activate("training", 0, true); } catch (e) { jsErrors.push("ribbon.activate: " + e.message); }
    }
    await sleep(400);
    wlChildren = workloads ? workloads.children.length : -1;
  }
  check("workload browser renders on demand", wlChildren > 0 && workloads && !workloads.hidden, wlChildren + " children, hidden=" + (workloads ? workloads.hidden : "n/a"));

  const fns = ["openOpticalEvent", "openNicEvent", "openEnergyService", "openGuardEvents", "restartMascotEntrance", "renderStoryGuard"];
  const fnsOk = fns.filter((f) => typeof w[f] === "function");
  check("legacy global API intact", fnsOk.length === fns.length, `${fnsOk.length}/${fns.length}: ${fnsOk.join(",")}`);

  check("HCStory live", !!w.HCStory && typeof w.HCStory.subscribe === "function" || !!w.HCStory);
  check("HCEvidence (AI-edited version) live", typeof w.HCEvidence === "object" && typeof w.HCEvidence.attach === "function");

  const screenBefore = screen ? screen.querySelectorAll("*").length : 0;
  if (typeof w.openGuardEvents === "function") {
    try { w.openGuardEvents(); } catch (e) { jsErrors.push("openGuardEvents: " + e.message); }
    await sleep(300);
    const screenAfter = screen ? screen.querySelectorAll("*").length : 0;
    check("guard events full page mounts", screenAfter > screenBefore, `${screenBefore} -> ${screenAfter} nodes`);
  }

  if (w.HCStory && typeof w.HCStory.reset === "function") {
    try { w.HCStory.reset(); } catch (e) { jsErrors.push("story.reset: " + e.message); }
    await sleep(400);
  }

  const overlayMounts = [
    ["optical event overlay", () => w.openOpticalEvent(), () => w.closeOpticalEvent(), "#optical-event-root, .hc-optical-module, [class*=optical-event]"],
    ["nic event overlay", () => w.openNicEvent(), () => w.closeNicEvent(), ".hc-nic-module, [class*=nic-event], #nic-event-root"],
    ["energy service overlay", () => w.openEnergyService({ name: "Qwen3.7" }), () => (typeof w.closeEnergyDetail === "function" ? w.closeEnergyDetail() : null), "#hc-energy-root, [class*=hc-energy]"],
  ];
  for (const [name, open, close, sel] of overlayMounts) {
    let ok = false;
    let detail = "not opened";
    if (typeof open === "function") {
      try { open(); } catch (e) { jsErrors.push(name + ": " + e.message); }
      for (let i = 0; i < 20 && !ok; i++) {
        await sleep(300);
        ok = !!d.querySelector(sel);
      }
      detail = `sel=${ok} nodes=${d.querySelectorAll("#screen *").length}`;
      if (typeof close === "function") {
        try { close(); } catch (e) { jsErrors.push(name + " close: " + e.message); }
        await sleep(200);
      }
    }
    check(name + " mounts", ok, detail);
  }

  const roomWrap = d.getElementById("home-room-overview");
  const roomFrame = roomWrap && roomWrap.querySelector("iframe");
  check("room overview component mounted", !!roomWrap && !!roomFrame);
  if (roomFrame) {
    await sleep(1200);
    check("room scene iframe lazy-loaded", String(roomFrame.getAttribute("src") || "").includes("multi-cabinet-scene.html"), String(roomFrame.getAttribute("src") || "no-src").slice(0, 60));
  }
  const legend = d.getElementById("cabinet-device-legend");
  check("device legend hidden while overview active", !!legend && legend.hidden);
  const normalBox = legend && legend.querySelector('input[data-state="normal"]');
  if (normalBox) {
    normalBox.click();
    await sleep(200);
    check("legend toggle updates screen classes", !d.getElementById("screen").classList.contains("cabinet-hide-normal"));
  }
  const ribbonForRoom = d.querySelector("#home-metrics .hc-ribbon");
  if (ribbonForRoom && typeof ribbonForRoom.activate === "function") {
    ribbonForRoom.activate("training", 0, true);
    await sleep(300);
    const wrapHidden = d.getElementById("home-room-overview")?.hidden;
    check("room overview hides on non-resource category", wrapHidden === true, "hidden=" + wrapHidden);
    ribbonForRoom.activate("resource", 0, true);
    await sleep(300);
  }

  if (typeof w.restartMascotEntrance === "function") {
    try { w.restartMascotEntrance(); } catch (e) { jsErrors.push("restartMascotEntrance: " + e.message); }
    await sleep(300);
    const onLayers = d.querySelectorAll(".agent-motion [data-motion].on").length;
    check("mascot entrance replays via restartMascotEntrance", onLayers >= 2, onLayers + " layers on");
  }
  check("entrance pending class removed", screen ? !screen.classList.contains("home-entrance-pending") : false);

  check("no runtime js errors", jsErrors.length === 0, jsErrors.length ? jsErrors.slice(0, 3).join(" | ").slice(0, 300) : "");
  check("no fetch() calls (file:// safe)", (w.__verifyFetchCalls || 0) === 0, String(w.__verifyFetchCalls || 0));

  console.log(results.join("\n"));
  console.log(failed === 0 ? `\nOK    ${results.length - failed}/${results.length} checks passed` : `\nFAILED  ${failed} check(s) failed`);
  w.close();
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => { console.error("VERIFY CRASH:", e.stack || e); process.exit(1); });
