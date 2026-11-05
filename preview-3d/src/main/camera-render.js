/* ================== 渲染 ================== */
/* ---- 相机：双击机柜推进聚焦（同一张图放大，不新增层级） ---- */
const CAM0={x:0,y:0,w:VW,h:VH};
let cam={...CAM0}, camT={...CAM0}, camRAF=null;
function applyCam(){const svg=$('stageInner').querySelector('svg');
  if(svg)svg.setAttribute('viewBox',`${cam.x.toFixed(1)} ${cam.y.toFixed(1)} ${cam.w.toFixed(1)} ${cam.h.toFixed(1)}`)}
function camStep(){let done=true;
  ['x','y','w','h'].forEach(k=>{const d=camT[k]-cam[k];
    if(Math.abs(d)>0.6){cam[k]+=d*0.2;done=false}else cam[k]=camT[k]});
  applyCam();
  camRAF = done?null:requestAnimationFrame(camStep);}
function camTo(t){camT={...t}; if(!camRAF)camRAF=requestAnimationFrame(camStep)}
function zoomTo(id,noHist){
  if(S.view.lv!=='cluster')return;
  /* ⚠ 聚焦不走 render()（相机自己动），所以开场态药丸必须在这里显式撤掉 ——
     否则它们会留在 DOM 里跟着镜头一起放大，飘在半空。 */
  if(INTRO){INTRO=false; render()}
  if(!noHist)pushHist();
  const isNet=id[0]==='X';
  const i=isNet?D.nets.findIndex(n=>n.id===id):D.pods.findIndex(p=>p.id===id);
  const x=slotX(isNet?netSlot(i):podSlot(i))+CW/2;
  const y=(S.face==='front'?CY+CH/2:1110);
  const w=VW/1.72, h=VH/1.72;
  S.zoom=id; camTo({x:x-w/2,y:y-h/2,w,h}); syncZoomBtn(); renderKPI();   // 聚焦机柜 → 指标切到机柜级
  openSet.add(id); lastSelTree=null; buildTree(); syncTreeSel();          // 聚焦哪个柜，树就展开哪个柜
}
/* 退出聚焦 → 指标回集群级；同时重新布防开场态（回到全景 = 又变成"给人看"的状态）。
   render() 里 stageSVG 读的是**当前** cam，所以在飞行动画途中重绘不会跳 —— camStep
   每一帧都重新 querySelector('svg')，会自动接上新画的那棵。 */
function zoomOut(){S.zoom=null;camTo(CAM0);syncZoomBtn();renderKPI();introArm();render()}
function jumpTo(st){if(['ioblade','netdev','ichip'].includes(st?.view?.t))return;HIST.length=0;syncBack();Object.assign(S,st);S.zoom=null;cam={...CAM0};camT={...CAM0};syncZoomBtn();render()}
function syncZoomBtn(){$('zoomBtn').style.display=S.zoom?'':'none';
  if(S.zoom)$('zoomBtn').textContent='⤢ 退出聚焦 '+S.zoom}
