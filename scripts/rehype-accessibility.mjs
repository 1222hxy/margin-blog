// Give static GFM checkboxes the same accessible name as their list item.
export default function rehypeAccessibility() {
  return (tree) => {
    const text = (node) =>
      node.type === "text"
        ? node.value
        : (node.children || []).map(text).join("");
    const visit = (node, item) => {
      if (node.tagName === "li") item = node;
      if (
        node.tagName === "input" &&
        node.properties?.type === "checkbox" &&
        item
      ) {
        node.properties.ariaLabel = text(item).trim() || "任务";
      }
      for (const child of node.children || []) visit(child, item);
    };
    visit(tree);
  };
}
