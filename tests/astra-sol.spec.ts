import { test, expect } from "@playwright/test";
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
