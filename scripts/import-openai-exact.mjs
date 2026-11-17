// Source: user-supplied HAR, immutable responses in reference-input/openai-grid.
// This imports the published document and its original Next runtime, without
// rebuilding the interface. All response transformations are recorded below.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('reference-input/openai-grid');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
const origin = 'https://openai.com';
const pageURL = origin + '/zh-Hans-CN/index/grid-protectors-program/';
const prefixes = new Map(['cdn.openai.com', 'images.ctfassets.net', 'cdn-azalea-tts-achmg6dqbafjaxcr.a01.azurefd.net', 'static.cloudflareinsights.com'].map(host =>
  [host, ('/__' + host.replaceAll('.', '_')).padEnd(('https://' + host).length, '_')]));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const transformations = [
  { id: 'T-CDN', description: 'Same-byte-length CDN origin aliases; preserves Flight T-row lengths.', prefixes: Object.fromEntries(prefixes) },
  { id: 'T-TELEMETRY-TAG', description: 'Omit the two external analytics script tags, as on the reference server. No visual nodes removed.' },
  { id: 'T-TELEMETRY-PRELOAD', description: 'Omit the external Cloudflare analytics script preload; no visual effect.' },
  { id: 'T-NOINDEX', description: 'Add robots noindex for the nonofficial reproduction; no visual effect.' },
  { id: 'T-OFFLINE', description: 'Prepend a nonvisual adapter for recorded same-origin APIs and analytics stubs. No visual rules or interface handlers are changed.' },
  { id: 'T-TTS-URL', description: 'At runtime, return absolute same-origin MP3 URLs in captured TTS metadata. Source audio URL normalizer accepts HTTP URLs, not root-relative paths (0wl4_aw_qjkxf.js). UI and audio files remain original.' },
];
function localize(text) {
  for (const [host, prefix] of prefixes) text = text.replaceAll('https://' + host, prefix);
  return text;
}
const assets = [];
const apiMap = Object.fromEntries(manifest.filter(a => new URL(a.url).pathname.startsWith('/backend/'))
  .map(a => [new URL(a.url).pathname, '/_openai/api/' + a.sha256 + '.json']));
const adapter = (await fs.readFile('rebuilds/openai-exact/offline-adapter.js', 'utf8'))
  .replace('__OPENAI_API_MAP__', JSON.stringify(apiMap));
await fs.mkdir('public/_openai', { recursive: true });
await fs.writeFile('public/_openai/offline-adapter.js', adapter);
await fs.writeFile('public/_openai/noop.js', '/* Analytics disabled in the nonofficial reproduction. */\n');
await fs.writeFile('public/_openai/noop.json', '{"success":true}\n');
const cloudflareScript = 'public' + prefixes.get('static.cloudflareinsights.com') + '/beacon.min.js';
await fs.mkdir(path.dirname(cloudflareScript), { recursive: true });
await fs.writeFile(cloudflareScript, '/* Analytics disabled in the nonofficial reproduction. */\n');
const usedPaths = new Map();
for (const asset of manifest) {
  const url = new URL(asset.url);
  const original = await fs.readFile(path.join(root, 'mirror', asset.file));
  if (sha(original) !== asset.sha256) throw new Error('Immutable source hash mismatch: ' + asset.url);
  if (asset.url === pageURL) {
    let html = localize(original.toString('utf8'));
    html = html.replace(/<script\b[^>]*src="[^"]*(?:cloudflareinsights|speed-insights)[^"]*"[^>]*>[\s\S]*?<\/script>/g, '');
    html = html.replace(/<link\b[^>]*href="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*>/g, '');
    html = html.replace(/<meta name="robots" content="index, follow"\s*\/?\s*>/g, '');
    html = html.replace('<head>', '<head><meta name="robots" content="noindex, nofollow"><script src="/_openai/offline-adapter.js"></script>');
    await fs.mkdir('rebuilds/openai-exact/port', { recursive: true });
    await fs.writeFile('rebuilds/openai-exact/port/document.html', html);
    assets.push({ url: asset.url, originalSha256: asset.sha256, file: 'rebuilds/openai-exact/port/document.html', sha256: sha(html), mime: asset.mime });
    continue;
  }
  let pathname = (prefixes.get(url.hostname) || '') + url.pathname;
  if (url.pathname.startsWith('/backend/')) {
    pathname = '/_openai/api/' + asset.sha256 + '.json';
  }
  if (asset.mime === 'text/x-component') {
    pathname = '/_openai/rsc/' + asset.sha256 + '.txt';
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const destination = path.resolve('public', '.' + pathname);
  if (!destination.startsWith(path.resolve('public') + path.sep)) throw new Error('Asset escapes public: ' + pathname);
  if (usedPaths.has(destination) && usedPaths.get(destination) !== asset.sha256) throw new Error('Query collision: ' + asset.url);
  usedPaths.set(destination, asset.sha256);
  const bytes = /html|css|javascript|json|component/.test(asset.mime) ? Buffer.from(localize(original.toString('utf8'))) : original;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes);
  assets.push({ url: asset.url, originalSha256: asset.sha256, file: path.relative(process.cwd(), destination).replaceAll('\\', '/'), sha256: sha(bytes), mime: asset.mime, ...(asset.method ? { method: asset.method } : {}) });
}
const supportFiles = await Promise.all([
  'public/_openai/offline-adapter.js', 'public/_openai/noop.js', 'public/_openai/noop.json', cloudflareScript,
].map(async file => ({ file, sha256: sha(await fs.readFile(file)) })));
await fs.writeFile('rebuilds/openai-exact/port/manifest.json', JSON.stringify({ source: pageURL, transformations, assets, supportFiles }, null, 2) + '\n');
console.log(`Imported ${assets.length} source responses; the original mirror was not modified.`);
