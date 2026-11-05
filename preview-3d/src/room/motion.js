const CCAE_MOTION=(()=>{
/* ============================================================
   spring-engine.js — 弹性动画唯一入口（依据 spring-physics）
   规则：弹性必须用本引擎；禁止 cubic-bezier 冒充；禁止设 duration；
        k≥100、d≥10；手势衔接必须传入释放速度（state.v）。
   用法：
     const s = { x: 起始值, v: 0 };
     springTo(s, 目标值, SPRING.standard, x => el.style.height = x + 'px');
   中断重定向：对同一 state 再次调用 springTo 即自当前位置+速度续走。
   ============================================================ */
const REDUCED = window.CCAE_LIGHT || typeof matchMedia !== 'undefined'
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

function attachOpticalFlow(group, pathDs, {
  /* 五层长尾（原为 2 层，头尾之间没有过渡层，故拖尾显得生硬）：
     段长 160→16 递减、透明度 .035→.24 递增，头端严格对齐同速滑动 →
     叠加处最亮、向尾部逐层脱落，形成柔和渐隐。速度与周期同步放缓，质感更从容。 */
  layers = [[160, .055], [75, .14], [16, .30]],
  speedPxS = 220,      // 较原 280 更慢，突出从容质感
  cycleMs = 4800,      // 波次周期 · 提案值待注册（--loop-optical）
  staggerMs = 80,      // 左→右错帧 · stagger-loose
  width = 1.35,           // 与光互联底线等宽（纤细）
  order,               // 可选：自定义错帧序；缺省按 bbox 中点 x 左→右
} = {}) {
  if (REDUCED && !window.CCAE_LIGHT) return { clear() {} };
  if(window.CCAE_LIGHT){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return {clear(){}};
    const step=Math.max(1,Math.ceil(pathDs.length/12));pathDs=pathDs.filter((_,i)=>i%step===0);
    layers=[[48,.22]];order=undefined;
  }
  const NS = 'http://www.w3.org/2000/svg';
  const segMax = layers[0][0];
  const meta = pathDs.map(d => {
    const probe = document.createElementNS(NS, 'path');
    probe.setAttribute('d', d); group.appendChild(probe);
    const L = probe.getTotalLength(), bb = probe.getBBox();
    probe.remove();
    return { d, L, mid: bb.x + bb.width / 2 };
  });
  let rank = order;
  if (!rank) {
    rank = [];
    meta.map((o, i) => [o.mid, i]).sort((a, b) => a[0] - b[0]).forEach(([_, i], k) => rank[i] = k);
  }
  meta.forEach((o, i) => {
    const duration = Math.max(cycleMs, (o.L + segMax) / speedPxS * 1000);
    const frac = Math.min((o.L + segMax) / speedPxS * 1000 / duration, 1);
    layers.forEach(([seg, op]) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', o.d); p.setAttribute('fill', 'none');
      p.setAttribute('stroke', `rgba(${S.mode==='health'?'108,210,159':'155,167,173'},${op})`);
      p.setAttribute('stroke-width', width);
      p.setAttribute('stroke-linecap', 'round');
      p.style.strokeDasharray = `${seg} ${o.L + segMax + seg}`;
      p.style.strokeDashoffset = seg;
      group.appendChild(p);
      p.animate(
        [{ strokeDashoffset: String(seg), offset: 0 },
         { strokeDashoffset: String(seg - (o.L + segMax)), offset: frac },
         { strokeDashoffset: String(seg - (o.L + segMax)), offset: 1 }],
        { duration, delay: Math.min(rank[i], 7) * staggerMs, iterations: Infinity, easing: 'linear' });
    });
  });
  return { clear() { group.getAnimations({subtree:true}).forEach(a=>a.cancel());group.innerHTML = ''; } };
}


function routeOrtho(a, b, { chamfer = 16 } = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 || dy === 0) return `M${a[0]},${a[1]} L${b[0]},${b[1]}`;
  const sx = Math.sign(dx), sy = Math.sign(dy);
  const c = Math.min(chamfer, Math.abs(dx) / 2, Math.abs(dy) / 2);
  if (Math.abs(dx) >= Math.abs(dy))
    return `M${a[0]},${a[1]} L${b[0] - sx * c},${a[1]} L${b[0]},${a[1] + sy * c} L${b[0]},${b[1]}`;
  return `M${a[0]},${a[1]} L${a[0]},${b[1] - sy * c} L${a[0] + sx * c},${b[1]} L${b[0]},${b[1]}`;
}

