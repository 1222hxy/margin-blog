import { expect, test } from "@playwright/test";
import { compileLab } from "../src/lab/compile.mjs";

const compile = (source: string) =>
  compileLab("---\ntitle: Mock\n---\n" + source, "embeds.lab.md");

test("Markdown accepts titled local embeds and keeps raw iframe markup disabled", () => {
  const result = compile(
    "::embed[Mock 交互图]{src=/yhklab/demos/nodes/ fullscreen=true}",
  );
  expect(result.widgets).toMatchObject([
    {
      type: "embed",
      id: "lab-embed-1",
      src: "/yhklab/demos/nodes/",
      title: "Mock 交互图",
      fullscreen: true,
    },
  ]);
  expect(result.blocks[0].html).toContain(
    'data-openai-component="lab-embed-1"',
  );
  expect(() => compile("::embed[Source]{src=https://example.org/}")).toThrow(
    "invalid local media path",
  );
  expect(() => compile("::embed[Source]{src=//example.org/}")).toThrow(
    "invalid local media path",
  );
  expect(() => compile("::embed[]{src=/show/}")).toThrow(
    "embed needs a descriptive label",
  );
  expect(() => compile("::embed[Source]{src=/show/ fullscreen=maybe}")).toThrow(
    "fullscreen must be true or false",
  );
  expect(() => compile('<iframe src="/show/"></iframe>')).toThrow(
    "raw HTML is not supported",
  );
});
