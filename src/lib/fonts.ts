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
    label: "Anthropic Mono（兼容 mono 配置）",
    family: '"Blog Anthropic Mono", "Blog MiSans", sans-serif',
  },
  {
    id: "anthropic-mono",
    label: "Anthropic Mono",
    family: '"Blog Anthropic Mono", "Blog MiSans", sans-serif',
  },
  {
    id: "pingfang",
    label: "苹方 SC",
    family: '"Blog PingFang SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: "anthropic-sans-pingfang",
    label: "Anthropic Sans + 苹方",
    family:
      '"Blog Anthropic Sans", "Blog PingFang SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: "anthropic-serif-pingfang",
    label: "Anthropic Serif + 苹方",
    family:
      '"Blog Anthropic Serif", "Blog PingFang SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: "misans",
    label: "MiSans 简体",
    family: '"Blog MiSans", "Microsoft YaHei", sans-serif',
  },
  {
    id: "oppo",
    label: "OPPO Sans 4.0",
    family: '"Blog OPPO Sans", "Microsoft YaHei", sans-serif',
  },
  {
    id: "anthropic-serif-misans",
    label: "Anthropic Serif + MiSans",
    family:
      '"Blog Anthropic Serif", "Blog MiSans", "Microsoft YaHei", sans-serif',
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
