const mSync=hfSync;hfSync=function(){mSync();$('hf-expand').hidden=hfTreeOpen||S.view.lv==='cluster'||S.nav==='biz';$('hf-expand').innerHTML='<span>超节点 (1024卡)</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'};
const NS='http://www.w3.org/2000/svg';let motionView='',motionKey='',flowHandles=[],geomSpring=null,boardResize=null;
function geomSnapshot(){const m=new Map();$('stageInner').querySelectorAll('[data-act]:not([data-act="part"])').forEach(g=>{const id=g.dataset.act+':'+g.dataset.id;[...g.children].forEach((el,i)=>{if(!['rect','image','text','circle'].includes(el.tagName))return;const attrs={};for(const a of ['x','y','width','height','cx','cy','r'])if(el.hasAttribute(a))attrs[a]=+el.getAttribute(a);m.set(id+':'+(g.dataset.om||'')+':'+el.tagName+':'+i,attrs)})});return m}
function animateGeometry(before){if(CCAE_MOTION.REDUCED)return;geomSpring?.stop();const items=[];$('stageInner').querySelectorAll('[data-act]:not([data-act="part"])').forEach(g=>{[...g.children].forEach((el,i)=>{const from=before.get(g.dataset.act+':'+g.dataset.id+':'+(g.dataset.om||'')+':'+el.tagName+':'+i);if(!from)return;const to={};for(const a of Object.keys(from))if(el.hasAttribute(a))to[a]=+el.getAttribute(a);items.push({el,from,to})})});geomSpring=CCAE_MOTION.springTo({x:0,v:0},1,CCAE_MOTION.SPRING.standard,t=>items.forEach(({el,from,to})=>{for(const a in to)el.setAttribute(a,from[a]+(to[a]-from[a])*t)}));}
function selectedCardGeometry(){if(!['blade','card','chip'].includes(S.view.lv)||!['npu','cpu2','uchip'].includes(S.sel?.t))return;const svg=$('stageInner').querySelector('svg'),g=[...svg.querySelectorAll('[data-act]')].find(g=>g.dataset.id===S.sel.id&&g.dataset.act===S.sel.t);if(!g)return;const rect=g.querySelector('rect');if(!rect||+rect.getAttribute('width')>100)return;const x=+rect.getAttribute('x'),y=+rect.getAttribute('y'),w=+rect.getAttribute('width'),h=+rect.getAttribute('height'),cx=x+w/2,cy=y+h/2,k=1.12;for(const el of g.children){for(const a of ['x','y','width','height']){if(!el.hasAttribute(a))continue;const v=+el.getAttribute(a);el.setAttribute(a,a==='x'?cx+(v-cx)*k:a==='y'?cy+(v-cy)*k:v*k)}}svg.querySelectorAll('path:not(.r4-union-outline)').forEach(p=>{const d=p.getAttribute('d')||'';p.setAttribute('d',d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(m,a,b)=>{a=+a;b=+b;return a>=x&&a<=x+w&&b>=y&&b<=y+h?`${cx+(a-cx)*k} ${cy+(b-cy)*k}`:m}))})}
// 按当前模式统一器件色阶；在历史渲染覆盖完成后、流光创建前执行。
function modeDeviceContext(t){
 const pod=findPod(t.pod||(t.id||'').slice(0,3));
 const bladeId=t.blade||(t.id||'').match(/^P\d+-[NCSI]\d+/)?.[0];
 const board=pod&&[...pod.npu,...pod.cpu,...pod.sw,...pod.io,pod.mgmt,pod.pwr].find(b=>b?.id===bladeId);
 const cardId=t.card||(t.id||'').match(/^P\d+-N\d+-K\d+/)?.[0];
 const card=board?.cards?.find(c=>c.id===cardId);
 let obj=findObj(t.t,t.id||'',t);
 if(t.t==='cpu2')obj=board?.cpus?.find(c=>c.id===t.id)||board;
 if(['dport','blk','part','cport','lane','port','om'].includes(t.t))obj=card||board;
 return {obj,board,card};
}
function modeDeviceValue(t){
 const {obj,board,card}=modeDeviceContext(t);
 if(t.t==='part'||t.t==='fan'){const m=hardwareMetrics(t);return S.mode==='pwr'?((t.id||'').includes('风扇')||t.t==='fan'?powerBand(m.power):null):m.util;}
 if(!obj)return null;
 if(S.mode==='pwr'){if(['om','port','cport','dport','lane','blk','ioblade','ichip','swblade','netdev','uchip','udie'].includes(t.t))return null;if(t.t==='cpu2')return powerBand(cpuDemoPower(board,+t.id.slice(-1)));return hasPwr(obj)?pwrPct(obj):null;}
 if(t.t==='dport')return cardPortState(card,+t.id.split('-P').pop()).util;
 if(t.t==='om')return board?.omBw?.[+t.id.split('-M').pop()]??loadOf(obj);
 if(t.t==='blk'){
  const name=t.id.split('-B').pop();
  return {'HBM':card?.mem.bwUse,'AI Cube':card?.cube,'AI Vector':card?.vec,'Control CPU':card?.ctl,'AI CPU':card?.acpu}[name]??loadOf(obj);
 }
 return loadOf(obj)??(obj.cards?.length?obj.cards.reduce((sum,c)=>sum+c.util,0)/obj.cards.length:null);
}
function applyModeColors(svg){
 if(S.mode==='health'||!svg)return;
 const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs');
 const palette=[...modePalette(),'#949494'];
 // Remap the green artwork to each palette color while preserving neutral details,
 // highlights, shadows and alpha. A constant RGB matrix destroys the device glyphs.
 palette.forEach((color,i)=>{
  const rgb=[1,3,5].map(n=>parseInt(color.slice(n,n+2),16)/255);
  for(const [kind,red,green] of [['chip',47/255,155/255],['io',54/255,129/255],['part',50/255,100/255]]){
   const f=document.createElementNS(ns,'filter');f.id='mode-tint-'+i+'-'+kind;f.setAttribute('color-interpolation-filters','sRGB');
   const matrix=document.createElementNS(ns,'feColorMatrix');matrix.setAttribute('type','matrix');
   matrix.setAttribute('values',rgb.map(c=>{const k=(c-green)/(green-red);return `${-k} ${1+k} 0 0 0`;}).join(' ')+' 0 0 0 1 0');
   f.append(matrix);defs.append(f);
  }
 });
 svg.prepend(defs);
 const colored=fill=>{
  if(/url\(#(?:r5-fault|hf-chip)/.test(fill||''))return true;
  if(!/^#[\da-f]{6}$/i.test(fill||''))return false;
  const rgb=[1,3,5].map(n=>parseInt(fill.slice(n,n+2),16));return Math.max(...rgb)-Math.min(...rgb)>24;
 };
 svg.querySelectorAll('[data-act]').forEach(g=>{
  const t={...g.dataset,t:g.dataset.act},value=modeDeviceValue(t),color=value==null?'#949494':heat(value);
  const known=['npu','cpu','cpu2','cpucard','uchip','ichip','udie','dport','cport','port','om','lane','blk','part','netdev','npublade','cpublade','swblade','ioblade','mgmtblade','pwrbox'];
  if(!known.includes(t.t))return;
  // 首页和业务六边形已按每颗卡的数据着色，不用板级均值覆盖。
  if(['npublade','cpublade'].includes(t.t)&&(g.classList.contains('lgnode')||svg.classList.contains('r2-home-svg')))return;
  if(t.t==='dport'&&PORTMAP[+t.id.split('-P').pop()]?.t==='idle')return;
  const leaf=['npu','cpu','cpu2','cpucard','uchip','ichip','udie','dport','cport','port','om','lane','blk','part'].includes(t.t);
  g.querySelectorAll('rect,circle,polygon').forEach(r=>{
   if(r.closest('[data-act]')!==g)return;
   const fill=r.getAttribute('fill');
   if((leaf&&!g.querySelector('image')&&fill&&fill!=='none'&&fill!=='transparent'&&!r.classList.contains('r5-chip-selected'))||colored(fill))r.setAttribute('fill',color);
   if(colored(r.getAttribute('stroke')))r.setAttribute('stroke','none');
  });
  // 只给器件状态图片染色，机柜及灰色结构参考素材保持原貌。
  if(['npu','cpu','cpu2','cpucard','part','ioblade'].includes(t.t))g.querySelectorAll('image').forEach(im=>{
   if(im.closest('[data-act]')===g){const kind=t.t==='part'?'part':t.t==='ioblade'?'io':'chip';if(t.t==='part'&&g.querySelector('circle')){im.removeAttribute('filter');}else im.setAttribute('filter',`url(#mode-tint-${palette.indexOf(color)}-${kind})`);}
  });
  if(t.t==='netdev'){const r=g.querySelector('rect');if(r)r.setAttribute('stroke',color)}
 });
 const view=S.view,pod=findPod(view.pod),sw=pod?.sw.find(b=>b.id===view.blade||b.id===view.id),chip=sw?.chipList.find(c=>c.id===view.id);
 svg.querySelectorAll('.r2-uport').forEach(g=>{
  const r=g.querySelector('rect');if(!r)return;
  const idle=g.dataset.idle==='true',value=S.mode==='pwr'?null:(chip?.portBw?.[+g.dataset.port-1]??chip?.bw??sw?.bw);
  r.setAttribute('fill',idle||value==null?'#949494':heat(value));
 });
 // 连线表达连接关系，非故障模式使用中性色，避免保留红绿故障暗示。
 svg.querySelectorAll('path[stroke]').forEach(p=>{
  if(p.getAttribute('fill')==='none'&&/[Cc]/.test(p.getAttribute('d')||'')&&colored(p.getAttribute('stroke'))&&!p.classList.contains('r4-union-outline'))p.setAttribute('stroke','#9ba7ad');
 });
}

const mRender=render;render=function(){const key=JSON.stringify([S.view,S.sel,S.nav,S.face]),changed=key!==motionKey,viewKey=JSON.stringify(S.view),sameView=viewKey===motionView,before=changed&&sameView&&['npu','cpu2'].includes(S.sel?.t)?geomSnapshot():null;motionKey=key;motionView=viewKey;$('stageInner').getAnimations({subtree:true}).forEach(a=>a.cancel());flowHandles.forEach(h=>h.clear());flowHandles=[];mRender();selectedCardGeometry();motionLegend();const svg=$('stageInner').querySelector('svg');if(!svg)return;applyModeColors(svg);electricLinks(svg);const paths=[...svg.querySelectorAll('.fiber-link,.r7-rack-link,.r4-l2-link')];if(paths.length){const group=document.createElementNS(NS,'g');group.classList.add('optical-flow');group.style.pointerEvents='none';svg.append(group);flowHandles.push(CCAE_MOTION.attachOpticalFlow(group,paths.map(p=>p.getAttribute('d')),svg.classList.contains('r2-board-svg')&&svg.querySelector('.r4-l2-link')?{speedPxS:275,cycleMs:1600,staggerMs:64}:{}));if(changed&&!CCAE_MOTION.REDUCED)paths.forEach((p,i)=>{const l=p.getTotalLength();p.animate([{strokeDasharray:l,strokeDashoffset:l},{strokeDasharray:l,strokeDashoffset:0}],{duration:500,delay:Math.min(i,7)*30,easing:'cubic-bezier(.05,.7,.1,1)'})})}if(changed&&before?.size&&['blade','card','chip'].includes(S.view.lv))animateGeometry(before)};
// The legend uses the same optical renderer and timing as the topology.
