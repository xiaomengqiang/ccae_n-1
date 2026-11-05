const lowLoadHover=showHover;
showHover=function(t,el){
  lowLoadHover(t,el);
  const h=$('hcard'),c=popContent(t);
  h.classList.toggle('low-load-hover',!!c.note?.lowLoad);
  if(!c.note?.lowLoad)return;
  const fault=h.querySelector('.r4-hfault');
  if(fault&&!fault.querySelector('h4'))fault.insertAdjacentHTML('beforeend',
    '<h4 data-icon="description">风险描述</h4><p>'+esc(c.note.l[0])+'</p><h4 data-icon="business">承载业务</h4><p>'+esc(c.note.l[1].replace('承载业务：',''))+'</p><h4 data-icon="suggestion">处理建议</h4><p>'+esc(c.note.fix)+'</p>');
  h.querySelectorAll('h4').forEach(x=>{if(x.textContent==='故障描述')x.textContent='风险描述';if(x.textContent==='影响业务')x.textContent='承载业务'});
  h.style.top=Math.max(200,Math.min(2134-h.offsetHeight,parseFloat(h.style.top)||200))+'px';
};

/* L2 全视图统一实心状态填充，文字使用深色。 */
function fillL2Devices(svg){
  if(!svg)return;
  svg.querySelectorAll('[data-act="netdev"]').forEach(g=>{
    const t={...g.dataset,t:'netdev'},o=findObj(t.t,t.id,t);
    const value=S.mode==='health'?null:modeDeviceValue(t);
    const color=S.mode==='health'?(o?.status==='err'?'#e7434a':o?.status==='warn'?'#F69E39':'#35835d'):(value==null?'#949494':heat(value));
    const r=g.querySelector('rect');if(!r)return;
    r.setAttribute('fill',color);r.setAttribute('fill-opacity','1');r.setAttribute('stroke','none');
    g.querySelectorAll('text').forEach(text=>{if(text.closest('[data-act]')===g){text.setAttribute('fill','#eee');text.style.fill='#eee';}});
  });
}
const solidL2Render=render;render=function(){solidL2Render();fillL2Devices($('stageInner').querySelector('svg'));
 if(S.view.lv==='logic'){
  const legend=$('r4-legend');if(legend)legend.innerHTML=S.mode==='health'?'<i style="background:#38ad77"></i>正常<i style="background:#e7434a"></i>故障':modePalette().map((c,i)=>'<i style="background:'+c+'"></i>'+scaleLabels()[i]).join('');
 }
};
const consolidationPop=popContent;popContent=function(t){const c=consolidationPop(t);
  if(c.note?.consolidation)c.body=c.body.replaceAll('未分配 · 空闲','智能问答 · 推理服务');return c;};
if(window.__roomBooted)render();

/* 缓慢遥测：沿原档位小幅变化，原地更新叠加层，不重建机柜与连线。 */
