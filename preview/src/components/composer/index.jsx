import { useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

// 问答输入框 —— 底部对话输入区（输入 + 发送按钮）
// 可选扩展 props（向后兼容）：
// - onChange 受控追踪草稿（nic-event 用）
// - overlay：渲染在 form 内末尾的覆盖层（optical 的引用 chip / 快捷查询条用，
//   absolute 定位锚定在 form 上下文）
// - formClassName：追加到 form 的类（如 has-reference 联动布局）
// - placeholder：覆盖默认占位文案（引用上下文时切换）
export default function Composer({ value = "", onSend, onChange, overlay, formClassName = "", placeholder = '输入问题或输入"/"触发提示词' }) {
  const [text, setText] = useState(value);
  const canSend = text.trim().length > 0;

  return (
    <form
      className={"hc-composer" + (formClassName ? " " + formClassName : "")}
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend?.(text);
        setText("");
        onChange?.("");
      }}
    >
      <input
        placeholder={placeholder}
        aria-label="输入问题"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      <button type="submit" aria-label="发送" disabled={!canSend}>
        <img
          className="hc-icon"
          src={HC_ASSETS.icons[canSend ? "发送-正常态" : "发送-禁用态"]}
          alt=""
          width={32}
        />
      </button>
      {overlay}
    </form>
  );
}
