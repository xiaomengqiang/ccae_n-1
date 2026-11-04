import { useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../../mock/hc-assets.js";

// 服务旅程 —— React SVG 声明式图表（柱状请求数 + 指标线 + 劣化带 + 事件标记 + 回看游标）
// 指标切换（legend 下拉）与悬浮卡为组件内部状态；阶段/回看时刻由 event.js 以 props 推送。
// 数学公式与原 renderJourney 逐行对齐（position/高度/分段线/事件几何）。

const METRICS = {
  ttft: { label: "TTFT P99", unit: "ms", normal: 182, bad: 186 },
  tpot: { label: "TPOT P99", unit: "ms", normal: 23.6, bad: 43 },
  success: { label: "请求成功率", unit: "%", normal: 99.94, bad: 77.5 },
  rate: { label: "请求速率", unit: "req/s", normal: 1840, bad: 1840 },
  concurrency: { label: "并发请求", unit: "", normal: 892, bad: 892 },
  output: { label: "输出吞吐", unit: "k tok/s", normal: 11.2, bad: 8.7 },
};
const LATEST = [0, 12, 22, 40, 48, 56, 66, 72, 80, 120];
const position = (t) => t / 120 * 1280;
const timeLabel = (t) => "12:" + String(5 + Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
const latestSecond = (stage) => LATEST[stage];
const stageAt = (t) => t < 12 ? 0 : t < 22 ? 1 : t < 30 ? 2 : t < 48 ? 3 : t < 56 ? 4 : t < 66 ? 5 : t < 72 ? 6 : t < 80 ? 7 : t < 95 ? 8 : 9;
const degradedAt = (stage) => (t) => t >= 12 && !(stage === 9 && t >= 95);
const barHeight = (i) => 34 + Math.sin(i * 1.7) * 9 + (i % 7) * 2;

function journeyEvents(stage) {
  return [
    [6, "操作系统崩溃重启", "节点 112.34.23.1 操作系统崩溃重启", "fault", 1],
    [9, "D-08 实例异常退出", "节点 112.34.23.1 的 D-08 实例因操作系统崩溃重启而异常退出", "fault", 1],
    [12, "推理服务劣化", "Qwen-1.5B 请求成功率降至77.5%", "fault", 1],
    [72, "人工授权升级", "正在执行网卡驱动升级，服务尚未恢复", "operation", 7],
    [80, "驱动升级完成", "hinic3 已升级至 V13.1，正在核查节点、实例和服务健康", "operation", 8],
    [95, "健康核查通过", "原节点及 D-08 实例健康核查通过，Qwen-1.5B 服务恢复", "operation", 9],
  ].filter((e) => stage >= e[4]);
}

function HoverCard({ t, metricKey, stage }) {
  const m = METRICS[metricKey];
  const bad = degradedAt(stage)(t);
  const event = journeyEvents(stage).find((e) => e[0] === t);
  return (
    <>
      <div className="nic-journey-hover-heading">
        <strong>{timeLabel(t)}</strong>
        <span className={bad ? "degraded" : "normal"}>{bad ? "服务劣化" : "服务正常"}</span>
      </div>
      <dl>
        <dt>请求数</dt>
        <dd>{String(Math.round(barHeight(t) * 40))} 次</dd>
        <dt>{m.label}</dt>
        <dd>{(bad ? m.bad : m.normal) + " " + m.unit}</dd>
      </dl>
      {event && (
        <section className="journey-event-card">
          <strong className="journey-event-name">
            {event[3] === "fault" ? (
              <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色的故障"]} alt="" width={14} height={14} aria-label="故障" />
            ) : (
              <span className="journey-operation-icon" role="img" aria-label="处置操作">⇄</span>
            )}
            {event[1]}
          </strong>
          <p className="journey-event-detail">{event[2]}</p>
        </section>
      )}
    </>
  );
}

export default function ServiceJourney({ stage, journeySecond, visible, onSelectTime }) {
  const [metricKey, setMetricKey] = useState("ttft");
  const [hoverT, setHoverT] = useState(null);
  const wrapRef = useRef(null);
  const hoverSecondRef = useRef(0);

  const m = METRICS[metricKey];
  const end = latestSecond(stage);
  const badEnd = stage === 9 ? 95 : end;
  const degraded = degradedAt(stage);
  const normalY = m.bad < m.normal ? 24 : 53;
  const badY = m.bad === m.normal ? normalY : m.bad < m.normal ? 62 : 21;
  const events = journeyEvents(stage);

  const segments = [
    [0, Math.min(12, end), "#55c8a0"],
    [12, badEnd, "#ffad52"],
    [95, stage === 9 ? end : 95, "#55c8a0"],
  ];

  const clampT = (t) => Math.max(0, Math.min(end, Math.round(t)));
  const pointerT = (e) => {
    const marker = e.target.closest?.(".journey-event");
    if (marker) return clampT(Number(marker.dataset.second));
    const rect = e.currentTarget.getBoundingClientRect();
    return clampT((e.clientX - rect.left) / rect.width * 120);
  };

  const showPoint = (t) => { const c = clampT(t); hoverSecondRef.current = c; setHoverT(c); };

  const hoverLeft = () => {
    const w = wrapRef.current?.clientWidth ?? 0;
    return Math.max(0, Math.min(w - 300, hoverT / 120 * w + 14)) + "px";
  };

  return (
    <div className="nic-service-journey" role="tabpanel" aria-label="推理服务旅程" ref={wrapRef} hidden={!visible}>
      <div className="nic-journey-legend">
        <span>▥ 请求数</span>
        <label className="nic-journey-metric-label">
          <span>━</span>
          <select className="nic-journey-metric" aria-label="叠加性能指标" value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>
            {Object.entries(METRICS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
          </select>
        </label>
        <span className="nic-journey-fault">▲ 故障</span>
        <span className="nic-journey-operation">⇄ 处置操作</span>
      </div>
      <svg
        viewBox="0 0 1280 156"
        preserveAspectRatio="none"
        tabIndex={0}
        role="img"
        data-metric={metricKey}
        aria-label={m.label + "与请求数，" + (stage === 9 ? "人工升级及健康核查后服务恢复" : "服务持续劣化，尚未恢复")}
        onPointerMove={(e) => showPoint(pointerT(e))}
        onPointerLeave={() => setHoverT(null)}
        onClick={(e) => { e.stopPropagation(); onSelectTime?.(pointerT(e)); }}
        onBlur={() => setHoverT(null)}
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Enter", " ", "Escape"].includes(e.key)) return;
          e.preventDefault(); e.stopPropagation();
          if (e.key === "Escape") { setHoverT(null); return; }
          if (e.key === "Enter" || e.key === " ") { onSelectTime?.(Number(e.target.dataset?.second) || hoverSecondRef.current); return; }
          showPoint(hoverSecondRef.current + (e.key === "ArrowRight" ? 1 : -1));
        }}
      >
        {end >= 12 && (
          <rect x={position(12)} y={4} width={position(badEnd - 12)} height={96} rx={4} fill="#f5a544" opacity=".16" />
        )}
        {Array.from({ length: end + 1 }, (_, i) => {
          const h = barHeight(i);
          return <rect key={i} x={position(i)} y={77 - h} width={6} height={h} rx={1} fill="#87bfe9" opacity=".85" />;
        })}
        {segments.map(([start, stop, color], si) => {
          if (stop <= start) return null;
          let d = "";
          for (let t = start; t <= stop; t++) {
            const y = (degraded(t) ? badY : normalY) + Math.sin(t * 1.7) * 0.6;
            d += (t === start ? "M" : "L") + position(t) + " " + y;
          }
          return <path key={si} d={d} fill="none" stroke={color} strokeWidth={2} />;
        })}
        <rect x={0} y={83} width={1280} height={17} rx={4} fill="#414141" />
        <rect className="journey-resource-lane" x={0} y={106} width={1280} height={17} rx={4} fill="#414141" />
        {end >= 12 && (
          <>
            <rect x={position(12)} y={83} width={position(badEnd - 12)} height={17} fill="#ed9a36" />
            <text x={position(12) + 8} y={96} fill="white" fontSize={12}>服务劣化</text>
          </>
        )}
        {events.map(([t, name, detail, type]) => {
          const x = position(t);
          const fault = type === "fault";
          return (
            <g
              key={t}
              className="journey-event"
              tabIndex={0}
              role="button"
              aria-label={timeLabel(t) + " " + name}
              data-type={type}
              data-second={t}
              onFocus={() => showPoint(t)}
            >
              <rect x={x - (fault ? 5 : 9)} y={104} width={fault ? 10 : 18} height={22} fill="transparent" />
              {fault ? (
                <path d={"M" + x + " 108 l-4.5 11 h9 Z"} fill="#ed747c" />
              ) : (
                <>
                  <circle cx={x} cy={115} r={7} fill="#252b33" stroke="#7bb8f6" />
                  <text x={x} y={119} textAnchor="middle" fill="#7bb8f6" fontSize={12}>⇄</text>
                </>
              )}
            </g>
          );
        })}
        {[0, 12, 40, 66, 95, 120].map((t) => (
          <text key={t} x={position(t)} y={151} textAnchor={t === 120 ? "end" : "start"} fill="#bcbcbc" fontSize={12}>
            {timeLabel(t)}
          </text>
        ))}
        {journeySecond !== null && (
          <line x1={position(journeySecond)} x2={position(journeySecond)} y1={0} y2={133} stroke="#80bfff" strokeWidth={2} />
        )}
      </svg>
      {hoverT !== null && (
        <div className="nic-journey-hover" style={{ left: hoverLeft() }}>
          <HoverCard t={hoverT} metricKey={metricKey} stage={stage} />
        </div>
      )}
    </div>
  );
}
