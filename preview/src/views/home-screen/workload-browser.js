import { HOME_WORKLOADS } from "../../mock/workloads.js";
import { bridgeWorkloadCard, bridgeWorkloadIcon } from "../../shared/react-bridge.js";
import EnergyServiceCard from "../../components/energy-service-card/index.jsx";
import WorkloadBrowserShell from "./workload-browser-shell.jsx";

// 工作负载浏览器 —— 外壳（排序/浏览控件框架）由 React 渲染（workload-browser-shell.jsx），
// 控制器在此持久化：卡片列表/滚动轨道内容命令式填充（虚拟滚动 + 卡片缓存 +
// pointermove 交互密集，不适合声明式重写）。切换类目时重置状态复用同一 DOM。

let shellApi = null;
let controller = null;

export function initWorkloadBrowser() {
  // 脱离文档的 root 宿主 —— 外壳通过 portal 直接渲染为 #screen 的子元素
  // （#screen>*{position:absolute} 只作用于直接子元素，不能加包装 div）
  const host = document.createElement("div");
  ReactDOM.createRoot(host).render(
    React.createElement(WorkloadBrowserShell, {
      onReady(nodes) {
        shellApi = nodes;
        controller = createController(nodes);
      },
    })
  );
}

export function showWorkloads(category, filter = 0) {
  if (parent !== window) parent.postMessage({ type: "hc-home-category", category }, location.origin === "null" ? "*" : location.origin);
  const isWorkload = category === "training" || category === "inference";
  document.getElementById("screen").dataset.category = category;
  if (!shellApi) return;
  if (isWorkload) shellApi.setCategory(category);
  shellApi.view.hidden = !isWorkload;
  if (!isWorkload) { document.getElementById("screen").dataset.resourceMetric = filter; return; }
  controller(category, filter);
}

