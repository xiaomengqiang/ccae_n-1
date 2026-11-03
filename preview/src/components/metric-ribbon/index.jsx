import { useCallback, useEffect, useRef, useState } from "react";
import MetricTile from "../metric-tile/index.jsx";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { springTo, REDUCED, SPRING_SOFT } from "../../shared/motion-runtime.js";

const KEYS = ["resource", "training", "inference"];
const TITLES = ["基础设施", "训练作业", "推理服务"];
const COMPACT_LABELS = { resource: "故障数", training: "运行总数", inference: "运行总数" };
const COMPACT_VALUES = { resource: "2", training: "13", inference: "16" };

const METRICS = {
  resource: [["故障数", "2", "故障数", ""], ["隐患数", "0", "隐患数", ""], ["NPU利用率", "76.4", "NPU利用率", "%"], ["HBM利用率", "74.2", "HBM利用率", "%"], ["能耗", "771", "能耗", "kW"]],
  training: [["运行总数", "13", "运行总数", ""], ["中断", "1", "中断", ""], ["卡死", "0", "卡死", ""], ["劣化", "0", "劣化", ""], ["正常运行", "12", "正常运行", ""]],
  inference: [["运行总数", "16", "运行总数", ""], ["中断", "0", "中断", ""], ["卡死", "0", "卡死", ""], ["劣化", "1", "劣化", ""], ["正常运行", "15", "正常运行", ""], ["节能中", "3", "节能中", ""]],
};

// 指标带 —— 三个指标组（基础设施/训练/推理），flexGrow 弹簧展开/收起
// 弹簧动画通过 ref 调用 HCMotion.springTo（命令式动画在 effect 中驱动 DOM style）
export default function MetricRibbon({ category = "resource", selected = 0, onChange }) {
  const [activeCategory, setActiveCategory] = useState(category);
  const [activeSelected, setActiveSelected] = useState(selected);
  const ribbonRef = useRef(null);
  const groupRefs = useRef({});

  const activeCategoryRef = useRef(category);

  const activate = useCallback((cat, index = 0, notify = false, initial = false) => {
    const changed = cat !== activeCategoryRef.current;
    activeCategoryRef.current = cat;
    setActiveCategory(cat);
    setActiveSelected(index);
    const n = ribbonRef.current;
    if (n) n.dataset.category = cat;
    Object.entries(groupRefs.current).forEach(([key, g]) => {
      if (!g) return;
      const expanded = key === cat;
      g.className = "hc-metric-group " + (expanded ? "expanded" : "collapsed");
      const row = g.querySelector(".hc-metric-row");
      if (row) row.inert = !expanded;
      const compact = g.querySelector(".hc-metric-compact");
      if (compact) compact.inert = expanded;
      g.querySelectorAll(".hc-metric").forEach((tile) => {
        const isSelected = expanded && Number(tile.dataset.metricId) === index;
        tile.classList.toggle("selected", isSelected);
        tile.setAttribute("aria-pressed", String(isSelected));
      });
      if (initial) {
        g.style.flexGrow = key === cat ? 904 : 163;
      } else if (changed) {
        const target = expanded ? 904 : 163;
        const state = { x: parseFloat(g.style.flexGrow) || 163, v: 0 };
        springTo(state, target, SPRING_SOFT, (x) => { g.style.flexGrow = x; });
      }
    });
    if (notify) onChange?.(cat, index);
  }, [onChange]);

  // 稳定的 DOM 挂载代理 —— story.js 通过 document.querySelector(...).activate(...) 调用
  // 使用 ref 转发到最新的 activate 实现（避免闭包过期）
  const activateRef = useRef(activate);
  activateRef.current = activate;

  useEffect(() => {
    activate(category, selected, false, true);
    if (ribbonRef.current) {
      ribbonRef.current.activate = (...args) => activateRef.current(...args);
    }
    return () => { if (ribbonRef.current) delete ribbonRef.current.activate; };
  }, []);

  return (
    <section className="hc-ribbon" ref={ribbonRef} data-category={activeCategory}>
      {KEYS.map((key, i) => (
        <section
          key={key}
          className={"hc-metric-group " + (key === activeCategory ? "expanded" : "collapsed")}
          data-category={key}
          ref={(el) => { groupRefs.current[key] = el; }}
        >
          <button type="button" className="hc-metric-title" onClick={() => activate(key, 0, true)}>
            {TITLES[i]}
          </button>
          <div className="hc-metric-row">
            {METRICS[key].map(([name, value, ic, unit], index) => (
              <MetricTile
                key={name}
                name={name}
                value={value}
                iconName={ic}
                unit={unit}
                index={index}
                selected={key === activeCategory && index === activeSelected}
                onSelect={() => activate(key, index, true)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hc-metric-compact"
            onClick={() => activate(key, 0, true)}
          >
            <span>{COMPACT_LABELS[key]}</span>
            <b>{COMPACT_VALUES[key]}</b>
          </button>
        </section>
      ))}
    </section>
  );
}
