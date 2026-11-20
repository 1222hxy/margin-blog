import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";

const folder = "src/themes/yhklab/components";
const moduleNames = new Set([
  "markdown-bar-spec.mjs",
  "markdown-bar-tokens.mjs",
  "markdown-bar-marks.mjs",
  "markdown-bar-view.mjs",
  "markdown-chart-layout.mjs",
  "markdown-chart-tooltip.mjs",
  "markdown-chart-touch.mjs",
  "markdown-chart-lifecycle.mjs",
  "markdown-chart-runtime.mjs",
]);
const runtime = "/__chart_candidate/markdown-chart-runtime.mjs";
export const chartId = "lab-chart-2";
export const article = "/notes/reading-a-graph/";
const chartOptions = {
  id: chartId,
  caption: "记录通过数（条）",
  categoryTitle: "阶段",
  valueTitle: "通过数（条）",
  rows: [
    ["采集", 12],
    ["整理", 9],
    ["复核", 6],
  ],
};

export async function prepareChartModules(page: Page) {
  await page.route("**/__chart_candidate/*.mjs", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").at(-1)!;
    if (!moduleNames.has(name)) return route.abort();
    await route.fulfill({
      contentType: "text/javascript",
      body: await readFile(resolve(folder, name)),
    });
  });
  await page.addScriptTag({
    path: resolve("node_modules/vega/build/vega.min.js"),
  });
}

export async function openChartArticle(page: Page) {
  await page.goto(article);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ timeout: 3000 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  await page.waitForFunction((id) => {
    const anchor = document.getElementById(id);
    if (!anchor?.getClientRects().length) return false;
    anchor.scrollIntoView({ block: "center", behavior: "instant" });
    return true;
  }, chartId);
  await page.locator(`#${chartId} svg.marks`).waitFor();
  await page.evaluate(() => document.fonts.ready.then(() => {}));
}

export async function replaceWithCandidate(page: Page) {
  await prepareChartModules(page);
  await page.evaluate(
    async ({ runtime, options }) => {
      const { mountArticleChart } = await import(runtime);
      const anchor = document.getElementById(options.id)!;
      const placeholder = anchor.cloneNode(false) as HTMLElement;
      placeholder.style.height = "400px";
      placeholder.style.fontFamily = "";
      placeholder.style.width = "";
      placeholder.style.minWidth = "";
      const slot = anchor.parentElement!;
      anchor.replaceWith(placeholder);
      const chart = mountArticleChart(slot, options, {
        loadVega: () => Reflect.get(window, "vega"),
      });
      if (!(await chart.ready))
        throw new Error("Could not mount chart candidate.");
    },
    { runtime, options: chartOptions },
  );
}

export async function fixtureChart(
  page: Page,
  mode: "offscreen" | "hash" | "staged",
) {
  const id = "chart-fixture";
  await page.route("**/__chart_fixture*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><div style="height:4000px"></div><div id="slot" style="display:contents"><div id="${id}" style="height:400px"></div></div><div style="height:1200px"></div>`,
    }),
  );
  await page.goto(`/__chart_fixture${mode === "hash" ? `#${id}` : ""}`);
  await prepareChartModules(page);
  await page.evaluate(
    async ({ runtime, options, mode }) => {
      const { mountArticleChart } = await import(runtime);
      const counters = { loads: 0, deferred: 0, released: 0 };
      const stage =
        mode === "staged"
          ? {
              staged: true,
              defer() {
                counters.deferred++;
                return () => {
                  counters.released++;
                };
              },
            }
          : undefined;
      const chart = mountArticleChart(
        document.querySelector("#slot"),
        { ...options, stage },
        {
          loadVega() {
            counters.loads++;
            return Reflect.get(window, "vega");
          },
        },
      );
      Object.assign(window, { chart, counters });
    },
    { runtime, options: { ...chartOptions, id }, mode },
  );
}
