import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../evt-badge/index.jsx";

// 故障因果链（原 HCEventUI CauseChain 工厂的 React 版）
// items: [{ title, description, icon, root, badge, badgeTone }]
// badge/badgeTone 为调用方追加的徽标（nic-event：直接原因/业务影响）
export default function CauseChain({ title = "故障因果链", items }) {
  return (
    <div className="evt-card evt-cause">
      <h3>{title}</h3>
      <ol className="evt-cause-list">
        {items.map((item, i) => (
          <li key={i} className={item.root ? "evt-root-cause" : ""}>
            <img className="evt-icon" src={OPTICAL_ASSETS.icons[item.icon]} alt="" width={14} height={14} />
            <div>
              <div className="evt-cause-title">
                {item.title}
                {item.root && <EvtBadge text="根因" tone="manual" />}
                {item.badge && <EvtBadge text={item.badge} tone={item.badgeTone} />}
              </div>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
