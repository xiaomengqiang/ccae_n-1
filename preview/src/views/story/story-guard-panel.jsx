import { useEffect, useRef, useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import FlowBorder from "../../components/flow-border/index.jsx";
import FaultTip from "../../components/fault-tip/index.jsx";

const createPortal2 = (node, host) => ReactDOM.createPortal(node, host);

const STORY_COPY = {
  optical: ["", "发现链路闪断告警", "30条告警聚合，生成链路闪断 issue", "正在分析链路指标与设备日志", "定位根因：光链路脏污", "优雅隔离异常链路", "光链路待清污", "链路复核完成，已清污", "关闭光链路清污待办", "光链路隔离已取消"],
  qwen: ["", "发现 Qwen-1.5B 服务劣化告警", "定位 D实例01 异常退出", "无可替换节点，自动恢复受阻", "分析 BMC、OS 与 vmcore 日志", "定位根因：hinic3 网卡驱动版本过低", "服务劣化，待人工升级网卡驱动", "人工已确认，正在升级网卡驱动", "驱动已升级，正在核查节点与服务健康", "网卡升级与健康核查通过，服务恢复并闭环"],
};
const NAMES = { optical: "光链路脏污，待清污", qwen: "Qwen-1.5B服务劣化：网卡驱动版本低，待升级" };

export const HCEventTitle = (key, p) =>
  p === 6 ? NAMES[key]
  : key === "qwen" && p >= 7 ? "网卡升级与服务恢复"
  : key === "qwen" && p >= 4 ? "网卡驱动故障诊断"
  : STORY_COPY[key]?.[1] || NAMES[key];

const stateOf = (key, p) => (p === 9 ? "closed" : p === 6 ? "manual" : "auto");
const progressText = (key, p) =>
  STORY_COPY[key][p]
    .replace("生成链路闪断 issue", "生成链路闪断issue")
    .replace("正在分析链路指标与设备日志", "分析链路指标与设备日志");

const CABINET_D08 = [
  { title: "NPU驱动固件版本不一致", time: "11:55:00", desc: "SuperpodD · 计算柜08，等待人工处理", key: "cabinetD08-0" },
  { title: "NPU网口linkdown", time: "11:57:00", desc: "SuperpodD · 计算柜08，等待人工处理", key: "cabinetD08-1" },
];

const open = (key) => {
  if (key === "optical") window.openOpticalEvent();
  else window.openNicEvent();
};

// ImpactFlags —— 待人工处理标记（红色小手 + 影响业务星标）
function ImpactFlags({ impact = false }) {
  return (
    <span className="fault-status-flags" aria-label={impact ? "待人工处理，影响业务" : "待人工处理"}>
      <img src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
      {impact && <b className="business-impact-symbol" aria-label="影响业务" title="影响业务">✱</b>}
    </span>
  );
}

// GuardEventRow —— 单条守护事件行（自动处理/待人工处理两种状态）
function GuardEventRow({ eventKey, title, time, description, isProcessing, isManual, storyPhase }) {
  const [typedText, setTypedText] = useState(isProcessing ? "" : description);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isProcessing) return;
    const chars = Array.from(progressText(eventKey, storyPhase));
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      setTypedText(chars.slice(0, count).join(""));
      if (count >= chars.length) clearInterval(timerRef.current);
    }, 35);
    return () => clearInterval(timerRef.current);
  }, [eventKey, storyPhase, isProcessing]);

  const handleOpen = () => open(eventKey);

  return (
    <article
      className={"hc-event-row" + (isProcessing ? " hc-event-processing" : "")}
      data-linked-event={eventKey}
      role="button"
      tabIndex={0}
      aria-label={eventKey === "optical" ? "查看光链路脏污故障详情" : "查看Qwen处理进度"}
      onClick={handleOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen(); } }}
    >
      <div className="hc-event-head">
        {isProcessing ? (
          <span className="guard-auto-symbol" aria-label="故障自动处理中">
            <FlowBorder>
              <EventTypeIcon size={24} />
            </FlowBorder>
          </span>
        ) : (
          <span className="thermal-symbol">
            <EventTypeIcon size={24} />
            <ImpactFlags impact={eventKey === "qwen"} />
          </span>
        )}
        <span>{title}</span>
        <time>{time}</time>
      </div>
      <p>{isProcessing ? typedText : description}</p>
      {isProcessing && (
        <FlowBorder>
          <span />
        </FlowBorder>
      )}
    </article>
  );
}

