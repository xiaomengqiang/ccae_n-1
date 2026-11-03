import { HOME_WORKLOADS } from "../../mock/workloads.js";
import { HC_ASSETS } from "../../mock/hc-assets.js";

// 工作负载浏览器 —— 从 initHomeScreen 提取的独立模块
// 命令式 DOM 操作（rail 滚动浏览器 + WorkloadCard 列表 + 排序/反转/翻页）
// 交互密集（pointermove/scroll/ResizeObserver 卡片缓存），暂不做声明式重写
// 后续 React 化时替换为 views/home-screen/workload-browser/index.jsx

let workloadView = null;
let currentCategory = null;
let currentFilter = 0;

export function initWorkloadBrowser() {
  workloadView = document.createElement("section");
  workloadView.id = "home-workloads";
  workloadView.hidden = true;
  document.getElementById("screen").append(workloadView);
}

export function showWorkloads(category, filter = 0) {
  if (parent !== window) parent.postMessage({ type: "hc-home-category", category }, location.origin === "null" ? "*" : location.origin);
  currentCategory = category;
  currentFilter = filter;
  const isWorkload = category === "training" || category === "inference";
  document.getElementById("screen").dataset.category = category;
  workloadView.hidden = !isWorkload;
  if (!isWorkload) { document.getElementById("screen").dataset.resourceMetric = filter; return; }
  renderWorkloadView(category, filter);
}

