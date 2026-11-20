export function createTestimonialView(
  { createElement: h },
  { cards, controls, useCarouselState },
) {
  const { Figure, cardClass, tailClass, testId } = cards;
  const { Counter, Choices } = controls;
  const grid =
    "max-w-container @container w-full toc-visible:md:grid-cols-10 grid grid-cols-12 gap-x-(--grid-gap) [--grid-gap:8px] md:[--grid-gap:16px] lg:[--grid-gap:24px] multi-columns:flex multi-columns:px-0";
  const clipped =
    "snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain";

  return function TestimonialView({ items, eyebrow }) {
    const state = useCarouselState(items.length);
    if (!items.length) return null;
    const carousel = items.length > 1;
    const split = items.length === 2 && state.split;
    const splitView = () =>
      h(
        "div",
        {
          ...testId("split-grid"),
          className:
            "grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col gap-5 overflow-x-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible",
        },
        items.map((item, i) =>
          h(
            "div",
            { key: i, className: `${cardClass} snap-start` },
            h(
              "div",
              { className: "px-6 py-8" },
              h(Figure, { item, active: true, carousel: false, split: true }),
            ),
          ),
        ),
      );
    const carouselView = () =>
      h(
        "div",
        testId("carousel-view"),
        carousel
          ? h(Counter, {
              active: state.active,
              total: items.length,
              select: state.select,
            })
          : null,
        h(
          "div",
          { className: `${cardClass} px-6 py-8` },
          h(
            "div",
            {
              ...testId("scroll-region"),
              ref: state.track,
              onScroll: carousel ? state.scroll : undefined,
              onTouchStart: carousel ? state.interrupt : undefined,
              onWheel: carousel ? state.interrupt : undefined,
              className: `no-scrollbar relative scroll-smooth ${carousel ? clipped : "overflow-visible"}`,
            },
            h(
              "div",
              { className: "sticky inset-s-0 top-0 grid w-full" },
              items.map((item, i) =>
                h(Figure, {
                  key: i,
                  item,
                  active: i === state.active,
                  carousel,
                }),
              ),
            ),
            carousel
              ? h(
                  "div",
                  { "aria-hidden": true, className: "flex h-0 w-full" },
                  items.map((_, i) =>
                    h("div", {
                      key: i,
                      className: "h-px w-full shrink-0 snap-center snap-always",
                    }),
                  ),
                )
              : null,
          ),
          carousel
            ? h("span", {
                "aria-hidden": true,
                ...testId("tail"),
                className: tailClass,
                style: { insetInlineStart: state.tail },
              })
            : null,
        ),
        carousel
          ? h(Choices, {
              items,
              active: state.active,
              select: state.select,
              window: state.window,
            })
          : null,
      );
    return h(
      "section",
      { className: grid },
      h(
        "div",
        {
          className:
            "col-span-full toc-visible:@md:col-start-1 @md:col-span-8 @md:col-start-3",
        },
        eyebrow
          ? h(
              "div",
              { className: "mb-3 flex items-center" },
              h("p", { className: "text-meta text-primary-60" }, eyebrow),
            )
          : null,
        split ? splitView() : carouselView(),
      ),
    );
  };
}
