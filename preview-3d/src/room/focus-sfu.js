function focusedSfuCards(){
 const svg=$('stageInner').querySelector('.r2-board-svg');if(!svg)return;
 const v=S.view,pod=findPod(v.pod),board=pod?.npu.find(b=>b.id===(v.blade||v.id));
 const selected=board?.cards.findIndex(c=>c.id===(S.sel?.t==='npu'?S.sel.id:v.t==='npu'?v.id:''))??-1;
 const cpu=S.sel?.t==='cpu2'?+S.sel.id.slice(-1):-1;
 svg.querySelectorAll('[data-act="swblade"]').forEach(g=>{
  const k=pod?.sw.findIndex(b=>b.id===g.dataset.id);if(k==null||k<0)return;
  const rects=[...g.querySelectorAll(':scope > rect')],cells=rects.filter(r=>+r.getAttribute('width')<=24);
  rects.filter(r=>+r.getAttribute('width')>200).forEach(r=>{r.setAttribute('fill','#414141');r.style.fill='#414141';r.setAttribute('fill-opacity','1');r.setAttribute('stroke','none');});
  const related=new Set();if(board)board.cards.forEach((c,i)=>{if(selected===i||selected<0&&cpu>=0&&cpuOfNpu(i)===cpu)unionOf(board.idx,i,k).forEach(u=>related.add(u));});
  cells.forEach((r,i)=>{const active=selected<0&&cpu<0||related.has(i);r.setAttribute('opacity',active?'1':'.22');});
  const texts=[...g.querySelectorAll(':scope > text')].filter(t=>/^\d+$/.test(t.textContent));texts.forEach((t,i)=>t.setAttribute('opacity',selected<0&&cpu<0||related.has(i)?'1':'.22'));
 });
}
const focusCardsRender=render;render=function(){focusCardsRender();focusedSfuCards();};
const focusCardsRefresh=refreshLiveOverlays;refreshLiveOverlays=function(){focusCardsRefresh();focusedSfuCards();};
if(window.__roomBooted)render();

const portLegendItems=contextLegendItems;
contextLegendItems=function(){let out=portLegendItems();const svg=$('stageInner').querySelector('svg');if(!svg)return out;
 const tile=(glyph,label)=>'<svg viewBox="0 0 28 28" width="28" height="28" aria-label="'+label+'"><rect x="1" y="1" width="26" height="26" rx="3" fill="#bbc2c7"/><text x="14" y="14" text-anchor="middle" dominant-baseline="central" fill="#24292d" font-family="Arial" font-size="'+(glyph==='x2'?14:20)+'" font-weight="700">'+glyph+'</text></svg><span>'+label+'</span>';
 let devices='';
 if(svg.querySelector('[data-act="lane"]'))devices+=tile('x2','lane x2');
 if(svg.querySelector('.r2-uport,[data-act="port"],[data-act="dport"],[data-act="cport"]'))devices+=tile('P','端口');
 // Device symbols precede both connection legends in every view.
 const connection=out.search(/<svg class="(?:electric|fiber)-legend"/);
 return connection<0?out+devices:out.slice(0,connection)+devices+out.slice(connection);
};
