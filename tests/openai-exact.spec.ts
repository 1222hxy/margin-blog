import { test, expect } from '@playwright/test';

test('original controls play local audio and close search', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== 'http://127.0.0.1:4321') external.push(url.origin);
  });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const reject = page.getByRole('button', { name: '拒绝非必要', exact: true });
  if (await reject.isVisible()) await reject.click();
  await expect(page.locator('[data-read-aloud-ui]')).toContainText('6:53');
  await page.getByRole('button', { name: '播放页面文本音频', exact: true }).click();
  await expect.poll(() => page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(0.2);
  expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => ({ paused: audio.paused, error: audio.error?.message })))
    .toEqual({ paused: false, error: undefined });
  await page.getByRole('button', { name: '暂停音频', exact: true }).click();
  await expect.poll(() => page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  await page.getByRole('button', { name: '打开搜索', exact: true }).first().click();
  const search = page.getByRole('dialog', { name: '搜索', exact: true });
  await expect(search).toBeVisible();
  await search.locator('textarea').fill('OpenAI');
  await expect(search.getByRole('button', { name: '搜索', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(search).not.toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('original mobile menu and pinned contents open and close', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/zh-Hans-CN/index/grid-protectors-program/');
  const reject = page.getByRole('button', { name: '拒绝非必要', exact: true });
  if (await reject.isVisible()) await reject.click();
  await page.getByRole('button', { name: '打开移动端导航菜单', exact: true }).click();
  await expect(page.getByRole('button', { name: '关闭移动导航', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭移动导航', exact: true }).click();
  await page.evaluate(() => scrollTo(0, 1300));
  await page.getByRole('button', { name: '佐治亚州的示范实践', exact: true }).click();
  const close = page.getByRole('button', { name: '关闭目录', exact: true });
  await expect(close).toBeVisible();
  await close.click();
  // The source keeps its collapsed close button mounted and marks it inert.
  await expect(close).toHaveAttribute('inert', '');
});
