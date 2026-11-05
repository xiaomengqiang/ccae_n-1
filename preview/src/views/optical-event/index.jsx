import { useEffect, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import Composer from "../../components/composer/index.jsx";
import EvtBadge from "../../components/evt-badge/index.jsx";
import Topology2D from "./topology-2d.jsx";
import DiagnosticHistory from "./diagnostic-history.jsx";
import { ProcessTimeline } from "./process-timeline.jsx";
import { usePanelEntrance } from "../../hooks/use-panel-entrance.js";
import { EvidenceTabsBar, EvidencePanel } from "./evidence-tabs.jsx";
import { EvidenceProvider } from "../../components/evidence-context/index.jsx";
import { QuickQueryOverlay, QuickChatStatus, ReferencePopup, ReferenceOutline, useQuickReference, answerFor } from "./quick-query-overlay.jsx";

// 光模块（光链路脏污）事件详情 —— 完整 React 组件
// 状态机 hooks 化（phase/view/expanded/cleanedAt/liveStage/focusIndex）；
// 拓扑/诊断历史为 JSX 子组件；趋势图/经验卡为 HCOpticalParts 命令式包装（legacy-mounts）；
// 时间轴保留 U.ProcessTimeline 命令式（FLIP/入场动画）；入场动画 HCEntrance 命令式。

const INITIAL = () => ({ version: 1, chartPlayed: false, recoveryPlayed: false, phase: "manual", view: 5, expanded: [true, true, true, true], draft: "", scrollTop: 0, completionEmitted: false, finishAt: 0, closingStep: 7 });

function normalize(input) {
  const state = INITIAL();
  if (!input || input.version !== 1) return state;
  if (["manual", "reviewed", "closing", "closed"].includes(input.phase)) state.phase = input.phase;
  state.finishAt = Number.isFinite(input.finishAt) ? input.finishAt : 0;
  state.closingStep = input.closingStep === 8 ? 8 : 7;
  if (state.phase === "closing" && state.finishAt <= Date.now()) state.phase = "closed";
  state.chartPlayed = Boolean(input.chartPlayed); state.recoveryPlayed = Boolean(input.recoveryPlayed);
  const maxView = state.phase === "closed" ? 8 : state.phase === "closing" ? state.closingStep - 1 : state.phase === "reviewed" ? 6 : 5;
  state.view = Number.isInteger(input.view) ? Math.min(maxView, Math.max(0, input.view)) : maxView;
  if (input.phase === "closing" && state.phase === "closed") state.view = 8;
  if (Array.isArray(input.expanded) && input.expanded.length === 4) state.expanded = input.expanded.map(Boolean);
  state.draft = typeof input.draft === "string" ? input.draft : "";
  state.scrollTop = Number.isFinite(input.scrollTop) ? Math.max(0, input.scrollTop) : 0;
  state.completionEmitted = ["closing", "closed"].includes(state.phase) || Boolean(input.completionEmitted);
  return state;
}

const BASE_STEPS = [
  { title: "事件感知", description: "链路闪断告警", time: "2026-09-09 12:00:00" },
  { title: "故障诊断", description: "30条告警聚合\n生成链路闪断 issue", time: "12:00:05" },
  { title: "故障诊断", description: "定位链路脏污", time: "12:00:18" },
  { title: "方案决策", description: "生成预案", time: "12:00:28" },
  { title: "故障恢复", description: "优雅隔离异常链路", time: "12:00:40" },
  { title: "故障恢复", description: "持续监控光链路状态", time: "12:00:40", manual: true },
];

function stepsFor(liveStage, isolationOnly, phase) {
  const list = BASE_STEPS.map((s) => ({ ...s }));
  if (isolationOnly) return [...list.slice(0, 5), { title: "故障恢复", description: "事件已关闭", time: "12:00:48" }].map((step, viewIndex) => ({ ...step, viewIndex }));
  if (liveStage < 6) return list.slice(0, Math.max(1, liveStage)).map((step, i) => ({ ...step, title: i === 0 ? "事件感知" : i < 4 ? "故障诊断" : "故障恢复", description: window.HCStoryCopy.optical[i + 1] }));
  if (phase !== "manual") {
    list[5].manual = false; list[5].iconName = "红色小手";
    list.push({ title: "故障恢复", description: "已清污、链路复核已完成", iconName: "红色小手", time: "19:19:25" }, { title: "故障恢复", description: "隔离状态解除", time: "19:19:30" });
  }
  list[2].time = "12:00:28"; list[3].time = "12:00:40";
  const labels = { 0: ["事件感知", "感知光链路闪断告警"], 2: ["故障分析", "光链路通道功率与错误计数趋势"], 3: ["方案决策", "已完成L1-L2异常链路优雅隔离，\n并生成待办事件需人工清污"], 5: ["故障恢复", "持续监控光链路状态"], 6: ["故障恢复", "清污已完成，链路复核已完成"], 7: ["故障恢复", "隔离状态解除"] };
  return list.map((step, viewIndex) => ({ ...step, viewIndex })).filter((step) => labels[step.viewIndex]).map((step) => ({ ...step, title: labels[step.viewIndex][0], description: labels[step.viewIndex][1] }));
}

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// 跨开关保留（savedState/draft/经验反馈与原模块级行为一致）
let savedState = null;

export default function OpticalEvent() {
  const [host, setHost] = useState(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("full");
  const [state, setState] = useState(() => INITIAL());
  const [liveStage, setLiveStage] = useState(6);
  const [focusIndex, setFocusIndex] = useState(null);

  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const stateRef = useRef(state); stateRef.current = state;
  const liveStageRef = useRef(liveStage); liveStageRef.current = liveStage;
  const modeRef = useRef(mode); modeRef.current = mode;
  const openRef = useRef(open); openRef.current = open;
  const focusRef = useRef(focusIndex); focusRef.current = focusIndex;

  const isolationOnly = mode === "isolation";
  const monitorStartedAtRef = useRef(Date.now());

  useEffect(() => {
    const root = document.getElementById("optical-event-root") || (() => {
      const el = document.createElement("div");
      el.id = "optical-event-root";
      document.getElementById("screen").append(el);
      return el;
    })();
    setHost(root);
  }, []);

  // ---- 开关（原 adapter） ----
  const doOpen = ({ mode: nextMode = "full" } = {}) => {
    if (openRef.current) return;
    window.closeEnergyDetail?.();
    window.closeNicEvent?.();
    const storyStage = window.HCStory?.get().optical ?? 6;
    const useSaved = nextMode === "isolation" ? null : savedState;
    let next = normalize(useSaved);
    next.experienceFeedback = useSaved?.experienceFeedback ?? null;
    next.experienceCorrection = useSaved?.experienceCorrection ?? "";
    next.cleanedAt = useSaved?.cleanedAt ?? null;
    next.phase = next.cleanedAt === null ? "manual" : "reviewed";
    next.view = next.cleanedAt === null ? Math.min(next.view, 5) : 6;
    next.finishAt = 0;
    const stage = nextMode === "isolation" ? 6 : storyStage;
    if (nextMode === "isolation") { next.view = 5; next.expanded = [false, false, false, false]; }
    else if (stage >= 6) { next.expanded = useSaved?.expanded ?? [false, false, false, true]; next.scrollTop = 0; }
    if (stage < 6) next.view = Math.max(0, stage - 1);
    monitorStartedAtRef.current = useSaved?.monitorStartedAt || Date.now();
    setMode(nextMode);
    setState(next);
    setLiveStage(stage);
    setFocusIndex(null);
    setOpen(true);
    openRef.current = true;
    if (parent !== window) parent.postMessage({ type: "hc-home-category", category: "optical" }, location.origin === "null" ? "*" : location.origin);
  };
  const doClose = () => {
    if (!openRef.current) return;
    if (modeRef.current !== "isolation") {
      stateRef.current.scrollTop = scrollRef.current?.scrollTop ?? 0;
      savedState = JSON.parse(JSON.stringify({ ...stateRef.current, eventId: "optical-link-contamination", monitorStartedAt: monitorStartedAtRef.current }));
    }
    setOpen(false);
    openRef.current = false;
    const list = document.getElementById("guard-all");
    if (parent !== window) parent.postMessage({ type: "hc-home-category", category: list && !list.hidden ? "events" : document.getElementById("screen").dataset.category || "resource" }, location.origin === "null" ? "*" : location.origin);
  };

  useEffect(() => {
    window.openOpticalEvent = doOpen;
    window.closeOpticalEvent = doClose;
    window.resetOpticalEvent = () => { doClose(); savedState = null; };
    return () => { window.openOpticalEvent = undefined; window.closeOpticalEvent = undefined; window.resetOpticalEvent = undefined; };
  }, []);

  // story 阶段推进（原 setStoryStage）
  useEffect(() => {
    if (!open) return;
    const onStory = (e) => {
      const value = e.detail.optical;
      if (isolationOnly || value === liveStageRef.current) return;
      setLiveStage(value);
      if (value <= 6 && stateRef.current.phase === "manual") {
        setState((prev) => ({ ...prev, view: Math.max(0, value - 1) }));
        setFocusIndex(null);
              }
    };
    window.addEventListener("hc-story-change", onStory);
    return () => window.removeEventListener("hc-story-change", onStory);
  }, [open, isolationOnly]);

  // 实时图表心跳已内聚到 TrendChart 组件（live 模式内部 1s interval）

  // 入场动画（useEntrance：open 时 enter 一次，卸载 stop；chart/recovery/stream 句柄留给交互节点）
  const entranceHandle = usePanelEntrance(panelRef, {
    mode: liveStageRef.current < 6 ? "live" : "complete",
    memory: { played: (key) => stateRef.current[key], mark: (key) => { stateRef.current[key] = true; } },
    enabled: open,
  });

  // 侧边栏「首页」关闭
  useEffect(() => {
    const onDocClick = (e) => { if (e.target.closest('#home-sidebar button[aria-label="首页"]')) doClose(); };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // 点击空白清除选中（原 clearFocus）
  useEffect(() => {
    const onDocClick = (event) => {
      if (focusRef.current === null || event.target.closest("button,input,select,a,.evt-fault,.evt-card,.evt-response,.evt-user-message,.evt-step-header,.evt-step-body p")) return;
      setFocusIndex(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---- 时间轴（ProcessTimeline React 组件；FLIP/入场动画在组件 useLayoutEffect 内） ----
  const visibleSteps = stepsFor(liveStage, isolationOnly, state.phase);
  const timelineCurrent = state.cleanedAt !== null && focusIndex === null ? -1 : visibleSteps.findIndex((step, i) => (step.viewIndex ?? i) === state.view);

  // 选中联动 dim（原 applyFocus —— 全部 querySelector 命令式保留；时间轴/状态变化后重放）
  useEffect(() => { applyFocus(); }, [focusIndex, visibleSteps, timelineCurrent, state.cleanedAt]);
  const applyFocus = () => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const selectedStep = [0, 1, 1, 2, 3, 3, 3, 3][focusRef.current];
    scroll.querySelectorAll(".nic-event-process-body>.evt-step").forEach((node, i) => node.classList.toggle("evt-focus-dim", focusRef.current !== null && i !== selectedStep));
    scroll.querySelectorAll(".evt-recovery-row").forEach((node) => node.classList.toggle("evt-focus-dim", focusRef.current !== null && focusRef.current >= 4 && focusRef.current !== Number(node.dataset.view)));
    panelRef.current?.querySelectorAll(".evt-process-item").forEach((node, i) => {
      const visible = stepsFor(liveStageRef.current, modeRef.current === "isolation", stateRef.current.phase);
      node.classList.toggle("evt-focus-dim", focusRef.current !== null && (visible[i]?.viewIndex ?? i) !== focusRef.current);
    });
  };
  useEffect(() => { applyFocus(); }, [focusIndex]);

  // ---- 交互 ----
  const selectView = (index, fromPanel = false) => {
    const visible = stepsFor(liveStage, isolationOnly, state.phase);
    if (!visible.some((step, i) => (step.viewIndex ?? i) === index)) index = visible.at(-1).viewIndex ?? visible.length - 1;
    entranceHandle.current?.stop();
    setState((prev) => ({ ...prev, view: index }));
    setFocusIndex(index);
    const i = [0, 1, 1, 2, 3, 3, 3, 3][index];
    setState((prev) => {
      if (i !== undefined && !prev.expanded[i]) {
        const expanded = [...prev.expanded]; expanded[i] = true; return { ...prev, expanded };
      }
      return prev;
    });
    requestAnimationFrame(() => {
      const target = index >= 4 ? scrollRef.current?.querySelector('.evt-recovery-row[data-view="' + index + '"]') : scrollRef.current?.querySelectorAll(".nic-event-process-body>.evt-step")[i];
      if (!fromPanel) target?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    });
    entranceHandle.current?.chart?.();
    entranceHandle.current?.recovery?.();
  };

  // 故障端口 → 清污（原 completeCleaning；DOM 后处理针对 React 拥有的恢复行做可见性/流式动画）
  const completeCleaning = () => {
    if (liveStageRef.current < 6 || stateRef.current.cleanedAt !== null) return;
    const cleanedAt = window.HCClock?.seconds?.() ?? 0;
    setState((prev) => ({ ...prev, cleanedAt, phase: "reviewed", view: 6 }));
    setFocusIndex(null);
        onCompleteRef.current();
  };
  const onComplete = () => {
    stateRef.current.scrollTop = scrollRef.current?.scrollTop ?? 0;
    savedState = JSON.parse(JSON.stringify({ ...stateRef.current, eventId: "optical-link-contamination", monitorStartedAt: monitorStartedAtRef.current, cleanedAt: stateRef.current.cleanedAt, phase: "reviewed", view: 6 }));
    window.dispatchEvent(new CustomEvent("hc-optical-complete", { detail: { eventId: "optical-link-contamination" } }));
  };
  const onCompleteRef = useRef(onComplete); onCompleteRef.current = onComplete;

  const onDraftChange = (v) => setState((prev) => ({ ...prev, draft: v }));

  // ---- 快捷查询（全 React：contextmenu 识别 + 弹层 + 引用环 + chip/对话区）----
  const { popup, reference, confirmReference, clearReference } = useQuickReference();
  const [chatMessages, setChatMessages] = useState([]);
  const askQuestion = (question) => {
    const name = reference?.name;
    const userText = (name ? "引用“" + name + "”\n" : "") + question;
    setChatMessages((prev) => [...prev, { role: "user", text: userText }, { role: "assistant", text: "正在整理相关信息…" }]);
    const cleaned = stateRef.current.cleanedAt !== null;
    const reply = answerFor(question, reference, cleaned);
    setTimeout(() => {
      setChatMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "assistant" && next[i].text === "正在整理相关信息…") { next[i] = { role: "assistant", text: reply }; break; }
        }
        return next;
      });
    }, 650);
  };
  const clearReferenceAndChat = () => {
    clearReference();
    setChatMessages([]);
  };
  const toggleStep = (i, value) => setState((prev) => { const expanded = [...prev.expanded]; expanded[i] = value; return { ...prev, expanded }; });
  const toggleAll = () => {
    const next = !state.expanded.every(Boolean);
    setState((prev) => ({ ...prev, expanded: [next, next, next, next] }));
  };

  if (!open || !host) return null;

  const headingTitle = liveStage < 4 ? "光链路故障分析中"
    : liveStage < 6 ? "光链路脏污，自动处理中"
    : state.cleanedAt === null ? "光链路脏污，待人工清污" : "光链路已清污，隔离已解除";

  return createPortal(
    <EvidenceProvider>
      <section
      ref={panelRef}
      className="hc-event-module hc-optical-summary"
      data-detail-mode={mode}
      data-phase={state.phase}
    >
      <aside className="evt-left" aria-label="光链路事件诊断过程">
        <div className="evt-event-heading">
          <button type="button" className="evt-back" aria-label="返回" onClick={doClose}>
            <img className="evt-icon" src={OPTICAL_ASSETS.icons["返回-原稿尺寸"]} alt="" width={20} height={20} />
          </button>
          <EventTypeIcon closed={isolationOnly || state.cleanedAt !== null} size={36} className="evt-icon" />
          <div className="evt-heading-copy">
            <h1>
              {isolationOnly ? "光链路闪断，已完成优雅隔离" : headingTitle}
              {isolationOnly && <EvtBadge text="已闭环" tone="done" />}
              {!isolationOnly && liveStage >= 6 && (
                <EvtBadge text={state.cleanedAt === null ? "待人工处理" : "已闭环"} tone={state.cleanedAt === null ? "manual" : "closed"} />
              )}
            </h1>
            <time>{isolationOnly ? "2026-09-09  12:00:00" : "2026-09-09  12:00:40"}</time>
          </div>
        </div>
        <div className="evt-diagnosis-intro">
          <p>已经为您分析并生成故障的诊断，请查看后立即处理</p>
        </div>
        <div className="evt-diagnostic-scroll" ref={scrollRef}>
          <DiagnosticHistory
            liveStage={liveStage}
            isolationOnly={isolationOnly}
            cleanedAt={state.cleanedAt}
            phase={state.phase}
            view={state.view}
            focusIndex={focusIndex}
            expanded={state.expanded}
            state={state}
            monitorStartedAt={monitorStartedAtRef.current}
            onSelectView={selectView}
            onToggle={toggleStep}
            onToggleAll={toggleAll}
          />
          <QuickChatStatus messages={chatMessages} />
        </div>
        <div className="evt-composer-wrap">
          <Composer
            value={state.draft}
            onSend={askQuestion}
            onChange={onDraftChange}
            formClassName={reference ? "has-reference" : ""}
            placeholder={reference ? "针对“" + reference.name + "”提问" : '输入问题或输入"/"触发提示词'}
            overlay={
              <QuickQueryOverlay
                reference={reference}
                onQuickAsk={askQuestion}
                onClear={clearReferenceAndChat}
              />
            }
          />
        </div>
      </aside>
      <main className="evt-right">
        <div className="evt-detail-toolbar">
          <span>诊断详情</span>
          <EvidenceTabsBar />
          <div className="evt-toolbar-actions">
            <button type="button" disabled aria-label="诊断详情" onClick={() => {}}>
              <img className="evt-icon" src={OPTICAL_ASSETS.icons["放大-0910"]} alt="" width={16} height={16} />
            </button>
          </div>
        </div>
        <Topology2D
          view={state.view}
          isolationOnly={isolationOnly}
          cleanedAt={state.cleanedAt}
          onFaultPortClean={isolationOnly ? null : completeCleaning}
        />
        <ProcessTimeline
          steps={visibleSteps}
          current={timelineCurrent}
          onSelect={(i) => selectView(visibleSteps[i].viewIndex ?? i)}
        />
        <EvidencePanel />
      </main>
      {/* 快捷查询：右键弹层（body portal）+ 引用环（目标节点 portal） */}
      <ReferencePopup popup={popup} onConfirm={confirmReference} />
      <ReferenceOutline reference={reference} />
    </section>
    </EvidenceProvider>,
    host
  );
}