function stageSVG(inner){inner=reskin(inner);
  /* preserveAspectRatio=meet 会取宽高比更紧的那一边来缩放。舞台卡片比 16:9 更扁，
     若 viewBox 用满 3280×1832，就会「以高度为准」，左右白白空出一大截。
     所以集群默认视角把 viewBox 收到内容的实际纵向范围（弧顶 ~100 → 图例 ~1740），
     比例贴近舞台，柜体才真正吃满宽度。聚焦某个机柜时交给 cam，下钻层用负留边撑满。 */
  if(S.view.lv==='logic')return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  const cluster = S.view.lv==='cluster';
  const camDefault = cam.w===VW && cam.h===VH;
  let vx=cam.x, vy=cam.y, vw=cam.w, vh=cam.h;
  if(cluster && camDefault){ vy=120; vh=1500; }
  else if(!cluster){ const pd=46; vx+=pd; vy+=pd; vw-=pd*2; vh-=pd*2; }
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`}
/* 某一面上肉眼能看到的故障数：正面 = 计算侧器件，背面 = 互联侧器件（含光模块）。
   只在故障图层显示 —— 原则 7：红色是稀缺资源，别让它漏进负载 / 能耗层。 */
function faceFaults(face){
  let n=0;
  if(face==='front'){
    D.pods.forEach(p=>{
      p.npu.forEach(b=>b.cards.forEach(k=>{if(k.status!=='ok')n++}));
      p.cpu.forEach(b=>{if(b.status!=='ok')n+=2});
      p.io.forEach(b=>{if(b.status!=='ok')n++});
      if(p.mgmt.status!=='ok')n++; if(p.pwr.status!=='ok')n++;
    });
  }else{
    D.pods.forEach(p=>p.sw.forEach(sw=>{
      /* 刀片自己红是因为里面那个光模块红 —— 容器不重复计数，数的是屏上看得见的红点 */
      if(sw.status!=='ok'&&!swHasBadOm(sw))n++;
      (OMBAD[sw.id]||[]).forEach(()=>n++);
    }));
    D.nets.forEach(nc=>{ if(nc.status!=='ok')n++;
      nc.dev.forEach(d=>{ if(d.status!=='ok')n++;
        (d.chipList||[]).forEach(c=>{if(c.status!=='ok')n++}) }) });
  }
  return n;
}
/* ================== 视图：逻辑（PD 实例） ==================
   同一批节点，两种排序。物理按「插在哪个柜哪个槽位」排，逻辑按「在哪个 PD 实例里」排。
   节点内部仍是 8 NPU + 2 CPU，颜色仍跟随 S.mode，没有第四套颜色系统。

   ⚠ v3.4 做了一次减法：删掉 KV Cache 通道、盒内指标行、节点级 KV 微条、标注括号、
     左下角对照表和一切解释性小字。大屏是给人扫一眼的，不是给人读的。
     服务的量化信息全部收进顶部 KPI 条（svcKPI），画面里只留结构。 */
/* ── 逻辑面板的排版尺度（v3.6 全面放宽）─────────────────────
   之前每一处留白都压在下限上，整块看着局促。这一版按一套统一的节奏重定：
     标题基线 → 下一个框顶      48
     框顶 → 框内标题基线        44~50（视字号）
     框内标题基线 → 内容顶      36~40
     内容底 → 框底              26~30
     容器左右内边距             34（组）/ 40（盒）
   竖向多出来的约 100px 从「面板到定位带的空隙」和「定位带缩放」里各让一点。 */
const LG={
  /* v3.7：舞台里的服务标题撤到舞台栏（和 物理/逻辑 切换同一行），
     面板顶因此可以从 340 提到 300，省出来的都给实例组。 */
  CY:300,
  HW:180, HH:208,             // 正六边形：208 ≈ 180 × 2/√3
  HGAP:120, PAD:100, MID:48,
  GPAD:34, GHEAD:80, BH:364, GGAP:32, GFOOT:26, K:1,
  PANELH:900,                 // 面板区的固定高度（= 两组满排时的高度），少于两组时在里面垂直居中
  /* BANDY 是「物理内容上边(376)」落在哪；机柜真正的底边 = BANDY + 1034×BANDS，
     调到 ~1810 才算把舞台底部用满（1476 那一段是被 MINI 剥掉的标注行，别浪费）。 */
  BANDY:1216, BANDS:0.52
};
/* v3.21.4：整块面板的缩放不再按「实例组数」查表，改成在 logicView 里按
   左右分栏排完之后反算「能填满 MAXW × PANELH 的 K」—— 见那里的注释。 */
function lgSetK(K){
  LG.K=K; LG.HW=180*K; LG.HH=208*K; LG.HGAP=120*K; LG.PAD=100*K; LG.MID=48*K;
  LG.GPAD=34*K; LG.GHEAD=Math.round(80*(K>1?1.12:1)); LG.GFOOT=26*K;
  LG.BH=Math.round(90*K+LG.HH+66*K);        // 90 = 盒标题区，66 = IP 行 + 底部留白
}
LG.BTX = Math.round((VW-3146*LG.BANDS)/2) - 67*LG.BANDS;
LG.BTY = LG.BANDY - 376*LG.BANDS;
LG.DX = 0;   // 定位带的横向补偿：面板和机柜各让一半，漏斗才能左右对称
// 20 cabinets use the same contiguous pitch as the source artwork.
const lgBandSlotX = slot => (VW-(20*92+19*1.1)*(lgBandW()/92))/2 + LG.DX + slot*93.1*(lgBandW()/92);
const lgBandX  = pi => lgBandSlotX(podSlot(pi));
const lgBandW  = () => CW*LG.BANDS;
const lgBandTop= () => LG.BTY + CY*LG.BANDS;
const lgBandH  = () => 460*(lgBandW()/92);

/* ── 逻辑节点：正六边形（尖顶）──────────────────────────
   3 行芯片的总高 = 六边形直边段的高度（HH/2），比例从内容长出来。
   顶部三角写刀片号 N01（配合组标题的柜号 = 完整物理定位），下方写 IP。 */
/* 芯片阵列的几何：hexNode 和「故障芯片定位」共用同一套，抄两份迟早对不上 */
function hexGeo(cx,cy){
  /* 六边形顶部写「柜号-节点号」（13-01）：P 池和 D 池汇总后跨了两个柜，
     只写节点号会出现两个「节点 01」。内容整体比几何中心下移 10u：顶部三角要留呼吸，
     贴着上边看起来像被顶住了。下面的三角本来就比上面空。 */
  const u=LG.HW/180, sq=32*u, sh=29*u, gp=7*u, rw=4*sq+3*gp;
  return {u,sq,sh,gp,x0:cx-rw/2, ry:[cy-41*u, cy-4*u, cy+33*u]};
}
const hexChipXY=(cx,cy,ki)=>{const g=hexGeo(cx,cy);
  return {x:g.x0+(ki%4)*(g.sq+g.gp)+g.sq/2, y:g.ry[ki<4?0:1]+g.sh/2}};
function hexNode(n,cx,cy){
  const hw=LG.HW/2, hh=LG.HH/2;
  const pts=[[cx,cy-hh],[cx+hw,cy-hh/2],[cx+hw,cy+hh/2],[cx,cy+hh],[cx-hw,cy+hh/2],[cx-hw,cy-hh/2]]
    .map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const G=hexGeo(cx,cy), u=G.u, sq=G.sq, sh=G.sh, gp=G.gp, x0=G.x0, ry=G.ry;
  const cell=(x,y,col,t,dark)=>`<rect x="${x}" y="${y}" width="${sq}" height="${sh}" rx="${4*u}" fill="${col}"
      fill-opacity="${S.mode==='health'?1:.78}"/>
    <text x="${x+sq/2}" y="${y+21*u}" fill="${dark}" font-size="${18*u}" font-weight="700" text-anchor="middle">${t}</text>`;
  let inner='';
  n.npu.cards.forEach((k,i)=>{
    const col=S.mode==='health'?(k.status==='ok'?'#1E6B65':colH(k.status)):devCol(k);
    inner+=cell(x0+(i%4)*(sq+gp), ry[i<4?0:1], col, 'N', S.mode==='health'?'#E7EFFA':'#08131F');
  });
  const cc=S.mode==='health'?(n.cpu.status==='ok'?'#1E4A72':colH(n.cpu.status)):devCol(n.cpu);
  const cx0=cx-(2*sq+gp)/2;
  /* ⚠ C 用深色，和 N 一致：芯片正常态在 neon 下是中绿 #17915C，
     压白字只有 2.95:1（AA 要 4.5）。深色字在同一块绿上是 7:1 以上。 */
  [0,1].forEach(i=>{ inner+=cell(cx0+i*(sq+gp), ry[2], cc, 'C', S.mode==='health'?'#E7EFFA':'#08131F') });
  /* 故障就在这张卡上，那颗 N 自己已经是红的 —— 六边形只补一圈描边把它挑出来。
     不需要「受影响」这类传播表达（原则③），也不需要任何文字说明。 */
  const bad=S.mode==='health'&&n.npu.cards.some(k=>k.status!=='ok');
  return `<g class="lgnode" style="cursor:default" data-act="npublade" data-id="${n.npu.id}" data-pod="${n.pod.id}">
    ${bad?`<polygon points="${pts}" fill="none" stroke="${colH('err')}" stroke-width="${10*u}" opacity=".18"/>`:''}
    <polygon points="${pts}" fill="#0A1826" stroke="${bad?colH('err'):'#2E7E78'}"
      stroke-width="${bad?2.4:1.4}" stroke-opacity="${bad?1:.7}"/>
    <text x="${cx}" y="${cy-56*u}" fill="#E7EFFA" font-size="${19*u}" font-weight="600"
      text-anchor="middle" letter-spacing="1">${pad2(n.pi+1)}-${pad2(n.bi+1)}</text>
    ${inner}
    <text x="${cx}" y="${cy+hh+44*u}" fill="${bad?'#FF8F9C':'#8FA9C4'}" font-size="${23*u}"
      text-anchor="middle">${nodeIP(n)}</text></g>`;
}

const boxCy = () => 90*LG.K + LG.HH/2;                 // 盒内六边形中心（相对盒顶）
const boxRowH = () => LG.HH + 60*LG.K;                 // 节点行的行距（含 IP 一行）
/* 盒宽/盒高按「这个盒排几列、整块面板排几行」算 —— 列数不再是全局常量，
   由 P/D 两个池按各自节点数分摊（见 logicView 里的 ROWS 推导）。 */
const boxWc = c => c*LG.HW+(c-1)*LG.HGAP+LG.PAD*2;
const boxHr = r => 90*LG.K + r*boxRowH() + 6*LG.K;
/* 一个盒 = 一个实例池。⭐ P 池在左、D 池在右：PD 分离的方向感是
   「请求先进 Prefill，拿到 KV 再交给 Decode 出词」，左 → 右就是这条流水线本身。
   上下叠会把时间上的先后读成层级上的包含，是另一件事。 */
function pdBox(title,sub,nodes,x,y,w,cols,H){
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${16*LG.K}" fill="#080F1B" stroke="#1B2942" stroke-width="1.2"/>
    
    ${sub?`<text x="${x+w-LG.PAD}" y="${y+50*LG.K}" fill="#5C7E88" font-size="${23*LG.K}" text-anchor="end">${esc(sub)}</text>`:''}`;
  nodes.forEach((n,i)=>{
    const r=Math.floor(i/cols), c=i%cols;
    s+=hexNode(n, boxX0(x,w,cols)+LG.HW/2+c*(LG.HW+LG.HGAP), y+boxCy()+r*boxRowH());
  });
  return {s,w,h:H};
}
/* 节点行在盒内水平居中：盒宽可能被「标题 + 右上角副标题」撑得比节点行还宽（单节点服务），
   左对齐的话一个六边形孤零零挂在左边。根因气泡的锚点也要走这个函数，否则会错位。 */
