function cpuDemoPower(board,i=0){const seed=[...(board?.id||'cpu')].reduce((n,c)=>n+c.charCodeAt(0),0);return 140+(seed+i*7)%21;}
function componentLegendIcon(name,glyph){if(name==='风扇')return '<svg viewBox="0 0 28 28" width="28" height="28" aria-label="风扇"><circle cx="14" cy="14" r="13" fill="#bbc2c7"/>'+fanBladesMarkup()+'</svg>';return '<svg viewBox="0 0 28 28" width="28" height="28" aria-label="'+name+'"><rect x="2" y="3" width="24" height="22" rx="3" fill="#bbc2c7"/><text x="14" y="15" text-anchor="middle" dominant-baseline="central" fill="#24292d" font-size="'+(glyph==='IO'?12:20)+'">'+glyph+'</text></svg>';}
function contextLegendItems(){
 const svg=$('stageInner').querySelector('svg');if(!svg)return '';
 const has=q=>!!svg.querySelector(q),home=r2Home(),front=S.face==='front';
 const square='<svg viewBox="0 0 28 28" width="28" height="28"><rect x="7" y="5" width="14" height="18" rx="1" fill="#bbc2c7"/><text x="14" y="15" dominant-baseline="central" text-anchor="middle" font-size="8" font-family="Arial" font-weight="700" fill="#24292d">LPO</text></svg>';
 let out='';
 if(home||has('[data-act="netdev"]'))out+='<svg viewBox="0 0 44 24" width="44" height="24"><rect x="1" y="4" width="42" height="16" rx="2" fill="#bbc2c7"/></svg><span>LingQu L2交换机</span>';
 if((home&&!front)||has('[data-act="swblade"],[data-act="uchip"]'))out+='<svg class="l1-board-legend" viewBox="0 0 28 28" width="28" height="28" aria-label="LingQu L1交换板"><rect x="8" y="1.5" width="12" height="25" rx=".5" fill="none" stroke="#bbc2c7" stroke-width="1.5"/><path d="M10 4h3v5h-3z M15 4h3v5h-3z M10 11h3v6h-3z M15 11h3v6h-3z M10 19h3v5h-3z M15 19h3v5h-3z" fill="#bbc2c7"/></svg><span>LingQu L1交换板</span>';
 if(!home&&has('[data-act="uchip"]'))out+=cardLegendIcon('U')+'<span>Union</span>';
 if(home?front:has('[data-act="npu"]'))out+=cardLegendIcon('N')+'<span>NPU</span>';
 if(home?front:has('[data-act="cpu2"],[data-act="cpublade"],[data-act="cpu"]'))out+=cardLegendIcon('C')+'<span>CPU</span>';
 if(home?!front:has('[data-act="om"]'))out+=square+'<span>LPO光模块</span>';
 for(const [name,glyph] of [['内存','▤'],['硬盘','▣'],['风扇','✣'],['电源','ϟ']]){
  if(has('[data-act="part"][data-id*="'+name+'"]'))out+=componentLegendIcon(name,glyph)+'<span>'+name+'</span>';
 }
 if(!home&&has('[data-act="ioblade"],[data-act="ichip"]'))out+=componentLegendIcon('Union芯片','IO')+'<span>Union芯片</span>';
 if(!home&&has('.electric-dashed'))out+='<svg class="electric-legend" viewBox="0 0 90 18" style="width:90px;height:18px;flex:none;margin-left:24px"><path d="M0 9H90" fill="none" stroke="#62b997" stroke-width="1.4" stroke-dasharray="9 10"/></svg><span>CableTray</span>';
 if(home||has('.fiber-link,.r7-rack-link,.r4-l2-link')||has('[data-act="om"]')&&has('[data-act="netdev"]'))out+='<svg class="fiber-legend" viewBox="0 0 90 18"><path d="M0 9H90" stroke="#62b997" fill="none"/><g/></svg><span>Fiber</span>';
 return out;
}
function cardLegendIcon(letter){return '<svg class="card-legend-icon" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" style="width:28px;height:28px;flex:none"><rect x="1" y="1" width="26" height="26" rx="3" fill="#bbc2c7"/><text x="14" y="14" text-anchor="middle" dominant-baseline="central" fill="#24292d" font-family="Arial,sans-serif" font-size="20" font-weight="700">'+letter+'</text></svg>';}
// One centered legend shared by every view, with both connection types.
const centeredLegendRender=render;
render=function(){
 centeredLegendRender();
 $('stageInner').querySelectorAll('.home-status-legend,svg > .fiber-legend').forEach(el=>el.remove());
 const legend=$('r4-legend');if(!legend)return;
 const colors=S.mode==='health'?[['#e7434a','紧急'],['#f79700','重要'],['#f7d532','次要'],['#2070f3','提示'],['#29996b','正常']]:modePalette().map((c,i)=>[c,scaleLabels()[i]]);
 legend.innerHTML='<div class="legend-row"><span class="legend-title">设备器件</span>'+contextLegendItems()+'</div><div class="legend-row"><span class="legend-title">'+(S.mode==='health'?'故障状态':S.mode==='pwr'?'实际功率':'负载利用率')+'</span>'+colors.map(([c,label])=>'<i style="background:'+c+'"></i><span>'+label+'</span>').join('')+(S.mode==='pwr'?'<i style="background:#949494"></i><span>无计量</span>':'')+'</div>';
 Object.assign(legend.style,{display:'flex',left:'50%',right:'auto',bottom:'30px',transform:'translateX(-50%) scale(1.2)',transformOrigin:'center bottom'});
 const electric=legend.querySelector('.electric-legend path');
 if(electric)electric.setAttribute('stroke',S.mode==='health'?'#62b997':'#9ba7ad');
 if(electric&&!CCAE_MOTION.REDUCED){const motion=electric.animate([{strokeDashoffset:0},{strokeDashoffset:-19}],{duration:1100,iterations:Infinity,easing:'linear'});flowHandles.push({clear(){motion.cancel()}});}
 if(legend.querySelector('.fiber-legend g'))flowHandles.push(CCAE_MOTION.attachOpticalFlow(legend.querySelector('.fiber-legend g'),['M 0 9 L 90 9'],{layers:[[48,.055],[22.5,.14],[5,.30]],width:1.35,speedPxS:90,cycleMs:1600,staggerMs:0}));
};
if(window.__roomBooted)render();


