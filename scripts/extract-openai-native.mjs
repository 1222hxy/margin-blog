// Preserve published component models rather than inventing a tab controller.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse } from 'parse5';
import { readFlight } from '../src/themes/openai/lib/flight.ts';
const root = 'reference-input/openai-images';
const manifest = JSON.parse(await fs.readFile(root + '/manifest.json', 'utf8'));
const source = manifest.find(a => a.url === 'https://openai.com/zh-Hans-CN/index/introducing-images-2-6/');
const sourceHtml = await fs.readFile(root + '/mirror/' + source.file, 'utf8');
const rows = readFlight(sourceHtml), table = new Map(rows.map(r => [r.id, r]));
const out = 'src/themes/openai/native'; await fs.mkdir(out, { recursive: true });
const prefixes = JSON.parse(await fs.readFile('rebuilds/openai-exact/port/manifest.json', 'utf8')).transformations.find(t => t.id === 'T-CDN').prefixes;
const localize = text => { for (const [host, prefix] of Object.entries(prefixes)) text = text.split('https://' + host).join(prefix); return text; };
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const moduleIds = new Map();
for (const r of rows) if (/^[a-f0-9]+:I/.test(r.raw)) moduleIds.set(r.id, (0x100000 + moduleIds.size).toString(16));
function resolve(value, stack = new Set()) {
  if (typeof value === 'string') {
    const match = /^\$([L@]?)([a-f0-9]+)((?::[^\s]+)*)$/i.exec(value);
    if (!match) return value;
    const [, mode, id, selector] = match;
    const row = table.get(id); if (!row) throw new Error('Missing reference ' + value);
    if (moduleIds.has(id)) return '$' + (mode || '') + moduleIds.get(id);
    if (stack.has(value)) throw new Error('Component reference cycle ' + value);
    let target = row.value;
    for (const key of selector.split(':').filter(Boolean)) {
      if (Array.isArray(target) && target[0] === '$' && ['props', 'key', 'type'].includes(key)) target = target[{ props: 3, key: 2, type: 1 }[key]];
      else target = target?.[key];
    }
    if (target === undefined) throw new Error('Unresolved component path ' + value);
    return resolve(target, new Set([...stack, value]));
  }
  if (Array.isArray(value)) return value.map(v => resolve(v, stack));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, stack)]));
  return value;
}
const doc = parse(sourceHtml, { sourceCodeLocationInfo: true }), all = [];
const walk = n => { all.push(n); for (const c of n.childNodes || []) walk(c); }; walk(doc);
const attr = (n, key) => n.attrs?.find(a => a.name === key)?.value;
const streamed = new Map(all.filter(n => attr(n, 'id')?.startsWith('S:')).map(n => [attr(n, 'id').slice(2), sourceHtml.slice(n.sourceCodeLocation.startTag.endOffset, n.sourceCodeLocation.endTag.startOffset)]));
function settle(html) {
  // Same completed DOM the source $RC stream instruction produces. A capsule
  // must not retain a pending B:n boundary while dropping its S:n response.
  return html.replace(/<!--\$\?--><template id="B:([^"]+)"><\/template>[\s\S]*?<!--\/\$-->/g, (_, id) => {
    if (!streamed.has(id)) throw new Error('Missing streamed component ' + id);
    return '<!--$-->' + settle(streamed.get(id)) + '<!--/$-->';
  });
}
const prose = all.find(n => attr(n, 'data-toc-content') !== undefined);
const topBlock = n => { while (n.parentNode !== prose) n = n.parentNode; return n; };
const quote = all.find(n => n.tagName === 'figure' && attr(n, 'class')?.includes('col-start-1 row-start-1'));
const tabs = all.find(n => attr(n, 'role') === 'tablist');
const specs = [{ id: 'brand-tabs', row: '1e2', node: topBlock(tabs) }, { id: 'testimonial', row: '1d6', node: topBlock(quote) }];
const panelGrid = all.find(n => n.tagName === 'section' && attr(n, 'class')?.includes('grid-cols-12') && n.sourceCodeLocation.startOffset > tabs.sourceCodeLocation.startOffset);
if (!panelGrid) throw new Error('Native tab content grid missing.');
await fs.writeFile(out + '/tokens.json', JSON.stringify({ tabContentGrid: attr(panelGrid, 'class') }, null, 2) + '\n');
const modules = [];
for (const [id, localId] of moduleIds) {
  const value = JSON.parse(table.get(id).raw.replace(/^[a-f0-9]+:I/, '').trim());
  modules.push({ id: localId, value: resolve(value) });
}
for (const spec of specs) {
  const loc = spec.node.sourceCodeLocation;
  const html = localize(settle(sourceHtml.slice(loc.startOffset, loc.endOffset)));
  const model = JSON.parse(localize(JSON.stringify(resolve(table.get(spec.row).value))));
  const used = new Set([...JSON.stringify(model).matchAll(/"\$L?([a-f0-9]+)"/g)].map(m => m[1]));
  const capsule = { id: spec.id, source: source.url, sourceSha256: source.sha256, sourceRow: spec.row,
    sourceRange: [loc.startOffset, loc.endOffset], html, model, modules: modules.filter(m => used.has(m.id)) };
  await fs.writeFile(`${out}/${spec.id}.json`, JSON.stringify(capsule, null, 2) + '\n');
}
// Copy only public static dependencies; third-party video services stay external.
const assets = [];
for (const asset of manifest) {
  const url = new URL(asset.url);
  if (!['openai.com', 'cdn.openai.com', 'images.ctfassets.net'].includes(url.hostname)) continue;
  if (asset.mime.includes('html') || asset.mime.includes('json') || asset.mime.includes('component') || url.pathname.startsWith('/backend/') || url.pathname.startsWith('/cdn-cgi/')) continue;
  const file = 'public' + (prefixes[url.hostname] || '') + url.pathname;
  if (!path.resolve(file).startsWith(path.resolve('public') + path.sep)) throw new Error('Unsafe asset path.');
  const original = await fs.readFile(root + '/mirror/' + asset.file);
  const bytes = /css|javascript/.test(asset.mime) ? Buffer.from(localize(original.toString())) : original;
  try { const existing = await fs.readFile(file); if (!existing.equals(bytes)) throw new Error('Asset collision: ' + file); }
  catch (error) { if (error.code !== 'ENOENT') throw error; await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, bytes); }
  assets.push({ url: asset.url, file, originalSha256: asset.sha256, sha256: hash(bytes) });
}
await fs.writeFile(out + '/assets.json', JSON.stringify(assets, null, 2) + '\n');
const inventory = all.filter(n => n.tagName === 'figure' || attr(n, 'role') === 'tablist').map(n => ({
  tag: n.tagName, role: attr(n, 'role'), classes: attr(n, 'class'), range: [n.sourceCodeLocation.startOffset, n.sourceCodeLocation.endOffset],
}));
await fs.mkdir('docs/themes', { recursive: true });
await fs.writeFile('docs/themes/openai-images-inventory.json', JSON.stringify({ source: source.url, sourceSha256: source.sha256, inventory, capsules: specs.map(s => ({ id: s.id, row: s.row })), externalVideo: 'Original Vimeo client and embeds; no invented replacement player.' }, null, 2) + '\n');
console.log(`Extracted ${specs.length} native component capsules; checked ${assets.length} static dependencies.`);
