// report-panel.jsx —— 节能月报视图（右栏 report 页签）与独立 HTML 导出
// 同一数据源（days/reportData）驱动图表、汇总与下载，避免单位和总量不一致
import { useMemo } from "react";
import { createRoot, flushSync } from "react-dom";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { REPORT_ICONS, dailyEnergyChartOption, reportChartOption } from "./charts.jsx";
import EChart from "./echart-box.jsx";

const days = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  total: Math.round(1280 + Math.sin(i * .77) * 240 + (i % 4) * 75),
  saved: Math.round(170 + Math.sin(i * .63) * 45 + (i % 3) * 13),
  requests: +(24 + Math.sin(i * .56) * 5).toFixed(1),
  slo: +(99.85 + Math.sin(i * .7) * .09).toFixed(2),
  npu: Math.round(58 + Math.sin(i * .72) * 15),
  cpu: Math.round(65 + Math.sin(i * .51) * 18),
}));

function reportData() {
  const allocate = (weights, total) => {
    const sum = weights.reduce((a, b) => a + b, 0), raw = weights.map((v) => v / sum * total), values = raw.map(Math.floor);
    let remaining = total - values.reduce((a, b) => a + b, 0);
    raw.map((v, i) => ({ i, f: v - values[i] })).sort((a, b) => b.f - a.f).slice(0, remaining).forEach((p) => values[p.i]++);
    return values;
  };
  const total = allocate(days.map((d) => d.total), 34224);
  const saved = allocate(total.map((v) => 1 / v ** 2), 2379);
  return days.map((d, i) => ({ ...d, total: total[i], saved: saved[i], slo: Number((99.92 + .015 * Math.sin(i * .63) + .005 * Math.cos(i * 1.1)).toFixed(2)) }));
}

// 月报图例：色值进 --legend-color，文字统一 #bdbdbd（legacy 渲染后二次处理的结果形态）
function ReportLegend({ legend }) {
  return (
    <span className="hc-energy-legend">
      {legend.map(([color, name]) => (
        <span key={name} style={{ "--legend-color": color, color: "#bdbdbd" }}>{name}</span>
      ))}
    </span>
  );
}

