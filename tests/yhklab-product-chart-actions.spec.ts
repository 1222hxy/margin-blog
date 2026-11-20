import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { referenceChartDist } from "./helpers/chart-source-build";
import {
  archivedProduct,
  benchmarkIds,
  normalizeChartSvg,
  openBenchmark,
  openProduct,
} from "./helpers/product-chart";

const optionsButton = (chart: Locator) =>
  chart.getByRole("button", { name: "图表选项" });
const menu = (page: Page) => page.getByRole("menu", { name: "图表选项" });

async function save(page: Page, chart: Locator, ext: "svg" | "png") {
  await optionsButton(chart).click();
  const file = page.waitForEvent("download");
  await menu(page)
    .getByRole("menuitem", { name: `下载 ${ext.toUpperCase()}` })
    .click();
  const download = await file;
  expect(download.suggestedFilename()).toBe(`chart.${ext}`);
  await expect(menu(page)).toBeHidden();
  return readFile(await download.path());
}

test("Folio line keeps its product tooltip and downloadable image bytes", async ({
  browser,
  baseURL,
}) => {
  test.skip(!referenceChartDist, "Build the archived chart comparator.");
  const options = {
    baseURL,
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
    permissions: ["clipboard-read", "clipboard-write"],
  };
  const original = await browser.newPage(options);
  const revised = await browser.newPage(options);
  const id = benchmarkIds[0];
  try {
    await archivedProduct(original);
    await Promise.all([openProduct(original), openProduct(revised)]);
    const oldChart = await openBenchmark(original, id);
    const newChart = await openBenchmark(revised, id);
    const content = [];
    for (const [page, chart] of [
      [original, oldChart],
      [revised, newChart],
    ] as const) {
      const symbol = chart
        .locator('path[aria-roledescription="point"]')
        .first();
      await symbol.hover();
      const bubble = page.locator("[data-dotcom-chart-tooltip-scope]");
      await expect(bubble).toContainText("采集");
      await expect(bubble).toContainText("26");
      content.push(await bubble.locator("dl").innerText());
      await page.mouse.move(0, 0);
      await expect(bubble).toHaveCount(0);
    }
    expect(content[1]).toEqual(content[0]);
    const svg = await save(revised, newChart, "svg");
    expect(normalizeChartSvg(svg.toString())).toEqual(
      normalizeChartSvg((await save(original, oldChart, "svg")).toString()),
    );
    const png = await save(revised, newChart, "png");
    expect(png.equals(await save(original, oldChart, "png"))).toBe(true);
    await revised.bringToFront();
    await optionsButton(newChart).click();
    await menu(revised).getByRole("menuitem", { name: "复制链接" }).click();
    await expect
      .poll(() => revised.evaluate(() => navigator.clipboard.readText()))
      .toBe(`${revised.url()}#${id}`);
  } finally {
    await Promise.all([original.close(), revised.close()]);
  }
});
