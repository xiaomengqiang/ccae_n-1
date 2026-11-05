
/* ================== 缩放 ================== */
let SCALE=1;
function fit(){SCALE=innerWidth/3840;
  document.getElementById('fit').style.transform=`scale(${SCALE})`}
addEventListener('resize',fit);fit();
const $=id=>document.getElementById(id);
const pad2=n=>String(n).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ================== RNG ================== */
function rngF(seed){let a=seed;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rngF(20260815);
const rr=(a,b)=>a+R()*(b-a);

