# Folio benchmark chart parity

Reference: the existing `/products/folio/` Mock gallery, built with `YHKLAB_SOURCE_CHART=0`. The default build uses source code for all thirteen benchmark plots. Changes are limited to benchmark sections; the black hero, header/footer and site stylesheets are unchanged.

| Local evidence | Reproduced contract |
| --- | --- |
| `src/themes/openai/astra-sol/components/agents-last-exam.json` | Figure, 400px placeholder, anchor and caption; `multi` tokens, `1.55` aspect ratio and `340px` minimum |
| `public/_next/static/immutable/chunks/3jqyrjv2a5qc3.js`, SHA-256 `4386149c730ae95961a5c9103b87361792d7635b3e473447b962eadd6896c22b` | Compare the Vega input logged immediately before `mA(l.current,s,d)`. The archived compiler supplies sorted category domains, explicit `[0,100]`, square axis offsets only on bars, clipped stacks, and line plus hollow symbol layers |
| Same chunk, formatted lines 16065–16152, 25281–25296 | Axis, stroke and point styles and localized chart menu copy |

The default gallery compiles its structured rows to Vega directly with `product-chart-spec.mjs` and `product-chart-marks.mjs`. `ChartFigure.ts` pairs the same static figure with the source chart slot shared with Markdown articles. The article chart keeps its existing menu labels; the product uses its captured `图表选项`, `下载 PNG`, `下载 SVG`, `复制链接` labels. This is the existing Folio chart contract, not a general Vega-Lite implementation.

## Verification

- Default and reference product HTML compare byte-for-byte after excluding the changing Flight payload. The decoded active payload has one source slot per plot, with the existing ten default anchors and three additional tab anchors.
- All thirteen actual plots compare SVG (normalizing only process-local Vega clip IDs) and computed mark colors at 390, 768 and 1440px. At each width, the representative live bar, line and open Chinese menu compare exact PNG screenshot bytes in fresh browser pages. Keeping screenshot states independent avoids mixing in prior menu and chart repaint states; this is not a whole-page pixel claim.
- The representative line uses real pointer hover, real SVG/PNG downloads (same normalized SVG and identical PNG bytes), and the clipboard action on the product URL.

Build the two fixtures with `node scripts/build-yhklab-chart-candidate.mjs`. Serve the current build, set `YHKLAB_ARCHIVED_CHART_DIST=.astro/chart-reference`, and run `npm test -- tests/yhklab-product-charts.spec.ts tests/yhklab-product-chart-pixels.spec.ts tests/yhklab-product-chart-actions.spec.ts tests/yhklab-product-benchmark-tabs.spec.ts`.

## Multi-plot groups

`science-benchmarks` and `cost-performance-benchmarks` use the captured pill-group nesting from their corresponding local component JSON. The original tab countdown, hover pause, input/visibility gates and six-second duration are documented in `0_ejda_ftvsy6.js` (formatted lines 2824–2930 and 3212–3390). The active tab now contains the plot and its caption; other panels are staged or dormant in the shared owned tabs controller. `product-benchmark-tabs.ts` defines the two- and three-panel sets. `tabs-autoplay.mjs` and `tabs-deep-link.mjs` keep the opt-in behavior separate from ordinary Markdown tabs. A copied chart anchor can reopen a dormant panel.
