import { HC_ASSETS } from "../../mock/hc-assets.js";

export default function Sidebar() {
  return (
    <nav className="hc-sidebar" aria-label="侧边导航">
      <img className="hc-icon" src={HC_ASSETS.icons["侧边栏智慧体"]} alt="" width={56} />
      {["首页", "策略中心", "新建对话", "历史任务"].map((name, i) => (
        <button key={name} type="button" aria-label={name} className={i === 0 ? "selected" : ""}>
          <img className="hc-icon" src={HC_ASSETS.icons[name]} alt="" width={48} />
        </button>
      ))}
    </nav>
  );
}
