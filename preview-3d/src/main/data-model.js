/* ================== 数据模型（按设备树） ==================
 集群 → 超节点
  ├ 计算柜 Pod ×16
  │  ├ NPU计算刀片 ×8 → NPU ×8 → (Udie ×2 → 端口×9 / HBM / 寄存器), BMC, UBM
  │  ├ CPU计算刀片 ×8 → CPU ×2 → (端口×9 / 寄存器), BMC, UBM      ← v3.30.1：CPU 侧不再建 Udie
  │  ├ 灵衢互联刀片 ×4 → Union互联芯片 ×20(端口18/光模块32), UBM, BMC     ← 柜背
  │  ├ 灵衢管理刀片 ×1 → Pod Manager, BMC, 交换芯片
  │  ├ 灵衢RoCE板 ×2 → 网卡 ×16, Union互联芯片 ×2, BMC, UBM
  │  └ 电源框 ×1 → 电源模块 ×18, 机柜管理主模块 RM310(BMC/CPLD)
  └ 灵衢互联柜 ×4
     ├ 灵衢互联设备 ×4 → 互联芯片 ×2 (端口128@400G / 光模块128)
     ├ 电源框(RM310 + 电源模块×6), UBM管理芯片, 风扇模块×6
========================================================= */
/* ================== 机架槽位（真机口径，v3.23.0）==================
   自下而上 13 → 31，每板 1 槽；22 是假板卡（不是器件，首页不画，只影响编号）。
   ⚠ 这一段必须放在数据生成之前 —— 器件的 name 就是拿它拼的。 */
const SLOT_NPU = bi => bi<4 ? 18+bi : 23+(bi-4);   // 板1–4 → 18–21，板5–8 → 23–26
const SLOT_CPU = bi => bi<4 ? 14+bi : 28+(bi-4);   // 板1–4 → 14–17，板5–8 → 28–31
const SLOT_IO  = i  => i===0 ? 13 : 27;
const SLOT_EMPTY = 22;                              // 假板卡
const slotTxt = n => 'U'+n;
const uTxtNpu = bi => slotTxt(SLOT_NPU(bi));
const uTxtCpu = bi => slotTxt(SLOT_CPU(bi));
/* ⭐ v3.24.0：器件名 = **槽位在前**，严格照真机槽位图的写法 `NPU刀片05 (U23)`。
   理由见「机架槽位」一节：机房里认的是槽位号，板序号只是我们的内部序号。
   ⚠ 名字里已经有槽位了，悬浮卡副标题 / 分区标题就**不要再写一遍**（原则：一份表达）。 */
const bName = (slot,kind,no) => kind+(kind==='NPU'||kind==='CPU'?'刀片':'板')+pad2(no)+' (U'+slot+')';

const D={pods:[],nets:[],alarms:[]};

