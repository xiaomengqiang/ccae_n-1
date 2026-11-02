
  (()=>{
    const feedbackMarkup=`<section class="energy-apply-feedback"><div class="energy-feedback-user">应用均衡模式</div><div class="energy-feedback-agent"><div class="energy-feedback-head"><i class="fa fa-check"></i><span>均衡模式应用成功</span></div><p>已成功应用均衡模式。运行态节能策略已开启，将根据实时请求量动态调节节点功耗，并与已开启的空闲态策略协同运行。</p><div class="energy-feedback-steps"><div class="energy-feedback-step"><b>策略下发完成</b>16 台服务器的均衡模式配置已同步</div><div class="energy-feedback-step"><b>节能监控已启动</b>能耗、时延与资源利用率已进入实时监控</div><div class="energy-feedback-step"><b>实际数据持续回填</b>从当前时刻开始覆盖对应的预测区间</div></div></div></section>`;
    const spark=(values)=>{const min=Math.min(...values),max=Math.max(...values),range=max-min||1,points=values.map((v,i)=>`${(i/(values.length-1)*42).toFixed(1)},${(16-(v-min)/range*12).toFixed(1)}`).join(' ');return `<svg class="energy-spark" viewBox="0 0 42 18" aria-hidden="true"><path d="M${points.replaceAll(' ',' L')}"/></svg>`};
    const metrics=[
      ['单日能耗','1280','kWh',[15,14,14,12,13,11,10]],
      ['节能增益','11.3','%',[5,7,6,9,10,10,12]],
      ['TTFT','2.5','ms',[8,7,9,6,7,6,6]],
      ['TPOT','12.3','ms',[8,8,7,9,7,7,6]],
      ['NPU 利用率','87.1','%',[8,10,9,12,11,13,12]],
      ['CPU 利用率','62.8','%',[10,9,11,8,9,7,8]],
      ['HBM 利用率','78.1','%',[7,8,8,10,9,10,9]]
    ];
    const tagsMarkup='<div class="energy-monitor-tags"><span><i class="fa fa-circle"></i>空闲态策略已开启</span><span><i class="fa fa-circle"></i>运行态均衡模式已开启</span></div>';
    const monitorMarkup=()=>`<section class="energy-monitor-card"><div class="energy-monitor-head"><h3>当前运行状态</h3></div><div class="energy-monitor-metrics">${metrics.map(([label,value,unit,values])=>`<div class="energy-live-metric"><span>${label}</span><div class="energy-live-value"><b>${value}<small>${unit}</small></b>${spark(values)}</div></div>`).join('')}</div></section>`;
    const questionMarkup='<section class="energy-report-question"><p>需要我帮你生成8月份节能报告吗？</p></section>';
    const livePoint=(i)=>{const h=24+12*Math.sin(i*Math.PI/13)+7*Math.sin(i*Math.PI/6.5),x=((i+.5)/108*1000).toFixed(1),y=(62-h*.82+10-Math.max(0,Math.min(1,(h-5)/38))*8+Math.sin(i*.9)*1.7).toFixed(1);return [x,y]};
    const updateLiveTrend=(view,end)=>{
      const chart=view.querySelector('.energy-chart-v2'),svg=chart?.querySelector('svg');if(!chart||!svg)return;
      let line=svg.querySelector('.energy-live-line');if(!line){line=document.createElementNS('http://www.w3.org/2000/svg','path');line.classList.add('energy-live-line');svg.appendChild(line)}
      const points=[];for(let i=54;i<=end;i++)points.push(livePoint(i));
      line.setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' '));
      [...chart.querySelectorAll('.energy-bars i')].forEach((bar,i)=>{if(i>=54&&i<=end){bar.classList.remove('future');bar.classList.add('energy-observed')}});
      const now=chart.querySelector('.energy-now');if(now)now.style.left=`${Math.min(88,Math.max(50,(end+.5)/108*100))}%`;
      const panel=chart.querySelector('.energy-now-panel');if(panel)panel.innerHTML=`<strong>当前</strong><p>平均请求量 <b>${31+Math.round(Math.sin(end*.7)*3)} 个/s</b></p><p>当前功耗 <b>${392+Math.round(Math.sin(end*.5)*9)} kW</b></p>`;
    };
    const startTrend=(view)=>{
      if(view._energyLiveTimer)return;let end=54;updateLiveTrend(view,end);
      view._energyLiveTimer=setInterval(()=>{if(!view.isConnected){clearInterval(view._energyLiveTimer);view._energyLiveTimer=null;return}end=Math.min(108,end+2);updateLiveTrend(view,end);if(end>=108){clearInterval(view._energyLiveTimer);view._energyLiveTimer=null}},900);
    };
    const activate=(view)=>{
      if(!view||view.classList.contains('energy-monitor-active'))return;
      view.dataset.strategyIssued='true';view.classList.add('energy-monitor-active');
      view.querySelectorAll('.energy-strategy').forEach(button=>{button.classList.toggle('active',button.dataset.strategy==='balanced');button.disabled=true});
      const apply=view.querySelector('.energy-apply');if(apply){apply.disabled=true;apply.textContent='推荐策略已应用'}
      const actions=view.querySelector('.energy-inline-actions');if(actions&&!view.querySelector('.energy-apply-feedback'))actions.insertAdjacentHTML('afterend',feedbackMarkup);
      actions?.remove();
      const feedback=view.querySelector('.energy-apply-feedback');if(feedback&&!view.querySelector('.energy-report-question'))feedback.insertAdjacentHTML('afterend',questionMarkup);
      const overview=view.querySelector('.energy-overview');if(overview)overview.innerHTML=monitorMarkup();
      view.querySelectorAll('.energy-service .energy-util-pill').forEach(item=>item.remove());
      const service=view.querySelector('.energy-service');if(service&&!service.querySelector('.energy-monitor-tags'))service.insertAdjacentHTML('beforeend',tagsMarkup);
      const topoTitle=view.querySelector('.energy-topo-head h3');if(topoTitle)topoTitle.textContent='当前运行拓扑';
      const trendTitle=view.querySelector('.energy-trend-head h3');if(trendTitle)trendTitle.textContent='节能实时监控';
      const legend=view.querySelector('.energy-trend-legend');if(legend)legend.innerHTML='<span><i class="energy-request-swatch actual"></i>实际请求量（个/s）</span><span><i class="energy-request-swatch forecast"></i>预测请求量（个/s）</span><span><i style="background:#9da39e"></i>实际功耗（kW）</span><span><i style="border-top:1px dashed #55d58f"></i>策略预测功耗（kW）</span><span><i style="background:#55d58f"></i>实时功耗（kW）</span>';
      const chart=view.querySelector('.energy-chart-v2');if(chart&&!chart.querySelector('.energy-deploy-marker'))chart.insertAdjacentHTML('beforeend','<div class="energy-deploy-marker"><span>均衡模式下发</span></div>');
      startTrend(view);
      requestAnimationFrame(()=>view.querySelector('.energy-apply-feedback')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
    };
    const prepare=()=>{const view=document.querySelector('#energyDrillView.energy-v2');if(!view||view.dataset.energyApplyPrepared)return;view.dataset.energyApplyPrepared='true';view.dataset.strategyIssued='false';view.classList.remove('energy-monitor-active');const apply=view.querySelector('.energy-apply');if(apply){apply.disabled=false;apply.textContent='应用推荐策略'}const input=view.querySelector('.energy-chat input'),send=view.querySelector('.energy-chat button');if(input){input.value='';input.placeholder='';if(send)send.disabled=true;if(!input.dataset.energySendStateBound){input.dataset.energySendStateBound='true';input.addEventListener('input',()=>{if(send)send.disabled=!input.value.trim()})}}};
    document.addEventListener('keydown',event=>{const input=event.target.closest?.('#energyDrillView.energy-v2 .energy-chat input');if(input&&event.key==='Enter'&&!input.value.trim()){event.preventDefault();event.stopImmediatePropagation()}},true);
    document.addEventListener('click',event=>{const apply=event.target.closest?.('#energyDrillView.energy-v2 .energy-apply');if(!apply)return;event.preventDefault();event.stopImmediatePropagation();activate(apply.closest('#energyDrillView'))},true);
    new MutationObserver(prepare).observe(document.querySelector('#app'),{childList:true,subtree:true});
    prepare();
  })();
