function neutralDeviceLegends(){const row=$('r4-legend')?.querySelector('.legend-row');if(!row)return;
 row.querySelectorAll('svg:not(.fiber-legend):not(.electric-legend)').forEach(svg=>{
 svg.style.opacity='1';svg.querySelectorAll('[opacity],[fill-opacity],[stroke-opacity]').forEach(e=>{e.setAttribute('opacity','1');e.setAttribute('fill-opacity','1');e.setAttribute('stroke-opacity','1');});
 svg.querySelectorAll('rect,circle,path,polygon').forEach(e=>{if(e.getAttribute('fill')!=='none')e.setAttribute('fill','#bbc2c7');});
 svg.querySelectorAll('text').forEach(e=>e.setAttribute('fill','#24292d'));
 // Preserve the topology asset's internal detail instead of flattening every pixel to one color.
 if(svg.querySelector('image')){svg.querySelectorAll('defs').forEach(e=>e.remove());svg.querySelectorAll('image').forEach(im=>{im.removeAttribute('filter');im.style.filter='grayscale(1) brightness(2) contrast(1.4)';im.style.opacity='1';});}
 if(svg.getAttribute('aria-label')==='风扇')svg.innerHTML='<circle cx="14" cy="14" r="13" fill="#bbc2c7"/>'+fanBladesMarkup().replace('#35393d','#24292d');
 });
}
const neutralLegendRender=render;render=function(){neutralLegendRender();neutralDeviceLegends();};
const neutralLegendRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){neutralLegendRefresh();neutralDeviceLegends();};if(window.__roomBooted)render();

// Green-majority load telemetry with stable irregular clusters.
D.pods.forEach((p,pi)=>{
 if(pi<14)p.npu.forEach((b,bi)=>{const start=hashOf(b.id+':green-majority')%8,count=5+hashOf(b.id+':green-width')%2;
 b.cards.forEach((c,ci)=>{if(c.status!=='ok')return;const green=(ci-start+8)%8<count;c.reviewMidLoad=green;c.reviewGreenValue=green?34+hashOf(c.id)%230/10:66+hashOf(c.id)%200/10;c.util=c.reviewGreenValue;});});
 p.sw.forEach(sw=>{const start=hashOf(sw.id+':majority')%32,count=21+hashOf(sw.id+':span')%5;
 sw.omBw=sw.omBw.map((v,q)=>{const seed=hashOf(sw.id+':g:'+q),green=(q-start+32)%32<count;return green?(seed%29===0?24:35+seed%220/10):seed%9===0?45:67+seed%210/10;});});
});
