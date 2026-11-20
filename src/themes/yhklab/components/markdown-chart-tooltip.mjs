import { chartFont } from "./markdown-bar-tokens.mjs";
import {
  chartBackground,
  chartForeground,
  element,
} from "./markdown-chart-layout.mjs";

import { bindChartTouch } from "./markdown-chart-touch.mjs";

const isEmpty = (value) => ["undefined", "", null, undefined].includes(value);

function tooltipContent(value) {
  if (isEmpty(value)) return [];
  if (typeof value !== "object")
    return [element("p", {}, { margin: 0 }, value)];
  const [heading, rows] = [value[""], element("dl", {}, { margin: 0 })];
  for (const [key, field] of Object.entries(value)) {
    if (!key || isEmpty(field)) continue;
    const row = element("div");
    row.append(
      element("dt", {}, { display: "inline" }, `${key}: `),
      element("dd", {}, { display: "inline", margin: 0 }, field),
    );
    rows.append(row);
  }
  const content = [];
  if (!isEmpty(heading))
    content.push(
      element(
        "h3",
        {},
        {
          margin: "0 0 4px",
          fontSize: "inherit",
          fontWeight: 500,
        },
        heading,
      ),
    );
  if (rows.childElementCount) content.push(rows);
  return content;
}

export function createChartTooltip(id, { host, scope, scroll }) {
  const source = element(
    "span",
    {
      class: "dotcom-chart-theme-scope",
      "aria-hidden": "true",
      "data-dotcom-chart-tooltip-source": id,
    },
    { display: "none" },
  );
  const bubble = element(
    "div",
    {
      "data-dotcom-chart-tooltip-scope": id,
    },
    {
      boxSizing: "border-box",
      padding: "8px",
      pointerEvents: "none",
      position: "fixed",
      zIndex: 49,
    },
  );
  const inner = element(
    "div",
    {},
    {
      background: `var(${chartForeground})`,
      borderRadius: "16px",
      color: `var(${chartBackground})`,
      fontFamily: chartFont,
      fontSize: "14px",
      lineHeight: "20px",
      maxWidth: "300px",
      padding: "8px 12px",
      width: "max-content",
    },
  );
  bubble.append(inner);
  let lastValue,
    above = false;
  const listeners = new AbortController();
  const scrollListeners = { passive: true, signal: listeners.signal };
  function clear() {
    bubble.remove();
    source.remove();
    lastValue = undefined;
  }
  function show(value, event) {
    if (!event || isEmpty(value)) return clear();
    if (value !== lastValue) {
      const content = tooltipContent(value);
      if (!content.length) return clear();
      inner.replaceChildren(...content);
      lastValue = value;
    }
    if (!bubble.isConnected) {
      scope.after(source);
      document.body.append(bubble);
    }
    const appearance = scope.closest(".light, .dark");
    bubble.className =
      "dotcom-chart-theme-scope" +
      (appearance
        ? appearance.classList.contains("light")
          ? " light"
          : " dark"
        : "");
    const style = getComputedStyle(scope);
    for (const name of [chartBackground, chartForeground])
      bubble.style.setProperty(name, style.getPropertyValue(name));
    const scale =
      Number(style.getPropertyValue("--dotcom-chart-render-scale")) || 1;
    bubble.style.transform = scale === 1 ? "" : `scale(${scale})`;
    bubble.style.transformOrigin = scale === 1 ? "" : "top left";
    const { clientWidth, clientHeight } = document.documentElement;
    const width = bubble.offsetWidth * scale;
    const height = bubble.offsetHeight * scale;
    const aboveY = event.clientY - height - 12;
    const y = above
      ? aboveY >= 0
        ? aboveY
        : event.clientY + 12
      : event.clientY;
    bubble.style.left = `${Math.min(clientWidth - width, Math.max(0, event.clientX))}px`;
    bubble.style.top = `${Math.min(clientHeight - height, Math.max(0, y))}px`;
  }
  for (let parent = scroll; parent; parent = parent.parentElement) {
    if (
      !["auto", "scroll"].includes(getComputedStyle(parent).overflowY) ||
      parent.scrollHeight <= parent.clientHeight
    )
      continue;
    parent.addEventListener("scroll", clear, scrollListeners);
    break;
  }
  window.addEventListener("scroll", clear, scrollListeners);
  document.addEventListener(
    "touchstart",
    (event) => {
      if (!scope.contains(event.target)) clear();
    },
    scrollListeners,
  );
  bindChartTouch(host, scroll, listeners.signal, clear, (mark) => {
    above = mark.above;
    try {
      mark.target.dispatchEvent(
        new MouseEvent("pointermove", {
          clientX: mark.x,
          clientY: mark.y,
          bubbles: true,
          cancelable: true,
        }),
      );
    } finally {
      above = false;
    }
  });
  return {
    show,
    clear,
    dispose() {
      listeners.abort();
      clear();
    },
  };
}
