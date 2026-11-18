// Export the derived theme and its verified public dependency closure.
// No HAR, captured request metadata, or personal blog content is exported.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const destination = path.resolve('artifacts/openai-theme');
if (!destination.startsWith(path.resolve('artifacts') + path.sep)) throw new Error('Unsafe export target.');
try {
  const existing = JSON.parse(await fs.readFile(path.join(destination, 'package.json'), 'utf8'));
  if (existing.name !== 'margin-openai-theme-starter') throw new Error('Export target belongs to another project.');
} catch (e) { if (e.code !== 'ENOENT') throw e; }
await fs.mkdir(destination, { recursive: true });
const write = async (file, content) => {
  const target = path.join(destination, file);
  await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, content);
};
await fs.cp('src/themes/openai', path.join(destination, 'src/themes/openai'), { recursive: true });
const baseline = JSON.parse(await fs.readFile('rebuilds/openai-exact/port/manifest.json', 'utf8'));
const native = JSON.parse(await fs.readFile('src/themes/openai/native/assets.json', 'utf8'));
const launch = JSON.parse(await fs.readFile('src/themes/openai/astra-sol/manifest.json', 'utf8'));
const records = new Map();
for (const record of [...baseline.assets, ...baseline.supportFiles, ...native, ...launch.assets]) {
  if (!record.file.startsWith('public/')) continue;
  if (records.has(record.file) && records.get(record.file).sha256 !== record.sha256) throw new Error('Dependency collision: ' + record.file);
  records.set(record.file, { file: record.file, sha256: record.sha256 });
}
for (const record of records.values()) {
  const bytes = await fs.readFile(record.file);
  if (hash(bytes) !== record.sha256) throw new Error('Changed dependency: ' + record.file);
  await write(record.file, bytes);
}
for (const file of ['public/_openai/NOTICE.txt', 'public/_headers']) await write(file, await fs.readFile(file));
await write('package.json', JSON.stringify({
  name: 'margin-openai-theme-starter', version: '1.0.0', private: true, type: 'module',
  scripts: { dev: 'astro dev --host 127.0.0.1', build: 'astro build', preview: 'astro preview --host 127.0.0.1' },
  dependencies: { astro: '7.4.2', parse5: '7.3.0' },
}, null, 2) + '\n');
await write('astro.config.mjs', "import { defineConfig } from 'astro/config';\nexport default defineConfig({ site: 'https://margin-blog.yhl-3ca.workers.dev', trailingSlash: 'always' });\n");
await write('tsconfig.json', JSON.stringify({ extends: 'astro/tsconfigs/strict', exclude: ['dist', 'public', 'node_modules'] }, null, 2));
await write('src/pages/index.astro', "---\nimport ArticlePage from '../themes/openai/ArticlePage.astro';\n---\n<ArticlePage />\n");
await write('src/pages/zh-Hans-CN/index/grid-protectors-program/index.astro', "---\nimport ArticlePage from '../../../../themes/openai/ArticlePage.astro';\n---\n<ArticlePage />\n");
await write('src/pages/themes/openai/example.astro', await fs.readFile('src/pages/themes/openai/example.astro'));
await fs.cp('src/pages/themes/openai/astra-sol', path.join(destination, 'src/pages/themes/openai/astra-sol'), { recursive: true });
await write('README.md', await fs.readFile('src/themes/openai/README.md'));
await write('asset-manifest.json', JSON.stringify({ source: baseline.source, baselineDocumentSha256: hash(await fs.readFile('rebuilds/openai-exact/port/document.html')), assets: [...records.values()] }, null, 2) + '\n');
await write('.gitignore', 'node_modules/\ndist/\n.astro/\n');
console.log(`Exported ${destination}: theme, two article routes, example, ${records.size} unique verified public files.`);
