import {parseFragment, serialize} from 'parse5';
import footerSource from '../openai/blueprint/SiteFooter.html?raw';
import {brand,groups} from './config';
import {escapeHtml as esc} from '../openai/lib/html';
const attr=(n:any,k:string)=>n?.attrs?.find((x:any)=>x.name===k)?.value;
function content(n:any,s:string){n.childNodes=parseFragment(s).childNodes;for(const c of n.childNodes)c.parentNode=n;}
const cls=(n:any)=>attr(n,'class')||'';
const kids=(n:any)=>n.childNodes.filter((x:any)=>x.tagName);
const link=(label:string,url:string,c:string)=>`<a class="${esc(c)}" href="${esc(url)}">${esc(label)}</a>`;
export function footer(){const doc=parseFragment(footerSource);const f=kids(doc)[0], [top,bottom]=kids(f);const row=kids(top)[0],col=kids(row)[0],group=kids(col)[0],[title,list]=kids(group),li=kids(list)[0],a=kids(li)[0];
 content(row,groups.map(([name,items])=>`<div class="${esc(cls(col))}"><div class="${esc(cls(group))}"><span class="${esc(cls(title))}" role="heading" aria-level="2">${name}</span><ul class="${esc(cls(list))}" role="list">${items.map(([label,url])=>`<li role="listitem">${link(label,url,cls(a))}</li>`).join('')}</ul></div></div>`).join(''));
 const [social,credit,locale]=kids(bottom);content(social,link('订阅 RSS','/rss.xml',cls(a)));content(credit,`<span class="text-nav-header">${brand} © 2026</span>`);content(locale,'<span class="text-nav-header">简体中文</span>');return serialize(doc);
}
