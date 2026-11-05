/* ================== 锚定浮层 ================== */
const POPS=[]; // {el, pinned, anchorId, data}
function closeUnpinned(){for(let i=POPS.length-1;i>=0;i--)if(!POPS[i].pinned){POPS[i].el.remove();POPS.splice(i,1)}}
/* ══════════ 能耗图层的「所以呢」：统一建议生成器（v3.21.8）══════════
   以前只有「卡级 + 低功耗 + 推理服务」这一种情形写了建议，而集群首页 hover
   命中的是**刀片**（data-act="npublade"），根本走不到那一支 —— 于是最常被
   悬浮的那批绿卡（计算柜 16 一整列空闲节点）一句建议都没有。

   现在按「归属 × 档位」出建议，卡 / NPU 刀片 / CPU 刀片 / 机柜四级共用一套：

     空闲（无业务）   → 调度新作业，或整节点下电；省电按实测静态功耗算
     低功耗 · 推理     → 作业集中到更少的卡
     低功耗 · 训练     → 训练本该满载，低功耗说明作业没吃满，查数据供给 / 通信
     偏高 warm        → 关注机柜配电与风道余量
     顶格 hot         → 功耗贴额定，已经或即将触发封顶降频
     常态 norm        → **不出大卡片**，只在 kv 里写一行「无需处理」

   ⚠ 最后一条是刻意的：88% 的器件都在常态区间，每个都弹一张带建议的大卡片
   等于没有重点。有可执行动作才占那块面积（同原则 ⑦ 的思路：稀缺才有力）。
   ⚠ 省电数字一律由实测功耗推出来，不写死（原则 ⑥：没有度量就不编数字）。 */
