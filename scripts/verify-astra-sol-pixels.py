from PIL import Image,ImageChops
from pathlib import Path
import json,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'artifacts/astra-sol-comparison'); count=4

def diff(a,b):
 with Image.open(a) as x,Image.open(b) as y:
  if x.size!=y.size:raise ValueError(f'Sizes differ: {a} {b}')
  d=ImageChops.difference(x.convert('RGB'),y.convert('RGB')).split();return x.width*x.height-ImageChops.lighter(ImageChops.lighter(d[0],d[1]),d[2]).histogram()[0]
rows=[]
for width in (1440,390):
 for state in ('benchmark','science-tabs','carousel'):
  shot=lambda side,i:root/f'{width}-{state}-{side}-{i}.png'
  rows.append(dict(width=width,state=state,cross=[diff(shot('blog',i),shot('reference',i)) for i in range(count)],self={s:[diff(shot(s,0),shot(s,i)) for i in range(1,count)] for s in ('reference','blog')}))
p=Path('docs/themes/astra-sol-pixels.json');p.write_text(json.dumps({'roundsPerSide':count,'viewports':[[1440,1000],[390,844]], 'states':rows},indent=2)+'\n',encoding='utf8');print(json.dumps(rows));sys.exit(int(any(any(r['cross']) or any(any(v) for v in r['self'].values()) for r in rows)))
