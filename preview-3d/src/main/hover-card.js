/* ---- Hover：轻量指标卡。单击才筛选并固定成完整浮层 ---- */
let hoverId=null, hoverT=null;
function hideHover(){hoverId=null;clearTimeout(hoverT);$('hcard').classList.remove('on')}
function showHover(t,el){
  const c=popContent(t); if(!c.name)return;
  const m=(c.body.match(/<div class="m">[\s\S]*?<\/div>\s*<\/div>/g)||[]).slice(0,4);
  const grid=[...c.body.matchAll(/<div class="mk">(.*?)<\/div><div class="mv">(.*?)<small>(.*?)<\/small>/g)]
    .slice(0,4).map(x=>`<div class="hm"><b>${x[1]}</b><i>${x[2]}<span style="font-size:17px;color:var(--tx2)">${x[3]}</span></i></div>`).join('');
  const h=$('hcard');
  h.innerHTML=reskin(`<div class="hh"><div class="hi">${c.icon}</div><div style="flex:1;min-width:0">
      <div class="h1">${esc(c.name)}</div><div class="h2">${esc(c.meta)}</div></div>
      </div>
    <div class="hb">${grid}</div>
    ${c.note?`<div class="hn${c.note.sev==='err'?' err':''}"><div class="ht"><b>${esc(c.note.t)}</b>${c.note.tag?`<span class="tag">${esc(c.note.tag)}</span>`:''}</div>
      ${c.note.l.map(t=>`<p>${esc(t)}</p>`).join('')}
      <div class="hfx"><i>处理建议</i>${esc(c.note.fix)}</div>
      ${c.note.go?`<div class="hgo" data-hgo>${esc(c.note.goText||'下钻到根因器件 →')}</div>`:''}</div>`:''}
`);
  h.classList.toggle('wide', !!c.note);      // 带原因/建议的卡片要更宽，18px 正文塞不进 340
  h._t=t; h._el=el;
  /* 卡片自带的「下钻到根因卡」入口：首页点板卡只下钻一层，要一步到底走这里 */
  const _hg=h.querySelector('[data-hgo]');
  if(_hg)_hg.onclick=ev=>{ev.stopPropagation(); goRootCard(c.note.go)};
  /* ⚠ v3.22.1：📌 钉住入口已删（大屏是看的，不是操作的）。
     openPop() 因此再无调用方，`.pop` 整套（POPS / closeUnpinned / repositionPops / place）
     成为死代码 —— 留着不影响运行（POPS 恒空，那几个函数是空转），清理时一并删。 */
  // 定位：贴着对象，优先右侧
  const sr=$('screen').getBoundingClientRect(), ar=el.getBoundingClientRect();
  const ax=(ar.left-sr.left)/SCALE, ay=(ar.top-sr.top)/SCALE, aw=ar.width/SCALE, ah=ar.height/SCALE;
  const w=c.note?680:460, hh=h.offsetHeight||210;
  let x=ax+aw+16, y=ay+ah/2-hh/2;
  if(x+w>3840-26)x=ax-w-16;
  if(x<26)x=26;
  y=Math.max(200,Math.min(2160-hh-26,y));
  h.style.left=Math.round(x)+'px'; h.style.top=Math.round(y)+'px';
  h.classList.add('on');
}
$('stage').addEventListener('mouseover',e=>{
  const g=e.target.closest('[data-act]'); if(!g)return;
  /* ⛔ v3.26 删掉了这里的「悬浮到器件 → 药丸整批退场」（原 introOff()）。
     药丸贴到机柜前面之后，鼠标够到药丸**必然先经过机柜** —— 这条规则会在你碰到药丸之前
     把三颗全收走，功能直接用不了。整批退场现在只留在**点击**上（stage 的 click 里 INTRO=false）：
     点了才是真的开始操作，悬浮只是在看。逐个退场见 bubEnter / bubLeave。 */
  /* 逻辑视图里悬浮节点已经有「放大的物理刀片 + 连线」在讲事情了，
     再弹一张指标卡会盖住旁边两个节点，还和放大卡抢注意力。指标点进去看。 */
  if(S.view.lv==='logic' && (e.target.closest('.lgnode')||e.target.closest('#miniPhys')))return;
  /* 故障气泡自己就是一张卡片，别再叠一层通用指标卡（而且它的 data-id 是路由串，不是器件 id） */
  if(e.target.closest('[data-act="bubgo"]'))return;
  const t=targetOf(g); if(t.id===hoverId)return;
  hoverId=t.id; clearTimeout(hoverT);
  hoverT=setTimeout(()=>showHover(t,g),90);
});
$('stage').addEventListener('mouseout',e=>{
  const g=e.target.closest('[data-act]'); if(!g)return;
  const rt=e.relatedTarget;
  if(rt&&rt.closest&&(rt.closest('[data-act]')||rt.closest('#hcard')))return;
  hideHover();
});
$('stage').addEventListener('mouseleave',e=>{
  const rt=e.relatedTarget; if(rt&&rt.closest&&rt.closest('#hcard'))return; hideHover();
});
$('hcard').addEventListener('mouseleave',hideHover);
$('zoomBtn').onclick=zoomOut;
$('backBtn').onclick=()=>{
  if(S.view.lv==='logic'){demoStop();exitLogic();return}
  if(HIST.length){restore(HIST.pop());return}
  if(S.zoom){zoomOut();return}
  // 已在顶层：清空选中
  if(S.sel){S.sel=null;closeUnpinned();render()}
};
addEventListener('keydown',e=>{if(e.key==='Escape'){closeUnpinned();$('backBtn').onclick()}});

