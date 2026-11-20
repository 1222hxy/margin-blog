import { expect, type Locator, type Page } from "@playwright/test";
import { resolve } from "node:path";
import { referenceChartDist } from "./chart-source-build";

export const productRoute = "/products/folio/";
export const benchmarkIds = [
  "agents-last-exam",
  "science-benchmarks",
  "intelligence-benchmarks",
  "frontier-code",
  "lifeval",
  "harvey-lab",
  "gdpval",
  "security-benchmarks",
  "patch-benchmarks",
  "alignment-benchmarks",
].map((id) => `chart-${id}-0`);
export const normalizeChartSvg = (text: string) =>
  text.replace(/clip\d+/g, "clip");

export async function archivedProduct(page: Page) {
  if (!referenceChartDist)
    throw new Error("Missing archived comparison build.");
  const path = resolve(referenceChartDist, `.${productRoute}index.html`);
  await page.route(`**${productRoute}`, (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      path,
    }),
  );
}

export async function openProduct(page: Page) {
  await page.goto(productRoute);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ state: "visible", timeout: 2500 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  await page.evaluate(() => document.fonts.ready);
}

export async function openBenchmark(page: Page, id: string) {
  const chart = page.locator(`#${id}`);
  await chart.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(chart.locator("svg.marks")).toBeVisible();
  return chart;
}

export async function benchmarkSnapshot(chart: Locator) {
  const plot = chart.locator("svg.marks");
  return plot.evaluate((el) => ({
    svg: el.outerHTML.replace(/clip\d+/g, "clip"),
    colors: [...el.querySelectorAll(".role-mark path[aria-label]")].map(
      (mark) => {
        const style = getComputedStyle(mark);
        return [style.fill, style.stroke];
      },
    ),
  }));
}
