import { useState, useEffect, useRef } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import FlowBorder from "../../components/flow-border/index.jsx";
import StoryPopover from "./story-popover.jsx";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

const stateOf = (p) => (p === 9 ? "closed" : p === 6 ? "manual" : "auto");

// TimelineMarkerButton —— 时间轴上的标记按钮（自动/待人工/已闭环）
function TimelineMarkerButton({ eventKey, phase, state, split, onOpen }) {
  const closed = state === "closed";
  const isManual = state === "manual";
  const isAuto = state === "auto";

  const handleClick = () => {
    if (eventKey === "optical" && phase >= 6) {
      window.openOpticalEvent({ mode: "isolation" });
    } else if (eventKey === "qwen") {
      window.openNicEvent({ mode: "recovery" });
    } else {
      onOpen?.(eventKey);
    }
  };

  return (
    <button
      type="button"
      className={split ? "story-marker closed" : "story-marker " + state}
      data-count="1"
      data-part={split ? (eventKey === "optical" ? "isolation" : "recovery") : undefined}
      aria-label={eventKey + "：" + (window.HCStoryCopy?.[eventKey]?.[phase] || "")}
      onClick={handleClick}
    >
      <img src={HC_ASSETS.icons[closed || split ? "灰色的故障" : "红色的故障"]} alt="" />
      {isManual && !split && (
        <span
          className="fault-status-flags"
          style={{ position: "absolute", left: "24px", top: "-12px", zIndex: 6 }}
          aria-label={eventKey === "qwen" ? "待人工处理，影响业务" : "待人工处理"}
        >
          <img src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
          {eventKey === "qwen" && <b className="business-impact-symbol" aria-label="影响业务" title="影响业务">✱</b>}
        </span>
      )}
      {isAuto && !split && (
        <>
          <i className="hc-flow-halo"><i /></i>
          <i className="hc-flow-base" />
          <i className="hc-flow-ring" />
        </>
      )}
    </button>
  );
}

// FollowUpMarker —— split 后的后续标记（清污/驱动升级）
function FollowUpMarker({ eventKey, state, onOpen }) {
  const handleClick = () => {
    if (eventKey === "optical") window.openOpticalEvent({ mode: "full" });
    else window.openNicEvent({ mode: "driver" });
  };

  return (
    <button
      type="button"
      className={"story-marker " + state}
      data-part={eventKey === "optical" ? "cleanup" : "driver"}
      aria-label={
        (eventKey === "optical" ? "光链路清污" : "网卡驱动升级") +
        "：" +
        (state === "closed" ? "已闭环" : state === "manual" ? "待人工处理" : "自动处理中")
      }
      onClick={handleClick}
    >
      <img
        className="story-cleanup-hand"
        src={HC_ASSETS.icons[eventKey === "qwen" && state === "auto" ? "红色的故障" : "红色小手"]}
        alt=""
      />
      {state === "manual" && (
        <span
          className="fault-status-flags"
          style={{ position: "absolute", left: "24px", top: "-12px", zIndex: 6 }}
          aria-label={eventKey === "qwen" ? "待人工处理，影响业务" : "待人工处理"}
        >
          <img src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
          {eventKey === "qwen" && <b className="business-impact-symbol" aria-label="影响业务" title="影响业务">✱</b>}
        </span>
      )}
      {state === "manual" && (
        <img className="hc-event-manual-hand" src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
      )}
    </button>
  );
}

// SplitShape —— split 后的分隔形状 SVG
function SplitShape({ eventKey, state }) {
  const borderId = "split-border-" + eventKey;
  const fillId = "split-fill-" + eventKey;
  const closed = state === "closed";
  return (
    <svg className="story-split-shape" viewBox="0 0 94 24" aria-hidden="true">
      <defs>
        <linearGradient id={borderId}>
          <stop offset="48%" stopColor="#777" />
          <stop offset="76%" stopColor={closed ? "#777" : "#ed4a55"} />
        </linearGradient>
        <linearGradient id={fillId}>
          <stop offset="50%" stopColor="#393939" />
          <stop offset="100%" stopColor={closed ? "#393939" : "#613037"} />
        </linearGradient>
      </defs>
      <path
        d="M12 1H49C53 1 54 4 59 4S65 1 69 1H82A11 11 0 0 1 82 23H69C65 23 64 20 59 20S53 23 49 23H12A11 11 0 0 1 12 1Z"
        fill={`url(#${fillId})`}
        stroke={`url(#${borderId})`}
        strokeWidth="1.5"
      />
    </svg>
  );
}

