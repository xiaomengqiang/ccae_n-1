
  (()=>{
    const polishEnergyRecommendation=()=>{
      const view=document.querySelector('#energyDrillView.energy-v2');
      if(!view||view.classList.contains('energy-monitor-active'))return;
      const setText=(element,value)=>{if(element&&element.textContent!==value)element.textContent=value};
      const current=view.querySelector('.energy-overview-card');
      const recommended=view.querySelector('.energy-predict');
      const recommendedSelected=recommended?.classList.contains('energy-selected');
      const currentTitle=current?.querySelector('h3');
      const recommendedTitle=recommended?.querySelector('.predict-title');
      if(currentTitle&&currentTitle.textContent!=='当前运行基线')currentTitle.textContent='当前运行基线';
      let strategyName='均衡模式';
      if(recommendedTitle){
        const renderedName=recommendedTitle.textContent.match(/^(.+?)预测$/)?.[1];
        if(renderedName)recommendedTitle.dataset.strategyName=renderedName;
        strategyName=recommendedTitle.dataset.strategyName||'均衡模式';
        const target=`${strategyName}方案`;
        if(recommendedTitle.childNodes[0]?.textContent!==target)recommendedTitle.childNodes[0].textContent=target;
      }
      current?.setAttribute('role','tab');
      recommended?.setAttribute('role','tab');
      current?.setAttribute('aria-selected',String(!recommendedSelected));
      recommended?.setAttribute('aria-selected',String(recommendedSelected));
      const issued=view.dataset.strategyIssued==='true';
      const status=view.querySelector('.energy-status');
      status?.remove();
      const firstCopy=view.querySelector('.energy-copy-section:first-child p');
      setText(firstCopy,'当前所有节点服务器已开启了空闲态节能，过去一周空闲态累计35小时，节省128kWh，结合A市电价，累计节省10289元。');
      const apply=view.querySelector('.energy-apply');
      if(apply){setText(apply,issued?'推荐策略已应用':'应用推荐策略');apply.disabled=issued}
      const topoHead=view.querySelector('.energy-topo-head');
      const topoTitle=topoHead?.querySelector('h3');
      const topoMeta=topoHead?[...topoHead.querySelectorAll('span')]:[];
      const simulationTitle=strategyName.includes('节能')?`${strategyName}仿真拓扑`:`${strategyName}节能仿真拓扑`;
      setText(topoTitle,recommendedSelected?simulationTitle:'当前运行能耗拓扑');
      setText(view.querySelector('.energy-trend-head h3'),'节能优化效果');
      const labels=['服务器 16台','NPU 128卡','CPU 32卡'];
      topoMeta.forEach((item,index)=>{if(labels[index]&&item.textContent!==labels[index])item.textContent=labels[index]});
      view.querySelectorAll('.energy-node').forEach(node=>{node.classList.remove('energy-expected-sleep');node.querySelector(':scope>em')?.remove()});
    };
    new MutationObserver(polishEnergyRecommendation).observe(document.querySelector('#app'),{childList:true,subtree:true});
    document.addEventListener('click',event=>{
      const apply=event.target.closest?.('#energyDrillView.energy-v2 .energy-apply');
      if(apply)apply.closest('#energyDrillView').dataset.strategyIssued='true';
      requestAnimationFrame(polishEnergyRecommendation);
    },true);
  })();