export default function ReportPanel({ s, embedded = false }) {
  const data = useMemo(() => reportData(), [s.name]);
  const total = data.reduce((a, d) => a + d.total, 0), saved = data.reduce((a, d) => a + d.saved, 0);
  const dailySpec = useMemo(() => dailyEnergyChartOption(data), [data]);
  const requestsSpec = useMemo(() => reportChartOption(data, "requests"), [data]);
  const utilizationSpec = useMemo(() => reportChartOption(data, "utilization"), [data]);

  const metricSymbols = ["ϟ", "ϟ", "leaf", "trend", "money"];
  const metricChanges = ["↓ 3.8%", "↓ 3.8%", "↑ 18.6%", "↑ 6.1%", "↑ ¥" + Math.round(saved * 1.2 - saved / 1.186 * 1.2).toLocaleString()];
  const metricDefs = [
    ["百万Token能耗", (Number(s.data.energyUnit || 1.82) / 3.6).toFixed(2), "kWh/Mtoken"],
    ["当月总能耗", total.toLocaleString(), "kWh"],
    ["当月节省能耗", saved.toLocaleString(), "kWh"],
    ["当月节能增益", (saved / (total + saved) * 100).toFixed(1), "%"],
    ["当月经济收益", (2854).toLocaleString("zh-CN", { maximumFractionDigits: 0 }), "元"],
  ];

  return (
    <>
      <div className="hc-energy-report-heading">
        <h1 className="hc-energy-report-title">{s.name}  2026年8月节能月报</h1>
        {!embedded && (
          <button type="button" className="hc-energy-download" onClick={() => downloadReport(s)}>
            <img src={HC_ASSETS.icons["下载"]} alt="" />下载
          </button>
        )}
      </div>

      <div className="hc-energy-report-scope">
        守护范围
        <span className="hc-energy-pill">服务器 {Math.ceil(Number(s.data.npu) / 8)}</span>
        <span className="hc-energy-pill">NPU {s.data.npu} 卡</span>
        <span className="hc-energy-pill">CPU {Math.ceil(Number(s.data.npu) / 8) * 2} 卡</span>
      </div>

      <dl className="hc-energy-report-metrics">
        {metricDefs.map(([k, v, u], idx) => {
          const type = metricSymbols[idx];
          const trendValue = metricChanges[idx];
          const down = trendValue[0] === "↓";
          return (
            <div key={k}>
              <dt>
                <span className="hc-energy-metric-symbol">
                  {type === "money"
                    ? <img src={HC_ASSETS.icons["钱"]} alt="" />
                    : <img src={REPORT_ICONS[type === "leaf" ? "energy-leaf" : type === "trend" ? "energy-gain" : "energy-total"]} alt="" />}
                </span>
                {k}
              </dt>
              <dd>{v}<small> {u}</small></dd>
              <p>
                <span>较上月同期</span>
                <em>
                  <img
                    className="hc-energy-change-arrow"
                    src={REPORT_ICONS["good-arrow"]}
                    alt={down ? "下降，改善" : "上升，改善"}
                    style={down ? { transform: "rotate(180deg)" } : undefined}
                  />
                  <span>{trendValue.slice(1).trim()}</span>
                </em>
              </p>
            </div>
          );
        })}
      </dl>

      <section className="hc-energy-panel hc-energy-daily">
        <h3 className="hc-energy-chart-title">每日能耗与节能趋势<ReportLegend legend={[["#689aff", "总能耗"], ["#3ac8a5", "节省能耗"]]} /></h3>
        <div className="hc-energy-chart" data-report-chart="energy">
          <EChart option={dailySpec.option} label={dailySpec.label} width={embedded ? dailySpec.width : undefined} height={embedded ? dailySpec.height : undefined} linkGroup={embedded ? undefined : "report"} interactive={!embedded} />
        </div>
      </section>

      <div className="hc-energy-report-bottom">
        <section className="hc-energy-panel">
          <h3 className="hc-energy-chart-title">推理请求量+SLA达标率<ReportLegend legend={[["#3889ff", "推理请求量"], ["#79b53b", "SLA达标率"]]} /></h3>
          <div className="hc-energy-chart" data-report-chart="requests">
            <EChart option={requestsSpec.option} label={requestsSpec.label} width={embedded ? requestsSpec.width : undefined} height={embedded ? requestsSpec.height : undefined} linkGroup={embedded ? undefined : "report"} interactive={!embedded} />
          </div>
        </section>
        <section className="hc-energy-panel">
          <h3 className="hc-energy-chart-title">NPU及CPU利用率<ReportLegend legend={[["#3889ff", "NPU"], ["#21b7bd", "CPU"]]} /></h3>
          <div className="hc-energy-chart" data-report-chart="utilization">
            <EChart option={utilizationSpec.option} label={utilizationSpec.label} width={embedded ? utilizationSpec.width : undefined} height={embedded ? utilizationSpec.height : undefined} linkGroup={embedded ? undefined : "report"} interactive={!embedded} />
          </div>
        </section>
      </div>
    </>
  );
}

// 导出独立 HTML：flushSync 同步渲染 embedded 版月报（无下载按钮/tooltip/页签），再内联样式序列化
export function downloadReport(s) {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => { root.render(<main className="hc-energy-right"><ReportPanel s={s} embedded /></main>); });
  const escape = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const style = Array.from(document.querySelectorAll("style")).map((n) => n.textContent).filter((t) => t.includes("#hc-energy-root")).join("\n");
  const html = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>' + escape(s.name) + ' 2026年8月节能月报</title><style>' + style + '\nhtml,body{height:auto;overflow:auto;background:#050505;color:#eee;font-family:Arial,"Microsoft YaHei",sans-serif}#hc-energy-root{position:static;display:block;width:auto;height:auto;max-width:1440px;margin:auto}#hc-energy-root .hc-energy-right{overflow:visible;padding:32px}svg{width:100%}@media print{body{print-color-adjust:exact}#hc-energy-root .hc-energy-panel{break-inside:avoid}}</style><body><section id="hc-energy-root">' + container.innerHTML + "</section></body></html>";
  // 卸载以释放 ECharts 实例（layout effect cleanup → chart.dispose）
  root.unmount();
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })), a = document.createElement("a");
  a.href = url;
  a.download = s.name.replace(/[\\/:*?"<>|]/g, "-") + "-2026年8月节能月报.html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
