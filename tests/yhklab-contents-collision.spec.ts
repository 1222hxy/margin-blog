import { expect, test, type Locator } from '@playwright/test';

const desktopSelector = 'nav[aria-label="目录"]:not([data-show-toc])';
const pages = [
  ['archived', '/zh-Hans-CN/index/grid-protectors-program/'],
  ['YhkLab', '/notes/reading-a-graph/'],
] as const;

async function mountCollisionTarget(rail: Locator) {
  await rail.evaluate(nav => {
    const bounds = nav.getBoundingClientRect();
    const body = nav.parentElement!.querySelector('[data-toc-content]')!;
    const wrapper = document.createElement('div');
    wrapper.id = 'contents-collision-test';
    wrapper.style.cssText = `position:fixed;left:${bounds.right + 32}px;top:${bounds.top}px;width:32px;height:32px;overflow:hidden;pointer-events:none;`;
    const target = document.createElement('div');
    target.className = 'toc-collision-target';
    target.style.cssText = 'position:absolute;right:calc(100% + 4px);width:256px;height:32px;background:red;';
    wrapper.append(target);
    body.append(wrapper);
  });
}

for (const [name, path] of pages) {
  test(`${name} keeps the contents unless a rendered block crosses the rail`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const cookie = page.getByRole('button', { name: '拒绝非必要', exact: true });
    if (await cookie.isVisible()) await cookie.click();
    const rail = page.locator(desktopSelector);
    await rail.locator('a').first().evaluate(link => {
      document.getElementById(link.getAttribute('href')!.slice(1))!.scrollIntoView({ behavior: 'instant' });
    });
    await expect(rail).toHaveCSS('opacity', '1');
    await mountCollisionTarget(rail);
    const wrapper = page.locator('#contents-collision-test');
    const target = wrapper.locator('.toc-collision-target');
    // Wait until the new target has completed its first visibility observation.
    expect(await target.evaluate(element => new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        observer.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(entry.isIntersecting)));
      });
      observer.observe(element);
    }))).toBe(false);
    await expect(rail).toHaveAttribute('aria-hidden', 'false');
    await wrapper.evaluate(element => { element.style.overflow = 'visible'; });
    await expect(rail).toHaveAttribute('aria-hidden', 'true');
    await expect(rail).toHaveAttribute('inert', '');
    await target.evaluate(element => { element.style.visibility = 'hidden'; });
    await expect(rail).toHaveAttribute('aria-hidden', 'false');
    await expect(rail).not.toHaveAttribute('inert');
  });
}
