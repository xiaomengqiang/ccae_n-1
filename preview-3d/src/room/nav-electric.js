function motionLegend(){
 boardResize?.disconnect();
 const legend=$('r4-legend'),svg=$('stageInner').querySelector('svg');
 if(legend&&S.view.lv!=='cluster'){
  legend.insertAdjacentHTML('beforeend','<svg class="fiber-legend" viewBox="0 0 90 18" width="90" height="18" aria-label="Fiber 流光"><path d="M 0 9 L 90 9" fill="none" stroke="#62b997" stroke-width="1.2"/><g/></svg><span>Fiber</span>');
  if(legend.querySelector('.fiber-legend g'))flowHandles.push(CCAE_MOTION.attachOpticalFlow(legend.querySelector('.fiber-legend g'),['M 0 9 L 90 9'],{layers:[[26,.22],[9,.62]],width:2,speedPxS:45,cycleMs:2700}));
 }else if(svg){
  const g=document.createElementNS(NS,'g');g.setAttribute('class','fiber-legend');g.innerHTML='<path d="M 1240 1010 L 1300 1010" fill="none" stroke="#62b997" stroke-width="1.2"/><text x="1310" y="1015" fill="#c6c9cb" font-size="12">Fiber</text><g/>';svg.append(g);
  flowHandles.push(CCAE_MOTION.attachOpticalFlow(g.querySelector('g'),['M 1240 1010 L 1300 1010'],{layers:[[18,.22],[6,.62]],width:1.6,speedPxS:30,cycleMs:2700}));
 }
 if(svg?.classList.contains('r2-board-svg')){
  svg.setAttribute('preserveAspectRatio','none');
  // Preserve lettering and model proportions while the panel grid fills the available width.
  const elements=[...svg.querySelectorAll('text,image,circle')].map(el=>({el,original:el.getAttribute('transform')||''}));
  const fit=()=>{const box=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,k=(box.height/vb.height)/(box.width/vb.width);if(!Number.isFinite(k)||k<=0)return;elements.forEach(({el,original})=>{const b=el.getBBox(),cx=b.x+b.width/2;el.setAttribute('transform',original+` translate(${cx} 0) scale(${k.toFixed(6)} 1) translate(${-cx} 0)`)});};
  boardResize=new ResizeObserver(fit);boardResize.observe(svg);fit();

 }
}
// Fade-through plus a critically damped cabinet relocation; topology follows after 620ms.
const navClick=$('navseg').onclick;let navToken=0,navTimer=null;
$('navseg').onclick=function(e){const b=e.target.closest('[data-nav]');if(!b||b.dataset.nav===S.nav)return;const token=++navToken;clearTimeout(navTimer);if(CCAE_MOTION.REDUCED)return navClick.call(this,e);const stage=$('stage'),old=$('stageInner').querySelector('svg');let snapshot=old?.cloneNode(true),oldRect=old?.getBoundingClientRect();const mini=old?.querySelector('#miniPhys');if(S.nav==='biz'&&mini){const box=mini.getBBox();snapshot=document.createElementNS(NS,'svg');snapshot.setAttribute('viewBox',`${box.x} ${box.y} ${box.width} ${box.height}`);snapshot.append(mini.cloneNode(true));oldRect=mini.getBoundingClientRect();}$('kpifloat').animate([{opacity:1},{opacity:0}],{duration:200,easing:'cubic-bezier(.4,0,1,1)'});$('stageInner').animate([{opacity:1},{opacity:0}],{duration:200,easing:'cubic-bezier(.4,0,1,1)'});navTimer=setTimeout(()=>{if(token!==navToken)return;navClick.call(this,e);const target=$('stageInner').querySelector('#miniPhys')||$('stageInner').querySelector('svg');if(snapshot&&target&&oldRect){const sr=stage.getBoundingClientRect(),tr=target.getBoundingClientRect(),scale=sr.width/stage.clientWidth;const overlay=document.createElement('div');overlay.className='view-motion-overlay';Object.assign(overlay.style,{left:'0',top:'0',width:oldRect.width/scale+'px',height:oldRect.height/scale+'px'});overlay.append(snapshot);stage.append(overlay);snapshot.style.width='100%';snapshot.style.height='100%';const x=(oldRect.left-sr.left)/scale,y=(oldRect.top-sr.top)/scale,tx=Math.max(stage.clientWidth*.02,(tr.left-sr.left)/scale),ty=Math.max(stage.clientHeight*.02,(tr.top-sr.top)/scale),k=tr.width/oldRect.width;target.style.opacity='0';CCAE_MOTION.springTo({x:0,v:0},1,{k:200,d:28,m:1},t=>{if(token!==navToken){overlay.remove();return}overlay.style.transform=`translate(${x+(tx-x)*t}px,${y+(ty-y)*t}px) scale(${1+(k-1)*t})`;overlay.style.opacity=String(1-t*.8)},()=>{overlay.remove();target.style.opacity=''})}const nodes=$('stageInner').querySelectorAll('.lgnode');nodes.forEach((el,i)=>el.animate([{opacity:0,translate:'0 14px',scale:'.9'},{opacity:1,translate:'0 0',scale:'1'}],{duration:700,delay:420+Math.floor(i/8)*320+Math.min(i%8,7)*40,easing:'cubic-bezier(0,0,.2,1)',fill:'backwards'}));$('kpifloat').animate([{opacity:0},{opacity:1}],{duration:300,delay:400,fill:'backwards'});},200)};

// Electrical paths retain their original geometry and styling; only subtle particles are added.
function electricLinks(svg){
 if(!svg.classList.contains('r2-board-svg'))return;
 const paths=[...svg.querySelectorAll('path[stroke]')].filter(p=>/C/.test(p.getAttribute('d')||'')&&p.getAttribute('fill')==='none'&&!p.matches('.fiber-link,.r4-l2-link,.r7-rack-link,.r4-union-outline')&&!p.closest('.fiber-legend,.optical-flow,defs'));
 paths.forEach(p=>{
  // Low opacity also denotes default overview links; filter only focused card connections.
  const focusedCardLink=p.matches('.hf-live-link,.r3-card-link')||S.view.t==='cpublade';
  if(focusedCardLink&&p.hasAttribute('opacity')&&+p.getAttribute('opacity')<.3){p.remove();return;}
  p.classList.remove('flow','kvflow');
  p.classList.add('electric-dashed');
  p.setAttribute('stroke-dasharray','9 10');
  p.setAttribute('stroke-width','1.4');
  p.setAttribute('stroke-linecap','round');
  p.setAttribute('stroke-linejoin','round');
  p.setAttribute('opacity','.8');
  p.style.setProperty('stroke-dasharray','9 10','important');
  if(!CCAE_MOTION.REDUCED)p.animate([{strokeDashoffset:0},{strokeDashoffset:-19}],{duration:1100,iterations:Infinity,easing:'linear'});
 });
}

// Original motion footage is used only while the interactive rack changes faces.
