import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const out='rebuilds/openai-exact/components';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4324/');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1800);
const fragments=await page.evaluate(()=>{
 const article=document.querySelector('main article'); const blocks=[...article.children];
 return {
  'SiteHeader':document.querySelector('header').outerHTML,
  'ArticleHero':blocks[0].children[0].outerHTML,
  'ReadingControls':blocks[0].children[2].outerHTML,
  'MobileContents':blocks[1].children[0].outerHTML,
  'DesktopContents':blocks[1].children[1].outerHTML,
  'ArticleProse':blocks[1].children[2].outerHTML,
  'AuthorBlock':blocks[2].outerHTML,
  'RelatedArticles':blocks[3].outerHTML,
  'SiteFooter':document.querySelector('footer').outerHTML
 };
});
for(const [name,html] of Object.entries(fragments))await fs.writeFile(out+'/'+name+'.html',html);
const deps=await page.evaluate(()=>({styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.getAttribute('href')),scripts:[...document.scripts].map(e=>e.getAttribute('src')).filter(Boolean),htmlAttributes:[...document.documentElement.attributes].map(a=>[a.name,a.value]),bodyAttributes:[...document.body.attributes].map(a=>[a.name,a.value])}));
await fs.writeFile(out+'/dependencies.json',JSON.stringify(deps,null,2));await browser.close();console.log('Saved 9 original fragments and dependency map.');
