/* ================== 左侧：树 ================== */
const TABS=[['all','全部'],['npu','NPU'],['cpu','CPU'],['sw','互联'],['mgmt','管理/电源'],['alarm','只看故障']];
$('tabs').innerHTML=TABS.map(([k,t])=>`<div class="tab ${k==='alarm'?'al':''} ${S.filter===k?'on':''}" data-f="${k}">${t}</div>`).join('');
$('tabs').onclick=e=>{const t=e.target.closest('.tab');if(!t)return;
  S.filter=t.dataset.f;
  [...$('tabs').children].forEach(x=>x.classList.toggle('on',x.dataset.f===S.filter));
  // 「只看故障」自动展开有故障的机柜；其余模式回到折叠态
  collapseAll();
  if(S.filter==='alarm'){
    D.pods.forEach(p=>{if(p.status!=='ok')openSet.add(p.id)});
    D.nets.forEach(n=>{if(n.status!=='ok')openSet.add(n.id)});
  }
  buildTree()};
$('q').oninput=e=>{S.q=e.target.value.trim().toLowerCase();
  if(S.q){D.pods.forEach(p=>openSet.add(p.id));D.nets.forEach(n=>openSet.add(n.id))}else collapseAll();
  buildTree()};
function collapseAll(){[...openSet].forEach(k=>{if(k!=='root')openSet.delete(k)})}
/* 拓扑 ↔ 树：只同步"选中态"，不强制展开结构（避免树随点击不停跳动） */
const CATOF={npublade:'npu',npu:'npu',cpublade:'cpu',swblade:'sw',uchip:'sw',
  ioblade:'mgmt',mgmtblade:'mgmt',pwrbox:'mgmt'};
function selOwnerId(){const p=S.sel; if(!p)return null;
  return p.pod||p.cab||((p.t==='pod'||p.t==='netcab')?p.id:null)}
function selDevId(){const p=S.sel; if(!p)return null;
  return p.blade||p.dev||p.id}          // 卡/芯片/端口 → 归到它所属的刀片节点
let lastSelTree=null;
function syncTreeSel(){
  const id=S.sel?S.sel.id:null;
  if(id===lastSelTree)return; lastSelTree=id;
  const el=$('tree').querySelector('.tn.sel')||$('tree').querySelector('.tn.hassel');
  if(el&&el.scrollIntoView)el.scrollIntoView({block:'nearest'});
}
/* 显式展开到对象（浮层按钮 / 双击下钻时调用） */
function revealInTree(p){
  if(!p)return;
  if(p.pod){openSet.add(p.pod); const c=CATOF[p.t]; if(c)openSet.add(p.pod+'/'+c)}
  if(p.cab)openSet.add(p.cab);
  lastSelTree=null; buildTree();
}

function tnode(id,ic,nm,bd,st,d,kids,pl,cls){
  const o=openSet.has(id);
  const selq=S.sel&&(S.sel.id===id||(selDevId()===id&&S.sel.id!==id&&!kids));
  return `<div class="tn ${cls||''} ${selq?'sel':''}" data-id="${id}" data-p='${pl?JSON.stringify(pl):''}' style="padding-left:${8+d*18}px">
    <span class="caret ${o?'o':''}" data-tog="${kids?id:''}">${kids?'▶':''}</span>
    <span class="ic">${ic}</span><span class="nm">${nm}</span>
    ${bd?`<span class="bd">${bd}</span>`:''}${st?`<span class="st ${st}"></span>`:''}</div>`;
}
/* 设备图标 / 徽标 / 归类 */
const DEVMETA={npublade:['▬','8卡','npu'],cpublade:['▭','2×CPU','cpu'],swblade:['⇄','20芯片','sw'],
  ioblade:['◫','16网卡','mgmt'],mgmtblade:['⚙','','mgmt'],pwrbox:['⚡','','mgmt'],netdev:['⇄','2颗芯片','sw']};
