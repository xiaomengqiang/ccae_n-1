from pathlib import Path
import base64,json,re
ROOT=Path(__file__).resolve().parent
font=base64.b64encode(Path('/Users/mac/Downloads/HarmonyOS Sans/HarmonyOS_Sans_SC.ttf').read_bytes()).decode()
data=json.loads((ROOT/'data.json').read_text())
# Keep the original sidebar as a reference only. The implementation is interactive HTML.
p=Path('/Users/mac/Downloads/5、素材切图/data/48-100207.png')
data['references']['2.侧边导航']={'src':'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode(),'w':48,'h':1032}
s=(ROOT/'gallery.html').read_text()
for key,value in {'FONT_CSS':"@font-face{font-family:Harmony;src:url(data:font/ttf;base64,"+font+") format('truetype');font-display:block}",'COMPONENT_CSS':(ROOT/'motion-tokens.css').read_text()+(ROOT/'components.css').read_text(),'COMPONENT_JS':(ROOT/'motion-runtime.js').read_text()+(ROOT/'components.js').read_text(),'GALLERY_JS':(ROOT/'gallery.js').read_text(),'ASSETS':json.dumps(data,ensure_ascii=False)}.items():s=s.replace('@@'+key+'@@',value)
assert not re.search(r'@@[A-Z_]+@@',s)
(ROOT.parent/'components.html').write_text(s)
print('Built components.html',round(len(s.encode())/1024/1024,1),'MiB')
