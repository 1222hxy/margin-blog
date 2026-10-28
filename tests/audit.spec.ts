import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const routes = fs
  .readdirSync("dist", { recursive: true })
  .filter((p): p is string => typeof p === "string" && p.endsWith("index.html"))
  .map((p) => "/" + p.replaceAll("\\", "/").replace(/index.html$/, ""));
test("all published pages have accessible mobile layouts and valid internal links", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  const urls = new Set<string>();
  const findings: any[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const dark of [false, true]) {
      await page.evaluate(
        (d) => document.documentElement.classList.toggle("dark", d),
        dark,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBeTruthy();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      findings.push(
        ...results.violations.map((v) => ({
          route,
          dark,
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      );
    }
    (
      await page
        .locator("a[href]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") || ""))
    )
      .filter((h) => h.startsWith("/") && !h.startsWith("//"))
      .forEach((h) => urls.add(h.split("#")[0]));
  }
  fs.writeFileSync(
    test.info().outputPath("accessibility-findings.json"),
    JSON.stringify(findings, null, 2),
  );
  await test
    .info()
    .attach("accessibility-findings", {
      body: JSON.stringify(findings, null, 2),
      contentType: "application/json",
    });
  for (const url of urls) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
  }
  expect(errors).toEqual([]);
  expect(findings).toEqual([]);
});