const boxX0=(x,w,cols)=>x+Math.max(LG.PAD,(w-(cols*LG.HW+(cols-1)*LG.HGAP))/2);

let LGBAD=null;
function logicView(){
  const b=bizOf(S.logic); if(!b)return '';
  const slo=sloOf(b.id);
  const groups=pdOf(b.id);
  /* ⭐ 一个实例组 = 一行，P 在左、D 在右：
       左列  Prefill 实例 1 / Prefill 实例 2 …
       右列  Decode  实例 1 / Decode  实例 2 …
     PD 分离的方向感是「请求先进 Prefill，拿到 KV 再交给 Decode 出词」，左 → 右就是这条流水线；
     而「实例 1 / 实例 2」是同一条流水线复制了几份 —— 那是并列关系，所以往下叠。
     两个维度各占一个方向，读图的人不用猜哪个是哪个。 */
  const multi=groups.length>1;
  const boxes=[];
  groups.forEach((g,i)=>{
    const sfx=multi?' '+(i+1):'';
    if(!g.d.length){ boxes.push({t:(b.k==='trn'?'训练工作组':'PD 融合实例')+sfx, n:g.p, col:b.k==='trn'?i%2:0, row:b.k==='trn'?Math.floor(i/2):i}) }
    else{
      boxes.push({t:'Prefill 实例'+sfx, n:g.p, col:b.k==='trn'?i%2:0, row:b.k==='trn'?Math.floor(i/2):i});
      boxes.push({t:'Decode 实例'+sfx,  n:g.d, col:1, row:i});
    }
  });
  const NCOL=Math.max.apply(null,boxes.map(x=>x.col))+1;
  boxes.forEach(x=>{
    const ps=[...new Set(x.n.map(n=>n.pod.idx))].sort((a,c)=>a-c);
    x.sub=x.n.length+' 节点 · 柜 '+(ps.length>1?pad2(ps[0]+1)+'–'+pad2(ps[ps.length-1]+1):pad2(ps[0]+1));
  });
  /* ── 排版推导 ──────────────────────────────
     每个盒里的节点数不多（16 节点服务 = 每组 2P + 6D），一行就排得下；
     真排不下时统一加一行（ROWS 对所有盒生效），否则同一列两个盒会一高一低。
     列宽取该列最宽的盒 —— 左列两个 P 盒必须一样宽，不然纵向边缘是锯齿。 */
  const MAXW=VW-100, MAXH=LG.PANELH;
  const COLGAP=()=>Math.round(24*LG.K), ROWGAP=()=>Math.round(24*LG.K);
  /* 盒宽还要能装下「标题 + 副标题」这一行，否则单节点服务的两段字会撞在一起 */
  const wOf=(x,r)=>Math.max(boxWc(Math.ceil(x.n.length/r)),
                            LG.PAD*2+TW(x.t,27*LG.K)+56+TW(x.sub,23*LG.K));
  const colW=r=>{const w=new Array(NCOL).fill(0);
    boxes.forEach(x=>{w[x.col]=Math.max(w[x.col],wOf(x,r))}); return w};
  const totalW=r=>colW(r).reduce((a,c)=>a+c,0)+COLGAP()*(NCOL-1);
  const groupRows=b.k==='trn'?Math.ceil(groups.length/2):groups.length;
  const totalH=r=>groupRows*boxHr(r)+ROWGAP()*(groupRows-1);
  lgSetK(1);
  let ROWS=1; while(ROWS<4 && totalW(ROWS)>MAXW) ROWS++;
  /* 行数定了再把整块面板缩放到刚好放得下 —— 自适应不是「原样摆着」，是把空间用掉。
     0.94 是刻意留的一点余量：拆成实例组之后盒子多了，撑满边框反而显得挤。
     1.7 是六边形内字号的可读上限；下限 0.75 兜住「组数多到一屏塞不下」的极端情况。 */
  lgSetK(Math.max(b.k==='trn'?0.35:0.75, Math.min(MAXW/totalW(ROWS), MAXH/totalH(ROWS), 1.7)*0.99));
  const CW_=colW(ROWS);
  boxes.forEach(x=>{ x.cols=Math.ceil(x.n.length/ROWS); x.w=CW_[x.col]; });
  const GW=totalW(ROWS);
  const pods=[...new Set(boxes.flatMap(x=>x.n).map(n=>n.pod.idx))];
  /* ⭐ 面板正居中，机柜那一头全额补偿 —— 面板偏一点点观众就看得出来，
     定位带整体左右挪几百像素反而没人察觉（它本来就没有"应该在哪"的参照）。 */
  LG.DX=0;
  const _xs0=pods.map(pi=>lgBandX(pi));
  const _rc=(Math.min.apply(null,_xs0)+Math.max.apply(null,_xs0)+lgBandW())/2;
  LG.DX=0;
  const gx=Math.round((VW-GW)/2);
  /* 所有盒等高：行数已经统一了，这里把「标题区 + N 行」的高度算一次给全部盒用，
     省得某个盒因为盒宽被标题撑开而高度也跟着飘。 */
  const bH=boxHr(ROWS), panelH=totalH(ROWS);
  const y0=LG.CY+Math.max(0,Math.round((LG.PANELH-panelH)/2));
  const colX=[]; { let xx=gx; for(let c=0;c<NCOL;c++){colX.push(xx); xx+=CW_[c]+COLGAP()} }
  let panel='';
  boxes.forEach(x=>{ x.x=colX[x.col]; x.y=y0+x.row*(bH+ROWGAP());
    panel+=pdBox(x.t,x.sub,x.n,x.x,x.y,x.w,x.cols,bH).s });
  const panelBot=y0+panelH;

  /* ── 图例：只留当前图层的色阶，钉在右下角。
       节点构成（N/C）不解释了 —— 芯片上就印着字母，盒标题也写着 Prefill / Decode；
       「无独立计量」也不列 —— 逻辑视图里根本没画 Union / 端口 / lane / 光模块。 ── */
  const lgw = S.mode==='health'?300:372;
  if(S.mode!=='health')panel+=legend(false, VW-72-lgw, 1774, true);

  /* ── 底部物理定位带 ── */
  MINI=true; const phys=clusterFront(); MINI=false;
  const band=`<g id="miniPhys"><g class="mband">${phys}</g></g>`;

  /* ── 汇聚漏斗：面板底边 → 这个服务占的机柜。上宽下窄 + 纵向渐变，
       把「这一堆逻辑节点，物理上就落在那儿」画成一束光。 ── */
  const bt=lgBandTop(), bh=lgBandH(), bwd=lgBandW();
  const xs=pods.map(pi=>lgBandX(pi));
  const rx0=Math.min.apply(null,xs)-14, rx1=Math.max.apply(null,xs)+bwd+14;
  /* 顶边基本等于实例组的宽度 —— 「整组汇聚到那个柜」这句话要靠宽度说出来，
     收得太窄就只是一条光柱，没有「包裹」感。 */
  const tx0=gx-6, tx1=gx+GW+6, ty=panelBot+4, by2=bt+bh;
  /* ⚠ 只画**一束**光。之前叠了一层更亮的内锥，看起来像两束，会让人以为是两组不同的对应关系。
     细线也从 9 条减到 4 条 —— 它们是辅助，不是主体。 */
  let funnel=`<defs>
      <linearGradient id="fnl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#00E6A2" stop-opacity="0"/>
        <stop offset=".45" stop-color="#00E6A2" stop-opacity=".06"/>
        <stop offset="1" stop-color="#00E6A2" stop-opacity=".26"/></linearGradient>
    </defs>
    <polygon points="${tx0},${ty} ${tx1},${ty} ${rx1},${by2} ${rx0},${by2}" fill="url(#fnl)"/>`;
  for(let i=0;i<=4;i++){
    const t=i/4, x1=tx0+(tx1-tx0)*t, x2=rx0+(rx1-rx0)*t;
    funnel+=`<line x1="${x1}" y1="${ty}" x2="${x2}" y2="${bt}" stroke="#00E6A2" stroke-width="1"
      opacity="${(0.05+0.09*Math.abs(0.5-t)*2).toFixed(3)}"/>`;
  }
  pods.forEach(pi=>{ const x=lgBandX(pi);
    funnel+=`<rect x="${x-3}" y="${bt-3}" width="${bwd+6}" height="${bh+6}" rx="8" fill="none"
      stroke="#00E6A2" stroke-width="2.4" opacity=".95"/>`; });

  /* ── 第三拍：根因气泡（只在故障图层）──
     用和硬件故障同一套气泡语言：收起态只有一颗药丸贴在故障卡上方，
     hover 才展开完整卡片。这样实例组能占满整块空间，不用为一张常驻卡片让位。 */
  let rc='';
  if(slo && S.mode==='health'){
    const bx2=boxes.find(x=>x.n.some(n=>n.npu.id===slo.blade));
    if(bx2){
      const idx=bx2.n.findIndex(n=>n.npu.id===slo.blade);
      const inD=bx2.t.indexOf('Decode')>=0;
      const bx=bx2.x;
      const cx=boxX0(bx2.x,bx2.w,bx2.cols)+LG.HW/2+(idx%bx2.cols)*(LG.HW+LG.HGAP);
      const cy=bx2.y+boxCy()+Math.floor(idx/bx2.cols)*boxRowH();
      /* 锚点打在**那颗 NPU 芯片**上，不是整个节点 —— 故障的粒度是卡，不是节点 */
      const ki=+slo.card.slice(-1), cp=hexChipXY(cx,cy,ki);
      /* 药丸横向要让开盒标题：窄盒（单节点服务）里节点是居中的，药丸按芯片居中会压住
         「Decode 实例」这行字。让它从标题右侧起排，宽出盒外没关系，指向靠引线。 */
      const bt2=bx2.t;
      const minPX=bx+LG.PAD+TW(bt2,27*LG.K)+34;   // 27 = 盒标题的真实字号，别用旧值
      /* 药丸默认挂在**盒标题那条带**上，不跟着故障节点所在的行走：
         多行排布下行与行之间只剩 16K 的缝，药丸放进去必然压住上一行的 IP。
         标题带左边用 minPX 让开标题；右边还得让开右上角的 sub（「12 节点 · 柜 13–14」），
         窄盒（单节点服务）两头一挤就没地方了，那时整颗药丸抬到盒顶上方的空白里。 */
      const PILLW=86+[...slo.name].reduce((a,c)=>a+(c.charCodeAt(0)>255?27:16),0);
      const subL=bx2.x+bx2.w-LG.PAD-TW(bx2.sub,23*LG.K)-24;
      let pillX=Math.max(minPX,cp.x-190), pillY=bx2.y+90*LG.K-104;
      if(pillX+PILLW>subL){
        pillX=Math.min(Math.max(bx2.x,cp.x-PILLW/2), bx2.x+bx2.w-PILLW);
        pillY=bx2.y-62;
      }
      rc=alarmBubble({name:slo.name, sev:'故障',
          impact:wrapCJK(slo.d,25).concat(wrapCJK(slo.eff,25)),
          fix:wrapCJK(slo.fix||'',25),
          svc:[bizOf(S.logic).name], ts:slo.ts.slice(11)},
        cp.x, cp.y, {pillX, pillY, cardX:cx-300, cardY:cy+LG.HH/2+44});
    }
  }
  /* 漏斗是常驻的映射装置，不是故障叙事的一部分 —— 跟面板同时出现（lgpanel），
     不能挂在第三拍的 lgrc 上，否则前两拍看不到物理对应关系。 */
  /* #lgHov 是 hover 时才有内容的舞台级图层：放大的刀片 + 一条连到六边形的线。
     放在最上面，且不受定位带压暗影响。 */
  return band+`<g class="lgpanel lgmap">${funnel}</g><g class="lgpanel">${panel}</g>`
    +`<g class="lgrc">${rc}</g><g id="lgHov" pointer-events="none"></g>`;
}

