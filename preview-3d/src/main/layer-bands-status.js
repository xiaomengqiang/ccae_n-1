/* ---------- 负载图层 ---------- */
ALLK.forEach(k=>k.uc='norm');                          // 常态 73–88，蓝
/* 空闲（绿）= 没有被任何业务占用的节点，不再人工撒点 —— 图上的绿块就是「可分配算力」 */
ALLK.forEach(k=>{if(!k.biz)setU(k,'idle',0)});
/* ⚠ gidx(2,4,5) 与 gidx(14,1,6) 是**已经不再是故障卡**的两张（v3.26.1 / v3.30.1 各挪走一张），
   故意留在集合里不删：quota() 按固定步长跳过 used 采样，删元素会让后面所有落点整体移位。
   留着的唯一效果是这两张卡不参与配额、保持 norm —— 正是我们要的。加新元素同理会移位，
   所以 gidx(2,4,1)（新的故障卡）**只加不减**，加完把三档计数重新对一遍即可。 */
const uUsed=new Set([gidx(2,4,5),gidx(2,4,1),gidx(13,4,3),gidx(14,1,6),gidx(2,4,2),gidx(10,1,6)]);   // 故障卡与满载卡不参与配额
ALLK.forEach((k,i)=>{if(!k.biz)uUsed.add(i)});                              // 空闲卡也不参与配额
quota(uUsed,20,331,53).forEach(k=>setU(k,'low',10+Math.round(rr(0,16))));   // 低载（青）×20
/* 空闲节点的 CPU 刀片同步压到空转，否则 CPU 行还是一片蓝、与 NPU 行自相矛盾 */
/* 空闲节点的 CPU 刀片写 0 —— 与卡取同一档（heat 只有 v<=0 才是「空闲」绿），
   否则 2%~7% 会落进「<30%」的青档，同一个节点上半绿下半青，自相矛盾 */
NODES.forEach(n=>{if(!n.biz){n.cpu.util=0; n.cpu.mem=Math.round(rr(8,16));
  n.cpu.cpus.forEach(c=>{c.util=0})}});
/* 满载（粉红）×3 —— 全场只有这三处，且被定时器焊死在此档 */
setU(GC(2,4,2),'hot',96);                              // 计算柜 03
setU(GC(10,1,6),'hot',93);                             // 计算柜 11
/* 满载卡的 AI Cube 打满 —— 卡内视图里 Cube 块会跟着变粉红；同时被功耗/结温墙压低频率，
   这是「占用 100% 但算力没到标称」的那个故事，hover 里看得见。 */
GC(2,4,2).cube=97;  GC(2,4,2).cfreq=1180;
GC(10,1,6).cube=95; GC(10,1,6).cfreq=1240;
LK('P05~X2').bw=95; LK('P05~X2').hot=true;             // 一条拥塞链路

/* ---------- 能耗图层（档位与负载互相独立：低负载的卡也可能中等功耗） ---------- */
ALLK.forEach(k=>k.pc='norm');                          // 常态 338–358 W ≈ 36–58%，蓝
/* 低功耗（绿）= 空闲节点的卡：没有业务 → 只有静态功耗 */
ALLK.forEach(k=>{if(!k.biz){k.pc='low'; k.pwr=308+Math.round(rr(0,14))}});
const pUsed=new Set([gidx(2,4,5),gidx(2,4,1),gidx(13,4,3),gidx(14,1,6),gidx(3,2,5),gidx(12,6,1)]);
ALLK.forEach((k,i)=>{if(!k.biz)pUsed.add(i)});
/* 业务区里的低功耗（绿）不再随机撒点 —— 全部落在四个长尾推理服务上：
   Qwen3-32B / GLM-4.5 / SDXL / ASR 整服务低利用率（<30%）→ 单卡只有 ~315 W。
   能耗层里这几块板整板泛绿；悬浮绿卡给出「作业集中」的整合建议（popContent case 'npu'）。
   同步把负载档也压到 low —— 低功耗的根因就是利用率长期 <30%，两层数据必须互相印证。
   （每张卡只承载一个推理服务，卡 ↔ 服务是一对一，见 BIZ 分配。） */
