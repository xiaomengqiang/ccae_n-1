/* ================== 视图：刀片 ================== */
function bladeView(){
  const v=S.view;
  if(v.t==='npublade')return vNpuBlade(v);
  if(v.t==='cpublade')return vCpuBlade(v);
  if(v.t==='swblade')return vSwBlade(v);
  if(v.t==='netdev')return vNetDev(v);
  
  if(v.t==='mgmtblade')return vMgmt(v);
  if(v.t==='pwrbox')return vPwr(v);
  return '';
}
/* SFU 盒：刀片视图与卡内视图共用同一样式 */
/* 端口药丸的缓存：必须画在连线**之上**，所以由调用方在 return 时追加（见 vNpuBlade）。 */
let SFUCAP=[];
const flushSfuCap=()=>{const t=SFUCAP.join('');SFUCAP=[];return t};
function sfuBox(x,y,w,h,sw,j,o){
  o=o||{};
  const A='#00E6A2', err=sw.status==='err', hot=!!o.hot, dim=o.dim===undefined?1:o.dim;
  /* ⭐ v3.28：高亮的 Union **方块加高到 40、编号字号 21→26**（评审：太小看不清）。
     26px 在 2m 讲解位是 22.8 arcmin，过了四点十五的 20 舒适线（21px 只有 18.4，刚过可辨认线）。
     26px 粗体的「U09」约 47px 宽 < 方块 56.4，装得下；再大就顶边了。
     ⚠ 加高的方向要**背着另一排长**：上排往上、下排往下，否则两排会叠在一起。
     为此把整个芯片网格上移 14px（gy 从 h-72 改成 h-86），给下排的加高腾出空间 ——
     改完两种盒高都还剩 16px 到盒底（vNpuBlade SH=210 / cardView SH=196）。 */
  const gy=y+h-86, cw=(w-56)/10, UH=40;
  const showU = o.only!=null&&o.pair ? [o.pair[o.only]] : (o.pair||null);
  /* 一个 Union 方块的几何：常态 26 高；高亮态 40 高，上排往上长、下排往下长 */
  const uGeo=(u,on)=>{const bot=u>10, y0=gy+(bot?30:0);
    return {ux:x+28+((u-1)%10)*cw, uy:(on&&!bot)?y0-(UH-26):y0, hh:on?UH:26}};
  let g=`<g opacity="${dim}"><g class="clk" data-act="swblade" data-id="${sw.id}" data-pod="${o.pod}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#0A1523"
      stroke="${err?colH('err'):(hot?A:'#2C6E8F')}" stroke-width="${hot?3:1.6}" />
    <text x="${x+26}" y="${y+42}" fill="#DCEBFA" font-size="24" font-weight="700">${sw.name}</text>
    ${/* ⛔ v3.30.3（评审意见 4）：健康态右上角原来写「Union ×20」—— 4 个盒子写同一句话。
         负载 / 能耗态照旧出百分比（那是这一层真正的读数），故障态出「上行中断」。 */
      (err||S.mode!=='health')?`<text x="${x+w-26}" y="${y+42}" fill="${err?colH('err'):devCol(sw)}" font-size="26" font-weight="700" text-anchor="end">${
      err?'上行中断':S.mode==='util'?sw.bw+'%':sw.pwrp+'%'}</text>`:''}
</g>`;
  /* ⭐ v3.27（评审意见）：**只给高亮的那 1–2 颗 Union 标编号**，不给全部 20 颗标。
     三条理由：
     ① **数量** —— 20 颗 × 4 个盒 = 80 个标号，而这一层要回答的问题只是
        「这张卡连到哪两颗」，其余 78 个是噪音（同 v3.22.0 删操作说明那条：
        这行字是写给谁看的、他会在什么距离看）。
     ② **尺寸** —— 每颗只有 56×26，标号只能塞进方块里。21px 是四点十五定的「要被读的字」
        下限（2m 讲解位 18.4 arcmin）；20 颗都标就得再缩，直接掉到线下。
        只标 2 颗则可以稳稳给到 21px 粗体（「U09」约 36px 宽 < 56.4，装得下）。
     ③ **术语** —— 那 20 个不是「端口」，是 **Union 互联芯片**（端口是 Union 上的
        统一编号的 Port 1–18）。所以写 `U1.9` 而不是 `9`，
        与 SFU 详情页、二点五连接关系全表同一套编号。
     ⚠ 标在**方块里面**而不是上方的空白带：下排那 10 颗（U11–U20）上方隔着上排，
       标在带里会让人以为标的是上排那两颗。标在自己身上，零歧义。
     ⚠ 前置条件：`unionOf()` 必须先修对（见它上面的长注释）——
       标号之前这里显示的是错的编号，只是没人看得出来。 */
  for(let u=1;u<=20;u++){
    const on=showU&&showU.indexOf(u)>=0;
    const {ux,uy,hh}=uGeo(u,on);
    const uc0=uByNo(sw,u); if(!uc0)continue;
    g+=`<g class="clk" data-act="uchip" data-id="${uc0.id}" data-pod="${o.pod}" data-blade="${sw.id}">
      <rect x="${ux}" y="${uy}" width="${cw-6}" height="${hh}" rx="4"
        fill="${on?'#0F3A2E':lyF(uc0,'#152233')}" fill-opacity="${on||S.mode==='health'?1:lyO()}"
        stroke="${on?A:lyS(uc0,'#25405F')}" stroke-width="${on?2.4:1}"/>
      ${on?(()=>{const _t=uLblNo(u);
        /* ⚠ v3.30.2：编号从 3 字（U09）变成最长 5 字（U1.16），26px 粗体约 78px > 方块 56.4，会顶出边。
           5 字降到 21px（约 55px 宽，刚好装下）—— 21px 正是四点十五定的「要被读的字」下限，
           2m 讲解位 18.4 arcmin，不能再小；短标号（U2.1 / U1.9）仍保持 26px。 */
        return `<text x="${ux+(cw-6)/2}" y="${uy+hh/2+(_t.length>=5?8:9)}" fill="#9BE9E1" font-size="${_t.length>=5?21:26}" font-weight="700"
        letter-spacing="${_t.length>=5?-0.8:0}" text-anchor="middle">${_t}</text>`})():''}
      </g>`;
  }
  if(showU){
    const bl=!!o.below;                       // true = 连线从下方接入（SFU 位于上层）
    /* ⭐ v3.30（评审意见）：Union 有编号之后，把**卡这一侧的端口号**也标出来 ——
       否则只知道「连到 U09」，不知道「从这张卡的哪个口出去的」，这条链路只说了一半。
       ⚠ 标在**盒外、每颗 Union 正下方**，不标在盒里：
         盒里那 20 个方块只有 56×26，塞不下第二行字（Union 号已经占满了）；
         而盒底下方正好是链路曲线出发的空带，一颗 Union 对一个药丸，位置零歧义。
       ⚠ 两颗 Union 只隔 62px，药丸宽 ~90px 会撞 —— 所以**上下错开 34px**。 */
    const tw2=t=>[...t].reduce((a,c)=>a+(c.charCodeAt(0)>255?22:12),0);
    showU.forEach((u,si)=>{
      /* 引线要接到**加高之后**的方块边上，不能再写死 26（否则会插进方块里或者差一截） */
      const tx=sfuUnionX(x,w,u), G=uGeo(u,true);
      g+=`<path d="M${tx},${bl?y+h:y} L${tx},${bl?G.uy+G.hh:G.uy}" stroke="${hot?A:'#4E7BA8'}" stroke-width="2" opacity=".7" stroke-dasharray="6 5"/>`;
      const lb=o.portOf&&o.portOf[u];   /* ⚠ sfuBox 的参数叫 o 不叫 opt（alarmBubble 才是 opt） */
      if(lb){
        const pw=tw2(lb)+30, ph=30, dir=bl?1:-1;
        const py2=(bl?y+h:y-ph)+dir*(10+si*36);
        /* ⚠ 进 SFUCAP 不进 g —— 端口药丸正好落在 8 条链路曲线出发的那条带上，
           而连线是最后画的（为了压住外框），直接进 g 会被虚线划花（坑 43：
           层级是四层，底框 → 器件 → 连线 → **标签**）。 */
        SFUCAP.push(`<path d="M${tx},${bl?y+h:y} L${tx},${py2+(bl?0:ph)}" stroke="${A}" stroke-width="1.6" opacity=".55"/>
            <rect x="${tx-pw/2}" y="${py2}" width="${pw}" height="${ph}" rx="8"
              fill="#0A1A16" stroke="${A}" stroke-width="1.8"/>
            <text x="${tx}" y="${py2+21}" fill="#8FE3DA" font-size="21" font-weight="700"
              text-anchor="middle">${esc(lb)}</text>`);
      }else{
        g+=`<rect x="${tx-11}" y="${(bl?y+h:y)-7}" width="22" height="14" rx="4" fill="${hot?A:'#6FB3E0'}"/>`;
      }
    });
  }
  return g+`</g>`;
}
/* Union 芯片上的端口小标（连线落点） */
/* ⭐ 层级小标（Udie 之类）：**纯文字**，不给框、不给底色。
   给了框就变成一个「块」，在这张全是方块的图里会被当成又一个器件 ——
   它不是器件，是这一列端口的名字。
   为了在连线穿过时仍读得出来，用 paint-order=stroke 给字描一圈**与底同色**的光晕：
   看不出是背景板，但把虚线从字缝里挡掉。bg 传所在面板的填充色。 */
