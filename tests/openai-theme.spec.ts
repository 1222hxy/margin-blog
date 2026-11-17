import { test, expect } from '@playwright/test';

test('another article hydrates without restoring reference content and uses native tabs', async ({ page }) => {
  const errors: string[] = [], failures: string[] = [], external: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failures.push(r.status() + ' ' + new URL(r.url()).pathname); });
  page.on('request', r => { if (new URL(r.url()).origin !== 'http://127.0.0.1:4321') external.push(new URL(r.url()).origin); });
  await page.goto('/themes/openai/example/');
  await expect(page.locator('h1')).toHaveText('同一套主题，另一篇文章');
  await expect(page.getByRole('tab', { name: '结构', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: '内容', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('修改文章数据即可替换标题');
  await page.getByRole('tab', { name: '验证', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('不会放宽像素对拍');
  await expect(page.getByTestId('author-list')).toContainText('页间');
  await expect(page.locator('[data-read-aloud-ui]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '继续阅读', exact: true })).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText('同一套主题，另一篇文章');
  expect(errors).toEqual([]); expect(failures).toEqual([]); expect(external).toEqual([]);
});

test('theme content is server rendered and mobile contents follow new headings', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:4321/themes/openai/example/');
  await expect(staticPage.locator('h1')).toHaveText('同一套主题，另一篇文章');
  await expect(staticPage.getByRole('tabpanel')).toContainText('页面由独立的导航');
  await expect(staticPage.getByTestId('author-list')).toContainText('页间');
  await context.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/themes/openai/example/');
  const reject = page.getByRole('button', { name: '拒绝非必要', exact: true });
  if (await reject.isVisible()) await reject.click();
  // Native tabs deliberately hide the sticky TOC when their collision target
  // crosses the header. Test it in the following prose section instead.
  await page.locator('#quote').scrollIntoViewIfNeeded();
  const menu = page.locator('nav[aria-label="目录"]').filter({ has: page.getByRole('button', { name: '关闭目录', exact: true }) });
  // The source observer enables the sticky menu after scrolling into prose.
  await expect(menu).not.toHaveAttribute('inert');
  await menu.getByRole('button', { expanded: false }).first().click();
  await expect(menu.locator('button[aria-expanded="true"]')).toHaveCount(1);
  await menu.getByRole('link', { name: '原版引语组件', exact: true }).click();
  // Source scroll handler prevents the browser's default hash navigation.
  await expect(menu.locator('button[aria-expanded="false"]')).toHaveCount(1);
  await expect.poll(() => page.locator('#quote').evaluate(n => Math.abs(n.getBoundingClientRect().top))).toBeLessThan(170);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
