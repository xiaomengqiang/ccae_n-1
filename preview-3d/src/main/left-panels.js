/* ================== 左侧：资源 / 业务 视角 ================== */
/* ══════════ 作业状态（v3.27）══════════
   评审意见：作业列表要能按状态筛选 —— 推理服务分 正常 / 劣化 / 失败 / 离线，
   训练作业分 正常 / 劣化 / 中断 / 卡死。

   ⭐ 两层结构，别把它们混成一层：
   ① **严重度 `k`**（跨类型通用，只有三档）：`ok` / `deg` / `down` —— **筛选按它分**。
   ② **状态词 `t`**（分类型，四个）—— **行上显示它**。
   为什么筛选不做成六格（正常/劣化/失败/离线/中断/卡死）：
   「失败」「离线」只属于推理，「中断」「卡死」只属于训练，六格里任何一格都对另一半类型
   恒为空；而侧栏宽度只有 ~520（viewBox），六格必然换行且每格字号掉到 21 以下。
   合并成「异常」之后一行放得下，**具体是哪一种仍然写在那一行上**，信息一点没丢。
   真要拆成六格：把 FILT 加两项、bizState 已经返回 t 了，改动在十行以内。

   数据口径：`b.st` 显式指定则以它为准（**未来接真实数据就填这里**）；
   没写就由 SLO 推导 —— 有 SLO 记录 = 劣化，否则正常。
   ⚠ 不预置假的「失败 / 离线 / 中断 / 卡死」数据：原则 ⑥「没有该度量就不编」，
   而且刚把故障从 6 处收敛到 5 处，再造四种新异常正好反向。 */
const BIZST={
  ok  :{t:{inf:'正常', trn:'正常'},   c:'ok'},
  deg :{t:{inf:'劣化', trn:'劣化'},   c:'deg'},
  fail:{t:{inf:'失败', trn:'中断'},   c:'down'},
  off :{t:{inf:'离线', trn:'卡死'},   c:'down'}
};
function bizState(b){
  const key=b.st || (bizSlo(b.id)?'deg':'ok');
  const d=BIZST[key]||BIZST.ok;
  return {key, k:d.c, t:d.t[b.k]||d.t.inf};
}
/* 筛选档：k 为 null = 全部 */
const FILT=[['all','全部',null],['ok','正常','ok'],['deg','劣化','deg'],['down','异常','down']];
const bizPass=b=>{const f=FILT.find(x=>x[0]===S.bizf)||FILT[0]; return !f[2]||bizState(b).k===f[2]};

