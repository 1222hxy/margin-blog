function headerHeight() {
  const style = getComputedStyle(document.documentElement);
  return parseFloat(style.getPropertyValue('--header-h')) * parseFloat(style.fontSize) || 0;
}

// Mirrors the source heading observer: a heading stays eligible until the next
// heading reaches the top 20% of the viewport, rather than a fixed pixel line.
function watchHeadings(body, headings, activate, signal) {
  let observers = new Map();
  function refresh() {
    const rects = headings.map(heading => heading.getBoundingClientRect());
    const next = new Map();
    headings.forEach((heading, i) => {
      const own = rects[i], following = rects[i + 1];
      const offset = following ? following.top - following.height - own.top - own.height - 0.2 * innerHeight : 0;
      const margin = `${Math.round(offset * 100) / 100}px 0px -80% 0px`;
      const existing = observers.get(heading);
      if (existing?.margin === margin) {
        next.set(heading, existing);
        return;
      }
      existing?.observer.disconnect();
      const observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) activate(heading.id);
      }, { rootMargin: margin });
      observer.observe(heading);
      next.set(heading, { margin, observer });
    });
    observers = next;
  }
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null;
  resize?.observe(body);
  signal.addEventListener('abort', () => {
    resize?.disconnect();
    for (const { observer } of observers.values()) observer.disconnect();
  }, { once: true });
  refresh();
  return refresh;
}

export function watchContents({ body, headings, activate, showMobile, signal }) {
  let height = headerHeight(), frame = 0;
  function update() {
    frame = 0;
    const rect = body.getBoundingClientRect();
    showMobile(rect.top <= height && rect.bottom > height);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  const refresh = watchHeadings(body, headings, activate, signal);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', () => {
    height = headerHeight();
    refresh();
    schedule();
  }, { signal });
  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  resize?.observe(body);
  signal.addEventListener('abort', () => {
    resize?.disconnect();
    cancelAnimationFrame(frame);
  }, { once: true });
  document.fonts?.ready.then(() => {
    if (signal.aborted) return;
    height = headerHeight(); refresh(); schedule();
  });
  update();
}

export function scrollToHeading(heading) {
  const margin = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
  window.scrollTo({ top: heading.getBoundingClientRect().top + window.scrollY - margin, behavior: 'smooth' });
}

export function revealCurrent(scroller) {
  if (scroller.offsetParent === null) return;
  const current = scroller.querySelector('a[aria-current="true"]');
  if (!current) return;
  const box = scroller.getBoundingClientRect(), row = current.getBoundingClientRect();
  if (row.top < box.top + 12) scroller.scrollTop -= box.top + 12 - row.top;
  else if (row.bottom > box.bottom - 12) scroller.scrollTop += row.bottom - (box.bottom - 12);
}
