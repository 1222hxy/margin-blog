"""Generate the site-local YhkLab mock decks and their first-page posters."""
import json
from pathlib import Path
import fitz
from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'yhklab' / 'decks'
FONT = 'STSong-Light'
pdfmetrics.registerFont(UnicodeCIDFont(FONT))


def text(doc, x, y, value, size=12, color='#10222c'):
    doc.setFillColor(HexColor(color))
    doc.setFont(FONT, size)
    doc.drawString(x, y, value)


def block(doc, x, y, width, height, color):
    doc.setFillColor(HexColor(color))
    doc.rect(x, y, width, height, stroke=0, fill=1)


def draw_page(doc, w, h, sample, version, page):
    slide = sample['kind'] == 'slide'
    margin = w * .085
    main = '#142f39' if slide else '#16323b'
    primary = '#2b766e' if version == 'after' else '#37647f'
    block(doc, 0, 0, w, h, '#f6faf9' if slide else '#ffffff')
    block(doc, 0, h - 10, w, 10, primary)
    text(doc, margin, h * .86, 'MOCK  /  YHKLAB  /  ' + ('复核稿' if version == 'after' else '初稿'), 12, primary)
    text(doc, margin, h * .72, sample['title'] if page == 1 else '复核说明', min(38, w * .06), main)
    if page == 1:
        values = sample[version]
        for i, label in enumerate(sample['labels']):
            y = h * (.55 - i * .12)
            text(doc, margin, y, label, 14, main)
            block(doc, w * .28, y, w * .55, max(1, h * .042), '#e3eeee')
            block(doc, w * .28, y, w * .55 * (values[i] / max(sample['before'] + sample['after'])), h * .042, primary)
            text(doc, w * .87, y, str(values[i]), 14, main)
    else:
        text(doc, margin, h * .53, sample['note'], min(19, w * .038), main)
        text(doc, margin, h * .39, '所有数据均为示例，不代表实际结果。', 13, primary)
        if sample['id'] == 'experiment':
            doc.textAnnotation('同一组 Mock 样本。', (margin, h * .515, margin + 15, h * .55))
    text(doc, margin, h * .1, f'YhkLab · Mock    /    {page} / 2', 11, primary)
    doc.showPage()


def write(sample, version):
    a, b = map(int, sample['ratio'].split('/'))
    w = 630
    h = w * b / a
    stem = OUT / f"{sample['id']}-{version}"
    pdf = stem.with_suffix('.pdf')
    doc = canvas.Canvas(str(pdf), pagesize=(w, h), pageCompression=1, invariant=1)
    doc.setTitle(f"Mock · {sample['title']}")
    for page in (1, 2):
        draw_page(doc, w, h, sample, version, page)
    doc.save()
    with fitz.open(pdf) as built:
        assert len(built) == 2 and sample['title'] in built[0].get_text(), pdf
        image = built[0].get_pixmap(matrix=fitz.Matrix(1.3, 1.3), alpha=False)
        Image.frombytes('RGB', (image.width, image.height), image.samples).save(stem.with_suffix('.webp'), lossless=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for sample in json.loads((ROOT / 'src/themes/yhklab/pdf-mock-data.json').read_text(encoding='utf-8-sig')):
        for version in ('before', 'after'):
            write(sample, version)


if __name__ == '__main__':
    main()
