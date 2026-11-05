function tintLoadLinks(){
 if(S.mode==='health')return;
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 const byPath=new Map();
 const paint=(path,color)=>{const old=path.getAttribute('stroke')||'';const alpha=old.match(/,([.\d]+)\)$/);if(alpha)path.setAttribute('opacity',alpha[1]);path.setAttribute('stroke',color);};
 if(S.mode==='pwr'){
  svg.querySelectorAll('path[stroke]').forEach(path=>{
   if(path.closest('defs')||path.getAttribute('fill')!=='none')return;
   if(path.closest('.optical-flow')||path.matches('.fiber-link,.r7-rack-link,.r4-l2-link,.electric-dashed')||/[Cc]/.test(path.getAttribute('d')||''))paint(path,'#62b997');
  });
  document.querySelectorAll('#r4-legend .electric-legend path,#r4-legend .fiber-legend path').forEach(path=>paint(path,'#62b997'));
  return;
 }
 svg.querySelectorAll('.r7-rack-link,.fiber-link').forEach(path=>{
  const sw=D.pods.flatMap(p=>p.sw).find(sw=>sw.id===path.dataset.l1);if(!sw)return;
  // Stable per-link demo bandwidth adds scattered tiers without flickering on redraw.
  const key=sw.id+':'+(path.dataset.l2||'uplink');let hash=2166136261;
  for(const char of key)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  const bucket=hash%100;
  const value=bucket<8?18+hash%10:bucket<24?38+hash%18:bucket>91?92+hash%7:sw.bw;
  const color=heat(value);path.dataset.bandwidth=value.toFixed(1);path.setAttribute('stroke',color);path.setAttribute('opacity','.6');byPath.set(path.getAttribute('d'),color);
 });
 svg.querySelectorAll('.r2-board-svg .electric-dashed,.r2-board-svg .r4-l2-link').forEach(path=>{
  const key=(S.view.id||'')+':'+path.getAttribute('d');let hash=2166136261;
  for(const c of key)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  const bucket=hash%100,value=bucket<12?18+hash%10:bucket<34?38+hash%18:bucket>93?92+hash%7:65+hash%23;
  const color=heat(value);path.dataset.bandwidth=value.toFixed(1);paint(path,color);byPath.set(path.getAttribute('d'),color);
 });
 svg.querySelectorAll('.optical-flow path').forEach(path=>{const color=byPath.get(path.getAttribute('d'));if(color)paint(path,color);});
}

// Match label contrast to the actual blue cell behind each label, including nested cards.
function applyLoadContrast(){
 tintLoadLinks();
 if(S.mode==='health')return;
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 const colors=new Set([...modePalette(),'#949494'].map(c=>c.toLowerCase()));
 const backgrounds=[...svg.querySelectorAll('rect,circle,polygon,path,image')].map(el=>{
  let fill=(el.getAttribute('fill')||'').toLowerCase();
  const tint=(el.getAttribute('filter')||'').match(/mode-tint-(\d+)/);
  if(tint)fill=([...modePalette(),'#949494'][+tint[1]]||'').toLowerCase();
  if(!colors.has(fill))return null;
  const box=el.getBoundingClientRect();return {el,fill,box};
 }).filter(Boolean);
 svg.querySelectorAll('text').forEach(text=>{
  const b=text.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;
  const bg=backgrounds.filter(({box:r})=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom).sort((a,b)=>a.box.width*a.box.height-b.box.width*b.box.height)[0];
  if(!bg)return;
  const rgb=[1,3,5].map(n=>parseInt(bg.fill.slice(n,n+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  const luminance=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  const ink=luminance>.179?'#000000':'#ffffff';
  text.setAttribute('fill',ink);text.style.fill=ink;
 });
}
const loadContrastRender=render;
render=function(){loadContrastRender();applyLoadContrast();};
const loadContrastRefresh=refreshLiveOverlays;
refreshLiveOverlays=function(){loadContrastRefresh();applyLoadContrast();};
if(window.__roomBooted)render();

