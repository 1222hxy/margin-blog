import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const base = "src/themes/openai/astra-sol/",
  manifest = JSON.parse(await fs.readFile(base + "manifest.json")),
  digest = (x) => createHash("sha256").update(x).digest("hex");
assert.equal(
  digest(await fs.readFile("dist/themes/openai/astra-sol/index.html")),
  manifest.documentSha256,
);
const seen = new Set();
for (const c of manifest.components) {
  assert(!seen.has(c.id));
  seen.add(c.id);
  const fragment = JSON.parse(
    await fs.readFile(base + "components/" + c.id + ".json"),
  );
  assert.equal(fragment.id, c.id);
  const html = await fs.readFile(
    `dist/themes/openai/astra-sol/components/${c.id}/index.html`,
    "utf8",
  );
  assert(html.includes(fragment.html));
  const ids = new Set(fragment.modules.map((x) => x.id));
  for (const ref of JSON.stringify(fragment.model).matchAll(/"\$L([\da-f]+)"/g))
    assert(ids.has(ref[1]));
  for (const m of fragment.modules)
    for (const file of m.value[1])
      if (typeof file === "string" && file.startsWith("/_next/"))
        await fs.access("dist" + file);
}
for (const a of manifest.assets) {
  assert.equal(digest(await fs.readFile(a.file)), a.sha256, a.file);
  assert.equal(
    digest(await fs.readFile(a.file.replace(/^public\//, "dist/"))),
    a.sha256,
    a.file,
  );
}
console.log(
  `Astra/Sol: complete localized document, ${seen.size} component routes, ${manifest.assets.length} distinct static files verified.`,
);
