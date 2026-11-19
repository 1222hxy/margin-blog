/** Render with the public Vega API. The enclosing component supplies the host
 * geometry, colors and tooltip presentation. */
export async function mountMarkdownBar(vega, host, spec, { onTooltip } = {}) {
  host.classList.add("vega-embed");
  const view = new vega.View(vega.parse(spec), { renderer: "svg" });
  view.addSignalListener("autosize", (_, { type }) => {
    host.classList.toggle("fit-x", type === "fit" || type === "fit-x");
    host.classList.toggle("fit-y", type === "fit" || type === "fit-y");
  });
  view.hover();
  if (onTooltip)
    view.tooltip((_, event, item, value) => {
      if (event?.pointerType !== "touch") onTooltip(value ?? null, event, item);
    });
  try {
    await view.initialize(host).runAsync();
    return view;
  } catch (error) {
    view.finalize();
    throw error;
  }
}
