import { test, expect } from "@playwright/test";
test("nine theme/layout combinations on desktop and mobile", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["build-a-space", "math-and-code", "slow-notes"]) {
      await page.goto("/posts/" + route + "/");
      for (const theme of ["study", "editorial", "terminal", "workspace"]) {
        await page.evaluate(
          (t) => (document.documentElement.dataset.theme = t),
          theme,
        );
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
      }
    }
  }
});
test("search, mode, diagram, image and keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("频率", { exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "搜索文章" }).click();
  await page.getByRole("searchbox", { name: "搜索关键词" }).fill("公式");
  await expect(page.locator(".search-results a").first()).toContainText("公式");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.locator("#mode").click();
  const mode = await page.evaluate(() => localStorage.getItem("mode"));
  await page.reload();
  expect(
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    ),
  ).toBe(mode === "dark");
  await page.goto("/posts/math-and-code/");
  await expect(page.locator(".mermaid-diagram svg")).toBeVisible({
    timeout: 30000,
  });
  await page.goto("/posts/slow-notes/");
  await page.getByRole("button", { name: "放大图片：抽象山景" }).click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
});
test("readable without javascript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/posts/math-and-code/");
  await expect(page.locator(".katex").first()).toBeVisible();
  await expect(page.locator("#article-body")).toContainText("用代码验证");
  await context.close();
});
test("homepage screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.screenshot({
    caret: "initial",
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    caret: "initial",
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});

test("author fonts apply without visitor controls or JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/posts/math-and-code/");
  await expect(page.getByRole("button", { name: "字体设置" })).toHaveCount(0);
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Blog MiSans");
  expect(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Blog MiSans");
  expect(
    await page
      .locator(".prose pre code")
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Blog Anthropic Mono");
  expect(
    await page
      .locator(".katex")
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).not.toContain("Blog Anthropic");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    caret: "initial",
    path: "test-results/author-fonts-mobile.png",
  });
  await context.close();
});

test("PingFang is available to author without loading by default", async ({
  page,
}) => {
  test.setTimeout(90000);
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/posts/");
  await page.evaluate(() => document.fonts.ready);
  expect(requests.some((url) => /PingFang-|OPPOSans4/.test(url))).toBeFalsy();
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--reader-body",
      '"Blog PingFang SC", sans-serif',
    ),
  );
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('400 16px "Blog PingFang SC"', "中文阅读");
      return document.fonts.check('400 16px "Blog PingFang SC"', "中文阅读");
    }),
  ).toBeTruthy();
  await expect(page.getByRole("button", { name: "字体设置" })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("MiSans simplified subset renders Chinese and English", async ({
  page,
}) => {
  await page.goto("/projects/");
  await expect(page.getByText("SELECTED WORK", { exact: true })).toHaveCount(0);
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--reader-body",
      '"Blog MiSans", sans-serif',
    ),
  );
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('400 16px "Blog MiSans"', "中文阅读 Hello 123");
      return document.fonts.check(
        '400 16px "Blog MiSans"',
        "中文阅读 Hello 123",
      );
    }),
  ).toBeTruthy();
  await page.screenshot({
    caret: "initial",
    path: "test-results/misans-projects.png",
    fullPage: true,
  });
});

test("OPPO subset loads Chinese and Latin with variable weights", async ({
  page,
}) => {
  await page.goto("/posts/");
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--reader-body",
      '"Blog OPPO Sans", sans-serif',
    ),
  );
  expect(
    await page.evaluate(async () => {
      await document.fonts.load(
        '500 16px "Blog OPPO Sans"',
        "中文阅读 Hello 123",
      );
      return document.fonts.check(
        '500 16px "Blog OPPO Sans"',
        "中文阅读 Hello 123",
      );
    }),
  ).toBeTruthy();
});

test("TSX articles are searchable, static and interactive", async ({
  page,
  browser,
}) => {
  await page.goto("/posts/curve-lab/");
  const range = page.getByLabel("频率", { exact: true });
  await expect(range).toBeVisible();
  await range.fill("3");
  await expect(page.locator("output")).toContainText("3.0");
  await page.getByRole("button", { name: "重置参数" }).click();
  await expect(range).toHaveValue("2");
  await page.getByRole("button", { name: "搜索文章" }).click();
  await page.getByRole("searchbox", { name: "搜索关键词" }).fill("波形");
  await expect(page.locator(".search-results a").first()).toContainText("曲线");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto("http://127.0.0.1:4321/posts/curve-lab/");
  await expect(staticPage.locator("#article-body")).toContainText(
    "从图像理解参数",
  );
  await expect(staticPage.locator("svg")).toBeVisible();
  await context.close();
});

test("search shows loading, retries errors and caches results", async ({
  page,
}) => {
  let calls = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/search.json", async (route) => {
    calls++;
    if (calls === 1) {
      await gate;
      await route.fulfill({ status: 503, body: "Unavailable" });
    } else
      await route.fulfill({
        json: [
          {
            title: "测试文章",
            description: "恢复成功",
            body: "测试正文",
            tags: ["测试"],
            url: "/posts/build-a-space/",
          },
        ],
      });
  });
  await page.goto("/posts/");
  await page.getByRole("button", { name: "搜索文章" }).click();
  await expect(page.getByText("正在加载文章…")).toBeVisible();
  release();
  await page.getByRole("button", { name: "重新加载" }).click();
  await expect(page.locator(".search-results a")).toHaveText(
    "测试文章恢复成功",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "搜索文章" }).click();
  await expect(page.locator(".search-results a")).toBeVisible();
  expect(calls).toBe(2);
});

test("article navigation, progress and sharing metadata", async ({ page }) => {
  await page.goto("/posts/math-and-code/");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ||
      "{}",
  );
  expect(data["@type"]).toBe("BlogPosting");
  expect(data.headline).toContain("公式");
  const links = page.locator(".toc a");
  await links.nth(1).click();
  await expect(links.nth(1)).toHaveAttribute("aria-current", "location");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() =>
      page
        .locator("#reading-progress")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .toBe("matrix(1, 0, 0, 1, 0, 0)");
  await page.goto("/posts/slow-notes/");
  const zoom = page.getByRole("button", { name: "放大图片：抽象山景" });
  await zoom.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "图片预览：抽象山景" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(zoom).toBeFocused();
});

test("TSX code survives hydration and copies the current React state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).__copied = text;
        },
      },
    }),
  );
  await page.goto("/posts/curve-lab/");
  const copy = page.locator("#article-body .copy-code");
  await expect(copy).toHaveCount(1);
  await expect(copy).toBeEnabled();
  await page.getByLabel("频率", { exact: true }).fill("3");
  await copy.click();
  await expect(copy).toHaveText("已复制");
  expect(await page.evaluate(() => (window as any).__copied)).toBe(
    "y = 60 * Math.sin(x * 2 * Math.PI * 3)",
  );
  await page.getByLabel("振幅", { exact: true }).fill("80");
  await expect(copy).toHaveText("复制代码");
  await copy.click();
  expect(await page.evaluate(() => (window as any).__copied)).toBe(
    "y = 80 * Math.sin(x * 2 * Math.PI * 3)",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error("denied");
        },
      },
    }),
  );
  await copy.click();
  await expect(copy).toHaveText("复制失败");
  expect(errors).toEqual([]);
});
