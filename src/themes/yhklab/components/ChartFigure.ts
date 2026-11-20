import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expandComponents, htmlModel } from "../../openai/lib/native";
import type { NativeComponent } from "../../openai/types";
import {
  chartAnchorClass,
  MarkdownChartFrame,
  MarkdownChartPlaceholder,
} from "./MarkdownChartFrame";
import {
  chartChunkId,
  chartChunkUrl,
  chartDependencies,
  chartFlightId,
} from "./chart-transport";

const plotSlot = "markdown-chart-plot";
const chunks = [
  ...new Set(Object.values(chartDependencies).map(({ chunk }) => chunk)),
  chartChunkUrl,
];
const sourcePlot = {
  id: chartFlightId,
  value: [chartChunkId, chunks, "default"],
};
const flightData = (data: unknown) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "string" && value.startsWith("$") ? "$" + value : value,
    ),
  );

type ClientImport = NativeComponent["modules"][number];

export function sourceChartPlot<T extends { id: string; caption: string }>(
  data: T,
) {
  return {
    client: sourcePlot,
    props: { ...data, className: chartAnchorClass },
  };
}

export function chartFigure(
  { id, caption }: { id: string; caption: string },
  plot: { client: ClientImport; props: unknown },
  fallback = "",
): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(id))
    throw new Error("Expected a chart anchor id.");
  const components = {
    [plotSlot]: {
      id: plotSlot,
      html: renderToStaticMarkup(
        React.createElement(MarkdownChartPlaceholder, { id }),
      ),
      model: ["$", "$L" + plot.client.id, ".0", flightData(plot.props)],
      modules: [plot.client],
    },
  };
  const frame = renderToStaticMarkup(
    React.createElement(MarkdownChartFrame, {
      id,
      caption,
      plot: React.createElement("template", {
        "data-openai-component": plotSlot,
      }),
    }),
  );
  return {
    id,
    html: expandComponents(frame, components) + fallback,
    model: [
      "$",
      "$Sreact.fragment",
      null,
      { children: htmlModel(frame + fallback, components) },
    ],
    modules: [plot.client],
  };
}
