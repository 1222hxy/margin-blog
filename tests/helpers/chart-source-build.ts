import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { article } from "./chart-candidate";

export const sourceChartDist = process.env.YHKLAB_SOURCE_CHART_DIST;
export const referenceChartDist = process.env.YHKLAB_ARCHIVED_CHART_DIST;

export async function useArchivedChartBuild(page: Page) {
  if (!referenceChartDist)
    throw new Error("Missing archived chart comparison build.");
  await page.route(`**${article}`, (r) =>
    r.fulfill({
      contentType: "text/html; charset=utf-8",
      path: resolve(referenceChartDist, `.${article}index.html`),
    }),
  );
}

// Only the generated HTML and new entrypoints differ. Serve the archive and
// normal page assets from the same origin so font and clipboard conditions match.
export async function useSourceChartBuild(
  page: Page,
  dist: string,
  route = article,
) {
  await page.route(`**${route}`, (r) =>
    r.fulfill({
      contentType: "text/html; charset=utf-8",
      path: resolve(dist, `.${route}index.html`),
    }),
  );
  await page.route("**/yhklab/article-chart.js", (r) =>
    r.fulfill({
      contentType: "text/javascript; charset=utf-8",
      path: resolve(dist, "yhklab/article-chart.js"),
    }),
  );
  await page.route("**/yhklab/chart-runtime/*.mjs", (r) => {
    const path = new URL(r.request().url()).pathname;
    return r.fulfill({
      contentType: "text/javascript; charset=utf-8",
      path: resolve(dist, `.${path}`),
    });
  });
}
