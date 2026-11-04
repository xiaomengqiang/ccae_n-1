import { useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

export default function Mode({ value = "smart", onChange }) {
  const [current, setCurrent] = useState(value);
  const smart = current === "smart";
  return (
    <div className="hc-mode">
      <img
        className="hc-icon"
        src={HC_ASSETS.icons[current]}
        alt=""
        width={smart ? 111 : 99}
        height={smart ? 36 : 24}
        style={smart ? { left: "-6px", top: "-6px" } : { left: "0", top: "0" }}
      />
      <select
        aria-label="运行模式"
        value={current}
        onChange={(e) => {
          setCurrent(e.target.value);
          onChange?.(e.target.value);
        }}
      >
        <option value="smart">智能模式</option>
        <option value="normal">普通模式</option>
      </select>
    </div>
  );
}
