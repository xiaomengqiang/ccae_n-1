/* ---------- 柜内公共构件：一律「色块 + 短标签」，不堆细节 ---------- */
/* 柜内辅助模块统一配色：电源框 / 管理刀片 / RoCE板 / 风扇模块 长得一样，只靠文字区分 */
const AUX={fill:'#122033',stroke:'#26456B',txt:'#7FA6D0'};
function slab(x,y,h,label,fill,stroke,txt,fs,act,id,ctx,st){
  const bs=S.mode==='health'&&st&&st!=='ok';
  return `<g class="clk" data-act="${act}" data-id="${id}" ${ctx||''}>
    <rect x="${x+PADI}" y="${y}" width="${CW-PADI*2}" height="${h}" rx="4"
      fill="${fill}" stroke="${bs?colH(st):stroke}" stroke-width="${bs?2:1}"/>
    <text x="${x+CW/2}" y="${y+h/2+fs*0.36}" fill="${txt}" font-size="${fs}" text-anchor="middle" letter-spacing="1">${label}</text></g>`;
}
/* 电源框：柜顶，占比更大的一块 */
function pwrBox(x,y,o,owner,ctx){
  return slab(x,y,PWRH,'电源框',AUX.fill,AUX.stroke,AUX.txt,18,'pwrbox',o.id,ctx,o.status);
}
/* 柜名条：柜内最底部，正反面同一位置 */
/* badge：业务视角下柜名条右侧挂一个「N 节点」药丸。柜内宽只有 134px，
   22px 的居中柜名 + 药丸必然压字 —— 所以带 badge 时柜名降到 18px 并改为左对齐，
   两者各占一半，谁也不盖谁。 */
function nameBar(x,y,id,label,st,net,badge){
  const IWn=CW-PADI*2;
  return `<g class="clk" data-act="${net?'netcab':'pod'}" data-id="${id}">
    <rect x="${x+PADI}" y="${y}" width="${IWn}" height="${NAMEH}" rx="5" fill="#17273F"/>
    ${badge
      ?`<text x="${x+PADI+6}" y="${y+26}" fill="#CFE0F6" font-size="17" font-weight="700">${label}</text>
        <rect x="${x+CW-PADI-46}" y="${y+9}" width="43" height="22" rx="7" fill="rgba(0,230,162,.18)" stroke="#00E6A2" stroke-width="1.1"/>
        <text x="${x+CW-PADI-24.5}" y="${y+25}" fill="#00E6A2" font-size="14" font-weight="700" text-anchor="middle">${badge}<tspan font-size="10" font-weight="500" dx="1.5">节点</tspan></text>`
      :`<text x="${x+CW/2}" y="${y+27}" fill="#CFE0F6" font-size="22" font-weight="700" text-anchor="middle">${label}</text>`}
    ${S.mode==='health'&&st==='err'&&!badge?`<circle cx="${x+CW-PADI-13}" cy="${y+NAMEH/2}" r="5.5" fill="${colH('err')}"/>`:''}</g>`;
}
/* 灵衢互联设备方盒：正反面完全一致，无进度条 */
/* 灵衢互联设备：外框只是容器 —— 不参与状态、也不参与图层着色。
   一切都表达在 2 颗互联芯片上，与计算柜里「染 NPU / CPU」同一粒度。
   外框和芯片同时染，等于同一件事说两遍，而且外框面积大会盖掉芯片的信号。
   芯片尺寸参照 CPU 方块略大一档；名字放在设备标题下方一行，不写在方块上（放不下也挤）。 */
