// nic-event 命令式事件逻辑（从 legacy.js 提取，绘制/拓扑/连线保持原样）
// 硬编码坐标和连线数据后续讨论是否抽公共拓扑框架

let cleanup = null;

export function mountNicEvent() {

const U=HCEventUI,screen=document.getElementById('screen');
let panel=null,expanded=Array(6).fill(true),selected=null,draft='',stopLive=null,entrance=null;
const sections=[
 {title:'事件感知',at:1,text:'推理服务劣化 12:05:12\n业务影响：Qwen-1.5B 请求成功率降至77.5%\n实例异常：D-08 实例异常退出，服务持续劣化'},
 {title:'业务故障诊断',at:2,text:'12:05:22 完成业务故障诊断：节点操作系统崩溃重启，导致 D-08 实例异常退出',chain:['操作系统崩溃重启','D-08 实例异常退出','Qwen-1.5B 请求成功率降至77.5%']},
 {title:'业务恢复方案决策',at:3,text:'12:05:30 评估节点切换方案\n12:05:40 因无可替换节点，无法生成可执行的业务恢复方案'},
 {title:'资源故障诊断',at:4,text:'12:05:56 完成 BMC、OS 日志与 vmcore 综合分析：hinic3 网卡驱动版本过低导致操作系统崩溃重启，进而导致服务劣化',chain:['网卡驱动版本过低','操作系统内存耗尽','内核空指针异常','操作系统崩溃重启','D-08 实例异常退出','Qwen-1.5B 服务劣化']},
 {title:'资源恢复方案决策',at:6,text:'12:06:06 已生成网卡升级方案：将 hinic3 驱动由 V11.8 升级至 V13.1\n无可替换节点，采用原节点人工升级方案；升级后核查驱动版本、D-08 实例和 Qwen-1.5B 服务'},
 {title:'故障恢复',at:6,text:'',manual:true}
];
const flow=[
 ['事件感知','服务劣化／D-08 实例异常',0,'12:05:12',1],
 ['业务故障诊断','定位直接原因／操作系统崩溃重启',1,'12:05:22',2],
 ['业务恢复方案决策','评估节点切换方案',2,'12:05:30',3],
 ['业务恢复方案决策','无可替换节点／无可用方案',2,'12:05:40',3],
 ['资源故障诊断','BMC日志分析',3,'12:05:48',4],
 ['资源故障诊断','OS日志分析',3,'12:05:48',4],
 ['资源故障诊断','vmcore分析',3,'12:05:48',4],
 ['资源故障诊断','综合分析／网卡驱动版本低',3,'12:05:56',5],
 ['资源恢复方案决策','生成网卡升级方案',4,'12:06:06',6],
 ['故障恢复','等待人工授权升级',5,'12:06:06',6],
 ['故障恢复','人工授权／开始升级网卡驱动',5,'12:06:12',7],
 ['故障恢复','驱动升级完成／核查节点与实例健康',5,'12:06:20',8],
 ['故障恢复','健康核查通过／服务恢复，事件闭环',5,'12:06:35',9]
];
function renderOriginalTopology(topology){
 renderHexagons(topology);
 const racks=U.el('div','nic-cabinet-detail');
 const crop=U.el('div','nic-cabinet-crop');crop.append(U.el('div','nic-cabinet-image'));const ips=['112.34.13.2','112.34.13.3','112.34.13.4','112.34.13.5','112.34.13.6','112.34.13.7','112.34.14.4','112.34.14.5','112.34.14.7','113.232.33.3','112.34.23.1'];
 ips.forEach((ip,i)=>{if(ip==='113.232.33.3')return;const rack=i<8?12:13,slot=i<8?i:i-8,side=i===9?'in':i===10?'out':'normal';const cpuY=[65,84,103,122,272,291,310,329][slot],npuY=160+slot*14.5;['CPU','NPU'].forEach(kind=>{const mark=U.el('span','nic-blade-highlight '+side,'');mark.dataset.ip=ip;mark.dataset.rack=String(rack);mark.dataset.kind=kind;Object.assign(mark.style,{left:(rack===12?4:80)+'px',top:(kind==='CPU'?cpuY:npuY)+'px',width:'66px',height:(kind==='CPU'?18:14)+'px'});const u=kind==='CPU'?[18,17,16,15,4,3,2,1][slot]:12-slot;mark.dataset.u='U'+String(u).padStart(2,'0');mark.append(U.el('span','nic-blade-u-label',kind+' '+mark.dataset.u));mark.title=ip+' · 计算柜'+rack+' · '+kind+' '+mark.dataset.u+'（演示映射）';mark.setAttribute('aria-label',mark.title);crop.append(mark)});});
 [1,3,4,5,6,7].forEach(slot=>{['CPU','NPU'].forEach(kind=>{const mask=U.el('span','nic-blade-unmapped');Object.assign(mask.style,{left:'80px',top:(kind==='CPU'?[65,84,103,122,272,291,310,329][slot]:160+slot*14.5)+'px',width:'66px',height:(kind==='CPU'?18:14)+'px'});mask.setAttribute('aria-hidden','true');crop.append(mask)});});
 const selectMapping=ip=>{crop.classList.add('nic-mapping-focus');crop.querySelectorAll('.nic-blade-highlight').forEach(mark=>mark.classList.toggle('linked',mark.dataset.ip===ip));};selectMapping('112.34.23.1');
 topology.querySelectorAll('.nic-hex-node').forEach(node=>{const ip=node.querySelector('.nic-ip').textContent;node.dataset.ip=ip;node.tabIndex=0;const show=()=>selectMapping(ip),clear=()=>selectMapping('112.34.23.1');node.addEventListener('pointerenter',show);node.addEventListener('pointerleave',clear);node.addEventListener('focus',show);node.addEventListener('blur',clear);});
 racks.append(U.el('strong','nic-rack-title','超节点01'),crop);['left','right'].forEach(side=>{const context=U.el('div','nic-rack-context '+side);context.setAttribute('aria-hidden','true');const art=crop.querySelector('.nic-cabinet-image').cloneNode();context.append(art);racks.append(context);requestAnimationFrame(()=>{if(crop.isConnected)art.style.backgroundImage=getComputedStyle(crop.querySelector('.nic-cabinet-image')).backgroundImage})});
 const labels=U.el('div','nic-cabinet-labels');
 const names=['计算柜12','计算柜13'];
 names.forEach(name=>labels.append(U.el('span',name==='计算柜12'||name==='计算柜13'?'active':'',name)));
 racks.append(labels);topology.append(racks);

}
function renderHexagons(topology){
 const grid=U.el('div','nic-native-topology');
 const groups=[['P 节点 · 2',['112.34.13.2','112.34.13.3']],['D 节点 · 8',['112.34.13.4','112.34.13.5','112.34.13.6','112.34.13.7','112.34.14.4','112.34.14.5','112.34.14.7','112.34.23.1']]];
 groups.forEach(([name,ips],g)=>{const box=U.el('div','nic-instance-group');box.append(U.el('small','',name));const row=U.el('div','nic-hex-row');ips.forEach((ip,i)=>{const fault=ip==='112.34.23.1',node=U.el('div','nic-hex-node'+(fault?' nic-fault-node':'')),hex=U.el('div','nic-hex'+(fault?' fault':'')),cells=U.el('div','nic-hex-cells');for(let c=0;c<10;c++)cells.append(U.el('span','',c<8?'N':'C'));hex.append(cells);node.append(U.el('strong','nic-instance-name',(g?'D-':'P-')+String(i+1).padStart(2,'0')+' 实例'),hex,U.el('span','nic-ip',ip));row.append(node);});box.append(row);grid.append(box);});grid.append(U.el('div','nic-upgrade-tip'));topology.append(grid);
}
function close(){stopLive?.();stopLive=null;entrance?.stop();entrance=null;panel?.remove();panel=null;}
window.closeNicEvent=close;
window.resetNicEvent=()=>{close();expanded=Array(6).fill(true);selected=null;draft='';};
window.openNicEvent=()=>{
 if(panel)return;
 let stage=Math.max(1,window.HCStory?.get().qwen??6);selected=null;expanded=sections.map((_,i)=>stage<9&&i===(stage>=6?5:stage>=4?3:stage>=3?2:stage>=2?1:0));
 window.closeEnergyDetail?.();window.closeOpticalEvent?.();
 panel=U.el('section','hc-event-module hc-nic-module nic-unified');panel.dataset.detailMode='unified';panel.setAttribute('aria-label','Qwen网卡驱动业务故障详情');
 const left=U.el('aside','evt-left'),head=U.el('div','evt-event-heading'),back=U.button('','evt-back',close);back.setAttribute('aria-label','返回');back.append(U.icon('返回-原稿尺寸',20));
 const heading=U.el('div','evt-heading-copy');heading.append(U.el('h1'),U.el('time','','2026-09-09 12:05:12'));head.append(back,heading);left.append(head);
 const intro=U.el('div','evt-diagnosis-intro'),introCopy=U.el('p'),all=U.button('收起全部','evt-expand-all',()=>{const visible=sections.map((s,i)=>viewStage()>=s.at?i:-1).filter(i=>i>=0),next=!visible.every(i=>expanded[i]);visible.forEach(i=>expanded[i]=next);renderHistory();});intro.append(introCopy);
 const history=U.el('div','evt-diagnostic-scroll');left.append(history);
 const composerWrap=U.el('div','evt-composer-wrap'),composer=HCComponents.Composer({value:draft,onSend:()=>{}});composer.querySelector('input').addEventListener('input',e=>draft=e.target.value);composerWrap.append(composer);left.append(composerWrap);
 const right=U.el('main','evt-right'),toolbar=U.el('div','evt-detail-toolbar');toolbar.append(U.el('span','','诊断详情'));right.append(toolbar);
 const service=U.el('section','nic-service'),label=U.el('div','nic-service-title'),metrics=U.el('div','nic-metrics');service.append(label,metrics);
 const topology=U.el('div','nic-instance-topology');renderOriginalTopology(topology);service.append(topology);right.append(service);
 const process=U.el('section','nic-process');process.append(U.el('h2','','处理环节'));const flowList=U.el('div','nic-flow');flowList.setAttribute('role','tablist');const flowViewport=U.el('div','nic-flow-viewport');flowViewport.append(flowList);process.append(flowViewport);right.append(process);let lastFlowStage=-1;flowViewport.addEventListener('scroll',()=>flowViewport.classList.toggle('has-earlier',flowViewport.scrollLeft>1));
 // Service journey retains metric overlays, event tooltips and historical replay.
 let journeySecond=null,activeView=0;
 const latestSecond=()=>[0,12,22,40,48,56,66,72,80,120][stage];
 const stageAt=t=>t<12?0:t<22?1:t<30?2:t<48?3:t<56?4:t<66?5:t<72?6:t<80?7:t<95?8:9;
 const viewStage=()=>journeySecond===null?stage:Math.min(stage,stageAt(journeySecond));
 const currentSection=v=>v>=6?5:v>=4?3:v>=3?2:v>=2?1:0;
 const timeLabel=t=>'12:'+String(5+Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
 const tabs=U.el('div','nic-view-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','处理过程视图');process.querySelector('h2').replaceWith(tabs);
 const journey=U.el('div','nic-service-journey');journey.setAttribute('role','tabpanel');journey.setAttribute('aria-label','推理服务旅程');
 const legend=U.el('div','nic-journey-legend'),metricSelect=U.el('select','nic-journey-metric');metricSelect.setAttribute('aria-label','叠加性能指标');
 const journeyMetrics={ttft:{label:'TTFT P99',unit:'ms',normal:182,bad:186},tpot:{label:'TPOT P99',unit:'ms',normal:23.6,bad:43},success:{label:'请求成功率',unit:'%',normal:99.94,bad:77.5},rate:{label:'请求速率',unit:'req/s',normal:1840,bad:1840},concurrency:{label:'并发请求',unit:'',normal:892,bad:892},output:{label:'输出吞吐',unit:'k tok/s',normal:11.2,bad:8.7}};
 Object.entries(journeyMetrics).forEach(([key,m])=>{const o=U.el('option','',m.label);o.value=key;metricSelect.append(o);});
 const metricLabel=U.el('label','nic-journey-metric-label');metricLabel.append(U.el('span','','━'),metricSelect);legend.append(U.el('span','','▥ 请求数'),metricLabel,U.el('span','nic-journey-fault','▲ 故障'),U.el('span','nic-journey-operation','⇄ 处置操作'));journey.append(legend);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1280 156');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('tabindex','0');svg.setAttribute('role','img');
 const hover=U.el('div','nic-journey-hover');hover.hidden=true;hover.setAttribute('role','tooltip');journey.append(svg,hover);process.append(journey);
 const replay=U.el('div','nic-journey-replay'),replayTime=U.el('span'),latest=U.button('返回最新','',()=>{journeySecond=null;selected=null;expanded=sections.map((_,i)=>stage<9&&i===currentSection(stage));render();});replay.append(replayTime,latest);process.append(replay);
 function switchView(i){activeView=i;viewButtons.forEach((b,j)=>b.setAttribute('aria-selected',String(i===j)));flowList.hidden=i===0;flowViewport.hidden=i===0;journey.hidden=i===1;if(i===1)requestAnimationFrame(drawFlowLines);}
 const viewButtons=['服务旅程','处理环节'].map((name,i)=>{const b=U.button(name,'nic-view-tab',()=>switchView(i));b.setAttribute('role','tab');tabs.append(b);return b;});switchView(0);
 const position=t=>t/120*1280;
 const journeyEvents=()=>[[6,'操作系统崩溃重启','节点 112.34.23.1 操作系统崩溃重启','fault',1],[9,'D-08 实例异常退出','节点 112.34.23.1 的 D-08 实例因操作系统崩溃重启而异常退出','fault',1],[12,'推理服务劣化','Qwen-1.5B 请求成功率降至77.5%','fault',1],[72,'人工授权升级','正在执行网卡驱动升级，服务尚未恢复','operation',7],[80,'驱动升级完成','hinic3 已升级至 V13.1，正在核查节点、实例和服务健康','operation',8],[95,'健康核查通过','原节点及 D-08 实例健康核查通过，Qwen-1.5B 服务恢复','operation',9]].filter(e=>stage>=e[4]);
 const degradedAt=t=>t>=12&&!(stage===9&&t>=95);
 function renderJourney(){
  const m=journeyMetrics[metricSelect.value],end=latestSecond(),badEnd=stage===9?95:end;let chart='';
  if(end>=12)chart+='<rect x="'+position(12)+'" y="4" width="'+position(badEnd-12)+'" height="96" rx="4" fill="#f5a544" opacity=".16"/>';
  for(let i=0;i<=end;i++){const height=34+Math.sin(i*1.7)*9+(i%7)*2;chart+='<rect x="'+position(i)+'" y="'+(77-height)+'" width="6" height="'+height+'" rx="1" fill="#87bfe9" opacity=".85"/>';}
  const normalY=m.bad<m.normal?24:53,badY=m.bad===m.normal?normalY:m.bad<m.normal?62:21;
  [[0,Math.min(12,end),'#55c8a0'],[12,badEnd,'#ffad52'],[95,stage===9?end:95,'#55c8a0']].forEach(([start,stop,color])=>{if(stop<=start)return;let d='';for(let t=start;t<=stop;t++){const y=(degradedAt(t)?badY:normalY)+Math.sin(t*1.7)*.6;d+=(t===start?'M':'L')+position(t)+' '+y;}chart+='<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2"/>';});
  chart+='<rect x="0" y="83" width="1280" height="17" rx="4" fill="#414141"/><rect class="journey-resource-lane" x="0" y="106" width="1280" height="17" rx="4" fill="#414141"/>';
  if(end>=12)chart+='<rect x="'+position(12)+'" y="83" width="'+position(badEnd-12)+'" height="17" fill="#ed9a36"/><text x="'+(position(12)+8)+'" y="96" fill="white" font-size="12">'+'服务劣化'+'</text>';
  journeyEvents().forEach(([t,name,detail,type])=>{const x=position(t),fault=type==='fault';chart+='<g class="journey-event" tabindex="0" role="button" aria-label="'+timeLabel(t)+' '+name+'" data-type="'+type+'" data-second="'+t+'"><rect x="'+(x-(fault?5:9))+'" y="104" width="'+(fault?10:18)+'" height="22" fill="transparent"/>'+(fault?'<path d="M'+x+' 108 l-4.5 11 h9 Z" fill="#ed747c"/>':'<circle cx="'+x+'" cy="115" r="7" fill="#252b33" stroke="#7bb8f6"/><text x="'+x+'" y="119" text-anchor="middle" fill="#7bb8f6" font-size="12">⇄</text>')+'</g>';});
  [0,12,40,66,95,120].forEach(t=>{chart+='<text x="'+position(t)+'" y="151" text-anchor="'+(t===120?'end':'start')+'" fill="#bcbcbc" font-size="12">'+timeLabel(t)+'</text>';});
  if(journeySecond!==null)chart+='<line x1="'+position(journeySecond)+'" x2="'+position(journeySecond)+'" y1="0" y2="133" stroke="#80bfff" stroke-width="2"/>';
  svg.innerHTML=chart;svg.dataset.metric=metricSelect.value;svg.setAttribute('aria-label',m.label+'与请求数，'+(stage===9?'人工升级及健康核查后服务恢复':'服务持续劣化，尚未恢复'));replay.hidden=journeySecond===null;replayTime.textContent=journeySecond===null?'':'回看 '+timeLabel(journeySecond);hover.hidden=true;
 }
 let hoverSecond=0;
 function showJourneyPoint(t){t=Math.max(0,Math.min(latestSecond(),Math.round(t)));hoverSecond=t;const m=journeyMetrics[metricSelect.value],bad=degradedAt(t);hover.replaceChildren();const heading=U.el('div','nic-journey-hover-heading');heading.append(U.el('strong','',timeLabel(t)),U.el('span',bad?'degraded':'normal',bad?'服务劣化':'服务正常'));const values=U.el('dl');values.append(U.el('dt','','请求数'),U.el('dd','',String(Math.round((34+Math.sin(t*1.7)*9+(t%7)*2)*40))+' 次'),U.el('dt','',m.label),U.el('dd','',(bad?m.bad:m.normal)+' '+m.unit));hover.append(heading,values);const event=journeyEvents().find(e=>e[0]===t);if(event){const card=U.el('section','journey-event-card');const eventTitle=U.el('strong','journey-event-name',event[1]);if(event[3]==='fault'){const faultIcon=U.icon('红色的故障',14);faultIcon.setAttribute('aria-label','故障');eventTitle.prepend(faultIcon);}else{const operationIcon=U.el('span','journey-operation-icon','⇄');operationIcon.setAttribute('role','img');operationIcon.setAttribute('aria-label','处置操作');eventTitle.prepend(operationIcon);}card.append(eventTitle,U.el('p','journey-event-detail',event[2]));hover.append(card);}hover.style.left=Math.max(0,Math.min(journey.clientWidth-300,t/120*journey.clientWidth+14))+'px';hover.hidden=false;}
 function selectTime(t){journeySecond=Math.max(0,Math.min(latestSecond(),Math.round(t)));const v=viewStage();selected=null;expanded=sections.map((_,i)=>v>0&&i===currentSection(v));render();}
 const pointerTime=e=>{const point=e.target.closest?.('.journey-event');return point?Number(point.dataset.second):(e.clientX-svg.getBoundingClientRect().left)/svg.getBoundingClientRect().width*120;};
 svg.addEventListener('pointermove',e=>showJourneyPoint(pointerTime(e)));svg.addEventListener('pointerleave',()=>hover.hidden=true);svg.addEventListener('click',e=>{e.stopPropagation();selectTime(pointerTime(e));});svg.addEventListener('focusin',e=>showJourneyPoint(Number(e.target.dataset.second)||hoverSecond));svg.addEventListener('focusout',()=>hover.hidden=true);
 svg.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Enter',' ','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Escape'){hover.hidden=true;return;}if(e.key==='Enter'||e.key===' ')selectTime(Number(e.target.dataset.second)||hoverSecond);else showJourneyPoint(hoverSecond+(e.key==='ArrowRight'?1:-1));}});
 metricSelect.onchange=renderJourney;
 function focus(i){journeySecond=null;selected=i;updateService();renderJourney();expanded[flow[i][2]]=true;renderHistory();renderFlow();history.querySelector('[data-section="'+flow[i][2]+'"]')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
 function updateService(){
  const repaired=viewStage()===9||journeySecond!==null&&journeySecond<12;panel.dataset.stage=stage;panel.dataset.replay=String(journeySecond!==null);service.classList.toggle('nic-service-recovered',repaired);
  head.querySelector('.hc-event-type-icon')?.remove();const symbol=HCComponents.EventTypeIcon({closed:repaired,size:36});symbol.classList.add('evt-icon');if(viewStage()===6){const flags=U.el('span','fault-status-flags');flags.append(U.icon('红色小手',13),U.el('b','business-impact-symbol','✱'));symbol.append(flags);}head.append(symbol);
  heading.querySelector('h1').textContent=stage===9?'Qwen-1.5B服务已恢复，网卡故障已闭环':'Qwen-1.5B服务劣化：网卡驱动版本低';
  introCopy.textContent=repaired?'网卡驱动升级与服务健康核查完成，事件已闭环':viewStage()===6?'无可替换节点，服务仍劣化，请人工升级网卡驱动':viewStage()>=7?'已确认人工升级，正在执行修复与健康核查':'正在诊断业务故障并评估恢复方案';
  label.replaceChildren(U.el('span','','Qwen-1.5B服务'),U.Badge(repaired?'正常':'劣化',repaired?'done':'degraded'));metrics.replaceChildren();
  [['请求成功率',repaired?'99.94%':'77.5%'],['请求速率','1840 req/s'],['TTFT P99',repaired?'182 ms':'186 ms'],['TPOT P99',repaired?'23.6 ms':'43 ms'],['并发请求','892'],['输出吞吐',repaired?'11.2 k tok/s':'8.7 k tok/s']].forEach(([name,value])=>{const item=U.el('div'),number=U.el('strong'),parts=value.match(/^([\d.]+)\s*(.*)$/);number.append(document.createTextNode(parts[1]),U.el('span','nic-metric-unit',parts[2]));item.append(U.el('small','',name),number);metrics.append(item);});
  const fault=topology.querySelector('.nic-fault-node');const healthyNode=viewStage()===9||journeySecond!==null&&journeySecond<6;fault.querySelector('.nic-hex').classList.toggle('fault',!healthyNode);fault.dataset.nodeState=repaired?'服务已恢复':viewStage()===7?'驱动升级中':viewStage()===8?'健康核查中':'故障节点';
  topology.querySelector('.nic-cabinet-crop').classList.toggle('nic-mapping-healthy',healthyNode);
  const tip=topology.querySelector('.nic-upgrade-tip');tip.replaceChildren();const title=U.el('strong','',repaired?'网卡驱动升级完成':viewStage()>=5?'待升级网卡驱动版本':'操作系统崩溃重启');title.prepend(U.icon(repaired?'完成':'红色的故障',17));tip.append(title,U.el('p','',repaired?'112.34.23.1 · hinic3 V13.1，D-08 实例与推理服务健康核查通过':'112.34.23.1 · CPU02 · hinic3 V11.8；无可替换节点，Qwen-1.5B 服务持续劣化'));
  if(viewStage()===6&&journeySecond===null){const status=U.el('span','nic-tip-manual-icon');status.setAttribute('aria-label','待人工处理');status.append(U.icon('红色的故障',17));const flags=U.el('span','fault-status-flags');flags.append(U.icon('红色小手',12));status.append(flags);title.replaceChildren(status,U.el('span','','待升级网卡驱动版本'),U.Badge('根因','manual'));tip.querySelector('p').textContent='112.34.23.1 · CPU02 · hinic3 当前版本为 V11.8，版本过低，需升级至 V13.1';}
  if(journeySecond!==null&&journeySecond>=10&&journeySecond<12){tip.replaceChildren(U.el('strong','','节点异常，服务影响尚未上报'));fault.dataset.nodeState='故障节点';}
  if(journeySecond!==null&&journeySecond<6){tip.replaceChildren(U.el('strong','','故障发生前，节点和服务正常'));fault.dataset.nodeState='正常节点';}
  const stepTips=[
   ['D-08实例异常退出','Qwen-1.5B 请求成功率降至 77.5%，D-08 实例异常退出','fault'],
   ['操作系统崩溃重启','112.34.23.1 操作系统崩溃重启，导致 D-08 实例退出并影响 Qwen-1.5B 服务','fault'],
   ['评估节点切换方案','正在检查可用替换节点，评估 D-08 实例迁移的可行性','processing'],
   ['无可用业务恢复方案','未找到可替换节点，无法生成可执行的节点切换方案，服务仍处于劣化状态','fault'],
   ['BMC 日志分析结果','112.34.23.1：关联节点重启记录，确认故障发生于 D-08 实例所在节点','done'],
   ['OS 日志分析结果','操作系统内存耗尽并崩溃重启，导致 D-08 实例异常退出','done'],
   ['vmcore 分析结果','发现内核空指针异常，结合 OS 日志与驱动版本信息进行根因分析','done'],
   ['待升级网卡驱动版本','112.34.23.1 · CPU02 · hinic3 V11.8 导致系统异常，进而影响 Qwen-1.5B 服务','root'],
   ['网卡升级方案已生成','将 112.34.23.1 的 hinic3 驱动由 V11.8 升级至 V13.1，随后核查节点、D-08 实例与服务健康','plan'],
   ['待升级网卡驱动版本','112.34.23.1 · CPU02 · hinic3 当前版本为 V11.8，版本过低，需升级至 V13.1','manual'],
   ['已人工授权，正在升级网卡驱动','112.34.23.1 · CPU02 · hinic3 V11.8 → V13.1，服务尚未恢复','processing'],
   ['网卡驱动升级完成，正在核查健康','hinic3 已升级至 V13.1，正在检查节点、D-08 实例及 Qwen-1.5B 服务','processing'],
   ['健康核查通过，事件已闭环','112.34.23.1 · hinic3 V13.1，节点与 D-08 实例健康核查通过，Qwen-1.5B 服务已恢复','done']
  ];
  const tipIndex=selected!==null?selected:journeySecond===null?(stage===6?9:stage===7?10:stage===8?11:stage===9?12:null):null;
  if(tipIndex!==null){const [name,copy,state]=stepTips[tipIndex>0&&tipIndex<7?1:tipIndex],heading=U.el('strong');
   if(state==='manual'){const icon=U.el('span','nic-tip-manual-icon');icon.setAttribute('aria-label','待人工处理');icon.append(U.icon('红色的故障',17));const flags=U.el('span','fault-status-flags');flags.append(U.icon('红色小手',12));icon.append(flags);heading.append(icon);}else heading.append(U.icon(state==='plan'?'报告图标':state==='done'?'完成':state==='processing'?'人工处理-绿色':'红色的故障',17));
   heading.append(U.el('span','',name));if(state==='manual'||state==='root')heading.append(U.Badge('根因','manual'));
   tip.replaceChildren(heading,U.el('p','',copy));tip.dataset.flowIndex=String(tipIndex);
  }else delete tip.dataset.flowIndex;
  topology.setAttribute('aria-label',repaired?'原节点完成网卡升级，Qwen服务恢复':'无可替换节点，D-08 实例异常，Qwen服务劣化');
 }
 function renderHistory(){
  const v=viewStage(),top=history.scrollTop;history.replaceChildren();const visible=sections.map((s,i)=>v>=s.at?i:-1).filter(i=>i>=0),allExpanded=visible.length>0&&visible.every(i=>expanded[i]);all.replaceChildren(U.icon('展开全部',12),U.el('span','',allExpanded?'收起全部':'展开全部'));all.setAttribute('aria-expanded',String(allExpanded));

  const group=U.el('section','nic-event-overview'),summary=U.el('section','nic-event-summary nic-summary-compact');summary.setAttribute('aria-label','事件摘要');summary.dataset.recovered=String(v===9);summary.append(U.el('div','nic-summary-heading','事件摘要'));
  summary.append(U.button(v>=5?'网卡驱动版本低导致系统崩溃、D-08 实例退出，影响 Qwen-1.5B 服务':v>=2?'节点操作系统崩溃重启，导致 D-08 实例异常退出':v>0?'Qwen-1.5B 服务劣化，正在定位故障':'故障发生前，节点和服务运行正常','nic-summary-conclusion',()=>{if(v>0)focus(v>=5?7:v>=2?1:0);}));
  const facts=U.el('div','nic-summary-facts');[['故障对象','112.34.23.1 · CPU02 · hinic3 网卡驱动'],['业务影响',v===9?'Qwen-1.5B 已恢复，请求成功率99.94%':v>0?'Qwen-1.5B 请求成功率降至77.5%':'暂无业务影响'],['处置状态',v===9?'驱动已升级至 V13.1，节点、实例及服务健康核查通过':v===8?'驱动已升级，正在核查节点、实例及服务健康':v===7?'人工已确认，正在执行网卡升级':v>=3?'无可替换节点，无法自动恢复，待人工升级网卡':'正在诊断并评估恢复方案']].forEach(([name,value])=>{const row=U.el('div','nic-summary-fact');row.append(U.el('span','nic-summary-caption',name),U.el('span','nic-summary-outcome',value));facts.append(row);});summary.append(facts);
  const body=U.el('div','nic-event-process-body'),processHead=U.el('div','nic-process-heading');processHead.append(U.el('strong','','处理过程'),all);body.append(processHead);group.append(summary,body);history.append(group);

  sections.forEach((s,i)=>{if(v<s.at)return;const content=U.el('div'),text=U.el('p','nic-section-copy',s.text);content.append(text);
   if(s.chain&&(i!==3||v>=5)){const chain=U.CauseChain(s.chain.map((title,j)=>({title,description:j===0?'OS IP 112.34.23.1':'',icon:(i===1?['系统-0910','实例-0910','实例-0910']:['网卡-0910','内存-0910','指针-0910','服务-0910','实例-0910','实例-0910'])[j],root:i===3&&j===0})));chain.querySelector('h3').textContent=i===1?'业务故障因果链':'故障因果链';chain.querySelectorAll('.evt-cause-title').forEach((n,j)=>{const tag=i===1?(j===0?'直接原因':'业务影响'):(j===3?'直接原因':j>=4?'业务影响':'');if(tag)n.append(U.Badge(tag,tag==='直接原因'?'degraded':'impact'));});content.append(chain);}
   if(i===3&&v===4)text.textContent='12:05:48 正在采集并分析 BMC、OS 日志与 vmcore，定位资源故障根因';
   if(s.manual){
    const waiting=U.el('div','nic-manual-copy'),list=U.el('ol','nic-upgrade-results');
    const versions=U.el('div','nic-upgrade-versions');versions.setAttribute('aria-label',v>=8?'网卡驱动已从 V11.8 升级至 V13.1':'当前版本 V11.8，待升级版本 V13.1');
    waiting.append(U.el('strong','nic-upgrade-object','hinic3 网卡驱动'),U.el('div','nic-upgrade-device','112.34.23.1 · CPU02'));
    const before=U.el('div','nic-version-before'),after=U.el('div','nic-version-after');before.append(U.el('small','',v>=8?'升级前版本':'当前版本'),U.el('strong','','V11.8'));after.append(U.el('small','',v>=8?'当前版本 · 已升级':'待升级版本'),U.el('strong','','V13.1'));versions.append(before,U.el('span','nic-version-arrow','→'),after);waiting.append(versions);
    const rows=['12:06:06 待人工确认执行网卡升级，升级后核查驱动版本、D-08 实例和 Qwen-1.5B 服务'];
    if(v>=7)rows.push('12:06:12 已人工授权，开始执行网卡驱动升级');if(v>=8)rows.push('12:06:20 驱动升级至 V13.1，正在检查节点与实例健康');if(v===9)rows.push('12:06:35 节点和实例健康核查通过，Qwen-1.5B 服务恢复，事件已闭环');
    rows.forEach(t=>list.append(U.el('li','',t)));waiting.prepend(list);
    if(v===6&&journeySecond===null)waiting.append(U.button('授权升级网卡','nic-confirm-execute',()=>{selected=null;window.HCStory?.complete('qwen');}));const upgradeCard=U.el('div','nic-upgrade-card');[...waiting.children].filter(child=>child!==list).forEach(child=>upgradeCard.append(child));list.firstElementChild.append(upgradeCard);content.append(waiting);
   }
   const waiting=i===5&&v===6,working=i===5&&v>=7&&v<9||i===3&&v===4;
   const step=U.DiagnosticStep({title:s.title,time:null,badge:waiting?'待人工处理':working?'处理中':i===2?'无可用方案':'已完成',tone:waiting?'manual':working?'processing':'done',content,evidence:i===4?[{verb:'生成',label:'处置方案',tool:'方案生成',kind:'file'}]:i===5&&viewStage()>=7?[{verb:'记录',label:'人工确认记录',tool:'人工授权',kind:'run'}]:null,expanded:expanded[i],onToggle:v=>{expanded[i]=v;renderHistory();},onSelect:()=>focus(flow.findIndex(f=>f[2]===i))});if(i===3){step.querySelector('.evt-diagnostic-operations')?.remove();if(v>=5){window.HCOpticalEvidence?.attach(step.querySelector('.evt-step-body'),s.title,true,false,[
     {verb:'生成',label:'BMC 日志分析结果',tool:'BMC 日志分析',kind:'file',text:'分析对象：112.34.23.1 · CPU02\n分析结论：关联节点重启记录，确认故障发生于 D-08 实例所在节点\n关联事件：12:05:06 操作系统崩溃重启'},
     {verb:'生成',label:'OS 日志分析结果',tool:'OS 日志分析',kind:'file',text:'分析对象：112.34.23.1 · 操作系统\n分析结论：操作系统内存耗尽并崩溃重启，导致 D-08 实例异常退出\n业务影响：Qwen-1.5B 请求成功率降至 77.5%'},
     {verb:'生成',label:'vmcore 分析结果',tool:'vmcore 分析',kind:'file',text:'分析对象：112.34.23.1 · 内核转储\n分析结论：发现内核空指针异常；结合 OS 日志与 hinic3 驱动版本信息，定位根因为网卡驱动版本过低\n当前版本：V11.8\n处置建议：升级至 V13.1，随后核查节点、D-08 实例及 Qwen-1.5B 服务'}
    ]);const results=step.querySelector('details.evt-diagnostic-operations');if(results){results.open=true;results.querySelector('summary > span:not(.evt-operation-icon)').textContent='诊断分析结果';}}}if(i===5){step.querySelector('.evt-diagnostic-operations')?.remove();if(viewStage()>=7)window.HCOpticalEvidence?.attach(step.querySelector('.evt-step-body'),s.title,true,false,[{verb:'记录',label:'人工确认记录',tool:'人工授权',kind:'run'}]);}if(i===2){const badge=step.querySelector('.evt-step-header > .evt-badge');badge.classList.replace('evt-badge-done','evt-badge-manual');}if(waiting)step.querySelector('.evt-step-select').firstElementChild.replaceWith(U.icon('红色小手',16));step.dataset.section=i;step.classList.toggle('evt-focus-dim',selected!==null&&flow[selected][2]!==i);if(i===5&&selected!==null&&selected>=9)step.querySelectorAll('.nic-upgrade-results>li').forEach((row,j)=>row.classList.toggle('evt-focus-dim',j!==selected-9));if(i===3&&selected!==null&&selected>=4&&selected<=6)step.querySelectorAll('.evt-operation-list>li').forEach((row,j)=>row.classList.toggle('evt-focus-dim',j!==selected-4));body.append(step);
  });history.scrollTop=top;
 }
 function renderFlow(){
  flowList.replaceChildren();flow.forEach((f,i)=>{if(viewStage()<f[4])return;
   const description=f[1];
   const shared=U.ProcessTimeline({steps:[{title:f[0],description:description.replaceAll('／','\n'),time:f[3],manual:i===9&&stage===6,iconName:i===10?'人工处理-绿色':undefined}],current:selected===i?0:-1,onSelect:()=>focus(i)});
   const item=shared.querySelector('.evt-process-card');item.classList.add('nic-flow-node');item.querySelector('.evt-process-title em')?.remove();item.setAttribute('role','tab');item.setAttribute('aria-selected',String(selected===i));item.dataset.flowIndex=i;item.dataset.column=i<4?i:i-2;item.classList.toggle('nic-waiting',i===9&&stage===6);item.classList.toggle('evt-focus-dim',selected!==null&&selected!==i);flowList.append(item);
   if(i<2||i>=4){const tick=shared.querySelector('.evt-process-tick');tick.classList.add('nic-flow-tick');tick.dataset.flowIndex=i;flowList.append(tick);}
  });requestAnimationFrame(drawFlowLines);
 }
 function drawFlowLines(){
  if(!flowList.isConnected||flowList.hidden)return;const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),nodes=new Map();svg.setAttribute('class','nic-flow-lines');svg.setAttribute('viewBox','0 0 '+flowList.clientWidth+' '+flowList.clientHeight);svg.setAttribute('aria-hidden','true');
  const gap=12,width=Math.max(138,(flowViewport.clientWidth-7*gap)/8),visible=flow.filter(f=>viewStage()>=f[4]).length,columns=Math.max(8,visible-2);flowList.style.width=(columns*(width+gap)-gap)+'px';svg.setAttribute('viewBox','0 0 '+flowList.clientWidth+' '+flowList.clientHeight);
  flowList.querySelectorAll('.nic-flow-node').forEach(n=>{const i=+n.dataset.flowIndex,c=+n.dataset.column;n.style.width=width+'px';n.style.left=c*(width+gap)+'px';n.style.top=((i<2?103:i<4?69:141)-n.offsetHeight/2)+'px';nodes.set(i,n);});
  flowList.querySelectorAll('.nic-flow-tick').forEach(t=>{const n=nodes.get(+t.dataset.flowIndex);Object.assign(t.style,{left:n.style.left,width:n.offsetWidth+'px',top:n.offsetTop+n.offsetHeight+'px'});});
  [[0,1],[1,2],[2,3],[1,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12]].forEach(([a,b])=>{if(!nodes.has(a)||!nodes.has(b))return;const p=nodes.get(a),q=nodes.get(b),x=p.offsetLeft+p.offsetWidth,y=p.offsetTop+p.offsetHeight/2,xx=q.offsetLeft,yy=q.offsetTop+q.offsetHeight/2,mid=(x+xx)/2,path=document.createElementNS(ns,'path');path.setAttribute('d',`M${x} ${y} H${mid} V${yy} H${xx}`);svg.append(path);});flowList.querySelector('.nic-flow-lines')?.remove();flowList.prepend(svg);if(selected!==null){const n=nodes.get(selected);if(n){const l=n.offsetLeft,r=l+n.offsetWidth;if(l<flowViewport.scrollLeft)flowViewport.scrollLeft=Math.max(0,l-12);else if(r>flowViewport.scrollLeft+flowViewport.clientWidth)flowViewport.scrollLeft=r-flowViewport.clientWidth+12;}}else if(lastFlowStage!==viewStage()){flowViewport.scrollLeft=flowList.scrollWidth;lastFlowStage=viewStage();}flowViewport.classList.toggle('has-earlier',flowViewport.scrollLeft>1);
 }
 const render=()=>{updateService();renderHistory();renderFlow();renderJourney();};panel.append(left,right);screen.append(panel);entrance=HCEntrance(panel);render();entrance.enter(stage<6?'live':'complete');
 panel.addEventListener('click',e=>{const flowBlank=e.target.closest('.nic-flow-viewport')&&!e.target.closest('button,a,input,select,[role=tab]');if(!flowBlank&&e.target.closest('button,input,select,.evt-step,.nic-upgrade-tip,.nic-process,.nic-event-summary'))return;selected=null;updateService();renderHistory();renderFlow();});
 stopLive=window.HCStory?.subscribe(next=>{if(!next.qwen){close();return;}if(next.qwen!==stage){stage=next.qwen;if(journeySecond===null&&selected===null)expanded=sections.map((_,i)=>stage<9&&i===currentSection(stage));render();}});
};
 document.addEventListener('click',e=>{if(e.target.closest('#home-sidebar button[aria-label="首页"]'))close();});

  cleanup = () => {
    window.closeNicEvent?.();
  };
}

export function unmountNicEvent() {
  if (cleanup) { cleanup(); cleanup = null; }
}
