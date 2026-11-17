import type { ArticleData } from '../types';
import { links, replaceText } from '../lib/html';
export function AuthorBlock(html: string, article: ArticleData, reference: ArticleData): string {
  if (JSON.stringify(article.tags) !== JSON.stringify(reference.tags)) html = links(html, article.tags, 'tags');
  return replaceText(html, reference.author, article.author);
}
