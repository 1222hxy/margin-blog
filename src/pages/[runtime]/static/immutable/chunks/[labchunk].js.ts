// Build private, same-length aliases; archived runtime chunks remain byte-identical.
import {readFileSync} from 'node:fs';
import {wordmark} from '../../../../../themes/yhklab/header';
const originals=['2_x75e9q09ucm','3y4dob1qjeu6f'];
export function getStaticPaths(){return originals.map(original=>({params:{runtime:'_next',labchunk:'yhk'+original.slice(3)},props:{original}}));}
export function GET({props}:{props:{original:string}}){
 let code=readFileSync(`public/_next/static/immutable/chunks/${props.original}.js`,'utf8');
 function edit(before:string,after:string){if(code.split(before).length!==2)throw Error('Native header source changed: '+before);code=code.replace(before,()=>after);}
 const link=props.original.startsWith('2_')?'T':'I';
 // Same native anchor and class list. The archive link helper would rewrite / to /zh-Hans-CN/.
 edit(`(0,t.jsx)(${link}.default,{href:"/",ariaLabel:p.formatMessage(er),className:"group/header-brand`, '(0,t.jsx)("a",{href:"/","aria-label":"YhkLab 首页",className:"transition ease-curve-a duration-250 group/header-brand');
 const mark=`<svg xmlns="http://www.w3.org/2000/svg" width="90" fill="none" viewBox="0 0 292 78" class="h-[17px] w-auto">${wordmark}</svg>`;
 edit('(0,t.jsx)(o.f,{variant:y?"logo":"openai","data-testid":y?"header-brand-logo":"header-brand-wordmark"})',`(0,t.jsx)("span",{"aria-hidden":true,className:"inline-flex items-center","data-testid":"header-brand-wordmark",dangerouslySetInnerHTML:{__html:${JSON.stringify(mark)}}})`);
 edit('(ej||eA||eN||eC)&&(0,t.jsxs)', 'false&&(ej||eA||eN||eC)&&(0,t.jsxs)');
 // Do not delete either CTA renderer. Disable its data for this view.
 edit('"hidden items-center gap-2 md:flex",children:eO.map','"hidden items-center gap-2 md:flex",children:eO.slice(0,0).map');
 const items=props.original.startsWith('2_')?'f':'m';edit(`l&&${items}.length>0&&(0,t.jsx)("div",{className:"mt-12`, `l&&false&&${items}.length>0&&(0,t.jsx)("div",{className:"mt-12`);
 return new Response(code,{headers:{'content-type':'text/javascript; charset=utf-8'}});
}

