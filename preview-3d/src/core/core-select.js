
// Replace this list with the authorized supernode list from the production API.
// Both demo nodes intentionally use the supplied fixture; these are not real node inventories.
window.CCAE_CORE_CONFIG = {
  nodes: [
    {id:'superpod-01', name:'超节点-1024', demo:true},
    {id:'superpod-02', name:'超节点-1024-02', demo:true}
  ],
  initialNodeId:'superpod-01'
};

/* Full design: retain current fixtures and presentation without release scope gates. */
(()=>{
'use strict';
const boardTypes=new Set(['npublade','cpublade','swblade']);
const config=window.CCAE_CORE_CONFIG;
let current=config.nodes.find(n=>n.id===config.initialNodeId)||config.nodes[0];
const snapshots=new Map();
const snapshot=()=>structuredClone({data:D,links:LINKS,bubbles:BUBBLES,omBad:OMBAD});
const fixture=snapshot();
config.nodes.forEach(n=>{
 const data=structuredClone(fixture);
 if(n.id==='superpod-02'){
  const names=['NPU 温度超过阈值','HBM ECC 错误','总线网络 CQE 故障'];
  [1,2,3,4,5,6,12,13].forEach((pi,group)=>{
   const pod=data.data.pods[pi];
   for(let bi=0;bi<(group===0?1:3);bi++){
    const board=pod.npu[bi];board.status='err';
    for(let ci=0;ci<2;ci++){
     const card=board.cards[ci];card.status='err';
     for(let ai=0;ai<(ci===0?2:1);ai++)data.bubbles.push({key:`dense-${card.id}-${ai}`,at:{v:'npucard',id:card.id},go:{t:'npu',id:card.id,pod:pod.id,blade:board.id},name:names[(bi+ci+ai)%3],sev:ai?'重要':'紧急',ts:'2026-10-15 10:24:00',impact:['该器件运行异常，可能影响任务稳定性'],fix:['检查设备状态并处理故障'],svc:['模型训练任务']});
    }
   }
   const sw=pod.sw[0];sw.status='err';data.omBad[sw.id]=[0,1];
   for(let oi=0;oi<2;oi++)data.bubbles.push({key:`dense-${sw.id}-${oi}`,at:{v:'swblade',id:sw.id},go:{t:'om',id:sw.id+'-M'+oi,pod:pod.id,blade:sw.id},name:`光模块 ${oi+1} 链路异常`,sev:'重要',ts:'2026-10-15 10:24:00',impact:['上行链路异常'],fix:['检查光模块与连接'],svc:['模型训练任务']});
  });
 }
 if(n.id==='superpod-02'){
  for(const [pi,bi,ci,name] of [[2,0,0,'CPU 温度超过阈值'],[8,4,1,'CPU 硬件错误'],[12,2,0,'CPU 运行异常']]){
   const pod=data.data.pods[pi],board=pod.cpu[bi],cpu=board.cpus[ci];board.status='err';cpu.status='err';
   data.bubbles.push({key:'cpu-demo-'+cpu.id,at:{v:'cpucard',id:cpu.id},go:{t:'cpu2',id:cpu.id,pod:pod.id,blade:board.id},name,sev:'紧急',ts:'2026-10-20 10:24:00',rootCause:name+'，需结合硬件日志确认具体原因。',impact:['可能影响节点任务运行'],fix:['检查硬件日志、散热和部件状态，按诊断结果处理。'],svc:[]});
   const peer=board.cpus[1-ci];peer.status='err';
   data.bubbles.push({key:'cpu-demo-'+peer.id,at:{v:'cpucard',id:peer.id},go:{t:'cpu2',id:peer.id,pod:pod.id,blade:board.id},name:'CPU 内部错误',sev:'紧急',ts:'2026-10-20 10:24:00',rootCause:'CPU 内部错误'+'，需结合硬件日志确认具体原因。',impact:['可能影响节点任务运行'],fix:['检查硬件日志、散热和部件状态，按诊断结果处理。'],svc:[]});
  }
 }
 snapshots.set(n.id,data);
});
let nodeMenu=null, nodeAnchor=null;
function closeNodeMenu(focus=false){
 nodeMenu?.remove();nodeMenu=null;
 document.querySelectorAll('.core-node-select').forEach(x=>x.setAttribute('aria-expanded','false'));
 if(focus&&nodeAnchor?.isConnected)nodeAnchor.focus();nodeAnchor=null;
}
function openNodeMenu(button){
 if(nodeMenu){closeNodeMenu(true);return}
 nodeAnchor=button;button.setAttribute('aria-expanded','true');
 const menu=document.createElement('div');nodeMenu=menu;menu.id='core-node-menu';menu.className='core-node-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','超节点');
 const rect=button.getBoundingClientRect(),scale=$('screen').getBoundingClientRect().width/$('screen').offsetWidth;
 menu.style.fontSize=(32*scale)+'px';menu.style.width=Math.max(rect.width,560*scale)+'px';
 menu.style.left=Math.min(rect.left,innerWidth-Math.max(rect.width,560*scale)-8)+'px';menu.style.top=(rect.bottom+6*scale)+'px';
 for(const n of config.nodes){
  const item=document.createElement('button');item.type='button';item.className='core-node-option';item.setAttribute('role','option');item.setAttribute('aria-selected',String(n.id===current.id));item.dataset.nodeId=n.id;
  const label=document.createElement('span');label.textContent=n.name;const tick=document.createElement('span');tick.className='core-node-check';tick.textContent=n.id===current.id?'✓':'';item.append(label,tick);
  item.onclick=e=>{e.stopPropagation();closeNodeMenu();switchNode(n.id);document.querySelector('.core-pod-card .core-node-select')?.focus()};menu.append(item);
 }
 menu.onkeydown=e=>{const items=[...menu.children],index=items.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus()}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeNodeMenu(true)}if(e.key==='Tab')closeNodeMenu(true)};
 document.body.append(menu);menu.querySelector('[aria-selected="true"]').focus();
}
document.addEventListener('pointerdown',e=>{if(nodeMenu&&!nodeMenu.contains(e.target)&&!e.target.closest('.core-node-select'))closeNodeMenu()});
addEventListener('resize',()=>closeNodeMenu());
function selector(){
 const button=document.createElement('button');button.type='button';button.className='core-node-select';button.setAttribute('aria-label','切换超节点');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','core-node-menu');
 button.innerHTML='<span class="core-node-label"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
 button.querySelector('span').textContent=current.name;
 ['pointerdown','dblclick'].forEach(event=>button.addEventListener(event,e=>e.stopPropagation()));
 button.onclick=e=>{e.stopPropagation();openNodeMenu(button)};
 button.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(!nodeMenu)openNodeMenu(button)}};return button;
}
function decorate(){
 $('screen').dataset.coreNode=current.id;

 const collapse=$('hf-collapse'),heading=$('hf-pod-heading');
 if(collapse&&collapse.parentElement!==heading)heading.append(collapse);
 $('navseg').hidden=false;
 if(heading){const strong=heading.querySelector('strong');if(strong)strong.replaceWith(selector())}
 const card=$('kpis').querySelector('.hf-pod-card');
 if(card&&!card.classList.contains('core-pod-card')){const box=document.createElement('div');box.className='hf-pod-card core-pod-card';box.append(selector());const toggle=document.createElement('button');toggle.type='button';toggle.className='core-tree-open';toggle.setAttribute('aria-label','展开资源树');toggle.title='展开资源树';toggle.innerHTML=$('hf-collapse').innerHTML;toggle.onclick=e=>{e.stopPropagation();hfSetTree(true)};box.prepend(toggle);
 const search=document.createElement('button');search.type='button';search.className='hf-card-search';search.textContent='搜索资源…';search.setAttribute('aria-label','搜索资源');search.onclick=()=>{hfSetTree(true);requestAnimationFrame(()=>$('q').focus())};box.append(search);card.replaceWith(box)}
 const title=$('hf-page-title');if(!title.querySelector('.core-page-tabs')){[...title.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());const tabs=document.createElement('div');tabs.className='core-page-tabs';tabs.setAttribute('role','tablist');tabs.innerHTML='<button type="button" role="tab" aria-selected="false" aria-disabled="true" title="集群总览内容后续开放">集群总览</button><span aria-hidden="true">｜</span><button type="button" role="tab" aria-selected="true">资源视图</button>';title.prepend(tabs)}title.querySelector('.core-top-select')?.remove();
 if(!hfTreeOpen&&S.view.lv!=='cluster'){const select=selector();select.classList.add('core-top-select');title.append(select)}
 
 document.querySelectorAll('.core-node-select').forEach(s=>{s.querySelector('.core-node-label').textContent=current.name});
 const expand=$('hf-expand');expand.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m4-12 4 4-4 4"/></svg>';expand.title='展开资源树';expand.setAttribute('aria-label','展开资源树');$('stage-bar').prepend(expand);expand.hidden=hfTreeOpen||S.view.lv==='cluster';
 $('q').placeholder='搜索机柜 / NPU / CPU / 灵衢互联刀片';



 // Breadcrumb identifies the active supernode as well as the selected cabinet/board.
 const crumb=$('stage-bar').querySelector('.cr');if(crumb)crumb.textContent=current.name;

}
const previousKpi=hfDecorateKPI;hfDecorateKPI=function(){previousKpi();decorate()};
const coreSfu=sfuStage;
sfuStage=function(P,sw,z){
 const svg=r5Doc(coreSfu(P,sw,z));
 // Curves converge at the L2 boundary, with no shared trunk outside the device.
 svg.querySelectorAll('.fiber-link,.r4-l2-link').forEach(p=>{
  const n=(p.getAttribute('d')||'').match(/-?\d+(?:\.\d+)?/g)?.map(Number);if(!n||n.length!==8)return;
  let ax=n[0],ay=n[1],bx=n[6],by=n[7];if(ay===459&&by===368){[ax,bx]=[bx,ax];[ay,by]=[by,ay]}
  if(ay!==368||by!==459)return;
  const x=837+Math.max(0,Math.min(3,Math.round((ax-837)/292)))*292;
  p.setAttribute('d',`M ${bx} 459 C ${bx} 416 ${x} 416 ${x} 368`);
 });
 // The outer board overview omits RoCE links; selected Union details retain native connectivity.
 if(!(z>=0)&&!S.sel)svg.querySelectorAll('.r4-io-link,.core-roce-summary').forEach(p=>p.remove());

 return svg.innerHTML;
};
// Board captions show names only; overview KPIs retain their inventory totals.
const coreStage=stageSVG;
stageSVG=function(inner){
 const markup=coreStage(inner);if(!markup.includes('r2-board-svg'))return markup;
 const svg=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement;
 svg.querySelectorAll('text').forEach(t=>{
  let v=t.textContent;
  v=v.replace(/ · NPU 8 颗$/,'').replace(/\s*·\s*\d+\s*[颗个块条]/g,'').replace(/ · 左侧 8 \/ 右侧 8$/,'');
  if(/^CPU\s+2$/.test(v)&&!t.closest('[data-act="cpu2"]'))v='CPU';
  t.textContent=v;
  if(/^\d+(?:\.\d+)?%$/.test(v)&&t.closest('[data-act="npu"],[data-act="cpu2"]'))t.setAttribute('font-size','17');
 });
 if(S.view.t==='npublade'&&S.view.lv==='blade'){
  // Move the NPU components closer to their heading and bring the following row with them.
  svg.querySelectorAll('[y],[cy]').forEach(el=>{for(const a of ['y','cy'])if(el.hasAttribute(a)){const n=+el.getAttribute(a);if(n>=565)el.setAttribute(a,n-32)}});
  svg.querySelectorAll('rect').forEach(el=>{if(+el.getAttribute('y')===488&&+el.getAttribute('height')===278)el.setAttribute('height','246')});
  svg.querySelectorAll('path[d]').forEach(p=>p.setAttribute('d',p.getAttribute('d').replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(v,x,y)=>`${x} ${+y>=565?+y-32:y}`)));
 }
 return new XMLSerializer().serializeToString(svg);
};
// The cabinet raster contains legacy L2 labels. Mask them beneath the live status cards.
const coreNet=r2Net;
r2Net=function(n,x){
 const svg=r5Doc(coreNet(n,x));
 svg.querySelectorAll('[data-act="netdev"]').forEach(g=>{
  const hit=[...g.querySelectorAll('rect')].find(r=>+r.getAttribute('width')===86);if(!hit)return;
  const base=hit.cloneNode(false);base.setAttribute('class','core-l2-underlay');base.setAttribute('fill','#303333');base.removeAttribute('stroke');base.setAttribute('pointer-events','none');
  g.before(base);
 });return svg.innerHTML;
};
const coreFront=r2Front;r2Front=function(p,x){return coreFront(p,x)+[171,431].map(y=>R2.rect(x+9,r2Y+y+2,74,17,'#363a3b',0)+R2.text(x+46,r2Y+y+14,'RoCE板',10,'#aeb4b6','middle')).join('')};
const previousRender=render;
render=function(){

 previousRender();decorate();
};
function switchNode(id){
 const node=config.nodes.find(n=>n.id===id);if(!node||node.id===current.id)return;
 closeNodeMenu();
 snapshots.set(current.id,snapshot());
 rackPlayback?.();cancelPendingTreeBlade();demoStop();hideHover();closeUnpinned();
 const next=structuredClone(snapshots.get(id));Object.assign(D,next.data);LINKS.splice(0,LINKS.length,...next.links);BUBBLES.splice(0,BUBBLES.length,...next.bubbles);
 Object.keys(OMBAD).forEach(k=>delete OMBAD[k]);Object.assign(OMBAD,next.omBad);
 current=node;S.view={lv:'cluster'};S.sel=null;S.face='front';S.zoom=null;S.q='';S.filter='all';S.nav='res';S.biz=null;S.logic=null;
 $('q').value='';HIST.length=0;openSet.clear();openSet.add('root');lastSelTree=null;hfTreeOpen=false;
 if(window.__roomBooted)render();window.dispatchEvent(new CustomEvent('ccae:supernodechange',{detail:{nodeId:current.id,demo:!!current.demo}}));
}
window.CCAE_CORE={switchNode,getNode:()=>({...current}),getScope:()=>({layers:['health','util','pwr'],boards:CATS.map(c=>c.k),maxLevel:'port',faultShortcutMaxLevel:'chip',business:true})};
if(window.__roomBooted)render();
})();

