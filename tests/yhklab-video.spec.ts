import { expect, test } from "@playwright/test";
import {
  article,
  driving,
  intro,
  openVideoPage,
  product,
  readyVideo,
} from "./helpers/video";

test("product video supports playback, keyboard scrubbing, controls and fullscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openVideoPage(page, product + "#demo-intro-video");
  const root = await readyVideo(page, intro);
  const video = root.locator("video");
  const frame = root.locator("[data-badge-controls]");
  const pause = root
    .getByRole("button", { name: "暂停视频", exact: true })
    .first();
  await expect(video).toHaveJSProperty("paused", true);
  await root
    .getByRole("button", { name: "播放视频", exact: true })
    .first()
    .click();
  await expect(video).toHaveJSProperty("paused", false);
  await expect(frame).toHaveAttribute("data-badge-controls", "all");
  await pause.click();
  await expect(video).toHaveJSProperty("paused", true);
  const rail = root.getByRole("slider", { name: "播放进度" });
  await rail.press("ArrowRight");
  await expect(video).toHaveJSProperty("currentTime", 4);
  await rail.press("ArrowLeft");
  await expect(video).toHaveJSProperty("currentTime", 0);
  await root.getByRole("button", { name: "视频静音" }).click();
  await expect(video).toHaveJSProperty("muted", true);
  await root.getByRole("button", { name: "视频设置" }).click();
  await root.getByRole("button", { name: /播放速度/ }).click();
  await root.getByRole("button", { name: "1.5x", exact: true }).click();
  await expect(video).toHaveJSProperty("playbackRate", 1.5);
  await page.keyboard.press("Escape");
  await expect(root.getByRole("button", { name: "视频设置" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  const fullscreen = root.getByRole("button", { name: "全屏", exact: true });
  await fullscreen.press("Enter");
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  await fullscreen.press("Enter");
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(false);
  expect(errors).toEqual([]);
});

test("driving loops only on screen and respects reduced motion", async ({
  page,
}) => {
  await openVideoPage(page, product);
  const root = await readyVideo(page, driving);
  const video = root.locator("video");
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveJSProperty("loop", true);
  await expect(video).toHaveJSProperty("paused", false);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(video).toHaveJSProperty("paused", true);
  await root.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).toHaveJSProperty("paused", true);
  await root
    .getByRole("button", { name: "播放视频", exact: true })
    .first()
    .click();
  await expect(video).toHaveJSProperty("paused", false);
});

test("product settings download local bytes and link to the same player", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openVideoPage(page, product);
  const root = await readyVideo(page, intro);
  await root.getByRole("button", { name: "视频设置" }).click();
  const link = root.getByRole("link", { name: /下载视频/ });
  await expect(link).toHaveAttribute("href", "/yhklab/path.webm");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    link.click(),
  ]);
  expect(download.suggestedFilename()).toBe("path.webm");
  expect(await download.failure()).toBeNull();
  await root.getByRole("button", { name: "复制链接" }).click();
  await expect(root.getByRole("button", { name: "已复制链接" })).toBeVisible();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(shared).searchParams.get("video")).toBe("video-intro-video");
  await page.goto(shared);
  const video = page.locator("dialog[open] #modal-portal video");
  await expect(video).toBeVisible();
  await expect(video.locator("source")).toHaveAttribute(
    "src",
    "/yhklab/path.webm",
  );
  await page.keyboard.press("Escape");
  await expect(video).toHaveCount(0);
});

test("article uses the same player and preserves a no-script fallback", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openVideoPage(page, article);
  const selector = 'figure[id^="lab-video-"]';
  const root = await readyVideo(page, selector);
  await expect(root.locator("figcaption")).toHaveText(
    "Mock 无声演示：节点依次连成路径",
  );
  await expect(root.getByRole("button", { name: "视频设置" })).toBeHidden();
  await root
    .getByRole("button", { name: "播放视频", exact: true })
    .first()
    .click();
  await expect(root.locator("video")).toHaveJSProperty("paused", false);
  await expect(root.getByRole("button", { name: "视频设置" })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
  const fallback = await browser.newPage({ baseURL, javaScriptEnabled: false });
  try {
    await fallback.goto(article);
    const video = fallback.locator(selector + " video");
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("poster", "/yhklab/graph.svg");
    await expect(video.locator("source")).toHaveAttribute(
      "src",
      "/yhklab/path.webm",
    );
  } finally {
    await fallback.close();
  }
});