function dieCap(x,y,label,bg){
  /* letter-spacing 只给 .5：`Udie-A` 是混排词，拉字距会散成「U d i e - A」——
     全大写标题才适合大字距。 */
  return `<text x="${x}" y="${y}" text-anchor="middle" font-size="22" font-weight="600" letter-spacing=".5"
    paint-order="stroke" stroke="${bg}" stroke-width="7" stroke-linejoin="round"
    fill="#A8CCE8">${label}</text>`;
}
/* label 传空串 = 只画贴片、不写字（v3.28 起 NPU上的口都走这一支，见下面的长注释）。
   贴片本身不能删 —— 它得骑在器件边线上，否则线头会被器件本体盖住（踩过的坑 6）。
   无字时贴片收窄到 40，八张卡下面就不再是一排 76px 的空盒子。 */
function portTick(x,y,label,on){
  const A='#00E6A2', w=label?76:40;
  return `<rect x="${x-w/2}" y="${y-16}" width="${w}" height="32" rx="7" fill="${on?'#0F2A24':'#22364F'}" stroke="${on?A:'#6FB3E0'}" stroke-width="${on?2.4:1.5}"/>
    ${label?`<text x="${x}" y="${y+7}" fill="${on?A:'#A8CCE8'}" font-size="19" text-anchor="middle" font-weight="700">${label}</text>`:''}`;
}
/* 分区容器：容器底 → 标题条 → 器件块，三级明度阶梯 */
/* 连线：先画一条深色 halo 再画本体，穿过任何底色都清晰 */
/* ⭐ v3.30.6（评审意见 5）：**连线要分得出光和电**。
   · 光纤 —— 只有 **L1 的 LPO ↔ L2 设备** 这一段（跨柜，走光模块）：虚线 + 流动动画，
     动画本身就是「光在跑」的隐喻。
   · 电缆（Cable Tray）—— 其余全部（NPU↔Union、Union↔互联 Union、Union↔IO、CPU↔NPU、mesh）：
     **实线，不动**。
   判据：两种线在 2m 外要能一眼分开 —— 虚实是最强的区分，比颜色深浅可靠得多
   （颜色在这套图里已经被状态和色阶占满了，不能再兼职表达介质）。
   ⚠ `opt` 默认 false：**新写的连线默认是电缆**，只有光纤那一处显式传 true。 */
