// 健康态计算 —— 指标带紧凑态健康信息（纯计算，不直接改 DOM）
// 指标值仍由 useHealthMetrics 命令式更新（<b> 文本），此处从 DOM 读取数值计算健康态；
// 结果通过 hc-compact-refresh 事件通知 MetricRibbon（React 拥有紧凑态按钮子树，
// 避免 React re-render 与命令式 appendChild 争夺同一 DOM 节点）。
//
// 调用方：story-renderer（阶段变化后刷新）、home-screen InitEffects（挂载时刷新）

export function computeGroupHealth(group) {
  const key = group.dataset.category;
  const values = [...group.querySelectorAll(".hc-metric-row .hc-metric-content>b")].map((b) => Number(b.firstChild.textContent));
  const count = key === "resource" ? values[0] + values[1] : values.slice(1, 4).reduce((a, b) => a + b, 0);
  const known = Number.isFinite(count), bad = known && count > 0;
  return {
    category: key,
    health: known ? (bad ? "abnormal" : "normal") : "unknown",
    severity: !bad ? "normal" : key === "resource" ? (values[0] > 0 ? "interrupted" : "stuck") : values[1] > 0 ? "interrupted" : values[2] > 0 ? "stuck" : "degraded",
    known,
    bad,
    count,
    glyphActive: (i) => (key === "resource" ? i < 2 && values[i] > 0 : values[i + 1] > 0),
    ringText: known ? (bad ? String(count) : "正常") : "—",
    labelText: known ? (bad ? "项异常" : "") : "待检测",
    totalText: key === "resource" ? "NPU 1024 卡" : "总数 " + (Number.isFinite(values[0]) ? values[0] : "—") + " 个",
  };
}

window.updateCompactStatusIcons = () => {
  document.dispatchEvent(new CustomEvent("hc-compact-refresh"));
};

export function initCompactStatus() {
  window.updateCompactStatusIcons();
}
