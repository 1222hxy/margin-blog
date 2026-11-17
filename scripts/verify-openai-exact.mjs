// Independent checker; deliberately does not import the asset importer.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const ledger = JSON.parse(await fs.readFile('rebuilds/openai-exact/port/manifest.json', 'utf8'));
for (const asset of [...ledger.assets, ...ledger.supportFiles]) {
  assert.equal(hash(await fs.readFile(asset.file)), asset.sha256, asset.file);
  if (asset.file.startsWith('public/')) {
    assert.equal(hash(await fs.readFile(asset.file.replace(/^public\//, 'dist/'))), asset.sha256, 'Built asset: ' + asset.file);
  }
}
const document = await fs.readFile('rebuilds/openai-exact/port/document.html');
for (const file of ['dist/index.html', 'dist/zh-Hans-CN/index/grid-protectors-program/index.html']) {
  assert.deepEqual(await fs.readFile(file), document, 'Source document differs: ' + file);
}
// On the evidence host, independently replay the explicit shell transformations.
try {
  const mirror = JSON.parse(await fs.readFile('reference-input/openai-grid/manifest.json', 'utf8'));
  const original = mirror.find(a => a.url === ledger.source);
  let html = await fs.readFile('reference-input/openai-grid/mirror/' + original.file, 'utf8');
  for (const [host, prefix] of Object.entries(ledger.transformations.find(t => t.id === 'T-CDN').prefixes)) {
    assert.equal(Buffer.byteLength('https://' + host), Buffer.byteLength(prefix), 'Flight length: ' + host);
    html = html.split('https://' + host).join(prefix);
  }
  html = html.replace(/<script\b[^>]*src="[^"]*(?:cloudflareinsights|speed-insights)[^"]*"[^>]*>[\s\S]*?<\/script>/g, '');
  html = html.replace(/<link\b[^>]*href="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*>/g, '');
  html = html.replace(/<meta name="robots" content="index, follow"\s*\/?\s*>/g, '');
  html = html.replace('<head>', '<head><meta name="robots" content="noindex, nofollow"><script src="/_openai/offline-adapter.js"></script>');
  assert.equal(html, document.toString('utf8'), 'Unregistered shell change');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('Source mirror absent; verified the committed portable asset ledger.');
}
console.log(`Verified ${ledger.assets.length} response records and both complete built documents.`);
