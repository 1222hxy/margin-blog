# YhkLab article contents — source and parity

Scope: the white reading template's desktop rail and mobile contents button. The original site header, article copy, page spacing, stylesheets, and black product page are not changed. The two captured nav fragments are used as the SSR frames; the existing sample's static HTML is byte-identical.

| Captured local evidence | Behavior reproduced |
| --- | --- |
| `src/themes/openai/blueprint/{MobileContents,DesktopContents}.html` | Baseline HTML, font/spacing classes, closed mobile chevron and inert state |
| `271tskne3zlp0.js`, module `953200`, formatted lines 1621–2037 | Selected classes, rail collision tolerance of 32 CSS px, mobile header crossing, open/close behavior, smooth scroll using the anchor margin without changing the address, list auto-scroll |
| `1_37yixhv5zdx.js`, heading observer lines 79–190 and outline lines 493–575 | Heading ordering, up to three visible levels; an H3 can disclose deeper children; active heading intersection margins |

Chunks live in `public/_next/static/immutable/chunks`; format with the repository Prettier to reproduce line numbers. The running implementation is split into `public/yhklab/article-contents.js`, `contents-position.js`, `contents-collision.js`, `contents-mobile.js`, and `contents-branches.js`, and does not invoke the captured Next.js TOC. If the shared React shell replaces the server-rendered article during hydration, the controller rebinds once to the live elements and disconnects the old listeners and observers. The static reading document receives an explicit article fragment rather than a rendered Astro `<article>` slot, which had inserted Vite's development-only head tags ahead of the article in the embedded Flight model.

Run `npm test -- tests/yhklab-contents.spec.ts tests/yhklab-contents-collision.spec.ts tests/yhklab-contents-branches.spec.ts`. At 768, 1440, and 1707 CSS px (the last at 1.5× device scale), geometry, color and the four-row pixel crop are compared with the local archived article, using equal labels and duplicates of its inactive row. Desktop and mobile navigation use the actual Markdown article. A separate browser test runs on both implementations: a clipped element must not hide the rail; exposing the same element hides it; hiding the element reveals the rail again.

The branch regressions exercise Markdown-to-outline rendering, collapsed child selection through its visible ancestor, and mounting against replaced article markup. The flat row crop is compared with the archived component. At 1× the PNGs are byte-identical. At 1.5×, Chromium can rasterize an otherwise identical sticky text row one physical pixel higher or lower; CSS-pixel row rectangles remain exact, and each row must match pixel-for-pixel after at most that vertical snap.
