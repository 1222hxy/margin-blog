import { expect, type Page } from "@playwright/test";

export const intro = "#video-intro-video";
export const driving = "#video-driving-demo";
export const product = "/products/folio/";
export const article = "/notes/reading-a-graph/";

export async function openVideoPage(page: Page, path: string) {
  await page.goto(path);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ state: "visible", timeout: 2400 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
}

export async function readyVideo(page: Page, selector: string) {
  const root = page.locator(selector);
  await expect(root.locator("video")).toHaveJSProperty("controls", false);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator("video")).toHaveJSProperty("duration", 4);
  return root;
}
