import {nativePdf,type PdfItem} from '../themes/yhklab/components/NativePdf';
import {nativeEmbed,type EmbedItem} from '../themes/yhklab/components/NativeEmbed';
import {nativeVideo,type VideoItem} from '../themes/yhklab/components/NativeVideo';
import {testimonialComponent,type TestimonialItem} from '../themes/yhklab/components/TestimonialCarousel';
import {MarkdownTabs, type TabItem} from '../themes/yhklab/components/MarkdownTabs';
import {MarkdownChart} from '../themes/yhklab/components/MarkdownChart';
import {proseHTML} from '../themes/yhklab/blocks';
import {escapeHtml as esc} from '../themes/openai/lib/html';
import type {NativeComponent} from '../themes/openai/types';

type Widget = ({type:'pdf'} & PdfItem) | ({type:'embed'} & EmbedItem) | ({type:'video'} & VideoItem) | {type:'testimonials';id:string;eyebrow?:string;items:TestimonialItem[]} | {type:'tabs';id:string;items:TabItem[]} | {type:'chart';id:string;label:string;unit:string;columns:string[];rows:string[][]};
export function nativeWidgets(widgets:Widget[]){
  const result:Record<string,NativeComponent>={};
  for(const w of widgets){
    if(w.type==='pdf'){const {type,...item}=w;result[item.id]=nativePdf(item);continue;}
    if(w.type==='embed'){const {type,...item}=w;result[item.id]=nativeEmbed(item);continue;}
    if(w.type==='video'){const {type,...item}=w;result[item.id]=nativeVideo(item);continue;}
    if(w.type==='testimonials'){
      result[w.id]=testimonialComponent(w.id,w.items,w.eyebrow);
      continue;
    }
    if(w.type==='tabs'){
      result[w.id]=MarkdownTabs({id:w.id,components:result,items:w.items.map(t=>({...t,html:proseHTML(t.html)}))});
      continue;
    }
    const caption=w.label+(w.unit?`（${w.unit}）`:''),[category,value]=w.columns;
    // The JS renderer owns the visible graph. Still publish the source data without JS.
    const fallback=`<noscript>${proseHTML(`<table><caption>${esc(caption)}</caption><thead><tr>${w.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${w.rows.map(([s,v])=>`<tr><th scope="row">${esc(s)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`)}</noscript>`;
    result[w.id]=MarkdownChart({id:w.id,caption,fallback,
      categoryTitle:category,valueTitle:w.unit?`${value}（${w.unit}）`:value,
      rows:w.rows.map(([stage,amount])=>[stage,Number(amount)]),
    });
  }
  return result;
}
