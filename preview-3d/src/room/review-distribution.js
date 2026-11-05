const reviewMidLoadCards=D.pods.flatMap(p=>p.npu.flatMap(b=>b.cards));
D.pods.slice(0,14).forEach((p,pi)=>{
 p.npu.forEach((b,bi)=>{
  // Vary run length (3–6) and offset per row, retaining 512 middle-tier cards in total.
  const counts=pi<8?[4,5,5,6,5,4,6,5]:[3,5,4,4,5,3,4,4];
  const count=counts[(bi+pi*3)%8],start=hashOf(b.id+':cluster')%(9-count);
  b.cards.forEach((c,ci)=>{if(ci>=start&&ci<start+count){c.util=35+hashOf(c.id+':mid')%210/10;c.reviewMidLoad=true;}else if(c.status==='ok'){c.util=66+hashOf(c.id+':high')%210/10;}});
 });
});
function reviewL2Palette(){
 if(S.mode==='health')return;
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('[data-act="netdev"]').forEach(g=>{
  g.querySelectorAll('rect').forEach(r=>{if(r.closest('[data-act]')!==g)return;const f=r.getAttribute('fill');if(f&&f!=='none'&&f!=='transparent'){r.setAttribute('fill','#8fe5c2');r.setAttribute('fill-opacity','.8');}if(r.getAttribute('stroke')&&r.getAttribute('stroke')!=='none')r.setAttribute('stroke','#8fe5c2');});
  g.querySelectorAll('text').forEach(t=>{t.setAttribute('fill','#35393d');t.style.fill='#35393d';});
 });
}
const reviewDistributionRefresh=refreshLiveOverlays;
refreshLiveOverlays=function(){reviewMidLoadCards.forEach(c=>{if(c.reviewMidLoad)c.util=Math.max(30,Math.min(59.9,c.util));});reviewDistributionRefresh();reviewL2Palette();};
const reviewDistributionRender=render;render=function(){reviewDistributionRender();reviewL2Palette();};
if(window.__roomBooted)render();

// Separate load and power distributions for the requested cabinet zones.
D.pods.forEach((p,pi)=>p.npu.forEach((b,bi)=>b.cards.forEach((c,ci)=>{
 const seed=hashOf(c.id+':power-zone');
 if(pi>=14)c.pwr=seed%10<8?55+seed%35:130+seed%75;
 else if(pi<3){const start=hashOf(b.id+':power-run')%4,count=3+hashOf(b.id+':width')%3;const green=ci>=start&&ci<start+count||seed%19===0;c.pwr=green?145+seed%80:315+seed%65;}
 if(pi>=14||pi<3)c.reviewPower=c.pwr;
 if(pi>=3&&pi<=12){const green=hashOf(c.id+':sparse-load')%13===0;c.reviewMidLoad=green;c.util=green?36+seed%18:68+seed%20;}
})));
if(window.__roomBooted)render();
function restoreReviewPower(){D.pods.forEach(p=>p.npu.forEach(b=>b.cards.forEach(c=>{if(c.reviewPower!=null)c.pwr=c.reviewPower;})));}
const zoneRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){restoreReviewPower();zoneRefresh();};
const zoneRender=render;render=function(){restoreReviewPower();zoneRender();};if(window.__roomBooted)render();

// Fan status: translucent disc and an opaque rotor in the same status color.
