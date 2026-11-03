export function runEntrance() {
const screen=document.getElementById('screen');
 if(!screen)return;
 const groups=[
  ['.agent-panel,#home-metrics',0,700,26,0],
  ['.cabinet-floor-extension,.timeline-backdrop,.cabinet-shade,.cabinet-art,.cabinet-npu-art,.cabinet-hbm-art,.cabinet-energy-art,.cabinet-links,.cabinet-fault-link,.cabinet-red,.node-summary,#home-tips',120,700,26,0],
  ['.timeline,.flip,.cabinet-energy-legend',240,700,26,0],
  ['.guard-summary,.health-metrics,.energy-metrics,#home-events',120,900,22,160]
 ];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 screen.classList.remove('home-entrance-pending');
 if(reduced)return;
 groups.forEach(([selector,delay,duration,dy,stagger])=>{
  screen.querySelectorAll(selector).forEach((el,i)=>{
   const opacity=getComputedStyle(el).opacity;
   const animation=el.animate([
    {opacity:0,translate:`0 ${dy}px`,scale:stagger?'1':'.975'},
    {opacity,translate:'0 0',scale:'1'}
   ],{duration,delay:delay+Math.min(i,7)*stagger,easing:'cubic-bezier(0,0,0,1)',fill:'both'});
   animation.finished.then(()=>animation.cancel()).catch(()=>{});
  });
 });
}

export function mountEntrance() {
  if (document.readyState === "complete") setTimeout(runEntrance, 0);
  else window.addEventListener("load", runEntrance, { once: true });
}
