/* ---- 热力色阶图例：负载 / 能耗图层下，下钻视图右下角常驻 ---- */
function heatBar(){
  const G=heatSet(), w=150, y=VH-136;         // 下钻 viewBox 底约 1786，整条必须画在它上方
  const x0=VW-130-w*G.length;
  let g=`<g><text x="${x0-(S.mode==='pwr'?w+56:24)}" y="${y+21}" fill="#8FA9C4" font-size="26" text-anchor="end" letter-spacing="1" font-weight="600">${S.mode==='pwr'?'实际功率':'负载（算力 / 流量）'}</text>`;
  G.forEach(([c,t],i)=>{g+=`<rect x="${x0+i*w}" y="${y}" width="${w-8}" height="20" rx="6" fill="${c}"/>
    <text x="${x0+i*w}" y="${y+48}" fill="#7089A8" font-size="22">${t}</text>`});
  if(S.mode==='pwr')g+=`<rect x="${x0-w-34}" y="${y}" width="${w-8}" height="20" rx="6" fill="${NA}"/>
    <text x="${x0-w-34}" y="${y+48}" fill="#7089A8" font-size="22">无计量</text>`;
  return g+'</g>';
}
/* ---- 集群视图图例（底部单行，不占版面） ---- */
/* ⭐ v3.30 故障级别四档。**只用在药丸 / 悬浮卡的严重度徽标和图例上**，
   器件着色一律不碰（原则 ①：颜色只表达状态；原则 ⑦：红色是稀缺资源）。
   ⚠ 当前 5 条故障只落在「紧急」和「高」两档，中 / 低是空的 ——
     图例四档全画是产品口径（这套分级是有的），但屏上找不到黄和蓝的实例，
     讲解时要说清「这一屏没有中低级故障」，或者后面补两条低级故障把四档铺满。 */
