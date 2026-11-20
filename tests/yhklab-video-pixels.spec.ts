import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { compareVideoPixels } from "./helpers/video-pixels";
import { openVideoPage, readyVideo } from "./helpers/video";

const fixture = process.env.YHKLAB_VIDEO_DIST;
const rootSelector = "[data-video-container]";

for (const width of [390, 768, 1440]) {
  test(`local video matches archived poster and controls at ${width}px`, async ({
    browser,
    baseURL,
  }, info) => {
    test.skip(!fixture, "Build the isolated video comparator.");
    const options = { baseURL, viewport: { width, height: 950 } };
    const original = await browser.newPage(options);
    const candidate = await browser.newPage(options);
    const errors: string[] = [];
    candidate.on("pageerror", (error) => errors.push(error.message));
    try {
      const docs = [
        [original, "reference"],
        [candidate, "candidate"],
      ] as const;
      const [reference, current] = await Promise.all(
        docs.map(async ([page, variant]) => {
          const path = `/themes/openai/astra-sol/components/file-video-${variant}/`;
          const body = readFileSync(`${fixture}${path}index.html`);
          await page.route(`**${path}`, (route) =>
            route.fulfill({ contentType: "text/html; charset=utf-8", body }),
          );
          await openVideoPage(page, path);
          const root = await readyVideo(page, rootSelector);
          await root.locator("[data-badge-controls=desktop]").waitFor();
          await root
            .locator("img")
            .evaluate((img) => (img as HTMLImageElement).decode());
          await page.evaluate(() => document.fonts.ready.then(() => {}));
          await expect(root.locator("img")).toHaveCSS("opacity", "1");
          return root;
        }),
      );
      expect(await current.boundingBox()).toEqual(
        await reference.boundingBox(),
      );
      async function compare(state: string) {
        const shots = await Promise.all(
          [reference, current].map((root) =>
            root.screenshot({ animations: "disabled" }),
          ),
        );
        const diff = await compareVideoPixels(candidate, shots[0], shots[1]);
        if (
          diff.size ||
          diff.outsideCorners ||
          (diff.differingPixels ?? 0) > 48
        ) {
          await info.attach(`${state}-reference`, {
            body: shots[0],
            contentType: "image/png",
          });
          await info.attach(`${state}-candidate`, {
            body: shots[1],
            contentType: "image/png",
          });
        }
        expect(diff.size).toBeNull();
        expect(diff.outsideCorners).toBe(0);
        expect(diff.differingPixels).toBeLessThanOrEqual(48);
      }
      await compare("poster");
      if (width >= 768) {
        await Promise.all(
          [reference, current].map((root) =>
            root.getByRole("button", { name: "视频设置" }).click(),
          ),
        );
        await compare("settings");
      }
      expect(errors).toEqual([]);
    } finally {
      await Promise.all([original.close(), candidate.close()]);
    }
  });
}
