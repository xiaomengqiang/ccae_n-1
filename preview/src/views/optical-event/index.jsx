import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import Composer from "../../components/composer/index.jsx";
import EvtBadge from "../../components/evt-badge/index.jsx";
import DiagnosticStep from "../../components/diagnostic-step/index.jsx";
import CauseChain from "../../components/cause-chain/index.jsx";
import { HCEntrance } from "../../shared/entrance.js";
import IsolationAnimationView from "./isolation-animation.jsx";
import Topology2D from "./topology-2d.jsx";
import { MetricComparison, ProcessTimeline } from "./panel-parts.jsx";
import { HCOpticalParts } from "./parts.js";
import { HCOpticalEvidence } from "./evidence.js";
import "./canvas-reference.js";

// 光链路脏污事件详情 —— 完整 React 组件（原 event.js 命令式 HCEventModule 的 React 化）
// 阶段状态（liveStage/view/focusIndex/expanded/cleanedAt）由 story 订阅与交互驱动；
// 拓扑（topology-2d/rack-3d）与隔离动画为 React 子组件；
// 入场动画（shared/entrance.js）、取证标签页（evidence.js）、画布引用（canvas-reference.js）、
// 趋势图/清污图/经验卡（parts.js）保持命令式，经 effect 注入。

const EVENT_ID = "optical-link-contamination";
const STEP_ROW = [0, 1, 1, 2, 3, 3, 3, 3]; // focusIndex → 左侧步骤索引（原 applyFocus/selectView）

const BASE_STEPS = [
  { title: "事件感知", description: "链路闪断告警", time: "2026-09-09 12:00:00" },
  { title: "故障诊断", description: "30条告警聚合\n生成链路闪断 issue", time: "12:00:05" },
  { title: "故障诊断", description: "定位链路脏污", time: "12:00:18" },
  { title: "方案决策", description: "生成预案", time: "12:00:28" },
  { title: "故障恢复", description: "优雅隔离异常链路", time: "12:00:40" },
  { title: "故障恢复", description: "持续监控光链路状态", time: "12:00:40", manual: true },
];

const CAUSE_ITEMS = [
  { title: "光模块脏污", description: "L1-L2 设备光链路端面脏污", icon: "光模块脏污", root: true },
  { title: "接收功率劣化+FEC误码率异常", description: "lane4接收光功率<-3.2dBm", icon: "吸收功率劣化" },
  { title: "L1- L2交换机链路多次闪断", description: "持续5s", icon: "链路多次闪断" },
  { title: "伴随告警30条", description: "IPv6状态切换、光模块整体失效等", icon: "告警铃铛" },
];

// 状态跨开关面板保留（full 模式关闭时保存、重开恢复；isolation 关闭不保存）
let savedStore = null;

const headerKeyOf = (node) =>
  node.querySelector(".evt-step-header")?.textContent.replace(/自动处理中|进行中|已完成|待人工处理/g, "");

