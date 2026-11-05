import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { HOME_WORKLOADS } from "../../mock/workloads.js";
import WorkloadCard from "../../components/workload-card/index.jsx";
import EnergyServiceCard from "../../components/energy-service-card/index.jsx";

// 工作负载浏览器（全 React 版）—— 首页点「训练作业/推理服务」后的对象卡片列表。
// portal 直挂 #screen（直接子元素才能命中 #screen>*{position:absolute}）。
// 卡片缓存语义由 React.memo 承接（item 引用变化才重渲染，等价原签名 diff）；
// rail hover 三段防抖（位移阈值/260ms 锁定/100ms 延迟展开）保留 ref 状态机直改 class
// （高频 pointermove，与 focus-dim 同级共存模式）。
// window.showWorkloads / refreshWorkloadCards 由 effect 注册。

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

const RANK = { interrupted: 0, stuck: 1, degraded: 2, normal: 3 };
const LABELS = { interrupted: "中断", stuck: "卡死", degraded: "劣化", normal: "正常" };
const COLORS = { interrupted: "#d87a88", stuck: "#ca9466", degraded: "#c6b079", normal: "#638c79" };
const STATUS_ORDER = ["", "interrupted", "stuck", "degraded", "normal"];

const keyOf = (item) => item.data.name + "|" + item.data.start;

// 源列表（过滤 + 排序 + 反转）—— 纯函数
function sourceSorted(category, filter, sortBy, reversed) {
  const energyMode = category === "inference" && filter === 5;
  const source = window.storyWorkloads ? window.storyWorkloads(category) : HOME_WORKLOADS[category];
  const fresh = source.filter((x) => energyMode ? x.data.energySaving : !filter || x.status === STATUS_ORDER[filter]);
  const sorted = fresh.slice().sort((a, b) =>
    sortBy === "status" ? RANK[a.status] - RANK[b.status]
      : sortBy === "quality" ? parseFloat(a.data.quality) - parseFloat(b.data.quality)
      : Number(b.data.npu) - Number(a.data.npu));
  if (reversed) sorted.reverse();
  return sorted;
}

// ---- 单张卡片（memo：item 引用变化才重渲染 —— 等价原卡片缓存签名 diff） ----
const CardItem = memo(function CardItem({ item, kind, energyMode, index, stride }) {
  const left = (index % 2) * 678 + "px";
  const top = 20 + Math.floor(index / 2) * stride + "px";
  if (energyMode) {
    return (
      <div
        role="button" tabIndex={0}
        style={{ position: "absolute", left, top }} data-browser-key={keyOf(item)}
        onClick={() => window.openEnergyService?.(item.data)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.openEnergyService?.(item.data); } }}
      >
        <EnergyServiceCard status={item.status} data={item.data} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left, top }} data-browser-key={keyOf(item)}>
      <WorkloadCard kind={kind} status={item.status} data={item.data} />
    </div>
  );
});

// ---- rail 色块轨道 + 三段防抖 hover（ref 状态机直改 class） ----
function Rail({ items, activeIndex, capacity, onLocate }) {
  const segmentsRef = useRef(null);
  const boxRef = useRef(null);
  const state = useRef({ pointer: null, active: null, candidate: null, timer: 0, lockedUntil: 0, zones: [] });

  const expandRail = useCallback((target) => {
    const s = state.current;
    clearTimeout(s.timer); s.candidate = null; s.active = target;
    s.lockedUntil = performance.now() + 260;
    const segments = segmentsRef.current;
    if (segments) for (const child of segments.children) child.classList.toggle("is-expanded", child === target);
  }, []);

  useEffect(() => {
    const segments = segmentsRef.current;
    if (!segments) return;
    const s = state.current;
    const onMove = (event) => {
      const point = { x: event.clientX, y: event.clientY };
      if (s.pointer && Math.hypot(point.x - s.pointer.x, point.y - s.pointer.y) < 2) return;
      s.pointer = point; clearTimeout(s.timer);
      if (performance.now() < s.lockedUntil) return;
      if (s.active?.isConnected) {
        const rect = s.active.getBoundingClientRect();
        if (point.x >= rect.left - 4 && point.x <= rect.right + 4) { s.candidate = null; return; }
      }
      const target = s.zones.find((zone) => point.x >= zone.left && point.x <= zone.right)?.node || event.target.closest(".workload-rail-item");
      if (!target) return;
      if (!s.active) { expandRail(target); return; }
      s.candidate = target;
      s.timer = setTimeout(() => { if (s.candidate === target && target.isConnected) expandRail(target); }, 100);
    };
    const onLeave = () => { clearTimeout(s.timer); s.pointer = null; expandRail(null); s.lockedUntil = 0; };
    const onEnter = () => {
      clearTimeout(s.timer);
      s.zones = Array.from(segments.children, (node) => ({ node, left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right }));
    };
    segments.addEventListener("pointermove", onMove);
    segments.addEventListener("pointerleave", onLeave);
    segments.addEventListener("pointerenter", onEnter);
    return () => {
      segments.removeEventListener("pointermove", onMove);
      segments.removeEventListener("pointerleave", onLeave);
      segments.removeEventListener("pointerenter", onEnter);
      clearTimeout(s.timer);
    };
  }, [expandRail]);

  // 选中窗口框（offsetLeft 实测定位 + ResizeObserver 跟随）
  useLayoutEffect(() => {
    const box = boxRef.current, segments = segmentsRef.current;
    if (!box || !segments) return;
    const update = () => {
      const first = segments.children[activeIndex], last = segments.children[Math.min(items.length, activeIndex + capacity) - 1];
      if (!first || !last) { box.hidden = !items.length; return; }
      box.style.left = (first.offsetLeft - 4) + "px";
      box.style.width = (last.offsetLeft + last.offsetWidth - first.offsetLeft + 8) + "px";
      box.setAttribute("aria-label", `本页第 ${activeIndex + 1} 至 ${Math.min(items.length, activeIndex + capacity)} 个对象`);
      box.hidden = !items.length;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(segments);
    for (const child of segments.children) ro.observe(child);
    return () => ro.disconnect();
  }, [items, activeIndex, capacity]);

  return (
    <div className="workload-browser-track">
      <div className="workload-browser-segments" ref={segmentsRef}>
        {items.map((item, i) => (
          <button
            key={keyOf(item)}
            type="button"
            className={"workload-rail-item" + (i >= activeIndex && i < activeIndex + capacity ? " in-window" : "")}
            data-status={item.status}
            style={{ "--status-color": COLORS[item.status] || "#777" }}
            aria-label={item.data.name + "，" + LABELS[item.status] + "，定位卡片"}
            onClick={() => onLocate(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                segmentsRef.current?.children[Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)))]?.focus();
              }
            }}
          >
            <span className="rail-short">{Array.from(item.data.name)[0]}</span>
            <span className="rail-copy"><strong>{item.data.name}</strong><small>{LABELS[item.status]}</small></span>
          </button>
        ))}
      </div>
      <div className="workload-browser-window" ref={boxRef} hidden />
    </div>
  );
}

