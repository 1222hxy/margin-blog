// Source-derived Vega spec for the two-column Markdown bar directive. The
// stack and clip groups also preserve the treatment of repeated categories.
export const chartFont =
  "OpenAI Sans, OpenAI Sans Variable Scripts, sans-serif";
const foreground = "var(--dotcom-chart-color-foreground)";
const keyline = "var(--dotcom-chart-theme-multi-1-keyline)";
const boundedFill = "var(--dotcom-chart-theme-multi-1-bounded-fill)";
const numberFormat = ".2~f";
const signal = (expression) => ({ signal: expression });
const value = (literal) => ({ value: literal });
const groupField = (key) => ({ field: { group: key } });
const update = (properties) => ({ update: properties });

function wrapLabel(source, length) {
  const word = `regexp('([^§\\\\n]{1,${length}})(?:(?!\\\\u00A0)[\\\\s§]|$)', 'g')`;
  const part = `regexp('([^§\\\\n]{${length}})(?!§)', 'g')`;
  return signal(
    `split(replace(replace(replace(${source}, ${word}, '$1§'), ${part}, '$1§'), regexp('§+$','g'), ''), '§')`,
  );
}

function axis(scale, title) {
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
      domain: update({
        ...(horizontal
          ? { x: signal("-(4)") }
          : { y: value(0), y2: signal("height + 4") }),
        strokeCap: value("square"),
      }),
      labels: update({
        text: wrapLabel("datum.value", 25),
        ...(horizontal ? {} : { font: value("SF Mono, monospace") }),
      }),
      title: update({ text: wrapLabel(JSON.stringify(title), 40) }),
    },
    zindex: 0,
  };
}

function responsiveSignal(name, index) {
  const measure = `isFinite(containerSize()[${index}]) ? containerSize()[${index}] : 300`;
  return {
    name,
    init: measure,
    on: [{ update: measure, events: "window:resize" }],
  };
}

function stackMarks(categoryTitle, valueTitle) {
  const stage = (separator) =>
    `(isValid(datum["stage"]) ? isArray(datum["stage"]) ? join(datum["stage"], ${separator}) : datum["stage"] : ""+datum["stage"])`;
  const numeric = `format(datum["value"], "${numberFormat}")`;
  const tooltip = signal(
    `{${JSON.stringify(categoryTitle)}: ${stage("'\\n'")}, ${JSON.stringify(valueTitle)}: ${numeric}}`,
  );
  const description = signal(
    `${JSON.stringify(categoryTitle + ": ")} + ${stage("' '")} + ${JSON.stringify("; " + valueTitle + ": ")} + ${numeric}`,
  );
  const bar = {
    name: "marks",
    type: "rect",
    style: ["bar"],
    from: { data: "stack_group_main" },
    encode: update({
      tooltip,
      fill: value(boundedFill),
      stroke: value(keyline),
      ariaRoleDescription: value("bar"),
      description,
      width: groupField("width"),
      y: { scale: "y", field: "value_end" },
      y2: { scale: "y", field: "value_start" },
      cornerRadius: value(0),
    }),
  };
  const inner = {
    type: "group",
    encode: update({
      y: { ...groupField("y"), mult: -1 },
      width: groupField("width"),
    }),
    marks: [bar],
  };
  const bounds = [
    "min_value_start",
    "max_value_start",
    "min_value_end",
    "max_value_end",
  ]
    .map((key) => `scale('y',datum["${key}"])`)
    .join(",");
  return [
    {
      type: "group",
      from: {
        facet: {
          data: "data_0",
          name: "stack_group_main",
          groupby: ["stage"],
          aggregate: {
            fields: ["value_start", "value_start", "value_end", "value_end"],
            ops: ["min", "max", "min", "max"],
          },
        },
      },
      encode: update({
        x: { scale: "x", field: "stage" },
        width: signal("max(0.25, bandwidth('x'))"),
        y: signal(`min(${bounds})`),
        y2: signal(`max(${bounds})`),
        clip: value(true),
        cornerRadius: value(2),
        stroke: value(keyline),
        strokeWidth: value(1),
        strokeForeground: value(true),
        strokeOffset: value(0),
      }),
      marks: [inner],
    },
  ];
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
    axes: [axis("x", categoryTitle), axis("y", valueTitle)],
    config: {
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
      axisX: { labelFont: chartFont, offset: 4 },
      axisY: { labelFont: chartFont, offset: 4 },
      style: {
        cell: { stroke: "transparent" },
        bar: { stroke: keyline, strokeWidth: 1, cornerRadius: 2 },
      },
    },
  };
}