for(let c=0;c<16;c++){
  const id='P'+pad2(c+1);
  const pod={kind:'pod',id,name:'计算柜 '+pad2(c+1),idx:c,status:'ok',
    npu:[],cpu:[],sw:[],io:[],mgmt:null,pwr:null};
  for(let b=0;b<8;b++){
    const bid=id+'-N'+pad2(b+1);
    const bl={kind:'npublade',id:bid,name:bName(SLOT_NPU(b),'NPU',b+1),pod:id,idx:b,cards:[],status:'ok',pwrp:Math.round(rr(38,62))};
    for(let k=0;k<8;k++){
      const kid=bid+'-K'+k;
      /* ⭐ v3.30：显示编号从 1 起（评审意见）。**只改 name，不改 id** ——
         id 里仍是 K0–K7（写循环、查表全靠它），屏上一律读 name。
         这就是二点五那条「代码序号 ≠ 显示编号」在卡这一级的又一个实例：
         凡是要上屏的地方用 k.name，**不要拿 idx 拼字符串**。 */
      bl.cards.push({kind:'npu',id:kid,name:'NPU '+(k+1),blade:bid,pod:id,idx:k,status:'ok',
        util:Math.round(rr(73,88)),hbm:Math.round(rr(62,86)),temp:Math.round(rr(48,70)),pwr:Math.round(rr(338,358)),
        procs:Math.round(rr(1,6)),cube:Math.round(rr(58,96)),vec:Math.round(rr(30,78)),ctl:Math.round(rr(8,34)),acpu:Math.round(rr(12,46)),
        /* ⭐ 一张 NPU = 2 颗 Udie，命名 A / B（原来是 0 / 1）。
           每颗 die 各 9 个端口，各自从 P00 数到 P08 —— 卡上**不存在** P09–P17。 */
        dies:[0,1].map(di=>({kind:'udie',id:kid+'-D'+di,name:'Udie-'+'AB'[di],card:kid,idx:di,status:'ok',
          util:Math.round(rr(60,98)),temp:Math.round(rr(50,72)),freq:Math.round(rr(1650,1850)),volt:Math.round(rr(720,790)),
          ports:Array.from({length:9},(_,p)=>({kind:'dport',id:kid+'-D'+di+'-P'+pad2(p),name:'端口 '+pad2(p),
            up:true,rate:'800G',bw:Math.round(rr(35,92)),ber:rr(.2,1.6).toFixed(1),rx:rr(-4.2,-1.1).toFixed(1)}))
        })),
        mem:{cap:128,bwUse:Math.round(rr(55,93)),ecc_ce:Math.round(rr(0,9)),ecc_ue:0,stacks:8}
      });
    }
    pod.npu.push(bl);
  }
  for(let b=0;b<8;b++){
    const bid=id+'-C'+pad2(b+1);
    pod.cpu.push({kind:'cpublade',id:bid,name:bName(SLOT_CPU(b),'CPU',b+1),pod:id,idx:b,status:'ok',pwrp:Math.round(rr(32,56)),
      memCnt:24,diskCnt:4,fanCnt:6,pwrCnt:1,
      util:Math.round(rr(18,58)),mem:Math.round(rr(35,78)),temp:Math.round(rr(38,58)),
      cpus:[0,1].map(ci=>({kind:'cpu',id:bid+'-U'+ci,name:'CPU '+(ci+1),blade:bid,idx:ci,
        util:Math.round(rr(15,62)),temp:Math.round(rr(38,60)),cores:64,freq:Math.round(rr(2600,2900)),
        /* ⛔ v3.30.1（评审意见 5）：**CPU 不再建 Udie**。
           NPU的 2 颗 Udie 是有对外端口的（各 9 个口，屏上逐个画出来），是真器件；
           CPU 这两颗从来没有独立的口 —— CPU 的 9 个口是一套连续编号 P00–P08，
           「哪几个口挂在哪颗 die 上」是我们**推的**、一直标着待确认，
           在屏上它只是一层多余的中间概念：观众读完还是得回到 P00–P08。
           删掉之后 CPU 的层级是 刀片 → CPU → 端口，比原来少一跳、也不再有待确认项。
           ⚠ 只删 CPU 侧；NPU的 Udie 全部保留。 */
        _dies_removed_v3301:[0,1].map(di=>({kind:'udie',id:bid+'-U'+ci+'-D'+di,name:'Udie-'+'AB'[di],idx:di,status:'ok',
          util:Math.round(rr(14,64)),temp:Math.round(rr(38,60)),freq:Math.round(rr(2600,2900)),volt:Math.round(rr(800,900)),ports:[]}))
      }))});
  }
  for(let s=0;s<4;s++){
    const sid=id+'-S'+pad2(s+1);
    /* ⭐ v3.30.3（评审意见 2）：L1 的编号是**柜内槽位号 61–64**，每个柜都一样 ——
       不是 v3.30 那套「全场连续 01–64」。id 仍是 P01-S01 这套，只换屏上读到的号。 */
    pod.sw.push({kind:'swblade',id:sid,name:'灵衢互联刀片'+pad2(s+1)+'（U'+(61+s)+'）',pod:id,idx:s,status:'ok',
      bw:Math.round(rr(74,88)),pwrp:Math.round(rr(34,58)),ber:rr(.3,2.2).toFixed(1),optics:32,chips:20,portsPerChip:18,
      omBw:Array.from({length:32},(_,q)=>{const seed=((c+1)*73856093^(s+1)*19349663^(q+1)*83492791)>>>0;const n=seed%100;return n<4?18+seed%9:n<13?38+seed%17:n>95?92+seed%7:68+seed%21}),
      chipList:Array.from({length:20},(_,i)=>{
        /* 内部序号 no：左组奇数 1,3,5…15　右组偶数 2,4,6…16　互联 17–20（数组顺序仍是 左8→右8→互联4）。
           ⭐ v3.30.2（评审意见 2）：**显示编号改成两段式** —— 下行 U1.1–U1.16 / 互联 U2.1–U2.4。
           `no` 只留给内部索引（id、unionOf、interOf 都还按 1–20 算），屏上一律读 `lbl`。 */
        const no = i<16?(i<8?i*2+1:(i-8)*2+2):i+1;
        const lbl = i<16 ? 'U1.'+no : 'U2.'+(no-16);
        return {kind:'uchip',
        id:sid+'-U'+pad2(no), lbl, name:'Union '+lbl,
        blade:sid,idx:i,status:'ok',bw:Math.round(rr(70,88)),temp:Math.round(rr(52,74)),
        /* 无 pwrp：Union 没有独立功耗计量，能耗图层下保持中性 */
        role:i<16?'down':'inter',            // 0-7 左组下行 / 8-15 右组下行 / 16-19 互联
        grp:i<16?(i<8?0:1):null,             // 下行 Union 所属组
        npuBlade:i<16?i%8:null,              // 该 Union 向下连的 NPU 刀片序号
        /* ⭐ v3.30.2（评审意见 3）：端口**统一编号 1–18**（不再分「上行 4 / 下行 12」两套）。
           1–8 → NPU　9 空闲　10–13 → 互联 Union　14–17 → 光模块　18 空闲 */
        ports:18, lanes:8,
        portBw:Array.from({length:18},()=>Math.round(rr(70,88))),
        laneBw:Array.from({length:8},()=>Math.round(rr(66,88)))}})});
  }
  for(let i=0;i<2;i++){
    pod.io.push({kind:'ioblade',id:id+'-IO'+(i+1),name:bName(SLOT_IO(i),'RoCE',i+1),pod:id,idx:i,status:'ok',
      nics:16,uchips:2,bw:Math.round(rr(70,86)),pwrp:Math.round(rr(30,52))});
  }
  pod.mgmt={kind:'mgmtblade',id:id+'-M',name:'灵衢管理刀片',pod:id,status:'ok',util:Math.round(rr(6,22))};
  pod.pwr={kind:'pwrbox',id:id+'-PW',name:'电源框',pod:id,status:'ok',mods:18,modsOk:18,
    kw:+rr(31,35).toFixed(1),rm310:'RM310'};
  D.pods.push(pod);
}
for(let n=0;n<4;n++){
  const id='X'+(n+1);
  const nc={kind:'netcab',id,name:'互联柜 '+pad2(n+1),idx:n,status:'ok',dev:[],fans:6,
    pwr:{kind:'pwrbox',id:id+'-PW',name:'电源框',status:'ok',mods:6,modsOk:6,kw:+rr(6,9).toFixed(1)}};
  for(let s=0;s<4;s++){
    const did=id+'-D'+pad2(s+1);
    nc.dev.push({kind:'netdev',id:did,name:'灵衢互联设备 '+pad2(n*4+s+1),cab:id,idx:s,gidx:n*4+s,status:'ok',
      bw:Math.round(rr(72,86)),pwrp:Math.round(rr(36,58)),ber:rr(.2,1.6).toFixed(1),
      chipList:[0,1].map(i=>({kind:'ichip',id:did+'-C'+(i+1),name:'灵衢 L2 互联芯片 #'+(i+1),dev:did,idx:i,
        status:'ok',ports:128,rate:'400G',optics:128,bw:Math.round(rr(70,86)),pwrp:Math.round(rr(34,56)),temp:Math.round(rr(55,76))}))});
  }
  D.nets.push(nc);
}