function renderBiz(){
  /* ---- 状态筛选 tab：每格带计数 ----
     ⚠ 计数为 0 的**不置灰、也不隐藏**：展会上一个灰掉的 tab 读起来像「功能没做」。
     点进去给一句「当前没有…的作业」—— 在这块屏上那是一句正面的话（集群是健康的），
     比一个空列表或者一个死掉的按钮都强。 */
  $('biztabs').innerHTML=FILT.map(([id,lb,k])=>{
    const n=k?BIZ.filter(b=>bizState(b).k===k).length:BIZ.length;
    return `<div class="tab bzf ${S.bizf===id?'on':''}" data-bzf="${id}">${lb}<span class="bn">${n}</span></div>`;
  }).join('');

  const grp=(k,t)=>{const L=BIZ.filter(b=>b.k===k&&bizPass(b));
    /* 组标题的计数写成「命中 / 总数」—— 筛选生效时观众要知道自己看的是全部里的哪一部分 */
    const tot=BIZ.filter(b=>b.k===k).length;
    const open=S.bzopen===k;
    /* ⭐ 收起态也要带**状态摘要**：这一组里有没有事，不展开就得看得出来。
       否则折叠等于把信息藏起来，讲解员为了确认另一组有没有问题只能盲展开
       （同翻转按钮那个「另一面 N 项故障」的红角标）。 */
    const bad=BIZ.filter(b=>b.k===k&&bizState(b).k!=='ok').length;
    const hasSel=BIZ.some(b=>b.k===k&&b.id===S.biz);
    const head=`<div class="bzh reference-biz-heading"><b>${t}(${tot})</b></div>`;
    if(!L.length)return head+`<div class="bzempty">当前没有${
      (FILT.find(x=>x[0]===S.bizf)||[])[1]}状态的${t}</div>`;
    return head+L.map(b=>{
      const nd=bizNodes(b.id).length, n=nd*8, pods=bizPods(b.id).length, st=bizState(b);
      /* 一行只留最重要的：名字 + 状态 + 规模。QPS / P99 / CPU 数都在逻辑视图的指标条里，
         列表是「选谁」的，不是「读数」的。 */
      /* ⭐ 状态徽标现在**两态都出**（原来只有劣化时才出）——
         只在异常时出现的徽标，观众会把「没徽标」读成「还没加载完」，
         和 v3.9 舞台栏那颗 .crbadge 是同一条教训。 */
      return `<div class="bz ${b.k==='trn'?'trn':''} ${S.biz===b.id?'on':''}" data-biz="${b.id}">
        <div class="r1"><span class="nmw"><span class="nm">${esc(b.name)}</span><i class="dg st-${st.k}">${st.t}</i></span><span class="cd">${nd}<small>节点</small></span></div>
        <div class="r2">${n}卡 · ${pods}柜</div>
        
        </div>`}).join('')};
  /* 推理在前占主导 —— 它是 7×24 常态负载，直接对应「这个集群在服务谁」 */
  /* ⛔ v3.27 删掉了尾部的「空闲算力 · 未分配节点」一行（评审意见）——
     这是**作业列表**，空闲既不是推理服务也不是训练作业，混在里面语义不对。
     ⚠ 删之前确认过「那 9 个节点为什么是绿的」在别处仍然答得上来：
       ① 资源视角 · 负载图层的图例第一档就写着「空闲」（HEAT_UTIL[0]）；
       ② 悬浮那几块刀片，卡上第一行是「承载业务：未分配 · 空闲」；
       ③ 能耗图层上它们会给出「⚡ 可回收：调度新作业上来，或按节点整体下电」的建议。
     业务视角里本来也看不到那片绿 —— 选中一个业务后，不属于它的器件全压到 .16。
     ⚠ 连带：`IDLEN` 就此**再无调用方**（那三条解释都是各自现算的，不读它），
     已列进第八节的清理清单 —— 同 v3.22.1 删 📌 那条教训：删一个入口要知道自己顺带废掉了什么。 */
  $('bizlist').innerHTML=grp('inf','推理服务')+grp('trn','训练作业');
}
/* ⭐ 展开的组永远跟着选中的业务走 —— 从舞台点、从逻辑视图换服务、进业务视角给默认值，
   都可能把 S.biz 换到收起的那一组里；不同步的话列表上看不到当前选中项，很懵。
   ⚠ 只在「选中项不在展开组」时才动，否则会把用户手动展开的那一组顶掉。 */
function bzSyncOpen(){
  // Keep group expansion under the user's control.
}
$('bizlist').addEventListener('click',e=>{
  const g=e.target.closest('[data-bzg]'); if(!g)return;
  /* ⚠ 折叠是「找谁」的工具，不是「选谁」：切组**不动 S.biz**，
     舞台上的聚光灯不该因为收起一个分组就灭掉（同筛选 tab 那条）。 */
  S.bzopen = S.bzopen===g.dataset.bzg ? null : g.dataset.bzg;
  renderBiz();
},true);
$('biztabs').onclick=e=>{const t=e.target.closest('[data-bzf]'); if(!t)return;
  if(S.bizf===t.dataset.bzf)return;
  S.bizf=t.dataset.bzf; renderBiz();
  /* ⚠ 只重画列表，**不动 S.biz**：筛选是「找谁」的工具，不是「选谁」。
     筛掉了当前选中的服务也不取消选中 —— 舞台上的聚光灯不该因为改了个筛选条件就灭掉。 */
};
$('bizlist').onclick=e=>{
  const el=e.target.closest('[data-biz]'); if(!el)return; demoStop(); enterLogic(el.dataset.biz);
};
/* 视角切换 = 换一套「看集群的方式」，不是只换一个侧边栏。
   之前这里只改 S.nav + 换左栏，舞台一帧都不变，所以从资源拓扑点「业务视角」看起来像没反应：
     ① 停在下钻层（刀片 / 卡 / 芯片）—— 那几层根本没有业务着色的代码路径；
     ② 停在聚焦某个柜 —— 聚光灯只覆盖那一个柜；
     ③ 停在背面 —— 背面全是互联柜，业务视角下整片被压暗到 .14，等于黑屏；
     ④ S.biz 仍是 null —— 渲染里所有业务分支都以 S.biz 为开关，全部不生效。
   下面把这四件事一次补齐：两个方向都先回到「正面 · 集群层 · 不聚焦」，
   进业务视角时再默认落到一个服务，让切换立刻可见。 */
