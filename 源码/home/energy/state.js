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
