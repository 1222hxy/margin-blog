import { expect, test, type Page } from "@playwright/test";
import { referenceChartDist } from "./helpers/chart-source-build";
import {
  archivedProduct,
  benchmarkIds,
  openBenchmark,
  openProduct,
} from "./helpers/product-chart";

async function capture(page: Page, id: string, width: number) {
  await openProduct(page);
  const chart = await openBenchmark(page, id);
  await page.mouse.move(width - 5, 10);
  await chart.evaluate(async (el) => {
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY - 320,
      behavior: "instant",
    });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  const plot = await chart
    .locator("svg.marks")
    .screenshot({ animations: "disabled" });
  await chart.getByRole("button", { name: "图表选项" }).click();
  const menu = page.getByRole("menu", { name: "图表选项" });
  await expect(menu.getByRole("menuitem")).toHaveText([
    "下载 PNG",
    "下载 SVG",
    "复制链接",
  ]);
  return { plot, menu: await menu.screenshot({ animations: "disabled" }) };
}

for (const width of [390, 768, 1440]) {
  for (const [mark, id] of [
    ["line", benchmarkIds[0]],
    ["bar", benchmarkIds[1]],
  ] as const) {
    test(`Folio ${mark} and menu have identical isolated screenshots at ${width}px`, async ({
      browser,
      baseURL,
    }) => {
      test.skip(!referenceChartDist, "Build the archived chart comparator.");
      const options = {
        baseURL,
        viewport: { width, height: 900 },
        reducedMotion: "reduce" as const,
      };
      // Each screenshot uses a fresh page. Earlier chart resize or open-menu
      // compositor work can otherwise result in a different raster clip phase.
      const original = await browser.newPage(options);
      const revised = await browser.newPage(options);
      try {
        await archivedProduct(original);
        const oldShot = await capture(original, id, width);
        const newShot = await capture(revised, id, width);
        expect(newShot.plot.equals(oldShot.plot), "plot raster").toBe(true);
        expect(newShot.menu.equals(oldShot.menu), "menu raster").toBe(true);
      } finally {
        await Promise.all([original.close(), revised.close()]);
      }
    });
  }
}
