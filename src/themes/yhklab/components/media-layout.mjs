export function mediaLayout() {
  const grid =
    "toc-visible:md:grid-cols-10 grid grid-cols-12 gap-x-(--grid-gap) [--grid-gap:8px] md:[--grid-gap:16px] lg:[--grid-gap:24px]";
  const wide =
    "toc-collision-target col-span-full toc-visible:@md:col-span-8 toc-visible:@md:col-start-1 @md:col-span-10 @md:col-start-2";
  const center =
    "col-span-full toc-visible:@md:col-start-1 @md:col-span-8 @md:col-start-3";
  const figureContent =
    "flex min-h-0 w-full min-w-0 flex-col gap-6 @sm:flex-row @sm:gap-x-10 @sm:has-[>:nth-child(2),>[data-dotcom-chart-group]>:nth-child(2)]:[--dotcom-chart-edge-gutter:0px] [&_[data-dotcom-chart-logical-container][style*='width:_min-content']]:[--dotcom-chart-edge-gutter:0px] [--dotcom-chart-edge-gutter:var(--container-inline-gutter,0px)] md:[--dotcom-chart-edge-gutter:0px] @md:[--dotcom-chart-edge-gutter:0px] multi-columns:[--dotcom-chart-edge-gutter:0px] shaded-container:[--dotcom-chart-edge-gutter:0px] items-center";
  const anchor =
    "scroll-mt-[calc(var(--page-top-space,var(--header-h))+var(--toc-button-h)+var(--anchor-scroll-clearance))]";
  return { grid, wide, center, figureContent, anchor };
}
