import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { compileLab } from "../src/lab/compile.mjs";

const fixture = process.env.YHKLAB_TESTIMONIAL_DIST;
const article = "/notes/testimonials-fixture/";

function compile(source: string) {
  return compileLab("---\ntitle: Mock\n---\n" + source, "testimonials.lab.md");
}

test("testimonial directives keep safe inline Markdown and reject invalid structures", () => {
  const good = compile(
    '::::testimonials[Mock]\n:::testimonial[First]{by="Mock · First"}\n**quote** [source](/notes/)\n:::\n::::',
  );
  expect(good.widgets).toMatchObject([
    {
      type: "testimonials",
      eyebrow: "Mock",
      items: [
        {
          paragraphs: [
            { html: '<strong>quote</strong> <a href="/notes/">source</a>' },
          ],
        },
      ],
    },
  ]);
  expect(() => compile(":::testimonial[First]\nQuote\n:::")).toThrow(
    "needs a label and a testimonials parent",
  );
  expect(() => compile(":::testimonials\nA bare paragraph\n:::")).toThrow(
    "contain only labeled testimonial blocks",
  );
  expect(() =>
    compile(
      "::::testimonials\n:::testimonial[First]{image=//host/image.png}\nQuote\n:::\n::::",
    ),
  ).toThrow("invalid local media path");
  expect(() =>
    compile(
      "::::testimonials\n:::testimonial[First]\nA <b>raw tag</b>.\n:::\n::::",
    ),
  ).toThrow("raw HTML is not supported");
});

test("Markdown testimonials switch between carousel and split view and page longer lists", async ({
  page,
}) => {
  test.skip(!fixture, "Build the isolated testimonial comparator.");
  const html = readFileSync(`${fixture}${article}index.html`, "utf8");
  await page.route(`**${article}`, (route) =>
    route.fulfill({ contentType: "text/html; charset=utf-8", body: html }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(article);
  const reject = page.getByRole("button", { name: "拒绝非必要", exact: true });
  await reject.waitFor({ state: "visible", timeout: 2400 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  const carousels = page.getByTestId("testimonial-carousel-carousel-view");
  await expect(carousels).toHaveCount(2);
  const pair = carousels.first();
  await expect(pair.locator("figure[aria-live] blockquote p")).toHaveCount(2);
  await expect(pair.locator("figure[aria-live] strong")).toHaveText("重点");
  await expect(pair.getByRole("link", { name: "出处" })).toHaveAttribute(
    "href",
    "/",
  );
  const math = pair.locator("figure[aria-live] .katex");
  await expect(async () => {
    // The archived shell serves SSR controls before its React runtime arrives.
    if (await math.isVisible()) return;
    await pair.getByRole("button", { name: "下一条客户评价" }).click();
    await expect(math).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 5000 });
  await expect(pair.getByRole("img", { name: "记录图" })).toBeVisible();

  await page.setViewportSize({ width: 768, height: 900 });
  const split = page.getByTestId("testimonial-carousel-split-grid");
  await expect(split.locator("figure")).toHaveCount(2);
  await expect(split.getByRole("button")).toHaveCount(0);
  await expect(split.locator("figure").first()).toBeVisible();
  await expect(split.locator("figure").last()).toBeVisible();

  await expect(carousels).toHaveCount(1);
  const list = carousels.first();
  const first = list.getByRole("button", { name: "显示来自 甲 的推荐语" });
  const last = list.getByRole("button", { name: "显示来自 戊 的推荐语" });
  const next = list.getByRole("button", { name: "下一条客户评价" });
  await expect(last).toHaveAttribute("tabindex", "-1");
  for (const i of [2, 3, 4]) {
    await next.click();
    await expect(list.getByTestId("testimonial-carousel-controls")).toHaveText(
      `${i} 条/ 共 5 条`,
    );
  }
  await expect(first).toHaveAttribute("tabindex", "-1");
  await expect(last).not.toHaveAttribute("tabindex");
  await last.focus();
  await page.keyboard.press("Enter");
  await expect(last).toHaveAttribute("aria-current", "true");
  await expect(list.locator("figure[aria-live] figcaption")).toHaveText(
    "Mock · 戊",
  );
  expect(errors).toEqual([]);
});
