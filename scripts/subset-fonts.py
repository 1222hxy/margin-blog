from fontTools import subset
from pathlib import Path
import brotli, os, tempfile
original=brotli.compress
brotli.compress=lambda data,**kw:original(data,**{**kw,'quality':5})
text=''.join(p.read_text(encoding='utf-8') for p in Path('src').rglob('*') if p.suffix in ['.astro','.ts','.tsx','.md','.mdx','.json'])
chars=set(map(ord,text))|set(range(32,591))|set(range(0x2000,0x2070))|set(range(0x3000,0x3040))
for p in Path('assets/font-sources').iterdir():
 options=subset.Options();options.flavor='woff2';options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*'];options.recalc_timestamp=False
 font=subset.load_font(str(p),options)
 sub=subset.Subsetter(options=options);sub.populate(unicodes=chars);sub.subset(font)
 out=Path('public/fonts')/(p.stem+'.woff2')
 with tempfile.NamedTemporaryFile(dir=out.parent, suffix='.tmp', delete=False) as temp: temp_path=temp.name
 try:
  subset.save_font(font,temp_path,options)
  if out.exists() and out.read_bytes()==Path(temp_path).read_bytes(): os.unlink(temp_path)
  else: os.replace(temp_path,out)
 finally:
  if Path(temp_path).exists(): os.unlink(temp_path)
 print(out.name,out.stat().st_size,flush=True)
