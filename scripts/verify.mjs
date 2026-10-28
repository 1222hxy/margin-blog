import fs from "node:fs";
import assert from "node:assert/strict";
const paths = fs
  .readdirSync("dist", { recursive: true })
  .filter((p) => /\.(html|json|xml|js)$/.test(p));
for (const p of paths) {
  const text = fs.readFileSync("dist/" + p, "utf8");
  assert(
    !text.includes("DRAFT_SENTINEL") && !text.includes("TSX_DRAFT_SENTINEL") && !text.includes("SECRET_DRAFT_BODY"),
    "Draft leaked: " + p,
  );
}
assert(!fs.existsSync("dist/posts/draft/index.html"));
const search = JSON.parse(fs.readFileSync("dist/search.json", "utf8"));
assert(search.some(p=>p.url === "/posts/curve-lab/"));
assert(fs.readFileSync("dist/posts/curve-lab/index.html","utf8").includes("先动手试试看"));
assert(search.some((p) => p.body.includes("公式")));
const article = fs.readFileSync("dist/posts/math-and-code/index.html", "utf8");
assert(article.includes("katex"));
assert(article.includes("astro-code"));
assert(article.includes("本页目录"));
assert(fs.existsSync("dist/404.html"));
console.log("Content, draft, math, code, search and 404 checks passed.");
