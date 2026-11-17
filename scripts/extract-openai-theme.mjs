// A derived theme layer. The verified port and private mirror remain read-only.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { parse } from 'parse5';
import { readFlight } from '../src/themes/openai/lib/flight.ts';
const source = 'rebuilds/openai-exact/port/document.html';
const html = await fs.readFile(source, 'utf8');
const doc = parse(html, { sourceCodeLocationInfo: true });
const all = []; const walk = n => { all.push(n); for (const c of n.childNodes || []) walk(c); }; walk(doc);
const attr = (n, name) => n.attrs?.find(a => a.name === name)?.value;
const find = predicate => { const n = all.find(predicate); if (!n) throw new Error('Source node absent.'); return n; };
const nodeText = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(nodeText).join('');
const article = find(n => n.tagName === 'article');
const children = article.childNodes.filter(n => n.tagName);
const hero = children[0].childNodes.filter(n => n.tagName);
const prose = find(n => attr(n, 'data-toc-content') !== undefined);
const selected = [
  ['SiteHeader', find(n => n.tagName === 'header')], ['ArticleHero', hero[0]], ['ReadingControls', hero[2]],
  ['MobileContents', children[1].childNodes.filter(n => n.tagName)[0]],
  ['DesktopContents', children[1].childNodes.filter(n => n.tagName)[1]], ['ArticleProse', prose],
  ['AuthorBlock', children[2]], ['RelatedArticles', children[3]], ['SiteFooter', find(n => n.tagName === 'footer')],
].map(([name, node]) => ({ name, start: node.sourceCodeLocation.startOffset, end: node.sourceCodeLocation.endOffset }));
const directory = 'src/themes/openai/blueprint'; await fs.mkdir(directory, { recursive: true });
let cursor = 0, shell = 0; const parts = [];
for (const range of selected) {
  if (range.start < cursor) throw new Error('Overlapping source components.');
  if (range.start > cursor) parts.push({ name: `Shell${shell++}`, start: cursor, end: range.start });
  parts.push(range); cursor = range.end;
}
if (cursor < html.length) parts.push({ name: `Shell${shell++}`, start: cursor, end: html.length });
for (const part of parts) {
  const text = html.slice(part.start, part.end); part.file = part.name + '.html';
  part.sha256 = crypto.createHash('sha256').update(text).digest('hex');
  await fs.writeFile(directory + '/' + part.file, text);
}
const h1 = find(n => n.tagName === 'h1');
const ctx = readFlight(html).find(r => r.id === '47').value[3].children[3];
const headings = Object.values(ctx.children[0][3].contentHeadingsDict);
const proseLocation = prose.sourceCodeLocation;
const description = all.find(n => n.tagName === 'meta' && attr(n, 'name') === 'description');
const reference = {
  title: nodeText(h1), description: '推出一项全国性计划，让我们未来的算力园区助力实现可靠、经济的电力供应。',
  seoDescription: attr(description, 'content'), date: ctx.publicationDateText, author: 'OpenAI',
  path: '/zh-Hans-CN/index/grid-protectors-program/', categories: ctx.categories, tags: ctx.tags,
  audio: true, headings, bodyHtml: html.slice(proseLocation.startTag.endOffset, proseLocation.endTag.startOffset),
};
await fs.writeFile(directory + '/reference.json', JSON.stringify(reference, null, 2) + '\n');
// Native prose blocks rely on this exact source grid parent. Expose the token
// for content placed inside another native component's panel.
await fs.writeFile(directory + '/tokens.json', JSON.stringify({ grid: attr(prose, 'class') }, null, 2) + '\n');
await fs.writeFile(directory + '/manifest.json', JSON.stringify({ source, sourceSha256: crypto.createHash('sha256').update(html).digest('hex'), parts }, null, 2) + '\n');
const imports = parts.map(p => `import ${p.name} from './blueprint/${p.file}?raw';`).join('\n');
await fs.writeFile('src/themes/openai/blueprint.ts', '// Generated, lossless source partition. Run npm run theme:extract.\n' + imports + '\nexport const blueprint = [' + parts.map(p => `{ name: '${p.name}', html: ${p.name} }`).join(',\n') + '];\n');
console.log(`Extracted ${selected.length} named components and ${shell} exact shell intervals.`);