const GH0=()=>LG.GHEAD+LG.BH+LG.GFOOT;
/* 断词：中文可任意断，V13.1 / 112.34.14.3 这种 ASCII 串不能从中间劈开 */
function wrapCJK(t,per){
  const out=[]; let cur='', tok='';
  const flush=()=>{ if(!tok)return;
    if([...cur].length+[...tok].length>per){out.push(cur);cur=tok}else cur+=tok; tok='' };
  [...t].forEach(ch=>{
    if(ch.charCodeAt(0)<256 && ch!==' '){tok+=ch; return}
    flush(); cur+=ch;
    if([...cur].length>=per){out.push(cur); cur=''}
  });
  flush(); if(cur)out.push(cur);
  return out;
}

let LASTLV=null;
function render(){
  /* ⭐ 开场态的重新布防点：**从别的层回到集群层**。
     返回、退出下钻、逻辑→物理、切视角……全都走这一条，不用在每个入口各写一遍
     （同一个状态位只在一处维护 —— 这是 v3.21.4 那次踩坑的教训）。 */
  if(S.view.lv==='cluster'&&LASTLV!=='cluster')introArm();   // v3.26：连 BUBSEEN 一起清
  LASTLV=S.view.lv;
  let inner='';
  if(S.view.lv==='logic')inner=logicView();
  else if(S.view.lv==='cluster')inner = S.face==='front'?clusterFront():clusterBack();
  else if(S.view.lv==='blade')inner=bladeView();
  else if(S.view.lv==='card')inner = S.view.t==='cpucard'?cpuCardView():cardView();
  else if(S.view.lv==='chip')inner=chipView();
  const drill=S.view.lv!=='cluster'&&S.view.lv!=='logic';
  /* ⛔ v3.28：`#wm` 声明小字已删，这一行随之删掉 ——
     留着会在每次 render 里抛 "Cannot read properties of null"，
     而它是被 try/catch 之外的代码调用的，整帧渲染会断在这里（删元素时最容易漏的一处）。 */
  renderKPI();                                    // 指标跟着层级换（下钻 / 退出 / 聚焦机柜都会重算）
  if(S.mode!=='health'&&drill)inner+=heatBar();   // 下钻层也要有色阶参照
  $('stageInner').innerHTML=stageSVG(inner);
  if(S.view.lv==='logic'){logicAnim(); lgHoverBind()} else $('stageInner').onmouseover=null;
  const fb=$('flipBtn');
  fb.querySelector('.ft b').textContent = S.face==='front'?'翻转到背面':'翻转到正面';
  fb.classList.toggle('back',S.face==='back');
  const _nf = S.mode==='health' ? faceFaults(S.face==='front'?'back':'front') : 0;
  const _fq = fb.querySelector('.fq');
  _fq.textContent = _nf?`${_nf} 项故障`:''; _fq.style.display = _nf?'':'none';
  /* ⭐ 业务视角不翻面：背面是互联柜和光模块，和「这个业务的节点」不是一回事，
     翻过去只会看到一屏与当前业务无关的东西，还带着一个「N 项故障」的红角标 ——
     那些故障恰恰是刚被过滤掉的别的业务的。要看互联侧，回资源视角。 */
  fb.style.display = (S.view.lv==='cluster' && !S.biz)?'':'none';
  $('stage').classList.toggle('logic', S.view.lv==='logic');
  crumbs(); buildTree(); repositionPops(); syncBack(); syncViewSeg();
}
function go(v){if(v?.t==='ioblade')return;if(S.zoom){S.zoom=null;cam={...CAM0};camT={...CAM0};syncZoomBtn()}S.view=v;render()}

