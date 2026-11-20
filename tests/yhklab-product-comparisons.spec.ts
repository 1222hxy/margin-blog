import { expect, test } from "@playwright/test";
import { compileLab } from "../src/lab/compile.mjs";
import { openVideoPage, product } from "./helpers/video";

const compile = (source: string) =>
  compileLab("---\ntitle: Mock\n---\n" + source, "decks.lab.md");

test("Markdown validates site-local PDF, ratio, default page and booleans", () => {
  const result = compile(
    "::pdf[Mock 文档]{src=/decks/mock.pdf poster=/decks/preview.webp ratio=4/3 start=2 thumbnails=false fullscreen=false full-width=true}",
  );
  expect(result.widgets).toMatchObject([
    {
      type: "pdf",
      id: "lab-pdf-1",
      title: "Mock 文档",
      initialSlide: 2,
      thumbnails: false,
      allowFullscreen: false,
      fill: true,
    },
  ]);
  expect(result.blocks[0].html).toContain('data-openai-component="lab-pdf-1"');
  expect(() => compile("::pdf[标题]{src=//foreign.test/document.pdf}")).toThrow(
    "invalid local media path",
  );
  expect(() => compile("::pdf[标题]{src=/play.html?.pdf}")).toThrow(
    "local .pdf",
  );
  expect(() => compile("::pdf[标题]{src=/document.pdf ratio=4/0}")).toThrow(
    "positive width/height",
  );
  expect(() => compile("::pdf[标题]{src=/document.pdf start=0}")).toThrow(
    "positive page number",
  );
});

test("workflow comparison uses working tabs and two independent three-card quotes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openVideoPage(page, product + "#demo-workflow-comparison");
  const group = page.locator("#coding-testimonials");
  const panel = group.getByRole("tabpanel");
  await expect(panel).toHaveAccessibleName("初稿");
  await expect(
    panel.getByTestId("testimonial-carousel-carousel-view").locator("figure"),
  ).toHaveCount(3);
  await panel.getByRole("button", { name: "下一条客户评价" }).click();
  await expect(panel.locator("figure[aria-live] figcaption")).toHaveText(
    "Mock · 整理者",
  );
  await group.getByRole("tab", { name: "初稿" }).press("ArrowRight");
  await expect(panel).toHaveAccessibleName("复核稿");
  await expect(panel.locator("figure[aria-live] figcaption")).toHaveText(
    "Mock · 复核者",
  );
  await panel.getByRole("button", { name: "下一条客户评价" }).click();
  await expect(panel.locator("figure[aria-live] figcaption")).toHaveText(
    "Mock · 交接者",
  );
});