/* 每张 NPU在每块灵衢互联刀片(SFU)上落在哪 2 颗 Union 芯片
   64 卡 × 2 = 128 条下行，均分到 20 颗 → 每颗约 6.4 条，分配得开 */
/* NPU 18 个端口的连接分配（左列 1-9 / 右列 10-18）
   1,4,5,6,7,8,9      → 其余 7 张 NPU（HCCS mesh）
   2,3 / 10,11 / 12,13 / 15,16 → 每 2 个一组接一块 SFU
   14,17              → 本板配对 CPU
   18                 → 空闲 */
const MESHP=[0,3,4,5,6,7,8];
const othersOf=i=>[0,1,2,3,4,5,6,7].filter(x=>x!==i);
const meshPortOf=(from,to)=>MESHP[othersOf(from).indexOf(to)];        // 对端 NPU 上的端口号
/* CPU 端口 ↔ NPU 映射（评审确认）：
   P01→NPU1  P02→NPU5   P03→NPU2  P04→NPU6
   P05→NPU3  P06→NPU7   P07→NPU4  P08→NPU8   P09→IO 刀片
   即每颗 CPU 都连全部 8 张 NPU，每张 1 条；NPU 侧 P14 接 CPU1、P17 接 CPU2 */
const cpuOfNpu=i=>Math.floor(i/4);                 // NPU 序号 → 所属 CPU（0/1）
const cpuPortsOf=i=>[(i%4)*2,(i%4)*2+1];           // NPU 序号 → 它在该 CPU 上的两个端口（0 起）
const cpuPortNpu=(c,q)=>c*4+Math.floor(q/2);       // CPU c 的端口 q(0-7) → NPU 序号
const unionPortOf=(cardIdx,u)=>((cardIdx*7+u)%18)+1;                  // Union 芯片上的端口号 1-18
/* ⚠ 下面的 0–17 是**代码里的连续序号**，不是卡上的编号。
   卡上是 2 颗 Udie、每颗各 9 个口：0–8 = Udie-A 的 P00–P08，9–17 = Udie-B 的 P00–P08。
   屏上一律按 A/B + P00–P08 显示（见 cardView 的 dieOf / pLbl）。
   代码序号 0 起：
   0,3,4,5,6,7,8      → 兄弟 NPU（mesh）
   1,2 / 9,10 / 11,12 / 14,15 → 每 2 个接一块 SFU（一个端口对应一颗 Union）
   13,16              → 本卡所属 CPU 的两个端口
   17                 → 空闲 */
