import source from '../native/testimonial.json';
import type { NativeComponent } from '../types';
import { escapeHtml, inner, nodes, text } from '../lib/html';
export interface TestimonialOptions { quote: string; attribution: string; }
/** Source testimonial, with paired CMS props + rendered child nodes. */
export function Testimonial(options?: TestimonialOptions): NativeComponent {
  const capsule: NativeComponent = structuredClone(source);
  if (!options) return capsule;
  const all = nodes(capsule.html);
  const blockquote = all.find(n => n.tagName === 'blockquote');
  const quote = blockquote.childNodes.find((n: any) => n.tagName === 'span' && !n.attrs.length);
  const attribution = all.find(n => n.tagName === 'figcaption').childNodes.find((n: any) => n.tagName === 'span');
  const replacements = new Map([[text(quote), options.quote], [text(quote).replaceAll('‑', '-'), options.quote], [text(attribution), options.attribution]]);
  capsule.html = capsule.html.replace(inner(capsule.html, quote), escapeHtml(options.quote))
    .replace(inner(capsule.html, attribution), escapeHtml(options.attribution));
  const visit = (value: any): any => {
    if (typeof value === 'string') return replacements.get(value) || value;
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, visit(v)]));
    return value;
  };
  capsule.model = visit(capsule.model);
  return capsule;
}
