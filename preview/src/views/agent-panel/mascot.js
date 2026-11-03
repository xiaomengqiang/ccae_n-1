export function mountMascot() {
/* Layered WebP choreography from motion-handoff/specs/14-agent-ip.md. */
(()=>{
  const stage=document.querySelector('.agent-motion');
  if(!stage)return;
  const layers=Object.fromEntries([...stage.querySelectorAll('[data-motion]')].map(el=>[el.dataset.motion,el]));
  const timers=new Set();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let ready=false,disposed=false,previous='';
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
  function clear(){timers.forEach(clearTimeout);timers.clear();}
  function replay(key){
    const el=layers[key],base=el.dataset.base||(el.dataset.base=el.src.split('?')[0]);
    el.src=base+'?r='+Math.random();
  }
  function showIP(key){
    replay(key);
    Object.entries(layers).forEach(([name,el])=>{if(name.startsWith('ip-'))el.classList.toggle('on',name===key);});
  }
  function idle(){
    const key=previous==='ip-glasses'?'ip-typing':previous==='ip-typing'?'ip-glasses':Math.random()<.5?'ip-glasses':'ip-typing';
    previous=key;showIP(key);replay('bg-ring');layers['bg-ring'].classList.add('on');
    later(()=>layers['bg-ring'].classList.remove('on'),2805);
    later(idle,(key==='ip-glasses'?2805:3927)+2000+Math.random()*1600);
  }
  function start(){
    clear();if(!ready||disposed)return;
    Object.values(layers).forEach(el=>el.classList.remove('on'));
    if(reduced.matches){stage.classList.add('motion-static');return;}
    stage.classList.remove('motion-static');previous='';
    ['bg-beam','bg-burst-in'].forEach(key=>{replay(key);layers[key].classList.add('on');});
    showIP('ip-wave');
    later(()=>{replay('bg-particles');layers['bg-particles'].classList.add('on');layers['bg-burst-in'].classList.remove('on');},1780);
    later(idle,6996+2400);
  }
  window.restartMascotEntrance=start;
  reduced.addEventListener('change',start);
  ready=true;start();
  window.addEventListener('pagehide',()=>{disposed=true;clear();reduced.removeEventListener('change',start);},{once:true});
})()
}
