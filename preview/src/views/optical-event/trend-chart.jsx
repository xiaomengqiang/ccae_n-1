import { useEffect, useMemo, useRef, useState } from "react";

// 光链路趋势图（ECharts 版，替代原手拼 SVG 引擎）
// 双实例（上：四通道光功率折线 + 门限着色 + 图例 + 阈值线；下：错误计数柱），connect 联动悬浮；
// live 模式组件内部 1s 心跳驱动（HCClock 业务时钟，原 monitorTimer 语义），
// snapshot 模式渲染一次冻结。数据层为纯函数（通道波形/错误计数/时间轴与原 update 公式一致）。

const CHANNELS = [
  { name: "通道1", color: "#79c530" },
  { name: "通道2", color: "#7955ff" },
  { name: "通道3", color: "#26bbca" },
  { name: "通道4", color: "#ffa33e" },
];
const BASES = [-0.45, -0.7, -0.25];

const timeLabel = (seconds) => [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map((v) => String(v).padStart(2, "0")).join(":");

// 通道采样值（原 update 公式：sin 波动 + 通道4 清污恢复/低功率）
const channelValues = (elapsed, cleanedAt, c) =>
  Array.from({ length: 8 }, (_, i) => {
    const t = elapsed + i;
    const recovered = cleanedAt !== null && elapsed - 7 + i >= cleanedAt;
    const base = c === 3 ? (recovered ? -0.55 : -12.9) : BASES[c];
    return Number((base + Math.sin(t * 1.2 + c) * (c === 3 && !recovered ? 0.35 : 0.1)).toFixed(3));
  });

const errorValues = (elapsed, cleanedAt) =>
  Array.from({ length: 8 }, (_, i) => {
    const recovered = cleanedAt !== null && elapsed - 7 + i >= cleanedAt;
    return recovered ? 0 : Math.round(76 + Math.sin((elapsed + i) * 1.4) * 12);
  });

const timeAxis = (elapsed, recovery, monitorStartedAt) => {
  const interval = recovery ? 300 : 1;
  const end = recovery ? 12 * 3600 + 40 + 2100 + Math.floor(Math.max(0, Date.now() - monitorStartedAt) / 300000) * 300 : 12 * 3600 + elapsed;
  return Array.from({ length: 8 }, (_, i) => timeLabel(end - (7 - i % 8) * interval));
};

// 布局：containLabel 把轴标签/刻度计入边距（杜绝小容器下溢出被裁）
const powerGrid = { left: 0, right: 0, top: 36, bottom: 32, containLabel: true };
const errorGrid = { left: 0, right: 0, top: 36, bottom: 16, containLabel: true };

const categoryAxis = (times) => ({
  type: "category",
  data: times,
  boundaryGap: true,
  axisLine: { lineStyle: { color: "#494949" } },
  axisTick: { show: true, length: 4, lineStyle: { color: "#aaa" } },
  // 时刻稀疏显示（隔一个），避免 8 个刻度挤在一起
  axisLabel: { color: "#aaa", fontSize: 9, interval: 1 },
});

const valueAxis = (min, max, interval) => ({
  type: "value",
  min,
  max,
  interval,
  axisLine: { show: false },
  axisTick: { show: true, length: 4, lineStyle: { color: "#494949" } },
  axisLabel: { color: "#aaa", fontSize: 11 },
  splitLine: { lineStyle: { color: "#494949" } },
});

const tooltipBase = {
  trigger: "axis",
  backgroundColor: "rgba(22,24,28,.95)",
  borderColor: "#555",
  textStyle: { color: "#eee", fontSize: 11 },
  // 指标按行显示（\n 生效需允许换行）
  extraCssText: "white-space: pre-line;",
};

function powerOption(times, elapsed, cleanedAt) {
  return {
    animation: false,
    title: { text: "光功率（dBm）", left: -4, top: 4, textStyle: { color: "#ddd", fontSize: 13, fontWeight: 500 } },
    legend: {
      bottom: 12,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: "#bbb", fontSize: 11 },
      data: CHANNELS.map((c) => c.name),
    },
    grid: powerGrid,
    xAxis: categoryAxis(times),
    yAxis: valueAxis(-15, 0, 5),
    tooltip: {
      ...tooltipBase,
      formatter: (params) => {
        const time = params[0]?.axisValue || "";
        const lines = params.map((p) => `${p.seriesName}：${Number(p.value).toFixed(2)} dBm`);
        return `${time}<br/>${lines.join("<br/>")}`;
      },
    },
    series: CHANNELS.map((c, i) => ({
      name: c.name,
      type: "line",
      data: channelValues(elapsed, cleanedAt, i),
      symbol: "none",
      lineStyle: { width: 2, color: c.color },
      itemStyle: { color: c.color },
      markLine: i === 3 ? {
        symbol: "none",
        silent: true,
        lineStyle: { color: "#e7434a", type: "dashed", width: 1.2 },
        label: {
          position: "insideEndTop",
          color: "#ef858a", fontSize: 11,
          distance: 2,
          offset: [-40, 0],
          formatter: "低功率阈值 −3.2",
        },
        data: [{ yAxis: -3.2 }],
        z: 5,
      } : undefined,
      z: 2,
    })),
  };
}

