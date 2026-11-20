// Used only by opt-in reference builds; product chart components are separate.
import source from "../../openai/astra-sol/components/agents-last-exam.json";
import type { MarkdownChartData } from "./MarkdownChart";

export function archivedPlot({
  id,
  caption,
  categoryTitle,
  valueTitle,
  rows,
}: MarkdownChartData) {
  const client = source.modules.find((row) => row.value[0] === 938962);
  if (!client) throw new Error("Archived chart renderer is missing.");
  return {
    client,
    props: {
      id,
      anchorId: id,
      data: {
        dotcomConfig: {
          legendConfig: { overflowLayout: "grouped-rows" },
          theme: "multi",
          aspectRatio: 1.55,
          minHeight: 340,
        },
        vegaLiteSpec: {
          description: caption,
          mark: { type: "bar", tooltip: true },
          width: "container",
          height: 230,
          data: { values: rows.map(([stage, value]) => ({ stage, value })) },
          encoding: {
            x: {
              field: "stage",
              type: "ordinal",
              sort: null,
              title: categoryTitle,
            },
            y: { field: "value", type: "quantitative", title: valueTitle },
          },
        },
      },
    },
  };
}
