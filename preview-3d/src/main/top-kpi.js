/* ================== 顶部 KPI ================== */
/* 全量遍历设备树，统计隐患（warn）与故障（err） */
function healthCount(){
  let warn=0,err=0;
  const t=o=>{if(!o||!o.status)return; if(o.status==='err')err++; else if(o.status==='warn')warn++};
  D.pods.forEach(p=>{t(p.mgmt);t(p.pwr);p.io.forEach(t);
    p.cpu.forEach(b=>{t(b);(b.cpus||[]).forEach(t)});
    p.sw.forEach(b=>{t(b);(b.chipList||[]).forEach(t)});
    p.npu.forEach(b=>{t(b);b.cards.forEach(t)});});
  D.nets.forEach(n=>{t(n.pwr);n.dev.forEach(d=>{t(d);(d.chipList||[]).forEach(t)})});
  D.pods.forEach(p=>p.sw.forEach(sw=>{for(let i=0;i<32;i++)if(omBad(sw,i))err++}));  // 光模块中断
  return {warn,err};
}
const avgOf=f=>{let s=0,n=0;D.pods.forEach(p=>p.npu.forEach(b=>b.cards.forEach(k=>{s+=f(k);n++})));return s/n};
const allCards=()=>D.pods.flatMap(p=>p.npu.flatMap(b=>b.cards));
const badOf=sel=>D.pods.reduce((a,p)=>a+sel(p).filter(o=>o.status!=='ok').length,0);
/* 顶部指标跟随叠加图层切换 —— 选了哪个图层，就看那个图层的数
   有故障 → 「1 / 128」，只把 1 染红；没故障 → 直接写「128」，不写 0/128 */
const fq=(bad,tot)=>bad?[String(bad),' / '+tot,true]:[String(tot),'',false];
/* ⭐ v3.30.5（评审意见 2）：800G 光模块的全场口径 = **L1 侧 + L2 侧**。
   L1 侧 64 块 SFU × 32 = 2048（就是屏上背面数得出来的那些 LPO）；
   L2 侧 16 台灵衢互联设备 × 32 = 512。合计 2560。
   ⚠ 名字要带速率：这套系统里还有 400G 的口（ 的 128 端口），
     不带速率的「光模块」在指标行里指代不清。 */
const OM_L1=64*32, OM_L2=16*32, OM_ALL=4096;
const KPISETS={
 health:[
  /* ⭐ v3.26.1 修：这一格原来读 healthCount()，而 healthCount() 把**容器也数了一遍** ——
     一张坏卡连它所在的那块刀片一起算两项。于是 v3.25 屏上是：
     顶部「故障总数 **9** 项」，翻转角标却写「正面 3 / 背面 3」，故障清单也是 6 条 ——
     观众把 3+3 一加就当场对不上（同原则 ⑦ 与 faceFaults 的口径：**数屏上看得见的红点**，
     容器红是因为里面有东西，不重复计数）。
     现在直接复用 faceFaults 两面之和，全场只有一套计数规则。
     ⚠ healthCount() 就此**再无调用方**，留着是因为它顺带在数 err/warn 分级；清理时一并删。 */
  {k:'故障总数',cls:'e',get:()=>[String(faceFaults('front')+faceFaults('back')),' 项',true]},
  {k:'NPU',cls:'e',get:()=>fq(allCards().filter(k=>k.status!=='ok').length,1024)},
  {k:'CPU',cls:'e',get:()=>fq(badOf(p=>p.cpu)*2,256)},
  {k:'互联芯片',cls:'e',get:()=>fq(D.nets.reduce((a,n)=>a+n.dev.reduce((b,d)=>b+(d.chipList||[]).filter(c=>c.status!=='ok').length,0),0),32)},
  {k:'800G 光模块',cls:'e',get:()=>{let n=0;D.pods.forEach(p=>p.sw.forEach(sw=>{for(let i=0;i<32;i++)if(omBad(sw,i))n++}));return fq(n,OM_ALL)}},
  {k:'灵衢互联刀片',cls:'e',get:()=>fq(badOf(p=>p.sw),64)},
  {k:'RoCE板',cls:'e',get:()=>fq(badOf(p=>p.io),32)}
 ],
 util:[
  {k:'NPU 利用率',cls:'b',get:()=>[avgOf(k=>k.util).toFixed(1),'%']},
  {k:'满载卡数',cls:'w',get:()=>[String(allCards().filter(k=>k.util>=90).length),' / 1024']},
  {k:'HBM 利用率',cls:'b',get:()=>[avgOf(k=>k.hbm).toFixed(1),'%']},
  {k:'CPU 利用率',cls:'b',get:()=>[(D.pods.reduce((a,p)=>a+p.cpu.reduce((x,b)=>x+b.util,0),0)/128).toFixed(1),'%']},
  /* L1(灵衢互联刀片) ↔ L2(灵衢互联设备) 的 64 条上行链路，是超节点唯一的跨柜带宽口径 */
  {k:'灵衢 L1–L2 带宽',cls:'b',get:()=>{const l=LINKS.filter(x=>x.status==='ok');
    return [(l.reduce((a,x)=>a+x.bw,0)/l.length).toFixed(1),'%']}}
 ],
 pwr:[
  {k:'集群能耗',get:()=>[rr(548,552).toFixed(1),'kW']},
  {k:'NPU 功耗',cls:'b',get:()=>[(allCards().reduce((a,k)=>a+k.pwr,0)/1000).toFixed(1),'kW']},
  {k:'单卡均功耗',cls:'b',get:()=>[String(Math.round(allCards().reduce((a,k)=>a+k.pwr,0)/1024)),'W']},
  {k:'峰值单卡',cls:'w',get:()=>[String(Math.max(...allCards().map(k=>k.pwr))),'W']},
  {k:'互联柜能耗',get:()=>[D.nets.reduce((a,n)=>a+n.pwr.kw,0).toFixed(1),'kW']}
 ]
};

