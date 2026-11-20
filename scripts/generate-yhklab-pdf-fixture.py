"""Rebuild the PDF comparison fixture, embedding the PDF.js Liberation Sans subset."""
from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'node_modules' / 'pdfjs-dist' / 'standard_fonts'
OUTPUT = ROOT / 'tests' / 'fixtures'


def write(name, width, height):
    doc = canvas.Canvas(
        str(OUTPUT / f'pdf-{name}-parity.pdf'),
        pagesize=(width, height), invariant=1, pageCompression=1,
    )
    doc.setTitle('YhkLab Mock PDF raster fixture')
    for page in (1, 2):
        doc.setFillColor(HexColor('#37647f'))
        doc.rect(0, height - 10, width, 10, fill=1, stroke=0)
        doc.setFont('LiberationSans', 36)
        doc.drawString(50, height - 114, f'Mock {name} / {page}')
        doc.setFillColor(HexColor('#142f39'))
        doc.setFont('LiberationSans', 17)
        doc.drawString(50, height - 214, 'Archive and candidate must paint these same glyphs.')
        doc.setFillColor(HexColor('#2b766e'))
        doc.rect(50, height - 290, 306.5 * page / 2, 26.75, fill=1, stroke=0)
        doc.showPage()
    doc.save()


def main():
    pdfmetrics.registerFont(TTFont('LiberationSans', FONTS / 'LiberationSans-Regular.ttf'))
    write('workbook', 600, 450)
    write('slide', 720, 405)


if __name__ == '__main__':
    main()
