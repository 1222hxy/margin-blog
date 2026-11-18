import {test,expect} from '@playwright/test';
for (const width of [390,1440]) test(`article code and checklist at ${width}px`,async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width,height:900},javaScriptEnabled:width!==390});
  try{
    const page=await context.newPage();await page.goto('/notes/reading-a-graph/');
    const code=page.locator('[data-lab-code]');await expect(code.locator('.hljs-keyword').first()).toHaveText('const');
    await expect(code.locator('code')).toHaveText('const passRate = (verified, total) => total ? verified / total : null;');
    const details=page.locator('[data-lab-disclosure]'),summary=details.locator('summary');
    if(width!==390){const reject=page.getByRole('button',{name:'拒绝非必要',exact:true});await reject.waitFor({state:'visible',timeout:2000}).catch(()=>{});if(await reject.isVisible())await reject.click();}
    await summary.focus();await summary.press('Enter');await expect(details).toHaveJSProperty('open',true);
    const items=details.getByRole('checkbox');await expect(items).toHaveCount(3);await expect(items.nth(0)).toBeChecked();await expect(items.nth(1)).toBeChecked();await expect(items.nth(2)).not.toBeChecked();
    await expect(items.nth(2)).toHaveAccessibleName('换一组数据重新验证');await expect(items.nth(2)).toBeDisabled();
    await expect(details.locator('svg')).toHaveCSS('transform','matrix(-1, 0, 0, -1, 0, 0)');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await summary.press('Space');await expect(details).toHaveJSProperty('open',false);
  }finally{await context.close();}
});
