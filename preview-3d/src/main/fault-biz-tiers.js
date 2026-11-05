/* ---- 故障注入 ---- */
/* ── 光模块故障统一口径：都是「链路降 Lane」（4 Lane 里坏 1 条），不是整链中断 ──
   所以 **刀片本身不标红、链路也不标红**：坏的是光模块，不是刀片（原则 3，故障不沿通路传播）。
   三处故障因此完全同构 —— 竖条里各有一个红格，仅此而已。
   影响体现在带宽上：该上行链路掉到 ~75%，由 deg 档位锁住。 */
[['P05','P05~X1'],['P11','P11~X2'],['P14','P14~X3']].forEach(([pid,lid])=>{
  const p=D.pods.find(x=>x.id===pid); p.status='warn';   // 柜级只做提示，不是 err
                                                        // （findPod 在下面才定义，这里直接查 D）
  const l=LK(lid); l.deg=true; l.bw=54+Math.round(rr(0,5));
});
/* ⭐ v3.30.1（评审意见 4）：这张故障卡从 `cards[5]`（NPU 6）挪到 `cards[1]`（NPU 2）。
   理由不是位置好看 —— **NPU 端口的连线规则目前只对刀片上的前 4 张卡成立**，
   故障落在第 5 张及以后，观众一路下钻到卡内视图，看到的是一套还没定稿的连线。
   故障是整个 demo 里唯一被人逐层追下去的路径，它必须落在**口径最硬的那一段**上。
   另一处故障 P14-N05-K3 是 `cards[3]`（NPU 4），本来就在前 4 张里，不用动。
   ⚠ 变量名保留 `K6` 不改 —— 它在下面被引用多处，改名是纯噪音；它指的是「那张 HBM 故障卡」。 */
const K6=D.pods[2].npu[4].cards[1];
/* NPU 侧的故障从「端口随机坏」改成「HBM 多 bit ECC 隔离行数达上限」——
   端口坏是 pFail() 哈希出来的噪音，讲不出业务影响；ECC 隔离行数才是运维真正会盯的指标。 */
K6.status='warn'; K6.temp=88; K6.mem.ecc_iso=64; K6.mem.ecc_ce=41;
D.pods[2].npu[4].status='warn'; D.pods[2].status='warn';
/* ── 档位制：常态与极值全部人工种入，数量精确可控 ──────────
   每张卡先被打一个“档位”标签（负载 uc / 能耗 pc），之后的定时抖动只在本档位
   的窄区间内游走、永不跨档 —— 绿始终是绿，粉红永远只有配额里的那几处。
   ⚠ v2 的抖动是对 util 做 [55,99] 无锚点随机游走：几秒后绿/青卡被抬到 55 变蓝，
     几分钟后大批蓝卡漂过 90 变粉红。“全是蓝色 + 粉红太多”的根因就在那里。 */

const ALLK=[]; D.pods.forEach(p=>p.npu.forEach(b=>b.cards.forEach(k=>ALLK.push(k))));
const gidx=(p,b,k)=>p*64+b*8+k;                        // 卡的全局序号（柜→刀片→卡）
const GC=(p,b,k)=>D.pods[p].npu[b].cards[k];
/* 在 1024 张卡里按固定步长等距取样：跨柜均匀铺开，且完全确定（不吃随机数） */
function quota(used,n,off,step){const out=[];
  for(let i=0;out.length<n&&i<1024;i++){const q=(off+i*step)%1024;
    if(used.has(q))continue; used.add(q); out.push(ALLK[q])}
  return out}
const setU=(k,cls,v)=>{k.uc=cls; k.util=v;
  k.dies.forEach(d=>d.util=Math.max(0,Math.min(99,v+Math.round(rr(-4,4)))))};

/* ================== 业务视角：按节点分配 ==================
   1 节点 = 1 块 NPU 计算刀片（8 张 NPU）+ 1 块 CPU 计算刀片（2 颗 CPU），
   全场 16 柜 × 8 = 128 个节点。调度器以「节点」为最小下发单位，
   同一业务的节点尽量连续 —— 跨柜通信要绕互联柜，代价高。
   ⚠ 顺序很重要：业务分配必须排在档位制之前，因为「没分到业务的节点 = 空闲」
     这条事实直接决定了负载/能耗的档位（绿），而不是反过来人工点绿。 */