/* Legend toggles affect scene presentation only; inventory/KPI totals stay unchanged. */
(()=>{
const excluded={health:new Set(),util:new Set()},deviceOff=new Set();
const canvas=document.createElement('canvas').getContext('2d'),colorCache=new Map();
function rgb(value){if(!value||value==='none'||value==='transparent'||value.startsWith('url'))return null;if(colorCache.has(value))return colorCache.get(value);canvas.fillStyle='#000000';canvas.fillStyle=value;const c=canvas.fillStyle;let a=c.startsWith('#')?[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]:c.match(/[\d.]+/g)?.slice(0,3).map(Number);colorCache.set(value,a);return a}
function bucket(value){const c=rgb(value);if(!c)return null;const [r,g,b]=c,max=Math.max(...c),min=Math.min(...c);if(max-min<25)return null;
 if(S.mode==='util'){const palette=modePalette().map(rgb);let best=0,d=Infinity;palette.forEach((p,i)=>{const n=c.reduce((sum,v,j)=>sum+(v-p[j])**2,0);if(n<d){best=i;d=n}});return scaleLabels()[best]}
 if(r>g*1.18&&r>b*1.08)return g>r*.48?'重要':'紧急';if(r>b*1.3&&g>b*1.3)return '次要';if(b>r*1.1&&b>g*1.08)return '提示';return '正常';
}
const typeNames={npu:'NPU',npublade:'NPU',cpu2:'CPU',cpublade:'CPU',uchip:'Union',ichip:'Union芯片',om:'LPO光模块',swblade:'LingQu L1交换板',netdev:'LingQu L2交换机',ioblade:'Union芯片'};
function apply(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('.core-legend-muted,.core-legend-base,.core-overlay-hidden').forEach(el=>el.classList.remove('core-legend-muted','core-legend-base','core-overlay-hidden'));
 const off=excluded[S.mode]||new Set();
 const home=svg.classList.contains('r2-home-svg'),filtered=S.mode==='util'&&off.size>0;
 svg.classList.toggle('core-load-filtered',home&&filtered);
 svg.classList.toggle('core-load-empty',home&&S.mode==='util'&&scaleLabels().every(k=>off.has(k)));
 svg.querySelectorAll('[data-act]').forEach(g=>{let name=typeNames[g.dataset.act];if(g.dataset.act==='part')name=['内存','硬盘','风扇','电源'].find(n=>g.dataset.id.includes(n));if(name&&deviceOff.has(name))g.classList.add('core-legend-muted')});
 if(deviceOff.has('Fiber'))svg.querySelectorAll('.fiber-link,.r7-rack-link,.r4-l2-link,.optical-flow').forEach(g=>g.classList.add('core-legend-muted'));
 if(deviceOff.has('CableTray'))svg.querySelectorAll('.electric-dashed,.electric-pulse').forEach(g=>g.classList.add('core-legend-muted'));
 if(off.size)svg.querySelectorAll('rect,path,circle,image').forEach(el=>{
  if(el.closest('defs,.r5-rack-reflection'))return;
  let key=bucket(el.style.fill||el.getAttribute('fill'))||bucket(el.style.stroke||el.getAttribute('stroke'));
  if(el.tagName==='image'&&el.closest('[data-act="npu"],[data-act="cpu2"]')){const g=el.closest('[data-act]'),o=modeDeviceContext({...g.dataset,t:g.dataset.act}).obj;key=S.mode==='health'?(o?.status==='err'?'紧急':o?.status==='warn'?'重要':'正常'):bucket(heat(modeDeviceValue({...g.dataset,t:g.dataset.act})||0))}
  if(key&&off.has(key))el.classList.add(svg.classList.contains('r2-home-svg')&&el.tagName==='rect'&&el.closest('[data-act="npublade"],[data-act="cpublade"]')?'core-legend-base':'core-legend-muted');
 });
 if(home&&S.mode==='health'&&off.size){
  svg.querySelectorAll('[data-act="npublade"],[data-act="cpublade"],[data-act="netdev"]').forEach(g=>{
   const cells=[...g.querySelectorAll('rect,path,circle,image')];
   cells.forEach(el=>{if(el.classList.contains('core-legend-base')||el.classList.contains('core-legend-muted'))el.classList.add('core-overlay-hidden')});
   const texts=[...g.querySelectorAll('text')];texts.forEach(t=>{
    if(/^[NC]$/.test(t.textContent.trim())){const x=+t.getAttribute('x'),y=+t.getAttribute('y');if(cells.some(c=>c.classList.contains('core-overlay-hidden')&&c.tagName==='rect'&&x>=+c.getAttribute('x')&&x<=+c.getAttribute('x')+ +c.getAttribute('width')&&y>=+c.getAttribute('y')&&y<=+c.getAttribute('y')+ +c.getAttribute('height')))t.classList.add('core-overlay-hidden')}
    else if(g.dataset.act==='netdev'&&cells.some(c=>c.classList.contains('core-overlay-hidden')))t.classList.add('core-overlay-hidden');
   });
  });
  // Never alter the rack artwork; only hide status overlays and colored links.
  svg.querySelectorAll('path.core-legend-muted').forEach(p=>p.classList.add('core-overlay-hidden'));
 }
 svg.querySelectorAll('.root-fault-bubble').forEach(g=>g.classList.toggle('core-legend-hidden',off.has('紧急')));
 svg.querySelectorAll('text').forEach(t=>{if(/^[CN]$/.test(t.textContent)){t.setAttribute('fill','#fff');t.style.fontWeight='400'}});
 if(S.view.t==='cpublade')$('kpis').querySelectorAll('.kpi').forEach(k=>{if(k.querySelector('.k')?.textContent.includes('RoCE'))k.querySelector('.v').innerHTML='1<small> 块</small>'});
}
function decorate(){const legend=$('r4-legend');if(!legend)return;legend.style.pointerEvents='auto';if(S.mode==='health'&&!legend.querySelector('.core-filter-label')){const label=document.createElement('span');label.className='core-filter-label';label.textContent='故障筛选';legend.prepend(label)}
 const statusLabels=new Set(S.mode==='health'?['紧急','重要','次要','提示','正常']:scaleLabels());
 legend.querySelectorAll('span').forEach(label=>{
  if(label.closest('button')||label.classList.contains('legend-title'))return;
  const name=label.textContent.trim(),icon=label.previousElementSibling;
  const isStatus=statusLabels.has(name),isType=Object.values(typeNames).includes(name)||['内存','硬盘','风扇','电源','CableTray','Fiber'].includes(name);
  if(S.mode!=='health'||!isStatus)return;
  const set=isStatus?excluded[S.mode]:deviceOff,button=document.createElement('button');button.type='button';button.className='core-legend-toggle';button.dataset.legend=name;button.setAttribute('aria-pressed',String(!set.has(name)));button.title='点击保留/去除染色：'+name;
  label.before(button);if(icon&&['I','SVG','IMG'].includes(icon.tagName.toUpperCase()))button.append(icon);button.append(label);
  button.onclick=e=>{e.stopPropagation();set.has(name)?set.delete(name):set.add(name);button.setAttribute('aria-pressed',String(!set.has(name)));apply()};
 });apply();}
const oldRender=render;render=function(){oldRender();decorate()};
const oldRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){oldRefresh();apply()};
const oldKpi=hfDecorateKPI;hfDecorateKPI=function(){oldKpi();if(S.view.t==='cpublade')$('kpis').querySelectorAll('.kpi').forEach(k=>{if(k.querySelector('.k')?.textContent.includes('RoCE'))k.querySelector('.v').innerHTML='1<small> 块</small>'})};
window.CCAE_LEGEND={getState:()=>({health:[...excluded.health],util:[...excluded.util],devices:[...deviceOff]})};
if(window.__roomBooted)render();
})();

