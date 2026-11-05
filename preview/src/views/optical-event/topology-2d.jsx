import { useEffect, useMemo, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../../components/evt-badge/index.jsx";
import EventTypeIcon from "../../components/event-type-icon/index.jsx";
import Rack3D from "./rack-3d.jsx";

// 光链路诊断拓扑（2D）—— div 绝对定位布局 + SVG 连线层 + 选中联动（BFS 追溯上下游）
// + 2D/3D 切换（3D 为 rack-3d.jsx）+ 状态提示条。
// 结构/坐标/连线公式与原 Topology() 逐一对齐；阶段态（view/cleanedAt）由事件状态机以 props 推送。
// DOM 顺序与原版一致：内容 → 状态提示 → 隔离徽标 → 3D 视图（常驻挂载，hidden 切换）→ 切换器。

const GROUPS = [
  ["灵衢互联柜01", 50, 130, ""],
  ["本板·灵衢互联刀片03", 193.8, 388, " evt-board"],
  ["NPU计算刀片", 595.6, 113, ""],
];

// 模块注册表（索引顺序 = DOM 顺序：4×L2 + 32×端口 + 4×U2 + 16×U1 + 8×刀片）
const MODULES = [
  ...Array.from({ length: 4 }, (_, i) => ({
    kind: "device", label: `灵衢L2-0${i + 1}`, subtitle: "互联芯片", count: "2",
    x: 258 + i * 260, y: 96.2, width: 250, height: 72,
  })),
  ...Array.from({ length: 32 }, (_, i) => ({
    kind: "port", label: `LPO\n${String(i + 1).padStart(2, "0")}`, fault: i === 0,
    x: 264.2 + i * 29.65 + Math.floor(i / 4) * 10, y: 323, width: 27.65, height: 40,
    title: `LPO光模块${String(i + 1).padStart(2, "0")}`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    kind: "union", label: `U2.${i + 1}`, x: 650 + i * 59.7, y: 423, width: 57.7, height: 41,
  })),
  ...Array.from({ length: 16 }, (_, i) => {
    const side = Math.floor(i / 8);
    return { kind: "union", label: `U1.${(i % 8) * 2 + 1 + side}`, x: 264.9 + side * 520 + (i % 8) * 61.45, y: 515, width: 58.5, height: 41 };
  }),
  ...Array.from({ length: 8 }, (_, i) => ({
    kind: "device", label: `NPU计算刀片0${i + 1}`, subtitle: "NPU卡", count: "8",
    x: 258 + i * 130, y: 638.8, width: 120, height: 56,
    title: `NPU计算刀片0${i + 1}`,
  })),
];
const FAULT_MODULE = 4; // 端口 0（evt-fault）

// 有向连接端点（顺序与连线一一对应：32 L2→端口 + 32 U2→U1 + 16 U1→刀片 + 64 下行）
const ENDPOINTS = [];
for (let i = 0; i < 32; i++) ENDPOINTS.push([Math.floor(i / 8), 4 + i]);
for (let u2 = 0; u2 < 4; u2++) for (let i = 0; i < 8; i++) ENDPOINTS.push([36 + u2, 40 + Math.floor(u2 / 2) * 8 + i]);
for (let side = 0; side < 2; side++) for (let i = 0; i < 8; i++) ENDPOINTS.push([40 + side * 8 + i, 56 + i]);
for (let port = 0; port < 32; port++) {
  const pair = Math.floor((port % 16) / 4) * 2;
  for (const offset of [0, 1]) ENDPOINTS.push([4 + port, 40 + Math.floor(port / 16) * 8 + pair + offset]);
}

const LINK_PATHS = ENDPOINTS.map((_, i) => {
  if (i < 32) {
    const x1 = 383 + Math.floor(i / 8) * 260, x2 = 278.025 + i * 29.65 + Math.floor(i / 4) * 10;
    return `M${x1} 168.2 C${x1} 280 ${x2} 253 ${x2} 323`;
  }
  if (i < 64) {
    const u2 = Math.floor((i - 32) / 8), k = (i - 32) % 8, side = Math.floor(u2 / 2);
    const x1 = 678.85 + u2 * 59.7, x2 = 294.15 + side * 520 + k * 61.45;
    return `M${x1} 464 C${x1} 486 ${x2} 488 ${x2} 515`;
  }
  if (i < 80) {
    const k = i - 64, side = Math.floor(k / 8);
    const x1 = 294.15 + side * 520 + (k % 8) * 61.45, x2 = 318 + (k % 8) * 130;
    return `M${x1} 556 C${x1} 604 ${x2} 610 ${x2} 638.8`;
  }
  const port = Math.floor((i - 80) / 2), slot = (i - 80) % 2;
  const pair = Math.floor((port % 16) / 4) * 2;
  const union = Math.floor(port / 16) * 8 + pair + slot;
  const side = Math.floor(union / 8), u = union % 8;
  const x1 = 278.025 + port * 29.65 + Math.floor(port / 4) * 10, x2 = 294.15 + side * 520 + u * 61.45;
  return `M${x1} 363 C${x1} 426 ${x2} 452 ${x2} 515`;
});
const FAULT_LINK_D = LINK_PATHS[0];

// 隔离徽标锚点：故障链路贝塞尔曲线 t=0.6 处
const COORDS = FAULT_LINK_D.match(/-?\d+(?:\.\d+)?/g).map(Number);
const T = 0.6, U = 1 - T;
const bez = (axis) => U * U * U * COORDS[axis] + 3 * U * U * T * COORDS[axis + 2] + 3 * U * T * T * COORDS[axis + 4] + T * T * T * COORDS[axis + 6];
const ISOLATION_X = bez(0), ISOLATION_Y = bez(1);

const PIC_LABELS = Array.from({ length: 8 }, (_, g) => `PIC${g < 4 ? g * 2 + 1 : (g - 4) * 2 + 2}`);

const TIP_LABELS = ["链路闪断告警", "30条告警聚合", "光链路脏污", "已生成预案", "优雅隔离完成，事件已关闭", "", "链路恢复正常，隔离状态解除", "待办已关闭", "隔离状态解除"];
const TIP_DESCRIPTIONS = ["计算柜11-L1交换板02上发生闪断3次", "聚合链路闪断及相关设备告警", "L1-L2 设备光链路端面脏污", "对L1-L2异常链路进行优雅隔离", "计算柜11·L1交换板02光链路已完成优雅隔离", "", "检测到通道4光功率恢复正常，错误计数归零", "光链路清污待办已关闭", "链路运行正常，隔离状态已解除"];

// 沿有向连接分别追溯上游、下游，不扩散到上游的其他分支
function relatedSet(selected) {
  if (selected === null) return new Set();
  const related = new Set([selected]);
  for (const direction of [0, 1]) {
    const queue = [selected], visited = new Set(queue);
    while (queue.length) {
      const current = queue.shift();
      ENDPOINTS.forEach((edge) => {
        if (edge[direction] !== current) return;
        const next = edge[1 - direction];
        related.add(next);
        if (!visited.has(next)) { visited.add(next); queue.push(next); }
      });
    }
  }
  return related;
}

function TopoNode({ module, index, selected, related, onSelect, faultCleaned }) {
  const isSelected = index === selected;
  const isRelated = related.has(index);
  const aria = module.title || (module.label.replace(/\n/g, " ") + (module.subtitle ? " " + module.subtitle + module.count : ""));
  return (
    <div
      className={"evt-topo-node evt-node-" + module.kind
        + (module.fault ? " evt-fault" : "")
        + (isRelated ? " evt-selected" : "")}
      data-node={module.label}
      role="button" tabIndex={0}
      aria-label={"聚焦 " + aria}
      aria-pressed={String(isSelected)}
      title={module.title}
      style={{
        position: "absolute", left: module.x + "px", top: module.y + "px",
        width: module.width + "px", height: module.height + "px",
        background: module.fault && faultCleaned ? "#247247" : undefined,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(index); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onSelect(index); } }}
    >
      <span className="evt-node-label">{module.label}</span>
      {module.subtitle && <span className="evt-node-subtitle">{module.subtitle}<b>{module.count}</b></span>}
    </div>
  );
}

