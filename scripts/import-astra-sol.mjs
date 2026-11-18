// Extract only published document and static responses. HAR headers, APIs,
// analytics, Vimeo sessions and unrelated page prefetches never enter the port.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { parse } from "parse5";
import { readFlight } from "../src/themes/openai/lib/flight.ts";
const url =
  "https://openai.com/zh-Hans-CN/index/introducing-gpt-6-2-astra-sol/";
const entries = JSON.parse(await fs.readFile(process.argv[2], "utf8")).log
  .entries;
const hash = (b) => createHash("sha256").update(b).digest("hex");
const out = "src/themes/openai/astra-sol";
await fs.mkdir(out, { recursive: true });
const save = (name, data) => fs.writeFile(out + "/" + name, data);
const json = (x) => JSON.stringify(x, null, 2) + "\n";
const entry = entries.find(
  (e) =>
    e.request.url === url &&
    e.response.status === 200 &&
    e.response.content.mimeType === "text/html",
);
if (!entry) throw Error("Missing article document");
const bytes = (e) =>
  Buffer.from(
    e.response.content.text,
    e.response.content.encoding === "base64" ? "base64" : "utf8",
  );
const source = bytes(entry).toString();
const aliases = JSON.parse(
  await fs.readFile("rebuilds/openai-exact/port/manifest.json"),
).transformations.find((t) => t.id === "T-CDN").prefixes;
const local = (s) => {
  for (const [h, p] of Object.entries(aliases))
    s = s.replaceAll("https://" + h, p);
  return s;
};
const assets = new Map();
for (const e of entries) {
  const u = new URL(e.request.url),
    c = e.response.content;
  if (e.request.method !== "GET" || e.response.status !== 200 || !c.text)
    continue;
  if (!(
    (u.hostname === "openai.com" &&
      /^\/(?:_next\/static|icons|fonts)\//.test(u.pathname)) ||
    (u.hostname === "cdn.openai.com" &&
      /^\/(?:common\/fonts|pdf|mdx-assets)\//.test(u.pathname))
  ))
    continue;
  const file = "public" + (aliases[u.hostname] || "") + u.pathname;
  if (!path.resolve(file).startsWith(path.resolve("public") + path.sep))
    throw Error("Unsafe asset path");
  const raw = bytes(e),
    body = /css|javascript/.test(c.mimeType)
      ? Buffer.from(local(raw.toString()))
      : raw;
  try {
    if (!(await fs.readFile(file)).equals(body))
      throw Error("Different existing asset: " + file);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
  }
  assets.set(file, {
    file,
    source: u.origin + u.pathname,
    sha256: hash(body),
    sourceSha256: hash(raw),
  });
}
// Supplemental evidence is pinned by the existing release manifest. Imports
// can be repeated without contacting the source or trusting arbitrary local bytes.
const supplemental = new Map(
  JSON.parse(await fs.readFile(out + "/manifest.json", "utf8")).assets
    .filter((a) => a.supplemental)
    .map((a) => [a.source, a]),
);
const media = [
  ...new Set(
    source.match(
      /https:\/\/cdn\.openai\.com\/(?:mdx-assets|pdf)\/[\w./%+-]+/g,
    ) || [],
  ),
];
for (const sourceUrl of media) {
  const file =
    "public" + aliases["cdn.openai.com"] + new URL(sourceUrl).pathname;
  if (assets.has(file)) continue;
  const pin = supplemental.get(sourceUrl);
  if (!pin || pin.file !== file || !/^[a-f0-9]{64}$/.test(pin.sourceSha256))
    throw Error("Missing pinned supplemental evidence: " + sourceUrl);
  let raw, restore = false;
  try {
    raw = await fs.readFile(file);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    raw = await fs.readFile(
      "reference-input/openai-astra-sol/supplement/" + pin.sourceSha256,
    );
    restore = true;
  }
  if (hash(raw) !== pin.sourceSha256)
    throw Error("Changed supplemental evidence: " + sourceUrl);
  if (restore) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, raw);
  }
  assets.set(file, {
    file,
    source: sourceUrl,
    sha256: hash(raw),
    sourceSha256: hash(raw),
    supplemental: true,
  });
}
// Keep MdxImage's original sizes, candidate widths, quality and rendering.
// Only its URL builder changes for static hosting. Use captured response bytes
// for known requests and the full source raster for unrecorded variants.
const variants = {}, originals = new Map();
for (const e of entries) {
  const u = new URL(e.request.url), src = u.searchParams.get("url");
  if (u.origin + u.pathname !== "https://openai.com/_next/image" ||
      e.request.method !== "GET" || e.response.status !== 200 ||
      !src || !media.includes(src) || !e.response.content.text) continue;
  const raw = bytes(e), key = [src, u.searchParams.get("w"), u.searchParams.get("q")].join("|");
  if (raw.toString("ascii", 0, 4) !== "RIFF" || raw.toString("ascii", 8, 12) !== "WEBP") throw Error("Unexpected optimizer response");
  const file = `public/_openai/variants/${hash(raw)}.webp`;
  await fs.mkdir(path.dirname(file), {recursive:true});
  await fs.writeFile(file, raw);
  assets.set(file, {file, source:u.href, sha256:hash(raw), sourceSha256:hash(raw)});
  variants[key] = file.slice(6);
  originals.set(src, local(src));
}
if (!originals.size) throw Error("Missing source optimizer response");
const bundle = "3yay5oxmedkq2.js", bundlePath = "public/_next/static/immutable/chunks/";
const loader = '`/_next/image?url=${encodeURIComponent(e)}&w=${t}&q=${i??n.DEFAULT_IMAGE_QUALITY}`';
const parent = await fs.readFile(bundlePath + bundle, "utf8");
if (parent.split(loader).length !== 2) throw Error("MdxImage loader source changed");
const replacement = `(${JSON.stringify(variants)}[[e,t,i??n.DEFAULT_IMAGE_QUALITY].join("|")]??(${JSON.stringify(Object.fromEntries(originals))}[e]+"?w="+t+"&q="+(i??n.DEFAULT_IMAGE_QUALITY)))`;
const patched = parent.replace(loader, () => replacement);
const alias = hash(patched).slice(0, bundle.length - 3) + ".js";
await fs.writeFile(bundlePath + alias, patched);
assets.set(bundlePath + alias, {...assets.get(bundlePath + bundle), file:bundlePath + alias, sha256:hash(patched), adaptation:"static-mdx-image-loader"});
const directMedia = (text) => {
  for (const [src, mapped] of originals) text = text.replaceAll(mapped, src);
  return text.replaceAll(bundle, alias);
};
const document = directMedia(local(source))
  .replace(
    /<script\b[^>]*src="[^"]*(?:cloudflareinsights|speed-insights)[^"]*"[^>]*>[\s\S]*?<\/script>/g,
    "",
  )
  .replace(
    /<link\b[^>]*href="[^"]*(?:cloudflareinsights|speed-insights)[^"]*"[^>]*>/g,
    "",
  )
  .replace(/<meta name="robots" content="index, follow"\s*\/?\s*>/g, "")
  .replace(
    "<head>",
    '<head><meta name="robots" content="noindex, nofollow"><script src="/_openai/offline-adapter.js"></script>',
  );
