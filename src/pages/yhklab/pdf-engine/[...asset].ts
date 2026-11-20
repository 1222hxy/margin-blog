import type { APIRoute } from "astro";
import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

const root = dirname(
  createRequire(import.meta.url).resolve("pdfjs-dist/package.json"),
);
const dirs = ["cmaps", "standard_fonts", "wasm", "iccs"];
const scripts = ["pdf.min.mjs", "pdf.worker.min.mjs"];

export async function getStaticPaths() {
  const engine = scripts.map((asset) => ({
    params: { asset },
    props: { file: join(root, "build", asset) },
  }));
  const resources = await Promise.all(
    dirs.map(async (dir) =>
      (await readdir(join(root, dir), { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name !== "LICENSE")
        .map(({ name }) => ({
          params: { asset: `${dir}/${name}` },
          props: { file: join(root, dir, name) },
        })),
    ),
  );
  return [
    ...engine,
    ...resources.flat(),
    {
      params: { asset: "LICENSE.txt" },
      props: { file: join(root, "LICENSE") },
    },
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const file = props.file as string;
  const mime = {
    ".mjs": "application/javascript",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".txt": "text/plain",
  };
  const headers = {
    "Content-Type":
      mime[extname(file) as keyof typeof mime] || "application/octet-stream",
  };
  return new Response(new Uint8Array(await readFile(file)), { headers });
};