/* ⭐ v3.30.2：Union 上行改成**一口一模块** —— Port 14→组内 LPO1、15→LPO2、16→LPO3、17→LPO4，
   每个口用 2 条 lane（屏上只标 `×2`，不再给 lane 逐条编号：8 个号在这一层是纯噪音，
   观众要回答的问题是「这个口去哪个光模块」，不是「第几条 lane」）。 */
/* 端口级故障：由 id 确定性推导，保证每次渲染一致（演示数据，无真实来源） */
/* 演示故障：全场只有 3 个光模块中断（v3 之前是每块灵衢互联刀片的 OSFP1 都断 = 64 个，太吵）。
   其中一个落在故障 SFU P11-S02 上，构成「光模块无光 → 该刀片上行中断」的因果链；
   另两个分散在别的柜，集群背面一眼能数出 3 个红点。 */
const OMBAD={'P11-S02':[0], 'P05-S01':[16], 'P14-S03':[7]};
const omBad=(sw,i)=>S.mode==='health'&&(OMBAD[sw.id]||[]).indexOf(i)>=0;
const swHasBadOm=sw=>!!(OMBAD[sw.id]||[]).length;
/* 端口级故障：由 id 确定性推导（演示数据，无真实来源）。
   ⚠ NPU内视图已不用它 —— 那一层的故障改成了 HBM 的多 bit ECC 隔离行数。 */
function pFail(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%29===5}
const uNo=c=>+c.id.split('-U').pop();          // Union **内部序号** 1–20（与数组下标不再一一对应）
const uByNo=(sw,u)=>sw.chipList.find(c=>uNo(c)===u);
/* ⭐ v3.30.2：内部序号 1–20 → 屏上的两段式编号。
   下行 1–16 → U1.1–U1.16　互联 17–20 → U2.1–U2.4。
   ⚠ 全屏只准从这两个函数出编号，不要再在别处拼 'U'+pad2(...)，否则又会出现两套说法。 */
const uLblNo=n=>n<=16?('U1.'+n):('U2.'+(n-16));
const uLbl=c=>c&&(c.lbl||uLblNo(uNo(c)));
/* ⭐ v3.30.2（评审意见 1）：光模块分组之后**只标组内序号 1–4**，全 8 组都是 LPO1–LPO4（v3.30.5 由 OSFP 改名）；
   要唯一指认时写全名「PIC3 · LPO2」。picNoG/picOfG 从 SFUL 里提上来，
   因为故障数据（D.alarms）在 SFUL 定义之前就要用到它。 */
