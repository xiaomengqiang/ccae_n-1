// optical-event 命令式事件逻辑（从 legacy.js 提取，绘制/拓扑/连线保持原样）
// 包含 6 个顶级模块：HCEventUI / HCEntrance / quickQuery / HCOpticalEventUI / HCEventModule / optical host
// 硬编码坐标和连线数据后续讨论是否抽公共拓扑框架
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import { bridgeEventTypeIcon, bridgeComposer, bridgeNode, mountIsland } from "../../shared/react-bridge.js";
import IsolationAnimationView from "./isolation-animation.jsx";
import Topology2D from "./topology-2d.jsx";

let cleanup = null;

export function mountOpticalEvent() {
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
// 遗留工厂（命令式保留）—— 从 HCEventModule 提取的自包含模块：
// TrendChart：实时趋势图引擎（update 每秒驱动 / setRecoveryTime / 悬浮联动）
// CleaningIllustration：清污示意图（crossfade 过渡只展示一次）
// ExperienceSummary：经验沉淀卡（打字流式动画；state 为外部可变引用，onReplace 回调换卡）
window.HCOpticalParts = (() => {
  const el = (tag, className = '', text) => { const n = document.createElement(tag); n.className = className; if (text !== undefined) n.textContent = text; return n; };
  const icon = (name, size = 16) => { const n = el('img', 'evt-icon'); n.src = OPTICAL_ASSETS.icons[name]; n.alt = ''; n.width = n.height = size; return n; };
  const button = (label, className = '', onClick) => { const n = el('button', className, label); n.type = 'button'; if (onClick) n.addEventListener('click', onClick); return n; };
  const Badge = (text, tone = 'done') => el('span', `evt-badge evt-badge-${text === '已闭环' ? 'closed' : tone}`, text);
  const CLEANING_ART={"dirty": "./assets/uploads/dirty.png", "clean": "./assets/uploads/clean.png"};
let cleanArtTransitionShown=false;
function CleaningIllustration(cleaned) {
  const figure=el('figure','evt-cleaning-illustration');
  figure.dataset.state=cleaned?'clean':'dirty';
  const image=el('img');
  image.src=cleaned?CLEANING_ART.clean:CLEANING_ART.dirty;
  image.alt=cleaned?'清污完成：居中展示干净的光模块，无手套和清洁笔':'双手佩戴防静电手套，左手握持光模块外壳，右手使用MPO清洁笔对准光口清洁';
  image.width=1899;image.height=829;
  const frame=el('div','evt-cleaning-frame');frame.append(image);
  if(cleaned&&!cleanArtTransitionShown){
    cleanArtTransitionShown=true;
    const previous=el('img','evt-cleaning-previous');previous.src=CLEANING_ART.dirty;previous.alt='';previous.setAttribute('aria-hidden','true');
    frame.append(previous);
    const reveal=()=>{if(frame.classList.contains('evt-cleaning-crossfade'))return;frame.classList.add('evt-cleaning-crossfade');};
    image.addEventListener('load',reveal,{once:true});
    if(image.complete&&image.naturalWidth)reveal();
    previous.addEventListener('animationend',()=>previous.remove(),{once:true});
  }
  figure.append(frame,el('figcaption','',cleaned?'清污已完成':'光模块脏污，待人工清污'));
  return figure;
}

function ExperienceSummary(state,onReplace){
  const card=el('section','evt-experience');card.setAttribute('aria-label','智能体经验沉淀');
  card.append(el('p','evt-experience-intro','本次光链路故障已完成处置。我已整理处理过程，形成以下可复用经验'));
  const lessons=[
    ['识别光链路隐患','结合接收光功率与错误计数识别异常。通道4持续低功率且错误计数异常时，应关联检查光模块端面脏污，不能只依赖链路通断状态'],
    ['串联故障因果关系','将光模块脏污、接收功率劣化、链路闪断及伴随告警关联分析，结合计算侧排查结果缩小故障范围'],
    ['沉淀处置与核验流程','先优雅隔离异常链路，再由人工清污；清污后核验光功率恢复与错误计数归零，确认通过后解除隔离']
  ];
  const list=el('ol','evt-experience-lessons');lessons.forEach(([title,copy])=>{const item=el('li');item.append(el('strong','',title),el('p','',copy));list.append(item);});card.append(list);
  const reportText='故障对象：计算柜11·L1交换板02光链路。\n故障表现：链路闪断，通道4接收光功率异常，伴随错误计数异常。\n根因：光链路端面脏污。\n处置过程：异常链路优雅隔离 → 人工清污 → 恢复核验 → 解除隔离。\n核验结果：通道4光功率恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。\n\n'+lessons.map(([title,copy],i)=>(i+1)+'、'+title+'：'+copy).join('\n');
  const report=button('','evt-experience-report',()=>window.HCOpticalEvidence?.show('光链路清污复盘报告','经验沉淀','故障复盘',reportText,report));
  report.append(el('span','evt-experience-file','▤'),el('strong','','光链路清污复盘报告'),el('span','evt-experience-open','查看 ›'));card.append(report);
  const graph=el('div','evt-experience-graph');
  const graphTitle=el('div','evt-experience-graph-title');const graphDetails=button('查看详情','evt-knowledge-details',()=>window.HCOpticalEvidence?.show('经验图谱详情','经验沉淀','故障复盘','本次新增经验：光模块脏污。\n故障类型：业务劣化。\n识别特征：通道4接收光功率持续偏低，伴随错误计数异常。\n处置路径：优雅隔离异常链路 → 人工清污 → 监控核验 → 解除隔离。\n'+lessons.map(([title,copy])=>title+'：'+copy).join('\n'),graphDetails));graphTitle.append(el('strong','','经验图谱'),graphDetails);graph.append(graphTitle);
  const map=document.createElementNS('http://www.w3.org/2000/svg','svg');
  map.setAttribute('viewBox','0 0 420 250');map.setAttribute('role','img');map.setAttribute('aria-label','经验图谱：故障类型分为业务劣化和业务失败，光模块脏污为本次新增经验');map.classList.add('evt-knowledge-map');
  let dots='';
  for(let ring=0;ring<7;ring++){const count=24+ring*7,r=24+ring*7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+ring*.17;dots+='<circle cx="'+(32+Math.cos(a)*r).toFixed(2)+'" cy="'+(130+Math.sin(a)*r).toFixed(2)+'" r="'+(ring<3?1.8:1.3)+'" fill="'+(ring<3?'#a59ae9':'#79c3cd')+'" opacity="'+(.85-ring*.07)+'"/>';}}
  map.innerHTML='<g>'+dots+'</g><g fill="none" stroke="#747b82" stroke-width="1.2"><path d="M92 130H127 M173 130C203 130 204 74 236 74 M173 130C203 130 204 196 236 196 M268 74C291 74 290 38 314 38 M268 74C291 74 290 108 314 108 M268 196C291 196 291 168 314 168 M268 196C291 196 291 226 314 226"/></g><g fill="#dce0e4" font-size="13" font-family="sans-serif"><text x="122" y="134">故障类型</text><text x="219" y="70">业务劣化</text><text x="219" y="192">业务失败</text><text x="313" y="34">光模块脏污</text><text x="313" y="104">NPU掉卡</text><text x="313" y="164">实例异常</text><text x="313" y="222">通信中断</text></g><rect x="316" y="43" width="70" height="20" rx="10" fill="#355e78"/><text x="351" y="57" text-anchor="middle" font-size="11" fill="#b4e7ff">✦ 新经验</text>';
  graph.append(map);card.append(graph);
  const feedback=el('div','evt-experience-feedback'),message=el('p','','我的经验沉淀是否准确？');
  const actions=el('div','evt-experience-actions'),editor=el('div','evt-experience-editor');editor.hidden=true;
  const field=el('textarea');field.placeholder='请填写需要纠正的经验内容';field.setAttribute('aria-label','经验纠正内容');field.value=state.experienceCorrection;
  const update=()=>{
    const confirmed=state.experienceFeedback==='accurate';
    actions.hidden=confirmed;feedback.classList.toggle('is-accurate',confirmed);
    message.replaceChildren();message.setAttribute('role','status');
    if(confirmed){const icon=el('span','evt-experience-confirmed-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';message.append(icon,el('span','','用户反馈此次经验沉淀准确'));}
    else message.textContent=state.experienceFeedback==='corrected'?'已记录你的纠正意见，供后续复盘参考':'我的经验沉淀是否准确？';
  };
  const accurate=button('准确','',()=>{state.experienceFeedback='accurate';editor.hidden=true;update();});
  const correct=button('纠正','',()=>{editor.hidden=false;field.focus();});actions.append(accurate,correct);
  const save=button('保存纠正','',()=>{const value=field.value.trim();if(!value){field.focus();return;}state.experienceCorrection=value;state.experienceFeedback='corrected';editor.hidden=true;update();});
  editor.append(field,save);feedback.append(message,actions,editor);card.append(feedback);update();
  const footer=el('div','evt-experience-footer'),notice=el('span','evt-experience-notice');notice.setAttribute('role','status');
  const icons={refresh:'<path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',like:'<path d="M8 21H3V10h5m0 11h10l3-11h-7l1-6-3-2-4 8z"/>',dislike:'<path d="M8 3H3v11h5M8 3h10l3 11h-7l1 6-3 2-4-8z"/>'};
  const toolbar=el('div','evt-experience-tools');
  const action=(name,icon,fn)=>{const b=button('','',fn);b.title=name;b.setAttribute('aria-label',name);b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[icon]+'</svg>';toolbar.append(b);return b;};
  action('重新生成经验','refresh',()=>{const fresh=ExperienceSummary(state,onReplace);onReplace?.(fresh);card.replaceWith(fresh);fresh.querySelector('.evt-experience-notice').textContent='已根据本次处置记录重新整理';});
  action('复制经验','copy',async()=>{try{await navigator.clipboard.writeText(reportText);notice.textContent='已复制';}catch{const text=el('textarea');text.value=reportText;card.append(text);text.select();const ok=document.execCommand('copy');text.remove();notice.textContent=ok?'已复制':'复制失败，请重试';}});
  let up,down;up=action('有帮助','like',()=>{state.experienceRating='like';up.setAttribute('aria-pressed','true');down.setAttribute('aria-pressed','false');notice.textContent='感谢反馈';});
  down=action('没有帮助','dislike',()=>{state.experienceRating='dislike';down.setAttribute('aria-pressed','true');up.setAttribute('aria-pressed','false');editor.hidden=false;field.focus();});
  up.setAttribute('aria-pressed',String(state.experienceRating==='like'));down.setAttribute('aria-pressed',String(state.experienceRating==='dislike'));
  footer.append(notice,toolbar);card.append(footer);return card;
}
// 内容真实逐字增长，不预留完整卡片高度；不强制改变用户的滚动位置。

function streamExperience(card, delayStart = 0) {
  const timers = new Set();
  const safeLater = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (card.isConnected) fn(); }, Math.max(0, ms)); timers.add(id); };
  const intro=card.querySelector('.evt-experience-intro');
  const list=card.querySelector('.evt-experience-lessons');
  const items=Array.from(list.children);
  const tail=Array.from(card.children).filter(node=>node!==intro&&node!==list);
  const blocks=[intro,...items];
  const texts=blocks.map(block=>Array.from(block.querySelectorAll('strong,p')).length
    ?Array.from(block.querySelectorAll('strong,p')):[block]);
  const originals=new Map();texts.flat().forEach(node=>{originals.set(node,Array.from(node.textContent));node.textContent='';});
  blocks.forEach(node=>{node.hidden=true;});tail.forEach(node=>{node.hidden=true;});list.hidden=true;card.hidden=true;
  const active=()=>card.isConnected;
  const revealTail=index=>{
    if(!active())return;
    const node=tail[index];if(!node){card.removeAttribute('aria-busy');return;}
    node.hidden=false;
    if(node.animate){const height=node.offsetHeight;node.animate([{height:'0px',opacity:0,overflow:'hidden'},{height:height+'px',opacity:1,overflow:'hidden'}],{duration:360,easing:'ease-out'});}
    safeLater(()=>revealTail(index+1),400);
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
      if(offset<chars.length){safeLater(tick,24);return;}
      if(++part<texts[index].length){offset=0;safeLater(tick,60);}else safeLater(()=>writeBlock(index+1),120);
    };tick();
  };
  card.setAttribute('aria-busy','true');
  safeLater(()=>{if(!active())return;card.hidden=false;writeBlock(0);},Math.max(0,experienceStartedAt+2000-Date.now()));
}