function link(d,col,wd,op,blink,opt){
  return `<path d="${d}" fill="none" stroke="#04070C" stroke-width="${wd+4}" opacity="${Math.min(1,op*1.15)}" stroke-linecap="round" stroke-linejoin="round"/>`+
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${wd}" opacity="${op}"${opt?' class="flow"':''} stroke-linecap="round" stroke-linejoin="round"/>`;
}
/* SFU 盒里第 u 颗 Union 在顶边的进线 x 坐标 */
function sfuUnionX(x,w,u){const cw=(w-56)/10; return x+28+((u-1)%10)*cw+(cw-6)/2}
/* 板载器件按真实数量画出来：内存 24 条 / 硬盘 4 块 / 风扇 6 个 / 电源 1 块 */
const o_NAME=k=>({mem:'内存',disk:'硬盘',fan:'风扇',pwr:'电源',chip:'管理芯片'}[k]||k);
/* 风扇模块是变频调速的，有独立功耗计量。这里按整板 id 确定性给值（不吃随机数，换版不变）。
   ⚠ 待架构师确认：风扇功耗是单独计量还是并进整板 —— 见确认清单。 */
function fanPwr(o){ if(!o||!o.id)return 32;
  let h=0; for(let i=0;i<o.id.length;i++)h=(h*31+o.id.charCodeAt(i))>>>0; return 22+h%26 }
