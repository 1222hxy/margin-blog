import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { chartId, openChartArticle } from "./helpers/chart-candidate";
import {
  sourceChartDist,
  referenceChartDist,
  useArchivedChartBuild,
  useSourceChartBuild,
} from "./helpers/chart-source-build";

const trigger = (page: Page) =>
  page.locator(`#${chartId}`).getByRole("button", { name: "Chart options" });
const menu = (page: Page) => page.getByRole("menu", { name: "Chart options" });
const items = ["Download PNG", "Download SVG", "复制链接"];

async function openWithKeyboard(page: Page) {
  await trigger(page).focus();
  await trigger(page).press("Enter");
  await expect(menu(page)).toBeVisible();
  await expect(
    menu(page).getByRole("menuitem", { name: items[0] }),
  ).toBeFocused();
}

for (const [width, colorScheme] of [
  [390, "light"],
  [1440, "dark"],
] as const) {
  test(`runtime chart menu matches the reference trigger, placement and keyboard · ${width} ${colorScheme}`, async ({
    browser,
    baseURL,
  }) => {
    test.skip(
      !sourceChartDist || !referenceChartDist,
      "Build both chart test variants and set their dist paths.",
    );
    const options = {
      baseURL,
      colorScheme,
      viewport: { width, height: 900 },
      reducedMotion: "reduce" as const,
    };
    const reference = await browser.newPage(options);
    const candidate = await browser.newPage(options);
    const errors: string[] = [];
    candidate.on("pageerror", (error) => errors.push(error.message));
    try {
      await useArchivedChartBuild(reference);
      await useSourceChartBuild(candidate, sourceChartDist!);
      await Promise.all([
        openChartArticle(reference),
        openChartArticle(candidate),
      ]);
      for (const page of [reference, candidate]) {
        await expect(trigger(page)).toHaveCSS("opacity", "0");
        await trigger(page).hover();
        await expect(trigger(page)).toHaveCSS("opacity", "1");
        await openWithKeyboard(page);
        await expect(menu(page).getByRole("menuitem")).toHaveText(items);
        await page.keyboard.press("ArrowDown");
        await expect(
          menu(page).getByRole("menuitem", { name: items[1] }),
        ).toBeFocused();
      }
      const snapshot = async (page: Page) => {
        const button = (await trigger(page).boundingBox())!;
        const panel = (await menu(page).boundingBox())!;
        const css = await menu(page).evaluate(async (node) => {
          const highlighted = node.querySelector("[data-highlighted]")!;
          await Promise.allSettled(
            highlighted.getAnimations().map((animation) => animation.finished),
          );
          const style = getComputedStyle(node);
          const item = getComputedStyle(highlighted);
          return [
            style.backgroundColor,
            style.color,
            style.padding,
            style.borderRadius,
            style.fontFamily,
            style.fontSize,
            item.backgroundColor,
            node.getAttribute("data-side"),
            node.getAttribute("data-align"),
          ];
        });
        return {
          css,
          dimensions: [
            panel.x - button.x,
            panel.y - button.y,
            panel.width,
            panel.height,
          ],
        };
      };
      const [before, after] = await Promise.all([
        snapshot(reference),
        snapshot(candidate),
      ]);
      expect(after.css).toEqual(before.css);
      after.dimensions.forEach((value, index) =>
        expect(Math.abs(value - before.dimensions[index])).toBeLessThan(1),
      );
      for (const page of [reference, candidate]) {
        await page.keyboard.press("Escape");
        await expect(menu(page)).toBeHidden();
        await expect(trigger(page)).toBeFocused();
        await trigger(page).click();
        await expect(menu(page)).toBeVisible();
        await page.mouse.click(width - 4, 2);
        await expect(menu(page)).toBeHidden();
      }
      expect(errors).toEqual([]);
    } finally {
      await Promise.all([reference.close(), candidate.close()]);
    }
  });
}

test("runtime chart menu copies the anchor and downloads identical SVG and PNG", async ({
  browser,
  baseURL,
}) => {
  test.skip(
    !sourceChartDist || !referenceChartDist,
    "Build both chart test variants and set their dist paths.",
  );
  const options = {
    baseURL,
    viewport: { width: 390, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
    acceptDownloads: true,
  };
  const reference = await browser.newPage(options);
  const candidate = await browser.newPage(options);
  try {
    await useArchivedChartBuild(reference);
    await useSourceChartBuild(candidate, sourceChartDist!);
    await Promise.all([
      openChartArticle(reference),
      openChartArticle(candidate),
    ]);
    const download = async (page: Page, ext: "svg" | "png") => {
      await trigger(page).click();
      const action = menu(page).getByRole("menuitem", {
        name: `Download ${ext.toUpperCase()}`,
      });
      await expect(action).toBeVisible();
      await action.hover();
      const [file] = await Promise.all([
        page.waitForEvent("download"),
        action.click(),
      ]);
      expect(file.suggestedFilename()).toBe(`chart.${ext}`);
      await expect(menu(page)).toBeHidden();
      return readFile(await file.path());
    };
    const [refSvg, sourceSvg] = [
      await download(reference, "svg"),
      await download(candidate, "svg"),
    ];
    const normalize = (bytes: Buffer) =>
      bytes.toString().replace(/clip\d+/g, "clip");
    expect(normalize(sourceSvg)).toBe(normalize(refSvg));
    expect(await download(candidate, "png")).toEqual(
      await download(reference, "png"),
    );
    await candidate.bringToFront();
    await trigger(candidate).click();
    await menu(candidate).getByRole("menuitem", { name: "复制链接" }).click();
    await expect(menu(candidate)).toBeHidden();
    expect(await candidate.evaluate(() => navigator.clipboard.readText())).toBe(
      `${candidate.url()}#${chartId}`,
    );
  } finally {
    await Promise.all([reference.close(), candidate.close()]);
  }
});
