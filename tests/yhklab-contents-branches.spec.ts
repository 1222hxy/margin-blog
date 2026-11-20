import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { compileLab } from "../src/lab/compile.mjs";
import type { ArticleHeading } from "../src/themes/openai/types";
import {
  heading,
  paragraph,
  proseTemplates,
} from "../src/themes/openai/components/RichText";
import { renderReadingContents } from "../src/themes/yhklab/components/contentsMarkup";

const article = "/notes/reading-a-graph/";
const desktop = 'nav[aria-label="目录"]:not([data-show-toc])';
const mobile = 'nav[aria-label="目录"][data-show-toc]';
const blueprint = "src/themes/openai/blueprint";
const frames = {
  mobile: readFileSync(`${blueprint}/MobileContents.html`, "utf8"),
  desktop: readFileSync(`${blueprint}/DesktopContents.html`, "utf8"),
};
const spacer = '<p style="height:470px">供测试滚动的正文</p>';
const source =
  "---\ntitle: 目录测试\n---\n## 第一节\n\n### 数据来源\n\n#### 样本明细\n\n##### 排除的五级小节\n\n## 第二节\n\n#### 不在三级分支的标题";
const fixture = compileLab(source, "contents.lab.md");
const original = JSON.parse(
  readFileSync(`${blueprint}/reference.json`, "utf8"),
);
const prose = proseTemplates(original.bodyHtml);
const wrapProse = (html: string) =>
  paragraph("FIXTURE_PROSE", prose).replace(
    /<p\b[^>]*><span>FIXTURE_PROSE<\/span><\/p>/,
    () => html,
  );
const fixtureBody = fixture.blocks
  .map((block) => {
    const section = fixture.headings.find((item) => item.id === block.props.id);
    const markup =
      section && block.tag === "h2"
        ? heading(section.text, section.id, prose)
        : wrapProse(block.html);
    return markup + wrapProse(spacer);
  })
  .join("");

async function openArticle(page: Page) {
  await page.goto(article);
  const cookie = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await cookie.waitFor({ state: "visible", timeout: 2200 }).catch(() => {});
  if (await cookie.isVisible()) await cookie.click();
  await page.evaluate(() => document.fonts.ready);
}

test("contents follows a replaced article instead of leaving the rail inert", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openArticle(page);
  const rail = page.locator(desktop);
  const first = rail.locator("a").first();
  await first.evaluate((link) => {
    document
      .getElementById(link.getAttribute("href")!.slice(1))!
      .scrollIntoView({ behavior: "instant" });
  });
  await expect(rail).toHaveAttribute("aria-hidden", "false");
  await rail.evaluate((nav) => {
    const oldGrid = nav.parentElement!;
    const replacement = oldGrid.cloneNode(true) as HTMLElement;
    const rail = replacement.querySelector(
      "nav:not([data-show-toc])",
    ) as HTMLElement;
    rail.inert = true;
    rail.setAttribute("aria-hidden", "true");
    rail.classList.replace("opacity-100", "opacity-0");
    oldGrid.replaceWith(replacement);
  });
  await expect(rail).toHaveAttribute("aria-hidden", "false");
  const next = rail.getByRole("link", { name: "一份记录的三个视角" });
  await next.click();
  await expect(next).toHaveAttribute("aria-current", "true");
  await expect(page).toHaveURL(/\/notes\/reading-a-graph\/$/);
});

for (const width of [1440, 390]) {
  test(`Markdown subheadings collapse and sync current heading at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    // Exercise synthetic Markdown in the real shell without the captured
    // React tree restoring its own article on the next update.
    await page.route("**/_next/static/immutable/chunks/*.js", (route) =>
      route.abort(),
    );
    await page.goto(article);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      ({ markup, headings }) => {
        const body = document.getElementById("article-body")!;
        const grid = body.parentElement!;
        const replacement = grid.cloneNode(false) as HTMLElement;
        replacement.innerHTML = markup;
        const nextBody = body.cloneNode(false) as HTMLElement;
        nextBody.innerHTML = headings;
        replacement.append(nextBody);
        grid.replaceWith(replacement);
      },
      {
        markup: renderReadingContents(
          fixture.headings as ArticleHeading[],
          frames,
        ),
        headings: fixtureBody,
      },
    );
    const rail = page.locator(width === 390 ? mobile : desktop);
    const branch = rail.getByRole("button", { name: "数据来源", exact: true });
    const child = rail.getByRole("link", { name: "样本明细" });
    const toggle = rail.locator("button[aria-expanded]").first();
    await page
      .getByRole("heading", { name: "数据来源" })
      .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    if (width === 390) await toggle.click();
    await expect(branch).toHaveAttribute("aria-expanded", "false");
    await expect(child).toHaveCount(0);
    await expect(
      rail.getByRole("link", { name: "不在三级分支的标题" }),
    ).toHaveCount(0);
    await branch.click();
    await expect(branch).toHaveAttribute("aria-expanded", "true");
    await expect(child).toBeVisible();
    await expect(
      rail.getByRole("link", { name: "排除的五级小节" }),
    ).toHaveCount(0);
    await child.click();
    await expect
      .poll(async () =>
        page
          .getByRole("heading", { name: "样本明细" })
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(135);
    if (width === 390) {
      await expect(toggle).toHaveText("样本明细");
      await toggle.click();
    }
    await expect(child).toHaveAttribute("aria-current", "true");
    await branch.click();
    await expect(child).toHaveCount(0);
    await expect(rail.locator('a[aria-current="true"]')).toHaveText("数据来源");
    await expect(page).toHaveURL(/\/notes\/reading-a-graph\/$/);
  });
}
