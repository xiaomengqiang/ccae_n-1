/* ================== 视图：卡内（第三层） ================== */
const REGS=[
 ['0x0000','CHIP_ID','0x950A_0001'],['0x0018','DIE_STATUS','0x0000_0001'],
 ['0x0024','TEMP_SENSOR','—'],['0x0030','VOLT_CORE','—'],
 ['0x0048','ECC_CE_CNT','—'],['0x004C','ECC_UE_CNT','0x0000_0000'],
 ['0x0060','LINK_STATUS','0x0000_01FF'],['0x0074','FREQ_CUR','—'],
 ['0x0080','PWR_STATE','0x03 (P0)'],['0x0094','ERR_LOG_PTR','0x8000_1240']
];


/* ================== 视图：NPU内（原地放大 · 18 端口） ================== */
function cardView(){
  const v=S.view;
  const P=findPod(v.pod), b=P.npu.find(x=>x.id===v.blade);
  const k=b&&b.cards.find(x=>x.id===v.id);
  if(!k)return '';
  const ci=b.cards.indexOf(k), cpuB=P.cpu[b.idx], cpuIdx=Math.floor(ci/4);
  /* 兄弟卡按 mesh 端口顺序排列（P00,P03,P04…P08 的对端），连线从上到下单调、零交叉 */
  const A='#00E6A2', sibs=[0,3,4,5,6,7,8].map(q=>meshTarget(ci,PORTMAP[q].n)), others=sibs.map(i=>b.cards[i]);
  const sibPos=idx=>sibs.indexOf(idx);        // 目标卡在展示行里的位置
  const sel=S.sel||{};
  const selPort = sel.t==='dport' ? +sel.id.split('-P').pop() : -1;

  /* 楼层顺序统一为 SFU(上) → 本板[放大卡 + 7 张兄弟卡](中) → CPU(下) */
  const SY=170, SH=196, SW=510, SX=j=>800+j*585;   // 同 vNpuBlade：末个盒不能探出上层分区框
  const PX=2350, PW=750, PY=560, PH=590, PORTW=82, PORTH=40, PORTG=8;   // 端口间距 14→10：省出 32px 给两列顶上的 Udie 小标   // 主体收窄，18 条线在两侧散得开
  const RY=1030, RH=174, RW=174, RX=i=>680+i*225;     // 7 张兄弟卡：收到左半区，与左列端口同侧，mesh 线不折返
  const CY2=1390, CBH=306, CW2=760, CH2=174;
  const cpuTick=w=>(w?2658:2228);       // 正对右列（Udie-B）接 CPU 的两个口，且落在兄弟卡之间的空隙里
  const CPUX=(cpuTick(0)+cpuTick(1))/2-CW2/2, CPUY=CY2+52;
  const portY=q=>PY+118+(q%9)*(PORTH+PORTG);   // 118 = 面板标题 + Udie 小标之后
  const portX=q=>q<=8?PX-16:PX+PW-PORTW+16;             // 骑在面板左右边线上（一半在外）
  /* ⭐ 卡上**没有** P09–P17。一张 NPU = 2 颗 Udie，每颗各 9 个端口，各自 P00–P08。
     PORTMAP 的下标 0–17 只是代码里的连续序号，画到屏上必须还原成 A / B 两组 0–8。
     这个分组本身就有物理含义，不是随便切的：
       Udie-A（左，代码 0–8）  = 7 条节点内 HCCS mesh + 2 条下行 SFU
       Udie-B（右，代码 9–17） = 6 条下行 SFU + 2 条到本板 CPU + 1 个保留
     所以左右两列不是「一列的下半截」，是两颗芯片各自的对外口，必须分别标名。 */
  /* ⭐ v3.30.8（评审意见 3）：**5–8 号卡的两颗 Udie 左右是反的**（真机布局）。
     只翻**名字**，端口序号、连线、PORTMAP 一概不动 —— 左列永远是代码 0–8、右列 9–17，
     变的只是「左边这一列叫 A 还是叫 B」。
     ⚠ `dieOf` 是唯一出口：卡内视图的列标、端口全称 `pFull`、悬浮卡的 die 名都走它，
       改一处就全屏一致（改多处 = 屏上两套说法，坑 50 踩过）。 */
  const dieFlip = ci>=4;                                   // 卡序号 4–7（屏上 NPU 5–8）左右互换
  const dieOf=q=>(q<=8)!==dieFlip?'A':'B';
  const pLbl =q=>'P'+pad2(q%9);                          // 该 die 上的端口号
  const pFull=q=>'Udie-'+dieOf(q)+' · '+pLbl(q);        // 需要唯一指代时用全称
  const cpuP =cpuPortsOf(ci);                            // 本卡落在所属 CPU 上的两个端口（0 起）
  const portOut=q=>q<=8?portX(q):portX(q)+PORTW;
  const nptX=i=>RX(i)+RW/2;

  let s=head(`${P.name} · ${b.name} · ${k.name}`,
    '卡内连接视图 · 2 × Udie，各 9 端口（P00–P08）');

  /* ---- 分区容器先画（不透明标题条后画会压住线头）---- */
  s+=zone(110,SY-52,3060,SH+76,'上层 · 灵衢互联刀片');
  s+=zone(110,PY-120,3060,(RY+RH+80)-(PY-120),`本板 · ${b.name}`,bladePwrTag(b));
  s+=zone(110,CY2,3060,CBH,`下层 · ${cpuB.name}`);
  s+='<rect x="680" y="515" width="2440" height="706" rx="16" fill="#414141"/><rect x="750" y="1430" width="2370" height="224" rx="16" fill="#414141"/>';

  /* ---- 连线：端口 → 端口 ---- */
  const TGT=q=>{const m=PORTMAP[q];
    if(m.t==='npu')return b.cards[meshTarget(ci,m.n)].name+' · Udie-A · P00';   // mesh 落在对端 A 面
    /* ⚠ v3.27：原来写的是 `Union1` / `Union2` —— 那是**这一对里的第几颗**（0/1），
       不是 Union 的显示编号。现在刀片视图会把 `U09` / `U10` 标在芯片上，
       两处必须说同一个数，否则同一条连接在屏上有两套说法。 */
    if(m.t==='sfu')return '灵衢互联刀片'+pad2(m.k+1)+'（U'+(61+m.k)+'）'+' · '+uLblNo(unionOf(b.idx,ci,m.k)[m.u])+' · Port '+(ci+1);
    if(m.t==='cpu')return 'CPU '+(cpuOfNpu(ci)+1)+' · P'+pad2(cpuP[m.w]);
    return '空闲'};
  let L='';
  for(let q=0;q<=17;q++){
    const m=PORTMAP[q]; if(m.t==='idle')continue;
    const left=q<=8, ox=portOut(q), oy=portY(q)+PORTH/2;
    const on = selPort<0?null:selPort===q;
    const bad = false;                             // NPU的端口不再随机坏（故障已改到 HBM）
    const col = bad?colH('err'):A;                 // 本视图 = 这张卡的连接全景，正常一律绿、故障红
    const op  = on===false?.07:(on?1:.94), wd = (on||bad)?3.6:2.4;
    const sgn = left?-1:1;
    const rank = left ? q : (17-q);              // 越靠外的端口，控制点伸得越远 → 曲线扇形展开
    const up = m.t==='sfu';                       // SFU 在上层，兄弟 NPU 与 CPU 都在下方
    const cx1 = Math.max(130,Math.min(3130,ox + sgn*(90+rank*26)));
    const cy1 = oy + (up?-150:150);                // 出线即按上下分流，两束不互绞
    let d;
    if(m.t==='npu'){ const tx=nptX(sibPos(meshTarget(ci,m.n))), ty=RY-14;
      d=`M${ox},${oy} C${cx1},${cy1} ${tx},${ty-150-rank*10} ${tx},${ty}`; }
    else if(m.t==='sfu'){ const pair=unionOf(b.idx,ci,m.k);
      const tx=sfuUnionX(SX(m.k),SW,pair[m.u]), ty=SY+SH+14;
      d=`M${ox},${oy} C${cx1},${cy1} ${tx},${ty+240+rank*16} ${tx},${ty}`; }
    else { const tx=cpuTick(m.w), ty=CPUY-14;
      d=`M${ox},${oy} C${cx1},${cy1} ${tx},${ty-300} ${tx},${ty}`; }
    L+=link(d,col,wd,op);
  }
  const ZC=flushCaps();   // v3.30.9：分区标题的**字**进标签层，条留在容器层

  /* ---- 上游 CPU（带 2 个端口）---- */
  const myCpu=cpuOfNpu(ci);
  const onC = selPort<0?null:(selPort===13||selPort===16);
  /* 未与本卡相连的那颗 CPU 也画出来、置灰 —— 指标里统计了它（CPU x/2），
     画面就不能装作它不存在（虚线框 + 低不透明度 = 在这一页里但与本卡无连接） */
  const otherCpu=1-myCpu;
  let OX = myCpu===0 ? CPUX+CW2+150 : CPUX-CW2-150;   // 优先放在相连那颗的另一侧
  if(OX+CW2>3150) OX=CPUX-CW2-150;                    // 右边放不下就翻到左边
  if(OX<140)      OX=CPUX+CW2+150;
  OX=Math.max(140,Math.min(OX,3150-CW2));
  s+=`<g class="clk" data-act="cpu2" data-id="${cpuB.id}-U${otherCpu}" data-pod="${P.id}" data-blade="${cpuB.id}" opacity=".36">
    <rect x="${OX}" y="${CPUY}" width="${CW2}" height="${CH2}" rx="13" fill="#141C28" stroke="#3E546F" stroke-width="2" stroke-dasharray="11 8"/>
    <text x="${OX+CW2/2}" y="${CPUY+58}" fill="#7089A8" font-size="42" font-weight="700" text-anchor="middle">CPU ${otherCpu+1}</text>
    <text x="${OX+CW2/2}" y="${CPUY+100}" fill="#5C6F8E" font-size="22" text-anchor="middle" letter-spacing="1">与本卡无连接</text></g>`;
  s+=`<g class="clk" data-act="cpu2" data-id="${cpuB.id}-U${myCpu}" data-pod="${P.id}" data-blade="${cpuB.id}" opacity="${onC===false?.28:1}">
    <rect x="${CPUX}" y="${CPUY}" width="${CW2}" height="${CH2}" rx="13" fill="#22364F" stroke="#6FB3E0" stroke-width="2.2"/>
    <text x="${CPUX+CW2/2}" y="${CPUY+62}" fill="#E7EFFA" font-size="42" font-weight="700" text-anchor="middle">CPU ${myCpu+1}</text>

    ${''/* ⚠ 小标贴在谁身上就写谁的端口号。原来这里写的是 NPU 侧的 P13/P16，
           贴在 CPU 盒上等于说「CPU 的第 13 号口」—— CPU 一共才 9 个口。 */}
    ${portTick(cpuTick(0),CPUY,'P'+pad2(cpuP[0]),selPort===13)}${portTick(cpuTick(1),CPUY,'P'+pad2(cpuP[1]),selPort===16)}</g>`;
  /* ---- 兄弟 NPU（各 1 个端口）---- */
  others.forEach((kk,i)=>{
    const mq=[0,3,4,5,6,7,8].find(q=>meshTarget(ci,PORTMAP[q].n)===sibs[i]);
    const hot=selPort===mq;
    s+=`<g class="clk" data-act="npu" data-id="${kk.id}" data-pod="${P.id}" data-blade="${b.id}" opacity="${selPort>0&&!hot?.26:1}">
      <rect x="${RX(i)}" y="${RY}" width="${RW}" height="${RH}" rx="12"
        fill="${lyF(kk,'#22364F')}" fill-opacity="${lyO()}"
        stroke="${S.mode==='health'?colH(kk.status):devCol(kk)}" stroke-width="2"/>
      <text x="${RX(i)+RW/2}" y="${RY+RH/2+9}" fill="#E7EFFA" font-size="28" font-weight="700" text-anchor="middle">${kk.name}</text>

      ${portTick(nptX(i),RY,'A·P00',hot)}</g>`;
  });
  /* ---- 下游 SFU（顶边 Union 进线口）---- */
  /* ⭐ v3.30.1（评审意见 2）：**点一个端口，两端都要有号。**
     本侧的号本来就有（面板上那个 P03 方块自己就是）；缺的是**对侧**——
     这条线落在那颗 Union 的第几个下行 Port 上。
     口径：下行 Union 的 Port 1–8 一一对应它所服务刀片的 8 张卡
     （见 sfuStage 的下行面板：`Port 1–8 各接 … 的一张卡`）。所以本卡 ci 落在 **Port ci+1**，
     两颗 Union 是同一个号（同一张卡在两颗 Union 上占同序号的卡口）。
     写法写成「Port 2」而不是「P02」：Union 面板上那些格子标的就是统一编号 1–18，
     和 NPU侧的 P00–P08 是两套编号，**故意让它们长得不一样**，免得读串。
     ⚠ 只在选中端口时出现。没选端口时 4 个 SFU 各亮 2 颗 Union，标号会重复 8 次，等于没写。 */
  P.sw.forEach((sw,j)=>{
    const pair=unionOf(b.idx,ci,j);
    const pm = selPort>=0?PORTMAP[selPort]:null;
    const hot = !!(pm && pm.t==='sfu' && pm.k===j);
    const portOf = hot ? {[pair[pm.u]]:'Port '+(ci+1)} : null;
    // 选中某个端口时：只有目标 SFU 亮 1 颗 Union，其余 SFU 一颗都不亮
    s+=sfuBox(SX(j),SY,SW,SH,sw,j,{pod:P.id, below:true,
      pair: selPort<0 ? pair : (hot?pair:null),
      portOf,
      hot:false, only: hot?pm.u:null,
      dim: selPort>=0&&!hot?.26:1});
  });

  /* ---- 展开面板 + 18 端口 ---- */
  /* ⭐ v3.30.6（评审意见 6 后半）：**负载 / 能耗图层下整张 NPU都染色** ——
     原来只有里面那几个功能块跟着色阶走，卡本体永远是同一块 `#22364F`，
     于是「这张卡忙不忙」要靠读方块，而它自己就是被度量的那个器件。 */
  s+=`<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="18" fill="${lyF(k,'#22364F')}" fill-opacity="${lyO()}" stroke="${A}" stroke-width="2.8"/>`;
  /* ⚠ 面板上的文字统统放进 CAP，最后跟在连线后面画。
     18 条链路里有好几条要横穿整块面板去够左边的 SFU，画在文字上面就把标题和 Udie 小标切成两半。 */
  let CAP=`<text x="${PX+30}" y="${PY+54}" fill="#E7EFFA" font-size="32" font-weight="700">${k.name}</text>
    ${/* ⭐ v3.30.6（评审意见 6 前半）：**故障图层不出利用率**。
         这一层要回答的是「坏没坏」，利用率是另一层的度量 ——
         把它写在故障页上，观众会拿它当故障判据（「79% 算高吗？」）。
         负载 / 能耗层照常出各自那个数。 */''}
    ${/* ⭐ v3.30.8（评审意见 4）：负载 / 能耗图层下，**整卡的那个数要大**。
         19px 的「利用率 80%」在 2m 讲解位只有 16.6 arcmin，掉在可辨认线以下；
         而它正是这一层要观众读的**唯一一个整卡级读数**（卡本体已经跟着它染色了）。
         48px 粗体 + 色阶同色，和功能块里的小字拉开两级；「进程 N」退成上方的小标。 */''}
    ${S.mode==='health'
      ? `<text x="${PX+PW-30}" y="${PY+54}" fill="#A8CCE8" font-size="19" text-anchor="end">进程 ${k.procs}</text>`
      : `<text x="${PX+PW/2}" y="${PY+38}" fill="#8FA9C4" font-size="18" text-anchor="middle">进程 ${k.procs} · ${S.mode==='pwr'?'整卡功耗':'整卡利用率'}</text>
         <text x="${PX+PW/2}" y="${PY+86}" fill="${devCol(k)}" font-size="46" font-weight="700" text-anchor="middle"
           font-variant-numeric="tabular-nums" paint-order="stroke" stroke="#0D1928" stroke-width="8"
           stroke-linejoin="round">${S.mode==='pwr'?k.pwr+' W':k.util+'%'}</text>`}`;
  /* ⚠ 这个大数放**正中**不放右上角：右上角正是 Udie 列标的位置（PY+97），
     46px 的数字一放上去两个就叠在一起（第一版踩过）。正中这一带上下都是空的。 */
  for(let q=0;q<=17;q++){
    const m=PORTMAP[q], idle=m.t==='idle', on=selPort<0?null:selPort===q;
    const bad=false;                          // 端口不再随机坏（原 pFail 哈希故障已删）
    const px=portX(q), py=portY(q);
    const bc = bad?colH('err'):(on===true?A:(idle?'#4E7BA8':m.t==='cpu'?'#A8CCE8':'#6FB3E0'));
    s+=`<g class="clk" data-act="dport" data-id="${k.id}-P${q}" data-pod="${P.id}" data-blade="${b.id}" data-card="${k.id}" opacity="${on===false?.34:1}">
      <rect x="${px}" y="${py}" width="${PORTW}" height="${PORTH}" rx="9" fill="${bad?'#2A1017':(on===true?'#0F2A24':'#1A2C42')}"
        stroke="${bc}" stroke-width="${on===true||bad?3.4:2}" stroke-dasharray="${idle?'6 5':'none'}"/>
      <text x="${px+PORTW/2}" y="${py+28}" fill="${idle?'#8FA9C4':'#E7EFFA'}" font-size="23" font-weight="500" text-anchor="middle">${pLbl(q)}</text></g>`;
  }
  /* ---- 两列端口的 Udie 归属小标 ----
     左右各 9 个口的编号是一样的（P00–P08），不标 die 就是两组同名端口，指不明白是哪一个。
     小标压在端口列正上方、与列同宽居中，字号 22（> 12px 下限，审计通过）。 */
  [[dieOf(0),portX(0)],[dieOf(9),portX(9)]].forEach(([dn,dx])=>{
    CAP+=dieCap(dx+PORTW/2, PY+97, 'Udie-'+dn, '#22364F');
  });
  /* ---- 内部功能块 ---- */
  const BX=PX+116, BW=PW-232, BH=100, BG=18, BY0=PY+110, HW=(BW-BG)/2;
  /* HBM 的多 bit ECC 隔离行数打满 = 该功能块故障（原来是 18 个端口里随机红一个，讲不出影响） */
  const hbmBad = S.mode==='health' && k.status!=='ok' && (k.mem.ecc_iso||0)>0;
  const blk=(x,y,w,h,nm,sub,tip,lv,bad)=>`<g class="clk" data-act="blk" data-id="${k.id}-B${nm}" data-pod="${P.id}" data-blade="${b.id}" data-card="${k.id}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"
        fill="${bad?'#2A1017':(S.mode==='health'?'#1A2C42':heat(lv))}" fill-opacity="${bad||S.mode==='health'?1:.45}"
        stroke="${bad?colH('err'):(S.mode==='health'?'#6FB3E0':heat(lv))}" stroke-width="${bad?3:1.8}"/>
      <text x="${x+24}" y="${y+52}" fill="#E7EFFA" font-size="27" font-weight="500">${nm}</text>
      <text x="${x+24}" y="${y+82}" fill="#DCEBFA" font-size="22" font-weight="500">${sub}</text>
      ${tip?`<text x="${x+w-28}" y="${y+56}" fill="${A}" font-size="17" text-anchor="end">${tip}</text>`:''}</g>`;
  // 第一排：HBM 通排；第二排：AI Cube + AI Vector；第三排：Control CPU + AI CPU。小字一律给负载
  /* ⭐ v3.30.6：故障图层下功能块**只出名字**，不出利用率（同上一条）。
     唯一的例外是 HBM 的「多 bit ECC 隔离行 64/64」—— 那不是利用率，那就是这条故障本身。 */
  const _hm=S.mode==='health';
  s+=blk(BX,BY0,BW,BH,'HBM',hbmBad?`多 bit ECC 隔离行 ${k.mem.ecc_iso} / 64`:(_hm?'':`带宽占用 ${k.mem.bwUse}%`),'',k.mem.bwUse,hbmBad);
  s+=blk(BX,BY0+BH+BG,HW,BH,'AI Cube',_hm?'':`利用率 ${k.cube}%`,'',k.cube);
  s+=blk(BX+HW+BG,BY0+BH+BG,HW,BH,'AI Vector',_hm?'':`利用率 ${k.vec}%`,'',k.vec);
  s+=blk(BX,BY0+(BH+BG)*2,HW,BH,'Control CPU',_hm?'':`占用 ${k.ctl}%`,'',k.ctl);
  s+=blk(BX+HW+BG,BY0+(BH+BG)*2,HW,BH,'AI CPU',_hm?'':`占用 ${k.acpu}%`,'',k.acpu);
  /* ⚠ v3.27 发现：`info` 算出来之后**一处都没用**（`grep '${info}'` 为空）——
     它是删掉 `.kscope` 说明行时留下的孤儿，和 `LAYERHINT` / `LAYERNAME` 同一批。
     连带 `TGT()` 也随之成为死代码（唯一调用方就是这里）。
     顺手把它的 `Union1/2` 改成真编号了（保持全屏一套说法），但**清理时两个一起删**。
     真正在屏上讲「这个口连到哪颗 Union」的是 dport 的悬浮卡（popContent 里的 `tn`）。 */
  const info = selPort>=0
    ? `${pFull(selPort)} → ${TGT(selPort)}`
    : `2 × Udie 各 9 端口：A 面 7 → 兄弟 NPU、2 → 灵衢互联刀片　B 面 6 → 灵衢互联刀片、2 → 所属 CPU、1 保留`;
  /* 故障气泡：挂在 HBM 功能块上（这条故障的根因器件） */
  let bub='';
  /* 药丸贴在 HBM 块右侧、与它同一水平线 —— 卡内视图两侧都是端口列，只有面板外侧有空 */
  bubFor('npucard',k.id).forEach(bb=>bub+=alarmBubble(bb,BX+BW,BY0+BH/2,{pillX:PX+PW+34,pillY:BY0+BH/2-25}));
  const PCAP=flushSfuCap();   // ⚠ 必须取出来（顺带清空），否则会漏到下一页去（画面上凭空多一颗药丸）
  return s+L+ZC+CAP+PCAP+bub;  // 连线浮在外框之上，面板文字与对侧端口药丸再浮在连线之上
}