await save("document.html", document);
const nodes = [];
function walk(n) {
  nodes.push(n);
  for (const c of n.childNodes || []) walk(c);
}
walk(parse(source, { sourceCodeLocationInfo: true }));
const attr = (n, k) => n.attrs?.find((a) => a.name === k)?.value;
const inner = (n) =>
  source.slice(
    n.sourceCodeLocation.startTag.endOffset,
    n.sourceCodeLocation.endTag.startOffset,
  );
const streamed = new Map(
  nodes
    .filter((n) => attr(n, "id")?.startsWith("S:"))
    .map((n) => [attr(n, "id").slice(2), inner(n)]),
);
function settle(html) {
  return html.replace(
    /<!--\$\?--><template id="B:([^"]+)"><\/template>[\s\S]*?<!--\/\$-->/g,
    (_, id) => {
      if (!streamed.has(id)) throw Error("Incomplete boundary " + id);
      return "<!--$-->" + settle(streamed.get(id)) + "<!--/$-->";
    },
  );
}
const prose = nodes.find((n) => attr(n, "data-toc-content") !== undefined),
  blocks = prose.childNodes.filter((n) => n.tagName);
const rows = readFlight(source),
  table = new Map(rows.map((r) => [r.id, r])),
  imports = new Map();
for (const r of rows.filter((r) => /^[a-f0-9]+:I/.test(r.raw)))
  imports.set(r.id, {
    id: (0x200000 + imports.size).toString(16),
    value: JSON.parse(directMedia(r.raw.slice(r.raw.indexOf(":I") + 2))),
  });