function renderWorkloadView(category, filter) {
  const C = window.HCComponents;
  workloadView.replaceChildren();
  workloadView.dataset.filter = filter;
  workloadView.classList.add("windowed-workloads");
  const heading = document.createElement("h2"); heading.textContent = category === "training" ? "训练作业" : "推理服务";
  const select = document.createElement("select"); select.setAttribute("aria-label", "对象排序");
  for (const [value, text] of [["status", "按状态排序"], ["quality", category === "training" ? "按可用度排序" : "按成功率排序"], ["npu", "按卡数排序"]]) {
    const option = document.createElement("option"); option.value = value; option.textContent = text; select.append(option);
  }
  const sortWrap = document.createElement("div"); sortWrap.className = "workload-sort"; sortWrap.append(select);
  const browser = document.createElement("div"); browser.className = "workload-browser";
  const track = document.createElement("div"); track.className = "workload-browser-track";
  const segments = document.createElement("div"); segments.className = "workload-browser-segments";
  const windowBox = document.createElement("div"); windowBox.className = "workload-browser-window";
  const range = document.createElement("input"); range.type = "range"; range.min = 0; range.step = 1; range.className = "workload-browser-keyboard"; range.setAttribute("aria-label", "浏览当前屏对象，方向键移动范围");
  track.append(segments, windowBox, range);
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
  const captions = document.createElement("div"); captions.className = "workload-browser-captions";
  const left = document.createElement("span"), position = document.createElement("span"), right = document.createElement("span"); position.hidden = true; captions.append(left, position, right); browser.append(track, captions);
  const list = document.createElement("div"); list.className = "workload-list";
  const prev = document.createElement("button"), next = document.createElement("button"); prev.textContent = "‹"; next.textContent = "›"; prev.setAttribute("aria-label", "上一页"); next.setAttribute("aria-label", "下一页"); prev.className = next.className = "workload-browser-page";
  const pages = document.createElement("span"); pages.className = "workload-browser-pages"; pages.append(prev, next); browser.append(pages);
  const reverse = document.createElement("button"); reverse.className = "workload-browser-reverse"; reverse.textContent = "⇄"; reverse.type = "button"; reverse.setAttribute("aria-label", "反转排序方向"); reverse.setAttribute("aria-pressed", "false"); reverse.title = "反转排序方向"; left.after(reverse);
  const controls = document.createElement("div"); controls.className = "workload-controls"; controls.setAttribute("aria-label", heading.textContent + "排序与浏览"); controls.append(sortWrap, browser); workloadView.append(controls, list);
  const capacity = category === "training" ? 6 : 4;
  const rank = { interrupted: 0, stuck: 1, degraded: 2, normal: 3 };
  const labels = { interrupted: "中断", stuck: "卡死", degraded: "劣化", normal: "正常" };
  const colors = { interrupted: "#d87a88", stuck: "#ca9466", degraded: "#c6b079", normal: "#638c79" };
  let start = 0, items = [], order = [], reversed = false, railSignature = "";
  function key(item) { return item.data.name + "|" + item.data.start; }
  const stride = category === "training" ? 189 : 257;
  const maxStart = () => Math.ceil(Math.max(0, items.length - capacity) / 2) * 2;
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
  const cardCache = new Map(); let listSignature = "";
  function drawList() {
    const scroll = list.scrollTop, keys = items.map(key), signature = keys.join("~"), structureChanged = signature !== listSignature;
    const cards = items.map((item, i) => {
      const { quality, ok, fail, total, ...stable } = item.data, cacheKey = key(item), content = JSON.stringify([item.status, stable]);
      let entry = cardCache.get(cacheKey);
      if (!entry || entry.content !== content) {
        const card = category === "inference" && filter === 5 ? energyServiceCard(item) : C.WorkloadCard({ kind: category, status: item.status, data: item.data });
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
    if (workloadView.hidden || document.getElementById("screen").dataset.category !== category) return;
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
        n.append(C.WorkloadIcon(item.data.name), short, copy); n.onclick = () => { navigate(i); list.querySelectorAll(".rail-card-focus").forEach((c) => c.classList.remove("rail-card-focus")); list.children[i]?.classList.add("rail-card-focus"); };
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
  window.refreshWorkloadCards = () => renderCards(false); renderCards(true);
}

function energyServiceCard({ status, data }) {
  const C = window.HCComponents;
  const card = document.createElement("article"); card.className = "hc-workload hc-energy-card"; card.setAttribute("aria-label", data.name + " 节能服务卡片"); card.setAttribute("role", "button"); card.tabIndex = 0; card.onclick = () => window.openEnergyService?.(data); card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.openEnergyService?.(data); } }; card.style.left = "0"; card.style.top = "20px";
  const header = document.createElement("header"); const name = document.createElement("strong"); name.textContent = data.name; const normal = C.Status({ status }); const energy = document.createElement("span"); energy.className = "hc-status normal"; energy.textContent = "节能中"; const leaf = document.createElement("img"); leaf.src = HC_ASSETS.icons["绿色叶子"]; leaf.alt = ""; leaf.className = "energy-label-leaf"; energy.prepend(leaf); const date = document.createElement("time"); date.textContent = data.start; const logo = C.WorkloadIcon(data.name); header.append(logo, name, normal, energy, date); card.append(header);
  const fields = document.createElement("dl");
  for (const [name, value] of [["百万Token能耗", (Number(data.energyUnit || 1.82) / 3.6).toFixed(2) + " kWh/Mtoken"], ["总能耗", data.energyTotal], ["节省能耗", data.energySaved], ["节能增益", data.energyGain], ["卡数", data.npu + " 卡"], ["TTFT", data.ttft], ["TPOT", data.tpot]]) {
    const field = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = name; dd.textContent = value;
    if (name === "百万Token能耗") { field.className = "energy-primary"; dt.append(window.energyGradeTag(data)); dd.innerHTML = (Number(data.energyUnit || 1.82) / 3.6).toFixed(2) + " <small>kWh/Mtoken</small>"; }
    field.append(dt, dd); fields.append(field);
  }
  card.append(fields);
  const chart = document.createElementNS("http://www.w3.org/2000/svg", "svg"); chart.classList.add("energy-spark"); chart.setAttribute("viewBox", "0 0 70 30"); chart.setAttribute("role", "img"); chart.setAttribute("aria-label", "百万Token能耗趋势"); chart.innerHTML = '<path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20V29H1Z" fill="#3ac58d" opacity=".2"/><path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20" fill="none" stroke="#3ac58d" stroke-width="2"/>'; card.append(chart);
  return card;
}

// 工作负载浏览器相关 window API 注册
export function initWorkloadBrowserWindowAPI() {
  window.showWorkloads = showWorkloads;
}