const PWRTIER={low:'低',norm:'常态',warm:'偏高',hot:'顶格'};
/* 一个节点（8 NPU + 1 CPU 刀片）下电能省多少 —— 用卡的实测 W + CPU 刀片额定×占比 */
function nodeW(npuBlade,cpuBlade){
  const n=npuBlade?npuBlade.cards.reduce((a,k)=>a+k.pwr,0):0;
  const c=cpuBlade?Math.round(RATED.cpublade*(cpuBlade.pwrp||0)/100):0;
  return n+c;
}
/* cards: 这一层涵盖的 NPU；biz: 归属业务（null = 空闲）；unit: 「这张卡 / 这块板 / 这个柜」 */
/* 低负载提示：复用现有异常卡片，按实际利用率触发，包含利用率为 0% 的空闲资源。 */
// 计算柜16的资源整合演示故事；周均值为故事数据，当前读数仍来自实时模拟。
function inferenceConsolidationAdvice(cards){
  if(!['util','pwr'].includes(S.mode)||!cards?.length||!cards.every(k=>k.id?.startsWith('P16-')))return null;
  const k=cards[0],pod=findPod('P16'),blade=pod?.npu.find(b=>b.cards.includes(k));
  const energy=S.mode==='pwr';
  const note={t:energy?'冗余资源持续耗电':'推理服务资源利用不足',tag:energy?'节能优化建议':'资源优化建议',lowLoad:true,consolidation:true,
    l:[energy?'该卡所属推理服务配置的冗余 NPU 资源持续消耗静态功耗，产生不必要的用电。服务已部署 50 张 NPU，过去一周平均利用率仅 24%，大量资源未充分承担计算任务，但仍保持供电。':'该卡所属推理服务过去一周平均 NPU 利用率为 24%，持续低于 30%；已部署 50 张 NPU，资源配置存在冗余，空闲卡仍消耗静态功耗。',
       '承载业务：智能问答 · 推理服务'],
    fix:energy?'建议整合作业以减少冗余供电：将 50 张 NPU上的推理作业集中到 20 张卡，释放 30 张卡。验证高峰吞吐与响应时延后，将释放资源所在的空闲节点整体下电，减少静态功耗和持续用电；节能效果以调整前后的功率与电量对比确认。':'建议调整作业资源配比，将当前部署在 50 张 NPU上的推理作业集中到 20 张卡，释放 30 张卡。先验证高峰请求量、吞吐和响应时延，再逐步缩容；释放的资源可供其他作业使用，或按节点下电以降低能耗。'};
  if(cards.length>1&&blade){note.go={t:'npu',id:k.id,pod:pod.id,blade:blade.id};note.goText='查看所属 NPU →'}
  return {tier:'low',kv:[energy?'能耗评估':'资源评估',energy?'冗余资源持续耗电 · 整合作业后按节点下电':'近一周平均利用率 24% · 建议 50 → 20 张 NPU'],note};
}
function lowLoadAdvice(cards){
  if(S.mode!=='util'||!cards?.length)return null;
  const low=cards.filter(k=>Number.isFinite(k.util)&&k.util>=0&&k.util<30);
  if(!low.length)return null;
  const avg=(low.reduce((sum,k)=>sum+k.util,0)/low.length).toFixed(1);
  const businesses=[...new Set(low.map(k=>k.biz).filter(Boolean))].map(bizOf).filter(Boolean);
  const idle=low.filter(k=>!k.biz).length;
  const training=businesses.some(b=>b.k==='trn');
  const one=cards.length===1;
  const note={t:one?'NPU低负载':'低负载 · '+low.length+' 张 NPU',tag:'低负载提醒',
    l:[(one?'当前算力利用率 '+avg+'%':'本范围内 '+low.length+' / '+cards.length+' 张卡利用率低于 30%，低负载卡平均 '+avg+'%'),
       '承载业务：'+(businesses.length?businesses.map(b=>b.name+'（'+(b.k==='trn'?'训练':'推理')+'）').join('、')+(idle?'；另有 '+idle+' 张卡未分配业务':''):'未分配 · 空闲')],
    fix:!businesses.length?'当前未承载业务，可将待调度作业分配到这些空闲节点；若近期无业务需求，可在确认扩容预留需求后按节点整体下电，降低静态功耗。':training?'检查数据供给、存储带宽与梯度同步耗时，确认是否存在算力等待；结合业务负载调整资源配比。':'结合请求流量、峰值余量和时延目标评估资源整合，将推理作业集中到更少的节点；验证服务性能后再回收空余资源。',
    lowLoad:true};
  if(!one){const k=low[0],pod=D.pods.find(p=>p.npu.some(b=>b.cards.includes(k))),blade=pod?.npu.find(b=>b.cards.includes(k));
    if(blade){note.go={t:'npu',id:k.id,pod:pod.id,blade:blade.id};note.goText='查看低负载 NPU →'}}
  return {tier:'low',kv:['负载评估',one?'低负载（'+avg+'%）':low.length+' 张卡低于 30%'],note};
}
function pwrAdvice(cards,biz,unit,extra){
  if(S.mode!=='pwr'||!cards||!cards.length)return null;
  const cnt=t=>cards.filter(k=>k.pc===t).length;
  /* ⚠ 优先级 hot > warm > low > norm，且 warm 只要**有一张**就提 ——
     全场只有 10 张 warm 卡、散在 8 块刀片上，按「占三分之一」判的话板级和柜级
     永远触发不到，等于这一档白写（踩过）。文案里写清是几张，不含糊说「这块板偏高」。 */
  /* 阈值随层级放大：卡 / 刀片（≤8 张）有一张就提；机柜（64 张）要 4 张才提 ——
     64 张里 1 张偏高就报「余量收窄」，柜级会天天在报。 */
  const wMin=Math.max(1,Math.ceil(cards.length/16));
  const tier = cnt('hot')?'hot' : cnt('warm')>=wMin?'warm'
             : cnt('low')>cards.length/2?'low' : 'norm';
  /* 单位自适应：单卡是几百瓦，写「0.40 kW」不如写「396 W」自然 */
  const w=cards.reduce((a,k)=>a+k.pwr,0), kw=w<1000?w+' W':(w/1000).toFixed(2)+' kW';
  const bz=biz?bizOf(biz):null;
  if(tier==='norm')return {tier,kv:['功耗评估','常态区间（'+kw+'），无需处理']};
  /* 各档要标的指标：低载/空闲标「算力 + 功耗」（两者一起才说得通「电没换成算力」），
     偏高/顶格只标功耗（算力高本身不是问题）。 */
  const HL_LOW =Object.assign(hlOf('w',MK_UTIL),hlOf('w',MK_PWR));
  const HL_TRN =Object.assign(hlOf('e',MK_UTIL),hlOf('e',MK_PWR));
  const HL_WARM=hlOf('w',MK_PWR), HL_HOT=hlOf('e',MK_PWR);

  if(tier==='low'&&!bz){
    /* ⚠ 下电的最小单位是**节点**，不是这一层。单卡级要按它所属整节点算收益，
       否则会写出「整节点下电可释放 0.32 kW」这种自相矛盾的话。 */
    const nw=(extra&&extra.nodeW)||w;
    const save=((nw+(extra&&extra.cpuW||0))/1000).toFixed(2);
    return {tier, kv:['功耗评估','空闲静态底噪（'+kw+'），有下电或复用空间'],
      hl:HL_LOW,
      note:{t:'空闲算力长期只有静态功耗', tag:'⚡ 可回收', 
        l:['未承载任何业务，'+unit+'的 '+cards.length+' 张卡全部处于 idle（利用率 0%）',
           '当前功耗 '+kw+'，全部是不产生算力的静态底噪'],
        fix:'两条路二选一：① 把排队中的作业调度到'+unit+'，让这部分电变成算力；'
           +'② 若近期无作业，按「节点」整体下电（1 节点 = 8 NPU + 2 CPU，是调度的最小单位），'
           +'可释放约 '+save+' kW —— ⚠ 下电前先确认它不在任何服务的扩容预案里'}};
  }
  if(tier==='low'&&bz&&bz.k==='inf'){
    const tot=bz.nd*8, keep=Math.max(2,Math.ceil(tot*0.375)), free=tot-keep,
          save=(free*(w/cards.length)/1000).toFixed(1);
    return {tier, kv:['功耗评估','低负载低功耗（'+kw+'），可整合'],
      hl:HL_LOW,
      note:{t:'推理卡利用率长期偏低', tag:'⚡ 可整合',
        l:['承载推理服务：'+bz.name+'（'+bz.sub+'）',
           unit+'过去一周平均利用率不足 30%，功耗长期贴着静态底噪（'+kw+'）'],
        fix:'调整作业资源配比 —— '+bz.name+' 现部署 '+tot+' 张卡，按当前流量集中到 '+keep+' 张即可：'
           +'单卡利用率提升到 50%+，推理性能不下降；释放的 '+free+' 张卡下电后功耗下降约 '+save+' kW'}};
  }
  if(tier==='low'&&bz&&bz.k==='trn'){
    return {tier, kv:['功耗评估','低于训练常态（'+kw+'），疑似算力空转'],
      hl:HL_TRN,
      note:{t:'训练卡功耗低于常态', tag:'⚠ 疑似瓶颈', 
        l:['承载训练任务：'+bz.name+'（'+bz.sub+'）',
           '训练作业正常应长期满载，'+unit+'却只有 '+kw+' —— 电没花在算力上'],
        fix:'不是省电，是**没跑满**：优先查数据供给（DataLoader / 存储带宽）与梯度同步耗时；'
           +'排除后再看是否被同节点的其它作业挤占了 HBM 带宽'}};
  }
  if(tier==='warm'){
    const wn=cnt('warm');
    return {tier, kv:['功耗评估',unit+'有 '+wn+' 张卡进入偏高档（合计 '+kw+'）'],
      hl:HL_WARM,
      note:{t:'有卡进入功耗偏高档', tag:'⚠ 余量收窄', 
        l:[(bz?'承载业务：'+bz.name+'（'+(bz.k==='trn'?'训练':'推理')+'）':'未分配 · 空闲'),
           unit+'的 '+wn+' 张卡功耗已占额定的 60–90%，当前合计 '+kw],
        fix:'本身不是故障，但机柜配电与风道余量在收窄：确认整柜功率仍在 N+1 冗余内，'
           +'并关注进风温度 —— 再上一档就会触发功耗封顶降频'}};
  }
  const hk=cards.filter(k=>k.pc==='hot');
  const dn=hk.filter(k=>k.cfreq);
  return {tier, kv:['功耗评估','顶格（'+kw+'，占额定 >90%）'],
    hl:HL_HOT,
    note:{t:'功耗贴着额定上限', tag:'⚠ 功耗风险', 
      l:[(bz?'承载业务：'+bz.name+'（'+(bz.k==='trn'?'训练':'推理')+'）':'未分配 · 空闲'),
         unit+'有 '+hk.length+' 张卡功耗 >90% 额定'
           +(dn.length?'，其中 '+dn.length+' 张已触发封顶降频（'+dn[0].cfreq+' MHz / 额定 1800）':'')],
      fix:(dn.length
        ? '它「占用满、算力不满」：核对整柜配电与进风温度；短期可下调该作业的功耗上限换取频率稳定，长期需要评估风冷是否到顶'
        : '临近封顶降频阈值：核对整柜配电与进风温度，必要时把新作业调度到别的机柜')}};
}
/* ⭐ 指标异常自动判色（v3.21.9）—— 以前 cls 只染进度条，而且 59 处调用里只有 2 处传了，
   于是「链路中断 / 结温 97℃ / 隔离行数 64」这些值和正常值长得一模一样。
   现在：① 显式 cls 永远优先；② 没传就按「指标名 + 值」推；③ 判出来的等级同时染**数值本身**。
   ⚠ 只判「确实出错」的，不判「数值大」—— 负载 88% 不是异常，那是常态；
   满载/顶格属于图层极值，已经由器件着色和外圈光晕表达了（原则 ⑦：红色是稀缺资源）。 */