/* ⭐ v3.30.3（评审意见 3）：**一个 PIC 组归同侧相邻的两颗 Union**，
   PIC1 ← U1.1 + U1.3（左组下标 0,1）　PIC3 ← U1.5 + U1.7　…　PIC2 ← U1.2 + U1.4（右组下标 8,9）…
   —— 左 8 颗吃左半边的 PIC1/3/5/7，右 8 颗吃右半边的 PIC2/4/6/8，连线不跨中线。
   v3.30.2 之前是「左组第 k 颗 + 右组第 k 颗共用」（PIC1 ← U1.1 + U1.2），线要横穿整块板。
   ⭐ v3.30.4（评审意见 2）：**互联 Union 不接光模块**（下标 ≥16 一律返回 -1）——
   它只往下汇聚本组的 8 颗下行 Union，整颗芯片没有上行侧。 */
const omGrpOf=i=>i<16?Math.floor(i/2):-1;      // 下行 Union 下标 0–15 → 光模块组下标 0–7；互联 Union 无
const unionsOfOmGrp=g=>[g*2, g*2+1];           // 光模块组下标 → 服务它的那 2 颗下行 Union 的下标
/* ⭐ v3.30.4：互联 Union 下标 → 它汇聚的那 8 颗下行 Union 的下标（同组）。
   16/17 服务左组（下标 0–7），18/19 服务右组（下标 8–15）—— 与 interOf 互为反函数。 */
const downsOfInter=i=>{const b=i<18?0:8; return [0,1,2,3,4,5,6,7].map(k=>b+k)};
/* ⭐ v3.30.5（评审意见 5）：**只有右组（偶号）下行 Union 连 RoCE板**。
   右组 8 颗（下标 8–15）：前 4 颗（U1.2/1.4/1.6/1.8）→ RoCE板 1，后 4 颗（U1.10–U1.16）→ RoCE板 2；
   每颗接 **2 个 芯片**。左组 8 颗不连 IO。
   ⚠ **口径推断，待架构师确认**：这 2 条走的是统一编号里空着的 **Port 9 与 Port 18** ——
     18 个口在 v3.30.2 已经排满（1–8 卡 / 10–13 互联 / 14–17 光模块 / 9、18 空闲），
     右组要多接 2 条，只有这两个口拿得出来。左组这两个口仍然空闲。 */
const IO_NICS=16;                                     // 每块 RoCE板的 芯片数（demo 建模口径，实物槽位图写 8 个网卡芯片）
const ioOfUnion=i=>(i>=8&&i<16)?(i<12?0:1):-1;        // 下行 Union 下标 → RoCE板序号（-1 = 不连）
const ioChipsOfUnion=i=>{const b=(i-8)%4; return [b*2,b*2+1]};   // → 该板上那 2 个 芯片的下标（0 起）
const IO_PORTS=[9,18];                                // 右组 Union 上接 RoCE板的两个口
/* RoCE板内只画**有连接关系的那 2 个**芯片，其余用省略号顶掉（评审意见 5）——
   16 个全画出来，每个只有 26px 宽，而这一页要回答的问题只是「这颗 Union 落在哪两个芯片上」。
   n=2 是省略号的位置，走同一个函数，间距才对得齐。 */
const IOCW=200, IOCH=80, IOCY0=76;
/* 2 个芯片 + 省略号（n=2）在板内居中：总宽 200+40+200+40+110 = 590 */
const ioChipX=(G,b,n)=>G.iox(b)+(G.ioW-590)/2+n*(IOCW+40);
const picNoG=g=>g<4?g*2+1:(g-4)*2+2;           // 组下标 0–7 → PIC 1/3/5/7/2/4/6/8
const picOfG=i=>picNoG(Math.floor(i/4));       // 光模块下标 0–31 → 它的 PIC 号
/* ⭐ v3.30.5（评审意见 3）：L1 的 32 个光模块口改名 **LPO**（OSFP 是封装形态，
   LPO 才是这块板上这批口的叫法）。只改 L1 —— L2（）那 128 个口不叫 LPO。 */
const omLbl=i=>'LPO'+(i%4+1);                  // 组内序号（屏上标的就是这个）
const omFull=i=>'PIC'+picOfG(i)+' · LPO'+(i%4+1);   // 唯一名
/* ⭐ v3.30.3（评审意见 5）：lane **退回 8 条**，与光模块的「交叉配对」是对的，只是不再编号。
   Port 14[lane a,b]　15[c,d]　16[e,f]　17[g,h]，按 laneToOm 交叉落到组内 4 个光模块：
   lane 1/3 → 组内 LPO1　2/4 → LPO2　5/7 → LPO3　6/8 → LPO4。 */
