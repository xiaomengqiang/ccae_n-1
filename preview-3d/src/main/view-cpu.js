/* ================== CPU内视图（9 端口） ================== */
function cpuCardView(){
  const v=S.view;
  const P=findPod(v.pod), b=P.cpu.find(x=>x.id===v.blade);
  if(!b)return '';
  const ci=+v.id.slice(-1), cp=b.cpus[ci], npuB=P.npu[b.idx];
  const A='#00E6A2', sel=S.sel||{};
  const selPort = sel.t==='cport' ? +sel.id.split('-P').pop() : -1;

  /* 楼层顺序统一为 NPU(上) → 本板 CPU(中) → RoCE板(下) */
  const NGAP=100, NY=180, NH=200, NW=300, NX=i=>125+i*376+(i>=4?NGAP:0), NB=NY+NH;
  const MX=790, MW=1500, BY0=470, BH0=740, MY=BY0+92, MH=330;
  const RW=440, RH=132, RY=1440, RX=MX+MW/2-RW/2;              // RoCE板 正对 CPU 中线
  const PTW=156, PTH=72, PTY=MY-PTH/2, PTX=q=>MX+84+q*((MW-168-PTW)/7);  // 上行端口骑 CPU 顶边
  const P8X=MX+MW/2-PTW/2, P8Y=MY+MH-PTH/2;                    // P08 → IO，骑 CPU 底边
  const nIn=(i,w)=>NX(i)+NW/2+(w?58:-58);                      // NPU 下沿接 CPU 的两个口（NPU 的 B 面 P04 / P07）

  let s=head(`${P.name} · ${b.name} · ${cp.name}`,
    `CPU内连接视图：9 端口 · P00–P07 每 2 个接 1 张 NPU（落在该卡的 P04 / P07）· P08 接 RoCE板的 Union`);

  /* ---- 分区容器先画（本层只呈现上一层 IO 与下一层 NPU，不画 SFU）---- */
  s+=zone(110,NY-62,3060,NH+124,`上层 · ${npuB.name}`);
  s+=zone(110,BY0,3060,BH0,`本板 · ${b.name}`,bladePwrTag(b));
  s+=zone(110,RY-56,3060,RH+100,`下层 · ${P.io[ci].name}`);

  /* ---- 上游 RoCE板 ---- */
  const ioB=P.io[ci], fIo = selPort<0?null:selPort===8;
  s+=`<g class="clk" data-act="ioblade" data-id="${ioB.id}" data-pod="${P.id}" opacity="${selPort>0&&!fIo?.26:1}">
    <rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" rx="12" fill="#22364F" stroke="#6FB3E0" stroke-width="1.8"/>
    <text x="${RX+RW/2}" y="${RY+50}" fill="#E7EFFA" font-size="26" font-weight="700" text-anchor="middle">RoCE板</text>

    ${portTick(RX+RW/2,RY,'Union',!!fIo)}</g>`;

  /* ---- 板载器件（按真实数量画出）---- */
  let py=BY0+70;
  [['mem',b.memCnt],['disk',b.diskCnt],['fan',b.fanCnt],['pwr',b.pwrCnt]].forEach(([kd,n])=>{
    const g=partGroup(180,py,500,kd,n,b.id,`data-pod="${P.id}" data-blade="${b.id}"`,.62,false,undefined,kd==='fan'?fanPwr(b):null);
    s+=g.svg; py+=g.h+22;
  });
  /* ---- 另一颗 CPU ---- */
  s+=`<g class="clk" data-act="cpu2" data-id="${b.id}-U${1-ci}" data-pod="${P.id}" data-blade="${b.id}" opacity=".4">
    <rect x="2470" y="${BY0+240}" width="440" height="250" rx="12" fill="#22364F" stroke="#4E7BA8" stroke-width="1.8"/>
    <text x="2690" y="${BY0+372}" fill="#E7EFFA" font-size="32" font-weight="700" text-anchor="middle">CPU ${2-ci}</text>
    <text x="2690" y="${BY0+412}" fill="#A8CCE8" font-size="17" text-anchor="middle">下挂 NPU ${(1-ci)*4+1}–${(1-ci)*4+4}</text></g>`;

  /* ---- 连线：CPU 端口 → NPU 端口 / RoCE板 ---- */
  let L='';
  for(let q=0;q<=8;q++){
    const on = selPort<0?null:selPort===q;
    let d,col;
    if(q<=7){
      const i=cpuPortNpu(ci,q), px=PTX(q)+PTW/2, tx=nIn(i,q%2);
      col=A;
      d=`M${px},${PTY} C${px},${PTY-190} ${tx},${NB+230} ${tx},${NB+14}`;
    } else {
      const px=P8X+PTW/2;
      col=A;
      d=`M${px},${P8Y+PTH} L${px},${RY-14}`;
    }
    L+=link(d,col,on?3.8:2.8,on===false?.07:(on?1:.94));
  }
  const ZC=flushCaps();   // v3.30.9：分区标题的**字**进标签层，条留在容器层

  /* ---- 展开的 CPU + 9 端口（骑边）---- */
  s+=`<rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18" fill="#22364F" stroke="${A}" stroke-width="2.8"/>
    <text x="${MX+36}" y="${MY+MH-116}" fill="#E7EFFA" font-size="46" font-weight="700">${cp.name}</text>
    <text x="${MX+MW-36}" y="${MY+MH-116}" fill="#A8CCE8" font-size="20" text-anchor="end">9 端口 · 8 → NPU / 1 → RoCE板</text>
    <text x="${MX+36}" y="${MY+MH-72}" fill="#A8CCE8" font-size="21">${cp.cores} 核 · 下挂 NPU ${ci*4+1}–${ci*4+4}（每张 2 个端口）</text>
    <text x="${P8X+PTW+18}" y="${P8Y+PTH-8}" fill="#8FA9C4" font-size="17">下行端口 P08 → RoCE板</text>`;
  /* ⛔ v3.30.1：这里原来有两行 `Udie-A · P00–P03` / `Udie-B · P04–P07` 小标，随 CPU 侧 Udie 一起删。
     端口方块底下已经逐个写了对端卡名，读者要的是「这个口去哪张卡」，不是「它在哪颗 die 上」。 */
  let CAP='';              // 要浮在连线之上的文字标签
  for(let q=0;q<=8;q++){
    const on=selPort<0?null:selPort===q;
    const col = on===true?A:(q<=7?'#6FB3E0':'#A8CCE8');
    const bx=q<=7?PTX(q):P8X, by=q<=7?PTY:P8Y;
    const tgt = q<=7 ? npuB.cards[cpuPortNpu(ci,q)].name : 'RoCE板';
    s+=`<g class="clk" data-act="cport" data-id="${b.id}-U${ci}-P${q}" data-pod="${P.id}" data-blade="${b.id}" opacity="${on===false?.32:1}">
      <rect x="${bx}" y="${by}" width="${PTW}" height="${PTH}" rx="8" fill="${on===true?'#0F2A24':'#1A2C42'}"
        stroke="${col}" stroke-width="${on===true?3.4:2}"/>
      <text x="${bx+PTW/2}" y="${by+29}" fill="#E7EFFA" font-size="22" font-weight="700" text-anchor="middle">P${pad2(q)}</text>
      <text x="${bx+PTW/2}" y="${by+53}" fill="${col}" font-size="15" text-anchor="middle">${tgt}</text></g>`;
  }

  /* ---- 下游 NPU ×8 ---- */
  npuB.cards.forEach((k,i)=>{
    const mine = cpuOfNpu(i)===ci;
    const hot = selPort>=0&&selPort<=7 && cpuPortNpu(ci,selPort)===i;
    const w = selPort>=0&&selPort<=7 ? selPort%2 : -1;
    const pp = cpuPortsOf(i);
    s+=`<g class="clk" data-act="npu" data-id="${k.id}" data-pod="${P.id}" data-blade="${npuB.id}" opacity="${!mine?.2:(selPort>=0&&!hot?.3:1)}">
      <rect x="${NX(i)}" y="${NY}" width="${NW}" height="${NH}" rx="12" fill="#22364F"
        stroke="${S.mode==='health'?colH(k.status):devCol(k)}" stroke-width="2"/>
      <text x="${NX(i)+NW/2}" y="${NY+104}" fill="#E7EFFA" font-size="31" font-weight="700" text-anchor="middle">${k.name}</text>
      <text x="${NX(i)+NW/2}" y="${NY+146}" fill="#A8CCE8" font-size="18" text-anchor="middle">${mine?'本 CPU 的 P'+pad2(pp[0])+' / P'+pad2(pp[1]):'挂 CPU '+(2-ci)}</text>
      ${mine?portTick(nIn(i,0),NB,'',hot&&w===0)+portTick(nIn(i,1),NB,'',hot&&w===1):''}</g>`;
  });

  const info = selPort>=0
    ? `已选中 P${pad2(selPort)} → ${selPort<=7?npuB.cards[cpuPortNpu(ci,selPort)].name+' 的 P'+(selPort%2?16:13):'RoCE板 · Union 互联芯片'}`
    : `P00,P01→NPU ${ci*4+1}　P02,P03→NPU ${ci*4+2}　P04,P05→NPU ${ci*4+3}　P06,P07→NPU ${ci*4+4}　P08→RoCE板`;
  return s+L+ZC+CAP;  // 连线浮在外框之上，Udie 小标再浮在连线之上
}

