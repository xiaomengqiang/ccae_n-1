import { HC_ASSETS } from "../../mock/hc-assets.js";
import Status from "../status/index.jsx";
import WorkloadIcon from "../workload-icon/index.jsx";
import EnergyGradeTag from "../energy-grade-tag/index.jsx";

const FIELDS = (data) => [
  ["百万Token能耗", (Number(data.energyUnit || 1.82) / 3.6).toFixed(2) + " kWh/Mtoken"],
  ["总能耗", data.energyTotal],
  ["节省能耗", data.energySaved],
  ["节能增益", data.energyGain],
  ["卡数", data.npu + " 卡"],
  ["TTFT", data.ttft],
  ["TPOT", data.tpot],
];

// 节能服务卡片（原 workload-browser.energyServiceCard 的 React 版）
// 交互（onclick/onkeydown）由 workload-browser 桥接层原生绑定 —— 卡片节点会被移入
// 命令式卡片缓存列表，React 合成事件依赖容器委托，移出容器后失效。
export default function EnergyServiceCard({ status, data }) {
  return (
    <article
      className="hc-workload hc-energy-card"
      aria-label={data.name + " 节能服务卡片"}
      role="button"
      tabIndex={0}
      style={{ left: "0", top: "20px" }}
    >
      <header>
        <WorkloadIcon name={data.name} />
        <strong>{data.name}</strong>
        <Status status={status} />
        <span className="hc-status normal">
          <img className="energy-label-leaf" src={HC_ASSETS.icons["绿色叶子"]} alt="" />
          节能中
        </span>
        <time>{data.start}</time>
      </header>
      <dl>
        {FIELDS(data).map(([name, value]) => (
          <div key={name} className={name === "百万Token能耗" ? "energy-primary" : undefined}>
            <dt>
              {name}
              {name === "百万Token能耗" && <EnergyGradeTag data={data} />}
            </dt>
            <dd>
              {name === "百万Token能耗" ? (
                <>{(Number(data.energyUnit || 1.82) / 3.6).toFixed(2)} <small>kWh/Mtoken</small></>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <svg className="energy-spark" viewBox="0 0 70 30" role="img" aria-label="百万Token能耗趋势">
        <path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20V29H1Z" fill="#3ac58d" opacity=".2" />
        <path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20" fill="none" stroke="#3ac58d" strokeWidth="2" />
      </svg>
    </article>
  );
}
