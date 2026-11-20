import { markdownBarSpec } from "./markdown-bar-spec.mjs";
import { mountMarkdownBar } from "./markdown-bar-view.mjs";
import { createChartLayout } from "./markdown-chart-layout.mjs";
import { createChartTooltip } from "./markdown-chart-tooltip.mjs";
import {
  matchesChartHash,
  observeChartSize,
  scheduleChartLoad,
} from "./markdown-chart-lifecycle.mjs";

/** Mount onto a React-owned plot slot without replacing the slot itself.
 * SSR, Astro, and the Flight transport aren't needed to exercise this controller. */
export function mountArticleChart(
  slot,
  options,
  { loadVega, onError = console.error, placeholderIsSlot = false },
) {
  const { id, caption } = options;
  const placeholder = placeholderIsSlot ? slot : slot.firstElementChild;
  if (!(placeholder instanceof HTMLElement))
    throw new Error("Chart placeholder is missing.");
  const anchorClass = placeholder.className;
  const originalStyle = placeholder.style.cssText;
  function showLayout(anchor) {
    if (placeholderIsSlot) {
      slot.removeAttribute("id");
      slot.removeAttribute("class");
      slot.style.cssText = "display: contents";
    }
    slot.replaceChildren(anchor);
  }
  function restorePlaceholder() {
    if (placeholderIsSlot) {
      slot.replaceChildren();
      slot.className = anchorClass;
      slot.style.cssText = originalStyle;
    } else slot.replaceChildren(placeholder);
  }
  let stage = options.stage;
  let started = false;
  let disposed = false;
  let failed = false;
  let layout, view, tooltip;
  let cancelLoad, cancelSize, releaseStage;
  let settle;
  const ready = new Promise((resolve) => {
    settle = resolve;
  });

  function start() {
    if (started || disposed) return;
    started = true;
    cancelLoad?.();
    void draw();
  }

  function syncAnchor() {
    const anchor = layout?.anchor ?? placeholder;
    if (stage?.staged) anchor.removeAttribute("id");
    else anchor.id = id;
  }

  async function draw() {
    try {
      const vega = await loadVega();
      if (disposed) return;
      const spec = options.benchmark
        ? (await import("./product-chart-spec.mjs")).productChartSpec(options)
        : markdownBarSpec(options);
      if (disposed) return;
      layout = createChartLayout(
        id,
        options.benchmark ? "Vega visualization" : caption,
        anchorClass,
        stage?.staged,
      );
      showLayout(layout.anchor);
      if (!stage?.staged && matchesChartHash(id))
        layout.anchor.scrollIntoView({ behavior: "instant" });
      tooltip = createChartTooltip(id, layout);
      view = await mountMarkdownBar(vega, layout.host, spec, {
        onTooltip: tooltip.show,
      });
      if (disposed) {
        view.finalize();
        return;
      }
      cancelSize = observeChartSize(layout.host, view, onError);
      settle({ view, ...layout });
    } catch (error) {
      if (disposed) return;
      failed = true;
      tooltip?.dispose();
      layout = undefined;
      restorePlaceholder();
      syncAnchor();
      settle(null);
      onError(error);
    } finally {
      releaseStage?.();
      releaseStage = undefined;
    }
  }

  function setStage(next) {
    if (disposed) return;
    releaseStage?.();
    releaseStage = undefined;
    stage = next;
    syncAnchor();
    if (stage?.staged) tooltip?.clear();
    if (stage?.dormant) return;
    if (!view && !failed) releaseStage = stage?.defer?.();
    if (started) return;
    if (stage?.staged || matchesChartHash(id)) start();
    else if (!cancelLoad) cancelLoad = scheduleChartLoad(placeholder, start);
  }
  setStage(stage);
  return {
    ready,
    setStage,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelLoad?.();
      cancelSize?.();
      releaseStage?.();
      releaseStage = undefined;
      settle(null);
      tooltip?.dispose();
      view?.finalize();
      restorePlaceholder();
      placeholder.id = id;
    },
  };
}