// ---- 主组件 ----
export default function WorkloadBrowser() {
  const [target, setTarget] = useState(null);
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState("training");
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState("status");
  const [reversed, setReversed] = useState(false);
  const [start, setStart] = useState(0);
  const [order, setOrder] = useState([]);
  const [dataTick, setDataTick] = useState(0);
  const [resetSeq, setResetSeq] = useState(0);

  const listRef = useRef(null);
  const viewRef = useRef(null);
  const reduced = useRef(Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches));

  useEffect(() => setTarget(document.getElementById("screen")), []);

  const capacity = category === "training" ? 6 : 4;
  const stride = category === "training" ? 189 : 257;
  const energyMode = category === "inference" && filter === 5;

  // 排序签名变化（类目/筛选/排序/反转/story 心跳）→ order 增量保持（story 推进时
  // 既有对象次序稳定，新对象按排序位追加 —— 原实现语义）；activate 重置 → 全量重建。
  // useLayoutEffect：paint 前完成（初始/重置帧不闪空列表）
  const rebuildRef = useRef(true);
  useLayoutEffect(() => {
    const sorted = sourceSorted(category, filter, sortBy, reversed);
    setOrder((prevOrder) => {
      const rebuild = rebuildRef.current;
      rebuildRef.current = false;
      if (rebuild) return sorted.map(keyOf);
      const existing = new Set(sorted.map(keyOf));
      const kept = prevOrder.filter((k) => existing.has(k));
      const known = new Set(kept);
      sorted.forEach((x) => { if (!known.has(keyOf(x))) kept.push(keyOf(x)); });
      return kept;
    });
    void dataTick;
  }, [category, filter, sortBy, reversed, dataTick, resetSeq]);

  // items 派生：order × 当前源数据
  const items = useMemo(() => {
    void dataTick;
    const source = window.storyWorkloads ? window.storyWorkloads(category) : HOME_WORKLOADS[category];
    const lookup = new Map(source.map((x) => [keyOf(x), x]));
    return order.map((k) => lookup.get(k)).filter(Boolean);
  }, [order, category, dataTick]);

  // 心跳后滚动钳制（原实现：对象消失列表收缩时把 scrollTop 拉回可视范围）
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && visible) {
      const max = Math.ceil(Math.max(0, items.length - capacity) / 2) * 2 / 2 * stride;
      if (list.scrollTop > max) list.scrollTop = max;
    }
  }, [items.length, capacity, stride, visible]);
  const maxStart = Math.ceil(Math.max(0, items.length - capacity) / 2) * 2;
  const end = Math.min(items.length, start + capacity);

  const navigate = useCallback((index, smooth = false) => {
    setStart((prev) => {
      const next = Math.max(0, Math.min(Math.round(index / 2) * 2, maxStartRef.current));
      listRef.current?.scrollTo({ top: next / 2 * stride, behavior: smooth && !reduced.current ? "smooth" : "auto" });
      return next;
    });
  }, [stride]);
  const maxStartRef = useRef(0);
  maxStartRef.current = maxStart;

  const onListScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setStart(Math.min(maxStartRef.current, Math.floor((list.scrollTop + 1) / stride) * 2));
  }, [stride]);

  // rail 点击 → 定位卡片 + 高亮
  const focusCard = useCallback((i) => {
    const list = listRef.current;
    if (list) {
      list.querySelectorAll(".rail-card-focus").forEach((c) => c.classList.remove("rail-card-focus"));
      const card = [...list.children].find((c) => c.dataset?.browserKey === keyOf(items[i]));
      card?.classList.add("rail-card-focus");
    }
    navigate(i);
  }, [items, navigate]);

  // ---- window API ----
  useEffect(() => {
    const activate = (nextCategory, nextFilter) => {
      setCategory(nextCategory); setFilter(nextFilter);
      setSortBy("status"); setReversed(false); setStart(0);
      rebuildRef.current = true; // 全量重建 order（同参数重复激活也生效）
      setResetSeq((n) => n + 1);
      requestAnimationFrame(() => { if (listRef.current) listRef.current.scrollTop = 0; });
    };
    window.showWorkloads = (category, filter = 0) => {
      if (parent !== window) parent.postMessage({ type: "hc-home-category", category }, location.origin === "null" ? "*" : location.origin);
      const isWorkload = category === "training" || category === "inference";
      const screen = document.getElementById("screen");
      if (screen) screen.dataset.category = category;
      setVisible(isWorkload);
      if (!isWorkload) { if (screen) screen.dataset.resourceMetric = filter; return; }
      activate(category, filter);
    };
    window.refreshWorkloadCards = () => setDataTick((t) => t + 1);
    return () => { window.showWorkloads = undefined; window.refreshWorkloadCards = undefined; };
  }, []);

  if (!target) return null;

  const heading = category === "training" ? "训练作业" : "推理服务";
  const values = items.map((x) => parseFloat(x.data[sortBy === "npu" ? "npu" : "quality"])).filter(Number.isFinite);
  const lo = values.length ? Math.min(...values) : null;
  const hi = values.length ? Math.max(...values) : null;
  const leftLabel = !items.length ? "" : sortBy === "status"
    ? (reversed ? "正常 → 劣化 → 卡死 → 中断" : "中断 → 卡死 → 劣化 → 正常")
    : sortBy === "npu" ? (reversed ? lo : hi) + " 卡" : (reversed ? hi : lo?.toFixed(2)) + "%";
  const rightLabel = !items.length || sortBy === "status" ? ""
    : sortBy === "npu" ? (reversed ? hi : lo) + " 卡" : (reversed ? lo : hi?.toFixed(2)) + "%";

  return createPortal(
    <section id="home-workloads" ref={viewRef} className="windowed-workloads" hidden={!visible} data-filter={filter}>
      <div className="workload-controls" aria-label={heading + "排序与浏览"}>
        <div className="workload-sort">
          <select aria-label="对象排序" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setStart(0); navigate(0); }}>
            <option value="status">按状态排序</option>
            <option value="quality">{category === "training" ? "按可用度排序" : "按成功率排序"}</option>
            <option value="npu">按卡数排序</option>
          </select>
        </div>
        <div className="workload-browser">
          <Rail items={items} activeIndex={start} capacity={capacity} onLocate={focusCard} />
          <input
            type="range" min={0} max={maxStart} step={2}
            value={Math.min(start, maxStart)}
            disabled={items.length <= capacity}
            className="workload-browser-keyboard"
            aria-label="浏览当前屏对象，方向键移动范围"
            aria-valuetext={items.length ? `第 ${start + 1} 至 ${end} 个，共 ${items.length} 个` : "没有符合条件的对象"}
            onChange={(e) => navigate(Number(e.target.value))}
          />
          <div className="workload-browser-captions">
            <span>{leftLabel}</span>
            <button
              type="button" className="workload-browser-reverse" aria-label="反转排序方向"
              aria-pressed={String(reversed)} title="反转排序方向"
              onClick={() => { setReversed((r) => !r); setStart(0); navigate(0); }}
            >⇄</button>
            <span hidden={!items.length}>{items.length ? `${start + 1}–${end} / ${items.length} 个` : "0 个"}</span>
            <span>{rightLabel}</span>
          </div>
          <div className="workload-browser-pages">
            <button type="button" className="workload-browser-page" aria-label="上一页" disabled={start === 0} onClick={() => navigate(start - capacity, true)}>‹</button>
            <button type="button" className="workload-browser-page" aria-label="下一页" disabled={start >= maxStart} onClick={() => navigate(start + capacity, true)}>›</button>
          </div>
        </div>
      </div>
      <div className="workload-list" ref={listRef} onScroll={onListScroll}>
        {items.map((item, i) => (
          <CardItem key={keyOf(item)} item={item} kind={category} energyMode={energyMode} index={i} stride={stride} />
        ))}
        {!items.length && <p className="workload-browser-empty">暂无符合条件的对象</p>}
        {!!items.length && (
          <div aria-hidden="true" style={{ position: "absolute", width: "1px", height: "1px", top: (maxStart / 2 * stride + 591) + "px" }} />
        )}
      </div>
    </section>,
    target
  );
}
