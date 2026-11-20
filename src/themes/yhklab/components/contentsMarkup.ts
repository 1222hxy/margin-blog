import {
  attr,
  inner,
  nodes,
  replaceInner,
  escapeHtml,
} from "../../openai/lib/html";
import { contentsOutline, type ContentsNode } from "./contentsOutline";
import type { ArticleHeading } from "../../openai/types";

const desktopIndent = ["", "ms-3.5", "ms-6.5"];
const mobileIndent = ["ms-6", "ms-9.5", "ms-12.5"];
const listClass = "flex w-full flex-col";

// Archived 953200 / 717367: the arrow is only rendered for an H3 with children.
function branchToggle(id: string, mobile: boolean) {
  const size = mobile ? "mt-2.5" : "mt-2";
  return `<button type="button" aria-expanded="false" aria-labelledby="${id}" class="absolute inset-e-full top-[0.5lh] flex size-6 -translate-y-1/2 items-center justify-end pe-px text-primary-60 hover:text-primary-100 focus-visible:outline focus-visible:outline-primary-100 ${size}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="2.641 -1.25 11.563 18.5" aria-hidden="true" class="size-2.5 transition-transform motion-reduce:transition-none rtl:rotate-180"><path fill="currentColor" d="M5.47 12.47a.75.75 0 1 0 1.06 1.06l4.765-4.764a1.083 1.083 0 0 0 0-1.532L6.53 2.47a.75.75 0 1 0-1.06 1.06L9.94 8z" style="fill-opacity:1"></path></svg></button>`;
}

function contents(frame: string, tree: ContentsNode[], mobile: boolean) {
  const elements = nodes(frame);
  const list = elements.find((node) => node.tagName === "ul");
  const items = list.childNodes.filter(
    (node: { tagName: string }) => node.tagName === "li",
  );
  const selected = tree[0].heading;
  const indent = mobile ? mobileIndent : desktopIndent;
  const listItems = (branch: ContentsNode[], depth = 0): string =>
    branch
      .map(({ heading, children }) => {
        const item = items[Number(heading.id !== selected.id)];
        const link = item.childNodes[0].childNodes[0];
        const { startOffset, endOffset } = item.sourceCodeLocation;
        let row = frame
          .slice(startOffset, endOffset)
          .replace(
            `href="${attr(link, "href")}"`,
            () => `href="#${escapeHtml(heading.id)}"`,
          )
          .replace(
            `>${inner(frame, link)}</a>`,
            () => `>${escapeHtml(heading.text)}</a>`,
          );
        if (depth)
          row = row.replace(
            `leading-tight${indent[0] ? " " + indent[0] : ""}"`,
            `leading-tight ${indent[depth]}"`,
          );
        if (!children.length) return row;
        const collapsible = heading.headlineTag === "h3";
        if (collapsible) {
          const id = `contents-${mobile ? "mobile" : "desktop"}-${escapeHtml(heading.id)}`;
          row = row.replace(
            "<a ",
            () => `${branchToggle(id, mobile)}<a id="${id}" `,
          );
        }
        const nested = `<ul class="${listClass}"${collapsible ? " hidden" : ""}>${listItems(children, depth + 1)}</ul>`;
        return row.slice(0, -5) + nested + "</li>";
      })
      .join("");
  const markup = replaceInner(frame, list, listItems(tree));
  if (!mobile) return markup;
  const label = elements.find(
    (node) =>
      node.tagName === "button" && attr(node, "aria-expanded") !== undefined,
  ).childNodes[0];
  return markup.replace(
    `>${inner(frame, label)}</span>`,
    () => `>${escapeHtml(selected.text)}</span>`,
  );
}

export function renderReadingContents(
  headings: readonly ArticleHeading[],
  frames: { mobile: string; desktop: string },
) {
  const { tree, count } = contentsOutline(headings);
  if (count < 2) return "";
  return (
    contents(frames.mobile, tree, true) + contents(frames.desktop, tree, false)
  );
}
