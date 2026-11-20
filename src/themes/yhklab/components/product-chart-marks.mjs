import { numberFormat, signal, update, value } from "./markdown-bar-tokens.mjs";

export const validValue =
  'isValid(datum["value"]) && isFinite(+datum["value"])';
const ink = "var(--dotcom-chart-theme-multi-1-ink)";
const background = "var(--dotcom-chart-color-background)";

export function productValues(categoryTitle, valueTitle, tooltipTitle) {
  const datum = (field, separator) => {
    const ref = `datum[${JSON.stringify(field)}]`;
    return `isValid(${ref}) ? isArray(${ref}) ? join(${ref}, ${separator}) : ${ref} : ""+${ref}`;
  };
  const stage = (separator) => datum("stage", separator);
  const amount = (separator) => datum("value", separator);
  return {
    tooltip: signal(
      `{${JSON.stringify(categoryTitle)}: ${stage("'\\n'")}, ${JSON.stringify(tooltipTitle)}: ${amount("'\\n'")}}`,
    ),
    description: signal(
      [
        JSON.stringify(categoryTitle + ": "),
        `(${stage("' '")})`,
        JSON.stringify("; " + valueTitle + ": "),
        `format(datum["value"], "${numberFormat}")`,
        JSON.stringify("; " + tooltipTitle + ": "),
        `(${amount("' '")})`,
      ].join(" + "),
    ),
  };
}

export function pointLineMarks(labels) {
  const position = {
    x: { scale: "x", field: "stage" },
    y: { scale: "y", field: "value" },
  };
  return [
    {
      name: "layer_0_marks",
      type: "line",
      style: ["line"],
      sort: { field: "x" },
      from: { data: "data_0" },
      encode: update({
        stroke: value(ink),
        ...labels,
        ...position,
        strokeWidth: value(1.5),
        defined: signal(validValue),
      }),
    },
    {
      name: "layer_1_marks",
      type: "symbol",
      style: ["point"],
      from: { data: "data_1" },
      encode: update({
        opacity: value(1),
        fill: value(background),
        stroke: value(ink),
        ...labels,
        ariaRoleDescription: value("point"),
        ...position,
      }),
    },
  ];
}
