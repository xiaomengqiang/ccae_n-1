function l2DemoWatts(id){const seed=hashOf(id+':energy-color'),band=seed%10;return band<8?145+seed%80:band===8?65+seed%30:280+seed%80;}
function showL2Power(){
 if(S.mode!=='pwr')return;const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('[data-act="netdev"]').forEach(g=>{
 const watts=l2DemoWatts(g.dataset.id);g.setAttribute('aria-label',g.dataset.id+' 功耗 '+watts+' W');
 if(svg.classList.contains('r2-home-svg'))return;
 const texts=[...g.querySelectorAll(':scope > text')];if(texts.length>1)texts[1].textContent='互联芯片 2 · '+watts+' W';
 });
}
const l2PowerRender=render;render=function(){l2PowerRender();showL2Power();};
const l2PowerRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){l2PowerRefresh();showL2Power();};if(window.__roomBooted)render();

// Union context: only related LPOs respond to a single click; double-click changes context.