// CabinetD08Row —— SuperpodD 计算柜08 的两个固定待人工处理事件
function CabinetD08Row({ title, time, desc, d08Key }) {
  return (
    <article className="hc-event-row" data-linked-event={d08Key}>
      <div className="hc-event-head">
        <span className="thermal-symbol">
          <EventTypeIcon size={24} />
          <ImpactFlags impact={false} />
        </span>
        <span>{title}</span>
        <time>{time}</time>
      </div>
      <p>{desc}</p>
    </article>
  );
}

// StoryGuardPanel —— 守护事件面板（真正声明式）
// 左面板中的事件列表：标题 + tab + 事件行 + 空状态
export default function StoryGuardPanel({ view = "manual", storyState, onViewAll, onViewChange }) {
  const [impactOnly, setImpactOnly] = useState(false);
  const [host, setHost] = useState(null);

  useEffect(() => {
    const el = document.getElementById("home-events");
    if (el) setHost(el);
  }, []);

  const s = storyState || { optical: 0, qwen: 0, startedAt: 0 };
  const isAuto = view === "auto" || view === "energy";
  const keys = ["optical", "qwen"].filter((k) => !impactOnly || k === "qwen");
  const automatic = keys.filter((k) => s[k] > 0 && s[k] < 9 && s[k] !== 6);
  const manual = keys.filter((k) => s[k] === 6);
  const entries = isAuto ? automatic : manual;

  // 按时间倒序排列事件行
  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = a === "optical" ? (isAuto ? "12:00:00" : "12:00:40") : "12:05:12";
    const timeB = b === "optical" ? (isAuto ? "12:00:00" : "12:00:40") : "12:05:12";
    return timeB.localeCompare(timeA);
  });

  const manualCount = manual.length + (impactOnly ? 0 : 2);
  const showD08 = !isAuto && !impactOnly;
  const showEmpty = !entries.length && (impactOnly || isAuto);

  if (!host) return null;

  return createPortal2(
    <section className="hc-guard">
      <div className="hc-guard-head">
        <h2>智能体事件</h2>
        <button
          type="button"
          className="hc-impact-filter"
          role="checkbox"
          aria-label="仅显示影响业务事件"
          aria-checked={String(impactOnly)}
          title="仅显示影响业务事件"
          onClick={() => {
            setImpactOnly(!impactOnly);
          }}
        >
          <i className="hc-impact-check" />
          <span>仅显示影响业务事件</span>
        </button>
        <button type="button" disabled={!onViewAll} onClick={onViewAll}>查看全部</button>
      </div>
      <div className="hc-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={String(!isAuto)}
          onClick={() => onViewChange?.("manual")}
        >
          待人工处理 <b className="hc-tab-count">{manualCount}</b>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={String(isAuto)}
          onClick={() => onViewChange?.("energy")}
        >
          自动处理中 <b className="hc-tab-count">{automatic.length}</b>
        </button>
      </div>
      {showEmpty && impactOnly && (
        <div className="story-impact-empty" role="status">
          暂无影响业务的{isAuto ? "自动处理事件" : "待人工处理事件"}
        </div>
      )}
      {showEmpty && !impactOnly && isAuto && (
        <div className="story-empty story-empty-processing">
          <div className="story-empty-art">
            <img src={HC_ASSETS.icons["暂无待处理事项"]} alt="暂无自动处理中的事件" />
          </div>
          <span className="story-empty-caption">暂无自动处理中事项</span>
        </div>
      )}
      {!showEmpty && sortedEntries.map((key) => (
        <GuardEventRow
          key={key}
          eventKey={key}
          title={HCEventTitle(key, s[key])}
          time={key === "optical" ? (isAuto ? "12:00:00" : "12:00:40") : "12:05:12"}
          description={
            isAuto ? ""
            : key === "optical" ? "计算柜11-L1交换板02链路已优雅隔离，等待人工清污"
            : "112.34.23.1 无可替换节点，服务仍劣化，需人工将 hinic3 从V11.8升级至V13.1"
          }
          isProcessing={isAuto}
          isManual={!isAuto}
          storyPhase={s[key]}
        />
      ))}
      {showD08 && CABINET_D08.map((d) => (
        <CabinetD08Row key={d.key} {...d} />
      ))}
    </section>,
    host
  );
}
