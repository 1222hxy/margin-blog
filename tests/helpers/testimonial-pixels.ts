import type { Locator } from "@playwright/test";

// Chromium's subpixel antialiasing can vary slightly for an external SVG <use>
// between page contexts. No tolerance is granted outside the two icon boxes.
export async function compareTestimonialPixels(
  root: Locator,
  reference: Buffer,
  candidate: Buffer,
) {
  return root.evaluate(
    async (root, { reference, candidate }) => {
      async function decode(base64: string) {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return {
          width: image.width,
          height: image.height,
          pixels: context.getImageData(0, 0, image.width, image.height).data,
        };
      }
      const [oldShot, newShot] = await Promise.all([
        decode(reference),
        decode(candidate),
      ]);
      if (
        oldShot.width !== newShot.width ||
        oldShot.height !== newShot.height
      ) {
        return {
          layout: `${oldShot.width}×${oldShot.height} vs ${newShot.width}×${newShot.height}`,
        };
      }
      const origin = root.getBoundingClientRect();
      const icons = Array.from(
        root.querySelectorAll(
          '[data-testid="testimonial-carousel-controls"] svg',
        ),
        (svg) => svg.getBoundingClientRect(),
      );
      let outsideIcons = 0,
        iconMaxChannelDelta = 0;
      for (let p = 0; p < oldShot.pixels.length; p += 4) {
        let delta = 0;
        for (let channel = p; channel < p + 4; channel++)
          delta = Math.max(
            delta,
            Math.abs(oldShot.pixels[channel] - newShot.pixels[channel]),
          );
        if (!delta) continue;
        const x = ((p / 4) % oldShot.width) + origin.x;
        const y = Math.floor(p / 4 / oldShot.width) + origin.y;
        if (
          icons.some(
            (rect) =>
              x >= rect.left - 1 &&
              x <= rect.right + 1 &&
              y >= rect.top - 1 &&
              y <= rect.bottom + 1,
          )
        ) {
          iconMaxChannelDelta = Math.max(iconMaxChannelDelta, delta);
        } else outsideIcons++;
      }
      return { layout: null, outsideIcons, iconMaxChannelDelta };
    },
    {
      reference: reference.toString("base64"),
      candidate: candidate.toString("base64"),
    },
  );
}
