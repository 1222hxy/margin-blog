import {parse} from 'parse5';
import blackSource from '../openai/astra-sol/document.html?raw';
import {rewriteFlight} from '../openai/lib/flight';
import {htmlModel,expandComponents} from '../openai/lib/native';
import {escapeHtml as e} from '../openai/lib/html';
import {footer} from './chrome';
import {headerMarkup,headerProps} from './header';
import {blueprint} from '../openai/blueprint';
import {bodyGrid,type Entry} from './blocks';
import type {NativeComponent} from '../openai/types';

// The hero remains the captured SSR subtree AND its original native client module.
// All editorial content outside it belongs to the Markdown document.
export function productDocument(entry:Entry,body:string,components:Record<string,NativeComponent>,canonical:string,mock:boolean,mathStyles:string, white=false){
 const source=white?blueprint.map(p=>p.html).join(''):blackSource;
 const root=parse(source,{sourceCodeLocationInfo:true}); const all:any[]=[];
 function visit(n:any){if(n.tagName)all.push(n);n.childNodes?.forEach(visit);}visit(root);
 const node=(tag:string)=>all.find(n=>n.tagName===tag);
 const article=node('article'),hero=article.childNodes.find((n:any)=>n.tagName),loc=hero.sourceCodeLocation;
 const hiddenTitle='推出 GPT-6.2 Astra 和 Sol',oldTitle=source.match(/<title>(.*?)<\/title>/)![1],title=entry.title+' | YhkLab';
 const intro=mock?'产品介绍占位 · Mock':entry.title;
 const newHeader=headerMarkup(source.slice(node('header').sourceCodeLocation.startOffset,node('header').sourceCodeLocation.endOffset)),newFooter=footer(), footerModel=htmlModel(newFooter)[0];
 const cta='https://chatgpt.com/?surface=work';
 const heroSSR=source.slice(loc.startOffset,loc.endOffset).replace('introducing-gpt-62-astra-and-sol','product-hero').replace(hiddenTitle,()=>e(entry.title)).replace('A new standard for professional work',()=>e(intro)).replace(cta,'#product-content').replace('在 ChatGPT 工作中试用','查看产品介绍').replace(' target="_blank"','').replace('<span class="sr-only">（在新窗口中打开）</span>','');
 const wrap=(inside:string)=>`<div id="product-content" class="${bodyGrid}">${inside}</div>`;
 const patches:[number,number,string][]=[];
 const outer=(n:any,value:string)=>{const l=n.sourceCodeLocation;patches.push([l.startOffset,l.endOffset,value]);};
 outer(node('header'),newHeader);outer(node('footer'),'');patches.push([node('main').sourceCodeLocation.endTag.startOffset,node('main').sourceCodeLocation.endTag.startOffset,newFooter]);
 if(white)outer(article,expandComponents(body,components));else patches.push([loc.startOffset,article.sourceCodeLocation.endTag.startOffset,heroSSR+wrap(expandComponents(body,components))]);
 const modules=new Map<string,string>();for(const c of Object.values(components))for(const m of c.modules)modules.set(m.id,`${m.id}:I${JSON.stringify(m.value)}\n`);
 const walk=(v:any):any=>{
  if(v===oldTitle)return title;
  if(Array.isArray(v)&&v[0]==='$'){
   const tag=v[1],p=v[3];
   if(p?.nav?.items&&p.nav.cta)return [...v.slice(0,3),headerProps(p)];
   if(p?.footerNav&&p.header)return [v[0],tag,v[2],{...p,footerNav:null,children:[p.children,footerModel]}];
   if(tag==='article'){
    if(white)return htmlModel(body,components)[0];
    const h=structuredClone(p.children[0]);h[3].id='product-hero';const parts=h[3].children[3].children;parts[0][3].children=entry.title;
    const sub=parts[2][3].children[3].children;sub[0][3].children=intro;sub[1]=htmlModel(heroSSR.match(/<a\b[^>]*href="#product-content"[\s\S]*?<\/a>/)![0])[0];
    return [v[0],tag,v[2],{...p,children:[h,['$','div',null,{id:'product-content',className:bodyGrid,children:htmlModel(body,components)}]]}];
   }
   if(tag==='meta'&&p){const k=p.name||p.property;if(k==='robots')return [...v.slice(0,3),{...p,content:mock?'noindex, follow':'index, follow'}];if(k==='description'||k?.endsWith(':description'))return [...v.slice(0,3),{...p,content:entry.description}];if(k?.endsWith(':title'))return [...v.slice(0,3),{...p,content:title}];if(k==='og:url')return [...v.slice(0,3),{...p,content:canonical}];}
   if(tag==='link'&&p?.rel==='canonical')return [...v.slice(0,3),{...p,href:canonical}];
  }
  if(Array.isArray(v))return v.map(walk);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)]));return v;
 };
 let document=source;for(const [a,b,r] of patches.sort((x,y)=>y[0]-x[0]))document=document.slice(0,a)+r+document.slice(b);
 document=document.replace('<title>'+oldTitle+'</title>',()=>'<title>'+e(title)+'</title>').replace(/<meta\b[^>]*(?:name="description"|property="og:(?:title|description|url)"|name="twitter:(?:title|description)")[^>]*>/g,t=>t.replace(/content="[^"]*"/,()=>'content="'+e(t.includes('description')?entry.description:t.includes('og:url')?canonical:title)+'"')).replace(/<link rel="canonical"[^>]*>/,()=>`<link rel="canonical" href="${e(canonical)}">`).replace(/<link rel="alternate"[^>]*hreflang[^>]*>/gi,'');
 return rewriteFlight(document,walk,[...modules.values()].join('')).replaceAll(white?'3y4dob1qjeu6f':'2_x75e9q09ucm',white?'yhkdob1qjeu6f':'yhk75e9q09ucm').replace('</head>',()=>`${mock?'<meta name="robots" content="noindex, follow">':''}${mathStyles?`<link rel="stylesheet" href="${e(mathStyles)}">`:''}<link rel="stylesheet" href="/yhklab/disclosure.css"><script defer src="/yhklab/site.js"></script></head>`);
}
