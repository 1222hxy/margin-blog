export const fontOptions = [
  { id: "theme", label: "跟随主题", family: "" },
  {
    id: "sans",
    label: "系统黑体",
    family: 'system-ui, "Microsoft YaHei", sans-serif',
  },
  {
    id: "serif",
    label: "系统宋体",
    family: 'Georgia, "Noto Serif SC", "Songti SC", SimSun, serif',
  },
  {
    id: "anthropic-sans",
    label: "Anthropic Sans",
    family: '"Blog Anthropic Sans", system-ui, "Microsoft YaHei", sans-serif',
  },
  {
    id: "anthropic-serif",
    label: "Anthropic Serif",
    family:
      '"Blog Anthropic Serif", "Noto Serif SC", "Songti SC", SimSun, serif',
  },
  {
    id: "mono",
    label: "系统等宽",
    family: '"Cascadia Code", Consolas, monospace',
  },
  {
    id: "anthropic-mono",
    label: "Anthropic Mono",
    family: '"Blog Anthropic Mono", "Cascadia Code", Consolas, monospace',
  },
] as const;
export type FontId = (typeof fontOptions)[number]["id"];
export type FontPreferences = Record<"body" | "heading" | "code", FontId>;
export function fontStyles(fonts: FontPreferences) {
  return Object.entries(fonts)
    .map(([role, id]) => {
      const choice = fontOptions.find((f) => f.id === id);
      if (!choice) throw new Error("Unknown font: " + id);
      return choice.family ? "--reader-" + role + ":" + choice.family : "";
    })
    .filter(Boolean)
    .join(";");
}
