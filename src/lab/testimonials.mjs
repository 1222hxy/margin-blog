// Testimonial groups use ordinary Markdown paragraphs for the quotation body.
export const testimonialAttributes = {
  testimonials: [],
  testimonial: ["by", "image", "alt", "display", "trigger-logo"],
};

export function lowerTestimonial({
  name,
  label,
  children,
  parent,
  attributes,
  node,
  mediaUrl,
  fail,
  lower,
  element,
  nextId,
}) {
  if (name === "testimonials") {
    if (
      children.length === 0 ||
      children.some(
        (item) =>
          item.type !== "containerDirective" || item.name !== "testimonial",
      )
    ) {
      fail(node, "testimonials must contain only labeled testimonial blocks");
    }
    return element(
      "lab-testimonials",
      { id: nextId(), "data-eyebrow": label },
      children.map((item) => lower(item, node)),
    );
  }
  if (parent?.name !== "testimonials" || !label.trim())
    fail(node, "testimonial needs a label and a testimonials parent");
  if (
    children.length === 0 ||
    children.some((item) => item.type !== "paragraph")
  )
    fail(node, "testimonial body must contain Markdown paragraphs");
  const { by, image, alt, display, "trigger-logo": triggerLogo } = attributes;
  if (display && !["logo", "avatar"].includes(display))
    fail(node, "testimonial display must be logo or avatar");
  return element(
    "lab-testimonial",
    {
      "data-label": label,
      "data-by": by || "",
      ...(image ? { "data-image": mediaUrl(node, image, true) } : {}),
      ...(alt ? { "data-alt": alt } : {}),
      ...(display ? { "data-display": display } : {}),
      ...(triggerLogo
        ? { "data-trigger-logo": mediaUrl(node, triggerLogo, true) }
        : {}),
    },
    children.map((child) => lower(child, node)),
  );
}

export function finishTestimonials(node, stringify) {
  const id = node.properties.id;
  const eyebrow = node.properties["data-eyebrow"] || undefined;
  const items = node.children
    .filter((child) => child.tagName === "lab-testimonial")
    .map((card) => {
      const props = card.properties;
      return {
        label: props["data-label"],
        attribution: props["data-by"],
        ...(props["data-image"] ? { image: props["data-image"] } : {}),
        ...(props["data-alt"] ? { imageAlt: props["data-alt"] } : {}),
        ...(props["data-display"]
          ? { imageDisplay: props["data-display"] }
          : {}),
        ...(props["data-trigger-logo"]
          ? { triggerLogo: props["data-trigger-logo"] }
          : {}),
        paragraphs: card.children
          .filter((block) => block.tagName === "p")
          .map((block) => ({
            html: stringify({ type: "root", children: block.children }),
          })),
      };
    });
  return { type: "testimonials", id, eyebrow, items };
}