const NODES=[];
D.pods.forEach((p,pi)=>p.npu.forEach((bl,bi)=>NODES.push({
  g:pi*8+bi, pi, bi, pod:p, npu:bl, cpu:p.cpu[bi], biz:null})));
const BIZ=[
 /* 推理：第一个服务 16 节点（主力），其余 1–2 节点 —— 与真实推理集群的长尾形态一致 */
 /* m = 服务级指标（逻辑视图的 KPI 条就用这一套，不随图层变）：
      成功率 / QPS / TTFT P99 / TPOT P99 / 并发 / 输出吞吐 tok·s⁻¹ */
 {id:'B1',k:'inf',name:'DeepSeek-R1',   from:96, nd:16, sub:'QPS 1840 · P99 186 ms',
  m:{ok:99.98, qps:1840, ttft:186, tpot:43, conc:892, tps:11.2}},
 /* ⚠ v3.26.1：tpot 从劣化值 34 改回常态 26 —— DeepSeek-V3 的那条「NPU 结温过高」
    已经删了（正面只留 2 处故障），服务没有劣化根因就不能顶着一个劣化的时延值。 */
 {id:'B2',k:'inf',name:'DeepSeek-V3',   from:112,nd:2,  sub:'QPS 1260 · P99 214 ms',
  m:{ok:99.97, qps:1260, ttft:214, tpot:26, conc:604, tps:7.8}},
 {id:'B3',k:'inf',name:'Qwen3-32B',     from:114,nd:2,  sub:'QPS 980 · P99 152 ms',
  m:{ok:99.99, qps:980,  ttft:152, tpot:21, conc:428, tps:6.4}},
 {id:'B4',k:'inf',name:'GLM-4.5',       from:116,nd:1,  sub:'QPS 640 · P99 178 ms',
  m:{ok:99.96, qps:640,  ttft:178, tpot:24, conc:266, tps:3.9}},
 {id:'B5',k:'inf',name:'文生图 SDXL',    from:117,nd:1,  sub:'QPS 92 · P99 2.4 s',
  m:{ok:99.88, qps:92,   ttft:2400,tpot:0,  conc:48,  tps:0}},
 {id:'B6',k:'inf',name:'语音识别 ASR',   from:118,nd:1,  sub:'QPS 320 · P99 88 ms',
  m:{ok:99.95, qps:320,  ttft:88,  tpot:0,  conc:132, tps:0}},
 /* 训练：整柜连续大块 —— 切到训练是一整片，切到推理是小块，形态差异本身就是一帧讲解 */
 {id:'T1',k:'trn',name:'盘古大模型 · 预训练', from:0,  nd:64, prog:63, sub:'第 12 400 步 · 剩余 41 h'},
 {id:'T2',k:'trn',name:'悟空多模态 · 微调',   from:64, nd:32, prog:28, sub:'第 3 100 步 · 剩余 96 h'}
];
BIZ.forEach(b=>{for(let i=0;i<b.nd;i++){const n=NODES[b.from+i]; if(!n)continue;
  n.biz=b.id; n.npu.biz=b.id; n.cpu.biz=b.id; n.npu.cards.forEach(k=>k.biz=b.id)}});
/* 剩余节点（计算柜 15 尾 + 计算柜 16）未分配 = 空闲算力池 */
const bizOf   =id=>BIZ.find(b=>b.id===id);
const bizNodes=id=>NODES.filter(n=>n.biz===id);
const bizCards=id=>ALLK.filter(k=>k.biz===id);
const bizPods =id=>D.pods.filter(p=>p.npu.some(b=>b.biz===id));
const bizNdIn =(p,id)=>p.npu.filter(b=>b.biz===id).length;
const bizCntIn=(p,id)=>bizNdIn(p,id)*8;
const IDLEN   =NODES.filter(n=>!n.biz).length;

/* ---------- 逻辑视图：PD 实例推导 ----------
   Prefill / Decode 是**推理**概念（训练没有这一层，见交接文档四点九）。
   规则：P : D = 1 : 3，每个实例组 ≤ 8 节点，超了就再开一组。
   16 节点 → 2 组 ×（2 Prefill + 6 Decode）；2 节点 → 1 组（1P + 1D）；1 节点 → PD 融合。
   不新编数据，全部从已有的节点数推出来。 */