/* ================== 指标作用域（跟着下钻走） ==================
   规则：指标永远描述「你正在看的这一层」——
       集群 → 机柜 → 刀片 → 卡 → 芯片，每深一层就换一套。
   规则二：每一层再按当前图层（故障 / 负载 / 能耗）换一套，
       与器件着色同源 —— 讲解时指标和颜色永远说的是同一件事。
   没有该层度量的项目宁可写「无独立计量」也不编数字（原则 6）。 */

const K=(k,v,s,e)=>({k,v:v==null?'—':String(v),s:v==null?'':(s||''),e:!!e});
const KT=(k,v,s)=>({k,v:v==null?'—':String(v),s:s||'',e:false,txt:true});
const avgN=(a,f)=>a.length?a.reduce((x,y)=>x+f(y),0)/a.length:0;
const maxN=(a,f)=>a.length?Math.max.apply(null,a.map(f)):0;
const r1=v=>(Math.round(v*10)/10).toFixed(1);
const stTxt=o=>!o?'—':(o.status&&o.status!=='ok')?(o.status==='err'?'故障':'故障'):'正常';
const stBad=o=>!!(o&&o.status&&o.status!=='ok');

function scopeOf(){
  const v=S.view;
  if(v.lv==='logic'){const b=bizOf(S.logic);
    return {k:'biz',o:b,nm:(b?b.name:'')+' · 逻辑视图'}}
  if(v.lv==='cluster'){
    if(S.zoom){const o=findPod(S.zoom)||findNet(S.zoom); if(o)return{k:o.kind,o,nm:o.name}}
    /* ⭐ 业务视角选中服务后，物理视图问的也是「这个服务」，指标必须跟着收窄：
       标题写 DeepSeek-R1、屏上只留它自己那一处红，指标却报「故障总数 6 项」，三者互相打架。
       biz 作用域的那一套指标（服务状态 / 关联故障 / 受影响节点）DIMS.health 里早就写好了，
       之前只有逻辑视图能走到。 */
    if(S.biz){const b=bizOf(S.biz); if(b)return {k:'biz',o:b,nm:b.name+' · 物理视图'}}
    return {k:'cluster',o:null,nm:'超节点 (1024卡) · 全集群'};
  }
  let o=null; try{o=findObj(v.t,v.id,v)}catch(e){}
  const NM={npublade:'NPU 板',cpublade:'CPU 板',swblade:'灵衢互联刀片',ioblade:'RoCE板',
    mgmtblade:'灵衢管理刀片',pwrbox:'电源框',netdev:'灵衢互联设备',npu:'NPU',
    cpucard:'CPU',uchip:'Union 互联芯片',ichip:'灵衢 L2 互联芯片',udie:'Udie'};
  const pre=v.pod?(findPod(v.pod)||{}).name:(v.cab?(findNet(v.cab)||{}).name:'');
  const own=(o&&o.name)||(NM[v.t]||'')||v.id;
  return {k:v.t,o,nm:(pre?pre+' · ':'')+own};
}

/* ── 作用域的「覆盖面」 ──────────────────────────────────────
   指标维度在所有层级恒定，变的只是数据。所以每个作用域都要按**真实拓扑**
   解析出它关联到的器件集合，而不是把上一层的数字硬套下来：
     · NPU 计算刀片 的 CPU  = 同槽位配对的那块 CPU 计算刀片
     · NPU / 刀片 的 SFU = 本柜 4 根（它的流量确实要过这 4 根）
     · 灵衢互联刀片 的 NPU  = 它下挂的整柜 64 张卡
     · 互联柜 / 互联设备的 NPU = 它承载流量的那些计算柜（= 全集群）
   讲解时说清楚「这是它服务范围内的数」即可。 */
