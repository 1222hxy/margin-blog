import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expandComponents, htmlModel } from "../../openai/lib/native";
import type { NativeComponent } from "../../openai/types";
import source from "../../openai/astra-sol/components/agents-last-exam.json";
import {
  MarkdownChartFrame,
  MarkdownChartPlaceholder,
} from "./MarkdownChartFrame";

const plotImport = (() => {
  const row = source.modules.find((row) => row.value[0] === 938962);
  if (!row) throw new Error("Archived chart renderer is missing.");
  return row;
})();
const plotSlot = "markdown-chart-plot";

interface MarkdownChartOptions {
  id: string;
  caption: string;
  spec: Record<string, unknown>;
  fallback: string;
}

// Only the plot slot is still archived. Keep the exact same renderer until the
// new resize, tooltip and action-menu parity tests can cover the whole slot.
export function MarkdownChart({
  id,
  caption,
  spec,
  fallback,
}: MarkdownChartOptions): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(id))
    throw new Error("Expected a chart anchor id.");
  const flightSpec = JSON.parse(
    JSON.stringify(spec, (_, v) =>
      typeof v === "string" && v.startsWith("$") ? "$" + v : v,
    ),
  );
  const components = {
    [plotSlot]: {
      id: plotSlot,
      html: renderToStaticMarkup(
        React.createElement(MarkdownChartPlaceholder, { id }),
      ),
      model: [
        "$",
        "$L" + plotImport.id,
        ".0",
        {
          id,
          anchorId: id,
          data: {
            dotcomConfig: {
              legendConfig: { overflowLayout: "grouped-rows" },
              theme: "multi",
              aspectRatio: 1.55,
              minHeight: 340,
            },
            vegaLiteSpec: flightSpec,
          },
        },
      ],
      modules: [plotImport],
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
    modules: [plotImport],
  };
}
