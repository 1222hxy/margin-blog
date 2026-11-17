// Independent browser gate: original HAR responses at their original origin
// versus the built blog. Does not import the document/asset importer.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = 'reference-input/openai-grid';
const manifest = JSON.parse(await fs.readFile(sourceRoot + '/manifest.json', 'utf8'));
const har = JSON.parse(await fs.readFile(process.env.OPENAI_REFERENCE_HAR || sourceRoot + '/replay.har.json', 'utf8'));
const out = process.env.OPENAI_COMPARE_OUT || 'docs/compare/openai-exact';
await fs.mkdir(out, { recursive: true });
const originPath = '/zh-Hans-CN/index/grid-protectors-program/';
const localOrigin = process.env.OPENAI_COMPARE_URL || 'http://127.0.0.1:4321';
const rounds = Number(process.env.OPENAI_COMPARE_ROUNDS || 4);
const browser = await chromium.launch();
const report = { localOrigin, rounds, dpr: 1, cases: [], missingReference: [] };
const exact = new Map(manifest.map(a => [a.url, a]));
const byPath = new Map();
for (const a of manifest) {
  const u = new URL(a.url), key = u.origin + u.pathname;
  if (!byPath.has(key)) byPath.set(key, []);
  byPath.get(key).push(a);
}
async function replay(route) {
  const u = new URL(route.request().url());
  let asset = exact.get(u.href);
  if (!asset) {
    const candidates = byPath.get(u.origin + u.pathname) || [];
    if (new Set(candidates.map(a => a.file)).size === 1) asset = candidates[0];
  }
  if (asset) return route.fulfill({ status: 200, contentType: asset.mime,
    body: await fs.readFile(sourceRoot + '/mirror/' + asset.file) });
  const captured = har.log.entries.find(e => {
    const v = new URL(e.request.url);
    return v.origin + v.pathname === u.origin + u.pathname && e.response.content.text;
  });
  if (captured) {
    const c = captured.response.content;
    return route.fulfill({ status: captured.response.status, contentType: c.mimeType,
      body: c.encoding === 'base64' ? Buffer.from(c.text, 'base64') : c.text });
  }
  report.missingReference.push(u.origin + u.pathname);
  // No outgoing network: missing source resources stay explicitly recorded.
  return route.abort();
}
try {
  for (let round = 0; round < rounds; round++) for (const width of [1440, 390]) for (const side of ['reference', 'blog']) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, deviceScaleFactor: 1,
      permissions: ['clipboard-read', 'clipboard-write'] });
    if (side === 'reference') await context.route('**/*', replay);
    const page = await context.newPage();
    const errors = [], failures = [], external = new Set(), navigations = [];
    page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations.push(frame.url()); });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') failures.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) failures.push(r.status() + ' ' + new URL(r.url()).pathname); });
    page.on('request', r => {
      if (side === 'blog' && new URL(r.url()).origin !== localOrigin) external.add(new URL(r.url()).origin);
    });
    await page.goto(side === 'reference' ? 'https://openai.com' + originPath : localOrigin + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    const reject = page.getByRole('button', { name: '拒绝非必要', exact: true });
    if (await reject.isVisible()) await reject.click();
    // Consent may trigger a native reload. Wait for its original UI to settle
    // before attaching the test-only caret rule; never suppress page errors.
    await page.waitForTimeout(1200);
    await page.waitForFunction(() => document.querySelector('[data-read-aloud-ui]')?.textContent?.includes('6:53'));
    await page.addStyleTag({ content: '* { caret-color: transparent !important; }' });
    // Walk the complete document so both sides resolve the same lazy images.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 650) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(60); }
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await page.waitForTimeout(700);
    const states = [];
    async function shot(state, fullPage = false) {
      const file = `${side}-${width}-${state}-${round}.png`;
      await page.screenshot({ path: path.join(out, file), fullPage, caret: 'hide' });
      states.push({ state, file, scrollY: await page.evaluate(() => scrollY) });
    }
    await shot('footer');
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(700);
    await shot('full', true);
    await page.getByRole('button', { name: '分享', exact: true }).click(); await page.waitForTimeout(700); await shot('share');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '打开搜索', exact: true }).first().click(); await page.waitForTimeout(900); await shot('search');
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
    if (width === 1440) {
      await page.locator('[data-analytics="header-nav-research-3-0-new-ia"]').hover(); await page.waitForTimeout(700); await shot('navigation');
    } else {
      await page.getByRole('button', { name: '打开移动端导航菜单', exact: true }).click(); await page.waitForTimeout(700); await shot('navigation');
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo(0, 1300)); await page.waitForTimeout(700);
      await shot('toc-pinned');
      await page.getByRole('button', { name: '佐治亚州的示范实践', exact: true }).click(); await page.waitForTimeout(700); await shot('toc-open');
    }
    report.cases.push({ round, width, side, states, errors, failures, external: [...external], navigations });
    await context.close();
    console.log(`Captured round ${round + 1}/${rounds}, ${width}px, ${side}, ${states.length} states.`);
    await fs.writeFile(path.join(out, 'capture.json'), JSON.stringify(report, null, 2));
  }
} finally { await browser.close(); }
report.missingReference = [...new Set(report.missingReference)];
await fs.writeFile(path.join(out, 'capture.json'), JSON.stringify(report, null, 2) + '\n');
