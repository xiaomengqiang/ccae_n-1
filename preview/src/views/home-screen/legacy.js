import { HC_ASSETS } from "../../mock/hc-assets.js";

// home-screen legacy —— 剩余部分（Header/Sidebar/Composer/fit 已迁移到 React HomeScreen）
// 此文件只保留 energyServiceCard + updateCompactStatusIcons + energyGradeTag（被其他模块调用）

export function initHomeScreen() {
const C=HCComponents;

function energyServiceCard({status,data}){
 const card=document.createElement('article');card.className='hc-workload hc-energy-card';card.setAttribute('aria-label',data.name+' 节能服务卡片');card.setAttribute('role','button');card.tabIndex=0;card.onclick=()=>window.openEnergyService?.(data);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openEnergyService?.(data);}};card.style.left='0';card.style.top='20px';
 const header=document.createElement('header');const name=document.createElement('strong');name.textContent=data.name;const normal=C.Status({status});const energy=document.createElement('span');energy.className='hc-status normal';energy.textContent='节能中';const leaf=document.createElement('img');leaf.src=HC_ASSETS.icons['绿色叶子'];leaf.alt='';leaf.className='energy-label-leaf';energy.prepend(leaf);const date=document.createElement('time');date.textContent=data.start;const logo=C.WorkloadIcon(data.name);header.append(logo,name,normal,energy,date);card.append(header);
 const fields=document.createElement('dl');for(const [name,value] of [['百万Token能耗',(Number(data.energyUnit||1.82)/3.6).toFixed(2)+' kWh/Mtoken'],['总能耗',data.energyTotal],['节省能耗',data.energySaved],['节能增益',data.energyGain],['卡数',data.npu+' 卡'],['TTFT',data.ttft],['TPOT',data.tpot]]){const field=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;if(name==='百万Token能耗'){field.className='energy-primary';dt.append(energyGradeTag(data));dd.innerHTML=(Number(data.energyUnit||1.82)/3.6).toFixed(2)+' <small>kWh/Mtoken</small>';}field.append(dt,dd);fields.append(field);}card.append(fields);const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');chart.classList.add('energy-spark');chart.setAttribute('viewBox','0 0 70 30');chart.setAttribute('role','img');chart.setAttribute('aria-label','百万Token能耗趋势');chart.innerHTML='<path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20V29H1Z" fill="#3ac58d" opacity=".2"/><path d="M1 9L13 10L25 8L36 12L47 19L58 21L69 20" fill="none" stroke="#3ac58d" stroke-width="2"/>';card.append(chart);return card;
}

window.updateCompactStatusIcons=()=>{
 document.querySelectorAll('.hc-metric-group').forEach(group=>{
  const compact=group.querySelector('.hc-metric-compact'),key=group.dataset.category;
  const values=[...group.querySelectorAll('.hc-metric-row .hc-metric-content>b')].map(b=>Number(b.firstChild.textContent));
  const count=key==='resource'?values[0]+values[1]:values.slice(1,4).reduce((a,b)=>a+b,0);
  const known=Number.isFinite(count),bad=known&&count>0;
  group.dataset.health=known?(bad?'abnormal':'normal'):'unknown';
  group.dataset.severity=!bad?'normal':key==='resource'?(values[0]>0?'interrupted':'stuck'):values[1]>0?'interrupted':values[2]>0?'stuck':'degraded';
  let orbit=compact.querySelector('.hc-health-orbit');
  if(!orbit){orbit=document.createElement('span');orbit.className='hc-health-orbit';orbit.innerHTML='<span class="hc-health-ring" aria-hidden="true"></span><span class="hc-health-copy"><span class="hc-health-label"></span><span class="hc-health-total"></span></span>';compact.append(orbit);}
  let glyphs=orbit.querySelector('.hc-summary-glyphs');if(!glyphs){glyphs=document.createElement('span');glyphs.className='hc-summary-glyphs';glyphs.setAttribute('aria-hidden','true');(key==='resource'?['故障数','隐患数','NPU利用率','更多']:['中断','卡死','劣化','正常运行']).forEach(name=>{if(name==='更多'){const more=document.createElement('span');more.className='hc-summary-more';more.textContent='…';more.title='更多指标';glyphs.append(more);}else{const img=document.createElement('img');img.src=HC_ASSETS.icons[name];img.alt='';glyphs.append(img);}});orbit.prepend(glyphs);}glyphs.querySelectorAll('img').forEach((img,i)=>{const active=key==='resource'?(i<2&&values[i]>0):(values[i+1]>0);img.classList.toggle('is-active',active);});orbit.querySelector('.hc-health-ring').textContent=known?(bad?count:'正常'):'—';
  orbit.querySelector('.hc-health-label').textContent=known?(bad?'项异常':''):'待检测';
  orbit.querySelector('.hc-health-total').textContent=key==='resource'?'NPU 1024 卡':'总数 '+(Number.isFinite(values[0])?values[0]:'—')+' 个';
  const label=group.querySelector('.hc-metric-title').textContent;
  compact.setAttribute('aria-label',label+'，'+(known?(bad?count+'异常':'正常'):'待检测')+'，展开指标');
  compact.querySelector('.hc-compact-statuses')?.remove();
 });
};
window.updateCompactStatusIcons();

function energyGradeTag(data){const size=Number((data.name||'').match(/-(\d+(?:\.\d+)?)B/i)?.[1]||0),limits=size>=70?[12,30]:size>=14?[3,8]:[1,2.5],value=Number(data.energyUnit??1.82),grade=data.energySaving?1:value<limits[0]?0:value<=limits[1]?1:2,tag=document.createElement('span');tag.className='hc-ept-grade';tag.textContent=['绿算','正常','未达标'][grade];tag.style.setProperty('--ept-grade-color',['#26b9b0','#3ac58d','#ef535b'][grade]);return tag;}
window.energyGradeTag = energyGradeTag;
}
