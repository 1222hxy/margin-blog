import { stackMarks } from "./markdown-bar-marks.mjs";
import {
  chartAxis,
  chartConfig,
  responsiveSignal,
} from "./markdown-bar-spec.mjs";
import { signal } from "./markdown-bar-tokens.mjs";
import {
  pointLineMarks,
  productValues,
  validValue,
} from "./product-chart-marks.mjs";

const sortField = "x_stage_sort_index";
const band = { paddingInner: 0.1, paddingOuter: 0.2 };
const stack = {
  type: "stack",
  groupby: ["stage"],
  field: "value",
  sort: { field: [], order: [] },
  as: ["value_start", "value_end"],
  offset: "zero",
};

// The product gallery uses domain-constrained bars and hollow-point lines. This
// compiler covers that contract, not arbitrary Vega-Lite specs or expressions.
export function productChartSpec({
  categoryTitle,
  valueTitle,
  rows,
  benchmark,
}) {
  const { mark, tooltipTitle, categoryOrder, valueDomain } = benchmark;
  const isBar = mark === "bar";
  const labels = productValues(categoryTitle, valueTitle, tooltipTitle);
  const order = categoryOrder
    .map(
      (stage, index) =>
        `datum["stage"]===${JSON.stringify(stage)} ? ${index} :`,
    )
    .join(" ");
  const shared = chartConfig(isBar);
  return {
    $schema: "https://vega.github.io/schema/vega/v6.json",
    autosize: { type: "fit", contains: "padding" },
    background: "transparent",
    padding: 5,
    style: "cell",
    data: [
      {
        name: "source_0",
        values: rows.map(([stage, value]) => ({ stage, value })),
      },
      {
        name: "data_0",
        source: "source_0",
        transform: [
          {
            type: "formula",
            expr: `${order} ${categoryOrder.length}`,
            as: sortField,
          },
        ],
      },
      {
        name: "data_1",
        source: "data_0",
        transform: [
          ...(isBar ? [stack] : []),
          { type: "filter", expr: validValue },
        ],
      },
    ],
    signals: [responsiveSignal("width", 0), responsiveSignal("height", 1)],
    marks: isBar
      ? stackMarks(categoryTitle, valueTitle, { data: "data_1", ...labels })
      : pointLineMarks(labels),
    scales: [
      {
        name: "x",
        type: isBar ? "band" : "point",
        domain: {
          data: "data_0",
          field: "stage",
          sort: { op: "min", field: sortField },
        },
        range: [0, signal("width")],
        ...(isBar ? band : { padding: 0.5 }),
      },
      {
        name: "y",
        type: "linear",
        domain: valueDomain,
        range: [signal("height"), 0],
        zero: true,
      },
    ],
    axes: [
      chartAxis("x", categoryTitle, isBar),
      chartAxis("y", valueTitle, isBar),
    ],
    config: {
      ...shared,
      style: {
        ...shared.style,
        line: { strokeWidth: 1.5 },
        point: {
          fill: "var(--dotcom-chart-color-background)",
          size: 50,
          strokeWidth: 1.5,
          opacity: 1,
        },
      },
    },
  };
}
