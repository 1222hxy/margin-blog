import {Tabs, type TabItem} from '../themes/openai/components/Tabs';
import {benchmarkChart} from '../themes/openai/astra-sol/catalog';
import {proseHTML} from '../themes/yhklab/blocks';
import {htmlModel} from '../themes/openai/lib/native';
import {escapeHtml as esc} from '../themes/openai/lib/html';
import type {NativeComponent} from '../themes/openai/types';

type Widget = {type:'tabs';id:string;items:TabItem[]} | {type:'chart';id:string;label:string;unit:string;columns:string[];rows:string[][]};
export function nativeWidgets(widgets:Widget[]){
  const result:Record<string,NativeComponent>={};
  for(const w of widgets){
    if(w.type==='tabs'){
      result[w.id]=Tabs({id:w.id,components:result,items:w.items.map(t=>({...t,html:proseHTML(t.html)}))});
      continue;
    }
    const caption=w.label+(w.unit?`（${w.unit}）`:''),[category,value]=w.columns;
    const chart=benchmarkChart({id:w.id,caption,spec:{
      description:caption,mark:{type:'bar',tooltip:true},width:'container',height:230,
      data:{values:w.rows.map(([stage,n])=>({stage,value:Number(n)}))},
      encoding:{x:{field:'stage',type:'ordinal',sort:null,title:category},y:{field:'value',type:'quantitative',title:w.unit?`${value}（${w.unit}）`:value}},
    }});
    // The JS renderer owns the visible graph. Still publish the source data without JS.
    const fallback=`<noscript>${proseHTML(`<table><caption>${esc(caption)}</caption><thead><tr>${w.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${w.rows.map(([s,v])=>`<tr><th scope="row">${esc(s)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`)}</noscript>`;
    chart.html+=fallback;
    chart.model=['$','$Sreact.fragment',null,{children:[chart.model,...htmlModel(fallback)]}];
    result[w.id]=chart;
  }
  return result;
}
