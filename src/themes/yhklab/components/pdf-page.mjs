export function createPdfPage(
  { createElement: h, useEffect, useRef, useState },
  PdfNotes,
) {
  return function PdfPage({
    document,
    index,
    available,
    onPaint,
    onError,
    miniature = false,
    animated = false,
  }) {
    const canvas = useRef(null),
      layer = useRef(null);
    const [pdfPage, setPdfPage] = useState(null);
    const [annotations, setAnnotations] = useState([]);
    const [rendered, setRendered] = useState(false);
    useEffect(() => {
      let active = true;
      document.file
        .getPage(index)
        .then((page) => {
          if (active) setPdfPage(page);
        })
        .catch(() => {
          if (active) onError?.();
        });
      return () => {
        active = false;
      };
    }, [document, index, onError]);
    const base = pdfPage?.getViewport({ scale: 1 });
    const width = base
      ? Math.floor(
          Math.min(
            available.width,
            available.height * (base.width / base.height),
          ),
        )
      : 0;
    useEffect(() => {
      if (!width || !pdfPage || !canvas.current) return;
      const element = canvas.current;
      const scale = width / base.width;
      const viewport = pdfPage.getViewport({ scale });
      const dpr = miniature ? 1 : globalThis.devicePixelRatio || 1;
      const bitmap = pdfPage.getViewport({ scale: scale * dpr });
      element.width = Math.max(1, Math.floor(bitmap.width));
      element.height = Math.max(1, Math.floor(bitmap.height));
      const render = pdfPage.render({
        canvas: element,
        canvasContext: element.getContext("2d", { alpha: false }),
        viewport: bitmap,
        annotationMode: document.pdf.AnnotationMode.ENABLE,
      });
      let active = true,
        text;
      void render.promise
        .then(() => {
          if (!active) return;
          setRendered(true);
          onPaint?.(base.width / base.height);
          const container = layer.current;
          if (!miniature && container) {
            container.replaceChildren();
            text = new document.pdf.TextLayer({
              textContentSource: pdfPage.streamTextContent(),
              container,
              viewport,
            });
            void text.render().catch(() => {});
            void pdfPage
              .getAnnotations({ intent: "display" })
              .then((items) => {
                if (active) setAnnotations(items);
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          if (active) onError?.();
        });
      return () => {
        active = false;
        render.cancel();
        text?.cancel();
      };
    }, [width, pdfPage, document, miniature, onPaint, onError]);
    const viewport =
      width && base ? pdfPage.getViewport({ scale: width / base.width }) : null;
    if (!viewport) return null;
    return h(
      "div",
      {
        "data-pdf-page": index,
        "data-pdf-painted": rendered || undefined,
        className: miniature
          ? "relative overflow-hidden bg-white-100 [&_canvas]:block"
          : "relative overflow-hidden bg-white-100 shadow-[0_8px_30px_rgba(0,0,0,0.35)] [&_canvas]:block" +
            (animated
              ? " motion-safe:animate-in motion-safe:fade-in-0 motion-safe:fill-mode-both motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.2,0,0,1)]"
              : ""),
        style: {
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          "--total-scale-factor": viewport.scale,
        },
      },
      h("canvas", {
        ref: canvas,
        "aria-hidden": true,
        style: { width: "100%", height: "100%" },
      }),
      miniature
        ? null
        : [
            h("div", {
              className: "yhklab-pdf-text textLayer",
              ref: layer,
              key: "selectable",
            }),
            h(PdfNotes, {
              key: "notes",
              annotations,
              width: Math.floor(viewport.width),
              height: Math.floor(viewport.height),
              viewport,
            }),
          ],
    );
  };
}
