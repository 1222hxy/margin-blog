export const mediaDemoIds = [
  "mechanical-design",
  "lamp-design",
  "web-design",
  "cad-showcase",
  "interactive-worlds",
] as const;
export type MediaDemoId = (typeof mediaDemoIds)[number];

export function isMediaDemoId(id: string): id is MediaDemoId {
  return (mediaDemoIds as readonly string[]).includes(id);
}
