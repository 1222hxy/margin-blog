export function createPdfRail(
  { createElement: h, useEffect, useRef },
  PdfPage,
) {
  return function PdfRail({ index, count, id, open, change, close, document }) {
    const buttons = useRef([]),
      wasOpen = useRef(false);
    useEffect(() => {
      if (open) {
        const node = buttons.current[index - 1];
        node?.scrollIntoView({ block: "nearest", inline: "nearest" });
        if (!wasOpen.current) node?.focus({ preventScroll: true });
      }
      wasOpen.current = open;
    }, [open, index]);
    function onKey(event, page) {
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const next = {
        ArrowDown: page + 1,
        ArrowUp: page - 1,
        ArrowRight: page + (rtl ? -1 : 1),
        ArrowLeft: page + (rtl ? 1 : -1),
        Home: 1,
        End: count,
      }[event.key];
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (!next && next !== 0) return;
      event.preventDefault();
      const target = Math.max(1, Math.min(count, next));
      change(target);
      buttons.current[target - 1]?.focus({ preventScroll: true });
    }
    const railClass =
      "order-2 min-h-0 w-full shrink-0 overflow-hidden transition-[width,max-height,opacity] duration-300 motion-reduce:transition-none md:relative md:order-0 md:max-h-none ";
    return h(
      "div",
      {
        id,
        "aria-hidden": !open,
        inert: !open || undefined,
        className:
          railClass +
          (open
            ? "max-h-40 border-t border-primary-12 opacity-100 max-md:h-40 md:w-[132px] md:border-e md:border-t-0"
            : "pointer-events-none max-h-0 opacity-0 md:w-0"),
      },
      open
        ? h(
            "nav",
            {
              "aria-label": "幻灯片缩略图",
              className:
                "flex size-full flex-row gap-2 overflow-x-auto overflow-y-hidden p-2 max-md:items-center md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto",
            },
            Array.from({ length: count }, (_, i) => {
              const page = i + 1,
                selected = page === index;
              return h(
                "button",
                {
                  key: page,
                  ref: (el) => {
                    buttons.current[i] = el;
                  },
                  type: "button",
                  "aria-label": `前往幻灯片 ${page}`,
                  "aria-current": selected ? "page" : undefined,
                  tabIndex: selected ? 0 : -1,
                  className: `relative shrink-0 overflow-hidden rounded-[2px] border bg-primary-4 p-1 outline-offset-2 focus-visible:outline focus-visible:outline-primary-100 ${selected ? "border-primary-100" : "border-primary-12 hover:border-primary-60"}`,
                  onClick: () => change(page),
                  onKeyDown: (event) => onKey(event, page),
                },
                h(PdfPage, {
                  document,
                  index: page,
                  available: { width: 104, height: Infinity },
                  miniature: true,
                }),
                h(
                  "span",
                  {
                    "aria-hidden": true,
                    className:
                      "absolute inset-e-1.5 bottom-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white-100/20 bg-black-100/80 px-1.5 text-[10px] leading-none font-medium whitespace-nowrap text-white-100 tabular-nums shadow-sm backdrop-blur-sm",
                  },
                  page,
                ),
              );
            }),
          )
        : null,
    );
  };
}
