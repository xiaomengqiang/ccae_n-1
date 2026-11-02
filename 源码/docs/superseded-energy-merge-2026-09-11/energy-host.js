/* Energy state is independent of service counts and optical/Qwen fault state. */
(()=>{
 const root=document.createElement('section');root.id='energy-event-root';root.hidden=true;document.getElementById('screen').append(root);
 let frame=null,applied=false,appliedAt='';
 function close(){root.hidden=true;}
 function emit(){window.renderStoryGuard?.();window.refreshEnergyRecords?.();}
 window.HCEnergy={get:()=>({applied,appliedAt})};
 window.closeEnergyEvent=close;
 window.openEnergyEvent=()=>{
  window.closeOpticalEvent?.();window.closeNicEvent?.();root.hidden=false;
  if(!frame){frame=document.createElement('iframe');frame.title='Qwen3.7 节能策略与月度报告';frame.srcdoc=ENERGY_PAGE;root.append(frame);}
 };
 window.resetEnergyEvent=()=>{close();frame?.remove();frame=null;applied=false;appliedAt='';emit();};
 window.addEventListener('message',event=>{
  if(event.source!==frame?.contentWindow||event.data?.type!=='hc-energy')return;
  if(event.data.action==='close')close();
  if(event.data.action==='applied'&&!applied){applied=true;appliedAt='今天 '+HCClock.format();emit();}
 });
 document.querySelector('#home-sidebar button[aria-label="首页"]').addEventListener('click',close);
})();
