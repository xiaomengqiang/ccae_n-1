import { HC_ASSETS } from "../../mock/hc-assets.js";
import WorkloadIcon from "../workload-icon/index.jsx";

const DOMAIN_LABELS = { training: "训练作业", inference: "推理服务", resource: "资源" };
const TYPE_LABELS = { fault: "故障", risk: "隐患", energy: "节能机会" };

// className/children 为可选扩展 props（nic-event 头部图标追加 evt-icon 类与 fault-status-flags）
export default function EventTypeIcon({ domain = "resource", name = "Qwen", type = "fault", closed = false, size = 24, className = "", children }) {
  const base = "hc-event-type-icon" + (type === "fault" ? " hc-unified-fault" : "") + (className ? " " + className : "");
  if (type === "fault") {
    return (
      <i className={base} style={{ "--event-icon-size": size + "px" }}
        data-type="fault" data-closed={String(closed)} role="img"
        aria-label={"故障" + (closed ? "，已闭环" : "")}>
        <img className="hc-icon" src={HC_ASSETS.icons[closed ? "灰色的故障" : "红色的故障"]} alt="" width={size} />
        {children}
      </i>
    );
  }
  const actualDomain = type === "energy" ? "inference" : domain;
  return (
    <i className={base} style={{ "--event-icon-size": size + "px" }}
      data-domain={actualDomain} data-type={type} data-closed={String(closed)} role="img"
      aria-label={(DOMAIN_LABELS[actualDomain] || actualDomain) + (TYPE_LABELS[type] || type) + (closed ? "，已闭环" : "")}>
      {actualDomain === "inference" ? (
        <span className="hc-event-model"><WorkloadIcon name={name} /></span>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="hc-event-object">
          {actualDomain === "training" ? (
            <>
              <path d="M8 3h9a2 2 0 0 1 2 2v13M5 6h9a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
              <path d="M7 10h5M7 14h5M7 17h3" />
            </>
          ) : (
            <>
              <rect x="3" y="4" width="17" height="7" rx="2.4" />
              <rect x="3" y="14" width="17" height="7" rx="2.4" />
              <path d="M7 7.5h.1M7 17.5h.1M12 7.5h4M12 17.5h4" />
            </>
          )}
        </svg>
      )}
      <img className="hc-icon hc-event-type-mark" src={HC_ASSETS.icons[type === "energy" ? "绿色叶子" : type === "risk" ? "橙色隐患" : "红色的故障"]} alt="" width={12} />
      {children}
    </i>
  );
}
