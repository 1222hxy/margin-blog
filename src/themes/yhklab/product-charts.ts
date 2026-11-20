import {
  benchmarkChart,
  type LaunchComponentId,
} from "../openai/astra-sol/catalog";
import { chartFigure, sourceChartPlot } from "./components/ChartFigure";

export const chartIds: readonly LaunchComponentId[] = [
  "agents-last-exam",
  "science-benchmarks",
  "intelligence-benchmarks",
  "frontier-code",
  "lifeval",
  "harvey-lab",
  "gdpval",
  "security-benchmarks",
  "patch-benchmarks",
  "alignment-benchmarks",
];
const categoryOrder = ["采集", "整理", "复核"];
const valueDomain = [0, 100];
const categoryTitle = "阶段";
const valueTitle = "Mock 刻度";
const tooltipTitle = "Mock 值";
const additionalRows = [
  [15, 11, 8],
  [18, 14, 10],
];

export function productChart(
  key: LaunchComponentId,
  title: string,
  index: number,
  variant = 0,
) {
  const id = `chart-${key}-${variant}`;
  const caption = `${title} · Mock 数据，单位为演示刻度。`;
  const mark = index % 2 ? "line" : "bar";
  const rows = categoryOrder.map((stage, i): [string, number] => [
    stage,
    additionalRows[variant - 1]?.[i] ?? 15 + ((index * 11 + i * 17) % 69),
  ]);
  if (import.meta.env.YHKLAB_SOURCE_CHART === "0") {
    return benchmarkChart({
      id,
      caption,
      spec: {
        width: "container",
        height: 200,
        mark: { type: mark, ...(mark === "line" ? { point: true } : {}) },
        data: { values: rows.map(([stage, value]) => ({ stage, value })) },
        encoding: {
          x: {
            field: "stage",
            type: "nominal",
            sort: categoryOrder,
            title: categoryTitle,
          },
          y: {
            field: "value",
            type: "quantitative",
            title: valueTitle,
            scale: { domain: valueDomain },
          },
          tooltip: [
            { field: "stage", title: categoryTitle },
            { field: "value", title: tooltipTitle },
          ],
        },
      },
    });
  }
  return chartFigure(
    { id, caption },
    sourceChartPlot({
      id,
      caption,
      categoryTitle,
      valueTitle,
      rows,
      locale: "zh-Hans",
      benchmark: { mark, categoryOrder, tooltipTitle, valueDomain },
    }),
  );
}
