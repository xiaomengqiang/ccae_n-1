/* ================== 故障演练 ================== */
let demo=false;
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),3600)}

/* 悬浮在故障气泡上时暂停自动刷新（重绘会把 CSS :hover 打断一帧） */
let bubHover=false;

/* ⭐⭐ v3.26 开场药丸：逐个退场 ═══════════════════════════════════════════
   老口径：「悬浮到任何器件 → 三颗整批退场」。药丸挪到机柜前面之后这条规则**会把功能弄坏** ——
   鼠标要够到药丸必然先经过机柜，还没碰到药丸三颗就全没了。所以整批退场只保留在「点击」上。

   新口径：**看过一颗收一颗**。三条设计决定，改之前先读：
   ① **触发在 mouseleave，不在 mouseenter**。进去就收的话，展开卡在你读第一行时就没了；
      语义是「看完了才收」，不是「碰到就收」。
   ② **500ms 停留门槛**。鼠标横扫过屏幕不算看过 —— 得真停下来、卡片确实展开了才记数。
      没有这道门槛，讲解员一挥手三颗全没，和老的整批退场没区别。
   ③ **收进它自己的红点**（CSS .retire → bubOut），红点与呼吸红晕留在屏上。
      收完屏面自然回到干净的集群全景，而「哪里坏了」这句话仍然在。
   副产品：三颗药丸 = 三段讲解词，讲一条收一条 —— 展会现场有了一条现成的动线。
   重新布防（introArm）会把 BUBSEEN 清空，三颗全部回来。 */
const BUBSEEN=new Set();
let bubDwellT=null;
function bubEnter(g){
  if(!g||!g.closest('.introbub')||g.classList.contains('gone'))return;
  clearTimeout(bubDwellT);
  bubDwellT=setTimeout(()=>{g.dataset.read='1'},500);   // 停够 500ms 才算「看过」
}
function bubLeave(g){
  clearTimeout(bubDwellT);
  if(!g||g.dataset.read!=='1'||g.classList.contains('gone'))return;
  const k=g.dataset.bkey;
  /* 先记进 BUBSEEN 再放动画：动画期间万一撞上 3.2s 的整屏重绘，重绘出来的那一颗
     直接就是 gone 态，不会「收到一半又冒回来」。 */
  if(k)BUBSEEN.add(k);
  g.classList.add('retire');
  setTimeout(()=>{g.classList.remove('retire');g.classList.add('gone')},380);
}

$('stage').addEventListener('mouseover',e=>{
  const b=e.target.closest&&e.target.closest('.bub');
  if(b){bubHover=true; bubEnter(b)}
});
$('stage').addEventListener('mouseout',e=>{
  const from=e.target.closest&&e.target.closest('.bub');
  const to=e.relatedTarget;
  const inBub=to&&to.closest&&to.closest('.bub');
  if(!inBub)bubHover=false;
  /* 药丸内部各元素之间移动（药丸 → 引线 → 展开卡）也会冒 mouseout，
     只有真的离开这一颗 .bub 才算「看完了」。 */
  if(from&&inBub!==from)bubLeave(from);
});

