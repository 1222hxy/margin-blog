export function createPdfDeck(
  React,
  { usePdfDocument, PdfReader, staging, grid },
) {
  const { createElement: h, useRef, useContext, useState, useCallback } = React;
  const useStage = staging
    ? () => useContext(staging)?.staged ?? false
    : () => false;
  return function PdfDeck({
    id,
    src,
    title,
    poster,
    ratio,
    fill = false,
    thumbnails = true,
    allowFullscreen = true,
    initialSlide,
    defaultThumbnails = false,
  }) {
    const frame = useRef(null);
    const staged = useStage();
    const document = usePdfDocument(src, frame, staged);
    const [decodedRatio, setDecodedRatio] = useState(null);
    const [ready, setReady] = useState(false),
      [rail, setRail] = useState(defaultThumbnails);
    const onSettle = useCallback((ratioFromPdf) => {
      setDecodedRatio(ratioFromPdf);
      setReady(true);
    }, []);
    const onError = useCallback(() => setReady(true), []);
    const busy = !ready && !document?.failed;
    const showRail = rail && thumbnails;
    const link = h(
      "a",
      { href: src, className: "underline underline-offset-4" },
      "打开 PDF",
    );
    const status = (failed) =>
      h(
        "div",
        {
          className:
            "grid size-full place-items-center px-6 text-center text-caption text-primary-100",
          role: "status",
        },
        failed ? h("span", null, "幻灯片无法使用。 ", link) : "正在加载…",
      );
    return h(
      "div",
      { className: "max-w-container @container w-full" },
      h(
        "div",
        { className: grid },
        h(
          "figure",
          {
            id,
            ref: frame,
            className: `${fill ? "col-span-full" : "col-span-full @md:col-span-8 @md:col-start-3"} font-sans`,
          },
          h(
            "div",
            {
              role: "region",
              "aria-label": title,
              "aria-roledescription": "轮播",
              "aria-busy": busy,
              tabIndex: busy ? 0 : undefined,
              "data-pdf-ready": ready || undefined,
              className:
                "relative flex min-h-60 w-full flex-col overflow-hidden rounded-sm bg-tertiary-100 focus-visible:outline " +
                (fill ? "md:min-h-0" : "md:aspect-(--deck-ratio) md:min-h-40"),
              style: { "--deck-ratio": ratio ?? decodedRatio ?? "16/9" },
            },
            h(
              "div",
              {
                className:
                  "relative grid aspect-(--deck-ratio) grow place-items-center" +
                  (fill ? "" : " md:aspect-auto") +
                  (showRail ? " md:border-s-132 md:border-transparent" : ""),
                "aria-hidden": ready || undefined,
              },
              busy && poster
                ? h("img", {
                    src: poster,
                    alt: title,
                    className:
                      "absolute inset-0 size-full object-contain" +
                      (fill ? "" : " p-3 md:p-5"),
                    loading: "lazy",
                    decoding: "async",
                  })
                : null,
              document?.failed ? status(true) : null,
            ),
            h(
              "div",
              {
                className:
                  "h-12 shrink-0 border-t border-primary-12 md:h-14" +
                  (showRail ? " max-md:mt-40" : ""),
                "aria-hidden": ready || undefined,
              },
              busy ? status(false) : null,
            ),
            document?.file
              ? h(
                  "div",
                  {
                    className: `absolute inset-0${busy ? " invisible" : ""}`,
                    inert: busy || undefined,
                  },
                  h(PdfReader, {
                    document,
                    onSettle,
                    onError,
                    fill,
                    rail,
                    setRail,
                    showThumbnails: thumbnails,
                    allowFullscreen,
                    initialSlide,
                    staged,
                  }),
                )
              : null,
          ),
          h("noscript", null, link),
        ),
      ),
    );
  };
}
