import { exportMarkdownBar } from "./markdown-chart-export.mjs";

async function saveChart(view, scope, type) {
  const blob = await exportMarkdownBar(view, scope, type);
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `chart.${type}`;
  link.rel = "noopener";
  try {
    link.click();
  } finally {
    // The browser consumes the blob after the synthetic click.
    window.setTimeout(() => URL.revokeObjectURL(href), 40_000);
  }
}

export function chartActions(id, view, scope, copy) {
  return [
    { label: copy.png, select: () => saveChart(view, scope, "png") },
    { label: copy.svg, select: () => saveChart(view, scope, "svg") },
    {
      label: copy.copy,
      select: () => {
        const url = new URL(window.location.href);
        url.hash = encodeURIComponent(id);
        return navigator.clipboard.writeText(url.href);
      },
    },
  ];
}
