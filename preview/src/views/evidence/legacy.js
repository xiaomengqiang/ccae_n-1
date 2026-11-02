
export function initEvidenceOrig() {
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
}
