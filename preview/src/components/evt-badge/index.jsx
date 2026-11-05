// 事件徽标（原 HCEventUI Badge 工厂的 React 版）
// children 渲染在文字前（如待人工处理的红色小手图标）
export default function EvtBadge({ text, tone = "done", children }) {
  return (
    <span className={"evt-badge evt-badge-" + (text === "已闭环" ? "closed" : tone)}>
      {children}
      {text}
    </span>
  );
}