/* 翻转 */
let flipping=false;
$('flipBtn').onclick=()=>{
  if(flipping||S.view.lv!=='cluster')return; flipping=true;
  const el=$('stageInner');
  el.style.transform='rotateY(88deg)';
  setTimeout(()=>{
    S.face=S.face==='front'?'back':'front';
    /* ⭐ v3.26 修：翻面 = 换了一整屏内容，另一面那 3 条故障要重新做开场白。
       之前翻到背面**一颗药丸都没有** —— flipBtn 在 #stage 里，它的 click 冒泡到
       stage 的监听器上把 INTRO 置了 false，紧接着这里 render()，于是背面从来没布防过。
       （翻转按钮上的红色角标说"背面 3 项"，翻过去却什么都没有，是 v3.25 的一个真 bug。） */
    introArm();
    if(window.__roomBooted)render();
    el.style.transition='none'; el.style.transform='rotateY(-88deg)';
    requestAnimationFrame(()=>{el.style.transition='transform .42s cubic-bezier(.4,0,.6,1)';el.style.transform='rotateY(0deg)';
      setTimeout(()=>flipping=false,430)});
  },430);
};

/* 着色 */
/* v3.21.9：tab 顺序改成 负载 · 故障 · 能耗 —— 负载是常态视角（天天在看），
   故障是事件视角（偶发但优先级最高），常态在前更符合从左到右的浏览顺序。
   ⚠ 默认选中的仍是**故障**（S.mode 初始值 'health'）：开屏第一眼要能看见红点，
   这是整块屏的叙事起点。顺序和默认值是两件事，别混。 */
$('modeseg').innerHTML=[['health','故障'],['util','负载'],['pwr','能耗']].map(([k,t])=>
  `<button data-m="${k}" class="${S.mode===k?'on':''}">${t}</button>`).join('');
/* ================== 演示模式（无人值守循环） ==================
   ① 物理视图停 4.2s → ② 进逻辑视图（面板升起 / 物理缩到底部）→ ③ 2.7s 后根因点亮
   → 停 7s → 退回物理，循环。任何一次点击都会停掉它，讲解时不会被动画抢走画面。 */
let DEMO=null;
/* 演示模式没有按钮了 —— 顶栏只留唯一的一级控件（图层 tab）。
   能力保留：按 D 开/关无人值守循环，展台调试用；任何点击也会停掉它。 */
function demoStop(){ if(!DEMO)return; DEMO.forEach(clearTimeout); DEMO=null }
function demoStart(){
  demoStop(); DEMO=[];
  const svc=BIZ.find(b=>b.k==='inf');
  const beat=()=>{
    if(!DEMO)return;
    /* 演示固定在故障图层：第三拍的根因标注只在故障层出现（负载层红＝满载，不能混） */
    S.mode='health'; [...$('modeseg').children].forEach(x=>x.classList.toggle('on',x.dataset.m==='health'));
    S.nav='biz'; [...$('navseg').children].forEach(x=>x.classList.toggle('on',x.dataset.nav==='biz'));
    syncNav(); S.biz=null; S.logic=null; S.view={lv:'cluster'}; S.face='front';
    renderBiz(); if(window.__roomBooted)render();
    DEMO.push(setTimeout(()=>{ if(DEMO)enterLogic(svc.id) }, 4200));
    DEMO.push(setTimeout(()=>{ if(DEMO){exitLogic(); beat()} }, 4200+9800));
  };
  beat();
}
addEventListener('keydown',e=>{ if(e.key==='d'||e.key==='D'){ DEMO?demoStop():demoStart() } });
$('modeseg').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.mode=b.dataset.m;
  [...$('modeseg').children].forEach(x=>x.classList.toggle('on',x.dataset.m===S.mode));
  /* 在集群层重新点「故障」= 明确要求「再讲一遍有哪些故障」→ 重新布防。
     这也是药丸退场后最顺手的一条找回路径。 */
  if(S.mode==='health'&&S.view.lv==='cluster')introArm();
  renderKPI();render()};

