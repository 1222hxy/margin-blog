export function createTestimonialCard({ createElement: h }) {
  const surface =
    "border-primary-12 bg-secondary-100 dark:border-primary-4 dark:bg-tertiary-100";
  const cardClass = `${surface} relative rounded-md border shadow-[0_18px_60px_rgb(0_0_0/0.08)]`;
  const tailClass = `${surface} -translate-inline-1/2 pointer-events-none absolute bottom-[-0.4rem] z-1 hidden size-3 rotate-45 rounded-xs border-e border-b md:block`;
  const figureClass =
    "col-start-1 row-start-1 grid gap-5 self-start transition-opacity duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]";
  const paragraphClass =
    "mb-(--prose-body-margin-bottom,--spacing(6)) last:mb-0";
  const testId = (part) => ({ "data-testid": `testimonial-carousel-${part}` });
  const imageStyle = (url) => ({
    backgroundImage: `url(${JSON.stringify(url)})`,
  });

  function Figure({ item, active, carousel, split = false }) {
    const hidden = carousel && !active;
    const image = item.image || item.triggerLogo;
    return h(
      "figure",
      {
        "aria-hidden": hidden || undefined,
        "aria-live": carousel && active ? "polite" : undefined,
        inert: hidden || undefined,
        className: `${figureClass}${split ? " h-full" : ""} ${hidden ? "pointer-events-none invisible opacity-0" : "opacity-100"}`,
      },
      image
        ? h(
            "div",
            {
              ...testId("card-header"),
              className: `flex items-center justify-between gap-5 ${carousel ? "mb-10" : "mb-4"}`,
            },
            h("span", {
              role: "img",
              "aria-label":
                item.imageAlt?.trim() ||
                item.triggerLogoAlt?.trim() ||
                item.label,
              className:
                item.imageDisplay === "avatar"
                  ? "ms-2 block size-[4rem] rounded-full bg-cover bg-center bg-no-repeat"
                  : "ms-2 dark:brightness-0 dark:invert block h-8 w-32 max-w-full bg-contain bg-left bg-no-repeat md:w-48",
              style: imageStyle(image),
            }),
          )
        : null,
      h(
        "blockquote",
        {
          className:
            "relative ms-[0.5em] text-h5 font-medium tracking-tight text-pretty text-primary-100",
        },
        item.removeQuotes
          ? null
          : h("span", { className: "absolute inset-s-[-0.5em] top-0" }, "“"),
        item.paragraphs.map((p, i) =>
          h(
            "p",
            {
              key: i,
              className: `${paragraphClass}${i === item.paragraphs.length - 1 && !item.removeQuotes ? " inline" : ""}`,
              ...(typeof p === "string"
                ? {}
                : { dangerouslySetInnerHTML: { __html: p.html } }),
            },
            typeof p === "string" ? p : undefined,
          ),
        ),
        item.removeQuotes ? null : "”",
      ),
      item.attribution
        ? h(
            "figcaption",
            { className: "ms-[0.5em] text-meta text-primary-60" },
            item.attribution,
          )
        : null,
    );
  }
  return { Figure, cardClass, tailClass, testId, imageStyle };
}
