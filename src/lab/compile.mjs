import {pdfAttributes,pdfWidget} from './pdf.mjs';
import {embedAttributes,embedWidget} from './embed.mjs';
import {videoAttributes,videoWidget} from './video.mjs';
import {testimonialAttributes,lowerTestimonial,finishTestimonials} from './testimonials.mjs';
import {renderFence,renderDisclosure,renderChecklist} from './prose-widgets.mjs';
import { unified } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import math from 'remark-math';
import directives from 'remark-directive';
import toHast from 'remark-rehype';
import katex from 'rehype-katex';
import stringify from 'rehype-stringify';
import { parse as yaml } from 'yaml';
import Slugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import { z } from 'zod';

const metaSchema = z.strictObject({
  title: z.string().trim().min(1), layout: z.enum(['article','product']).default('article'),
  description: z.string().default(''), date: z.iso.date().optional(), author: z.string().default('YhkLab'),
  topic: z.enum(['研究','产品','数学','计算机科学','网络','人工智能','生活']).default('研究'),
  mock: z.boolean().default(false), draft: z.boolean().default(false),
});
const markdown = unified().use(parse).use(gfm).use(math).use(directives);
const html = unified().use(toHast).use(katex,{trust:false,throwOnError:true}).use(stringify);
const attrs = {tabs:[],tab:[],quote:['by'],details:[],video:videoAttributes,pdf:pdfAttributes,embed:embedAttributes,chart:['unit'],component:['use'],inventory:[],...testimonialAttributes};
const element=(tag,props={},children=[])=>({type:'paragraph',data:{hName:tag,hProperties:props},children});
const text=value=>({type:'text',value});
const serializer=unified().use(stringify);

