import type { NativeComponent } from "../../openai/types";
import { chartFigure, sourceChartPlot } from "./ChartFigure";
import { archivedPlot } from "./markdown-chart-reference";

export interface MarkdownChartData {
  id: string;
  caption: string;
  categoryTitle: string;
  valueTitle: string;
  rows: [string, number][];
}

export function MarkdownChart({
  fallback,
  ...data
}: MarkdownChartData & { fallback: string }): NativeComponent {
  const plot =
    import.meta.env.YHKLAB_SOURCE_CHART === "0"
      ? archivedPlot(data)
      : sourceChartPlot(data);
  return chartFigure(data, plot, fallback);
}
