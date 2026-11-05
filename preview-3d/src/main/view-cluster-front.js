/* ================== 视图：集群 · 正面 ================== */
function clusterFront(){
  let backL='', linkL='', frontL='';
  // back panels
  D.pods.forEach((p,i)=>{const x=slotX(podSlot(i));
    backL+=shell(x,CY,CW,CH,{border:'#1B2942',dim:1}).back});
  D.nets.forEach((n,i)=>{const x=slotX(netSlot(i));
    backL+=shell(x,CY,CW,CH,{border:'#1B2942',dim:1}).back});

  // links —— 从背板顶边发出（视觉上"从后面接出去"）
  const fp = S.sel ? (S.sel.t==='pod'?S.sel.id:(S.sel.pod||null)) : null;
  const fn = S.sel && S.sel.t==='netcab' ? S.sel.id : null;
  const arcs=[];
  LINKS.forEach(l=>{
    const pi=D.pods.findIndex(p=>p.id===l.from);
    const x1=slotX(podSlot(pi))+DEP+CW/2, x2=slotX(netSlot(+l.to[1]-1))+DEP+CW/2;
    const yb=CY-DEP;
    const dist=Math.abs(x2-x1), h=80+dist*0.085;
    const f = !S.sel ? null : (l.from===fp || l.to===fn);
    const err=S.mode==='health'&&l.status==='err', hot = err && f!==false;
    let c=hot?colH('err'):linkLayer(l.bw);
    let o=hot?.95:(S.mode==='health'?.34:.55);
    let wd=hot?5:1.6+(l.bw/100)*2.8;
    if(f===true){o=.95;wd=hot?5:3;c=hot?colH('err'):linkHot()}
    if(f===false){o=.05;wd=1.1}
    arcs.push({d:`M${x1},${yb+26} C${x1},${yb-h} ${x2},${yb-h} ${x2},${yb+26}`,c,w:wd,o,err:hot});
  });
  arcs.sort(a=>a.err?1:-1);
  if(!MINI)arcs.forEach(a=>linkL+=`<path d="${a.d}" fill="none" stroke="${a.c}" stroke-width="${a.w}" opacity="${S.biz?a.o*0.25:a.o}"
    class="flow" stroke-linecap="round"/>`);

  // fronts
  D.pods.forEach((p,i)=>frontL+=podFront(p,slotX(podSlot(i))));
  D.nets.forEach((n,i)=>frontL+=bizWrap(netFront(n,slotX(netSlot(i)))));   // 互联柜与业务无关，业务视角下压暗

  let s=backL+linkL+frontL;
  if(MINI)return s;
  /* ── 首页故障锚点：正面 3 张故障 NPU（v3.21.6 改）──────────────────
     不再在这里出一张独立的 SVG 故障卡片。**器件卡和故障卡合成一张**：
     悬浮故障刀片弹出的就是那块刀片的通用指标卡，故障信息作为 note 挂在同一张卡里
     （见 popContent 的 case 'npublade'）。两张卡讲同一块板，本来就该是一张。

     这里只留「红点 + 呼吸红晕」指路 —— 它标的是**哪一张卡**坏了，粒度比刀片更细，
     刀片自己的红描边说不出这件事。

     ⚠ 整组 pointer-events:none：以前这里盖了一块 data-act="bubgo" 的透明命中区，
     把整块刀片罩住，于是首页点一下就直接跳到最底层的卡内视图 —— 既跳过了
     「双击才下钻」的规则，也跳过了中间的刀片视图。现在事件穿透到下面刀片自己的命中区：
       点板卡（双击）→ 下钻一层，到刀片视图
       点悬浮卡片里的「下钻到 …」→ 才直达最底层的卡内视图 */
  const ANC=[];      // 开场态药丸的锚点（顺手在画红点时收集，位置口径只有一份）
  if(S.mode==='health'){
    D.pods.forEach((p,pi)=>p.npu.forEach((b,bi)=>{ if(!BIZON(b))return;
      b.cards.forEach((k,ki)=>{ if(k.status==='ok')return;
        const x=slotX(podSlot(pi)), IW=CW-PADI*2;
        const CN=8, cw=14, cg=(IW-16-CN*cw)/(CN-1), cx0=x+PADI+8;
        const ax=cx0+ki*(cw+cg)+cw/2, ay=npuRowY(bi)+28;
        s+=`<g class="bub" pointer-events="none">
          <circle class="halo" cx="${ax}" cy="${ay}" r="13" fill="#FF4D6D" opacity=".45"/>
          <circle cx="${ax}" cy="${ay}" r="4.5" fill="#FF4D6D"/></g>`;
        const bb=bubAt('npucard',k.id); if(bb)ANC.push({b:bb,ax,ay});
      })}));
  }
  s+=`<rect x="0" y="${CY+CH+22}" width="${VW}" height="9" rx="5" fill="#0D1929"/>`;
  s+=`<text x="${slotX(0)+(CW*8+CGAP*7)/2}" y="${CY+CH+66}" fill="#5C6F8E" font-size="23" text-anchor="middle" letter-spacing="4">计算柜 01 – 08</text>`;
  s+=`<text x="${slotX(8)+(CW*4+CGAP*3)/2}" y="${CY+CH+66}" fill="#5C6F8E" font-size="23" text-anchor="middle" letter-spacing="4">互联柜 01 – 04</text>`;
  s+=`<text x="${slotX(12)+(CW*8+CGAP*7)/2}" y="${CY+CH+66}" fill="#5C6F8E" font-size="23" text-anchor="middle" letter-spacing="4">计算柜 09 – 16</text>`;
  s+=legend(false);
  if(introShow())s+=introPills(ANC);     // 开场态药丸最后画 → 浮在柜体之上
  return s;
}
function podFront(p,x){
  /* 正面不给整柜描边：柜内的故障器件本身就是红的，再套一圈红框是重复故障 */
  const sel=S.sel&&S.sel.id===p.id;
  let s=shell(x,CY,CW,CH,{border:'#22354E',sel,dim:1}).front;
  s+=`<rect class="clk" data-act="pod" data-id="${p.id}" x="${x}" y="${CY}" width="${CW}" height="${CH}" fill="transparent"/>`;
  const IW=CW-PADI*2;
  let y=CY+PADI;
  // ⓪ 柜名条（在电源框上方，避免电源框被误读成柜名）
  // 柜级计数用「节点」——调度的最小下发单位是节点，不是卡
  const _bn=(S.biz&&!MINI)?bizNdIn(p,S.biz):0;
  s+=nameBar(x,y,p.id,'计算柜 '+pad2(p.idx+1),null,false,_bn||null);
  y+=NAMEH+4;
  // ① 电源框
  s+=bizWrap(pwrBox(x,y,p.pwr,p.name,`data-pod="${p.id}"`)); y+=PWRH+4;
  // ② 灵衢管理刀片
  s+=bizWrap(slab(x,y,30,'管理刀片',AUX.fill,AUX.stroke,AUX.txt,19,'mgmtblade',p.mgmt.id,`data-pod="${p.id}"`,p.mgmt.status)); y+=33;
  // ③ CPU 计算刀片 × 4（两颗 CPU 居中，纯色块）
  /* CPU 刀片属于节点的一半，业务命中时和 NPU 刀片一起亮 —— SE 口径：1 节点 = 8 NPU + 2 CPU */
  const cpuBlade=(b,yy)=>{
    /* ⭐ 选中业务后，不属于它的器件连「红」都不给：压暗到 .16 的红点还是红点，
       屏上仍然是十来处红在闪，一眼看不出「这个业务自己到底有没有事」。
       业务视角回答的是「这个业务健不健康」，别的业务的故障不是这一屏的内容。 */
    const on=BIZON(b), bs=on&&b.status!=='ok';
    const soc=S.mode==='health'?(bs?colH(b.status):'#1E4A72'):devCol(b);
    /* 两颗 CPU 芯片在刀片内居中；不再写 "CPU" —— 与 NPU 刀片一致，形态本身就说明了是什么 */
    const sw=40, gp=16, x0=x+PADI+(IW-(sw*2+gp))/2;   // 40*2+16=96 ≤ IW134
    const hi=S.biz&&on&&!badF(bs);
    const g=`<g class="clk" data-act="cpublade" data-id="${b.id}" data-pod="${p.id}">
      <rect x="${x+PADI}" y="${yy}" width="${IW}" height="36" rx="6" fill="#0D1928"
        stroke="${badF(bs)?colH(b.status):hi?'#00E6A2':'#1A2B44'}" stroke-width="${badF(bs)?2:hi?1.8:1}"/>
      ${[0,1].map(i=>{const bx0=x0+i*(sw+gp);
        /* v3.21.5：CPU 就是一块纯色横条，不再往里叠一块深色「内核」。
           形状已经把话说完了 —— NPU 是竖着的小方块（14×24）、CPU 是横着的宽条（40×19），
           两者在同一柜里上下相邻，一眼就分得开；内核那块黑反而在暗底上糊成一个洞。
           ⚠ 不用换色区分 —— 颜色只表达状态（原则 ①）。 */
        return `<rect x="${bx0}" y="${yy+9}" width="${sw}" height="19" rx="3" fill="${soc}"/>`;
      }).join('')}</g>`;
    return on?g:`<g opacity=".16">${g}</g>`;
  };
  /* ⭐ v3.23.0：绘制顺序按真实槽位图（自下而上 13→31），所以**从上往下画的是大号板**：
     顶部 CPU 板 8→5（槽 31–28）、RoCE 板 2（27）、NPU 板 8→5（26–23）、
     NPU 板 4→1（21–18）、CPU 板 4→1（17–14）、RoCE 板 1（13）。槽位 22 是假板卡，不画。
     以前是「板 1 在最上」，和机房里的编号方向正好相反 —— 讲解时按编号找板会找反。 */
  p.cpu.slice(4).reverse().forEach(b=>{s+=cpuBlade(b,y); y+=38});
  // ④ RoCE / RoCE板（上面那块 = 板 2 · 槽 27）
  /* 柜内条上只写类别，不写 U 号：柜宽 134px，写「U13 RoCE板01」字号必然掉到 12px 以下。
     NPU / CPU 刀片在首页本来就没有文字标签（靠位置认），只给 RoCE 加编号反而不一致。
     编号在悬浮卡、左树、详情页里给 —— 那三处都是要读的地方。 */
  const ioBlade=(b,yy)=>slab(x,yy,28,'RoCE板',AUX.fill,AUX.stroke,AUX.txt,18,'ioblade',b.id,`data-pod="${p.id}"`,b.status);
  s+=bizWrap(ioBlade(p.io[1],y)); y+=31;
  // ⑤ NPU 计算刀片 × 8：整板 = 刀片，板上 8 颗芯片（方形，非条状）
  const CN=8, cw=14, cg=(IW-16-CN*cw)/(CN-1), cx0=x+PADI+8;   // 校验：14*8+16=128 ≤ IW134  // 无前缀文字，8 颗芯片铺满整条刀片
  NPUY0=y;                                                    // 首页气泡的引线要落到具体某张卡，位置从这里取
  /* ⚠ 数组是「板 1 → 板 8」，画的时候要倒过来（板 8 在上）；
     NPUY0 之后按「屏上第几条」取 y，所以别的地方引用刀片位置时用 npuRow(b) 换算，别直接用 idx。 */
  [...p.npu].reverse().forEach((b,row)=>{   // row 0 = 屏上最上面 = 板 8
    /* 分配以整块刀片（节点）为单位，所以高亮描边给容器，而不是逐颗芯片描一圈 —— 
       八个小方块各自套框会糊成一片，框在板上反而一眼看出「这是一个节点」 */
    /* 选中业务后，别的业务的故障 / 极值一律不上色（同 cpuBlade 的注释） */
    const bOn=BIZON(b), bs=bOn&&b.status!=='ok', hb=bOn&&hotIn(b), bHi=S.biz&&bOn&&!badF(bs);
    /* ⚠ 外圈光晕只能有一种颜色，按优先级取：故障 > 极值 > 业务归属。
       之前故障刀片的红边外面还套着业务高亮的绿圈，看起来像红框有绿重影。
       原则 ⑦：红色是稀缺资源 —— 它出现时，别的高亮一律让位。 */
    const haloC = badF(bs)?colH(b.status) : hb?HOTC() : bHi?'#00E6A2' : null;
    const haloO = badF(bs)?.34 : hb?.42 : .55;
    s+=`<g class="clk" data-act="npublade" data-id="${b.id}" data-pod="${p.id}" opacity="${bOn?1:.16}">
      ${haloC?`<rect x="${x+PADI-3}" y="${y-3}" width="${IW+6}" height="${NPU_H+6}" rx="9" fill="none"
        stroke="${haloC}" stroke-width="1.5" opacity="${haloO}"/>`:''}
      <rect x="${x+PADI}" y="${y}" width="${IW}" height="${NPU_H}" rx="6" fill="#0D1928"
        stroke="${badF(bs)?colH(b.status):hb?HOTC():bHi?'#00E6A2':'#1A2B44'}" stroke-width="${badF(bs)?2:hb?2.6:bHi?1.8:1}"/>
      ${b.cards.map((k,j)=>{const c=S.mode==='health'?((!bOn||k.status==='ok')?'#1E6B65':colH(k.status)):devCol(k);
        return `<rect x="${cx0+j*(cw+cg)}" y="${y+15}" width="${cw}" height="24" rx="3" fill="${c}"/>`}).join('')}
      </g>`;
    y+=NPU_STEP;
    /* ⭐ 槽位 22 是**假板卡**（填充板，不是器件），首页**不画**。
       试过画成虚线空条：它没有任何指标、不能点、不能有状态色，屏上就是一条读不出信息的横杠，
       观众只会问「那条是什么」。加字更糟 —— 柜宽 134px 塞进去必然 <12px，
       审计当场多出 48 处对比度不达标（见踩过的坑 35）。
       槽位号照常按真实映射给（18–21 / 23–26，跳过 22），只在悬浮卡和详情页里出现。 */
  });
  // ⑥ CPU 计算刀片 × 4（板 4→1，槽 17–14）
  p.cpu.slice(0,4).reverse().forEach(b=>{s+=cpuBlade(b,y); y+=38});
  // ⑦ RoCE / RoCE板（下面那块 = 板 1 · 槽 13）
  s+=bizWrap(ioBlade(p.io[0],y));
  return s;
}
function netCab(n,x){
  const sel=S.sel&&S.sel.id===n.id;
  let s=shell(x,CY,CW,CH,{border:'#1E5A5D',sel,dim:1,fill:'#071620',topFill:'#123245',sideFill:'#08161F'}).front;
  s+=`<rect class="clk" data-act="netcab" data-id="${n.id}" x="${x}" y="${CY}" width="${CW}" height="${CH}" fill="transparent"/>`;
  let y=CY+PADI;
  s+=nameBar(x,y,n.id,n.name,null,true); y+=NAMEH+6;
  s+=pwrBox(x,y,n.pwr,n.name,`data-cab="${n.id}"`); y+=PWRH+8;
  const bot=CY+CH-PADI-8;            // v3.30：柜底不再留 40px 给风扇色块，4 台设备平分到底
  const boxH=(bot-y-36)/4;
  n.dev.forEach((d,j)=>{ s+=netDevBox(x+PADI,y+j*(boxH+12),CW-PADI*2,boxH,d,n.id) });
  /* ⛔ v3.30 删掉柜底那条「风扇模块 ×6」色块。
     风扇现在是**设备级**的：正面每台 L2 画 6 个圆圈（fanFace），一柜 4 台 = 24 个。
     柜底再挂一条「×6」，同一个柜里就有两套风扇，观众会问「到底几个」；
     而且那条色块是一条文字，本来就「数不出来 6 个」，违反判据。
     ⚠ 副作用：全场风扇口径由「4 柜 × 6 = 24」变成「16 台 × 6 = 96」，
       交接文档 二点五 的器件表要同步改，真机若是柜级风扇需回退这一条。 */
  return s;
}
const netFront=netCab;

