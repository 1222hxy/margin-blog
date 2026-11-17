// Source: port/document.html ArticleHero interval; classes and DOM stay native.
import type { ArticleData } from '../types';
import { links, replaceText } from '../lib/html';
export function ArticleHero(html: string, article: ArticleData, reference: ArticleData): string {
  html = replaceText(html, reference.title, article.title);
  html = replaceText(html, reference.description, article.description);
  html = replaceText(html, reference.date, article.date);
  if (JSON.stringify(article.categories) !== JSON.stringify(reference.categories)) html = links(html, article.categories, 'categories');
  return html;
}
