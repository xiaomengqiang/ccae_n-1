const cabinetLoadProfiles=[0,10,4,0,19,7,14,3,0,12,6,22,0,9];
D.pods.forEach((p,pi)=>{
 const yellow=cabinetLoadProfiles[pi%14],start=(pi*19+11)%64;
 if(pi<14)p.npu.forEach((b,bi)=>b.cards.forEach((c,ci)=>{
  const position=bi*8+ci,edge=(position-start+64)%64;
  const isYellow=edge<yellow;
  c.reviewMidLoad=!isYellow;c.reviewGreenValue=isYellow?67+hashOf(c.id+':cabinet')%190/10:35+hashOf(c.id+':cabinet')%220/10;c.util=c.reviewGreenValue;
 }));
 const backCount=[0,22,8,0,38,15,28,5,0,25,12,44,0,18,7,0][pi];
 const backStart=(pi*37+9)%128;
 p.sw.forEach((sw,si)=>{sw.omBw=sw.omBw.map((v,q)=>{const position=si*32+q,edge=(position-backStart+128)%128;return edge<backCount?66+hashOf(sw.id+q)%210/10:35+hashOf(sw.id+q)%220/10;});});
});
if(window.__roomBooted)render();

// Expanded device shells share an opaque mode border and translucent interior.
function chipModeShells(){
 if(S.mode==='health')return;const svg=$('stageInner').querySelector('.r2-board-svg');if(!svg)return;
 const paint=(r,col)=>{r.setAttribute('fill',col);r.style.fill=col;r.setAttribute('fill-opacity','.18');r.setAttribute('stroke',col);r.style.stroke=col;r.setAttribute('stroke-opacity','1');r.setAttribute('stroke-width','3');delete r.dataset.reviewOpacity;};
 if(svg.classList.contains('r3-card-svg')){
 const p=findPod(S.view.pod),b=p?.npu.find(b=>b.id===S.view.blade),c=b?.cards.find(c=>c.id===S.view.id);
 if(c){const col=heat(S.mode==='pwr'?powerBand(c.pwr):c.util);svg.querySelectorAll(':scope > rect').forEach(r=>{if(+r.getAttribute('width')===384&&+r.getAttribute('height')===286)paint(r,col);});}
 }
 svg.querySelectorAll('[data-act="cpu2"]').forEach(g=>{
 const rects=[...g.querySelectorAll(':scope > rect')].filter(r=>+r.getAttribute('width')>150);if(!rects.length)return;
 const t={...g.dataset,t:'cpu2'},value=modeDeviceValue(t),col=value==null?'#949494':heat(value);
 paint(rects[0],col);rects.slice(1).forEach(r=>{r.setAttribute('fill','none');r.style.fill='none';r.setAttribute('stroke','none');r.style.stroke='none';});
 });
}
const chipShellRender=render;render=function(){chipShellRender();chipModeShells();};
const chipShellRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){chipShellRefresh();chipModeShells();};if(window.__roomBooted)render();

// Overview L1/L2 energy colors, predominantly green with cabinet-local variation.
