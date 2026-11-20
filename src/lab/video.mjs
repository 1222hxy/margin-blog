export const videoAttributes = [
  "src",
  "poster",
  "ratio",
  "mobile-ratio",
  "autoplay",
  "loop",
];

export function videoWidget(node, { id, label, attributes, mediaUrl, fail }) {
  if (!label.trim()) fail(node, "video needs a descriptive label");
  const src = mediaUrl(node, attributes.src, true);
  if (!/\.(?:webm|mp4)$/i.test(src.split(/[?#]/, 1)[0]))
    fail(node, "video needs a local .webm or .mp4 source");
  const aspect = (value, key) => {
    if (value === undefined) return undefined;
    if (
      !/^\d{1,4}\/\d{1,4}$/.test(value) ||
      value.split("/").some((term) => Number(term) === 0)
    )
      fail(node, `${key} must be a positive width/height ratio`);
    return value;
  };
  const boolean = (key) => {
    const value = attributes[key];
    if (value === undefined || value === "false") return false;
    if (value === "" || value === "true") return true;
    fail(node, `${key} must be true or false`);
  };
  return {
    type: "video",
    id,
    src,
    label,
    caption: label,
    poster: attributes.poster
      ? mediaUrl(node, attributes.poster, true)
      : undefined,
    ratio: aspect(attributes.ratio, "ratio"),
    mobileRatio: aspect(attributes["mobile-ratio"], "mobile-ratio"),
    autoplay: boolean("autoplay"),
    loop: boolean("loop"),
    width: "center",
  };
}
