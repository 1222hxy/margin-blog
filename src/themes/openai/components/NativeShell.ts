// These source components keep their original Next hydration contracts.
// No replacement menu, search, audio or sharing implementation is introduced.
export const SiteHeader = (html: string): string => html;
export const SiteFooter = (html: string): string => html;
export const ReadingControls = (html: string): string => html;
export const RelatedArticles = (html: string, enabled = true): string => enabled ? html : '';
