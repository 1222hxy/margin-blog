import { published } from "../lib/content";
export async function GET() {
  return Response.json(
    (await published()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      tags: p.data.tags,
      body: p.body || "",
      url: "/posts/" + p.id + "/",
    })),
  );
}
