import { HC_ASSETS } from "../../mock/hc-assets.js";

const TABS = [
  { key: "manual", text: "待人工处理", count: 2 },
  { key: "energy", text: "节能机会点", count: 1 },
];

const MANUAL_ROWS = [
  { title: "光链路脏污，待清污", desc: "计算柜11- L1交换板02链路已隔离，等待人工清污", icon: "故障+小手" },
  { title: "Qwen-1.5B服务劣化：网卡驱动待升级", desc: "节点112.34.23.1的hinic3驱动需由V11.8升级至V13.1", icon: "故障+小手" },
];

const ENERGY_ROWS = [
  { title: "Qwen-14B服务存在节能空间，可优化策略", desc: "识别到低负载时段，预计开启均衡模式可日节能12.3%", icon: "节能+小手" },
];

// 守护事件卡片 —— 左面板中的事件列表（两个 tab + 事件行）
// 被 home-screen 的 #home-events 槽位和 story.js 的 renderStoryGuard 使用
export default function GuardEvents({ view = "manual", onChange, onViewAll }) {
  const isManual = view !== "energy";
  const isEnergy = view === "energy";
  const rows = isEnergy ? ENERGY_ROWS : MANUAL_ROWS;
  const activeTab = isEnergy ? "energy" : "manual";

  return (
    <section className="hc-guard">
      <div className="hc-guard-head">
        <h2>智能体事件</h2>
        <button type="button" disabled={!onViewAll} onClick={onViewAll}>查看全部</button>
      </div>
      <div className="hc-tabs" role="tablist">
        {TABS.map(({ key, text, count }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={String(key === activeTab)}
            onClick={() => onChange?.(key)}
          >
            {text} <b className="hc-tab-count">{view === "empty" ? 0 : count}</b>
          </button>
        ))}
      </div>
      {view === "empty" ? (
        <div className="hc-empty">
          <img className="hc-icon" src={HC_ASSETS.icons["暂无待处理事项"]} alt="" width={150} />
        </div>
      ) : (
        rows.map(({ title, desc, icon }) => (
          <article key={title} className="hc-event-row">
            <div className="hc-event-head">
              <img className="hc-icon" src={HC_ASSETS.icons[icon]} alt="" width={24} />
              <span>{title}</span>
              <time>14:59:30</time>
            </div>
            <p>{desc}</p>
          </article>
        ))
      )}
    </section>
  );
}
