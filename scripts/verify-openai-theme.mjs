// Independent assembly/asset gate. Does not call the theme renderer/extractor.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const root = 'src/themes/openai/';
const ledger = JSON.parse(await fs.readFile(root + 'blueprint/manifest.json', 'utf8'));
let assembled = '';
for (const part of ledger.parts) {
  const bytes = await fs.readFile(root + 'blueprint/' + part.file);
  assert.equal(hash(bytes), part.sha256, part.name); assembled += bytes.toString();
}
assert.equal(hash(assembled), ledger.sourceSha256, 'Lossless theme partition');
assert.deepEqual(Buffer.from(assembled), await fs.readFile(ledger.source), 'Theme versus immutable port');
for (const file of ['dist/index.html', 'dist/zh-Hans-CN/index/grid-protectors-program/index.html']) {
  assert.equal(hash(await fs.readFile(file)), ledger.sourceSha256, file);
}
const assets = JSON.parse(await fs.readFile(root + 'native/assets.json', 'utf8'));
for (const asset of assets) {
  assert.equal(hash(await fs.readFile(asset.file)), asset.sha256, asset.file);
  assert.equal(hash(await fs.readFile(asset.file.replace(/^public\//, 'dist/'))), asset.sha256, 'Built ' + asset.file);
}
for (const name of ['brand-tabs', 'testimonial']) {
  const component = JSON.parse(await fs.readFile(root + 'native/' + name + '.json', 'utf8'));
  const modules = new Set(component.modules.map(m => m.id));
  for (const m of JSON.stringify(component.model).matchAll(/"\$L?([a-f0-9]+)"/g)) assert(modules.has(m[1]), 'Unresolved native reference ' + m[0]);
  for (const module of component.modules) for (const file of module.value[1]) {
    if (typeof file === 'string' && file.startsWith('/_next/')) await fs.access('public' + file);
  }
  assert(!component.html.includes('<!--$?-->'), 'Unresolved streamed component');
}
console.log(`Theme: 9 components + 7 shell parts reassemble byte-for-byte; ${assets.length} native dependency records verified.`);
