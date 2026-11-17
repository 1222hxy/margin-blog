import type { ArticleData, ThemePart } from '../types';
import { ArticleHero } from '../components/ArticleHero';
import { ArticleProse } from '../components/ArticleProse';
import { Contents } from '../components/Contents';
import { AuthorBlock } from '../components/AuthorBlock';
import { ReadingControls, RelatedArticles, SiteFooter, SiteHeader } from '../components/NativeShell';
import { rewriteFlight } from './flight';
import { escapeHtml } from './html';
import { expandComponents, htmlModel } from './native';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const wireText = (s: string) => s.startsWith('$') ? '$' + s : s;
const element = (type: string, props: any, key: string | null = null) => ['$', type, key, props];

/** Render both visible SSR markup and the original client's Flight props.
 * Updating only HTML would make React restore the old content on hydration. */
export function renderArticle(parts: readonly ThemePart[], reference: ArticleData, article: ArticleData): string {
  if (!article.title.trim() || !article.path.startsWith('/')) throw new Error('Article title and absolute path required.');
  if (new Set(article.headings.map(h => h.id)).size !== article.headings.length) throw new Error('Heading ids must be unique.');
  if (article.audio && article.bodyHtml !== reference.bodyHtml) throw new Error('Custom articles need their own audio; set audio: false.');
  const bodyChanged = article.bodyHtml !== reference.bodyHtml;
  const components = article.components || {};
  const expandedBody = expandComponents(article.bodyHtml, components);
  const modules = new Map<string, string>();
  for (const component of Object.values(components)) for (const module of component.modules) {
    const row = `${module.id}:I${JSON.stringify(module.value)}\n`;
    if (modules.has(module.id) && modules.get(module.id) !== row) throw new Error('Native module id collision.');
    modules.set(module.id, row);
  }
  const headingsChanged = !same(article.headings, reference.headings);
  const replacements = new Map<string, string>(([
    [reference.title, article.title], [reference.description, article.description], [reference.date, article.date],
    [reference.seoDescription || reference.description, article.seoDescription || article.description],
    [reference.title + ' | OpenAI', article.title + ' | OpenAI'],
    ['https://openai.com' + reference.path, article.canonicalUrl || 'https://openai.com' + article.path],
  ] as [string, string][]).filter(([a, b]) => a !== b));
  const replaceMarkup = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>|[^<]+|<[^>]+>/g, token => {
    if (token.startsWith('<script')) return token;
    for (const [before, after] of replacements) token = token.split(escapeHtml(before)).join(escapeHtml(after));
    return token;
  });
  const document = parts.map(part => {
    switch (part.name) {
      case 'SiteHeader': return SiteHeader(part.html);
      case 'SiteFooter': return SiteFooter(part.html);
      case 'ReadingControls': return ReadingControls(part.html);
      case 'ArticleHero': return ArticleHero(part.html, article, reference);
      case 'ArticleProse': return ArticleProse(part.html, { ...article, bodyHtml: expandedBody }, reference);
      case 'AuthorBlock': return AuthorBlock(part.html, article, reference);
      case 'MobileContents': case 'DesktopContents': return Contents(part.html, article.headings, reference.headings);
      case 'RelatedArticles': return RelatedArticles(part.html, article.related !== false);
      default: return replaceMarkup(part.html);
    }
  }).join('');
  const update = (value: any, inAuthor = false): any => {
    if (typeof value === 'string') {
      if (replacements.has(value)) return wireText(replacements.get(value)!);
      return inAuthor && value === reference.author ? wireText(article.author) : value;
    }
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) {
      if (value[0] === '$' && value[3] && typeof value[3] === 'object') {
        const props = value[3];
        // Source Flight 197 mounts ReadAloud ($L1a9). Its module checks for
        // captured TTS data; omit the mount when this article has no own audio.
        if (value[1] === '$L1a9' && !article.audio) return null;
        if (props['data-toc-content'] !== undefined && bodyChanged) {
          return [value[0], value[1], value[2], { ...props, children: htmlModel(article.bodyHtml, components) }];
        }
        if (props.id === 'citations') inAuthor = true;
        if (props.className === '@container w-full' && article.related === false && JSON.stringify(value).includes('继续阅读')) return null;
        if (props.pageType === 'Article' && 'pageTitle' in props) {
          props.showReadAloud = article.audio;
          if (!same(article.categories, reference.categories)) props.categories = article.categories;
          if (!same(article.tags, reference.tags)) props.tags = article.tags;
        }
        if (props.contentHeadingsDict && headingsChanged) props.contentHeadingsDict = Object.fromEntries(article.headings.map(h => [h.id, h]));
        if (props.contentHeadings && headingsChanged) props.contentHeadings = article.headings;
        if (inAuthor && value[1] === 'ul' && props.className === 'flex flex-wrap gap-3' && !same(article.tags, reference.tags)) {
          const first = props.children[0][3].children;
          props.children = article.tags.map((tag, i) => element('li', { children: [first[0], first[1], first[2], {
            ...first[3], href: '/news/?tags=' + encodeURIComponent(tag.slug), children: wireText(tag.name),
          }] }, String(i)));
        }
      }
      return value.map(v => update(v, inAuthor));
    }
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, update(v, inAuthor)]));
  };
  return rewriteFlight(document, value => update(value), [...modules.values()].join(''));
}