/* ================== 逻辑视图：三拍时间线 ==================
   ① 物理视图停留（调用方负责）
   ② 物理缩到底部定位带 + 逻辑面板升起
   ③ 根因节点点红 + 气泡弹出 + 光柱打到它所在的柜
   动画全部走 CSS transition，不做逐帧重绘 —— 3.2s 的数据 tick 在逻辑视图下本来就不重绘，
   所以这里不会和它打架。 */
let LGT=[];
const lgClear=()=>{LGT.forEach(clearTimeout); LGT.length=0};
/* 起手变换：让物理内容在逻辑 viewBox 里**恰好**落在它在集群 viewBox 里的位置。
   两个 viewBox 的高度不同（1500 vs 1832），preserveAspectRatio=meet 的取景也就不同 ——
   直接用 scale(1) 起手会先「啪」地缩 6% 再开始动画。解方程反推即可，零跳变。
     集群：屏幕 = O + (内容 - [0,120]) * cs
     逻辑：屏幕 = L + (内容*k + t) * ls        令两式对所有内容点相等 */
function lgStart(){
  /* 量的是 <svg> 自己的盒子，不是 #stage —— #stage 还带内边距，量错就会差出几十像素（踩过） */
  const sv=$('stageInner').querySelector('svg');
  const r=(sv||$('stageInner')).getBoundingClientRect(), w=r.width, h=r.height;
  if(!w||!h)return 'translate(0px,60px) scale(1)';
  const cs=Math.min(w/VW, h/1500), ls=Math.min(w/VW, h/VH);
  const ox=(w-VW*cs)/2, oy=(h-1500*cs)/2, lox=(w-VW*ls)/2, loy=(h-VH*ls)/2;
  const k=cs/ls, tx=(ox-lox)/ls, ty=(oy-120*cs-loy)/ls;
  return `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${k.toFixed(4)})`;
}
/* 只有「刚进入」才播三拍。在逻辑视图里切图层也会重绘，
   那时候必须直接落到终态 —— 否则每切一次故障/负载/能耗，动画都从头再演一遍。 */
