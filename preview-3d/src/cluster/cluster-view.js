
/* ================== 集群视图：多个超节点 → 单个超节点 ==================
   · 默认进入集群视图，每个超节点画成一排 20 柜缩略（8 计算 + 4 互联 + 8 计算，与单超节点首页同构）。
   · 点击缩略 → 该排原地放大成单超节点首页（共享元素过渡）；返回时反向缩回并高亮刚看过的那一排。
   · 进入后标题变成「‹ 数字地图 / 超节点 03 ⌄」：‹ 或「数字地图」回集群，⌄ 直接切换到别的超节点。
   · 演示数据：每个超节点复用同一套硬件拓扑；超节点 A 保留原故障故事，其余清除故障并按档位改写负载 / 功耗，
     缩略图与详情读的是同一份改写后的数据，所以进去看到的颜色和外面一致。
   · URL：?pods=N 可调超节点数量（1–48，默认 8），用来检查多数量下的排布。 */
(()=>{
const Q=new URLSearchParams(location.search);
const N=Math.max(1,Math.min(48,parseInt(Q.get('pods'))||8));
const PAT=[[1.08,8,1.12],[0.97,-3,1],[0.42,0,.62],[1,3,1.03],[1.12,12,1.18],[0.9,-6,.94],[0.55,0,.72]];
/* 演示故障分布：超节点 A 保留原故障故事，其余超节点各自注入 0–2 个故障（数据真实改写，进详情能看到同样的红点与气泡） */
const FAULTS={};
let sharedStory={};
function spec(i){
  if(i===0)return {fault:'clean',a:1,b:0,p:1,faults:[]};
  const off=(N>=4&&i===N-1)||(i%11===10);
  const t=PAT[(i-1)%PAT.length];
  return {fault:'clean',a:t[0],b:t[1],p:t[2],offline:off,faults:FAULTS[i]||[]};
}
const PODS=Array.from({length:N},(_,i)=>({i,name:'超节点 '+String.fromCharCode(65+i),...spec(i)}));
const CL={active:!(Q.has('roce')||Q.has('l2')),cur:0,last:null,filter:'all',q:'',scroll:0,anim:false,seenT:0};
window.CCAE_CLUSTER=CL;

/* ---------- 数据快照与改写 ---------- */
const NUMF=['util','reviewGreenValue','bw','hbm','pwrp','pwr','kw'],ARRF=['omBw','portBw','laneBw'];
const BASE={nums:[],stat:[],om:null,bub:null,alarms:null,links:null};
function snap(){
  const seen=new Set();
  const walk=o=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);
    if(Array.isArray(o)){o.forEach(walk);return}
    if('status' in o)BASE.stat.push([o,o.status]);
    const r={o};let any=false;
    NUMF.forEach(f=>{if(typeof o[f]==='number'){r[f]=o[f];any=true}});
    ARRF.forEach(f=>{if(Array.isArray(o[f])&&typeof o[f][0]==='number'){r[f]=o[f].slice();any=true}});
    if(any)BASE.nums.push(r);
    for(const k in o){const v=o[k];if(v&&typeof v==='object')walk(v)}};
  walk(D.pods);walk(D.nets);
  BASE.om=Object.fromEntries(Object.entries(OMBAD).map(([k,v])=>[k,v.slice()]));
  BASE.bub=BUBBLES.slice();BASE.alarms=D.alarms.slice();
  BASE.links=LINKS.map(l=>[l,l.status,l.deg,l.bw]);
}
const UNDO=[];
function setU(o,k,v){UNDO.push([o,k,Object.prototype.hasOwnProperty.call(o,k),o[k]]);o[k]=v}
function apply(sp){
  // 先撤销上一次注入时改过、但不在基线快照里的字段（如 CPU 的 status、HBM 隔离行数、结温）
  UNDO.splice(0).reverse().forEach(([o,k,had,v])=>{if(had)o[k]=v;else delete o[k]});
  const L=v=>Math.max(1,Math.min(99,v*sp.a+sp.b));
  for(const r of BASE.nums){const o=r.o;
    if('util' in r)o.util=+L(r.util).toFixed(1);
    if('reviewGreenValue' in r)o.reviewGreenValue=+L(r.reviewGreenValue).toFixed(1);
    if('bw' in r)o.bw=Math.round(L(r.bw));
    if('hbm' in r)o.hbm=Math.round(Math.max(5,Math.min(98,r.hbm*(.6+.4*sp.a))));
    if('pwrp' in r)o.pwrp=Math.round(Math.min(99,r.pwrp*sp.p));
    if('pwr' in r)o.pwr=Math.round(r.pwr*sp.p);
    if('kw' in r)o.kw=+(r.kw*(.45+.55*sp.p)).toFixed(1);
    ARRF.forEach(f=>{if(f in r)o[f]=r[f].map(v=>Math.round(L(v)))});
  }
  const story=sp.fault==='story';
  for(const [o,s] of BASE.stat)o.status=story?s:'ok';
  for(const k of Object.keys(OMBAD))delete OMBAD[k];
  if(story)Object.entries(BASE.om).forEach(([k,v])=>OMBAD[k]=v.slice());
  BUBBLES.length=0;if(story)BUBBLES.push(...BASE.bub);
  D.alarms=story?BASE.alarms.slice():[];
  for(const [l,s,d,bw] of BASE.links){l.status=story?s:'ok';l.deg=story?d:false;l.bw=Math.round(L(bw))}
  if(sp.faults==='dense')injectDense();else (sp.faults||[]).forEach(injectFault);
}
/* 与全量设计稿 superpod-02 的构造完全一致：8 个计算柜各有多块故障 NPU 刀片（同一张卡可有两条故障记录）、
   每柜一块 L1 刀片两个光模块故障；计算柜03/09/13 各一块 CPU 刀片的 CPU1、CPU2 分别故障。 */
function injectDense(){
  const names=['NPU 温度超过阈值','HBM ECC 错误','总线网络 CQE 故障'];
  [1,2,3,4,5,6,12,13].forEach((pi,group)=>{
    const pod=D.pods[pi];
    for(let bi=0;bi<(group===0?1:3);bi++){
      const board=pod.npu[bi];board.status='err';
      for(let ci=0;ci<2;ci++){const card=board.cards[ci];card.status='err';
        for(let ai=0;ai<(ci===0?2:1);ai++)BUBBLES.push({key:`dense-${card.id}-${ai}`,at:{v:'npucard',id:card.id},go:{t:'npu',id:card.id,pod:pod.id,blade:board.id},name:names[(bi+ci+ai)%3],sev:ai?'重要':'紧急',ts:'2026-10-15 10:24:00',impact:['该器件运行异常，可能影响任务稳定性'],fix:['检查设备状态并处理故障'],svc:['模型训练任务']});}
    }
    const sw=pod.sw[0];sw.status='err';OMBAD[sw.id]=[0,1];
    for(let oi=0;oi<2;oi++)BUBBLES.push({key:`dense-${sw.id}-${oi}`,at:{v:'swblade',id:sw.id},go:{t:'om',id:sw.id+'-M'+oi,pod:pod.id,blade:sw.id},name:`光模块 ${oi+1} 链路异常`,sev:'重要',ts:'2026-10-15 10:24:00',impact:['上行链路异常'],fix:['检查光模块与连接'],svc:['模型训练任务']});
  });
  for(const [pi,bi,ci,name] of [[2,0,0,'CPU 温度超过阈值'],[8,4,1,'CPU 硬件错误'],[12,2,0,'CPU 运行异常']]){
    const pod=D.pods[pi],board=pod.cpu[bi],cpu=board.cpus[ci];board.status='err';setU(cpu,'status','err');
    BUBBLES.push({key:'cpu-demo-'+cpu.id,at:{v:'cpucard',id:cpu.id},go:{t:'cpu2',id:cpu.id,pod:pod.id,blade:board.id},name,sev:'紧急',ts:'2026-10-20 10:24:00',rootCause:name+'，需结合硬件日志确认具体原因。',impact:['可能影响节点任务运行'],fix:['检查硬件日志、散热和部件状态，按诊断结果处理。'],svc:[]});
    const peer=board.cpus[1-ci];setU(peer,'status','err');
    BUBBLES.push({key:'cpu-demo-'+peer.id,at:{v:'cpucard',id:peer.id},go:{t:'cpu2',id:peer.id,pod:pod.id,blade:board.id},name:'CPU 内部错误',sev:'紧急',ts:'2026-10-20 10:24:00',rootCause:'CPU 内部错误，需结合硬件日志确认具体原因。',impact:['可能影响节点任务运行'],fix:['检查硬件日志、散热和部件状态，按诊断结果处理。'],svc:[]});
  }
}
function injectFault(f){
  const tplOm=BASE.bub.find(b=>b.at.v==='swblade'),tplHbm=BASE.bub.find(b=>b.key==='hbm-k3')||BASE.bub.find(b=>b.at.v==='npucard');
  if(f.k==='npu'){
    const pid=f.id.slice(0,3),bid=f.id.slice(0,7),P=findPod(pid),B=P&&P.npu.find(b=>b.id===bid),C=B&&B.cards.find(c=>c.id===f.id);if(!C)return;
    C.status='warn';B.status='warn';P.status='warn';
    const temp=f.tpl==='temp';
    if(!temp&&C.mem)setU(C.mem,'ecc_iso',64);if(temp)setU(C,'temp',97);
    const go={t:'npu',id:f.id,pod:pid,blade:bid};
    BUBBLES.push({...tplHbm,key:'clu-'+f.id,at:{v:'npucard',id:f.id},go,name:f.name,sev:temp?'重要':'紧急',
      impact:temp?['NPU 结温持续高于 95℃，已触发降频，','训练吞吐下降约 12%']:tplHbm.impact,
      fix:temp?['检查刀片风扇与散热风道，必要时迁移任务后更换']:tplHbm.fix});
    D.alarms.push({sev:'warn',t:f.name,o:f.id+(temp?' · 结温':' · HBM'),d:temp?'NPU 结温持续高于 95℃，已触发降频':'多 bit ECC 隔离行数 64/64，新增多 bit 错误将无法隔离',ts:'10:2'+(f.id.length%10)+':08',sel:{t:'npublade',id:bid,pod:pid},go});
  }else{
    const pid=f.sw.slice(0,3);OMBAD[f.sw]=[f.om];
    BUBBLES.push({...tplOm,key:'clu-'+f.sw,at:{v:'swblade',id:f.sw},name:f.name});
    D.alarms.push({sev:'warn',t:f.name,o:f.sw+' · '+omFull(f.om),d:(tplOm.impact||[]).join(''),ts:'09:5'+(f.om%10)+':41',go:{t:'swblade',id:f.sw,pod:pid}});
  }
}
function stats(){
  const cards=allCards();
  // 故障类数字直接取页面自己的 kpiList()（超节点首页、故障图层），保证与进入详情后看到的完全一致
  const sv={view:S.view,mode:S.mode,nav:S.nav,biz:S.biz,face:S.face,sel:S.sel};
  S.view={lv:'cluster'};S.mode='health';S.nav='res';S.biz=null;S.face='front';S.sel=null;
  let rows=[];try{rows=kpiList()}catch(e){}
  Object.assign(S,sv);
  const row=k=>rows.find(r=>r.k===k),bad=k=>{const r=row(k);return r&&r.s&&/\//.test(r.s)?+r.v:0};
  return {
    faults:row('故障总数')?+row('故障总数').v:faceFaults('front')+faceFaults('back'),
    npuBad:bad('NPU'),cpuBad:bad('CPU'),om:bad('800G 光模块'),
    util:avgOf(k=>k.util),full:cards.filter(k=>k.util>=90).length,
    hbm:avgOf(k=>k.hbm),
    cpu:D.pods.reduce((a,p)=>a+p.cpu.reduce((x,b)=>x+b.util,0),0)/128,
    kw:D.pods.reduce((a,p)=>a+p.pwr.kw,0)+D.nets.reduce((a,n)=>a+n.pwr.kw,0),
    netkw:D.nets.reduce((a,n)=>a+n.pwr.kw,0),
    npuW:avgOf(k=>k.pwr)
  };
}
/* 缩略图格子颜色：直接调用页面自己的取值与配色函数，保证和详情同源 */
const OK='#2dc16f',BAD='#e7434a',NA2='#7c7f83';
function col(t,obj){
  if(S.mode==='health')return obj&&obj.status&&obj.status!=='ok'?BAD:OK;
  const v=modeDeviceValue(t);return v==null?NA2:heat(v);
}
function cells(){
  return {
    pods:D.pods.map(p=>({
      cpu:p.cpu.map(b=>b.cpus.map(c=>col({t:'cpu2',id:c.id,blade:b.id,pod:p.id},c))),
      npu:p.npu.map(b=>b.cards.map(k=>col({t:'npu',id:k.id,blade:b.id,pod:p.id},k))),
      io:p.io.map(b=>S.mode==='health'&&b.status!=='ok'?BAD:'#56595a'),
      back:S.mode==='health'&&p.sw.some(sw=>swHasBadOm(sw)||sw.status!=='ok')
    })),
    badSw:D.pods.flatMap(p=>p.sw).filter(sw=>swHasBadOm(sw)||sw.status!=='ok').map(sw=>sw.id),
    faults:faultList(),
    nets:D.nets.map(n=>n.dev.map(d=>S.mode==='health'?(d.status!=='ok'?BAD:'#3f9a68'):col({t:'netdev',id:d.id,cab:n.id},d)))
  };
}
/* 每个超节点的故障清单（正面：坏卡所在刀片；背面：坏光模块所在 L1 刀片）→ 机柜顶部气泡 */
/* 故障清单直接取全量设计稿的故障记录（CCAE_FAULT_GROUPS.records）：一条记录一个故障 ID，
   同一器件的多条故障分开列；定位目标用页面自己的 target()（NPU 卡 / CPU / 光模块精确到器件） */
function faultList(){
  const G=window.CCAE_FAULT_GROUPS;if(!G)return [];
  const RK={'紧急':0,'重要':1,'次要':2,'提示':3};
  return G.records().map(b=>{
    const pod=findPod(b.pod);if(!pod)return null;const k=pod.idx,cab=k<8?k:k+4,t=G.target(b);
    const blade=[...pod.npu,...pod.cpu,...pod.sw].find(x=>x.id===b.blade);let comp=blade?blade.name:'';
    if(b.at.v==='npucard'){const c=blade&&blade.cards.find(c=>c.id===b.at.id);if(c)comp+=' · '+c.name}
    else if(b.at.v==='cpucard'){const c=blade&&blade.cpus.find(c=>c.id===b.at.id);if(c)comp+=' · '+c.name}
    else if(t.t==='om'){comp+=' · '+omFull(+t.id.split('-M').pop())}
    return {cab,key:b.key,label:b.name,sev:RK[b.sev]??1,ts:(b.ts||'').slice(11,16),comp,go:t,back:b.at.v==='swblade'};
  }).filter(Boolean);
}
function sharedFaults(){
 const s=sharedStory,fs=[];const add=(key,cab,label,phase,time)=>fs.push({key,cab,label,sev:0,ts:time,comp:phase==='manual'?'待人工处理':'自动处理中',phase,back:false});
 if(s.optical>0&&s.optical<9)add('optical',14,'光链路脏污',s.optical>=6?'manual':'auto','12:00');
 if(s.qwen>0&&s.qwen<9)add('qwen',7,'网卡驱动版本低导致Qwen-1.5B服务劣化',s.qwen===6?'manual':'auto','12:05');
 return fs;
}
let embeddedSurvey=null;
function survey(){
 if(parent!==window&&embeddedSurvey){const item=embeddedSurvey[0];item.cl.faults=sharedFaults();item.st.faults=item.cl.faults.length;item.st.npuBad=0;return embeddedSurvey;}
 const out=PODS.map(sp=>{if(sp.offline)return null;apply(sp);const st=stats(),cl=cells();cl.faults=sp.i===0?sharedFaults():[];cl.badSw=[];st.faults=cl.faults.length;st.npuBad=0;st.cpuBad=0;st.om=0;return {st,cl}});
 apply(PODS[CL.cur]);if(parent!==window)embeddedSurvey=out;return out;
}

/* ---------- DOM ---------- */
const screen=$('screen');
const host=document.createElement('div');host.id='clu3d';screen.append(host);
const root=document.createElement('div');root.id='clu';
root.innerHTML='<div id="clu-kpis" class="kpis"></div><div id="clu-bar"><div class="t"></div><div id="clu-filter"></div></div><div id="clu-space"></div><div id="clu-legend"></div>';
screen.append(root);
const labels=document.createElement('div');labels.id='clu-labels';screen.append(labels);
const hint=document.createElement('div');hint.id='clu-hint';hint.innerHTML='拖拽旋转 · 滚轮缩放 · 点击超节点进入';screen.append(hint);
const title=document.createElement('div');title.id='clu-title';
title.innerHTML='<button type="button" class="back" aria-label="返回集群">‹</button><button type="button" class="home">数字地图</button><span class="sep">/</span><button type="button" class="pod" aria-haspopup="listbox"><span class="dot"></span><span class="nm"></span><i>⌄</i></button>';
$('top').append(title);
const pop=document.createElement('div');pop.id='clu-pop';
pop.innerHTML='<input type="search" placeholder="搜索超节点"><div class="ls" role="listbox"></div><div class="ft">‹ 返回集群总览</div>';
screen.append(pop);
const LIGHT=!!window.CCAE_LIGHT;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================== 3D 机房 ================== */
const RR0=rackRect();
const W=20,H=RR0?W*RR0.height/RR0.width:20*432/1745,DEP=1.7,AISLE=10.5,GAPX=6;
const COLS=N<=3?1:N<=8?2:N<=18?3:4,ROWS=Math.ceil(N/COLS);
const TW=N>12?1200:1745,THt=Math.round(TW*432/1745);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,LIGHT?1:1.25));
host.append(renderer.domElement);
const scene=new THREE.Scene();
const BG=new THREE.Color('#111214');scene.background=BG;
scene.fog=new THREE.Fog(BG,70,190);
renderer.physicallyCorrectLights=false;
if(THREE.RoomEnvironment){const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new THREE.RoomEnvironment(),.04).texture;pm.dispose()}
const camera=new THREE.PerspectiveCamera(34,16/9,.1,600);
scene.add(new THREE.HemisphereLight('#a9bfdc','#08090b',.42));
const key=new THREE.DirectionalLight('#ffffff',.7);key.position.set(-30,60,40);scene.add(key);
const rim=new THREE.DirectionalLight('#4f8bff',.35);rim.position.set(40,20,-60);scene.add(rim);

