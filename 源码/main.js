'use strict';
// This bounded visual sample starts at the stable two-pending-events state.
// Full story timers and detail routes are intentionally not mounted yet.
const state={tab:'manual',metric:'fault',range:'近一天'};
const icons={fault:'@@故障+小手@@',energy:'@@绿色闪电@@'};
const events={manual:[['光链路脏污，待清污','计算柜11-L1交换机02链路已隔离，等待人工清污'],['Qwen3.6服务劣化：网卡驱动待升级','节点112.34.23.1的hinic3驱动需由V11.8升级至V13.1']],energy:[['Qwen3.7服务存在节能空间，可优化策略','识别到低负载时段，预计开启均衡模式后单日节能 12.3%']]};
function renderEvents(){const host=document.getElementById('event-list');host.replaceChildren();for(const [title,desc] of events[state.tab]){const article=document.createElement('article');article.className='event-card';const head=document.createElement('div');head.className='event-title';const img=document.createElement('img');img.src=state.tab==='manual'?icons.fault:icons.energy;img.alt='';const label=document.createElement('span');label.textContent=title;const time=document.createElement('time');time.textContent=state.tab==='manual'?'刚刚':'';head.append(img,label,time);const p=document.createElement('p');p.className='event-desc';p.textContent=desc;if(state.tab==='energy'){p.style.whiteSpace='normal';p.style.fontSize='13px'}article.append(head,p);host.append(article)}}
function fit(){document.getElementById('screen').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}
addEventListener('resize',fit);fit();renderEvents();
document.querySelector('.brand').addEventListener('click',()=>location.reload());
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{state.tab=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));renderEvents()}));
document.querySelectorAll('[data-metric]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>{state.metric=button.dataset.metric;document.querySelectorAll('[data-metric]').forEach(b=>b.classList.toggle('selected',b===button));document.getElementById('hazards').hidden=state.metric!=='hazard'}));
document.getElementById('range').addEventListener('change',event=>state.range=event.target.value);
const input=document.getElementById('question'),send=document.querySelector('#chat button'),sendIcon=send.querySelector('img'),disabledIcon=sendIcon.src;
input.addEventListener('input',()=>{send.disabled=!input.value.trim();sendIcon.src=send.disabled?disabledIcon:sendIcon.dataset.enabled});
document.getElementById('chat').addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;input.value=`智能体正在分析：${text}`;send.disabled=true;setTimeout(()=>{input.value='分析完成：未发现高风险异常，建议持续观察链路抖动趋势。';send.disabled=false},700)});
document.getElementById('ticks').replaceChildren(...Array.from({length:20},(_,i)=>{const span=document.createElement('span');span.textContent=`14:${31+i}`;return span}));

document.getElementById('run-mode').addEventListener('change',event=>{document.documentElement.dataset.runMode=event.target.value;document.querySelector('.mode-normal').hidden=event.target.value==='smart'});
