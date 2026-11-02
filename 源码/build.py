from pathlib import Path
import base64, hashlib, json, re, shutil

ROOT = Path(__file__).resolve().parent
ICONS = Path('/Users/mac/Downloads/3、图标切图')
FONT = Path('/Users/mac/Downloads/HarmonyOS Sans/HarmonyOS_Sans_SC.ttf')
def uri(path, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

assets = {p.stem: uri(p, 'image/svg+xml') for p in ICONS.glob('*.svg')}
assets['HEADER'] = uri(Path('/Users/mac/Downloads/5、素材切图/data/exports/1.顶部导航.svg'), 'image/svg+xml')
assets.update(FONT=uri(FONT,'font/ttf'),CABINET=uri(ROOT/'assets/image_10.png','image/png'),SKY=uri(ROOT/'assets/image_11.png','image/png'),MASCOT=uri(ROOT/'assets/image_12.png','image/png'))
template=(ROOT/'page.html').read_text().replace('@@CSS@@',(ROOT/'style.css').read_text()).replace('@@JS@@',(ROOT/'main.js').read_text())
missing=set(re.findall(r'@@([^@]+)@@',template))-assets.keys()
if missing: raise RuntimeError(f'Missing assets: {missing}')
result=re.sub(r'@@([^@]+)@@',lambda match: assets[match[1]],template)
assert not re.search(r'(?:src|href)=[\"\']https?://',result)
(ROOT/'首页样板.html').write_text(result)
reference=Path('/Users/mac/Documents/codex/HC展会/demo重建基线/页面预览/首页-基础设施-故障数.png')
shutil.copy2(reference,ROOT/'assets/reference.png')
(ROOT/'build-info.json').write_text(json.dumps({'output':'首页样板.html','bytes':len(result.encode()),'sha256':hashlib.sha256(result.encode()).hexdigest(),'canvas':[1920,1080],'font':str(FONT),'source':'首页-基础设施-故障数.zip','stage':'单页视觉样板；非完整交互demo','externalResources':0},ensure_ascii=False,indent=2))
print(f'Built 首页样板.html: {len(result.encode())/1024/1024:.1f} MiB, embedded font and images, no external resources.')
