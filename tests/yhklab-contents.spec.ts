import { expect, test, type Locator, type Page } from "@playwright/test";
import { contentsRasterOffsets } from "./helpers/contents-raster";

const article = "/notes/reading-a-graph/";
const reference = "/zh-Hans-CN/index/grid-protectors-program/";
const initial = "先把问题写小";
const second = "一份记录的三个视角";
const third = "读图，也看原始数值";
const last = "留给下一次复核";
const desktop = (page: Page) =>
  page.locator('nav[aria-label="目录"]:not([data-show-toc])');
const mobile = (page: Page) =>
  page.locator('nav[aria-label="目录"][data-show-toc]');

async function gotoArticle(page: Page, path: string) {
  await page.goto(path);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ state: "visible", timeout: 2200 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  await page.evaluate(() => document.fonts.ready);
}

async function jumpToHeading(page: Page, link: Locator) {
  const id = (await link.getAttribute("href"))!.slice(1);
  await page.evaluate(
    (id) =>
      document
        .getElementById(id)!
        .scrollIntoView({ block: "start", behavior: "instant" }),
    id,
  );
}

function geometry(rail: Locator) {
  return rail.evaluate((el) => {
    const [one, two] = el.querySelectorAll("a");
    const railRect = el.getBoundingClientRect();
    const a = one.getBoundingClientRect(),
      b = two.getBoundingClientRect();
    const style = getComputedStyle(one);
    return {
      x: a.x,
      top: getComputedStyle(el).top,
      width: railRect.width,
      rowHeight: a.height,
      rowStep: b.y - a.y,
      rows: [...el.querySelectorAll("a")].map((link) =>
        link.getBoundingClientRect().toJSON(),
      ),
      font: style.fontFamily,
      size: style.fontSize,
      line: style.lineHeight,
      foreground: style.color,
      secondary: getComputedStyle(two).color,
    };
  });
}

async function contentsRows(page: Page, rail: Locator) {
  const clip = await rail.locator("a").evaluateAll((links) => {
    const first = links[0].getBoundingClientRect(),
      end = links.at(-1)!.getBoundingClientRect();
    return {
      x: first.x,
      y: first.y,
      width: Math.round(first.width),
      height: end.bottom - first.top,
    };
  });
  return page.screenshot({ clip, animations: "disabled" });
}

for (const [width, height, deviceScaleFactor] of [
  [768, 900, 1],
  [1440, 900, 1],
  [1707, 875, 1.5],
]) {
  test.describe(`desktop contents · ${width}px at ${deviceScaleFactor}×`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor });
    test(`matches archived geometry and moves its current style`, async ({
      page,
    }) => {
      await gotoArticle(page, reference);
      const rail = desktop(page);
      await jumpToHeading(page, rail.locator("a").first());
      await page.evaluate(() =>
        window.scrollBy({ top: 36, behavior: "instant" }),
      );
      await expect
        .poll(() => rail.evaluate((el) => el.getBoundingClientRect().top))
        .toBe(112);
      await expect(rail).toHaveCSS("opacity", "1");
      // Use the captured white link styles for all four rows, with the same copy.
      // The reference's own TOC only has two rows; duplicate its unselected row.
      await rail.evaluate(
        (nav, copy) => {
          const list = nav.querySelector("ul")!;
          const [current, idle] = Array.from(list.children);
          for (let i = list.children.length; i < copy.length; i++)
            list.append(idle.cloneNode(true));
          current.querySelector("a")!.textContent = copy[0];
          for (let i = 1; i < copy.length; i++)
            list.children[i].querySelector("a")!.textContent = copy[i];
        },
        [initial, second, third, last],
      );
      const expectedGeometry = await geometry(rail);
      const expectedRows = await contentsRows(page, rail);

      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await gotoArticle(page, article);
      await jumpToHeading(page, rail.locator("a").first());
      await page.evaluate(() =>
        window.scrollBy({ top: 36, behavior: "instant" }),
      );
      await expect
        .poll(() => rail.evaluate((el) => el.getBoundingClientRect().top))
        .toBe(112);
      await expect(rail).toHaveCSS("opacity", "1");
      await expect(rail.locator('a[aria-current="true"]')).toHaveText(initial);
      expect(await geometry(rail)).toEqual(expectedGeometry);
      const renderedRows = await contentsRows(page, rail);
      if (deviceScaleFactor === 1) {
        expect(renderedRows.equals(expectedRows)).toBe(true);
      } else {
        const offsets = await contentsRasterOffsets(
          page,
          expectedRows,
          renderedRows,
          4,
        );
        expect(offsets).toHaveLength(4);
        expect(offsets).not.toContain(null);
      }
      await rail.getByRole("link", { name: last, exact: true }).click();
      await page.mouse.move(width - 5, 10);
      const selected = rail.getByRole("link", { name: last, exact: true });
      await expect(selected).toHaveAttribute("aria-current", "true");
      await expect(selected).toHaveCSS("color", expectedGeometry.foreground);
      await expect(
        rail.getByRole("link", { name: initial, exact: true }),
      ).toHaveCSS("color", expectedGeometry.secondary);
      await expect(page).toHaveURL(/\/notes\/reading-a-graph\/$/);
      for (const label of [third, second, initial]) {
        await jumpToHeading(
          page,
          rail.getByRole("link", { name: label, exact: true }),
        );
        await expect(rail.locator('a[aria-current="true"]')).toHaveText(label);
      }
      expect(errors).toEqual([]);
    });
  });
}

test("mobile contents discloses, closes and follows the destination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await gotoArticle(page, article);
  const nav = mobile(page);
  const toggle = nav.locator("button[aria-expanded]");
  const close = nav.getByRole("button", { name: "关闭目录" });
  await expect(nav).toHaveAttribute("inert", "");
  await expect(nav).toHaveCSS("opacity", "0");
  await page.locator("#article-body").evaluate((body) =>
    window.scrollTo({
      top: body.getBoundingClientRect().top + window.scrollY + 20,
      behavior: "instant",
    }),
  );
  await expect(nav).not.toHaveAttribute("inert");
  await expect(toggle).toHaveText(initial);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(close).toBeVisible();
  await close.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await nav.getByRole("link", { name: last, exact: true }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveText(last);
  await expect(page).toHaveURL(/\/notes\/reading-a-graph\/$/);
  expect(errors).toEqual([]);
});