function partGroup(x,y,w,kind,n,id,ctx,dim,on,label,pw){
  const A='#00E6A2';
  const hp=(S.mode==='pwr'&&pw!=null)?heat(pw):null;      // 能耗图层：按自己的功耗着色
  const col=on?A:(hp||'#6FB3E0');
  const NAME=o_NAME(kind);
  let h,inner='';
  if(kind==='mem'){
    const cols=8, cw=(w-40)/cols, bw=cw-9, rows=Math.ceil(n/cols), bh=76;
    h=54+rows*(bh+12);
    for(let i=0;i<n;i++){const bx=x+20+(i%cols)*cw, by=y+48+Math.floor(i/cols)*(bh+12);
      inner+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${on?'#0F3A2E':'#22364F'}" stroke="${col}" stroke-width="1.4"/>`}
  }else if(kind==='disk'){
    const cw=(w-40)/n, bw=cw-12, bh=98; h=54+bh+14;
    for(let i=0;i<n;i++){const bx=x+20+i*cw;
      inner+=`<rect x="${bx}" y="${y+48}" width="${bw}" height="${bh}" rx="7" fill="${on?'#0F3A2E':'#22364F'}" stroke="${col}" stroke-width="1.3"/>
        <rect x="${bx+12}" y="${y+70}" width="${bw-24}" height="7" rx="3.5" fill="${col}" opacity=".6"/>`}
  }else if(kind==='fan'){
    const cw=(w-40)/n, r=Math.min(26,cw/2-6), bh=r*2; h=50+bh+12;
    for(let i=0;i<n;i++){const cx=x+20+i*cw+cw/2-4, cy=y+44+r;
      /* ⭐ v3.30.1：圆心那个点换成扇叶（同 fanFace）。风扇在这套图里只能有**一种**画法 ——
         L2 设备正面画叶片、刀片里画圆点，观众会以为是两种器件。 */
      inner+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${on?'#0F3A2E':(hp||'#22364F')}" fill-opacity="${hp&&!on?.45:1}" stroke="${col}" stroke-width="1.3"/>`
        + fanBlades(cx,cy,r,col,false)}
  }else if(kind==='chip'){
    const cw=(w-40)/n, bw=Math.min(cw-10,110), bh=56; h=50+bh+12;
    for(let i=0;i<n;i++){const bx=x+20+i*cw;
      inner+=`<rect x="${bx}" y="${y+44}" width="${bw}" height="${bh}" rx="7" fill="${on?'#0F3A2E':'#22364F'}" stroke="${col}" stroke-width="1.4"/>`}
  }else{
    const bw=w-40, bh=66; h=50+bh+12;
    inner+=`<rect x="${x+20}" y="${y+44}" width="${bw}" height="${bh}" rx="6" fill="${on?'#0F3A2E':'#22364F'}" stroke="${col}" stroke-width="1.4"/>`;
  }
  return {h, svg:`<g class="clk" data-act="part" data-id="${id}-Q${NAME}" ${ctx} opacity="${dim}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#0F1A28" stroke="${on?A:'#4E7BA8'}" stroke-width="${on?2.6:1.4}"/>
    <text x="${x+20}" y="${y+33}" fill="#A8CCE8" font-size="24" letter-spacing="1">${label||NAME} × ${n}</text>${inner}</g>`};
}
/* 分区容器：标题条单独缓存，连线画完后再补一次，保证标题不被穿过的线划花 */
let ZCAPS=[];
/* 能耗图层下，「本板」分区标题右侧标出整板功耗 —— 板级是这一层真正被计量的粒度 */
function bladePwrTag(o){
  if(S.mode!=='pwr'||!o)return '';
  if(o.cards&&o.cards.length)return `整板功耗 ${(o.cards.reduce((a,k)=>a+k.pwr,0)/1000).toFixed(2)} kW`;
  if(o.pwrp!=null)return `整板功耗 ${o.pwrp}%（额定）`;
  if(o.kw!=null)return `输出功率 ${o.kw} kW`;
  return '';
}
/* ⭐⭐ v3.30.9（评审意见 1）：分区标题**拆成两半，落在两个不同的图层**。
   v3.30.8 把整条标题条挪到了连线之上，结果矫枉过正 —— 不透明的条把穿过它的连线
   齐刷刷切断，看着像「板卡外框压在线上面」。
   正解是**按元素性质分层，不是按元素整体分层**：
     · 标题**条**（那块不透明底）属于**容器层** → 连线从它上面过（线是主体，不该被容器挡）
     · 标题**字**属于**标签层** → 压在连线之上，再加同底色描边，线穿过去也读得出
   四层顺序因此更准确地表述为：底框 → 器件（含容器的底与条）→ 连线 → **要被读的字**。 */
function zoneCapBar(x,y,w){
  return `<path d="M${x},${y+16} a16,16 0 0 1 16,-16 h${w-32} a16,16 0 0 1 16,16 v34 h${-w} z" fill="#1A2C42"/>`;
}
function zoneCapTxt(x,y,w,label,rt){
  const HL=' paint-order="stroke" stroke="#1A2C42" stroke-width="6" stroke-linejoin="round"';
  return `<text x="${x+26}" y="${y+33}" fill="#A8CCE8" font-size="23" letter-spacing="2"${HL}>${label}</text>`
    +(rt?`<text x="${x+w-26}" y="${y+33}" fill="#DCEBFA" font-size="22" font-weight="600" text-anchor="end" letter-spacing="1"${HL}>${rt}</text>`:'');
}
function zone(x,y,w,h,label,rt){
  ZCAPS.push(zoneCapTxt(x,y,w,label,rt));          // 字进标签层（由调用方在连线之后 flush）
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#0F1A28" stroke="#4E7BA8" stroke-width="2"/>`
    +zoneCapBar(x,y,w);                            // 条留在容器层
}
function flushCaps(){const c=ZCAPS.join('');ZCAPS=[];return c}
/* 舞台内不再画标题：面包屑已经写明「在哪一层、看哪个器件」，画布上再写一遍是重复 */
function head(t1,t2){ZCAPS=[];return ''}

function vNpuBlade(v){
  const P=findPod(v.pod), b=P.npu.find(x=>x.id===v.id); if(!b)return '';
  const cpuB=P.cpu[b.idx];
  const A='#00E6A2', sel=S.sel||{};
  const selCard = sel.t==='npu' ? b.cards.findIndex(k=>k.id===sel.id) : -1;
  const selCpu  = sel.t==='cpu2' ? +sel.id.slice(-1) : -1;
  const selSfu  = sel.t==='swblade' ? P.sw.findIndex(w=>w.id===sel.id) : -1;
  const selPart = sel.t==='part' ? sel.id.split('-Q').pop() : null;
  const anyFocus = selCard>=0||selCpu>=0||selSfu>=0||selPart;

  /* 与 CPU 刀片页统一：上游 zone / 本板 zone（左侧板载器件 + 右侧主器件）/ 下游 zone */
  /* 楼层顺序统一为 SFU(上) → NPU 本板(中) → CPU(下) */
  /* 步长 753 而不是 790：分区右边界 3170，末个盒右缘 = 170+3*step+680 必须 ≤ 3110（留 60 内边距）。
     原来 790 会让 SFU4 右缘顶到 3220，整块探出分区框 50px。 */
  const SY=230, SH=292, SW=510, SX=k=>800+k*585;
  const BY0=560, BH0=580;
  /* ⭐ v3.31.0（评审意见 2）：**NPU 1–4 与 5–8 之间开一道组间空档**。
     这不是排版偏好，是板上真实的分组：1–4 挂 CPU 1、5–8 挂 CPU 2，
     两颗 Udie 的左右朝向也是按这条线镜像的（见二点五·四）。
     ⚠ 总跨度保持不变（右缘仍是 3133），空档从卡间距里匀出来：
       8 卡 + 7 个间隙，把其中第 4 个间隙加宽到 NGAP，其余间隙等分剩下的宽度。 */
  const NGAP=50, NW=174, NH=174, NY=910, NX=i=>1340+i*224+(i>=4?NGAP:0);
  const CY2=1180, CBH=480, CW2=174, CH2=174, CX=c=>(c?2500:1340);
  const NB=NY+NH, CTOP=CY2+220, SBOT=SY+SH;
  const nIn=(i,c)=>NX(i)+NW/2+(c?52:-52);

  /* 槽位号进标题：讲解时「计算柜 03 · 槽位 23」就是一个完整的机房地址 */
  let s=head(`${P.name} · ${b.name}`,
    '板内 8 × NPU 全互联（HCCS）');

  /* ---- 分区容器先画 ---- */
  s+=zone(110,SY-110,3060,SH+140,'上层 · 灵衢互联刀片');
  s+=zone(110,BY0,3060,BH0,`本板 · ${b.name}`,bladePwrTag(b));
  s+=zone(110,CY2,3060,CBH,`下层 · ${cpuB.name}`);
  s+='<rect x="750" y="800" width="480" height="290" rx="16" fill="#414141"/><rect x="1300" y="800" width="1850" height="290" rx="16" fill="#414141"/><rect x="750" y="1345" width="2370" height="270" rx="16" fill="#414141"/>';

  /* ---- 板载器件（左侧一列，与 CPU 刀片页同一语言）---- */
  let py=BY0+255;
  [['fan',2,'风扇']].forEach(([kd,n,lb])=>{
    const f=!anyFocus?null:(selPart===lb);
    const g=partGroup(750,py,470,kd,n,b.id,`data-pod="${P.id}" data-blade="${b.id}"`,f===false?.3:1,f===true,lb,kd==='fan'?fanPwr(b):null);
    s+=g.svg; py+=g.h+22;
  });

  const st=(f,base,hot)=>f===false?{c:base,o:.07,w:1.2}:f===true?{c:hot||A,o:1,w:3.6}:{c:base,o:.95,w:2.4};
  let L='';
  /* CPU → NPU：每颗 CPU 连全部 8 张卡 */
  for(let i=0;i<8;i++){
    const c=cpuOfNpu(i);
    for(let w=0;w<2;w++){
      const f=!anyFocus?null:(selCard===i||selCpu===c);
      const o=st(f,'#6FB3E0');
      const x1=CX(c)+CW2/2, x2=nIn(i,w);
      L+=link(`M${x1},${CTOP} C${x1},${CTOP-180} ${x2},${NB+220} ${x2},${NB+12}`,o.c,o.w,o.o);
    }
  }
  /* NPU 全互联 mesh：默认不画（28 条太密），选中某张卡时才展开它的 7 条 */
  if(selCard>=0){
    for(let j=0;j<8;j++){ if(j===selCard)continue;
      const x1=NX(selCard)+NW/2, x2=NX(j)+NW/2, h=60+Math.abs(j-selCard)*30;
      L+=link(`M${x1},${NB} C${x1},${NB+h} ${x2},${NB+h} ${x2},${NB}`,A,2.6,.95);
    }
  }
  /* NPU → SFU：默认聚合到刀片级；选中某卡时展开到它的 2 颗 Union */
  for(let i=0;i<8;i++)for(let k=0;k<4;k++){
    const sw=P.sw[k], err=sw.status==='err';
    const f=!anyFocus?null:(selCard===i||selSfu===k);
    const x1=NX(i)+NW/2, y1=NY;
    if(selCard===i){
      unionOf(b.idx,i,k).forEach(u=>{
        const ux=sfuUnionX(SX(k),SW,u);
        L+=link(`M${x1},${y1} C${x1},${y1-170} ${ux},${SBOT+190} ${ux},${SBOT+14}`,err?colH('err'):A,3.2,1,err);
      });
    } else {
      const o=st(f,err?colH('err'):'#6FB3E0');
      const x2=SX(k)+SW/2;
      L+=link(`M${x1},${y1} C${x1},${y1-170} ${x2},${SBOT+190} ${x2},${SBOT+6}`,o.c,o.w*1.3,o.o,err&&f!==false);
    }
  }
  const ZC=flushCaps();   // v3.30.9：分区标题的**字**进标签层，条留在容器层

  /* ---- 上游 CPU ×2 ---- */
  for(let c=0;c<2;c++){
    const f=!anyFocus?null:(selCpu===c||(selCard>=0&&cpuOfNpu(selCard)===c));
    s+=`<g class="clk" data-act="cpu2" data-id="${cpuB.id}-U${c}" data-pod="${P.id}" data-blade="${cpuB.id}" opacity="${f===false?.3:1}">
      <rect x="${CX(c)}" y="${CTOP}" width="${CW2}" height="${CH2}" rx="12"
        fill="${lyF(cpuB,'#22364F')}" fill-opacity="${lyO()}" stroke="${f===true?A:lyS(cpuB,'#6FB3E0')}" stroke-width="${f===true?3.4:2}"/>
      <text x="${CX(c)+CW2/2-(S.mode==='health'?0:78)}" y="${CY2+104}" fill="#E7EFFA" font-size="40" font-weight="700" text-anchor="middle">CPU ${c+1}</text>
      ${S.mode!=='health'?`<text x="${CX(c)+CW2-36}" y="${CY2+104}" fill="${devCol(cpuB)}" font-size="36" font-weight="700"
        text-anchor="end" font-variant-numeric="tabular-nums">${S.mode==='pwr'?cpuB.pwrp+'%':cpuB.util+'%'}</text>`:''}

      <rect x="${CX(c)+CW2/2-70}" y="${CTOP-9}" width="140" height="18" rx="6" fill="${f===true?A:'#6FB3E0'}"/></g>`;
  }
  /* ---- 本板 8 × NPU ---- */
  /* ⛔ v3.28（评审意见）：NPU下沿那两个口**不再写字**（原来写 B·P04 / B·P07），只留贴片。
     判据不是「字小」，是**这两个标签在 8 张卡上一模一样，什么都没区分** ——
     同一行里每个实例都写同一句话的标签，等于没写（同 v3.22.0 删操作说明那条）。
     「这两个口去 CPU」这件事两条连线本来就画出来了（原则 ④：图形表达连接，文字不重复）；
     要看具体是哪个口，悬浮卡和卡内视图里都有，那才是要读的地方。
     ⚠ 贴片本身不能删 —— 它得骑在器件边线上，否则线头会被器件本体盖住（坑 6）。
     同样的改动在 vCpuBlade 上层的 NPU、以及 CPU 原地放大态里各有一处，三处一起改。 */
  b.cards.forEach((k,i)=>{
    const f=!anyFocus?null:(selCard===i);
    const c=S.mode==='health'?colH(k.status):devCol(k);
    s+=`<g class="clk" data-act="npu" data-id="${k.id}" data-pod="${P.id}" data-blade="${b.id}" opacity="${f===false?.26:1}">
      <rect x="${NX(i)}" y="${NY}" width="${NW}" height="${NH}" rx="12"
        fill="${f===true?'#0F2A24':lyF(k,'#22364F')}" fill-opacity="${f===true?1:lyO()}"
        stroke="${f===true?A:c}" stroke-width="${f===true?3.6:2}"/>
      <text x="${NX(i)+NW/2}" y="${NY+(S.mode==='health'?100:78)}" fill="#E7EFFA" font-size="35" font-weight="700" text-anchor="middle">${k.name}</text>
      ${S.mode!=='health'?`<text x="${NX(i)+NW/2}" y="${NY+134}" fill="${devCol(k)}" font-size="38" font-weight="700"
        text-anchor="middle" font-variant-numeric="tabular-nums">${S.mode==='pwr'?k.pwr+' W':k.util+'%'}</text>`:''}

      ${portTick(nIn(i,0),NB,'',selCpu===cpuOfNpu(i)||f===true)}${portTick(nIn(i,1),NB,'',selCpu===cpuOfNpu(i)||f===true)}
      <rect x="${NX(i)+NW/2-13}" y="${NY-7}" width="26" height="14" rx="4" fill="${f===true?A:'#6FB3E0'}"/></g>`;
  });
  /* ---- 下游 SFU ×4 ---- */
  P.sw.forEach((sw,k)=>{
    const f=!anyFocus?null:(selSfu===k||selCard>=0);
    const pair = selCard>=0 ? unionOf(b.idx,selCard,k) : null;
    /* ⛔ v3.30.1：撤掉 v3.30 在这里加的「卡侧端口号」药丸（A·P01 / B·P00）。
       评审澄清：要的是**一条线两端都标出来**，而不是把 NPU 侧的口号搬到 Union 底下 ——
       药丸挂在 U09 下方却写着 NPU的端口号，指代是反的，读起来像「U09 的 A·P01 口」。
       而且这一层根本没有「选中某个端口」这回事，选中的是整张卡，8 个口一起亮，
       标哪一个都是断章取义。端口级的对应关系下沉到**卡内视图**（cardView）：
       在那里点一个口，才既有本侧口号（面板上的方块）又有对侧口号（Union 下方的药丸）。
       这一层保留 Union 编号就够了 —— 层级越高，标签越粗。 */
    s+=sfuBox(SX(k),SY,SW,SH,sw,k,{pod:P.id,pair,below:true,hot:selSfu===k,dim:f===false?.3:1});
  });

  const info = selCard>=0 ? `已选中 ${b.cards[selCard].name}：mesh 7 条 + 上游 CPU 2 条（本卡 Udie-B 的 P04 / P07）+ 下游 8 条（4 × 灵衢互联刀片各 2 颗 Union）`
    : `CPU → NPU 16 条（CPU 1 带 NPU 0–3、CPU 2 带 NPU 4–7，每张 2 条）｜NPU → 灵衢互联刀片 32 条聚合束｜mesh 默认收起，单击某张 NPU 展开它的 7 条`;
  return s+L+ZC+flushSfuCap();   // 连线压住外框，端口药丸再压住连线（四层：底框→器件→连线→标签）
}

function vCpuBlade(v){
  const P=findPod(v.pod), b=P.cpu.find(x=>x.id===v.id); if(!b)return '';
  const npuB=P.npu[b.idx];
  const A='#00E6A2', sel=S.sel||{};
  const selCpu = sel.t==='cpu2' ? +sel.id.slice(-1) : -1;
  const selNpu = sel.t==='npu' ? npuB.cards.findIndex(k=>k.id===sel.id) : -1;
  const selIo  = sel.t==='ioblade' ? P.io.findIndex(o=>o.id===sel.id) : -1;
  const selPart= sel.t==='part' ? sel.id.split('-Q').pop() : null;
  const anyF = selCpu>=0||selNpu>=0||selIo>=0||selPart;

  /* 楼层顺序统一为 NPU(上) → CPU 本板(中) → IO(下) */
  /* v3.31.0：NPU 1–4 / 5–8 组间空档（与 vNpuBlade 同一条规矩），总跨度不变 */
  const NGAP=70, NY=180, NH=180, NW=160, NX=i=>750+i*294+(i>=4?NGAP:0);
  const BY0=435, BH0=860;
  const CW3=560, CH3=220, CY3=800, CX3=i=>1630+i*880;
  const IOY=1380, IOW=430, IOH=132, IOX=c=>CX3(c)+CW3/2-IOW/2;  // IO 刀片正对各自的 CPU
  const NB=NY+NH;
  const cOut=c=>({x:CX3(c)+CW3/2, y:CY3});            // 向上：8 条 NPU 链路的聚合出线口
  const p9=c=>({x:CX3(c)+CW3/2, y:CY3+CH3});          // 向下：P08 → IO 刀片
  const nIn=(i,w)=>NX(i)+NW/2+(w?58:-58);             // NPU 下接 CPU 的两个端口
  /* 原地放大：选中的 CPU 位置尺寸不变，上下各长出一块端口面板 */
  const zc = (v.zoomCpu===0||v.zoomCpu===1) ? v.zoomCpu : -1, zoom = zc>=0;
  const ZH=90, ZY=CY3-ZH, ZX=CX3(zc<0?0:zc), ZW=CW3, PH=40, PY=ZY+86;
  const PWc=(ZW+60-28)/8, pxc=q=>ZX-46+q*PWc;
  const DZH=96, DZY=CY3+CH3, DPY=DZY-50, DPW=190, DPX=ZX+ZW/2-DPW/2;
  const PCOL='#4F7BFF';

  let s=head(`${P.name} · ${b.name}`,
    'CPU 板 · 2 × CPU');

  /* ---- 分区容器先画 ---- */
  s+=zone(110,NY-62,3060,NH+124,`上层 · ${npuB.name}`);
  s+=zone(110,BY0,3060,BH0,`本板 · ${b.name}`,bladePwrTag(b));
  s+=zone(110,IOY-56,3060,IOH+100,'下层 · RoCE板 ×2（U13 / U27）');
  s+='<rect x="750" y="195" width="2390" height="202" rx="16" fill="#414141"/><rect x="750" y="510" width="2390" height="744" rx="16" fill="#414141"/><rect x="750" y="1380" width="2390" height="150" rx="16" fill="#414141"/>';

  if(zoom)s+=`<rect x="${ZX-90}" y="${ZY-20}" width="${ZW+90}" height="${ZH+CH3+DZH+20}" rx="40" fill="#333333" stroke="#707070" stroke-width="6"/>`;
  /* ---- 旁挂 IO 刀片 ---- */
  P.io.forEach((o,i)=>{
    const f=!anyF?null:(selIo===i||selCpu===i);
    s+=`<g class="clk" data-act="ioblade" data-id="${o.id}" data-pod="${P.id}" opacity="${f===false?.28:1}">
      <rect x="${IOX(i)}" y="${IOY}" width="${IOW}" height="${IOH}" rx="12" fill="#22364F" stroke="${selIo===i?A:'#6FB3E0'}" stroke-width="${selIo===i?3:1.8}"/>
      <text x="${IOX(i)+IOW/2}" y="${IOY+56}" fill="#E7EFFA" font-size="32" font-weight="700" text-anchor="middle">${o.name}</text>

      <rect x="${IOX(i)+IOW/2-15}" y="${IOY-8}" width="30" height="16" rx="5" fill="${f===true?A:'#A8CCE8'}"/></g>`;
  });
  /* ---- 板载器件（按真实数量画出）---- */
  let py=BY0+70;
  [['mem',b.memCnt],['disk',b.diskCnt],['fan',b.fanCnt],['pwr',b.pwrCnt]].forEach(([kd,n])=>{
    const NAME={mem:'内存',disk:'硬盘',fan:'风扇',pwr:'电源'}[kd];
    const f=!anyF?null:(selPart===NAME);
    const g=partGroup(750,py,500,kd,n,b.id,`data-pod="${P.id}" data-blade="${b.id}"`,f===false?.3:1,f===true,undefined,kd==='fan'?fanPwr(b):null);
    s+=g.svg; py+=g.h+22;
  });
  /* ---- 连线：每颗 CPU → 全部 8 张 NPU ---- */
  let L='', CAP='';        // CAP = 要浮在连线之上的文字标签
  for(let c=0;c<2;c++){
    for(let j=0;j<4;j++){                    // 每颗 CPU 只带 4 张卡，每张 2 条
      const i=c*4+j;
      for(let w=0;w<2;w++){
        const on=!anyF?null:(selCpu===c||selNpu===i);
        const q=j*2+w;                       // 放大态从具体端口出线，否则从聚合出线口
        const mine=zoom&&zc===c, bad=S.mode==='health'&&mine&&pFail(b.id+'-U'+c+'-P'+q);
        const col=bad?colH('err'):((mine||on===true)?A:'#6FB3E0');
        const op=on===false?.07:(on?1:.9), wd=(bad||on)?4:2.6;
        const ox=(zoom&&zc===c)?pxc(q)+PWc/2:cOut(c).x, oy=(zoom&&zc===c)?PY:cOut(c).y;
        const tx=nIn(i,w);
        L+=link(`M${ox},${oy} C${ox},${oy-180} ${tx},${NB+200} ${tx},${NB+10}`,col,wd,(zoom&&zc!==c)?op*.3:op);
      }
    }
    const on2=!anyF?null:(selCpu===c||selIo===c);
    const mine2=zoom&&zc===c, bad2=S.mode==='health'&&mine2&&pFail(b.id+'-U'+c+'-P8');
    const p9y=mine2?DPY+PH:p9(c).y;
    L+=link(`M${p9(c).x},${p9y} L${p9(c).x},${IOY-12}`,
      bad2?colH('err'):((mine2||on2===true)?A:'#A8CCE8'),(bad2||on2)?3.8:2.8,on2===false?.07:(on2?1:.94));
  }
  const ZC=flushCaps();   // v3.30.9：分区标题的**字**进标签层，条留在容器层
  /* ---- CPU ×2（端口聚合成一处出线口）---- */
  for(let c=0;c<2;c++){
    const f=!anyF?null:(selCpu===c);
    const o=cOut(c);
    s+=`<g class="clk" data-act="cpu2" data-id="${b.id}-U${c}" data-pod="${P.id}" data-blade="${b.id}" opacity="${f===false?.3:1}">
      <rect x="${CX3(c)}" y="${CY3}" width="${CW3}" height="${CH3}" rx="14"
        fill="${zoom&&zc===c?'transparent':lyF(b,'#22364F')}" fill-opacity="${lyO()}" stroke="${zoom&&zc===c?'none':f===true?A:lyS(b,'#6FB3E0')}" stroke-width="${f===true?3.6:2.2}"/>
      <text x="${zoom&&zc===c?ZX-55:CX3(c)+CW3/2}" y="${zoom&&zc===c?ZY+30:CY3+128}" fill="#E7EFFA" font-size="${zoom&&zc===c?28:56}" font-weight="400" text-anchor="${zoom&&zc===c?'start':'middle'}">CPU ${c+1}</text>
      ${zoom&&zc===c?'':`
      <rect x="${o.x-84}" y="${o.y-10}" width="168" height="20" rx="7" fill="${f===true?A:'#6FB3E0'}"/>
      <text x="${o.x}" y="${o.y+44}" fill="#A8CCE8" font-size="18" text-anchor="middle">P00–P07</text>
      <rect x="${p9(c).x-15}" y="${p9(c).y-8}" width="30" height="16" rx="5" fill="${f===true?A:'#A8CCE8'}"/>`}</g>`;
  }
  /* ---- 下游 NPU ×8（各 2 个 CPU 口）---- */
  npuB.cards.forEach((k,i)=>{
    const own=cpuOfNpu(i);
    const f=!anyF?null:(selNpu===i||selCpu===own);
    s+=`<g class="clk" data-act="npu" data-id="${k.id}" data-pod="${P.id}" data-blade="${npuB.id}" opacity="${f===false?.26:1}">
      <rect x="${NX(i)}" y="${NY}" width="${NW}" height="${NH}" rx="12"
        fill="${lyF(k,'#22364F')}" fill-opacity="${lyO()}"
        stroke="${f===true&&selNpu===i?A:(S.mode==='health'?colH(k.status):devCol(k))}" stroke-width="${selNpu===i?3.4:2}"/>
      <text x="${NX(i)+NW/2}" y="${NY+92}" fill="#E7EFFA" font-size="35" font-weight="700" text-anchor="middle">${k.name}</text>

      ${''/* NPU上接 CPU 的两个口，卡上的编号是 P04 / P07（代码序号 13 / 16）*/}
      ${portTick(nIn(i,0),NB,'',selCpu===own||selNpu===i)}${portTick(nIn(i,1),NB,'',selCpu===own||selNpu===i)}</g>`;
  });
  /* ---- 放大态：上下两块端口面板，与 CPU 连体 ---- */
  if(zoom){
    s+=`<rect x="${ZX}" y="${ZY}" width="${ZW}" height="${ZH}" rx="12" fill="transparent" stroke="none"/>
      <rect x="${ZX+2.6}" y="${ZY+ZH-4}" width="${ZW-5.2}" height="8" fill="transparent"/>
`;
    /* ⛔ v3.30.1：这里原来有两个 `Udie-A` / `Udie-B` 小标，随 CPU 侧 Udie 一起删。
       CPU 的 9 个口本来就是一套连续编号，分组是推的、且分组之后还是得读 P00–P08。 */
    for(let q=0;q<8;q++){
      const pid=b.id+'-U'+zc+'-P'+q, bad=S.mode==='health'&&pFail(pid), i=cpuPortNpu(zc,q);
      const on=!anyF?null:(selNpu===i||selCpu===zc);
      s+=`<g class="clk" data-act="cport" data-id="${pid}" data-pod="${P.id}" data-blade="${b.id}" opacity="${on===false?.35:1}">
        <rect x="${pxc(q)+3}" y="${PY}" width="${PWc-6}" height="${PH}" rx="7" fill="${bad?colH('err'):portCol(52+((q*17)%40))}"/>
        <text x="${pxc(q)+PWc/2}" y="${PY+28}" fill="${bad?'#2A0A10':portTxt(52)}" font-size="29" font-weight="700" text-anchor="middle">P${pad2(q)}</text></g>`;
    }
    const bad8=S.mode==='health'&&pFail(b.id+'-U'+zc+'-P8');
    s+=`<rect x="${ZX}" y="${DZY}" width="${ZW}" height="${DZH}" rx="12" fill="transparent" stroke="none"/>
      <rect x="${ZX+2.6}" y="${DZY-4}" width="${ZW-5.2}" height="8" fill="transparent"/>
      <g class="clk" data-act="cport" data-id="${b.id}-U${zc}-P8" data-pod="${P.id}" data-blade="${b.id}">
        <rect x="${DPX}" y="${DPY}" width="${DPW}" height="${PH}" rx="7" fill="${bad8?colH('err'):portCol(44)}"/>
        <text x="${DPX+DPW/2}" y="${DPY+28}" fill="${bad8?'#2A0A10':portTxt(44)}" font-size="22" font-weight="700" text-anchor="middle">P08</text></g>`;
  }

  const info = selCpu>=0 ? `已选中 CPU ${selCpu+1}：下挂 NPU ${selCpu*4+1}–${selCpu*4+4}，每张 2 条 + RoCE板 ${selCpu+1}`
    : `CPU 1 的 P00–P07 → NPU 0–3（每张 2 条）　CPU 2 的 P00–P07 → NPU 4–7　｜　各自的 P08 → RoCE板`;
  return s+L+ZC+CAP;  // 连线浮在外框之上，文字标签再浮在连线之上
}

