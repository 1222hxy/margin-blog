import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readFlight } from "../src/themes/openai/lib/flight";
import { referenceChartDist } from "./helpers/chart-source-build";
import {
  archivedProduct,
  benchmarkIds,
  benchmarkSnapshot,
  openBenchmark,
  openProduct,
  productRoute,
} from "./helpers/product-chart";

const withoutFlight = (html: string) =>
  html.replace(
    /<script\b[^>]*>self\.__next_f\.push\(\[1,[\s\S]*?<\/script>/g,
    "",
  );

test("all thirteen Folio plots use the source controller with the same server markup as the archived plot mode", async ({
  request,
}) => {
  const response = await request.get(productRoute);
  expect(response.ok()).toBe(true);
  const body = await response.text();
  const rows = readFlight(body);
  expect(rows.find((row) => row.id === "110002")?.raw).toContain(
    "I[1900000092,",
  );
  const plots = new Map<string, { mark: string; locale: string }>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value) && value[0] === "$" && value[1] === "$L110002") {
      const { id, benchmark, locale } = value[3];
      plots.set(id, { mark: benchmark.mark, locale });
    }
    for (const child of Object.values(value)) visit(child);
  };
  rows.forEach(({ value }) => visit(value));
  const secondary = [
    ["chart-science-benchmarks-1", "bar"],
    ["chart-intelligence-benchmarks-1", "line"],
    ["chart-intelligence-benchmarks-2", "line"],
  ];
  expect([...plots.keys()].sort()).toEqual(
    [...benchmarkIds, ...secondary.map(([id]) => id)].sort(),
  );
  for (const [id, mark] of secondary) {
    expect(body).toContain(`<div id="${id}" class="scroll-mt-`);
    expect(plots.get(id)).toEqual({ mark, locale: "zh-Hans" });
  }
  const expected = [
    "line",
    "bar",
    "line",
    "bar",
    "line",
    "bar",
    "line",
    "bar",
    "line",
    "bar",
  ];
  for (const [i, id] of benchmarkIds.entries()) {
    expect(body).toContain(`<div id="${id}" class="scroll-mt-`);
    expect(plots.get(id)).toEqual({ mark: expected[i], locale: "zh-Hans" });
  }
  if (referenceChartDist) {
    const baseline = await readFile(
      resolve(referenceChartDist, `.${productRoute}index.html`),
      "utf8",
    );
    expect(withoutFlight(body)).toBe(withoutFlight(baseline));
  }
});

for (const width of [390, 768, 1440]) {
  test(`all thirteen Folio plots preserve SVG and dark theme at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    test.skip(!referenceChartDist, "Build the archived chart comparator.");
    test.setTimeout(75_000);
    const options = {
      baseURL,
      viewport: { width, height: 900 },
      reducedMotion: "reduce" as const,
    };
    const original = await browser.newPage(options);
    const revised = await browser.newPage(options);
    const errors: string[] = [];
    revised.on("pageerror", (error) => errors.push(error.message));
    try {
      await archivedProduct(original);
      await Promise.all([openProduct(original), openProduct(revised)]);
      for (const id of benchmarkIds) {
        const oldChart = await openBenchmark(original, id);
        const newChart = await openBenchmark(revised, id);
        expect(await benchmarkSnapshot(newChart), id).toEqual(
          await benchmarkSnapshot(oldChart),
        );
      }
      for (const [group, section, label, variant] of [
        ["science-benchmarks", "science-benchmarks", "记录 B", 1],
        ["cost-performance-benchmarks", "intelligence-benchmarks", "记录 B", 1],
        ["cost-performance-benchmarks", "intelligence-benchmarks", "记录 C", 2],
      ] as const) {
        const id = `chart-${section}-${variant}`;
        const plots = await Promise.all(
          [original, revised].map(async (page) => {
            const tabs = page.locator(`#${group}`);
            await tabs.getByRole("tab", { name: label }).click();
            await expect(
              tabs.getByRole("tabpanel").locator(`#${id} svg.marks`),
            ).toBeVisible();
            return openBenchmark(page, id);
          }),
        );
        expect(await benchmarkSnapshot(plots[1]), id).toEqual(
          await benchmarkSnapshot(plots[0]),
        );
      }
      expect(errors).toEqual([]);
    } finally {
      await Promise.all([original.close(), revised.close()]);
    }
  });
}