// 地板：机房防静电地板（1 格 = 1 个机柜宽，与机柜对齐），贴图 + mipmap，远处不出摩尔纹
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
const GLOW=canvasTex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const SOFT=canvasTex(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.55,'rgba(255,255,255,.25)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
const GLOSS=canvasTex(8,256,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,255,255,.10)');r.addColorStop(.35,'rgba(255,255,255,.02)');r.addColorStop(.36,'rgba(255,255,255,0)');r.addColorStop(1,'rgba(255,255,255,.015)');g.fillStyle=r;g.fillRect(0,0,w,h)});
const TILE=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#121417';g.fillRect(0,0,w,h);
  const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,255,255,.025)');gr.addColorStop(1,'rgba(0,0,0,.05)');g.fillStyle=gr;g.fillRect(6,6,w-12,h-12);
  g.strokeStyle='#23272c';g.lineWidth=5;g.strokeRect(2.5,2.5,w-5,h-5);g.fillStyle='rgba(255,255,255,.035)';
  for(let y=40;y<h-30;y+=26)for(let x=40;x<w-30;x+=26)g.fillRect(x,y,3,3)});
TILE.wrapS=TILE.wrapT=THREE.RepeatWrapping;TILE.repeat.set(300,300);TILE.anisotropy=renderer.capabilities.getMaxAnisotropy();
const floor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({map:TILE,roughness:.85,metalness:.15,transparent:true,opacity:.92}));
floor.rotation.x=-Math.PI/2;floor.position.set(.5,0,.15);floor.renderOrder=1;scene.add(floor);
/* ---------- 地面标识：排号 / 柜位号 / 柜名 ----------
   编码 = 排字母 + 柜位号（A-03 = A 排第 3 个柜位，从左往右 01–20）。
   柜位与 2D 名称对照：01–08 = 计算柜01–08，09–12 = 互联柜01–04，13–20 = 计算柜09–16。 */
const FONT='"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif';
const rowL=i=>i<26?String.fromCharCode(65+i):String.fromCharCode(65+Math.floor(i/26)-1)+String.fromCharCode(65+i%26);
const cabName=c=>c<8?'计算柜'+pad2(c+1):c<12?'互联柜'+pad2(c-7):'计算柜'+pad2(c-3);
const locCode=(i,c)=>rowL(i)+'-'+pad2(c+1);
function parseLoc(q){
  q=(q||'').trim().toUpperCase().replace(/\s+/g,'');
  let m=q.match(/^([A-Z]{1,2})[-排]?(\d{1,2})$/);
  if(m){const i=PODS.findIndex(p=>rowL(p.i)===m[1]),c=+m[2]-1;if(i>=0&&c>=0&&c<20)return {i,c}}
  m=q.match(/^([A-Z]{1,2})排?$/);if(m){const i=PODS.findIndex(p=>rowL(p.i)===m[1]);if(i>=0)return {i,c:null}}
  return null;
}
const STRIP_D=1.5;
function stripTex(i,kind){return canvasTex(2560,192,(g)=>{const cw=128;g.textAlign='center';g.textBaseline='middle';
  for(let c=0;c<20;c++){const x=c*cw;
    if(kind==='num'){g.fillStyle='rgba(200,210,220,.9)';g.font='600 62px '+FONT;g.fillText(pad2(c+1),x+cw/2,62);
      g.fillStyle='rgba(200,210,220,.5)';g.fillRect(x+1,8,3,22);g.fillRect(x+cw-4,8,3,22);g.fillRect(x+1,8,26,3);g.fillRect(x+cw-27,8,26,3)}
    else{g.fillStyle='rgba(190,200,210,.85)';g.font='500 30px '+FONT;g.fillText(cabName(c),x+cw/2,140)}}})}
function rowLetterTex(i){return canvasTex(256,256,(g)=>{g.strokeStyle='rgba(200,210,220,.8)';g.lineWidth=8;g.beginPath();g.roundRect?g.roundRect(14,14,228,228,28):g.rect(14,14,228,228);g.stroke();
  g.fillStyle='rgba(220,228,236,.92)';g.font='700 150px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(rowL(i),128,122);
  g.font='500 34px '+FONT;g.fillStyle='rgba(200,210,220,.7)';g.fillText('排',128,210)})}