let lgFresh=false;
function logicAnim(){
  const el=$('stageInner'), mp=el.querySelector('#miniPhys');
  if(!lgFresh){
    if(mp){mp.style.transition='none';
      mp.style.transform=`translate(${(LG.BTX+LG.DX).toFixed(1)}px,${LG.BTY.toFixed(1)}px) scale(${LG.BANDS})`}
    el.classList.add('lg-in','lg-rc'); return;
  }
  lgFresh=false;
  el.classList.remove('lg-in','lg-rc');
  /* ⚠ 元素刚插进 DOM、或刚把 transition 设成 none，必须**强制回流**把起始样式落定，
     否则浏览器把「起始态 + 终态」合并成一次样式计算，动画直接跳到终点（踩过：
     .95s 的缩放在真实浏览器里一帧就结束）。三步：定起手 → 回流 → 定终态。 */
  if(mp){ mp.style.transition='none'; mp.style.transform=lgStart(); }  // 起手 = 集群视角的取景，转场零跳变
  void el.offsetWidth;
  if(mp) mp.style.transition='transform .95s cubic-bezier(.45,.05,.2,1)';
  void el.offsetWidth;
  if(mp) mp.style.transform=`translate(${(LG.BTX+LG.DX).toFixed(1)}px,${LG.BTY.toFixed(1)}px) scale(${LG.BANDS})`;
  el.classList.add('lg-in');
  lgClear();
  LGT.push(setTimeout(()=>$('stageInner').classList.add('lg-rc'), 2700));   // 第三拍
}
/* ── 逻辑 ↔ 物理 双向联动 ────────────────────────────────
   常驻的映射（机柜绿框 + 汇聚漏斗）说的是「这一组在那两个柜」。
   一旦 hover 到某个节点，问题就变成「**这一个**在哪」—— 这时候常驻映射反而是干扰。
   所以 hover 时：常驻映射和定位带整体压暗 → 目标刀片**原地放大 3.6 倍**并高亮
   → 从六边形拉一条线到它。三件事一起做，指向才是唯一的。 */
