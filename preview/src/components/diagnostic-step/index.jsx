import { useEffect, useRef } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../evt-badge/index.jsx";
import EvidenceOperations from "../evidence-operations/index.jsx";
import { useEvidence } from "../evidence-context/index.jsx";

// 诊断步骤卡（原 HCEventUI/HCOpticalEventUI DiagnosticStep 工厂的 React 版）
// 展开状态由父级持有（expanded/onToggle）。evidence prop 三态：
// - undefined（默认）：HCEvidence 规则引擎自动匹配（命令式注入，effect 幂等附加）
// - null：跳过取证注入（父级用 bodyRef 做自定义后处理的步骤）
// - 数组：EvidenceOperations 声明式渲染（原 HCOpticalEvidence.attach 显式条目的 React 版，
//   渲染在 body 首位；链接点击 → onOpen → HCOpticalEvidence.show 打开取证面板）
// statusIcon 支持待人工手型图标替换；dim 为选中联动淡化；last 补 evt-step-last 类。
export default function DiagnosticStep({
  title, time, badge, tone = "done", badgeTone,
  expanded = true, onToggle, onSelect,
  statusIcon, dim, section, last,
  evidence, bodyRef, children,
}) {
  const localBodyRef = useRef(null);
  const processing = tone === "processing" || tone === "manual";

  useEffect(() => {
    if (evidence !== undefined) return;
    const body = (bodyRef || localBodyRef).current;
    if (!body) return;
    body.querySelector(".evt-diagnostic-operations")?.remove();
    window.HCEvidence?.attach(body, title, badge !== "待处理" && tone !== "processing");
  }, [title, badge, tone, evidence]);

  // 取证链接点击 → 面板打开（EvidenceProvider Context；无显式 text 时用宿主内恢复行文本补齐）
  const evidenceCtx = useEvidence();
  const openEvidence = (label, tool, text) => {
    const body = (bodyRef || localBodyRef).current;
    const fallback = body ? [...body.querySelectorAll(".evt-recovery-row,.nic-upgrade-results>li")].map((n) => n.textContent).join("\n") : "";
    evidenceCtx?.show(label, title, tool, text ?? fallback);
  };

  const evidenceView = evidence && typeof evidence === "object" && !Array.isArray(evidence)
    ? { operations: evidence.entries, defaultOpen: evidence.defaultOpen, captionOverride: evidence.captionOverride }
    : Array.isArray(evidence) ? { operations: evidence } : null;

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
      <div className="evt-step-body" ref={bodyRef || localBodyRef} hidden={!expanded}>
        {evidenceView && evidenceView.operations?.length > 0 && (
          <EvidenceOperations
            title={title}
            operations={evidenceView.operations}
            defaultOpen={evidenceView.defaultOpen}
            captionOverride={evidenceView.captionOverride}
            onOpen={openEvidence}
          />
        )}
        {children}
      </div>
    </section>
  );
}