$('navseg').onclick=e=>{const b=e.target.closest('[data-nav]'); if(!b)return;
  if(b.dataset.nav===S.nav)return;                       // 重复点同一格不重绘
  demoStop();
  S.nav=b.dataset.nav;
  [...$('navseg').children].forEach(x=>x.classList.toggle('on',x.dataset.nav===S.nav));
  /* 归位：逻辑视图 / 下钻 / 聚焦 / 背面 —— 换视角就等于换了一次舞台，历史栈也一并清掉 */
  if(S.view.lv==='logic'){lgClear(); S.logic=null}
  S.view={lv:'cluster'};
  if(S.zoom){S.zoom=null; cam={...CAM0}; camT={...CAM0}; syncZoomBtn()}
  HIST.length=0;
  S.sel=null;
  if(S.nav==='res'){ S.biz=null }
  else{
    S.face='front';                                      // 业务的卡都在正面
    /* 默认选中：优先有 SLO 劣化的推理服务（讲解最有料），否则第一个推理服务。
       不给默认值的话 S.biz 还是 null，画面不变，用户只会以为按钮坏了。 */
    if(!S.biz) S.biz=(BIZ.find(x=>x.k==='inf'&&bizSlo(x.id))||BIZ.find(x=>x.k==='inf')||BIZ[0]).id;
    bzSyncOpen();                                // v3.29：展开的组跟着选中项走
    renderBiz();
    /* ⭐ v3.27（评审意见）：**进业务视角先落逻辑视图，再由讲解员切物理**。
       业务视角回答的是「这个服务好不好」，主角是服务不是机柜 —— 先给逻辑结构
       （Prefill / Decode 实例组），再落到它物理上在哪几个柜，讲解动线更顺。

       ⚠ 两条约束，改之前先读：
       ① **训练作业没有逻辑视图**（8 个业务里占 2 个），只能落物理，`viewseg` 那半格照常置灰。
          所以这里必须判 `k==='inf'`，不能无脑 enterLogic。
       ② **不能跳过收缩动画**。enterLogic 的入场是「物理缩成定位带 + 汇聚漏斗打下去」，
          它同时是全屏最强的一次「逻辑 ↔ 物理」映射，跳过就白丢了。
          这里是在物理视图还在屏上的时候调 enterLogic（和演示模式 4.2s 后那一下同一条路径），
          `lgFresh = S.view.lv!=='logic'` 自然为真，动画照播。
       ⚠ enterLogic 内部会自己做 syncNav / renderBiz / render，所以走这一支就直接 return，
          别再往下走一遍 render()（会把入场动画的起手态冲掉）。 */
    const _nb=bizOf(S.biz);
    if(_nb){ closeUnpinned(); syncBack(); enterLogic(S.biz); return }
  }
  closeUnpinned(); syncNav(); syncBack(); if(window.__roomBooted)render();
};
function syncNav(){
  const biz=S.nav==='biz';
  ['srch','tabs','tree'].forEach(id=>$(id).style.display=biz?'none':'');
  $('bizlist').style.display=biz?'':'none';
  $('biztabs').style.display=biz?'':'none';     // v3.27：作业状态筛选只在业务视角出现
}

/* ── 业务高亮：不新增图层，只做「聚光灯」 ──────────────────
   选中业务后，属于它的卡保持本图层原色 + 一圈高亮描边，其余器件淡出。
   颜色语义完全不变（还是故障/负载/能耗），回答的问题变成
   「这个业务的卡现在健康吗 / 多忙 / 多费电」。 */
/* 「这个器件属于当前选中的业务吗」—— 没选业务时全员为真。
   它同时决定三件事：亮不亮（不属于的压到 .16）、红不红（不属于的不画故障）、
   热不热（不属于的不画负载/能耗极值光晕）。 */
const BIZON = o => !S.biz || o.biz===S.biz;
const bizDim = () => S.biz ? .10 : 1;          // 与业务无关的卡
/* 业务视角下，非 NPU 器件（电源框 / 管理刀片 / CPU 刀片 / RoCE板 / 互联柜）整体压暗 ——
   否则「业务不在的地方反而更亮」，聚光灯就失效了 */
const bizWrap = x => S.biz?`<g opacity=".14">${x}</g>`:x;

