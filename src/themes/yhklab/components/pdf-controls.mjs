export function createPdfControls({ createElement: h }) {
  const cls =
    "ease-curve-a disabled:text-gray-40 items-center justify-center outline-offset-2 duration-200 focus-visible:outline focus-visible:outline-offset-0 flex rounded-full transition size-8 text-primary-100 hover:bg-none hover:text-primary-60 hover:[&>svg]:opacity-60 focus-visible:outline-primary-100 disabled:opacity-50";
  const icons = "/icons/cms/27bb77900ed6df73/";
  function button(label, icon, props) {
    const art =
      icon === "collapse"
        ? h("path", {
            d: "M14 2l-5 5m4.5 0H9V2.5M2 14l5-5m-4.5 0H7v4.5",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.35,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          })
        : h("use", {
            href: `${icon === "sidebar-hidden" ? "/icons/cms/a7687e3ce5db398c/" : icons}${icon}.svg#size-16`,
            width: 16,
            height: 16,
          });
    return h(
      "button",
      { type: "button", "aria-label": label, className: cls, ...props },
      h(
        "svg",
        {
          width: 16,
          height: 16,
          viewBox: "0 0 16 16",
          className: `size-4${icon.startsWith("arrow-") && icon.endsWith("-lg") ? " rtl:-scale-x-100" : ""}`,
        },
        art,
      ),
    );
  }
  return function PdfControls({
    index,
    count,
    change,
    rail,
    showThumbnails,
    railId,
    toggleRail,
    railButton,
    fullscreen,
  }) {
    return h(
      "div",
      {
        className:
          "grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t border-primary-12 px-2 md:h-14 md:px-3",
      },
      h(
        "div",
        { className: "justify-self-start" },
        showThumbnails && count > 1
          ? button(
              rail ? "隐藏幻灯片缩略图" : "显示幻灯片缩略图",
              rail ? "sidebar-hidden" : "sidebar",
              {
                ref: railButton,
                "aria-controls": railId,
                "aria-expanded": rail,
                onClick: toggleRail,
              },
            )
          : null,
      ),
      h(
        "div",
        { className: "flex items-center gap-1.5 md:gap-2" },
        button("上一张幻灯片", "arrow-left-lg", {
          disabled: index <= 1,
          onClick: () => change(index - 1),
        }),
        h(
          "span",
          {
            "aria-hidden": true,
            className: "min-w-14 text-center text-caption tabular-nums",
          },
          `${index} / ${count}`,
        ),
        button("下一张幻灯片", "arrow-right-lg", {
          disabled: index >= count,
          onClick: () => change(index + 1),
        }),
      ),
      h(
        "div",
        { className: "justify-self-end" },
        fullscreen.supported
          ? button(
              fullscreen.active ? "退出全屏" : "进入全屏",
              fullscreen.active
                ? "collapse"
                : "arrow-up-right-arrow-down-left-md",
              { onClick: fullscreen.toggle },
            )
          : null,
      ),
    );
  };
}
