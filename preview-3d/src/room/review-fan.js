function fanBladesMarkup(){return '<g fill="#35393d"><path d="M14 12C7 11 8 3 14 4C20 5 19 10 16 13Z"/><path d="M16 14C20 8 26 13 22 18C18 22 15 19 14 16Z"/><path d="M13 16C15 23 7 25 5 19C3 13 8 12 12 14Z"/><circle cx="14" cy="14" r="2.4"/></g>';}
CATOF.ioblade='io';CATOF.mgmtblade='power';CATOF.pwrbox='power';
CATS.push({k:'io',nm:'灵衢RoCE板',get:p=>p.io},
 {k:'power',nm:'管理刀片和电源',get:p=>[1,2,3].map(i=>({...p.pwr,id:p.id+'-PW'+i,name:'管理刀片和电源'+pad2(i),kw:p.pwr.kw/3,mods:6,modsOk:6}))});
const reviewFindObj=findObj;findObj=function(t,id,ctx){if(t==='pwrbox'&&/^P\d+-PW[123]$/.test(id)){const p=findPod(id.split('-')[0]);return p?CATS.find(c=>c.k==='power').get(p).find(o=>o.id===id):null;}return reviewFindObj(t,id,ctx);};
const reviewTnode=tnode;tnode=function(id,ic,nm,bd,st,d,kids,pl,cls){
 let count=null;
 if(id.includes('/')){const [pid,k]=id.split('/'),pod=findPod(pid),cat=CATS.find(c=>c.k===k);if(pod&&cat)count=cat.get(pod).length;}
 else if(/^P\d+$/.test(id)){const p=findPod(id);if(p)count=CATS.reduce((n,c)=>n+c.get(p).length,0);}
 if(count!==null)nm+=' <span class="review-count">('+count+')</span>';
 return reviewTnode(id,ic,nm,bd,st,d,kids,pl,cls);
};
function reviewFanInk(){const svg=$('stageInner').querySelector('svg');if(!svg||S.mode==='health')return;
 if(!svg.querySelector('#review-fan-dark'))svg.insertAdjacentHTML('afterbegin','<defs><filter id="review-fan-dark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .208 0 0 0 0 .224 0 0 0 0 .239 0 0 0 1 0"/></filter></defs>');
 svg.querySelectorAll('[data-act="part"][data-id*="风扇"]').forEach(g=>{const circle=g.querySelector('circle'),im=g.querySelector('image');if(circle&&im&&(circle.getAttribute('fill')||'').toLowerCase()==='#fcc800')im.setAttribute('filter','url(#review-fan-dark)');});
}
const reviewDetailsRender=render;render=function(){reviewDetailsRender();reviewFanInk();};
const reviewDetailsRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){reviewDetailsRefresh();reviewFanInk();};
if(window.__roomBooted)render();

// Mixed rows with contiguous color runs. Cabinets 15/16 retain their original telemetry.
