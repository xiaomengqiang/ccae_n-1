function reviewTintOpacity(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 const active=S.mode!=='health',colors=new Set(modePalette().map(c=>c.toLowerCase()));
 svg.querySelectorAll('[data-review-opacity]').forEach(el=>{el.removeAttribute(el.dataset.reviewOpacity);delete el.dataset.reviewOpacity;});
 if(active)svg.querySelectorAll('rect,circle,path,polygon,image').forEach(el=>{
  const tint=(el.getAttribute('filter')||'').match(/mode-tint-([0-3])-/);
  const attr=tint?'opacity':colors.has((el.getAttribute('fill')||'').toLowerCase())?'fill-opacity':colors.has((el.getAttribute('stroke')||'').toLowerCase())?'stroke-opacity':null;
  if(attr){el.setAttribute(attr,'.8');el.dataset.reviewOpacity=attr;}
 });
 const legend=$('r4-legend');if(legend){
  legend.querySelectorAll('.legend-row:last-child i').forEach((el,i)=>el.style.opacity=active&&i<4?'.8':'1');
  legend.style.flexDirection='row';legend.style.gap='24px';
  const row=legend.querySelector('.legend-row+.legend-row');if(row){row.style.borderLeft='1px solid #72777a';row.style.paddingLeft='24px';}
 }
}
const reviewTintRender=render;render=function(){reviewTintRender();reviewTintOpacity();};
const reviewTintRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){reviewTintRefresh();reviewTintOpacity();};
if(window.__roomBooted)render();

// Keep the navigation anchored to the board being viewed, including chip drilldown.
function reviewBoardTarget(){
 const v=S.view;if(S.nav!=='res'||!['blade','card','chip'].includes(v.lv))return null;
 const id=v.blade||v.dev||v.id,owner=v.pod||v.cab;
 const pod=owner&&findPod(owner),net=owner&&D.nets.find(n=>n.id===owner);
 const boards=pod?[...pod.npu,...pod.cpu,...pod.sw,...pod.io,pod.mgmt,pod.pwr,...(CATS.find(c=>c.k==='power')?.get(pod)||[])]:net?[...net.dev,net.pwr]:[];
 const board=boards.find(b=>b&&(b.id===id||String(id).startsWith(b.id+'-')));
 if(!board)return null;
 return {id:board.id,owner,category:pod?CATOF[board.kind]:null};
}
let reviewBoardKey='';
const reviewBoardRender=render;
render=function(){
 const target=reviewBoardTarget(),key=target?target.id:'',changed=key!==reviewBoardKey;
 if(target&&changed){
  openSet.clear();openSet.add('root');openSet.add(target.owner);
  if(target.category)openSet.add(target.owner+'/'+target.category);
  S.q='';S.filter='all';$('q').value='';
  $('tabs').querySelectorAll('[data-f]').forEach(el=>el.classList.toggle('on',el.dataset.f==='all'));
 }
 reviewBoardRender();reviewBoardKey=key;
 const tree=$('tree');tree.querySelectorAll('.review-current,.review-parent').forEach(el=>el.classList.remove('review-current','review-parent'));
 if(target){
  let current=null;
  tree.querySelectorAll('.tn').forEach(el=>{
   el.classList.remove('sel');el.removeAttribute('aria-current');
   if(el.dataset.id===target.id){el.classList.add('review-current');el.setAttribute('aria-current','true');current=el;}
   if(el.dataset.id===target.owner||el.dataset.id===target.owner+'/'+target.category)el.classList.add('review-parent');
  });
  if(changed&&current)current.scrollIntoView({block:'nearest'});
 }
 // Fit the single-line legend to the stage while keeping its groups separated.
 const legend=$('r4-legend');if(legend){const available=$('stageInner').clientWidth-48;const scale=Math.min(1.2,available/Math.max(legend.scrollWidth,1));legend.style.transform='translateX(-50%) scale('+scale+')';}
};
if(window.__roomBooted)render();

