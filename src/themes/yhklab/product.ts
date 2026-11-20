import { catalog, type LaunchComponentId } from "../openai/astra-sol/catalog";
import { productChart, chartIds } from "./product-charts";
import {
  isBenchmarkGroup,
  productBenchmarkTabs,
} from "./product-benchmark-tabs";
import { productTestimonial } from "./product-testimonials";
import { productVideo } from "./product-video";
import { productMediaDemo } from "./product-media";
import { isDeckComparison, productDeckComparison } from "./product-decks";
import { productWorkflow } from "./product-workflow";
import { isMediaDemoId } from "./media-demo-ids";
import { Testimonial } from "../openai/components/Testimonial";
import { section, proseHTML, localLink } from "./blocks";
import type { NativeComponent } from "../openai/types";
const names: Record<LaunchComponentId, string> = {
  "astra-sol-hero": "原版动态刊头",
  "agents-last-exam": "检索成本与得分",
  "science-benchmarks": "方法对照：双标签图",
  "intelligence-benchmarks": "多指标标签图",
  "frontier-code": "脚本执行时间",
  lifeval: "笔记覆盖率",
  "harvey-lab": "文献标引质量",
  gdpval: "整理用时",
  "workbook-comparison": "工作簿与备忘录",
  "slide-comparison": "幻灯片对照",
  "customer-carousel": "读者评价轮播",
  "intro-video": "开场视频",
  "driving-demo": "路径演示",
  "mechanical-design": "结构演示",
  "lamp-design": "设计过程",
  "web-design": "页面设计",
  "cad-showcase": "几何展示",
  "interactive-worlds": "交互场景",
  "customer-quote": "单条引语",
  "workflow-comparison": "工作流对照",
  "security-benchmarks": "校验覆盖率",
  "patch-benchmarks": "修订通过率",
  "alignment-benchmarks": "标注一致率",
};
export const inventory = Object.keys(catalog) as LaunchComponentId[];
export const quote = (s: string, by: string) =>
  Testimonial({ quote: s, attribution: by }).html;
export function productSample(id: LaunchComponentId) {
  const components: Record<string, NativeComponent> = {};
  const marker = (id: string) =>
    `<template data-openai-component="${id}"></template>`;
  const chart = (id: LaunchComponentId, index: number) => {
    const component = productChart(id, names[id], index);
    components[component.id] = component;
    return marker(component.id);
  };
  const render = (id: LaunchComponentId, i: number) => {
    if (isBenchmarkGroup(id)) {
      const group = productBenchmarkTabs(id, names[id], i);
      Object.assign(components, group.components);
      return group.html;
    }
    if (chartIds.includes(id)) return chart(id, i);
    if (id === "customer-carousel" || id === "customer-quote") {
      const component = productTestimonial(id);
      components[component.id] = component;
      return marker(component.id);
    }
    if (id === "intro-video" || id === "driving-demo") {
      const component = productVideo(id);
      components[component.id] = component;
      return marker(component.id);
    }
    if (isMediaDemoId(id)) {
      const demo = productMediaDemo(id);
      Object.assign(components, demo.components);
      return demo.html;
    }
    if (isDeckComparison(id) || id === "workflow-comparison") {
      const comparison =
        id === "workflow-comparison"
          ? productWorkflow()
          : productDeckComparison(id);
      Object.assign(components, comparison.components);
      return comparison.html;
    }
    throw Error("Unknown product demo: " + id);
  };
  if (id === "astra-sol-hero" || !inventory.includes(id))
    throw Error("Unknown body component: " + id);
  return {
    html:
      section("demo-" + id, names[id] + " · Mock") +
      render(id, inventory.indexOf(id)),
    components,
  };
}
export function componentIndex(ids: string[]) {
  return (
    section("library", "组件目录 · Mock") +
    proseHTML(
      `<ol>${inventory
        .filter((id) => id === "astra-sol-hero" || ids.includes(id))
        .map(
          (id, i) =>
            `<li>${localLink(`${String(i + 1).padStart(2, "0")} · ${names[id]}`, id === "astra-sol-hero" ? "#product-hero" : "#demo-" + id)}</li>`,
        )
        .join("")}</ol>`,
    )
  );
}
