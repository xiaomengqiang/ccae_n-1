import { useEffect, useRef } from "react";
import TrendChart from "./trend-chart.jsx";
import ExperienceSummary from "./experience-summary.jsx";

// 趋势图挂载（ECharts 版）—— live：组件内部 1s 心跳驱动（原 monitorTimer 语义）；
// snapshot：渲染一次冻结 + 时间轴改写（原 TrendSnapshotMount 后处理）。

export function TrendChartMount({ cleanedAt = null, recovery = false, monitorStartedAt, initialElapsed = 0 }) {
  return <TrendChart cleanedAt={cleanedAt} recovery={recovery} monitorStartedAt={monitorStartedAt} mode="live" initialElapsed={initialElapsed} />;
}

// 静态历史快照（analysis 阶段）—— 每列 15 分钟间隔的历史时刻
export function TrendSnapshotMount() {
  const historyEnd = 12 * 3600 + 28;
  const historyTimes = Array.from({ length: 8 }, (_, i) => {
    const t = Math.round(historyEnd - (7 - i) * 15 * 60);
    return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map((v) => String(v).padStart(2, "0")).join(":");
  });
  return (
    <TrendChart
      mode="snapshot"
      initialElapsed={28}
      cleanedAt={null}
      recovery={false}
      monitorStartedAt={0}
      frozenTimes={historyTimes}
    />
  );
}

// ExperienceSummary —— 经验沉淀卡（React 组件，见 experience-summary.jsx）
// state 为外部可变引用（反馈状态写回）；stream + delayStart 触发打字流式动画；
// onReplace 在重新生成时通知外部（React 版通过 key 重挂载实现，无需换卡引用）。
export function ExperienceMount({ state, onReplace, delayStart = 0, stream = false }) {
  return <ExperienceSummary state={state} onReplace={onReplace} delayStart={delayStart} stream={stream} />;
}
