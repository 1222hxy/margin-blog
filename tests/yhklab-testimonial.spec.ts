import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { compareTestimonialPixels } from "./helpers/testimonial-pixels";

const base = "/themes/openai/astra-sol/components/";
const fixtureDir = process.env.YHKLAB_TESTIMONIAL_DIST;
const view = (page: Page) =>
  page.getByTestId("testimonial-carousel-carousel-view");
const track = (root: Locator) =>
  root.getByTestId("testimonial-carousel-scroll-region");
const next = (root: Locator) =>
  root.getByRole("button", { name: "下一条客户评价", exact: true });
const previous = (root: Locator) =>
  root.getByRole("button", { name: "上一条客户评价", exact: true });
const choices = (root: Locator) =>
  root.getByRole("list", { name: "客户评价" }).getByRole("button");

async function open(page: Page, path: string) {
  await page.goto(path);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ state: "visible", timeout: 2400 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  await page.evaluate(() => document.fonts.ready.then(() => {}));
}

async function settled(root: Locator, index: number, total: number) {
  await expect(root.getByTestId("testimonial-carousel-controls")).toHaveText(
    `${index + 1} 条/ 共 ${total} 条`,
  );
  await expect(choices(root).nth(index)).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(track(root).locator('figure[aria-live="polite"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect
    .poll(() =>
      track(root).evaluate(
        (element) =>
          Math.round((element.scrollLeft / element.clientWidth) * 100) / 100,
      ),
    )
    .toBe(index);
}

for (const width of [390, 768, 1440]) {
  test(`product mock testimonials follow the original controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await open(page, "/products/folio/#demo-customer-carousel");
    const [carousel, quote] = [view(page).first(), view(page).last()];
    await expect(carousel.locator("figure")).toHaveCount(3);
    await expect(
      track(carousel).locator('figure[aria-live="polite"] figcaption'),
    ).toHaveText("Mock · 记录者");
    await expect(previous(carousel)).toBeDisabled();
    await next(carousel).click();
    await settled(carousel, 1, 3);
    await expect(
      track(carousel).locator('figure[aria-live="polite"] figcaption'),
    ).toHaveText("Mock · 复核者");
    await expect(
      track(carousel).locator('figure[aria-hidden="true"][inert]'),
    ).toHaveCount(2);
    await choices(carousel).last().focus();
    await page.keyboard.press("Enter");
    await settled(carousel, 2, 3);
    await next(carousel).click();
    await settled(carousel, 0, 3);
    await expect(previous(carousel)).toBeDisabled();
    await track(carousel).evaluate((element) =>
      element.scrollTo({ left: element.clientWidth * 2, behavior: "instant" }),
    );
    await settled(carousel, 2, 3);
    await previous(carousel).click();
    await settled(carousel, 1, 3);
    await expect(quote.locator("figcaption")).toHaveText("Mock · 编辑手记");
    await expect(quote.getByRole("button")).toHaveCount(0);
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", width);
    expect(errors).toEqual([]);
  });

  test(`source testimonials match isolated pixels at ${width}px`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    test.skip(!fixtureDir, "Build the isolated testimonial comparator.");
    const options = { baseURL, viewport: { width, height: 900 } };
    for (const id of ["customer-carousel", "customer-quote"]) {
      const original = await browser.newPage(options),
        candidate = await browser.newPage(options);
      const errors: string[] = [];
      candidate.on("pageerror", (error) => errors.push(error.message));
      try {
        const documentPath = `${base}source-testimonial-fixture/${id}/`;
        const fixture = readFileSync(
          `${fixtureDir}${documentPath}index.html`,
          "utf8",
        );
        await candidate.route(`**${documentPath}`, (route) =>
          route.fulfill({
            contentType: "text/html; charset=utf-8",
            body: fixture,
          }),
        );
        await Promise.all([
          open(original, base + id + "/"),
          open(candidate, documentPath),
        ]);
        const ref = view(original),
          actual = view(candidate);
        // External SVG <use> can paint after DOM load and document.fonts.ready.
        if (id === "customer-carousel")
          await Promise.all(
            [ref, actual].map((root) =>
              expect
                .poll(() =>
                  root
                    .locator("svg use")
                    .evaluateAll(
                      (nodes) =>
                        nodes.filter(
                          (node) => (node as SVGUseElement).getBBox().width > 0,
                        ).length,
                    ),
                )
                .toBe(2),
            ),
          );
        const compare = async (label: string) => {
          await Promise.all(
            [original, candidate].map((page) => page.mouse.move(width - 1, 2)),
          );
          const reference = await ref.screenshot({ animations: "disabled" });
          const recreated = await actual.screenshot({ animations: "disabled" });
          const metrics = recreated.equals(reference)
            ? { layout: null, outsideIcons: 0, iconMaxChannelDelta: 0 }
            : await compareTestimonialPixels(actual, reference, recreated);
          if (
            metrics.layout ||
            metrics.outsideIcons ||
            (metrics.iconMaxChannelDelta ?? 0) > 6
          ) {
            mkdirSync(testInfo.outputDir, { recursive: true });
            writeFileSync(testInfo.outputPath("reference.png"), reference);
            writeFileSync(testInfo.outputPath("candidate.png"), recreated);
          }
          expect(metrics, `${id}: ${label}`).toMatchObject({
            layout: null,
            outsideIcons: 0,
          });
          expect(
            metrics.iconMaxChannelDelta,
            `${id}: ${label} SVG antialiasing`,
          ).toBeLessThanOrEqual(6);
        };
        await compare("initial view");
        if (id === "customer-carousel") {
          for (const i of [1, 2, 3, 0]) {
            await Promise.all(
              [ref, actual].map(async (root) => {
                await next(root).click();
                await settled(root, i, 4);
              }),
            );
            await compare(`item ${i + 1}`);
          }
        }
        expect(errors).toEqual([]);
      } finally {
        await Promise.all([original.close(), candidate.close()]);
      }
    }
  });
}

for (const [path, total] of [
  [base + "customer-carousel/", 4],
  ["/products/folio/#demo-customer-carousel", 3],
] as const) {
  test(`mobile swipe snaps to the next testimonial (${total} cards)`, async ({
    browser,
    browserName,
    baseURL,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Input.dispatchTouchEvent is Chromium-specific.",
    );
    const context = await browser.newContext({
      baseURL,
      isMobile: true,
      hasTouch: true,
      viewport: { width: 390, height: 900 },
    });
    try {
      const page = await context.newPage();
      await open(page, path);
      const carousel = view(page).first();
      await track(carousel).scrollIntoViewIfNeeded();
      const bounds = (await track(carousel).boundingBox())!;
      const client = await context.newCDPSession(page);
      const y = Math.round(bounds.y + bounds.height / 2);
      const start = Math.round(bounds.x + bounds.width - 15),
        end = Math.round(bounds.x + 15);
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: start, y }],
      });
      for (let step = 1; step <= 12; step++) {
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            { x: Math.round(start + ((end - start) * step) / 12), y },
          ],
        });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() => resolve()),
            ),
        );
      }
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await settled(carousel, 1, total);
    } finally {
      await context.close();
    }
  });
}
