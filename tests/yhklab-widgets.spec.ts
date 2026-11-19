import {test,expect} from '@playwright/test';
const route='/notes/reading-a-graph/';
for(const width of [390,1440]){
  test(`Markdown uses native article widgets at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(route);
    const reject=page.getByRole('button',{name:'拒绝非必要',exact:true});
    await reject.waitFor({state:'visible',timeout:2200}).catch(()=>{});
    if(await reject.isVisible())await reject.click();
    const article=page.locator('#article-body'),chart=article.locator('[id^="lab-chart-"]');
    await chart.scrollIntoViewIfNeeded();
    for(const [stage,value] of [['采集',12],['整理',9],['复核',6]]){
      await expect(chart.locator(`svg path[aria-label*="${stage}"][aria-label$=": ${value}"]`)).toBeVisible();
    }
    await expect(article.locator('meter, table:visible')).toHaveCount(0);
    const tabs=article.getByRole('tablist');
    await tabs.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
    for(const [label,copy] of [['方法','固定同一组十二条笔记'],['边界','便利样本'],['问题','观察对象']]){
      const tab=tabs.getByRole('tab',{name:label,exact:true});await tab.click();
      await expect(tab).toHaveAttribute('aria-selected','true');
      await expect(article.getByRole('tabpanel')).toContainText(copy);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}
test('source values remain readable without JavaScript',async({browser,baseURL})=>{
  const ctx=await browser.newContext({javaScriptEnabled:false,baseURL});
  try{const page=await ctx.newPage();await page.goto(route);
    await expect(page.getByRole('tab', {name:'问题'})).toHaveAttribute('aria-selected','true');
    await expect(page.getByRole('tabpanel')).toContainText('观察对象');
    const table=page.getByRole('table',{name:'记录通过数（条）'});await expect(table.getByRole('row')).toHaveCount(4);
    await expect(table.getByRole('row').last()).toHaveText('复核6');
  }finally{await ctx.close();}
});

test('source tabs preserve keyboard, URL, and panel switching behavior', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const script = page.waitForResponse(r => r.url().endsWith('/yhklab/article-tabs.js') && r.ok());
  await page.addInitScript(() => {
    const { animate } = Element.prototype;
    const calls: { frames: unknown; options: unknown }[] = [];
    Object.assign(window, { yhkTabAnimations: calls });
    Element.prototype.animate = function (frames, options) {
      if (this.matches('[aria-busy].relative.min-w-0')) calls.push({ frames, options });
      return animate.call(this, frames, options);
    };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${route}?source=tabs#ignored`);
  await script;
  const reject = page.getByRole('button', { name: '拒绝非必要', exact: true });
  await reject.waitFor({ state: 'visible', timeout: 2200 }).catch(() => {});
  if (await reject.isVisible()) await reject.click();
  const chart = page.locator('[id^="lab-chart-"]');
  await chart.scrollIntoViewIfNeeded();
  await expect(chart.locator('svg path[aria-label]').first()).toBeVisible();
  const tabs = page.getByRole('tablist', { name: '标签' });
  const panel = page.getByRole('tabpanel');
  const first = tabs.getByRole('tab', { name: '问题', exact: true });
  const middle = tabs.getByRole('tab', { name: '方法', exact: true });
  const last = tabs.getByRole('tab', { name: '边界', exact: true });
  await first.click();
  await expect(page).toHaveURL(/\?source=tabs$/);
  for (const [key, selected] of [['ArrowLeft', last], ['Home', first], ['ArrowRight', middle], ['End', last]] as const) {
    await page.keyboard.press(key);
    await expect(selected).toBeFocused();
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(panel).toHaveAttribute('id', (await selected.getAttribute('aria-controls'))!);
    await expect(panel.locator('xpath=../..')).toHaveAttribute('aria-busy', 'false');
  }
  const animations = await page.evaluate(() => (window as unknown as { yhkTabAnimations: unknown[] }).yhkTabAnimations);
  expect(animations).not.toHaveLength(0);
  expect(animations.every(a => a && typeof a === 'object' && 'options' in a && JSON.stringify(a.options) === JSON.stringify({ duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' }))).toBe(true);
  expect(errors).toEqual([]);
});
