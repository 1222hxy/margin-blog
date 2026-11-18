import {blueprint} from '../openai/blueprint';
import {referenceArticle} from '../openai/reference';
import {proseTemplates,paragraph,heading} from '../openai/components/RichText';
import {ArticleHero} from '../openai/components/ArticleHero';
import {Contents} from '../openai/components/Contents';
import {AuthorBlock} from '../openai/components/AuthorBlock';
import {attr,escapeHtml as e,nodes,inner,replaceInner} from '../openai/lib/html';
import type {ArticleHeading} from '../openai/types';
import {articlePath,brand,nav} from './config';
export const part=(name:string)=>blueprint.find(p=>p.name===name)!.html;
const tmpl=proseTemplates(referenceArticle.bodyHtml);
export const para=(s:string)=>paragraph(s,tmpl);
export const section=(id:string,title:string)=>heading(title,id,tmpl);
export const bodyGrid=attr(nodes(part('ArticleProse')).find(n=>attr(n,'data-toc-content')!==undefined),'class')!;
export function proseHTML(html:string){return para('YHK_SLOT').replace(/<p\b[^>]*><span>YHK_SLOT<\/span><\/p>/,()=>html);}
export const localLink=(s:string,url:string)=>`<a class="underline" href="${e(url)}">${e(s)}</a>`;
export interface Entry {title:string;description:string;date:string;author?:string;topic?:string;path:string}
export function entryHeader(entry:Entry){const data={...referenceArticle,...entry,categories:[{name:entry.topic||'研究',slug:'yhklab'}]};return ArticleHero(part('ArticleHero'),data,referenceArticle);}
export const toc=(which:string,sections:ArticleHeading[])=>Contents(part(which),sections,referenceArticle.headings);
export function author(entry:Entry){const t=entry.topic||'研究';return AuthorBlock(part('AuthorBlock'),{...referenceArticle,author:entry.author||brand,tags:[{name:t,slug:'topic'}]},referenceArticle).replace('/news/?tags=topic',nav.find(([n])=>n===t)?.[1]||'/');}
// Keep the original three-card grid, typography, image wrappers and link hit areas.
export function related(entries:readonly {title:string;url:string;category:string;date:string;image:string}[]){let s=part('RelatedArticles').replace('href="/news/"','href="/"');const ns=nodes(s);const grid=ns.find(n=>attr(n,'class')?.includes('grid-cols-3'));const card=grid.childNodes.find((n:any)=>n.tagName==='div');const sample=s.slice(card.sourceCodeLocation.startOffset,card.sourceCodeLocation.endOffset);return replaceInner(s,grid,entries.map(x=>{let c=sample.replace(/<picture\b[\s\S]*?<\/picture>/g,`<img src="${e(x.image)}" alt="" loading="lazy" class="size-full object-cover">`).replace(/<img\b[^>]*>/g,`<img src="${e(x.image)}" alt="" loading="lazy" class="size-full object-cover">`).replace(/href="[^"]*"/g,`href="${e(x.url)}"`).replace(/aria-label="[^"]*"/g,`aria-label="${e(x.title)}"`);let ts=nodes(c).filter(n=>n.nodeName==='#text'&&n.value.trim());for(const n of ts.reverse()){const l=n.sourceCodeLocation; if(!l)continue;const val=n.value.trim();c=c.slice(0,l.startOffset)+e(/\d{4}|年|月/.test(val)?x.date:val.length>6?x.title:x.category)+c.slice(l.endOffset);}return c;}).join(''));}
export const recommendations=[{title:'从一张图开始，记录一次研究',url:articlePath,category:'研究 · Mock',date:'2026年11月18日',image:'/yhklab/graph.svg'},{title:'Folio · 研究笔记台',url:'/products/folio/',category:'产品 · Mock',date:'2026年11月18日',image:'/yhklab/notes.svg'},{title:'数学笔记',url:'/topics/math/',category:'数学',date:'专题',image:'/yhklab/matrix.svg'}];
