import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { openVideoPage, product } from "./helpers/video";

const examples = {
  workbook: {
    groupId: "#workbook-and-memo-examples",
    sample: "/yhklab/decks/records-before.pdf",
  },
  slide: {
    groupId: "#professional-work-examples",
    sample: "/yhklab/decks/overview-before.pdf",
  },
};
type Kind = keyof typeof examples;

async function measure(page: Page, kind: Kind, original: boolean) {
  const { groupId } = examples[kind];
  const source = `/themes/openai/astra-sol/components/${kind}-comparison/`;
  await openVideoPage(page, (original ? source : product) + groupId);
  const active = page.locator(groupId).getByRole("tabpanel");
  const deck = active
    .locator(
      original
        ? "figure.col-span-full.font-sans"
        : '[aria-roledescription="轮播"]',
    )
    .first();
  await deck.scrollIntoViewIfNeeded();
  const next = deck.getByRole("button", { name: "下一张幻灯片" });
  await next.click();
  const slide = deck.getByRole("group", { name: "第 2 张幻灯片，共 2 张" });
  const canvas = slide.locator(
    original ? "canvas:visible" : "[data-pdf-painted] canvas:visible",
  );
  await expect(canvas).toBeVisible();
  const metrics = await canvas.evaluate((node: HTMLCanvasElement) => ({
    size: [node.offsetWidth, node.offsetHeight],
    bitmap: [node.width, node.height],
    image: node.toDataURL(),
  }));
  const bounds = (el: Locator) =>
    el.evaluate((node) => [node.clientWidth, node.clientHeight]);
  return {
    ...metrics,
    frame: await bounds(deck),
    toolbar: await bounds(next.locator("xpath=../..")),
  };
}

const sizes = [
  [390, 1],
  [390, 1.5],
  [768, 1],
  [1440, 1],
];
for (const kind of ["workbook", "slide"] as const) {
  const { sample } = examples[kind];
  const fixture = readFileSync(
    new URL(`./fixtures/pdf-${kind}-parity.pdf`, import.meta.url),
  );
  for (const [width, dpr] of sizes) {
    test(`the same ${kind} PDF matches canvas and toolbar at ${width}px / ${dpr}×`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 960 },
        deviceScaleFactor: dpr,
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage();
        await page.route(
          (url) =>
            url.pathname.startsWith("/__cdn_openai_com_____/pdf/") ||
            url.pathname === sample,
          (route) =>
            route.fulfill({ contentType: "application/pdf", body: fixture }),
        );
        const { image: original, ...reference } = await measure(
          page,
          kind,
          true,
        );
        const { image: candidate, ...metrics } = await measure(
          page,
          kind,
          false,
        );
        expect(metrics).toEqual(reference);
        expect(
          candidate === original,
          "the rendered PDF canvas pixels differ",
        ).toBe(true);
      } finally {
        await context.close();
      }
    });
  }
}
