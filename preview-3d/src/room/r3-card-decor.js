const r3IsNpuCard=()=>S.view.lv==='card'&&S.view.t==='npu';
const r3Sync=hfSync,r3Stage=stageSVG;let r3HoverView='';
hfSync=function(){const key=JSON.stringify(S.view);if(key!==r3HoverView){hideHover();r3HoverView=key;}r3Sync();if(r3IsNpuCard())$('screen').classList.add('r2-board');$('screen').classList.toggle('r3-npu-card',r3IsNpuCard());};
stageSVG=function(inner){return r3IsNpuCard()?`<svg class="r2-board-svg r3-card-svg" viewBox="352 172 1536 876" preserveAspectRatio="xMidYMid meet">${inner}</svg>`:r3Stage(inner)};
const r3Heat=heatBar;heatBar=function(){return r3IsNpuCard()?'':r3Heat()};
cardView=function(){const v=S.view,P=findPod(v.pod),b=P.npu.find(b=>b.id===v.blade),k=b?.cards.find(k=>k.id===v.id);if(!k)return '';const ci=b.cards.indexOf(k),cpu=P.cpu[b.idx],myCpu=cpuOfNpu(ci),others=b.cards.filter(c=>c!==k),extra=`data-pod="${P.id}" data-blade="${b.id}" data-card="${k.id}"`;
 const X=1434,Y=484,W=384,H=286,px=q=>q<9?1450:1779,py=q=>546+(q%9)*24,sx=i=>702+i*104;
 let s=r2Box(368,272,1496,137,'灵衢互联刀片')+r2Box(368,422,1496,401,'NPU计算刀片'+pad2(b.idx+1))+r2Box(368,835,1496,177,'CPU计算刀片'+pad2(b.idx+1));
 s+=R2.rect(686,459,1150,332,'#414141',8)+R2.rect(682,887,1158,107,'#414141',8)+R2.text(702,487,'NPU · 8 颗',14)+R2.text(698,915,'CPU · 2 颗',14);
 s+=r2Image('r3-sfu-outline.png',433,312,175,96)+r2Image('r3-npu-outline.png',415,594,200,80)+r2Image('r3-cpu-outline.png',415,909,200,82);
 for(let j=0;j<4;j++){const sw=P.sw[j],x=684+j*292;s+=`<g ${r2Action('swblade',sw.id,`data-pod="${P.id}"`)}>`+R2.rect(x,309,280,86,'#414141',8)+R2.text(x+16,335,sw.name,14)+R2.text(x+264,335,'Union · 20 颗',14,'#ccc','end');for(let u=0;u<20;u++){const on=unionOf(b.idx,ci,j).includes(u);s+=R2.rect(x+16+(u%10)*24.8,347+Math.floor(u/10)*20,22,16,on?'#44ad80':'#3b7057',2)+R2.text(x+27+(u%10)*24.8,359+Math.floor(u/10)*20,u+1,10,'#b4d1c0','middle');}s+='</g>';}
 s+=`<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="23" fill="${S.mode==='pwr'?heat(powerBand(k.pwr)):'#343434'}" fill-opacity="${S.mode==='pwr'?.22:1}" stroke="${S.mode==='pwr'?heat(powerBand(k.pwr)):'#6e726f'}" stroke-width="3"/>`;
 let lines='';for(let q=0;q<18;q++){const m=PORTMAP[q],x=px(q)+(q<9?0:26),y=py(q)+10;if(m.t==='idle')continue;let tx,ty;if(m.t==='npu'){const id=b.cards[meshTarget(ci,m.n)].id,idx=others.findIndex(c=>c.id===id);tx=sx(idx)+40;ty=693;}else if(m.t==='sfu'){const u=unionOf(b.idx,ci,m.k)[m.u];tx=684+m.k*292+27+(u%10)*24.8;ty=363+Math.floor(u/10)*20;}else{tx=(myCpu?1470:970)+40+(m.w?15:-15);ty=901;}
 const sel=S.sel?.t==='dport'?+S.sel.id.split('-P').pop():-1;lines+=`<path class="r3-card-link" d="M${x} ${y} C${q<9?x-80:x+75} ${y} ${tx} ${ty+(m.t==='sfu'?60:-60)} ${tx} ${ty}" fill="none" stroke="#5b997d" stroke-width=".8" opacity="${sel<0||sel===q?.85:.14}" pointer-events="none"/>`;}
 s+=lines;
 others.forEach((c,i)=>s+=r2Chip(sx(i),693,'NPU '+b.cards.indexOf(c),S.mode==='pwr'?Math.round(c.pwr)+'W':'','npu',c.id,`data-pod="${P.id}" data-blade="${b.id}"`));
 for(let i=0;i<2;i++)s+=r2Chip(i?1470:970,901,'CPU '+(i+1),S.mode==='pwr'?cpuDemoPower(cpu,i)+'W':'','cpu2',cpu.id+'-U'+i,`data-pod="${P.id}" data-blade="${cpu.id}"`,false,i!==myCpu);
 s+=R2.text(X+14,Y+28,'NPU '+ci,14,'#fff')+R2.text(X+W-14,Y+28,S.mode==='pwr'?k.pwr+'W':'利用率 '+k.util+'%',12,'#bbb','end')+R2.text(X+14,Y+52,'Udie-'+(ci>=4?'B':'A'),12,'#999')+R2.text(X+W-14,Y+52,'Udie-'+(ci>=4?'A':'B'),12,'#999','end');
 for(let q=0;q<18;q++){const idle=PORTMAP[q].t==='idle';s+=`<g ${r2Action('dport',k.id+'-P'+q,extra)}>`+R2.rect(px(q),py(q),26,20,cardPortColor(k,q),4)+R2.text(px(q)+13,py(q)+14,'P'+pad2(q%9),9,'#eee','middle')+'</g>';}
 const bad=S.mode==='health'&&k.status!=='ok'&&k.mem.ecc_iso>0;
 const block=(x,y,w,n,val,bad=false)=>{
 const loads={'HBM':k.mem.bwUse,'AI Cube':k.cube,'AI Vector':k.vec,'Control CPU':k.ctl,'AI CPU':k.acpu};
 const color=S.mode==='health'?(bad?'#e7434a':'#39775d'):heat(S.mode==='pwr'?pwrPct(k):(loads[n]??k.util));
 const sub=S.mode==='pwr'?'所属卡功耗 '+Math.round(pwrPct(k))+'%':val;
 return `<g ${r2Action('blk',k.id+'-B'+n,extra)}>`+R2.rect(x,y,w,50,color,7)+R2.text(x+12,y+21,n,14,'#fff')+R2.text(x+12,y+39,sub,11,'#eee')+'</g>';
 };
 s+=block(1499,546,264,'HBM',bad?'多bit ECC　隔离行 '+k.mem.ecc_iso+'/64':'带宽占用 '+k.mem.bwUse+'%',bad)+block(1499,612,126,'AI Cube','利用率 '+k.cube+'%')+block(1638,612,125,'AI Vector','利用率 '+k.vec+'%')+block(1499,678,126,'Control CPU','利用率 '+k.ctl+'%')+block(1638,678,125,'AI CPU','利用率 '+k.acpu+'%');
 return s;};
// Fault propagation for SFU optical modules.
const r3PopContent=popContent;
popContent=function(t){const c=r3PopContent(t);if(S.mode==='health'&&t.t==='swblade'&&OMBAD[t.id]?.length&&!c.note){const f=r3PopContent({t:'om',id:t.id+'-M'+OMBAD[t.id][0],pod:t.pod,blade:t.id});c.note=f.note;}return c;};
const r3Crumbs=crumbs;crumbs=function(){r3Crumbs();if(r3IsNpuCard()){const c=$('crumbs').querySelector('.cr.cur');if(c)c.textContent='NPU '+S.view.id.split('-K').pop()+' · 卡内视图';}};

/* Second annotation pass: source hover layout, navigation and exact SFU endpoints. */
