/* Shared homepage story state. Business copy and timing follow the supplied demo. */
(()=>{
const U=HCEventUI,screen=document.getElementById('screen');
const story=window.HCStory=createHCStory();
const copy=window.HCStoryCopy={
 optical:['','发现链路闪断告警','30条告警聚合，生成链路闪断 issue','正在分析链路指标与设备日志','定位根因：光链路脏污','优雅隔离异常链路','待清污光链路','链路复核完成，已清污','关闭光链路清污待办','光链路隔离已取消'],
 qwen:['','发现 Qwen3.6 服务劣化告警','定位 D实例01 异常退出','自动切换 D实例恢复业务','分析 BMC、OS 与 vmcore 日志','定位根因：hinic3 网卡驱动版本过低','网卡驱动待升级','已确认网卡驱动升级完成','节点健康检查通过','节点重新加入资源池']};
const names={optical:'光链路脏污，待清污',qwen:'Qwen3.6服务劣化：网卡驱动待升级'};
let guardView='manual';
const popoverVisits=new Map(),popoverHoldMs=2200;
function bindPopover(anchor,key,stage,startedAt){
 const previous=popoverVisits.get(key);
 if(previous)clearTimeout(previous.timer);
 const visit={stage,startedAt,timer:null};popoverVisits.set(key,visit);
 let hovered=false,focused=false;
 const show=()=>{clearTimeout(visit.timer);anchor.classList.add('story-visible');};
 const hide=()=>{clearTimeout(visit.timer);if(!hovered&&!focused)anchor.classList.remove('story-visible');};
 anchor.addEventListener('pointerenter',()=>{hovered=true;show();});
 anchor.addEventListener('pointerleave',()=>{hovered=false;visit.timer=setTimeout(hide,180);});
 anchor.addEventListener('focusin',()=>{focused=true;show();});
 anchor.addEventListener('focusout',e=>{focused=anchor.contains(e.relatedTarget);if(!focused)visit.timer=setTimeout(hide,180);});
 anchor.addEventListener('story-show',show);
 // New progress is announced once; hovering never races this timer.
 show();visit.timer=setTimeout(hide,popoverHoldMs);
}

const open=key=>{if(key==='optical')window.openOpticalEvent();else window.openNicEvent();};
const stateOf=(key,p)=>p===9?'closed':p===6?'manual':'auto';
const guardAutoRows=new Map(),cabinetTipCache=new Map();
const progressText=(key,p)=>copy[key][p].replace('生成链路闪断 issue','生成链路闪断issue').replace('正在分析链路指标与设备日志','分析链路指标与设备日志');
window.renderStoryGuard=(view=guardView)=>{
 guardView=view;
 const s=story.get(),automatic=['optical','qwen'].filter(k=>s[k]>0&&s[k]<6),manual=['optical','qwen'].filter(k=>s[k]===6);
 const box=C.GuardEvents({view:guardView==='auto'?'energy':'manual',onChange:v=>window.renderStoryGuard(v==='energy'?'auto':'manual'),onViewAll:window.openGuardEvents});
 box.querySelectorAll('.hc-event-row').forEach(n=>n.remove());
 box.querySelectorAll('[role="tab"]').forEach((n,i)=>{n.firstChild.textContent=i?'自动处理中 ':'待人工处理 ';n.querySelector('.hc-tab-count').textContent=i?automatic.length:manual.length;});
 for(const [key,cached] of guardAutoRows){if(guardView!=='auto'||!automatic.includes(key)||cached.stage!==s[key]||cached.startedAt!==s.startedAt){clearInterval(cached.timer);guardAutoRows.delete(key);}}
 const energyCount=window.HCEnergy?.get().applied?0:1;
 const energyTab=U.button('节能机会 '+energyCount,'',()=>window.renderStoryGuard('energy'));
 energyTab.setAttribute('role','tab');energyTab.setAttribute('aria-selected',String(guardView==='energy'));
 if(guardView==='energy')box.querySelectorAll('[role="tab"]').forEach(n=>{n.classList.remove('selected');n.setAttribute('aria-selected','false')});
 box.querySelector('.hc-tabs').append(energyTab);
 const entries=guardView==='energy'?[]:guardView==='auto'?automatic:manual;
 if(guardView==='energy'){
  if(energyCount){const row=U.el('article','hc-event-row hc-energy-opportunity'),head=U.el('div','hc-event-head'),icon=U.el('img');icon.src=HC_ASSETS.icons['节能+小手'];icon.width=icon.height=24;head.append(icon,U.el('span','','Qwen3.7 服务存在节能空间'),U.el('time','','00:38:12'));row.append(head,U.el('p','','凌晨低负载窗口可优化运行态策略，建议应用均衡模式'));row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label','查看Qwen3.7节能机会');row.onclick=()=>window.openEnergyEvent();row.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();window.openEnergyEvent()}};box.append(row)}
  else box.append(U.el('p','story-energy-empty','暂无待处理节能机会，可在查看全部中查看已生效策略'));
 }

 for(const key of entries){
  const cached=guardAutoRows.get(key);if(cached){box.append(cached.row);continue;}
  const row=U.el('article','hc-event-row'),head=U.el('div','hc-event-head'),processing=guardView==='auto';
  const icon=U.el(processing?'i':'img',processing?'story-step-icon working story-guard-ring':'');
  if(processing)icon.setAttribute('aria-label','自动处理中');else{icon.src=HC_ASSETS.icons['故障+小手'];icon.width=icon.height=24;}
  head.append(icon,U.el('span','',processing?copy[key][1]:names[key]),U.el('time','',key==='optical'?'12:00:00':'12:00:06'));
  const desc=U.el('p','',processing?'':key==='optical'?'计算柜11-L1交换机02链路已优雅隔离，等待人工清污':'节点112.34.23.1的hinic3驱动需由V11.8升级至V13.1');row.append(head,desc);
  row.setAttribute('role','button');row.tabIndex=0;row.setAttribute('aria-label',key==='optical'?'查看光链路脏污故障详情':'查看Qwen处理进度');row.onclick=()=>open(key);row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(key)}};
  if(processing){const chars=Array.from(progressText(key,s[key]));let count=0;const entry={row,stage:s[key],startedAt:s.startedAt,timer:null};entry.timer=setInterval(()=>{desc.textContent=chars.slice(0,++count).join('');if(count>=chars.length)clearInterval(entry.timer);},35);guardAutoRows.set(key,entry);}
  box.append(row);
 }
 if(!entries.length&&guardView!=='energy'){const empty=U.el('div','story-empty'),img=U.el('img');img.src=HC_ASSETS.icons['暂无待处理事项'];img.alt=guardView==='auto'?'暂无自动处理中的事件':'暂无待处理事项';if(guardView==='auto'){empty.classList.add('story-empty-processing');const art=U.el('div','story-empty-art');art.append(img);empty.append(art,U.el('span','story-empty-caption','暂无自动处理中事项'));}else empty.append(img);box.append(empty);}
 mount('home-events',box);
};
window.storyWorkloads=category=>HOME_WORKLOADS[category].map(item=>{const x={...item,data:{...item.data}},s=story.get();if(category==='inference'&&/^Qwen3.6/.test(x.data.name)){x.status=s.qwen>0&&s.qwen<=3?'degraded':'normal';x.data.faults=x.status==='normal'?'0':'1';x.data.processingText=s.qwen>0&&s.qwen<=3?copy.qwen[s.qwen]:'';x.data.processingManual=s.qwen===6}return x});
function metric(category,index,value){const g=document.querySelector('.hc-metric-group[data-category="'+category+'"]');const b=g?.querySelectorAll('.hc-metric-content>b')[index];if(b)b.firstChild.textContent=String(value);if(category==='resource'&&index===0)g.querySelector('.hc-metric-compact b').textContent=value}
function render(s){screen.dataset.storyOptical=s.optical;screen.dataset.storyQwen=s.qwen;
 for(const [key,visit] of popoverVisits){if(!s[key]||visit.startedAt!==s.startedAt){clearTimeout(visit.timer);popoverVisits.delete(key);}}
 const active=['optical','qwen'].filter(k=>s[k]>0&&s[k]<9).length;
 metric('resource',0,active);for(const category of ['training','inference']){const data=window.storyWorkloads(category);['interrupted','stuck','degraded','normal'].forEach((status,i)=>metric(category,i+1,data.filter(x=>x.status===status).length));metric(category,0,data.length)}
 const health=document.querySelector('.health-metrics .row-value p');health.firstChild.textContent=Math.min(2,active)+' ';
 document.querySelector('.health-row:nth-child(2) .row-value p').firstChild.textContent='0 ';
 document.querySelector('.cabinet-fault-link').hidden=!(s.optical>0&&s.optical<9);
 document.querySelector('.cabinet-red').hidden=!(s.qwen>0&&s.qwen<9);
 window.updateCompactStatusIcons?.();
 window.renderStoryGuard();
 const tips=document.getElementById('home-tips');for(const [key,tip] of cabinetTipCache){if(!s[key]||s[key]>=7||tip.dataset.startedAt!==String(s.startedAt)){clearTimeout(tip._copyTimer);tip.remove();cabinetTipCache.delete(key);}}const marks=document.getElementById('home-timeline-markers');const existingMarks=new Map([...marks.children].map(node=>[node.dataset.eventKey,node]));for(const node of marks.children){if(!s[node.dataset.eventKey]||node.dataset.startedAt!==String(s.startedAt))node.remove();}
 ['optical','qwen'].forEach((key,i)=>{const p=s[key];if(!p)return;const state=stateOf(key,p);
 if(state!=='closed'&&p<7){let tip=cabinetTipCache.get(key);if(!tip){tip=C.FaultTip({state:state==='auto'?'auto':key});tip.classList.add(key);tip.dataset.startedAt=s.startedAt;cabinetTipCache.set(key,tip);tips.append(tip);}const nextMode=state==='auto'?'auto':'manual';if(!tip.classList.contains(nextMode)){const oldCopy=tip.querySelector('span').textContent;const next=C.FaultTip({state:state==='auto'?'auto':key});tip.className=next.className+' '+key;tip.replaceChildren(...next.childNodes);tip.querySelector('span').textContent=oldCopy;}HCFadeTip(tip,copy[key][p]);tip.setAttribute('role','button');tip.tabIndex=0;tip.setAttribute('aria-label','查看'+(key==='optical'?'光链路脏污故障详情':'Qwen处理进度'));tip.onclick=()=>open(key);tip.onkeydown=e=>{if(e.key==='Enter')open(key)};}
 const existing=existingMarks.get(key);if(existing&&existing.dataset.stage===String(p)&&existing.dataset.startedAt===String(s.startedAt))return;existing?.remove();
 const anchor=U.el('div','marker-anchor');anchor.dataset.eventKey=key;anchor.dataset.stage=p;anchor.dataset.startedAt=s.startedAt;anchor.style.left=['calc(52.631579% - 0.921053px)','calc(63.157895% - 4.605263px)'][i];const marker=U.button('','story-marker '+state,()=>key==='optical'&&p>=6?window.openOpticalEvent({mode:'isolation'}):open(key));marker.setAttribute('aria-label',key+'：'+copy[key][p]);const icon=U.el('img');icon.src=HC_ASSETS.icons[state==='closed'?'灰色的故障':'红色的故障'];icon.alt='';marker.append(icon,U.el('span','','1'));if(state==='manual'){const hand=U.el('img','story-marker-hand');hand.src=HC_ASSETS.icons['红色小手'];hand.alt='待人工处理';marker.append(hand)}if(state==='auto')C.FlowBorder(marker);if(key==='qwen'&&state==='closed'){icon.src=HC_ASSETS.icons['红色小手'];icon.className='story-cleanup-hand';marker.replaceChildren(icon);}anchor.append(marker);
 if(key==='optical'&&p>=6){
   anchor.classList.add('story-split');anchor.dataset.followState=state;
   const shape=document.createElementNS('http://www.w3.org/2000/svg','svg');shape.setAttribute('class','story-split-shape');shape.setAttribute('viewBox','0 0 94 24');shape.setAttribute('aria-hidden','true');shape.innerHTML='<defs><linearGradient id="split-border"><stop offset="48%" stop-color="#777"/><stop offset="76%" stop-color="'+(state==='closed'?'#777':'#ed4a55')+'"/></linearGradient><linearGradient id="split-fill"><stop offset="50%" stop-color="#393939"/><stop offset="100%" stop-color="'+(state==='closed'?'#393939':'#613037')+'"/></linearGradient></defs><path d="M12 1H49C53 1 54 4 59 4S65 1 69 1H82A11 11 0 0 1 82 23H69C65 23 64 20 59 20S53 23 49 23H12A11 11 0 0 1 12 1Z" fill="url(#split-fill)" stroke="url(#split-border)" stroke-width="1.5"/>';anchor.prepend(shape);
   marker.className='story-marker closed';marker.dataset.part='isolation';marker.setAttribute('aria-label','光链路优雅隔离：已闭环');
   marker.querySelector('.story-marker-hand')?.remove();marker.querySelectorAll('.hc-flow-halo,.hc-flow-base,.hc-flow-ring').forEach(n=>n.remove());icon.src=HC_ASSETS.icons['灰色的故障'];
   const follow=U.button('','story-marker '+state,()=>window.openOpticalEvent({mode:'full'}));follow.dataset.part='cleanup';follow.setAttribute('aria-label','光链路清污：'+(state==='closed'?'已闭环':state==='manual'?'待人工处理':'自动处理中'));
   const symbol=U.el('img');symbol.alt='';symbol.src=HC_ASSETS.icons['红色小手'];symbol.className='story-cleanup-hand';follow.append(symbol);
   
   if(state==='auto')C.FlowBorder(follow);
   follow.setAttribute('aria-describedby','story-popover-'+key);anchor.append(follow);
 }
 const pop=U.el('div','story-popover');pop.id='story-popover-'+key;marker.setAttribute('aria-describedby',pop.id);
 let rows=copy[key].slice(1,Math.min(p,5)+1);if(p===6)rows=[...copy[key].slice(1,5),copy[key][6]];if(p>=7)rows=[...copy[key].slice(1,5),copy[key][p]];
 if(key==='optical'){rows=rows.map(t=>t==='30条告警聚合，生成链路闪断 issue'?'30条告警聚合，生成链路闪断issue':t==='正在分析链路指标与设备日志'?'分析链路指标与设备日志':t)}
 rows.forEach((text,i)=>{const last=i===rows.length-1,kind=last&&state!=='closed'?(state==='manual'?'manual':'working'):'done';const row=U.el('p','story-popover-row '+kind),status=U.el('i','story-step-icon '+kind);status.setAttribute('aria-label',kind==='done'?'已完成':kind==='manual'?'待人工处理':'处理中');if(kind==='manual'){const img=U.el('img');img.src=HC_ASSETS.icons['红色小手'];img.alt='';status.append(img)}row.append(status,U.el('span','',text));pop.append(row)});
 anchor.append(pop);marks.append(anchor);bindPopover(anchor,key,p,s.startedAt);
 });
 window.updateStoryRecords?.(rows=>rows.filter(r=>!['link','qwen'].includes(r.action)||s[{link:'optical',qwen:'qwen'}[r.action]]>0).map(r=>{const key={link:'optical',qwen:'qwen'}[r.action];if(key){const p=s[key],status=stateOf(key,p);r.stateClass=status==='closed'?'human-closed':status==='manual'?'manual':'processing';r.state={processing:'自动处理中',manual:'待人工处理','auto-closed':'已自动闭环','human-closed':'已人工闭环'}[r.stateClass];const businessStart={optical:12,qwen:12}[key]*3600;const elapsed=Math.max(0,Math.floor(((s[key+'ClosedAt']||s.startedAt)-s.startedAt-({optical:0,qwen:5700}[key]))/1000));const total=businessStart+elapsed;r.clear=status==='closed'?'今天 '+[Math.floor(total/3600),Math.floor(total/60)%60,total%60].map(n=>String(n).padStart(2,'0')).join(':'):'—';r.start='今天 '+({optical:'12:00:00',qwen:'12:00:06'}[key]);if(status!=='manual')r.name=key==='optical'?'光链路脏污':'Qwen3.6 服务劣化';}return r}).concat(s.optical>0?[{name:'光链路脏污，已自动优雅隔离',state:s.optical>=6?'已自动闭环':'自动处理中',stateClass:s.optical>=6?'auto-closed':'processing',type:'故障',object:'计算柜11-L1交换机02',root:'优雅隔离异常链路；清污待办转交人工处理',start:'今天 12:00:00',clear:s.optical>=6?'今天 12:00:09':'—',action:'link-auto'}]:[]));
 if(!document.getElementById('home-workloads').hidden)window.refreshWorkloadCards?.();
 window.dispatchEvent(new CustomEvent('hc-story-change',{detail:s}));
}
document.querySelector('#home-header select').addEventListener('change',e=>document.documentElement.dataset.runMode=e.target.value);
story.subscribe(render);window.addEventListener('hc-optical-complete',()=>story.complete('optical'));
const brand=document.querySelector('#home-header button');brand.onclick=()=>{HCClock.reset();window.resetEnergyEvent?.();window.resetOpticalEvent?.();window.resetNicEvent?.();document.getElementById('guard-all').hidden=true;guardView='manual';document.querySelector('#home-metrics .hc-ribbon').activate('resource',0,true);story.start();window.restartMascotEntrance?.();};brand.title='重新演示';

window.addEventListener('load',()=>story.start(),{once:true});
})();
