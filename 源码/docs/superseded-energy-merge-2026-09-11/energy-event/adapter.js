/* The frame contains only the delivered energy module. Removing it cancels its lifetime. */
(()=>{
 const notify=(action)=>parent.postMessage({type:'hc-energy',action},location.origin==='null'?'*':location.origin);
 let reported=false;
 window.openEnergyDrillV2();
 const view=document.getElementById('energyDrillView');
 view.querySelector('.energy-head p').textContent=parent.HCClock.format(-40908,true);
 view.querySelector('.energy-back').onclick=()=>notify('close');
 function sync(){
  const applied=view.classList.contains('energy-monitor-active'),input=view.querySelector('.energy-chat input');
  if(input){input.disabled=!applied;if(!applied)input.placeholder='应用策略后可生成节能报告';}
  if(applied&&!reported){reported=true;notify('applied')}
 }
 new MutationObserver(sync).observe(view,{childList:true,subtree:true});sync();
 function downloadReport(){
  window.openEnergyMonthlyReport();
  const report=view.querySelector('.energy-report-tab-page .emr-report-inner').cloneNode(true);
  report.querySelectorAll('button,.emr-local-tip').forEach(n=>n.remove());
  const css=[...document.querySelectorAll('style')].map(n=>n.textContent).join('\n');
  const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>2026年8月节能月报</title><style>'+css+'\nbody{height:auto;overflow:auto;background:#101411;padding:24px}#energyDrillView.energy-v2{position:static!important;display:block!important;height:auto!important} .energy-report-tab-page{display:block!important;overflow:visible!important;height:auto!important}.emr-report-inner{max-width:1440px;margin:auto}</style></head><body><section id="energyDrillView" class="energy-v2"><main class="energy-report-tab-page active">'+report.outerHTML+'</main></section></body></html>';
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='智慧体守护_2026年8月节能月报.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 document.addEventListener('click',e=>{
  if(e.target.closest('.energy-report-download,.emr-download')){e.preventDefault();downloadReport();}
  if(e.target.closest('.energy-export')){
   const selected=view.querySelector('.energy-strategy.active');
   const blob=new Blob([JSON.stringify({service:'Qwen3.7',strategy:selected?.dataset.strategy,forecast:selected?.innerText,generatedAt:parent.HCClock.format(undefined,true)},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Qwen3.7-节能策略.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 });
})();
