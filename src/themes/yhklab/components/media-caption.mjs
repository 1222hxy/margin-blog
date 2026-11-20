export function createMediaCaption({ createElement: h }) {
  return function MediaCaption({ caption, link }) {
    const action = link
      ? h(
          "a",
          {
            href: link.href,
            target: "_blank",
            rel: "noopener noreferrer",
            className:
              "transition ease-curve-a duration-250 text-primary-100 hover:text-primary-60 underline-offset-[0.25rem] decoration-1 underline relative",
          },
          `${link.label}\u00a0↗\u2060`,
          h("span", { className: "sr-only" }, "（在新窗口中打开）"),
        )
      : null;
    return h(
      "figcaption",
      {
        className:
          "col-span-full flex w-full flex-col items-center gap-3 text-caption",
      },
      h(
        "div",
        { className: "relative mt-3 w-full" },
        h(
          "div",
          { className: "flex w-full items-end justify-between" },
          h(
            "div",
            { className: "grow" },
            h(
              "div",
              { className: "text-copy-secondary text-caption text-pretty" },
              h(
                "div",
                { className: "prose prose-caption my-0! max-w-none" },
                h(
                  "p",
                  {
                    className:
                      "mb-(--prose-body-margin-bottom,--spacing(6)) last:mb-0",
                  },
                  h("em", null, caption),
                  action,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  };
}
