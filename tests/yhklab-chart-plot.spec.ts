import { test, expect, type Page } from "@playwright/test";
import { resolve } from "node:path";
import { markdownBarSpec } from "../src/themes/yhklab/components/markdown-bar-spec.mjs";
import { mountMarkdownBar } from "../src/themes/yhklab/components/markdown-bar-view.mjs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "parse5";
import { MarkdownChartFrame } from "../src/themes/yhklab/components/MarkdownChartFrame";

import { readFile } from "node:fs/promises";
import {
  exportMark,
  exportMarkdownBar,
} from "../src/themes/yhklab/components/markdown-chart-export.mjs";

const vegaRuntime = resolve("node_modules/vega/build/vega.min.js");
const spec = markdownBarSpec({
  caption: "记录通过数（条）",
  categoryTitle: "阶段",
  valueTitle: "通过数（条）",
  rows: [
    ["采集", 12],
    ["整理", 9],
    ["复核", 6],
  ],
});

async function revealChart(page: Page) {
  // Flight can replace the server placeholder while the article hydrates.
  // Resolve and scroll the current anchor in one browser task.
  await page.waitForFunction(() => {
    const anchor = document.getElementById("lab-chart-2");
    if (!anchor?.getClientRects().length) return false;
    anchor.scrollIntoView({ block: "center", behavior: "instant" });
    return true;
  });
  return page.locator("#lab-chart-2");
}

for (const width of [390, 768, 1440]) {
  test(`standalone Vega bar plot matches archived chart at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/notes/reading-a-graph/");
    const reject = page.getByRole("button", {
      name: "拒绝非必要",
      exact: true,
    });
    await reject.waitFor({ timeout: 2500 }).catch(() => {});
    if (await reject.isVisible()) await reject.click();
    const chart = await revealChart(page);
    const host = chart.locator(".vega-embed");
    const plot = host.locator("svg.marks");
    await expect(plot.locator("[aria-roledescription=bar]")).toHaveCount(3);
    await page.addScriptTag({ path: vegaRuntime });
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    const before = await plot.evaluate((el) => el.outerHTML);
    const image = await plot.screenshot({ animations: "disabled" });
    await host.evaluate(
      async (el, { source, spec }) => {
        // Hold the measured host/theme constant and substitute only the SVG
        // renderer. The active archived component is never called by the port.
        const mount = (0, eval)(`(${source})`);
        const host = el.cloneNode(false) as HTMLElement;
        el.replaceWith(host);
        await mount(Reflect.get(window, "vega"), host, spec);
      },
      { source: mountMarkdownBar.toString(), spec },
    );
    const after = await plot.evaluate((el) => el.outerHTML);
    const normalize = (html: string) => html.replace(/clip\d+/g, "clip");
    expect(normalize(after)).toBe(normalize(before));
    expect(await plot.screenshot({ animations: "disabled" })).toEqual(image);
  });
}
test("source chart frame and placeholder match the archived Markdown SSR byte for byte", async ({
  request,
}) => {
  const response = await request.get("/notes/reading-a-graph/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  const root = parse(html, { sourceCodeLocationInfo: true });
  const stack: import("parse5").DefaultTreeAdapterTypes.Node[] = [root];
  const id = "lab-chart-2";
  const literal = renderToStaticMarkup(
    createElement(MarkdownChartFrame, { id, caption: "记录通过数（条）" }),
  );
  let match: string | undefined;
  while (stack.length) {
    const element = stack.pop()!;
    if (
      "attrs" in element &&
      element.attrs.some(
        (attr: { name: string; value: string }) =>
          attr.name === "id" && attr.value === id,
      )
    ) {
      let ancestor: import("parse5").DefaultTreeAdapterTypes.Node | null =
        element;
      for (
        let level = 0;
        level < 4 && ancestor && "parentNode" in ancestor;
        level++
      ) {
        ancestor = ancestor.parentNode;
      }
      if (
        !ancestor ||
        !("sourceCodeLocation" in ancestor) ||
        !ancestor.sourceCodeLocation
      ) {
        throw new Error("Archived chart frame is missing.");
      }
      const { startOffset, endOffset } = ancestor.sourceCodeLocation;
      match = html.slice(startOffset, endOffset);
      break;
    }
    if ("childNodes" in element) stack.push(...element.childNodes);
  }
  expect(literal).toBe(match);
});

test("standalone Vega SVG and PNG exports match the archived downloads", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/notes/reading-a-graph/");
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ timeout: 2500 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  const chart = await revealChart(page);
  const host = chart.locator(".vega-embed");
  await expect(host.locator("svg [aria-roledescription=bar]")).toHaveCount(3);
  const trigger = chart.getByRole("button", { name: "Chart options" });
  const reference = {} as Record<string, Buffer>;
  for (const [type, name] of [
    ["svg", "Download SVG"],
    ["png", "Download PNG"],
  ]) {
    await trigger.click();
    const item = page.getByRole("menuitem", { name });
    await expect(item).toBeVisible();
    await item.hover();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      item.click(),
    ]);
    expect(download.suggestedFilename()).toBe(`chart.${type}`);
    reference[type] = await readFile(await download.path());
    await expect(item).toBeHidden();
  }
  await page.addScriptTag({ path: vegaRuntime });
  const out = await host.evaluate(
    async (el, { mountSource, exportSource, mark, spec }) => {
      const mount = (0, eval)(`(${mountSource})`);
      const render = (0, eval)(`(${exportSource})`);
      const scope = el.closest(".dotcom-chart-theme-scope");
      const host = el.cloneNode(false) as HTMLElement;
      el.replaceWith(host);
      const view = await mount(Reflect.get(window, "vega"), host, spec);
      try {
        const svg = await render(view, scope, "svg", mark);
        const png = await render(view, scope, "png", mark);
        return {
          svg: await svg.text(),
          png: Array.from(new Uint8Array(await png.arrayBuffer())),
        };
      } finally {
        view.finalize();
      }
    },
    {
      mountSource: mountMarkdownBar.toString(),
      exportSource: exportMarkdownBar.toString(),
      mark: exportMark,
      spec,
    },
  );
  const normalizeClipIds = (html: string) => html.replace(/clip\d+/g, "clip");
  expect(normalizeClipIds(out.svg)).toBe(
    normalizeClipIds(reference.svg.toString()),
  );
  expect(Buffer.from(out.png)).toEqual(reference.png);
});
