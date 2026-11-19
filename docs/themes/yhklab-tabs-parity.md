# YhkLab Markdown tabs: source evidence and replacement scope

The reference is this repository's immutable capture, not the current live website. The old `Tabs()` archive adapter and all captured assets remain unchanged. This port covers the Markdown `:::tabs` contract: primary, non-sticky tabs, with the first panel selected, no autoplay, icons, or configured deep links. The archive's other variants stay on the original adapter. Source CSS classes and styles are reused as-is.

## Evidence map

Line ranges are from formatting the original files with the repository's `node_modules/.bin/prettier` (the filenames are relative to `public/_next/static/immutable/chunks`).

| Reference | Lines / module | Behavior |
|---|---|---|
| `0_ejda_ftvsy6.js` (`ee78abf430f75cb1b04caf760a7f9481ff2381e841a50a3722fee86e60f59698`) | 2863–2930 / 272232; 2989–3017 / 742918 | Primary button and fixed-edge tab list markup, in source attribute/class order |
| same | 3049–3206 / 563091 | Staged Suspense panel, pending `aria-busy`, hidden/inert candidate, promotion on animation frame, 240 ms height animation, cancellation on resize or motion preference change |
| same | 3387–3416, 3482–3508, 3515–3528, 3558–3592, 3609–3641 / 563091 | Logical overflow scroll, hash removal on click (even if already selected), visibility/change event metadata, one displayed panel, wrapping arrow navigation with RTL direction, Home/End and focus handling |
| `087bnkoxxg6te.js` (`45953bbc8bda757e73420585545df750c731f9831a68f1f4d4f87edf7ce089cf`) | 463–536 / 552845; 538–559 / 330941 | Actual fixed-edge scrollable HTML; shared staging context used by legacy interactive panel content |
| `src/themes/openai/native/brand-tabs.json` | captured `html`, `model` | Completed SSR tree, Chinese tab-list label, primary/nonsticky/fluid-flow props |

This change keeps the surrounding Flight document as transport. The new tabs run the repository-owned rendering and state logic on both server and browser. The transport adapter only supplies the shell's React singleton, shared context for archived widgets nested inside panels, and existing site analytics; it does not instantiate the original tabs or scrollable modules. No new runtime endpoint for tracking is added. No CSS or navigation changes are part of the replacement.

## Verification against `8eab560`

1. Keep a baseline `dist` built from `8eab560` in a separate directory. Build and serve the candidate locally, then run `node scripts/verify-yhklab-tabs.mjs <baseline-dist> [base-url]`.
2. The verifier serves the saved reference article to two Chromium tabs and the candidate to a third. All three use the same local static assets. At 390, 768 and 1440 px, it compares the initial render, a pointer activation, ArrowRight, and wrap to the first tab. It requires equal DOM, layout rectangles, focus and URL, and decodes differing PNG hashes to measure pixel/channel deltas. One reference repeat measures browser raster variation; the hard limit is 1/255 per channel and 0.05% of pixels.
3. Captured result: homepage and black product document were byte-identical; white article `<header>`, `<article>` and `<footer>` were byte-identical. The 12 browser cases matched DOM, layout, focus and URL. Ten had byte-identical screenshots; the mobile wrap and tablet click differed by 8/40,698 and 4/103,488 pixels respectively, at most 1/255 per channel. The reference self-run had those same counts in those two cases. These are measured Chromium results, not a claim about every browser/device or about untouched component variants.
4. Playwright also checks Home/End, ArrowLeft, the 240 ms animation and easing, hash removal without dropping the query, first-panel HTML with JavaScript disabled, and both templates' navigation. The only shared script adjustment was to let the `[data-switch]` keyboard handler ignore unrelated tablists (otherwise the same key caused a null-root exception in the baseline). No navigation, page content, or CSS was changed.
