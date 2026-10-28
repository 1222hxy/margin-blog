import { getCollection } from "astro:content";
export async function published() {
  const markdown = (await getCollection("posts")).map((p) => ({
    ...p,
    kind: "markdown" as const,
  }));
  const tsx = (await getCollection("tsxPosts")).map((p) => ({
    ...p,
    body: p.data.searchText,
    kind: "tsx" as const,
  }));
  const all = [...markdown, ...tsx];
  const ids = new Set<string>();
  for (const p of all) {
    if (ids.has(p.id)) throw Error("Duplicate article URL: " + p.id);
    ids.add(p.id);
  }
  return all
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
