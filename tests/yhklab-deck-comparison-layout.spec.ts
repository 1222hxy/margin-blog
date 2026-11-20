import { expect, test, type Locator, type Page } from "@playwright/test";
import { openVideoPage, product } from "./helpers/video";

const source = (component: string) =>
  `/themes/openai/astra-sol/components/${component}/`;
const pair = 'section[data-layout="2-column-grid"]';

async function tabPanelFor(page: Page, group: string, tabIndex: number) {
  const button = page.locator(`#${group}`).getByRole("tab").nth(tabIndex);
  const panelId = await button.getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  return page.locator(`[id=${JSON.stringify(panelId)}]`);
}

function panelShape(panel: Locator) {
  return panel.evaluate((el, pair) => {
    const decks = el.querySelector(pair)!;
    const stack = decks.closest("section[data-multi-columns]")!.parentElement!
      .parentElement!.parentElement!;
    const divs = [...stack.children];
    return {
      layout: stack.className,
      columns: decks.getAttribute("data-multi-columns"),
      grid: decks.firstElementChild?.firstElementChild?.className,
      slots: divs.map((block) => [
        block.className,
        block.contains(decks)
          ? "pair"
          : block.querySelector("figure")
            ? "figure"
            : block.querySelector("p > em")
              ? "note"
              : "other",
      ]),
      noteStyles: divs.flatMap((block) =>
        [...block.querySelectorAll("p:has(> em)")].map((p) => p.className),
      ),
    };
  }, pair);
}

for (const width of [390, 768, 1440]) {
  test(`comparison slots use the source structure at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 920 });
    const layouts = [
      {
        id: "workbook-comparison",
        group: "workbook-and-memo-examples",
        index: 0,
      },
      { id: "slide-comparison", group: "professional-work-examples", index: 1 },
    ];
    const archive = [];
    for (const { id, group, index } of layouts) {
      await openVideoPage(page, source(id));
      const panel = await tabPanelFor(page, group, index);
      await expect(panel.locator(pair)).toBeAttached();
      archive.push(await panelShape(panel));
    }
    await openVideoPage(page, product);
    for (const [i, { id, group, index }] of layouts.entries()) {
      const tabs = page.locator(`#${group}`);
      const intro = tabs.locator("xpath=../../preceding-sibling::*[1]");
      await expect(intro.locator("p")).toContainText("Mock ·");
      const panel = await tabPanelFor(page, group, index);
      await expect(panel.locator(pair)).toBeAttached();
      expect(await panelShape(panel)).toEqual(archive[i]);
      if (id === "slide-comparison") {
        await tabs.getByRole("tab", { name: "模板匹配", exact: true }).click();
        await expect(panel).toBeVisible();
        const figure = panel.locator("figure");
        const image = figure.getByRole("img", { name: /Mock · 参考幻灯片/ });
        await expect(figure.locator("p")).toContainText("Mock ·");
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("naturalWidth", 1678);
        const columns = panel.locator(`${pair} h4`);
        const [left, right] = await Promise.all(
          (await columns.all()).map((col) => col.boundingBox()),
        );
        if (width === 390) {
          expect(left!.x).toEqual(right!.x);
          expect(left!.y).toBeLessThan(right!.y);
        } else {
          expect(left!.x).toBeLessThan(right!.x);
          expect(left!.y).toEqual(right!.y);
        }
        await expect(page.locator("html")).toHaveJSProperty(
          "scrollWidth",
          width,
        );
      }
    }
  });
}