function createController(N) {
  const { view, select, track, segments, windowBox, range, left, position, right, reverse, prev, next, list, browser } = N;
  const rank = { interrupted: 0, stuck: 1, degraded: 2, normal: 3 };
  const labels = { interrupted: "中断", stuck: "卡死", degraded: "劣化", normal: "正常" };
  const colors = { interrupted: "#d87a88", stuck: "#ca9466", degraded: "#c6b079", normal: "#638c79" };
  let category = null, filter = 0;
  let capacity = 4, stride = 257;
  let start = 0, items = [], order = [], reversed = false;
  let railSignature = null, listSignature = null;
  const cardCache = new Map();

  const key = (item) => item.data.name + "|" + item.data.start;
  const maxStart = () => Math.ceil(Math.max(0, items.length - capacity) / 2) * 2;

  let railPointer = null, railActive = null, railCandidate = null, railTimer = 0, railLockedUntil = 0, railHitZones = [];
  function expandRail(target) {
    clearTimeout(railTimer); railCandidate = null; railActive = target; railLockedUntil = performance.now() + 260;
    for (const child of segments.children) child.classList.toggle("is-expanded", child === target);
  }
  segments.addEventListener("pointermove", (event) => {
    const point = { x: event.clientX, y: event.clientY };
    if (railPointer && Math.hypot(point.x - railPointer.x, point.y - railPointer.y) < 2) return;
    railPointer = point; clearTimeout(railTimer);
    if (performance.now() < railLockedUntil) return;
    if (railActive?.isConnected) { const rect = railActive.getBoundingClientRect(); if (point.x >= rect.left - 4 && point.x <= rect.right + 4) { railCandidate = null; return; } }
    const target = railHitZones.find((zone) => point.x >= zone.left && point.x <= zone.right)?.node || event.target.closest(".workload-rail-item"); if (!target) return;
    if (!railActive) { expandRail(target); return; }
    railCandidate = target; railTimer = setTimeout(() => { if (railCandidate === target && target.isConnected) expandRail(target); }, 100);
  });
  segments.addEventListener("pointerleave", () => { clearTimeout(railTimer); railPointer = null; expandRail(null); railLockedUntil = 0; });
  segments.addEventListener("pointerenter", () => { clearTimeout(railTimer); railHitZones = Array.from(segments.children, (node) => ({ node, left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right })); });

  function updateRangeFrame() {
    const first = segments.children[start], last = segments.children[Math.min(items.length, start + capacity) - 1];
    if (!first || !last) return;
    windowBox.style.left = (first.offsetLeft - 4) + "px"; windowBox.style.width = (last.offsetLeft + last.offsetWidth - first.offsetLeft + 8) + "px";
    windowBox.setAttribute("aria-label", `本页第 ${start + 1} 至 ${Math.min(items.length, start + capacity)} 个对象`);
  }
  const railResize = new ResizeObserver(() => { if (!track.isConnected) { railResize.disconnect(); return; } updateRangeFrame(); }); railResize.observe(track);

  function paint() {
    const count = items.length; start = Math.max(0, Math.min(start, maxStart())); const end = Math.min(count, start + capacity);
    range.max = maxStart(); range.step = 2; range.value = start; range.disabled = count <= capacity;
    range.setAttribute("aria-valuetext", count ? `第 ${start + 1} 至 ${end} 个，共 ${count} 个` : "没有符合条件的对象");
    windowBox.hidden = !count; updateRangeFrame();
    position.textContent = count ? `${start + 1}–${end} / ${count} 个` : "0 个"; prev.disabled = start === 0; next.disabled = start >= maxStart();
    Array.from(segments.children).forEach((n, i) => n.classList.toggle("in-window", i >= start && i < end));
  }
  function navigate(index, smooth = false) {
    start = Math.max(0, Math.min(Math.round(index / 2) * 2, maxStart())); paint();
    list.scrollTo({ top: start / 2 * stride, behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
  }

  function drawList() {
    const scroll = list.scrollTop, keys = items.map(key), signature = keys.join("~"), structureChanged = signature !== listSignature;
    const cards = items.map((item, i) => {
      const { quality, ok, fail, total, ...stable } = item.data, cacheKey = key(item), content = JSON.stringify([item.status, stable]);
      let entry = cardCache.get(cacheKey);
      if (!entry || entry.content !== content) {
        const card = category === "inference" && filter === 5 ? energyServiceCard(item) : bridgeWorkloadCard({ kind: category, status: item.status, data: item.data });
        entry = { card, content }; const old = cardCache.get(cacheKey)?.card; if (old?.isConnected) old.replaceWith(card); cardCache.set(cacheKey, entry);
      }
      const card = entry.card; card.style.left = ((i % 2) * 678) + "px"; card.style.top = (20 + Math.floor(i / 2) * stride) + "px"; card.dataset.browserKey = cacheKey;
      const q = card.querySelector(".hc-quality"); if (q) { const value = (category === "inference" && Number(total) > 0 ? 100 * Number(ok) / Number(total) : parseFloat(quality ?? "99.50")).toFixed(2); if (q.firstChild.nodeValue !== value) q.firstChild.nodeValue = value; }
      const counts = card.querySelector(".hc-request-counts"); if (counts) { const text = (total ?? "123860") + " / " + (ok ?? "123237") + " / "; if (counts.firstChild.nodeValue !== text) counts.firstChild.nodeValue = text; const failed = counts.lastElementChild; if (failed.textContent !== String(fail ?? "1623")) failed.textContent = String(fail ?? "1623"); }
      return card;
    });
    if (structureChanged || !list.childNodes.length) {
      listSignature = signature; list.replaceChildren(...cards);
      if (!items.length) { const empty = document.createElement("p"); empty.className = "workload-browser-empty"; empty.textContent = "暂无符合条件的对象"; list.append(empty); }
      else { const tail = document.createElement("div"); tail.setAttribute("aria-hidden", "true"); tail.style.cssText = "position:absolute;width:1px;height:1px;top:" + (maxStart() / 2 * stride + 591) + "px"; list.append(tail); }
      list.scrollTop = scroll;
    }
    const active = new Set(keys); for (const cacheKey of cardCache.keys()) if (!active.has(cacheKey)) cardCache.delete(cacheKey);
  }
  list.addEventListener("scroll", () => { start = Math.min(maxStart(), Math.floor((list.scrollTop + 1) / stride) * 2); paint(); }, { passive: true });
  prev.onclick = () => navigate(start - capacity, true); next.onclick = () => navigate(start + capacity, true);

  function renderCards(resort = false) {
    if (view.hidden || document.getElementById("screen").dataset.category !== category) return;
    const source = window.storyWorkloads ? window.storyWorkloads(category) : HOME_WORKLOADS[category];
    const fresh = source.filter((x) => category === "inference" && filter === 5 ? x.data.energySaving : !filter || x.status === ["", "interrupted", "stuck", "degraded", "normal"][filter]);
    const sorted = fresh.slice().sort((a, b) => select.value === "status" ? rank[a.status] - rank[b.status] : select.value === "quality" ? parseFloat(a.data.quality) - parseFloat(b.data.quality) : Number(b.data.npu) - Number(a.data.npu));
    if (reversed) sorted.reverse();
    if (resort || !order.length) { order = sorted.map(key); start = 0; } else { const existing = new Set(fresh.map(key)); order = order.filter((k) => existing.has(k)); const known = new Set(order); sorted.forEach((x) => { if (!known.has(key(x))) order.push(key(x)); }); }
    const lookup = new Map(fresh.map((x) => [key(x), x])); items = order.map((k) => lookup.get(k)).filter(Boolean);
    const values = items.map((x) => parseFloat(x.data[select.value === "npu" ? "npu" : "quality"])).filter(Number.isFinite), lo = Math.min(...values), hi = Math.max(...values);
    const signature = items.map((item) => key(item) + "|" + item.status).join("~");
    if (signature !== railSignature) {
      railSignature = signature; segments.replaceChildren(...items.map((item, i) => {
        const n = document.createElement("button"); n.type = "button"; n.className = "workload-rail-item"; n.dataset.status = item.status; n.style.setProperty("--status-color", colors[item.status] || "#777"); n.setAttribute("aria-label", item.data.name + "，" + labels[item.status] + "，定位卡片");
        const short = document.createElement("span"); short.className = "rail-short"; short.textContent = Array.from(item.data.name)[0];
        const copy = document.createElement("span"); copy.className = "rail-copy"; const name = document.createElement("strong"); name.textContent = item.data.name; const status = document.createElement("small"); status.textContent = labels[item.status]; copy.append(name, status);
        n.append(bridgeWorkloadIcon(item.data.name), short, copy); n.onclick = () => { navigate(i); list.querySelectorAll(".rail-card-focus").forEach((c) => c.classList.remove("rail-card-focus")); list.children[i]?.classList.add("rail-card-focus"); };
        n.onkeydown = (event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); segments.children[Math.max(0, Math.min(items.length - 1, i + (event.key === "ArrowRight" ? 1 : -1)))]?.focus(); } }; return n;
      }));
      railResize.disconnect(); railResize.observe(track); for (const child of segments.children) railResize.observe(child);
    }
    left.textContent = !items.length ? "" : select.value === "status" ? (reversed ? "正常 → 劣化 → 卡死 → 中断" : "中断 → 卡死 → 劣化 → 正常") : (select.value === "npu" ? (reversed ? lo : hi) + " 卡" : (reversed ? hi : lo).toFixed(2) + "%");
    right.textContent = !items.length || select.value === "status" ? "" : select.value === "npu" ? (reversed ? hi : lo) + " 卡" : (reversed ? lo : hi).toFixed(2) + "%";
    browser.removeAttribute("title"); drawList(); if (resort) navigate(0); else { if (list.scrollTop > maxStart() / 2 * stride) list.scrollTop = maxStart() / 2 * stride; start = Math.floor((list.scrollTop + 1) / stride) * 2; paint(); }
  }
  reverse.onclick = () => { reversed = !reversed; reverse.setAttribute("aria-pressed", String(reversed)); renderCards(true); };
  select.onchange = () => renderCards(true); range.oninput = () => navigate(Number(range.value));
  window.refreshWorkloadCards = () => renderCards(false);

  function activate(nextCategory, nextFilter) {
    category = nextCategory; filter = nextFilter;
    capacity = category === "training" ? 6 : 4;
    stride = category === "training" ? 189 : 257;
    start = 0; items = []; order = []; reversed = false;
    railSignature = null; listSignature = null; cardCache.clear();
    view.dataset.filter = filter;
    select.value = "status";
    reverse.setAttribute("aria-pressed", "false");
    segments.replaceChildren();
    list.replaceChildren();
    renderCards(true);
  }
  return activate;
}

// 节能服务卡片 —— React 组件渲染（结构/样式 JSX 化），桥接层原生绑定交互
// （卡片节点移入命令式缓存列表后 React 合成事件失效，必须原生 onclick/onkeydown）
function energyServiceCard({ status, data }) {
  const host = document.createElement("div");
  ReactDOM.flushSync(() => {
    ReactDOM.createRoot(host).render(React.createElement(EnergyServiceCard, { status, data }));
  });
  const card = host.firstElementChild;
  card.onclick = () => window.openEnergyService?.(data);
  card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.openEnergyService?.(data); } };
  return card;
}

// 工作负载浏览器相关 window API 注册
export function initWorkloadBrowserWindowAPI() {
  window.showWorkloads = showWorkloads;
}
