from pathlib import Path
from PIL import Image, ImageSequence
import re, base64, io
ROOT=Path(__file__).resolve().parents[2]
pattern=re.compile(r'data:(image/(?:svg\+xml|png|webp));base64,([A-Za-z0-9+/=]+)')
cache={}
def convert(m, preserve_detail=False):
 key=(m.group(0),preserve_detail)
 if key in cache:return cache[key]
 mime=m[1];raw=base64.b64decode(m[2]);out=m.group(0)
 if mime=='image/svg+xml':
  text=raw.decode();new=pattern.sub(lambda match:convert(match,True),text)
  if new!=text:out='data:image/svg+xml;base64,'+base64.b64encode(new.encode()).decode()
 elif len(raw)>20000:
  im=Image.open(io.BytesIO(raw));frames=[];durations=[]
  animated=getattr(im,'n_frames',1)>1
  limit=520 if animated else 1800
  for frame in ImageSequence.Iterator(im):
   f=frame.convert('RGBA')
   if not preserve_detail and not animated:f.thumbnail((limit,limit),Image.Resampling.LANCZOS)
   frames.append(f);durations.append(frame.info.get('duration',40))
  buf=io.BytesIO();kwargs=dict(format='WEBP',quality=82,method=4)
  if preserve_detail:kwargs.update(lossless=True)
  if animated:kwargs.update(save_all=True,append_images=frames[1:],duration=durations,loop=im.info.get('loop',0))
  frames[0].save(buf,**kwargs)
  if len(buf.getvalue())<len(raw):out='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
 cache[key]=out
 return out
src=ROOT/'完整首页-组装版.html';text=src.read_text();result=pattern.sub(convert,text)
dst=ROOT.parent/'演示导出/HC展会-首页演示-轻量版.html';dst.write_text(result)
print(f'{src.stat().st_size/1024**2:.1f} MB -> {dst.stat().st_size/1024**2:.1f} MB',flush=True)
print(dst,flush=True)
