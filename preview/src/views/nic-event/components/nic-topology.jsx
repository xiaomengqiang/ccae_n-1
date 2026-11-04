import { useState } from "react";
import { OPTICAL_ASSETS } from "../../../mock/hc-assets.js";

// nic 拓扑区 —— 六边形实例网格（HexNode 小颗粒）+ 右侧机柜模拟（CabinetSimulator）+ 升级提示
// hover 联动（六边形 → 机柜刀片高亮）是纯内部耦合，用 useState 驱动；
// 阶段态（fault/healthy/提示文案）由 event.js 状态机以 props 推送。

const GROUPS = [
  ["P 节点 · 2", ["112.34.13.2", "112.34.13.3"]],
  ["D 节点 · 8", ["112.34.13.4", "112.34.13.5", "112.34.13.6", "112.34.13.7", "112.34.14.4", "112.34.14.5", "112.34.14.7", "112.34.23.1"]],
];
const FAULT_IP = "112.34.23.1";

// 机柜刀片映射（演示映射，与原 renderOriginalTopology 逐字段一致）
const CABINET_IPS = ["112.34.13.2", "112.34.13.3", "112.34.13.4", "112.34.13.5", "112.34.13.6", "112.34.13.7", "112.34.14.4", "112.34.14.5", "112.34.14.7", "113.232.33.3", "112.34.23.1"];
const CPU_Y = [65, 84, 103, 122, 272, 291, 310, 329];
const CPU_U = [18, 17, 16, 15, 4, 3, 2, 1];

function blade(ip, i, kind) {
  const rack = i < 8 ? 12 : 13, slot = i < 8 ? i : i - 8;
  const side = i === 9 ? "in" : i === 10 ? "out" : "normal";
  const y = kind === "CPU" ? CPU_Y[slot] : 160 + slot * 14.5;
  const u = kind === "CPU" ? CPU_U[slot] : 12 - slot;
  const label = ip + " · 计算柜" + rack + " · " + kind + " U" + String(u).padStart(2, "0") + "（演示映射）";
  return {
    ip, rack: String(rack), kind, side,
    left: (rack === 12 ? 4 : 80) + "px", top: y + "px",
    width: "66px", height: (kind === "CPU" ? 18 : 14) + "px",
    u: "U" + String(u).padStart(2, "0"), label,
  };
}
const BLADES = CABINET_IPS.flatMap((ip, i) => (ip === "113.232.33.3" ? [] : [blade(ip, i, "CPU"), blade(ip, i, "NPU")]));
const UNMAPPED = [1, 3, 4, 5, 6, 7].flatMap((slot) => ["CPU", "NPU"].map((kind) => ({
  left: "80px",
  top: (kind === "CPU" ? CPU_Y[slot] : 160 + slot * 14.5) + "px",
  width: "66px", height: (kind === "CPU" ? 18 : 14) + "px",
})));

function HexCells() {
  return (
    <div className="nic-hex-cells">
      {Array.from({ length: 10 }, (_, c) => <span key={c}>{c < 8 ? "N" : "C"}</span>)}
    </div>
  );
}

function HexNode({ name, ip, fault, hexFault, nodeState, onFocusIp }) {
  return (
    <div
      className={"nic-hex-node" + (fault ? " nic-fault-node" : "")}
      data-ip={ip}
      data-node-state={fault ? nodeState : undefined}
      tabIndex={0}
      onPointerEnter={() => onFocusIp(ip)}
      onPointerLeave={() => onFocusIp(FAULT_IP)}
      onFocus={() => onFocusIp(ip)}
      onBlur={() => onFocusIp(FAULT_IP)}
    >
      <strong className="nic-instance-name">{name}</strong>
      <div className={"nic-hex" + (fault && hexFault ? " fault" : "")}>
        <HexCells />
      </div>
      <span className="nic-ip">{ip}</span>
    </div>
  );
}

function CabinetSimulator({ focusedIp, healthy }) {
  return (
    <div className="nic-cabinet-detail">
      <strong className="nic-rack-title">超节点01</strong>
      <div className={"nic-cabinet-crop nic-mapping-focus" + (healthy ? " nic-mapping-healthy" : "")}>
        <div className="nic-cabinet-image" />
        {BLADES.map((b, i) => (
          <span
            key={b.ip + b.kind}
            className={"nic-blade-highlight " + b.side + (b.ip === focusedIp ? " linked" : "")}
            data-ip={b.ip} data-rack={b.rack} data-kind={b.kind} data-u={b.u}
            style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
            title={b.label} aria-label={b.label}
          >
            <span className="nic-blade-u-label">{b.kind} {b.u}</span>
          </span>
        ))}
        {UNMAPPED.map((m, i) => (
          <span key={i} className="nic-blade-unmapped" aria-hidden="true" style={{ left: m.left, top: m.top, width: m.width, height: m.height }} />
        ))}
      </div>
      <div className="nic-rack-context left" aria-hidden="true"><div className="nic-cabinet-image" /></div>
      <div className="nic-rack-context right" aria-hidden="true"><div className="nic-cabinet-image" /></div>
      <div className="nic-cabinet-labels">
        <span className="active">计算柜12</span>
        <span className="active">计算柜13</span>
      </div>
    </div>
  );
}

// 提示条 —— kind: 'simple'（图标+标题+可选根因徽标+文案）| 'manual'（待人工图标组）| 'plain'（仅标题）
function UpgradeTip({ tip }) {
  if (!tip) return <div className="nic-upgrade-tip" />;
  const { kind, iconName, title, badge, text, flowIndex } = tip;
  let heading;
  if (kind === "manual") {
    heading = (
      <>
        <span className="nic-tip-manual-icon" aria-label="待人工处理">
          <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色的故障"]} alt="" width={17} height={17} />
          <span className="fault-status-flags">
            <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={12} height={12} />
          </span>
        </span>
        <span>{title}</span>
      </>
    );
  } else {
    heading = (
      <>
        <img className="evt-icon" src={OPTICAL_ASSETS.icons[iconName]} alt="" width={17} height={17} />
        <span>{title}</span>
      </>
    );
  }
  return (
    <div className="nic-upgrade-tip" data-flow-index={flowIndex !== undefined ? String(flowIndex) : undefined}>
      <strong>
        {heading}
        {badge && <span className="evt-badge evt-badge-manual">{badge}</span>}
      </strong>
      <p>{text}</p>
    </div>
  );
}

export default function NicTopology({ hexFault = true, nodeState = "故障节点", healthy = false, tip = null }) {
  const [focusedIp, setFocusedIp] = useState(FAULT_IP);
  return (
    <>
      <div className="nic-native-topology">
        {GROUPS.map(([name, ips], g) => (
          <div className="nic-instance-group" key={name}>
            <small>{name}</small>
            <div className="nic-hex-row">
              {ips.map((ip, i) => {
                const fault = ip === FAULT_IP;
                return (
                  <HexNode
                    key={ip}
                    name={(g ? "D-" : "P-") + String(i + 1).padStart(2, "0") + " 实例"}
                    ip={ip}
                    fault={fault}
                    hexFault={hexFault}
                    nodeState={nodeState}
                    onFocusIp={setFocusedIp}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <UpgradeTip tip={tip} />
      </div>
      <CabinetSimulator focusedIp={focusedIp} healthy={healthy} />
    </>
  );
}