/* ================== 故障气泡 ==================
   规则：**一条故障 = 一个气泡，只挂在根因设备上**，不在受影响的下游器件上重复冒泡
   （原则 3 的延伸：故障不沿通路传播，气泡也不跟着传播）。
   收起态只露故障名；鼠标悬浮展开「影响分析 / 涉及的推理服务 / 处理建议 / 时间」。
   纯 SVG + CSS `:hover` —— 不进 render 状态机，所以不用担心重绘打断展开态；
   另外 setInterval 里加了 bubHover 闸门，悬浮时暂停整屏刷新（否则每 3.2s 闪一下）。 */
/* 同一类故障用同一套文案，只有位置与时间不同 —— 现场讲解不用记两套说辞。
   卡片不再有「处理建议」块：处置动作直接并进影响分析的最后一句，版面更干净。 */
/* ⚠ 卡 ↔ 业务是一对一：每张卡只承载一个推理服务/训练任务（见 BIZ 分配）。
   所以卡级故障的 svc 恒为单个，且必须与该卡的 biz 一致；
   互联刀片（链路）故障落在哪个柜，就写那个柜承载的那一个业务。
   训练任务用 svcLabel 换标签，别把「盘古预训练」塞在「推理服务」标题下。 */
const BUBBLES=[
 { key:'ill-p05', at:{v:'swblade', id:'P05-S01'}, ts:'2026-08-15 09:41:22',
   name:'接口非法报文故障', sev:'重要',
   impact:['该光模块口出现非法报文，可能会导致','端侧掉卡或者宕机'],
   fix:['隔离该光模块口，更换后重新拉起链路'],
   svcLabel:'涉及的训练任务', svc:['盘古大模型 · 预训练'] },
 { key:'ill-p11', at:{v:'swblade', id:'P11-S02'}, ts:'2026-08-15 09:38:07',
   name:'接口非法报文故障', sev:'重要',
   impact:['该光模块口出现非法报文，可能会导致','端侧掉卡或者宕机'],
   fix:['隔离该光模块口，更换后重新拉起链路'],
   svcLabel:'涉及的训练任务', svc:['悟空多模态 · 微调'] },
 { key:'ill-p14', at:{v:'swblade', id:'P14-S03'}, ts:'2026-08-15 10:07:54',
   name:'接口非法报文故障', sev:'重要',
   impact:['该光模块口出现非法报文，可能会导致','端侧掉卡或者宕机'],
   fix:['隔离该光模块口，更换后重新拉起链路'],
   svc:['DeepSeek-R1'] },
 { key:'hbm-k1', at:{v:'npucard', id:'P03-N05-K1'}, go:{t:'npu',id:'P03-N05-K1',pod:'P03',blade:'P03-N05'}, ts:'2026-08-15 09:12:31',
   name:'HBM ECC 隔离行数达上限', sev:'紧急',
   impact:['HBM 多 bit ECC 隔离行数已达 64 个上限，','新增多 bit 错误将无法隔离，会导致','启动失败或业务失败'],
   fix:['尽快更换该 NPU'],
   svcLabel:'涉及的训练任务', svc:['盘古大模型 · 预训练'] },
 { key:'hbm-k3', at:{v:'npucard', id:'P14-N05-K3'}, go:{t:'npu',id:'P14-N05-K3',pod:'P14',blade:'P14-N05'}, ts:'2026-08-15 08:26:15',
   name:'HBM ECC 隔离行数达上限', sev:'紧急',
   impact:['HBM 多 bit ECC 隔离行数已达 64 个上限，','新增多 bit 错误将无法隔离，会导致','启动失败或业务失败'],
   fix:['尽快更换该 NPU'],
   svc:['DeepSeek-R1'] }
 /* ⛔ v3.26.1 删除 temp-k6「NPU 结温过高 · P15-N02-K6」—— 正面只留 2 处故障。
    现在是 **5 处故障 ↔ 5 个气泡 ↔ 5 条故障**（正面 2 / 背面 3），仍然一一对应。
    规则 3「每一处故障都要有气泡，一个都不能漏」反过来也成立：
    **每个气泡都必须有一处真故障** —— 删故障时 BUBBLES 要同步删，
    否则屏上会浮出一颗指着健康器件的药丸。 */
];
const bubFor=(v,id)=>BUBBLES.filter(b=>S.mode==='health'&&b.at.v===v&&b.at.id===id);
/* ── 半融合（v3.22）：故障器件**自己的**悬浮卡也讲故障故事 ──
   之前悬浮红器件只出通用指标卡，「影响分析 / 处理建议」只藏在药丸展开卡里 —— 观众未必知道
   要去悬浮药丸。现在两个入口讲同一个故事，数据同源（BUBBLES），改文案只改一处。
   药丸气泡保留原机制：常驻寻路 + 点击直达根因 + 首页 bare 模式，纯 CSS hover 不受重绘影响。 */
