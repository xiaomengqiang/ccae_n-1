import { useEffect, useRef } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../evt-badge/index.jsx";

// 诊断步骤卡（原 HCEventUI/HCOpticalEventUI DiagnosticStep 工厂的 React 版）
// 展开状态由父级持有（expanded/onToggle）；取证引擎保持命令式——effect 注入 body
// （幂等：先移除既有块再附加）。evidence prop 三态：
// - undefined（默认）：HCEvidence 规则引擎自动匹配
// - null：跳过取证注入（父级用 bodyRef 做自定义后处理的步骤）
// - 数组：HCOpticalEvidence 显式条目注入（optical-event 用法）
// statusIcon 支持待人工手型图标替换；dim 为选中联动淡化；last 补 evt-step-last 类。
// onBodyClick 为可选扩展 prop（optical-event：点击恢复行联动选中时间轴节点）。
export default function DiagnosticStep({
  title, time, badge, tone = "done", badgeTone,
  expanded = true, onToggle, onSelect,
  statusIcon, dim, section, last,
  evidence, bodyRef, onBodyClick, children,
}) {
  const localBodyRef = useRef(null);
  const processing = tone === "processing" || tone === "manual";

  useEffect(() => {
    const body = (bodyRef || localBodyRef).current;
    if (!body) return;
    body.querySelector(".evt-diagnostic-operations")?.remove();
    if (evidence === null) return;
    if (evidence === undefined) {
      window.HCEvidence?.attach(body, title, badge !== "待处理" && tone !== "processing");
    } else {
      window.HCOpticalEvidence?.attach(body, title, badge !== "待处理" && tone !== "processing", false, evidence);
    }
  }, [title, badge, tone, evidence]);

  return (
    <section className={"evt-step" + (dim ? " evt-focus-dim" : "") + (last ? " evt-step-last" : "")} data-section={section}>
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
      <div className="evt-step-body" ref={bodyRef || localBodyRef} hidden={!expanded} onClick={onBodyClick}>
        {children}
      </div>
    </section>
  );
}