function coverOf(sc){
  const v=S.view, o=sc.o, AP=D.pods, AN=D.nets;
  const P=v.pod?findPod(v.pod):null, N=v.cab?findNet(v.cab):null;
  const cardsOfPods=ps=>ps.flatMap(p=>p.npu.flatMap(b=>b.cards));
  /* pods/nets 是「器件统计范围」（含服务关系），kwOf 是「能耗归属范围」（只含实体机柜） */
  const B=x=>Object.assign({pods:[],nets:[],npu:[],cpu:[],sw:[],io:[],dev:[],links:[],kwOf:[]},x);
  const FULL=()=>B({pods:AP,nets:AN,npu:cardsOfPods(AP),cpu:AP.flatMap(p=>p.cpu),
    sw:AP.flatMap(p=>p.sw),io:AP.flatMap(p=>p.io),dev:AN.flatMap(n=>n.dev),links:LINKS.slice(),
    kwOf:AP.concat(AN)});
  /* 计算柜：柜内器件 + 它上联的全部 L2（4 根 SFU 分别接 4 个互联柜的 4 台） */
  const POD=p=>B({pods:[p],nets:AN,npu:cardsOfPods([p]),cpu:p.cpu,sw:p.sw,io:p.io,
    dev:AN.flatMap(n=>n.dev),links:LINKS.filter(l=>l.from===p.id),kwOf:[p]});
  /* 互联柜：柜内 4 台设备 + 它承载的 16 个计算柜（每柜第 k 根 SFU） */
  const NET=n=>B({pods:AP,nets:[n],npu:cardsOfPods(AP),cpu:AP.flatMap(p=>p.cpu),
    sw:AP.map(p=>p.sw[n.idx]),io:AP.flatMap(p=>p.io),dev:n.dev,links:LINKS.filter(l=>l.to===n.id),
    kwOf:[n]});
  const inPod=(x)=>Object.assign(POD(P),x);
  /* 业务作用域：这个服务的节点（NPU 刀片 + 配对 CPU 刀片）+ 它们所在柜的互联 */
  const BIZSC=b=>{const nds=bizNodes(b.id), ps=bizPods(b.id);
    return B({pods:ps, nets:AN, npu:nds.flatMap(n=>n.npu.cards), cpu:nds.map(n=>n.cpu),
      sw:ps.flatMap(p=>p.sw), io:ps.flatMap(p=>p.io), dev:AN.flatMap(n=>n.dev),
      links:LINKS.filter(l=>ps.some(p=>p.id===l.from)), kwOf:ps})};
  switch(sc.k){
    case 'biz':     return o?BIZSC(o):FULL();
    case 'cluster': return FULL();
    case 'pod':     return POD(o);
    case 'netcab':  return NET(o);
    case 'npublade':return inPod({npu:o.cards, cpu:P.cpu[o.idx]?[P.cpu[o.idx]]:P.cpu});
    case 'npu':    {const b=P.npu.find(x=>x.id===(v.blade||o.blade));
                    return inPod({npu:[o], cpu:b&&P.cpu[b.idx]?[P.cpu[b.idx]]:P.cpu})}
    case 'udie':   {const b=P&&P.npu.find(x=>x.id===v.blade), k=b&&b.cards.find(x=>x.id===v.card);
                    return k?inPod({npu:[k],cpu:P.cpu[b.idx]?[P.cpu[b.idx]]:P.cpu}):(P?POD(P):FULL())}
    case 'cpublade':return inPod({cpu:[o], npu:P.npu[o.idx]?P.npu[o.idx].cards:cardsOfPods([P])});
    case 'cpucard':
    case 'cpu':    {const b=P.cpu.find(x=>x.id===v.blade)||P.cpu[0];
                    return inPod({cpu:[b], npu:P.npu[b.idx]?P.npu[b.idx].cards:cardsOfPods([P])})}
    case 'swblade': return inPod({sw:[o], nets:[AN[o.idx]], dev:AN[o.idx].dev,
                      links:LINKS.filter(l=>l.from===P.id&&l.swIdx===o.idx)});
    case 'uchip':  {const b=P.sw.find(x=>x.id===v.blade)||P.sw[0];
                    return inPod({sw:[b], nets:[AN[b.idx]], dev:AN[b.idx].dev,
                      links:LINKS.filter(l=>l.from===P.id&&l.swIdx===b.idx)})}
    case 'netdev':  return Object.assign(NET(N),{dev:[o]});
    case 'ichip':  {const d=N.dev.find(x=>x.id===v.dev)||N.dev[0];
                    return Object.assign(NET(N),{dev:[d]})}
    case 'ioblade': return inPod({io:[o]});
    case 'mgmtblade':
    case 'pwrbox':  return N?NET(N):(P?POD(P):FULL());
  }
  return P?POD(P):(N?NET(N):FULL());
}

