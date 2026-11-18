import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync(
    new URL("../src/themes/openai/astra-sol/manifest.json", import.meta.url),
    "utf8",
  ),
) as { assets: { source: string; file: string; sourceSha256: string }[] };
const base = "/themes/openai/astra-sol/";
test("launch component gallery links to native controls and the portable custom chart", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "components/");
  await expect(page.locator("ol a")).toHaveCount(23);
  await page
    .getByRole("link", { name: "查看使用自定义数据的评测图 →" })
    .click();
  await expect(
    page.getByRole("heading", { name: "自定义评测图", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#custom-benchmark svg").first()).toBeVisible();
  await expect(page.locator("article figcaption")).toContainText("演示数据");
  expect(errors).toEqual([]);
});
test("mobile source tabs switch charts and the testimonial carousel advances", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "components/science-benchmarks/");
  const consent = page.getByRole("button", { name: "拒绝非必要", exact: true });
  if (await consent.isVisible()) {
    await consent.click();
    await page.waitForTimeout(1500);
  }
  const vals = page.getByRole("tab", { name: "Vals 科学指数 v1" });
  await vals.click();
  await expect(vals).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("svg").first()).toBeVisible();
  await page.goto(base + "components/customer-carousel/");
  const next = page.getByRole("button", {
    name: "下一条客户评价",
    exact: true,
  });
  await next.click();
  await expect(page.locator("article")).toContainText(/2\s*条/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

// The captured optimizer response is one candidate, not a replacement for srcset.
const optimized = manifest.assets.find((a) =>
  a.source.startsWith("https://openai.com/_next/image?"),
)!;
const original = manifest.assets.find(
  (a) => a.source === new URL(optimized.source).searchParams.get("url"),
)!;

for (const { width, route, candidate, suffix } of [
  { width: 1600, route: base, candidate: optimized, suffix: "" },
  {
    width: 390,
    route: base + "components/slide-comparison/",
    candidate: original,
    suffix: "?w=640&q=90",
  },
]) {
  test(`slide image loads the expected local candidate at ${width}px`, async ({
    page,
    context,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const imagePath = candidate.file.slice("public".length) + suffix;
    const optimizerRequests: string[] = [];
    await context.route("**/*", (r) => {
      const url = new URL(r.request().url());
      if (url.pathname === "/_next/image") optimizerRequests.push(url.href);
      return url.origin === origin ? r.continue() : r.abort();
    });
    await page.setViewportSize({ width, height: 844 });
    await page.goto(route);
    const consent = page.getByRole("button", {
      name: "拒绝非必要",
      exact: true,
    });
    if (await consent.isVisible()) await consent.click();
    const tab = page.getByRole("tab", { name: "幻灯片模板匹配", exact: true });
    const response = page.waitForResponse(
      (r) => r.url() === origin + imagePath,
    );
    // Server-rendered controls may be visible before the tab hydrates.
    await expect(async () => {
      if ((await tab.getAttribute("aria-selected")) !== "true")
        await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true", {
        timeout: 1000,
      });
    }).toPass({ timeout: 10000 });
    const img = page.getByAltText(/^Alder Street Markets 客户回顾原始幻灯片/);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute(
      "sizes",
      "(min-width: 1728px) 864px, (min-width: 768px) 50vw, 100vw",
    );
    await expect(img).toHaveAttribute("srcset", /\S+ 384w,.+\S+ 3840w$/);
    await expect
      .poll(() => img.evaluate((n: HTMLImageElement) => n.currentSrc))
      .toBe(origin + imagePath);
    await expect
      .poll(() => img.evaluate((n: HTMLImageElement) => n.naturalWidth))
      .toBeGreaterThan(0);
    const requested = await response;
    expect(requested.ok()).toBe(true);
    expect(
      createHash("sha256")
        .update(await requested.body())
        .digest("hex"),
    ).toBe(candidate.sourceSha256);
    expect(optimizerRequests).toEqual([]);
  });
}