function devNode(o,d,ctx){
  const[ic,bd,]=DEVMETA[o.kind]||['▪','',''];
  const badge=o.kind==='pwrbox'?(o.mods+'模块'):bd;
  return tnode(o.id,ic,o.name,badge,o.status,d,false,{t:o.kind,id:o.id,...ctx});
}
function matchDev(o){
  if(S.q)return (o.id+' '+o.name).toLowerCase().includes(S.q);
  if(S.filter==='alarm')return o.status&&o.status!=='ok';
  if(S.filter==='all')return true;
  return (DEVMETA[o.kind]||[])[2]===S.filter;
}
function worst(a){return a.some(o=>o.status==='err')?'err':a.some(o=>o.status==='warn')?'warn':'ok'}
/* 计算柜下的 4 个类别（分阶段披露：柜 → 类别 → 设备） */
const CATS=[
  {k:'npu', nm:'NPU 板 · U18–U26',  get:p=>p.npu},
  {k:'cpu', nm:'CPU 板 · U14–U31',  get:p=>p.cpu},
  {k:'sw',  nm:'灵衢互联刀片（柜背）',get:p=>p.sw},

];
function buildTree(){
  const flat = !!S.q || S.filter!=='all';     // 搜索 / 筛选时跳过类别层，直接列命中设备
  let h=tnode('root','🏢','<b>超节点 (1024卡)</b>','20 柜','warn',0,true);
  if(openSet.has('root')){
    D.pods.forEach(p=>{
      const all=[...p.npu,...p.cpu,...p.sw,p.mgmt,...p.io,p.pwr];
      const hits=all.filter(matchDev);
      const selfHit=(p.id+' '+p.name).toLowerCase().includes(S.q||'');
      if(S.q && !hits.length && !selfHit)return;
      if(S.filter==='alarm' && !hits.length && p.status==='ok')return;
      if(!flat && S.filter!=='all')return;
      const ow=selOwnerId(), dv=selDevId();
      const podMark = (ow===p.id && !openSet.has(p.id) && (!S.sel||S.sel.id!==p.id)) ? 'hassel' : '';
      h+=tnode(p.id,'▤',p.name,'64 卡',p.status,1,true,{t:'pod',id:p.id},podMark);
      if(!openSet.has(p.id))return;
      if(flat){hits.forEach(o=>h+=devNode(o,2,{pod:p.id}));return}
      CATS.forEach(c=>{
        const items=c.get(p), cid=p.id+'/'+c.k;
        const catMark=(ow===p.id&&!openSet.has(cid)&&items.some(o=>o.id===dv))?' hassel':'';
        h+=tnode(cid,'▸',c.nm,'× '+items.length,worst(items),2,true,null,'cat'+catMark);
        if(openSet.has(cid))items.forEach(o=>h+=devNode(o,3,{pod:p.id}));
      });
    });
    D.nets.forEach(n=>{
      const all=[...n.dev,n.pwr];
      const hits=all.filter(matchDev);
      const selfHit=(n.id+' '+n.name).toLowerCase().includes(S.q||'');
      if(S.q && !hits.length && !selfHit)return;
      if(S.filter==='alarm' && !hits.length && n.status==='ok')return;
      if(!flat && S.filter!=='all')return;
      const nMark=(selOwnerId()===n.id&&!openSet.has(n.id)&&(!S.sel||S.sel.id!==n.id))?'hassel':'';
      h+=tnode(n.id,'◈',n.name,'4 设备',n.status,1,true,{t:'netcab',id:n.id},nMark);
      if(!openSet.has(n.id))return;
      (flat?hits:all).forEach(o=>h+=devNode(o,2,{cab:n.id}));
    });
  }
  $('tree').innerHTML=h;
  syncTreeSel();
  const shown=$('tree').querySelectorAll('.tn').length;
  $('treecnt').textContent = S.q?`搜索结果 ${shown} 项`
    : S.filter==='alarm'?'仅故障对象'
    : S.filter==='all'?'' : TABS.find(t=>t[0]===S.filter)[1]+' 视角';
}
let pendingTreeBlade=null;
function cancelPendingTreeBlade(){if(pendingTreeBlade)clearTimeout(pendingTreeBlade.timer);pendingTreeBlade=null;}
$('tree').onclick=e=>{
  const tn=e.target.closest('.tn');if(!tn)return;
  const id=tn.dataset.id;
  let bladeTarget;try{bladeTarget=JSON.parse(tn.dataset.p||'{}')}catch(_){}
  if(bladeTarget?.t==='swblade'){
    // Keep the first-tap row in place until the double-tap window closes.
    const now=Date.now(),delay=window.CCAE_LIGHT?650:400;
    if(pendingTreeBlade?.id===id&&now-pendingTreeBlade.time<=delay){
      cancelPendingTreeBlade();hideHover();drill(bladeTarget);return;
    }
    cancelPendingTreeBlade();
    pendingTreeBlade={id,time:now,timer:setTimeout(()=>{
      pendingTreeBlade=null;locate(bladeTarget);
    },delay)};
    return;
  }
  cancelPendingTreeBlade();
  const car=e.target.closest('.caret');
  const isCab = /^(P\d\d|X\d)$/.test(id);
  const toggle=k=>{
    if(openSet.has(k)){openSet.delete(k);if(isCab)[...openSet].forEach(o=>{if(o.startsWith(k+'/'))openSet.delete(o)});return}
    // 手风琴：机柜一次只展开一个，避免树过长
    if(isCab&&!S.q&&S.filter!=='alarm')[...openSet].forEach(o=>{if(o!=='root'&&o!==k)openSet.delete(o)});
    if(k.includes('/'))[...openSet].forEach(o=>{if(o.includes('/')&&o!==k)openSet.delete(o);});
    openSet.add(k);
  };
  if(car&&car.dataset.tog){toggle(car.dataset.tog);buildTree();return}
  if(id==='root'){toggle('root');S.sel=null;go({lv:'cluster'});return}
  if(tn.classList.contains('cat')){toggle(id);buildTree();return}
  let p={};try{p=JSON.parse(tn.dataset.p||'{}')}catch(_){}
  if(treeDbl(id)){                             // 第二次点击 → 下钻
    if(p.t==='ioblade')return;
    if(S.view.lv!=='cluster')go({lv:'cluster'});
    drill(p); return}
  if(p.t==='pod'||p.t==='netcab'){toggle(id)}
  locate(p);                                   // 第一次点击：定位 + 选中高亮
};
function locate(p){
  if(!p||!p.t)return;
  if(p.pod)openSet.add(p.pod); if(p.cab)openSet.add(p.cab);
  if(S.view.lv!=='cluster'){HIST.length=0;syncBack();go({lv:'cluster'})}
  reveal(p);
  pick(p);                          // 选中 + 高亮（详情走 Hover 卡）
}
const routeTo=locate;

/* ================== 左侧：故障 ================== */

