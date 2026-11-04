import { HC_ASSETS } from "../../mock/hc-assets.js";
import FlowBorder from "../flow-border/index.jsx";

// 可选扩展 props（向后兼容）：
// - text 覆盖默认文案，并设置 title/aria-label（工作负载卡片处理中提示的用法）
// - hideArrow 去掉手动态箭头；className 追加样式类（如 hc-workload-progress）
export default function FaultTip({ state = "optical", text, hideArrow = false, className = "" }) {
  const auto = state === "auto";
  const message = text ?? (auto ? "正在分析链路指标与设备日志" : state === "qwen" ? "网卡驱动待升级" : "光链路待清污");
  return (
    <div
      className={"hc-fault-tip " + (auto ? "auto" : "manual") + (className ? " " + className : "")}
      title={text ?? undefined}
      aria-label={text ?? undefined}
    >
      {!auto && <img className="hc-icon" src={HC_ASSETS.icons["红色的故障"]} alt="" width={14} />}
      <span>{message}</span>
      {auto ? (
        <>
          <i className="hc-flow-halo"><i /></i>
          <i className="hc-flow-base" />
          <i className="hc-flow-ring" />
        </>
      ) : (
        !hideArrow && <i className="hc-tip-arrow" />
      )}
    </div>
  );
}
