const rackClips={front:HF_EMBEDDED_ASSETS['rack-front-back.mp4'],back:HF_EMBEDDED_ASSETS['rack-back-front.mp4'],enter:HF_EMBEDDED_ASSETS['rack-enter.mp4']};
// Blob URLs avoid passing long embedded data URLs to the mobile media player.
const rackClipURLs={};
function rackClipURL(kind){
 if(rackClipURLs[kind])return rackClipURLs[kind];
 const source=rackClips[kind];if(!source?.startsWith('data:'))return source;
 const bytes=Uint8Array.from(atob(source.split(',')[1]),c=>c.charCodeAt(0));
 return rackClipURLs[kind]=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));
}
let rackPlayback=null;
function playRackClip(kind,commit=()=>{}){
 if(rackPlayback)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.remove('ccae-booting');commit();return;}
 const stage=$('stage'),svg=$('stageInner').querySelector('.r2-home-svg');
 if(!svg){document.documentElement.classList.remove('ccae-booting');commit();return;}
 const overlay=document.createElement('div');overlay.className='rack-video-overlay';
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('x5-playsinline','');video.setAttribute('x5-video-player-type','h5-page');video.setAttribute('x5-video-player-fullscreen','false');video.preload='auto';if(kind==='enter'){video.defaultPlaybackRate=.8;video.playbackRate=.8;video.onloadedmetadata=()=>video.playbackRate=.8;}video.src=rackClipURL(kind);overlay.append(video);stage.append(overlay);
 const fitVideo=()=>{
  const rect=stage.getBoundingClientRect(),scale=rect.width/stage.clientWidth,matrix=svg.isConnected?svg.getScreenCTM():$('stageInner').querySelector('svg')?.getScreenCTM();if(!matrix)return;
  const a=new DOMPoint(28,436).matrixTransform(matrix),b=new DOMPoint(1892,896).matrixTransform(matrix);
  const bounds=kind==='enter'?{x:476,y:1188,w:2910,h:660}:{x:340,y:1190,w:3160,h:730};const sx=(b.x-a.x)/bounds.w/scale,sy=(b.y-a.y)/bounds.h/scale;
  const w=3840*sx,h=2160*sy,left=(a.x-rect.left)/scale-bounds.x*sx,top=(a.y-rect.top)/scale-bounds.y*sy;
  Object.assign(video.style,{width:w+'px',height:h+'px',left:left+'px',top:top+'px'});
 };
 fitVideo();const videoResize=new ResizeObserver(fitVideo);videoResize.observe(stage);
 let done=false,committed=false,started=false,fallbackStarted=false;
 const finish=()=>{if(done)return;done=true;videoResize.disconnect();clearTimeout(timeout);video.pause();if(!committed){committed=true;commit();}document.documentElement.classList.remove('ccae-booting');overlay.style.transition='opacity 500ms linear';stage.classList.remove('rack-video-active');overlay.style.opacity='0';setTimeout(()=>{video.pause();video.removeAttribute('src');video.load();overlay.remove();if(rackPlayback===cancel)rackPlayback=null;flipping=false;},500);};
 const cancel=()=>{committed=true;finish()};rackPlayback=cancel;
 const fallback=()=>{
  if(done||fallbackStarted)return;fallbackStarted=true;video.pause();overlay.style.opacity='0';stage.classList.remove('rack-video-active');document.documentElement.classList.remove('ccae-booting');
  const target=$('stageInner');
  if(kind==='enter'){
   finish();target.animate([{opacity:0,transform:'translateY(45px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:900,easing:'cubic-bezier(.2,.7,.2,1)'});
  }else{
   const first=target.animate([{opacity:1,transform:'scaleX(1)'},{opacity:.35,transform:'scaleX(.04)'}],{duration:320,easing:'ease-in',fill:'forwards'});
   first.onfinish=()=>{finish();first.cancel();target.animate([{opacity:.35,transform:'scaleX(.04)'},{opacity:1,transform:'scaleX(1)'}],{duration:380,easing:'ease-out'});};
  }
 };
 const timeout=setTimeout(()=>{if(!started)fallback();else finish();},window.CCAE_LIGHT?8000:6000);
 video.onplaying=()=>{started=true;fitVideo();overlay.style.transition='opacity 200ms linear';overlay.style.opacity='1';stage.classList.add('rack-video-active');document.documentElement.classList.remove('ccae-booting');};
 video.ontimeupdate=()=>{if(video.currentTime>=(kind==='enter'?1.6:1.45))finish()};
 video.onended=finish;video.onerror=fallback;video.play().catch(fallback);
}
$('flipBtn').onclick=e=>{e.stopPropagation();if(rackPlayback||S.view.lv!=='cluster')return;const face=S.face;flipping=true;playRackClip(face,()=>{S.face=face==='front'?'back':'front';introArm();render()})};
// The event drill transition keeps the destination data and controls live.
const videoGo=go;let drillAnimation=null;
go=function(v){if(v?.t==='ioblade')return;
 const from=S.view.lv,source=$('stageInner').querySelector('svg'),sourceRect=source?.getBoundingClientRect(),sourceMatrix=source?.getScreenCTM(),previous=from==='cluster'?source?.cloneNode(true):null;
 drillAnimation?.cancel();document.querySelectorAll('.rack-drill-out').forEach(el=>el.remove());rackPlayback?.();
 if(from==='cluster'&&v.lv!=='cluster')hfSetTree(true);
 videoGo(v);
 if(from!=='cluster'||v.lv==='cluster'||CCAE_MOTION.REDUCED||!previous)return;
 const matrix=sourceMatrix,a=new DOMPoint(28,436).matrixTransform(matrix),b=new DOMPoint(1892,896).matrixTransform(matrix);Object.assign(sourceRect,{x:a.x,y:a.y,width:b.x-a.x,height:b.y-a.y});previous.setAttribute('viewBox','28 436 1864 460');previous.setAttribute('preserveAspectRatio','none');
 previous.querySelectorAll('.optical-flow,animate,animateTransform').forEach(el=>el.remove());
 requestAnimationFrame(()=>{
 const mini=$('hf-overview');if(!mini||!mini.getBoundingClientRect().width)return;
 const r=mini.getBoundingClientRect(),screen=$('screen'),sr=screen.getBoundingClientRect(),scale=sr.width/screen.clientWidth;
 const layer=document.createElement('div');layer.className='rack-drill-out';Object.assign(layer.style,{inset:'auto',left:(sourceRect.left-sr.left)/scale+'px',top:(sourceRect.top-sr.top)/scale+'px',width:sourceRect.width/scale+'px',height:sourceRect.height/scale+'px',transformOrigin:'0 0'});
 layer.append(previous);screen.append(layer);mini.style.visibility='hidden';
 const target=$('stageInner');target.animate([{opacity:0},{opacity:1}],{duration:320,delay:360,fill:'backwards'});
 drillAnimation=layer.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${(r.left-sourceRect.left)/scale}px,${(r.top-sourceRect.top)/scale}px) scale(${r.width/sourceRect.width},${r.height/sourceRect.height})`,opacity:.85}],{duration:680,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
 const cleanup=()=>{layer.remove();mini.style.visibility='';drillAnimation=null};drillAnimation.onfinish=cleanup;drillAnimation.oncancel=cleanup;
 });
};
// A navigation or mode change must never leave footage over a different page.
document.addEventListener('click',e=>{if(rackPlayback&&!e.target.closest('#flipBtn')&&!e.target.closest('.rack-video-overlay'))rackPlayback()},true);
requestAnimationFrame(()=>requestAnimationFrame(()=>{if(r2Home()&&S.face==='front')playRackClip('enter');else document.documentElement.classList.remove('ccae-booting')}));

// Four distinct faults: two optical issues, one CQE port issue, and one HBM issue.
delete OMBAD['P11-S02'];
