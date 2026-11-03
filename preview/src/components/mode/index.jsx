import { HC_ASSETS } from "../../mock/hc-assets.js";

export default function Mode({ value = "smart", onChange }) {
  return (
    <div className="hc-mode">
      <img
        className="hc-icon"
        src={HC_ASSETS.icons[value]}
        alt=""
        width={value === "smart" ? 111 : 99}
        height={value === "smart" ? 36 : 24}
        style={value === "smart" ? { left: "-6px", top: "-6px" } : { left: "0", top: "0" }}
      />
      <select aria-label="运行模式" value={value} onChange={(e) => onChange?.(e.target.value)}>
        <option value="smart">智能模式</option>
        <option value="normal">普通模式</option>
      </select>
    </div>
  );
}
