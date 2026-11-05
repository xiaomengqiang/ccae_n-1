const directBoardSfu=sfuStage;
sfuStage=function(P,sw,z){
 const svg=r5Doc(directBoardSfu(P,sw,z));
 const ioGroups=[...svg.querySelectorAll('[data-act="ioblade"]')];
 ioGroups.forEach(g=>{[...g.querySelectorAll('rect')].filter(r=>+r.getAttribute('width')===66).forEach((r,q)=>{
  const label=r.nextElementSibling,chip=document.createElementNS('http://www.w3.org/2000/svg','g');
  chip.setAttribute('class','clk');chip.setAttribute('data-act','ioblade');chip.setAttribute('data-id',g.dataset.id);chip.setAttribute('data-pod',P.id);chip.setAttribute('data-om',String(q));
  g.insertBefore(chip,r);chip.append(r);if(label?.tagName.toLowerCase()==='text')chip.append(label);
 });});
 const sel=S.sel,ncab=D.nets[P.sw.indexOf(sw)];
 const ni=sel?.t==='npublade'?P.npu.findIndex(b=>b.id===sel.id):-1;
 const ii=sel?.t==='ioblade'?P.io.findIndex(b=>b.id===sel.id):-1;
 const li=sel?.t==='netdev'?ncab.dev.findIndex(d=>d.id===sel.id):-1;
 if(z>=0||ni<0&&ii<0&&li<0)return svg.innerHTML;
 svg.querySelectorAll('[data-act="netdev"],[data-act="npublade"],[data-act="uchip"],[data-act="om"]').forEach(g=>g.setAttribute('opacity','.2'));
 ioGroups.forEach(g=>g.setAttribute('opacity','.2'));
 svg.querySelectorAll('path').forEach(p=>{if(/[Cc]/.test(p.getAttribute('d')||'')&&p.getAttribute('fill')==='none')p.remove();});
 const light=(t,id)=>svg.querySelectorAll('[data-act="'+t+'"][data-id="'+id+'"]').forEach(g=>g.setAttribute('opacity','1'));
 let links='';const line=(x,y,a,b,fiber=false)=>r2Curve(x,y,a,b,'#68b695',.8,.85).replace('<path','<path class="'+(fiber?'fiber-link':'r4-link')+'"');
 if(li>=0){light('netdev',sel.id);for(let m=li*8;m<li*8+8;m++){light('om',sw.id+'-M'+m);links+=line(837+li*292,368,r5OmX(m)+15.5,459,true);}}
 else {
  const indexes=sw.chipList.map((c,i)=>i).filter(i=>i<16&&(ni>=0?sw.chipList[i].npuBlade===ni:ioOfUnion(i)===ii));
  if(ni>=0)light('npublade',sel.id);
  if(ii>=0){ioGroups[ii].setAttribute('opacity','1');ioGroups[ii].querySelectorAll('[data-om]').forEach(g=>g.setAttribute('opacity',sel.om==null||g.dataset.om===String(sel.om)?'1':'.2'));}
  indexes.forEach(i=>{light('uchip',sw.chipList[i].id);if(ni>=0)links+=line(741.5+i*71,717,764+ni*146,822);else for(let q=0;q<2;q++)if(sel.om==null||q===+sel.om)links+=line(741.5+i*71+(q?6:-6),717,932+ii*584+q*100,950);});
 }
 svg.insertAdjacentHTML('beforeend',links);return svg.innerHTML;
};
if(window.__roomBooted)render();

