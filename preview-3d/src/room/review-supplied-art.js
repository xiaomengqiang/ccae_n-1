const reviewSuppliedArt={"r3-network-outline.png": "./assets/uploads/r3-network-outline.png", "0908-sfu-board.svg": "./assets/uploads/0908-sfu-board.svg"};

const suppliedArtImage=r2Image;r2Image=function(file,x,y,w,h){
 if(!reviewSuppliedArt[file])return suppliedArtImage(file,x,y,w,h);
 if(file==='r3-network-outline.png'){x=446;y=267;w=160;h=125;}
 if(file==='0908-sfu-board.svg'){x=482;y=510;w=72;h=186;}
 return `<image href="${reviewSuppliedArt[file]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
};
function reviewGrayLoadLinks(){if(S.mode!=='util')return;
 const svg=$('stageInner').querySelector('svg');if(svg){svg.querySelectorAll('.fiber-link,.r7-rack-link,.r4-l2-link,.electric-dashed,.optical-flow path,path[stroke]').forEach(p=>{if(p.closest('defs'))return;const d=p.getAttribute('d')||'';if(p.matches('.fiber-link,.r7-rack-link,.r4-l2-link,.electric-dashed,.optical-flow path')||(p.getAttribute('fill')==='none'&&/[Cc]/.test(d))){p.setAttribute('stroke','#9ba7ad');p.style.stroke='#9ba7ad';}});svg.querySelectorAll('.optical-flow circle').forEach(c=>c.setAttribute('fill','#9ba7ad'));}
 document.querySelectorAll('#r4-legend .fiber-legend path,#r4-legend .electric-legend path').forEach(p=>{p.setAttribute('stroke','#9ba7ad');p.style.stroke='#9ba7ad';});
}
const suppliedArtRender=render;render=function(){suppliedArtRender();reviewGrayLoadLinks();};
const suppliedArtRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){suppliedArtRefresh();reviewGrayLoadLinks();};if(window.__roomBooted)render();

// September review: consistent navigation, measured units and mode rendering.
reviewGrayLoadLinks=function(){
 if(S.mode!=='util')return;
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('.fiber-link,.r7-rack-link,.r4-l2-link,.electric-dashed,.optical-flow path,path[stroke]').forEach(p=>{
  if(p.closest('defs'))return;const d=p.getAttribute('d')||'';
  if(p.matches('.fiber-link,.r7-rack-link,.r4-l2-link,.electric-dashed,.optical-flow path')||(p.getAttribute('fill')==='none'&&/[Cc]/.test(d))){
   const n=hashOf(d)%100,color=heat(n<12?20:n<35?45:n<94?75:95);p.setAttribute('stroke',color);p.style.stroke=color;
  }
 });
};
