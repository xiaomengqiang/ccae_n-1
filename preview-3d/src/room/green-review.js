function greenReviewData(){D.pods.forEach(p=>p.npu.forEach(b=>b.cards.forEach(c=>{if(c.reviewGreenValue!=null)c.util=c.reviewGreenValue;})));}
function greenReviewFinish(){
 const legend=$('r4-legend');legend?.querySelectorAll('svg').forEach(svg=>{svg.querySelectorAll('text').forEach(t=>{if(t.textContent==='LPO')t.remove();});});
 if(S.mode==='util')document.querySelectorAll('#r4-legend .fiber-legend path,#r4-legend .electric-legend path,#stageInner .fiber-legend path').forEach(p=>{p.setAttribute('stroke','#9ba7ad');p.style.stroke='#9ba7ad';});
 if(S.mode==='health'){
 const svg=$('stageInner').querySelector('.r2-home-svg');if(!svg)return;const bad=new Set(D.pods.flatMap(p=>p.sw).filter(sw=>swHasBadOm(sw)||sw.status!=='ok').map(sw=>sw.id)),paths=new Set();
 svg.querySelectorAll('.fiber-link[data-l1],.r7-rack-link[data-l1]').forEach(p=>{if(bad.has(p.dataset.l1)){p.setAttribute('stroke','#e7434a');p.style.stroke='#e7434a';p.setAttribute('opacity','.8');p.setAttribute('stroke-width','1.1');paths.add(p.getAttribute('d'));}});
 svg.querySelectorAll('.optical-flow path').forEach(p=>{if(paths.has(p.getAttribute('d'))){p.setAttribute('stroke','#e7434a');p.style.stroke='#e7434a';}});
 }
}
const greenReviewRender=render;render=function(){greenReviewData();greenReviewRender();greenReviewFinish();};
const greenReviewRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){greenReviewData();greenReviewRefresh();greenReviewFinish();};if(window.__roomBooted)render();

// Cabinet-specific contiguous patches, rather than repeating the same row mix.
