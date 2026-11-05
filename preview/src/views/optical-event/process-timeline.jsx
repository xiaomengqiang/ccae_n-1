import { useLayoutEffect, useRef } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

// 处理环节时间轴（原 ProcessTimeline 工厂的 React 版）
// 固定 6 列坐标布局（≤6 步）；>6 步 evt-process-extended 流式布局。
// FLIP/入场动画在 useLayoutEffect 内测量驱动（与原 effect 相同的数学与节奏）；
// appearedViews 记忆移入组件（open 周期内新视图只入场一次）。

const WIDTHS = [132, 165, 132, 120, 156, 192];
const OFFSETS = [16, 223, 462, 669, 852, 1083];

export default function ProcessTimeline({ steps, current, onSelect }) {
  const listRef = useRef(null);
  const appearedRef = useRef(new Set());

  // 结构签名：仅布局结构（步骤 key 列表 + 数量）变化才触发 FLIP/入场量测；
  // current 选中切换不需要（避免连续 setState 时 effect 重跑导致 WAAPI 动画互相覆盖闪跳）
  const structureKey = steps.map((s, i) => s.viewIndex ?? i).join("~");

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = [...list.querySelectorAll(".evt-process-item")];
    const reduced = Boolean(window.HCMotion?.REDUCED);
    items.forEach((item, i) => {
      const key = item.dataset.motionKey;
      if (!reduced && item.animate) {
        if (!appearedRef.current.has(key)) {
          appearedRef.current.add(key);
          const delay = Number(key) >= 6 ? 1100 + (Number(key) - 6) * 1200 : Math.min(i, 7) * 50;
          item.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay, easing: "cubic-bezier(.2,0,0,1)", fill: "backwards" });
        }
      }
    });
  }, [structureKey]);

  // FLIP：结构变化时旧位置 → 新位置平滑滑入。
  // 动画前取消节点上进行中的动画（连续阶段推进时避免 WAAPI 新旧 keyframe 覆盖闪跳）。
  const prevRectsRef = useRef(new Map());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const scale = list.getBoundingClientRect().width / list.offsetWidth || 1;
    const reduced = Boolean(window.HCMotion?.REDUCED);
    const items = [...list.querySelectorAll(".evt-process-item")];
    const nextRects = new Map();
    items.forEach((item) => {
      nextRects.set(item.dataset.motionKey, item.getBoundingClientRect());
    });
    if (!reduced) {
      items.forEach((item) => {
        const key = item.dataset.motionKey;
        const old = prevRectsRef.current.get(key), next = nextRects.get(key);
        if (old && next && Math.abs(old.x - next.x) + Math.abs(old.width - next.width) > .5 && item.animate) {
          item.getAnimations?.().forEach((a) => a.cancel());
          item.animate([{ transform: `translateX(${(old.x - next.x) / scale}px) scaleX(${old.width / next.width})` }, { transform: "none" }], { duration: 1100, easing: "cubic-bezier(.2,0,0,1)" });
          item.style.transformOrigin = "left center";
        }
      });
    }
    prevRectsRef.current = nextRects;
  }, [structureKey]);

  const fixed = steps.length <= 6;
  return (
    <section className="evt-process" aria-label="处理环节时间轴">
      <h2>处理环节</h2>
      <div className={"evt-process-list" + (steps.length > 6 ? " evt-process-extended" : "")} role="tablist" ref={listRef}>
        {steps.map((step, i) => (
          <div
            key={step.viewIndex ?? i}
            className="evt-process-item"
            data-motion-key={String(step.viewIndex ?? i)}
            style={fixed ? {
              left: steps.length === 5 ? `calc(${i * 25}% + ${82 * (1 - i / 4) - 78 * i / 4 - WIDTHS[i] / 2}px)` : `${OFFSETS[i]}px`,
              width: `${WIDTHS[i]}px`,
            } : undefined}
          >
            <button
              type="button"
              className={"evt-process-card" + (step.manual ? " evt-pending" : "") + (step.iconName === "红色小手" && !step.manual ? " manual-completed" : "")}
              role="tab"
              aria-selected={String(current === i)}
              aria-label={step.description.replace(/\n/g, "")}
              onClick={() => onSelect?.(i)}
            >
              <img className="evt-icon" src={OPTICAL_ASSETS.icons[step.iconName || (step.manual ? "红色小手" : "故障诊断-圆-原稿绿色")]} alt="" width={32} height={32} />
              <span>
                <span className="evt-process-title">{step.title}{step.manual && <em>待处理</em>}</span>
                <span className="evt-process-description">{step.description}</span>
              </span>
            </button>
            <div className={"evt-process-tick" + (current === i ? " evt-current" : "")}>
              <span>{step.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
