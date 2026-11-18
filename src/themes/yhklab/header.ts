import { attr, nodes, inner, escapeHtml } from '../openai/lib/html';
import { nav, brand } from './config';

// Only fill slots in captured <li>s. Never recreate the row, typography,
// dropdown triggers, search button, mobile frames or their CSS.
export function headerMarkup(source:string){
 const all=nodes(source), edits:[number,number,string][]=[];
 const outer=(n:any)=>source.slice(n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset);
 const replace=(n:any,html:string)=>edits.push([n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset,html]);
 const logo=all.find(n=>attr(n,'aria-label')==='OpenAI 主页');
 replace(logo,outer(logo).replace('OpenAI 主页',brand+' 首页').replace(/(<svg\b[^>]*>)[\s\S]*?(<\/svg>)/,(_,a,b)=>a+wordmark+b));
 for(const list of all.filter(n=>n.tagName==='ul')){
  const items=list.childNodes.filter((n:any)=>n.tagName==='li');if(items.length!==6)continue;
  const native=['研究','产品','企业','开发人员','公司'];
  const updated=nav.map(([label,url],i)=>{const j=i<5?i:0;return outer(items[j]).replaceAll(native[j],label).replace(/href="[^"]*"/g,'href="'+escapeHtml(url)+'"')}).join('');
  replace(list,outer(list).replace(inner(source,list),()=>updated));
 }
 for(const n of all){const c=attr(n,'class')||'';if(c==='hidden items-center gap-2 md:flex')replace(n,'');if(c.includes('mt-12 flex flex-col items-start'))replace(n,'');}
 let out=source;for(const [a,b,v] of edits.sort((x,y)=>y[0]-x[0]))out=out.slice(0,a)+v+out.slice(b);return out;
}
export const wordmark='<text x="0" y="63" fill="currentColor" font-size="74" font-weight="600">YhkLab</text>';
export function headerProps(p:any){return {...p,nav:{...p.nav,socialLinks:[],items:nav.map(([label,url],i)=>{
 const sample=p.nav.items[i<5?i:0],leaf=sample.items[0];
 return {...leaf,id:'yhklab-'+i,label,url:i===1?'$undefined':url,external:false,items:[{...leaf,id:'yhklab-'+i+'-index',label,url,external:false,items:[]}]};
})}};}