const laneToOm=i=>Math.floor(i/4)*2+(i%2);     // lane 槽位 0–7 → 组内光模块 0–3（交叉）
const laneUpPort=i=>UP_PORTS[Math.floor(i/2)]; // lane 槽位 0–7 → 它所属的上行端口号
const UP_PORTS=[14,15,16,17];                  // 上行：接光模块
const INTER_PORTS=[10,11,12,13];               // 接互联 Union（每个互联 Union 2 个口）
const IDLE_PORTS=[9,18];                       // 空闲
const interOf=grp=>grp?[18,19]:[16,17];        // 左组接互联 U2.1/U2.2，右组接 U2.3/U2.4（内部序号 17–20）
const MESHORDER=[1,4,5,2,3,6,7];                    // P0,P3,P4,P5,P6,P7,P8 依次指向的邻居偏移
const meshTarget=(i,n)=>(i+MESHORDER[n])%8;         // 主角卡 i 的第 n 个 mesh 端口 → 目标卡序号
/* 连线表（以 NPU0 为例，其余卡循环同构）：
   P0→NPU1.Port0   P1→SFU1.Union1  P2→SFU2.Union1  P3→NPU4.Port0  P4→NPU5.Port0
   P5→NPU2.Port0   P6→NPU3.Port0   P7→NPU6.Port0   P8→NPU7.Port0
   P9→SFU1.Union2  P10→SFU2.Union2 P11→SFU3.Union1 P12→SFU3.Union2
   P13→CPU板.CPU0.Port0   P14→SFU4.Union1  P15→SFU4.Union2   P16→CPU板.CPU0.Port0   P17 保留无链路 */
const PORTMAP=(()=>{const m={};
  [[0,0],[3,1],[4,2],[5,3],[6,4],[7,5],[8,6]].forEach(([q,n])=>m[q]={t:'npu',n});
  [[1,0,0],[9,0,1],[2,1,0],[10,1,1],[11,2,0],[12,2,1],[14,3,0],[15,3,1]]
    .forEach(([q,k,u])=>m[q]={t:'sfu',k,u});      // k=SFU 序号(0起) u=第几颗 Union(0起)
  m[13]={t:'cpu',w:0}; m[16]={t:'cpu',w:1};
  m[17]={t:'idle'};
  return m;})();
/* ⭐⭐ v3.27 修：这一行以前用的是 `cardIdx`，是**错的**（交接文档 二点五·矛盾 1，待办 #14）。
   权威口径在 SFU 侧（`sfuStage`）：下行 Union 的 `npuBlade = idx%8` ——
   **一块 NPU 刀片对应固定的 2 颗 Union**，编号 U(2b+1) / U(2b+2)（左组奇号 + 右组偶号）；
   那块刀片的 8 张卡各占这 2 颗 Union 的一个卡口（统一编号里的 Port 1–8）。
   自洽校验：16 下行 Union × 8 卡口 = 128 条 = 64 卡 × 2 ✓

   按卡序号算的话，只有「卡序号 == 刀片序号」的对角线上碰巧对，脚本枚举 8×8：**56/64 不一致**。
   例：P03-N05（刀片下标 4）的第 5 张卡，屏上高亮 U11/U12，而 SFU 视图里 U11/U12 服务的是刀片 5。
   ⚠ 这个错在 v3.27 之前是**隐形的** —— 刀片视图里 20 颗 Union 一个编号都没标，
     没人看得出高亮的是哪两颗。是「给高亮 Union 标号」这条评审意见把它逼出来的（踩坑 50）。

   ⚠ 参数 `_cardIdx` / `_sfuIdx` 就此**不再被使用**，故意留下并加下划线前缀 ——
     四个调用方都在传三个参数，删了要同时改四处；留一个看起来有意义的参数才是给下一个人挖坑。 */
function unionOf(bladeIdx,_cardIdx,_sfuIdx){
  return [bladeIdx*2+1, bladeIdx*2+2];   // 刀片0→U01/U02　刀片1→U03/U04 …　刀片7→U15/U16
}
/* 链路束：每个 Pod 的第 k 个灵衢互联刀片 → 第 k 个灵衢互联柜（假设，待确认） */
const LINKS=[];
D.pods.forEach(p=>{for(let k=0;k<4;k++)
  LINKS.push({id:p.id+'~X'+(k+1),from:p.id,swIdx:k,to:'X'+(k+1),lanes:8,bw:Math.round(rr(68,86)),status:'ok'})});
const LK=id=>LINKS.find(l=>l.id===id);

