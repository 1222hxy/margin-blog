// The presentation comes from the archived theme, not a new Markdown stylesheet:
// CodeBlock (605052, 13ls6dyrhybvd.js) and the native details disclosure (06-o_i_d9z9dc.js).
import hljs from 'highlight.js';
import {parseFragment} from 'parse5';

const tag=(tagName,properties={},children=[])=>({type:'element',tagName,properties,children});
const text=value=>({type:'text',value});
const classes=s=>({className:s.split(' ')});

// Keep only text and syntax spans from the highlighter; never treat authored code as HTML.
function tokens(node){
  if(node.nodeName==='#text')return text(node.value);
  return tag('span',classes(node.attrs?.find(a=>a.name==='class')?.value||''),(node.childNodes||[]).map(tokens));
}
export function renderFence(pre){
  const code=pre.children[0];
  if(code?.tagName!=='code'||code.children.some(n=>n.type!=='text'))return pre;
  const value=code.children.map(n=>n.value).join('');
  const language=code.properties?.className?.find(s=>s.startsWith('language-'))?.slice(9);
  const spans=language&&hljs.getLanguage(language)
    ?parseFragment(hljs.highlight(value,{language,ignoreIllegals:true}).value).childNodes.map(tokens)
    :[text(value)];
  return tag('div',{...classes('relative flex items-stretch gap-4 overflow-auto py-5 bg-tertiary-100 style-scrollbars max-h-125 @md:max-h-151'),dir:'ltr','data-lab-code':''},[
    tag('pre',classes('flex-1 px-5 font-mono text-code-snippet text-primary-100 omZ69a_syntaxHighlight'),[tag('code',code.properties,spans)]),
  ]);
}

export function renderDisclosure(n){
  const [summary,...body]=n.children.filter(c=>c.type!=='text'||c.value.trim());
  if(summary?.tagName!=='summary')return n;
  // Keep the HTML disclosure: Enter/Space, focus and no-JS reading are native.
  const chevron=tag('svg',{xmlns:'http://www.w3.org/2000/svg',width:10,height:16,viewBox:'2.219 -0.578 11.563 18.5',fill:'none','aria-hidden':'true','data-lab-chevron':''},[
    tag('path',{fill:'currentColor',d:'M12.47 5.72a.75.75 0 1 1 1.06 1.06l-4.764 4.765a1.083 1.083 0 0 1-1.532 0L2.47 6.78a.75.75 0 0 1 1.06-1.06L8 10.19z'}),
  ]);
  return tag('details',{...classes('transition duration-200 ease-curve-a'),'data-lab-disclosure':''},[
    tag('summary',classes('flex cursor-pointer list-none items-center gap-2 text-primary-60 transition-colors hover:text-primary-100 focus-visible:border-primary-60 [&::-webkit-details-marker]:hidden text-p1'),[...summary.children,chevron]),
    tag('div',classes('border-s-primary-12 mt-[15px] border-s-2 ps-1 md:ps-5'),body),
  ]);
}
export function renderChecklist(n){
  if(n.tagName!=='ul'||!n.properties.className?.includes('contains-task-list'))return n;
  n.properties.className.push('flex','flex-col','gap-2');
  for(const li of n.children){
    if(li.tagName!=='li'||!li.properties.className?.includes('task-list-item'))continue;
    // Keep loose lists, nested lists, links and GFM's read-only state intact.
    const line=li.children.find(c=>c.tagName==='p')||li;
    const box=line.children.findIndex(c=>c.tagName==='input'&&c.properties.type==='checkbox');
    if(box<0)continue;
    let end=box+1;while(end<line.children.length&&!['ul','ol','p','div','blockquote','pre'].includes(line.children[end].tagName))end++;
    const [input,...label]=line.children.splice(box,end-box);
    input.properties.className=['size-4','shrink-0'];
    line.children.splice(box,0,tag('label',classes('inline-flex items-baseline gap-3 text-p2 text-primary-100'),[input,tag('span',{},label)]));
  }
  return n;
}
