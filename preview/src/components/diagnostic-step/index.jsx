import { useEffect, useRef } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../evt-badge/index.jsx";

// 诊断步骤卡（原 HCEventUI DiagnosticStep 工厂的 React 版）
// 展开状态由父级持有（expanded/onToggle）；取证引擎 HCEvidence.attach 保持命令式——
// 在 effect 中注入 body（幂等：先移除既有块再附加），React 子内容在其后不受影响。
// evidence=false 时跳过自动取证（nic-event 的资源诊断/故障恢复步骤用自定义注入）。
export default function DiagnosticStep({
  title, time, badge, tone = "done", badgeTone,
  expanded = true, onToggle, onSelect,
  statusIcon, dim, section,
  evidence = true, bodyRef, children,
}) {
  const localBodyRef = useRef(null);
  const processing = tone === "processing" || tone === "manual";

  useEffect(() => {
    const body = (bodyRef || localBodyRef).current;
    if (!body || !evidence) return;
    body.querySelector(".evt-diagnostic-operations")?.remove();
    window.HCEvidence?.attach(body, title, badge !== "待处理" && tone !== "processing");
  }, [evidence, title, badge, tone]);

  return (
    <section className={"evt-step" + (dim ? " evt-focus-dim" : "")} data-section={section}>
      <div className="evt-step-header">
        <button type="button" className="evt-step-select" aria-label={"查看" + title + "环节"} onClick={onSelect}>
          {processing ? (
            <i className="story-step-icon working" aria-label="进行中" />
          ) : (
            <img
              className="evt-icon"
              src={OPTICAL_ASSETS.icons[statusIcon || "对勾"]}
              alt=""
              width={16}
              height={16}
              aria-label="已完成"
            />
          )}
          <strong>{title}</strong>
          {time && <time>{time}</time>}
        </button>
        {badge && <EvtBadge text={badge} tone={badgeTone ?? tone} />}
        <button
          type="button"
          className="evt-collapse"
          aria-label={(expanded ? "收起" : "展开") + title}
          aria-expanded={String(expanded)}
          onClick={() => onToggle?.(!expanded)}
        >
          <i className="evt-chevron" />
        </button>
      </div>
      <div className="evt-step-body" ref={bodyRef || localBodyRef} hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}
