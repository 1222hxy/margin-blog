import { expect, test, type Page } from "@playwright/test";
import {
  chartId,
  fixtureChart,
  openChartArticle,
  replaceWithCandidate,
} from "./helpers/chart-candidate";

import {
  referenceChartDist,
  useArchivedChartBuild,
} from "./helpers/chart-source-build";

const plot = (page: Page) => page.locator(`#${chartId} svg.marks`);
const tooltip = (page: Page) =>
  page.locator("[data-dotcom-chart-tooltip-scope]");
const normalized = (s: string) => s.replace(/clip\d+/g, "clip");

async function tooltipSnapshot(page: Page) {
  await page.mouse.move(2, 2);
  const bar = plot(page).locator("[aria-roledescription=bar]").first();
  const position = await bar.boundingBox();
  if (!position) throw new Error("Chart bar has no geometry.");
  const x = position.x + position.width / 2;
  const y = position.y + position.height / 2;
  await page.mouse.move(x, y, { steps: 8 });
  const bubble = tooltip(page);
  await expect(bubble.getByText("采集", { exact: true })).toBeVisible();
  return bubble.evaluate(
    (el, { x, y }) => {
      const panel = el.lastElementChild!;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(panel);
      return {
        relative: [rect.x - x, rect.y - y],
        size: [rect.width, rect.height],
        body: panel.innerHTML,
        colors: [style.backgroundColor, style.color],
        radius: style.borderRadius,
        font: style.fontFamily,
      };
    },
    { x, y },
  );
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`source chart reflows and matches the ${colorScheme} pointer tooltip`, async ({
    browser,
  }) => {
    test.skip(!referenceChartDist, "Build the archived chart comparator.");
    const pageOptions = { viewport: { width: 390, height: 900 }, colorScheme };
    const reference = await browser.newPage(pageOptions);
    const candidate = await browser.newPage(pageOptions);
    try {
      await useArchivedChartBuild(reference);
      await useArchivedChartBuild(candidate);
      await Promise.all([
        openChartArticle(reference),
        openChartArticle(candidate),
      ]);
      await replaceWithCandidate(candidate);
      const snapshot = async (page: Page) => {
        await expect
          .poll(() =>
            plot(page).evaluate((el) => [
              Number(el.getAttribute("width")) - el.parentElement!.clientWidth,
              Number(el.getAttribute("height")) -
                el.parentElement!.clientHeight,
            ]),
          )
          .toEqual([0, 0]);
        const state = await plot(page).evaluate((el) => {
          const bar = getComputedStyle(
            el.querySelector("[aria-roledescription=bar]")!,
          );
          const label = getComputedStyle(el.querySelector("text")!);
          return {
            svg: el.outerHTML,
            colors: [bar.fill, bar.stroke, label.fill],
          };
        });
        return { ...state, svg: normalized(state.svg) };
      };
      const pages = [reference, candidate];
      for (const width of [390, 768, 1440, 390]) {
        await Promise.all(
          pages.map(async (page) => {
            await page.setViewportSize({ width, height: 900 });
            await page
              .locator(`#${chartId}`)
              .evaluate((el) =>
                el.scrollIntoView({ block: "center", behavior: "instant" }),
              );
          }),
        );
        const [expected, actual] = await Promise.all(pages.map(snapshot));
        expect(actual).toEqual(expected);
      }
      // Change the containing column without dispatching a window resize.
      for (const width of ["85%", ""]) {
        await Promise.all(
          pages.map((page) =>
            page.locator(`#${chartId}`).evaluate((anchor, width) => {
              (
                anchor.closest("[data-figure-content]") as HTMLElement
              ).style.width = width;
            }, width),
          ),
        );
        const [expected, actual] = await Promise.all(pages.map(snapshot));
        expect(actual).toEqual(expected);
      }
      const [original, source] = await Promise.all([
        tooltipSnapshot(reference),
        tooltipSnapshot(candidate),
      ]);
      expect({ ...source, relative: [] }).toEqual({
        ...original,
        relative: [],
      });
      source.relative.forEach((value, index) =>
        expect(Math.abs(value - original.relative[index])).toBeLessThan(1),
      );
      await candidate.evaluate(() => window.scrollBy(0, 80));
      await expect(tooltip(candidate)).toHaveCount(0);
    } finally {
      await Promise.all([reference.close(), candidate.close()]);
    }
  });
}

test("source chart lazily loads near the viewport", async ({ page }) => {
  await fixtureChart(page, "offscreen");
  await page.evaluate(() => new Promise((done) => setTimeout(done, 250)));
  await expect(page.locator("svg.marks")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "counters").loads)).toBe(
    0,
  );
  await page.evaluate(() => window.scrollTo(0, 2600));
  await expect(page.locator("svg.marks")).toBeAttached();
  expect(await page.evaluate(() => Reflect.get(window, "counters").loads)).toBe(
    1,
  );
});

test("source chart restores the hash anchor after loading", async ({
  page,
}) => {
  await fixtureChart(page, "hash");
  await expect(page.locator("#chart-fixture svg.marks")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#chart-fixture")
        .evaluate((node) => node.getBoundingClientRect().top),
    )
    .toBe(0);
});

test("source chart preloads a staged panel without claiming the visible anchor", async ({
  page,
}) => {
  await fixtureChart(page, "staged");
  await expect(page.locator("svg.marks")).toBeAttached();
  await expect(page.locator("#chart-fixture")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "counters")))
    .toEqual({ loads: 1, deferred: 1, released: 1 });
  await page.evaluate(() => Reflect.get(window, "chart").setStage(undefined));
  await expect(page.locator("#chart-fixture svg.marks")).toBeAttached();
  await page.evaluate(() => Reflect.get(window, "chart").dispose());
  await expect(page.locator("#chart-fixture svg.marks")).toHaveCount(0);
  await expect(page.locator("#chart-fixture")).toHaveCSS("height", "400px");
});

test("source chart matches the mobile tap tooltip and outside dismissal", async ({
  browser,
}) => {
  test.skip(!referenceChartDist, "Build the archived chart comparator.");
  const options = {
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
  };
  const reference = await browser.newPage(options);
  const candidate = await browser.newPage(options);
  try {
    await useArchivedChartBuild(reference);
    await useArchivedChartBuild(candidate);
    await Promise.all([
      openChartArticle(reference),
      openChartArticle(candidate),
    ]);
    await replaceWithCandidate(candidate);
    const tap = async (page: Page) => {
      const bounds = await plot(page)
        .locator("[aria-roledescription=bar]")
        .first()
        .boundingBox();
      if (!bounds) throw new Error("Chart bar is missing.");
      const x = bounds.x + bounds.width / 2,
        y = bounds.y + bounds.height / 2;
      await page.touchscreen.tap(x, y);
      await expect(
        tooltip(page).getByText("采集", { exact: true }),
      ).toBeVisible();
      const box = await tooltip(page).boundingBox();
      if (!box) throw new Error("Tooltip geometry is missing.");
      expect(box.y + box.height).toBeLessThan(y);
      return y - (box.y + box.height);
    };
    expect(
      Math.abs((await tap(reference)) - (await tap(candidate))),
    ).toBeLessThan(1);
    await candidate.touchscreen.tap(12, 110);
    await expect(tooltip(candidate)).toHaveCount(0);
  } finally {
    await Promise.all([reference.close(), candidate.close()]);
  }
});
