import { expect, test } from "@playwright/test";
import { compileLab } from "../src/lab/compile.mjs";

function compile(source: string) {
  return compileLab("---\ntitle: Mock\n---\n" + source, "videos.lab.md");
}

test("Markdown validates local video, aspect ratios and playback flags", () => {
  const result = compile(
    "::video[Mock label]{src=/demo.mp4 poster=/poster.png ratio=16/9 mobile-ratio=9/16 autoplay=true loop=false}",
  );
  expect(result.widgets).toMatchObject([
    {
      type: "video",
      id: "lab-video-1",
      src: "/demo.mp4",
      poster: "/poster.png",
      label: "Mock label",
      caption: "Mock label",
      ratio: "16/9",
      mobileRatio: "9/16",
      autoplay: true,
      loop: false,
    },
  ]);
  expect(result.blocks[0].html).toContain(
    'data-openai-component="lab-video-1"',
  );
  expect(() =>
    compile("::video[Mock]{src=https://example.com/demo.mp4}"),
  ).toThrow("invalid local media path");
  expect(() => compile("::video[Mock]{src=/demo.svg}")).toThrow(
    "local .webm or .mp4",
  );
  expect(() => compile("::video[Mock]{src=/demo.mp4 ratio=0/0}")).toThrow(
    "positive width/height",
  );
  expect(() => compile("::video[Mock]{src=/demo.mp4 autoplay=maybe}")).toThrow(
    "must be true or false",
  );
  expect(() => compile("::video[]{src=/demo.mp4}")).toThrow(
    "needs a descriptive label",
  );
});
