/* ================== 舞台交互：单击 = 选中 · 双击 = 下钻 ================== */
function targetOf(g){const ds=g.dataset;
  return {t:ds.act,id:ds.id,pod:ds.pod,cab:ds.cab,blade:ds.blade,card:ds.card,dev:ds.dev,om:ds.om}}
/* 让对象在当前舞台可见（只在集群视图里切正反面） */
function reveal(p){
  if(S.view.lv!=='cluster')return;
  if(p.t==='swblade'||p.t==='netdev')S.face='back';
  else if(['npublade','cpublade','ioblade','mgmtblade','npu'].includes(p.t))S.face='front';
}
/* ---- 导航历史：返回严格回到上一层（视图 + 正反面 + 聚焦 + 选中） ---- */
const HIST=[];
const snap=()=>({view:{...S.view},face:S.face,zoom:S.zoom,sel:S.sel?{...S.sel}:null});
function pushHist(){HIST.push(snap()); if(HIST.length>24)HIST.shift(); syncBack()}
function syncBack(){const b=$('backBtn');
  /* 逻辑视图里左边已经有「物理 / 逻辑」切换了，右边再放一个「返回物理视图」是重复；
     Esc 仍然走这个 handler。 */
  b.style.display = S.view.lv==='logic' ? 'none' : '';
  b.style.opacity=HIST.length?1:.3;
  b.textContent = HIST.length?'← 返回上一层':'← 返回'}
/* 只在「业务视角 + 选中了一个服务」时出现；训练作业没有逻辑视图，那一格置灰 */
function syncViewSeg(){
  const el=$('viewseg'), b=S.logic?bizOf(S.logic):(S.biz?bizOf(S.biz):null);
  const show=!!(b && S.nav==='biz');
  el.style.display=show?'':'none';
  if(!show)return;
  const lg=S.view.lv==='logic', inf=b.k==='inf';
  el.innerHTML=`<button data-v="phy" class="${lg?'':'on'}">物理视图</button>`+
    `<button data-v="log" class="${lg?'on':''}"${inf?'':' disabled'}>逻辑视图</button>`;
}
$('viewseg').onclick=e=>{const t=e.target.closest('button'); if(!t||t.disabled)return;
  demoStop();
  if(t.dataset.v==='log'){ if(S.view.lv!=='logic')enterLogic(S.biz||S.logic) }
  else if(S.view.lv==='logic') exitLogic();
};
function restore(h){
  if(['ioblade','netdev','ichip'].includes(h?.view?.t))return;
  closeUnpinned();
  S.view=h.view; S.face=h.face; S.sel=h.sel;
  if(h.zoom){S.zoom=h.zoom; if(window.__roomBooted)render(); zoomTo(h.zoom,true)}
  else{S.zoom=null; cam={...CAM0}; camT={...CAM0}; render()}
  syncZoomBtn(); syncBack(); buildTree();
}
/* 下钻（双击 / 浮层按钮） */
function drill(p){
  if(!p||!p.t||['ioblade'].includes(p.t))return;
  
  /* 能耗图层的计量粒度到「板」为止：卡 / 芯片 / DIE 都没有独立功耗传感器，
     再往下钻只会看到一屏「无独立计量」，不如直接拦住并说明（原则 6）。 */
  if(S.mode==='pwr'&&['cpu2','uchip','ichip','udie','om','port','dport','cport','lane'].includes(p.t)){
    toast('能耗图层的计量粒度到板级为止 —— 卡 / 芯片 / DIE 没有独立功耗计量');return}
  if(p.t==='pod'||p.t==='netcab'){S.zoom===p.id?zoomOut():zoomTo(p.id);return}
  pushHist(); closeUnpinned(); revealInTree(p);   // 下钻 = 换层，上一层的浮层收掉（钉住的保留）
  if(p.t==='npu'){go({lv:'card',t:'npu',id:p.id,pod:p.pod,blade:p.blade});return}
  if(p.t==='cpu2'){                                  // CPU 原地放大，不新开一层
    if(S.view.lv==='blade'&&S.view.t==='cpublade'&&S.view.id===p.blade){go({...S.view,zoomCpu:+p.id.slice(-1)});return}
    go({lv:'blade',t:'cpublade',id:p.blade,pod:p.pod,zoomCpu:+p.id.slice(-1)});return}
  if(['uchip','ichip','udie'].includes(p.t)){go({lv:'chip',...p});return}
  if(p.t==='blk'){HIST.pop();syncBack();return}     // 功能块不再往下钻
  if(['dport','cport','part','lane','om'].includes(p.t)){HIST.pop();syncBack();return}
  if(['npublade','cpublade','swblade','ioblade','mgmtblade','pwrbox','netdev'].includes(p.t)){
    go({lv:'blade',...p}); return}
  HIST.pop(); syncBack();
}
/* 单击会 render() 重建 SVG，第二次点击落在新节点上，浏览器原生 dblclick 会派发到共同祖先而失效。
   所以这里自己判定：同一个 id 在 650ms 内点第二次 = 下钻。单击依旧零延迟。 */
function dblGuard(){let last={id:null,t:0};
  return (id,clickCount=0)=>{const now=Date.now();
    if(last.id===id&&(clickCount===2||now-last.t<650)){last={id:null,t:0};return true}
    last={id,t:now};return false}}
const stageDbl=dblGuard(), treeDbl=dblGuard(), alarmDbl=dblGuard();
/* 直达根因卡：下钻层的故障药丸、以及首页悬浮卡里的「下钻到 …」按钮共用这一条路径。
   ⚠ 只有这两个明确的入口能一步到底；点器件本身永远是「下钻一层」。 */
function goRootCard(t){
  demoStop(); closeUnpinned(); hideHover(); revealInTree(t); HIST.length=0; syncBack();
  S.sel=t; go({lv:'card',t:'npu',id:t.id,pod:t.pod,blade:t.blade}); syncTreeSel();
}
$('stage').addEventListener('click',e=>{
  INTRO=false;                       // 点了就是开始操作了；这里不重绘，后面的分支都会 render
  /* 故障气泡：点一下直接落到根因器件那一层 */
  const _bg=e.target.closest&&e.target.closest('[data-act="bubgo"]');
  if(_bg){ const a=(_bg.dataset.id||'').split('|');
    if(a.length===4)goRootCard({t:a[0],id:a[1],pod:a[2],blade:a[3]});
    return; }
  /* 业务节点禁止点击进入；底部机柜定位带保留原有定位操作。 */
  if(S.view.lv==='logic'){
    const ln=e.target.closest('.lgnode');
    if(ln)return; // 业务节点仅展示及悬停联动，不支持点击进入。
    const mp=e.target.closest('#miniPhys [data-act="pod"]');
    if(mp){demoStop(); const id=mp.dataset.id; exitLogic(); zoomTo(id); return}
    return;
  }
  const g=e.target.closest('[data-act]');
  if(!g){if(!e.target.closest('.pop')){closeUnpinned();
    if(S.sel){S.sel=null;if(window.__roomBooted)render();return}     // 点空白：先取消选中
    if(S.zoom)zoomOut();                      // 已经没有选中了，再退出机柜聚焦
    }
    return}
  const t=targetOf(g); hideHover();
  if(stageDbl(t.id,e.detail)){drill(t);return}         // 第二次点击 → 下钻
  pick(t);                                    // 第一次点击 → 只筛选
});
$('stage').addEventListener('mousedown',e=>{if(e.detail>1)e.preventDefault()});  // 抑制双击选中文本
