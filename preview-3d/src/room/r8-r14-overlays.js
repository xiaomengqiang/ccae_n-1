const r8Stage=stageSVG;stageSVG=function(inner){const out=r8Stage(inner);if(S.mode!=='health')return out;const svg=new DOMParser().parseFromString(out,'image/svg+xml').documentElement;svg.querySelectorAll('path[marker-start]').forEach(p=>p.setAttribute('stroke','#62b997'));svg.querySelectorAll('[data-act="part"]').forEach(g=>{if(!(g.dataset.id||'').includes('风扇'))return;const circle=g.querySelector('circle');if(circle){circle.setAttribute('fill','#35835d');const im=g.querySelector('image');if(im)im.setAttribute('filter','url(#r8-fan-color)')}});svg.insertAdjacentHTML('afterbegin','<defs><filter id="r8-fan-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .39  0 0 0 0 .79  0 0 0 0 .58  0 0 0 1 0"/></filter></defs>');return new XMLSerializer().serializeToString(svg)};
// Centered recessed NPU connection, with a round contact rather than a square marker.
const r9Stage=stageSVG;stageSVG=function(inner){const out=r9Stage(inner);if(S.view.t!=='cpublade')return out;const svg=new DOMParser().parseFromString(out,'image/svg+xml').documentElement;svg.querySelectorAll('path[marker-start]').forEach(p=>{const m=(p.getAttribute('d')||'').match(/^M([\d.]+)[ ,]+387\b/);if(m)p.setAttribute('marker-start','url(#r9-npu-contact)')});svg.insertAdjacentHTML('afterbegin','<defs><marker id="r9-npu-contact" markerWidth="6" markerHeight="6" refX="3" refY="3" markerUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#9bb6ad"/></marker></defs>');return new XMLSerializer().serializeToString(svg)};
// Place each KPI divider at the midpoint of the visible neighboring metric groups.
function r10Dividers(){const cards=[...$('kpis').querySelectorAll('.kpi')];const bounds=el=>{const boxes=[];for(const n of el.querySelectorAll('.k,.v')){const walker=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(walker.currentNode);boxes.push(r.getBoundingClientRect())}n.querySelectorAll('img,svg').forEach(x=>boxes.push(x.getBoundingClientRect()))}const valid=boxes.filter(b=>b.width>0);return valid.length?{left:Math.min(...valid.map(b=>b.left)),right:Math.max(...valid.map(b=>b.right))}:el.getBoundingClientRect()};cards.slice(0,-1).forEach((c,i)=>{if(c.classList.contains('hf-pod-card'))return;const a=bounds(c),b=bounds(cards[i+1]),r=c.getBoundingClientRect(),scale=r.width/c.offsetWidth;c.style.setProperty('--metric-divider-right',((r.right-(a.right+b.left)/2)/scale)+'px')})}
const r10Render=render;render=function(){r10Render();requestAnimationFrame(r10Dividers)};addEventListener('resize',()=>requestAnimationFrame(r10Dividers));if(window.__roomBooted)render();

const r11Sfu=sfuStage;sfuStage=function(P,sw,z){const svg=r5Doc(r11Sfu(P,sw,z));if(z>=0)svg.querySelectorAll('.r4-board-outline').forEach(e=>e.remove());if(S.mode==='util'){svg.querySelectorAll('.r2-uport').forEach(g=>{const n=+g.dataset.port,c=sw.chipList[z];g.querySelector('rect')?.setAttribute('fill',g.dataset.idle==='true'?'#666b70':heat(c?.portBw[n-1]??c?.bw??0))});svg.querySelectorAll('[data-act="npu"]').forEach(g=>{const c=findObj('npu',g.dataset.id,{pod:P.id,blade:g.dataset.blade});g.querySelector('rect')?.setAttribute('fill',heat(c?.util??0))});svg.querySelectorAll('[data-act="ioblade"]').forEach(g=>{const b=P.io.find(b=>b.id===g.dataset.id);g.querySelectorAll('rect').forEach(r=>{if(+r.getAttribute('width')===66)r.setAttribute('fill',heat(b?.bw??0))})})}return svg.innerHTML};
syncViewSeg=function(){$('viewseg').style.display='none';$('viewseg').innerHTML=''};document.fonts.ready.then(r10Dividers);if(window.__roomBooted)render();

