import { Fragment } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

// 光模块事件面板部件（原 HCEventUI/HCOpticalEventUI 工厂的 React 版）
// MetricComparison：隔离前后指标对比（原 MetricComparison 工厂）
// ProcessTimeline：处理环节时间轴（原 ProcessTimeline 工厂；FLIP/appear 动画由父级 useLayoutEffect 驱动）
// 结构/文案/尺寸与原工厂逐一对齐；dim 为选中联动淡化。

export function EvtIcon({ name, size = 16, width, height, className = "", alt = "", style }) {
  return (
    <img
      className={"evt-icon" + (className ? " " + className : "")}
      src={OPTICAL_ASSETS.icons[name]}
      alt={alt}
      width={width ?? size}
      height={height ?? size}
      style={style}
    />
  );
}

export function MetricComparison({ label, before, after, unit, changeLabel, direction = "up" }) {
  const degraded = label === "带宽" && direction === "down";
  return (
    <div className={"evt-metric-compare" + (degraded ? " evt-metric-degraded" : "")}>
      {[before, after].map((value, index) => (
        <Fragment key={index}>
          {index > 0 && <EvtIcon name="箭头" width={19.671875} height={12.992676} className="evt-metric-arrow" />}
          <div>
            <small>{(index ? "当前" : "隔离前") + label + " " + unit}</small>
            <div className="evt-metric-values">
              <b className={index ? "evt-after" : "evt-before"}>{value}</b>
              {index > 0 && changeLabel && (
                <span className="evt-metric-growth">
                  <EvtIcon
                    name="箭头2"
                    width={7.464844}
                    height={8.914551}
                    alt={direction === "down" ? "下降" : "上升"}
                    style={direction === "down" ? { transform: "rotate(180deg)" } : undefined}
                  />
                  <span>{changeLabel}</span>
                </span>
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

const WIDTHS = [132, 165, 132, 120, 156, 192];
const OFFSETS = [16, 223, 462, 669, 852, 1083];

export function ProcessTimeline({ steps, current, onSelect, sectionRef }) {
  const compact = steps.length <= 6;
  return (
    <section className="evt-process" aria-label="处理环节时间轴" ref={sectionRef}>
      <h2>处理环节</h2>
      <div className={"evt-process-list" + (steps.length > 6 ? " evt-process-extended" : "")} role="tablist">
        {steps.map((step, i) => {
          const key = step.viewIndex ?? i;
          const style = compact
            ? {
                left:
                  steps.length === 5
                    ? `calc(${i * 25}% + ${82 * (1 - i / 4) - 78 * i / 4 - WIDTHS[i] / 2}px)`
                    : `${OFFSETS[i]}px`,
                width: `${WIDTHS[i]}px`,
              }
            : undefined;
          return (
            <div className={"evt-process-item" + (step.dim ? " evt-focus-dim" : "")} key={key} data-motion-key={String(key)} style={style}>
              <button
                type="button"
                className={"evt-process-card" + (step.manual ? " evt-pending" : "") + (step.iconName === "红色小手" && !step.manual ? " manual-completed" : "")}
                role="tab"
                aria-selected={String(current === i)}
                aria-label={step.description.replace(/\n/g, "")}
                onClick={() => onSelect(i)}
              >
                <EvtIcon name={step.iconName || (step.manual ? "红色小手" : "故障诊断-圆-原稿绿色")} size={32} />
                <span>
                  <span className="evt-process-title">{step.title}{step.manual && <em>待处理</em>}</span>
                  <span className="evt-process-description">{step.description}</span>
                </span>
              </button>
              <div className={"evt-process-tick" + (current === i ? " evt-current" : "")}><span>{step.time}</span></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