/* ── 页面清单 pageOf(sc)：这一页**画出来**的器件有哪些、各多少 ───────────────
   与 coverOf 的分工：
     · 故障图层 用 pageOf —— 指标就是这一屏的器件清单，页面变、清单变。
       所以 NPU 刀片页会出现「风扇 2 / 端口 144」，但不会出现根本没画的 RoCE板。
     · 负载 / 能耗 用 coverOf —— 那两层量的是「利用率 / 功耗」，维度必须恒定，
       靠拓扑服务范围补齐（见 coverOf 的注释）。
   ⚠️ 双向约束：清单里有的，画面上必须画出来。所以 NPU内视图把**未连接的那颗 CPU
   也画出来并置灰** —— 指标统计了它，画面就不能装作它不存在。 */
function pageOf(sc){
  const v=S.view, o=sc.o, AP=D.pods, AN=D.nets;
  const P=v.pod?findPod(v.pod):null, N=v.cab?findNet(v.cab):null;
  const cardsOf=ps=>ps.flatMap(p=>p.npu.flatMap(b=>b.cards));
  const B=x=>Object.assign({npu:[],cpu:[],sw:[],io:[],dev:[],om:0,uch:0,fans:0,ports:0,nodes:0,inst:0,biz:null},x);
  const POD=p=>B({npu:cardsOf([p]),cpu:p.cpu,sw:p.sw,io:p.io,om:p.sw.length*32});
  switch(sc.k){
    /* 业务作用域（逻辑视图，以及业务视角下选中服务的物理视图）：算的是这个业务自己的节点 ——
       N×8 与 C×2 两种芯片。逻辑视图里别的器件根本没画；物理视图里画了但已经压暗并屏蔽了故障，
       不属于这个业务的东西不进它的指标。底部物理定位带是同一批器件的另一种排布，不重复计数。 */
    case 'biz': {const nds=o?bizNodes(o.id):[];
      return B({npu:nds.flatMap(n=>n.npu.cards), cpu:nds.map(n=>n.cpu), nodes:nds.length,
        biz:o?o.id:null,
        inst:o?pdOf(o.id).reduce((a,g)=>a+(g.d.length?2:1),0):0})}
    /* 集群：20 个柜体全画出来 —— 正面 NPU/CPU/IO/管理/电源，背面 SFU 竖条（每根 32 个光模块口）+ 互联柜 */
    case 'cluster': return B({npu:cardsOf(AP),cpu:AP.flatMap(p=>p.cpu),sw:AP.flatMap(p=>p.sw),
      io:AP.flatMap(p=>p.io),dev:AN.flatMap(n=>n.dev),om:OM_ALL});
      /* 集群层不列风扇：正面每台 L2 确实画了 6 个圈（96 个），但集群层的故障指标
         v3.30 起是固定五项（NPU/CPU/光模块/计算柜/互联柜），不按页面器件展开 */
    case 'pod':     return POD(o);
    /* v3.30：风扇从「柜级一条文字色块」改成**设备级 6 个圆圈**（fanFace），
       于是它第一次变成「数得出来」的器件，可以进指标了：一柜 4 台 × 6 = 24 */
    case 'netcab':  return B({dev:o.dev,fans:S.face==='front'?o.dev.length*6:0});   // 风扇只画在正面，背面那一面就不列
    /* NPU 刀片页：上层 4 根 SFU（各 20 Union）+ 本板 8 卡 ×18 端口 + 风扇 ×2 + 下层配对 CPU 刀片 */
    case 'npublade':return B({npu:o.cards,cpu:P.cpu[o.idx]?[P.cpu[o.idx]]:[],sw:P.sw,
      uch:P.sw.length*20,fans:2,ports:o.cards.length*18});
    /* NPU内页：上层 4 根 SFU + 本板这张卡 18 端口 + 7 张兄弟卡 + 下层配对 CPU 刀片（2 颗，含置灰那颗）*/
    case 'npu':    {const b=P.npu.find(x=>x.id===(v.blade||o.blade))||P.npu[0];
      return B({npu:b.cards,cpu:P.cpu[b.idx]?[P.cpu[b.idx]]:[],sw:P.sw,uch:P.sw.length*20,ports:18})}
    case 'udie':   {const b=P&&P.npu.find(x=>x.id===v.blade);
      return b?B({npu:b.cards,cpu:P.cpu[b.idx]?[P.cpu[b.idx]]:[],sw:P.sw,uch:P.sw.length*20,ports:18}):(P?POD(P):B({}))}
    /* CPU 刀片页：上层配对 NPU 刀片 + 本板 2 CPU / 内存 / 硬盘 / 风扇 + 下层 IO 刀片 ×2 */
    case 'cpublade':return B({cpu:[o],npu:P.npu[o.idx]?P.npu[o.idx].cards:[],io:P.io,
      fans:o.fanCnt||6,ports:18});
    case 'cpucard':
    case 'cpu':    {const b=P.cpu.find(x=>x.id===v.blade)||P.cpu[0];
      return B({cpu:[b],npu:P.npu[b.idx]?P.npu[b.idx].cards:[],io:P.io,fans:b.fanCnt||6,ports:18})}
    /* 互联刀片页：上层 4 台 L2 + 本板 32 光模块 / 20 Union + 下游 8 块 NPU 刀片 */
    /* ⭐ v3.30.5：这两页新增了 IO 层，清单要跟着列 —— 「清单里有的画面上必须画出来」反过来也成立 */
    case 'swblade': return B({sw:[o],dev:(AN[o.idx]||AN[0]).dev,npu:cardsOf([P]),io:P.io,om:32,uch:20});
    case 'uchip':  {const b=P.sw.find(x=>x.id===v.blade)||P.sw[0];
      return B({sw:[b],dev:(AN[b.idx]||AN[0]).dev,npu:cardsOf([P]),io:P.io,om:32,uch:20})}
    case 'netdev':  return B({dev:[o],ports:(o.chipList||[]).length*128});   // 不列风扇：设备内视图画的是 2 颗 和端口，屏上没有风扇
    case 'ichip':  {const d=N.dev.find(x=>x.id===v.dev)||N.dev[0]; return B({dev:[d],ports:256})}
    case 'ioblade': return B({io:[o],npu:P.npu[o.idx]?P.npu[o.idx].cards:[],cpu:P.cpu[o.idx]?[P.cpu[o.idx]]:[],fans:6});
  }
  return P?POD(P):(N?B({dev:N.dev}):B({}));
}

