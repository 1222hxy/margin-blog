import {
  author,
  bodyGrid,
  entryHeader,
  part,
  recommendations,
  related,
} from "./blocks";
import type { Entry } from "./blocks";
import { readingContents } from "./components/readingContents";
import type { ArticleHeading } from "../openai/types";

const articleClass = "flex min-w-0 flex-col gap-12 @md:gap-16 mt-10";
const gridClass =
  "max-w-container @container w-full toc-visible:md:grid-cols-10 grid grid-cols-12 gap-x-(--grid-gap) [--grid-gap:8px] md:[--grid-gap:16px] lg:[--grid-gap:24px]";

interface ReadingArticleOptions {
  entry: Entry;
  body: string;
  sections: ArticleHeading[];
  tools: boolean;
  byline: boolean;
  next: boolean;
}

// Give the shared document renderer one article root. Inlining a rendered
// Astro <article> slot also inlines its dev-only Vite head tags into Flight.
export function readingArticle({
  entry,
  body,
  sections,
  tools,
  byline,
  next,
}: ReadingArticleOptions) {
  const controls = tools
    ? `<div class="contents" data-yhk-share>${part("ReadingControls")}</div>`
    : "";
  const outline = readingContents(sections);
  return (
    `<article class="${articleClass}">` +
    `<div class="flex flex-col gap-[inherit]">${entryHeader(entry)}${controls}</div>` +
    `<div class="${gridClass}">${outline}<div data-toc-content="" class="${bodyGrid}" id="article-body">${body}</div></div>` +
    (byline ? author(entry) : "") +
    (next ? related(recommendations) : "") +
    "</article>"
  );
}
