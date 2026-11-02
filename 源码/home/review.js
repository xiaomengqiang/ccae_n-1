// Review shell shares the document with the demo so native browser annotations can select it.
(()=>{
 const screen=document.getElementById('screen');
 const bar=document.createElement('header');bar.id='review-bar';
 bar.innerHTML='<strong>完整首页 · 布局核查</strong><button data-mode="implementation" aria-pressed="true">实现效果</button><button data-mode="reference" aria-pressed="false">高保真原图</button><button data-mode="overlay" aria-pressed="false">叠加对照</button><label id="blend">原图透明度 <input id="alpha" type="range" min="0" max="100" value="50" aria-label="高保真原图透明度"></label><a href="完整首页-组装版.html" target="_blank">单独打开</a><a href="完整首页-组装版.html" download>下载单文件</a>';
 const viewport=document.createElement('section');viewport.id='viewport';
 const canvas=document.createElement('div');canvas.id='canvas';canvas.dataset.mode='implementation';
 const reference=document.createElement('img');reference.id='reference';reference.alt='当前页面高保真原图';
 const footer=document.createElement('footer');footer.id='review-footer';footer.innerHTML='<span id="status"></span><span>布局、交互与光链路详情核查</span>';
 document.body.prepend(bar,viewport);viewport.append(canvas);canvas.append(screen,reference);document.body.append(footer);
 function fit(){const scale=Math.min(viewport.clientWidth/1920,viewport.clientHeight/1080);canvas.style.transform=`scale(${scale})`;canvas.style.left=(viewport.clientWidth-1920*scale)/2+'px';canvas.style.top=(viewport.clientHeight-1080*scale)/2+'px';document.getElementById('status').textContent=`1920 × 1080 · 显示比例 ${Math.round(scale*100)}%`}
 addEventListener('resize',fit);fit();
 function updateReference(){const optical=document.getElementById('optical-event-root'),events=document.getElementById('guard-all');const category=optical&&!optical.hidden?'optical':events&&!events.hidden?'events':screen.dataset.category;const suffix=['optical','events','training','inference'].includes(category)?'-'+category:'';const src='assets/reference'+suffix+'.png';if(reference.getAttribute('src')!==src)reference.src=src}
 new MutationObserver(updateReference).observe(screen,{subtree:true,attributes:true,attributeFilter:['hidden','data-category']});updateReference();
 bar.querySelectorAll('button[data-mode]').forEach(button=>button.addEventListener('click',()=>{canvas.dataset.mode=button.dataset.mode;bar.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('blend').style.display=button.dataset.mode==='overlay'?'flex':'none';reference.style.opacity=button.dataset.mode==='overlay'?document.getElementById('alpha').value/100:1}));
 document.getElementById('alpha').addEventListener('input',e=>reference.style.opacity=e.target.value/100);
})();
