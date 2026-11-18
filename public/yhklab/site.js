// Enhancements only: Markdown, links, all tab panels and chart data have static HTML.
(() => {
  const all = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  function switchTo(root,index,focus=false){
    const tabs=all(':scope > nav > [data-pick]',root),panels=all(':scope > [data-panel]',root);
    if(!tabs[index])return;
    root.firstElementChild.setAttribute('role','tablist');
    tabs.forEach((tab,i)=>{const picked=i===index,p=panels[i];tab.setAttribute('role','tab');tab.id=p.id+'-tab';tab.setAttribute('aria-controls',p.id);tab.setAttribute('aria-selected',String(picked));tab.tabIndex=picked?0:-1;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',tab.id);p.hidden=!picked;});
    if(focus)tabs[index].focus();
  }
  const setup=()=>all('[data-switch]').forEach(root=>{if(!root.querySelector(':scope > nav[role=tablist]'))switchTo(root,0);});setup();window.addEventListener('load',setup);
  const toc=all('nav[aria-label="目录"]'), mobile=toc.find(n=>n.querySelector('button')),button=mobile?.querySelector('button'),list=mobile?.querySelector('[aria-hidden]');
  const expandToc=(open)=>{if(!list)return;button.setAttribute('aria-expanded',String(open));list.setAttribute('aria-hidden',String(!open));list.inert=!open;list.style.visibility=open?'visible':'';list.style.gridTemplateRows=open?'1fr':'';};
  if(toc.length){
    const entries=all('#article-body [id]').filter(el=>toc.some(nav=>all('a',nav).some(a=>a.hash==='#'+el.id||decodeURIComponent(a.hash)==='#'+el.id)));
    function scroll(){const visible=document.getElementById('article-body').getBoundingClientRect().top<120;for(const nav of toc){nav.inert=!visible;nav.setAttribute('aria-hidden',String(!visible));nav.style.opacity=visible?'1':'';nav.style.pointerEvents=visible?'auto':'';}const active=entries.filter(n=>n.getBoundingClientRect().top<180).at(-1)||entries[0];if(active){for(const nav of toc)for(const a of all('a',nav)){const on=decodeURIComponent(a.hash)==='#'+active.id;a.setAttribute('aria-current',String(on));if(on&&button)button.querySelector('span').textContent=a.textContent;}}}
    scroll();expandToc(false);window.addEventListener('scroll',scroll,{passive:true});
  }
  document.addEventListener('click',async e=>{const target=e.target.closest('a,button');if(!target)return;
    if(mobile?.contains(target))expandToc(target===button&&button.getAttribute('aria-expanded')!=='true');
    const root=target.closest('[data-switch]');if(root){const tabs=all(':scope > nav > [data-pick]',root);let i=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');if(target.hasAttribute('data-pick')){e.preventDefault();switchTo(root,Number(target.dataset.pick));}if(target.hasAttribute('data-step'))switchTo(root,(i+Number(target.dataset.step)+tabs.length)%tabs.length);}
    if(target.closest('[data-yhk-share]')){let notice=target.parentElement.querySelector('output');if(!notice){notice=document.createElement('output');notice.setAttribute('aria-live','polite');target.after(notice);}try{await navigator.clipboard.writeText(location.href);notice.textContent='已复制链接';}catch{notice.textContent=location.href;}}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(button?.getAttribute('aria-expanded')==='true'){expandToc(false);button.focus();}}const t=e.target.closest('[role=tab]');if(!t)return;const root=t.closest('[data-switch]'),n=all(':scope > nav > [data-pick]',root).length,i=Number(t.dataset.pick);const dest={Home:0,End:n-1,ArrowRight:(i+1)%n,ArrowLeft:(i+n-1)%n}[e.key];if(dest!==undefined){e.preventDefault();switchTo(root,dest,true);}});
  document.addEventListener('input',e=>{if(e.target.matches('[data-nodes]')){const p=e.target.closest('label').parentElement,v=Number(e.target.value);p.querySelector('output').textContent=v+' 个节点';all('circle',p).forEach((c,i)=>c.setAttribute('opacity',i<v?'1':'0.15'));}if(e.target.matches('[data-site-search]')){let count=0;for(const item of all('[data-result]')){item.parentElement.hidden=!item.textContent.toLowerCase().includes(e.target.value.trim().toLowerCase());if(!item.parentElement.hidden)count++;}document.querySelector('[data-result-count]').textContent=` ${count} 条结果`;}});
})();
