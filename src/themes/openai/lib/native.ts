import type { NativeComponent } from '../types';
import { attr, inner, nodes } from './html';
export function expandComponents(html: string, components: Record<string, NativeComponent> = {}): string {
  return html.replace(/<template data-openai-component="([^"]+)"><\/template>/g, (_, id) => {
    if (!components[id]) throw new Error('Unregistered native component: ' + id);
    return components[id].html;
  });
}
/** Top-level source blocks keep their exact markup. Only native component
 * markers become interactive Flight nodes; no post-hydration DOM patching. */
export function htmlModel(html: string, components: Record<string, NativeComponent> = {}): any[] {
  return nodes(html).filter(n => n.parentNode?.nodeName === '#document-fragment').flatMap(n => {
    if (n.nodeName === '#comment') return [];
    if (n.nodeName === '#text') return [n.value.startsWith('$') ? '$' + n.value : n.value];
    const id = attr(n, 'data-openai-component');
    if (id) {
      if (!components[id]) throw new Error('Unregistered component: ' + id);
      return [components[id].model];
    }
    const props: Record<string, any> = {};
    for (const attribute of n.attrs || []) {
      const key = attribute.name === 'class' ? 'className' : attribute.name === 'tabindex' ? 'tabIndex' : attribute.name;
      if (key === 'style') props.style = Object.fromEntries(attribute.value.split(';').filter(Boolean).map((s: string) => {
        const i = s.indexOf(':'); const name = s.slice(0, i).trim();
        return [name.startsWith('--') ? name : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), s.slice(i + 1).trim()];
      }));
      else props[key] = attribute.value.startsWith('$') ? '$' + attribute.value : attribute.value;
    }
    if (n.sourceCodeLocation.endTag) props.dangerouslySetInnerHTML = { __html: inner(html, n) };
    return [['$', n.tagName, null, props]];
  });
}
