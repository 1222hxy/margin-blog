export const pdfAttributes = [
  "src",
  "poster",
  "ratio",
  "start",
  "thumbnails",
  "rail-open",
  "fullscreen",
  "full-width",
];

export function pdfWidget(node, { id, label, attributes, mediaUrl, fail }) {
  if (!label.trim()) fail(node, "pdf needs a descriptive label");
  const src = mediaUrl(node, attributes.src, true);
  if (!/\.pdf$/i.test(src.split(/[?#]/, 1)[0]))
    fail(node, "pdf needs a local .pdf source");
  const { ratio, start } = attributes;
  if (
    ratio !== undefined &&
    (!/^\d{1,4}\/\d{1,4}$/.test(ratio) ||
      ratio.split("/").some((value) => +value <= 0))
  ) {
    fail(node, "ratio must be a positive width/height ratio");
  }
  if (start !== undefined && !/^[1-9]\d{0,4}$/.test(start))
    fail(node, "start must be a positive page number");
  const boolean = (key, fallback) => {
    const value = attributes[key];
    if (value === undefined) return fallback;
    if (value === "false") return false;
    if (value === "" || value === "true") return true;
    fail(node, `${key} must be true or false`);
  };
  return {
    type: "pdf",
    id,
    src,
    title: label,
    poster: attributes.poster
      ? mediaUrl(node, attributes.poster, true)
      : undefined,
    ratio,
    initialSlide: start ? +start : undefined,
    thumbnails: boolean("thumbnails", true),
    defaultThumbnails: boolean("rail-open", false),
    allowFullscreen: boolean("fullscreen", true),
    fill: boolean("full-width", false),
  };
}
