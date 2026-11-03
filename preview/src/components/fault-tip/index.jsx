import { HC_ASSETS } from "../../mock/hc-assets.js";
import FlowBorder from "../flow-border/index.jsx";

export default function FaultTip({ state = "optical" }) {
  const auto = state === "auto";
  return (
    <div className={"hc-fault-tip " + (auto ? "auto" : "manual")}>
      {!auto && <img className="hc-icon" src={HC_ASSETS.icons["红色的故障"]} alt="" width={14} />}
      <span>{auto ? "正在分析链路指标与设备日志" : state === "qwen" ? "网卡驱动待升级" : "光链路待清污"}</span>
      {auto ? (
        <>
          <i className="hc-flow-halo"><i /></i>
          <i className="hc-flow-base" />
          <i className="hc-flow-ring" />
        </>
      ) : (
        <i className="hc-tip-arrow" />
      )}
    </div>
  );
}
