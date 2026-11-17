import type { ArticleData } from '../types';
import { attr, nodes, replaceInner } from '../lib/html';
export function ArticleProse(html: string, article: ArticleData, reference: ArticleData): string {
  if (article.bodyHtml === reference.bodyHtml) return html;
  const container = nodes(html).find(n => attr(n, 'data-toc-content') !== undefined);
  return replaceInner(html, container, article.bodyHtml);
}