function bubNote(b){ if(!b)return null;
  return {t:b.name, tag:'● '+b.sev+'故障', sev:'err',
    l:[ b.impact.join(''),
        (b.svcLabel||'涉及的推理服务')+'：'+b.svc.join('、'),
        '首次上报 '+b.ts ],
    fix:(b.fix||[]).join('；')}; }
const bubAt=(v,id)=>BUBBLES.find(b=>b.at.v===v&&b.at.id===id);
/* ⭐ 机柜级故障汇总（v3.21.9）—— 最外层那张卡也要能自己讲完故障故事。
   以前只有刀片 / 卡 / 光模块三级有故障叙述，而观众在集群首页最先悬浮到的恰恰是**机柜**，
   那张卡却只有「NPU 平均算力 / 机柜功耗 / 出水温度」四个数，一个字都没提这柜里有故障。
   （同 v3.21.8 那条教训：功能要写在人碰得到的那一层。）
   返回 [{器件, 故障, 影响业务, 处理建议, 时间, go}]，正面背面都扫。 */
function podFaults(pod){
  const out=[];
  pod.npu.forEach(bl=>bl.cards.forEach(k=>{ if(k.status==='ok')return;
    const b=bubAt('npucard',k.id); if(!b)return;
    out.push({face:'正面', dev:bl.name+' · '+k.name, b, go:b.go||{t:'npu',id:k.id,pod:pod.id,blade:bl.id}});
  }));
  pod.sw.forEach(sw=>{ const b=bubAt('swblade',sw.id); if(!b)return;
    const port=(OMBAD[sw.id]||[]).map(i=>omFull(i)).join('、');
    out.push({face:'背面', dev:sw.name+(port?' · '+port:''), b, go:null});
  });
  return out;
}

