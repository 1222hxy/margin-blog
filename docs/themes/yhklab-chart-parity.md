# YhkLab Markdown chart: evidence and parity gate

Baseline: local build of `828c871`, `/notes/reading-a-graph/`. Covers the Markdown two-column `:::chart` contract; the black gallery uses a [separately verified benchmark contract](yhklab-product-chart-parity.md). The default Markdown `:::chart` path now uses the source chart. Its original implementation is still available in a test-only comparison build. Existing page styles, content and navigation are unchanged.

| Local evidence | Module or formatted lines | Behavior |
|---|---|---|
| `0_ejda_ftvsy6.js` (`ee78abf430f75cb1b04caf760a7f9481ff2381e841a50a3722fee86e60f59698`) | 938962, 4311–4496 | Anchor, idle preflight, tab staging, menu labels, link copying |
| `3jqyrjv2a5qc3.js` (`4386149c730ae95961a5c9103b87361792d7635b3e473447b962eadd6896c22b`) | 374688, 28626–28712 | 400px SSR placeholder, lazy observer (`1000px` margin), lazy deep link |
| same | 288, 20826–20898, 21034–21080, 27243–27274 | Vega 6.2.0, SVG renderer, hover, signal/resize plumbing |
| same | 22492–22670, 24969–25281 | Menu and download pipeline |
| same | 25300–25333, 28140–28179, 28265–28610 | Geometry and resize |
| same | 26418–26433, 27864–27950 | Pointer and tap tooltip inputs |
| `0_ejda_ftvsy6.js` | 978118, 7038–7265 | Tooltip markup, portal placement and viewport clamping |
| `087bnkoxxg6te.js` | 330941 | Tab staging defer/release |
| `src/themes/openai/astra-sol/components/agents-last-exam.json` | chart config and initial SSR | Multi theme, 1.55 aspect ratio, 340px minimum, exact figure/caption classes |

Both chunks are under `public/_next/static/immutable/chunks`. Format them with repository Prettier for the line numbers above. To recapture the normalized Vega spec for the existing Markdown page, intercept the chart chunk in local Playwright and log `s` and `d.renderer` at `t=await mA(l.current,s,d)` without modifying the saved archive. The new compiler is parameterized for arbitrary rows/labels in that Markdown directive. It targets Vega's public SVG renderer directly, not the captured site renderer.

## Current replacement and measured results

- `MarkdownChartFrame.tsx` owns the production article figure, backdrop, caption and 400px placeholder. `MarkdownChart.ts` sends typed chart data to a source-owned React/Flight slot; the archived caption and renderer components are no longer referenced by the default Markdown path. The no-JS source table is unchanged.
- `markdown-bar-spec.mjs`, `markdown-bar-view.mjs`, and `markdown-chart-export.mjs` are the standalone path under parity tests. The browser test replaces only the plot host at the measured location and compares rendered SVG and PNG screenshot with the same observed theme on the existing article, at 390, 768 and 1440 px. SVG comparisons normalize Vega's process-local clip IDs. All three screenshot PNGs match byte for byte. At 390 px the standalone export matches the reference SVG (after the same clip-ID normalization) and PNG download bytes. The tests also compare the server figure and placeholder byte for byte.
- The standalone browser path is split into `markdown-chart-layout.mjs` (geometry and chart-specific theme), `markdown-chart-lifecycle.mjs` (scheduling and resize observation), `markdown-chart-runtime.mjs` (mount/cleanup), `markdown-chart-tooltip.mjs` (tooltip placement and rendering) and `markdown-chart-touch.mjs` (tap targeting). The live-article differential test substitutes only the interactive chart slot in the candidate browser. It compares SVG and computed colors after viewport and container resize, then checks pointer tooltip contents and placement in light/dark and the mobile tap tooltip against the archived page. Additional fixtures exercise lazy loading, initial hash and the staging callback contract. These fixtures do not replace an integration test through the actual Markdown tabs.
- `article-chart.mjs` is the React adapter for the current shell. `markdown-chart-menu.mjs`, `markdown-chart-menu-styles.mjs`, and `markdown-chart-actions.mjs` own the chart menu, appearance, download, and copy behavior. Only generic React/portal/Radix primitives are taken from the existing shell. Vega 6.2.0 is loaded separately on the first near-viewport render.
- The compiled route checks cover the branded trigger, pointer and keyboard dismissal/focus, menu placement/appearance, real clipboard and PNG/SVG downloads, and byte-identical closed chart/open menu captures at 390, 768, and 1440 px. The compiled private Markdown fixture holds the Vega request while changing tabs; the old tab remains visible until the source chart is ready. The fixture is never part of a normal build.

## Reproduce the differential checks

1. `npm run build`, then serve `dist` with `npm run preview` on port 4321. Use production preview for byte and pixel comparisons. In Astro dev the reading view passes an explicit article body to the document shell so Vite head tags do not become article content or enter its Flight model.
2. `node scripts/build-yhklab-chart-candidate.mjs` makes `.astro/chart-reference` (legacy, `YHKLAB_SOURCE_CHART=0`) and `.astro/chart-candidate` (source plus the disposable tab fixture). The script removes the temporary content file even if the build fails.
3. Set `YHKLAB_ARCHIVED_CHART_DIST=.astro/chart-reference` and `YHKLAB_SOURCE_CHART_DIST=.astro/chart-candidate`, then run `npm test -- tests/yhklab-chart-plot.spec.ts tests/yhklab-chart-runtime.spec.ts tests/yhklab-chart-menu.spec.ts tests/yhklab-chart-screenshot.spec.ts tests/yhklab-chart-tabs-integration.spec.ts tests/yhklab-widgets.spec.ts`. The comparison tests serve those built files from the preview origin via Playwright routes. The standard tests still check the current public path without the archived build.