/* ---------- 05 连线流动 · 电互联（段落流底盘 + 辉光粒子簇节拍） ----------
   底盘：等宽 dash 段串（butt 方切 → 肉眼段落感）linear 匀速低透明行进（略慢）。
   节拍：粒子簇——每簇 5–8 粒、粒径随机、辉光（自动注入 #mo-eglow filter），
   同线共用 cycleS 周期匀速走线，簇内 begin 散布聚成粒子团、两簇错半周期
   → 每 cycleS/2 一簇通过。底线建议 stroke-width 2.5（与本流等宽）、
   stroke-linejoin:miter，路径用 elecEdgePath 生成 90°/45° 电路折线。
   用法：const pulse = Motion.attachElectricPulse(dotsGroup, edgeDs); pulse.clear(); */
function attachElectricPulse(group, pathDs, {
  width = 2.5,             // 与电互联底线等宽（稍粗）
  dash = 7, gap = 11,      // 段/隙：段落感底盘
  segSpeedPxS = 90,        // 段落流略慢匀速
  segOpacity = .3,         // 底盘低透明（节拍交给粒子簇）
  cycleS = 2.6,            // 粒子走线周期 · 提案值待注册（--loop-elec）
  groupsPerLine = 2,       // 两簇错半周期 → 每 cycleS/2 一簇 = 节拍
  minP = 5, maxP = 8,      // 每簇粒子数 5–8
  rMin = .9, rMax = 1.9,   // 粒径随机
  spreadS = .42,           // 簇内 begin 散布（约 16% 线长粒子团）
  pOpacity = .9,
  lineColor = '255,255,255', // 段落流底盘：半透明白（随电互联连线配色）
  color = '255,255,255',   // 粒子：半透明白（与折角白线同色系，靠辉光与亮度区分层次）
} = {}) {
  if (REDUCED) return { clear() {} };
  const NS = 'http://www.w3.org/2000/svg';
  /* 辉光 filter：按需注入宿主 svg 的 defs（幂等） */
  const svg = group.ownerSVGElement;
  if (svg && !svg.querySelector('#mo-eglow')) {
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild); }
    defs.innerHTML += `<filter id="mo-eglow" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  }
  const pitch = dash + gap;
  pathDs.forEach((d, i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', `rgba(${lineColor},${segOpacity})`);
    p.setAttribute('stroke-width', width);
    p.style.strokeDasharray = `${dash} ${gap}`;
    group.appendChild(p);
    p.animate([{ strokeDashoffset: '0' }, { strokeDashoffset: String(-pitch) }],
      { duration: pitch / segSpeedPxS * 1000, iterations: Infinity, easing: 'linear' });
    if(i>=8)return;
    const base = 0.3 + Math.min(i, 7) * 0.12;
    for (let g = 0; g < groupsPerLine; g++) {
      const gBegin = base + g * cycleS / groupsPerLine;
      const n = minP + Math.floor(Math.random() * (maxP - minP + 1));
      for (let k = 0; k < n; k++) {
        const r = (rMin + Math.random() * (rMax - rMin)).toFixed(2);
        const b = (gBegin + Math.random() * spreadS).toFixed(2);
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', r); c.setAttribute('fill', `rgb(${color})`);
        c.setAttribute('opacity', '0'); c.setAttribute('filter', 'url(#mo-eglow)');
        c.innerHTML =
          `<animateMotion dur="${cycleS}s" begin="${b}s" repeatCount="indefinite" path="${d}"/>` +
          `<animate attributeName="opacity" dur="${cycleS}s" begin="${b}s" repeatCount="indefinite" values="0;${pOpacity};${pOpacity};0" keyTimes="0;.04;.96;1"/>`;
        group.appendChild(c);
      }
    }
  });
  return { clear() { group.getAnimations({subtree:true}).forEach(a=>a.cancel());group.innerHTML = ''; } };
}



return {springTo,SPRING,REDUCED,attachOpticalFlow,attachElectricPulse,routeOrtho};})();

// User-requested motion scopes: optical fibers only; cabinet focus is disabled.
zoomTo=function(){S.zoom=null;cam={...CAM0};camT={...CAM0};syncZoomBtn();render()};
