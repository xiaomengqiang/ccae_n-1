import { HOME_WORKLOADS } from "../../mock/workloads.js";
import { HC_ASSETS } from "../../mock/hc-assets.js";

export function initStory() {
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
const C = window.HCComponents;
const mount = function (id, node) { document.getElementById(id).replaceChildren(node); };
}
