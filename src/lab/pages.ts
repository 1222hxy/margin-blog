import {nativeWidgets} from './widgets';
import {compileLab} from './compile.mjs';
import {proseHTML,section} from '../themes/yhklab/blocks';
import {componentIndex,productSample,inventory} from '../themes/yhklab/product';
import type {NativeComponent,ArticleHeading} from '../themes/openai/types';
import type {LaunchComponentId} from '../themes/openai/astra-sol/catalog';
const files=import.meta.glob<string>('../../content/lab/*.lab.md',{eager:true,query:'?raw',import:'default'});
export const pages=Object.entries(files).map(([file,source])=>{
  const slug=file.split('/').pop()!.replace(/\.lab\.md$/,'');
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error(`${file}: invalid filename slug`);
  const {meta,headings,blocks,widgets}=compileLab(source,file);
  const path=`/${meta.layout==='product'?'products':'notes'}/${slug}/`;
  const components:Record<string,NativeComponent>=nativeWidgets(widgets);
  const sampleIds=blocks.map(b=>b.props['data-lab-sample']).filter(Boolean);
  const html=blocks.map(b=>{
    const key=b.props['data-lab-sample'];
    if(key==='inventory')return componentIndex(sampleIds);
    if(key){if(key==='astra-sol-hero'||!inventory.includes(key as LaunchComponentId))throw Error(`${file}:${b.props['data-line']}: unknown body component ${key}`);
      const sample=productSample(key as LaunchComponentId);Object.assign(components,sample.components);return sample.html;}
    const h=headings.find(h=>h.id===b.props.id);
    if(h&&b.tag==='h2')return section(h.id,h.text);
    return b.props['data-openai-component']?b.html:proseHTML(b.html);
  }).join('');
  return {entry:{...meta,date:meta.date||'',path},sections:headings as ArticleHeading[],html,components};
}).filter(p=>!p.entry.draft);