function tagTex(text,bg){return canvasTex(256,160,(g)=>{g.fillStyle=bg;g.beginPath();g.roundRect?g.roundRect(8,24,240,112,26):g.rect(8,24,240,112);g.fill();
  g.fillStyle='#fff';g.font='700 64px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,82)})}
const TAG_GEO=new THREE.PlaneGeometry(1.15,.72);
function floorTag(R,c,text,bg){const m=new THREE.Mesh(TAG_GEO,new THREE.MeshBasicMaterial({map:tagTex(text,bg),transparent:true,depthWrite:false,toneMapped:false}));
  m.rotation.x=-Math.PI/2;m.position.set(-W/2+c+.5,.03,DEP/2+.2+STRIP_D*.33);m.renderOrder=4;return m}
/* 机柜侧板 / 顶板：与 2D 机柜框同色系的拉丝金属 + 散热孔 */
const SIDE_TEX=canvasTex(256,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#26282b');gr.addColorStop(.08,'#3b3e42');gr.addColorStop(.5,'#323538');gr.addColorStop(.92,'#3b3e42');gr.addColorStop(1,'#222427');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.025)';for(let y=0;y<h;y+=2)g.fillRect(0,y,w,1);
  g.fillStyle='#17181a';for(let y=56;y<h-56;y+=11)for(let x=34;x<w-34;x+=11)g.fillRect(x,y,5,5);
  const sh=g.createLinearGradient(0,h*.78,0,h);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=sh;g.fillRect(0,0,w,h);
  g.fillStyle='#55585d';g.fillRect(0,0,w,4)});
const TOP_TEX=canvasTex(1024,96,(g,w,h)=>{g.fillStyle='#2a2c2f';g.fillRect(0,0,w,h);const cw=w/20;
  for(let i=0;i<20;i++){const x=i*cw;const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a3d41');gr.addColorStop(1,'#2b2d30');g.fillStyle=gr;g.fillRect(x+2,2,cw-4,h-4);
    g.fillStyle='#1b1c1e';for(let y=18;y<h-14;y+=7)g.fillRect(x+10,y,cw-20,3);
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+2,2,cw-4,1.5);g.fillStyle='#151617';g.fillRect(x,0,2,h)}});
TOP_TEX.wrapS=THREE.RepeatWrapping;
/* 正面贴图：优先用构建时从 2D 首页截下的机柜区（与 2D 像素一致）；没有预制图的超节点退回到代码绘制 */
const RACK=window.CCAE_RACK_TEX||{};
const texCache=new Map();
function rackKey(i,mode){const sp=PODS[i];if(sp.offline)return RACK.off?'off':null;const k=(mode==='health'?3:i)+'|'+mode;return RACK[k]?k:null}
function rackTex(key){
  if(texCache.has(key))return texCache.get(key);
  const img=new Image(),t=new THREE.Texture(img);t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  img.onload=()=>{t.needsUpdate=true};img.src=RACK[RACK[key]]||RACK[key];
  texCache.set(key,t);return t;
}

/* 机柜正面贴图：和 2D 首页机柜区同一套排布（20 柜、同样的槽位分区），颜色读同一份数据 */
function drawFront(g,c,off){
  const k=TW/1745;g.setTransform(k,0,0,k,0,0);
  g.fillStyle='#15171a';g.fillRect(0,0,1745,432);
  // Cabinet facade has no per-door status lamp.
  for(let i=0;i<20;i++){
    const x=i*87.25,cw=86,net=i>=8&&i<12;
    const door=g.createLinearGradient(x,0,x+cw,0);
    door.addColorStop(0,'#484c53');door.addColorStop(.10,'#202226');
    door.addColorStop(.5,'#2b2e33');door.addColorStop(.9,'#212328');door.addColorStop(1,'#111215');
    g.fillStyle=door;g.fillRect(x,0,cw,432);
    g.fillStyle='#101418';g.fillRect(x+10,16,66,399);
    // Recessed upper grille, simplified from the source animation.
    const grilleBottom=net?42:55;
    g.fillStyle='#272c31';g.fillRect(x+12,18,62,grilleBottom-18);
    g.fillStyle='#444b52';
    for(const y of (net?[23,34]:[24,38,51]))g.fillRect(x+12,y,62,2);
    for(const xx of [x+25,x+61])g.fillRect(xx,18,2,grilleBottom-18);
    if(net){
      // Three broad dark panels with two paired narrow sections between.
      const panels=[[48,86],[139,31],[175,31],[211,76],[292,29],[326,29],[360,53]];
      for(const [y,h] of panels){
        const face=g.createLinearGradient(x+12,0,x+74,0);
        face.addColorStop(0,'#353b41');face.addColorStop(.5,h>40?'#41474d':'#282e34');face.addColorStop(1,'#30363c');
        g.fillStyle=face;g.fillRect(x+12,y,62,h);
        g.fillStyle='#4a5057';g.fillRect(x+12,y,62,2);
      }
    }else{
      // Repeated broad trays; omit ports, chips, tiny slots and all lettering.
      const trays=[[61,22],[86,22],[111,22],[136,22],
        [178,18],[199,18],[220,18],[241,18],[262,18],[283,18],[304,18],[325,18],
        [356,16],[375,16],[394,17]];
      for(const [y,h] of trays){
        const face=g.createLinearGradient(x+12,y,x+74,y+h);
        face.addColorStop(0,'#4c5159');face.addColorStop(.36,'#60656e');face.addColorStop(1,'#33373e');
        g.fillStyle=face;g.fillRect(x+12,y,62,h);
        g.fillStyle='#828790';g.fillRect(x+13,y,60,1.5);
      }
    }
    // Status remains in the existing fault markers; omit the tiny door lamp.
  }
  if(off){g.fillStyle='rgba(5,9,16,.52)';g.fillRect(0,0,1745,432)}
}

function majority(arr){const m={};let best=arr[0],n=0;arr.forEach(c=>{m[c]=(m[c]||0)+1;if(m[c]>n){n=m[c];best=c}});return best}
function cabColors(cl){ // 柜顶灯条颜色：故障层有红就红，其余图层取柜内多数色
  return Array.from({length:20},(_,i)=>{
    if(i>=8&&i<12){const d=cl.nets[i-8];return S.mode==='health'?(d.includes(BAD)?BAD:OK):majority(d)}
    const p=cl.pods[i<8?i:i-4],all=[...p.npu.flat(),...p.cpu.flat()];
    if(S.mode==='health')return all.includes(BAD)||p.io.includes(BAD)||p.back?BAD:OK;
    return majority(p.npu.flat());
  });
}
function rowTone(i){const sp=PODS[i],st=stOf(i);if(sp.offline)return '#3a3d42';if(S.mode==='health')return st.faults?BAD:OK;return S.mode==='pwr'?heat(powerBand(st.npuW)):heat(st.util)}

/* ---------- 光纤几何：从 2D 首页 svg 的 .fiber-link 取样，换算到机柜正面平面的世界坐标 ---------- */
const FIBER=(()=>{
  const svg=$('stageInner').querySelector('svg.r2-home-svg');if(!svg||!RR0)return null;
  const paths=[...svg.querySelectorAll('path.fiber-link')];if(!paths.length)return null;
  const M=svg.getScreenCTM(),pt=svg.createSVGPoint();
  const toW=(x,y)=>{pt.x=x;pt.y=y;const q=pt.matrixTransform(M);return [(q.x-RR0.left)/RR0.width*W-W/2,(RR0.top+RR0.height-q.y)/RR0.height*H]};
  const mids=paths.map(p=>{const b=p.getBBox();return b.x+b.width/2});
  const rank=mids.map((m,i)=>[m,i]).sort((a,b)=>a[0]-b[0]);const rk=[];rank.forEach(([_,i],k)=>rk[i]=k);
  const pos=[],dist=[],len=[],del=[],idx=[],l1=[];
  paths.forEach((p,pi)=>{const L=p.getTotalLength(),n=48;let prev=null;
    for(let s=0;s<=n;s++){const d=L*s/n,q=p.getPointAtLength(d),w=toW(q.x,q.y);
      if(prev){pos.push(prev[0],prev[1],0,w[0],w[1],0);dist.push(prev[2],d);len.push(L,L);del.push(Math.min(rk[pi],7),Math.min(rk[pi],7));idx.push(pi,pi)}
      prev=[w[0],w[1],d]}
    l1.push(p.getAttribute('data-l1'))});
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('dist',new THREE.Float32BufferAttribute(dist,1));
  geo.setAttribute('len',new THREE.Float32BufferAttribute(len,1));
  geo.setAttribute('delay',new THREE.Float32BufferAttribute(del,1));
  geo.setAttribute('bad',new THREE.Float32BufferAttribute(new Float32Array(dist.length),1));
  /* 着色器 = 原页面 attachOpticalFlow 的参数：三层长尾 [160,.055][75,.14][16,.30]、220px/s、周期 4.8s、左→右错帧 80ms；
     底线 #47876e .5（坏链路 #e7434a .8），非故障图层底线 #9ba7ad */
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{time:{value:0},opac:{value:1},health:{value:1},flow:{value:1}},
    vertexShader:`attribute float dist,len,delay,bad;varying float vD,vL,vDl,vB;void main(){vD=dist;vL=len;vDl=delay;vB=bad;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float time,opac,health,flow;varying float vD,vL,vDl,vB;
      void main(){
        float dur=max(4.8,(vL+160.)/220.);float t=mod(time-vDl*.08,dur);float head=t*220.;
        float a=0.;
        if(vD<=head&&vD>=head-160.)a+=.055;if(vD<=head&&vD>=head-75.)a+=.14;if(vD<=head&&vD>=head-16.)a+=.30;
        a*=flow;
        // 颜色写成线性空间值（three 在线性空间混合后再编码成 sRGB），与 2D SVG 的 sRGB 混合视觉一致
        vec3 base=vB>.5?vec3(.80,.056,.069):(health>.5?vec3(.063,.242,.156):vec3(.328,.387,.417));
        float ba=vB>.5?.8:.5;
        vec3 fc=vB>.5?vec3(.80,.056,.069):(health>.5?vec3(.15,.646,.348):vec3(.328,.387,.417));
        float al=clamp(ba+a,0.,1.);gl_FragColor=vec4(mix(base,fc,clamp(a*2.,0.,1.)),al*opac);
      }`});
  return {geo,mat,l1};
})();
const autoCanvas=document.createElement('canvas');autoCanvas.width=128;autoCanvas.height=256;const autoCtx=autoCanvas.getContext('2d'),autoGrad=autoCtx.createLinearGradient(0,256,128,0);autoGrad.addColorStop(0,'#35d9eb');autoGrad.addColorStop(.5,'#7987ff');autoGrad.addColorStop(1,'#ef91cf');autoCtx.fillStyle=autoGrad;autoCtx.fillRect(0,0,128,256);const autoTex=new THREE.CanvasTexture(autoCanvas);
const SHELL_GEO=new THREE.BoxGeometry(1.02,H+.04,DEP+.06),FLOOR_GEO=new THREE.PlaneGeometry(2.6,3.2);
function atlasRoundedBox(width, height, depth, radius) {
  // Extrude bevel extends beyond the original shape/depth. Subtract that
  // extension up front so the finished geometry fits the supplied dimensions.
  const bevel=Math.min(.018,depth*.22,radius*.5);
  const hw=width/2-bevel, hh=height/2-bevel;
  const r=Math.max(.002,radius-bevel);
  const s=new THREE.Shape();
  s.moveTo(-hw+r,-hh);s.lineTo(hw-r,-hh);
  s.quadraticCurveTo(hw,-hh,hw,-hh+r);s.lineTo(hw,hh-r);
  s.quadraticCurveTo(hw,hh,hw-r,hh);s.lineTo(-hw+r,hh);
  s.quadraticCurveTo(-hw,hh,-hw,hh-r);s.lineTo(-hw,-hh+r);
  s.quadraticCurveTo(-hw,-hh,-hw+r,-hh);
  const geo=new THREE.ExtrudeGeometry(s,{
    depth:depth-2*bevel,steps:1,bevelEnabled:true,
    bevelSegments:2,bevelThickness:bevel,bevelSize:bevel,curveSegments:2
  });
  geo.translate(0,0,-depth/2+bevel);
  // Projected front UVs also make the thin side bevel inherit edge pixels.
  const p=geo.attributes.position,uv=geo.attributes.uv;
  for(let n=0;n<p.count;n++)uv.setXY(n,(p.getX(n)+width/2)/width,(p.getY(n)+height/2)/height);
  return geo;
}

function atlasMergeCopies(pieces) {
  const positions=[],normals=[],uvs=[];
  for(const {geo,x=0,y=0,z=0,cab=null} of pieces){
    const src=geo.index?geo.toNonIndexed():geo;
    const p=src.attributes.position,n=src.attributes.normal,t=src.attributes.uv;
    for(let v=0;v<p.count;v++){
      positions.push(p.getX(v)+x,p.getY(v)+y,p.getZ(v)+z);
      normals.push(n.getX(v),n.getY(v),n.getZ(v));
      // Keep front artwork within its cabinet. Other surfaces ignore maps.
      uvs.push(cab===null?t.getX(v):(cab+.07+t.getX(v)*.86)/20,t.getY(v));
    }
    if(src!==geo)src.dispose();
  }
  const merged=new THREE.BufferGeometry();
  merged.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  merged.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  merged.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  merged.computeBoundingSphere();
  return merged;
}

const ATLAS_OVERVIEW_GEO=(()=>{
  // Shell occupies y=[.08,H-.09]; the separate crown y=[H-.08,H].
  // A .01 seam separates their complete volumes, including all bevels.
  // The shell front retreats to .78: the door back is .791, never buried.
  const body=atlasRoundedBox(.97,H-.17,DEP-.14,.035);
  const door=atlasRoundedBox(.837,H-.36,.034,.021);
  const crown=atlasRoundedBox(.952,.08,DEP-.13,.016);
  const rail=new THREE.BoxGeometry(.014,H-.30,.024);
  // Door ends at z=.825; feet begin there and end at .8375.
  // The handle begins at .8375 and ends at .85, meeting its feet from above.
  const handle=atlasRoundedBox(.022,.36,.0125,.006);
  const handleMount=new THREE.BoxGeometry(.022,.020,.0125);
  // Two readable vent bands instead of five subpixel metallic slivers.
  // At z=.835..845 they have .01 clearance from the door, not .001.
  const slot=new THREE.BoxGeometry(.68,.035,.010);
  const shellParts=[],doorParts=[],crownParts=[],trimParts=[],slotParts=[];
  for(let c=0;c<20;c++){
    const x=-W/2+c+.5;
    shellParts.push({geo:body,x,y:H/2-.005});
    // Shell front .78 < door back .791 < door front .825.
    // Frame inner x=.425 > door outer x=.4185: no lateral intersection.
    doorParts.push({geo:door,x,y:H/2+.025,z:DEP/2-.042,cab:c});
    crownParts.push({geo:crown,x,y:H-.04});
    trimParts.push({geo:rail,x:x-.432,y:H/2+.018,z:DEP/2-.014},
                   {geo:rail,x:x+.432,y:H/2+.018,z:DEP/2-.014});
    trimParts.push({geo:handle,x:x+.346,y:H*.50,z:DEP/2-.00625},
                   {geo:handleMount,x:x+.346,y:H*.50-.16,z:DEP/2-.01875},
                   {geo:handleMount,x:x+.346,y:H*.50+.16,z:DEP/2-.01875});
    // Two quiet low vents; no internal hardware or chip grids in the overview.
    for(let v=0;v<2;v++)slotParts.push({geo:slot,x,y:.34+v*.10,z:DEP/2-.010});
  }
  const out={
    shell:atlasMergeCopies(shellParts),door:atlasMergeCopies(doorParts),
    crown:atlasMergeCopies(crownParts),trim:atlasMergeCopies(trimParts),
    slots:atlasMergeCopies(slotParts)
  };
  [body,door,crown,rail,handle,handleMount,slot].forEach(g=>g.dispose());
  return out;
})();

function addAtlasOverviewCabinets(group, materials) {
  const {front,side,top}=materials;
  // A real environment texture is required for this finish. These values
  // cannot create reflections when scene.environment is null.
  side.map=null;side.color.set('#202226');side.roughness=.43;
  side.metalness=.58;side.envMapIntensity=.64;side.needsUpdate=true;
  top.map=null;top.color.set('#3b3f46');top.roughness=.36;
  top.metalness=.65;top.envMapIntensity=.70;top.needsUpdate=true;
  front.color.set('#d0d2d6');front.roughness=.46;
  front.metalness=.40;front.envMapIntensity=.56;
  // The one status indicator remains legible on a black door. The dark
  // facade contributes virtually no glow at this restrained intensity.
  front.emissiveMap=front.map;front.emissive.set('#ffffff');front.emissiveIntensity=.09;
  // All front-facing surfaces are separated; contacting backs are hidden.
  // No polygon offset workaround.
  front.polygonOffset=false;front.needsUpdate=true;
  const meshes=[];
  for(const [name,mat] of [['shell',side],['door',front],['crown',top],['trim',top],['slots',side]]){
    const mesh=new THREE.Mesh(ATLAS_OVERVIEW_GEO[name],mat);
    // Structural volumes cast the contact shadow. Fine hardware is below
    // the directional shadow map's texel size and must not cast microshadows.
    // Cabinets use studio illumination without unstable self-shadow acne;
    // the unchanged floor remains the shadow receiver.
    mesh.castShadow=name==='shell'||name==='crown';mesh.receiveShadow=false;
    mesh.name='Atlas950_overview_'+name;
    group.add(mesh);meshes.push(mesh);
  }
  return meshes;
}