function metricCls(k,v,cls){
  if(cls)return cls;                                   // 调用方说了算
  const s=String(v), n=parseFloat(s);
  /* ① 文字型状态：直接判词 */
  if(/链路中断|中断|异常|故障|离线|已下电|失效|不可用/.test(s))return 'e';
  if(/降级|劣化|受限|降频|故障|风险/.test(s))return 'w';
  /* ② 计数型：名字里带「故障 / 故障 / 隔离 / 坏」且数值 > 0 */
  if(/故障|故障|隔离|坏|丢包|误码/.test(k)&&!isNaN(n)&&n>0)return 'e';
  /* ③ 温度：门限 80 / 70 —— 与项目里早就显式传 cls 的那两处（NPU / NPU 刀片）
     完全一致，否则同一个 88℃ 在不同卡上会一个红一个不红。改门限要三处一起改。 */
  if(/结温|温度/.test(k)&&!isNaN(n)){ if(n>80)return 'e'; if(n>70)return 'w' }
  /* ④ 光功率：低于 -20 dBm 判为失光（与光模块中断故障同口径） */
  if(/光功率/.test(k)&&(/<\s*-?2\d/.test(s)||(!isNaN(n)&&n<=-20)))return 'e';
  /* ⑤ 中断时长：只要有值就是坏的 */
  if(/中断时长/.test(k)&&!isNaN(n)&&n>0)return 'e';
  return '';
}
/* ⭐ 本张卡的「异常指标」高亮表（v3.22.1）。
   一张异常卡的 note 说的是「功耗贴顶 / 利用率长期偏低」这类事，可指标位里对应的那一项
   却和正常值长得一样 —— 观众要自己在心里把 note 和指标对上。
   所以异常判定分两条腿：
     ① metricCls：值本身就是错的（链路中断 / 超温 / 光功率越限）—— 与卡片无关，恒成立
     ② MHL：**这张卡的异常正好是这个量** —— 由 note 决定，同一个指标在不同卡上等级不同
        （利用率 0%：能耗层是「可回收」要标，故障层什么都不是）
   ⚠ 用 note 自己的语义色：⚠ 风险类（顶格 / 降频 / 瓶颈）→ 红，⚡ 机会类（可整合 / 可回收）→ 橙。
     把「空闲可回收」也标红会和真故障混淆 —— 那是机会不是故障（原则 ⑦）。 */
let MHL=null;
function metric(k,v,u,pct,cls){
  const c=metricCls(k,v,cls)||(MHL&&MHL[k])||'';
  return `<div class="m${c?' '+c:''}"><div class="mk">${k}</div><div class="mv">${v}<small>${u||''}</small></div>
  ${pct!=null?`<div class="bar ${c}"><i style="width:${Math.max(0,Math.min(100,pct))}%"></i></div>`:''}</div>`}
/* 功耗 / 算力这一族指标在各层级的叫法不同，统一列出来给 MHL 用 */
const MK_PWR=['刀片功耗','机柜功耗','功耗','设备功率'];
const MK_UTIL=['平均算力','NPU 平均算力','算力利用率','CPU 平均负载','利用率','占用'];
const hlOf=(lv,keys)=>keys.reduce((a,k)=>(a[k]=lv,a),{});
function badge(st){return st==='err'?'<span class="badge err">● 故障</span>':st==='warn'?'<span class="badge warn">● 故障</span>':'<span class="badge">● 正常</span>'}

