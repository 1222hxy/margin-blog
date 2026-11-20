import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  mediaDemoIds,
  type MediaDemoId,
} from "../src/themes/yhklab/media-demo-ids";

const fixtures = process.env.YHKLAB_MEDIA_DIST;
const prefix = "/themes/openai/astra-sol/components/media-comparison-";
const mockFrame = "https://docs.google.com/yhklab-isolated-frame";

async function open(
  page: Page,
  variant: string,
  id: MediaDemoId,
  dismissConsent: boolean,
) {
  const path = `${prefix}${variant}-${id}/`;
  const body = readFileSync(`${fixtures}${path}index.html`);
  await page.route(`**${path}`, (route) =>
    route.fulfill({ contentType: "text/html; charset=utf-8", body }),
  );
  await page.goto(path);
  if (dismissConsent) {
    const reject = page.getByRole("button", {
      name: "拒绝非必要",
      exact: true,
    });
    await reject.waitFor({ state: "visible", timeout: 2400 }).catch(() => {});
    if (await reject.isVisible()) await reject.click();
  }
  await page.evaluate(() => document.fonts.ready.then(() => {}));
}

async function geometry(locator: Locator) {
  await expect(locator).toBeVisible();
  return locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return [x + window.scrollX, y + window.scrollY, width, height].map(
      (v) => Math.round(v * 64) / 64,
    );
  });
}

async function compareMedia(archived: Page, local: Page, id: MediaDemoId) {
  const originalTabs = archived.getByRole("tablist", { name: "标签" });
  const localTabs = local.getByRole("tablist", { name: "标签" });
  await Promise.all(
    [archived, local].map((page) =>
      expect(page.locator("video")).toHaveJSProperty("duration", 4),
    ),
  );
  const tabs = [
    "mechanical-design",
    "lamp-design",
    "interactive-worlds",
  ].includes(id);
  for (const list of [originalTabs, localTabs])
    await expect(list).toHaveCount(tabs ? 1 : 0);
  if (tabs) {
    expect(await geometry(localTabs), id).toEqual(await geometry(originalTabs));
    const a = await originalTabs.getByRole("tab").all(),
      b = await localTabs.getByRole("tab").all();
    expect(b).toHaveLength(a.length);
    for (let i = 0; i < a.length; i++) {
      expect(await geometry(b[i]), `${id} tab ${i}`).toEqual(
        await geometry(a[i]),
      );
      await expect(b[i]).toHaveAccessibleName((await a[i].textContent())!);
    }
  }
  for (let index = 0; index < (tabs ? 2 : 1); index++) {
    if (index > 0) {
      await Promise.all(
        [originalTabs, localTabs].map((list) =>
          list.getByRole("tab").nth(index).click(),
        ),
      );
      for (const page of [archived, local])
        await expect(page.getByRole("tabpanel")).toHaveAccessibleName(
          (await localTabs.getByRole("tab").nth(index).textContent())!,
        );
    }
    const selector =
      id === "lamp-design" && index === 1
        ? '[data-badge-backdrop="iframe"]'
        : "[data-video-container]";
    const ref = archived.locator(selector),
      candidate = local.locator(selector);
    expect(await geometry(candidate), `${id} media ${index}`).toEqual(
      await geometry(ref),
    );
    if (id === "lamp-design" && index === 1) {
      const fullscreen = (region: Locator) =>
        region.getByRole("button", { name: "进入交互式全屏" });
      expect(await geometry(fullscreen(candidate))).toEqual(
        await geometry(fullscreen(ref)),
      );
    }
    if (id === "mechanical-design") {
      const captions = [archived, local].map((page) =>
        page.getByRole("tabpanel").locator("figcaption"),
      );
      expect(await geometry(captions[1]), `${id} caption ${index}`).toEqual(
        await geometry(captions[0]),
      );
    }
  }
}

for (const width of [390, 768, 1440]) {
  test(`product demo geometry matches the archived layout at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    test.skip(!fixtures, "Build the isolated media comparator first.");
    test.setTimeout(65_000);
    const opts = { baseURL, viewport: { width, height: 900 } };
    const archived = await browser.newPage(opts),
      local = await browser.newPage(opts);
    const errors: string[] = [];
    local.on("pageerror", (error) => errors.push(error.message));
    await archived.route(mockFrame, (route) =>
      route.fulfill({ contentType: "text/html", body: "<h1>Mock</h1>" }),
    );
    try {
      for (const [index, id] of mediaDemoIds.entries()) {
        await Promise.all([
          open(archived, "reference", id, index === 0),
          open(local, "candidate", id, index === 0),
        ]);
        await compareMedia(archived, local, id);
      }
      expect(errors).toEqual([]);
    } finally {
      await Promise.all([archived.close(), local.close()]);
    }
  });
}
