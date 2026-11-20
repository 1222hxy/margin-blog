export function createPdfDocument({ useEffect, useState }) {
  let library;
  const assetRoot = "/yhklab/pdf-engine/";
  function engine() {
    library ??= import(`${assetRoot}pdf.min.mjs`).then((pdf) => {
      pdf.GlobalWorkerOptions.workerSrc = `${assetRoot}pdf.worker.min.mjs`;
      return pdf;
    });
    return library;
  }
  return function usePdfDocument(src, frame, staged) {
    const [requested, setRequested] = useState(false);
    const [result, setResult] = useState(null);
    useEffect(() => {
      if (staged || requested || !frame.current) return;
      if (typeof IntersectionObserver === "undefined") {
        setRequested(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setRequested(true);
        },
        { rootMargin: "800px 0px" },
      );
      observer.observe(frame.current);
      return () => observer.disconnect();
    }, [requested, staged]);
    useEffect(() => {
      if (!requested) return;
      let active = true,
        task;
      void engine()
        .then(async (pdf) => {
          if (!active) return;
          const root = new URL(assetRoot, location.origin);
          task = pdf.getDocument({
            url: new URL(src, location.origin).href,
            cMapUrl: new URL("cmaps/", root).href,
            cMapPacked: true,
            standardFontDataUrl: new URL("standard_fonts/", root).href,
            wasmUrl: new URL("wasm/", root).href,
            iccUrl: new URL("iccs/", root).href,
            isEvalSupported: false,
          });
          const file = await task.promise;
          if (active) setResult({ pdf, file });
        })
        .catch(() => {
          if (active) setResult({ failed: true });
        });
      return () => {
        active = false;
        void task?.destroy().catch(() => {});
      };
    }, [src, requested]);
    return result;
  };
}
