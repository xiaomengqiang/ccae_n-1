import { useEffect, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import Composer from "../../components/composer/index.jsx";
import EvtBadge from "../../components/evt-badge/index.jsx";
import NicTopology from "./nic-topology.jsx";
import ProcessFlow from "./process-flow.jsx";
import ServiceJourney from "./service-journey.jsx";
import DiagnosticHistory from "./diagnostic-history.jsx";

// Qwen 网卡驱动故障事件详情 —— 完整 React 组件（状态机 + 面板 + 四个子区域）
// 阶段状态（stage/journeySecond/selected/expanded）由 HCStory 订阅与交互驱动；
// 拓扑六边形/机柜/流程图/服务旅程/诊断历史为子组件，HCEvidence 取证与入场动画保持命令式。

const SECTIONS = [
  { title: "事件感知", at: 1, text: "推理服务劣化 12:05:12\n业务影响：Qwen-1.5B 请求成功率降至77.5%\n实例异常：D-08 实例异常退出，服务持续劣化" },
  { title: "业务故障诊断", at: 2, text: "12:05:22 完成业务故障诊断：节点操作系统崩溃重启，导致 D-08 实例异常退出", chain: ["操作系统崩溃重启", "D-08 实例异常退出", "Qwen-1.5B 请求成功率降至77.5%"] },
  { title: "业务恢复方案决策", at: 3, text: "12:05:30 评估节点切换方案\n12:05:40 因无可替换节点，无法生成可执行的业务恢复方案" },
  { title: "资源故障诊断", at: 4, text: "12:05:56 完成 BMC、OS 日志与 vmcore 综合分析：hinic3 网卡驱动版本过低导致操作系统崩溃重启，进而导致服务劣化", chain: ["网卡驱动版本过低", "操作系统内存耗尽", "内核空指针异常", "操作系统崩溃重启", "D-08 实例异常退出", "Qwen-1.5B 服务劣化"] },
  { title: "资源恢复方案决策", at: 6, text: "12:06:06 已生成网卡升级方案：将 hinic3 驱动由 V11.8 升级至 V13.1\n无可替换节点，采用原节点人工升级方案；升级后核查驱动版本、D-08 实例和 Qwen-1.5B 服务" },
  { title: "故障恢复", at: 6, text: "", manual: true },
];

const FLOW = [
  ["事件感知", "服务劣化／D-08 实例异常", 0, "12:05:12", 1],
  ["业务故障诊断", "定位直接原因／操作系统崩溃重启", 1, "12:05:22", 2],
  ["业务恢复方案决策", "评估节点切换方案", 2, "12:05:30", 3],
  ["业务恢复方案决策", "无可替换节点／无可用方案", 2, "12:05:40", 3],
  ["资源故障诊断", "BMC日志分析", 3, "12:05:48", 4],
  ["资源故障诊断", "OS日志分析", 3, "12:05:48", 4],
  ["资源故障诊断", "vmcore分析", 3, "12:05:48", 4],
  ["资源故障诊断", "综合分析／网卡驱动版本低", 3, "12:05:56", 5],
  ["资源恢复方案决策", "生成网卡升级方案", 4, "12:06:06", 6],
  ["故障恢复", "等待人工授权升级", 5, "12:06:06", 6],
  ["故障恢复", "人工授权／开始升级网卡驱动", 5, "12:06:12", 7],
  ["故障恢复", "驱动升级完成／核查节点与实例健康", 5, "12:06:20", 8],
  ["故障恢复", "健康核查通过／服务恢复，事件闭环", 5, "12:06:35", 9],
];

const STEP_TIPS = [
  ["D-08实例异常退出", "Qwen-1.5B 请求成功率降至 77.5%，D-08 实例异常退出", "fault"],
  ["操作系统崩溃重启", "112.34.23.1 操作系统崩溃重启，导致 D-08 实例退出并影响 Qwen-1.5B 服务", "fault"],
  ["评估节点切换方案", "正在检查可用替换节点，评估 D-08 实例迁移的可行性", "processing"],
  ["无可用业务恢复方案", "未找到可替换节点，无法生成可执行的节点切换方案，服务仍处于劣化状态", "fault"],
  ["BMC 日志分析结果", "112.34.23.1：关联节点重启记录，确认故障发生于 D-08 实例所在节点", "done"],
  ["OS 日志分析结果", "操作系统内存耗尽并崩溃重启，导致 D-08 实例异常退出", "done"],
  ["vmcore 分析结果", "发现内核空指针异常，结合 OS 日志与驱动版本信息进行根因分析", "done"],
  ["待升级网卡驱动版本", "112.34.23.1 · CPU02 · hinic3 V11.8 导致系统异常，进而影响 Qwen-1.5B 服务", "root"],
  ["网卡升级方案已生成", "将 112.34.23.1 的 hinic3 驱动由 V11.8 升级至 V13.1，随后核查节点、D-08 实例与服务健康", "plan"],
  ["待升级网卡驱动版本", "112.34.23.1 · CPU02 · hinic3 当前版本为 V11.8，版本过低，需升级至 V13.1", "manual"],
  ["已人工授权，正在升级网卡驱动", "112.34.23.1 · CPU02 · hinic3 V11.8 → V13.1，服务尚未恢复", "processing"],
  ["网卡驱动升级完成，正在核查健康", "hinic3 已升级至 V13.1，正在检查节点、D-08 实例及 Qwen-1.5B 服务", "processing"],
  ["健康核查通过，事件已闭环", "112.34.23.1 · hinic3 V13.1，节点与 D-08 实例健康核查通过，Qwen-1.5B 服务已恢复", "done"],
];

const LATEST = [0, 12, 22, 40, 48, 56, 66, 72, 80, 120];
const stageAt = (t) => (t < 12 ? 0 : t < 22 ? 1 : t < 30 ? 2 : t < 48 ? 3 : t < 56 ? 4 : t < 66 ? 5 : t < 72 ? 6 : t < 80 ? 7 : t < 95 ? 8 : 9);
const currentSection = (v) => (v >= 6 ? 5 : v >= 4 ? 3 : v >= 3 ? 2 : v >= 2 ? 1 : 0);
const timeLabel = (t) => "12:" + String(5 + Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// 草稿跨开关面板保留（原模块级变量行为）
let draftStore = "";

export default function NicEvent() {
  const [host, setHost] = useState(null);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(6);
  const [journeySecond, setJourneySecond] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(() => SECTIONS.map(() => true));
  const [activeView, setActiveView] = useState(0);
  const [draft, setDraft] = useState(draftStore);
  const panelRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => setHost(document.getElementById("screen")), []);

  // 供订阅回调读取最新值的 refs
  const stageRef = useRef(stage); stageRef.current = stage;
  const journeyRef = useRef(journeySecond); journeyRef.current = journeySecond;
  const selectedRef = useRef(selected); selectedRef.current = selected;

  const doOpen = () => {
    if (openRef.current) return;
    openRef.current = true;
    window.closeEnergyDetail?.();
    window.closeOpticalEvent?.();
    const next = Math.max(1, window.HCStory?.get().qwen ?? 6);
    setStage(next);
    setSelected(null);
    setJourneySecond(null);
    setActiveView(0);
    setExpanded(SECTIONS.map((_, i) => next < 9 && i === currentSection(next)));
    setDraft(draftStore);
    setOpen(true);
  };
  const doClose = () => { openRef.current = false; setOpen(false); };
  const openRef = useRef(false);
  const doCloseRef = useRef(doClose); doCloseRef.current = doClose;

  // window API 桥接（story 时间轴标记 / 守护事件表 / energy-detail 调用）
  useEffect(() => {
    window.openNicEvent = doOpen;
    window.closeNicEvent = doClose;
    window.resetNicEvent = () => { doClose(); draftStore = ""; };
    return () => { window.openNicEvent = undefined; window.closeNicEvent = undefined; window.resetNicEvent = undefined; };
  }, []);

  // story 订阅：qwen 归零关闭面板；阶段变化推进（回看/选中时不重置展开状态）
  useEffect(() => {
    if (!open) return;
    return window.HCStory?.subscribe?.((next) => {
      if (!next.qwen) { doCloseRef.current(); return; }
      if (next.qwen !== stageRef.current) {
        const s = next.qwen;
        setStage(s);
        if (journeyRef.current === null && selectedRef.current === null)
          setExpanded(SECTIONS.map((_, i) => s < 9 && i === currentSection(s)));
      }
    });
  }, [open]);

  // 入场动画（命令式 HCEntrance，开关面板各执行一次）
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const entrance = HCEntrance(panelRef.current);
    entrance.enter(stageRef.current < 6 ? "live" : "complete");
    return () => entrance.stop();
  }, [open]);

  // 侧边栏「首页」关闭面板
  useEffect(() => {
    const onDocClick = (e) => { if (e.target.closest('#home-sidebar button[aria-label="首页"]')) doCloseRef.current(); };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---- 派生状态（原 updateService 的计算部分） ----
  const viewStage = journeySecond === null ? stage : Math.min(stage, stageAt(journeySecond));
  const repaired = viewStage === 9 || (journeySecond !== null && journeySecond < 12);
  const healthyNode = viewStage === 9 || (journeySecond !== null && journeySecond < 6);
  const nodeState = repaired ? "服务已恢复" : viewStage === 7 ? "驱动升级中" : viewStage === 8 ? "健康核查中" : "故障节点";
  let tip = {
    kind: "simple", iconName: repaired ? "完成" : "红色的故障",
    title: repaired ? "网卡驱动升级完成" : viewStage >= 5 ? "待升级网卡驱动版本" : "操作系统崩溃重启",
    text: repaired ? "112.34.23.1 · hinic3 V13.1，D-08 实例与推理服务健康核查通过" : "112.34.23.1 · CPU02 · hinic3 V11.8；无可替换节点，Qwen-1.5B 服务持续劣化",
  };
  if (viewStage === 6 && journeySecond === null)
    tip = { kind: "manual", title: "待升级网卡驱动版本", badge: "根因", text: "112.34.23.1 · CPU02 · hinic3 当前版本为 V11.8，版本过低，需升级至 V13.1" };
  if (journeySecond !== null && journeySecond >= 10 && journeySecond < 12)
    tip = { kind: "plain", title: "节点异常，服务影响尚未上报" };
  if (journeySecond !== null && journeySecond < 6)
    tip = { kind: "plain", title: "故障发生前，节点和服务正常" };
  const tipIndex = selected !== null ? selected : journeySecond === null ? (stage === 6 ? 9 : stage === 7 ? 10 : stage === 8 ? 11 : stage === 9 ? 12 : null) : null;
  if (tipIndex !== null) {
    const [name, copy, state] = STEP_TIPS[tipIndex > 0 && tipIndex < 7 ? 1 : tipIndex];
    tip = state === "manual"
      ? { kind: "manual", title: name, badge: "根因", text: copy, flowIndex: tipIndex }
      : { kind: "simple", iconName: state === "plan" ? "报告图标" : state === "done" ? "完成" : state === "processing" ? "人工处理-绿色" : "红色的故障", title: name, badge: state === "root" ? "根因" : null, text: copy, flowIndex: tipIndex };
  }

  const metrics = [
    ["请求成功率", repaired ? "99.94%" : "77.5%"],
    ["请求速率", "1840 req/s"],
    ["TTFT P99", repaired ? "182 ms" : "186 ms"],
    ["TPOT P99", repaired ? "23.6 ms" : "43 ms"],
    ["并发请求", "892"],
    ["输出吞吐", repaired ? "11.2 k tok/s" : "8.7 k tok/s"],
  ];

  // ---- 交互 ----
  const focus = (i) => {
    setJourneySecond(null);
    setSelected(i);
    setExpanded((prev) => { const next = [...prev]; next[FLOW[i][2]] = true; return next; });
    requestAnimationFrame(() => historyRef.current?.querySelector(`[data-section="${FLOW[i][2]}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };
  const selectTime = (t) => {
    const clamped = Math.max(0, Math.min(LATEST[stage], Math.round(t)));
    const v = Math.min(stage, stageAt(clamped));
    setJourneySecond(clamped);
    setSelected(null);
    setExpanded(SECTIONS.map((_, i) => v > 0 && i === currentSection(v)));
  };
  const backToLatest = () => {
    setJourneySecond(null);
    setSelected(null);
    setExpanded(SECTIONS.map((_, i) => stage < 9 && i === currentSection(stage)));
  };
  const authorize = () => { setSelected(null); window.HCStory?.complete("qwen"); };
  const toggleAll = () => {
    const visible = SECTIONS.map((s, i) => (viewStage >= s.at ? i : -1)).filter((i) => i >= 0);
    const allExpanded = visible.length > 0 && visible.every((i) => expanded[i]);
    const next = !allExpanded;
    setExpanded((prev) => { const copy = [...prev]; visible.forEach((i) => { copy[i] = next; }); return copy; });
  };
  const onPanelClick = (e) => {
    const flowBlank = e.target.closest(".nic-flow-viewport") && !e.target.closest("button,a,input,select,[role=tab]");
    if (!flowBlank && e.target.closest("button,input,select,.evt-step,.nic-upgrade-tip,.nic-process,.nic-event-summary")) return;
    setSelected(null);
  };
  const onDraftChange = (v) => { draftStore = v; setDraft(v); };

  if (!open || !host) return null;
  return createPortal(
    <section
      ref={panelRef}
      className="hc-event-module hc-nic-module nic-unified"
      data-detail-mode="unified"
      data-stage={stage}
      data-replay={String(journeySecond !== null)}
      aria-label="Qwen网卡驱动业务故障详情"
      onClick={onPanelClick}
    >
      <aside className="evt-left">
        <div className="evt-event-heading">
          <button type="button" className="evt-back" aria-label="返回" onClick={doClose}>
            <img className="evt-icon" src={OPTICAL_ASSETS.icons["返回-原稿尺寸"]} alt="" width={20} height={20} />
          </button>
          <div className="evt-heading-copy">
            <h1>{stage === 9 ? "Qwen-1.5B服务已恢复，网卡故障已闭环" : "Qwen-1.5B服务劣化：网卡驱动版本低"}</h1>
            <time>2026-09-09 12:05:12</time>
          </div>
          <EventTypeIcon closed={repaired} size={36} className="evt-icon">
            {viewStage === 6 && (
              <span className="fault-status-flags">
                <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={13} height={13} />
                <b className="business-impact-symbol">✱</b>
              </span>
            )}
          </EventTypeIcon>
        </div>
        <div className="evt-diagnosis-intro">
          <p>
            {repaired ? "网卡驱动升级与服务健康核查完成，事件已闭环"
              : viewStage === 6 ? "无可替换节点，服务仍劣化，请人工升级网卡驱动"
              : viewStage >= 7 ? "已确认人工升级，正在执行修复与健康核查"
              : "正在诊断业务故障并评估恢复方案"}
          </p>
        </div>
        <div className="evt-diagnostic-scroll" ref={historyRef}>
          <DiagnosticHistory
            v={viewStage}
            journeySecond={journeySecond}
            expanded={expanded}
            selected={selected}
            flow={FLOW}
            sections={SECTIONS}
            onToggle={(i, val) => setExpanded((prev) => { const next = [...prev]; next[i] = val; return next; })}
            onStepSelect={(i) => focus(FLOW.findIndex((f) => f[2] === i))}
            onSummaryClick={focus}
            onAuthorize={authorize}
            onToggleAll={toggleAll}
          />
        </div>
        <div className="evt-composer-wrap">
          <Composer value={draft} onSend={() => {}} onChange={onDraftChange} />
        </div>
      </aside>
      <main className="evt-right">
        <div className="evt-detail-toolbar"><span>诊断详情</span></div>
        <section className={"nic-service" + (repaired ? " nic-service-recovered" : "")}>
          <div className="nic-service-title">
            <span>Qwen-1.5B服务</span>
            <EvtBadge text={repaired ? "正常" : "劣化"} tone={repaired ? "done" : "degraded"} />
          </div>
          <div className="nic-metrics">
            {metrics.map(([name, value]) => {
              const parts = value.match(/^([\d.]+)\s*(.*)$/);
              return (
                <div key={name}>
                  <small>{name}</small>
                  <strong>{parts[1]}<span className="nic-metric-unit">{parts[2]}</span></strong>
                </div>
              );
            })}
          </div>
          <div
            className="nic-instance-topology"
            aria-label={repaired ? "原节点完成网卡升级，Qwen服务恢复" : "无可替换节点，D-08 实例异常，Qwen服务劣化"}
          >
            <NicTopology hexFault={!healthyNode} nodeState={nodeState} healthy={healthyNode} tip={tip} />
          </div>
        </section>
        <section className="nic-process">
          <div className="nic-view-tabs" role="tablist" aria-label="处理过程视图">
            {["服务旅程", "处理环节"].map((name, i) => (
              <button key={name} type="button" className="nic-view-tab" role="tab" aria-selected={String(activeView === i)} onClick={() => setActiveView(i)}>
                {name}
              </button>
            ))}
          </div>
          <ProcessFlow flow={FLOW} stage={viewStage} rawStage={stage} selected={selected} hidden={activeView !== 1} onSelectStep={focus} />
          <ServiceJourney stage={stage} journeySecond={journeySecond} visible={activeView === 0} onSelectTime={selectTime} />
          <div className="nic-journey-replay" hidden={journeySecond === null}>
            <span>{journeySecond === null ? "" : "回看 " + timeLabel(journeySecond)}</span>
            <button type="button" onClick={backToLatest}>返回最新</button>
          </div>
        </section>
      </main>
    </section>,
    host
  );
}
