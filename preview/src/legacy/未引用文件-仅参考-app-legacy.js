export function bootLegacyScreen() {
/* Evidence entries use only facts already revealed in the demonstration. */
window.HCEvidence = (() => {
 const rules = [
  [/识别.*(?:崩溃|告警)|异常退出/, '告警与事件记录', '事件监测'],
  [/完成资源故障分析|网卡驱动版本过低.*操作系统/, '资源故障分析依据', '资源诊断'],
  [/通道4.*(?:低功率|−12.9)|光链路状态分析/, '光功率与错误计数记录', '链路监测'],
  [/30条告警|链路闪断/, '告警聚合记录', '告警关联分析'],
  [/完成预案生成|生成.*升级方案|V11.8.*V13.1.*检查/, '处置方案', '方案生成'],
  [/节点切换预案|执行节点切换/, '节点切换方案', '调度策略'],
  [/实例迁移完成|已迁移至其他节点/, '实例迁移记录', '实例调度'],
  [/推理业务已恢复|业务劣化恢复/, '业务恢复核验', '业务指标监测'],
  [/已完成.*优雅隔离/, '链路隔离执行记录', '链路处置'],
  [/清污后恢复正常|恢复核验/, '链路恢复核验记录', '链路监测'],
  [/隔离已解除/, '隔离解除记录', '链路处置'],
  [/已人工确认执行/, '人工确认记录', '处置流程'],
  [/网卡驱动已升级至/, '驱动升级执行记录', '驱动升级'],
  [/节点健康检查通过/, '节点健康检查结果', '节点健康检查'],
  [/已重新加入资源池/, '资源池接入记录', '资源池管理'],
  [/最低 0.1 次/, '业务负载观测记录', '负载监测'],
  [/深度节能.*性能优先/, '节能策略对比', '节能策略分析'],
  [/均衡模式满足业务性能约束/, '节能策略配置', '策略决策'],
  [/已向目标服务器下发/, '策略下发记录', '策略执行']
 ];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function businessReport(){
  return `<article class="business-diagnosis-report">
   <header><h2><svg class="diagnosis-document-icon" viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="3" width="20" height="26" rx="4" fill="#48cbd3"/><path d="M10 10h10M10 15h8M10 20h5" stroke="#d9ffff" stroke-width="2"/><circle cx="24" cy="24" r="7" fill="#85e5eb"/><path d="m21 24 2 2 4-4" fill="none" stroke="#247d94" stroke-width="2"/></svg>业务故障诊断报告</h2><div class="diagnosis-meta">
    <section><h3>诊断任务信息</h3><div class="diagnosis-fields"><div><small>名称</small><b>Qwen-1.5B 业务故障诊断</b></div><div><small>创建时间</small><b>2026-09-09 12:05:12</b></div><div><small>结束时间</small><b>2026-09-09 12:05:22</b></div><div><small>诊断耗时</small><b>10 秒</b></div></div></section>
    <section><h3>服务信息</h3><div class="diagnosis-fields"><div><small>服务名称</small><b>Qwen-1.5B</b></div><div><small>异常实例</small><b>D-08</b></div><div><small>所在节点 OS IP</small><b>112.34.23.1</b></div></div></section>
   </div></header>
   <section data-report-view="analysis"><div class="diagnosis-root"><strong>根因：操作系统崩溃重启</strong><span>操作系统异常</span></div>
    <div class="diagnosis-row"><h4>原因描述</h4><p>节点操作系统崩溃重启导致 D-08 实例异常退出，服务可用实例减少，Qwen-1.5B 请求成功率下降</p></div>
    <div class="diagnosis-row"><h4>原因节点</h4><p class="diagnosis-node">计算节点 OS IP　112.34.23.1</p></div>
    <div class="diagnosis-row"><h4>原始日志</h4><div class="diagnosis-log"><div class="diagnosis-log-toolbar"><small>演示日志 · 非真实采集</small><button type="button" data-log-expand aria-expanded="false">展开</button></div><ol><li><code>2026-09-09T12:05:10 host=112.34.23.1 source=os-monitor level=CRITICAL event=OS_CRASH_REBOOT</code></li><li><code>2026-09-09T12:05:10 host=112.34.23.1 source=node-agent level=ERROR node_status=unavailable reason=os_restarting</code></li><li><code>2026-09-09T12:05:11 service=Qwen-1.5B instance=D-08 host=112.34.23.1 level=ERROR event=INSTANCE_EXIT_UNEXPECTED</code></li><li><code>2026-09-09T12:05:12 service=Qwen-1.5B source=service-monitor level=WARN request_success_rate=77.5% status=degraded</code></li><li><code>2026-09-09T12:05:22 service=Qwen-1.5B source=event-correlation root_cause=OS_CRASH_REBOOT affected_instance=D-08</code></li></ol></div></div>
    <div class="diagnosis-row"><h4>诊断详情</h4><div class="diagnosis-chain-wrap"><h3>故障因果链</h3><div class="diagnosis-chain"><section class="root"><small>根因</small><strong>操作系统崩溃重启</strong><p>OS IP 112.34.23.1</p><time>12:05:10</time></section><span class="diagnosis-edge">导致实例退出 →</span><section><small>实例异常</small><strong>D-08 实例异常退出</strong><p>所属服务 Qwen-1.5B</p><time>12:05:11</time></section><span class="diagnosis-edge">影响服务 →</span><section class="impact"><small>业务影响</small><strong>Qwen-1.5B 服务劣化</strong><p>请求成功率 77.5%</p><time>12:05:12</time></section></div></div></div>
   </section><footer>日志为依据本场景编写的模拟内容，非真实采集；诊断结论对应 12:05:22</footer>
  </article>`;
 }
 const workspaces=new WeakMap();
 function open(item,title,text,origin){
  const module=origin.closest('.hc-event-module')||origin.closest('.hc-energy-module')||origin.closest('section');
  const right=module?.querySelector('.evt-right,.hc-energy-right');if(!right)return;
  let state=workspaces.get(right);
  if(!state||!state.bar.isConnected){
   const toolbar=right.querySelector('.evt-detail-toolbar');
   const bar=document.createElement('div');bar.className='evt-evidence-tabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','诊断与依据');
   const home=document.createElement('button');home.type='button';home.textContent=toolbar?'诊断详情':'运行详情';home.setAttribute('role','tab');bar.append(home);
   const panel=document.createElement('section');panel.className='evt-evidence-panel';panel.setAttribute('role','tabpanel');panel.hidden=true;
   state={bar,home,panel,entries:new Map()};workspaces.set(right,state);
   const select=key=>{right.classList.toggle('evt-show-evidence',!!key);panel.hidden=!key;home.setAttribute('aria-selected',String(!key));state.entries.forEach((entry,k)=>entry.button.setAttribute('aria-selected',String(k===key)));if(key){panel.innerHTML=state.entries.get(key).html;panel.setAttribute('aria-label',state.entries.get(key).label);}};
   state.select=select;home.onclick=()=>select(null);
   panel.onclick=e=>{const button=e.target.closest('[data-log-expand]');if(!button)return;const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.textContent=expanded?'收起':'展开';button.closest('.diagnosis-log').classList.toggle('is-expanded',expanded);};
   if(toolbar){toolbar.classList.add('evt-has-evidence-tabs');toolbar.insertBefore(bar,toolbar.querySelector('button'));}else right.prepend(bar);right.append(panel);select(null);
  }
  const key=title+'|'+item[1];
  const html=item[1]==='业务故障诊断'?businessReport():`<small>处理依据 · 演示数据</small><h2>${esc(item[1])}</h2><dl><dt>所属环节</dt><dd>${esc(title)}</dd><dt>来源能力</dt><dd>${esc(item[2])}（演示名称）</dd><dt>数据来源</dt><dd>当前子步骤的处理记录</dd></dl><h3>相关处理记录</h3><pre>${esc(text)}</pre><footer>本页为演示依据，未连接真实工具服务，不包含原始日志或真实调用编号</footer>`;
  if(!state.entries.has(key)){
   const group=document.createElement('span');group.className='evt-evidence-tab-group';const button=document.createElement('button');button.type='button';button.textContent=item[1];button.setAttribute('role','tab');button.onclick=()=>state.select(key);
   const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','关闭'+item[1]);close.onclick=()=>{const selected=button.getAttribute('aria-selected')==='true';state.entries.delete(key);group.remove();if(selected)state.select(null);if(!state.entries.size){state.select(null);state.bar.remove();state.panel.remove();right.querySelector('.evt-detail-toolbar')?.classList.remove('evt-has-evidence-tabs');workspaces.delete(right);}};group.append(button,close);state.bar.append(group);state.entries.set(key,{button,html,label:item[1]});
  }else state.entries.get(key).html=html;
  state.select(key);
 }
 const operationExpansion=new Map();
 function attach(host,title,enabled=true,local=false){
  if(!enabled)return;
  const text=host.innerText||host.textContent;
  const matched=rules.filter(r=>r[0].test(text));if(!matched.length)return;
  const operations=[];
  const add=(verb,label,tool,kind='file')=>operations.push({verb,label,tool,kind});
  if(/故障分析/.test(title)&&!local){
   if(/BMC/.test(text))add('分析','BMC 日志','BMC 日志分析');
   if(/OS 日志/.test(text))add('分析','OS 日志','OS 日志分析');
   if(/vmcore/.test(text))add('解析','vmcore','vmcore 解析');
   if(/驱动版本/.test(text))add('核对','网卡驱动版本','版本查询','search');
   if(/通道|光功率/.test(text))add('核对','光功率与错误计数','链路监测','search');
   if(/业务故障因果链/.test(text))add('完成','业务故障诊断','事件关联分析','search');else if(/因果链/.test(text))add('关联','故障与业务影响','事件关联分析','search');
  }
  if(!operations.length)matched.forEach(item=>{
   const verb=/方案|配置/.test(item[1])?'生成':/核验|检查/.test(item[1])?'核验':/执行|接入|解除|确认|下发|迁移/.test(item[1])?'记录':'读取';
   add(verb,item[1],item[2],verb==='记录'?'run':verb==='核验'?'search':'file');
  });
  const details=document.createElement('details');details.className='evt-diagnostic-operations';
  const key=title+'|'+operations.map(x=>x.label).join('|');details.open=operationExpansion.get(key)??false;
  const glyph=kind=>{const icon=document.createElement('span');icon.className='evt-operation-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=kind==='search'?'<svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg>':kind==='run'?'<svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="14" rx="2"/><path d="m5 7 3 3-3 3m5 0h5"/></svg>':'<svg viewBox="0 0 20 20"><path d="M5 2h7l4 4v12H5zM12 2v5h4M8 10h5m-5 3h5"/></svg>';return icon;};
  const summary=document.createElement('summary');summary.append(glyph('search'));
  const caption=document.createElement('span');
  const verbs=[...new Set(operations.map(x=>x.verb))];caption.textContent=operations.length===1?'已'+operations[0].verb+operations[0].label:/故障分析/.test(title)?'已分析日志并核对故障依据':'已'+verbs.join('、')+'相关依据';summary.append(caption);
  const arrow=document.createElement('span');arrow.className='evt-operation-arrow';arrow.setAttribute('aria-hidden','true');summary.append(arrow);details.append(summary);
  const list=document.createElement('ul');list.className='evt-operation-list';
  operations.forEach(op=>{const li=document.createElement('li');li.append(glyph(op.kind),document.createTextNode('已'+op.verb+' '));const a=document.createElement('a');a.href='#';a.className='evt-evidence-link';a.textContent=op.label;a.title='来源：'+op.tool;a.setAttribute('aria-label',op.label+'，在诊断详情旁打开');a.onclick=e=>{e.preventDefault();e.stopPropagation();const rule=rules.find(r=>r[1]===op.label);const row=rule?[...host.querySelectorAll('.evt-recovery-row,.nic-upgrade-results>li')].find(n=>rule[0].test(n.textContent)):null;open([null,op.label,op.tool],title,row?row.textContent:text,a);};li.append(a);list.append(li);});
  details.append(list);details.addEventListener('toggle',()=>{if(details.isConnected)operationExpansion.set(key,details.open);});
  let block=details;
  if(operations.length===1){block=document.createElement('div');block.className='evt-diagnostic-operations evt-operation-single';block.append(list);}
  // Keep the energy step's summary first, with operations preceding its body.
  if(host.matches('details'))host.querySelector(':scope > summary')?.after(block);else host.prepend(block);
 }
 return {attach};
})();

/* Shared tooltip for text hints; rich interactive popovers keep their existing lifecycle. */
(() => {
 let tip,anchor,timer,serial=0;
 function hide(){clearTimeout(timer);if(anchor){const ids=(anchor.getAttribute('aria-describedby')||'').split(' ').filter(x=>x&&x!==tip?.id);if(ids.length)anchor.setAttribute('aria-describedby',ids.join(' '));else anchor.removeAttribute('aria-describedby');}anchor=null;tip?.remove();tip=null;}
 function show(node){
  clearTimeout(timer);if(anchor===node)return;hide();
  const value=node.getAttribute('title')||node.dataset.hcHint;if(!value)return;
  node.dataset.hcHint=value;node.removeAttribute('title');anchor=node;
  tip=document.createElement('div');tip.className='hc-text-tooltip';tip.id='hc-text-tooltip-'+(++serial);tip.setAttribute('role','tooltip');tip.textContent=value;document.body.append(tip);
  node.setAttribute('aria-describedby',((node.getAttribute('aria-describedby')||'')+' '+tip.id).trim());
  const rect=node.getBoundingClientRect(),box=tip.getBoundingClientRect();const x=Math.max(10,Math.min(innerWidth-box.width-10,rect.left+rect.width/2-box.width/2));
  const above=rect.top>=box.height+18;tip.dataset.side=above?'top':'bottom';tip.style.left=x+'px';tip.style.top=(above?rect.top-box.height-10:Math.min(innerHeight-box.height-10,rect.bottom+10))+'px';tip.style.setProperty('--arrow-x',Math.max(14,Math.min(box.width-14,rect.left+rect.width/2-x))+'px');
 }
 const target=e=>e.target instanceof Element?e.target.closest('[title],[data-hc-hint]'):null;
 document.addEventListener('pointerover',e=>{const n=target(e);if(n)show(n);});
 document.addEventListener('focusin',e=>{const n=target(e);if(n)show(n);});
 document.addEventListener('pointerout',e=>{if(anchor&&anchor.contains(e.target)&&!anchor.contains(e.relatedTarget)&&document.activeElement!==anchor)timer=setTimeout(hide,140);});
 document.addEventListener('focusout',()=>{timer=setTimeout(hide,140);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 document.addEventListener('click',hide);document.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
 new MutationObserver(()=>{if(anchor&&!anchor.isConnected)hide();}).observe(document.documentElement,{childList:true,subtree:true});
})();

const HOME_WORKLOADS={
  "training": [
    {
      "status": "normal",
      "data": {
        "name": "Qwen3-72B 预训练",
        "start": "08-22 09:10",
        "npu": "256",
        "quality": "99.73%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "DeepSeek-R1 微调",
        "start": "08-22 08:32",
        "npu": "128",
        "quality": "99.36%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Llama-3.1-70B SFT",
        "start": "08-22 07:48",
        "npu": "64",
        "quality": "99.68%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "盘古多模态训练",
        "start": "08-22 06:15",
        "npu": "128",
        "quality": "99.42%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Qwen-VL 数据蒸馏",
        "start": "08-22 05:40",
        "npu": "32",
        "quality": "99.81%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "MoE 专家并行实验",
        "start": "08-22 03:20",
        "npu": "64",
        "quality": "99.57%",
        "faults": "1",
        "lastInterrupted": "08-22 03:20"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "DeepSeek-R1 微调 · 007",
        "start": "08-13 07:49",
        "npu": "128",
        "quality": "99.23%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Llama-3.1-70B SFT · 008",
        "start": "08-20 08:56",
        "npu": "64",
        "quality": "99.64%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "盘古多模态训练 · 009",
        "start": "08-19 09:03",
        "npu": "128",
        "quality": "99.48%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Qwen-VL 数据蒸馏 · 010",
        "start": "08-18 10:10",
        "npu": "32",
        "quality": "99.76%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Qwen3-72B 预训练 · 011",
        "start": "08-17 11:17",
        "npu": "256",
        "quality": "99.39%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "DeepSeek-R1 微调 · 012",
        "start": "08-16 12:24",
        "npu": "128",
        "quality": "99.61%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Llama-3.1-70B SFT · 013",
        "start": "08-15 13:31",
        "npu": "64",
        "quality": "99.54%",
        "faults": "0",
        "lastInterrupted": "无中断记录"
      }
    }
  ],
  "inference": [
    {
      "status": "degraded",
      "data": {
        "name": "Qwen-1.5B 在线服务",
        "start": "08-22 09:02",
        "npu": "32",
        "quality": "99.94%",
        "faults": "1",
        "lastInterrupted": "08-22 09:02",
        "total": "124860",
        "ok": "124785",
        "fail": "75",
        "tokens": "8.42M",
        "ttft": "182 ms",
        "tpot": "23.6 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Qwen-14B",
        "start": "08-22 08:10",
        "npu": "48",
        "quality": "99.97%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "286420",
        "ok": "286334",
        "fail": "86",
        "tokens": "16.8M",
        "ttft": "146 ms",
        "tpot": "18.2 ms",
        "energySaving": true,
        "energyTotal": "5520 kWh",
        "energySaved": "384.7 kWh",
        "energyGain": "6.5 %",
        "energyUnit": 5.6
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "视觉理解服务-3B",
        "start": "08-22 07:55",
        "npu": "16",
        "quality": "99.93%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "68210",
        "ok": "68162",
        "fail": "48",
        "tokens": "3.21M",
        "ttft": "238 ms",
        "tpot": "31.4 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 2.36
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "代码生成 Copilot-1.5B",
        "start": "08-22 06:26",
        "npu": "24",
        "quality": "99.95%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "47380",
        "ok": "47356",
        "fail": "24",
        "tokens": "2.08M",
        "ttft": "520 ms",
        "tpot": "66.8 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 2.74
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Embedding 检索服务-0.5B",
        "start": "08-22 05:18",
        "npu": "8",
        "quality": "99.78%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "942810",
        "ok": "940736",
        "fail": "2074",
        "tokens": "28.6M",
        "ttft": "42 ms",
        "tpot": "6.2 ms",
        "energySaving": false
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "数字人实时推理-1.5B",
        "start": "08-22 04:42",
        "npu": "16",
        "quality": "99.67%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "32150",
        "ok": "32044",
        "fail": "106",
        "tokens": "1.46M",
        "ttft": "680 ms",
        "tpot": "72.5 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "视觉理解服务 · 07-3B",
        "start": "08-13 07:03",
        "npu": "16",
        "quality": "99.73%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "68210",
        "ok": "68026",
        "fail": "184",
        "tokens": "3.21M",
        "ttft": "238 ms",
        "tpot": "31.4 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "代码生成 Copilot · 08-1.5B",
        "start": "08-20 08:12",
        "npu": "24",
        "quality": "99.61%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "47380",
        "ok": "47195",
        "fail": "185",
        "tokens": "2.08M",
        "ttft": "520 ms",
        "tpot": "66.8 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Embedding 检索服务 · 09-0.5B",
        "start": "08-19 09:21",
        "npu": "8",
        "quality": "99.82%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "942810",
        "ok": "941113",
        "fail": "1697",
        "tokens": "28.6M",
        "ttft": "42 ms",
        "tpot": "6.2 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "数字人实时推理 · 10-1.5B",
        "start": "08-18 10:30",
        "npu": "16",
        "quality": "99.69%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "32150",
        "ok": "32050",
        "fail": "100",
        "tokens": "1.46M",
        "ttft": "680 ms",
        "tpot": "72.5 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Deepseek-1",
        "start": "08-17 11:39",
        "npu": "64",
        "quality": "99.76%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "286420",
        "ok": "285733",
        "fail": "687",
        "tokens": "16.8M",
        "ttft": "146 ms",
        "tpot": "18.2 ms",
        "energySaving": false,
        "energyUnit": 12.8,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %"
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "视觉理解服务 · 12-3B",
        "start": "08-16 12:48",
        "npu": "16",
        "quality": "99.58%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "68210",
        "ok": "67924",
        "fail": "286",
        "tokens": "3.21M",
        "ttft": "238 ms",
        "tpot": "31.4 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "代码生成 Copilot · 13-1.5B",
        "start": "08-15 13:57",
        "npu": "24",
        "quality": "99.71%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "47380",
        "ok": "47243",
        "fail": "137",
        "tokens": "2.08M",
        "ttft": "520 ms",
        "tpot": "66.8 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Embedding 检索服务 · 14-0.5B",
        "start": "08-14 14:06",
        "npu": "8",
        "quality": "99.64%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "942810",
        "ok": "939416",
        "fail": "3394",
        "tokens": "28.6M",
        "ttft": "42 ms",
        "tpot": "6.2 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "数字人实时推理 · 15-1.5B",
        "start": "08-13 15:15",
        "npu": "16",
        "quality": "99.79%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "32150",
        "ok": "32082",
        "fail": "68",
        "tokens": "1.46M",
        "ttft": "680 ms",
        "tpot": "72.5 ms",
        "energySaving": true,
        "energyTotal": "1280 kWh",
        "energySaved": "163 kWh",
        "energyGain": "11.3 %",
        "energyUnit": 1.82
      }
    },
    {
      "status": "normal",
      "data": {
        "name": "Llama-3-70B",
        "start": "08-20 16:24",
        "npu": "64",
        "quality": "99.68%",
        "faults": "0",
        "lastInterrupted": "无中断记录",
        "total": "286420",
        "ok": "285503",
        "fail": "917",
        "tokens": "16.8M",
        "ttft": "146 ms",
        "tpot": "18.2 ms",
        "energySaving": true,
        "energyUnit": 13.6
      }
    }
  ]
}
;
const HC_ASSETS={"icons": {"NPU板": "./assets/icons/asset-033-760e8784.svg", "展开全部": "./assets/icons/-6.svg", "隐患数": "./assets/icons/asset-035-18166cb6.svg", "绿色小手": "./assets/icons/-7.svg", "深灰色的故障": "./assets/icons/-8.svg", "橙色隐患": "./assets/icons/-4.svg", "已闭环": "./assets/icons/asset-032-3d356b40.svg", "待人工处理": "./assets/icons/asset-038-5832a001.svg", "策略中心": "./assets/icons/-9.svg", "星星": "./assets/icons/-10.svg", "告警铃铛": "./assets/icons/-11.svg", "筛选": "./assets/icons/asset-042-bb31308e.svg", "故障+小手": "./assets/icons/-12.svg", "时间轴-故障+小手": "./assets/icons/asset-044-3cd3cadf.svg", "已人工闭环-圆": "./assets/icons/asset-045-32700768.svg", "事件感知": "./assets/icons/-13.svg", ".发送dark": "./assets/icons/.--dark.svg", "能耗": "./assets/icons/asset-048-5652867a.svg", "正常运行": "./assets/icons/-14.svg", "待处理-圆": "./assets/icons/asset-050-d44dbdbe.svg", "页签上的智能体事件": "./assets/icons/-15.svg", "箭头2": "./assets/icons/2.svg", "用户": "./assets/icons/-16.svg", "侧边栏智慧体": "./assets/icons/asset-054-82195d93.svg", "自动处理中-方块": "./assets/icons/asset-055-d6c1c81c.svg", "智能模式logo": "./assets/icons/logo.svg", "灰色隐患": "./assets/icons/.svg", "HBM利用率": "./assets/icons/asset-057-d1077c0c.svg", "箭头": "./assets/icons/-17.svg", "运行总数": "./assets/icons/-18.svg", "节能+小手": "./assets/icons/-19.svg", "灰色闪电": "./assets/icons/-2.svg", "待人工处理-圆": "./assets/icons/asset-061-ce56729d.svg", "已自动闭环-方块": "./assets/icons/asset-062-c7b3dc72.svg", "吸收功率劣化": "./assets/icons/-20.svg", "自动处理中-圆": "./assets/icons/asset-064-165b7fd7.svg", "待处理节能机会点-方块": "./assets/uploads/146-111404.png", "DeepSeek": "./assets/icons/deepseek.svg", "历史任务": "./assets/icons/-21.svg", "翻转": "./assets/icons/-3.svg", "近24小时": "./assets/icons/asset-068-d988accc.svg", "链路多次闪断": "./assets/icons/-22.svg", "对勾": "./assets/icons/-23.svg", "劣化": "./assets/icons/-24.svg", "深灰色闪电": "./assets/icons/asset-072-2607a6ee.svg", "查看详情": "./assets/icons/-25.svg", "暂无待处理事项": "./assets/icons/asset-074-884dda37.svg", "AI": "./assets/icons/ai.svg", "灰色的故障": "./assets/icons/asset-022-06810240.svg", "红色的故障": "./assets/icons/asset-027-bfdadc03.svg", "中断": "./assets/icons/-26.svg", "NPU利用率": "./assets/icons/asset-077-a48f74b4.svg", "首页": "./assets/icons/asset-078-82d1c5c1.svg", "绿色闪电": "./assets/icons/-27.svg", "千问": "./assets/icons/-28.svg", "发送-禁用态": "./assets/icons/asset-081-e857bebd.svg", "新建对话": "./assets/icons/-29.svg", "已生效节能机会点": "./assets/icons/asset-083-971c1f3f.svg", "夜间模式": "./assets/icons/-30.svg", "红色小手": "./assets/icons/-5.svg", "灵衢SFU板": "./assets/icons/asset-085-51f85805.svg", "已人工闭环-方块": "./assets/icons/asset-086-a07f0e94.svg", "故障数": "./assets/icons/asset-087-d8476bd4.svg", "灵衢互联柜": "./assets/icons/asset-088-108f6747.svg", "发送-正常态": "./assets/icons/asset-089-e5b539c9.svg", "logo": "./assets/icons/logo-2.svg", "页签上的首页": "./assets/icons/-31.svg", "故障诊断-圆": "./assets/icons/asset-092-6fd92394.svg", "侧边栏展开": "./assets/icons/-32.svg", "卡死": "./assets/icons/-33.svg", "已自动闭环-圆": "./assets/icons/asset-095-88d518f2.svg", "自动处理中": "./assets/icons/asset-031-28272d21.svg", "光模块脏污": "./assets/icons/asset-096-dfba0604.svg", "header": "./assets/icons/header.svg", "smart": "./assets/icons/smart.svg", "normal": "./assets/icons/normal.svg", "trainingBase": "./assets/icons/trainingbase.svg", "inferenceBase": "./assets/icons/inferencebase.svg", "markerManual": "./assets/icons/markermanual.svg", "markerClosed": "./assets/icons/markerclosed.svg", "markerEnergy": "./assets/icons/markerenergy.svg", "markerEffective": "./assets/icons/markereffective.svg", "tipAutoBase": "./assets/icons/tipautobase.svg", "叶子-圆底托": "./assets/uploads/146-111413.png", "绿色叶子": "./assets/icons/asset-029-138cf8f3.svg", "灰色叶子": "./assets/icons/asset-108-eae4d894.svg", "tips-0909": "./assets/uploads/143-106968.png", "白色叶子": "./assets/icons/asset-110-c00e1cdf.svg", "放大-0910": "./assets/uploads/88-98958.png", "盾牌-0910": "./assets/uploads/88-98968.png", "箭头-0910": "./assets/uploads/149-129444.png", "网卡-0910": "./assets/uploads/151-2286.png", "内存-0910": "./assets/uploads/151-2665.png", "指针-0910": "./assets/uploads/151-2337.png", "系统-0910": "./assets/uploads/151-2458.png", "实例-0910": "./assets/uploads/151-2465.png", "服务-0910": "./assets/uploads/151-2360.png", "超节点": "./assets/uploads/156-7524.png", "节能监控": "./assets/uploads/156-7460.png", "设置": "./assets/uploads/156-7453.png", "复选项": "./assets/uploads/156-7440.png", "完成": "./assets/uploads/155-123989.png", "红色头": "./assets/uploads/155-123867.png", "下载": "./assets/uploads/155-123836.png", "钱": "./assets/uploads/155-123831.png", "报告图标": "./assets/uploads/155-123958.png", "统计": "./assets/uploads/149-129605.png", "识别节能-彩色方底": "./assets/icons/asset-128-a88e9d1c.svg", "自动节能-绿色方底": "./assets/icons/asset-129-ec3d4658.svg"}};
window.HCMotion=(()=>{
/* ============================================================
   spring-engine.js — 弹性动画唯一入口（依据 spring-physics）
   规则：弹性必须用本引擎；禁止 cubic-bezier 冒充；禁止设 duration；
        k≥100、d≥10；手势衔接必须传入释放速度（state.v）。
   用法：
     const s = { x: 起始值, v: 0 };
     springTo(s, 目标值, SPRING.standard, x => el.style.height = x + 'px');
   中断重定向：对同一 state 再次调用 springTo 即自当前位置+速度续走。
   ============================================================ */
const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

const SPRING = {
  gentle:     { k: 200, d: 20, m: 1 }, // 背景大元素缓移        ~600ms
  standard:   { k: 400, d: 30, m: 1 }, // Sheet/卡片展开 ⭐默认  ~400ms
  responsive: { k: 600, d: 35, m: 1 }, // Tab 指示器/导航       ~250ms
  bouncy:     { k: 400, d: 15, m: 1 }, // 点赞/庆祝弹跳         ~500ms
  snappy:     { k: 800, d: 40, m: 1 }, // 开关/Chip 选中        ~150ms
  heavy:      { k: 300, d: 30, m: 2 }, // 大面积拖拽惯性        ~700ms
};

function stepSpring(s, target, h, { k, d, m = 1 }) {
  const a = (-k * (s.x - target) - d * s.v) / m;
  s.v += a * h;
  s.x += s.v * h;
}

/** 驱动 state.x 弹向 target；返回 { stop() }。REDUCED 时直达目标。 */
function springTo(state, target, preset, onUpdate, onSettle) {
  if (REDUCED) { state.x = target; state.v = 0; onUpdate(target); onSettle && onSettle(); return { stop() {} }; }
  if (state._raf) cancelAnimationFrame(state._raf);
  let last = performance.now();
  function frame(now) {
    let dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / steps; // sub-step 数值稳定
    for (let i = 0; i < steps; i++) stepSpring(state, target, h, preset);
    if (Math.abs(state.x - target) < .0015 && Math.abs(state.v) < .02) {
      state.x = target; state.v = 0; onUpdate(state.x); state._raf = null; onSettle && onSettle(); return;
    }
    onUpdate(state.x);
    state._raf = requestAnimationFrame(frame);
  }
  state._raf = requestAnimationFrame(frame);
  return { stop() { state._raf && cancelAnimationFrame(state._raf); state._raf = null; } };
}

/* 图标微动效离场专用（icon-micro-animation：离场可 easeIn 时间轴） */
const easeInCubic = t => t * t * t;
const lerp = (a, b, t) => a + (b - a) * t;

return {springTo,REDUCED,SPRING_SOFT:{k:300,d:35,m:1}};})();
/* Shared, framework-free components. All state changes are explicit props/events. */
(()=>{
const h=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const icon=(name,size=16)=>{const n=h('img','hc-icon');n.src=HC_ASSETS.icons[name];n.alt='';n.width=n.height=size;return n};
const button=(text,click)=>{const n=h('button','',text);n.type='button';if(click)n.addEventListener('click',click);return n};
const place=(parent,node,x,y)=>{node.style.position='absolute';node.style.left=x+'px';node.style.top=y+'px';parent.append(node);return node};
const label=(parent,text,x,y,size=12,color='#b3b3b3')=>{const n=h('span','hc-label',text);n.style.fontSize=size+'px';n.style.color=color;return place(parent,n,x,y)};
const statusNames={degraded:'劣化',stuck:'卡死',interrupted:'中断',normal:'正常运行'};
function Status({status='normal'}={}){return h('span','hc-status '+status,statusNames[status])}
function Mode({value='smart',onChange}={}){const n=h('div','hc-mode');const img=icon(value,99);img.style.height=value==='smart'?'36px':'24px';img.style.width=value==='smart'?'111px':'99px';img.style.left=value==='smart'?'-6px':'0';img.style.top=value==='smart'?'-6px':'0';n.append(img);const select=h('select');select.setAttribute('aria-label','运行模式');for(const [v,t] of [['smart','智能模式'],['normal','普通模式']]){const option=h('option','',t);option.value=v;select.append(option)}select.value=value;select.addEventListener('change',()=>{const smart=select.value==='smart';img.src=HC_ASSETS.icons[select.value];img.style.width=smart?'111px':'99px';img.style.height=smart?'36px':'24px';img.style.left=img.style.top=smart?'-6px':'0';onChange?.(select.value)});n.append(select);return n}
function Header(){const n=h('header','hc-header');n.append(icon('header',1920));const reset=button('');reset.setAttribute('aria-label','iMaster CCAE');place(n,reset,32,8);reset.style.width='215px';reset.style.height='32px';place(n,Mode(),230,12);return n}
function Sidebar(){const n=h('nav','hc-sidebar');n.setAttribute('aria-label','侧边导航');n.append(icon('侧边栏智慧体',56));for(const [i,name] of ['首页','策略中心','新建对话','历史任务'].entries()){const b=button('',()=>{n.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});b.setAttribute('aria-label',name);b.append(icon(name,48));if(!i)b.classList.add('selected');n.append(b)}return n}
const metrics={resource:[['故障数','2','故障数'],['隐患数','0','隐患数'],['NPU利用率','76.4','NPU利用率','%'],['HBM利用率','74.2','HBM利用率','%'],['能耗','771','能耗','kW']],training:[['运行总数','13','运行总数'],['中断','1','中断'],['卡死','0','卡死'],['劣化','0','劣化'],['正常运行','12','正常运行']],inference:[['运行总数','16','运行总数'],['中断','0','中断'],['卡死','0','卡死'],['劣化','1','劣化'],['正常运行','15','正常运行'],['节能中','3','节能中']]};
function MetricTile({name,value,iconName,unit='',selected=false,onSelect}={}){const n=button('',onSelect);n.className='hc-metric'+(selected?' selected':'');n.setAttribute('aria-pressed',String(selected));const glyph=icon(iconName==='节能中'?'叶子-圆底托':iconName,24);if(glyph.src.startsWith('data:image/svg+xml;base64,')){const raw=atob(glyph.src.split(',')[1]);const clean=raw.replace(/(<svg\b[^>]*?)\sclip-path="[^"]*"/,'$1');glyph.src='data:image/svg+xml;base64,'+btoa(clean);}n.append(glyph);const text=h('span','hc-metric-content');text.append(h('span','',name));const v=h('b','',value);if(unit)v.append(h('small','',unit));text.append(v);n.append(text);return n}
function MetricRibbon({category='resource',selected=0,onChange,faultCounts={resource:2,training:1,inference:1}}={}){
 const n=h('section','hc-ribbon'),keys=['resource','training','inference'],titles=['基础设施','训练作业','推理服务'];
 const groups=keys.map((key,i)=>{const g=h('section','hc-metric-group');g.dataset.category=key;const title=button(titles[i],()=>activate(key,0,true));title.className='hc-metric-title';g.append(title);
 const row=h('div','hc-metric-row');const tiles=metrics[key].map(([name,value,ic,unit],index)=>{const metricId=index;const tile=MetricTile({name,value,iconName:ic,unit,onSelect:()=>activate(key,metricId,true)});tile.dataset.metricId=metricId;tile.style.setProperty('--metric-delay',(50+Math.min(index,7)*30)+'ms');return tile;});row.append(...tiles);const compact=button('',()=>activate(key,0,true));compact.className='hc-metric-compact';compact.append(h('span','',key==='resource'?'故障数':'运行总数'),h('b','',key==='resource'?'2':key==='training'?'13':'16'));g.append(row,compact);n.append(g);return {key,g,row,compact,tiles,s:{x:key===category?904:163,v:0}};});
 function activate(cat,index=0,notify=false,initial=false){const changed=cat!==category;category=cat;selected=index;n.dataset.category=cat;groups.forEach(t=>{const expanded=t.key===cat;t.g.className='hc-metric-group '+(expanded?'expanded':'collapsed');t.row.inert=!expanded;t.compact.inert=expanded;t.tiles.forEach((tile,i)=>{tile.classList.toggle('selected',expanded&&Number(tile.dataset.metricId)===selected);tile.setAttribute('aria-pressed',String(expanded&&Number(tile.dataset.metricId)===selected));});if(initial)t.g.style.flexGrow=t.s.x;else if(changed)HCMotion.springTo(t.s,expanded?904:163,HCMotion.SPRING_SOFT,x=>t.g.style.flexGrow=x);});if(notify)onChange?.(cat,index);}
 n.activate=activate;activate(category,selected,false,true);return n;
}
function GuardEvents({view='manual',onChange,onViewAll}={}){const n=h('section','hc-guard');const head=h('div','hc-guard-head');head.append(h('h2','','智能体事件'));const all=button('查看全部',()=>onViewAll?.());all.disabled=!onViewAll;head.append(all);n.append(head);const tabs=h('div','hc-tabs');tabs.setAttribute('role','tablist');for(const [key,text,count] of [['manual','待人工处理',view==='manual'?2:0],['energy','节能机会点',view==='empty'?0:1]]){const b=button(text+' ',()=>onChange?.(key));b.append(h('b','hc-tab-count',count));b.setAttribute('role','tab');b.setAttribute('aria-selected',String(key===(view==='manual'?'manual':'energy')));tabs.append(b)}n.append(tabs);if(view==='empty'){const empty=h('div','hc-empty');empty.append(icon('暂无待处理事项',150));n.append(empty);return n}const rows=view==='manual'?[['光链路脏污，待清污','计算柜11- L1交换板02链路已隔离，等待人工清污'],['Qwen-1.5B服务劣化：网卡驱动待升级','节点112.34.23.1的hinic3驱动需由V11.8升级至V13.1']]:[['Qwen-14B服务存在节能空间，可优化策略','识别到低负载时段，预计开启均衡模式可日节能12.3%']];for(const [title,desc] of rows){const row=h('article','hc-event-row');const top=h('div','hc-event-head');top.append(icon(view==='manual'?'故障+小手':'节能+小手',24),h('span','',title),h('time','','14:59:30'));row.append(top,h('p','',desc));n.append(row)}return n}
function Composer({value='',onSend}={}){const form=h('form','hc-composer');const input=h('input');input.placeholder='输入问题或输入“/”触发提示词';input.value=value;input.setAttribute('aria-label','输入问题');const send=button('');send.type='submit';send.setAttribute('aria-label','发送');const image=icon('发送-禁用态',32);send.append(image);const sync=()=>{send.disabled=!input.value.trim();image.src=HC_ASSETS.icons[send.disabled?'发送-禁用态':'发送-正常态']};input.addEventListener('input',sync);form.addEventListener('submit',e=>{e.preventDefault();if(!input.value.trim())return;onSend?.(input.value);input.value='';sync()});form.append(input,send);sync();return form}
function Gauge({value=0}={}){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 38 38');svg.setAttribute('width','38');svg.setAttribute('height','38');svg.classList.add('hc-gauge');svg.setAttribute('role','meter');const percent=Math.max(0,Math.min(100,Number.isFinite(value)?value:0));svg.setAttribute('aria-valuenow',percent);svg.setAttribute('aria-valuemin','0');svg.setAttribute('aria-valuemax','100');const cover=document.createElementNS(svg.namespaceURI,'rect');cover.setAttribute('width','46');cover.setAttribute('height','38');cover.setAttribute('fill','#191919');svg.append(cover);for(const [color,progress] of [['#9a9a9a',false],['#36c18d',true]]){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M7.19 30.81 A16.7 16.7 0 1 1 30.81 30.81');path.setAttribute('fill','none');path.setAttribute('stroke',color);path.setAttribute('stroke-width','4.18');path.setAttribute('stroke-linecap','round');path.setAttribute('pathLength','100');if(progress){path.setAttribute('stroke-dasharray',percent+' 100');if(percent===0)path.setAttribute('opacity','0');}else path.setAttribute('opacity','.25');svg.append(path)}const star=document.createElementNS(svg.namespaceURI,'path');star.setAttribute('d','M19 12 L21.3 16.7 L26 19 L21.3 21.3 L19 26 L16.7 21.3 L12 19 L16.7 16.7 Z');star.setAttribute('fill','#fff');svg.append(star);svg.style.overflow='visible';return svg}
function EventTypeIcon({business=false,domain=business?'inference':'resource',name='Qwen',risk=false,type=risk?'risk':'fault',closed=false,size=24}={}){
 if(type==='fault'){
  const wrap=h('i','hc-event-type-icon hc-unified-fault');wrap.style.setProperty('--event-icon-size',size+'px');wrap.dataset.type='fault';wrap.dataset.closed=String(closed);wrap.setAttribute('role','img');wrap.setAttribute('aria-label','故障'+(closed?'，已闭环':''));
  const mark=icon(closed?'灰色的故障':'红色的故障',size);wrap.append(mark);return wrap;
 }
 if(type==='energy')domain='inference';
 const wrap=h('i','hc-event-type-icon');wrap.style.setProperty('--event-icon-size',size+'px');wrap.dataset.domain=domain;wrap.dataset.type=type;wrap.dataset.closed=String(closed);wrap.setAttribute('role','img');wrap.setAttribute('aria-label',({training:'训练作业',inference:'推理服务',resource:'资源'}[domain])+({fault:'故障',risk:'隐患',energy:'节能机会'}[type])+(closed?'，已闭环':''));
 if(domain==='inference'){const model=WorkloadIcon(name);model.classList.add('hc-event-model');wrap.append(model);}else{
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('hc-event-object');
 svg.innerHTML=domain==='training'?'<path d="M8 3h9a2 2 0 0 1 2 2v13M5 6h9a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M7 10h5M7 14h5M7 17h3"/>':'<rect x="3" y="4" width="17" height="7" rx="2.4"/><rect x="3" y="14" width="17" height="7" rx="2.4"/><path d="M7 7.5h.1M7 17.5h.1M12 7.5h4M12 17.5h4"/>';
 wrap.append(svg);}
 const key=type==='energy'?'绿色叶子':type==='risk'?'橙色隐患':'红色的故障';const mark=icon(key,12);mark.classList.add('hc-event-type-mark');wrap.append(mark);return wrap;
}
function WorkloadIcon(name=''){const key=/qwen|千问/i.test(name)?'千问':/deepseek/i.test(name)?'DeepSeek':'AI';const image=icon(key,24);if(key==='AI')image.style.filter='brightness(0) invert(.84)';return image}
function WorkloadCard({kind='training',status=kind==='training'?'interrupted':'degraded',data={}}={}){const inference=kind==='inference';const n=h('article','hc-workload '+kind);n.setAttribute('aria-label',inference?'推理服务卡片':'训练作业卡片');n.style.backgroundImage=`url("${HC_ASSETS.icons[inference?'inferenceBase':'trainingBase']}")`;place(n,WorkloadIcon(data.name??(inference?'Qwen-1.5B 在线服务':'MoE专家并行实验')),20,20);const titleRow=place(n,h('div','hc-workload-title'),52,20);titleRow.append(h('span','hc-workload-name',data.name??(inference?'Qwen-1.5B 在线服务':'MoE专家并行实验')),Status({status}));if(inference&&data.processingText){const tip=FaultTip({state:data.processingManual?'qwen':'auto'});tip.classList.add('hc-workload-progress');tip.querySelector('.hc-tip-arrow')?.remove();tip.querySelector('span').textContent=data.processingText;tip.title=data.processingText;tip.setAttribute('aria-label',data.processingText);titleRow.append(tip);}if(data.energySaving){const badge=h('span','hc-status normal hc-energy-saving','节能中');const leaf=icon('绿色叶子',12);leaf.classList.add('energy-label-leaf');leaf.alt='';badge.prepend(leaf);titleRow.append(badge);}const date=label(n,data.start??(inference?'08-22 09:02:00':'08-22 03:02'),inference?549:566,22,12,'#999');date.style.whiteSpace='nowrap';const quality=(inference&&Number(data.total)>0?100*Number(data.ok)/Number(data.total):parseFloat(data.quality??'99.50')).toFixed(2)+'%';const q=label(n,quality.replace('%',''),inference?52:53,88,32,'#fafafa');q.classList.add('hc-quality');q.append(h('span','hc-percent','%'));if(inference){n.style.backgroundImage='none';n.style.backgroundColor='#191919';label(n,'请求成功率',52,60,12,'#999');[['总请求数/成功/失败',195],['NPU卡数',490]].forEach(([text,x])=>label(n,text,x,84,12,'#999'));[['TTFT',52],['TPOT',195],['生成Token数',338],['待人工处理/守护总数',490]].forEach(([text,x])=>label(n,text,x,163,12,'#999'));const divider=place(n,h('div'),52,144);Object.assign(divider.style,{width:'582px',height:'1px',background:'#383838'});}else{n.style.backgroundImage='none';n.style.backgroundColor='#191919';label(n,'作业可用度',53,60,12,'#999');[['NPU卡数',245],['待人工处理/守护总数',355],['最近一次中断时间',505]].forEach(([text,x])=>label(n,text,x,84,12,'#999'));}const fields=inference?[[(data.total??'123860')+' / '+(data.ok??'123237')+' / '+(data.fail??'1623'),195,105],[String(data.npu??'32').replace(/\s*卡$/,''),490,105],[data.ttft??'182 ms',52,184],[data.tpot??'23.6 ms',195,184],[data.tokens??'8.42 M',338,184],[(data.pendingManual??(data.processingManual?1:0))+' / '+(data.guardTotal??(16+Array.from(data.name||'').reduce((sum,c)=>sum+c.charCodeAt(0),0)%31)),490,184]]:[[data.npu??'64',245,105],[(data.pendingManual??0)+' / '+(data.guardTotal??(12+Array.from(data.name||'').reduce((sum,c)=>sum+c.charCodeAt(0),0)%29)),355,105],[data.lastInterrupted??'无中断记录',505,105]];for(const [v,x,y] of fields){const field=label(n,v,x,y,x===505?16:18,((inference&&((x===560)||(x===583&&Number(v)!==0)))||(!inference&&((x===355&&Number(data.pendingManual||0)!==0))))?'#e7434a':'#ececec');if(inference&&y===105&&x===195){field.classList.add('hc-request-counts');field.textContent=(data.total??'123860')+' / '+(data.ok??'123237')+' / ';const failed=h('span','',data.fail??'1623');failed.style.color='#e7434a';field.append(failed);}if(inference&&y===184&&[52,195,338].includes(x)){const match=String(v).match(/^(.*?)\s*(ms|M)$/);if(match){field.textContent=match[1]+' ';field.append(h('span','hc-unit',match[2]));}}}return n}
const eventStates={auto:['自动处理中-故障','自动处理中','自动处理中','1'],manual:['待人工处理-故障','待人工处理','故障+小手','1'],closed:['已闭环故障','已闭环','灰色的故障','1'],energy:['待决策节能机会点','待决策节能机会点','节能+小手','1'],effective:['已生效机会点','已生效机会点','灰色闪电','1']};
function FlowBorder(n){const halo=h('i','hc-flow-halo');halo.append(h('i'));n.append(halo,h('i','hc-flow-base'),h('i','hc-flow-ring'));return n}
function TimelineMarker({state='manual'}={}){const n=button('');n.className='hc-marker '+state;n.setAttribute('aria-label',eventStates[state][1]);if(state==='auto'){n.dataset.count='1';n.append(icon('红色的故障',14));FlowBorder(n);}else{const key={manual:'markerManual',closed:'markerClosed',energy:'markerEnergy',effective:'markerEffective'}[state];const img=icon(key,86);img.style.width='auto';img.style.height='auto';n.append(img);}const tip=h('span','hc-marker-tooltip',eventStates[state][1]);n.append(tip);return n}
function FaultTip({state='optical'}={}){const auto=state==='auto';const n=h('div','hc-fault-tip '+(auto?'auto':'manual'));if(!auto)n.append(icon('红色的故障',14));n.append(h('span','',auto?'正在分析链路指标与设备日志':state==='qwen'?'网卡驱动待升级':'光链路待清污'));if(!auto)n.append(h('i','hc-tip-arrow'));else{FlowBorder(n);}return n}
window.HCComponents={EventTypeIcon,Header,Mode,Sidebar,MetricTile,MetricRibbon,GuardEvents,Composer,WorkloadCard,WorkloadIcon,Gauge,Status,TimelineMarker,FaultTip,FlowBorder};
})();

window.HCClock=(()=>{let origin=Date.now();const base=Date.UTC(2026,8,9,12);const seconds=()=>Math.floor((Date.now()-origin)/1000);const format=(offset=seconds(),date=false)=>new Date(base+offset*1000).toISOString().slice(date?0:11,19).replace('T',' ');return{seconds,format,reset(){origin=Date.now()}}})();

/* Assembly review: approved components + approved homepage artwork. */
const C=HCComponents;
function mount(id,node){document.getElementById(id).replaceChildren(node)}
mount('home-header',C.Header());
const sidebar=C.Sidebar();const expand=document.createElement('img');expand.className='sidebar-expand';expand.src=HC_ASSETS.icons['侧边栏展开'];expand.alt='展开侧栏';sidebar.append(expand);mount('home-sidebar',sidebar);
mount('home-metrics',C.MetricRibbon({onChange:(category,index)=>showWorkloads(category,index)}));
function guard(view='manual'){if(window.renderStoryGuard){window.renderStoryGuard(view);return;}mount('home-events',C.GuardEvents({view,onChange:guard,onViewAll:()=>window.openGuardEvents()}))}guard();
mount('home-composer',C.Composer());
document.getElementById('ticks').replaceChildren(...Array.from({length:20},(_,i)=>{const span=document.createElement('span');span.textContent=HCClock.format(i*60-360).slice(0,8);return span}));
document.querySelector('.time-now b').textContent=HCClock.format(0);
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080),screen=document.getElementById('screen');screen.style.setProperty('--home-scale',s);screen.style.transform=`scale(${s})`;screen.style.left=(innerWidth-1920*s)/2+'px';screen.style.top=(innerHeight-1080*s)/2+'px'}addEventListener('resize',fit);fit();

const workloadView=document.createElement('section');workloadView.id='home-workloads';workloadView.hidden=true;document.getElementById('screen').append(workloadView);
function showWorkloads(category,filter=0){
 if(parent!==window)parent.postMessage({type:'hc-home-category',category},location.origin==='null'?'*':location.origin);
 const isWorkload=category==='training'||category==='inference';document.getElementById('screen').dataset.category=category;workloadView.hidden=!isWorkload;
 if(!isWorkload){document.getElementById('screen').dataset.resourceMetric=filter;return;}
 workloadView.replaceChildren();workloadView.dataset.filter=filter;workloadView.classList.add('windowed-workloads');
 const heading=document.createElement('h2');heading.textContent=category==='training'?'训练作业':'推理服务';
 const select=document.createElement('select');select.setAttribute('aria-label','对象排序');
 for(const [value,text] of [['status','按状态排序'],['quality',category==='training'?'按可用度排序':'按成功率排序'],['npu','按卡数排序']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
 const sortWrap=document.createElement('div');sortWrap.className='workload-sort';sortWrap.append(select);
 const browser=document.createElement('div');browser.className='workload-browser';
 const track=document.createElement('div');track.className='workload-browser-track';
 const segments=document.createElement('div');segments.className='workload-browser-segments';
 const windowBox=document.createElement('div');windowBox.className='workload-browser-window';
 const range=document.createElement('input');range.type='range';range.min=0;range.step=1;range.className='workload-browser-keyboard';range.setAttribute('aria-label','浏览当前屏对象，方向键移动范围');
 track.append(segments,windowBox,range);
 // Retain the active object while its width animates; layout movement is not a new hover intent.
 let railPointer=null,railActive=null,railCandidate=null,railTimer=0,railLockedUntil=0,railHitZones=[];
 function expandRail(target){
  clearTimeout(railTimer);railCandidate=null;railActive=target;railLockedUntil=performance.now()+260;
  for(const child of segments.children)child.classList.toggle('is-expanded',child===target);
 }
 segments.addEventListener('pointermove',event=>{
  const point={x:event.clientX,y:event.clientY};
  if(railPointer&&Math.hypot(point.x-railPointer.x,point.y-railPointer.y)<2)return;
  railPointer=point;clearTimeout(railTimer);
  if(performance.now()<railLockedUntil)return;
  if(railActive?.isConnected){const rect=railActive.getBoundingClientRect();if(point.x>=rect.left-4&&point.x<=rect.right+4){railCandidate=null;return;}}
  const target=railHitZones.find(zone=>point.x>=zone.left&&point.x<=zone.right)?.node||event.target.closest('.workload-rail-item');if(!target)return;
  if(!railActive){expandRail(target);return;}
  railCandidate=target;railTimer=setTimeout(()=>{if(railCandidate===target&&target.isConnected)expandRail(target);},100);
 });
 segments.addEventListener('pointerleave',()=>{clearTimeout(railTimer);railPointer=null;expandRail(null);railLockedUntil=0;});
 segments.addEventListener('pointerenter',()=>{clearTimeout(railTimer);railHitZones=Array.from(segments.children, node=>({node,...{left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}}));});
 const captions=document.createElement('div');captions.className='workload-browser-captions';
 const left=document.createElement('span'),position=document.createElement('span'),right=document.createElement('span');position.hidden=true;captions.append(left,position,right);browser.append(track,captions);
 const list=document.createElement('div');list.className='workload-list';
 const prev=document.createElement('button'),next=document.createElement('button');prev.textContent='‹';next.textContent='›';prev.setAttribute('aria-label','上一页');next.setAttribute('aria-label','下一页');prev.className=next.className='workload-browser-page';const pages=document.createElement('span');pages.className='workload-browser-pages';pages.append(prev,next);browser.append(pages);
 const reverse=document.createElement('button');reverse.className='workload-browser-reverse';reverse.textContent='⇄';reverse.type='button';reverse.setAttribute('aria-label','反转排序方向');reverse.setAttribute('aria-pressed','false');reverse.title='反转排序方向';left.after(reverse);
 const controls=document.createElement('div');controls.className='workload-controls';controls.setAttribute('aria-label',heading.textContent+'排序与浏览');controls.append(sortWrap,browser);workloadView.append(controls,list);
 const capacity=category==='training'?6:4,rank={interrupted:0,stuck:1,degraded:2,normal:3},labels={interrupted:'中断',stuck:'卡死',degraded:'劣化',normal:'正常'},colors={interrupted:'#d87a88',stuck:'#ca9466',degraded:'#c6b079',normal:'#638c79'};
 let start=0,items=[],order=[],reversed=false,railSignature='';
 function key(item){return item.data.name+'|'+item.data.start;}
 const stride=category==='training'?189:257;
 const maxStart=()=>Math.ceil(Math.max(0,items.length-capacity)/2)*2;
 function updateRangeFrame(){
  const first=segments.children[start],last=segments.children[Math.min(items.length,start+capacity)-1];
  if(!first||!last)return;
  windowBox.style.left=(first.offsetLeft-4)+'px';windowBox.style.width=(last.offsetLeft+last.offsetWidth-first.offsetLeft+8)+'px';
  windowBox.setAttribute('aria-label',`本页第 ${start+1} 至 ${Math.min(items.length,start+capacity)} 个对象`);
 }
 const railResize=new ResizeObserver(()=>{if(!track.isConnected){railResize.disconnect();return;}updateRangeFrame();});railResize.observe(track);
 function paint(){
  const count=items.length;start=Math.max(0,Math.min(start,maxStart()));const end=Math.min(count,start+capacity);
  range.max=maxStart();range.step=2;range.value=start;range.disabled=count<=capacity;
  range.setAttribute('aria-valuetext',count?`第 ${start+1} 至 ${end} 个，共 ${count} 个`:'没有符合条件的对象');
  windowBox.hidden=!count;updateRangeFrame();
  position.textContent=count?`${start+1}–${end} / ${count} 个`:'0 个';prev.disabled=start===0;next.disabled=start>=maxStart();
  Array.from(segments.children).forEach((n,i)=>n.classList.toggle('in-window',i>=start&&i<end));
 }
 function navigate(index,smooth=false){start=Math.max(0,Math.min(Math.round(index/2)*2,maxStart()));paint();list.scrollTo({top:start/2*stride,behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});}
 const cardCache=new Map();let listSignature='';
 function drawList(){
  const scroll=list.scrollTop,keys=items.map(key),signature=keys.join('~'),structureChanged=signature!==listSignature;
  const cards=items.map((item,i)=>{
   const {quality,ok,fail,total,...stable}=item.data,cacheKey=key(item),content=JSON.stringify([item.status,stable]);
   let entry=cardCache.get(cacheKey);
   if(!entry||entry.content!==content){const card=category==='inference'&&filter===5?energyServiceCard(item):C.WorkloadCard({kind:category,status:item.status,data:item.data});entry={card,content};const old=cardCache.get(cacheKey)?.card;if(old?.isConnected)old.replaceWith(card);cardCache.set(cacheKey,entry);}
   const card=entry.card;card.style.left=((i%2)*678)+'px';card.style.top=(20+Math.floor(i/2)*stride)+'px';card.dataset.browserKey=cacheKey;
   const q=card.querySelector('.hc-quality');if(q){const value=(category==='inference'&&Number(total)>0?100*Number(ok)/Number(total):parseFloat(quality??'99.50')).toFixed(2);if(q.firstChild.nodeValue!==value)q.firstChild.nodeValue=value;}
   const counts=card.querySelector('.hc-request-counts');if(counts){const text=(total??'123860')+' / '+(ok??'123237')+' / ';if(counts.firstChild.nodeValue!==text)counts.firstChild.nodeValue=text;const failed=counts.lastElementChild;if(failed.textContent!==String(fail??'1623'))failed.textContent=String(fail??'1623');}
   return card;
  });
  if(structureChanged||!list.childNodes.length){listSignature=signature;list.replaceChildren(...cards);
   if(!items.length){const empty=document.createElement('p');empty.className='workload-browser-empty';empty.textContent='暂无符合条件的对象';list.append(empty);}
   else{const tail=document.createElement('div');tail.setAttribute('aria-hidden','true');tail.style.cssText='position:absolute;width:1px;height:1px;top:'+(maxStart()/2*stride+591)+'px';list.append(tail);}
   list.scrollTop=scroll;
  }
  const active=new Set(keys);for(const cacheKey of cardCache.keys())if(!active.has(cacheKey))cardCache.delete(cacheKey);
 }

 list.addEventListener('scroll',()=>{start=Math.min(maxStart(),Math.floor((list.scrollTop+1)/stride)*2);paint();},{passive:true});
 prev.onclick=()=>navigate(start-capacity,true);next.onclick=()=>navigate(start+capacity,true);
 function renderCards(resort=false){
  if(workloadView.hidden||document.getElementById('screen').dataset.category!==category)return;
  const source=window.storyWorkloads?window.storyWorkloads(category):HOME_WORKLOADS[category];
  const fresh=source.filter(x=>category==='inference'&&filter===5?x.data.energySaving:!filter||x.status===['','interrupted','stuck','degraded','normal'][filter]);
  const sorted=fresh.slice().sort((a,b)=>select.value==='status'?rank[a.status]-rank[b.status]:select.value==='quality'?parseFloat(a.data.quality)-parseFloat(b.data.quality):Number(b.data.npu)-Number(a.data.npu));
  if(reversed)sorted.reverse();
  if(resort||!order.length){order=sorted.map(key);start=0;}else{const existing=new Set(fresh.map(key));order=order.filter(k=>existing.has(k));const known=new Set(order);sorted.forEach(x=>{if(!known.has(key(x)))order.push(key(x));});}
  const lookup=new Map(fresh.map(x=>[key(x),x]));items=order.map(k=>lookup.get(k)).filter(Boolean);
  const values=items.map(x=>parseFloat(x.data[select.value==='npu'?'npu':'quality'])).filter(Number.isFinite),lo=Math.min(...values),hi=Math.max(...values);
  const signature=items.map(item=>key(item)+'|'+item.status).join('~');
  if(signature!==railSignature){railSignature=signature;segments.replaceChildren(...items.map((item,i)=>{
   const n=document.createElement('button');n.type='button';n.className='workload-rail-item';n.dataset.status=item.status;n.style.setProperty('--status-color',colors[item.status]||'#777');n.setAttribute('aria-label',item.data.name+'，'+labels[item.status]+'，定位卡片');
   const short=document.createElement('span');short.className='rail-short';short.textContent=Array.from(item.data.name)[0];
   const copy=document.createElement('span');copy.className='rail-copy';const name=document.createElement('strong');name.textContent=item.data.name;const status=document.createElement('small');status.textContent=labels[item.status];copy.append(name,status);
   n.append(C.WorkloadIcon(item.data.name),short,copy);n.onclick=()=>{navigate(i);list.querySelectorAll('.rail-card-focus').forEach(c=>c.classList.remove('rail-card-focus'));list.children[i]?.classList.add('rail-card-focus');};
   n.onkeydown=event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();segments.children[Math.max(0,Math.min(items.length-1,i+(event.key==='ArrowRight'?1:-1)))]?.focus();}};return n;
  }));railResize.disconnect();railResize.observe(track);for(const child of segments.children)railResize.observe(child);}

  left.textContent=!items.length?'':select.value==='status'?(reversed?'正常 → 劣化 → 卡死 → 中断':'中断 → 卡死 → 劣化 → 正常'):(select.value==='npu'?(reversed?lo:hi)+' 卡':(reversed?hi:lo).toFixed(2)+'%');
  right.textContent=!items.length||select.value==='status'?'':select.value==='npu'?(reversed?hi:lo)+' 卡':(reversed?lo:hi).toFixed(2)+'%';
  browser.removeAttribute('title');drawList();if(resort)navigate(0);else{if(list.scrollTop>maxStart()/2*stride)list.scrollTop=maxStart()/2*stride;start=Math.floor((list.scrollTop+1)/stride)*2;paint();}
 }
 reverse.onclick=()=>{reversed=!reversed;reverse.setAttribute('aria-pressed',String(reversed));renderCards(true);};
 select.onchange=()=>renderCards(true);range.oninput=()=>navigate(Number(range.value));
 window.refreshWorkloadCards=()=>renderCards(false);renderCards(true);
}

function energyServiceCard({status,data}){
 const card=document.createElement('article');card.className='hc-workload hc-energy-card';card.setAttribute('aria-label',data.name+' 节能服务卡片');card.setAttribute('role','button');card.tabIndex=0;card.onclick=()=>window.openEnergyService?.(data);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openEnergyService?.(data);}};card.style.left='0';card.style.top='20px';
 const header=document.createElement('header');const name=document.createElement('strong');name.textContent=data.name;const normal=C.Status({status});const energy=document.createElement('span');energy.className='hc-status normal';energy.textContent='节能中';const leaf=document.createElement('img');leaf.src=HC_ASSETS.icons['绿色叶子'];leaf.alt='';leaf.className='energy-label-leaf';energy.prepend(leaf);const date=document.createElement('time');date.textContent=data.start;const logo=C.WorkloadIcon(data.name);header.append(logo,name,normal,energy,date);card.append(header);
 const fields=document.createElement('dl');for(const [name,value] of [['百万Token能耗',(Number(data.energyUnit||1.82)/3.6).toFixed(2)+' kWh/Mtoken'],['总能耗',data.energyTotal],['节省能耗',data.energySaved],['节能增益',data.energyGain],['卡数',data.npu+' 卡'],['TTFT',data.ttft],['TPOT',data.tpot]]){const field=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;if(name==='百万Token能耗'){field.className='energy-primary';dt.append(energyGradeTag(data));dd.innerHTML=(Number(data.energyUnit||1.82)/3.6).toFixed(2)+' <small>kWh/Mtoken</small>';}field.append(dt,dd);fields.append(field);}card.append(fields);const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');chart.classList.add('energy-spark');chart.setAttribute('viewBox','0 0 70 30');chart.setAttribute('role','img');chart.setAttribute('aria-label','百万Token能耗趋势');chart.innerHTML='<path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20V29H1Z" fill="#3ac58d" opacity=".2"/><path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20" fill="none" stroke="#3ac58d" stroke-width="2"/>';card.append(chart);return card;
}
window.updateCompactStatusIcons=()=>{
 document.querySelectorAll('.hc-metric-group').forEach(group=>{
  const compact=group.querySelector('.hc-metric-compact'),key=group.dataset.category;
  const values=[...group.querySelectorAll('.hc-metric-row .hc-metric-content>b')].map(b=>Number(b.firstChild.textContent));
  const count=key==='resource'?values[0]+values[1]:values.slice(1,4).reduce((a,b)=>a+b,0);
  const known=Number.isFinite(count),bad=known&&count>0;
  group.dataset.health=known?(bad?'abnormal':'normal'):'unknown';
  group.dataset.severity=!bad?'normal':key==='resource'?(values[0]>0?'interrupted':'stuck'):values[1]>0?'interrupted':values[2]>0?'stuck':'degraded';
  let orbit=compact.querySelector('.hc-health-orbit');
  if(!orbit){orbit=document.createElement('span');orbit.className='hc-health-orbit';orbit.innerHTML='<span class="hc-health-ring" aria-hidden="true"></span><span class="hc-health-copy"><span class="hc-health-label"></span><span class="hc-health-total"></span></span>';compact.append(orbit);}
  let glyphs=orbit.querySelector('.hc-summary-glyphs');if(!glyphs){glyphs=document.createElement('span');glyphs.className='hc-summary-glyphs';glyphs.setAttribute('aria-hidden','true');(key==='resource'?['故障数','隐患数','NPU利用率','更多']:['中断','卡死','劣化','正常运行']).forEach(name=>{if(name==='更多'){const more=document.createElement('span');more.className='hc-summary-more';more.textContent='…';more.title='更多指标';glyphs.append(more);}else{const img=document.createElement('img');img.src=HC_ASSETS.icons[name];img.alt='';glyphs.append(img);}});orbit.prepend(glyphs);}glyphs.querySelectorAll('img').forEach((img,i)=>{const active=key==='resource'?(i<2&&values[i]>0):(values[i+1]>0);img.classList.toggle('is-active',active);});orbit.querySelector('.hc-health-ring').textContent=known?(bad?count:'正常'):'—';
  orbit.querySelector('.hc-health-label').textContent=known?(bad?'项异常':''):'待检测';
  orbit.querySelector('.hc-health-total').textContent=key==='resource'?'NPU 1024 卡':'总数 '+(Number.isFinite(values[0])?values[0]:'—')+' 个';
  const label=group.querySelector('.hc-metric-title').textContent;
  compact.setAttribute('aria-label',label+'，'+(known?(bad?count+'异常':'正常'):'待检测')+'，展开指标');
  compact.querySelector('.hc-compact-statuses')?.remove();
 });
};
window.updateCompactStatusIcons();

function energyGradeTag(data){const size=Number((data.name||'').match(/-(\d+(?:\.\d+)?)B/i)?.[1]||0),limits=size>=70?[12,30]:size>=14?[3,8]:[1,2.5],value=Number(data.energyUnit??1.82),grade=data.energySaving?1:value<limits[0]?0:value<=limits[1]?1:2,tag=document.createElement('span');tag.className='hc-ept-grade';tag.textContent=['绿算','正常','未达标'][grade];tag.style.setProperty('--ept-grade-color',['#26b9b0','#3ac58d','#ef535b'][grade]);return tag;}

/* Event records preserved from the supplied demo. */
(()=>{
    const baseFaultEvents=[
      {name:'光链路脏污，待清污',state:'待人工处理',stateClass:'manual',type:'故障',icon:'fa-exclamation-triangle',iconClass:'fault',object:'计算柜11-L1交换板02',root:'L1-L2 光模块端面脏污',start:'今天 12:00:40',clear:'—',action:'link'},
      {name:'Qwen-1.5B 服务劣化',state:'待人工处理',stateClass:'manual',type:'故障',icon:'fa-exclamation-triangle',iconClass:'fault',object:'推理服务 / D-08 实例',root:'hinic3 驱动版本过低',start:'今天 12:05:00',clear:'—',action:'qwen'},
      {name:'训练集群 RoCE 丢包波动',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-shield',iconClass:'hazard',object:'训练作业 / Group18',root:'PFC 水线配置不均衡',start:'今天 11:18:42',clear:'今天 11:19:36',action:''},
      {name:'NPU 节点温度持续偏高',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-thermometer-half',iconClass:'hazard',object:'计算节点 112.34.11.12',root:'风道回流导致散热效率下降',start:'今天 11:20:08',clear:'今天 11:21:02',action:''},
      {name:'OSFP 光功率劣化',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-wrench',iconClass:'hazard',object:'灵衢互联柜02-L2交换机01',root:'光模块瞬时功率抖动',start:'今天 09:35:12',clear:'今天 09:36:04',action:''},
      {name:'推理实例异常退出',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-wrench',iconClass:'hazard',object:'Qwen2.5 / D实例03',root:'容器内存瞬时越限',start:'昨天 23:18:09',clear:'昨天 23:18:42',action:''},
      {name:'交换机配置漂移',state:'已闭环',stateClass:'human-closed',type:'隐患',icon:'fa-user',iconClass:'hazard',object:'计算柜07-L1交换板01',root:'配置模板版本不一致',start:'昨天 20:06:31',clear:'昨天 20:07:18',action:''}
    ];
    const historicalEvents=Array.from({length:22},(_,i)=>{
      const closed=i<20,stateClass=closed?'auto-closed':'human-closed';
      return {name:['交换网络瞬时拥塞','光模块温漂告警','NPU 端口误码波动','训练队列链路抖动','推理实例连接闪断'][i%5]+` #${String(i+1).padStart(2,'0')}`,state:closed?'已闭环':'已闭环',stateClass,type:i%3===0?'故障':'隐患',object:`${i%2?'计算节点':'灵衢互联柜'} ${String(i+3).padStart(2,'0')}`,root:['流量突发触发拥塞保护','光功率短时偏离基线','历史配置残留导致漂移'][i%3],start:`${i<8?'今天':'昨天'} ${String(8+i%12).padStart(2,'0')}:${String((i*7)%60).padStart(2,'0')}:18`,clear:`${i<8?'今天':'昨天'} ${String(8+i%12).padStart(2,'0')}:${String((i*7+2)%60).padStart(2,'0')}:06`,action:''}
    });
    const energyServiceNames=["Qwen-14B", "Qwen-1.5B 在线服务", "视觉理解服务-3B", "代码生成 Copilot-1.5B", "Embedding 检索服务-0.5B", "数字人实时推理-1.5B", "视觉理解服务 · 07-3B", "代码生成 Copilot · 08-1.5B", "Embedding 检索服务 · 09-0.5B", "数字人实时推理 · 10-1.5B", "DeepSeek-R1-32B", "视觉理解服务 · 12-3B", "代码生成 Copilot · 13-1.5B", "Embedding 检索服务 · 14-0.5B", "数字人实时推理 · 15-1.5B", "Llama-3-70B"];
    const energyEvents=energyServiceNames.map(name=>{const enabled=HOME_WORKLOADS.inference.some(x=>x.data.name===name&&x.data.energySaving),none=name==='Embedding 检索服务-0.5B';return {name:name+(enabled?' 节能策略执行中':none?' 节能策略优化':' 节能机会识别中'),result:enabled?'已开启节能':none?'暂无节能空间':'—',state:enabled?'自动节能中':none?'无节能空间':'节能机会识别中',stateClass:enabled?'energy-done':none?'energy-none':'energy-wait',type:'节能',object:'推理服务 / '+name,root:enabled?'均衡节能策略已生效，持续监控业务影响':none?'连续 4 个识别周期未发现明显的业务请求变化规律，本轮识别已结束':'正在分析业务请求变化，当前第 1/4 个识别周期',start:'今天 09:00:00',clear:enabled?('今天 10:17:14'):none?'今天 10:00:00':'—',action:name==='Qwen-14B'?'energy':'energy-none'};});

window.getProcessingEnergyEvents=()=>energyEvents.filter(r=>r.stateClass==='energy-wait').map(r=>({...r}));
const initialEnergyEvents=energyEvents.map(x=>({...x}));
let records=[...baseFaultEvents,...historicalEvents,...energyEvents];
const screen=document.getElementById('screen'),view=document.createElement('section');view.id='guard-all';view.hidden=true;screen.append(view);
const states=[['manual','待人工处理','待人工处理'],['processing','自动处理中','自动处理中-方块'],['auto-closed','已闭环','已自动闭环-方块'],['human-closed','已闭环','已人工闭环-方块'],['energy-wait','节能机会识别中','识别节能-彩色方底'],['energy-done','自动节能中','自动节能-绿色方底'],['energy-none','无节能空间','已生效节能机会点']];
let list='fault',state='all',type='all',page=1,size=15,query='',energyResult='all';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const btn=(text,fn,cls='')=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b};
function asset(name){const img=el('img','guard-asset');img.src=HC_ASSETS.icons[name];img.alt='';return img}
function close(){view.hidden=true;view.classList.remove('expanded');if(parent!==window)parent.postMessage({type:'hc-home-category',category:screen.dataset.category||'resource'},location.origin==='null'?'*':location.origin)}
window.openGuardEvents=()=>{window.closeEnergyDetail?.();list='fault';state='all';type='all';query='';page=1;view.hidden=false;render();if(parent!==window)parent.postMessage({type:'hc-home-category',category:'events'},location.origin==='null'?'*':location.origin)};
function choose(s){energyResult='all';state=s;list=s.startsWith('energy')?'energy':'fault';type=list==='energy'?'节能':'all';page=1;render()}
function select(label,options,value,change){const s=el('select');s.setAttribute('aria-label',label);options.forEach(([v,t])=>{const o=el('option','',t);o.value=v;s.append(o)});s.value=value;s.onchange=()=>change(s.value);return s}
function render(){const hideEnergyResult=list==='energy';view.dataset.recognizing=String(hideEnergyResult);view.dataset.energy=String(list==='energy');view.replaceChildren();const nav=el('nav','guard-page-nav');nav.append(btn('首页',close),el('span','active','智能体事件'),btn('×',close));nav.firstChild.prepend(asset('页签上的首页'));nav.children[1].prepend(asset('盾牌-0910'));nav.lastChild.setAttribute('aria-label','关闭智能体事件');nav.lastChild.classList.add('guard-tab-close');nav.children[1].append(nav.lastChild);view.append(nav);
const summary=el('div','guard-page-summary');
[['fault','故障&隐患事件'],['energy','节能事件']].forEach(([category,title])=>{
 const group=el('section','guard-summary-group '+category+(list===category&&state==='all'?' selected':''));group.append(el('h2','',title));const cards=el('div','guard-summary-cards');
 const total=btn('',()=>{list=category;state='all';type=category==='energy'?'节能':'all';query='';page=1;render()},'guard-total');
 total.append(el('span','','总数'),el('b','',records.filter(x=>category==='energy'?x.type==='节能':x.type!=='节能').length));group.append(total);total.setAttribute('aria-label','查看全部'+title);group.onclick=e=>{if(!e.target.closest('button'))total.click();};
 states.filter(([key])=>key.startsWith('energy')===(category==='energy')).forEach(([key,label,icon])=>{const card=btn('',()=>{query='';choose(key)},'guard-stat'+(state===key?' active':''));const copy=el('span');copy.append(el('span','',label),el('b','',records.filter(x=>(key==='energy-closed'?['energy-done','energy-none'].includes(x.stateClass):x.stateClass===key)).length));const symbol=asset(icon);card.append(symbol,copy);cards.append(card)});
 group.append(cards);summary.append(group);
});view.append(summary);
const panel=el('div','guard-table-panel');
const filters=el('div','guard-filters');const search=el('input');search.placeholder=list==='energy'?'搜索节能机会、优化对象或说明':'搜索名称、发生对象或根因';search.setAttribute('aria-label','搜索智能体事件');search.value=query;search.onchange=()=>{query=search.value.trim();page=1;render()};filters.append(search,select('筛选事件状态',[['all','全部状态'],...states.filter(x=>list==='energy'?x[0].startsWith('energy'):!x[0].startsWith('energy')).map(x=>[x[0],x[1]])],state,v=>{state=v;if(v!=='all'){list=v.startsWith('energy')?'energy':'fault';type=list==='energy'?'节能':'all'}page=1;render()}),select('筛选事件类型',[['all','全部类型'],['故障','故障'],['隐患','隐患'],['节能','节能']],type,v=>{type=v;if(v==='节能'){list='energy';state='all'}else if(v!=='all'){list='fault';if(state.startsWith('energy'))state='all'}page=1;render()}));filters.hidden=list!=='energy';if(list==='energy')filters.lastElementChild.hidden=true;panel.append(filters);if(list==='energy')filters.hidden=true;
const resultFilter=el('div','guard-result-filter');resultFilter.hidden=true;resultFilter.append(select('筛选节能结果',[['all','全部结果'],['已开启节能','已开启节能'],['暂无节能空间','暂无节能空间'],['—','暂无结果']],energyResult,v=>{energyResult=v;page=1;render()}));if(list==='energy')panel.append(resultFilter);
const rows=records.filter(x=>(list!=='energy'||hideEnergyResult||energyResult==='all'||x.result===energyResult)&&(list==='energy'?x.type==='节能':x.type!=='节能')&&(state==='all'||(state==='energy-closed'?['energy-done','energy-none'].includes(x.stateClass):x.stateClass===state))&&(type==='all'||x.type===type)&&[x.name,x.object,x.root].some(t=>t.includes(query)));const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);const wrap=el('div','guard-table-scroll'),table=el('table'),thead=el('thead'),tr=el('tr');(list==='energy'?['节能事件名称','节能状态','节能结果','优化对象','节能优化说明','发现时间','状态更新时间','操作']:['名称','事件状态','事件类型','发生对象','故障根因','发生时间','清除时间','操作']).forEach(t=>{if(hideEnergyResult&&t==='节能结果')return;const th=el('th','',t);if(list==='energy'&&t==='节能状态'){const trigger=btn('',()=>{filters.hidden=!filters.hidden},'guard-filter-trigger');trigger.setAttribute('aria-label','筛选节能状态');trigger.append(asset('筛选'));th.append(trigger)}else if(list==='energy'&&t==='节能结果'){const trigger=btn('',()=>{resultFilter.hidden=!resultFilter.hidden},'guard-filter-trigger');trigger.setAttribute('aria-label','筛选节能结果');trigger.append(asset('筛选'));th.append(trigger)}else if(list!=='energy'&&!['操作','发生时间','清除时间'].includes(t)){const trigger=btn('',()=>{filters.hidden=!filters.hidden},'guard-filter-trigger');trigger.setAttribute('aria-label','筛选'+t);trigger.append(asset('筛选'));th.append(trigger)}else if(t.endsWith('时间'))th.append(el('span','guard-sort-symbol','⇅'));tr.append(th)});thead.append(tr);table.append(thead);const body=el('tbody');rows.slice((page-1)*size,page*size).forEach(item=>{const row=el('tr');(list==='energy'?[item.name,item.state,item.result,item.object,item.root,item.start,item.clear]:[item.name,item.state,item.type,item.object,item.root,item.start,item.clear]).forEach((text,i)=>{if(hideEnergyResult&&i===2)return;const cell=el('td','',text);cell.title=text;if(list==='energy'&&i===1){const mark=item.stateClass==='energy-wait'?el('i','story-step-icon working'):asset(item.stateClass==='energy-done'?'绿色叶子':'灰色叶子');if(item.stateClass!=='energy-wait')mark.classList.add('guard-energy-closed-leaf');cell.prepend(mark);}if(list==='energy'&&i===2&&item.result!=='—'){const dot=el('i','guard-result-dot'+(item.result==='已开启节能'?' enabled':''));dot.setAttribute('aria-hidden','true');cell.prepend(dot);}if(i===0){const business=item.action==='qwen-recovery'||/Qwen|推理实例|推理服务/.test(item.object)&&!/网卡|光链路|节点/.test(item.name);const mark=HCComponents.EventTypeIcon({domain:item.type==='节能'?'inference':/训练|作业/.test(item.object)?'training':business?'inference':'resource',name:item.name+' '+item.object,type:item.type==='节能'?'energy':item.type==='隐患'?'risk':'fault',closed:/closed|energy-done|energy-none/.test(item.stateClass),size:24});cell.prepend(mark);}if(i===1&&list!=='energy'){cell.className=item.stateClass;const key={'manual':'待人工处理-圆','processing':'自动处理中-圆','auto-closed':'已自动闭环-圆','human-closed':'已人工闭环-圆','energy-wait':'绿色叶子','energy-none':'灰色叶子','energy-done':'绿色叶子'}[item.stateClass];if(item.type==='节能'){const leaf=el('i','guard-clean-leaf');leaf.style.setProperty('--leaf', 'url('+"./assets/uploads/149-129790.png"+')');cell.prepend(leaf);}else cell.prepend(asset(key))}if(i===2&&list!=='energy'){cell.textContent='';cell.append(el('span','event-type '+(item.type==='故障'?'fault':'other'),text))}row.append(cell)});const action=el('td');const detail=btn('',()=>showRecord(item),'record-detail');if(item.result==='已开启节能'){detail.append(asset('节能监控'));}else detail.append(asset('查看详情'));detail.dataset.tip=item.result==='已开启节能'?'查看节能监控':'查看事件详情';if(item.type==='节能'&&(item.object!=='推理服务 / Qwen-14B'||item.stateClass==='energy-wait')){detail.setAttribute('aria-disabled','true');detail.tabIndex=-1;detail.style.cursor='default';}detail.setAttribute('aria-label',detail.dataset.tip+'：'+item.name);if(item.result==='已开启节能'){const strategyView=btn('',()=>{},'record-detail');strategyView.append(asset('查看详情'));strategyView.dataset.tip='查看策略';strategyView.setAttribute('aria-label','查看策略');strategyView.setAttribute('aria-disabled','true');strategyView.tabIndex=-1;strategyView.style.cursor='default';action.append(strategyView);}action.append(detail);if(item.stateClass==='energy-none'){const retry=btn('',()=>restartRecognition(item),'guard-restart');retry.dataset.tip='重新识别';retry.setAttribute('aria-label','重新识别');retry.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7v5h-5M20 12a8 8 0 1 0-2.3 5.7"/></svg>';action.append(retry);}row.append(action);body.append(row)});if(!rows.length){const row=el('tr'),cell=el('td','guard-no-rows','暂无符合条件的事件');cell.colSpan=hideEnergyResult?7:8;row.append(cell);body.append(row)}table.append(body);wrap.append(table);panel.append(wrap);
const footer=el('footer','guard-footer');footer.append(el('span','','总计：'+rows.length));footer.append(select('每页条数',[[10,'10 项/页'],[15,'15 项/页'],[30,'30 项/页']],size,v=>{size=Number(v);page=1;render()}));for(const [label,n] of [['‹',page-1],...Array.from({length:pages},(_,i)=>[String(i+1),i+1]),['›',page+1]]){const b=btn(label,()=>{page=n;render()},n===page?'active':'');b.disabled=n<1||n>pages;footer.append(b)}const jump=el('input','guard-jump');jump.type='number';jump.min=1;jump.max=pages;jump.value=page;jump.setAttribute('aria-label','跳转页码');footer.append(jump,btn('跳转',()=>{page=Math.max(1,Math.min(pages,Number(jump.value)||1));render()},'guard-jump-button'));panel.append(footer);view.append(panel)}
window.addEventListener('hc-energy-reset',()=>{energyEvents.forEach((row,i)=>Object.assign(row,initialEnergyEvents[i]));records=records.filter(r=>r.type!=='节能').concat(energyEvents.map(r=>({...r})));if(!view.hidden)render();});
window.addEventListener('hc-energy-change',e=>{for(const collection of [energyEvents,records])collection.filter(r=>r.type==='节能'&&r.object.endsWith(' / '+e.detail.name)).forEach(r=>{r.name=e.detail.name+(e.detail.done?' 节能策略执行中':' 节能机会识别中');r.result=e.detail.done?'已开启节能':'—';r.stateClass=e.detail.done?'energy-done':'energy-wait';r.state=e.detail.done?'自动节能中':'节能机会识别中';r.clear=e.detail.done?'今天 '+e.detail.time:'—';r.root=e.detail.done?'均衡节能策略已生效，持续监控业务影响':'正在分析业务请求变化，当前第 1/4 个识别周期';});if(!view.hidden)render();});
window.updateStoryRecords=fn=>{records=fn([...baseFaultEvents,...historicalEvents,...energyEvents].map(x=>({...x})));if(!view.hidden)render()};
function restartRecognition(item){for(const r of [...energyEvents,...records])if(r.object===item.object){r.name=r.object.split(' / ').pop()+' 节能机会识别中';r.stateClass='energy-wait';r.state='节能机会识别中';r.result='—';r.root='正在分析业务请求变化，当前第 1/4 个识别周期';r.clear='—';}state='all';render();}
function showRecord(item){if(item.type==='节能'&&(item.object!=='推理服务 / Qwen-14B'||item.stateClass==='energy-wait'))return;if(item.type==='节能'&&item.action!=='energy-none'){window.openEnergyEvent?.(item);return;}if(item.action==='qwen'||item.action==='qwen-auto'){window.openNicEvent?.({mode:item.action==='qwen-auto'?'recovery':'driver'});return;}if(item.action==='link'||item.action==='link-auto'){window.openOpticalEvent?.({mode:item.action==='link-auto'?'isolation':'full'});return;}const overlay=el('div','guard-record-overlay');const card=el('section','guard-record');const closeButton=btn('×',()=>overlay.remove());closeButton.setAttribute('aria-label','关闭事件记录');card.append(closeButton,el('h2','',item.name));[['事件状态',item.state],['事件类型',item.type],['发生对象',item.object],['故障根因',item.root],['发生时间',item.start],['清除时间',item.clear]].forEach(([label,value])=>{const row=el('p');row.append(el('span','',label),el('strong','',value));card.append(row)});overlay.append(card);view.append(overlay)}
})();

const HOME_LINKS_SVG="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"187 580 1626 87\" fill=\"none\"><defs><linearGradient id=\"paint_linear_0\" x1=\"548.770691\" x2=\"548.770691\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_1\" x1=\"590.122925\" x2=\"590.122925\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_2\" x1=\"630.154236\" x2=\"630.154236\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_3\" x1=\"671.066162\" x2=\"671.066162\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_4\" x1=\"712.928101\" x2=\"712.928101\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_5\" x1=\"672.155151\" x2=\"672.155151\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_6\" x1=\"632.262817\" x2=\"632.262817\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_7\" x1=\"590.609375\" x2=\"590.609375\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_8\" x1=\"631.605042\" x2=\"631.605042\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_9\" x1=\"672.909729\" x2=\"672.909729\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_10\" x1=\"712.893494\" x2=\"712.893494\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_11\" x1=\"753.757935\" x2=\"753.757935\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_12\" x1=\"795.280884\" x2=\"795.280884\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_13\" x1=\"754.573181\" x2=\"754.573181\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_14\" x1=\"714.299683\" x2=\"714.299683\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_15\" x1=\"673.151672\" x2=\"673.151672\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_16\" x1=\"713.775024\" x2=\"713.775024\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_17\" x1=\"755.431824\" x2=\"755.431824\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_18\" x1=\"795.320801\" x2=\"795.320801\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_19\" x1=\"836.090393\" x2=\"836.090393\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_20\" x1=\"877.074829\" x2=\"877.074829\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_21\" x1=\"836.023071\" x2=\"836.023071\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_22\" x1=\"796.286316\" x2=\"796.286316\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_23\" x1=\"754.788452\" x2=\"754.788452\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_24\" x1=\"795.786865\" x2=\"795.786865\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_25\" x1=\"837.084534\" x2=\"837.084534\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_26\" x1=\"877.047852\" x2=\"877.047852\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_27\" x1=\"917.898499\" x2=\"917.898499\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_28\" x1=\"958.806885\" x2=\"958.806885\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_29\" x1=\"917.84906\" x2=\"917.84906\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_30\" x1=\"878.212158\" x2=\"878.212158\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_31\" x1=\"836.813416\" x2=\"836.813416\" y1=\"593.535645\" y2=\"666.197205\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_32\" x1=\"327.560852\" x2=\"327.560852\" y1=\"0\" y2=\"72.9015579\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_33\" x1=\"368.477173\" x2=\"368.477173\" y1=\"0\" y2=\"73.0911865\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_34\" x1=\"407.465576\" x2=\"407.465576\" y1=\"0\" y2=\"72.9015579\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_35\" x1=\"449.424286\" x2=\"449.424286\" y1=\"0\" y2=\"72.9015579\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_36\" x1=\"409.719574\" x2=\"409.719574\" y1=\"0\" y2=\"72.8052673\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_37\" x1=\"368.121185\" x2=\"368.121185\" y1=\"0\" y2=\"72.9000778\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_38\" x1=\"328.278046\" x2=\"328.278046\" y1=\"0\" y2=\"72.0194626\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_39\" x1=\"287.45816\" x2=\"287.45816\" y1=\"0\" y2=\"72.9000778\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_40\" x1=\"246.550613\" x2=\"246.550613\" y1=\"0\" y2=\"72.213974\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_41\" x1=\"287.086273\" x2=\"287.086273\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_42\" x1=\"326.294617\" x2=\"326.294617\" y1=\"0\" y2=\"72.3087921\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_43\" x1=\"368.151276\" x2=\"368.151276\" y1=\"0\" y2=\"72.3087921\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_44\" x1=\"327.899567\" x2=\"327.899567\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_45\" x1=\"285.931671\" x2=\"285.931671\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_46\" x1=\"247.040482\" x2=\"247.040482\" y1=\"0\" y2=\"72.3088074\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_47\" x1=\"205.953186\" x2=\"205.953186\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_48\" x1=\"165.033279\" x2=\"165.033279\" y1=\"0\" y2=\"72.9000778\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_49\" x1=\"205.795456\" x2=\"205.795456\" y1=\"0\" y2=\"72.8052673\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_50\" x1=\"245.227295\" x2=\"245.227295\" y1=\"0\" y2=\"72.8052673\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_51\" x1=\"286.870026\" x2=\"286.870026\" y1=\"0\" y2=\"72.9000778\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_52\" x1=\"246.044739\" x2=\"246.044739\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_53\" x1=\"204.268326\" x2=\"204.268326\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_54\" x1=\"164.69342\" x2=\"164.69342\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_55\" x1=\"124.238029\" x2=\"124.238029\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_56\" x1=\"82.7291565\" x2=\"82.7291565\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_57\" x1=\"123.790878\" x2=\"123.790878\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_58\" x1=\"163.113937\" x2=\"163.113937\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_59\" x1=\"204.638565\" x2=\"204.638565\" y1=\"0\" y2=\"72.9997787\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_60\" x1=\"164.349243\" x2=\"164.349243\" y1=\"0\" y2=\"72.3088074\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_61\" x1=\"123.003258\" x2=\"123.003258\" y1=\"0\" y2=\"72.3087921\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_62\" x1=\"83.4185028\" x2=\"83.4185028\" y1=\"0\" y2=\"72.3087921\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"paint_linear_63\" x1=\"43.0588417\" x2=\"43.0588417\" y1=\"0\" y2=\"72.3087921\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"0\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(99,213,168)\" offset=\"1\" stop-opacity=\"0.75\" />\n\t\t</linearGradient>\n\t</defs><g id=\"\u7ec4\u5408 1115250\">\n\t\t<g id=\"\u5de6\u4fa7\u4e92\u8054\u7ebf\">\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M221.035 666.197C221.035 666.197 266.88 593.536 548.33 593.536C829.781 593.536 876.506 666.197 876.506 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_0)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M221.035 666.197C221.035 666.197 266.88 593.536 548.33 593.536C829.781 593.536 876.506 666.197 876.506 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M221.035 666.197C221.035 666.197 266.88 593.536 548.33 593.536C829.781 593.536 876.506 666.197 876.506 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M221.035 666.197C221.035 666.197 271.29 593.536 587.921 593.536C904.553 593.536 959.211 666.197 959.211 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_1)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M221.035 666.197C221.035 666.197 271.29 593.536 587.921 593.536C904.553 593.536 959.211 666.197 959.211 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M221.035 666.197C221.035 666.197 271.29 593.536 587.921 593.536C904.553 593.536 959.211 666.197 959.211 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M221.035 666.197C221.035 666.197 275.699 593.536 627.512 593.536C979.325 593.536 1039.27 665.317 1039.27 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_2)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M221.035 666.197C221.035 666.197 275.699 593.536 627.512 593.536C979.325 593.536 1039.27 665.317 1039.27 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M221.035 666.197C221.035 666.197 275.699 593.536 627.512 593.536C979.325 593.536 1039.27 665.317 1039.27 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M221.035 666.197C221.035 666.197 280.109 593.536 667.103 593.536C1054.1 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_3)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M221.035 666.197C221.035 666.197 280.109 593.536 667.103 593.536C1054.1 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M221.035 666.197C221.035 666.197 280.109 593.536 667.103 593.536C1054.1 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M304.759 666.197C304.759 666.197 357.507 593.536 708.085 593.536C1058.66 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_4)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M304.759 666.197C304.759 666.197 357.507 593.536 708.085 593.536C1058.66 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M304.759 666.197C304.759 666.197 357.507 593.536 708.085 593.536C1058.66 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M304.759 666.197C304.759 666.197 353.113 593.536 668.633 593.536C984.152 593.536 1039.55 665.317 1039.55 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_5)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M304.759 666.197C304.759 666.197 353.113 593.536 668.633 593.536C984.152 593.536 1039.55 665.317 1039.55 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M304.759 666.197C304.759 666.197 353.113 593.536 668.633 593.536C984.152 593.536 1039.55 665.317 1039.55 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M304.759 666.197C304.759 666.197 348.719 593.536 629.181 593.536C909.643 593.536 959.767 666.197 959.767 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_6)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M304.759 666.197C304.759 666.197 348.719 593.536 629.181 593.536C909.643 593.536 959.767 666.197 959.767 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M304.759 666.197C304.759 666.197 348.719 593.536 629.181 593.536C909.643 593.536 959.767 666.197 959.767 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M304.759 666.197C304.759 666.197 344.324 593.536 589.729 593.536C835.133 593.536 876.46 666.197 876.46 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_7)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M304.759 666.197C304.759 666.197 344.324 593.536 589.729 593.536C835.133 593.536 876.46 666.197 876.46 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M304.759 666.197C304.759 666.197 344.324 593.536 589.729 593.536C835.133 593.536 876.46 666.197 876.46 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M386.419 666.197C386.419 666.197 424.88 593.536 633.366 593.536C841.853 593.536 876.791 666.197 876.791 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_8)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M386.419 666.197C386.419 666.197 424.88 593.536 633.366 593.536C841.853 593.536 876.791 666.197 876.791 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M386.419 666.197C386.419 666.197 424.88 593.536 633.366 593.536C841.853 593.536 876.791 666.197 876.791 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M386.419 666.197C386.419 666.197 429.235 593.536 672.469 593.536C915.704 593.536 959.401 666.197 959.401 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_9)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M386.419 666.197C386.419 666.197 429.235 593.536 672.469 593.536C915.704 593.536 959.401 666.197 959.401 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M386.419 666.197C386.419 666.197 429.235 593.536 672.469 593.536C915.704 593.536 959.401 666.197 959.401 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M386.419 666.197C386.419 666.197 433.59 593.536 711.573 593.536C989.555 593.536 1039.37 665.317 1039.37 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_10)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M386.419 666.197C386.419 666.197 433.59 593.536 711.573 593.536C989.555 593.536 1039.37 665.317 1039.37 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M386.419 666.197C386.419 666.197 433.59 593.536 711.573 593.536C989.555 593.536 1039.37 665.317 1039.37 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M386.419 666.197C386.419 666.197 437.946 593.536 750.676 593.536C1063.41 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_11)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M386.419 666.197C386.419 666.197 437.946 593.536 750.676 593.536C1063.41 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M386.419 666.197C386.419 666.197 437.946 593.536 750.676 593.536C1063.41 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M469.465 666.197C469.465 666.197 513.041 593.536 790.438 593.536C1067.83 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_12)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M469.465 666.197C469.465 666.197 513.041 593.536 790.438 593.536C1067.83 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M469.465 666.197C469.465 666.197 513.041 593.536 790.438 593.536C1067.83 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M469.465 666.197C469.465 666.197 508.694 593.536 751.417 593.536C994.139 593.536 1039.68 665.317 1039.68 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_13)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M469.465 666.197C469.465 666.197 508.694 593.536 751.417 593.536C994.139 593.536 1039.68 665.317 1039.68 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M469.465 666.197C469.465 666.197 508.694 593.536 751.417 593.536C994.139 593.536 1039.68 665.317 1039.68 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M469.465 666.197C469.465 666.197 504.348 593.536 712.396 593.536C920.444 593.536 959.134 666.197 959.134 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_14)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M469.465 666.197C469.465 666.197 504.348 593.536 712.396 593.536C920.444 593.536 959.134 666.197 959.134 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M469.465 666.197C469.465 666.197 504.348 593.536 712.396 593.536C920.444 593.536 959.134 666.197 959.134 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M469.465 666.197C469.465 666.197 500.002 593.536 673.375 593.536C846.748 593.536 876.839 666.197 876.839 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_15)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M469.465 666.197C469.465 666.197 500.002 593.536 673.375 593.536C846.748 593.536 876.839 666.197 876.839 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M469.465 666.197C469.465 666.197 500.002 593.536 673.375 593.536C846.748 593.536 876.839 666.197 876.839 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M551.084 666.197C551.084 666.197 578.866 593.536 716.209 593.536C853.552 593.536 876.466 666.197 876.466 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_16)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M551.084 666.197C551.084 666.197 578.866 593.536 716.209 593.536C853.552 593.536 876.466 666.197 876.466 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M551.084 666.197C551.084 666.197 578.866 593.536 716.209 593.536C853.552 593.536 876.466 666.197 876.466 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M551.084 666.197C551.084 666.197 583.17 593.536 754.849 593.536C926.528 593.536 959.78 666.197 959.78 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_17)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M551.084 666.197C551.084 666.197 583.17 593.536 754.849 593.536C926.528 593.536 959.78 666.197 959.78 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M551.084 666.197C551.084 666.197 583.17 593.536 754.849 593.536C926.528 593.536 959.78 666.197 959.78 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M551.084 666.197C551.084 666.197 587.473 593.536 793.488 593.536C999.503 593.536 1039.56 665.317 1039.56 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_18)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M551.084 666.197C551.084 666.197 587.473 593.536 793.488 593.536C999.503 593.536 1039.56 665.317 1039.56 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M551.084 666.197C551.084 666.197 587.473 593.536 793.488 593.536C999.503 593.536 1039.56 665.317 1039.56 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M551.084 666.197C551.084 666.197 591.777 593.536 832.128 593.536C1072.48 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_19)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M551.084 666.197C551.084 666.197 591.777 593.536 832.128 593.536C1072.48 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M551.084 666.197C551.084 666.197 591.777 593.536 832.128 593.536C1072.48 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M633.053 666.197C633.053 666.197 671.676 593.536 874.433 593.536C1077.19 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_20)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M633.053 666.197C633.053 666.197 671.676 593.536 874.433 593.536C1077.19 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M633.053 666.197C633.053 666.197 671.676 593.536 874.433 593.536C1077.19 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M633.053 666.197C633.053 666.197 667.44 593.536 836.404 593.536C1005.37 593.536 1038.99 665.317 1038.99 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_21)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M633.053 666.197C633.053 666.197 667.44 593.536 836.404 593.536C1005.37 593.536 1038.99 665.317 1038.99 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M633.053 666.197C633.053 666.197 667.44 593.536 836.404 593.536C1005.37 593.536 1038.99 665.317 1038.99 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M633.053 666.197C633.053 666.197 663.205 593.536 798.376 593.536C933.547 593.536 959.52 666.197 959.52 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_22)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M633.053 666.197C633.053 666.197 663.205 593.536 798.376 593.536C933.547 593.536 959.52 666.197 959.52 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M633.053 666.197C633.053 666.197 663.205 593.536 798.376 593.536C933.547 593.536 959.52 666.197 959.52 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M633.053 666.197C633.053 666.197 658.969 593.536 760.347 593.536C861.726 593.536 876.524 666.197 876.524 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_23)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M633.053 666.197C633.053 666.197 658.969 593.536 760.347 593.536C861.726 593.536 876.524 666.197 876.524 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M633.053 666.197C633.053 666.197 658.969 593.536 760.347 593.536C861.726 593.536 876.524 666.197 876.524 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M714.7 666.197C714.7 666.197 737.117 593.536 803.553 593.536C869.988 593.536 876.874 666.197 876.874 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_24)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M714.7 666.197C714.7 666.197 737.117 593.536 803.553 593.536C869.988 593.536 876.874 666.197 876.874 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M714.7 666.197C714.7 666.197 737.117 593.536 803.553 593.536C869.988 593.536 876.874 666.197 876.874 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M714.7 666.197C714.7 666.197 741.281 593.536 840.934 593.536C940.588 593.536 959.469 666.197 959.469 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_25)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M714.7 666.197C714.7 666.197 741.281 593.536 840.934 593.536C940.588 593.536 959.469 666.197 959.469 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M714.7 666.197C714.7 666.197 741.281 593.536 840.934 593.536C940.588 593.536 959.469 666.197 959.469 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M714.7 666.197C714.7 666.197 745.444 593.536 878.316 593.536C1011.19 593.536 1039.4 665.317 1039.4 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_26)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M714.7 666.197C714.7 666.197 745.444 593.536 878.316 593.536C1011.19 593.536 1039.4 665.317 1039.4 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M714.7 666.197C714.7 666.197 745.444 593.536 878.316 593.536C1011.19 593.536 1039.4 665.317 1039.4 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M714.7 666.197C714.7 666.197 749.608 593.536 915.697 593.536C1081.79 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_27)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M714.7 666.197C714.7 666.197 749.608 593.536 915.697 593.536C1081.79 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M714.7 666.197C714.7 666.197 749.608 593.536 915.697 593.536C1081.79 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M796.517 666.197C796.517 666.197 826.037 593.536 956.165 593.536C1086.29 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_28)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M796.517 666.197C796.517 666.197 826.037 593.536 956.165 593.536C1086.29 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M796.517 666.197C796.517 666.197 826.037 593.536 956.165 593.536C1086.29 593.536 1121.1 666.197 1121.1 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M796.517 666.197C796.517 666.197 821.959 593.536 919.555 593.536C1017.15 593.536 1039.18 665.317 1039.18 665.317\" opacity=\"0.5\" stroke=\"url(#paint_linear_29)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M796.517 666.197C796.517 666.197 821.959 593.536 919.555 593.536C1017.15 593.536 1039.18 665.317 1039.18 665.317\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M796.517 666.197C796.517 666.197 821.959 593.536 919.555 593.536C1017.15 593.536 1039.18 665.317 1039.18 665.317\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M796.517 666.197C796.517 666.197 817.881 593.536 882.946 593.536C948.01 593.536 959.907 666.197 959.907 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_30)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M796.517 666.197C796.517 666.197 817.881 593.536 882.946 593.536C948.01 593.536 959.907 666.197 959.907 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M796.517 666.197C796.517 666.197 817.881 593.536 882.946 593.536C948.01 593.536 959.907 666.197 959.907 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M796.517 666.197C796.517 666.197 813.804 593.536 846.336 593.536C878.868 593.536 877.093 666.197 877.093 666.197\" opacity=\"0.5\" stroke=\"url(#paint_linear_31)\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M796.517 666.197C796.517 666.197 813.804 593.536 846.336 593.536C878.868 593.536 877.093 666.197 877.093 666.197\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M796.517 666.197C796.517 666.197 813.804 593.536 846.336 593.536C878.868 593.536 877.093 666.197 877.093 666.197\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" />\n\t\t</g>\n\t\t<g id=\"\u53f3\u4fa7\u4e92\u8054\u7ebf\">\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M0 72.9016C0 72.9016 85.2358 0.000117303 346.6 1.43102e-10C607.964 -0.000117303 655.122 72.1158 655.122 72.1158\" opacity=\"0.5\" stroke=\"url(#paint_linear_32)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M0 72.9016C0 72.9016 85.2358 0.000117303 346.6 1.43102e-10C607.964 -0.000117303 655.122 72.1158 655.122 72.1158\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7535\" d=\"M0 72.9016C0 72.9016 85.2358 0.000117303 346.6 1.43102e-10C607.964 -0.000117303 655.122 72.1158 655.122 72.1158\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M0 72.9016C0 72.9016 39.9999 0.000117303 359.127 1.41193e-10C678.253 -0.000117303 736.954 73.0912 736.954 73.0912\" opacity=\"0.5\" stroke=\"url(#paint_linear_33)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M0 72.9016C0 72.9016 39.9999 0.000117303 359.127 1.41193e-10C678.253 -0.000117303 736.954 73.0912 736.954 73.0912\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7536\" d=\"M0 72.9016C0 72.9016 39.9999 0.000117303 359.127 1.41193e-10C678.253 -0.000117303 736.954 73.0912 736.954 73.0912\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M0 72.9016C0 72.9016 46.0113 0.000117303 399.045 1.43102e-10C752.079 -0.000117303 814.931 72.1158 814.931 72.1158\" opacity=\"0.5\" stroke=\"url(#paint_linear_34)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.56,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M0 72.9016C0 72.9016 46.0113 0.000117303 399.045 1.43102e-10C752.079 -0.000117303 814.931 72.1158 814.931 72.1158\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.56,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7537\" d=\"M0 72.9016C0 72.9016 46.0113 0.000117303 399.045 1.43102e-10C752.079 -0.000117303 814.931 72.1158 814.931 72.1158\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.56,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M0 72.9016C0 72.9016 67.9863 0.000117303 446.901 1.43102e-10C825.817 -0.000117303 898.849 72.1158 898.849 72.1158\" opacity=\"0.5\" stroke=\"url(#paint_linear_35)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M0 72.9016C0 72.9016 67.9863 0.000117303 446.901 1.43102e-10C825.817 -0.000117303 898.849 72.1158 898.849 72.1158\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7538\" d=\"M0 72.9016C0 72.9016 67.9863 0.000117303 446.901 1.43102e-10C825.817 -0.000117303 898.849 72.1158 898.849 72.1158\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1776.02,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M0 72.8053C0 72.8053 48.3707 0.000118629 399.152 1.46552e-10C749.934 -0.000118629 819.439 72.0195 819.439 72.0195\" opacity=\"0.5\" stroke=\"url(#paint_linear_36)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M0 72.8053C0 72.8053 48.3707 0.000118629 399.152 1.46552e-10C749.934 -0.000118629 819.439 72.0195 819.439 72.0195\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7539\" d=\"M0 72.8053C0 72.8053 48.3707 0.000118629 399.152 1.46552e-10C749.934 -0.000118629 819.439 72.0195 819.439 72.0195\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M0 72.8053C0 72.8053 43.974 0.000118629 359.677 1.44782e-10C675.381 -0.000118629 736.242 72.9001 736.242 72.9001\" opacity=\"0.5\" stroke=\"url(#paint_linear_37)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M0 72.8053C0 72.8053 43.974 0.000118629 359.677 1.44782e-10C675.381 -0.000118629 736.242 72.9001 736.242 72.9001\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7540\" d=\"M0 72.8053C0 72.8053 43.974 0.000118629 359.677 1.44782e-10C675.381 -0.000118629 736.242 72.9001 736.242 72.9001\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1696.59,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M0 71.9247C0 71.9247 38.6966 0.000118629 319.322 1.46552e-10C599.947 -0.000118629 656.556 72.0195 656.556 72.0195\" opacity=\"0.5\" stroke=\"url(#paint_linear_38)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M0 71.9247C0 71.9247 38.6966 0.000118629 319.322 1.46552e-10C599.947 -0.000118629 656.556 72.0195 656.556 72.0195\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7541\" d=\"M0 71.9247C0 71.9247 38.6966 0.000118629 319.322 1.46552e-10C599.947 -0.000118629 656.556 72.0195 656.556 72.0195\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M0 71.9247C0 71.9247 34.3825 0.000118629 280.589 1.44782e-10C526.796 -0.000118629 574.916 72.9001 574.916 72.9001\" opacity=\"0.5\" stroke=\"url(#paint_linear_39)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M0 71.9247C0 71.9247 34.3825 0.000118629 280.589 1.44782e-10C526.796 -0.000118629 574.916 72.9001 574.916 72.9001\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7542\" d=\"M0 71.9247C0 71.9247 34.3825 0.000118629 280.589 1.44782e-10C526.796 -0.000118629 574.916 72.9001 574.916 72.9001\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1695.71,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M0 72.1192C0 72.1192 29.7803 0.00011598 239.27 1.39703e-10C448.759 -0.00011598 493.101 72.214 493.101 72.214\" opacity=\"0.5\" stroke=\"url(#paint_linear_40)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M0 72.1192C0 72.1192 29.7803 0.00011598 239.27 1.39703e-10C448.759 -0.00011598 493.101 72.214 493.101 72.214\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7543\" d=\"M0 72.1192C0 72.1192 29.7803 0.00011598 239.27 1.39703e-10C448.759 -0.00011598 493.101 72.214 493.101 72.214\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M0 72.9998C0 72.9998 34.1566 0.00011598 278.561 1.3952e-10C522.966 -0.00011598 574.173 72.3088 574.173 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_41)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M0 72.9998C0 72.9998 34.1566 0.00011598 278.561 1.3952e-10C522.966 -0.00011598 574.173 72.3088 574.173 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7544\" d=\"M0 72.9998C0 72.9998 34.1566 0.00011598 278.561 1.3952e-10C522.966 -0.00011598 574.173 72.3088 574.173 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M0 72.1192C0 72.1192 38.5329 0.00011598 317.852 1.3952e-10C597.172 -0.00011598 652.589 72.3088 652.589 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_42)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M0 72.1192C0 72.1192 38.5329 0.00011598 317.852 1.3952e-10C597.172 -0.00011598 652.589 72.3088 652.589 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7545\" d=\"M0 72.1192C0 72.1192 38.5329 0.00011598 317.852 1.3952e-10C597.172 -0.00011598 652.589 72.3088 652.589 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M0 72.1192C0 72.1192 42.9092 0.00011598 357.144 1.3952e-10C671.378 -0.00011598 736.303 72.3088 736.303 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_43)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M0 72.1192C0 72.1192 42.9092 0.00011598 357.144 1.3952e-10C671.378 -0.00011598 736.303 72.3088 736.303 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7546\" d=\"M0 72.1192C0 72.1192 42.9092 0.00011598 357.144 1.3952e-10C671.378 -0.00011598 736.303 72.3088 736.303 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1613.46,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M0 72.9998C0 72.9998 41.7523 0.00011598 318.653 1.3952e-10C595.554 -0.00011598 655.799 72.3088 655.799 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_44)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M0 72.9998C0 72.9998 41.7523 0.00011598 318.653 1.3952e-10C595.554 -0.00011598 655.799 72.3088 655.799 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7547\" d=\"M0 72.9998C0 72.9998 41.7523 0.00011598 318.653 1.3952e-10C595.554 -0.00011598 655.799 72.3088 655.799 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M0 72.9998C0 72.9998 37.4138 0.00011598 279.702 1.3952e-10C521.99 -0.00011598 571.863 72.3088 571.863 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_45)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M0 72.9998C0 72.9998 37.4138 0.00011598 279.702 1.3952e-10C521.99 -0.00011598 571.863 72.3088 571.863 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7548\" d=\"M0 72.9998C0 72.9998 37.4138 0.00011598 279.702 1.3952e-10C521.99 -0.00011598 571.863 72.3088 571.863 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M0 72.1192C0 72.1192 33.0754 0.00011598 240.751 1.3952e-10C448.427 -0.00011598 494.081 72.3088 494.081 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_46)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M0 72.1192C0 72.1192 33.0754 0.00011598 240.751 1.3952e-10C448.427 -0.00011598 494.081 72.3088 494.081 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7549\" d=\"M0 72.1192C0 72.1192 33.0754 0.00011598 240.751 1.3952e-10C448.427 -0.00011598 494.081 72.3088 494.081 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M0 72.9998C0 72.9998 28.737 0.00011598 201.8 1.39703e-10C374.863 -0.00011598 411.906 72.214 411.906 72.214\" opacity=\"0.5\" stroke=\"url(#paint_linear_47)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M0 72.9998C0 72.9998 28.737 0.00011598 201.8 1.39703e-10C374.863 -0.00011598 411.906 72.214 411.906 72.214\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7550\" d=\"M0 72.9998C0 72.9998 28.737 0.00011598 201.8 1.39703e-10C374.863 -0.00011598 411.906 72.214 411.906 72.214\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1532.95,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M0 72.8053C0 72.8053 24.2663 0.000118629 161.661 1.44782e-10C299.056 -0.000118629 330.067 72.9001 330.067 72.9001\" opacity=\"0.5\" stroke=\"url(#paint_linear_48)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M0 72.8053C0 72.8053 24.2663 0.000118629 161.661 1.44782e-10C299.056 -0.000118629 330.067 72.9001 330.067 72.9001\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7551\" d=\"M0 72.8053C0 72.8053 24.2663 0.000118629 161.661 1.44782e-10C299.056 -0.000118629 330.067 72.9001 330.067 72.9001\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M0 72.8053C0 72.8053 28.5716 0.000118629 200.315 1.46552e-10C372.059 -0.000118629 411.591 72.0195 411.591 72.0195\" opacity=\"0.5\" stroke=\"url(#paint_linear_49)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M0 72.8053C0 72.8053 28.5716 0.000118629 200.315 1.46552e-10C372.059 -0.000118629 411.591 72.0195 411.591 72.0195\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7552\" d=\"M0 72.8053C0 72.8053 28.5716 0.000118629 200.315 1.46552e-10C372.059 -0.000118629 411.591 72.0195 411.591 72.0195\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M0 72.8053C0 72.8053 32.877 0.000118629 238.969 1.46552e-10C445.062 -0.000118629 490.455 72.0195 490.455 72.0195\" opacity=\"0.5\" stroke=\"url(#paint_linear_50)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M0 72.8053C0 72.8053 32.877 0.000118629 238.969 1.46552e-10C445.062 -0.000118629 490.455 72.0195 490.455 72.0195\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7553\" d=\"M0 72.8053C0 72.8053 32.877 0.000118629 238.969 1.46552e-10C445.062 -0.000118629 490.455 72.0195 490.455 72.0195\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M0 72.8053C0 72.8053 37.1823 0.000118629 277.624 1.44782e-10C518.065 -0.000118629 573.74 72.9001 573.74 72.9001\" opacity=\"0.5\" stroke=\"url(#paint_linear_51)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M0 72.8053C0 72.8053 37.1823 0.000118629 277.624 1.44782e-10C518.065 -0.000118629 573.74 72.9001 573.74 72.9001\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7554\" d=\"M0 72.8053C0 72.8053 37.1823 0.000118629 277.624 1.44782e-10C518.065 -0.000118629 573.74 72.9001 573.74 72.9001\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1450.88,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M0 72.9998C0 72.9998 77.9735 0.00011598 260.804 1.3952e-10C443.635 -0.00011598 492.089 72.3088 492.089 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_52)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M0 72.9998C0 72.9998 77.9735 0.00011598 260.804 1.3952e-10C443.635 -0.00011598 492.089 72.3088 492.089 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7555\" d=\"M0 72.9998C0 72.9998 77.9735 0.00011598 260.804 1.3952e-10C443.635 -0.00011598 492.089 72.3088 492.089 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_53)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7556\" d=\"M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M0 72.9998C0 72.9998 70.3347 0.00011598 192.222 1.4707e-10C314.109 -0.00011598 329.387 68.5967 329.387 68.5967\" opacity=\"0.5\" stroke=\"url(#paint_linear_54)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M0 72.9998C0 72.9998 70.3347 0.00011598 192.222 1.4707e-10C314.109 -0.00011598 329.387 68.5967 329.387 68.5967\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7557\" d=\"M0 72.9998C0 72.9998 70.3347 0.00011598 192.222 1.4707e-10C314.109 -0.00011598 329.387 68.5967 329.387 68.5967\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M0 72.9998C0 72.9998 66.5154 0.00011598 157.931 1.3952e-10C249.346 -0.00011598 248.476 72.3088 248.476 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_55)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M0 72.9998C0 72.9998 66.5154 0.00011598 157.931 1.3952e-10C249.346 -0.00011598 248.476 72.3088 248.476 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7558\" d=\"M0 72.9998C0 72.9998 66.5154 0.00011598 157.931 1.3952e-10C249.346 -0.00011598 248.476 72.3088 248.476 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1369.23,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M0 72.9998C0 72.9998 46.6233 0.00011598 107.902 1.3952e-10C169.18 -0.00011598 165.413 72.3088 165.413 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_56)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M0 72.9998C0 72.9998 46.6233 0.00011598 107.902 1.3952e-10C169.18 -0.00011598 165.413 72.3088 165.413 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7559\" d=\"M0 72.9998C0 72.9998 46.6233 0.00011598 107.902 1.3952e-10C169.18 -0.00011598 165.413 72.3088 165.413 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M0 72.9998C0 72.9998 50.4636 0.00011598 142.382 1.3952e-10C234.299 -0.00011598 247.582 72.3088 247.582 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_57)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M0 72.9998C0 72.9998 50.4636 0.00011598 142.382 1.3952e-10C234.299 -0.00011598 247.582 72.3088 247.582 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7560\" d=\"M0 72.9998C0 72.9998 50.4636 0.00011598 142.382 1.3952e-10C234.299 -0.00011598 247.582 72.3088 247.582 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M0 72.9998C0 72.9998 54.304 0.00011598 176.861 1.3952e-10C299.418 -0.00011598 326.228 72.3088 326.228 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_58)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M0 72.9998C0 72.9998 54.304 0.00011598 176.861 1.3952e-10C299.418 -0.00011598 326.228 72.3088 326.228 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7561\" d=\"M0 72.9998C0 72.9998 54.304 0.00011598 176.861 1.3952e-10C299.418 -0.00011598 326.228 72.3088 326.228 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M0 72.9998C0 72.9998 58.1444 0.00011598 211.341 1.3952e-10C364.537 -0.00011598 409.277 72.3088 409.277 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_59)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M0 72.9998C0 72.9998 58.1444 0.00011598 211.341 1.3952e-10C364.537 -0.00011598 409.277 72.3088 409.277 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7562\" d=\"M0 72.9998C0 72.9998 58.1444 0.00011598 211.341 1.3952e-10C364.537 -0.00011598 409.277 72.3088 409.277 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1286.43,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M0 72.1192C0 72.1192 44.0342 0.00011598 165.956 1.3952e-10C287.879 -0.00011598 328.698 72.3088 328.698 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_60)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M0 72.1192C0 72.1192 44.0342 0.00011598 165.956 1.3952e-10C287.879 -0.00011598 328.698 72.3088 328.698 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7563\" d=\"M0 72.1192C0 72.1192 44.0342 0.00011598 165.956 1.3952e-10C287.879 -0.00011598 328.698 72.3088 328.698 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M0 72.1192C0 72.1192 40.2137 0.00011598 131.655 1.3952e-10C223.097 -0.00011598 246.007 72.3088 246.007 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_61)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M0 72.1192C0 72.1192 40.2137 0.00011598 131.655 1.3952e-10C223.097 -0.00011598 246.007 72.3088 246.007 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7564\" d=\"M0 72.1192C0 72.1192 40.2137 0.00011598 131.655 1.3952e-10C223.097 -0.00011598 246.007 72.3088 246.007 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M0 72.1192C0 72.1192 36.3932 0.00011598 97.3543 1.3952e-10C158.315 -0.00011598 166.837 72.3088 166.837 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_62)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M0 72.1192C0 72.1192 36.3932 0.00011598 97.3543 1.3952e-10C158.315 -0.00011598 166.837 72.3088 166.837 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7565\" d=\"M0 72.1192C0 72.1192 36.3932 0.00011598 97.3543 1.3952e-10C158.315 -0.00011598 166.837 72.3088 166.837 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M0 72.1192C0 72.1192 32.5727 0.00011598 63.0532 1.3952e-10C93.5338 -0.00011598 85.0257 72.3088 85.0257 72.3088\" opacity=\"0.5\" stroke=\"url(#paint_linear_63)\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M0 72.1192C0 72.1192 32.5727 0.00011598 63.0532 1.3952e-10C93.5338 -0.00011598 85.0257 72.3088 85.0257 72.3088\" opacity=\"0.5\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.200000003\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t\t<path id=\"\u77e2\u91cf 7566\" d=\"M0 72.1192C0 72.1192 32.5727 0.00011598 63.0532 1.3952e-10C93.5338 -0.00011598 85.0257 72.3088 85.0257 72.3088\" opacity=\"0.5\" stroke=\"rgb(0,255,145)\" stroke-opacity=\"0.349999994\" stroke-width=\"0.740369\" transform=\"matrix(-1,0,0,1,1205.85,593.536)\" />\n\t\t</g>\n\t</g>\n</svg>";
/* Parameters from reference-demo sections 2/3/4/6. */
window.HCOpticalFlow=function(svg){
 if(HCMotion.REDUCED||svg.querySelector('.hc-flow-paths'))return;
 const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g');group.classList.add('hc-flow-paths');group.setAttribute('aria-hidden','true');
 const seen=new Set();const paths=[...svg.querySelectorAll('path:not(defs path):not(.evt-npu-flow)')].filter(base=>{const key=base.getAttribute('d')+'|'+(base.getAttribute('transform')||'');if(seen.has(key))return false;seen.add(key);return true});svg.append(group);
 const speed=svg.classList.contains('evt-links')?315/(1.25*1.75):315;const lengths=paths.map(p=>p.getTotalLength()),cycle=Math.max(1,...lengths.map(L=>(L+110)/speed*1000));const epoch=document.timeline.currentTime;paths.forEach((base,i)=>{const L=lengths[i];if(!L)return;const end=(L+110)/speed*1000/cycle;[[110,.06],[70,.10],[40,.16],[16,.34]].forEach(([seg,opacity])=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',base.getAttribute('d'));if(base.hasAttribute('transform'))p.setAttribute('transform',base.getAttribute('transform'));p.setAttribute('class','hc-flow-trace'+(base.classList.contains('evt-fault-link')?' hc-flow-fault':''));p.style.cssText=`fill:none;stroke:var(--hc-flow-color,rgb(99,213,168));stroke-opacity:${opacity};stroke-width:1;stroke-linecap:round;stroke-dasharray:${seg} ${L+110+seg};pointer-events:none`;group.append(p);const animation=p.animate([{strokeDashoffset:seg,offset:0},{strokeDashoffset:seg-(L+110),offset:end},{strokeDashoffset:seg-(L+110),offset:1}],{duration:cycle,delay:0,iterations:Infinity,easing:'linear'});animation.startTime=epoch;});});
};
window.HCFadeTip=function(node,text){
 const label=node.querySelector('span');if(node.dataset.copy===text)return;const first=node.dataset.copy===undefined;node.dataset.copy=text;
 clearTimeout(node._copyTimer);label.getAnimations().forEach(a=>a.cancel());
 if(first||HCMotion.REDUCED){label.textContent=text;return;}
 label.animate([{opacity:1,filter:'blur(0px)'},{opacity:0,filter:'blur(3px)'}],{duration:200,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
 node._copyTimer=setTimeout(()=>{if(!node.isConnected)return;label.getAnimations().forEach(a=>a.cancel());label.textContent=text;label.animate([{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'blur(0px)'}],{duration:300,easing:'cubic-bezier(.33,0,.67,1)'});},250);
};
window.addEventListener('load',()=>{
 const screen=document.getElementById('screen'),original=screen.querySelector('img.cabinet-links');
 if(original){const svg=new DOMParser().parseFromString(HOME_LINKS_SVG,'image/svg+xml').documentElement;svg.removeAttribute('width');svg.removeAttribute('height');svg.setAttribute('class','cabinet-links hc-home-flow');svg.setAttribute('aria-hidden','true');svg.querySelectorAll('path').forEach(n=>{n.style.opacity='0';if(n.getAttribute('d')==="M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088"&&n.getAttribute('transform')==="matrix(-1,0,0,1,1369.23,593.536)")n.classList.add('evt-fault-link');});original.after(svg);HCOpticalFlow(svg);}
 const info=document.querySelector('.energy-info');if(info){info.firstChild.textContent='';const img=document.createElement('img');img.src=HC_ASSETS.icons['tips-0909'];img.alt='';info.prepend(img);}
 let openMenu=null;
 function decorate(select,mode=false){
 const wrapper=select.parentElement;select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.style.pointerEvents='none';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='hc-select-trigger';trigger.setAttribute('aria-label',select.getAttribute('aria-label'));trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
 const menu=document.createElement('div');menu.className='hc-select-menu';menu.setAttribute('role','listbox');menu.hidden=true;screen.append(menu);
 const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(openMenu===close)openMenu=null;};
 const sync=()=>{if(!mode)trigger.textContent=select.options[select.selectedIndex].textContent;};
 const choose=i=>{select.selectedIndex=i;select.dispatchEvent(new Event('change',{bubbles:true}));sync();close();trigger.focus();};
 const show=()=>{if(!menu.hidden){close();return;}openMenu?.();const sr=screen.getBoundingClientRect(),r=wrapper.getBoundingClientRect(),scale=sr.width/1920;menu.style.left=((r.left-sr.left)/scale)+'px';menu.style.top=((r.bottom-sr.top)/scale+8)+'px';menu.replaceChildren();[...select.options].forEach((option,i)=>{const b=document.createElement('button');b.type='button';b.textContent=option.textContent;b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===select.selectedIndex));b.onclick=()=>choose(i);b.onkeydown=e=>{if(e.key==='Escape'){close();trigger.focus()}else if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();menu.children[(i+(e.key==='ArrowDown'?1:-1)+select.options.length)%select.options.length].focus();}};menu.append(b)});menu.hidden=false;trigger.setAttribute('aria-expanded','true');openMenu=close;};
 trigger.onclick=show;trigger.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();show();menu.children[select.selectedIndex]?.focus();}if(e.key==='Escape')close();};select.addEventListener('change',sync);wrapper.append(trigger);if(!mode){select.style.opacity='0';wrapper.querySelector(':scope>span')?.setAttribute('hidden','');}sync();
 document.addEventListener('click',e=>{if(!wrapper.contains(e.target)&&!menu.contains(e.target))close()});
 }
 decorate(document.querySelector('#home-header select'),true);decorate(document.getElementById('range'));
 document.querySelector('#home-header button').addEventListener('click',()=>openMenu?.());
},{once:true});

const OPTICAL_ASSETS={icons:{"NPU板":HC_ASSETS.icons["NPU板"],"展开全部":HC_ASSETS.icons["展开全部"],"隐患数":HC_ASSETS.icons["隐患数"],"绿色小手":HC_ASSETS.icons["绿色小手"],"深灰色的故障":HC_ASSETS.icons["深灰色的故障"],"橙色隐患":HC_ASSETS.icons["橙色隐患"],"已闭环":HC_ASSETS.icons["已闭环"],"待人工处理":HC_ASSETS.icons["待人工处理"],"策略中心":HC_ASSETS.icons["策略中心"],"星星":HC_ASSETS.icons["星星"],"告警铃铛":HC_ASSETS.icons["告警铃铛"],"筛选":HC_ASSETS.icons["筛选"],"故障+小手":HC_ASSETS.icons["故障+小手"],"时间轴-故障+小手":HC_ASSETS.icons["时间轴-故障+小手"],"已人工闭环-圆":HC_ASSETS.icons["已人工闭环-圆"],"事件感知":HC_ASSETS.icons["事件感知"],".发送dark":HC_ASSETS.icons[".发送dark"],"能耗":HC_ASSETS.icons["能耗"],"正常运行":HC_ASSETS.icons["正常运行"],"待处理-圆":HC_ASSETS.icons["待处理-圆"],"页签上的智能体事件":HC_ASSETS.icons["页签上的智能体事件"],"箭头2":HC_ASSETS.icons["箭头2"],"用户":HC_ASSETS.icons["用户"],"侧边栏智慧体":HC_ASSETS.icons["侧边栏智慧体"],"自动处理中-方块":HC_ASSETS.icons["自动处理中-方块"],"智能模式logo":HC_ASSETS.icons["智能模式logo"],"灰色隐患":HC_ASSETS.icons["灰色隐患"],"HBM利用率":HC_ASSETS.icons["HBM利用率"],"箭头":HC_ASSETS.icons["箭头"],"运行总数":HC_ASSETS.icons["运行总数"],"节能+小手":HC_ASSETS.icons["节能+小手"],"灰色闪电":HC_ASSETS.icons["灰色闪电"],"待人工处理-圆":HC_ASSETS.icons["待人工处理-圆"],"已自动闭环-方块":HC_ASSETS.icons["已自动闭环-方块"],"吸收功率劣化":HC_ASSETS.icons["吸收功率劣化"],"自动处理中-圆":HC_ASSETS.icons["自动处理中-圆"],"DeepSeek":HC_ASSETS.icons["DeepSeek"],"历史任务":HC_ASSETS.icons["历史任务"],"翻转":HC_ASSETS.icons["翻转"],"近24小时":HC_ASSETS.icons["近24小时"],"链路多次闪断":HC_ASSETS.icons["链路多次闪断"],"对勾":HC_ASSETS.icons["对勾"],"劣化":HC_ASSETS.icons["劣化"],"深灰色闪电":HC_ASSETS.icons["深灰色闪电"],"查看详情":HC_ASSETS.icons["查看详情"],"暂无待处理事项":HC_ASSETS.icons["暂无待处理事项"],"AI":HC_ASSETS.icons["AI"],"灰色的故障":HC_ASSETS.icons["灰色的故障"],"红色的故障":HC_ASSETS.icons["红色的故障"],"中断":HC_ASSETS.icons["中断"],"NPU利用率":HC_ASSETS.icons["NPU利用率"],"首页":HC_ASSETS.icons["首页"],"绿色闪电":HC_ASSETS.icons["绿色闪电"],"千问":HC_ASSETS.icons["千问"],"发送-禁用态":HC_ASSETS.icons["发送-禁用态"],"新建对话":HC_ASSETS.icons["新建对话"],"已生效节能机会点":HC_ASSETS.icons["已生效节能机会点"],"夜间模式":HC_ASSETS.icons["夜间模式"],"红色小手":HC_ASSETS.icons["红色小手"],"灵衢SFU板":HC_ASSETS.icons["灵衢SFU板"],"已人工闭环-方块":HC_ASSETS.icons["已人工闭环-方块"],"故障数":HC_ASSETS.icons["故障数"],"灵衢互联柜":HC_ASSETS.icons["灵衢互联柜"],"发送-正常态":HC_ASSETS.icons["发送-正常态"],"logo":HC_ASSETS.icons["logo"],"页签上的首页":HC_ASSETS.icons["页签上的首页"],"故障诊断-圆":HC_ASSETS.icons["故障诊断-圆"],"侧边栏展开":HC_ASSETS.icons["侧边栏展开"],"卡死":HC_ASSETS.icons["卡死"],"已自动闭环-圆":HC_ASSETS.icons["已自动闭环-圆"],"自动处理中":HC_ASSETS.icons["自动处理中"],"光模块脏污":HC_ASSETS.icons["光模块脏污"],"smart":HC_ASSETS.icons["smart"],"normal":HC_ASSETS.icons["normal"],"trainingBase":HC_ASSETS.icons["trainingBase"],"tipAutoBase":HC_ASSETS.icons["tipAutoBase"],"放大-0910":HC_ASSETS.icons["放大-0910"],"盾牌-0910":HC_ASSETS.icons["盾牌-0910"],"箭头-0910":HC_ASSETS.icons["箭头-0910"],"网卡-0910":HC_ASSETS.icons["网卡-0910"],"内存-0910":HC_ASSETS.icons["内存-0910"],"指针-0910":HC_ASSETS.icons["指针-0910"],"系统-0910":HC_ASSETS.icons["系统-0910"],"实例-0910":HC_ASSETS.icons["实例-0910"],"服务-0910":HC_ASSETS.icons["服务-0910"],"超节点":HC_ASSETS.icons["超节点"],"节能监控":HC_ASSETS.icons["节能监控"],"设置":HC_ASSETS.icons["设置"],"复选项":HC_ASSETS.icons["复选项"],"完成":HC_ASSETS.icons["完成"],"红色头":HC_ASSETS.icons["红色头"],"下载":HC_ASSETS.icons["下载"],"钱":HC_ASSETS.icons["钱"],"报告图标":HC_ASSETS.icons["报告图标"],"待处理节能机会点-方块":"./assets/icons/-34.svg","header":"./assets/icons/header-2.svg","inferenceBase":"./assets/icons/inferencebase-2.svg","markerManual":"./assets/icons/markermanual-2.svg","markerClosed":"./assets/icons/markerclosed-2.svg","markerEnergy":"./assets/icons/markerenergy-2.svg","markerEffective":"./assets/icons/markereffective-2.svg","返回-原稿尺寸":"./assets/icons/-35.svg","故障诊断-圆-原稿绿色":"./assets/icons/asset-139-f16726be.svg","隔离芯片":"./assets/uploads/146-111388.png","灰色圆形故障":"./assets/icons/asset-141-bd70bb6b.svg","人工处理-绿色":"./assets/uploads/92-98785.png"}};
/* 事件详情候选组件：只管理展示，不推断或推进业务状态。 */
window.HCEventUI = (() => {
  const el = (tag, className = '', text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = (name, size = 16) => {
    const node = el('img', 'evt-icon');
    node.src = OPTICAL_ASSETS.icons[name];
    node.alt = '';
    node.width = node.height = size;
    return node;
  };
  const button = (label, className = '', onClick) => {
    const node = el('button', className, label);
    node.type = 'button';
    if (onClick) node.addEventListener('click', onClick);
    return node;
  };
  const place = (node, x, y, width, height) => {
    Object.assign(node.style, {position: 'absolute', left: `${x}px`, top: `${y}px`});
    if (width !== undefined) node.style.width = `${width}px`;
    if (height !== undefined) node.style.height = `${height}px`;
    return node;
  };
  function Badge(text, tone = 'done') {
    return el('span', `evt-badge evt-badge-${text==='已闭环'?'closed':tone}`, text);
  }
  function DiagnosticStep({title, time, badge, tone, content, expanded = true, onToggle, onSelect}) {
    const node = el('section', 'evt-step');
    const header = el('div', 'evt-step-header');
    const select = button('', 'evt-step-select', onSelect);
    select.setAttribute('aria-label', `查看${title}环节`);
    const processing=tone==='processing'||tone==='manual';
    const status=processing?el('i','story-step-icon working'):icon('对勾',16);status.setAttribute('aria-label',processing?'进行中':'已完成');select.append(status, el('strong', '', title));
    if (time) select.append(el('time', '', time));
    header.append(select);
    if (badge) header.append(Badge(badge, tone));
    const toggle = button('', 'evt-collapse', () => onToggle?.(!expanded));
    toggle.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${title}`);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.append(el('i', 'evt-chevron'));
    header.append(toggle);
    const body = el('div', 'evt-step-body');
    body.append(content);
    window.HCEvidence?.attach(body,title,badge!=='待处理' && tone!=='processing');
    body.hidden = !expanded;
    node.append(header, body);
    return node;
  }
  function CauseChain(items) {
    const card = el('div', 'evt-card evt-cause');
    card.append(el('h3', '', '故障因果链'));
    const list = el('ol', 'evt-cause-list');
    for (const item of items) {
      const row = el('li', item.root ? 'evt-root-cause' : '');
      row.append(icon(item.icon, 14));
      const content = el('div');
      const title = el('div', 'evt-cause-title', item.title);
      if (item.root) title.append(Badge('根因', 'manual'));
      content.append(title, el('p', '', item.description));
      row.append(content);
      list.append(row);
    }
    card.append(list);
    return card;
  }
  function MetricComparison({label, before, after, unit, changeLabel,direction='up'}) {
    const row = el('div', 'evt-metric-compare');
    if(label==='带宽' && direction==='down')row.classList.add('evt-metric-degraded');
    for (const [index, value] of [before, after].entries()) {
      if (index) {
        const arrow=icon('箭头',20);arrow.classList.add('evt-metric-arrow');
        arrow.width=19.671875;arrow.height=12.992676;row.append(arrow);
      }
      const col = el('div');
      col.append(el('small', '', `${index ? '当前' : '隔离前'}${label} ${unit}`));
      const values=el('div','evt-metric-values');
      values.append(el('b', index ? 'evt-after' : 'evt-before', value));
      if(index && changeLabel){
        const growth=el('span','evt-metric-growth');
        const arrow=icon('箭头2',8);arrow.width=7.464844;arrow.height=8.914551;if(direction==='down')arrow.style.transform='rotate(180deg)';arrow.alt=direction==='down'?'下降':'上升';
        growth.append(arrow,el('span','',changeLabel));values.append(growth);
      }
      col.append(values);
      row.append(col);
    }
    return row;
  }
  function TopologyNode({label, subtitle, count, number, kind = 'device', x, y, width, height}) {
    const node = el('div', `evt-topo-node evt-node-${kind}`);
    node.dataset.node = label;
    node.append(el('span', 'evt-node-label', label));
    if (number) node.append(el('small', 'evt-node-number', number));
    if (subtitle) {
      const line = el('span', 'evt-node-subtitle', subtitle);
      line.append(el('b', '', count));
      node.append(line);
    }
    place(node, x, y, width, height);
    return node;
  }
  function ProcessTimeline({steps, current, onSelect}) {
    const node = el('section', 'evt-process');
    node.setAttribute('aria-label', '处理环节时间轴');
    node.append(el('h2', '', '处理环节'));
    const list = el('div', `evt-process-list${steps.length > 6 ? ' evt-process-extended' : ''}`);
    list.setAttribute('role', 'tablist');
    const widths = [132, 165, 132, 120, 156, 192];
    const offsets = [16, 223, 462, 669, 852, 1083];
    steps.forEach((step, i) => {
      const item = el('div', 'evt-process-item');
      if (steps.length <= 6) {
        item.style.left = steps.length===5 ? `calc(${i*25}% + ${82*(1-i/4)-78*i/4-widths[i]/2}px)` : `${offsets[i]}px`;
        item.style.width = `${widths[i]}px`;
      }
      const card = button('', `evt-process-card${step.manual ? ' evt-pending' : ''}`, () => onSelect(i));
      card.setAttribute('role', 'tab');
      card.setAttribute('aria-selected', String(current === i));
      card.setAttribute('aria-label', step.description.replace(/\n/g, ''));
      if(step.iconName==='红色小手'&&!step.manual)card.classList.add('manual-completed');
      card.append(icon(step.iconName || (step.manual ? '红色小手' : '故障诊断-圆-原稿绿色'), 32));
      const text = el('span');
      const title = el('span', 'evt-process-title', step.title);
      if (step.manual) title.append(el('em', '', '待处理'));
      text.append(title, el('span', 'evt-process-description', step.description));
      card.append(text);
      const tick = el('div', `evt-process-tick${current === i ? ' evt-current' : ''}`);
      tick.append(el('span', '', step.time));
      item.append(card, tick);
      list.append(item);
    });
    node.append(list);
    return node;
  }
  return {el, icon, button, place, Badge, DiagnosticStep, CauseChain, MetricComparison, TopologyNode, ProcessTimeline};
})();

/* 入场控制器：独立取消队列，不与业务闭环计时器混用。 */
window.HCEntrance = function(root, memory={played:()=>false,mark:()=>{}}) {
  const timers=new Set(), observers=new Set();
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);}
  function stop(){timers.forEach(clearTimeout);timers.clear();observers.forEach(o=>o.disconnect());observers.clear();root.querySelectorAll('[data-observed]').forEach(n=>{if(!n.classList.contains('evt-chart-enter'))delete n.dataset.observed;});root.querySelectorAll('[data-stream-hidden]').forEach(n=>{n.style.visibility=n.dataset.streamHidden;delete n.dataset.streamHidden;});root.querySelectorAll('.evt-word').forEach(n=>n.replaceWith(n.textContent));root.querySelectorAll('.evt-generating,.evt-line-enter,.evt-thinking,.evt-stream-settle').forEach(n=>n.classList.remove('evt-generating','evt-line-enter','evt-thinking','evt-stream-settle'));}
  function stream(container,skip=0,onDone=()=>{}){
    if(!container||reduced()){onDone();return;}
    container.classList.add('evt-generating','evt-thinking');later(()=>container.classList.remove('evt-thinking'),200);
    const words=[];const skipped=[...container.children].slice(0,skip);const included=n=>!skipped.some(el=>el===n||el.contains(n));
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    const texts=[];while(walker.nextNode()){const n=walker.currentNode;if(included(n)&&n.textContent.trim()&&!n.parentElement.closest('svg,button,time:not(.evt-recovery-time),.evt-badge,.evt-data-halo,.evt-data-ring,.evt-data-ambient'))texts.push(n);}
    texts.forEach(n=>{const fragment=document.createDocumentFragment();(n.textContent.match(/[\u3400-\u9fff]|[a-zA-Z0-9]+|[^\u3400-\u9fffa-zA-Z0-9]/gu)||[]).forEach(text=>{const span=document.createElement('span');span.className='evt-word';span.textContent=text;words.push(span);fragment.append(span);});n.replaceWith(fragment);});
    // 图标在本行首字出现时显示，标签在前面的文字打完后显示。
    container.querySelectorAll('img,svg,.evt-badge,li').forEach(node=>{
      if(!included(node))return;
      const badge=node.matches('.evt-badge');let index;
      if(badge){index=words.filter(w=>w.compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING).length;}
      else{index=words.findIndex(w=>node.contains(w)||(node.compareDocumentPosition(w)&Node.DOCUMENT_POSITION_FOLLOWING));}
      if(index<0)index=0;
      node.dataset.streamHidden=node.style.visibility;node.style.visibility='hidden';
      later(()=>{node.style.visibility=node.dataset.streamHidden||'';delete node.dataset.streamHidden;},400+index*45);
    });
    words.forEach((word,i)=>later(()=>{word.classList.add('evt-word-on','evt-word-live');if(i>=18)words[i-18].classList.remove('evt-word-live');},400+i*45));
    later(()=>{words.forEach(n=>n.classList.remove('evt-word-live'));container.classList.add('evt-stream-settle');later(()=>{container.classList.remove('evt-generating','evt-stream-settle');onDone();},300);},400+words.length*45+200);
  }
  function typeResponse(container){
    if(!container||reduced())return;
    const words=[];
    container.querySelectorAll(':scope>.evt-response-heading button,:scope>p').forEach(node=>{
      node.classList.remove('evt-line-enter');
      const text=node.textContent;node.replaceChildren();
      Array.from(text).forEach(char=>{const span=document.createElement('span');span.className='evt-word evt-response-char';span.textContent=char;node.append(span);words.push(span);});
    });
    container.querySelectorAll(':scope>.evt-response-heading').forEach(node=>node.classList.remove('evt-line-enter'));
    // 所有段落共享一条匀速队列，段落之间不额外停顿。
    words.forEach((word,i)=>later(()=>word.classList.add('evt-word-on'),i*30));
  }
  function lines(nodes){if(reduced())return;nodes.forEach((n,i)=>{n.style.setProperty('--evt-enter-delay',`${i*70}ms`);n.classList.add('evt-line-enter');});}
  function observeOnce(card,key,play){
    if(memory.played(key))return;
    const show=()=>{if(memory.played(key))return;memory.mark(key);if(!reduced())play();};
    if(typeof IntersectionObserver==='undefined'){show();return;}
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){show();observer.disconnect();observers.delete(observer);}},{root:root.querySelector('.evt-diagnostic-scroll'),threshold:.15});observers.add(observer);observer.observe(card);
  }
  function chart(){root.querySelectorAll('.evt-chart-card:not([data-observed])').forEach(card=>{card.dataset.observed='true';observeOnce(card,'chartPlayed',()=>card.classList.add('evt-chart-enter'));});}
  function recovery(){root.querySelectorAll('.evt-recovery:not([data-observed])').forEach(card=>{
    card.dataset.observed='true';observeOnce(card,'recoveryPlayed',()=>{
      ['halo','ring','ambient'].forEach(name=>{const layer=document.createElement('div');layer.className='evt-data-'+name;layer.setAttribute('aria-hidden','true');if(name==='halo')layer.append(document.createElement('i'));card.prepend(layer);});
      card.classList.add('evt-data-enter');
    });
  });}
  // 以内容行/完整卡片为入场单元，背景与文字共同出现，避免空框先行。
  function reveal(container=root){
    lines([...container.querySelectorAll('.evt-step-header,.evt-step-body>p,.evt-step-body>div>p,.evt-step-body>div>.evt-card,.nic-manual-copy,.evt-review-actions,.evt-user-message,.evt-response-heading,.evt-response>p,.evt-chart-card,.evt-close-row')]);
  }
  function enter(mode){stop();reveal();if(mode==='live'){const current=root.querySelector('.evt-step:last-child .evt-step-body');current?.querySelectorAll('.evt-line-enter').forEach(n=>n.classList.remove('evt-line-enter'));stream(current);}chart();recovery();}

  return {stop,enter,stream,chart,recovery,reveal,typeResponse};
};

/* Evidence entries use only facts already revealed in the demonstration. */
window.HCOpticalEvidence = (() => {
 const rules = [
  [/识别.*(?:崩溃|告警)|异常退出/, '告警与事件记录', '事件监测'],
  [/完成资源故障分析|网卡驱动版本过低.*操作系统/, '资源故障分析依据', '资源诊断'],
  [/通道4.*(?:低功率|−12.9)|光链路状态分析/, '光功率与错误计数记录', '链路监测'],
  [/30条告警|链路闪断/, '告警聚合记录', '告警关联分析'],
  [/完成预案生成|生成.*升级方案|V11.8.*V13.1.*检查/, '处置方案', '方案生成'],
  [/节点切换预案|执行节点切换/, '节点切换方案', '调度策略'],
  [/实例迁移完成|已迁移至其他节点/, '实例迁移记录', '实例调度'],
  [/推理业务已恢复|业务劣化恢复/, '业务恢复核验', '业务指标监测'],
  [/已完成.*优雅隔离/, '链路隔离执行记录', '链路处置'],
  [/清污后恢复正常|恢复核验/, '链路恢复核验记录', '链路监测'],
  [/隔离已解除/, '隔离解除记录', '链路处置'],
  [/已人工确认执行/, '人工确认记录', '处置流程'],
  [/网卡驱动已升级至/, '驱动升级执行记录', '驱动升级'],
  [/节点健康检查通过/, '节点健康检查结果', '节点健康检查'],
  [/已重新加入资源池/, '资源池接入记录', '资源池管理'],
  [/最低 0.1 次/, '业务负载观测记录', '负载监测'],
  [/深度节能.*性能优先/, '节能策略对比', '节能策略分析'],
  [/均衡模式满足业务性能约束/, '节能策略配置', '策略决策'],
  [/已向目标服务器下发/, '策略下发记录', '策略执行']
 ];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const workspaces=new WeakMap();
 function open(item,title,text,origin){
  const module=origin.closest('.hc-event-module')||origin.closest('.hc-energy-module')||origin.closest('section');
  const right=module?.querySelector('.evt-right,.hc-energy-right');if(!right)return;
  let state=workspaces.get(right);
  if(!state||!state.bar.isConnected){
   const toolbar=right.querySelector('.evt-detail-toolbar');
   const bar=document.createElement('div');bar.className='evt-evidence-tabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','诊断与依据');
   const home=document.createElement('button');home.type='button';home.textContent=toolbar?'诊断详情':'运行详情';home.setAttribute('role','tab');bar.append(home);
   const panel=document.createElement('section');panel.className='evt-evidence-panel';panel.setAttribute('role','tabpanel');panel.hidden=true;
   state={bar,home,panel,entries:new Map()};workspaces.set(right,state);
   const select=key=>{right.classList.toggle('evt-show-evidence',!!key);panel.hidden=!key;home.setAttribute('aria-selected',String(!key));state.entries.forEach((entry,k)=>entry.button.setAttribute('aria-selected',String(k===key)));if(key){panel.innerHTML=state.entries.get(key).html;panel.setAttribute('aria-label',state.entries.get(key).label);}};
   state.select=select;home.onclick=()=>select(null);
   if(toolbar){toolbar.classList.add('evt-has-evidence-tabs');toolbar.insertBefore(bar,toolbar.firstChild);}else right.prepend(bar);right.append(panel);select(null);
  }
  const key=title+'|'+item[1];
  const html=`<small>处理依据 · 演示数据</small><h2>${esc(item[1])}</h2><dl><dt>所属环节</dt><dd>${esc(title)}</dd><dt>来源能力</dt><dd>${esc(item[2])}（演示名称）</dd><dt>数据来源</dt><dd>当前子步骤的处理记录</dd></dl><h3>相关处理记录</h3><pre>${esc(text)}</pre><footer>本页为演示依据，未连接真实工具服务，不包含原始日志或真实调用编号</footer>`;
  if(!state.entries.has(key)){
   const group=document.createElement('span');group.className='evt-evidence-tab-group';const button=document.createElement('button');button.type='button';button.textContent=item[1];button.setAttribute('role','tab');button.onclick=()=>state.select(key);
   const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','关闭'+item[1]);close.onclick=()=>{const selected=button.getAttribute('aria-selected')==='true';state.entries.delete(key);group.remove();if(selected)state.select(null);if(!state.entries.size){state.select(null);state.bar.remove();state.panel.remove();right.querySelector('.evt-detail-toolbar')?.classList.remove('evt-has-evidence-tabs');workspaces.delete(right);}};group.append(button,close);state.bar.append(group);state.entries.set(key,{button,html,label:item[1]});
  }else state.entries.get(key).html=html;
  state.select(key);
 }
 const operationExpansion=new Map();
 function attach(host,title,enabled=true,local=false,entries=null){
  if(!enabled)return;
  const text=host.innerText||host.textContent;
  const matched=rules.filter(r=>r[0].test(text));if(!matched.length&&!entries?.length)return;
  const operations=entries?entries.map(entry=>({...entry})):[];
  const add=(verb,label,tool,kind='file')=>operations.push({verb,label,tool,kind});
  if(!entries&&/故障分析/.test(title)&&!local){
   if(/BMC/.test(text))add('分析','BMC 日志','BMC 日志分析');
   if(/OS 日志/.test(text))add('分析','OS 日志','OS 日志分析');
   if(/vmcore/.test(text))add('解析','vmcore','vmcore 解析');
   if(/驱动版本/.test(text))add('核对','网卡驱动版本','版本查询','search');
   if(/通道|光功率/.test(text))add('核对','光功率与错误计数','链路监测','search');
   if(/因果链/.test(text))add('关联','故障与业务影响','事件关联分析','search');
  }
  if(!operations.length)matched.forEach(item=>{
   const verb=/方案|配置/.test(item[1])?'生成':/核验|检查/.test(item[1])?'核验':/执行|接入|解除|确认|下发|迁移/.test(item[1])?'记录':'读取';
   add(verb,item[1],item[2],verb==='记录'?'run':verb==='核验'?'search':'file');
  });
  const details=document.createElement('details');details.className='evt-diagnostic-operations';
  const key=title+'|'+operations.map(x=>x.label).join('|');details.open=operationExpansion.get(key)??false;
  const glyph=kind=>{const icon=document.createElement('span');icon.className='evt-operation-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=kind==='search'?'<svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg>':kind==='run'?'<svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="14" rx="2"/><path d="m5 7 3 3-3 3m5 0h5"/></svg>':'<svg viewBox="0 0 20 20"><path d="M5 2h7l4 4v12H5zM12 2v5h4M8 10h5m-5 3h5"/></svg>';return icon;};
  const summary=document.createElement('summary');summary.append(glyph('search'));
  const caption=document.createElement('span');
  const verbs=[...new Set(operations.map(x=>x.verb))];caption.textContent=operations.length===1?'已'+operations[0].verb+operations[0].label:/故障分析/.test(title)?'已分析日志并核对故障依据':'已'+verbs.join('、')+'相关依据';summary.append(caption);
  const arrow=document.createElement('span');arrow.className='evt-operation-arrow';arrow.setAttribute('aria-hidden','true');summary.append(arrow);details.append(summary);
  const list=document.createElement('ul');list.className='evt-operation-list';
  operations.forEach(op=>{const li=document.createElement('li');li.append(glyph(op.kind),document.createTextNode('已'+op.verb+' '));const a=document.createElement('a');a.href='#';a.className='evt-evidence-link';a.textContent=op.label;a.title='来源：'+op.tool+'（演示能力） · 在诊断详情旁查看';a.setAttribute('aria-label',op.label+'，在诊断详情旁打开');a.onclick=e=>{e.preventDefault();e.stopPropagation();const rule=rules.find(r=>r[1]===op.label);const row=rule?[...host.querySelectorAll('.evt-recovery-row,.nic-upgrade-results>li')].find(n=>rule[0].test(n.textContent)):null;open([null,op.label,op.tool],title,op.text??(row?row.textContent:text),a);};li.append(a);list.append(li);});
  details.append(list);details.addEventListener('toggle',()=>{if(details.isConnected)operationExpansion.set(key,details.open);});
  let block=details;
  if(operations.length===1){block=document.createElement('div');block.className='evt-diagnostic-operations evt-operation-single';block.append(list);}
  // Keep the energy step's summary first, with operations preceding its body.
  if(host.matches('details'))host.querySelector(':scope > summary')?.after(block);else host.prepend(block);
 }
 return {attach,show:(label,stage,tool,text,origin)=>open([null,label,tool],stage,text,origin)};
})();

/* 画布引用：每个详情输入框独立保存引用上下文。 */
(() => {
 const states=new WeakMap();let popup=null;
 function quickTopic(name){
  if(/LPO|光模块/i.test(name))return '发送/接收光功率';
  if(/NPU|计算刀片/i.test(name))return '运行状态与关联链路';
  if(/Union|U[12]\./i.test(name))return '端口状态与错误计数';
  if(/L2|互联|交换/i.test(name))return '下联链路与告警';
  if(/趋势|功率|图表/.test(name))return '异常趋势分析';
  if(/处理|环节/.test(name))return '处置进度与结果';
  return '相关状态与异常';
 }
 const clearPopup=()=>{popup?.remove();popup=null;};
 function setup(form){
  if(states.has(form)){const saved=states.get(form),host=form.closest('.evt-left')?.querySelector('.evt-diagnostic-scroll');if(host&&saved.status.parentElement!==host)host.append(saved.status);return saved;}
  const input=form.querySelector('input');if(!input)return null;
  const chip=document.createElement('div');chip.className='hc-reference-chip';chip.hidden=true;
  const label=document.createElement('span'),close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','取消引用');chip.append(label,close);form.prepend(chip);
  const status=document.createElement('div');status.className='hc-reference-status';status.setAttribute('role','log');status.setAttribute('aria-label','智慧体对话');status.setAttribute('aria-live','polite');status.hidden=true;(form.closest('.evt-left')?.querySelector('.evt-diagnostic-scroll')||form).append(status);
  const state={target:null,ring:null,reference:null,input,chip,label,status,placeholder:input.placeholder};states.set(form,state);
  close.onclick=()=>{state.ring?.remove();state.target?.classList.remove('hc-reference-target');state.target=null;state.ring=null;state.reference=null;chip.hidden=true;state.quick.hidden=true;form.classList.remove('has-reference');input.placeholder=state.placeholder;delete form.dataset.reference;input.focus();};
  const submit=event=>{
   if(!input.value.trim())return;
   event.preventDefault();event.stopImmediatePropagation();
   const question=input.value.trim();const detail={question,reference:state.reference?{...state.reference}:null};
   form.dispatchEvent(new CustomEvent('hc-reference-question',{bubbles:true,detail}));
   state.lastQuestion=detail;form.dataset.lastReferenceQuestion=JSON.stringify(detail);
   const message=(role,text)=>{const row=document.createElement('div');row.className='hc-chat-message '+role;row.setAttribute('aria-label',role==='user'?'用户消息':'智慧体回复');const content=document.createElement('p');content.textContent=text;row.append(content);status.append(row);status.hidden=false;status.parentElement.scrollTop=status.parentElement.scrollHeight;return content;};
   const name=detail.reference?.name;
   message('user',(name?'引用“'+name+'”\n':'')+question);
   const reply=message('assistant','正在整理相关信息…');
   const module=form.closest('.hc-event-module');
   const cleaned=module?.dataset.phase==='reviewed'||module?.dataset.phase==='closed';
   let answer;
   if(/光功率|发送|接收/.test(question)){
    const object=name?'“'+name+'”的关联光链路':'当前光链路';
    answer=cleaned?object+'清污后的监控显示：通道4接收光功率已恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。当前演示未提供发送光功率读数，可结合下方趋势图查看接收侧变化':object+'当前监控显示：通道4接收光功率约为−12.9 dBm，低于图中的−3.2 dBm参考线；通道1～3保持正常。建议先完成光模块清污，再观察接收功率与错误计数。当前演示未提供发送光功率读数';
   }else if(name){
    answer='我会围绕“'+name+'”分析'+(cleaned?'本次光链路已完成清污和恢复核验，可以继续查看关联链路的光功率趋势与错误计数':'当前故障链路已完成优雅隔离，光模块仍待人工清污。建议先查看该对象的上下游连接，再结合接收光功率和错误计数判断影响')+'你也可以通过上方快捷查询继续了解该对象';
   }else answer=cleaned?'当前光链路清污已完成，恢复核验通过。你可以右键引用具体模块，继续询问它的关联链路或光功率趋势':'当前异常光链路已隔离，清污待办尚未完成。建议先完成现场清污，再确认恢复结果。你可以右键引用具体模块，我会围绕该对象继续说明';
   setTimeout(()=>{if(!form.isConnected)return;reply.textContent=answer;status.parentElement.scrollTop=status.parentElement.scrollHeight;},650);
   input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
  };
  form.addEventListener('submit',submit,true);
  form.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing&&input.value.trim())submit(event);},true);
  const quick=document.createElement('div');quick.className='hc-quick-query';quick.hidden=true;state.quick=quick;
  const quickLabel=document.createElement('span');quickLabel.textContent='快捷查询';
  const power=document.createElement('button');power.type='button';power.textContent='';state.quickButton=power;
  power.onclick=()=>{if(!state.reference)return;input.value='查询'+power.textContent;input.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit();};
  quick.append(quickLabel,power);form.prepend(quick);
  return state;
 }
 // 详情页按需挂载，未引用时可以直接提问，快捷查询仅随引用显示。
 const initialize=()=>document.querySelectorAll('#optical-event-root .hc-event-module .hc-composer').forEach(setup);
 new MutationObserver(records=>{if(records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(node.matches?.('.hc-composer')||node.querySelector?.('.hc-composer')))))initialize();}).observe(document.getElementById('optical-event-root')||document.getElementById('screen'),{childList:true,subtree:true});initialize();
 document.addEventListener('contextmenu',event=>{
  if(event.target.closest('.optical-reference-popup,.hc-composer'))return;
  clearPopup();
  const canvas=event.target.closest('#optical-event-root .evt-right');if(!canvas)return;
  const target=event.target.closest('.evt-topo-node,.evt-chart-card,.evt-evidence-panel,.evt-process-card,.evt-topo-group');
  if(!target||!canvas.contains(target)||event.target.closest('.evt-evidence-tabs,button,a,input'))return;
  const module=canvas.closest('.hc-event-module');const form=module?.querySelector('.hc-composer');if(!form)return;
  const state=setup(form);if(!state)return;event.preventDefault();
  const name=(target.dataset.hcHint||target.getAttribute('title')||target.querySelector('.evt-node-label,h2,h3,.evt-process-title')?.textContent||target.getAttribute('aria-label')||target.textContent).trim().replace(/\s+/g,' ').slice(0,100);
  const reference={name,type:target.classList.contains('evt-topo-node')?'拓扑模块':'画布内容',content:target.textContent.trim().slice(0,2000)};
  popup=document.createElement('button');popup.type='button';popup.className='optical-reference-popup';popup.textContent='引用';popup.setAttribute('aria-label','引用“'+name+'”');
  const scale=module.getBoundingClientRect().width/module.offsetWidth||1;popup.style.fontSize=(12*scale)+'px';popup.style.padding=(7*scale)+'px '+(12*scale)+'px';
  popup.style.left=Math.max(8,Math.min(innerWidth-90,event.clientX+12))+'px';popup.style.top=Math.max(8,Math.min(innerHeight-46,event.clientY+12))+'px';
  popup.onclick=e=>{e.stopPropagation();state.ring?.remove();state.target?.classList.remove('hc-reference-target');state.target=target;target.classList.add('hc-reference-target');if(getComputedStyle(target).position==='static')target.style.position='relative';const ring=document.createElement('span');ring.className='hc-reference-outline';ring.setAttribute('aria-hidden','true');target.append(ring);state.ring=ring;state.reference=reference;state.quickButton.textContent=quickTopic(name);state.quick.hidden=false;state.label.textContent='引用“'+name+'”';state.chip.hidden=false;form.classList.add('has-reference');form.dataset.reference=JSON.stringify(reference);state.input.placeholder='针对“'+name+'”提问';clearPopup();state.input.focus();};
  document.body.append(popup);
 },true);
 document.addEventListener('click',event=>{if(!event.target.closest('.optical-reference-popup'))clearPopup();},true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')clearPopup();});
 document.addEventListener('scroll',clearPopup,true);window.addEventListener('resize',clearPopup);
})();

/* 事件详情候选组件：只管理展示，不推断或推进业务状态。 */
window.HCOpticalEventUI = (() => {
  const el = (tag, className = '', text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = (name, size = 16) => {
    const node = el('img', 'evt-icon');
    node.src = OPTICAL_ASSETS.icons[name];
    node.alt = '';
    node.width = node.height = size;
    return node;
  };
  const button = (label, className = '', onClick) => {
    const node = el('button', className, label);
    node.type = 'button';
    if (onClick) node.addEventListener('click', onClick);
    return node;
  };
  const place = (node, x, y, width, height) => {
    Object.assign(node.style, {position: 'absolute', left: `${x}px`, top: `${y}px`});
    if (width !== undefined) node.style.width = `${width}px`;
    if (height !== undefined) node.style.height = `${height}px`;
    return node;
  };
  function Badge(text, tone = 'done') {
    return el('span', `evt-badge evt-badge-${text==='已闭环'?'closed':tone}`, text);
  }
  function DiagnosticStep({title, time, badge, tone, content, evidence = null, expanded = true, onToggle, onSelect}) {
    const node = el('section', 'evt-step');
    const header = el('div', 'evt-step-header');
    const select = button('', 'evt-step-select', onSelect);
    select.setAttribute('aria-label', `查看${title}环节`);
    const processing=tone==='processing'||tone==='manual';
    const status=processing?el('i','story-step-icon working'):icon('对勾',16);status.setAttribute('aria-label',processing?'进行中':'已完成');select.append(status, el('strong', '', title));
    if (time) select.append(el('time', '', time));
    header.append(select);
    if (badge) header.append(Badge(badge, tone));
    const toggle = button('', 'evt-collapse', () => onToggle?.(!expanded));
    toggle.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${title}`);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.append(el('i', 'evt-chevron'));
    header.append(toggle);
    const body = el('div', 'evt-step-body');
    body.append(content);
    window.HCOpticalEvidence?.attach(body,title,badge!=='待处理' && tone!=='processing',false,evidence);
    body.hidden = !expanded;
    node.append(header, body);
    return node;
  }
  function CauseChain(items) {
    const card = el('div', 'evt-card evt-cause');
    card.append(el('h3', '', '故障因果链'));
    const list = el('ol', 'evt-cause-list');
    for (const item of items) {
      const row = el('li', item.root ? 'evt-root-cause' : '');
      row.append(icon(item.icon, 14));
      const content = el('div');
      const title = el('div', 'evt-cause-title', item.title);
      if (item.root) title.append(Badge('根因', 'manual'));
      content.append(title, el('p', '', item.description));
      row.append(content);
      list.append(row);
    }
    card.append(list);
    return card;
  }
  function MetricComparison({label, before, after, unit, changeLabel,direction='up'}) {
    const row = el('div', 'evt-metric-compare');
    if(label==='带宽' && direction==='down')row.classList.add('evt-metric-degraded');
    for (const [index, value] of [before, after].entries()) {
      if (index) {
        const arrow=icon('箭头',20);arrow.classList.add('evt-metric-arrow');
        arrow.width=19.671875;arrow.height=12.992676;row.append(arrow);
      }
      const col = el('div');
      col.append(el('small', '', `${index ? '当前' : '隔离前'}${label} ${unit}`));
      const values=el('div','evt-metric-values');
      values.append(el('b', index ? 'evt-after' : 'evt-before', value));
      if(index && changeLabel){
        const growth=el('span','evt-metric-growth');
        const arrow=icon('箭头2',8);arrow.width=7.464844;arrow.height=8.914551;if(direction==='down')arrow.style.transform='rotate(180deg)';arrow.alt=direction==='down'?'下降':'上升';
        growth.append(arrow,el('span','',changeLabel));values.append(growth);
      }
      col.append(values);
      row.append(col);
    }
    return row;
  }
  function TopologyNode({label, subtitle, count, number, kind = 'device', x, y, width, height}) {
    const node = el('div', `evt-topo-node evt-node-${kind}`);
    node.dataset.node = label;
    node.append(el('span', 'evt-node-label', label));
    if (number) node.append(el('small', 'evt-node-number', number));
    if (subtitle) {
      const line = el('span', 'evt-node-subtitle', subtitle);
      line.append(el('b', '', count));
      node.append(line);
    }
    place(node, x, y, width, height);
    return node;
  }
  function ProcessTimeline({steps, current, onSelect}) {
    const node = el('section', 'evt-process');
    node.setAttribute('aria-label', '处理环节时间轴');
    node.append(el('h2', '', '处理环节'));
    const list = el('div', `evt-process-list${steps.length > 6 ? ' evt-process-extended' : ''}`);
    list.setAttribute('role', 'tablist');
    const widths = [132, 165, 132, 120, 156, 192];
    const offsets = [16, 223, 462, 669, 852, 1083];
    steps.forEach((step, i) => {
      const item = el('div', 'evt-process-item');
      if (steps.length <= 6) {
        item.style.left = steps.length===5 ? `calc(${i*25}% + ${82*(1-i/4)-78*i/4-widths[i]/2}px)` : `${offsets[i]}px`;
        item.style.width = `${widths[i]}px`;
      }
      const card = button('', `evt-process-card${step.manual ? ' evt-pending' : ''}`, () => onSelect(i));
      card.setAttribute('role', 'tab');
      card.setAttribute('aria-selected', String(current === i));
      card.setAttribute('aria-label', step.description.replace(/\n/g, ''));
      if(step.iconName==='红色小手'&&!step.manual)card.classList.add('manual-completed');
      card.append(icon(step.iconName || (step.manual ? '红色小手' : '故障诊断-圆-原稿绿色'), 32));
      const text = el('span');
      const title = el('span', 'evt-process-title', step.title);
      if (step.manual) title.append(el('em', '', '待处理'));
      text.append(title, el('span', 'evt-process-description', step.description));
      card.append(text);
      const tick = el('div', `evt-process-tick${current === i ? ' evt-current' : ''}`);
      tick.append(el('span', '', step.time));
      item.append(card, tick);
      list.append(item);
    });
    node.append(list);
    return node;
  }
  return {el, icon, button, place, Badge, DiagnosticStep, CauseChain, MetricComparison, TopologyNode, ProcessTimeline};
})();

/* 光链路业务模块。initialState 为本模块 exportState() 的输出。 */
window.HCEventModule = (() => {
  const EVENT_ID = 'optical-link-contamination';
  const U = HCOpticalEventUI;
  const initial = () => ({version: 1, chartPlayed:false, recoveryPlayed:false, phase: 'manual', view: 5, expanded: [true, true, true, true], draft: '', scrollTop: 0, completionEmitted: false, finishAt: 0, closingStep: 7});
  const baseSteps = [
    {title: '事件感知', description: '链路闪断告警', time: '2026-09-09 12:00:00'},
    {title: '故障诊断', description: '30条告警聚合\n生成链路闪断 issue', time: '12:00:05'},
    {title: '故障诊断', description: '定位链路脏污', time: '12:00:18'},
    {title: '方案决策', description: '生成预案', time: '12:00:28'},
    {title: '故障恢复', description: '优雅隔离异常链路', time: '12:00:40'},
    {title: '故障恢复', description: '持续监控光链路状态', time: '12:00:40', manual: true}
  ];
  function normalize(input) {
    const state = initial();
    if (!input || input.version !== 1) return state;
    if (['manual', 'reviewed', 'closing', 'closed'].includes(input.phase)) state.phase = input.phase;
    state.finishAt = Number.isFinite(input.finishAt) ? input.finishAt : 0;
    state.closingStep = input.closingStep === 8 ? 8 : 7;
    if(state.phase==='closing' && state.finishAt<=Date.now())state.phase='closed';
    state.chartPlayed=Boolean(input.chartPlayed);state.recoveryPlayed=Boolean(input.recoveryPlayed);
    const maxView = state.phase === 'closed' ? 8 : state.phase === 'closing' ? state.closingStep-1 : state.phase === 'reviewed' ? 6 : 5;
    state.view = Number.isInteger(input.view) ? Math.min(maxView, Math.max(0, input.view)) : maxView;
    if(input.phase==='closing'&&state.phase==='closed')state.view=8;
    if (Array.isArray(input.expanded) && input.expanded.length === 4) state.expanded = input.expanded.map(Boolean);
    state.draft = typeof input.draft === 'string' ? input.draft : '';
    state.scrollTop = Number.isFinite(input.scrollTop) ? Math.max(0, input.scrollTop) : 0;
    state.completionEmitted = ['closing','closed'].includes(state.phase) || Boolean(input.completionEmitted);
    return state;
  }
  function TrendChart(cleanedAt=null, recovery=false, monitorStartedAt=Date.now()) {
    const card = U.el('div', 'evt-chart-card');
    card.append(U.el('h3', 'evt-chart-title', '光链路通道功率与错误计数趋势'));
    const channels = [
      {name: '通道1', color: '#79c530', values: [-.4,-.5,-.4,-.6,-.5,-.4,-.5,-.4,-.4,-.5,-.4,-.5]},
      {name: '通道2', color: '#7955ff', values: [-.7,-.6,-.8,-.7,-.6,-.7,-.6,-.5,-.6,-.5,-.7,-.6]},
      {name: '通道3', color: '#26bbca', values: [-.2,-.3,-.2,-.4,-.3,-.2,-.3,-.2,-.3,-.2,-.3,-.2]},
      {name: '通道4', color: '#ffa33e', values: [-12.9,-13.2,-12.8,-13.4,-12.7,-13.1,-12.5,-12.9]}
    ];
    const errors = [72,65,78,68,84,76,91,63];
    const x = i => 47 + i * 324 / 7;
    // 独立坐标轴保持采样位置一致，供跨图悬浮联动。
    const y = value => 42 - value / 15 * 130;
    const errorY = value => 330 - value / 120 * 100;
    const barPath = (i,v) => {const left=x(i)-5,base=330,top=errorY(v);return `M${left} ${base}V${top+4}Q${left} ${top} ${left+4} ${top}H${left+7}Q${left+11} ${top} ${left+11} ${top+4}V${base}Z`;};
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 420 370');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '上下共用时间轴：上图为四通道光功率，下图为错误次数');
    // SVG 仅插入本地固定数据，不接受用户输入。
    svg.innerHTML = '<text x="4" y="21" fill="#ddd" font-size="13">光功率（dBm）</text>' +
      [0,-5,-10,-15].map(v => `<line x1="38" y1="${y(v)}" x2="380" y2="${y(v)}" stroke="#494949"/><text x="29" y="${y(v)+4}" text-anchor="end" fill="#aaa" font-size="11">${v}</text>`).join('') +
      channels.map(c => `<polyline class="evt-chart-line" pathLength="1" fill="none" stroke="${c.color}" stroke-width="2" stroke-linejoin="round" points="${c.values.slice(0,8).map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"><title>${c.name}</title></polyline>`).join('') +
      `<line class="evt-power-threshold" x1="38" y1="${y(-3.2)}" x2="380" y2="${y(-3.2)}" stroke="#e7434a" stroke-width="1.2" stroke-dasharray="5 4"/><text class="evt-power-threshold-label" x="378" y="${y(-3.2)-5}" text-anchor="end" fill="#ef858a" font-size="11">低功率阈值 −3.2</text>` +
      channels.map((c,i)=>`<circle cx="${66+i*85}" cy="190" r="3" fill="${c.color}"/><text x="${74+i*85}" y="194" fill="#bbb" font-size="11">${c.name}</text>`).join('') +
      '<text x="4" y="217" fill="#ddd" font-size="13">错误次数（次）</text>' +
      [120,80,40,0].map(v => `<line x1="38" y1="${errorY(v)}" x2="380" y2="${errorY(v)}" stroke="#494949"/><text x="29" y="${errorY(v)+4}" text-anchor="end" fill="#aaa" font-size="11">${v}</text>`).join('') +
      errors.map((v,i) => `<path class="evt-chart-bar" style="--evt-bar-index:${i}" d="${barPath(i,v)}" fill="#087bd8"><title>采样${i+1}：错误计数 ${v} 次</title></path>`).join('') +
      Array.from({length:8},(_,i) => `<line x1="${x(i)}" y1="330" x2="${x(i)}" y2="335" stroke="#aaa"/><text class="evt-chart-time" x="${x(i)}" y="352" font-size="9" text-anchor="middle" fill="#aaa"></text>`).join('');
    // 按数值着色：门限以下的线段为红色，正常区间保留通道色。
    const gradientPrefix='power-'+Math.random().toString(36).slice(2);
    svg.insertAdjacentHTML('afterbegin',`<defs>${channels.map((channel,i)=>`<linearGradient id="${gradientPrefix}-${i}" gradientUnits="userSpaceOnUse" x1="0" y1="42" x2="0" y2="172"><stop offset="${3.2/15}" stop-color="${channel.color}"/><stop offset="${3.2/15}" stop-color="#f0525b"/></linearGradient>`).join('')}</defs>`);
    svg.querySelectorAll('.evt-chart-line').forEach((line,i)=>line.setAttribute('stroke',`url(#${gradientPrefix}-${i})`));
    const stack=U.el('div','evt-chart-stack');
    const powerSvg=svg;
    const errorSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    const markup=svg.innerHTML;
    const split=markup.indexOf('<text x="4" y="217"');
    powerSvg.innerHTML=markup.slice(0,split);
    // 图例下移，为光功率图自己的时间轴留出空间。
    powerSvg.querySelectorAll('circle').forEach(n=>n.setAttribute('cy','218'));
    powerSvg.querySelectorAll('text[y="194"]').forEach(n=>n.setAttribute('y','222'));
    powerSvg.insertAdjacentHTML('beforeend',Array.from({length:8},(_,i)=>`<text class="evt-chart-time" x="${x(i)}" y="195" font-size="9" text-anchor="middle" fill="#aaa"></text>`).join(''));
    powerSvg.setAttribute('viewBox','0 0 420 238');
    errorSvg.setAttribute('viewBox','0 200 420 170');
    errorSvg.setAttribute('role','img');
    errorSvg.setAttribute('aria-label','错误次数趋势，独立时间轴');
    errorSvg.innerHTML=markup.slice(split);
    const powerPanel=U.el('div','evt-chart-panel');
    const errorPanel=U.el('div','evt-chart-panel');
    powerPanel.append(powerSvg);errorPanel.append(errorSvg);stack.append(powerPanel,errorPanel);
    const guide=U.el('div','evt-chart-guide');guide.hidden=true;
    const powerTip=U.el('div','evt-chart-tooltip');const errorTip=U.el('div','evt-chart-tooltip');
    powerTip.hidden=true;errorTip.hidden=true;
    powerPanel.append(powerTip);errorPanel.append(errorTip);stack.append(guide);card.append(stack);
    let hoverIndex=null;
    const showSample=index=>{
      const time=powerSvg.querySelectorAll('.evt-chart-time')[index].textContent;
      const values=Array.from(powerSvg.querySelectorAll('.evt-chart-line'),line=>{
        const py=Number(line.getAttribute('points').split(' ')[index].split(',')[1]);
        return ((42-py)*15/130).toFixed(2);
      });
      powerTip.textContent=time+'\n'+channels.map((channel,i)=>channel.name+'：'+values[i]+' dBm').join('\n');
      errorTip.textContent=errorSvg.querySelectorAll('.evt-chart-bar title')[index].textContent;
      const bounds=stack.getBoundingClientRect(),plot=powerSvg.getBoundingClientRect();
      guide.style.left=((plot.left-bounds.left+plot.width*x(index)/420)/bounds.width*100)+'%';
      guide.hidden=powerTip.hidden=errorTip.hidden=false;
      powerTip.style.right=errorTip.style.right=index>3?'auto':'8px';
      powerTip.style.left=errorTip.style.left=index>3?'8px':'auto';
    };
    stack.addEventListener('pointermove',event=>{
      const bounds=powerSvg.getBoundingClientRect();
      hoverIndex=Math.max(0,Math.min(7,Math.round(((event.clientX-bounds.left)/bounds.width*420-47)*7/324)));
      showSample(hoverIndex);
    });
    stack.addEventListener('pointerleave',()=>{hoverIndex=null;guide.hidden=powerTip.hidden=errorTip.hidden=true;});
    const timeLabel=seconds=>[Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
    card.setRecoveryTime=value=>{cleanedAt=value;};
    card.update=elapsed=>{
      if(cleanedAt!==null)elapsed=Math.min(elapsed,cleanedAt+4);
      card.dataset.channel4Normal=String(cleanedAt!==null&&elapsed>=cleanedAt);
      const interval=recovery?300:1;
      const end=recovery?12*3600+40+2100+Math.floor(Math.max(0,Date.now()-monitorStartedAt)/300000)*300:12*3600+elapsed;
      stack.querySelectorAll('.evt-chart-time').forEach((n,i)=>n.textContent=timeLabel(end-(7-i%8)*interval));
      svg.setAttribute('aria-label',`四通道光功率及错误计数趋势：${cleanedAt===null?'尚未清污':'清污已完成'}，${recovery?'每5分钟采样，最近35分钟':'最近7秒'}监控数据截至${timeLabel(end)}`);
      svg.querySelectorAll('.evt-chart-line').forEach((n,c)=>n.setAttribute('points',Array.from({length:8},(_,i)=>{const t=elapsed+i;const recovered=cleanedAt!==null&&elapsed-7+i>=cleanedAt;const base=c===3?(recovered?-.55:-12.9):[-.45,-.7,-.25][c];const v=base+Math.sin(t*1.2+c)* (c===3&&!recovered?.35:.1);return `${x(i)},${y(v)}`}).join(' ')));
      errorSvg.querySelectorAll('.evt-chart-bar').forEach((n,i)=>{const v=cleanedAt!==null&&elapsed-7+i>=cleanedAt?0:Math.round(76+Math.sin((elapsed+i)*1.4)*12);n.setAttribute('d',v?barPath(i,v):'');n.querySelector('title').textContent=`${timeLabel(end-(7-i%8)*interval)}：错误计数 ${v} 次`;});
      if(hoverIndex!==null)showSample(hoverIndex);
    };

    return card;
  }
  function IsolationAnimation(){
    const figure=U.el('figure','evt-isolation-animation');
    figure.innerHTML="<div class=\"motion-scene\"><canvas role=\"img\" aria-label=\"L2单口连接L1的LPO01至08；异常支路闪断后流量转移，随后隔离。\"></canvas><span class=\"motion-device-label label-l2\">灵衢L2-01</span><span class=\"motion-device-label label-l1\">计算柜11 · L1交换板02</span></div><div class=\"motion-legend\"><span><b class=\"cyan-dot\">●</b> 健康通道原有流量</span><span><b class=\"yellow-dot\">●</b> 原 LPO 01 支路流量</span></div><div class=\"motion-footer\"><span class=\"detail\" aria-live=\"polite\"></span></div>";
figure.prepend(figure.querySelector('.motion-footer'));
const root=figure,canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),detail=root.querySelector('.detail');
let elapsed=0,last=0,previousPhase=-1;
const W=620,H=450;
const p=(x,y,z=0)=>({x:305+x*.79-y*.61,y:45+x*.32+y*.52-z});
function poly(points,fill,stroke,width=1){ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function line(points,color,width=1){ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function face(x,y,w,d,z,color,edge){poly([p(x,y,z),p(x+w,y,z),p(x+w,y+d,z),p(x,y+d,z)],color,edge)}
function text(s,x,y,z,size,color){const q=p(x,y,z);ctx.fillStyle=color;ctx.font=`500 ${size}px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif`;ctx.fillText(s,q.x,q.y)}
function box(x,y,w,d,h,top,front,side){poly([p(x,y+d,0),p(x+w,y+d,0),p(x+w,y+d,h),p(x,y+d,h)],front,'#53616c',.7);poly([p(x+w,y,0),p(x+w,y+d,0),p(x+w,y+d,h),p(x+w,y,h)],side,'#44535e',.7);face(x,y,w,d,h,top,'#7d8d9960')}
const l2OutletX=165;
const ports=Array.from({length:8},(_,i)=>38+i*39);
function device(y,l1){const h=24;ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=10;ctx.shadowOffsetY=6;face(-15,y-8,360,105,0,'#080d11');ctx.restore();let grad=ctx.createLinearGradient(250,100,530,480);grad.addColorStop(0,l1?'#a4b3bf':'#3c4a56');grad.addColorStop(.55,l1?'#7c8f9d':'#25313b');grad.addColorStop(1,l1?'#445867':'#18232c');box(0,y,330,76,h,grad,l1?'#5c6d79':'#1e2831','#1b2832');
for(let k=0;k<14;k++){line([p(14+k*7,y+12,25),p(14+k*7,y+32,25)],'#09151e85',1.3)}


if(!l1){
  line([p(0,y+76,19),p(330,y+76,19)],'#a94e54',1.3);

}
(l1?ports:[l2OutletX]).forEach((x,i)=>{const py=l1?y:y+76;face(x-9,py-5,19,10,26,'#0b161c','#8cabb5');face(x-6,py-3,13,6,27,'#223d49','#87bac780');if(l1){text('LPO',x-11,y+19,28,12,'#e4eef4');text(String(i+1).padStart(2,'0'),x-7,y+38,28,13,'#e4eef4')}});

}
// A single L2 port feeds a short common trunk, then fans out to eight L1 ports.
function route(i,t){const u=Math.max(0,(t-.18)/.82),spread=u*u*(3-2*u);return p(l2OutletX+(ports[i]-l2OutletX)*spread,116+t*250,26)}
function routeLine(i,a,b,color,width){line(Array.from({length:70},(_,j)=>route(i,a+(b-a)*j/69)),color,width)}
function dot(q,color,r=1.9,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=2;ctx.fillStyle=color;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function draw(t){ctx.clearRect(0,0,W,H);let bg=ctx.createRadialGradient(420,280,20,400,300,480);bg.addColorStop(0,'#273743');bg.addColorStop(.6,'#17222c');bg.addColorStop(1,'#10161c');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
for(let k=-8;k<20;k++){line([p(k*36,0,-5),p(k*36,490,-5)],'#96b8cb06');line([p(-130,k*32,-5),p(490,k*32,-5)],'#96b8cb06')}
const phase=t<4.5?0:t<6.8?1:2;
device(40,false);
routeLine(0,0,.18,'#8bc5d340',11);routeLine(0,0,.18,'#8fd4df88',1);
ports.forEach((_,i)=>{routeLine(i,.18,1,i===0?'#92999f40':'#8bc5d322',9);routeLine(i,.18,1,i===0?'#dc697565':'#66c8d445',5);routeLine(i,.18,1,i===0?'#e07883':'#8fd4df66',1);routeLine(i,.18,.995,'#ddf6ff25',.6);
if(i===0){
// All positions increase from L2 (0) toward L1 (1). The queue never crosses the break.
if(phase<2){const queueTime=Math.min(t,4.5),alpha=phase===0?1:Math.max(0,1-(t-4.5)/1.4);for(let j=0;j<10;j++){const age=queueTime-j*.32;if(age<0)continue;const s=Math.min(.52-j*.028,age*.22);if(alpha>0)dot(route(0,s),'#f3c77c',1.9,alpha)}const q=route(0,.55);ctx.save();ctx.shadowBlur=12;ctx.shadowColor='#ff6477';line([{x:q.x-7,y:q.y-6},{x:q.x+6,y:q.y+6}],'#fd8997',2);line([{x:q.x-4,y:q.y+6},{x:q.x+4,y:q.y-6}],'#fd8997',2);ctx.restore()}
if(phase===2){routeLine(0,.22,1,'#9ca6ad50',10);routeLine(0,.22,1,'#e0808b',1);}
}else{for(let j=0;j<9;j++){const s=(t*.19+j/9+i*.025)%1;dot(route(i,s),'#9ee2ee',1.7)}}});
// One continuous journey: new traffic starts inside L2, reaches its healthy port,
// then enters that same external route. No reverse motion or teleporting queue.
if(phase>0){
// Redistribute one yellow stream across seven routes; do not multiply it sevenfold.
for(let k=0;k<40;k++){const i=1+k%7,age=t-4.5-k*.32;if(age<.8)continue;const s=(age-.8)*.19;if(s<=1)dot(route(i,s),'#f3c77c',1.8)}}
device(366,true);
// Draw the badge last so devices, tubes and particles cannot cover it.
if(phase===2){const q=route(0,.55);ctx.fillStyle='#323c44';ctx.strokeStyle='#9aa8b0';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(q.x-31,q.y-12,62,24,5);ctx.fill();ctx.stroke();ctx.fillStyle='#e4ecef';ctx.font='12px sans-serif';ctx.fillText('已隔离',q.x-18,q.y+4)}

if(phase!==previousPhase){previousPhase=phase;detail.textContent=['LPO 01 闪断，流量在断点前积压','流量转至 LPO 02–08 健康通道','LPO 01 已隔离，健康通道持续承载业务'][phase]}
}
function resize(){let width=canvas.clientWidth||canvas.getBoundingClientRect().width,dpr=Math.min(2,devicePixelRatio||1);canvas.width=width*dpr;canvas.height=width*H/W*dpr;ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0)}
const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
function frame(now){if(!figure.isConnected){observer.disconnect();return;}if(document.hidden||!figure.getClientRects().length){last=0;setTimeout(()=>requestAnimationFrame(frame),250);return;}if(last&&now-last<33){requestAnimationFrame(frame);return;}if(last)elapsed+=Math.min(now-last,100)*1.3/1000;last=now;draw(elapsed%16);requestAnimationFrame(frame)}requestAnimationFrame(frame);
return figure;
  }
  // 用一致的斜俯视投影绘制机柜、抽出刀片和板上器件，保持标签水平可读。
  function RackDetailView(onPort) {
    const scene=U.el('div','evt-rack-detail');
    let trayCoordinates=false;
    const project=(x,y,z)=>{if(trayCoordinates){x-=145;z+=150;}return [340+(x*.78+y*.48)*.82,395+(-x*.23+y*.40-z)*.82];};
    const points=vertices=>vertices.map(v=>project(...v).join(',')).join(' ');
    const box=(x,y,z,w,d,h,top='#647984',front='#344954',side='#263b46')=>{
      const a=[x,y,z+h],b=[x+w,y,z+h],cc=[x+w,y+d,z+h],dd=[x,y+d,z+h];
      return `<polygon points="${points([a,dd,[x,y+d,z],[x,y,z]])}" fill="${side}"/><polygon points="${points([a,b,cc,dd])}" fill="${top}"/><polygon points="${points([dd,cc,[x+w,y+d,z],[x,y+d,z]])}" fill="${front}"/><polygon points="${points([b,[x+w,y,z],[x+w,y+d,z],cc])}" fill="${side}"/>`;
    };
    const label=(x,y,z,text,cls='')=>{const q=project(x,y,z);return `<text x="${q[0]}" y="${q[1]}" class="${cls}">${text}</text>`;};
    let rack='';
    // 透明计算机柜：立柱、横梁及内部插槽保留可辨识的纵深。
    rack+=`<g opacity=".18">${box(80,100,-100,240,220,440,'#c4d9dd','#526872','#6a818c')}</g>`;
    for(const x of [80,310])for(const y of [100,310])rack+=box(x,y,-100,10,10,440,'#b7cbd0','#627984','#425a68');
    // 六层抽屉；从上往下第二层留空，导轨连接抽出的服务器。
    for(let i=0;i<6;i++){
      const z=-85+i*70;
      rack+=`<g opacity="${i===4?1:.32}">`;
      rack+=box(90,110,z,220,200,6,'#8ba1aa','#4a606d','#354b57');
      if(i!==4){
        rack+=box(92,115,z+6,216,194,56,'#8ca2ad','#485f6c','#354d5b');
        for(let j=0;j<6;j++)rack+=box(102+j*33,309,z+16,24,5,34,'#78909b','#233641','#536b77');
      }else{
        for(const x of [90,302])rack+=box(x,200,z,8,260,6,'#d3e0e3','#829aa4','#627b89');
        rack+=label(82,325,z+25,'02');
      }
      rack+='</g>';
    }
    let parts='';
    // 右后方密集银白板卡塔，以薄金属层和暗色间隙表达真实机箱。
    for(let i=0;i<19;i++){
      const z=-100+i*23;
      parts+=box(360,100,z,215,220,14,'#bac9cd','#82979f','#596f7b');
      parts+=box(368,106,z+14,198,202,2,'#dce5e5','#9dafb5','#80969f');
      for(let j=0;j<10;j++)parts+=box(372+j*19,316,z+3,12,3,4,'#748892','#263c49','#354b55');
    }
    parts+=label(360,85,365,'灵衢互联柜01 · L2-01');
    parts+=label(70,90,360,'计算柜11');
    parts+='<g class="evt-rack-drawer">';
    trayCoordinates=true;
    // 狭长服务器托盘从前方抽出，金属边框包围主板和散热器。
    parts+=box(235,330,45,240,290,14,'#bccbd0','#8198a2','#5c737f');
    parts+=box(245,340,59,220,270,4,'#315e54','#284c45','#203e3a');
    for(const x of [235,465])parts+=box(x,330,59,10,290,35,'#d2dfe0','#9cafb5','#69828e');
    for(let i=0;i<4;i++){
      const x=255+(i%2)*100,y=365+Math.floor(i/2)*90;
      parts+=box(x,y,63,70,65,13,'#a3b7bf','#627e8c','#425d6d');
      for(let f=0;f<9;f++)parts+=box(x+3+f*7,y+3,76,3,58,8,'#d1dee0','#8fa5af','#617d8c');
    }
    for(let i=0;i<8;i++)parts+=box(250+i*25,345,64,15,12,12,'#c6d2d1','#4b666e','#324c58');
    parts+=label(235,322,105,'NPU计算刀片01 · NPU卡 8');
    parts+=`<g class="evt-rack-board">${box(260,570,80,190,150,7,'#398a70','#25614f','#1b493f')}`;
    for(let i=0;i<4;i++)parts+=box(274+i*42,590,87,28,38,10,'#304b46','#182b29','#203832');
    for(let i=0;i<8;i++){
      const q=project(268+i*22,725,100);
      parts+=`<g class="evt-rack-port ${i===0?'evt-rack-fault-port':''}" data-port="${i}" role="button" tabindex="0" aria-label="聚焦 LPO光模块${String(i+1).padStart(2,'0')}">${box(264+i*22,675,87,18,64,23,i===0?'#e89994':'#c8d9d8',i===0?'#ae4b52':'#7c969a','#536e77')}<text x="${q[0]}" y="${q[1]+25}" class="evt-rack-port-number">${String(i+1).padStart(2,'0')}</text></g>`;
    }
    parts+='</g>'+label(260,560,115,'L1交换板02')+label(260,785,95,'LPO 01—08');
    parts+='</g>';
    trayCoordinates=false;
    const source=project(370,105,350);
    let links='';
    for(let i=0;i<8;i++){
      const target=project(128+i*22,725,260);
      links+=`<path class="evt-rack-wire ${i===0?'evt-rack-fault-wire':''}" d="M${source} C${source[0]+65} ${source[1]+70} ${target[0]+90} ${target[1]-80} ${target}"/>`;
    }
    scene.innerHTML=`<svg viewBox="0 0 1332 660" role="img" aria-label="机柜三维展开详情：互联柜L2连接抽出刀片上的L1光模块"><defs><radialGradient id="rack-floor"><stop stop-color="#303030"/><stop offset="1" stop-color="#191919" stop-opacity="0"/></radialGradient></defs><ellipse cx="610" cy="435" rx="520" ry="215" fill="url(#rack-floor)"/><g class="evt-rack-shell">${rack}</g><g class="evt-rack-extracted">${parts}${links}</g></svg>`;
    scene.querySelectorAll('[data-port]').forEach(port=>{
      const select=()=>onPort(Number(port.dataset.port));
      port.addEventListener('click',event=>{event.stopPropagation();select();});
      port.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
    });
    return scene;
  }
  function Topology(isolationOnly=false) {
    const node = U.el('section', 'evt-topology');
    node.setAttribute('aria-label', '光链路诊断拓扑');
    const crumb = U.el('div', 'evt-breadcrumb');
    ['SuperPod-1024','/','计算柜03','/','P03-N05·NPU计算刀片'].forEach(t => crumb.append(U.el('span','',t)));
    node.append(crumb);
    for (const [name, top, height, cls] of [['灵衢互联柜01',50,130,''],['本板·灵衢互联刀片03',193.8,388,' evt-board'],['NPU计算刀片',595.6,113,'']]) {
      const group = U.el('div', 'evt-topo-group'+cls);
      group.style.top = `${top}px`;
      group.style.height = `${height}px`;
      group.append(U.el('h3','',name));
      node.append(group);
    }
    for (const [name,x,y,w,h] of [['灵衢互联柜',64,72,125,125],['灵衢SFU板',81.7,349.1,97.9,163.6],['NPU板',64,596,112,112]]) {
      const replacement={"灵衢互联柜": "./assets/uploads/167-150903.png", "灵衢SFU板": "./assets/uploads/167-150904.png"};
      const art = replacement[name]?document.createElement('img'):U.icon(name,w);
      if(replacement[name]){art.src=replacement[name];art.alt=name;}
      art.className = 'evt-device-art';
      if(name==='灵衢互联柜'){
        const crop=U.el('div','evt-device-art');U.place(crop,x,72,w,108);crop.style.overflow='hidden';
        U.place(art,0,0,w,175);crop.append(art);node.append(crop);
      }else{U.place(art,x,y,w,h);node.append(art);}
    }
    for (let i=0;i<4;i++) node.append(U.TopologyNode({label:`灵衢L2-0${i+1}`,subtitle:'互联芯片',count:'2',x:258+i*260,y:96.2,width:250,height:72}));
    for (const [top,height] of [[299,84],[389.2,174.6]]) {
      const outline = U.el('div','evt-topo-outline');
      outline.style.top=`${top}px`; outline.style.height=`${height}px`; node.append(outline);
    }
    const label = (text,x,y) => node.append(U.place(U.el('span','evt-topo-label',text),x,y));
    label('光模块  3',264.1,302.5);
    label('互联Union  4',736.5,399.2);
    for (let i=0;i<32;i++) {
      const port=U.TopologyNode({label:`LPO\n${String(i+1).padStart(2,'0')}`,kind:'port',x:264.2+i*29.65+Math.floor(i/4)*10,y:323,width:27.65,height:40});
      port.title=`LPO光模块${String(i+1).padStart(2,'0')}`;
      if (!i) port.classList.add('evt-fault');
      node.append(port);
    }
    for(let g=0;g<8;g++){const pic=U.el('span','evt-pic-label',`PIC${g<4?g*2+1:(g-4)*2+2}`);U.place(pic,264.2+g*128.6,365,116.6,16);node.append(pic);}
    for(let i=0;i<4;i++) node.append(U.TopologyNode({label:`U2.${i+1}`,kind:'union',x:650+i*59.7,y:423,width:57.7,height:41}));
    for(let side=0;side<2;side++) {
      label(`下行Union·${side===0?'左':'右'}侧  8`,264.9+side*520,494.6);
      for(let i=0;i<8;i++) node.append(U.TopologyNode({label:`U1.${i*2+1+side}`,kind:'union',x:264.9+side*520+i*61.45,y:515,width:58.5,height:41}));
    }
    for(let i=0;i<8;i++){const blade=U.TopologyNode({label:`NPU计算刀片0${i+1}`,subtitle:'NPU卡',count:'8',x:258+i*130,y:638.8,width:120,height:56});blade.title=`NPU计算刀片0${i+1}`;node.append(blade);}
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','evt-links');svg.setAttribute('viewBox','0 0 1332 722');svg.setAttribute('aria-hidden','true');
    const paths=[];
    for(let i=0;i<32;i++) {
      const x1=383+Math.floor(i/8)*260,x2=278.025+i*29.65+Math.floor(i/4)*10;
      paths.push(`<path class="${i===0?'evt-fault-link':''}" d="M${x1} 168.2 C${x1} 280 ${x2} 253 ${x2} 323"/>`);
    }
    // Each U2 connects to all eight U1 nodes on its own side (32 links).
    for(let u2=0;u2<4;u2++)for(let i=0;i<8;i++) {
      const side=Math.floor(u2/2),x1=678.85+u2*59.7,x2=294.15+side*520+i*61.45;
      paths.push(`<path class="evt-npu-flow evt-union-flow" d="M${x1} 464 C${x1} 486 ${x2} 488 ${x2} 515"/>`);
    }
    for(let side=0;side<2;side++)for(let i=0;i<8;i++) {
      const x1=294.15+side*520+i*61.45,x2=318+i*130;
      paths.push(`<path class="evt-npu-flow" d="M${x1} 556 C${x1} 604 ${x2} 610 ${x2} 638.8"/>`);
    }
    // 根据参考图：每四个光模块连接同一对下行 Union，左右各八个 Union。
    const opticalDownlinks=Array.from({length:32},(_,port)=>{
      const side=Math.floor(port/16),pair=Math.floor((port%16)/4)*2;
      return [0,1].map(offset=>({port,union:side*8+pair+offset}));
    }).flat();
    opticalDownlinks.forEach(({port,union})=>{
      const side=Math.floor(union/8),slot=union%8;
      const x1=278.025+port*29.65+Math.floor(port/4)*10;
      const x2=294.15+side*520+slot*61.45;
      paths.push(`<path class="evt-npu-flow evt-optical-downlink" d="M${x1} 363 C${x1} 426 ${x2} 452 ${x2} 515"/>`);
    });
    svg.innerHTML='<defs><radialGradient id="evt-junction-glow"><stop stop-color="#b4ebd3" stop-opacity=".9"/><stop offset="1" stop-color="#67c798" stop-opacity="0"/></radialGradient></defs>'+paths.join('')+
      [0,1,2,3].map(i=>`<ellipse cx="${383+i*260}" cy="168.2" rx="9" ry="3" fill="url(#evt-junction-glow)"/>`).join('')+
      Array.from({length:8},(_,i)=>`<ellipse cx="${318+i*130}" cy="638.8" rx="9" ry="3" fill="url(#evt-junction-glow)"/>`).join('');
    node.append(svg);requestAnimationFrame(()=>{window.HCOpticalFlow?.(svg);applySelection();});
    const context=U.el('div','evt-topo-state-label');context.hidden=true;node.append(context);
    const modules=[...node.querySelectorAll('.evt-topo-node')];
    const links=[...svg.querySelectorAll(':scope > path')];
    const endpoints=[];
    for(let i=0;i<32;i++)endpoints.push([Math.floor(i/8),4+i]);
    for(let u2=0;u2<4;u2++)for(let i=0;i<8;i++)endpoints.push([36+u2,40+Math.floor(u2/2)*8+i]);
    for(let side=0;side<2;side++)for(let i=0;i<8;i++)endpoints.push([40+side*8+i,56+i]);
    opticalDownlinks.forEach(({port,union})=>endpoints.push([4+port,40+union]));
    // 外层轮廓与内层底色形成套管，中心仍保留原始细灰线。
    const faultPath=links[0];
    const sleeve=document.createElementNS('http://www.w3.org/2000/svg','g');
    sleeve.setAttribute('class','evt-isolation-sleeve');
    ['evt-sleeve-outline','evt-sleeve-inner'].forEach(name=>{
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',faultPath.getAttribute('d'));path.setAttribute('class',name);sleeve.append(path);
    });
    svg.insertBefore(sleeve,faultPath);
    // Place the status badge on the same cubic curve as the isolated link.
    const coordinates=faultPath.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
    const t=.6,u=1-t;
    const anchor=axis=>u*u*u*coordinates[axis]+3*u*u*t*coordinates[axis+2]+3*u*t*t*coordinates[axis+4]+t*t*t*coordinates[axis+6];
    node.style.setProperty('--evt-isolation-x',anchor(0)+'px');
    node.style.setProperty('--evt-isolation-y',anchor(1)+'px');
    const isolationBadge=U.el('div','evt-link-isolated-badge');
    isolationBadge.append(U.el('span','evt-link-isolated-symbol','⊘'),U.el('span','','已隔离'));
    node.append(isolationBadge);

    let selected=null;
    function applySelection(){
      node.classList.toggle('evt-has-selection',selected!==null);
      const related=new Set(selected===null?[]:[selected]);
      // 沿有向连接分别追溯上游、下游，不扩散到上游的其他分支。
      if(selected!==null){
        for(const direction of [0,1]){
          const queue=[selected],visited=new Set(queue);
          while(queue.length){const current=queue.shift();endpoints.forEach(edge=>{
            if(edge[direction]!==current)return;const next=edge[1-direction];
            related.add(next);if(!visited.has(next)){visited.add(next);queue.push(next);}
          });}
        }
      }
      modules.forEach((item,i)=>{item.classList.toggle('evt-selected',related.has(i));item.setAttribute('aria-pressed',String(i===selected));});
      sleeve.classList.toggle('evt-sleeve-muted',selected!==null&&!related.has(4));
      const activePaths=new Set();
      links.forEach((path,i)=>{const active=selected!==null&&endpoints[i].every(index=>related.has(index));path.classList.toggle('evt-selected-link',active);path.classList.toggle('evt-downlink-visible',selected!==null&&((selected>=4&&selected<36)||(selected>=40&&selected<56))&&endpoints[i].includes(selected));if(active)activePaths.add(path.getAttribute('d'));});
      svg.querySelectorAll('.hc-flow-trace').forEach(path=>path.classList.toggle('evt-selected-link',activePaths.has(path.getAttribute('d'))));
      context.classList.toggle('evt-selection-hidden',selected!==null&&selected!==4);
      isolationBadge.classList.toggle('evt-sleeve-muted',selected!==null&&!related.has(4));
    }
    node.selectModule=module=>{selected=module===null?null:modules.indexOf(module);if(selected===-1)selected=null;applySelection();};
    modules.forEach(module=>{
      module.setAttribute('role','button');module.tabIndex=0;
      module.setAttribute('aria-label','聚焦 '+(module.title||module.textContent.trim().replace(/\s+/g,' ')));
      module.addEventListener('click',event=>{event.stopPropagation();node.selectModule(module);});
      module.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();node.selectModule(module);}});
    });
    node.addEventListener('click',event=>{if(!event.target.closest('.evt-topo-node,.evt-topo-state-label,button,a'))node.selectModule(null);});
    node.addEventListener('keydown',event=>{if(event.key==='Escape')node.selectModule(null);});
    node.update = index => {
      node.dataset.view=String(index);
      const tipIndex=index===1?0:index===3?3:index===5?4:index===7?8:index;
      const labels=['链路闪断告警','30条告警聚合','光链路脏污','已生成预案','优雅隔离完成，事件已关闭','','链路恢复正常，隔离状态解除','待办已关闭','隔离状态解除'];
      const descriptions=['计算柜11-L1交换板02上发生闪断3次','聚合链路闪断及相关设备告警','L1-L2 设备光链路端面脏污','对L1-L2异常链路进行优雅隔离','计算柜11·L1交换板02光链路已完成优雅隔离','','检测到通道4光功率恢复正常，错误计数归零','光链路清污待办已关闭','链路运行正常，隔离状态已解除'];
      const title=U.el('strong','evt-tip-title');title.append(U.el('span','evt-tip-name',labels[tipIndex]));
      if(tipIndex===3){const doc=U.el('span','evt-plan-icon');doc.setAttribute('aria-hidden','true');doc.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';title.prepend(doc);}else title.prepend(U.icon(tipIndex>=4?'完成':'红色的故障',20));
      if(tipIndex===2)title.append(U.el('em','','根因'));
      context.replaceChildren(title,U.el('p','',descriptions[tipIndex]));if(index===5&&isolationOnly){const task=isolationOnly?U.button('','evt-tip-manual',()=>{window.closeOpticalEvent();window.openOpticalEvent({mode:'full'});}):U.el('div','evt-tip-manual');const badge=U.Badge('待人工处理','manual');badge.prepend(U.icon('红色小手',16));task.append(badge,U.el('span','evt-tip-task-copy','光模块端面脏污，等待人工清污'));if(isolationOnly)task.append(U.el('span','evt-tip-task-arrow','→'));context.append(task);}context.hidden=false;
    };
    const switcher=U.el('div','evt-view-switch');switcher.setAttribute('role','radiogroup');switcher.setAttribute('aria-label','拓扑视图');
    const rackView=RackDetailView(index=>{const port=modules[4+index];if(port)port.click();});
    const setMode=mode=>{
      node.dataset.dimension=mode;rackView.hidden=mode!=='3d';
      switcher.querySelectorAll('button').forEach(button=>{const active=button.dataset.mode===mode;button.setAttribute('aria-checked',String(active));button.tabIndex=active?0:-1;});
    };
    ['2D','3D'].forEach(label=>{
      const button=U.button(label,'',()=>setMode(label.toLowerCase()));button.dataset.mode=label.toLowerCase();button.setAttribute('role','radio');
      button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const mode=node.dataset.dimension==='2d'?'3d':'2d';setMode(mode);switcher.querySelector(`[data-mode="${mode}"]`).focus();}});
      switcher.append(button);
    });
    node.append(rackView,switcher);setMode('2d');
    return node;
  }
  function mount({root,eventId=EVENT_ID,initialState=null,entranceMode='complete',onClose=()=>{},onComplete=()=>{},storyStage=6,detailMode='full'}) {
    if(!root)throw new Error('缺少事件挂载节点 root');
    if(eventId!==EVENT_ID)throw new Error('此模块仅支持光链路脏污事件');
    const isolationOnly=detailMode==='isolation';
    let state=normalize(initialState), destroyed=false,liveStage=isolationOnly?6:storyStage;
    state.experienceFeedback=initialState?.experienceFeedback??null;state.experienceCorrection=initialState?.experienceCorrection??'';state.cleanedAt=initialState?.cleanedAt??null;state.phase=state.cleanedAt===null?'manual':'reviewed';state.view=state.cleanedAt===null?Math.min(state.view,5):6;state.finishAt=0;
    if(isolationOnly){state.view=5;state.expanded=[false,false,false,false];}
    else if(liveStage>=6){state.expanded=initialState?.expanded??[false,false,false,true];state.scrollTop=0;}
    if(liveStage<6)state.view=Math.max(0,liveStage-1);
    const monitorStartedAt=initialState?.monitorStartedAt||Date.now();
    const monitorTimer=setInterval(()=>{if(!destroyed)panel.querySelectorAll('.evt-chart-card').forEach(card=>card.update?.(HCClock.seconds()));},1000);
    const timers=new Set();
    function later(callback,delay) {const id=setTimeout(()=>{timers.delete(id);if(!destroyed)callback();},Math.max(0,delay));timers.add(id);}
    function clearTimers(){timers.forEach(clearTimeout);timers.clear();}
    const panel=U.el('section','hc-event-module hc-optical-summary');panel.dataset.detailMode=detailMode;
    let focusIndex=null;
    const entrance=HCEntrance(panel,{played:key=>state[key],mark:key=>state[key]=true});
    panel.dataset.phase=state.phase;
    const left=U.el('aside','evt-left');left.setAttribute('aria-label','光链路事件诊断过程');
    const heading=U.el('div','evt-event-heading');
    const back=U.button('','evt-back',()=>onClose({eventId}));back.setAttribute('aria-label','返回');back.append(U.icon('返回-原稿尺寸',20));
    const headingCopy=U.el('div','evt-heading-copy');
    headingCopy.append(U.el('h1','','光链路脏污，待人工清污'),U.el('time','',isolationOnly?'2026-09-09  12:00:00':'2026-09-09  12:00:40'));
    if(isolationOnly)headingCopy.querySelector('h1').append(U.Badge('已闭环','done'));const headingEventIcon=HCComponents.EventTypeIcon({closed:isolationOnly,size:36});headingEventIcon.classList.add('evt-icon');heading.append(back,headingEventIcon,headingCopy);left.append(heading);
    const intro=U.el('div','evt-diagnosis-intro');
    intro.append(U.el('p','','已经为您分析并生成故障的诊断，请查看后立即处理'));
    const expand=U.button('','evt-expand-all',()=>{const next=!state.expanded.every(Boolean);state.expanded=[next,next,next,next];renderHistory(false);});
    expand.append(U.icon('展开全部',12),U.el('span','','展开全部'));intro.append(expand);left.append(intro);
    const scroll=U.el('div','evt-diagnostic-scroll');left.append(scroll);
    const composerWrap=U.el('div','evt-composer-wrap');
    const composer=HCComponents.Composer({value:state.draft,onSend:()=>{}});
    const input=composer.querySelector('input');
    input.addEventListener('input',()=>{state.draft=input.value;});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();}});
    composerWrap.append(composer);left.append(composerWrap);
    const right=U.el('main','evt-right');
    const toolbar=U.el('div','evt-detail-toolbar');toolbar.append(U.el('span','','诊断详情'));
    const actions=U.el('div','evt-toolbar-actions');
    const fullscreen=U.button('','',()=>{});fullscreen.disabled=true;fullscreen.setAttribute('aria-label','诊断详情');
    fullscreen.append(U.icon('放大-0910',16));
    actions.append(fullscreen);toolbar.append(actions);right.append(toolbar);
    const topology=Topology(isolationOnly);right.append(topology);
    const faultPort=topology.querySelector('.evt-fault');
    topology.selectModule(faultPort);
    let experienceCard=null, experienceStartedAt=0;
    let completeCleaning=null;
    if(!isolationOnly){const clean=()=>{if(liveStage<6||state.cleanedAt!==null)return;state.cleanedAt=HCClock.seconds();experienceStartedAt=Date.now();state.phase='reviewed';state.view=6;focusIndex=null;renderHistory(true);renderTimeline();const row=scroll.querySelector('.evt-recovery-row[data-view="6"]');if(row){const copy=U.el('div','evt-cleanup-copy');copy.append(...Array.from(row.children).filter(n=>n.matches('strong,p')));row.prepend(copy);const released=scroll.querySelector('.evt-recovery-row[data-view="7"]');if(released){released.dataset.streamHidden=released.style.visibility;released.style.visibility='hidden';}entrance.stream(copy,0,()=>{if(!released||!released.isConnected)return;released.style.visibility='';delete released.dataset.streamHidden;entrance.stream(released);});}onComplete({eventId,result:'resolved'});};completeCleaning=clean;faultPort.addEventListener('click',()=>completeCleaning());}

    let timeline;const appearedViews=new Set();
    function steps() {
      const list=baseSteps.map(s=>({...s}));
      if(isolationOnly)return [...list.slice(0,5),{title:'故障恢复',description:'事件已关闭',time:'12:00:48'}].map((step,viewIndex)=>({...step,viewIndex}));
      if(liveStage<6)return list.slice(0,Math.max(1,liveStage)).map((step,i)=>({...step,title:i===0?'事件感知':i<4?'故障诊断':'故障恢复',description:window.HCStoryCopy.optical[i+1]}));
      if(state.phase!=='manual') {list[5].manual=false;list[5].iconName='红色小手';list.push({title:'故障恢复',description:'已清污、链路复核已完成',iconName:'红色小手',time:'19:19:25'},{title:'故障恢复',description:'隔离状态解除',time:'19:19:30'});}
      
      
      // Cleanup view uses its own analysis and handoff milestones.
      list[2].time='12:00:28';list[3].time='12:00:40';
      const labels={0:['事件感知','感知光链路闪断告警'],2:['故障分析','光链路通道功率与错误计数趋势'],3:['方案决策','已完成L1-L2异常链路优雅隔离，\n并生成待办事件需人工清污'],5:['故障恢复','持续监控光链路状态'],6:['故障恢复','清污已完成，链路复核已完成'],7:['故障恢复','隔离状态解除']};
      return list.map((step,viewIndex)=>({...step,viewIndex})).filter(step=>labels[step.viewIndex]).map(step=>({...step,title:labels[step.viewIndex][0],description:labels[step.viewIndex][1]}));
    }
    function renderTimeline() {
      const oldItems=new Map(Array.from(timeline?.querySelectorAll('.evt-process-item')??[]).map(item=>[item.dataset.motionKey,item.getBoundingClientRect()]));
      timeline?.remove();
      const visibleSteps=steps();timeline=U.ProcessTimeline({steps:visibleSteps,current:state.cleanedAt!==null&&focusIndex===null?-1:visibleSteps.findIndex((step,i)=>(step.viewIndex??i)===state.view),onSelect:i=>selectView(visibleSteps[i].viewIndex??i)});
      right.append(timeline);
      const scale=timeline.getBoundingClientRect().width/timeline.offsetWidth||1;
      visibleSteps.forEach((step,i)=>{
        const key=step.viewIndex??i,item=timeline.querySelectorAll('.evt-process-item')[i];
        item.dataset.motionKey=String(key);
        const old=oldItems.get(String(key)),next=item.getBoundingClientRect();
        if(old&&!HCMotion.REDUCED&&Math.abs(old.x-next.x)+Math.abs(old.width-next.width)>.5){
          item.animate([{transform:`translateX(${(old.x-next.x)/scale}px) scaleX(${old.width/next.width})`},{transform:'none'}],{duration:1100,easing:'cubic-bezier(.2,0,0,1)'});
          item.style.transformOrigin='left center';
        }
        if(!appearedViews.has(key)){
          appearedViews.add(key);
          if(!HCMotion.REDUCED)item.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:700,delay:key>=6?1100+(key-6)*1200:Math.min(i,7)*50,easing:'cubic-bezier(.2,0,0,1)',fill:'backwards'});
        }
      });topology.update(state.view);if(isolationOnly&&state.view===4){topology.querySelector('.evt-tip-name').textContent='优雅隔离已完成';}if(!isolationOnly&&state.cleanedAt===null&&[4,5].includes(state.view)){const name=topology.querySelector('.evt-tip-name');if(name){const title=topology.querySelector('.evt-tip-title');const icon=HCComponents.EventTypeIcon({size:20});const flags=U.el('span','fault-status-flags');flags.append(U.icon('红色小手',10));icon.append(flags);title.replaceChildren(icon,U.el('span','evt-tip-name','光模块脏污，待人工清污'),U.Badge('根因','manual'));topology.querySelector('.evt-topo-state-label p').textContent='计算柜11·L1交换板02光模块端面脏污，需人工清污。系统持续监控通道4光功率与错误计数';}}if(isolationOnly&&state.view===5){topology.querySelector('.evt-tip-name').textContent='事件已关闭';topology.querySelector('.evt-topo-state-label p').textContent='生成待人工处理事件';}if(state.cleanedAt!==null&&!isolationOnly){topology.querySelector('.evt-fault').style.background='#247247';topology.querySelector('.evt-fault-link').style.stroke=[4,5].includes(state.view)?'#888':'#49876c';}if(liveStage<6){const label=topology.querySelector('.evt-topo-state-label');label.hidden=false;}applyFocus();
    }
    function applyFocus(){
      const selectedStep=[0,1,1,2,3,3,3,3][focusIndex];
      scroll.querySelectorAll('.nic-event-process-body>.evt-step').forEach((node,i)=>node.classList.toggle('evt-focus-dim',focusIndex!==null&&i!==selectedStep));
      scroll.querySelectorAll('.evt-recovery-row').forEach((node,i)=>node.classList.toggle('evt-focus-dim',focusIndex!==null&&focusIndex>=4&&focusIndex!==Number(node.dataset.view)));
      scroll.querySelectorAll('.evt-conversation>.evt-user-message,.evt-conversation>.evt-response,.evt-close-row').forEach(node=>node.classList.toggle('evt-focus-dim',focusIndex!==null&&focusIndex!==6));
      scroll.querySelectorAll('.evt-followup>.evt-user-message').forEach(node=>node.classList.toggle('evt-focus-dim',focusIndex!==null&&focusIndex!==7));
      scroll.querySelectorAll('.evt-response-final>.evt-response-heading').forEach((node,i)=>{const dim=focusIndex!==null&&focusIndex!==7+i;node.classList.toggle('evt-focus-dim',dim);node.nextElementSibling?.classList.toggle('evt-focus-dim',dim);});
      timeline?.querySelectorAll('.evt-process-item').forEach((node,i)=>node.classList.toggle('evt-focus-dim',focusIndex!==null&&(steps()[i].viewIndex??i)!==focusIndex));
    }
    function selectView(index,fromPanel=false) {
      if(destroyed)return;if(!steps().some((step,i)=>(step.viewIndex??i)===index))index=steps().at(-1).viewIndex??steps().length-1;entrance.stop();state.view=index;focusIndex=index;
      const i=[0,1,1,2,3,3,3,3][index];
      if(i!==undefined&&!state.expanded[i]){state.expanded[i]=true;renderHistory();}
      renderTimeline();
      const target=index>=4?scroll.querySelector('.evt-recovery-row[data-view="'+index+'"]'):scroll.querySelectorAll('.nic-event-process-body>.evt-step')[i];
      if(!fromPanel)target?.scrollIntoView?.({block:'start',behavior:'smooth'});
      entrance.chart();entrance.recovery();
    }
    function clearFocus(event){
      if(focusIndex===null||event.target.closest('button,input,select,a,.evt-fault,.evt-card,.evt-response,.evt-user-message,.evt-step-header,.evt-step-body p'))return;
      focusIndex=null;applyFocus();
    }
    document.addEventListener('click',clearFocus);
    function recoveryTitle(text,time){const title=U.el('strong','',text);title.append(U.el('time','evt-recovery-time',time));return title;}
    function bodyText(text,className=''){return U.el('p',className,text);}
    // 与业务恢复详情共用摘要和处理过程样式，关联事件保持独立入口。
    function renderOverview() {
      const cleaned=state.cleanedAt!==null;
      const summary=U.el('section','nic-event-summary nic-summary-compact');
      summary.setAttribute('aria-label','事件摘要');
      const conclusion=liveStage<4?'光链路闪断，故障原因分析中':
        isolationOnly?'光链路脏污导致链路闪断，已完成优雅隔离':
        cleaned?'光链路清污完成，链路恢复正常':'光链路脏污，已隔离异常链路，等待人工清污';
      summary.append(U.el('div','nic-summary-heading','事件摘要'),U.el('strong','nic-summary-conclusion',conclusion));
      const facts=U.el('div','nic-summary-facts');
      const impact=liveStage<4?'正在分析链路闪断的业务影响':liveStage<6?'引起 CQE 错误、实例异常，正在处置':'异常链路已隔离，当前业务正常';
      const status=liveStage<6?'诊断与处置随处理进度更新':isolationOnly?'异常链路已完成优雅隔离，事件已闭环':cleaned?'链路恢复核验完成，隔离已解除':'等待人工清污，持续监控光链路状态';
      [['故障对象','计算柜11 · L1交换板02光链路'],['业务影响',impact],['处置状态',status]].forEach(([label,value])=>{
        const row=U.el('div','nic-summary-fact');
        row.append(U.el('span','nic-summary-caption',label),U.el('span','nic-summary-outcome',value));facts.append(row);
      });
      summary.append(facts);
      if(liveStage>=6){
        const relatedClosed=!isolationOnly||Boolean(window.HCStory?.get().optical>=9);
        const relation=U.el('section','nic-summary-relation');relation.dataset.state=relatedClosed?'closed':'manual';
        relation.append(U.el('div','nic-relation-label',isolationOnly?'关联待办':'关联事件'));
        const line=U.el('div','nic-relation-line'),title=U.el('div','nic-related-business-title');
        title.append(U.el('strong','nic-relation-name',isolationOnly?(relatedClosed?'光链路清污已完成':'光链路清污'):'光链路闪断，已完成优雅隔离'));
        const badge=U.Badge(relatedClosed?'已闭环':'待人工处理',relatedClosed?'closed':'manual');
        if(!relatedClosed)badge.prepend(U.icon('红色小手',13));title.append(badge);
        const action=U.button(relatedClosed?'查看事件':'去处理','nic-relation-action',()=>{window.closeOpticalEvent();window.openOpticalEvent({mode:isolationOnly?'full':'isolation'});});
        action.append(U.el('i','evt-jump-icon'));line.append(title,action);relation.append(line);summary.append(relation);
      }
      const group=U.el('section','nic-event-overview'),process=U.el('div','nic-event-process-body');
      group.setAttribute('aria-label','事件摘要与处理过程');
      const processHeading=U.el('div','nic-process-heading');processHeading.append(U.el('strong','','处理过程'),expand);
      process.append(processHeading);group.append(summary,process);scroll.append(group);
      return process;
    }
    const CLEANING_ART={"dirty": "./assets/uploads/dirty.png", "clean": "./assets/uploads/clean.png"};
    let cleanArtTransitionShown=false;
    function CleaningIllustration(cleaned) {
      const figure=U.el('figure','evt-cleaning-illustration');
      figure.dataset.state=cleaned?'clean':'dirty';
      const image=U.el('img');
      image.src=cleaned?CLEANING_ART.clean:CLEANING_ART.dirty;
      image.alt=cleaned?'清污完成：居中展示干净的光模块，无手套和清洁笔':'双手佩戴防静电手套，左手握持光模块外壳，右手使用MPO清洁笔对准光口清洁';
      image.width=1899;image.height=829;
      const frame=U.el('div','evt-cleaning-frame');frame.append(image);
      if(cleaned&&!cleanArtTransitionShown){
        cleanArtTransitionShown=true;
        const previous=U.el('img','evt-cleaning-previous');previous.src=CLEANING_ART.dirty;previous.alt='';previous.setAttribute('aria-hidden','true');
        frame.append(previous);
        const reveal=()=>{if(frame.classList.contains('evt-cleaning-crossfade'))return;frame.classList.add('evt-cleaning-crossfade');};
        image.addEventListener('load',reveal,{once:true});
        if(image.complete&&image.naturalWidth)reveal();
        previous.addEventListener('animationend',()=>previous.remove(),{once:true});
      }
      figure.append(frame,U.el('figcaption','',cleaned?'清污已完成':'光模块脏污，待人工清污'));
      return figure;
    }
    function ExperienceSummary(){
      const card=U.el('section','evt-experience');card.setAttribute('aria-label','智能体经验沉淀');
      card.append(U.el('p','evt-experience-intro','本次光链路故障已完成处置。我已整理处理过程，形成以下可复用经验'));
      const lessons=[
        ['识别光链路隐患','结合接收光功率与错误计数识别异常。通道4持续低功率且错误计数异常时，应关联检查光模块端面脏污，不能只依赖链路通断状态'],
        ['串联故障因果关系','将光模块脏污、接收功率劣化、链路闪断及伴随告警关联分析，结合计算侧排查结果缩小故障范围'],
        ['沉淀处置与核验流程','先优雅隔离异常链路，再由人工清污；清污后核验光功率恢复与错误计数归零，确认通过后解除隔离']
      ];
      const list=U.el('ol','evt-experience-lessons');lessons.forEach(([title,copy])=>{const item=U.el('li');item.append(U.el('strong','',title),U.el('p','',copy));list.append(item);});card.append(list);
      const reportText='故障对象：计算柜11·L1交换板02光链路。\n故障表现：链路闪断，通道4接收光功率异常，伴随错误计数异常。\n根因：光链路端面脏污。\n处置过程：异常链路优雅隔离 → 人工清污 → 恢复核验 → 解除隔离。\n核验结果：通道4光功率恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。\n\n'+lessons.map(([title,copy],i)=>(i+1)+'、'+title+'：'+copy).join('\n');
      const report=U.button('','evt-experience-report',()=>window.HCOpticalEvidence?.show('光链路清污复盘报告','经验沉淀','故障复盘',reportText,report));
      report.append(U.el('span','evt-experience-file','▤'),U.el('strong','','光链路清污复盘报告'),U.el('span','evt-experience-open','查看 ›'));card.append(report);
      const graph=U.el('div','evt-experience-graph');
      const graphTitle=U.el('div','evt-experience-graph-title');const graphDetails=U.button('查看详情','evt-knowledge-details',()=>window.HCOpticalEvidence?.show('经验图谱详情','经验沉淀','故障复盘','本次新增经验：光模块脏污。\n故障类型：业务劣化。\n识别特征：通道4接收光功率持续偏低，伴随错误计数异常。\n处置路径：优雅隔离异常链路 → 人工清污 → 监控核验 → 解除隔离。\n'+lessons.map(([title,copy])=>title+'：'+copy).join('\n'),graphDetails));graphTitle.append(U.el('strong','','经验图谱'),graphDetails);graph.append(graphTitle);
      const map=document.createElementNS('http://www.w3.org/2000/svg','svg');
      map.setAttribute('viewBox','0 0 420 250');map.setAttribute('role','img');map.setAttribute('aria-label','经验图谱：故障类型分为业务劣化和业务失败，光模块脏污为本次新增经验');map.classList.add('evt-knowledge-map');
      let dots='';
      for(let ring=0;ring<7;ring++){const count=24+ring*7,r=24+ring*7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+ring*.17;dots+='<circle cx="'+(32+Math.cos(a)*r).toFixed(2)+'" cy="'+(130+Math.sin(a)*r).toFixed(2)+'" r="'+(ring<3?1.8:1.3)+'" fill="'+(ring<3?'#a59ae9':'#79c3cd')+'" opacity="'+(.85-ring*.07)+'"/>';}}
      map.innerHTML='<g>'+dots+'</g><g fill="none" stroke="#747b82" stroke-width="1.2"><path d="M92 130H127 M173 130C203 130 204 74 236 74 M173 130C203 130 204 196 236 196 M268 74C291 74 290 38 314 38 M268 74C291 74 290 108 314 108 M268 196C291 196 291 168 314 168 M268 196C291 196 291 226 314 226"/></g><g fill="#dce0e4" font-size="13" font-family="sans-serif"><text x="122" y="134">故障类型</text><text x="219" y="70">业务劣化</text><text x="219" y="192">业务失败</text><text x="313" y="34">光模块脏污</text><text x="313" y="104">NPU掉卡</text><text x="313" y="164">实例异常</text><text x="313" y="222">通信中断</text></g><rect x="316" y="43" width="70" height="20" rx="10" fill="#355e78"/><text x="351" y="57" text-anchor="middle" font-size="11" fill="#b4e7ff">✦ 新经验</text>';
      graph.append(map);card.append(graph);
      const feedback=U.el('div','evt-experience-feedback'),message=U.el('p','','我的经验沉淀是否准确？');
      const actions=U.el('div','evt-experience-actions'),editor=U.el('div','evt-experience-editor');editor.hidden=true;
      const field=U.el('textarea');field.placeholder='请填写需要纠正的经验内容';field.setAttribute('aria-label','经验纠正内容');field.value=state.experienceCorrection;
      const update=()=>{
        const confirmed=state.experienceFeedback==='accurate';
        actions.hidden=confirmed;feedback.classList.toggle('is-accurate',confirmed);
        message.replaceChildren();message.setAttribute('role','status');
        if(confirmed){const icon=U.el('span','evt-experience-confirmed-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';message.append(icon,U.el('span','','用户反馈此次经验沉淀准确'));}
        else message.textContent=state.experienceFeedback==='corrected'?'已记录你的纠正意见，供后续复盘参考':'我的经验沉淀是否准确？';
      };
      const accurate=U.button('准确','',()=>{state.experienceFeedback='accurate';editor.hidden=true;update();});
      const correct=U.button('纠正','',()=>{editor.hidden=false;field.focus();});actions.append(accurate,correct);
      const save=U.button('保存纠正','',()=>{const value=field.value.trim();if(!value){field.focus();return;}state.experienceCorrection=value;state.experienceFeedback='corrected';editor.hidden=true;update();});
      editor.append(field,save);feedback.append(message,actions,editor);card.append(feedback);update();
      const footer=U.el('div','evt-experience-footer'),notice=U.el('span','evt-experience-notice');notice.setAttribute('role','status');
      const icons={refresh:'<path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',like:'<path d="M8 21H3V10h5m0 11h10l3-11h-7l1-6-3-2-4 8z"/>',dislike:'<path d="M8 3H3v11h5M8 3h10l3 11h-7l1 6-3 2-4-8z"/>'};
      const toolbar=U.el('div','evt-experience-tools');
      const action=(name,icon,fn)=>{const b=U.button('','',fn);b.title=name;b.setAttribute('aria-label',name);b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[icon]+'</svg>';toolbar.append(b);return b;};
      action('重新生成经验','refresh',()=>{const fresh=ExperienceSummary();experienceCard=fresh;card.replaceWith(fresh);fresh.querySelector('.evt-experience-notice').textContent='已根据本次处置记录重新整理';});
      action('复制经验','copy',async()=>{try{await navigator.clipboard.writeText(reportText);notice.textContent='已复制';}catch{const text=U.el('textarea');text.value=reportText;card.append(text);text.select();const ok=document.execCommand('copy');text.remove();notice.textContent=ok?'已复制':'复制失败，请重试';}});
      let up,down;up=action('有帮助','like',()=>{state.experienceRating='like';up.setAttribute('aria-pressed','true');down.setAttribute('aria-pressed','false');notice.textContent='感谢反馈';});
      down=action('没有帮助','dislike',()=>{state.experienceRating='dislike';down.setAttribute('aria-pressed','true');up.setAttribute('aria-pressed','false');editor.hidden=false;field.focus();});
      up.setAttribute('aria-pressed',String(state.experienceRating==='like'));down.setAttribute('aria-pressed',String(state.experienceRating==='dislike'));
      footer.append(notice,toolbar);card.append(footer);return card;
    }
    // 内容真实逐字增长，不预留完整卡片高度；不强制改变用户的滚动位置。
    function streamExperience(card){
      const intro=card.querySelector('.evt-experience-intro');
      const list=card.querySelector('.evt-experience-lessons');
      const items=Array.from(list.children);
      const tail=Array.from(card.children).filter(node=>node!==intro&&node!==list);
      const blocks=[intro,...items];
      const texts=blocks.map(block=>Array.from(block.querySelectorAll('strong,p')).length
        ?Array.from(block.querySelectorAll('strong,p')):[block]);
      const originals=new Map();texts.flat().forEach(node=>{originals.set(node,Array.from(node.textContent));node.textContent='';});
      blocks.forEach(node=>{node.hidden=true;});tail.forEach(node=>{node.hidden=true;});list.hidden=true;card.hidden=true;
      const active=()=>!destroyed&&experienceCard===card&&card.isConnected;
      const revealTail=index=>{
        if(!active())return;
        const node=tail[index];if(!node){card.removeAttribute('aria-busy');return;}
        node.hidden=false;
        if(node.animate){const height=node.offsetHeight;node.animate([{height:'0px',opacity:0,overflow:'hidden'},{height:height+'px',opacity:1,overflow:'hidden'}],{duration:360,easing:'ease-out'});}
        later(()=>revealTail(index+1),400);
      };
      const writeBlock=index=>{
        if(!active())return;
        if(index>=blocks.length){revealTail(0);return;}
        blocks[index].hidden=false;if(index>0)list.hidden=false;
        let part=0,offset=0;
        const tick=()=>{
          if(!active())return;
          const node=texts[index][part],chars=originals.get(node);
          offset=Math.min(offset+2,chars.length);node.textContent=chars.slice(0,offset).join('');
          if(offset<chars.length){later(tick,24);return;}
          if(++part<texts[index].length){offset=0;later(tick,60);}else later(()=>writeBlock(index+1),120);
        };tick();
      };
      card.setAttribute('aria-busy','true');
      later(()=>{if(!active())return;card.hidden=false;writeBlock(0);},Math.max(0,experienceStartedAt+2000-Date.now()));
    }
    function renderHistory(toBottom=false) {
      entrance.stop();
      const allOpen=state.expanded.every(Boolean);expand.querySelector('span').textContent=allOpen?'收起全部':'展开全部';expand.setAttribute('aria-expanded',String(allOpen));
      headingCopy.querySelector('h1').textContent=liveStage<4?'光链路故障分析中':liveStage<6?'光链路脏污，自动处理中':'光链路脏污，待人工清污';if(isolationOnly)headingCopy.querySelector('h1').replaceChildren(document.createTextNode('光链路闪断，已完成优雅隔离'),U.Badge('已闭环','closed'));if(!isolationOnly&&liveStage>=6){headingCopy.querySelector('h1').textContent=state.cleanedAt===null?'光链路脏污，待人工清污':'光链路已清污，隔离已解除';headingCopy.querySelector('h1').append(U.Badge(state.cleanedAt===null?'待人工处理':'已闭环',state.cleanedAt===null?'manual':'closed'));}const headingIcon=heading.querySelector(':scope > .evt-icon');if(headingIcon){const nextIcon=HCComponents.EventTypeIcon({closed:isolationOnly||state.cleanedAt!==null,size:36});nextIcon.classList.add('evt-icon');headingIcon.replaceWith(nextIcon);}const oldScroll=scroll.scrollTop;scroll.replaceChildren();
      const process=renderOverview();
      const awareness=U.el('div');awareness.append(bodyText('链路闪断告警  12:00:00-12:00:05'),bodyText('故障描述：计算柜11-L1交换板02上发生闪断3次'));
      const analysis=U.el('div');
      analysis.append(bodyText('12:00:18 完成故障分析：排除计算侧硬件故障，检测到根因为计算柜11-L1交换板02因“光链路脏污”，导致链路闪断，引起CQE错误、实例DOWN'));
      const cause=U.CauseChain([
        {title:'光模块脏污',description:'L1-L2 设备光链路端面脏污',icon:'光模块脏污',root:true},
        {title:'接收功率劣化+FEC误码率异常',description:'lane4接收光功率<-3.2dBm',icon:'吸收功率劣化'},
        {title:'L1- L2交换机链路多次闪断',description:'持续5s',icon:'链路多次闪断'},
        {title:'伴随告警30条',description:'IPv6状态切换、光模块整体失效等',icon:'告警铃铛'}
      ]);analysis.append(cause);
      if(!isolationOnly&&liveStage>=6){awareness.replaceChildren(bodyText('12:00:00 感知光链路闪断告警，后续定位为光链路脏污'));const snapshot=TrendChart();snapshot.update(28);snapshot.update=null;
      const historyEnd=12*3600+28,historyTimes=Array.from({length:8},(_,i)=>{const t=Math.round(historyEnd-(7-i)*15*60);return [Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(v=>String(v).padStart(2,'0')).join(':');});
      snapshot.querySelectorAll('.evt-chart-time').forEach((n,i)=>n.textContent=historyTimes[i%8]);
      snapshot.querySelectorAll('.evt-chart-bar title').forEach((n,i)=>n.textContent=n.textContent.replace(/^.*?：/,historyTimes[i]+'：'));
      snapshot.querySelector('svg').setAttribute('aria-label','四通道光功率及错误计数趋势：尚未清污，每15分钟采样，10:15:28至12:00:28');snapshot.querySelectorAll('svg>text[x="30"]').forEach(n=>{n.setAttribute('x','16');n.setAttribute('text-anchor','start');});snapshot.querySelectorAll('svg>text[x="411"]').forEach(n=>n.setAttribute('x','397'));snapshot.classList.add('evt-static-chart');analysis.replaceChildren(bodyText('12:00:28 完成光链路状态分析：通道4从12:00:00开始处于异常低功率状态，截至12:00:28已持续28秒，光功率约为−12.9dBm；同期通道1～3保持在0～−1dBm，错误计数持续异常'),snapshot);}
      const recovery=U.el('div');const recoveryCard=U.el('div','evt-card evt-recovery');
      const isolated=U.el('div','evt-recovery-row');isolated.dataset.view='4';isolated.append(recoveryTitle('已完成L1-L2异常链路优雅隔离','12:00:40'));
      isolated.append(IsolationAnimation());
      isolated.append(U.MetricComparison({label:'带宽',before:'3.2',after:'2.4',unit:'Tb/s',changeLabel:'25%',direction:'down'}),U.MetricComparison({label:'流量',before:'420',after:'450',unit:'Gb/s',changeLabel:'7.14%',direction:'up'}));
      const manual=U.el('div','evt-recovery-row');manual.dataset.view='5';manual.append(recoveryTitle('持续监控光链路状态','12:00:40'));
      if(state.cleanedAt===null)manual.append(bodyText('正在持续监控计算柜11-L1交换板02的光链路。1～3通道保持正常，通道4仍处于异常低功率状态，链路错误计数仍有异常，等待人工清污'));
      if(!isolationOnly&&liveStage>=6&&state.cleanedAt===null)manual.append(CleaningIllustration(false));
      const dataContent=U.el('div','evt-data-content');if(isolationOnly){dataContent.append(isolated);const closed=U.el('div','evt-recovery-row');closed.dataset.view='5';closed.append(recoveryTitle('事件已关闭','12:00:48'));const cleanupLink=U.button('生成光链路清污待办事件','evt-isolation-link evt-cleanup-event-link',()=>{window.closeOpticalEvent();window.openOpticalEvent();});cleanupLink.append(U.el('i','evt-jump-icon'));const related=U.el('div','evt-cleanup-related');related.append(U.el('span','','关联事件：'),cleanupLink);closed.append(related);dataContent.append(closed);}
      if(!isolationOnly){dataContent.append(manual);let chartParent=manual;if(state.cleanedAt!==null){const done=U.el('div','evt-recovery-row');done.dataset.view='6';done.append(recoveryTitle('链路恢复正常，核验已完成','19:19:25'),bodyText(`19:17:10，检测到计算柜11-L1交换板02的光链路清污后恢复正常：通道4光功率回升至0～−1dBm，错误计数降为0，通道1～3始终保持正常。持续观察后，于19:19:25完成链路恢复核验`));done.append(CleaningIllustration(true));dataContent.append(done);chartParent=done;}if(liveStage>=6){const chart=TrendChart(state.cleanedAt,true,monitorStartedAt);chart.update(HCClock.seconds());chartParent.append(chart);}}
      if(!isolationOnly&&state.cleanedAt!==null){const released=U.el('div','evt-recovery-row');released.dataset.view='7';released.append(recoveryTitle('隔离状态解除','19:19:30'),bodyText('光链路隔离已解除、业务链路运行正常'));dataContent.append(released);}
      recoveryCard.append(dataContent);recovery.append(recoveryCard);

      const sections=[
        {title:'事件感知',time:'12:00:00',badge:'已完成',content:awareness,view:0},
        {title:'故障分析',time:'12:00:18',badge:'已完成',content:analysis,view:2},
        {title:'方案决策',time:'12:00:28',badge:'已完成',content:bodyText(isolationOnly?'12:00:28 完成预案生成，管理员已授权给agent进行自动处置':'12:00:40 已完成L1-L2异常链路优雅隔离，并生成清污待办事件，需人工清污','evt-decision-copy'),view:3},
        {title:'故障恢复',time:!isolationOnly&&state.cleanedAt!==null?'19:19:25':'12:00:40',badge:isolationOnly||state.cleanedAt!==null?'已完成':'待人工处理',tone:isolationOnly||state.cleanedAt!==null?'done':'manual',content:recovery,view:isolationOnly?4:5}
      ];
      sections.forEach((s,i)=>{
        if(liveStage<[1,2,5,5][i])return;
        if(liveStage<6){s.badge=liveStage>=[2,4,5,6][i]?'已完成':'进行中';s.tone=s.badge==='进行中'?'processing':'done';if(i===1&&liveStage<4)s.content=bodyText(liveStage===2?'30条告警聚合，生成链路闪断 issue':'正在分析链路指标与设备日志');if(i===3)s.content=bodyText('正在优雅隔离异常链路');}
        // 每个依据只引用本环节已显示的记录，不用全文正则推断光链路证据。
        const evidence=[];
        const record=(verb,label,tool,kind,text)=>evidence.push({verb,label,tool,kind,text});
        if(i===0)record('读取','告警与事件记录','事件监测','file',awareness.textContent);
        if(i===1){
          const description=analysis.querySelector('p')?.textContent||analysis.textContent;
          if(!isolationOnly&&liveStage>=6)record('核对','光功率与错误计数记录','链路监测','search',description);
          else if(liveStage>=4){
            record('分析','链路故障分析记录','链路诊断','file',description);
            record('关联','链路故障因果链','告警关联分析','search',cause.textContent);
          }else record('读取','告警聚合记录','告警关联分析','file',s.content.textContent);
        }
        if(i===2)record('生成',isolationOnly?'链路隔离方案':'光链路清污处置方案','方案生成','file',s.content.textContent);
        if(i===3){
          s.content.querySelectorAll('.evt-recovery-row').forEach(row=>{
            const view=Number(row.dataset.view);
            const labels={4:['记录','链路隔离执行记录','链路处置','run'],5:['读取','光链路持续监控记录','链路监测','file'],6:['核验','链路恢复核验记录','链路监测','search'],7:['记录','隔离解除记录','链路处置','run']};
            const item=labels[view];if(!item)return;
            const copy=[...row.children].filter(node=>node.matches('strong,p')).map(node=>node.textContent).join('\n');
            if(copy)record(...item,copy);
          });
          if(!evidence.length)record('读取','链路处置进展','链路处置','file',s.content.textContent);
        }
        const step=U.DiagnosticStep({...s,time:null,evidence,expanded:state.expanded[i],onToggle:value=>{state.expanded[i]=value;renderHistory(false);},onSelect:()=>selectView(s.view)});
        step.querySelector('.evt-step-body')?.addEventListener('click',event=>{if(event.target.closest('button,input,select,a')||event.target===event.currentTarget)return;const row=event.target.closest('.evt-recovery-row');const index=row?Number(row.dataset.view):s.view;event.stopPropagation();selectView(index,true)});
        if(i===sections.length-1)step.classList.add('evt-step-last');
        process.append(step);
      });

      if(!isolationOnly&&state.cleanedAt!==null){const fresh=!experienceCard;if(fresh)experienceCard=ExperienceSummary();process.append(experienceCard);if(fresh&&experienceStartedAt)streamExperience(experienceCard);}
      scroll.scrollTop=toBottom?scroll.scrollHeight:oldScroll;
      panel.dataset.phase=state.phase;
      entrance.chart();entrance.recovery();applyFocus();
    }
    function resumeClosing(){clearTimers();}
    function reset() {
      if(destroyed)return;
      clearTimers();
      experienceCard=null;experienceStartedAt=0;state=initial();focusIndex=null;panel.classList.remove('evt-expanded');
      fullscreen.setAttribute('aria-pressed','false');fullscreen.setAttribute('aria-label','展开诊断详情');
      input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
      renderHistory();renderTimeline();scroll.scrollTop=0;entrance.enter(entranceMode);
    }
    function destroy() {
      if(destroyed)return;
      destroyed=true;clearInterval(monitorTimer);document.removeEventListener('click',clearFocus);entrance.stop();clearTimers();panel.remove();
    }
    function exportState() {
      state.scrollTop=scroll.scrollTop;
      state.draft=input.value;
      return JSON.parse(JSON.stringify({...state,eventId,monitorStartedAt}));
    }
    panel.append(left,right);root.append(panel);
    renderHistory();renderTimeline();scroll.scrollTop=state.scrollTop;resumeClosing();entrance.enter(liveStage<6?'live':'complete');
    function setStoryStage(value){
      if(isolationOnly||value===liveStage)return;
      const previous=new Map([...scroll.querySelectorAll('.nic-event-process-body>.evt-step')].map(node=>[node.querySelector('.evt-step-header')?.textContent.replace(/自动处理中|进行中|已完成|待人工处理/g,''),node.querySelector('.evt-step-body')?.textContent]));
      liveStage=value;
      if(value<=6&&state.phase==='manual'){
        state.view=Math.max(0,value-1);focusIndex=null;renderHistory();renderTimeline();
        scroll.querySelectorAll('.nic-event-process-body>.evt-step').forEach(node=>{
          const key=node.querySelector('.evt-step-header')?.textContent.replace(/自动处理中|进行中|已完成|待人工处理/g,'');
          const body=node.querySelector('.evt-step-body');
          if(body&&previous.get(key)!==body.textContent)entrance.stream(body);
        });
      }
      input.disabled=value<6;
    }
    input.disabled=liveStage<6;
    return {reset,destroy,exportState,setStoryStage};
  }
  return {mount};
})();

/* Delivered optical event adapter; preserve state when leaving and reopening. */
(()=>{
const screen=document.getElementById('screen'),root=document.createElement('div');root.id='optical-event-root';screen.append(root);let instance=null,savedState=null,detailMode='full';
function reference(category){if(parent!==window)parent.postMessage({type:'hc-home-category',category},location.origin==='null'?'*':location.origin)}
function close(){if(instance){if(detailMode!=='isolation')savedState=instance.exportState();instance.destroy();instance=null;}root.hidden=true;const list=document.getElementById('guard-all');reference(list&&!list.hidden?'events':screen.dataset.category||'resource')}
window.closeOpticalEvent=close;
window.resetOpticalEvent=()=>{close();savedState=null;};
window.openOpticalEvent=({mode='full'}={})=>{if(instance)return;window.closeEnergyDetail?.();window.closeNicEvent?.();detailMode=mode;root.hidden=false;instance=HCEventModule.mount({root,eventId:'optical-link-contamination',initialState:mode==='isolation'?null:savedState,detailMode:mode,entranceMode:'complete',storyStage:window.HCStory?.get().optical??6,onClose:close,onComplete:()=>{savedState=instance.exportState();window.dispatchEvent(new CustomEvent('hc-optical-complete',{detail:{eventId:'optical-link-contamination'}}));}});reference('optical')};root.hidden=true;
window.addEventListener('hc-story-change',e=>instance?.setStoryStage(e.detail.optical));
document.querySelector('#home-sidebar button[aria-label="首页"]').addEventListener('click',close);
})();

/* Unified business-impacting NIC event. Process layout follows HC Agent-终0915. */
(()=>{
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
document.querySelector('#home-sidebar button[aria-label="首页"]').addEventListener('click',close);
})();

/* Timing and transitions migrated from 2026-09-04 实验1.html: 675–722,1324–1348. */
function createHCStory({schedule=setTimeout,cancel=clearTimeout,now=Date.now}={}){
 const listeners=new Set(),timers=new Set();let state;
 const emit=()=>listeners.forEach(fn=>fn({...state}));
 const later=(fn,ms)=>{const id=schedule(()=>{timers.delete(id);fn()},ms);timers.add(id)};
 function phase(key,value){state[key]=value;if(value===9)state[key+'ClosedAt']=now();emit();}
 function reset(){timers.forEach(cancel);timers.clear();state={optical:0,energy:0,qwen:0,startedAt:now()};emit();}
 // Presentation runs at 2x; displayed business timestamps remain unchanged.
 const presentationSpeed=2;
 function start(){reset();phase('optical',1);for(let p=2;p<=6;p++)later(()=>phase('optical',p),[0,0,2000,4000,6500,9000,12000][p]);
  later(()=>phase('energy',1),6000);
  later(()=>{phase('qwen',1);for(let p=2;p<=6;p++)later(()=>phase('qwen',p),[0,0,10000,28000,36000,44000,54000][p]/presentationSpeed)},12000);
 }
 function complete(key){if(key==='qwen'&&state.qwen===6){phase('qwen',7);later(()=>phase('qwen',8),1800);later(()=>phase('qwen',9),3600);return true;}if(key!=='optical'||state[key]!==6)return false;phase(key,7);later(()=>phase(key,8),520);later(()=>phase(key,9),1040);return true;}
 reset();return {start,reset,complete,get:()=>({...state}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}};
}
if(typeof module!=='undefined')module.exports={createHCStory};

/* Shared homepage story state. Business copy and timing follow the supplied demo. */
(()=>{
const U=HCEventUI,screen=document.getElementById('screen');
const story=window.HCStory=createHCStory();
const chipCover=U.el('div','cabinet-chip-cover');chipCover.setAttribute('aria-hidden','true');chipCover.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1021 574" preserveAspectRatio="none"><g fill="#34393b"><rect x="26.0" y="282.0" width="9" height="9" rx="1"/><rect x="43.0" y="282.0" width="9" height="9" rx="1"/><rect x="26.0" y="295.0" width="9" height="9" rx="1"/><rect x="43.0" y="295.0" width="9" height="9" rx="1"/><rect x="26.0" y="307.0" width="9" height="9" rx="1"/><rect x="43.0" y="307.0" width="9" height="9" rx="1"/><rect x="26.0" y="319.0" width="9" height="9" rx="1"/><rect x="43.0" y="319.0" width="9" height="9" rx="1"/><rect x="26.0" y="419.0" width="9" height="9" rx="1"/><rect x="43.0" y="419.0" width="9" height="9" rx="1"/><rect x="26.0" y="432.0" width="9" height="9" rx="1"/><rect x="43.0" y="432.0" width="9" height="9" rx="1"/><rect x="26.0" y="444.0" width="9" height="9" rx="1"/><rect x="43.0" y="444.0" width="9" height="9" rx="1"/><rect x="26.0" y="456.0" width="9" height="9" rx="1"/><rect x="43.0" y="456.0" width="9" height="9" rx="1"/><rect x="18.0" y="343.5" width="42" height="7" rx="1"/><rect x="18.0" y="353.5" width="42" height="7" rx="1"/><rect x="18.0" y="362.5" width="42" height="7" rx="1"/><rect x="18.0" y="372.5" width="42" height="7" rx="1"/><rect x="18.0" y="381.5" width="42" height="7" rx="1"/><rect x="18.0" y="391.5" width="42" height="7" rx="1"/><rect x="18.0" y="400.5" width="42" height="7" rx="1"/><rect x="18.0" y="410.5" width="42" height="7" rx="1"/><rect x="75.5" y="282.0" width="9" height="9" rx="1"/><rect x="92.5" y="282.0" width="9" height="9" rx="1"/><rect x="75.5" y="295.0" width="9" height="9" rx="1"/><rect x="92.5" y="295.0" width="9" height="9" rx="1"/><rect x="75.5" y="307.0" width="9" height="9" rx="1"/><rect x="92.5" y="307.0" width="9" height="9" rx="1"/><rect x="75.5" y="319.0" width="9" height="9" rx="1"/><rect x="92.5" y="319.0" width="9" height="9" rx="1"/><rect x="75.5" y="419.0" width="9" height="9" rx="1"/><rect x="92.5" y="419.0" width="9" height="9" rx="1"/><rect x="75.5" y="432.0" width="9" height="9" rx="1"/><rect x="92.5" y="432.0" width="9" height="9" rx="1"/><rect x="75.5" y="444.0" width="9" height="9" rx="1"/><rect x="92.5" y="444.0" width="9" height="9" rx="1"/><rect x="75.5" y="456.0" width="9" height="9" rx="1"/><rect x="92.5" y="456.0" width="9" height="9" rx="1"/><rect x="67.5" y="343.5" width="42" height="7" rx="1"/><rect x="67.5" y="353.5" width="42" height="7" rx="1"/><rect x="67.5" y="362.5" width="42" height="7" rx="1"/><rect x="67.5" y="372.5" width="42" height="7" rx="1"/><rect x="67.5" y="381.5" width="42" height="7" rx="1"/><rect x="67.5" y="391.5" width="42" height="7" rx="1"/><rect x="67.5" y="400.5" width="42" height="7" rx="1"/><rect x="67.5" y="410.5" width="42" height="7" rx="1"/><rect x="125.0" y="282.0" width="9" height="9" rx="1"/><rect x="142.0" y="282.0" width="9" height="9" rx="1"/><rect x="125.0" y="295.0" width="9" height="9" rx="1"/><rect x="142.0" y="295.0" width="9" height="9" rx="1"/><rect x="125.0" y="307.0" width="9" height="9" rx="1"/><rect x="142.0" y="307.0" width="9" height="9" rx="1"/><rect x="125.0" y="319.0" width="9" height="9" rx="1"/><rect x="142.0" y="319.0" width="9" height="9" rx="1"/><rect x="125.0" y="419.0" width="9" height="9" rx="1"/><rect x="142.0" y="419.0" width="9" height="9" rx="1"/><rect x="125.0" y="432.0" width="9" height="9" rx="1"/><rect x="142.0" y="432.0" width="9" height="9" rx="1"/><rect x="125.0" y="444.0" width="9" height="9" rx="1"/><rect x="142.0" y="444.0" width="9" height="9" rx="1"/><rect x="125.0" y="456.0" width="9" height="9" rx="1"/><rect x="142.0" y="456.0" width="9" height="9" rx="1"/><rect x="117.0" y="343.5" width="42" height="7" rx="1"/><rect x="117.0" y="353.5" width="42" height="7" rx="1"/><rect x="117.0" y="362.5" width="42" height="7" rx="1"/><rect x="117.0" y="372.5" width="42" height="7" rx="1"/><rect x="117.0" y="381.5" width="42" height="7" rx="1"/><rect x="117.0" y="391.5" width="42" height="7" rx="1"/><rect x="117.0" y="400.5" width="42" height="7" rx="1"/><rect x="117.0" y="410.5" width="42" height="7" rx="1"/><rect x="174.5" y="282.0" width="9" height="9" rx="1"/><rect x="191.5" y="282.0" width="9" height="9" rx="1"/><rect x="174.5" y="295.0" width="9" height="9" rx="1"/><rect x="191.5" y="295.0" width="9" height="9" rx="1"/><rect x="174.5" y="307.0" width="9" height="9" rx="1"/><rect x="191.5" y="307.0" width="9" height="9" rx="1"/><rect x="174.5" y="319.0" width="9" height="9" rx="1"/><rect x="191.5" y="319.0" width="9" height="9" rx="1"/><rect x="174.5" y="419.0" width="9" height="9" rx="1"/><rect x="191.5" y="419.0" width="9" height="9" rx="1"/><rect x="174.5" y="432.0" width="9" height="9" rx="1"/><rect x="191.5" y="432.0" width="9" height="9" rx="1"/><rect x="174.5" y="444.0" width="9" height="9" rx="1"/><rect x="191.5" y="444.0" width="9" height="9" rx="1"/><rect x="174.5" y="456.0" width="9" height="9" rx="1"/><rect x="191.5" y="456.0" width="9" height="9" rx="1"/><rect x="166.5" y="343.5" width="42" height="7" rx="1"/><rect x="166.5" y="353.5" width="42" height="7" rx="1"/><rect x="166.5" y="362.5" width="42" height="7" rx="1"/><rect x="166.5" y="372.5" width="42" height="7" rx="1"/><rect x="166.5" y="381.5" width="42" height="7" rx="1"/><rect x="166.5" y="391.5" width="42" height="7" rx="1"/><rect x="166.5" y="400.5" width="42" height="7" rx="1"/><rect x="166.5" y="410.5" width="42" height="7" rx="1"/><rect x="224.0" y="282.0" width="9" height="9" rx="1"/><rect x="241.0" y="282.0" width="9" height="9" rx="1"/><rect x="224.0" y="295.0" width="9" height="9" rx="1"/><rect x="241.0" y="295.0" width="9" height="9" rx="1"/><rect x="224.0" y="307.0" width="9" height="9" rx="1"/><rect x="241.0" y="307.0" width="9" height="9" rx="1"/><rect x="224.0" y="319.0" width="9" height="9" rx="1"/><rect x="241.0" y="319.0" width="9" height="9" rx="1"/><rect x="224.0" y="419.0" width="9" height="9" rx="1"/><rect x="241.0" y="419.0" width="9" height="9" rx="1"/><rect x="224.0" y="432.0" width="9" height="9" rx="1"/><rect x="241.0" y="432.0" width="9" height="9" rx="1"/><rect x="224.0" y="444.0" width="9" height="9" rx="1"/><rect x="241.0" y="444.0" width="9" height="9" rx="1"/><rect x="224.0" y="456.0" width="9" height="9" rx="1"/><rect x="241.0" y="456.0" width="9" height="9" rx="1"/><rect x="216.0" y="343.5" width="42" height="7" rx="1"/><rect x="216.0" y="353.5" width="42" height="7" rx="1"/><rect x="216.0" y="362.5" width="42" height="7" rx="1"/><rect x="216.0" y="372.5" width="42" height="7" rx="1"/><rect x="216.0" y="381.5" width="42" height="7" rx="1"/><rect x="216.0" y="391.5" width="42" height="7" rx="1"/><rect x="216.0" y="400.5" width="42" height="7" rx="1"/><rect x="216.0" y="410.5" width="42" height="7" rx="1"/><rect x="273.5" y="282.0" width="9" height="9" rx="1"/><rect x="290.5" y="282.0" width="9" height="9" rx="1"/><rect x="273.5" y="295.0" width="9" height="9" rx="1"/><rect x="290.5" y="295.0" width="9" height="9" rx="1"/><rect x="273.5" y="307.0" width="9" height="9" rx="1"/><rect x="290.5" y="307.0" width="9" height="9" rx="1"/><rect x="273.5" y="319.0" width="9" height="9" rx="1"/><rect x="290.5" y="319.0" width="9" height="9" rx="1"/><rect x="273.5" y="419.0" width="9" height="9" rx="1"/><rect x="290.5" y="419.0" width="9" height="9" rx="1"/><rect x="273.5" y="432.0" width="9" height="9" rx="1"/><rect x="290.5" y="432.0" width="9" height="9" rx="1"/><rect x="273.5" y="444.0" width="9" height="9" rx="1"/><rect x="290.5" y="444.0" width="9" height="9" rx="1"/><rect x="273.5" y="456.0" width="9" height="9" rx="1"/><rect x="290.5" y="456.0" width="9" height="9" rx="1"/><rect x="265.5" y="343.5" width="42" height="7" rx="1"/><rect x="265.5" y="353.5" width="42" height="7" rx="1"/><rect x="265.5" y="362.5" width="42" height="7" rx="1"/><rect x="265.5" y="372.5" width="42" height="7" rx="1"/><rect x="265.5" y="381.5" width="42" height="7" rx="1"/><rect x="265.5" y="391.5" width="42" height="7" rx="1"/><rect x="265.5" y="400.5" width="42" height="7" rx="1"/><rect x="265.5" y="410.5" width="42" height="7" rx="1"/><rect x="323.0" y="282.0" width="9" height="9" rx="1"/><rect x="340.0" y="282.0" width="9" height="9" rx="1"/><rect x="323.0" y="295.0" width="9" height="9" rx="1"/><rect x="340.0" y="295.0" width="9" height="9" rx="1"/><rect x="323.0" y="307.0" width="9" height="9" rx="1"/><rect x="340.0" y="307.0" width="9" height="9" rx="1"/><rect x="323.0" y="319.0" width="9" height="9" rx="1"/><rect x="340.0" y="319.0" width="9" height="9" rx="1"/><rect x="323.0" y="419.0" width="9" height="9" rx="1"/><rect x="340.0" y="419.0" width="9" height="9" rx="1"/><rect x="323.0" y="432.0" width="9" height="9" rx="1"/><rect x="340.0" y="432.0" width="9" height="9" rx="1"/><rect x="323.0" y="444.0" width="9" height="9" rx="1"/><rect x="340.0" y="444.0" width="9" height="9" rx="1"/><rect x="323.0" y="456.0" width="9" height="9" rx="1"/><rect x="340.0" y="456.0" width="9" height="9" rx="1"/><rect x="315.0" y="343.5" width="42" height="7" rx="1"/><rect x="315.0" y="353.5" width="42" height="7" rx="1"/><rect x="315.0" y="362.5" width="42" height="7" rx="1"/><rect x="315.0" y="372.5" width="42" height="7" rx="1"/><rect x="315.0" y="381.5" width="42" height="7" rx="1"/><rect x="315.0" y="391.5" width="42" height="7" rx="1"/><rect x="315.0" y="400.5" width="42" height="7" rx="1"/><rect x="315.0" y="410.5" width="42" height="7" rx="1"/><rect x="372.5" y="282.0" width="9" height="9" rx="1"/><rect x="389.5" y="282.0" width="9" height="9" rx="1"/><rect x="372.5" y="295.0" width="9" height="9" rx="1"/><rect x="389.5" y="295.0" width="9" height="9" rx="1"/><rect x="372.5" y="307.0" width="9" height="9" rx="1"/><rect x="389.5" y="307.0" width="9" height="9" rx="1"/><rect x="372.5" y="319.0" width="9" height="9" rx="1"/><rect x="389.5" y="319.0" width="9" height="9" rx="1"/><rect x="372.5" y="419.0" width="9" height="9" rx="1"/><rect x="389.5" y="419.0" width="9" height="9" rx="1"/><rect x="372.5" y="432.0" width="9" height="9" rx="1"/><rect x="389.5" y="432.0" width="9" height="9" rx="1"/><rect x="372.5" y="444.0" width="9" height="9" rx="1"/><rect x="389.5" y="444.0" width="9" height="9" rx="1"/><rect x="372.5" y="456.0" width="9" height="9" rx="1"/><rect x="389.5" y="456.0" width="9" height="9" rx="1"/><rect x="364.5" y="343.5" width="42" height="7" rx="1"/><rect x="364.5" y="353.5" width="42" height="7" rx="1"/><rect x="364.5" y="362.5" width="42" height="7" rx="1"/><rect x="364.5" y="372.5" width="42" height="7" rx="1"/><rect x="364.5" y="381.5" width="42" height="7" rx="1"/><rect x="364.5" y="391.5" width="42" height="7" rx="1"/><rect x="364.5" y="400.5" width="42" height="7" rx="1"/><rect x="364.5" y="410.5" width="42" height="7" rx="1"/><rect x="620.0" y="282.0" width="9" height="9" rx="1"/><rect x="637.0" y="282.0" width="9" height="9" rx="1"/><rect x="620.0" y="295.0" width="9" height="9" rx="1"/><rect x="637.0" y="295.0" width="9" height="9" rx="1"/><rect x="620.0" y="307.0" width="9" height="9" rx="1"/><rect x="637.0" y="307.0" width="9" height="9" rx="1"/><rect x="620.0" y="319.0" width="9" height="9" rx="1"/><rect x="637.0" y="319.0" width="9" height="9" rx="1"/><rect x="620.0" y="419.0" width="9" height="9" rx="1"/><rect x="637.0" y="419.0" width="9" height="9" rx="1"/><rect x="620.0" y="432.0" width="9" height="9" rx="1"/><rect x="637.0" y="432.0" width="9" height="9" rx="1"/><rect x="620.0" y="444.0" width="9" height="9" rx="1"/><rect x="637.0" y="444.0" width="9" height="9" rx="1"/><rect x="620.0" y="456.0" width="9" height="9" rx="1"/><rect x="637.0" y="456.0" width="9" height="9" rx="1"/><rect x="612.0" y="343.5" width="42" height="7" rx="1"/><rect x="612.0" y="353.5" width="42" height="7" rx="1"/><rect x="612.0" y="362.5" width="42" height="7" rx="1"/><rect x="612.0" y="372.5" width="42" height="7" rx="1"/><rect x="612.0" y="381.5" width="42" height="7" rx="1"/><rect x="612.0" y="391.5" width="42" height="7" rx="1"/><rect x="612.0" y="400.5" width="42" height="7" rx="1"/><rect x="612.0" y="410.5" width="42" height="7" rx="1"/><rect x="669.5" y="282.0" width="9" height="9" rx="1"/><rect x="686.5" y="282.0" width="9" height="9" rx="1"/><rect x="669.5" y="295.0" width="9" height="9" rx="1"/><rect x="686.5" y="295.0" width="9" height="9" rx="1"/><rect x="669.5" y="307.0" width="9" height="9" rx="1"/><rect x="686.5" y="307.0" width="9" height="9" rx="1"/><rect x="669.5" y="319.0" width="9" height="9" rx="1"/><rect x="686.5" y="319.0" width="9" height="9" rx="1"/><rect x="669.5" y="419.0" width="9" height="9" rx="1"/><rect x="686.5" y="419.0" width="9" height="9" rx="1"/><rect x="669.5" y="432.0" width="9" height="9" rx="1"/><rect x="686.5" y="432.0" width="9" height="9" rx="1"/><rect x="669.5" y="444.0" width="9" height="9" rx="1"/><rect x="686.5" y="444.0" width="9" height="9" rx="1"/><rect x="669.5" y="456.0" width="9" height="9" rx="1"/><rect x="686.5" y="456.0" width="9" height="9" rx="1"/><rect x="661.5" y="343.5" width="42" height="7" rx="1"/><rect x="661.5" y="353.5" width="42" height="7" rx="1"/><rect x="661.5" y="362.5" width="42" height="7" rx="1"/><rect x="661.5" y="372.5" width="42" height="7" rx="1"/><rect x="661.5" y="381.5" width="42" height="7" rx="1"/><rect x="661.5" y="391.5" width="42" height="7" rx="1"/><rect x="661.5" y="400.5" width="42" height="7" rx="1"/><rect x="661.5" y="410.5" width="42" height="7" rx="1"/><rect x="719.0" y="282.0" width="9" height="9" rx="1"/><rect x="736.0" y="282.0" width="9" height="9" rx="1"/><rect x="719.0" y="295.0" width="9" height="9" rx="1"/><rect x="736.0" y="295.0" width="9" height="9" rx="1"/><rect x="719.0" y="307.0" width="9" height="9" rx="1"/><rect x="736.0" y="307.0" width="9" height="9" rx="1"/><rect x="719.0" y="319.0" width="9" height="9" rx="1"/><rect x="736.0" y="319.0" width="9" height="9" rx="1"/><rect x="719.0" y="419.0" width="9" height="9" rx="1"/><rect x="736.0" y="419.0" width="9" height="9" rx="1"/><rect x="719.0" y="432.0" width="9" height="9" rx="1"/><rect x="736.0" y="432.0" width="9" height="9" rx="1"/><rect x="719.0" y="444.0" width="9" height="9" rx="1"/><rect x="736.0" y="444.0" width="9" height="9" rx="1"/><rect x="719.0" y="456.0" width="9" height="9" rx="1"/><rect x="736.0" y="456.0" width="9" height="9" rx="1"/><rect x="711.0" y="343.5" width="42" height="7" rx="1"/><rect x="711.0" y="353.5" width="42" height="7" rx="1"/><rect x="711.0" y="362.5" width="42" height="7" rx="1"/><rect x="711.0" y="372.5" width="42" height="7" rx="1"/><rect x="711.0" y="381.5" width="42" height="7" rx="1"/><rect x="711.0" y="391.5" width="42" height="7" rx="1"/><rect x="711.0" y="400.5" width="42" height="7" rx="1"/><rect x="711.0" y="410.5" width="42" height="7" rx="1"/><rect x="768.5" y="282.0" width="9" height="9" rx="1"/><rect x="785.5" y="282.0" width="9" height="9" rx="1"/><rect x="768.5" y="295.0" width="9" height="9" rx="1"/><rect x="785.5" y="295.0" width="9" height="9" rx="1"/><rect x="768.5" y="307.0" width="9" height="9" rx="1"/><rect x="785.5" y="307.0" width="9" height="9" rx="1"/><rect x="768.5" y="319.0" width="9" height="9" rx="1"/><rect x="785.5" y="319.0" width="9" height="9" rx="1"/><rect x="768.5" y="419.0" width="9" height="9" rx="1"/><rect x="785.5" y="419.0" width="9" height="9" rx="1"/><rect x="768.5" y="432.0" width="9" height="9" rx="1"/><rect x="785.5" y="432.0" width="9" height="9" rx="1"/><rect x="768.5" y="444.0" width="9" height="9" rx="1"/><rect x="785.5" y="444.0" width="9" height="9" rx="1"/><rect x="768.5" y="456.0" width="9" height="9" rx="1"/><rect x="785.5" y="456.0" width="9" height="9" rx="1"/><rect x="760.5" y="343.5" width="42" height="7" rx="1"/><rect x="760.5" y="353.5" width="42" height="7" rx="1"/><rect x="760.5" y="362.5" width="42" height="7" rx="1"/><rect x="760.5" y="372.5" width="42" height="7" rx="1"/><rect x="760.5" y="381.5" width="42" height="7" rx="1"/><rect x="760.5" y="391.5" width="42" height="7" rx="1"/><rect x="760.5" y="400.5" width="42" height="7" rx="1"/><rect x="760.5" y="410.5" width="42" height="7" rx="1"/><rect x="818.0" y="282.0" width="9" height="9" rx="1"/><rect x="835.0" y="282.0" width="9" height="9" rx="1"/><rect x="818.0" y="295.0" width="9" height="9" rx="1"/><rect x="835.0" y="295.0" width="9" height="9" rx="1"/><rect x="818.0" y="307.0" width="9" height="9" rx="1"/><rect x="835.0" y="307.0" width="9" height="9" rx="1"/><rect x="818.0" y="319.0" width="9" height="9" rx="1"/><rect x="835.0" y="319.0" width="9" height="9" rx="1"/><rect x="818.0" y="419.0" width="9" height="9" rx="1"/><rect x="835.0" y="419.0" width="9" height="9" rx="1"/><rect x="818.0" y="432.0" width="9" height="9" rx="1"/><rect x="835.0" y="432.0" width="9" height="9" rx="1"/><rect x="818.0" y="444.0" width="9" height="9" rx="1"/><rect x="835.0" y="444.0" width="9" height="9" rx="1"/><rect x="818.0" y="456.0" width="9" height="9" rx="1"/><rect x="835.0" y="456.0" width="9" height="9" rx="1"/><rect x="810.0" y="343.5" width="42" height="7" rx="1"/><rect x="810.0" y="353.5" width="42" height="7" rx="1"/><rect x="810.0" y="362.5" width="42" height="7" rx="1"/><rect x="810.0" y="372.5" width="42" height="7" rx="1"/><rect x="810.0" y="381.5" width="42" height="7" rx="1"/><rect x="810.0" y="391.5" width="42" height="7" rx="1"/><rect x="810.0" y="400.5" width="42" height="7" rx="1"/><rect x="810.0" y="410.5" width="42" height="7" rx="1"/><rect x="867.5" y="282.0" width="9" height="9" rx="1"/><rect x="884.5" y="282.0" width="9" height="9" rx="1"/><rect x="867.5" y="295.0" width="9" height="9" rx="1"/><rect x="884.5" y="295.0" width="9" height="9" rx="1"/><rect x="867.5" y="307.0" width="9" height="9" rx="1"/><rect x="884.5" y="307.0" width="9" height="9" rx="1"/><rect x="867.5" y="319.0" width="9" height="9" rx="1"/><rect x="884.5" y="319.0" width="9" height="9" rx="1"/><rect x="867.5" y="419.0" width="9" height="9" rx="1"/><rect x="884.5" y="419.0" width="9" height="9" rx="1"/><rect x="867.5" y="432.0" width="9" height="9" rx="1"/><rect x="884.5" y="432.0" width="9" height="9" rx="1"/><rect x="867.5" y="444.0" width="9" height="9" rx="1"/><rect x="884.5" y="444.0" width="9" height="9" rx="1"/><rect x="867.5" y="456.0" width="9" height="9" rx="1"/><rect x="884.5" y="456.0" width="9" height="9" rx="1"/><rect x="859.5" y="343.5" width="42" height="7" rx="1"/><rect x="859.5" y="353.5" width="42" height="7" rx="1"/><rect x="859.5" y="362.5" width="42" height="7" rx="1"/><rect x="859.5" y="372.5" width="42" height="7" rx="1"/><rect x="859.5" y="381.5" width="42" height="7" rx="1"/><rect x="859.5" y="391.5" width="42" height="7" rx="1"/><rect x="859.5" y="400.5" width="42" height="7" rx="1"/><rect x="859.5" y="410.5" width="42" height="7" rx="1"/><rect x="917.0" y="282.0" width="9" height="9" rx="1"/><rect x="934.0" y="282.0" width="9" height="9" rx="1"/><rect x="917.0" y="295.0" width="9" height="9" rx="1"/><rect x="934.0" y="295.0" width="9" height="9" rx="1"/><rect x="917.0" y="307.0" width="9" height="9" rx="1"/><rect x="934.0" y="307.0" width="9" height="9" rx="1"/><rect x="917.0" y="319.0" width="9" height="9" rx="1"/><rect x="934.0" y="319.0" width="9" height="9" rx="1"/><rect x="917.0" y="419.0" width="9" height="9" rx="1"/><rect x="934.0" y="419.0" width="9" height="9" rx="1"/><rect x="917.0" y="432.0" width="9" height="9" rx="1"/><rect x="934.0" y="432.0" width="9" height="9" rx="1"/><rect x="917.0" y="444.0" width="9" height="9" rx="1"/><rect x="934.0" y="444.0" width="9" height="9" rx="1"/><rect x="917.0" y="456.0" width="9" height="9" rx="1"/><rect x="934.0" y="456.0" width="9" height="9" rx="1"/><rect x="909.0" y="343.5" width="42" height="7" rx="1"/><rect x="909.0" y="353.5" width="42" height="7" rx="1"/><rect x="909.0" y="362.5" width="42" height="7" rx="1"/><rect x="909.0" y="372.5" width="42" height="7" rx="1"/><rect x="909.0" y="381.5" width="42" height="7" rx="1"/><rect x="909.0" y="391.5" width="42" height="7" rx="1"/><rect x="909.0" y="400.5" width="42" height="7" rx="1"/><rect x="909.0" y="410.5" width="42" height="7" rx="1"/><rect x="966.5" y="282.0" width="9" height="9" rx="1"/><rect x="983.5" y="282.0" width="9" height="9" rx="1"/><rect x="966.5" y="295.0" width="9" height="9" rx="1"/><rect x="983.5" y="295.0" width="9" height="9" rx="1"/><rect x="966.5" y="307.0" width="9" height="9" rx="1"/><rect x="983.5" y="307.0" width="9" height="9" rx="1"/><rect x="966.5" y="319.0" width="9" height="9" rx="1"/><rect x="983.5" y="319.0" width="9" height="9" rx="1"/><rect x="966.5" y="419.0" width="9" height="9" rx="1"/><rect x="983.5" y="419.0" width="9" height="9" rx="1"/><rect x="966.5" y="432.0" width="9" height="9" rx="1"/><rect x="983.5" y="432.0" width="9" height="9" rx="1"/><rect x="966.5" y="444.0" width="9" height="9" rx="1"/><rect x="983.5" y="444.0" width="9" height="9" rx="1"/><rect x="966.5" y="456.0" width="9" height="9" rx="1"/><rect x="983.5" y="456.0" width="9" height="9" rx="1"/><rect x="958.5" y="343.5" width="42" height="7" rx="1"/><rect x="958.5" y="353.5" width="42" height="7" rx="1"/><rect x="958.5" y="362.5" width="42" height="7" rx="1"/><rect x="958.5" y="372.5" width="42" height="7" rx="1"/><rect x="958.5" y="381.5" width="42" height="7" rx="1"/><rect x="958.5" y="391.5" width="42" height="7" rx="1"/><rect x="958.5" y="400.5" width="42" height="7" rx="1"/><rect x="958.5" y="410.5" width="42" height="7" rx="1"/><rect x="412.93" y="309.80" width="43.61" height="20.00" rx="2" fill="#343838"/><rect x="412.93" y="333.43" width="43.61" height="19.39" rx="2" fill="#343838"/><rect x="412.93" y="399.49" width="43.61" height="20.00" rx="2" fill="#343838"/><rect x="412.93" y="423.12" width="43.61" height="18.79" rx="2" fill="#343838"/><rect x="463.02" y="309.80" width="43.01" height="20.00" rx="2" fill="#343838"/><rect x="463.02" y="333.43" width="43.01" height="19.39" rx="2" fill="#343838"/><rect x="463.02" y="399.49" width="43.01" height="20.00" rx="2" fill="#343838"/><rect x="463.02" y="423.12" width="43.01" height="18.79" rx="2" fill="#343838"/><rect x="512.51" y="309.80" width="43.01" height="20.00" rx="2" fill="#343838"/><rect x="512.51" y="333.43" width="43.01" height="19.39" rx="2" fill="#343838"/><rect x="512.51" y="399.49" width="43.01" height="20.00" rx="2" fill="#343838"/><rect x="512.51" y="423.12" width="43.01" height="18.79" rx="2" fill="#343838"/><rect x="562.02" y="309.80" width="43.61" height="20.00" rx="2" fill="#343838"/><rect x="562.02" y="333.43" width="43.61" height="19.39" rx="2" fill="#343838"/><rect x="562.02" y="399.49" width="43.61" height="20.00" rx="2" fill="#343838"/><rect x="562.02" y="423.12" width="43.61" height="18.79" rx="2" fill="#343838"/></g></svg>';screen.append(chipCover);

const copy=window.HCStoryCopy={
 optical:['','发现链路闪断告警','30条告警聚合，生成链路闪断 issue','正在分析链路指标与设备日志','定位根因：光链路脏污','优雅隔离异常链路','光链路待清污','链路复核完成，已清污','关闭光链路清污待办','光链路隔离已取消'],
 qwen:['','发现 Qwen-1.5B 服务劣化告警','定位 D实例01 异常退出','无可替换节点，自动恢复受阻','分析 BMC、OS 与 vmcore 日志','定位根因：hinic3 网卡驱动版本过低','服务劣化，待人工升级网卡驱动','人工已确认，正在升级网卡驱动','驱动已升级，正在核查节点与服务健康','网卡升级与健康核查通过，服务恢复并闭环']};
const names={optical:'光链路脏污，待清污',qwen:'Qwen-1.5B服务劣化：网卡驱动版本低，待升级'};
window.HCEventTitle=(key,p)=>p===6?names[key]:key==='qwen'&&p>=7?'网卡升级与服务恢复':key==='qwen'&&p>=4?'网卡驱动故障诊断':copy[key]?.[1]||names[key];
let guardView='manual',impactOnly=false;
const affectsBusiness=key=>key==='qwen';
const expandedRecords=new Map();
const popoverVisits=new Map(),popoverHoldMs=2200;
function bindPopover(anchor,key,stage,startedAt,announce=true){
 const previous=popoverVisits.get(key);
 if(previous)clearTimeout(previous.timer);
 const visit={stage,startedAt,timer:null};popoverVisits.set(key,visit);
 let hovered=false,focused=false;const processing=stage<6;
 const show=()=>{clearTimeout(visit.timer);anchor.classList.add('story-visible');};
 const hide=()=>{clearTimeout(visit.timer);if(!processing&&!hovered&&!focused)anchor.classList.remove('story-visible');};
 anchor.onpointerenter=()=>{hovered=true;show();};
 anchor.onpointerleave=()=>{hovered=false;visit.timer=setTimeout(hide,180);};
 if(anchor._storyFocusIn)anchor.removeEventListener('focusin',anchor._storyFocusIn);
 if(anchor._storyFocusOut)anchor.removeEventListener('focusout',anchor._storyFocusOut);
 anchor._storyFocusIn=()=>{focused=true;show();};
 anchor._storyFocusOut=e=>{focused=anchor.contains(e.relatedTarget);if(!focused)visit.timer=setTimeout(hide,180);};
 anchor.addEventListener('focusin',anchor._storyFocusIn);
 anchor.addEventListener('focusout',anchor._storyFocusOut);
 if(anchor._showProgress)anchor.removeEventListener('story-show',anchor._showProgress);anchor._showProgress=show;anchor.addEventListener('story-show',show);
 // New progress is announced once; hovering never races this timer.
 if(announce){show();if(!processing)visit.timer=setTimeout(hide,popoverHoldMs);}
}

const open=key=>{if(key==='optical')window.openOpticalEvent();else window.openNicEvent();};
const stateOf=(key,p)=>p===9?'closed':p===6?'manual':'auto';
const guardAutoRows=new Map(),cabinetTipCache=new Map();
const progressText=(key,p)=>copy[key][p].replace('生成链路闪断 issue','生成链路闪断issue').replace('正在分析链路指标与设备日志','分析链路指标与设备日志');
window.renderStoryGuard=(view=guardView)=>{
 guardView=view==='energy'?'auto':view;
 const s=story.get(),keys=['optical','qwen'].filter(k=>!impactOnly||affectsBusiness(k)),automatic=keys.filter(k=>s[k]>0&&s[k]<9&&s[k]!==6),manual=keys.filter(k=>s[k]===6);
 const box=C.GuardEvents({view:guardView==='auto'?'energy':'manual',onChange:window.renderStoryGuard,onViewAll:window.openGuardEvents});
 const head=box.querySelector('.hc-guard-head'),filter=U.button('','hc-impact-filter',()=>{impactOnly=!impactOnly;window.renderStoryGuard();document.querySelector('#home-events .hc-impact-filter')?.focus({preventScroll:true});});
 filter.setAttribute('role','checkbox');filter.setAttribute('aria-label','仅显示影响业务事件');filter.setAttribute('aria-checked',String(impactOnly));filter.title='仅显示影响业务事件';filter.append(U.el('i','hc-impact-check'),U.el('span','','仅显示影响业务事件'));head.insertBefore(filter,head.lastElementChild);
 box.querySelectorAll('.hc-event-row').forEach(n=>n.remove());
 box.querySelectorAll('[role="tab"]').forEach((n,i)=>{n.firstChild.textContent=i?'自动处理中 ':'待人工处理 ';n.querySelector('.hc-tab-count').textContent=i?automatic.length:manual.length+(impactOnly?0:2);});
 for(const [key,cached] of guardAutoRows){if(guardView!=='auto'||!automatic.includes(key)||cached.stage!==s[key]||cached.startedAt!==s.startedAt){clearInterval(cached.timer);guardAutoRows.delete(key);}}
 const entries=guardView==='auto'?automatic:manual;
 for(const key of entries){
  const cached=guardAutoRows.get(key);if(cached){box.append(cached.row);continue;}
  const row=U.el('article','hc-event-row'),head=U.el('div','hc-event-head'),processing=guardView==='auto';
  row.dataset.linkedEvent=key;
  const eventIcon=processing?C.EventTypeIcon({size:24}):manualFaultSymbol(key==='qwen');if(processing){eventIcon.classList.add('guard-auto-symbol');eventIcon.setAttribute('aria-label','故障自动处理中');C.FlowBorder(eventIcon);}head.append(eventIcon,U.el('span','',HCEventTitle(key,s[key])),U.el('time','',key==='optical'?(processing?'12:00:00':'12:00:40'):'12:05:12'));
  if(processing){row.classList.add('hc-event-processing');C.FlowBorder(row);}
  const desc=U.el('p','',processing?'':key==='optical'?'计算柜11-L1交换板02链路已优雅隔离，等待人工清污':'112.34.23.1 无可替换节点，服务仍劣化，需人工将 hinic3 从V11.8升级至V13.1');row.append(head,desc);
  row.setAttribute('role','button');row.tabIndex=0;row.setAttribute('aria-label',key==='optical'?'查看光链路脏污故障详情':'查看Qwen处理进度');row.onclick=()=>open(key);row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(key)}};
  if(processing){const chars=Array.from(progressText(key,s[key]));let count=0;const entry={row,stage:s[key],startedAt:s.startedAt,timer:null};entry.timer=setInterval(()=>{desc.textContent=chars.slice(0,++count).join('');if(count>=chars.length)clearInterval(entry.timer);},35);guardAutoRows.set(key,entry);}
  box.append(row);
 }
 if(guardView!=='auto'&&!impactOnly)for(let i=0;i<2;i++){const row=U.el('article','hc-event-row');row.dataset.linkedEvent='cabinetD08-'+i;const head=U.el('div','hc-event-head');head.append(manualFaultSymbol(false),U.el('span','',['NPU驱动固件版本不一致','NPU网口linkdown'][i]),U.el('time','',i?'11:57:00':'11:55:00'));row.append(head,U.el('p','','SuperpodD · 计算柜08，等待人工处理'));box.append(row);}
 if(!entries.length&&impactOnly){const empty=U.el('div','story-impact-empty','暂无影响业务的'+(guardView==='auto'?'自动处理事件':'待人工处理事件'));empty.setAttribute('role','status');box.append(empty);}else if(!entries.length&&(guardView==='auto'||impactOnly)){const empty=U.el('div','story-empty'),img=U.el('img');img.src=HC_ASSETS.icons['暂无待处理事项'];img.alt=guardView==='auto'?'暂无自动处理中的事件':'暂无待处理事项';if(guardView==='auto'){empty.classList.add('story-empty-processing');const art=U.el('div','story-empty-art');art.append(img);empty.append(art,U.el('span','story-empty-caption','暂无自动处理中事项'));}else empty.append(img);box.append(empty);}
 // Newest events first; moving existing rows preserves their handlers.
 Array.from(box.querySelectorAll(':scope > .hc-event-row')).sort((a,b)=>(b.querySelector('time')?.textContent||'').localeCompare(a.querySelector('time')?.textContent||'')).forEach(row=>box.append(row));
 mount('home-events',box);
};
window.storyWorkloads=category=>HOME_WORKLOADS[category].map(item=>{const x={...item,data:{...item.data}},s=story.get();if(category==='inference'&&/^Qwen-1.5B/.test(x.data.name)){const active=s.qwen>0&&s.qwen<9;x.status=active?'degraded':'normal';x.data.faults=active?'1':'0';x.data.processingText=active?copy.qwen[s.qwen]:'';x.data.processingManual=s.qwen===6;x.data.pendingManual=s.qwen===6?1:0;if(s.qwen>0){const total=Number(x.data.total);x.data.ok=String(Math.round(total*(active?.775:.9994)));x.data.fail=String(total-Number(x.data.ok));x.data.quality=(100*Number(x.data.ok)/total).toFixed(2)+'%';x.data.ttft=active?'186 ms':'182 ms';x.data.tpot=active?'43 ms':'23.6 ms';}}return x});

function impactFlags(impact=false){
 const flags=U.el('span','fault-status-flags');flags.setAttribute('aria-label',impact?'待人工处理，影响业务':'待人工处理');
 const hand=U.el('img');hand.src=HC_ASSETS.icons['红色小手'];hand.alt='待人工处理';flags.append(hand);
 if(impact){const mark=U.el('b','business-impact-symbol','✱');mark.setAttribute('aria-label','影响业务');mark.title='影响业务';flags.append(mark);}return flags;
}
function manualFaultSymbol(impact=true){const symbol=C.EventTypeIcon({size:24});symbol.classList.add('thermal-symbol');symbol.append(impactFlags(impact));return symbol;}
function renderImpactFlags(){
 document.querySelectorAll('#home-tips .hc-fault-tip').forEach(tip=>{tip.querySelector('.fault-status-flags')?.remove();tip.querySelector('.hc-tip-arrow')?.remove();if(tip.classList.contains('manual'))tip.append(impactFlags(tip.classList.contains('qwen')));else{const flags=U.el('span','fault-status-flags');flags.setAttribute('aria-label','自动处理中');flags.append(U.el('span','tip-auto-state','◌'));if(tip.classList.contains('qwen')){const mark=U.el('b','business-impact-symbol','✱');mark.setAttribute('aria-label','影响业务');flags.append(mark);}tip.append(flags);}const labels=tip.querySelector('.fault-status-flags');labels.append(U.el('span','tip-state-label',tip.classList.contains('manual')?'待人工处理':'自动处理中'));if(tip.classList.contains('qwen'))labels.append(U.el('span','tip-impact-label','影响业务'));});
 document.querySelectorAll('#home-timeline-markers .story-marker.manual').forEach(marker=>{marker.querySelectorAll(':scope > .hc-event-manual-hand,:scope > .story-marker-hand,:scope > .fault-status-flags').forEach(n=>n.remove());const flags=impactFlags(marker.closest('[data-event-key]')?.dataset.eventKey==='qwen');flags.querySelector('img').classList.add('hc-event-manual-hand');marker.append(flags);});
}

function metric(category,index,value){const g=document.querySelector('.hc-metric-group[data-category="'+category+'"]');const b=g?.querySelectorAll('.hc-metric-content>b')[index];if(b)b.firstChild.textContent=String(value);if(category==='resource'&&index===0)g.querySelector('.hc-metric-compact b').textContent=value}
function render(s){
 document.querySelector('.hc-domain-legend')?.remove();
const timelineStart=-360;const now=document.querySelector('.time-now');now.style.left=(960/1140*100)+'%';now.querySelector('b').textContent=HCClock.format(600);screen.dataset.storyOptical=s.optical;screen.dataset.storyQwen=s.qwen;
 for(const [key,visit] of popoverVisits){if(!s[key]||visit.startedAt!==s.startedAt){clearTimeout(visit.timer);popoverVisits.delete(key);expandedRecords.delete(key);}}
 const deviceLocated=s.qwen>=5&&s.qwen<9;
 const active=2+Number(s.optical>0&&s.optical<9)+Number(deviceLocated);
 metric('resource',0,active);for(const category of ['training','inference']){const data=window.storyWorkloads(category);['interrupted','stuck','degraded','normal'].forEach((status,i)=>metric(category,i+1,data.filter(x=>x.status===status).length));metric(category,0,data.length)}
 const health=document.querySelector('.health-metrics .row-value p');health.firstChild.textContent=(2+['optical','qwen'].filter(key=>s[key]>=6&&s[key]<9).length)+' ';health.querySelector('small').textContent='/ '+(12+Number(s.optical>0)+Number(s.optical>=6)+Number(s.qwen>0))+'项';
 document.querySelector('.health-row:nth-child(2) .row-value p').firstChild.textContent='0 ';
 document.querySelector('.cabinet-fault-link').hidden=!(s.optical>0&&s.optical<9);
 document.querySelector('.cabinet-red').hidden=!deviceLocated;
 window.updateCompactStatusIcons?.();
 window.renderStoryGuard();
 const tips=document.getElementById('home-tips');for(const [key,tip] of cabinetTipCache){if(!s[key]||s[key]>=9||(key==='qwen'&&!deviceLocated)||tip.dataset.startedAt!==String(s.startedAt)){clearTimeout(tip._copyTimer);tip.remove();cabinetTipCache.delete(key);}}const marks=document.getElementById('home-timeline-markers');const existingMarks=new Map([...marks.children].map(node=>[node.dataset.eventKey,node]));for(const node of marks.children){if((!s[node.dataset.eventKey]&&!node.dataset.eventKey.startsWith('cabinetD08-'))||node.dataset.startedAt!==String(s.startedAt))node.remove();}
 ['optical','qwen'].forEach((key,i)=>{const p=s[key];if(!p)return;const state=stateOf(key,p);
 if(state!=='closed'&&p<9&&(key!=='qwen'||deviceLocated)){let tip=cabinetTipCache.get(key);if(!tip){tip=C.FaultTip({state:state==='auto'?'auto':key});tip.classList.add(key);tip.dataset.startedAt=s.startedAt;cabinetTipCache.set(key,tip);tips.append(tip);}const nextMode=state==='auto'?'auto':'manual';if(!tip.classList.contains(nextMode)){const oldCopy=tip.querySelector('span').textContent;const next=C.FaultTip({state:state==='auto'?'auto':key});tip.className=next.className+' '+key;tip.replaceChildren(...next.childNodes);tip.querySelector('span').textContent=oldCopy;}HCFadeTip(tip,HCEventTitle(key,p));if(!tip.querySelector('.hc-tip-device'))tip.append(U.el('small','hc-tip-device',key==='optical'?'计算柜11 · L1交换板02':'计算柜13 · 112.34.23.1 · CPU02'));let detail=tip.querySelector('.hc-tip-detail');if(!detail){detail=U.el('div','hc-tip-detail');tip.append(detail);}detail.replaceChildren(U.el('strong','',HCEventTitle(key,p)),U.el('p','',key==='optical'?'故障对象：计算柜11 · L1交换板02':'故障对象：计算柜13 · 112.34.23.1 · CPU02'),U.el('p','',key==='optical'?(p>=5?'光模块端面脏污，异常链路已优雅隔离，健康通道承载业务':'检测到光链路闪断，正在分析链路指标与设备日志'):'hinic3 驱动版本 V11.8，需升级至 V13.1；无可替换节点，Qwen-1.5B 服务劣化'),U.el('p','',state==='manual'?'当前状态：待人工处理':'当前状态：自动处理中'),U.el('p','','点击查看处理详情'));tip.setAttribute('role','button');tip.tabIndex=0;tip.setAttribute('aria-label','查看'+(key==='optical'?'光链路脏污故障详情':'Qwen处理进度'));tip.onclick=()=>open(key);tip.onkeydown=e=>{if(e.key==='Enter')open(key)};}
 const existing=existingMarks.get(key);if(existing&&existing.dataset.stage===String(p)&&existing.dataset.startedAt===String(s.startedAt))return;
 const anchor=existing||U.el('div','marker-anchor');anchor.replaceChildren();anchor.className='marker-anchor'+(existing?' story-visible':'');anchor.dataset.eventKey=key;anchor.dataset.stage=p;anchor.dataset.startedAt=s.startedAt;const eventSecond=key==='optical'?20:312;anchor.style.left=((eventSecond-timelineStart)/1140*100)+'%';anchor.dataset.eventTime=HCClock.format(eventSecond);const marker=U.button('','story-marker '+state,()=>key==='optical'&&p>=6?window.openOpticalEvent({mode:'isolation'}):key==='qwen'?window.openNicEvent({mode:'recovery'}):open(key));marker.setAttribute('aria-label',key+'：'+copy[key][p]);const icon=U.el('img');icon.src=HC_ASSETS.icons[state==='closed'?'灰色的故障':'红色的故障'];icon.alt='';marker.dataset.count='1';marker.append(icon);if(state==='manual'){const hand=U.el('img','story-marker-hand');hand.src=HC_ASSETS.icons['红色小手'];hand.alt='待人工处理';marker.append(hand)}if(state==='auto')C.FlowBorder(marker);anchor.append(marker);
 // Closed business event and its follow-up share the approved linked marker shape.
 const split=key==='optical'&&p>=6;
 if(split){
   anchor.classList.add('story-split');anchor.dataset.followState=state;
   const borderId='split-border-'+key,fillId='split-fill-'+key;
   const shape=document.createElementNS('http://www.w3.org/2000/svg','svg');shape.setAttribute('class','story-split-shape');shape.setAttribute('viewBox','0 0 94 24');shape.setAttribute('aria-hidden','true');shape.innerHTML='<defs><linearGradient id="'+borderId+'"><stop offset="48%" stop-color="#777"/><stop offset="76%" stop-color="'+(state==='closed'?'#777':'#ed4a55')+'"/></linearGradient><linearGradient id="'+fillId+'"><stop offset="50%" stop-color="#393939"/><stop offset="100%" stop-color="'+(state==='closed'?'#393939':'#613037')+'"/></linearGradient></defs><path d="M12 1H49C53 1 54 4 59 4S65 1 69 1H82A11 11 0 0 1 82 23H69C65 23 64 20 59 20S53 23 49 23H12A11 11 0 0 1 12 1Z" fill="url(#'+fillId+')" stroke="url(#'+borderId+')" stroke-width="1.5"/>';anchor.prepend(shape);
   marker.className='story-marker closed';marker.dataset.part=key==='optical'?'isolation':'recovery';marker.setAttribute('aria-label',key==='optical'?'光链路优雅隔离：已闭环':'Qwen-1.5B业务劣化：节点迁移完成，已自动闭环');
   marker.querySelector('.story-marker-hand')?.remove();marker.querySelectorAll('.hc-flow-halo,.hc-flow-base,.hc-flow-ring').forEach(n=>n.remove());icon.src=HC_ASSETS.icons['灰色的故障'];
   const follow=U.button('','story-marker '+state,()=>key==='optical'?window.openOpticalEvent({mode:'full'}):window.openNicEvent({mode:'driver'}));follow.dataset.part=key==='optical'?'cleanup':'driver';follow.setAttribute('aria-label',(key==='optical'?'光链路清污':'网卡驱动升级')+'：'+(state==='closed'?'已闭环':state==='manual'?'待人工处理':'自动处理中'));
   const symbol=U.el('img');symbol.alt='';symbol.src=HC_ASSETS.icons[key==='qwen'&&state==='auto'?'红色的故障':'红色小手'];symbol.className='story-cleanup-hand';follow.append(symbol);
   if(state==='auto')C.FlowBorder(follow);
   follow.setAttribute('aria-describedby','story-popover-'+key);anchor.append(follow);
 }
 marker.firstElementChild?.matches('img')&&marker.firstElementChild.replaceWith(C.EventTypeIcon({business:key==='qwen',closed:split||state==='closed',size:20}));
 const followMarker=anchor.querySelector('[data-part=driver],[data-part=cleanup]');if(followMarker){const symbol=followMarker.querySelector('.story-cleanup-hand');symbol?.replaceWith(C.EventTypeIcon({closed:state==='closed',size:20}));if(state==='manual'){const hand=U.el('img','hc-event-manual-hand');hand.src=HC_ASSETS.icons['红色小手'];hand.alt='待人工处理';followMarker.append(hand);}}
 const pop=U.el('div','story-popover');pop.id='story-popover-'+key;pop.setAttribute('role','tooltip');marker.setAttribute('aria-describedby',pop.id);
 let rows=copy[key].slice(1,Math.min(p,5)+1);if(p===6)rows=[...copy[key].slice(1,5),copy[key][6]];if(p>=7)rows=[...copy[key].slice(1,5),copy[key][p]];
 if(key==='qwen')rows=copy.qwen.slice(1,Math.min(p,9)+1);
 if(key==='optical'){rows=rows.map(t=>t==='30条告警聚合，生成链路闪断 issue'?'30条告警聚合，生成链路闪断issue':t==='正在分析链路指标与设备日志'?'分析链路指标与设备日志':t)}
 rows.forEach((text,i)=>{const last=i===rows.length-1,kind=last&&state!=='closed'?(state==='manual'?'manual':'working'):'done';const row=U.el('p','story-popover-row '+kind),status=U.el('i','story-step-icon '+kind);status.setAttribute('aria-label',kind==='done'?'已完成':kind==='manual'?'待人工处理':'处理中');if(kind==='manual'){const img=U.el('img');img.src=HC_ASSETS.icons['红色小手'];img.alt='';status.append(img)}row.append(status,U.el('span','',text));pop.append(row)});
 if(split){
   pop.classList.add('story-popover-grouped');
   const completed=U.el('section','story-popover-section'),followup=U.el('section','story-popover-section');
   completed.dataset.part='completed';followup.dataset.part='followup';completed.dataset.state='closed';followup.dataset.state=state;
   const addHeading=(section,title,status)=>{const head=U.el('div','story-popover-heading');head.append(U.el('strong','',title),U.el('small','',status));section.append(head);};
   addHeading(completed,key==='qwen'?'Qwen-1.5B服务劣化，已恢复':'光链路闪断，已完成优雅隔离','已闭环');
   addHeading(followup,key==='qwen'?(state==='closed'?'网卡驱动版本低，已升级':'网卡驱动版本待升级'):'光链路脏污，待清污',{manual:'待人工处理',auto:'自动处理中',closed:'已闭环'}[state]);
   const progress=[...pop.querySelectorAll('.story-popover-row')];
   progress.forEach((row,index)=>(index<4?completed:followup).append(row));
   if(key==='optical'){
     const row=U.el('p','story-popover-row done');const icon=U.el('i','story-step-icon done');icon.setAttribute('aria-label','已完成');row.append(icon,U.el('span','','异常链路已优雅隔离'));completed.append(row);
   }
   pop.append(completed,followup);
   const emphasize=part=>{pop.dataset.activePart=part;completed.classList.toggle('is-active',part==='completed');followup.classList.toggle('is-active',part==='followup');};
   for(const [button,part] of [[marker,'completed'],[followMarker,'followup']])if(button){button.addEventListener('pointerenter',()=>emphasize(part));button.addEventListener('focus',()=>emphasize(part));}
   emphasize('followup');
 }
 if(key==='qwen'&&!split){
   pop.classList.add('story-popover-grouped');
   const section=U.el('section','story-popover-section is-active');section.dataset.state=state;
   const heading=U.el('div','story-popover-heading');heading.append(U.el('strong','',state==='closed'?'Qwen-1.5B服务已恢复，网卡驱动已升级':'Qwen-1.5B服务劣化：网卡驱动版本低'),U.el('small','',{manual:'待人工处理',auto:'自动处理中',closed:'已闭环'}[state]));
   section.append(heading,...pop.querySelectorAll('.story-popover-row'));pop.append(section);
 }
 if(state==='auto'){
   if(!pop.querySelector('.story-popover-heading')){const head=U.el('div','story-popover-heading');head.append(U.el('strong','',key==='optical'?'光链路闪断':'Qwen-1.5B服务劣化'),U.el('small','','自动处理中'));pop.prepend(head);}
   const records=[...pop.querySelectorAll('.story-popover-row')];
   if(records.length>3){const older=records.slice(0,-3);older.forEach(row=>row.hidden=!expandedRecords.get(key));const toggle=U.button('展开全部（'+records.length+'条）','story-record-toggle',e=>{e.stopPropagation();const expanded=toggle.getAttribute('aria-expanded')!=='true';expandedRecords.set(key,expanded);toggle.setAttribute('aria-expanded',String(expanded));older.forEach(row=>row.hidden=!expanded);toggle.textContent=expanded?'收起':'展开全部（'+records.length+'条）';});toggle.setAttribute('aria-expanded',String(!!expandedRecords.get(key)));if(expandedRecords.get(key))toggle.textContent='收起';pop.append(toggle);}
 }
 anchor.append(pop);marks.append(anchor);bindPopover(anchor,key,p,s.startedAt);
 });
 // Two independent pending faults on SuperpodD / compute cabinet 08.
 [-300,-180].forEach((second,i)=>{
   if(marks.querySelector('[data-event-key="cabinetD08-'+i+'"]'))return;
   const anchor=U.el('div','marker-anchor');anchor.dataset.eventKey='cabinetD08-'+i;anchor.dataset.startedAt=String(s.startedAt);
   anchor.style.left=((second+360)/1140*100)+'%';
   const marker=U.button('','story-marker manual',()=>anchor.classList.toggle('story-visible'));
   marker.setAttribute('aria-label',HCClock.format(second)+' SuperpodD 计算柜08 '+['NPU驱动固件版本不一致','NPU网口linkdown'][i]);
   const icon=U.el('img');icon.src=HC_ASSETS.icons['红色的故障'];icon.alt='故障';marker.append(icon);
   const pop=U.el('div','story-popover story-popover-grouped');pop.setAttribute('role','tooltip');
   const section=U.el('section','story-popover-section is-active');section.dataset.state='manual';
   const heading=U.el('div','story-popover-heading');heading.append(U.el('strong','',['NPU驱动固件版本不一致','NPU网口linkdown'][i]),U.el('small','','待人工处理'));
   const steps=[
     ['检测到NPU驱动与固件版本不一致','核对版本兼容关系，确认升级要求','已生成驱动与固件配套升级方案','待人工确认升级，完成后核查版本与设备健康'],
     ['检测到NPU网口linkdown告警','分析端口状态与链路日志，确认链路中断','已生成网口与线缆检查方案','待人工排查连接，完成后验证链路连通性']
   ][i];
   section.append(heading);
   steps.forEach((text,index)=>{
     const kind=index===steps.length-1?'manual':'done';
     const row=U.el('p','story-popover-row '+kind),status=U.el('i','story-step-icon '+kind);
     status.setAttribute('aria-label',kind==='manual'?'待人工处理':'已完成');
     if(kind==='manual'){const hand=U.el('img');hand.src=HC_ASSETS.icons['红色小手'];hand.alt='';status.append(hand);}
     row.append(status,U.el('span','',text));section.append(row);
   });
   pop.append(section);
   anchor.append(marker,pop);marks.append(anchor);
   anchor.onpointerenter=()=>anchor.classList.add('story-visible');anchor.onpointerleave=()=>anchor.classList.remove('story-visible');
   marker.onfocus=()=>anchor.classList.add('story-visible');marker.onblur=()=>anchor.classList.remove('story-visible');
 });
 window.updateStoryRecords?.(rows=>{
   const records=rows.filter(r=>r.action!=='qwen'&&(r.action!=='link'||s.optical>0)).map(r=>{
     if(r.action==='link'){
       const status=stateOf('optical',s.optical);r.stateClass=status==='closed'?'human-closed':status==='manual'?'manual':'processing';
       r.state={processing:'自动处理中',manual:'待人工处理','human-closed':'已闭环'}[r.stateClass];
       r.clear=status==='closed'?'今天 19:19:30':'—';r.start='今天 12:00:40';if(status!=='manual')r.name='光链路脏污';
     }return r;
   });
   if(s.optical>0)records.push({name:'光链路脏污，已自动优雅隔离',state:s.optical>=6?'已闭环':'自动处理中',stateClass:s.optical>=6?'auto-closed':'processing',type:'故障',object:'计算柜11-L1交换板02',root:'优雅隔离异常链路；清污待办转交人工处理',start:'今天 12:00:00',clear:s.optical>=6?'今天 12:00:48':'—',action:'link-auto'});
   if(s.qwen>0){const status=stateOf('qwen',s.qwen),stateClass=status==='closed'?'human-closed':status==='manual'?'manual':'processing';records.unshift({name:status==='closed'?'网卡驱动升级完成，Qwen-1.5B服务已恢复':'网卡驱动版本低导致Qwen-1.5B服务劣化',state:{processing:'自动处理中',manual:'待人工处理','human-closed':'已闭环'}[stateClass],stateClass,type:'故障',object:'112.34.23.1 · CPU02 / Qwen-1.5B',root:s.qwen>=5?'hinic3 驱动版本低；无可替换节点，需人工升级至V13.1':'正在诊断业务故障',start:'今天 12:05:12',clear:status==='closed'?'今天 12:06:35':'—',action:'qwen'});}
   return records;
 });
 if(!document.getElementById('home-workloads').hidden)window.refreshWorkloadCards?.();
 renderImpactFlags();
 window.dispatchEvent(new CustomEvent('hc-story-change',{detail:s}));
}
document.querySelector('#home-header select').addEventListener('change',e=>document.documentElement.dataset.runMode=e.target.value);
story.subscribe(render);window.addEventListener('hc-optical-complete',()=>story.complete('optical'));
const brand=document.querySelector('#home-header button');brand.onclick=()=>{HCClock.reset();window.resetOpticalEvent?.();window.resetNicEvent?.();document.getElementById('guard-all').hidden=true;guardView='manual';document.querySelector('#home-metrics .hc-ribbon').activate('resource',0,true);story.start();window.restartMascotEntrance?.();};brand.title='重新演示';

window.addEventListener('load',()=>story.start(),{once:true});

// Shared hover state for the same event across visible views.
let linkedPointer=null,linkedFocus=null;
function linkedEvent(target){
 const row=target?.closest?.('#home-events [data-linked-event]');
 if(row)return {keys:[row.dataset.linkedEvent]};
 const anchor=target?.closest?.('#home-timeline-markers .marker-anchor');
 if(anchor)return {keys:[anchor.dataset.eventKey]};
 const tip=target?.closest?.('#home-tips>.optical,#home-tips>.qwen');
 if(tip)return {keys:[tip.classList.contains('optical')?'optical':'qwen']};
 const card=target?.closest?.('#home-workloads .hc-workload.inference');
 if(card&&/^Qwen-1.5B/.test(card.querySelector('.hc-workload-name')?.textContent||'')&&card.querySelector('.hc-workload-progress'))return {keys:['qwen']};
 return null;
}
function paintLinkedEvent(selection){
 const keys=selection?.keys||[];
 document.querySelectorAll('.story-linked-target').forEach(n=>n.classList.remove('story-linked-target'));
 document.querySelectorAll('.story-linked-location').forEach(n=>n.remove());
 document.querySelectorAll('#home-events [data-linked-event]').forEach(n=>{if(keys.includes(n.dataset.linkedEvent))n.classList.add('story-linked-target')});
 document.querySelectorAll('#home-timeline-markers .marker-anchor').forEach(n=>{if(keys.includes(n.dataset.eventKey))n.querySelectorAll('.story-marker').forEach(m=>m.classList.add('story-linked-target'))});
 for(const key of keys){
  document.querySelector('#home-tips>.'+key)?.classList.add('story-linked-target');
  if(key==='qwen')document.querySelectorAll('#home-workloads .hc-workload.inference').forEach(card=>{if(/^Qwen-1.5B/.test(card.querySelector('.hc-workload-name')?.textContent||''))card.classList.add('story-linked-target')});
  if(!['qwen','optical'].includes(key)||(key==='qwen'&&story.get().qwen<5))continue;
  const original=document.querySelector(key==='optical'?'.cabinet-fault-link':'.cabinet-red');
  if(original){const highlight=original.cloneNode(false);highlight.removeAttribute('hidden');highlight.removeAttribute('id');highlight.classList.add('story-linked-location');highlight.alt='';highlight.setAttribute('aria-hidden','true');screen.append(highlight);}
 }
 document.querySelector('#home-room-overview iframe')?.contentWindow?.postMessage({type:'ccae-room-hover',keys,key:keys[0]||null},'*');
}
for(const [enter,leave,isFocus] of [['pointerover','pointerout',false],['focusin','focusout',true]]){
 document.addEventListener(enter,e=>{const selection=linkedEvent(e.target);if(!selection){if(!isFocus&&linkedPointer){linkedPointer=null;paintLinkedEvent(linkedFocus)}return;}if(isFocus)linkedFocus=selection;else linkedPointer=selection;paintLinkedEvent(linkedPointer||linkedFocus);});
 document.addEventListener(leave,e=>{if(!linkedEvent(e.target))return;const selection=linkedEvent(e.relatedTarget);if(isFocus)linkedFocus=selection;else linkedPointer=selection;paintLinkedEvent(linkedPointer||linkedFocus);});
}
window.addEventListener('message',e=>{if(e.source!==document.querySelector('#home-room-overview iframe')?.contentWindow||e.data?.type!=='ccae-room-object-hover')return;const keys=(e.data.keys||[]).filter(k=>['qwen','optical','cabinetD08-0','cabinetD08-1'].includes(k));linkedPointer=keys.length?{keys}:null;paintLinkedEvent(linkedPointer||linkedFocus);});
const clearOnDetailEntry=()=>{if(!screen.querySelector(':scope > .hc-event-module, #optical-event-root:not([hidden]) > .hc-event-module'))return;if(linkedPointer||linkedFocus){linkedPointer=null;linkedFocus=null;paintLinkedEvent(null);}document.querySelectorAll('#home-timeline-markers .story-visible').forEach(n=>n.classList.remove('story-visible'));};
const detailEntryObserver=new MutationObserver(clearOnDetailEntry);detailEntryObserver.observe(screen,{childList:true});const opticalRoot=document.getElementById('optical-event-root');if(opticalRoot)detailEntryObserver.observe(opticalRoot,{childList:true,attributes:true,attributeFilter:['hidden']});
window.addEventListener('blur',()=>{linkedPointer=null;linkedFocus=null;paintLinkedEvent(null)});
window.addEventListener('hc-story-change',()=>paintLinkedEvent(linkedPointer||linkedFocus));
})();

/* Metric cadence and curves from the original demo, lines 864–909. */
(()=>{
 const nodes=[document.querySelector('.energy-metrics .row-quality'),document.querySelector('.health-row:nth-child(2) .row-quality'),document.querySelector('.health-row:first-child .row-quality')];
 let tick=0;
 const rateBases={inference:HOME_WORKLOADS.inference.map(x=>100*Number(x.data.ok)/Number(x.data.total)),training:HOME_WORKLOADS.training.map(x=>parseFloat(x.data.quality))};
 const healthHistory=[[],[]];
 function updateHealth(){
  for(const kind of ['inference','training'])HOME_WORKLOADS[kind].forEach((item,i)=>{
   const leading=kind==='inference'&&i<4;const rate=Math.max(leading?99.91:99.05,Math.min(leading?99.99:99.89,rateBases[kind][i]+Math.sin(tick*.7+i*.17)*(leading?.015:.045)));
   if(kind==='inference'){const total=Number(item.data.total),ok=Math.round(total*rate/100);item.data.ok=String(ok);item.data.fail=String(total-ok);item.data.quality=(100*ok/total).toFixed(2)+'%';}
   else item.data.quality=rate.toFixed(2)+'%';
  });
  const view=document.getElementById('home-workloads');
  if(view&&!view.hidden){const scroll=view.scrollTop;window.refreshWorkloadCards?.();view.scrollTop=scroll;}
 }
 function healthCurve(index,value){const history=healthHistory[index];history.push(value);if(history.length>6)history.shift();while(history.length<6)history.unshift(value);return history.map((v,k)=>(k?'L':'M')+[1,8,15,22,29,37][k]+' '+(11-(v-99)*10).toFixed(3)).join(' ');}

 const spark=(phase,base,amp)=>[1,8,15,22,29,37].map((x,i)=>`${i?'L':'M'}${x} ${(base+Math.sin(phase+i*.82)*amp+Math.cos(phase*.55+i)*.7).toFixed(1)}`).join(' ');
 function updateNumber(node,value,unit){const p=node.querySelector('p');if(p.firstChild?.nodeType===3){if(p.firstChild.nodeValue!==value)p.firstChild.nodeValue=value;}else p.innerHTML=value+'<small>'+unit+'</small>';}
 function paint(){tick+=.42;updateHealth();const values=[100*HOME_WORKLOADS.inference.reduce((sum,item)=>sum+Number(item.data.ok),0)/HOME_WORKLOADS.inference.reduce((sum,item)=>sum+Number(item.data.total),0),HOME_WORKLOADS.training.reduce((sum,item)=>sum+parseFloat(item.data.quality),0)/HOME_WORKLOADS.training.length];values.forEach((value,i)=>{const node=nodes[i+1];updateNumber(node,value.toFixed(2),'%');const svg=node.querySelector('svg'),paths=svg.querySelectorAll('path'),d=healthCurve(i,value);svg.setAttribute('viewBox','0 0 38 13');paths[0].setAttribute('d',d+' L37 13 L1 13 Z');paths[1].setAttribute('d',d);paths[1].setAttribute('stroke-width','1.1')})}
 const primary=nodes[0],secondary=document.querySelectorAll('.energy-metrics .row-quality')[1];
 const groups=[{node:primary,title:'中型模型',range:'14B–32B',limits:[3,8],models:[['Qwen-14B',true,5.60],['DeepSeek-R1-32B',false,12.80]]},{node:secondary,title:'大型模型',range:'70B–130B',limits:[12,30],models:[['Llama-3-70B',true,13.60]]}];
 const colors=['#26b9b0','#3ac58d','#ef535b'];
 const grade=(v,g)=>v<g.limits[0]?0:v<=g.limits[1]?1:2;
 groups.forEach((g,i)=>{g.node.querySelector(':scope > span').textContent=g.title+'百万Token能耗';g.tip=document.createElement('div');g.tip.className='home-ept-tip';g.tip.id='home-ept-tip-'+i;g.tip.setAttribute('role','tooltip');g.node.append(g.tip);g.node.tabIndex=0;g.node.setAttribute('aria-describedby',g.tip.id);});
 const basePaint=paint;
 paint=()=>{basePaint();groups.forEach((g,gi)=>{
 const values=g.models.map((m,i)=>Number((m[2]+Math.sin(tick*.6+i)*.02).toFixed(2))),average=values.reduce((a,b)=>a+b,0)/values.length,color=colors[grade(average,g)];
 updateNumber(g.node,(average/3.6).toFixed(2)+' ','kWh/Mtoken');
 g.node.querySelector(':scope > span').classList.toggle('home-ept-alert-title',grade(average,g)===2);
 const tipHTML='<strong>'+g.title+' '+g.range+' · 百万Token能耗（kWh/Mtoken）</strong>'+g.models.map((m,i)=>'<div class="home-ept-model"><span class="home-ept-model-name">'+m[0]+'</span><span class="home-ept-tag '+(m[1]?'enabled':'disabled')+'">'+(m[1]?'节能中':'未开启节能')+'</span><b style="color:'+colors[grade(values[i],g)]+'">'+(values[i]/3.6).toFixed(2)+'</b></div>').join('')+'<div class="home-ept-legend">'+['&lt;'+(g.limits[0]/3.6).toFixed(2)+' 绿算',(g.limits[0]/3.6).toFixed(2)+'–'+(g.limits[1]/3.6).toFixed(2)+' 正常','&gt;'+(g.limits[1]/3.6).toFixed(2)+' 未达标'].map((label,i)=>'<span><i style="background:'+colors[i]+'"></i>'+label+'</span>').join('')+'</div>';
 if(g.tip.innerHTML!==tipHTML)g.tip.innerHTML=tipHTML;
 const svg=g.node.querySelector('svg'),d=spark(tick+gi,7,2),paths=svg.querySelectorAll('path');svg.setAttribute('viewBox','0 0 38 13');if(paths.length===2){paths[0].setAttribute('d',d+' L37 13 L1 13 Z');paths[0].setAttribute('fill',color);paths[1].setAttribute('d',d);paths[1].setAttribute('stroke',color);}else svg.innerHTML='<path d="'+d+' L37 13 L1 13 Z" fill="'+color+'" opacity=".2"/><path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="1.1"/>';
 });};
 paint();setInterval(()=>{if(!document.hidden&&!document.querySelector('.hc-event-module:not([hidden])'))paint();},1200);
})();

/* Layered WebP choreography from motion-handoff/specs/14-agent-ip.md. */
(()=>{
  const stage=document.querySelector('.agent-motion');
  if(!stage)return;
  const layers=Object.fromEntries([...stage.querySelectorAll('[data-motion]')].map(el=>[el.dataset.motion,el]));
  const timers=new Set();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let ready=false,disposed=false,previous='';
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
  function clear(){timers.forEach(clearTimeout);timers.clear();}
  function replay(key){
    const el=layers[key],base=el.dataset.base||(el.dataset.base=el.src.split('?')[0]);
    el.src=base+'?r='+Math.random();
  }
  function showIP(key){
    replay(key);
    Object.entries(layers).forEach(([name,el])=>{if(name.startsWith('ip-'))el.classList.toggle('on',name===key);});
  }
  function idle(){
    const key=previous==='ip-glasses'?'ip-typing':previous==='ip-typing'?'ip-glasses':Math.random()<.5?'ip-glasses':'ip-typing';
    previous=key;showIP(key);replay('bg-ring');layers['bg-ring'].classList.add('on');
    later(()=>layers['bg-ring'].classList.remove('on'),2805);
    later(idle,(key==='ip-glasses'?2805:3927)+2000+Math.random()*1600);
  }
  function start(){
    clear();if(!ready||disposed)return;
    Object.values(layers).forEach(el=>el.classList.remove('on'));
    if(reduced.matches){stage.classList.add('motion-static');return;}
    stage.classList.remove('motion-static');previous='';
    ['bg-beam','bg-burst-in'].forEach(key=>{replay(key);layers[key].classList.add('on');});
    showIP('ip-wave');
    later(()=>{replay('bg-particles');layers['bg-particles'].classList.add('on');layers['bg-burst-in'].classList.remove('on');},1780);
    later(idle,6996+2400);
  }
  window.restartMascotEntrance=start;
  reduced.addEventListener('change',start);
  ready=true;start();
  window.addEventListener('pagehide',()=>{disposed=true;clear();reduced.removeEventListener('change',start);},{once:true});
})();

/* Motion handoff 13, scene 0. Independent translate/scale preserve layout transforms. */
window.addEventListener('load',()=>{
 const screen=document.getElementById('screen');
 if(!screen)return;
 const groups=[
  ['.agent-panel,#home-metrics',0,700,26,0],
  ['.cabinet-floor-extension,.timeline-backdrop,.cabinet-shade,.cabinet-art,.cabinet-npu-art,.cabinet-hbm-art,.cabinet-energy-art,.cabinet-links,.cabinet-fault-link,.cabinet-red,.node-summary,#home-tips',120,700,26,0],
  ['.timeline,.flip,.cabinet-energy-legend',240,700,26,0],
  ['.guard-summary,.health-metrics,.energy-metrics,#home-events',120,900,22,160]
 ];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 screen.classList.remove('home-entrance-pending');
 if(reduced)return;
 groups.forEach(([selector,delay,duration,dy,stagger])=>{
  screen.querySelectorAll(selector).forEach((el,i)=>{
   const opacity=getComputedStyle(el).opacity;
   const animation=el.animate([
    {opacity:0,translate:`0 ${dy}px`,scale:stagger?'1':'.975'},
    {opacity,translate:'0 0',scale:'1'}
   ],{duration,delay:delay+Math.min(i,7)*stagger,easing:'cubic-bezier(0,0,0,1)',fill:'both'});
   animation.finished.then(()=>animation.cancel()).catch(()=>{});
  });
 });
},{once:true});
/* Preserve the current contour geometry; reuse the reference's visible effect stack. */
(()=>{
 const events=document.getElementById('home-events'),img=document.querySelector('.agent-panel>.panel-contour');if(!events||!img)return;
 const source=decodeURIComponent(escape(atob(img.src.split(',')[1]))),doc=new DOMParser().parseFromString(source,'image/svg+xml');
 const outline=doc.querySelector('clipPath path').getAttribute('d');
 const svg=new DOMParser().parseFromString("<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:html=\"http://www.w3.org/1999/xhtml\" viewBox=\"0 0 474 786\" width=\"474.000000\" height=\"786.000000\" fill=\"none\">\n\t<defs>\n\t\t<g id=\"home-rim-pixso_custom_effect_7906\">\n\t\t\t<effect visibility=\"visible\" effectType=\"backgroundBlur\" saturation=\"0\" stdDeviation=\"48\" />\n\t\t</g>\n\t\t<filter id=\"home-rim-filter_7906\" width=\"474.000000\" height=\"900\" x=\"0.000000\" y=\"0.000000\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n\t\t\t<feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\" />\n\t\t\t<feBlend result=\"shape\" in=\"SourceGraphic\" in2=\"BackgroundImageFix\" mode=\"normal\" />\n\t\t</filter>\n\t\t<clipPath id=\"home-rim-outline_mask_101\" transform=\"matrix(1,0,0,1,-0,-0)\">\n\t\t\t<path fill=\"rgb(255,255,255)\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t\t<path fill=\"rgb(255,255,255)\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t</clipPath>\n\t\t<clipPath id=\"home-rim-clipPath_4228\">\n\t\t\t<rect width=\"458.000000\" height=\"780.000000\" x=\"8.000000\" y=\"6.000000\" rx=\"12.000000\" fill=\"rgb(255,255,255)\" />\n\t\t</clipPath>\n\t\t<g id=\"home-rim-pixso_custom_effect_7907\">\n\t\t\t<effect visibility=\"visible\" effectType=\"gaussianBlur\" stdDeviation=\"6\" />\n\t\t</g>\n\t\t<filter id=\"home-rim-filter_7907\" width=\"470.000000\" height=\"900\" x=\"2.000000\" y=\"0.000000\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n\t\t\t<feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\" />\n\t\t\t<feBlend result=\"shape\" in=\"SourceGraphic\" in2=\"BackgroundImageFix\" mode=\"normal\" />\n\t\t\t<feGaussianBlur stdDeviation=\"2\" result=\"effect_layerBlur_1\" />\n\t\t</filter>\n\t\t<radialGradient id=\"home-rim-paint_radial_134\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-369.695,0,0,-546.655,237.003,683.23)\">\n\t\t\t<stop stop-color=\"rgb(103,150,244)\" offset=\"0\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(0,0,0)\" offset=\"1\" stop-opacity=\"0\" />\n\t\t</radialGradient>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_69\">\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.0953282937\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.346863121\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.396518856\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.423575044\" stop-opacity=\"0\" />\n\t\t\t<stop stop-color=\"rgb(255,102,108)\" offset=\"0.470644027\" stop-opacity=\"0\" />\n\t\t\t<stop stop-color=\"rgb(254,133,103)\" offset=\"0.572409809\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(254,148,102)\" offset=\"0.753119588\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(255,174,102)\" offset=\"0.895024955\" stop-opacity=\"0\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_102\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_70\">\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.0953282937\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.346863121\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.396518856\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.423575044\" stop-opacity=\"0.269999981\" />\n\t\t\t<stop stop-color=\"rgb(170,102,255)\" offset=\"0.470644027\" stop-opacity=\"0.209999993\" />\n\t\t\t<stop stop-color=\"rgb(103,254,234)\" offset=\"0.572409809\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(102,166,254)\" offset=\"0.753119588\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(104,102,255)\" offset=\"0.895024955\" stop-opacity=\"0.200000003\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_103\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_71\">\n\t\t\t<stop stop-color=\"rgb(255,174,102)\" offset=\"0.104975045\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(254,148,102)\" offset=\"0.246880412\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(254,133,103)\" offset=\"0.427590191\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(255,102,108)\" offset=\"0.529356003\" stop-opacity=\"0.209999993\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.576424956\" stop-opacity=\"0.269999981\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.603481174\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.653136849\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.904671729\" stop-opacity=\"1\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_104\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_linear_784\" x1=\"237.000076\" x2=\"237.000076\" y1=\"683.22998\" y2=\"6\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(25,25,25)\" offset=\"0\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(25,25,25)\" offset=\"1\" stop-opacity=\"0\" />\n\t\t</linearGradient>\n\t\t<g id=\"home-rim-pixso_custom_effect_7908\">\n\t\t\t<effect visibility=\"visible\" effectType=\"\" stdDeviation=\"12\" />\n\t\t\t<effect visibility=\"hidden\" effectType=\"gaussianBlur\" stdDeviation=\"6\" />\n\t\t\t<effect x=\"0.000000\" y=\"4.000000\" visibility=\"visible\" fill=\"rgb(0,0,0)\" fill-opacity=\"0.0399999991\" effectType=\"dropShadow\" stdDeviation=\"8\" radius=\"0\" />\n\t\t</g>\n\t\t<filter id=\"home-rim-filter_7908\" width=\"474.000000\" height=\"900\" x=\"0.000000\" y=\"2.000000\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n\t\t\t<feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\" />\n\t\t\t<feColorMatrix result=\"hardAlpha\" in=\"SourceAlpha\" type=\"matrix\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0 \" />\n\t\t\t<feOffset dx=\"0.000000\" dy=\"4.000000\" in=\"hardAlpha\" />\n\t\t\t<feGaussianBlur stdDeviation=\"2.66666675\" />\n\t\t\t<feComposite k2=\"-1\" k3=\"1\" in2=\"hardAlpha\" operator=\"out\" />\n\t\t\t<feColorMatrix type=\"matrix\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0 \" />\n\t\t\t<feBlend result=\"effect_dropShadow_1\" in2=\"BackgroundImageFix\" mode=\"normal\" />\n\t\t\t<feBlend result=\"shape\" in=\"SourceGraphic\" in2=\"effect_dropShadow_1\" mode=\"normal\" />\n\t\t</filter>\n\t\t<radialGradient id=\"home-rim-paint_radial_135\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"matrix(-369.695,0,0,-546.655,237.003,683.23)\">\n\t\t\t<stop stop-color=\"rgb(103,150,244)\" offset=\"0\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(0,0,0)\" offset=\"1\" stop-opacity=\"0\" />\n\t\t</radialGradient>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_72\">\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.0953282937\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.346863121\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.396518856\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.423575044\" stop-opacity=\"0\" />\n\t\t\t<stop stop-color=\"rgb(255,102,108)\" offset=\"0.470644027\" stop-opacity=\"0\" />\n\t\t\t<stop stop-color=\"rgb(254,133,103)\" offset=\"0.572409809\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(254,148,102)\" offset=\"0.753119588\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(255,174,102)\" offset=\"0.895024955\" stop-opacity=\"0\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_105\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_73\">\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.0953282937\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.346863121\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.396518856\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.423575044\" stop-opacity=\"0.269999981\" />\n\t\t\t<stop stop-color=\"rgb(170,102,255)\" offset=\"0.470644027\" stop-opacity=\"0.209999993\" />\n\t\t\t<stop stop-color=\"rgb(103,254,234)\" offset=\"0.572409809\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(102,166,254)\" offset=\"0.753119588\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(104,102,255)\" offset=\"0.895024955\" stop-opacity=\"0.200000003\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_106\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_custom_gradient_74\">\n\t\t\t<stop stop-color=\"rgb(255,174,102)\" offset=\"0.104975045\" stop-opacity=\"0.200000003\" />\n\t\t\t<stop stop-color=\"rgb(254,148,102)\" offset=\"0.246880412\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(254,133,103)\" offset=\"0.427590191\" stop-opacity=\"0.674509823\" />\n\t\t\t<stop stop-color=\"rgb(255,102,108)\" offset=\"0.529356003\" stop-opacity=\"0.209999993\" />\n\t\t\t<stop stop-color=\"rgb(173,102,255)\" offset=\"0.576424956\" stop-opacity=\"0.269999981\" />\n\t\t\t<stop stop-color=\"rgb(137,102,255)\" offset=\"0.603481174\" stop-opacity=\"0.258266091\" />\n\t\t\t<stop stop-color=\"rgb(122,102,255)\" offset=\"0.653136849\" stop-opacity=\"0.326447904\" />\n\t\t\t<stop stop-color=\"rgb(102,160,255)\" offset=\"0.904671729\" stop-opacity=\"1\" />\n\t\t</linearGradient>\n\t\t<mask id=\"home-rim-outline_mask_107\">\n\t\t\t<path fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</mask>\n\t\t<linearGradient id=\"home-rim-paint_linear_785\" x1=\"237.000076\" x2=\"237.000076\" y1=\"683.22998\" y2=\"6\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(46,46,46)\" offset=\"0\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(51,51,51)\" offset=\"1\" stop-opacity=\"0\" />\n\t\t</linearGradient>\n\t\t<linearGradient id=\"home-rim-paint_linear_786\" x1=\"237\" x2=\"237\" y1=\"6\" y2=\"777.000916\" gradientUnits=\"userSpaceOnUse\">\n\t\t\t<stop stop-color=\"rgb(255,255,255)\" offset=\"0\" stop-opacity=\"1\" />\n\t\t\t<stop stop-color=\"rgb(255,255,255)\" offset=\"1\" stop-opacity=\"0\" />\n\t\t</linearGradient>\n\t</defs>\n\t<rect id=\"home-rim-3.2 底板\" width=\"458.000000\" height=\"677.000000\" x=\"8.000000\" y=\"6.000000\" />\n\t<g data-pixso-skip-parse=\"true\">\n\t\t<foreignObject width=\"474.000000\" height=\"786.000000\" x=\"0.000000\" y=\"0.000000\">\n\t\t\t<html:div style=\"clip-path:url(#home-rim-outline_mask_101);height:100%;backdrop-filter:blur(24.000000px);width:100%;-webkit-backdrop-filter:blur(24.000000px);\" />\n\t\t</foreignObject>\n\t</g>\n\t<g id=\"home-rim-容器 8\" filter=\"url(#home-rim-filter_7906)\">\n\t\t<rect id=\"home-rim-容器 8\" width=\"458.000000\" height=\"780.000000\" x=\"8.000000\" y=\"6.000000\" rx=\"12.000000\" />\n\t\t<g filter=\"url(#home-rim-filter_7907)\">\n\t\t\t<path id=\"home-rim-合并\" fill=\"rgb(59,59,59)\" fill-opacity=\"0.219999999\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"url(#home-rim-paint_radial_134)\" fill-opacity=\"0\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_67\" opacity=\"0\" mask=\"url(#home-rim-outline_mask_102)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 204.780151deg, rgb(102,160,255) 0%, rgb(122,102,255) 30.855%, rgb(137,102,255) 35.5562%, rgb(173,102,255) 37.7265%, rgb(255,102,108) 41.1191%, rgb(254,133,103) 48.2016%, rgb(254,148,102) 68.5778%, rgb(255,174,102) 85.4297%, rgb(102,160,255) 100%);mask:conic-gradient(from 204.780151deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.326448) 30.855%, rgba(255,255,255,0.258266) 35.5562%, rgba(255,255,255,0) 37.7265%, rgba(255,255,255,0) 41.1191%, rgba(255,255,255,0.67451) 48.2016%, rgba(255,255,255,1) 68.5778%, rgba(255,255,255,0) 85.4297%, rgba(255,255,255,1) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_68\" opacity=\"0\" mask=\"url(#home-rim-outline_mask_103)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 204.780151deg, rgb(102,160,255) 0%, rgb(122,102,255) 30.855%, rgb(137,102,255) 35.5562%, rgb(173,102,255) 37.7265%, rgb(170,102,255) 41.1191%, rgb(103,254,234) 48.2016%, rgb(102,166,254) 68.5778%, rgb(104,102,255) 85.4297%, rgb(102,160,255) 100%);mask:conic-gradient(from 204.780151deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.326448) 30.855%, rgba(255,255,255,0.258266) 35.5562%, rgba(255,255,255,0.27) 37.7265%, rgba(255,255,255,0.21) 41.1191%, rgba(255,255,255,0.67451) 48.2016%, rgba(255,255,255,1) 68.5778%, rgba(255,255,255,0.2) 85.4297%, rgba(255,255,255,1) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_69\" mask=\"url(#home-rim-outline_mask_104)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 207.672974deg, rgb(255,174,102) 0%, rgb(254,148,102) 16.8518%, rgb(254,133,103) 37.2281%, rgb(255,102,108) 44.3106%, rgb(173,102,255) 47.7032%, rgb(137,102,255) 49.8735%, rgb(122,102,255) 54.5747%, rgb(102,160,255) 85.4297%, rgb(255,174,102) 100%);mask:conic-gradient(from 207.672974deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,1) 16.8518%, rgba(255,255,255,0.67451) 37.2281%, rgba(255,255,255,0.21) 44.3106%, rgba(255,255,255,0.27) 47.7032%, rgba(255,255,255,0.258266) 49.8735%, rgba(255,255,255,0.326448) 54.5747%, rgba(255,255,255,1) 85.4297%, rgba(255,255,255,0.2) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.150000006\" stroke-width=\"1\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"url(#home-rim-paint_linear_784)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</g>\n\t\t<g filter=\"url(#home-rim-filter_7908)\">\n\t\t\t<path id=\"home-rim-合并\" fill=\"rgb(59,59,59)\" fill-opacity=\"0.219999999\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"url(#home-rim-paint_radial_135)\" fill-opacity=\"0\" fill-rule=\"evenodd\" data-contour=\"\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_70\" opacity=\"0\" mask=\"url(#home-rim-outline_mask_105)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 204.780151deg, rgb(102,160,255) 0%, rgb(122,102,255) 30.855%, rgb(137,102,255) 35.5562%, rgb(173,102,255) 37.7265%, rgb(255,102,108) 41.1191%, rgb(254,133,103) 48.2016%, rgb(254,148,102) 68.5778%, rgb(255,174,102) 85.4297%, rgb(102,160,255) 100%);mask:conic-gradient(from 204.780151deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.326448) 30.855%, rgba(255,255,255,0.258266) 35.5562%, rgba(255,255,255,0) 37.7265%, rgba(255,255,255,0) 41.1191%, rgba(255,255,255,0.67451) 48.2016%, rgba(255,255,255,1) 68.5778%, rgba(255,255,255,0) 85.4297%, rgba(255,255,255,1) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_71\" opacity=\"0\" mask=\"url(#home-rim-outline_mask_106)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 204.780151deg, rgb(102,160,255) 0%, rgb(122,102,255) 30.855%, rgb(137,102,255) 35.5562%, rgb(173,102,255) 37.7265%, rgb(170,102,255) 41.1191%, rgb(103,254,234) 48.2016%, rgb(102,166,254) 68.5778%, rgb(104,102,255) 85.4297%, rgb(102,160,255) 100%);mask:conic-gradient(from 204.780151deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.326448) 30.855%, rgba(255,255,255,0.258266) 35.5562%, rgba(255,255,255,0.27) 37.7265%, rgba(255,255,255,0.21) 41.1191%, rgba(255,255,255,0.67451) 48.2016%, rgba(255,255,255,1) 68.5778%, rgba(255,255,255,0.2) 85.4297%, rgba(255,255,255,1) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(0,0,0)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t\t\t<g id=\"home-rim-custom_gradient_72\" mask=\"url(#home-rim-outline_mask_107)\">\n\t\t\t\t<g>\n\t\t\t\t\t<foreignObject width=\"458.000153\" height=\"677.229980\" x=\"8.000000\" y=\"6.000000\">\n\t\t\t\t\t\t<html:div style=\"background:conic-gradient(from 207.672974deg, rgb(255,174,102) 0%, rgb(254,148,102) 16.8518%, rgb(254,133,103) 37.2281%, rgb(255,102,108) 44.3106%, rgb(173,102,255) 47.7032%, rgb(137,102,255) 49.8735%, rgb(122,102,255) 54.5747%, rgb(102,160,255) 85.4297%, rgb(255,174,102) 100%);mask:conic-gradient(from 207.672974deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,1) 16.8518%, rgba(255,255,255,0.67451) 37.2281%, rgba(255,255,255,0.21) 44.3106%, rgba(255,255,255,0.27) 47.7032%, rgba(255,255,255,0.258266) 49.8735%, rgba(255,255,255,0.326448) 54.5747%, rgba(255,255,255,1) 85.4297%, rgba(255,255,255,0.2) 100%);width:100%;height:100%;\" />\n\t\t\t\t\t</foreignObject>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"rgb(255,255,255)\" stroke-opacity=\"0.150000006\" stroke-width=\"1\" />\n\t\t\t<path id=\"home-rim-合并\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"url(#home-rim-paint_linear_785)\" stroke-opacity=\"1\" stroke-width=\"1\" />\n\t\t</g>\n\t\t<path id=\"home-rim-合并\" opacity=\"0\" fill=\"none\" fill-rule=\"evenodd\" data-contour=\"\" stroke=\"url(#home-rim-paint_linear_786)\" stroke-opacity=\"0\" stroke-width=\"1\" />\n\t</g>\n</svg>",'image/svg+xml').documentElement;
 // Draw the rim once, outside the reference's clipped foreignObject/filter stack.
 // Native SVG strokes avoid foreignObject mask failures in offline browsers.
 const ns='http://www.w3.org/2000/svg';
 svg.querySelectorAll('g[mask]').forEach(el=>el.remove());
 svg.querySelectorAll('[data-contour][stroke]').forEach(el=>el.remove());
 const defs=svg.querySelector('defs');
 const gradient=document.createElementNS(ns,'linearGradient');gradient.id='home-native-rim';
 gradient.setAttribute('x1','0');gradient.setAttribute('y1','0');gradient.setAttribute('x2','1');gradient.setAttribute('y2','0');
 gradient.innerHTML='<stop stop-color="#fe9466" stop-opacity=".45"/><stop offset=".48" stop-color="#ad66ff" stop-opacity=".25"/><stop offset="1" stop-color="#66a0ff" stop-opacity=".5"/>';defs.append(gradient);
 const fade=document.createElementNS(ns,'linearGradient');fade.id='home-native-rim-fade';fade.setAttribute('x1','0');fade.setAttribute('y1','0');fade.setAttribute('x2','0');fade.setAttribute('y2','1');
 fade.innerHTML='<stop stop-color="white"/><stop offset=".3" stop-color="white"/><stop offset="1" stop-color="black"/>';defs.append(fade);
 const mask=document.createElementNS(ns,'mask');mask.id='home-native-fade-mask';mask.innerHTML='<rect width="474" height="786" fill="url(#home-native-rim-fade)"/>';defs.append(mask);
 const rim=document.createElementNS(ns,'path');rim.setAttribute('data-contour','');rim.setAttribute('fill','none');rim.setAttribute('stroke','url(#home-native-rim)');rim.setAttribute('stroke-width','1.5');rim.setAttribute('stroke-linejoin','round');rim.setAttribute('mask','url(#home-native-fade-mask)');svg.append(rim);
svg.classList.add('panel-contour');svg.setAttribute('aria-hidden','true');svg.style.pointerEvents='none';img.replaceWith(svg);
 function fit(){
  const bottom=Math.max(880,events.parentElement.clientHeight-78,events.offsetTop+events.offsetHeight+22),shift=bottom-109-755.23;let axis=0;
  const d=outline.replace(/[A-Za-z]|-?\d*\.?\d+/g,t=>{if(/^[A-Za-z]$/.test(t)){axis=0;return t;}const value=Number(t);return String(axis++%2===1&&value>700?value+shift:value);});
  svg.querySelectorAll('[data-contour]').forEach(p=>p.setAttribute('d',d));
  const rimBottom=755.23+shift;svg.setAttribute('viewBox','0 0 474 '+(rimBottom+8));svg.style.height=(rimBottom+8)+'px';svg.querySelectorAll('clipPath rect').forEach(el=>el.setAttribute('height',rimBottom));
  mask.querySelector('rect').setAttribute('height',rimBottom); 
  svg.querySelectorAll('foreignObject[x="8.000000"]').forEach(el=>el.setAttribute('height',rimBottom-6));
  svg.querySelectorAll('linearGradient[y1="683.22998"]').forEach(el=>el.setAttribute('data-bottom-gradient',''));
  svg.querySelectorAll('[data-bottom-gradient]').forEach(el=>el.setAttribute('y1',rimBottom));
 }
 new ResizeObserver(fit).observe(events);new MutationObserver(fit).observe(events,{childList:true,subtree:true});fit();
})();

const ENERGY_CABINET=document.querySelector('#screen>.cabinet-art').src;
/* 独立节能演示状态，不读写公共故障时间轴。每次 advance 代表一秒可见运行。 */
(function (global) {
  'use strict';
  function time(seconds, base = 10 * 3600 + 17 * 60 + 14) {
    const s = base + seconds;
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':');
  }
  function create(name, data, processing = false) {
    return {name, data, base:processing?12*3600+6:10*3600+17*60+14, effectiveAt:processing?null:'10:17:14', stage:processing ? 0 : 4, elapsed:0, stageElapsed:0,
      chartTick:0, logElapsed:0, logs:[], liveTick:0, history:null, expanded:false,
      report:null, reports:[], reportElapsed:0, tab:'service',
      expandedSteps:new Set(), prompt:true, monitorOpen:true, composerText:''};
  }
  function snapshot(s) {
    const n=s.liveTick;
    const request=Math.round(1840+Math.sin(n*.37)*120);
    const baselinePower=+(request*(44/1840)).toFixed(2),optimizedPower=+(request*(39/1840)).toFixed(2);
    const effective=s.effectiveAt?s.effectiveAt.split(':').reduce((a,n)=>a*60+Number(n),0)-s.base:Infinity;
    const blend=Math.max(0,Math.min(1,(s.elapsed-effective)/8));
    const power=+(baselinePower*(1-blend)+optimizedPower*blend).toFixed(2);
    return {time:time(s.elapsed,s.base),request,
      power,baselinePower,optimizedPower,npu:+(67+Math.sin(n*.31)*7).toFixed(1),cpu:+(52+Math.sin(n*.21)*6).toFixed(1)};
  }
  function nodeState(s,index,second=s.elapsed) {
    const state={npu:1.4,cpu:2.4,status:'稳定运行',at:null};
    for(const log of s.logs){
      if(log.nodeIndex!==index||log.second>second)continue;
      state.status=[log.rise?'预测请求上升':'预测请求量下降','NPU/CPU调频','服务验证无异常'][log.kind];state.at=log.second;state.kind=log.kind;
      state.policy=log.policy;state.targetNpu=log.toNpu;state.targetCpu=log.toCpu;
      if(log.kind>0){state.npu=log.toNpu;state.cpu=log.toCpu;}
    }
    if(state.kind===2&&second-state.at>=4)state.status='稳定运行';
    return state;
  }
  function appendLog(s) {
    if(s.logs.length>=9)return;
    const i=s.logs.length,round=Math.floor(i/3),kind=i%3,count=Math.max(1,Math.ceil(Number(s.data.npu)/8));
    const nodeIndex=[0,1,3][round]%count,ip=`112.34.${nodeIndex%2?14:13}.${nodeIndex+2}`;
    const prior=kind?s.logs[i-kind]:null,before=nodeState(s,nodeIndex);
    const now=snapshot(s),previous=snapshot({...s,elapsed:s.elapsed-5,liveTick:s.liveTick-5});
    const rise=false;
    const fromNpu=prior?prior.fromNpu:before.npu,fromCpu=prior?prior.fromCpu:before.cpu;
    const toNpu=prior?prior.toNpu:rise?1.6:1.3,toCpu=prior?prior.toCpu:rise?2.6:2.2;
    const policy=rise?'均衡模式升频策略':'均衡模式降频策略';
    const currentRequest=prior?prior.currentRequest:Number((.48+nodeIndex*.01).toFixed(2));
    const predictedRequest=prior?prior.predictedRequest:Number((currentRequest*(rise?1.2:.52)).toFixed(2));
    const plannedSecond=prior?prior.plannedSecond:s.elapsed+15*60;
    const plannedTime=time(plannedSecond,s.base);
    const titles=[`${ip} 预测15分钟后请求量${rise?'上升':'下降'}`,`${ip} 请求量与预测一致，启动调频`,`${ip} 验证业务影响：无异常`];
    const descriptions=[`当前请求量为 ${currentRequest} 个/s，预测 15 分钟后请求量${rise?'增至':'降至'} ${predictedRequest} 个/s。我将在 ${plannedTime} 调整 NPU、CPU 频率，以适应${rise?'请求增长，保障服务性能':'低负载变化，降低能耗'}`,`当前检测到请求量为 ${predictedRequest} 个/s，与预测一致，启动${policy}：将 NPU 频率调整至 ${toNpu} GHz、CPU 频率调整至 ${toCpu} GHz，继续监控运行效果`,`该节点的 NPU、CPU 按${policy}稳定运行，服务时延满足约束，继续节能守护`];
    s.logs.push({title:titles[kind],description:descriptions[kind],metrics:now,nodeIndex,second:s.elapsed,kind,rise,policy,fromNpu,fromCpu,toNpu,toCpu,currentRequest,predictedRequest,plannedSecond});
  }
  function requestReport(s, question) {
    if(s.report&&!s.report.done)return false;
    s.monitorOpen=false;s.prompt=false;s.composerText='';s.report={question,step:0,done:false};
    s.reports.push(s.report);s.reportElapsed=0;return true;
  }
  function advance(s) {
    const changed={stage:false,logs:false,report:false};
    s.elapsed++;s.liveTick++;s.chartTick=(s.chartTick||0)+1;
    if(s.stage<4){
      if(++s.stageElapsed>=4){s.stageElapsed=0;s.stage++;changed.stage=true;
        if(s.stage===4){s.effectiveAt=time(s.elapsed,s.base);s.expandedSteps.clear();appendLog(s);changed.logs=true;}}
    }else{
      s.logElapsed++;
      if(s.logs.length<9&&s.logElapsed>=(s.logs.length%3===0?9:4)){
        s.logElapsed=0;
        // Compress the forecast wait for the demo while keeping event timestamps consistent.
        if(s.logs.length%3===1){const target=s.logs[s.logs.length-1].plannedSecond;const jump=Math.max(0,target-s.elapsed);s.elapsed+=jump;s.liveTick+=jump;}
        appendLog(s);changed.logs=true;
      }
    }
    if(s.report&&!s.report.done&&++s.reportElapsed>=1){
      s.reportElapsed=0;s.report.step++;changed.report=true;
      if(s.report.step>=4)s.report.done=true;
    }
    return changed;
  }
  function runtimeWindow(s) {
    const now=s.history===null?s.elapsed:s.logs[s.history].metrics.time.split(':').reduce((a,n)=>a*60+Number(n),0)-s.base;
    const start=Math.floor(now/5)*5-110;
    return {now,samples:Array.from({length:43},(_,i)=>{const second=start+i*5;return {second,...snapshot({...s,elapsed:second,liveTick:second})};})};
  }
  function nodeSeries(s,index,second,hours=4){
    const end=s.base+second,start=end-hours*3600,capacity=.5+index*.01;
    const logs=s.logs.filter(l=>l.nodeIndex===index&&l.second<=second),forecasts=logs.filter(l=>l.kind===0);
    function point(at){
      const hour=at/3600,dayHour=((hour%24)+24)%24;
      const forecastAt=s.base+([0,1,3].includes(index)?[0,927,1846][[0,1,3].indexOf(index)]:900+index*240);
      // Historical load rises from light through medium to heavy before the forecast decline.
      const ramp=Math.max(0,Math.min(1,(at-(forecastAt-4*3600))/(2.5*3600)));
      let request=capacity*(at<forecastAt?Math.min(.99,.16+.82*ramp+.008*Math.sin(hour*2+index)):.54+.015*Math.sin(hour*2+index));
      if(at<forecastAt){
        if((index===0||index===3)&&at<start+3600)request=capacity*(.20+.04*Math.max(0,(at-start)/3600));
        else request=Math.max(request,capacity*.34);
      }
      for(const f of forecasts){const from=s.base+f.second,to=s.base+f.plannedSecond;if(at<from)continue;
        const blend=Math.min(1,(at-from)/(to-from));request=f.currentRequest+(f.predictedRequest-f.currentRequest)*blend;
        if(at>to)request+=Math.sin((at-to)/180+index)*Math.min(.005,(at-to)/100000);
      }
      request=Number(Math.max(0,request).toFixed(3));
      // Keep demo samples within the three explicitly defined rate bands.
      if(request>=.15&&request<.2)request=.2;
      if(request>.3&&request<=.4)request=.42;
      const load=Math.min(1,request/capacity),kind=request<.15?'light':request>.4?'heavy':'medium';
      // Historical light/medium intervals already run under ongoing frequency control.
      // A new forecast cannot change savings until its adjustment is applied.
      const pending=forecasts.find(f=>at>=s.base+f.second&&at<s.base+f.plannedSecond);
      const lastAdjustment=logs.filter(l=>l.kind===1&&s.base+l.second<=at).at(-1);
      const gain=lastAdjustment?Math.min(1,(at-s.base-lastAdjustment.second)/1800):1;
      return {at,request,kind,saving:pending||kind==='heavy'?0:(1-load)*(index%3===0?1.5:1.35)*gain};
    }
    const points=Array.from({length:hours*2},(_,k)=>point(start+(k+.5)*1800));
    // Decode nodes include 30–60 minutes of historical light load per four hours.
    if(index%3!==0){
      const count=index%2===0?2:1;
      points.slice(0,count).forEach((p,k)=>{
        p.request=Number((.105+index*.004+k*.01).toFixed(3));p.kind='light';
        p.saving=(1-p.request/capacity)*1.35;
      });
    }
    // Keep roughly one third of the demo window heavy, nearest the load decline.
    const heavyLimit=Math.round(points.length/3),heavy=points.filter(p=>p.kind==='heavy');
    heavy.slice(0,Math.max(0,heavy.length-heavyLimit)).forEach((p,k)=>{
      p.request=Number((.24+.02*(k%3)).toFixed(2));p.kind='medium';
      p.saving=(1-p.request/capacity)*(index%3===0?1.5:1.35);
    });
    return {start,end,points,events:logs.filter(l=>l.kind===1).map(l=>({...point(s.base+l.second),second:l.second,time:time(l.second,s.base),npu:l.toNpu,cpu:l.toCpu})).filter(p=>p.at>=start&&p.at<=end)};
  }
  const api={nodeSeries,nodeState,time,create,snapshot,appendLog,requestReport,advance,runtimeWindow};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else global.HCEnergyState=api;
})(typeof window==='object'?window:globalThis);

/* 节能原型：服务状态相互隔离，关闭暂停计时，再次进入恢复；不接管故障时钟。 */
(() => {
  'use strict';
  const screen = document.getElementById('screen');
  const root = document.createElement('section');
  root.id = 'hc-energy-root'; root.hidden = true;
  root.setAttribute('aria-label', '节能服务详情'); screen.append(root);
  const reportIcons = {"energy-total": "./assets/uploads/149-129774.png", "energy-gain": "./assets/uploads/149-129806.png", "energy-leaf": "./assets/uploads/149-129790.png", "energy-report": "./assets/uploads/149-129722.png"};
  reportIcons['good-arrow']='./assets/uploads/149-129458.png';
  const reportIcon = name => {const n=document.createElement('img');n.src=reportIcons[name];n.alt='';return n;};
  const sessions = new Map();
  const stepNames = ['节能机会识别', '生成节能策略', '方案决策', '方案下发'];
  const reportSteps = ['汇总8月服务能耗与运行数据', '核对节能策略执行记录', '计算节省能耗与节能收益', '生成8月节能月报'];
  let current = null, timer = null, lastFocus = null, returnToEvents = false;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const button = (text, fn, cls = '') => { const n = el('button', cls, text); n.type = 'button'; n.onclick = fn; return n; };
  const icon = (name) => { const n = el('img'); n.src = HC_ASSETS.icons[name] || HC_ASSETS.icons['绿色叶子']; n.alt = ''; return n; };
  const E=window.HCEnergyState, time=E.time, snapshot=E.snapshot, appendLog=E.appendLog;
  const service = name => HOME_WORKLOADS.inference.find(x => x.data.name === name)?.data || {name, npu:'128', energyTotal:'1280 kWh', energySaved:'163 kWh', energyGain:'11.3 %', ttft:'2.5 ms', tpot:'12.3 ms'};
  function getSession(name, processing = false) {
    if (!sessions.has(name)) sessions.set(name, E.create(name, service(name), processing));
    return sessions.get(name);
  }
  const eventSession = getSession('Qwen-14B', false);
  function syncSavingServices(){
    const data=HOME_WORKLOADS.inference.find(x=>x.data.name==='Qwen-14B').data;data.energySaving=eventSession.stage===4;
    const count=HOME_WORKLOADS.inference.filter(x=>x.data.energySaving).length;
    const value=document.querySelector('.hc-metric-group[data-category="inference"]')?.querySelectorAll('.hc-metric-content>b')[5];if(value)value.textContent=count;
    window.refreshWorkloadCards?.();
  }
  function notifyEvents() { syncSavingServices(); for(const session of sessions.values())window.dispatchEvent(new CustomEvent('hc-energy-change', {detail:{name:session.name, done:session.stage === 4, time:session.effectiveAt}})); window.renderStoryGuard?.();syncHome(); }
  function tick() {
    if(!current||root.hidden)return;
    const changed=E.advance(current);
    if(changed.stage){notifyEvents();render();}
    else if(changed.logs)renderLogs();
    updateLive();
    if(changed.report)renderChat();
  }
  function close() { clearInterval(timer); timer = null; root.hidden = true; root.replaceChildren(); current = null; lastFocus?.focus?.({preventScroll:true}); }
  function open(name, processing = false) {
    if(name==='Qwen-14B'&&eventSession.stage<4)return;
    clearInterval(timer); window.closeOpticalEvent?.(); window.closeNicEvent?.();
    lastFocus = document.activeElement; returnToEvents = !document.getElementById('guard-all').hidden;
    current = getSession(name, processing); root.hidden = false;
    if (current.stage === 4 && !current.logs.length) appendLog(current);
    render();
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const entries=[...root.querySelectorAll('.hc-energy-left-scroll>.hc-energy-step>summary,.hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-logs,.hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-substeps,.hc-energy-prompt,.hc-energy-chat>*')];
      entries.forEach((node,i)=>{node.style.setProperty('--evt-enter-delay',`${i*70}ms`);node.classList.add('hc-energy-left-enter');});
    }
    timer = setInterval(tick, 1000); root.querySelector('.hc-energy-back')?.focus({preventScroll:true});
  }
  window.openEnergyService = data => {open(data.name);};
  window.openEnergyEvent = item => open(item.object.split(' / ').pop(), item.stateClass === 'energy-wait');
  window.closeEnergyDetail = close;
  window.getEnergyEventState = name => { const s = sessions.get(name); return s ? {done:s.stage === 4, time:s.effectiveAt} : null; };
  reportIcons['strategy-1']='./assets/uploads/149-129557.png';
  reportIcons['strategy-2']='./assets/uploads/149-129560.png';
  reportIcons['strategy-3']='./assets/uploads/149-129562.png';
  function strategy(title, gain, impact, recommended = false) {
    const n = el('div', 'hc-energy-strategy hc-energy-forecast' + (recommended ? ' recommended' : ''));
    n.append(el('h3', '', title)); const dl = el('dl');
    // 策略预测采用同一服务基线，演示不同模式下的能耗与时延取舍。
    const data=current.data,ratio=title==='深度节能'?1.04:title==='性能优先'?.97:1;
    const daily=(parseFloat(data.energyTotal)*(1-parseFloat(gain)/100)).toFixed(2)+' kWh';
    [['预测单日能耗',daily],['预测节能增益',gain],['预测TTFT',(parseFloat(data.ttft)*ratio).toFixed(1)+' ms'],['预测TPOT',(parseFloat(data.tpot)*ratio).toFixed(1)+' ms']].forEach(([k,v],index) => {const d=el('div'),dd=el('dd','',v.split(' ↑ ')[0]);const delta=el('small','hc-energy-delta'),arrow=reportIcon('good-arrow');arrow.className='hc-energy-change-arrow';const direction=index===0?'down':index===1?'up':ratio>1?'up':ratio<1?'down':'flat';arrow.style.transform=direction==='down'?'rotate(180deg)':direction==='flat'?'rotate(90deg)':'';arrow.alt=direction==='down'?'下降':direction==='up'?'上升':'持平';if(index>1&&ratio>1)arrow.style.filter='hue-rotate(230deg)';delta.append(arrow);if(v.includes(' ↑ '))delta.append(document.createTextNode(v.split(' ↑ ')[1]));dd.append(delta);d.append(el('dt','',k),dd);dl.append(d);});
    n.append(dl);const art=el('div','hc-energy-strategy-art');art.append(reportIcon('strategy-'+(title==='深度节能'?2:title==='性能优先'?3:1)));n.append(art);return n;
  }
  function renderStep(s, i) {
    const d = el('details','hc-energy-step'); d.dataset.state = i < s.stage ? 'done' : i === s.stage ? 'working' : 'waiting';
    d.open = true;
    const summary = el('summary','',stepNames[i]);summary.addEventListener('click',e=>e.preventDefault());
    const status=d.dataset.state;summary.prepend(stepIcon(status));summary.append(el('time','hc-energy-step-time',time(i*4,s.base)),el('span','hc-energy-state '+status,i<s.stage?'已完成':i===s.stage?'自动处理中':'待执行'));
    d.append(summary);
    if (i === 0) d.append(el('p','','识别到请求存在如下特征：凌晨 1 点到 6 点请求量较低，最低 0.1 次/秒，符合轻度负载特征'));
    if (i === 1) d.append(strategy('均衡模式','11.3% ↑ 4.8%','低',true),strategy('深度节能','14.8% ↑ 8.3%','中'),strategy('性能优先','9.1% ↑ 2.6%','极低'));
    if (i === 2) {
      d.append(el('p','','均衡模式满足业务性能约束，按以下配置自动执行'));
      const config=el('div','hc-energy-strategy hc-energy-config'),fields=el('dl');
      config.append(el('h3','','节能策略配置'));
      [['优先模式','均衡模式'],['执行方式','自动下发']].forEach(([label,value])=>{const row=el('div');row.append(el('dt','',label),el('dd','',value));fields.append(row);});
      config.append(fields);d.append(config);
    }
    if (i === 3) d.append(el('p','', i < s.stage ? '已向目标服务器下发均衡模式配置，开启运行态节能，并与空闲态策略协同运行' : '向目标服务器下发均衡模式配置，开启运行态节能，并与空闲态策略协同运行'));
    window.HCEvidence?.attach(d,stepNames[i],i<s.stage);
    if(i===s.stage&&s.stage<4){
      s.typedSteps ||= new Set();
      if(!s.typedSteps.has(i)){
        s.typedSteps.add(i);
        const walker=document.createTreeWalker(d,NodeFilter.SHOW_TEXT),parts=[];
        while(walker.nextNode()){const node=walker.currentNode;if(node.textContent.trim()&&!node.parentElement.closest('time,.hc-energy-state'))parts.push({node,text:node.textContent});}
        let total=0;parts.forEach(p=>{p.offset=total;total+=p.text.length;});
        // Reveal each panel and its decorations only when its own copy starts.
        const gates=[...d.querySelectorAll('summary,p,.hc-energy-strategy,.hc-energy-strategy dl>div,img,.hc-energy-step-icon')].map(node=>{
          const host=node.matches('img,.hc-energy-step-icon')?(node.closest('summary,dd,.hc-energy-strategy')||node.parentElement):node;
          const first=parts.find(p=>host.contains(p.node));
          return {node,offset:first?.offset??total,visibility:node.style.visibility};
        });
        gates.forEach(g=>g.node.style.visibility='hidden');
        parts.forEach(p=>p.node.textContent='');
        let start;
        const reveal=now=>{if(!d.isConnected||root.hidden||current!==s){s.typedSteps.delete(i);return;}start ??= now;const shown=Math.floor(Math.min(1,(now-start)/2400)*total);gates.forEach(g=>g.node.style.visibility=shown>g.offset||shown===total?g.visibility:'hidden');let remaining=shown;for(const p of parts){p.node.textContent=p.text.slice(0,Math.max(0,remaining));remaining-=p.text.length;}if(now-start<2400)requestAnimationFrame(reveal);};
        requestAnimationFrame(reveal);
      }
    }
    d.addEventListener('toggle',()=>{ if(!d.isConnected)return;if(d.open)s.expandedSteps.add(i); else s.expandedSteps.delete(i); });
    return d;
  }
  function render() {
    const s=current, oldScroll=root.querySelector('.hc-energy-left-scroll')?.scrollTop || 0;
    root.dataset.phase=s.stage<4?'strategy':'monitor';root.replaceChildren();
    const left=el('aside','hc-energy-left'), heading=el('div','hc-energy-heading');
    const titles=el('div'); titles.append(el('h1','',s.stage<4?'节能策略自动优化':s.name),el('p','',s.stage<4?s.name+' · 自动处理中':'均衡策略守护中 · 生效时间 '+s.effectiveAt));
    const headingIcon=el('span','hc-energy-heading-icon');headingIcon.append(icon('叶子-圆底托'));const back=button('',()=>close(),'hc-energy-back');back.setAttribute('aria-label','返回');back.innerHTML="<svg aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\"><path d=\"M9.1 2.35 1.45 10l7.65 7.65M1.5 10h18\" stroke=\"#dfdfdf\" stroke-width=\"2.08\" stroke-linejoin=\"round\"/></svg>";heading.append(back,headingIcon,titles);left.append(heading);
    const scroll=el('div','hc-energy-left-scroll');
    const strategyGroup=el('details','hc-energy-step hc-energy-strategy-group');
    const groupState=s.stage===4?'done':'working';strategyGroup.dataset.state=groupState;strategyGroup.open=s.strategyGroupOpen??(s.stage<4);
    const groupTitle=el('summary','','节能机会识别并下发策略');groupTitle.prepend(stepIcon(groupState));groupTitle.append(el('span','hc-energy-state '+groupState,s.stage===4?'已完成':'自动处理中'));strategyGroup.append(groupTitle);
    const substeps=el('div','hc-energy-substeps');stepNames.slice(0,Math.min(s.stage+1,stepNames.length)).forEach((_,i)=>substeps.append(renderStep(s,i)));strategyGroup.append(substeps);
    strategyGroup.addEventListener('toggle',()=>{if(strategyGroup.isConnected)s.strategyGroupOpen=strategyGroup.open;});scroll.append(strategyGroup);
    if(s.stage===4){
      const monitor=el('details','hc-energy-step');monitor.dataset.state='working';monitor.open=s.monitorOpen;
      const monitorTitle=el('summary','','运行监控');monitorTitle.prepend(stepIcon('working'));monitorTitle.append(el('span','hc-energy-state working hc-energy-watching','守护中'));monitor.append(monitorTitle);const logs=el('div','hc-energy-logs');logs.setAttribute('aria-label','运行日志');monitor.append(logs,el('div','hc-energy-log-actions'));
      monitor.addEventListener('toggle',()=>{s.monitorOpen=monitor.open;});scroll.append(monitor);
    }
    scroll.append(el('div','hc-energy-chat'));left.append(scroll);
    const composer=el('form','hc-energy-composer');
    if(s.prompt&&s.stage===4){const prompt=el('div','hc-energy-prompt');prompt.append(el('span','','需要帮你统计 8 月集群节能情况并生成报告吗？'),button('需要',()=>requestReport('请统计 8 月集群节能情况并生成报告')));left.append(prompt);}
    const inputRow=el('div','hc-energy-input-row'),input=el('input');input.placeholder='输入问题或输入“/”触发提示词';input.setAttribute('aria-label','报告问题');input.maxLength=2000;input.value=s.composerText;
    input.oninput=()=>{s.composerText=input.value;};
    const send=button('',()=>submit());const sendIcon=icon('发送-禁用态');send.append(sendIcon);const syncSend=()=>{send.disabled=!input.value.trim();sendIcon.src=HC_ASSETS.icons[send.disabled?'发送-禁用态':'发送-正常态'];};input.addEventListener('input',syncSend);syncSend();send.setAttribute('aria-label','发送报告问题');inputRow.append(input,send);composer.append(inputRow);
    const submit=()=>{const text=input.value.trim();if(!text)return;if(/报告|月报|节能|能耗/.test(text)){requestReport(text);}else{input.setCustomValidity('请输入节能、能耗或报告相关问题');input.reportValidity();}};
    input.addEventListener('input',()=>input.setCustomValidity(''));composer.onsubmit=e=>{e.preventDefault();submit();};left.append(composer);
    root.append(left,el('main','hc-energy-right'));renderLogs();renderChat();renderRight();scroll.scrollTop=oldScroll;
  }
  function renderLogs() {
    const s=current,box=root.querySelector('.hc-energy-logs');if(!box)return;
    box.replaceChildren();
    s.logs.forEach((log,i)=>{const b=button('',()=>{s.history=s.history===i?null:i;renderLogs();renderRight();},'hc-energy-log'+(s.history===i?' selected':''));b.setAttribute('aria-pressed',String(s.history===i));const title=el('strong','',log.kind===2?log.title.replace('：无异常',''):log.title);if(log.kind===1||log.kind===2)title.append(el('span','hc-energy-log-result',log.kind===1?'调频成功':'无异常'));b.append(el('time','',log.metrics.time),title,el('p','',log.description));box.append(b);});
    root.querySelector('.hc-energy-log-actions').replaceChildren();
  }


  function requestReport(question) {
    const s=current;if(!E.requestReport(s,question))return;
    const monitor=root.querySelector('.hc-energy-logs')?.closest('details');if(monitor)monitor.open=false;
    const prompt=root.querySelector('.hc-energy-prompt');prompt?.remove();root.querySelector('.hc-energy-input-row input').value='';root.querySelector('.hc-energy-input-row input').dispatchEvent(new Event('input'));renderChat();
    const scroll=root.querySelector('.hc-energy-left-scroll');scroll.scrollTop=scroll.scrollHeight;
  }
  function renderChat() {
    const s=current,chat=root.querySelector('.hc-energy-chat');if(!chat)return;
    const scroll=root.querySelector('.hc-energy-left-scroll'),follow=scroll.scrollHeight-scroll.clientHeight-scroll.scrollTop<40;
    chat.replaceChildren();
    s.reports.forEach(report=>{
      chat.append(el('div','hc-energy-question',report.question));
      const answer=el('div','hc-energy-answer');answer.setAttribute('aria-live','polite');
      if(!report.done)answer.append(el('p',report.step===0?'hc-energy-typewriter-intro':'',report.done?'好的，已基于当前服务生成2026年8月能耗与节能报告':'好的，正在基于当前服务生成2026年8月能耗与节能报告'));
      const list=el('ol','hc-energy-progress');
      reportSteps.forEach((text,i)=>{
        if(i>report.step)return;
        const done=report.done||i<report.step,row=el('li',done?'done':i===report.step?'working':'');
        const mark=done?icon('对勾'):el('span','hc-energy-progress-dot hc-energy-loading');mark.classList.add('hc-energy-report-step-icon');const copy=el('span',done?'':'hc-energy-typewriter',text);copy.style.setProperty('--typing-steps',String(text.length));row.append(mark,copy);list.append(row);
      });if(!report.done)answer.append(list);
      if(report.done){
        const card=el('div','hc-energy-report-card'),glyph=el('span','hc-energy-file-icon');
        glyph.append(icon('报告图标'));
        const label=el('div','hc-energy-file-label'),name=s.name+'_2026年8月节能月报';label.title=name;label.append(el('strong','',name),el('small','','HTML · 2.4M'));
        const actions=el('div','hc-energy-file-actions');actions.append(button('查看',()=>{s.reportTabOpen=true;switchRightTab('report');}),button('下载',()=>downloadReport(s)));actions.firstChild.prepend(icon('查看详情'));actions.lastChild.prepend(icon('下载'));card.append(glyph,label,actions);answer.append(card);
      }
      chat.append(answer);
    });
    if(follow)scroll.scrollTop=scroll.scrollHeight;
  }
  function metric(label,value,unit='') {const d=el('div','hc-energy-metric'),dd=el('dd','',value);if(unit)dd.append(el('small','',unit));d.append(el('dt','',label),dd);return d;}
  function switchRightTab(tab) {
    const right=root.querySelector('.hc-energy-right');
    current.rightScroll ||= {};current.rightScroll[current.tab]=right.scrollTop;
    current.tab=tab;renderRight();right.scrollTop=current.rightScroll[tab]||0;
  }
  function renderRight() {
    const s=current,right=root.querySelector('.hc-energy-right'),old=right.scrollTop;right.replaceChildren();right.dataset.mode=s.tab==='report'?'report':'monitor';
    if(s.reportTabOpen){
      const tabs=el('nav','hc-energy-document-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','右侧内容页签');
      const serviceTab=button(s.name+'节能监控',()=>switchRightTab('service'));
      const reportTab=button(s.name+' 2026年8月节能月报',()=>switchRightTab('report'));
      serviceTab.prepend(icon('灰色叶子'));const reportTabIcon=el('img');reportTabIcon.alt='';reportTabIcon.src='./assets/uploads/149-129722.png';reportTab.prepend(reportTabIcon);
      [[serviceTab,'service'],[reportTab,'report']].forEach(([node,key])=>{node.setAttribute('role','tab');node.setAttribute('aria-selected',String(s.tab===key));tabs.append(node);});
      const closeTab=button('×',()=>{s.reportTabOpen=false;switchRightTab('service');},'hc-energy-close-report-tab');closeTab.setAttribute('aria-label','关闭月报页签');const reportGroup=el('div','hc-energy-report-tab-group');reportGroup.append(reportTab,closeTab);tabs.append(reportGroup);right.append(tabs);
    }
    if(s.tab==='report')renderReport(right,s);else renderService(right,s);
    right.scrollTop=old;
  }
  function renderService(right,s) {
    const title=el('h2','hc-energy-title',s.name);
    const badge=el('span','hc-energy-badge',s.stage===4?'节能中':'自动处理中');const leaf=el('span','hc-energy-clean-leaf');leaf.style.setProperty('--leaf-image','url('+reportIcons['energy-leaf']+')');leaf.setAttribute('aria-hidden','true');badge.prepend(leaf);title.append(badge);if(s.stage===4)title.append(el('span','hc-energy-badge','运行态均衡模式已开启'));if(s.stage<4){title.replaceChildren(document.createTextNode(s.name),el('span','hc-energy-badge','· 运行态均衡模式已开启'));}right.append(title);
    const metricPanel=el('section','hc-energy-panel hc-energy-metric-panel hc-energy-comparison-panel');
    const loadStats=el('div','hc-energy-service-loads');metricPanel.append(loadStats);renderLoadStats(loadStats,s);right.append(metricPanel);
    const panel=el('section','hc-energy-panel hc-energy-topology-panel'),head=el('div','hc-energy-topology-head');head.append(el('strong','','节点运行状态'),el('span','hc-energy-pill','服务器 '+Math.ceil(Number(s.data.npu)/8)),el('span','hc-energy-pill','NPU '+s.data.npu),el('span','hc-energy-pill','CPU '+Math.ceil(Number(s.data.npu)/8)*2));const range=el('select','hc-energy-range');range.setAttribute('aria-label','节点时间范围');[['12','近12小时'],['8','近8小时'],['4','近4小时']].forEach(([value,label])=>{const option=el('option','',label);option.value=value;range.append(option);});range.value=s.nodeRange||'4';range.onchange=()=>{s.nodeRange=range.value;renderNodeCards(s);};head.append(range);panel.append(head);
    const topology=el('div','hc-energy-node-grid');topology.setAttribute('aria-label','P/D 节点指标卡片');panel.append(topology);right.append(panel);renderNodeCards(s);
    const trend=el('section','hc-energy-trend');trend.append(chartTitle('节能优化效果',[['#6199ff','当前平均请求量(个/s)'],['#5c9edc','预测平均请求量(个/s)'],['#bcbcbc','实际功耗(kW)'],['#888','基线预测功耗(kW)'],['#22b784','策略后预测功耗(kW)']]));trend.querySelectorAll('.hc-energy-legend>span').forEach(n=>{n.textContent=n.textContent.replace(/^━ /,'');});trend.append(runtimeChart(s));panel.append(trend);updateLive();
  }
  function renderLoadStats(box,s){
    if(box.matches(':hover')||box.contains(document.activeElement))return;
    const days=5,saved=parseFloat(s.data.energySaved);
    const groups=[['轻载',.3,.8,'#37c18d'],['中载',.3,.2,'#fcd72e'],['重载',.4,0,'#f4840c']];
    box.innerHTML=`<div class="hc-energy-reference-summary"><dl class="hc-energy-reference-metrics">${[['百万Token能耗',(Number(s.data.energyUnit||1.82)/3.6).toFixed(2),'kWh/Mtoken'],['总能耗',parseFloat(s.data.energyTotal),'kWh'],['节省能耗',Number(saved.toFixed(1)),'kWh'],['节能增益',parseFloat(s.data.energyGain),'%'],['节能运行时长',String(days),'天']].map(([label,value,unit])=>`<div><dt>${label}</dt><dd>${value}<small>${unit}</small></dd></div>`).join('')}</dl><table class="hc-energy-sketch-loads" aria-label="负载时长和节省能耗分布"><thead><tr><th></th>${groups.map(g=>`<th scope="col"><i style="background:${g[3]}"></i>${g[0]}</th>`).join('')}<th aria-label="分布"></th></tr></thead><tbody>${[['时长',days,1,'天'],['节省',saved,2,'kWh']].map(([label,total,index,unit])=>`<tr aria-label="${label}"><th scope="row">${label}</th>${groups.map(g=>`<td>${(total*g[index]).toFixed(2)}<small>${unit}</small></td>`).join('')}<td><div class="hc-energy-sketch-bar" role="img" aria-label="${label}分布：${groups.map(g=>g[0]+Math.round(g[index]*100)+'%').join('，')}">${groups.filter(g=>g[index]>0).map(g=>`<i style="width:${g[index]*100}%;background:${g[3]}"></i>`).join('')}</div></td></tr>`).join('')}</tbody></table></div>`;
    box.querySelector('.hc-energy-reference-metrics dt').append(energyGradeTag(s.data));
  }

  function nodeMetricSettings() {
    const settings=el('details','hc-energy-node-settings'),trigger=el('summary','','指标设置');
    trigger.setAttribute('aria-label','节点指标设置');
    const gear=icon('设置');gear.className='hc-energy-settings-icon';gear.setAttribute('aria-hidden','true');trigger.prepend(gear);
    const menu=el('div','hc-energy-settings-menu');menu.setAttribute('role','group');menu.setAttribute('aria-label','节点指标多选');
    [['请求量&SLA达标率',true],['NPU&CPU利用率',true],['Token吞吐量',false],['TTFT/TPOT',false],['HBM利用率',false],['KVcache NPU利用率',false]].forEach(([name,checked])=>{
      const item=el('div','hc-energy-settings-option');item.setAttribute('role','checkbox');item.setAttribute('aria-checked',String(checked));item.setAttribute('aria-disabled','true');
      const check=el('span','hc-energy-settings-check','');if(checked)check.append(icon('复选项'));check.setAttribute('aria-hidden','true');item.append(check,el('span','',name));menu.append(item);
    });
    settings.append(trigger,menu);settings.addEventListener('keydown',e=>{if(e.key==='Escape'&&settings.open){e.stopPropagation();settings.open=false;trigger.focus();}});
    settings.addEventListener('focusout',e=>{if(!settings.contains(e.relatedTarget))settings.open=false;});
    return settings;
  }
  function stepIcon(status) {
    const n=status==='done'?icon('对勾'):el('i',status==='working'?'hc-energy-loading':'hc-energy-step-pending');
    n.classList.add('hc-energy-step-icon');n.setAttribute('aria-label',status==='done'?'已完成':status==='working'?'自动处理中':'待执行');return n;
  }
  function duration(seconds) {return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');}
  function sparkline(values,color,label,second=0,nodeIndex=0,metricIndex=0,nodeType='D') {
    const min=Math.min(...values),max=Math.max(...values),spread=Math.max(max-min,.01);
    // 演示微趋势按节点角色区分节奏：Prefill 起伏较快，Decode 更舒缓。
    const seed=nodeIndex*7+metricIndex*11,phase=nodeIndex*.47+metricIndex*.63;
    const prefill=nodeType==='P';
    const speed=(prefill?.23:.105)+(seed%7)*.004,amplitude=(prefill?.30:.24)+(seed%5)*.012;
    const points=values.map((v,i)=>{const t=second-(values.length-1-i)*4;
      const wave=.42+Math.sin(t*speed+phase)*amplitude+Math.sin(t*speed*(prefill?1.9:1.45)+phase*1.4)*(prefill?.075:.045);
      const level=Math.max(.03,Math.min(.97,(v-min)/spread*.2+wave));
      return {x:i*60/(values.length-1),y:24-level*19};
    });
    let path=`M${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length;i++){const previous=points[i-1],point=points[i],middle=(previous.x+point.x)/2;path+=`C${middle} ${previous.y},${middle} ${point.y},${point.x} ${point.y}`;}
    const box=el('span','hc-energy-node-spark');box.innerHTML=`<svg viewBox="0 0 60 28" preserveAspectRatio="xMaxYMid meet" role="img" aria-label="${label}趋势"><path d="${path}L60 28H0Z" fill="${color}" opacity=".09"/><path d="${path}" stroke="${color}" stroke-width="1.5" fill="none"/><circle cx="60" cy="${points.at(-1).y}" r="1.8" fill="${color}"/></svg>`;return box;
  }
  function nodeMetrics(s,index,second=E.runtimeWindow(s).now) {
    const count=Math.max(1,Math.ceil(Number(s.data.npu)/8)),t=Math.max(0,second);
    const isPrefill=n=>n%(count===6?3:4)===0;
    const weights=Array.from({length:count},(_,n)=>(isPrefill(n)?1.3:.85)*(1+(n%3)*.11));
    const share=weights[index]/weights.reduce((a,b)=>a+b,0),p=isPrefill(index),phase=index*1.37;
    const wave=(speed,offset=0)=>Math.sin(t*speed+phase+offset);
    const load=(p?68:53)+index*.9+wave(p?.19:.085)*7+wave(.037,1)*3;
    const cpu=(p?43:57)+index*.6+wave(p?.14:.065,1.6)*6+wave(.023)*2;
    const growth=(p?345:255)*(1+index*.065),speed=p?.12:.055;
    // 固定节点权重和连续时间函数，使各节点可复现且具有不同负载节奏。
    const requests=(Number(s.data.total)||286420)*share+growth*(t+.32/speed*(Math.sin(t*speed+phase)-Math.sin(phase)));
    return [
      ['总能耗',parseFloat(s.data.energyTotal)*share+t*.002*weights[index],'kWh','#7b9dfb'],
      ['节省能耗',parseFloat(s.data.energySaved)*share+t*.0003*weights[index],'kWh','#45c49f'],
      ['NPU利用率',Math.min(100,Math.max(0,load)),'%','#55acc8'],
      ['CPU利用率',Math.min(100,Math.max(0,cpu)),'%','#a197e8'],
      ['请求量',requests,'次','#6d9cf3'],
      ['SLA达标率',(p?99.82:99.89)+wave(p?.11:.047,2)*.045+wave(.029)*.012,'%','#51c59c']
    ];
  }

  function renderNodeCards(s) {
    const grid=root.querySelector('.hc-energy-node-grid');if(!grid)return;
    if(grid.querySelector('.hc-energy-load-split:hover,.hc-energy-load-split:focus-within'))return;
    const old=grid.scrollTop;grid.replaceChildren();grid.dataset.nodeCount=String(Math.ceil(Number(s.data.npu)/8));
    const count=Math.max(1,Math.ceil(Number(s.data.npu)/8));
    for(let i=0;i<count;i++){
      const type=i%(count===6?3:4)===0?'P':'D',card=el('article','hc-energy-node-card'),head=el('div','hc-energy-node-card-head');
      const ip=`112.34.${i%2?14:13}.${i+2}`;card.setAttribute('aria-label',ip+' '+type+'节点');
      head.append(el('span','hc-energy-node-type '+type.toLowerCase(),type));const identity=el('div');identity.append(el('h3','',ip),el('span','',type==='P'?'Prefill节点':'Decode节点'));head.append(identity);card.append(head);
      const clock=E.runtimeWindow(s).now,frequency=E.nodeState(s,i,clock);
      const status=el('span','hc-energy-frequency-status',frequency.status);
      if(frequency.status!=='稳定运行'){
        C.FlowBorder(status);
        // Preserve the shared animation phase across periodic card reconstruction.
        const phaseDelay=-(performance.now()/1000)+'s';
        status.querySelectorAll('.hc-flow-ring,.hc-flow-halo>i').forEach(ring=>{ring.style.animationDelay=phaseDelay;});
      }
      identity.className='hc-energy-node-identity';
      const titleLine=el('div','hc-energy-node-title-line');identity.prepend(titleLine);titleLine.append(identity.querySelector('h3'));
      if(frequency.status!=='稳定运行')titleLine.append(status);
      const weights=Array.from({length:count},(_,k)=>[2.60,1.85,1.95,2.59,1.85,1.95][k%6]),weightSum=weights.reduce((a,b)=>a+b,0),savedCents=Math.round(parseFloat(s.data.energySaved)*100);
      const before=weights.slice(0,i).reduce((a,b)=>a+b,0),cumulative=(Math.round(savedCents*(before+weights[i])/weightSum)-Math.round(savedCents*before/weightSum))/100;
      const accumulated=el('div','hc-energy-node-cumulative');accumulated.title='策略生效以来累计节能（演示值按节点节能占比分配）';
      const amount=el('strong','',cumulative.toFixed(2));amount.append(el('small','',' kWh'));accumulated.append(el('span','','累计节能'),amount);head.append(accumulated);
      card.dataset.frequencyState=frequency.status==='调频中'?'working':frequency.at!==null?'applied':'stable';
      const activeLog=s.history!==null?s.logs[s.history]:s.logs.filter(log=>log.second<=clock).at(-1);
      if(activeLog&&activeLog.nodeIndex===i&&frequency.status!=='稳定运行')card.classList.add('hc-energy-node-linked');
      const metrics=el('dl','hc-energy-node-metrics hc-energy-node-hierarchy');
      const current=nodeMetrics(s,i,clock),history=Array.from({length:16},(_,k)=>nodeMetrics(s,i,clock-(15-k)*4));
      current[1][1]=[2.60,1.85,1.95,2.59,1.85,1.95][i]*Number(s.nodeRange||4)/4;
      const metricCopy=j=>{
        const [label,value,unit,color]=current[j],copy=el('div','hc-energy-node-copy'),dt=el('dt','',label),dd=el('dd','',unit==='次'?Math.round(value).toLocaleString():value.toFixed(2));
        dt.style.setProperty('--metric-color',color);dd.append(el('small','',unit));copy.append(dt,dd);return copy;
      };
      const saving=el('div','hc-energy-node-saving');saving.append(metricCopy(1));saving.querySelector('dt').textContent='近'+(s.nodeRange||4)+'小时节能';metrics.append(saving);
      const series=E.nodeSeries(s,i,clock,Number(s.nodeRange||4)),{start,end}=series,samples=series.points;
      // Anchor completed adjustments to their nearest 30-minute sampled column.
      const frequencySamples=series.events.map(event=>{const sample=samples.reduce((best,p)=>Math.abs(p.at-event.at)<Math.abs(best.at-event.at)?p:best);sample.request=event.request;sample.kind='medium';sample.saving=0;return {event,sample};});
      const sampleSaving=samples.reduce((sum,p)=>sum+p.saving,0);if(sampleSaving)samples.forEach(p=>p.saving*=current[1][1]/sampleSaving);
      const total=Number(current[1][1].toFixed(2)),lightWeight=samples.filter(p=>p.kind==='light').reduce((n,p)=>n+p.saving,0),mediumWeight=samples.filter(p=>p.kind==='medium').reduce((n,p)=>n+p.saving,0),weight=lightWeight+mediumWeight;
      const light=weight?Number((total*lightWeight/weight).toFixed(2)):0,medium=weight?Number((total-light).toFixed(2)):0;
      const split=el('div','hc-energy-load-split');[['轻载',light,'light'],['中载',medium,'medium']].forEach(([label,value,kind])=>{const part=el('div',kind);part.tabIndex=0;part.setAttribute('aria-label',label+'节省能耗 '+value.toFixed(2)+' kWh，突出对应时段');part.append(el('dt','',label+'节省'));const amount=el('dd','',value.toFixed(2));amount.append(el('small','',' kWh'));part.append(amount);split.append(part);});const splitWrap=el('div','hc-energy-split-wrap');splitWrap.append(split);saving.append(splitWrap);
      const chart=el('div','hc-energy-node-load-chart'),baseline=100,plotHeight=72,left=25,right=338,x=at=>left+10+(at-start)/(end-start)*(right-left-20),maxRequest=Math.ceil(Math.max(...samples.map(p=>p.request),...series.events.map(p=>p.request))*10)/10,maxSaving=Math.max(.5,Math.ceil(Math.max(...samples.map(p=>p.saving))*2)/2),colors={light:'#37c18d',medium:'#fcd72e',heavy:'#f4840c'};
      const stamp=at=>E.time(Math.floor(at),0).slice(0,5);let markup='';
      samples.slice(0,-1).forEach((p,k)=>{markup+=`<rect class="hc-load-shade ${p.kind}" x="${x(p.at)}" y="28" width="${x(samples[k+1].at)-x(p.at)}" height="72" fill="${colors[p.kind]}" opacity="0"/>`;});
      for(let k=0;k<=2;k++){const y=baseline-k*plotHeight/2;markup+=`<path d="M${left} ${y}H${right}" stroke="#414141" stroke-width=".6"/><text x="${left-5}" y="${y+3}" text-anchor="end" fill="#aaa" font-size="9">${Math.round(maxRequest*k/2*1800)}</text><text x="${right+5}" y="${y+3}" fill="#aaa" font-size="9">${(maxSaving*k/2).toFixed(1)}</text>`;}
      const barWidth=Math.min(18,(right-left-20)/(samples.length-1)*.48);
      samples.forEach(p=>{markup+=`<rect class="hc-load-request ${p.kind}" x="${x(p.at)-barWidth/2}" y="${baseline-p.request/maxRequest*plotHeight}" width="${barWidth}" height="${p.request/maxRequest*plotHeight}" rx="1" fill="${colors[p.kind]}"><title>${stamp(p.at)} 请求量 ${Math.round(p.request*1800)} 个/30分钟；节省能耗 ${p.saving.toFixed(2)} kWh</title></rect>`;});
      const curve=samples.map(p=>({...p}));
      
      markup+=`<path d="${curve.map((p,k)=>(k?'L':'M')+x(p.at)+' '+(baseline-p.saving/maxSaving*plotHeight)).join(' ')}" fill="none" stroke="#45c49f" stroke-width="1.7"/>`;
      frequencySamples.forEach(({event:p,sample})=>{const markX=x(sample.at),markY=baseline-sample.request/maxRequest*plotHeight;const selected=activeLog?.nodeIndex===i&&(activeLog.kind===1?activeLog.second===p.second:(activeLog.kind===2?activeLog.second>=p.second:activeLog.plannedSecond===p.second));markup+=`<g class="hc-node-frequency-mark"><path d="M${markX} 23V${markY}" stroke="#55c6ad" stroke-width="${selected?2:1}" stroke-dasharray="3 2"/><circle cx="${markX}" cy="${markY}" r="2.5" fill="#55c6ad"/><text x="${Math.min(right-2,Math.max(left+40,markX))}" y="18" text-anchor="${markX>right-50?'end':'middle'}" fill="#55c6ad" font-size="9">${stamp(p.at)} 已调频</text><title>${p.time} 请求量 ${Math.round(p.request*1800)} 个/30分钟；NPU ${p.npu} GHz，CPU ${p.cpu} GHz</title></g>`;});
      for(let k=0;k<=4;k++){const at=start+k*(end-start)/4;markup+=`<text x="${x(at)}" y="116" text-anchor="middle" fill="#aaa" font-size="10">${stamp(at)}</text>`;}
      chart.innerHTML='<div class="hc-energy-load-legend"><span>▥ 请求量（个/30分钟）</span><span>━ 节省能耗（kWh）</span></div>'+`<svg viewBox="0 0 360 124" preserveAspectRatio="none" role="img" aria-label="近${s.nodeRange||4}小时，每30分钟采样，调频点与运行日志对应">${markup}</svg>`;metrics.append(chart);
      card.append(metrics);grid.append(card);
    }
    grid.scrollTop=old;
  }
  function chartTitle(text,legend) {const t=el('h3','hc-energy-chart-title',text),l=el('span','hc-energy-legend');legend.forEach(([c,n])=>{const a=el('span','','━ '+n);a.style.color=c;l.append(a);});t.append(l);return t;}
  const reportPolicies=[['空闲态节能统计','',[[10,14],[18,23],[26,27]]],['运行态节能统计','running',[[8,16],[18,24],[26,30]]]];
  function svgChart(markup,width,height,label,points) {
    const box=el('div','hc-energy-chart');box.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
    const tip=el('div','hc-energy-tooltip');tip.hidden=true;box.append(tip);
    box.querySelectorAll('[data-point]').forEach(n=>{
      n.setAttribute('tabindex','0');n.setAttribute('role','button');n.setAttribute('aria-label',points[Number(n.dataset.point)]);
      const show=()=>{const i=Number(n.dataset.point);tip.replaceChildren();points[i].split('\n').forEach((line,j)=>{if(!j){tip.append(el('div','hc-energy-tooltip-date',line));return;}const colon=line.indexOf('：');const row=el('div','hc-energy-tooltip-row'),label=el('span','',colon<0?line:line.slice(0,colon)),value=el('strong','',colon<0?'':line.slice(colon+1));if(line.startsWith('空闲态'))row.classList.add('policy-idle');if(line.startsWith('运行态'))row.classList.add('policy-running');row.append(label,value);tip.append(row);});n.setAttribute('fill','rgba(255,255,255,.06)');tip.hidden=false;const bounds=n.getBBox(),scale=box.clientWidth/width,rightEdge=(bounds.x+bounds.width)*scale,leftEdge=bounds.x*scale,gap=18;const x=rightEdge+gap+tip.offsetWidth<=box.clientWidth?rightEdge+gap:leftEdge-gap-tip.offsetWidth;tip.style.left=Math.max(0,x)+'px';tip.style.top=Math.min(64,Math.max(8,box.clientHeight-tip.offsetHeight-8))+'px';box.querySelector(`[data-hover-marker="${i}"]`)?.removeAttribute('hidden');};
      const hide=()=>{tip.hidden=true;n.setAttribute('fill','transparent');box.querySelector(`[data-hover-marker="${n.dataset.point}"]`)?.setAttribute('hidden','');};
      n.addEventListener('hc-tip-show',show);n.addEventListener('hc-tip-hide',hide);
      const linked=visible=>{
        const right=box.closest('.hc-energy-right');const charts=right?.querySelectorAll('[data-report-chart]');
        if(box.dataset.reportChart)right?.querySelectorAll('[data-policy-start]').forEach(bar=>{const day=Number(n.dataset.point)+1;bar.classList.toggle('policy-highlight',visible&&day>=Number(bar.dataset.policyStart)&&day<=Number(bar.dataset.policyEnd));});
        if(box.dataset.reportChart&&charts){charts.forEach(chart=>{chart.querySelectorAll('[data-point]').forEach(point=>point.dispatchEvent(new Event('hc-tip-hide')));if(visible)chart.querySelector(`[data-point="${n.dataset.point}"]`)?.dispatchEvent(new Event('hc-tip-show'));});}
        else if(visible)show();else hide();
      };
      n.addEventListener('mouseenter',()=>linked(true));n.addEventListener('focus',()=>linked(true));
      n.addEventListener('mouseleave',()=>linked(false));n.addEventListener('blur',()=>linked(false));
    });return box;
  }
  function runtimeChart(s) {
    const now=0, data={now,samples:Array.from({length:65},(_,i)=>{const second=Math.floor(now*2)/2-16+i*.5,d=E.snapshot({...s,elapsed:second*86400,liveTick:second*3});return {second,...d,power:second>=-15?d.optimizedPower:d.baselinePower};})},width=1292,height=148,step=width/30,boundary=width/2;
    const dateLabel=t=>{const d=new Date(Date.UTC(2026,8,9)+t/3*86400000);return String(d.getUTCMonth()+1).padStart(2,'0')+'.'+String(d.getUTCDate()).padStart(2,'0');};
    const xOf=t=>boundary+(t-data.now)*step;
    let m='<defs><pattern id="hc-energy-predict" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(110)"><rect width="3" height="8" fill="#5c9edc"/></pattern><clipPath id="hc-energy-runtime-clip"><rect x="0" y="10" width="1292" height="95"/></clipPath></defs>';
    m+='<rect x="0" y="10" width="1292" height="96" fill="#232323"/>';
    for(let i=0;i<6;i++)m+=`<path d="M0 ${10+i*19}H1292" stroke="#393939" stroke-width=".7"/>`;
    let bars='',actual='',base='',optimized='';
    data.samples.forEach((d,i)=>{const x=xOf(d.second),barHeight=12+(d.request-1720)/240*33;
      bars+=`<rect x="${x-6}" y="${105-barHeight}" width="12" height="${barHeight}" rx="3" fill="${d.second<=data.now?'#5c9edc':'url(#hc-energy-predict)'}"/>`;
    });
    // 逐秒采样使功耗曲线平滑，固定窗口内旧采样向左移动。
    for(let t=data.now-15;t<=data.now+15;t+=.1){
      const x=xOf(t),d=E.snapshot({...s,elapsed:t*86400,liveTick:t*3}),y=47-(d.baselinePower-44)*2.8;
      if(t<=data.now)actual+=(actual?'L':'M')+x+' '+(47-((t>=-15?d.optimizedPower:d.baselinePower)-44)*2.8);
      if(t>=data.now){base+=(base?'L':'M')+x+' '+y;optimized+=(optimized?'L':'M')+x+' '+(47-(d.optimizedPower-44)*2.8);}
    }
    m+=`<g clip-path="url(#hc-energy-runtime-clip)">${bars}<path d="${actual}" fill="none" stroke="#bdbdbd" stroke-width="1"/><path d="${base}" fill="none" stroke="#aaa" stroke-width="1" stroke-dasharray="1.5 2.5"/><path d="${optimized}" fill="none" stroke="#20aa78" stroke-width="1" stroke-dasharray="1.5 2"/></g>`;
    m+=`<path d="M${boundary} 0V120M${boundary-6} 0H${boundary+6}" stroke="#6a94ff" stroke-width="2"/>`;
    if(s.effectiveAt){const t=-15,x=xOf(t);if(x>=0&&x<1287)m+=`<path d="M${x} 14V106" stroke="#53c49c" stroke-dasharray="3 3"/><text x="${Math.min(x+5,1220)}" y="22" font-size="10" fill="#71c7a6">策略启动 · 09.04</text>`;}
    for(let t=Math.ceil(data.now-15);t<=data.now+15;t+=3){const x=xOf(t);if(x>=0&&x<=width)m+=`<text x="${Math.max(28,Math.min(width-28,x))}" y="122" dominant-baseline="hanging" text-anchor="middle" fill="#999" font-size="12">${dateLabel(t)}</text>`;}
    const points=data.samples.map(d=>`${dateLabel(d.second)}\n${d.second<=data.now?'当前':'预测'}平均请求量：${d.request} 个/s\n${d.second<=data.now?'实际':'基线预测'}功耗：${d.second<=data.now?d.power:d.baselinePower} kW${d.second>data.now?'\n策略后预测功耗：'+d.optimizedPower.toFixed(1)+' kW':''}`);
    data.samples.forEach((d,i)=>m+=`<rect x="${xOf(d.second)-step/4}" y="10" width="${step/2}" height="96" fill="transparent" data-point="${i}"/>`);
    const box=svgChart(m,width,height,'实际和预测请求量、功耗趋势',points);box.querySelector('svg').setAttribute('preserveAspectRatio','none');box.dataset.energyRuntime='true';box.dataset.runtimeNow=String(data.now);return box;
  }
  function updateLive() {
    if(!current||current.tab!=='service')return;
    const uptime=root.querySelector('[data-energy-live=duration]');if(uptime)uptime.innerHTML='5<small> 天</small>';
    const loadStats=root.querySelector('.hc-energy-service-loads');if(loadStats)renderLoadStats(loadStats,current);
    renderNodeCards(current);
    const chart=root.querySelector('[data-energy-runtime]');
    if(chart&&chart.dataset.runtimeNow!==String((current.chartTick||0)/120)&&chart.querySelector('.hc-energy-tooltip').hidden&&!chart.contains(document.activeElement))chart.replaceWith(runtimeChart(current));
  }
  // 同一数据源驱动图表、浮层、汇总和下载，避免单位和总量不一致。
  const days=Array.from({length:31},(_,i)=>({day:i+1,total:Math.round(1280+Math.sin(i*.77)*240+(i%4)*75),saved:Math.round(170+Math.sin(i*.63)*45+(i%3)*13),requests:+(24+Math.sin(i*.56)*5).toFixed(1),slo:+(99.85+Math.sin(i*.7)*.09).toFixed(2),npu:Math.round(58+Math.sin(i*.72)*15),cpu:Math.round(65+Math.sin(i*.51)*18)}));
  function reportData(s){
    const allocate=(weights,total)=>{const sum=weights.reduce((a,b)=>a+b,0),raw=weights.map(v=>v/sum*total),values=raw.map(Math.floor);let remaining=total-values.reduce((a,b)=>a+b,0);raw.map((v,i)=>({i,f:v-values[i]})).sort((a,b)=>b.f-a.f).slice(0,remaining).forEach(p=>values[p.i]++);return values;};
    const total=allocate(days.map(d=>d.total),34224);
    const saved=allocate(total.map(v=>1/v**2),2379);
    return days.map((d,i)=>({...d,total:total[i],saved:saved[i],slo:Number((99.92+.015*Math.sin(i*.63)+.005*Math.cos(i*1.1)).toFixed(2))}));
  }
  function renderReport(right,s) {
    const data=reportData(s),total=data.reduce((a,d)=>a+d.total,0),saved=data.reduce((a,d)=>a+d.saved,0);
    const heading=el('div','hc-energy-report-heading');heading.append(el('h1','hc-energy-report-title',s.name+'  2026年8月节能月报'),button('下载',()=>downloadReport(s),'hc-energy-download'));heading.querySelector('.hc-energy-download')?.prepend(icon('下载'));right.append(heading);
    const scope=el('div','hc-energy-report-scope','守护范围');scope.append(el('span','hc-energy-pill','服务器 '+Math.ceil(Number(s.data.npu)/8)),el('span','hc-energy-pill','NPU '+s.data.npu+' 卡'),el('span','hc-energy-pill','CPU '+Math.ceil(Number(s.data.npu)/8)*2+' 卡'));right.append(scope);
    const metricSymbols=['ϟ','ϟ','leaf','trend','money'];const metricChanges=['↓ 3.8%','↓ 3.8%','↑ 18.6%','↑ 6.1%', '↑ ¥'+Math.round(saved*1.2-saved/1.186*1.2).toLocaleString()];let metricIndex=0;const metrics=el('dl','hc-energy-report-metrics');[['百万Token能耗',(Number(s.data.energyUnit||1.82)/3.6).toFixed(2),'kWh/Mtoken'],['当月总能耗',total.toLocaleString(),'kWh'],['当月节省能耗',saved.toLocaleString(),'kWh'],['当月节能增益',(saved/(total+saved)*100).toFixed(1),'%'],['当月经济收益',(2854).toLocaleString('zh-CN',{maximumFractionDigits:0}),'元']].forEach(([k,v,u])=>{const d=el('div'),dd=el('dd','',v);dd.append(el('small','',' '+u));const dt=el('dt','',k);const glyph=el('span','hc-energy-metric-symbol');const type=metricSymbols[metricIndex];if(type==='money')glyph.append(icon('钱'));else glyph.append(reportIcon(type==='leaf'?'energy-leaf':type==='trend'?'energy-gain':'energy-total'));dt.prepend(glyph);const change=el('p');change.append(el('span','','较上月同期'));const trendValue=metricChanges[metricIndex++],trend=el('em');const arrow=reportIcon('good-arrow');arrow.className='hc-energy-change-arrow';if(trendValue[0]==='↓')arrow.style.transform='rotate(180deg)';arrow.alt=trendValue[0]==='↓'?'下降，改善':'上升，改善';trend.append(arrow,el('span','',trendValue.slice(1).trim()));change.append(trend);d.append(dt,dd,change);metrics.append(d);});right.append(metrics);
    const daily=el('section','hc-energy-panel hc-energy-daily');daily.append(chartTitle('每日能耗与节能趋势',[['#689aff','总能耗'],['#3ac8a5','节省能耗']]));daily.append(reportChart(data,'energy'));
    right.append(daily);
    const bottom=el('div','hc-energy-report-bottom');[['requests','推理请求量+SLA达标率',[['#3889ff','推理请求量'],['#79b53b','SLA达标率']]],['utilization','NPU及CPU利用率',[['#3889ff','NPU'],['#21b7bd','CPU']]]].forEach(([kind,title,legend])=>{const panel=el('section','hc-energy-panel');panel.append(chartTitle(title,legend),reportChart(data,kind));bottom.append(panel);});right.append(bottom);right.querySelectorAll('.hc-energy-legend>span').forEach(n=>{const color=n.style.color;n.textContent=n.textContent.replace(/^━ /,'');n.style.setProperty('--legend-color',color);n.style.color='#bdbdbd';});
  }
  function dailyEnergyChart(data) {
    const width=1292,height=245,left=48,right=12,w=width-left-right,zero=122,upper=90,lower=82;
    const axisMax=values=>{const raw=Math.max(...values)*1.15,magnitude=10**Math.floor(Math.log10(raw));return Math.ceil(raw/magnitude*2)/2*magnitude;};
    const totalMax=axisMax(data.map(d=>d.total)),savedMax=axisMax(data.map(d=>d.saved));
    let m='<defs><pattern id="hc-energy-saved-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(70)"><rect width="2" height="6" fill="#70cdb6"/></pattern></defs>';
    m+='<text x="0" y="14" fill="#c9c9c9" font-size="12">总能耗 / kWh</text>';
    for(let i=0;i<=4;i++){const y=32+i*upper/4;m+=`<path d="M${left} ${y}H${width-right}" stroke="#333"/><text x="${left-8}" y="${y+4}" text-anchor="end" fill="#939393" font-size="12">${Number((totalMax*(1-i/4)).toFixed(2))}</text>`;}
    for(let i=1;i<=4;i++){const y=zero+i*lower/4;m+=`<path d="M${left} ${y}H${width-right}" stroke="#333"/><text x="${left-8}" y="${y+4}" text-anchor="end" fill="#939393" font-size="12">${Number((savedMax*i/4).toFixed(2))}</text>`;}
    const points=[];data.forEach((d,i)=>{const x=left+(i+.5)*w/31,bw=14,up=d.total/totalMax*upper,down=d.saved/savedMax*lower;
      m+=`<path d="M${x-bw/2} ${zero}V${zero-up+4}Q${x-bw/2} ${zero-up} ${x-bw/2+4} ${zero-up}H${x+bw/2-4}Q${x+bw/2} ${zero-up} ${x+bw/2} ${zero-up+4}V${zero}Z" fill="#6899fb"/><path d="M${x-bw/2} ${zero}V${zero+down-4}Q${x-bw/2} ${zero+down} ${x-bw/2+4} ${zero+down}H${x+bw/2-4}Q${x+bw/2} ${zero+down} ${x+bw/2} ${zero+down-4}V${zero}Z" fill="url(#hc-energy-saved-stripes)"/>`;
      if(i%5===0||i===30)m+=`<text x="${x}" y="223" fill="#939393" text-anchor="middle" font-size="12">8.${d.day}</text>`;
      points.push(`2026年8月${d.day}日\n总能耗：${d.total} kWh\n节省能耗：${d.saved} kWh`);
    });
    m+='<text x="0" y="242" fill="#c9c9c9" font-size="12">节省能耗 / kWh</text>';
    data.forEach((d,i)=>{m+=`<rect x="${left+i*w/31}" y="32" width="${w/31}" height="172" fill="transparent" data-point="${i}"/>`;});
    const chart=svgChart(m,width,height,`每日能耗与节省能耗，上方0至${totalMax} kWh，下方0至${savedMax} kWh`,points);chart.querySelector('svg').setAttribute('preserveAspectRatio','none');chart.dataset.reportChart='energy';return chart;
  }
  function reportChart(data,kind) {
    if(kind==='energy')return dailyEnergyChart(data);
    const width=kind==='energy'?1240:590,height=kind==='energy'?248:240,left=48,right=kind==='requests'?46:18,top=34,bottom=32,w=width-left-right,h=height-top-bottom;
    let m='',line1='',line2='';const points=[];
    const max=kind==='energy'?2000:kind==='requests'?40:100;
    for(let i=0;i<=4;i++){const y=top+h*i/4;m+=`<path d="M${left} ${y}H${width-right}" stroke="#333"/><text x="${left-8}" y="${y}" dominant-baseline="middle" fill="#aaa" text-anchor="end" font-size="12">${max*(1-i/4)}</text>`;if(kind==='requests')m+=`<text x="${width-right+6}" y="${y}" dominant-baseline="middle" fill="#aaa" font-size="12">${i===0?'100':(100-i*.25).toFixed(2)}%</text>`;}
    m+=`<text x="0" y="13" fill="#aaa" font-size="12">${kind==='energy'?'能耗 / kWh':kind==='requests'?'请求量（万个）':'利用率（%）'}</text>`;
    if(kind==='requests')m+=`<text x="${width}" y="13" text-anchor="end" fill="#aaa" font-size="12">SLA达标率（%）</text>`;
    data.forEach((d,i)=>{const x=left+(i+.5)*w/31,bw=w/31*.28;
      if(kind==='energy'){m+=`<rect x="${x-bw}" y="${top+h-d.total/max*h}" width="${bw}" height="${d.total/max*h}" rx="2" fill="#689aff"/><rect x="${x+1}" y="${top+h-d.saved/max*h}" width="${bw}" height="${d.saved/max*h}" rx="2" fill="#38c5a4"/>`;points.push(`2026年8月${d.day}日\n总能耗：${d.total} kWh\n节省能耗：${d.saved} kWh\n实际能耗：${d.total-d.saved} kWh`);}
      else if(kind==='requests'){m+=`<rect x="${x-bw}" y="${top+h-d.requests/max*h}" width="${bw*1.7}" height="${d.requests/max*h}" rx="2" fill="#3285f8"/>`;line1+=(i?'L':'M')+x+' '+(top+(100-d.slo)*h);points.push(`2026年8月${d.day}日\n推理请求量：${d.requests} 万个\nSLA 达标率：${d.slo}%`);}
      else {line1+=(i?'L':'M')+x+' '+(top+h-d.npu/100*h);line2+=(i?'L':'M')+x+' '+(top+h-d.cpu/100*h);points.push(`2026年8月${d.day}日\nNPU 利用率：${d.npu}%\nCPU 利用率：${d.cpu}%`);}
      if(i%5===0||i===30)m+=`<path d="M${x} ${top+h}v4" stroke="#555"/><text x="${x}" y="${height-10}" fill="#aaa" text-anchor="middle" font-size="12">8.${i+1}</text>`;
    });
    if(line1)m+=`<path d="${line1}" fill="none" stroke="${kind==='requests'?'#81b83c':'#3386ff'}" stroke-width="2"/>`;if(line2)m+=`<path d="${line2}" fill="none" stroke="#23b8c1" stroke-width="2"/>`;
    data.forEach((d,i)=>{m+=`<rect x="${left+i*w/31}" y="${top}" width="${w/31}" height="${h}" fill="transparent" data-point="${i}"/>`;});
    data.forEach((d,i)=>{const x=left+(i+.5)*w/31; m+=`<g data-hover-marker="${i}" hidden pointer-events="none"><path d="M${x} ${top}V${top+h}" stroke="#777" stroke-width="1"/>`;const dots=kind==='requests'?[[top+(100-d.slo)*h,'#81b83c']]:[[top+h-d.npu/100*h,'#3386ff'],[top+h-d.cpu/100*h,'#23b8c1']];dots.forEach(([y,color])=>{m+=`<circle cx="${x}" cy="${y}" r="4" fill="#191919" stroke="${color}" stroke-width="2"/>`;});m+='</g>';});
    const chart=svgChart(m,width,height,kind==='requests'?'推理请求量与SLA达标率':'NPU及CPU利用率',points);chart.dataset.reportChart=kind;return chart;
  }
  function downloadReport(s) {
    const content=el('main','hc-energy-right');renderReport(content,s);content.querySelectorAll('.hc-energy-tabs,.hc-energy-download,.hc-energy-tooltip').forEach(n=>n.remove());
    const escape=t=>t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const style=Array.from(document.querySelectorAll('style')).map(n=>n.textContent).filter(t=>t.includes('#hc-energy-root')).join('\n');
    const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>'+escape(s.name)+' 2026年8月节能月报</title><style>'+style+'\nhtml,body{height:auto;overflow:auto;background:#050505;color:#eee;font-family:Arial,"Microsoft YaHei",sans-serif}#hc-energy-root{position:static;display:block;width:auto;height:auto;max-width:1440px;margin:auto}#hc-energy-root .hc-energy-right{overflow:visible;padding:32px}svg{width:100%}@media print{body{print-color-adjust:exact}#hc-energy-root .hc-energy-panel{break-inside:avoid}}</style><body><section id="hc-energy-root">'+content.outerHTML+'</section></body></html>';
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=el('a');a.href=url;a.download=s.name.replace(/[\\/:*?"<>|]/g,'-')+'-2026年8月节能月报.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const baseRenderGuard=window.renderStoryGuard;
  function augmentHome() {
    const box=document.querySelector('#home-events .hc-guard-events') || document.getElementById('home-events').firstElementChild;
    if(!box)return;
    const tabs=box.querySelectorAll('[role="tab"]'),auto=tabs[1];if(!auto)return;
    const impactOnly=box.querySelector('.hc-impact-filter')?.getAttribute('aria-checked')==='true';
    const processing=impactOnly?[]:(window.getProcessingEnergyEvents?.()||[]);
    const badge=auto.querySelector('.hc-tab-count');
    if(badge){if(!badge.dataset.energyBase)badge.dataset.energyBase=badge.textContent;badge.textContent=Number(badge.dataset.energyBase)+processing.length;}
    const oldList=box.querySelector('.hc-energy-home-list');
    if(oldList){oldList.querySelectorAll('.hc-event-row:not(.hc-energy-home-row)').forEach(row=>box.insertBefore(row,oldList));oldList.remove();}
    if(auto.getAttribute('aria-selected')!=='true'||!processing.length)return;
    box.querySelector('.story-empty')?.remove();
    const energyList=el('div','hc-energy-home-list');box.querySelectorAll('.hc-event-row').forEach(row=>energyList.append(row));box.append(energyList);
    processing.forEach(item=>{
      const row=el('article','hc-event-row hc-energy-home-row'),head=el('div','hc-event-head');
      const ring=HCComponents.EventTypeIcon({domain:'inference',type:'energy',name:item.name,size:26});row.classList.add('hc-event-processing');HCComponents.FlowBorder(row);
      head.append(ring,el('span','',item.name),el('time','',item.start.replace('今天 ','')));
      row.append(head,el('p','',item.root));if(item.action==='energy'){row.setAttribute('aria-disabled','true');}energyList.append(row);
    });
  }

  window.renderStoryGuard=(...args)=>{baseRenderGuard(...args);augmentHome();};
  function syncHome() {
    augmentHome();
    document.querySelector('.hc-energy-home-marker')?.remove();
  }
  document.querySelector('#home-sidebar button[aria-label="首页"]').addEventListener('click',close);
  document.querySelector('#home-header button').addEventListener('click',()=>{close();for(const s of sessions.values()){s.elapsed=0;s.liveTick=0;s.chartTick=0;s.logElapsed=0;s.logs=[];s.history=null;s.report=null;s.reports=[];s.prompt=true;s.tab='service';s.reportTabOpen=false;s.rightScroll={};s.expanded=false;s.expandedSteps.clear();s.stage=4;s.effectiveAt='10:17:14';s.stageElapsed=0;s.strategyGroupOpen=undefined;s.typedSteps=new Set();s.monitorOpen=true;s.composerText='';s.reportElapsed=0;}window.dispatchEvent(new CustomEvent('hc-energy-reset'));notifyEvents();});
  root.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  // Recognition also progresses on the home timeline; the detail timer owns it while open.
  const recognitionTimer=setInterval(()=>{if(!window.HCStory.get().energy||eventSession.stage===4||current===eventSession&&!root.hidden)return;const changed=E.advance(eventSession);if(changed.stage)notifyEvents();},187.5);
  window.addEventListener('pagehide',()=>{clearInterval(timer);clearInterval(recognitionTimer);});
  window.addEventListener('hc-story-change',syncHome);
  syncSavingServices();syncHome();
})();

(()=>{let pending=false;function sync(){pending=false;document.querySelectorAll('#hc-energy-root svg[preserveAspectRatio="none"]').forEach(svg=>{const v=svg.viewBox.baseVal,r=svg.getBoundingClientRect();if(!r.width||!r.height||!v.width||!v.height)return;const ratio=r.width*v.height/(r.height*v.width);svg.querySelectorAll('text').forEach(t=>{const x=parseFloat(t.getAttribute('x'))||0,y=parseFloat(t.getAttribute('y'))||0;t.setAttribute('transform',`translate(${x} ${y}) scale(1 ${ratio}) translate(${-x} ${-y})`);});});}function queue(){if(!pending){pending=true;requestAnimationFrame(sync);}}new MutationObserver(queue).observe(document.getElementById('hc-energy-root'),{childList:true,subtree:true});new ResizeObserver(queue).observe(document.getElementById('screen'));window.addEventListener('resize',queue);})();

/* Isolated 3D overview; current cabinet remains the detail view. */
(()=>{const screen=document.getElementById('screen');const wrap=document.createElement('section');wrap.id='home-room-overview';wrap.setAttribute('aria-label','多机柜总览');const frame=document.createElement('iframe');frame.setAttribute('aria-label','3D 多机柜总览');frame.setAttribute('sandbox','allow-scripts');const loadScene=async()=>{frame.src="./assets/scenes/multi-cabinet-scene.html";};wrap.append(frame);screen.append(wrap);if(document.readyState==='complete')setTimeout(loadScene,300);else addEventListener('load',()=>setTimeout(loadScene,300),{once:true});
const back=document.createElement('div');back.id='home-room-back';back.innerHTML='<nav aria-label="机柜层级"><button type="button">上海推理模型B5集群</button><span aria-hidden="true">›</span><strong aria-current="page">超节点 A</strong></nav><form><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><input aria-label="定位柜位" placeholder="定位柜位，如 A-03 / 超节点 A"></label></form>';screen.append(back);let overview=true;const sendState=()=>{if(window.HCStory)frame.contentWindow?.postMessage({type:'ccae-story-state',state:{...window.HCStory.get(),titles:Object.fromEntries(['optical','qwen'].map(k=>[k,window.HCEventTitle(k,window.HCStory.get()[k])])),hand:HC_ASSETS.icons['红色小手']}},'*')};window.HCStory?.subscribe(sendState);frame.addEventListener('load',sendState);
const detailLegend=document.createElement('div');detailLegend.id='cabinet-device-legend';detailLegend.innerHTML='<span>设备状态</span><label><input type="checkbox" data-state="fault" checked><i class="fault"></i>故障</label><label><input type="checkbox" data-state="normal"><i class="normal"></i>正常</label>';screen.append(detailLegend);
const selection={fault:true,normal:false};function paintSelection(){screen.classList.toggle('cabinet-hide-normal',!selection.normal);screen.classList.toggle('cabinet-hide-fault',!selection.fault);detailLegend.querySelectorAll('input').forEach(input=>input.checked=selection[input.dataset.state]);}
detailLegend.onchange=e=>{selection[e.target.dataset.state]=e.target.checked;paintSelection();frame.contentWindow.postMessage({type:'ccae-device-filter',selection},'*')};addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='ccae-device-filter'){Object.assign(selection,e.data.selection);paintSelection()}});paintSelection();
function sync(){const resource=!['training','inference'].includes(screen.dataset.category);wrap.hidden=!overview||!resource;detailLegend.hidden=overview||!resource;back.hidden=overview||!resource;screen.classList.toggle('room-overview-active',overview&&resource);screen.classList.toggle('room-detail-active',!overview&&resource);frame.contentWindow?.postMessage({type:'ccae-room-visible',visible:!wrap.hidden},'*')}
back.querySelector('button').onclick=()=>{overview=true;sync()};back.querySelector('form').onsubmit=ev=>{ev.preventDefault();const q=back.querySelector('input').value.trim();overview=true;sync();frame.contentWindow.postMessage({type:'ccae-room-locate',query:q},'*')};addEventListener('message',e=>{if(e.source!==frame.contentWindow)return;if(e.data?.type==='ccae-room-fullscreen'){if(document.fullscreenElement)document.exitFullscreen();else wrap.requestFullscreen?.().catch(()=>{});return;}if(e.data?.type==='ccae-room-ready'){sendState();sync();return;}if(e.data?.type!=='ccae-room-enter'||e.data.index!==0)return;overview=false;sync()});new MutationObserver(sync).observe(screen,{attributes:true,attributeFilter:['data-category']});sync();})();

}
