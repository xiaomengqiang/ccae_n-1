// service-panel.jsx —— 右栏服务视图
// 服务标题/徽章 + 基准指标（负载统计 + 绿算等级）+ 节点运行状态网格 + 节能优化趋势图
import { useMemo, useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { LEAF_MASK_URI, REPORT_ICONS, nodeCardModel, runtimeChartOption } from "./charts.jsx";
import EChart from "./echart-box.jsx";
import EnergyGradeTag from "../../components/energy-grade-tag/index.jsx";
import { setNodeRange } from "./session-store.js";

// 基准指标面板（内容只依赖服务数据，静态渲染）
function LoadStats({ s }) {
  const days = 5, saved = parseFloat(s.data.energySaved);
  const groups = [["轻载", .3, .8, "#37c18d"], ["中载", .3, .2, "#fcd72e"], ["重载", .4, 0, "#f4840c"]];
  const metrics = [
    ["百万Token能耗", (Number(s.data.energyUnit || 1.82) / 3.6).toFixed(2), "kWh/Mtoken"],
    ["总能耗", parseFloat(s.data.energyTotal), "kWh"],
    ["节省能耗", Number(saved.toFixed(1)), "kWh"],
    ["节能增益", parseFloat(s.data.energyGain), "%"],
    ["节能运行时长", String(days), "天"],
  ];
  return (
    <div className="hc-energy-reference-summary">
      <dl className="hc-energy-reference-metrics">
        {metrics.map(([label, value, unit], idx) => (
          <div key={label}>
            <dt>{label}{idx === 0 && <EnergyGradeTag data={s.data} />}</dt>
            <dd>{value}<small>{unit}</small></dd>
          </div>
        ))}
      </dl>
      <table className="hc-energy-sketch-loads" aria-label="负载时长和节省能耗分布">
        <thead>
          <tr>
            <th></th>
            {groups.map((g) => <th key={g[0]} scope="col"><i style={{ background: g[3] }}></i>{g[0]}</th>)}
            <th aria-label="分布"></th>
          </tr>
        </thead>
        <tbody>
          {[["时长", days, 1, "天"], ["节省", saved, 2, "kWh"]].map(([label, total, index, unit]) => (
            <tr key={label} aria-label={label}>
              <th scope="row">{label}</th>
              {groups.map((g) => <td key={g[0]}>{(total * g[index]).toFixed(2)}<small>{unit}</small></td>)}
              <td>
                <div
                  className="hc-energy-sketch-bar"
                  role="img"
                  aria-label={label + "分布：" + groups.map((g) => g[0] + Math.round(g[index] * 100) + "%").join("，")}
                >
                  {groups.filter((g) => g[index] > 0).map((g) => <i key={g[0]} style={{ width: g[index] * 100 + "%", background: g[3] }}></i>)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NodeCard({ s, i }) {
  // 轻载/中载节省图例 hover/聚焦 → 负载图突出对应时段（legacy 为 :has() CSS 联动，ECharts 下改为状态驱动）
  const [hoverKind, setHoverKind] = useState(null);
  const m = nodeCardModel(s, i, hoverKind);
  const showStatus = m.frequency.status !== "稳定运行";
  // 保持共享动画相位（periodic 卡片重建时对齐）
  const phaseDelay = -(performance.now() / 1000) + "s";
  return (
    <article
      className={"hc-energy-node-card" + (m.linked ? " hc-energy-node-linked" : "")}
      aria-label={m.ip + " " + m.type + "节点"}
      data-frequency-state={m.frequency.status === "调频中" ? "working" : m.frequency.at !== null ? "applied" : "stable"}
    >
      <div className="hc-energy-node-card-head">
        <span className={"hc-energy-node-type " + m.type.toLowerCase()}>{m.type}</span>
        <div className="hc-energy-node-identity">
          <div className="hc-energy-node-title-line">
            <h3>{m.ip}</h3>
            {showStatus && (
              <span className="hc-energy-frequency-status">
                {m.frequency.status}
                <i className="hc-flow-halo"><i style={{ animationDelay: phaseDelay }} /></i>
                <i className="hc-flow-base" />
                <i className="hc-flow-ring" style={{ animationDelay: phaseDelay }} />
              </span>
            )}
          </div>
          <span>{m.type === "P" ? "Prefill节点" : "Decode节点"}</span>
        </div>
        <div className="hc-energy-node-cumulative" title="策略生效以来累计节能（演示值按节点节能占比分配）">
          <span>累计节能</span>
          <strong>{m.cumulative.toFixed(2)}<small> kWh</small></strong>
        </div>
      </div>
      <dl className="hc-energy-node-metrics hc-energy-node-hierarchy">
        <div className="hc-energy-node-saving">
          <div className="hc-energy-node-copy">
            <dt style={{ "--metric-color": "#45c49f" }}>近{s.nodeRange || 4}小时节能</dt>
            <dd>{m.savingRaw.toFixed(2)}<small> kWh</small></dd>
          </div>
          <div className="hc-energy-split-wrap">
            <div className="hc-energy-load-split">
              {[["轻载", m.light, "light"], ["中载", m.medium, "medium"]].map(([label, value, kind]) => (
                <div
                  key={kind} className={kind} tabIndex={0} aria-label={label + "节省能耗 " + value.toFixed(2) + " kWh，突出对应时段"}
                  onMouseEnter={() => setHoverKind(kind)} onMouseLeave={() => setHoverKind(null)}
                  onFocus={() => setHoverKind(kind)} onBlur={() => setHoverKind(null)}
                >
                  <dt>{label}节省</dt>
                  <dd>{value.toFixed(2)}<small> kWh</small></dd>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hc-energy-node-load-chart">
          <div className="hc-energy-load-legend"><span>▥ 请求量（个/30分钟）</span><span>━ 节省能耗（kWh）</span></div>
          <EChart option={m.chart.option} label={m.chart.label} />
        </div>
      </dl>
    </article>
  );
}

export default function ServicePanel({ s }) {
  const count = Math.max(1, Math.ceil(Number(s.data.npu) / 8));
  // 趋势图内容只依赖 effectiveAt/base（图表内部对采样时间做了固定覆盖），memo 避免每秒重建
  const runtimeSpec = useMemo(() => runtimeChartOption(s), [s.name, s.effectiveAt]);
  return (
    <>
      <h2 className="hc-energy-title">
        {s.stage === 4 ? (
          <>
            {s.name}
            <span className="hc-energy-badge">
              <span className="hc-energy-clean-leaf" aria-hidden="true" style={{ "--leaf-image": LEAF_MASK_URI }} />
              节能中
            </span>
            <span className="hc-energy-badge">运行态均衡模式已开启</span>
          </>
        ) : (
          <>
            {s.name}
            <span className="hc-energy-badge">· 运行态均衡模式已开启</span>
          </>
        )}
      </h2>

      <section className="hc-energy-panel hc-energy-metric-panel hc-energy-comparison-panel">
        <div className="hc-energy-service-loads"><LoadStats s={s} /></div>
      </section>

      <section className="hc-energy-panel hc-energy-topology-panel">
        <div className="hc-energy-topology-head">
          <strong>节点运行状态</strong>
          <span className="hc-energy-pill">服务器 {Math.ceil(Number(s.data.npu) / 8)}</span>
          <span className="hc-energy-pill">NPU {s.data.npu}</span>
          <span className="hc-energy-pill">CPU {Math.ceil(Number(s.data.npu) / 8) * 2}</span>
          <select className="hc-energy-range" aria-label="节点时间范围" value={s.nodeRange || "4"} onChange={(e) => setNodeRange(e.target.value)}>
            <option value="12">近12小时</option>
            <option value="8">近8小时</option>
            <option value="4">近4小时</option>
          </select>
        </div>
        <div className="hc-energy-node-grid" data-node-count={count} aria-label="P/D 节点指标卡片">
          {Array.from({ length: count }, (_, i) => <NodeCard key={i} s={s} i={i} />)}
        </div>
        <section className="hc-energy-trend">
          <h3 className="hc-energy-chart-title">
            节能优化效果
            <span className="hc-energy-legend">
              <span style={{ color: "#6199ff" }}>当前平均请求量(个/s)</span>
              <span style={{ color: "#5c9edc" }}>预测平均请求量(个/s)</span>
              <span style={{ color: "#bcbcbc" }}>实际功耗(kW)</span>
              <span style={{ color: "#888" }}>基线预测功耗(kW)</span>
              <span style={{ color: "#22b784" }}>策略后预测功耗(kW)</span>
            </span>
          </h3>
          <div className="hc-energy-chart" data-energy-runtime="true" data-runtime-now="0">
            <EChart option={runtimeSpec.option} label={runtimeSpec.label} />
          </div>
        </section>
      </section>
    </>
  );
}
