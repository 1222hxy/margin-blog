import {test, expect} from '@playwright/test';
const white='/zh-Hans-CN/index/grid-protectors-program/';
const sections=['研究','产品','数学','计算机科学','网络','人工智能','生活'];
async function geometry(page:import('@playwright/test').Page){
 return page.locator('header').evaluate(header=>['[data-testid=header-row]','[data-testid=header-brand-wordmark]','nav li','nav li span.px-4','button[aria-label="打开搜索"]'].map((sel,i)=>{const el=header.querySelector(sel)!;const b=el.getBoundingClientRect(),s=getComputedStyle(el);return [i===4?null:b.x,b.y,b.width,b.height,s.fontSize,s.fontWeight,s.paddingInline,s.gap]}));
}
for(const [route,original] of [['/notes/reading-a-graph/',white],['/products/folio/','/themes/openai/astra-sol/']]){
 test(`native navigation geometry and controls · ${route}`,async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto(original);await page.evaluate(()=>document.fonts.ready);const baseline=await geometry(page);
  await page.goto(route);await page.evaluate(()=>document.fonts.ready);const header=page.locator('header');
  await expect(header.locator('nav[aria-label="主导航"] ul > li')).toHaveText(sections);
  await expect(header.locator('[data-testid="header-brand-wordmark"]')).toHaveText('YhkLab');
  await expect(header.getByText('登录',{exact:true})).toHaveCount(0);await expect(header.getByText(/试用 ChatGPT/)).toHaveCount(0);
  expect(await geometry(page)).toEqual(baseline);await expect(header.getByRole('link',{name:'YhkLab 首页'})).toHaveAttribute('href','/');
  const reject=page.getByRole('button',{name:'拒绝非必要',exact:true});await reject.waitFor({state:'visible',timeout:2500}).catch(()=>{});if(await reject.isVisible())await reject.click();
  const dialog=page.locator('[role=dialog][aria-label=搜索]');
  await expect(async()=>{if(!await dialog.isVisible())await header.getByRole('button',{name:'打开搜索',exact:true}).first().click();await expect(dialog).toBeVisible({timeout:1200});}).toPass({timeout:7000});await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await header.getByRole('button',{name:'打开移动端导航菜单'}).click();
  const drawer=header.locator('#header-mobile-drawer-panel');await expect(drawer).toHaveAttribute('aria-hidden','false');
  await drawer.getByRole('button',{name:'数学',exact:true}).click();await expect(drawer.getByRole('link',{name:'数学',exact:true})).toHaveAttribute('href','/topics/math/');
 });
}
