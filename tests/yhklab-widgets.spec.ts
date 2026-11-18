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
    const table=page.getByRole('table',{name:'记录通过数（条）'});await expect(table.getByRole('row')).toHaveCount(4);
    await expect(table.getByRole('row').last()).toHaveText('复核6');
  }finally{await ctx.close();}
});
