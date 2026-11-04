import { useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

const BUTTONS = ["首页", "策略中心", "新建对话", "历史任务"];

export default function Sidebar() {
  const [selected, setSelected] = useState("首页");
  return (
    <nav className="hc-sidebar" aria-label="侧边导航">
      <img className="hc-icon" src={HC_ASSETS.icons["侧边栏智慧体"]} alt="" width={56} />
      {BUTTONS.map((name) => (
        <button
          key={name}
          type="button"
          aria-label={name}
          className={selected === name ? "selected" : ""}
          onClick={() => setSelected(name)}
        >
          <img className="hc-icon" src={HC_ASSETS.icons[name]} alt="" width={48} />
        </button>
      ))}
    </nav>
  );
}