/* ── 三个图层各一套固定维度，全部由 cover 算出来 ──────────────
   同一个指标名从集群一路跟到卡内，只是统计范围收窄。 */
const FQ=(k,bad,tot)=>{const a=fq(bad,tot);return {k,v:a[0],s:a[1],e:a[2]}};

/* ── 设备功率口径 ────────────────────────────────────────────
   统计窗：2026-08-15 00:00（+08）起，至 demo 时刻共 225.5 h。
   ⚠ RATED 是各类刀片 / 设备的额定功率（W），用来把只有百分比的器件折算成绝对瓦数 ——
     现在是估值，待架构师确认；NPU（pwr）与机柜（kw）有实测值，一律优先用实测。 */
const PWR_T0=1786723200000, PWR_T0_TXT='08-15 00:00:00', PWR_HOURS=225.5;
const RATED={npublade:3400,cpublade:800,swblade:1600,ioblade:600,netdev:2200,ichip:700,mgmtblade:120};
function hashOf(t){let h=0;for(let i=0;i<String(t).length;i++)h=(h*31+String(t).charCodeAt(i))>>>0;return h}
function devW(o){
  if(!o)return 0;
  if(typeof o.pwr==='number')return o.pwr;                                  // NPU：实测 W
  if(o.cards&&o.cards.length)return o.cards.reduce((a,k)=>a+k.pwr,0);  // NPU 刀片：卡合计
  if(o.kw!=null)return Math.round(o.kw*1000);                   // 机柜 / 电源框：实测 kW
  if(o.pwr&&o.pwr.kw!=null)return Math.round(o.pwr.kw*1000);
  if(o.pwrp!=null&&RATED[o.kind])return Math.round(o.pwrp/100*RATED[o.kind]);
  return 0;
}
/* 作用域自己的功率：机柜级用整柜实测，器件级用该器件（或它的叶子合计） */
function scopeW(sc,cv){
  const o=sc.o;
  if(sc.k==='cluster')return Math.round(cv.kwOf.reduce((a,x)=>a+x.pwr.kw,0)*1000);
  if(sc.k==='pod'||sc.k==='netcab')return Math.round(o.pwr.kw*1000);
  // Demo device-level values; avoid attributing the whole downstream NPU set to one chip.
  if(sc.k==='cpublade')return cpuDemoPower(o,0)+cpuDemoPower(o,1)+120;
  if(sc.k==='swblade')return o.chipList.reduce((sum,c)=>sum+35+hashOf(c.id)%16,0)+160;
  if(sc.k==='netdev')return l2DemoWatts(o.id);
  if(sc.k==='ichip')return Math.round(l2DemoWatts(S.view.dev||o.id.split('-C')[0])/2);
  if(sc.k==='uchip')return 35+hashOf(o.id)%16;
  if(sc.k==='udie')return Math.round((o.pwr||175));
  if(sc.k==='cpu'||sc.k==='cpucard')return cpuDemoPower(findPod(S.view.pod)?.cpu.find(b=>b.id===S.view.blade));
  const w=devW(o);
  if(w)return w;
  return Math.round(cv.npu.reduce((a,k)=>a+k.pwr,0));           // 兜底：作用域内 NPU合计
}
const fmtW=w=>w>=10000?[r1(w/1000),'kW']:[String(Math.round(w)),'W'];
const fmtKwh=v=>v>=10000?[r1(v/10000),'万 kWh']:[r1(v),'kWh'];
const livePowerHistory=new Map();
const DIMS={
 /* 故障图层 = 这一页的器件清单：只列画面上真有的类别（总数为 0 的不出现） */
 health:()=>{
   const sc=scopeOf();
   const pg=pageOf(sc);
   const ich=pg.dev.flatMap(d=>d.chipList||[]);
   let omb=0; pg.sw.forEach(sw=>{for(let i=0;i<32;i++)if(omBad(sw,i))omb++});
   const uc=pg.sw.flatMap(x=>x.chipList||[]);
   const nb=pg.npu.filter(k=>k.status!=='ok').length,
         cb=pg.cpu.filter(b=>b.status!=='ok').length,
         sb=pg.sw.filter(b=>b.status!=='ok').length,
         ib=pg.io.filter(b=>b.status!=='ok').length,
         vb=pg.dev.filter(d=>d.status!=='ok').length,
         ub=pg.uch?uc.filter(c=>c.status!=='ok').length:0,
         db=ich.filter(c=>c.status!=='ok').length;
   const tot=nb+cb*2+sb+ib+db+ub+omb;
   /* 业务作用域的故障口径 ≠ 器件口径：这一页画的是「服务」，它的健康度是 SLO，
      而根因往往在页面上根本没画的器件上（例如柜背的光模块）。所以首项写服务状态，
      再给一项「关联故障」把那条真实故障指出来 —— 顶部集群级的「故障总数 5」一点没动。 */
   if(pg.biz){
     const bz=bizOf(pg.biz), trn=!!bz&&bz.k==='trn', sl=bizSlo(pg.biz);
     /* 关联故障 = 本业务自己的器件故障数；一件都没有但 SLO 劣化时记 1
        （那种情况根因在这一页没画出来的器件上，例如柜背的光模块）。
        两者不叠加 —— 推理服务的 SLO 根因本来就是这些坏卡之一，加起来会把一件事数成两件。
        ⚠ 这里的 nb / cb 已经是**业务作用域**下的计数（scopeOf → BIZSC），
        所以它和屏上「过滤掉别的业务之后还看得见几处红」永远对得上。 */
     const hw=nb+cb*2, alarms=hw||(sl?1:0), deg=!!sl||hw>0;
     const aff = sl ? bizNodes(pg.biz).filter(n=>n.pod.id===sl.pod).length
                    : bizNodes(pg.biz).filter(n=>n.npu.cards.some(k=>k.status!=='ok')||n.cpu.status!=='ok').length;
     /* 训练任务没有 SLO，也没有 PD 实例（见 pdOf 上方的注释）—— 换成任务自己的口径 */
     return [ {k:trn?'任务状态':'服务状态', v:trn?(deg?'降级运行':'训练中'):(deg?'劣化':'正常'),
               s:'', txt:1, w:deg},
              Object.assign(K('关联故障', alarms, ' 项'),{w:alarms>0}),
              Object.assign(K('受影响节点', aff, ' 个'),{w:aff>0}),
              K('节点', pg.nodes, ' 个'),
              trn?K('训练进度', bz.prog, ' %'):K('PD 实例', pg.inst, ' 个'),
              FQ('NPU', nb, pg.npu.length) ];
   }
   /* ⭐⭐ v3.28 器件名口径（评审意见 2/3/4）：**指标条上必须一眼看出这是 L1 还是 L2**。
      原来写「灵衢互联刀片 64」和「互联芯片 32」，两个名字都没带层号，
      而且「互联芯片」在这套系统里是有歧义的 —— L1 刀片上的 Union 也是互联芯片。
      现在统一成一对对称的名字：

        灵衢互联刀片 64   ←→   灵衢 L2 互联设备 16     （板 / 设备级）
        Union 芯片 1280       ←→   灵衢 L2 互联芯片 32     （芯片级，）

      ⚠ 写法是「灵衢 + 层号 + 器件」，不是「L2 灵衢互联芯片」——
        全文的既有写法都是「灵衢」打头（灵衢L2-01 / 灵衢 L1–L2 带宽 / 灵衢互联刀片），
        层号插在中间才和它们一致（见第二节「灵衢前缀是硬要求」）。

      ⭐ 新增「灵衢 L2 互联设备」（回答评审第 4 问：L2 这一层要不要统计）——
        **要，而且不加就是不对称的**：原来 L1 侧数的是板（刀片 64），
        L2 侧数的却是芯片（ 32），两层各按不同粒度统计，观众没法对照。
        判据也满足「数得出来」：集群背面每个互联柜画了 4 个 netDevBox，
        各自标着「灵衢L2-01」，16 个数得出来（而 Union 在集群层根本没画，所以仍然不列）。

      ⛔ 删掉「RoCE 板」——**但只在它不是主角的层**。集群 / 机柜层的叙事主线是
        「算力（NPU/CPU）+ 灵衢互联（L1 刀片 / 光模块 / L2 设备 / L2 芯片）」，
        RoCE 是旁路的南北向 IO，不在这条线上，而且那两层它永远是全绿的 32 / 2，占一格什么都不说。
        但在 **RoCE 板自己那一页（ioblade）和它的上游 CPU 刀片页**，它就是主角，
        不列反而违反「清单里有的画面上必须画出来」的反向约束。 */
   const IOPAGE=['ioblade','cpublade','cpu','cpucard','swblade','uchip'].indexOf(sc.k)>=0;
   const rows=[K('故障总数',tot,' 项',tot>0)];
   /* ⭐⭐ v3.30 集群层单独一套（评审意见）：**NPU / CPU / 光模块 / 计算柜 / 互联柜**。
      理由不是「换几个数」，是集群层要回答的问题和下钻层不一样 ——
      下钻层问「这一页画了什么器件、坏了几个」，集群层问的是**这台机器有多大**。
      「计算柜 16 / 互联柜 4」是屏上最容易数、也最能说明规模的两个数，之前反而没列。
      ⚠ 顺带解决了一个一直存在的矛盾：灵衢 L1 刀片 / L2 设备 / L2 芯片这三项
        在**集群正面根本没画**（它们在背面和互联柜里），列在正面违反
        「清单里有的画面上必须画出来」。现在它们只在翻到背面、下钻、或聚焦互联柜时出现。
      ⚠ 「故障总数」保留 —— 故障图层没有这个头条数字就失去了这一层的意义。 */
   if(sc.k==='cluster'&&!pg.biz){
     rows.push(FQ('NPU',nb,pg.npu.length));
     rows.push(FQ('CPU',cb*2,pg.cpu.length*2));
     rows.push(FQ('800G 光模块',omb,pg.om));
     rows.push(K('计算柜',D.pods.length,' 个'));
     rows.push(K('互联柜',D.nets.length,' 个'));
     return rows;
   }
   if(pg.nodes)      rows.push(K('节点',pg.nodes,' 个'));
   if(pg.inst)       rows.push(K('PD 实例',pg.inst,' 个'));
   if(pg.npu.length) rows.push(FQ('NPU',nb,pg.npu.length));
   if(pg.cpu.length) rows.push(FQ('CPU',cb*2,pg.cpu.length*2));
   if(pg.sw.length)  rows.push(FQ('灵衢互联刀片',sb,pg.sw.length));
   if(pg.uch)        rows.push(FQ('Union 芯片',ub,pg.uch));
   if(pg.om)         rows.push(FQ('800G 光模块',omb,pg.om));
   if(pg.dev.length) rows.push(FQ('灵衢 L2 互联设备',vb,pg.dev.length));
   if(pg.dev.length) rows.push(FQ('灵衢 L2 互联芯片',db,ich.length));
   if(pg.io.length&&IOPAGE) rows.push(FQ('RoCE板',ib,pg.io.length));
   if(pg.fans)       rows.push(K('风扇',pg.fans,' 个'));
   if(pg.ports)      rows.push(K('端口',pg.ports,' 个'));
   return rows.slice(0,9)},
 util:cv=>{
   /* 中断的上行链路带宽计 0 并标红 —— 过滤掉会让「这根 SFU 上行断了」变成一个「—」 */
   const n=cv.npu, ls=cv.links, down=ls.some(l=>l.status!=='ok');
   return [K('NPU 利用率',n.length?r1(avgN(n,k=>k.util)):null,'%'),
     K('满载卡数',n.length?n.filter(k=>k.util>=90).length:null,n.length?' / '+n.length:''),
     K('HBM 利用率',n.length?r1(avgN(n,k=>k.hbm)):null,'%'),
     K('CPU 利用率',cv.cpu.length?r1(avgN(cv.cpu,b=>b.util)):null,'%'),
     K(S.view.t==='cpublade'?'灵衢 L0 带宽':S.view.t==='npublade'||S.view.t==='npu'?'灵衢 L0–L1 带宽':'灵衢 L1–L2 带宽',ls.length?r1(avgN(ls,l=>l.bw)):null,'%',down)]},
 /* 能耗五项 = 设备功率计量的标准口径（对齐真实遥测字段）：
      当前功率 / 统计窗内平均 / 统计窗内峰值 / 累计耗电量 / 统计起点。
    ⚠ 刀片类只有 pwrp（占额定百分比），没有绝对瓦数，所以用 RATED 里的额定值折算 ——
      那几个额定值是估的，待架构师确认（见待办）。NPU与机柜有实测值，优先用实测。 */
 pwr:(cv,sc)=>{
   const W=scopeW(sc,cv);
   const h=hashOf(sc.o&&sc.o.id||sc.k);
   const key=sc.o?.id||sc.k,now=performance.now();
   let history=livePowerHistory.get(key);
   if(!history){history={at:now,start:now,avg:W*(0.88+(h%9)/100),peak:W*(1.06+(h>>>3)%11/100),kwh:W*(0.88+(h%9)/100)/1000*PWR_HOURS};livePowerHistory.set(key,history)}
   const hours=(now-history.at)/3600000,total=PWR_HOURS+(now-history.start)/3600000;
   history.kwh+=W/1000*hours;history.avg=history.kwh*1000/total;history.peak=Math.max(history.peak,W);history.at=now;
   const avg=Math.round(history.avg),peak=Math.round(history.peak),kwh=history.kwh;
   return [K('设备功率',...fmtW(W)),
     K('平均功率',...fmtW(avg)),
     K('峰值功率',...fmtW(peak)),
     K('累计耗电量',...fmtKwh(kwh)),
     KT('功率统计开始时间',PWR_T0_TXT,'')]}
};
/* 逻辑视图的 KPI 恒定为**服务级指标**，不随图层变。
   理由：这一层回答的是「这个服务好不好」，不是「这些器件什么状态」。
   图层切换在这一层仍然改变节点着色（还能看哪个节点忙 / 费电），但指标条跟着跳
   反而让画面更乱。TPOT / 输出吞吐对纯生成类才有意义，SDXL / ASR 这类给 —— 而不是编。 */
