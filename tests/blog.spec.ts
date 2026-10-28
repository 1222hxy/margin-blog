import { test, expect } from "@playwright/test";
test("nine theme/layout combinations on desktop and mobile", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["build-a-space", "math-and-code", "slow-notes"]) {
      await page.goto("/posts/" + route + "/");
      for (const theme of ["study", "editorial", "terminal"]) {
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
  await page.getByRole("button", { name: "搜索文章" }).click();
  await page.getByRole("textbox", { name: "搜索关键词" }).fill("公式");
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
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
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
  ).toContain("Blog Anthropic Serif");
  expect(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Blog Anthropic Sans");
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
  await page.screenshot({ path: "test-results/author-fonts-mobile.png" });
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
  expect(requests.some((url) => url.includes("PingFang-"))).toBeFalsy();
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

test('MiSans simplified subset renders Chinese and English',async({page})=>{await page.goto('/projects/');await expect(page.getByText('SELECTED WORK',{exact:true})).toHaveCount(0);await page.evaluate(()=>document.documentElement.style.setProperty('--reader-body','"Blog MiSans", sans-serif'));expect(await page.evaluate(async()=>{await document.fonts.load('400 16px "Blog MiSans"','中文阅读 Hello 123');return document.fonts.check('400 16px "Blog MiSans"','中文阅读 Hello 123')})).toBeTruthy();await page.screenshot({path:'test-results/misans-projects.png',fullPage:true});});

test('OPPO subset loads Chinese and Latin with variable weights',async({page})=>{await page.goto('/posts/');await page.evaluate(()=>document.documentElement.style.setProperty('--reader-body','"Blog OPPO Sans", sans-serif'));expect(await page.evaluate(async()=>{await document.fonts.load('500 16px "Blog OPPO Sans"','中文阅读 Hello 123');return document.fonts.check('500 16px "Blog OPPO Sans"','中文阅读 Hello 123')})).toBeTruthy();});
