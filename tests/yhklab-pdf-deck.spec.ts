import { expect, test, type Locator } from "@playwright/test";
import { openVideoPage, product } from "./helpers/video";

const activeDecks = (root: Locator) =>
  root.getByRole("tabpanel").locator('div[aria-roledescription="轮播"]');
async function ready(deck: Locator) {
  await deck.scrollIntoViewIfNeeded();
  await expect(deck).toHaveAttribute("aria-busy", "false");
  await expect(deck.locator("[data-pdf-painted]")).toHaveCount(1);
}

test("comparison lazily loads real PDFs, keeps independent pages and shows a full keyboard-accessible viewer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [],
    errors: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".pdf"))
      requests.push(new URL(request.url()).pathname);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await openVideoPage(page, product + "#demo-workbook-comparison");
  const root = page.locator("#workbook-and-memo-examples");
  const first = activeDecks(root).first(),
    second = activeDecks(root).last();
  await expect(root.getByRole("tab")).toHaveCount(4);
  await ready(first);
  await ready(second);
  expect(requests).toEqual(
    expect.arrayContaining([
      "/yhklab/decks/records-before.pdf",
      "/yhklab/decks/records-after.pdf",
    ]),
  );
  expect(
    requests.some(
      (url) =>
        url.includes("experiment-") ||
        url.includes("memo-") ||
        url.includes("checklist-"),
    ),
  ).toBe(false);
  await expect(
    first.getByRole("button", { name: "上一张幻灯片" }),
  ).toBeDisabled();
  await expect(first.locator(".yhklab-pdf-text")).toContainText("整理记录");
  await first.getByRole("button", { name: "下一张幻灯片" }).click();
  await expect(first.locator(".yhklab-pdf-text")).toContainText("复核说明");
  await expect(first.getByRole("group")).toHaveAccessibleName(
    "第 2 张幻灯片，共 2 张",
  );
  await expect(second.getByRole("group")).toHaveAccessibleName(
    "第 1 张幻灯片，共 2 张",
  );
  await expect(
    first.getByRole("button", { name: "下一张幻灯片" }),
  ).toBeDisabled();
  const show = first.getByRole("button", { name: "显示幻灯片缩略图" });
  await show.click();
  const rail = first.getByRole("navigation", { name: "幻灯片缩略图" });
  const thumbnail = rail.getByRole("button", { name: "前往幻灯片 2" });
  await expect(thumbnail).toBeFocused();
  await expect(thumbnail).toHaveAttribute("aria-current", "page");
  await expect(rail.locator("[data-pdf-painted]")).toHaveCount(2);
  await thumbnail.press("Home");
  const firstThumbnail = rail.getByRole("button", { name: "前往幻灯片 1" });
  await expect(firstThumbnail).toBeFocused();
  await expect(firstThumbnail).toHaveAttribute("aria-current", "page");
  await firstThumbnail.press("Escape");
  await expect(show).toBeFocused();
  const full = first.getByRole("button", { name: "进入全屏" });
  await full.click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await first.getByRole("button", { name: "退出全屏" }).click();
  await expect(full).toBeFocused();
  await first.getByRole("group").press("End");
  await expect(first.getByRole("group")).toHaveAccessibleName(
    "第 2 张幻灯片，共 2 张",
  );
  await root.getByRole("tab", { name: "备忘录", exact: true }).click();
  await expect(root.getByRole("tabpanel")).toHaveAccessibleName("备忘录");
  await ready(first);
  await expect(first.locator(".yhklab-pdf-text")).toContainText("复核备忘录");
  await root.getByRole("tab", { name: "工作簿", exact: true }).click();
  await expect(root.getByRole("tabpanel")).toHaveAccessibleName("工作簿");
  await expect(first.getByRole("group")).toHaveAccessibleName(
    "第 2 张幻灯片，共 2 张",
  );
  expect(errors).toEqual([]);
});

test("slide comparison stacks decks on narrow screens and the rail opens below the page", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openVideoPage(page, product + "#demo-slide-comparison");
  const group = page.locator("#professional-work-examples");
  await expect(group.getByRole("tab")).toHaveCount(4);
  const [first, second] = await activeDecks(group).all();
  await ready(first);
  const [a, b] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(a && b && b.y >= a.y + a.height && a.x === b.x).toBeTruthy();
  await first.getByRole("button", { name: "显示幻灯片缩略图" }).click();
  const rail = first.getByRole("navigation", { name: "幻灯片缩略图" });
  await expect(rail).toBeVisible();
  await expect
    .poll(async () => (await rail.boundingBox())?.height ?? 0)
    .toBeGreaterThanOrEqual(158);
  const visibleSlide = await first.getByRole("group").boundingBox();
  expect(visibleSlide!.y).toBeLessThan((await rail.boundingBox())!.y);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
  const fallback = await browser.newPage({ baseURL, javaScriptEnabled: false });
  try {
    await fallback.goto(product);
    const noScriptDeck = activeDecks(
      fallback.locator("#professional-work-examples"),
    ).first();
    await expect(noScriptDeck.locator("img")).toHaveAttribute(
      "src",
      "/yhklab/decks/overview-before.webp",
    );
    await expect(
      fallback
        .locator("#pdf-overview-before")
        .getByRole("link", { name: "打开 PDF" }),
    ).toHaveAttribute("href", "/yhklab/decks/overview-before.pdf");
  } finally {
    await fallback.close();
  }
});
