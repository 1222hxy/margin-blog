// Nonvisual adapter. Original interface code is unchanged. Recorded API
// responses are served from this project; external analytics are suppressed.
(() => {
  const apis = __OPENAI_API_MAP__;
  const analytics = new Set([
    'ab.chatgpt.com', 'statsigapi.net', 'browser-intake-datadoghq.com',
    'static.cloudflareinsights.com', 'cloudflareinsights.com', 'vitals.vercel-insights.com', 'api.segment.io',
  ]);
  const parse = value => new URL(typeof value === 'string' ? value : value instanceof URL ? value.href : value.url, location.href);
  const isAnalytics = url => analytics.has(url.hostname) ||
    (url.hostname === 'chatgpt.com' && url.pathname.startsWith('/ces/'));
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = parse(input);
    if (isAnalytics(url)) {
      const data = url.pathname.endsWith('/initialize')
        ? { has_updates: false, feature_gates: {}, dynamic_configs: {}, layer_configs: {}, sdkParams: {}, time: 0 }
        : url.pathname.endsWith('/settings') ? { integrations: { 'Segment.io': { apiHost: 'chatgpt.com/ces/v1', apiKey: 'oai' } } } : { success: true };
      return Promise.resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
    }
    if (url.origin === location.origin && apis[url.pathname]) {
      return nativeFetch(apis[url.pathname], { method: 'GET', signal: init?.signal }).then(async response => {
        if (!url.pathname.startsWith('/backend/tts/')) return response;
        // Source 0wl4_aw_qjkxf.js normalizes non-HTTP audio URLs by adding
        // protocol + '//'. Give it absolute local URLs, as the source API does.
        const data = await response.json();
        for (const file of data.files || []) {
          if (file.url.startsWith('/__')) file.url = location.origin + file.url;
        }
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
      });
    }
    // There is one captured page. An HTML response tells the original Next
    // prefetcher to fall back to document navigation for uncaptured routes.
    if (url.origin === location.origin && url.searchParams.has('_rsc')) {
      return Promise.resolve(new Response('', { headers: { 'Content-Type': 'text/html' } }));
    }
    return nativeFetch(input, init);
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    return nativeOpen.call(this, isAnalytics(parse(url)) ? 'GET' : method,
      isAnalytics(parse(url)) ? '/_openai/noop.json' : url, ...rest);
  };
  const beacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => isAnalytics(parse(url)) || beacon(url, data);
  const src = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    ...src,
    set(value) { src.set.call(this, isAnalytics(parse(value)) ? '/_openai/noop.js' : value); },
  });
  const attribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    return attribute.call(this, name, this.tagName === 'SCRIPT' && name === 'src' && isAnalytics(parse(value))
      ? '/_openai/noop.js' : value);
  };
  // Links to other OpenAI pages leave this single-page archive. This preserves
  // the original destination instead of pretending those pages were rebuilt.
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname.startsWith('/zh-Hans-CN/') &&
        url.pathname !== '/zh-Hans-CN/index/grid-protectors-program/' && !link.download) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign('https://openai.com' + url.pathname + url.search + url.hash);
    }
  }, true);
})();
