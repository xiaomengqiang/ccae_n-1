import { useEffect, useRef, useState } from "react";

// 诊断依据块（原 HCOpticalEvidence.attach 注入的 details/summary/list 的 React 版）
// operations: [{verb,label,tool,kind,text?}] —— 单条时渲染 evt-operation-single 变体；
// 展开状态记入全局记忆（与引擎的 operationExpansion 语义一致：跨重渲染保持）；
// onOpen(label, tool, text) 由调用方接到取证面板（optical：HCOpticalEvidence.show）。

const expansionMemory = new Map();

const GLYPHS = {
  search: <svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5.5" /><path d="m12 12 5 5" /></svg>,
  run: <svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="14" rx="2" /><path d="m5 7 3 3-3 3m5 0h5" /></svg>,
  file: <svg viewBox="0 0 20 20"><path d="M5 2h7l4 4v12H5zM12 2v5h4M8 10h5m-5 3h5" /></svg>,
};

function Glyph({ kind }) {
  return <span className="evt-operation-icon" aria-hidden="true">{GLYPHS[kind] ?? GLYPHS.file}</span>;
}

export default function EvidenceOperations({ title, operations, onOpen, defaultOpen = false, captionOverride }) {
  const detailsRef = useRef(null);
  const key = title + "|" + operations.map((x) => x.label).join("|");
  const [open, setOpen] = useState(() => expansionMemory.get(key) ?? defaultOpen);

  useEffect(() => {
    expansionMemory.set(key, open);
  }, [key, open]);

  const verbs = [...new Set(operations.map((x) => x.verb))];
  const caption = captionOverride ?? (operations.length === 1
    ? "已" + operations[0].verb + operations[0].label
    : /故障分析/.test(title) ? "已分析日志并核对故障依据"
    : "已" + verbs.join("、") + "相关依据");
  const single = operations.length === 1;

  const list = (
    <ul className="evt-operation-list">
      {operations.map((op) => (
        <li key={op.label}>
          <Glyph kind={op.kind} />
          {"已" + op.verb + " "}
          <a
            href="#" className="evt-evidence-link"
            title={"来源：" + op.tool + "（演示能力） · 在诊断详情旁查看"}
            aria-label={op.label + "，在诊断详情旁打开"}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen?.(op.label, op.tool, op.text); }}
          >{op.label}</a>
        </li>
      ))}
    </ul>
  );

  if (single) {
    return <div className="evt-diagnostic-operations evt-operation-single">{list}</div>;
  }
  return (
    <details
      className="evt-diagnostic-operations"
      ref={detailsRef}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <Glyph kind="search" />
        <span>{caption}</span>
        <span className="evt-operation-arrow" aria-hidden="true" />
      </summary>
      {list}
    </details>
  );
}
