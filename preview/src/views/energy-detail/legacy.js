import { HOME_WORKLOADS } from "../../mock/workloads.js";
import { HC_ASSETS } from "../../mock/hc-assets.js";

export function initEnergyDetail() {
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
  // augmentHome 被禁用：它直接操作 #home-events 内部 DOM（React StoryGuardPanel 管辖区域）
  // 与 React 并发操作导致 removeChild 崩溃。节能事件列表由 React 组件渲染。
  function augmentHome() {}
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
const C = window.HCComponents;
const energyGradeTag = window.energyGradeTag;
}