import type { NativeComponent } from "../openai/types";
import { MarkdownTabs } from "./components/MarkdownTabs";
import { nativePdf } from "./components/NativePdf";
import {
  deckComparisonLayout,
  pairedDeckLayout,
} from "./deck-comparison-layout";
import examples from "./pdf-mock-data.json";

const introductions = {
  workbook:
    "并排比较同一组虚构记录的初稿和复核稿。切换标签查看工作簿、备忘录、实验记录和检查清单。",
  slide:
    "并排比较四组虚构演示稿。模板匹配保留参考页，方便核对标题、正文和备注的位置。",
};
const templateReference = {
  prompt: "按附件的标题、正文和备注布局，做一页研究笔记复核幻灯片。",
  src: "/yhklab/decks/template-reference.svg",
  alt: "Mock · 参考幻灯片，标题位于顶部，正文和复核备注分栏。",
  width: 1678,
  height: 937,
};

export const deckComparisonIds = [
  "workbook-comparison",
  "slide-comparison",
] as const;
export type DeckComparisonId = (typeof deckComparisonIds)[number];
export function isDeckComparison(id: string): id is DeckComparisonId {
  return (deckComparisonIds as readonly string[]).includes(id);
}

export function productDeckComparison(id: DeckComparisonId) {
  const kind = id === "workbook-comparison" ? "workbook" : "slide";
  const groupId =
    kind === "workbook"
      ? "workbook-and-memo-examples"
      : "professional-work-examples";
  const components: Record<string, NativeComponent> = {};
  const items = examples
    .filter((example) => example.kind === kind)
    .map((example) => {
      const columns = (["before", "after"] as const).map((version) => {
        const heading = version === "before" ? "初稿" : "复核稿";
        const stem = `/yhklab/decks/${example.id}-${version}`;
        const view = nativePdf({
          id: `pdf-${example.id}-${version}`,
          src: `${stem}.pdf`,
          poster: `${stem}.webp`,
          title: `Mock · ${example.title} · ${heading}`,
          ratio: example.ratio,
          fill: true,
        });
        components[view.id] = view;
        return { id: view.id, heading };
      });
      return {
        id: `${groupId}:${example.id}:tab`,
        label: example.tab,
        html: pairedDeckLayout(
          columns,
          example.id === "records"
            ? [
                example.note,
                "两份工作簿使用同一批虚构记录；差异仅用于演示复核过程。",
              ]
            : [example.note],
          example.id === "template" ? templateReference : undefined,
        ),
      };
    });
  const tabs = MarkdownTabs({
    id: groupId,
    items,
    components,
    media: true,
    keepMounted: true,
  });
  components[tabs.id] = tabs;
  return {
    html: deckComparisonLayout(tabs.id, introductions[kind]),
    components,
  };
}