/* Fault choice belongs to the blade hover card, not a cabinet counter. */
(()=>{
const rank={紧急:0,重要:1,次要:2,提示:3};
let selected=null;
function records(face){return BUBBLES.map(b=>({...b,pod:b.at.id.split('-')[0],blade:b.at.id.match(/^P\d+-(?:N|C|S)\d+/)?.[0]})).filter(b=>b.blade&&(!face||(face==='back'?b.at.v==='swblade':['npucard','cpucard'].includes(b.at.v))))}
function bladeFaults(id){return records().filter(b=>b.blade===id).sort((a,b)=>(rank[a.sev]??4)-(rank[b.sev]??4))}
function target(b){if(b.go)return {...b.go};if(b.at.v==='npucard')return {t:'npu',id:b.at.id,pod:b.pod,blade:b.blade};
 const bad=OMBAD[b.blade]||[];
 if(bad.length===1)return {t:'om',id:b.blade+'-M'+bad[0],pod:b.pod,blade:b.blade};
 return {t:'swblade',id:b.blade,pod:b.pod};
}
function navigate(b){
 selected=b;demoStop();closeUnpinned();hideHover();pushHist();
 const t=target(b);S.sel=null;go({lv:'blade',t:b.blade.includes('-S')?'swblade':b.blade.includes('-C')?'cpublade':'npublade',id:b.blade,pod:b.pod});
 if(['npu','cpu2','uchip','ichip','udie'].includes(t.t))drill(t);
 pick(t);
 const el=[...$('stageInner').querySelectorAll('[data-id]')].find(g=>g.dataset.id===t.id)||$('stageInner');
 showHover(t,el);
}
function detail(b){return `<b>${esc(b.name)}</b><span class="r4-severity">${esc(b.sev)}</span><h4>故障根因</h4><p>${esc(b.rootCause||(b.impact||[]).join('')||'暂无根因信息')}</p><h4>处理建议</h4><p>${esc((b.fix||[]).join('；')||'暂无处理建议')}</p>`}
const hover=showHover;showHover=function(t,el){
 hover(t,el);const h=$('hcard');h.querySelectorAll('.blade-fault-list').forEach(x=>x.remove());
 const active=selected&&BUBBLES.some(b=>b.key===selected.key)&&target(selected).id===t.id?selected:null;
 if(active){h.querySelectorAll('.r4-hfault,.hn').forEach(x=>x.remove());const box=document.createElement('div');box.className='r4-hfault';box.style.cursor='default';box.innerHTML=detail(active);h.append(box)}
 else if(['npublade','cpublade','swblade'].includes(t.t)&&S.mode==='health'){
  const faults=bladeFaults(t.id);
  if(faults.length&&(t.t==='cpublade'||faults.length>1||records().filter(b=>b.pod===faults[0].pod).length>1)){h.querySelectorAll('.r4-hfault,.hn').forEach(x=>x.remove());
   const box=document.createElement('div');box.className='blade-fault-list';box.innerHTML='<h4>故障列表</h4>';
   faults.forEach(b=>{const button=document.createElement('button');button.type='button';button.innerHTML=`<span class="blade-fault-severity" data-severity="${esc(b.sev)}">${esc(b.sev)}</span><span>${esc(b.name)}</span><span aria-hidden="true">›</span>`;button.onclick=e=>{e.stopPropagation();navigate(b)};box.append(button)});h.append(box);
  }
 }
 h.style.top=Math.max(200,Math.min(2134-h.offsetHeight,parseFloat(h.style.top)||200))+'px';
};
function paint(){const svg=$('stageInner').querySelector('.r2-home-svg');if(!svg)return;
 svg.querySelectorAll('.core-fault-group').forEach(g=>g.remove());
 const front=records('front');
svg.querySelectorAll('.root-fault-bubble').forEach(g=>{if(front.filter(b=>b.pod===g.dataset.pod).length>1)g.remove()});
}
const old=render;render=function(){old();paint()};
window.CCAE_FAULT_GROUPS={records,bladeFaults,target,navigate};if(window.__roomBooted)render();
})();

