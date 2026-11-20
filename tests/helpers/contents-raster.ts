import type { Page } from "@playwright/test";

/** At fractional DPR Chromium can snap the same sticky text to either adjacent
 * device pixel. Row box geometry is checked separately in CSS pixels. */
export function contentsRasterOffsets(
  page: Page,
  reference: Buffer,
  candidate: Buffer,
  rowCount: number,
) {
  return page.evaluate(
    async ({ samples, rowCount }) => {
      async function decode(base64: string) {
        const image = new Image();
        image.src = "data:image/png;base64," + base64;
        await image.decode();
        const { width, height } = image;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, width, height);
      }
      const [ref, current] = await Promise.all(samples.map(decode));
      const { width, height } = ref;
      if (width !== current.width || height !== current.height) return null;
      const equal = (top: number, bottom: number, offset: number) => {
        for (let y = top - 1; y <= bottom; y++) {
          const a = y >= top && y < bottom;
          const b = y + offset >= top && y + offset < bottom;
          for (let x = 0; x < width * 4; x++) {
            const left = a ? ref.data[y * width * 4 + x] : 255;
            const right = b ? current.data[(y + offset) * width * 4 + x] : 255;
            if (left !== right) return false;
          }
        }
        return true;
      };
      return Array.from({ length: rowCount }, (_, i) => {
        const top = Math.round((i * height) / rowCount);
        const bottom = Math.round(((i + 1) * height) / rowCount);
        return [0, -1, 1].find((offset) => equal(top, bottom, offset)) ?? null;
      });
    },
    {
      samples: [reference.toString("base64"), candidate.toString("base64")],
      rowCount,
    },
  );
}