// Collapsed components communicate their mode through the border.
const r12Sfu=sfuStage;sfuStage=function(P,sw,z){const svg=r5Doc(r12Sfu(P,sw,z));svg.querySelectorAll('[data-act="netdev"],[data-act="npublade"]').forEach(g=>{if(g.querySelector('[data-act="npu"]'))return;const t=targetOf(g),o=findObj(t.t,t.id,t);if(!o)return;const r=g.querySelector('rect');if(!r)return;const bad=o.status&&o.status!=='ok'||o.cards?.some(c=>c.status!=='ok')||o.chipList?.some(c=>c.status!=='ok');const col=S.mode==='health'?(bad?'#e7434a':'#35835d'):S.mode==='util'?heat(loadOf(o)??(o.cards?o.cards.reduce((s,c)=>s+c.util,0)/o.cards.length:0)):heat(pwrPct(o));r.setAttribute('fill',col);r.setAttribute('stroke','none');g.querySelectorAll(':scope > text').forEach(t=>t.setAttribute('fill','#eee'))});return svg.innerHTML};
// Reference mapping: source cabinet strip, blue location frames and short vertical leaders.
const r12Logic=logicView;logicView=function(){
 const svg=r5Doc(r12Logic());svg.querySelectorAll('.lgmap').forEach(e=>e.remove());
 const band=svg.querySelector('#miniPhys');
 if(band){
  let content='';const top=lgBandTop(),h=lgBandH(),w=lgBandW(),selected=new Set(bizPods(S.logic).map(p=>typeof p==='string'?p:p.id));
  const rack=(markup,x,active)=>`<g opacity="${active?1:.3}" transform="translate(${x} ${top}) scale(${w/92}) translate(0 ${-r2Y})">${markup}</g>`;
  D.pods.forEach((p,i)=>{const x=lgBandX(i);content+=rack(r2Front(p,0),x,selected.has(p.id));
   if(selected.has(p.id))content+=`<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="3" fill="none" stroke="#268cf0" stroke-width="2" pointer-events="none"/>`;
  });
  D.nets.forEach((n,i)=>{content+=rack(r2Net(n,0),lgBandSlotX(8+i),false)});
  const left=lgBandSlotX(0),right=lgBandSlotX(19)+w,bottom=top+h;
  const scene=`<g class="mini-rack-scene" pointer-events="none">
   <defs>
    <linearGradient id="mini-room-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#242424" stop-opacity="0"/><stop offset="1" stop-color="#202020" stop-opacity=".7"/></linearGradient>
    <radialGradient id="mini-room-floor"><stop offset="0" stop-color="#747474" stop-opacity=".2"/><stop offset="1" stop-color="#555" stop-opacity="0"/></radialGradient>
    <linearGradient id="mini-room-ground" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#404040" stop-opacity=".35"/><stop offset="1" stop-color="#555" stop-opacity=".12"/></linearGradient>
   </defs>
   <path d="M80 ${top-50}H${VW-80}V${bottom+80}L${right+150} ${bottom-10}H${left-150}L80 ${bottom+80}Z" fill="url(#mini-room-wall)"/>
   <path d="M${left-150} ${bottom-10}H${right+150}L${VW-80} ${VH-45}H80Z" fill="url(#mini-room-ground)"/>
   <ellipse cx="${VW/2}" cy="${bottom+38}" rx="${VW*.46}" ry="100" fill="url(#mini-room-floor)"/>
  </g>`;
  band.innerHTML=scene+content;
 }
 const panels=[...svg.querySelectorAll('.lgpanel')].filter(g=>!g.classList.contains('lgmap'));
 const boxes=panels.flatMap(g=>[...g.querySelectorAll(':scope > rect')]).filter(r=>+r.getAttribute('width')>200);
 boxes.forEach(r=>{r.setAttribute('fill','#414141');r.setAttribute('stroke','none');r.setAttribute('rx','22');r.classList.add('pd-instance-card')});
 if(boxes.length){
  const left=Math.min(...boxes.map(r=>+r.getAttribute('x'))),top=Math.min(...boxes.map(r=>+r.getAttribute('y')));
  const right=Math.max(...boxes.map(r=>+r.getAttribute('x')+ +r.getAttribute('width')));
  const outer=document.createElementNS(NS,'rect');
  Object.entries({x:left-44,y:top-110,width:right-left+88,height:VH-32-(top-110),rx:28,fill:'#303030',class:'pd-device-card'}).forEach(([k,v])=>outer.setAttribute(k,v));svg.prepend(outer);
  const cols=[...new Set(boxes.map(r=>+r.getAttribute('x')))].sort((a,b)=>a-b);
  if(bizOf(S.logic)?.k==='inf'&&cols.length===2)cols.forEach((x,i)=>{const label=document.createElementNS(NS,'text');Object.entries({x,y:top-46,fill:'#b6b6b6','font-size':28}).forEach(([k,v])=>label.setAttribute(k,v));label.textContent=i?'D节点':'P节点';svg.append(label)});
 }
 return svg.innerHTML;
};
// 0909 reference: expanded home tree keeps the overview metric cards.
const r14Sync=hfSync;hfSync=function(){r14Sync();$('screen').classList.toggle('r14-tree-home',r2Home()&&hfTreeOpen)};
const r14Decorate=hfDecorateKPI;hfDecorateKPI=function(){r14Decorate();if(!r2Home()||!hfTreeOpen)return;$('kpis').querySelector('.hf-pod-card')?.remove();$('kpis').querySelectorAll('.kpi').forEach((el,i)=>{el.querySelectorAll('.r4-icon,.hf-metric-icon,.hf-gauge').forEach(e=>e.remove());if(S.mode==='health'&&i<6){const im=document.createElement('img');im.className='hf-gauge';im.alt='';im.src=HF_EMBEDDED_ASSETS['r2-gauge-'+i+'.png'];el.append(im)}})};
const r14Render=render;render=function(){r14Render();if(!r2Home()||!hfTreeOpen)return;$('tabs').querySelectorAll('.tab').forEach(e=>{if(e.textContent.includes('管理'))e.textContent='电源';if(e.textContent.includes('故障'))e.textContent='故障'});D.pods.forEach(p=>{const el=$('tree').querySelector('[data-id="'+p.id+'"] .nm');if(el)el.textContent=p.name.replace(/\s/g,'')+'(64卡)'})};