function lgHoverBind(){
  const el=$('stageInner');
  const hov=()=>el.querySelector('#lgHov');
  const clear=()=>{ el.classList.remove('lg-hov');
    const h=hov(); if(h)h.innerHTML='';
    el.querySelectorAll('.lgnode.hi').forEach(n=>n.classList.remove('hi')) };
  const show=id=>{
    const h=hov(); if(!h)return;
    const S1=LG.BANDS, TX=LG.BTX+LG.DX, TY=LG.BTY, K=1.9;   // 再大就把周围的位置感吃掉了，看不出「在柜的哪一段」
    /* 一个节点 = NPU 刀片 + 配对的 CPU 刀片，两块都要在定位带里标出来，
       否则「8 NPU + 2 CPU」这句话在物理侧只兑现了一半。 */
    const pick=sel=>el.querySelector(`#miniPhys [data-act="${sel[0]}"][data-id="${cssEsc(sel[1])}"]`);
    const gN=pick(['npublade',id]), gC=pick(['cpublade',id.replace('-N','-C')]);
    if(!gN)return;
    const lg=el.querySelector(`.lgnode[data-id="${cssEsc(id)}"]`);
    let lb=null; try{ lb=lg?lg.getBBox():null }catch(_){}
    const out=[];
    const popOne=(g,label)=>{
      let bb; try{bb=g.getBBox()}catch(_){return null}
      const bcx=bb.x+bb.width/2, bcy=bb.y+bb.height/2;
      const root=el.querySelector('svg'),matrix=root.getScreenCTM().inverse().multiply(g.getScreenCTM());
      const center=new DOMPoint(bcx,bcy).matrixTransform(matrix),sx=Math.hypot(matrix.a,matrix.b),sy=Math.hypot(matrix.c,matrix.d);
      const cx=center.x,cy=center.y,w=bb.width*sx*K,hh2=bb.height*sy*K;
      const cl=g.cloneNode(true); cl.removeAttribute('class');
      cl.setAttribute('transform',`translate(${cx},${cy}) scale(${sx*K} ${sy*K}) translate(${-bcx},${-bcy})`);
      out.push({cx,cy,w,h:hh2,cl,label});
      return {cx,cy,w,h:hh2};
    };
    const bi=biOf(id);
    const pN=popOne(gN, uTxtNpu(bi)+' · NPU 板');
    const pC=gC?popOne(gC, uTxtCpu(bi)+' · CPU 板'):null;
    if(!pN)return;
    const pod=(findPod(gN.dataset.pod)||{}).name||'';
    const top=pC&&pC.cy<pN.cy?pC:pN;
    let str='';
    /* 同一个节点的两半，用一条细虚线连起来 */
    if(pC)str+=`<line x1="${pN.cx}" y1="${pN.cy}" x2="${pC.cx}" y2="${pC.cy}"
        stroke="#00E6A2" stroke-width="1.6" stroke-dasharray="6 6" opacity=".45"/>`;
    /* ⚠ 底板**不描边**：刀片自己已经有一圈边框了，外面再套一圈就是两条线。
       改成「外层发光块 + 内层暗底」两个纯填充，视觉上只剩刀片自己那一圈。 */
    out.forEach(p=>{ str+=`<rect x="${p.cx-p.w/2-17}" y="${p.cy-p.h/2-17}" width="${p.w+34}" height="${p.h+34}"
        rx="15" fill="#00E6A2" opacity=".16"/>
      <rect x="${p.cx-p.w/2-9}" y="${p.cy-p.h/2-9}" width="${p.w+18}" height="${p.h+18}"
        rx="11" fill="#080B0D"/>`; });
    h.innerHTML=str;
    out.forEach(p=>h.appendChild(p.cl));
    let lab=`<text x="${top.cx}" y="${top.cy-top.h/2-32}" fill="#00E6A2" font-size="27" font-weight="700"
        text-anchor="middle">${esc(pod)}</text>`;
    out.forEach(p=>{ lab+=`<text x="${p.cx+p.w/2+24}" y="${p.cy+8}" fill="#8FE3DA" font-size="23"
        font-weight="600">${esc(p.label)}</text>`; });
    if(lb)lab+=`<path d="M${lb.x+lb.width/2},${lb.y+lb.height-26} C${lb.x+lb.width/2},${lb.y+lb.height+130}
         ${pN.cx},${pN.cy-pN.h/2-190} ${pN.cx},${pN.cy-pN.h/2-15}" fill="none" stroke="#00E6A2"
         stroke-width="2" opacity=".75" stroke-dasharray="9 8"/>
       <circle cx="${pN.cx}" cy="${pN.cy-pN.h/2-15}" r="5" fill="#00E6A2"/>`;
    h.insertAdjacentHTML('beforeend',lab);
    el.classList.add('lg-hov');
    if(lg)lg.classList.add('hi');
  };
  el.onmouseover=e=>{
    if(!e.target.closest)return;
    const ln=e.target.closest('.lgnode');
    const pb=e.target.closest('#miniPhys [data-act="npublade"]');
    if(!ln&&!pb){clear();return}
    clear(); show((ln||pb).dataset.id);
  };
  el.onmouseout=e=>{
    if(!e.target.closest)return;
    if(e.target.closest('.lgnode')||e.target.closest('#miniPhys [data-act="npublade"]'))clear();
  };
}
function enterLogic(id){
  const b=bizOf(id); if(!b)return;
  closeUnpinned(); HIST.length=0; syncBack();
  S.nav='biz'; [...$('navseg').children].forEach(x=>x.classList.toggle('on',x.dataset.nav==='biz')); syncNav();
  S.logic=id; S.biz=id; bzSyncOpen(); S.bzopen=b.k; S.sel=null; S.zoom=null; cam={...CAM0}; camT={...CAM0}; syncZoomBtn();
  /* 已经在逻辑视图里换服务时不重播入场动画 —— 物理视图并没有「又缩了一次」 */
  lgFresh = S.view.lv!=='logic';
  S.view={lv:'logic'}; renderBiz(); if(window.__roomBooted)render();
}
function exitLogic(){ lgClear(); S.logic=null; S.view={lv:'cluster'}; renderBiz(); render() }

