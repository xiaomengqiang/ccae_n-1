/* 光链路业务模块。initialState 为本模块 exportState() 的输出。 */
// 遗留工厂（命令式保留）—— 从 HCEventModule 提取的自包含模块：
// TrendChart：实时趋势图引擎（update 每秒驱动 / setRecoveryTime / 悬浮联动）
// CleaningIllustration：清污示意图（crossfade 过渡只展示一次）
// ExperienceSummary：经验沉淀卡（打字流式动画；state 为外部可变引用，onReplace 回调换卡）
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

export const HCOpticalParts = (() => {
  const el = (tag, className = '', text) => { const n = document.createElement(tag); n.className = className; if (text !== undefined) n.textContent = text; return n; };
  const icon = (name, size = 16) => { const n = el('img', 'evt-icon'); n.src = OPTICAL_ASSETS.icons[name]; n.alt = ''; n.width = n.height = size; return n; };
  const button = (label, className = '', onClick) => { const n = el('button', className, label); n.type = 'button'; if (onClick) n.addEventListener('click', onClick); return n; };
  const Badge = (text, tone = 'done') => el('span', `evt-badge evt-badge-${text === '已闭环' ? 'closed' : tone}`, text);
  const CLEANING_ART={"dirty": "./assets/uploads/dirty.png", "clean": "./assets/uploads/clean.png"};
let cleanArtTransitionShown=false;
function CleaningIllustration(cleaned) {
  const figure=el('figure','evt-cleaning-illustration');
  figure.dataset.state=cleaned?'clean':'dirty';
  const image=el('img');
  image.src=cleaned?CLEANING_ART.clean:CLEANING_ART.dirty;
  image.alt=cleaned?'清污完成：居中展示干净的光模块，无手套和清洁笔':'双手佩戴防静电手套，左手握持光模块外壳，右手使用MPO清洁笔对准光口清洁';
  image.width=1899;image.height=829;
  const frame=el('div','evt-cleaning-frame');frame.append(image);
  if(cleaned&&!cleanArtTransitionShown){
    cleanArtTransitionShown=true;
    const previous=el('img','evt-cleaning-previous');previous.src=CLEANING_ART.dirty;previous.alt='';previous.setAttribute('aria-hidden','true');
    frame.append(previous);
    const reveal=()=>{if(frame.classList.contains('evt-cleaning-crossfade'))return;frame.classList.add('evt-cleaning-crossfade');};
    image.addEventListener('load',reveal,{once:true});
    if(image.complete&&image.naturalWidth)reveal();
    previous.addEventListener('animationend',()=>previous.remove(),{once:true});
  }
  figure.append(frame,el('figcaption','',cleaned?'清污已完成':'光模块脏污，待人工清污'));
  return figure;
}

function ExperienceSummary(state,onReplace){
  const card=el('section','evt-experience');card.setAttribute('aria-label','智能体经验沉淀');
  card.append(el('p','evt-experience-intro','本次光链路故障已完成处置。我已整理处理过程，形成以下可复用经验'));
  const lessons=[
    ['识别光链路隐患','结合接收光功率与错误计数识别异常。通道4持续低功率且错误计数异常时，应关联检查光模块端面脏污，不能只依赖链路通断状态'],
    ['串联故障因果关系','将光模块脏污、接收功率劣化、链路闪断及伴随告警关联分析，结合计算侧排查结果缩小故障范围'],
    ['沉淀处置与核验流程','先优雅隔离异常链路，再由人工清污；清污后核验光功率恢复与错误计数归零，确认通过后解除隔离']
  ];
  const list=el('ol','evt-experience-lessons');lessons.forEach(([title,copy])=>{const item=el('li');item.append(el('strong','',title),el('p','',copy));list.append(item);});card.append(list);
  const reportText='故障对象：计算柜11·L1交换板02光链路。\n故障表现：链路闪断，通道4接收光功率异常，伴随错误计数异常。\n根因：光链路端面脏污。\n处置过程：异常链路优雅隔离 → 人工清污 → 恢复核验 → 解除隔离。\n核验结果：通道4光功率恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。\n\n'+lessons.map(([title,copy],i)=>(i+1)+'、'+title+'：'+copy).join('\n');
  const report=button('','evt-experience-report',()=>window.HCOpticalEvidence?.show('光链路清污复盘报告','经验沉淀','故障复盘',reportText,report));
  report.append(el('span','evt-experience-file','▤'),el('strong','','光链路清污复盘报告'),el('span','evt-experience-open','查看 ›'));card.append(report);
  const graph=el('div','evt-experience-graph');
  const graphTitle=el('div','evt-experience-graph-title');const graphDetails=button('查看详情','evt-knowledge-details',()=>window.HCOpticalEvidence?.show('经验图谱详情','经验沉淀','故障复盘','本次新增经验：光模块脏污。\n故障类型：业务劣化。\n识别特征：通道4接收光功率持续偏低，伴随错误计数异常。\n处置路径：优雅隔离异常链路 → 人工清污 → 监控核验 → 解除隔离。\n'+lessons.map(([title,copy])=>title+'：'+copy).join('\n'),graphDetails));graphTitle.append(el('strong','','经验图谱'),graphDetails);graph.append(graphTitle);
  const map=document.createElementNS('http://www.w3.org/2000/svg','svg');
  map.setAttribute('viewBox','0 0 420 250');map.setAttribute('role','img');map.setAttribute('aria-label','经验图谱：故障类型分为业务劣化和业务失败，光模块脏污为本次新增经验');map.classList.add('evt-knowledge-map');
  let dots='';
  for(let ring=0;ring<7;ring++){const count=24+ring*7,r=24+ring*7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+ring*.17;dots+='<circle cx="'+(32+Math.cos(a)*r).toFixed(2)+'" cy="'+(130+Math.sin(a)*r).toFixed(2)+'" r="'+(ring<3?1.8:1.3)+'" fill="'+(ring<3?'#a59ae9':'#79c3cd')+'" opacity="'+(.85-ring*.07)+'"/>';}}
  map.innerHTML='<g>'+dots+'</g><g fill="none" stroke="#747b82" stroke-width="1.2"><path d="M92 130H127 M173 130C203 130 204 74 236 74 M173 130C203 130 204 196 236 196 M268 74C291 74 290 38 314 38 M268 74C291 74 290 108 314 108 M268 196C291 196 291 168 314 168 M268 196C291 196 291 226 314 226"/></g><g fill="#dce0e4" font-size="13" font-family="sans-serif"><text x="122" y="134">故障类型</text><text x="219" y="70">业务劣化</text><text x="219" y="192">业务失败</text><text x="313" y="34">光模块脏污</text><text x="313" y="104">NPU掉卡</text><text x="313" y="164">实例异常</text><text x="313" y="222">通信中断</text></g><rect x="316" y="43" width="70" height="20" rx="10" fill="#355e78"/><text x="351" y="57" text-anchor="middle" font-size="11" fill="#b4e7ff">✦ 新经验</text>';
  graph.append(map);card.append(graph);
  const feedback=el('div','evt-experience-feedback'),message=el('p','','我的经验沉淀是否准确？');
  const actions=el('div','evt-experience-actions'),editor=el('div','evt-experience-editor');editor.hidden=true;
  const field=el('textarea');field.placeholder='请填写需要纠正的经验内容';field.setAttribute('aria-label','经验纠正内容');field.value=state.experienceCorrection;
  const update=()=>{
    const confirmed=state.experienceFeedback==='accurate';
    actions.hidden=confirmed;feedback.classList.toggle('is-accurate',confirmed);
    message.replaceChildren();message.setAttribute('role','status');
    if(confirmed){const icon=el('span','evt-experience-confirmed-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';message.append(icon,el('span','','用户反馈此次经验沉淀准确'));}
    else message.textContent=state.experienceFeedback==='corrected'?'已记录你的纠正意见，供后续复盘参考':'我的经验沉淀是否准确？';
  };
  const accurate=button('准确','',()=>{state.experienceFeedback='accurate';editor.hidden=true;update();});
  const correct=button('纠正','',()=>{editor.hidden=false;field.focus();});actions.append(accurate,correct);
  const save=button('保存纠正','',()=>{const value=field.value.trim();if(!value){field.focus();return;}state.experienceCorrection=value;state.experienceFeedback='corrected';editor.hidden=true;update();});
  editor.append(field,save);feedback.append(message,actions,editor);card.append(feedback);update();
  const footer=el('div','evt-experience-footer'),notice=el('span','evt-experience-notice');notice.setAttribute('role','status');
  const icons={refresh:'<path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',like:'<path d="M8 21H3V10h5m0 11h10l3-11h-7l1-6-3-2-4 8z"/>',dislike:'<path d="M8 3H3v11h5M8 3h10l3 11h-7l1 6-3 2-4-8z"/>'};
  const toolbar=el('div','evt-experience-tools');
  const action=(name,icon,fn)=>{const b=button('','',fn);b.title=name;b.setAttribute('aria-label',name);b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[icon]+'</svg>';toolbar.append(b);return b;};
  action('重新生成经验','refresh',()=>{const fresh=ExperienceSummary(state,onReplace);onReplace?.(fresh);card.replaceWith(fresh);fresh.querySelector('.evt-experience-notice').textContent='已根据本次处置记录重新整理';});
  action('复制经验','copy',async()=>{try{await navigator.clipboard.writeText(reportText);notice.textContent='已复制';}catch{const text=el('textarea');text.value=reportText;card.append(text);text.select();const ok=document.execCommand('copy');text.remove();notice.textContent=ok?'已复制':'复制失败，请重试';}});
  let up,down;up=action('有帮助','like',()=>{state.experienceRating='like';up.setAttribute('aria-pressed','true');down.setAttribute('aria-pressed','false');notice.textContent='感谢反馈';});
  down=action('没有帮助','dislike',()=>{state.experienceRating='dislike';down.setAttribute('aria-pressed','true');up.setAttribute('aria-pressed','false');editor.hidden=false;field.focus();});
  up.setAttribute('aria-pressed',String(state.experienceRating==='like'));down.setAttribute('aria-pressed',String(state.experienceRating==='dislike'));
  footer.append(notice,toolbar);card.append(footer);return card;
}
// 内容真实逐字增长，不预留完整卡片高度；不强制改变用户的滚动位置。

function streamExperience(card, delayStart = 0) {
  const timers = new Set();
  const safeLater = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (card.isConnected) fn(); }, Math.max(0, ms)); timers.add(id); };
  const intro=card.querySelector('.evt-experience-intro');
  const list=card.querySelector('.evt-experience-lessons');
  const items=Array.from(list.children);
  const tail=Array.from(card.children).filter(node=>node!==intro&&node!==list);
  const blocks=[intro,...items];
  const texts=blocks.map(block=>Array.from(block.querySelectorAll('strong,p')).length
    ?Array.from(block.querySelectorAll('strong,p')):[block]);
  const originals=new Map();texts.flat().forEach(node=>{originals.set(node,Array.from(node.textContent));node.textContent='';});
  blocks.forEach(node=>{node.hidden=true;});tail.forEach(node=>{node.hidden=true;});list.hidden=true;card.hidden=true;
  const active=()=>card.isConnected;
  const revealTail=index=>{
    if(!active())return;
    const node=tail[index];if(!node){card.removeAttribute('aria-busy');return;}
    node.hidden=false;
    if(node.animate){const height=node.offsetHeight;node.animate([{height:'0px',opacity:0,overflow:'hidden'},{height:height+'px',opacity:1,overflow:'hidden'}],{duration:360,easing:'ease-out'});}
    safeLater(()=>revealTail(index+1),400);
  };
  const writeBlock=index=>{
    if(!active())return;
    if(index>=blocks.length){revealTail(0);return;}
    blocks[index].hidden=false;if(index>0)list.hidden=false;
    let part=0,offset=0;
    const tick=()=>{
      if(!active())return;
      const node=texts[index][part],chars=originals.get(node);
      offset=Math.min(offset+2,chars.length);node.textContent=chars.slice(0,offset).join('');
      if(offset<chars.length){safeLater(tick,24);return;}
      if(++part<texts[index].length){offset=0;safeLater(tick,60);}else safeLater(()=>writeBlock(index+1),120);
    };tick();
  };
  card.setAttribute('aria-busy','true');
  safeLater(()=>{if(!active())return;card.hidden=false;writeBlock(0);},Math.max(0,experienceStartedAt+2000-Date.now()));
}

