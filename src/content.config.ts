import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";
import { layouts } from "./config";
const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  template: z.enum(layouts).optional(),
});
const tsxPosts = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/tsx" }),
  schema: postSchema.extend({
    searchText: z.string().min(1),
    headings: z
      .array(
        z.object({
          depth: z.number().int().min(2).max(3),
          slug: z.string().regex(/^[a-z0-9-]+$/),
          text: z.string(),
        }),
      )
      .default([]),
  }),
});
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    template: z.enum(layouts).optional(),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    url: z.url().optional(),
  }),
});
export const collections = { posts, projects, tsxPosts };
