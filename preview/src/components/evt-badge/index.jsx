// 事件徽标（原 HCEventUI Badge 工厂的 React 版）
export default function EvtBadge({ text, tone = "done" }) {
  return <span className={"evt-badge evt-badge-" + (text === "已闭环" ? "closed" : tone)}>{text}</span>;
}
