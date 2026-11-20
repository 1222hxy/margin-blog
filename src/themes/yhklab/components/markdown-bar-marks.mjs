import {
  chartBarFill as boundedFill,
  chartBarKeyline as keyline,
  numberFormat,
  signal,
  update,
  value,
} from "./markdown-bar-tokens.mjs";

const groupField = (key) => ({ field: { group: key } });

export function stackMarks(categoryTitle, valueTitle, overrides = {}) {
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
      tooltip: overrides.tooltip ?? tooltip,
      fill: value(boundedFill),
      stroke: value(keyline),
      ariaRoleDescription: value("bar"),
      description: overrides.description ?? description,
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
          data: overrides.data ?? "data_0",
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
