/* ================== 视图：芯片 / Udie（第四层） ================== */
function chipView(){
  const v=S.view;
  if(v.t==='uchip')return vUchip(v);
  if(v.t==='ichip')return vIchip(v);
  if(v.t==='udie') return vUdie(v);
  return '';
}
function portCard(x,y,w,h,o){
  const bad=o.bad;
  return `<g class="clk" data-act="port" data-id="${o.id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${bad?'#2A1017':'#0A1D28'}"
      stroke="${bad?'#FF5B6E':'#1E5A5C'}" stroke-width="${bad?2.2:1.2}" />
    <rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="${bad?'#FF5B6E':heat(o.bw)}"/>
    <text x="${x+16}" y="${y+40}" fill="${bad?'#FF8F9C':'#CFE0F5'}" font-size="23" font-weight="700">${o.name}</text>
    <text x="${x+w-16}" y="${y+40}" fill="#4E6884" font-size="19" text-anchor="end">${o.rate}</text>
    <rect x="${x+16}" y="${y+56}" width="${w-32}" height="9" rx="4.5" fill="#12232F"/>
    <rect x="${x+16}" y="${y+56}" width="${(w-32)*(bad?0:o.bw)/100}" height="9" rx="4.5" fill="${bad?'#FF5B6E':heat(o.bw)}"/>
    <text x="${x+16}" y="${y+96}" fill="#7794AE" font-size="18">带宽 ${bad?0:o.bw}%</text>
    <text x="${x+w-16}" y="${y+96}" fill="#7794AE" font-size="18" text-anchor="end">Rx ${bad?'—':o.rx+' dBm'}</text>
    <text x="${x+16}" y="${y+124}" fill="#4E6884" font-size="17">BER ${o.ber}e-7</text>
    <text x="${x+w-16}" y="${y+124}" fill="${bad?'#FF8F9C':'#3F7B70'}" font-size="17" text-anchor="end">${bad?'LOS 无光':'Up'}</text></g>`;
}
function vIchip(v){
  const N=findNet(v.cab), d=N.dev.find(x=>x.id===v.dev), c=d.chipList.find(x=>x.id===v.id);
  const warn=d.status==='warn';
  let s=head(`${N.name} · ${d.name} · ${c.name}`,'灵衢 L2 互联芯片 内视图：128 端口 @ 400G · 128 光模块');
  s+=`<rect x="60" y="170" width="560" height="340" rx="16" fill="#0A2130" stroke="${warn?'#FFB44F':'#2FD4C4'}" stroke-width="2"/>
    <text x="92" y="228" fill="#DFF5F1" font-size="30" font-weight="700">${c.name}</text>
    <text x="92" y="268" fill="${warn?'#FFB44F':'#5C6F8E'}" font-size="20">${warn?'⚠ 端口 54 Pre-FEC BER 1.8e-6':'状态正常'}</text>`;
  [['带宽占用',c.bw+'%',c.bw],['结温',c.temp+'°C',c.temp],['端口 Up','128 / 128',100],['缓存占用',Math.round(rr(12,38))+'%',30]].forEach(([k,val,pct],i)=>{
    const x=92+(i%2)*260, y=306+Math.floor(i/2)*96;
    s+=`<text x="${x}" y="${y}" fill="#5C6F8E" font-size="18">${k}</text>
      <text x="${x}" y="${y+36}" fill="#E7EFFA" font-size="27" font-weight="700">${val}</text>
      <rect x="${x}" y="${y+48}" width="210" height="7" rx="3.5" fill="#12232F"/>
      <rect x="${x}" y="${y+48}" width="${210*pct/100}" height="7" rx="3.5" fill="${heat(pct)}"/>`});
  s+=`<text x="680" y="200" fill="#5C6F8E" font-size="21" letter-spacing="3">端口 × 128 @ 400G</text>`;
  Array.from({length:128}).forEach((_,q)=>{
    const x=680+(q%16)*156, y=228+Math.floor(q/16)*92;
    const bad=warn&&q===53, bw=Math.round(rr(30,92));
    s+=`<g class="clk" data-act="port" data-id="${c.id}-P${q+1}">
      <rect x="${x}" y="${y}" width="142" height="76" rx="7" fill="${bad?'#3A2408':'#0C2530'}" stroke="${bad?'#FFB44F':'#17494A'}" stroke-width="${bad?2:1}"/>
      <text x="${x+12}" y="${y+30}" fill="${bad?'#FFB44F':'#8FC6C0'}" font-size="18">P${pad2(q+1)}</text>
      <rect x="${x+12}" y="${y+42}" width="118" height="7" rx="3.5" fill="#123039"/>
      <rect x="${x+12}" y="${y+42}" width="${118*bw/100}" height="7" rx="3.5" fill="${bad?'#FFB44F':heat(bw)}"/>
      <text x="${x+12}" y="${y+68}" fill="#4E6884" font-size="15">${bw}%</text></g>`;
  });
  return s;
}
function vUdie(v){
  const P=findPod(v.pod), b=P.npu.find(x=>x.id===v.blade);
  const k=b&&b.cards.find(x=>x.id===v.card);
  const die=k&&k.dies.find(x=>x.id===v.id);
  if(!die)return head('Udie','未找到对象');
  const warn=die.status==='warn', dc=warn?'#FFB44F':'#2C6E8F';
  let s=head(`${P.name} · ${b.name} · ${k.name} · ${die.name}`,'Udie 内视图：Cube / Vector 核心阵列 · 9 个端口（P00–P08）· 寄存器');
  // 核心阵列
  s+=`<rect x="60" y="170" width="1560" height="700" rx="16" fill="#081420" stroke="${dc}" stroke-width="2"/>
    <rect x="60" y="170" width="1560" height="8" rx="4" fill="${dc}"/>
    <text x="94" y="228" fill="#E7EFFA" font-size="28" font-weight="700">Cube / Vector 核心阵列 · 72</text>
    <text x="94" y="266" fill="${dc}" font-size="21">${die.util}% · ${die.temp}°C · ${die.freq} MHz · ${die.volt} mV${warn?'  ⚠ 已频率回退 -12%':''}</text>`;
  for(let q=0;q<72;q++){
    const cx=94+(q%12)*126, cy=300+Math.floor(q/12)*88;
    const u=Math.max(0,Math.min(100,die.util+((q*37)%23)-11));
    s+=`<g class="clk" data-act="core" data-id="${die.id}-C${q+1}">
      <rect x="${cx}" y="${cy}" width="112" height="74" rx="7" fill="${heat(u)}" opacity=".92"/>
      <text x="${cx+56}" y="${cy+44}" fill="#07131C" font-size="19" font-weight="700" text-anchor="middle">${u}</text></g>`;
  }
  // 9 端口
  s+=`<text x="1680" y="200" fill="#5C6F8E" font-size="21" letter-spacing="3">端口 × 9 · P00–P08</text>`;
  die.ports.forEach((pt,q)=>{
    const x=1680+(q%3)*430, y=226+Math.floor(q/3)*164;
    s+=portCard(x,y,410,144,{id:pt.id,name:pt.name,rate:pt.rate,bw:pt.bw,rx:pt.rx,ber:pt.ber,bad:warn&&q===3});
  });
  // 寄存器
  const REGS2=[['0x0000','CHIP_ID','0x950A_0001'],['0x0018','DIE_STATUS',warn?'0x0000_0009':'0x0000_0001'],
    ['0x0024','TEMP_SENSOR',`0x${die.temp.toString(16).toUpperCase().padStart(4,'0')} (${die.temp}°C)`],
    ['0x0030','VOLT_CORE',`0x${die.volt.toString(16).toUpperCase()} (${die.volt}mV)`],
    ['0x0048','ECC_CE_CNT','0x0000_000'+(k.mem.ecc_ce%10)],['0x004C','ECC_UE_CNT','0x0000_0000'],
    ['0x0060','LINK_STATUS',warn?'0x0000_01F7':'0x0000_01FF'],
    ['0x0074','FREQ_CUR',`0x${die.freq.toString(16).toUpperCase()} (${die.freq}MHz)`],
    ['0x0080','PWR_STATE',warn?'0x02 (P1)':'0x03 (P0)'],['0x0094','ERR_LOG_PTR','0x8000_1240'],
    ['0x00A8','THROTTLE_CNT',warn?'0x0000_0013':'0x0000_0000'],['0x00B0','HCCS_RETRY','0x0000_0002']];
  s+=`<rect x="60" y="910" width="1560" height="800" rx="16" fill="#060D18" stroke="#26405F" stroke-width="1.6"/>
    <text x="94" y="966" fill="#E7EFFA" font-size="28" font-weight="700">寄存器</text>
    <text x="260" y="966" fill="#5C6F8E" font-size="19">${die.name} · 实时读取</text>
    <line x1="94" y1="990" x2="1586" y2="990" stroke="#1B2942"/>`;
  REGS2.forEach(([a,n2,val],i)=>{
    const y=1036+i*56, bad=(a==='0x0024'&&die.temp>85)||(a==='0x00A8'&&warn)||(a==='0x0018'&&warn);
    s+=`<text x="94" y="${y}" fill="#4E6884" font-size="19" font-family="monospace">${a}</text>
      <text x="250" y="${y}" fill="#93A7C4" font-size="19">${n2}</text>
      <text x="1586" y="${y}" fill="${bad?'#FFB44F':'#CFE0F5'}" font-size="19" text-anchor="end" font-family="monospace">${val}</text>
      <line x1="94" y1="${y+16}" x2="1586" y2="${y+16}" stroke="#111C2E"/>`;
  });
  // HBM
  s+=`<rect x="1680" y="910" width="1540" height="380" rx="16" fill="#0A1523" stroke="#26405F" stroke-width="1.6"/>
    <text x="1714" y="966" fill="#E7EFFA" font-size="27" font-weight="700">HBM（本 DIE 侧）</text>
    <text x="1714" y="1004" fill="#5C6F8E" font-size="19">HBM ${k.mem.stacks/2} stack · ${k.mem.cap/2} GB · 带宽占用 ${k.mem.bwUse}%</text>`;
  Array.from({length:4}).forEach((_,i)=>{
    const x=1730+i*370, y=1040;
    s+=`${[0,1,2,3].map(l=>`<rect x="${x+l*5}" y="${y+l*8}" width="300" height="190" rx="8" fill="#0E2233" stroke="#2C6E8F" opacity="${.35+l*.2}"/>`).join('')}
      <text x="${x+160}" y="${y+126}" fill="#9FCBFF" font-size="22" text-anchor="middle" font-weight="600">Stack ${i+1}</text>
      <rect x="${x+70}" y="${y+152}" width="190" height="10" rx="5" fill="#152B3E"/>
      <rect x="${x+70}" y="${y+152}" width="${190*(k.mem.bwUse+((i*13)%15)-7)/100}" height="10" rx="5" fill="${heat(k.mem.bwUse)}"/>`;
  });
  if(warn)s+=`<rect x="1680" y="1340" width="1540" height="150" rx="14" fill="rgba(255,180,79,.1)" stroke="#FFB44F" stroke-width="2"/>
    <text x="1714" y="1394" fill="#FFB44F" font-size="26" font-weight="700">⚠ 结温 ${die.temp}°C 超阈值（85°C）</text>
    <text x="1714" y="1436" fill="#93A7C4" font-size="20">DVFS 已降频至 P1，THROTTLE_CNT = 19，端口 P4 同步降速</text>
    <text x="1714" y="1472" fill="#5C6F8E" font-size="19">建议：检查该刀片液冷流量与冷板贴合</text>`;
  return s;
}

