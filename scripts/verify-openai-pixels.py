"""Independent decoded-pixel checks, including interleaved self baselines."""
from pathlib import Path
import json
import hashlib
import os
from PIL import Image, ImageChops

root = Path(os.environ.get('OPENAI_COMPARE_OUT', 'docs/compare/openai-exact'))
capture = json.loads((root / 'capture.json').read_text(encoding='utf-8'))
results = []
failures = []
if capture['rounds'] < 4 and os.environ.get('OPENAI_DELIVERY_CHECK') != '1':
    failures.append({'reason': 'Four interleaved rounds per side required.'})
for width in (1440, 390):
    states = next(c['states'] for c in capture['cases'] if c['width'] == width)
    for state in (s['state'] for s in states):
        images = {}
        for side in ('reference', 'blog'):
            images[side] = [Image.open(root / f'{side}-{width}-{state}-{r}.png').convert('RGB') for r in range(capture['rounds'])]
        def difference(a, b):
            if a.size != b.size:
                return {'sizes': [a.size, b.size], 'differentPixels': None}
            delta = ImageChops.difference(a, b)
            mask = delta.convert('RGB').point(lambda x: 255 if x else 0)
            # Count pixels with any changed channel, not changed channels.
            channels = mask.split()
            combined = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
            return {'size': a.size, 'differentPixels': combined.histogram()[255]}
        self_diffs = {side: [difference(images[side][0], image) for image in images[side][1:]] for side in images}
        cross = [difference(images['reference'][r], images['blog'][r]) for r in range(capture['rounds'])]
        result = {'width': width, 'state': state, 'self': self_diffs, 'cross': cross}
        results.append(result)
        if any(d['differentPixels'] != 0 for d in cross + self_diffs['reference'] + self_diffs['blog']):
            failures.append({'width': width, 'state': state})
            if images['reference'][0].size == images['blog'][0].size:
                ImageChops.difference(images['reference'][0], images['blog'][0]).save(root / f'diff-{width}-{state}.png')
for c in capture['cases']:
    if c['side'] == 'blog' and (c['errors'] or c['failures'] or c['external']):
        failures.append({'round': c['round'], 'width': c['width'], 'clean': c})
screenshots = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
               for p in sorted(root.glob('*.png')) if not p.name.startswith('diff-')}
report = {'roundsPerSide': capture['rounds'], 'cases': results, 'failures': failures, 'screenshotSha256': screenshots}
(root / 'pixels.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'states': len(results), 'roundsPerSide': capture['rounds'], 'failures': failures}, ensure_ascii=False))
if failures:
    raise SystemExit(1)