function netDevBox(x,y,w,h,d,cabId){
  const sel=S.sel&&S.sel.id===d.id;
  const CW2=36, CH2=48, GAP=12;
  const cx0=x+w/2-(CW2*2+GAP)/2, cy0=y+h/2-CH2/2+12;
  const hd=hotIn(d);
  return `<g class="clk" data-act="netdev" data-id="${d.id}" data-cab="${cabId}">
    ${hd&&!sel?`<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="9" fill="none"
      stroke="${HOTC()}" stroke-width="1.5" opacity=".42"/>`:''}
    ${/* ⭐ v3.30.5（评审意见 1）：**首页正面的 L2 设备要跟着叠加图层出状态**。
         原来这个盒子恒定是 `#1E5A5D` 的静默描边 —— 三个图层切过去，正面这 16 台设备
         一点变化都没有，观众会以为它们「不在这套体系里」。
         故障态 → 绿 / 红（colH）；负载 · 能耗 → 色阶（devCol）。描边不填充：
         L2 设备是**容器**，填充留给真正被度量的叶子（原则 5）。 */''}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"
      fill="#0A2131" stroke="${sel?'#00E6A2':hd?HOTC():(S.mode==='health'?colH(d.status):devCol(d))}" stroke-width="${sel?3:hd?2.6:(d.status!=='ok'&&S.mode==='health'?2.6:1.6)}"/>
    <text x="${x+w/2}" y="${y+28}" fill="#DFF5F1" font-size="19" font-weight="700" text-anchor="middle">灵衢L2-${pad2((d.gidx!=null?d.gidx:d.idx)+1)}</text>
    ${/* ⚠ 下面这行**不加「灵衢 L2」前缀**：盒子标题上一行已经写了「灵衢L2-07」，层号在那里。
          v3.30 统一改名时给它加过前缀，结果 17px × 10 字超出 118px 的盒宽，
          背面 16 台设备的这行字首尾相撞成一片糊。层号只需要在**一个**地方出现。 */''}
    ${S.face==='front'?fanFace(x,y,w,h,d):`
    <text x="${x+w/2}" y="${cy0-13}" fill="#8FC6C0" font-size="17" text-anchor="middle" letter-spacing="1">互联芯片 ×2</text>
    ${(d.chipList||[0,1]).map((ic,q)=>{
      const obj=typeof ic==='object', cc=obj?devCol(ic):devCol(d);
      const bad=obj&&S.mode==='health'&&ic.status!=='ok';
      return `<g class="clk" data-act="ichip" data-id="${obj?ic.id:d.id+'-C'+(q+1)}" data-cab="${cabId}" data-dev="${d.id}">
        <rect x="${cx0+q*(CW2+GAP)}" y="${cy0}" width="${CW2}" height="${CH2}" rx="5"
          fill="${bad?colH('err'):(S.mode==='health'?'#1E6B65':cc)}" fill-opacity="${S.mode==='health'?1:.62}"
          stroke="${bad?colH('err'):(S.mode==='health'?'#25705F':cc)}" stroke-width="1.4"/></g>`;}).join('')}`}</g>`;
}
/* ⭐ v3.30（评审意见）：**互联柜正面画风扇，不画芯片**。
   理由是物理的：站在机柜正面看到的是风墙， 在机箱里，从正面看不见 ——
   之前正面画两颗芯片，等于把「里面有什么」画到了「外面看得见什么」的位置上。
   每台 L2 设备两排各 3 个、共 6 个圆；故障用**描边**表达（叶子填充留给真正被度量的器件）。
   ⚠ 连带：正面的柜底「风扇模块 ×6」那条色块要去掉 —— 风扇现在画在设备里了，
     柜底再来一条就是同一个柜里两套风扇，观众会问「到底几个」。
   ⚠ 计数口径变了：原来「互联柜风扇 24 = 4 柜 × 6」，现在是**每台设备 6 个 → 每柜 24 → 全场 96**。
     交接文档二点五的器件计数表要跟着改（已改）。 */
/* ⭐ v3.30.1（评审意见 1）：圆圈里从「一个圆点」换成**三片扇叶**。
   一个圆点在暗底上就是一个圆点，它可以是风扇、指示灯、螺丝、任何东西 ——
   形状是这一格唯一的语义（原则 ①：颜色只表达状态，结构靠位置和形态），
   点表达不了「这是会转的东西」，叶片可以。
   画法：3 条从轮毂甩出去的圆弧，round 线帽，互成 120° —— 在 r≈19（上屏约 44px 直径）
   这个尺寸上，填充的叶片会糊成一坨，**描边的弧线**反而看得清（同四点十五：暗底细节靠形不靠面）。 */
function fanBlades(cx,cy,r,col,bad){
  const rad=a=>a*Math.PI/180;
  const pt=(rr,a)=>[(cx+rr*Math.cos(rad(a))).toFixed(1),(cy+rr*Math.sin(rad(a))).toFixed(1)];
  let o=`<circle cx="${cx}" cy="${cy}" r="${(r*0.17).toFixed(1)}" fill="${col}" opacity="${bad?1:.85}"/>`;
  for(let k=0;k<3;k++){
    const a0=-90+k*120, a1=a0+104;
    const [x0,y0]=pt(r*0.30,a0), [x1,y1]=pt(r*0.76,a1);
    o+=`<path d="M${x0},${y0} A${(r*0.52).toFixed(1)},${(r*0.52).toFixed(1)} 0 0 1 ${x1},${y1}"
      fill="none" stroke="${col}" stroke-width="${bad?2.4:1.9}" stroke-linecap="round" opacity="1"/>`;
  }
  return o;
}
function fanFace(x,y,w,h,d){
  const cols=3, rows=2, gap=14, r=Math.min(19,(w-34-(cols-1)*gap)/cols/2);
  const gw=cols*(r*2)+(cols-1)*gap, gh=rows*(r*2)+(rows-1)*gap;
  const gx=x+w/2-gw/2;
  /* 网格在**标签下方的剩余空间**里居中，不是在整个盒子里居中 —— 否则视觉重心偏上，
     盒子下半截空一大片（第一版就是这个毛病）。 */
  const gy=y+34+((h-34)-gh)/2+r;   // 34 = 盒名那一行；小字删了之后可用高度往上长了 24px
  const bad=S.mode==='health'&&d.status!=='ok';
  const hp=S.mode==='pwr'?heat(fanPwr(d)):null;
  const col=bad?colH('err'):(hp||'#3F7B70');
  /* ⛔ v3.30.1：删掉「风扇 ×6」那行小字。六个圆圈就在下面，**数得出来的东西不用再写一遍**
     （同原则：图形表达结构，文字只补图形说不出来的）。删掉之后网格重新居中到整个可用高度。 */
  let g='';
  for(let i=0;i<rows*cols;i++){
    const cx=gx+r+(i%cols)*(r*2+gap), cy=gy+Math.floor(i/cols)*(r*2+gap);
    g+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${bad?2.6:1.7}"/>`
      + fanBlades(cx,cy,r,col,bad);
  }
  return g;
}
/* MINI = 逻辑视图底部那条「物理定位带」。
   ⚠ 它画的是**同一份 clusterFront**，只是关掉弧线/图例/分组标题/交互命中区 ——
   位置完全一致，光柱才敢直接往下打。另画一份简化图会导致上下对不齐。 */
let MINI=false;
/* 文本宽度估算：CJK 按字号整宽、ASCII 半宽。别用 length*fontSize —— 中英混排必错位（踩过） */
const TW=(t,fs)=>[...String(t)].reduce((a,c)=>a+(c.charCodeAt(0)>255?fs:fs*0.66),0);
