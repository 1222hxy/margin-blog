import rss from "@astrojs/rss";
import { published } from "../lib/content";
import { site } from "../config";
import type { APIContext } from "astro";
export async function GET(context: APIContext) {
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: (await published()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: "/posts/" + p.id + "/",
    })),
  });
}
