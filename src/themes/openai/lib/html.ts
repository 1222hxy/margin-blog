import { parseFragment } from 'parse5';
export type HtmlNode = any;
export function nodes(html: string): HtmlNode[] {
  const result: HtmlNode[] = [];
  const visit = (node: HtmlNode) => { result.push(node); for (const child of node.childNodes || []) visit(child); };
  visit(parseFragment(html, { sourceCodeLocationInfo: true })); return result;
}
export const attr = (node: HtmlNode, key: string): string | undefined => node?.attrs?.find((a: any) => a.name === key)?.value;
export const text = (node: HtmlNode): string => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[c]!);
export function inner(html: string, node: HtmlNode): string {
  const loc = node.sourceCodeLocation;
  return html.slice(loc.startTag.endOffset, loc.endTag.startOffset);
}
export function replaceInner(html: string, node: HtmlNode, content: string): string {
  const loc = node.sourceCodeLocation;
  return html.slice(0, loc.startTag.endOffset) + content + html.slice(loc.endTag.startOffset);
}
export function replaceText(html: string, before: string, after: string): string {
  return before === after ? html : html.split(escapeHtml(before)).join(escapeHtml(after));
}
export function links(html: string, items: readonly { name: string; slug: string }[], query: 'categories' | 'tags'): string {
  const list = nodes(html); const anchors = list.filter(n => n.tagName === 'a' && (query === 'categories'
    ? attr(n, 'href')?.startsWith('/news/') && !attr(n, 'href')?.includes('?')
    : attr(n, 'href')?.includes('?tags=')));
  const first = anchors[0];
  if (!first) throw new Error(`Native ${query} markup not found.`);
  const parent = query === 'tags' ? first.parentNode.parentNode : first.parentNode;
  const templateNode = query === 'tags' ? first.parentNode : first;
  const loc = templateNode.sourceCodeLocation;
  const template = html.slice(loc.startOffset, loc.endOffset);
  // Source 3m8h_v0urvgfo.js: j / R; Hero CategoryChip in 0ojbl80s28w6m.js.
  const categoryParents: Record<string, string> = { chatgpt: 'stories', api: 'stories', sora: 'stories', company: 'news', research: 'news', product: 'news', safety: 'news', publication: 'research/index', conclusion: 'research/index', release: 'research/index', 'global-affairs': 'news', 'ai-adoption': 'news', milestone: 'research/index', security: 'news', engineering: 'news' };
  const categoryAliases: Record<string, string> = { product: 'product-releases', company: 'company-announcements', safety: 'safety-alignment' };
  const contents = items.map(item => {
    if (query === 'categories' && !categoryParents[item.slug]) return '<span class="text-meta text-primary-60">' + escapeHtml(item.name) + '</span>';
    const href = query === 'categories' ? '/' + categoryParents[item.slug] + '/' + (categoryAliases[item.slug] || item.slug) + '/' : '/news/?tags=' + encodeURIComponent(item.slug);
    return template.replace(attr(first, 'href')!, href).replace(escapeHtml(text(first)), escapeHtml(item.name));
  }).join('');
  if (query === 'categories') return html.slice(0, first.sourceCodeLocation.startOffset) + contents + html.slice(anchors.at(-1).sourceCodeLocation.endOffset);
  return replaceInner(html, parent, contents);
}
