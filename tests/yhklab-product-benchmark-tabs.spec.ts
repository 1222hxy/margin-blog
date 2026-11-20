import { expect, test, type Page } from "@playwright/test";
import { openProduct } from "./helpers/product-chart";

const groups = [
  { section: "science-benchmarks", anchor: "science-benchmarks", count: 2 },
  {
    section: "intelligence-benchmarks",
    anchor: "cost-performance-benchmarks",
    count: 3,
  },
];
async function openGroup(page: Page, anchor: string) {
  const group = page.locator(`#${anchor}`);
  await group.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(group.getByRole("tabpanel").locator("svg.marks")).toBeVisible();
  return group;
}

for (const group of groups) {
  test(`${group.section} changes the plot with pointer and keyboard`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openProduct(page);
    const set = await openGroup(page, group.anchor);
    const tabs = set.getByRole("tab");
    await expect(tabs).toHaveCount(group.count);
    await expect(set.getByRole("tabpanel")).toHaveCount(1);
    const plot = (index: number) =>
      set.getByRole("tabpanel").locator(`#chart-${group.section}-${index}`);
    await expect(plot(0).locator("svg.marks")).toBeVisible();
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(plot(1).locator("svg.marks")).toBeVisible();
    await expect(
      plot(1).locator(".role-mark [aria-label]").first(),
    ).toHaveAttribute("aria-label", /15/);
    if (group.count === 3) {
      await tabs.nth(1).press("ArrowRight");
      await expect(tabs.last()).toBeFocused();
      await expect(plot(2).locator("svg.marks")).toBeVisible();
      await expect(
        plot(2).locator(".role-mark [aria-label]").first(),
      ).toHaveAttribute("aria-label", /18/);
    }
    await tabs.last().press("Home");
    await expect(tabs.first()).toBeFocused();
    await expect(plot(0).locator("svg.marks")).toBeVisible();
    await expect(set.getByRole("tabpanel")).toHaveCount(1);
  });
}

test("benchmark rotation pauses on hover and stops after a manual selection", async ({
  page,
}) => {
  test.setTimeout(32_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openProduct(page);
  const set = await openGroup(page, "science-benchmarks");
  const first = set.getByRole("tab", { name: "记录 A" });
  const second = set.getByRole("tab", { name: "记录 B" });
  await page.mouse.move(10, 10);
  await expect(first.locator(".NIBANa_countdown")).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await first.hover();
  await expect(first.locator(".NIBANa_countdown")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.mouse.move(10, 10);
  await expect(second).toHaveAttribute("aria-selected", "true", {
    timeout: 9000,
  });
  await expect(
    set.getByRole("tabpanel").locator("#chart-science-benchmarks-1 svg.marks"),
  ).toBeVisible();
  await first.click();
  await page.mouse.move(10, 10);
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(first.locator(".NIBANa_countdown")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
});

test("copied chart links reopen the matching dormant benchmark", async ({
  page,
}) => {
  await page.goto("/products/folio/#chart-intelligence-benchmarks-2");
  const consent = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await consent.waitFor({ state: "visible", timeout: 2500 }).catch(() => {});
  if (await consent.isVisible()) await consent.click();
  const set = page.locator("#cost-performance-benchmarks");
  await expect(set.getByRole("tab", { name: "记录 C" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const plot = set
    .getByRole("tabpanel")
    .locator("#chart-intelligence-benchmarks-2 svg.marks");
  await expect(plot).toBeInViewport();
  await expect(page).toHaveURL(/#chart-intelligence-benchmarks-2$/);
});