['B3','B4','B5','B6'].forEach(id=>bizCards(id).forEach(k=>{
  if(k.status!=='ok')return;
  k.pc='low'; k.pwr=312+Math.round(rr(0,16));
  setU(k,'low',12+Math.round(rr(0,14)));
  pUsed.add(ALLK.indexOf(k));                          // 别再被 warm 配额改写
}));
quota(pUsed,10,613,53).forEach(k=>{k.pc='warm'; k.pwr=368+Math.round(rr(0,14))}); // 偏高（黄 60–90%）×10
NODES.forEach(n=>{if(!n.biz)n.cpu.pwrp=Math.round(rr(9,15))});                     // 空闲节点的 CPU 刀片
/* 两张满载卡同时撞上功耗封顶 —— 「占用 100% 但算力没到标称」这句话要有物理依据，
   否则 AI Cube 浮层里说「功耗封顶降频」而能耗图层上这张卡却不烫，自相矛盾。 */
[GC(2,4,2),GC(10,1,6)].forEach(k=>{k.pc='hot'; k.pwr=396; k.temp=91});
GC(3,2,5).pc='hot';  GC(3,2,5).pwr=394;                // 计算柜 04：单卡功耗顶格
GC(12,6,1).pc='hot'; GC(12,6,1).pwr=392;               // 计算柜 13
D.nets[2].dev[1].chipList[0].pwrp=95;                  // 互联柜 03：一颗互联芯片
/* CPU 刀片也点一批低功耗（绿）—— 否则能耗层只有 NPU 行有颜色，CPU 区整片蓝 */
const ALLCPU=[]; D.pods.forEach(p=>p.cpu.forEach(b=>ALLCPU.push(b)));
for(let i=0;i<22;i++){ALLCPU[(7+i*37)%128].pwrp=18+Math.round(rr(0,9))}

// 背面才可见的热点（不占首页配额）
D.pods[4].sw[1].bw=96;  D.pods[4].sw[1].pwrp=93;
D.pods[9].sw[3].bw=92;
[[4,1,[3,9,17]],[9,3,[5,12]]].forEach(([pi,si,qs])=>{
  qs.forEach(q=>{D.pods[pi].sw[si].omBw[q]=93+Math.round(rr(0,5))});
});
/* 计算柜 14 · NPU 刀片 05 · NPU 3。
   这块刀片就是 DeepSeek-R1 实例组 2 里 Decode 的 N05 节点 —— 故障直接落在一张具体的
   NPU上，逻辑视图的六边形里那一格自己就红了，不需要任何额外的「传播」表达。 */
const K9=D.pods[13].npu[4].cards[3];
K9.status='warn'; K9.temp=86; K9.hbm=96; K9.mem.ecc_iso=64; K9.mem.ecc_ce=38;
D.pods[13].npu[4].status='warn'; D.pods[13].status='warn';
/* ⛔ v3.26.1 删除：计算柜 15 · NPU 刀片 02 · NPU 6 的「NPU 结温过高」（原第 6 条故障）。
   评审意见：正面只保留 2 处故障。删掉之后 P15-N02-K6 就是一张普通的常态卡。
   ⚠ 它在 uUsed / pUsed 里的 gidx(14,1,6) **故意留着不删** ——
   quota() 是按固定步长采样并跳过 used 集合的，从集合里拿掉一个元素会把后面所有
   配额的落点整体移位，档位计数（idle72 / low59 / norm891 / hot2，
   pc low112 / norm898 / warm10 / hot4）就全变了。留着它只是让这一张卡不参与配额、
   保持 norm —— 这正是我们要的结果，代价为零。
   一并撤掉的还有：D.alarms 第 6 条、BUBBLES 的 temp-k6、SLO.B2、B2 的 tpot 34→26。 */
/* CPU 计算刀片、灵衢互联设备保持全绿 —— 让「有故障」与「全好」形成对比，
   顶部指标里干净的项直接写总数，红色自然收敛到真正出问题的三类 */

