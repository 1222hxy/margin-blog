import type { ArticleHeading } from "../../openai/types";

export type ContentsNode = {
  heading: ArticleHeading;
  children: ContentsNode[];
};

export function contentsOutline(headings: readonly ArticleHeading[]) {
  const depth = (heading: ArticleHeading) =>
    Number(heading.headlineTag.slice(1));
  const max =
    headings.reduce(
      (min, heading) =>
        heading.text.trim() ? Math.min(min, depth(heading)) : min,
      Infinity,
    ) + 2;
  const tree: ContentsNode[] = [];
  const parents: { level: number; node?: ContentsNode }[] = [];
  let withinThirdLevel = false;
  let count = 0;
  for (const heading of headings) {
    const level = depth(heading);
    const include =
      !heading.omitFromTableOfContents &&
      Boolean(heading.text.trim()) &&
      level <= max;
    if (level <= 3) withinThirdLevel = level === 3 && include;
    while (parents.at(-1) && parents.at(-1)!.level >= level) parents.pop();
    let node: ContentsNode | undefined;
    if (include && (level <= 3 || withinThirdLevel)) {
      node = { heading, children: [] };
      const parent = parents.findLast((item) => item.node)?.node;
      (parent?.children ?? tree).push(node);
      count++;
    }
    parents.push({ level, node });
  }
  return { tree, count };
}
