export const embedAttributes = ["src", "fullscreen"];

export function embedWidget(node, { id, label, attributes, mediaUrl, fail }) {
  if (!label.trim()) fail(node, "embed needs a descriptive label");
  const src = mediaUrl(node, attributes.src, true);
  if (
    attributes.fullscreen !== undefined &&
    !["", "true", "false"].includes(attributes.fullscreen)
  ) {
    fail(node, "fullscreen must be true or false");
  }
  return {
    type: "embed",
    id,
    src,
    title: label,
    fullscreen: ["", "true"].includes(attributes.fullscreen),
  };
}
