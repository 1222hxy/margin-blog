export function createTestimonialControls(
  { createElement: h },
  { testId, imageStyle },
) {
  const iconDirectory = "/icons/cms/27bb77900ed6df73";
  const arrowClass =
    "ease-curve-a disabled:text-gray-40 items-center justify-center outline-offset-2 duration-200 focus-visible:outline focus-visible:outline-offset-0 flex rounded-sm transition size-8";
  const enabled =
    "text-primary-60 hover:bg-primary-4 hover:[&>svg]:opacity-60 focus:outline-primary-44";
  const choiceClass =
    "relative flex min-h-11 items-center justify-center bg-transparent p-2 text-center text-caption text-primary-60 transition-[background-color,color,opacity,transform] duration-short ease-curve-a focus-visible:z-1 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary-44 active:scale-98";
  const countClass = "text-meta text-primary-60";
  const fade =
    "linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)";
  const clip = "linear-gradient(#000 0 0)";

  function Counter({ active, total, select }) {
    const arrow = (direction, className, label, disabled, step) =>
      h(
        "button",
        {
          type: "button",
          className: `${arrowClass} ${className}`,
          disabled,
          "aria-label": label,
          onClick: () => select(active + step),
        },
        h(
          "svg",
          { width: 16, height: 16, viewBox: "0 0 16 16" },
          h("use", {
            href: `${iconDirectory}/arrow-${direction}-lg.svg#size-16`,
            width: 16,
            height: 16,
          }),
        ),
      );
    return h(
      "div",
      { className: "mb-3 flex justify-end" },
      h(
        "div",
        {
          ...testId("controls"),
          className: "flex shrink-0 items-center gap-3",
        },
        h(
          "span",
          { className: countClass },
          `${active + 1} 条/ 共 ${total} 条`,
        ),
        h(
          "div",
          { className: "flex" },
          arrow(
            "left",
            active === 0
              ? "focus:outline-primary-44 text-btn-media-label"
              : `${enabled} active:scale-95`,
            "上一条客户评价",
            active === 0,
            -1,
          ),
          arrow(
            "right",
            `${enabled} -ms-1 active:scale-95`,
            "下一条客户评价",
            false,
            1,
          ),
        ),
      ),
    );
  }

  function Choices({ items, active, select, window }) {
    const { size, paged, start, activeStart, progress } = window;
    const itemStyle = { flex: `0 0 ${100 / items.length}%` };
    const list = {
      transform: paged
        ? `translate3d(-${(start / items.length) * 100}%, 0, 0)`
        : undefined,
      width: `${(items.length / size) * 100}%`,
    };
    const labelsOnly = items.every((item) => !item.triggerLogo);
    const maskPosition = `${(100 * progress) / (items.length - 1)}% 0`;
    const maskSize = `${100 / items.length}% 100%`;
    return h(
      "div",
      {
        className: "relative mt-3 overflow-hidden",
        style: paged
          ? {
              maskImage: fade,
              maskRepeat: "no-repeat",
              maskSize: "100% 100%",
              paddingInline: "16px",
              WebkitMaskImage: fade,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
            }
          : undefined,
      },
      labelsOnly
        ? h(
            "div",
            {
              "aria-hidden": true,
              className:
                "pointer-events-none absolute inset-0 z-1 hidden md:block",
              style: { paddingInline: paged ? "16px" : undefined },
            },
            h(
              "ul",
              {
                className: "flex",
                style: {
                  ...list,
                  maskImage: clip,
                  maskPosition,
                  maskRepeat: "no-repeat",
                  maskSize,
                  WebkitMaskImage: clip,
                  WebkitMaskPosition: maskPosition,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskSize: maskSize,
                },
              },
              items.map(({ label }, i) =>
                h(
                  "li",
                  { key: i, className: "min-w-0 px-1", style: itemStyle },
                  h(
                    "div",
                    {
                      className:
                        "flex min-h-11 w-full items-center justify-center rounded-full p-2 text-center text-caption text-balance text-primary-100",
                    },
                    label,
                  ),
                ),
              ),
            ),
          )
        : null,
      h(
        "ul",
        { className: "relative flex", style: list, "aria-label": "客户评价" },
        items.map(({ label, triggerLogo }, i) => {
          const selected = i === active;
          const skin = triggerLogo
            ? `w-fit max-w-full rounded-sm${selected ? " text-primary-100 opacity-100" : " opacity-60 hover:opacity-100"}`
            : `w-full rounded-full hover:bg-primary-4${selected ? ` text-primary-100${labelsOnly ? " md:text-primary-60" : ""}` : ""}`;
          return h(
            "li",
            {
              key: i,
              className: `min-w-0 px-1${triggerLogo ? " flex justify-center" : ""}`,
              style: itemStyle,
            },
            h(
              "button",
              {
                type: "button",
                "aria-current": selected,
                "aria-label": `显示来自 ${label} 的推荐语`,
                tabIndex:
                  i >= activeStart && i < activeStart + size ? undefined : -1,
                className: `${choiceClass} ${skin}`,
                onClick: () => select(i),
              },
              triggerLogo
                ? h("span", {
                    "aria-hidden": true,
                    className:
                      "block h-8 w-44 max-w-full bg-contain bg-center bg-no-repeat md:h-10 dark:brightness-0 dark:invert",
                    style: imageStyle(triggerLogo),
                  })
                : null,
              h(
                "span",
                { className: triggerLogo ? "sr-only" : "text-balance" },
                label,
              ),
            ),
          );
        }),
      ),
    );
  }
  return { Counter, Choices };
}
