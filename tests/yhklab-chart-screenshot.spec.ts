import { expect, test, type Page } from "@playwright/test";
import { chartId, openChartArticle } from "./helpers/chart-candidate";
import {
  referenceChartDist,
  sourceChartDist,
  useArchivedChartBuild,
  useSourceChartBuild,
} from "./helpers/chart-source-build";

for (const width of [390, 768, 1440]) {
  test(`compiled chart and menu screenshots match at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    test.skip(
      !referenceChartDist || !sourceChartDist,
      "Build both chart test variants and set their dist paths.",
    );
    const options = {
      baseURL,
      viewport: { width, height: 900 },
      reducedMotion: "reduce" as const,
    };
    const reference = await browser.newPage(options);
    const candidate = await browser.newPage(options);
    try {
      await useArchivedChartBuild(reference);
      await useSourceChartBuild(candidate, sourceChartDist!);
      const capture = async (page: Page) => {
        await openChartArticle(page);
        const chart = page.locator(`#${chartId}`);
        const trigger = chart.getByRole("button", { name: "Chart options" });
        await expect(trigger).toHaveCSS("opacity", "0");
        const closed = await chart.screenshot({ animations: "disabled" });
        await trigger.click();
        const open = await page
          .getByRole("menu")
          .screenshot({ animations: "disabled" });
        return { closed, open };
      };
      const original = await capture(reference);
      const source = await capture(candidate);
      expect(source.closed).toEqual(original.closed);
      expect(source.open).toEqual(original.open);
    } finally {
      await Promise.all([reference.close(), candidate.close()]);
    }
  });
}
