/* Metric cadence and curves from the original demo, lines 864–909. */
(()=>{
 const nodes=[document.querySelector('.energy-metrics .row-quality'),document.querySelector('.health-row:nth-child(2) .row-quality'),document.querySelector('.health-row:first-child .row-quality')];
 let tick=0;
 const rateBases={inference:HOME_WORKLOADS.inference.map(x=>100*Number(x.data.ok)/Number(x.data.total)),training:HOME_WORKLOADS.training.map(x=>parseFloat(x.data.quality))};
 const healthHistory=[[],[]];
 function updateHealth(){
  for(const kind of ['inference','training'])HOME_WORKLOADS[kind].forEach((item,i)=>{
   const leading=kind==='inference'&&i<4;const rate=Math.max(leading?99.91:99.05,Math.min(leading?99.99:99.89,rateBases[kind][i]+Math.sin(tick*.7+i*.17)*(leading?.015:.045)));
   if(kind==='inference'){const total=Number(item.data.total),ok=Math.round(total*rate/100);item.data.ok=String(ok);item.data.fail=String(total-ok);item.data.quality=(100*ok/total).toFixed(2)+'%';}
   else item.data.quality=rate.toFixed(2)+'%';
  });
  const view=document.getElementById('home-workloads');
  if(view&&!view.hidden){const scroll=view.scrollTop;window.refreshWorkloadCards?.();view.scrollTop=scroll;}
 }
 function healthCurve(index,value){const history=healthHistory[index];history.push(value);if(history.length>6)history.shift();while(history.length<6)history.unshift(value);return history.map((v,k)=>(k?'L':'M')+[1,8,15,22,29,37][k]+' '+(11-(v-99)*10).toFixed(3)).join(' ');}

 const spark=(phase,base,amp)=>[1,8,15,22,29,37].map((x,i)=>`${i?'L':'M'}${x} ${(base+Math.sin(phase+i*.82)*amp+Math.cos(phase*.55+i)*.7).toFixed(1)}`).join(' ');
 function updateNumber(node,value,unit){const p=node.querySelector('p');if(p.firstChild?.nodeType===3){if(p.firstChild.nodeValue!==value)p.firstChild.nodeValue=value;}else p.innerHTML=value+'<small>'+unit+'</small>';}
 function paint(){tick+=.42;updateHealth();const values=[100*HOME_WORKLOADS.inference.reduce((sum,item)=>sum+Number(item.data.ok),0)/HOME_WORKLOADS.inference.reduce((sum,item)=>sum+Number(item.data.total),0),HOME_WORKLOADS.training.reduce((sum,item)=>sum+parseFloat(item.data.quality),0)/HOME_WORKLOADS.training.length];values.forEach((value,i)=>{const node=nodes[i+1];updateNumber(node,value.toFixed(2),'%');const svg=node.querySelector('svg'),paths=svg.querySelectorAll('path'),d=healthCurve(i,value);svg.setAttribute('viewBox','0 0 38 13');paths[0].setAttribute('d',d+' L37 13 L1 13 Z');paths[1].setAttribute('d',d);paths[1].setAttribute('stroke-width','1.1')})}
 const primary=nodes[0],secondary=document.querySelectorAll('.energy-metrics .row-quality')[1];
 const groups=[{node:primary,title:'中型模型',range:'14B–32B',limits:[3,8],models:[['Qwen-14B',true,5.60],['DeepSeek-R1-32B',false,12.80]]},{node:secondary,title:'大型模型',range:'70B–130B',limits:[12,30],models:[['Llama-3-70B',true,13.60]]}];
 const colors=['#26b9b0','#3ac58d','#ef535b'];
 const grade=(v,g)=>v<g.limits[0]?0:v<=g.limits[1]?1:2;
 groups.forEach((g,i)=>{g.node.querySelector(':scope > span').textContent=g.title+'百万Token能耗';g.tip=document.createElement('div');g.tip.className='home-ept-tip';g.tip.id='home-ept-tip-'+i;g.tip.setAttribute('role','tooltip');g.node.append(g.tip);g.node.tabIndex=0;g.node.setAttribute('aria-describedby',g.tip.id);});
 const basePaint=paint;
 paint=()=>{basePaint();groups.forEach((g,gi)=>{
 const values=g.models.map((m,i)=>Number((m[2]+Math.sin(tick*.6+i)*.02).toFixed(2))),average=values.reduce((a,b)=>a+b,0)/values.length,color=colors[grade(average,g)];
 updateNumber(g.node,(average/3.6).toFixed(2)+' ','kWh/Mtoken');
 g.node.querySelector(':scope > span').classList.toggle('home-ept-alert-title',grade(average,g)===2);
 const tipHTML='<strong>'+g.title+' '+g.range+' · 百万Token能耗（kWh/Mtoken）</strong>'+g.models.map((m,i)=>'<div class="home-ept-model"><span class="home-ept-model-name">'+m[0]+'</span><span class="home-ept-tag '+(m[1]?'enabled':'disabled')+'">'+(m[1]?'节能中':'未开启节能')+'</span><b style="color:'+colors[grade(values[i],g)]+'">'+(values[i]/3.6).toFixed(2)+'</b></div>').join('')+'<div class="home-ept-legend">'+['&lt;'+(g.limits[0]/3.6).toFixed(2)+' 绿算',(g.limits[0]/3.6).toFixed(2)+'–'+(g.limits[1]/3.6).toFixed(2)+' 正常','&gt;'+(g.limits[1]/3.6).toFixed(2)+' 未达标'].map((label,i)=>'<span><i style="background:'+colors[i]+'"></i>'+label+'</span>').join('')+'</div>';
 if(g.tip.innerHTML!==tipHTML)g.tip.innerHTML=tipHTML;
 const svg=g.node.querySelector('svg'),d=spark(tick+gi,7,2),paths=svg.querySelectorAll('path');svg.setAttribute('viewBox','0 0 38 13');if(paths.length===2){paths[0].setAttribute('d',d+' L37 13 L1 13 Z');paths[0].setAttribute('fill',color);paths[1].setAttribute('d',d);paths[1].setAttribute('stroke',color);}else svg.innerHTML='<path d="'+d+' L37 13 L1 13 Z" fill="'+color+'" opacity=".2"/><path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="1.1"/>';
 });};
 paint();setInterval(()=>{if(!document.hidden&&!document.querySelector('.hc-event-module:not([hidden])'))paint();},1200);
})();
