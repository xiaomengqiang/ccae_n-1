"""Prepare offline assets. Requires fonttools[woff] and Pillow; originals stay intact."""
from pathlib import Path
import sys
from fontTools import subset
from PIL import Image

R = Path(__file__).resolve().parent.parent
out = R / 'assets/optimized'
out.mkdir(exist_ok=True)
text = ''.join(p.read_text() for folder in ['home', 'components']
               for p in (R / folder).rglob('*')
               if p.suffix in ['.js', '.json', '.html', '.css'])
text += (R / 'style.css').read_text() + ''.join(chr(i) for i in range(32, 127))
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font('/Users/mac/Downloads/HarmonyOS Sans/HarmonyOS_Sans_SC.ttf', options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, str(out / 'HarmonyOS-subset.woff2'), options)
for name in ([] if '--font-only' in sys.argv else ['image_10', 'image_11', 'image_12']):
    source = Image.open(R / 'assets' / (name + '.png')).convert('RGBA')
    target = out / (name + '.webp')
    source.save(target, 'WEBP', lossless=True, method=6, exact=True)
    assert Image.open(target).convert('RGBA').tobytes() == source.tobytes()
    print(name, target.stat().st_size, 'bytes; identical RGBA pixels')
print('Font:', (out / 'HarmonyOS-subset.woff2').stat().st_size, 'bytes')
