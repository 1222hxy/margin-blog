import { expect, test } from "@playwright/test";
import { openVideoPage, product, readyVideo } from "./helpers/video";

test("product media tabs switch real videos with archival ratios and unmount the inactive panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openVideoPage(page, product + "#demo-mechanical-design");
  const group = page.locator("#mechanical-design-examples");
  const first = group.getByRole("tab", { name: "初稿", exact: true });
  const second = group.getByRole("tab", { name: "复核稿", exact: true });
  const draft = await readyVideo(page, "#video-structure-draft");
  await expect(draft.locator("video")).toHaveJSProperty("paused", false);
  await expect(draft.locator("[data-video-container]")).toHaveCSS(
    "aspect-ratio",
    "16 / 9",
  );
  await first.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(group.getByRole("tabpanel")).toHaveAccessibleName("复核稿");
  await expect(draft).toHaveCount(0);
  const review = await readyVideo(page, "#video-structure-review");
  await expect(review.locator("[data-video-container]")).toHaveCSS(
    "aspect-ratio",
    "2 / 1",
  );
  await expect(review.locator("video")).toHaveJSProperty("paused", false);
  await expect(review.locator("figcaption")).toContainText("Mock · 复核稿");
  expect(errors).toEqual([]);
});

test("portrait demo switches to a working local iframe with fullscreen and focus return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openVideoPage(page, product + "#demo-lamp-design");
  const group = page.locator("#lamp-design-examples");
  const portrait = await readyVideo(page, "#video-design-process");
  await expect(portrait.locator("[data-video-container]")).toHaveCSS(
    "aspect-ratio",
    "9 / 16",
  );
  await expect(portrait.locator("video")).toHaveJSProperty("loop", true);
  await group.getByRole("tab", { name: "交互预览" }).click();
  await expect(group.getByRole("tabpanel")).toHaveAccessibleName("交互预览");
  await expect(portrait).toHaveCount(0);
  const iframe = group.locator('iframe[title="Mock · 设计过程交互预览"]');
  await expect(iframe).toHaveAttribute("src", "/yhklab/demos/design/");
  await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  const preview = iframe.contentFrame();
  const range = preview.getByRole("slider", { name: "显示节点数" });
  await range.press("End");
  await expect(preview.getByRole("status")).toHaveText("5 个节点");
  const open = group.getByRole("button", { name: "进入交互式全屏" });
  await open.click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.fullscreenElement?.getAttribute("data-badge-backdrop"),
      ),
    )
    .toBe("iframe");
  await group.getByRole("button", { name: "退出交互式全屏" }).click();
  await expect(open).toBeFocused();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
});

test("a shared scene video selects its associated tab and the scene link stays local", async ({
  page,
}) => {
  await openVideoPage(page, product);
  await page.goto(product + "?video=video-scene-nodes");
  const modal = page.locator("dialog[open] #modal-portal video");
  await expect(modal).toHaveAttribute("aria-label", /节点场景/);
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  const group = page.locator("#frontend-examples");
  await expect(group.getByRole("tabpanel")).toHaveAccessibleName("节点场景");
  const link = group.getByRole("link", { name: /打开节点场景/ });
  await expect(link).toHaveAttribute("href", "/yhklab/demos/nodes/");
  const [demo] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  await expect(
    demo.getByRole("heading", { name: "Mock · 节点场景" }),
  ).toBeVisible();
  await demo.close();
  for (const id of ["web-design", "cad-showcase"]) {
    const standalone = await readyVideo(page, `#video-${id}`);
    await expect(standalone.locator("[data-video-container]")).toHaveCSS(
      "aspect-ratio",
      "16 / 9",
    );
    await expect(standalone.locator("video")).toHaveJSProperty("loop", true);
  }
});