// TimelineAnchor —— 时间轴上的标记锚点（标记 + popover + split 分组）
function TimelineAnchor({ eventKey, phase, startedAt, onOpen, expandedRecords, onToggleExpand }) {
  const [visible, setVisible] = useState(false);
  const autoShowRef = useRef(null);
  const state = stateOf(phase);
  const split = eventKey === "optical" && phase >= 6;
  const eventSecond = eventKey === "optical" ? 20 : 312;
  const timelineStart = -360;
  const left = ((eventSecond - timelineStart) / 1140) * 100;

  const copy = window.HCStoryCopy;
  if (!copy) return null;

  // 原版 bindPopover 逻辑：
  // - 处理中（auto，phase < 6）：popover 始终可见
  // - 非处理中（manual/closed）：auto-show 后 2200ms 隐藏，hover 可重新显示
  // phase 从 auto 变为 manual 时，重新触发 hide timer
  const hideTimerRef = useRef(null);
  const isProcessing = phase < 6;

  useEffect(() => {
    setVisible(true);
    if (!isProcessing) {
      hideTimerRef.current = setTimeout(() => setVisible(false), 2200);
    } else {
      // 处理中：清除可能存在的旧 timer，保持始终可见
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isProcessing, startedAt]);

  const handlePointerEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setVisible(true);
  };
  const handlePointerLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isProcessing) {
      hideTimerRef.current = setTimeout(() => setVisible(false), 180);
    }
  };

  const handleOpen = (key) => {
    if (key === "optical") window.openOpticalEvent();
    else window.openNicEvent();
  };

  return (
    <div
      className={"marker-anchor" + (split ? " story-split" : "") + (visible ? " story-visible" : "")}
      data-event-key={eventKey}
      data-stage={phase}
      data-started-at={startedAt}
      data-event-time={window.HCClock?.format(eventSecond) || ""}
      data-follow-state={split ? state : undefined}
      style={{ left: left + "%" }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {split && <SplitShape eventKey={eventKey} state={state} />}
      <TimelineMarkerButton eventKey={eventKey} phase={phase} state={state} split={split} onOpen={handleOpen} />
      {split && <FollowUpMarker eventKey={eventKey} state={state} onOpen={handleOpen} />}
      <StoryPopover
        eventKey={eventKey}
        phase={phase}
        state={state}
        expandedRecords={expandedRecords}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
}

// CabinetD08Anchor —— SuperpodD 计算柜08 的固定待人工处理标记
function CabinetD08Anchor({ index }) {
  const [visible, setVisible] = useState(false);
  const second = index === 0 ? -300 : -180;
  const left = ((second + 360) / 1140) * 100;
  const titles = ["NPU驱动固件版本不一致", "NPU网口linkdown"];
  const steps = [
    ["检测到NPU驱动与固件版本不一致", "核对版本兼容关系，确认升级要求", "已生成驱动与固件配套升级方案", "待人工确认升级，完成后核查版本与设备健康"],
    ["检测到NPU网口linkdown告警", "分析端口状态与链路日志，确认链路中断", "已生成网口与线缆检查方案", "待人工排查连接，完成后验证链路连通性"],
  ][index];

  return (
    <div
      className={"marker-anchor" + (visible ? " story-visible" : "")}
      data-event-key={"cabinetD08-" + index}
      style={{ left: left + "%" }}
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="story-marker manual"
        aria-label={(window.HCClock?.format(second) || "") + " SuperpodD 计算柜08 " + titles[index]}
        onClick={() => setVisible(!visible)}
      >
        <img src={HC_ASSETS.icons["红色的故障"]} alt="故障" />
        <span className="fault-status-flags" aria-label="待人工处理">
          <img src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
        </span>
      </button>
      <div className="story-popover story-popover-grouped" role="tooltip">
        <section className="story-popover-section is-active" data-state="manual">
          <div className="story-popover-heading">
            <strong>{titles[index]}</strong>
            <small>待人工处理</small>
          </div>
          {steps.map((text, i) => {
            const kind = i === steps.length - 1 ? "manual" : "done";
            return (
              <p key={i} className={"story-popover-row " + kind}>
                <i className={"story-step-icon " + kind} aria-label={kind === "manual" ? "待人工处理" : "已完成"}>
                  {kind === "manual" && <img src={HC_ASSETS.icons["红色小手"]} alt="" />}
                </i>
                <span>{text}</span>
              </p>
            );
          })}
        </section>
      </div>
    </div>
  );
}

// TimelineMarkers —— 时间轴标记容器（React 声明式渲染）
// 订阅 HCStory，根据 story 状态渲染光链路/Qwen/计算柜08 标记
export default function TimelineMarkers() {
  const [storyState, setStoryState] = useState(() => window.HCStory?.get() || { optical: 0, qwen: 0, startedAt: 0 });
  const [host, setHost] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState(new Map());

  useEffect(() => {
    setHost(document.getElementById("home-timeline-markers"));
    const unsubscribe = window.HCStory?.subscribe((s) => setStoryState(s));
    return () => { unsubscribe?.(); };
  }, []);

  const handleToggleExpand = (key, expanded) => {
    setExpandedRecords((prev) => { const next = new Map(prev); next.set(key, expanded); return next; });
  };

  const handleOpen = (key) => {
    if (key === "optical") window.openOpticalEvent();
    else window.openNicEvent();
  };

  if (!host) return null;

  const s = storyState;
  const eventKeys = ["optical", "qwen"].filter((key) => s[key] > 0);

  return createPortal(
    <>
      {eventKeys.map((key) => (
        <TimelineAnchor
          key={key}
          eventKey={key}
          phase={s[key]}
          startedAt={s.startedAt}
          onOpen={handleOpen}
          expandedRecords={expandedRecords}
          onToggleExpand={handleToggleExpand}
        />
      ))}
      {[0, 1].map((i) => (
        <CabinetD08Anchor key={"d08-" + i} index={i} />
      ))}
    </>,
    host
  );
}