function errorOption(times, elapsed, cleanedAt) {
  return {
    animation: false,
    title: { text: "错误次数（次）", left: -4, top: 4, textStyle: { color: "#ddd", fontSize: 13, fontWeight: 500 } },
    grid: errorGrid,
    xAxis: categoryAxis(times),
    yAxis: valueAxis(0, 120, 40),
    tooltip: {
      ...tooltipBase,
      formatter: (params) => {
        const p = params[0];
        return `${p.axisValue}：错误计数 ${p.value} 次`;
      },
    },
    series: [{
      name: "错误次数",
      type: "bar",
      data: errorValues(elapsed, cleanedAt),
      barWidth: 11,
      itemStyle: { color: "#087bd8", borderRadius: [2, 2, 0, 0] },
    }],
  };
}

function useEChart(ref, option) {
  const chartRef = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof echarts === "undefined") return;
    // echarts SVG 渲染依赖真实浏览器布局（jsdom 回归环境无文本测量会抛错，降级跳过）
    try {
      if (!chartRef.current) chartRef.current = echarts.init(host, null, { renderer: "svg" });
      chartRef.current.setOption(option, true);
    } catch { /* jsdom：布局不可用 */ }
  }, [option]);
  useEffect(() => () => {
    try { chartRef.current?.dispose(); } catch { /* noop */ }
    chartRef.current = null;
  }, []);
  return chartRef;
}

// 双图（上功率 / 下错误计数）+ connect 悬浮联动
export default function TrendChart({ cleanedAt = null, recovery = false, monitorStartedAt, mode = "live", initialElapsed = 0, frozenTimes = null }) {
  const powerHostRef = useRef(null);
  const errorHostRef = useRef(null);
  const [tick, setTick] = useState(initialElapsed);

  // live 心跳：每秒取业务时钟（HCClock.seconds，演示时间流速）驱动 elapsed
  useEffect(() => {
    if (mode !== "live") return;
    setTick(window.HCClock?.seconds?.() ?? initialElapsed);
    const timer = setInterval(() => {
      setTick(window.HCClock?.seconds?.() ?? initialElapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  const rawElapsed = mode === "snapshot" ? initialElapsed : tick;
  // 原 update 语义：清污后 elapsed 封顶在 cleanedAt+4（监控冻结在恢复后 4 秒）
  const elapsed = cleanedAt !== null ? Math.min(rawElapsed, cleanedAt + 4) : rawElapsed;
  const times = frozenTimes || timeAxis(elapsed, recovery, monitorStartedAt);

  const powerOpt = useMemo(() => powerOption(times, elapsed, cleanedAt), [times, elapsed, cleanedAt]);
  const errorOpt = useMemo(() => errorOption(times, elapsed, cleanedAt), [times, elapsed, cleanedAt]);

  const powerChart = useEChart(powerHostRef, powerOpt);
  const errorChart = useEChart(errorHostRef, errorOpt);

  // 双图悬浮联动
  useEffect(() => {
    const p = powerChart.current, e = errorChart.current;
    if (!p || !e) return;
    try { echarts.connect([p, e]); } catch { /* jsdom */ }
  }, [powerOpt, errorOpt]);

  return (
    <div className="evt-chart-card" data-channel4-normal={String(cleanedAt !== null && elapsed >= cleanedAt)}>
      <h3 className="evt-chart-title">光链路通道功率与错误计数趋势</h3>
      <div className="evt-chart-stack">
        <div className="evt-chart-panel">
          <div ref={powerHostRef} style={{ width: "100%", aspectRatio: "420 / 238" }} />
        </div>
        <div className="evt-chart-panel">
          <div ref={errorHostRef} style={{ width: "100%", aspectRatio: "420 / 170" }} />
        </div>
      </div>
    </div>
  );
}
