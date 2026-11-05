/* ===== SFU 板：板卡视角与 Union 放大视图共用同一套几何（双击前后位置尺寸不变） ===== */
const SFUL=(()=>{
  const L2Y=176, L2H=116, L2W=560, l2x=k=>274+k*724;  // 上层：本刀片对接的 4 台灵衢互联设备（不展开）
  const L2Z=[110,122,3060,190];
  /* ⭐ v3.30.1（评审意见 6）：32 个光模块**每 4 个一组 = 1 个 PIC**，共 8 组。
     编号顺序与下行 Union 同一套规矩：**先 4 个奇号（PIC1/3/5/7）再 4 个偶号（PIC2/4/6/8）**，
     不是 1..8 顺排 —— 左右两组各占一半的编号，和 `ux()` 里「左 8 奇号 / 右 8 偶号」同源。
     组间留 24px 空档（组内 8px），**间距本身就是分组**，不用画框；
     判据仍是「数得出来」：8 个标号 × 每组 4 个方块，观众可以直接点数。
     ⚠ 尺寸重算过：32×80 + 24×8 + 7×24 = 2920，起点 126 → 右缘 3046 < 本板分区右边界 3170。 */
  const OMW=80, OMG=8, PICG=24;
  const OMY=410, OMH=78, omx=i=>126+i*(OMW+OMG)+Math.floor(i/4)*PICG;
  const picNo=picNoG, picOf=picOfG;                   // v3.30.2：提到全局（故障数据要在 SFUL 之前用）
  const picCx=g=>(omx(g*4)+omx(g*4+3)+OMW)/2;         // 该组 4 个方块的中线
  const IY=560, IH=88, IW=170, ix=k=>1250+k*180;      // 互联 Union ×4：单独一行，正对下行两组之间的空档
  const UY=880, UH=88, DW=104;
  const ux=i=> i<8 ? 150+i*130 : 2010+(i-8)*130;      // 下行 Union：左 8（奇号）/ 右 8（偶号），中间空档专供互联连线上行
  const BZ=[110,350,3060,736];                        // 本板分区（OSFP + 互联 Union + 下行 Union 同框）
  /* ⭐ v3.30.5（评审意见 4）：NPU 那一层**整体压扁**（NH 350→232、分区高 566→316），
     腾出来的 250px 给新加的 IO 层。可用纵向空间是硬的：viewBox 底边 1786，
     IO 分区 1436+300 = 1736 < 1786，只剩 50px 余量，别再往下加东西了。 */
  const NY=1186, NW=360, NH=232, nx=i=>140+i*376;     // 8 块 NPU 刀片（一行，线不被遮）
  const NZ=[110,1116,3060,316];                       // 1116 → 1432
  /* ⭐ v3.30.5（评审意见 5）：IO 层 —— 2 块 RoCE板，**只有右组（偶号）Union 连它**。
     板 1 正对右组前 4 颗（U1.2/1.4/1.6/1.8），板 2 正对后 4 颗（U1.10–U1.16），
     所以两块板都靠右摆：**位置本身就说明了「左组不连 IO」**，不用写一行字。 */
  /* ⭐ v3.30.6（评审意见 1）：IO 层**横向拉通**，与上面三层同宽。
     v3.30.5 把框收到右半边，本意是「用位置说明左组不连 IO」，
     结果是这一层缩成小小一块、和上面三层不在一个量级 —— **层级的分量要靠尺寸说**，
     一层缩了一半，读起来就不像一层。左组不连 IO 这件事交给连线说（只有右边有线）。 */
  const IOZ=[110,1466,3060,300];                      // 110 → 3170　·　1466 → 1766
  const IOY=1532, IOH=200;
  const ioW=1400, iox=k=>k?1680:200;                  // 板 1 / 板 2：各占半幅，两侧留 90px
  const l2of=i=>Math.floor(i/8);                      // 光模块 i → 第几台 L2（每台 8 个）
  return {L2Y,L2H,L2W,l2x,L2Z,l2of,OMY,OMH,OMW,OMG,omx,picNo,picOf,picCx,IY,IH,IW,ix,UY,UH,DW,ux,BZ,NZ,NY,NW,NH,nx,IOZ,IOY,IOH,iox,ioW};
})();
function vSwBlade(v){
  const P=findPod(v.pod), sw=P.sw.find(x=>x.id===v.id); if(!sw)return '';
  return sfuStage(P,sw,-1);
}
function vUchip(v){
  const P=findPod(v.pod), sw=P.sw.find(x=>x.id===v.blade), c=sw&&sw.chipList.find(x=>x.id===v.id);
  if(!c)return '';
  return sfuStage(P,sw,c.idx);
}
/* zoomU = -1 板卡视角；>=0 放大该 Union */
function sfuStage(P,sw,zoomU){
  const G=SFUL, A='#00E6A2', sel=S.sel||{};
  const err=sw.status==='err';
  const zoom = zoomU>=0, zc = zoom?sw.chipList[zoomU]:null;
  const isDown = zoom && zc.role==='down';
  const pair = isDown?interOf(zc.grp):null;
  const tgtB = isDown?zc.npuBlade:-1;
  const omBase = zoom&&omGrpOf(zoomU)>=0 ? omGrpOf(zoomU)*4 : -1;   // 互联 Union 没有光模块 → -1
  const interDowns = zoom&&!isDown ? downsOfInter(zoomU) : null;    // 互联 Union 汇聚的 8 颗下行 Union
  const selU = sel.t==='uchip' ? sw.chipList.findIndex(x=>x.id===sel.id) : -1;
  const selB = sel.t==='npublade' ? P.npu.findIndex(x=>x.id===sel.id) : -1;
  const selLane = sel.t==='lane' ? +sel.id.split('-L').pop() : -1;
  const selOm   = sel.t==='om'   ? +sel.id.split('-M').pop() : -1;
  const anyF = selU>=0||selB>=0||selLane>=0||selOm>=0;

  /* Union 本体位置尺寸恒定；Port / lane 装进它正上方的“展开面板”，不遮挡任何相邻 Union */
  const uc = zoom? (zoomU<16 ? G.ux(zoomU)+G.DW/2 : G.ix(zoomU-16)+G.IW/2) : 0;
  const uy = zoom? (zoomU<16 ? G.UY : G.IY) : 0, uh = zoom? (zoomU<16 ? G.UH : G.IH) : 0;
  /* ⭐ v3.30.4（评审意见 2）：**互联 Union 没有上行面板** —— 它不接光模块，
     18 个口全部朝下，所以只画一块面板，宽度放到 640 才装得下 18 格。 */
  /* ⭐ v3.30.6（评审意见 2）：端口**按位置分成上下两半** —— `1–9 在 Union 下方，10–18 在上方`。
     下行 Union：下 1–8 → NPU、9 → RoCE板；上 10–13 → 互联 Union、14–17 → 光模块、18 → RoCE板。
     ⚠ 18 号口是上面板里**唯一朝下**的口（它去 RoCE板）—— 所以下面板做窄到 520，
       让 18 号的下行线从上面板右端走外侧下去，不压在下面板上。
     ⚠ 编号顺序不必和用途对齐（评审明确松口）：上面板按 10…18 顺排，lane 行只盖住 14–17 那 4 格。 */
  const ZW=isDown?760:640, DZW=isDown?520:640, ZP=84, LH=56, PH2=64, ZH=20+LH+PH2+20;
  const ZY=uy-ZH;
  const ZX=Math.max(G.BZ[0]+18, Math.min(uc-ZW/2, G.BZ[0]+G.BZ[2]-ZW-18));
  const LY=ZY+20, PY2=LY+LH;                               // lane 紧贴坐在 Port 正上方（0 间隙）
  /* 端口统一编号 1–18，按角色分成两张表：
     · 下行 Union —— 下面板 1–13（1–8 → NPU　9 空闲　10–13 → 互联 Union）
                     上面板 14–18（14–17 → 光模块，各 2 lane　18 空闲）
     · 互联 Union —— 只有下面板 1–18：**1–16 各接本组一颗下行 Union 的一条线**
                     （8 颗 × 2 条 = 16），17 / 18 空闲。 */
  const ioBoard = zoom&&isDown ? ioOfUnion(zoomU) : -1;    // 本 Union 连的 RoCE板（-1 = 左组，不连）
  /* ⭐⭐ v3.30.7（评审意见 3）：上面板的**排列顺序跟着目标的方位走**，不按号段顺排。
     （评审早就松口「不用严格按 10-11-12 排」，v3.30.6 没有用上这条，结果两束线交叉。）
       · 左组 Union（x 150–1060）：它的 4 个光模块在左半边、互联 Union 在它右边
         → 光模块口排左、互联口排右　`[14 15 16 17 | 10 11 12 13 | 18]`
       · 右组 Union（x 2010–3024）：互联 Union 与两块 RoCE板**都在它左边**，光模块在右半边
         → 18 排最左、互联口居中、光模块口排右　`[18 | 10 11 12 13 | 14 15 16 17]`
     判据：**同一颗 Union 的两束上行线（去光模块 / 去互联）不许交叉** ——
     交叉之后观众要靠追线才知道哪个口去哪儿，端口号就白标了。

     ⭐ v3.30.7（评审意见 1）：**有 lane 的口要宽，没 lane 的口窄**。
     等宽时每格 68.7px，lane 块只剩 24px，8 条上行线挤在一起看不出落到哪个 lane。
     光模块口（14–17）给到 112px（lane 块 44.5px），其余 5 个口 42px 就够放两位数。
     4×112 + 5×42 = 658 = 760 − 84 − 18 ✓ */
  const UPN=isDown?(zc.grp===0?[14,15,16,17,10,11,12,13,18]:[18,10,11,12,13,14,15,16,17]):[];
  const DPN=isDown?[1,2,3,4,5,6,7,8,9]
                  :[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
  const isOmPort=n=>n>=14&&n<=17;
  const upW=n=>isOmPort(n)?112:42;
  const UPX=[]; { let acc=ZX+ZP; UPN.forEach(n=>{UPX.push(acc); acc+=upW(n)}); }
  const px=i=>UPX[i], pw=i=>upW(UPN[i]);                   // 槽位 → x / 宽
  const upSlot=n=>UPN.indexOf(n);                          // 端口号 → 槽位
  const IDLE_INTER=[17,18];                                // 互联 Union 的空闲口
  /* 右组 Union 的 9 / 18 接 RoCE板，不再是空闲口 */
  const myIdle = isDown ? (ioBoard>=0?[]:IDLE_PORTS) : IDLE_INTER;
  const isIdle=n=>myIdle.indexOf(n)>=0;
  /* lane 行：8 块，每个光模块口（14–17）头上 2 块；组内 5px、组间 18px —— 间距即分组。 */
  const LGM=9, LGI=5, LW=(112-2*LGM-LGI)/2;
  const lx=i=>px(upSlot(14+Math.floor(i/2)))+LGM+(i%2)*(LW+LGI);
  /* v3.30.2 在这里挂过一行「用途小标」，v3.30.3（评审意见 4）删了 —— 高度留着不动，
     多出来的 16px 正好给下行 12 条链路一条干净的出线带。 */
  const DPH=62, DZH=22+DPH+16, DZY=uy+uh;
  const DZX=Math.max(G.BZ[0]+18, Math.min(uc-DZW/2, G.BZ[0]+G.BZ[2]-DZW-18));
  const DPW=(DZW-ZP-18)/DPN.length, dpx=i=>DZX+ZP+i*DPW, DPY=DZY+22;
  const LCOL='#5FD8FF', LTXT='#03202B';                    // lane：亮天蓝（粉色太像故障）
  const PCOL='#4F7BFF';                                    // 所有 Port 同色，用途由连线表达，不靠颜色区分

  /* v3.31.0：展开的 8 张卡也按 1–4 / 5–8 分两簇。可用宽 320：
     8×34（卡）+ 7 个间隙 = 320 → 组内 4px × 6 + 组间 20px × 1 = 44，余 4 收在右侧 */
  const CDW=34, CDT=58, cardX=(bi,j)=>G.nx(bi)+20+j*38+(j>=4?16:0);
  let s=head(`${P.name} · ${sw.name}${zoom?' · '+zc.name:''}`,
    zoom
    ? (isDown
      ? 'Union 内视图：端口统一编号 1–18 —— Port 1–8 各接一张 NPU、Port 10–13 接 2 个互联 Union（各 2 条）、Port 14–17 共 8 条 lane 交叉上行组内 4 个光模块、Port 9 / 18 空闲'
      : '互联 Union：18 个口全部朝下 —— Port 1–16 各接本组一颗下行 Union 的一条线（8 颗 × 2 条），17 / 18 空闲；不接光模块')
    : '灵衢互联刀片：20 × Union —— 16 个下行 U1.1–U1.16（左右各 8，每个连一块 NPU 刀片）+ 4 个互联 U2.1–U2.4 · 对外 32 × 800G 光模块 = PIC1–PIC8，每组 4 个（组内 LPO1–LPO4）');

  /* ---- 分区容器（光模块与 Union 同一个色块）---- */
  const swIdx=P.sw.findIndex(x=>x.id===sw.id), ncab=D.nets[swIdx]||D.nets[0];
  /* ⛔ v3.30.3（评审意见 4）：分区标题只留「这一层是什么 · 叫什么」，括注里的清点数字全删 */
  s+=zone(G.L2Z[0],G.L2Z[1],G.L2Z[2],G.L2Z[3],`上层 · ${ncab.name}`);
  s+=zone(G.BZ[0],G.BZ[1],G.BZ[2],G.BZ[3],`本板 · ${sw.name}${zoom?'　—　'+zc.name:''}`,bladePwrTag(sw));
  s+=zone(G.NZ[0],G.NZ[1],G.NZ[2],G.NZ[3],
    zoom&&isDown ? `下游 · ${P.npu[tgtB].name}` : '下游 · NPU 计算刀片');
  s+=zone(G.IOZ[0],G.IOZ[1],G.IOZ[2],G.IOZ[3],'下游 · RoCE板');

  let PANCAP='';   // 标签层：压在连线之上（四层：底框 → 器件 → 连线 → 标签）
  /* ---- 容器底板先画（连线要压在它们上面，线头才落得到器件上）---- */
  P.npu.forEach((nb,i)=>{
    const isT=zoom&&isDown&&i===tgtB;
    const on=!anyF?null:(selB===i||(selU>=0&&selU<16&&sw.chipList[selU].npuBlade===i));
    s+=`<rect x="${G.nx(i)}" y="${G.NY}" width="${G.NW}" height="${G.NH}" rx="10" fill="#1A2029" opacity="${on===false?.42:(zoom&&!isT?.55:1)}"/>`;
  });
  for(let k=0;k<4;k++) s+=`<rect x="${G.l2x(k)}" y="${G.L2Y}" width="${G.L2W}" height="${G.L2H}" rx="10" fill="#0A2131"/>`;
  for(let k=0;k<2;k++) s+=`<rect x="${G.iox(k)}" y="${G.IOY}" width="${G.ioW}" height="${G.IOH}" rx="10" fill="#1A2029"/>`;
  if(zoom) s+=(isDown?`<rect x="${ZX}" y="${ZY}" width="${ZW}" height="${ZH}" rx="14" fill="#0F2A24"/>`:'')
    +`<rect x="${DZX}" y="${DZY}" width="${DZW}" height="${DZH}" rx="14" fill="#0F2A24"/>`;

  /* ---- 连线 ---- */
  let L='';
  if(!zoom){
    for(let i=0;i<16;i++){
      const c=sw.chipList[i], bi=c.npuBlade;
      const omU=selOm<0?null:unionsOfOmGrp(Math.floor(selOm/4));
      const on=!anyF?null:(selU===i||selB===bi||(!!omU&&omU.indexOf(i)>=0));
      const x1=G.ux(i)+G.DW/2, x2=G.nx(bi)+G.NW/2;
      L+=link(`M${x1},${G.UY+G.UH} C${x1},${G.UY+G.UH+150} ${x2},${G.NY-170} ${x2},${G.NY-10}`,
        on===true?A:LNKC, on?4:2.4, on===false?.08:(on?1:.9));
    }
    /* ⭐ v3.30.5：右组 8 颗 Union → RoCE板，各 1 条聚合线（落在板顶边）。
       默认就画出来 —— 「只有右组连 IO」这件事得在不点任何东西的时候就看得见。 */
    for(let i=8;i<16;i++){
      const k=ioOfUnion(i);
      const on=!anyF?null:(selU===i);
      /* 4 条线**收束到板顶中点**：分散落点会让人以为落在具体芯片上，
         而这一层默认只说到板级（芯片要点开某颗 Union 才出现）。 */
      const x1=G.ux(i)+G.DW/2, x2=G.iox(k)+G.ioW/2;
      L+=link(`M${x1},${G.UY+G.UH} C${x1},${G.UY+G.UH+300} ${x2},${G.IOY-220} ${x2},${G.IOY}`,
        on===true?A:LNKC, on?3:2, on===false?.05:(on?1:.7));
    }
    if(selOm>=0){                               // 单击 OSFP：向下画出它归属的 2 个 Union（左右组各一）及其 NPU 刀片
      const ox=G.omx(selOm)+G.OMW/2;
      unionsOfOmGrp(Math.floor(selOm/4)).forEach(ui=>{
        const ux0=G.ux(ui)+G.DW/2;
        L+=link(`M${ox},${G.OMY+G.OMH} C${ox},${G.OMY+G.OMH+180} ${ux0},${G.UY-180} ${ux0},${G.UY}`,A,3,1);
        const bx=G.nx(sw.chipList[ui].npuBlade)+G.NW/2;
        L+=link(`M${ux0},${G.UY+G.UH} C${ux0},${G.UY+G.UH+150} ${bx},${G.NY-170} ${bx},${G.NY-10}`,A,3,1);
      });
    }
    if(selU>=0){                                // 单击任一 Union 才展开它的上行与互联（默认不画，否则 80+ 条会糊）
      const su=sw.chipList[selU], down0=selU<16;
      const sx=down0?G.ux(selU)+G.DW/2:G.ix(selU-16)+G.IW/2;
      const sy=down0?G.UY:G.IY, sh=down0?G.UH:G.IH;
      if(down0){
        for(let k=0;k<4;k++){                   // 上行 → 本 Union 的 4 个光模块（只有下行 Union 有上行侧）
          const om=omGrpOf(selU)*4+k, x2=G.omx(om)+G.OMW/2;
          L+=link(`M${sx},${sy} C${sx},${sy-140} ${x2},${G.OMY+G.OMH+140} ${x2},${G.OMY+G.OMH}`,A,2.6,1);
        }
        interOf(su.grp).forEach(t=>{ for(let n=0;n<2;n++){          // 下行 Union → 互联 Union（上一行）
          const x1=sx+(n?14:-14), x2=G.ix(t-16)+G.IW/2+(n?22:-22);
          L+=link(`M${x1},${G.UY} C${x1},${G.UY-120} ${x2},${G.IY+G.IH+120} ${x2},${G.IY+G.IH}`,A,2.8,1);
        }});
        /* ⭐ v3.30.5：右组 Union 再往下连 RoCE板的 2 个 芯片（Port 9 / 18） */
        const iob=ioOfUnion(selU);
        if(iob>=0) ioChipsOfUnion(selU).forEach((ci,n)=>{
          const x1=sx+(n?26:-26), cx=ioChipX(G,iob,n)+IOCW/2;
          L+=link(`M${x1},${G.UY+G.UH} C${x1},${G.UY+G.UH+260} ${cx},${G.IOY-260} ${cx},${G.IOY+IOCY0}`,A,2.6,1);
        });
      } else {
        /* ⭐ v3.30.4：互联 Union **只往下连本组的 8 颗下行 Union**（各 2 条），不接光模块 */
        downsOfInter(selU).forEach(d=>{ for(let n=0;n<2;n++){
          const x1=sx+(n?22:-22), x2=G.ux(d)+G.DW/2+(n?14:-14);
          L+=link(`M${x1},${G.IY+G.IH} C${x1},${G.IY+G.IH+120} ${x2},${G.UY-120} ${x2},${G.UY}`,A,2.6,1);
        }});
      }
    }
  } else {
    if(isDown) for(let i=0;i<8;i++){            // 8 条 lane 交叉落到组内 4 个光模块（每 lane 2 条线）
      const om=omBase+laneToOm(i), on=(selLane<0&&selOm<0)?null:(selLane===i||selOm===om);
      const x1=lx(i)+LW/2, x2=G.omx(om)+G.OMW/2;
      /* 光模块故障只染它自己和它的上行光纤，lane 段不跟着红（故障不沿通路传播） */
      for(let n=0;n<2;n++){const dx=n?5:-5;
        L+=link(`M${x1+dx},${LY} C${x1+dx},${LY-46} ${x2+dx},${G.OMY+G.OMH+46} ${x2+dx},${G.OMY+G.OMH}`,
          A, on?3.2:2.4, on===false?.08:1);}
    }
    if(!isDown){
      /* ⭐ v3.30.4：互联 Union 的 18 个口 —— Port 1–16 各接本组一颗下行 Union 的一条线
         （8 颗 × 2 条 = 16），17 / 18 空闲。全部朝下，没有上行侧。 */
      const dpb=DPY+DPH;
      interDowns.forEach((d,m)=>{ for(let n=0;n<2;n++){
        const q=m*2+n, x1=dpx(q)+DPW/2, x2=G.ux(d)+G.DW/2+(n?14:-14);
        L+=link(`M${x1},${dpb} C${x1},${dpb+90} ${x2},${G.UY-110} ${x2},${G.UY}`,A,2.4,1);
      }});
    }
    if(isDown){
      const dpb=DPY+DPH;                        // 下行 Port 的出线边
      for(let i=0;i<8;i++){                     // Port 1–8 → 目标刀片的 8 张卡，一一对应
        const x1=dpx(i)+DPW/2, cx=cardX(tgtB,i)+CDW/2, cy=G.NY+CDT;
        L+=link(`M${x1},${dpb} C${x1},${dpb+110} ${cx},${cy-110} ${cx},${cy}`,A,2.4,1);
      }
      /* ⭐ v3.30.6：Port 9 在下面板（直接朝下），Port 18 在**上面板**却也去 RoCE板 ——
         它是这颗芯片上唯一「站在上面、朝下走」的口。线从上面板底边出来，
         先横向甩出下面板的宽度（下面板已经收窄到 520 就是为了这个），再一路下到 IO 芯片。 */
      if(ioBoard>=0) ioChipsOfUnion(zoomU).forEach((ci,n)=>{
        const cx=ioChipX(G,ioBoard,n)+IOCW/2;
        /* ⚠ v3.30.8：**左边的芯片配左边的口** —— Port 18 在上面板最左、Port 9 在下面板最右，
           所以 n=0（左芯片）接 18、n=1（右芯片）接 9。反过来配这两条线会交叉一次。 */
        if(n===0){ const _s=upSlot(18), x1=px(_s)+pw(_s)/2, out=x1+(x1>uc?90:-90);   // Port 18（上面板）
          L+=link(`M${x1},${uy} C${out},${uy+180} ${cx},${G.IOY-280} ${cx},${G.IOY+IOCY0}`,A,2.6,1);
        } else { const x1=dpx(8)+DPW/2;                                              // Port 9（下面板第 9 格）
          L+=link(`M${x1},${dpb} C${x1},${dpb+240} ${cx},${G.IOY-240} ${cx},${G.IOY+IOCY0}`,A,2.6,1);
        }
      });
      /* ⭐ v3.30.7（评审意见 2）：线从**端口方块的顶边**（PY2）起，不再从 LY 起。
         10–13 头上没有 lane，LY 那一行对它们是空的 —— 线从空处冒出来，
         看着就是「没接在端口上」。起点落在方块边上，才算连上了。 */
      pair.forEach((t,k)=>{ for(let n=0;n<2;n++){   // Port 10–13 → 2 个互联 Union，各 2 条
        const _s=upSlot(10+k*2+n), x1=px(_s)+pw(_s)/2;
        const x2=G.ix(t-16)+G.IW/2+(n?26:-26), y2=G.IY+G.IH;
        L+=link(`M${x1},${PY2} C${x1},${PY2-120} ${x2},${y2+130} ${x2},${y2}`,A,2.6,1);
      }});
    }
  }
  /* ---- 上行：光模块 → 灵衢互联设备（板卡视角画满 32 条；放大态只画本 Union 的 4 条）---- */
  for(let i=0;i<32;i++){
    if(zoom && !(omBase>=0&&i>=omBase&&i<omBase+4)) continue;
    const on = selOm<0?null:selOm===i;
    const k=G.l2of(i), x1=G.omx(i)+G.OMW/2, x2=G.l2x(k)+G.L2W/2+((i%8)-3.5)*54;
    const bad=omBad(sw,i);
    L+=link(`M${x1},${G.OMY} C${x1},${G.OMY-90} ${x2},${G.L2Y+G.L2H+90} ${x2},${G.L2Y+G.L2H}`,
      bad?colH('err'):(zoom||on===true?A:LNKC), bad||on===true?3.4:(zoom?2.6:2.1), on===false?.1:(zoom?1:.82), false, true);   // ← 光纤
  }
  /* ⭐ v3.30.8（评审意见 1 · 全局巡检）：**分区标题条挪到连线之上**。
     标题条是不透明的「搁板」，线从它背后穿过去读起来是对的；
     而原来线画在标题条之上，四条标题（上层 / 本板 / 下游 NPU / 下游 IO）全被划成两半。
     判据同坑 43：**四层顺序是 底框 → 器件 → 连线 → 标签**，标题条属于标签层。 */
  const ZCAP2=flushCaps();

  /* ---- 上层：4 台灵衢互联设备（只画到设备粒度，不展开内部）---- */
  for(let k=0;k<4;k++){
    const dv=ncab.dev[k], bad=dv.status!=='ok';
    const rel = !zoom || (omBase>=0 && G.l2of(omBase)===k);
    s+=`<g class="clk" data-act="netdev" data-id="${dv.id}" data-cab="${ncab.id}" opacity="${rel?1:.42}">
      <rect x="${G.l2x(k)}" y="${G.L2Y}" width="${G.L2W}" height="${G.L2H}" rx="10" pointer-events="all"
        fill="${S.mode==='health'?'none':devCol(dv)}" fill-opacity="${S.mode==='health'?1:lyO()}"
        stroke="${bad?colH('err'):lyS(dv,'#6FB3E0')}" stroke-width="${bad?3:1.8}"/>
      <text x="${G.l2x(k)+24}" y="${G.L2Y+46}" fill="#E7EFFA" font-size="32" font-weight="700">灵衢L2-${pad2((dv.gidx!=null?dv.gidx:k)+1)}</text>

      ${Array.from({length:8},(_,q)=>`<rect x="${G.l2x(k)+G.L2W/2+(q-3.5)*54-11}" y="${G.L2Y+G.L2H-6}" width="22" height="12" rx="4" fill="#6FB3E0"/>`).join('')}</g>`;
  }

  /* ---- 8 个 PIC 组标：**方括号 + 标号，挂在这一组的下沿** ----
     ⚠ 不放在上方：上方 14px 处就是「本板 · 灵衢互联刀片 01」那条分区标题，第一版撞上了。
     ⚠ 方括号不是装饰 —— 只靠 24px 的组间空档，观众要盯很久才确信「是 4 个一组」；
       一条贴着 4 个方块下沿的括号线把边界画死，标号才有归属（判据：数得出来）。
     ⚠ 组中线落在组内第 2/3 个方块**之间**，而链路都从方块中心出发，
       所以标号正好插在两条线中间的空档里，不会被划穿。
     ⚠ 进 PICCAP 不进 s：连线是最后追加的（要压住外框），标签必须再压在连线之上。 */
  let PICCAP='';
  for(let g=0;g<8;g++){
    const anyBad=[0,1,2,3].some(t=>omBad(sw,g*4+t));
    const mineG=!zoom||(omBase>=0&&Math.floor(omBase/4)===g);
    const col=anyBad?colH('err'):(mineG?'#8FA9C4':'#3E546F');
    const bx0=G.omx(g*4), bx1=G.omx(g*4+3)+G.OMW, by=G.OMY+G.OMH+8;
    PICCAP+=`<path d="M${bx0},${by-7} L${bx0},${by} L${bx1},${by} L${bx1},${by-7}"
        fill="none" stroke="${col}" stroke-width="1.6" opacity="${mineG?.8:.45}"/>
      <text x="${G.picCx(g)}" y="${by+22}" fill="${col}" font-size="20" font-weight="700"
        text-anchor="middle" letter-spacing="1" paint-order="stroke" stroke="#141B27" stroke-width="6"
        stroke-linejoin="round" opacity="${mineG?1:.55}">PIC${G.picNo(g)}</text>`;
  }
  /* ---- 32 光模块 ---- */
  for(let i=0;i<32;i++){
    const mine=!zoom||(omBase>=0&&i>=omBase&&i<omBase+4);
    const on=selOm<0?null:selOm===i, bad=omBad(sw,i);
    s+=`<g class="clk" data-act="om" data-id="${sw.id}-M${i}" data-pod="${P.id}" data-blade="${sw.id}" opacity="${mine?1:.62}">
      <rect x="${G.omx(i)}" y="${G.OMY}" width="${G.OMW}" height="${G.OMH}" rx="7"
        fill="${bad?'#2A1017':(on===true?'#0F2A24':(S.mode==='health'?'#22364F':(S.mode==='pwr'?NA:heat((sw.omBw||[])[i]||50))))}" fill-opacity="${bad||on===true?1:lyO()}"
        stroke="${bad?colH('err'):(on===true?A:(mine
          ? (S.mode==='health'?'#6FB3E0':S.mode==='pwr'?NA:heat((sw.omBw||[])[i]||50))
          : '#4E7BA8'))}" stroke-width="${bad||on===true?3:(mine?2:1.3)}"/>
      <text x="${G.omx(i)+G.OMW/2}" y="${G.OMY+30}" fill="#E7EFFA" font-size="20" font-weight="700" text-anchor="middle">${omLbl(i)}</text>
      ${/* ⛔ v3.30.3：正常态不再写「800G」—— 32 个方块写 32 遍同一个规格，只留故障态的「中断」 */
        bad?`<text x="${G.omx(i)+G.OMW/2}" y="${G.OMY+54}" fill="${colH('err')}" font-size="16" text-anchor="middle">中断</text>`:''}</g>`;
  }

  /* ---- 20 个 Union（位置尺寸恒定）---- */
  /* ⚠ 这一行原来在 IY-18，与新加的 PIC 组标只差 14px，两行字直接糊在一起（v3.30.1 踩过）。
     下移到 IY-6：PIC 标号基线 518 / 这一行 554，隔开 36px。 */
  /* ⛔ v3.30.3（评审意见 4）：删掉「互联 Union ×4」与「下行 Union · 左/右组」这三条行标 ——
     U2.x / U1.x 的编号第一段已经写明角色，左右分组由 130px 的中间空档画出来了。 */
  for(let i=0;i<20;i++){
    const c=sw.chipList[i], down=i<16;
    const me=zoom&&i===zoomU;
    const X=down?G.ux(i):G.ix(i-16), W=down?G.DW:G.IW;
    const Y=down?G.UY:G.IY, H=down?G.UH:G.IH;
    const omU=selOm<0?null:unionsOfOmGrp(Math.floor(selOm/4));
    const on=!anyF?null:(selU===i||(zoom&&isDown&&pair.indexOf(i)>=0)||(down&&!!omU&&omU.indexOf(i)>=0));
    /* ⭐ v3.30.4：放大互联 Union 时，本组那 8 颗下行 Union 不压暗（它们是这一页的下游） */
    const mineU = !zoom || i===zoomU || (isDown&&pair.indexOf(i)>=0) || (!isDown&&interDowns.indexOf(i)>=0);
    const dim = me?1 : (on===false?.5:(zoom?(mineU?.85:.5):1));
    const bad=badF(c.status==='err');   // 故障红只属于故障图层（原则 7）；v3 前这里漏了 mode 判断
    s+=`<g class="clk" data-act="uchip" data-id="${c.id}" data-pod="${P.id}" data-blade="${sw.id}" opacity="${dim}">
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="9"
        fill="${me?'#0F2A24':lyF(c,down?'#22364F':'#1A2C42')}" fill-opacity="${me?1:lyO()}"
        stroke="${bad?colH('err'):(me?A:lyS(c,'#6FB3E0'))}" stroke-width="${me?3.8:1.8}" />
      <text x="${X+W/2}" y="${Y+H/2+9}" fill="#E7EFFA" font-size="30" font-weight="700" text-anchor="middle">${uLbl(c)}</text>
      ${me?'':`<rect x="${X+W/2-12}" y="${Y+H-6}" width="24" height="12" rx="4" fill="${on===true?A:'#6FB3E0'}"/>`}</g>`;
  }
  /* ---- 8 块 NPU 刀片（位置尺寸恒定；目标刀片内 8 张卡排成一行，与 8 条下行线一一对应）---- */
  P.npu.forEach((nb,i)=>{
    const isT = zoom&&isDown&&i===tgtB;
    const on=!anyF?null:(selB===i||(selU>=0&&selU<16&&sw.chipList[selU].npuBlade===i));
    s+=`<g class="clk" data-act="npublade" data-id="${nb.id}" data-pod="${P.id}" opacity="${on===false?.42:(zoom&&!isT?.55:1)}">
      <rect x="${G.nx(i)}" y="${G.NY}" width="${G.NW}" height="${G.NH}" rx="10" fill="none" pointer-events="all"
        stroke="${selB===i?A:(S.mode==='health'?colH(nb.status):(hotIn(nb)?HOTC():devCol(nb)))}" stroke-width="${selB===i?3.4:(hotIn(nb)?3:1.8)}"/>
      ${''/* ⚠ v3.30.8：刀片名进 PANCAP（见下），不画在这里 —— 右组那 8 条去 RoCE板的线
             正好从这一行字上穿过去，而连线永远画在器件之上 */}
      ${isT?'':`<rect x="${G.nx(i)+G.NW/2-12}" y="${G.NY-6}" width="24" height="12" rx="4" fill="${selB===i?A:'#6FB3E0'}"/>`}</g>`;
    /* ⭐ v3.30.9（评审意见 2）：**没放大 Union 时，刀片名与上层 L2 同号（32px）** ——
       这时候这一层要回答的是「下游是哪 8 块板」，名字就是这一层的主角。
       放大之后主角变成连线和那 8 张卡，名字退到 22px 让位（`zoom` 一档切换）。 */
    PANCAP+=`<text x="${G.nx(i)+G.NW/2}" y="${G.NY+(zoom?36:42)}" fill="#E7EFFA" font-size="${zoom?22:32}" font-weight="700" text-anchor="middle"
      opacity="${on===false?.42:(zoom&&!isT?.55:1)}" paint-order="stroke" stroke="#1A2029" stroke-width="7"
      stroke-linejoin="round">${nb.name}</text>`;
    if(isT){
      nb.cards.forEach((k,j)=>{
        const cx=cardX(i,j), cy=G.NY+CDT, ch=G.NH-CDT-24;
        s+=`<g class="clk" data-act="npu" data-id="${k.id}" data-pod="${P.id}" data-blade="${nb.id}">
          <rect x="${cx}" y="${cy}" width="${CDW}" height="${ch}" rx="5"
            fill="${lyF(k,'#22364F')}" fill-opacity="${lyO()}"
            stroke="${S.mode==='health'?colH(k.status):devCol(k)}" stroke-width="1.6"/>
          <rect x="${cx+CDW/2-7}" y="${cy-5}" width="14" height="10" rx="3" fill="#6FB3E0"/>
          ${/* ⛔ v3.30.3：卡底下原来写 8 遍「NPU」；顺手把号从 0 起改成 1 起，与全屏的 NPU 1–8 对齐 */''}
          <text x="${cx+CDW/2}" y="${cy+ch/2+8}" fill="#E7EFFA" font-size="36" font-weight="700" text-anchor="middle">${j+1}</text></g>`;
      });
    }   /* ⛔ v3.30.3：非目标刀片里原来写「8 张 NPU」—— 8 个盒子写同一句话，等于没写 */
  });

  /* ---- IO 层（v3.30.5，评审意见 5/6）：2 块 RoCE板 —— 这一层**不展开**，
     板里只画当前这颗 Union 连的那 2 个 芯片，其余 14 个用省略号顶掉。
     两块板都摆在右半边，正对右组那 8 颗 Union —— **位置本身就说明了「左组不连 IO」**。 */
  [0,1].forEach(k=>{
    const io=P.io[k]; if(!io)return;
    const focus = (zoom&&isDown&&ioBoard===k) ? zoomU
                : ((!zoom&&selU>=8&&selU<16&&ioOfUnion(selU)===k) ? selU : -1);
    const dim = focus>=0 ? 1 : (zoom||selU>=0 ? .42 : 1);
    s+=`<g class="clk" data-act="ioblade" data-id="${io.id}" data-pod="${P.id}" opacity="${dim}">
      <rect x="${G.iox(k)}" y="${G.IOY}" width="${G.ioW}" height="${G.IOH}" rx="10" fill="none" pointer-events="all"
        stroke="${focus>=0?A:(S.mode==='health'?colH(io.status):devCol(io))}" stroke-width="${focus>=0?3.2:1.8}"/>
      ${/* ⭐ v3.30.9（评审意见 3）：板名与 NPU 刀片名同一档 —— 没放大时 32px，放大后 22px。 */''}
      <text x="${G.iox(k)+30}" y="${G.IOY+(zoom?38:46)}" fill="#E7EFFA" font-size="${zoom?22:32}" font-weight="700">${io.name}</text>`;
    if(focus>=0){
      ioChipsOfUnion(focus).forEach((ci,n)=>{
        const cx=ioChipX(G,k,n), cy=G.IOY+IOCY0;
        /* ⭐ v3.30.6（评审意见 3）：芯片侧也要有口号 —— 药丸挂在芯片正上方，
           与 Union 面板上的 Port 9 / 18 构成「一条线两端都有号」（同 v3.30.1 坑 63）。
           口号按刀片序号取：61/63 → P1，62/64 → P2（每个芯片被 2 块 SFU 各占一个口）。 */
        const pn='P'+(swIdx%2+1);
        s+=`<rect x="${cx}" y="${cy}" width="${IOCW}" height="${IOCH}" rx="7"
            fill="${lyF(io,'#22364F')}" fill-opacity="${lyO()}" stroke="${A}" stroke-width="2"/>
          <text x="${cx+IOCW/2}" y="${cy+50}" fill="#E7EFFA" font-size="26" font-weight="700" text-anchor="middle">${pad2(ci+1)}</text>`;
        /* ⭐ v3.30.8（评审意见 1）：药丸**进 PANCAP，不进 s** ——
           连线是最后追加的（要压住外框），画在 s 里必被两条 IO 线划穿（坑 43 的四层顺序：
           底框 → 器件 → 连线 → 标签）。这一处是全局巡检里唯一漏网的：
           sfuBox 的端口药丸、PIC 组标、面板小标早就在标签层了。
           ⚠ 药丸挪到芯片**上方 34px**、引线加长，让它离开线束最密的那一段。 */
        PANCAP+=`<path d="M${cx+IOCW/2},${cy} L${cx+IOCW/2},${cy-34}" stroke="${A}" stroke-width="1.8" opacity=".7"/>
          <rect x="${cx+IOCW/2-32}" y="${cy-66}" width="64" height="32" rx="9" fill="#0A1A16" stroke="${A}" stroke-width="2"/>
          <text x="${cx+IOCW/2}" y="${cy-44}" fill="#8FE3DA" font-size="21" font-weight="700" text-anchor="middle">${pn}</text>`;
      });
      /* ⭐ v3.30.9（评审意见 3）：**总数跟在省略号后面** —— 原来挂在板名右侧，
         离省略号 1000px 远，观众不会把两者联系起来。「…… 等 16 个芯片」是一句话，
         省略号说「还有」，数字说「有多少」，必须挨着。 */
      s+=`<text x="${ioChipX(G,k,2)+40}" y="${G.IOY+IOCY0+54}" fill="#7089A8" font-size="34" letter-spacing="4">……</text>
          <text x="${ioChipX(G,k,2)+150}" y="${G.IOY+IOCY0+52}" fill="#8FA9C4" font-size="26">等 ${IO_NICS} 个 芯片</text>`;
    } else {
      const _cx=G.iox(k)+G.ioW/2;
      s+=`<text x="${_cx-110}" y="${G.IOY+IOCY0+54}" fill="#7089A8" font-size="34" letter-spacing="4">……</text>
          <text x="${_cx}" y="${G.IOY+IOCY0+52}" fill="#8FA9C4" font-size="26">等 ${IO_NICS} 个 芯片</text>`;
    }
    s+=`</g>`;
  });

  const IY2=G.NZ[1]+G.NZ[3];
  /* ---- 展开面板：Port 1–18（下面板 1–9 / 上面板 10–18），正对被放大的 Union ---- */
  const IDLEF='#2A3444', IDLET='#7E94B4';                  // 空闲口：灰底灰字，不参与"蓝=在用"这套色
  if(zoom){
    const uL=(zoomU<16?G.ux(zoomU):G.ix(zoomU-16)), uW=(zoomU<16?G.DW:G.IW);
    /* 上行面板：Port 14–17（各 2 条 lane → 组内 4 个光模块）+ Port 18 空闲。
       ⭐ v3.30.4：**互联 Union 没有这块面板** —— 它不接光模块，18 个口全部朝下。 */
    if(isDown){
    s+=`<rect x="${ZX}" y="${ZY}" width="${ZW}" height="${ZH}" rx="14" fill="none" stroke="${A}" stroke-width="2.6"/>
      <rect x="${uL+2.6}" y="${ZY+ZH-4}" width="${uW-5.2}" height="8" fill="#0F2A24"/>
`;
    UPN.forEach((n,q)=>{
      const idle=isIdle(n), pv=(zc.portBw||[])[n-1];
      /* ⭐ v3.30.2（评审意见 3）：蓝色色块上**只留数字**，不再写 "Port"。
         左侧标签栏已经写了一次 Port，格子里每个都再写一遍是同一句话说 18 次。 */
      s+=`<rect x="${px(q)+3}" y="${PY2}" width="${pw(q)-6}" height="${PH2}" rx="7" fill="${idle?IDLEF:portCol(pv)}"/>
          <text x="${px(q)+pw(q)/2}" y="${PY2+42}" fill="${idle?IDLET:portTxt(pv)}" font-size="${isOmPort(n)?21:19}" font-weight="700" text-anchor="middle">${n}</text>`;});
    /* ⛔ v3.30.3（评审意见 4）：这里原来有两条用途小标（「→ 4 个光模块」/「空闲」）。
       放大态本来就挤，而**号段就是用途**（14–17 上行 / 18 空闲），连线也画出来了 ——
       一句只在这一个地方说一遍、说完就没人再用的话，删掉不损失信息。 */
    for(let q=0;q<8;q++){
      const onL=selLane<0?null:selLane===q;
      /* ⭐ v3.30.3（评审意见 5）：8 块 lane，**块上不写字** ——
         交叉配对（1/3→①、2/4→②、5/7→③、6/8→④）由连线自己画出来，编号从没被引用过。 */
      /* ⭐ v3.30.4（评审意见 1）：块上写 `×2` —— 一条 lane 里有 2 条线，
         这是**量**不是名，8 块写同一个词不违反「不重复」那条（它说的是每一块自己的构成）。
         块宽只有 ~28px，16px 粗体的 `×2` 约 20px，刚好装下。 */
      s+=`<g class="clk" data-act="lane" data-id="${zc.id}-L${q}" data-om="${omBase+laneToOm(q)}" data-pod="${P.id}" data-blade="${sw.id}" opacity="${onL===false?.42:1}">
        <rect x="${lx(q)}" y="${LY}" width="${LW}" height="${LH}" rx="6" fill="${onL===true?'#0A3A4C':laneCol((zc.laneBw||[])[q])}" stroke="${onL===true?A:laneCol((zc.laneBw||[])[q])}" stroke-width="${onL===true?3:1}"/>
        <text x="${lx(q)+LW/2}" y="${LY+37}" fill="${onL===true?A:portTxt((zc.laneBw||[])[q])}" font-size="17" font-weight="700" text-anchor="middle">×2</text></g>`;
    }
    const lbl=S.mode==='health'?null:'#7089A8';
    s+=`<text x="${ZX+ZP-14}" y="${LY+37}" fill="${lbl||LCOL}" font-size="18" font-weight="700" text-anchor="end">lane</text>
        <text x="${ZX+ZP-14}" y="${PY2+42}" fill="${lbl||PCOL}" font-size="18" font-weight="700" text-anchor="end">Port</text>`;
    }
    /* 下面板：下行 Union = Port 1–13（1–8 → NPU，9 空闲，10–13 → 互联 Union）
               互联 Union = Port 1–18（1–16 → 本组 8 颗下行 Union 各 2 条，17/18 空闲） */
    {
      s+=`<rect x="${DZX}" y="${DZY}" width="${DZW}" height="${DZH}" rx="14" fill="none" stroke="${A}" stroke-width="2.6"/>
        <rect x="${uL+2.6}" y="${DZY-4}" width="${uW-5.2}" height="8" fill="#0F2A24"/>
        <text x="${DZX+ZP-14}" y="${DPY+40}" fill="${S.mode==='health'?PCOL:'#7089A8'}" font-size="18" font-weight="700" text-anchor="end">Port</text>`;
      const pfs=DPW<26?16:20;                   // 互联 Union 18 格更窄，字号跟着降一档
      DPN.forEach((n,q)=>{
        const idle=isIdle(n);
        s+=`<rect x="${dpx(q)+2}" y="${DPY}" width="${DPW-4}" height="${DPH}" rx="6" fill="${idle?IDLEF:portCol(58+((q*13)%38))}"/>
            <text x="${dpx(q)+DPW/2}" y="${DPY+40}" fill="${idle?IDLET:portTxt(58)}" font-size="${pfs}" font-weight="700" text-anchor="middle">${n}</text>`;});
    }
  }

  const info = zoom
    ? (selLane>=0 ? `已选中 Port ${laneUpPort(selLane)} 的一条 lane → 光模块 ${omFull(omBase+laneToOm(selLane))}`
      : selOm>=0 ? `已选中光模块 ${omFull(selOm)} ← 2 条 lane（共 4 条线）`
      : isDown ? `Port 1–8 各接 ${P.npu[tgtB].name} 的一张卡　｜　Port 10–13 接互联 ${uLbl(sw.chipList[pair[0]])} / ${uLbl(sw.chipList[pair[1]])}（各 2 条）　｜　Port 14–17 共 8 lane 交叉上行 ${omFull(omBase)} – ${omLbl(omBase+3)}　｜　Port 9 / 18 空闲`
      : `互联 Union：Port 1–16 各接本组一颗下行 Union 的一条线（8 颗 × 2 条）　｜　Port 17 / 18 空闲　｜　不接光模块`)
    : selOm>=0
      ? `已选中 ${omFull(selOm)}：↓ 归属 ${unionsOfOmGrp(Math.floor(selOm/4)).map(u=>uLbl(sw.chipList[u])).join(' / ')}`
    : (selU>=0&&selU<16
      ? `已选中 ${uLbl(sw.chipList[selU])}：↓ ${P.npu[sw.chipList[selU].npuBlade].name}　→ 互联 ${uLbl(sw.chipList[interOf(sw.chipList[selU].grp)[0]])} / ${uLbl(sw.chipList[interOf(sw.chipList[selU].grp)[1]])} 各 2 条`
      : `16 个下行 U1.1–U1.16（左 8 / 右 8）各连一块 NPU 刀片，每块刀片由 2 个 Union 接入 ｜ 4 个互联 U2.1–U2.4 ｜ 对外 32 × 800G 光模块 = 8 个 PIC，每组 4 个（组内 LPO1–LPO4）`);
  /* 故障气泡：挂在「坏光模块 → L2」那条链路的中点上（这里才是这条故障的最底层） */
  let bub='';
  bubFor('swblade',sw.id).forEach(bb=>{
    const i=(OMBAD[sw.id]||[0])[0];
    /* 锚在**端口本身**（那个 OSFP 方块的中心），不是它到 L2 的那条链路 ——
       接口非法报文是端口级故障，链路只是受害者 */
    const ax=G.omx(i)+G.OMW/2, ay=G.OMY+G.OMH/2;
    /* 药丸直接压在这个 OSFP 正上方（间隙 14px），引线只剩一小截竖线；
       卡片本身仍朝远离锚点的一侧展开，别把这个端口自己盖住。 */
    /* 药丸压在这个 OSFP 正上方；卡片掉到光模块行**下方**的空白带里，不遮挡端口本身 */
    bub+=alarmBubble(bb,ax,G.OMY+6,{pillY:G.OMY-64, cardX:ax-330, cardY:G.OMY+G.OMH+28});
  });
  return s+L+ZCAP2+PICCAP+PANCAP+bub;   // 连线最后追加 → 虚线浮在外框之上；PIC 组标 / 面板小标再浮在连线之上（四层：底框→器件→连线→标签）
}

function vNetDev(v){
  const nc=findNet(v.cab), d=nc.dev.find(x=>x.id===v.id);
  let s=head(`${nc.name} · ${d.name}`,'2 × 灵衢 L2 互联芯片（每芯片 128 端口 @400G / 128 光模块）· 下联各 Pod 的灵衢互联刀片');
  d.chipList.forEach((c,i)=>{
    const x=200+i*1520, y=200;
    const cc=devCol(c);
    s+=`<g class="clk" data-act="ichip" data-id="${c.id}" data-cab="${nc.id}" data-dev="${d.id}">
      <rect x="${x}" y="${y}" width="1360" height="560" rx="14" fill="#0A2130" stroke="${cc}" stroke-width="1.8"/>
      <text x="${x+40}" y="${y+52}" fill="#DFF5F1" font-size="28" font-weight="700">${c.name}</text>
      <text x="${x+40}" y="${y+90}" fill="#5C6F8E" font-size="19">128 × 400G 端口 · 128 光模块 · 带宽 ${c.bw}% · ${c.temp}°C</text>
      ${Array.from({length:128},(_,q)=>{const px=x+40+(q%32)*41, py=y+120+Math.floor(q/32)*44;
        const bad=d.status==='warn'&&q===53;
        return `<rect x="${px}" y="${py}" width="34" height="34" rx="4" fill="${bad?'#5A3510':'#0F3A44'}" stroke="${bad?'#FFB44F':'#17494A'}" stroke-width="${bad?1.8:.8}"/>`}).join('')}
      <text x="${x+40}" y="${y+320}" fill="#4E6884" font-size="16">端口 1-128</text></g>`;
  });
  s+=`<text x="200" y="840" fill="#5C6F8E" font-size="20" letter-spacing="3">下联 → 16 个 Pod 的第 ${nc.idx+1} 根灵衢互联刀片（推测拓扑）</text>`;
  D.pods.forEach((p,i)=>{
    const x=170+i*196, y=900;
    const sw=p.sw[nc.idx];
    const c=sw.status==='err'?'#FF5B6E':'#3E8FC4';
    s+=`<path d="M1640,760 C1640,830 ${x+80},840 ${x+80},${y}" fill="none" stroke="${c}" stroke-width="${sw.status==='err'?3:1.4}" opacity="${sw.status==='err'?.85:.28}" class="flow"/>
      <g class="clk" data-act="swblade" data-id="${sw.id}" data-pod="${p.id}">
      <rect x="${x}" y="${y}" width="160" height="104" rx="10" fill="#0B1826" stroke="${c}" stroke-width="${sw.status==='err'?2.4:1.2}"/>
      <text x="${x+80}" y="${y+44}" fill="#CFE0F5" font-size="21" font-weight="600" text-anchor="middle">Pod-${pad2(i+1)}</text>
      <text x="${x+80}" y="${y+78}" fill="#5C6F8E" font-size="17" text-anchor="middle">S${nc.idx+1}</text></g>`;
  });
  if(d.status==='warn')s+=`<rect x="200" y="1120" width="1000" height="140" rx="14" fill="rgba(255,180,79,.1)" stroke="#FFB44F"/>
    <text x="235" y="1174" fill="#FFB44F" font-size="26" font-weight="700">⚠ Pre-FEC BER 1.8e-6 持续 14 分钟</text>
    <text x="235" y="1216" fill="#93A7C4" font-size="20">芯片 #2 端口 54 · 建议排查光纤与光模块清洁度</text>`;
  return s;
}

function vMgmt(v){
  const p=findPod(v.pod);
  let s=head(`${p.name} · 灵衢管理刀片`,'Pod Manager ×1 · BMC ×1 · 交换芯片 ×1 —— 柜内带外管理域汇聚');
  s+=`<rect x="1240" y="220" width="800" height="170" rx="15" fill="#0F2430" stroke="#2FD4C4" stroke-width="2"/>
    <text x="1640" y="282" fill="#9BE9E0" font-size="32" font-weight="700" text-anchor="middle">Pod Manager</text>
    <text x="1640" y="330" fill="#93A7C4" font-size="20" text-anchor="middle">在线 · 负载 ${p.mgmt.util}% · 固件 v2.4.1</text>
    <text x="1640" y="368" fill="#5C6F8E" font-size="18" text-anchor="middle">纳管 23 刀片 + 电源框 + 液冷 CDU</text>`;
  [['BMC ×1','带外控制器',1000],['交换芯片 ×1','管理网汇聚',2280]].forEach(([t,d,x])=>
    s+=`<rect x="${x-190}" y="250" width="380" height="120" rx="12" fill="#0A1523" stroke="#2C6E8F"/>
      <text x="${x}" y="298" fill="#9FCBFF" font-size="24" font-weight="600" text-anchor="middle">${t}</text>
      <text x="${x}" y="336" fill="#5C6F8E" font-size="18" text-anchor="middle">${d}</text>`);
  const tg=[['8 × NPU 刀片 BMC/UBM',420],['8 × CPU 刀片 BMC/UBM',1100],['4 × 灵衢互联刀片',1780],['2 × IO 刀片 + 电源框 RM310',2600]];
  tg.forEach(([t,x])=>s+=`<path d="M1640,390 C1640,600 ${x},640 ${x},800" fill="none" stroke="#2FD4C4" stroke-width="2" opacity=".4" class="flow"/>
    <rect x="${x-240}" y="800" width="480" height="120" rx="12" fill="#0D1927" stroke="#26405F"/>
    <text x="${x}" y="870" fill="#CFE0F5" font-size="22" text-anchor="middle">${t}</text>`);
  s+=`<rect x="1240" y="1180" width="800" height="150" rx="15" fill="#0A1523" stroke="#4FA8FF" stroke-width="2"/>
    <text x="1640" y="1240" fill="#9FCBFF" font-size="28" font-weight="700" text-anchor="middle">CCAE 管理平面</text>
    <text x="1640" y="1288" fill="#5C6F8E" font-size="20" text-anchor="middle">遥测 / 故障 / 固件升级 / 拓扑自动发现</text>
    <path d="M1640,920 L1640,1180" stroke="#4FA8FF" stroke-width="3" class="flow" opacity=".55"/>`;
  return s;
}

function vPwr(v){
  const isNet=v.id[0]==='X';
  const o=isNet?findNet(v.cab||v.id.slice(0,2)).pwr:findPod(v.pod).pwr;
  const owner=isNet?findNet(v.cab||v.id.slice(0,2)).name:findPod(v.pod).name;
  let s=head(`${owner} · 电源框`,`电源模块 × ${o.mods} · 机柜管理主模块 RM310 ×1（BMC + CPLD）`);
  const n=o.mods, cols=Math.min(9,n);
  Array.from({length:n}).forEach((_,i)=>{
    const x=180+(i%cols)*330, y=240+Math.floor(i/cols)*230;
    const u=Math.round(rr(48,86));
    s+=`<rect x="${x}" y="${y}" width="290" height="190" rx="12" fill="#1B1A10" stroke="#5A5028" stroke-width="1.3"/>
      <text x="${x+145}" y="${y+52}" fill="#D8C271" font-size="24" font-weight="600" text-anchor="middle">PSU ${pad2(i+1)}</text>
      <rect x="${x+35}" y="${y+82}" width="220" height="12" rx="6" fill="#2A2612"/>
      <rect x="${x+35}" y="${y+82}" width="${220*u/100}" height="12" rx="6" fill="#E0C46B"/>
      <text x="${x+145}" y="${y+140}" fill="#8A7C46" font-size="19" text-anchor="middle">${u}% · ${(u*33).toFixed(0)}W</text>`;
  });
  const ry=240+Math.ceil(n/cols)*230+40;
  s+=`<rect x="180" y="${ry}" width="1200" height="200" rx="14" fill="#0F2430" stroke="#2FD4C4" stroke-width="1.8"/>
    <text x="220" y="${ry+60}" fill="#9BE9E0" font-size="28" font-weight="700">机柜管理主模块 RM310</text>
    <text x="220" y="${ry+108}" fill="#93A7C4" font-size="20">BMC 在线 · CPLD v1.7 · 温控 / 上下电时序 / PSU 均流</text>
    <text x="220" y="${ry+152}" fill="#5C6F8E" font-size="19">当前总输出 ${o.kw} kW · 冗余 N+1 正常</text>`;
  return s;
}

