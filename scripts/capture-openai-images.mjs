// Import public response bodies only. Never copy request headers or cookies.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const harPath = process.argv[2];
if (!harPath) throw new Error('Pass the HAR path explicitly.');
const har = JSON.parse(await fs.readFile(harPath, 'utf8'));
const root = 'reference-input/openai-images';
await fs.mkdir(root + '/mirror', { recursive: true });
const skip = /(?:statsig|chatgpt\.com|cloudflareinsights|arclight\.vimeo)/;
const assets = [];
for (const entry of har.log.entries) {
  const { response, request } = entry;
  if (response.status !== 200 || !response.content.text || skip.test(new URL(request.url).hostname)) continue;
  const body = response.content.encoding === 'base64' ? Buffer.from(response.content.text, 'base64') : Buffer.from(response.content.text);
  const sha256 = crypto.createHash('sha256').update(body).digest('hex');
  const file = sha256 + '.bin';
  try { await fs.writeFile(root + '/mirror/' + file, body, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assets.push({ url: request.url, mime: response.content.mimeType, file, sha256, size: body.length });
}
await fs.writeFile(root + '/manifest.json', JSON.stringify(assets, null, 2) + '\n');
console.log(`Saved ${assets.length} public response records; no headers/cookies imported.`);