function svcKPI(b){
  const m=b.m||{}, deg=!!bizSlo(b.id);
  const T=(k,v,s,e,w)=>({k,v:v==null?'—':String(v),s:s||'',e:!!e,w:!!w});
  /* ⚠ 只给**真正被这次故障拖累的那一项**上色。
     HBM 隔离的后果是「少一张可用卡 → 每 token 时延变长」，不是「请求失败」——
     成功率还在 99.98%，把它标黄只会让人怀疑这块屏的判断力。 */
  return [
    T('请求成功率', m.ok!=null?m.ok.toFixed(2):null, '%'),
    T('请求速率',   m.qps!=null?String(m.qps):null,  'req/s'),
    T('TTFT P99',   m.ttft!=null?(m.ttft>=1000?(m.ttft/1000).toFixed(1):m.ttft):null, m.ttft>=1000?'s':'ms'),
    T('TPOT P99',   m.tpot?m.tpot:null, 'ms', false, deg&&!!m.tpot),
    T('并发请求',   m.conc!=null?String(m.conc):null, ''),
    T('输出吞吐',   m.tps?m.tps.toFixed(1):null, 'k tok/s')
  ];
}
function kpiList(){
  if(S.view.lv==='logic'){const b=bizOf(S.logic); if(b&&b.k==='inf')return svcKPI(b)}
  const sc=scopeOf(); return (DIMS[S.mode]||DIMS.health)(coverOf(sc),sc).filter(Boolean) }

const renderKPI=()=>{
  /* 下钻层与机柜聚焦时图会占满舞台，得给 HUD 让出顶部走廊；
     只有集群默认视角不用让 —— 那时舞台上方本来就是弧线与空白。 */
  /* 逻辑视图不算下钻：drill 会给 #stageInner 加 150px 上内边距，
     舞台一矮，逻辑 viewBox 的取景就跟集群对不上，转场必跳（踩过） */
  const _dr=S.view.lv!=='cluster'&&S.view.lv!=='logic';
  $('stage').classList.toggle('drill', _dr || !!S.zoom);
  $('stage').classList.toggle('zoomed', !_dr && !!S.zoom);
  $('kpis').innerHTML=kpiList().map(x=>
    `<div class="kpi"><div class="k">${esc(x.k)}</div>
      <div class="v${x.txt?' txt':''}"${x.e?' style="color:var(--err)"':x.w?' style="color:#FF9A3D"':''}>${esc(x.v)}<small>${esc(x.s)}</small></div></div>`).join('');  if(typeof hfDecorateKPI==='function')hfDecorateKPI(); if(typeof r10Dividers==='function')requestAnimationFrame(r10Dividers);
};