function pdOf(id){
  const nd=bizNodes(id); if(!nd.length)return [];
  if(bizOf(id)?.k==='trn')return Array.from({length:Math.ceil(nd.length/16)},(_,i)=>({g:i+1,p:nd.slice(i*16,i*16+16),d:[]}));
  if(nd.length===1)return [{g:1,fuse:true,p:[nd[0]],d:[]}];
  const grp=Math.ceil(nd.length/8), size=Math.round(nd.length/grp), out=[];
  for(let i=0;i<grp;i++){
    const seg=i===grp-1?nd.slice(i*size):nd.slice(i*size,(i+1)*size);
    if(!seg.length)continue;
    const np=Math.max(1,Math.round(seg.length/4));
    out.push({g:i+1,p:seg.slice(0,np),d:seg.slice(np)});
  }
  return out;
}
/* 节点 IP 由物理位置生成 —— 看一眼 IP 就知道在哪个柜，和光柱互为验证 */
const nodeIP=n=>'112.34.'+(n.pi+1)+'.'+(n.bi+2);
/* ---------- ⭐ 机架槽位（v3.23.0 按真实槽位图重定，替换掉之前编的 U 位）----------
   「N05 / C05」只是柜内序号，机房里没人这么说；找设备用的是槽位号。

   槽位**自下而上** 13 → 31，每块板占 1 槽（不是之前以为的 NPU 占 2U）：

     31  CPU 板 8          ← 顶
     30  CPU 板 7
     29  CPU 板 6
     28  CPU 板 5
     27  RoCE 板 2（8 个网卡芯片 RoCE）
     26  NPU 板 8
     25  NPU 板 7
     24  NPU 板 6
     23  NPU 板 5
     22  ▨ 空 —— **假板卡**（填充用，不是器件，没有接口）
     21  NPU 板 4
     20  NPU 板 3
     19  NPU 板 2
     18  NPU 板 1
     17  CPU 板 4
     16  CPU 板 3
     15  CPU 板 2
     14  CPU 板 1
     13  RoCE 板 1（8 个网卡芯片 RoCE）  ← 底

   ⚠️ 三处待确认（槽位图上没答案，别自己编）：
   ① **管理板的槽位**：图上标的是 31，可 31 已经被 CPU 板 8 占了 —— 疑似笔误。
      demo 里暂不给管理板标槽位号，等确认。
   ② **槽位 1–12 是什么**：图从 13 起，下面 12 个槽没画，估计是电源框 / 走线区。
   ③ 图上 RoCE 板写的是 **8 个网卡芯片**，而 demo 数据模型里 `io.nics=16`（全场 512 个）。
      改这个会动全场计数，先记着，等口径确认再动。 */
/* ⬆ SLOT_* / uTxt* / bName 已上提到数据生成之前（器件名要用到），见「机架槽位」一节。 */
const biOf = id => (+id.slice(-2))-1;

/* ---------- 业务侧「劣化根因」：用**现有故障清单里的那一条**，不另编 ----------
   P14-N05-K3「HBM ECC 隔离行数达上限」落在 DeepSeek-R1 实例组 2 的
   Decode · N05 节点上 → 该节点少一张可用卡 → 服务 P99 劣化。
   ⚠️ 顶部集群级的故障总数一个数字没动 —— 只是把这条故障搬到了推理的地盘上。

   ⚠️ v3.26.1：**只剩 B1 一条**。原来 B2（DeepSeek-V3）挂的是「NPU 结温过高」，
   那条故障已按评审意见删掉（正面只留 2 处）。
   **SLO 必须跟着故障清单走** —— 留一条没有根因器件的「劣化」，
   逻辑视图会出现「服务劣化，但屏上一个红点都找不到」，是当场会被问住的矛盾。
   同一件事的另一半在 BIZ 里：B2 的 tpot 已改回常态 26。 */
const SLO={
  B1:{ st:'劣化', pod:'P14', blade:'P14-N05', card:'P14-N05-K3', ts:'2026-08-25 08:26:15',
       name:'HBM ECC 隔离行数达上限',
       at:'计算柜 14 · NPU刀片05 (U23) · NPU 4',
       d:'多 bit ECC 隔离行数 64/64，新增错误将无法隔离。',
       eff:'该 Decode 实例可用算力 −1/8，TPOT 由 25 ms 升至 43 ms。',
       fix:'尽快更换该 NPU' }
};
const sloOf=id=>SLO[id]||null;
/* 某个业务是不是处于劣化态 —— 业务列表、逻辑视图共用 */
const bizSlo=id=>SLO[id]||null;