function crumbs(){
  const faceFor=t=>(t==='swblade'||t==='netdev')?'back':'front';
  const c=[{t:'超节点 (1024卡)',a:()=>{demoStop();exitLogic()}}];
  const v=S.view;
  /* 逻辑视图不是「下一层」，所以没有面包屑 —— 左边的 物理/逻辑 切换已经说清了关系，
     这里只留一个不可点的标题。劣化徽标也挂在这儿：舞台里的服务标题整个撤了，
     省出来的空间给实例组。 */
  const _bz = (S.nav==='biz' && (S.logic||S.biz)) ? bizOf(S.logic||S.biz) : null;
  const _bd = b=>{const sl=bizSlo(b.id);
    return `<span class="crbadge${sl?'':' ok'}">${sl?'劣化':'正常'}</span>`};
  if(v.lv==='logic'&&_bz){
    $('crumbs').innerHTML=`<span class="cr cur">${esc(_bz.name)} · 逻辑视图</span>`+_bd(_bz);
    $('crumbs').onclick=null; return;
  }
  /* 物理视图 + 选中了服务 + 还在集群层：标题跟着说清「现在看的是哪个服务的物理视图」 */
  if(_bz&&v.lv==='cluster'&&!S.zoom){
    $('crumbs').innerHTML=`<span class="cr cur">${esc(_bz.name)} · 物理视图</span>`+_bd(_bz);
    $('crumbs').onclick=null; return;
  }
  if(v.lv!=='cluster'){
    if(v.pod){const p=findPod(v.pod);c.push({t:p.name,a:()=>{closeUnpinned();jumpTo({sel:null,face:faceFor(v.t),view:{lv:'cluster'}})}})}
    if(v.cab){const n=findNet(v.cab);if(n)c.push({t:n.name,a:()=>{closeUnpinned();jumpTo({sel:null,face:'back',view:{lv:'cluster'}})}})}
    const J=(vv)=>{HIST.length=0;syncBack();go(vv)};
    if(v.blade&&v.pod){const p=findPod(v.pod);
      const nb=p.npu.find(x=>x.id===v.blade), sb=p.sw.find(x=>x.id===v.blade);
      if(nb)c.push({t:nb.name,a:()=>J({lv:'blade',t:'npublade',id:nb.id,pod:p.id})});
      if(sb)c.push({t:sb.name,a:()=>J({lv:'blade',t:'swblade',id:sb.id,pod:p.id})});}
    if(v.dev&&v.cab){const n=findNet(v.cab),dv=n.dev.find(x=>x.id===v.dev);
      if(dv)c.push({t:dv.name,a:()=>J({lv:'blade',t:'netdev',id:dv.id,cab:n.id})});}
    if(v.lv==='card'&&v.t==='cpucard'&&v.blade&&v.pod){const pp=findPod(v.pod);
      const cb=pp.cpu.find(x=>x.id===v.blade);
      if(cb)c.push({t:cb.name,a:()=>J({lv:'blade',t:'cpublade',id:cb.id,pod:pp.id})});}
    if(v.lv==='chip'&&v.card&&v.blade){const p=findPod(v.pod),b=p.npu.find(x=>x.id===v.blade);
      const kk=b&&b.cards.find(x=>x.id===v.card);
      if(kk)c.push({t:kk.name,a:()=>J({lv:'card',t:'npu',id:kk.id,pod:p.id,blade:b.id})});}
    const nm={npublade:'NPU 计算刀片',cpublade:'CPU 计算刀片',swblade:'灵衢互联刀片',ioblade:'RoCE板',
      mgmtblade:'灵衢管理刀片',pwrbox:'电源框',netdev:'灵衢互联设备',
      uchip:'Union 互联芯片',ichip:'灵衢 L2 互联芯片',udie:'Udie'}[v.t]||'';
    c.push({t:v.t==='cpucard'?'CPU '+(+v.id.slice(-1)+1)+' · 卡内视图'
      :v.lv==='card'?(v.t==='npu'?'NPU '+(+v.id.split('-K').pop()+1):v.id.split('-').pop())+' · 卡内视图'
      :v.lv==='chip'?((()=>{ /* ⚠ v3.30.2：uchip 的 id 尾巴还是 U09（内部序号），屏上一律读 U1.9 */
          if(v.t==='uchip'&&v.pod&&v.blade){const _p=findPod(v.pod),_b=_p&&_p.sw.find(x=>x.id===v.blade);
            const _c=_b&&_b.chipList.find(x=>x.id===v.id); if(_c)return uLbl(_c);}
          return v.id.split('-').slice(-1)[0]})())+' · '+nm+' 内视图'
      :v.id+(nm?' · '+nm:'')});
  }
  $('crumbs').innerHTML=c.map((x,i)=>`${i?'<span class="crsep">›</span>':''}<span class="cr ${i===c.length-1?'cur':''}">${esc(x.t)}</span>`).join('');
  $('crumbs').querySelectorAll('.cr').forEach((el,i)=>{if(c[i].a)el.onclick=c[i].a});
}

