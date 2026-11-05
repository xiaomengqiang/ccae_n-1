function overviewInterconnectEnergy(){
 if(S.mode!=='pwr')return;const svg=$('stageInner').querySelector('.r2-home-svg');if(!svg)return;
 svg.querySelectorAll('[data-act="netdev"],[data-act="swblade"]').forEach(g=>{
 const n=hashOf(g.dataset.id+':energy-color')%10,col=heat(n<8?45:n===8?20:75);
 g.querySelectorAll('rect').forEach(r=>{const f=r.getAttribute('fill');if(f&&f!=='none'&&f!=='transparent'){r.setAttribute('fill',col);r.style.fill=col;r.setAttribute('fill-opacity','.8');if(r.getAttribute('stroke')&&r.getAttribute('stroke')!=='none'){r.setAttribute('stroke',col);r.style.stroke=col;}}});
 g.removeAttribute('aria-label');
 });
}
const interconnectEnergyRender=render;render=function(){interconnectEnergyRender();overviewInterconnectEnergy();};
const interconnectEnergyRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){interconnectEnergyRefresh();overviewInterconnectEnergy();};if(window.__roomBooted)render();

function innerInterconnectEnergy(){
 if(S.mode!=='pwr')return;const svg=$('stageInner').querySelector('svg');if(!svg||svg.classList.contains('r2-home-svg'))return;
 const color=id=>{const n=hashOf(id+':energy-color')%10;return heat(n<8?45:n===8?20:75);};
 svg.querySelectorAll('[data-act="netdev"],[data-act="swblade"],[data-act="uchip"],[data-act="udie"],[data-act="ichip"],[data-act="om"]').forEach(g=>{
 const id=g.dataset.act==='netdev'?g.dataset.id:g.dataset.blade||g.dataset.id.match(/^P\d+-S\d+/)?.[0]||g.dataset.id,col=color(id);
 g.querySelectorAll('rect').forEach(r=>{if(r.closest('[data-act]')!==g)return;const f=r.getAttribute('fill');if(!f||f==='none'||f==='transparent')return;
 if(g.dataset.act==='swblade'&&+r.getAttribute('width')>200)return;
 r.setAttribute('fill',col);r.style.fill=col;r.setAttribute('fill-opacity','.8');if(r.getAttribute('stroke')&&r.getAttribute('stroke')!=='none'){r.setAttribute('stroke',col);r.style.stroke=col;}
 });
 });
}
const innerEnergyRender=render;render=function(){innerEnergyRender();innerInterconnectEnergy();};
const innerEnergyRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){innerEnergyRefresh();innerInterconnectEnergy();};if(window.__roomBooted)render();

// L2 demo watts share the same bins as the established overview energy colors.
