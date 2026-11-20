import type { NativeComponent } from "../openai/types";
import { MarkdownTabs } from "./components/MarkdownTabs";
import { slot } from "./deck-comparison-layout";
import { productChart } from "./product-charts";

const groups = {
  "science-benchmarks": { anchor: "science-benchmarks", panels: ["a", "b"] },
  "intelligence-benchmarks": {
    anchor: "cost-performance-benchmarks",
    panels: ["a", "b", "c"],
  },
} as const;
type BenchmarkGroup = keyof typeof groups;

export function isBenchmarkGroup(id: string): id is BenchmarkGroup {
  return Object.hasOwn(groups, id);
}

export function productBenchmarkTabs(
  id: BenchmarkGroup,
  title: string,
  index: number,
) {
  const { anchor, panels } = groups[id];
  const components: Record<string, NativeComponent> = {};
  const items = panels.map((key, variant) => {
    const chart = productChart(id, title, index, variant);
    components[chart.id] = chart;
    return {
      id: `${anchor}:record-${key}:tab`,
      label: `记录 ${key.toUpperCase()}`,
      html: slot(chart.id),
      linkAnchor: chart.id,
    };
  });
  const tabs = MarkdownTabs({
    id: anchor,
    media: true,
    keepMounted: true,
    autoplay: true,
    items,
    components,
  });
  components[tabs.id] = tabs;
  return { html: slot(tabs.id), components };
}