D.alarms=[
 {sev:'warn',t:'\u63a5\u53e3\u975e\u6cd5\u62a5\u6587\u6545\u969c', o:'P05-S01 \u00b7 PIC2 \u00b7 LPO1', d:'\u53ef\u80fd\u4f1a\u5bfc\u81f4\u7aef\u4fa7\u6389\u5361\u6216\u8005\u5b95\u673a\uff0c\u8bf7\u9694\u79bb\u5904\u7406',
  ts:'09:41:22', go:{t:'swblade',id:'P05-S01',pod:'P05'}},
 {sev:'warn',t:'\u63a5\u53e3\u975e\u6cd5\u62a5\u6587\u6545\u969c', o:'P11-S02 \u00b7 PIC1 \u00b7 LPO1', d:'\u53ef\u80fd\u4f1a\u5bfc\u81f4\u7aef\u4fa7\u6389\u5361\u6216\u8005\u5b95\u673a\uff0c\u8bf7\u9694\u79bb\u5904\u7406',
  ts:'09:38:07', go:{t:'swblade',id:'P11-S02',pod:'P11'}},
 {sev:'warn',t:'\u63a5\u53e3\u975e\u6cd5\u62a5\u6587\u6545\u969c', o:'P14-S03 \u00b7 PIC3 \u00b7 LPO4', d:'\u53ef\u80fd\u4f1a\u5bfc\u81f4\u7aef\u4fa7\u6389\u5361\u6216\u8005\u5b95\u673a\uff0c\u8bf7\u9694\u79bb\u5904\u7406',
  ts:'10:07:54', go:{t:'swblade',id:'P14-S03',pod:'P14'}},
 {sev:'warn',t:'HBM ECC \u9694\u79bb\u884c\u6570\u8fbe\u4e0a\u9650', o:'P03-N05-K1 \u00b7 HBM', d:'\u591a bit ECC \u9694\u79bb\u884c\u6570 64/64\uff0c\u65b0\u589e\u591a bit \u9519\u8bef\u5c06\u65e0\u6cd5\u9694\u79bb',
  ts:'09:12:31', sel:{t:'npublade',id:'P03-N05',pod:'P03'}, go:{t:'npu',id:'P03-N05-K1',pod:'P03',blade:'P03-N05'}},
 {sev:'warn',t:'HBM ECC \u9694\u79bb\u884c\u6570\u8fbe\u4e0a\u9650', o:'P14-N05-K3 \u00b7 HBM', d:'\u591a bit ECC \u9694\u79bb\u884c\u6570 64/64\uff0c\u65b0\u589e\u591a bit \u9519\u8bef\u5c06\u65e0\u6cd5\u9694\u79bb',
  ts:'08:26:15', sel:{t:'npublade',id:'P14-N05',pod:'P14'}, go:{t:'npu',id:'P14-N05-K3',pod:'P14',blade:'P14-N05'}}
 /* ⛔ v3.26.1 删除第 6 条「NPU 结温过高 · P15-N02-K6」—— 正面只留 2 处故障 */
];

/* ================== 状态 ================== */
const S={face:'front', mode:'health', view:{lv:'cluster'}, sel:null, filter:'all', q:'', zoom:null, theme:'neon',
         nav:'res', biz:null, logic:null,
         bizf:'all',                      // v3.27：作业列表的状态筛选档（见 FILT / bizState）
         bzopen:null};                    // v3.29：作业树当前展开的那一组（手风琴，'inf' | 'trn'）
