export function createPdfReader(
  React,
  { PdfPage, PdfRail, PdfControls, usePdfInteraction, status },
) {
  const { createElement: h, useId, useRef, useState, useCallback } = React;
  return function PdfReader({
    document,
    onSettle,
    onError,
    fill,
    rail,
    setRail,
    showThumbnails,
    allowFullscreen,
    initialSlide,
    staged,
  }) {
    const count = document.file.numPages;
    const frame = useRef(null),
      sizeRegion = useRef(null),
      railButton = useRef(null);
    const [index, setIndex] = useState(
      Math.max(1, Math.min(count, initialSlide || 1)),
    );
    const [announcement, setAnnouncement] = useState("");
    const [animated, setAnimated] = useState(false);
    const [pageFailed, failPage] = useState(false);
    const { size, fullscreen, trapTab } = usePdfInteraction(frame, sizeRegion);
    const railId = useId();
    const label = (i) => `第 ${i} 张幻灯片，共 ${count} 张`;
    function change(next, announce = true) {
      const current = Math.max(1, Math.min(count, next));
      if (index === current) return;
      failPage(false);
      setAnimated(true);
      setIndex(current);
      if (announce) setAnnouncement(label(current));
    }
    const fail = useCallback(() => {
      failPage(true);
      onError();
    }, [onError]);
    function navigation(event) {
      if (
        event.target !== event.currentTarget &&
        event.target.closest("a,button,input,select,textarea,[contenteditable]")
      )
        return;
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const next = {
        ArrowLeft: index + (rtl ? 1 : -1),
        ArrowRight: index + (rtl ? -1 : 1),
        Home: 1,
        End: count,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      change(next, false);
    }
    return h(
      "div",
      {
        ref: frame,
        className: `flex size-full min-h-0 flex-col overflow-hidden rounded-sm bg-tertiary-100 text-primary-100${fullscreen.active ? " rounded-none" : ""}`,
        onKeyDown: trapTab,
      },
      h(
        "div",
        { className: "flex min-h-0 flex-auto md:flex-1" },
        h(
          "div",
          { className: "flex min-h-0 w-full flex-1 flex-col md:flex-row" },
          showThumbnails && count > 1
            ? h(PdfRail, {
                document,
                index,
                count,
                id: railId,
                open: rail,
                change,
                close: () => {
                  setRail(false);
                  railButton.current?.focus();
                },
              })
            : null,
          h(
            "div",
            {
              className:
                "order-1 flex min-h-0 w-full min-w-0 flex-1 items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-100 md:order-0" +
                (fill && !fullscreen.active ? "" : " p-3 md:p-5"),
              role: "group",
              tabIndex: 0,
              "aria-label": label(index),
              "aria-roledescription": "幻灯片",
              "aria-keyshortcuts": "ArrowLeft ArrowRight Home End",
              onKeyDown: navigation,
            },
            h(
              "div",
              {
                ref: sizeRegion,
                className:
                  "flex size-full min-h-0 min-w-0 items-center justify-center focus-visible:outline-none",
              },
              pageFailed
                ? status(true)
                : h(PdfPage, {
                    key: index,
                    document,
                    index,
                    available: size,
                    animated: animated && !staged,
                    onPaint: onSettle,
                    onError: fail,
                  }),
            ),
          ),
        ),
      ),
      h(PdfControls, {
        index,
        count,
        change,
        rail,
        showThumbnails,
        railId,
        toggleRail: () => setRail(!rail),
        railButton,
        fullscreen: {
          ...fullscreen,
          supported: allowFullscreen && fullscreen.supported,
        },
      }),
      h(
        "div",
        {
          className: "sr-only",
          role: "status",
          "aria-live": "polite",
          "aria-atomic": true,
        },
        announcement,
      ),
    );
  };
}
