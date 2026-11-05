const removedStory=BUBBLES.findIndex(b=>b.at.id==='P11-S02');if(removedStory>=0)BUBBLES.splice(removedStory,1);
for(const b of BUBBLES.filter(b=>b.at.v==='swblade')){b.name='光模块脏污';b.impact=['光模块端面脏污导致光链路质量下降，影响 DeepSeek-R1 推理服务。'];b.fix=['检查并清洁光模块及光纤端面，复测光功率和误码率'];b.svcLabel='涉及的推理服务';b.svc=['DeepSeek-R1'];}
const cqeStory=BUBBLES.find(b=>b.at.id==='P03-N05-K1');Object.assign(cqeStory,{name:'总线网络CQE故障',impact:['超节点总线网络平面发生网络CQE故障，故障定位在 NPU 1 的 P01 端口。'],fix:['检查 P01 端口链路及对端状态，排查网络 CQE 错误后复测'],svcLabel:'涉及的训练任务',svc:['盘古大模型 · 预训练']});
const cqeCard=findPod('P03').npu.find(b=>b.id==='P03-N05').cards.find(k=>k.id==='P03-N05-K1');cqeCard.mem.ecc_iso=0;
D.alarms=D.alarms.filter(a=>!a.o.includes('P11-S02'));
for(const a of D.alarms){const b=BUBBLES.find(b=>a.o.startsWith(b.at.id));if(b){a.t=b.name;a.d=b.impact.join('');if(b===cqeStory)a.o='P03-N05-K1 · P01';}}
const storyPop=popContent;popContent=function(t){const c=storyPop(t);if(t.id==='P03-N05-K1'||t.id==='P03-N05-K1-P1'){c.note=bubNote(cqeStory);if(t.t==='dport'){c.name='NPU 1 · P01';c.meta='计算柜 03 / NPU刀片05 (U23) / NPU 1 / P01';}}return c};
const storyHover=showHover;showHover=function(t,el){storyHover(t,el);const icon=$('hcard').querySelector('.r4-hhead .r4-icon');if(icon&&$('hcard').querySelector('.r4-hfault'))icon.outerHTML='<svg class="r4-icon fault-alert-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 23 22H1Z" fill="#e7434a"/><path d="M12 8v7" stroke="white" stroke-width="2"/><circle cx="12" cy="18" r="1" fill="white"/></svg>';};
const storyStage=stageSVG;stageSVG=function(inner){const out=storyStage(inner);if(S.view.id!=='P03-N05-K1'||S.mode!=='health')return out;const svg=new DOMParser().parseFromString(out,'image/svg+xml').documentElement;const port=svg.querySelector('[data-act="dport"][data-id="P03-N05-K1-P1"] rect');if(port){port.setAttribute('fill','#e7434a');port.setAttribute('stroke','#ffb9bd');const x=+port.getAttribute('x'),y=+port.getAttribute('y');svg.insertAdjacentHTML('beforeend',`<g class="cqe-port-label" data-act="dport" data-id="P03-N05-K1-P1" data-pod="P03" data-blade="P03-N05" data-card="P03-N05-K1" pointer-events="all"><path d="M${x} ${y+10} h-28" stroke="#e7434a"/><rect x="${x-275}" y="${y-4}" width="247" height="28" rx="6" fill="#e7434a"/><text x="${x-265}" y="${y+15}" font-size="14" fill="white">P01 · 总线网络CQE故障</text></g>`)}return new XMLSerializer().serializeToString(svg)};

// Root status markers remain visible independently of the introductory animation.
const tipMeasure=document.createElement('canvas').getContext('2d');tipMeasure.font='18px Arial, PingFang SC, Microsoft YaHei, sans-serif';
const statusStage=stageSVG;
stageSVG=function(inner){const out=statusStage(inner);if(!r2Home())return out;const svg=new DOMParser().parseFromString(out,'image/svg+xml').documentElement;
 svg.querySelectorAll('[data-act="netdev"]').forEach(g=>{const r=g.querySelector('rect');if(!r)return;r.setAttribute('stroke',S.mode==='health'?'#38ad77':S.mode==='util'?'#6596ff':'#949494');r.setAttribute('stroke-width','1.2')});
 if(S.mode==='health'){
  svg.querySelectorAll('.r7-rack-link').forEach(p=>{const sw=D.pods.flatMap(p=>p.sw).find(s=>s.id===p.getAttribute('data-l1'));if(sw&&(swHasBadOm(sw)||sw.status!=='ok')){p.setAttribute('stroke','#e7434a');p.setAttribute('opacity','.8');p.setAttribute('stroke-width','1.1')}});
  const items=[];
  D.pods.forEach((p,pi)=>{const x=r2X(pi<8?pi:pi+4);
   if(S.face==='back')p.sw.forEach((sw,k)=>{if(swHasBadOm(sw)||sw.status!=='ok')items.push({x:x+14+k*20.8,y:675,t:'swblade',id:sw.id,pod:p.id,label:BUBBLES.find(b=>b.at.id===sw.id)?.name||'光模块异常'})});
   else p.npu.forEach(b=>{if(b.cards.some(c=>c.status!=='ok')){const g=[...svg.querySelectorAll('[data-act="npublade"]')].find(g=>g.getAttribute('data-id')===b.id),r=g?.querySelector('rect');items.push({x:x+46,y:r?+r.getAttribute('y'):650,t:'npu',id:b.cards.find(c=>c.status!=='ok').id,pod:p.id,blade:b.id,label:BUBBLES.find(f=>f.at.id===b.cards.find(c=>c.status!=='ok').id)?.name||'NPU 故障'})}});
  });
  items.forEach((b,i)=>{const w=Math.ceil(tipMeasure.measureText(b.label).width)+77,x=Math.max(32,Math.min(1860-w,b.x-w/2)),y=b.y-48-(i%2)*40;
   svg.insertAdjacentHTML('beforeend',`<g class="root-fault-bubble clk" transform="translate(${b.x*.1} ${b.y*.1}) scale(.9)" data-act="${b.t}" data-id="${b.id}" data-pod="${b.pod}" ${b.blade?`data-blade="${b.blade}"`:''}>
   <path d="M${b.x} ${b.y} L${b.x} ${y+36}" stroke="#e7434a" fill="none"/>
   <rect x="${x}" y="${y}" width="${w}" height="36" rx="12" fill="#e7434a"/>
   <path d="M${x+23} ${y+8} L${x+35} ${y+28} H${x+11} Z" fill="#fff" stroke="#fff" stroke-linejoin="round"/>
   <path d="M${x+23} ${y+14} V${y+21}" stroke="#e7434a" stroke-width="1.8" stroke-linecap="round"/><circle cx="${x+23}" cy="${y+25}" r="1" fill="#e7434a"/>
   <text x="${x+43}" y="${y+25}" fill="#fff" font-size="18">${esc(b.label)}</text>
   <path d="m${x+w-26} ${y+10} 8 8 -8 8" stroke="#fff" stroke-width="1.5" fill="none"/>
   </g>`)});

 }
 return new XMLSerializer().serializeToString(svg);
};
const statusRender=render;render=function(){statusRender();const b=$('flipBtn').querySelector('.fq'),count=S.mode==='health'?faceFaults(S.face==='front'?'back':'front'):0;b.classList.toggle('status-empty',count===0)};
if(window.__roomBooted)render();

/* 低负载沿用故障卡片布局，显示提醒级别与完整建议。 */
