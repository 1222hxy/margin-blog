export interface ThemeLink { name: string; slug: string; id?: string; __typename?: string; }
export interface NativeComponent { id: string; html: string; model: any; modules: { id: string; value: any }[]; }
export interface ArticleHeading { text: string; id: string; headlineTag: 'h2' | 'h3'; omitFromTableOfContents?: boolean; }
export interface ArticleData {
  title: string;
  description: string;
  seoDescription?: string;
  date: string;
  author: string;
  path: string;
  canonicalUrl?: string;
  categories: readonly ThemeLink[];
  tags: readonly ThemeLink[];
  bodyHtml: string;
  headings: readonly ArticleHeading[];
  /** Only enable with audio recorded for this exact article. */
  audio: boolean;
  related?: boolean;
  /** Native component markers inside bodyHtml; SSR and Flight are paired. */
  components?: Record<string, NativeComponent>;
}
export interface ThemePart { name: string; html: string; }
