import type { ArticleHeading } from '../types';
import { attr, escapeHtml, inner, nodes, replaceInner, replaceText } from '../lib/html';
export function Contents(html: string, headings: readonly ArticleHeading[], reference: readonly ArticleHeading[]): string {
  if (JSON.stringify(headings) === JSON.stringify(reference)) return html;
  const list = nodes(html), ul = list.find(n => n.tagName === 'ul');
  const items = ul.childNodes.filter((n: any) => n.tagName === 'li');
  const markup = headings.filter(h => !h.omitFromTableOfContents).map((h, i) => {
    const li = items[i === 0 ? 0 : Math.min(1, items.length - 1)];
    const link = list.find(n => n.tagName === 'a' && n.sourceCodeLocation.startOffset >= li.sourceCodeLocation.startOffset && n.sourceCodeLocation.endOffset <= li.sourceCodeLocation.endOffset);
    return html.slice(li.sourceCodeLocation.startOffset, li.sourceCodeLocation.endOffset)
      .replace(attr(link, 'href')!, '#' + escapeHtml(h.id)).replace(inner(html, link), escapeHtml(h.text));
  }).join('');
  html = replaceInner(html, ul, markup);
  // Mobile pinned title outside the ul; desktop has no remaining match.
  const button = nodes(html).find(n => n.tagName === 'button' && attr(n, 'aria-expanded') !== undefined);
  return button ? replaceInner(html, button, replaceText(inner(html, button), reference[0]?.text || '', headings[0]?.text || '目录')) : html;
}
