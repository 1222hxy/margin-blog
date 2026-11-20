export function createPdfNotes({ createElement: h }) {
  return function PdfNotes({ annotations, width, height, viewport }) {
    const note = (annotation) => {
      const url =
        annotation.url && /^https?:\/\//i.test(annotation.url)
          ? annotation.url
          : null;
      const content = annotation.contentsObj?.str?.trim();
      if (!url && !content) return null;
      const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(
        annotation.rect,
      );
      const style = {
        left: `${(100 * Math.min(x1, x2)) / width}%`,
        top: `${(100 * Math.min(y1, y2)) / height}%`,
        width: `${Math.max(0, (100 * Math.abs(x2 - x1)) / width)}%`,
        height: `${Math.max(0, (100 * Math.abs(y2 - y1)) / height)}%`,
      };
      if (url)
        return h("a", {
          key: annotation.id,
          className: "yhklab-pdf-annotation",
          style,
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": content || url,
        });
      return h("button", {
        type: "button",
        key: annotation.id,
        className: "yhklab-pdf-annotation",
        style,
        title: content,
        "aria-label": content,
      });
    };
    return h(
      "div",
      { className: "yhklab-pdf-annotations" },
      annotations.filter((n) => n.rect).map(note),
    );
  };
}
