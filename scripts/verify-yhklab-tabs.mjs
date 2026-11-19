// Compare a retained baseline build against the current, locally served build.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { parse } from "parse5";

const [baseline, base = "http://127.0.0.1:4321"] = process.argv.slice(2);
if (!baseline)
  throw new Error(
    "Usage: node scripts/verify-yhklab-tabs.mjs <baseline-dist> [base-url]",
  );
const route = "/notes/reading-a-graph/";
const url = new URL(route + "?parity=1", base).href;
async function current(path) {
  const res = await fetch(new URL(path, base));
  assert.ok(res.ok, `${path}: ${res.status}`);
  return res.text();
}
const article = await readFile(join(baseline, route, "index.html"), "utf8");
const candidate = await current(route);
function part(html, tag) {
  const queue = [parse(html, { sourceCodeLocationInfo: true })];
  for (const node of queue) {
    if (node.tagName === tag) {
      const { startOffset, endOffset } = node.sourceCodeLocation;
      return html.slice(startOffset, endOffset);
    }
    queue.push(...(node.childNodes ?? []));
  }
  throw new Error(`Missing ${tag}`);
}
for (const tag of ["header", "article", "footer"])
  assert.equal(part(candidate, tag), part(article, tag), `${tag} SSR differs`);
for (const path of ["/", "/products/folio/"]) {
  const reference = await readFile(join(baseline, path, "index.html"), "utf8");
  assert.equal(await current(path), reference, `${path} SSR differs`);
}
assert.match(candidate, /110001:I\[1900000091,/);
assert.doesNotMatch(candidate, /100034:I\[563091,/);
console.log(
  "SSR: exact article, header, footer, homepage and product; no legacy tabs Flight import.",
);

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
// Headless Chromium can vary by a single shade at anti-aliased rounded edges.
// Compare decoded RGBA as well as reporting hashes, and record a reference self-run.
async function pixelDiff(page, a, b) {
  if (a.hash === b.hash) return { changed: 0, max: 0, total: 0 };
  const result = await page.evaluate(
    async (pngs) => {
      const rgba = async (png) => {
        const file = await (await fetch(`data:image/png;base64,${png}`)).blob();
        const image = await createImageBitmap(file);
        const canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return [
          image.width,
          image.height,
          context.getImageData(0, 0, image.width, image.height).data,
        ];
      };
      const [[aw, ah, a], [bw, bh, b]] = await Promise.all(pngs.map(rgba));
      if (aw !== bw || ah !== bh) return null;
      let changed = 0,
        max = 0;
      for (let i = 0; i < a.length; i += 4) {
        const delta = Math.max(
          Math.abs(a[i] - b[i]),
          Math.abs(a[i + 1] - b[i + 1]),
          Math.abs(a[i + 2] - b[i + 2]),
          Math.abs(a[i + 3] - b[i + 3]),
        );
        if (delta) changed++;
        max = Math.max(max, delta);
      }
      return { changed, max, total: aw * ah };
    },
    [a.png.toString("base64"), b.png.toString("base64")],
  );
  assert.ok(result, "Screenshot dimensions differ");
  return result;
}

const browser = await chromium.launch();
try {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    try {
      const reference = await context.newPage(),
        repeat = await context.newPage(),
        revised = await context.newPage();
      for (const page of [reference, repeat])
        await page.route(url, (request) =>
          request.fulfill({
            contentType: "text/html; charset=utf-8",
            body: article,
          }),
        );
      const errors = [];
      const localScript = revised.waitForResponse(
        (res) => res.url().endsWith("/yhklab/article-tabs.js") && res.ok(),
      );
      revised.on("pageerror", (err) => errors.push(err.stack));
      for (const page of [reference, repeat, revised]) {
        await page.goto(url + "#old");
        const refuse = page.getByRole("button", {
          name: "拒绝非必要",
          exact: true,
        });
        await refuse.waitFor({ timeout: 2500 }).catch(() => {});
        if (await refuse.isVisible()) await refuse.click();
        // Chart loads on scroll; this lets both page runtimes complete startup.
        const chart = page.locator('[id^="lab-chart-"]');
        await chart.scrollIntoViewIfNeeded();
        await chart.locator("svg path[aria-label]").first().waitFor();
        await page.evaluate(() => document.fonts.ready.then(() => true));
      }
      await localScript;
      const steps = [
        [null, 0],
        ["click", 1],
        ["ArrowRight", 2],
        ["ArrowRight", 0],
      ];
      for (const [action, index] of steps) {
        const finalized = [];
        for (const page of [reference, repeat, revised]) {
          await page.bringToFront();
          await page.mouse.move(0, 890);
          const tabs = page.getByRole("tablist", { name: "标签", exact: true });
          const buttons = tabs.getByRole("tab");
          if (action === "click") {
            await buttons.nth(index).click();
          } else if (action) {
            await page.keyboard.press(action);
          }
          const selected = buttons.nth(index);
          const panelId = await selected.getAttribute("aria-controls");
          const panel = page.getByRole("tabpanel");
          await panel.and(page.locator(`[id="${panelId}"]`)).waitFor();
          const root = tabs.locator("xpath=../../../../..");
          await root.evaluate((el) =>
            el.scrollIntoView({ block: "center", behavior: "instant" }),
          );
          await page.mouse.move(0, 890);
          await root.evaluate(async (el) => {
            await Promise.allSettled(
              el
                .getAnimations({ subtree: true })
                .map((animation) => animation.finished),
            );
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
          });
          const png = await root.screenshot({ animations: "disabled" });
          finalized.push({
            hash: sha(png),
            png,
            dom: await root.evaluate((el) => el.outerHTML),
            geometry: await root.evaluate((el) =>
              [el, ...el.querySelectorAll("nav, button, [role=tabpanel]")].map(
                (node) => node.getBoundingClientRect().toJSON(),
              ),
            ),
            focus: await page.evaluate(() => document.activeElement?.id),
            url: page.url(),
          });
        }
        const label = `${width}px ${action ?? "initial"} panel ${index}`;
        const [a, b, c] = finalized;
        for (const result of [b, c]) {
          assert.ok(result.dom === a.dom, `${label}: DOM mismatch`);
          assert.deepEqual(
            result.geometry,
            a.geometry,
            `${label}: layout mismatch`,
          );
          assert.equal(result.focus, a.focus, `${label}: focus mismatch`);
          assert.equal(result.url, a.url, `${label}: URL mismatch`);
        }
        const self = await pixelDiff(reference, a, b);
        const diff = await pixelDiff(reference, a, c);
        for (const sample of [self, diff]) {
          assert.ok(
            sample.max <= 1 && sample.changed <= 0.0005 * sample.total,
            `${label}: decoded PNG mismatch ${JSON.stringify({ self, diff })}`,
          );
        }
        console.log(
          `${label}: exact DOM, ${diff.changed}/${diff.total || "all"} pixels differ (max ${diff.max}/255; self ${self.changed}); PNG ${c.hash}`,
        );
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