const ROWS3=PODS.map(sp=>{
  const i=sp.i,col=i%COLS,r=Math.floor(i/COLS);
  const xc=(col-(COLS-1)/2)*(W+GAPX),zc=-r*AISLE;
  const g=new THREE.Group();g.position.set(xc,0,zc);scene.add(g);
  const cv=document.createElement('canvas');cv.width=TW;cv.height=THt;
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const side=new THREE.MeshStandardMaterial({map:SIDE_TEX,roughness:.38,metalness:.72,envMapIntensity:.9,transparent:true});
  const topT=TOP_TEX.clone();topT.needsUpdate=true;
  const top=new THREE.MeshStandardMaterial({map:topT,color:'#9a9da3',roughness:.55,metalness:.55,envMapIntensity:.7,transparent:true});
  const front=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.46,metalness:.4});
  const box=new THREE.Mesh(new THREE.BoxGeometry(W,H,DEP),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
  box.position.y=H/2;box.userData.i=i;g.add(box);addAtlasOverviewCabinets(g,{front,side,top});
  // 倒影
  const refl=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));
  refl.scale.y=-1;refl.position.set(0,-H/2-.02,DEP/2);g.add(refl);
  // 地面光晕
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(W+8,DEP+7),new THREE.MeshBasicMaterial({map:SOFT,color:OK,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));
  halo.rotation.x=-Math.PI/2;halo.position.set(0,.02,DEP/2+.6);halo.renderOrder=3;g.add(halo);
  // 选中/刚查看 地面框
  const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-W/2-.5,-DEP/2-.5],[W/2+.5,-DEP/2-.5],[W/2+.5,DEP/2+1.2],[-W/2-.5,DEP/2+1.2]].map(([x,z])=>new THREE.Vector3(x,.03,z))),new THREE.LineBasicMaterial({color:'#4F8BFF',transparent:true,opacity:0}));
  g.add(ring);
  // 柜顶灯条
  const bars=[];
  // 接地：踢脚板 + 接触阴影，让整排「落」在地上
  const kick=new THREE.Mesh(new THREE.BoxGeometry(W-.06,.14,DEP-.12),new THREE.MeshStandardMaterial({color:'#0c0d0e',roughness:.9,metalness:.2,transparent:true}));kick.position.y=.07;g.add(kick);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(W+3.2,DEP+3.2),new THREE.MeshBasicMaterial({map:SOFT,color:'#000000',transparent:true,opacity:.75,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;shadow.renderOrder=2;g.add(shadow);
  // 正面玻璃反光：一层很淡的竖向渐变，镜头推近时收掉
  const gloss=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:GLOSS,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  gloss.position.set(0,H/2,DEP/2+.004);g.add(gloss);gloss.visible=false;
  // 前沿高光线：勾出机柜轮廓
  const edge=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-W/2,H,DEP/2),new THREE.Vector3(W/2,H,DEP/2),...Array.from({length:21},(_,c)=>[new THREE.Vector3(-W/2+c,H,DEP/2),new THREE.Vector3(-W/2+c,H,-DEP/2)]).flat()]),new THREE.LineBasicMaterial({color:'#8a8f96',transparent:true,opacity:.35}));
  g.add(edge);edge.visible=false;
  const shells=new THREE.Group();g.add(shells);
  const mkStrip=(kind,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(W,STRIP_D),new THREE.MeshBasicMaterial({map:stripTex(i,kind),transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(0,.02,DEP/2+.2+STRIP_D/2);m.renderOrder=3;g.add(m);return m};
  const SGH=.9,SGW=SGH*1120/372,signTex=canvasTex(1120,372,(c,w,h)=>{
    const r=56,bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'rgba(210,225,245,.20)');bg.addColorStop(.55,'rgba(150,170,200,.10)');bg.addColorStop(1,'rgba(120,140,170,.16)');
    c.beginPath();c.roundRect?c.roundRect(5,5,w-10,h-10,r):c.rect(5,5,w-10,h-10);c.fillStyle=bg;c.fill();
    c.save();c.clip();const sh=c.createLinearGradient(0,0,w*.6,h);sh.addColorStop(0,'rgba(255,255,255,.16)');sh.addColorStop(.4,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(0,0,w,h);c.restore();
    c.lineWidth=4;c.strokeStyle='rgba(235,242,255,.42)';c.stroke();
    const hl=c.createLinearGradient(0,0,w,0);hl.addColorStop(0,'rgba(255,255,255,0)');hl.addColorStop(.25,'rgba(255,255,255,.75)');hl.addColorStop(.75,'rgba(255,255,255,.2)');hl.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=hl;c.fillRect(r,7,w-2*r,3);
    const tp=46,ts=h-tp*2,tx=w-tp-ts;
    c.beginPath();c.roundRect?c.roundRect(tx,tp,ts,ts,34):c.rect(tx,tp,ts,ts);c.fillStyle='rgba(220,232,250,.16)';c.fill();c.lineWidth=4;c.strokeStyle='rgba(235,242,255,.38)';c.stroke();
    c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=14;c.fillStyle='#ffffff';c.font='600 200px '+'Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(rowL(i),tx+ts/2,h/2+12);
    c.textAlign='left';c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=14;c.fillStyle='#ffffff';c.font='500 150px '+'Arial, sans-serif';c.font='500 138px '+'Arial, sans-serif';c.fillText('Superpod',40,h/2+8);});
  signTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const sign=new THREE.Group();sign.position.set(-W/2+.16+SGW/2,H-.14-SGH/2,DEP/2+.05);g.add(sign);
  const signBack=new THREE.Mesh(new THREE.BoxGeometry(SGW*.98,SGH*.96,.02),new THREE.MeshPhysicalMaterial({color:'#9fb4d0',roughness:.15,metalness:0,clearcoat:1,transparent:true,opacity:.12,depthWrite:false}));signBack.position.z=-.035;sign.add(signBack);
  const signFace=new THREE.Mesh(new THREE.PlaneGeometry(SGW,SGH),new THREE.MeshBasicMaterial({map:signTex,transparent:true,toneMapped:false,depthWrite:false}));signFace.renderOrder=6;sign.add(signFace);
  const nums=mkStrip('num'),names={material:{opacity:0}};
  const letter=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.3),new THREE.MeshBasicMaterial({map:rowLetterTex(i),transparent:true,depthWrite:false}));
  letter.rotation.x=-Math.PI/2;letter.position.set(-W/2-1.9,.02,DEP/2-.3);letter.renderOrder=3;g.add(letter);letter.visible=false;
  const tags=new THREE.Group();g.add(tags);
  // 光纤：直接复用 2D 首页的 64 根光纤几何（同一组贝塞尔），叠加原页面的三层流光
  const fib=FIBER?new THREE.LineSegments(FIBER.geo.clone(),FIBER.mat.clone()):null;
  if(fib){fib.position.z=DEP/2+.02;fib.frustumCulled=false;fib.renderOrder=5;g.add(fib)}
  const bubs=[];
  const lab=document.createElement('div');lab.className='clu-lab'+(sp.offline?' off':'');lab.dataset.i=i;labels.append(lab);
  const bubBox=document.createElement('div');bubBox.className='clu-bubs';bubBox.dataset.i=i;labels.append(bubBox);
  return {sp,i,g,box,front,side,top,tex,cv,refl,halo,ring,bars,fib,bubs,bubBox,lab,kick,shadow,gloss,edge,shells,nums,names,letter,tags,xc,zc,lift:0,liftT:0,sink:0,sinkT:0,fade:1,fadeT:1,dim:1,dimT:1,hover:0,pulse:0};
});
const deviceStatusSelection={fault:true,normal:false};
addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='ccae-device-filter')return;Object.assign(deviceStatusSelection,e.data.selection);renderLegend();ROWS3.forEach(paintRow);placeLabels();});
const boxes=ROWS3.map(r=>r.box);
// Two pending-risk labels requested for SuperpodD, compute cabinet 08.
const roomPendingRisks=document.createElement('div');roomPendingRisks.className='room-pending-risks';
roomPendingRisks.innerHTML=`<button type="button" class="room-risk-beacon" aria-label="SuperpodD 计算柜08，2项故障待处理" aria-expanded="false" aria-describedby="room-risk-tooltip"><span class="room-risk-count">2</span><span class="room-risk-disc"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="white" d="M12 2 23 22H1Z"/><path d="M12 7v6m0 3v1" stroke="#e7434a" stroke-width="2.5"/></svg><span class="room-risk-hand"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#e7434a" d="M7 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v8c0 5-3 8-7 8-3 0-5-2-7-5l-3-4c-1-2 1-3 2-2l3 3z"/></svg></span></span></button><div id="room-risk-tooltip" role="tooltip"><div class="room-risk-list"><div class="room-risk-row"><span class="room-risk-symbol"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="white" d="M12 2 23 22H1Z"/><path d="M12 7v6m0 3v1" stroke="#e7434a" stroke-width="2.5"/></svg></span><strong>NPU驱动固件版本不一致</strong><span class="room-risk-hand"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#e7434a" d="M7 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v8c0 5-3 8-7 8-3 0-5-2-7-5l-3-4c-1-2 1-3 2-2l3 3z"/></svg></span></div><div class="room-risk-row"><span class="room-risk-symbol"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="white" d="M12 2 23 22H1Z"/><path d="M12 7v6m0 3v1" stroke="#e7434a" stroke-width="2.5"/></svg></span><strong>NPU网口linkdown</strong><span class="room-risk-hand"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#e7434a" d="M7 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v8c0 5-3 8-7 8-3 0-5-2-7-5l-3-4c-1-2 1-3 2-2l3 3z"/></svg></span></div><div class="room-risk-location">SuperpodD · 计算柜08</div></div></div>`;labels.append(roomPendingRisks);
const riskBeacon=roomPendingRisks.querySelector('button');
const setRiskOpen=open=>{riskBeacon.classList.toggle('expanded',open);roomPendingRisks.classList.toggle('expanded',open);riskBeacon.setAttribute('aria-expanded',String(open))};
roomPendingRisks.addEventListener('pointerenter',()=>setRiskOpen(true));
roomPendingRisks.addEventListener('pointerleave',()=>{if(document.activeElement!==riskBeacon)setRiskOpen(false)});
riskBeacon.addEventListener('focus',()=>setRiskOpen(true));riskBeacon.addEventListener('blur',()=>setRiskOpen(false));
riskBeacon.addEventListener('click',e=>{e.stopPropagation();setRiskOpen(true)});
riskBeacon.addEventListener('keydown',e=>{if(e.key==='Escape'){setRiskOpen(false);riskBeacon.blur()}});


