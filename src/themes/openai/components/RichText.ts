import { attr, escapeHtml, inner, nodes } from '../lib/html';
/** Build native prose from the source's own block templates. No new CSS. */
export function proseTemplates(source: string) {
  const all = nodes(source);
  const paragraph = all.find(n => n.tagName === 'p');
  const heading = all.find(n => n.tagName === 'h2');
  const root = (n: any) => { while (n.parentNode?.nodeName !== '#document-fragment') n = n.parentNode; return n; };
  const block = (n: any) => { n = root(n); return source.slice(n.sourceCodeLocation.startOffset, n.sourceCodeLocation.endOffset); };
  let anchor = heading;
  while (!attr(anchor, 'id') && anchor.parentNode?.nodeName !== '#document-fragment') anchor = anchor.parentNode;
  return {
    paragraph: block(paragraph), paragraphInner: inner(source, paragraph),
    heading: block(heading), headingText: inner(source, heading), headingId: attr(anchor, 'id'),
  };
}
export function paragraph(text: string, templates: ReturnType<typeof proseTemplates>): string {
  return templates.paragraph.replace(templates.paragraphInner, '<span>' + escapeHtml(text) + '</span>');
}
export function heading(text: string, id: string, templates: ReturnType<typeof proseTemplates>): string {
  let html = templates.heading.replace(templates.headingText, '<span>' + escapeHtml(text) + '</span>');
  if (!templates.headingId) throw new Error('Source heading anchor missing.');
  return html.split(templates.headingId).join(escapeHtml(id));
}
