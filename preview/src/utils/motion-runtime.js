// 弹簧动画引擎（纯函数，无 DOM 依赖）
// 被 MetricRibbon（flexGrow 弹簧）/ enhancements（REDUCED 检查）/ React 组件使用
// window.HCMotion 在模块顶层设置 + export 供 React 组件直接 import

export const REDUCED = typeof matchMedia !== "undefined"
  && matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SPRING = {
  gentle:     { k: 200, d: 20, m: 1 },
  standard:   { k: 400, d: 30, m: 1 },
  responsive: { k: 600, d: 35, m: 1 },
  bouncy:     { k: 400, d: 15, m: 1 },
  snappy:     { k: 800, d: 40, m: 1 },
  heavy:      { k: 300, d: 30, m: 2 },
};

export const SPRING_SOFT = { k: 300, d: 35, m: 1 };

function stepSpring(s, target, h, { k, d, m = 1 }) {
  const a = (-k * (s.x - target) - d * s.v) / m;
  s.v += a * h;
  s.x += s.v * h;
}

/** 驱动 state.x 弹向 target；返回 { stop() }。REDUCED 时直达目标。 */
export function springTo(state, target, preset, onUpdate, onSettle) {
  if (REDUCED) { state.x = target; state.v = 0; onUpdate(target); onSettle && onSettle(); return { stop() {} }; }
  if (state._raf) cancelAnimationFrame(state._raf);
  let last = performance.now();
  function frame(now) {
    let dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps;
    for (let i = 0; i < steps; i++) stepSpring(state, target, h, preset);
    if (Math.abs(state.x - target) < .0015 && Math.abs(state.v) < .02) {
      state.x = target; state.v = 0; onUpdate(state.x); state._raf = null; onSettle && onSettle(); return;
    }
    onUpdate(state.x);
    state._raf = requestAnimationFrame(frame);
  }
  state._raf = requestAnimationFrame(frame);
  return { stop() { state._raf && cancelAnimationFrame(state._raf); state._raf = null; } };
}

// window 挂载（模块顶层执行，不依赖 boot 调用时序）
// 供尚未 React 化的 legacy 模块（story.js / hc-components.js / enhancements.js）通过裸标识符 HCMotion 调用
window.HCMotion = { springTo, REDUCED, SPRING, SPRING_SOFT };

// boot 兼容（initMotionRuntime 不再需要，保留空函数以兼容旧 boot 调用）
export function initMotionRuntime() {}