/* ══════════ 集群首页的「开场态」故障药丸（v3.25）══════════
   之前的口径是「气泡不放首页 —— 集群层只看得到哪儿有红点，讲不清影响面」。
   展会场景推翻了它：大屏多数时间**没人操作**，观众远远看过来，
   1024 张卡里三个 4.5px 的红点等于没说话 —— 「有故障」传达到了，「是什么故障」没有。

   所以改成**开场态**：进首页默认把药丸铺出来（只出药丸，不出展开卡），
   观众一眼读到故障名；**只要有人动手（悬浮 / 点击 / 换图层 / 换视角）就整批让路**，
   把画面还给操作者。这不是「常驻标注」，是一个会自己退场的开场白。

   三条约束（改之前先读）：
   ① **只在故障图层出**。红色是稀缺资源，负载 / 能耗层一个药丸都不能有。
   ② **只出当前这一面的故障**。正面 3 条（NPU），背面 3 条（光模块口）——
      把背面的故障标在正面的柜子上，指的位置是假的。
   ③ **退场必须可逆**。讲解员一挥鼠标就没了、再也回不来的话，这个功能只能用一次。
      回到集群层（返回 / 退出聚焦 / 换视角）、或在集群层重新点「故障」tab，都会重新布防。

   ⭐ v3.26 两处改动（评审意见，两条是**耦合的**，别只做一半）：
   ⓐ **药丸从柜顶横带挪到机柜前面，贴着故障那一行**。
      老版药丸行在 y=158–366，而正面锚点落在 y≈950 / 1130 —— 引线全长 590–770px、
      斜穿 3–5 个机柜，而线本身只有 1.8px / opacity .5：按原则 9 的口径它在 2m 讲解位
      基本等于不存在。于是屏上其实是割裂的两件事（上面三条故障、下面三个红点），
      配对关系交给观众自己猜。现在药丸与故障行同高、横向紧邻，**引线只剩 26px 一小截**。
      遮挡是有意接受的：故障图层里被盖住的是一片健康的绿方块，那不是这一屏要说的内容。
      **但红点不能盖** —— 药丸文字里只有故障名，位置信息的唯一载体就是那个红点。
   ⓑ **退场从「整批」改成「逐个」**（实现见 bubEnter / bubLeave）。
      这不是顺手的优化，是 ⓐ 的前提：药丸一旦浮到机柜前面，鼠标要够到药丸**必然先经过机柜**，
      而老规则是「悬浮到任何器件 → 三颗整批退场」—— 还没碰到药丸三颗就全没了。 */
