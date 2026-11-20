import type { Page } from "@playwright/test";

export function compareVideoPixels(
  page: Page,
  reference: Buffer,
  candidate: Buffer,
) {
  return page.evaluate(
    async ([a, b]) => {
      async function decode(base64: string) {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const { width, height } = image;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);
        return {
          width,
          height,
          rgba: ctx.getImageData(0, 0, width, height).data,
        };
      }
      const [ref, current] = await Promise.all([decode(a), decode(b)]);
      const { width, height } = ref;
      if (width !== current.width || height !== current.height) {
        return {
          size: `${width}×${height} vs ${current.width}×${current.height}`,
        };
      }
      let differingPixels = 0,
        outsideCorners = 0;
      for (let i = 0; i < ref.rgba.length; i += 4) {
        if (
          ref.rgba.subarray(i, i + 4).every((v, c) => v === current.rgba[i + c])
        )
          continue;
        differingPixels++;
        const x = (i / 4) % width,
          y = Math.floor(i / 4 / width);
        if (Math.min(x, width - 1 - x) >= 7 || Math.min(y, height - 1 - y) >= 7)
          outsideCorners++;
      }
      return { size: null, differingPixels, outsideCorners };
    },
    [reference.toString("base64"), candidate.toString("base64")],
  );
}