function TrendChart(cleanedAt=null, recovery=false, monitorStartedAt=Date.now()) {
  const card = el('div', 'evt-chart-card');
  card.append(el('h3', 'evt-chart-title', '光链路通道功率与错误计数趋势'));
  const channels = [
    {name: '通道1', color: '#79c530', values: [-.4,-.5,-.4,-.6,-.5,-.4,-.5,-.4,-.4,-.5,-.4,-.5]},
    {name: '通道2', color: '#7955ff', values: [-.7,-.6,-.8,-.7,-.6,-.7,-.6,-.5,-.6,-.5,-.7,-.6]},
    {name: '通道3', color: '#26bbca', values: [-.2,-.3,-.2,-.4,-.3,-.2,-.3,-.2,-.3,-.2,-.3,-.2]},
    {name: '通道4', color: '#ffa33e', values: [-12.9,-13.2,-12.8,-13.4,-12.7,-13.1,-12.5,-12.9]}
  ];
  const errors = [72,65,78,68,84,76,91,63];
  const x = i => 47 + i * 324 / 7;
  // 独立坐标轴保持采样位置一致，供跨图悬浮联动。
  const y = value => 42 - value / 15 * 130;
  const errorY = value => 330 - value / 120 * 100;
  const barPath = (i,v) => {const left=x(i)-5,base=330,top=errorY(v);return `M${left} ${base}V${top+4}Q${left} ${top} ${left+4} ${top}H${left+7}Q${left+11} ${top} ${left+11} ${top+4}V${base}Z`;};
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 420 370');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '上下共用时间轴：上图为四通道光功率，下图为错误次数');
  // SVG 仅插入本地固定数据，不接受用户输入。
  svg.innerHTML = '<text x="4" y="21" fill="#ddd" font-size="13">光功率（dBm）</text>' +
    [0,-5,-10,-15].map(v => `<line x1="38" y1="${y(v)}" x2="380" y2="${y(v)}" stroke="#494949"/><text x="29" y="${y(v)+4}" text-anchor="end" fill="#aaa" font-size="11">${v}</text>`).join('') +
    channels.map(c => `<polyline class="evt-chart-line" pathLength="1" fill="none" stroke="${c.color}" stroke-width="2" stroke-linejoin="round" points="${c.values.slice(0,8).map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"><title>${c.name}</title></polyline>`).join('') +
    `<line class="evt-power-threshold" x1="38" y1="${y(-3.2)}" x2="380" y2="${y(-3.2)}" stroke="#e7434a" stroke-width="1.2" stroke-dasharray="5 4"/><text class="evt-power-threshold-label" x="378" y="${y(-3.2)-5}" text-anchor="end" fill="#ef858a" font-size="11">低功率阈值 −3.2</text>` +
    channels.map((c,i)=>`<circle cx="${66+i*85}" cy="190" r="3" fill="${c.color}"/><text x="${74+i*85}" y="194" fill="#bbb" font-size="11">${c.name}</text>`).join('') +
    '<text x="4" y="217" fill="#ddd" font-size="13">错误次数（次）</text>' +
    [120,80,40,0].map(v => `<line x1="38" y1="${errorY(v)}" x2="380" y2="${errorY(v)}" stroke="#494949"/><text x="29" y="${errorY(v)+4}" text-anchor="end" fill="#aaa" font-size="11">${v}</text>`).join('') +
    errors.map((v,i) => `<path class="evt-chart-bar" style="--evt-bar-index:${i}" d="${barPath(i,v)}" fill="#087bd8"><title>采样${i+1}：错误计数 ${v} 次</title></path>`).join('') +
    Array.from({length:8},(_,i) => `<line x1="${x(i)}" y1="330" x2="${x(i)}" y2="335" stroke="#aaa"/><text class="evt-chart-time" x="${x(i)}" y="352" font-size="9" text-anchor="middle" fill="#aaa"></text>`).join('');
  // 按数值着色：门限以下的线段为红色，正常区间保留通道色。
  const gradientPrefix='power-'+Math.random().toString(36).slice(2);
  svg.insertAdjacentHTML('afterbegin',`<defs>${channels.map((channel,i)=>`<linearGradient id="${gradientPrefix}-${i}" gradientUnits="userSpaceOnUse" x1="0" y1="42" x2="0" y2="172"><stop offset="${3.2/15}" stop-color="${channel.color}"/><stop offset="${3.2/15}" stop-color="#f0525b"/></linearGradient>`).join('')}</defs>`);
  svg.querySelectorAll('.evt-chart-line').forEach((line,i)=>line.setAttribute('stroke',`url(#${gradientPrefix}-${i})`));
  const stack=el('div','evt-chart-stack');
  const powerSvg=svg;
  const errorSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  const markup=svg.innerHTML;
  const split=markup.indexOf('<text x="4" y="217"');
  powerSvg.innerHTML=markup.slice(0,split);
  // 图例下移，为光功率图自己的时间轴留出空间。
  powerSvg.querySelectorAll('circle').forEach(n=>n.setAttribute('cy','218'));
  powerSvg.querySelectorAll('text[y="194"]').forEach(n=>n.setAttribute('y','222'));
  powerSvg.insertAdjacentHTML('beforeend',Array.from({length:8},(_,i)=>`<text class="evt-chart-time" x="${x(i)}" y="195" font-size="9" text-anchor="middle" fill="#aaa"></text>`).join(''));
  powerSvg.setAttribute('viewBox','0 0 420 238');
  errorSvg.setAttribute('viewBox','0 200 420 170');
  errorSvg.setAttribute('role','img');
  errorSvg.setAttribute('aria-label','错误次数趋势，独立时间轴');
  errorSvg.innerHTML=markup.slice(split);
  const powerPanel=el('div','evt-chart-panel');
  const errorPanel=el('div','evt-chart-panel');
  powerPanel.append(powerSvg);errorPanel.append(errorSvg);stack.append(powerPanel,errorPanel);
  const guide=el('div','evt-chart-guide');guide.hidden=true;
  const powerTip=el('div','evt-chart-tooltip');const errorTip=el('div','evt-chart-tooltip');
  powerTip.hidden=true;errorTip.hidden=true;
  powerPanel.append(powerTip);errorPanel.append(errorTip);stack.append(guide);card.append(stack);
  let hoverIndex=null;
  const showSample=index=>{
    const time=powerSvg.querySelectorAll('.evt-chart-time')[index].textContent;
    const values=Array.from(powerSvg.querySelectorAll('.evt-chart-line'),line=>{
      const py=Number(line.getAttribute('points').split(' ')[index].split(',')[1]);
      return ((42-py)*15/130).toFixed(2);
    });
    powerTip.textContent=time+'\n'+channels.map((channel,i)=>channel.name+'：'+values[i]+' dBm').join('\n');
    errorTip.textContent=errorSvg.querySelectorAll('.evt-chart-bar title')[index].textContent;
    const bounds=stack.getBoundingClientRect(),plot=powerSvg.getBoundingClientRect();
    guide.style.left=((plot.left-bounds.left+plot.width*x(index)/420)/bounds.width*100)+'%';
    guide.hidden=powerTip.hidden=errorTip.hidden=false;
    powerTip.style.right=errorTip.style.right=index>3?'auto':'8px';
    powerTip.style.left=errorTip.style.left=index>3?'8px':'auto';
  };
  stack.addEventListener('pointermove',event=>{
    const bounds=powerSvg.getBoundingClientRect();
    hoverIndex=Math.max(0,Math.min(7,Math.round(((event.clientX-bounds.left)/bounds.width*420-47)*7/324)));
    showSample(hoverIndex);
  });
  stack.addEventListener('pointerleave',()=>{hoverIndex=null;guide.hidden=powerTip.hidden=errorTip.hidden=true;});
  const timeLabel=seconds=>[Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
  card.setRecoveryTime=value=>{cleanedAt=value;};
  card.update=elapsed=>{
    if(cleanedAt!==null)elapsed=Math.min(elapsed,cleanedAt+4);
    card.dataset.channel4Normal=String(cleanedAt!==null&&elapsed>=cleanedAt);
    const interval=recovery?300:1;
    const end=recovery?12*3600+40+2100+Math.floor(Math.max(0,Date.now()-monitorStartedAt)/300000)*300:12*3600+elapsed;
    stack.querySelectorAll('.evt-chart-time').forEach((n,i)=>n.textContent=timeLabel(end-(7-i%8)*interval));
    svg.setAttribute('aria-label',`四通道光功率及错误计数趋势：${cleanedAt===null?'尚未清污':'清污已完成'}，${recovery?'每5分钟采样，最近35分钟':'最近7秒'}监控数据截至${timeLabel(end)}`);
    svg.querySelectorAll('.evt-chart-line').forEach((n,c)=>n.setAttribute('points',Array.from({length:8},(_,i)=>{const t=elapsed+i;const recovered=cleanedAt!==null&&elapsed-7+i>=cleanedAt;const base=c===3?(recovered?-.55:-12.9):[-.45,-.7,-.25][c];const v=base+Math.sin(t*1.2+c)* (c===3&&!recovered?.35:.1);return `${x(i)},${y(v)}`}).join(' ')));
    errorSvg.querySelectorAll('.evt-chart-bar').forEach((n,i)=>{const v=cleanedAt!==null&&elapsed-7+i>=cleanedAt?0:Math.round(76+Math.sin((elapsed+i)*1.4)*12);n.setAttribute('d',v?barPath(i,v):'');n.querySelector('title').textContent=`${timeLabel(end-(7-i%8)*interval)}：错误计数 ${v} 次`;});
    if(hoverIndex!==null)showSample(hoverIndex);
  };

  return card;
}

  return { CleaningIllustration, ExperienceSummary, streamExperience, TrendChart };

})();