let INTRO=true;                       // 开场态是否还立着
const introShow=()=>INTRO && S.mode==='health' && S.view.lv==='cluster' && !S.zoom;
/* 重新布防（只改标志，由调用方决定何时 render）。
   ⚠ v3.26：必须连 BUBSEEN 一起清 —— 否则「回到集群层三颗全回来」这条承诺会变成
   「只回来没看过的那几颗」，讲解员第二遍讲就少了词。 */
function introArm(){ INTRO=true; BUBSEEN.clear() }
/* ⚠ v3.26 起 introOff() 只剩「点击 = 整批退场」这一个语义，而 stage 的 click 里
   直接写的 INTRO=false（后面的分支都会 render），所以这个函数目前**无调用方**。
   留着是因为下一次要加「切图层 / 切视角时显式让路」还会用到它 —— 真要清理的话连
   line ~4139 的那段注释一起删。 */
function introOff(){                  // 有人动手了 → 让路
  if(!INTRO)return false;
  INTRO=false;
  return S.view.lv==='cluster' && S.mode==='health';   // 需要重绘才看得出来
}
/* anchors: [{b, ax, ay}]，b 取自 BUBBLES（文案单一来源）。
   ⭐ v3.26 布局口径：**贴行紧邻** —— 药丸垂直居中对齐故障那一行，横向紧挨着锚点，
   浮在机柜前面。落位只有三条硬约束，其余一律可以压：
     ① 不压住**任何**红点（含别的故障的）—— 位置信息只靠红点承载；
     ② 药丸之间不重叠；
     ③ 不钻到右上角那颗「翻转」按钮底下。
   压住健康器件是**有意接受**的代价，不要为了少遮一点又把药丸推回柜顶。 */
