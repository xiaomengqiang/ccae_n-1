import { useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

// 问答输入框 —— 底部对话输入区（输入 + 发送按钮）
// onChange 为可选扩展 prop（nic-event 受控追踪草稿用）
export default function Composer({ value = "", onSend, onChange }) {
  const [text, setText] = useState(value);
  const canSend = text.trim().length > 0;

  return (
    <form
      className="hc-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend?.(text);
        setText("");
        onChange?.("");
      }}
    >
      <input
        placeholder={'输入问题或输入"/"触发提示词'}
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
    </form>
  );
}
