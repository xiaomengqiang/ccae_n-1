import { HC_ASSETS } from "../../mock/hc-assets.js";

// 指标瓦片 —— 单个指标卡片（图标 + 名称 + 数值 + 单位）
export default function MetricTile({ name, value, iconName, unit = "", selected = false, onSelect, index = 0 }) {
  const actualIcon = iconName === "节能中" ? "叶子-圆底托" : iconName;
  return (
    <button
      type="button"
      className={"hc-metric" + (selected ? " selected" : "")}
      aria-pressed={String(selected)}
      onClick={onSelect}
      data-metric-id={index}
      style={{ "--metric-delay": (50 + Math.min(index, 7) * 30) + "ms" }}
    >
      <img className="hc-icon" src={HC_ASSETS.icons[actualIcon]} alt="" width={24} />
      <span className="hc-metric-content">
        <span>{name}</span>
        <b>{value}{unit && <small>{unit}</small>}</b>
      </span>
    </button>
  );
}