function introPills(anchors){
  if(!anchors.length)return '';
  const tw=t=>[...t].reduce((a,c)=>a+(c.charCodeAt(0)>255?27:16),0);
  const PH=50, GAP=26, VSTEP=64, MG=20;   // 药丸高 / 与红点的横向留白 / 让行步距 / 屏边留白
  const CARDH=520;                        // 展开卡估高（最高的一张 534），用来决定往下还是往上翻
  const dots=anchors.map(a=>[a.ax,a.ay]);
  const boxes=[];                         // 已落位药丸 [l,t,r,b]
  const out=[];
  const hitDot=(l,t,r,b)=>dots.some(([dx,dy])=>dx>l-16&&dx<r+16&&dy>t-16&&dy<b+16);
  const hitBox=(l,t,r,b)=>boxes.some(([L,T,R,B])=>!(l>R+20||r<L-20||t>B+16||b<T-16));
  /* ⚠ 舞台右上角压着「翻转到背面」那颗 HTML 按钮（它不在 SVG 里，量不到，只能写死）。
     实测它占 viewBox 的 x 2835–3254、下沿 y≈292。贴行之后药丸一般落在 y>500，
     碰不到它了 —— 但让行时可能往上蹭，所以这道闸留着。 */
  const hitFlip=(l,t,r)=>!(r<2835||l>3254)&&t<300;
  [...anchors].sort((p,q)=>p.ax-q.ax).forEach(a=>{
    const w=86+tw(a.b.name);
    /* 方向：锚点在左半屏 → 药丸往右开，右半屏 → 往左开（永远朝屏幕中间开，不往外顶）。
       贴到屏边翻一次边，翻完再夹一次，保证整颗药丸在画布内。 */
    let right=a.ax<VW/2;
    let px=right?a.ax+GAP:a.ax-GAP-w;
    if(px<MG||px+w>VW-MG){ right=!right; px=right?a.ax+GAP:a.ax-GAP-w }
    px=Math.max(MG,Math.min(px,VW-MG-w));
    /* 垂直落位：先试与故障行同高（这才是「贴行」的意思），碰上约束再上下交替各让一行。 */
    let py=a.ay-PH/2;
    for(let k=0;k<9;k++){
      const t=a.ay-PH/2+(k?(k%2?1:-1)*Math.ceil(k/2)*VSTEP:0);
      if(!hitDot(px,t,px+w,t+PH)&&!hitBox(px,t,px+w,t+PH)&&!hitFlip(px,t,px+w)){py=t;break}
    }
    boxes.push([px,py,px+w,py+PH]);
    /* 引线：从药丸靠锚点那一侧横着接到红点。同高时就是一小段直线（26px，一眼看得出配对）；
       让过行时走一个折角，折点取在两者中点。 */
    const ex=right?px:px+w, ey=py+PH/2;
    const lead=Math.abs(ey-a.ay)<4
      ? `M${ex},${ey} L${a.ax},${a.ay}`
      : `M${ex},${ey} L${(ex+a.ax)/2},${ey} L${(ex+a.ax)/2},${a.ay} L${a.ax},${a.ay}`;
    /* 展开卡默认掉在药丸下方；锚点落在柜子下半段时下方装不下，翻到上方去。
       无论哪一边都别盖住锚点本身 —— 药丸已经贴在旁边了，卡再压上来就白贴了。 */
    let cy=py+PH+14; if(cy+CARDH>VH-30)cy=Math.max(30,py-CARDH-14);
    out.push(alarmBubble(a.b, a.ax, a.ay, {key:a.b.key, seen:BUBSEEN.has(a.b.key),
      pillX:px, pillY:py, lead,
      cardX:Math.max(60,Math.min(px-40,3190-660)), cardY:cy}));
  });
  return `<g class="introbub">`+out.join('')+`</g>`;
}

