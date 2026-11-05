const hf0908Energy=()=>S.view.lv==='blade'&&S.view.t==='npublade'&&S.mode==='pwr';
const hf0908Overview=()=>S.view.lv==='cluster'&&S.nav==='res'&&!S.biz;
// Load and power share a blue-to-orange scale, ordered low to high.
const hf0908Palette=['#6b9bfa','#8fe5c2','#fcc800','#f4840c'];
function modePalette(){return hf0908Palette;}
const hf0908HeatBase=heat,hf0908HeatSetBase=heatSet,hf0908BarBase=heatBar;
heat=function(v){return S.mode!=='health'?modePalette()[v<30?0:v<60?1:v<90?2:3]:hf0908HeatBase(v)};
heatSet=function(){return S.mode!=='health'?modePalette().map((c,i)=>[c,scaleLabels()[i]]):hf0908HeatSetBase()};
heatBar=function(){if(!hf0908Energy())return hf0908BarBase();let s=hf0908Text(1460,1038,'实际功率',8);modePalette().forEach((c,i)=>{const x=1560+i*64;s+=hf0908Rect(x,1031,8,6,c,0)+hf0908Text(x+12,1038,scaleLabels()[i],8)});return s+hf0908Rect(1820,1031,8,6,'#949494',0)+hf0908Text(1832,1038,'无计量',8)};
const hf0908SyncBase=hfSync;
hfSync=function(){hf0908SyncBase();$('screen').dataset.hfMode=S.mode;$('screen').classList.toggle('hf-0908-energy',hf0908Energy());$('screen').dataset.hfRevision='0908';};
const hf0908KPIBase=hfDecorateKPI;
hfDecorateKPI=function(){hf0908KPIBase();if(hf0908Overview()&&S.mode!=='health'){
 $('kpis').style.setProperty('--hf-columns',String($('kpis').children.length));
 const button=$('kpis').querySelector('.hf-pod-card');if(button)button.querySelector('.hf-card-search').textContent='搜索资源';
 }else $('kpis').style.removeProperty('--hf-columns');};
