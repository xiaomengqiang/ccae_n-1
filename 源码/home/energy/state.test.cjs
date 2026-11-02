const assert=require('node:assert/strict');
const E=require('./state.js');
const s=E.create('Qwen3.7',{npu:'128'},true);
for(let i=0;i<15;i++)E.advance(s);
assert.equal(s.stage,3);assert.equal(s.logs.length,0);
E.advance(s);assert.equal(s.stage,4);assert.equal(s.logs.length,1);
const first=structuredClone(s.logs[0]);
for(let i=0;i<3;i++)E.advance(s);assert.equal(s.logs.length,1);
E.advance(s);assert.equal(s.logs.length,2);
for(let i=0;i<4;i++)E.advance(s);assert.equal(s.logs.length,3);
for(let i=0;i<8;i++)E.advance(s);assert.equal(s.logs.length,3);
E.advance(s);assert.equal(s.logs.length,4);
s.history=0;s.expanded=true;s.monitorOpen=true;
assert.equal(E.requestReport(s,'生成八月月报'),true);
assert.equal(E.requestReport(s,'重复点击'),false);
const logsBefore=s.logs.length;
for(let i=0;i<8;i++)E.advance(s);
assert.equal(s.report.done,true);assert.equal(s.report.step,4);
assert.ok(s.logs.length>logsBefore);assert.equal(s.history,0);assert.equal(s.monitorOpen,false);assert.equal(s.expanded,true);
assert.deepEqual(s.logs[0],first);
assert.equal(E.requestReport(s,'再次生成月报'),true);assert.equal(s.reports.length,2);assert.equal(s.reports[0].done,true);
for(let i=0;i<150;i++)E.advance(s);
assert.equal(s.logs.length,9);assert.equal(s.stage,4);
const before=E.snapshot(s);E.advance(s);assert.notDeepEqual(E.snapshot(s),before);
const other=E.create('视觉理解服务',{npu:'16'});assert.equal(other.stage,4);assert.equal(other.logs.length,0);assert.equal(other.reports.length,0);
assert.deepEqual(s.logs[0],first);
console.log('节能状态检查通过：四步流程、4秒/9秒日志节奏、9条上限、报告与监控并行、多轮报告、历史快照及服务隔离。');

const moving=E.create('Qwen3.7',{npu:'64'});E.appendLog(moving);const w0=E.runtimeWindow(moving);for(let i=0;i<5;i++)E.advance(moving);const w1=E.runtimeWindow(moving);assert.equal(w1.now-w0.now,5);assert.equal(w1.samples[0].second-w0.samples[0].second,5);assert.deepEqual(w0.samples[1],w1.samples[0]);moving.history=0;const historyWindow=E.runtimeWindow(moving);E.advance(moving);assert.deepEqual(E.runtimeWindow(moving),historyWindow);moving.history=null;assert.notEqual(E.runtimeWindow(moving).now,historyWindow.now);assert.equal((1280*3600000/16800000).toFixed(2),'274.29');console.log('时间窗推进、历史冻结及J/Token换算检查通过。');

// 策略生效后，实际功耗应接近策略预测值；生效前沿基线运行。
{
  const energy = require('./state.js');
  const assertPower = require('node:assert/strict');
  const s = energy.create('功耗验证', {npu:'48'}, true);
  s.effectiveAt = energy.time(16,s.base);
  for(let t=0;t<16;t++) {
    const v=energy.snapshot({...s,elapsed:t,liveTick:t});
    assertPower.equal(v.power,v.baselinePower);
  }
  for(let t=24;t<120;t++) {
    const v=energy.snapshot({...s,elapsed:t,liveTick:t});
    assertPower.ok(Math.abs(v.power-v.optimizedPower)<=.31);
    assertPower.ok(v.power<v.baselinePower);
  }
}
console.log('策略前基线与策略后实际功耗贴近预测检查通过。');
{
 const E=require('./state.js'),a=require('node:assert/strict');
 const s=E.create('节点联动',{npu:'48',ttft:'146 ms',tpot:'18.2 ms'});
 E.appendLog(s);const start=s.logs[0];
 a.equal(E.nodeState(s,start.nodeIndex).status,start.rise?'识别请求上升':'识别请求下降');
 for(let i=0;i<4;i++)E.advance(s);
 const applied=s.logs[1];
 a.equal(E.nodeState(s,start.nodeIndex).npu,applied.toNpu);
 a.equal(E.nodeState(s,start.nodeIndex,0).npu,start.fromNpu);
 a.equal(E.nodeState(s,2).status,'稳定运行');
 for(let i=0;i<4;i++)E.advance(s);
 a.equal(E.nodeState(s,start.nodeIndex).status,'服务验证无异常');
 a.equal(E.nodeState(s,start.nodeIndex,s.elapsed+4).status,'稳定运行');
 a.equal(E.nodeState(s,start.nodeIndex,s.elapsed).status,'服务验证无异常');
}
console.log('节点调频、隔离及历史频率回看检查通过。');
