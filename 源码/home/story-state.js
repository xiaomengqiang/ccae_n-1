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