const openSet=new Set(['root']);
const THEMES={
  neon:{map:{"#00E6A2":"#00E6A2","#0F2A24":"#0B2A20","#0F3A2E":"#0F3A2E","#0F1A28":"#191A1A","#1A2C42":"#2A2B2C","#22364F":"#343536","#4E7BA8":"#727376","#6FB3E0":"#9A9DA1","#A8CCE8":"#BABCBE","#8FA9C4":"#9E9FA1","#081421":"#0A0C0F","#03070D":"#050607","#04070E":"#080809","#04141A":"#0E0E0F","#050C15":"#0C0C0D","#050D18":"#141719","#060D18":"#0E0E0F","#06141D":"#101011","#07131C":"#101011","#07141C":"#101011","#071620":"#22272C","#080F1B":"#101011","#08121E":"#111212","#08131F":"#121213","#081420":"#121313","#08161F":"#1B1F23","#082A2E":"#18191A","#0A1322":"#262B31","#0A1523":"#151516","#0A1524":"#1E2226","#0A1826":"#161617","#0A1D28":"#171718","#0A2130":"#1A1B1C","#0A2131":"#12161A","#0B1120":"#141415","#0B1826":"#161718","#0B1827":"#101317","#0C2530":"#1B1C1D","#0C2C3A":"#202122","#0D1927":"#181819","#0D1928":"#2A3038","#0D1929":"#19191A","#0D1B2A":"#191A1B","#0D1F35":"#1E1F20","#0E1B2C":"#1B1B1C","#0E2233":"#1E1E1F","#0E272E":"#1B1C1D","#0F182A":"#1A1B1B","#0F2430":"#1D1D1E","#0F3A44":"#262728","#111C2E":"#1D1D1E","#11303E":"#242526","#122033":"#202021","#122036":"#212223","#12232F":"#1E1E1F","#123039":"#222324","#123245":"#31383F","#12333A":"#232425","#131F33":"#202122","#132B36":"#212223","#152233":"#212223","#152238":"#232425","#152341":"#33383E","#152B3E":"#262728","#16243A":"#252526","#17253C":"#262728","#17273F":"#2C3238","#17494A":"#2C2D2F","#17494B":"#1B8F51","#182739":"#252627","#191810":"#131313","#1A2B44":"#3A4148","#1B1A10":"#2A2620","#1B2942":"#2B2C2D","#1B2E4A":"#343A41","#1E4A72":"#17915C","#1E5A5C":"#38393B","#1E5A5D":"#3A4046","#1E6B65":"#25C46B","#1F3350":"#333435","#20304A":"#313233","#22354E":"#3A4046","#243755":"#38393A","#25705F":"#444648","#263D5C":"#3C3D3E","#26405F":"#3D3E40","#26456B":"#434446","#2A1017":"#2B0F14","#2A1A08":"#2A1E08","#2A2612":"#2A2112","#2A4E6E":"#464749","#2A6B66":"#454648","#2C4166":"#434446","#2C6E8F":"#56585A","#2C7E9F":"#5D5F62","#2E7E78":"#4F5153","#2FA98C":"#17A882","#33608F":"#595B5D","#3A1D24":"#3B1C22","#3A2408":"#3A2808","#3E546F":"#848689","#3E8FC4":"#76797C","#3F6B60":"#4F5051","#3F7B70":"#565759","#445775":"#565758","#465C79":"#595A5B","#4A4322":"#5A5030","#4E6480":"#606162","#4E6884":"#616264","#4FA8FF":"#989CA2","#57C8F0":"#43FDBF","#5A3510":"#5A3F10","#5A5028":"#5A4828","#5C6F8E":"#848689","#5C7E88":"#6A6B6C","#5E9A96":"#737476","#6B6136":"#6B5836","#6B80A0":"#7C7D7F","#7089A8":"#828385","#7794AE":"#88898B","#7C96B8":"#8F9092","#7FA6D0":"#9B9DA0","#7FD4CB":"#5FEDBE","#8A7C46":"#8A7146","#8CA2BE":"#9A9B9C","#8FC6C0":"#77D7B7","#8FE3DA":"#6FFCCD","#93A7C4":"#A0A1A3","#9BE9E0":"#7FFED3","#9BE9E1":"#00E6A2","#9FCBFF":"#C0C2C6","#BFE7E2":"#ACF2DA","#CFE0F5":"#D3D4D6","#CFE0F6":"#D6DADE","#D8C271":"#D8B271","#DCEBFA":"#DCDDDE","#DDEBFA":"#DCDDDF","#DFF5F1":"#D0FBEC","#E0C46B":"#E0B56B","#E7EFFA":"#E1E2E3","#FF5B6E":"#F56582","#FF8F5C":"#9EA2A8","#FF8F9C":"#F896A9"},
    heat:["#3E5A6B", "#3E8FA8", "#25C46B", "#8FD65B", "#FFB44F", "#FF5B6E"], status:{"ok": "#25C46B", "warn": "#FF4D6D", "err": "#FF4D6D"}, accent:"#00E6A2", link:"#17A882", linkHi:"#00E6A2"   /* v3.30.8：常态连线由深灰改暗绿 —— 拓扑图的主体是线，线看不见等于图没画 */},
};

