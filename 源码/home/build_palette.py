from pathlib import Path
from PIL import Image
import numpy as np,re,base64,io,json,random
root=Path(__file__).resolve().parents[1]
s=(root/'assets/cabinet-original.svg').read_text();s=s.replace('#2dc16f','#37C18D').replace('fill-opacity=".5"','fill-opacity="0.6"')
im=np.array(Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\"]+)',s)[1]))).convert('RGB'));m=(im[:,:,1]>80)&(im[:,:,1]>im[:,:,0]*1.4)&(im[:,:,1]>im[:,:,2]*1.2)
seen=np.zeros(m.shape,bool);boxes=[]
for y,x in zip(*np.where(m)):
 if seen[y,x]:continue
 stack=[(y,x)];seen[y,x]=True;pts=[]
 while stack:
  yy,xx=stack.pop();pts.append((yy,xx))
  for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
   ny,nx=yy+dy,xx+dx
   if 0<=ny<m.shape[0] and 0<=nx<m.shape[1] and m[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;stack.append((ny,nx))
 ys,xs=zip(*pts);w=max(xs)-min(xs)+1;h=max(ys)-min(ys)+1
 if 6<=w<=30 and 6<=h<=30 and len(pts)>25:boxes.append((min(xs),min(ys),w,h))
means=[]
for mode in range(3):
 vals=[];g='<g>'
 ranks=[20]*128+[45+mode*2]*1088+[75]*51+[95]*13
 # Keep load bands spatially contiguous, with about 10% of cells exchanged.
 rng=random.Random([29173,85061,63709][mode])
 order=sorted(range(len(boxes)),key=lambda i:(round(boxes[i][0]/160),boxes[i][1],boxes[i][0]))
 if mode==1: order=order[80:]+order[:80]
 if mode==2: order=list(reversed(order))
 grouped=[0]*len(boxes)
 for index,value in zip(order,ranks):grouped[index]=value
 for _ in range(round(len(boxes)*.05)):
  a,b=rng.sample(range(len(boxes)),2);grouped[a],grouped[b]=grouped[b],grouped[a]
 ranks=grouped
 for i,(x,y,w,h) in enumerate(boxes):
  v=ranks[i];vals.append(v)
  level=0 if v<30 else 1 if v<60 else 2 if v<90 else 3
  color=['#3889FF','#37C18D','#FCD72E','#F4840C'][level]
  opacity=.6
  xx=x*.000295644*2742-.0919038*2742;yy=y*.000540797*1499-.304908*1499;ww=w*.000295644*2742;hh=h*.000540797*1499
  g+=f'<rect x="{xx:.2f}" y="{yy:.2f}" width="{ww:.2f}" height="{hh:.2f}" rx="1" fill="{color}" fill-opacity="{opacity}"/><text x="{xx+ww/2:.2f}" y="{yy+hh*.77:.2f}" text-anchor="middle" font-family="Arial" font-size="{hh*.8:.2f}" fill="#17343a">{"C" if w>18 else "N"}</text>'
 means.append(round(sum(vals)/len(vals),1));(root/f'assets/cabinet-palette-{mode}.svg').write_text(s.replace('</svg>',g+'</g></svg>'))
print(len(boxes),means)
(root/'home/palette-values.json').write_text(json.dumps(means))