export default function Topology2D({ view = 0, isolationOnly = false, cleanedAt = null, onFaultPortClean }) {
  const [selected, setSelected] = useState(FAULT_MODULE);
  const [dimension, setDimension] = useState("2d");
  const svgRef = useRef(null);
  const switcherRef = useRef(null);

  const related = useMemo(() => relatedSet(selected), [selected]);
  const downlinkVisible = selected !== null && ((selected >= 4 && selected < 36) || (selected >= 40 && selected < 56));
  const faultCleaned = cleanedAt !== null && !isolationOnly;
  const sleeveMuted = selected !== null && !related.has(FAULT_MODULE);

  const selectModule = (index) => {
    setSelected(index);
    if (index === FAULT_MODULE && !isolationOnly) onFaultPortClean?.();
  };

  // 流光动画（命令式，挂载后一次性激活）
  useEffect(() => {
    const raf = requestAnimationFrame(() => window.HCOpticalFlow?.(svgRef.current));
    return () => cancelAnimationFrame(raf);
  }, []);
  // 选中态对动画轨迹的同步（hc-flow-trace 为动画注入的命令式节点）
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const activePaths = new Set(
      ENDPOINTS.map((edge, i) => (selected !== null && edge.every((index) => related.has(index)) ? LINK_PATHS[i] : null)).filter(Boolean)
    );
    svg.querySelectorAll(".hc-flow-trace").forEach((path) => path.classList.toggle("evt-selected-link", activePaths.has(path.getAttribute("d"))));
  }, [selected, related]);

  // 状态提示条内容（原 update() + mount 覆盖逻辑）
  const tipIndex = view === 1 ? 0 : view === 3 ? 3 : view === 5 ? 4 : view === 7 ? 8 : view;
  let tipName = TIP_LABELS[tipIndex], tipDesc = TIP_DESCRIPTIONS[tipIndex];
  let tipCustom = null;
  if (isolationOnly && view === 4) tipName = "优雅隔离已完成";
  if (!isolationOnly && cleanedAt === null && (view === 4 || view === 5)) {
    tipCustom = { name: "光模块脏污，待人工清污", desc: "计算柜11·L1交换板02光模块端面脏污，需人工清污。系统持续监控通道4光功率与错误计数" };
  }
  if (isolationOnly && view === 5) { tipName = "事件已关闭"; tipDesc = "生成待人工处理事件"; }

  const linkClass = (i) => {
    const active = selected !== null && ENDPOINTS[i].every((index) => related.has(index));
    return [
      i === 0 ? "evt-fault-link" : "",
      i >= 32 && i < 64 ? "evt-npu-flow evt-union-flow" : "",
      i >= 64 && i < 80 ? "evt-npu-flow" : "",
      i >= 80 ? "evt-npu-flow evt-optical-downlink" : "",
      active ? "evt-selected-link" : "",
      selected !== null && downlinkVisible && ENDPOINTS[i].includes(selected) ? "evt-downlink-visible" : "",
    ].filter(Boolean).join(" ");
  };
  const faultLinkStroke = faultCleaned ? ((view === 4 || view === 5) ? "#888" : "#49876c") : undefined;

  const switchMode = (mode, focusTarget) => {
    setDimension(mode);
    if (focusTarget) requestAnimationFrame(() => switcherRef.current?.querySelector(`[data-mode="${mode}"]`)?.focus());
  };

  return (
    <section
      className={"evt-topology" + (selected !== null ? " evt-has-selection" : "")}
      aria-label="光链路诊断拓扑"
      data-view={view}
      data-dimension={dimension}
      style={{ "--evt-isolation-x": ISOLATION_X + "px", "--evt-isolation-y": ISOLATION_Y + "px" }}
      onClick={(e) => { if (!e.target.closest(".evt-topo-node,.evt-topo-state-label,button,a")) setSelected(null); }}
      onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); }}
    >
      <div className="evt-breadcrumb">
        {["SuperPod-1024", "/", "计算柜03", "/", "P03-N05·NPU计算刀片"].map((t, i) => <span key={i}>{t}</span>)}
      </div>
      {GROUPS.map(([name, top, height, cls]) => (
        <div key={name} className={"evt-topo-group" + cls} style={{ top: top + "px", height: height + "px" }}>
          <h3>{name}</h3>
        </div>
      ))}
      {/* 设备示意图：互联柜（裁切）+ SFU 板 + NPU 板 */}
      <div className="evt-device-art" style={{ position: "absolute", left: "64px", top: "72px", width: "125px", height: "108px", overflow: "hidden" }}>
        <img className="evt-device-art" src="./assets/uploads/167-150903.png" alt="灵衢互联柜" style={{ position: "absolute", left: 0, top: 0, width: "125px", height: "175px" }} />
      </div>
      <img className="evt-device-art" src="./assets/uploads/167-150904.png" alt="灵衢SFU板" style={{ position: "absolute", left: "81.7px", top: "349.1px", width: "97.9px", height: "163.6px" }} />
      <img className="evt-device-art" src={OPTICAL_ASSETS.icons["NPU板"]} alt="" style={{ position: "absolute", left: "64px", top: "596px", width: "112px", height: "112px" }} />
      {[[299, 84], [389.2, 174.6]].map(([top, height]) => (
        <div key={top} className="evt-topo-outline" style={{ top: top + "px", height: height + "px" }} />
      ))}
      <span className="evt-topo-label" style={{ position: "absolute", left: "264.1px", top: "302.5px" }}>光模块  3</span>
      <span className="evt-topo-label" style={{ position: "absolute", left: "736.5px", top: "399.2px" }}>互联Union  4</span>
      {MODULES.map((module, index) => (
        <TopoNode key={index} module={module} index={index} selected={selected} related={related} onSelect={selectModule} faultCleaned={faultCleaned} />
      ))}
      {PIC_LABELS.map((text, g) => (
        <span key={g} className="evt-pic-label" style={{ position: "absolute", left: 264.2 + g * 128.6 + "px", top: "365px", width: "116.6px", height: "16px" }}>{text}</span>
      ))}
      {[0, 1].map((side) => (
        <span key={side} className="evt-topo-label" style={{ position: "absolute", left: 264.9 + side * 520 + "px", top: "494.6px" }}>
          下行Union·{side === 0 ? "左" : "右"}侧  8
        </span>
      ))}
      <svg className="evt-links" viewBox="0 0 1332 722" aria-hidden="true" ref={svgRef}>
        <defs>
          <radialGradient id="evt-junction-glow">
            <stop stopColor="#b4ebd3" stopOpacity=".9" />
            <stop offset="1" stopColor="#67c798" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className={"evt-isolation-sleeve" + (sleeveMuted ? " evt-sleeve-muted" : "")}>
          <path className="evt-sleeve-outline" d={FAULT_LINK_D} />
          <path className="evt-sleeve-inner" d={FAULT_LINK_D} />
        </g>
        {LINK_PATHS.map((d, i) => (
          <path key={i} className={linkClass(i)} d={d} stroke={i === 0 ? faultLinkStroke : undefined} />
        ))}
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={383 + i * 260} cy="168.2" rx="9" ry="3" fill="url(#evt-junction-glow)" />)}
        {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={318 + i * 130} cy="638.8" rx="9" ry="3" fill="url(#evt-junction-glow)" />)}
      </svg>
      <div className={"evt-topo-state-label" + (selected !== null && selected !== FAULT_MODULE ? " evt-selection-hidden" : "")}>
        {tipCustom ? (
          <>
            <strong className="evt-tip-title">
              <EventTypeIcon size={20}>
                <span className="fault-status-flags">
                  <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={10} height={10} />
                </span>
              </EventTypeIcon>
              <span className="evt-tip-name">{tipCustom.name}</span>
              <EvtBadge text="根因" tone="manual" />
            </strong>
            <p>{tipCustom.desc}</p>
          </>
        ) : (
          <>
            <strong className="evt-tip-title">
              {tipIndex === 3 ? (
                <span className="evt-plan-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
                    <path d="M14 3v6h6M8 13h8M8 17h5" />
                  </svg>
                </span>
              ) : (
                <img className="evt-icon" src={OPTICAL_ASSETS.icons[tipIndex >= 4 ? "完成" : "红色的故障"]} alt="" width={20} height={20} />
              )}
              <span className="evt-tip-name">{tipName}</span>
              {tipIndex === 2 && <em>根因</em>}
            </strong>
            <p>{tipDesc}</p>
          </>
        )}
        {view === 5 && isolationOnly && (
          <button
            type="button" className="evt-tip-manual"
            onClick={() => { window.closeOpticalEvent(); window.openOpticalEvent(); }}
          >
            <EvtBadge text="待人工处理" tone="manual">
              <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={16} height={16} />
            </EvtBadge>
            <span className="evt-tip-task-copy">光模块端面脏污，等待人工清污</span>
            <span className="evt-tip-task-arrow">→</span>
          </button>
        )}
      </div>
      <div className={"evt-link-isolated-badge" + (sleeveMuted ? " evt-sleeve-muted" : "")}>
        <span className="evt-link-isolated-symbol">⊘</span>
        <span>已隔离</span>
      </div>
      <Rack3D onPort={(index) => selectModule(FAULT_MODULE + index)} hidden={dimension !== "3d"} />
      <div className="evt-view-switch" role="radiogroup" aria-label="拓扑视图" ref={switcherRef}>
        {["2D", "3D"].map((label) => {
          const mode = label.toLowerCase();
          const active = dimension === mode;
          return (
            <button
              key={label} type="button" data-mode={mode} role="radio"
              aria-checked={String(active)} tabIndex={active ? 0 : -1}
              onClick={() => switchMode(mode, false)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  switchMode(dimension === "2d" ? "3d" : "2d", true);
                }
              }}
            >{label}</button>
          );
        })}
      </div>
    </section>
  );
}
