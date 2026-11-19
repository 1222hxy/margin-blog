import type { ReactNode } from "react";

export const chartAnchorClass =
  "scroll-mt-[calc(var(--page-top-space,var(--header-h))+var(--toc-button-h)+var(--anchor-scroll-clearance))]";
const figureGrid =
  "max-w-container @container w-full toc-visible:md:grid-cols-10 grid grid-cols-12 gap-x-(--grid-gap) [--grid-gap:8px] md:[--grid-gap:16px] lg:[--grid-gap:24px]";
const backdrop =
  "col-span-full flex min-h-0 flex-col gap-6 col-span-full toc-visible:@md:col-start-2 @md:col-span-6 @md:col-start-4 min-w-0 rounded-lg border border-primary-12 px-(--figure-backdrop-padding) pt-2 pb-(--figure-backdrop-padding) [--figure-backdrop-padding:--spacing(3)] @sm:pt-4 @sm:[--figure-backdrop-padding:--spacing(5)] bg-secondary-100/20 backdrop-blur-xs";
const content =
  "flex min-h-0 w-full min-w-0 flex-col gap-6 @sm:flex-row @sm:gap-x-10 @sm:has-[>:nth-child(2),>[data-dotcom-chart-group]>:nth-child(2)]:[--dotcom-chart-edge-gutter:0px] [&_[data-dotcom-chart-logical-container][style*='width:_min-content']]:[--dotcom-chart-edge-gutter:0px] [--dotcom-chart-edge-gutter:var(--figure-backdrop-padding)] items-center";

export function MarkdownChartPlaceholder({ id }: { id: string }) {
  return <div id={id} className={chartAnchorClass} style={{ height: 400 }} />;
}

/** Exact figure used by the source's single-chart group. The plot slot can
 * remain a static placeholder until the standalone chart mounts. */
export function MarkdownChartFrame({
  id,
  caption,
  plot,
}: {
  id: string;
  caption: string;
  plot?: ReactNode;
}) {
  return (
    <div className="group col-span-full not-first:mt-16 not-last:mb-16">
      <figure className={`${figureGrid} ${chartAnchorClass}`}>
        <div data-tabs-autoplay-content="true" className={backdrop}>
          <div data-figure-content="true" className={content}>
            {plot ?? <MarkdownChartPlaceholder id={id} />}
          </div>
          <figcaption className="col-span-full flex w-full flex-col items-center gap-3 text-caption">
            <div className="relative mt-3 w-full">
              <div className="flex w-full items-end justify-between">
                <div className="grow">
                  <div className="text-copy-secondary text-caption text-pretty">
                    <div className="prose prose-caption my-0! max-w-none">
                      <p className="mb-(--prose-body-margin-bottom,--spacing(6)) last:mb-0">
                        <em>{caption}</em>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
