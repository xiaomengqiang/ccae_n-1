/* ================== 舞台几何 ================== */
const VW=3280, VH=1832;
const CW=150, CGAP=2, GG=44, DEP=24;
/* 三组总宽 = 8柜 + 通道 + 4柜 + 通道 + 8柜；X0 由此算出，让整排在 3280 宽的 viewBox 里居中。
   通道从 100 收到 44：互联柜贴近计算柜，省下的宽度全让给左右留白（23 → 67）。 */
const TOTW=(CW*8+CGAP*7)*2+(CW*4+CGAP*3)+GG*2;
const X0=Math.round((3280-TOTW-DEP)/2);
const CY=400, CH=1010;
const PADI=8, PWRH=70, NAMEH=40;
let NPUY0=0;                       // 柜内**最上面**那块 NPU 刀片（= 板 8 · 槽 26）的 y
/* ⭐ 刀片序号 → 屏上 y。v3.23.0 起顺序反了（板 8 在上），
   所以不能再写 NPUY0 + idx*60 —— 谁再直接用 idx 算 y，红点就会落到隔壁刀片上。
   （NPU_GAP22 现在是 0，留着这个参数是为了以后真要把空槽画回来时只改一处。） */
/* v3.23.1：首页不再画槽位 22 的假板卡（它不是器件，画出来只是一条读不出信息的空条），
   所以 GAP 归 0、刀片高度恢复 58/步距 60 —— 柜内总高一格没变。
   ⚠ 槽位号仍然按真实映射给（跳过 22），只是不在首页占位。 */
const NPU_H=58, NPU_STEP=60, NPU_GAP22=0;
const npuRow  = bi => 7-bi;                                   // 板序号(0起) → 屏上第几条(0起)
const npuRowY = bi => {const r=npuRow(bi); return NPUY0 + r*NPU_STEP + (r>=4?NPU_GAP22:0)};
const CARDP=(CW-20)/8;   // 正面 NPU间距
function slotX(s){
  if(s<8)return X0+s*(CW+CGAP);
  if(s<12)return X0+8*(CW+CGAP)-CGAP+GG+(s-8)*(CW+CGAP);
  return X0+8*(CW+CGAP)-CGAP+GG+4*(CW+CGAP)-CGAP+GG+(s-12)*(CW+CGAP);
}
const podSlot=i=>i<8?i:i+4;
const netSlot=i=>8+i;

/* 3D 机柜外壳：返回 {back, front} 两段 svg */
function shell(x,y,w,h,opt){
  const d=DEP, sel=opt.sel, bc=opt.border, dim=opt.dim;
  const back=`<g opacity="${dim}">
    <rect x="${x+d}" y="${y-d}" width="${w}" height="${h}" rx="8" fill="#050D18" stroke="#152341" stroke-width="1.2"/>
  </g>`;
  const front=`<g opacity="${dim}">
    <polygon points="${x},${y} ${x+d},${y-d} ${x+w+d},${y-d} ${x+w},${y}" fill="${opt.topFill||'#1B2E4A'}" stroke="${bc}" stroke-width=".9"/>
    <polygon points="${x+w},${y} ${x+w+d},${y-d} ${x+w+d},${y+h-d} ${x+w},${y+h}" fill="${opt.sideFill||'#0A1524'}" stroke="${bc}" stroke-width=".9"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${opt.fill||'#0A1322'}" stroke="${sel?'#2FD4C4':bc}" stroke-width="${sel?3.2:1.5}"/>
  </g>`;
  return {back,front};
}


