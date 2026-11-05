const unionReviewPick=pick;
pick=function(p){
 if(S.view.t==='uchip'&&p.t==='om'){
  const P=findPod(S.view.pod),sw=P?.sw.find(b=>b.id===S.view.blade),u=sw?.chipList.findIndex(c=>c.id===S.view.id),om=+p.id.split('-M').pop();
  if(!sw||p.blade!==sw.id||u<0||u>=16||Math.floor(om/4)!==omGrpOf(u))return;
 }
 unionReviewPick(p);
};
const unionReviewDrill=drill;
drill=function(p){
 if(p?.t==='om'&&S.view.t==='uchip'){
  closeUnpinned();hideHover();S.sel=p;go({lv:'blade',t:'swblade',id:p.blade,pod:p.pod});return;
 }
 unionReviewDrill(p);
};
function unionReviewFinish(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 // Labels only inside colored device blocks, never headings or board illustrations.
 svg.querySelectorAll('[data-act="netdev"] > text').forEach(t=>{t.textContent=t.textContent.replace(/灵衢\s*/g,'LingQu ');});
 const row=$('r4-legend');if(row)row.querySelectorAll('span').forEach(t=>{t.textContent=t.textContent.replace(/灵衢\s*/g,'LingQu ');});
 if(S.view.t!=='uchip'||S.sel?.t!=='om')return;
 const om=+S.sel.id.split('-M').pop(),dim=new Set();
 svg.querySelectorAll('.r4-lane-link,.r4-l2-link').forEach(p=>{
  const on=p.classList.contains('r5-om-'+om);if(!on){p.style.stroke='#777';p.setAttribute('stroke','#777');}p.style.opacity=on?'0.8':'0.12';p.setAttribute('opacity',on?'.8':'.12');if(!on)dim.add(p.getAttribute('d'));
 });
 svg.querySelectorAll('.optical-flow path').forEach(p=>{if(dim.has(p.getAttribute('d'))){p.style.opacity='0.04';p.style.stroke='#777';}});
}
const unionReviewRender=render;render=function(){unionReviewRender();unionReviewFinish();};
const unionReviewRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){unionReviewRefresh();unionReviewFinish();};
if(window.__roomBooted)render();

// Board overview selections show only physical one-hop neighbors.
