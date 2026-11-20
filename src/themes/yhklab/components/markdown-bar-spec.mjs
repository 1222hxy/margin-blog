// Source-derived Vega spec for the two-column Markdown bar directive. The
// stack and clip groups also preserve the treatment of repeated categories.
import { stackMarks } from "./markdown-bar-marks.mjs";
import {
  chartBarKeyline as keyline,
  chartFont,
  chartForeground as foreground,
  numberFormat,
  signal,
  update,
  value,
} from "./markdown-bar-tokens.mjs";

function wrapLabel(source, length) {
  const word = `regexp('([^§\\\\n]{1,${length}})(?:(?!\\\\u00A0)[\\\\s§]|$)', 'g')`;
  const part = `regexp('([^§\\\\n]{${length}})(?!§)', 'g')`;
  return signal(
    `split(replace(replace(replace(${source}, ${word}, '$1§'), ${part}, '$1§'), regexp('§+$','g'), ''), '§')`,
  );
}

export function chartAxis(scale, title, squareDomain = true) {
  const horizontal = scale === "x";
  return {
    scale,
    orient: horizontal ? "bottom" : "left",
    grid: false,
    title,
    ...(horizontal
      ? { labelBaseline: "top" }
      : {
          format: numberFormat,
          labelAlign: "right",
          labelOverlap: true,
          tickCount: signal("ceil(height/40)"),
        }),
    encode: {
      ...(squareDomain
        ? {
            domain: update({
              ...(horizontal
                ? { x: signal("-(4)") }
                : { y: value(0), y2: signal("height + 4") }),
              strokeCap: value("square"),
            }),
          }
        : {}),
      labels: update({
        text: wrapLabel("datum.value", 25),
        ...(horizontal ? {} : { font: value("SF Mono, monospace") }),
      }),
      title: update({ text: wrapLabel(JSON.stringify(title), 40) }),
    },
    zindex: 0,
  };
}

export function responsiveSignal(name, index) {
  const measure = `isFinite(containerSize()[${index}]) ? containerSize()[${index}] : 300`;
  return {
    name,
    init: measure,
    on: [{ update: measure, events: "window:resize" }],
  };
}

export function markdownBarSpec({ caption, categoryTitle, valueTitle, rows }) {
  return {
    $schema: "https://vega.github.io/schema/vega/v6.json",
    description: caption,
    autosize: { type: "fit", contains: "padding" },
    background: "transparent",
    padding: 5,
    style: "cell",
    data: [
      {
        name: "source_0",
        values: rows.map(([stage, amount]) => ({
          stage,
          value: Number(amount),
        })),
      },
      {
        name: "data_0",
        source: "source_0",
        transform: [
          {
            type: "stack",
            groupby: ["stage"],
            field: "value",
            sort: { field: [], order: [] },
            as: ["value_start", "value_end"],
            offset: "zero",
          },
          {
            type: "filter",
            expr: 'isValid(datum["value"]) && isFinite(+datum["value"])',
          },
        ],
      },
    ],
    signals: [responsiveSignal("width", 0), responsiveSignal("height", 1)],
    marks: stackMarks(categoryTitle, valueTitle),
    scales: [
      {
        name: "x",
        type: "band",
        domain: { data: "data_0", field: "stage" },
        range: [0, signal("width")],
        paddingInner: 0.1,
        paddingOuter: 0.2,
      },
      {
        name: "y",
        type: "linear",
        domain: { data: "data_0", fields: ["value_start", "value_end"] },
        range: [signal("height"), 0],
        nice: true,
        zero: true,
      },
    ],
    axes: [chartAxis("x", categoryTitle), chartAxis("y", valueTitle)],
    config: chartConfig(),
  };
}

export function chartConfig(squareDomain = true) {
  return {
    axis: {
      labelColor: foreground,
      titleColor: foreground,
      domainColor: foreground,
      tickColor: foreground,
      gridColor: "var(--dotcom-chart-color-secondary-foreground)",
      labelFontSize: 12,
      labelLineHeight: 12 * 1.2,
      titleFontSize: 14,
      titleLineHeight: 14 * 1.2,
      labelFontWeight: "normal",
      titleFontWeight: "normal",
      ticks: true,
      grid: false,
      labelFlush: false,
      labelAngle: 0,
      labelPadding: 10,
      titlePadding: 20,
      titleFont: chartFont,
      labelLimit: 1000,
    },
    axisX: { labelFont: chartFont, ...(squareDomain ? { offset: 4 } : {}) },
    axisY: { labelFont: chartFont, ...(squareDomain ? { offset: 4 } : {}) },
    style: {
      cell: { stroke: "transparent" },
      bar: { stroke: keyline, strokeWidth: 1, cornerRadius: 2 },
    },
  };
}