/** No eval, imports, JSX or raw HTML. Lower the allowlisted author's AST to semantic HTML. */
export function compileLab(source,file='<input>') {
  source=source.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const header=/^---\n([\s\S]*?)\n---(?:\n|$)/.exec(source);
  if (!header) throw Error(`${file}:1: expected YAML frontmatter`);
  let meta;
  try {meta=metaSchema.parse(yaml(header[1],{maxAliasCount:20}));} catch(e){throw Error(`${file}:1: ${e.message}`);}
  const tree=markdown.parse('\n'.repeat(header[0].split('\n').length-1)+source.slice(header[0].length));
  const widgets=[], headings=[], demos=[], slugger=new Slugger(); let serial=0;
  const fail=(n,msg)=>{throw Error(`${file}:${n.position?.start.line||1}:${n.position?.start.column||1}: ${msg}`);};
  function url(n,value,asset=false){
    if(typeof value!=='string'||!value||/[\s\\\u0000-\u001f]/.test(value)||value.startsWith('//')||(asset?!/^\/(?!\/)/.test(value):/^[a-z][\w+.-]*:/i.test(value)&&!/^https?:\/\//i.test(value)))fail(n,'invalid '+(asset?'local media path':'link')+': '+value);return value;
  }
  function lower(n,parent){
    if(n.type==='html') fail(n,'raw HTML is not supported; use Markdown or a registered directive');
    if(n.type==='image'||n.type==='link'||n.type==='definition')url(n,n.url,n.type==='image');
    if(n.type==='heading'){
      if(n.depth===1)fail(n,'use title in frontmatter for the page heading');
      const title=toString(n),id='sec-'+slugger.slug(title||'section');n.data={hProperties:{id}};
      if(parent?.type==='root'&&n.depth<=(meta.layout==='article'?5:3)){
        headings.push({id,text:title,headlineTag:'h'+n.depth});
        if(meta.layout==='article'&&n.depth>2)n.data.hProperties.className=['scroll-mt-[calc(var(--page-top-space,var(--header-h))+var(--toc-button-h)+var(--anchor-scroll-clearance))]'];
      }
    }
    if(!n.type.endsWith('Directive')){if(n.children)n.children=n.children.map(c=>lower(c,n));return n;}
    const name=n.name,a=n.attributes||{};
    if(!Object.hasOwn(attrs,name))fail(n,'unknown directive '+name);
    for(const key of Object.keys(a))if(!attrs[name].includes(key))fail(n,`unknown ${name} attribute ${key}`);
    const leaf=['video','pdf','embed','component','inventory'].includes(name);
    if(n.type!==(leaf?'leafDirective':'containerDirective'))fail(n,`expected ${leaf?'::':':::'}${name}`);
    const labelNode=n.children.find(c=>c.data?.directiveLabel);const label=leaf?toString(n):labelNode?toString(labelNode):'';
    const kids=n.children.filter(c=>c!==labelNode);
    if(Object.hasOwn(testimonialAttributes,name))return lowerTestimonial({
      name,label,children:kids,parent,attributes:a,node:n,mediaUrl:url,fail,lower,element,nextId:()=>`lab-testimonials-${++serial}`,
    });
    if(name==='component'||name==='inventory'){
      if(parent?.type!=='root'||meta.layout!=='product'||!meta.mock)fail(n,'component samples require a mock product and top-level placement');
      if(name==='component'&&!/^[a-z][a-z0-9-]*$/.test(a.use||''))fail(n,'expected use=component-id');
      const key=name==='inventory'?'inventory':a.use;if(demos.includes(key))fail(n,'duplicate sample '+key); demos.push(key);
      return element('div',{'data-lab-sample':key,'data-line':n.position.start.line});
    }
    if(name==='pdf'){
      const widget=pdfWidget(n,{id:`lab-pdf-${++serial}`,label,attributes:a,mediaUrl:url,fail});
      widgets.push(widget);
      return element('template',{'data-openai-component':widget.id});
    }
    if(name==='embed'){
      const widget=embedWidget(n,{id:`lab-embed-${++serial}`,label,attributes:a,mediaUrl:url,fail});
      widgets.push(widget);
      return element('template',{'data-openai-component':widget.id});
    }
    if(name==='video'){
      const widget=videoWidget(n,{id:`lab-video-${++serial}`,label,attributes:a,mediaUrl:url,fail});
      widgets.push(widget);
      return element('template',{'data-openai-component':widget.id});
    }
    if(name==='chart'){
      const t=kids[0];if(!label||kids.length!==1||t?.type!=='table'||t.children.length<2||t.children.some(r=>r.children.length!==2))fail(n,'chart needs a caption and one two-column Markdown table');
      const rows=t.children.slice(1).map(r=>r.children.map(c=>toString(c).trim()));
      if(rows.some(([k,v])=>!k||!v||!Number.isFinite(Number(v))||Number(v)<0))fail(n,'chart values must be finite non-negative numbers');
      const id='lab-chart-'+(++serial);
      widgets.push({type:'chart',id,label,unit:a.unit||'',columns:t.children[0].children.map(c=>toString(c)),rows});
      return element('template',{'data-openai-component':id});
    }
    if(name==='tabs'){
      if(!kids.length||kids.some(c=>c.type!=='containerDirective'||c.name!=='tab'))fail(n,'tabs must contain only labeled tab blocks');
      return element('lab-tabs',{id:'lab-tabs-'+(++serial)},kids.map(c=>lower(c,n)));
    }
    if(name==='tab'&&(parent?.name!=='tabs'||!label))fail(n,'tab needs a label and tabs parent');
    const body=kids.map(c=>lower(c,n));
    if(name==='details'){if(!label)fail(n,'details needs a summary');return element('details',{},[element('summary',{},[text(label)]),...body]);}
    if(name==='quote')return element('figure',{},[element('blockquote',{},body),...(a.by?[element('figcaption',{},[text('— '+a.by)])]:[])]);
    return element('section',{'aria-label':label},body);
  }
  const hast=html.runSync(lower(tree,null));
  // Resolve panels after Markdown links, footnotes and math have been rendered, not by reparsing strings.
  function finish(n){
    if(n.children)n.children=n.children.map(finish);
    if(n.tagName==='pre')return renderFence(n);
    if(n.tagName==='details')return renderDisclosure(n);
    if(n.tagName==='ul')return renderChecklist(n);
    if(n.tagName==='lab-testimonials'){
      const widget=finishTestimonials(n,root=>serializer.stringify(root));
      widgets.push(widget);
      return {type:'element',tagName:'template',properties:{'data-openai-component':widget.id},children:[]};
    }
    if(n.tagName!=='lab-tabs')return n;
    const id=n.properties.id;
    widgets.push({type:'tabs',id,items:n.children.filter(c=>c.tagName==='section').map((panel,i)=>({
      id:`${id}-p${i}`, label:panel.properties['aria-label'],
      html:serializer.stringify({type:'root',children:panel.children}),
    }))});
    return {type:'element',tagName:'template',properties:{'data-openai-component':id},children:[]};
  }
  finish(hast);
  const blocks=hast.children.filter(n=>n.type!=='text'||n.value.trim()).map(n=>({tag:n.tagName||'',props:n.properties||{},html:serializer.stringify({type:'root',children:[n]})}));
  return {meta,headings,blocks,widgets};
}
