const brandWordmark=document.createElement('div');brandWordmark.className='brand-wordmark';brandWordmark.innerHTML='<span class="brand-imaster">iMaster</span><span class="brand-ccae">CCAE</span>';$('top').append(brandWordmark);

// All KPI rows reuse one icon renderer, including resource detail pages.
const unifiedMetricIcon=metricIcon;
metricIcon=function(label){const kind=metricKind(label);return kind==='npu'?cardLegendIcon('N'):kind==='cpu'?cardLegendIcon('C'):unifiedMetricIcon(label)};
const unifiedKpiDecorate=hfDecorateKPI;
hfDecorateKPI=function(){unifiedKpiDecorate();$('kpis').querySelectorAll('.k').forEach(label=>{label.querySelectorAll('img,svg').forEach(icon=>icon.remove());label.insertAdjacentHTML('afterbegin',metricIcon(label.textContent));});};
if(window.__roomBooted)render();

// Deterministic demo telemetry for board-mounted components. Fan power is
// the sum of the physical fans; both tooltip and palette use this same value.
function hardwareMetrics(t){
 const {board}=modeDeviceContext(t),id=t.id||'',name=id.split('-Q').pop();
 const seed=[...id].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
 const fan=name.includes('风扇')||t.t==='fan',count=fan?(board?.fanCnt||(board?.cards?2:6)):name.includes('内存')?24:name.includes('硬盘')?4:1;
 const util=fan?48+seed%31:name.includes('内存')?(board?.mem??(38+seed%47)):name.includes('电源')?(board?.pwrp??(42+seed%38)):32+seed%49;
 if(fan){const power=60+seed%11;return {count,util,power,powerPct:power/100*100,rated:100};}
 const ratedPer=fan?36:name.includes('内存')?12:name.includes('硬盘')?18:2400;
 const powerPct=fan?35+seed%48:name.includes('内存')?38+seed%43:name.includes('硬盘')?29+seed%43:(board?.pwrp??55);
 return {count,util,powerPct,power:Math.round(count*ratedPer*powerPct/100),rated:count*ratedPer};
}
function restoreHardwareArtwork(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return;
 svg.querySelectorAll('[data-act="part"]').forEach(g=>{
  const t={...g.dataset,t:'part'},m=hardwareMetrics(t);
  if((g.dataset.id||'').includes('风扇')){
   g.querySelectorAll('circle').forEach(c=>c.setAttribute('fill',S.mode==='health'?'#35835d':heat(S.mode==='pwr'?powerBand(m.power):m.util)));
   g.setAttribute('aria-label',`风扇 ${m.count}个 · 功耗 ${m.power}W`);
  }
 });
 applyLoadContrast();
}
const hardwarePopContent=popContent;
popContent=function(t){const c=hardwarePopContent(t);if((t.t==='part'&&(t.id||'').includes('风扇'))||t.t==='fan'){
 const m=hardwareMetrics(t);c.body+=`<div class="hardware-power" style="margin-top:12px;border-top:1px solid #555;padding-top:10px">风扇功耗 <strong>${m.power} W</strong> · 额定 ${m.rated} W</div>`;
 }return c;};
const hardwareArtworkRender=render;render=function(){hardwareArtworkRender();restoreHardwareArtwork();};
const hardwareArtworkRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){hardwareArtworkRefresh();restoreHardwareArtwork();};
if(window.__roomBooted)render();

// Apply the shared 80% tint without dimming labels or stacking opacity on groups.
