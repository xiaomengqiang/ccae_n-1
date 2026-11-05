function reviewFanLayers(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('[data-act="part"][data-id*="风扇"],[data-act="fan"]').forEach(g=>{
  g.querySelectorAll('.review-fan-rotor').forEach(el=>el.remove());
  const im=g.querySelector('image');if(!im)return;
  const t={...g.dataset,t:g.dataset.act},m=hardwareMetrics(t);
  const color=S.mode==='health'?'#4b966b':heat(S.mode==='pwr'?powerBand(m.power):m.util);
  const disc=g.querySelector('circle'),x=+im.getAttribute('x'),y=+im.getAttribute('y'),w=+im.getAttribute('width'),h=+im.getAttribute('height');
  im.style.visibility='hidden';
  if(disc){disc.setAttribute('fill',color);disc.setAttribute('fill-opacity','.25');disc.setAttribute('opacity','1');}
  const cx=disc?+disc.getAttribute('cx'):x+w/2,cy=disc?+disc.getAttribute('cy'):y+h/2,r=disc?+disc.getAttribute('r'):Math.min(w,h)/2;
  const rotor=document.createElementNS(NS,'g');rotor.setAttribute('class','review-fan-rotor');rotor.setAttribute('pointer-events','none');
  rotor.innerHTML=(disc?'':`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity=".25"/>`)+`<g transform="translate(${cx-r} ${cy-r}) scale(${r/14})">`+fanBladesMarkup().replace('#35393d',color)+'</g>';
  g.append(rotor);
 });
}
const fanLayersRender=render;render=function(){fanLayersRender();reviewFanLayers();};
const fanLayersRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){fanLayersRefresh();reviewFanLayers();};if(window.__roomBooted)render();

