// 智能体事件全屏表格页 —— 从左侧"守护事件 → 查看全部"打开
// 声明式渲染：表格行/筛选/分页/统计卡片/详情弹窗全部由 React state 驱动
// CSS 在 src/styles/legacy.css（.guard-* 选择器，从演示 HTML 机械提取）
import { useEffect, useMemo, useRef, useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { BASE_FAULT_EVENTS, buildHistoricalEvents, buildEnergyEvents, STATES, buildInitialRecords } from "../../mock/guard-events.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);
const STATES_BY_ENERGY = STATES.filter(([k]) => k.startsWith("energy"));
const STATES_BY_FAULT = STATES.filter(([k]) => !k.startsWith("energy"));
const ENERGY_HEADERS = ["节能事件名称", "节能状态", "节能结果", "优化对象", "节能优化说明", "发现时间", "状态更新时间", "操作"];
const FAULT_HEADERS = ["名称", "事件状态", "事件类型", "发生对象", "故障根因", "发生时间", "清除时间", "操作"];
const STATE_ICON_KEYS = { manual: "待人工处理-圆", processing: "自动处理中-圆", "auto-closed": "已自动闭环-圆", "human-closed": "已人工闭环-圆", "energy-wait": "绿色叶子", "energy-none": "灰色叶子", "energy-done": "绿色叶子" };

export default function GuardEventsTable() {
  const [host, setHost] = useState(null);
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState("fault");           // 'fault' | 'energy' —— 当前分类
  const [stateFilter, setStateFilter] = useState("all"); // 状态筛选
  const [typeFilter, setTypeFilter] = useState("all");   // 类型筛选（故障/隐患/节能）
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);                  // 每页条数
  const [query, setQuery] = useState("");
  const [energyResult, setEnergyResult] = useState("all");
  const [showFilters, setShowFilters] = useState(true);               // 筛选栏可见性（表头触发器切换）
  const [records, setRecords] = useState(() => buildInitialRecords()); // 完整数据集（含能耗动态更新）
  const [selectedRecord, setSelectedRecord] = useState(null);           // 详情弹窗选中项
  const energyEventsRef = useRef(buildEnergyEvents());                 // 节能事件子集（hc-energy-change/reset 操作对象）
  const initialEnergyRef = useRef(energyEventsRef.current.map((x) => ({ ...x }))); // 节能事件初始快照（reset 用）

  useEffect(() => setHost(document.getElementById("screen")), []);

  const hideEnergyResult = list === "energy";
  const filteredRows = useMemo(() => {
    return records.filter((x) => {
      if (list !== "energy" && x.type === "节能") return false;
      if (list === "energy" && x.type !== "节能") return false;
      if (hideEnergyResult || energyResult === "all" || x.result === energyResult) { } else return false;
      if (stateFilter !== "all") {
        if (stateFilter === "energy-closed" ? !["energy-done", "energy-none"].includes(x.stateClass) : x.stateClass !== stateFilter) return false;
      }
      if (typeFilter !== "all" && x.type !== typeFilter) return false;
      if (query && ![x.name, x.object, x.root].some((t) => t.includes(query))) return false;
      return true;
    });
  }, [records, list, hideEnergyResult, energyResult, stateFilter, typeFilter, query]);
  const pages = Math.max(1, Math.ceil(filteredRows.length / size));
  const currentPage = Math.min(page, pages);

  function resetFilters() { setList("fault"); setStateFilter("all"); setTypeFilter("all"); setQuery(""); setPage(1); setEnergyResult("all"); }

  function close() {
    setVisible(false);
    setSelectedRecord(null);
    if (parent !== window) parent.postMessage({ type: "hc-home-category", category: document.getElementById("screen").dataset.category || "resource" }, location.origin === "null" ? "*" : location.origin);
  }
  function choose(s) {
    setEnergyResult("all");
    setStateFilter(s);
    setList(s.startsWith("energy") ? "energy" : "fault");
    setTypeFilter(s.startsWith("energy") ? "节能" : "all");
    setPage(1);
  }
  // 行点击：根据 action 字段跳转到对应事件模块，或打开详情弹窗
  function showRecord(item) {
    if (item.type === "节能" && (item.object !== "推理服务 / Qwen-14B" || item.stateClass === "energy-wait")) return;
    if (item.type === "节能" && item.action !== "energy-none") { window.openEnergyEvent?.(item); return; }
    if (item.action === "qwen" || item.action === "qwen-auto") { window.openNicEvent?.({ mode: item.action === "qwen-auto" ? "recovery" : "driver" }); return; }
    if (item.action === "link" || item.action === "link-auto") { window.openOpticalEvent?.({ mode: item.action === "link-auto" ? "isolation" : "full" }); return; }
    setSelectedRecord(item);
  }
  function restartRecognition(item) {
    setRecords((prev) => prev.map((r) => {
      if (r.object === item.object) {
        return { ...r, name: r.object.split(" / ").pop() + " 节能机会识别中", stateClass: "energy-wait", state: "节能机会识别中", result: "—", root: "正在分析业务请求变化，当前第 1/4 个识别周期", clear: "—" };
      }
      return r;
    }));
    setStateFilter("all");
  }

  // 窗口 API 桥接：保持与 legacy boot 代码相同的接口（openGuardEvents/getProcessingEnergyEvents/updateStoryRecords）
  useEffect(() => {
    window.openGuardEvents = () => {
      window.closeEnergyDetail?.();
      resetFilters();
      setVisible(true);
      if (parent !== window) parent.postMessage({ type: "hc-home-category", category: "events" }, location.origin === "null" ? "*" : location.origin);
    };
    window.getProcessingEnergyEvents = () => energyEventsRef.current.filter((r) => r.stateClass === "energy-wait").map((r) => ({ ...r }));
    window.updateStoryRecords = (fn) => {
      const fresh = [...BASE_FAULT_EVENTS, ...buildHistoricalEvents(), ...energyEventsRef.current].map((x) => ({ ...x }));
      setRecords(fn(fresh));
    };
  }, []);

  // 节能事件监听：hc-energy-change 更新匹配记录的状态；hc-energy-reset 恢复初始快照
  useEffect(() => {
    const onReset = () => {
      const restored = initialEnergyRef.current.map((x) => ({ ...x }));
      energyEventsRef.current = restored;
      setRecords((prev) => [...prev.filter((r) => r.type !== "节能"), ...restored.map((r) => ({ ...r }))]);
    };
    const onChange = (e) => {
      const detail = e.detail;
      energyEventsRef.current = energyEventsRef.current.map((r) => {
        if (r.type === "节能" && r.object.endsWith(" / " + detail.name)) {
          return { ...r, name: detail.name + (detail.done ? " 节能策略执行中" : " 节能机会识别中"), result: detail.done ? "已开启节能" : "—", stateClass: detail.done ? "energy-done" : "energy-wait", state: detail.done ? "自动节能中" : "节能机会识别中", clear: detail.done ? "今天 " + detail.time : "—", root: detail.done ? "均衡节能策略已生效，持续监控业务影响" : "正在分析业务请求变化，当前第 1/4 个识别周期" };
        }
        return r;
      });
      setRecords((prev) => prev.map((r) => {
        if (r.type === "节能" && r.object.endsWith(" / " + detail.name)) {
          return { ...r, name: detail.name + (detail.done ? " 节能策略执行中" : " 节能机会识别中"), result: detail.done ? "已开启节能" : "—", stateClass: detail.done ? "energy-done" : "energy-wait", state: detail.done ? "自动节能中" : "节能机会识别中", clear: detail.done ? "今天 " + detail.time : "—", root: detail.done ? "均衡节能策略已生效，持续监控业务影响" : "正在分析业务请求变化，当前第 1/4 个识别周期" };
        }
        return r;
      }));
    };
    window.addEventListener("hc-energy-reset", onReset);
    window.addEventListener("hc-energy-change", onChange);
    return () => { window.removeEventListener("hc-energy-reset", onReset); window.removeEventListener("hc-energy-change", onChange); };
  }, []);

  if (!host) return null;
  if (!visible) return createPortal(<section id="guard-all" hidden aria-label="智能体事件" />, host);
  // 派生渲染数据
  const headers = list === "energy" ? ENERGY_HEADERS : FAULT_HEADERS;
  const displayHeaders = headers.filter((t) => !(hideEnergyResult && t === "节能结果"));
  const pageRows = filteredRows.slice((currentPage - 1) * size, currentPage * size);
  const stateOptions = list === "energy" ? STATES_BY_ENERGY : STATES_BY_FAULT;

  // 全屏事件页：导航栏 + 统计卡片 + 筛选器 + 表格 + 分页 + 详情弹窗
  return createPortal(
    <section id="guard-all" className={visible ? "expanded" : ""} data-recognizing={String(hideEnergyResult)} data-energy={String(list === "energy")}>
      <nav className="guard-page-nav">
        <button type="button" onClick={close}>
          <img className="guard-asset" src={HC_ASSETS.icons["页签上的首页"]} alt="" />
          首页
        </button>
        <span className="active">
          <img className="guard-asset" src={HC_ASSETS.icons["盾牌-0910"]} alt="" />
          智能体事件
          <button type="button" onClick={close} aria-label="关闭智能体事件" className="guard-tab-close">×</button>
        </span>
      </nav>
      <div className="guard-page-summary">
        {[["fault", "故障&隐患事件"], ["energy", "节能事件"]].map(([category, title]) => (
          <section key={category} className={"guard-summary-group " + category + (list === category && stateFilter === "all" ? " selected" : "")}
            onClick={(e) => { if (!e.target.closest("button")) { setList(category); setStateFilter("all"); setTypeFilter(category === "energy" ? "节能" : "all"); setQuery(""); setPage(1); } }}>
            <h2>{title}</h2>
            <button type="button" className="guard-total" aria-label={"查看全部" + title}
              onClick={() => { setList(category); setStateFilter("all"); setTypeFilter(category === "energy" ? "节能" : "all"); setQuery(""); setPage(1); }}>
              <span>总数</span>
              <b>{records.filter((x) => category === "energy" ? x.type === "节能" : x.type !== "节能").length}</b>
            </button>
            <div className="guard-summary-cards">
              {STATES.filter(([k]) => k.startsWith("energy") === (category === "energy")).map(([key, label, icon]) => (
                <button key={key} type="button" className={"guard-stat" + (stateFilter === key ? " active" : "")}
                  onClick={() => { setQuery(""); choose(key); }}>
                  <img className="guard-asset" src={HC_ASSETS.icons[icon]} alt="" />
                  <span><span>{label}</span><b>{records.filter((x) => (key === "energy-closed" ? ["energy-done", "energy-none"].includes(x.stateClass) : x.stateClass === key)).length}</b></span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="guard-table-panel">
        <div className="guard-filters" hidden={!showFilters || list === "energy"}>
          <input placeholder={list === "energy" ? "搜索节能机会、优化对象或说明" : "搜索名称、发生对象或根因"} aria-label="搜索智能体事件" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          <select aria-label="筛选事件状态" value={stateFilter}
            onChange={(e) => { const v = e.target.value; setStateFilter(v); if (v !== "all") { setList(v.startsWith("energy") ? "energy" : "fault"); setTypeFilter(v.startsWith("energy") ? "节能" : "all"); } setPage(1); }}>
            <option value="all">全部状态</option>
            {stateOptions.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <select aria-label="筛选事件类型" value={typeFilter} hidden={list === "energy"}
            onChange={(e) => { const v = e.target.value; setTypeFilter(v); if (v === "节能") { setList("energy"); setStateFilter("all"); } else if (v !== "all") { setList("fault"); if (stateFilter.startsWith("energy")) setStateFilter("all"); } setPage(1); }}>
            <option value="all">全部类型</option>
            <option value="故障">故障</option>
            <option value="隐患">隐患</option>
            <option value="节能">节能</option>
          </select>
        </div>
        {list === "energy" && (
          <div className="guard-result-filter" hidden={!showFilters}>
            <select aria-label="筛选节能结果" value={energyResult}
              onChange={(e) => { setEnergyResult(e.target.value); setPage(1); }}>
              <option value="all">全部结果</option>
              <option value="已开启节能">已开启节能</option>
              <option value="暂无节能空间">暂无节能空间</option>
              <option value="—">暂无结果</option>
            </select>
          </div>
        )}
        <div className="guard-table-scroll">
          <table>
            <thead>
              <tr>
                {displayHeaders.map((t) => {
                  const hasTrigger = list === "energy"
                    ? t === "节能状态" || t === "节能结果"
                    : !["操作", "发生时间", "清除时间"].includes(t);
                  return (
                    <th key={t}>
                      {t}
                      {hasTrigger && (
                        <button type="button" className="guard-filter-trigger" aria-label={"筛选" + t}
                          onClick={() => setShowFilters((v) => !v)}>
                          <img className="guard-asset" src={HC_ASSETS.icons["筛选"]} alt="" />
                        </button>
                      )}
                      {t.endsWith("时间") && <span className="guard-sort-symbol">⇅</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td className="guard-no-rows" colSpan={hideEnergyResult ? 7 : 8}>暂无符合条件的事件</td></tr>
              ) : pageRows.map((item) => {
                const cells = list === "energy" ? [item.name, item.state, item.result, item.object, item.root, item.start, item.clear] : [item.name, item.state, item.type, item.object, item.root, item.start, item.clear];
                const visibleCells = cells.filter((_, i) => !(hideEnergyResult && i === 2));
                const isDisabled = item.type === "节能" && (item.object !== "推理服务 / Qwen-14B" || item.stateClass === "energy-wait");
                return (
                  <tr key={item.object + item.start} onClick={() => showRecord(item)}>
                    {visibleCells.map((text, vi) => {
                      const originalIndex = hideEnergyResult && vi >= 2 ? vi + 1 : vi;
                      return (
                        <td key={vi} title={text} className={originalIndex === 1 && list !== "energy" ? item.stateClass : undefined}>
                          {originalIndex === 0 && <LegacyEventTypeIcon item={item} />}
                          {originalIndex === 1 && list === "energy" && item.stateClass === "energy-wait" && <i className="story-step-icon working" />}
                          {originalIndex === 1 && list === "energy" && item.stateClass !== "energy-wait" && <img className="guard-asset guard-energy-closed-leaf" src={HC_ASSETS.icons[item.stateClass === "energy-done" ? "绿色叶子" : "灰色叶子"]} alt="" />}
                          {originalIndex === 1 && list !== "energy" && item.type !== "节能" && <img className="guard-asset" src={HC_ASSETS.icons[STATE_ICON_KEYS[item.stateClass]]} alt="" />}
                          {originalIndex === 1 && list !== "energy" && item.type === "节能" && <i className="guard-clean-leaf" style={{ "--leaf": "url(./assets/uploads/149-129790.png)" }} />}
                          {originalIndex === 2 && list === "energy" && item.result !== "—" && <i className={"guard-result-dot" + (item.result === "已开启节能" ? " enabled" : "")} aria-hidden="true" />}
                          {originalIndex === 2 && list !== "energy" && <span className={"event-type " + (item.type === "故障" ? "fault" : "other")}>{text}</span>}
                          {originalIndex === 2 && list !== "energy" ? null : text}
                        </td>
                      );
                    })}
                    <td>
                      {item.result === "已开启节能" && (
                        <button type="button" className="record-detail" aria-disabled="true" tabIndex={-1} style={{ cursor: "default" }} aria-label={"查看策略：" + item.name} data-tip="查看策略">
                          <img className="guard-asset" src={HC_ASSETS.icons["查看详情"]} alt="" />
                        </button>
                      )}
                      <button type="button" className="record-detail"
                        aria-disabled={isDisabled ? "true" : undefined} tabIndex={isDisabled ? -1 : undefined} style={isDisabled ? { cursor: "default" } : undefined}
                        aria-label={(item.result === "已开启节能" ? "查看节能监控" : "查看事件详情") + "：" + item.name}
                        data-tip={item.result === "已开启节能" ? "查看节能监控" : "查看事件详情"}
                        onClick={(e) => { if (!isDisabled) showRecord(item); }}>
                        <img className="guard-asset" src={HC_ASSETS.icons[item.result === "已开启节能" ? "节能监控" : "查看详情"]} alt="" />
                      </button>
                      {item.stateClass === "energy-none" && (
                        <button type="button" className="guard-restart" data-tip="重新识别" aria-label="重新识别" onClick={() => restartRecognition(item)}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7v5h-5M20 12a8 8 0 1 0-2.3 5.7" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className="guard-footer">
          <span>{"总计：" + filteredRows.length}</span>
          <select aria-label="每页条数" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10 项/页</option><option value={15}>15 项/页</option><option value={30}>30 项/页</option>
          </select>
          <button type="button" disabled={currentPage < 2} onClick={() => setPage(currentPage - 1)}>‹</button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" className={i + 1 === currentPage ? "active" : ""} disabled={i + 1 === currentPage} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button type="button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>›</button>
          <input className="guard-jump" type="number" min={1} max={pages} value={currentPage} aria-label="跳转页码" onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= pages) setPage(n); }} />
          <button type="button" className="guard-jump-button" onClick={() => { const n = Math.max(1, Math.min(pages, Number(document.querySelector(".guard-jump")?.value) || 1)); setPage(n); }}>跳转</button>
        </footer>
      </div>
      {selectedRecord && <DetailOverlay item={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </section>,
    host
  );
}

// 事件类型图标桥接组件 —— hc-components 尚未 React 化，通过 ref 调用 legacy 工厂函数
// 当 hc-components 完成组件化后，此桥接可移除，改为直接渲染 <EventTypeIcon />
function LegacyEventTypeIcon({ item }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.HCComponents) return;
    const business = item.action === "qwen-recovery" || /Qwen|推理实例|推理服务/.test(item.object) && !/网卡|光链路|节点/.test(item.name);
    const node = window.HCComponents.EventTypeIcon({
      domain: item.type === "节能" ? "inference" : /训练|作业/.test(item.object) ? "training" : business ? "inference" : "resource",
      name: item.name + " " + item.object,
      type: item.type === "节能" ? "energy" : item.type === "隐患" ? "risk" : "fault",
      closed: /closed|energy-done|energy-none/.test(item.stateClass),
      size: 24,
    });
    if (node) { ref.current.replaceChildren(); ref.current.append(node); }
  });
  return <span ref={ref} style={{ display: "contents" }} />;
}

// 事件详情弹窗 —— 点击非跳转类事件行时展示完整字段
function DetailOverlay({ item, onClose }) {
  return (
    <div className="guard-record-overlay" onClick={onClose}>
      <section className="guard-record" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="关闭事件记录" onClick={onClose}>×</button>
        <h2>{item.name}</h2>
        {[["事件状态", item.state], ["事件类型", item.type], ["发生对象", item.object], ["故障根因", item.root], ["发生时间", item.start], ["清除时间", item.clear]].map(([label, value]) => (
          <p key={label}><span>{label}</span><strong>{value}</strong></p>
        ))}
      </section>
    </div>
  );
}
