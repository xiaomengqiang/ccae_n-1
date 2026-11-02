/* Delivered optical event adapter; preserve state when leaving and reopening. */
(()=>{
const screen=document.getElementById('screen'),root=document.createElement('div');root.id='optical-event-root';screen.append(root);let instance=null,savedState=null,detailMode='full';
function reference(category){if(parent!==window)parent.postMessage({type:'hc-home-category',category},location.origin==='null'?'*':location.origin)}
function close(){if(instance){if(detailMode!=='isolation')savedState=instance.exportState();instance.destroy();instance=null;}root.hidden=true;const list=document.getElementById('guard-all');reference(list&&!list.hidden?'events':screen.dataset.category||'resource')}
window.closeOpticalEvent=close;
window.resetOpticalEvent=()=>{close();savedState=null;};
window.openOpticalEvent=({mode='full'}={})=>{if(instance)return;window.closeEnergyEvent?.();window.closeNicEvent?.();detailMode=mode;root.hidden=false;instance=HCEventModule.mount({root,eventId:'optical-link-contamination',initialState:mode==='isolation'?null:savedState,detailMode:mode,entranceMode:'complete',storyStage:window.HCStory?.get().optical??6,onClose:close,onComplete:()=>{savedState=instance.exportState();window.dispatchEvent(new CustomEvent('hc-optical-complete',{detail:{eventId:'optical-link-contamination'}}));}});reference('optical')};root.hidden=true;
window.addEventListener('hc-story-change',e=>instance?.setStoryStage(e.detail.optical));
document.querySelector('#home-sidebar button[aria-label="首页"]').addEventListener('click',close);
})();
