# YhkLab Markdown chart: evidence and parity gate

Baseline: local build of `828c871`, `/notes/reading-a-graph/`. Covers the Markdown two-column `:::chart` contract; the black gallery's heterogeneous chart specs are separate. Do not switch the public content path until both plot and interaction parity pass. Styles, content and navigation remain untouched.

| Local evidence | Module or formatted lines | Behavior |
|---|---|---|
| `0_ejda_ftvsy6.js` (`ee78abf430f75cb1b04caf760a7f9481ff2381e841a50a3722fee86e60f59698`) | 938962, 4311–4496 | Anchor, idle preflight, tab staging, menu labels, link copying |
| `3jqyrjv2a5qc3.js` (`4386149c730ae95961a5c9103b87361792d7635b3e473447b962eadd6896c22b`) | 374688, 28626–28712 | 400px SSR placeholder, lazy observer (`1000px` margin), lazy deep link |
| same | 288, 20826–20898, 21034–21080, 27243–27274 | Vega 6.2.0, SVG renderer, hover, signal/resize plumbing |
| same | 22492–22670, 24969–25281, 26418–26433 | Menu, download pipeline, tooltip |
| `src/themes/openai/astra-sol/components/agents-last-exam.json` | chart config and initial SSR | Multi theme, 1.55 aspect ratio, 340px minimum, exact figure/caption classes |

Both chunks are under `public/_next/static/immutable/chunks`. Format them with repository Prettier for the line numbers above. To recapture the normalized Vega spec for the existing Markdown page, intercept the chart chunk in local Playwright and log `s` and `d.renderer` at `t=await mA(l.current,s,d)` without modifying the saved archive. The new compiler is parameterized for arbitrary rows/labels in that Markdown directive. It targets Vega's public SVG renderer directly, not the captured site renderer.

## Current replacement and measured results

- `MarkdownChartFrame.tsx` now owns the production article figure, backdrop, caption and 400px placeholder. `MarkdownChart.ts` preserves the existing plot as a single Flight slot; the archived caption component is no longer referenced by Markdown. The no-JS source table is unchanged.
- `markdown-bar-spec.mjs`, `markdown-bar-view.mjs`, and `markdown-chart-export.mjs` are the standalone path under parity tests. The browser test replaces only the plot host at the measured location and compares rendered SVG and PNG screenshot with the same observed theme on the existing article, at 390, 768 and 1440 px. SVG comparisons normalize Vega's process-local clip IDs. All three screenshot PNGs match byte for byte. At 390 px the standalone export matches the reference SVG (after the same clip-ID normalization) and PNG download bytes. The tests also compare the server figure and placeholder byte for byte.
- The complete standalone widget is not active yet. Remaining gates for the public plot slot: exact lazy-load, reflow and hash behavior; the chart's on-screen theme, branded button and menu positioning/keyboard behavior; rendering and placement of pointer tooltips; tying the existing link/PNG/SVG actions to the standalone runtime; and staging inside Markdown tabs. Re-run `node_modules/.bin/playwright test tests/yhklab-chart-plot.spec.ts tests/yhklab-widgets.spec.ts` while working on these. The product gallery/archive stays untouched.