/* Keep device text legible after both render and live telemetry updates. */
(()=>{
 const palette=modePalette;modePalette=function(){return palette().map(hex=>{if(!/^#[0-9a-f]{6}$/i.test(hex))return hex;return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*.55).toString(16).padStart(2,'0')).join('')})};
 function apply(){const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('text').forEach(t=>{const mark=/^[CN]$/.test(t.textContent.trim());if(mark||t.closest('[data-act]')&&(S.mode==='util'||svg.classList.contains('r2-board-svg'))){t.style.fill='#fff';t.setAttribute('fill','#fff');if(mark){t.style.fontWeight='400';t.setAttribute('font-weight','400')}}});
 }
 const old=render;render=function(){old();apply()};const refresh=refreshLiveOverlays;refreshLiveOverlays=function(){refresh();apply()};if(window.__roomBooted)render();
})();

/* Review feedback: individual fans, metric definitions and persistent selection. */
(()=>{
 const descriptions={
  '设备功率':'当前范围内设备的瞬时功率，单位为W或kW。',
  '平均功率':'当前统计时段内的平均设备功率。',
  '峰值功率':'当前统计时段内记录到的最高设备功率。',
  '累计耗电量':'当前统计时段内累计消耗的电能，单位为kWh。',
  '功率统计开始时间':'本次功率与耗电量统计的起始时间。',
  'NPU 利用率':'当前范围内 NPU 利用率的平均值，反映计算资源的忙碌程度。',
  '满载卡数':'当前范围内利用率达到或超过 90% 的 NPU 数量；分母为该范围的 NPU 总数。',
  'HBM 利用率':'当前范围内 NPU 的 HBM 使用率平均值，反映高带宽内存的占用情况。',
  'CPU 利用率':'当前范围内 CPU 利用率的平均值，反映处理器的忙碌程度。',
  '灵衢 L0 带宽':'当前范围内 L0 链路的平均带宽利用率，表示已用带宽占链路容量的比例。',
  '灵衢 L0–L1 带宽':'当前刀片关联的 L0–L1 链路平均带宽利用率，表示已用带宽占链路容量的比例。',
  '灵衢 L1–L2 带宽':'当前范围内 L1–L2 上行链路的平均带宽利用率，表示已用带宽占链路容量的比例。'
 };
 function help(){
  $('kpis').querySelectorAll('.kpi .k').forEach(label=>{
   if(label.querySelector('.core-metric-help'))return;
   const copy=label.cloneNode(true);copy.querySelectorAll('svg,img,.core-metric-help').forEach(x=>x.remove());
   const text=copy.textContent.trim(),name=Object.keys(descriptions).find(key=>text.endsWith(key))||text;
   const value=label.closest('.kpi')?.querySelector('.v')?.textContent||'';
   const description=descriptions[name]||(/故障总数/.test(name)?'当前视图统计范围内的故障数量。切换超节点或进入刀片后，按该范围重新统计。':/故障/.test(name)?'当前视图范围内的'+name+'，用于了解设备异常情况。':value.includes('/')?'当前范围内'+name+'的故障数量 / 总数量；切换视图后统计范围随之变化。':'当前视图统计范围内的'+name+'数量，包含本层展示的相关资源。');
   const button=document.createElement('button');button.type='button';button.className='core-metric-help';button.setAttribute('aria-label',name+'说明');button.textContent='?';
   const tip=document.createElement('span');tip.className='core-help-text';tip.setAttribute('role','tooltip');tip.textContent=description;button.append(tip);button.onclick=e=>e.stopPropagation();label.append(button);
  });
 }
 const stage=stageSVG;stageSVG=function(inner){
  const markup=stage(inner);if(!markup.includes('r2-board-svg'))return markup;
  const doc=new DOMParser().parseFromString(markup,'image/svg+xml'),svg=doc.documentElement;
  const counts=new Map();svg.querySelectorAll('[data-act="part"][data-id*="风扇"]').forEach(g=>{
   const board=g.dataset.blade||g.dataset.id.split('-Q')[0],index=counts.get(board)||0;counts.set(board,index+1);
   g.dataset.act='fan';g.dataset.id=board+'-F'+index;g.setAttribute('aria-label','风扇'+String(index+1).padStart(2,'0'));
  });return new XMLSerializer().serializeToString(svg);
 };
 const metrics=hardwareMetrics;hardwareMetrics=function(t){const m=metrics(t);return t.t==='fan'?{...m,count:1}:m};
 const pop=popContent;popContent=function(t){const c=pop(t);if(t.t==='fan'){c.name='风扇'+String(Number(t.id.split('-F').pop())+1).padStart(2,'0');}return c};
 function highlight(){
  const svg=$('stageInner').querySelector('svg');if(!svg)return;
  svg.querySelectorAll('.core-selection-outline').forEach(el=>el.remove());
  if(!S.sel?.id)return;
  svg.querySelectorAll('[data-act][data-id]').forEach(g=>{
   if(g.dataset.id!==S.sel.id)return;
   const b=g.getBBox();if(!b.width||!b.height)return;
   const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
   rect.setAttribute('class','core-selection-outline');rect.setAttribute('x',b.x-2);rect.setAttribute('y',b.y-2);rect.setAttribute('width',b.width+4);rect.setAttribute('height',b.height+4);rect.setAttribute('rx','2');g.append(rect);
  });
 }
 const draw=render;render=function(){draw();help();highlight()};
 const live=refreshLiveOverlays;refreshLiveOverlays=function(){live();help();highlight()};
 const kpi=hfDecorateKPI;hfDecorateKPI=function(){kpi();help()};
 if(window.__roomBooted)render();
})();

/* Keep CPU device faults and baked-in rack artwork consistent with overlays. */
(()=>{
 const img=r2Image;r2Image=function(file,...args){const markup=img(file,...args);return file==='r2-rack-front.png'?markup.replace('class="hf-source-model"','class="hf-source-model core-neutral-rack"'):markup};
 const pop=popContent;popContent=function(t){const c=pop(t);if(t.t==='cpu2'){
  const fault=BUBBLES.find(b=>b.go?.id===t.id);if(fault){c.st='err';c.note={...bubNote(fault),l:[fault.rootCause||(fault.impact||[]).join('')],go:null};}
 }return c};
 function apply(){const svg=$('stageInner').querySelector('svg');if(!svg)return;
  svg.querySelectorAll('[data-act="cpu2"]').forEach(g=>{
   const bad=BUBBLES.some(b=>b.go?.t==='cpu2'&&b.go.id===g.dataset.id);if(S.mode!=='health'||!bad)return;
   g.querySelectorAll('image').forEach(im=>{
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    for(const attr of ['x','y','width','height'])rect.setAttribute(attr,im.getAttribute(attr));
    rect.setAttribute('rx','8');rect.setAttribute('fill','url(#r5-fault)');rect.setAttribute('class','core-cpu-fault-tile');im.replaceWith(rect);
   });
  });
 }
 const draw=render;render=function(){draw();apply()};const live=refreshLiveOverlays;refreshLiveOverlays=function(){live();apply()};if(window.__roomBooted)render();
})();

/* Board links share a device-edge anchor; explicit port endpoints stay distinct. */
(()=>{
function snap(x,y,boxes){
 let best=null;
 for(const b of boxes){
  if(x<b.x-1||x>b.x+b.w+1||y<b.y-1||y>b.y+b.h+1)continue;
  const edges=[{d:Math.abs(y-b.y),x:b.x+b.w/2,y:b.y},{d:Math.abs(y-b.y-b.h),x:b.x+b.w/2,y:b.y+b.h},{d:Math.abs(x-b.x),x:b.x,y:b.y+b.h/2},{d:Math.abs(x-b.x-b.w),x:b.x+b.w,y:b.y+b.h/2}];
  const e=edges.sort((a,b)=>a.d-b.d)[0];
  if(e.d<=3&&(!best||e.d<best.d||e.d===best.d&&b.w*b.h<best.area))best={...e,area:b.w*b.h};
 }
 return best?[best.x,best.y]:[x,y];
}
const stage=stageSVG;stageSVG=function(inner){
 const markup=stage(inner);if(!markup.includes('r2-board-svg'))return markup;
 const svg=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement;
 const boxes=[],ports=[];
 svg.querySelectorAll('[data-act],.r2-uport').forEach(g=>{
  const port=g.matches('.r2-uport')||['port','dport','cport','lane'].includes(g.dataset.act);
  if(!port&&!['npu','cpu2','uchip','ichip','netdev','npublade','cpublade','swblade'].includes(g.dataset.act))return;
  const r=[...g.children].find(e=>['rect','image'].includes(e.tagName)&&+e.getAttribute('width')>0);if(!r)return;
  (port?ports:boxes).push({x:+r.getAttribute('x'),y:+r.getAttribute('y'),w:+r.getAttribute('width'),h:+r.getAttribute('height')});
 });
 const endpoint=(x,y)=>ports.some(b=>x>=b.x-2&&x<=b.x+b.w+2&&y>=b.y-2&&y<=b.y+b.h+2)?[x,y]:snap(x,y,boxes);
 svg.querySelectorAll('path').forEach(p=>{
  if(p.closest('defs')||p.getAttribute('fill')!=='none')return;
  const d=p.getAttribute('d')||'';if(!/^\s*M\s*[-\d.]+[ ,]+[-\d.]+\s*C\s*[-\d.,\s]+$/i.test(d))return;
  const n=d.match(/-?\d+(?:\.\d+)?/g)?.map(Number);if(n?.length!==8)return;
  const a=endpoint(n[0],n[1]),b=endpoint(n[6],n[7]);
  n[2]+=a[0]-n[0];n[3]+=a[1]-n[1];n[4]+=b[0]-n[6];n[5]+=b[1]-n[7];
  p.setAttribute('d',`M${a[0]} ${a[1]} C${n[2]} ${n[3]} ${n[4]} ${n[5]} ${b[0]} ${b[1]}`);
 });
 return new XMLSerializer().serializeToString(svg);
};
window.CCAE_ENDPOINTS={snap};if(window.__roomBooted)render();
})();

/* Full-design branch entry points. No core-release route or front-face locks. */
(()=>{
 const originalDrill=drill;
 drill=function(t){
  if(!t)return;
  // Ports are contextual details in the original design, not invented topology pages.
  if(['port','dport','cport','lane','om'].includes(t.t)){
   pick(t);const el=[...$('stageInner').querySelectorAll('[data-id]')].find(g=>g.dataset.id===t.id);
   openPop(t,el);return;
  }
  return originalDrill(t);
 };
 goRootCard=function(t){
  if(!t)return;demoStop();hideHover();closeUnpinned();
  if(t.t==='bubgo'){const a=(t.id||'').split('|');if(a.length!==4)return;t={t:a[0],id:a[1],pod:a[2],blade:a[3]};}
  revealInTree(t);
  if(['port','dport','cport','lane','om'].includes(t.t)){
   const board=t.blade||t.id.match(/^P\d+-(?:N|C|S)\d+/)?.[0];if(!board)return;
   go({lv:'blade',t:board.includes('-S')?'swblade':board.includes('-C')?'cpublade':'npublade',id:board,pod:t.pod});
  }
  drill(t);
 };
 function decorate(){
  const tabs=document.querySelector('.core-page-tabs');if(tabs&&!tabs.dataset.fullReady){
   tabs.dataset.fullReady='true';tabs.querySelectorAll('button').forEach((b,i)=>{
    b.removeAttribute('aria-disabled');b.title=i?'资源视图':'返回超节点总览';
    b.onclick=()=>{demoStop();exitLogic();S.nav='res';S.biz=null;S.logic=null;S.sel=null;S.view={lv:'cluster'};syncNav();if(window.__roomBooted)render();};
   });
  }
  $('flipBtn').hidden=false;$('flipBtn').disabled=false;
  $('screen').dataset.designEdition='full';
 }
 const draw=render;render=function(){draw();decorate()};
 window.CCAE_FULL_DESIGN={edition:'full',layers:['health','util','pwr'],backplane:true,chipDrill:true,portDetails:true,business:true};
 if(window.__roomBooted)render();
})();

