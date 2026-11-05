import { useEffect, useRef } from "react";
import { useEvidence, EvidenceReport } from "../../components/evidence-context/index.jsx";

// 取证标签栏 + 面板（声明式渲染：tabs 在事件面板 toolbar 内——直接子元素满足
// .evt-detail-toolbar>.evt-evidence-tabs 选择器；panel 在 evt-right 尾部——直接子元素
// 满足 .evt-show-evidence> 级联显隐）。状态来自 EvidenceProvider（每面板一个 Context）。
// toolbar/right 的联动 class（evt-has-evidence-tabs / evt-show-evidence）由本组件 effect
// 在父容器上切换（React 拥有元素的 class 装饰，与 focus-dim 同模式；组件渲染占位时
// effect 依旧执行，覆盖清理场景）。

// 工具栏内的 tab 栏 —— 无条目时渲染隐藏占位（ref 常驻保证 class 联动的清理路径）
export function EvidenceTabsBar() {
  const evidence = useEvidence();
  const barRef = useRef(null);
  const list = evidence ? [...evidence.entries.entries()] : [];
  const hasEntries = list.length > 0;
  useEffect(() => {
    barRef.current?.closest(".evt-detail-toolbar")?.classList.toggle("evt-has-evidence-tabs", hasEntries);
  }, [hasEntries]);
  if (!evidence || !hasEntries) return <div ref={barRef} style={{ display: "none" }} />;
  return (
    <div className="evt-evidence-tabs" role="tablist" aria-label="诊断与依据" ref={barRef}>
      <button type="button" role="tab" aria-selected={String(!evidence.activeKey)} onClick={() => evidence.select(null)}>诊断详情</button>
      {list.map(([key, entry]) => (
        <span key={key} className="evt-evidence-tab-group">
          <button type="button" role="tab" aria-selected={String(key === evidence.activeKey)} onClick={() => evidence.select(key)}>{entry.label}</button>
          <button type="button" aria-label={"关闭" + entry.label} onClick={() => evidence.closeEntry(key)}>×</button>
        </span>
      ))}
    </div>
  );
}

// 右侧底部的依据面板 —— 报告内容 EvidenceReport 组件渲染（替代 innerHTML）
export function EvidencePanel() {
  const evidence = useEvidence();
  const panelRef = useRef(null);
  const active = evidence ? [...evidence.entries.entries()].find(([key]) => key === evidence.activeKey) : null;
  useEffect(() => {
    panelRef.current?.parentElement?.classList.toggle("evt-show-evidence", Boolean(evidence?.activeKey));
  }, [evidence?.activeKey, active]);
  const entry = active ? active[1] : null;
  return (
    <section
      className="evt-evidence-panel" role="tabpanel" ref={panelRef}
      aria-label={entry ? entry.label : undefined}
      hidden={!entry}
    >
      {entry && <EvidenceReport title={entry.label} stage={entry.stage} tool={entry.tool} text={entry.text} />}
    </section>
  );
}
