// Export mark preserved from the archived SVG output (not shown in article branding).
export const exportMark =
  "M59.733 56.192v-14.57c0-1.227.46-2.148 1.533-2.76l29.293-16.87c3.988-2.3 8.742-3.374 13.649-3.374 18.404 0 30.06 14.263 30.06 29.446 0 1.073 0 2.3-.154 3.527l-30.366-17.79q-2.76-1.611-5.521 0zm68.4 56.745V78.122c0-2.147-.921-3.681-2.761-4.754L86.878 50.977l12.576-7.209c1.073-.613 1.994-.613 3.067 0l29.293 16.87c8.436 4.908 14.109 15.337 14.109 25.458 0 11.655-6.9 22.391-17.79 26.839zM50.684 82.264l-12.576-7.361c-1.073-.613-1.533-1.534-1.533-2.76v-33.74c0-16.41 12.576-28.833 29.6-28.833 6.441 0 12.421 2.147 17.484 5.981L53.446 33.035c-1.84 1.073-2.76 2.607-2.76 4.755v44.475zm27.07 15.643L59.731 87.785v-21.47l18.021-10.122 18.02 10.122v21.47zm11.578 46.623c-6.442 0-12.422-2.148-17.484-5.981l30.212-17.485c1.84-1.073 2.761-2.606 2.761-4.754V71.834l12.73 7.361c1.073.613 1.533 1.534 1.533 2.761v33.74c0 16.409-12.73 28.833-29.752 28.833zm-36.348-34.2L23.691 93.46c-8.436-4.908-14.11-15.336-14.11-25.458 0-11.809 7.056-22.391 17.944-26.839V76.13c0 2.148.92 3.681 2.76 4.754l38.342 22.237-12.576 7.209c-1.073.613-1.994.613-3.067 0m-1.686 25.152c-17.33 0-30.06-13.037-30.06-29.14 0-1.227.154-2.454.307-3.681l30.212 17.484q2.761 1.61 5.521 0l38.494-22.237v14.57c0 1.227-.46 2.147-1.533 2.76l-29.293 16.87c-3.988 2.3-8.742 3.374-13.65 3.374zm38.034 18.249c18.557 0 34.046-13.189 37.575-30.673 17.176-4.448 28.219-20.551 28.219-36.96 0-10.736-4.601-21.164-12.883-28.68.767-3.22 1.228-6.441 1.228-9.66 0-21.931-17.791-38.342-38.342-38.342-4.14 0-8.128.612-12.116 1.993C86.111 4.661 76.603.367 66.174.367 47.617.367 32.128 13.556 28.6 31.04 11.423 35.488.381 51.59.381 68c0 10.737 4.6 21.165 12.882 28.68-.767 3.22-1.227 6.441-1.227 9.661 0 21.93 17.79 38.341 38.342 38.341 4.14 0 8.127-.612 12.115-1.993 6.9 6.748 16.41 11.042 26.84 11.042";

/** Export the untitled single-bar-chart variant. The displayed caption belongs
 * to the figure and is not a chart title or filename. */
export async function exportMarkdownBar(view, scope, type, mark = exportMark) {
  const raw = await view.toSVG();
  const svg = new DOMParser().parseFromString(raw, "image/svg+xml");
  const root = svg.documentElement;
  if (!(root instanceof SVGSVGElement))
    throw new Error("Could not export chart SVG.");

  const style = getComputedStyle(scope);
  const scheme =
    style.colorScheme.trim() === "dark" || scope.closest(".dark")
      ? "dark"
      : "light";
  const readColor = (name, fallback) =>
    style.getPropertyValue(name).trim() || fallback;
  const background = readColor("--dotcom-chart-color-background", "#ffffff");
  const foreground = readColor("--dotcom-chart-color-foreground", "#000");
  const [x, y, width, height] = root
    .getAttribute("viewBox")
    .split(/\s+/)
    .map(Number);
  const exportWidth = Math.max(width, 20) + 64;
  const exportHeight = height + 68;
  const node = (name, attributes) => {
    const el = svg.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attributes))
      el.setAttribute(key, String(value));
    return el;
  };
  const deck = node("g", {
    role: "presentation",
    transform: `translate(${x}, ${y + 24})`,
  });
  const logoOffset =
    style.direction === "rtl" ? 32 : 32 + Math.max(0, width - 20);
  const logo = node("g", {
    role: "presentation",
    "aria-hidden": "true",
    focusable: "false",
    transform: `translate(${logoOffset}, 0) scale(${20 / 156})`,
  });
  logo.append(node("path", { d: mark, fill: foreground }));
  deck.append(logo);
  const content = node("g", { transform: `translate(${x + 32}, ${y + 68})` });
  for (const child of [...root.children]) {
    if (!["defs", "style"].includes(child.localName)) content.append(child);
  }
  const back = node("rect", {
    x,
    y,
    width: exportWidth,
    height: exportHeight,
    fill: background,
    stroke: "none",
    role: "presentation",
    "aria-hidden": "true",
    "data-vega-export-background": "true",
  });
  root.append(back, deck, content);
  root.setAttribute("width", String(exportWidth));
  root.setAttribute("height", String(exportHeight));
  root.setAttribute("viewBox", `${x} ${y} ${exportWidth} ${exportHeight}`);
  root.style.setProperty("color-scheme", scheme);
  const xml = new XMLSerializer()
    .serializeToString(root)
    .replace(/var\((--[\w-]+)\)/g, (_, name) => readColor(name, "#000"));
  const blob = new Blob([xml], { type: "image/svg+xml" });
  if (type === "svg") return blob;

  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const padding = 24;
    const scale = Math.max(window.devicePixelRatio, 2);
    const width = image.width + padding * 2;
    const height = image.height + padding * 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create the chart PNG canvas.");
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, padding, padding);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Could not encode chart PNG.")),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