function popContent(p){
  let icon='▪',name=p.id,meta='',st='ok',mets='',kvs='',act='',note=null;
  MHL=null;                    // 每张卡自己一份高亮表；⚠ 要在 mets 生成**之前**填好
  /* 能耗建议必须先算，因为它决定了 mets 里哪几项要染色（见 MHL 的说明）。
     四个层级共用这一段：算出来 → 填 MHL → 之后各 case 再生成 mets。 */
  const preAdv=(cards,biz,unit,extra)=>{const a=inferenceConsolidationAdvice(cards)||lowLoadAdvice(cards)||pwrAdvice(cards,biz,unit,extra);
    if(a&&a.hl)MHL=a.hl; return a};
  const P=p.pod?findPod(p.pod):null, N=p.cab?findNet(p.cab):null;
  switch(p.t){
   case 'pod':{const o=findPod(p.id);icon='▤';name=o.name;meta='8 NPU刀 · 8 CPU刀 · 4 互联刀 · 1 管理刀 · 2 IO刀 · 电源框';st=o.status;
    const u=Math.round(o.npu.reduce((a,b)=>a+b.cards.reduce((x,k)=>x+k.util,0),0)/64);
    /* ⚠ 先算能耗建议（填 MHL），再生成 mets */
    const _ck=o.npu.flatMap(b=>b.cards), _bizs=[...new Set(o.npu.map(b=>b.biz).filter(Boolean))];
    const _pa=preAdv(_ck,_bizs.length===1?_bizs[0]:null,'这个柜',
      {cpuW:o.cpu.reduce((a,c)=>a+Math.round(RATED.cpublade*(c.pwrp||0)/100),0)});
    mets=metric('NPU 平均算力',u,'%',u)+metric('机柜功耗',o.pwr.kw,'kW',72)+
         metric('CPU 平均负载',Math.round(o.cpu.reduce((a,b)=>a+b.util,0)/8),'%',42)+metric('出水温度',rr(36,42).toFixed(1),'°C',56);
    kvs=[['NPU数','64'],['灵衢互联刀片','4（柜背）'],['上行链路','4 根灵衢 L1 × 32 × 800G = 128 条'],
         ['槽位','13–31 自下而上（'+SLOT_EMPTY+' 为假板卡空位）'],['电源模块','18 (N+1)']];
    /* ⭐ 故障图层：机柜卡 = 器件数据 + 本柜故障全景（v3.21.9 合二为一）。
       多处故障时做汇总（一行一处），单处故障时直接用那条故障的完整叙述 —— 信息密度按数量走。
       note.go 只在「单处 + 该故障有根因卡」时给，多处时给不了唯一目标，让人自己点红点。 */
    if(S.mode==='health'){
      const _fs=podFaults(o);
      mets=metric('本柜故障',_fs.length,' 项')+metric('NPU 平均算力',u,'%',u)+
           metric('机柜功耗',o.pwr.kw,'kW',72)+metric('出水温度',rr(36,42).toFixed(1),'°C',56);
      if(_fs.length){
        const _svc=[...new Set(_fs.flatMap(f=>f.b.svc))];
        const _fix=[...new Set(_fs.map(f=>(f.b.fix||[]).join('；')))].filter(Boolean);
        const _one=_fs.length===1?_fs[0]:null;
        note={ t: _one? _one.b.name : '本柜 '+_fs.length+' 处故障', tag:'● 故障', sev:'err',
          l: _one
            ? [ _one.face+' · '+_one.dev, _one.b.impact.join(''),
                (_one.b.svcLabel||'涉及的推理服务')+'：'+_one.b.svc.join('、'), '首次上报 '+_one.b.ts ]
            : _fs.map(f=>f.face+' · '+f.dev+' —— '+f.b.name)
                 .concat(['影响范围：'+_svc.join('、')+'（共 '+_svc.length+' 个业务）']),
          fix:_fix.join('；') };
        if(_one&&_one.go){ note.go=_one.go; note.goText='下钻到根因器件 →' }
        kvs.splice(0,0,
          ['故障器件',_fs.map(f=>f.dev).join(' / ')],
          ['分布',[..._fs.reduce((m,f)=>m.set(f.face,(m.get(f.face)||0)+1),new Map())]
                  .map(([k2,v2])=>k2+' '+v2+' 处').join(' · ')],
          ['影响范围',_svc.join('、')],
          ['处理建议',_fix.join('；')]);
      }else{
        kvs.splice(0,0,['故障器件','无 —— 本柜 64 卡 / 4 根灵衢 L1 全部正常']);
      }
    }
    /* 机柜级：柜内 8 块 NPU 刀片的卡合起来判读。空闲节点数单独点出来 ——
       「这个柜有几个节点在空转」是运维当场就能用的一句话。 */
    if(S.mode==='pwr'){
      const _idle=o.npu.filter(b=>!b.biz).length;
      if(_pa){ kvs.splice(1,0,_pa.kv);
        if(_idle)kvs.splice(2,0,['空闲节点',_idle+' / 8（未承载任何业务）']);
        if(_pa.note){ note=_pa.note;
          kvs.splice(_idle?3:2,0,['处理建议',_pa.note.fix.replace(/\*\*/g,'')]); } }
    }
    act=`<button data-go='{"t":"pod","id":"${o.id}","flip":1}'>看柜背互联 →</button>`;break}
   case 'netcab':{const o=findNet(p.id);icon='◈';name=o.name;meta='4 × 灵衢互联设备 · 风扇 ×6 · 电源框';st=o.status;
    const bw=Math.round(o.dev.reduce((a,d)=>a+d.bw,0)/4);
    mets=metric('汇聚带宽',bw,'%',bw)+metric('灵衢 L2 互联芯片','8','颗')+metric('端口总数','1024','×400G')+metric('丢包率','0.00','%',2);
    kvs=[['灵衢互联设备','4'],['每设备芯片','2 颗互联芯片'],['每芯片端口','128 @ 400G'],['光模块','1024']];
    /* 互联柜同样要回答「这里有没有事」—— 当前全场 6 处故障都在计算柜侧（3 卡 + 3 光模块口），
       互联柜恒为 0。但不能什么都不写：观众翻到这一层会以为「没显示 = 没查」。 */
    if(S.mode==='health'){
      const _nf=o.dev.filter(d=>d.status!=='ok').length
              + o.dev.reduce((a,d)=>a+d.chipList.filter(c=>c.status!=='ok').length,0);
      mets=metric('本柜故障',_nf,' 项')+metric('汇聚带宽',bw,'%',bw)+
           metric('灵衢 L2 互联芯片','8','颗')+metric('丢包率','0.00','%',2);
      kvs.splice(0,0,['故障器件',_nf?'见下方故障':'无 —— 8 颗互联芯片 / 1024 光模块全部正常'],
                     ['上游','承载全部 16 个计算柜的跨柜流量']);
    }
    break}
   case 'npublade':{const o=P.npu.find(x=>x.id===p.id);icon='▬';name=o.name;
    meta=P.name+' · 8 × NPU · 1 节点的算力半边';st=o.status;
    const u=Math.round(o.cards.reduce((a,k)=>a+k.util,0)/8),tp=Math.max(...o.cards.map(k=>k.temp));
    /* ⚠ 先算能耗建议（填 MHL），再生成 mets —— 顺序反了指标就染不上（踩过） */
    const _pa=preAdv(o.cards,o.biz,'这块刀片',{cpuW:Math.round(RATED.cpublade*((P.cpu[o.idx]||{}).pwrp||0)/100)});
    mets=metric('平均算力',u,'%',u)+metric('最高结温',tp,'°C',tp,tp>80?'e':tp>70?'w':'')+
         metric('HBM 占用',Math.round(o.cards.reduce((a,k)=>a+k.hbm,0)/8),'%',70)+
         metric('刀片功耗',(o.cards.reduce((a,k)=>a+k.pwr,0)/1000*1.15).toFixed(1),'kW',78);
    const _bz=o.biz?bizOf(o.biz):null;
    kvs=[['承载业务',_bz?(_bz.name+'（'+(_bz.k==='trn'?'训练':'推理')+'）'):'未分配 · 空闲'],
         ['机架位置',P.name+' · '+uTxtNpu(o.idx)+'（柜内自下而上 U13–U31）'],
         ['所属节点',_bz?'8 NPU + 2 CPU（同节点 CPU 板在 '+uTxtCpu(o.idx)+'）':'8 NPU + 2 CPU'],
         ['NPU','8'],['BMC / UBM','1 / 1'],['上行','每卡 2×800G → 互联刀片']];
    /* 故障图层：本板上有故障卡 → 这张悬浮卡直接把故障讲完（半融合，见 bubNote）。
       v3.21.6 起首页不再单独出一张故障卡片，两张合成一张：板卡数据 + 故障信息。
       note.go 让卡片自己带一个「下钻到根因卡」的入口 —— 首页点板卡只下钻一层，
       想直达最底层就点这个按钮，两种深度分得开。 */
    /* 能耗图层：板级建议。⚠ 首页悬浮命中的是刀片而不是单卡，所以这一支必须有 —— 
       以前只写在 case 'npu' 里，等于最常被看的那一层反而没有「所以呢」。 */
    if(_pa){ kvs.splice(1,0,_pa.kv); if(_pa.note){ note=_pa.note;
      kvs.splice(2,0,['处理建议',_pa.note.fix.replace(/\*\*/g,'')]); } }
    if(S.mode==='health'){
      const _bk=o.cards.find(k=>k.status!=='ok'), _fb=_bk?bubAt('npucard',_bk.id):null;
      if(_fb){ note=bubNote(_fb);
        note.go={t:'npu',id:_bk.id,pod:P.id,blade:o.id};
        note.goText='下钻到 '+_bk.name+' 卡内视图 →';
        kvs.splice(1,0,['故障器件',_bk.name+'（本板第 '+(o.cards.indexOf(_bk)+1)+' 张）'],
                       ['首次上报',_fb.ts]); }
    }
    break}
   case 'npu':{const b=P.npu.find(x=>x.id===p.blade)||P.npu.find(x=>x.cards.some(k=>k.id===p.id));
    const o=b.cards.find(x=>x.id===p.id);icon='▪';name=o.name;
    meta=`${P.name} · ${b.name}`;st=o.status;
    /* ⚠ 先算能耗建议（填 MHL），再生成 mets */
    const _pa=preAdv([o],o.biz,'这张卡',{
      nodeW:b.cards.reduce((a,k)=>a+k.pwr,0),
      cpuW:Math.round(RATED.cpublade*((P.cpu[b.idx]||{}).pwrp||0)/100)});
    /* 能耗图层下第四格换成「功耗」—— 这一层的异常讲的就是功耗，
       指标位里却只有进程数，等于 note 说的那个量根本没出现在卡上。 */
    /* 第四格随图层/状态换：能耗层看功耗、有 ECC 故障时看隔离行数、其余看进程数 ——
       故障卡的指标位必须出现「导致这条故障的那个量」，否则 note 说的事在卡上找不到。 */
    const _iso4=o.mem.ecc_iso||0;
    mets=metric('算力利用率',o.util,'%',o.util)+metric('结温',o.temp,'°C',o.temp,o.temp>80?'e':o.temp>70?'w':'')+
         metric('HBM 占用',o.hbm,'%',o.hbm)+
         (S.mode==='pwr' ? metric('功耗',o.pwr,'W',Math.round((o.pwr-305)/92*100))
          : (S.mode==='health'&&_iso4) ? metric('ECC 隔离行',_iso4+' / 64','',100,'e')
          : metric('进程数',o.procs,'个'));
    const _bz=o.biz?bizOf(o.biz):null;
    kvs=[['承载业务',_bz?(_bz.name+'（'+(_bz.k==='trn'?'训练':'推理')+'）'):'未分配 · 空闲'],
         ['功耗',o.pwr+' W'],['运行进程',o.procs+' 个'],
         ['HBM',o.mem.cap+' GB · '+o.mem.stacks+' stack'],
         ['ECC CE / UE',o.mem.ecc_ce+' / '+o.mem.ecc_ue],['寄存器','10 组关键状态']];
    /* 能耗图层：卡级建议，和刀片 / 机柜共用同一个生成器（v3.21.8 抽出来的 pwrAdvice）。
       nodeW / cpuW 传的是整节点 —— 判读看这一张卡，下电收益按节点算。 */
    if(_pa){ kvs.splice(1,0,_pa.kv); if(_pa.note){ note=_pa.note;
      kvs.splice(2,0,['处理建议',_pa.note.fix.replace(/\*\*/g,'')]); } }
    /* 故障图层：悬浮故障卡本身 = 讲同一个故障故事（半融合，见 bubNote） */
    if(S.mode==='health'){ const _fb=bubAt('npucard',p.id);
      if(_fb){ note=bubNote(_fb);
        kvs.splice(1,0,['影响分析',_fb.impact.join('')],
                       ['处理建议',(_fb.fix||[]).join('；')],['首次上报',_fb.ts]); } }
    break}
   case 'udie':{icon='◧';name='Udie';meta=p.id;st='ok';
    const card=p.card?findObj('npu',p.card,{pod:p.pod,blade:p.blade}):null;
    const d=card?card.dies.find(x=>x.id===p.id):null;
    if(d){st=d.status;mets=metric('利用率',d.util,'%',d.util)+metric('结温',d.temp,'°C',d.temp,d.temp>80?'e':'')+
      metric('频率',d.freq,'MHz',80)+metric('核心电压',d.volt,'mV',60);
      kvs=[['端口','9'],['状态','0x0000_0001'],['LINK_STATUS','9/9 Up'],['P-State','P0']]}
    break}
   case 'cpublade':{const o=P.cpu.find(x=>x.id===p.id);icon='▭';name=o.name;
    meta=P.name+' · 2 × CPU';st=o.status;
    /* ⚠ 先算能耗建议（填 MHL），再生成 mets */
    const _nb=P.npu[o.idx];
    const _pa=_nb?preAdv(_nb.cards,o.biz,'这个节点',{cpuW:Math.round(RATED.cpublade*(o.pwrp||0)/100)}):null;
    mets=metric('CPU 利用率',o.util,'%',o.util)+metric('内存占用',o.mem,'%',o.mem)+
         metric('温度',o.temp,'°C',o.temp)+metric('网卡吞吐',rr(40,180).toFixed(0),'Gbps',55);
    const _bz=o.biz?bizOf(o.biz):null;
    kvs=[['承载业务',_bz?(_bz.name+'（'+(_bz.k==='trn'?'训练':'推理')+'）'):'未分配 · 空闲'],
         ['机架位置',P.name+' · '+uTxtCpu(o.idx)+'（柜内自下而上 U13–U31）'],
         ['所属节点','与 '+uTxtNpu(o.idx)+' 的 NPU 板同节点'],
         ['CPU','2'],['内存通道','12']];
    /* CPU 刀片没有 pc 档位，用同节点那块 NPU 刀片的卡来判读 ——
       它们本来就是一个节点，下电也是一起下（SE 口径：1 节点 = 8 NPU + 2 CPU）。 */
    if(_pa){ kvs.splice(1,0,_pa.kv); if(_pa.note){ note=_pa.note;
      kvs.splice(2,0,['处理建议',_pa.note.fix.replace(/\*\*/g,'')]); } }
    break}
   case 'swblade':{const o=P.sw.find(x=>x.id===p.id);icon='⇄';name=o.name;meta=P.name+' · 柜背 · 20 × Union 芯片';st=o.status;
    mets=metric('上行带宽',o.status==='err'?0:o.bw,'%',o.status==='err'?0:o.bw,o.status==='err'?'e':'')+
         metric('光模块口',o.status==='err'?16:32,'/32',o.status==='err'?50:100,o.status==='err'?'e':'')+
         metric('Pre-FEC BER',o.ber,'e-7',30)+metric('时延',rr(.9,1.4).toFixed(2),'μs',20);
    kvs=[['Union 互联芯片','20'],['每芯片端口','18'],['对外光模块','32 × 800G LPO（PIC1–PIC8，每组 LPO1–LPO4）'],['UBM / BMC','1 / 1']];break}
   case 'uchip':{const b=P.sw.find(x=>x.id===p.blade);const o=b.chipList.find(x=>x.id===p.id);
    const _dn=o.role==='down';
    icon='▣';name=o.name;meta=b.name+' · '+(_dn?'下行 Union':'互联 Union');st=o.status;
    mets=metric('带宽',o.bw,'%',o.bw)+metric('端口','18','个',100)+metric('温度',o.temp,'°C',o.temp)+metric('状态',o.status==='err'?'异常':'正常','');
    /* ⭐ v3.30.4：两种角色的端口用途表不一样 —— 互联 Union 全部朝下，不接光模块 */
    const _io=_dn?ioOfUnion(o.idx):-1;
    kvs=[['端口用途', _dn?('1–8 → NPU　10–13 → 互联 Union　14–17 → 光模块　9 / 18 → '+(_io>=0?'RoCE板 '+(_io+1)+' 的 2 个 芯片':'空闲'))
                        :'1–16 → 本组 8 颗下行 Union（各 2 条）　17 / 18 空闲'],
         ['上行侧', _dn?'Port 14–17 × 2 lane = 8 lane → 组内 4 个光模块':'无（互联 Union 不接光模块）'],
         ['所属刀片',b.name],['所属机柜',P.name]];break}
   case 'netdev':{const o=N.dev.find(x=>x.id===p.id);icon='⇄';name=o.name;meta=N.name+' · 2 颗互联芯片';st=o.status;
    mets=metric('汇聚带宽',o.bw,'%',o.bw)+metric('端口','256','@400G',100)+
         metric('Pre-FEC BER',o.ber,'e-7',o.status==='warn'?72:24,o.status==='warn'?'w':'')+metric('缓存占用',rr(12,38).toFixed(0),'%',30);
    kvs=[['灵衢 L2 互联芯片','2 颗互联芯片'],['每芯片端口','128 @ 400G'],['每芯片光模块','128'],['下联','16 个 Pod']];break}
   case 'ichip':{const d=N.dev.find(x=>x.id===p.dev);const o=d.chipList.find(x=>x.id===p.id);
    icon='▣';name=o.name;meta=d.name;st=o.status;
    mets=metric('带宽',o.bw,'%',o.bw)+metric('端口','128','@400G',100)+metric('光模块','128','个',100)+metric('温度',o.temp,'°C',o.temp);
    break}
   case 'ioblade':{const o=P.io.find(x=>x.id===p.id);icon='◫';name=o.name;
    meta=P.name+' · 芯片 ×'+o.nics;st=o.status;
    mets=metric('吞吐',o.bw,'%',o.bw)+metric('芯片',IO_NICS,'个',100)+metric('Union 芯片','2','个',100)+metric('BMC/UBM','1/1','');
    /* ⭐ v3.30.5：补上「谁连它」—— 只有右组（偶号）Union 连 RoCE板，每颗 2 个芯片 */
    kvs=[['上联 Union', o.idx===0 ? '每块灵衢互联刀片的 U1.2 / U1.4 / U1.6 / U1.8（各 2 个芯片）'
                                  : '每块灵衢互联刀片的 U1.10 / U1.12 / U1.14 / U1.16（各 2 个芯片）'],
         ['机架位置',P.name+' · '+slotTxt(SLOT_IO(o.idx))+'（柜内自下而上 U13–U31）'],
         ['⚠ 待确认','真机槽位图写的是 8 个网卡芯片，本 demo 建模用的是 '+IO_NICS]];
    break}
   case 'mgmtblade':{const o=P.mgmt;icon='⚙';name='灵衢管理刀片';meta=P.name+' · 带外管理';st=o.status;
    mets=metric('负载',o.util,'%',o.util)+metric('纳管对象','23','个')+metric('遥测频率','1','Hz')+metric('固件','v2.4.1','');
    kvs=[['Pod Manager','1'],['BMC','1'],['交换芯片','1']];break}
   case 'dport':{
    const q=+p.id.split('-P').pop(),cd=findObj('npu',p.card||p.id.split('-P')[0],{pod:p.pod,blade:p.blade});
    if(!cd)break;
    const ps=cardPortState(cd,q),ci=+cd.id.split('-K').pop(),dn=(q<=8)!==(ci>=4)?'A':'B';
    icon='◇';name='Udie-'+dn+' · P'+pad2(q%9);meta=cd.name+' · 端口';st=ps.bad?'err':'ok';
    mets=metric('状态',ps.idle?'预留':ps.bad?'故障':'正常','')+metric('利用率',ps.util,'%',ps.util)+metric('速率',ps.idle?'—':'800G','');
    if(S.mode==='pwr')mets+=metric('所属卡功耗',Math.round(ps.power),'%',ps.power);
    kvs=[['所属','Udie-'+dn],['端口编号','P'+pad2(q%9)]];break}
   case 'blk':{const nm=p.id.split('-B').pop();
    const cd=findObj('npu',p.card,{pod:p.pod,blade:p.blade});
    icon='▤';name=nm;meta=cd?cd.name+' · 卡内功能块':'';st='ok';
    if(nm==='HBM'){
      /* ⭐ 故障卡的指标位必须出现「导致这条故障的那个量」——
         隔离行数 64/64 才是 HBM ECC 故障本身，以前它只在副标题里，指标位放的是 Stack 数。
         没有故障时照常显示 Stack。 */
      const _iso=cd.mem.ecc_iso||0;
      mets=metric('容量',cd.mem.cap,'GB')+metric('带宽占用',cd.mem.bwUse,'%',cd.mem.bwUse)+
        metric('ECC CE',cd.mem.ecc_ce,'次',null,_iso?'e':'')+
        (_iso?metric('ECC 隔离行',_iso+' / 64','',100,'e'):metric('Stack',cd.mem.stacks,'个'));
      /* HBM ECC 故障卡：悬浮 HBM 功能块也出完整故障故事（半融合） */
      if(S.mode==='health'){const _fb=bubAt('npucard',p.card);
        if(_fb&&_fb.name.indexOf('HBM')>=0)note=bubNote(_fb);}}
    else if(nm==='AI Cube'){
      const NOM=1800, cf=cd.cfreq||cd.dies[0].freq, dp=Math.round((1-cf/NOM)*100);
      mets=metric('占用',cd.cube,'%',cd.cube,cd.cube>=90?'e':'')+
           metric('频率',cf,'MHz',Math.round(cf/NOM*100),dp>=15?'e':'')+
           metric('较额定 '+NOM,(dp>0?'-':'+')+Math.abs(dp),'%',Math.max(0,100-Math.abs(dp)*3),dp>=15?'e':'')+
           metric('核心数','72','个');
      const _cb=cd.biz?bizOf(cd.biz):null;
      if(dp>=15)note={t:'功耗封顶降频', tag:'⚠ 功耗风险',
        l:['整卡功耗 '+cd.pwr+' W 已达封顶，结温 '+cd.temp+' ℃，固件主动降频 '+dp+'%',
           '承载业务：'+(_cb?_cb.name:'未分配')],
        fix:'核对配电余量与进风温度；若已是正常水位，迁走部分负载或下调作业功耗档位'};
      kvs = dp>=15
        ? [['判读','占用已打满，但频率被压低 '+dp+'% —— 实际算力低于标称'],
           ['降频原因','整卡功耗已达 '+cd.pwr+' W 封顶（Power Cap），结温 '+cd.temp+' ℃，固件主动降频保护'],
           ['承载业务',_cb?(_cb.name+'（'+(_cb.k==='trn'?'训练':'推理')+'）· '+_cb.sub):'未分配 · 空闲'],
           ['处理建议','该卡长期贴着功耗墙跑：先核对机柜配电余量与进风温度；若属正常水位，把这张卡上的负载迁走一部分，或把作业的功耗档位下调一档']]
        : [['判读','工作在额定频率附近，算力正常释放'],
           ['承载业务',_cb?(_cb.name+'（'+(_cb.k==='trn'?'训练':'推理')+'）'):'未分配 · 空闲']];}
    else if(nm==='AI Vector'||nm==='AI CPU')mets=metric('占用',Math.max(20,cd.util-18),'%',Math.max(20,cd.util-18))+
      metric('类型',nm==='AI Vector'?'向量计算单元':'通用核','')+metric('频率',cd.dies[0].freq,'MHz',80)+metric('状态','正常','');
    else mets=metric('P-State',cd.status==='ok'?'P0':'P1','')+metric('DVFS','启用','')+
      metric('调度队列',Math.round(rr(2,9)),'个')+metric('状态',cd.status==='ok'?'正常':'降频','');
    break}
   case 'cport':{const q=+p.id.split('-P').pop(), ciq=+p.id.split('-U')[1].split('-')[0];
    const cb=P.cpu.find(x=>x.id===p.blade)||P.cpu[0], nb=P.npu[cb.idx];
    icon='◇';name='CPU 端口 P'+pad2(q);meta=`${cb.name} · CPU ${ciq+1}`;st='ok';
    const tn=q<=7?nb.cards[ciq*4+Math.floor(q/2)].name:'RoCE板 · Union';
    mets=metric('对端',q<=7?'NPU':'IO 刀片','')+metric('链路',q<=7?'PCIe Gen5':'RoCE','')+
         metric('带宽',Math.round(rr(30,88)),'%',60)+metric('状态','Up','');
    kvs=[['对端设备',tn],['对端端口',q<=7?'该 NPU的 P04 / P07':'Union'],
         ['本 CPU 端口','9（P00–P07 → NPU / P08 → IO）']];break}
   case 'part':{const nm=p.id.split('-Q').pop();
    const cb=[...P.cpu,...P.npu].find(x=>x.id===p.blade)||P.cpu[0];
    const N=nm==='风扇'?hardwareMetrics({...p,t:'part'}).count:{'内存':cb.memCnt,'硬盘':cb.diskCnt,'电源':cb.pwrCnt}[nm];
    icon={'内存':'▥','硬盘':'▦','风扇':'❋','电源':'⚡'}[nm]||'▪';
    name=nm+' ×'+N;meta=cb.name+' · 板载器件';st='ok';
    mets=metric('数量',N,'个')+metric('在线',N,'个',100)+
         metric(nm==='内存'?'占用':nm==='硬盘'?'容量':nm==='风扇'?'转速':'输出',
                nm==='内存'?cb.mem+'%':nm==='硬盘'?'7.68 TB':nm==='风扇'?'6.9k rpm':'2.4 kW','')+
         metric('状态','正常','');
    break}
   case 'cpu2':{const cb=P.cpu.find(x=>x.id===p.blade)||P.cpu[0];
    const ci=+p.id.slice(-1), o=cb.cpus[ci];
    icon='▣';name=o.name;meta=`${P.name} · ${cb.name}`;st=cb.status;
    mets=metric('利用率',o.util,'%',o.util)+metric('温度',o.temp,'°C',o.temp)+
         metric('核心',o.cores,'个')+metric('频率',o.freq,'MHz',78);
    /* ⚠ v3.30.1 顺手修：这里写的是 0 起的「NPU 0–3」，与 v3.30 改的 1–8 编号对不上 */
    kvs=[['下挂 NPU','4 张（NPU '+(ci*4+1)+'–'+(ci*4+4)+'）'],['所属刀片',cb.name]];break}
   case 'fan':{icon='❋';name='风扇模块 '+(+p.id.slice(-1)+1);meta=(P?P.name:'')+' · 本板散热';st='ok';
    const rpm=6800+(+p.id.slice(-1))*240;
    mets=metric('转速',rpm,'rpm',rpm/120)+metric('占空比',Math.round(rr(48,72)),'%',60)+
         metric('进风温度',Math.round(rr(22,28)),'°C',35)+metric('状态','正常','');
    break}
   case 'lane':{const i=+p.id.split('-L').pop();
    const un=+p.id.split('-L')[0].split('-U').pop();
    icon='▮';name='lane · Port '+laneUpPort(i);meta=uLblNo(un)+' · 含 2 条线';st='ok';
    mets=metric('所属 Port','Port '+laneUpPort(i),'')+metric('线数','2','条')+
         metric('上行光模块',p.om!=null?omFull(+p.om):'—','')+metric('速率','200G','');
    kvs=[['配对规则','同一个 Port 的 2 条 lane 分去 2 个光模块（交叉配对）'],
         ['本 Union 上行','Port 14–17 × 2 lane = 8 lane → 组内 4 个光模块']];break}
   case 'om':{const i=+p.id.split('-M').pop();
    icon='◈';name='光模块 '+omLbl(i);meta='800G · PIC'+picOfG(i)+' · 汇入 2 个 lane（4 条线）';st='ok';
    const _obad=p.blade?omBad({id:p.blade},i):false;
    if(_obad){ st='err'; meta=p.blade+' · 上行光模块口';
      mets=metric('状态','链路中断','')+metric('速率','800G','')+
           metric('Rx 光功率','< -20','dBm',0,'e')+metric('中断时长',Math.round(rr(3,47)),'min','');
      /* 光模块口故障：悬浮那个红 OSFP 也出完整故障故事（半融合） */
      const _fb=bubAt('swblade',p.blade);
      if(_fb){note=bubNote(_fb);
        kvs=[['影响分析',_fb.impact.join('')],['处理建议',(_fb.fix||[]).join('；')],['首次上报',_fb.ts]];}
    }else{
      mets=metric('速率','800G','')+metric('所属 PIC','PIC'+picOfG(i),'')+
           metric('汇入 lane','2','个',100)+metric('Rx 光功率',rr(-4.2,-1.1).toFixed(1),'dBm',70);
    }
    break}
   case 'port':{icon='◇';name=p.id.split('-').slice(-1)[0];meta=p.id;st='ok';
    const bw=Math.round(rr(35,92));
    mets=metric('带宽',bw,'%',bw)+metric('速率',p.id.includes('-C')?'400G':'800G','')+
         metric('Rx 光功率',rr(-4.2,-1.1).toFixed(1),'dBm',70)+metric('Pre-FEC BER',rr(.2,1.6).toFixed(1),'e-7',28);
    kvs=[['状态','Up'],['FEC','RS(544,514)'],['所属',p.id.split('-').slice(0,-1).join('-')]];break}
   case 'core':{icon='▫';name='计算核心 '+p.id.split('-').slice(-1)[0];meta=p.id;st='ok';
    const u=Math.round(rr(55,99));
    mets=metric('占用率',u,'%',u)+metric('类型',p.id.endsWith('1')?'Cube':'Vector','')+
         metric('频率',Math.round(rr(1650,1850)),'MHz',80)+metric('停顿周期',rr(1,9).toFixed(1),'%',12);
    break}
   case 'pwrbox':{const o=N?N.pwr:P.pwr;icon='⚡';name='电源框';meta=(N||P).name;st=o.status;
    mets=metric('输出功率',o.kw,'kW',72)+metric('电源模块',o.mods,'个',100)+metric('冗余','N+1','')+metric('RM310','在线','');
    kvs=[['电源模块',o.mods+' 个'],['机柜管理主模块','RM310 ×1'],['RM310 组件','BMC + CPLD']];break}
  }
  if(['port','dport','cport','lane'].includes(p.t)){
    kvs=kvs.filter(([key])=>!/链路|对端|上联|下联|连接/.test(key));
    mets=mets.replace(/<div class="m">[\s\S]*?<\/div>\s*<\/div>/g,part=>/<div class="mk">[^<]*(?:链路|对端|上联|下联|连接)/.test(part)?'':part);
  }
  const kvh=kvs.length?`<div style="margin-top:12px">${kvs.map(([k,v])=>`<div class="kv"><span class="kk">${k}</span><span class="vv">${v}</span></div>`).join('')}</div>`:'';
  const DRILL={"pod": "⤢ 聚焦该机柜", "netcab": "⤢ 聚焦该机柜", "npublade": "进入刀片内视图 →", "cpublade": "进入服务器内视图 →", "swblade": "进入互联刀片详情 →", "netdev": "进入互联设备详情 →", "mgmtblade": "进入管理域视图 →", "pwrbox": "进入供电视图 →", "npu": "放大到卡内（18 端口 / HBM / AI Core）→", "cpu2": "进入 CPU内（9 端口）→",
    "uchip": "进入芯片内视图（18 端口）→", "ichip": "进入芯片内视图（128 端口）→",
    "udie": "进入 DIE 内视图（核心阵列 / 寄存器）→"};
  const dl=['ioblade'].includes(p.t)?null:DRILL[p.t];
  act = `<button data-tree>⌖ 在树中定位</button>`+(dl?`<button data-drill>${dl}</button>`:'');
  return {icon,name,meta,st,note,body:`${badge(st)}<div class="mgrid">${mets}</div>${kvh}`,act,
  };
}
function cssEsc(v){return String(v).replace(/["\\]/g,'\\$&')}
function anchorFor(id){return id?$('stageInner').querySelector(`[data-act][data-id="${cssEsc(id)}"]`):null}
/* 单击行为：选中 → 高亮 → 在对象旁弹出指标浮层（不改变层级） */
/* 单击 = 只选中 / 筛选，不弹浮层（详情走 Hover 卡；按 📌 才固定） */
function pick(p){
  /* 右边选中 → 左边树同步展开并滚到可见。原来只有「下钻」才 revealInTree，
     单击选中时树纹丝不动，两边像两个应用。 */
  S.sel=p; closeUnpinned(); revealInTree(p); if(window.__roomBooted)render(); syncTreeSel();
}
/* 显式打开可钉住的完整浮层（由 Hover 卡上的 📌 触发） */
function openPop(p,anchorEl){
  const a = (anchorEl&&anchorEl.isConnected) ? anchorEl : anchorFor(p.id);
  const c=popContent(p);
  if(!c.name)return;
  const el=document.createElement('div');
  el.className='pop';
  el.innerHTML=reskin(`<div class="pop-h"><div class="pi">${c.icon}</div><div class="pt">
      <div class="p1">${esc(c.name)}</div><div class="p2">${esc(c.meta)}</div></div>
      <div class="pb" data-close>✕</div></div>
    <div class="pop-b">${c.body}</div>
    ${c.act?`<div class="pop-act">${c.act}</div>`:''}
`);
  $('screen').appendChild(el);
  const rec={el,pinned:false,anchorId:p.id,anchorEl:a,data:p};
  POPS.push(rec);
  if(el.querySelector('[data-pin]'))el.querySelector('[data-pin]').onclick=ev=>{ev.stopPropagation();rec.pinned=!rec.pinned;
    el.classList.toggle('pinned',rec.pinned);ev.currentTarget.classList.toggle('on',rec.pinned);
    const pins=POPS.filter(x=>x.pinned);
    if(pins.length>3){pins[0].pinned=false;pins[0].el.classList.remove('pinned');
      const b=pins[0].el.querySelector('[data-pin]'); if(b)b.classList.remove('on')}};
  el.querySelector('[data-close]').onclick=ev=>{ev.stopPropagation();el.remove();POPS.splice(POPS.indexOf(rec),1)};
  el.addEventListener('click',ev=>{
    if(ev.target.closest('[data-drill]')){ev.stopPropagation();drill(rec.data)}
    else if(ev.target.closest('[data-tree]')){ev.stopPropagation();revealInTree(rec.data)} });
  place(rec);
  return rec;
}
function place(rec){
  const a = (rec.anchorEl&&rec.anchorEl.isConnected) ? rec.anchorEl : anchorFor(rec.anchorId);
  if(!a){   // 下钻后舞台上没有对应图元 → 停靠到舞台右上角，指标继续可见
    const st=$('stage').getBoundingClientRect(), s0=$('screen').getBoundingClientRect();
    rec.el.classList.add('docked'); rec.el.style.opacity='';
    rec.el.style.left=Math.round((st.right-s0.left)/SCALE-560-26)+'px';
    rec.el.style.top =Math.round((st.top-s0.top)/SCALE+22)+'px';
    return}
  rec.el.classList.remove('docked');
  rec.anchorEl=a; rec.el.style.opacity='';
  const sr=$('screen').getBoundingClientRect(), ar=a.getBoundingClientRect();
  const ax=(ar.left-sr.left)/SCALE, ay=(ar.top-sr.top)/SCALE, aw=ar.width/SCALE, ah=ar.height/SCALE;
  const w=560, h=rec.el.offsetHeight||380;
  let x=ax+aw+20, y=ay+ah/2-h/2;
  if(x+w>3840-30)x=ax-w-20;
  if(x<30)x=30;
  y=Math.max(200,Math.min(2160-h-26,y));
  rec.el.style.left=Math.round(x)+'px'; rec.el.style.top=Math.round(y)+'px';
}
function repositionPops(){POPS.forEach(place)}

