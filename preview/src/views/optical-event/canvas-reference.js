// 画布引用 —— 逐字提取自 event.js（自安装 IIFE，import 即生效）。
// 右键拓扑节点/图表/处理环节卡片 → 引用 chip + 快捷查询 + 智慧体对话（演示回复）。
// MutationObserver 监听 #optical-event-root（挂载前 fallback #screen），React 渲染的 .hc-composer 同样可被捕获。

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
 // 模块顶层 import 时 #optical-event-root / #screen 均未渲染，退化为观察整棵文档树（超集，行为不变）
 // window.MutationObserver：沙箱/headless 环境仅挂 window，裸引用会 ReferenceError（浏览器等价）
 new window.MutationObserver(records=>{if(records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(node.matches?.('.hc-composer')||node.querySelector?.('.hc-composer')))))initialize();}).observe(document.getElementById('optical-event-root')||document.getElementById('screen')||document.documentElement,{childList:true,subtree:true});initialize();
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
