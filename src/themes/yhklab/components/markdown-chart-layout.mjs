import { chartFont } from "./markdown-bar-tokens.mjs";

const themeClass = "dotcom-chart-theme-scope";
export const chartBackground = "--dotcom-chart-color-background";
export const chartForeground = "--dotcom-chart-color-foreground";
export const chartPopover = "--dotcom-chart-color-popover-background";
const theme = "[data-yhklab-chart-theme]";
const ink = "--dotcom-chart-theme-multi-1-ink";
const keyline = "--dotcom-chart-theme-multi-1-keyline";
const themeCSS = `
${theme} {
  ${chartBackground}: var(--color-background);
  ${chartForeground}: var(--color-primary-solid-100);
  ${chartPopover}: var(--color-tertiary-80);
  --dotcom-chart-theme-multi-1-bounded-fill: #539af8;
  ${keyline}: #133463;
  ${ink}: #2c67c5;
}
${theme}:where(.dark, .dark *):not(:where(.dark .light, .dark .light *)) {
  ${keyline}: #e8f3fe;
  ${ink}: #63a8f8;
}
@media (prefers-color-scheme: dark) {
  ${theme}:not(:where(.light, .light *)) { ${keyline}: #e8f3fe; ${ink}: #63a8f8; }
}
`;

export function element(name, attributes = {}, style = {}, text) {
  const node = document.createElement(name);
  for (const [key, value] of Object.entries(attributes))
    node.setAttribute(key, value);
  Object.assign(node.style, style);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createChartLayout(id, caption, anchorClass, staged) {
  const gutter = "var(--dotcom-chart-edge-gutter, 0px)";
  const anchor = element(
    "div",
    { class: anchorClass },
    {
      minWidth: 0,
      width: "100%",
      fontFamily: chartFont,
    },
  );
  if (!staged) anchor.id = id;
  const scope = element(
    "div",
    {
      class: themeClass,
      id: `chart-wrapper-${id}`,
      "data-dotcom-chart-logical-container": "",
      "data-yhklab-chart-theme": "",
    },
    {
      maxWidth: "100%",
      position: "relative",
      color: `var(${chartForeground})`,
      minWidth: 0,
      width: "100%",
    },
  );
  const viewport = element(
    "div",
    { "data-dotcom-chart-scroll-viewport": "" },
    {
      marginInline: `calc(-1 * ${gutter})`,
      minWidth: 0,
      position: "relative",
      width: `calc(100% + 2 * ${gutter})`,
    },
  );
  const scroll = element(
    "div",
    {
      "data-dotcom-chart-scroll-container": "",
      dir: "ltr",
      id: `${scope.id}-scroll`,
    },
    {
      boxSizing: "border-box",
      display: "flex",
      overflowX: "auto",
      overflowY: "clip",
      paddingInline: gutter,
      scrollbarWidth: "none",
      width: "100%",
    },
  );
  const frame = element(
    "div",
    { "data-dotcom-chart-frame": "" },
    {
      marginInline: "auto",
      maxWidth: "100%",
      position: "relative",
      width: "calc(100% - 1px)",
      minHeight: "340px",
      aspectRatio: "1.55 / 1",
    },
  );
  const host = element(
    "div",
    {
      role: "graphics-document",
      "aria-roledescription": "visualization",
      "aria-label": caption,
    },
    {
      height: "100%",
      width: "100%",
      cursor: "default",
      position: "relative",
      display: "inline-block",
      boxSizing: "border-box",
    },
  );
  frame.append(host);
  scroll.append(frame);
  viewport.append(scroll);
  const header = element(
    "div",
    {},
    {
      alignItems: "flex-start",
      display: "flex",
      flexWrap: "nowrap",
      gap: "calc(var(--spacing)*3)",
      height: "0",
      width: "100%",
    },
  );
  const actions = element(
    "div",
    {},
    {
      alignItems: "center",
      display: "flex",
      flexShrink: "0",
      marginInlineStart: "auto",
    },
  );
  header.append(actions);
  scope.append(element("style", {}, {}, themeCSS), header, viewport);
  anchor.append(scope);
  return { anchor, scope, viewport, scroll, frame, host, actions };
}
