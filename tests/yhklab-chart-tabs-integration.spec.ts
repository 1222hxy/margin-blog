import { expect, test } from "@playwright/test";
import {
  sourceChartDist,
  useSourceChartBuild,
} from "./helpers/chart-source-build";

const fixture = "/notes/chart-in-tabs-fixture/";

test("the compiled source chart stages inside an actual Markdown tab", async ({
  page,
}) => {
  test.skip(
    !sourceChartDist,
    "Build the private tab fixture with build-yhklab-chart-candidate.mjs.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await useSourceChartBuild(page, sourceChartDist!, fixture);
  await page.goto(`${fixture}#hydrate`);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ timeout: 3000 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  const plain = page.getByRole("tab", { name: "Plain panel" });
  const chart = page.getByRole("tab", { name: "Chart panel" });
  await expect(plain).toHaveAttribute("aria-selected", "true");
  await expect(async () => {
    await plain.click();
    expect(new URL(page.url()).hash).toBe("");
  }).toPass({ timeout: 10_000 });
  await expect(page.locator("svg.marks")).toHaveCount(0);
  let allowVega!: () => void;
  const gate = new Promise<void>((resolve) => {
    allowVega = resolve;
  });
  await page.route("**/chart-runtime/vega.mjs", async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await Promise.all([
      page.waitForRequest("**/chart-runtime/vega.mjs"),
      chart.click(),
    ]);
    await expect(
      page.getByRole("tabpanel", { name: "Plain panel" }),
    ).toBeVisible();
    await expect(page.locator("svg.marks")).toHaveCount(0);
  } finally {
    allowVega();
  }
  await expect(chart).toHaveAttribute("aria-selected", "true");
  const plot = page
    .getByRole("tabpanel", { name: "Chart panel" })
    .locator("svg.marks");
  await expect(plot.locator('[aria-roledescription="bar"]')).toHaveCount(2);
  await expect(plot).toBeVisible();
  const chartScope = page.locator(
    '[role="graphics-document"][aria-roledescription="visualization"]',
  );
  await expect(chartScope).toBeVisible();
  await expect(chartScope).toHaveAttribute("aria-label", "Staged values（条）");
  const trigger = page.getByRole("button", { name: "Chart options" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await plain.click();
  await expect(plain).toHaveAttribute("aria-selected", "true");
  await expect(plot).toBeHidden();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await chart.click();
  await expect(plot).toBeVisible();
  await expect(trigger).toHaveCount(1);
  expect(errors).toEqual([]);
});