function paintRow(R){
  const sv=SV&&SV[R.i],off=R.sp.offline,health=S.mode==='health';
  const key=null; // Overview uses the Atlas cabinet facade; detail assets stay unchanged
  if(key){const t=rackTex(key);if(R.front.map!==t){R.front.map=t;R.refl.material.map=t;R.front.needsUpdate=true;R.refl.material.needsUpdate=true}}
  else{drawFront(R.cv.getContext('2d'),sv&&sv.cl,off||!sv);R.tex.needsUpdate=true;if(R.front.map!==R.tex){R.front.map=R.tex;R.refl.material.map=R.tex;R.front.needsUpdate=true;R.refl.material.needsUpdate=true}}
  const tone=new THREE.Color(rowTone(R.i));
  R.halo.material.color.copy(tone);R.halo.material.opacity=off||health?0:.13;
  // 故障机柜：整柜罩一层红光（前面 + 顶 + 地面红晕），取代柜顶色块
  R.shells.children.forEach(m=>m.material.dispose());R.shells.clear();
  if(health&&deviceStatusSelection.fault&&sv&&!off){const cabs=[...new Set(sv.cl.faults.map(f=>f.cab))];
    cabs.forEach(c=>{const x=-W/2+c+.5,auto=sv.cl.faults.filter(f=>f.cab===c).every(f=>f.phase==='auto');
      const m=new THREE.Mesh(SHELL_GEO,new THREE.MeshBasicMaterial({map:auto?autoTex:null,color:auto?'#ffffff':'#ff3340',transparent:true,opacity:auto?.45:.42,blending:auto?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false}));m.position.set(x,H/2,0);
      const fl=new THREE.Mesh(FLOOR_GEO,new THREE.MeshBasicMaterial({map:SOFT,color:auto?'#9985ff':'#ff2a36',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));fl.rotation.x=-Math.PI/2;fl.position.set(x,.02,DEP/2+.9);
      R.shells.add(m,fl)})}
  // SuperpodD compute cabinet 08: match its pending-risk beacon.
  if(health&&deviceStatusSelection.fault&&!off&&R.i===3){
    const x=-W/2+7.5;
    const riskShell=new THREE.Mesh(SHELL_GEO,new THREE.MeshBasicMaterial({color:'#e7434a',transparent:true,opacity:.42,depthWrite:false}));
    riskShell.position.set(x,H/2,0);
    const riskGlow=new THREE.Mesh(FLOOR_GEO,new THREE.MeshBasicMaterial({map:SOFT,color:'#e7434a',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
    riskGlow.rotation.x=-Math.PI/2;riskGlow.position.set(x,.02,DEP/2+.9);
    R.shells.add(riskShell,riskGlow);
  }
  if(health&&deviceStatusSelection.normal&&!off&&sv){
    const faultCabinets=new Set(sv.cl.faults.map(f=>f.cab));if(R.i===3)faultCabinets.add(7);
    for(let c=0;c<W;c++){if(faultCabinets.has(c))continue;const m=new THREE.Mesh(SHELL_GEO,new THREE.MeshBasicMaterial({color:'#2bc68b',transparent:true,opacity:.18,depthWrite:false}));m.userData.normal=true;m.position.set(-W/2+c+.5,H/2,0);R.shells.add(m)}
  }
  if(LOC&&LOC.i===R.i&&LOC.c!=null){const m=new THREE.Mesh(SHELL_GEO,new THREE.MeshBasicMaterial({color:'#4d95ff',transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));m.userData.loc=true;m.position.set(-W/2+LOC.c+.5,H/2,0);R.shells.add(m)}
  R.tags.children.forEach(m=>{m.material.map?.dispose();m.material.dispose()});R.tags.clear();
  if(health&&deviceStatusSelection.fault&&sv&&!off)[...new Set(sv.cl.faults.map(f=>f.cab))].forEach(c=>R.tags.add(floorTag(R,c,locCode(R.i,c),sv.cl.faults.filter(f=>f.cab===c).every(f=>f.phase==='auto')?'#9985ff':'#e7434a')));
  if(health&&deviceStatusSelection.fault&&!off&&R.i===3)R.tags.add(floorTag(R,7,locCode(R.i,7),'#e7434a'));
  if(LOC&&LOC.i===R.i&&LOC.c!=null)R.tags.add(floorTag(R,LOC.c,locCode(R.i,LOC.c),'#2f7cf6'));
  if(R.fib){const bad=R.fib.geometry.getAttribute('bad'),arr=bad.array,set=new Set(health&&sv?sv.cl.badSw:[]);
    // 每根光纤 48 段 × 2 顶点，按顺序回推每段属于哪根光纤
    for(let f=0;f<FIBER.l1.length;f++){const b=set.has(FIBER.l1[f])?1:0;for(let v=f*96;v<f*96+96;v++)arr[v]=b}
    bad.needsUpdate=true;R.fib.material.uniforms.health.value=health?1:0;R.fib.material.uniforms.flow.value=off||!sv?0:1}
  if(off||!sv){R.bars.forEach(b=>{b.material.color.set('#2a2c30')});paintBubbles(R,[]);return}
  const cc=cabColors(sv.cl);R.bars.forEach((b,c)=>b.material.color.set(cc[c]));
  paintBubbles(R,health&&deviceStatusSelection.fault?sv.cl.faults:[]);
}
/* 机柜顶部故障气泡：样式与 2D 首页 root-fault-bubble 一致（红底圆角 + 白色警示三角 + 名称 + ›，下方引线落到柜顶） */
const BUB_ICON='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 3 22 20H2Z" fill="#fff" stroke="#fff" stroke-linejoin="round"/><path d="M12 9.5v5" stroke="#e7434a" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.3" fill="#e7434a"/></svg>';
const PIN_ICON='<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="#fff"/><circle cx="12" cy="9" r="2.6" fill="#2f7cf6"/></svg>';
function paintBubbles(R,list){
  /* 故障标记：一个故障柜一个圆形徽标（颜色 = 柜内最高级别，数字 = 故障数），不再直接写长文本；
     相邻徽标在屏幕上挤到一起时自动合并（见 placeLabels），悬停展开故障清单 */
  const by={};list.forEach(f=>{(by[f.cab]=by[f.cab]||[]).push(f)});
  R.marks=Object.keys(by).map(Number).sort((a,b)=>a-b).map((cab,n)=>{const fs=by[cab].slice().sort((a,b)=>a.sev-b.sev);return {cab,faults:fs,sev:fs[0].sev,n}});
  R.loc=LOC&&LOC.i===R.i&&LOC.c!=null?LOC.c:null;
  R.bubBox.innerHTML=R.marks.map((m,n)=>`<div class="clu-fb" data-n="${n}"><div class="dot"></div><div class="lead"></div></div>`).join('')+
    (R.loc!=null?`<div class="clu-bub loc" data-loc="1"><div class="pill">${PIN_ICON}<em>${locCode(R.i,R.loc)}</em><span>${cabName(R.loc)}</span></div><div class="lead"></div></div>`:'');
}
const SEVC=['#e7434a','#e7434a','#e7434a','#e7434a'],SEVN=['紧急','重要','次要','提示'];
const EXCL='<svg class="room-fault-symbol" role="img" aria-label="故障" viewBox="0 0 24 24" width="30" height="30"><path d="M10.3 3.5a2 2 0 0 1 3.4 0l9 16A2 2 0 0 1 21 22H3a2 2 0 0 1-1.7-2.5z" fill="#fff"/><path d="M12 8v6" stroke="#e7434a" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="18" r="1.3" fill="#e7434a"/></svg>';
/* 故障清单浮层 */
const fpop=document.createElement('div');fpop.id='clu-fpop';screen.append(fpop);
let fpopKey=null,fpopTimer=0,fpopData=null;
function openFpop(R,cl,sub){
  fpopData={R,cl,sub};fpopKey=R.i+':'+cl.key;clearTimeout(fpopTimer);
  const cabs=[...new Set(cl.cabs)],cab=sub!=null?sub:(cabs.length===1?cabs[0]:null);
  const fs=(cab!=null?cl.faults.filter(f=>f.cab===cab):cl.faults).slice().sort((a,b)=>a.sev-b.sev);
  fpop.innerHTML=fs.map(f=>{const manual=f.phase==='manual',label=sharedStory.titles?.[f.key]||f.label||'';return '<div data-linked-event="'+f.key+'" class="room-fault-pill '+(manual?'manual':'auto')+'"><span class="pill-label"><span aria-hidden="true">▲</span> '+esc(label)+'<small class="pill-device">'+esc(cabName(f.cab))+' · '+(f.key==='optical'?'L1交换板02':f.key==='qwen'?'112.34.23.1 · CPU02':'计算柜13 · NPU')+'</small></span><span class="pill-state">'+(manual&&sharedStory.hand?'<img src="'+sharedStory.hand+'" alt="待人工处理">':'<span aria-label="自动处理中">◌</span>')+(f.key==='qwen'?'<b class="room-impact" title="影响业务">✱</b>':'')+'</span></div>'}).join('');
  fpop._list=fs;fpop.style.display='block';fpop.classList.remove('morph-closing');fpop.classList.add('morph-open');
}
function closeFpop(now){clearTimeout(fpopTimer);const f=()=>{fpop.style.display='none';fpop.classList.remove('morph-open');fpopKey=null;fpopData=null;labels.querySelectorAll('.morph-source').forEach(n=>n.classList.remove('morph-source'))};now?f():fpopTimer=setTimeout(f,260)}
fpop.addEventListener('pointerenter',()=>clearTimeout(fpopTimer));
fpop.addEventListener('pointerleave',()=>closeFpop());
fpop.addEventListener('click',e=>{if(!fpopData||!CL.active||CL.anim)return;const R=fpopData.R;
  if(e.target.closest('.bk')){openFpop(R,fpopData.cl);return}
  const g=e.target.closest('.r.g');if(g){openFpop(R,fpopData.cl,+g.dataset.cab);return}
  const r=e.target.closest('.r');if(r){const f=fpop._list[+r.dataset.k];closeFpop(true);enter(R.i,{trace:f});return}
  if(e.target.closest('.ft')){closeFpop(true);enter(R.i)}});
function paintLabel(R){
  const sp=R.sp,m=metric(R.i),st=stOf(R.i);
  let chip='';
  if(sp.offline)chip='<span class="chip off">离线</span>';
  else if(S.mode==='health')chip=m.e?`<span class="chip err">▲ ${m.t}</span>`:'<span class="ok"></span>';
  else if(S.mode==='util')chip=`<span class="val">${st.util.toFixed(1)}<small>%</small></span>`+(st.util<30?'<span class="chip tag">低负载</span>':st.util>=60?'<span class="chip tag hot">高负载</span>':'');
  else chip=`<span class="val">${st.kw.toFixed(1)}<small>kW</small></span>`;
  const more=sp.offline?'最后上报 09:12:07':S.mode==='health'?(st.faults?`自动处理中 ${SV[R.i].cl.faults.filter(f=>f.phase==='auto').length} · 待人工处理 ${SV[R.i].cl.faults.filter(f=>f.phase==='manual').length}`:'1024 卡 · 20 柜 · 运行正常'):S.mode==='util'?`满载 ${st.full} 卡 · CPU ${st.cpu.toFixed(1)}%`:`单卡均 ${Math.round(st.npuW)} W`;
  R.lab.innerHTML=`<div class="nm"><span class="rl">${rowL(R.i)}</span>${sp.name}${chip}</div><div class="more">${more}${sp.offline?'':' · 点击进入 ›'}</div>`;
}

/* ---------- 相机 ---------- */
const hallW=COLS*W+(COLS-1)*GAPX,hallD=(ROWS-1)*AISLE+DEP;
const T0=new THREE.Vector3(0,H*.35,-(ROWS-1)*AISLE/2+.6);
const CAM={yaw:-.3,pitch:.6,dist:1,yawT:-.3,pitchT:.6,distT:1};
const FOC=T0.clone(),FOCT=T0.clone();let LOC=null;
function fitDist(){const a=camera.aspect,v=THREE.MathUtils.degToRad(camera.fov);
  const needW=(hallW+8)/(2*Math.tan(v/2)*a),needD=(hallD+H*2+10)/(2*Math.tan(v/2));return Math.max(needW,needD)*.9}
function overviewPose(t){
  const d=fitDist()*CAM.dist,y=CAM.yaw+(reduce?0:Math.sin(t*.00011)*.035)+PAR.x*.04,p=CAM.pitch+PAR.y*.025;
  const pos=new THREE.Vector3(FOC.x+d*Math.cos(p)*Math.sin(y),FOC.y+d*Math.sin(p),FOC.z+d*Math.cos(p)*Math.cos(y));
  return {pos,tgt:FOC.clone().add(new THREE.Vector3(0,-1.4,0))};
}
function frontalPose(R,tr){
  const cr=renderer.domElement.getBoundingClientRect();
  const f=cr.height/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));
  const d=W*f/tr.width,ox=(tr.left+tr.width/2)-(cr.left+cr.width/2),oy=(tr.top+tr.height/2)-(cr.top+cr.height/2);
  const fz=R.zc+DEP/2,cx=R.xc-ox*d/f,cy=H/2+oy*d/f;
  return {pos:new THREE.Vector3(cx,cy,fz+d),tgt:new THREE.Vector3(cx,cy,fz)};
}
const PAR={x:0,y:0,tx:0,ty:0};
let fly=null;      // {from,to,t0,dur,done}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

/* ---------- 后期：泛光 ---------- */
let composer=null,bloom=null;
if(!LIGHT&&THREE.EffectComposer){
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(1024,512),.75,.45,.62);composer.addPass(bloom);
}
let BLOOM=.75;
function resize(){
  const r=host.getBoundingClientRect();if(!r.width)return;
  renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
  if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(r.width,r.height)}
}
addEventListener('resize',()=>requestAnimationFrame(resize));

/* ---------- 交互 ---------- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
let hovered=-1,drag=null,interactionMode='rotate';
function pickAt(e){const r=renderer.domElement.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObjects(boxes.filter(b=>b.visible),false)[0];return hit?hit.object.userData.i:-1}
host.addEventListener('pointermove',e=>{
  const r=host.getBoundingClientRect();PAR.tx=(e.clientX-r.left)/r.width-.5;PAR.ty=(e.clientY-r.top)/r.height-.5;
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
    if(interactionMode==='pan'){FOCT.x=drag.fx-dx*.035;FOCT.z=drag.fz-dy*.035;return;}CAM.yawT=Math.max(-1.05,Math.min(.35,drag.yaw-dx*.004));CAM.pitchT=Math.max(.28,Math.min(1.1,drag.pitch+dy*.003));return}
  if(!CL.active||CL.anim)return;
  const i=pickAt(e);if(i!==hovered){hovered=i;host.style.cursor=i<0?'grab':PODS[i].offline?'not-allowed':'pointer';labels.querySelectorAll('.clu-lab').forEach(l=>l.classList.toggle('hov',+l.dataset.i===i))}
});
host.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:CAM.yawT,pitch:CAM.pitchT,fx:FOCT.x,fz:FOCT.z,moved:false};host.setPointerCapture(e.pointerId);host.style.cursor='grabbing'});
host.addEventListener('pointerup',e=>{const d=drag;drag=null;host.style.cursor=hovered<0?'grab':'pointer';if(d&&!d.moved&&CL.active&&!CL.anim){const i=pickAt(e);if(i>=0)enter(i);else unlocate()}});
host.addEventListener('wheel',e=>{if(!CL.active)return;e.preventDefault();CAM.distT=Math.max(.45,Math.min(1.35,CAM.distT*(1+e.deltaY*.0012)))},{passive:false});
labels.addEventListener('click',e=>{if(!CL.active||CL.anim)return;
  const fb=e.target.closest('.clu-fb');if(fb&&fb._cl){const R=ROWS3[+fb.parentElement.dataset.i];const f=fb._cl.faults.slice().sort((a,b)=>a.sev-b.sev)[0];closeFpop(true);enter(R.i,{trace:f});return}
  const bub=e.target.closest('.clu-bub');if(bub){enter(+bub.parentElement.dataset.i);return}
  const l=e.target.closest('.clu-lab');if(l){const R=ROWS3[+l.dataset.i];const top=(R.marks||[]).flatMap(m=>m.faults).sort((a,b)=>a.sev-b.sev)[0];enter(R.i,{trace:e.target.closest('.chip.err')?top:null})}});
labels.addEventListener('pointerover',e=>{const fb=e.target.closest('.clu-fb');if(fb&&fb._cl&&S.mode==='health'&&CL.active&&!CL.anim){const R=ROWS3[+fb.parentElement.dataset.i];if(fpopKey!==R.i+':'+fb._cl.key)openFpop(R,fb._cl);else clearTimeout(fpopTimer)}});
labels.addEventListener('pointerout',e=>{const fb=e.target.closest('.clu-fb');if(fb&&!(e.relatedTarget&&(e.relatedTarget.closest('#clu-fpop')||e.relatedTarget.closest('.clu-fb')===fb)))closeFpop()});
labels.addEventListener('pointerover',e=>{const b=e.target.closest('.clu-fb,.clu-bub,.clu-lab');const i=b?+(b.dataset.i??b.parentElement.dataset.i):-1;if(i!==hovered&&CL.active&&!CL.anim){hovered=i;labels.querySelectorAll('.clu-lab').forEach(l=>l.classList.toggle('hov',+l.dataset.i===i))}});

/* ---------- 主循环 ---------- */
let running=false,last=performance.now(),roomVisible=true;
addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='ccae-room-visible')return;roomVisible=e.data.visible;if(!roomVisible)stop();else if(!document.hidden){renderCluster();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(roomVisible)start()});
let lastDraw=0;
function loop(now){
  if(!running)return;requestAnimationFrame(loop);
  // 空闲时（没有飞行/拖拽/过渡）限到 30fps，降低 GPU 占用
  const busy=fly||drag||CL.anim||Math.abs(CAM.yawT-CAM.yaw)>.003||Math.abs(CAM.pitchT-CAM.pitch)>.003||FOC.distanceTo(FOCT)>.01||Math.abs(CAM.distT-CAM.dist)>.003||ROWS3.some(R=>Math.abs(R.sinkT-R.sink)>.002||Math.abs(R.fadeT-R.fade)>.002);
  if(!busy&&now-lastDraw<80)return;lastDraw=now;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const k=1-Math.pow(.0015,dt);
  FOC.lerp(FOCT,k);CAM.yaw+=(CAM.yawT-CAM.yaw)*k;CAM.pitch+=(CAM.pitchT-CAM.pitch)*k;CAM.dist+=(CAM.distT-CAM.dist)*k;
  PAR.x+=(PAR.tx-PAR.x)*k*.5;PAR.y+=(PAR.ty-PAR.y)*k*.5;
  let pose;
  if(fly){const t=window.__flyT!=null?window.__flyT:Math.max(0,Math.min(1,(now-fly.t0)/fly.dur)),e=ease(t),a=fly.from(),b=fly.to();
    pose={pos:a.pos.lerp(b.pos,e),tgt:a.tgt.lerp(b.tgt,e)};
    if(fly.bloom)BLOOM=fly.bloom[0]+(fly.bloom[1]-fly.bloom[0])*e;
    if(t>=1){const done=fly.done;fly=null;done&&done()}}
  else pose=CL.active?overviewPose(now):null;
  if(pose){camera.position.copy(pose.pos);camera.lookAt(pose.tgt)}
  ROWS3.forEach(R=>{
    R.lift+=((hovered===R.i&&CL.active&&!CL.anim?.18:0)-R.lift)*k*1.6;
    R.sink+=(R.sinkT-R.sink)*Math.min(1,k*(R.sinkT>R.sink?1.15:.9));
    R.fade+=(R.fadeT-R.fade)*k*1.4;R.dim+=(R.dimT-R.dim)*k*1.4;
    R.g.position.y=R.lift-R.sink*(H+1.2);
    const o=R.fade*R.dim;R.g.visible=R.fade>.01;
    R.front.opacity=o;R.side.opacity=o;R.top.opacity=o;R.refl.material.opacity=.16*o;
    const bk=Math.min(1,BLOOM/.75);R.bars.forEach(b=>b.material.opacity=o*bk);
    const hv=hovered===R.i&&CL.active&&!CL.anim;
    R.ring.material.opacity=Math.max(hv?.9:0,CL.last===R.i&&CL.active?(.45+.45*Math.sin(now*.006))*(Math.max(0,1-(Date.now()-CL.seenT)/6000)):0)*o;
    R.side.emissive&&R.side.emissive.set(hv?'#0d2147':'#000000');
    // 机房视角不画光纤；只在推近到正对视角时（泛光收到 0 的过程中）淡入，与 2D 首页接上
    if(R.fib){const fk=(1-bk)*o;R.fib.visible=fk>.01;R.fib.material.uniforms.time.value=now/1000;R.fib.material.uniforms.opac.value=fk*(R.sp.offline?.25:1)}
    const pulse=.2+.09*Math.sin(now*.0032+R.i);
    R.shells.children.forEach(m=>{m.material.opacity=(m.userData.normal?.18:m.userData.loc?(.38+.18*Math.sin(now*.006)):(m.geometry===SHELL_GEO?Math.max(.42,pulse):pulse*2.2))*o*bk});
    // 地面标识的层级：排号常显；柜位号默认淡显，悬停该排 / 拉近 / 定位时加亮；柜名只在拉近后出现
    const near=Math.min(1,Math.max(0,(1-CAM.dist)/.3)),focusRow=(hv||(LOC&&LOC.i===R.i))?1:0;
    R.nums.material.opacity=o*bk*(.38+.62*Math.max(near,focusRow));
    R.letter.material.opacity=o*bk*(R.sp.offline?.4:.9);
    R.tags.children.forEach(t=>t.material.opacity=o*bk);
    R.kick.material.opacity=o;R.shadow.material.opacity=.75*o;R.gloss.material.opacity=.5*o*bk;R.edge.material.opacity=.35*o*bk;
    R.halo.material.opacity=R.halo.userData.base!=null?R.halo.userData.base*o*bk:R.halo.material.opacity;
  });
  if(wave){const t=(now-wave.t0)/1100;if(t>=1){scene.remove(wave.m);wave=null}else{wave.m.scale.setScalar(1+t*90);wave.m.material.opacity=(1-t)*.55}}
  if(bloom)bloom.strength=BLOOM;
  composer?composer.render():renderer.render(scene,camera);
  placeLabels();
}
function start(){if(running||!roomVisible||document.hidden)return;running=true;resize();last=performance.now();requestAnimationFrame(loop)}
function stop(){running=false}
const v3=new THREE.Vector3();
function placeLabels(){
  const show=CL.active&&!CL.anim;labels.style.opacity=show?1:0;if(!show){if(fpopKey)closeFpop(true);return}
  const cr=renderer.domElement.getBoundingClientRect(),sr=screen.getBoundingClientRect();
  const P=(x,y,z)=>{v3.set(x,y,z).project(camera);return [((v3.x+1)/2*cr.width+cr.left-sr.left)/SCALE,((1-v3.y)/2*cr.height+cr.top-sr.top)/SCALE]};
  const riskRow=ROWS3[3];
  roomPendingRisks.style.display=riskRow&&deviceStatusSelection.fault&&S.mode==='health'&&riskRow.fade>.5&&riskRow.dim>.5?'':'none';
  if(riskRow){const [rx,ry]=P(riskRow.xc-W/2+7.5,riskRow.g.position.y+H+.02,riskRow.zc+DEP/2);roomPendingRisks.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-105%)`;if(sharedStory.hand&&roomPendingRisks.dataset.hand!==sharedStory.hand){roomPendingRisks.dataset.hand=sharedStory.hand;roomPendingRisks.querySelectorAll('.room-risk-hand').forEach(el=>{const img=document.createElement('img');img.src=sharedStory.hand;img.alt='待人工处理';el.replaceChildren(img)})}}
  ROWS3.forEach(R=>{
    const rightSide=(R.i%COLS)>=COLS/2;
    const [x,y]=P(rightSide?R.xc+W/2+.6:R.xc-W/2-.6,R.g.position.y+H*.45,R.zc+DEP/2);
    R.lab.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${rightSide?'0':'-100%'},-50%)`;R.lab.classList.toggle('r',rightSide);R.lab.style.opacity=0;R.lab.style.pointerEvents='none';
    const vis=(S.mode==='health'||(LOC&&LOC.i===R.i))&&R.fade>.5&&R.dim>.5;R.bubBox.style.display=vis?'':'none';if(!vis)return;
    const kids=R.bubBox.children;
    // 1) 投影每个故障柜的柜顶位置
    const pts=R.marks.map(m=>{const [bx,by]=P(R.xc-W/2+m.cab+.5,R.g.position.y+H+.02,R.zc+DEP/2);return {m,x:bx,y:by}});
    // 2) 屏幕空间聚合：同一排里，相距 < 64 设计像素的徽标并成一个（类似地图标注聚合）
    const cls=[];pts.forEach(p=>{const c=cls[cls.length-1];if(c&&Math.abs(p.x-c.x1)<64&&Math.abs(p.y-c.y1)<44){c.items.push(p);c.x1=p.x;c.y1=p.y}else cls.push({items:[p],x1:p.x,y1:p.y})});
    cls.forEach(c=>{const it=c.items,lead=it[0],x=it.reduce((a,p)=>a+p.x,0)/it.length,y=Math.min(...it.map(p=>p.y));
      c.faults=it.flatMap(p=>p.m.faults);c.cabs=it.map(p=>p.m.cab);c.key=c.cabs.join('-');c.sev=Math.min(...it.map(p=>p.m.sev));
      it.forEach((p,k)=>{const el=kids[p.m.n];el.style.display=k===0?'':'none'});
      const el=kids[lead.m.n],dot=el.firstChild,n=c.faults.length,sig=c.sev+'|'+n+'|'+it.length+'|'+c.faults.map(f=>f.phase).join(',');
      if(el._sig!==sig){el._sig=sig;dot.style.background=SEVC[c.sev];dot.innerHTML=EXCL+(n>1?`<b>${n}</b>`:'');el.classList.toggle('s0',c.sev===0);el.classList.toggle('grp',it.length>1)}
      const manual=c.faults.some(f=>f.phase==='manual'),automatic=c.faults.some(f=>f.phase==='auto'),impacting=c.faults.some(f=>f.key==='qwen');el.classList.toggle('shared-auto',automatic&&!manual);el.querySelector('.shared-state')?.remove();
      const flagSignature=[manual,impacting,Boolean(sharedStory.hand),n].join('|');if(dot.dataset.flags!==flagSignature||!dot.querySelector('.room-fault-symbol')){dot.dataset.flags=flagSignature;dot.innerHTML=EXCL+(n>1?'<b>'+n+'</b>':'');if(manual||impacting){const flags=document.createElement('span');flags.className='room-status-flags';if(manual&&sharedStory.hand){const hand=document.createElement('img');hand.src=sharedStory.hand;hand.alt='待人工处理';flags.append(hand);}if(impacting){const impact=document.createElement('span');impact.className='room-impact';impact.textContent='✱';impact.title='影响业务';impact.setAttribute('aria-label','影响业务');flags.append(impact);}dot.append(flags);}}el.setAttribute('aria-label',c.faults.map(f=>f.label+'：'+f.comp).join('；'));
      el._cl=c;el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      el.classList.toggle('morph-source',fpopKey===R.i+':'+c.key);
      if(fpopKey===R.i+':'+c.key){const px=Math.max(360,Math.min(3480,x));fpop.style.transform=`translate(${px.toFixed(1)}px,${(y-67).toFixed(1)}px) translate(-50%,-50%)`;}
    });
    if(fpopKey&&fpopKey.startsWith(R.i+':')&&!cls.some(c=>fpopKey===R.i+':'+c.key))closeFpop(true);
    // 3) 定位标注
    if(R.loc!=null){const el=R.bubBox.querySelector('[data-loc]');const [bx,by]=P(R.xc-W/2+R.loc+.5,R.g.position.y+H+.02,R.zc+DEP/2);
      el.style.transform=`translate(${bx.toFixed(1)}px,${by.toFixed(1)}px)`;el.firstChild.style.bottom='96px';el.lastChild.style.height='96px'}
  });
}
/* ---------- 图层切换：涟漪重染 ---------- */
let wave=null,paintedMode=null;
function repaintAll(animated){
  const order=ROWS3.slice().sort((a,b)=>Math.hypot(a.xc,a.zc-T0.z)-Math.hypot(b.xc,b.zc-T0.z));
  if(!animated||reduce){ROWS3.forEach(R=>{paintRow(R);R.halo.userData.base=R.halo.material.opacity;paintLabel(R)});return}
  const tone=S.mode==='health'?'#2dc16f':S.mode==='util'?'#6B9BFA':'#FCC800';
  if(wave)scene.remove(wave.m);
  const m=new THREE.Mesh(new THREE.RingGeometry(.96,1,96),new THREE.MeshBasicMaterial({color:tone,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.set(T0.x,.06,T0.z);scene.add(m);wave={m,t0:performance.now()};
  const t0=performance.now(),maxD=Math.hypot(hallW/2,hallD/2)||1;
  order.forEach(R=>{const d=Math.hypot(R.xc,R.zc-T0.z);setTimeout(()=>{paintRow(R);R.halo.userData.base=R.halo.material.opacity;paintLabel(R);
    R.bars.forEach(b=>{const c=b.material.color.clone();b.material.color.set('#ffffff');setTimeout(()=>b.material.color.copy(c),120)})},Math.round(d/maxD*620))});
}

/* ---------- 柜位定位：搜索框输入 A-03 / B 排 / 超节点 03，回车后镜头移过去并高亮 ---------- */
function locate(q){
  let loc=parseLoc(q);
  if(!loc){const k=(q||'').toLowerCase().replace(/\s/g,'');const p=PODS.find(p=>k&&(p.name.toLowerCase().replace(/\s/g,'').includes(k)));if(p)loc={i:p.i,c:null}}
  if(!loc)return false;
  LOC={...loc,t:performance.now()};const R=ROWS3[loc.i];
  FOCT.set(R.xc+(loc.c!=null?(-W/2+loc.c+.5)*.6:0),H*.35,R.zc);CAM.distT=loc.c!=null?.5:.62;
  ROWS3.forEach(paintRow);
  return true;
}
function unlocate(){if(!LOC)return;LOC=null;FOCT.copy(T0);CAM.distT=1;ROWS3.forEach(paintRow)}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&CL.active){unlocate();if(CL.q){CL.q='';const i=root.querySelector('.clu-first input');if(i)i.value='';paintFilter()}}});
/* ---------- 指标/筛选 ---------- */
function paintFilter(){
  ROWS3.forEach(R=>{R.dimT=matches(R.i)?1:.14});
  const any=ROWS3.some(R=>matches(R.i));
  let e=root.querySelector('.clu-empty');if(!any&&!e){e=document.createElement('div');e.className='clu-empty';e.textContent='没有符合条件的超节点';root.querySelector('#clu-space').append(e)}
  if(any&&e)e.remove();
}
function renderCluster(){
  SV=survey();if(parent===window){renderKpis();renderBar();}renderLegend();
  repaintAll(paintedMode!=null&&paintedMode!==S.mode);paintedMode=S.mode;paintFilter();
}

