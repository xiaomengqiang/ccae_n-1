import { useMemo, useRef, useState } from "react";
import EChart from "../energy-detail/echart-box.jsx";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

// 服务旅程 —— ECharts 图表（每秒请求数柱 + 分段指标线 + 劣化带 + 双泳道 + 事件标记 + 回看游标 + 时间刻度）
// 由手写 SVG 迁移到 ECharts（SVG renderer，复用 energy-detail/echart-box 宿主组件）。
// 坐标映射与原 viewBox(0 0 1280 156) + preserveAspectRatio="none" 几何逐一对齐：
// grid 满边距、xAxis 0..120（秒）、yAxis 0..156（value = 156 - 原像素 y），随容器宽高线性拉伸；
// 装饰层/柱/事件标记/游标用 custom series 按 viewBox 单位换算绘制，指标线为 line series + visualMap 分段着色。
// 指标切换（legend 下拉）、悬浮卡、键盘回看保持 React 内部状态；阶段/回看时刻由 index.jsx 以 props 推送。

const METRICS = {
  ttft: { label: "TTFT P99", unit: "ms", normal: 182, bad: 186 },
  tpot: { label: "TPOT P99", unit: "ms", normal: 23.6, bad: 43 },
  success: { label: "请求成功率", unit: "%", normal: 99.94, bad: 77.5 },
  rate: { label: "请求速率", unit: "req/s", normal: 1840, bad: 1840 },
  concurrency: { label: "并发请求", unit: "", normal: 892, bad: 892 },
  output: { label: "输出吞吐", unit: "k tok/s", normal: 11.2, bad: 8.7 },
};
const LATEST = [0, 12, 22, 40, 48, 56, 66, 72, 80, 120];
const VBW = 1280; // 原 viewBox 宽（横向单位换算基准）
const VBH = 156; // 原 viewBox 高（纵向单位换算基准）
const BASELINE = 77; // 柱状图基线（原 svg y=77）
const TEXT_MID = 4.2; // 12px 文字基线→视觉中心偏移（≈0.35em）：zrender 文本不认 textBaseline:'alphabetic'，统一用 textVerticalAlign:'middle' 锚定后按此补偿回原基线位置
const TIME_TICKS = [0, 12, 40, 66, 95, 120];
const timeLabel = (t) => "12:" + String(5 + Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
const latestSecond = (stage) => LATEST[stage];
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
  const [hoverMarker, setHoverMarker] = useState(null); // 当前 hover 命中的事件标记下标（null=未命中）
  const wrapRef = useRef(null);
  const hoverSecondRef = useRef(0);

  const m = METRICS[metricKey];
  const end = latestSecond(stage);
  const badEnd = stage === 9 ? 95 : end;
  const events = journeyEvents(stage);

  const option = useMemo(() => {
    const degraded = degradedAt(stage);
    const normalY = m.bad < m.normal ? 24 : 53;
    const badY = m.bad === m.normal ? normalY : m.bad < m.normal ? 62 : 21;
    const seconds = Array.from({ length: end + 1 }, (_, t) => t);
    return {
      animation: false,
      tooltip: { show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: "value", min: 0, max: 120, show: false },
      yAxis: { type: "value", min: 0, max: VBH, show: false },
      // 指标线分段着色：正常绿 / 劣化橙 / 恢复绿（分段边界与原 segments 一致：12s 与 95s）
      visualMap: {
        show: false,
        type: "piecewise",
        dimension: 0,
        seriesIndex: 2,
        pieces: [
          { gte: 0, lt: 12, color: "#55c8a0" },
          { gte: 12, lt: 95, color: "#ffad52" },
          { gte: 95, color: "#55c8a0" },
        ],
      },
      series: [
        { // 装饰层：劣化带 / 双泳道 / 劣化覆盖与文案 / 时间刻度（原 svg 静态几何，viewBox 单位换算）
          type: "custom",
          silent: true,
          data: [[end, badEnd]],
          renderItem: (params, api) => {
            const endV = api.value(0);
            const badEndV = api.value(1);
            const W = api.getWidth();
            const H = api.getHeight();
            const px = (sec) => (sec / 120) * W;
            const py = (yUnit) => (yUnit / VBH) * H;
            const r4 = (4 / VBW) * W;
            const children = [];
            if (endV >= 12)
              children.push({ type: "rect", shape: { x: px(12), y: py(4), width: px(badEndV) - px(12), height: py(100) - py(4), r: r4 }, style: { fill: "#f5a544", opacity: 0.16 } });
            children.push({ type: "rect", shape: { x: 0, y: py(83), width: W, height: py(100) - py(83), r: r4 }, style: { fill: "#414141" } });
            children.push({ type: "rect", shape: { x: 0, y: py(106), width: W, height: py(123) - py(106), r: r4 }, style: { fill: "#414141" } });
            if (endV >= 12) {
              children.push({ type: "rect", shape: { x: px(12), y: py(83), width: px(badEndV) - px(12), height: py(100) - py(83) }, style: { fill: "#ed9a36" } });
              children.push({ type: "text", style: { text: "服务劣化", x: px(12) + (8 / VBW) * W, y: py(95) - TEXT_MID, fill: "white", fontSize: 12, textAlign: "left", textVerticalAlign: "middle" } });
            }
            TIME_TICKS.forEach((t) =>
              children.push({ type: "text", style: { text: timeLabel(t), x: px(t), y: py(151) - TEXT_MID, fill: "#bcbcbc", fontSize: 12, textAlign: t === 120 ? "right" : "left", textVerticalAlign: "middle" } })
            );
            return { type: "group", children };
          },
        },
        { // 每秒请求数柱（6 单位宽圆角柱，基线 y=77，随 stage 逐秒增多）
          type: "custom",
          silent: true,
          data: seconds.map((t) => [t, barHeight(t)]),
          renderItem: (params, api) => {
            const t = api.value(0);
            const h = api.value(1);
            const W = api.getWidth();
            const H = api.getHeight();
            const halfW = (3 / VBW) * W;
            const x = (t / 120) * W;
            const yTop = ((BASELINE - h) / VBH) * H;
            const yBot = (BASELINE / VBH) * H;
            return { type: "rect", shape: { x: x - halfW, y: yTop, width: halfW * 2, height: yBot - yTop, r: (1 / VBW) * W }, style: { fill: "#87bfe9", opacity: 0.85 } };
          },
        },
        { // 指标线（逐秒采样 + 微抖动，原 segments 的三段折线合并为 visualMap 分段着色）
          type: "line",
          silent: true,
          showSymbol: false,
          lineStyle: { width: 2 },
          data: seconds.map((t) => [t, VBH - ((degraded(t) ? badY : normalY) + Math.sin(t * 1.7) * 0.6)]),
        },
        { // 事件标记：故障三角（▲ y108..119）/ 处置圆圈（⇄ cy=115 r=7）；类型用数值编码（字符串维度经数据解析后 api.value 不保真）
          // hover 增亮对齐原 .journey-event:hover{filter:brightness(1.5)}：按命中下标（hoverMarker）切换为预先算好的 1.5 倍提亮色
          type: "custom",
          silent: true,
          data: events.map((e) => [e[0], e[3] === "fault" ? 0 : 1]),
          renderItem: (params, api) => {
            const t = api.value(0);
            const hot = params.dataIndex === hoverMarker;
            const W = api.getWidth();
            const H = api.getHeight();
            const px = (sec) => (sec / 120) * W;
            const py = (yUnit) => (yUnit / VBH) * H;
            const x = px(t);
            if (api.value(1) === 0) {
              const hw = (4.5 / VBW) * W;
              return { type: "polygon", shape: { points: [[x, py(108)], [x - hw, py(119)], [x + hw, py(119)]] }, style: { fill: hot ? "#ffaeba" : "#ed747c" } };
            }
            return {
              type: "group",
              children: [
                { type: "circle", shape: { cx: x, cy: py(115), r: (7 / VBH) * H }, style: { fill: hot ? "#38414d" : "#252b33", stroke: hot ? "#b9ffff" : "#7bb8f6", lineWidth: 1 } },
                { type: "text", style: { text: "⇄", x, y: py(115), fill: hot ? "#b9ffff" : "#7bb8f6", fontSize: 12, textAlign: "center", textVerticalAlign: "middle" } },
              ],
            };
          },
        },
        { // 回看游标（原 y0..133 蓝色竖线）
          type: "custom",
          silent: true,
          data: journeySecond !== null ? [[journeySecond]] : [],
          renderItem: (params, api) => {
            const W = api.getWidth();
            const H = api.getHeight();
            const x = (api.value(0) / 120) * W;
            return { type: "line", shape: { x1: x, y1: 0, x2: x, y2: (133 / VBH) * H }, style: { stroke: "#80bfff", lineWidth: 2 } };
          },
        },
      ],
    };
  }, [stage, metricKey, journeySecond, hoverMarker, m, end, badEnd]);

  const clampT = (t) => Math.max(0, Math.min(end, Math.round(t)));
  // 标记命中判定（与原 svg 透明 hit-rect 一致：故障 ±5 / 处置 ±9 个 viewBox 横向像素，纵向限定 y104..126 资源泳道带）
  const markerHitIndex = (rect, clientX, clientY) => {
    if (rect.width <= 0 || rect.height <= 0) return null;
    const vRatio = (clientY - rect.top) / rect.height;
    if (vRatio < 104 / VBH || vRatio > 126 / VBH) return null;
    const rawT = ((clientX - rect.left) / rect.width) * 120;
    for (let i = 0; i < events.length; i++) {
      const limit = ((events[i][3] === "fault" ? 5 : 9) / VBW) * 120; // viewBox 像素 → 秒
      if (Math.abs(rawT - events[i][0]) <= limit) return i;
    }
    return null;
  };
  const pointerT = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = markerHitIndex(rect, e.clientX, e.clientY);
    setHoverMarker(idx);
    // 命中标记时吸附到标记秒（对齐原 closest(".journey-event") 分支：悬浮卡直接显示事件详情）
    return idx !== null ? events[idx][0] : clampT(((e.clientX - rect.left) / rect.width) * 120);
  };
  const showPoint = (t) => { const c = clampT(t); hoverSecondRef.current = c; setHoverT(c); };
  const hoverLeft = () => {
    const w = wrapRef.current?.clientWidth ?? 0;
    return Math.max(0, Math.min(w - 300, (hoverT / 120) * w + 14)) + "px";
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
      <div
        className={"nic-journey-chart" + (hoverMarker !== null ? " marker-hot" : "")}
        tabIndex={0}
        data-metric={metricKey}
        onPointerMove={(e) => showPoint(pointerT(e))}
        onPointerLeave={() => { setHoverT(null); setHoverMarker(null); }}
        onClick={(e) => { e.stopPropagation(); onSelectTime?.(pointerT(e)); }}
        onBlur={() => setHoverT(null)}
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Enter", " ", "Escape"].includes(e.key)) return;
          e.preventDefault(); e.stopPropagation();
          if (e.key === "Escape") { setHoverT(null); return; }
          if (e.key === "Enter" || e.key === " ") { onSelectTime?.(hoverSecondRef.current); return; }
          showPoint(hoverSecondRef.current + (e.key === "ArrowRight" ? 1 : -1));
        }}
      >
        <EChart
          option={option}
          label={m.label + "与请求数，" + (stage === 9 ? "人工升级及健康核查后服务恢复" : "服务持续劣化，尚未恢复")}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {hoverT !== null && (
        <div className="nic-journey-hover" style={{ left: hoverLeft() }}>
          <HoverCard t={hoverT} metricKey={metricKey} stage={stage} />
        </div>
      )}
    </div>
  );
}