function TrendChart(cleanedAt=null, recovery=false, monitorStartedAt=Date.now()) {
  const card = el('div', 'evt-chart-card');
  card.append(el('h3', 'evt-chart-title', '光链路通道功率与错误计数趋势'));
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
  const stack=el('div','evt-chart-stack');
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
  const powerPanel=el('div','evt-chart-panel');
  const errorPanel=el('div','evt-chart-panel');
  powerPanel.append(powerSvg);errorPanel.append(errorSvg);stack.append(powerPanel,errorPanel);
  const guide=el('div','evt-chart-guide');guide.hidden=true;
  const powerTip=el('div','evt-chart-tooltip');const errorTip=el('div','evt-chart-tooltip');
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

  return { CleaningIllustration, ExperienceSummary, streamExperience, TrendChart };

})();



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
    if(isolationOnly)headingCopy.querySelector('h1').append(U.Badge('已闭环','done'));const headingEventIcon=bridgeEventTypeIcon({closed:isolationOnly,size:36});headingEventIcon.classList.add('evt-icon');heading.append(back,headingEventIcon,headingCopy);left.append(heading);
    const intro=U.el('div','evt-diagnosis-intro');
    intro.append(U.el('p','','已经为您分析并生成故障的诊断，请查看后立即处理'));
    const expand=U.button('','evt-expand-all',()=>{const next=!state.expanded.every(Boolean);state.expanded=[next,next,next,next];renderHistory(false);});
    expand.append(U.icon('展开全部',12),U.el('span','','展开全部'));intro.append(expand);left.append(intro);
    const scroll=U.el('div','evt-diagnostic-scroll');left.append(scroll);
    const composerWrap=U.el('div','evt-composer-wrap');
    const composer=bridgeComposer({value:state.draft,onSend:()=>{}});
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
    let experienceCard=null, experienceStartedAt=0;
    let completeCleaning=null;
    if(!isolationOnly){const clean=()=>{if(liveStage<6||state.cleanedAt!==null)return;state.cleanedAt=HCClock.seconds();experienceStartedAt=Date.now();state.phase='reviewed';state.view=6;focusIndex=null;renderHistory(true);renderTimeline();const row=scroll.querySelector('.evt-recovery-row[data-view="6"]');if(row){const copy=U.el('div','evt-cleanup-copy');copy.append(...Array.from(row.children).filter(n=>n.matches('strong,p')));row.prepend(copy);const released=scroll.querySelector('.evt-recovery-row[data-view="7"]');if(released){released.dataset.streamHidden=released.style.visibility;released.style.visibility='hidden';}entrance.stream(copy,0,()=>{if(!released||!released.isConnected)return;released.style.visibility='';delete released.dataset.streamHidden;entrance.stream(released);});}onComplete({eventId,result:'resolved'});};completeCleaning=clean;}
    const topologyHost=U.el('div');right.append(topologyHost);
    const topologyIsland=mountIsland(topologyHost,Topology2D,{view:state.view,isolationOnly,cleanedAt:state.cleanedAt,onFaultPortClean:completeCleaning});

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
      });topologyIsland.update({view:state.view,isolationOnly,cleanedAt:state.cleanedAt,onFaultPortClean:completeCleaning});applyFocus();
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
    function renderHistory(toBottom=false) {
      entrance.stop();
      const allOpen=state.expanded.every(Boolean);expand.querySelector('span').textContent=allOpen?'收起全部':'展开全部';expand.setAttribute('aria-expanded',String(allOpen));
      headingCopy.querySelector('h1').textContent=liveStage<4?'光链路故障分析中':liveStage<6?'光链路脏污，自动处理中':'光链路脏污，待人工清污';if(isolationOnly)headingCopy.querySelector('h1').replaceChildren(document.createTextNode('光链路闪断，已完成优雅隔离'),U.Badge('已闭环','closed'));if(!isolationOnly&&liveStage>=6){headingCopy.querySelector('h1').textContent=state.cleanedAt===null?'光链路脏污，待人工清污':'光链路已清污，隔离已解除';headingCopy.querySelector('h1').append(U.Badge(state.cleanedAt===null?'待人工处理':'已闭环',state.cleanedAt===null?'manual':'closed'));}const headingIcon=heading.querySelector(':scope > .evt-icon');if(headingIcon){const nextIcon=bridgeEventTypeIcon({closed:isolationOnly||state.cleanedAt!==null,size:36});nextIcon.classList.add('evt-icon');headingIcon.replaceWith(nextIcon);}const oldScroll=scroll.scrollTop;scroll.replaceChildren();
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
      if(!isolationOnly&&liveStage>=6){awareness.replaceChildren(bodyText('12:00:00 感知光链路闪断告警，后续定位为光链路脏污'));const snapshot=window.HCOpticalParts.TrendChart();snapshot.update(28);snapshot.update=null;
      const historyEnd=12*3600+28,historyTimes=Array.from({length:8},(_,i)=>{const t=Math.round(historyEnd-(7-i)*15*60);return [Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(v=>String(v).padStart(2,'0')).join(':');});
      snapshot.querySelectorAll('.evt-chart-time').forEach((n,i)=>n.textContent=historyTimes[i%8]);
      snapshot.querySelectorAll('.evt-chart-bar title').forEach((n,i)=>n.textContent=n.textContent.replace(/^.*?：/,historyTimes[i]+'：'));
      snapshot.querySelector('svg').setAttribute('aria-label','四通道光功率及错误计数趋势：尚未清污，每15分钟采样，10:15:28至12:00:28');snapshot.querySelectorAll('svg>text[x="30"]').forEach(n=>{n.setAttribute('x','16');n.setAttribute('text-anchor','start');});snapshot.querySelectorAll('svg>text[x="411"]').forEach(n=>n.setAttribute('x','397'));snapshot.classList.add('evt-static-chart');analysis.replaceChildren(bodyText('12:00:28 完成光链路状态分析：通道4从12:00:00开始处于异常低功率状态，截至12:00:28已持续28秒，光功率约为−12.9dBm；同期通道1～3保持在0～−1dBm，错误计数持续异常'),snapshot);}
      const recovery=U.el('div');const recoveryCard=U.el('div','evt-card evt-recovery');
      const isolated=U.el('div','evt-recovery-row');isolated.dataset.view='4';isolated.append(recoveryTitle('已完成L1-L2异常链路优雅隔离','12:00:40'));
      isolated.append(bridgeNode(IsolationAnimationView));
      isolated.append(U.MetricComparison({label:'带宽',before:'3.2',after:'2.4',unit:'Tb/s',changeLabel:'25%',direction:'down'}),U.MetricComparison({label:'流量',before:'420',after:'450',unit:'Gb/s',changeLabel:'7.14%',direction:'up'}));
      const manual=U.el('div','evt-recovery-row');manual.dataset.view='5';manual.append(recoveryTitle('持续监控光链路状态','12:00:40'));
      if(state.cleanedAt===null)manual.append(bodyText('正在持续监控计算柜11-L1交换板02的光链路。1～3通道保持正常，通道4仍处于异常低功率状态，链路错误计数仍有异常，等待人工清污'));
      if(!isolationOnly&&liveStage>=6&&state.cleanedAt===null)manual.append(window.HCOpticalParts.CleaningIllustration(false));
      const dataContent=U.el('div','evt-data-content');if(isolationOnly){dataContent.append(isolated);const closed=U.el('div','evt-recovery-row');closed.dataset.view='5';closed.append(recoveryTitle('事件已关闭','12:00:48'));const cleanupLink=U.button('生成光链路清污待办事件','evt-isolation-link evt-cleanup-event-link',()=>{window.closeOpticalEvent();window.openOpticalEvent();});cleanupLink.append(U.el('i','evt-jump-icon'));const related=U.el('div','evt-cleanup-related');related.append(U.el('span','','关联事件：'),cleanupLink);closed.append(related);dataContent.append(closed);}
      if(!isolationOnly){dataContent.append(manual);let chartParent=manual;if(state.cleanedAt!==null){const done=U.el('div','evt-recovery-row');done.dataset.view='6';done.append(recoveryTitle('链路恢复正常，核验已完成','19:19:25'),bodyText(`19:17:10，检测到计算柜11-L1交换板02的光链路清污后恢复正常：通道4光功率回升至0～−1dBm，错误计数降为0，通道1～3始终保持正常。持续观察后，于19:19:25完成链路恢复核验`));done.append(window.HCOpticalParts.CleaningIllustration(true));dataContent.append(done);chartParent=done;}if(liveStage>=6){const chart=window.HCOpticalParts.TrendChart(state.cleanedAt,true,monitorStartedAt);chart.update(HCClock.seconds());chartParent.append(chart);}}
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

      if(!isolationOnly&&state.cleanedAt!==null){const fresh=!experienceCard;if(fresh)experienceCard=window.HCOpticalParts.ExperienceSummary(state,freshCard=>{experienceCard=freshCard;});process.append(experienceCard);if(fresh&&experienceStartedAt)window.HCOpticalParts.streamExperience(experienceCard,Math.max(0,experienceStartedAt+2000-Date.now()));}
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
 document.addEventListener('click',e=>{if(e.target.closest('#home-sidebar button[aria-label="首页"]'))close();});
})();
  cleanup = () => {
    window.closeOpticalEvent?.();
    window.resetOpticalEvent?.();
  };
}

export function unmountOpticalEvent() {
  if (cleanup) { cleanup(); cleanup = null; }
}
