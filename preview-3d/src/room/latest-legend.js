const latestLegendIcon=componentLegendIcon;
componentLegendIcon=function(name,glyph){const file={'内存':'r2-cpu-memory.png','硬盘':'r2-cpu-disk.png','电源':'r2-cpu-power.png'}[name];
 if(file)return '<svg viewBox="0 0 28 28" width="28" height="28" aria-label="'+name+'">'+r2Image(file,0,0,28,28)+'</svg>';
 if(name==='风扇')return '<svg viewBox="0 0 28 28" width="28" height="28" aria-label="风扇"><circle cx="14" cy="14" r="13" fill="#63c995" fill-opacity=".25"/>'+fanBladesMarkup().replace('#35393d','#63c995')+'</svg>';
 return latestLegendIcon(name,glyph);
};
function latestTree(){
 const tree=$('tree'),target=reviewBoardTarget();let branch=false;
 tree.querySelectorAll('.tn').forEach(el=>{
  if(/^P\d+$/.test(el.dataset.id||'')||/^NET/.test(el.dataset.id||''))branch=openSet.has(el.dataset.id);
  el.classList.toggle('latest-subtree',branch&&!/^P\d+$/.test(el.dataset.id||''));
  el.classList.toggle('review-parent',!!target&&(el.dataset.id===target.owner||el.dataset.id===target.owner+'/'+target.category));
 });
}
const latestBuildTree=buildTree;buildTree=function(){latestBuildTree();latestTree();};
function latestScene(){
 latestTree();const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('text').forEach(t=>{if(t.textContent.startsWith('整板功耗'))t.remove();});
 if(S.view.t==='cpublade'){
  const selected=S.sel?.t==='cpu2'||S.view.zoomCpu===0||S.view.zoomCpu===1;
  svg.querySelectorAll('[data-act="part"]').forEach(g=>{g.setAttribute('opacity',selected?'.26':'1');if(S.mode==='health')g.querySelectorAll('image').forEach(im=>im.style.filter='brightness(1.5)');});
  svg.querySelectorAll('[data-act="cpu2"] > rect').forEach(r=>{if(+r.getAttribute('width')>150&&r.getAttribute('fill')!=='none'){r.setAttribute('fill','#353535');r.removeAttribute('fill-opacity');}});
 }
 if(S.mode==='pwr'){
  svg.querySelectorAll('[data-act="netdev"],[data-act="swblade"],[data-act="uchip"],[data-act="udie"],.r2-uport').forEach(g=>{
   g.querySelectorAll('rect').forEach(r=>{const fill=r.getAttribute('fill');if(fill&&fill!=='none'&&fill!=='transparent'){r.setAttribute('fill','#949494');r.style.fill='#949494';if(r.getAttribute('stroke')&&r.getAttribute('stroke')!=='none')r.setAttribute('stroke','#949494');r.setAttribute('fill-opacity','.8');}});
   g.querySelectorAll('text').forEach(t=>{if(/(?:W|kW|%)$/.test(t.textContent.trim()))t.textContent='无计量';});g.setAttribute('aria-label',(g.dataset.id||'L1/L2')+' 无计量');
  });
  svg.querySelectorAll('[data-act="cpu2"]').forEach(g=>{const ts=g.querySelectorAll('text');if(ts.length===2&&/%$/.test(ts[1].textContent)){const {board}=modeDeviceContext({...g.dataset,t:'cpu2'});ts[1].textContent=cpuDemoPower(board,+g.dataset.id.slice(-1))+'W';}});
 }
 reviewGrayLoadLinks();
}
const latestRender=render;render=function(){latestRender();latestScene();};
const latestRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){latestRefresh();latestScene();};
if(window.__roomBooted)render();

// Back-side optical modules form irregular contiguous low-load patches.
D.pods.forEach((p,pi)=>p.sw.forEach((sw,si)=>{
 const start=hashOf(sw.id+':green-start')%20,count=10+hashOf(sw.id+':green-count')%9;
 sw.omBw=sw.omBw.map((v,q)=>{const seed=hashOf(sw.id+':module:'+q),inRun=(q-start+32)%32<count;
 return (inRun?seed%11!==0:seed%9===0)?36+seed%210/10:seed%17===0?20+seed%8:66+seed%230/10;
 });
}));
if(window.__roomBooted)render();

