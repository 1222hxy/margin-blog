import { chartFont } from "./markdown-bar-tokens.mjs";
import { chartActions } from "./markdown-chart-actions.mjs";
import {
  chartBackground,
  chartForeground,
  chartPopover,
} from "./markdown-chart-layout.mjs";
import { chartMenuMark, downloadIcon } from "./markdown-chart-menu-icons.mjs";
import {
  menuAnimation,
  menuItemStyle,
  menuSurface,
  triggerStyle,
} from "./markdown-chart-menu-styles.mjs";

const themeVars = [
  chartBackground,
  chartForeground,
  chartPopover,
  "--color-primary-4",
  "--spacing",
  "--type-nav-size",
  "--type-nav-track",
  "--type-nav-weight",
  "--type-nav-line",
  "--transition-duration-long",
  "--transition-duration-short",
  "--transition-timing-function-primary",
];

function portalTheme(scope) {
  const computed = getComputedStyle(scope);
  const appearance = scope.closest(".dark, .light");
  const className =
    "dotcom-chart-theme-scope" +
    (appearance
      ? appearance.classList.contains("light")
        ? " light"
        : " dark"
      : "");
  const style = Object.fromEntries(
    themeVars.map((name) => [name, computed.getPropertyValue(name).trim()]),
  );
  style["--dotcom-chart-color-menu-item-focus-background"] =
    style["--color-primary-4"];
  return { className, style };
}

const menuCopy = {
  en: {
    options: "Chart options",
    png: "Download PNG",
    svg: "Download SVG",
    copy: "复制链接",
  },
  "zh-Hans": {
    options: "图表选项",
    png: "下载 PNG",
    svg: "下载 SVG",
    copy: "复制链接",
  },
};

export function createChartMenu(
  React,
  { Root, Trigger, Portal, Content, Item },
) {
  const { createElement: h, useState, useEffect } = React;
  const icon = (d, viewBox, style) =>
    h(
      "svg",
      { fill: "currentColor", height: 20, width: 20, viewBox, style },
      h("path", { d }),
    );
  return function ChartMenu({ id, view, scope, locale = "en" }) {
    const copy = menuCopy[locale] ?? menuCopy.en;
    const [open, setOpen] = useState(false);
    const [hovered, hover] = useState(false);
    const [focused, focus] = useState(false);
    const [theme, setTheme] = useState(() => portalTheme(scope));
    const shown = open || hovered || focused;
    const changeOpen = (next) => {
      if (next) setTheme(portalTheme(scope));
      setOpen(next);
    };
    useEffect(() => {
      if (!open) return;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const update = () => setTheme(portalTheme(scope));
      const observer = new MutationObserver(update);
      for (let parent = scope; parent; parent = parent.parentElement)
        observer.observe(parent, { attributes: true });
      media.addEventListener("change", update);
      return () => {
        observer.disconnect();
        media.removeEventListener("change", update);
      };
    }, [open, scope]);
    const selectAction = async (event, select) => {
      event.preventDefault();
      try {
        await select();
      } catch (error) {
        console.error("Chart menu action failed:", error);
      } finally {
        setOpen(false);
      }
    };
    return h(
      "div",
      {
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) focus(false);
        },
        onFocus: () => focus(true),
        onMouseEnter: () => hover(true),
        onMouseLeave: () => hover(false),
        style: {
          display: "inline-block",
          height: 20,
          minWidth: 20,
          position: "absolute",
          insetInlineEnd: 0,
          top: 0,
          zIndex: 20,
        },
      },
      h(
        "span",
        {
          "aria-hidden": shown || undefined,
          style: {
            background: `radial-gradient(circle farthest-side at top right, var(${chartBackground}) 75%, transparent 100%)`,
            color: `var(${chartForeground})`,
            display: "inline-flex",
            opacity: 1,
            paddingBottom: 8,
            paddingInlineStart: 8,
            transition: "opacity 200ms ease-in-out",
          },
        },
        icon(chartMenuMark, "0 0 156 154", {
          opacity: shown ? 0 : 1,
          transition: "opacity 200ms ease-in-out",
        }),
      ),
      h(
        Root,
        {
          dir: getComputedStyle(scope).direction,
          modal: false,
          open,
          onOpenChange: changeOpen,
        },
        h(
          Trigger,
          { asChild: true },
          h(
            "button",
            {
              "aria-label": copy.options,
              "data-dotcom-chart-action-menu-trigger": "",
              type: "button",
              style: { ...triggerStyle, opacity: shown ? 1 : 0 },
            },
            icon(downloadIcon, "0 0 20 20"),
          ),
        ),
        h(
          "style",
          { "data-dotcom-chart-menu-animation-styles": true },
          menuAnimation,
        ),
        h(
          Portal,
          null,
          h(
            Content,
            {
              align: "end",
              sideOffset: 4,
              className: theme.className,
              "data-dotcom-chart-menu-scope": `chart-wrapper-${id}-menu`,
              "data-dotcom-chart-menu-animation": "",
              style: { ...menuSurface, fontFamily: chartFont, ...theme.style },
            },
            chartActions(id, view, scope, copy).map(({ label, select }) =>
              h(
                Item,
                {
                  key: label,
                  "data-dotcom-chart-menu-item": "",
                  style: menuItemStyle,
                  onSelect: (event) => void selectAction(event, select),
                },
                label,
              ),
            ),
          ),
        ),
      ),
    );
  };
}
