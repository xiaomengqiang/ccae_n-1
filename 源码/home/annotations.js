// Review-only annotations, stored in 1920×1080 canvas coordinates.
(()=>{
 const key='hc-home-assembly-annotations-v1',canvas=document.getElementById('canvas');
 let notes=[];try{notes=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 if(!Array.isArray(notes))notes=[];
 let enabled=false,selected=null;
 const toggle=document.createElement('button');toggle.textContent='添加标注';toggle.setAttribute('aria-pressed','false');toggle.id='annotation-toggle';
 document.querySelector('header').insertBefore(toggle,document.querySelector('header a'));
 const layer=document.createElement('div');layer.id='annotations';canvas.append(layer);
 const editor=document.createElement('section');editor.id='annotation-editor';editor.hidden=true;
 editor.innerHTML='<strong>页面标注</strong><textarea aria-label="标注意见" placeholder="描述这个位置需要调整的地方…"></textarea><div><button data-action="save">保存标注</button><button data-action="cancel">取消</button><button data-action="delete">删除</button></div><small>标记随画面等比缩放；保存在当前浏览器。</small>';
 document.body.append(editor);const input=editor.querySelector('textarea');
 function persist(){try{localStorage.setItem(key,JSON.stringify(notes))}catch{editor.querySelector('small').textContent='浏览器无法保存；当前标注仅保留到页面关闭。'}}
 function render(){layer.replaceChildren();notes.forEach((note,index)=>{const pin=document.createElement('button');pin.className='annotation-pin';pin.style.left=note.x+'px';pin.style.top=note.y+'px';pin.textContent=index+1;pin.title=note.text||'未填写意见';pin.setAttribute('aria-label',`标注 ${index+1}：${note.text||'未填写意见'}`);pin.addEventListener('click',event=>{event.stopPropagation();open(note)});layer.append(pin)})}
 function open(note){selected=note;input.value=note.text;editor.hidden=false;input.focus()}
 function setEnabled(value){enabled=value;layer.classList.toggle('placing',enabled);toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'点击页面放置标注':'添加标注'}
 toggle.addEventListener('click',()=>setEnabled(!enabled));
 layer.addEventListener('click',event=>{if(!enabled||event.target!==layer)return;const rect=canvas.getBoundingClientRect();const note={id:Date.now().toString(36),x:Math.max(0,Math.min(1920,(event.clientX-rect.left)*1920/rect.width)),y:Math.max(0,Math.min(1080,(event.clientY-rect.top)*1080/rect.height)),text:'',draft:true};notes.push(note);render();setEnabled(false);open(note)});
 editor.addEventListener('click',event=>{const action=event.target.dataset.action;if(!action||!selected)return;if(action==='save'){selected.text=input.value.trim();delete selected.draft;persist()}else if(action==='delete'||(action==='cancel'&&selected.draft)){notes=notes.filter(n=>n.id!==selected.id);persist()}editor.hidden=true;selected=null;render()});
 addEventListener('keydown',event=>{if(event.key==='Escape'){setEnabled(false);if(selected?.draft){notes=notes.filter(n=>n.id!==selected.id);render()}editor.hidden=true;selected=null}});
 render();
})();
