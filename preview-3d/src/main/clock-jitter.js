/* ================== 时钟 / 抖动 ================== */

/* 抖动只在档位区间内走，跨不了档 —— 所以绿/青/粉红 的数量永远等于配额。 */
const UB={idle:[0,0],   low:[10,28],  norm:[72,88],   hot:[92,97]};      // 利用率 %（常态中位 80，与 KPI 口径一致）
const PB={low:[308,328],norm:[336,358],warm:[366,384],hot:[390,396]};    // 单卡功耗 W
const DB={idle:[0,0],   low:[6,30],   norm:[66,92],   hot:[90,99]};      // DIE 利用率 %
const cl=(v,b)=>Math.max(b[0],Math.min(b[1],v));
setInterval(()=>{
  if(document.hidden||parent!==window)return;
  D.pods.forEach(p=>p.npu.forEach(b=>b.cards.forEach(k=>{
    if(k.status!=='ok')return;
    k.util=cl(k.util+Math.round(rr(-1,1)), UB[k.uc]||UB.norm);
    k.pwr =cl(k.pwr +Math.round(rr(-1,1)), PB[k.pc]||PB.norm);
    const db=DB[k.uc]||DB.norm;
    k.dies.forEach(d=>d.util=cl(d.util+Math.round(rr(-1,1)),db));
  })));
  LINKS.forEach(l=>{if(l.status==='ok')l.bw=cl(l.bw+Math.round(rr(-1,1)), l.hot?[92,96]:l.deg?[52,60]:[62,86])});
  updateSlowTelemetry();
  renderKPI();
  if(!window.CCAE_LIGHT)refreshLiveOverlays();
  /* 悬浮在故障气泡、或在带「原因 / 处理建议」的悬浮卡（.wide）上时不重绘 ——
     那种卡是拿来读的，每 3.2s 跳一次数字读不完（首页故障卡合并后尤其明显） */
  // Update live metrics without rebuilding the rack SVG and restarting optical animations.
},window.CCAE_LIGHT?15000:6000);


syncNav(); renderBiz();
renderKPI(); if(window.__roomBooted)render();

