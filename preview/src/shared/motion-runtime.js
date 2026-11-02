
export function initMotionRuntime() {
window.HCMotion=(()=>{
/* ============================================================
   spring-engine.js — 弹性动画唯一入口（依据 spring-physics）
   规则：弹性必须用本引擎；禁止 cubic-bezier 冒充；禁止设 duration；
        k≥100、d≥10；手势衔接必须传入释放速度（state.v）。
   用法：
     const s = { x: 起始值, v: 0 };
     springTo(s, 目标值, SPRING.standard, x => el.style.height = x + 'px');
   中断重定向：对同一 state 再次调用 springTo 即自当前位置+速度续走。
   ============================================================ */
const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const SPRING = {
  gentle:     { k: 200, d: 20, m: 1 }, // 背景大元素缓移        ~600ms
  standard:   { k: 400, d: 30, m: 1 }, // Sheet/卡片展开 ⭐默认  ~400ms
  responsive: { k: 600, d: 35, m: 1 }, // Tab 指示器/导航       ~250ms
  bouncy:     { k: 400, d: 15, m: 1 }, // 点赞/庆祝弹跳         ~500ms
  snappy:     { k: 800, d: 40, m: 1 }, // 开关/Chip 选中        ~150ms
  heavy:      { k: 300, d: 30, m: 2 }, // 大面积拖拽惯性        ~700ms
};

function stepSpring(s, target, h, { k, d, m = 1 }) {
  const a = (-k * (s.x - target) - d * s.v) / m;
  s.v += a * h;
  s.x += s.v * h;
}

/** 驱动 state.x 弹向 target；返回 { stop() }。REDUCED 时直达目标。 */
function springTo(state, target, preset, onUpdate, onSettle) {
  if (REDUCED) { state.x = target; state.v = 0; onUpdate(target); onSettle && onSettle(); return { stop() {} }; }
  if (state._raf) cancelAnimationFrame(state._raf);
  let last = performance.now();
  function frame(now) {
    let dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps; // sub-step 数值稳定
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

/* 图标微动效离场专用（icon-micro-animation：离场可 easeIn 时间轴） */
const easeInCubic = t => t * t * t;
const lerp = (a, b, t) => a + (b - a) * t;

return {springTo,REDUCED,SPRING_SOFT:{k:300,d:35,m:1}};})();}
