# YhkLab video player — source and parity

The black product template uses this player for the opening video (manual playback, wide) and the path demo (centered, muted autoplay and loop). The white article template uses the same player for `::video`. These slots still use the existing local Mock media; they do not contact Vimeo. The remaining product video demonstrations compose the same player with [media tabs and a portrait frame](yhklab-product-media-parity.md).

| Local evidence | Ported behavior |
| --- | --- |
| `src/themes/openai/astra-sol/components/{intro-video,driving-demo}.json` | Placement, proportions, keyline and playback mode |
| `public/_next/static/immutable/chunks/00neekpj_5416.js`, module `646136`, formatted lines 524–780, 935–960 and 1046–1155 | HTML-file playback, viewport pause, poster selection, figure and dialog wrappers |
| `public/_next/static/immutable/chunks/3bsgwztl8krkc.js`, module `285315`, formatted lines 20–344, 352–737 and 1317–1377 | Play overlay, desktop/mobile control states, keyboard scrub, fade timing, settings and sharing |

The YhkLab implementation owns playback, controls and markup. It uses the shell's existing React, tabs staging and dialog context, not the archived video component. With JavaScript disabled, the native `<video controls>` and caption remain. Muted autoplay honors `prefers-reduced-motion`. The archive lacks the speaker and exit-fullscreen icon files used in some playback states, so these are local SVG fallbacks, not pixel-verified assets. Vimeo/YouTube embeds are out of scope for the local-file player.

## Write a video in Lab Markdown

```markdown
::video[Mock：节点依次连成路径]{src=/yhklab/path.webm poster=/yhklab/graph.svg ratio=16/9 mobile-ratio=16/9}
```

A label and a site-local `.mp4` or `.webm` source are required. `poster`, `ratio`, `mobile-ratio`, `autoplay`, and `loop` are optional. Aspect ratios default to `16/9` on desktop and inherit the desktop ratio on mobile. Playback and looping are off unless requested. The label becomes both the video accessible name and the visible caption.

## Verification

Both fixtures render the original HTML-file player and YhkLab player against the same local 4-second clip and poster. At 390, 768 and 1440 CSS px, their boxes match; the poster/play controls and desktop settings crop match everywhere except the four 7×7 px rounded-corner regions, where the test allows up to 48 differing pixels total. Playback, keyboard scrubbing, mute, rate, fullscreen, viewport pause, reduced motion, local download, share dialog, and no-JavaScript fallback are checked separately on the actual template routes.

PowerShell:

```powershell
node scripts/build-yhklab-video-reference.mjs
$env:YHKLAB_VIDEO_DIST = '.astro/video-reference'
npm test -- tests/yhklab-video.spec.ts tests/yhklab-video-markdown.spec.ts tests/yhklab-video-pixels.spec.ts
```

The fixture files are copied into routes only during the isolated build. No comparator routes are published by the normal build.
