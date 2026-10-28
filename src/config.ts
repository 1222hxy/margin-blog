export const themes = ["study", "editorial", "terminal"] as const;
export const layouts = ["standard", "technical", "journal"] as const;
const theme = import.meta.env.BLOG_THEME || "study";
if (!themes.includes(theme as (typeof themes)[number]))
  throw new Error("Invalid BLOG_THEME: " + theme);
export const site = {
  title: "页间 · MARGIN",
  description: "在代码与生活之间，留一点思考的余地。",
  author: "你的名字",
  theme,
  defaultLayout: "standard" as (typeof layouts)[number],
  navigation: [
    { label: "文章", href: "/posts/" },
    { label: "项目", href: "/projects/" },
    { label: "归档", href: "/archive/" },
    { label: "关于", href: "/about/" },
  ],
  social: [{ label: "RSS ↗", href: "/rss.xml" }],
};
