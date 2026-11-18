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
  const list=nodes(html);
  // Only open ancestors of interactive slots. All other markup stays verbatim.
  const branches=new Set<any>();
  for(const n of list)if(attr(n,'data-openai-component'))for(let p=n.parentNode;p;p=p.parentNode)branches.add(p);
  const render=(n:any):any[]=>{
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
    if(branches.has(n)) props.children=n.childNodes.flatMap(render);
    else if (n.sourceCodeLocation?.endTag) props.dangerouslySetInnerHTML = { __html: inner(html, n) };
    return [['$', n.tagName, null, props]];
  };
  return list.filter(n=>n.parentNode?.nodeName==='#document-fragment').flatMap(render);
}
