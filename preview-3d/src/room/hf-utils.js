function hfReference() {
  const v=S.view;
  if(v.lv==='cluster') return S.face==='front'?'01-home-front':'02-home-back';
  if(v.lv==='logic') return '06-topo38';
  if(v.lv==='blade'&&v.t==='npublade'&&S.mode==='pwr')return '05-topo37';
  if((v.lv==='blade'&&v.t==='npublade')||(v.lv==='card'&&v.t==='npu')) return '03-topo35';
  if(v.lv==='blade'&&v.t==='cpublade') return v.zoomCpu===0||v.zoomCpu===1?'09-topo43':'04-topo36';
  return '';
}
function hfSync() {
  if(S.nav==='biz')hfTreeOpen=true;
  $('hf-collapse').hidden=S.nav==='biz';
  $('hf-collapse').disabled=S.nav==='biz';
  const ref=hfReference(), root=S.view.lv==='cluster'&&!S.zoom&&S.nav==='res';
  $('screen').dataset.hfReference=ref;
  $('screen').dataset.hfScope=ref?'mapped':'legacy';
  $('screen').dataset.hfView=S.view.lv;
  $('screen').dataset.hfNav=S.nav;
  $('screen').classList.toggle('hf-tree-closed',!hfTreeOpen);
  $('screen').classList.toggle('hf-home',root&&!hfTreeOpen);
  $('left').setAttribute('aria-hidden',String(!hfTreeOpen));
  $('hf-collapse').setAttribute('aria-expanded',String(hfTreeOpen));
  $('hf-expand').hidden=hfTreeOpen||(root&&!hfTreeOpen);
}
function hfSetTree(open){hfTreeOpen=S.nav==='biz'?true:open;render()}

function hfDecorateKPI() {
  if(!$('hf-pod-heading'))return;
  const home=$('screen').classList.contains('hf-home');
  if(!home&&hfReference())for(const label of $('kpis').querySelectorAll('.k')){
    const text=label.textContent;
    const icon=/故障|故障/.test(text)?'alert':/NPU/.test(text)?'npu':/CPU/.test(text)?'cpu':/风扇/.test(text)?'fan':/端口/.test(text)?'port':/互联|Union/.test(text)?'bus':null;
    if(icon){const img=document.createElement('img');img.alt='';img.className='hf-metric-icon';img.src=HF_EMBEDDED_ASSETS['metric-icon-'+icon+'.png'];label.prepend(img)}
  }
  if(home){
    const first=document.createElement('button');first.type='button';first.className='hf-pod-card';
    first.setAttribute('aria-label','超节点 (1024卡) Atlas 950 · '+(D.pods.length+D.nets.length)+' 柜');first.setAttribute('aria-controls','left');first.setAttribute('aria-expanded','false');
    first.innerHTML='<strong>超节点 (1024卡)</strong><span class="hf-card-search">搜索资源…</span>';
    first.onclick=e=>{e.stopPropagation();hfSetTree(true)};
    $('kpis').prepend(first);
    if(S.mode==='health') [...$('kpis').querySelectorAll('.kpi')].forEach((el,i)=>{
      if(i>5)return;const img=document.createElement('img');img.className='hf-gauge';img.alt='';
      img.src=HF_EMBEDDED_ASSETS['metric-'+i+'.png'];el.append(img);
    });
  }
}

render=function(){hfSync();hfBaseRender()};
go=function(v){
  hfTreeOpen=true;
  if(v.lv==='blade'&&v.t==='cpublade'&&v.zoomCpu==null)S.sel=null;
  hfBaseGo(v);
};
syncNav=function(){if(S.nav==='biz')hfTreeOpen=true;hfBaseSyncNav()};
stageSVG=function(inner){
  if($('screen').classList.contains('hf-home')&&!S.zoom)return '<svg viewBox="67 -72 3146 1832" preserveAspectRatio="none">'+reskin(inner)+'</svg>';
  if(hfReference() && ['blade','card'].includes(S.view.lv))return '<svg viewBox="46 64 3188 1700" preserveAspectRatio="none">'+reskin(inner)+'</svg>';
  return hfBaseStageSVG(inner);
};

/* A restrained grey surface palette from the references; source health/heat semantics remain. */
reskin=function(str){
  let result=hfBaseReskin(str);
  if(!hfReference() || S.view.lv==='cluster')return result;
  const surface={'#151516':'#414141','#101011':'#414141','#191A1A':'#303030','#2A2B2C':'#363636','#343536':'#454545',
    '#727376':'#626262','#9A9DA1':'#949494','#17A882':'#4A806A','#00E6A2':'#47B180'};
  if(S.view.lv==='logic')Object.assign(surface,{'#151516':'#414141','#101011':'#414141','#161617':'#375e4c','#4F5153':'#259669','#25C46B':'#2CA269','#17915C':'#2CA269'});
  return result.replace(/#[0-9a-f]{6}/gi,h=>surface[h.toUpperCase()]||h);
};
const hfAssetURLCache = new Map();
function hfAssetURL(file){
 if(hfAssetURLCache.has(file))return hfAssetURLCache.get(file);
 const data=HF_EMBEDDED_ASSETS[file];
 if(!data?.startsWith('data:'))return data;
 const comma=data.indexOf(','),header=data.slice(5,comma),raw=data.slice(comma+1);
 const bytes=header.includes(';base64')?Uint8Array.from(atob(raw),c=>c.charCodeAt(0)):new TextEncoder().encode(decodeURIComponent(raw));
 const url=URL.createObjectURL(new Blob([bytes],{type:header.split(';')[0]}));
 hfAssetURLCache.set(file,url);return url;
}