const hf0908StageBase=stageSVG;
stageSVG=function(inner){if(hf0908Energy())return '<svg class="hf-0908-canvas" viewBox="352 172 1536 876" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>';return hf0908StageBase(inner)};
const hf0908PodBase=podFront;
podFront=function(p,x){let s=hf0908PodBase(p,x);if(!hf0908Overview()||S.mode==='health')return s;
 // Source uses outlined light chips; retain each native blade's interaction and data color.
 const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>','image/svg+xml');
 for(const g of doc.querySelectorAll('g[data-act="npublade"],g[data-act="cpublade"]'))for(const r of g.querySelectorAll('rect')){
  const w=+r.getAttribute('width'),h=+r.getAttribute('height');if((w===14&&h===24)||(w===40&&h===19)){r.setAttribute('stroke','#a2d4d7');r.setAttribute('stroke-width','.8');r.setAttribute('fill-opacity','.85');}}
 return new XMLSerializer().serializeToString(doc.documentElement).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');};
const hf0908ReskinBase=reskin;
reskin=function(s){let svg=hf0908ReskinBase(s);if(hf0908Overview()&&S.mode!=='health'&&!S.sel){
 const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>','text/html');
 const root=doc.querySelector('svg');if(!root)return svg;
 for(const p of root.querySelectorAll('path'))if(p.getAttribute('fill')==='none'||p.classList.contains('flow')){p.setAttribute('stroke','#777');p.setAttribute('stroke-opacity','.42');p.setAttribute('stroke-width','1.4');}
 return new XMLSerializer().serializeToString(root).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');}return svg;};
const hf0908NpuBase=vNpuBlade;
function hf0908Text(x,y,t,size=14,fill='#c9c9c9',anchor='start',weight=400){return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" pointer-events="none">${esc(t)}</text>`}
function hf0908Rect(x,y,w,h,fill='#303030',r=8){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`}
function hf0908Chip(x,y,name,value,data,active,dim){
 // Original glyph-free chip illustration; text stays live and keeps the native IDs.
 return `<g class="clk hf-live-chip" ${data} opacity="${dim?.26:1}" tabindex="0" role="button" aria-label="${esc(name+' '+value)}">`+
 hf0908Rect(x,y,80,80,'#414141',6)+`<image href="./assets/uploads/npu-tile.png" x="${x}" y="${y}" width="80" height="80" filter="url(#hf-chip-cyan)" pointer-events="none"/>`+
 (active?`<rect x="${x-2}" y="${y-2}" width="84" height="84" rx="8" fill="none" stroke="#74d8e3" stroke-width="1.5"/>`:'')+
 hf0908Text(x+40,y+28,name,14,'#fff','middle')+hf0908Text(x+40,y+58,value,20,'#fff','middle',500)+'</g>';
}
vNpuBlade=function(v){if(!hf0908Energy())return hf0908NpuBase(v);const P=findPod(v.pod),b=P.npu.find(x=>x.id===v.id);if(!b)return '';const cpu=P.cpu[b.idx];
 const sel=S.sel||{},si=sel.t==='npu'?b.cards.findIndex(c=>c.id===sel.id):-1,ci=sel.t==='cpu2'?+sel.id.slice(-1):-1,focused=si>=0||ci>=0;
 const NX=i=>971.5+111*i,NY=650.380859375,CX=i=>i?1476:976,CY=895.7138671875;
 let s='<defs><filter id="hf-chip-cyan" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 .98 0 0 -.016  0 .68 0 0 .18  0 0 0 1 0"/></filter></defs>';
 for(const [x,y,w,h] of [[376,272,1496,200],[376,488,1496,278],[376,782,1496,230]])s+=hf0908Rect(x,y,w,h);
 s+=hf0908Text(392,304,'灵衢互联刀片')+hf0908Text(392,520,'NPU计算刀片'+pad2(b.idx+1))+hf0908Text(392,548,'整板功耗 '+(b.cards.reduce((a,k)=>a+k.pwr,0)/1000).toFixed(2)+'kW')+hf0908Text(392,814,'CPU计算刀片'+pad2(cpu.idx+1));
 s+=hf0908Rect(956,604.380859375,888,142,'#414141')+hf0908Rect(688,604.380859375,244,142,'#414141')+hf0908Rect(688,849.7138671875,1156,142,'#414141');
 s+=hfModel('0908-sfu-board.svg',466,327,186,124)+hfModel('0908-npu-board.svg',465,582,192,156)+hfModel('0908-cpu-board.png',430,840,240,140);
 s+=hf0908Text(704,638,'风扇 · 2 个')+hf0908Text(972,638,'NPU · 8 颗')+hf0908Text(704,882,'CPU 2');
 // Existing fan component semantics and asset, with source-aligned positions.
 for(let i=0;i<2;i++){const px=748+i*80;s+=`<g class="clk" data-act="part" data-id="${b.id}-Q风扇" data-pod="${P.id}" data-blade="${b.id}"><circle cx="${px}" cy="693" r="12" fill="#465755"/><image href="./assets/uploads/metric-icon-fan.png" x="${px-8}" y="685" width="16" height="16" pointer-events="none"/></g>`;}
 // Source layout, native topology: each NPU is served by its own CPU group and four SFUs.
 for(let i=0;i<8;i++){
  const cpuIdx=cpuOfNpu(i),on=si===i||ci===cpuIdx,c=focused&&on?'#52bca1':'#747474',op=focused?(on?.85:.12):.38;
  if(si<0)for(let k=0;k<4;k++){const ex=828+k*292;s+=`<path class="hf-live-link" d="M${ex} 455.7139 C${ex} 510 ${NX(i)+40} 570 ${NX(i)+40} ${NY}" fill="none" stroke="${c}" stroke-width="${on?1.3:.8}" opacity="${op}" pointer-events="none"/>`;}
  for(const offset of [-14,14])s+=`<path class="hf-live-link" d="M${NX(i)+40+offset} ${NY+80} C${NX(i)+40+offset} 792 ${CX(cpuIdx)+40} 812 ${CX(cpuIdx)+40} ${CY}" fill="none" stroke="${c}" stroke-width="${on?1.3:.8}" opacity="${op}" pointer-events="none"/>`;
 }
 for(let k=0;k<4;k++){const sw=P.sw[k],x=688+k*292,y=325.7138671875;s+=`<g class="clk" data-act="swblade" data-id="${sw.id}" data-pod="${P.id}">`+hf0908Rect(x,y,280,130,'#414141')+hf0908Text(x+16,y+28,sw.name)+hf0908Text(x+16,y+57,S.mode==='pwr'?sw.pwrp+'%':'—',20,'#eee');
  for(let j=0;j<20;j++){const xx=x+16+(j%10)*24.8,yy=y+76+Math.floor(j/10)*20;const on=si>=0&&unionOf(b.idx,si,k).includes(j);s+=hf0908Rect(xx,yy,20,16,on?'#4AAB89':'#9d9d9d',1)+hf0908Text(xx+10,yy+11,String(j+1),8,on?'#fff':'#e1e1e1','middle');}s+='</g>';}
 if(si>=0){
  for(let j=0;j<8;j++){if(j===si)continue;const x1=NX(si)+40,x2=NX(j)+40,depth=30+Math.abs(j-si)*8;s+=`<path class="hf-mesh-link" d="M${x1} ${NY+80} C${x1} ${NY+80+depth} ${x2} ${NY+80+depth} ${x2} ${NY+80}" stroke="#52bca1" stroke-width="1" fill="none" opacity=".75" pointer-events="none"/>`;}
  for(let k=0;k<4;k++)for(const u of unionOf(b.idx,si,k)){const x=688+k*292+26+(u%10)*24.8,y=325.7138671875+92+Math.floor(u/10)*20;s+=`<path class="hf-union-link" d="M${x} ${y} C${x} 520 ${NX(si)+40} 560 ${NX(si)+40} ${NY}" stroke="#52bca1" stroke-width="1.2" fill="none" pointer-events="none"/>`;}
 }
 b.cards.forEach((card,i)=>s+=hf0908Chip(NX(i),NY,'NPU '+i,Math.round(card.pwr)+'W',`data-act="npu" data-id="${card.id}" data-pod="${P.id}" data-blade="${b.id}"`,si===i,ci>=0&&ci!==cpuOfNpu(i)));
 for(let i=0;i<2;i++)s+=hf0908Chip(CX(i),CY,'CPU '+(i+1),cpuDemoPower(cpu,i)+'W',`data-act="cpu2" data-id="${cpu.id}-U${i}" data-pod="${P.id}" data-blade="${cpu.id}"`,ci===i,focused&&ci!==i&&!(si>=0&&cpuOfNpu(si)===i));
 return s;
};
// Preserve the source's visual mode order; all native handlers remain in place.
const hfModes=$('modeseg');for(const mode of ['util','health','pwr']){const b=hfModes.querySelector('[data-m="'+mode+'"]');if(b)hfModes.append(b)}
$('top').querySelector('h1').textContent='CCAE 超节点数字孪生';
const hf0908LegendBase=legend;
legend=function(dark,ox,oy,narrow){if(!hf0908Overview()||S.mode==='health'||narrow||ox!=null)return hf0908LegendBase(dark,ox,oy,narrow);
 let x=930,y=1640,s='<g class="hf-0908-legend">';
 s+=hf0908Rect(x,y-18,14,20,'#949494',2)+hf0908Text(x+22,y,'NPU',20);x+=122;
 s+=hf0908Rect(x,y-18,22,20,'#949494',2)+hf0908Text(x+30,y,'CPU',20);x+=150;
 modePalette().forEach((c,i)=>{s+=hf0908Rect(x,y-18,20,20,c,2)+hf0908Text(x+30,y,scaleLabels()[i],20);x+=152;});
 s+=hf0908Rect(x,y-18,20,20,'#949494',2)+hf0908Text(x+30,y,S.mode==='pwr'?'无独立计量（Union / 端口 / lane / 光模块）':'无数据',17);return s+'</g>';
};

