function cardPortState(card,q){
 const idle=PORTMAP[q]?.t==='idle';
 const bad=!idle&&card.id+'-P'+q==='P03-N05-K1-P1';
 const util=idle?0:(card.portBw?.[q]??card.util??0);
 return {idle,bad,util,power:pwrPct(card)};
}
function cardPortColor(card,q){
 const p=cardPortState(card,q);
 if(p.idle)return '#404040';
 return S.mode==='health'?(p.bad?'#e7434a':'#35835d'):heat(S.mode==='pwr'?p.power:p.util);
}
function hfModel(file,x,y,w,h){
  return '<image class="hf-source-model" href="'+hfAssetURL(file)+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet"/>';
}
function hfMaterial(file,x,y,w,h){return '<image href="'+hfAssetURL(file)+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none" pointer-events="none"/>'}
shell=function(x,y,w,h,opt){
  const result=hfBaseShell(x,y,w,h,opt);
  if(S.view.lv==='cluster'||S.view.lv==='logic')result.front+=
    hfMaterial('rack-rail.png',x,y+8,6,h-22)+hfMaterial('rack-rail.png',x+w-6,y+8,6,h-22)+
    hfMaterial('rack-cap.png',x,y,w,8)+hfMaterial('rack-foot.png',x,y+h-15,w,15);
  return result;
};
podFront=function(p,x){
  const svg=hfBasePodFront(p,x);
  const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>','image/svg+xml');
  if(doc.querySelector('parsererror'))return svg;
  for(const group of doc.querySelectorAll('g[data-act="npublade"],g[data-act="cpublade"]')){
    const rects=[...group.children].filter(e=>e.tagName==='rect'),plate=rects[0];if(!plate)continue;
    const material=doc.createElementNS('http://www.w3.org/2000/svg','image');
    for(const key of ['x','y','width','height'])material.setAttribute(key,plate.getAttribute(key));
    material.setAttribute('href','./assets/uploads/blade-metal.png');material.setAttribute('preserveAspectRatio','none');material.setAttribute('pointer-events','none');
    group.insertBefore(material,plate);plate.setAttribute('fill','transparent');
    rects.slice(1).forEach(r=>{
      const w=+r.getAttribute('width'),h=+r.getAttribute('height');
      if(!((w===14&&h===24)||(w===40&&h===19)))return;
      const label=doc.createElementNS('http://www.w3.org/2000/svg','text');
      for(const [k,v] of Object.entries({x:+r.getAttribute('x')+w/2,y:+r.getAttribute('y')+h/2+4,'font-size':11,'text-anchor':'middle',fill:'#15271e','pointer-events':'none'}))label.setAttribute(k,v);
      label.textContent=group.dataset.act==='npublade'?'N':'C';group.append(label);
    });
  }
  return new XMLSerializer().serializeToString(doc.documentElement).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
};
function hfDeviceArt(svg){
  const energyBlade=S.view.lv==='blade'&&S.view.t==='npublade'&&S.mode!=='health';
  if(S.mode!=='health'&&!energyBlade)return svg;
  const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>','image/svg+xml');
  if(doc.querySelector('parsererror'))return svg;
  if(S.view.lv==='card'){const frame=doc.querySelector('rect[x="2350"][y="560"]');if(frame){frame.setAttribute('rx','40');frame.setAttribute('stroke','#707070');frame.setAttribute('stroke-width','6')}}
  if(S.view.lv==='card')for(const rect of doc.querySelectorAll('rect[x="110"][y="440"]')){rect.setAttribute('stroke','#55aaff');rect.setAttribute('stroke-width','2')}
  let unionIndex=0;
  for(const group of doc.querySelectorAll('g[data-act="uchip"]')){
    const r=group.querySelector('rect');if(!r)continue;
    const on=r.getAttribute('fill')==='#0F3A2E';
    r.setAttribute('fill',on?'#32b982':energyBlade?'#555555':'#426e59');r.setAttribute('stroke','none');
    let t=group.querySelector('text');if(!t){t=doc.createElementNS('http://www.w3.org/2000/svg','text');group.append(t)}
    t.textContent=String(unionIndex++%20+1);
    for(const [k,v] of Object.entries({x:+r.getAttribute('x')+(+r.getAttribute('width'))/2,y:+r.getAttribute('y')+(+r.getAttribute('height'))/2+8,'font-size':22,'font-weight':400,'text-anchor':'middle',fill:on?'#fff':'#b0c6bb'}))t.setAttribute(k,v);
  }
  for(const block of doc.querySelectorAll('g[data-act="blk"] > rect')){block.setAttribute('fill',block.getAttribute('fill')==='#2A1017'?'#b94a4e':'#515151');block.setAttribute('stroke','none')}
  for(const group of doc.querySelectorAll('g[data-act="npu"],g[data-act="cpu2"],g[data-act="ioblade"]')){
    const rect=[...group.children].find(e=>e.tagName==='rect');if(!rect)continue;
    const t=group.dataset.act, obj=findObj(t,group.dataset.id,{pod:group.dataset.pod,blade:group.dataset.blade});
    const bad=S.mode==='health'&&!!obj&&obj.status!=='ok';
    if(t==='cpu2' && (S.view.zoomCpu===0||S.view.zoomCpu===1) && group.dataset.id.endsWith('-U'+S.view.zoomCpu))continue;
    const x=+rect.getAttribute('x'),y=+rect.getAttribute('y'),w=+rect.getAttribute('width'),h=+rect.getAttribute('height');
    const size=Math.min(174,w,h), image=doc.createElementNS('http://www.w3.org/2000/svg',bad?'rect':'image');
    for(const [k,v] of Object.entries({...(bad?{fill:'#b34b5c',stroke:colH('err'),rx:12}:{href:'./assets/uploads/npu-tile.png'}),x:x+(w-size)/2,y:y+(h-size)/2,width:size,height:size,'pointer-events':'none'}))image.setAttribute(k,v);
    if(!energyBlade)rect.setAttribute('fill','transparent');rect.setAttribute('stroke',energyBlade&&isSel(group.dataset.id)?'#55aaff':'none');if(energyBlade)image.setAttribute('opacity','.32');
    group.insertBefore(image,rect.nextSibling);
    const bridges=t!=='npu'?[[x+w/2,y,x+w/2,y+(h-size)/2],[x+w/2,y+(h+size)/2,x+w/2,y+h]]:
      [[x+w/2,y,x+w/2,y+(h-size)/2],[x+w/2-52,y+(h+size)/2,x+w/2-52,y+h],[x+w/2+52,y+(h+size)/2,x+w/2+52,y+h]];
    for(const [x1,y1,x2,y2] of bridges){const line=doc.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v] of Object.entries({x1,y1,x2,y2,stroke:'#668c7a','stroke-width':2,'pointer-events':'none'}))line.setAttribute(k,v);group.insertBefore(line,image)}
    const labels=[...group.children].filter(e=>e.tagName==='text');
    if(labels[1]&&labels[1].textContent.includes('与本卡无连接'))labels[1].setAttribute('y',y+h+32);
    const label=labels[0];
    if(energyBlade&&labels[1]){labels[1].setAttribute('y',y+h/2+38);labels[1].setAttribute('x',x+w/2);labels[1].setAttribute('text-anchor','middle');labels[1].setAttribute('font-size','25')}
    if(label){if(energyBlade)label.setAttribute('x',x+w/2);label.setAttribute('y',y+h/2+(energyBlade?-6:9));label.setAttribute('font-size','28');label.setAttribute('font-weight','400')}
  }
  return new XMLSerializer().serializeToString(doc.documentElement).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
}
/* These are source-image illustrations, not screenshots of functional controls. */
vNpuBlade=function(v){
  let svg=hfBaseNpuBlade(v);
  if(!svg)return svg;
  return hfDeviceArt(svg)+hfModel('npu-board.png',185,780,440,340)+hfModel('cpu-board.png',175,1360,460,270)+hfModel('sfu-board.png',220,190,340,280);
};
vCpuBlade=function(v){
  let svg=hfBaseCpuBlade(v);
  if(!svg)return svg;
  return hfDeviceArt(svg)+hfModel('npu-board.png',185,180,440,215)+hfModel('cpu-board.png',185,800,440,370)+hfModel('io-board.png',210,1410,390,140);
};
cardView=function(){
  const svg=hfBaseCardView();
  return svg?hfDeviceArt(svg)+hfModel('npu-board.png',175,700,460,380)+hfModel('cpu-board.png',175,1435,460,230)+hfModel('sfu-board.png',220,155,340,200):svg;
};

