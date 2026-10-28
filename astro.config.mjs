import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeAccessibility from "./scripts/rehype-accessibility.mjs";
export default defineConfig({
  devToolbar: { enabled: false },
  site: process.env.SITE_URL || "https://margin-blog.yhl-3ca.workers.dev",
  integrations: [react(), mdx(), sitemap()],
  vite: { plugins: [tailwind()] },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeKatex, { strict: "error", throwOnError: true }],
        rehypeAccessibility,
      ],
    }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