const SEV=[['紧急','#FF4D6D'],['重要','#FF9A3D'],['次要','#FCC800'],['提示','#6B9BFA']];
const SEVC=k=>(SEV.find(x=>x[0]===k)||SEV[0])[1];
function legend(dark,ox,oy,narrow){
  const y=oy!=null?oy:CY+CH+150;
  const H=[[colH('ok'),'正常'],[colH('err'),'故障']];
  const G=heatSet();
  /* 「图例」二字删掉：色块 + 标签本身就说明了它是图例。
     间距按真实文字宽度算 —— 原来写死 150/300，标题一变长就压在第一个色块上。 */
  const tw=t=>[...t].reduce((a,c)=>a+(c.charCodeAt(0)>255?24:12),0);
  let s=`<g transform="translate(${ox!=null?ox:74},${y})">`;
  let cx=0;
  /* 器件字形图例：NPU 是竖的小方块，CPU 是横的宽条 —— 图例里的形状必须和柜里画的一模一样，
     所以柜内 CPU 去掉内核黑块后，这里也跟着去掉。放在色阶之前，
     因为「这是什么」比「这是什么状态」更基础。narrow（逻辑视图）里不画。 */
  if(!narrow){
    s+=`<rect x="0" y="-20" width="15" height="22" rx="3" fill="#5C7E88"/>
      <text x="24" y="0" fill="#8FA9C4" font-size="24">NPU</text>
      <rect x="94" y="-17" width="36" height="17" rx="3" fill="#5C7E88"/>
      <text x="140" y="0" fill="#8FA9C4" font-size="24">CPU</text>
      <line x1="212" y1="-24" x2="212" y2="4" stroke="#2C3138" stroke-width="1.4"/>`;
    cx=240;
  }
  if(S.mode==='health'){
    H.forEach(([c,t])=>{s+=`<rect x="${cx}" y="-17" width="40" height="15" rx="7.5" fill="${c}"/>
      <text x="${cx+54}" y="0" fill="#8FA9C4" font-size="24">${esc(t)}</text>`; cx+=54+tw(t)+40});
    /* ⭐ v3.30 故障级别四档（评审意见）。
       ⚠ 这是**两件事**，图例上必须分开：
         左边「正常 / 故障」= **器件着色**，屏上只有红绿两态（原则 ①：颜色只表达状态）；
         右边「紧急 / 高 / 中 / 低」= **故障级别**，只出现在药丸和悬浮卡的严重度徽标上。
       所以中间加一条分隔线 + 一个「故障级别」小标题 —— 不加的话观众会去屏上找橙黄蓝的器件，
       而器件永远不会是橙黄蓝（那两个色在负载 / 能耗图层另有含义，混用必然打架）。 */
    cx+=10;
    s+=`<line x1="${cx}" y1="-24" x2="${cx}" y2="4" stroke="#2C3138" stroke-width="1.4"/>`; cx+=28;
    s+=`<text x="${cx}" y="0" fill="#5C6F8E" font-size="21">故障级别</text>`; cx+=tw('故障级别')+24;
    SEV.forEach(([k,c])=>{s+=`<rect x="${cx}" y="-16" width="30" height="14" rx="4" fill="${c}"/>
      <text x="${cx+40}" y="0" fill="#8FA9C4" font-size="22">${k}</text>`; cx+=40+tw(k)+26});
  }else{
    const ttl=S.mode==='util'?'负载（算力 / 流量）':S.mode==='pwr'?'实际功率':'链路带宽';
    /* narrow：标题另起一行。逻辑视图把图例放在面板左侧的窄栏里，
       横排的话「标题 + 四个色块」有 960px 宽，会压到实例组框上（踩过）。 */
    if(narrow){ s+=`<text x="0" y="-40" fill="#8FA9C4" font-size="24" font-weight="600">${ttl}</text>` }
    else { s+=`<text x="${cx}" y="0" fill="#8FA9C4" font-size="24" font-weight="600">${ttl}</text>`; cx+=tw(ttl)+44 }
    const step=narrow?92:98, bw2=narrow?80:86;
    G.forEach(([c,t])=>{s+=`<rect x="${cx}" y="-16" width="${bw2}" height="14" rx="5" fill="${c}"/>
      <text x="${cx}" y="24" fill="#5C6F8E" font-size="19">${esc(t)}</text>`;cx+=step});
    cx+=34;
    /* 「无独立计量」只在物理视图列：逻辑视图里压根没画 Union / 端口 / lane / 光模块 */
    if(S.mode==='pwr'&&!narrow){   // 芯片内逻辑单元没有独立功耗传感器，避免被读成「零功耗」
      const na='无独立计量（Union / 端口 / lane / 光模块）';
      s+=`<rect x="${cx}" y="-15" width="60" height="13" rx="5" fill="${NA}"/>
        <text x="${cx+74}" y="0" fill="#8FA9C4" font-size="21">${na}</text>`;cx+=74+tw(na); }
  }
  /* ⭐ v3.30.6（评审意见 5）：介质图例 —— 虚线 = 光纤，实线 = 电缆。
     这一条**三个图层都要出**：介质不随图层变，它是这张图的读法，不是某一层的度量。 */
  if(!narrow){
    cx+=18;
    s+=`<line x1="${cx}" y1="-24" x2="${cx}" y2="4" stroke="#2C3138" stroke-width="1.4"/>`; cx+=26;
    s+=`<line x1="${cx}" y1="-9" x2="${cx+56}" y2="-9" stroke="#6FB3E0" stroke-width="3" class="flow" stroke-linecap="round"/>
        <text x="${cx+70}" y="0" fill="#8FA9C4" font-size="22">Fiber</text>`;
    cx+=70+tw('Fiber')+30;
    s+=`<line x1="${cx}" y1="-9" x2="${cx+56}" y2="-9" stroke="#6FB3E0" stroke-width="3" stroke-linecap="round"/>
        <text x="${cx+70}" y="0" fill="#8FA9C4" font-size="22">Cable Tray</text>`;
  }
  return s+'</g>';
}


