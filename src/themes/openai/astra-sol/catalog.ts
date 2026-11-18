import type { NativeComponent } from "../types";
const sources = import.meta.glob<NativeComponent>("./components/*.json", {
  eager: true,
  import: "default",
});
export const catalog = {
  "astra-sol-hero": "Astra / Sol 动态刊头",
  "agents-last-exam": "Agents’ Last Exam · 成本与得分",
  "science-benchmarks": "科学评测 · 双标签图",
  "intelligence-benchmarks": "综合能力 · 多标签图",
  "frontier-code": "FrontierCode 2.0",
  lifeval: "LifeVal",
  "harvey-lab": "Harvey LAB-AA",
  gdpval: "GDPval v2",
  "workbook-comparison": "工作簿与备忘录对照",
  "slide-comparison": "幻灯片对照",
  "customer-carousel": "客户引语轮播",
  "intro-video": "文章开场视频",
  "driving-demo": "驾驶仿真",
  "mechanical-design": "机械设计与装配",
  "lamp-design": "纸灯设计",
  "web-design": "网页设计演示",
  "cad-showcase": "CAD 设计演示",
  "interactive-worlds": "交互式场景",
  "customer-quote": "单条客户引语",
  "workflow-comparison": "工作流对照",
  "security-benchmarks": "安全能力评测",
  "patch-benchmarks": "补丁评测",
  "alignment-benchmarks": "对齐评估",
} as const;
export type LaunchComponentId = keyof typeof catalog;
/** Each call returns an independent, editable SSR + original client model pair. */
export function launchComponent(id: LaunchComponentId): NativeComponent {
  const source = sources[`./components/${id}.json`];
  if (!source) throw Error("Unknown launch component: " + id);
  return structuredClone(source);
}
/** Supply a trusted Vega-Lite spec; the native renderer owns tooltips,
 * responsive sizing, color tokens and axes. No source model names are fixed. */
export function benchmarkChart(options: {
  id: string;
  spec: Record<string, unknown>;
  caption: string;
}): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(options.id))
    throw Error("Expected a chart anchor id.");
  const c = launchComponent("agents-last-exam");
  // Flight escapes strings beginning with $, including custom expression text.
  const encode = (v: any): any =>
    Array.isArray(v)
      ? v.map(encode)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)]))
        : typeof v === "string" && v.startsWith("$")
          ? "$" + v
          : v;
  const visit = (v: any): void => {
    if (!v || typeof v !== "object") return;
    const p = v[3];
    if (p?.data?.vegaLiteSpec) {
      p.id = p.anchorId = options.id;
      p.data.vegaLiteSpec = encode(options.spec);
      return;
    }
    if (v[1] === "em" && typeof p?.children === "string")
      p.children = encode(options.caption);
    for (const child of Object.values(v)) visit(child);
  };
  visit(c.model);
  const escaped = options.caption.replace(
    /[&<>]/g,
    (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[t]!,
  );
  c.id = options.id;
  c.html = c.html
    .replace('id="agents-last-exam"', 'id="' + options.id + '"')
    .replace(/(<em>)[\s\S]*?(<\/em>)/, (_, a, b) => a + escaped + b);
  return c;
}