/* ---------- render 挂钩（最外层） ---------- */
const prevRender=render;
render=function(){
  if(parent===window)prevRender();
  screen.classList.toggle('clu-show',CL.active||CL.anim);
  if(!CL.anim)screen.classList.toggle('clu-hidebody',CL.active);
  screen.classList.toggle('clu-idle',CL.active&&!CL.anim);
  if(CL.active&&!CL.anim){renderCluster();start()}
  if(!SV)SV=survey();
  syncTitle();renamePod();
};

/* ---------- 进入 / 返回 ---------- */
function rackRect(){
  const svg=$('stageInner').querySelector('svg.r2-home-svg');if(!svg)return null;
  const rs=[...svg.querySelectorAll('[data-act="pod"],[data-act="netcab"]')].map(g=>g.getBoundingClientRect());if(!rs.length)return null;
  const l=Math.min(...rs.map(r=>r.left)),t=Math.min(...rs.map(r=>r.top)),rr=Math.max(...rs.map(r=>r.right)),b=Math.max(...rs.map(r=>r.bottom));
  return {left:l,top:t,width:rr-l,height:b-t};
}
function resetDetail(){S.view={lv:'cluster'};S.sel=null;S.face='front';S.nav='res';S.biz=null;S.logic=null;S.zoom=null;S.filter='all';S.q='';hfTreeOpen=false;
  if(typeof hideHover==='function')hideHover();if(typeof closeUnpinned==='function')closeUnpinned();}
