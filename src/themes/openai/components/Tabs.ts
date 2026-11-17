import source from '../native/brand-tabs.json';
import tokens from '../native/tokens.json';
import type { NativeComponent } from '../types';
import { attr, escapeHtml, inner, nodes, replaceInner } from '../lib/html';
import { htmlModel } from '../lib/native';
export interface TabItem { id: string; label: string; html: string; }
export interface TabsOptions { id: string; items: readonly TabItem[]; }
/** Original Images 2.6 tab component + original client controller. Only its
 * content props and matching SSR nodes are replaced for another use. */
export function Tabs(options?: TabsOptions): NativeComponent {
  const capsule: NativeComponent = structuredClone(source);
  if (!options) return capsule;
  if (!options.items.length || new Set(options.items.map(t => t.id)).size !== options.items.length) throw new Error('Tabs need unique items.');
  capsule.id = options.id;
  const content = (html: string) => '<section class="' + escapeHtml(tokens.tabContentGrid) + '">' + html + '</section>';
  const visit = (value: any): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value) && value[3]?.tabs) {
      const props = value[3], first = props.tabs[0];
      props.tabs = options.items.map(tab => ({ ...first, id: tab.id, label: tab.label,
        analyticsIdentifier: options.id + '-' + tab.id,
        content: ['$', '$Sreact.fragment', null, { children: htmlModel(content(tab.html)) }],
      }));
      // Source 0_ejda_ftvsy6.js, module 563091: useState(activeTab ?? 0),
      // then tabs[index]. It is an index rather than the CMS item's id.
      props.activeTab = 0;
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(capsule.model);
  const all = nodes(capsule.html), buttons = all.filter(n => attr(n, 'role') === 'tab');
  const parent = buttons[0].parentNode;
  const markup = options.items.map((tab, i) => {
    const base = buttons[i === 0 ? 0 : 1], loc = base.sourceCodeLocation;
    let html = capsule.html.slice(loc.startOffset, loc.endOffset);
    html = html.split(attr(base, 'id')!).join(escapeHtml(tab.id));
    return html.replace(inner(capsule.html, base), '<span>' + escapeHtml(tab.label) + '</span>');
  }).join('');
  // Completed source stream contains the first panel; its content must agree
  // with the native component's first item before React hydration.
  let html = replaceInner(capsule.html, parent, markup);
  const panel = nodes(html).find(n => attr(n, 'role') === 'tabpanel');
  if (!panel) throw new Error('Completed native tab panel missing.');
  const oldId = attr(panel, 'aria-labelledby')!;
  html = replaceInner(html, panel, content(options.items[0].html));
  capsule.html = html.split(oldId).join(escapeHtml(options.items[0].id));
  return capsule;
}
