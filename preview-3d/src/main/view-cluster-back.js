/* ================== 视图：集群 · 背面（灵衢互联刀片 ↔ 灵衢互联设备） ================== */
function clusterBack(){
  /* 柜体几何与正面完全一致（CY/CH），翻转时柜体不动。
     柜内：电源框(顶) → 灵衢互联刀片 ×4（约柜高 2/3，顶部出线）→ 理线区 → 柜名条(底) */
  const BY=CY, BH=CH;
  const L1TOP=BY+PADI+NAMEH+6+PWRH+22;
  const L1H=Math.round(BH*0.66);
  const L1BOT=L1TOP+L1H;
  const PADX=10, BGAP=9;
  const barW=(CW-PADX*2-BGAP*3)/4;
  const barX=(x,k)=>x+PADX+k*(barW+BGAP);
  const TRUNK=28;
  const boxX=x=>x+10, boxW=CW-10-TRUNK-4;
  const laneX=(x,j)=>x+CW-TRUNK+5+j*6;
  const yTop=BY-DEP-16;

  const focusSw=S.sel&&S.sel.t==='swblade'?S.sel.id:null;
  const focusPod=S.sel&&S.sel.t==='pod'?S.sel.id:null;
  const focusDev=S.sel&&S.sel.t==='netdev'?S.sel.id:null;
  const anyFocus=focusSw||focusPod||focusDev;

  let backL='',cabL='',barL='',linkL='',boxL='';

  D.pods.forEach((p,i)=>{backL+=shell(slotX(podSlot(i)),BY,CW,BH,{border:'#1B2942',dim:1}).back});
  D.nets.forEach((n,i)=>{backL+=shell(slotX(netSlot(i)),BY,CW,BH,{border:'#1B2942',dim:1}).back});

  /* ---- 计算柜背面 ---- */
  D.pods.forEach((p,i)=>{
    const x=slotX(podSlot(i));
    /* 柜级不再红描边：红点已经画在 L1 竖条的那个光模块口上，柜框再红一圈是重复故障（原则 7） */
    const bc='#22354E';
    cabL+=shell(x,BY,CW,BH,{border:bc,sel:S.sel&&S.sel.id===p.id,dim:1}).front;   // 柜体与正面同一明度
    cabL+=`<rect class="clk" data-act="pod" data-id="${p.id}" x="${x}" y="${BY}" width="${CW}" height="${BH}" fill="transparent"/>`;
    cabL+=nameBar(x,BY+PADI,p.id,'计算柜 '+pad2(p.idx+1),p.status,false);
    cabL+=pwrBox(x,BY+PADI+NAMEH+6,p.pwr,p.name,`data-pod="${p.id}"`);
    // 理线区（柜体下部横向理线架）
    for(let q=0;q<3;q++)
      cabL+=`<rect x="${x+PADI+4}" y="${L1BOT+26+q*30}" width="${CW-PADI*2-8}" height="6" rx="3" fill="#0D1928" stroke="#1A2B44" stroke-width=".6"/>`;
  });
  /* ---- 互联柜背面：与正面完全一致 ---- */
  D.nets.forEach((n,i)=>{ cabL+=netCab(n,slotX(netSlot(i))) });

  /* ---- L1 竖条：每根 8 个 800G 光模块口（整柜 4 根合计 32） ---- */
  D.pods.forEach((p,i)=>{
    const x=slotX(podSlot(i));
    p.sw.forEach((sw,k)=>{
      const bx=barX(x,k), err=S.mode==='health'&&sw.status==='err';
      /* 竖条里那一格红只有 9px 宽，大屏上根本找不到 —— 给「内含故障光模块」的这根加一圈红描边。
         注意语义：外框红 = 里面有东西（与负载层的粉框、能耗层的橙框同一套语言），
         首尾色条与填充仍然中性 —— 刀片本身没坏（原则 3）。 */
      const hasBad=S.mode==='health'&&swHasBadOm(sw);
      const c=err?colH('err'):(S.mode==='health'?linkBase():devCol(sw));
      const sel=S.sel&&S.sel.id===sw.id;
      const pTop=L1TOP+14, pH=L1H-14-42, cell=pH/16, pw=barW/2-3.5;
      barL+=`<g class="clk" data-act="swblade" data-id="${sw.id}" data-pod="${p.id}">
        <rect x="${bx-4}" y="${L1TOP-7}" width="${barW+8}" height="${L1H+14}" rx="5" fill="#050D18"/>
        ${hasBad?`<rect x="${bx-7}" y="${L1TOP-10}" width="${barW+14}" height="${L1H+20}" rx="7" fill="none"
          stroke="${colH('err')}" stroke-width="1.6" opacity=".45"/>`:''}
        <rect x="${bx}" y="${L1TOP}" width="${barW}" height="${L1H}" rx="4"
          fill="${S.mode==='health'?'#0D1928':devCol(sw)}" fill-opacity="${S.mode==='health'?1:.22}"
          stroke="${sel?'#00E6A2':(hasBad?colH('err'):c)}" stroke-width="${sel?3:(hasBad?2.6:1.5)}" />
        <rect x="${bx}" y="${L1TOP}" width="${barW}" height="8" rx="4" fill="${c}"/>
        ${Array.from({length:32},(_,q)=>{const bad=omBad(sw,q);
          /* 光模块口只有「流量」这一种度量：能耗图层下没有独立计量 → 中性 */
          /* ⚠ 刀片自己 err 不再把 32 个口整体染暗红 —— 那是容器 → 叶子的故障传播，
             违反原则 3。刀片级故障只体现在竖条的描边与首尾色条上，坏的口自己红。 */
          /* 健康绿必须与别处同源：原来写死 '#17494B'（经 neon 映射后是 #1B8F51，比 colH('ok')
             的 #25C46B 暗一档），再叠 .82 不透明度，整片 L1 就比正面灰一层 */
          const oc = bad?colH('err')
            : S.mode==='health' ? colH('ok')
            : S.mode==='pwr' ? NA
            : heat((sw.omBw||[])[q]||50);
          return `<rect x="${bx+2.5+(q%2)*(pw+2)}" y="${pTop+Math.floor(q/2)*cell}" width="${pw}" height="${cell-2.6}" rx="1.4"
            fill="${oc}" fill-opacity="1"/>`}).join('')}
        <rect x="${bx+3}" y="${L1BOT-38}" width="${barW-6}" height="8" rx="4" fill="#0D1B2A"/>
        <rect x="${bx+3}" y="${L1BOT-38}" width="${(barW-6)*(err?0:(S.mode==='pwr'?pwrPct(sw):sw.bw)/100)}" height="8" rx="4" fill="${c}"/>
        <!-- 竖条只有 ~26px 宽，写不下「灵衢L1-1」（试过，六个字糊成一片还溢到隔壁）。
             L1 的全称交给下方的分区说明，这里只留槽位号。 -->
        <!-- ⭐ v3.30.3（评审意见 2）：编号退回**柜内槽位号**，每个柜都是 61–64。
             v3.30 那套「全场连续 01–64」是按 L2 的口径推的，但 L1 插在柜里，
             现场报的是「几号柜的 62」，不是「第 62 块板」。定位靠「柜名 + 槽位」两段。
             ⚠ 竖条只有 ~26px 宽，两位数字正好是宽度上限，别再往里加字。 -->
        <text x="${bx+barW/2}" y="${L1BOT-12}" fill="#8CA2BE" font-size="15" text-anchor="middle" font-weight="600">${61+k}</text></g>`;
    });
  });

  /* ---- 链路：L1 顶部直接出线 → 拱 → 互联柜走线槽 → 拐入 L2 ---- */
  const arcs=[];
  D.pods.forEach((p,i)=>{
    const px=slotX(podSlot(i));
    p.sw.forEach((sw,k)=>{
      const sx=barX(px,k)+barW/2;
      const nx=slotX(netSlot(k)), nc=D.nets[k];
      const foc = !anyFocus ? null : (focusSw===sw.id||focusPod===p.id);
      // 互联柜内 4 台设备的纵向位置（与 netCab 布局一致）
      const y0=CY+PADI+NAMEH+6+PWRH+8, bot=CY+CH-PADI-8, bh=(bot-y0-36)/4;   // ⚠ 必须与 netCab 里同名三行逐字一致，否则连线落不到设备中心
      nc.dev.forEach((dv,j)=>{
        const lx=laneX(nx,j), cy=y0+j*(bh+12)+bh/2, br=boxX(nx)+boxW;
        const h=110+Math.abs(lx-sx)*0.17;
        const err=S.mode==='health'&&sw.status==='err';
        let f=foc; if(focusDev) f=(focusDev===dv.id);
        const hot = err && f!==false;
        let col=hot?colH('err'):linkLayer(sw.bw);   // 染的是链路自己的带宽，不是刀片功耗
        let op =hot?.95:(S.mode==='health'?.27:.4);
        let wd =hot?3.6:1.35;
        if(f===true){op=.95;wd=hot?4:2.4;col=hot?colH('err'):linkHot()}
        if(f===false){op=.045;wd=1}
        arcs.push({d:`M${sx},${L1TOP} L${sx},${yTop} C${sx},${yTop-h} ${lx},${yTop-h} ${lx},${yTop} L${lx},${cy} L${br},${cy}`,col,op,wd,err:hot});
      });
    });
  });
  arcs.sort((a,b)=>(a.err?1:0)-(b.err?1:0));
  arcs.forEach(a=>linkL+=`<path d="${a.d}" fill="none" stroke="${a.col}" stroke-width="${a.wd}" opacity="${a.op}"
    class="flow" stroke-linecap="round" stroke-linejoin="round"/>`);

  const capY=BY+BH+46;
  boxL+=`<text x="${slotX(0)+(CW*8+CGAP*7)/2}" y="${capY}" fill="#3E546F" font-size="19" text-anchor="middle" letter-spacing="3">每柜 4 × 灵衢互联刀片（灵衢 L1 · 柜内 61–64）</text>`;
  boxL+=`<text x="${slotX(12)+(CW*8+CGAP*7)/2}" y="${capY}" fill="#3E546F" font-size="19" text-anchor="middle" letter-spacing="3">每柜 4 × 灵衢互联刀片（灵衢 L1 · 柜内 61–64）</text>`;
  boxL+=`<text x="${slotX(8)+(CW*4+CGAP*3)/2}" y="${capY}" fill="#5C6F8E" font-size="19" text-anchor="middle" letter-spacing="3">16 × 灵衢互联设备（各 2 颗互联芯片）</text>`;

  /* ⭐ v3.25 推翻了「气泡不放首页」的旧口径 —— 见 introPills 的长注释。
     ⭐ v3.26 锚点从「竖条顶端」下移到**那一格坏光模块本身**。
     老口径的理由是「坏的那一格只有 9px 宽，药丸只指哪一根竖条」——
     但药丸贴行之后这条理由不成立了：药丸就在旁边，指得越准越好，
     而且 alarmBubble 的红点 + 呼吸红晕（r=17）正好补上「9px 太小看不见」这个洞。
     副作用是三颗药丸的 y 被三个 OSFP 位置自然拉开，不用再让行。
     ⚠ pTop / cell / pw 三个量必须和上面画竖条那段完全一致，改一处要改两处。 */
  const ANC=[];
  if(S.mode==='health'){
    const pTop=L1TOP+14, cell=(L1H-14-42)/16, pw=barW/2-3.5;
    D.pods.forEach((p,i)=>{ const x=slotX(podSlot(i));
      p.sw.forEach((sw,k)=>{ if(!swHasBadOm(sw))return;
        const bb=bubAt('swblade',sw.id); if(!bb)return;
        const q=(OMBAD[sw.id]||[])[0]||0;                       // 一根竖条当前最多一个坏口
        ANC.push({b:bb, ax:barX(x,k)+2.5+(q%2)*(pw+2)+pw/2,
                        ay:pTop+Math.floor(q/2)*cell+(cell-2.6)/2});
      });
    });
  }
  let s=backL+cabL+barL+linkL+boxL;
  s+=legend(true);
  if(introShow())s+=introPills(ANC);
  return s;
}