function setPod(i){CL.cur=i;apply(PODS[i])}
const overlays=()=>[root,labels,hint];
function enter(i,opt){
 if(window.parent!==window){
 if(i!==0){toast('当前演示仅接入 超节点 A');return;}if(CL.anim)return;
 closeFpop(true);CL.anim=true;const R=ROWS3[0];ROWS3.forEach(o=>{if(o!==R){o.sinkT=1;o.fadeT=0}});
 const from=camera.position.clone(),target=new THREE.Vector3();camera.getWorldDirection(target);target.multiplyScalar(40).add(from);
 const rect=renderer.domElement.getBoundingClientRect(),tr={left:rect.left+rect.width*.035,top:rect.top+rect.height*.30,width:rect.width*.93,height:rect.height*.5};
 const finish=()=>{parent.postMessage({type:'ccae-room-enter',index:0},'*');setTimeout(()=>{CL.anim=false;ROWS3.forEach(o=>{o.sinkT=0;o.fadeT=1});},180)};
 fly={from:()=>({pos:from.clone(),tgt:target.clone()}),to:()=>frontalPose(R,tr),t0:performance.now(),dur:reduce?100:1400,done:finish};return;
 }

  closeFpop(true);
  const sp=PODS[i];
  if(sp.offline){toast(sp.name+' 离线，暂无法查看详情');return}
  if(CL.anim)return;
  CL.anim=true;hovered=-1;host.style.cursor='default';
  const R=ROWS3[i];
  // 先把 2D 详情排好（隐藏着），拿到机柜区在屏幕上的精确位置，镜头就落到那里
  setPod(i);CL.active=false;resetDetail();if(window.__roomBooted)render();
  const tr=rackRect();
  overlays().forEach(el=>el.animate([{opacity:1},{opacity:0}],{duration:280,fill:'forwards'}));
  ROWS3.forEach(o=>{if(o!==R){o.sinkT=1;o.fadeT=0}});
  const from=camera.position.clone(),fromT=new THREE.Vector3();camera.getWorldDirection(fromT);fromT.multiplyScalar(40).add(from);
  const end=()=>{
    screen.classList.remove('clu-hidebody');
    $('body').animate([{opacity:0},{opacity:1}],{duration:reduce?120:420,easing:'ease-out'});
    host.animate([{opacity:1},{opacity:0}],{duration:reduce?120:420,fill:'forwards'}).onfinish=()=>{
      screen.classList.remove('clu-show');overlays().forEach(el=>el.getAnimations().forEach(x=>x.cancel()));
      host.getAnimations().forEach(x=>x.cancel());stop();CL.anim=false;syncTitle();
      if(opt&&opt.trace)setTimeout(()=>trace(opt.trace),600)};
  };
  if(!tr||reduce){end();return}
  fly={from:()=>({pos:from.clone(),tgt:fromT.clone()}),to:()=>frontalPose(R,tr),t0:performance.now(),dur:1500,bloom:[BLOOM,0],done:end};
}
window.roomEnter=enter;
/* 故障溯源：正面故障先点亮 2D 首页上对应的故障气泡，再下钻到根因卡；背面（光模块）故障直接下钻到对应 L1 互联刀片 */
function trace(f){
  if(CL.active||!f)return;
  const G=window.CCAE_FAULT_GROUPS,rec=G&&G.records().find(r=>r.key===f.key);
  // 与 2D 刀片悬浮卡里点一条故障完全相同：进入所属刀片详情并选中对应器件，故障卡按这条故障 ID 显示根因与建议
  if(rec){G.navigate(rec);return}
  if(typeof goRootCard==='function')goRootCard(f.go);
}
function leave(){
  if(CL.active||CL.anim)return;
  const atHome=r2Home()&&S.face==='front'&&!S.zoom&&!S.sel;
  const tr=atHome?rackRect():null;
  CL.anim=true;CL.last=CL.cur;CL.seenT=Date.now();CL.active=true;
  resetDetail();closePop();
  SV=survey();renderKpis();renderBar();renderLegend();repaintAll(false);paintedMode=S.mode;paintFilter();
  const R=ROWS3[CL.cur];
  screen.classList.add('clu-show');start();
  const ov=overviewPose(performance.now());
  ROWS3.forEach(o=>{if(o!==R){o.sinkT=0;o.fadeT=1;if(tr){o.sink=1;o.fade=0}}});
  overlays().forEach(el=>el.animate([{opacity:0},{opacity:1}],{duration:420,delay:tr?900:200,fill:'backwards'}));
  const bodyOut=$('body').animate([{opacity:1},{opacity:0}],{duration:reduce?120:320,fill:'forwards'});
  const hostIn=host.animate([{opacity:0},{opacity:1}],{duration:reduce?120:320,fill:'backwards'});
  const finish=()=>{screen.classList.add('clu-hidebody');bodyOut.cancel();CL.anim=false;render()};
  if(tr&&!reduce){
    const fp=frontalPose(R,tr);camera.position.copy(fp.pos);camera.lookAt(fp.tgt);BLOOM=0;
    // 起点帧要先等 2D 淡出，再开始拉远；其余排从地面升起（按距离错开）
    ROWS3.forEach(o=>{if(o!==R){o.sinkT=1;o.fadeT=0}});
    setTimeout(()=>{ROWS3.slice().sort((a,b)=>Math.hypot(a.xc-R.xc,a.zc-R.zc)-Math.hypot(b.xc-R.xc,b.zc-R.zc)).forEach((o,n)=>{if(o!==R)setTimeout(()=>{o.sinkT=0;o.fadeT=1},120+n*70)})},300);
    fly={from:()=>({pos:fp.pos.clone(),tgt:fp.tgt.clone()}),to:()=>overviewPose(performance.now()),t0:performance.now()+300,dur:1600,bloom:[0,.75],done:finish};
  }else{BLOOM=.75;setTimeout(finish,reduce?140:420)}
}
function switchTo(i){
  closePop();
  if(i===CL.cur||CL.anim)return;
  const sp=PODS[i];if(sp.offline){toast(sp.name+' 离线，暂无法查看详情');return}
  CL.anim=true;
  const out=$('body').animate([{opacity:1},{opacity:0}],{duration:reduce?0:140,fill:'forwards',easing:'ease-in'});
  out.onfinish=()=>{setPod(i);resetDetail();CL.anim=false;if(window.__roomBooted)render();out.cancel();
    $('body').animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:reduce?0:260,easing:'ease-out'})};
}
root.querySelector('#clu-filter').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;CL.filter=b.dataset.f;renderBar();paintFilter()});

/* 构建期截图钩子：生成正面贴图用（产品运行时不调用） */
window.__cluCap=(i,mode)=>{CL.active=false;CL.anim=false;stop();screen.classList.remove('clu-show','clu-hidebody');setPod(i);resetDetail();
  const lbl={health:'故障',util:'负载',pwr:'能耗'}[mode];
  if(S.mode!==mode){const b=[...$('modeseg').querySelectorAll('button')].find(b=>b.textContent.trim()===lbl);b&&b.click()}else if(window.__roomBooted)render();return true};
window.__cluRect=()=>{$('stageInner').querySelectorAll('.root-fault-bubble').forEach(e=>e.remove());const r=rackRect();return {x:r.left,y:r.top,width:r.width,height:r.height}};

/* 性能：停留在机房视角时，隐藏的 2D 页面不再做 6 秒一次的指标重绘和动画刷新 */
{const ro=refreshLiveOverlays;refreshLiveOverlays=function(){if(CL.active&&!CL.anim)return;return ro.apply(this,arguments)};}

let SV=null;      // 最近一次 survey 结果
function stOf(i){return SV&&SV[i]?SV[i].st:null}
function podDot(i){const sp=PODS[i],st=stOf(i);if(sp.offline)return '#7a8088';if(S.mode==='health')return st&&st.faults?'#e7434a':'#2dc16f';return st?heat(S.mode==='pwr'?powerBand(st.npuW):st.util):'#2dc16f'}
function metric(i){const sp=PODS[i],st=stOf(i);if(sp.offline)return {t:'离线',e:false};
  if(S.mode==='health')return st.faults?{t:st.faults+' 项故障',e:true}:{t:'运行正常',e:false};
  if(S.mode==='util')return {t:'NPU '+st.util.toFixed(1)+'%',e:false};
  return {t:st.kw.toFixed(1)+' kW',e:false};}
function matches(i){const sp=PODS[i];const pl=parseLoc(CL.q);if(pl)return pl.i===i;
  if(CL.q&&!sp.name.toLowerCase().replace(/\s/g,'').includes(CL.q.toLowerCase().replace(/\s/g,''))&&!String(i+1).padStart(2,'0').includes(CL.q))return false;
  if(CL.filter==='fault')return !sp.offline&&stOf(i).faults>0;
  if(CL.filter==='off')return !!sp.offline;
  if(CL.filter==='high')return !sp.offline&&stOf(i).util>=60;
  if(CL.filter==='low')return !sp.offline&&stOf(i).util<30;
  return true;}

