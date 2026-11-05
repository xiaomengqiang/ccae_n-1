const telemetryBases=new WeakMap();
function telemetryStep(o,key,min=0,max=100,step=1){
 if(!o||!Number.isFinite(o[key])||o.status==='err')return;
 let base=telemetryBases.get(o);if(!base){base={};telemetryBases.set(o,base)}
 if(base[key]==null)base[key]=o[key];
 o[key]=Math.round(cl(o[key]+rr(-step,step),[Math.max(min,base[key]-step*5),Math.min(max,base[key]+step*5)])*10)/10;
}
function updateSlowTelemetry(){
 D.pods.forEach(p=>{
  telemetryStep(p.pwr,'kw',0,100,.12);
  p.cpu.forEach(b=>{if(b.biz)telemetryStep(b,'util',0,100,1);telemetryStep(b,'pwrp',0,100,.6);
   b.cpus.forEach(c=>{if(b.biz)telemetryStep(c,'util',0,100,1)})});
  [...p.sw,...p.io].forEach(b=>{telemetryStep(b,'bw',0,100,1);telemetryStep(b,'pwrp',0,100,.6);b.chipList?.forEach(c=>telemetryStep(c,'bw',0,100,1))});
 });
 D.nets.forEach(n=>{telemetryStep(n.pwr,'kw',0,100,.08);n.dev.forEach(d=>{telemetryStep(d,'bw',0,100,1);telemetryStep(d,'pwrp',0,100,.6);d.chipList?.forEach(c=>{telemetryStep(c,'bw',0,100,1);telemetryStep(c,'pwrp',0,100,.6)})})});
}
function refreshLiveOverlays(){
 if(S.mode==='health'||rackPlayback)return;
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('filter[id^="mode-tint-"]').forEach(f=>{const defs=f.parentElement;f.remove();if(!defs.children.length)defs.remove()});
 applyModeColors(svg);fillL2Devices(svg);
 if(svg.classList.contains('r2-home-svg'))svg.querySelectorAll('[data-act="npublade"],[data-act="cpublade"]').forEach(g=>{
  const t={...g.dataset,t:g.dataset.act},b=findObj(t.t,t.id,t);if(!b)return;
  const cells=[...g.querySelectorAll(':scope > rect')].filter(r=>+r.getAttribute('width')<40&&+r.getAttribute('height')<25);
  const cards=b.cards||b.cpus||[];
  cells.forEach((r,i)=>{const c=cards[Math.floor(i*cards.length/cells.length)];if(c)r.setAttribute('fill',heat(S.mode==='pwr'?(b.cards?pwrPct(c):powerBand(hashOf(b.id+':cpu-power:'+i)%10<2?65+hashOf(b.id+i)%30:hashOf(b.id+':cpu-power:'+i)%10<7?140+hashOf(b.id+i)%80:275+hashOf(b.id+i)%85)):c.util))});
 });
 svg.querySelectorAll('[data-act="npu"] text').forEach(text=>{
  if(!/^利用率 \d+(?:\.\d+)?%$/.test(text.textContent))return;
  const g=text.closest('[data-act="npu"]'),t={...g.dataset,t:'npu'},k=findObj(t.t,t.id,t);
  if(k&&S.mode==='util')text.textContent='利用率 '+k.util+'%';
 });
}

/* ================== 页面入场编排 ==================
   沿用动效体系 ⑬「页面入场编排」的分组原则：
     · 同类元素 / 同排元素打成一组，组内同时出场，仅组与组之间错帧（stagger-loose 80ms）
     · 顺序遵循「由上到下、由左到右」：顶栏 → 左侧面板 → 中部舞台 → 浮层
     · 导航骨架（顶栏）不做位移，只做透明度，避免框架晃动
     · 位移一律自下而上；时长 duration-xxl 700ms · ease-decelerate-gentle（极缓收尾）
   实现为纯叠加逻辑，不改动任何既有渲染代码。 */
(function(){
  var GROUPS=[
    {sel:'#top',              at:0,   dy:0,  soft:false},  /* ① 顶栏：仅透明度 */
    {sel:'#left',             at:80,  dy:22, soft:false},  /* ② 左侧导航/资源树 */
    {sel:'#stage-bar',        at:160, dy:18, soft:false},  /* ③ 面包屑工具条 */
    {sel:'#stage',            at:240, dy:26, soft:true },  /* ④ 中部舞台（大面积 → soft） */
    {sel:'#kpifloat,#flipBtn',at:320, dy:18, soft:false}   /* ⑤ 浮层：KPI 与翻转按钮 */
  ];
  var DUR=700;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play(){
    GROUPS.forEach(function(g){
      var els=[].slice.call(document.querySelectorAll(g.sel));
      els.forEach(function(el){
        if(!el) return;
        if(reduce){el.style.opacity=1;return}
        el.style.opacity=0;
        var from=g.dy?{opacity:0,transform:'translateY('+g.dy+'px)'}:{opacity:0};
        var to  =g.dy?{opacity:1,transform:'none'}:{opacity:1};
        el.animate([from,to],{
          duration:DUR, delay:g.at,
          easing:g.soft?'cubic-bezier(.20,0,.10,1)':'cubic-bezier(0,0,0,1)',
          fill:'forwards'
        });
      });
    });
  }
  /* 等首帧渲染完成后再播，避免与 render() 抢同一帧 */
  requestAnimationFrame(function(){requestAnimationFrame(play)});
})();



// Review 2026-09-14: deterministic per-CPU demo watts, not measured telemetry.
