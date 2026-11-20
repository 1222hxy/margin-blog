import { escapeHtml as esc } from "../openai/lib/html";
import { mediaLayout } from "./components/media-layout.mjs";

const { grid, anchor, figureContent } = mediaLayout();
const section =
  "group/component-group @container [--component-container-gutter:initial] [--component-container-max-width:initial]";
const page = "max-w-container @container w-full";
const content =
  "multi-columns:flex multi-columns:px-0 in-data-article-contained:flex in-data-article-contained:flex-col";
const group = "group col-span-full not-first:mt-6";
const mediaGroup = "group col-span-full not-first:mt-16 not-last:mb-16";
const textColumn =
  "col-span-full toc-visible:@md:col-start-2 @md:col-span-6 @md:col-start-4";
const prose = `${textColumn} max-w-none min-w-0 in-[:where(li)]:contents`;
const items = "col-span-full grid w-full grid-cols-1 items-stretch";
const paragraph = (html: string) =>
  `<p class="mb-(--prose-body-margin-bottom,--spacing(6)) last:mb-0">${html}</p>`;
const pageBlock = (html: string) =>
  `<div class="${page} ${grid} ${content}">${html}</div>`;
const proseBlock = (html: string) =>
  pageBlock(`<div class="${prose} not-first:mt-6">${paragraph(html)}</div>`);
export const slot = (id: string) =>
  `<template data-openai-component="${esc(id)}"></template>`;

function stack(blocks: string[], collision = false) {
  const collisionClass = collision ? " toc-collision-target" : "";
  return `<div class="${group}"><section class="${section}" data-layout="1-column-grid"><div class="@container w-full ${grid}"><div class="${items} gap-12 @md:gap-16${collisionClass}">${blocks.join("")}</div></div></section></div>`;
}

export function deckComparisonLayout(tabsId: string, introduction: string) {
  return stack([
    proseBlock(`Mock · ${esc(introduction)}`),
    pageBlock(slot(tabsId)),
  ]);
}

function deckPair(columns: readonly { id: string; heading: string }[]) {
  const pair = columns
    .map(({ id, heading }) => {
      const title = `<div class="${prose} not-first:mt-16"><h4 id="${esc(id)}-title" data-article-heading="" class="text-h5 ${anchor}">${esc(heading)}</h4></div>`;
      return `<div class="${page} flex min-w-0 flex-col [--component-container-gutter:0px] ${content}">${title}<div class="${group}">${slot(id)}</div></div>`;
    })
    .join("");
  return pageBlock(
    `<div class="${group}"><section class="${section}" data-layout="2-column-grid" data-multi-columns="true"><div class="@container w-full ${grid} max-w-container"><div class="${items} gap-5 @md:gap-6 @md:grid-cols-2 @md:gap-y-12">${pair}</div></div></section></div>`,
  );
}

interface ReferenceSlide {
  prompt: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

function referenceSlide({ prompt, src, alt, width, height }: ReferenceSlide) {
  const image = `<div class="size-full"><div class="group relative overflow-hidden rounded-md aspect-auto size-full bg-transparent transition-[background] duration-medium ease-curve-d"><img alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" class="mx-auto" src="${esc(src)}"></div></div>`;
  const bubble = `<div class="w-full p-5 @md:p-6"><div class="ms-6 rounded-lg bg-primary-4 p-4 text-p1 @md:ms-8">${paragraph(`Mock · ${esc(prompt)}`)}${image}</div></div>`;
  return pageBlock(
    `<div class="${mediaGroup}"><figure class="${page} ${grid} ${anchor}"><div data-tabs-autoplay-content="true" class="col-span-full flex min-h-0 flex-col gap-6 ${textColumn}"><div data-figure-content="true" class="${figureContent}">${bubble}</div></div></figure></div>`,
  );
}

export function pairedDeckLayout(
  columns: readonly { id: string; heading: string }[],
  notes: readonly string[],
  reference?: ReferenceSlide,
) {
  return stack(
    [
      ...(reference ? [referenceSlide(reference)] : []),
      deckPair(columns),
      ...notes.map((note) => proseBlock(`<em>Mock · ${esc(note)}</em>`)),
    ],
    true,
  );
}