export default function OpticalEvent() {
  const [host, setHost] = useState(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("full");
  const [liveStage, setLiveStage] = useState(6);
  const [view, setView] = useState(5);
  const [focusIndex, setFocusIndex] = useState(null);
  const [expanded, setExpanded] = useState([true, true, true, true]);
  const [cleanedAt, setCleanedAt] = useState(null);
  const [draft, setDraft] = useState("");

  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const timelineRef = useRef(null);
  const processBodyRef = useRef(null);
  const awarenessRef = useRef(null);
  const analysisRef = useRef(null);
  const stepBodyRefs = useRef([null, null, null, null]);
  const entranceRef = useRef(null);
  const memoryRef = useRef({ chartPlayed: false, recoveryPlayed: false });
  const monitorStartedAtRef = useRef(Date.now());
  const experienceStartedAtRef = useRef(0);
  const experienceRef = useRef({ experienceFeedback: null, experienceCorrection: "" });
  const experienceCardRef = useRef(null);
  const appearedRef = useRef(new Set());
  const prevRectsRef = useRef(new Map());
  const prevBodiesRef = useRef(new Map());
  const prevCleanedAtRef = useRef(null);
  const scrollRestoreRef = useRef(0);
  const stepsRef = useRef([]);
  const referenceRef = useRef(() => {});

  // refs mirror（订阅回调读取最新值）
  const openRef = useRef(false); openRef.current = open;
  const modeRef = useRef(mode); modeRef.current = mode;
  const liveStageRef = useRef(liveStage); liveStageRef.current = liveStage;
  const viewRef = useRef(view); viewRef.current = view;
  const expandedRef = useRef(expanded); expandedRef.current = expanded;
  const cleanedAtRef = useRef(cleanedAt); cleanedAtRef.current = cleanedAt;
  const draftRef = useRef(draft); draftRef.current = draft;
  const focusRef = useRef(focusIndex); focusRef.current = focusIndex;

  useEffect(() => setHost(document.getElementById("screen")), []);

  const isolationOnly = mode === "isolation";
  const phase = cleanedAt === null ? "manual" : "reviewed";

  // ---- 开 / 关（原 host 适配层：保存/恢复 savedStore、postMessage 通知外层） ----
  const doOpen = (nextMode = "full") => {
    if (openRef.current) return;
    window.closeEnergyDetail?.();
    window.closeNicEvent?.();
    const stage = nextMode === "isolation" ? 6 : window.HCStory?.get()?.optical ?? 6;
    const initial = nextMode === "isolation" ? null : savedStore;
    const nextCleaned = initial?.cleanedAt ?? null;
    let nextView = nextCleaned === null
      ? Math.min(Number.isInteger(initial?.view) ? initial.view : 5, 5)
      : 6;
    let nextExpanded = Array.isArray(initial?.expanded) && initial.expanded.length === 4
      ? initial.expanded.map(Boolean)
      : [true, true, true, true];
    if (nextMode === "isolation") { nextView = 5; nextExpanded = [false, false, false, false]; }
    else if (stage >= 6) {
      nextExpanded = Array.isArray(initial?.expanded) && initial.expanded.length === 4
        ? initial.expanded
        : [false, false, false, true];
    }
    if (stage < 6) nextView = Math.max(0, stage - 1);
    memoryRef.current = { chartPlayed: Boolean(initial?.chartPlayed), recoveryPlayed: Boolean(initial?.recoveryPlayed) };
    monitorStartedAtRef.current = initial?.monitorStartedAt || Date.now();
    experienceStartedAtRef.current = 0;
    experienceRef.current = { experienceFeedback: initial?.experienceFeedback ?? null, experienceCorrection: initial?.experienceCorrection ?? "" };
    experienceCardRef.current = null;
    appearedRef.current = new Set();
    prevRectsRef.current = new Map();
    prevBodiesRef.current = new Map();
    prevCleanedAtRef.current = nextCleaned;
    scrollRestoreRef.current = nextMode === "isolation" || stage >= 6 ? 0 : Math.max(0, initial?.scrollTop ?? 0);
    setMode(nextMode);
    setLiveStage(stage);
    setCleanedAt(nextCleaned);
    setView(nextView);
    setExpanded(nextExpanded);
    setFocusIndex(null);
    setDraft(typeof initial?.draft === "string" ? initial.draft : "");
    openRef.current = true;
    setOpen(true);
    referenceRef.current("optical");
  };

  const doClose = () => {
    if (openRef.current && modeRef.current !== "isolation") {
      savedStore = {
        version: 1,
        expanded: expandedRef.current,
        view: viewRef.current,
        cleanedAt: cleanedAtRef.current,
        draft: draftRef.current,
        scrollTop: scrollRef.current?.scrollTop ?? 0,
        chartPlayed: memoryRef.current.chartPlayed,
        recoveryPlayed: memoryRef.current.recoveryPlayed,
        completionEmitted: true,
        monitorStartedAt: monitorStartedAtRef.current,
        experienceFeedback: experienceRef.current.experienceFeedback,
        experienceCorrection: experienceRef.current.experienceCorrection,
      };
    }
    openRef.current = false;
    setOpen(false);
    const list = document.getElementById("guard-all");
    referenceRef.current(list && !list.hidden ? "events" : document.getElementById("screen")?.dataset.category || "resource");
  };

  const doOpenRef = useRef(doOpen); doOpenRef.current = doOpen;
  const doCloseRef = useRef(doClose); doCloseRef.current = doClose;

  // ---- 派生：处理环节时间轴数据（原 steps()） ----
  const visibleSteps = useMemo(() => {
    const list = BASE_STEPS.map((s) => ({ ...s }));
    if (isolationOnly)
      return [...list.slice(0, 5), { title: "故障恢复", description: "事件已关闭", time: "12:00:48" }]
        .map((step, viewIndex) => ({ ...step, viewIndex }));
    if (liveStage < 6)
      return list.slice(0, Math.max(1, liveStage)).map((step, i) => ({
        ...step,
        title: i === 0 ? "事件感知" : i < 4 ? "故障诊断" : "故障恢复",
        description: (window.HCStoryCopy?.optical || [])[i + 1] ?? "",
      }));
    if (phase !== "manual") {
      list[5].manual = false;
      list[5].iconName = "红色小手";
      list.push({ title: "故障恢复", description: "已清污、链路复核已完成", iconName: "红色小手", time: "19:19:25" });
      list.push({ title: "故障恢复", description: "隔离状态解除", time: "19:19:30" });
    }
    list[2].time = "12:00:28";
    list[3].time = "12:00:40";
    const labels = {
      0: ["事件感知", "感知光链路闪断告警"],
      2: ["故障分析", "光链路通道功率与错误计数趋势"],
      3: ["方案决策", "已完成L1-L2异常链路优雅隔离，\n并生成待办事件需人工清污"],
      5: ["故障恢复", "持续监控光链路状态"],
      6: ["故障恢复", "清污已完成，链路复核已完成"],
      7: ["故障恢复", "隔离状态解除"],
    };
    return list
      .map((step, viewIndex) => ({ ...step, viewIndex }))
      .filter((step) => labels[step.viewIndex])
      .map((step) => ({ ...step, title: labels[step.viewIndex][0], description: labels[step.viewIndex][1] }));
  }, [isolationOnly, liveStage, phase]);
  stepsRef.current = visibleSteps;

  const currentStep = cleanedAt !== null && focusIndex === null
    ? -1
    : visibleSteps.findIndex((step, i) => (step.viewIndex ?? i) === view);
  const timelineSteps = visibleSteps.map((step, i) => ({
    ...step,
    dim: focusIndex !== null && (step.viewIndex ?? i) !== focusIndex,
  }));

  // ---- 交互 ----
  const selectView = (index, fromPanel = false) => {
    if (!openRef.current) return;
    const visible = stepsRef.current;
    if (!visible.some((step, i) => (step.viewIndex ?? i) === index))
      index = visible.at(-1).viewIndex ?? visible.length - 1;
    entranceRef.current?.stop();
    setView(index);
    setFocusIndex(index);
    const row = STEP_ROW[index];
    setExpanded((prev) => {
      if (row !== undefined && !prev[row]) { const next = [...prev]; next[row] = true; return next; }
      return prev;
    });
    if (!fromPanel)
      requestAnimationFrame(() => {
        const target = index >= 4
          ? scrollRef.current?.querySelector(`.evt-recovery-row[data-view="${index}"]`)
          : scrollRef.current?.querySelectorAll(".nic-event-process-body>.evt-step")[STEP_ROW[index]];
        target?.scrollIntoView?.({ block: "start", behavior: "smooth" });
      });
  };

  const doClean = () => {
    if (liveStageRef.current < 6 || cleanedAtRef.current !== null) return;
    entranceRef.current?.stop();
    experienceStartedAtRef.current = Date.now();
    setCleanedAt(window.HCClock.seconds());
    setView(6);
    setFocusIndex(null);
    window.dispatchEvent(new CustomEvent("hc-optical-complete", { detail: { eventId: EVENT_ID } }));
  };

  const toggleAll = () => {
    entranceRef.current?.stop();
    const next = !expanded.every(Boolean);
    setExpanded([next, next, next, next]);
  };

  // story 订阅：阶段变化推进（原 setStoryStage；渲染后对文本变化的步骤体流式补播）
  const streamChangedBodies = () => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const nodes = [...scroll.querySelectorAll(".nic-event-process-body>.evt-step")];
    nodes.forEach((node) => {
      const body = node.querySelector(".evt-step-body");
      if (body && prevBodiesRef.current.get(headerKeyOf(node)) !== body.textContent)
        entranceRef.current?.stream(body);
    });
    prevBodiesRef.current = new Map(nodes.map((node) => [headerKeyOf(node), node.querySelector(".evt-step-body")?.textContent]));
  };
  const streamChangedBodiesRef = useRef(streamChangedBodies); streamChangedBodiesRef.current = streamChangedBodies;

  // ---- window API 桥接（story 时间轴标记 / 守护事件表 / energy·nic 面板互斥联动） ----
  useEffect(() => {
    window.openOpticalEvent = ({ mode: next = "full" } = {}) => doOpenRef.current(next);
    window.closeOpticalEvent = () => doCloseRef.current();
    window.resetOpticalEvent = () => { doCloseRef.current(); savedStore = null; };
    const onStory = (e) => {
      const value = e.detail?.optical;
      if (value == null || !openRef.current || modeRef.current === "isolation" || value === liveStageRef.current) return;
      if (value <= 6 && cleanedAtRef.current === null) {
        entranceRef.current?.stop();
        liveStageRef.current = value;
        setLiveStage(value);
        setView(Math.max(0, value - 1));
        setFocusIndex(null);
        requestAnimationFrame(() => streamChangedBodiesRef.current());
      } else {
        liveStageRef.current = value;
        setLiveStage(value);
      }
    };
    window.addEventListener("hc-story-change", onStory);
    const onHome = (e) => { if (e.target.closest('#home-sidebar button[aria-label="首页"]')) doCloseRef.current(); };
    document.addEventListener("click", onHome);
    const clearFocus = (e) => {
      if (focusRef.current == null || e.target.closest("button,input,select,a,.evt-fault,.evt-card,.evt-response,.evt-user-message,.evt-step-header,.evt-step-body p")) return;
      setFocusIndex(null);
    };
    document.addEventListener("click", clearFocus);
    return () => {
      window.openOpticalEvent = undefined;
      window.closeOpticalEvent = undefined;
      window.resetOpticalEvent = undefined;
      window.removeEventListener("hc-story-change", onStory);
      document.removeEventListener("click", onHome);
      document.removeEventListener("click", clearFocus);
    };
  }, []);

  // postMessage 通知外层页面当前分类（原 reference()）
  useEffect(() => {
    referenceRef.current = (category) => {
      if (parent !== window) parent.postMessage({ type: "hc-home-category", category }, location.origin === "null" ? "*" : location.origin);
    };
  }, []);

  // ---- 命令式部件注入：快照趋势图（事件感知/故障分析内的静态历史图） ----
  const mountSnapshot = (hostRef) => {
    const host = hostRef.current;
    if (!open || mode === "isolation" || liveStage < 6 || !host) return;
    const snapshot = HCOpticalParts.TrendChart();
    snapshot.update(28);
    snapshot.update = null;
    const historyEnd = 12 * 3600 + 28;
    const historyTimes = Array.from({ length: 8 }, (_, i) => {
      const t = Math.round(historyEnd - (7 - i) * 15 * 60);
      return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map((v) => String(v).padStart(2, "0")).join(":");
    });
    snapshot.querySelectorAll(".evt-chart-time").forEach((n, i) => { n.textContent = historyTimes[i % 8]; });
    snapshot.querySelectorAll(".evt-chart-bar title").forEach((n, i) => { n.textContent = n.textContent.replace(/^.*?：/, historyTimes[i] + "："); });
    snapshot.querySelector("svg").setAttribute("aria-label", "四通道光功率及错误计数趋势：尚未清污，每15分钟采样，10:15:28至12:00:28");
    snapshot.querySelectorAll('svg>text[x="30"]').forEach((n) => { n.setAttribute("x", "16"); n.setAttribute("text-anchor", "start"); });
    snapshot.querySelectorAll('svg>text[x="411"]').forEach((n) => { n.setAttribute("x", "397"); });
    snapshot.classList.add("evt-static-chart");
    host.append(snapshot);
    return () => snapshot.remove();
  };
  useEffect(() => mountSnapshot(awarenessRef), [open, mode, liveStage]);
  useEffect(() => mountSnapshot(analysisRef), [open, mode, liveStage]);

  // ---- 实时趋势图（未清污挂“持续监控”行、已清污挂“链路恢复”行） ----
  useEffect(() => {
    if (!open || mode === "isolation" || liveStage < 6) return;
    const parent = scrollRef.current?.querySelector(cleanedAt !== null ? '.evt-recovery-row[data-view="6"]' : '.evt-recovery-row[data-view="5"]');
    if (!parent) return;
    const chart = HCOpticalParts.TrendChart(cleanedAt, true, monitorStartedAtRef.current);
    chart.update(window.HCClock.seconds());
    parent.append(chart);
    return () => chart.remove();
  }, [open, mode, liveStage, cleanedAt]);

  // ---- 清污示意图（未清污“持续监控”行；已清污“链路恢复”行） ----
  useEffect(() => {
    if (!open || mode === "isolation" || liveStage < 6 || cleanedAt !== null) return;
    const parent = scrollRef.current?.querySelector('.evt-recovery-row[data-view="5"]');
    if (!parent) return;
    const node = HCOpticalParts.CleaningIllustration(false);
    parent.append(node);
    return () => node.remove();
  }, [open, mode, liveStage, cleanedAt]);
  useEffect(() => {
    if (!open || mode === "isolation" || cleanedAt === null) return;
    const parent = scrollRef.current?.querySelector('.evt-recovery-row[data-view="6"]');
    if (!parent) return;
    const node = HCOpticalParts.CleaningIllustration(true);
    parent.append(node);
    return () => node.remove();
  }, [open, mode, cleanedAt]);

  // ---- 经验沉淀卡（清污后追加到处理过程尾部；重新生成由卡内 onReplace 换卡） ----
  useEffect(() => {
    if (!open || mode === "isolation" || cleanedAt === null) return;
    const process = processBodyRef.current;
    if (!process) return;
    const fresh = !experienceCardRef.current;
    if (fresh)
      experienceCardRef.current = HCOpticalParts.ExperienceSummary(experienceRef.current, (freshCard) => { experienceCardRef.current = freshCard; });
    process.append(experienceCardRef.current);
    if (fresh && experienceStartedAtRef.current)
      HCOpticalParts.streamExperience(experienceCardRef.current, Math.max(0, experienceStartedAtRef.current + 2000 - Date.now()));
    return () => { experienceCardRef.current?.remove(); experienceCardRef.current = null; };
  }, [open, mode, cleanedAt]);

  // ---- 取证注入（原 renderHistory 的 evidence 构造，从渲染后的 DOM 提取依据文本） ----
  const sectionsDataRef = useRef([]);
  useEffect(() => {
    if (!open) return;
    const sections = sectionsDataRef.current;
    sections.forEach((s, i) => {
      const body = stepBodyRefs.current[i];
      if (!body) return;
      body.querySelector(".evt-diagnostic-operations")?.remove();
      const evidence = [];
      const record = (verb, label, tool, kind, text) => evidence.push({ verb, label, tool, kind, text });
      if (i === 0) record("读取", "告警与事件记录", "事件监测", "file", body.textContent);
      if (i === 1) {
        const description = body.querySelector("p")?.textContent || body.textContent;
        if (mode !== "isolation" && liveStage >= 6) record("核对", "光功率与错误计数记录", "链路监测", "search", description);
        else if (liveStage >= 4) {
          record("分析", "链路故障分析记录", "链路诊断", "file", description);
          record("关联", "链路故障因果链", "告警关联分析", "search", body.querySelector(".evt-cause")?.textContent);
        } else record("读取", "告警聚合记录", "告警关联分析", "file", body.textContent);
      }
      if (i === 2) record("生成", mode === "isolation" ? "链路隔离方案" : "光链路清污处置方案", "方案生成", "file", body.textContent);
      if (i === 3) {
        body.querySelectorAll(".evt-recovery-row").forEach((row) => {
          const labels = {
            4: ["记录", "链路隔离执行记录", "链路处置", "run"],
            5: ["读取", "光链路持续监控记录", "链路监测", "file"],
            6: ["核验", "链路恢复核验记录", "链路监测", "search"],
            7: ["记录", "隔离解除记录", "链路处置", "run"],
          };
          const item = labels[Number(row.dataset.view)];
          if (!item) return;
          const copy = [...row.children].filter((node) => node.matches("strong,p")).map((node) => node.textContent).join("\n");
          if (copy) record(...item, copy);
        });
        if (!evidence.length) record("读取", "链路处置进展", "链路处置", "file", body.textContent);
      }
      HCOpticalEvidence.attach(body, s.title, s.badge !== "待处理" && s.tone !== "processing", false, evidence);
    });
  }, [open, mode, liveStage, cleanedAt]);

  // ---- 滚动位置恢复（原 mount 尾部的 scrollTop 还原） ----
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRestoreRef.current;
    const nodes = [...scrollRef.current.querySelectorAll(".nic-event-process-body>.evt-step")];
    prevBodiesRef.current = new Map(nodes.map((node) => [headerKeyOf(node), node.querySelector(".evt-step-body")?.textContent]));
  }, [open]);

  // ---- 入场动画（命令式 HCEntrance，开关面板各执行一次） ----
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const entrance = HCEntrance(panelRef.current, {
      played: (key) => memoryRef.current[key],
      mark: (key) => { memoryRef.current[key] = true; },
    });
    entranceRef.current = entrance;
    entrance.enter(liveStage < 6 ? "live" : "complete");
    return () => { entrance.stop(); entranceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ---- 实时图表每秒驱动（原 monitorTimer） ----
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      panelRef.current?.querySelectorAll(".evt-chart-card").forEach((card) => card.update?.(window.HCClock.seconds()));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  // ---- 清污完成流（原 clean()：核验行复制流播 → 隔离解除行续播） ----
  useEffect(() => {
    if (!open || cleanedAt === null || prevCleanedAtRef.current === cleanedAt) return;
    prevCleanedAtRef.current = cleanedAt;
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.scrollTop = scroll.scrollHeight;
    const row = scroll.querySelector('.evt-recovery-row[data-view="6"]');
    if (row) {
      const copy = document.createElement("div");
      copy.className = "evt-cleanup-copy";
      copy.append(...Array.from(row.children).filter((n) => n.matches("strong,p")));
      row.prepend(copy);
      const released = scroll.querySelector('.evt-recovery-row[data-view="7"]');
      if (released) { released.dataset.streamHidden = released.style.visibility; released.style.visibility = "hidden"; }
      entranceRef.current?.stream(copy, 0, () => {
        if (!released || !released.isConnected) return;
        released.style.visibility = "";
        delete released.dataset.streamHidden;
        entranceRef.current?.stream(released);
      });
    }
  }, [open, cleanedAt]);

  // 图表/恢复卡可视区一次性入场（幂等，随渲染补挂观察）
  useEffect(() => {
    if (!open) return;
    entranceRef.current?.chart();
    entranceRef.current?.recovery();
  });

  // ---- 处理环节时间轴：位移补间 + 首次出现入场（原 renderTimeline 的动画段） ----
  useLayoutEffect(() => {
    if (!open) return;
    const timeline = timelineRef.current;
    if (!timeline) return;
    const items = [...timeline.querySelectorAll(".evt-process-item")];
    if (!items.length) return;
    const scale = timeline.getBoundingClientRect().width / timeline.offsetWidth || 1;
    items.forEach((item, i) => {
      const key = item.dataset.motionKey;
      const next = item.getBoundingClientRect();
      const old = prevRectsRef.current.get(key);
      if (old && !window.HCMotion.REDUCED && Math.abs(old.x - next.x) + Math.abs(old.width - next.width) > 0.5) {
        item.animate(
          [{ transform: `translateX(${(old.x - next.x) / scale}px) scaleX(${old.width / next.width})` }, { transform: "none" }],
          { duration: 1100, easing: "cubic-bezier(.2,0,0,1)" }
        );
        item.style.transformOrigin = "left center";
      }
      if (!appearedRef.current.has(key)) {
        appearedRef.current.add(key);
        if (!window.HCMotion.REDUCED)
          item.animate(
            [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
            { duration: 700, delay: Number(key) >= 6 ? 1100 + (Number(key) - 6) * 1200 : Math.min(i, 7) * 50, easing: "cubic-bezier(.2,0,0,1)", fill: "backwards" }
          );
      }
      prevRectsRef.current.set(key, next);
    });
  });

  // ---- 渲染数据 ----
  const allOpen = expanded.every(Boolean);
  const selectedStep = focusIndex === null ? null : STEP_ROW[focusIndex];
  const rowDim = (v) => (focusIndex !== null && focusIndex >= 4 && focusIndex !== v ? " evt-focus-dim" : "");
  const relatedClosed = !isolationOnly || Boolean(window.HCStory?.get()?.optical >= 9);
  const conclusion = liveStage < 4 ? "光链路闪断，故障原因分析中"
    : isolationOnly ? "光链路脏污导致链路闪断，已完成优雅隔离"
    : cleanedAt !== null ? "光链路清污完成，链路恢复正常"
    : "光链路脏污，已隔离异常链路，等待人工清污";
  const impact = liveStage < 4 ? "正在分析链路闪断的业务影响" : liveStage < 6 ? "引起 CQE 错误、实例异常，正在处置" : "异常链路已隔离，当前业务正常";
  const status = liveStage < 6 ? "诊断与处置随处理进度更新"
    : isolationOnly ? "异常链路已完成优雅隔离，事件已闭环"
    : cleanedAt !== null ? "链路恢复核验完成，隔离已解除"
    : "等待人工清污，持续监控光链路状态";

  let h1Text = "光链路脏污，待人工清污";
  let h1Badge = null;
  if (isolationOnly) { h1Text = "光链路闪断，已完成优雅隔离"; h1Badge = { text: "已闭环", tone: "closed" }; }
  else if (liveStage < 4) h1Text = "光链路故障分析中";
  else if (liveStage < 6) h1Text = "光链路脏污，自动处理中";
  else if (cleanedAt !== null) { h1Text = "光链路已清污，隔离已解除"; h1Badge = { text: "已闭环", tone: "closed" }; }
  else h1Badge = { text: "待人工处理", tone: "manual" };

  const awarenessBody = !isolationOnly && liveStage >= 6 ? (
    <p>12:00:00 感知光链路闪断告警，后续定位为光链路脏污</p>
  ) : (
    <>
      <p>链路闪断告警  12:00:00-12:00:05</p>
      <p>故障描述：计算柜11-L1交换板02上发生闪断3次</p>
    </>
  );

  const analysisBody = liveStage < 4 ? (
    <p>{liveStage === 2 ? "30条告警聚合，生成链路闪断 issue" : "正在分析链路指标与设备日志"}</p>
  ) : !isolationOnly && liveStage >= 6 ? (
    <p>12:00:28 完成光链路状态分析：通道4从12:00:00开始处于异常低功率状态，截至12:00:28已持续28秒，光功率约为−12.9dBm；同期通道1～3保持在0～−1dBm，错误计数持续异常</p>
  ) : (
    <>
      <p>12:00:18 完成故障分析：排除计算侧硬件故障，检测到根因为计算柜11-L1交换板02因“光链路脏污”，导致链路闪断，引起CQE错误、实例DOWN</p>
      <CauseChain items={CAUSE_ITEMS} />
    </>
  );

  const recoveryBody = (
    <div>
      <div className="evt-card evt-recovery">
        <div className="evt-data-content">
          <div className={"evt-recovery-row" + rowDim(4)} data-view="4">
            <strong>已完成L1-L2异常链路优雅隔离<time className="evt-recovery-time">12:00:40</time></strong>
            <IsolationAnimationView />
            <MetricComparison label="带宽" before="3.2" after="2.4" unit="Tb/s" changeLabel="25%" direction="down" />
            <MetricComparison label="流量" before="420" after="450" unit="Gb/s" changeLabel="7.14%" direction="up" />
          </div>
          {isolationOnly ? (
            <div className={"evt-recovery-row" + rowDim(5)} data-view="5">
              <strong>事件已关闭<time className="evt-recovery-time">12:00:48</time></strong>
              <div className="evt-cleanup-related">
                <span>关联事件：</span>
                <button
                  type="button"
                  className="evt-isolation-link evt-cleanup-event-link"
                  onClick={() => { window.closeOpticalEvent(); window.openOpticalEvent(); }}
                >
                  生成光链路清污待办事件<i className="evt-jump-icon" />
                </button>
              </div>
            </div>
          ) : (
            <div className={"evt-recovery-row" + rowDim(5)} data-view="5">
              <strong>持续监控光链路状态<time className="evt-recovery-time">12:00:40</time></strong>
              {cleanedAt === null && (
                <p>正在持续监控计算柜11-L1交换板02的光链路。1～3通道保持正常，通道4仍处于异常低功率状态，链路错误计数仍有异常，等待人工清污</p>
              )}
            </div>
          )}
          {!isolationOnly && cleanedAt !== null && (
            <div className={"evt-recovery-row" + rowDim(6)} data-view="6">
              <strong>链路恢复正常，核验已完成<time className="evt-recovery-time">19:19:25</time></strong>
              <p>19:17:10，检测到计算柜11-L1交换板02的光链路清污后恢复正常：通道4光功率回升至0～−1dBm，错误计数降为0，通道1～3始终保持正常。持续观察后，于19:19:25完成链路恢复核验</p>
            </div>
          )}
          {!isolationOnly && cleanedAt !== null && (
            <div className={"evt-recovery-row" + rowDim(7)} data-view="7">
              <strong>隔离状态解除<time className="evt-recovery-time">19:19:30</time></strong>
              <p>光链路隔离已解除、业务链路运行正常</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sectionsData = [
    { title: "事件感知", time: "12:00:00", badge: "已完成", tone: "done", view: 0, content: <div ref={awarenessRef}>{awarenessBody}</div> },
    { title: "故障分析", time: "12:00:18", badge: "已完成", tone: "done", view: 2, content: <div ref={analysisRef}>{analysisBody}</div> },
    { title: "方案决策", time: "12:00:28", badge: "已完成", tone: "done", view: 3,
      content: <p className="evt-decision-copy">{isolationOnly ? "12:00:28 完成预案生成，管理员已授权给agent进行自动处置" : "12:00:40 已完成L1-L2异常链路优雅隔离，并生成清污待办事件，需人工清污"}</p> },
    { title: "故障恢复", time: !isolationOnly && cleanedAt !== null ? "19:19:25" : "12:00:40",
      badge: isolationOnly || cleanedAt !== null ? "已完成" : "待人工处理",
      tone: isolationOnly || cleanedAt !== null ? "done" : "manual",
      view: isolationOnly ? 4 : 5,
      content: liveStage < 6 ? <p>正在优雅隔离异常链路</p> : recoveryBody },
  ];
  if (liveStage < 6)
    sectionsData.forEach((s, i) => {
      s.badge = liveStage >= [2, 4, 5, 6][i] ? "已完成" : "进行中";
      s.tone = s.badge === "进行中" ? "processing" : "done";
    });
  sectionsDataRef.current = sectionsData;

  const facts = [
    ["故障对象", "计算柜11 · L1交换板02光链路"],
    ["业务影响", impact],
    ["处置状态", status],
  ];

  if (!host) return null;
  return ReactDOM.createPortal(
    <div id="optical-event-root" hidden={!open}>
      {open && (
        <section ref={panelRef} className="hc-event-module hc-optical-summary" data-detail-mode={mode} data-phase={phase}>
          <aside className="evt-left" aria-label="光链路事件诊断过程">
            <div className="evt-event-heading">
              <button type="button" className="evt-back" aria-label="返回" onClick={() => doCloseRef.current()}>
                <img className="evt-icon" src={OPTICAL_ASSETS.icons["返回-原稿尺寸"]} alt="" width={20} height={20} />
              </button>
              <EventTypeIcon closed={isolationOnly || cleanedAt !== null} size={36} className="evt-icon" />
              <div className="evt-heading-copy">
                <h1>
                  {h1Text}
                  {h1Badge && <EvtBadge text={h1Badge.text} tone={h1Badge.tone} />}
                </h1>
                <time>{isolationOnly ? "2026-09-09  12:00:00" : "2026-09-09  12:00:40"}</time>
              </div>
            </div>
            <div className="evt-diagnosis-intro">
              <p>已经为您分析并生成故障的诊断，请查看后立即处理</p>
            </div>
            <div className="evt-diagnostic-scroll" ref={scrollRef}>
              <section className="nic-event-overview" aria-label="事件摘要与处理过程">
                <section className="nic-event-summary nic-summary-compact" aria-label="事件摘要">
                  <div className="nic-summary-heading">事件摘要</div>
                  <strong className="nic-summary-conclusion">{conclusion}</strong>
                  <div className="nic-summary-facts">
                    {facts.map(([label, value]) => (
                      <div className="nic-summary-fact" key={label}>
                        <span className="nic-summary-caption">{label}</span>
                        <span className="nic-summary-outcome">{value}</span>
                      </div>
                    ))}
                  </div>
                  {liveStage >= 6 && (
                    <section className="nic-summary-relation" data-state={relatedClosed ? "closed" : "manual"}>
                      <div className="nic-relation-label">{isolationOnly ? "关联待办" : "关联事件"}</div>
                      <div className="nic-relation-line">
                        <div className="nic-related-business-title">
                          <strong className="nic-relation-name">{isolationOnly ? (relatedClosed ? "光链路清污已完成" : "光链路清污") : "光链路闪断，已完成优雅隔离"}</strong>
                          <EvtBadge text={relatedClosed ? "已闭环" : "待人工处理"} tone={relatedClosed ? "closed" : "manual"}>
                            {!relatedClosed && <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={13} height={13} />}
                          </EvtBadge>
                        </div>
                        <button
                          type="button"
                          className="nic-relation-action"
                          onClick={() => { window.closeOpticalEvent(); window.openOpticalEvent({ mode: isolationOnly ? "full" : "isolation" }); }}
                        >
                          {relatedClosed ? "查看事件" : "去处理"}<i className="evt-jump-icon" />
                        </button>
                      </div>
                    </section>
                  )}
                </section>
                <div className="nic-event-process-body" ref={processBodyRef}>
                  <div className="nic-process-heading">
                    <strong>处理过程</strong>
                    <button type="button" className="evt-expand-all" aria-expanded={String(allOpen)} onClick={toggleAll}>
                      <img className="evt-icon" src={OPTICAL_ASSETS.icons["展开全部"]} alt="" width={12} height={12} />
                      <span>{allOpen ? "收起全部" : "展开全部"}</span>
                    </button>
                  </div>
                  {sectionsData.map((s, i) => {
                    if (liveStage < [1, 2, 5, 5][i]) return null;
                    return (
                      <DiagnosticStep
                        key={i}
                        title={s.title}
                        badge={s.badge}
                        tone={s.tone}
                        expanded={expanded[i]}
                        onToggle={(value) => {
                          entranceRef.current?.stop();
                          setExpanded((prev) => { const next = [...prev]; next[i] = value; return next; });
                        }}
                        onSelect={() => selectView(s.view)}
                        onBodyClick={(e) => {
                          if (e.target.closest("button,input,select,a") || e.target === e.currentTarget) return;
                          const row = e.target.closest(".evt-recovery-row");
                          const index = row ? Number(row.dataset.view) : s.view;
                          e.stopPropagation();
                          selectView(index, true);
                        }}
                        dim={focusIndex !== null && selectedStep !== i}
                        last={i === sectionsData.length - 1}
                        evidence={null}
                        bodyRef={(el) => { stepBodyRefs.current[i] = el; }}
                      >
                        {s.content}
                      </DiagnosticStep>
                    );
                  })}
                </div>
              </section>
            </div>
            <div
              className="evt-composer-wrap"
              onKeyDown={(e) => {
                if (e.target.tagName === "INPUT" && e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
              }}
            >
              <Composer value={draft} onSend={() => {}} onChange={setDraft} disabled={liveStage < 6} />
            </div>
          </aside>
          <main className="evt-right">
            <div className="evt-detail-toolbar">
              <span>诊断详情</span>
              <div className="evt-toolbar-actions">
                <button type="button" aria-label="诊断详情" disabled>
                  <img className="evt-icon" src={OPTICAL_ASSETS.icons["放大-0910"]} alt="" width={16} height={16} />
                </button>
              </div>
            </div>
            <div>
              <Topology2D view={view} isolationOnly={isolationOnly} cleanedAt={cleanedAt} onFaultPortClean={!isolationOnly ? doClean : undefined} />
            </div>
            <ProcessTimeline
              steps={timelineSteps}
              current={currentStep}
              onSelect={(i) => selectView(visibleSteps[i].viewIndex ?? i)}
              sectionRef={timelineRef}
            />
          </main>
        </section>
      )}
    </div>,
    host
  );
}
