// Compare captured source responses at their own origin with the built route.
// Scope: static chart/interactive states; do not mask regions or compare two
// copies of the localized HTML. Third-party players and GPU timing are excluded.
import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const [
  harFile,
  origin = "http://127.0.0.1:4346",
  out = "artifacts/astra-sol-comparison",
  count = "4",
] = process.argv.slice(2);
const har = JSON.parse(await fs.readFile(harFile, "utf8")),
  map = new Map();
for (const e of har.log.entries) {
  const u = new URL(e.request.url),
    c = e.response.content;
  if (
    e.request.method !== "GET" ||
    e.response.status !== 200 ||
    !c.text ||
    !["openai.com", "cdn.openai.com"].includes(u.hostname)
  )
    continue;
  map.set(u.href, {
    body: Buffer.from(c.text, c.encoding === "base64" ? "base64" : "utf8"),
    contentType: c.mimeType,
  });
}
const manifest = JSON.parse(
  await fs.readFile("src/themes/openai/astra-sol/manifest.json"),
);
for (const a of manifest.assets.filter((a) => a.supplemental)) {
  const body = await fs.readFile(a.file);
  if (createHash("sha256").update(body).digest("hex") !== a.sourceSha256)
    throw Error("Changed supplement");
  map.set(a.source, {
    body,
    contentType: a.file.endsWith("pdf")
      ? "application/pdf"
      : a.file.endsWith(".png")
        ? "image/png"
        : "image/webp",
  });
}
const byPath = new Map();
for (const [url, response] of map) {
  const u = new URL(url),
    key = u.origin + u.pathname;
  if (!byPath.has(key)) byPath.set(key, response);
}
const b = await chromium.launch();
await fs.mkdir(out, { recursive: true });
try {
  for (let r = 0; r < Number(count); r++) {
    for (const side of ["reference", "blog"])
      for (const width of [1440, 390]) {
        const c = await b.newContext({
          viewport: { width, height: width === 1440 ? 1000 : 844 },
          deviceScaleFactor: 1,
          reducedMotion: "reduce",
        });
        try {
          const p = await c.newPage();
          if (side === "reference")
            await c.route("**/*", (route) => {
              const u = new URL(route.request().url());
              const response =
                map.get(u.href) || byPath.get(u.origin + u.pathname);
              return response ? route.fulfill(response) : route.abort();
            });
          else
            await c.route("**/*", (route) =>
              new URL(route.request().url()).origin === origin
                ? route.continue()
                : route.abort(),
            );
          await p.goto(
            side === "reference"
              ? manifest.url
              : origin + "/themes/openai/astra-sol/",
            { waitUntil: "domcontentloaded" },
          );
          const reject = p.getByRole("button", {
            name: "拒绝非必要",
            exact: true,
          });
          await reject.waitFor({ timeout: 3000 }).catch(() => {});
          if (await reject.isVisible()) {
            await reject.click();
            await p.waitForTimeout(1300);
          }
          await p.evaluate(() => document.fonts.ready);
          const take = async (name, n) => {
            await n.scrollIntoViewIfNeeded();
            await p.evaluate(() => document.fonts.ready);
            await p.mouse.move(1, 1);
            await p.waitForTimeout(1100);
            await n.screenshot({
              path: path.join(out, `${width}-${name}-${side}-${r}.png`),
              animations: "disabled",
              timeout: 15000,
            });
          };
          const chart = p.locator("#agents-last-exam");
          await expect(async () => {
            await chart.evaluate((n) =>
              n.scrollIntoView({ block: "center", behavior: "instant" }),
            );
            await expect(chart.locator("svg,canvas").first()).toBeVisible({
              timeout: 2000,
            });
          }).toPass({ timeout: 30000 });
          await take("benchmark", chart.locator("xpath=ancestor::figure[1]"));
          const tab = p.getByRole("tab", {
            name: "Vals 科学指数 v1",
            exact: true,
          });
          await tab.scrollIntoViewIfNeeded();
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await take("science-tabs", tab.locator("xpath=ancestor::nav[1]"));
          const caption = p
            .getByRole("button", { name: "下一条客户评价", exact: true })
            .first();
          await caption.scrollIntoViewIfNeeded();
          await caption.click();
          const card = caption.locator(
            'xpath=ancestor::*[@data-testid="testimonial-carousel-carousel-view"][1]',
          );
          await take("carousel", card);
          console.log(`Round ${r + 1}: ${width}px ${side}`);
        } finally {
          await c.close();
        }
      }
  }
} finally {
  await b.close();
}
