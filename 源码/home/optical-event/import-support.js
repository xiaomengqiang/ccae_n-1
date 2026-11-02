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