const CLU_HELP={
  '故障总数':'集群内全部在线超节点的故障总数之和；每个超节点按其首页「故障总数」同一口径统计。离线超节点不计入。',
  '超节点':'在线超节点数 / 集群超节点总数。离线超节点无法进入详情。',
  'NPU':'有故障的 NPU 卡数 / 在线超节点 NPU 总数；无故障时只显示总数。按器件计，同一张卡多条故障只计 1 张。',
  'CPU':'有故障的 CPU 数 / 在线超节点 CPU 总数；按单颗 CPU 计，不按刀片计。',
  '800G 光模块':'有故障的 800G 光模块数 / 在线超节点光模块总数（L1 侧 + L2 侧）。',
  '计算柜':'在线超节点的计算柜总数，每个超节点 16 个。',
  'NPU 利用率':'在线超节点全部 NPU 利用率的平均值。',
  '满载卡数':'NPU 利用率 ≥ 90% 的卡数 / 在线超节点 NPU 总数。',
  'HBM 利用率':'在线超节点全部 NPU 的 HBM 利用率平均值。',
  'CPU 利用率':'在线超节点全部 CPU 刀片利用率的平均值。',
  '低负载超节点':'NPU 平均利用率 < 30% 的在线超节点数 / 在线超节点数。',
  '集群功率':'在线超节点计算柜与互联柜的实时功率之和。',
  '超节点平均功率':'集群功率 / 在线超节点数。',
  '最高超节点功率':'实时功率最高的在线超节点的功率。',
  '互联柜功率':'在线超节点全部互联柜的实时功率之和。'
};
function kpiCard(label,val,unit,err,like){
  const all=[...$('kpis').querySelectorAll('.kpi')];
  const nm=k=>{const c=k.querySelector('.k').cloneNode(true);c.querySelectorAll('.core-metric-help').forEach(x=>x.remove());return c.textContent.trim()};
  const src=all.find(k=>nm(k)===like)||all.find(k=>nm(k)===label)||all[0];
  const d=document.createElement('div');d.className='kpi';
  if(src){d.innerHTML=src.innerHTML;const k=d.querySelector('.k');k.querySelectorAll('.core-metric-help').forEach(x=>x.remove());[...k.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});k.append(label)}
  else d.innerHTML='<div class="k">'+label+'</div><div class="v"></div>';
  // 问号说明：与全量设计稿同一组件，内容换成集群口径
  const k=d.querySelector('.k'),b=document.createElement('button');b.type='button';b.className='core-metric-help';b.setAttribute('aria-label',label+'说明');b.textContent='?';
  const tip=document.createElement('span');tip.className='core-help-text';tip.setAttribute('role','tooltip');tip.textContent=CLU_HELP[label]||('集群内全部在线超节点的'+label+'。');b.append(tip);b.onclick=e=>e.stopPropagation();k.append(b);
  const v=d.querySelector('.v');v.removeAttribute('style');
  v.innerHTML=(err?`<span style="color:var(--err)">${val}</span>`:val)+(unit?`<small>${unit}</small>`:'');
  return d;
}
function renderKpis(){
  const box=root.querySelector('#clu-kpis');const on=PODS.filter(p=>!p.offline).map(p=>stOf(p.i));
  const nOn=on.length,cards=nOn*1024;
  const first=document.createElement('div');first.className='clu-first';
  first.innerHTML=`<strong>上海推理模型B5集群</strong><input type="search" placeholder="定位柜位，如 A-03 / 超节点 03" value="${esc(CL.q)}">`;
  const inp=first.querySelector('input');inp.oninput=()=>{CL.q=inp.value.trim();if(!CL.q)unlocate();paintFilter()};
  inp.onkeydown=e=>{if(e.key==='Enter'){if(!locate(inp.value))toast('没有找到「'+inp.value+'」，柜位编码如 A-03');}if(e.key==='Escape'){inp.value='';CL.q='';unlocate();paintFilter()}};
  const ic=n=>null;
  const sum=f=>on.reduce((a,s)=>a+f(s),0),avg=f=>nOn?sum(f)/nOn:0;
  let list=[];
  if(S.mode==='health'){
    const f=sum(s=>s.faults);
    list=[['故障总数',String(f),' 项',f>0,'故障总数'],
      ['超节点',String(nOn),' / '+N+' 在线',nOn<N,'计算柜'],
      ['NPU',sum(s=>s.npuBad)?String(sum(s=>s.npuBad)):String(cards),sum(s=>s.npuBad)?' / '+cards:'',sum(s=>s.npuBad)>0,'NPU'],
      ['CPU',sum(s=>s.cpuBad)?String(sum(s=>s.cpuBad)):String(nOn*256),sum(s=>s.cpuBad)?' / '+nOn*256:'',sum(s=>s.cpuBad)>0,'CPU'],
      ['800G 光模块',sum(s=>s.om)?String(sum(s=>s.om)):String(nOn*OM_ALL),sum(s=>s.om)?' / '+nOn*OM_ALL:'',sum(s=>s.om)>0,'800G 光模块'],
      ['计算柜',String(nOn*16),' 个',false,'计算柜']];
  }else if(S.mode==='util'){
    const lows=on.filter(s=>s.util<30).length;
    list=[['NPU 利用率',avg(s=>s.util).toFixed(1),' %',false,'NPU 利用率'],
      ['满载卡数',String(sum(s=>s.full)),' / '+cards,false,'满载卡数'],
      ['HBM 利用率',avg(s=>s.hbm).toFixed(1),' %',false,'HBM 利用率'],
      ['CPU 利用率',avg(s=>s.cpu).toFixed(1),' %',false,'CPU 利用率'],
      ['低负载超节点',String(lows),' / '+nOn,false,'满载卡数']];
  }else{
    const top=on.slice().sort((a,b)=>b.kw-a.kw)[0];
    list=[['集群功率',sum(s=>s.kw).toFixed(1),' kW',false,'设备功率'],
      ['超节点平均功率',avg(s=>s.kw).toFixed(1),' kW',false,'平均功率'],
      ['最高超节点功率',top?top.kw.toFixed(1):'—',' kW',false,'峰值功率'],
      ['互联柜功率',sum(s=>s.netkw).toFixed(1),' kW',false,'设备功率']];
  }
  box.replaceChildren(first,...list.map(([k,v,u,e,i])=>kpiCard(k,v,u,e,i)));
}
function renderBar(){
  const nOn=PODS.filter(p=>!p.offline).length;
  root.querySelector('#clu-bar .t').innerHTML=`超节点<small>${N} 个 · ${nOn} 在线 · ${(N*1024).toLocaleString()} 卡</small>`;
  const cnt=f=>PODS.filter(p=>{const s=CL.filter;CL.filter=f;const m=matches(p.i);CL.filter=s;return m}).length;
  const qq=CL.q;CL.q='';
  const opts=S.mode==='health'?[['all','全部'],['fault','有故障'],['off','离线']]:S.mode==='util'?[['all','全部'],['high','高负载'],['low','低负载'],['off','离线']]:[['all','全部'],['off','离线']];
  if(!opts.some(o=>o[0]===CL.filter))CL.filter='all';
  root.querySelector('#clu-filter').innerHTML=opts.map(([k,t])=>`<button type="button" data-f="${k}" class="${CL.filter===k?'on':''}">${t}<b>${cnt(k)}</b></button>`).join('');
  CL.q=qq;
}
function renderLegend(){
  const legend=root.querySelector('#clu-legend');
  legend.innerHTML='<div class="g"><span class="h">设备状态</span>'+[['fault','故障','#e7434a'],['normal','正常','#2bc68b']].map(([key,label,color])=>`<label class="device-state-option"><input type="checkbox" data-state="${key}" ${deviceStatusSelection[key]?'checked':''}><i style="background:${color}"></i>${label}</label>`).join('')+'</div>';
  legend.onchange=e=>{const key=e.target.dataset.state;if(!key)return;deviceStatusSelection[key]=e.target.checked;parent.postMessage({type:'ccae-device-filter',selection:{...deviceStatusSelection}},'*');closeFpop(true);setRiskOpen(false);ROWS3.forEach(paintRow);placeLabels();};
}
function syncTitle(){
  title.classList.toggle('in',!CL.active);
  const sp=PODS[CL.cur];title.querySelector('.nm').textContent=sp.name;
  // 全量设计稿的「集群总览 | 资源视图」页签：集群总览 = 3D 机房
  const tabs=document.querySelectorAll('.core-page-tabs button');
  if(tabs.length>1){tabs[0].setAttribute('aria-selected',String(CL.active));tabs[1].setAttribute('aria-selected',String(!CL.active));tabs[0].title='集群总览（3D 机房）'}
  document.querySelectorAll('.core-node-select .core-node-label').forEach(l=>{if(l.textContent!==sp.name)l.textContent=sp.name});
}
/* 详情里所有写着「超节点 (1024卡)」的地方带上编号 */
function renamePod(){
  if(CL.active)return;const nm=PODS[CL.cur].name;
  const w=document.createTreeWalker($('screen'),NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){if(n.parentElement.closest('#clu,#clu-title,#clu-pop,#clu-labels'))continue;
    const v=n.nodeValue;if(!v.includes('超节点'))continue;
    const nv=v.replace(/超节点-1024(?!-\d)/g,nm).replace('超节点 (1024卡)',nm+' (1024卡)');if(nv!==v)n.nodeValue=nv;}
  document.querySelectorAll('.core-node-select .core-node-label').forEach(l=>{if(l.textContent!==nm)l.textContent=nm});
}
/* ---------- 切换器 ---------- */
function rectD(el){const r=el.getBoundingClientRect(),s=$('screen').getBoundingClientRect();return {x:(r.left-s.left)/SCALE,y:(r.top-s.top)/SCALE,w:r.width/SCALE,h:r.height/SCALE}}
function openPop(anchor){
  if(!SV)SV=survey();
  const inp=pop.querySelector('input');inp.value='';fillPop('');pop.classList.add('on');pop._anchor=anchor||null;
  const a=anchor||title.querySelector('.pod'),r=rectD(a);pop.style.left=r.x+'px';pop.style.top=(r.y+r.h+12)+'px';
  setTimeout(()=>inp.focus(),0);
}
function closePop(){pop.classList.remove('on');title.querySelector('.pod').classList.remove('open')}
function fillPop(q){
  const k=q.toLowerCase().replace(/\s/g,'');
  pop.querySelector('.ls').innerHTML=PODS.filter(sp=>!k||sp.name.toLowerCase().replace(/\s/g,'').includes(k)||pad2(sp.i+1).includes(k)).map(sp=>{
    const m=metric(sp.i);
    return `<div class="it${sp.i===CL.cur?' cur':''}${sp.offline?' off':''}" data-i="${sp.i}" role="option" aria-selected="${sp.i===CL.cur}"><span class="dot" style="width:14px;height:14px;border-radius:50%;background:${podDot(sp.i)}"></span>${sp.name}${sp.i===CL.cur?' <span style="font-size:20px;color:#8fb2ff">当前</span>':''}<span class="m${m.e?' e':''}">${m.t}</span></div>`}).join('')||'<div class="it off">没有匹配的超节点</div>';
}
pop.querySelector('input').oninput=e=>fillPop(e.target.value);
pop.querySelector('input').onkeydown=e=>{if(e.key==='Escape')closePop();if(e.key==='Enter'){const f=pop.querySelector('.it:not(.off)');if(f)switchTo(+f.dataset.i)}};
pop.querySelector('.ls').onclick=e=>{const it=e.target.closest('.it');if(it&&!it.classList.contains('off'))switchTo(+it.dataset.i)};
pop.querySelector('.ft').onclick=()=>{closePop();leave()};
document.addEventListener('pointerdown',e=>{if(pop.classList.contains('on')&&!e.target.closest('#clu-pop,#clu-title .pod,.core-node-select'))closePop()},true);
/* 接管全量设计稿已有的两个入口：超节点选择器 → 本页超节点列表；「集群总览 | 资源视图」页签 → 3D 机房 / 当前超节点 */
document.addEventListener('click',e=>{
  const sel=e.target.closest&&e.target.closest('.core-node-select');
  if(sel){e.stopPropagation();e.preventDefault();if(pop.classList.contains('on')&&pop._anchor===sel)closePop();else openPop(sel);return}
  const tab=e.target.closest&&e.target.closest('.core-page-tabs button');
  if(tab){const idx=[...tab.parentElement.querySelectorAll('button')].indexOf(tab);
    if(idx===0){e.stopPropagation();e.preventDefault();if(!CL.active)leave();return}
    if(idx===1&&CL.active){e.stopPropagation();e.preventDefault();enter(CL.last!=null?CL.last:CL.cur);return}}
},true);
document.addEventListener('keydown',e=>{const sel=e.target.closest&&e.target.closest('.core-node-select');if(sel&&['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.stopPropagation();e.preventDefault();openPop(sel)}},true);

title.querySelector('.back').onclick=leave;
title.querySelector('.home').onclick=()=>{if(!CL.active)leave()};
title.querySelector('.pod').onclick=()=>pop.classList.contains('on')?closePop():openPop();

let rnq=0;new MutationObserver(()=>{if(CL.active||rnq)return;rnq=requestAnimationFrame(()=>{rnq=0;renamePod()})}).observe(screen,{subtree:true,childList:true,characterData:true});
addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='ccae-story-state')return;const next=e.data.state||{},changed=['optical','qwen','thermal'].some(k=>next[k]!==sharedStory[k]);sharedStory=next;if(!changed||!roomVisible)return;closeFpop(true);if(window.__roomBooted){renderCluster();if(linkedHover)requestAnimationFrame(()=>showLinkedHover(linkedHover));}});
let linkedHover=null;
function showLinkedHover(data){
 const keys=data?.keys||(data?.key?[data.key]:[]);
 labels.querySelectorAll('.room-linked-target').forEach(n=>n.classList.remove('room-linked-target'));
 const risk=keys.some(k=>k.startsWith('cabinetD08-'));
 roomPendingRisks.classList.toggle('room-linked-target',risk);setRiskOpen(risk);
 roomPendingRisks.querySelectorAll('.room-risk-row').forEach((row,i)=>row.classList.toggle('room-linked-target',keys.includes('cabinetD08-'+i)));
 if(!keys.length){closeFpop(true);return;}
 const bubble=[...labels.querySelectorAll('.clu-fb')].find(el=>el._cl?.faults.some(f=>keys.includes(f.key)));
 if(!bubble){closeFpop(true);return;}
 bubble.classList.add('room-linked-target');
 if(!CL.anim){const R=ROWS3[+bubble.parentElement.dataset.i],faults=bubble._cl.faults.filter(f=>keys.includes(f.key));clearTimeout(fpopTimer);if(fpop.style.display!=='block'||JSON.stringify(fpop._list?.map(f=>f.key))!==JSON.stringify(faults.map(f=>f.key)))openFpop(R,{...bubble._cl,faults});}
}
addEventListener('message',ev=>{if(ev.source!==parent||ev.data?.type!=='ccae-room-hover')return;linkedHover=ev.data;showLinkedHover(linkedHover)});
function roomEventKeys(target){
 const row=target?.closest?.('.room-risk-row');if(row)return ['cabinetD08-'+[...roomPendingRisks.querySelectorAll('.room-risk-row')].indexOf(row)];
 if(target?.closest?.('.room-pending-risks'))return ['cabinetD08-0','cabinetD08-1'];
 const pill=target?.closest?.('[data-linked-event]');if(pill)return [pill.dataset.linkedEvent];
 const bubble=target?.closest?.('.clu-fb');if(bubble?._cl)return bubble._cl.faults.map(f=>f.key);
 return [];
}
for(const [enter,leave] of [['pointerover','pointerout'],['focusin','focusout']]){
 document.addEventListener(enter,e=>{const keys=roomEventKeys(e.target);parent.postMessage({type:'ccae-room-object-hover',keys},'*')});
 document.addEventListener(leave,e=>{if(roomEventKeys(e.target).length)parent.postMessage({type:'ccae-room-object-hover',keys:roomEventKeys(e.relatedTarget)},'*')});
}

parent.postMessage({type:'ccae-room-ready'},'*');
const tools=document.createElement('div');tools.id='room-tools';
const icon=paths=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';
const commands=[['reset','恢复默认视角','<path d="M20 7v5h-5M20 12a8 8 0 1 0-2 5"/>'],['map','缩略图','<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-6 4 4 3-3 6 7"/>'],['pan','拖拽平移','<path d="M12 3v18M3 12h18m-12-6 3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3"/>'],['rotate','旋转视角','<ellipse cx="12" cy="12" rx="9" ry="5"/><path d="m17 5 4 5-6 1M12 3v4m0 10v4"/>']];
commands.push(['fullscreen','全屏视图','<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'],['zoom-in','放大','<path d="M12 4v16M4 12h16"/>'],['zoom-out','缩小','<path d="M4 12h16"/>']);
commands.forEach(([key,label,paths])=>{const button=document.createElement('button');button.type='button';button.dataset.action=key;button.title=label;button.setAttribute('aria-label',label);if(key==='pan'||key==='rotate')button.setAttribute('aria-pressed',String(key==='rotate'));if(key==='map')button.setAttribute('aria-expanded','false');button.innerHTML=icon(paths);tools.append(button)});screen.append(tools);
const zoomLabel=document.createElement('output');zoomLabel.id='room-zoom';tools.append(zoomLabel);setInterval(()=>{const value=Math.round(100/CAM.distT)+'%';if(zoomLabel.textContent!==value)zoomLabel.textContent=value},150);
const heading=document.createElement('form');heading.id='room-heading';heading.innerHTML='<h2>上海推理模型B5集群</h2><div id="room-cluster-stats"></div><label>'+icon('<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>')+'<input aria-label="定位柜位" placeholder="定位柜位，如 A-03 / 超节点 A" autocomplete="off"></label><span role="status"></span>';screen.append(heading);heading.querySelector('#room-cluster-stats').textContent='超节点 '+PODS.length+'　　NPU卡 '+(PODS.length*1024);heading.onsubmit=ev=>{ev.preventDefault();const q=heading.querySelector('input').value.trim();heading.querySelector('[role=status]').textContent=q&&!locate(q)?'未找到对应柜位':'';if(!q)unlocate()};addEventListener('message',ev=>{if(ev.source!==parent||ev.data?.type!=='ccae-room-locate')return;heading.querySelector('input').value=ev.data.query||'';heading.requestSubmit()});heading.querySelector('input').oninput=()=>{heading.querySelector('[role=status]').textContent=''};
const mini=document.createElement('div');mini.id='room-minimap';mini.hidden=true;mini.innerHTML='<strong>机柜总览</strong><div>'+PODS.map(sp=>'<button type="button" data-pod="'+sp.i+'" aria-label="定位 '+sp.name+'">'+sp.name+'</button>').join('')+'</div>';screen.append(mini);
function resetRoom(){LOC=null;FOCT.copy(T0);CAM.yawT=-.3;CAM.pitchT=.6;CAM.distT=1;ROWS3.forEach(paintRow)}
tools.onclick=e=>{const button=e.target.closest('button');if(!button)return;const key=button.dataset.action;if(key==='reset')resetRoom();if(key==='zoom-in')CAM.distT=Math.max(.45,CAM.distT/1.15);if(key==='zoom-out')CAM.distT=Math.min(1.35,CAM.distT*1.15);if(key==='fullscreen')parent.postMessage({type:'ccae-room-fullscreen'},'*');if(key==='map'){mini.hidden=!mini.hidden;button.setAttribute('aria-expanded',String(!mini.hidden))}if(key==='pan'||key==='rotate'){interactionMode=key;tools.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));host.style.cursor=key==='pan'?'move':'grab'}};
mini.onclick=e=>{const button=e.target.closest('[data-pod]');if(!button)return;const row=ROWS3[+button.dataset.pod];FOCT.set(row.xc,H*.35,row.zc);CAM.distT=.65;mini.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button))};
/* ---------- 启动 ---------- */
snap();
if(N===1)CL.active=false;
window.__roomBooted=true;render();
if(CL.active){
  requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(typeof rackPlayback==='function'&&rackPlayback)rackPlayback();document.documentElement.classList.remove('ccae-booting');resize()})));
}
})();