const hfTitle=document.createElement('div');hfTitle.id='hf-page-title';hfTitle.innerHTML='数字地图 <button type="button" id="hf-expand" class="hf-tree-toggle" aria-controls="left" aria-label="展开导航">展开导航</button>';$('top').append(hfTitle);
const hfHeading=document.createElement('div');hfHeading.id='hf-pod-heading';
hfHeading.innerHTML='<strong>超节点 (1024卡)</strong><button type="button" class="hf-tree-toggle" id="hf-collapse" aria-controls="left" aria-label="收起资源树"><img src="./assets/uploads/chevron.png" alt=""></button>';
const hfOverview=document.createElement('img');hfOverview.id='hf-overview';hfOverview.src='./assets/uploads/r12-overview.svg';hfOverview.alt='超节点 机柜排列概览';
$('navwrap').prepend(hfOverview);$('navwrap').prepend(hfHeading);$('navwrap').prepend($('navseg'));
$('navseg').append($('hf-collapse'));
$('hf-collapse').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m7-12-4 4 4 4"/></svg>';
$('hf-collapse').title='收起资源树';
$('hf-collapse').onclick=e=>{e.stopPropagation();hfSetTree(false)};
$('hf-expand').onclick=()=>hfSetTree(true);
const hfNavClick=$('navseg').onclick;
$('navseg').onclick=function(e){hfTreeOpen=true;return hfNavClick.call(this,e)};

/* 0908 digital-twin references only. Agent components are intentionally out of scope. */