function resolve(v, stack = new Set(), used) {
  if (Array.isArray(v)) return v.map((x) => resolve(x, stack, used));
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, resolve(x, stack, used)]),
    );
  if (typeof v !== "string") return v;
  const m = /^\$([L@]?)([a-f\d]+)((?::[^\s]+)*)$/i.exec(v);
  if (!m) return v;
  if (imports.has(m[2])) {
    const mod = imports.get(m[2]);
    used.set(mod.id, mod);
    return "$" + m[1] + mod.id;
  }
  if (stack.has(v)) throw Error("Cycle " + v);
  let target = table.get(m[2])?.value;
  for (const key of m[3].split(":").slice(1)) {
    const at =
      Array.isArray(target) && target[0] === "$"
        ? ({ props: 3, key: 2, type: 1 }[key] ?? key)
        : key;
    target = target?.[at];
  }
  if (target === undefined) throw Error("Unresolved " + v);
  return resolve(target, new Set([...stack, v]), used);
}
function find(v, test) {
  if (!v || typeof v !== "object") return;
  if (test(v)) return v;
  for (const x of Object.values(v)) {
    const found = find(x, test);
    if (found) return found;
  }
}
const root = find(
  table.get("1bf").value,
  (v) => v[3] && "data-toc-content" in Object(v[3]),
);
const models = root[3].children.filter((x) => x && x !== "\n");
if (models.length !== blocks.length)
  throw Error("SSR/Flight block count mismatch");
const names = {
  0: "intro-video",
  4: "agents-last-exam",
  6: "science-benchmarks",
  8: "intelligence-benchmarks",
  12: "frontier-code",
  14: "lifeval",
  18: "harvey-lab",
  20: "gdpval",
  22: "workbook-comparison",
  24: "slide-comparison",
  25: "customer-carousel",
  30: "driving-demo",
  33: "mechanical-design",
  36: "lamp-design",
  38: "web-design",
  40: "cad-showcase",
  41: "interactive-worlds",
  42: "customer-quote",
  46: "workflow-comparison",
  51: "security-benchmarks",
  54: "patch-benchmarks",
  64: "alignment-benchmarks",
};
const catalog = [];
await fs.mkdir(out + "/components", { recursive: true });
for (const [i, id] of Object.entries(names)) {
  const n = blocks[i],
    l = n.sourceCodeLocation,
    used = new Map();
  const model = JSON.parse(
    directMedia(local(JSON.stringify(resolve(models[i], new Set(), used)))),
  );
  const html = local(settle(source.slice(l.startOffset, l.endOffset)));
  await save(
    "components/" + id + ".json",
    json({
      id,
      html,
      model,
      modules: [...used.values()].map((m) => ({
        ...m,
        value: resolve(m.value, new Set(), new Map()),
      })),
    }),
  );
  catalog.push({
    id,
    block: Number(i),
    start: l.startOffset,
    end: l.endOffset,
    modules: [...used.values()]
      .map((m) => ({ ...m, value: resolve(m.value, new Set(), new Map()) }))
      .map((m) => m.value[0]),
  });
}
// The animated title belongs to the article header, outside the prose blocks.
const heroNode = nodes.find((n) => attr(n, "class") === "IIETuq_hero");
const heroModel = find(table.get("47").value, (v) =>
  v[3]?.className?.startsWith("in-[article]:-mt-"),
)[3].children[1];
const mods = new Map(),
  hero = resolve(heroModel, new Set(), mods),
  hl = heroNode.sourceCodeLocation;
await save(
  "components/astra-sol-hero.json",
  json({
    id: "astra-sol-hero",
    html: local(source.slice(hl.startOffset, hl.endOffset)),
    model: hero,
    modules: [...mods.values()].map((m) => ({
      ...m,
      value: resolve(m.value, new Set(), new Map()),
    })),
  }),
);
catalog.unshift({
  id: "astra-sol-hero",
  block: "header",
  start: hl.startOffset,
  end: hl.endOffset,
  modules: [...mods.values()].map((m) => m.value[0]),
});
await save(
  "manifest.json",
  json({
    url,
    sourceSha256: hash(source),
    documentSha256: hash(document),
    components: catalog,
    assets: [...assets.values()],
  }),
);
console.log(
  `${blocks.length} body blocks, ${catalog.length} reusable components, ${assets.size} static files.`,
);