function TH(){return THEMES[S.theme]||null}
/* 生成后的 SVG / HTML 统一过一遍换肤映射：绘制代码零改动 */
function reskin(str){const t=TH(); if(!t)return str;
  return str.replace(/#[0-9A-Fa-f]{6}/g,h=>t.map[h.toUpperCase()]||h)}
/* 器件层只有两态：正常（绿）/ 故障（红）——原黄色「故障」一律并入故障，不再有中间色、不闪烁。
   隐患与故障的区分只保留在顶部 KPI 的数字里。 */
const isSel=id=>!!(S.sel&&S.sel.id===id);   // 绿描边只给「被选中的那一个」，相关设备只保持高亮
function colH(st){const t=TH(); const S3=t?t.status:{ok:'#00E6A2',err:'#FF4D6D'};
  return (st&&st!=='ok')?S3.err:S3.ok}
/* 器件着色：故障图层看状态，负载图层看利用率，能耗图层看功耗 */
/* 度量能力：Union / Port / lane / OSFP 是交换芯片内的逻辑单元，功耗按整板计量，
   芯片内没有独立功耗传感器 —— 能耗图层下它们保持中性，不编数字硬凑。 */
const NA='#39414B';                                   // 无此项度量
const hasPwr=o=>o&&!['swblade','netdev','uchip','udie','ichip'].includes(o.kind)&&(o.pwr!=null||o.pwrp!=null||o.kw!=null);
const loadOf=o=>o.util!=null?o.util:(o.bw!=null?o.bw:null);   // 计算类看利用率，网络类看流量
const pwrPct=o=>S.mode==='pwr'?powerBand(devW(o)):(o.pwrp!=null?o.pwrp:o.pwr!=null?Math.max(0,Math.min(100,(o.pwr-305)/92*100)):o.kw!=null?Math.max(0,Math.min(100,(o.kw-28)/10*100)):(o.util!=null?o.util*.82:52));
function powerBand(w){return w<100?15:w<250?45:w<400?75:95;}
function scaleLabels(){return S.mode==='pwr'?['<100W','100–250W','250–400W','≥400W']:['<30%','30–60%','60–90%','≥90%'];}
/* ── 叠加图层的统一着色规则 ──────────────────────────────
   叶子器件（当前层被度量的最小单位：卡 / Union / OSFP / 端口 / L2 设备）
       → 填充 + 描边都用图层色
   容器（刀片框 / 机柜 / 分区框，值是聚合出来的）
       → 只描边，填充保持原样，否则内部叶子会被淹掉
   故障图层维持原本的深底 + 状态描边。 */
const lyF=(o,base)=>S.mode==='health'?base:devCol(o);     // 叶子填充
const lyO=()=>S.mode==='health'?1:.45;                    // 叶子填充不透明度
const lyS=(o,base)=>S.mode==='health'?base:devCol(o);     // 描边（叶子与容器共用）
function devCol(o){
  if(S.mode==='health')return colH(o.status);
  if(S.mode==='pwr')return hasPwr(o)?heat(pwrPct(o)):NA;
  const lv=loadOf(o); return lv!=null?heat(lv):NA;
}
/* 故障红只属于故障图层；负载 / 能耗图层下不掺任何故障色 */
const bad_=o=>S.mode==='health'&&!!o&&o.status!=null&&o.status!=='ok';
/* 端口 / lane 只有「流量」这一种度量：故障图层用固定靛蓝，负载图层按流量走热力，能耗图层中性 */
const PORTBLUE='#4F7BFF', LANEBLUE='#5FD8FF';
const portCol=v=>S.mode==='health'?PORTBLUE:S.mode==='pwr'?NA:(v!=null?heat(v):NA);
const laneCol=v=>S.mode==='health'?LANEBLUE:S.mode==='pwr'?NA:(v!=null?heat(v):NA);
const portTxt=v=>S.mode==='pwr'?'#8A939E':(S.mode==='health'?'#08122A':(v!=null&&v<60?'#0B1B22':'#08122A'));
const badF=b=>S.mode==='health'&&!!b;
/* 色阶：4 档。负载与能耗语义相反 —— 负载低=空闲(绿)、高=拥塞(粉红)；能耗单调冷→热。 */
const HEAT_UTIL=[['#36C18D','空闲'],['#2E90B8','<30%'],['#6B9BFA','30–90%'],['#FF5B9E','>90%']];
/* ⚠ 口径：这四档是「各器件占自己额定功耗的比例」，不是绝对瓦数 —— 同样的橙色在
   一张 NPU和一块刀片上代表的绝对功耗差好几倍。图例已写明「占额定」。
   待架构师给出真实额定值后改成分层绝对刻度（集群/机柜用 kW、卡用 W），见待办。 */
const HEAT_PWR =[['#36C18D','<30%'],['#6B9BFA','30–60%'],['#FCC800','60–90%'],['#E95B11','>90%']];
function heatSet(){return S.mode==='pwr'?HEAT_PWR:HEAT_UTIL}
function heat(v){
  if(S.mode==='pwr')return v<30?HEAT_PWR[0][0]:v<60?HEAT_PWR[1][0]:v<90?HEAT_PWR[2][0]:HEAT_PWR[3][0];
  return v<=0?HEAT_UTIL[0][0]:v<30?HEAT_UTIL[1][0]:v<90?HEAT_UTIL[2][0]:HEAT_UTIL[3][0];}
/* ── 极值刀片描边 ────────────────────────────────
   集群视图里单颗芯片只有 14px 宽，一张卡满载根本看不见。和故障同一套做法：
   用当前图层最高档的颜色把“里面有极值”的那条刀片整体圈出来。
   仍然遵守原则 1/5：颜色只表达状态，容器只描边不填充。 */
const HOTC=()=>S.mode==='pwr'?HEAT_PWR[3][0]:HEAT_UTIL[3][0];
const isHotDev=o=>{if(!o)return false;
  if(S.mode==='util'){const v=loadOf(o); return v!=null&&v>=90}
  if(S.mode==='pwr')  return hasPwr(o)&&pwrPct(o)>=90;
  return false};
const hotIn=o=>{if(S.mode==='health'||!o)return false;
  const ks=o.cards||o.chipList||o.dev;
  return ks?ks.some(isHotDev):isHotDev(o)};
/* ⭐ v3.30.6（评审意见 2）：**连线的常态色改成暗一档的绿**，与高亮态（`#00E6A2`）同色系。
   原来是冷蓝 `#6FB3E0` / `#4E7BA8` —— 在这块深蓝底上明度差不够，
   不选中任何东西时（首屏、讲解间隙）线几乎看不见，而拓扑图的主体本来就是线。
   ⚠ 不能直接用高亮绿：**高亮要靠对比撑起来**，全场都是 `#00E6A2` 的话选中就没了意义。
   现在的分工：常态 `LNKC`（暗绿、细、半透明）→ 高亮 `#00E6A2`（亮绿、粗、不透明）。 */
const LNKC='#2FA98C';
function linkBase(){const t=TH();return t?t.link:'#3E8FC4'}
/* 链路的唯一度量是带宽利用率；光纤本身不耗电（耗电的是两端光模块）→ 能耗图层保持中性 */
const linkLayer=bw=>S.mode==='health'?linkBase():S.mode==='pwr'?NA:heat(bw!=null?bw:50);
function linkHot(){const t=TH();return t?t.linkHi:'#57C8F0'}
function linkCol(l){if(l.status==='err')return'#FF5B6E';return linkLayer(l.bw)}

/* 查找 */
const findPod=id=>D.pods.find(p=>p.id===id);
const findNet=id=>D.nets.find(n=>n.id===id);
function findObj(t,id,ctx={}){
  if(t==='pod')return findPod(id);
  if(t==='netcab')return findNet(id);
  const p=findPod(ctx.pod||id.slice(0,3));
  if(t==='npublade')return p&&p.npu.find(b=>b.id===id);
  if(t==='cpublade')return p&&p.cpu.find(b=>b.id===id);
  if(t==='swblade')return p&&p.sw.find(b=>b.id===id);
  if(t==='ioblade')return p&&p.io.find(b=>b.id===id);
  if(t==='mgmtblade')return p&&p.mgmt;
  if(t==='pwrbox'){const n=findNet(id.slice(0,2));return n?n.pwr:(p&&p.pwr)}
  if(t==='npu'){const b=p&&p.npu.find(b=>b.id===(ctx.blade||id.slice(0,7)));return b&&b.cards.find(k=>k.id===id)}
  if(t==='netdev'){const n=findNet(ctx.cab||id.slice(0,2));return n&&n.dev.find(d=>d.id===id)}
  /* 芯片 / DIE 层：指标 HUD 要能一路解析到最细粒度，否则下钻到芯片就没数了 */
  if(t==='uchip'){const b=p&&p.sw.find(x=>x.id===(ctx.blade||id.slice(0,7)));return b&&b.chipList.find(c=>c.id===id)}
  if(t==='ichip'){const n=findNet(ctx.cab||id.slice(0,2));
    const d=n&&n.dev.find(x=>x.id===(ctx.dev||id.slice(0,6)));return d&&d.chipList.find(c=>c.id===id)}
  if(t==='cpucard'||t==='cpu'){const b=p&&p.cpu.find(x=>x.id===(ctx.blade||id.slice(0,7)));
    return b&&b.cpus.find(c=>c.id===id)}
  if(t==='udie'){
    if(id.indexOf('-K')>0){const b=p&&p.npu.find(x=>x.id===(ctx.blade||id.slice(0,7)));
      const k=b&&b.cards.find(x=>x.id===(ctx.card||id.slice(0,id.indexOf('-D'))));
      return k&&k.dies.find(d=>d.id===id)}
    return null;   // v3.30.1：CPU 侧已无 Udie，只有 NPU的（上面那一支）
  }
  return null;
}