/* ax,ay = 根因器件的锚点。opt: pillX/pillY = 药丸左上角（pillX 省略则以 ax 居中）；
   cardX/cardY = 展开卡片左上角（省略则落在药丸正下方）。
   分开定位是为了：**药丸贴着故障点，卡片让开故障点** —— 否则一悬浮就把要看的器件盖住了。 */
function alarmBubble(b,ax,ay,opt){
  opt=opt||{};
  const A='#FF4D6D', W=660, PAD=32, PILLH=50;
  /* 药丸宽度按真实字宽算：CJK 26 / ASCII 13。原来是 name.length*24，
     「接口非法报文故障」这种长名会被切掉尾巴。 */
  const tw=t=>[...t].reduce((a,c)=>a+(c.charCodeAt(0)>255?27:16),0);
  const PILLW=86+tw(b.name);      // 26/13 低估了 25px 粗体的 ASCII 宽度，长名字会顶到药丸边
  const px=Math.max(20,Math.min(opt.pillX!=null?opt.pillX:ax-PILLW/2, 3210-PILLW));
  const py=opt.pillY;
  const cx=Math.max(60,Math.min(opt.cardX!=null?opt.cardX:px, 3190-W));
  const ey=opt.cardY!=null?opt.cardY:py+PILLH+12;
  /* ---- 先量高度（各段用同一套游标，改文案不用重算） ---- */
  const fix=b.fix||[];
  let cur=86;                                                  // 标题块
  const yImpactL=cur+36; cur=yImpactL+18;                      // 「影响分析」标签
  const yImpact=cur+12;  cur=yImpact+(b.impact.length-1)*34+30;
  /* 处理建议单独成块：运维看故障时真正要找的是这一行，混在影响分析的段落里等于藏起来 */
  const yFixBox=cur;     const fixH=fix.length?fix.length*32+50:0;
  cur=yFixBox+(fix.length?fixH+28:0);
  const ySvcL=cur+22;    cur=ySvcL+18;
  const ySvc=cur+12;     cur=ySvc+44+26;
  const H=cur+52;
  const sevW=76;

  /* ⭐ v3.26 分成两截：**锚点（红点 + 呼吸红晕）在外，药丸 / 引线 / 展开卡在 .bubbody 里**。
     逐个退场收走的只是 bubbody —— 红点必须留在屏上，否则「哪一张卡坏了」这句话就没人说了
     （背面尤其：那一格坏光模块只有 9px 宽，红点是唯一看得见的指路标）。 */
  let g=`<g class="bub${opt.seen?' gone':''}"${opt.key?` data-bkey="${esc(opt.key)}"`:''}>`;
  g+=`<circle class="halo" cx="${ax}" cy="${ay}" r="${opt.hit?13:17}" fill="${A}" opacity=".45"/>
      <circle cx="${ax}" cy="${ay}" r="${opt.hit?4.5:6}" fill="${A}"/>`;
  g+=`<g class="bubbody" style="transform-origin:${ax}px ${ay}px">`;
  /* 引线：细虚线，不跟拓扑抢视觉 */
  /* opt.lead：调用方自己给引线路径。默认的「竖 + 横」在集群首页会横穿好几个机柜。 */
  if(!opt.hit)g+=`<path d="${opt.lead||`M${px+PILLW/2},${py+PILLH} L${px+PILLW/2},${ay} L${ax},${ay}`}" fill="none" stroke="${A}"
        stroke-width="1.8" opacity=".5" stroke-dasharray="7 6"/>`;
  /* 收起态。带 go 时整颗药丸可点 —— 直接落到根因器件那一层，不用自己一级级钻 */
  /* ⚠ 别把 JSON 塞进 HTML 属性：esc() 不转义引号，字符串会在第一个 " 处截断（踩过，
     dataset.id 只剩一个 "{"）。改成竖线分隔的紧凑串。 */
  const clk=opt.go?` class="clk" data-act="bubgo" data-id="${opt.go.t}|${opt.go.id}|${opt.go.pod}|${opt.go.blade}"`:'';
  /* bare 模式（集群首页用）：不出药丸，命中区就是那个故障器件本身 ——
     一层就把药丸铺出去太吵，而红点 + 呼吸红晕已经足够指路。 */
  if(opt.hit){
    g+=`<rect${clk} x="${opt.hit.x}" y="${opt.hit.y}" width="${opt.hit.w}" height="${opt.hit.h}"
        fill="transparent" style="cursor:pointer"/>`;
  }else{
  g+=`<g class="pill"${clk}><rect x="${px}" y="${py}" width="${PILLW}" height="${PILLH}" rx="${PILLH/2}"
        fill="#2A1017" stroke="${A}" stroke-width="2"/>
      <circle cx="${px+26}" cy="${py+PILLH/2}" r="7" fill="${A}"/>
      <text x="${px+46}" y="${py+PILLH/2+9}" fill="#FF8F9C" font-size="25" font-weight="700">${esc(b.name)}</text></g>`;
  }
  /* 展开态 */
  g+=`<g class="exp">
      <rect x="${cx}" y="${ey}" width="${W}" height="${H}" rx="15" fill="#0A0F1B" stroke="#22354E" stroke-width="1.6"/>
      <path d="M${cx},${ey+15} a15,15 0 0 1 15,-15 h${W-30} a15,15 0 0 1 15,15 v4 h${-W} z" fill="${A}"/>
      <text x="${cx+PAD}" y="${ey+60}" fill="#FFFFFF" font-size="27" font-weight="700" letter-spacing="1">${esc(b.name)}</text>
      <!-- ⭐ v3.30：严重度徽标用**故障级别色**（紧急红 / 高橙 / 中黄 / 低蓝，见 SEV）。
           这是图例右半边那四档唯一的落点 —— 器件着色仍然只有红绿。 -->
      <rect x="${cx+W-PAD-sevW}" y="${ey+34}" width="${sevW}" height="32" rx="9"
        fill="${SEVC(b.sev)}" fill-opacity=".18" stroke="${SEVC(b.sev)}" stroke-width="1.4"/>
      <text x="${cx+W-PAD-sevW/2}" y="${ey+56}" fill="${SEVC(b.sev)}" font-size="19" font-weight="700" text-anchor="middle">${b.sev}</text>

      <text x="${cx+PAD}" y="${ey+yImpactL}" fill="#6B80A0" font-size="18" letter-spacing="3">影响分析</text>
      ${b.impact.map((t,i)=>`<text x="${cx+PAD}" y="${ey+yImpact+i*34}" fill="#E7EFFA" font-size="22">${esc(t)}</text>`).join('')}
      ${fix.length?`
      <rect x="${cx+PAD}" y="${ey+yFixBox}" width="${W-PAD*2}" height="${fixH}" rx="10"
        fill="rgba(255,154,61,.09)" stroke="rgba(255,154,61,.34)" stroke-width="1"/>
      <rect x="${cx+PAD}" y="${ey+yFixBox}" width="4" height="${fixH}" rx="2" fill="#FF9A3D"/>
      <text x="${cx+PAD+20}" y="${ey+yFixBox+28}" fill="#FF9A3D" font-size="18" letter-spacing="3" font-weight="700">处理建议</text>
      ${fix.map((t,i)=>`<text x="${cx+PAD+20}" y="${ey+yFixBox+58+i*32}" fill="#FFD3AE" font-size="22">${esc(t)}</text>`).join('')}`:''}

      <text x="${cx+PAD}" y="${ey+ySvcL}" fill="#6B80A0" font-size="18" letter-spacing="3">${esc(b.svcLabel||'涉及的推理服务')}</text>`;
  let sx=cx+PAD;
  b.svc.forEach(nm=>{ const cw=Math.round(tw(nm)*0.82)+34;
    g+=`<rect x="${sx}" y="${ey+ySvc}" width="${cw}" height="40" rx="9" fill="rgba(79,168,255,.13)" stroke="#3E8FC4" stroke-width="1.2"/>
        <text x="${sx+cw/2}" y="${ey+ySvc+27}" fill="#9FCBFF" font-size="20" font-weight="600" text-anchor="middle">${esc(nm)}</text>`;
    sx+=cw+12; });
  /* 时间戳：右下角，带年月日，字号比正文小一档但足够看清 */
  g+=`<text x="${cx+W-PAD}" y="${ey+H-24}" fill="#7089A8" font-size="24" font-weight="600" text-anchor="end"
        font-variant-numeric="tabular-nums" letter-spacing="1">${b.ts}</text>`;
  return g+`</g></g></g>`;   // </exp></bubbody></bub>
}

